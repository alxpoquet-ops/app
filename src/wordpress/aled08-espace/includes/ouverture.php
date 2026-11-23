<?php
/**
 * Les Minis Monstres Espace client : la page d'attente, tant que le site n'est pas ouvert au public.
 *
 * Décision d'Alex (23 novembre 2026) : pas de vente avant d'avoir le SIRET et le médiateur de la consommation.
 * Tant que la case « Site ouvert au public » (Réglages) n'est pas cochée :
 *  - un visiteur voit une page d'attente (code 503 « revenez plus tard », pour que Google patiente sans rien oublier) ;
 *  - un administrateur connecté voit le site normalement, avec un petit bandeau qui le rappelle ;
 *  - restent ouverts : l'espace client (/mon-espace/, pour se connecter et pour les clients déjà là), les pages légales,
 *    la page contact, l'API (connecteurs, Stripe, atelier), l'administration et les tâches planifiées ;
 *  - aucune commande ne peut être passée.
 */
defined('ABSPATH') || exit;

function aled08e_site_ouvert() { return get_option('aled08_site_ouvert', '0') === '1'; }
function aled08e_attente_libre() {
    if (aled08e_site_ouvert() || current_user_can('manage_options')) return true;
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST) || (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST)) return true;
    $chemin = trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/');
    foreach (['mon-espace', 'mentions-legales', 'politique-de-confidentialite', 'conditions-generales', 'contact', 'wp-login.php', 'wp-json'] as $l) {
        if ($chemin === $l || strpos($chemin, $l . '/') === 0) return true;
    }
    return false;
}

/* Avant tout le reste (le formulaire de commande passe en priorité 1) */
add_action('template_redirect', function () {
    if (aled08e_attente_libre()) return;
    status_header(503);
    header('Retry-After: 172800');
    nocache_headers();
    echo aled08e_attente_html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit;
}, 0);

/* Une commande envoyée d'ailleurs que /commander/ est refusée aussi tant que le site est fermé */
add_action('template_redirect', function () {
    if (aled08e_site_ouvert() || current_user_can('manage_options')) return;
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !empty($_POST['aled08_order'])) { wp_safe_redirect(home_url('/'), 303); exit; }
}, 0);

/* Un petit rappel pour l'administrateur, qui voit le site normalement */
add_action('wp_body_open', function () {
    if (aled08e_site_ouvert() || !current_user_can('manage_options')) return;
    echo '<div style="position:sticky;top:0;z-index:9999;background:#FFF1C2;color:#7A5600;font:700 14px/1.4 system-ui,sans-serif;text-align:center;padding:8px 12px;">'
        . 'Site fermé au public : les visiteurs voient la page d’attente. Pour ouvrir : Les Minis Monstres › Réglages › « Site ouvert au public ».</div>';
});

function aled08e_attente_html() {
    $t = get_template_directory_uri() . '/assets';
    $e = function ($s) { return esc_html($s); };
    $nom = function_exists('aled08e_data') ? (string) (aled08e_data()['name'] ?? 'Les Minis Monstres') : 'Les Minis Monstres';
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . $e($nom) . ' : ouverture très bientôt</title><meta name="robots" content="noindex">'
        . '<link rel="icon" href="' . esc_url($t . '/img/logo-192.png') . '">'
        . '<style>'
        . '@font-face{font-family:J;src:url("' . esc_url($t . '/fonts/jakarta-var.woff2') . '") format("woff2");font-weight:200 800;font-display:swap}'
        . ':root{--bg:#FFF8F2;--card:#fff;--ink:#2E2A47;--text:#4B4668;--muted:#6B6789;--line:#EEE6F6;--mint:#7EDDB5;--mint-d:#3FAE82;--lilac:#E8E0FF;--lilac-dd:#5B3FC4}'
        . '@media (prefers-color-scheme:dark){:root{--bg:#16142A;--card:#232040;--ink:#F4F1FF;--text:#CFCBEA;--muted:#A9A4CC;--line:#35305C;--lilac:#2C2752;--lilac-dd:#C8B8FF}}'
        . '*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:var(--bg);color:var(--text);font:400 17px/1.6 J,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}'
        . '.c{max-width:560px;width:100%;background:var(--card);border:2px solid var(--line);border-radius:32px;padding:28px 24px 26px;text-align:center}'
        . '.marque{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:800;font-size:18px;margin-bottom:6px}.marque img{width:44px;height:44px;border-radius:14px}'
        . '.monstre{width:120px;height:120px;margin:8px auto 4px;display:block}'
        . 'h1{margin:0 0 10px;color:var(--ink);font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.02em}'
        . 'mark{color:inherit;background:none;box-shadow:inset 0 -.36em 0 #BFF0DA}'
        . 'p{margin:0 0 14px}.etapes{background:var(--lilac);border-radius:20px;padding:14px 16px;margin:16px 0;text-align:left}'
        . '.etapes p{margin:0 0 6px;font-size:15px}.etapes p:last-child{margin:0}.etapes b{color:var(--ink)}'
        . '.btn{display:inline-block;margin:6px 4px 0;padding:12px 20px;border-radius:999px;background:var(--mint);color:#173D2E;font-weight:800;text-decoration:none;box-shadow:0 4px 0 var(--mint-d)}'
        . '.btn.light{background:transparent;color:var(--lilac-dd);box-shadow:inset 0 0 0 2px var(--line)}'
        . '.pied{margin-top:18px;font-size:13px;color:var(--muted)}.pied a{color:var(--muted)}'
        . '</style></head><body><main class="c">'
        . '<a class="marque" href="' . esc_url(home_url('/')) . '"><img src="' . esc_url($t . '/img/logo-192.png') . '" alt="">' . $e($nom) . '</a>'
        . '<img class="monstre" src="' . esc_url($t . '/img/mail/bricou.png') . '" alt="">'
        . '<h1>On ouvre <mark>très bientôt</mark> !</h1>'
        . '<p>Le site est prêt, la petite bande aussi. Il nous reste les dernières démarches administratives pour vous accueillir dans les règles.</p>'
        . '<div class="etapes"><p><b>En cours :</b> notre numéro SIRET pour cette activité, et l’adhésion à un médiateur de la consommation.</p>'
        . '<p><b>Ensuite :</b> les commandes ouvrent. Revenez dans quelques jours !</p></div>'
        . '<p>Une question, ou envie d’être prévenu de l’ouverture ? Écrivez-nous.</p>'
        . '<a class="btn" href="mailto:contact@les-minis-monstres.fr">contact@les-minis-monstres.fr</a> '
        . '<a class="btn light" href="' . esc_url(home_url('/mon-espace/')) . '">Espace client</a>'
        . '<p class="pied"><a href="' . esc_url(home_url('/mentions-legales/')) . '">Mentions légales</a> · <a href="' . esc_url(home_url('/politique-de-confidentialite/')) . '">Confidentialité</a></p>'
        . '</main></body></html>';
}
