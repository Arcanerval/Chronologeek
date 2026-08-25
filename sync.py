#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync.py - Garde les versions racine (EN) et /fr/ (FR) alignees.

La regle absolue du projet : toute modification d'une page racine doit etre
repliquee dans /fr/. Ce script evite d'avoir a ouvrir les deux fichiers pour ca.

Les deux versions sont paralleles ligne a ligne : meme nombre de lignes, memes
entrees, dans le meme ordre. Les lignes strictement identiques sont du code
(CSS, JS, structure) ; les lignes qui different portent les textes traduits.

Depuis la refonte, une page ne porte plus ses entrees : elle charge
data/<nom>-<langue>.js. L'alignement se verifie donc sur deux couples a la fois,
le HTML pour la structure et les donnees pour les entrees. Chercher les entrees
dans le HTML ne renvoyait pas d'erreur : il renvoyait zero de chaque cote, et
« 0 (aligne) » passait pour un feu vert.

Le sens de l'ecriture a change lui aussi. Les pages du site et data/*.js sont
produits : l'anglais est deduit du francais par traduire.mjs, puis publier.mjs
pose les dix-huit pages. La source a corriger est donc le proto francais, et
c'est la que mirror ecrit.

Usage :
    python sync.py check                     verifie l'alignement des paires
    python sync.py show <page> <id>          affiche une entree en EN et en FR
    python sync.py mirror <page> <ancien> <nouveau>
                                             remplace dans le proto source,
                                             puis rappelle quoi relancer

Pages : sw, mcu, dc, avatar, startrek, twd, dragonage, assassinscreed, dossier,
        news, accueil, avenir, dossiers
"""

import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent
PROTO = RACINE / "_proto"
DATA = RACINE / "data"


class Paire:
    """Une page du site, dans ses deux langues et ses trois etats : ce qui est
    publie (en / fr), les entrees qui l'alimentent (donnees), et la source d'ou
    tout descend (le proto francais).

    Quatre exceptions : Star Trek, The Walking Dead, Dragon Age et Assassin's
    Creed s'ecrivent en anglais et le francais en descend. Leur source est donc
    `en-startrek.html`, `en-twd.html`, `en-dragonage.html` et
    `en-assassinscreed.html`, et `langue_source` le dit — sans quoi mirror
    ecrirait dans une sortie du script de traduction concerne, perdue au prochain
    passage, sans erreur et sans message."""

    def __init__(self, en, fr, donnees, proto, langue_source="fr"):
        self.en, self.fr, self.donnees, self.proto = en, fr, donnees, proto
        self.langue_source = langue_source

    @property
    def source(self):
        """Le proto d'ou descend la paire."""
        return self.proto if self.langue_source == "fr" else "en-" + self.proto[2:]


PAGES = {
    "sw":       Paire("starwars.html", "fr/starwars.html", "starwars", "e-starwars.html"),
    "mcu":      Paire("marvel.html", "fr/marvel.html", "marvel", "e-marvel.html"),
    "dc":       Paire("dc.html", "fr/dc.html", "dc", "e-dc.html"),
    "avatar":   Paire("avatar.html", "fr/avatar.html", "avatar", "e-avatar.html"),
    "startrek": Paire("startrek.html", "fr/startrek.html", "startrek", "e-startrek.html",
                      langue_source="en"),
    "twd":      Paire("walkingdead.html", "fr/walkingdead.html", "walkingdead", "e-twd.html",
                      langue_source="en"),
    "dragonage": Paire("dragonage.html", "fr/dragonage.html", "dragonage", "e-dragonage.html",
                       langue_source="en"),
    "assassinscreed": Paire("assassinscreed.html", "fr/assassinscreed.html", "assassinscreed",
                            "e-assassinscreed.html", langue_source="en"),
    "dossier":  Paire("deep-dives/star-wars.html", "fr/dossiers/star-wars.html",
                      "dossier-star-wars", "e-dossier-star-wars.html"),
    "news":     Paire("whats-new.html", "fr/nouveautes.html", "news", "e-nouveautes.html"),
    "accueil":  Paire("index.html", "fr/index.html", None, "e-accueil.html"),
    "avenir":   Paire("upcoming.html", "fr/a-venir.html", None, "e-a-venir.html"),
    "dossiers": Paire("deep-dives/index.html", "fr/dossiers/index.html", None, "e-dossiers.html"),
}

# SW et Marvel ecrivent leurs objets JS avec des guillemets doubles, DC avec des
# apostrophes simples. On apparie la meme quote pour ne pas casser sur les
# apostrophes internes (« Propriete d'Ezra Bridger »). Les donnees de la refonte
# sortent d'une serialisation JSON et ecrivent la cle entre guillemets : sans
# « "id" », le compte tombe a zero sans que rien ne le signale.
RE_ID = re.compile(r"""(?:\bid|"id")\s*:\s*(["'])([^"']+)\1""")


def paire(cle):
    if cle not in PAGES:
        sortir(f"page inconnue : {cle} (attendues : {', '.join(PAGES)})")
    return PAGES[cle]


def chemins(cle):
    """Renvoie (chemin_en, chemin_fr) pour une page."""
    p = paire(cle)
    return RACINE / p.en, RACINE / p.fr


def donnees(cle):
    """Renvoie (donnees_en, donnees_fr), ou (None, None) pour une page qui n'en
    charge pas — l'accueil, les index, la page des sorties a venir."""
    p = paire(cle)
    if not p.donnees:
        return None, None
    return DATA / f"{p.donnees}-en.js", DATA / f"{p.donnees}-fr.js"


def sortir(msg, code=1):
    print(f"erreur : {msg}", file=sys.stderr)
    sys.exit(code)


def lire(p):
    # newline="" : on garde les \r tels quels en fin de ligne. Sans ca, Python
    # traduit CRLF -> LF a la lecture puis LF -> CRLF a l'ecriture, ce qui
    # reecrit tout le fichier alors que le depot le stocke en LF.
    with p.open(encoding="utf-8", newline="") as f:
        return f.read().split("\n")


def ecrire(p, lignes):
    with p.open("w", encoding="utf-8", newline="") as f:
        f.write("\n".join(lignes))


# Le journal des Nouveautes n'a pas d'identifiants : ses cartes se comptent au
# titre. Sans ce repli, la paire ressortait « 0 des deux cotes ».
RE_TITRE = re.compile(r'"?title"?\s*:\s*(["\'])')

# On compte tous les identifiants du fichier, pas seulement ceux de la
# chronologie. Restreindre au bloc `eras` semblait plus parlant — 61 entrees
# Star Wars plutot que 70 — mais le decoupage dependait du formatage : le
# francais tient sur une ligne, l'anglais est indente, et la meme donnee sortait
# a 71 d'un cote et 69 de l'autre. Un controle de parite ne doit pas dependre de
# la mise en forme. Le compte total inclut donc les badges, le descripteur
# d'univers et la banniere TMDB ; il ne se rapproche pas des chiffres de
# CLAUDE.md, et ce n'est pas son role — toute entree ajoutee ou retiree change
# malgre tout l'ensemble des identifiants, ce qui est ce qu'on verifie ici.


def ids_de(lignes):
    return [m.group(2) for l in lignes for m in RE_ID.finditer(l)]


def titres_de(lignes):
    return sum(len(RE_TITRE.findall(l)) for l in lignes)


# ---------------------------------------------------------------- check

def cmd_check(args):
    """Verifie que chaque paire EN/FR est alignee."""
    cles = args if args else list(PAGES)
    souci = False

    for cle in cles:
        en, fr = chemins(cle)
        print(f"\n### {cle}  {en.name}")

        if not en.exists():
            print("  version EN absente")
            souci = True
            continue
        if not fr.exists():
            print("  version FR absente — rien a synchroniser")
            souci = True
            continue

        le, lf = lire(en), lire(fr)
        ok = True

        if len(le) != len(lf):
            print(f"  lignes   : {len(le)} EN / {len(lf)} FR   *** DESALIGNE ***")
            ok = False
        else:
            print(f"  lignes   : {len(le)} (aligne)")

        de, df = donnees(cle)
        if de is None:
            print("  identifiants : cette page n'en porte pas")
        elif not de.exists() or not df.exists():
            manquant = de if not de.exists() else df
            print(f"  identifiants : {manquant.name} absent   *** DONNEES MANQUANTES ***")
            ok = False
        else:
            ge, gf = lire(de), lire(df)
            ie, if_ = ids_de(ge), ids_de(gf)
            se, sf = set(ie), set(if_)
            # Zero de chaque cote n'est pas un alignement : c'est un parseur qui
            # a decroche. C'est exactement ce qu'a fait la refonte en sortant les
            # entrees du HTML, sans une ligne d'avertissement.
            if not ie and not if_:
                te, tf = titres_de(ge), titres_de(gf)
                if not te and not tf:
                    print("  identifiants : 0 des deux cotes   *** LECTURE VIDE ***")
                    ok = False
                elif te != tf:
                    print(f"  identifiants : {te} EN / {tf} FR   *** ECART ***  (comptees au titre)")
                    ok = False
                else:
                    print(f"  identifiants : {te} (aligne)   comptees au titre, "
                          f"{de.name} / {df.name}")
            elif len(ie) != len(if_):
                print(f"  identifiants : {len(ie)} EN / {len(if_)} FR   *** ECART ***")
                ok = False
            else:
                print(f"  identifiants : {len(ie)} (aligne)   {de.name} / {df.name}")

            for nom, manque in (("FR", se - sf), ("EN", sf - se)):
                if manque:
                    apercu = ", ".join(sorted(manque)[:8])
                    reste = f" … (+{len(manque) - 8})" if len(manque) > 8 else ""
                    print(f"  absents du {nom} : {apercu}{reste}")
                    ok = False

        if ok:
            idem = sum(1 for a, b in zip(le, lf) if a == b)
            print(f"  lignes identiques (= code partage) : {idem}/{len(le)}")
        else:
            souci = True

    print()
    return 1 if souci else 0


# ---------------------------------------------------------------- show

def cmd_show(args):
    """Affiche une entree dans les deux langues, sans charger la page entiere."""
    if len(args) < 2:
        sortir("usage : python sync.py show <page> <id>")
    cle, cible = args[0], args[1]
    # Les entrees ne sont plus dans la page : c'est le fichier de donnees qu'on
    # ouvre, en repli sur la page pour celles qui n'en chargent pas.
    en, fr = donnees(cle)
    if en is None:
        en, fr = chemins(cle)

    for etiquette, p in (("EN", en), ("FR", fr)):
        if not p.exists():
            print(f"\n--- {etiquette} : fichier absent ---")
            continue
        lignes = lire(p)
        trouve = False
        for n, ligne in enumerate(lignes, 1):
            if any(m.group(2) == cible for m in RE_ID.finditer(ligne)):
                print(f"\n--- {etiquette}  {p.name}:{n} ---")
                # une ligne peut contenir plusieurs entrees : on isole la bonne
                extrait = ligne.strip()
                pos = extrait.find(cible)
                if len(extrait) > 600 and pos > -1:
                    deb = max(0, pos - 200)
                    extrait = ("…" if deb else "") + extrait[deb:pos + 400] + "…"
                print(extrait)
                trouve = True
                break
        if not trouve:
            print(f"\n--- {etiquette} : id « {cible} » introuvable ---")
    print()
    return 0


# ---------------------------------------------------------------- mirror

def source_fr(cle):
    """Les fichiers d'ou descend la page publiee : le proto source, et le
    fichier de donnees de ce proto quand la page en charge un. data/*.js et les
    pages du site sont produits — y ecrire ne survivrait pas a la publication
    suivante. La table des sources est celle qu'ecrit publier.mjs, pour ne pas
    en tenir une copie qui divergerait.

    La langue lue suit `langue_source` : francaise partout, anglaise pour Star
    Trek et The Walking Dead, dont le francais est une sortie de leur propre
    script de traduction."""
    p = paire(cle)
    fichiers = [PROTO / p.source]
    if p.donnees:
        table = {}
        manifeste = DATA / "sources.json"
        if manifeste.exists():
            import json
            try:
                table = json.loads(manifeste.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                table = {}
        source = table.get(f"data/{p.donnees}-{p.langue_source}.js")
        if source:
            fichiers.append(RACINE / source)
    return [f for f in fichiers if f.exists()]


def cmd_mirror(args):
    """Remplace un fragment dans la source francaise des deux versions.

    Avant la refonte, EN et FR etaient deux fichiers ecrits a la main et un
    miroir ecrivait dans les deux. Ce n'est plus le cas : l'anglais est deduit du
    francais par traduire.mjs, et les pages du site sont produites par
    publier.mjs. Ecrire dans les fichiers publies serait perdu a la publication
    suivante — sans erreur, et sans que rien ne le dise. On ecrit donc dans le
    proto francais, et on rappelle les deux commandes qui font le reste.

    Les lignes de prose sont touchees comme les autres : le proto francais est la
    source, pas une traduction a preserver."""
    if len(args) < 3:
        sortir('usage : python sync.py mirror <page> "<ancien>" "<nouveau>"')
    cle, ancien, nouveau = args[0], args[1], args[2]

    cibles = source_fr(cle)
    if not cibles:
        sortir(f"aucune source francaise trouvee pour « {cle} »")

    total = 0
    for f in cibles:
        lignes = lire(f)
        touchees = [i + 1 for i, l in enumerate(lignes) if ancien in l]
        if not touchees:
            print(f"{f.relative_to(RACINE).as_posix()} : aucune occurrence")
            continue
        ecrire(f, [l.replace(ancien, nouveau) for l in lignes])
        total += len(touchees)
        print(f"{f.relative_to(RACINE).as_posix()} : {len(touchees)} ligne(s) — "
              f"{', '.join(map(str, touchees[:20]))}"
              f"{' …' if len(touchees) > 20 else ''}")

    if not total:
        print(f"\naucune occurrence de « {ancien} »")
        return 0

    print(f"\ntotal : {total} ligne(s). Pour propager :")
    if paire(cle).langue_source == "en":
        # Les quatre chaines inversees ont chacune leur script : ecrire dans
        # en-twd.html et relancer traduire-startrek.mjs ne propagerait rien.
        print(f"  node _proto/traduire-{cle}.mjs")
    else:
        print("  node _proto/traduire.mjs && node _proto/traduire-pages.mjs")
    print("  node _proto/publier.mjs")
    print("  py sync.py check")
    return 0


# ---------------------------------------------------------------- main

COMMANDES = {"check": cmd_check, "show": cmd_show, "mirror": cmd_mirror}


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "help"):
        print(__doc__)
        return 0
    cmd = sys.argv[1]
    if cmd not in COMMANDES:
        sortir(f"commande inconnue : {cmd} (attendues : {', '.join(COMMANDES)})")
    return COMMANDES[cmd](sys.argv[2:])


if __name__ == "__main__":
    sys.exit(main())
