<?php
/**
 * Plugin Name: Alex & Lia Espace client
 * Description: L'espace client Alex & Lia sur la page /mon-espace/ et la gestion du site : commandes passées sur /commander/, paiement Stripe, comptes clients automatiques, demandes de modification, parrainage, tableau de bord.
 * Version: 2.0.0
 * Requires PHP: 7.4
 * Author: Alex & Lia
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('ALED08E_VERSION', '2.0.0');
define('ALED08E_FILE', __FILE__);
define('ALED08E_ROLE', 'aled08_client');
define('ALED08E_CPT', 'aled08_demande');
define('ALED08E_CPT_CMD', 'aled08_commande');

/* =========================================================================
 *  Données (forfaits, types de site, options, montants, icônes, monstres) : data.json, généré depuis le site
 * ========================================================================= */
function aled08e_data() {
    static $d = null;
    if ($d === null) {
        $raw = @file_get_contents(__DIR__ . '/data.json');
        $d = $raw ? (json_decode($raw, true) ?: []) : [];
        $d += [
            'name' => 'Alex & Lia', 'whatsapp' => '', 'email' => '',
            'forfaits' => [], 'types' => [], 'options' => [], 'icons' => [], 'monsters' => [],
            'moisOfferts' => 2, 'lissageDurees' => [6, 12], 'acompte' => 30, 'parrainageMois' => 1, 'remiseSecondSite' => 10,
            'delais' => ['reponse' => '48 heures', 'titan' => '24 heures'],
        ];
    }
    return $d;
}
function aled08e_icon($n) { $d = aled08e_data(); return $d['icons'][$n] ?? ''; }
function aled08e_monster($n) { $d = aled08e_data(); return $d['monsters'][$n] ?? ($d['monsters']['mascotte'] ?? ''); }
function aled08e_forfait($id) {
    foreach (aled08e_data()['forfaits'] as $f) if ($f['id'] === $id) return $f;
    $all = aled08e_data()['forfaits'];
    return $all ? $all[0] : ['id' => 'chico', 'name' => 'Chico', 'month' => 5, 'quota' => 1, 'modifs' => 'Une modification par mois', 'color' => 'pink', 'tagline' => ''];
}
function aled08e_type($id) {
    foreach (aled08e_data()['types'] as $t) if ($t['id'] === $id) return $t;
    return null;
}
function aled08e_option($id) {
    foreach (aled08e_data()['options'] as $o) if ($o['id'] === $id) return $o;
    return null;
}
/* Montant en HTML (espace insécable avant l'euro) et en texte brut (pour les e-mails) */
function aled08e_euro($n) {
    $n = (float) $n;
    return number_format($n, floor($n) == $n ? 0 : 2, ',', ' ') . '&nbsp;€';
}
function aled08e_euro_txt($n) {
    $n = (float) $n;
    return number_format($n, floor($n) == $n ? 0 : 2, ',', ' ') . ' €';
}
function aled08e_to() {
    if (get_option('aled08_form_to')) return get_option('aled08_form_to');
    return defined('ALED08_FORM_TO') ? ALED08_FORM_TO : get_option('admin_email');
}
function aled08e_url($q = []) { return add_query_arg($q, home_url('/mon-espace/')); }
function aled08e_meta($uid, $k) { return (string) get_user_meta($uid, 'aled08_' . $k, true); }
function aled08e_mail_headers($reply = '') {
    $h = ['Content-Type: text/plain; charset=UTF-8'];
    // « Alex & Lia <x@y> » : le nom affiché contient un caractère spécial, on le met entre guillemets
    if ($reply && preg_match('/^\s*([^<"]+?)\s*<([^>]+)>\s*$/', $reply, $mm)) $reply = '"' . str_replace('"', '', $mm[1]) . '" <' . $mm[2] . '>';
    if ($reply) $h[] = 'Reply-To: ' . $reply;
    return $h;
}
function aled08e_date($mysql) { return $mysql ? wp_date('j F Y', strtotime(get_gmt_from_date($mysql) . ' UTC')) : ''; }
function aled08e_prenom($u) { return $u ? ($u->first_name ?: $u->display_name) : ''; }

/* Statuts d'une demande */
function aled08e_statuts() {
    return ['recue' => ['Reçue', 'st-new'], 'encours' => ['En cours', 'st-doing'], 'faite' => ['Faite', 'st-done']];
}

/* =========================================================================
 *  Les autres parties de l'extension
 * ========================================================================= */
require_once __DIR__ . '/includes/comptes.php';
require_once __DIR__ . '/includes/commandes.php';
require_once __DIR__ . '/includes/stripe.php';
require_once __DIR__ . '/includes/admin.php';
require_once __DIR__ . '/includes/ovh.php';
require_once __DIR__ . '/includes/provision.php';
require_once __DIR__ . '/includes/lia.php';
require_once __DIR__ . '/includes/compte.php';
require_once __DIR__ . '/includes/inscription.php';

/* =========================================================================
 *  Rôle « Client Alex & Lia » et type de contenu « Demande »
 * ========================================================================= */
function aled08e_add_role() {
    if (!get_role(ALED08E_ROLE)) add_role(ALED08E_ROLE, 'Client Alex & Lia', ['read' => true]);
}
register_activation_hook(__FILE__, function () {
    aled08e_add_role();
    aled08e_planifier_quotidien();
});
register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook('aled08_quotidien');
    wp_clear_scheduled_hook('aled08_provision');
});

add_action('init', function () {
    aled08e_add_role();
    register_post_type(ALED08E_CPT, [
        'labels' => [
            'name' => 'Demandes clients', 'singular_name' => 'Demande', 'menu_name' => 'Demandes clients',
            'all_items' => 'Demandes clients', 'edit_item' => 'Demande du client', 'view_item' => 'Voir la demande',
            'search_items' => 'Chercher une demande', 'not_found' => 'Aucune demande pour le moment.', 'not_found_in_trash' => 'Aucune demande dans la corbeille.',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => 'aled08',
        'show_in_rest' => false,
        'supports' => ['title', 'editor', 'author', 'thumbnail'],
        'capability_type' => 'post',
        'capabilities' => aled08e_cpt_caps(), // réservé à l'administrateur (manage_options), voir includes/commandes.php
        'map_meta_cap' => true,
    ]);
}, 10);

/* =========================================================================
 *  Connexion : retour sur /mon-espace/, pas d'administration pour les clients
 * ========================================================================= */
function aled08e_is_client($user = null) {
    $user = $user ?: wp_get_current_user();
    return $user && $user->exists() && in_array(ALED08E_ROLE, (array) $user->roles, true);
}
add_filter('login_redirect', function ($to, $requested, $user) {
    if ($user instanceof WP_User && aled08e_is_client($user)) return aled08e_url();
    return $to;
}, 20, 3);
add_action('wp_login_failed', function () {
    if (!empty($_POST['aled08_login'])) { wp_safe_redirect(aled08e_url(['connexion' => 'erreur']), 303); exit; }
});
/* Connexion depuis la page /mon-espace/ elle-même (la page wp-login.php est filtrée par le pare-feu de l'hébergeur) */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08_login'])) return;
    if (is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    // les champs doivent être des chaînes (un tableau log[]=… ferait planter is_email)
    $log = $_POST['log'] ?? '';
    $pwd = $_POST['pwd'] ?? '';
    if (!is_string($log) || !is_string($pwd)) { wp_safe_redirect(aled08e_url(['connexion' => 'erreur']), 303); exit; }
    $log = wp_unslash($log);
    $login = is_email($log) ? sanitize_email($log) : sanitize_user($log);
    $pass = (string) wp_unslash($pwd);
    if ($login === '' || $pass === '') { wp_safe_redirect(aled08e_url(['connexion' => 'erreur']), 303); exit; }
    $user = wp_signon(['user_login' => $login, 'user_password' => $pass, 'remember' => !empty($_POST['rememberme'])], is_ssl());
    if (is_wp_error($user)) { wp_safe_redirect(aled08e_url(['connexion' => 'erreur']), 303); exit; }
    wp_safe_redirect(aled08e_url(), 303);
    exit;
}, 1);
add_action('admin_init', function () {
    if (wp_doing_ajax() || !aled08e_is_client()) return;
    $script = basename(isset($_SERVER['SCRIPT_NAME']) ? wp_unslash($_SERVER['SCRIPT_NAME']) : '');
    if ($script === 'admin-post.php') return;
    wp_safe_redirect(aled08e_url());
    exit;
});
add_filter('show_admin_bar', function ($show) { return aled08e_is_client() ? false : $show; });

/* E-mail d'arrivée d'un nouveau client : le lien pour choisir son mot de passe, en français simple.
 * Quand le compte vient d'une commande, l'e-mail la mentionne (contexte posé par includes/comptes.php). */
add_filter('wp_new_user_notification_email', function ($email, $user) {
    if (!aled08e_is_client($user)) return $email;
    $link = '';
    if (preg_match('#(https?://\S*action=rp\S*)#', $email['message'], $m)) $link = rtrim($m[1], '>');
    if (!$link) return $email;
    $ctx = aled08e_compte_contexte();
    $email['subject'] = 'Votre espace client Alex & Lia';
    $email['message'] = 'Bonjour ' . aled08e_prenom($user) . ",\n\n"
        . ($ctx && !empty($ctx['ref'])
            ? 'Votre commande ' . $ctx['ref'] . ' est bien enregistrée. Votre espace client Alex & Lia est prêt : vous y suivez votre commande, puis vous y envoyez vos demandes de modification. Vous y retrouvez aussi votre QR code, votre lien d’avis, votre parrainage et vos factures.' . "\n\n"
            : (get_user_meta($user->ID, 'aled08_inscrit_seul', true) ? 'Votre compte Alex & Lia est créé, merci ! Quand vous commanderez votre site, vous y suivrez tout : la commande, vos demandes de modification à Lia ou à Alex, votre QR code et votre parrainage.' . "\n\n"
            : 'Votre espace client Alex & Lia est prêt. Vous y envoyez vos demandes de modification, vous suivez leur avancement, et vous retrouvez votre QR code, votre lien d’avis, votre parrainage et vos factures.' . "\n\n"))
        . "Pour choisir votre mot de passe, ouvrez ce lien :\n" . $link . "\n\n"
        . "Ensuite, connectez-vous ici :\n" . aled08e_url() . "\n"
        . 'Votre identifiant : ' . $user->user_login . " (ou votre adresse e-mail)\n\n"
        . "À bientôt,\nAlex, et Lia\n";
    $email['headers'] = 'Content-Type: text/plain; charset=UTF-8';
    return $email;
}, 10, 2);

/* Pas de cache pour l'espace client ni pour la page de confirmation de commande */
add_action('template_redirect', function () {
    if (!is_page('mon-espace') && !is_page('commande-confirmee')) return;
    nocache_headers();
    do_action('litespeed_control_set_nocache', 'espace client Alex & Lia');
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
}, 0);

/* =========================================================================
 *  Parrainage
 * ========================================================================= */
function aled08e_clean_code($c) { return strtoupper(substr(preg_replace('/[^A-Za-z0-9-]/', '', (string) $c), 0, 20)); }
function aled08e_user_by_code($code) {
    $code = aled08e_clean_code($code);
    if (strlen($code) < 3) return null;
    $u = get_users(['meta_key' => 'aled08_code', 'meta_value' => $code, 'number' => 1]);
    return $u ? $u[0] : null;
}
function aled08e_code($uid) {
    $c = aled08e_meta($uid, 'code');
    if ($c) return $c;
    $u = get_userdata($uid);
    $base = strtoupper(preg_replace('/[^A-Za-z]/', '', remove_accents($u->first_name ?: $u->display_name)));
    $base = substr($base ?: 'ALED', 0, 6);
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
        $suffix = '';
        for ($i = 0; $i < 3; $i++) $suffix .= $chars[wp_rand(0, strlen($chars) - 1)];
        $c = $base . '-' . $suffix;
    } while (aled08e_user_by_code($c));
    update_user_meta($uid, 'aled08_code', $c);
    return $c;
}
function aled08e_filleuls($uid) {
    $code = aled08e_meta($uid, 'code');
    if (!$code) return [];
    return get_users(['meta_key' => 'aled08_parrain', 'meta_value' => $code]);
}

/* Le formulaire de contact du thème signale un code de parrainage : on le note chez le parrain */
add_filter('aled08_parrain_info', function ($info, $code, $nom) {
    $p = aled08e_user_by_code($code);
    if (!$p) return 'code inconnu';
    $list = get_user_meta($p->ID, 'aled08_filleuls_demandes', true);
    $list = is_array($list) ? $list : [];
    $first = trim(strtok((string) $nom, ' '));
    $list[] = ['nom' => mb_substr($first, 0, 40), 'date' => current_time('mysql')];
    update_user_meta($p->ID, 'aled08_filleuls_demandes', array_slice($list, -50));
    return $p->display_name . ' (' . $p->user_email . ')';
}, 10, 3);

/* =========================================================================
 *  Demandes de modification : envoi depuis l'espace
 * ========================================================================= */
/* Demandes du mois : $par = 'alex' (modifications à la main), 'lia' (jetons Lia, automatisations) ou '' (toutes) */
function aled08e_count_month($uid, $par = 'alex') {
    $args = [
        'post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => ['private', 'publish'], 'fields' => 'ids',
        'posts_per_page' => 200, 'no_found_rows' => true,
        'date_query' => [['year' => (int) wp_date('Y'), 'month' => (int) wp_date('n')]],
    ];
    if ($par === 'lia') $args['meta_query'] = [['key' => '_aled08_par', 'value' => 'lia']];
    if ($par === 'alex') $args['meta_query'] = ['relation' => 'OR', ['key' => '_aled08_par', 'value' => 'alex'], ['key' => '_aled08_par', 'compare' => 'NOT EXISTS']];
    $q = new WP_Query($args);
    return count($q->posts);
}
/* Jetons Lia du forfait (null = illimité) */
function aled08e_jetons($f) { return array_key_exists('jetons', $f) ? $f['jetons'] : 1; }

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_demande'])) return;
    $back = function ($m) { wp_safe_redirect(aled08e_url(['m' => $m]) . '#demandes', 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(isset($_POST['_aled08e']) ? sanitize_text_field(wp_unslash($_POST['_aled08e'])) : '', 'aled08e_demande')) $back('erreur');

    $uid = get_current_user_id();
    $txt = trim(sanitize_textarea_field(wp_unslash($_POST['demande'] ?? '')));
    if ($txt === '') $back('vide');
    $txt = mb_substr($txt, 0, 4000);

    // garde-fou : pas plus de 10 demandes par jour
    $today = new WP_Query(['post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => 'private', 'fields' => 'ids', 'posts_per_page' => 11, 'no_found_rows' => true, 'date_query' => [['after' => '24 hours ago']]]);
    if (count($today->posts) >= 10) $back('trop');

    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    // par Lia (automatique, un jeton) ou par Alex (à la main) ; plus de jeton ce mois-ci : la demande passe à Alex
    $par = sanitize_key(wp_unslash($_POST['par'] ?? 'alex')) === 'lia' ? 'lia' : 'alex';
    $jetons = aled08e_jetons($f);
    $illim = aled08e_meta($uid, 'illimite') === '1';
    $partage = !empty($f['partage']) && !$illim;
    $usedTot = $partage ? aled08e_count_month($uid, 'alex') + aled08e_count_month($uid, 'lia') : 0;
    if ($par === 'lia' && $jetons !== null && ($partage ? $usedTot >= (int) $f['quota'] : aled08e_count_month($uid, 'lia') >= (int) $jetons)) $par = 'alex';
    $over = $par === 'alex' && !$illim && ($partage ? $usedTot >= (int) $f['quota'] : aled08e_count_month($uid, 'alex') >= (int) $f['quota']);
    $title = mb_strlen($txt) > 70 ? rtrim(mb_substr($txt, 0, 67)) . '…' : $txt;
    $title = trim(preg_replace('/\s+/', ' ', $title));
    $pid = wp_insert_post(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'post_author' => $uid, 'post_title' => $title, 'post_content' => $txt, 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
    if (is_wp_error($pid)) $back('erreur');
    update_post_meta($pid, '_aled08_statut', 'recue');
    update_post_meta($pid, '_aled08_par', $par);
    if ($over) update_post_meta($pid, '_aled08_hors_forfait', 1);

    $photo = '';
    $photoFail = false;
    if (!empty($_FILES['photo']['name'])) {
        if (!empty($_FILES['photo']['error']) || $_FILES['photo']['size'] > 8 * 1024 * 1024) {
            $photoFail = true;
        } else {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            $att = media_handle_upload('photo', $pid, ['post_author' => $uid], [
                'test_form' => false,
                'mimes' => ['jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp', 'heic' => 'image/heic'],
            ]);
            if (is_wp_error($att)) $photoFail = true;
            else { set_post_thumbnail($pid, $att); $photo = wp_get_attachment_url($att); }
        }
    }

    $u = wp_get_current_user();
    $delai = $f['id'] === 'titan' ? aled08e_data()['delais']['titan'] : aled08e_data()['delais']['reponse'];
    $corps = "Nouvelle demande de modification\n\n"
        . 'Client   : ' . $u->display_name . ' (' . $u->user_email . ")\n"
        . 'Site     : ' . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\n"
        . 'Forfait  : ' . $f['name'] . ' (réponse sous ' . $delai . ')' . ($over ? ' (modifications du mois déjà utilisées)' : '') . "\n"
        . 'Par      : ' . ($par === 'lia' ? 'Lia (jeton, automatisation avec vos outils)' : 'Alex (modification à la main)') . "\n"
        . ($photo ? "Photo    : $photo\n" : '')
        . "\nDemande :\n$txt\n\n"
        . 'Suivre et répondre : ' . admin_url('post.php?post=' . $pid . '&action=edit') . "\n";
    wp_mail(aled08e_to(), 'Demande de modification : ' . $u->display_name, $corps, aled08e_mail_headers($u->display_name . ' <' . $u->user_email . '>'));
    do_action('aled08e_demande_creee', $pid, $par, $uid);

    $back($photoFail ? 'photo' : ($over ? 'hors' : 'ok'));
}, 5);

/* =========================================================================
 *  Administration des demandes : statut, réponse, colonnes
 * ========================================================================= */
add_action('add_meta_boxes_' . ALED08E_CPT, function ($post) {
    add_meta_box('aled08e_suivi', 'Suivi de la demande', 'aled08e_suivi_box', ALED08E_CPT, 'side', 'high');
    add_meta_box('aled08e_client', 'Client', 'aled08e_client_box', ALED08E_CPT, 'side', 'default');
});
function aled08e_suivi_box($post) {
    wp_nonce_field('aled08e_suivi', '_aled08e_suivi');
    $st = get_post_meta($post->ID, '_aled08_statut', true) ?: 'recue';
    echo '<p><label for="aled08e-st"><strong>Statut</strong></label><br><select id="aled08e-st" name="aled08e_statut" style="width:100%">';
    foreach (aled08e_statuts() as $k => $v) echo '<option value="' . esc_attr($k) . '"' . selected($st, $k, false) . '>' . esc_html($v[0]) . '</option>';
    echo '</select></p>';
    echo '<p><label for="aled08e-rep"><strong>Message au client</strong> (facultatif, affiché dans son espace)</label><textarea id="aled08e-rep" name="aled08e_reponse" rows="4" style="width:100%">' . esc_textarea(get_post_meta($post->ID, '_aled08_reponse', true)) . '</textarea></p>';
    echo '<p class="description">Quand vous passez la demande à « Faite », le client reçoit un e-mail.</p>';
    if (get_post_meta($post->ID, '_aled08_hors_forfait', true)) echo '<p style="color:#b32d2e"><strong>Hors forfait :</strong> les modifications du mois étaient déjà utilisées.</p>';
}
function aled08e_client_box($post) {
    $u = get_userdata($post->post_author);
    if (!$u) { echo '<p>Client inconnu.</p>'; return; }
    $f = aled08e_forfait(aled08e_meta($u->ID, 'forfait'));
    echo '<p><strong>' . esc_html($u->display_name) . '</strong><br><a href="mailto:' . esc_attr($u->user_email) . '">' . esc_html($u->user_email) . '</a></p>';
    if (aled08e_meta($u->ID, 'site')) echo '<p>Site : <a href="' . esc_url(aled08e_meta($u->ID, 'site')) . '" target="_blank" rel="noopener">' . esc_html(aled08e_meta($u->ID, 'site')) . '</a></p>';
    $jt = aled08e_jetons($f);
    echo '<p>Forfait : ' . esc_html($f['name']) . ' · Alex ' . (int) aled08e_count_month($u->ID, 'alex') . ' / ' . (int) $f['quota'] . ' · Lia ' . (int) aled08e_count_month($u->ID, 'lia') . ' / ' . ($jt === null ? 'illimité' : (int) $jt) . ' ce mois-ci</p>';
    $par = get_post_meta($post->ID, '_aled08_par', true) === 'lia' ? 'Lia (jeton, automatisation)' : 'Alex (à la main)';
    echo '<p><strong>Demandée à : ' . esc_html($par) . '</strong></p>';
    echo '<p><a href="' . esc_url(get_edit_user_link($u->ID)) . '#aled08e">Fiche client</a></p>';
    if (has_post_thumbnail($post)) echo '<p>' . get_the_post_thumbnail($post, 'medium', ['style' => 'max-width:100%;height:auto;border-radius:8px']) . '</p>';
}
add_action('save_post_' . ALED08E_CPT, function ($pid, $post) {
    if (!isset($_POST['_aled08e_suivi']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_suivi'])), 'aled08e_suivi')) return;
    if (!current_user_can('edit_post', $pid) || wp_is_post_revision($pid)) return;
    $old = get_post_meta($pid, '_aled08_statut', true) ?: 'recue';
    $new = sanitize_key(wp_unslash($_POST['aled08e_statut'] ?? 'recue'));
    if (!isset(aled08e_statuts()[$new])) $new = 'recue';
    $rep = sanitize_textarea_field(wp_unslash($_POST['aled08e_reponse'] ?? ''));
    update_post_meta($pid, '_aled08_statut', $new);
    update_post_meta($pid, '_aled08_reponse', $rep);
    if ($new === 'faite' && $old !== 'faite') {
        update_post_meta($pid, '_aled08_faite_le', current_time('mysql'));
        $u = get_userdata($post->post_author);
        if ($u) {
            $corps = 'Bonjour ' . aled08e_prenom($u) . ",\n\n"
                . "Votre demande est faite et en ligne :\n« " . $post->post_title . " »\n\n"
                . ($rep ? $rep . "\n\n" : '')
                . "Vous retrouvez le suivi de vos demandes dans votre espace client :\n" . aled08e_url() . "#demandes\n\n"
                . "À bientôt,\nAlex, et Lia\n";
            wp_mail($u->user_email, 'Votre modification est en ligne', $corps, aled08e_mail_headers('Alex & Lia <' . aled08e_to() . '>'));
        }
    }
}, 10, 2);
/* Statut privé conservé quand on enregistre depuis l'administration (demandes et commandes) */
add_filter('wp_insert_post_data', function ($data) {
    if (in_array($data['post_type'], [ALED08E_CPT, ALED08E_CPT_CMD], true) && in_array($data['post_status'], ['publish', 'future', 'pending', 'draft'], true)) $data['post_status'] = 'private';
    return $data;
});

add_filter('manage_' . ALED08E_CPT . '_posts_columns', function ($c) {
    return ['cb' => $c['cb'] ?? '', 'title' => 'Demande', 'aled08_client' => 'Client', 'aled08_par' => 'Par', 'aled08_statut' => 'Statut', 'date' => 'Date'];
});
add_action('manage_' . ALED08E_CPT . '_posts_custom_column', function ($col, $pid) {
    if ($col === 'aled08_par') echo get_post_meta($pid, '_aled08_par', true) === 'lia' ? '<strong>Lia</strong> (jeton)' : 'Alex';
    if ($col === 'aled08_client') {
        $u = get_userdata(get_post_field('post_author', $pid));
        echo $u ? esc_html($u->display_name) : '';
    }
    if ($col === 'aled08_statut') {
        $st = get_post_meta($pid, '_aled08_statut', true) ?: 'recue';
        $colors = ['recue' => '#2C67AE', 'encours' => '#9a6a00', 'faite' => '#1f7a55'];
        echo '<strong style="color:' . esc_attr($colors[$st] ?? '#333') . '">' . esc_html(aled08e_statuts()[$st][0] ?? $st) . '</strong>';
        if (get_post_meta($pid, '_aled08_hors_forfait', true)) echo '<br><small>hors forfait</small>';
    }
}, 10, 2);

/* =========================================================================
 *  Fiche client (profil utilisateur, réservé à l'administrateur)
 * ========================================================================= */
function aled08e_fields() {
    $forfaits = [];
    foreach (aled08e_data()['forfaits'] as $f) $forfaits[$f['id']] = $f['name'];
    if (!$forfaits) $forfaits = ['chico' => 'Chico', 'power' => 'Power', 'titan' => 'Titan'];
    return [
        'forfait' => ['Forfait', 'select', $forfaits],
        'paiement' => ['Paiement du forfait', 'select', ['mois' => 'Au mois', 'annee' => 'À l’année']],
        'site' => ['Adresse du site', 'url', 'https://www.exemple.fr'],
        'mail' => ['Option e-mail pro', 'check', 'Active'],
        'stock' => ['Option gestion du stock', 'check', 'Active'],
        'comptes' => ['Option comptes clients', 'check', 'Active'],
        'illimite' => ['Option modifications illimitées', 'check', 'Active'],
        'domaine_info' => ['Nom de domaine (info affichée)', 'text', 'exemple.fr, renouvelé le 3 mars 2027'],
        'avis' => ['Lien d’avis Google', 'url', 'https://g.page/r/.../review'],
        'parrain' => ['Parrainé par (code)', 'text', 'Ex. : LILA-7K2'],
        'code' => ['Son code de parrainage', 'text', 'Créé automatiquement'],
        'mois_offerts' => ['Mois offerts à utiliser', 'text', '0'],
        'offert' => ['Forfait offert à vie', 'check', 'Oui : le forfait et ses options sont gratuits pour ce client, pour toujours. Son compte n’est jamais supprimé automatiquement.'],
        'abonnement_manuel' => ['Abonnement actif hors Stripe', 'check', 'Oui : ce client paie autrement (virement, espèces). Son compte n’est jamais supprimé automatiquement.'],
        'stats_mois' => ['Tableau de bord : mois', 'text', 'Novembre 2026'],
        'stats_visites' => ['Visites', 'text', '1240'],
        'stats_google' => ['Apparitions sur Google', 'text', '3420'],
        'stats_appels' => ['Appels ou contacts', 'text', '23'],
        'stats_ventes' => ['Ventes (boutique)', 'text', ''],
        'stats_recherches' => ['Meilleures recherches (une par ligne : recherche | position)', 'textarea', "pâtisserie rethel | 4\ntarte aux fraises rethel | 2"],
        'stats_rapport' => ['Lien du rapport mensuel (PDF)', 'url', ''],
        'factures' => ['Factures saisies à la main (une par ligne : date ; libellé ; montant ; lien)', 'textarea', "Novembre 2026 ; Forfait Power ; 20 € ; https://..."],
    ];
}
function aled08e_profile_fields($user) {
    if (!current_user_can('edit_users')) return;
    $uid = is_object($user) ? $user->ID : 0;
    echo '<h2 id="aled08e">Espace client Alex & Lia</h2><p>Ces informations s’affichent dans l’espace client (page <a href="' . esc_url(aled08e_url()) . '" target="_blank">Mon espace</a>).</p>';
    if ($uid) {
        $abo = aled08e_meta($uid, 'abonnement') ?: 'none';
        $libAbo = ['active' => 'actif', 'past_due' => 'en retard de paiement', 'canceled' => 'arrêté', 'none' => 'aucun abonnement Stripe'];
        $derniere = aled08e_meta($uid, 'derniere_connexion');
        $u = get_userdata($uid);
        echo '<table class="form-table" role="presentation">';
        echo '<tr><th>Abonnement Stripe</th><td>' . esc_html($libAbo[$abo] ?? $abo) . (aled08e_meta($uid, 'stripe_customer') ? ' <span class="description">(client ' . esc_html(aled08e_meta($uid, 'stripe_customer')) . ')</span>' : '') . '</td></tr>';
        echo '<tr><th>Dernière connexion</th><td>' . esc_html($derniere ? aled08e_date($derniere) : 'jamais (inscrit le ' . aled08e_date($u->user_registered) . ')') . '<p class="description">Un compte client sans connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec un e-mail d’avertissement un mois avant.</p></td></tr>';
        $cmds = aled08e_cmd_user_commandes($uid);
        if ($cmds) {
            echo '<tr><th>Commandes</th><td>';
            foreach ($cmds as $c) echo '<a href="' . esc_url(get_edit_post_link($c['id'])) . '">' . esc_html($c['ref']) . '</a> : ' . esc_html(aled08e_cmd_statuts()[$c['statut']][0] ?? $c['statut']) . '<br>';
            echo '</td></tr>';
        }
        echo '</table>';
    }
    echo '<table class="form-table" role="presentation">';
    foreach (aled08e_fields() as $k => [$label, $type, $extra]) {
        $v = $uid ? aled08e_meta($uid, $k) : '';
        $id = 'aled08e-' . $k;
        echo '<tr><th><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label></th><td>';
        if ($type === 'select') {
            echo '<select id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']">';
            foreach ($extra as $ok => $ol) echo '<option value="' . esc_attr($ok) . '"' . selected($v, $ok, false) . '>' . esc_html($ol) . '</option>';
            echo '</select>';
        } elseif ($type === 'check') {
            echo '<label><input type="checkbox" id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" value="1"' . checked($v, '1', false) . '> ' . esc_html($extra) . '</label>';
        } elseif ($type === 'textarea') {
            echo '<textarea id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" rows="4" class="large-text" placeholder="' . esc_attr($extra) . '">' . esc_textarea($v) . '</textarea>';
        } else {
            echo '<input type="' . ($type === 'url' ? 'url' : 'text') . '" id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" value="' . esc_attr($v) . '" class="regular-text" placeholder="' . esc_attr($extra) . '">';
        }
        if ($k === 'code' && $uid) {
            $n = count(aled08e_filleuls($uid));
            echo '<p class="description">Filleuls en ligne : ' . (int) $n . '. Lien : ' . esc_html(home_url('/creer-mon-site/?parrain=' . ($v ?: '…'))) . '</p>';
        }
        if ($k === 'factures') echo '<p class="description">Les factures Stripe s’ajoutent toutes seules dans l’espace du client.</p>';
        echo '</td></tr>';
    }
    echo '</table>';
    wp_nonce_field('aled08e_profile', '_aled08e_profile');
}
add_action('show_user_profile', 'aled08e_profile_fields');
add_action('edit_user_profile', 'aled08e_profile_fields');
add_action('user_new_form', function ($ctx) { if ($ctx === 'add-new-user') aled08e_profile_fields(null); });

function aled08e_profile_save($uid) {
    if (!current_user_can('edit_users') || !isset($_POST['_aled08e_profile'])) return;
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_profile'])), 'aled08e_profile')) return;
    $in = isset($_POST['aled08e']) && is_array($_POST['aled08e']) ? wp_unslash($_POST['aled08e']) : [];
    $oldParrain = aled08e_meta($uid, 'parrain');
    foreach (aled08e_fields() as $k => [$label, $type, $extra]) {
        $v = $in[$k] ?? '';
        if ($type === 'check') $v = $v ? '1' : '';
        elseif ($type === 'url') $v = esc_url_raw(trim((string) $v));
        elseif ($type === 'textarea') $v = sanitize_textarea_field((string) $v);
        elseif ($type === 'select') $v = array_key_exists($v, $extra) ? $v : array_key_first($extra);
        else $v = sanitize_text_field((string) $v);
        if ($k === 'code' || $k === 'parrain') $v = aled08e_clean_code($v);
        if ($k === 'code' && $v) {
            $other = aled08e_user_by_code($v);
            if ($other && $other->ID !== (int) $uid) continue; // code déjà pris : on garde l'ancien
        }
        update_user_meta($uid, 'aled08_' . $k, $v);
    }
    // un nouveau filleul en ligne : on prévient le parrain
    $parrain = aled08e_meta($uid, 'parrain');
    if ($parrain && $parrain !== $oldParrain) {
        $p = aled08e_user_by_code($parrain);
        $u = get_userdata($uid);
        if ($p && $u && $p->ID !== $u->ID) {
            $m = (int) aled08e_data()['parrainageMois'];
            $corps = 'Bonjour ' . aled08e_prenom($p) . ",\n\n"
                . 'Bonne nouvelle : ' . aled08e_prenom($u) . ' a créé son site grâce à vous. Vous recevez ' . aled08e_mois_txt($m) . " de forfait offert, merci !\n\n"
                . "Vos parrainages sont dans votre espace client :\n" . aled08e_url() . "#parrainage\n\nÀ bientôt,\nAlex, et Lia\n";
            wp_mail($p->user_email, 'Votre parrainage : un mois offert', $corps, aled08e_mail_headers());
        }
    }
}
add_action('personal_options_update', 'aled08e_profile_save');
add_action('edit_user_profile_update', 'aled08e_profile_save');
add_action('user_register', 'aled08e_profile_save');

/* Colonne « Forfait » dans la liste des utilisateurs */
add_filter('manage_users_columns', function ($c) { $c['aled08_forfait'] = 'Forfait Alex & Lia'; return $c; });
add_filter('manage_users_custom_column', function ($out, $col, $uid) {
    if ($col !== 'aled08_forfait') return $out;
    $u = get_userdata($uid);
    if (!$u || !aled08e_is_client($u)) return '';
    $abo = aled08e_meta($uid, 'abonnement');
    return esc_html(aled08e_forfait(aled08e_meta($uid, 'forfait'))['name']) . ($abo === 'past_due' ? ' <span style="color:#b32d2e">(retard de paiement)</span>' : '');
}, 10, 3);

/* =========================================================================
 *  La page « Mon espace » : [aled08_espace]…formulaire de connexion…[/aled08_espace]
 * ========================================================================= */
add_action('wp_enqueue_scripts', function () {
    if (!is_page('mon-espace') || !is_user_logged_in()) return;
    wp_enqueue_script('aled08-qrcode', plugins_url('qrcode.js', __FILE__), [], ALED08E_VERSION, ['in_footer' => true, 'strategy' => 'defer']);
    // Styles propres à l'espace client : dans le thème (assets/css/espace.css), sinon la copie livrée avec l'extension
    $theme = get_template_directory() . '/assets/css/espace.css';
    if (file_exists($theme)) wp_enqueue_style('aled08-espace', get_template_directory_uri() . '/assets/css/espace.css', ['aled08'], (string) filemtime($theme));
    elseif (file_exists(__DIR__ . '/espace.css')) wp_enqueue_style('aled08-espace', plugins_url('espace.css', __FILE__), ['aled08'], ALED08E_VERSION);
});

add_shortcode('aled08_espace', function ($atts, $content = '') {
    if (!is_user_logged_in()) {
        $c = str_replace(
            ['action="/wp-login.php"', 'href="/wp-login.php?action=lostpassword"'],
            ['action="' . esc_url(aled08e_url()) . '"', 'href="' . esc_url(wp_lostpassword_url(aled08e_url(['mdp' => 'envoye']))) . '"'],
            (string) $content
        );
        if (isset($_GET['mdp'])) $c = str_replace('<form class="form" method="post"', '<p class="esp-warn">Si cette adresse correspond à un compte, un e-mail vient de partir pour choisir un nouveau mot de passe.</p><form class="form" method="post"', $c);
        if (isset($_GET['connexion'])) $c = str_replace('data-login-error hidden', 'data-login-error', $c);
        return aled08e_inscription_message($c);
    }
    return aled08e_dashboard();
});

function aled08e_tab($id, $ic, $label, $on = false) {
    return '<button type="button" role="tab" id="tab-' . $id . '" aria-controls="t-' . $id . '" aria-selected="' . ($on ? 'true' : 'false') . '"' . ($on ? '' : ' tabindex="-1"') . ' data-tab="' . $id . '">' . aled08e_icon($ic) . '<span>' . esc_html($label) . '</span></button>';
}

/* Libellés de la commande pour le client */
function aled08e_cmd_libelle_client($statut) {
    $l = [
        'attente_paiement' => 'En attente de paiement', 'payee' => 'Payée, merci !', 'domaine_commande' => 'Nom de domaine en cours d’attribution',
        'domaine_attribue' => 'Nom de domaine attribué', 'hebergement' => 'Hébergement en préparation', 'ssl' => 'Certificat de sécurité en cours',
        'pret' => 'Tout est prêt : je crée votre site', 'en_creation' => 'Je crée votre site', 'en_ligne' => 'En ligne', 'annulee' => 'Annulée',
    ];
    return $l[$statut] ?? $statut;
}
function aled08e_cmd_domaine_libelle_client($cmd) {
    if (!$cmd['domaine']) return 'On le choisit ensemble';
    if ($cmd['domaine_mien']) return 'Votre nom de domaine actuel, on le garde';
    $l = ['a_reserver' => 'Je le réserve à votre nom dès le paiement', 'reserve' => 'Réservé à votre nom', 'en_ligne' => 'En ligne', 'client' => 'Votre nom de domaine'];
    if ($cmd['statut'] === 'attente_paiement') return 'Je le réserve à votre nom dès le paiement';
    if ($cmd['statut'] === 'payee' || $cmd['statut'] === 'domaine_commande') return 'Réservation en cours, à votre nom';
    return $l[$cmd['domaine_statut']] ?? 'À réserver';
}

/* Onglet « Ma commande » : frise d'état, nom de domaine, montants, solde */
function aled08e_panel_commande($cmd, $u, $D) {
    $m = $cmd['montants'];
    $type = aled08e_type($cmd['type']);
    $f = aled08e_forfait($cmd['forfait']);
    $annuel = $cmd['periode'] === 'annee';
    $per = $annuel ? 'par an' : 'par mois';
    $s = $cmd['statut'];
    $enCours = in_array($s, aled08e_prov_etapes_auto(), true);
    $frise = '<div class="esp-etat" data-commande-etat data-cid="' . (int) $cmd['id'] . '" data-url="' . esc_attr(rest_url('aled08/v1/commande/etat')) . '" data-nonce="' . esc_attr(wp_create_nonce('wp_rest')) . '"' . ($enCours ? ' data-poll="60"' : '') . '>' . aled08e_prov_frise_html($cmd) . '</div>';

    $opts = [];
    foreach ((array) $cmd['options'] as $oid) {
        $o = aled08e_option($oid);
        if ($o) $opts[] = $o['name'] . ' (' . ($o['once'] ? aled08e_euro_txt($o['once']) . ' une fois' : aled08e_euro_txt($annuel ? $o['month'] * (12 - (int) $D['moisOfferts']) : $o['month']) . ' ' . $per) . ')';
    }
    $solde = (float) ($m['solde'] ?? 0);
    $soldeDu = !$cmd['lissage'] && $solde > 0 && !$cmd['solde_paye'] && in_array($s, aled08e_cmd_statuts_payes(), true);
    $flash = '';
    if (isset($_GET['solde']) && $_GET['solde'] === 'ok') $flash = '<p class="esp-empty" role="status">Merci ! Votre paiement du solde est en cours de confirmation. Il apparaîtra ici dans quelques minutes.</p>';
    if (isset($_GET['m']) && sanitize_key(wp_unslash($_GET['m'])) === 'paiement_erreur') $flash = '<p class="esp-warn" role="status">Le paiement en ligne n’a pas pu démarrer. Réessayez dans un instant, ou écrivez-moi : je vous envoie un lien de paiement.</p>';

    ob_start();
    ?>
          <h2 class="app-h">Ma commande</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <div class="esp-order">
            <p class="esp-order-head"><span>Référence <b><?php echo esc_html($cmd['ref']); ?></b></span><em class="st <?php echo esc_attr(aled08e_cmd_statuts()[$s][1] ?? 'st-new'); ?>"><?php echo esc_html(aled08e_cmd_libelle_client($s)); ?></em></p>
            <?php echo $frise; // phpcs:ignore ?>
            <?php if ($s === 'attente_paiement' && $cmd['paiement_en_cours']) : ?>
              <p class="esp-empty">Votre prélèvement est en cours de confirmation : cela prend quelques jours. Je vous écris dès qu’il est validé.</p>
            <?php elseif ($s === 'attente_paiement') : ?>
              <?php if (aled08e_stripe_ready()) : ?>
              <form method="post" action="<?php echo esc_url(aled08e_url()); ?>" class="esp-pay">
                <input type="hidden" name="aled08e_payer" value="1"><input type="hidden" name="cid" value="<?php echo (int) $cmd['id']; ?>">
                <?php wp_nonce_field('aled08e_payer_' . $cmd['id'], '_aled08e_payer'); ?>
                <p>Votre commande attend son paiement. Dès qu’il est fait, je réserve votre nom de domaine et je commence.</p>
                <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('credit-card'); // phpcs:ignore ?><span>Payer <?php echo aled08e_euro($m['total_jour']); // phpcs:ignore ?> maintenant</span></button>
              </form>
              <?php else : ?>
              <p class="esp-warn">Je vous envoie le lien de paiement par e-mail sous 24 heures. Dès le paiement, je réserve votre nom de domaine et je commence.</p>
              <?php endif; ?>
            <?php elseif ($s === 'pret' || $s === 'en_creation') : ?>
              <p class="esp-empty">Votre nom de domaine, votre hébergement et votre certificat sont prêts. Je crée votre site<?php echo $type ? ' (' . esc_html($type['delai']) . ' en général)' : ''; ?> et je vous écris dès que j’ai besoin de vous.</p>
            <?php elseif ($s === 'en_ligne') : ?>
              <p class="esp-empty">Votre site est en ligne. Pour le faire évoluer, envoyez vos demandes depuis « Mes demandes ».</p>
            <?php elseif ($s === 'annulee') : ?>
              <p class="esp-warn">Cette commande est annulée. Une question ? Écrivez-moi, je vous réponds vite.</p>
            <?php endif; ?>
          </div>

          <p class="app-sub">Votre site</p>
          <dl class="esp-grid">
            <div><dt>Type de site</dt><dd><?php echo esc_html($type ? $type['label'] : $cmd['type']); ?><small><?php echo aled08e_euro($m['creation']); // phpcs:ignore ?> de création</small></dd></div>
            <div><dt>Nom de domaine</dt><dd><?php echo esc_html($cmd['domaine'] ?: 'À choisir'); ?><small><?php echo esc_html(aled08e_cmd_domaine_libelle_client($cmd)); ?></small></dd></div>
            <div><dt>Forfait</dt><dd><?php echo esc_html($f['name']); ?><small><?php echo aled08e_euro($m['mensuel_forfait']) . ' ' . esc_html($per); // phpcs:ignore ?></small></dd></div>
            <div><dt>Options</dt><dd><?php echo $opts ? esc_html(implode(', ', $opts)) : 'Aucune'; ?></dd></div>
          </dl>

          <p class="app-sub">Paiement</p>
          <ul class="esp-amounts">
            <?php if ($cmd['lissage']) : ?>
            <li><span>Création du site, en <?php echo (int) $m['lissage_total_echeances']; ?> fois sans frais</span><b><?php echo aled08e_euro($m['lissage_mensualite']) . ' ' . esc_html($per); // phpcs:ignore ?></b><small><?php echo (int) $cmd['lissage_paye']; ?> / <?php echo (int) $m['lissage_total_echeances']; ?> échéances payées, puis plus rien à payer</small></li>
            <?php else : ?>
            <li><span>Acompte de <?php echo (int) $D['acompte']; ?> %</span><b><?php echo aled08e_euro($m['acompte']); // phpcs:ignore ?></b><small><?php echo in_array($s, aled08e_cmd_statuts_payes(), true) ? 'payé' : 'à payer à la commande'; ?></small></li>
            <li><span>Solde à la mise en ligne</span><b><?php echo aled08e_euro($solde); // phpcs:ignore ?></b><small><?php echo $cmd['solde_paye'] ? 'payé, merci !' : 'demandé quand le site est en ligne'; ?></small></li>
            <?php endif; ?>
            <li><span>Forfait <?php echo esc_html($f['name']); ?><?php echo $m['mensuel_options'] > 0 ? ' et options' : ''; ?></span><b><?php echo aled08e_euro($m['mensuel_forfait'] + $m['mensuel_options']) . ' ' . esc_html($per); // phpcs:ignore ?></b><small>démarre à la commande</small></li>
            <li class="esp-amount-total"><span><?php echo $s === 'attente_paiement' ? 'À payer aujourd’hui' : 'Payé le jour de la commande'; ?></span><b><?php echo aled08e_euro($m['total_jour']); // phpcs:ignore ?></b></li>
          </ul>
          <?php if ($soldeDu && $s === 'en_ligne') : ?>
            <?php if (aled08e_stripe_ready()) : ?>
            <form method="post" action="<?php echo esc_url(aled08e_url()); ?>" class="esp-pay">
              <input type="hidden" name="aled08e_solde" value="1"><input type="hidden" name="cid" value="<?php echo (int) $cmd['id']; ?>">
              <?php wp_nonce_field('aled08e_solde_' . $cmd['id'], '_aled08e_solde'); ?>
              <p>Votre site est en ligne : il reste le solde de la création à régler.</p>
              <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('credit-card'); // phpcs:ignore ?><span>Payer le solde de <?php echo aled08e_euro($solde); // phpcs:ignore ?></span></button>
            </form>
            <?php else : ?>
            <p class="esp-warn">Votre site est en ligne : il reste le solde de <?php echo aled08e_euro($solde); // phpcs:ignore ?>. Je vous envoie le lien de paiement par e-mail.</p>
            <?php endif; ?>
          <?php endif; ?>
          <p class="app-note">Une question sur votre commande ? Répondez à l’e-mail de confirmation, ou passez par le <a href="<?php echo esc_url(home_url('/contact/')); ?>">formulaire de contact</a>.</p>
    <?php
    return ob_get_clean();
}

function aled08e_dashboard() {
    $u = wp_get_current_user();
    $uid = $u->ID;
    if (aled08e_sans_forfait($uid)) return aled08e_dashboard_libre($u);
    $D = aled08e_data();
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mail = aled08e_meta($uid, 'mail') === '1';
    $optMail = aled08e_option('mail') ?: ['name' => 'Adresse e-mail pro', 'month' => 3];
    $site = aled08e_meta($uid, 'site');
    $host = $site ? preg_replace('#^www\.#', '', (string) wp_parse_url($site, PHP_URL_HOST)) : '';
    $prenom = aled08e_prenom($u);
    $used = aled08e_count_month($uid, 'alex');
    $jetonsMax = aled08e_jetons($f);
    $jetonsUtil = aled08e_count_month($uid, 'lia');
    $jetonsLeft = $jetonsMax === null ? null : max(0, (int) $jetonsMax - $jetonsUtil);
    $illimite = aled08e_meta($uid, 'illimite') === '1';
    $quota = $illimite ? max(99, $used + 1) : (int) $f['quota'];
    $left = max(0, $quota - $used);
    // Chico : une seule modification par mois, par Lia ou par Alex (compteur partagé)
    $partage = !empty($f['partage']) && !$illimite;
    if ($partage) { $left = max(0, $quota - $used - $jetonsUtil); $jetonsLeft = $left; }
    // options mensuelles actives du compte (e-mail pro, stock, comptes clients, modifications illimitées)
    $optsMois = [];
    foreach (['mail', 'stock', 'comptes', 'illimite'] as $oid) {
        $o = aled08e_option($oid);
        if ($o && $o['month'] > 0 && aled08e_meta($uid, $oid) === '1') $optsMois[] = $o;
    }
    $code = aled08e_code($uid);
    $plink = home_url('/creer-mon-site/?parrain=' . rawurlencode($code));
    $filleuls = aled08e_filleuls($uid);
    $demandesFilleuls = get_user_meta($uid, 'aled08_filleuls_demandes', true);
    $demandesFilleuls = is_array($demandesFilleuls) ? $demandesFilleuls : [];
    $moisGagnes = count($filleuls) * (int) $D['parrainageMois'];
    $moisDispo = (int) aled08e_meta($uid, 'mois_offerts');
    $delai = $f['id'] === 'titan' ? $D['delais']['titan'] : $D['delais']['reponse'];

    // la commande la plus récente (une commande annulée n'est montrée que s'il n'y en a pas d'autre)
    $cmds = aled08e_cmd_user_commandes($uid);
    $cmd = null;
    foreach ($cmds as $c) if ($c['statut'] !== 'annulee') { $cmd = $c; break; }
    if (!$cmd && $cmds) $cmd = $cmds[0];
    if ($cmd && !$host && $cmd['domaine'] && !$cmd['domaine_mien']) $host = $cmd['domaine'];
    $siteEtat = $host ? 'En ligne' : 'Bientôt en ligne';
    $siteOk = (bool) $host;
    if ($cmd && $cmd['statut'] !== 'en_ligne') { $siteEtat = $cmd['statut'] === 'attente_paiement' ? 'En attente de paiement' : ($cmd['statut'] === 'annulee' ? 'Commande annulée' : (in_array($cmd['statut'], aled08e_prov_etapes_auto(), true) ? 'Mise en ligne en cours' : 'En création')); $siteOk = false; }

    $reqs = get_posts(['post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => ['private', 'publish'], 'numberposts' => 30, 'orderby' => 'date', 'order' => 'DESC']);
    $st = aled08e_statuts();
    $reqItem = function ($p, $full = true) use ($st) {
        $s = get_post_meta($p->ID, '_aled08_statut', true) ?: 'recue';
        $rep = get_post_meta($p->ID, '_aled08_reponse', true);
        $thumb = $full && has_post_thumbnail($p) ? get_the_post_thumbnail($p, 'thumbnail', ['class' => 'req-thumb', 'alt' => '']) : '';
        $text = $full ? $p->post_content : $p->post_title;
        return '<li>' . $thumb . '<span><strong>' . nl2br(esc_html(mb_strlen($text) > 220 ? mb_substr($text, 0, 217) . '…' : $text)) . '</strong><small>' . (get_post_meta($p->ID, '_aled08_par', true) === 'lia' ? 'par Lia, ' : 'par Alex, ') . 'envoyée le ' . esc_html(aled08e_date($p->post_date)) . '</small>'
            . ($full && $rep ? '<span class="req-reply">' . nl2br(esc_html($rep)) . '</span>' : '') . ($full ? aled08e_lia_bloc_confirmation($p) : '') . '</span><em class="st ' . esc_attr($st[$s][1]) . '">' . esc_html($st[$s][0]) . '</em></li>';
    };

    $flash = '';
    $m = isset($_GET['m']) ? sanitize_key(wp_unslash($_GET['m'])) : '';
    $msgs = [
        'ok' => ['esp-empty', 'Demande envoyée, merci ! Je m’en occupe et je vous préviens quand c’est en ligne.'],
        'hors' => ['esp-warn', 'Demande envoyée. Vos modifications du mois étaient déjà utilisées : je vous dis avant de la faire si elle attend le mois prochain ou si elle est facturée.'],
        'photo' => ['esp-warn', 'Demande envoyée, mais la photo n’a pas pu être ajoutée (8 Mo au plus, format JPG, PNG ou WEBP). Réessayez avec une photo plus légère.'],
        'vide' => ['esp-warn', 'Écrivez votre demande en quelques mots avant de l’envoyer.'],
        'trop' => ['esp-warn', 'Vous avez envoyé beaucoup de demandes aujourd’hui. Écrivez-nous par le formulaire de contact si c’est pressé.'],
        'erreur' => ['esp-warn', 'L’envoi n’a pas abouti. Réessayez dans un instant.'],
        'lia_oui' => ['esp-empty', 'Merci ! Lia met votre modification en ligne. Alex vérifie toujours après elle.'],
        'lia_non' => ['esp-empty', 'C’est noté : Alex reprend votre demande à la main.'],
        'lia_erreur' => ['esp-warn', 'La mise en ligne automatique n’a pas abouti : Alex s’en occupe à la main.'],
    ];
    if (isset($msgs[$m])) $flash = '<p class="' . $msgs[$m][0] . '" role="status">' . esc_html($msgs[$m][1]) . '</p>';
    $flashForfait = '';
    if ($m === 'portail_erreur') $flashForfait = '<p class="esp-warn" role="status">La page de gestion du paiement n’a pas pu s’ouvrir. Réessayez dans un instant, ou écrivez-moi.</p>';

    $price = $annuel ? ($f['month'] * (12 - (int) $D['moisOfferts'])) : $f['month'];
    $per = $annuel ? 'par an' : 'par mois';
    $offert = aled08e_meta($uid, 'offert') === '1';
    if ($offert) $price = 0;
    $total = $price;
    if (!$offert) foreach ($optsMois as $o) $total += $annuel ? $o['month'] * (12 - (int) $D['moisOfferts']) : $o['month'];
    $wa = home_url('/contact/');
    $share = 'https://wa.me/?text=' . rawurlencode('Je te recommande Alex & Lia pour ton site internet. Avec mon lien, on a chacun un mois de forfait offert : ' . $plink);

    $stats = [];
    foreach (['visites' => 'visites', 'google' => 'apparitions sur Google', 'appels' => 'appels ou contacts', 'ventes' => 'ventes'] as $k => $lab) {
        $v = aled08e_meta($uid, 'stats_' . $k);
        if ($v !== '') $stats[] = '<div><b>' . esc_html($v) . '</b><small>' . esc_html($lab) . '</small></div>';
    }
    $ranks = [];
    foreach (preg_split('/\r?\n/', aled08e_meta($uid, 'stats_recherches')) as $line) {
        $parts = array_map('trim', explode('|', $line));
        if ($parts[0] === '') continue;
        $ranks[] = '<li><span>' . esc_html($parts[0]) . '</span>' . (isset($parts[1]) && $parts[1] !== '' ? '<b>' . esc_html($parts[1]) . '<sup>e</sup></b>' : '') . '</li>';
    }
    // Factures : celles de Stripe (automatiques) puis celles saisies à la main dans la fiche client
    $factures = [];
    $stripeF = get_user_meta($uid, 'aled08_factures_stripe', true);
    $stripeF = is_array($stripeF) ? array_reverse($stripeF) : [];
    foreach ($stripeF as $fa) {
        $lien = $fa['url'] ?? '';
        $pdf = $fa['pdf'] ?? '';
        $factures[] = '<li><span>' . esc_html(aled08e_date($fa['date'] ?? '') . (!empty($fa['number']) ? ' · ' . $fa['number'] : '')) . '</span><b>' . aled08e_euro($fa['montant'] ?? 0) . '</b>'
            . ($lien ? '<a class="link-btn" href="' . esc_url($lien) . '" target="_blank" rel="noopener">Voir</a>' : '') . ($pdf ? '<a class="link-btn" href="' . esc_url($pdf) . '" target="_blank" rel="noopener">PDF</a>' : '') . '</li>';
    }
    foreach (preg_split('/\r?\n/', aled08e_meta($uid, 'factures')) as $line) {
        $p = array_map('trim', explode(';', $line));
        if ($p[0] === '') continue;
        $lien = $p[3] ?? '';
        $factures[] = '<li><span>' . esc_html($p[0] . (!empty($p[1]) ? ' · ' . $p[1] : '')) . '</span><b>' . esc_html($p[2] ?? '') . '</b>' . ($lien ? '<a class="link-btn" href="' . esc_url($lien) . '" target="_blank" rel="noopener">Voir</a>' : '') . '</li>';
    }
    $avis = aled08e_meta($uid, 'avis');
    $mois = aled08e_meta($uid, 'stats_mois');
    $rapport = aled08e_meta($uid, 'stats_rapport');
    $abo = aled08e_meta($uid, 'abonnement');
    $portail = aled08e_stripe_ready() && aled08e_meta($uid, 'stripe_customer');

    ob_start();
    ?>
<section class="section section-app"><div class="container">
  <div class="app" data-espace>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small><?php echo esc_html($host ?: $u->user_email); ?></small></div></div>
        <div class="jauge<?php echo $left <= 0 ? ' is-low' : ''; ?>">
          <p class="jauge-head"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span><?php echo $illimite ? 'Modifications ce mois' : ($partage ? 'Modification du mois (Lia ou Alex)' : 'Modifications restantes ce mois'); ?></span><b><?php echo $illimite ? 'illimitées' : (int) $left . ' / ' . (int) $quota; ?></b></p>
          <span class="jauge-bar"><i style="width:<?php echo $quota ? (int) round(min(100, $left / $quota * 100)) : 0; ?>%"></i></span>
        </div>
        <?php if (!$partage) : ?><div class="jauge jauge-lia<?php echo $jetonsLeft === 0 ? ' is-low' : ''; ?>">
          <p class="jauge-head"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?><span>Jetons Lia ce mois</span><b><?php echo $jetonsMax === null ? 'illimités' : (int) $jetonsLeft . ' / ' . (int) $jetonsMax; ?></b></p>
          <span class="jauge-bar"><i style="width:<?php echo $jetonsMax === null ? 100 : ($jetonsMax ? (int) round(min(100, $jetonsLeft / $jetonsMax * 100)) : 0); ?>%"></i></span>
        </div><?php endif; ?>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          <?php
          echo aled08e_tab('accueil', 'house', 'Accueil', true); // phpcs:ignore
          if ($cmd) echo aled08e_tab('commande', 'package', 'Ma commande'); // phpcs:ignore
          echo aled08e_tab('demandes', 'message-circle', 'Mes demandes') . aled08e_tab('tableau', 'chart-line', 'Tableau de bord') . aled08e_tab('outils', 'qr-code', 'QR code et avis') . aled08e_tab('parrainage', 'gift', 'Parrainage') . aled08e_tab('forfait', 'heart', 'Forfait et factures') . aled08e_tab('compte', 'circle-user', 'Mon compte'); // phpcs:ignore
          ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour <?php echo esc_html($prenom); ?> !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-<?php echo esc_attr($f['color']); ?>" data-go="forfait"><span class="app-card-art"><?php echo aled08e_monster($f['id']); // phpcs:ignore ?></span><span><small>Votre forfait</small><strong><?php echo esc_html($f['name']); ?></strong><span><?php echo $offert ? 'Offert à vie' : aled08e_euro($price) . ' ' . esc_html($per); // phpcs:ignore ?></span></span></button>
            <?php if ($cmd) : ?>
            <button type="button" class="app-card c-mint" data-go="commande"><span class="app-card-ico"><?php echo aled08e_icon('globe'); // phpcs:ignore ?></span><span><small>Votre site</small><strong><?php echo esc_html($host ?: 'En préparation'); ?></strong><span class="<?php echo $siteOk ? 'dot-ok' : ''; ?>"><?php echo esc_html($siteEtat); ?></span></span></button>
            <?php else : ?>
            <div class="app-card c-mint"><span class="app-card-ico"><?php echo aled08e_icon('globe'); // phpcs:ignore ?></span><span><small>Votre site</small><strong><?php echo esc_html($host ?: 'En préparation'); ?></strong><span class="<?php echo $siteOk ? 'dot-ok' : ''; ?>"><?php echo esc_html($siteEtat); ?></span></span></div>
            <?php endif; ?>
            <button type="button" class="app-card c-pink" data-go="parrainage"><span class="app-card-ico"><?php echo aled08e_icon('gift'); // phpcs:ignore ?></span><span><small>Parrainage</small><strong><?php echo esc_html($code); ?></strong><span><?php echo (int) count($filleuls); ?> filleul<?php echo count($filleuls) > 1 ? 's' : ''; ?> en ligne</span></span></button>
          </div>
          <?php if ($cmd && $cmd['statut'] === 'attente_paiement') : ?>
          <p class="esp-warn">Votre commande <?php echo esc_html($cmd['ref']); ?> attend son paiement. <button type="button" class="link-btn" data-go="commande">Voir ma commande</button></p>
          <?php elseif ($cmd && $cmd['statut'] === 'en_ligne' && !$cmd['lissage'] && !$cmd['solde_paye'] && (float) $cmd['montants']['solde'] > 0) : ?>
          <p class="esp-warn">Votre site est en ligne : il reste le solde de <?php echo aled08e_euro($cmd['montants']['solde']); // phpcs:ignore ?> à régler. <button type="button" class="link-btn" data-go="commande">Voir ma commande</button></p>
          <?php endif; ?>
          <p class="app-sub">Que voulez-vous faire ?</p>
          <div class="app-actions">
            <button type="button" data-go="demandes"><?php echo aled08e_icon('message-circle'); // phpcs:ignore ?><strong>Demander une modification</strong><small>Je m’en occupe</small></button>
            <button type="button" data-go="outils"><?php echo aled08e_icon('qr-code'); // phpcs:ignore ?><strong>QR code et lien d’avis</strong><small>Prêts à partager</small></button>
            <button type="button" data-go="parrainage"><?php echo aled08e_icon('gift'); // phpcs:ignore ?><strong>Parrainer un proche</strong><small>Un mois offert chacun</small></button>
          </div>
          <p class="app-sub">Dernières demandes</p>
          <?php if ($reqs) : ?>
          <ul class="reqs"><?php foreach (array_slice($reqs, 0, 3) as $p) echo $reqItem($p, false); // phpcs:ignore ?></ul>
          <?php else : ?>
          <p class="esp-empty">Aucune demande pour le moment. Un horaire, un prix, une photo à changer ? Écrivez-le dans « Mes demandes ».</p>
          <?php endif; ?>
        </div>

        <?php if ($cmd) : ?>
        <div class="app-panel" role="tabpanel" id="t-commande" aria-labelledby="tab-commande" hidden>
          <?php echo aled08e_panel_commande($cmd, $u, $D); // phpcs:ignore ?>
        </div>
        <?php endif; ?>

        <div class="app-panel" role="tabpanel" id="t-demandes" aria-labelledby="tab-demandes" hidden>
          <h2 class="app-h">Mes demandes</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <p class="app-p">Écrivez ce que vous voulez changer, avec une photo si besoin. Je m’en occupe et vous suivez l’avancement ici. <?php echo esc_html($f['name'] . ' : ' . mb_strtolower($f['modifs'], 'UTF-8') . ', réponse sous ' . $delai . '.'); ?></p>
          <?php if ($left <= 0) : ?><p class="esp-warn">Vos modifications du mois sont utilisées. Vous pouvez quand même envoyer votre demande : je vous dis avant si elle attend le mois prochain ou si elle est facturée.</p><?php endif; ?>
          <form class="req-form" method="post" enctype="multipart/form-data" action="<?php echo esc_url(aled08e_url()); ?>" data-req-real>
            <input type="hidden" name="aled08e_demande" value="1">
            <?php wp_nonce_field('aled08e_demande', '_aled08e'); ?>
            <fieldset class="req-par"><legend class="app-sub">Qui s’en occupe ?</legend>
              <label class="req-par-opt"><input type="radio" name="par" value="lia"<?php echo $jetonsLeft === 0 ? ' disabled' : ' checked'; ?>><span><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><strong>Lia, instantané</strong><small>Lia prépare la modification et vous montre l’aperçu. Votre site ne change qu’après votre accord. Un jeton Lia<?php echo $jetonsMax === null ? ' (illimités)' : ($partage ? '' : ' (' . (int) $jetonsLeft . ' restant' . ($jetonsLeft > 1 ? 's' : '') . ')'); ?>.</small></span></label>
              <label class="req-par-opt"><input type="radio" name="par" value="alex"<?php echo $jetonsLeft === 0 ? ' checked' : ''; ?>><span><?php echo aled08e_icon('user'); // phpcs:ignore ?><strong>Alex, à la main</strong><small>Sous <?php echo esc_html($delai); ?>, fait et vérifié par Alex lui-même. <?php echo $illimite ? 'Illimité.' : ($partage ? '' : (int) $left . ' restante' . ($left > 1 ? 's' : '') . ' ce mois.'); ?></small></span></label>
            </fieldset>
            <div class="field"><label for="req-txt">Votre demande</label><textarea id="req-txt" name="demande" rows="4" maxlength="4000" required placeholder="Ex. : nous serons fermés le lundi 24 novembre"></textarea></div>
            <label class="req-photo"><input type="file" name="photo" accept="image/*" class="sr-only" data-req-file><?php echo aled08e_icon('image-plus'); // phpcs:ignore ?><span data-req-file-name>Ajouter une photo (facultatif)</span></label>
            <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('send'); // phpcs:ignore ?><span>Envoyer ma demande</span></button>
          </form>
          <p class="app-sub">Suivi</p>
          <?php if ($reqs) : ?>
          <ul class="reqs"><?php foreach ($reqs as $p) echo $reqItem($p); // phpcs:ignore ?></ul>
          <?php else : ?>
          <p class="esp-empty">Vos demandes apparaîtront ici, avec leur avancement : reçue, en cours, faite.</p>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-tableau" aria-labelledby="tab-tableau" hidden>
          <h2 class="app-h">Tableau de bord<?php echo $mois ? ' : ' . esc_html($mois) : ''; ?></h2>
          <?php if ($stats || $ranks) : ?>
            <?php if ($stats) : ?><div class="kpis"><?php echo implode('', $stats); // phpcs:ignore ?></div><?php endif; ?>
            <?php if ($ranks) : ?><p class="app-sub">Vos meilleures recherches sur Google</p><ul class="ranks"><?php echo implode('', $ranks); // phpcs:ignore ?></ul><?php endif; ?>
          <?php else : ?>
            <p class="esp-empty">Vos premiers chiffres arrivent dans le mois qui suit la mise en ligne : visites, apparitions sur Google, appels.</p>
          <?php endif; ?>
          <?php if ($rapport) : ?><a class="btn btn-light" href="<?php echo esc_url($rapport); ?>" target="_blank" rel="noopener"><?php echo aled08e_icon('download'); // phpcs:ignore ?><span>Rapport du mois</span></a><?php endif; ?>
          <?php if ($f['id'] === 'chico') : ?><p class="app-note">Le rapport mensuel détaillé et le suivi SEO font partie des forfaits Power et Titan.</p><?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-outils" aria-labelledby="tab-outils" hidden>
          <h2 class="app-h">QR code et lien d’avis</h2>
          <div class="tool-duo">
            <div class="tool-card">
              <p class="app-sub"><?php echo aled08e_icon('qr-code'); // phpcs:ignore ?>Votre QR code</p>
              <?php if ($site) : ?>
              <div data-qr="<?php echo esc_attr($site); ?>"></div>
              <p class="app-note">Il mène à <?php echo esc_html($host); ?>. À imprimer sur vos cartes, votre vitrine ou vos flyers.</p>
              <button type="button" class="btn btn-light btn-block" data-qr-dl><?php echo aled08e_icon('download'); // phpcs:ignore ?><span>Télécharger</span></button>
              <?php else : ?>
              <p class="esp-empty">Votre QR code apparaîtra ici dès que votre site sera en ligne.</p>
              <?php endif; ?>
            </div>
            <div class="tool-card">
              <p class="app-sub"><?php echo aled08e_icon('star'); // phpcs:ignore ?>Votre lien d’avis Google</p>
              <?php if ($avis) : ?>
              <p class="app-note">Envoyez-le à vos clients contents : il ouvre directement la page pour laisser un avis.</p>
              <input class="copy-in" id="avis-link" type="text" readonly value="<?php echo esc_attr($avis); ?>" aria-label="Lien d’avis Google">
              <button type="button" class="btn btn-primary btn-block" data-copy="avis-link"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span>Copier le lien</span></button>
              <?php else : ?>
              <p class="esp-empty">Je prépare votre lien d’avis Google à partir de votre fiche : il apparaîtra ici.</p>
              <?php endif; ?>
            </div>
          </div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-parrainage" aria-labelledby="tab-parrainage" hidden>
          <h2 class="app-h">Parrainage</h2>
          <p class="app-p">Un proche fait créer son site avec votre lien ou votre code : quand il est en ligne, vous recevez chacun <?php echo esc_html(aled08e_mois_txt($D['parrainageMois'])); ?> de forfait offert.</p>
          <p class="app-sub">Votre code</p>
          <p class="parrain-code"><?php echo esc_html($code); ?></p>
          <p class="app-sub">Votre lien</p>
          <div class="tool-card">
            <input class="copy-in" id="parrain-link" type="text" readonly value="<?php echo esc_attr($plink); ?>" aria-label="Votre lien de parrainage">
            <div class="share-row">
              <button type="button" class="btn btn-primary" data-copy="parrain-link" data-copy-msg="Lien de parrainage copié"><?php echo aled08e_icon('link'); // phpcs:ignore ?><span>Copier le lien</span></button>
              <a class="btn btn-wa" href="<?php echo esc_url($share); ?>" target="_blank" rel="noopener"><?php echo aled08e_icon('whatsapp'); // phpcs:ignore ?><span>Envoyer sur WhatsApp</span></a>
            </div>
          </div>
          <div class="parrain-stats">
            <div><b><?php echo (int) count($demandesFilleuls); ?></b><small>demande<?php echo count($demandesFilleuls) > 1 ? 's' : ''; ?> avec votre code</small></div>
            <div><b><?php echo (int) count($filleuls); ?></b><small>site<?php echo count($filleuls) > 1 ? 's' : ''; ?> en ligne</small></div>
            <div><b><?php echo (int) $moisGagnes; ?></b><small>mois offert<?php echo $moisGagnes > 1 ? 's' : ''; ?> gagné<?php echo $moisGagnes > 1 ? 's' : ''; ?></small></div>
          </div>
          <?php if ($filleuls) : ?><ul class="reqs"><?php foreach ($filleuls as $fl) echo '<li><span><strong>' . esc_html(aled08e_prenom($fl)) . '</strong><small>site en ligne</small></span><em class="st st-done">' . esc_html(aled08e_mois_txt($D['parrainageMois'])) . ' offert</em></li>'; // phpcs:ignore ?></ul><?php endif; ?>
          <?php if ($moisDispo > 0) : ?><p class="esp-empty">Mois offerts à utiliser sur votre forfait : <?php echo (int) $moisDispo; ?>.</p><?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Forfait et factures</h2>
          <?php echo $flashForfait; // phpcs:ignore ?>
          <div class="app-card c-<?php echo esc_attr($f['color']); ?>"><span class="app-card-art"><?php echo aled08e_monster($f['id']); // phpcs:ignore ?></span><span><small>Votre forfait</small><strong><?php echo esc_html($f['name']); ?></strong><span><?php echo ($offert ? 'Offert à vie' : aled08e_euro($price) . ' ' . esc_html($per)) . ' · ' . esc_html($f['modifs']); // phpcs:ignore ?></span></span></div>
          <?php if ($offert) : ?><p class="app-note">Votre forfait <?php echo esc_html($f['name']); ?> est offert, à vie. Merci de votre confiance !</p><?php endif; ?>
          <?php if ($f['id'] === 'titan') : ?><p class="app-note">Titan : <?php echo (int) $quota; ?> modifications par mois, ajout et mise à jour de produits compris, un article de blog par mois pour votre SEO, réponse sous <?php echo esc_html($D['delais']['titan']); ?>.</p><?php endif; ?>
          <?php if ($optsMois) : ?>
          <p class="app-sub">Options</p>
          <?php foreach ($optsMois as $o) : ?>
          <p class="app-domain"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span><strong><?php echo esc_html($o['name']); ?></strong><small><?php echo aled08e_euro($annuel ? $o['month'] * (12 - (int) $D['moisOfferts']) : $o['month']) . ' ' . esc_html($per); // phpcs:ignore ?></small></span></p>
          <?php endforeach; ?>
          <?php endif; ?>
          <p class="app-total"><span>Total <?php echo $annuel ? 'chaque année' : 'chaque mois'; ?></span><b><?php echo aled08e_euro($total); // phpcs:ignore ?></b></p>
          <?php if ($annuel) : ?><p class="app-note">Vous payez à l’année : <?php echo (int) $D['moisOfferts']; ?> mois offerts sur le forfait.</p><?php endif; ?>
          <?php if ($cmd && $cmd['lissage'] && $cmd['lissage_paye'] < $cmd['montants']['lissage_total_echeances']) : ?><p class="app-note">Et la création de votre site, lissée : <?php echo aled08e_euro($cmd['montants']['lissage_mensualite']) . ' ' . esc_html($cmd['periode'] === 'annee' ? 'par an' : 'par mois'); // phpcs:ignore ?>, <?php echo (int) $cmd['lissage_paye']; ?> / <?php echo (int) $cmd['montants']['lissage_total_echeances']; ?> échéances payées.</p><?php endif; ?>
          <?php if ($abo === 'past_due') : ?><p class="esp-warn">Votre dernier paiement n’a pas abouti. Mettez à jour votre moyen de paiement ci-dessous, ou écrivez-moi.</p><?php endif; ?>
          <div class="esp-actions">
            <?php if ($portail) : ?>
            <form method="post" action="<?php echo esc_url(aled08e_url()); ?>">
              <input type="hidden" name="aled08e_portal" value="1">
              <?php wp_nonce_field('aled08e_portal', '_aled08e_portal'); ?>
              <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('credit-card'); // phpcs:ignore ?><span>Gérer mon paiement et mes factures</span></button>
            </form>
            <?php endif; ?>
            <?php if ($wa) : ?><a class="btn btn-light" href="<?php echo esc_url($wa); ?>"><?php echo aled08e_icon('message-circle'); // phpcs:ignore ?><span>Changer de forfait ou d’option</span></a><?php endif; ?>
          </div>
          <p class="app-sub">Factures</p>
          <?php if ($factures) : ?><ul class="invoices"><?php echo implode('', $factures); // phpcs:ignore ?></ul><?php else : ?><p class="esp-empty">Vos factures apparaîtront ici après chaque paiement.</p><?php endif; ?>
          <?php if (aled08e_meta($uid, 'domaine_info') || $host) : ?>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain"><?php echo aled08e_icon('globe'); // phpcs:ignore ?><span><strong><?php echo esc_html($host ?: aled08e_meta($uid, 'domaine_info')); ?></strong><small><?php echo esc_html(aled08e_meta($uid, 'domaine_info') ?: ($cmd && $cmd['domaine_mien'] ? 'Votre nom de domaine actuel' : 'À votre nom, renouvelé avec le forfait')); ?></small></span></p>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-compte" aria-labelledby="tab-compte" hidden>
          <?php echo aled08e_panel_compte($u); // phpcs:ignore ?>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}
