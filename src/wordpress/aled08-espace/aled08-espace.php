<?php
/**
 * Plugin Name: ALED08 Espace client
 * Description: L'espace client ALED08 sur la page /mon-espace/ : comptes clients, demandes de modification et leur suivi, tableau de bord, QR code, lien d'avis, parrainage, forfait et factures.
 * Version: 1.0.1
 * Requires PHP: 7.4
 * Author: ALED08
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('ALED08E_VERSION', '1.0.1');
define('ALED08E_ROLE', 'aled08_client');
define('ALED08E_CPT', 'aled08_demande');

/* =========================================================================
 *  Données (forfaits, icônes, monstres) : data.json, généré depuis le site
 * ========================================================================= */
function aled08e_data() {
    static $d = null;
    if ($d === null) {
        $raw = @file_get_contents(__DIR__ . '/data.json');
        $d = $raw ? (json_decode($raw, true) ?: []) : [];
        $d += ['forfaits' => [], 'icons' => [], 'monsters' => [], 'moisOfferts' => 2, 'parrainageMois' => 1, 'mail' => ['name' => 'Adresse e-mail pro', 'month' => 3], 'whatsapp' => ''];
    }
    return $d;
}
function aled08e_icon($n) { $d = aled08e_data(); return $d['icons'][$n] ?? ''; }
function aled08e_monster($n) { $d = aled08e_data(); return $d['monsters'][$n] ?? ''; }
function aled08e_forfait($id) {
    foreach (aled08e_data()['forfaits'] as $f) if ($f['id'] === $id) return $f;
    $all = aled08e_data()['forfaits'];
    return $all ? $all[0] : ['id' => 'chico', 'name' => 'Chico', 'month' => 5, 'quota' => 1, 'modifs' => 'Une modification par mois', 'color' => 'pink'];
}
function aled08e_euro($n) {
    $n = (float) $n;
    return number_format($n, floor($n) == $n ? 0 : 2, ',', ' ') . '&nbsp;€';
}
function aled08e_to() {
    if (get_option('aled08_form_to')) return get_option('aled08_form_to');
    return defined('ALED08_FORM_TO') ? ALED08_FORM_TO : get_option('admin_email');
}
function aled08e_url($q = []) { return add_query_arg($q, home_url('/mon-espace/')); }
function aled08e_meta($uid, $k) { return (string) get_user_meta($uid, 'aled08_' . $k, true); }

/* Statuts d'une demande */
function aled08e_statuts() {
    return ['recue' => ['Reçue', 'st-new'], 'encours' => ['En cours', 'st-doing'], 'faite' => ['Faite', 'st-done']];
}

/* =========================================================================
 *  Rôle « Client ALED08 » et type de contenu « Demande »
 * ========================================================================= */
function aled08e_add_role() {
    if (!get_role(ALED08E_ROLE)) add_role(ALED08E_ROLE, 'Client ALED08', ['read' => true]);
}
register_activation_hook(__FILE__, 'aled08e_add_role');

add_action('init', function () {
    aled08e_add_role();
    register_post_type(ALED08E_CPT, [
        'labels' => [
            'name' => 'Demandes clients', 'singular_name' => 'Demande', 'menu_name' => 'Demandes clients',
            'all_items' => 'Toutes les demandes', 'edit_item' => 'Demande du client', 'view_item' => 'Voir la demande',
            'search_items' => 'Chercher une demande', 'not_found' => 'Aucune demande pour le moment.', 'not_found_in_trash' => 'Aucune demande dans la corbeille.',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => false,
        'menu_position' => 3,
        'menu_icon' => 'dashicons-format-chat',
        'supports' => ['title', 'editor', 'author', 'thumbnail'],
        'capability_type' => 'post',
        'capabilities' => ['create_posts' => 'do_not_allow'],
        'map_meta_cap' => true,
    ]);
});

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
    $login = sanitize_user(wp_unslash($_POST['log'] ?? ''));
    if (is_email(wp_unslash($_POST['log'] ?? ''))) $login = sanitize_email(wp_unslash($_POST['log']));
    $pass = (string) wp_unslash($_POST['pwd'] ?? '');
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

/* E-mail d'arrivée d'un nouveau client : le lien pour choisir son mot de passe, en français simple */
add_filter('wp_new_user_notification_email', function ($email, $user) {
    if (!aled08e_is_client($user)) return $email;
    $link = '';
    if (preg_match('#(https?://\S*action=rp\S*)#', $email['message'], $m)) $link = rtrim($m[1], '>');
    if (!$link) return $email;
    $email['subject'] = 'Votre espace client ALED08';
    $email['message'] = "Bonjour " . ($user->first_name ?: $user->display_name) . ",\n\n"
        . "Votre espace client ALED08 est prêt. Vous y envoyez vos demandes de modification, vous suivez leur avancement, et vous retrouvez votre QR code, votre lien d'avis, votre parrainage et vos factures.\n\n"
        . "Pour choisir votre mot de passe, ouvrez ce lien :\n" . $link . "\n\n"
        . "Ensuite, connectez-vous ici :\n" . aled08e_url() . "\n"
        . "Votre identifiant : " . $user->user_login . " (ou votre adresse e-mail)\n\n"
        . "À bientôt,\nALED08\n";
    $email['headers'] = 'Content-Type: text/plain; charset=UTF-8';
    return $email;
}, 10, 2);

/* Pas de cache pour l'espace client */
add_action('template_redirect', function () {
    if (!is_page('mon-espace')) return;
    nocache_headers();
    do_action('litespeed_control_set_nocache', 'espace client ALED08');
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
function aled08e_count_month($uid) {
    $q = new WP_Query([
        'post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => ['private', 'publish'], 'fields' => 'ids',
        'posts_per_page' => 50, 'no_found_rows' => true,
        'date_query' => [['year' => (int) wp_date('Y'), 'month' => (int) wp_date('n')]],
    ]);
    return count($q->posts);
}

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
    $over = aled08e_count_month($uid) >= (int) $f['quota'];
    $title = mb_strlen($txt) > 70 ? rtrim(mb_substr($txt, 0, 67)) . '…' : $txt;
    $title = trim(preg_replace('/\s+/', ' ', $title));
    $pid = wp_insert_post(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'post_author' => $uid, 'post_title' => $title, 'post_content' => $txt, 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
    if (is_wp_error($pid)) $back('erreur');
    update_post_meta($pid, '_aled08_statut', 'recue');
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
    $corps = "Nouvelle demande de modification\n\n"
        . 'Client   : ' . $u->display_name . ' (' . $u->user_email . ")\n"
        . 'Site     : ' . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\n"
        . 'Forfait  : ' . $f['name'] . ($over ? ' (modifications du mois déjà utilisées)' : '') . "\n"
        . ($photo ? "Photo    : $photo\n" : '')
        . "\nDemande :\n$txt\n\n"
        . 'Suivre et répondre : ' . admin_url('post.php?post=' . $pid . '&action=edit') . "\n";
    wp_mail(aled08e_to(), 'Demande de modification : ' . $u->display_name, $corps, ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $u->display_name . ' <' . $u->user_email . '>']);

    $back($photoFail ? 'photo' : ($over ? 'hors' : 'ok'));
}, 5);

/* =========================================================================
 *  Administration : statut, réponse, colonnes, compteur
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
    echo '<p>Forfait : ' . esc_html($f['name']) . ' · ' . (int) aled08e_count_month($u->ID) . ' / ' . (int) $f['quota'] . ' ce mois-ci</p>';
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
            $corps = 'Bonjour ' . ($u->first_name ?: $u->display_name) . ",\n\n"
                . "Votre demande est faite et en ligne :\n« " . $post->post_title . " »\n\n"
                . ($rep ? $rep . "\n\n" : '')
                . "Vous retrouvez le suivi de vos demandes dans votre espace client :\n" . aled08e_url() . "#demandes\n\n"
                . "À bientôt,\nALED08\n";
            wp_mail($u->user_email, 'Votre modification est en ligne', $corps, ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ALED08 <' . aled08e_to() . '>']);
        }
    }
}, 10, 2);
/* Statut privé conservé quand on enregistre depuis l'administration */
add_filter('wp_insert_post_data', function ($data) {
    if ($data['post_type'] === ALED08E_CPT && in_array($data['post_status'], ['publish', 'future', 'pending', 'draft'], true)) $data['post_status'] = 'private';
    return $data;
});

add_filter('manage_' . ALED08E_CPT . '_posts_columns', function ($c) {
    return ['cb' => $c['cb'] ?? '', 'title' => 'Demande', 'aled08_client' => 'Client', 'aled08_statut' => 'Statut', 'date' => 'Date'];
});
add_action('manage_' . ALED08E_CPT . '_posts_custom_column', function ($col, $pid) {
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
add_action('admin_menu', function () {
    global $menu;
    $q = new WP_Query(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'posts_per_page' => 50, 'fields' => 'ids', 'no_found_rows' => true, 'meta_key' => '_aled08_statut', 'meta_value' => 'recue']);
    $n = count($q->posts);
    if (!$n || !is_array($menu)) return;
    foreach ($menu as $i => $item) {
        if (($item[2] ?? '') === 'edit.php?post_type=' . ALED08E_CPT) {
            $menu[$i][0] .= ' <span class="awaiting-mod count-' . $n . '"><span class="pending-count">' . $n . '</span></span>';
        }
    }
}, 99);

/* =========================================================================
 *  Fiche client (profil utilisateur, réservé à l'administrateur)
 * ========================================================================= */
function aled08e_fields() {
    return [
        'forfait' => ['Forfait', 'select', ['chico' => 'Chico', 'power' => 'Power']],
        'paiement' => ['Paiement du forfait', 'select', ['mois' => 'Au mois', 'annee' => 'À l’année']],
        'site' => ['Adresse du site', 'url', 'https://www.exemple.fr'],
        'mail' => ['Option e-mail pro', 'check', ''],
        'domaine_info' => ['Nom de domaine (info affichée)', 'text', 'exemple.fr, renouvelé le 3 mars 2027'],
        'avis' => ['Lien d’avis Google', 'url', 'https://g.page/r/.../review'],
        'parrain' => ['Parrainé par (code)', 'text', 'Ex. : LILA-7K2'],
        'code' => ['Son code de parrainage', 'text', 'Créé automatiquement'],
        'mois_offerts' => ['Mois offerts à utiliser', 'text', '0'],
        'stats_mois' => ['Tableau de bord : mois', 'text', 'Novembre 2026'],
        'stats_visites' => ['Visites', 'text', '1240'],
        'stats_google' => ['Apparitions sur Google', 'text', '3420'],
        'stats_appels' => ['Appels ou contacts', 'text', '23'],
        'stats_ventes' => ['Ventes (boutique)', 'text', ''],
        'stats_recherches' => ['Meilleures recherches (une par ligne : recherche | position)', 'textarea', "pâtisserie rethel | 4\ntarte aux fraises rethel | 2"],
        'stats_rapport' => ['Lien du rapport mensuel (PDF)', 'url', ''],
        'factures' => ['Factures (une par ligne : date ; libellé ; montant ; lien)', 'textarea', "Novembre 2026 ; Forfait Power ; 20 € ; https://..."],
    ];
}
function aled08e_profile_fields($user) {
    if (!current_user_can('edit_users')) return;
    $uid = is_object($user) ? $user->ID : 0;
    echo '<h2 id="aled08e">Espace client ALED08</h2><p>Ces informations s’affichent dans l’espace client (page <a href="' . esc_url(aled08e_url()) . '" target="_blank">Mon espace</a>).</p><table class="form-table" role="presentation">';
    foreach (aled08e_fields() as $k => [$label, $type, $extra]) {
        $v = $uid ? aled08e_meta($uid, $k) : '';
        $id = 'aled08e-' . $k;
        echo '<tr><th><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label></th><td>';
        if ($type === 'select') {
            echo '<select id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']">';
            foreach ($extra as $ok => $ol) echo '<option value="' . esc_attr($ok) . '"' . selected($v, $ok, false) . '>' . esc_html($ol) . '</option>';
            echo '</select>';
        } elseif ($type === 'check') {
            echo '<label><input type="checkbox" id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" value="1"' . checked($v, '1', false) . '> Active</label>';
        } elseif ($type === 'textarea') {
            echo '<textarea id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" rows="4" class="large-text" placeholder="' . esc_attr($extra) . '">' . esc_textarea($v) . '</textarea>';
        } else {
            echo '<input type="' . ($type === 'url' ? 'url' : 'text') . '" id="' . esc_attr($id) . '" name="aled08e[' . esc_attr($k) . ']" value="' . esc_attr($v) . '" class="regular-text" placeholder="' . esc_attr($extra) . '">';
        }
        if ($k === 'code' && $uid) {
            $n = count(aled08e_filleuls($uid));
            echo '<p class="description">Filleuls en ligne : ' . (int) $n . '. Lien : ' . esc_html(home_url('/creer-mon-site/?parrain=' . ($v ?: '…'))) . '</p>';
        }
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
            $corps = 'Bonjour ' . ($p->first_name ?: $p->display_name) . ",\n\n"
                . 'Bonne nouvelle : ' . ($u->first_name ?: $u->display_name) . " a créé son site grâce à vous. Vous recevez $m mois de forfait offert, merci !\n\n"
                . "Vos parrainages sont dans votre espace client :\n" . aled08e_url() . "#parrainage\n\nÀ bientôt,\nALED08\n";
            wp_mail($p->user_email, 'Votre parrainage : un mois offert', $corps, ['Content-Type: text/plain; charset=UTF-8']);
        }
    }
}
add_action('personal_options_update', 'aled08e_profile_save');
add_action('edit_user_profile_update', 'aled08e_profile_save');
add_action('user_register', 'aled08e_profile_save');

/* Colonne « Forfait » dans la liste des utilisateurs */
add_filter('manage_users_columns', function ($c) { $c['aled08_forfait'] = 'Forfait ALED08'; return $c; });
add_filter('manage_users_custom_column', function ($out, $col, $uid) {
    if ($col !== 'aled08_forfait') return $out;
    $u = get_userdata($uid);
    if (!$u || !aled08e_is_client($u)) return '';
    return esc_html(aled08e_forfait(aled08e_meta($uid, 'forfait'))['name']);
}, 10, 3);

/* =========================================================================
 *  La page « Mon espace » : [aled08_espace]…formulaire de connexion…[/aled08_espace]
 * ========================================================================= */
add_action('wp_enqueue_scripts', function () {
    if (!is_page('mon-espace') || !is_user_logged_in()) return;
    wp_enqueue_script('aled08-qrcode', plugins_url('qrcode.js', __FILE__), [], ALED08E_VERSION, ['in_footer' => true, 'strategy' => 'defer']);
});

add_shortcode('aled08_espace', function ($atts, $content = '') {
    if (!is_user_logged_in()) {
        $c = str_replace(
            ['action="/wp-login.php"', 'href="/wp-login.php?action=lostpassword"'],
            ['action="' . esc_url(aled08e_url()) . '"', 'href="' . esc_url(wp_lostpassword_url(aled08e_url(['mdp' => 'envoye']))) . '"'],
            (string) $content
        );
        if (isset($_GET['mdp'])) $c = str_replace('<form class="form" method="post"', '<p class="esp-warn">Si cette adresse correspond à un compte, un e-mail vient de partir pour choisir un nouveau mot de passe.</p><form class="form" method="post"', $c);
        return $c;
    }
    return aled08e_dashboard();
});

function aled08e_tab($id, $ic, $label, $on = false) {
    return '<button type="button" role="tab" id="tab-' . $id . '" aria-controls="t-' . $id . '" aria-selected="' . ($on ? 'true' : 'false') . '"' . ($on ? '' : ' tabindex="-1"') . ' data-tab="' . $id . '">' . aled08e_icon($ic) . '<span>' . esc_html($label) . '</span></button>';
}
function aled08e_date($mysql) { return wp_date('j F Y', strtotime(get_gmt_from_date($mysql) . ' UTC')); }

function aled08e_dashboard() {
    $u = wp_get_current_user();
    $uid = $u->ID;
    $D = aled08e_data();
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mail = aled08e_meta($uid, 'mail') === '1';
    $site = aled08e_meta($uid, 'site');
    $host = $site ? preg_replace('#^www\.#', '', (string) wp_parse_url($site, PHP_URL_HOST)) : '';
    $prenom = $u->first_name ?: $u->display_name;
    $used = aled08e_count_month($uid);
    $quota = (int) $f['quota'];
    $left = max(0, $quota - $used);
    $code = aled08e_code($uid);
    $plink = home_url('/creer-mon-site/?parrain=' . rawurlencode($code));
    $filleuls = aled08e_filleuls($uid);
    $demandesFilleuls = get_user_meta($uid, 'aled08_filleuls_demandes', true);
    $demandesFilleuls = is_array($demandesFilleuls) ? $demandesFilleuls : [];
    $moisGagnes = count($filleuls) * (int) $D['parrainageMois'];
    $moisDispo = (int) aled08e_meta($uid, 'mois_offerts');

    $reqs = get_posts(['post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => ['private', 'publish'], 'numberposts' => 30, 'orderby' => 'date', 'order' => 'DESC']);
    $st = aled08e_statuts();
    $reqItem = function ($p, $full = true) use ($st) {
        $s = get_post_meta($p->ID, '_aled08_statut', true) ?: 'recue';
        $rep = get_post_meta($p->ID, '_aled08_reponse', true);
        $thumb = $full && has_post_thumbnail($p) ? get_the_post_thumbnail($p, 'thumbnail', ['class' => 'req-thumb', 'alt' => '']) : '';
        $text = $full ? $p->post_content : $p->post_title;
        return '<li>' . $thumb . '<span><strong>' . nl2br(esc_html(mb_strlen($text) > 220 ? mb_substr($text, 0, 217) . '…' : $text)) . '</strong><small>envoyée le ' . esc_html(aled08e_date($p->post_date)) . '</small>'
            . ($full && $rep ? '<span class="req-reply">' . nl2br(esc_html($rep)) . '</span>' : '') . '</span><em class="st ' . esc_attr($st[$s][1]) . '">' . esc_html($st[$s][0]) . '</em></li>';
    };

    $flash = '';
    $m = isset($_GET['m']) ? sanitize_key(wp_unslash($_GET['m'])) : '';
    $msgs = [
        'ok' => ['esp-empty', 'Demande envoyée, merci ! Je m’en occupe et je vous préviens quand c’est en ligne.'],
        'hors' => ['esp-warn', 'Demande envoyée. Vos modifications du mois étaient déjà utilisées : je vous dis avant de la faire si elle attend le mois prochain ou si elle est facturée.'],
        'photo' => ['esp-warn', 'Demande envoyée, mais la photo n’a pas pu être ajoutée (8 Mo au plus, format JPG, PNG ou WEBP). Vous pouvez me l’envoyer sur WhatsApp.'],
        'vide' => ['esp-warn', 'Écrivez votre demande en quelques mots avant de l’envoyer.'],
        'trop' => ['esp-warn', 'Vous avez envoyé beaucoup de demandes aujourd’hui. Écrivez-moi sur WhatsApp si c’est pressé.'],
        'erreur' => ['esp-warn', 'L’envoi n’a pas abouti. Réessayez, ou écrivez-moi sur WhatsApp.'],
    ];
    if (isset($msgs[$m])) $flash = '<p class="' . $msgs[$m][0] . '" role="status">' . esc_html($msgs[$m][1]) . '</p>';

    $price = $annuel ? ($f['month'] * (12 - (int) $D['moisOfferts'])) : $f['month'];
    $per = $annuel ? 'par an' : 'par mois';
    $total = $f['month'] + ($mail ? $D['mail']['month'] : 0);
    $wa = $D['whatsapp'] ? 'https://wa.me/' . rawurlencode($D['whatsapp']) . '?text=' . rawurlencode('Bonjour, je voudrais changer mon forfait ou mes options (' . $u->display_name . ').') : '';
    $share = 'https://wa.me/?text=' . rawurlencode('Je te recommande ALED08 pour ton site internet. Avec mon lien, on a chacun un mois de forfait offert : ' . $plink);

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
    $factures = [];
    foreach (preg_split('/\r?\n/', aled08e_meta($uid, 'factures')) as $line) {
        $p = array_map('trim', explode(';', $line));
        if ($p[0] === '') continue;
        $lien = $p[3] ?? '';
        $factures[] = '<li><span>' . esc_html($p[0] . (!empty($p[1]) ? ' · ' . $p[1] : '')) . '</span><b>' . esc_html($p[2] ?? '') . '</b>' . ($lien ? '<a class="link-btn" href="' . esc_url($lien) . '" target="_blank" rel="noopener">Voir</a>' : '') . '</li>';
    }
    $avis = aled08e_meta($uid, 'avis');
    $mois = aled08e_meta($uid, 'stats_mois');
    $rapport = aled08e_meta($uid, 'stats_rapport');

    ob_start();
    ?>
<section class="section section-app"><div class="container">
  <div class="app" data-espace>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small><?php echo esc_html($host ?: $u->user_email); ?></small></div></div>
        <div class="jauge<?php echo $left <= 0 ? ' is-low' : ''; ?>">
          <p class="jauge-head"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Modifications du mois</span><b><?php echo (int) $left; ?> / <?php echo (int) $quota; ?></b></p>
          <span class="jauge-bar"><i style="width:<?php echo $quota ? (int) round(min(100, $left / $quota * 100)) : 0; ?>%"></i></span>
        </div>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          <?php echo aled08e_tab('accueil', 'house', 'Accueil', true) . aled08e_tab('demandes', 'message-circle', 'Mes demandes') . aled08e_tab('tableau', 'chart-line', 'Tableau de bord') . aled08e_tab('outils', 'qr-code', 'QR code et avis') . aled08e_tab('parrainage', 'gift', 'Parrainage') . aled08e_tab('forfait', 'heart', 'Forfait et factures'); // phpcs:ignore ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour <?php echo esc_html($prenom); ?> !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-<?php echo esc_attr($f['color']); ?>" data-go="forfait"><span class="app-card-art"><?php echo aled08e_monster($f['id']); // phpcs:ignore ?></span><span><small>Votre forfait</small><strong><?php echo esc_html($f['name']); ?></strong><span><?php echo aled08e_euro($price) . ' ' . esc_html($per); // phpcs:ignore ?></span></span></button>
            <div class="app-card c-mint"><span class="app-card-ico"><?php echo aled08e_icon('globe'); // phpcs:ignore ?></span><span><small>Votre site</small><strong><?php echo esc_html($host ?: 'En préparation'); ?></strong><span class="<?php echo $host ? 'dot-ok' : ''; ?>"><?php echo $host ? 'En ligne' : 'Bientôt en ligne'; ?></span></span></div>
            <button type="button" class="app-card c-pink" data-go="parrainage"><span class="app-card-ico"><?php echo aled08e_icon('gift'); // phpcs:ignore ?></span><span><small>Parrainage</small><strong><?php echo esc_html($code); ?></strong><span><?php echo (int) count($filleuls); ?> filleul<?php echo count($filleuls) > 1 ? 's' : ''; ?> en ligne</span></span></button>
          </div>
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

        <div class="app-panel" role="tabpanel" id="t-demandes" aria-labelledby="tab-demandes" hidden>
          <h2 class="app-h">Mes demandes</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <p class="app-p">Écrivez ce que vous voulez changer, avec une photo si besoin. Je m’en occupe et vous suivez l’avancement ici. <?php echo esc_html($f['name'] . ' : ' . mb_strtolower($f['modifs'], 'UTF-8') . '.'); ?></p>
          <?php if ($left <= 0) : ?><p class="esp-warn">Vos modifications du mois sont utilisées. Vous pouvez quand même envoyer votre demande : je vous dis avant si elle attend le mois prochain ou si elle est facturée.</p><?php endif; ?>
          <form class="req-form" method="post" enctype="multipart/form-data" action="<?php echo esc_url(aled08e_url()); ?>" data-req-real>
            <input type="hidden" name="aled08e_demande" value="1">
            <?php wp_nonce_field('aled08e_demande', '_aled08e'); ?>
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
          <?php if ($f['id'] !== 'power') : ?><p class="app-note">Le rapport mensuel détaillé et le suivi SEO font partie du forfait Power.</p><?php endif; ?>
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
          <p class="app-p">Un proche fait créer son site avec votre lien ou votre code : quand il est en ligne, vous recevez chacun <?php echo (int) $D['parrainageMois']; ?> mois de forfait offert.</p>
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
          <?php if ($filleuls) : ?><ul class="reqs"><?php foreach ($filleuls as $fl) echo '<li><span><strong>' . esc_html($fl->first_name ?: $fl->display_name) . '</strong><small>site en ligne</small></span><em class="st st-done">' . (int) $D['parrainageMois'] . ' mois offert</em></li>'; // phpcs:ignore ?></ul><?php endif; ?>
          <?php if ($moisDispo > 0) : ?><p class="esp-empty">Mois offerts à utiliser sur votre forfait : <?php echo (int) $moisDispo; ?>.</p><?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Forfait et factures</h2>
          <div class="app-card c-<?php echo esc_attr($f['color']); ?>"><span class="app-card-art"><?php echo aled08e_monster($f['id']); // phpcs:ignore ?></span><span><small>Votre forfait</small><strong><?php echo esc_html($f['name']); ?></strong><span><?php echo aled08e_euro($price) . ' ' . esc_html($per) . ' · ' . esc_html($f['modifs']); // phpcs:ignore ?></span></span></div>
          <?php if ($mail) : ?>
          <p class="app-sub">Options</p>
          <p class="app-domain"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span><strong><?php echo esc_html($D['mail']['name']); ?></strong><small><?php echo aled08e_euro($D['mail']['month']); // phpcs:ignore ?> par mois</small></span></p>
          <?php endif; ?>
          <p class="app-total"><span>Total chaque mois</span><b><?php echo aled08e_euro($total); // phpcs:ignore ?></b></p>
          <?php if ($annuel) : ?><p class="app-note">Vous payez à l’année : <?php echo (int) $D['moisOfferts']; ?> mois offerts sur le forfait.</p><?php endif; ?>
          <?php if ($wa) : ?><a class="btn btn-light" href="<?php echo esc_url($wa); ?>" target="_blank" rel="noopener"><?php echo aled08e_icon('whatsapp'); // phpcs:ignore ?><span>Changer de forfait ou d’option</span></a><?php endif; ?>
          <p class="app-sub">Factures</p>
          <?php if ($factures) : ?><ul class="invoices"><?php echo implode('', $factures); // phpcs:ignore ?></ul><?php else : ?><p class="esp-empty">Vos factures apparaîtront ici.</p><?php endif; ?>
          <?php if (aled08e_meta($uid, 'domaine_info') || $host) : ?>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain"><?php echo aled08e_icon('globe'); // phpcs:ignore ?><span><strong><?php echo esc_html($host ?: aled08e_meta($uid, 'domaine_info')); ?></strong><small><?php echo esc_html(aled08e_meta($uid, 'domaine_info') ?: 'À votre nom, renouvelé automatiquement'); ?></small></span></p>
          <?php endif; ?>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}
