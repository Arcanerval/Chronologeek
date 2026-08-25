# -*- coding: utf-8 -*-
# Recolte les resumes des romans, comics, videos et fictions audio du guide
# Assassin's Creed, et les ecrit dans `_proto/desc-assassinscreed.json`.
# `construire-assassinscreed.mjs` les pose ensuite en `desc`.
#
#   py _proto/descriptions-assassinscreed.py [--check]
#
# POURQUOI un fichier plutot qu'un appel a l'ouverture de la fiche.
#
# Meme raison que Dragon Age, dont ce script reprend l'extraction ligne pour
# ligne. Le depliant de la page appelle RAWG pour les jeux et les DLC, TMDB
# pour le film. Restent quarante-huit romans et comics, six videos et une
# fiction audio qu'aucune API de jeu ou de film ne couvre — Open Library
# n'a de couverture que pour une partie des romans et jamais de resume pour
# les comics, et Google Books a un quota par adresse IP.
#
# Le wiki Assassin's Creed les a tous. On passe par l'API MediaWiki
# standard, jamais par `/api/v1` de Fandom qui rend 403 — c'est ce que
# `radar.py` fait deja pour Wookieepedia, et `descriptions-dragonage.py`
# pour le wiki Dragon Age.
#
# La recolte est faite ICI et pas dans la page : ces textes ne bougent plus,
# un appel de plus a l'ouverture d'une fiche coute une requete a chaque
# visiteur, et Fandom n'est pas une API publique — un WAF, pas d'en-tete
# CORS garanti.
#
# CE QUI EST PRIS. La section « Synopsis » quand l'article en a une : c'est
# la quatrieme de couverture, ecrite pour ne rien devoiler. Sinon les
# premieres phrases de l'introduction. Jamais la section « Plot », qui
# raconte l'histoire jusqu'a la fin — le guide est sans spoiler.
#
# LA PAGE DU WIKI SE RESOUT, ELLE NE SE DEVINE PAS. Le guide nomme les
# comics par leur titre d'arc (« Assassin's Creed: Assassins - Setting
# Sun »), le wiki par leur titre de recueil (« Assassin's Creed Volume 2:
# Setting Sun ») : chercher la page a l'identique n'en trouverait que la
# moitie. La resolution passe donc par la recherche du wiki, avec trois
# regles et une table d'exceptions — et le titre resolu est ECRIT dans le
# JSON, pour qu'on voie sur quoi le resume a ete pris.
import io, json, re, html, sys, time, urllib.parse, urllib.request

API = 'https://assassinscreed.fandom.com/api.php'
DATA = '_proto/data-assassinscreed-en.js'
OUT = '_proto/desc-assassinscreed.json'
CHECK = '--check' in sys.argv

# Les formes de media que ni RAWG ni TMDB ne couvrent.
FORMES = ('roman', 'comic', 'video', 'audio')

# ET SIX JEUX ET DLC, PARCE QUE RAWG NE LES COUVRE PAS NON PLUS. Le
# depliant appelle RAWG pour les jeux, et `rawgSyn()` y prend la premiere
# ligne de plus de quatre-vingts signes. Six fiches ne rendent rien
# d'utilisable :
#
#   Brotherhood     4 200 signes de bonus d'edition, pas une ligne
#                   d'intrigue — la fiche ouvrait sur « Digital Deluxe
#                   Edition2 Exclusive Single-Player Maps: The Trajan
#                   Market & The Aqueduct » ;
#   Altair's Chronicles  un vrai texte, mais coupe aux retours a la ligne :
#                   la premiere ligne s'arrete sur « As the direct prequel
#                   of the critically acclaimed console title » ;
#   Tyranny of King Washington, The Last Maharaja, Jack the Ripper et
#   Wrath of the Druids  aucune description du tout, et la fiche affichait
#                   « No synopsis available ».
#
# Le wiki les a tous. Ce sont les seuls jeux de la liste : les quarante-huit
# autres fiches RAWG rendent une description correcte, et un resume fige
# vaudrait moins que la leur, qui se met a jour toute seule.
JEUX_SANS_RAWG = (
    'ac-brotherhood-1', 'ac-brotherhood-2', 'ac-altairs-chronicles-1',
    'ac-the-tyranny-of-1', 'ac-the-last-maharaja-1', 'ac-jack-the-ripper-1',
    'ac-wrath-of-the-1',
)

# Les pages que la recherche ne trouve pas, ou trouve mal. Chacune a sa
# raison, et une valeur vide veut dire « pas de page, pas de resume ».
EXCEPTIONS = {
    # Le premier resultat est le personnage Black Cross, pas le recueil.
    'ac-templars-black-cross-1': "Assassin's Creed: Templars – Volume 1: Black Cross",
    # « The Setting Sun » est un souvenir de jeu ; le comic est le recueil.
    'ac-assassins-setting-sun-1': "Assassin's Creed Volume 2: Setting Sun",
    # La recherche rend la page de la SERIE de romans ; l'entree est le
    # premier tome, qui a la sienne.
    'ac-last-descendants-1': "Assassin's Creed: Last Descendants",
    # Une video d'ARG diffusee sur YouTube : le wiki n'a pas d'article qui
    # la decrive, seulement des pages sur Abstergo. Rien vaut mieux qu'un
    # resume qui parle d'autre chose.
    'ac-iii-abstergo-hacked-1': '',
    # La recherche rendait « Assassin's Creed: Multiplayer Rearmed », qui
    # est un autre mode ; le programme d'entrainement a sa page.
    'ac-brotherhood-revelations-animi-1': 'Animi Training Program',
    # « (novel) » est une ebauche de deux lignes ; Dynasty est un manhua, et
    # c'est la page sans parenthese qui porte son resume d'editeur.
    'ac-dynasty-1': "Assassin's Creed: Dynasty",
    # « Jack the Ripper » sans parenthese est le PERSONNAGE : la recherche
    # rendait sa biographie, qui raconte sa trahison de Jacob Frye. Le DLC a
    # sa page, et elle porte le synopsis officiel.
    'ac-jack-the-ripper-1': 'Jack the Ripper (DLC)',
}

# La quatrieme de couverture, sous les noms que le wiki lui donne. Le
# wiki AC ecrit « Blurb » ou « Publisher's summary » la ou le wiki Dragon
# Age ecrit « Synopsis » — Underworld, The Silk Road et Dynasty sortaient
# « sans texte » alors que leur dos de livre est la, en entier.
# « Official synopsis » est le texte d'Ubisoft, et il passe avant « Synopsis »
# quand les deux sont la : sur les DLC, la seconde section raconte l'histoire
# jusqu'a la fin. The Tyranny of King Washington ressortait sur « By
# collecting Lucid Memory Fragments, it is shown that... » — un spoiler, dans
# un guide qui n'en pose pas. `recolte()` prend la premiere section trouvee
# dans l'ordre de l'article, et « Official synopsis » y est toujours au-dessus.
QUATRIEME = ('official synopsis', 'blurb', "publisher's summary", 'synopsis',
             'description')

# Un recueil relie a souvent deux pages : celle du recueil et celle de
# l'edition. On veut la premiere.
ECARTE = re.compile(r'\((?:audiobook|hardcover|TPB|paperback|soundtrack|Gallery)\)\s*$', re.I)


def api(**p):
    p['format'] = 'json'
    u = API + '?' + urllib.parse.urlencode(p)
    r = urllib.request.Request(u, headers={'User-Agent': 'Chronologeek/1.0'})
    return json.loads(urllib.request.urlopen(r, timeout=30).read().decode('utf-8'))


def resout(titre):
    """La page du wiki qui decrit cette oeuvre, ou ''.

    Trois regles, dans cet ordre : le titre exact s'il existe ; sinon le
    premier resultat qui commence par « Assassin's Creed » — c'est ce qui
    separe le recueil du personnage ou du souvenir qui porte le meme nom ;
    sinon le premier resultat. Les editions (audiobook, hardcover, TPB)
    sont ecartees d'emblee : elles decrivent un objet, pas une histoire."""
    r = api(action='query', list='search', srsearch=titre, srlimit=5)
    hits = [h['title'] for h in r['query']['search']]
    hits = [h for h in hits if not ECARTE.search(h)] or hits
    if titre in hits:
        return titre
    marque = [h for h in hits if h.lower().startswith("assassin's creed")]
    return (marque or hits or [''])[0]


# ── extraction : reprise mot pour mot de `descriptions-dragonage.py` ────
def net(t):
    """Du HTML de paragraphe vers du texte suivi."""
    t = re.sub(r'<sup.*?</sup>', ' ', t, flags=re.S)      # les appels de note [1]
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t).replace(u'\xa0', ' ')
    # Le wiki laisse une espace avant la ponctuation quand un lien la precede.
    t = re.sub(u'\\s+([,.;:!?\u2019\'])', r'\1', t)
    # Le tiret garde ses deux espaces. La regle d'origine, reprise du wiki
    # Dragon Age, rognait celle de gauche — et les titres de recueils
    # sortaient « Assassin's Creed: Templars– Volume 1 ».
    t = re.sub(u'\\s*([\u2014\u2013])\\s*', u' \\1 ', t)
    return re.sub(r'\s+', ' ', t).strip()


# Les paragraphes, et rien d'autre : le texte brut d'une section ramene
# aussi l'infobox et les crochets du lien « modifier » de chaque titre.
PARA = re.compile(r'<(p|blockquote)\b[^>]*>(.*?)</\1>', re.S)


def texte(brut):
    brut = re.sub(r'<span class="mw-editsection".*?</span></span>', ' ', brut, flags=re.S)
    return [p for p in (net(m.group(2)) for m in PARA.finditer(brut))
            if len(p) > 40 and not BANDEAU.match(p)]


CHAPEAU = re.compile(r'^(?:For |This article |Not to be confused).*?\.\s*', re.I)
# Les bandeaux de maintenance du wiki sont des <p> comme les autres, et le
# premier paragraphe d'un article est souvent l'un d'eux. « Please improve
# it in any way necessary », « It has been proposed that this page be
# merged » : c'est la seule chose qui ne parle pas de l'oeuvre du tout, et
# elle ressortait en resume sur quatre fiches.
BANDEAU = re.compile(r'^(?:Please |It has been proposed|This (?:page|article|section) '
                     r'(?:is|has|needs|may|contains)|The (?:following|contents of this)|'
                     r'Spoiler|Out-of-universe|Merge)', re.I)
CREDITS = re.compile(r'^(?:Written|Script|Art|Illustrat|Cover|Colou?r|Letter|Published)', re.I)
RACONTE = re.compile(r'\b(tells|follows|story|stories|centers?|centres?|takes? place|'
                     r'set in|explores?|revolves|chronicles|allows? the|features? the|'
                     r'refers? to|introduces?|adds?|grants?|unlocks?|reveals?|'
                     r'sequel|prequel|continues|picks up)\b', re.I)
BOUTIQUE = re.compile(r'\b(Xbox|PlayStation|Marketplace|Store|Origin|Steam|price|'
                      r'points?|free|Edition|patch|DLC pack|Cost|USD|hardcover|'
                      r'first issue|E3)\b|\$\d|'
                      r'\b(?:January|February|March|April|May|June|July|August|'
                      r'September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}',
                      re.I)
COMMERCE = re.compile(r'^(?:It (?:is|was) (?:written|published|released|available|'
                      r'included|announced|illustrated|co-written|priced|free)|'
                      r'(?:Written|Art|Cover|Colou?rs?|Letters?|Published|Released|'
                      r'A |The) [^.]*\b(?:by|edition|announced|price)\b)', re.I)


def coupe(t):
    return re.split(r'(?<=[.!?])\s+(?=[A-Z"\u201c])', t)


def borne(t, n=480):
    if len(t) <= n:
        return t
    out = ''
    for p in coupe(t):
        if out and len(out) + len(p) > n:
            break
        out = (out + ' ' + p).strip()
    return out or t[:n]


COURT = 120


def debut(t, n=COURT):
    t = t.lstrip(u'\u201c"\u00ab ').strip()
    out = ''
    for p in coupe(t):
        out = (out + ' ' + p).strip()
        if len(out) >= n:
            break
    return out.rstrip(u'\u201d"\u00bb ')


def phrases(ps):
    """La phrase qui situe, puis la premiere qui raconte."""
    tout = [p for para in ps for p in coupe(para)]
    if not tout:
        return ''
    tete = tout[0]
    reste = [p for p in tout[1:] if not COMMERCE.match(p)]
    suite = ([p for p in reste if RACONTE.search(p) and not BOUTIQUE.search(p)] or
             [p for p in reste if not BOUTIQUE.search(p)])
    return (tete + ' ' + suite[0]).strip() if suite else tete.strip()


def recolte(page):
    secs = api(action='parse', prop='sections', page=page).get('parse', {}).get('sections', [])
    syn = [s for s in secs if s['line'].strip().lower() in QUATRIEME]
    if syn:
        ps = texte(api(action='parse', prop='text', section=syn[0]['index'],
                       page=page)['parse']['text']['*'])
        ps = [p for p in ps if not CREDITS.match(p)]
        if ps:
            return borne(' '.join(ps[:2])), 'synopsis'
    ps = texte(api(action='parse', prop='text', section=0, page=page)['parse']['text']['*'])
    ps = [CHAPEAU.sub('', p) for p in ps]
    ps = [p for p in ps if len(p) > 40]
    t = phrases(ps)
    if len(t) >= COURT:
        return t, 'intro'
    # L'introduction ne dit parfois que l'identite de l'oeuvre. La section
    # « Plot » s'ouvre alors sur le texte de l'editeur : un argument de
    # vente, pas un resume de l'intrigue, et il ne devoile donc rien.
    plot = [s for s in secs if s['line'].strip().lower() in ('plot', 'overview', 'summary')]
    if plot:
        ps = texte(api(action='parse', prop='text', section=plot[0]['index'],
                       page=page)['parse']['text']['*'])
        if ps:
            d = borne(debut(ps[0]))
            if len(d) > len(t):
                return d, 'plot'
    return t, 'intro'


def entrees():
    src = io.open(DATA, encoding='utf-8').read()
    m = re.search(r'window\.ASSASSINSCREED=(\{.*?\});\s*$', src, re.S | re.M)
    if not m:
        sys.exit('donnees illisibles : lancer construire-assassinscreed.mjs')
    D = json.loads(m.group(1))
    return [e for era in D['eras'] for e in era['entries']
            if e['type'] in FORMES or e['id'] in JEUX_SANS_RAWG]


def main():
    cibles = entrees()
    if not cibles:
        sys.exit('aucune cible : les donnees ne portent aucun roman ni comic')
    # Ce qui a deja ete recolte n'est pas redemande : le wiki n'a pas a
    # servir cinquante requetes a chaque relance.
    try:
        out = json.loads(io.open(OUT, encoding='utf-8').read())
    except Exception:
        out = {}

    manques, neufs = [], 0
    for e in cibles:
        eid, titre = e['id'], e['title']
        if eid in out and out[eid].get('desc') and out[eid].get('title') == titre:
            continue
        page = EXCEPTIONS.get(eid, None)
        if page is None:
            try:
                page = resout(titre)
            except Exception as ex:
                manques.append((eid, titre, 'recherche : ' + str(ex)[:50])); continue
            time.sleep(.35)
        if not page:
            manques.append((eid, titre, 'pas de page (exception)')); continue
        try:
            t, ou = recolte(page)
        except Exception as ex:
            manques.append((eid, titre, str(ex)[:60])); continue
        if not t or len(t) < 40:
            manques.append((eid, titre, 'texte trop court sur « %s »' % page)); continue
        out[eid] = {'title': titre, 'page': page, 'section': ou, 'desc': t}
        neufs += 1
        print('  %-34s %-8s %-52s %s' % (eid, ou, page[:52], t[:70]))
        time.sleep(.35)

    if CHECK:
        print('\n--check : rien ecrit.')
    else:
        io.open(OUT, 'w', encoding='utf-8', newline='').write(
            json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True))
        print('\n%s ecrit — %d resume(s) sur %d cible(s), dont %d neuf(s)'
              % (OUT, len(out), len(cibles), neufs))
    if manques:
        print('SANS RESUME (%d) :' % len(manques))
        for eid, titre, quoi in manques:
            print('  ', eid, '|', titre, '|', quoi)


if __name__ == '__main__':
    main()
