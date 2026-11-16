#!/usr/bin/env node
// Sort toutes les icônes et tous les monstres du site, un fichier par dessin, pour les envoyer à quelqu'un.
//   node scripts/export-dessins.js <dossier>
// Pour chaque dessin : .ai (compatible PDF, vectoriel, s'ouvre dans Illustrator), .svg et .png (fond transparent).
// Plus une planche avec tous les dessins et leur nom (planche-complete.ai / .pdf / .png) et un LISEZ-MOI.
// Icônes : seulement celles utilisées (pages du site et espace client). Monstres : toute la bande, avec leurs humeurs.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { petit, NOMS, alexPortrait } = require('../src/lib/bestiaire');
const { monster, logoMark, HUMEURS } = require('../src/lib/monsters');
const { icon } = require('../src/lib/icons');

const OUT = path.resolve(process.argv[2] || 'dessins');
const ROOT = path.join(__dirname, '..');
const INK = '#2E2A47';

// ---------------------------------------------------------------- les icônes utilisées
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/icons.js'), 'utf8').match(/const P = (\{.*?\});\n/s)[1]);
const textes = [];
(function lire(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) lire(p);
    else if (/\.(html|js)$/.test(f.name)) textes.push(fs.readFileSync(p, 'utf8'));
  }
})(path.join(ROOT, 'dist'));
const tout = textes.join('\n');
let espace = [];
try { espace = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'wp-export/aled08-espace/data.json'), 'utf8')).icons || {}); } catch (e) { /* export pas encore fait */ }
const icones = [...Object.keys(P), 'whatsapp'].filter((n) => espace.includes(n) || (P[n] ? tout.includes(P[n]) : tout.includes('fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472'))).sort();

// ---------------------------------------------------------------- les monstres
const NOMS_FR = { mochi: 'Mochi', fantome: 'Plume (fantôme)', nuage: 'Pouf (nuage)', chaton: 'Minou (chaton)', gelee: 'Mirette (gelée)', champi: 'Champi', dino: 'Pistache (dino)', bricou: 'Bricou', etoile: 'Lumi (étoile)' };
const items = [];
items.push({ dossier: 'logo', nom: 'logo-les-minis-monstres', titre: 'Logo', svg: logoMark({ id: 'lgx' }), taille: 512 });
items.push({ dossier: 'monstres', nom: 'alex-chef-de-chantier', titre: 'Alex', svg: alexPortrait(), taille: 480 });
for (const h of HUMEURS) items.push({ dossier: 'monstres', nom: `cerise-${h}`, titre: `Cerise : ${h}`, svg: monster(h), taille: 480 });
// À Noël, Cerise met son bonnet (caché le reste de l'année) et l'arceau de son casque passe dessous
const noel = (svg) => svg.replace('<g class="m-noel" display="none">', '<g class="m-noel">').replace(/class="m-arceau"/g, 'class="m-arceau" display="none"');
for (const h of HUMEURS) items.push({ dossier: 'monstres', nom: `cerise-${h}-noel`, titre: `Cerise : ${h}, à Noël`, svg: noel(monster(h)), taille: 480 });
for (const n of NOMS) for (const h of ['content', 'ravi']) items.push({ dossier: 'monstres', nom: `${n}-${h}`, titre: `${NOMS_FR[n] || n} : ${h}`, svg: petit(n, { humeur: h }), taille: 480 });
for (const n of icones) items.push({ dossier: 'icones', nom: `icone-${n}`, titre: n, svg: icon(n), taille: 96, icone: true });

// Un SVG autonome : xmlns, taille, sans attributs d'accessibilité ni couleur « héritée »
function propre(it) {
  let s = it.svg.replace(/\s(class|aria-hidden|focusable|role|aria-label)="[^"]*"/g, '').replace(/currentColor/g, INK);
  s = s.replace(/^<svg/, `<svg xmlns="http://www.w3.org/2000/svg" width="${it.taille}" height="${it.taille}"`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${s}\n`;
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const it of items) {
    const base = path.join(OUT, it.dossier);
    for (const f of ['ai', 'svg', 'png']) fs.mkdirSync(path.join(base, f), { recursive: true });
    const svg = propre(it);
    fs.writeFileSync(path.join(base, 'svg', it.nom + '.svg'), svg);
    const html = `<!doctype html><html><head><style>@page{size:${it.taille}px ${it.taille}px;margin:0}html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg.replace(/^<\?xml[^>]*>\n/, '')}</body></html>`;
    await page.setViewportSize({ width: it.taille, height: it.taille });
    await page.setContent(html);
    // .ai compatible PDF : vectoriel, Illustrator l'ouvre directement
    await page.pdf({ path: path.join(base, 'ai', it.nom + '.ai'), width: it.taille + 'px', height: it.taille + 'px', printBackground: false, pageRanges: '1' });
    const png = it.icone ? 192 : it.taille * 2;
    await page.setViewportSize({ width: png, height: png });
    await page.setContent(html.replace(/width="\d+" height="\d+"/, `width="${png}" height="${png}"`).replace(/@page\{[^}]*\}/, ''));
    await page.screenshot({ path: path.join(base, 'png', it.nom + '.png'), omitBackground: true, clip: { x: 0, y: 0, width: png, height: png } });
  }

  // ---------------------------------------------------------------- la planche complète
  const carte = (it) => `<figure><div class="art">${propre(it).replace(/^<\?xml[^>]*>\n/, '').replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"')}</div><figcaption>${it.titre}</figcaption></figure>`;
  const groupe = (titre, liste, cls) => `<h2>${titre}</h2><div class="grille ${cls}">${liste.map(carte).join('')}</div>`;
  const planche = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: 420mm 594mm; margin: 14mm; }
body { margin: 0; font-family: 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif; color: ${INK}; }
h1 { font-size: 26pt; margin: 0 0 4mm; } p { margin: 0 0 8mm; font-size: 11pt; color: #6b6585; }
h2 { font-size: 15pt; margin: 8mm 0 4mm; }
.grille { display: grid; gap: 4mm; }
.monstres { grid-template-columns: repeat(9, 1fr); } .icones { grid-template-columns: repeat(16, 1fr); }
figure { margin: 0; text-align: center; break-inside: avoid; }
.art { aspect-ratio: 1; background: #f6f2ff; border-radius: 4mm; padding: 2mm; box-sizing: border-box; }
.icones .art { padding: 2.5mm; background: #f4f4f8; }
figcaption { font-size: 7pt; margin-top: 1.5mm; }
.icones figcaption { font-size: 5.5pt; }
</style></head><body>
<h1>Les Minis Monstres : icônes et monstres</h1>
<p>${items.filter((i) => !i.icone).length} dessins de la bande et ${icones.length} icônes, tels qu’ils sont utilisés sur le site. Chaque dessin existe aussi en fichier séparé (.ai, .svg, .png).</p>
${groupe('Logo et monstres', items.filter((i) => !i.icone), 'monstres')}
${groupe('Icônes', items.filter((i) => i.icone), 'icones')}
</body></html>`;
  await page.setViewportSize({ width: 1588, height: 2245 });
  await page.setContent(planche);
  await page.pdf({ path: path.join(OUT, 'planche-complete.pdf'), width: '420mm', height: '594mm', printBackground: true });
  fs.copyFileSync(path.join(OUT, 'planche-complete.pdf'), path.join(OUT, 'planche-complete.ai'));
  await page.screenshot({ path: path.join(OUT, 'planche-complete.png'), fullPage: true });
  await browser.close();

  fs.writeFileSync(path.join(OUT, 'LISEZ-MOI.txt'), `Les Minis Monstres : icônes et monstres du site
=============================================

Chaque dessin est fourni en trois formats :
- .ai  : fichier vectoriel compatible PDF. Illustrator l'ouvre directement (Fichier > Ouvrir), tout reste modifiable.
- .svg : fichier vectoriel, s'ouvre aussi dans Illustrator, Figma, Inkscape ou un navigateur.
- .png : image sur fond transparent, pour un usage rapide.

Dossiers :
- logo/      le logo (la tête d'Alex avec son casque).
- monstres/  Alex, Cerise et ses humeurs, et la petite bande (chaque monstre en « content » et en « ravi »).
- icones/    les ${icones.length} icônes utilisées sur le site et dans l'espace client.
- planche-complete : tous les dessins sur une seule page, avec leur nom (.ai, .pdf et .png).

Couleur des icônes : #2E2A47 (le violet très foncé du site). Sur le site, elles prennent la couleur du texte.

Droits :
- Les monstres et le logo sont des dessins originaux des Minis Monstres.
- Les icônes viennent de Lucide (https://lucide.dev, licence ISC : libres d'utilisation, en gardant cette mention).
- L'icône WhatsApp vient de Simple Icons (licence CC0). WhatsApp est une marque de Meta.
`);
  console.log(`${items.length} dessins : ${items.filter((i) => !i.icone).length} logo et monstres, ${icones.length} icônes -> ${OUT}`);
})();
