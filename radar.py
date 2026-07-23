#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chronologeek — Radar des sorties
Agrège les sorties à venir (Star Wars, Marvel, DC, Avatar) depuis plusieurs
sources, croise avec les timelines déjà en ligne, et génère radar.html.

Chaque source est isolée : si l'une casse, les autres continuent.
"""

import os, re, json, html, datetime, traceback
try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("Europe/Paris")
except Exception:
    TZ = None
import requests
from bs4 import BeautifulSoup

TODAY = datetime.date.today()
HORIZON = TODAY + datetime.timedelta(days=540)   # on regarde 18 mois devant
TMDB_KEY = os.environ.get("TMDB_KEY", "")
UA = {"User-Agent": "Chronologeek-Radar/1.0 (+https://chronologeek.app)"}
# Fandom bloque les user-agents non navigateurs (403) : on se présente autrement
UA_BROWSER = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
    "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

UNIVERSES = {
    "starwars": {"label": "Star Wars",     "color": "#4d9fff", "file": "starwars.html"},
    "marvel":   {"label": "Marvel",        "color": "#e23636", "file": "marvel.html"},
    "dc":       {"label": "DC",            "color": "#f5c842", "file": "dc.html"},
    "avatar":   {"label": "Avatar",        "color": "#7dd3fc", "file": "avatar.html"},
}

# Sociétés recherchées par nom sur TMDB (les IDs sont résolus automatiquement)
TMDB_COMPANY_NAMES = {
    "starwars": ["Lucasfilm"],
    "marvel":   ["Marvel Studios", "Marvel Television", "Marvel Entertainment"],
    "dc":       ["DC Studios", "DC Films", "DC Entertainment", "DC Comics"],
    "avatar":   ["Avatar Studios", "Nickelodeon Animation Studio"],
}

# Exclusions : jamais canon ou hors périmètre. Motifs testés sur "titre + type".
EXCLUDE = {
    "avatar":   [r"noveli[sz]ation"],
    "starwars": [r"\blego\b", r"noveli[sz]ation"],
    "marvel":   [r"\blego\b"],
    "dc":       [r"\blego\b"],
    "*":        [],
}

# Avatar : seuls ces types de médias nous intéressent (le reste = goodies)
AVATAR_KEEP = ("movie", "tv series", "micro series", "series", "comic",
               "graphic novel", "comic story", "novel")
AVATAR_DROP = ("video game", "ttrpg", "coloring", "colouring", "color-by",
               "activity", "artbook", "scrapbook", "amigurumi", "pop-up",
               "audio drama", "website", "encyclopedia", "dictionary",
               "handbook", "miscellaneous", "tonie")

# Séries en cours à surveiller : prochain épisode (id TMDB -> univers)
TRACKED_SHOWS = {
    # exemple : 202555: "marvel",
}

results = []      # {universe, title, date_txt, date_sort, kind, source}
report  = []      # lignes de diagnostic
excluded = []     # entrées filtrées par EXCLUDE


def log(msg):
    report.append(msg)
    print(msg)


def add(universe, title, date_sort, date_txt, kind, source, precision="day", era="", syn="", wiki="", syn_fr=""):
    title = re.sub(r"\s+", " ", (title or "")).strip(" –-—:")
    if not title:
        return
    blob = f"{title} {kind or ''}"
    for pat in EXCLUDE.get(universe, []) + EXCLUDE.get("*", []):
        if re.search(pat, blob, re.I):
            excluded.append(f"{universe}: {title}")
            return
    results.append({
        "universe": universe, "title": title, "date_sort": date_sort,
        "date_txt": date_txt, "kind": kind or "", "source": source,
        "precision": precision, "era": era, "syn": syn, "wiki": wiki,
        "syn_fr": syn_fr, "kindKey": kind_key(kind),
    })


# ────────────────────────────────────────── SOURCE 1 : TMDB
def parse_iso(d):
    try:
        return datetime.date.fromisoformat(d)
    except Exception:
        return None


def tmdb_company_ids(name):
    """Résout un nom de société en IDs TMDB (évite les IDs en dur qui périment)."""
    try:
        r = requests.get("https://api.themoviedb.org/3/search/company", timeout=25,
                         headers=UA, params={"api_key": TMDB_KEY, "query": name})
        r.raise_for_status()
        out = []
        for c in r.json().get("results", [])[:4]:
            if name.lower().split()[0] in (c.get("name") or "").lower():
                out.append(c["id"])
        return out
    except Exception as e:
        log(f"TMDB      : recherche société '{name}' — {e}")
        return []


def source_tmdb():
    if not TMDB_KEY:
        log("TMDB      : ⚠ pas de clé (secret TMDB_KEY absent)")
        return
    base = "https://api.themoviedb.org/3"
    total = 0
    for uni, names in TMDB_COMPANY_NAMES.items():
        ids = []
        for n in names:
            ids += tmdb_company_ids(n)
        ids = sorted(set(ids))
        if not ids:
            log(f"TMDB      : {uni} — aucune société trouvée")
            continue
        joined = "|".join(str(i) for i in ids)      # | = OU chez TMDB
        found = 0
        for kind, path, datefield in (
            ("Film",  "/discover/movie", "primary_release_date"),
            ("Série", "/discover/tv",    "first_air_date"),
        ):
            for page in (1, 2):
                def query(lang):
                    r = requests.get(base + path, timeout=25, headers=UA, params={
                        "api_key": TMDB_KEY,
                        "with_companies": joined,
                        f"{datefield}.gte": TODAY.isoformat(),
                        f"{datefield}.lte": HORIZON.isoformat(),
                        "sort_by": f"{datefield}.asc",
                        "language": lang,
                        "include_adult": "false",
                        "page": page,
                    })
                    r.raise_for_status()
                    return r.json()
                try:
                    j = query("en-US")
                    try:                      # synopsis français (même requête, autre langue)
                        fr = {it.get("id"): (it.get("overview") or "").strip()
                              for it in query("fr-FR").get("results", [])}
                    except Exception:
                        fr = {}
                    for it in j.get("results", []):
                        raw = it.get("release_date") or it.get("first_air_date")
                        d = parse_iso(raw or "")
                        if not d or d < TODAY:
                            continue
                        add(uni, it.get("title") or it.get("name"), d.isoformat(),
                            d.strftime("%d/%m/%Y"), kind, "TMDB",
                            syn=(it.get("overview") or "").strip(),
                            syn_fr=fr.get(it.get("id"), ""))
                        found += 1
                    if page >= j.get("total_pages", 1):
                        break
                except Exception as e:
                    log(f"TMDB      : erreur {uni} ({kind}) — {e}")
                    break
        log(f"TMDB      : {uni} — sociétés {joined} → {found} entrée(s)")
        total += found
    for show_id, uni in TRACKED_SHOWS.items():
        try:
            r = requests.get(f"{base}/tv/{show_id}", timeout=25, headers=UA,
                             params={"api_key": TMDB_KEY, "language": "en-US"})
            r.raise_for_status()
            j = r.json()
            nxt = j.get("next_episode_to_air") or {}
            d = parse_iso(nxt.get("air_date") or "")
            if d and d >= TODAY:
                add(uni, f"{j.get('name')} — S{nxt.get('season_number')}E{nxt.get('episode_number')}",
                    d.isoformat(), d.strftime("%d/%m/%Y"), "Épisode", "TMDB")
                total += 1
        except Exception as e:
            log(f"TMDB      : erreur série {show_id} — {e}")
    log(f"TMDB      : {total} entrée(s) au total")


# ────────────────────────────────────────── SOURCE 2 : Avatar Almanac
MONTHS = {m: i for i, m in enumerate(
    ["january","february","march","april","may","june","july",
     "august","september","october","november","december"], 1)}


def loose_date(txt):
    """-> (tri, affichage, précision)  précision = day | month | vague | tba"""
    t = (txt or "").strip()
    if not t or t.upper() in ("TBA", "TBD"):
        return ("9999-99-99", "À confirmer", "tba")
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", t)          # ISO : 2026-10-14
    if m:
        try:
            d = datetime.date(*map(int, m.groups()))
            return (d.isoformat(), d.strftime("%d/%m/%Y"), "day")
        except ValueError:
            pass
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", t)      # 14/10/2026
    if m:
        try:
            d = datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
            return (d.isoformat(), d.strftime("%d/%m/%Y"), "day")
        except ValueError:
            pass
    m = re.match(r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})", t)
    if m and m.group(1).lower() in MONTHS:
        d = datetime.date(int(m.group(3)), MONTHS[m.group(1).lower()], int(m.group(2)))
        return (d.isoformat(), d.strftime("%d/%m/%Y"), "day")
    m = re.match(r"([A-Za-z]+)\s+(\d{4})", t)
    if m and m.group(1).lower() in MONTHS:
        y, mo = int(m.group(2)), MONTHS[m.group(1).lower()]
        return (f"{y:04d}-{mo:02d}-15", t, "month")
    m = re.search(r"(\d{4})", t)
    if m:
        return (f"{m.group(1)}-06-30", t, "vague")
    return ("9999-99-99", t, "tba")


def source_avatar_almanac():
    try:
        r = requests.get("https://avataralmanac.com/upcoming-releases/",
                         timeout=30, headers=UA)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        heads = soup.find_all(re.compile(r"^h[3-5]$"))
        n = skipped = 0
        for h in heads:
            title = h.get_text(" ", strip=True)
            if not title or len(title) < 3:
                continue
            low = title.lower()
            if low.startswith(("table of", "color key", "upcoming", "what exactly",
                               "canon media", "comics", "about", "changelog")) \
               or re.fullmatch(r"\d{4} releases|undated releases", low):
                continue
            # parcours en ordre document (et pas en fratrie : WordPress imbrique les blocs)
            kind = date_raw = ""
            for el in h.find_all_next():
                if el.name and re.match(r"^h[1-5]$", el.name):
                    break
                if el.name not in ("p", "li", "figcaption", "div", "span"):
                    continue
                txt = el.get_text(" ", strip=True)
                if not kind:
                    m = re.search(r"Media Type:\s*(.+)$", txt)
                    if m:
                        kind = m.group(1).strip()[:60]
                if not date_raw:
                    m = re.search(r"Release Date:\s*(.+)$", txt)
                    if m:
                        date_raw = m.group(1).strip()[:40]
                if kind and date_raw:
                    break
            if not date_raw:
                continue
            k = kind.lower()
            if any(x in k for x in AVATAR_DROP) or not any(x in k for x in AVATAR_KEEP):
                skipped += 1
                continue
            ds, dt, prec = loose_date(date_raw)
            if prec not in ("day", "month"):      # pas de date confirmée -> on ignore
                skipped += 1
                continue
            if ds < TODAY.isoformat():
                continue
            add("avatar", title, ds, dt, kind, "Avatar Almanac", prec)
            n += 1
        log(f"Almanac   : {n} entrée(s) retenue(s), {skipped} écartée(s) "
            f"(goodies ou date non confirmée)")
    except Exception as e:
        log(f"Almanac   : ÉCHEC — {e}")


# ────────────────────────────────────────── SOURCE 3 : Wookieepedia
def fetch_wookiee_html():
    """Essaie l'API MediaWiki puis la page brute. Renvoie (html, méthode)."""
    api = ("https://starwars.fandom.com/api.php?action=parse"
           "&page=Timeline_of_canon_media&prop=text&format=json&formatversion=2")
    try:
        r = requests.get(api, timeout=45, headers=UA_BROWSER)
        if r.status_code == 200:
            txt = r.json().get("parse", {}).get("text", "")
            if isinstance(txt, dict):
                txt = txt.get("*", "")
            if txt:
                return txt, "API"
        else:
            log(f"Wookiee   : API → HTTP {r.status_code}")
    except Exception as e:
        log(f"Wookiee   : API indisponible — {e}")
    try:
        r = requests.get("https://starwars.fandom.com/wiki/Timeline_of_canon_media",
                         timeout=45, headers=UA_BROWSER)
        r.raise_for_status()
        return r.text, "HTML"
    except Exception as e:
        log(f"Wookiee   : page brute — {e}")
    return "", "aucune"


def source_wookieepedia():
    raw, how = fetch_wookiee_html()
    if not raw:
        log("Wookiee   : ÉCHEC — aucune méthode n'a abouti")
        return
    try:
        soup = BeautifulSoup(raw, "html.parser")
        n = 0
        # diagnostic : quelles classes portent réellement les lignes ?
        from collections import Counter
        cnt = Counter()
        for tr in soup.find_all("tr"):
            for c in (tr.get("class") or []):
                cnt[c] += 1
        if cnt:
            top = ", ".join(f"{c}×{k}" for c, k in cnt.most_common(12))
            log(f"Wookiee   : classes de lignes vues → {top}")
        else:
            log(f"Wookiee   : aucune classe sur les <tr> ({len(soup.find_all('tr'))} lignes)")
        dated = 0
        for tr in soup.find_all("tr"):
            blob = (" ".join(tr.get("class") or []) + " " + (tr.get("style") or "")
                    + " " + " ".join(
                        " ".join(c.get("class") or []) + " " + (c.get("style") or "")
                        for c in tr.find_all(["td", "th"]))).lower()
            # les lignes non sorties portent un marqueur de classe ou un fond coloré
            if not re.search(r"unpublished|unrelease|notyet|upcoming", blob):
                continue
            for sup in tr.find_all("sup"):      # appels de note [95]
                sup.decompose()
            klass = " ".join(tr.get("class") or []).lower()
            kind = ""
            for key, label in (("comic", "Comic"), ("videogame", "Jeu vidéo"),
                               ("tv", "Série"), ("film", "Film"),
                               ("junior", "Roman jeunesse"), ("young", "Young readers"),
                               ("novel", "Roman"), ("short", "Nouvelle"),
                               ("audio", "Audio"), ("promotional", "Promo"),
                               ("rpg", "JDR")):
                if re.search(rf"\b{key}\b", klass):
                    kind = label
                    break

            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
            cells = [c for c in cells if c]
            if not cells:
                continue

            ERA = re.compile(r"^(c\.|ca\.|circa|approx\.?)?[~\u2020\d\s.,\u2013-]*\d\s*(BBY|ABY)\b", re.I)
            # date in-universe : la cellule qui parle en BBY/ABY
            era = next((c for c in cells if ERA.match(c)), "")

            # titre : premier lien qui n'est PAS une année in-universe
            title = wiki = ""
            for a in tr.find_all("a"):
                t = a.get_text(" ", strip=True)
                if len(t) > 3 and not ERA.match(t) and not re.fullmatch(r"[\d\W]+", t):
                    title = t
                    href = a.get("href") or ""
                    m = re.search(r"/wiki/([^?#]+)", href)
                    if m:
                        wiki = requests.utils.unquote(m.group(1)).replace("_", " ")
                    break
            if not title:
                cand = [c for c in cells if len(c) > 3 and not ERA.match(c)]
                if not cand:
                    continue
                title = max(cand, key=len)

            # date de sortie réelle : ISO, JJ/MM/AAAA ou "Month YYYY" — jamais BBY/ABY
            date_txt = ""
            for c in cells:
                if ERA.match(c):
                    continue
                if re.search(r"\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{4}", c) or \
                   re.search(r"(January|February|March|April|May|June|July|August|"
                             r"September|October|November|December)\s+\d", c, re.I):
                    date_txt = c
                    break
            ds, dt, prec = (loose_date(date_txt) if date_txt
                            else ("9999-99-99", "À confirmer", "tba"))
            if prec == "tba":          # pas de date de sortie connue -> on ignore
                continue
            era = re.sub(r"\[\s*\d+\s*\]", "", era).strip()
            add("starwars", title, ds, dt, kind, "Wookieepedia", prec, era, wiki=wiki)
            n += 1
            dated += 1

        msg = f"Wookiee   : {n} entrée(s) (via {how}), dont {dated} datée(s)"
        if n == 0:
            msg += "  ⚠ aucune ligne 'unreleased' — marqueur à revoir"
        log(msg)
    except Exception as e:
        log(f"Wookiee   : parsing — {e}")


def normalize(s):
    s = html.unescape(s or "").lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def clean_wikitext(txt):
    """Wikitexte -> première phrase lisible."""
    t = txt or ""
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"<ref[^>]*/>", " ", t)
    t = re.sub(r"<ref.*?</ref>", " ", t, flags=re.S)
    for _ in range(8):                       # modèles imbriqués {{...}}
        nt = re.sub(r"\{\{[^{}]*\}\}", " ", t)
        if nt == t:
            break
        t = nt
    for _ in range(6):                       # fichiers et images
        t = re.sub(r"\[\[(?:File|Image|Fichier):[^\[\]]*\]\]", " ", t, flags=re.I)
    t = re.sub(r"\{\|.*?\|\}", " ", t, flags=re.S)          # tableaux
    t = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", t)      # [[cible|texte]]
    t = re.sub(r"\[\[([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace(chr(39) * 3, "").replace(chr(39) * 2, "")  # gras / italique wiki
    for line in t.split("\n"):
        line = line.strip()
        if len(line) > 60 and not line.startswith(("=", "*", "|", "!", ":", ";")):
            line = re.sub(r"\s+", " ", line)
            return line[:400] + ("…" if len(line) > 400 else "")
    return ""


def _wiki_revisions(chunk):
    """Méthode 1 : wikitexte par lots via api.php."""
    r = requests.get("https://starwars.fandom.com/api.php", timeout=45,
                     headers=UA_BROWSER, params={
                         "action": "query", "prop": "revisions",
                         "rvprop": "content", "rvslots": "main", "redirects": 1,
                         "format": "json", "formatversion": 2,
                         "titles": "|".join(e["wiki"] for e in chunk),
                     })
    r.raise_for_status()
    out = {}
    for p in r.json().get("query", {}).get("pages", []):
        revs = p.get("revisions") or []
        if not revs:
            continue
        content = (revs[0].get("slots", {}).get("main", {}) or {}).get("content", "")
        out[(p.get("title") or "").lower()] = clean_wikitext(content)
    return out


def _wiki_parse_one(title):
    """Méthode 2 : rendu de la section d'intro, page par page."""
    r = requests.get("https://starwars.fandom.com/api.php", timeout=30,
                     headers=UA_BROWSER, params={
                         "action": "parse", "page": title, "prop": "text",
                         "section": 0, "redirects": 1,
                         "format": "json", "formatversion": 2,
                     })
    r.raise_for_status()
    txt = r.json().get("parse", {}).get("text", "")
    if isinstance(txt, dict):
        txt = txt.get("*", "")
    soup = BeautifulSoup(txt or "", "html.parser")
    for bad in soup.find_all(["sup", "table", "aside", "figure", "div"]):
        bad.decompose()
    for p in soup.find_all("p"):
        s2 = re.sub(r"\s+", " ", p.get_text(" ", strip=True))
        if len(s2) > 60:
            return s2[:400] + ("…" if len(s2) > 400 else "")
    return ""


def fill_wiki_synopses(entries):
    todo = [e for e in entries if e.get("wiki") and not e.get("syn")]
    if not todo:
        return
    got, used = 0, []
    for i in range(0, len(todo), 20):
        chunk = todo[i:i + 20]
        try:
            pages = _wiki_revisions(chunk)
            for e in chunk:
                txt = pages.get(e["wiki"].lower(), "")
                if txt:
                    e["syn"] = txt
                    got += 1
            if any(e.get("syn") for e in chunk) and "wikitexte" not in used:
                used.append("wikitexte")
        except Exception as ex:
            if i == 0:
                log(f"Résumés   : wikitexte KO — {str(ex)[:120]}")
    rest = [e for e in todo if not e.get("syn")][:60]
    if rest:
        ok = 0
        for e in rest:
            try:
                txt = _wiki_parse_one(e["wiki"])
                if txt:
                    e["syn"] = txt
                    got += 1
                    ok += 1
            except Exception as ex:
                if ok == 0 and e is rest[0]:
                    log(f"Résumés   : intro-page KO — {str(ex)[:120]}")
        if ok and "intro-page" not in used:
            used.append("intro-page")
    log(f"Résumés   : {got}/{len(todo)} synopsis Wookieepedia"
        + (f" (via {', '.join(used)})" if used else " — aucune méthode n'a répondu"))


# ────────────────────────────────────────── Rendu HTML
# Palette canonique du site (identique aux badges des timelines)
KIND_COLORS = {
    "film":    "#64b5f6",
    "tv":      "#81c784",
    "comic":   "#fb923c",
    "novel":   "#a78bfa",
    "game":    "#ffb74d",
    "book":    "#94a3b8",
    "video":   "#f472b6",
    "special": "#ffa726",
    "other":   "#6b7280",
}
KIND_LABELS_FR = {
    "film": "Film", "tv": "Série", "comic": "Comic", "novel": "Roman",
    "game": "Jeu vidéo", "book": "Livre", "video": "Vidéo",
    "special": "Spécial", "other": "Autre",
}
KIND_LABELS_EN = {
    "film": "Movie", "tv": "TV show", "comic": "Comic", "novel": "Novel",
    "game": "Video game", "book": "Book", "video": "Video",
    "special": "Special", "other": "Other",
}
_KIND_MATCH = (
    ("graphic", "comic"), ("comic", "comic"),
    ("jeu", "game"), ("game", "game"),
    ("roman", "novel"), ("novel", "novel"),
    ("young", "novel"), ("junior", "novel"),
    ("nouvelle", "short"), ("short", "book"),
    ("audio", "video"), ("vidéo", "video"), ("video", "video"),
    ("livre", "book"), ("book", "book"),
    ("spécial", "special"), ("special", "special"), ("promo", "special"),
    ("épisode", "tv"), ("episode", "tv"), ("série", "tv"), ("serie", "tv"),
    ("tv", "tv"), ("mini", "tv"),
    ("film", "film"), ("movie", "film"),
)


def kind_key(kind):
    k = (kind or "").lower()
    for token, key in _KIND_MATCH:
        if token in k:
            return key
    return "other"


def kind_color(kind):
    return KIND_COLORS.get(kind_key(kind), KIND_COLORS["other"])


LEGEND = [(KIND_LABELS_FR[k], KIND_COLORS[k])
          for k in ("film", "tv", "comic", "novel", "game", "book", "video", "other")]


PAGE = """<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Radar des sorties — Chronologeek</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#08080f;color:#e8e8f0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:1.4rem;max-width:1600px;margin:0 auto}}
h1{{font-size:1.4rem;letter-spacing:.02em}}
.sub{{color:#8a8aa0;font-size:.83rem;margin:.3rem 0 1rem}}
.legend{{display:flex;flex-wrap:wrap;gap:.8rem;margin-bottom:1.4rem;font-size:.72rem;color:#8a8aa0}}
.legend span{{display:flex;align-items:center;gap:.35rem}}
.legend i{{width:9px;height:9px;border-radius:2px;display:block}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;align-items:start}}
.col{{min-width:0}}
.uni{{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:.95rem;padding:.5rem .2rem .7rem;position:sticky;top:0;background:#08080f;z-index:2}}
.dot{{width:9px;height:9px;border-radius:50%;flex-shrink:0}}
.count{{font-size:.72rem;color:#8a8aa0;font-weight:400}}
.row{{padding:.55rem .7rem;border:1px solid #23233a;border-left:3px solid #6b7280;border-radius:8px;margin-bottom:.4rem;background:#0d0d18}}
details.row{{cursor:pointer}}
details.row>summary{{list-style:none;display:block}}
details.row>summary::-webkit-details-marker{{display:none}}
details.row[open]{{background:#111120}}
details.row{{position:relative;padding-right:2.4rem}}
.chev{{position:absolute;right:.6rem;top:50%;transform:translateY(-50%);width:22px;height:22px;border-radius:50%;background:#1b1b2e;border:1px solid #3a3a58;color:#c9c9e0;font-size:.72rem;display:flex;align-items:center;justify-content:center;transition:all .18s}}
details.row:hover .chev{{border-color:#7c6af7;color:#fff}}
details.row[open] .chev{{background:#7c6af7;border-color:#7c6af7;color:#fff;transform:translateY(-50%) rotate(180deg)}}
.syn{{margin-top:.5rem;padding-top:.5rem;border-top:1px solid #23233a;color:#a8a8c0;font-size:.75rem;line-height:1.55;cursor:auto}}
.date{{font-variant-numeric:tabular-nums;color:#b9b9d0;font-size:.76rem}}
.t{{font-weight:600;font-size:.85rem;line-height:1.3;margin:.15rem 0}}
.meta{{color:#7f7f9a;font-size:.7rem;display:flex;justify-content:space-between;gap:.5rem}}
.rep{{margin-top:2rem;padding:.85rem 1rem;border:1px dashed #23233a;border-radius:10px;color:#8a8aa0;font-size:.75rem;line-height:1.65;white-space:pre-wrap;font-family:ui-monospace,monospace}}
@media(max-width:1200px){{.grid{{grid-template-columns:repeat(2,1fr)}}}}
@media(max-width:640px){{.grid{{grid-template-columns:1fr}}}}
</style></head><body>
<h1>🛰️ Radar des sorties</h1>
<div class="sub">Généré le {gen} · {total} sortie(s) à venir</div>
<div class="legend">{legend}</div>
<div class="grid">{body}</div>
<div class="rep">{report}</div>
</body></html>"""


def render(entries):
    cols = []
    for uni, meta in UNIVERSES.items():
        sub = [e for e in entries if e["universe"] == uni]
        sub.sort(key=lambda e: (e["date_sort"], e["title"]))
        rows = []
        for e in sub:
            col = kind_color(e["kind"])
            head = (f'<div class="date">{html.escape(e["date_txt"])}</div>'
                    f'<div class="t">{html.escape(e["title"])}</div>'
                    f'<div class="meta"><span>{html.escape(e["kind"] or "—")}</span>'
                    f'<span>{html.escape(e["era"] or "")}</span></div>')
            if e.get("syn"):
                rows.append(
                    f'<details class="row" style="border-left-color:{col}">'
                    f'<summary>{head}<span class="chev">▾</span></summary>'
                    f'<div class="syn">{html.escape(e["syn"])}</div></details>')
            else:
                rows.append(f'<div class="row" style="border-left-color:{col}">{head}</div>')
        cols.append(
            f'<div class="col"><div class="uni">'
            f'<span class="dot" style="background:{meta["color"]}"></span>'
            f'{meta["label"]} <span class="count">{len(sub)}</span></div>'
            + ("".join(rows) or '<div class="row" style="border-left-color:#23233a">'
                                '<div class="meta">Rien à venir</div></div>') + '</div>')
    return "".join(cols)


def main():
    for fn in (source_tmdb, source_avatar_almanac, source_wookieepedia):
        try:
            fn()
        except Exception:
            log(f"{fn.__name__} : crash inattendu\n{traceback.format_exc(limit=2)}")

    # dédoublonnage (même titre + même univers)
    seen, uniq = set(), []
    dropped = sum(1 for e in results if e["precision"] == "tba")
    for e in sorted([r for r in results if r["precision"] != "tba"],
                    key=lambda x: x["date_sort"]):
        k = (e["universe"], normalize(e["title"]))
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)

    fill_wiki_synopses(uniq)
    if excluded:
        log(f"Exclus    : {len(excluded)} (LEGO / novélisations) — "
            + "; ".join(excluded[:6]) + ("…" if len(excluded) > 6 else ""))
    log(f"TOTAL     : {len(uniq)} sortie(s) datée(s) · {dropped} sans date écartée(s)")

    page = PAGE.format(
        gen=datetime.datetime.now(TZ).strftime("%d/%m/%Y à %H:%M"),
        total=len(uniq),
        legend="".join(f'<span><i style="background:{c}"></i>{l}</span>'
                       for l, c in LEGEND),
        body=render(uniq),
        report=html.escape("\n".join(report)))
    with open("radar.html", "w", encoding="utf-8") as f:
        f.write(page)
    with open("radar.json", "w", encoding="utf-8") as f:
        json.dump(uniq, f, ensure_ascii=False, indent=1)
    print("radar.html généré")


if __name__ == "__main__":
    main()
