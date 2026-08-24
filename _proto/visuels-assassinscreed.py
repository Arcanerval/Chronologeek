# -*- coding: utf-8 -*-
# Convertit les visuels d'Assassin's Creed deposes par Niko dans `images/`,
# et ecrit la table `id d'entree -> fichier` que
# `construire-assassinscreed.mjs` relit.
#
#   py _proto/visuels-assassinscreed.py [--check]
#
# LA REGLE, celle du 14 aout 2026 : tout est en WebP, a quatre fois la
# taille ou l'image s'affiche. Les vignettes d'entree se rendent dans une
# case de 190 px (`.bu-fig`), donc 760 px ; la banniere se rend sur 1 240 px,
# donc 1 920. On ne depasse jamais la taille native — on n'agrandit rien.
#
# CE QUI EST DEPOSE arrive en .jpg, .avif, .png et .webp, jusqu'a 4 096 px
# de large : 24 Mo pour 98 fichiers, quand les donnees de la page tiennent
# en 17 Ko compresses. Le poids du site n'a jamais ete dans les donnees.
#
# UN WEBP DEJA A LA BONNE TAILLE NE SE RETOUCHE PAS. Le re-encoder degrade
# l'image pour rien, et le premier passage du 14 aout avait fait GROSSIR
# `autresunivers.webp` de 322 a 392 Ko. On ne touche un WebP que s'il faut
# le reduire.
#
# LE NOM DU BOUTON DE REMONTEE A CHANGE. Les six autres univers appellent
# leurs deux fichiers `da1/da2`, `twd1/twd2` : ici ce serait `ac1/ac2`, et
# `ac2` est deja le nom que Niko donne a l'image d'Assassin's Creed II. La
# paire s'appelle donc `actop1/actop2` — la collision aurait ecrase l'un
# par l'autre sans une ligne d'erreur.
import io, json, os, re, sys
from PIL import Image, ImageChops

IMAGES = 'images'
SORTIE = '_proto/visuels-assassinscreed.json'
CHECK = '--check' in sys.argv

LARGEUR_VIGNETTE = 760      # `.bu-fig` rend sur 190 px
LARGEUR_BANNIERE = 1920     # la banniere se rend sur 1 240 px

# La banniere de la page : elle n'est l'entree de personne.
BANNIERE = 'acuniverse'

# Le fichier deposé, sans extension -> les entrees qu'il illustre. Un jeu
# coupe par ses DLC revient plusieurs fois dans le guide (Odyssey quatre
# fois) et ses entrees partagent la meme image : c'est le meme jeu.
VISUELS = {
    'ac':                   ['ac-game-1'],
    'ac2':                  ['ac-ii-1', 'ac-ii-2'],
    'ac3':                  ['ac-iii-1', 'ac-iii-2'],
    'abstergohacked':       ['ac-iii-abstergo-hacked-1'],
    'altairschronicles':    ['ac-altairs-chronicles-1'],
    'animiprogram':         ['ac-brotherhood-revelations-animi-1'],
    'arnold':               ['ac-benedict-arnold-1'],
    'ascendance':           ['ac-ascendance-1'],
    'atlantis':             ['ac-the-fate-of-1'],
    'aveline':              ['ac-iv-black-flag-1'],
    'blackbeard':           ['ac-iv-black-flag-3'],
    'blackcross':           ['ac-templars-black-cross-1'],
    'blackflagresynced':    ['ac-black-flag-resynced-1'],
    'bloodbrothers':        ['ac-valhalla-blood-brothers-1'],
    'bloodlines':           ['ac-bloodlines-1'],
    'bloodstone':           ['ac-bloodstone-1'],
    'brahman':              ['ac-brahman-1'],
    'brotherhood':          ['ac-brotherhood-1', 'ac-brotherhood-2'],
    'china':                ['ac-chronicles-china-1'],
    'clawsofawaji':         ['ac-claws-of-awaji-1'],
    'commonground':         ['ac-uprising-common-ground-1'],
    'crossofwar':           ['ac-templars-cross-of-1'],
    'daughterofnoone':      ['ac-mirage-daughter-of-1'],
    'davinci':              ['ac-the-da-vinci-1'],
    'deadkings':            ['ac-dead-kings-1'],
    'desertoath':           ['ac-origins-desert-oath-1'],
    'dieglocke':            ['ac-conspiracies-die-glocke-1'],
    'discovery':            ['ac-ii-discovery-1'],
    'dynasty':              ['ac-dynasty-1'],
    'embers':               ['ac-embers-1'],
    'employeehandbook':     ['ac-unity-abstergo-entertainment-1'],
    'escaperoom':           ['ac-escape-room-puzzle-1'],
    'fateofthegods':        ['ac-last-descendants-fate-1'],
    # Un seul numero Free Comic Book Day porte les deux histoires.
    'fcbd':                 ['ac-fcbd-2016-great-1', 'ac-fcbd-2016-the-1'],
    'finale':               ['ac-uprising-finale-1'],
    'forgottenmyths':       ['ac-valhalla-forgotten-myths-1'],
    'forgottentemple':      ['ac-forgotten-temple-1'],
    'forsaken':             ['ac-forsaken-1'],
    # Les trois Fragments partagent le visuel de la collection.
    'fragments':            ['ac-fragments-the-highlands-1', 'ac-fragments-the-witches-1',
                             'ac-fragments-the-blade-1'],
    'freedomcry':           ['ac-freedom-cry-1'],
    'geirmund':             ['ac-valhalla-geirmunds-saga-1'],
    'gold':                 ['ac-gold-1'],
    'goldencity':           ['ac-the-golden-city-1'],
    'heresy':               ['ac-heresy-1'],
    'hiddencodex':          ['ac-valhalla-the-hidden-1'],
    'hiddenones':           ['ac-the-hidden-ones-1'],
    'homecoming':           ['ac-assassins-homecoming-1'],
    'india':                ['ac-chronicles-india-1'],
    'inflectionpoint':      ['ac-uprising-inflection-point-1'],
    'jacktheripper':        ['ac-jack-the-ripper-1'],
    'lastdescendants':      ['ac-last-descendants-1'],
    'legacybloodline':      ['ac-legacy-of-the-3'],
    'legacyhunted':         ['ac-legacy-of-the-1'],
    'legacyshadowheritage': ['ac-legacy-of-the-2'],
    'liberation':           ['ac-iii-liberation-1'],
    'lineage':              ['ac-lineage-1'],
    'locus':                ['ac-last-descendants-locus-1'],
    'lostarchive':          ['ac-the-lost-archive-1'],
    'losttaleofgreece':     ['ac-odyssey-the-lost-1'],
    'magusconspiracy':      ['ac-the-engine-of-1'],
    'maharaja':             ['ac-the-last-maharaja-1'],
    'mirage':               ['ac-mirage-1', 'ac-mirage-2'],
    'movie':                ['ac-movie-1'],
    'nexus':                ['ac-nexus-vr-1'],
    'odyssey':              ['ac-odyssey-1', 'ac-odyssey-2', 'ac-odyssey-3', 'ac-odyssey-4'],
    'origins':              ['ac-origins-1'],
    'originscomic':         ['ac-origins-2'],
    'pharaohs':             ['ac-the-curse-of-1'],
    'projectrainbow':       ['ac-conspiracies-project-rainbow-1'],
    'ragnarok':             ['ac-dawn-of-ragnarok-1'],
    'reflections':          ['ac-reflections-1'],
    'resurectionplot':      ['ac-the-engine-of-2'],
    'revelations':          ['ac-revelations-1'],
    'rogue':                ['ac-rogue-1'],
    'russia':               ['ac-chronicles-russia-1'],
    'russiasecretending':   ['ac-chronicles-russia-secret-1'],
    'secretcrusade':        ['ac-the-secret-crusade-1'],
    'settingsun':           ['ac-assassins-setting-sun-1'],
    'shadows':              ['ac-shadows-1', 'ac-shadows-2'],
    'siegeofparis':         ['ac-the-siege-of-1'],
    'silkroad':             ['ac-the-silk-road-1'],
    'soarofeagles':         ['ac-mirage-a-soar-1'],
    'songofglory':          ['ac-valhalla-song-of-1'],
    'swordofthewhitehorse': ['ac-valhalla-sword-of-1'],
    'syndicate':            ['ac-syndicate-1', 'ac-syndicate-2'],
    'talesofiga':           ['ac-shadows-tales-of-1'],
    'thechain':             ['ac-the-chain-1'],
    'thefall':              ['ac-the-fall-1'],
    'thosewhoaretreasured': ['ac-those-who-are-1'],
    'tombofthekhan':        ['ac-last-descendants-tomb-1'],
    'trialbyfire':          ['ac-assassins-trial-by-1'],
    'underworld':           ['ac-underworld-1'],
    'unity':                ['ac-unity-1'],
    'valhalla':             ['ac-valhalla-1', 'ac-valhalla-2'],
    'valleyofmemories':     ['ac-valley-of-memories-1'],
    'washington':           ['ac-the-tyranny-of-1'],
    'wrathofthedruids':     ['ac-wrath-of-the-1'],
}

ENTREES = ('.jpg', '.jpeg', '.png', '.avif', '.webp')

DATA = '_proto/data-assassinscreed-en.js'


def entrees():
    """id -> titre, pour le garde-fou, et id -> identifiant RAWG.

    L'identifiant RAWG est ce que la fiche depliee demande a l'API pour les
    jeux et les DLC : une fiche demandee par son numero ne peut pas se
    tromper de jeu, la recherche par titre rendait Jurassic Park pour
    « Trespasser ». Il vit dans les donnees, on le relit ici pour ne pas le
    perdre en reecrivant la table."""
    src = io.open(DATA, encoding='utf-8').read()
    m = re.search(r'window\.ASSASSINSCREED=(\{.*?\});\s*$', src, re.S | re.M)
    if not m:
        sys.exit('donnees illisibles : lancer construire-assassinscreed.mjs')
    D = json.loads(m.group(1))
    return [e for era in D['eras'] for e in era['entries']]


def reduire(im, largeur):
    """Le WebP a la largeur voulue, jamais agrandi.

    Un cutout a fond transparent se reduit en alpha PREMULTIPLIE : les
    pixels transparents d'un PNG portent souvent du blanc en RGB, et un
    reechantillonnage naif mele ce blanc aux bords et cerne le sujet d'un
    halo clair — tres visible sur le fond sombre de la page."""
    alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alpha else 'RGB')
    w, h = im.size
    if w <= largeur:
        return im, False
    nh = max(1, round(h * largeur / w))
    if not alpha:
        return im.resize((largeur, nh), Image.LANCZOS), True
    r, g, b, a = im.split()
    pm = Image.merge('RGBA', tuple(ImageChops.multiply(c, a) for c in (r, g, b)) + (a,))
    pm = pm.resize((largeur, nh), Image.LANCZOS)
    r, g, b, a = pm.split()
    pr, pg, pb, pa = r.load(), g.load(), b.load(), a.load()
    for y in range(nh):
        for x in range(largeur):
            av = pa[x, y]
            if av and av < 255:
                pr[x, y] = min(255, round(pr[x, y] * 255 / av))
                pg[x, y] = min(255, round(pg[x, y] * 255 / av))
                pb[x, y] = min(255, round(pb[x, y] * 255 / av))
    return Image.merge('RGBA', (r, g, b, a)), True


def main():
    presents = {}
    for f in os.listdir(IMAGES):
        base, ext = os.path.splitext(f)
        if ext.lower() in ENTREES:
            presents.setdefault(base, []).append(f)

    attendus = set(VISUELS) | {BANNIERE}
    manquants = sorted(a for a in attendus if a not in presents)
    # Le garde-fou de la collision : tant que la paire du bouton de
    # remontee s'appelle `ac1/ac2`, convertir l'image d'Assassin's Creed II
    # ecrase l'insigne dore, et rien ne le dit.
    for f in ('ac1.webp', 'ac2.webp'):
        if os.path.exists(os.path.join(IMAGES, f)) and 'ac2' in presents and len(presents['ac2']) > 1:
            sys.exit('collision : renommer %s en actop*.webp avant de convertir' % f)

    convertis, intacts, pesee = 0, 0, 0
    table = {}
    for base in sorted(attendus):
        if base not in presents:
            continue
        # Un meme visuel peut avoir ete depose deux fois (le .webp et le
        # .jpg) : on prend le plus grand, c'est la meilleure source.
        src = max((os.path.join(IMAGES, f) for f in presents[base]),
                  key=lambda p: Image.open(p).size[0])
        largeur = LARGEUR_BANNIERE if base == BANNIERE else LARGEUR_VIGNETTE
        dst = os.path.join(IMAGES, base + '.webp')
        im = Image.open(src)
        avant = im.size
        out, reduit = reduire(im, largeur)
        deja_webp = src.lower().endswith('.webp')
        if deja_webp and not reduit:
            intacts += 1                       # on ne le retouche pas
        elif not CHECK:
            out.save(dst, 'WEBP', quality=88, method=6)
            convertis += 1
        else:
            convertis += 1
        if not CHECK:
            for f in presents[base]:
                p = os.path.join(IMAGES, f)
                if os.path.abspath(p) != os.path.abspath(dst):
                    os.remove(p)
            pesee += os.path.getsize(dst)
        print('  %-24s %-9s -> %s' % (base, '%dx%d' % avant,
                                      '%dx%d' % out.size if reduit else 'intact'))
        if base != BANNIERE:
            for eid in VISUELS[base]:
                table[eid] = '/images/' + base + '.webp'

    # Le titre est ecrit a cote du fichier : un identifiant porte un rang
    # (`ac-ii-2`), et une entree ajoutee au document decale tout ce qui la
    # suit. Sans ce temoin, l'affiche du voisin s'installe sans une ligne
    # d'erreur. `construire-assassinscreed.mjs` sort alors en erreur.
    ALL = entrees()
    titres = dict((e['id'], e['title']) for e in ALL)
    rawg = dict((e['id'], e['tmdb']) for e in ALL if e.get('tmdb', '0') != '0')
    orphelins = sorted(set(table) - set(titres))
    sans = sorted(e['id'] for e in ALL if e['id'] not in table)

    sortie = {}
    for k, v in sorted(table.items()):
        o = {'title': titres.get(k, ''), 'img': v}
        if k in rawg:
            o['tmdb'] = rawg[k]
        sortie[k] = o
    if not CHECK:
        io.open(SORTIE, 'w', encoding='utf-8', newline='').write(
            json.dumps(sortie, ensure_ascii=False, indent=1))

    print('\n%d converti(s), %d intact(s), %d entree(s) cablee(s)'
          % (convertis, intacts, len(table)))
    if not CHECK:
        print('poids total : %.1f Mo' % (pesee / 1048576.0))
    if sans:
        print('ENTREE SANS VISUEL (%d) :' % len(sans))
        for x in sans:
            print('  ', x, '|', titres[x])
    if orphelins:
        print('VISUEL SANS ENTREE (%d) :' % len(orphelins))
        for x in orphelins:
            print('  ', x)
    if manquants:
        print('VISUEL ATTENDU MAIS ABSENT (%d) :' % len(manquants))
        for m in manquants:
            print('  ', m)
    if manquants or orphelins:
        sys.exit(1)


if __name__ == '__main__':
    main()
