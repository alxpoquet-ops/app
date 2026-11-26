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
/* Le dossier du site dans le compte cPanel. Un domaine déjà attaché (par le client, ou avant nous) n'est pas forcément
 * dans public_html/<domaine> : on demande à cPanel son vrai dossier, sinon le fichier de pose partirait au mauvais endroit. */
function aled08e_pose_dossier($dom) {
    static $vu = [];
    $dom = strtolower((string) $dom);
    if (isset($vu[$dom])) return $vu[$dom];
    $defaut = 'public_html/' . $dom;
    $t = get_transient('aled08_pose_dir_' . md5($dom));
    if (is_string($t) && $t !== '') return $vu[$dom] = $t;
    $d = function_exists('aled08e_hb_cpanel_uapi') ? aled08e_hb_cpanel_uapi('DomainInfo', 'single_domain_data', ['domain' => $dom]) : null;
    $racine = is_array($d) ? (string) ($d['documentroot'] ?? '') : '';
    $maison = is_array($d) ? rtrim((string) ($d['homedir'] ?? ''), '/') : '';
    if ($racine !== '' && $maison !== '' && strpos($racine, $maison . '/') === 0 && strpos($racine, '..') === false) {
        $rel = trim(substr($racine, strlen($maison) + 1), '/');
        if ($rel !== '' && preg_match('#^[A-Za-z0-9._/-]+$#', $rel)) { set_transient('aled08_pose_dir_' . md5($dom), $rel, 10 * MINUTE_IN_SECONDS); return $vu[$dom] = $rel; }
    }
    return $vu[$dom] = $defaut;
}

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
    $r = aled08e_hb_cpanel_http('POST', '/execute/' . rawurlencode($module) . '/' . rawurlencode($func), $params, 60);
    if (is_wp_error($r)) return $r->get_error_code() === 'aled08_cpanel' ? $r : new WP_Error('aled08_cpanel', 'cPanel injoignable : ' . $r->get_error_message());
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

/* Le PHP du site (26 novembre 2026) : un domaine ajouté sur cPanel prend la version par défaut du compte, parfois trop
 * ancienne pour les extensions récentes (Contact Form 7 demande PHP 8.3). On passe CE domaine seul à la version 8 la plus
 * récente installée, si l'hébergeur le permet (MultiPHP). Sinon rien ne change : la pose choisit alors des versions qui vont. */
function aled08e_pose_php($c) {
    if (!function_exists('aled08e_hb_cpanel_uapi')) return;
    $inst = aled08e_hb_cpanel_uapi('LangPHP', 'php_get_installed_versions');
    $vh = aled08e_hb_cpanel_uapi('LangPHP', 'php_get_vhost_versions');
    if (is_wp_error($inst) || is_wp_error($vh)) return;
    $num = function ($v) { return preg_match('/php(\d)(\d+)/', (string) $v, $m) ? (int) $m[1] * 100 + (int) $m[2] : 0; };
    $meilleure = '';
    foreach ((array) ($inst['versions'] ?? $inst) as $v) if (is_string($v) && $num($v) >= 800 && $num($v) > $num($meilleure)) $meilleure = $v;
    $actuelle = '';
    foreach ((array) $vh as $l) if (is_array($l) && ($l['vhost'] ?? '') === $c['domaine']) $actuelle = (string) ($l['version'] ?? '');
    if ($meilleure === '' || $actuelle === '' || $num($actuelle) >= $num($meilleure)) return;
    $r = aled08e_hb_cpanel_uapi('LangPHP', 'php_set_vhost_versions', ['version' => $meilleure, 'vhost' => $c['domaine']]);
    aled08e_cmd_journal($c['id'], is_wp_error($r) ? 'PHP du site laissé en ' . $actuelle . ' (' . $r->get_error_message() . ').' : 'PHP du site passé de ' . $actuelle . ' à ' . $meilleure . '.');
}

/* Le fichier de pose, avec ses réglages, déposé dans le dossier du site */
function aled08e_pose_deposer($c, $reprise = false) {
    $cid = $c['id'];
    aled08e_pose_php($c);
    $db = aled08e_pose_base($cid);
    if (is_wp_error($db)) return $db;
    $jeton = wp_generate_password(40, false, false);
    // en reprise, WordPress est déjà installé : le compte d'Alex ne change pas (aucun mot de passe nouveau)
    $admin = $reprise ? ['user' => (string) get_post_meta($cid, '_aled08_wp_admin', true) ?: 'alex', 'email' => aled08e_to(), 'mdp' => '']
        : ['user' => 'alex', 'email' => aled08e_to(), 'mdp' => wp_generate_password(20, false, false)];
    $type = aled08e_pose_type($c);
    $conf = [
        'jeton' => hash('sha256', $jeton), 'type' => $type,
        'db' => ['nom' => $db['nom'], 'user' => $db['user'], 'mdp' => $db['mdp'], 'hote' => $db['hote']],
        'site' => ['url' => 'https://' . $c['domaine'], 'titre' => $c['entreprise'] ?: trim($c['prenom'] . ' ' . $c['nom']) ?: $c['domaine']],
        'admin' => $admin,
        'extension' => plugins_url('pkg/minis-site-' . $type . '.zip', dirname(__FILE__)),
        'reprise' => $reprise ? 1 : 0,
    ];
    $code = (string) file_get_contents(dirname(__DIR__) . '/pose/minis-pose.php');
    if (strpos($code, '/*CONFIG*/') === false) return new WP_Error('aled08_pose', 'Fichier de pose introuvable dans l’extension.');
    $code = str_replace('/*CONFIG*/', base64_encode(wp_json_encode($conf)), $code);
    $r = aled08e_pose_uapi_post('Fileman', 'save_file_content', ['dir' => aled08e_pose_dossier($c['domaine']), 'file' => 'minis-pose.php', 'content' => $code, 'from_charset' => 'UTF-8', 'to_charset' => 'UTF-8', 'fallback' => 0]);
    if (is_wp_error($r)) return $r;
    update_post_meta($cid, '_aled08_pose', ['jeton' => $jeton, 'admin' => $admin, 'type' => $type, 'le' => time(), 'ratees' => 0, 'reprise' => $reprise ? 1 : 0]);
    aled08e_cmd_journal($cid, $reprise ? 'Pose automatique reprise : fichier de pose redéposé pour refaire les étapes ratées (' . $type . ').' : 'Pose automatique : base ' . $db['nom'] . ' créée, fichier de pose déposé (' . $type . ').');
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
    // un seul passage à la fois (l'automate et la suite d'une reprise peuvent tomber ensemble)
    $verrou = 'aled08e_pose_verrou_' . (int) $cid;
    if (get_transient($verrou)) return 'attente';
    set_transient($verrou, 1, 200);
    $r = aled08e_pose_avancer_un($c);
    delete_transient($verrou);
    return $r;
}
function aled08e_pose_avancer_un($c) {
    $cid = $c['id'];
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
            $reprise = !empty($p['reprise']);
            update_post_meta($cid, '_aled08_pose_fin', time());
            update_post_meta($cid, '_aled08_wp_admin', $p['admin']['user']);
            if (!$reprise) {
                $note = (string) get_post_meta($cid, '_aled08_note', true);
                update_post_meta($cid, '_aled08_note', trim($note . "\nWordPress o2switch (" . $c['domaine'] . ') : admin « ' . $p['admin']['user'] . ' », mot de passe ' . $p['admin']['mdp'] . ' ; https://' . $c['domaine'] . '/wp-admin/'));
            }
            delete_post_meta($cid, '_aled08_pose');
            aled08e_cmd_journal($cid, ($reprise ? 'Pose reprise terminée' : 'Pose automatique terminée : WordPress et l’extension « ' . $p['type'] . ' » sont en place') . ($rates ? ', à reprendre : ' . mb_substr(implode(' ; ', $rates), 0, 300) : ($reprise ? ' : tout est en place' : '')) . '. Lien avec l’espace client : ' . (($d['relie'] ?? '') === 'relie' ? 'fait' : 'à vérifier') . '.');
            // une étape ratée (une extension, le formulaire) : la pose se relance toute seule, deux fois au plus, sans Alex
            if ($rates && (int) get_post_meta($cid, '_aled08_pose_reprises', true) < 2) {
                $r = aled08e_pose_reprendre($cid);
                return is_wp_error($r) ? 'fini' : 'attente';
            }
            if ($reprise && !$rates) aled08e_pose_apres_reprise($cid, (int) ($d['formulaire'] ?? 0));
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

/* =========================================================================
 *  La reprise de la pose (26 novembre 2026, aled08.fr : Contact Form 7 ne s'était pas installé).
 *  Le fichier de pose est redéposé en mode « reprise » : il ne refait que les extensions et le formulaire ratés, sans toucher
 *  aux pages ni au travail du constructeur. Elle part toute seule après une pose incomplète (deux fois au plus), et l'atelier
 *  peut la lancer : POST /aled08/v1/atelier/pose {commande, faire: "reprendre"}.
 * ========================================================================= */
function aled08e_pose_reprendre($cid) {
    $c = aled08e_cmd_get($cid);
    if (!$c || !$c['domaine']) return new WP_Error('aled08_pose', 'Commande ou domaine introuvable.');
    if (aled08e_hebergeur() !== 'cpanel') return new WP_Error('aled08_pose', 'La pose automatique ne se fait que sur l’hébergement cPanel.');
    if (!get_post_meta($cid, '_aled08_pose_fin', true) || get_post_meta($cid, '_aled08_pose', true)) return new WP_Error('aled08_pose', 'Une pose est déjà en cours pour ce site.');
    update_post_meta($cid, '_aled08_pose_reprises', (int) get_post_meta($cid, '_aled08_pose_reprises', true) + 1);
    $r = aled08e_pose_deposer($c, true);
    if (is_wp_error($r)) { aled08e_cmd_journal($cid, 'Pose reprise impossible : ' . $r->get_error_message()); return $r; }
    delete_post_meta($cid, '_aled08_pose_fin');
    delete_post_meta($cid, '_aled08_pose_ratees');
    if (!wp_next_scheduled('aled08e_pose_suite', [(int) $cid])) wp_schedule_single_event(time() + 30, 'aled08e_pose_suite', [(int) $cid]);
    return true;
}
/* la suite d'une reprise, hors de l'automate (la commande a déjà passé l'étape de la pose) */
add_action('aled08e_pose_suite', function ($cid) {
    $c = aled08e_cmd_get((int) $cid);
    if (!$c || get_post_meta((int) $cid, '_aled08_pose_fin', true)) return;
    if (aled08e_pose_avancer($c) === 'attente' && !wp_next_scheduled('aled08e_pose_suite', [(int) $cid])) wp_schedule_single_event(time() + 60, 'aled08e_pose_suite', [(int) $cid]);
});
/* Après une reprise réussie : si le site attendait Alex pour cette raison, il repart chez le constructeur avec la consigne. */
function aled08e_pose_apres_reprise($cid, $formulaire) {
    if (!function_exists('aled08e_chantier_etat') || aled08e_chantier_etat($cid) !== 'pour_alex') return;
    $texte = 'La pose a été reprise toute seule : les extensions sont en place'
        . ($formulaire ? ', avec Contact Form 7 et le formulaire de contact en français (shortcode [contact-form-7 id="' . (int) $formulaire . '" title="Formulaire de contact"]). Pose-le dans la partie Contact à la place de « Bientôt », fais l’essai d’envoi, puis renvoie au contrôle.' : '. Reprends le site là où tu l’as laissé, puis renvoie au contrôle.');
    if (function_exists('aled08e_agent_fil_ajouter')) aled08e_agent_fil_ajouter($cid, 'alex', $texte);
    delete_post_meta($cid, '_aled08_controle_tours');
    update_post_meta($cid, '_aled08_chantier', 'a_corriger');
    aled08e_cmd_journal($cid, 'Pose reprise : le site repart chez le constructeur.');
}
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/atelier/pose', ['methods' => 'POST', 'permission_callback' => function () { return current_user_can('manage_options'); }, 'callback' => function (WP_REST_Request $req) {
        $p = (array) $req->get_json_params();
        $cid = (int) ($p['commande'] ?? 0);
        if (($p['faire'] ?? '') !== 'reprendre') return new WP_Error('aled08_pose', 'À faire inconnu (reprendre).', ['status' => 400]);
        delete_post_meta($cid, '_aled08_pose_reprises'); // demandée par l'atelier : deux nouveaux essais automatiques
        $r = aled08e_pose_reprendre($cid);
        if (is_wp_error($r)) return new WP_Error('aled08_pose', $r->get_error_message(), ['status' => 409]);
        return new WP_REST_Response(['ok' => true, 'note' => 'Fichier de pose redéposé : la reprise avance toute seule dans la minute (journal de la commande).'], 200);
    }]);
});

/* =========================================================================
 *  À la livraison (26 novembre 2026) : le site part réglé, sans Alex.
 *  - le formulaire de contact écrit à l'adresse donnée dans le questionnaire (« L'adresse e-mail qui reçoit les messages »),
 *    sinon à celle du compte du client : à la pose, Contact Form 7 écrit à l'administrateur (Alex) ; son message de
 *    confirmation ne promet aucun délai de réponse (« Merci, votre message est bien parti. ») ;
 *  - le site s'ouvre aux moteurs de recherche : la pose installe WordPress fermé aux moteurs, pour que le site en travaux ne
 *    soit pas lu par Google. Les sites d'essai et de démonstration (TEST-…, ESSAI-…) restent fermés.
 *  Un tout petit fichier est déposé par cPanel (comme le fichier de pose), fait ces deux réglages, puis s'efface : rien ne
 *  dépend des versions des extensions du site du client.
 * ========================================================================= */
function aled08e_pose_livraison($cid) {
    $c = aled08e_cmd_get($cid);
    if (!$c || !$c['domaine'] || aled08e_hebergeur() !== 'cpanel' || !get_post_meta($cid, '_aled08_pose_fin', true)) return false;
    $essai = get_post_meta($cid, '_aled08_essai', true) || preg_match('/^(TEST|ESSAI)-/i', (string) $c['ref']);
    $brief = get_post_meta($cid, '_aled08_brief', true);
    $email = is_array($brief) ? sanitize_email((string) ($brief['formulaire_email'] ?? '')) : '';
    if (!is_email($email)) $email = is_email($c['email']) ? $c['email'] : '';
    $jeton = wp_generate_password(40, false, false);
    $code = "<?php\nerror_reporting(0);\nheader('Content-Type: application/json; charset=utf-8');\nheader('Cache-Control: no-store');\n"
        . "if (!hash_equals('" . hash('sha256', $jeton) . "', hash('sha256', (string) (\$_POST['t'] ?? '')))) { http_response_code(403); echo '{\"ok\":false}'; exit; }\n"
        . "require __DIR__ . '/wp-load.php';\n\$dit = ['ok' => true];\n"
        . ($essai ? '' : "update_option('blog_public', '1');\n\$dit['moteurs'] = get_option('blog_public') === '1';\n")
        . "\$e = " . var_export($email, true) . ";\n"
        . "\$id = (int) get_option('minis_site_formulaire');\n"
        . "if (\$e !== '' && \$id && class_exists('WPCF7_ContactForm') && (\$f = WPCF7_ContactForm::get_instance(\$id))) { \$p = \$f->get_properties(); \$m = is_array(\$p['mail'] ?? null) ? \$p['mail'] : []; \$m['recipient'] = \$e; \$g = is_array(\$p['messages'] ?? null) ? \$p['messages'] : []; \$g['mail_sent_ok'] = 'Merci, votre message est bien parti.'; \$f->set_properties(['mail' => \$m, 'messages' => \$g]); \$f->save(); \$dit['formulaire'] = \$e; }\n"
        . "@unlink(__FILE__);\necho json_encode(\$dit);\n";
    $r = aled08e_pose_uapi_post('Fileman', 'save_file_content', ['dir' => aled08e_pose_dossier($c['domaine']), 'file' => 'minis-livraison.php', 'content' => $code, 'from_charset' => 'UTF-8', 'to_charset' => 'UTF-8', 'fallback' => 0]);
    if (is_wp_error($r)) { aled08e_cmd_journal($cid, 'Réglages de livraison ratés : ' . $r->get_error_message()); return false; }
    $rep = wp_remote_post('https://' . $c['domaine'] . '/minis-livraison.php', ['timeout' => 30, 'body' => ['t' => $jeton]]);
    $d = is_wp_error($rep) ? null : json_decode((string) wp_remote_retrieve_body($rep), true);
    if (!is_array($d) || empty($d['ok'])) { aled08e_cmd_journal($cid, 'Réglages de livraison ratés : ' . (is_wp_error($rep) ? $rep->get_error_message() : 'réponse ' . (int) wp_remote_retrieve_response_code($rep))); return false; }
    aled08e_cmd_journal($cid, 'Livraison : ' . ($essai ? 'site d’essai laissé fermé aux moteurs de recherche' : (!empty($d['moteurs']) ? 'site ouvert aux moteurs de recherche' : 'ouverture aux moteurs ratée'))
        . (!empty($d['formulaire']) ? ', le formulaire écrit à ' . $d['formulaire'] : ', formulaire non réglé (pas de formulaire ou pas d’adresse)') . '.');
    return true;
}
