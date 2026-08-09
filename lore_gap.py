"""Dit ce qu'il y a a placer dans les timelines, dans une fenetre de quelques jours.

Purement mecanique : aucun jugement, aucun appel reseau, aucune cle. Le script
dit *ce qui manque*, jamais *ou le placer* — le placement se decide a la main,
en session, en suivant PLACEMENT.md.

  py lore_gap.py             met a jour le registre et ecrit lore-gap.json
  py lore_gap.py --check     affiche le bilan sans rien ecrire
  py lore_gap.py --jours 5   elargit la fenetre (defaut : 2 jours de part et d'autre)
  py lore_gap.py --seed      reconstruit le registre depuis l'historique git

## Pourquoi un registre

radar.json ne contient que les sorties a venir, et les entrees en tombent avant
leur propre date : radar.py interroge TMDB sur `primary_release_date.gte`, la
premiere sortie *mondiale*, qui precede souvent la date affichee. Spider-Man:
Brand New Day a ainsi quitte le radar le 29/07 alors qu'il sortait le 31.

Filtrer radar.json par date raterait donc exactement ce qu'on cherche. Le
registre (lore-ledger.json) garde trace de toute entree vue au moins une fois,
et ne l'oublie que lorsqu'elle apparait dans une timeline.
"""

import json
import re
import subprocess
import sys
import unicodedata
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RADAR = ROOT / "radar.json"
OUT = ROOT / "lore-gap.json"
INDEX_DIR = ROOT / "lore-index"
LEDGER = ROOT / "lore-ledger.json"

DOSSIERS_DIR = ROOT / "deep-dives"

# Depuis la refonte, les entrees ne sont plus dans le HTML : chaque page charge
# data/<univers>-en.js. Lire la page ne rendrait plus une erreur mais zero
# entree — et un index vide fait passer toute la timeline pour absente. La page
# racine reste le temoin qu'un univers existe sur le site ; c'est son fichier de
# donnees qu'on lit. SOURCES dit d'ou vient chaque fichier publie, pour pouvoir
# nommer a Niko le fichier a editer et non celui qui en sort.
DATA_DIR = ROOT / "data"
SOURCES = DATA_DIR / "sources.json"

# Regle de routage : les medias ecrits ne vont pas dans la timeline cinema mais
# dans le Dossier de leur univers. Un roman Star Wars se place dans
# deep-dives/star-wars.html, jamais dans starwars.html. Films, series et jeux
# suivent le chemin inverse.
ECRIT_KINDKEYS = {"comic", "novel", "audio"}
ECRIT_LABELS = {
    "comic", "comics", "graphic novel", "roman", "roman jeunesse", "novel",
    "young readers", "young adult", "audio", "fiction audio", "livre audio",
    "audiobook", "nouvelle", "recueil",
}

# Une version passee de radar.py rangeait l'ere dans le champ `title` pour la
# source Wookieepedia. Le bug est corrige, mais --seed ressusciterait ces fiches
# depuis l'historique git : on les refuse a l'entree du registre.
ERE_SEULE = re.compile(r"^\s*\d+(?:[.,]\d+)?\s*(?:BBY|ABY|BFE|AFE|AG|BG)\s*$", re.I)

FENETRE_DEFAUT = 2
# Au-dela, une entree jamais placee n'a plus vocation a etre proposee : soit
# elle a ete ecartee volontairement, soit elle n'a jamais existe.
OUBLI_JOURS = 365

# Une valeur entre guillemets, doubles (Star Wars, Marvel) ou simples (DC),
# en tolerant les echappements internes : title:'Propriete d\'Ezra Bridger'.
Q = r'"((?:[^"\\]|\\.)*)"|\'((?:[^\'\\]|\\.)*)\''


def cles(nom):
    """Une clé, avec ou sans guillemets. Les pages ecrivaient `id:"sw-ep1"` ;
    les donnees de la refonte sortent d'une serialisation JSON et ecrivent
    `"id":"sw-ep1"`. Chercher la seule forme nue rendait zero entree — sans
    erreur, sans message : l'index sortait vide et toute la timeline passait
    pour absente."""
    return rf'(?:"{nom}"|{nom})\s*:\s*'


ENTRY_RE = re.compile(r"\{\s*" + cles("id") + r"(?:" + Q + r")")
BLOCK_RE = re.compile(
    r"\{\s*" + cles("title") + r"(?:" + Q + r")(?=[^\[\]{}]{0,400}?" + cles("entries") + r"\[)"
)


def pick(match, first_group):
    """Rend le groupe non vide du couple (double quote, simple quote)."""
    a, b = match.group(first_group), match.group(first_group + 1)
    return a if a is not None else b


def field(name, window):
    m = re.search(rf"(?<![\w-]){cles(name)}(?:{Q})", window)
    return pick(m, 1) if m else None


def normalise(text):
    """Pour comparer des titres : sans accents, sans ponctuation, sans casse."""
    if not text:
        return ""
    flat = unicodedata.normalize("NFKD", text)
    flat = "".join(c for c in flat if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", flat.lower()).strip()


def cle(universe, title):
    return f"{universe}|{normalise(title)}"


def parse_timeline(path):
    """Extrait les entrees d'une page de timeline, dans l'ordre du document.

    Les entrees sont des objets JS inline ; on repere chaque `{id:"..."` puis on
    lit les champs utiles dans la fenetre qui suit, bornee par l'entree suivante.
    """
    text = path.read_text(encoding="utf-8")

    marks = []
    for m in BLOCK_RE.finditer(text):
        marks.append((m.start(), "block", pick(m, 1)))
    for m in ENTRY_RE.finditer(text):
        marks.append((m.start(), "entry", pick(m, 1)))
    marks.sort(key=lambda t: t[0])

    starts = [pos for pos, kind, _ in marks if kind == "entry"]
    entries, ignored, block = [], [], None

    for pos, kind, value in marks:
        if kind == "block":
            block = value
            continue
        following = [s for s in starts if s > pos]
        window = text[pos : min(following[0] if following else len(text), pos + 2500)]

        # Le vocabulaire des niveaux differe selon les pages : Star Wars et
        # Marvel ecrivent "important", DC et Avatar "imp". En revanche toute
        # vraie entree en porte un, ce qui permet d'ecarter les descripteurs
        # d'univers du type {id:"sw",title:"Star Wars",type:"tv"} — qui sinon
        # se font passer pour des entrees et polluent les rapprochements.
        level = field("level", window)
        record = {
            "id": value,
            "title": field("title", window),
            "date": field("date", window),
            "type": field("type", window),
            "level": level,
            "block": block,
        }
        (entries if level else ignored).append(record)

    return entries, ignored


def parse_dossier(path):
    """Extrait les entrees d'un Dossier. Contrairement aux timelines, elles sont
    du JSON propre dans window.CGD — pas d'objets JS a apparier.

    On decode a partir de l'accolade ouvrante plutot que de chercher la
    fermante : un JSON de 110 ko contient des centaines de `}` et n'importe
    quelle expression paresseuse s'arrete a la premiere."""
    text = path.read_text(encoding="utf-8")
    m = re.search(r"window\.CGD\s*=\s*(?=\{)", text)
    if not m:
        return []
    try:
        data, _ = json.JSONDecoder().raw_decode(text[m.end():])
    except json.JSONDecodeError:
        return []

    # Le Dossier melange deux natures d'items. `kind:"it"` sont ses vraies
    # entrees — romans, comics, fictions audio, les seules qui comptent dans la
    # progression. `kind:"screen"` sont des reperes posant les films et series au
    # milieu de la chronologie : ils aident a situer une entree mais n'en sont
    # pas une, et ne doivent jamais servir de preuve de presence.
    entries = []
    for era in data.get("eras", []):
        for item in era.get("items", []):
            if item.get("kind") not in ("it", "screen") or not item.get("title"):
                continue
            entries.append(
                {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "date": item.get("date"),
                    "type": item.get("type"),
                    "k": item.get("k"),
                    "ecran": item.get("kind") == "screen",
                    "block": era.get("title"),
                }
            )
    return entries


def discover_dossiers(universes):
    """Associe un univers a son Dossier, si celui-ci existe.

    Le nom de fichier et la valeur `universe` ne coincident pas exactement
    (deep-dives/star-wars.html contre "starwars"), d'ou la comparaison sur la
    forme normalisee. Un futur deep-dives/marvel.html serait absorbe sans
    toucher au script."""
    if not DOSSIERS_DIR.is_dir():
        return {}
    fichiers = {}
    for page in DOSSIERS_DIR.glob("*.html"):
        if page.stem == "index":
            continue
        data = DATA_DIR / f"dossier-{page.stem}-en.js"
        if data.exists():
            fichiers[re.sub(r"[^a-z0-9]+", "", page.stem.lower())] = data
    return {u: fichiers[re.sub(r"[^a-z0-9]+", "", u.lower())]
            for u in universes
            if re.sub(r"[^a-z0-9]+", "", u.lower()) in fichiers}


def est_ecrit(fiche):
    """Vrai pour un comic, un roman ou une fiction audio — les medias qui vont
    au Dossier. Le champ kindKey manque sur les fiches anciennes, d'ou le repli
    sur le libelle."""
    if (fiche.get("kindKey") or "") in ECRIT_KINDKEYS:
        return True
    label = normalise(fiche.get("kind"))
    if label in ECRIT_LABELS:
        return True
    # Les libelles composites de certaines sources ("Graphic Novel Release
    # Date: ...") ne matchent pas a l'identique : on retombe sur le premier mot.
    return any(label.startswith(l) for l in ECRIT_LABELS)


def snapshots_git():
    """Rend tous les etats successifs de radar.json connus de git, du plus ancien
    au plus recent. Sert a semer le registre avec les entrees deja disparues."""
    try:
        shas = subprocess.run(
            ["git", "log", "--format=%H", "--reverse", "--", "radar.json"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.split()
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("git indisponible : impossible de semer le registre.")
        return []

    etats = []
    for sha in shas:
        blob = subprocess.run(
            ["git", "show", f"{sha}:radar.json"],
            cwd=ROOT, capture_output=True, text=True,
        )
        if blob.returncode != 0:
            continue
        try:
            etats.append(json.loads(blob.stdout))
        except json.JSONDecodeError:
            continue
    return etats


def maj_registre(registre, entrees, jour):
    """Ajoute au registre les entrees inconnues, rafraichit les connues."""
    refusees = 0
    for item in entrees:
        titre = item.get("title") or ""
        if ERE_SEULE.match(titre):
            refusees += 1
            continue
        k = cle(item["universe"], titre)
        if not k.endswith("|"):
            fiche = registre.setdefault(k, {"vu_le": jour})
            fiche.update(
                {
                    "universe": item["universe"],
                    "title": item.get("title"),
                    "title_fr": item.get("title_fr") or None,
                    "kind": item.get("kind"),
                    "kindKey": item.get("kindKey"),
                    "date_sort": item.get("date_sort"),
                    "released": item.get("date_txt"),
                    "era": item.get("era") or None,
                    "source": item.get("source"),
                    "wiki": item.get("wiki") or None,
                    "synopsis": item.get("syn"),
                    "vu_dernier": jour,
                }
            )
    return registre, refusees


def discover_pages(universes):
    """Associe chaque univers aux donnees de sa page racine. Rien n'est code en
    dur : un nouvel univers est absorbe sans toucher au script, a condition que
    son fichier de donnees porte le meme nom que sa page."""
    pages, orphans = {}, []
    for universe in sorted(universes):
        page = ROOT / f"{universe}.html"
        data = DATA_DIR / f"{universe}-en.js"
        if page.exists() and data.exists():
            pages[universe] = data
        else:
            orphans.append(universe)
    return pages, orphans


def a_editer(publie):
    """Le fichier ou une entree doit reellement etre ecrite.

    data/*.js est produit : l'ecrire ne survivrait pas a la prochaine
    publication. La source est le proto francais, dont l'anglais est ensuite
    deduit par traduire.mjs. sources.json tient cette correspondance, ecrite
    par publier.mjs — pas de table en double ici."""
    relatif = publie.relative_to(ROOT).as_posix()
    if SOURCES.exists():
        try:
            table = json.loads(SOURCES.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            table = {}
        source = table.get(relatif.replace("-en.js", "-fr.js"))
        if source:
            return source
    return relatif


def arg_int(name, defaut):
    if name in sys.argv:
        try:
            return int(sys.argv[sys.argv.index(name) + 1])
        except (IndexError, ValueError):
            sys.exit(f"{name} attend un nombre de jours.")
    return defaut


def main():
    check_only = "--check" in sys.argv
    seed = "--seed" in sys.argv
    jours = arg_int("--jours", FENETRE_DEFAUT)

    if not RADAR.exists():
        sys.exit("radar.json introuvable. Lance d'abord radar.py.")

    today = date.today()
    jour = today.isoformat()
    debut = (today - timedelta(days=jours)).isoformat()
    fin = (today + timedelta(days=jours)).isoformat()

    registre = json.loads(LEDGER.read_text(encoding="utf-8")) if LEDGER.exists() else {}

    refusees = 0
    if seed:
        etats = snapshots_git()
        print(f"Semis du registre depuis {len(etats)} etats successifs de radar.json.")
        for etat in etats:
            registre, n = maj_registre(registre, etat, jour)
            refusees += n

    radar = json.loads(RADAR.read_text(encoding="utf-8"))
    registre, n = maj_registre(registre, radar, jour)
    refusees += n
    if refusees:
        print(f"{refusees} fiches refusees (titre reduit a une ere, bug radar.py corrige).")

    # Les entrees trop anciennes et jamais placees ne reviendront pas.
    limite = (today - timedelta(days=OUBLI_JOURS)).isoformat()
    registre = {k: v for k, v in registre.items() if (v.get("date_sort") or jour) >= limite}

    universes = {v["universe"] for v in registre.values()}
    pages, orphans = discover_pages(universes)
    dossiers = discover_dossiers(universes)

    parsed = {u: parse_timeline(p) for u, p in pages.items()}
    timelines = {u: entries for u, (entries, _) in parsed.items()}
    ignored = {u: skipped for u, (_, skipped) in parsed.items() if skipped}
    dossier_entries = {u: parse_dossier(p) for u, p in dossiers.items()}

    def index_de(entries):
        # Les reperes ecran du Dossier sont exclus : ils portent le titre d'un
        # film, et laisser un titre de film valoir presence ferait passer une
        # vraie absence pour une entree deja placee.
        return {
            normalise(e["title"]): e["id"]
            for e in entries
            if e["title"] and not e.get("ecran")
        }

    lookup = {u: index_de(e) for u, e in timelines.items()}
    lookup_dossier = {u: index_de(e) for u, e in dossier_entries.items()}

    a_placer, a_verifier, places, hors_fenetre = [], [], [], 0

    for k, fiche in sorted(registre.items(), key=lambda kv: kv[1].get("date_sort") or ""):
        universe = fiche["universe"]
        # Un comic ou un roman se cherche — et se place — dans le Dossier de son
        # univers, pas dans la timeline cinema. Sans ce routage, tout le
        # catalogue ecrit ressort en faux positif.
        cible = "dossier" if (universe in dossiers and est_ecrit(fiche)) else "timeline"
        index = (lookup_dossier if cible == "dossier" else lookup).get(universe, {})
        titles = [t for t in (normalise(fiche["title"]), normalise(fiche.get("title_fr"))) if t]

        if any(t in index for t in titles):
            places.append(k)
            continue

        if not (debut <= (fiche.get("date_sort") or "") <= fin):
            hors_fenetre += 1
            continue

        # Rapprochement lache : un titre contenu dans l'autre, mais seulement si
        # les deux sont de longueur comparable. Sans ce garde-fou, une entree
        # intitulee "Spider-Man" se declare proche de "Spider-Man: Brand New
        # Day", qui est pourtant bel et bien absente. Un rapprochement ne vaut
        # jamais "present" : c'est un humain qui tranche.
        near = []
        for key, page_id in index.items():
            for t in titles:
                short, long = sorted((t, key), key=len)
                if len(short) < 8 or short not in long:
                    continue
                ratio = len(short) / len(long)
                if ratio >= 0.6:
                    near.append({"id": page_id, "title": key, "proximite": round(ratio, 2)})
        near.sort(key=lambda n: -n["proximite"])

        fiche = dict(fiche)
        fiche["cible"] = cible
        fiche["fichier_cible"] = a_editer(
            dossiers[universe] if cible == "dossier" else pages[universe]
        )
        if near:
            fiche["peut_etre_deja_la"] = near[:3]
            a_verifier.append(fiche)
        else:
            a_placer.append(fiche)

    # Une entree placee sort du registre : elle a fait son office.
    for k in places:
        registre.pop(k, None)

    concerned = sorted({(r["universe"], r["cible"]) for r in a_placer + a_verifier})
    index_paths = {}
    for u, c in concerned:
        if c == "dossier":
            index_paths[f"{u} (dossier)"] = f"{INDEX_DIR.name}/{u}-dossier.json"
        elif u in timelines:
            index_paths[f"{u} (timeline)"] = f"{INDEX_DIR.name}/{u}.json"

    payload = {
        "genere_le": jour,
        "fenetre": {"jours": jours, "du": debut, "au": fin},
        "a_placer": a_placer,
        "a_verifier": a_verifier,
        "hors_fenetre": hors_fenetre,
        "placees_ce_coup": len(places),
        "univers_sans_page": orphans,
        # L'index vit dans un fichier par cible plutot qu'ici : tout charger
        # d'un coup fait 25 000 tokens, alors qu'on traite une cible a la fois.
        "index": index_paths,
    }

    total = len(a_placer) + len(a_verifier)
    print(f"registre : {len(registre)} entrees suivies")
    print(f"fenetre  : {debut} -> {fin}  ({jours} jours de part et d'autre)")
    if orphans:
        print(f"univers sans page : {', '.join(orphans)}")
    if places:
        print(f"sorties du registre (desormais en timeline) : {len(places)}")
    print()

    if not total:
        print("Rien a placer.")
        print(f"({hors_fenetre} entrees en attente hors fenetre)")
    else:
        cibles = {u for u, _ in concerned}
        for universe in sorted(cibles):
            if universe in timelines:
                entries = timelines[universe]
                levels = {}
                for e in entries:
                    levels[e["level"]] = levels.get(e["level"], 0) + 1
                detail = ", ".join(f"{n} {lvl}" for lvl, n in sorted(levels.items()))
                skipped = len(ignored.get(universe, []))
                suffix = f"  [+{skipped} descripteur ignore]" if skipped else ""
                print(f"  {universe:<10} {len(entries):>4} en timeline  ({detail}){suffix}")
            if universe in dossier_entries:
                items = dossier_entries[universe]
                ecrans = sum(1 for e in items if e.get("ecran"))
                print(f"  {universe:<10} {len(items) - ecrans:>4} au dossier"
                      f"  (+{ecrans} reperes ecran)")
        print()
        print(f"a placer   : {len(a_placer)}")
        for r in a_placer:
            print(f"  [{r['universe']} -> {r['cible']}] {r['title']}  ({r['kind']}, {r['released']})")
        if a_verifier:
            print(f"a verifier : {len(a_verifier)}")
            for r in a_verifier:
                proches = ", ".join(n["id"] for n in r["peut_etre_deja_la"])
                print(f"  [{r['universe']} -> {r['cible']}] {r['title']}  ? proche de : {proches}")
        print(f"\n({hors_fenetre} autres entrees en attente, hors fenetre)")

    if check_only:
        return

    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    LEDGER.write_text(
        json.dumps(dict(sorted(registre.items())), ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    INDEX_DIR.mkdir(exist_ok=True)
    for universe, entries in timelines.items():
        (INDEX_DIR / f"{universe}.json").write_text(
            json.dumps(entries, ensure_ascii=False, indent=1), encoding="utf-8"
        )
    for universe, entries in dossier_entries.items():
        (INDEX_DIR / f"{universe}-dossier.json").write_text(
            json.dumps(entries, ensure_ascii=False, indent=1), encoding="utf-8"
        )

    print(f"\nEcrit : {OUT.name} ({OUT.stat().st_size / 1024:.0f} Ko), "
          f"{LEDGER.name}, {INDEX_DIR.name}/")


if __name__ == "__main__":
    main()
