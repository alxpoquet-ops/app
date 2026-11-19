<?php
/**
 * Les Minis Monstres Espace client : Stripe, sans SDK (API REST via wp_remote_request).
 *  - clés : constantes ALED08_STRIPE_SECRET / ALED08_STRIPE_WEBHOOK_SECRET (wp-config.php) ou options saisies dans les réglages
 *  - paiement d'une commande : Checkout Session en mode abonnement (forfait, options, lissage ou acompte)
 *  - webhook REST aled08/v1/stripe : signature vérifiée, événements dédoublonnés, journal des 50 derniers
 *  - portail client, paiement du solde, réconciliation quotidienne du lissage, test de connexion
 *  Aucune clé n'est jamais affichée ni écrite dans un journal.
 */
defined('ABSPATH') || exit;

define('ALED08E_STRIPE_API', '2026-10-28.endive');
define('ALED08E_STRIPE_FOOTER_DEFAUT', 'Les Minis Monstres, entreprise individuelle. TVA non applicable, art. 293 B du CGI.');

/* =========================================================================
 *  Réglages
 * ========================================================================= */
function aled08e_stripe_secret() {
    if (defined('ALED08_STRIPE_SECRET') && ALED08_STRIPE_SECRET) return (string) ALED08_STRIPE_SECRET;
    return (string) get_option('aled08_stripe_secret', '');
}
function aled08e_stripe_webhook_secret() {
    if (defined('ALED08_STRIPE_WEBHOOK_SECRET') && ALED08_STRIPE_WEBHOOK_SECRET) return (string) ALED08_STRIPE_WEBHOOK_SECRET;
    return (string) get_option('aled08_stripe_webhook_secret', '');
}
function aled08e_stripe_ready() { return aled08e_stripe_secret() !== ''; }
function aled08e_stripe_mode_test() { return strpos(aled08e_stripe_secret(), 'sk_test_') === 0 || strpos(aled08e_stripe_secret(), 'rk_test_') === 0; }
function aled08e_stripe_footer() {
    if (defined('ALED08_STRIPE_FOOTER') && ALED08_STRIPE_FOOTER) return (string) ALED08_STRIPE_FOOTER;
    $o = trim((string) get_option('aled08_stripe_footer', ''));
    return $o !== '' ? $o : ALED08E_STRIPE_FOOTER_DEFAUT;
}
/* « clé enregistrée, se termine par …xxxx » : on ne réaffiche jamais une clé */
function aled08e_stripe_masque($key) {
    $key = (string) $key;
    if ($key === '') return 'aucune clé enregistrée';
    return 'clé enregistrée, se termine par …' . substr($key, -4);
}
/* Retire toute clé qui traînerait dans un texte avant de le journaliser */
function aled08e_stripe_propre($txt) {
    return preg_replace('/\b(sk|rk|pk|whsec)_[A-Za-z0-9_]+/', '[clé masquée]', (string) $txt);
}
function aled08e_stripe_cents($euros) { return (int) round((float) $euros * 100); }

/* Journal : les 50 derniers événements (date, type, résultat) */
function aled08e_stripe_journal_add($type, $resultat) {
    $j = get_option('aled08_stripe_journal', []);
    $j = is_array($j) ? $j : [];
    $j[] = ['date' => current_time('mysql'), 'type' => mb_substr((string) $type, 0, 80), 'resultat' => mb_substr(aled08e_stripe_propre($resultat), 0, 300)];
    update_option('aled08_stripe_journal', array_slice($j, -50), false);
}
function aled08e_stripe_journal() {
    $j = get_option('aled08_stripe_journal', []);
    return is_array($j) ? array_reverse($j) : [];
}
function aled08e_stripe_mail_owner($sujet, $corps) {
    wp_mail(aled08e_to(), $sujet, $corps, aled08e_mail_headers());
}
/* Requêtes non signées (ou mal signées) sur le webhook : comptées dans une seule option, jamais dans le journal,
 * pour qu'un robot ne puisse pas effacer l'historique des vrais événements. Le tableau de bord affiche ce compteur. */
function aled08e_stripe_refus_noter() {
    $r = get_option('aled08_stripe_refus', []);
    $r = is_array($r) ? $r : [];
    $r['n'] = (int) ($r['n'] ?? 0) + 1;
    if (empty($r['premier'])) $r['premier'] = current_time('mysql');
    $r['dernier'] = current_time('mysql');
    update_option('aled08_stripe_refus', $r, false);
}
function aled08e_stripe_refus() {
    $r = get_option('aled08_stripe_refus', []);
    return is_array($r) && !empty($r['n']) ? $r : null;
}

/* =========================================================================
 *  Client REST
 *  aled08e_stripe_request('POST', '/v1/checkout/sessions', [...]) : tableau décodé ou WP_Error
 *  $quiet : ne pas journaliser une erreur attendue (ex. expirer une session déjà fermée)
 * ========================================================================= */
function aled08e_stripe_request($method, $path, $params = [], $idem = '', $quiet = false) {
    $key = aled08e_stripe_secret();
    if ($key === '') return new WP_Error('aled08_stripe', 'Stripe n’est pas configuré (aucune clé).');
    $method = strtoupper($method);
    $url = 'https://api.stripe.com' . $path;
    $headers = ['Authorization' => 'Bearer ' . $key, 'Stripe-Version' => ALED08E_STRIPE_API];
    $args = ['method' => $method, 'timeout' => 30, 'headers' => $headers];
    if ($method === 'POST') {
        $headers['Content-Type'] = 'application/x-www-form-urlencoded';
        $headers['Idempotency-Key'] = $idem ?: wp_generate_uuid4();
        $args['headers'] = $headers;
        $args['body'] = http_build_query($params, '', '&');
    } elseif ($params) {
        $url .= (strpos($url, '?') === false ? '?' : '&') . http_build_query($params, '', '&');
    }
    $r = wp_remote_request($url, $args);
    if (is_wp_error($r)) {
        if (!$quiet) aled08e_stripe_journal_add('erreur réseau ' . $method . ' ' . $path, $r->get_error_message());
        return new WP_Error('aled08_stripe', 'Stripe injoignable : ' . $r->get_error_message());
    }
    $code = (int) wp_remote_retrieve_response_code($r);
    $data = json_decode((string) wp_remote_retrieve_body($r), true);
    if ($code >= 400 || !is_array($data)) {
        $msg = is_array($data) && !empty($data['error']['message']) ? $data['error']['message'] : 'réponse ' . $code;
        $param = is_array($data) && !empty($data['error']['param']) ? $data['error']['param'] : '';
        if (!$quiet) aled08e_stripe_journal_add('erreur ' . $method . ' ' . $path, $msg . ($param ? ' [' . $param . ']' : ''));
        return new WP_Error('aled08_stripe', $msg, ['code' => $code, 'param' => $param]);
    }
    return $data;
}
/* Une page de paiement reste valable 24 h : avant d'en ouvrir une nouvelle pour la même commande, on ferme la précédente,
 * pour qu'un client ne puisse pas payer deux fois. Une session déjà payée ou expirée renvoie une erreur : ignorée. */
function aled08e_stripe_expirer_session($sid) {
    if (!$sid) return;
    aled08e_stripe_request('POST', '/v1/checkout/sessions/' . rawurlencode($sid) . '/expire', [], 'expire-' . $sid . '-' . wp_generate_password(8, false), true);
}
/* Le client Stripe d'un compte est noté une fois pour toutes : une deuxième commande réutilise le même client */
function aled08e_stripe_noter_customer($uid, $cus) {
    if ($uid && $cus && aled08e_meta($uid, 'stripe_customer') === '') update_user_meta($uid, 'aled08_stripe_customer', $cus);
}
/* Statut d'abonnement du compte : actif si au moins une de ses commandes a un abonnement actif, sinon en retard si l'une l'est,
 * sinon le dernier statut reçu. Le statut propre à chaque commande est gardé dans sa méta _aled08_abonnement. */
function aled08e_stripe_maj_abonnement($uid, $cid, $statut) {
    if ($cid) update_post_meta($cid, '_aled08_abonnement', $statut);
    if (!$uid) return $statut;
    $tous = [];
    foreach (aled08e_cmd_user_commandes($uid) as $k) {
        $a = (string) get_post_meta($k['id'], '_aled08_abonnement', true);
        if ($a !== '') $tous[] = $a;
    }
    $global = in_array('active', $tous, true) ? 'active' : (in_array('past_due', $tous, true) ? 'past_due' : $statut);
    update_user_meta($uid, 'aled08_abonnement', $global);
    return $global;
}
/* Test depuis les réglages : GET /v1/balance */
function aled08e_stripe_test() {
    $r = aled08e_stripe_request('GET', '/v1/balance');
    if (is_wp_error($r)) return $r;
    return !empty($r['livemode']) ? 'OK (mode réel)' : 'OK (mode test)';
}

/* =========================================================================
 *  Checkout d'une commande (mode abonnement)
 * ========================================================================= */
function aled08e_stripe_checkout($cid) {
    $c = aled08e_cmd_get($cid);
    if (!$c) return new WP_Error('aled08_stripe', 'Commande inconnue.');
    if ($c['statut'] !== 'attente_paiement') return new WP_Error('aled08_stripe', 'Cette commande n’attend plus de paiement.');
    $D = aled08e_data();
    $m = $c['montants'];
    $type = aled08e_type($c['type']);
    $once = function ($name, $euros, $tag) {
        return ['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => aled08e_stripe_cents($euros), 'product_data' => ['name' => $name, 'metadata' => ['aled08' => $tag]]]];
    };
    // À la commande : l'acompte et les options ponctuelles. Le forfait démarre à la réception du site.
    $items = [$once('Acompte de ' . (int) $D['acompte'] . ' % sur la création (' . ($type ? mb_strtolower($type['label'], 'UTF-8') : 'site') . ')', $m['acompte'], 'acompte')];
    foreach ($c['options'] as $oid) {
        $o = aled08e_option($oid);
        if ($o && $o['once'] > 0) $items[] = $once('Option : ' . $o['name'], $o['once'], 'option');
    }
    if (!empty($c['pages_plus'])) $items[] = $once('Option : ' . aled08e_cmd_pages_plus_txt($c['pages_plus']) . ' (' . (int) $c['pages_plus'] . ' × ' . aled08e_euro_txt(aled08e_cmd_page_prix()) . ')', $c['pages_plus'] * aled08e_cmd_page_prix(), 'option');
    $cfg = ['type' => $c['type'], 'forfait' => $c['forfait'], 'periode' => $c['periode'], 'lissage' => $c['lissage'], 'options' => $c['options'], 'pages_plus' => $c['pages_plus'] ?? 0, 'domaine' => $c['domaine'], 'domaine_mien' => $c['domaine_mien'], 'parrain' => $c['parrain']];
    $params = [
        'mode' => 'payment',
        'locale' => 'fr',
        'client_reference_id' => (string) $cid,
        'metadata' => ['commande' => (string) $cid, 'ref' => $c['ref'], 'user' => (string) $c['user']],
        'line_items' => $items,
        'invoice_creation' => ['enabled' => 'true', 'invoice_data' => ['footer' => aled08e_stripe_footer(), 'metadata' => ['commande' => (string) $cid]]],
        'success_url' => home_url('/commande-confirmee/?ref=' . rawurlencode($c['ref']) . '&session={CHECKOUT_SESSION_ID}'),
        'cancel_url' => aled08e_cmd_url_commander($cfg, ['annule' => '1']),
    ];
    // un client déjà connu de Stripe (autre commande) est réutilisé : un seul client Stripe par compte
    $cus = $c['stripe_customer'] ?: ($c['user'] ? aled08e_meta($c['user'], 'stripe_customer') : '');
    if ($cus) $params['customer'] = $cus;
    else { $params['customer_email'] = $c['email']; $params['customer_creation'] = 'always'; }
    aled08e_stripe_expirer_session($c['stripe_session']);
    $r = aled08e_stripe_request('POST', '/v1/checkout/sessions', $params, 'checkout-' . $cid . '-' . wp_generate_password(10, false));
    if (is_wp_error($r)) return $r;
    if (empty($r['url'])) return new WP_Error('aled08_stripe', 'Stripe n’a pas renvoyé d’adresse de paiement.');
    update_post_meta($cid, '_aled08_stripe_session', $r['id'] ?? '');
    aled08e_cmd_journal($cid, 'Page de paiement Stripe ouverte (acompte : ' . aled08e_euro_txt($m['total_jour']) . ').');
    return $r['url'];
}

/* À la réception du site : le reste de la création (en une fois, ou en $n fois sans frais) et le forfait avec ses options,
 * dans un seul abonnement Stripe. Créé au clic ; $expire : validité en secondes (24 h pour un lien copié depuis l'admin). */
function aled08e_stripe_reception_session($cid, $n = 0, $expire = 0) {
    $c = aled08e_cmd_get($cid);
    if (!$c) return new WP_Error('aled08_stripe', 'Commande inconnue.');
    if (!aled08e_cmd_reception_due($c)) return new WP_Error('aled08_stripe', 'Rien à régler pour cette commande.');
    $n = aled08e_cmd_lissage_n((string) $n);
    $seule = aled08e_est_seule($c['forfait']); // création seule : pas de formule (le reste en une fois, ou seulement les mensualités)
    $D = aled08e_data();
    $m = aled08e_cmd_montants_reception($c, $n);
    $type = aled08e_type($c['type']);
    $f = aled08e_forfait($c['forfait']);
    $annee = !$n && $c['periode'] === 'annee';
    $interval = $annee ? 'year' : 'month';
    $recurring = function ($name, $euros, $tag) use ($interval) {
        return ['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => aled08e_stripe_cents($euros), 'recurring' => ['interval' => $interval], 'product_data' => ['name' => $name, 'metadata' => ['aled08' => $tag]]]];
    };
    $once = function ($name, $euros, $tag) {
        return ['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => aled08e_stripe_cents($euros), 'product_data' => ['name' => $name, 'metadata' => ['aled08' => $tag]]]];
    };
    $items = [];
    $offert = $seule || ($c['user'] && aled08e_meta($c['user'], 'offert') === '1');
    if (!$offert) {
        $items[] = $recurring(aled08e_abo_nom($f) . (!empty($m['domaine_mensuel']) ? ', avec le nom de domaine' : '') . ($annee ? ' (à l’année)' : ' (au mois)'), $m['mensuel_forfait'], 'forfait');
        foreach ($c['options'] as $oid) {
            $o = aled08e_option($oid);
            if ($o && $o['month'] > 0) $items[] = $recurring('Option : ' . $o['name'], $annee ? $o['month'] * max(1, 12 - (int) $D['moisOfferts']) : $o['month'], 'option');
        }
    }
    $lib = ($type ? $type['label'] : 'site') . ', commande ' . $c['ref'];
    if ($n) $items[] = $recurring('Reste de la création en ' . $n . ' fois sans frais (' . $lib . ')', $m['lissage_mensualite'], 'lissage');
    else $items[] = $once('Reste de la création (' . (100 - (int) $D['acompte']) . ' %) : ' . $lib, $m['solde'], 'solde');
    $meta = ['reception' => (string) $cid, 'ref' => $c['ref'], 'lissage' => (string) $n];
    $sansAbo = $offert && !$n; // forfait offert (ou création seule) et reste en une fois : simple paiement
    $params = [
        'mode' => $sansAbo ? 'payment' : 'subscription',
        'locale' => 'fr',
        'client_reference_id' => (string) $cid,
        'metadata' => $meta,
        'line_items' => $items,
        'success_url' => aled08e_url(['solde' => 'ok']) . '#commande',
        'cancel_url' => aled08e_url() . '#commande',
    ];
    if ($sansAbo) $params['invoice_creation'] = ['enabled' => 'true', 'invoice_data' => ['footer' => aled08e_stripe_footer(), 'metadata' => ['commande' => (string) $cid]]];
    else $params['subscription_data'] = ['metadata' => ['commande' => (string) $cid, 'ref' => $c['ref']]];
    $cus = $c['stripe_customer'] ?: ($c['user'] ? aled08e_meta($c['user'], 'stripe_customer') : '');
    if ($cus) $params['customer'] = $cus;
    else $params['customer_email'] = $c['email'];
    // Stripe accepte au plus 24 h : on garde 5 minutes de marge pour la dérive d'horloge entre les serveurs
    if ($expire > 0) $params['expires_at'] = time() + min(max($expire, 1800), DAY_IN_SECONDS - 5 * MINUTE_IN_SECONDS);
    aled08e_stripe_expirer_session($c['solde_session']);
    $r = aled08e_stripe_request('POST', '/v1/checkout/sessions', $params, 'reception-' . $cid . '-' . wp_generate_password(10, false));
    if (is_wp_error($r)) return $r;
    if (empty($r['url'])) return new WP_Error('aled08_stripe', 'Stripe n’a pas renvoyé d’adresse de paiement.');
    update_post_meta($cid, '_aled08_solde_session', $r['id'] ?? '');
    aled08e_cmd_journal($cid, 'Paiement de réception ouvert : ' . ($n ? 'reste en ' . $n . ' fois (' . aled08e_euro_txt($m['lissage_mensualite']) . ' par mois)' : 'reste en une fois (' . aled08e_euro_txt($m['solde']) . ')') . ($expire ? ', lien valable 24 heures' : '') . '.');
    return $r['url'];
}
/* Ancien nom (lien copié depuis l'administration) : le reste en une fois */
function aled08e_stripe_solde_session($cid, $expire = 0) { return aled08e_stripe_reception_session($cid, 0, $expire); }

/* Portail client Stripe (moyen de paiement, factures) : créé au clic, le lien expire en 5 minutes */
function aled08e_stripe_portail($uid) {
    $cus = aled08e_meta($uid, 'stripe_customer');
    if (!$cus) return new WP_Error('aled08_stripe', 'Pas de client Stripe pour ce compte.');
    $r = aled08e_stripe_request('POST', '/v1/billing_portal/sessions', ['customer' => $cus, 'return_url' => aled08e_url() . '#forfait', 'locale' => 'fr']);
    if (is_wp_error($r)) return $r;
    return !empty($r['url']) ? $r['url'] : new WP_Error('aled08_stripe', 'Pas d’adresse de portail.');
}

/* Boutons de l'espace client : portail, solde, reprise du paiement d'une commande en attente */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return;
    $portal = !empty($_POST['aled08e_portal']);
    $solde = !empty($_POST['aled08e_solde']);
    $payer = !empty($_POST['aled08e_payer']);
    if (!$portal && !$solde && !$payer) return;
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $uid = get_current_user_id();
    $nonce = function ($field, $action) { return wp_verify_nonce(isset($_POST[$field]) ? sanitize_text_field(wp_unslash($_POST[$field])) : '', $action); };
    if ($portal) {
        if (!$nonce('_aled08e_portal', 'aled08e_portal')) { wp_safe_redirect(aled08e_url(['m' => 'portail_erreur']) . '#forfait', 303); exit; }
        $url = aled08e_stripe_portail($uid);
        if (is_wp_error($url)) { wp_safe_redirect(aled08e_url(['m' => 'portail_erreur']) . '#forfait', 303); exit; }
        wp_redirect($url, 303); // phpcs:ignore WordPress.Security.SafeRedirect -- portail Stripe
        exit;
    }
    $cid = (int) ($_POST['cid'] ?? 0);
    $c = aled08e_cmd_get($cid);
    $back = function () { wp_safe_redirect(aled08e_url(['m' => 'paiement_erreur']) . '#commande', 303); exit; };
    if (!$c || $c['user'] !== $uid) $back();
    if ($solde) {
        if (!$nonce('_aled08e_solde', 'aled08e_solde_' . $cid) || !aled08e_cmd_reception_due($c)) $back();
        $url = aled08e_stripe_reception_session($cid, (int) ($_POST['reste'] ?? 0));
    } else {
        if (!$nonce('_aled08e_payer', 'aled08e_payer_' . $cid) || $c['statut'] !== 'attente_paiement' || $c['paiement_en_cours']) $back();
        $url = aled08e_stripe_checkout($cid);
    }
    if (is_wp_error($url)) $back();
    wp_redirect($url, 303); // phpcs:ignore WordPress.Security.SafeRedirect -- page de paiement Stripe
    exit;
}, 1);

/* =========================================================================
 *  Webhook : POST /wp-json/aled08/v1/stripe
 * ========================================================================= */
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/stripe', ['methods' => 'POST', 'callback' => 'aled08e_stripe_webhook', 'permission_callback' => '__return_true']);
});
function aled08e_stripe_signature_ok($body, $header, $secret) {
    $t = 0;
    $v1 = [];
    foreach (explode(',', (string) $header) as $part) {
        $kv = explode('=', trim($part), 2);
        if (count($kv) !== 2) continue;
        if ($kv[0] === 't') $t = (int) $kv[1];
        elseif ($kv[0] === 'v1') $v1[] = trim($kv[1]);
    }
    if (!$t || !$v1 || abs(time() - $t) > 300) return false;
    $expected = hash_hmac('sha256', $t . '.' . $body, $secret);
    foreach ($v1 as $s) if (hash_equals($expected, $s)) return true;
    return false;
}
function aled08e_stripe_webhook(WP_REST_Request $req) {
    $secret = aled08e_stripe_webhook_secret();
    $body = (string) $req->get_body();
    if ($secret === '' || !aled08e_stripe_signature_ok($body, $req->get_header('stripe_signature'), $secret)) {
        aled08e_stripe_refus_noter(); // pas dans le journal : une rafale de requêtes anonymes n'efface pas l'historique
        return new WP_REST_Response(['error' => 'signature'], 400);
    }
    $event = json_decode($body, true);
    if (!is_array($event) || empty($event['id']) || empty($event['type'])) return new WP_REST_Response(['error' => 'json'], 400);
    $seen = get_option('aled08_stripe_events', []);
    $seen = is_array($seen) ? $seen : [];
    if (in_array($event['id'], $seen, true)) return new WP_REST_Response(['received' => true, 'duplicate' => true], 200);
    $seen[] = $event['id'];
    update_option('aled08_stripe_events', array_slice($seen, -500), false);
    try {
        $res = aled08e_stripe_traiter_event($event);
    } catch (Throwable $e) {
        $res = 'erreur : ' . $e->getMessage();
    }
    aled08e_stripe_journal_add($event['type'], $res);
    return new WP_REST_Response(['received' => true], 200);
}
function aled08e_stripe_id($v) { return is_array($v) ? (string) ($v['id'] ?? '') : (string) $v; }

function aled08e_stripe_traiter_event($event) {
    $obj = $event['data']['object'] ?? [];
    switch ($event['type']) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
            return aled08e_stripe_on_checkout($obj);
        case 'checkout.session.async_payment_failed':
            return aled08e_stripe_on_checkout_failed($obj);
        case 'invoice.paid':
            return aled08e_stripe_on_invoice_paid($obj);
        case 'invoice.payment_failed':
            return aled08e_stripe_on_invoice_failed($obj);
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            return aled08e_stripe_on_subscription($obj, $event['type'] === 'customer.subscription.deleted');
    }
    return 'ignoré';
}

/* Session de paiement terminée : commande payée (abonnement) ou solde payé (paiement) */
function aled08e_stripe_on_checkout($s) {
    if (!empty($s['metadata']['aled08_direct']) && function_exists('aled08e_pd_on_paye')) return aled08e_pd_on_paye($s); // extra, emplacements : payés tout de suite
    if (!empty($s['metadata']['reception'])) return aled08e_stripe_on_reception($s);
    if (($s['mode'] ?? '') === 'payment' && !empty($s['metadata']['solde'])) {
        $cid = (int) ($s['metadata']['solde'] ?? 0);
        $c = $cid ? aled08e_cmd_get($cid) : null;
        if (!$c) return 'paiement : commande inconnue';
        if (($s['payment_status'] ?? '') !== 'paid') return 'solde ' . $c['ref'] . ' : en attente de confirmation (' . ($s['payment_status'] ?? '?') . ')';
        if ($c['solde_paye']) {
            if (!empty($s['id']) && $s['id'] !== $c['solde_session']) {
                aled08e_cmd_journal($cid, 'Un deuxième paiement du solde est arrivé (session ' . $s['id'] . ') : à rembourser.');
                aled08e_stripe_mail_owner('À vérifier : solde payé deux fois, commande ' . $c['ref'], 'Le solde de la commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . ') était déjà noté payé, et un deuxième paiement est arrivé par Stripe (session ' . $s['id'] . "). Remboursez-le dans Stripe.\n\nFiche : " . aled08e_cmd_admin_url($cid) . "\n");
                return 'solde ' . $c['ref'] . ' : payé deux fois, propriétaire prévenu';
            }
            return 'solde ' . $c['ref'] . ' : déjà noté';
        }
        update_post_meta($cid, '_aled08_solde_paye', 1);
        aled08e_cmd_journal($cid, 'Solde payé par Stripe (' . aled08e_euro_txt($c['montants']['solde']) . ').');
        aled08e_stripe_mail_owner('Solde payé : commande ' . $c['ref'], 'Le solde de ' . aled08e_euro_txt($c['montants']['solde']) . ' de la commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . ") est payé.\n\nFiche : " . aled08e_cmd_admin_url($cid) . "\n");
        return 'solde payé : ' . $c['ref'];
    }
    $cid = (int) ($s['metadata']['commande'] ?? ($s['client_reference_id'] ?? 0));
    $c = $cid ? aled08e_cmd_get($cid) : null;
    if (!$c) return 'abonnement : commande inconnue';
    $cus = aled08e_stripe_id($s['customer'] ?? '');
    $sub = aled08e_stripe_id($s['subscription'] ?? '');
    $sid = (string) ($s['id'] ?? '');
    $paid = ($s['payment_status'] ?? '') === 'paid';
    $autreAbo = $sub && $c['stripe_subscription'] && $sub !== $c['stripe_subscription'];
    if ($c['statut'] !== 'attente_paiement') {
        // la commande n'attend plus de paiement (déjà payée à la main, en création, en ligne, ou annulée) :
        // son statut et ses identifiants ne sont pas touchés ; le propriétaire est prévenu quand il faut agir
        delete_post_meta($cid, '_aled08_paiement_en_cours');
        if (!$paid) return $c['ref'] . ' : session ' . $sid . ' non payée, commande déjà « ' . $c['statut'] . ' », rien à faire';
        $detail = 'Paiement Stripe reçu (session ' . $sid . ($sub ? ', abonnement ' . $sub : '') . ') alors que la commande est déjà « ' . (aled08e_cmd_statuts()[$c['statut']][0] ?? $c['statut']) . ' »';
        aled08e_cmd_journal($cid, $detail . '.');
        if ($c['statut'] === 'annulee' || $autreAbo) {
            $quoi = $c['statut'] === 'annulee'
                ? "Cette commande est annulée : remboursez ce paiement et arrêtez l’abonnement dans Stripe, ou rétablissez la commande en « Payée » depuis sa fiche.\n"
                : 'Un abonnement Stripe existe déjà pour cette commande (' . $c['stripe_subscription'] . ') : le second (' . $sub . ") est à rembourser et à arrêter dans Stripe.\n";
            aled08e_stripe_mail_owner('À vérifier : paiement reçu sur la commande ' . $c['ref'], $detail . ".\n\n" . $quoi . "\nFiche : " . aled08e_cmd_admin_url($cid) . "\n");
        }
        return $c['ref'] . ' : paiement reçu, commande déjà « ' . $c['statut'] . ' », statut inchangé' . ($autreAbo ? ', deuxième abonnement signalé' : '');
    }
    if ($autreAbo) {
        aled08e_cmd_journal($cid, 'Deux abonnements Stripe pour cette commande : ' . $c['stripe_subscription'] . ' puis ' . $sub . '. Le second est à arrêter.');
        aled08e_stripe_mail_owner('À vérifier : deux abonnements pour la commande ' . $c['ref'], 'La commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . ') a déjà l’abonnement ' . $c['stripe_subscription'] . ' et un second (' . $sub . ") vient d’être créé par un autre paiement. Remboursez et arrêtez le second dans Stripe.\n\nFiche : " . aled08e_cmd_admin_url($cid) . "\n");
    }
    if ($sid) update_post_meta($cid, '_aled08_stripe_session', $sid);
    if ($cus) { update_post_meta($cid, '_aled08_stripe_customer', $cus); aled08e_stripe_noter_customer($c['user'], $cus); }
    if ($sub && !$autreAbo) { update_post_meta($cid, '_aled08_stripe_subscription', $sub); if ($c['user'] && aled08e_meta($c['user'], 'stripe_subscription') === '') update_user_meta($c['user'], 'aled08_stripe_subscription', $sub); }
    if (!$paid) {
        update_post_meta($cid, '_aled08_paiement_en_cours', 1);
        aled08e_cmd_journal($cid, 'Paiement en cours de confirmation (prélèvement).');
        return $c['ref'] . ' : paiement en cours de confirmation';
    }
    delete_post_meta($cid, '_aled08_paiement_en_cours');
    if ($sub) aled08e_stripe_maj_abonnement($c['user'], $cid, 'active');
    if ($cus) aled08e_stripe_request('POST', '/v1/customers/' . rawurlencode($cus), ['invoice_settings' => ['footer' => aled08e_stripe_footer()]]);
    if ($sub && $c['lissage']) aled08e_stripe_trouver_lissage($cid, $sub);
    aled08e_cmd_set_statut($cid, 'payee', 'Stripe');
    return $c['ref'] . ' : payée';
}
function aled08e_stripe_on_checkout_failed($s) {
    $cid = (int) ($s['metadata']['commande'] ?? ($s['metadata']['solde'] ?? ($s['client_reference_id'] ?? 0)));
    $c = $cid ? aled08e_cmd_get($cid) : null;
    if (!$c) return 'échec : commande inconnue';
    delete_post_meta($cid, '_aled08_paiement_en_cours');
    aled08e_cmd_journal($cid, 'Le paiement différé (prélèvement) a échoué.');
    aled08e_stripe_mail_owner('Paiement échoué : commande ' . $c['ref'], 'Le prélèvement de la commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . ") a échoué. Le client peut réessayer depuis son espace, ou vous pouvez le contacter.\n\nFiche : " . aled08e_cmd_admin_url($cid) . "\n");
    return $c['ref'] . ' : paiement échoué';
}
/* L'identifiant de la ligne « lissage » dans l'abonnement, pour pouvoir l'arrêter après la dernière échéance */
function aled08e_stripe_trouver_lissage($cid, $sub) {
    $r = aled08e_stripe_request('GET', '/v1/subscriptions/' . rawurlencode($sub), ['expand' => ['items.data.price.product']]);
    if (is_wp_error($r)) return '';
    $c = aled08e_cmd_get($cid);
    $cents = aled08e_stripe_cents($c['montants']['lissage_mensualite']);
    $found = '';
    foreach ($r['items']['data'] ?? [] as $it) {
        $tag = $it['price']['product']['metadata']['aled08'] ?? '';
        $name = $it['price']['product']['name'] ?? '';
        if ($tag === 'lissage' || (!$tag && (int) ($it['price']['unit_amount'] ?? -1) === $cents && stripos($name, 'liss') !== false)) { $found = (string) $it['id']; break; }
    }
    if ($found) { update_post_meta($cid, '_aled08_stripe_lissage_item', $found); aled08e_cmd_journal($cid, 'Lissage : ligne d’abonnement repérée.'); }
    return $found;
}
function aled08e_stripe_arreter_lissage($cid) {
    $c = aled08e_cmd_get($cid);
    // création seule : l'abonnement ne porte que les mensualités du site. Stripe refuse d'en retirer la dernière ligne :
    // on arrête donc l'abonnement entier, sans prorata.
    if ($c && aled08e_est_seule($c['forfait']) && $c['stripe_subscription']) {
        $r = aled08e_stripe_request('DELETE', '/v1/subscriptions/' . rawurlencode($c['stripe_subscription']), ['prorate' => 'false']);
        if (is_wp_error($r)) { aled08e_cmd_journal($cid, 'Fin du paiement étalé : arrêt de l’abonnement impossible : ' . $r->get_error_message()); return false; }
        update_post_meta($cid, '_aled08_stripe_lissage_item', '');
        update_post_meta($cid, '_aled08_lissage_fini', 1);
        aled08e_cmd_journal($cid, 'Paiement étalé terminé : le site est entièrement payé, l’abonnement Stripe des mensualités est arrêté.');
        aled08e_stripe_mail_owner('Site entièrement payé : commande ' . $c['ref'], 'Les ' . (int) $c['montants']['lissage_total_echeances'] . ' mensualités du site de ' . aled08e_cmd_nom($c) . " (création seule) sont payées. Plus rien n’est prélevé.\n");
        return true;
    }
    if (!$c || !$c['stripe_lissage_item']) return false;
    $r = aled08e_stripe_request('DELETE', '/v1/subscription_items/' . rawurlencode($c['stripe_lissage_item']), ['proration_behavior' => 'none']);
    if (is_wp_error($r)) { aled08e_cmd_journal($cid, 'Arrêt du lissage impossible : ' . $r->get_error_message()); return false; }
    update_post_meta($cid, '_aled08_stripe_lissage_item', '');
    update_post_meta($cid, '_aled08_lissage_fini', 1);
    aled08e_cmd_journal($cid, 'Lissage terminé : la ligne « création lissée » est retirée de l’abonnement.');
    aled08e_stripe_mail_owner('Lissage terminé : commande ' . $c['ref'], 'Les ' . (int) $c['montants']['lissage_total_echeances'] . ' échéances de la création du site de ' . aled08e_cmd_nom($c) . " sont payées. La ligne a été retirée de l’abonnement : il ne reste que l’abonnement et ses extras.\n");
    return true;
}

/* Facture payée : ajoutée à l'espace du client, compteur de lissage, abonnement actif */
function aled08e_stripe_invoice_subscription($inv) {
    return aled08e_stripe_id($inv['parent']['subscription_details']['subscription'] ?? ($inv['subscription'] ?? ''));
}
function aled08e_stripe_invoice_commande($inv) {
    $cid = (int) ($inv['parent']['subscription_details']['metadata']['commande'] ?? ($inv['subscription_details']['metadata']['commande'] ?? ($inv['metadata']['commande'] ?? 0)));
    $c = $cid ? aled08e_cmd_get($cid) : null;
    if (!$c) { $sub = aled08e_stripe_invoice_subscription($inv); if ($sub) $c = aled08e_cmd_par_meta('stripe_subscription', $sub); }
    return $c;
}
function aled08e_stripe_user_par_customer($cus) {
    if (!$cus) return 0;
    $u = get_users(['meta_key' => 'aled08_stripe_customer', 'meta_value' => $cus, 'number' => 1, 'fields' => 'ID']);
    return $u ? (int) $u[0] : 0;
}
function aled08e_stripe_line_item_id($line) {
    return aled08e_stripe_id($line['parent']['subscription_item_details']['subscription_item'] ?? ($line['subscription_item'] ?? ''));
}
function aled08e_stripe_facture_lissage($inv, $c) {
    foreach ($inv['lines']['data'] ?? [] as $line) {
        $id = aled08e_stripe_line_item_id($line);
        if ($c['stripe_lissage_item'] !== '' && $id === $c['stripe_lissage_item']) return true;
        if ($c['stripe_lissage_item'] === '' && stripos((string) ($line['description'] ?? ''), 'liss') !== false) return true;
    }
    return false;
}
function aled08e_stripe_on_invoice_paid($inv) {
    $c = aled08e_stripe_invoice_commande($inv);
    $cus = aled08e_stripe_id($inv['customer'] ?? '');
    $uid = $c ? $c['user'] : aled08e_stripe_user_par_customer($cus);
    if (!$uid) return 'facture : client inconnu';
    $factures = get_user_meta($uid, 'aled08_factures_stripe', true);
    $factures = is_array($factures) ? $factures : [];
    $deja = false;
    foreach ($factures as $f) if (($f['id'] ?? '') === ($inv['id'] ?? '')) $deja = true;
    if (!$deja) {
        $factures[] = [
            'id' => (string) ($inv['id'] ?? ''),
            'date' => wp_date('Y-m-d H:i:s', (int) ($inv['status_transitions']['paid_at'] ?? ($inv['created'] ?? time()))),
            'number' => (string) ($inv['number'] ?? ''),
            'montant' => round((int) ($inv['amount_paid'] ?? 0) / 100, 2),
            'url' => (string) ($inv['hosted_invoice_url'] ?? ''),
            'pdf' => (string) ($inv['invoice_pdf'] ?? ''),
        ];
        update_user_meta($uid, 'aled08_factures_stripe', array_slice($factures, -200));
    }
    if (aled08e_stripe_invoice_subscription($inv)) aled08e_stripe_maj_abonnement($uid, $c ? $c['id'] : 0, 'active');
    if (!$c) return 'facture ajoutée (client ' . $uid . ')';
    $res = 'facture ' . ($inv['number'] ?? '') . ' ajoutée pour ' . $c['ref'];
    if ($cus && !$c['stripe_customer']) { update_post_meta($c['id'], '_aled08_stripe_customer', $cus); aled08e_stripe_noter_customer($uid, $cus); }
    $sub = aled08e_stripe_invoice_subscription($inv);
    if ($sub && !$c['stripe_subscription']) { update_post_meta($c['id'], '_aled08_stripe_subscription', $sub); if (aled08e_meta($uid, 'stripe_subscription') === '') update_user_meta($uid, 'aled08_stripe_subscription', $sub); $c['stripe_subscription'] = $sub; }
    if ($c['statut'] === 'attente_paiement') { delete_post_meta($c['id'], '_aled08_paiement_en_cours'); aled08e_cmd_set_statut($c['id'], 'payee', 'Stripe, facture payée'); }
    if ($c['lissage'] && !$deja && !get_post_meta($c['id'], '_aled08_lissage_fini', true)) {
        if ($c['stripe_lissage_item'] === '' && $c['stripe_subscription']) { aled08e_stripe_trouver_lissage($c['id'], $c['stripe_subscription']); $c = aled08e_cmd_get($c['id']); }
        if (aled08e_stripe_facture_lissage($inv, $c)) {
            $n = $c['lissage_paye'] + 1;
            update_post_meta($c['id'], '_aled08_lissage_paye', $n);
            aled08e_cmd_journal($c['id'], 'Lissage : ' . $n . ' / ' . (int) $c['montants']['lissage_total_echeances'] . ' échéances payées.');
            $res .= ', lissage ' . $n . '/' . (int) $c['montants']['lissage_total_echeances'];
            if ($n >= (int) $c['montants']['lissage_total_echeances']) aled08e_stripe_arreter_lissage($c['id']);
        }
    }
    return $res;
}
function aled08e_stripe_on_invoice_failed($inv) {
    $c = aled08e_stripe_invoice_commande($inv);
    $cus = aled08e_stripe_id($inv['customer'] ?? '');
    $uid = $c ? $c['user'] : aled08e_stripe_user_par_customer($cus);
    if (!$uid) return 'échec de facture : client inconnu';
    aled08e_stripe_maj_abonnement($uid, $c ? $c['id'] : 0, 'past_due');
    $u = get_userdata($uid);
    $nom = $u ? $u->display_name . ' (' . $u->user_email . ')' : 'client ' . $uid;
    if ($c) aled08e_cmd_journal($c['id'], 'Un paiement de l’abonnement a échoué : abonnement en retard.');
    aled08e_stripe_mail_owner('Paiement de l’abonnement échoué : ' . $nom, 'Le paiement de la facture ' . ($inv['number'] ?? '') . ' (' . aled08e_euro_txt(((int) ($inv['amount_due'] ?? 0)) / 100) . ') de ' . $nom . " a échoué. Stripe réessaie tout seul pendant quelques jours. Le client voit un message dans son espace pour mettre à jour son moyen de paiement.\n" . ($c ? "\nFiche commande : " . aled08e_cmd_admin_url($c['id']) . "\n" : ''));
    return 'retard de paiement noté pour ' . $nom;
}
function aled08e_stripe_on_subscription($sub, $deleted) {
    $cid = (int) ($sub['metadata']['commande'] ?? 0);
    $c = $cid ? aled08e_cmd_get($cid) : aled08e_cmd_par_meta('stripe_subscription', aled08e_stripe_id($sub['id'] ?? ''));
    $cus = aled08e_stripe_id($sub['customer'] ?? '');
    $uid = $c ? $c['user'] : aled08e_stripe_user_par_customer($cus);
    if (!$uid) return 'abonnement : client inconnu';
    $status = (string) ($sub['status'] ?? '');
    $map = ['active' => 'active', 'trialing' => 'active', 'past_due' => 'past_due', 'unpaid' => 'past_due', 'canceled' => 'canceled', 'incomplete_expired' => 'canceled', 'incomplete' => 'none', 'paused' => 'past_due'];
    $abo = $deleted ? 'canceled' : ($map[$status] ?? $status);
    $abo = aled08e_stripe_maj_abonnement($uid, $c ? $c['id'] : 0, $abo);
    $u = get_userdata($uid);
    $nom = $u ? $u->display_name . ' (' . $u->user_email . ')' : 'client ' . $uid;
    if ($c) aled08e_cmd_journal($c['id'], 'Abonnement Stripe : ' . ($deleted ? 'arrêté' : $status) . '.');
    // création seule : l'abonnement ne portait que les mensualités du site, sa fin est normale (pas d'alerte)
    if ($deleted && $c && aled08e_est_seule($c['forfait']) && get_post_meta($c['id'], '_aled08_lissage_fini', true)) return 'mensualités terminées pour ' . $nom;
    if ($deleted) aled08e_stripe_mail_owner('Abonnement arrêté : ' . $nom, 'L’abonnement Stripe de ' . $nom . " est terminé. Le site et le nom de domaine ne sont plus couverts par un abonnement : voyez avec le client ce qu’il souhaite.\n" . ($c ? "\nFiche commande : " . aled08e_cmd_admin_url($c['id']) . "\n" : ''));
    return 'abonnement de ' . $nom . ' : ' . $abo;
}

/* =========================================================================
 *  Filet de sécurité quotidien : compteur de lissage relu depuis les factures payées
 * ========================================================================= */
function aled08e_stripe_reconciliation() {
    if (!aled08e_stripe_ready()) return;
    foreach (aled08e_cmd_liste(['meta_key' => '_aled08_lissage', 'meta_value' => 0, 'meta_compare' => '>', 'meta_type' => 'NUMERIC']) as $c) {
        if (!$c['stripe_subscription'] || $c['statut'] === 'annulee' || get_post_meta($c['id'], '_aled08_lissage_fini', true)) continue;
        if ($c['stripe_lissage_item'] === '') { aled08e_stripe_trouver_lissage($c['id'], $c['stripe_subscription']); $c = aled08e_cmd_get($c['id']); }
        if ($c['stripe_lissage_item'] === '') continue;
        $r = aled08e_stripe_request('GET', '/v1/invoices', ['subscription' => $c['stripe_subscription'], 'status' => 'paid', 'limit' => 100]);
        if (is_wp_error($r)) continue;
        $n = 0;
        foreach ($r['data'] ?? [] as $inv) if (aled08e_stripe_facture_lissage($inv, $c)) $n++;
        if ($n !== $c['lissage_paye']) {
            update_post_meta($c['id'], '_aled08_lissage_paye', $n);
            aled08e_cmd_journal($c['id'], 'Lissage recompté depuis Stripe : ' . $n . ' / ' . (int) $c['montants']['lissage_total_echeances'] . '.');
        }
        if ($n >= (int) $c['montants']['lissage_total_echeances']) aled08e_stripe_arreter_lissage($c['id']);
    }
}
add_action('aled08_quotidien', 'aled08e_stripe_reconciliation', 30);

/* Paiement de réception terminé : le reste est réglé (ou lissé) et l'abonnement démarre */
function aled08e_stripe_on_reception($s) {
    $cid = (int) $s['metadata']['reception'];
    $c = aled08e_cmd_get($cid);
    if (!$c) return 'réception : commande inconnue';
    $n = aled08e_cmd_lissage_n((string) ($s['metadata']['lissage'] ?? '0'));
    $cus = aled08e_stripe_id($s['customer'] ?? '');
    $sub = aled08e_stripe_id($s['subscription'] ?? '');
    if ($c['reception_payee']) return $c['ref'] . ' : réception déjà notée';
    if (($s['payment_status'] ?? '') !== 'paid') {
        aled08e_cmd_journal($cid, 'Paiement de réception en cours de confirmation (prélèvement).');
        return $c['ref'] . ' : réception en cours de confirmation';
    }
    // le choix du client (en une fois ou en n fois) devient celui de la commande
    $m = aled08e_cmd_montants_reception($c, $n);
    update_post_meta($cid, '_aled08_montants', array_merge($c['montants'], ['solde' => $m['solde'], 'lissage_mensualite' => $m['lissage_mensualite'], 'lissage_total_echeances' => $m['lissage_total_echeances'], 'mensuel_forfait' => $m['mensuel_forfait'], 'mensuel_options' => $m['mensuel_options']]));
    update_post_meta($cid, '_aled08_lissage', $n);
    if ($n) update_post_meta($cid, '_aled08_periode', 'mois');
    else update_post_meta($cid, '_aled08_solde_paye', 1);
    update_post_meta($cid, '_aled08_reception_payee', 1);
    if ($cus) { update_post_meta($cid, '_aled08_stripe_customer', $cus); aled08e_stripe_noter_customer($c['user'], $cus); }
    if ($sub) {
        update_post_meta($cid, '_aled08_stripe_subscription', $sub);
        if ($c['user']) update_user_meta($c['user'], 'aled08_stripe_subscription', $sub);
        aled08e_stripe_maj_abonnement($c['user'], $cid, 'active');
        if ($n) aled08e_stripe_trouver_lissage($cid, $sub);
    }
    if ($c['user']) { update_user_meta($c['user'], 'aled08_paiement', $n ? 'mois' : ($c['periode'] === 'annee' ? 'annee' : 'mois')); }
    $quoi = $n ? 'reste en ' . $n . ' fois (' . aled08e_euro_txt($m['lissage_mensualite']) . ' par mois)' : 'reste payé en une fois (' . aled08e_euro_txt($m['solde']) . ')';
    $seule = aled08e_est_seule($c['forfait']);
    aled08e_cmd_journal($cid, 'Réception réglée par Stripe : ' . $quoi . ($seule ? ($n ? ' (création seule : l’abonnement Stripe ne porte que les mensualités du site).' : ' (création seule, pas d’abonnement).') : ', abonnement démarré.'));
    aled08e_stripe_mail_owner('Réception réglée : commande ' . $c['ref'], 'Commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . ') : ' . $quoi . ($seule ? ". Création seule : pas d’abonnement. Remettez le code du site au client (fichiers et sauvegarde complète).\n\nFiche : " : ". L’abonnement a démarré.\n\nFiche : ") . aled08e_cmd_admin_url($cid) . "\n");
    return $c['ref'] . ' : réception réglée (' . $quoi . ')';
}
