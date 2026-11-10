// Gabarits : pages SEO locales/thématiques et articles de blog
const { site, tarifs, communes } = require('../config');
const { icon } = require('../lib/icons');
const { md, inline, esc, plain } = require('../lib/md');
const C = require('../lib/components');

const GROUPS = {
  villes: { name: 'Zone d’intervention', path: '/zone-intervention/' },
  secteurs: { name: 'Zone d’intervention', path: '/zone-intervention/' },
  ardennes: { name: 'Prestations', path: '/prestations/' },
  'services-villes': { name: 'Zone d’intervention', path: '/zone-intervention/' },
  symptomes: { name: 'Dépannage électrique', path: '/prestations/depannage-electrique/' },
  services: { name: 'Prestations', path: '/prestations/' },
  contextes: { name: 'Prestations', path: '/prestations/' },
};

function body(src, cta) {
  return md(src).replace('<p>[[cta]]</p>', C.inlineCta(cta));
}

function aside(p) {
  return `<aside class="aside-sticky" aria-label="Contact et tarifs">
  <div class="aside-card aside-card-dark">
    <h2>${icon('clock')} À tout moment</h2>
    ${C.hoursTable()}
    <p class="small" style="margin:12px 0 16px">Sur rendez-vous uniquement.</p>
    ${C.btnCall('btn-primary btn-block', 'Appeler')}
    ${C.btnWa('btn-wa btn-block', 'WhatsApp')}
  </div>
  ${C.forfaitBlock({ compact: true })}
  ${
    p.nearby && p.nearby.length
      ? `<div class="aside-card"><h2>${icon('map-pin')} ${esc(p.nearbyTitle || 'À proximité')}</h2><ul class="link-cloud">${p.nearby
          .map((x) => `<li><a href="${x}">${esc(C.label(x))}</a></li>`)
          .join('')}</ul></div>`
      : ''
  }
</aside>`;
}

// ---------------------------------------------------------------- page SEO
function seoPage(p) {
  const path = `/${p.slug}/`;
  const parent = GROUPS[p.group] || GROUPS.services;
  const crumbs = [{ name: 'Accueil', path: '/' }, parent, { name: p.label, path }];
  const f = C.faq(p.faq, p.faqTitle || 'Vos questions');
  const area = p.city ? { '@type': 'City', name: p.city } : { '@type': 'AdministrativeArea', name: 'Ardennes (08)' };
  const isPanne = ['villes', 'services-villes', 'secteurs', 'ardennes', 'symptomes'].includes(p.group) || p.prestation === 'depannage';
  // Titre : les pages communes visent « dépannage électrique + commune »
  let title = p.title;
  if (p.group === 'villes' && p.city) {
    const long = `Dépannage électrique ${p.city} : électricien à tout moment | ALED08`;
    title = long.length <= 68 ? long : `Dépannage électrique ${p.city}, électricien | ALED08`;
  }
  const chips = p.chips || (p.city
    ? [{ icon: 'zap', text: `Dépannage électrique à ${p.city}` }, { icon: 'clock', text: 'À tout moment, sur rendez-vous' }, { icon: 'file-text', text: 'Forfait sur devis, prix annoncé avant' }]
    : isPanne
    ? [{ icon: 'zap', text: 'Dépannage dans toutes les Ardennes' }, { icon: 'clock', text: 'À tout moment, sur rendez-vous' }, { icon: 'user', text: 'Artisan à votre écoute' }]
    : [{ icon: 'file-text', text: 'Devis gratuit' }, { icon: 'clock', text: 'À tout moment, sur rendez-vous' }, { icon: 'user', text: 'Artisan à votre écoute' }]);
  const service = {
    '@type': 'Service',
    '@id': site.url + path + '#service',
    name: p.serviceName || p.label,
    serviceType: p.serviceType || (isPanne ? 'Dépannage électrique' : 'Travaux électriques'),
    description: p.description,
    provider: { '@id': site.url + '/#entreprise' },
    areaServed: area,
    url: site.url + path,
  };
  const html = `${C.pageHero({ kicker: p.kicker, h1: p.h1, lead: p.lead, crumbs, prestation: p.prestation, chips })}
<section class="section"><div class="container layout-aside">
  <div class="prose">
    ${p.city ? C.distanceBadge(p.city) : ''}
    ${body(p.body, p.cta)}
    ${C.authorBox('lgs')}
    ${C.relatedLinks(p.links, p.linksTitle || 'Pour aller plus loin')}
  </div>
  ${aside(p)}
</div></section>
${C.cases(p.cases, p.casesTitle || 'Exemples d’interventions')}
${f.html}
${C.ctaBand({ ...(p.cta || {}), prestation: p.prestation })}`;
  return {
    path,
    title,
    description: p.description,
    crumbs,
    body: html,
    schema: [service, f.schema],
    geoPlace: p.city || 'Ardennes',
    priority: p.group === 'villes' ? 0.7 : 0.6,
  };
}

// ---------------------------------------------------------------- article de blog
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function frDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d === 1 ? '1er' : d} ${MONTHS[m - 1]} ${y}`;
}
function readingTime(src) {
  return Math.max(3, Math.round(plain(src).split(' ').length / 220));
}

function blogPost(a, all) {
  const path = `/blog/${a.slug}/`;
  const crumbs = [{ name: 'Accueil', path: '/' }, { name: 'Blog', path: '/blog/' }, { name: a.short || a.h1, path }];
  const { html: content, toc } = md(a.body, { withToc: true });
  const f = C.faq(a.faq, 'Questions fréquentes sur ce sujet');
  const others = (a.related || []).map((s) => all.find((x) => x.slug === s)).filter(Boolean);
  const article = {
    '@type': 'BlogPosting',
    '@id': site.url + path + '#article',
    headline: a.h1,
    description: a.description,
    datePublished: a.date,
    dateModified: a.modified || a.date,
    inLanguage: 'fr-FR',
    author: { '@id': site.url + '/#entreprise' },
    publisher: { '@id': site.url + '/#entreprise' },
    mainEntityOfPage: site.url + path,
    image: site.url + '/assets/img/og-image.png',
    articleSection: a.category,
    wordCount: plain(a.body).split(' ').length,
  };
  const html = `<section class="page-hero">
  ${C.circuitBg('ph')}
  <div class="container page-hero-in">
    ${C.breadcrumbs(crumbs)}
    <p class="eyebrow"><span class="pulse" aria-hidden="true"></span>${esc(a.category)}</p>
    <h1>${inline(a.h1)}</h1>
    <p class="lead">${inline(a.lead)}</p>
    <div class="article-meta"><span>${icon('user')}${site.name}, artisan électricien</span><span>${icon('calendar-days')}<time datetime="${a.date}">${frDate(a.date)}</time></span><span>${icon('timer')}${readingTime(a.body)} min de lecture</span></div>
  </div>
</section>
<section class="section"><div class="container layout-aside">
  <article class="prose">
    ${content.replace('<p>[[cta]]</p>', C.inlineCta(a.cta))}
    ${C.authorBox('lga')}
    ${C.relatedLinks(a.links, 'Prestations liées')}
  </article>
  <aside class="aside-sticky" aria-label="Sommaire et contact">
    ${toc.length > 2 ? `<nav class="toc" aria-label="Sommaire"><p class="h3" style="margin-bottom:.6em"><strong>Sommaire</strong></p><ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(plain(t.title))}</a></li>`).join('')}</ol></nav>` : ''}
    <div class="aside-card aside-card-dark">
      <h2>${icon('zap')} Un souci chez vous ?</h2>
      <p class="small">Forfait dépannage sur devis, prix annoncé avant de venir : déplacement, recherche de panne, solution et devis de réparation compris.</p>
      ${C.btnCall('btn-primary btn-block', 'Appeler')}
      ${C.btnDevis('btn-light btn-block', a.prestation)}
    </div>
    ${
      others.length
        ? `<div class="aside-card"><h2>${icon('book-open')} À lire aussi</h2><ul class="footer-links">${others
            .map((o) => `<li><a href="/blog/${o.slug}/">${esc(o.h1)}</a></li>`)
            .join('')}</ul></div>`
        : ''
    }
  </aside>
</div></section>
${f.html}
${C.ctaBand({ ...(a.cta || {}), prestation: a.prestation })}`;
  return {
    path,
    title: a.title,
    description: a.description,
    crumbs,
    body: html,
    schema: [article, f.schema],
    ogType: 'article',
    published: a.date,
    modified: a.modified,
    priority: 0.6,
  };
}

function postCard(a) {
  return `<a class="card post-card reveal" href="/blog/${a.slug}/">
  <div class="post-visual" aria-hidden="true">${icon(a.icon || 'zap')}</div>
  <div class="post-body"><p class="post-meta">${esc(a.category)} · ${readingTime(a.body)} min</p><h3>${esc(a.h1)}</h3><p>${esc(a.description)}</p><span class="card-more">Lire l’article ${icon('arrow-right')}</span></div>
</a>`;
}

module.exports = { seoPage, blogPost, postCard, frDate, aside, GROUPS };
