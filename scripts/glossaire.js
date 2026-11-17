// Explications automatiques des mots techniques (src/content/glossaire.js).
// Sur chaque page de dist/ (français et anglais), dans <main>, la première fois qu'un mot du glossaire apparaît dans
// le texte, un petit « ? » s'ajoute juste après. Il réutilise la bulle des options (.opt-i, dans main.js) : son titre,
// son explication, et un lien « En savoir plus ». Lancé par build.js, après la traduction anglaise.
// On ne touche ni aux titres, ni aux liens, ni aux boutons, ni aux champs, ni aux scripts : seulement au texte courant.
const fs = require('fs');
const path = require('path');
const GLOSSAIRE = require('../src/content/glossaire');

const SAUTE = new Set(['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'svg', 'textarea', 'code', 'pre', 'title', 'label', 'option', 'select', 'summary', 'figcaption', 'nav', 'template', 'noscript', 'small', 'em', 'b', 'strong', 'dt', 'th', 'legend']);
const VIDES = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop']);
// Des blocs entiers où un « ? » gênerait (récapitulatifs de prix, formulaires, démo de l'espace client, cartes cliquables)
const CLASSES_SAUTEES = /\b(b-sum|o-sum|o-form|b-steps|app|app-shell|lia-flot|client-card|guide-card|promo|type-card|doc-toc|cmp|terme)\b/;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function bouton(t, en) {
  const titre = en ? t.titreEn : t.titre;
  const lien = (en ? '/en' : '') + t.lien;
  const nom = /^[A-Z]{2,}/.test(titre) ? titre : titre.toLowerCase(); // SEO, HTTPS, CMS gardent leurs capitales
  const label = en ? `What is it: ${titre}?` : `Qu’est-ce que c’est : ${nom} ?`;
  return `<button type="button" class="opt-i terme-i" data-titre="${esc(titre)}" data-info="${esc(en ? t.defEn : t.def)}" data-lien="${esc(lien)}" aria-label="${esc(label)}">?</button>`;
}

// Ajoute les « ? » dans le contenu d'une page. vus : les mots déjà expliqués sur la page.
function traiterMain(html, en, sauter) {
  const termes = GLOSSAIRE.map((t) => ({ t, re: new RegExp(`(?<![\\p{L}\\p{N}-])(${(en ? t.en : t.fr).map(reEsc).join('|')})(?![\\p{L}\\p{N}-])`, t.fr.some((x) => /[a-z]/.test(x)) ? 'iu' : 'u'), fait: !!(sauter && sauter.includes(t.lien)) }));
  const pile = [];
  let saute = 0; // profondeur dans une zone sautée
  let out = '';
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>|[^<]+/g;
  let m;
  while ((m = re.exec(html))) {
    const tok = m[0];
    if (tok.startsWith('<!--')) { out += tok; continue; }
    if (tok[0] === '<') {
      const nom = (m[1] || '').toLowerCase();
      const ferme = tok[1] === '/';
      const auto = tok.endsWith('/>') || VIDES.has(nom);
      if (ferme) {
        // dépile jusqu'à la balise correspondante
        for (let i = pile.length - 1; i >= 0; i--) {
          if (pile[i].nom === nom) { const enleves = pile.splice(i); enleves.forEach((e) => { if (e.saute) saute--; }); break; }
        }
      } else if (!auto) {
        const cls = (tok.match(/\bclass="([^"]*)"/) || [])[1] || '';
        const s = SAUTE.has(nom) || CLASSES_SAUTEES.test(cls) || /\bhidden\b/.test(tok);
        pile.push({ nom, saute: s });
        if (s) saute++;
        // les scripts et styles : on recopie tel quel jusqu'à leur fermeture
        if (nom === 'script' || nom === 'style') {
          const fin = html.indexOf(`</${nom}`, re.lastIndex);
          if (fin > -1) { out += tok + html.slice(re.lastIndex, fin); re.lastIndex = fin; continue; }
        }
      }
      out += tok;
      continue;
    }
    // du texte
    if (saute || !tok.trim()) { out += tok; continue; }
    let texte = tok;
    for (const x of termes) {
      if (x.fait) continue;
      const mm = x.re.exec(texte);
      if (!mm) continue;
      x.fait = true;
      const fin = mm.index + mm[0].length;
      texte = `${texte.slice(0, mm.index)}<span class="terme">${mm[0]}${bouton(x.t, en)}</span>${texte.slice(fin)}`;
      // le reste du texte, après l'ajout, ne doit pas être relu pour ce même mot : il a été marqué « fait »
    }
    out += texte;
  }
  return out;
}

function traiterFichier(file, rel) {
  const html = fs.readFileSync(file, 'utf8');
  const en = /^en(\/|$)/.test(rel);
  const chemin = '/' + rel.replace(/^en\//, '').replace(/index\.html$/, '');
  // pas d'explication sur les pages du lexique elles-mêmes, ni sur la page dont le « ? » mène déjà ici
  if (/^\/lexique\//.test(chemin)) return false;
  const i = html.indexOf('<main');
  const j = html.lastIndexOf('</main>');
  if (i < 0 || j < 0) return false;
  const debut = html.indexOf('>', i) + 1;
  const nouveau = html.slice(0, debut) + traiterMain(html.slice(debut, j), en, [chemin]) + html.slice(j);
  if (nouveau === html) return false;
  fs.writeFileSync(file, nouveau);
  return true;
}

function appliquer(dist) {
  let n = 0;
  (function parcourir(d, rel) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      const r = rel ? `${rel}/${f.name}` : f.name;
      if (f.isDirectory()) parcourir(p, r);
      else if (f.name.endsWith('.html') && traiterFichier(p, r)) n++;
    }
  })(dist, '');
  return n;
}

module.exports = { appliquer, traiterMain };
if (require.main === module) console.log(appliquer(path.join(__dirname, '..', 'dist')) + ' pages avec des explications');
