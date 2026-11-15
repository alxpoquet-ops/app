<?php
/**
 * Alex & Lia Espace client : ajouter ou retirer des extras à tout moment, depuis « Abonnement et factures ».
 * Il n'y a qu'un abonnement : seuls les extras (options payées chaque mois) changent.
 * Si un abonnement Stripe tourne, il est mis à jour (sans prorata : le nouveau prix s'applique à la prochaine échéance).
 * Les options « boutique » (stock, comptes clients) ne sont proposées que pour une boutique en ligne.
 */
defined('ABSPATH') || exit;

/* Type du site du client (dernière commande), pour filtrer les options réservées aux boutiques */
function aled08e_changer_type($uid) {
    foreach (aled08e_cmd_user_commandes($uid) as $c) if ($c['statut'] !== 'annulee' && $c['type']) return $c['type'];
    return aled08e_meta($uid, 'boutique') === '1' ? 'boutique' : ''; // compte créé à la main : la case « Boutique en ligne » de sa fiche
}
function aled08e_changer_options_possibles($uid) {
    $type = aled08e_changer_type($uid);
    $out = [];
    foreach (aled08e_data()['options'] as $o) {
        if ((float) $o['month'] <= 0) continue; // les options payées une fois se demandent par message
        if (!empty($o['types']) && !in_array($type, (array) $o['types'], true)) continue;
        $out[] = $o;
    }
    return $out;
}

/* Mise à jour de l'abonnement Stripe : forfait remplacé, options retirées puis ajoutées (lignes du reste lissé intactes) */
function aled08e_stripe_changer_abonnement($uid, $forfaitId, $optIds) {
    $sub = aled08e_meta($uid, 'stripe_subscription');
    if ($sub === '' || !aled08e_stripe_ready()) return 'sans_stripe';
    $s = aled08e_stripe_request('GET', '/v1/subscriptions/' . rawurlencode($sub), ['expand' => ['items.data.price.product']]);
    if (is_wp_error($s)) return $s;
    $items = $s['items']['data'] ?? [];
    if (!$items) return new WP_Error('aled08_stripe', 'Abonnement vide.');
    $D = aled08e_data();
    $interval = $items[0]['price']['recurring']['interval'] ?? 'month';
    $mult = $interval === 'year' ? max(1, 12 - (int) $D['moisOfferts']) : 1;
    $produit = function ($nom, $tag) {
        $p = aled08e_stripe_request('POST', '/v1/products', ['name' => $nom, 'metadata' => ['aled08' => $tag]]);
        return is_wp_error($p) ? $p : (string) $p['id'];
    };
    $prix = function ($product, $euros) use ($interval) {
        return ['currency' => 'eur', 'product' => $product, 'unit_amount' => aled08e_stripe_cents($euros), 'recurring' => ['interval' => $interval]];
    };
    $f = aled08e_forfait($forfaitId);
    $forfaitFait = false;
    foreach ($items as $it) {
        $tag = $it['price']['product']['metadata']['aled08'] ?? '';
        if ($tag === 'forfait') {
            $pid = $produit(aled08e_abo_nom($f) . ($interval === 'year' ? ' (à l’année, ' . (int) $D['moisOfferts'] . ' mois offerts)' : ' (au mois)'), 'forfait');
            if (is_wp_error($pid)) return $pid;
            $r = aled08e_stripe_request('POST', '/v1/subscription_items/' . rawurlencode($it['id']), ['price_data' => $prix($pid, $f['month'] * $mult), 'proration_behavior' => 'none']);
            if (is_wp_error($r)) return $r;
            $forfaitFait = true;
        } elseif ($tag === 'option') {
            $r = aled08e_stripe_request('DELETE', '/v1/subscription_items/' . rawurlencode($it['id']), ['proration_behavior' => 'none']);
            if (is_wp_error($r)) return $r;
        }
    }
    $ajout = function ($nom, $tag, $euros) use ($sub, $produit, $prix) {
        $pid = $produit($nom, $tag);
        if (is_wp_error($pid)) return $pid;
        return aled08e_stripe_request('POST', '/v1/subscription_items', ['subscription' => $sub, 'price_data' => $prix($pid, $euros), 'proration_behavior' => 'none']);
    };
    if (!$forfaitFait) { $r = $ajout(aled08e_abo_nom($f), 'forfait', $f['month'] * $mult); if (is_wp_error($r)) return $r; }
    foreach ($optIds as $oid) {
        $o = aled08e_option($oid);
        if (!$o || $o['month'] <= 0) continue;
        $r = $ajout('Option : ' . $o['name'], 'option', $o['month'] * $mult);
        if (is_wp_error($r)) return $r;
    }
    return 'stripe';
}

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_changer'])) return;
    $back = function ($m) { wp_safe_redirect(aled08e_url(['m' => $m]) . '#forfait', 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_changer'] ?? '')), 'aled08e_changer')) $back('changer_erreur');
    $uid = get_current_user_id();
    $u = wp_get_current_user();
    $forfait = sanitize_key(wp_unslash($_POST['forfait'] ?? ''));
    if (!aled08e_cmd_forfait_existe($forfait)) $forfait = aled08e_forfait('')['id']; // un seul abonnement : c'est toujours lui
    $possibles = array_column(aled08e_changer_options_possibles($uid), 'id');
    $voulues = array_values(array_intersect($possibles, array_map('sanitize_key', (array) wp_unslash($_POST['options'] ?? []))));
    $avant = aled08e_forfait(aled08e_meta($uid, 'forfait'))['name'];
    $avantOpts = array_values(array_filter($possibles, function ($id) use ($uid) { return aled08e_meta($uid, $id) === '1'; }));
    if ($voulues === $avantOpts && aled08e_forfait(aled08e_meta($uid, 'forfait'))['id'] === $forfait) $back('changer_rien');
    $res = aled08e_meta($uid, 'offert') === '1' ? 'offert' : aled08e_stripe_changer_abonnement($uid, $forfait, $voulues);
    if (is_wp_error($res)) {
        wp_mail(aled08e_to(), 'Changement d’extras à faire à la main', $u->display_name . ' veut ces extras : ' . (implode(', ', $voulues) ?: 'aucune') . ".\nStripe a répondu : " . $res->get_error_message() . "\nFiche : " . admin_url('user-edit.php?user_id=' . $uid) . "\n", aled08e_mail_headers());
        $back('changer_erreur');
    }
    // Jetons Lia : le changement est facturé à la prochaine échéance, il compte donc à partir du mois suivant.
    // Jusque-là, le client garde les jetons du forfait qu'il avait au début du mois.
    if (function_exists('aled08e_jl_mois')) {
        $fige = get_user_meta($uid, 'aled08_jl_fige', true);
        if (!is_array($fige) || ($fige['m'] ?? '') !== wp_date('Y-m')) update_user_meta($uid, 'aled08_jl_fige', ['m' => wp_date('Y-m'), 'n' => aled08e_jl_mois($uid, aled08e_forfait(aled08e_meta($uid, 'forfait')))]);
    }
    update_user_meta($uid, 'aled08_forfait', $forfait);
    foreach ($possibles as $id) update_user_meta($uid, 'aled08_' . $id, in_array($id, $voulues, true) ? '1' : '');
    $apres = aled08e_forfait($forfait)['name'];
    wp_mail(aled08e_to(), 'Un client a changé ses extras', $u->display_name . ' : extras avant : ' . (implode(', ', $avantOpts) ?: 'aucun') . '. Extras maintenant : ' . (implode(', ', $voulues) ?: 'aucune') . '.' . ($res === 'stripe' ? ' Abonnement Stripe mis à jour (à la prochaine échéance).' : ($res === 'offert' ? ' Abonnement offert : rien à facturer.' : ' Pas d’abonnement Stripe : à facturer à la main si besoin.')) . "\n", aled08e_mail_headers());
    $back('changer_ok');
}, 5);

/* Le formulaire, dans « Abonnement et factures » : les extras à ajouter ou retirer */
function aled08e_changer_html($uid) {
    $opts = aled08e_changer_options_possibles($uid);
    if (!$opts) return '';
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mult = $annuel ? max(1, 12 - (int) aled08e_data()['moisOfferts']) : 1;
    $h = '<details class="esp-changer"><summary>' . aled08e_icon('refresh-cw') . '<span>Ajouter ou retirer des extras</span></summary>'
        . '<form method="post" action="' . esc_url(aled08e_url()) . '"><input type="hidden" name="aled08e_changer" value="1">' . wp_nonce_field('aled08e_changer', '_aled08e_changer', true, false)
        . '<input type="hidden" name="forfait" value="' . esc_attr(aled08e_forfait(aled08e_meta($uid, 'forfait'))['id']) . '">'
        . '<p class="app-note">Quand vous voulez, sans frais et sans engagement. Le nouveau prix s’applique à votre prochaine échéance.</p><div class="esp-changer-list">';
    foreach ($opts as $o) {
        $h .= '<label class="esp-reste"><input type="checkbox" name="options[]" value="' . esc_attr($o['id']) . '"' . checked(aled08e_meta($uid, $o['id']), '1', false) . '><span><strong>' . esc_html($o['name']) . ' · ' . aled08e_euro($o['month'] * $mult) . ' ' . ($annuel ? 'par an' : 'par mois') . '</strong>'
            . (!empty($o['desc']) ? '<small>' . esc_html($o['desc']) . '</small>' : '') . '</span></label>';
    }
    return $h . '</div><button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form></details>';
}
