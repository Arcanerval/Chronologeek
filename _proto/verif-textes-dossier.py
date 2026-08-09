# -*- coding: utf-8 -*-
"""Controle que le proto du Dossier n'a pas reecrit les textes de Niko.

Chaque fragment de prose affiche par _proto/e-dossier-star-wars.html doit
exister mot pour mot dans fr/dossiers/star-wars.html (la page de prod) ou
dans fr/dossiers/index.html (l'accueil des Dossiers, d'ou vient l'etiquette
du premier ecran). Les 533 entrees, la prose d'introduction et les libelles
d'interface viennent des donnees, donc ne sont pas retapes : ce script
controle ce qui est ecrit en dur dans le HTML.

Une seule retouche est admise, la meme que sur la page d'univers : le
tutoiement passe au vouvoiement. Elle est declaree couple par couple dans
VOUVOIEMENT — un fragment vouvoye qui ne figure pas dans cette table est
signale comme reecrit.

    py _proto/verif-textes-dossier.py

Sortie 0 si tout colle, 1 des qu'un fragment a bouge.
"""
import html
import re
import sys
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PAGE = RACINE / "_proto" / "e-dossier-star-wars.html"
# La page de prod porte la prose ET les libelles d'interface (window.CG.t),
# donc les scripts inline comptent comme source. L'accueil des Dossiers de
# prod donne le discours de rubrique ; le proto de son accueil, deja ecrit,
# donne l'etiquette du premier ecran.
# Les deux pages du site sont maintenant produites depuis ces protos :
# comparer la prose a elle-meme ne prouverait rien. Les pages d'avant sont
# figees dans _proto/reference/ — voir son LISEZ-MOI.
REF = RACINE / "_proto" / "reference"
SOURCES = [REF / "fr" / "dossiers" / "star-wars.html",
           REF / "fr" / "dossiers" / "index.html",
           RACINE / "_proto" / "e-dossiers.html"]

# Le tutoiement de la prod, et sa forme vouvoyee sur le proto.
VOUVOIEMENT = {
    "À l’écran — où se placent les films et séries. Non comptés dans votre progression.":
        "À l’écran — où se placent les films et séries. Non comptés dans ta progression.",
    "Votre progression est sauvegardée sur ce navigateur — utilisez Exporter pour en "
    "garder une copie ou l’importer sur un autre appareil ou navigateur":
        "Ta progression est sauvegardée sur ce navigateur — utilise Exporter pour en "
        "garder une copie ou l’importer sur un autre appareil ou navigateur",
    "Réinitialiser votre progression du Dossier ?":
        "Réinitialiser ta progression du Dossier ?",
    "Essayez une autre orthographe, ou remettez les filtres que vous avez décochés.":
        "Essaie une autre orthographe, ou remets les filtres que tu as décochés.",
}

# Intitules de structure : la page en a besoin, la prose de Niko n'en a pas.
# Ils sont declares ici pour qu'ils restent visibles et comptes.
STRUCTURE = [
    "Commencer",              # le bouton du premier ecran, comme sur e-starwars.html
    "Entrées",                # cinquieme tuile de la barre de stats
    "Ère",                    # le chevron des bandes d'ere : « Ère 3 / 7 »
    "Chronologeek",
]


def normalise(t):
    t = html.unescape(t)
    t = unicodedata.normalize("NFC", t)
    t = t.replace("’", "'").replace("ʼ", "'")
    t = t.replace("‑", "-").replace("–", "—")
    t = t.replace(" ", " ").replace(" ", " ")
    return re.sub(r"\s+", " ", t).strip()


def prose(chemin):
    """Le texte d'un fichier : prose, attributs et libelles des scripts.

    Les styles et les commentaires partent — ils ne s'affichent pas. Les
    scripts restent : c'est la que vivent les libelles d'interface et, sur
    la page de prod, la prose d'introduction.
    """
    brut = chemin.read_text(encoding="utf-8")
    brut = re.sub(r"<style\b.*?</style>", " ", brut, flags=re.S)
    brut = re.sub(r"<!--.*?-->", " ", brut, flags=re.S)
    return normalise(re.sub(r"<[^>]+>", " ", brut))


# Les fragments ecrits en dur dans le proto, dans l'ordre de la page.
FRAGMENTS = [
    "Tous les Dossiers",
    "Plus loin que la timeline",
    "Dossier Star Wars",
    "Romans & Comics",
    "L’ordre de lecture complet des romans, romans jeunesse et comics Star Wars canon, "
    "replacé dans la chronologie des films et séries.",
    "533 entrées · 63 repères à l’écran",
    "Romans",
    "Romans jeunes adultes",
    "Comics",
    "Livres audio",
    "Rechercher dans la timeline",
    "Rechercher…  ( / )",
    "Effacer la recherche",
    "Types de média",
    "Repères",
    "À l’écran — où se placent les films et séries. Non comptés dans votre progression.",
    "Masquer les lus",
    "affichées",
    "Aller à une ère",
    "repères à l’écran",
    "lus",
    "Restant à lire",
    "Exporter",
    "Importer",
    "Réinitialiser",
    "Votre progression est sauvegardée sur ce navigateur — utilisez Exporter pour en "
    "garder une copie ou l’importer sur un autre appareil ou navigateur",
    "Réinitialiser votre progression du Dossier ?",
    "Essayez une autre orthographe, ou remettez les filtres que vous avez décochés.",
    "Remonter en haut",
    "Les timelines des univers dans lesquels ça vaut le coup de se perdre. Tous les "
    "médias, dans l'ordre chronologique, sans spoil. Construit et maintenu par une "
    "seule personne qui regarde tout deux fois.",
    "Timelines",
    "Star Wars",
    "Marvel — MCU",
    "DC Multiverse",
    "Avatar",
    "Dossiers",
    "Plus",
    "Sorties à venir",
    "Nouveautés",
    "Soutenir le site",
    "Contact",
]


def main():
    src = " ‖ ".join(prose(p) for p in SOURCES)
    # La page se lit deux fois : brute, parce que des libelles vivent dans
    # les attributs (placeholder, aria-label, title), et debalisee, parce
    # qu'une phrase peut porter un <b> au milieu.
    page_brut = normalise(PAGE.read_text(encoding="utf-8"))
    page_nu = prose(PAGE)

    manques, absents_page = [], []
    for brut in FRAGMENTS:
        n = normalise(brut)
        if n not in page_brut and n not in page_nu:
            absents_page.append(brut)
        cible = VOUVOIEMENT.get(brut, brut)
        if normalise(cible) not in src:
            manques.append((brut, cible))

    print("%d fragments controles contre %s"
          % (len(FRAGMENTS), " et ".join(p.name for p in SOURCES)))
    print("%d retouches de vouvoiement declarees, %d intitules de structure assumes"
          % (len(VOUVOIEMENT), len(STRUCTURE)))

    code = 0
    if absents_page:
        print("\n%d fragment(s) declare(s) mais absent(s) de la page :" % len(absents_page))
        for b in absents_page:
            print("  " + b)
        code = 1
    if manques:
        print("\n%d fragment(s) absent(s) de la source :\n" % len(manques))
        for brut, cible in manques:
            print("  page   : %s" % brut)
            print("  cherche: %s\n" % cible)
        print("Un texte a ete reecrit, ou la source a change. Reprendre le")
        print("fragment mot pour mot depuis la page de prod.")
        code = 1
    if not code:
        print("Tous les fragments viennent de la source, mot pour mot.")
    return code


if __name__ == "__main__":
    sys.exit(main())
