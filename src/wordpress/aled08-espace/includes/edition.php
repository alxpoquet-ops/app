<?php
/**
 * Les Minis Monstres Espace client : « Modifier mon site moi-même ».
 * Le client ouvre son propre site en mode modification : un clic sur un texte ou une photo, il le change, c'est en ligne.
 * L'application fabrique un lien signé avec la clé partagée du connecteur (valable 10 minutes, une seule fois) ;
 * le connecteur du site (2.12.0 et plus) le vérifie et ouvre le mode modification pour 2 heures, dans ce navigateur.
 * Pas de compte WordPress : seuls les textes et les photos du contenu des pages se changent ; le reste passe par une demande.
 */
defined('ABSPATH') || exit;

/* Le site du client sait-il le faire ? (connecteur 2.12.0 et plus, vérifié au plus toutes les 6 heures) */
function aled08e_edition_dispo($uid) {
    if (aled08e_meta($uid, 'lia_url') === '' || aled08e_meta($uid, 'lia_secret') === '') return false;
    $k = 'aled08e_edition_' . (int) $uid;
    $v = get_transient($k);
    if ($v === false) {
        $i = aled08e_lia_appel($uid, 'infos');
        $v = (!is_wp_error($i) && !empty($i['edition'])) ? 'oui' : 'non';
        set_transient($k, $v, is_wp_error($i) ? 15 * MINUTE_IN_SECONDS : 6 * HOUR_IN_SECONDS);
    }
    return $v === 'oui';
}
/* Le lien d'ouverture, signé : CHARGE.SIGNATURE, charge = {exp, n} */
function aled08e_edition_lien($uid, $chemin = '/') {
    $url = untrailingslashit(aled08e_meta($uid, 'lia_url'));
    $secret = aled08e_meta($uid, 'lia_secret');
    if ($url === '' || $secret === '') return new WP_Error('aled08_edition', 'Site non relié.');
    $charge = rtrim(strtr(base64_encode(wp_json_encode(['exp' => time() + 600, 'n' => bin2hex(random_bytes(16))])), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', 'alexlia-edition|jeton|' . $charge, $secret);
    $chemin = '/' . ltrim((string) $chemin, '/');
    return $url . $chemin . (strpos($chemin, '?') === false ? '?' : '&') . 'alexlia_editer=' . $charge . '.' . $sig;
}

/* Le bouton de l'application : un formulaire, pour que le lien soit fabriqué au moment du clic */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_editer'])) return;
    if (!is_user_logged_in() || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_editer'] ?? '')), 'aled08e_editer')) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $uid = get_current_user_id();
    $lien = aled08e_edition_dispo($uid) ? aled08e_edition_lien($uid) : null;
    if (!$lien || is_wp_error($lien)) { wp_safe_redirect(aled08e_url(['m' => 'edition_indispo']) . '#accueil', 303); exit; }
    update_user_meta($uid, 'aled08_edition_le', current_time('mysql'));
    wp_redirect($lien, 303); // le site du client, sur son propre domaine
    exit;
});
function aled08e_edition_bouton_html($uid, $classe = 'acc-action c-mint') {
    if (!aled08e_edition_dispo($uid)) return '';
    return '<form method="post" action="' . esc_url(aled08e_url()) . '" target="_blank" class="ed-form">'
        . '<input type="hidden" name="aled08e_editer" value="1">' . wp_nonce_field('aled08e_editer', '_aled08e_editer', false, false)
        . '<button type="submit" class="' . esc_attr($classe) . '"><span class="acc-art" aria-hidden="true">' . aled08e_monster('ravie') . '</span>'
        . '<strong>Modifier mon site moi-même</strong><small>Je clique sur un texte ou une photo, je le change : c’est en ligne tout de suite</small></button></form>';
}
/* Dans « Mes demandes » : le petit rappel qu'un texte ou une photo se change en direct */
function aled08e_edition_rappel_html($uid) {
    if (!aled08e_edition_dispo($uid)) return '';
    return '<form method="post" action="' . esc_url(aled08e_url()) . '" target="_blank" class="ed-rappel">'
        . '<input type="hidden" name="aled08e_editer" value="1">' . wp_nonce_field('aled08e_editer', '_aled08e_editer', false, false)
        . '<p>' . aled08e_icon('sparkles') . '<span><b>Un texte ou une photo à changer ?</b> Faites-le vous-même, en direct sur votre site : c’est en ligne tout de suite, et vous pouvez annuler.</span></p>'
        . '<button type="submit" class="btn btn-primary btn-sm">' . aled08e_icon('pencil') . '<span>Modifier mon site</span></button></form>';
}

/* Pour Alex : le même lien, depuis l'atelier (pour vérifier ou aider un client) */
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/atelier/edition', ['methods' => 'POST', 'permission_callback' => function () { return current_user_can('manage_options'); }, 'callback' => function (WP_REST_Request $r) {
        $uid = (int) ($r->get_json_params()['fiche'] ?? 0);
        if (!$uid || !get_userdata($uid)) return new WP_Error('aled08_edition', 'Fiche introuvable.', ['status' => 404]);
        delete_transient('aled08e_edition_' . $uid);
        if (!aled08e_edition_dispo($uid)) return new WP_Error('aled08_edition', 'Le site de ce client n’a pas encore le connecteur 2.12.0.', ['status' => 409]);
        $l = aled08e_edition_lien($uid, (string) ($r->get_json_params()['page'] ?? '/'));
        return is_wp_error($l) ? $l : new WP_REST_Response(['ok' => true, 'lien' => $l, 'valable' => '10 minutes, une seule fois'], 200);
    }]);
});
