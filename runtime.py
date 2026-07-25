#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chronologeek — runtime.py
=========================
Calcule le temps de visionnage de chaque entree des timelines et l'injecte
dans les pages sous forme d'une table `const RT={id:minutes}`, plus un
compteur "temps restant" qui baisse quand on coche une entree.

Usage :
    python runtime.py                 -> patche toutes les pages
    python runtime.py --dry           -> analyse sans ecrire, montre les trous
    python runtime.py starwars.html   -> une seule page

Le cache (runtime-cache.json) evite de re-interroger TMDB a chaque run.
Supprime-le (ou bump CACHE_VERSION) pour tout recalculer.
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error

# ─────────────────────────────────────────────────────────────── config

# Meme nom de variable que radar.py, pour reutiliser le secret TMDB_KEY
TMDB_KEY = (os.environ.get("TMDB_KEY")
            or os.environ.get("TMDB_API_KEY") or "").strip()
API = "https://api.themoviedb.org/3"
CACHE_FILE = "runtime-cache.json"
CACHE_VERSION = 1
PAUSE = 0.06          # secondes entre deux appels TMDB
DEFAULT_EP = 22       # minutes, filet de secours si TMDB donne 0/null

PAGES = [
    "starwars.html", "fr/starwars.html",
    "marvel.html",   "fr/marvel.html",
    "dc.html",       "fr/dc.html",
]

# ───────────────────────────────────────────── overrides manuels (minutes)

# Jeux Star Wars. Battlefront II : 8h reparties au prorata des missions
# (16 missions au total -> 30 min chacune) pour que cocher une partie de la
# campagne fasse baisser le compteur proportionnellement.
GAME_MINUTES = {
    "sw-fo":            20 * 60,   # Jedi: Fallen Order
    "sw-survivor":      30 * 60,   # Jedi: Survivor
    "sw-outlaws":       38 * 60,   # Outlaws + DLC
    "sw-squadrons":      9 * 60,   # Squadrons
    "sw-bf2-prologue":      30,    # BF2 — prologue (1 mission)
    "sw-bf2-c1":           180,    # BF2 — missions 1-6
    "sw-bf2-c2":           150,    # BF2 — missions 7-11
    "sw-bf2-m12":           30,    # BF2 — mission 12
    "sw-bf2res":            90,    # BF2 — Resurrection (3 missions)
}

# Marvel One-Shots : vrais courts metrages, ils comptent.
ONESHOT_MINUTES = {
    "mcu-ac-os":        15,   # Agent Carter
    "mcu-consultant":    4,   # The Consultant
    "mcu-item47":       12,   # Item 47
    "mcu-roi":          14,   # All Hail the King
}

# Compte pour zero : scenes post-generique et bouts d'episodes deja comptes
# ailleurs. Elles restent affichees et cochables, mais ne pesent rien.
ZERO_MINUTES = {
    "sw-rebels-ep",     # epilogue du final de Rebels
    "mcu-thor3pc", "mcu-antman2pc", "mcu-cmpc",
    "mcu-bwpc", "mcu-marvelspc", "mcu-tb-pc2",
}

# Si TMDB n'a pas la donnee, mets-la ici : {"id-entree": minutes}
MANUAL_MINUTES = {}

# Saison a utiliser quand le numero d'episode est dans le titre mais pas la
# saison (anthologies type Tales of the Jedi : tout est en saison 1).
TITLE_EP_SEASON = 1

# ─────────────────────────────────────────────────────────────── cache

def load_cache():
    try:
        c = json.load(open(CACHE_FILE, encoding="utf-8"))
        if c.get("_v") == CACHE_VERSION:
            c.setdefault("movie", {})
            c.setdefault("tv", {})
            return c
        print(f"  cache obsolete (v{c.get('_v')} -> v{CACHE_VERSION}), on repart de zero")
    except Exception:
        pass
    return {"_v": CACHE_VERSION, "movie": {}, "tv": {}}


def save_cache(c):
    json.dump(c, open(CACHE_FILE, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

# ─────────────────────────────────────────────────────────────── TMDB

_calls = [0]


def tmdb(path, **params):
    if not TMDB_KEY:
        raise SystemExit("!! TMDB_KEY absente de l'environnement.")
    params["api_key"] = TMDB_KEY
    url = f"{API}{path}?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=25) as r:
                _calls[0] += 1
                time.sleep(PAUSE)
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:                 # rate limit
                time.sleep(2 + attempt * 2)
                continue
            if e.code == 404:
                return None
            raise
        except Exception:
            time.sleep(1 + attempt)
    return None


def movie_runtime(cache, tid):
    """Duree d'un film, en minutes."""
    if tid in cache["movie"]:
        return cache["movie"][tid]
    d = tmdb(f"/movie/{tid}")
    rt = int(d.get("runtime") or 0) if d else 0
    cache["movie"][tid] = rt
    return rt


def tv_seasons(cache, tid):
    """{ "1": {"1": 22, "2": 23, ...}, ... } pour une serie entiere."""
    if tid in cache["tv"]:
        return cache["tv"][tid]
    show = tmdb(f"/tv/{tid}")
    out = {}
    if show:
        for s in show.get("seasons", []):
            n = s.get("season_number")
            if n is None or n == 0:           # on ignore les specials
                continue
            det = tmdb(f"/tv/{tid}/season/{n}")
            if not det:
                continue
            eps = {}
            for ep in det.get("episodes", []):
                eps[str(ep.get("episode_number"))] = int(ep.get("runtime") or 0)
            out[str(n)] = eps
    cache["tv"][tid] = out
    return out

# ─────────────────────────────────────────────────── parsing des entrees

ENTRY_SPLIT = re.compile(r"""(?=\{id:['"])""")
ERA_CUT = re.compile(r",\s*entries:\s*\[")


# Une chaine JS : quote ouvrante, contenu (echappements permis), meme quote
# fermante. Indispensable car les titres FR contiennent des apostrophes
# ("Propriete d'Ezra Bridger") et DC echappe les siennes ("Superman\'s").
STR_RE = r"""(['"])((?:\\.|(?!\1).)*)\1"""


def field(block, name):
    m = re.search(name + r":\s*" + STR_RE, block)
    return m.group(2) if m else None


def parse_entries(src):
    """Renvoie [{id, type, media, tmdb, title, subitems:[...]}, ...]."""
    out = []
    for block in ENTRY_SPLIT.split(src):
        if not re.match(r"""\{id:['"]""", block):
            continue
        block = ERA_CUT.split(block)[0]        # coupe au prochain groupe
        eid = field(block, "id")
        if not eid:
            continue
        subs = []
        m = re.search(r"subitems:\s*\[(.*?)\]", block, re.S)
        if m:
            subs = [g[1] for g in re.findall(STR_RE, m.group(1))
                    if g[1].strip() and g[1].strip() != ","]
        out.append({
            "id": eid,
            "type": field(block, "type") or "",
            "media": field(block, "media") or "",
            "tmdb": field(block, "tmdb") or "0",
            "title": field(block, "title") or "",
            "subitems": subs,
        })
    # dedoublonne en gardant l'ordre (une page peut lister un id 2x)
    seen, uniq = set(), []
    for e in out:
        if e["id"] in seen:
            continue
        seen.add(e["id"])
        uniq.append(e)
    return uniq


# Bilingue. Exemples reconnus :
#   "Season 3 Episodes 6-7 (Through Imperial Eyes)" -> (3, [6, 7])
#   "Saison 2 épisode 16"                           -> (2, [16])
#   "Season 5 (final)" / "Saison 4"                 -> (5, None) = saison entiere
SUB_RE = re.compile(
    r"(?:Season|Saison)\s+(\d+)"
    r"(?:\s+(?:Episodes?|Épisodes?)\s+([\d\s\-–]+))?",
    re.I)

# Subitems qui ne sont pas des episodes numerotes (shorts, webisodes…).
# Cle = debut du libelle, valeur = minutes pour le lot entier.
SUB_MANUAL = {
    "Shorts 1-4": 12,           # Rebels : 4 shorts d'environ 3 min
    "Courts-métrages 1-4": 12,  # idem, version FR
}


def parse_subitem(s):
    m = SUB_RE.search(s)
    if not m:
        return None
    season = int(m.group(1))
    raw = m.group(2)
    if not raw:
        return (season, None)
    nums = [int(x) for x in re.findall(r"\d+", raw)]
    if len(nums) == 2 and re.search(r"[-–]", raw) and nums[1] > nums[0]:
        nums = list(range(nums[0], nums[1] + 1))   # plage 6-7 -> 6,7
    return (season, nums)


# "Tales of the Jedi — Episode 2" / "… — Épisode 2" / "… — Episodes 2-3"
TITLE_EP_RE = re.compile(r"(?:Episodes?|Épisodes?)\s+([\d\s\-–]+)\s*$", re.I)

# ────────────────────────────────────────────────── calcul par entree


def entry_minutes(e, cache, problems):
    eid, media = e["id"], e["media"]

    if eid in MANUAL_MINUTES:
        return MANUAL_MINUTES[eid]
    if eid in ZERO_MINUTES:
        return 0
    if media == "game" or e["type"] == "jeu":
        v = GAME_MINUTES.get(eid)
        if v is None:
            problems.append((eid, "jeu sans duree -> GAME_MINUTES"))
            return None
        return v
    if e["type"] == "separator":
        return 0
    if media == "video":
        v = ONESHOT_MINUTES.get(eid)
        if v is None:
            problems.append((eid, "video inconnue -> ONESHOT_MINUTES/ZERO_MINUTES"))
            return None
        return v

    tid = e["tmdb"]
    if not tid or tid == "0":
        problems.append((eid, "pas d'id TMDB"))
        return None

    if media == "movie":
        rt = movie_runtime(cache, tid)
        if not rt:
            problems.append((eid, "TMDB ne donne pas de duree de film"))
            return None
        return rt

    if media == "tv":
        seasons = tv_seasons(cache, tid)
        if not seasons:
            problems.append((eid, "TMDB ne donne aucune saison"))
            return None

        def sum_eps(sn, eps):
            data = seasons.get(str(sn))
            if not data:
                problems.append((eid, f"saison {sn} absente de TMDB"))
                return 0
            if eps is None:
                eps = [int(k) for k in data.keys()]
            tot = 0
            for n in eps:
                v = data.get(str(n))
                if v is None:
                    problems.append((eid, f"S{sn}E{n} absent de TMDB"))
                    continue
                tot += v or DEFAULT_EP
            return tot

        # 1) entrees avec subitems : on somme ce qui est liste
        if e["subitems"]:
            total = 0
            for s in e["subitems"]:
                manual = next((v for k, v in SUB_MANUAL.items()
                               if s.strip().lower().startswith(k.lower())), None)
                if manual is not None:
                    total += manual
                    continue
                p = parse_subitem(s)
                if not p:
                    problems.append((eid, f"subitem illisible : {s!r}"))
                    continue
                total += sum_eps(p[0], p[1])
            return total or None

        # 2) numero d'episode dans le titre (Tales of the Jedi — Episode 2)
        m = TITLE_EP_RE.search(e["title"])
        if m:
            nums = [int(x) for x in re.findall(r"\d+", m.group(1))]
            if len(nums) == 2 and re.search(r"[-–]", m.group(1)):
                nums = list(range(nums[0], nums[1] + 1))
            return sum_eps(TITLE_EP_SEASON, nums) or None

        # 3) sinon : la serie entiere
        total = 0
        for sn in seasons:
            total += sum_eps(int(sn), None)
        return total or None

    problems.append((eid, f"media inconnu : {media!r}"))
    return None

# ─────────────────────────────────────────────────────── injection JS

RT_MARK_OPEN = "/* == CG-RUNTIME START (genere par runtime.py) == */"
RT_MARK_CLOSE = "/* == CG-RUNTIME END == */"

JS_TPL = """%(open)s
const RT=%(table)s;
window.RT=RT;
%(close)s"""




def patch_page(path, table, dry=False):
    src = open(path, encoding="utf-8").read()
    orig = src

    # 1) on retire toute trace d'un passage precedent (le script est rejouable)
    src = re.sub(re.escape(RT_MARK_OPEN) + r".*?" + re.escape(RT_MARK_CLOSE),
                 "", src, flags=re.S).replace("\n\n\n", "\n\n")
    src = src.replace("+cgTimeLeft()", "")

    block = JS_TPL % {
        "open": RT_MARK_OPEN, "close": RT_MARK_CLOSE,
        "table": json.dumps(table, ensure_ascii=False, sort_keys=True),
    }

    # 2) on pose le bloc juste avant la declaration de currentData / getP
    anchor = None
    for cand in ("let currentData=null;", "function getP(", "function getProgress("):
        i = src.find(cand)
        if i != -1:
            anchor = i
            break
    if anchor is None:
        return f"!! {path} : point d'ancrage JS introuvable, page non modifiee"
    src = src[:anchor] + block + "\n" + src[anchor:]

    if not dry:
        open(path, "w", encoding="utf-8").write(src)
    delta = len(src) - len(orig)
    return f"   {path:22} table RT injectee  ({delta:+d} octets)"

# ─────────────────────────────────────────────────────────────── main


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    dry = "--dry" in sys.argv
    pages = args or PAGES

    cache = load_cache()
    print(f"runtime.py — {len(pages)} page(s), dry={dry}\n")

    for path in pages:
        if not os.path.exists(path):
            print(f"!! {path} introuvable, ignore")
            continue
        src = open(path, encoding="utf-8").read()
        entries = parse_entries(src)

        table, problems = {}, []
        for e in entries:
            m = entry_minutes(e, cache, problems)
            if m is not None:
                table[e["id"]] = m
        save_cache(cache)

        total = sum(table.values())
        print(f"== {path}")
        print(f"   {len(entries)} entrees, {len(table)} chiffrees, "
              f"total {total//60} h {total%60:02d}")

        # detail par categorie : permet de reperer d'un coup d'oeil
        # une famille entiere qui serait passee a la trappe.
        by_kind = {}
        for e in entries:
            m = table.get(e["id"])
            if m is None:
                continue
            k = "jeu" if (e["media"] == "game" or e["type"] == "jeu") else e["media"]
            n, mins = by_kind.get(k, (0, 0))
            by_kind[k] = (n + 1, mins + m)
        for k in sorted(by_kind):
            n, mins = by_kind[k]
            print(f"     {k:8} {n:4} entrees  {mins//60:5} h {mins%60:02d}")

        # On ne signale que les overrides censes concerner CETTE page,
        # reconnus par le prefixe des ids ("sw-", "mcu-", "dc-"…).
        page_ids = {e["id"] for e in entries}
        prefixes = {i.split("-")[0] for i in page_ids}
        orphans = [i for i in (set(GAME_MINUTES) | set(ONESHOT_MINUTES) |
                               set(MANUAL_MINUTES))
                   if i not in page_ids and i.split("-")[0] in prefixes]
        if orphans:
            print(f"     (!) ids d'override absents de cette page : "
                  f"{', '.join(sorted(orphans))}")
        print("  ", patch_page(path, table, dry).strip())
        if problems:
            print(f"   {len(problems)} trou(s) :")
            for eid, why in problems[:25]:
                print(f"     - {eid:20} {why}")
            if len(problems) > 25:
                print(f"     … et {len(problems)-25} autres")
        print()

    print(f"{_calls[0]} appels TMDB. Cache : {CACHE_FILE}")


if __name__ == "__main__":
    main()
