<?php
/**
 * Plugin Name: Les Minis Monstres : installation du Site Boutique
 * Description: À mettre sur le WordPress tout neuf d'un client. À l'activation, tout se prépare tout seul : réglages, extensions, pages, menu, lien avec l'espace client. Il ne reste que le visuel.
 * Version: 1.0.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Les Minis Monstres
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

/* Le type de site est fixé à la fabrication de l'archive (scripts/wp-export.py) : essentiel, visibilite ou boutique.
 * Une seule de ces trois extensions sert par site. */
if (defined('MINIS_SITE_TYPE')) return;
define('MINIS_SITE_TYPE', 'boutique');
define('MINIS_SITE_VERSION', '1.0.0');
define('MINIS_SITE_FICHIER', __FILE__);

require_once __DIR__ . '/contenu.php';

function minis_site_types() {
    return [
        'essentiel' => ['nom' => 'Site Essentiel', 'but' => 'Exister sur internet', 'resume' => 'Une page unique, avec la présentation, les services et le contact.'],
        'visibilite' => ['nom' => 'Site Visibilité', 'but' => 'Être trouvé sur Google', 'resume' => 'Plusieurs pages, prêtes pour Google : accueil, services, réalisations, à propos, questions, contact.'],
        'boutique' => ['nom' => 'Site Boutique', 'but' => 'Vendre sur internet', 'resume' => 'Le Site Visibilité, avec en plus la boutique WooCommerce reliée à l’espace client.'],
    ];
}
function minis_site_type() { $t = minis_site_types(); return isset($t[MINIS_SITE_TYPE]) ? MINIS_SITE_TYPE : 'essentiel'; }
function minis_site_boutique() { return minis_site_type() === 'boutique'; }

/* Les extensions prises telles quelles sur wordpress.org : on ne réinvente rien */
function minis_site_extensions() {
    $e = [
        'easy-mcp-ai' => ['Easy MCP AI', 'pour qu’Alex travaille sur le site avec Claude'],
        'seo-by-rank-math' => ['Rank Math SEO', 'pour être bien lu par Google'],
        'webp-converter-for-media' => ['Converter for Media', 'pour des images légères'],
        'contact-form-7' => ['Contact Form 7', 'pour le formulaire de contact'],
    ];
    if (minis_site_boutique()) {
        $e['woocommerce'] = ['WooCommerce', 'la boutique'];
        $e['woocommerce-gateway-stripe'] = ['WooCommerce Stripe Gateway', 'le paiement par carte (à relier au compte du client)'];
        $e['woocommerce-paypal-payments'] = ['WooCommerce PayPal Payments', 'le paiement PayPal (à relier au compte du client)'];
    }
    return $e;
}
/* Les extensions maison, rangées dans pkg/ */
function minis_site_maison() {
    return [
        'alexlia-connecteur' => ['alexlia-connecteur/alexlia-connecteur.php', 'Le connecteur', 'le lien avec l’espace client'],
        'alexlia-credit' => ['alexlia-credit/alexlia-credit.php', 'La mention « Site fait par »', 'la signature en bas du site'],
    ];
}

/* ---------- la liste des étapes, dans l'ordre ---------- */
function minis_site_etapes() {
    $e = ['reglages' => 'Les réglages de WordPress', 'menage' => 'Le ménage (contenus d’exemple)'];
    foreach (minis_site_maison() as $id => $m) $e['maison:' . $id] = $m[1] . ' : ' . $m[2];
    foreach (minis_site_extensions() as $slug => $x) $e['ext:' . $slug] = $x[0] . ' : ' . $x[1];
    $e['formulaire'] = 'Le formulaire de contact en français';
    if (minis_site_boutique()) $e['boutique'] = 'Les réglages de la boutique';
    $e['pages'] = 'Les pages du site';
    $e['menu'] = 'Le menu';
    $e['fin'] = 'Les dernières vérifications';
    return $e;
}

/* ---------- le journal de l'installation ---------- */
function minis_site_etat() { $e = get_option('minis_site_etat', []); return is_array($e) ? $e : []; }
function minis_site_noter($etape, $ok, $texte) {
    $e = minis_site_etat();
    $e[$etape] = ['ok' => (bool) $ok, 'texte' => (string) $texte, 'le' => time()];
    update_option('minis_site_etat', $e, false);
    return $e[$etape];
}

/* =========================================================================
 *  Activation : on note qu'il faut installer, puis on ouvre la page qui fait tout
 * ========================================================================= */
register_activation_hook(__FILE__, function () {
    if (!get_option('minis_site_termine')) update_option('minis_site_a_lancer', 1, false);
    set_transient('minis_site_ouvrir', 1, 60);
});
add_action('admin_init', function () {
    if (!get_transient('minis_site_ouvrir') || wp_doing_ajax() || !current_user_can('manage_options')) return;
    delete_transient('minis_site_ouvrir');
    if (isset($_GET['activate-multi'])) return;
    wp_safe_redirect(admin_url('admin.php?page=minis-site'));
    exit;
});
add_action('admin_notices', function () {
    if (!current_user_can('manage_options') || get_option('minis_site_termine') || (isset($_GET['page']) && $_GET['page'] === 'minis-site')) return;
    echo '<div class="notice notice-info"><p><strong>Les Minis Monstres :</strong> l’installation du site n’est pas terminée. <a href="' . esc_url(admin_url('admin.php?page=minis-site')) . '">La terminer</a></p></div>';
});
add_action('admin_menu', function () {
    add_menu_page('Les Minis Monstres', 'Minis Monstres', 'manage_options', 'minis-site', 'minis_site_page', 'dashicons-smiley', 3);
});
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($l) {
    array_unshift($l, '<a href="' . esc_url(admin_url('admin.php?page=minis-site')) . '">Installation</a>');
    return $l;
});

/* =========================================================================
 *  Les étapes, une par appel : rien ne dépasse le temps accordé par l'hébergeur
 * ========================================================================= */
add_action('wp_ajax_minis_site_etape', function () {
    if (!current_user_can('manage_options') || !check_ajax_referer('minis_site', '_n', false)) wp_send_json(['ok' => false, 'texte' => 'La page a expiré. Rechargez-la.']);
    $id = sanitize_text_field(wp_unslash($_POST['etape'] ?? ''));
    if (!isset(minis_site_etapes()[$id])) wp_send_json(['ok' => false, 'texte' => 'Étape inconnue.']);
    @set_time_limit(300);
    ob_start();
    try { $r = minis_site_faire($id); } catch (\Throwable $e) { $r = [false, 'Erreur : ' . $e->getMessage()]; }
    ob_end_clean();
    $n = minis_site_noter($id, $r[0], $r[1]);
    wp_send_json(['ok' => $n['ok'], 'texte' => $n['texte']]);
});

function minis_site_faire($id) {
    if ($id === 'reglages') return minis_site_e_reglages();
    if ($id === 'menage') return minis_site_e_menage();
    if (strpos($id, 'maison:') === 0) return minis_site_e_maison(substr($id, 7));
    if (strpos($id, 'ext:') === 0) return minis_site_e_extension(substr($id, 4));
    if ($id === 'formulaire') return minis_site_e_formulaire();
    if ($id === 'pages') return minis_site_e_pages();
    if ($id === 'boutique') return minis_site_e_boutique();
    if ($id === 'menu') return minis_site_e_menu();
    if ($id === 'fin') return minis_site_e_fin();
    return [false, 'Étape inconnue.'];
}

/* ---------- 1. les réglages ---------- */
function minis_site_e_reglages() {
    $fait = [];
    update_option('timezone_string', 'Europe/Paris'); update_option('gmt_offset', '');
    update_option('date_format', 'j F Y'); update_option('time_format', 'H:i'); update_option('start_of_week', 1);
    update_option('default_comment_status', 'closed'); update_option('default_ping_status', 'closed'); update_option('default_pingback_flag', 0);
    $fait[] = 'heure de Paris, commentaires fermés';
    // le français
    if (get_option('WPLANG') !== 'fr_FR') {
        require_once ABSPATH . 'wp-admin/includes/translation-install.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        $l = in_array('fr_FR', get_available_languages(), true) ? 'fr_FR' : (function_exists('wp_download_language_pack') ? wp_download_language_pack('fr_FR') : false);
        if ($l) { update_option('WPLANG', 'fr_FR'); $fait[] = 'site en français'; } else $fait[] = 'le français n’a pas pu être téléchargé (à choisir dans Réglages › Général)';
    } else $fait[] = 'site en français';
    // des adresses propres : /contact/ plutôt que ?p=12
    if (get_option('permalink_structure') !== '/%postname%/') {
        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure('/%postname%/');
        update_option('minis_site_flush', 1, false);
    }
    $fait[] = 'adresses de page lisibles';
    return [true, ucfirst(implode(', ', $fait)) . '.'];
}
add_action('init', function () { if (get_option('minis_site_flush')) { delete_option('minis_site_flush'); flush_rewrite_rules(); } }, 99);

/* ---------- 2. le ménage : seulement les contenus d'exemple de WordPress, jamais autre chose ---------- */
function minis_site_e_menage() {
    $n = 0;
    foreach ([['post', ['hello-world', 'bonjour-tout-le-monde']], ['page', ['sample-page', 'page-d-exemple']]] as [$type, $slugs]) {
        foreach ($slugs as $s) {
            $p = get_page_by_path($s, OBJECT, $type);
            if ($p && (int) $p->ID <= 3) { wp_delete_post($p->ID, true); $n++; }
        }
    }
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    if (file_exists(WP_PLUGIN_DIR . '/hello.php') && !is_plugin_active('hello.php')) { delete_plugins(['hello.php']); $n++; }
    return [true, $n ? $n . ' contenu' . ($n > 1 ? 's' : '') . ' d’exemple retiré' . ($n > 1 ? 's' : '') . '.' : 'Rien à retirer.'];
}

/* ---------- 3. les extensions maison (dans pkg/) ---------- */
function minis_site_e_maison($id) {
    $m = minis_site_maison()[$id] ?? null;
    if (!$m) return [false, 'Extension inconnue.'];
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    $zip = __DIR__ . '/pkg/' . $id . '.zip';
    if (!file_exists(WP_PLUGIN_DIR . '/' . $m[0])) {
        if (!is_file($zip)) return [false, 'Le paquet manque dans l’archive.'];
        if (!WP_Filesystem()) return [false, 'WordPress ne peut pas écrire dans le dossier des extensions (droits de l’hébergeur).'];
        $r = unzip_file($zip, WP_PLUGIN_DIR);
        if (is_wp_error($r)) return [false, $r->get_error_message()];
        wp_clean_plugins_cache(true);
    }
    if (!is_plugin_active($m[0])) { $a = activate_plugin($m[0]); if (is_wp_error($a)) return [false, $a->get_error_message()]; }
    $plus = '';
    if ($id === 'alexlia-connecteur' && !get_option('alexlia_secret') && !(defined('ALEXLIA_SECRET') && ALEXLIA_SECRET)) {
        update_option('alexlia_secret', wp_generate_password(48, false, false), false);
        $plus = ' Clé du site créée.';
    }
    return [true, 'Installée et activée.' . $plus];
}

/* ---------- 4. les extensions de wordpress.org ---------- */
function minis_site_fichier_extension($slug) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    wp_cache_delete('plugins', 'plugins');
    foreach (get_plugins() as $f => $d) if (strpos($f, $slug . '/') === 0) return $f;
    return '';
}
function minis_site_e_extension($slug) {
    if (!isset(minis_site_extensions()[$slug])) return [false, 'Extension inconnue.'];
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    $f = minis_site_fichier_extension($slug);
    if (!$f) {
        $api = plugins_api('plugin_information', ['slug' => $slug, 'fields' => ['sections' => false]]);
        if (is_wp_error($api)) return [false, 'wordpress.org ne répond pas : ' . $api->get_error_message()];
        $up = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
        $r = $up->install($api->download_link);
        if (is_wp_error($r)) return [false, $r->get_error_message()];
        if (!$r) return [false, 'Le téléchargement n’a pas abouti (droits d’écriture ou connexion de l’hébergeur).'];
        $f = minis_site_fichier_extension($slug);
        if (!$f) return [false, 'Installée, mais introuvable ensuite.'];
    }
    if (!is_plugin_active($f)) {
        $a = activate_plugin($f);
        if (is_wp_error($a)) return [false, $a->get_error_message()];
    }
    // pas d'assistant qui s'ouvre tout seul : on reste sur notre page
    delete_transient('_wc_activation_redirect'); delete_transient('_rank_math_activation_redirect'); delete_option('rank_math_redirect_about');
    delete_transient('wpcf7_activation_redirect'); delete_transient('woocommerce_stripe_activation_redirect'); delete_option('woocommerce-ppcp-is-new-merchant');
    return [true, 'Installée et activée.'];
}

/* ---------- 5. le formulaire de contact, en français ---------- */
function minis_site_formulaire_id() {
    $id = (int) get_option('minis_site_formulaire');
    return $id && get_post_type($id) === 'wpcf7_contact_form' ? $id : 0;
}
function minis_site_e_formulaire() {
    if (!class_exists('WPCF7_ContactForm')) return [false, 'Contact Form 7 n’est pas actif : le formulaire sera à poser à la main.'];
    if (minis_site_formulaire_id()) return [true, 'Déjà prêt.'];
    $f = WPCF7_ContactForm::get_template(['title' => 'Formulaire de contact', 'locale' => 'fr_FR']);
    $p = $f->get_properties();
    $p['form'] = "<label> Votre nom\n    [text* your-name autocomplete:name] </label>\n\n<label> Votre e-mail\n    [email* your-email autocomplete:email] </label>\n\n<label> Votre téléphone (facultatif)\n    [tel your-tel autocomplete:tel] </label>\n\n<label> Votre message\n    [textarea* your-message] </label>\n\n[submit \"Envoyer\"]";
    $mail = is_array($p['mail'] ?? null) ? $p['mail'] : [];
    $mail['subject'] = '[_site_title] Nouveau message de [your-name]';
    $mail['body'] = "De : [your-name]\nE-mail : [your-email]\nTéléphone : [your-tel]\n\nMessage :\n[your-message]\n\n--\nEnvoyé depuis le formulaire de contact du site [_site_title] ([_site_url])";
    $mail['additional_headers'] = 'Reply-To: [your-email]';
    $p['mail'] = $mail;
    $p['messages'] = array_merge(is_array($p['messages'] ?? null) ? $p['messages'] : [], [
        'mail_sent_ok' => 'Merci, votre message est bien parti. On vous répond vite.',
        'mail_sent_ng' => 'Le message n’a pas pu partir. Réessayez dans un instant.',
        'validation_error' => 'Un champ est à corriger. Regardez juste au-dessus.',
        'invalid_required' => 'Ce champ est à remplir.',
        'invalid_email' => 'Cette adresse e-mail ne semble pas complète.',
        'spam' => 'Le message n’a pas pu partir. Réessayez dans un instant.',
    ]);
    $f->set_properties($p);
    $id = (int) $f->save();
    if (!$id) return [false, 'Le formulaire n’a pas pu être créé.'];
    update_option('minis_site_formulaire', $id, false);
    // le formulaire d'exemple en anglais ne sert à rien
    foreach (get_posts(['post_type' => 'wpcf7_contact_form', 'numberposts' => 5, 'post__not_in' => [$id], 'post_status' => 'any']) as $x) if (preg_match('/^(Contact form 1|Formulaire de contact 1)$/i', $x->post_title)) wp_delete_post($x->ID, true);
    return [true, 'Créé. Les messages arrivent à ' . get_option('admin_email') . '.'];
}

/* ---------- 6. les pages ---------- */
function minis_site_page_id($cle) {
    $q = get_posts(['post_type' => 'page', 'post_status' => ['publish', 'draft', 'private'], 'meta_key' => '_minis_page', 'meta_value' => $cle, 'numberposts' => 1, 'fields' => 'ids']);
    return $q ? (int) $q[0] : 0;
}
function minis_site_e_pages() {
    $cree = 0; $deja = 0;
    foreach (minis_site_pages() as $cle => $p) {
        if (minis_site_page_id($cle)) { $deja++; continue; }
        $id = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => $p['titre'], 'post_name' => $p['slug'], 'post_content' => $p['contenu'], 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
        if (is_wp_error($id)) return [false, $p['titre'] . ' : ' . $id->get_error_message()];
        update_post_meta($id, '_minis_page', $cle);
        $cree++;
    }
    $acc = minis_site_page_id('accueil');
    if ($acc) { update_option('show_on_front', 'page'); update_option('page_on_front', $acc); }
    $conf = minis_site_page_id('confidentialite');
    if ($conf) {
        $anc = (int) get_option('wp_page_for_privacy_policy');
        update_option('wp_page_for_privacy_policy', $conf);
        if ($anc && $anc !== $conf && get_post_status($anc) === 'draft') wp_delete_post($anc, true); // le brouillon d'exemple de WordPress
    }
    $cgv = minis_site_page_id('cgv');
    if ($cgv && minis_site_boutique()) update_option('woocommerce_terms_page_id', $cgv);
    return [true, $cree ? $cree . ' page' . ($cree > 1 ? 's' : '') . ' créée' . ($cree > 1 ? 's' : '') . ($deja ? ', ' . $deja . ' déjà là' : '') . '. L’accueil est en page d’entrée.' : 'Les pages étaient déjà là.'];
}

/* ---------- 7. la boutique : WooCommerce, réglé pour la France ---------- */
function minis_site_e_boutique() {
    if (!class_exists('WooCommerce')) return [false, 'WooCommerce n’est pas actif.'];
    foreach ([
        'woocommerce_default_country' => 'FR', 'woocommerce_currency' => 'EUR', 'woocommerce_currency_pos' => 'right_space',
        'woocommerce_price_thousand_sep' => ' ', 'woocommerce_price_decimal_sep' => ',', 'woocommerce_price_num_decimals' => 2,
        'woocommerce_weight_unit' => 'kg', 'woocommerce_dimension_unit' => 'cm', 'woocommerce_allowed_countries' => 'specific',
        'woocommerce_specific_allowed_countries' => ['FR'], 'woocommerce_calc_taxes' => 'no', 'woocommerce_enable_guest_checkout' => 'yes',
        'woocommerce_enable_reviews' => 'no', 'woocommerce_allow_tracking' => 'no', 'woocommerce_show_marketplace_suggestions' => 'no',
    ] as $k => $v) update_option($k, $v);
    update_option('woocommerce_onboarding_profile', ['skipped' => true]);
    update_option('woocommerce_task_list_hidden', 'yes');
    if (class_exists('WC_Install')) WC_Install::create_pages(); // boutique, panier, commande, mon compte : les pages de WooCommerce elles-mêmes
    // tant qu'aucun paiement n'est relié, le connecteur montre les articles sans panier (mode vitrine) : rien à faire ici
    return [true, 'France, euros, prix « 12,50 € », pages panier et commande créées. Les paiements restent à relier au compte du client.'];
}

/* ---------- 8. le menu : pour les thèmes classiques et pour les thèmes à blocs ---------- */
function minis_site_e_menu() {
    $liens = minis_site_menu();
    // thème classique
    $nom = 'Menu principal';
    $menu = wp_get_nav_menu_object($nom);
    if (!$menu) {
        $mid = wp_create_nav_menu($nom);
        if (is_wp_error($mid)) return [false, $mid->get_error_message()];
        foreach ($liens as $l) {
            $a = ['menu-item-title' => $l['titre'], 'menu-item-status' => 'publish'];
            if (!empty($l['page'])) $a += ['menu-item-object' => 'page', 'menu-item-object-id' => $l['page'], 'menu-item-type' => 'post_type'];
            else $a += ['menu-item-url' => $l['url'], 'menu-item-type' => 'custom'];
            wp_update_nav_menu_item($mid, 0, $a);
        }
    } else $mid = (int) $menu->term_id;
    $empl = get_registered_nav_menus();
    if ($empl) { $loc = get_theme_mod('nav_menu_locations', []); $loc = is_array($loc) ? $loc : []; $k = array_key_first($empl); if (empty($loc[$k])) { $loc[$k] = $mid; set_theme_mod('nav_menu_locations', $loc); } }
    // thème à blocs : un menu de navigation prêt à l'emploi
    if (!get_option('minis_site_navigation') || !get_post((int) get_option('minis_site_navigation'))) {
        $b = '';
        foreach ($liens as $l) {
            $attrs = ['label' => $l['titre'], 'url' => $l['url'], 'kind' => !empty($l['page']) ? 'post-type' : 'custom'];
            if (!empty($l['page'])) $attrs += ['type' => 'page', 'id' => (int) $l['page']];
            $b .= '<!-- wp:navigation-link ' . wp_json_encode($attrs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ' /-->' . "\n";
        }
        $nid = wp_insert_post(['post_type' => 'wp_navigation', 'post_status' => 'publish', 'post_title' => $nom, 'post_content' => $b]);
        if ($nid && !is_wp_error($nid)) update_option('minis_site_navigation', (int) $nid, false);
    }
    return [true, count($liens) . ' liens dans « ' . $nom . ' ».'];
}

/* ---------- 9. la fin ---------- */
function minis_site_e_fin() {
    $rate = [];
    foreach (minis_site_etat() as $id => $e) if ($id !== 'fin' && empty($e['ok'])) $rate[] = minis_site_etapes()[$id] ?? $id;
    delete_option('minis_site_a_lancer');
    if ($rate) { delete_option('minis_site_termine'); return [false, 'À reprendre : ' . implode(' ; ', $rate) . '.']; }
    update_option('minis_site_termine', time(), false);
    update_option('minis_site_type_installe', minis_site_type(), false);
    return [true, 'Tout est en place. Il ne reste que le visuel.'];
}

/* =========================================================================
 *  La page : elle lance les étapes toute seule et dit quoi faire ensuite
 * ========================================================================= */
function minis_site_page() {
    if (!current_user_can('manage_options')) return;
    $t = minis_site_types()[minis_site_type()];
    $etapes = minis_site_etapes();
    $etat = minis_site_etat();
    $fini = (bool) get_option('minis_site_termine');
    $lancer = !$fini && (get_option('minis_site_a_lancer') || !$etat);
    $cle = defined('ALEXLIA_SECRET') && ALEXLIA_SECRET ? '' : (string) get_option('alexlia_secret', '');
    ?>
<div class="wrap minis-site">
  <style>
    .minis-site { max-width: 860px; }
    .minis-site .ms-tete { display: flex; gap: 16px; align-items: center; margin: 18px 0; padding: 22px; border-radius: 22px; background: #232040; color: #ece9ff; }
    .minis-site .ms-tete h1 { margin: 0 0 4px; padding: 0; color: #fff; font-size: 24px; }
    .minis-site .ms-tete p { margin: 0; color: #cfcbea; font-size: 15px; }
    .minis-site .ms-badge { flex: none; width: 58px; height: 58px; border-radius: 18px; display: grid; place-items: center; background: #7bddb1; color: #16142a; font-size: 30px; }
    .minis-site .ms-carte { margin: 0 0 16px; padding: 20px 22px; border-radius: 18px; background: #fff; border: 1px solid #e4e1f5; }
    .minis-site .ms-carte h2 { margin: 0 0 12px; font-size: 18px; }
    .minis-site .ms-liste { margin: 0; padding: 0; list-style: none; }
    .minis-site .ms-liste li { display: flex; gap: 12px; align-items: flex-start; padding: 9px 0; border-top: 1px solid #f0eef9; font-size: 14px; }
    .minis-site .ms-liste li:first-child { border-top: 0; }
    .minis-site .ms-pastille { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: #ebe9f5; color: #6a668a; font-weight: 700; font-size: 13px; }
    .minis-site li.est-ok .ms-pastille { background: #7bddb1; color: #123; }
    .minis-site li.est-ko .ms-pastille { background: #ff8ebf; color: #401; }
    .minis-site li.en-cours .ms-pastille { background: #ffd58a; animation: ms-pouls 1s infinite alternate; }
    @keyframes ms-pouls { to { opacity: .45; } }
    .minis-site .ms-liste strong { display: block; }
    .minis-site .ms-liste small { color: #6a668a; font-size: 13px; }
    .minis-site .ms-barre { height: 10px; border-radius: 99px; background: #ebe9f5; overflow: hidden; margin: 0 0 14px; }
    .minis-site .ms-barre i { display: block; height: 100%; width: 0; background: #7bddb1; transition: width .3s; }
    .minis-site .ms-cle { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0 0; }
    .minis-site .ms-cle input { flex: 1; min-width: 220px; font-family: Consolas, Menlo, monospace; }
    .minis-site ol.ms-suite { margin: 0 0 0 18px; }
    .minis-site ol.ms-suite li { margin: 0 0 10px; font-size: 14px; }
    @media (max-width: 600px) { .minis-site .ms-tete { flex-direction: column; align-items: flex-start; } }
  </style>
  <div class="ms-tete">
    <div class="ms-badge" aria-hidden="true">☺</div>
    <div><h1><?php echo esc_html($t['nom']); ?></h1><p><?php echo esc_html($t['but'] . '. ' . $t['resume']); ?></p></div>
  </div>

  <div class="ms-carte">
    <h2 id="ms-titre"><?php echo $fini ? 'Installation terminée' : 'Installation'; ?></h2>
    <div class="ms-barre" aria-hidden="true"><i id="ms-barre"></i></div>
    <ul class="ms-liste" id="ms-liste">
      <?php foreach ($etapes as $id => $lib) : $e = $etat[$id] ?? null; ?>
      <li data-etape="<?php echo esc_attr($id); ?>" class="<?php echo $e ? ($e['ok'] ? 'est-ok' : 'est-ko') : ''; ?>">
        <span class="ms-pastille"><?php echo $e ? ($e['ok'] ? '✓' : '!') : '·'; ?></span>
        <span><strong><?php echo esc_html($lib); ?></strong><small><?php echo esc_html($e['texte'] ?? 'En attente'); ?></small></span>
      </li>
      <?php endforeach; ?>
    </ul>
    <p style="margin:16px 0 0"><button type="button" class="button <?php echo $fini ? '' : 'button-primary'; ?>" id="ms-lancer"><?php echo $etat ? 'Relancer l’installation' : 'Lancer l’installation'; ?></button> <span class="description">Relancer ne casse rien : ce qui est déjà fait est gardé.</span></p>
  </div>

  <div class="ms-carte">
    <h2>Ce qu’il reste à faire</h2>
    <ol class="ms-suite">
      <li><strong>Le visuel.</strong> Le thème, les couleurs, les photos, et les textes entre crochets [comme ceci] à remplacer dans <a href="<?php echo esc_url(admin_url('edit.php?post_type=page')); ?>">les pages</a>.</li>
      <li><strong>Relier le site à l’espace client.</strong> Dans la fiche du client sur les-minis-monstres.fr, collez l’adresse du site et sa clé.
        <div class="ms-cle"><input type="text" readonly value="<?php echo esc_attr(home_url('/')); ?>" onclick="this.select()" aria-label="Adresse du site"></div>
        <?php if ($cle !== '') : ?><div class="ms-cle"><input type="password" readonly id="ms-cle" value="<?php echo esc_attr($cle); ?>" aria-label="Clé du site"><button type="button" class="button" onclick="var c=document.getElementById('ms-cle');c.type='text';c.select();try{navigator.clipboard.writeText(c.value);this.textContent='Copiée';}catch(e){}">Copier la clé</button></div>
        <?php else : ?><p class="description">La clé apparaît ici une fois le connecteur installé.</p><?php endif; ?>
      </li>
      <li><strong>Brancher Claude.</strong> Dans <em>Easy MCP AI</em>, reliez le site à Claude pour travailler dessus par la discussion.</li>
      <li><strong>Les mentions légales.</strong> Complétez le nom, l’adresse et le numéro SIRET du client<?php echo minis_site_boutique() ? ', et les conditions générales de vente' : ''; ?>.</li>
      <?php if (minis_site_boutique()) : ?><li><strong>La boutique.</strong> Reliez Stripe ou PayPal au compte du client (WooCommerce › Réglages › Paiements). Tant qu’aucun paiement n’est relié, les articles s’affichent sans panier. Les articles, les catégories et la livraison se règlent ensuite depuis l’espace client.</li><?php endif; ?>
      <li><strong>Avant d’ouvrir au public.</strong> Vérifiez que « Demander aux moteurs de recherche de ne pas indexer ce site » est décoché dans <a href="<?php echo esc_url(admin_url('options-reading.php')); ?>">Réglages › Lecture</a>.</li>
    </ol>
  </div>
  <script>
  (function () {
    var ids = <?php echo wp_json_encode(array_keys($etapes)); ?>, n = <?php echo wp_json_encode(wp_create_nonce('minis_site')); ?>, url = <?php echo wp_json_encode(admin_url('admin-ajax.php')); ?>;
    var bouton = document.getElementById('ms-lancer'), barre = document.getElementById('ms-barre'), titre = document.getElementById('ms-titre');
    var li = function (id) { return document.querySelector('#ms-liste li[data-etape="' + id + '"]'); };
    var poser = function (id, cl, signe, texte) { var l = li(id); if (!l) return; l.className = cl; l.querySelector('.ms-pastille').textContent = signe; if (texte) l.querySelector('small').textContent = texte; };
    var avance = function (i) { barre.style.width = Math.round(i / ids.length * 100) + '%'; };
    avance(document.querySelectorAll('#ms-liste li.est-ok').length);
    var suivant = function (i) {
      if (i >= ids.length) { bouton.disabled = false; bouton.textContent = 'Relancer l’installation'; var ko = document.querySelectorAll('#ms-liste li.est-ko').length; titre.textContent = ko ? 'Installation à reprendre (' + ko + ')' : 'Installation terminée'; if (!ko) setTimeout(function () { location.reload(); }, 900); return; }
      var id = ids[i];
      poser(id, 'en-cours', '…', 'En cours…');
      var f = new FormData(); f.append('action', 'minis_site_etape'); f.append('_n', n); f.append('etape', id);
      fetch(url, { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) {
        var j; try { j = JSON.parse(t.slice(t.indexOf('{'))); } catch (e) { j = { ok: false, texte: 'Réponse illisible du serveur. Relancez.' }; }
        poser(id, j.ok ? 'est-ok' : 'est-ko', j.ok ? '✓' : '!', j.texte);
      }).catch(function () { poser(id, 'est-ko', '!', 'Le serveur n’a pas répondu. Relancez.'); }).then(function () { avance(i + 1); suivant(i + 1); });
    };
    var lancer = function () { bouton.disabled = true; bouton.textContent = 'Installation en cours…'; titre.textContent = 'Installation en cours'; avance(0); suivant(0); };
    bouton.addEventListener('click', lancer);
    <?php if ($lancer) : ?>lancer();<?php endif; ?>
  })();
  </script>
</div>
    <?php
}
