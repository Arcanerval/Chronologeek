# Genere _proto/data-twd-en.js depuis TWD.txt, le document de Niko.
#
# Rien n'est reformule : chaque chaine affichee est decoupee dans le fichier
# source, et verifie() le prouve a la fin — 176 fragments, zero ecart. Le
# « ??? » d'une date est le sien et le reste. Deux coquilles font exception,
# corrigees a sa demande le 15 aout 2026 : voir CORRECTIONS.
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

# Flight 462 vit sur la fiche TMDB de Fear : pas de backdrop propre, et
# c'est Niko qui a fourni le visuel.
VISUELS = {'flight': '/images/Flight462.webp'}

# Les niveaux viennent de Niko, le 14 aout 2026. Le document les annonce en
# tete mais n'en posait aucun ; ils sont donnes par oeuvre, pas par entree.
# « Tales of the Walking Dead » fait exception : seul l'episode 3 compte.
NIVEAUX = {'ftwd': 'must', 'twd': 'must', 'towl': 'must', 'dd': 'must', 'dc': 'must',
           'wb': 'important'}
TALES_IMPORTANT = 'Season 1 Episodes 3'   # la coquille est celle du document

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
            # La question de FAQ du document : TWD n'a pas de FAQ, Niko l'a
            # tranche le 15 aout 2026. La ligne est lue pour ne pas etre
            # prise pour une entree, et jetee.
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
PAR_OEUVRE = {}          # les identifiants de chaque oeuvre, pour les badges
for e in eres:
    ents = []
    for x in e['entrees']:
        cle, tid, bd = OEUVRES[x['title']]
        compteur[cle] = compteur.get(cle, 0) + 1
        eid = f'twd-{cle}-{compteur[cle]}'
        PAR_OEUVRE.setdefault(cle, []).append(eid)
        niv = NIVEAUX.get(cle, 'bonus')
        if cle == 'tales':
            niv = 'important' if TALES_IMPORTANT in x['subitems'] else 'bonus'
        o = {'id': eid, 'type': 'web' if x['vo'] else 'serie', 'tmdb': str(tid),
             'media': 'tv', 'img': VISUELS.get(cle, IMG + bd),
             'title': x['title'], 'date': x['date'], 'level': niv}
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

# ── les deux coquilles corrigees, a la demande de Niko le 15 aout 2026 ───
# Le contrat du script ne change pas — rien n'est reformule — mais ces deux
# mots-la sont nommes un par un, et verifie() les compte en retouches
# admises, comme la majuscule initiale du depliant. Toute autre difference
# avec le document reste un ecart. Les cles servent aussi a retrouver la
# ligne dans le document : apres('Consistancy') cherche l'intitule tel qu'il
# y est ecrit, la correction ne vient qu'ensuite.
CORRECTIONS = {'Consistancy': 'Consistency', 'overthink to much': 'overthink too much'}
RETOUCHES = []
def corrige(s):
    t = s
    for avant, apres_ in CORRECTIONS.items():
        t = t.replace(avant, apres_)
    if t != s:
        RETOUCHES.append((s, t))
    return t

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

carte = lambda titre, ico, *ps: (
    '<div class="key"><div class="key-h">' + ICONES[ico] + esc(corrige(titre)) + '</div>' +
    ''.join('<p>' + esc(corrige(p)) + '</p>' for p in ps) + '</div>')

# « Ce qui est ecarte » est un depliant sur les quatre autres univers, et il
# l'est ici aussi : les trois reperes de lecture tiennent alors cote a cote.
ECARTE = apres("What's left out and why?")
_dt, _dd = ECARTE.split(': ', 1)
CHEVRON = ('<svg class="chev" viewBox="0 0 24 24" aria-hidden="true">'
           '<path d="m6 9 6 6 6-6"/></svg>')

DATA['notes'] = (
    '<p class="intro-lead">' + esc(L[0]) + '</p>' +
    '<div class="intro-tags"><span class="itag">' + ICONES['ok'] +
    esc(L[2]) + '</span></div>' +
    '<div class="keys-title">' + esc('How to read this') + '</div>' +
    '<div class="keys">' +
    carte('The Calendar', 'cal', apres('The Calendar')) +
    carte('Flashbacks', 'fb', apres('Flashbacks')) +
    carte('Consistancy', 'cons', apres('Consistancy')) +
    '</div>' +
    '<details class="cuts"><summary>' + esc("What's left out and why?") +
    '<span class="n">1 entry</span>' + CHEVRON + '</summary>' +
    '<div class="cuts-body"><dl class="cuts-list"><div class="cut">' +
    # la majuscule initiale est la seule retouche : la phrase est coupee en
    # deux par le gabarit, l'intitule d'un cote et la raison de l'autre.
    '<dt>' + esc(_dt) + '</dt><dd>' + esc(_dd[0].upper() + _dd[1:]) + '</dd>' +
    '</div></dl></div></details>')

# ── les badges, nommes par Niko le 14 aout 2026 ──────────────────────────
# `trigger:"last"` ne convient pas : il decoupe des tranches continues de la
# timeline, or une oeuvre est ici dispersee sur plusieurs phases — Fear
# revient en 1, 5, 7 et 10. Tout autre `trigger` fait lire `ids` tel quel,
# et c'est la liste complete des entrees de l'oeuvre.
def survivant(bid, icone, couleur, label, oeuvre, quoi):
    return {'id': bid, 'universe': 'twd', 'icon': icone, 'color': couleur,
            'trigger': 'oeuvre', 'ids': PAR_OEUVRE[oeuvre],
            'label': label, 'desc': quoi + ' completed'}

BADGES = [
    survivant('twd_la',  '🌴', '#e0a458', 'Los Angeles Survivor', 'ftwd',
              'Fear the Walking Dead'),
    survivant('twd_atl', '🍑', '#a8bf4f', 'Atlanta Survivor', 'twd',
              'The Walking Dead'),
    survivant('twd_ny',  '🗽', '#7dd3fc', 'New-York Survivor', 'dc',
              'Dead City'),
    survivant('twd_eu',  '⚜️', '#b48cf2', 'European Survivor', 'dd',
              'Daryl Dixon'),
    {'id': 'twd_ult', 'universe': 'twd', 'icon': '🧟', 'color': '#ffd700',
     'trigger': '100pct', 'ids': [], 'label': 'Ultimate Survivor',
     'desc': 'The Walking Dead 100% completed'},
]

CG = {
    't': CG_ST['t'],           # le gabarit anglais du site, deja relu et en ligne
    'universe': 'twd',
    'badgeLabels': {'serie': ['bs', 'TV SHOW'], 'web': ['bw', 'WEB SERIES']},
    'markLabels': {'flashback': 'FLASHBACK'},
    'badges': BADGES,
    # Pas de `faqCats` : TWD n'a pas de FAQ. La page ne pose donc aucun
    # volet de questions sous les fiches — c'est une cle en moins, pas une
    # liste vide, sinon le jour ou elle en aurait une on ne saurait pas si
    # elle est absente ou en attente.
    'tmdbLang': 'en-US',
    'tmdbKey': CLE,
    'img': 'https://image.tmdb.org/t/p/',
}
CG['t'] = dict(CG['t'])
CG['t']['nav'] = dict(CG['t']['nav']); CG['t']['nav']['twd'] = 'The Walking Dead'

ENTETE = '''/* Donnees de la timeline The Walking Dead, ecrites depuis le document de
   Niko « TWD.txt ». Les textes affiches en sont decoupes mot pour mot :
   accroche, intitules de phases, titres, dates et sous-items. Rien n'y est
   reformule — « ??? » comme date est le sien et reste tel quel. Seules
   deux coquilles sont corrigees, a sa demande : « Consistancy » et
   « overthink to much ». Elles sont nommees dans CORRECTIONS.

   Deuxieme page du site dont la source est anglaise, comme Star Trek : le
   francais reste a ecrire.

   Les vignettes pointent les backdrops TMDB, un par oeuvre, reutilise par
   toutes les entrees de la meme serie. Flight 462 n'a pas de fiche propre
   sur TMDB — c'est la saison 0 de Fear the Walking Dead, et c'est de la
   qu'il tire sa duree et son visuel.

   Les niveaux ne viennent pas du document — il annonce « Essential -
   Important - Optional » sans en poser aucun sur les 45 entrees. Niko les
   a donnes par oeuvre le 14 aout 2026 : voir NIVEAUX.

   Pas de FAQ : la page n'en a pas, et `faqCats` est donc absent de CG. */
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
    # Les retouches admises par la charte du depot : un intitule de structure
    # que la prose n'a pas, la majuscule qui suit un decoupage de phrase, et
    # les coquilles que Niko a demande de corriger. Toute autre absence est
    # une reecriture.
    admis = {'1 entry': 'compteur du depliant, comme sur les quatre autres pages',
             _dd[0].upper() + _dd[1:]: 'majuscule initiale apres le decoupage '
                                       'de « ' + ECARTE[:24] + '… »'}
    for avant, apres_ in RETOUCHES:
        admis[apres_] = 'coquille corrigee : « ' + avant[:44] + ' »'
    absents = [t for t in dur if t not in brut]
    ecarts = [a for a in absents if a not in admis]
    print(f'  {len(dur)} fragments affiches, {len(absents) - len(ecarts)} '
          f'retouche(s) admise(s), {len(ecarts)} ecart(s)')
    for a in absents:
        if a in admis:
            print('    admis  :', repr(a[:48]), '—', admis[a])
    for a in ecarts:
        print('    ECART  :', repr(a))
    return not ecarts

n = sum(len(e['entries']) for e in DATA['eras'])
niv = {}
for er in DATA['eras']:
    for x in er['entries']:
        niv[x['level']] = niv.get(x['level'], 0) + 1
print(f'{len(DATA["eras"])} phases, {n} entrees, {len(RT)} durees')
print(f'  niveaux : {niv.get("must",0)} essentielles, {niv.get("important",0)} '
      f'importantes, {niv.get("bonus",0)} optionnelles')
print(f'  badges  : ' + ', '.join(f'{b["label"]} ({len(b["ids"]) or "100 %"})'
                                  for b in BADGES))
print(f'  duree totale : {sum(RT.values())//60} h')
print('  verification mot pour mot :')
ok = verifie()
print('  ->', 'tout vient du document' if ok else 'ECART, voir ci-dessus')
