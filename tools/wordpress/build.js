#!/usr/bin/env node
/*
 * Fabrique la version WordPress du site à partir du site d'origine :
 *   - le thème « Flore & Chenilles » (gabarits tirés de index.html, style, scripts, polices, photos) ;
 *   - les données de l'extension « Flore & Chenilles – Boutique » (catalogue, 63 créations, photos à importer) ;
 *   - les deux fichiers .zip à téléverser dans WordPress (wordpress/dist/).
 *
 * Lancer depuis le dossier du site :  node tools/wordpress/build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const WP = path.join(ROOT, 'wordpress');
const THEME = path.join(WP, 'theme', 'flore-et-chenilles');
const PLUGIN = path.join(WP, 'plugin', 'flore-et-chenilles-boutique');
const DIST = path.join(WP, 'dist');

/* ---------- Le contenu du site (assets/js/data.js) ---------- */
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const S = JSON.parse(JSON.stringify(ctx.window.SITE));
const UNIT = S.unitPrice != null ? +S.unitPrice : 8;
const JAR = Object.assign({ price: 5, label: 'Dans un bocal transparent' }, S.jar || {});

/* Mêmes adresses que les pages d'entrée : /creation/bouquet-rose-tendre/ */
const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const used = new Set();
const slugOf = new Map();
S.products.forEach((p) => {
  let s = slugify(p.name) || p.id;
  while (used.has(s)) s += '-2';
  used.add(s);
  slugOf.set(p.id, s);
});
const isUnique = (p) => (p.unique != null ? !!p.unique : /vase/i.test(p.gift || ''));
function regularPrice(p) {
  if (p.price != null) return +p.price;
  if (p.count > 0) return p.count * UNIT + (p.jar ? JAR.price : 0);
  return p.category === 'unite' && !p.quote ? UNIT : null;
}
const CAT_SLUGS = { bouquets: 'bouquets', unite: 'fleurs-a-l-unite', deco: 'deco-et-cadeaux' };

/* ---------- Utilitaires de fichiers ---------- */
const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
function copy(src, dest) {
  mkdir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}
function copyDir(src, dest) {
  mkdir(dest);
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
const write = (p, txt) => { mkdir(path.dirname(p)); fs.writeFileSync(p, txt); };

/* ---------- 1. Extension : catalogue et créations ---------- */
rm(path.join(PLUGIN, 'data'));
rm(path.join(PLUGIN, 'import'));
const PHOTOS = path.join(PLUGIN, 'import', 'photos');
mkdir(PHOTOS);

const catalog = {
  unitPrice: UNIT,
  jar: JAR,
  card: { maxLength: (S.card && S.card.maxLength) || 160, suggestions: (S.card && S.card.suggestions) || [] },
  packaging: S.packaging,
  promo: S.promo || {},
  contact: { email: (S.contact && S.contact.email) || '' },
  brand: S.brand || {},
  delivery: S.delivery || {},
  colors: Object.fromEntries(Object.entries(S.colors).map(([k, c]) => [k, { name: c.name }])),
  flowers: Object.fromEntries(Object.entries(S.flowers).map(([k, f]) => [k, { name: f.name, plural: f.plural || f.name, foliage: !!f.foliage, fixedColor: f.fixedColor || null }])),
  builder: { max: (S.builder && S.builder.maxFlowers) || 20 },
  categories: (S.categories || []).filter((c) => CAT_SLUGS[c.id]).map((c) => ({ key: c.id, slug: CAT_SLUGS[c.id], name: c.name, intro: c.intro || c.blurb || '' }))
};

/* Une photo : 'g087' → g087.webp (grande image de la galerie) ; 'assets/photos/x.jpg' → x.jpg */
const photoFiles = new Set();
function photoFile(ref) {
  if (!ref) return null;
  const r = String(ref).trim();
  let src;
  if (/^g\d+$/i.test(r)) src = path.join(ROOT, 'assets/gallery', r + '.webp');
  else src = path.join(ROOT, r);
  if (!fs.existsSync(src)) throw new Error('Photo introuvable : ' + r);
  const name = path.basename(src);
  if (!photoFiles.has(name)) { copy(src, path.join(PHOTOS, name)); photoFiles.add(name); }
  return name;
}

const creations = S.products.map((p, i) => {
  const main = photoFile(p.photo || p.image);
  const gallery = (p.more || []).map(photoFile).filter((f) => f && f !== main);
  const extra = {};
  ['preset', 'bouquet', 'composition', 'illustration', 'art', 'giftcard', 'jar', 'priceFrom', 'quote'].forEach((k) => { if (p[k] != null && p[k] !== false) extra[k] = p[k]; });
  if (p.slideImage) extra.slideImage = photoFile(p.slideImage);
  if (p.options && Array.isArray(p.options.choices)) {
    extra.options = {
      label: p.options.label || 'Votre fleur',
      colors: !!p.options.colors,
      choices: p.options.choices.map((c) => Object.assign({ name: c.name }, c.type ? { type: c.type } : {}, c.color ? { color: c.color } : {}, c.price != null ? { price: c.price } : {}, { image: photoFile(c.image) }))
    };
  }
  return {
    sku: p.id,
    slug: slugOf.get(p.id),
    name: p.name,
    category: p.category,
    order: i,
    price: regularPrice(p),
    desc: p.desc || '',
    words: p.words || '',
    gift: p.gift || '',
    unique: isUnique(p),
    badge: p.badge || '',
    count: p.count || 0,
    bg: p.bg || '',
    post: p.post || '',
    image: main,
    gallery: Array.from(new Set(gallery)),
    extra
  };
});
write(path.join(PLUGIN, 'data', 'catalog.json'), JSON.stringify(catalog, null, 1) + '\n');
write(path.join(PLUGIN, 'data', 'creations.json'), JSON.stringify(creations, null, 1) + '\n');

/* ---------- 2. Thème : style, scripts, polices, photos ---------- */
const TA = path.join(THEME, 'assets');
rm(TA);
rm(path.join(THEME, 'parts'));
copy(path.join(ROOT, 'assets/css/style.css'), path.join(TA, 'css/site.css'));
copy(path.join(THEME, 'assets-src/woo.css'), path.join(TA, 'css/woo.css'));
copy(path.join(ROOT, 'assets/js/flowers.js'), path.join(TA, 'js/flowers.js'));
copy(path.join(ROOT, 'assets/js/app.js'), path.join(TA, 'js/app.js'));
copy(path.join(THEME, 'assets-src/lite.js'), path.join(TA, 'js/lite.js'));
copyDir(path.join(ROOT, 'assets/fonts'), path.join(TA, 'fonts'));
copyDir(path.join(ROOT, 'assets/img'), path.join(TA, 'img'));
copyDir(path.join(ROOT, 'assets/photos'), path.join(TA, 'photos'));
/* Les photos de la galerie citées ailleurs que dans les créations (Instagram, occasions…). */
const rest = Object.assign({}, S, { products: [] });
const galleryRefs = new Set();
(function scan(o) {
  if (typeof o === 'string') { if (/^g\d+$/i.test(o)) galleryRefs.add(o); return; }
  if (o && typeof o === 'object') Object.values(o).forEach(scan);
})(rest);
/* … et celles citées directement dans index.html. */
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/assets\/gallery\/(g\d+)(?:-s)?\.webp/g)) galleryRefs.add(m[1]);
galleryRefs.forEach((g) => {
  ['-s.webp', '.webp'].forEach((suf) => {
    const src = path.join(ROOT, 'assets/gallery', g + suf);
    if (fs.existsSync(src)) copy(src, path.join(TA, 'gallery', g + suf));
  });
});
/* data.js sans les créations : elles viennent de la boutique. */
write(path.join(TA, 'js/data.js'), '/* Contenu du site (fleurs, couleurs, occasions, textes). Les créations viennent de la boutique WooCommerce. */\nwindow.SITE = ' + JSON.stringify(rest, null, 1) + ';\n');

/* ---------- 3. Gabarits tirés de index.html ---------- */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function between(startRe, endStr, from) {
  const m = startRe.exec(html.slice(from || 0));
  if (!m) throw new Error('Repère introuvable : ' + startRe);
  const start = (from || 0) + m.index;
  const end = html.indexOf(endStr, start);
  if (end < 0) throw new Error('Fin introuvable : ' + endStr);
  return { text: html.slice(start, end + endStr.length), end: end + endStr.length };
}
function replaceOnce(txt, a, b, label) {
  const n = txt.split(a).length - 1;
  if (n !== 1) throw new Error(`Remplacement « ${label || a.slice(0, 60)} » : ${n} occurrence(s)`);
  return txt.replace(a, b);
}
const PHP_ASSETS = '<?php echo esc_url( FC_ASSETS ); ?>';
const withAssets = (t) => t.replace(/(["'\s,(])assets\//g, `$1${PHP_ASSETS}assets/`);
const IG_HANDLE = (S.brand && S.brand.instagram) || 'flore_et_chenilles';
function withSocial(t) {
  return t
    .split(`href="https://www.instagram.com/${IG_HANDLE}/"`).join('href="<?php echo esc_url( fc_instagram_url() ); ?>"')
    .split(`href="https://ig.me/m/${IG_HANDLE}"`).join('href="https://ig.me/m/<?php echo rawurlencode( fc_setting( \'instagram\', \'' + IG_HANDLE + '\' ) ); ?>"')
    .split(`@${IG_HANDLE}<`).join(`@<?php echo esc_html( fc_setting( 'instagram', '${IG_HANDLE}' ) ); ?><`)
    .split('data-fb hidden href="#contact"').join('data-fb <?php fc_facebook_attrs(); ?>');
}
const homeAnchors = (t) => t.replace(/href="#/g, 'href="<?php echo fc_home_anchor(); ?>#');
const head = '<?php\n/* Généré par tools/wordpress/build.js à partir de index.html : ne pas modifier ici. */\ndefined( \'ABSPATH\' ) || exit;\n?>\n';
const part = (name, body) => write(path.join(THEME, 'parts', name + '.php'), head + body.trim() + '\n');

// Icônes
part('sprite', between(/<svg class="sprite"/, '</svg>\n\n').text.replace(/\n\n$/, ''));

// En-tête et menu mobile
let header = between(/<header class="site-header">/, '</header>').text;
const mobile = between(/<div class="mobile-menu"/, '\n  </div>\n').text;
const cartBtn = between(/<button class="icon-btn cart-btn"/, '</button>').text;
part('cart-button', cartBtn);
header = replaceOnce(header, cartBtn, '<?php fc_cart_button(); ?>', 'bouton du panier');
part('header', withSocial(homeAnchors(withAssets(header + '\n\n' + mobile))));

// Accueil
const mainStart = html.indexOf('<main id="main">');
const mainEnd = html.indexOf('</main>') + '</main>'.length;
let front = html.slice(mainStart, mainEnd);
front = replaceOnce(front,
  'Ajoutez vos coups de cœur à votre sélection, écrivez votre carte de vœux, puis envoyez-moi votre demande&nbsp;: je vous confirme la date et la remise.',
  'Ajoutez vos coups de cœur à votre sélection, écrivez votre carte de vœux, puis réglez en toute sécurité par carte bancaire&nbsp;: retrait à l’atelier ou livraison, au choix.', 'note de la boutique');
front = replaceOnce(front,
  'Le délai dépend de la composition&nbsp;: je vous l’indique en confirmant votre demande.',
  'Le délai dépend de la composition&nbsp;: je vous l’indique juste après votre commande. Une création unique est déjà prête.', 'FAQ délai');
front = replaceOnce(front,
  '<details class="faq-item reveal" style="--i:7">',
  '<details class="faq-item reveal" style="--i:7">\n            <summary>Comment se passe le paiement&#8239;?<span class="faq-ic" aria-hidden="true"></span></summary>\n            <div class="faq-a"><p>Le paiement se fait en ligne, au moment de la commande, par carte bancaire, en toute sécurité grâce à myPOS&nbsp;: je n’ai jamais accès à vos données bancaires. Vous choisissez ensuite le retrait à l’atelier ou la livraison, et je vous écris pour convenir du jour.</p></div>\n          </details>\n          <details class="faq-item reveal" style="--i:8">', 'FAQ paiement');
front = replaceOnce(front, '<div class="insta-grid" data-insta></div>',
  '<?php if ( fc_use_smash_balloon() ) : ?><div class="insta-feed"><?php echo do_shortcode( \'[instagram-feed]\' ); ?></div><?php else : ?><div class="insta-grid" data-insta></div><?php endif; ?>', 'grille Instagram');
part('front', withSocial(withAssets(front)));

// Pied de page
let footer = between(/<footer class="site-footer">/, '</footer>').text;
footer = replaceOnce(footer, '<a href="#accueil" class="to-top">', '<a href="<?php echo is_front_page() ? \'#accueil\' : \'#main\'; ?>" class="to-top">', 'retour en haut');
footer = replaceOnce(footer, '<span data-year>2026</span>', '<span data-year><?php echo esc_html( wp_date( \'Y\' ) ); ?></span>', 'année');
footer = replaceOnce(footer, '<a data-email href="#contact" data-email-row hidden></a>', '<a data-email <?php fc_email_attrs(); ?> data-email-row><?php echo fc_email_text(); // phpcs:ignore ?></a>', 'e-mail');
footer = footer.replace(/(<div class="container footer-bottom">\s*<p>[\s\S]*?<\/p>)/, '$1\n      <?php fc_legal_links(); ?>');
if (!/fc_legal_links/.test(footer)) throw new Error('Liens légaux non placés');
part('footer', withSocial(homeAnchors(withAssets(footer))));

// Ma sélection, fenêtre, notification
let overlays = html.slice(html.indexOf('<!-- ============================== MA SÉLECTION'), html.indexOf('</body>'));
overlays = replaceOnce(overlays,
  'Votre carte de vœux est offerte&nbsp;: vous l’écrirez à l’étape suivante. Je vous confirme ensuite le prix, la date et la remise.',
  'Votre carte de vœux est offerte&nbsp;: vous l’écrirez à l’étape suivante. Paiement sécurisé par carte bancaire.', 'note du panier');
overlays = replaceOnce(overlays, 'data-checkout>Finaliser ma demande <svg>', 'data-checkout>Commander <svg>', 'bouton commander');
part('overlays', withAssets(overlays));

for (const f of fs.readdirSync(path.join(THEME, 'parts'))) {
  const txt = fs.readFileSync(path.join(THEME, 'parts', f), 'utf8');
  for (const m of txt.matchAll(/\?>(assets\/[\w./-]+\.(?:webp|jpg|png|svg|woff2))/g)) {
    if (!fs.existsSync(path.join(THEME, m[1]))) throw new Error(`Fichier manquant dans le thème : ${m[1]} (cité dans parts/${f})`);
  }
}

/* ---------- 4. Pages de contenu (fleurs, occasions, conseils, pages locales, guide) ---------- */
copy(path.join(ROOT, 'assets/css/pages.css'), path.join(TA, 'css/pages.css'));
const SEO_GROUPS = { fleurs: 'Les fleurs en fil chenille', occasions: 'Une fleur pour chaque occasion', conseils: 'Conseils & inspirations' };
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function tokenize(t) {
  return t
    .replace(/https:\/\/alxpoquet-ops\.github\.io\/app\//g, '{{home}}')
    .replace(/(?:\.\.\/)+assets\/gallery\/(g\d+)-s\.webp/g, '{{img:$1.webp:s}}')
    .replace(/(?:\.\.\/)+assets\/gallery\/(g\d+)\.webp/g, '{{img:$1.webp:l}}')
    .replace(/(?:\.\.\/)+assets\/photos\/([\w.-]+)/g, '{{photo:$1}}')
    .replace(/(?:\.\.\/)+assets\//g, '{{theme}}assets/')
    .replace(/href="(?:\.\.\/)+creations\/([\w-]+)\/(#[\w-]*)?"/g, (m, slug, a) => `href="{{creation:${slug}}}${a || ''}"`)
    .replace(/href="(?:\.\.\/)+(#[\w-]*)?"/g, (m, a) => `href="{{home}}${a || ''}"`)
    .replace(/href="(?:\.\.\/)+((?:[\w-]+\/)+)(#[\w-]*)?"/g, (m, p1, a) => `href="{{home}}${p1}${a || ''}"`);
}
function seoPage(rel) {
  const file = path.join(ROOT, rel, 'index.html');
  const t = fs.readFileSync(file, 'utf8');
  const title = decode((t.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*Flore & Chenilles$/, '');
  const desc = decode((t.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const h1 = decode(((t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || title).replace(/<[^>]+>/g, '').trim());
  const a = t.indexOf('<main class="pg-wrap">'), b = t.indexOf('</main>');
  if (a < 0 || b < 0) throw new Error('Page sans contenu : ' + rel);
  const body = tokenize(t.slice(a + '<main class="pg-wrap">'.length, b).trim());
  if (/\.\.\//.test(body)) throw new Error('Lien relatif oublié dans ' + rel + ' : ' + body.match(/.{40}\.\.\/.{40}/)[0]);
  return { path: rel, title, desc, h1, html: body };
}
const seoPages = [];
Object.keys(SEO_GROUPS).forEach((g) => {
  const kids = fs.readdirSync(path.join(ROOT, g)).filter((d) => fs.existsSync(path.join(ROOT, g, d, 'index.html'))).map((d) => seoPage(g + '/' + d));
  const list = kids.map((k) => `<li><a href="{{home}}${k.path}/">${k.h1.replace(/&/g, '&amp;')}</a><span>${k.desc.replace(/&/g, '&amp;')}</span></li>`).join('');
  seoPages.push({
    path: g,
    title: SEO_GROUPS[g] + ' — Flore & Chenilles',
    desc: kids.length + ' pages pour découvrir ' + SEO_GROUPS[g].charAt(0).toLowerCase() + SEO_GROUPS[g].slice(1) + ', à l’atelier Flore & Chenilles de Signy-l’Abbaye (Ardennes).',
    h1: SEO_GROUPS[g],
    html: `<nav class="pg-crumbs" aria-label="Fil d’Ariane"><ol><li><a href="{{home}}">Accueil</a></li><li aria-current="page">${SEO_GROUPS[g].replace(/&/g, '&amp;')}</li></ol></nav>\n<section class="pg-sec pg-index"><h1>${SEO_GROUPS[g].replace(/&/g, '&amp;')}</h1><ul class="pg-index-list">${list}</ul><p><a class="pg-btn" href="{{home}}#boutique">Voir les créations</a></p></section>`
  });
  seoPages.push(...kids);
});
require(path.join(ROOT, 'tools/seo/content.js')).local.map((x) => x.slug).concat(['guide']).forEach((d) => seoPages.push(seoPage(d)));
write(path.join(PLUGIN, 'data', 'pages.json'), JSON.stringify(seoPages, null, 1) + '\n');

/* ---------- 5. Les fichiers .zip à téléverser ---------- */
mkdir(DIST);
function zipDir(dir, out) {
  const target = path.join(DIST, out);
  rm(target);
  const exclude = ['*/assets-src/*', '*.DS_Store'];
  execFileSync('zip', ['-qr', '-X', target, path.basename(dir), ...exclude.flatMap((e) => ['-x', e])], { cwd: path.dirname(dir) });
  return (fs.statSync(target).size / 1048576).toFixed(1) + ' Mo';
}
const zt = zipDir(THEME, 'flore-et-chenilles-theme.zip');
const zp = zipDir(PLUGIN, 'flore-et-chenilles-boutique.zip');
const zc = zipDir(path.join(WP, 'plugin-connexion', 'flore-et-chenilles-connexion'), 'flore-et-chenilles-connexion.zip');
console.log(`${creations.length} créations, ${photoFiles.size} photos à importer, ${seoPages.length} pages de contenu`);
console.log(`wordpress/dist/flore-et-chenilles-theme.zip (${zt}) · wordpress/dist/flore-et-chenilles-boutique.zip (${zp}) · wordpress/dist/flore-et-chenilles-connexion.zip (${zc})`);
