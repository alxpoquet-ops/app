<?php
/**
 * La copie du site, à la demande du client (25 novembre 2026, demande d'Alex : « c'est son site »).
 *
 * Action signée « copie » { format: "html" | "wordpress" } : fabrique un zip sur CE serveur et renvoie un lien de
 * téléchargement à usage limité (adresse impossible à deviner, effacée au bout de 2 heures).
 *  - html      : le site tel que les visiteurs le voient, en pages HTML, avec ses feuilles de style, ses scripts, ses images et
 *                ses polices. Les liens sont rendus relatifs : il s'ouvre depuis un dossier ou se pose chez n'importe quel hébergeur.
 *  - wordpress : tout le site WordPress (fichiers de WordPress, thème, extensions, images) et sa base de données en un fichier
 *                SQL, pour le réinstaller ailleurs. Sans wp-config.php (mots de passe du serveur) ni la clé de ce connecteur.
 * Chaque zip contient un fichier LISEZ-MOI.txt qui explique quoi en faire.
 */
defined('ABSPATH') || exit;

function alexlia_copie_dossier() {
    $u = wp_upload_dir(null, false);
    $d = trailingslashit($u['basedir']) . 'alexlia-copies';
    if (!is_dir($d)) wp_mkdir_p($d);
    if (!file_exists($d . '/index.php')) @file_put_contents($d . '/index.php', "<?php // rien à voir ici\n");
    if (!file_exists($d . '/.htaccess')) @file_put_contents($d . '/.htaccess', "Options -Indexes\n");
    return ['dir' => $d, 'url' => trailingslashit($u['baseurl']) . 'alexlia-copies'];
}
/* Les copies de plus de 2 heures sont effacées (à chaque nouvelle copie, et par une tâche planifiée) */
function alexlia_copie_menage() {
    $d = alexlia_copie_dossier()['dir'];
    foreach ((array) glob($d . '/*.{zip,sql,tmp}', GLOB_BRACE) as $f) if (is_file($f) && filemtime($f) < time() - 2 * HOUR_IN_SECONDS) @unlink($f);
}
add_action('alexlia_copie_menage', 'alexlia_copie_menage');

function alexlia_conn_copie($a) {
    $format = ($a['format'] ?? '') === 'wordpress' ? 'wordpress' : 'html';
    if (!class_exists('ZipArchive')) return new WP_Error('alexlia_copie', 'Ce serveur ne sait pas fabriquer de fichier zip (extension PHP « zip » absente).', ['status' => 501]);
    if (get_transient('alexlia_copie_en_cours')) return new WP_Error('alexlia_copie', 'Une copie est déjà en préparation. Réessayez dans quelques minutes.', ['status' => 429]);
    set_transient('alexlia_copie_en_cours', 1, 10 * MINUTE_IN_SECONDS);
    if (function_exists('set_time_limit')) @set_time_limit(600);
    @ignore_user_abort(true);
    @ini_set('memory_limit', '512M');
    alexlia_copie_menage();
    $D = alexlia_copie_dossier();
    $hote = preg_replace('/[^a-z0-9.-]/', '', strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST)));
    $nom = 'copie-' . $hote . '-' . ($format === 'wordpress' ? 'wordpress' : 'html') . '-' . wp_date('Y-m-d') . '-' . wp_generate_password(20, false, false) . '.zip';
    $chemin = $D['dir'] . '/' . $nom;
    $zip = new ZipArchive();
    if ($zip->open($chemin, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) { delete_transient('alexlia_copie_en_cours'); return new WP_Error('alexlia_copie', 'Le fichier zip n’a pas pu être créé.', ['status' => 500]); }
    $racine = $hote . '/';
    try {
        $info = $format === 'wordpress' ? alexlia_copie_wordpress($zip, $racine, $D['dir']) : alexlia_copie_html($zip, $racine);
    } catch (Throwable $e) {
        $zip->close(); @unlink($chemin); delete_transient('alexlia_copie_en_cours');
        return new WP_Error('alexlia_copie', 'La copie a échoué : ' . $e->getMessage(), ['status' => 500]);
    }
    $zip->addFromString($racine . 'LISEZ-MOI.txt', alexlia_copie_lisezmoi($format, $info));
    $zip->close();
    foreach ((array) glob($D['dir'] . '/*.sql') as $f) @unlink($f);
    delete_transient('alexlia_copie_en_cours');
    if (!wp_next_scheduled('alexlia_copie_menage')) wp_schedule_single_event(time() + 2 * HOUR_IN_SECONDS + 60, 'alexlia_copie_menage');
    if (function_exists('alexlia_conn_journal')) alexlia_conn_journal('Copie du site (' . ($format === 'wordpress' ? 'WordPress' : 'HTML et CSS') . ') préparée pour son propriétaire.');
    return new WP_REST_Response(['ok' => true, 'format' => $format, 'url' => $D['url'] . '/' . $nom, 'taille' => (int) filesize($chemin), 'expire' => time() + 2 * HOUR_IN_SECONDS] + $info, 200);
}

/* ---------- Format WordPress : les fichiers et la base de données ---------- */
function alexlia_copie_wordpress(ZipArchive $zip, $racine, $tmpdir) {
    $base = wp_normalize_path(untrailingslashit(ABSPATH));
    $exclus = ['wp-config.php', '.htaccess.bak', 'error_log'];
    $dossiersExclus = array_map('wp_normalize_path', [
        alexlia_copie_dossier()['dir'], WP_CONTENT_DIR . '/cache', WP_CONTENT_DIR . '/upgrade', WP_CONTENT_DIR . '/updraft', WP_CONTENT_DIR . '/ai1wm-backups',
        WP_CONTENT_DIR . '/backups', WP_CONTENT_DIR . '/backup-db', WP_CONTENT_DIR . '/uploads/backwpup', WP_CONTENT_DIR . '/litespeed', WP_CONTENT_DIR . '/et-cache',
    ]);
    $n = 0; $octets = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST);
    foreach ($it as $f) {
        $p = wp_normalize_path($f->getPathname());
        foreach ($dossiersExclus as $x) if ($p === $x || strpos($p, $x . '/') === 0) continue 2;
        if ($f->isLink() || !$f->isFile() || !$f->isReadable()) continue;
        $rel = ltrim(substr($p, strlen($base)), '/');
        // seulement WordPress : les fichiers de la racine et wp-admin, wp-includes, wp-content (pas les autres dossiers de l'hébergement)
        if (strpos($rel, '/') !== false && !preg_match('#^wp-(admin|includes|content)/#', $rel)) continue;
        if (in_array($rel, $exclus, true) || preg_match('#(^|/)\.(git|svn)/#', $rel) || preg_match('/\.(log|tmp)$/i', $rel)) continue;
        $zip->addFile($p, $racine . 'site/' . $rel);
        $n++; $octets += $f->getSize();
    }
    // la base de données : un fichier SQL, écrit petit à petit
    $sql = $tmpdir . '/base-' . wp_generate_password(12, false, false) . '.sql';
    $tables = alexlia_copie_sql($sql);
    $zip->addFile($sql, $racine . 'base-de-donnees.sql');
    // un modèle de wp-config, sans aucun mot de passe : le préfixe des tables est le bon
    global $wpdb;
    $zip->addFromString($racine . 'site/wp-config-a-completer.php', "<?php\n// À renommer en wp-config.php, puis à remplir avec les accès de la base de données de votre nouvel hébergeur.\ndefine('DB_NAME', 'nom_de_la_base');\ndefine('DB_USER', 'utilisateur');\ndefine('DB_PASSWORD', 'mot_de_passe');\ndefine('DB_HOST', 'localhost');\ndefine('DB_CHARSET', 'utf8mb4');\ndefine('DB_COLLATE', '');\n// De nouvelles clés secrètes : https://api.wordpress.org/secret-key/1.1/salt/\n\$table_prefix = '" . $wpdb->prefix . "';\ndefine('WP_DEBUG', false);\nif (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');\nrequire_once ABSPATH . 'wp-settings.php';\n");
    return ['fichiers' => $n, 'octets_fichiers' => $octets, 'tables' => $tables, 'prefixe' => $wpdb->prefix, 'adresse' => home_url('/')];
}
function alexlia_copie_sql($fichier) {
    global $wpdb;
    $h = fopen($fichier, 'w');
    if (!$h) throw new Exception('fichier SQL impossible à écrire');
    fwrite($h, "-- Copie de la base de données de " . home_url('/') . " (" . wp_date('Y-m-d H:i') . ")\n-- À importer dans une base vide (phpMyAdmin, onglet Importer).\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n");
    $tables = $wpdb->get_col($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($wpdb->prefix) . '%'));
    // jamais la clé de ce connecteur, ni les éléments temporaires
    $secrets = ['alexlia_secret', 'alexlia_journal'];
    foreach ($tables as $t) {
        $cr = $wpdb->get_row('SHOW CREATE TABLE `' . esc_sql($t) . '`', ARRAY_N);
        if (!$cr) continue;
        fwrite($h, "DROP TABLE IF EXISTS `$t`;\n" . $cr[1] . ";\n\n");
        $off = 0;
        do {
            $rows = $wpdb->get_results('SELECT * FROM `' . esc_sql($t) . '` LIMIT ' . $off . ', 500', ARRAY_A);
            foreach ((array) $rows as $r) {
                if ($t === $wpdb->options && (in_array($r['option_name'], $secrets, true) || strpos($r['option_name'], '_transient_') !== false)) continue;
                $v = array_map(function ($x) use ($wpdb) { return $x === null ? 'NULL' : "'" . $wpdb->_real_escape($x) . "'"; }, array_values($r));
                fwrite($h, 'INSERT INTO `' . $t . '` VALUES (' . implode(',', $v) . ");\n");
            }
            $off += 500;
        } while ($rows && count($rows) === 500);
        fwrite($h, "\n");
    }
    fwrite($h, "SET FOREIGN_KEY_CHECKS = 1;\n");
    fclose($h);
    return count($tables);
}

/* ---------- Format HTML et CSS : le site tel qu'on le voit ---------- */
function alexlia_copie_adresses() {
    $u = [home_url('/')];
    $types = array_values(array_intersect(['page', 'post', 'product'], get_post_types(['public' => true])));
    $ids = get_posts(['post_type' => $types, 'post_status' => 'publish', 'numberposts' => 400, 'fields' => 'ids', 'orderby' => 'menu_order date', 'order' => 'ASC', 'has_password' => false]);
    foreach ($ids as $id) { $l = get_permalink($id); if ($l) $u[] = $l; }
    $pp = (int) get_option('page_for_posts'); if ($pp) $u[] = get_permalink($pp);
    $tax = array_values(array_intersect(['category', 'product_cat'], get_taxonomies()));
    $termes = $tax ? get_terms(['taxonomy' => $tax, 'hide_empty' => true, 'number' => 100]) : [];
    foreach (is_array($termes) ? $termes : [] as $t) { $l = get_term_link($t); if (!is_wp_error($l)) $u[] = $l; }
    return array_values(array_unique(array_filter($u)));
}
/* Une adresse du site → [type, chemin dans le zip] ; null si elle mène ailleurs */
function alexlia_copie_cible($url, $hote, $basePath) {
    $url = html_entity_decode(trim($url), ENT_QUOTES);
    if ($url === '' || $url[0] === '#' || preg_match('#^(mailto|tel|data|javascript|sms):#i', $url)) return null;
    if (strpos($url, '//') === 0) $url = 'https:' . $url;
    $p = wp_parse_url($url);
    if (!empty($p['host']) && strtolower($p['host']) !== $hote && strtolower($p['host']) !== 'www.' . $hote && 'www.' . strtolower($p['host']) !== $hote) return null;
    if (empty($p['host']) && empty($p['path'])) return null;
    $path = rawurldecode($p['path'] ?? '/');
    if (empty($p['host']) && $path !== '' && $path[0] !== '/') return null; // relatif : laissé tel quel
    if ($basePath !== '/' && strpos($path, $basePath) === 0) $path = '/' . substr($path, strlen($basePath));
    if (strpos($path, '..') !== false || preg_match('#^/(wp-admin|wp-json|wp-login\.php|xmlrpc\.php|feed)#', $path) || strpos($path, 'admin-ajax.php') !== false) return null;
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext !== '' && $ext !== 'html' && $ext !== 'php') return ['fichier', ltrim($path, '/'), $p['fragment'] ?? ''];
    if ($ext === 'php') return null;
    $page = trim($path, '/');
    return ['page', ($page === '' ? '' : $page . '/') . 'index.html', $p['fragment'] ?? ''];
}
function alexlia_copie_relatif($de, $vers) { // chemins dans le zip, depuis la page $de vers $vers
    $n = substr_count($de, '/');
    return str_repeat('../', $n) . $vers;
}
function alexlia_copie_html(ZipArchive $zip, $racine) {
    $hote = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
    $basePath = trailingslashit((string) (wp_parse_url(home_url('/'), PHP_URL_PATH) ?: '/'));
    $fichiers = []; // chemin dans le zip => chemin sur le disque
    $pages = 0; $rates = [];
    $ajouterFichier = function ($rel) use (&$fichiers) {
        $rel = ltrim(preg_replace('/[?#].*$/', '', $rel), '/');
        if ($rel === '' || isset($fichiers[$rel])) return isset($fichiers[$rel]);
        $disque = wp_normalize_path(ABSPATH . $rel);
        if (strpos($disque, wp_normalize_path(ABSPATH)) !== 0 || !is_file($disque) || preg_match('/\.(php|sql|log|ini|htaccess)$/i', $disque)) return false;
        $fichiers[$rel] = $disque;
        return true;
    };
    $reecrire = function ($html, $depuis) use ($hote, $basePath, $ajouterFichier) {
        $map = function ($url) use ($depuis, $hote, $basePath, $ajouterFichier) {
            $c = alexlia_copie_cible($url, $hote, $basePath);
            if (!$c) return $url;
            if ($c[0] === 'fichier' && !$ajouterFichier($c[1])) return $url;
            return alexlia_copie_relatif($depuis, $c[1]) . ($c[2] !== '' ? '#' . $c[2] : '');
        };
        $html = preg_replace_callback('#\b(href|src|data-src|data-lazy-src|poster|action)=(["\'])(.*?)\2#is', function ($m) use ($map) { return $m[1] . '=' . $m[2] . $map($m[3]) . $m[2]; }, $html);
        $html = preg_replace_callback('#\b(srcset|data-srcset)=(["\'])(.*?)\2#is', function ($m) use ($map) {
            $parts = array_map(function ($x) use ($map) { $x = trim($x); if ($x === '') return $x; $b = preg_split('/\s+/', $x, 2); return $map($b[0]) . (isset($b[1]) ? ' ' . $b[1] : ''); }, explode(',', $m[3]));
            return $m[1] . '=' . $m[2] . implode(', ', $parts) . $m[2];
        }, $html);
        $html = preg_replace_callback('#url\(\s*(["\']?)([^)"\']+)\1\s*\)#i', function ($m) use ($map) { return 'url(' . $m[1] . $map($m[2]) . $m[1] . ')'; }, $html);
        return $html;
    };
    foreach (alexlia_copie_adresses() as $url) {
        $c = alexlia_copie_cible($url, $hote, $basePath);
        if (!$c || $c[0] !== 'page') continue;
        $r = wp_remote_get($url, ['timeout' => 25, 'redirection' => 3, 'sslverify' => false, 'headers' => ['User-Agent' => 'MinisMonstres-Copie/1.0']]);
        if (is_wp_error($r) || (int) wp_remote_retrieve_response_code($r) !== 200) { $rates[] = $url; continue; }
        $html = (string) wp_remote_retrieve_body($r);
        if (stripos(wp_remote_retrieve_header($r, 'content-type'), 'html') === false) continue;
        $html = preg_replace('#<link[^>]+rel=["\'](?:https://api\.w\.org/|EditURI|wlwmanifest|alternate|shortlink|pingback)["\'][^>]*>#i', '', $html);
        $zip->addFromString($racine . 'site/' . $c[1], $reecrire($html, $c[1]));
        $pages++;
    }
    // les feuilles de style : leurs propres images et polices, avec des liens relatifs
    $vus = [];
    while ($a = array_diff(array_keys($fichiers), array_keys($vus))) {
        foreach ($a as $rel) {
            $vus[$rel] = 1;
            if (strtolower(pathinfo($rel, PATHINFO_EXTENSION)) !== 'css') continue;
            $css = (string) @file_get_contents($fichiers[$rel]);
            $dir = trim(dirname($rel), '.');
            $css = preg_replace_callback('#url\(\s*(["\']?)([^)"\']+)\1\s*\)#i', function ($m) use ($rel, $dir, $hote, $basePath, $ajouterFichier) {
                $u = trim($m[2]);
                if (preg_match('#^(data:|https?:|//|/)#i', $u)) {
                    $c = alexlia_copie_cible($u, $hote, $basePath);
                    if (!$c || $c[0] !== 'fichier' || !$ajouterFichier($c[1])) return $m[0];
                    return 'url(' . $m[1] . alexlia_copie_relatif($rel, $c[1]) . $m[1] . ')';
                }
                $propre = preg_replace('/[?#].*$/', '', $u);
                $cible = wp_normalize_path(($dir !== '' ? $dir . '/' : '') . $propre);
                $segs = []; foreach (explode('/', $cible) as $s) { if ($s === '..') array_pop($segs); elseif ($s !== '.' && $s !== '') $segs[] = $s; }
                $ajouterFichier(implode('/', $segs));
                return $m[0];
            }, $css);
            $zip->addFromString($racine . 'site/' . $rel, $css);
            $fichiers[$rel] = false; // déjà mis dans le zip, réécrit
        }
    }
    $n = 0;
    foreach ($fichiers as $rel => $disque) { if ($disque) { $zip->addFile($disque, $racine . 'site/' . $rel); } $n++; }
    return ['pages' => $pages, 'fichiers' => $n, 'pages_ratees' => array_slice($rates, 0, 20), 'adresse' => home_url('/')];
}

function alexlia_copie_lisezmoi($format, $i) {
    $site = $i['adresse'] ?? home_url('/');
    $t = "LA COPIE DE VOTRE SITE\n" . str_repeat('=', 22) . "\n\nSite : " . $site . "\nCopie faite le " . wp_date('j F Y à H:i') . ".\n\n";
    if ($format === 'wordpress') {
        $t .= "Format : WordPress complet.\n\nCe que contient ce dossier :\n"
            . "- site/ : tous les fichiers du site (WordPress, le thème, les extensions et toutes vos images, dans site/wp-content/uploads).\n"
            . "- base-de-donnees.sql : vos pages, vos articles, vos réglages et, si vous en avez une, votre boutique.\n"
            . "- site/wp-config-a-completer.php : le fichier de réglages, sans aucun mot de passe.\n\n"
            . "Pour réinstaller votre site chez un autre hébergeur :\n"
            . "1. Envoyez le contenu du dossier site/ à la racine de votre hébergement (par FTP ou le gestionnaire de fichiers).\n"
            . "2. Créez une base de données vide, puis importez base-de-donnees.sql (phpMyAdmin, onglet « Importer »).\n"
            . "3. Renommez wp-config-a-completer.php en wp-config.php et remplissez-le avec les accès de la nouvelle base.\n"
            . "4. Si l'adresse du site change, remplacez l'ancienne adresse par la nouvelle dans la base (par exemple avec l'extension « Better Search Replace »).\n\n"
            . "Préfixe des tables : " . ($i['prefixe'] ?? 'wp_') . "\n"
            . "Pour votre sécurité, la copie ne contient ni les mots de passe du serveur, ni la clé du connecteur des Minis Monstres.\n";
    } else {
        $t .= "Format : pages HTML et CSS.\n\nCe que contient ce dossier :\n"
            . "- site/ : votre site tel que vos visiteurs le voient, avec les feuilles de style (CSS), les scripts, les images et les polices.\n"
            . "  Ouvrez site/index.html dans votre navigateur pour le parcourir sans connexion.\n\n"
            . "Pour le mettre en ligne ailleurs : envoyez le contenu du dossier site/ chez n'importe quel hébergeur.\n\n"
            . "Bon à savoir : une copie HTML est une photo du site. Ce qui demande un serveur ne fonctionne pas dedans :\n"
            . "le formulaire de contact, la recherche, le panier et le paiement d'une boutique.\n"
            . "Pour tout garder, demandez la copie « WordPress complet ».\n\n"
            . "Pages copiées : " . (int) ($i['pages'] ?? 0) . ". Fichiers : " . (int) ($i['fichiers'] ?? 0) . ".\n";
        if (!empty($i['pages_ratees'])) $t .= "Pages qui n'ont pas pu être copiées : " . implode(', ', $i['pages_ratees']) . "\n";
    }
    return $t . "\nLe site est à vous. Une question ? Écrivez-nous depuis votre espace client Les Minis Monstres.\n";
}
