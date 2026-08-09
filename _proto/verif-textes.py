# -*- coding: utf-8 -*-
"""Controle que le journal n'a pas reecrit les textes de Niko.

Chaque `title` et chaque `txt` de data-news.js doit exister mot pour mot
dans fr/nouveautes.html. Une seule retouche est admise et elle est connue :
la prose ecrit « <strong>Titre</strong> — la suite », le journal met le
titre et la suite dans deux champs, donc la suite recoit sa majuscule
initiale et perd le tiret de liaison. Le script remet cette premiere
lettre en minuscule avant de comparer.

    py _proto/verif-textes.py

Sortie 0 si tout colle, 1 des qu'un fragment a bouge.
"""
import html
import re
import sys
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
# La page du site est desormais la sortie de la refonte : comparer la prose
# a elle-meme ne prouverait rien. La source, c'est la page d'avant, figee dans
# _proto/reference/ — voir son LISEZ-MOI.
SOURCE = RACINE / "_proto" / "reference" / "fr" / "nouveautes.html"
JOURNAL = RACINE / "_proto" / "data-news.js"


def normalise(t):
    """Ce qui ne doit pas faire echouer une comparaison de prose."""
    t = html.unescape(t)
    t = unicodedata.normalize("NFC", t)
    # apostrophes et tirets se promenent d'un fichier a l'autre
    t = t.replace("’", "'").replace("ʼ", "'")
    t = t.replace("‑", "-").replace("–", "—")
    # les insecables et les retours a la ligne du HTML indente
    t = t.replace(" ", " ").replace(" ", " ")
    return re.sub(r"\s+", " ", t).strip()


def texte_source():
    """Le HTML de la page, balises retirees, sur une seule ligne."""
    brut = SOURCE.read_text(encoding="utf-8")
    corps = re.search(r"<ol class=\"log\">(.*?)</ol>", brut, re.S)
    if not corps:
        sys.exit("La liste <ol class=\"log\"> est introuvable dans " + str(SOURCE))
    return normalise(re.sub(r"<[^>]+>", " ", corps.group(1)))


def litteraux(js, champ):
    """Les valeurs d'un champ, concatenation `"a"+"b"` comprise."""
    out = []
    for m in re.finditer(champ + r"\s*:\s*((?:\"(?:[^\"\\]|\\.)*\"\s*\+?\s*)+)", js):
        bouts = re.findall(r"\"((?:[^\"\\]|\\.)*)\"", m.group(1))
        out.append("".join(b.replace('\\"', '"').replace("\\\\", "\\") for b in bouts))
    return out


def variantes(t):
    """Le fragment tel quel, et sa version rendue a la prose d'origine."""
    yield t
    if t and t[0].isupper():
        yield t[0].lower() + t[1:]


def main():
    src = texte_source()
    js = JOURNAL.read_text(encoding="utf-8")

    fragments = [("title", v) for v in litteraux(js, "title")]
    fragments += [("txt", v) for v in litteraux(js, "txt")]
    if not fragments:
        sys.exit("Aucun fragment lu dans " + str(JOURNAL))

    manques = []
    for champ, brut in fragments:
        if not any(normalise(v) in src for v in variantes(brut)):
            manques.append((champ, brut))

    print("%d fragments controles contre %s" % (len(fragments), SOURCE.name))
    if manques:
        print("\n%d fragment(s) absent(s) de la source :\n" % len(manques))
        for champ, brut in manques:
            print("  [%s] %s" % (champ, brut))
        print("\nUn texte a ete reecrit, ou la source a change. Reprendre le")
        print("fragment mot pour mot depuis %s." % SOURCE)
        return 1

    print("Tous les fragments viennent de la source, mot pour mot.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
