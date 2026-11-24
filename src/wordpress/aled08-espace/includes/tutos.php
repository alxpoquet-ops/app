<?php
/**
 * Les Minis Monstres Espace client : les Minis Tutos (« Minis Tutos, Minis Prix », décision d'Alex du 24 novembre 2026).
 *
 * Une vingtaine de tutos complets, découpés en pages. Chacun se vend à l'unité (tutosOffre.prix, 4,99 €), payé une fois, accès à vie
 * (article 21 des conditions générales) ; deux ou trois sont entièrement gratuits (gratuit: true). Les tutosOffre.apercuPages
 * premières pages de chaque tuto sont publiques (sur le site, et ici). Tout le reste n'est lisible que par un compte qui a acheté
 * le tuto, ou par un administrateur.
 *
 * Achat : /mon-espace/?tuto=<slug> (le bouton « Acheter » des pages publiques, data-achat). Pas connecté : le tuto présenté, avec
 * « Je crée mon compte » (le même parcours que les comptes « outils seuls », includes/abonnements-outils.php) et « J'ai déjà un
 * compte » ; puis retour sur le tuto. Connecté : le tuto s'ouvre dans l'onglet « Mes tutos », avec la case de renonciation au droit
 * de rétractation (contenu numérique fourni tout de suite, article L221-28 13° du Code de la consommation), puis Stripe Checkout
 * (mode payment, facture Stripe). L'accès s'ouvre au retour (la session est relue) ET par le webhook (includes/stripe.php),
 * une seule fois par session. Ventes fermées (includes/ouverture.php) : refusé, sauf pour un administrateur.
 *
 * Le contenu des pages n'est PAS dans data.json (lisible par une simple adresse) : il est dans tutos-donnees.php, à la racine de
 * l'extension, généré par scripts/wp-espace-data.js. Ouvert directement, ce fichier ne renvoie rien (defined('ABSPATH') || exit).
 * Il n'est lu que par aled08e_tuto_page_html(), après aled08e_tuto_page_lisible(). Aucune route REST ne sert le contenu ;
 * la seule requête ajax (progression) ne renvoie que des chiffres.
 *
 * CONTRAT :
 *   aled08e_tuto_acces($uid, $slug)            bool : tuto gratuit, acheté, ou administrateur
 *   aled08e_tuto_page_lisible($uid, $slug, $i) bool : accès, ou une des pages d'aperçu
 *   aled08e_tuto_ouvrir($uid, $slug, $info)    ouvre l'accès (paiement reçu, ou offert par Alex) : true la première fois
 *   aled08e_tuto_on_checkout($s)               une session Stripe payée (webhook ou retour) : texte pour le journal
 *   aled08e_tutos_client_txt($uid)             les tutos achetés, en clair (pour Alex)
 *
 * Données (méta du compte) :
 *   aled08_tutos          [slug => ['le' => ts, 'par' => stripe|alex, 'session' => cs_…, 'paiement' => pi_…, 'facture' => in_…,
 *                          'montant' => centimes, 'renonciation' => ts]]
 *   aled08_tutos_sessions [cs_…] (sessions déjà traitées, 100 gardées)
 *   aled08_tutos_renonce  [slug => ts] la case cochée avant de payer (preuve de la demande expresse)
 *   aled08_tutos_progres  [slug => ['faites' => [index de page…], 'derniere' => index, 'le' => ts]]
 *   aled08_tutos_session  [slug => cs_…] la dernière page de paiement ouverte (fermée avant d'en ouvrir une autre)
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  Le catalogue (data.json) et le contenu (tutos-donnees.php)
 * ========================================================================= */
function aled08e_tutos_offre() {
    $o = (array) (aled08e_data()['tutosOffre'] ?? []);
    return ['prix' => max(0, (float) ($o['prix'] ?? 0)), 'apercuPages' => max(0, (int) ($o['apercuPages'] ?? 2)), 'slogan' => (string) ($o['slogan'] ?? '')];
}
function aled08e_tuto_prix() { return aled08e_tutos_offre()['prix']; }
function aled08e_tuto_prix_txt() { return aled08e_euro_txt(aled08e_tuto_prix()); }
function aled08e_tutos_liste() { return array_values(array_filter((array) (aled08e_data()['tutos'] ?? []), function ($t) { return is_array($t) && !empty($t['slug']) && !empty($t['pages']); })); }
function aled08e_tuto_def($slug) {
    foreach (aled08e_tutos_liste() as $t) if ($t['slug'] === $slug) return $t;
    return null;
}
/* Un slug reçu (adresse, formulaire) : celui d'un tuto du catalogue, sinon '' */
function aled08e_tuto_param($v) {
    if (!is_string($v)) return '';
    $v = substr(preg_replace('/[^a-z0-9-]/', '', strtolower($v)), 0, 120);
    return $v !== '' && aled08e_tuto_def($v) ? $v : '';
}
function aled08e_tuto_gratuit($def) { return !empty($def['gratuit']) || aled08e_tuto_prix() <= 0; }
function aled08e_tuto_nb_pages($def) { return count((array) ($def['pages'] ?? [])); }
function aled08e_tutos_groupe($id) {
    foreach ((array) (aled08e_data()['tutosGroupes'] ?? []) as $g) if (($g['id'] ?? '') === $id) return $g;
    return ['id' => $id, 'titre' => 'Les tutos', 'color' => 'lilac', 'monstre' => 'mochi', 'icon' => 'book-open'];
}
/* Le contenu des pages : [slug => [['titre', 'html'], …]]. Jamais appelé sans contrôle d'accès (aled08e_tuto_page_html). */
function aled08e_tutos_contenu() {
    static $c = null;
    if ($c === null) {
        $f = dirname(__DIR__) . '/tutos-donnees.php';
        $c = file_exists($f) ? include $f : [];
        $c = is_array($c) ? $c : [];
    }
    return $c;
}
/* L'adresse d'un tuto dans l'espace (onglet « Mes tutos »), à la page $page (0, la première) */
function aled08e_tuto_url($slug, $extra = [], $page = null) {
    return aled08e_url(['lire' => $slug] + ($page !== null ? ['tp' => (int) $page + 1] : []) + $extra) . '#tutos';
}

/* =========================================================================
 *  L'accès
 * ========================================================================= */
function aled08e_tutos_achats($uid) { $v = get_user_meta((int) $uid, 'aled08_tutos', true); return is_array($v) ? $v : []; }
function aled08e_tuto_achete($uid, $slug) { return !empty(aled08e_tutos_achats($uid)[$slug]); }
function aled08e_tuto_acces($uid, $slug) {
    $def = aled08e_tuto_def($slug);
    if (!$def) return false;
    if (aled08e_tuto_gratuit($def)) return true;
    $uid = (int) $uid;
    if (!$uid) return false;
    if (user_can($uid, 'manage_options')) return true;
    return aled08e_tuto_achete($uid, $slug);
}
function aled08e_tuto_page_lisible($uid, $slug, $i) {
    $def = aled08e_tuto_def($slug);
    if (!$def || $i < 0 || $i >= aled08e_tuto_nb_pages($def)) return false;
    return $i < aled08e_tutos_offre()['apercuPages'] || aled08e_tuto_acces($uid, $slug);
}
/* Une page, en HTML, seulement si ce compte peut la lire : sinon '' */
function aled08e_tuto_page_html($uid, $slug, $i) {
    if (!aled08e_tuto_page_lisible($uid, $slug, $i)) return '';
    $p = aled08e_tutos_contenu()[$slug][$i] ?? null;
    return is_array($p) ? wp_kses_post((string) ($p['html'] ?? '')) : '';
}

/* =========================================================================
 *  La progression, page par page
 * ========================================================================= */
function aled08e_tutos_progres_tout($uid) { $v = get_user_meta((int) $uid, 'aled08_tutos_progres', true); return is_array($v) ? $v : []; }
function aled08e_tuto_progres($uid, $slug) {
    $p = aled08e_tutos_progres_tout($uid)[$slug] ?? [];
    return ['faites' => array_values(array_map('intval', (array) ($p['faites'] ?? []))), 'derniere' => (int) ($p['derniere'] ?? -1), 'le' => (int) ($p['le'] ?? 0)];
}
function aled08e_tuto_progres_sauver($uid, $slug, $p) {
    $tout = aled08e_tutos_progres_tout($uid);
    $tout[$slug] = ['faites' => array_values(array_unique(array_map('intval', $p['faites']))), 'derniere' => (int) $p['derniere'], 'le' => time()];
    update_user_meta((int) $uid, 'aled08_tutos_progres', $tout);
}
function aled08e_tuto_noter_lecture($uid, $slug, $i) {
    $p = aled08e_tuto_progres($uid, $slug);
    if ($p['derniere'] === (int) $i && time() - $p['le'] < 60) return;
    $p['derniere'] = (int) $i;
    aled08e_tuto_progres_sauver($uid, $slug, $p);
}
function aled08e_tuto_marquer($uid, $slug, $i, $fait) {
    $def = aled08e_tuto_def($slug);
    if (!$def || !aled08e_tuto_page_lisible($uid, $slug, $i)) return false;
    $p = aled08e_tuto_progres($uid, $slug);
    $p['faites'] = array_values(array_diff($p['faites'], [(int) $i]));
    if ($fait) $p['faites'][] = (int) $i;
    $p['faites'] = array_values(array_filter($p['faites'], function ($x) use ($def) { return $x >= 0 && $x < aled08e_tuto_nb_pages($def); }));
    sort($p['faites']);
    $p['derniere'] = (int) $i;
    aled08e_tuto_progres_sauver($uid, $slug, $p);
    return true;
}
function aled08e_tuto_pourcent($uid, $slug) {
    $def = aled08e_tuto_def($slug);
    $n = $def ? aled08e_tuto_nb_pages($def) : 0;
    if (!$n) return 0;
    $f = count(array_filter(aled08e_tuto_progres($uid, $slug)['faites'], function ($x) use ($n) { return $x >= 0 && $x < $n; }));
    return (int) round(100 * $f / $n);
}
/* La page où reprendre : la dernière ouverte (si lisible), sinon la première pas encore finie */
function aled08e_tuto_reprise($uid, $slug) {
    $def = aled08e_tuto_def($slug);
    if (!$def) return 0;
    $p = aled08e_tuto_progres($uid, $slug);
    if ($p['derniere'] >= 0 && aled08e_tuto_page_lisible($uid, $slug, $p['derniere'])) return $p['derniere'];
    for ($i = 0; $i < aled08e_tuto_nb_pages($def); $i++) if (!in_array($i, $p['faites'], true)) return $i;
    return 0;
}

/* Ajax : « J'ai fini cette page » (ne renvoie que des chiffres, jamais de contenu) */
add_action('wp_ajax_aled08e_tuto_page', function () {
    if (!check_ajax_referer('aled08e_tuto_page', '_n', false)) wp_send_json_error(['msg' => 'nonce'], 403);
    $uid = get_current_user_id();
    $slug = aled08e_tuto_param(wp_unslash($_POST['tuto'] ?? ''));
    $i = (int) ($_POST['page'] ?? -1);
    if (!$uid || $slug === '' || !aled08e_tuto_marquer($uid, $slug, $i, !empty($_POST['fait']))) wp_send_json_error(['msg' => 'refus'], 403);
    wp_send_json_success(['pourcent' => aled08e_tuto_pourcent($uid, $slug), 'faites' => aled08e_tuto_progres($uid, $slug)['faites']]);
});
/* La même chose sans script : le formulaire est envoyé, on revient sur la page */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_tuto_page']) || !is_user_logged_in()) return;
    $slug = aled08e_tuto_param(wp_unslash($_POST['tuto'] ?? ''));
    $i = (int) ($_POST['page'] ?? -1);
    if ($slug !== '' && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_n'] ?? '')), 'aled08e_tuto_page')) aled08e_tuto_marquer(get_current_user_id(), $slug, $i, !empty($_POST['fait']));
    wp_safe_redirect($slug !== '' ? aled08e_tuto_url($slug, [], max(0, $i)) : aled08e_url() . '#tutos', 303);
    exit;
}, 5);

/* =========================================================================
 *  L'achat : Stripe Checkout, une fois
 * ========================================================================= */
/* Une page de paiement pour ce tuto : l'adresse Stripe, ou WP_Error (code = message court pour l'écran) */
function aled08e_tuto_checkout($uid, $slug) {
    $def = aled08e_tuto_def($slug);
    $u = get_userdata((int) $uid);
    if (!$def || !$u) return new WP_Error('aled08_tuto', 'erreur');
    if (aled08e_tuto_acces($uid, $slug)) return new WP_Error('aled08_tuto', 'deja');
    if (!aled08e_ventes_ouvertes()) return new WP_Error('aled08_tuto', 'ventes');
    if (!aled08e_stripe_ready()) return new WP_Error('aled08_tuto', 'stripe');
    $cents = aled08e_stripe_cents(aled08e_tuto_prix()); // le prix vient de data.json (src/config.js), jamais du formulaire
    if ($cents < 50) return new WP_Error('aled08_tuto', 'erreur');
    $verrou = 'aled08_tuto_verrou_' . (int) $uid;
    if (get_transient($verrou)) return new WP_Error('aled08_tuto', 'occupe');
    set_transient($verrou, 1, 30);
    $renonce = (array) get_user_meta($uid, 'aled08_tutos_renonce', true);
    $quand = (int) ($renonce[$slug] ?? time());
    $nom = 'Mini Tuto : ' . $def['nom'];
    $meta = ['aled08_tuto' => $slug, 'type' => 'tuto', 'user' => (string) (int) $uid, 'montant' => (string) $cents, 'renonciation' => gmdate('c', $quand)];
    $params = [
        'mode' => 'payment',
        'locale' => 'fr',
        'client_reference_id' => 'u' . (int) $uid,
        'metadata' => $meta,
        'line_items' => [['quantity' => 1, 'price_data' => ['currency' => 'eur', 'unit_amount' => $cents, 'product_data' => ['name' => mb_substr($nom, 0, 250), 'metadata' => ['aled08' => 'tuto', 'tuto' => $slug]]]]],
        'payment_intent_data' => ['description' => mb_substr($nom, 0, 250), 'metadata' => $meta],
        'invoice_creation' => ['enabled' => 'true', 'invoice_data' => ['description' => mb_substr($nom . ', accès à vie (article 21 des conditions générales).', 0, 500), 'footer' => aled08e_stripe_footer(), 'metadata' => $meta]],
        'custom_text' => ['submit' => ['message' => 'Accès tout de suite : vous avez demandé à lire ce tuto sans attendre et reconnu perdre votre droit de rétractation dès que l’accès commence (contenu numérique).']],
        'success_url' => add_query_arg(['tpaye' => 'ok', 'lire' => $slug], aled08e_url()) . '&session={CHECKOUT_SESSION_ID}#tutos',
        'cancel_url' => aled08e_url(['tpaye' => 'annule', 'lire' => $slug]) . '#tutos',
    ];
    $cus = aled08e_stripe_client_connu($uid);
    if ($cus) $params['customer'] = $cus;
    else { $params['customer_email'] = $u->user_email; $params['customer_creation'] = 'always'; }
    // une seule page de paiement ouverte à la fois pour ce tuto : un client ne peut pas payer deux fois
    $sessions = get_user_meta($uid, 'aled08_tutos_session', true);
    $sessions = is_array($sessions) ? $sessions : [];
    if (!empty($sessions[$slug])) aled08e_stripe_expirer_session($sessions[$slug]);
    $r = aled08e_stripe_request('POST', '/v1/checkout/sessions', $params, 'tuto-' . (int) $uid . '-' . $slug . '-' . wp_generate_password(10, false));
    delete_transient($verrou);
    if (is_wp_error($r)) return new WP_Error('aled08_tuto', $r->get_error_code() === 'aled08_ventes' ? 'ventes' : 'paiement', $r->get_error_message());
    if (empty($r['url'])) return new WP_Error('aled08_tuto', 'paiement', 'Stripe n’a pas renvoyé d’adresse de paiement.');
    $sessions[$slug] = (string) ($r['id'] ?? '');
    update_user_meta($uid, 'aled08_tutos_session', $sessions);
    return (string) $r['url'];
}

/* Une session Stripe (webhook ou retour du client) : l'accès s'ouvre une seule fois */
function aled08e_tuto_on_checkout($s) {
    $slug = aled08e_tuto_param((string) ($s['metadata']['aled08_tuto'] ?? ''));
    $uid = (int) ($s['metadata']['user'] ?? 0);
    $sid = (string) ($s['id'] ?? '');
    if (!$uid || !get_userdata($uid) || $slug === '' || $sid === '') return 'tuto : session incomplète';
    if (($s['mode'] ?? 'payment') !== 'payment') return 'tuto : session inattendue';
    if (($s['payment_status'] ?? '') !== 'paid') return 'tuto : paiement en attente (' . ($s['payment_status'] ?? '?') . ')';
    $u = get_userdata($uid);
    $def = aled08e_tuto_def($slug);
    $montant = (int) ($s['amount_total'] ?? 0);
    if ($montant <= 0 || strtolower((string) ($s['currency'] ?? 'eur')) !== 'eur' || $montant !== (int) ($s['metadata']['montant'] ?? -1)) {
        aled08e_stripe_mail_owner('À vérifier : paiement d’un tuto inattendu', $u->display_name . ' (' . $u->user_email . ') : la session ' . $sid . ' pour le tuto « ' . $def['nom'] . ' » a un montant inattendu (' . $montant . ' centimes). L’accès n’est pas ouvert : vérifiez dans Stripe.' . "\n");
        return 'tuto : montant inattendu, Alex prévenu';
    }
    // deux traitements en même temps (le retour du client et le webhook) : un seul passe
    $cle = 'aled08_tuto_s_' . md5($sid);
    if (!add_option($cle, time(), '', 'no')) {
        if (time() - (int) get_option($cle) < 120) return 'tuto : session en cours de traitement';
        update_option($cle, time(), false);
    }
    $faites = get_user_meta($uid, 'aled08_tutos_sessions', true);
    $faites = is_array($faites) ? $faites : [];
    if (in_array($sid, $faites, true)) { delete_option($cle); return 'tuto : session déjà traitée'; }
    $faites[] = $sid;
    update_user_meta($uid, 'aled08_tutos_sessions', array_slice($faites, -100));
    $cus = aled08e_stripe_id($s['customer'] ?? '');
    if ($cus) aled08e_stripe_noter_customer($uid, $cus);
    $deja = aled08e_tutos_achats($uid)[$slug] ?? null;
    if ($deja) {
        delete_option($cle);
        if (($deja['session'] ?? '') !== $sid) {
            aled08e_stripe_mail_owner('À vérifier : tuto payé deux fois par ' . $u->display_name, $u->display_name . ' (' . $u->user_email . ') avait déjà le tuto « ' . $def['nom'] . ' » et vient de le payer une seconde fois (session ' . $sid . '). Remboursez ce second paiement dans Stripe.' . "\n");
            return 'tuto : ' . $slug . ' payé deux fois, Alex prévenu';
        }
        return 'tuto : déjà ouvert';
    }
    $renonce = (array) get_user_meta($uid, 'aled08_tutos_renonce', true);
    aled08e_tuto_ouvrir($uid, $slug, [
        'par' => 'stripe', 'session' => $sid, 'paiement' => aled08e_stripe_id($s['payment_intent'] ?? ''), 'facture' => aled08e_stripe_id($s['invoice'] ?? ''),
        'montant' => $montant, 'renonciation' => (int) ($renonce[$slug] ?? 0) ?: (int) strtotime((string) ($s['metadata']['renonciation'] ?? '')),
    ]);
    delete_option($cle);
    return 'tuto : « ' . $def['nom'] . ' » ouvert pour le client ' . $uid;
}

/* Ouvrir l'accès : noté chez le client, une ligne dans le fil et dans le journal, un e-mail au client et un mot à Alex */
function aled08e_tuto_ouvrir($uid, $slug, $info = []) {
    $uid = (int) $uid;
    $def = aled08e_tuto_def($slug);
    $u = get_userdata($uid);
    if (!$def || !$u || aled08e_tuto_achete($uid, $slug)) return false;
    $info = array_merge(['par' => 'stripe', 'session' => '', 'paiement' => '', 'facture' => '', 'montant' => 0, 'renonciation' => 0], (array) $info);
    $a = aled08e_tutos_achats($uid);
    $a[$slug] = ['le' => time(), 'par' => $info['par'] === 'alex' ? 'alex' : 'stripe', 'session' => (string) $info['session'], 'paiement' => (string) $info['paiement'], 'facture' => (string) $info['facture'], 'montant' => (int) $info['montant'], 'renonciation' => (int) $info['renonciation']];
    update_user_meta($uid, 'aled08_tutos', $a);
    $offert = $a[$slug]['par'] === 'alex';
    if (function_exists('aled08e_fil_ajouter')) aled08e_fil_ajouter($uid, 'mochi', 'Votre tuto « ' . $def['nom'] . ' » est ouvert' . ($offert ? ', offert par Alex' : '') . ' : bonne lecture !');
    aled08e_stripe_journal_add($offert ? 'tuto offert' : 'tuto acheté', '« ' . $def['nom'] . ' » pour ' . $u->display_name . ' (client ' . $uid . ')' . ($a[$slug]['session'] ? ', ' . $a[$slug]['session'] : '') . ($a[$slug]['montant'] ? ', ' . aled08e_euro_txt($a[$slug]['montant'] / 100) : ''));
    aled08e_tuto_mail_client($uid, $slug, $a[$slug]);
    if (!$offert) wp_mail(aled08e_to(), 'Tuto vendu : ' . $def['nom'], $u->display_name . ' (' . $u->user_email . ') a acheté le tuto « ' . $def['nom'] . ' » (' . aled08e_euro_txt($a[$slug]['montant'] / 100) . ', par carte). L’accès est ouvert dans son espace.' . "\n\nFiche : " . admin_url('user-edit.php?user_id=' . $uid) . "\n", aled08e_mail_headers());
    do_action('aled08e_tuto_ouvert', $uid, $slug, $a[$slug]);
    return true;
}
/* Retirer l'accès (un remboursement, depuis la fiche du client) */
function aled08e_tuto_fermer($uid, $slug) {
    $a = aled08e_tutos_achats($uid);
    if (empty($a[$slug])) return false;
    unset($a[$slug]);
    update_user_meta((int) $uid, 'aled08_tutos', $a);
    aled08e_stripe_journal_add('tuto retiré', $slug . ' (client ' . (int) $uid . ')');
    return true;
}

/* L'e-mail au client : son tuto est ouvert (et ce qu'il a accepté, sur un support durable) */
function aled08e_tuto_mail_client($uid, $slug, $achat) {
    $u = get_userdata((int) $uid);
    $def = aled08e_tuto_def($slug);
    if (!$u || !$def) return;
    $prenom = trim((string) get_user_meta($u->ID, 'first_name', true)) ?: $u->display_name;
    $offert = ($achat['par'] ?? '') === 'alex';
    $n = aled08e_tuto_nb_pages($def);
    $lien = aled08e_tuto_url($slug);
    $p = function ($t, $taille = 16) { return '<p style="margin:0 0 12px;font-size:' . (int) $taille . 'px;line-height:1.6;color:#2E2A47;">' . $t . '</p>'; };
    $ligne = function ($k, $v) { return '<tr><td style="padding:5px 10px 5px 0;font-size:14px;color:#6B6789;vertical-align:top;white-space:nowrap;">' . esc_html($k) . '</td><td style="padding:5px 0;font-size:15px;color:#2E2A47;font-weight:bold;">' . esc_html($v) . '</td></tr>'; };
    $recap = '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 0;">'
        . $ligne('Votre tuto', $def['nom'])
        . $ligne('Contenu', $n . ' page' . ($n > 1 ? 's' : '') . ($def['duree'] ? ', environ ' . (int) $def['duree'] . ' minutes' : ''))
        . $ligne('Prix', $offert ? 'offert' : aled08e_euro_txt(((int) ($achat['montant'] ?? 0)) / 100) . ', payé une fois (TVA non applicable, art. 293 B du CGI)')
        . $ligne('Accès', 'à vie, dans votre espace client')
        . '</table>';
    $titre = 'Votre tuto est ouvert';
    $h = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 6px;">' . aled08e_mail_monstre('mochi', 96) . '</td></tr></table>'
        . '<h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:#2E2A47;text-align:center;">' . esc_html($titre) . ' !</h1>'
        . $p('Bonjour ' . esc_html($prenom) . ', ' . ($offert ? 'Alex vous offre le tuto' : 'merci pour votre achat ! Le tuto') . ' « <b>' . esc_html($def['nom']) . '</b> » ' . ($offert ? 'et il est' : 'est') . ' déjà ouvert dans votre espace client, onglet « Mes tutos ».')
        . aled08e_mail_carte('lilas', $recap . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:12px;">' . aled08e_mail_bouton($lien, 'Commencer la lecture') . '</td></tr></table>', 'mochi', aled08e_mail_etiquette('Votre Mini Tuto', '#5B3FC4'))
        . aled08e_mail_carte('menthe', $p('<b>À votre rythme.</b> Lisez page par page, cochez « J’ai fini cette page » : votre progression est gardée, et le bouton « Reprendre » vous ramène là où vous en étiez, sur votre téléphone comme sur votre ordinateur.', 15))
        . (!$offert ? $p('Votre facture vous est envoyée par Stripe, notre service de paiement, dans un e-mail séparé. Vous la retrouvez aussi dans Mon compte.', 14)
            . $p('Pour mémoire : vous avez demandé à accéder au tuto tout de suite, et reconnu perdre votre droit de rétractation dès que l’accès a commencé (contenu numérique, article L221-28 du Code de la consommation)' . (!empty($achat['renonciation']) ? ', le ' . esc_html(wp_date('j F Y à H:i', (int) $achat['renonciation'])) : '') . '. « À vie » veut dire : tant que Les Minis Monstres proposent les tutos. Si cela devait s’arrêter, vous seriez prévenu 6 mois avant, avec une copie à garder (article 21 des conditions générales).', 13) : '')
        . $p('Une question ? Répondez simplement à cet e-mail.<br>Bonne lecture,<br><b style="color:#2E2A47;">Alex et les Minis Monstres</b>', 15);
    $txt = 'Bonjour ' . $prenom . ",\n\n" . ($offert ? 'Alex vous offre le tuto' : 'Merci pour votre achat ! Le tuto') . ' « ' . $def['nom'] . ' » est ouvert dans votre espace client, onglet « Mes tutos » : ' . $lien . "\n\n"
        . ($offert ? '' : 'Prix : ' . aled08e_euro_txt(((int) ($achat['montant'] ?? 0)) / 100) . ", payé une fois (TVA non applicable, art. 293 B du CGI). Votre facture arrive dans un e-mail de Stripe.\n\nVous avez demandé à accéder au tuto tout de suite, et reconnu perdre votre droit de rétractation dès que l’accès a commencé (contenu numérique). « À vie » veut dire : tant que Les Minis Monstres proposent les tutos, avec un préavis de 6 mois et une copie à garder si cela devait s’arrêter (article 21 des conditions générales).\n\n")
        . "Bonne lecture,\nAlex et les Minis Monstres\n";
    $alt = function ($m) use ($txt) { $m->AltBody = $txt; };
    add_action('phpmailer_init', $alt, 20);
    wp_mail($u->user_email, $titre . ' : ' . $def['nom'], aled08e_mail_coque($titre, $h, 'Votre tuto « ' . $def['nom'] . ' » vous attend dans votre espace client.'),
        array_merge(['Content-Type: text/html; charset=UTF-8'], array_values(array_filter((array) aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'), function ($e) { return stripos($e, 'content-type:') !== 0; }))));
    remove_action('phpmailer_init', $alt, 20);
}

/* Le bouton « Acheter » : la case de renonciation cochée, puis la page de paiement Stripe */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_tuto_achat'])) return;
    $slug = aled08e_tuto_param(wp_unslash($_POST['tuto'] ?? ''));
    $back = function ($m) use ($slug) { wp_safe_redirect($slug !== '' ? aled08e_tuto_url($slug, ['tm' => $m, 'achat' => 1]) : aled08e_url(['tm' => $m]) . '#tutos', 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url($slug !== '' ? ['tuto' => $slug] : []), 303); exit; }
    if ($slug === '' || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_tuto'] ?? '')), 'aled08e_tuto_achat_' . $slug)) $back('erreur');
    if (!aled08e_is_client() && !current_user_can('manage_options')) $back('erreur');
    $uid = get_current_user_id();
    if (aled08e_tuto_acces($uid, $slug)) { wp_safe_redirect(aled08e_tuto_url($slug), 303); exit; }
    if (!aled08e_ventes_ouvertes()) $back('ventes');
    if (empty($_POST['renonce'])) $back('renonce');
    $r = (array) get_user_meta($uid, 'aled08_tutos_renonce', true);
    $r[$slug] = time();
    update_user_meta($uid, 'aled08_tutos_renonce', $r);
    $url = aled08e_tuto_checkout($uid, $slug);
    if (is_wp_error($url)) {
        $code = $url->get_error_message();
        if ($code === 'paiement') aled08e_stripe_journal_add('tuto : paiement refusé', $slug . ' (client ' . $uid . ') : ' . (string) $url->get_error_data());
        if ($code === 'deja') { wp_safe_redirect(aled08e_tuto_url($slug), 303); exit; }
        $back(in_array($code, ['ventes', 'stripe', 'occupe', 'paiement'], true) ? $code : 'erreur');
    }
    wp_redirect($url, 303); // phpcs:ignore WordPress.Security.SafeRedirect -- page de paiement Stripe
    exit;
}, 5);

/* Au retour de la page de paiement : la session est relue tout de suite, sans attendre le webhook */
add_action('template_redirect', function () {
    if (($_GET['tpaye'] ?? '') !== 'ok' || empty($_GET['session']) || !is_user_logged_in()) return;
    $slug = aled08e_tuto_param(wp_unslash($_GET['lire'] ?? ''));
    $sid = sanitize_text_field(wp_unslash($_GET['session']));
    $m = 'attente';
    if (preg_match('/^cs_[A-Za-z0-9_]+$/', $sid) && aled08e_stripe_ready()) {
        $s = aled08e_stripe_request('GET', '/v1/checkout/sessions/' . rawurlencode($sid), [], '', true);
        if (!is_wp_error($s) && (int) ($s['metadata']['user'] ?? 0) === get_current_user_id() && !empty($s['metadata']['aled08_tuto'])) {
            $slug = aled08e_tuto_param((string) $s['metadata']['aled08_tuto']) ?: $slug;
            aled08e_tuto_on_checkout($s);
        }
    }
    if ($slug !== '' && aled08e_tuto_achete(get_current_user_id(), $slug)) $m = 'ok';
    wp_safe_redirect($slug !== '' ? aled08e_tuto_url($slug, ['tm' => $m]) : aled08e_url(['tm' => $m]) . '#tutos', 303);
    exit;
}, 2);

/* Le lien public /mon-espace/?tuto=<slug> pour un compte connecté : le tuto dans « Mes tutos », l'achat en avant s'il est payant */
add_action('template_redirect', function () {
    if (!is_user_logged_in() || empty($_GET['tuto']) || ($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET' || !is_page('mon-espace')) return;
    $slug = aled08e_tuto_param(wp_unslash($_GET['tuto']));
    if ($slug === '') return;
    $extra = isset($_GET['mo']) ? ['mo' => sanitize_key(wp_unslash($_GET['mo']))] : [];
    wp_safe_redirect(aled08e_tuto_url($slug, (aled08e_tuto_acces(get_current_user_id(), $slug) ? [] : ['achat' => 1]) + $extra), 302);
    exit;
}, 3);

/* La connexion depuis la page d'un tuto (formulaire « J'ai déjà un compte ») : retour sur le tuto */
add_filter('wp_redirect', function ($loc) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08_login']) || empty($_POST['tuto'])) return $loc;
    $slug = aled08e_tuto_param(wp_unslash($_POST['tuto']));
    if ($slug === '' || strpos((string) $loc, aled08e_url()) !== 0) return $loc;
    if (strpos((string) $loc, 'connexion=') !== false) return add_query_arg('tuto', $slug, remove_query_arg('outil', (string) $loc));
    return aled08e_url(['tuto' => $slug]);
}, 20);

/* =========================================================================
 *  La page publique d'un tuto pour un visiteur pas connecté, et la lecture pour Alex (qui voit la gestion, pas l'espace)
 * ========================================================================= */
add_filter('pre_do_shortcode_tag', function ($out, $tag) {
    if ($tag !== 'aled08_espace' || $out !== false) return $out;
    if (!is_user_logged_in()) {
        $slug = aled08e_tuto_param(wp_unslash($_GET['tuto'] ?? ''));
        return $slug !== '' ? aled08e_tuto_porte_html($slug) : $out;
    }
    if (function_exists('aled08e_est_gerant') && aled08e_est_gerant() && (isset($_GET['lire']) || isset($_GET['tutos']))) {
        return '<section class="section section-app"><div class="container"><div class="app tu-gerant"><p class="tu-retour"><a class="btn btn-light btn-sm" href="' . esc_url(aled08e_url()) . '">' . aled08e_icon('house') . '<span>Retour à la gestion</span></a></p>'
            . aled08e_tutos_panel_html(get_current_user_id()) . '</div></div></section>';
    }
    return $out;
}, 10, 2);
add_action('wp_enqueue_scripts', function () {
    if (is_user_logged_in() || empty($_GET['tuto']) || !is_page('mon-espace') || aled08e_tuto_param(wp_unslash($_GET['tuto'])) === '') return;
    $theme = get_template_directory() . '/assets/css/espace.css';
    if (file_exists($theme)) wp_enqueue_style('aled08-espace', get_template_directory_uri() . '/assets/css/espace.css', ['aled08'], (string) filemtime($theme));
    elseif (file_exists(dirname(__DIR__) . '/espace.css')) wp_enqueue_style('aled08-espace', plugins_url('espace.css', ALED08E_FILE), ['aled08'], ALED08E_VERSION);
}, 20);

function aled08e_tuto_porte_html($slug) {
    $def = aled08e_tuto_def($slug);
    if (!$def) return '';
    $m = isset($_GET['inscription']) ? sanitize_key(wp_unslash($_GET['inscription'])) : '';
    $msgs = [
        'champs' => 'Indiquez votre prénom et une adresse e-mail valide.',
        'mdp_court' => 'Choisissez un mot de passe d’au moins 10 caractères.',
        'existe' => 'Cette adresse a déjà un compte : connectez-vous juste à côté. Mot de passe oublié ? Le lien est sous le formulaire.',
        'trop' => 'Trop d’essais depuis votre connexion. Réessayez dans une heure, ou écrivez-nous.',
        'erreur' => 'Le compte n’a pas pu être créé. Réessayez, ou écrivez-nous.',
    ];
    $alerte = isset($msgs[$m]) ? '<p class="form-alert" role="alert">' . esc_html($msgs[$m]) . '</p>' : '';
    $erreurLogin = isset($_GET['connexion']) ? '<p class="form-alert" role="alert">Adresse e-mail ou mot de passe incorrect. Réessayez, ou demandez un nouveau mot de passe.</p>' : '';
    $act = esc_url(aled08e_url());
    $gratuit = aled08e_tuto_gratuit($def);
    $n = aled08e_tuto_nb_pages($def);
    $ap = min($n, aled08e_tutos_offre()['apercuPages']);
    $g = aled08e_tutos_groupe($def['groupe'] ?? '');
    ob_start();
    ?>
<section class="section section-app mm-porte-outil tu-porte"><div class="container">
  <div class="mm-po-tete c-<?php echo esc_attr($def['color'] ?? 'lilac'); ?>">
    <div class="mm-po-art" aria-hidden="true"><span><?php echo aled08e_monster($def['monstre'] ?? 'mochi'); // phpcs:ignore ?></span></div>
    <div class="mm-po-txt">
      <p class="mm-po-sur"><?php echo esc_html('Mini Tuto · ' . $g['titre']); ?></p>
      <h2 class="h2"><?php echo esc_html($def['nom']); ?></h2>
      <p><?php echo esc_html($def['resume']); ?></p>
      <ul class="mm-po-points">
        <li><?php echo aled08e_icon('book-open'); // phpcs:ignore ?><span><?php echo esc_html($n . ' pages' . (!empty($def['duree']) ? ', environ ' . (int) $def['duree'] . ' minutes' : '') . ', à lire à votre rythme'); ?></span></li>
        <?php if ($gratuit) : ?>
        <li><?php echo aled08e_icon('gift'); // phpcs:ignore ?><span>Offert en entier : il suffit d’un compte gratuit</span></li>
        <?php else : ?>
        <li><?php echo aled08e_icon('euro'); // phpcs:ignore ?><span><?php echo esc_html(aled08e_tuto_prix_txt()); ?>, payé une fois, accès à vie</span></li>
        <?php if ($ap) : ?><li><?php echo aled08e_icon('eye'); // phpcs:ignore ?><span><?php echo esc_html($ap > 1 ? 'Les ' . $ap . ' premières pages offertes, pour essayer' : 'La première page offerte, pour essayer'); ?></span></li><?php endif; ?>
        <?php endif; ?>
        <li><?php echo aled08e_icon('check'); // phpcs:ignore ?><span>Votre progression gardée, page par page</span></li>
      </ul>
    </div>
  </div>
  <div class="login-wrap mm-po-forms">
    <div class="form-card login-card" id="inscription">
      <h2 class="h3"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?>Je crée mon compte</h2>
      <p class="mm-po-note"><?php echo esc_html($gratuit ? 'Un compte gratuit, et le tuto s’ouvre tout de suite. Pas besoin d’avoir un site chez nous.' : 'Un compte gratuit, puis le tuto s’ouvre en un clic après le paiement. Pas besoin d’avoir un site chez nous.'); ?></p>
      <?php echo $alerte; // phpcs:ignore ?>
      <form class="form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
        <input type="hidden" name="aled08e_inscription_outil" value="1"><input type="hidden" name="tuto" value="<?php echo esc_attr($slug); ?>">
        <?php wp_nonce_field('aled08e_inscription_outil', '_aled08e_insc'); ?>
        <div class="hp" aria-hidden="true"><label for="tu-web">Ne pas remplir</label><input id="tu-web" name="site_web" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="field"><label for="tu-prenom">Prénom</label><input id="tu-prenom" name="prenom" type="text" autocomplete="given-name" required maxlength="60"></div>
        <div class="field"><label for="tu-email">E-mail</label><input id="tu-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="tu-mdp">Mot de passe (10 caractères au moins)</label><input id="tu-mdp" name="mdp" type="password" autocomplete="new-password" required minlength="10"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit"><?php echo aled08e_icon('arrow-right'); // phpcs:ignore ?><span>Créer mon compte</span></button>
        <p class="form-note">Votre adresse sert seulement à votre compte (<a href="<?php echo esc_url(home_url('/politique-de-confidentialite/')); ?>">confidentialité</a>).</p>
      </form>
    </div>
    <div class="form-card login-card">
      <h2 class="h3"><?php echo aled08e_icon('circle-user'); // phpcs:ignore ?>J’ai déjà un compte</h2>
      <?php echo $erreurLogin; // phpcs:ignore ?>
      <form class="form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
        <input type="hidden" name="aled08_login" value="1"><input type="hidden" name="tuto" value="<?php echo esc_attr($slug); ?>">
        <div class="field"><label for="tu-log">E-mail ou identifiant</label><input id="tu-log" name="log" type="text" autocomplete="username" required></div>
        <div class="field"><label for="tu-pwd">Mot de passe</label><input id="tu-pwd" name="pwd" type="password" autocomplete="current-password" required></div>
        <label class="check"><input type="checkbox" name="rememberme" value="forever"><span>Rester connecté sur cet appareil</span></label>
        <button class="btn btn-light btn-lg btn-block" type="submit"><?php echo aled08e_icon('key-round'); // phpcs:ignore ?><span>Me connecter</span></button>
      </form>
      <p class="login-links"><a href="<?php echo esc_url(wp_lostpassword_url(aled08e_url(['mdp' => 'envoye']))); ?>">Mot de passe oublié ?</a></p>
    </div>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}

/* =========================================================================
 *  L'onglet « Mes tutos »
 * ========================================================================= */
function aled08e_tutos_flash_html() {
    $m = sanitize_key(wp_unslash($_GET['tm'] ?? ($_GET['mo'] ?? '')));
    if (($_GET['tpaye'] ?? '') === 'annule') $m = 'annule';
    $l = [
        'ok' => ['esp-empty', 'Merci ! Votre tuto est ouvert : bonne lecture. Un e-mail de confirmation et votre facture arrivent dans votre boîte.'],
        'attente' => ['esp-empty', 'Merci ! Votre paiement est en cours de confirmation : le tuto s’ouvre ici dans un instant. Rechargez la page dans une minute.'],
        'annule' => ['esp-warn', 'Le paiement n’a pas été fait : rien n’est acheté. Vous pouvez recommencer quand vous voulez.'],
        'renonce' => ['esp-warn', 'Cochez la case juste au-dessus du bouton : elle dit que vous voulez lire le tuto tout de suite.'],
        'ventes' => ['esp-warn', aled08e_ventes_message()],
        'stripe' => ['esp-warn', 'Le paiement en ligne n’est pas disponible pour le moment. Écrivez-nous, on s’en occupe.'],
        'paiement' => ['esp-warn', 'La page de paiement n’a pas pu s’ouvrir. Réessayez dans un instant, ou écrivez-nous.'],
        'occupe' => ['esp-warn', 'Un instant : votre demande précédente est encore en cours. Réessayez dans quelques secondes.'],
        'erreur' => ['esp-warn', 'Cela n’a pas marché. Rechargez la page et réessayez.'],
        'bienvenue' => ['esp-empty', 'Bienvenue chez les Minis Monstres ! Votre compte est prêt.'],
    ];
    return isset($l[$m]) ? '<p class="' . $l[$m][0] . '" role="status">' . esc_html($l[$m][1]) . '</p>' : '';
}
/* La petite barre de progression */
function aled08e_tuto_barre_html($pc, $attr = '') {
    $pc = max(0, min(100, (int) $pc));
    return '<div class="tu-barre"' . $attr . '><span class="tu-barre-l" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' . $pc . '"><span style="width:' . $pc . '%"></span></span><small><b data-tu-pc>' . $pc . '</b> % lu</small></div>';
}
/* Une carte du catalogue ou de « Mes tutos » */
function aled08e_tuto_carte_html($uid, $def) {
    $slug = $def['slug'];
    $n = aled08e_tuto_nb_pages($def);
    $acces = aled08e_tuto_acces($uid, $slug);
    $gratuit = aled08e_tuto_gratuit($def);
    $pg = aled08e_tuto_progres($uid, $slug);
    $pc = aled08e_tuto_pourcent($uid, $slug);
    $commence = $pg['le'] > 0;
    if ($gratuit) $badge = '<em class="mo-badge is-ok">' . aled08e_icon('gift') . 'Offert</em>';
    elseif (aled08e_tuto_achete($uid, $slug)) $badge = '<em class="mo-badge is-ok">' . aled08e_icon('check') . 'À vous, à vie</em>';
    elseif ($acces) $badge = '<em class="mo-badge is-ok">Administrateur</em>';
    else $badge = '';
    $h = '<article class="mo-carte tu-carte c-' . esc_attr(sanitize_html_class($def['color'] ?? 'lilac')) . ($acces ? ' is-pris' : '') . '">'
        . '<header class="mo-tete"><span class="mo-art" aria-hidden="true">' . aled08e_monster($def['monstre'] ?? 'mochi') . '</span><div class="mo-nom"><strong>' . esc_html($def['nom']) . '</strong><small>' . esc_html($n . ' pages' . (!empty($def['duree']) ? ' · ' . (int) $def['duree'] . ' min' : '') . (!empty($def['niveau']) ? ' · ' . $def['niveau'] : '')) . '</small></div>'
        . ($acces ? '' : '<span class="mo-prix"><b>' . esc_html(aled08e_tuto_prix_txt()) . '</b><small>accès à vie</small></span>') . '</header>'
        . $badge . '<p class="mo-court">' . esc_html($def['resume']) . '</p>';
    if ($acces && $commence) $h .= aled08e_tuto_barre_html($pc);
    $h .= '<div class="mo-actions">';
    if ($acces) {
        $h .= '<a class="btn btn-primary btn-sm" href="' . esc_url(aled08e_tuto_url($slug, [], aled08e_tuto_reprise($uid, $slug))) . '">' . aled08e_icon($commence ? 'play' : 'book-open') . '<span>' . ($pc >= 100 ? 'Relire' : ($commence ? 'Continuer' : 'Commencer')) . '</span><span class="sr-only"> : ' . esc_html($def['nom']) . '</span></a>';
    } else {
        $h .= '<a class="btn btn-primary btn-sm" href="' . esc_url(aled08e_tuto_url($slug, ['achat' => 1])) . '" data-achat>' . aled08e_icon('shopping-bag') . '<span>Acheter ' . esc_html(aled08e_tuto_prix_txt()) . '</span><span class="sr-only"> : ' . esc_html($def['nom']) . '</span></a>'
            . '<a class="link-btn" href="' . esc_url(aled08e_tuto_url($slug, [], 0)) . '">Lire l’aperçu<span class="sr-only"> : ' . esc_html($def['nom']) . '</span></a>';
    }
    return $h . '</div></article>';
}
/* L'encadré d'achat : le prix, ce qui est compris, la case obligatoire, le bouton */
function aled08e_tuto_achat_html($uid, $def, $cible = false) {
    $slug = $def['slug'];
    $n = aled08e_tuto_nb_pages($def);
    return '<section class="tu-achat c-' . esc_attr(sanitize_html_class($def['color'] ?? 'lilac')) . '" id="tu-achat"' . ($cible ? ' data-tu-cible' : '') . ' aria-labelledby="tu-achat-t">'
        . '<div class="tu-achat-tete"><span class="tu-achat-art" aria-hidden="true">' . aled08e_monster('mochi') . '</span><div><h3 id="tu-achat-t">Le tuto complet</h3><p class="tu-achat-prix"><b>' . esc_html(aled08e_tuto_prix_txt()) . '</b> <small>payé une fois · accès à vie</small></p></div></div>'
        . '<ul class="tu-achat-points"><li>' . aled08e_icon('book-open') . '<span>Les ' . (int) $n . ' pages, à lire à votre rythme, sur téléphone ou ordinateur</span></li>'
        . '<li>' . aled08e_icon('check') . '<span>Votre progression gardée : vous reprenez là où vous en étiez</span></li>'
        . '<li>' . aled08e_icon('receipt') . '<span>Une facture par e-mail, TVA non applicable (art. 293 B du CGI)</span></li></ul>'
        . (!aled08e_ventes_ouvertes() ? '<p class="esp-warn">' . aled08e_icon('clock') . '<span>' . esc_html(aled08e_ventes_message()) . '</span></p>' : '')
        . '<form class="tu-achat-form" method="post" action="' . esc_url(aled08e_url()) . '">'
        . '<input type="hidden" name="aled08e_tuto_achat" value="1"><input type="hidden" name="tuto" value="' . esc_attr($slug) . '">'
        . wp_nonce_field('aled08e_tuto_achat_' . $slug, '_aled08e_tuto', false, false)
        . '<label class="check tu-renonce"><input type="checkbox" name="renonce" value="1" required><span>Je veux accéder tout de suite au tuto et je reconnais perdre mon droit de rétractation dès que l’accès commence.</span></label>'
        . '<button class="btn btn-primary" type="submit" data-achat>' . aled08e_icon('credit-card') . '<span>Acheter pour ' . esc_html(aled08e_tuto_prix_txt()) . '</span></button>'
        . '<p class="tu-achat-note">Paiement sécurisé par Stripe. « À vie » : tant que Les Minis Monstres proposent les tutos, avec 6 mois de préavis et une copie à garder si cela s’arrêtait (<a href="' . esc_url(home_url('/conditions-generales/#21-les-minis-tutos')) . '">article 21 des conditions générales</a>).</p>'
        . '</form></section>';
}
/* La lecture d'un tuto : en-tête, sommaire, la page, « J'ai fini cette page », page précédente et suivante */
function aled08e_tuto_lecteur_html($uid, $slug) {
    $def = aled08e_tuto_def($slug);
    if (!$def) return '';
    $n = aled08e_tuto_nb_pages($def);
    $acces = aled08e_tuto_acces($uid, $slug);
    $gratuit = aled08e_tuto_gratuit($def);
    $ap = min($n, aled08e_tutos_offre()['apercuPages']);
    $tp = isset($_GET['tp']) ? (int) $_GET['tp'] - 1 : aled08e_tuto_reprise($uid, $slug);
    $i = max(0, min($n - 1, $tp));
    $lisible = aled08e_tuto_page_lisible($uid, $slug, $i);
    if ($lisible) aled08e_tuto_noter_lecture($uid, $slug, $i);
    $pg = aled08e_tuto_progres($uid, $slug);
    $pc = aled08e_tuto_pourcent($uid, $slug);
    $g = aled08e_tutos_groupe($def['groupe'] ?? '');
    $titres = array_map(function ($p) { return (string) ($p['titre'] ?? ''); }, (array) $def['pages']);
    $cible = !empty($_GET['achat']) && !$acces;

    $h = '<section class="tu-lecteur c-' . esc_attr(sanitize_html_class($def['color'] ?? 'lilac')) . '" data-tu-lecteur data-tuto="' . esc_attr($slug) . '">'
        . '<p class="tu-retour"><a class="link-btn" href="' . esc_url(aled08e_url()) . '#tutos">' . '<span class="tu-ico-retour">' . aled08e_icon('chevron-right') . '</span>' . '<span>Tous mes tutos</span></a></p>'
        . '<header class="tu-tete"><span class="tu-tete-art" aria-hidden="true">' . aled08e_monster($def['monstre'] ?? 'mochi') . '</span><div class="tu-tete-txt">'
        . '<p class="mm-po-sur">' . esc_html('Mini Tuto · ' . $g['titre']) . '</p><h3 class="tu-titre">' . esc_html($def['nom']) . '</h3><p>' . esc_html($def['resume']) . '</p>'
        . '<p class="tu-meta">' . esc_html($n . ' pages' . (!empty($def['duree']) ? ' · environ ' . (int) $def['duree'] . ' minutes' : '') . (!empty($def['niveau']) ? ' · ' . $def['niveau'] : '')) . '</p>'
        . ($acces ? aled08e_tuto_barre_html($pc, ' data-tu-barre') : '<p class="tu-apercu-note">' . aled08e_icon('eye') . '<span>' . esc_html($ap > 1 ? 'Aperçu : les ' . $ap . ' premières pages sont offertes.' : 'Aperçu : la première page est offerte.') . '</span></p>')
        . '</div></header>';
    if ($cible) $h .= aled08e_tuto_achat_html($uid, $def, true);

    // le sommaire
    $h .= '<details class="tu-sommaire"' . (!$lisible ? ' open' : '') . '><summary>' . aled08e_icon('list-checks') . '<span>Sommaire</span><small>page ' . ($i + 1) . ' sur ' . $n . '</small></summary><ol>';
    foreach ($titres as $k => $t) {
        $ok = aled08e_tuto_page_lisible($uid, $slug, $k);
        $fait = in_array($k, $pg['faites'], true);
        $etat = $fait ? aled08e_icon('circle-check') . '<span class="sr-only">(finie)</span>' : (!$ok ? aled08e_icon('lock') . '<span class="sr-only">(dans le tuto complet)</span>' : '<span class="tu-num" aria-hidden="true">' . ($k + 1) . '</span>');
        $h .= '<li class="' . ($k === $i ? 'is-ici' : '') . ($fait ? ' is-faite' : '') . (!$ok ? ' is-verrou' : '') . '" data-tu-som="' . (int) $k . '"><a href="' . esc_url(aled08e_tuto_url($slug, [], $k)) . '"' . ($k === $i ? ' aria-current="page"' : '') . '>' . $etat . '<span>' . esc_html($t) . '</span></a></li>';
    }
    $h .= '</ol></details>';

    // la page
    $nav = '<nav class="tu-nav" aria-label="Pages du tuto">'
        . ($i > 0 ? '<a class="btn btn-light btn-sm tu-prec" href="' . esc_url(aled08e_tuto_url($slug, [], $i - 1)) . '">' . '<span class="tu-ico-retour">' . aled08e_icon('chevron-right') . '</span>' . '<span>Page précédente</span></a>' : '<span></span>')
        . ($i < $n - 1 ? '<a class="btn btn-primary btn-sm tu-suiv" href="' . esc_url(aled08e_tuto_url($slug, [], $i + 1)) . '"><span>Page suivante</span>' . aled08e_icon('chevron-right') . '</a>' : '<a class="btn btn-primary btn-sm tu-suiv" href="' . esc_url(aled08e_url()) . '#tutos"><span>Tous mes tutos</span>' . aled08e_icon('chevron-right') . '</a>')
        . '</nav>';
    if ($lisible) {
        $corps = aled08e_tuto_page_html($uid, $slug, $i);
        if ($corps === '') $corps = '<p class="mm-vide">' . aled08e_monster('pense') . '<span>Cette page est en cours de mise en ligne. Revenez dans un petit moment.</span></p>';
        $fait = in_array($i, $pg['faites'], true);
        $h .= '<article class="tu-page" aria-labelledby="tu-page-t"><p class="tu-page-num">Page ' . ($i + 1) . ' sur ' . $n . '</p><h4 class="tu-page-t" id="tu-page-t">' . esc_html($titres[$i] ?? '') . '</h4>'
            . '<div class="tu-corps">' . $corps . '</div>'
            . '<form class="tu-fait" method="post" action="' . esc_url(aled08e_url()) . '" data-tu-fait>'
            . '<input type="hidden" name="aled08e_tuto_page" value="1"><input type="hidden" name="tuto" value="' . esc_attr($slug) . '"><input type="hidden" name="page" value="' . (int) $i . '">'
            . '<input type="hidden" name="_n" value="' . esc_attr(wp_create_nonce('aled08e_tuto_page')) . '">'
            . '<label class="check tu-fait-case"><input type="checkbox" name="fait" value="1"' . ($fait ? ' checked' : '') . '><span>J’ai fini cette page</span></label>'
            . '<button class="btn btn-light btn-sm" type="submit" data-tu-enreg>Enregistrer</button></form>'
            . $nav . '</article>';
        if (!$acces && $i === $ap - 1 && !$cible) $h .= '<div class="tu-suite"><p><b>La suite vous attend.</b> ' . esc_html(($n - $ap) . ' page' . ($n - $ap > 1 ? 's' : '') . ' de plus, pour aller jusqu’au bout.') . '</p></div>' . aled08e_tuto_achat_html($uid, $def);
    } else {
        $h .= '<article class="tu-page tu-verrou" aria-labelledby="tu-page-t"><p class="tu-page-num">Page ' . ($i + 1) . ' sur ' . $n . '</p><h4 class="tu-page-t" id="tu-page-t">' . esc_html($titres[$i] ?? '') . '</h4>'
            . '<p class="tu-verrou-txt">' . aled08e_icon('lock') . '<span>Cette page fait partie du tuto complet. ' . esc_html($gratuit ? '' : 'Pour ' . aled08e_tuto_prix_txt() . ', payé une fois, vous avez toutes les pages, pour toujours.') . '</span></p></article>';
        if (!$cible) $h .= aled08e_tuto_achat_html($uid, $def);
    }
    return $h . '</section>';
}
/* La carte « Reprendre où j'en étais » : le dernier tuto ouvert, pas encore fini */
function aled08e_tutos_reprise_html($uid) {
    $best = null;
    foreach (aled08e_tutos_progres_tout($uid) as $slug => $p) {
        if (!aled08e_tuto_def($slug) || !aled08e_tuto_acces($uid, $slug) || aled08e_tuto_pourcent($uid, $slug) >= 100) continue;
        if (!$best || (int) ($p['le'] ?? 0) > $best[1]) $best = [$slug, (int) ($p['le'] ?? 0)];
    }
    if (!$best) return '';
    $def = aled08e_tuto_def($best[0]);
    $i = aled08e_tuto_reprise($uid, $best[0]);
    return '<a class="tu-reprise c-' . esc_attr(sanitize_html_class($def['color'] ?? 'lilac')) . '" href="' . esc_url(aled08e_tuto_url($best[0], [], $i)) . '"><span class="tu-reprise-art" aria-hidden="true">' . aled08e_monster($def['monstre'] ?? 'mochi') . '</span>'
        . '<span class="tu-reprise-txt"><small>Reprendre où j’en étais</small><strong>' . esc_html($def['nom']) . '</strong><span>' . esc_html('Page ' . ($i + 1) . ' : ' . ((string) ($def['pages'][$i]['titre'] ?? ''))) . '</span></span>'
        . aled08e_tuto_barre_html(aled08e_tuto_pourcent($uid, $best[0])) . '<span class="btn btn-primary btn-sm">' . aled08e_icon('play') . '<span>Reprendre</span></span></a>';
}
function aled08e_tutos_panel_html($uid) {
    $uid = (int) $uid;
    $o = aled08e_tutos_offre();
    $lire = aled08e_tuto_param(wp_unslash($_GET['lire'] ?? ''));
    $h = '<h2 class="app-h">Mes tutos</h2>';
    $liste = aled08e_tutos_liste();
    if (!$liste) return $h . '<p class="mm-vide">' . aled08e_monster('mochi') . '<span>Mochi range les derniers tutos : ils arrivent ici très bientôt. Des pas à pas clairs, pour être vu, attirer des clients et gagner du temps.</span></p>';
    $h .= aled08e_tutos_flash_html();
    if ($lire !== '') return $h . aled08e_tuto_lecteur_html($uid, $lire) . aled08e_tutos_js();
    $h .= '<p class="app-p">' . esc_html(($o['slogan'] !== '' ? $o['slogan'] . ' : d' : 'D') . 'es pas à pas complets, page par page, pour être vu, attirer des clients et gagner du temps. ' . aled08e_tuto_prix_txt() . ' le tuto, payé une fois, à vous pour toujours. Certains sont offerts.') . '</p>';
    if (!aled08e_ventes_ouvertes()) $h .= '<p class="esp-warn mo-ventes">' . aled08e_icon('clock') . '<span>' . esc_html(aled08e_ventes_message()) . '</span></p>';
    $h .= aled08e_tutos_reprise_html($uid);
    $miens = $offerts = [];
    $catalogue = [];
    foreach ($liste as $t) {
        if (aled08e_tuto_achete($uid, $t['slug'])) $miens[] = $t;
        elseif (aled08e_tuto_gratuit($t)) $offerts[] = $t;
        else $catalogue[$t['groupe'] ?? ''][] = $t;
    }
    $grille = function ($l) use ($uid) { return '<div class="mo-grille tu-grille">' . implode('', array_map(function ($t) use ($uid) { return aled08e_tuto_carte_html($uid, $t); }, $l)) . '</div>'; };
    if ($miens) $h .= '<p class="app-sub">' . aled08e_icon('check') . ' Mes tutos achetés</p>' . $grille($miens);
    if ($offerts) $h .= '<p class="app-sub">' . aled08e_icon('gift') . ' Les tutos offerts</p>' . $grille($offerts);
    if ($catalogue) {
        $h .= '<p class="app-sub">' . aled08e_icon('book-open') . ' ' . ($miens ? 'Les autres tutos' : 'Tous les tutos') . '</p>';
        foreach ((array) (aled08e_data()['tutosGroupes'] ?? []) as $gr) {
            if (empty($catalogue[$gr['id']])) continue;
            $h .= '<h3 class="tu-groupe c-' . esc_attr(sanitize_html_class($gr['color'] ?? 'lilac')) . '">' . aled08e_icon($gr['icon'] ?? 'book-open') . '<span>' . esc_html($gr['titre']) . '</span></h3>' . $grille($catalogue[$gr['id']]);
            unset($catalogue[$gr['id']]);
        }
        foreach ($catalogue as $l) $h .= $grille($l); // un thème inconnu : à la fin
    }
    $h .= '<p class="app-note mo-pied">' . aled08e_icon('receipt') . '<span>Chaque tuto se paie une fois, par carte, avec sa facture. Pas d’abonnement. Les premières pages de chaque tuto sont offertes : lisez-les avant de choisir.</span></p>';
    return $h . aled08e_tutos_js();
}
/* Le petit script de l'onglet : la case « J'ai fini cette page » enregistrée sans recharger, l'achat montré */
function aled08e_tutos_js() {
    $ajax = esc_js(admin_url('admin-ajax.php'));
    return '<script>(function(){var c=document.querySelector("[data-tu-cible]");if(c){window.addEventListener("load",function(){setTimeout(function(){var p=c.closest("[role=tabpanel]");if(p&&p.hidden)return;var e=document.querySelector(".site-header");window.scrollBy({top:c.getBoundingClientRect().top-((e?e.offsetHeight:70)+16),behavior:"smooth"});},250);});}'
        . 'document.querySelectorAll("form[data-tu-fait]").forEach(function(f){var b=f.querySelector("[data-tu-enreg]"),k=f.querySelector("input[name=fait]");if(!k||!window.fetch)return;if(b)b.hidden=true;'
        . 'k.addEventListener("change",function(){var d=new FormData(f);d.append("action","aled08e_tuto_page");if(!k.checked)d.delete("fait");k.disabled=true;'
        . 'fetch("' . $ajax . '",{method:"POST",credentials:"same-origin",body:d}).then(function(r){return r.json();}).then(function(j){k.disabled=false;if(!j||!j.success){k.checked=!k.checked;return;}'
        . 'document.querySelectorAll("[data-tu-barre]").forEach(function(x){var s=x.querySelector(".tu-barre-l span"),n=x.querySelector("[data-tu-pc]"),l=x.querySelector("[role=progressbar]");if(s)s.style.width=j.data.pourcent+"%";if(n)n.textContent=j.data.pourcent;if(l)l.setAttribute("aria-valuenow",j.data.pourcent);});'
        . 'var li=document.querySelector("[data-tu-som=\""+f.page.value+"\"]");if(li)li.classList.toggle("is-faite",k.checked);'
        . 'if(k.checked){var s=document.querySelector(".tu-suiv");if(s){s.classList.add("is-coucou");}}}).catch(function(){k.disabled=false;k.checked=!k.checked;});});});})();</script>';
}

/* La carte « Mini Tuto » de l'accueil (includes/abonnements-outils.php, cartes des ateliers) */
function aled08e_tutos_carte_accueil_html($uid, $a) {
    if (!aled08e_tutos_liste()) return '';
    $n = count(array_filter(aled08e_tutos_liste(), function ($t) use ($uid) { return aled08e_tuto_achete($uid, $t['slug']); }));
    $sub = $n ? $n . ' tuto' . ($n > 1 ? 's' : '') . ' à vous' : count(aled08e_tutos_liste()) . ' tutos, ' . aled08e_tuto_prix_txt() . ' chacun, certains offerts';
    return '<article class="mm-carte c-' . esc_attr($a['color'] ?? 'lilac') . '"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">' . aled08e_monster($a['monstre'] ?? 'mochi') . '</span><div><strong>' . esc_html($a['label'] ?? 'Mini Tuto') . '</strong><small>' . esc_html($sub) . '</small></div></div>'
        . '<button type="button" class="btn btn-light btn-sm" data-go="tutos">' . aled08e_icon('book-open') . '<span>' . ($n ? 'Mes tutos' : 'Découvrir les tutos') . '</span></button></article>';
}

/* =========================================================================
 *  Pour Alex : les tutos d'un client (fiche client), offrir ou retirer un tuto
 * ========================================================================= */
function aled08e_tutos_client_txt($uid) {
    $t = [];
    foreach (aled08e_tutos_achats($uid) as $slug => $a) {
        $def = aled08e_tuto_def($slug);
        $t[] = ($def ? $def['nom'] : $slug) . ' (' . (($a['par'] ?? '') === 'alex' ? 'offert' : 'acheté') . ' le ' . wp_date('j F Y', (int) ($a['le'] ?? 0)) . ')';
    }
    return implode(', ', $t);
}
add_action('show_user_profile', 'aled08e_tutos_fiche', 12);
add_action('edit_user_profile', 'aled08e_tutos_fiche', 12);
function aled08e_tutos_fiche($user) {
    if (!current_user_can('edit_users') || !is_object($user)) return;
    $payants = array_filter(aled08e_tutos_liste(), function ($t) { return !aled08e_tuto_gratuit($t); });
    if (!$payants) return;
    $achats = aled08e_tutos_achats($user->ID);
    echo '<h2>Minis Tutos</h2><table class="form-table" role="presentation"><tr><th>Tutos de ce compte</th><td><fieldset>';
    foreach ($payants as $t) {
        $a = $achats[$t['slug']] ?? null;
        $d = $a ? (($a['par'] ?? '') === 'alex' ? 'offert' : 'acheté') . ' le ' . wp_date('j F Y à H:i', (int) $a['le']) . (!empty($a['montant']) ? ', ' . aled08e_euro_txt($a['montant'] / 100) : '') . (!empty($a['session']) ? ', ' . $a['session'] : '') . (!empty($a['facture']) ? ', facture ' . $a['facture'] : '') : '';
        echo '<label style="display:block;margin:0 0 6px"><input type="checkbox" name="aled08e_tutos[]" value="' . esc_attr($t['slug']) . '"' . checked((bool) $a, true, false) . '> ' . esc_html($t['nom']) . ($d !== '' ? ' <span class="description">(' . esc_html($d) . ')</span>' : '') . '</label>';
    }
    echo '<input type="hidden" name="aled08e_tutos_fiche" value="1"><p class="description">Cocher : offrir le tuto (le client reçoit un e-mail). Décocher : retirer l’accès, par exemple après un remboursement fait dans Stripe.</p></fieldset></td></tr></table>';
}
add_action('personal_options_update', 'aled08e_tutos_fiche_sauver');
add_action('edit_user_profile_update', 'aled08e_tutos_fiche_sauver');
function aled08e_tutos_fiche_sauver($uid) {
    if (empty($_POST['aled08e_tutos_fiche']) || !current_user_can('edit_users') || !current_user_can('edit_user', $uid)) return; // nonce : vérifié par WordPress (update-user_<id>)
    $voulus = array_filter(array_map('aled08e_tuto_param', array_map('wp_unslash', (array) ($_POST['aled08e_tutos'] ?? []))));
    foreach (aled08e_tutos_liste() as $t) {
        if (aled08e_tuto_gratuit($t)) continue;
        $a = aled08e_tuto_achete($uid, $t['slug']);
        if (in_array($t['slug'], $voulus, true) && !$a) aled08e_tuto_ouvrir($uid, $t['slug'], ['par' => 'alex']);
        elseif (!in_array($t['slug'], $voulus, true) && $a) aled08e_tuto_fermer($uid, $t['slug']);
    }
}
