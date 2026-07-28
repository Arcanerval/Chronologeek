#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync.py - Garde les versions racine (EN) et /fr/ (FR) alignees.

La regle absolue du projet : toute modification d'une page racine doit etre
repliquee dans /fr/. Ce script evite d'avoir a ouvrir les deux fichiers pour ca.

Les deux versions sont paralleles ligne a ligne : meme nombre de lignes, memes
entrees, dans le meme ordre. Les lignes strictement identiques sont du code
(CSS, JS, structure) ; les lignes qui different portent les textes traduits.
Le script s'appuie sur cette propriete et refuse de toucher aux textes.

Usage :
    python sync.py check                     verifie l'alignement des paires
    python sync.py show <univers> <id>       affiche une entree en EN et en FR
    python sync.py mirror <univers> <ancien> <nouveau>
                                             remplace dans les deux versions,
                                             uniquement sur les lignes identiques

Univers : sw, mcu, dc, avatar
"""

import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent

UNIVERS = {
    "sw": "starwars.html",
    "mcu": "marvel.html",
    "dc": "dc.html",
    "avatar": "avatar.html",
}

# SW et Marvel ecrivent leurs objets JS avec des guillemets doubles, DC avec des
# apostrophes simples. On apparie la meme quote pour ne pas casser sur les
# apostrophes internes (« Propriete d'Ezra Bridger »).
RE_ID = re.compile(r"""\bid\s*:\s*(["'])([^"']+)\1""")


def chemins(cle):
    """Renvoie (chemin_en, chemin_fr) pour un univers."""
    if cle not in UNIVERS:
        sortir(f"univers inconnu : {cle} (attendus : {', '.join(UNIVERS)})")
    nom = UNIVERS[cle]
    return RACINE / nom, RACINE / "fr" / nom


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


def ids_de(lignes):
    return [m.group(2) for l in lignes for m in RE_ID.finditer(l)]


# ---------------------------------------------------------------- check

def cmd_check(args):
    """Verifie que chaque paire EN/FR est alignee."""
    cles = args if args else list(UNIVERS)
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
        ie, if_ = ids_de(le), ids_de(lf)
        se, sf = set(ie), set(if_)

        ok = True
        if len(le) != len(lf):
            print(f"  lignes   : {len(le)} EN / {len(lf)} FR   *** DESALIGNE ***")
            ok = False
        else:
            print(f"  lignes   : {len(le)} (aligne)")

        if len(ie) != len(if_):
            print(f"  entrees  : {len(ie)} EN / {len(if_)} FR   *** ECART ***")
            ok = False
        else:
            print(f"  entrees  : {len(ie)} (aligne)")

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
        sortir("usage : python sync.py show <univers> <id>")
    cle, cible = args[0], args[1]
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

def cmd_mirror(args):
    """Remplace un fragment dans les deux versions, sur les lignes identiques."""
    if len(args) < 3:
        sortir('usage : python sync.py mirror <univers> "<ancien>" "<nouveau>"')
    cle, ancien, nouveau = args[0], args[1], args[2]
    en, fr = chemins(cle)

    if not en.exists() or not fr.exists():
        sortir("les deux versions doivent exister pour un miroir")

    le, lf = lire(en), lire(fr)
    if len(le) != len(lf):
        sortir(f"versions desalignees ({len(le)} vs {len(lf)} lignes) — "
               "lancer « python sync.py check » d'abord")

    touchees, refusees = [], []
    for i, (a, b) in enumerate(zip(le, lf)):
        if ancien not in a and ancien not in b:
            continue
        if a == b:
            le[i] = a.replace(ancien, nouveau)
            lf[i] = b.replace(ancien, nouveau)
            touchees.append(i + 1)
        else:
            # ligne porteuse de texte traduit : on ne touche pas
            refusees.append(i + 1)

    if not touchees and not refusees:
        print(f"aucune occurrence de « {ancien} »")
        return 0

    if touchees:
        ecrire(en, le)
        ecrire(fr, lf)
        print(f"remplace dans les deux versions, lignes : "
              f"{', '.join(map(str, touchees[:20]))}"
              f"{' …' if len(touchees) > 20 else ''}")
        print(f"total : {len(touchees)} ligne(s) x 2 fichiers")

    if refusees:
        print(f"\nignore sur {len(refusees)} ligne(s) ou EN et FR different "
              f"(texte traduit) : {', '.join(map(str, refusees[:20]))}"
              f"{' …' if len(refusees) > 20 else ''}")
        print("ces lignes sont a traiter a la main, dans chaque langue.")
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
