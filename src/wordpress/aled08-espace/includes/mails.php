<?php
/**
 * Les Minis Monstres Espace client : tous les e-mails du site aux couleurs du site (clair, pastel, petits monstres).
 *  - l'expéditeur n'est plus « WordPress » mais « Les Minis Monstres » ;
 *  - un e-mail écrit en texte simple est habillé (logo, carte sombre, liens en boutons), avec sa version texte gardée ;
 *  - la connexion en un clic : un lien personnel, valable quelques jours, qui ouvre l'espace sans taper le mot de passe.
 */
defined('ABSPATH') || exit;

function aled08e_mail_from() { return function_exists('aled08e_bienvenue_expediteur') ? aled08e_bienvenue_expediteur() : 'contact@lesminismonstres.fr'; }
add_filter('wp_mail_from_name', function ($n) { return (string) $n === '' || strcasecmp((string) $n, 'WordPress') === 0 ? 'Les Minis Monstres' : $n; }, 20);
add_filter('wp_mail_from', function ($f) { return stripos((string) $f, 'wordpress@') === 0 ? aled08e_mail_from() : $f; }, 20);

/* Les petits monstres en image (les messageries n'affichent pas les dessins vectoriels) */
function aled08e_mail_monstre($nom, $taille = 72) {
    $ok = ['mascotte', 'ravie', 'clin', 'bricou', 'mochi', 'gelee', 'etoile', 'champi', 'dino', 'chaton'];
    if (!in_array($nom, $ok, true)) $nom = 'mascotte';
    return '<img src="' . esc_url(get_template_directory_uri() . '/assets/img/mail/' . $nom . '.png') . '" width="' . (int) $taille . '" height="' . (int) $taille . '" alt="" style="display:inline-block;border:0;width:' . (int) $taille . 'px;height:' . (int) $taille . 'px;">';
}
/* Une carte pastel, comme sur le site : rose, lilas, menthe, beurre, pêche, ciel */
function aled08e_mail_carte($teinte, $contenu, $monstre = '') {
    $t = ['rose' => ['#FFD9E7', '#F27BA8'], 'lilas' => ['#E8E0FF', '#8C6CF2'], 'menthe' => ['#D5F5E8', '#34B27F'], 'beurre' => ['#FFF1C2', '#F2B83A'], 'peche' => ['#FFE4D6', '#FF8F5E'], 'ciel' => ['#DDEEFF', '#5AA2F0']][$teinte] ?? ['#F7F2FF', '#E3D9FB'];
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:' . $t[0] . ';border:2px solid ' . $t[1] . ';border-radius:24px;"><tr>'
        . '<td style="padding:20px 22px;vertical-align:top;">' . $contenu . '</td>'
        . ($monstre !== '' ? '<td width="76" style="padding:14px 14px 14px 0;vertical-align:bottom;">' . aled08e_mail_monstre($monstre, 64) . '</td>' : '')
        . '</tr></table>';
}
function aled08e_mail_etiquette($texte, $couleur = '#A3305F') { return '<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:' . $couleur . ';">' . esc_html($texte) . '</p>'; }
/* Les e-mails écrits avant la nouvelle charte (fond sombre) passent aux couleurs claires du site */
function aled08e_mail_clair($html) {
    return strtr((string) $html, [
        'background:#16142A' => 'background:#FFF8F2', 'background:#232040' => 'background:#FFFFFF', 'background:#1E3A32' => 'background:#D5F5E8', 'background:#3A2333' => 'background:#FFD9E7',
        'background:#7BDDB1' => 'background:#7EDDB5', 'solid #7BDDB1' => 'solid #34B27F', 'solid #FF8EBF' => 'solid #F27BA8',
        'color:#16142A' => 'color:#2E2A47', 'color:#FFFFFF' => 'color:#2E2A47', 'color:#ECE9FF' => 'color:#4B4668', 'color:#CFCBEA' => 'color:#4B4668',
        'color:#7BDDB1' => 'color:#176A4C', 'color:#A9D9C5' => 'color:#176A4C', 'color:#FF8EBF' => 'color:#A3305F', 'color:#F3C4DA' => 'color:#A3305F',
        'color:#8B86B3' => 'color:#6B6789', 'color:#FFD36E' => 'color:#7A5600', 'content="dark"' => 'content="light"',
    ]);
}
/* L'enveloppe commune : le logo et le nom mènent au site, la petite bande en haut et en bas */
function aled08e_mail_coque($titre, $contenu, $apercu = '') {
    $site = home_url('/');
    $logo = get_template_directory_uri() . '/assets/img/logo-192.png';
    $bande = aled08e_mail_monstre('bricou', 46) . '&nbsp;' . aled08e_mail_monstre('mochi', 46) . '&nbsp;' . aled08e_mail_monstre('gelee', 46) . '&nbsp;' . aled08e_mail_monstre('etoile', 46) . '&nbsp;' . aled08e_mail_monstre('champi', 46);
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>' . esc_html($titre) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#FFF8F2;">'
        . ($apercu !== '' ? '<div style="display:none;max-height:0;overflow:hidden;">' . esc_html($apercu) . '</div>' : '')
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F2;"><tr><td align="center" style="padding:22px 12px 28px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;font-family:\'Plus Jakarta Sans\',Arial,Helvetica,sans-serif;color:#4B4668;">'
        // l'en-tête : le logo et le nom sur deux lignes, comme sur le site
        . '<tr><td align="center" style="padding:4px 0 14px;"><a href="' . esc_url($site) . '" style="text-decoration:none;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="padding-right:10px;"><img src="' . esc_url($logo) . '" width="52" height="52" alt="" style="display:block;border:0;border-radius:16px;"></td>'
        . '<td style="text-align:left;line-height:1;"><span style="display:block;font-size:17px;font-weight:bold;color:#2E2A47;">Les Minis</span><span style="display:block;margin-top:3px;font-size:13px;font-weight:bold;letter-spacing:.24em;color:#F27BA8;">MONSTRES</span></td>'
        . '</tr></table></a></td></tr>'
        // la carte blanche, avec un liseré pastel en haut
        . '<tr><td style="background:#FFFFFF;border:2px solid #EEE6F6;border-radius:30px;overflow:hidden;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:8px;line-height:8px;font-size:0;background:#FFD9E7;border-radius:28px 28px 0 0;">&nbsp;</td></tr>'
        . '<tr><td style="padding:26px 22px 24px;">' . aled08e_mail_clair($contenu) . '</td></tr></table></td></tr>'
        // la petite bande, puis le pied
        . '<tr><td align="center" style="padding:20px 10px 0;">' . $bande . '</td></tr>'
        . '<tr><td align="center" style="padding:10px 10px 0;font-size:12px;line-height:1.6;color:#6B6789;"><a href="' . esc_url($site) . '" style="color:#6B6789;text-decoration:none;"><b style="color:#2E2A47;">Les Minis Monstres</b>, sites internet pour artisans et commerçants.</a></td></tr>'
        . '</table></td></tr></table></body></html>';
}
function aled08e_mail_bouton($url, $texte, $fond = '#7EDDB5') {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;"><tr><td style="border-radius:999px;background:' . $fond . ';box-shadow:0 4px 0 #3FAE82;"><a href="' . esc_url($url) . '" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:bold;color:#2E2A47;text-decoration:none;">' . esc_html($texte) . '</a></td></tr></table>';
}
/* Un texte simple devient un bel e-mail : paragraphes, et chaque adresse seule sur sa ligne devient un bouton */
function aled08e_mail_habiller($sujet, $texte) {
    $h = '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#2E2A47;"><a href="' . esc_url(home_url('/')) . '" style="color:#2E2A47;text-decoration:none;">' . esc_html($sujet) . '</a></h1>';
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
