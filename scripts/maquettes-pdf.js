// Le PDF de présentation des maquettes par métier, pour Alex : une page par maquette, vue ordinateur, remplie avec un nom
// d'exemple. node scripts/maquettes-pdf.js <sortie.pdf>
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), MQ = path.join(ROOT, 'maquettes'), MET = path.join(MQ, 'metiers');
const exemples = { 'plombier-chauffagiste': 'Plomberie Durand' };
(async () => {
  const sortie = process.argv[2] || path.join(ROOT, 'maquettes-par-metier.pdf');
  const liste = [{ groupe: 'plombier-chauffagiste', nom: 'Plombiers, chauffagistes', fichier: path.join(MQ, 'plombier-chauffagiste.html'), photos: null }];
  for (const f of fs.readdirSync(MET).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(MET, f), 'utf8'));
    liste.push({ groupe: j.groupe, nom: j.nom, fichier: path.join(MET, j.groupe + '.html'), photos: j.photos || {} });
  }
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 1700 } });
  const caps = [];
  for (const m of liste) {
    let h = fs.readFileSync(m.fichier, 'utf8');
    const nom = exemples[m.groupe] || 'Atelier Martin';
    h = h.split('{{ENTREPRISE}}').join(nom).split('{{VILLE}}').join('Metz').split('{{INITIALE}}').join(nom[0]);
    h = h.replace(/\{\{PHOTO:([a-z0-9_-]+)\}\}/g, (x, r) => 'file://' + path.join(MQ, 'img', m.groupe + '-' + r + '.jpg'));
    h = h.replace(/(src|href)="img\//g, '$1="file://' + path.join(MQ, 'img') + '/');
    const tmp = path.join('/tmp', 'mq-' + m.groupe + '.html'); fs.writeFileSync(tmp, h);
    await p.goto('file://' + tmp, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(400);
    const png = path.join('/tmp', 'mq-' + m.groupe + '.png');
    await p.screenshot({ path: png, clip: { x: 0, y: 0, width: 1280, height: 1700 } });
    caps.push({ ...m, png, nomEx: nom });
    console.log('capture', m.groupe);
  }
  const pages = caps.map((c, i) => `<section><header><b>${i + 1}. ${c.nom}</b><span>maquette « ${c.groupe} », vue ordinateur, remplie pour l’exemple avec « ${c.nomEx} » à Metz</span></header><img src="data:image/png;base64,${fs.readFileSync(c.png).toString('base64')}"></section>`).join('');
  const doc = `<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:10mm}body{margin:0;font-family:Arial,sans-serif;color:#2e2a47}
  .titre{height:270mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;page-break-after:always}
  .titre h1{font-size:30px;margin:0 0 10px}.titre p{font-size:14px;max-width:150mm;line-height:1.5}
  section{page-break-after:always}header{display:flex;flex-direction:column;gap:2px;margin:0 0 4mm}header b{font-size:16px}header span{font-size:10px;color:#6b6789}
  img{width:100%;border:1px solid #ddd;border-radius:6px}</style>
  <div class="titre"><h1>Les maquettes par métier</h1><p>Les Minis Monstres · ${caps.length} maquettes prêtes pour les mails de prospection.<br>Chaque prospect reçoit la maquette de son métier, avec le nom de son entreprise et sa ville. Tout le reste est un exemple à adapter, modifiable à 100 %.</p></div>${pages}`;
  const t = path.join('/tmp', 'mq-doc.html'); fs.writeFileSync(t, doc);
  await p.goto('file://' + t); await p.pdf({ path: sortie, format: 'A4', printBackground: true });
  await b.close(); console.log('PDF :', sortie);
})();
