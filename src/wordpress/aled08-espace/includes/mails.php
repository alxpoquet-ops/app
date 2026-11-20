<?php
/**
 * Les Minis Monstres Espace client : tous les e-mails du site aux couleurs de la bande.
 *  - l'expéditeur n'est plus « WordPress » mais « Les Minis Monstres » ;
 *  - un e-mail écrit en texte simple est habillé (logo, carte sombre, liens en boutons), avec sa version texte gardée ;
 *  - la connexion en un clic : un lien personnel, valable quelques jours, qui ouvre l'espace sans taper le mot de passe.
 */
defined('ABSPATH') || exit;

function aled08e_mail_from() { return function_exists('aled08e_bienvenue_expediteur') ? aled08e_bienvenue_expediteur() : 'contact@lesminismonstres.fr'; }
add_filter('wp_mail_from_name', function ($n) { return (string) $n === '' || strcasecmp((string) $n, 'WordPress') === 0 ? 'Les Minis Monstres' : $n; }, 20);
add_filter('wp_mail_from', function ($f) { return stripos((string) $f, 'wordpress@') === 0 ? aled08e_mail_from() : $f; }, 20);

/* L'enveloppe commune : le logo et le nom mènent au site */
function aled08e_mail_coque($titre, $contenu, $apercu = '') {
    $site = home_url('/');
    $logo = get_template_directory_uri() . '/assets/img/logo-192.png';
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>' . esc_html($titre) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#16142A;">'
        . ($apercu !== '' ? '<div style="display:none;max-height:0;overflow:hidden;">' . esc_html($apercu) . '</div>' : '')
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#16142A;"><tr><td align="center" style="padding:24px 12px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;color:#ECE9FF;">'
        . '<tr><td align="center" style="padding:6px 0 18px;"><a href="' . esc_url($site) . '" style="text-decoration:none;"><img src="' . esc_url($logo) . '" width="76" height="76" alt="Les Minis Monstres" style="display:block;margin:0 auto;border:0;border-radius:20px;"><span style="display:block;margin:10px 0 0;font-size:15px;font-weight:bold;letter-spacing:.02em;color:#FF8EBF;">Les Minis Monstres</span></a></td></tr>'
        . '<tr><td style="background:#232040;border-radius:28px;padding:28px 22px;">' . $contenu . '</td></tr>'
        . '<tr><td align="center" style="padding:18px 10px 0;font-size:12px;line-height:1.5;color:#8B86B3;"><a href="' . esc_url($site) . '" style="color:#8B86B3;text-decoration:none;">Les Minis Monstres, sites internet pour artisans et commerçants.</a></td></tr>'
        . '</table></td></tr></table></body></html>';
}
function aled08e_mail_bouton($url, $texte) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;"><tr><td style="border-radius:999px;background:#7BDDB1;"><a href="' . esc_url($url) . '" style="display:inline-block;padding:13px 24px;font-size:16px;font-weight:bold;color:#16142A;text-decoration:none;">' . esc_html($texte) . '</a></td></tr></table>';
}
/* Un texte simple devient un bel e-mail : paragraphes, et chaque adresse seule sur sa ligne devient un bouton */
function aled08e_mail_habiller($sujet, $texte) {
    $h = '<h1 style="margin:0 0 16px;font-size:23px;line-height:1.25;color:#FFFFFF;"><a href="' . esc_url(home_url('/')) . '" style="color:#FFFFFF;text-decoration:none;">' . esc_html($sujet) . '</a></h1>';
    $ici = wp_parse_url(home_url(), PHP_URL_HOST);
    foreach (preg_split('/\n\s*\n/', trim(str_replace("\r", '', (string) $texte))) as $bloc) {
        $lignes = [];
        foreach (explode("\n", $bloc) as $l) {
            $brut = trim($l, " \t<>");
            if (preg_match('#^https?://\S+$#', $brut)) {
                if ($lignes) { $h .= '<p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#CFCBEA;">' . implode('<br>', $lignes) . '</p>'; $lignes = []; }
                $h .= aled08e_mail_bouton($brut, wp_parse_url($brut, PHP_URL_HOST) === $ici ? (strpos($brut, 'mon-espace') !== false ? 'Ouvrir mon espace client' : 'Ouvrir la page') : 'Ouvrir le lien');
                continue;
            }
            $lignes[] = make_clickable(esc_html($l));
        }
        if ($lignes) $h .= '<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#CFCBEA;">' . str_replace('<a ', '<a style="color:#7BDDB1;" ', implode('<br>', $lignes)) . '</p>';
    }
    return aled08e_mail_coque($sujet, $h, mb_substr(trim(preg_replace('/\s+/', ' ', (string) $texte)), 0, 110));
}
add_filter('wp_mail', function ($a) {
    $entetes = is_array($a['headers'] ?? '') ? $a['headers'] : array_filter(array_map('trim', explode("\n", str_replace("\r", '', (string) ($a['headers'] ?? '')))));
    foreach ($entetes as $e) if (stripos($e, 'content-type:') === 0 && stripos($e, 'text/html') !== false) return $a; // déjà mis en forme
    $msg = (string) ($a['message'] ?? '');
    if ($msg === '' || preg_match('/^\s*<(!doctype|html|table|div|p)\b/i', $msg)) return $a;
    $entetes = array_values(array_filter($entetes, function ($e) { return stripos($e, 'content-type:') !== 0; }));
    $entetes[] = 'Content-Type: text/html; charset=UTF-8';
    $GLOBALS['aled08e_mail_alt'] = $msg;
    $a['message'] = aled08e_mail_habiller((string) ($a['subject'] ?? ''), $msg);
    $a['headers'] = $entetes;
    return $a;
}, 50);
add_action('phpmailer_init', function ($m) {
    if (!empty($GLOBALS['aled08e_mail_alt'])) { $m->AltBody = (string) $GLOBALS['aled08e_mail_alt']; $GLOBALS['aled08e_mail_alt'] = ''; }
}, 5);

/* ---------- la connexion en un clic ---------- */
function aled08e_clic_lien($uid, $jours = 14) {
    $u = get_userdata((int) $uid);
    if (!$u || user_can($u, 'edit_posts')) return aled08e_url(); // jamais pour un compte qui administre le site
    $j = wp_generate_password(40, false, false);
    update_user_meta($u->ID, 'aled08_clic', ['h' => hash('sha256', $j), 'fin' => time() + max(1, (int) $jours) * DAY_IN_SECONDS]);
    return add_query_arg('aled08e_clic', $u->ID . '.' . $j, aled08e_url());
}
add_action('init', function () {
    if (empty($_GET['aled08e_clic'])) return;
    $p = explode('.', preg_replace('/[^A-Za-z0-9.]/', '', (string) wp_unslash($_GET['aled08e_clic'])), 2);
    $uid = (int) ($p[0] ?? 0);
    $c = $uid ? get_user_meta($uid, 'aled08_clic', true) : null;
    $ok = is_array($c) && !empty($c['h']) && (int) ($c['fin'] ?? 0) > time() && isset($p[1]) && hash_equals((string) $c['h'], hash('sha256', $p[1])) && !user_can($uid, 'edit_posts');
    // pas plus de 10 essais par heure et par adresse
    $k = 'aled08_clic_' . md5((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $n = (int) get_transient($k);
    if (!$ok) set_transient($k, $n + 1, HOUR_IN_SECONDS);
    if ($ok && $n < 10 && !is_user_logged_in()) { wp_set_auth_cookie($uid, true); if (function_exists('aled08e_noter_connexion')) aled08e_noter_connexion($uid); }
    wp_safe_redirect(aled08e_url($ok || is_user_logged_in() ? [] : ['connexion' => 'lien']), 303);
    exit;
}, 3);
/* Un changement de mot de passe annule le lien */
add_action('after_password_reset', function ($u) { if ($u instanceof WP_User) delete_user_meta($u->ID, 'aled08_clic'); });
add_action('profile_update', function ($uid, $avant) { $u = get_userdata($uid); if ($u && $avant instanceof WP_User && $u->user_pass !== $avant->user_pass) delete_user_meta($uid, 'aled08_clic'); }, 10, 2);
