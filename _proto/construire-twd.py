# Genere _proto/data-twd-en.js depuis TWD.txt, le document de Niko.
#
# Rien n'est reformule : chaque chaine affichee est decoupee dans le fichier
# source, et verifie() le prouve a la fin — 176 fragments, zero ecart. La
# coquille « Consistancy », le « ??? » d'une date et « overthink to much »
# sont les siens et le restent.
#
#   py _proto/construire-twd.py [chemin/vers/TWD.txt]
#
# A relancer apres chaque retouche du document. Le script interroge TMDB pour
# les durees, episode par episode : compter une minute.
import json, re, os, sys, urllib.request, time

# Le document vit sur le Bureau de Niko, hors du depot — comme
# « Timeline Star Trek.md » avant lui. On peut le passer en argument.
SRC = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\nprad\Desktop\TWD.txt'
SORTIE = '_proto/data-twd-en.js'
brut = open(SRC, encoding='utf-8').read()
lignes = brut.split('\n')

# ── la cle TMDB vit deja dans le fichier de donnees Star Trek ────────────
_st = open('_proto/data-startrek-en.js', encoding='utf-8').read()
CG_ST, _ = json.JSONDecoder().raw_decode(_st[_st.index('window.CG=') + 10:])
CLE = CG_ST['tmdbKey']
IMG = 'https://image.tmdb.org/t/p/w780'

# ── les quinze oeuvres, resolues sur TMDB ────────────────────────────────
OEUVRES = {
    'Fear the Walking Dead':                     ('ftwd',    62286, '/dvDkq5Mcv27vpHRvF1ywFGroh03.jpg'),
    'Fear the Walking Dead: Flight 462':         ('flight',  62286, '/dvDkq5Mcv27vpHRvF1ywFGroh03.jpg'),
    'Fear the Walking Dead: Passage':            ('passage', 234950, '/7fZQ7bb44r8KDcP5ODv5F6BnJsf.jpg'),
    'Fear the Walking Dead: Dead in the Water':  ('water',   226340, '/abPZ8LB6onqJMHd6K9yyfvi8kuF.jpg'),
    'The Walking Dead':                          ('twd',     1402,  '/rAOjnEFTuNysY7bot8zonhImGMh.jpg'),
    'The Walking Dead: Cold Storage':            ('cold',    274853, '/1Bk8Yoxm2eBjWl2ELsO7IcX7fCw.jpg'),
    'The Walking Dead: The Oath':                ('oath',    275503, '/yKkjeX4wHhDyNj7kOXnfHtIFYBn.jpg'),
    'The Walking Dead: Torn Apart':              ('torn',    272594, '/1diRfl2iqWeYspw2FIikmt8n7K3.jpg'),
    'The Walking Dead: Red Machete':             ('machete', 233436, '/4oIQOf84yq0KmAvKsYjx2HFlLvp.jpg'),
    'The Althea Tapes':                          ('althea',  208071, '/6AoMi0NkhNjJjOzMaX4zScv0zd2.jpg'),
    'Tales of the Walking Dead':                 ('tales',   136248, '/uFU4ItwbxHnFHxntb76ASnZbWTN.jpg'),
    'The Walking Dead: World Beyond':            ('wb',      94305, '/vlxHVv236ehbde3qXc5R1ewAn4B.jpg'),
    'The Walking Dead: The Ones Who Live':       ('towl',    206586, '/5PCKxpFcCTDFT3b1olJGPaAIM9e.jpg'),
    'The Walking Dead: Daryl Dixon':             ('dd',      211684, '/fkeVnvxVx4x2PdDOOzSblFUGTVt.jpg'),
    'The Walking Dead: Dead City':               ('dc',      194583, '/vV5LKWmuysEe5wsuZJGbdiL5XJ2.jpg'),
}
# les huit series web sont exactement celles que la source marque « VO »
FLIGHT_SAISON_ZERO = 'flight'

# ── lecture du document ──────────────────────────────────────────────────
def lire():
    eres, ere = [], None
    entree = None
    for l in lignes:
        s = l.strip()
        if not s:
            continue
        if s.startswith('PHASE'):
            # « PHASE 1 :Los Angeles & Mexico Outbreak » — un seul separateur
            m = re.match(r'(PHASE\s*\d+)\s*:\s*(.+)', s)
            ere = {'phase': m.group(1), 'titre': m.group(2).strip(), 'entrees': []}
            eres.append(ere); entree = None
            continue
        if ere is None:
            continue
        if s.startswith('Season'):
            entree['subitems'].append(s)
            continue
        if s.startswith('When does'):
            entree['faqq'] = s
            continue
        # ligne d'entree : date, puis eventuellement FLASHBACK, puis titre
        m = re.match(r'^(\S+)\s+(.*)$', s)
        date, reste = m.group(1), m.group(2)
        tags = []
        if reste.startswith('FLASHBACK '):
            tags.append('flashback'); reste = reste[len('FLASHBACK '):]
        vo = reste.endswith(' VO')
        if vo:
            reste = reste[:-3]
        entree = {'date': date, 'title': reste, 'tags': tags, 'vo': vo, 'subitems': []}
        ere['entrees'].append(entree)
    return eres

# ── durees : on somme les episodes TMDB de chaque tranche ────────────────
_cache = {}
def saison(tid, n):
    c = (tid, n)
    if c not in _cache:
        u = f'https://api.themoviedb.org/3/tv/{tid}/season/{n}?api_key={CLE}'
        try:
            _cache[c] = json.load(urllib.request.urlopen(u, timeout=20)).get('episodes', [])
        except Exception:
            _cache[c] = []
        time.sleep(.2)
    return _cache[c]

def minutes(tid, subs, cle_oeuvre):
    if not subs:
        # Flight 462 n'a pas de fiche propre : c'est la saison 0 de FTWD
        eps = saison(tid, 0) if cle_oeuvre == FLIGHT_SAISON_ZERO else []
        return sum(e.get('runtime') or 0 for e in eps[:16])
    t = 0
    for s in subs:
        m = re.match(r'Season (\d+) Episodes? ([\d]+)(?:-(\d+))?', s)
        if not m:
            continue
        ns, a = int(m.group(1)), int(m.group(2))
        b = int(m.group(3) or a)
        for e in saison(tid, ns):
            if a <= e.get('episode_number', 0) <= b:
                t += e.get('runtime') or 0
    return t

# ── construction ─────────────────────────────────────────────────────────
# une encre par lieu : « Back to Virginia » reprend celle de Virginia
ENCRES = {'Los Angeles & Mexico Outbreak': 1, 'Atlanta Outbreak': 2, 'Georgia': 3,
          'Virginia': 4, 'Texas': 5, 'Back to Virginia': 4, 'Back to Texas': 5,
          'Roadtrip': 6, 'Back to Georgia': 3, 'CRM': 7, 'Across the ocean': 8,
          'New-York': 9}

eres = lire()
compteur, RT, eras = {}, {}, []
for e in eres:
    ents = []
    for x in e['entrees']:
        cle, tid, bd = OEUVRES[x['title']]
        compteur[cle] = compteur.get(cle, 0) + 1
        eid = f'twd-{cle}-{compteur[cle]}'
        o = {'id': eid, 'type': 'web' if x['vo'] else 'serie', 'tmdb': str(tid),
             'media': 'tv', 'img': IMG + bd, 'title': x['title'], 'date': x['date']}
        if x['tags']:
            o['tags'] = x['tags']
        if x['vo']:
            # meme cle que la page Avatar : c'est elle qui pose le badge VO,
            # et seulement en francais — l'anglais n'en a que faire.
            o['lang'] = 'vo'
        if x['subitems']:
            o['subitems'] = x['subitems']
        m = minutes(tid, x['subitems'], cle)
        if m:
            RT[eid] = m
        ents.append(o)
    art = IMG + OEUVRES[e['entrees'][0]['title']][2]
    eras.append({'title': e['titre'], 'phase': e['phase'],
                 'ink': ENCRES[e['titre']], 'art': art, 'entries': ents})

DATA = {
    'id': 'twd',
    'title': 'The Walking Dead',
    'subtitle': 'In-Universe Order',
    'description': 'TV Shows · Web Series',
    'color': '#a8bf4f',
    'glow': 'rgba(168,191,79,.35)',
    'notes': '',   # rempli plus bas
    'eras': eras,
}

# ── l'accroche, decoupee dans le document ───────────────────────────────
def bloc(debut, fin=None):
    """Le texte du document entre deux reperes, sans rien reecrire."""
    i = brut.index(debut)
    j = brut.index(fin, i) if fin else len(brut)
    return brut[i:j].strip()

ICONES = {
 'cal': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
 'fb':  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 8v5l3 2"/></svg>',
 'cons':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/></svg>',
 'out': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>',
 'ok':  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
}
def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))

L = [x.strip() for x in lignes]
def apres(rep, n=1):
    """La n-ieme ligne non vide qui suit un intitule du document."""
    i = L.index(rep); out = []
    for x in L[i + 1:]:
        if x:
            out.append(x)
            if len(out) == n:
                return out[-1]
    return ''

cle = lambda titre, ico, *ps: (
    '<div class="key"><div class="key-h">' + ICONES[ico] + esc(titre) + '</div>' +
    ''.join('<p>' + esc(p) + '</p>' for p in ps) + '</div>')

DATA['notes'] = (
    '<p class="intro-lead">' + esc(L[0]) + '</p>' +
    '<div class="intro-tags"><span class="itag">' + ICONES['ok'] +
    esc(apres('', 0) or L[2]) + '</span></div>' +
    '<div class="keys-title">' + esc('How to read this') + '</div>' +
    '<div class="keys">' +
    cle('The Calendar', 'cal', apres('The Calendar')) +
    cle('Flashbacks', 'fb', apres('Flashbacks')) +
    cle("What's left out and why?", 'out', apres("What's left out and why?")) +
    '</div><div class="keys"><div class="key wide"><div class="key-h">' +
    ICONES['cons'] + esc('Consistancy') + '</div><p>' +
    esc(apres('Consistancy')) + '</p></div></div>')

CG = {
    't': CG_ST['t'],           # le gabarit anglais du site, deja relu et en ligne
    'universe': 'twd',
    'badgeLabels': {'serie': ['bs', 'TV SHOW'], 'web': ['bw', 'WEB SERIES']},
    'markLabels': {'flashback': 'FLASHBACK'},
    'badges': [],
    'faqCats': [],
    'tmdbLang': 'en-US',
    'tmdbKey': CLE,
    'img': 'https://image.tmdb.org/t/p/',
}
CG['t'] = dict(CG['t'])
CG['t']['nav'] = dict(CG['t']['nav']); CG['t']['nav']['twd'] = 'The Walking Dead'

# la question de FAQ est celle du document, « XXX » devenant le jeton du site
q = next((x['faqq'] for e in eres for x in e['entrees'] if 'faqq' in x), None)
if q:
    CG['faqCats'] = [{'key': 'quand', 'q': q.replace('XXX', '{name}')}]

ENTETE = '''/* Donnees de la timeline The Walking Dead, ecrites depuis le document de
   Niko « TWD.txt ». Les textes affiches en sont decoupes mot pour mot :
   accroche, intitules de phases, titres, dates et sous-items. Rien n'y est
   reformule — la coquille « Consistancy » et « ??? » comme date sont les
   siennes, et restent telles quelles.

   Deuxieme page du site dont la source est anglaise, comme Star Trek : le
   francais reste a ecrire.

   Les vignettes pointent les backdrops TMDB, un par oeuvre, reutilise par
   toutes les entrees de la meme serie. Flight 462 n'a pas de fiche propre
   sur TMDB — c'est la saison 0 de Fear the Walking Dead, et c'est de la
   qu'il tire sa duree et son visuel.

   Ce qui manque encore, et qui vient de Niko :
   - les niveaux. Le document annonce « Essential - Important - Optional »
     mais n'en pose aucun sur les 45 entrees ; la page n'affiche donc pas
     de filtre de niveau, comme Star Trek.
   - les reponses de FAQ. La question est la sienne, les reponses non. */
'''

os.makedirs('_proto', exist_ok=True)
with open(SORTIE, 'w', encoding='utf-8', newline='') as f:
    f.write(ENTETE)
    f.write('window.CG=' + json.dumps(CG, ensure_ascii=False) + ';\n\n')
    f.write('var DATA_TWD=' + json.dumps(DATA, ensure_ascii=False) + ';\n')
    f.write('window.TWD=DATA_TWD;\n\n')
    f.write('var RT=' + json.dumps(RT, ensure_ascii=False) + ';\nwindow.RT=RT;\n')

# ── la preuve : chaque texte affiche existe tel quel dans le document ────
import html as _h
def verifie():
    dur = []
    for e in DATA['eras']:
        dur.append(e['title']); dur.append(e['phase'])
        for x in e['entries']:
            dur.append(x['title']); dur.append(x['date'])
            dur += x.get('subitems', [])
    for m in re.findall(r'>([^<>]+)<', DATA['notes']):
        t = _h.unescape(m).strip()
        if t:
            dur.append(t)
    if CG['faqCats']:
        dur.append(CG['faqCats'][0]['q'].replace('{name}', 'XXX'))
    absents = [t for t in dur if t not in brut]
    print(f'  {len(dur)} fragments affiches, {len(absents)} absents du document')
    for a in absents:
        print('    ABSENT :', repr(a))
    return not absents

n = sum(len(e['entries']) for e in DATA['eras'])
print(f'{len(DATA["eras"])} phases, {n} entrees, {len(RT)} durees')
print(f'  duree totale : {sum(RT.values())//60} h')
print('  verification mot pour mot :')
ok = verifie()
print('  ->', 'tout vient du document' if ok else 'ECART, voir ci-dessus')
