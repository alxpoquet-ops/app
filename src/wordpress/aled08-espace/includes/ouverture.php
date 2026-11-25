<?php
/**
 * Les Minis Monstres Espace client : la page d'attente, tant que le site n'est pas ouvert au public.
 *
 * Décision d'Alex (23 novembre 2026) : pas de vente avant d'avoir le SIRET et le médiateur de la consommation,
 * et rien du site visible pour un visiteur d'ici là.
 * Tant que la case « Site ouvert au public » (Réglages) n'est pas cochée :
 *  - un visiteur voit une page d'attente (code 503 « revenez plus tard », pour que Google patiente sans rien oublier) ;
 *  - /mon-espace/ montre seulement un formulaire de connexion, dans le même décor (sans le menu du site) ;
 *    un client connecté (Flore et Chenilles) garde son espace ; un administrateur connecté voit tout le site, avec un bandeau ;
 *  - les pages légales s'affichent seules, dans le même décor ;
 *  - l'API (connecteurs, Stripe, atelier), l'administration et les tâches planifiées marchent normalement ;
 *  - aucune commande ne peut être passée.
 */
defined('ABSPATH') || exit;

function aled08e_site_ouvert() { return get_option('aled08_site_ouvert', '0') === '1'; }

/* Les ventes (décision d'Alex, 24 novembre 2026) : le site s'ouvre en entier, mais rien ne s'achète tant que la case
 * « Ventes ouvertes » (Réglages) n'est pas cochée (SIRET et médiateur en cours). Tous les boutons d'achat sont grisés
 * (formulaire de commande, extras, outils : tout bouton marqué data-achat) et le serveur refuse de créer un paiement Stripe
 * (aled08e_stripe_request) ou une commande. Un administrateur connecté peut acheter quand même, pour tester. */
function aled08e_ventes_ouvertes() { return get_option('aled08_ventes_ouvertes', '0') === '1' || current_user_can('manage_options'); }
function aled08e_ventes_message() { return 'Les commandes ouvrent très bientôt : quelques démarches administratives à finir. Revenez nous voir !'; }

/* Un formulaire de commande envoyé quand même (page gardée en cache, script désactivé) : refusé avant tout traitement */
add_action('template_redirect', function () {
    if (aled08e_ventes_ouvertes() || ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08_order'])) return;
    wp_safe_redirect(add_query_arg('ventes', 'bientot', home_url('/creer-mon-site/')), 303);
    exit;
}, 0);

/* Les boutons d'achat grisés, pour un visiteur ou un client tant que les ventes sont fermées */
add_filter('body_class', function ($c) { if (!aled08e_ventes_ouvertes()) $c[] = 'lmm-ventes-fermees'; return $c; });
add_action('wp_footer', function () {
    if (aled08e_ventes_ouvertes()) return;
    $msg = esc_js('Les commandes ouvrent très bientôt');
    echo '<style>.lmm-ventes-fermees [data-achat],.lmm-ventes-fermees .lmm-achat-off{opacity:.55!important;filter:grayscale(1)!important;cursor:not-allowed!important;pointer-events:none!important}'
        . '.lmm-bientot{display:block;margin:.6em 0 0;padding:.55em .9em;border-radius:14px;background:#FFF1C2;color:#7A5600;font-weight:800;font-size:.92rem;text-align:center}</style>'
        . '<script>(function(){var m="' . $msg . '";function off(b){if(b.dataset.lmmOff)return;b.dataset.lmmOff=1;b.classList.add("lmm-achat-off");b.setAttribute("aria-disabled","true");if(b.tagName==="BUTTON"||b.tagName==="INPUT")b.disabled=true;if(b.tagName==="A"){b.removeAttribute("href");b.setAttribute("role","link");}var n=document.createElement("span");n.className="lmm-bientot";n.textContent=m;b.insertAdjacentElement("afterend",n);}'
        . 'function tout(){document.querySelectorAll("[data-achat],form input[name=aled08_order]").forEach(function(e){if(e.tagName==="INPUT"){var f=e.form;if(f){f.addEventListener("submit",function(ev){ev.preventDefault();},true);f.querySelectorAll("button[type=submit],input[type=submit]").forEach(off);}}else off(e);});}'
        . 'tout();new MutationObserver(tout).observe(document.body,{childList:true,subtree:true});})();</script>';
}, 99);

/* Ce qu'on montre à cette requête : '' (le site normal), 'attente', 'connexion' ou 'page' (une page légale) */
function aled08e_attente_mode() {
    if (aled08e_site_ouvert() || current_user_can('manage_options')) return '';
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST) || (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST)) return '';
    $chemin = trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/');
    if ($chemin === 'wp-login.php' || strpos($chemin, 'wp-json') === 0) return '';
    if ($chemin === 'mon-espace' || strpos($chemin, 'mon-espace/') === 0) {
        if (is_user_logged_in()) return ''; // un client déjà là garde son espace
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !empty($_POST['aled08_login'])) return ''; // la connexion elle-même
        return 'connexion';
    }
    foreach (['mentions-legales', 'politique-de-confidentialite', 'conditions-generales'] as $l) if ($chemin === $l) return 'page';
    return 'attente';
}

/* Avant tout le reste (le formulaire de commande et la connexion passent en priorité 1) */
add_action('template_redirect', function () {
    $mode = aled08e_attente_mode();
    if ($mode === '') return;
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !empty($_POST['aled08_order'])) { wp_safe_redirect(home_url('/'), 303); exit; } // aucune commande
    nocache_headers();
    if ($mode === 'attente') { status_header(503); header('Retry-After: 172800'); }
    else status_header(200);
    $page = null;
    if ($mode === 'page') $page = get_page_by_path(trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/'));
    echo aled08e_attente_html($mode, $page); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit;
}, 0);

/* Un petit rappel pour l'administrateur, qui voit le site normalement */
add_action('wp_body_open', function () {
    if (current_user_can('manage_options') && aled08e_site_ouvert() && get_option('aled08_ventes_ouvertes', '0') !== '1') {
        echo '<div style="position:sticky;top:0;z-index:9999;background:#FFF1C2;color:#7A5600;font:700 14px/1.4 system-ui,sans-serif;text-align:center;padding:8px 12px;">'
            . 'Ventes fermées : les visiteurs voient les boutons d’achat grisés. Vous, connecté, pouvez acheter pour tester. Pour ouvrir : Réglages › « Ventes ouvertes ».</div>';
        return;
    }
    if (aled08e_site_ouvert() || !current_user_can('manage_options')) return;
    echo '<div style="position:sticky;top:0;z-index:9999;background:#FFF1C2;color:#7A5600;font:700 14px/1.4 system-ui,sans-serif;text-align:center;padding:8px 12px;">'
        . 'Site fermé au public : les visiteurs voient la page d’attente. Pour ouvrir : Les Minis Monstres › Réglages › « Site ouvert au public ».</div>';
});

function aled08e_attente_html($mode = 'attente', $page = null) {
    $t = get_template_directory_uri() . '/assets';
    $e = function ($s) { return esc_html($s); };
    $nom = 'Les Minis Monstres';
    $img = function ($n, $w) use ($t) { return '<img src="' . esc_url($t . '/img/mail/' . $n . '.png') . '" width="' . $w . '" height="' . $w . '" alt="" loading="eager">'; };
    $titre = ['attente' => $nom . ' : ouverture très bientôt', 'connexion' => 'Espace client | ' . $nom, 'page' => ($page ? get_the_title($page) : 'Informations') . ' | ' . $nom][$mode] ?? $nom;

    $css = '@font-face{font-family:J;src:url("' . esc_url($t . '/fonts/jakarta-var.woff2') . '") format("woff2");font-weight:200 800;font-display:swap}'
        . ':root{--bg:#FFF8F2;--card:#fff;--ink:#2E2A47;--text:#4B4668;--muted:#6B6789;--line:#EEE6F6;--mint:#7EDDB5;--mint-d:#3FAE82;--lilac:#E8E0FF;--lilac-dd:#5B3FC4;--peach:#FFE4D6;--field:#fff}'
        . '@media (prefers-color-scheme:dark){:root{--bg:#16142A;--card:#232040;--ink:#F4F1FF;--text:#CFCBEA;--muted:#A9A4CC;--line:#35305C;--lilac:#2C2752;--lilac-dd:#C8B8FF;--peach:#3A2A33;--field:#1B1834}}'
        . '*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:var(--bg);color:var(--text);font:400 17px/1.6 J,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}'
        . '.c{max-width:600px;width:100%;background:var(--card);border:2px solid var(--line);border-radius:32px;padding:28px 22px 26px;text-align:center}'
        . '.marque{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:800;font-size:18px;margin-bottom:4px}.marque img{width:44px;height:44px;border-radius:14px}'
        . 'h1{margin:6px 0 10px;color:var(--ink);font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.02em}'
        . 'h2{margin:0 0 6px;color:var(--ink);font-size:19px;line-height:1.3;font-weight:800}'
        . 'mark{color:inherit;background:none;box-shadow:inset 0 -.36em 0 #BFF0DA}@media (prefers-color-scheme:dark){mark{box-shadow:inset 0 -.36em 0 #2E6B55}}'
        . 'p{margin:0 0 14px}a{color:var(--lilac-dd)}'
        . '.bande{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 10px;margin:14px 0 6px}'
        . '.m{width:92px;font-size:12px;line-height:1.3;color:var(--muted)}.m img{display:block;margin:0 auto 4px;width:64px;height:64px;animation:bob 3s ease-in-out infinite}.m b{display:block;color:var(--ink);font-size:13px}'
        . '.m:nth-child(2) img{animation-delay:.4s}.m:nth-child(3) img{animation-delay:.8s}.m:nth-child(4) img{animation-delay:1.2s}.m:nth-child(5) img{animation-delay:1.6s}'
        . '@keyframes bob{50%{transform:translateY(-6px)}}@media (prefers-reduced-motion:reduce){.m img{animation:none}}'
        . '.bloc{border-radius:22px;padding:16px;margin:16px 0;text-align:left}.bloc p{margin:0 0 8px;font-size:15px}.bloc p:last-child{margin:0}.bloc b{color:var(--ink)}'
        . '.concept{background:var(--peach)}.slogan{margin:6px 0 18px;color:var(--ink);font-size:22px;line-height:1.3;font-weight:800;letter-spacing:-.01em}.etapes{background:var(--lilac)}'
        . '.btn{display:inline-block;margin:6px 4px 0;padding:12px 20px;border:0;border-radius:999px;background:var(--mint);color:#173D2E;font:800 16px/1.3 J,system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 0 var(--mint-d);cursor:pointer;max-width:100%;overflow-wrap:anywhere}'
        . '.btn.light{background:transparent;color:var(--lilac-dd);box-shadow:inset 0 0 0 2px var(--line)}'
        . '.pied{margin-top:18px;font-size:13px;color:var(--muted)}.pied a{color:var(--muted)}'
        . 'form{text-align:left;margin:10px 0 0}label{display:block;font-weight:700;color:var(--ink);font-size:15px;margin:12px 0 4px}'
        . 'input[type=email],input[type=text],input[type=password]{width:100%;padding:12px 14px;border:2px solid var(--line);border-radius:14px;background:var(--field);color:var(--ink);font:500 16px J,system-ui,sans-serif}'
        . '.check{display:flex;gap:8px;align-items:center;font-weight:500;font-size:14px;color:var(--text)}'
        . '.alerte{background:#FFD9E7;color:#A3305F;border-radius:14px;padding:10px 14px;font-weight:700;font-size:14px;margin:10px 0}'
        . '.legal{text-align:left;font-size:15px}.legal h1{text-align:left;font-size:24px}.legal h2,.legal h3{margin:18px 0 6px}.legal ul{padding-left:20px}';

    $haut = '<a class="marque" href="' . esc_url(home_url('/')) . '"><img src="' . esc_url($t . '/img/logo-192.png') . '" alt="">' . $e($nom) . '</a>';
    $pied = '<p class="pied"><a href="' . esc_url(home_url('/')) . '">Accueil</a> · <a href="' . esc_url(home_url('/mentions-legales/')) . '">Mentions légales</a> · <a href="' . esc_url(home_url('/politique-de-confidentialite/')) . '">Confidentialité</a> · <a href="' . esc_url(home_url('/mon-espace/')) . '">Espace client</a></p>';

    if ($mode === 'connexion') {
        $erreur = isset($_GET['connexion']) ? '<p class="alerte" role="alert">Adresse e-mail ou mot de passe incorrect. Réessayez.</p>' : '';
        $envoye = isset($_GET['mdp']) ? '<p class="alerte" role="status" style="background:#D5F5E8;color:#176A4C">Si cette adresse correspond à un compte, un e-mail vient de partir pour choisir un nouveau mot de passe.</p>' : '';
        $corps = $haut . '<div class="bande" aria-hidden="true"><div class="m">' . $img('mascotte', 64) . '</div></div>'
            . '<h1>Espace client</h1><p>Connectez-vous pour retrouver votre site et vos demandes.</p>' . $erreur . $envoye
            . '<form method="post" action="' . esc_url(home_url('/mon-espace/')) . '">'
            . '<input type="hidden" name="aled08_login" value="1">'
            . '<label for="l-log">Adresse e-mail</label><input id="l-log" name="log" type="text" autocomplete="username" required>'
            . '<label for="l-pwd">Mot de passe</label><input id="l-pwd" name="pwd" type="password" autocomplete="current-password" required>'
            . '<label class="check"><input type="checkbox" name="rememberme" value="forever"> Rester connecté</label>'
            . '<p style="text-align:center;margin:16px 0 0"><button class="btn" type="submit">Se connecter</button></p></form>'
            . '<p style="margin:14px 0 0;font-size:14px"><a href="' . esc_url(wp_lostpassword_url(home_url('/mon-espace/?mdp=envoye'))) . '">Mot de passe oublié ?</a></p>' . $pied;
    } elseif ($mode === 'page') {
        $contenu = $page ? apply_filters('the_content', $page->post_content) : '<p>Cette page n’est pas disponible.</p>';
        $corps = $haut . '<div class="legal">' . ($page ? '<h1>' . $e(get_the_title($page)) . '</h1>' : '') . wp_kses_post($contenu) . '</div>' . $pied;
    } else {
        $bande = [['mascotte', 'Cerise', 'la secrétaire'], ['bricou', 'Bricou', 'le constructeur'], ['gelee', 'Mirette', 'la visibilité'], ['mochi', 'Mochi', 'l’organisateur'], ['etoile', 'Pépite', 'les extras']];
        $corps = $haut
            . '<div class="bande" aria-hidden="true">' . implode('', array_map(function ($b) use ($img, $e) { return '<div class="m">' . $img($b[0], 64) . '<b>' . $e($b[1]) . '</b>' . $e($b[2]) . '</div>'; }, $bande)) . '</div>'
            . '<h1>On ouvre <mark>très bientôt</mark> !</h1>'
            . '<p>La petite bande se prépare : encore quelques démarches administratives, et on vous accueille.</p>'
            . '<div class="bloc concept"><h2>Le concept</h2>'
            . '<p><b>Être vu sur internet, sans se ruiner.</b> On crée le site des artisans, des commerçants et des indépendants, à petit prix.</p>'
            . '<p>L’accueil, la présentation, les services, la galerie, le contact… Votre site est en ligne <b>en quelques heures</b>, avec vos textes et vos photos.</p>'
            . '<p>Ensuite, on s’occupe de tout : l’hébergement, la sécurité, les mises à jour et vos changements.</p></div>'
            . '<p class="slogan">Vous vous occupez de votre activité,<br><mark>on s’occupe de vous faire voir.</mark></p>'
            . '<div class="bloc etapes"><p><b>Bientôt :</b> les commandes ouvrent dans quelques jours. Revenez nous voir !</p></div>'
            . '<p>Une question, ou envie d’être prévenu de l’ouverture ? Écrivez-nous.</p>'
            . '<a class="btn" href="mailto:contact@les-minis-monstres.fr">contact@les-minis-monstres.fr</a>'
            . $pied;
    }
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . $e($titre) . '</title><meta name="robots" content="noindex"><link rel="icon" href="' . esc_url($t . '/img/logo-192.png') . '">'
        . '<style>' . $css . '</style></head><body><main class="c">' . $corps . '</main></body></html>';
}
