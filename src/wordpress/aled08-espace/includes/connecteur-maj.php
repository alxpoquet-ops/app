<?php
/**
 * Les Minis Monstres : la dernière version du connecteur, pour la mise à jour automatique des sites clients (26 novembre 2026).
 * GET /wp-json/aled08/v1/connecteur → { version, paquet } : le connecteur 2.16.0 ou plus le demande deux fois par jour et
 * s'installe tout seul. Le paquet est celui rangé dans aled08-espace/pkg/ par l'export.
 */
defined('ABSPATH') || exit;

function aled08e_connecteur_paquet() { return dirname(__DIR__) . '/pkg/alexlia-connecteur.zip'; }
function aled08e_connecteur_version() {
    $f = aled08e_connecteur_paquet();
    if (!is_file($f)) return '';
    $cle = 'aled08e_conn_v_' . md5_file($f);
    $v = get_transient($cle);
    if (is_string($v) && $v !== '') return $v;
    $v = '';
    if (class_exists('ZipArchive')) {
        $z = new ZipArchive();
        if ($z->open($f) === true) {
            $code = (string) $z->getFromName('alexlia-connecteur/alexlia-connecteur.php');
            $z->close();
            if (preg_match('/^\s*\*\s*Version:\s*([0-9.]+)/mi', $code, $m)) $v = $m[1];
        }
    }
    if ($v !== '') set_transient($cle, $v, DAY_IN_SECONDS);
    return $v;
}
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/connecteur', ['methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => function () {
        $v = aled08e_connecteur_version();
        if ($v === '') return new WP_Error('aled08_connecteur', 'Paquet introuvable.', ['status' => 404]);
        return new WP_REST_Response(['version' => $v, 'paquet' => plugins_url('pkg/alexlia-connecteur.zip', dirname(__DIR__) . '/aled08-espace.php')], 200);
    }]);
});
