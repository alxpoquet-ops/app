<?php
/**
 * Les Minis Monstres Espace client : relier tout seul le site d'un client à son espace.
 * L'extension d'installation, sur le site du client, envoie ici son adresse et sa clé.
 * On vérifie en rappelant le site avec cette clé (lui seul peut répondre juste), puis on range
 * l'adresse et la clé dans la fiche du client dont le site porte ce nom. Si aucune fiche ne correspond
 * encore, le site attend : il est relié dès que la fiche reçoit son adresse.
 */
defined('ABSPATH') || exit;

function aled08e_relier_hote($url) {
    $h = strtolower((string) wp_parse_url((string) $url, PHP_URL_HOST));
    return preg_replace('/^www\./', '', $h);
}
function aled08e_relier_attente() { $a = get_option('aled08e_relier_attente', []); return is_array($a) ? $a : []; }

/* Le site répond-il bien avec cette clé ? (même signature que les appels de Bricou) */
function aled08e_relier_verifier($url, $cle) {
    $body = wp_json_encode(['action' => 'infos', 'args' => (object) [], 'n' => wp_generate_password(16, false, false)]);
    $ts = (string) time();
    $r = wp_safe_remote_post(untrailingslashit($url) . '/wp-json/alexlia/v1/action', [
        'timeout' => 20, 'redirection' => 0,
        'headers' => ['Content-Type' => 'application/json', 'X-AlexLia-Time' => $ts, 'X-AlexLia-Signature' => hash_hmac('sha256', $ts . '.' . $body, $cle)],
        'body' => $body,
    ]);
    return !is_wp_error($r) && (int) wp_remote_retrieve_response_code($r) === 200 && is_array(json_decode((string) wp_remote_retrieve_body($r), true));
}

/* La fiche du client dont le site porte ce nom */
function aled08e_relier_client($hote) {
    if ($hote === '') return 0;
    foreach (['aled08_site', 'aled08_lia_url'] as $cle) {
        foreach (get_users(['meta_query' => [['key' => $cle, 'value' => $hote, 'compare' => 'LIKE']], 'fields' => 'ID', 'number' => 20]) as $id) {
            if (aled08e_relier_hote(get_user_meta((int) $id, $cle, true)) === $hote) return (int) $id;
        }
    }
    return 0;
}
function aled08e_relier_poser($uid, $url, $cle) {
    static $encours = false;
    if ($encours) return;
    $encours = true;
    update_user_meta($uid, 'aled08_lia_url', untrailingslashit($url));
    update_user_meta($uid, 'aled08_lia_secret', $cle);
    if (!get_user_meta($uid, 'aled08_site', true)) update_user_meta($uid, 'aled08_site', trailingslashit($url));
    $encours = false;
    if (function_exists('aled08e_lia_rattraper')) aled08e_lia_rattraper();
    $u = get_userdata($uid);
    if (function_exists('aled08e_to')) wp_mail(aled08e_to(), 'Site relié : ' . aled08e_relier_hote($url), 'Le site ' . $url . ' vient d’être relié tout seul à l’espace client de ' . ($u ? $u->display_name : 'n° ' . $uid) . ".\n\nRien à faire.");
}

add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/relier', ['methods' => 'POST', 'permission_callback' => '__return_true', 'callback' => 'aled08e_relier_recevoir']);
});
function aled08e_relier_recevoir(WP_REST_Request $req) {
    // pas plus de quelques essais par heure et par adresse
    $ip = 'aled08_relier_' . md5((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $n = (int) get_transient($ip);
    if ($n >= 10) return new WP_REST_Response(['ok' => false, 'etat' => 'trop'], 429);
    set_transient($ip, $n + 1, HOUR_IN_SECONDS);

    $p = (array) $req->get_json_params();
    $url = esc_url_raw(trim((string) ($p['url'] ?? '')));
    $cle = preg_replace('/[^A-Za-z0-9]/', '', (string) ($p['cle'] ?? ''));
    $hote = aled08e_relier_hote($url);
    if (wp_parse_url($url, PHP_URL_SCHEME) !== 'https' || $hote === '' || strlen($cle) < 32 || strlen($cle) > 128) return new WP_REST_Response(['ok' => false, 'etat' => 'invalide'], 400);
    if ($hote === aled08e_relier_hote(home_url())) return new WP_REST_Response(['ok' => false, 'etat' => 'invalide'], 400);
    if (!aled08e_relier_verifier($url, $cle)) return new WP_REST_Response(['ok' => false, 'etat' => 'injoignable'], 200);

    $uid = aled08e_relier_client($hote);
    $att = aled08e_relier_attente();
    if ($uid) {
        aled08e_relier_poser($uid, $url, $cle);
        unset($att[$hote]);
        update_option('aled08e_relier_attente', $att, false);
        return new WP_REST_Response(['ok' => true, 'etat' => 'relie'], 200);
    }
    $att[$hote] = ['url' => untrailingslashit($url), 'cle' => $cle, 'le' => time()];
    $att = array_filter($att, function ($a) { return (int) ($a['le'] ?? 0) > time() - 60 * DAY_IN_SECONDS; });
    uasort($att, function ($a, $b) { return $b['le'] <=> $a['le']; });
    update_option('aled08e_relier_attente', array_slice($att, 0, 50, true), false);
    if (function_exists('aled08e_to')) wp_mail(aled08e_to(), 'Site installé, en attente de sa fiche : ' . $hote, 'Le site ' . $url . " vient d’être installé, mais aucune fiche client ne porte encore cette adresse.\n\nDès que vous mettez cette adresse dans la fiche du client (champ « Adresse du site à modifier »), il est relié tout seul.");
    return new WP_REST_Response(['ok' => true, 'etat' => 'attente'], 200);
}

/* Une fiche reçoit une adresse : si ce site attendait, on le relie */
function aled08e_relier_rattraper($meta_id, $uid, $cle, $valeur) {
    if (!in_array($cle, ['aled08_site', 'aled08_lia_url'], true) || !$valeur) return;
    $att = aled08e_relier_attente();
    $hote = aled08e_relier_hote($valeur);
    if ($hote === '' || empty($att[$hote])) return;
    $a = $att[$hote];
    unset($att[$hote]);
    update_option('aled08e_relier_attente', $att, false);
    aled08e_relier_poser((int) $uid, $a['url'], $a['cle']);
}
add_action('added_user_meta', 'aled08e_relier_rattraper', 10, 4);
add_action('updated_user_meta', 'aled08e_relier_rattraper', 10, 4);
