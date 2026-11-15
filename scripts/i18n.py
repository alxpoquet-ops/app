#!/usr/bin/env python3
"""
Traduction anglaise du site (dist/ → dist/en/).
Le texte est découpé en « morceaux » : une suite de texte et de balises en ligne (strong, em, a…),
entre deux balises de bloc. Chaque morceau est cherché dans src/i18n/en.json (français → anglais).
  python3 scripts/i18n.py extract   → écrit src/i18n/a-traduire.json (morceaux sans traduction)
  python3 scripts/i18n.py apply     → crée les pages anglaises dans dist/en/
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
DICO = os.path.join(ROOT, 'src', 'i18n', 'en.json')
TODO = os.path.join(ROOT, 'src', 'i18n', 'a-traduire.json')

INLINE = {'strong', 'em', 'b', 'i', 'a', 'mark', 'span', 'sup', 'sub', 'small', 'br', 'abbr', 'code', 'time', 'q', 'u', 's', 'del', 'ins', 'kbd', 'wbr'}
SKIP = {'script', 'style', 'svg', 'noscript', 'textarea', 'code', 'pre', 'title'}
ATTRS = ('alt', 'aria-label', 'title', 'placeholder', 'data-toast-msg', 'data-copy-msg', 'data-label', 'data-tip')
TOKEN = re.compile(r'<!--.*?-->|<![^>]*>|<(/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"\']|"[^"]*"|\'[^\']*\')*)(/?)>|([^<]+)', re.S)
LETTRE = re.compile(r'[A-Za-zÀ-ÿ]')


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def runs(page):
    """Rend la liste des tokens, avec les morceaux à traduire repérés : [(start, end, html)]"""
    out = []
    skip = 0
    cur = None  # (start, end)
    pos = 0
    for m in TOKEN.finditer(page):
        if m.group(0).startswith('<!'):
            if cur: out.append(cur); cur = None
            continue
        close, tag, attrs, selfc, text = m.group(1), (m.group(2) or '').lower(), m.group(3), m.group(4), m.group(5)
        if tag in SKIP:
            if close:
                skip = max(0, skip - 1)
                continue
            if not selfc and not attrs.rstrip().endswith('/'):
                skip += 1
            if cur: out.append(cur); cur = None
            continue
        if skip:
            continue
        inline = text is not None or tag in INLINE
        if inline:
            if cur is None:
                cur = [m.start(), m.end()]
            else:
                cur[1] = m.end()
        else:
            if cur: out.append(cur); cur = None
    if cur: out.append(cur)
    res = []
    for a, b in out:
        a, b = equilibrer(page, a, b)
        core = page[a:b]
        if not core or not LETTRE.search(re.sub(r'<[^>]+>', '', html.unescape(core))):
            continue
        res.append((a, b, core))
    return res


TAGRE = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*?(/?)>')


def equilibrer(page, a, b):
    """Resserre [a, b[ : retire les espaces et les balises orphelines des bords (fermante sans ouvrante,
    ouvrante sans fermante), pour que le morceau soit du HTML équilibré."""
    while True:
        frag = page[a:b]
        l = len(frag) - len(frag.lstrip()); r = len(frag) - len(frag.rstrip())
        a += l; b -= r
        frag = page[a:b]
        if not frag:
            return a, b
        tags = list(TAGRE.finditer(frag))
        stack, orphan_close, opened = [], [], {}
        for t in tags:
            name = t.group(2).lower()
            if name in ('br', 'wbr') or t.group(3):
                continue
            if t.group(1):
                if stack and stack[-1][0] == name:
                    stack.pop()
                else:
                    orphan_close.append(t)
            else:
                stack.append((name, t))
        changed = False
        # fermantes orphelines en fin, ou en début
        for t in orphan_close:
            if t.end() == len(frag):
                b -= len(frag) - t.start(); changed = True; break
            if t.start() == 0:
                a += t.end(); changed = True; break
        if changed:
            continue
        for name, t in stack:
            if t.start() == 0:
                a += t.end(); changed = True; break
            if t.end() == len(frag):
                b -= len(frag) - t.start(); changed = True; break
        if not changed:
            # une seule balise qui entoure tout le morceau : on traduit seulement son contenu
            if tags and tags[0].start() == 0 and not tags[0].group(1) and tags[-1].end() == len(frag) and tags[-1].group(1):
                depth = 0
                for i, t in enumerate(tags):
                    if t.group(2).lower() in ('br', 'wbr') or t.group(3):
                        continue
                    depth += -1 if t.group(1) else 1
                    if depth == 0:
                        break
                if i == len(tags) - 1:
                    a += tags[0].end(); b -= len(frag) - tags[-1].start()
                    continue
            return a, b


def pages():
    for d, dirs, files in os.walk(DIST):
        if os.path.relpath(d, DIST).split(os.sep)[0] in ('en', 'assets'):
            continue
        for f in files:
            if f.endswith('.html'):
                yield os.path.join(d, f)


def attr_values(page):
    for m in re.finditer(r'\s(' + '|'.join(ATTRS) + r')="([^"]*)"', page):
        v = html.unescape(m.group(2))
        if LETTRE.search(v):
            yield m.group(2)
    for m in re.finditer(r'<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt)" content="([^"]*)"', page):
        yield m.group(1)
    t = re.search(r'<title>(.*?)</title>', page, re.S)
    if t:
        yield t.group(1)


def json_strings(page):
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
        try:
            data = json.loads(m.group(1))
        except Exception:
            continue
        stack = [data]
        while stack:
            x = stack.pop()
            if isinstance(x, dict):
                for k, v in x.items():
                    if k in ('@type', '@id', '@context', 'url', 'item', 'logo', 'image', 'sameAs', 'priceCurrency', 'inLanguage', 'contentUrl', 'thumbnailUrl', 'email', 'telephone'):
                        continue
                    stack.append(v)
            elif isinstance(x, list):
                stack.extend(x)
            elif isinstance(x, str) and LETTRE.search(x) and not x.startswith('http'):
                yield x


def load_dico():
    if os.path.exists(DICO):
        with open(DICO, encoding='utf-8') as f:
            return json.load(f)
    return {}


def extract():
    dico = load_dico()
    seen = {}
    for p in pages():
        s = open(p, encoding='utf-8').read()
        rel = os.path.relpath(p, DIST)
        for a, b, core in runs(s):
            k = norm(core)
            if k not in dico:
                seen.setdefault(k, rel)
        for v in list(attr_values(s)) + list(json_strings(s)):
            k = norm(v)
            if k not in dico:
                seen.setdefault(k, rel)
    os.makedirs(os.path.dirname(TODO), exist_ok=True)
    with open(TODO, 'w', encoding='utf-8') as f:
        json.dump(seen, f, ensure_ascii=False, indent=1)
    print(len(seen), 'morceaux à traduire,', sum(len(k) for k in seen), 'caractères')


SITE = 'https://www.aled08.fr'
PARTS = os.path.join(ROOT, 'src', 'i18n', 'parts')
LEGAL = ('/mentions-legales/', '/conditions-generales/', '/politique-de-confidentialite/')
GARDE_FR = ('/assets/', '/wp-', '/envoi.php', '/en/', '/en', '/feed', '/xmlrpc')


def load_all():
    dico = {}
    if os.path.isdir(PARTS):
        for f in sorted(os.listdir(PARTS)):
            if f.endswith('.json'):
                with open(os.path.join(PARTS, f), encoding='utf-8') as fh:
                    dico.update(json.load(fh))
    dico.update(load_dico())
    return {norm(k): v for k, v in dico.items()}


def chemin_en(path):
    """Adresse anglaise d'une adresse du site (chemin), ou None si elle reste en français."""
    if not path.startswith('/') or path.startswith('//'):
        return None
    if any(path == g or path.startswith(g) for g in GARDE_FR if g not in ('/en',)) or path == '/en':
        return None
    base = path.split('?')[0].split('#')[0]
    if '.' in base.rsplit('/', 1)[-1]:
        return None  # un fichier (icône, manifeste, plan du site…), pas une page
    if path.startswith('/mon-espace/') and not path.startswith('/mon-espace/demo/'):
        return None  # le vrai espace client n'existe qu'en français
    return '/en' + path


def url_page(rel):
    rel = rel.replace(os.sep, '/')
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('index.html')]
    return '/' + rel


def apply():
    dico = load_all()
    manquants = {}
    nouvelles = []
    hreflang = lambda fr, en: (f'<link rel="alternate" hreflang="fr" href="{SITE}{fr}">'
                               f'<link rel="alternate" hreflang="en" href="{SITE}{en}">'
                               f'<link rel="alternate" hreflang="x-default" href="{SITE}{fr}">')
    for src in list(pages()):
        rel = os.path.relpath(src, DIST)
        fr_path = url_page(rel)
        en_path = '/en' + fr_path
        s = open(src, encoding='utf-8').read()
        # balises de langue sur la page française aussi
        if '<link rel="canonical"' in s and 'hreflang="en"' not in s and rel != '404.html':
            s_fr = re.sub(r'(<link rel="canonical"[^>]*>)', lambda m: m.group(1) + hreflang(fr_path, en_path), s, count=1)
            open(src, 'w', encoding='utf-8').write(s_fr)
            s = s_fr
        t = s
        # 1) le bouton de langue
        t = t.replace('<a class="lang-switch" href="/en/" hreflang="en" lang="en" data-lang-switch aria-label="English version"><span class="is-on">FR</span><span>EN</span></a>',
                      '<a class="lang-switch" href="__VERSION_FR__" hreflang="fr" lang="fr" data-lang-switch aria-label="Version française"><span>FR</span><span class="is-on">EN</span></a>')
        # 2) le texte
        for a, b, core in reversed(runs(t)):
            k = norm(core)
            if re.sub(r'<[^>]+>', '', k) in ('FR', 'EN', 'FREN'):
                continue
            if k in dico:
                t = t[:a] + dico[k] + t[b:]
            else:
                manquants.setdefault(k, rel)
        # 3) les attributs, le titre et les descriptions
        def attr(m):
            v = norm(m.group(2))
            if v in dico:
                return f' {m.group(1)}="{dico[v].replace(chr(34), "&quot;")}"'
            if LETTRE.search(html.unescape(v)) and v not in ('Version française',):
                manquants.setdefault(v, rel)
            return m.group(0)
        t = re.sub(r'\s(' + '|'.join(ATTRS) + r')="([^"]*)"', attr, t)
        def meta(m):
            v = norm(m.group(2))
            if v in dico:
                return m.group(1) + dico[v].replace('"', '&quot;') + '"'
            manquants.setdefault(v, rel)
            return m.group(0)
        t = re.sub(r'(<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt)" content=")([^"]*)"', meta, t)
        def titre(m):
            v = norm(m.group(1))
            if v in dico:
                return '<title>' + dico[v] + '</title>'
            manquants.setdefault(v, rel)
            return m.group(0)
        t = re.sub(r'<title>(.*?)</title>', titre, t, count=1, flags=re.S)
        # 4) les données structurées (JSON-LD)
        def ld(m):
            try:
                data = json.loads(m.group(1))
            except Exception:
                return m.group(0)
            def walk(x, k=None):
                if isinstance(x, dict):
                    return {kk: walk(v, kk) for kk, v in x.items()}
                if isinstance(x, list):
                    return [walk(v, k) for v in x]
                if isinstance(x, str):
                    if k in ('url', 'item', '@id') and x.startswith(SITE + '/'):
                        p = x[len(SITE):]
                        base, sep, frag = p.partition('#')
                        e = chemin_en(base)
                        return SITE + e + sep + frag if e else x
                    if k == 'inLanguage':
                        return 'en-GB'
                    if k in ('@type', '@context', 'url', 'logo', 'image', 'email', 'telephone', 'priceCurrency', 'contentUrl') or x.startswith('http'):
                        return x
                    n = norm(x)
                    if n in dico:
                        return html.unescape(re.sub(r'<[^>]+>', '', dico[n]))
                    if LETTRE.search(x):
                        manquants.setdefault(n, rel)
                return x
            out = json.dumps(walk(data), ensure_ascii=False).replace('</', '<\\/')
            return '<script type="application/ld+json">' + out + '</script>'
        t = re.sub(r'<script type="application/ld\+json">(.*?)</script>', ld, t, flags=re.S)
        # 5) les liens du site vers les pages anglaises
        def lien(m):
            e = chemin_en(m.group(2))
            return m.group(1) + (e if e else m.group(2)) + '"'
        t = re.sub(r'(\shref=")(/[^"]*)"', lien, t)
        def absolu(m):
            p = m.group(1)
            base, sep, frag = p.partition('#')
            e = chemin_en(base)
            return SITE + (e + sep + frag if e else p)
        t = re.sub(r'(?<!hreflang="fr" href=")(?<!hreflang="x-default" href=")' + re.escape(SITE) + r'(/[^"\'\s<]*)', absolu, t)
        t = t.replace('href="__VERSION_FR__"', 'href="' + fr_path + '"')
        # 6) langue de la page
        t = t.replace('<html lang="fr"', '<html lang="en"').replace('content="fr_FR"', 'content="en_GB"')
        # 7) pages légales : la version française fait foi
        if fr_path in LEGAL:
            t = t.replace('<main id="contenu">', '<main id="contenu"><p class="lang-note container">This English translation is given for information only. The French version is the one that applies.</p>', 1)
        dst = os.path.join(DIST, 'en', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'w', encoding='utf-8').write(t)
        if rel.endswith('index.html') and 'content="noindex' not in t:
            nouvelles.append(en_path)
    # plan du site : les pages anglaises
    sm = os.path.join(DIST, 'sitemap.xml')
    if os.path.exists(sm):
        x = open(sm, encoding='utf-8').read()
        add = ''.join(f'  <url><loc>{SITE}{p}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n' for p in sorted(nouvelles))
        open(sm, 'w', encoding='utf-8').write(x.replace('</urlset>', add + '</urlset>'))
    with open(TODO, 'w', encoding='utf-8') as f:
        json.dump(manquants, f, ensure_ascii=False, indent=1)
    print(f'Anglais : {len(nouvelles)} pages, {len(manquants)} morceau(x) sans traduction (src/i18n/a-traduire.json)')


if __name__ == '__main__':
    {'extract': extract, 'apply': apply}.get(sys.argv[1] if len(sys.argv) > 1 else 'extract', extract)()
