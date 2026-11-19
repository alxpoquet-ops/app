<?php
/**
 * Les Minis Monstres Espace client : le client paie tout de suite ce qu'il commande (18 novembre 2026).
 * - Un extra payé une fois (page de visibilité Google, article, prise de rendez-vous…) ou la case « en 24 heures » : la demande est
 *   gardée en brouillon, le client paie sur la page sécurisée de Stripe, puis la demande part chez Alex (e-mail, Cerise, Lumi).
 * - Des emplacements d'articles en plus : débloqués dès que le paiement est reçu.
 * - Un extra au mois : la part du mois en cours est facturée et prélevée tout de suite (Stripe, proration « always_invoice »),
 *   voir includes/changer.php.
 * Le paiement est confirmé deux fois : au retour du client (lecture de la session Stripe) et par le webhook. Le traitement
 * ne se fait qu'une fois (méta _aled08_paye_session / liste aled08_sessions_payees).
 * Sans Stripe (clés absentes), rien ne change : Alex facture à la main et il est prévenu par e-mail.
 */
defined('ABSPATH') || exit;

/* Le paiement direct est-il possible ? */
function aled08e_pd_pret() { return function_exists('aled08e_stripe_ready') && aled08e_stripe_ready(); }

/* Une page de paiement Stripe pour ce client : [lignes [nom, euros, quantité]], métadonnées, onglet de retour. Rend l'adresse, ou WP_Error. */
function aled08e_pd_session($uid, $lignes, $meta, $onglet, $sub = '') {
    $u = get_userdata($uid);
    if (!$u) return new WP_Error('aled08_pd', 'Compte inconnu.');
    $items = [];
    foreach ($lignes as [$nom, $euros, $q]) $items[] = ['quantity' => max(1, (int) $q), 'price_data' => ['currency' => 'eur', 'unit_amount' => aled08e_stripe_cents($euros), 'product_data' => ['name' => mb_substr($nom, 0, 250)]]];
    $retour = ['paye' => 'ok'];
    if ($sub) $retour['sub'] = $sub;
    $params = [
        'mode' => 'payment',
        'locale' => 'fr',
        'client_reference_id' => 'u' . (int) $uid,
        'metadata' => ['aled08_direct' => (string) ($meta['type'] ?? ''), 'user' => (string) $uid] + array_map('strval', $meta),
        'line_items' => $items,
        'invoice_creation' => ['enabled' => 'true', 'invoice_data' => ['footer' => aled08e_stripe_footer()]],
        'success_url' => add_query_arg($retour, aled08e_url()) . '&session={CHECKOUT_SESSION_ID}#' . $onglet,
        'cancel_url' => aled08e_url(['paye' => 'annule'] + ($sub ? ['sub' => $sub] : [])) . '#' . $onglet,
    ];
    $cus = aled08e_meta($uid, 'stripe_customer');
    if ($cus) $params['customer'] = $cus;
    else { $params['customer_email'] = $u->user_email; $params['customer_creation'] = 'always'; }
    $r = aled08e_stripe_request('POST', '/v1/checkout/sessions', $params, 'direct-' . $uid . '-' . wp_generate_password(12, false));
    if (is_wp_error($r)) return $r;
    if (empty($r['url'])) return new WP_Error('aled08_pd', 'Stripe n’a pas renvoyé d’adresse de paiement.');
    return (string) $r['url'];
}

/* Une session payée : on fait ce qui était payé (une seule fois par session) */
function aled08e_pd_on_paye($s) {
    $sid = (string) ($s['id'] ?? '');
    if (($s['payment_status'] ?? '') !== 'paid' || $sid === '') return 'pas encore payé';
    $type = (string) ($s['metadata']['aled08_direct'] ?? '');
    $uid = (int) ($s['metadata']['user'] ?? 0);
    if (!$uid) return 'client inconnu';
    $faites = get_user_meta($uid, 'aled08_sessions_payees', true);
    $faites = is_array($faites) ? $faites : [];
    if (in_array($sid, $faites, true)) return 'déjà traité';
    $faites[] = $sid;
    update_user_meta($uid, 'aled08_sessions_payees', array_slice($faites, -200));
    $cus = aled08e_stripe_id($s['customer'] ?? '');
    if ($cus && aled08e_meta($uid, 'stripe_customer') === '' && function_exists('aled08e_stripe_noter_customer')) aled08e_stripe_noter_customer($uid, $cus);
    $u = get_userdata($uid);
    $montant = aled08e_euro_txt(((int) ($s['amount_total'] ?? 0)) / 100);

    if ($type === 'demande') {
        $pid = (int) ($s['metadata']['demande'] ?? 0);
        $p = get_post($pid);
        if (!$p || (int) $p->post_author !== $uid) return 'demande inconnue';
        wp_update_post(['ID' => $pid, 'post_status' => 'private']);
        update_post_meta($pid, '_aled08_paye_session', $sid);
        update_post_meta($pid, '_aled08_paye_le', time());
        foreach ((array) get_post_meta($pid, '_aled08_extras', true) as $x) update_post_meta($pid, '_aled08_extra_facture_' . $x, 'payé par carte (' . $sid . ')');
        $d = get_post_meta($pid, '_aled08_differe', true);
        if (is_array($d) && ($d['par'] ?? '') !== 'lia') wp_mail(aled08e_to(), (string) $d['sujet'], (string) $d['corps'] . "\nPAYÉ PAR CARTE : " . $montant . ".\n", aled08e_mail_headers((string) ($d['from'] ?? '')));
        delete_post_meta($pid, '_aled08_differe');
        do_action('aled08e_demande_creee', $pid, (string) get_post_meta($pid, '_aled08_par', true), $uid);
        return 'demande ' . $pid . ' payée';
    }
    if ($type === 'emplacements') {
        $q = max(1, (int) ($s['metadata']['quantite'] ?? 1));
        update_user_meta($uid, 'aled08_slots_achetes', (int) get_user_meta($uid, 'aled08_slots_achetes', true) + $q);
        wp_mail(aled08e_to(), 'Emplacements d’articles payés : ' . ($u ? $u->display_name : '#' . $uid), ($u ? $u->display_name : 'Le client') . ' a payé ' . $q . ' emplacement(s) d’articles en plus (' . $montant . ', par carte).' . "\n", aled08e_mail_headers());
        return $q . ' emplacement(s) débloqué(s)';
    }
    return 'type inconnu';
}

/* Au retour de Stripe : on lit la session tout de suite (sans attendre le webhook) */
add_action('template_redirect', function () {
    if (($_GET['paye'] ?? '') !== 'ok' || empty($_GET['session']) || !is_user_logged_in() || !aled08e_pd_pret()) return;
    $sid = sanitize_text_field(wp_unslash($_GET['session']));
    if (!preg_match('/^cs_[A-Za-z0-9_]+$/', $sid)) return;
    $s = aled08e_stripe_request('GET', '/v1/checkout/sessions/' . rawurlencode($sid), [], '', true);
    if (is_wp_error($s) || (int) ($s['metadata']['user'] ?? 0) !== get_current_user_id()) return;
    aled08e_pd_on_paye($s);
}, 2);

/* Le message affiché au retour */
function aled08e_pd_flash_html() {
    $p = sanitize_key(wp_unslash($_GET['paye'] ?? ''));
    if ($p === 'ok') return '<p class="esp-empty" role="status">Merci, votre paiement est bien reçu ! Votre commande est lancée : vous la suivez ici.</p>';
    if ($p === 'annule') return '<p class="esp-warn" role="status">Le paiement n’a pas été fait : rien n’est commandé. Vous pouvez recommencer quand vous voulez.</p>';
    return '';
}
