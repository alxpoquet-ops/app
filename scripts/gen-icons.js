// Script utilitaire (déjà exécuté) : extrait les icônes Lucide (ISC) et WhatsApp (Simple Icons, CC0)
// vers src/lib/icons.js. Usage : node scripts/gen-icons.js <chemin node_modules>
const fs = require('fs'), path = require('path');
const nm = process.argv[2];
const names = `zap phone search plug power toggle-right lightbulb lamp-wall-up lamp-ceiling shield-check panel-top circuit-board clock moon calendar-days map-pin check circle-check star message-circle mail euro wrench house arrow-right chevron-down chevron-right menu x quote file-text triangle-alert zap-off thermometer cable plug-zap badge-check handshake eye sparkles ruler route car-front cloud-lightning droplets flame key-round hammer list-checks calculator user send image info circle-help lightbulb-off bath warehouse sun battery-charging gauge clipboard-check receipt cookie lock scale book-open navigation timer sun-moon shield-alert phone-call smartphone tree-pine building-2 house-plug fence lamp-floor`.split(/\s+/);
const out = {};
for (const n of names) {
  const svg = fs.readFileSync(path.join(nm, 'lucide-static/icons', n + '.svg'), 'utf8');
  out[n] = svg.replace(/<!--.*?-->/s, '').replace(/[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*/, '').replace(/\s*\n\s*/g, '').trim();
}
const wa = fs.readFileSync(path.join(nm, 'simple-icons/icons/whatsapp.svg'), 'utf8').match(/ d="([^"]+)"/)[1];
let js = `// Icônes : Lucide (ISC License, https://lucide.dev) et WhatsApp (Simple Icons, CC0).\n// Fichier généré par scripts/gen-icons.js\nconst P = ${JSON.stringify(out, null, 0)};\nconst WA = ${JSON.stringify(wa)};\n`;
js += `function icon(name, cls = '') {\n  if (name === 'whatsapp') return \`<svg class="ico \${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="\${WA}"/></svg>\`;\n  if (!P[name]) throw new Error('Icône inconnue : ' + name);\n  return \`<svg class="ico \${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">\${P[name]}</svg>\`;\n}\nmodule.exports = { icon };\n`;
fs.writeFileSync(path.join(__dirname, '../src/lib/icons.js'), js);
console.log('icons:', names.length + 1);
