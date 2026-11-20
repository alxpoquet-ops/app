<?php
/**
 * Les Minis Monstres Espace client : l'atelier.
 * Un seul branchement pour tous les sites des clients : l'administrateur des Minis Monstres (Alex, ou Claude relié à ce site)
 * envoie ici une action, et l'espace client la transmet au site du client, signée avec sa clé de liaison.
 *  GET  /wp-json/aled08/v1/atelier            la liste des sites reliés
 *  POST /wp-json/aled08/v1/atelier            { site: "exemple.fr" ou numéro de fiche, action: "…", args: { … } }
 * Actions utiles : infos, lister, lire, atelier_rest { methode, route, requete, corps }, atelier_image { url | base64, nom, alt }.
 * La clé du site ne sort jamais d'ici.
 */
defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => 'aled08e_atelier_sites'],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_atelier_action'],
    ]);
});

function aled08e_atelier_sites() {
    $l = [];
    foreach (get_users(['meta_key' => 'aled08_lia_url', 'meta_compare' => 'EXISTS', 'number' => 500]) as $u) {
        $url = aled08e_meta($u->ID, 'lia_url');
        if ($url === '') continue;
        $l[] = ['fiche' => (int) $u->ID, 'client' => $u->display_name, 'site' => untrailingslashit($url), 'relie' => aled08e_meta($u->ID, 'lia_secret') !== '', 'visuel' => aled08e_meta($u->ID, 'visuel_fait') ?: 'à faire'];
    }
    return new WP_REST_Response(['sites' => $l, 'en_attente_de_fiche' => array_keys(function_exists('aled08e_relier_attente') ? aled08e_relier_attente() : [])], 200);
}

function aled08e_atelier_fiche($site) {
    if (is_numeric($site)) return get_userdata((int) $site) ? (int) $site : 0;
    $hote = aled08e_relier_hote(strpos((string) $site, '://') === false ? 'https://' . $site : (string) $site);
    return $hote === '' ? 0 : (int) aled08e_relier_client($hote);
}

function aled08e_atelier_action(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $uid = aled08e_atelier_fiche($p['site'] ?? '');
    if (!$uid) return new WP_Error('aled08_atelier', 'Aucune fiche client ne porte ce site.', ['status' => 404]);
    $action = sanitize_key((string) ($p['action'] ?? ''));
    if ($action === '') return new WP_Error('aled08_atelier', 'Action manquante.', ['status' => 400]);
    // le visuel est terminé : on le note sur la fiche (rien n'est envoyé au site)
    if ($action === 'visuel_fait') { update_user_meta($uid, 'aled08_visuel_fait', wp_date('Y-m-d')); return new WP_REST_Response(['ok' => true], 200); }
    @set_time_limit(180);
    $r = aled08e_lia_appel($uid, $action, is_array($p['args'] ?? null) ? $p['args'] : []);
    if (is_wp_error($r)) return new WP_Error('aled08_atelier', $r->get_error_message(), ['status' => 502]);
    return new WP_REST_Response($r, 200);
}
