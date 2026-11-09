// Mini convertisseur « markdown » → HTML, pensé pour la rédaction des contenus du site.
//   - paragraphes séparés par une ligne vide
//   - « - » listes à puces, « 1. » listes numérotées
//   - « ## » et « ### » intertitres (avec ancre automatique)
//   - « > » encadré conseil, « !> » encadré attention
//   - **gras**, [lien](/url/)
// Applique aussi la typographie française (espaces insécables).

const NBSP = ' ';
const NNBSP = ' ';

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function typo(s) {
  return s
    .replace(/ ([;!?])/g, NNBSP + '$1')
    .replace(/ :(?=\s|$)/g, NBSP + ':')
    .replace(/« /g, '«' + NNBSP)
    .replace(/ »/g, NNBSP + '»')
    .replace(/(\d) (€|%|km|h\b|min\b|m²|m\b|cm\b|mm²|kW|kVA|A\b|mA\b|V\b|W\b|ans\b|jours\b|mois\b)/g, '$1' + NBSP + '$2')
    .replace(/(\d) (\d{3})\b/g, '$1' + NBSP + '$2');
}

function inline(s) {
  return typo(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
      const ext = /^https?:/.test(u);
      return `<a href="${u}"${ext ? ' rel="noopener" target="_blank"' : ''}>${t}</a>`;
    });
}

function md(src, opts = {}) {
  if (!src) return '';
  const blocks = String(src).trim().split(/\n\s*\n/);
  const toc = [];
  const html = blocks
    .map((b) => {
      b = b.trim();
      const lines = b.split('\n').map((l) => l.trim());
      if (lines.every((l) => l.startsWith('- '))) {
        return '<ul class="list-check">' + lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('') + '</ul>';
      }
      if (lines.every((l) => /^\d+\. /.test(l))) {
        return '<ol class="list-num">' + lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('') + '</ol>';
      }
      if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
      if (b.startsWith('## ')) {
        const t = b.slice(3);
        const id = slugify(t);
        toc.push({ id, title: t });
        return `<h2 id="${id}">${inline(t)}</h2>`;
      }
      if (b.startsWith('!> ')) return `<aside class="callout callout-warn"><p>${inline(lines.map((l) => l.replace(/^!> ?/, '')).join(' '))}</p></aside>`;
      if (b.startsWith('> ')) return `<aside class="callout"><p>${inline(lines.map((l) => l.replace(/^> ?/, '')).join(' '))}</p></aside>`;
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('\n');
  if (opts.withToc) return { html, toc };
  return html;
}

// Texte brut (pour meta, schema.org, contrôle anti-duplication)
function plain(s) {
  return String(s || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/^#+ /gm, '')
    .replace(/^[-!>] ?>? ?/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { md, inline, plain, esc, slugify, typo };
