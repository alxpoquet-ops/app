<?php
/**
 * Les Minis Monstres : la sécurité de base des sites (Alex, 26 novembre 2026 : « il doit être fluide et sécurisé »).
 *
 * Ce fichier est le même sur les sites des clients (dans le connecteur) et sur les-minis-monstres.fr (copié par l'export
 * dans aled08-espace/includes/). Les attaques par saturation (DDoS) se filtrent avant WordPress, chez l'hébergeur
 * (o2switch : protection réseau et pare-feu) ; ici, on ferme les portes que les robots essaient en premier :
 *  - les en-têtes de sécurité (pas d'affichage du site dans le cadre d'un autre site, sauf l'espace client des Minis Monstres) ;
 *  - la liste des comptes et les pages d'auteur cachées aux visiteurs (les identifiants de connexion ne se lisent plus) ;
 *  - XML-RPC coupé (la porte préférée des robots qui essaient des mots de passe) ;
 *  - 5 essais de connexion ratés depuis la même adresse : 15 minutes d'attente ;
 *  - la version de WordPress n'est plus affichée, l'éditeur de fichiers de l'administration est fermé.
 */
defined('ABSPATH') || exit;
if (defined('MINIS_SECU')) return; // une seule fois, même si deux extensions l'embarquent
define('MINIS_SECU', '1.0.1');

/* Les sites qui peuvent afficher celui-ci dans un cadre : lui-même, et l'espace client des Minis Monstres (aperçu des modifications) */
function minis_secu_cadres() {
    return "'self' https://www.les-minis-monstres.fr https://les-minis-monstres.fr";
}

/* 1. Les en-têtes de sécurité, sur les pages du site (pas sur les fichiers servis directement par l'hébergeur) */
add_action('send_headers', function () {
    if (headers_sent()) return;
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self)');
    header('Content-Security-Policy: frame-ancestors ' . minis_secu_cadres());
    if (is_ssl()) header('Strict-Transport-Security: max-age=31536000');
    header_remove('X-Pingback');
    header_remove('X-Powered-By');
});

/* 2. Les comptes cachés aux visiteurs : ni liste par l'API, ni pages d'auteur, ni plan du site des auteurs */
add_filter('rest_endpoints', function ($e) {
    if (is_user_logged_in()) return $e;
    foreach (array_keys($e) as $route) if (strpos($route, '/wp/v2/users') === 0) unset($e[$route]);
    return $e;
});
add_action('template_redirect', function () {
    if (is_user_logged_in()) return;
    if (isset($_GET['author']) || is_author()) { wp_safe_redirect(home_url('/'), 301); exit; }
}, 1);
add_filter('wp_sitemaps_add_provider', function ($p, $nom) { return $nom === 'users' ? false : $p; }, 10, 2);
add_filter('oembed_response_data', function ($d) { unset($d['author_name'], $d['author_url']); return $d; });

/* 3. XML-RPC coupé */
add_filter('xmlrpc_enabled', '__return_false');
add_filter('xmlrpc_methods', function () { return []; });
add_filter('wp_headers', function ($h) { unset($h['X-Pingback']); return $h; });
if (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST) { status_header(403); header('Content-Type: text/plain; charset=utf-8'); exit('XML-RPC est fermé sur ce site.'); }

/* 4. Trop d'essais de connexion ratés : on attend. 5 essais par adresse, puis 15 minutes. */
function minis_secu_ip() {
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    return preg_match('/^[0-9a-f.:]{3,45}$/i', $ip) ? $ip : 'inconnue';
}
function minis_secu_cle() { return 'minis_secu_' . md5(minis_secu_ip()); }
add_filter('authenticate', function ($user, $login) {
    $n = (int) get_transient(minis_secu_cle());
    if ($n >= 5) return new WP_Error('minis_secu_attente', 'Trop d’essais de connexion. Par sécurité, réessayez dans 15 minutes.');
    return $user;
}, 30, 2);
add_action('wp_login_failed', function () {
    $cle = minis_secu_cle();
    set_transient($cle, (int) get_transient($cle) + 1, 15 * MINUTE_IN_SECONDS);
});
add_action('wp_login', function () { delete_transient(minis_secu_cle()); });

/* 5. Rien qui aide un robot : pas de version affichée, pas d'éditeur de fichiers, pas de fichier « readme » à la racine */
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');
if (!defined('DISALLOW_FILE_EDIT')) define('DISALLOW_FILE_EDIT', true);
add_action('init', function () { // une fois par jour, sans requête de plus (option chargée avec les autres)
    if ((int) get_option('minis_secu_menage', 0) > time() - DAY_IN_SECONDS) return;
    update_option('minis_secu_menage', time(), true);
    foreach (['readme.html', 'license.txt', 'wp-config-sample.php'] as $f) if (is_file(ABSPATH . $f)) @unlink(ABSPATH . $f);
});
// un message de connexion qui ne dit pas si c'est l'identifiant ou le mot de passe qui est faux
add_filter('login_errors', function ($m) { return strpos((string) $m, 'Trop d’essais') !== false ? $m : 'Identifiant ou mot de passe incorrect.'; });
