# Genere _proto/data-dragonage-en.js depuis « Dragon Age.txt », le document
# de Niko.
#
# Meme contrat que construire-twd.py : rien n'est reformule. Chaque chaine
# affichee est decoupee dans le fichier source, et verifie() le prouve a la
# fin. Les seules retouches admises sont nommees une par une — les intitules
# de structure que la prose n'a pas (titres de phases, etiquettes du
# depliant), la majuscule qui suit un decoupage de phrase, et les coquilles
# listees dans CORRECTIONS.
#
#   py _proto/construire-dragonage.py [chemin/vers/Dragon Age.txt]
#
# Troisieme page du site dont la source est anglaise, apres Star Trek et
# The Walking Dead : le francais reste a ecrire.
#
# Le script n'appelle aucune API — les visuels et les identifiants sont
# poses en dur dans OEUVRES, releves une fois sur RAWG et TMDB. Un guide
# de jeux video n'a pas de durees a sommer : pas de table RT ici, pour la
# meme raison qu'Avatar Legends n'en a pas (voir CLAUDE.md).
import json, re, os, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\nprad\Desktop\Dragon Age.txt'
SORTIE = '_proto/data-dragonage-en.js'
brut = open(SRC, encoding='utf-8').read()
lignes = brut.split('\n')

# ── les cles vivent deja dans les fichiers de donnees du site ────────────
_st = open('_proto/data-startrek-en.js', encoding='utf-8').read()
CG_ST, _ = json.JSONDecoder().raw_decode(_st[_st.index('window.CG=') + 10:])
_sw = open('_proto/data-en.js', encoding='utf-8').read()
CG_SW, _ = json.JSONDecoder().raw_decode(_sw[_sw.index('window.CG=') + 10:])

RAWG = 'https://media.rawg.io/media/'
TMDB = 'https://image.tmdb.org/t/p/w780'

# ── les trente-six oeuvres ───────────────────────────────────────────────
# (cle, visuel, identifiant de fiche, type de fiche)
#
# `fiche` vaut 'game' pour ce que RAWG connait, 'movie'/'tv' pour ce que
# TMDB connait, et '' pour le reste — livres et comics, qu'aucune des deux
# API ne couvre. Le depliant se rabat alors sur `desc`, comme sur Avatar.
#
# Les six DLC d'Origins et « The Exiled Prince » ne sont pas dans RAWG :
# ils reprennent le visuel de leur jeu et n'ont pas de fiche. Ce n'est pas
# un oubli, c'est le catalogue.
#
# Les livres et les neuf comics n'ont pas de visuel : Niko les fournira.
# La page pose alors son repli de vignette plutot qu'une image morte.
G_ORIGINS = RAWG + 'games/dc0/dc0926d3f84ffbcc00968fe8a6f0aed3.jpg'
G_AWAK    = RAWG + 'games/736/736e1e2e7670169114a48b5f65f66bdb.jpg'
G_DA2     = RAWG + 'games/974/974d08635981db7677630327ce1fe4bb.jpg'
G_INQ     = RAWG + 'games/260/26023c855f1769a93411d6a7ea084632.jpeg'
G_VEIL    = RAWG + 'games/4c5/4c5a391237b78ea96aeff8206f63d3f5.jpg'

OEUVRES = {
  # ── jeux ──────────────────────────────────────────────────────────────
  'Dragon Age: Origins':            ('origins',    G_ORIGINS, '4639',   'game'),
  'Dragon Age: Origins - Awakening':('awakening',  G_AWAK,    '19430',  'game'),
  'Dragon Age II':                  ('da2',        G_DA2,     '28580',  'game'),
  'Dragon Age: Inquisition':        ('inquisition',G_INQ,     '28559',  'game'),
  'Dragon Age: The Veilguard':      ('veilguard',  G_VEIL,    '274764', 'game'),
  # ── DLC ───────────────────────────────────────────────────────────────
  'The Stone Prisoner':             ('stone',      G_ORIGINS, '',       ''),
  "Warden's Keep":                  ('keep',       G_ORIGINS, '',       ''),
  "Leliana's Song":                 ('leliana',    G_ORIGINS, '',       ''),
  'Return to Ostagar':              ('ostagar',    G_ORIGINS, '',       ''),
  'The Golems of Amgarrak':         ('amgarrak',   G_AWAK,    '',       ''),
  'Witch Hunt':                     ('witch',      G_AWAK,    '',       ''),
  'The Exiled Prince':              ('exiled',     G_DA2,     '',       ''),
  'Mark of the Assassin':           ('assassin',   RAWG + 'screenshots/bd7/bd74223c216bbcb5fcfeb4f2ddc6b2af.jpg', '41133',  'game'),
  'Legacy':                         ('legacy',     RAWG + 'screenshots/2e8/2e838f271008f72a87f719d703c20329.jpg', '40986',  'game'),
  'Jaws of Hakkon':                 ('hakkon',     RAWG + 'games/554/554855083014e6af5f89eeb5889d75ed.jpg',      '43222',  'game'),
  'The Descent':                    ('descent',    RAWG + 'games/9a9/9a95201b9b5f3e463d7f9beab4d7f4fa.jpg',      '409583', 'game'),
  'Trespasser':                     ('trespasser', RAWG + 'games/a09/a09c80331539e7d594c2e6cd56786c5e.jpg',      '395969', 'game'),
  # ── ecran ─────────────────────────────────────────────────────────────
  "Dragon Age: Warden's Fall":      ('wfall',      '',        '',       ''),
  'Dragon Age: Redemption':         ('redemption', TMDB + '/g6WNyvrMi6i5PexNxVOIvApHrZX.jpg', '38973',  'tv'),
  'Dragon Age: Dawn of the Seeker': ('seeker',     TMDB + '/iiEAEgrNS11aaYJwIi5GZc9ETBB.jpg', '103173', 'movie'),
  'Dragon Age: Absolution':         ('absolution', TMDB + '/3dYjbAgynVeh0aHQAoxcw2UswqA.jpg', '203805', 'tv'),
  # ── ecrit : aucun visuel, Niko les fournira ───────────────────────────
  'Dragon Age: The Stolen Throne':  ('throne',     '', '', ''),
  'Dragon Age: The Calling':        ('calling',    '', '', ''),
  'Dragon Age: Asunder':            ('asunder',    '', '', ''),
  'Dragon Age: Last Flight':        ('lastflight', '', '', ''),
  'Dragon Age: The Masked Empire':  ('masked',     '', '', ''),
  'Tevinter Nights':                ('tevinter',   '', '', ''),
  'Dragon Age: The Silent Grove':   ('grove',      '', '', ''),
  'Dragon Age: Those Who Speak':    ('speak',      '', '', ''),
  'Dragon Age: Until We Sleep':     ('sleep',      '', '', ''),
  'Dragon Age: Magekiller':         ('magekiller', '', '', ''),
  'Dragon Age: Knight Errant':      ('errant',     '', '', ''),
  'Dragon Age: Deception':          ('deception',  '', '', ''),
  'Dragon Age: Blue Wraith':        ('wraith',     '', '', ''),
  'Dragon Age: Dark Fortress':      ('fortress',   '', '', ''),
  'Dragon Age: The Missing':        ('missing',    '', '', ''),
}

# ── les types du document, vers ceux de la page ──────────────────────────
# « DLC » n'est pas un type du document mais un mot pose devant le titre :
# « VIDEO GAME 9:30 DLC The Stone Prisoner ». La legende du document le
# compte pourtant parmi les types de medias, et il en devient un ici.
TYPES = {'VIDEO GAME': 'jeu', 'BOOK': 'roman', 'COMIC': 'comic', 'VIDEO': 'video',
         'WEB SERIES': 'web', 'ANIMATED MOVIE': 'filmanim', 'ANIMATED SHOW': 'anime'}

# ── les niveaux ──────────────────────────────────────────────────────────
# Le document annonce « Essential / important / optional » sans en poser
# aucun sur les 43 entrees. Sa deuxieme ligne tranche pourtant la moitie du
# probleme : « If you just want to discover the games in chronological
# order uncheck the rest, all other medias are bonus content (some very
# important) ». Les jeux et leurs DLC sont donc essentiels, le reste est
# optionnel — et les « some very important » restent a nommer par Niko.
NIVEAU_JEU = 'must'
NIVEAU_AUTRE = 'bonus'

# ── les phases ───────────────────────────────────────────────────────────
# Le document n'en a pas : c'est une liste continue de 43 entrees. Les six
# titres ci-dessous sont des intitules de structure, pas de la prose de
# Niko — la seule chose ecrite ici qui ne vienne pas du document, avec les
# etiquettes du depliant. Chaque phase demarre a l'entree nommee.
PHASES = [
  ('The Fifth Blight',        1, ('Dragon Age: Origins', '9:30')),
  ('The Grey Wardens',        2, ('Dragon Age: The Stolen Throne', '8:96-8:99')),
  ('The Champion of Kirkwall',3, ('Dragon Age II', '9:30-9:31')),
  ('The Mage-Templar War',    4, ('Dragon Age: Dawn of the Seeker', '9:22')),
  ('The Inquisition',         5, ('Dragon Age: Inquisition', '9:41')),
  ('The Dread Wolf Rises',    6, ('Dragon Age: Magekiller', '~9:41')),
]
# le visuel de bande, un par phase
ARTS = [G_ORIGINS, G_AWAK, G_DA2, TMDB + '/iiEAEgrNS11aaYJwIi5GZc9ETBB.jpg',
        G_INQ, G_VEIL]

# ── les coquilles, corrigees et nommees ──────────────────────────────────
# Meme regle que pour The Walking Dead : le contrat du script ne change
# pas — rien n'est reformule — mais ces mots-la sont nommes un par un, et
# verifie() les compte en retouches admises.
CORRECTIONS = {
    'omnniscience': 'omniscience',
    'inconstencies': 'inconsistencies',
    'in order to determine': 'in order to determine',   # inchange, garde-place
}
CORRECTIONS = {k: v for k, v in CORRECTIONS.items() if k != v}
RETOUCHES = []
def corrige(s):
    t = s
    for avant, apres_ in CORRECTIONS.items():
        t = t.replace(avant, apres_)
    if t != s:
        RETOUCHES.append((s, t))
    return t

# ── lecture du document ──────────────────────────────────────────────────
DEBUT = 'VIDEO GAME 9:30 Dragon Age: Origins'
CLE_TYPE = re.compile(r'^(' + '|'.join(sorted(TYPES, key=len, reverse=True)) + r')\s+(.*)$')

def lire():
    corps = brut[brut.index(DEBUT):].split('\n')
    out, e = [], None
    for l in corps:
        s = l.strip()
        if not s:
            continue
        m = CLE_TYPE.match(s)
        if m:
            typ, reste = TYPES[m.group(1)], m.group(2)
            tags = []
            if reste.startswith('FLASHBACK '):
                tags.append('flashback'); reste = reste[len('FLASHBACK '):]
            date, titre = reste.split(' ', 1)
            if titre.startswith('DLC '):
                typ, titre = 'dlc', titre[4:]
            e = {'type': typ, 'date': date, 'title': titre.strip(), 'tags': tags,
                 'subitems': [], 'desc': '', 'faq': None, 'link': ''}
            out.append(e)
            continue
        if e is None:
            continue
        if s.startswith('http'):
            e['link'] = s
        elif s.startswith('Why ') and s.endswith('?'):
            e['faq'] = [s, '']            # la reponse est la ligne suivante
        elif e['faq'] is not None and e['faq'][1] == '':
            e['faq'][1] = s
        elif s.endswith('.'):
            # une phrase ponctuee decrit l'oeuvre ; une ligne sans point
            # place la lecture dans le jeu (« Early Act 1 », « Endgame »).
            e['desc'] = (e['desc'] + ' ' + s).strip()
        else:
            e['subitems'].append(s)
    return out

ENTREES = lire()

# ── construction ─────────────────────────────────────────────────────────
# Les questions du document changent de verbe selon le media — « Why play »,
# « Why read », « Why watch » — et « XXX » y tient la place du titre. Ce
# sont donc trois categories de FAQ, et chaque entree n'en porte qu'une.
VERBES = {'play': 'play', 'read': 'read', 'watch': 'watch'}
FAQ_Q = {}      # verbe -> question du document, telle quelle

depart = {p[2]: i for i, p in enumerate(PHASES)}
compteur, eras, PAR_OEUVRE = {}, [], {}
courante = None
ouvertes = set()
for x in ENTREES:
    k = (x['title'], x['date'])
    # Une phase s'ouvre a la *premiere* occurrence de son entree : « Dragon
    # Age: Origins 9:30 » revient quatre fois dans le document, une par
    # tranche du jeu, et les trois suivantes ne doivent rien ouvrir.
    if k in depart and k not in ouvertes:
        ouvertes.add(k)
        i = depart[k]
        courante = {'title': PHASES[i][0], 'phase': 'PHASE %d' % (i + 1),
                    'ink': PHASES[i][1], 'art': ARTS[i], 'entries': []}
        eras.append(courante)
    if courante is None:
        raise SystemExit('entree avant la premiere phase : ' + repr(k))
    cle, img, fid, fiche = OEUVRES[x['title']]
    compteur[cle] = compteur.get(cle, 0) + 1
    eid = 'da-%s-%d' % (cle, compteur[cle])
    PAR_OEUVRE.setdefault(cle, []).append(eid)
    o = {'id': eid, 'type': x['type'],
         'level': NIVEAU_JEU if x['type'] in ('jeu', 'dlc') else NIVEAU_AUTRE,
         'tmdb': fid or '0', 'media': fiche or 'tv',
         'title': x['title'], 'date': x['date']}
    if img:
        o['img'] = img
    if x['tags']:
        o['tags'] = x['tags']
    if x['subitems']:
        o['subitems'] = x['subitems']
    if x['desc']:
        o['desc'] = corrige(x['desc'])
    if x['link']:
        # le document donne deux adresses YouTube nues : la video sur la
        # fin de Kristoff, et la liste de lecture de Redemption. Le libelle
        # du bouton est celui de la page, pas du document.
        o['link'] = {'href': x['link'],
                     'label': 'Watch on YouTube'}
    if x['faq']:
        q, r = x['faq']
        v = 'play' if ' play ' in q else ('read' if ' read ' in q else 'watch')
        FAQ_Q.setdefault(v, q)
        o['faq'] = {v: corrige(r)}
    courante['entries'].append(o)

# ── l'accroche, decoupee dans le document ───────────────────────────────
ICONES = {
 'cal': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
 'fb':  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 8v5l3 2"/></svg>',
 'can': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/></svg>',
 'ok':  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
}
def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))

L = [x.strip() for x in lignes]
def apres(rep, n=99):
    """Les lignes non vides qui suivent un intitule, jusqu'au vide suivant."""
    i = L.index(rep); out = []
    for x in L[i + 1:]:
        if not x:
            break
        out.append(x)
        if len(out) == n:
            break
    return out

carte = lambda titre, ico, ps: (
    '<div class="key"><div class="key-h">' + ICONES[ico] + esc(titre) + '</div>' +
    ''.join('<p>' + esc(corrige(p)) + '</p>' for p in ps) + '</div>')

# ── le depliant « ce qui est ecarte » ────────────────────────────────────
# Les huit phrases du document sont reprises entieres. L'etiquette de
# gauche, elle, n'existe pas dans la prose : c'est un intitule de
# structure, comme les titres de phases.
ECARTES = apres('WHAT LEFT OUT ?')
ETIQUETTES = ['Dragon Age (IDW, 2010)', 'The Darkspawn Chronicles',
              'Hard in Hightown', 'The Final Conversation', 'The webcomics',
              'The short stories', 'Browser and mobile games',
              'Vows and Vengeance']
assert len(ECARTES) == len(ETIQUETTES), (len(ECARTES), ECARTES)
CHEVRON = ('<svg class="chev" viewBox="0 0 24 24" aria-hidden="true">'
           '<path d="m6 9 6 6 6-6"/></svg>')

NOTES = (
    '<p class="intro-lead">' + esc(corrige(L[0])) + ' ' + esc(corrige(L[1])) + '</p>' +
    '<div class="intro-tags"><span class="itag">' + ICONES['ok'] +
    esc(L[3]) + '</span></div>' +
    '<div class="keys-title">How to read this</div>' +
    '<div class="keys">' +
    carte('The Calendar', 'cal', apres('THE CALENDAR')) +
    carte('Flashbacks and DLC placement', 'fb', apres('FLASHBACKS AND DLC PLACEMENT')) +
    carte('Canonicity', 'can', apres('CANONICITY')) +
    '</div>' +
    '<details class="cuts"><summary>What&#x27;s left out and why?' +
    '<span class="n">' + str(len(ECARTES)) + ' entries</span>' + CHEVRON + '</summary>' +
    '<div class="cuts-body"><dl class="cuts-list">' +
    ''.join('<div class="cut"><dt>' + esc(t) + '</dt><dd>' + esc(corrige(p)) + '</dd></div>'
            for t, p in zip(ETIQUETTES, ECARTES)) +
    '</div></dl></div></details>')

DATA = {
    'id': 'dragonage',
    'title': 'Dragon Age',
    'subtitle': 'Chronological Timeline',
    'description': 'Games · Books · Comics',
    'color': '#e07b39',
    'glow': 'rgba(224,123,57,.35)',
    'notes': NOTES,
    'eras': eras,
}

# ── les badges ───────────────────────────────────────────────────────────
# `trigger:"oeuvre"` comme sur The Walking Dead : une oeuvre est ici
# dispersee sur plusieurs phases, et `last` decouperait des tranches
# continues de la timeline.
def badge(bid, icone, couleur, label, ids, quoi):
    return {'id': bid, 'universe': 'dragonage', 'icon': icone, 'color': couleur,
            'trigger': 'oeuvre', 'ids': ids, 'label': label,
            'desc': quoi + ' completed'}

LIVRES = [i for c in ('throne', 'calling', 'asunder', 'lastflight', 'masked',
                      'tevinter') for i in PAR_OEUVRE.get(c, [])]
COMICS = [i for c in ('grove', 'speak', 'sleep', 'magekiller', 'errant',
                      'deception', 'wraith', 'fortress', 'missing')
          for i in PAR_OEUVRE.get(c, [])]

BADGES = [
  badge('da_warden',   '🛡️', '#8fb8de', 'Grey Warden',
        PAR_OEUVRE['origins'] + PAR_OEUVRE['awakening'], 'Dragon Age: Origins'),
  badge('da_champion', '⚔️', '#e07b39', 'Champion of Kirkwall',
        PAR_OEUVRE['da2'], 'Dragon Age II'),
  badge('da_inquis',   '☀️', '#f5c842', 'Inquisitor',
        PAR_OEUVRE['inquisition'], 'Dragon Age: Inquisition'),
  badge('da_loremaster','📖', '#a99cf9', 'Loremaster of Thedas',
        LIVRES + COMICS, 'Every book and comic'),
  {'id': 'da_dread', 'universe': 'dragonage', 'icon': '🐺', 'color': '#ffd700',
   'trigger': '100pct', 'ids': [], 'label': 'The Dread Wolf',
   'desc': 'Dragon Age 100% completed'},
]

CG = {
    't': dict(CG_ST['t']),      # le gabarit anglais du site, deja relu et en ligne
    'universe': 'dragonage',
    'badgeLabels': {'jeu': ['bj', 'VIDEO GAME'], 'dlc': ['bd', 'DLC'],
                    'roman': ['br', 'BOOK'], 'comic': ['bc', 'COMIC'],
                    'video': ['bv', 'VIDEO'], 'web': ['bw', 'WEB SERIES'],
                    'filmanim': ['bfa', 'ANIMATED MOVIE'],
                    'anime': ['ba', 'ANIMATED SHOW']},
    'markLabels': {'flashback': 'FLASHBACK'},
    'badges': BADGES,
    # Les trois questions sont celles du document, verbe compris. Une
    # entree n'en porte qu'une : la page saute les categories sans
    # reponse, sinon chaque fiche afficherait deux volets vides.
    'faqCats': [{'key': v, 'q': FAQ_Q[v].replace('XXX', '{name}')}
                for v in ('play', 'read', 'watch') if v in FAQ_Q],
    'resetMsg': 'Reset your Dragon Age progress?',
    'tmdbLang': 'en-US',
    'tmdbKey': CG_ST['tmdbKey'],
    'rawgKey': CG_SW['rawgKey'],
    'img': 'https://image.tmdb.org/t/p/',
}
CG['t']['nav'] = dict(CG['t']['nav']); CG['t']['nav']['dragonage'] = 'Dragon Age'

ENTETE = '''/* Donnees de la timeline Dragon Age, ecrites depuis le document de Niko
   « Dragon Age.txt ». Les textes affiches en sont decoupes mot pour mot :
   accroche, reperes de lecture, titres, dates, notes de placement et
   reponses de FAQ. Rien n'y est reformule.

   Trois choses seulement sont ecrites ici, et elles sont nommees dans
   `construire-dragonage.py` : les six titres de phases (PHASES), les huit
   etiquettes du depliant (ETIQUETTES) et le libelle des deux boutons
   YouTube. Le document n'a ni l'un ni l'autre.

   Troisieme page dont la source est anglaise, apres Star Trek et The
   Walking Dead : le francais reste a ecrire.

   Les visuels des jeux viennent de RAWG, ceux de l'ecran de TMDB. Les six
   livres et les neuf comics n'en ont aucun — aucune des deux API ne les
   couvre, et Niko les fournira.

   Les niveaux ne viennent pas du document : il annonce « Essential /
   important / optional » sans en poser aucun. Sa deuxieme ligne donne
   les jeux pour essentiels et le reste pour optionnel, et c'est ce qui
   est applique. Les « some very important » restent a nommer.

   Pas de table RT : un guide de jeux video n'a pas de duree a sommer,
   meme raison qu'Avatar Legends. */
'''

os.makedirs('_proto', exist_ok=True)
with open(SORTIE, 'w', encoding='utf-8', newline='') as f:
    f.write(ENTETE)
    f.write('window.CG=' + json.dumps(CG, ensure_ascii=False) + ';\n\n')
    f.write('var DATA_DA=' + json.dumps(DATA, ensure_ascii=False) + ';\n')
    f.write('window.DRAGONAGE=DATA_DA;\n')

# ── la preuve : chaque texte affiche existe tel quel dans le document ────
import html as _h
def verifie():
    dur = []
    for e in DATA['eras']:
        dur.append(e['title']); dur.append(e['phase'])
        for x in e['entries']:
            dur.append(x['title']); dur.append(x['date'])
            dur += x.get('subitems', [])
            if x.get('desc'):
                dur.append(x['desc'])
            for r in (x.get('faq') or {}).values():
                dur.append(r)
    for c in CG['faqCats']:
        dur.append(c['q'].replace('{name}', 'XXX'))
    for m in re.findall(r'>([^<>]+)<', DATA['notes']):
        t = _h.unescape(m).strip()
        if t:
            dur.append(t)
    admis = {}
    for i, p in enumerate(PHASES):
        admis[p[0]] = 'titre de phase : le document est une liste continue'
        admis['PHASE %d' % (i + 1)] = 'numero de phase, comme sur The Walking Dead'
    # L'accroche est faite des deux premieres lignes du document, cote a
    # cote : chacune y est mot pour mot, seul le raccord est ecrit.
    admis[esc(corrige(L[0])) and corrige(L[0]) + ' ' + corrige(L[1])] = (
        'les deux premieres lignes du document, mises bout a bout')
    # Les trois reperes de lecture sont ecrits en capitales dans le
    # document ; les cartes du site les portent en casse de titre.
    for t, s in (('The Calendar', 'THE CALENDAR'),
                 ('Flashbacks and DLC placement', 'FLASHBACKS AND DLC PLACEMENT'),
                 ('Canonicity', 'CANONICITY')):
        admis[t] = 'casse de titre : le document ecrit « %s »' % s
    for i, t in enumerate(ETIQUETTES):
        admis[t] = 'etiquette du depliant : la phrase entiere est en face'
    admis['%d entries' % len(ECARTES)] = 'compteur du depliant, comme sur les cinq autres pages'
    admis['How to read this'] = 'intitule de section, comme sur les cinq autres pages'
    admis["What's left out and why?"] = ('intitule du depliant : le document ecrit '
                                         '« WHAT LEFT OUT ? » en tete de section')
    for avant, apres_ in RETOUCHES:
        admis[apres_] = 'coquille corrigee : « ' + avant[:60] + ' »'
    absents = [t for t in dur if t not in brut]
    ecarts = [a for a in absents if a not in admis]
    print('  %d fragments affiches, %d retouche(s) admise(s), %d ecart(s)'
          % (len(dur), len(absents) - len(ecarts), len(ecarts)))
    vus = set()
    for a in absents:
        if a in admis and a not in vus:
            vus.add(a); print('    admis  :', repr(a[:52]), '—', admis[a])
    for a in ecarts:
        print('    ECART  :', repr(a))
    return not ecarts

n = sum(len(e['entries']) for e in DATA['eras'])
typ, niv = {}, {}
for er in DATA['eras']:
    for x in er['entries']:
        typ[x['type']] = typ.get(x['type'], 0) + 1
        niv[x['level']] = niv.get(x['level'], 0) + 1
print('%d phases, %d entrees, %d oeuvres' % (len(DATA['eras']), n, len(PAR_OEUVRE)))
print('  types   : ' + ', '.join('%s %d' % (k, v) for k, v in sorted(typ.items())))
print('  niveaux : %d essentielles, %d importantes, %d optionnelles'
      % (niv.get('must', 0), niv.get('important', 0), niv.get('bonus', 0)))
print('  visuels : %d entrees avec vignette, %d sans'
      % (sum(1 for e in DATA['eras'] for x in e['entries'] if x.get('img')),
         sum(1 for e in DATA['eras'] for x in e['entries'] if not x.get('img'))))
print('  faq     : ' + ', '.join(c['key'] for c in CG['faqCats']))
print('  badges  : ' + ', '.join('%s (%s)' % (b['label'], len(b['ids']) or '100 %')
                                 for b in BADGES))
print('  verification mot pour mot :')
ok = verifie()
print('  ->', 'tout vient du document' if ok else 'ECART, voir ci-dessus')
