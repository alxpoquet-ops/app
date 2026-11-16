<?php
/**
 * Plugin Name: Alex & Co Espace client
 * Description: L'espace client Alex & Co sur la page /mon-espace/ et la gestion du site : commandes passées sur /commander/, paiement Stripe, comptes clients automatiques, demandes de modification, parrainage, tableau de bord.
 * Version: 2.3.0
 * Requires PHP: 7.4
 * Author: Alex & Co
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('ALED08E_VERSION', '2.3.0');
define('ALED08E_FILE', __FILE__);
define('ALED08E_ROLE', 'aled08_client');
define('ALED08E_CPT', 'aled08_demande');
define('ALED08E_CPT_CMD', 'aled08_commande');

/* =========================================================================
 *  Données (abonnement, types de site, options et extras, montants, icônes, dessins de Lia) : data.json, généré depuis le site
 * ========================================================================= */
function aled08e_data() {
    static $d = null;
    if ($d === null) {
        $raw = @file_get_contents(__DIR__ . '/data.json');
        $d = $raw ? (json_decode($raw, true) ?: []) : [];
        $d += [
            'name' => 'Alex & Co', 'whatsapp' => '', 'email' => '',
            'forfaits' => [], 'types' => [], 'options' => [], 'icons' => [], 'monsters' => [],
            'moisOfferts' => 2, 'boost' => 5, 'aLaDemande' => [], 'lissageDurees' => [6, 12], 'acompte' => 25, 'parrainageMois' => 1, 'remiseSecondSite' => 10,
            'delais' => ['reponse' => '72 heures', 'titan' => '72 heures', 'urgent' => '24 heures'], 'creation' => ['prix' => 500, 'boutique' => 200],
        ];
    }
    return $d;
}
function aled08e_icon($n) { $d = aled08e_data(); return $d['icons'][$n] ?? ''; }
function aled08e_monster($n) { $d = aled08e_data(); return $d['monsters'][$n] ?? ($d['monsters']['mascotte'] ?? ''); }
function aled08e_forfait($id) {
    foreach (aled08e_data()['forfaits'] as $f) if ($f['id'] === $id) return $f;
    $all = aled08e_data()['forfaits'];
    return $all ? $all[0] : ['id' => 'base', 'name' => 'Abonnement', 'month' => 10, 'quota' => 1, 'periode' => 'trimestre', 'jetons' => 100, 'modifs' => 'les petites retouches et les outils de la bande, et une intervention d’Alex par trimestre', 'color' => 'pink', 'tagline' => ''];
}
/* Le nom de l'abonnement sur une facture ou dans un e-mail */
function aled08e_abo_nom($f) { return count(aled08e_data()['forfaits']) > 1 ? 'Forfait ' . $f['name'] : 'Abonnement Alex & Co'; }
/* Les extras de l'abonnement : les options payées chaque mois, qu'on ajoute ou retire quand on veut */
function aled08e_extras() {
    $out = [];
    foreach (aled08e_data()['options'] as $o) if ((float) $o['month'] > 0) $out[] = $o;
    return $out;
}
/* Un extra est-il actif pour ce client ? */
function aled08e_extra_actif($uid, $id) { return aled08e_meta($uid, $id) === '1'; }
/* Les métas « extras » d'un compte d'après la liste d'options d'une commande : [id => '1' ou ''] */
function aled08e_extras_metas($options) {
    $m = [];
    foreach (aled08e_extras() as $o) $m[$o['id']] = in_array($o['id'], (array) $options, true) ? '1' : '';
    return $m;
}
/* Le prix du Boost (une intervention d'Alex en plus), en texte */
function aled08e_boost_txt() { return aled08e_euro_txt((float) (aled08e_data()['boost'] ?? 5)); }
/* Les extras à la demande, payés une fois (intervention d'Alex en plus, demande sous 24 heures, article, point avec Alex) */
function aled08e_a_la_demande($id = null) {
    $all = (array) (aled08e_data()['aLaDemande'] ?? []);
    if (!$all) $all = [['id' => 'alex', 'name' => 'Une intervention d’Alex en plus', 'prix' => (float) (aled08e_data()['boost'] ?? 5), 'icon' => 'user-check', 'desc' => '']];
    if ($id === null) return $all;
    foreach ($all as $x) if ($x['id'] === $id) return $x;
    return null;
}
function aled08e_extra_prix($id) { $x = aled08e_a_la_demande($id); return $x ? (float) $x['prix'] : 0.0; }
/* Période des interventions d'Alex : 'trimestre' depuis l'offre V2 (novembre 2026), 'mois' pour les clients inscrits avant */
function aled08e_alex_periode($uid) {
    if (aled08e_meta($uid, 'alex_mensuel') === '1') return 'mois';
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    return ($f['periode'] ?? 'mois') === 'trimestre' ? 'trimestre' : 'mois';
}
/* « ce mois-ci » ou « ce trimestre » */
function aled08e_periode_ce($uid) { return aled08e_alex_periode($uid) === 'trimestre' ? 'ce trimestre' : 'ce mois-ci'; }
/* Début de la période en cours (heure du site) : le 1er du mois, ou le 1er du trimestre (janvier, avril, juillet, octobre) */
function aled08e_periode_debut($periode) {
    $m = (int) wp_date('n');
    if ($periode === 'trimestre') $m -= ($m - 1) % 3;
    return sprintf('%04d-%02d-01 00:00:00', (int) wp_date('Y'), $m);
}
/* Interventions d'Alex déjà utilisées sur la période du client (mois ou trimestre) */
function aled08e_count_alex($uid) { return aled08e_count_month($uid, 'alex', aled08e_alex_periode($uid)); }
/* « une intervention d'Alex par trimestre » (ou par mois) */
function aled08e_alex_txt($uid, $f) {
    $q = (int) $f['quota'];
    return ($q === 1 ? 'une intervention' : $q . ' interventions') . ' d’Alex par ' . aled08e_alex_periode($uid);
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
    // « Alex & Co <x@y> » : le nom affiché contient un caractère spécial, on le met entre guillemets
    if ($reply && preg_match('/^\s*([^<"]+?)\s*<([^>]+)>\s*$/', $reply, $mm)) $reply = '"' . str_replace('"', '', $mm[1]) . '" <' . $mm[2] . '>';
    if ($reply) $h[] = 'Reply-To: ' . $reply;
    return $h;
}
function aled08e_date($mysql) { return $mysql ? wp_date('j F Y', strtotime(get_gmt_from_date($mysql) . ' UTC')) : ''; }
function aled08e_prenom($u) { return $u ? ($u->first_name ?: $u->display_name) : ''; }

/* Statuts d'une demande */
function aled08e_statuts() {
    return ['recue' => ['Reçue', 'st-new'], 'encours' => ['En cours', 'st-doing'], 'faite' => ['Faite', 'st-done'], 'annulee' => ['Annulée', 'esp-st-off']];
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
require_once __DIR__ . '/includes/changer.php';
require_once __DIR__ . '/includes/gestion.php';
require_once __DIR__ . '/includes/stats.php';
require_once __DIR__ . '/includes/vacances.php';
require_once __DIR__ . '/includes/boutique.php';
require_once __DIR__ . '/includes/brief.php';
require_once __DIR__ . '/includes/jetons.php';
require_once __DIR__ . '/includes/reseaux.php';
require_once __DIR__ . '/includes/bulle.php';

/* =========================================================================
 *  Rôle « Client Alex & Co » et type de contenu « Demande »
 * ========================================================================= */
function aled08e_add_role() {
    if (!get_role(ALED08E_ROLE)) add_role(ALED08E_ROLE, 'Client Alex & Co', ['read' => true]);
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
    $email['subject'] = 'Votre espace client Alex & Co';
    $email['message'] = 'Bonjour ' . aled08e_prenom($user) . ",\n\n"
        . ($ctx && !empty($ctx['ref'])
            ? 'Votre commande ' . $ctx['ref'] . ' est bien enregistrée. Votre espace client Alex & Co est prêt : vous y suivez votre commande, puis vous y envoyez vos demandes de modification. Vous y retrouvez aussi votre parrainage et vos factures.' . "\n\n"
            : (get_user_meta($user->ID, 'aled08_inscrit_seul', true) ? 'Votre compte Alex & Co est créé, merci ! Quand vous commanderez votre site, vous y suivrez tout : la commande, vos demandes de modification aux petits monstres ou à Alex et votre parrainage.' . "\n\n"
            : 'Votre espace client Alex & Co est prêt. Vous y envoyez vos demandes de modification, vous suivez leur avancement, et vous retrouvez votre parrainage et vos factures.' . "\n\n"))
        . "Pour choisir votre mot de passe, ouvrez ce lien :\n" . $link . "\n\n"
        . "Ensuite, connectez-vous ici :\n" . aled08e_url() . "\n"
        . 'Votre identifiant : ' . $user->user_login . " (ou votre adresse e-mail)\n\n"
        . "À bientôt,\nAlex et sa petite bande\n";
    $email['headers'] = 'Content-Type: text/plain; charset=UTF-8';
    return $email;
}, 10, 2);

/* Pas de cache pour l'espace client ni pour la page de confirmation de commande */
add_action('template_redirect', function () {
    if (!is_page('mon-espace') && !is_page('commande-confirmee')) return;
    nocache_headers();
    do_action('litespeed_control_set_nocache', 'espace client Alex & Co');
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
/* Demandes du mois (ou du trimestre avec $periode = 'trimestre') : $par = 'alex' (interventions à la main), 'lia' (jetons Lia, automatisations) ou '' (toutes) */
function aled08e_count_month($uid, $par = 'alex', $periode = 'mois') {
    $args = [
        'post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => ['private', 'publish'], 'fields' => 'ids',
        'posts_per_page' => 200, 'no_found_rows' => true,
        'date_query' => $periode === 'trimestre' ? [['after' => aled08e_periode_debut('trimestre'), 'inclusive' => true]] : [['year' => (int) wp_date('Y'), 'month' => (int) wp_date('n')]],
    ];
    $pasAnnulee = ['key' => '_aled08_annulee_le', 'compare' => 'NOT EXISTS'];
    // un article ou un point avec Alex, payés à part, ne comptent pas dans les interventions de l'abonnement
    $pasExtra = ['key' => '_aled08_extra', 'compare' => 'NOT EXISTS'];
    if ($par === 'lia') $args['meta_query'] = ['relation' => 'AND', ['key' => '_aled08_par', 'value' => 'lia'], $pasAnnulee];
    elseif ($par === 'alex') $args['meta_query'] = ['relation' => 'AND', ['relation' => 'OR', ['key' => '_aled08_par', 'value' => 'alex'], ['key' => '_aled08_par', 'compare' => 'NOT EXISTS']], $pasAnnulee, $pasExtra];
    else $args['meta_query'] = [$pasAnnulee];
    $q = new WP_Query($args);
    return count($q->posts);
}
/* =========================================================================
 *  Annulation d'une demande par le client : gratuite dans les 24 heures, 3 fois par mois.
 *  La demande ne compte plus dans le mois ; ce que Lia avait mis en ligne est remis comme avant.
 * ========================================================================= */
const ALED08E_ANNUL_MOIS = 3;
const ALED08E_ANNUL_HEURES = 24;
function aled08e_annulations_mois($uid) {
    $q = new WP_Query(['post_type' => ALED08E_CPT, 'author' => (int) $uid, 'post_status' => ['private', 'publish'], 'fields' => 'ids', 'posts_per_page' => 50, 'no_found_rows' => true,
        'meta_query' => [['key' => '_aled08_annulee_le', 'value' => wp_date('Y-m'), 'compare' => 'LIKE']]]);
    return count($q->posts);
}
/* '' si la demande peut être annulée, sinon la raison : 'deja', 'delai', 'quota' */
function aled08e_annulation_possible($p) {
    if (get_post_meta($p->ID, '_aled08_annulee_le', true)) return 'deja';
    if (time() - (int) get_post_time('U', true, $p) > ALED08E_ANNUL_HEURES * HOUR_IN_SECONDS) return 'delai';
    if (aled08e_annulations_mois($p->post_author) >= ALED08E_ANNUL_MOIS) return 'quota';
    return '';
}
function aled08e_annuler_demande($pid) {
    $p = get_post($pid);
    if (!$p || $p->post_type !== ALED08E_CPT) return new WP_Error('aled08_annul', 'Demande introuvable.');
    if (($pourquoi = aled08e_annulation_possible($p)) !== '') return new WP_Error('aled08_annul', $pourquoi);
    $uid = (int) $p->post_author;
    $etat = (string) get_post_meta($pid, '_aled08_lia_etat', true);
    $note = '';
    if ($etat === 'a_confirmer' && function_exists('aled08e_lia_appel')) aled08e_lia_appel($uid, 'abandonner', ['jeton' => (string) get_post_meta($pid, '_aled08_lia_jeton', true)]);
    if ($etat === 'fait' && function_exists('aled08e_lia_annuler')) $note = aled08e_lia_annuler($pid);
    update_post_meta($pid, '_aled08_annulee_le', current_time('mysql'));
    // ce que Lia a publié de nouveau (actualité, photo, nom du site) ne se défait pas tout seul : dans ce cas les jetons restent comptés
    $resteEnLigne = false;
    if ($etat === 'fait') foreach ((array) get_post_meta($pid, '_aled08_lia_actions', true) as $a) if (in_array($a['type'] ?? '', ['publier', 'image', 'reglage'], true)) $resteEnLigne = true;
    if (!$resteEnLigne) aled08e_jl_rendre($uid, 'demande:' . $pid);
    update_post_meta($pid, '_aled08_statut', 'annulee');
    if ($etat) update_post_meta($pid, '_aled08_lia_etat', 'annule');
    update_post_meta($pid, '_aled08_reponse', $resteEnLigne
        ? 'Demande annulée. Ce que les petits monstres avaient publié de nouveau reste en ligne : Alex le retire à la main. L’énergie de cette demande reste comptée.'
        : 'Demande annulée. Elle ne compte pas dans vos interventions' . (get_post_meta($pid, '_aled08_jetons', true) ? ' : vos points d’énergie vous sont rendus.' : '.') . ($etat === 'fait' ? ' Votre page a été remise comme avant.' : ''));
    $u = get_userdata($uid);
    wp_mail(aled08e_to(), 'Une demande a été annulée par le client', 'Client : ' . ($u ? $u->display_name : '?') . "\nDemande : " . $p->post_content . "\n"
        . ($note ? "\nCe que Lia avait mis en ligne : " . $note . "\n" : '')
        . (get_post_meta($pid, '_aled08_hors_forfait', true) ? "\nC'était une intervention d'Alex en plus (" . aled08e_boost_txt() . ") : à rembourser ou retirer de sa facture.\n" : '')
        . (aled08e_extras_demande($pid) ? "\nExtras payés à retirer de sa facture : " . aled08e_extras_demande_txt($pid) . "\n" : '')
        . "\nAnnulations ce mois-ci : " . aled08e_annulations_mois($uid) . ' / ' . ALED08E_ANNUL_MOIS . "\nFiche : " . admin_url('post.php?post=' . $pid . '&action=edit') . "\n", aled08e_mail_headers());
    return true;
}
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_annuler'])) return;
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $pid = (int) $_POST['aled08e_annuler'];
    $p = get_post($pid);
    $ok = $p && (int) $p->post_author === get_current_user_id() && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_annul'] ?? '')), 'aled08e_annuler_' . $pid);
    $r = $ok ? aled08e_annuler_demande($pid) : new WP_Error('aled08_annul', 'erreur');
    $m = !is_wp_error($r) ? 'annul_ok' : ($r->get_error_message() === 'quota' ? 'annul_quota' : ($r->get_error_message() === 'delai' ? 'annul_delai' : 'erreur'));
    wp_safe_redirect(aled08e_url(['m' => $m]) . '#demandes', 303);
    exit;
}, 4);

function aled08e_annulation_html($p) {
    if (get_post_meta($p->ID, '_aled08_annulee_le', true)) return '';
    $pourquoi = aled08e_annulation_possible($p);
    if ($pourquoi === 'delai') return '';
    if ($pourquoi === 'quota') return '<span class="req-annul-info">Vous avez utilisé vos 3 annulations du mois. Pour annuler celle-ci, <a href="' . esc_url(home_url('/contact/')) . '">écrivez à Alex</a>.</span>';
    $reste = ALED08E_ANNUL_MOIS - aled08e_annulations_mois($p->post_author);
    return '<form method="post" action="' . esc_url(aled08e_url()) . '" class="req-annul" onsubmit="return confirm(\'Annuler cette demande ? Elle ne comptera pas dans vos interventions.\');">'
        . '<input type="hidden" name="aled08e_annuler" value="' . (int) $p->ID . '">' . wp_nonce_field('aled08e_annuler_' . $p->ID, '_aled08e_annul', true, false)
        . '<button class="link-btn" type="submit">' . aled08e_icon('x') . 'Annuler la demande</button><small>gratuit pendant 24 heures, encore ' . (int) $reste . ' ce mois-ci</small></form>';
}
/* Jetons Lia du forfait (null = illimité) */
function aled08e_jetons($f) { return array_key_exists('jetons', $f) ? $f['jetons'] : 1; }
/* Comptes « famille » : modifications par Lia et par Alex sans limite */
function aled08e_famille($uid) { return aled08e_meta($uid, 'famille') === '1'; }
/* Jetons Lia du mois pour ce client : ceux du forfait, plus ceux de l'option Lia + */
function aled08e_jetons_user($uid, $f) { return aled08e_jl_mois($uid, $f); }
/* Ce que Lia peut faire dans une demande : nombre de mots selon le nombre d'images (0, 1, 2 ou 3 images) */
function aled08e_lia_limites() { return ['mots' => [300, 200, 100, 40], 'images' => 3]; }

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
    // extra à la demande, payé à part : un article écrit et publié, ou un point de 30 minutes avec Alex
    $extra = sanitize_key(wp_unslash($_POST['extra'] ?? ''));
    if (!in_array($extra, ['article', 'point'], true) || !aled08e_a_la_demande($extra)) $extra = '';
    if ($extra && empty($_POST['extra_ok'])) $back('extra_accord');
    // par Lia (automatique, un jeton) ou par Alex (à la main) ; plus de jeton ce mois-ci : la demande passe à Alex
    $par = !$extra && sanitize_key(wp_unslash($_POST['par'] ?? 'alex')) === 'lia' ? 'lia' : 'alex';
    // Lia ne peut pas travailler pour ce client (clé Claude absente ou site pas encore relié) : la demande va à Alex, sans jeton
    if ($par === 'lia' && !aled08e_lia_prete_pour($uid)) $par = 'alex';
    // deux compteurs séparés : les modifications par Lia (forfait + option Lia +) et celles par Alex
    $famille = aled08e_famille($uid);
    // prix de la modification par Lia, en Jetons Lia : selon le nombre de mots écrits et de photos jointes
    $nbPhotos = 0;
    if (!empty($_FILES['photos']['name']) && is_array($_FILES['photos']['name'])) $nbPhotos = min(aled08e_lia_limites()['images'], count(array_filter($_FILES['photos']['name'], 'strlen')));
    elseif (!empty($_FILES['photo']['name'])) $nbPhotos = 1;
    $prixLia = aled08e_jl_prix_modif($txt, $nbPhotos);
    if (!$famille && $par === 'lia' && $prixLia > aled08e_jl_etat($uid, $f)['solde']) $back('lia_epuise');
    // interventions d'Alex de la période (mois ou trimestre) utilisées : la demande devient une intervention en plus, payante,
    // avec l'accord du client (le « Boost »). Un article ou un point avec Alex se paient à part et ne comptent pas.
    $over = !$famille && !$extra && $par === 'alex' && aled08e_count_alex($uid) >= (int) $f['quota'];
    if ($over && empty($_POST['boost_ok'])) $back('boost_accord');
    // demande traitée sous 24 heures : seulement pour Alex (Lia fait la sienne tout de suite)
    $urgent = !$famille && $par === 'alex' && !empty($_POST['urgent']) && aled08e_a_la_demande('urgent');
    $prefixe = $extra === 'article' ? 'Article : ' : ($extra === 'point' ? 'Point avec Alex : ' : '');
    $title = mb_strlen($txt) > 70 ? rtrim(mb_substr($txt, 0, 67)) . '…' : $txt;
    $title = $prefixe . trim(preg_replace('/\s+/', ' ', $title));
    $pid = wp_insert_post(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'post_author' => $uid, 'post_title' => $title, 'post_content' => $txt, 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
    if (is_wp_error($pid)) $back('erreur');
    update_post_meta($pid, '_aled08_statut', 'recue');
    update_post_meta($pid, '_aled08_par', $par);
    if ($over) { update_post_meta($pid, '_aled08_boost', 1); update_post_meta($pid, '_aled08_hors_forfait', 1); aled08e_boost_facturer($pid, $uid); }
    $payes = [];
    if ($extra) { update_post_meta($pid, '_aled08_extra', $extra); $payes[] = $extra; }
    if ($urgent) { update_post_meta($pid, '_aled08_urgent', 1); $payes[] = 'urgent'; }
    if ($payes) {
        update_post_meta($pid, '_aled08_extras', $payes);
        if (!$famille) foreach ($payes as $x) aled08e_extra_facturer($pid, $uid, $x);
    }

    $photo = '';
    $photoFail = false;
    $fichiers = [];
    if (!empty($_FILES['photos']['name']) && is_array($_FILES['photos']['name'])) {
        foreach ($_FILES['photos']['name'] as $k => $nom) {
            if ($nom === '' || count($fichiers) >= aled08e_lia_limites()['images']) continue;
            $fichiers[] = ['name' => $nom, 'type' => $_FILES['photos']['type'][$k], 'tmp_name' => $_FILES['photos']['tmp_name'][$k], 'error' => $_FILES['photos']['error'][$k], 'size' => $_FILES['photos']['size'][$k]];
        }
    } elseif (!empty($_FILES['photo']['name'])) {
        $fichiers[] = $_FILES['photo'];
    }
    $photosIds = [];
    foreach ($fichiers as $fichier) {
        if (!empty($fichier['error']) || $fichier['size'] > 8 * 1024 * 1024) { $photoFail = true; continue; }
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        $_FILES['aled08e_une_photo'] = $fichier;
        $att = media_handle_upload('aled08e_une_photo', $pid, ['post_author' => $uid], [
            'test_form' => false,
            'mimes' => ['jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp', 'heic' => 'image/heic'],
        ]);
        if (is_wp_error($att)) { $photoFail = true; continue; }
        if (!$photosIds) { set_post_thumbnail($pid, $att); $photo = wp_get_attachment_url($att); }
        $photosIds[] = (int) $att;
    }
    if ($photosIds) update_post_meta($pid, '_aled08_photos', $photosIds);
    // les Jetons Lia sont comptés ici, sur les photos vraiment jointes. Pas assez de jetons au dernier moment
    // (deux demandes envoyées en même temps) : la demande est retirée, rien n'est compté.
    if ($par === 'lia') {
        $prixLia = aled08e_jl_prix_modif($txt, count($photosIds));
        if (!aled08e_jl_debiter($uid, $prixLia, 'Modification par les petits monstres', 'demande:' . $pid)) {
            foreach ($photosIds as $att) wp_delete_attachment($att, true);
            wp_delete_post($pid, true);
            $back('lia_epuise');
        }
        update_post_meta($pid, '_aled08_jetons', $famille ? 0 : $prixLia);
    }

    $u = wp_get_current_user();
    $delai = $urgent ? (aled08e_data()['delais']['urgent'] ?? '24 heures') : aled08e_data()['delais']['reponse'];
    $quoi = $extra === 'article' ? 'Article à écrire et publier' : ($extra === 'point' ? 'Point de 30 minutes avec Alex à caler' : 'Nouvelle demande de modification');
    $corps = $quoi . "\n\n"
        . 'Client   : ' . $u->display_name . ' (' . $u->user_email . ")\n"
        . 'Site     : ' . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\n"
        . 'Délai    : réponse sous ' . $delai . ($urgent ? ' (URGENT)' : '') . ($over ? ' (INTERVENTION EN PLUS : ' . aled08e_boost_txt() . ', ' . (get_post_meta($pid, '_aled08_boost_facture', true) ? 'ajoutée à sa prochaine facture Stripe' : 'à facturer à la main') . ')' : '') . "\n"
        . ($payes ? 'Extras   : ' . aled08e_extras_demande_txt($pid) . "\n" : '')
        . 'Par      : ' . ($par === 'lia' ? 'Lia (instantané, avec aperçu à valider)' : 'Alex (modification à la main)') . "\n"
        . ($photo ? "Photo    : $photo\n" : '')
        . "\nDemande :\n$txt\n\n"
        . 'Suivre et répondre : ' . admin_url('post.php?post=' . $pid . '&action=edit') . "\n";
    $sujet = ($urgent ? 'URGENT 24 h, ' : '') . ($extra === 'article' ? 'Article à écrire : ' : ($extra === 'point' ? 'Point avec Alex : ' : 'Demande de modification : '));
    wp_mail(aled08e_to(), $sujet . $u->display_name, $corps, aled08e_mail_headers($u->display_name . ' <' . $u->user_email . '>'));
    do_action('aled08e_demande_creee', $pid, $par, $uid);

    $back($photoFail ? 'photo' : ($extra ? 'extra_ok' : ($over ? 'boost' : ($urgent ? 'urgent_ok' : 'ok'))));
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
    if (get_post_meta($post->ID, '_aled08_hors_forfait', true)) echo '<p style="color:#b32d2e"><strong>Intervention en plus (' . esc_html(aled08e_boost_txt()) . ') :</strong> celles de la période étaient déjà utilisées. ' . (get_post_meta($post->ID, '_aled08_boost_facture', true) ? 'Ajoutée à la prochaine facture Stripe du client.' : 'À facturer à la main.') . '</p>';
    if (aled08e_extras_demande($post->ID)) echo '<p style="color:#b32d2e"><strong>Extras payés :</strong> ' . esc_html(aled08e_extras_demande_txt($post->ID)) . '</p>';
}
function aled08e_client_box($post) {
    $u = get_userdata($post->post_author);
    if (!$u) { echo '<p>Client inconnu.</p>'; return; }
    $f = aled08e_forfait(aled08e_meta($u->ID, 'forfait'));
    echo '<p><strong>' . esc_html($u->display_name) . '</strong><br><a href="mailto:' . esc_attr($u->user_email) . '">' . esc_html($u->user_email) . '</a></p>';
    if (aled08e_meta($u->ID, 'site')) echo '<p>Site : <a href="' . esc_url(aled08e_meta($u->ID, 'site')) . '" target="_blank" rel="noopener">' . esc_html(aled08e_meta($u->ID, 'site')) . '</a></p>';
    $jt = aled08e_jetons($f);
    echo '<p>Abonnement · Alex ' . (int) aled08e_count_alex($u->ID) . ' / ' . (int) $f['quota'] . ' ' . esc_html(aled08e_periode_ce($u->ID)) . ' · Jetons Lia ' . (int) aled08e_jl_etat($u->ID, $f)['solde'] . ' restants (' . (int) aled08e_jl_mois($u->ID, $f) . ' par mois)</p>';
    $par = get_post_meta($post->ID, '_aled08_par', true) === 'lia' ? 'Lia (instantané, avec aperçu)' : 'Alex (à la main)';
    echo '<p><strong>Demandée à : ' . esc_html($par) . '</strong></p>';
    echo '<p><a href="' . esc_url(get_edit_user_link($u->ID)) . '#aled08e">Fiche client</a></p>';
    if (has_post_thumbnail($post)) echo '<p>' . get_the_post_thumbnail($post, 'medium', ['style' => 'max-width:100%;height:auto;border-radius:8px']) . '</p>';
}
add_action('save_post_' . ALED08E_CPT, function ($pid, $post) {
    if (!isset($_POST['_aled08e_suivi']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_suivi'])), 'aled08e_suivi')) return;
    if (!current_user_can('edit_post', $pid) || wp_is_post_revision($pid)) return;
    aled08e_demande_marquer($pid, sanitize_key(wp_unslash($_POST['aled08e_statut'] ?? 'recue')), sanitize_textarea_field(wp_unslash($_POST['aled08e_reponse'] ?? '')));
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
    if ($col === 'aled08_par') echo get_post_meta($pid, '_aled08_par', true) === 'lia' ? '<strong>Lia</strong>' : 'Alex';
    if ($col === 'aled08_client') {
        $u = get_userdata(get_post_field('post_author', $pid));
        echo $u ? esc_html($u->display_name) : '';
    }
    if ($col === 'aled08_statut') {
        $st = get_post_meta($pid, '_aled08_statut', true) ?: 'recue';
        $colors = ['recue' => '#2C67AE', 'encours' => '#9a6a00', 'faite' => '#1f7a55'];
        echo '<strong style="color:' . esc_attr($colors[$st] ?? '#333') . '">' . esc_html(aled08e_statuts()[$st][0] ?? $st) . '</strong>';
        if (get_post_meta($pid, '_aled08_hors_forfait', true)) echo '<br><small>Intervention en plus ' . esc_html(aled08e_boost_txt()) . '</small>';
        foreach (aled08e_extras_demande($pid) as $x) { $xx = aled08e_a_la_demande($x); if ($xx) echo '<br><small>' . esc_html($xx['name'] . ' ' . aled08e_euro_txt($xx['prix'])) . '</small>'; }
    }
}, 10, 2);

/* =========================================================================
 *  Fiche client (profil utilisateur, réservé à l'administrateur)
 * ========================================================================= */
function aled08e_fields() {
    $forfaits = [];
    foreach (aled08e_data()['forfaits'] as $f) $forfaits[$f['id']] = $f['name'];
    if (!$forfaits) $forfaits = ['base' => 'Abonnement'];
    $extras = [];
    foreach (aled08e_extras() as $o) $extras[$o['id']] = ['Extra : ' . $o['name'] . ' (' . aled08e_euro_txt($o['month']) . ' par mois)', 'check', 'Actif'];
    return [
        'forfait' => ['Abonnement', 'select', $forfaits],
        'paiement' => ['Paiement de l’abonnement', 'select', ['mois' => 'Au mois', 'annee' => 'À l’année']],
        'site' => ['Adresse du site', 'url', 'https://www.exemple.fr'],
    ] + $extras + [
        'domaine_info' => ['Nom de domaine (info affichée)', 'text', 'exemple.fr, renouvelé le 3 mars 2027'],
        'avis' => ['Lien d’avis Google', 'url', 'https://g.page/r/.../review'],
        'parrain' => ['Parrainé par (code)', 'text', 'Ex. : LILA-7K2'],
        'code' => ['Son code de parrainage', 'text', 'Créé automatiquement'],
        'mois_offerts' => ['Mois offerts à utiliser', 'text', '0'],
        'boutique' => ['Boutique en ligne', 'check', 'Oui : le client a une boutique (onglet Vacances, ventes dans le tableau de bord).'],
        'famille' => ['Famille : modifications illimitées', 'check', 'Oui : modifications par Lia et par Alex sans limite (affichées ∞ avec un cœur).'],
        'alex_mensuel' => ['Une intervention d’Alex chaque mois', 'check', 'Oui : client inscrit avant l’offre V2 (16 novembre 2026), il garde une intervention par mois. Sinon : une par trimestre.'],
        'offert' => ['Abonnement offert à vie', 'check', 'Oui : l’abonnement et ses extras sont gratuits pour ce client, pour toujours. Son compte n’est jamais supprimé automatiquement.'],
        'abonnement_manuel' => ['Abonnement actif hors Stripe', 'check', 'Oui : ce client paie autrement (virement, espèces). Son compte n’est jamais supprimé automatiquement.'],
        'stats_mois' => ['Tableau de bord : mois', 'text', 'Novembre 2026'],
        'stats_visites' => ['Visites', 'text', '1240'],
        'stats_google' => ['Apparitions sur Google', 'text', '3420'],
        'stats_appels' => ['Appels ou contacts', 'text', '23'],
        'stats_ventes' => ['Ventes (boutique)', 'text', ''],
        'stats_recherches' => ['Meilleures recherches (une par ligne : recherche | position)', 'textarea', "pâtisserie rethel | 4\ntarte aux fraises rethel | 2"],
        'stats_rapport' => ['Lien du rapport mensuel (PDF)', 'url', ''],
        'factures' => ['Factures saisies à la main (une par ligne : date ; libellé ; montant ; lien)', 'textarea', "Novembre 2026 ; Abonnement ; 10 € ; https://..."],
    ];
}
function aled08e_profile_fields($user) {
    if (!current_user_can('edit_users')) return;
    $uid = is_object($user) ? $user->ID : 0;
    echo '<h2 id="aled08e">Espace client Alex & Co</h2><p>Ces informations s’affichent dans l’espace client (page <a href="' . esc_url(aled08e_url()) . '" target="_blank">Mon espace</a>).</p>';
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
                . 'Bonne nouvelle : ' . aled08e_prenom($u) . ' a créé son site grâce à vous. Vous recevez ' . aled08e_mois_txt($m) . " d’abonnement offert, merci !\n\n"
                . "Vos parrainages sont dans votre espace client :\n" . aled08e_url() . "#parrainage\n\nÀ bientôt,\nAlex et sa petite bande\n";
            wp_mail($p->user_email, 'Votre parrainage : un mois offert', $corps, aled08e_mail_headers());
        }
    }
}
add_action('personal_options_update', 'aled08e_profile_save');
add_action('edit_user_profile_update', 'aled08e_profile_save');
add_action('user_register', 'aled08e_profile_save');

/* Colonne « Forfait » dans la liste des utilisateurs */
add_filter('manage_users_columns', function ($c) { $c['aled08_forfait'] = 'Abonnement Alex & Co'; return $c; });
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
    wp_enqueue_script('aled08-outils', plugins_url('outils.js', __FILE__), [], (string) @filemtime(__DIR__ . '/outils.js'), ['in_footer' => true, 'strategy' => 'defer']);
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
    $soldeDu = aled08e_cmd_reception_due($cmd);
    $flash = '';
    if (isset($_GET['solde']) && $_GET['solde'] === 'ok') $flash = '<p class="esp-empty" role="status">Merci ! Votre paiement est en cours de confirmation. Il apparaîtra ici dans quelques minutes, et votre abonnement démarre.</p>';
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
                <button class="btn btn-primary btn-flaque" type="submit"><?php echo aled08e_icon('credit-card'); // phpcs:ignore ?><span>Payer l’acompte de <?php echo aled08e_euro($m['total_jour']); // phpcs:ignore ?></span></button>
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
          <?php echo aled08e_brief_html($cmd); // phpcs:ignore ?>

          <p class="app-sub">Votre site</p>
          <dl class="esp-grid">
            <div><dt>Type de site</dt><dd><?php echo esc_html($type ? $type['label'] : $cmd['type']); ?><small><?php echo aled08e_euro($m['creation']); // phpcs:ignore ?> de création</small></dd></div>
            <div><dt>Nom de domaine</dt><dd><?php echo esc_html($cmd['domaine'] ?: 'À choisir'); ?><small><?php echo esc_html(aled08e_cmd_domaine_libelle_client($cmd)); ?></small></dd></div>
            <div><dt>Abonnement</dt><dd><?php echo aled08e_euro($m['mensuel_forfait']) . ' ' . esc_html($per); // phpcs:ignore ?><small>Nom de domaine, hébergement, suivi, énergie des petits monstres</small></dd></div>
            <div><dt>Options</dt><dd><?php echo $opts ? esc_html(implode(', ', $opts)) : 'Aucune'; ?></dd></div>
          </dl>

          <p class="app-sub">Paiement</p>
          <ul class="esp-amounts">
            <li><span>Acompte de <?php echo (int) $D['acompte']; ?> % à la commande</span><b><?php echo aled08e_euro($m['acompte']); // phpcs:ignore ?></b><small><?php echo in_array($s, aled08e_cmd_statuts_payes(), true) ? 'payé' : 'à payer à la commande'; ?></small></li>
            <?php if ($m['options_ponctuel'] > 0) : ?><li><span>Options payées une fois</span><b><?php echo aled08e_euro($m['options_ponctuel']); // phpcs:ignore ?></b><small>à la commande</small></li><?php endif; ?>
            <?php if ($cmd['reception_payee'] && $cmd['lissage']) : ?>
            <li><span>Le reste, en <?php echo (int) $m['lissage_total_echeances']; ?> fois sans frais</span><b><?php echo aled08e_euro($m['lissage_mensualite']) . ' par mois'; // phpcs:ignore ?></b><small><?php echo (int) $cmd['lissage_paye']; ?> / <?php echo (int) $m['lissage_total_echeances']; ?> échéances payées, puis plus rien à payer</small></li>
            <?php else : ?>
            <li><span>Le reste, à la réception du site</span><b><?php echo aled08e_euro($solde); // phpcs:ignore ?></b><small><?php echo ($cmd['solde_paye'] || $cmd['reception_payee']) ? 'payé, merci !' : 'en une fois, ou en ' . esc_html(implode(' ou ', (array) $D['lissageDurees'])) . ' fois sans frais'; ?></small></li>
            <?php endif; ?>
            <li><span>Abonnement<?php echo $m['mensuel_options'] > 0 ? ' et extras' : ''; ?></span><b><?php echo aled08e_euro($m['mensuel_forfait'] + $m['mensuel_options']) . ' ' . esc_html($per); // phpcs:ignore ?></b><small><?php echo $cmd['reception_payee'] ? 'en cours' : 'démarre à la réception du site'; ?></small></li>
          </ul>
          <?php if ($soldeDu) : ?>
            <?php if (aled08e_stripe_ready()) :
                $mf = aled08e_cmd_montants_reception($cmd, 0); ?>
            <form method="post" action="<?php echo esc_url(aled08e_url()); ?>" class="esp-pay esp-reception">
              <input type="hidden" name="aled08e_solde" value="1"><input type="hidden" name="cid" value="<?php echo (int) $cmd['id']; ?>">
              <?php wp_nonce_field('aled08e_solde_' . $cmd['id'], '_aled08e_solde'); ?>
              <p><strong>Votre site est en ligne !</strong> Il reste <?php echo aled08e_euro($solde); // phpcs:ignore ?> pour la création. Choisissez comment payer : votre abonnement démarre en même temps.</p>
              <label class="esp-reste"><input type="radio" name="reste" value="0"<?php checked(!$cmd['lissage']); ?>><span><strong>En une fois</strong><small><?php echo aled08e_euro($mf['solde']); // phpcs:ignore ?>, puis l’abonnement : <?php echo aled08e_euro($mf['mensuel_forfait'] + $mf['mensuel_options']) . ' ' . esc_html($per); // phpcs:ignore ?></small></span></label>
              <?php foreach ((array) $D['lissageDurees'] as $n) : $mn = aled08e_cmd_montants_reception($cmd, (int) $n); ?>
              <label class="esp-reste"><input type="radio" name="reste" value="<?php echo (int) $n; ?>"<?php checked((int) $cmd['lissage'], (int) $n); ?>><span><strong>En <?php echo (int) $n; ?> fois sans frais</strong><small><?php echo aled08e_euro($mn['lissage_mensualite'] + $mn['mensuel_forfait'] + $mn['mensuel_options']); // phpcs:ignore ?> par mois pendant <?php echo (int) $n; ?> mois (<?php echo aled08e_euro($mn['lissage_mensualite']); // phpcs:ignore ?> pour le site + l’abonnement), engagement le temps de payer</small></span></label>
              <?php endforeach; ?>
              <button class="btn btn-primary btn-flaque" type="submit"><?php echo aled08e_icon('credit-card'); // phpcs:ignore ?><span>Payer et démarrer mon abonnement</span></button>
            </form>
            <?php else : ?>
            <p class="esp-warn">Votre site est en ligne : il reste <?php echo aled08e_euro($solde); // phpcs:ignore ?> pour la création, en une fois ou en <?php echo esc_html(implode(' ou ', (array) $D['lissageDurees'])); ?> fois sans frais. Je vous envoie le lien de paiement par e-mail.</p>
            <?php endif; ?>
          <?php endif; ?>
          <p class="app-note">Une question sur votre commande ? Répondez à l’e-mail de confirmation, ou passez par le <a href="<?php echo esc_url(home_url('/contact/')); ?>">formulaire de contact</a>.</p>
    <?php
    return ob_get_clean();
}

function aled08e_dashboard() {
    $u = wp_get_current_user();
    $uid = $u->ID;
    if (aled08e_est_gerant()) return aled08e_gestion($u); // l'administrateur voit la gestion, pas l'espace client
    if (aled08e_sans_forfait($uid)) return aled08e_dashboard_libre($u);
    $D = aled08e_data();
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mail = aled08e_meta($uid, 'mail') === '1';
    $optMail = aled08e_option('mail') ?: ['name' => 'Adresse e-mail pro', 'month' => 3];
    $site = aled08e_meta($uid, 'site');
    $host = $site ? preg_replace('#^www\.#', '', (string) wp_parse_url($site, PHP_URL_HOST)) : '';
    $prenom = aled08e_prenom($u);
    $used = aled08e_count_alex($uid);
    $periodeCe = aled08e_periode_ce($uid); // « ce trimestre » ou « ce mois-ci »
    $periodeDu = aled08e_alex_periode($uid) === 'trimestre' ? 'du trimestre' : 'du mois';
    $jetonsMax = aled08e_jetons_user($uid, $f);
    $jl = aled08e_jl_etat($uid, $f);
    $jlModif = aled08e_jl_cfg()['modif'];
    $jetonsLeft = (int) $jl['solde']; // Jetons Lia restants (forfait du mois + recharge)
    $illimite = false;
    $quota = (int) $f['quota'];
    $left = max(0, $quota - $used); // modifications par Alex restantes
    $famille = aled08e_famille($uid);
    if ($famille) { $left = 999; $jetonsLeft = 999; }
    $infini = '<span class="jauge-infini">∞ <span class="jauge-coeur" aria-hidden="true">♥</span></span><span class="sr-only">illimité</span>';
    $liaLim = aled08e_lia_limites();
    // options mensuelles actives du compte (e-mail pro, stock, comptes clients, modifications illimitées)
    $optsMois = [];
    foreach (aled08e_extras() as $o) if (aled08e_extra_actif($uid, $o['id'])) $optsMois[] = $o;
    $code = aled08e_code($uid);
    $plink = home_url('/creer-mon-site/?parrain=' . rawurlencode($code));
    $filleuls = aled08e_filleuls($uid);
    $demandesFilleuls = get_user_meta($uid, 'aled08_filleuls_demandes', true);
    $demandesFilleuls = is_array($demandesFilleuls) ? $demandesFilleuls : [];
    $moisGagnes = count($filleuls) * (int) $D['parrainageMois'];
    $moisDispo = (int) aled08e_meta($uid, 'mois_offerts');
    $delai = $D['delais']['reponse'];
    $boostTxt = aled08e_boost_txt();

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
        return '<li>' . $thumb . '<span><strong>' . nl2br(esc_html(mb_strlen($text) > 220 ? mb_substr($text, 0, 217) . '…' : $text)) . '</strong><small>' . (get_post_meta($p->ID, '_aled08_par', true) === 'lia' ? 'par Bricou, ' : 'par Alex, ') . 'envoyée le ' . esc_html(aled08e_date($p->post_date)) . '</small>'
            . ($full && $rep ? (strpos($rep, 'Bricou : ') === 0
                ? '<span class="req-reply req-bricou">' . aled08e_monster('bricou') . '<span><b>Bricou</b>' . nl2br(esc_html(substr($rep, strlen('Bricou : ')))) . '</span></span>'
                : '<span class="req-reply">' . nl2br(esc_html($rep)) . '</span>') : '') . ($full ? aled08e_lia_bloc_confirmation($p) : '') . ($full ? aled08e_annulation_html($p) : '') . '</span><em class="st ' . esc_attr($st[$s][1]) . '">' . esc_html($st[$s][0]) . '</em></li>';
    };

    $flash = '';
    $m = isset($_GET['m']) ? sanitize_key(wp_unslash($_GET['m'])) : '';
    $msgs = [
        'ok' => ['esp-empty', 'Demande envoyée, merci ! Elle est bien arrivée, et vous suivez son avancement juste en dessous.'],
        'changer_ok' => ['esp-empty', 'C’est enregistré : vos extras changent à votre prochaine échéance. Votre énergie change le 1er du mois prochain.'],
        'changer_rien' => ['esp-empty', 'Rien n’a changé : ce sont déjà vos extras.'],
        'changer_erreur' => ['esp-warn', 'Le changement n’a pas pu se faire tout seul : Alex est prévenu et s’en occupe.'],
        'boost' => ['esp-empty', 'Demande envoyée à Alex : c’est une intervention en plus, ' . $boostTxt . ' ajoutés à votre prochaine facture.'],
        'boost_accord' => ['esp-warn', 'Votre intervention d’Alex ' . $periodeDu . ' est utilisée. Cochez la case « une intervention en plus » (' . $boostTxt . ') pour envoyer cette demande.'],
        'urgent_ok' => ['esp-empty', 'Demande envoyée : Alex la traite sous ' . ($D['delais']['urgent'] ?? '24 heures') . ', du lundi au vendredi. Le supplément est ajouté à votre prochaine facture.'],
        'extra_ok' => ['esp-empty', 'C’est commandé, merci ! Le prix est ajouté à votre prochaine facture, et Alex vous écrit sous ' . $D['delais']['reponse'] . '.'],
        'extra_accord' => ['esp-warn', 'Cochez la case qui accepte le prix avant de commander.'],
        'lia_epuise' => ['esp-warn', 'Il ne vous reste pas assez d’énergie pour cette demande. Raccourcissez-la, redonnez de l’énergie dans l’onglet Outils, ou choisissez Alex.'],
        'photo' => ['esp-warn', 'Demande envoyée, mais la photo n’a pas pu être ajoutée (8 Mo au plus, format JPG, PNG ou WEBP). Réessayez avec une photo plus légère.'],
        'vide' => ['esp-warn', 'Écrivez votre demande en quelques mots avant de l’envoyer.'],
        'trop' => ['esp-warn', 'Vous avez envoyé beaucoup de demandes aujourd’hui. Écrivez-nous par le formulaire de contact si c’est pressé.'],
        'erreur' => ['esp-warn', 'L’envoi n’a pas abouti. Réessayez dans un instant.'],
        'lia_oui' => ['esp-empty', 'Merci ! Votre modification est en ligne.'],
        'annul_ok' => ['esp-empty', 'Demande annulée. Elle ne compte pas dans vos interventions.'],
        'annul_quota' => ['esp-warn', 'Vous avez déjà annulé 3 demandes ce mois-ci. Pour celle-ci, écrivez à Alex.'],
        'annul_delai' => ['esp-warn', 'Une demande s’annule dans les 24 heures. Pour celle-ci, écrivez à Alex.'],
        'lia_non' => ['esp-empty', 'C’est noté : Alex reprend votre demande à la main.'],
        'lia_erreur' => ['esp-warn', 'La mise en ligne automatique n’a pas abouti : Alex s’en occupe à la main.'],
    ];
    if (isset($msgs[$m])) $flash = '<p class="' . $msgs[$m][0] . '" role="status">' . esc_html($msgs[$m][1]) . '</p>';
    $flashForfait = '';
    if (in_array($m, ['changer_ok', 'changer_rien', 'changer_erreur'], true)) { $flashForfait = $flash; $flash = ''; }
    if ($m === 'portail_erreur') $flashForfait = '<p class="esp-warn" role="status">La page de gestion du paiement n’a pas pu s’ouvrir. Réessayez dans un instant, ou écrivez-moi.</p>';

    $price = $annuel ? ($f['month'] * (12 - (int) $D['moisOfferts'])) : $f['month'];
    $per = $annuel ? 'par an' : 'par mois';
    $offert = aled08e_meta($uid, 'offert') === '1';
    if ($offert) $price = 0;
    $total = $price;
    if (!$offert) foreach ($optsMois as $o) $total += $annuel ? $o['month'] * (12 - (int) $D['moisOfferts']) : $o['month'];
    $wa = home_url('/contact/');
    $share = 'https://wa.me/?text=' . rawurlencode('Je te recommande Alex & Co pour ton site internet. Avec mon lien, on a chacun un mois d’abonnement offert : ' . $plink);

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
    <?php echo aled08e_bulle_html($uid); // phpcs:ignore ?>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small><?php echo esc_html($host ?: $u->user_email); ?></small></div></div>
        <div class="jauge<?php echo $jetonsLeft < (int) $jlModif['base'] ? ' is-low' : ''; ?>">
          <p class="jauge-head"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?><span>Énergie</span><b><?php echo $famille ? $infini : (int) $jetonsLeft . ' / ' . (int) max($jetonsMax, $jetonsLeft); // phpcs:ignore ?></b></p>
          <span class="jauge-bar"><i style="width:<?php echo $famille ? 100 : ($jetonsMax ? (int) round(min(100, $jetonsLeft / max($jetonsMax, $jetonsLeft) * 100)) : 0); ?>%"></i></span>
        </div>
        <div class="jauge<?php echo $left <= 0 ? ' is-low' : ''; ?>">
          <p class="jauge-head"><?php echo aled08e_icon('user'); // phpcs:ignore ?><span>Avec Alex, <?php echo esc_html(str_replace('-ci', '', $periodeCe)); ?></span><b><?php echo $famille ? $infini : (int) $left . ' / ' . (int) $quota; // phpcs:ignore ?></b></p>
          <span class="jauge-bar"><i style="width:<?php echo $famille ? 100 : ($quota ? (int) round(min(100, $left / $quota * 100)) : 0); ?>%"></i></span>
        </div>
        
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          <?php
          echo aled08e_tab('accueil', 'house', 'Accueil', true); // phpcs:ignore
          if ($cmd) echo aled08e_tab('commande', 'package', 'Ma commande'); // phpcs:ignore
          echo aled08e_tab('demandes', 'message-circle', 'Mes demandes') . aled08e_tab('tableau', 'gauge', 'Tableau de bord') . (aled08e_est_boutique($uid) ? aled08e_tab('vacances', 'shopping-bag', 'Ma boutique') : '') . aled08e_tab('outils', 'toolbox', 'Outils') . aled08e_tab('parrainage', 'gift', 'Parrainage') . aled08e_tab('compte', 'circle-user', 'Mon compte'); // phpcs:ignore
          ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour <?php echo esc_html($prenom); ?> !</h2>
          <?php echo aled08e_annonces_html(); // phpcs:ignore ?>
          <div class="app-cards">
            <button type="button" class="app-card c-<?php echo esc_attr($f['color']); ?>" data-go="forfait"><span class="app-card-art"><?php echo aled08e_monster('clin'); // phpcs:ignore ?></span><span><small>Votre abonnement</small><strong><?php echo $optsMois ? 'Avec ' . count($optsMois) . ' extra' . (count($optsMois) > 1 ? 's' : '') : 'Tout compris'; ?></strong><span><?php echo $offert ? 'Offert à vie' : aled08e_euro($price) . ' ' . esc_html($per); // phpcs:ignore ?></span></span></button>
            <?php if ($cmd) : ?>
            <button type="button" class="app-card c-mint" data-go="commande"><span class="app-card-ico"><?php echo aled08e_icon('globe'); // phpcs:ignore ?></span><span><small>Votre site</small><strong><?php echo esc_html($host ?: 'En préparation'); ?></strong><span class="<?php echo $siteOk ? 'dot-ok' : ''; ?>"><?php echo esc_html($siteEtat); ?></span></span></button>
            <?php else : ?>
            <div class="app-card c-mint"><span class="app-card-ico"><?php echo aled08e_icon('globe'); // phpcs:ignore ?></span><span><small>Votre site</small><strong><?php echo esc_html($host ?: 'En préparation'); ?></strong><span class="<?php echo $siteOk ? 'dot-ok' : ''; ?>"><?php echo esc_html($siteEtat); ?></span></span></div>
            <?php endif; ?>
            <button type="button" class="app-card c-pink" data-go="parrainage"><span class="app-card-ico"><?php echo aled08e_icon('gift'); // phpcs:ignore ?></span><span><small>Parrainage</small><strong><?php echo esc_html($code); ?></strong><span><?php echo (int) count($filleuls); ?> filleul<?php echo count($filleuls) > 1 ? 's' : ''; ?> en ligne</span></span></button>
          </div>
          <?php if ($cmd && $cmd['statut'] !== 'annulee' && $cmd['statut'] !== 'en_ligne' && (aled08e_brief_le($cmd['id']) === '' || get_post_meta($cmd['id'], '_aled08_brief_brouillon', true))) : ?>
          <p class="esp-warn bf-rappel"><?php echo aled08e_icon('clipboard-check'); // phpcs:ignore ?><span><b>À faire :</b> votre questionnaire de création attend vos réponses. C’est lui qui lance la création de votre site.</span> <button type="button" class="link-btn" data-go="commande">Le remplir</button></p>
          <?php endif; ?>
          <?php if ($cmd && $cmd['statut'] === 'attente_paiement') : ?>
          <p class="esp-warn">Votre commande <?php echo esc_html($cmd['ref']); ?> attend son paiement. <button type="button" class="link-btn" data-go="commande">Voir ma commande</button></p>
          <?php elseif ($cmd && aled08e_cmd_reception_due($cmd)) : ?>
          <p class="esp-warn">Votre site est en ligne : il reste <?php echo aled08e_euro($cmd['montants']['solde']); // phpcs:ignore ?> pour la création, en une fois ou en plusieurs fois, et votre abonnement démarre. <button type="button" class="link-btn" data-go="commande">Voir ma commande</button></p>
          <?php endif; ?>
          <p class="app-sub">Que voulez-vous faire ?</p>
          <div class="app-actions">
            <button type="button" data-go="demandes"><?php echo aled08e_icon('message-circle'); // phpcs:ignore ?><strong>Demander une modification</strong><small>Je m’en occupe</small></button>
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
          <p class="app-p">Écrivez ce que vous voulez changer, avec une photo si besoin. Je m’en occupe et vous suivez l’avancement ici. <?php echo esc_html('Dans votre abonnement : des petites retouches avec les petits monstres et ' . aled08e_alex_txt($uid, $f) . ', réponse sous ' . $delai . '.'); ?></p>
          <?php if ($left <= 0 && !$famille) : ?><p class="esp-warn">Votre intervention d’Alex <?php echo esc_html($periodeDu); ?> est utilisée. Besoin d’une de plus ? C’est <?php echo esc_html($boostTxt); ?>, faite par Alex, ajoutée à votre prochaine facture.</p><?php endif; ?>
          <?php $liaPrete = aled08e_lia_prete_pour($uid); $liaOk = $liaPrete && ($famille || $jetonsLeft >= (int) $jlModif['base']); ?>
          <?php if (!$liaPrete) : ?><p class="esp-empty">Les petits monstres ne sont pas encore reliés à votre site : pour l’instant, c’est Alex qui fait vos modifications. Votre énergie sert déjà aux outils de l’onglet Outils.</p>
          <?php elseif (!$liaOk) : ?><p class="esp-warn">Il vous reste <?php echo esc_html(aled08e_jl_txt($jetonsLeft)); ?> : pas assez pour une modification par les petits monstres (<?php echo (int) $jlModif['base']; ?> au moins). L’énergie revient le 1<sup>er</sup> du mois. Pour en avoir tout de suite : « Redonner de l’énergie », dans l’onglet Outils.</p><?php endif; ?>
          <form class="req-form" method="post" enctype="multipart/form-data" action="<?php echo esc_url(aled08e_url()); ?>" data-req-real>
            <input type="hidden" name="aled08e_demande" value="1">
            <?php wp_nonce_field('aled08e_demande', '_aled08e'); ?>
            <fieldset class="req-par"><legend class="app-sub">Qui s’en occupe ?</legend><p class="app-note"><?php if ($famille) : ?>Pour vous, c’est sans limite, avec Bricou comme avec Alex <span class="jauge-coeur" aria-hidden="true">♥</span>. Bricou fait les petites et moyennes modifications, Alex les plus grandes.<?php else : ?>Il vous reste <?php echo esc_html(aled08e_jl_txt($jetonsLeft)); ?> et <?php echo (int) $left; ?> intervention<?php echo $left > 1 ? 's' : ''; ?> d’Alex <?php echo esc_html($periodeCe); ?>. Bricou fait les petites et moyennes modifications, Alex les plus grandes.<?php endif; ?></p>
              <label class="req-par-opt"><input type="radio" name="par" value="lia"<?php echo $liaOk ? ' checked' : ' disabled'; ?>><span><?php echo aled08e_monster('bricou'); // phpcs:ignore ?><strong>Bricou, dans l’heure</strong><small>Le petit monstre des modifications. Il montre d’abord votre demande à Alex, puis il s’y met (30 minutes au plus). Pour une petite ou moyenne modification : jusqu’à <?php echo (int) $liaLim['mots'][0]; ?> mots de texte, ou jusqu’à <?php echo (int) $liaLim['images']; ?> photos avec un texte plus court. Il vous montre toujours l’aperçu de la page : rien ne change sans votre accord. Énergie : <?php echo (int) $jlModif['base']; ?> points, plus 1 par tranche de <?php echo (int) $jlModif['mots']; ?> mots et <?php echo (int) $jlModif['image']; ?> par photo.</small></span></label>
              <label class="req-par-opt"><input type="radio" name="par" value="alex"<?php echo $liaOk ? '' : ' checked'; ?>><span><?php echo aled08e_monster('alex'); // phpcs:ignore ?><strong>Alex, à la main</strong><small>Pour une grande modification. Sous <?php echo esc_html($delai); ?>, fait et vérifié par Alex lui-même.</small></span></label>
            </fieldset>
            <?php if ($left <= 0 && !$famille) : ?><label class="check"><input type="checkbox" name="boost_ok" value="1"><span>Si je choisis Alex : j’accepte une intervention en plus, <?php echo esc_html($boostTxt); ?>, ajoutée à ma prochaine facture</span></label><?php endif; ?>
            <?php $xUrg = aled08e_a_la_demande('urgent'); if ($xUrg && !$famille) : ?><label class="check"><input type="checkbox" name="urgent" value="1"><span>Si je choisis Alex : je la veux sous <?php echo esc_html($D['delais']['urgent'] ?? '24 heures'); ?>, du lundi au vendredi (<?php echo esc_html(aled08e_euro_txt($xUrg['prix'])); ?> ajoutés à ma prochaine facture)</span></label><?php endif; ?>
            <div class="field"><label for="req-txt">Votre demande</label><textarea id="req-txt" name="demande" rows="4" maxlength="4000" required placeholder="Ex. : nous serons fermés le lundi 24 novembre"></textarea></div>
            <label class="req-photo"><input type="file" name="photos[]" accept="image/*" multiple class="sr-only" data-req-file><?php echo aled08e_icon('image-plus'); // phpcs:ignore ?><span data-req-file-name>Ajouter jusqu’à 3 photos (facultatif)</span></label>
            <?php if (!$famille) : ?><p class="jl-estime" data-jl-estime data-base="<?php echo (int) $jlModif['base']; ?>" data-mots="<?php echo (int) $jlModif['mots']; ?>" data-image="<?php echo (int) $jlModif['image']; ?>" data-solde="<?php echo (int) $jetonsLeft; ?>" aria-live="polite"><?php echo aled08e_icon('coins'); // phpcs:ignore ?><span>Avec les petits monstres, cette demande utilise <b data-jl-prix><?php echo (int) $jlModif['base']; ?></b> points d’énergie. Avec Alex : aucun point d’énergie.</span></p><?php endif; ?>
            <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('send'); // phpcs:ignore ?><span>Envoyer ma demande</span></button>
          </form>
          <?php echo aled08e_a_la_demande_html($uid, $famille); // phpcs:ignore ?>
          <p class="app-sub">Suivi</p>
          <?php if ($reqs) : ?>
          <ul class="reqs"><?php foreach ($reqs as $p) echo $reqItem($p); // phpcs:ignore ?></ul>
          <?php else : ?>
          <p class="esp-empty">Vos demandes apparaîtront ici, avec leur avancement : reçue, en cours, faite.</p>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-tableau" aria-labelledby="tab-tableau" hidden>
          <h2 class="app-h">Tableau de bord</h2>
          <?php echo aled08e_stats_html($uid); // phpcs:ignore ?>
          <p class="app-sub">Votre rapport du mois<?php echo $mois ? ' : ' . esc_html($mois) : ''; ?></p>
          <?php if ($stats || $ranks) : ?>
            <?php if ($stats) : ?><div class="kpis"><?php echo implode('', $stats); // phpcs:ignore ?></div><?php endif; ?>
            <?php if ($ranks) : ?><p class="app-sub">Vos meilleures recherches sur Google</p><ul class="ranks"><?php echo implode('', $ranks); // phpcs:ignore ?></ul><?php endif; ?>
          <?php else : ?>
            <p class="esp-empty">Vos premiers chiffres arrivent dans le mois qui suit la mise en ligne : visites, apparitions sur Google, appels.</p>
          <?php endif; ?>
          <?php if ($rapport) : ?><a class="btn btn-light" href="<?php echo esc_url($rapport); ?>" target="_blank" rel="noopener"><?php echo aled08e_icon('download'); // phpcs:ignore ?><span>Rapport du mois</span></a><?php endif; ?>
          <?php if (!$famille && !aled08e_extra_actif($uid, 'seo')) : ?><p class="app-note">Pour aller plus loin : les extras « SEO suivi » et « Chiffres détaillés » s’ajoutent quand vous voulez, dans Mon compte.</p><?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-outils" aria-labelledby="tab-outils" hidden>
          <?php echo aled08e_jl_onglet_html($uid, $f, $site, $host, $avis); // phpcs:ignore ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-parrainage" aria-labelledby="tab-parrainage" hidden>
          <h2 class="app-h">Parrainage</h2>
          <p class="app-p">Un proche fait créer son site avec votre lien ou votre code : quand il est en ligne, vous recevez chacun <?php echo esc_html(aled08e_mois_txt($D['parrainageMois'])); ?> d’abonnement offert.</p>
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
          <?php if ($moisDispo > 0) : ?><p class="esp-empty">Mois offerts à utiliser sur votre abonnement : <?php echo (int) $moisDispo; ?>.</p><?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-compte" aria-labelledby="tab-compte" hidden>
          <?php echo aled08e_panel_compte($u); // phpcs:ignore ?>
          <section class="compte-forfait" id="forfait-bloc">
          <h2 class="app-h">Abonnement et factures</h2>
          <?php echo $flashForfait; // phpcs:ignore ?>
          <div class="app-card c-<?php echo esc_attr($f['color']); ?>"><span class="app-card-art"><?php echo aled08e_monster('ravie'); // phpcs:ignore ?></span><span><small>Votre abonnement</small><strong>Nom de domaine, hébergement, suivi</strong><span><?php echo ($offert ? 'Offert à vie' : aled08e_euro($price) . ' ' . esc_html($per)) . ' · ' . esc_html($f['modifs']); // phpcs:ignore ?></span></span></div>
          <?php if ($offert) : ?><p class="app-note">Votre abonnement est offert, à vie. Merci de votre confiance !</p><?php endif; ?>
          <?php if ($optsMois) : ?>
          <p class="app-sub">Vos extras</p>
          <?php foreach ($optsMois as $o) : ?>
          <p class="app-domain"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span><strong><?php echo esc_html($o['name']); ?></strong><small><?php echo aled08e_euro($annuel ? $o['month'] * (12 - (int) $D['moisOfferts']) : $o['month']) . ' ' . esc_html($per); // phpcs:ignore ?></small></span></p>
          <?php endforeach; ?>
          <?php endif; ?>
          <p class="app-total"><span>Total <?php echo $annuel ? 'chaque année' : 'chaque mois'; ?></span><b><?php echo aled08e_euro($total); // phpcs:ignore ?></b></p>
          <?php if ($annuel) : ?><p class="app-note">Vous payez à l’année : <?php echo (int) $D['moisOfferts']; ?> mois offerts.</p><?php endif; ?>
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

          </div>
          <?php echo aled08e_changer_html($uid); // phpcs:ignore ?>
          <p class="app-sub">Factures</p>
          <?php if ($factures) : ?><ul class="invoices"><?php echo implode('', $factures); // phpcs:ignore ?></ul><?php else : ?><p class="esp-empty">Vos factures apparaîtront ici après chaque paiement.</p><?php endif; ?>
          <?php if (aled08e_meta($uid, 'domaine_info') || $host) : ?>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain"><?php echo aled08e_icon('globe'); // phpcs:ignore ?><span><strong><?php echo esc_html($host ?: aled08e_meta($uid, 'domaine_info')); ?></strong><small><?php echo esc_html(aled08e_meta($uid, 'domaine_info') ?: ($cmd && $cmd['domaine_mien'] ? 'Votre nom de domaine actuel' : 'À votre nom, renouvelé avec l’abonnement')); ?></small></span></p>
          <?php endif; ?>
          </section>
        </div>

        <?php if (aled08e_est_boutique($uid)) : ?>
        <div class="app-panel" role="tabpanel" id="t-vacances" aria-labelledby="tab-vacances" hidden>
          <?php echo aled08e_boutique_html($uid); // phpcs:ignore ?>
        </div>
        <?php endif; ?>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}

/* Les extras payés d'une demande : ['urgent', 'article', 'point'] */
function aled08e_extras_demande($pid) { $x = get_post_meta($pid, '_aled08_extras', true); return is_array($x) ? $x : []; }
function aled08e_extras_demande_txt($pid) {
    $out = [];
    foreach (aled08e_extras_demande($pid) as $id) {
        $x = aled08e_a_la_demande($id);
        if ($x) $out[] = $x['name'] . ' (' . aled08e_euro_txt($x['prix']) . ', ' . (get_post_meta($pid, '_aled08_extra_facture_' . $id, true) ? 'ajouté à sa prochaine facture Stripe' : 'à facturer à la main') . ')';
    }
    return implode(', ', $out);
}
/* Un extra à la demande, ajouté à la prochaine facture Stripe du client (sinon : à facturer à la main) */
function aled08e_extra_facturer($pid, $uid, $id) {
    $x = aled08e_a_la_demande($id);
    $cus = aled08e_meta($uid, 'stripe_customer');
    if (!$x || (float) $x['prix'] <= 0 || !function_exists('aled08e_stripe_ready') || !aled08e_stripe_ready() || $cus === '') return false;
    $r = aled08e_stripe_request('POST', '/v1/invoiceitems', ['customer' => $cus, 'amount' => (int) round((float) $x['prix'] * 100), 'currency' => 'eur', 'description' => $x['name'] . ' (demande n° ' . (int) $pid . ')'], 'extra_' . $id . '_' . (int) $pid, true);
    if (is_wp_error($r) || empty($r['id'])) return false;
    update_post_meta($pid, '_aled08_extra_facture_' . $id, (string) $r['id']);
    return true;
}
/* Le bloc « À la demande » de l'onglet Mes demandes : commander un article ou un point avec Alex, payés une fois */
function aled08e_a_la_demande_html($uid, $famille) {
    $D = aled08e_data();
    $aide = [
        'article' => ['Le sujet de l’article, et ce que vous voulez y dire', 'Ex. : nos conseils pour entretenir un parquet'],
        'point' => ['Vos disponibilités et le sujet du point', 'Ex. : mardi ou jeudi après 18 heures, pour parler de Google'],
    ];
    $cartes = '';
    foreach (['article', 'point'] as $id) {
        $x = aled08e_a_la_demande($id);
        if (!$x) continue;
        $prix = $famille ? 'offert' : aled08e_euro_txt($x['prix']);
        $cartes .= '<form class="req-form extra-form" method="post" action="' . esc_url(aled08e_url()) . '">'
            . '<input type="hidden" name="aled08e_demande" value="1"><input type="hidden" name="extra" value="' . esc_attr($id) . '">' . wp_nonce_field('aled08e_demande', '_aled08e', true, false)
            . '<p class="extra-tete"><span class="extra-ico">' . aled08e_icon($x['icon'] ?? 'plus') . '</span><strong>' . esc_html($x['name']) . '</strong><b>' . esc_html($prix) . '</b></p>'
            . '<p class="app-note">' . esc_html($x['desc'] ?? '') . '</p>'
            . '<div class="field"><label for="extra-' . esc_attr($id) . '">' . esc_html($aide[$id][0]) . '</label><textarea id="extra-' . esc_attr($id) . '" name="demande" rows="2" maxlength="2000" required placeholder="' . esc_attr($aide[$id][1]) . '"></textarea></div>'
            . '<label class="check"><input type="checkbox" name="extra_ok" value="1" required><span>' . ($famille ? 'Je commande, c’est offert pour moi' : 'J’accepte ' . esc_html(aled08e_euro_txt($x['prix'])) . ', ajoutés à ma prochaine facture') . '</span></label>'
            . '<button class="btn btn-light" type="submit">' . aled08e_icon('send') . '<span>Commander</span></button></form>';
    }
    if ($cartes === '') return '';
    return '<p class="app-sub">À la demande, payé une fois</p><p class="app-p">Un coup de main en plus ? Ces extras se commandent ici quand vous en avez besoin. Rien à payer si vous ne vous en servez pas.</p><div class="extra-cards">' . $cartes . '</div>';
}
/* Boost : une intervention d'Alex en plus, payante, ajoutée à la prochaine facture Stripe du client (sinon : à facturer à la main) */
function aled08e_boost_facturer($pid, $uid) {
    $prix = (float) (aled08e_data()['boost'] ?? 5);
    $cus = aled08e_meta($uid, 'stripe_customer');
    if (!function_exists('aled08e_stripe_ready') || !aled08e_stripe_ready() || $cus === '') return false;
    $r = aled08e_stripe_request('POST', '/v1/invoiceitems', ['customer' => $cus, 'amount' => (int) round($prix * 100), 'currency' => 'eur', 'description' => 'Une intervention d’Alex en plus (demande n° ' . (int) $pid . ')'], 'boost_' . (int) $pid, true);
    if (is_wp_error($r) || empty($r['id'])) return false;
    update_post_meta($pid, '_aled08_boost_facture', (string) $r['id']);
    return true;
}

/* Passage à l'offre unique (novembre 2026) : les anciens forfaits deviennent l'abonnement, avec les extras
 * qui correspondent à ce que le client avait (Power : SEO suivi ; Titan : SEO suivi et chiffres détaillés).
 * Fait une seule fois. L'abonnement Stripe d'un ancien client ne bouge pas tant qu'il ne change pas ses extras. */
add_action('init', function () {
    if (get_option('aled08e_offre') === '2') return;
    $anciens = ['chico' => [], 'power' => ['seo'], 'titan' => ['seo', 'stats']];
    foreach (get_users(['meta_key' => 'aled08_forfait', 'meta_value' => array_keys($anciens), 'meta_compare' => 'IN', 'fields' => 'ID']) as $uid) {
        $avant = (string) get_user_meta($uid, 'aled08_forfait', true);
        foreach ($anciens[$avant] ?? [] as $extra) update_user_meta($uid, 'aled08_' . $extra, '1');
        update_user_meta($uid, 'aled08_forfait_avant', $avant);
        update_user_meta($uid, 'aled08_forfait', 'base');
    }
    update_option('aled08e_offre', '2', false);
}, 5);

/* Offre V2 (16 novembre 2026) : une intervention d'Alex par trimestre pour les nouveaux clients. Les clients déjà inscrits
 * gardent une intervention par mois (case « Une intervention d'Alex chaque mois » de leur fiche). Fait une seule fois. */
add_action('init', function () {
    if (get_option('aled08e_offre_v2') === '1') return;
    $ids = array_unique(array_merge(
        (array) get_users(['meta_key' => 'aled08_forfait', 'fields' => 'ID']),
        (array) get_users(['role__in' => ['aled08_client'], 'fields' => 'ID'])
    ));
    foreach ($ids as $uid) if ((string) get_user_meta($uid, 'aled08_alex_mensuel', true) === '') update_user_meta($uid, 'aled08_alex_mensuel', '1');
    update_option('aled08e_offre_v2', '1', false);
}, 6);
/* Annonce des extras à la demande (une seule fois), pour les clients déjà inscrits */
add_action('init', function () {
    if (get_option('aled08e_annonce_v2') === '1' || !post_type_exists(ALED08E_CPT_ANNONCE)) return;
    $t = [];
    foreach (['article', 'point', 'urgent'] as $id) { $x = aled08e_a_la_demande($id); if ($x) $t[] = mb_strtolower(mb_substr($x['name'], 0, 1)) . mb_substr($x['name'], 1) . ' (' . aled08e_euro_txt($x['prix']) . ')'; }
    if ($t) wp_insert_post([
        'post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private',
        'post_title' => 'Nouveau : des extras à la demande, payés une fois',
        'post_content' => "Vous gardez votre intervention d’Alex chaque mois, rien ne change pour vous.\n"
            . 'Nouveau, dans « Mes demandes » : ' . implode(', ', $t) . ". Ils s’ajoutent à votre prochaine facture, seulement si vous les commandez.",
    ]);
    update_option('aled08e_annonce_v2', '1', false);
}, 21);

/* Annonce de l'offre unique (une seule fois) : les anciennes annonces qui parlent des forfaits Chico, Power et Titan
 * sont retirées de l'espace des clients (passées en brouillon, pas supprimées), et une annonce à jour les remplace. */
add_action('init', function () {
    if (get_option('aled08e_annonce_offre') === '1' || !post_type_exists(ALED08E_CPT_ANNONCE)) return;
    foreach (get_posts(['post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'numberposts' => 50, 'suppress_filters' => true]) as $p) {
        if (preg_match('/\b(Chico|Power|Titan)\b/u', $p->post_title . ' ' . $p->post_content)) wp_update_post(['ID' => $p->ID, 'post_status' => 'draft']);
    }
    wp_insert_post([
        'post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private',
        'post_title' => 'Nouveau : un seul abonnement, et des extras à la carte',
        'post_content' => "Votre forfait devient l’abonnement Alex & Co : vous gardez tout ce que vous aviez, au même prix.\n"
            . "Les extras (SEO suivi, chiffres détaillés, Lia +, e-mail pro…) s’ajoutent ou se retirent quand vous voulez, dans Mon compte. Le petit « i » montre ce que chacun ajoute.\n"
            . "Et Lia s’installe dans la bulle en bas de votre espace : bientôt, vous pourrez lui écrire directement.",
    ]);
    update_option('aled08e_annonce_offre', '1', false);
}, 20);
