#!/usr/bin/env python3
"""
Exporte le site généré (dist/) vers WordPress :
  - wp-export/aled08/          : thème WordPress « ALED08 » (styles, scripts, en-tête, pied de page, formulaires)
  - wp-export/aled08-import/   : extension d'import à usage unique (crée les pages, retire l'ancien site, règle WordPress)
  - wp-export/aled08-espace/   : extension « Les Minis Monstres Espace client » (src/wordpress/aled08-espace + données)
  - wp-export/alexlia-connecteur/ : extension à installer sur chaque site client (Cerise y travaille)
  - wp-export/alexlia-sdk/     : kit Claude (composer install), chargé seulement quand Cerise travaille
  - wp-export/*.zip            : les archives prêtes à installer

Usage : node build.js && python3 scripts/wp-export.py
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(ROOT, 'wp-export')
THEME = 'aled08'
THEME_URI = '/wp-content/themes/' + THEME
def _config(expr):
    return subprocess.run(['node', '-e', 'const c=require("./src/config.js");console.log(' + expr + ')'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
SITE = _config('c.site.url')  # le domaine du site vient de src/config.js (site.url)
OLD_DOMAIN = _config('c.site.ancienDomaine || ""')  # l'ancien domaine, renvoyé vers le nouveau
FORM_RECIPIENT = 'alx.poquet@gmail.com'
# Anciennes adresses (ancien site d'électricien, anciennes pages du site ALED08) : redirigées vers l'accueil,
# sauf cas particuliers. Les clés de OLD_TARGETS sont toujours redirigées, même absentes de wp-old-paths.txt.
OLD_PATHS_FILE = os.path.join(ROOT, 'scripts', 'wp-old-paths.txt')
OLD_TARGETS = {'/devis/': '/contact/', '/prestations/': '/creer-mon-site/', '/blog/': '/', '/comparatif-shopify/': '/comparatif/', '/nos-outils/': '/outils/', '/forfaits/': '/tarifs/', '/en/forfaits/': '/en/tarifs/', '/mini-tuto/appel-avec-alex/': '/mini-tuto/questionnaire-de-creation/', '/fidelite/': '/parrainage/'}
# 24 novembre 2026, fin de soirée : les outils sont mis de côté (config.outilsOffre.actif = false), on se concentre sur les sites.
# Tant que la page /outils/ n'est pas construite, ses adresses mènent à « Créer mon site » ; quand elle revient, elle est dans
# les pages exportées et la redirection saute toute seule (redirects()).
OLD_TARGETS.update({'/outils/': '/creer-mon-site/', '/en/outils/': '/creer-mon-site/'})
if not os.path.exists(os.path.join(ROOT, 'dist', 'outils', 'index.html')):
    OLD_TARGETS['/nos-outils/'] = '/creer-mon-site/'
# V2 (novembre 2026) : pages renommées, et trois guides devenus des pages métier à la racine
for _old, _new in {'/methode/': '/pourquoi-moins-cher/', '/lia-et-alex/': '/pourquoi-les-minis-monstres/', '/pourquoi-alex-et-lia/': '/pourquoi-les-minis-monstres/', '/pourquoi-alex-et-co/': '/pourquoi-les-minis-monstres/', '/ils-nous-ont-fait-confiance/': '/realisations/',
                   '/guides/site-internet-artisan/': '/site-internet-artisan/', '/guides/site-internet-therapeute/': '/site-internet-therapeute/',
                   '/guides/site-internet-association/': '/site-internet-association/'}.items():
    OLD_TARGETS[_old] = _new
    OLD_TARGETS['/en' + _old] = '/en' + _new
# 24 novembre 2026 : le hub des guides devient Mini Tuto. Les pages /guides/<slug>/ gardent leur adresse : sous WordPress,
# elles ont besoin d'une page parente « guides », gardée cachée (conteneur, noindex) et redirigée TOUJOURS vers /mini-tuto/
# (REDIRECTIONS_TOUJOURS : même quand la page existe, contrairement à OLD_TARGETS qui ne joue que sur une page absente).
OLD_TARGETS.update({'/guides/': '/mini-tuto/', '/en/guides/': '/mini-tuto/'})
REDIRECTIONS_TOUJOURS = {'/guides/': '/mini-tuto/'}
# La page /outils/ existe encore sous WordPress (ancien export) : tant qu'elle n'est plus construite, elle mène TOUJOURS à
# « Créer mon site », même si la page WordPress n'a pas encore été supprimée.
if not os.path.exists(os.path.join(ROOT, 'dist', 'outils', 'index.html')):
    REDIRECTIONS_TOUJOURS.update({'/outils/': '/creer-mon-site/', '/nos-outils/': '/creer-mon-site/'})


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


def fix_urls(s):
    s = s.replace('"/assets/', '"' + THEME_URI + '/assets/')
    s = s.replace(SITE + '/assets/', SITE + THEME_URI + '/assets/')
    s = s.replace("url('/assets/", "url('" + THEME_URI + '/assets/')
    # formulaires : traités par le thème
    s = s.replace('action="/envoi.php" data-form novalidate>',
                  'action="" data-form novalidate>\n      <input type="hidden" name="aled08_form" value="1">')
    return s


VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Splitter(HTMLParser):
    """Découpe un fragment HTML en éléments de premier niveau (offsets en caractères)."""

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.lines = [0]
        for m in re.finditer('\n', text):
            self.lines.append(m.end())
        self.depth = 0
        self.start = None
        self.parts = []

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if self.depth == 0:
            self.start = self.off()
        if tag not in VOID:
            self.depth += 1
        elif self.depth == 0:
            end = self.off() + len(self.get_starttag_text())
            self.parts.append((self.start, end))

    def handle_startendtag(self, tag, attrs):
        if self.depth == 0:
            s = self.off()
            self.parts.append((s, s + len(self.get_starttag_text())))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        self.depth -= 1
        if self.depth == 0:
            end = self.text.index('>', self.off()) + 1
            self.parts.append((self.start, end))


def to_blocks(fragment):
    sp = Splitter(fragment)
    sp.feed(fragment)
    sp.close()
    blocks = []
    for a, b in sp.parts:
        chunk = fragment[a:b].strip()
        if not chunk:
            continue
        if 'data-aled-espace' in chunk.split('>', 1)[0]:
            # le vrai espace client : connexion si déconnecté, tableau de bord sinon (extension ALED08 Espace client)
            blocks.append('<!-- wp:html -->\n[aled08_espace]' + chunk + '[/aled08_espace]\n<!-- /wp:html -->')
        else:
            blocks.append('<!-- wp:html -->\n' + chunk + '\n<!-- /wp:html -->')
    return '\n\n'.join(blocks)


def text_of(h):
    return html.unescape(re.sub(r'<[^>]+>', '', h)).strip()


def head_of(page):
    h = page[page.index('<head>') + 6:page.index('</head>')]
    a = h.index('<title>')
    b = h.index('<link rel="preload"')
    seo = h[a:b].strip()
    ld = '\n'.join(re.findall(r'<script type="application/ld\+json">.*?</script>', h, re.S))
    return fix_urls(seo + '\n' + ld)


def main_of(page):
    a = page.index('<main id="contenu">') + len('<main id="contenu">')
    b = page.index('</main>')
    return page[a:b]


def collect():
    items = []
    for d, _, files in os.walk(DIST):
        if 'index.html' not in files:
            continue
        rel = os.path.relpath(d, DIST).replace(os.sep, '/')
        path = '/' if rel == '.' else '/' + rel + '/'
        page = read(os.path.join(d, 'index.html'))
        if '<main id="contenu">' not in page:
            continue
        main = main_of(page)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', main, re.S)
        title = text_of(h1.group(1)) if h1 else path.strip('/')
        segs = [s for s in path.strip('/').split('/') if s]
        body = re.search(r'<body class="([^"]*)"', page)
        item = {'path': path, 'head': head_of(page), 'body_class': body.group(1) if body else '', 'nobar': 'class="mobile-bar"' not in page, 'noindex': 'content="noindex' in page}
        if path == '/':
            item.update(kind='front', slug='accueil', parent='', title='Accueil')
        else:
            item.update(kind='page', slug=segs[-1], parent='/'.join(segs[:-1]), title=title)
        item['content'] = to_blocks(fix_urls(main))
        items.append(item)

    # Une page dont le parent n'existe plus dans le site (ex. /guides/<slug>/ sans le hub /guides/) : on crée un conteneur
    # caché à l'adresse du parent, sinon WordPress rattacherait la page à la racine et son adresse changerait.
    have = {it['path'] for it in items}
    for it in list(items):
        if it['kind'] != 'page' or not it['parent']:
            continue
        segs = it['parent'].split('/')
        for k in range(1, len(segs) + 1):
            ppath = '/' + '/'.join(segs[:k]) + '/'
            if ppath in have:
                continue
            cible = REDIRECTIONS_TOUJOURS.get(ppath, OLD_TARGETS.get(ppath, '/'))
            items.append({'path': ppath, 'kind': 'page', 'slug': segs[k - 1], 'parent': '/'.join(segs[:k - 1]), 'title': segs[k - 1].capitalize(),
                          'head': '<title>' + segs[k - 1].capitalize() + ' | Les Minis Monstres</title>\n<meta name="robots" content="noindex, follow">',
                          'body_class': '', 'nobar': False, 'noindex': True, 'conteneur': True,
                          'content': to_blocks('<section class="section"><div class="container"><p><a href="' + cible + '">Cette page a déménagé : suivez ce lien.</a></p></div></section>')})
            have.add(ppath)

    order = {'front': 0, 'page': 1}
    items.sort(key=lambda x: (order[x['kind']], x['path'].count('/'), x['path']))
    return items


def redirects(items):
    have = {it['path'] for it in items}
    out = {}
    if os.path.exists(OLD_PATHS_FILE):
        for line in read(OLD_PATHS_FILE).split():
            p = line.strip()
            if p and p not in have:
                out[p] = OLD_TARGETS.get(p, '/')
    for p, target in OLD_TARGETS.items():
        if p not in have:
            out[p] = target
    return out


def chrome(langue=''):
    base = os.path.join(DIST, langue) if langue else DIST
    page = read(os.path.join(base, 'plan-du-site', 'index.html'))
    body = page[page.index('<body'):]
    body = body[body.index('>') + 1:]
    top = body[:body.index('<main id="contenu">')]
    bottom = body[body.index('</main>') + len('</main>'):body.index('</body>')]
    bottom = re.sub(r'<script src="/assets/js/main\.js[^"]*" defer></script>\s*', '', bottom)
    m = re.search(r'<nav class="mobile-bar".*?</nav>', bottom, re.S)
    bar = m.group(0) if m else ''
    if m:
        bottom = bottom.replace(bar, '')
    # en-tête commun à toutes les pages : le bouton de langue mène par défaut à l'accueil de l'autre langue
    # (le script du site le fait pointer vers la même page, une fois chargée)
    top = re.sub(r'(<a class="lang-switch" href=")[^"]*"', lambda m: m.group(1) + ('/' if langue else '/en/') + '"', top)
    nf = read(os.path.join(base, '404.html'))
    return fix_urls(top.strip()), fix_urls(bottom.strip()), fix_urls(bar.strip()), fix_urls(main_of(nf).strip())


# ------------------------------------------------------------------ fichiers PHP du thème
STYLE_CSS = """/*
Theme Name: Les Minis Monstres
Theme URI: __SITE__
Author: Les Minis Monstres
Description: Thème sur mesure des Minis Monstres. Styles, en-tête, pied de page, formulaire de contact.
Version: 2.0.0
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: aled08
License: GPL-2.0-or-later
*/
/* Les styles du site sont dans assets/css/style.css. */
"""

FUNCTIONS_PHP = r"""<?php
/**
 * ALED08 : fonctions du thème.
 */
defined('ABSPATH') || exit;

define('ALED08_VERSION', '2.0.0');
define('ALED08_FORM_TO', '__RECIPIENT__');

add_action('after_setup_theme', function () {
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('responsive-embeds');
});

/* ---------- styles et scripts ---------- */
add_action('wp_enqueue_scripts', function () {
    $dir = get_template_directory();
    $uri = get_template_directory_uri();
    wp_enqueue_style('aled08', $uri . '/assets/css/style.css', [], (string) filemtime($dir . '/assets/css/style.css'));
    wp_enqueue_script('aled08', $uri . '/assets/js/main.js', [], (string) filemtime($dir . '/assets/js/main.js'), ['in_footer' => true, 'strategy' => 'defer']);
    // la démo de l'espace client (/mon-espace/demo/) reprend le dessin du vrai espace : ses styles aussi
    $chemin = trim((string) wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH), '/');
    if ($chemin === 'mon-espace/demo' && file_exists($dir . '/assets/css/espace.css')) wp_enqueue_style('aled08-espace-demo', $uri . '/assets/css/espace.css', ['aled08'], (string) filemtime($dir . '/assets/css/espace.css'));
    wp_dequeue_style('global-styles');
    wp_dequeue_style('classic-theme-styles');
}, 20);

/* ---------- en-tête HTML propre ---------- */
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wp_shortlink_wp_head');

function aled08_page_id() {
    if (is_front_page()) return (int) get_option('page_on_front');
    if (is_home()) return (int) get_option('page_for_posts');
    if (is_singular()) return (int) get_queried_object_id();
    return 0;
}

function aled08_seo_head() {
    $id = aled08_page_id();
    $head = $id ? get_post_meta($id, '_aled08_head', true) : '';
    if ($head) {
        echo $head . "\n"; // phpcs:ignore -- balises générées par le site ALED08
        return;
    }
    $title = wp_get_document_title();
    $desc = $id ? get_the_excerpt($id) : get_bloginfo('description');
    echo '<title>' . esc_html($title) . "</title>\n";
    if ($desc) echo '<meta name="description" content="' . esc_attr(wp_strip_all_tags($desc)) . "\">\n";
    if ($id) echo '<link rel="canonical" href="' . esc_url(get_permalink($id)) . "\">\n";
    if (is_404() || is_search()) echo "<meta name=\"robots\" content=\"noindex, follow\">\n";
    if ($id) {
        $img = get_the_post_thumbnail_url($id, 'large') ?: get_template_directory_uri() . '/assets/img/og-image.png';
        echo '<meta property="og:locale" content="fr_FR">' . "\n";
        echo '<meta property="og:type" content="' . (is_singular('post') ? 'article' : 'website') . "\">\n";
        echo '<meta property="og:site_name" content="Les Minis Monstres">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . "\">\n";
        if ($desc) echo '<meta property="og:description" content="' . esc_attr(wp_strip_all_tags($desc)) . "\">\n";
        echo '<meta property="og:url" content="' . esc_url(get_permalink($id)) . "\">\n";
        echo '<meta property="og:image" content="' . esc_url($img) . "\">\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    }
}
add_action('wp_head', function () {
    if (aled08_page_id() && get_post_meta(aled08_page_id(), '_aled08_head', true)) {
        remove_action('wp_head', 'rel_canonical');
        remove_action('wp_head', 'wp_robots', 1);
    }
}, 0);
remove_action('wp_head', 'rest_output_link_wp_head');
remove_action('wp_head', 'wp_oembed_add_discovery_links');

/* Ancienne version anglaise : /en/... renvoie vers la même page en français */
add_action('template_redirect', function () {
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH) ?: '';
    if ($path !== '/en' && strpos($path, '/en/') !== 0) return;
    $fr = '/' . ltrim(substr($path, 3), '/');
    wp_safe_redirect(home_url($fr), 301); exit;
}, 0);

/* Changement de domaine : l'ancien nom renvoie (301) vers la même page sur le nouveau. Rien ne bouge tant que le site s'appelle
 * encore comme l'ancien domaine, et les appels techniques (wp-json, wp-admin, cron) ne sont jamais redirigés
 * (le webhook Stripe et les connecteurs des sites clients continuent d'y répondre). */
add_action('template_redirect', function () {
    $anciens = array_filter(['__OLD__', 'www.__OLD__']);
    if (count($anciens) < 2) return;
    $hote = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $actuel = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
    if (!in_array($hote, $anciens, true) || in_array($actuel, $anciens, true)) return;
    $methode = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($methode !== 'GET' && $methode !== 'HEAD') return;
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
    foreach (['/wp-json/', '/wp-admin', '/wp-login', '/wp-cron', '/xmlrpc', '/?rest_route='] as $debut) if (strpos($uri, $debut) === 0) return;
    wp_redirect(home_url($uri), 301); exit;
}, 0);

/* Adresses qui mènent toujours ailleurs, même si une page (cachée) y existe : l'ancien hub /guides/ mène à Mini Tuto */
add_action('template_redirect', function () {
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
    $toujours = json_decode(@file_get_contents(get_template_directory() . '/parts/redirects-toujours.json'), true) ?: [];
    $key = '/' . trim((string) $path, '/') . '/';
    if ($key !== '//' && isset($toujours[$key])) { wp_safe_redirect(home_url($toujours[$key]), 301); exit; }
}, 1);

/* Anciennes adresses : plan du site, et pages de l'ancien site d'électricien */
add_action('template_redirect', function () {
    if (!is_404()) return;
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
    if ($path === '/sitemap.xml') { wp_safe_redirect(home_url('/wp-sitemap.xml'), 301); exit; }
    $old = json_decode(@file_get_contents(get_template_directory() . '/parts/redirects.json'), true) ?: [];
    $key = '/' . trim((string) $path, '/') . '/';
    if (isset($old[$key])) { wp_safe_redirect(home_url($old[$key]), 301); exit; }
    if (strpos($key, '/blog/') === 0 || strpos($key, '/prestations/') === 0) { wp_safe_redirect(home_url('/'), 301); exit; }
}, 1);

/* Pages à ne pas proposer à Google (remerciement après envoi d'un formulaire) */
add_filter('wp_sitemaps_posts_query_args', function ($args, $post_type) {
    if ($post_type === 'page') {
        $hidden = get_posts(['post_type' => 'page', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => '_aled08_noindex', 'meta_value' => '1']);
        if ($hidden) $args['post__not_in'] = array_merge($args['post__not_in'] ?? [], $hidden);
    }
    return $args;
}, 10, 2);
add_action('wp_head', 'aled08_seo_head', 1);

add_filter('document_title_separator', function () { return '|'; });

/* Plan du site WordPress : pas de liste des utilisateurs. */
add_filter('wp_sitemaps_add_provider', function ($provider, $name) {
    return $name === 'users' ? false : $provider;
}, 10, 2);

/* Pas de commentaires sur ce site. */
add_filter('comments_open', '__return_false', 20);
add_filter('pings_open', '__return_false', 20);

/* ---------- formulaires de contact et de devis ---------- */
function aled08_field($name, $max = 500) {
    $v = isset($_POST[$name]) ? wp_unslash($_POST[$name]) : '';
    if (is_array($v)) $v = implode(', ', array_map('strval', $v));
    $v = trim(wp_strip_all_tags((string) $v));
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return mb_substr($v, 0, $max);
}
function aled08_line($v) {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v));
}
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08_form'])) return;

    $error = home_url('/contact/?erreur=1#devis');
    $merci = home_url('/merci/');

    // anti-spam : champ piège rempli ou envoi trop rapide
    if (aled08_field('site_web') !== '') { wp_safe_redirect($merci, 303); exit; }
    $t = (int) aled08_field('_t', 20);
    if ($t > 0 && (microtime(true) * 1000 - $t) < 3000) { wp_safe_redirect($merci, 303); exit; }

    $nom = aled08_line(aled08_field('nom', 120));
    $email = aled08_line(aled08_field('email', 150));
    $tel = aled08_line(aled08_field('telephone', 30));
    $motif = aled08_line(aled08_field('motif', 40));
    $simple = $motif === 'Contact simple';
    $type = $simple ? '' : aled08_line(aled08_field('type', 80));
    $forfait = aled08_line(aled08_field('forfait', 40));
    $paiement = aled08_line(aled08_field('paiement', 40));
    $domaine = aled08_line(aled08_field('domaine', 120));
    $parrain = strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', aled08_field('parrain', 20)));
    $message = aled08_field('message', 5000);
    $consent = aled08_field('consentement', 5);

    if ($nom === '' || $message === '' || $motif === '' || (!$simple && $type === '') || $consent !== 'oui') { wp_safe_redirect($error, 303); exit; }
    if (!is_email($email)) { wp_safe_redirect($error, 303); exit; }
    if ($tel !== '' && !preg_match('/^[0-9 +().-]{6,20}$/', $tel)) $tel = 'invalide : ' . $tel;

    $parrainInfo = $parrain ? apply_filters('aled08_parrain_info', '', $parrain, $nom) : '';
    $sujet = $simple ? 'Contact : message de ' . $nom
        : 'Demande (' . ($motif ?: 'site') . ') : ' . $type . ($forfait && $forfait !== 'Je ne sais pas encore' ? ', forfait ' . $forfait : '') . ' (' . $nom . ')';
    $corps = ($simple ? "Message reçu depuis le site " : "Nouvelle demande reçue depuis le site ") . home_url('/') . "\n\n"
        . "Nom         : $nom\n"
        . "E-mail      : $email\n"
        . 'Téléphone   : ' . ($tel ?: 'non renseigné') . "\n"
        . "Demande     : " . ($simple ? 'juste un contact, sans projet de site' : $motif) . "\n"
        . ($simple ? '' : "Site        : $type\n")
        . ($simple ? '' : 'Forfait     : ' . ($forfait ?: 'non précisé') . "\n"
            . 'Paiement    : ' . ($paiement ?: 'non précisé') . "\n"
            . 'Domaine     : ' . ($domaine ?: 'non précisé') . "\n")
        . ($parrain && !$simple ? "Parrainage  : $parrain" . ($parrainInfo ? " ($parrainInfo)" : '') . "\n" : '')
        . "\nMessage :\n$message\n\n---\nConsentement RGPD : oui, le " . wp_date('d/m/Y H:i') . "\n";
    $headers = ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $nom . ' <' . $email . '>'];

    $to = get_option('aled08_form_to') ?: ALED08_FORM_TO;
    $ok = wp_mail($to, $sujet, $corps, $headers);
    wp_safe_redirect($ok ? $merci : $error, 303);
    exit;
});

/* ---------- menu : élément courant ---------- */
/* Version anglaise : les pages sous /en/ ont leur en-tête et leur pied de page en anglais */
function aled08_is_en() {
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/', PHP_URL_PATH) ?: '/';
    return $path === '/en' || strpos($path, '/en/') === 0;
}
function aled08_part($nom) {
    $dir = get_template_directory() . '/parts/';
    $f = $dir . $nom . (aled08_is_en() && file_exists($dir . $nom . '-en.html') ? '-en' : '') . '.html';
    return (string) file_get_contents($f);
}
add_filter('language_attributes', function ($out) { return aled08_is_en() ? preg_replace('/lang="[^"]*"/', 'lang="en-GB"', $out) : $out; });
function aled08_chrome_top() {
    $top = aled08_part('top');
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/', PHP_URL_PATH) ?: '/';
    if ($path !== '/') {
        $top = preg_replace_callback('#(class="nav-link[^"]*" href="([^"]+)")#', function ($m) use ($path) {
            return ($m[2] !== '/' && $m[2] !== '/en/' && strpos($path, $m[2]) === 0) ? $m[1] . ' aria-current="page"' : $m[1];
        }, $top);
        if (strpos($path, '/mon-espace/') === 0) $top = str_replace('class="btn-espace" href="/mon-espace/"', 'class="btn-espace" href="/mon-espace/" aria-current="page"', $top);
    }
    return $top;
}

/* Couleur de la rubrique (classe du body) et barre d'accès rapide (téléphone) */
add_filter('body_class', function ($classes) {
    $id = aled08_page_id();
    $c = $id ? get_post_meta($id, '_aled08_body_class', true) : '';
    $classes[] = $c ?: 'c-mint';
    return $classes;
});
function aled08_mobile_bar() {
    $id = aled08_page_id();
    if ($id && get_post_meta($id, '_aled08_nobar', true)) return '';
    return aled08_part('mobilebar');
}

/* Contenu d'une page créée plus tard dans WordPress (sans mise en page ALED08) */
function aled08_simple_page() {
    $title = esc_html(get_the_title());
    echo '<section class="page-hero page-hero--compact"><div class="container page-hero-in">'
        . '<nav class="crumbs" aria-label="Fil d’Ariane"><ol><li><a href="' . esc_url(home_url('/')) . '">Accueil</a></li><li aria-current="page">' . $title . '</li></ol></nav>'
        . '<h1>' . $title . '</h1></div></section>'
        . '<section class="section"><div class="container"><div class="prose">';
    the_content();
    echo '</div></div></section>';
}
"""

HEADER_PHP = r"""<?php defined('ABSPATH') || exit; $u = get_template_directory_uri(); ?><!doctype html>
<html <?php language_attributes(); ?> data-theme="light">
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FFF8F2">
<meta name="color-scheme" content="light">
<?php /* clair de base, quel que soit le téléphone ; le choix du visiteur (bouton soleil / lune) est gardé */ ?><script>(function(h){var t;try{t=localStorage.getItem('mm-theme')}catch(e){}h.setAttribute('data-theme',t==='dark'?'dark':'light')})(document.documentElement)</script>
<meta name="darkreader-lock">
<meta name="format-detection" content="telephone=no">
<link rel="preload" href="<?php echo esc_url($u); ?>/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="<?php echo esc_url($u); ?>/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="<?php echo esc_url($u); ?>/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="<?php echo esc_url($u); ?>/assets/apple-touch-icon.png">
<link rel="manifest" href="<?php echo esc_url($u); ?>/assets/app.webmanifest">
<script>(function(h){h.classList.add('js');var d=new Date(),n=(d.getMonth()+1)*100+d.getDate(),q=/[?&]noel=([01])/.exec(location.search);if(q?q[1]==='1':(n>=1115||n<=106))h.classList.add('noel')})(document.documentElement)</script>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php echo aled08_chrome_top(); // phpcs:ignore ?>
<main id="contenu">
"""

FOOTER_PHP = r"""<?php defined('ABSPATH') || exit; ?>
</main>
<?php echo aled08_part('bottom'); // phpcs:ignore ?>
<?php echo aled08_mobile_bar(); // phpcs:ignore ?>
<?php wp_footer(); ?>
</body>
</html>
"""

PAGE_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
while (have_posts()) {
    the_post();
    if (get_post_meta(get_the_ID(), '_aled08_full', true)) {
        the_content();
    } else {
        aled08_simple_page();
    }
}
get_footer();
"""

INDEX_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
if (is_singular()) {
    while (have_posts()) { the_post(); aled08_simple_page(); }
} else {
    echo aled08_part('404'); // phpcs:ignore
}
get_footer();
"""

NOTFOUND_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
echo aled08_part('404'); // phpcs:ignore
get_footer();
"""

IMPORT_PHP = r"""<?php
/**
 * Plugin Name: Les Minis Monstres : import du site
 * Description: Crée en une fois les pages du site ALED08, retire les pages de l'ancien site et règle WordPress. À désactiver et supprimer après usage.
 * Version: 2.0.0
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

register_activation_hook(__FILE__, 'aled08_import_run');

function aled08_import_run() {
    @set_time_limit(300);
    $data = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
    if (!is_array($data)) return;
    kses_remove_filters();
    $ids = [];
    $log = [];

    foreach ($data as $it) {
        $type = 'page';
        $parent = 0;
        if (!empty($it['parent'])) {
            $p = get_page_by_path($it['parent'], OBJECT, 'page');
            $parent = $p ? $p->ID : 0;
        }
        $existing = $type === 'page'
            ? get_page_by_path(trim($it['parent'] . '/' . $it['slug'], '/'), OBJECT, 'page')
            : get_page_by_path($it['slug'], OBJECT, 'post');
        $post = [
            'post_type' => $type,
            'post_status' => 'publish',
            'post_title' => $it['title'],
            'post_name' => $it['slug'],
            'post_parent' => $parent,
            'post_content' => $it['content'],
            'comment_status' => 'closed',
            'ping_status' => 'closed',
        ];
        if (!empty($it['excerpt'])) $post['post_excerpt'] = $it['excerpt'];
        if (!empty($it['date'])) { $post['post_date'] = $it['date']; $post['post_date_gmt'] = get_gmt_from_date($it['date']); }
        if ($existing) { $post['ID'] = $existing->ID; $id = wp_update_post(wp_slash($post), true); }
        else { $id = wp_insert_post(wp_slash($post), true); }
        if (is_wp_error($id)) { $log[] = $it['path'] . ' : ' . $id->get_error_message(); continue; }
        update_post_meta($id, '_aled08_head', wp_slash($it['head']));
        update_post_meta($id, '_aled08_full', 1);
        update_post_meta($id, '_aled08_body_class', $it['body_class']);
        if (!empty($it['noindex'])) update_post_meta($id, '_aled08_noindex', '1'); else delete_post_meta($id, '_aled08_noindex');
        if (!empty($it['nobar'])) update_post_meta($id, '_aled08_nobar', 1); else delete_post_meta($id, '_aled08_nobar');
        $ids[$it['path']] = $id;
    }

    // ancien site : pages et articles créés par l'import précédent, absents du nouveau site
    $removed = 0;
    $old = get_posts(['post_type' => ['page', 'post'], 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => '_aled08_full']);
    foreach ($old as $oid) {
        if (in_array($oid, $ids, true)) continue;
        wp_delete_post($oid, true);
        $removed++;
    }

    if (isset($ids['/'])) { update_option('show_on_front', 'page'); update_option('page_on_front', $ids['/']); }
    update_option('page_for_posts', 0);
    if (isset($ids['/politique-de-confidentialite/'])) update_option('wp_page_for_privacy_policy', $ids['/politique-de-confidentialite/']);

    // contenus d'exemple de WordPress
    foreach (['sample-page' => 'page', 'privacy-policy' => 'page', 'hello-world' => 'post', 'bonjour-tout-le-monde' => 'post'] as $slug => $t) {
        $p = get_page_by_path($slug, OBJECT, $t);
        if ($p && !in_array($p->ID, $ids, true)) wp_delete_post($p->ID, true);
    }

    update_option('blogname', 'Les Minis Monstres');
    update_option('blogdescription', 'Sites internet et SEO');
    update_option('timezone_string', 'Europe/Paris');
    update_option('date_format', 'j F Y');
    update_option('time_format', 'H:i');
    update_option('start_of_week', 1);
    update_option('default_comment_status', 'closed');
    update_option('default_ping_status', 'closed');
    update_option('permalink_structure', '/%postname%/');
    flush_rewrite_rules(false);

    update_option('aled08_import_report', ['done' => current_time('mysql'), 'count' => count($ids), 'removed' => $removed, 'errors' => $log], false);
}
"""


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    tdir = os.path.join(OUT, THEME)
    idir = os.path.join(OUT, 'aled08-import')

    # thème
    shutil.copytree(os.path.join(DIST, 'assets'), os.path.join(tdir, 'assets'))
    for f in ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png']:
        shutil.copy(os.path.join(DIST, f), os.path.join(tdir, 'assets', f))
    shutil.copy(os.path.join(DIST, 'assets', 'img', 'og-image.png'), os.path.join(tdir, 'screenshot.png'))
    # application à installer sur téléphone et ordinateur : elle s'ouvre sur l'espace (client ou gestion)
    write(os.path.join(tdir, 'assets', 'app.webmanifest'), json.dumps({
        'name': 'Les Minis Monstres', 'short_name': 'Les Minis Monstres', 'lang': 'fr', 'start_url': '/mon-espace/', 'scope': '/',
        'display': 'standalone', 'background_color': '#16142A', 'theme_color': '#16142A',
        'icons': [{'src': 'img/logo-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'img/logo-512.png', 'sizes': '512x512', 'type': 'image/png'}],
    }, ensure_ascii=False, indent=2))
    top, bottom, bar, notfound = chrome()
    write(os.path.join(tdir, 'parts', 'top.html'), top)
    write(os.path.join(tdir, 'parts', 'bottom.html'), bottom)
    write(os.path.join(tdir, 'parts', 'mobilebar.html'), bar)
    write(os.path.join(tdir, 'parts', '404.html'), notfound)
    if os.path.exists(os.path.join(DIST, 'en', 'plan-du-site', 'index.html')):
        top, bottom, bar, notfound = chrome('en')
        write(os.path.join(tdir, 'parts', 'top-en.html'), top)
        write(os.path.join(tdir, 'parts', 'bottom-en.html'), bottom)
        write(os.path.join(tdir, 'parts', 'mobilebar-en.html'), bar)
        write(os.path.join(tdir, 'parts', '404-en.html'), notfound)
    write(os.path.join(tdir, 'style.css'), STYLE_CSS.replace('__SITE__', SITE))
    write(os.path.join(tdir, 'functions.php'), FUNCTIONS_PHP.replace('__RECIPIENT__', FORM_RECIPIENT).replace('__OLD__', OLD_DOMAIN))
    write(os.path.join(tdir, 'header.php'), HEADER_PHP)
    write(os.path.join(tdir, 'footer.php'), FOOTER_PHP)
    write(os.path.join(tdir, 'page.php'), PAGE_PHP)
    write(os.path.join(tdir, 'single.php'), PAGE_PHP)
    write(os.path.join(tdir, 'front-page.php'), PAGE_PHP)
    write(os.path.join(tdir, 'index.php'), INDEX_PHP)
    write(os.path.join(tdir, '404.php'), NOTFOUND_PHP)

    # extension d'import
    items = collect()
    write(os.path.join(tdir, 'parts', 'redirects.json'), json.dumps(redirects(items), ensure_ascii=False))
    write(os.path.join(tdir, 'parts', 'redirects-toujours.json'), json.dumps(REDIRECTIONS_TOUJOURS, ensure_ascii=False))
    write(os.path.join(idir, 'aled08-import.php'), IMPORT_PHP)
    write(os.path.join(idir, 'data.json'), json.dumps(items, ensure_ascii=False))

    # extension « ALED08 Espace client »
    edir = os.path.join(OUT, 'aled08-espace')
    shutil.copytree(os.path.join(ROOT, 'src', 'wordpress', 'aled08-espace'), edir)
    shutil.copy(os.path.join(ROOT, 'src', 'assets', 'js', 'qrcode.js'), os.path.join(edir, 'qrcode.js'))
    # styles de l'espace client : servis par le thème (assets/css/espace.css) ; copie de secours dans l'extension
    shutil.copy(os.path.join(DIST, 'assets', 'css', 'espace.css'), os.path.join(edir, 'espace.css'))
    data = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'wp-espace-data.js')], check=True, capture_output=True, text=True).stdout
    write(os.path.join(edir, 'data.json'), data)
    # les règles de création d'un site (le skill « nouveau-site ») : servies à l'atelier automatique par /aled08/v1/atelier/regles.
    # Dans un fichier PHP (pas en .md) pour qu'elles ne soient pas lisibles par une simple adresse.
    rdir = os.path.join(ROOT, '.claude', 'skills', 'nouveau-site', 'regles')
    regles = {f[:-3]: read(os.path.join(rdir, f)) for f in sorted(os.listdir(rdir)) if f.endswith('.md')} if os.path.isdir(rdir) else {}
    write(os.path.join(edir, 'regles-donnees.php'), "<?php\ndefined('ABSPATH') || exit;\nreturn json_decode(<<<'ALED08_REGLES'\n" + json.dumps(regles, ensure_ascii=False) + "\nALED08_REGLES\n, true);\n")

    # connecteur à installer sur chaque site client (Cerise y fait ses modifications)
    shutil.copytree(os.path.join(ROOT, 'src', 'wordpress', 'alexlia-connecteur'), os.path.join(OUT, 'alexlia-connecteur'))
    names = [THEME, 'aled08-import', 'aled08-espace', 'alexlia-connecteur']

    # kit Claude (anthropic-ai/sdk) : extension séparée, chargée seulement quand Cerise travaille
    sdir = os.path.join(OUT, 'alexlia-sdk')
    shutil.copytree(os.path.join(ROOT, 'src', 'wordpress', 'alexlia-sdk'), sdir)
    if shutil.which('composer') and '--sans-sdk' not in sys.argv:
        subprocess.run(['composer', 'install', '--no-dev', '--prefer-dist', '--no-interaction', '--no-progress', '-q', '--optimize-autoloader'], cwd=sdir, check=True)
        for d, dirs, _ in os.walk(os.path.join(sdir, 'vendor')):
            for x in list(dirs):
                if x in ('.git', '.github', 'tests', 'examples', 'fixtures', 'scripts', 'docs'):
                    shutil.rmtree(os.path.join(d, x))
                    dirs.remove(x)
        names.append('alexlia-sdk')
    else:
        print('alexlia-sdk : composer absent ou --sans-sdk, kit non construit')

    for name in names:
        zp = os.path.join(OUT, name + '.zip')
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
            base = os.path.join(OUT, name)
            for d, _, files in os.walk(base):
                for f in files:
                    full = os.path.join(d, f)
                    z.write(full, os.path.join(name, os.path.relpath(full, base)))
        print(name + '.zip', os.path.getsize(zp) // 1024, 'Ko')
    # une extension d'installation par type de site client : on la met, on l'active, il ne reste que le visuel
    src_ms = os.path.join(ROOT, 'src', 'wordpress', 'minis-site')
    garde = os.path.join(ROOT, 'extensions')
    os.makedirs(garde, exist_ok=True)
    for typ, nom in [('essentiel', 'Site Essentiel'), ('visibilite', 'Site Visibilité'), ('boutique', 'Site Boutique')]:
        dossier = 'minis-site-' + typ
        dd = os.path.join(OUT, dossier)
        os.makedirs(os.path.join(dd, 'pkg'))
        code = open(os.path.join(src_ms, 'minis-site.php'), encoding='utf-8').read()
        assert "define('MINIS_SITE_TYPE', 'boutique');" in code and 'installation du Site Boutique' in code
        code = code.replace("define('MINIS_SITE_TYPE', 'boutique');", "define('MINIS_SITE_TYPE', '" + typ + "');").replace('installation du Site Boutique', 'installation du ' + nom)
        open(os.path.join(dd, dossier + '.php'), 'w', encoding='utf-8').write(code)
        shutil.copy(os.path.join(src_ms, 'contenu.php'), os.path.join(dd, 'contenu.php'))
        shutil.copy(os.path.join(OUT, 'alexlia-connecteur.zip'), os.path.join(dd, 'pkg', 'alexlia-connecteur.zip'))
        with zipfile.ZipFile(os.path.join(dd, 'pkg', 'alexlia-credit.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
            base = os.path.join(ROOT, 'src', 'wordpress', 'alexlia-credit')
            for d, _, files in sorted(os.walk(base)):
                for f in sorted(files):
                    zi = zipfile.ZipInfo(os.path.join('alexlia-credit', os.path.relpath(os.path.join(d, f), base)), date_time=(2026, 1, 1, 0, 0, 0))
                    zi.compress_type = zipfile.ZIP_DEFLATED
                    zi.external_attr = 0o644 << 16
                    z.writestr(zi, open(os.path.join(d, f), 'rb').read())
        zp = os.path.join(OUT, dossier + '.zip')
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
            for d, _, files in sorted(os.walk(dd)):
                for f in sorted(files):
                    full = os.path.join(d, f)
                    zi = zipfile.ZipInfo(os.path.join(dossier, os.path.relpath(full, dd)), date_time=(2026, 1, 1, 0, 0, 0))
                    zi.compress_type = zipfile.ZIP_STORED if f.endswith('.zip') else zipfile.ZIP_DEFLATED
                    zi.external_attr = 0o644 << 16
                    z.writestr(zi, open(full, 'rb').read())
        shutil.copy(zp, os.path.join(garde, dossier + '.zip'))
        with zipfile.ZipFile(os.path.join(OUT, 'aled08-espace.zip'), 'a', zipfile.ZIP_DEFLATED) as z:
            z.write(zp, 'aled08-espace/pkg/' + dossier + '.zip', compress_type=zipfile.ZIP_STORED)
        print(dossier + '.zip', os.path.getsize(zp) // 1024, 'Ko')
    # installeur : un seul fichier à téléverser sur un WordPress neuf, il installe tout le reste (thème, extensions, pages)
    idir2 = os.path.join(OUT, 'minis-installeur')
    shutil.copytree(os.path.join(ROOT, 'src', 'wordpress', 'minis-installeur'), idir2)
    os.makedirs(os.path.join(idir2, 'pkg'), exist_ok=True)
    paquets = [THEME, 'aled08-espace', 'aled08-import'] + (['alexlia-sdk'] if 'alexlia-sdk' in names else [])
    for p in paquets:
        shutil.copy(os.path.join(OUT, p + '.zip'), os.path.join(idir2, 'pkg', p + '.zip'))
    zp = os.path.join(OUT, 'minis-installeur.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_STORED) as z:
        for d, _, files in os.walk(idir2):
            for f in files:
                full = os.path.join(d, f)
                z.write(full, os.path.join('minis-installeur', os.path.relpath(full, idir2)))
    print('minis-installeur.zip', os.path.getsize(zp) // 1024, 'Ko', '(avec :', ', '.join(paquets) + ')')
    kinds = {}
    for it in items:
        kinds[it['kind']] = kinds.get(it['kind'], 0) + 1
    print(len(items), 'contenus :', kinds)


if __name__ == '__main__':
    main()
