#!/usr/bin/env python3
"""Génère les formes de peinture du site (dans src/assets/css/style.css, entre les repères PEINTURE) :
- 4 « flaques » pour les boutons principaux (pilule étirée, bords mous, quelques gouttes) ;
- 4 « taches » décoratives (éclaboussure ronde avec des pointes et des gouttelettes).
Formes déterministes (graine fixe) : relancer le script donne le même résultat."""
import math, random, urllib.parse, os

def smooth(pts):
    # Catmull-Rom fermée -> courbes de Bézier
    n = len(pts); d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d + "Z"

def stadium(t, x0, x1, cy, r):
    # point et normale sur le contour d'une pilule, t dans [0,1)
    L = 2 * (x1 - x0) + 2 * math.pi * r; s = t * L
    a = x1 - x0
    if s < a: return (x0 + s, cy - r), (0, -1)
    s -= a
    if s < math.pi * r:
        ang = -math.pi / 2 + s / r; return (x1 + r * math.cos(ang), cy + r * math.sin(ang)), (math.cos(ang), math.sin(ang))
    s -= math.pi * r
    if s < a: return (x1 - s, cy + r), (0, 1)
    s -= a
    ang = math.pi / 2 + s / r; return (x0 + r * math.cos(ang), cy + r * math.sin(ang)), (math.cos(ang), math.sin(ang))

def puddle(seed):
    rnd = random.Random(seed); W, H = 300, 100
    x0, x1, cy, r = 50, 250, 50, 32
    n = 34; pts = []
    phase = [rnd.uniform(0, 6.28) for _ in range(3)]
    for i in range(n):
        t = i / n; (px, py), (nx, ny) = stadium(t, x0, x1, cy, r)
        off = 7 + 3 * math.sin(t * 6.28 * 3 + phase[0]) + 2.5 * math.sin(t * 6.28 * 7 + phase[1]) + rnd.uniform(-1.2, 1.2)
        pts.append((px + nx * off, py + ny * off))
    shapes = [f"<path d='{smooth(pts)}'/>"]
    # 2 ou 3 gouttes rondes, collées ou détachées
    for _ in range(rnd.randint(2, 3)):
        t = rnd.random(); (px, py), (nx, ny) = stadium(t, x0, x1, cy, r)
        off = rnd.uniform(13, 16); rr = rnd.uniform(2.6, 4.2)
        shapes.append(f"<circle cx='{px + nx * off:.1f}' cy='{py + ny * off:.1f}' r='{rr:.1f}'/>")
    return W, H, shapes

def splat(seed):
    rnd = random.Random(seed); W = H = 200; cx = cy = 100
    n = 64; pts = []; spikes = {}
    for _ in range(rnd.randint(7, 10)):
        spikes[rnd.randrange(n)] = rnd.uniform(18, 34)
    for i in range(n):
        a = i / n * 6.283
        rad = 52 + 6 * math.sin(a * 3 + seed) + rnd.uniform(-3, 3)
        for k, ext in spikes.items():
            dd = min(abs(i - k), n - abs(i - k))
            if dd <= 1: rad += ext * (1 if dd == 0 else 0.35)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    shapes = [f"<path d='{smooth(pts)}'/>"]
    for k, ext in spikes.items():  # gouttelette au bout de certaines pointes
        if rnd.random() < 0.6:
            a = k / n * 6.283; d = 52 + ext + rnd.uniform(9, 16)
            shapes.append(f"<circle cx='{cx + d * math.cos(a):.1f}' cy='{cy + d * math.sin(a):.1f}' r='{rnd.uniform(3, 6.5):.1f}'/>")
    for _ in range(rnd.randint(3, 5)):
        a = rnd.uniform(0, 6.283); d = rnd.uniform(80, 94)
        shapes.append(f"<circle cx='{cx + d * math.cos(a):.1f}' cy='{cy + d * math.sin(a):.1f}' r='{rnd.uniform(2, 4.5):.1f}'/>")
    return W, H, shapes

def uri(W, H, shapes, stretch):
    par = " preserveAspectRatio='none'" if stretch else ""
    svg = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}'{par}>" + "".join(shapes) + "</svg>"
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg, safe=" ='/:.,-") + '")'

out = ["/* Fichier généré par scripts/gen-paint.py : formes de peinture (flaques des boutons, taches décoratives). */", ":root {"]
for i, seed in enumerate([11, 23, 37, 41], 1): out.append(f"  --flaque-{i}: {uri(*puddle(seed), True)};")
for i, seed in enumerate([3, 8, 14, 29], 1): out.append(f"  --tache-{i}: {uri(*splat(seed), False)};")
out.append("}")
# écrit dans style.css, entre les repères PEINTURE (pas de fichier en plus à charger)
p = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "css", "style.css")
css = open(p).read()
A, B = "/* PEINTURE:DEBUT */", "/* PEINTURE:FIN */"
bloc = A + "\n" + "\n".join(out) + "\n" + B
css = css[:css.index(A)] + bloc + css[css.index(B) + len(B):] if A in css else css.rstrip() + "\n\n" + bloc + "\n"
open(p, "w").write(css)
print("ok", p)
