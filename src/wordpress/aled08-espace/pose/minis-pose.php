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

    /* 6. l'installation du site, une étape de l'extension par appel.
     * Une extension de wordpress.org se télécharge d'abord ici, directement (comme WordPress à l'étape 1) : l'installateur de
     * WordPress échoue parfois sur l'hébergement (aled08.fr, 26 novembre 2026 : Contact Form 7). Il reste en secours.
     * En reprise (site déjà posé et travaillé), seules les extensions et le formulaire sont refaits : rien d'autre n'est touché. */
    if (!function_exists('minis_site_etapes')) $dire(['ok' => false, 'etape' => 'site', 'message' => 'extension inactive']);
    $reprise = !empty($C['reprise']);
    /* La version à poser : la dernière, sauf si elle demande un PHP plus récent que celui de l'hébergement
     * (aled08.fr, 26 novembre 2026 : Contact Form 7 demandait PHP 8.3, le site tournait en 8.1). On prend alors la plus
     * récente qui va, en lisant le « Requires PHP » de chaque version publiée (petit fichier readme.txt). */
    $lire = function ($url) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 20, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_USERAGENT => 'minis-pose']);
        $t = curl_exec($c); $code = (int) curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
        return $code === 200 && is_string($t) ? $t : '';
    };
    $php_demande = function ($texte) { return preg_match('/^\s*\**\s*Requires PHP:\s*([0-9.]+)/mi', (string) $texte, $m) ? $m[1] : ''; };
    $version_qui_va = function ($slug) use ($lire, $php_demande) {
        $info = json_decode($lire('https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=' . rawurlencode($slug) . '&request[fields][versions]=1&request[fields][sections]=0'), true);
        if (!is_array($info) || empty($info['download_link'])) return 'https://downloads.wordpress.org/plugin/' . $slug . '.latest-stable.zip';
        if (empty($info['requires_php']) || version_compare(PHP_VERSION, $info['requires_php'], '>=')) return $info['download_link'];
        $vs = array_filter(array_keys((array) ($info['versions'] ?? [])), function ($v) { return $v !== 'trunk' && preg_match('/^[0-9.]+$/', $v); });
        usort($vs, function ($a, $b) { return version_compare($b, $a); });
        $n = 0;
        foreach ($vs as $v) {
            if (version_compare($v, (string) ($info['version'] ?? '0'), '>=')) continue;
            if (++$n > 12) break;
            $r = $lire('https://plugins.svn.wordpress.org/' . rawurlencode($slug) . '/tags/' . rawurlencode($v) . '/readme.txt');
            $p = $php_demande($r);
            if ($r !== '' && ($p === '' || version_compare(PHP_VERSION, $p, '>='))) return $info['versions'][$v];
        }
        return '';
    };
    $poser_ext = function ($slug) use ($telecharger, $ici, $version_qui_va, $vider) {
        $slug = preg_replace('/[^a-z0-9-]/', '', (string) $slug);
        if ($slug === '') return '';
        $deja = glob(WP_PLUGIN_DIR . '/' . $slug . '/*.php');
        if ($deja) {
            // déjà là : on la garde, sauf si elle ne peut pas tourner avec ce PHP (elle n'est alors pas active)
            $trop = false;
            foreach ($deja as $f) { $d = get_plugin_data($f, false, false); if (!empty($d['Name'])) { $trop = !empty($d['RequiresPHP']) && version_compare(PHP_VERSION, $d['RequiresPHP'], '<') && !is_plugin_active($slug . '/' . basename($f)); break; } }
            if (!$trop) return '';
            $vider(WP_PLUGIN_DIR . '/' . $slug);
        }
        $url = $version_qui_va($slug);
        if ($url === '') return 'aucune version publiée ne tourne avec PHP ' . PHP_VERSION;
        $a = $ici . '/minis-pose-' . $slug . '.zip';
        $e = $telecharger($url, $a);
        if ($e) return $e;
        $z = new ZipArchive();
        $ok = $z->open($a) === true && $z->extractTo(WP_PLUGIN_DIR);
        if ($ok) $z->close();
        @unlink($a);
        wp_clean_plugins_cache(true);
        return $ok ? '' : 'archive illisible';
    };
    $faits = minis_site_etat();
    $essais = (array) ($etat['essais'] ?? []);
    foreach (minis_site_etapes() as $id => $lib) {
        if ($id === 'fin') continue;
        if ($reprise && strpos($id, 'ext:') !== 0 && strpos($id, 'maison:') !== 0 && $id !== 'formulaire') continue;
        if (!empty($faits[$id]['ok']) || (int) ($essais[$id] ?? 0) >= 2) continue;
        $essais[$id] = (int) ($essais[$id] ?? 0) + 1;
        $noter('essais', $essais);
        $avant = strpos($id, 'ext:') === 0 ? $poser_ext(substr($id, 4)) : '';
        ob_start();
        try { $r = minis_site_faire($id); } catch (\Throwable $e) { $r = [false, 'Erreur : ' . $e->getMessage()]; }
        ob_end_clean();
        if (!$r[0] && $avant !== '') $r[1] .= ' Téléchargement direct : ' . $avant . '.';
        minis_site_noter($id, $r[0], $r[1]);
        $dire(['ok' => (bool) $r[0], 'etape' => 'site:' . $id, 'suite' => true, 'message' => $lib . ' : ' . $r[1]]);
    }
    $fin = minis_site_faire('fin');
    minis_site_noter('fin', $fin[0], $fin[1]);

    /* 7. le ménage : ce fichier s'efface */
    $rates = [];
    foreach (minis_site_etat() as $id => $e) if ($id !== 'fin' && empty($e['ok'])) $rates[] = (minis_site_etapes()[$id] ?? $id) . ' (' . ($e['texte'] ?? '') . ')';
    @unlink($fichier_etat); @unlink($zip); @unlink($ici . '/minis-pose-ext.zip'); @unlink(__FILE__);
    $dire(['ok' => true, 'etape' => 'fin', 'suite' => false, 'fini' => true, 'rates' => $rates, 'relie' => (string) get_option('minis_site_relie'), 'formulaire' => function_exists('minis_site_formulaire_id') ? (int) minis_site_formulaire_id() : 0, 'message' => $fin[1]]);
} catch (\Throwable $e) {
    $dire(['ok' => false, 'etape' => 'erreur', 'message' => $e->getMessage()]);
}
