# Recolte les resumes que ni RAWG ni TMDB ne donnent, et les ecrit dans
# `_proto/desc-dragonage.json`. `construire-dragonage.py` les pose ensuite
# en `desc` sur les entrees concernees.
#
#   py _proto/descriptions-dragonage.py
#
# POURQUOI un fichier plutot qu'un appel a l'ouverture de la fiche.
#
# Le depliant de la page appelle RAWG pour les jeux et TMDB pour le reste.
# Vingt-cinq entrees sur quarante-quatre ne sont dans ni l'un ni l'autre :
#
#   - les sept DLC d'Origins et de DA2 absents du catalogue RAWG — Steam ne
#     les vend plus separement, l'Ultimate Edition les a absorbes ;
#   - trois DLC que RAWG connait mais dont il n'a pas ecrit la description
#     (Legacy, Mark of the Assassin, Jaws of Hakkon : `description_raw` vide) ;
#   - les six romans et les neuf comics, qu'aucune API de film ou de jeu ne
#     couvre. Open Library n'a de description que pour deux des six romans
#     et rien pour les comics ; Google Books a un quota par adresse IP, pas
#     de quoi tenir une page publique.
#
# Le wiki Dragon Age les a tous les quinze, plus les dix DLC. On passe par
# l'API MediaWiki standard, jamais par `/api/v1` de Fandom qui rend 403 —
# c'est ce que `radar.py` fait deja pour Wookieepedia.
#
# La recolte est faite ICI et pas dans la page : ces textes ne bougent plus
# (des oeuvres parues entre 2009 et 2024), un appel de plus a l'ouverture
# d'une fiche coute une requete a chaque visiteur, et surtout Fandom n'est
# pas une API publique — un WAF, pas d'en-tete CORS garanti. Le resume est
# donc fige dans les donnees, relu une fois, et la page n'appelle rien.
#
# CE QUI EST PRIS. La section « Synopsis » quand l'article en a une : c'est
# la quatrieme de couverture, ecrite pour ne rien devoiler. Sinon les deux
# premieres phrases de l'introduction. Jamais la section « Plot », qui
# raconte l'histoire jusqu'a la fin — le guide est sans spoiler.
import io, json, re, html, sys, time, urllib.parse, urllib.request

API = 'https://dragonage.fandom.com/api.php'
OUT = '_proto/desc-dragonage.json'

# id d'entree -> titre de la page du wiki. Les jeux principaux n'y sont pas :
# RAWG les decrit, et sa description est celle de l'editeur.
PAGES = {
    # les DLC
    'da-stone-1':     'The Stone Prisoner',
    'da-keep-1':      "Warden's Keep",
    'da-leliana-1':   "Leliana's Song",
    'da-ostagar-1':   'Return to Ostagar',
    'da-amgarrak-1':  'The Golems of Amgarrak',
    'da-witch-1':     'Witch Hunt',
    'da-exiled-1':    'The Exiled Prince',
    'da-assassin-1':  'Mark of the Assassin',
    'da-legacy-1':    'Legacy',
    'da-hakkon-1':    'Jaws of Hakkon',
    # les romans
    'da-throne-1':    'Dragon Age: The Stolen Throne',
    'da-calling-1':   'Dragon Age: The Calling',
    'da-asunder-1':   'Dragon Age: Asunder',
    'da-masked-1':    'Dragon Age: The Masked Empire',
    'da-lastflight-1': 'Dragon Age: Last Flight',
    'da-tevinter-1':  'Dragon Age: Tevinter Nights',
    # les comics
    'da-grove-1':     'Dragon Age: The Silent Grove',
    'da-speak-1':     'Dragon Age: Those Who Speak',
    'da-sleep-1':     'Dragon Age: Until We Sleep',
    'da-magekiller-1': 'Dragon Age: Magekiller',
    'da-errant-1':    'Dragon Age: Knight Errant',
    'da-deception-1': 'Dragon Age: Deception',
    'da-wraith-1':    'Dragon Age: Blue Wraith',
    'da-fortress-1':  'Dragon Age: Dark Fortress',
    'da-missing-1':   'Dragon Age: The Missing',
}

def api(**p):
    p['format'] = 'json'
    u = API + '?' + urllib.parse.urlencode(p)
    r = urllib.request.Request(u, headers={'User-Agent': 'Chronologeek/1.0'})
    return json.loads(urllib.request.urlopen(r, timeout=30).read().decode('utf-8'))

def net(t):
    """Du HTML de paragraphe vers du texte suivi."""
    t = re.sub(r'<sup.*?</sup>', ' ', t, flags=re.S)      # les appels de note [1]
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t).replace(u' ', ' ')
    # Le wiki laisse une espace avant la ponctuation quand un lien la precede
    # — « one powerful young mage ’s search », « a mage hunter— Fenris ».
    t = re.sub(u'\\s+([,.;:!?\u2019\'])', r'\1', t)
    t = re.sub(u'\\s+([\u2014\u2013])\\s*', u'\\1 ', t)
    return re.sub(r'\s+', ' ', t).strip()

# Les paragraphes, et rien d'autre. C'est le seul decoupage qui tienne : le
# texte brut d'une section ramene aussi l'infobox — d'ou les « The Stone
# Prisoner left The Stone Prisoner is... » du premier passage, ou « left »
# est l'alignement d'une image et le titre est repete par la fiche — et les
# crochets du lien « modifier » de chaque titre. Une infobox n'est ni un
# <p> ni un <blockquote> ; une quatrieme de couverture est l'un des deux.
PARA = re.compile(r'<(p|blockquote)\b[^>]*>(.*?)</\1>', re.S)

def texte(brut):
    """Les paragraphes utiles d'une section, du plus haut au plus bas."""
    brut = re.sub(r'<span class="mw-editsection".*?</span></span>', ' ', brut, flags=re.S)
    return [p for p in (net(m.group(2)) for m in PARA.finditer(brut)) if len(p) > 40]

# Une ligne d'homonymie ouvre parfois l'article — « For the location..., see ».
CHAPEAU = re.compile(r'^(?:For |This article |Not to be confused).*?\.\s*', re.I)
# La fin d'une quatrieme de couverture donne l'equipe, pas l'histoire.
CREDITS = re.compile(r'^(?:Written|Script|Art|Illustrat|Cover|Colou?r|Letter|Published)', re.I)

# L'introduction d'un article de wiki commence par identifier l'oeuvre, puis
# elle donne l'equipe, l'editeur et les boutiques. Prendre « les deux
# premieres phrases » rendait donc, pour les neuf comics, « … is a
# three-part comic by BioWare and Dark Horse Comics. It is written by X and
# illustrated by Y. » — deux fois la meme information, et rien de l'histoire.
#
# On garde donc la premiere phrase, qui situe l'oeuvre, et on lui adjoint la
# premiere phrase de l'article qui raconte quelque chose.
RACONTE = re.compile(r'\b(tells|follows|story|stories|centers?|centres?|takes? place|'
                     r'set in|explores?|revolves|chronicles|allows? the|features? the|'
                     r'refers? to|introduces?|adds?|grants?|unlocks?|reveals?|'
                     r'sequel|prequel|continues|picks up)\b', re.I)
# La boutique n'est pas l'histoire. Ces mots-la disent ou le DLC s'achete et
# combien il coute — c'est ce que la premiere phrase d'un article de DLC
# donne, et c'est la seule chose dont la fiche n'a que faire.
BOUTIQUE = re.compile(r'\b(Xbox|PlayStation|Marketplace|Store|Origin|Steam|price|'
                      r'points?|free|Edition|patch|DLC pack|Cost|USD|hardcover|'
                      r'first issue|E3)\b|\$\d|'
                      # « July 28th, 2010 » comme « March 10, 2020 » : une date
                      # de sortie n'apprend rien de l'histoire, et c'est la
                      # phrase que les articles de DLC mettent en deuxieme.
                      r'\b(?:January|February|March|April|May|June|July|August|'
                      r'September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}',
                      re.I)
# Le tri se fait sur le DEBUT de la phrase, pas sur les mots qu'elle
# contient : « The comic series is a sequel to Deception and tells… » parle
# bien de l'histoire, et un filtre sur le mot « Dark Horse » la jetait avec
# les credits. Cinq des neuf comics se retrouvaient reduits a leur premiere
# phrase — le titre, l'editeur, et rien d'autre.
COMMERCE = re.compile(r'^(?:It (?:is|was) (?:written|published|released|available|'
                      r'included|announced|illustrated|co-written|priced|free)|'
                      r'(?:Written|Art|Cover|Colou?rs?|Letters?|Published|Released|'
                      r'A |The) [^.]*\b(?:by|edition|announced|price)\b)', re.I)

def coupe(t):
    """Les phrases d'un paragraphe. Les abreviations d'un resume sont rares ;
       le point suivi d'une majuscule suffit a decouper."""
    return re.split(r'(?<=[.!?])\s+(?=[A-Z"“])', t)

# Une quatrieme de couverture de roman fait mille cinq cents signes — celle
# de The Masked Empire en fait mille quatre cents, six paragraphes de dos de
# livre. Les synopsis de TMDB, auxquels la fiche est accordee, tournent
# autour de quatre cents. On coupe a la phrase, jamais au signe.
def borne(t, n=480):
    if len(t) <= n:
        return t
    out = ''
    for p in coupe(t):
        if out and len(out) + len(p) > n:
            break
        out = (out + ' ' + p).strip()
    return out or t[:n]

# En deca, un resume ne dit que le titre et l'editeur.
COURT = 120

def debut(t, n=COURT):
    """Les premieres phrases, jusqu'a ce qu'elles disent quelque chose. Le
       texte d'editeur d'un comic s'ouvre parfois sur trois mots — « Ancient
       horrors. Political intrigue. » — et une phrase ne suffit pas."""
    t = t.lstrip('“"« ').strip()
    out = ''
    for p in coupe(t):
        out = (out + ' ' + p).strip()
        if len(out) >= n:
            break
    return out.rstrip('”"» ')

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

def recolte(titre):
    secs = api(action='parse', prop='sections', page=titre).get('parse', {}).get('sections', [])
    syn = [s for s in secs if s['line'].strip().lower() in ('synopsis', 'description')]
    if syn:
        # La quatrieme de couverture. Elle tient en entier — elle est ecrite
        # pour donner envie sans rien devoiler — mais elle depasse parfois le
        # paragraphe : on garde les deux premiers, jamais la ligne de credits
        # (« Written by… ») qui vient apres.
        ps = texte(api(action='parse', prop='text', section=syn[0]['index'],
                       page=titre)['parse']['text']['*'])
        ps = [p for p in ps if not CREDITS.match(p)]
        if ps:
            return borne(' '.join(ps[:2])), 'synopsis'
    ps = texte(api(action='parse', prop='text', section=0, page=titre)['parse']['text']['*'])
    ps = [CHAPEAU.sub('', p) for p in ps]
    ps = [p for p in ps if len(p) > 40]
    t = phrases(ps)
    if len(t) >= COURT:
        return t, 'intro'
    # Six articles n'ont pour introduction que leur ligne d'identite — « …is
    # a three-part comic by BioWare and Dark Horse Comics » — et rien qui
    # dise de quoi ca parle. Leur section « Plot » s'ouvre alors sur le
    # texte de l'editeur, entre guillemets : c'est un argument de vente, pas
    # un resume de l'intrigue, et il ne devoile donc rien. On en prend le
    # debut, jamais la suite de la section, qui raconte la fin.
    plot = [s for s in secs if s['line'].strip().lower() in ('plot', 'overview', 'summary')]
    if plot:
        ps = texte(api(action='parse', prop='text', section=plot[0]['index'],
                       page=titre)['parse']['text']['*'])
        if ps:
            d = borne(debut(ps[0]))
            if len(d) > len(t):
                return d, 'plot'
    return t, 'intro'

def main():
    out, manques = {}, []
    for i, (eid, page) in enumerate(sorted(PAGES.items())):
        try:
            t, ou = recolte(page)
        except Exception as ex:
            manques.append((eid, page, str(ex)[:60])); continue
        if not t or len(t) < 40:
            manques.append((eid, page, 'texte trop court')); continue
        out[eid] = {'desc': t, 'page': page, 'section': ou}
        print('  %-18s %-8s %s' % (eid, ou, t[:90]))
        time.sleep(.35)          # meme egard qu'Open Library
    io.open(OUT, 'w', encoding='utf-8', newline='').write(
        json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True))
    print('\n%s ecrit — %d resume(s) sur %d' % (OUT, len(out), len(PAGES)))
    if manques:
        print('SANS RESUME :')
        for eid, page, quoi in manques:
            print('  ', eid, '|', page, '|', quoi)
        sys.exit(1)

if __name__ == '__main__':
    main()
