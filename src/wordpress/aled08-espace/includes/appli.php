<?php
/**
 * Les Minis Monstres Espace client : l'application « Les Minis Monstres » (Alex, 26 novembre 2026).
 *
 * Une seule adresse, /appli/, qui s'installe sur le téléphone (application web : manifest + service worker), et que
 * l'application Android (dossier appli/ du dépôt, Capacitor) ouvre telle quelle.
 *  - L'accueil : le point du jour (visiteurs, dernière publication, un conseil), « Mon site » (voir mon site, demander une
 *    modification, écrire à Cerise : l'espace client, le même que sur le site) et « Mes outils ».
 *  - Un seul outil pour commencer : « Publier partout » (Pépite, atelier-outils.php et reseaux.php). Une photo, quelques
 *    mots au clavier ou à la voix, et Pépite écrit et publie sur les réseaux reliés. Texte écrit avec la même clé que Cerise.
 *  - Gratuit avec le forfait Mini : c'est le forfait qui fait l'abonnement (aled08e_appli_mini). Aucun achat dans l'application.
 *  - Une limite par jour (data.json « appli.parJour », 2 par défaut) pour que le coût reste petit.
 *  - Le point du soir : un seul message par jour, vers 18 h 30, jamais le dimanche, seulement s'il y a quelque chose d'utile
 *    (aled08e_appli_point). Le client l'allume ou l'éteint dans l'application. L'envoi sur le téléphone demande Firebase
 *    (option aled08_appli_fcm) : tant qu'il n'est pas réglé, le point se lit sur l'accueil de l'application.
 * Adresses : /appli/ (accueil), /appli/?ecran=publier, /appli/manifest.webmanifest, /appli/sw.js.
 * Sur les autres pages du site, une barre en bas ramène à l'application (seulement dans l'application installée).
 * Réglage : data.json « appli.actif » (src/config.js). Éteinte : /appli/ n'existe pas.
 */
defined('ABSPATH') || exit;

function aled08e_appli_cfg() { return (array) (aled08e_data()['appli'] ?? []) + ['actif' => false, 'parJour' => 2, 'heurePoint' => '18:30']; }
function aled08e_appli_on() { return !empty(aled08e_appli_cfg()['actif']); }
function aled08e_appli_url($ecran = '') { return home_url('/appli/' . ($ecran !== '' ? '?ecran=' . rawurlencode($ecran) : '')); }
/* Vrai pendant que la page de l'application se construit : les liaisons de réseaux y reviennent, l'outil s'y simplifie */
function aled08e_appli_ici($v = null) { static $ici = false; if ($v !== null) $ici = (bool) $v; return $ici; }

/* Le client a-t-il le forfait Mini (actif, ou site en création) ? L'équipe y a toujours accès. Le forfait Autonomie
 * (création seule, sans abonnement) n'ouvre pas l'outil : c'est le forfait Mini qui fait l'abonnement. */
function aled08e_appli_mini($uid) {
    $uid = (int) $uid;
    if (!$uid) return false;
    if (user_can($uid, 'manage_options')) return true;
    $f = aled08e_meta($uid, 'forfait');
    if ($f === '' || aled08e_est_seule($f)) return false;
    $u = get_userdata($uid);
    if (!$u || !aled08e_is_client($u)) return false;
    return function_exists('aled08e_outils_a_un_site') && aled08e_outils_a_un_site($uid);
}

/* ---------- La limite par jour : Pépite prépare N publications par jour et par client (20 pour l'équipe, pour ses essais) ---------- */
function aled08e_appli_jour_max($uid) { return user_can((int) $uid, 'manage_options') ? 20 : max(1, (int) aled08e_appli_cfg()['parJour']); }
function aled08e_appli_jour_fait($uid) {
    $j = get_user_meta((int) $uid, 'aled08_appli_jour', true);
    return is_array($j) && ($j['j'] ?? '') === wp_date('Y-m-d') ? (int) ($j['n'] ?? 0) : 0;
}
function aled08e_appli_jour_reste($uid) { return max(0, aled08e_appli_jour_max($uid) - aled08e_appli_jour_fait($uid)); }
function aled08e_appli_jour_compter($uid) { update_user_meta((int) $uid, 'aled08_appli_jour', ['j' => wp_date('Y-m-d'), 'n' => aled08e_appli_jour_fait($uid) + 1]); }
function aled08e_appli_jour_txt($uid) {
    $max = aled08e_appli_jour_max($uid);
    return 'Pépite a déjà préparé ' . ($max > 1 ? 'vos ' . $max . ' publications' : 'votre publication') . ' d’aujourd’hui. Elle se repose, et revient demain matin !';
}

/* ---------- Le point du jour : seulement des faits, et un conseil. null quand il n'y a rien d'utile à dire ---------- */
function aled08e_appli_conseils() {
    return [
        ['etoile', 'Pépite', 'Une photo prise à la lumière du jour, près d’une fenêtre, donne presque toujours un meilleur résultat qu’au flash.'],
        ['gelee', 'Mirette', 'Les gens regardent surtout leur téléphone le matin avant 9 heures, à midi et le soir après 18 heures : de bons moments pour publier.'],
        ['mascotte', 'Cerise', 'Un client content ? Demandez-lui un avis Google le jour même : c’est là qu’il a le plus envie de le faire.'],
        ['etoile', 'Pépite', 'Montrez les coulisses : l’atelier, la préparation, les mains au travail. C’est ce que les gens préfèrent voir.'],
        ['gelee', 'Mirette', 'Des horaires à jour sur votre site et votre fiche Google évitent bien des déplacements pour rien, et des clients déçus.'],
        ['mascotte', 'Cerise', 'Une seule idée par publication : un produit, une nouveauté ou une date. C’est plus clair, et on s’en souvient.'],
        ['etoile', 'Pépite', 'Une publication par semaine, toutes les semaines, vaut mieux que cinq d’un coup puis plus rien.'],
    ];
}
function aled08e_appli_point($uid) {
    $uid = (int) $uid;
    $lignes = [];
    // les visiteurs du jour (le site du client, s'il est relié)
    if (function_exists('aled08e_stats_lire')) {
        $s = aled08e_stats_lire($uid);
        if (($s['etat'] ?? '') === 'ok' && isset($s['aujourdhui']['visiteurs'])) {
            $n = (int) $s['aujourdhui']['visiteurs'];
            if ($n > 0) $lignes[] = ['users', $n === 1 ? 'Aujourd’hui, 1 visiteur sur votre site.' : 'Aujourd’hui, ' . $n . ' visiteurs sur votre site.'];
        }
    }
    // la dernière publication
    $h = get_user_meta($uid, 'aled08_rs_histo', true);
    $dernier = is_array($h) && $h ? (int) ($h[0]['t'] ?? 0) : 0;
    $rappel = false;
    if ($dernier) {
        $j = (int) floor((time() - $dernier) / DAY_IN_SECONDS);
        if ($j >= 7) { $lignes[] = ['send', 'Votre dernière publication date d’il y a ' . $j . ' jours. Une photo de votre journée ?']; $rappel = true; }
        elseif ($j === 0) $lignes[] = ['check', 'Vous avez publié aujourd’hui. Bravo !'];
    } elseif (aled08e_appli_mini($uid)) { $lignes[] = ['send', 'Vous n’avez pas encore publié avec Pépite. Une photo, quelques mots, et c’est parti.']; $rappel = true; }
    $c = aled08e_appli_conseils();
    $conseil = $c[(int) wp_date('z') % count($c)];
    return ['lignes' => $lignes, 'rappel' => $rappel, 'conseil' => $conseil];
}
/* Le message du soir (une phrase ou deux), ou '' s'il n'y a rien d'utile : on n'envoie pas pour ne rien dire */
function aled08e_appli_point_message($uid) {
    $p = aled08e_appli_point($uid);
    $t = array_map(function ($l) { return $l[1]; }, $p['lignes']);
    return $t ? implode(' ', array_slice($t, 0, 2)) : '';
}
function aled08e_appli_notif_on($uid) { return get_user_meta((int) $uid, 'aled08_appli_notif', true) !== '0'; }
function aled08e_appli_push_pret() { return trim((string) get_option('aled08_appli_fcm', '')) !== ''; }
add_action('wp_ajax_aled08e_appli_notif', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_appli', '_n', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la.'], 403);
    $on = !empty($_POST['on']) && $_POST['on'] !== '0';
    update_user_meta($uid, 'aled08_appli_notif', $on ? '1' : '0');
    wp_send_json_success(['on' => $on]);
});

/* =========================================================================
 *  Les adresses
 * ========================================================================= */
add_action('template_redirect', function () {
    if (!aled08e_appli_on()) return;
    $chemin = trim((string) wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH), '/');
    if ($chemin === 'appli/manifest.webmanifest') { aled08e_appli_manifeste(); exit; }
    if ($chemin === 'appli/sw.js') { aled08e_appli_sw(); exit; }
    if ($chemin !== 'appli') return;
    status_header(200);
    nocache_headers();
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Robots-Tag: noindex, nofollow');
    echo aled08e_appli_page(sanitize_key(wp_unslash($_GET['ecran'] ?? ''))); // phpcs:ignore -- page construite et échappée ci-dessous
    exit;
}, 1);

function aled08e_appli_manifeste() {
    status_header(200);
    header('Content-Type: application/manifest+json; charset=UTF-8');
    header('Cache-Control: public, max-age=3600');
    $t = get_template_directory_uri() . '/assets/img/';
    echo wp_json_encode([
        'id' => '/appli/', 'name' => 'Les Minis Monstres', 'short_name' => 'Minis Monstres', 'lang' => 'fr',
        'description' => 'Votre site et vos outils dans la poche : une photo, quelques mots, et Pépite publie partout.',
        'start_url' => '/appli/?source=ecran', 'scope' => '/', 'display' => 'standalone', 'orientation' => 'portrait',
        'background_color' => '#FFF8F2', 'theme_color' => '#FFF8F2',
        'icons' => [['src' => $t . 'logo-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'], ['src' => $t . 'logo-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any']],
        'shortcuts' => [['name' => 'Publier partout', 'url' => '/appli/?ecran=publier']],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

/* Le service worker : rien n'est gardé, sauf une petite page pour quand le téléphone n'a pas de réseau */
function aled08e_appli_sw() {
    status_header(200);
    header('Content-Type: application/javascript; charset=UTF-8');
    header('Cache-Control: no-cache');
    header('Service-Worker-Allowed: /');
    $hors = '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pas de réseau</title>'
        . '<body style="margin:0;font-family:system-ui,sans-serif;background:#FFF8F2;color:#2e2a47;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px">'
        . '<div><p style="font-size:48px;margin:0">📶</p><h1 style="font-size:22px">Pas de réseau pour l’instant</h1><p>Les petits monstres ont besoin d’internet. Réessayez dès que le téléphone capte.</p>'
        . '<p><button onclick="location.reload()" style="font:inherit;font-weight:700;padding:12px 22px;border:0;border-radius:999px;background:#5b3fc4;color:#fff">Réessayer</button></p></div></body></html>';
    echo "/* Les Minis Monstres : l'application. Rien n'est gardé sur le téléphone, sauf la page « Pas de réseau ». */\n"
        . "var HORS = " . wp_json_encode($hors, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ";\n"
        . "self.addEventListener('install', function () { self.skipWaiting(); });\n"
        . "self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });\n"
        . "self.addEventListener('fetch', function (e) {\n"
        . "  if (e.request.mode !== 'navigate') return;\n"
        . "  e.respondWith(fetch(e.request).catch(function () { return new Response(HORS, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }));\n"
        . "});\n";
}

/* =========================================================================
 *  La barre du bas (l'application, et les autres pages du site quand on est dans l'application)
 * ========================================================================= */
function aled08e_appli_barre($ici) {
    $l = function ($id, $url, $ic, $nom) use ($ici) { return '<a' . ($ici === $id ? ' class="is-on" aria-current="page"' : '') . ' href="' . esc_url($url) . '">' . aled08e_icon($ic) . '<span>' . esc_html($nom) . '</span></a>'; };
    return '<nav class="ap-bas" aria-label="Menu de l’application">' . $l('accueil', aled08e_appli_url(), 'house', 'Accueil') . $l('publier', aled08e_appli_url('publier'), 'send', 'Publier')
        . $l('site', aled08e_url(), 'pencil', 'Mon site') . $l('aide', add_query_arg('bulle', '1', aled08e_url()), 'message-circle', 'Cerise') . '</nav>';
}
function aled08e_appli_barre_css() {
    return '.ap-bas{position:fixed;left:0;right:0;bottom:0;z-index:9990;display:flex;justify-content:space-around;gap:4px;padding:8px 8px calc(8px + env(safe-area-inset-bottom));background:var(--card,#fff);box-shadow:0 -6px 20px rgba(46,42,71,.10)}'
        . '.ap-bas a{flex:1;max-width:150px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:16px;text-decoration:none;color:var(--muted,#6b6789);font-weight:700;font-size:.82rem}'
        . '.ap-bas a svg{width:24px;height:24px}.ap-bas a.is-on{color:var(--ink,#2e2a47);background:var(--butter-soft,#fff3c4)}';
}
/* Sur les pages du site (l'espace client surtout) : la barre n'apparaît que dans l'application installée */
add_action('wp_footer', function () {
    if (!aled08e_appli_on() || !is_user_logged_in()) return;
    $onglet = isset($_GET['bulle']) ? 'aide' : 'site';
    echo '<style>' . aled08e_appli_barre_css() . '.ap-bas[hidden]{display:none}body.ap-dans{padding-bottom:calc(78px + env(safe-area-inset-bottom))}body.ap-dans .lia-flot{bottom:calc(86px + env(safe-area-inset-bottom))}</style>' // phpcs:ignore
        . str_replace('<nav class="ap-bas"', '<nav class="ap-bas" hidden', aled08e_appli_barre($onglet)) // phpcs:ignore
        . '<script>(function(){var d=document,dans=false;try{dans=/LMMAppli/.test(navigator.userAgent)||matchMedia("(display-mode: standalone)").matches||sessionStorage.getItem("lmmAppli")==="1"}catch(e){}'
        . 'if(!dans)return;var n=d.querySelector(".ap-bas");if(n){n.hidden=false;d.body.classList.add("ap-dans")}'
        . 'if(/[?&]bulle=1/.test(location.search))setTimeout(function(){var b=d.querySelector(".lia-flot-btn");if(b&&b.getAttribute("aria-expanded")!=="true")b.click()},600)})();</script>';
}, 50);

/* =========================================================================
 *  La page
 * ========================================================================= */
function aled08e_appli_page($ecran = '') {
    aled08e_appli_ici(true);
    $theme = get_template_directory_uri();
    $f = defined('ALED08E_FILE') ? ALED08E_FILE : dirname(__DIR__) . '/aled08-espace.php';
    $dir = dirname($f);
    $v = function ($nom) use ($dir) { return (string) @filemtime($dir . '/' . $nom); };
    $css = '';
    foreach (['/assets/css/style.css', '/assets/css/espace.css'] as $c) if (file_exists(get_template_directory() . $c)) $css .= '<link rel="stylesheet" href="' . esc_url($theme . $c . '?v=' . filemtime(get_template_directory() . $c)) . '">';
    $uid = get_current_user_id();
    $mini = $uid && aled08e_appli_mini($uid);
    $outil = $mini && function_exists('aled08e_outil_html');
    $ecran = $uid && $ecran === 'publier' ? 'publier' : 'accueil';

    $h = '<!doctype html><html lang="fr" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        . '<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#FFF8F2"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Minis Monstres">'
        . '<title>Les Minis Monstres</title><link rel="manifest" href="' . esc_url(home_url('/appli/manifest.webmanifest')) . '"><link rel="apple-touch-icon" href="' . esc_url($theme . '/assets/img/logo-192.png') . '">'
        . '<script>(function(h){var t;try{t=localStorage.getItem(\'mm-theme\');sessionStorage.setItem(\'lmmAppli\',\'1\')}catch(e){}h.setAttribute(\'data-theme\',t===\'dark\'?\'dark\':\'light\')})(document.documentElement)</script>'
        . $css . (function_exists('aled08e_ao_styles') ? aled08e_ao_styles() : '') . (function_exists('aled08e_kit_styles') ? aled08e_kit_styles() : '') . aled08e_appli_styles()
        . '</head><body class="ap-corps ap-' . esc_attr($ecran) . '">';
    $prenom = $uid && function_exists('aled08e_prenom') ? (string) aled08e_prenom(get_userdata($uid)) : '';
    $h .= '<header class="ap-haut"><a class="ap-logo" href="' . esc_url(aled08e_appli_url()) . '"><img src="' . esc_url($theme . '/assets/img/logo-192.png') . '" width="40" height="40" alt=""><span>Les Minis<b>MONSTRES</b></span></a>'
        . ($uid ? '<span class="ap-bonjour">' . esc_html($prenom !== '' ? 'Bonjour ' . $prenom : 'Bonjour') . '</span>' : '') . '</header><main class="ap-page">';

    if (!$uid) {
        $h .= '<section class="ao c-butter ap-carte"><span class="ap-monstre" aria-hidden="true">' . aled08e_monster('coucou') . '</span>'
            . '<h1>Votre site et vos outils, dans la poche</h1><p>Demandez une modification, écrivez à Cerise, et publiez partout en une photo.</p>'
            . '<form class="form ap-connexion" method="post" action="' . esc_url(site_url('wp-login.php', 'login_post')) . '">'
            . '<div class="field"><label for="ap-id">Votre e-mail</label><input id="ap-id" type="email" name="log" autocomplete="username" required></div>'
            . '<div class="field"><label for="ap-mdp">Votre mot de passe</label><input id="ap-mdp" type="password" name="pwd" autocomplete="current-password" required></div>'
            . '<input type="hidden" name="rememberme" value="forever"><input type="hidden" name="redirect_to" value="' . esc_attr(aled08e_appli_url()) . '">'
            . '<button class="btn btn-primary ao-grand" type="submit">' . aled08e_icon('log-in') . '<span>Me connecter</span></button></form>'
            . '<p class="ap-petit"><a href="' . esc_url(wp_lostpassword_url(aled08e_appli_url())) . '">Mot de passe oublié ?</a></p>'
            . '<p class="ap-petit">Pas encore client ? <a href="' . esc_url(home_url('/tarifs/')) . '">Découvrir Les Minis Monstres</a></p></section>';
    } elseif ($ecran === 'publier') {
        if (!$mini) {
            $h .= '<section class="ao c-butter ap-carte"><span class="ap-monstre" aria-hidden="true">' . aled08e_monster('etoile') . '</span>'
                . '<h1>Publier partout est compris dans le forfait Mini</h1><p>Avec le forfait Mini, Pépite écrit et publie vos photos sur vos réseaux, sans rien payer de plus. Votre compte n’a pas encore le forfait Mini.</p>'
                . '<p class="ol-boutons"><a class="btn btn-primary" href="' . esc_url(home_url('/tarifs/')) . '">Découvrir le forfait Mini</a></p></section>';
        } else {
            $h .= $outil ? aled08e_outil_html($uid, 'publier') : '<p class="esp-warn">Pépite se prépare : revenez dans un instant.</p>';
        }
    } else {
        $h .= aled08e_appli_accueil($uid, $mini);
    }
    $h .= '</main>' . ($uid ? aled08e_appli_barre($ecran) : '');
    if ($outil && $ecran === 'publier') {
        if (file_exists($dir . '/qrcode.js')) $h .= '<script src="' . esc_url(plugins_url('qrcode.js', $f) . '?v=' . $v('qrcode.js')) . '" defer></script>';
        $h .= '<script src="' . esc_url(plugins_url('kit-video.js', $f) . '?v=' . $v('kit-video.js')) . '" defer></script>'
            . '<script src="' . esc_url(plugins_url('kit-publication.js', $f) . '?v=' . $v('kit-publication.js')) . '" defer></script>'
            . '<script src="' . esc_url(plugins_url('outils.js', $f) . '?v=' . $v('outils.js')) . '" defer></script>';
    }
    $h .= '<script src="' . esc_url(plugins_url('appli.js', $f) . '?v=' . $v('appli.js')) . '" defer></script>';
    return $h . '</body></html>';
}

/* L'accueil : le point du jour, Mon site, Mes outils, le point du soir */
function aled08e_appli_accueil($uid, $mini) {
    $p = aled08e_appli_point($uid);
    $site = esc_url_raw(aled08e_meta($uid, 'site'));
    $h = '';
    // le point du jour
    $h .= '<section class="ao c-sky ap-point"><p class="app-sub">' . aled08e_icon('sun') . 'Le point du jour</p>';
    if ($p['lignes']) { $h .= '<ul class="ap-faits">'; foreach ($p['lignes'] as $l) $h .= '<li>' . aled08e_icon($l[0]) . '<span>' . esc_html($l[1]) . '</span></li>'; $h .= '</ul>'; }
    $h .= '<div class="ap-conseil"><span class="ap-mini" aria-hidden="true">' . aled08e_monster($p['conseil'][0]) . '</span><p><strong>Le conseil de ' . esc_html($p['conseil'][1]) . '</strong>' . esc_html($p['conseil'][2]) . '</p></div></section>';
    // les deux moitiés : Mon site, Mes outils
    $tuile = function ($url, $ic, $titre, $sous, $ext = false) { return '<a class="ap-tuile" href="' . esc_url($url) . '"' . ($ext ? ' target="_blank" rel="noopener"' : '') . '>' . aled08e_icon($ic) . '<span><strong>' . esc_html($titre) . '</strong><small>' . esc_html($sous) . '</small></span>' . aled08e_icon('chevron-right') . '</a>'; };
    $h .= '<div class="ap-deux"><section class="ao c-mint ap-bloc"><h2>' . aled08e_icon('globe') . 'Mon site</h2>'
        . ($site !== '' ? $tuile($site, 'eye', 'Voir mon site', preg_replace('#^https?://(www\.)?|/$#', '', $site), true) : '')
        . $tuile(aled08e_url(), 'pencil', 'Demander une modification', 'Un texte, une photo, un horaire à changer')
        . $tuile(add_query_arg('bulle', '1', aled08e_url()), 'message-circle', 'Écrire à Cerise', 'Une question ? Elle répond tout de suite')
        . '</section><section class="ao c-butter ap-bloc"><h2>' . aled08e_icon('toolbox') . 'Mes outils</h2>';
    if ($mini) {
        $reste = aled08e_appli_jour_reste($uid);
        $h .= '<a class="ap-outil" href="' . esc_url(aled08e_appli_url('publier')) . '"><span class="ap-mini" aria-hidden="true">' . aled08e_monster('etoile') . '</span><span><strong>Publier partout</strong><small>Une photo, quelques mots : Pépite écrit et publie.</small></span></a>'
            . '<a class="btn btn-primary ao-grand" href="' . esc_url(aled08e_appli_url('publier')) . '">' . aled08e_icon('camera') . '<span>Nouvelle publication</span></a>'
            . '<p class="ap-petit">' . esc_html($reste > 0 ? ($reste > 1 ? 'Encore ' . $reste . ' publications aujourd’hui.' : 'Encore 1 publication aujourd’hui.') : 'Pépite revient demain matin.') . '</p>';
    } else {
        $h .= '<p>Publier partout est compris dans le forfait Mini : Pépite écrit et publie vos photos sur vos réseaux.</p><a class="btn btn-light" href="' . esc_url(home_url('/tarifs/')) . '">Découvrir le forfait Mini</a>';
    }
    $h .= '</section></div>';
    // le point du soir : montré quand l'envoi sur le téléphone est réglé (et toujours à l'équipe, pour voir)
    if (aled08e_appli_push_pret() || user_can($uid, 'manage_options')) {
        $on = aled08e_appli_notif_on($uid);
        $ex = aled08e_appli_point_message($uid);
        $h .= '<section class="ao c-lilac ap-soir" data-ap-notif data-ajax="' . esc_url(admin_url('admin-ajax.php')) . '" data-nonce="' . esc_attr(wp_create_nonce('aled08e_appli')) . '">'
            . '<div class="ap-soir-tete"><h2>' . aled08e_icon('bell') . 'Le point du soir</h2><label class="ap-inter"><input type="checkbox" data-ap-notif-on' . ($on ? ' checked' : '') . '><span class="sr-only">Recevoir le point du soir</span><i aria-hidden="true"></i></label></div>'
            . '<p class="ap-petit">Un seul message par jour, vers ' . esc_html(str_replace(':', ' h ', (string) aled08e_appli_cfg()['heurePoint'])) . ', jamais le dimanche, et seulement quand il y a quelque chose d’utile : vos visiteurs, un rappel pour publier, un conseil.</p>'
            . ($ex !== '' ? '<p class="ap-exemple"><strong>Ce soir, par exemple :</strong> ' . esc_html($ex) . '</p>' : '')
            . (aled08e_appli_push_pret() ? '' : '<p class="ap-petit"><em>Pour l’équipe : l’envoi sur le téléphone attend le réglage Firebase. En attendant, le point se lit ici.</em></p>')
            . '<p class="ol-etat" data-ap-notif-etat role="status" aria-live="polite"></p></section>';
    }
    return $h;
}

function aled08e_appli_styles() {
    return '<style id="aled08e-appli">'
        . '.ap-corps{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);padding-bottom:calc(84px + env(safe-area-inset-bottom))}'
        . '.ap-haut{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:640px;margin:0 auto;padding:calc(10px + env(safe-area-inset-top)) 16px 10px;background:var(--bg)}'
        . '.ap-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:900;line-height:1}.ap-logo img{border-radius:12px}.ap-logo b{display:block;font-size:.8em;letter-spacing:.08em}'
        . '.ap-bonjour{font-weight:700;color:var(--muted,#6b6789)}'
        . '.ap-page{max-width:640px;margin:0 auto;padding:4px 16px 24px}.ap-page .ao{margin-bottom:16px}'
        . '.ap-carte{text-align:center}.ap-carte h1{font-size:1.45rem;margin:.4em 0}.ap-monstre{display:inline-block;width:96px}.ap-monstre svg{width:100%;height:auto}'
        . '.ap-connexion{text-align:left;margin-top:12px}.ap-connexion .btn,.ap-bloc .btn{width:100%;justify-content:center}.ap-petit{font-size:.92rem;margin:.7em 0 0;color:var(--muted,#6b6789)}'
        . '.ap-mini{flex:0 0 52px;width:52px}.ap-mini svg{width:100%;height:auto;display:block}'
        . '.ap-point .app-sub,.ap-bloc h2,.ap-soir h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:1.1rem}.ap-bloc h2 svg,.ap-soir h2 svg,.ap-point .app-sub svg{width:22px;height:22px}'
        . '.ap-faits{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:8px}.ap-faits li{display:flex;gap:10px;align-items:flex-start;font-weight:700}.ap-faits svg{flex:0 0 22px;width:22px;height:22px;margin-top:2px}'
        . '.ap-conseil{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:18px;background:var(--bg)}.ap-conseil p{margin:0}.ap-conseil strong{display:block}'
        . '.ap-deux{display:grid;gap:0}.ap-tuile{display:flex;align-items:center;gap:12px;padding:12px;margin:0 0 8px;border-radius:18px;background:var(--bg);text-decoration:none;color:var(--ink);min-height:56px}'
        . '.ap-tuile>svg{flex:0 0 24px;width:24px;height:24px}.ap-tuile>svg:last-child{opacity:.5}.ap-tuile span{flex:1;min-width:0}.ap-tuile strong{display:block}.ap-tuile small{display:block;color:var(--muted,#6b6789);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
        . '.ap-outil{display:flex;align-items:center;gap:12px;margin:0 0 12px;text-decoration:none;color:var(--ink)}.ap-outil strong{display:block;font-size:1.1rem}.ap-outil small{color:var(--muted,#6b6789)}'
        . '.ap-soir-tete{display:flex;align-items:center;justify-content:space-between;gap:12px}.ap-soir h2{margin:0}'
        . '.ap-inter{position:relative;display:inline-block;width:54px;height:32px;cursor:pointer}.ap-inter input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}'
        . '.ap-inter i{position:absolute;inset:0;border-radius:999px;background:#c9c5dc;transition:background .2s}.ap-inter i:after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;transition:transform .2s}'
        . '.ap-inter input:checked+span+i{background:#5b3fc4}.ap-inter input:checked+span+i:after{transform:translateX(22px)}.ap-inter input:focus-visible+span+i{outline:3px solid #5b3fc4;outline-offset:2px}'
        . '.ap-exemple{margin:.8em 0 0;padding:10px 12px;border-radius:14px;background:var(--bg)}'
        . '.ap-micro{display:flex;align-items:center;gap:8px;margin:6px 0 0;flex-wrap:wrap}.ap-micro .btn{gap:6px}.ap-micro .btn.is-rec{background:#c0392b;color:#fff;border-color:#c0392b}.ap-micro small{color:var(--muted,#6b6789)}'
        // dans l'application, Publier partout va à l'essentiel
        . '.ap-publier .ao-court,.ap-publier [data-ao-kit-tel],.ap-publier .ao-aussi,.ap-publier .ao-autres,.ap-publier .rs-liste .rs-ligne:not(.is-on):not(:has(.btn)){display:none!important}'
        . aled08e_appli_barre_css()
        . '@media (prefers-reduced-motion:reduce){.ap-inter i,.ap-inter i:after{transition:none}}'
        . '</style>';
}
