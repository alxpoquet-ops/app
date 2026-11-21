# La page « Les fleurs » de Flore : un listing simple, une ligne par fleur avec son icône.
import math, sys
B = 'https://www.floreetchenilles.fr'
def rot(path, n, cx=12, cy=10, start=0):
    return ''.join('<path d="%s" transform="rotate(%g %g %g)"/>' % (path, start + i * 360 / n, cx, cy) for i in range(n))
def rays(n, r1, r2, cx=12, cy=10):
    out = ''
    for i in range(n):
        a = 2 * math.pi * i / n
        out += 'M%.1f %.1fL%.1f %.1f' % (cx + r1 * math.cos(a), cy + r1 * math.sin(a), cx + r2 * math.cos(a), cy + r2 * math.sin(a))
    return '<path d="%s"/>' % out
def star(n, ro, ri, cx=12, cy=10):
    pts = []
    for i in range(2 * n):
        r = ro if i % 2 == 0 else ri
        a = -math.pi / 2 + math.pi * i / n
        pts.append('%.1f %.1f' % (cx + r * math.cos(a), cy + r * math.sin(a)))
    return '<path d="M' + 'L'.join(pts) + 'Z"/>'
tige = '<path d="M12 16v6"/><path d="M12 19.5c1.8 0 3.2-.9 3.8-2.4"/>'
I = {
 'rose': '<path d="M12 4c3.6 0 6 2.4 6 5.6S15.4 16 12 16s-6-2.8-6-6.4C6 6.4 8.4 4 12 4z"/><path d="M12 7.2c1.8 0 2.8 1.2 2.6 2.6-.2 1.5-1.6 2.4-3 2.2-1.3-.2-2-1.4-1.6-2.6"/><path d="M9.2 5.2c.4 1.4 1.4 2.2 2.8 2"/>' + tige,
 'lys': rot('M12 10C10.6 7.6 10.8 5 12 2.6c1.2 2.4 1.4 5 0 7.4z', 6) + '<path d="M12 10l-.8-3M12 10l.8-3"/>' + '<path d="M12 13.5v8.5"/>',
 'tulipe': '<path d="M7 4.5l2.6 2.3L12 3.6l2.4 3.2L17 4.5v5.3a5 5 0 0 1-10 0z"/>' + tige,
 'gerbera': '<circle cx="12" cy="10" r="2.4"/>' + rays(16, 3.6, 7.6) + '<path d="M12 17.6v4.4"/>',
 'arum': '<path d="M8.5 3.5c4.5-1 9 1.2 8.5 6-2.8.6-5.2 2.6-6 5.8-1.4-3.6-3.4-7.4-2.5-11.8z"/><path d="M11.6 7.5l1 3.4"/><path d="M11 15.3V22"/>',
 'pavot-coquelicot': rot('M12 10c-1-4.2 2.6-6.4 5-4.6 2.2 1.7.6 4.6-5 4.6z', 4, start=-45) + '<circle cx="12" cy="10" r="1.3"/>' + '<path d="M12 15.5V22"/>',
 'hortensia': ''.join('<circle cx="%g" cy="%g" r="2.2"/>' % p for p in [(8, 8), (12, 5.6), (16, 8), (10, 11.4), (14, 11.4), (12, 8.6)]) + '<path d="M12 13.6V22"/><path d="M12 18c-1.8 0-3.2-.9-3.8-2.4"/>',
 'tournesol': '<circle cx="12" cy="10" r="3.6"/>' + rot('M12 1.8l1.5 3.6h-3z', 10) + '<path d="M10.8 9h.01M13.2 9h.01M12 11.2h.01"/><path d="M12 15.4V22"/>',
 'marguerite': ''.join('<ellipse cx="12" cy="5.4" rx="1.6" ry="3" transform="rotate(%g 12 10)"/>' % (i * 45) for i in range(8)) + '<circle cx="12" cy="10" r="1.9"/><path d="M12 16.6V22"/>',
 'pensee': '<path d="M12 9.5c-1.6-4.4-6.4-4.2-6.2-.6.2 2.4 3 3 6.2.6z"/><path d="M12 9.5c1.6-4.4 6.4-4.2 6.2-.6-.2 2.4-3 3-6.2.6z"/><path d="M12 10.5c-3.8.2-5.4 3.6-3.4 5.2 1.6 1.2 3.4-1 3.4-5.2z"/><path d="M12 10.5c3.8.2 5.4 3.6 3.4 5.2-1.6 1.2-3.4-1-3.4-5.2z"/><path d="M12 15.8V22"/>',
 'lavande': '<path d="M12 22V3"/>' + ''.join('<ellipse cx="%g" cy="%g" rx="1.2" ry="2" transform="rotate(%g %g %g)"/>' % (x, y, a, x, y) for x, y, a in [(10.3, 5, -30), (13.7, 5, 30), (10.3, 8.4, -30), (13.7, 8.4, 30), (10.3, 11.8, -30), (13.7, 11.8, 30)]) + '<path d="M12 18c-1.6-.4-2.6-1.6-2.8-3"/>',
 'jonquille': star(6, 7.6, 3.2) + '<circle cx="12" cy="10" r="2.4"/><path d="M12 17.6V22"/>',
 'muguet': '<path d="M6 22c0-7.6 3.8-13.4 12-14.6"/>' + ''.join('<path d="M%g %gc-1.6 0-2.4 1.4-2.4 3.2h4.8c0-1.8-.8-3.2-2.4-3.2z"/><path d="M%g %gv-1.4"/>' % (x, y, x, y) for x, y in [(9, 12), (12.6, 9.2), (16.6, 8.2)]) + '<path d="M6.5 22c2.8-1.6 4-4.4 3.4-8"/>',
}
F = [('rose', 'La rose'), ('lys', 'Le lys'), ('tulipe', 'La tulipe'), ('gerbera', 'Le gerbera'), ('arum', 'L’arum'), ('pavot-coquelicot', 'Le pavot et le coquelicot'),
     ('hortensia', 'L’hortensia'), ('tournesol', 'Le tournesol'), ('marguerite', 'La marguerite'), ('pensee', 'La pensée'), ('lavande', 'La lavande'),
     ('jonquille', 'La jonquille'), ('muguet', 'Le muguet')]
C = [('Rouge', '#D8343F'), ('Fuchsia', '#D63384'), ('Rose', '#F2A3C0'), ('Pêche', '#F7B993'), ('Orange', '#F08A3C'), ('Jaune', '#F4CF4B'), ('Jaune pâle', '#F3E3A0'), ('Bleu ciel', '#8EC5F0'), ('Bleu', '#3B6FD8')]
h = ['<nav class="pg-crumbs" aria-label="Fil d’Ariane"><ol><li><a href="%s/">Accueil</a></li><li aria-current="page">Les fleurs en fil chenille</li></ol></nav>' % B,
     '<section class="fcb-fl-tete"><p class="pg-eyebrow">Mes fleurs</p><h1>Les fleurs en fil chenille</h1><p class="pg-lead">Treize fleurs façonnées à la main dans mon atelier des Ardennes.</p></section>',
     '<section class="fcb-fl-couleurs"><h2>Les couleurs disponibles</h2><ul>' + ''.join('<li><i style="background:%s"></i>%s</li>' % (c, n) for n, c in C) + '</ul></section>',
     '<ul class="fcb-fl-liste" aria-label="Mes fleurs">' + ''.join('<li><span class="fcb-fl-ic" aria-hidden="true"><svg viewBox="0 0 24 24">%s</svg></span>%s</li>' % (I[s], n) for s, n in F) + '</ul>',
     '<section class="fcb-fl-fin"><p>Pour en savoir plus, vous pouvez me contacter.</p><a class="pg-btn" href="%s/#contact">Me contacter</a></section>' % B]
out = '<!-- wp:html -->\n' + '\n'.join(h) + '\n<!-- /wp:html -->\n'
open(sys.argv[1], 'w').write(out)
# une planche des icônes pour les regarder
open(sys.argv[1].replace('.html', '-icones.html'), 'w').write('<!doctype html><meta charset="utf-8"><style>body{font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px;padding:16px}div{text-align:center;width:90px}svg{width:56px;height:56px;fill:none;stroke:#A24E74;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}</style>' + ''.join('<div><svg viewBox="0 0 24 24">%s</svg><br>%s</div>' % (I[s], n) for s, n in F))
print(len(out))
