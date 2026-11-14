// Ajoute des icônes Lucide (ISC) à src/lib/icons.js sans toucher aux icônes existantes.
// Usage : node scripts/add-icons.js <dossier lucide-static/icons> nom1 nom2 ...
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const names = process.argv.slice(3);
const file = path.join(__dirname, '../src/lib/icons.js');
const src = fs.readFileSync(file, 'utf8');
const start = src.indexOf('const P = ') + 'const P = '.length;
const end = src.indexOf(';\nconst WA');
const P = JSON.parse(src.slice(start, end));
let added = 0;
for (const n of names) {
  if (P[n]) continue;
  const svg = fs.readFileSync(path.join(dir, n + '.svg'), 'utf8');
  P[n] = svg.replace(/<!--[\s\S]*?-->/, '').replace(/[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*/, '').replace(/\s*\n\s*/g, '').trim();
  added++;
}
fs.writeFileSync(file, src.slice(0, start) + JSON.stringify(P) + src.slice(end));
console.log('icônes ajoutées :', added, '· total :', Object.keys(P).length);
