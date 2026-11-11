#!/usr/bin/env python3
"""
Exporte le site généré (dist/) vers WordPress :
  - wp-export/aled08/          : thème WordPress « ALED08 » (styles, scripts, en-tête, pied de page, formulaires)
  - wp-export/aled08-import/   : extension d'import à usage unique (crée pages et articles, règle WordPress)
  - wp-export/*.zip            : les deux archives prêtes à installer

Usage : node build.js && python3 scripts/wp-export.py
"""
import html
import json
import os
import re
import shutil
import zipfile
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(ROOT, 'wp-export')
THEME = 'aled08'
THEME_URI = '/wp-content/themes/' + THEME
SITE = 'https://www.aled08.fr'
FORM_RECIPIENT = 'alx.poquet@gmail.com'


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
        if 'class="grid grid-posts"' in chunk and 'data-aled-posts' in chunk:
            blocks.append('<!-- wp:shortcode -->\n[aled08_articles]\n<!-- /wp:shortcode -->')
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
    cards = {}
    blog_index = read(os.path.join(DIST, 'blog', 'index.html'))
    for m in re.finditer(r'<a class="card post-card reveal" href="(/blog/[^"]+/)">\s*<div class="post-visual" aria-hidden="true">(.*?)</div>\s*<div class="post-body"><p class="post-meta">(.*?)</p>', blog_index, re.S):
        cards[m.group(1)] = {'icon': m.group(2), 'meta': html.unescape(m.group(3))}

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
        item = {'path': path, 'head': head_of(page)}
        if path == '/':
            item.update(kind='front', slug='accueil', parent='', title='Accueil')
        elif path == '/blog/':
            item.update(kind='blog', slug='blog', parent='', title='Blog')
            main = re.sub(r'<div class="grid grid-posts">', '<div class="grid grid-posts" data-aled-posts>', main, count=1)
        elif segs[0] == 'blog':
            item.update(kind='post', slug=segs[-1], parent='', title=title)
            m = re.search(r'"datePublished":"([^"]+)"', page)
            item['date'] = (m.group(1)[:10] + ' 09:00:00') if m else ''
            desc = re.search(r'<meta name="description" content="([^"]*)"', page)
            item['excerpt'] = html.unescape(desc.group(1)) if desc else ''
            c = cards.get(path, {})
            item['card_meta'] = c.get('meta', '')
            item['icon'] = c.get('icon', '')
        else:
            item.update(kind='page', slug=segs[-1], parent='/'.join(segs[:-1]), title=title)
        item['content'] = to_blocks(fix_urls(main))
        items.append(item)

    order = {'front': 0, 'blog': 1, 'page': 2, 'post': 3}
    items.sort(key=lambda x: (order[x['kind']], x['path'].count('/'), x['path']))
    return items


def chrome():
    page = read(os.path.join(DIST, 'plan-du-site', 'index.html'))
    body = page[page.index('<body'):]
    body = body[body.index('>') + 1:]
    top = body[:body.index('<main id="contenu">')]
    bottom = body[body.index('</main>') + len('</main>'):body.index('</body>')]
    bottom = re.sub(r'<script src="/assets/js/main\.js[^"]*" defer></script>\s*', '', bottom)
    nf = read(os.path.join(DIST, '404.html'))
    return fix_urls(top.strip()), fix_urls(bottom.strip()), fix_urls(main_of(nf).strip())


# ------------------------------------------------------------------ fichiers PHP du thème
STYLE_CSS = """/*
Theme Name: ALED08
Theme URI: https://www.aled08.fr
Author: ALED08
Description: Thème sur mesure d'ALED08, dépannage électrique dans les Ardennes. Styles, en-tête, pied de page, formulaires de contact et de devis.
Version: 1.0.0
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

define('ALED08_VERSION', '1.0.0');
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
        echo '<meta property="og:site_name" content="ALED08">' . "\n";
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

/* Ancienne adresse du plan du site */
add_action('template_redirect', function () {
    if (!is_404()) return;
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '', PHP_URL_PATH);
    if ($path === '/sitemap.xml') { wp_safe_redirect(home_url('/wp-sitemap.xml'), 301); exit; }
}, 1);

/* Pages à ne pas proposer à Google (remerciement après envoi d'un formulaire) */
add_filter('wp_sitemaps_posts_query_args', function ($args, $post_type) {
    if ($post_type === 'page') {
        $merci = get_page_by_path('merci');
        if ($merci) $args['post__not_in'] = array_merge($args['post__not_in'] ?? [], [$merci->ID]);
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

/* ---------- liste des articles du blog : [aled08_articles] ---------- */
function aled08_icon_default() {
    return '<svg class="ico " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>';
}
function aled08_arrow() {
    return '<svg class="ico " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>';
}
add_shortcode('aled08_articles', function () {
    $q = new WP_Query(['post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => 60, 'ignore_sticky_posts' => true]);
    if (!$q->have_posts()) return '<section class="section"><div class="container"><p>Les articles arrivent bientôt.</p></div></section>';
    $out = '<section class="section"><div class="container"><div class="grid grid-posts">';
    while ($q->have_posts()) {
        $q->the_post();
        $id = get_the_ID();
        $icon = get_post_meta($id, '_aled08_icon', true) ?: aled08_icon_default();
        $meta = get_post_meta($id, '_aled08_card_meta', true);
        if (!$meta) {
            $words = str_word_count(wp_strip_all_tags(get_post_field('post_content', $id)));
            $meta = 'Article · ' . max(1, (int) round($words / 220)) . ' min';
        }
        $out .= '<a class="card post-card reveal" href="' . esc_url(get_permalink()) . '">'
            . '<div class="post-visual" aria-hidden="true">' . $icon . '</div>'
            . '<div class="post-body"><p class="post-meta">' . esc_html($meta) . '</p><h3>' . esc_html(get_the_title()) . '</h3>'
            . '<p>' . esc_html(wp_strip_all_tags(get_the_excerpt())) . '</p>'
            . '<span class="card-more">Lire l’article ' . aled08_arrow() . '</span></div></a>';
    }
    wp_reset_postdata();
    return $out . '</div></div></section>';
});

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

    $type = aled08_field('type', 20) === 'devis' ? 'devis' : 'contact';
    $error = home_url('/' . $type . '/?erreur=1');
    $merci = home_url('/merci/');

    // anti-spam : champ piège rempli ou envoi trop rapide
    if (aled08_field('site_web') !== '') { wp_safe_redirect($merci, 303); exit; }
    $t = (int) aled08_field('_t', 20);
    if ($t > 0 && (microtime(true) * 1000 - $t) < 3000) { wp_safe_redirect($merci, 303); exit; }

    $nom = aled08_line(aled08_field('nom', 120));
    $tel = aled08_line(aled08_field('telephone', 30));
    $email = aled08_line(aled08_field('email', 150));
    $commune = aled08_line(aled08_field('commune', 120));
    $adresse = aled08_line(aled08_field('adresse', 200));
    $message = aled08_field('message', 5000);
    $prestation = aled08_line(aled08_field('prestation', 80));
    $urgence = aled08_line(aled08_field('urgence', 40));
    $creneaux = aled08_line(aled08_field('creneaux', 120));
    $consent = aled08_field('consentement', 5);

    if ($nom === '' || $message === '' || $consent !== 'oui') { wp_safe_redirect($error, 303); exit; }
    if (!preg_match('/^[0-9 +().-]{10,20}$/', $tel)) { wp_safe_redirect($error, 303); exit; }
    if ($email !== '' && !is_email($email)) { wp_safe_redirect($error, 303); exit; }

    $sujet = $type === 'devis'
        ? 'Demande de devis : ' . ($prestation ?: 'prestation') . ', ' . ($commune ?: 'commune non précisée')
        : 'Message de contact : ' . $nom;
    $corps = "Nouvelle demande reçue depuis le site " . home_url('/') . "\n\n"
        . 'Type        : ' . ($type === 'devis' ? 'Demande de devis' : 'Contact') . "\n"
        . "Nom         : $nom\n"
        . "Téléphone   : $tel\n"
        . 'E-mail      : ' . ($email ?: 'non renseigné') . "\n"
        . 'Commune     : ' . ($commune ?: 'non renseignée') . "\n"
        . ($adresse ? "Adresse     : $adresse\n" : '')
        . ($prestation ? "Prestation  : $prestation\n" : '')
        . ($urgence ? "Urgence     : $urgence\n" : '')
        . ($creneaux ? "Créneaux    : $creneaux\n" : '')
        . "\nMessage :\n$message\n\n---\nConsentement RGPD : oui, le " . wp_date('d/m/Y H:i') . "\n";
    $headers = ['Content-Type: text/plain; charset=UTF-8'];
    if ($email !== '') $headers[] = 'Reply-To: ' . $nom . ' <' . $email . '>';

    $to = get_option('aled08_form_to') ?: ALED08_FORM_TO;
    $ok = wp_mail($to, $sujet, $corps, $headers);
    wp_safe_redirect($ok ? $merci : $error, 303);
    exit;
});

/* ---------- menu : élément courant ---------- */
function aled08_chrome_top() {
    $top = file_get_contents(get_template_directory() . '/parts/top.html');
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/', PHP_URL_PATH) ?: '/';
    if ($path !== '/') {
        $top = str_replace('class="nav-link" href="' . $path . '">', 'class="nav-link" href="' . $path . '" aria-current="page">', $top);
    }
    return $top;
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
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#121722">
<meta name="format-detection" content="telephone=no">
<link rel="preload" href="<?php echo esc_url($u); ?>/assets/fonts/nunito-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="<?php echo esc_url($u); ?>/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="<?php echo esc_url($u); ?>/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="<?php echo esc_url($u); ?>/assets/apple-touch-icon.png">
<script>document.documentElement.classList.add('js')</script>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php echo aled08_chrome_top(); // phpcs:ignore ?>
<main id="contenu">
"""

FOOTER_PHP = r"""<?php defined('ABSPATH') || exit; ?>
</main>
<?php echo file_get_contents(get_template_directory() . '/parts/bottom.html'); // phpcs:ignore ?>
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

HOME_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
$blog = (int) get_option('page_for_posts');
if ($blog && get_post_meta($blog, '_aled08_full', true)) {
    echo apply_filters('the_content', get_post_field('post_content', $blog)); // phpcs:ignore
} else {
    echo '<section class="page-hero page-hero--compact"><div class="container page-hero-in"><h1>Blog</h1></div></section>';
    echo do_shortcode('[aled08_articles]'); // phpcs:ignore
}
get_footer();
"""

INDEX_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
if (is_singular()) {
    while (have_posts()) { the_post(); aled08_simple_page(); }
} else {
    echo '<section class="page-hero page-hero--compact"><div class="container page-hero-in"><h1>' . esc_html(wp_strip_all_tags(get_the_archive_title() ?: 'Articles')) . '</h1></div></section>';
    echo do_shortcode('[aled08_articles]'); // phpcs:ignore
}
get_footer();
"""

NOTFOUND_PHP = r"""<?php
defined('ABSPATH') || exit;
get_header();
echo file_get_contents(get_template_directory() . '/parts/404.html'); // phpcs:ignore
get_footer();
"""

IMPORT_PHP = r"""<?php
/**
 * Plugin Name: ALED08 : import du site
 * Description: Crée en une fois les pages et articles du site ALED08 et règle WordPress (page d'accueil, blog, liens). À désactiver et supprimer après usage.
 * Version: 1.0.0
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
        $type = $it['kind'] === 'post' ? 'post' : 'page';
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
        if (!empty($it['card_meta'])) update_post_meta($id, '_aled08_card_meta', $it['card_meta']);
        if (!empty($it['icon'])) update_post_meta($id, '_aled08_icon', wp_slash($it['icon']));
        $ids[$it['path']] = $id;
    }

    if (isset($ids['/'])) { update_option('show_on_front', 'page'); update_option('page_on_front', $ids['/']); }
    if (isset($ids['/blog/'])) update_option('page_for_posts', $ids['/blog/']);
    if (isset($ids['/politique-de-confidentialite/'])) update_option('wp_page_for_privacy_policy', $ids['/politique-de-confidentialite/']);

    // contenus d'exemple de WordPress
    foreach (['sample-page' => 'page', 'privacy-policy' => 'page', 'hello-world' => 'post', 'bonjour-tout-le-monde' => 'post'] as $slug => $t) {
        $p = get_page_by_path($slug, OBJECT, $t);
        if ($p && !in_array($p->ID, $ids, true)) wp_delete_post($p->ID, true);
    }

    update_option('blogname', 'ALED08');
    update_option('blogdescription', 'Dépannage électrique dans les Ardennes');
    update_option('timezone_string', 'Europe/Paris');
    update_option('date_format', 'j F Y');
    update_option('time_format', 'H:i');
    update_option('start_of_week', 1);
    update_option('default_comment_status', 'closed');
    update_option('default_ping_status', 'closed');
    update_option('permalink_structure', '/blog/%postname%/');
    flush_rewrite_rules(false);

    update_option('aled08_import_report', ['done' => current_time('mysql'), 'count' => count($ids), 'errors' => $log], false);
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
    top, bottom, notfound = chrome()
    write(os.path.join(tdir, 'parts', 'top.html'), top)
    write(os.path.join(tdir, 'parts', 'bottom.html'), bottom)
    write(os.path.join(tdir, 'parts', '404.html'), notfound)
    write(os.path.join(tdir, 'style.css'), STYLE_CSS)
    write(os.path.join(tdir, 'functions.php'), FUNCTIONS_PHP.replace('__RECIPIENT__', FORM_RECIPIENT))
    write(os.path.join(tdir, 'header.php'), HEADER_PHP)
    write(os.path.join(tdir, 'footer.php'), FOOTER_PHP)
    write(os.path.join(tdir, 'page.php'), PAGE_PHP)
    write(os.path.join(tdir, 'single.php'), PAGE_PHP)
    write(os.path.join(tdir, 'front-page.php'), PAGE_PHP)
    write(os.path.join(tdir, 'home.php'), HOME_PHP)
    write(os.path.join(tdir, 'index.php'), INDEX_PHP)
    write(os.path.join(tdir, '404.php'), NOTFOUND_PHP)

    # extension d'import
    items = collect()
    write(os.path.join(idir, 'aled08-import.php'), IMPORT_PHP)
    write(os.path.join(idir, 'data.json'), json.dumps(items, ensure_ascii=False))

    for name in [THEME, 'aled08-import']:
        zp = os.path.join(OUT, name + '.zip')
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
            base = os.path.join(OUT, name)
            for d, _, files in os.walk(base):
                for f in files:
                    full = os.path.join(d, f)
                    z.write(full, os.path.join(name, os.path.relpath(full, base)))
        print(name + '.zip', os.path.getsize(zp) // 1024, 'Ko')
    kinds = {}
    for it in items:
        kinds[it['kind']] = kinds.get(it['kind'], 0) + 1
    print(len(items), 'contenus :', kinds)


if __name__ == '__main__':
    main()
