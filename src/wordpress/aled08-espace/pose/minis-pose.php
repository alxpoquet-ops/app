<?php
/**
 * Les Minis Monstres : pose automatique d'un site client.
 * Ce fichier est déposé dans le dossier du site par les-minis-monstres.fr, appelé plusieurs fois de suite
 * (une étape par appel), puis il s'efface. Sans le bon jeton, il ne fait rien.
 * Étapes : télécharger WordPress, le déplier, le régler, l'installer, poser l'extension du type de site,
 * dérouler son installation, puis ménage.
 */
error_reporting(0);
@set_time_limit(280);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$C = json_decode(base64_decode('/*CONFIG*/'), true);
$dire = function ($a) { echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; };
if (!is_array($C) || empty($C['jeton']) || !hash_equals((string) $C['jeton'], hash('sha256', (string) ($_POST['t'] ?? '')))) { http_response_code(403); $dire(['ok' => false, 'message' => 'refusé']); }

$ici = __DIR__;
$zip = $ici . '/minis-pose-wp.zip';
$tmp = $ici . '/minis-pose-tmp';
$fichier_etat = $ici . '/minis-pose-etat.json';
$etat = is_file($fichier_etat) ? (array) json_decode((string) file_get_contents($fichier_etat), true) : [];
$noter = function ($k, $v = 1) use (&$etat, $fichier_etat) { $etat[$k] = $v; file_put_contents($fichier_etat, json_encode($etat)); };

$telecharger = function ($url, $vers) {
    $f = fopen($vers, 'w');
    if (!$f) return 'écriture impossible dans le dossier';
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_FILE => $f, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 240, CURLOPT_CONNECTTIMEOUT => 20, CURLOPT_USERAGENT => 'minis-pose']);
    $ok = curl_exec($c); $code = (int) curl_getinfo($c, CURLINFO_HTTP_CODE); $err = curl_error($c);
    curl_close($c); fclose($f);
    if (!$ok || $code !== 200 || filesize($vers) < 1000) { @unlink($vers); return 'téléchargement raté (' . ($err ?: 'réponse ' . $code) . ')'; }
    return '';
};
$vider = function ($d) use (&$vider) {
    if (!is_dir($d)) return;
    foreach (scandir($d) as $x) { if ($x === '.' || $x === '..') continue; $p = $d . '/' . $x; is_dir($p) && !is_link($p) ? $vider($p) : @unlink($p); }
    @rmdir($d);
};

try {
    /* 1. WordPress en français */
    if (!is_file($ici . '/wp-load.php') && !is_file($zip)) {
        $e = $telecharger('https://fr.wordpress.org/latest-fr_FR.zip', $zip);
        if ($e) $dire(['ok' => false, 'etape' => 'telecharger', 'message' => $e]);
        $dire(['ok' => true, 'etape' => 'telecharger', 'suite' => true, 'message' => 'WordPress téléchargé.']);
    }
    /* 2. le déplier dans le dossier du site */
    if (!is_file($ici . '/wp-load.php')) {
        if (!class_exists('ZipArchive')) $dire(['ok' => false, 'etape' => 'deplier', 'message' => 'ZipArchive manque sur l’hébergement']);
        $z = new ZipArchive();
        if ($z->open($zip) !== true || !$z->extractTo($tmp)) $dire(['ok' => false, 'etape' => 'deplier', 'message' => 'archive illisible']);
        $z->close();
        $src = $tmp . '/wordpress';
        foreach (scandir($src) as $x) {
            if ($x === '.' || $x === '..') continue;
            if (file_exists($ici . '/' . $x)) { if ($x === 'index.php' || $x === 'wp-config-sample.php' || !is_dir($ici . '/' . $x)) @unlink($ici . '/' . $x); else continue; }
            rename($src . '/' . $x, $ici . '/' . $x);
        }
        $vider($tmp); @unlink($zip);
        foreach (['index.html', 'default.html', 'cgi-bin/.keep'] as $x) if (is_file($ici . '/' . $x)) @unlink($ici . '/' . $x);
        $dire(['ok' => is_file($ici . '/wp-load.php'), 'etape' => 'deplier', 'suite' => true, 'message' => 'WordPress déplié.']);
    }
    /* 3. wp-config.php */
    if (!is_file($ici . '/wp-config.php')) {
        $s = (string) file_get_contents($ici . '/wp-config-sample.php');
        $q = function ($v) { return "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], (string) $v) . "'"; };
        foreach (['DB_NAME' => $C['db']['nom'], 'DB_USER' => $C['db']['user'], 'DB_PASSWORD' => $C['db']['mdp'], 'DB_HOST' => $C['db']['hote'] ?? 'localhost'] as $k => $v) {
            $s = preg_replace_callback("/define\\(\\s*'" . $k . "'\\s*,\\s*'[^']*'\\s*\\);/", function () use ($k, $v, $q) { return "define( '" . $k . "', " . $q($v) . ' );'; }, $s, 1);
        }
        $s = preg_replace_callback("/define\\(\\s*'([A-Z_]+(?:KEY|SALT))'\\s*,\\s*'[^']*'\\s*\\);/", function ($m) { return "define( '" . $m[1] . "', '" . bin2hex(random_bytes(32)) . "' );"; }, $s);
        $s = preg_replace("/\\\$table_prefix\\s*=\\s*'[^']*';/", "\$table_prefix = 'mm" . substr(bin2hex(random_bytes(2)), 0, 3) . "_';", $s, 1);
        if (!file_put_contents($ici . '/wp-config.php', $s)) $dire(['ok' => false, 'etape' => 'regler', 'message' => 'wp-config.php non écrit']);
        @chmod($ici . '/wp-config.php', 0600);
        $dire(['ok' => true, 'etape' => 'regler', 'suite' => true, 'message' => 'WordPress réglé.']);
    }
    /* 4. l'installation de WordPress */
    if (empty($etat['installe'])) {
        define('WP_INSTALLING', true);
        function wp_new_blog_notification() {} // pas d'e-mail automatique : les identifiants repartent vers les Minis Monstres
        $_SERVER['HTTP_HOST'] = (string) parse_url($C['site']['url'], PHP_URL_HOST) . (parse_url($C['site']['url'], PHP_URL_PORT) ? ':' . parse_url($C['site']['url'], PHP_URL_PORT) : '');
        require $ici . '/wp-load.php';
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        if (!is_blog_installed()) {
            $r = wp_install($C['site']['titre'], $C['admin']['user'], $C['admin']['email'], false, '', wp_slash($C['admin']['mdp']), 'fr_FR');
            if (empty($r['user_id'])) $dire(['ok' => false, 'etape' => 'installer', 'message' => 'installation refusée']);
        }
        update_option('siteurl', untrailingslashit($C['site']['url'])); update_option('home', untrailingslashit($C['site']['url']));
        $noter('installe');
        $dire(['ok' => true, 'etape' => 'installer', 'suite' => true, 'message' => 'WordPress installé.']);
    }

    require $ici . '/wp-load.php';
    require_once ABSPATH . 'wp-admin/includes/admin.php';
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
    if ($admins) wp_set_current_user((int) $admins[0]);
    $dossier = 'minis-site-' . preg_replace('/[^a-z]/', '', (string) $C['type']);
    $ext = $dossier . '/' . $dossier . '.php';

    /* 5. l'extension du type de site */
    if (empty($etat['extension'])) {
        if (!is_file(WP_PLUGIN_DIR . '/' . $ext)) {
            $a = $ici . '/minis-pose-ext.zip';
            $e = $telecharger($C['extension'], $a);
            if ($e) $dire(['ok' => false, 'etape' => 'extension', 'message' => $e]);
            $z = new ZipArchive();
            if ($z->open($a) !== true || !$z->extractTo(WP_PLUGIN_DIR)) $dire(['ok' => false, 'etape' => 'extension', 'message' => 'extension illisible']);
            $z->close(); @unlink($a);
        }
        wp_clean_plugins_cache(true);
        $r = activate_plugin($ext);
        if (is_wp_error($r)) $dire(['ok' => false, 'etape' => 'extension', 'message' => $r->get_error_message()]);
        delete_transient('minis_site_ouvrir');
        $noter('extension');
        $dire(['ok' => true, 'etape' => 'extension', 'suite' => true, 'message' => 'Extension posée.']);
    }

    /* 6. l'installation du site, une étape de l'extension par appel */
    if (!function_exists('minis_site_etapes')) $dire(['ok' => false, 'etape' => 'site', 'message' => 'extension inactive']);
    $faits = minis_site_etat();
    $essais = (array) ($etat['essais'] ?? []);
    foreach (minis_site_etapes() as $id => $lib) {
        if ($id === 'fin') continue;
        if (!empty($faits[$id]['ok']) || (int) ($essais[$id] ?? 0) >= 2) continue;
        $essais[$id] = (int) ($essais[$id] ?? 0) + 1;
        $noter('essais', $essais);
        ob_start();
        try { $r = minis_site_faire($id); } catch (\Throwable $e) { $r = [false, 'Erreur : ' . $e->getMessage()]; }
        ob_end_clean();
        minis_site_noter($id, $r[0], $r[1]);
        $dire(['ok' => (bool) $r[0], 'etape' => 'site:' . $id, 'suite' => true, 'message' => $lib . ' : ' . $r[1]]);
    }
    $fin = minis_site_faire('fin');
    minis_site_noter('fin', $fin[0], $fin[1]);

    /* 7. le ménage : ce fichier s'efface */
    $rates = [];
    foreach (minis_site_etat() as $id => $e) if ($id !== 'fin' && empty($e['ok'])) $rates[] = (minis_site_etapes()[$id] ?? $id) . ' (' . ($e['texte'] ?? '') . ')';
    @unlink($fichier_etat); @unlink($zip); @unlink($ici . '/minis-pose-ext.zip'); @unlink(__FILE__);
    $dire(['ok' => true, 'etape' => 'fin', 'suite' => false, 'fini' => true, 'rates' => $rates, 'relie' => (string) get_option('minis_site_relie'), 'message' => $fin[1]]);
} catch (\Throwable $e) {
    $dire(['ok' => false, 'etape' => 'erreur', 'message' => $e->getMessage()]);
}
