#!/usr/bin/env python3
"""Contrôle des maquettes préparées d'avance (maquettes/metiers/) : python3 scripts/maquettes-check.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); MET = os.path.join(ROOT, 'maquettes', 'metiers')
pb = 0
def dit(g, m):
    global pb; pb += 1; print(f'[{g}] {m}')
for f in sorted(os.listdir(MET)):
    if not f.endswith('.json'): continue
    j = json.load(open(os.path.join(MET, f), encoding='utf-8')); g = j.get('groupe', '?')
    for k in ('groupe', 'nom', 'mots', 'photos'):
        if not j.get(k): dit(g, f'JSON : il manque {k}')
    hp = os.path.join(MET, g + '.html')
    if not os.path.exists(hp): dit(g, 'HTML absent'); continue
    h = open(hp, encoding='utf-8').read()
    if not (8000 <= len(h.encode()) <= 400000): dit(g, f'taille {len(h.encode())} octets')
    for x in ('{{ENTREPRISE}}', '{{VILLE}}', '{{INITIALE}}', 'filigrane', 'Maquette', 'noindex'):
        if x not in h: dit(g, f'il manque « {x} »')
    for x in re.findall(r'<(script|form|input|button|iframe|object|embed)\b', h, re.I): dit(g, f'balise interdite <{x}>')
    if re.search(r'\son[a-z]+\s*=', h, re.I): dit(g, 'attribut on… interdit')
    reps = set(re.findall(r'\{\{PHOTO:([a-z0-9_-]+)\}\}', h))
    if reps != set(j.get('photos', {}).keys()): dit(g, f'photos du HTML {sorted(reps)} ≠ JSON {sorted(j.get("photos", {}))}')
    texte = re.sub(r'<style.*?</style>|<[^>]+>', ' ', h, flags=re.S)
    for motif, quoi in [(r'\d[\d  ]*(€|euros?)', 'un prix'), (r'0[1-9](?:[ .]?\d{2}){4}', 'un numéro de téléphone'), (r'\b\d[,.]\d\s*/\s*5\b', 'une note'),
                        (r'\b\d+\s*ans d.exp', 'des années d’expérience'), (r'\b(?:19|20)\d{2}\b', 'une année'), (r'@[a-z]', 'une adresse e-mail'),
                        (r'\b(guéri|guérir|soigner|traitement|thérapie)\b', 'un mot médical'), (r'\b(meilleur|n°\s*1|numéro 1|le moins cher|garanti)\b', 'une promesse')]:
        for m in re.finditer(motif, texte, re.I): dit(g, f'{quoi} ? « {texte[max(0, m.start()-30):m.end()+20].strip()} »')
print(('PROBLÈMES : %d' % pb) if pb else 'Tout est bon.')
sys.exit(1 if pb else 0)
