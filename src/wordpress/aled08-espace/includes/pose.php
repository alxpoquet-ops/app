<?php
/**
 * Les Minis Monstres Espace client : poser tout seul le site d'un client sur l'hébergement o2switch.
 * Le nom de domaine est acheté chez OVH et pointe vers o2switch (voir provision.php). Une fois le https en place :
 *  1. une base de données est créée (cPanel) ;
 *  2. un petit fichier de pose est déposé dans le dossier du site ;
 *  3. on l'appelle étape par étape : WordPress, puis l'extension du type commandé (Essentiel, Visibilité, Boutique),
 *     qui règle le site, crée les pages et le relie à l'espace client ;
 *  4. le fichier s'efface, les identifiants sont rangés dans la note interne de la commande.
 * Rien n'est bloquant : si la pose échoue, la commande continue et Alex est prévenu.
 */
defined('ABSPATH') || exit;

function aled08e_pose_auto() { return get_option('aled08_pose_auto', '1') === '1'; }
function aled08e_pose_type($c) { return ['une-page' => 'essentiel', 'vitrine' => 'visibilite', 'boutique' => 'boutique'][$c['type']] ?? 'visibilite'; }
function aled08e_pose_dossier($dom) { return 'public_html/' . $dom; }

/* cPanel en POST (pour envoyer un fichier entier) */
function aled08e_pose_uapi_post($module, $func, $params) {
    if (!aled08e_cpanel_ok()) return new WP_Error('aled08_cpanel', 'cPanel non configuré.');
    if (aled08e_hb_cpanel_local('uapi')) {
        // de l'intérieur du serveur : un fichier s'écrit directement dans le dossier du compte, le reste passe par uapi
        if ($module === 'Fileman' && $func === 'save_file_content') {
            $home = (string) (posix_getpwuid(posix_geteuid())['dir'] ?? '');
            $dir = $home . '/' . trim((string) $params['dir'], '/');
            if ($home === '' || strpos((string) $params['dir'], '..') !== false || basename((string) $params['file']) !== (string) $params['file']) return new WP_Error('aled08_cpanel', 'Chemin refusé.');
            if (!is_dir($dir) && !wp_mkdir_p($dir)) return new WP_Error('aled08_cpanel', 'Dossier impossible à créer : ' . $params['dir']);
            return file_put_contents($dir . '/' . $params['file'], (string) $params['content']) === false ? new WP_Error('aled08_cpanel', 'Fichier impossible à écrire.') : true;
        }
        return aled08e_hb_cpanel_uapi($module, $func, $params);
    }
    $r = wp_remote_post(aled08e_hb_cpanel_base() . '/execute/' . rawurlencode($module) . '/' . rawurlencode($func), ['timeout' => 60, 'headers' => aled08e_hb_cpanel_headers(), 'body' => $params]);
    if (is_wp_error($r)) return new WP_Error('aled08_cpanel', 'cPanel injoignable : ' . $r->get_error_message());
    return aled08e_hb_cpanel_uapi_lire(json_decode((string) wp_remote_retrieve_body($r), true), (int) wp_remote_retrieve_response_code($r));
}

/* La base de données du site : un nom court, préfixé par le compte cPanel comme cPanel l'exige */
function aled08e_pose_base($cid) {
    $db = get_post_meta($cid, '_aled08_pose_db', true);
    if (is_array($db) && !empty($db['pret'])) return $db;
    if (!is_array($db) || empty($db['nom'])) {
        $nom = substr(ALED08_CPANEL_USER, 0, 8) . '_s' . substr(bin2hex(random_bytes(4)), 0, 6);
        $db = ['nom' => $nom, 'user' => $nom, 'mdp' => wp_generate_password(24, false, false), 'hote' => 'localhost', 'pret' => 0];
        update_post_meta($cid, '_aled08_pose_db', $db);
    }
    $deja = function ($e) { return is_wp_error($e) && (stripos($e->get_error_message(), 'exist') !== false); };
    $r = aled08e_hb_cpanel_uapi('Mysql', 'create_database', ['name' => $db['nom']]);
    if (is_wp_error($r) && !$deja($r)) return $r;
    $r = aled08e_pose_uapi_post('Mysql', 'create_user', ['name' => $db['user'], 'password' => $db['mdp']]);
    if (is_wp_error($r) && !$deja($r)) return $r;
    $r = aled08e_hb_cpanel_uapi('Mysql', 'set_privileges_on_database', ['user' => $db['user'], 'database' => $db['nom'], 'privileges' => 'ALL PRIVILEGES']);
    if (is_wp_error($r)) return $r;
    $db['pret'] = 1;
    update_post_meta($cid, '_aled08_pose_db', $db);
    return $db;
}

/* Le fichier de pose, avec ses réglages, déposé dans le dossier du site */
function aled08e_pose_deposer($c) {
    $cid = $c['id'];
    $db = aled08e_pose_base($cid);
    if (is_wp_error($db)) return $db;
    $jeton = wp_generate_password(40, false, false);
    $admin = ['user' => 'alex', 'email' => aled08e_to(), 'mdp' => wp_generate_password(20, false, false)];
    $type = aled08e_pose_type($c);
    $conf = [
        'jeton' => hash('sha256', $jeton), 'type' => $type,
        'db' => ['nom' => $db['nom'], 'user' => $db['user'], 'mdp' => $db['mdp'], 'hote' => $db['hote']],
        'site' => ['url' => 'https://' . $c['domaine'], 'titre' => $c['entreprise'] ?: trim($c['prenom'] . ' ' . $c['nom']) ?: $c['domaine']],
        'admin' => $admin,
        'extension' => plugins_url('pkg/minis-site-' . $type . '.zip', dirname(__FILE__)),
    ];
    $code = (string) file_get_contents(dirname(__DIR__) . '/pose/minis-pose.php');
    if (strpos($code, '/*CONFIG*/') === false) return new WP_Error('aled08_pose', 'Fichier de pose introuvable dans l’extension.');
    $code = str_replace('/*CONFIG*/', base64_encode(wp_json_encode($conf)), $code);
    $r = aled08e_pose_uapi_post('Fileman', 'save_file_content', ['dir' => aled08e_pose_dossier($c['domaine']), 'file' => 'minis-pose.php', 'content' => $code, 'from_charset' => 'UTF-8', 'to_charset' => 'UTF-8', 'fallback' => 0]);
    if (is_wp_error($r)) return $r;
    update_post_meta($cid, '_aled08_pose', ['jeton' => $jeton, 'admin' => $admin, 'type' => $type, 'le' => time(), 'ratees' => 0]);
    aled08e_cmd_journal($cid, 'Pose automatique : base ' . $db['nom'] . ' créée, fichier de pose déposé (' . $type . ').');
    return true;
}

/* Un appel au fichier de pose */
function aled08e_pose_appel($dom, $jeton) {
    $r = wp_remote_post('https://' . $dom . '/minis-pose.php', ['timeout' => 150, 'body' => ['t' => $jeton]]);
    if (is_wp_error($r)) return new WP_Error('aled08_pose', $r->get_error_message());
    $d = json_decode((string) wp_remote_retrieve_body($r), true);
    if (!is_array($d)) return new WP_Error('aled08_pose', 'réponse ' . (int) wp_remote_retrieve_response_code($r) . ' illisible');
    return $d;
}

/* Avancer la pose : 'fini', 'attente' (on reprend au prochain passage) ou 'abandon' */
function aled08e_pose_avancer($c) {
    $cid = $c['id'];
    if (!aled08e_pose_auto() || aled08e_hebergeur() !== 'cpanel' || !$c['domaine']) return 'fini';
    if (get_post_meta($cid, '_aled08_pose_fin', true)) return 'fini';
    @set_time_limit(300);
    $p = get_post_meta($cid, '_aled08_pose', true);
    if (!is_array($p) || empty($p['jeton'])) {
        $r = aled08e_pose_deposer($c);
        if (is_wp_error($r)) return aled08e_pose_rate($c, 'préparation : ' . $r->get_error_message());
        $p = get_post_meta($cid, '_aled08_pose', true);
    }
    $fin = time() + 50; // quelques étapes par passage, la suite au suivant
    while (time() < $fin) {
        $d = aled08e_pose_appel($c['domaine'], $p['jeton']);
        if (is_wp_error($d)) return aled08e_pose_rate($c, $d->get_error_message());
        if (empty($d['ok']) && !in_array(strtok((string) ($d['etape'] ?? ''), ':'), ['site'], true)) return aled08e_pose_rate($c, ($d['etape'] ?? '?') . ' : ' . ($d['message'] ?? ''));
        if (!empty($d['fini'])) {
            $rates = array_filter((array) ($d['rates'] ?? []));
            update_post_meta($cid, '_aled08_pose_fin', time());
            update_post_meta($cid, '_aled08_wp_admin', $p['admin']['user']);
            $note = (string) get_post_meta($cid, '_aled08_note', true);
            update_post_meta($cid, '_aled08_note', trim($note . "\nWordPress o2switch (" . $c['domaine'] . ') : admin « ' . $p['admin']['user'] . ' », mot de passe ' . $p['admin']['mdp'] . ' ; https://' . $c['domaine'] . '/wp-admin/'));
            delete_post_meta($cid, '_aled08_pose');
            aled08e_cmd_journal($cid, 'Pose automatique terminée : WordPress et l’extension « ' . $p['type'] . ' » sont en place' . ($rates ? ', à reprendre : ' . mb_substr(implode(' ; ', $rates), 0, 300) : '') . '. Lien avec l’espace client : ' . (($d['relie'] ?? '') === 'relie' ? 'fait' : 'à vérifier') . '.');
            return 'fini';
        }
    }
    return 'attente';
}
function aled08e_pose_rate($c, $msg) {
    $cid = $c['id'];
    $p = get_post_meta($cid, '_aled08_pose', true);
    $n = (is_array($p) ? (int) ($p['ratees'] ?? 0) : (int) get_post_meta($cid, '_aled08_pose_ratees', true)) + 1;
    if (is_array($p)) { $p['ratees'] = $n; update_post_meta($cid, '_aled08_pose', $p); } else update_post_meta($cid, '_aled08_pose_ratees', $n);
    aled08e_cmd_journal($cid, 'Pose automatique, essai ' . $n . ' : ' . mb_substr($msg, 0, 300));
    if ($n < 4) return 'attente';
    update_post_meta($cid, '_aled08_pose_fin', time());
    aled08e_prov_mail_owner($c, 'Pose automatique à finir à la main : ' . $c['domaine'], 'La pose automatique du site ' . $c['domaine'] . ' (commande ' . $c['ref'] . ") s’est arrêtée :\n" . $msg . "\n\nL’hébergement est prêt. Installez WordPress, puis mettez l’extension « minis-site-" . aled08e_pose_type($c) . " » : elle fait le reste.\n" . aled08e_cmd_admin_url($cid));
    return 'abandon';
}
