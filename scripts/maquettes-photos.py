#!/usr/bin/env python3
"""Les photos des maquettes préparées d'avance (maquettes/metiers/*.json) : téléchargées depuis Pexels une fois,
allégées (1200 px de large, JPEG qualité 64), rangées dans maquettes/img/<groupe>-<repère>.jpg, puis embarquées dans
l'extension par scripts/wp-export.py. À relancer après l'ajout d'une maquette : python3 scripts/maquettes-photos.py"""
import io, json, os, re, sys, urllib.request
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MET = os.path.join(ROOT, 'maquettes', 'metiers'); IMG = os.path.join(ROOT, 'maquettes', 'img')
os.makedirs(IMG, exist_ok=True)
erreurs = 0
for f in sorted(os.listdir(MET)):
    if not f.endswith('.json'): continue
    j = json.load(open(os.path.join(MET, f), encoding='utf-8'))
    g = j['groupe']
    for rep, url in j.get('photos', {}).items():
        cible = os.path.join(IMG, f'{g}-{rep}.jpg')
        if os.path.exists(cible): continue
        if not re.match(r'^https://images\.pexels\.com/photos/\d+/', url):
            print('photo refusée (pas Pexels) :', g, rep, url); erreurs += 1; continue
        try:
            data = urllib.request.urlopen(urllib.request.Request(url.split('?')[0] + '?auto=compress&cs=tinysrgb&w=1600', headers={'User-Agent': 'Mozilla/5.0 (compatible; LesMinisMonstres/1.0)'}), timeout=30).read()
            im = Image.open(io.BytesIO(data)).convert('RGB')
            if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
            im.save(cible, 'JPEG', quality=64, optimize=True, progressive=True)
            print('ok', os.path.basename(cible), os.path.getsize(cible) // 1024, 'Ko')
        except Exception as e:
            print('échec', g, rep, e); erreurs += 1
sys.exit(1 if erreurs else 0)
