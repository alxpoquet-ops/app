<?php
/**
 * Plugin Name: Les Minis Monstres : installeur
 * Description: Installe d'un seul clic tout le site des Minis Monstres sur ce WordPress : le thème, l'espace client, le kit Claude et les pages. À supprimer après usage.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Author: Les Minis Monstres
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

/* Les paquets sont dans pkg/ : le thème, l'espace client, le kit Claude et l'import des pages.
 * À l'activation, tout est dépaqueté, activé, puis l'import des pages tourne et disparaît. */
register_activation_hook(__FILE__, 'minis_inst_run');

function minis_inst_rapport($txt, $ok = true) {
    $r = get_option('minis_inst_rapport', []);
    $r = is_array($r) ? $r : [];
    $r[] = [$ok ? 'ok' : 'erreur', $txt];
    update_option('minis_inst_rapport', $r, false);
}
function minis_inst_dezip($zip, $dest) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    if (!WP_Filesystem()) return new WP_Error('minis', 'Accès aux fichiers impossible.');
    return unzip_file($zip, $dest);
}

function minis_inst_run() {
    @set_time_limit(600);
    @ini_set('memory_limit', '512M');
    delete_option('minis_inst_rapport');
    $pkg = __DIR__ . '/pkg/';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';

    if (version_compare(PHP_VERSION, '8.1', '<')) { minis_inst_rapport('PHP ' . PHP_VERSION . ' : il faut PHP 8.1 ou plus (à changer chez l’hébergeur).', false); return; }

    // 1. le thème
    if (is_file($pkg . 'aled08.zip')) {
        $r = minis_inst_dezip($pkg . 'aled08.zip', get_theme_root());
        if (is_wp_error($r)) minis_inst_rapport('Thème : ' . $r->get_error_message(), false); else { minis_inst_rapport('Thème installé.'); }
    }
    // 2. les extensions, dans cet ordre : kit Claude, espace client, connecteur (pour les sites clients : seulement copié), import des pages
    $plugins = [
        'alexlia-sdk' => 'alexlia-sdk/alexlia-sdk.php',
        'aled08-espace' => 'aled08-espace/aled08-espace.php',
        'aled08-import' => 'aled08-import/aled08-import.php',
    ];
    foreach ($plugins as $zip => $fichier) {
        if (!is_file($pkg . $zip . '.zip')) continue;
        $r = minis_inst_dezip($pkg . $zip . '.zip', WP_PLUGIN_DIR);
        if (is_wp_error($r)) { minis_inst_rapport($zip . ' : ' . $r->get_error_message(), false); continue; }
        wp_clean_plugins_cache(true);
    }
    // thème actif avant les pages
    if (wp_get_theme('aled08')->exists()) { switch_theme('aled08'); minis_inst_rapport('Thème « Les Minis Monstres » activé.'); }
    foreach (['alexlia-sdk/alexlia-sdk.php', 'aled08-espace/aled08-espace.php'] as $f) {
        if (!file_exists(WP_PLUGIN_DIR . '/' . $f)) continue;
        $a = activate_plugin($f);
        minis_inst_rapport(is_wp_error($a) ? basename(dirname($f)) . ' : ' . $a->get_error_message() : basename(dirname($f)) . ' activée.', !is_wp_error($a));
    }
    // 3. les pages : l'extension d'import tourne à l'activation, puis elle est retirée
    $imp = 'aled08-import/aled08-import.php';
    if (file_exists(WP_PLUGIN_DIR . '/' . $imp)) {
        $a = activate_plugin($imp);
        if (is_wp_error($a)) minis_inst_rapport('Import des pages : ' . $a->get_error_message(), false);
        else {
            $rap = get_option('aled08_import_report');
            minis_inst_rapport('Pages créées : ' . (is_array($rap) ? (int) $rap['count'] : '?') . '.');
            deactivate_plugins($imp);
            global $wp_filesystem;
            if ($wp_filesystem) $wp_filesystem->delete(WP_PLUGIN_DIR . '/aled08-import', true);
        }
    }
    // 4. les paquets ne servent plus : on libère la place
    global $wp_filesystem;
    if ($wp_filesystem && is_dir($pkg)) $wp_filesystem->delete($pkg, true);
    flush_rewrite_rules(false);
    update_option('minis_inst_fini', current_time('mysql'), false);
    minis_inst_rapport('Terminé. Vous pouvez supprimer cette extension « installeur ».');
}

add_action('admin_notices', function () {
    if (!current_user_can('manage_options')) return;
    $r = get_option('minis_inst_rapport', []);
    if (!$r || !is_array($r)) return;
    $mal = array_filter($r, function ($l) { return $l[0] === 'erreur'; });
    echo '<div class="notice notice-' . ($mal ? 'warning' : 'success') . '"><p><strong>Les Minis Monstres : installation</strong></p><ul style="list-style:disc;margin-left:22px">';
    foreach ($r as $l) echo '<li>' . ($l[0] === 'ok' ? '✅ ' : '⚠️ ') . esc_html($l[1]) . '</li>';
    echo '</ul><p>Prochaine étape : <a href="' . esc_url(admin_url('admin.php?page=aled08-reglages')) . '">Les Minis Monstres › Réglages</a> pour entrer vos clés (Stripe, Claude…).</p></div>';
});
