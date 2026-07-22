#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chronologeek — Radar des sorties
Agrège les sorties à venir (Star Wars, Marvel, DC, Avatar) depuis plusieurs
sources, croise avec les timelines déjà en ligne, et génère radar.html.

Chaque source est isolée : si l'une casse, les autres continuent.
"""

import os, re, json, html, datetime, traceback
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

# Séries en cours à surveiller : prochain épisode (id TMDB -> univers)
TRACKED_SHOWS = {
    # exemple : 202555: "marvel",
}

results = []      # {universe, title, date_txt, date_sort, kind, source}
report  = []      # lignes de diagnostic


def log(msg):
    report.append(msg)
    print(msg)


def add(universe, title, date_sort, date_txt, kind, source):
    title = re.sub(r"\s+", " ", (title or "")).strip(" –-—:")
    if not title:
        return
    results.append({
        "universe": universe, "title": title, "date_sort": date_sort,
        "date_txt": date_txt, "kind": kind or "", "source": source,
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
                try:
                    r = requests.get(base + path, timeout=25, headers=UA, params={
                        "api_key": TMDB_KEY,
                        "with_companies": joined,
                        f"{datefield}.gte": TODAY.isoformat(),
                        f"{datefield}.lte": HORIZON.isoformat(),
                        "sort_by": f"{datefield}.asc",
                        "language": "en-US",
                        "include_adult": "false",
                        "page": page,
                    })
                    r.raise_for_status()
                    j = r.json()
                    for it in j.get("results", []):
                        raw = it.get("release_date") or it.get("first_air_date")
                        d = parse_iso(raw or "")
                        if not d or d < TODAY:
                            continue
                        add(uni, it.get("title") or it.get("name"), d.isoformat(),
                            d.strftime("%d/%m/%Y"), kind, "TMDB")
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
    """'July 25, 2026' / 'September 2026' / 'Fall 2026' / 'TBA' -> (tri, affichage)"""
    t = (txt or "").strip()
    if not t or t.upper() in ("TBA", "TBD"):
        return ("9999-99-99", "À confirmer")
    m = re.match(r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})", t)
    if m and m.group(1).lower() in MONTHS:
        d = datetime.date(int(m.group(3)), MONTHS[m.group(1).lower()], int(m.group(2)))
        return (d.isoformat(), d.strftime("%d/%m/%Y"))
    m = re.match(r"([A-Za-z]+)\s+(\d{4})", t)
    if m and m.group(1).lower() in MONTHS:
        y, mo = int(m.group(2)), MONTHS[m.group(1).lower()]
        return (f"{y:04d}-{mo:02d}-15", t)
    m = re.search(r"(\d{4})", t)
    if m:
        return (f"{m.group(1)}-06-30", t)
    return ("9999-99-99", t)


def source_avatar_almanac():
    try:
        r = requests.get("https://avataralmanac.com/upcoming-releases/",
                         timeout=30, headers=UA)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        heads = soup.find_all(re.compile(r"^h[3-5]$"))
        n = 0
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
            ds, dt = loose_date(date_raw)
            if ds != "9999-99-99" and ds < TODAY.isoformat():
                continue
            add("avatar", title, ds, dt, kind, "Avatar Almanac")
            n += 1
        log(f"Almanac   : {n} entrée(s) ({len(heads)} titre(s) scanné(s))")
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
        for tr in soup.find_all("tr"):
            blob = (" ".join(tr.get("class") or []) + " " + (tr.get("style") or "")
                    + " " + " ".join(
                        " ".join(c.get("class") or []) + " " + (c.get("style") or "")
                        for c in tr.find_all(["td", "th"]))).lower()
            # les lignes non sorties portent un marqueur de classe ou un fond coloré
            if not re.search(r"unrelease|notyet|upcoming", blob):
                continue
            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
            cells = [c for c in cells if c]
            if not cells:
                continue
            cand = [c for c in cells
                    if not re.fullmatch(r"[\d\s.,\u2013-]+(ABY|BBY)?", c) and len(c) > 3]
            if not cand:
                continue
            title = max(cand, key=len)
            date_txt = ""
            for c in cells:
                if re.search(r"\b20\d{2}\b", c) and not re.search(r"(ABY|BBY)", c):
                    date_txt = c
                    break
            ds, dt = loose_date(date_txt) if date_txt else ("9999-99-99", "À confirmer")
            add("starwars", title, ds, dt, "", "Wookieepedia")
            n += 1
        msg = f"Wookiee   : {n} entrée(s) (via {how})"
        if n == 0:
            msg += "  ⚠ aucune ligne 'unreleased' — marqueur à revoir"
        log(msg)
    except Exception as e:
        log(f"Wookiee   : parsing — {e}")


# ────────────────────────────────────────── Croisement avec le site
def normalize(s):
    s = html.unescape(s or "").lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def load_existing():
    store = {}
    for uni, meta in UNIVERSES.items():
        try:
            with open(meta["file"], encoding="utf-8") as f:
                store[uni] = normalize(f.read())
        except Exception:
            store[uni] = ""
    return store


def already_in_site(entry, existing):
    t = normalize(entry["title"])
    t = re.sub(r"^(untitled|the) ", "", t)
    if len(t) < 5:
        return False
    return t in existing.get(entry["universe"], "")


# ────────────────────────────────────────── Rendu HTML
PAGE = """<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Radar des sorties — Chronologeek</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#08080f;color:#e8e8f0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:1.5rem;max-width:1000px;margin:0 auto}}
h1{{font-size:1.5rem;letter-spacing:.02em}}
.sub{{color:#8a8aa0;font-size:.85rem;margin:.35rem 0 1.5rem}}
.uni{{margin:2rem 0 .75rem;font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:.6rem}}
.dot{{width:10px;height:10px;border-radius:50%}}
.count{{font-size:.75rem;color:#8a8aa0;font-weight:400}}
.row{{display:flex;gap:.9rem;align-items:flex-start;padding:.7rem .9rem;border:1px solid #23233a;border-radius:10px;margin-bottom:.5rem;background:#0d0d18}}
.row.new{{border-color:#7c6af7;box-shadow:0 0 0 1px rgba(124,106,247,.2)}}
.date{{min-width:92px;font-variant-numeric:tabular-nums;color:#b9b9d0;font-size:.85rem;padding-top:.1rem}}
.main{{flex:1;min-width:0}}
.t{{font-weight:600;font-size:.95rem;line-height:1.35}}
.meta{{color:#8a8aa0;font-size:.75rem;margin-top:.2rem}}
.tag{{font-size:.65rem;padding:.15rem .5rem;border-radius:20px;white-space:nowrap;letter-spacing:.04em}}
.tag.new{{background:rgba(124,106,247,.18);color:#a99cf9;border:1px solid rgba(124,106,247,.45)}}
.tag.ok{{background:rgba(80,200,120,.12);color:#6ec98a;border:1px solid rgba(80,200,120,.3)}}
.rep{{margin-top:2.5rem;padding:.9rem 1rem;border:1px dashed #23233a;border-radius:10px;color:#8a8aa0;font-size:.78rem;line-height:1.7;white-space:pre-wrap;font-family:ui-monospace,monospace}}
</style></head><body>
<h1>🛰️ Radar des sorties</h1>
<div class="sub">Généré le {gen} · {total} sortie(s) à venir · <b style="color:#a99cf9">{news} à ajouter au site</b></div>
{body}
<div class="rep">{report}</div>
</body></html>"""


def render(entries, existing):
    blocks = []
    for uni, meta in UNIVERSES.items():
        sub = [e for e in entries if e["universe"] == uni]
        if not sub:
            continue
        sub.sort(key=lambda e: (e["date_sort"], e["title"]))
        rows = []
        for e in sub:
            known = already_in_site(e, existing)
            tag = ('<span class="tag ok">DANS LE SITE</span>' if known
                   else '<span class="tag new">À AJOUTER</span>')
            meta_line = " · ".join(x for x in (e["kind"], e["source"]) if x)
            rows.append(
                f'<div class="row{"" if known else " new"}">'
                f'<div class="date">{html.escape(e["date_txt"])}</div>'
                f'<div class="main"><div class="t">{html.escape(e["title"])}</div>'
                f'<div class="meta">{html.escape(meta_line)}</div></div>{tag}</div>')
        blocks.append(
            f'<div class="uni"><span class="dot" style="background:{meta["color"]}"></span>'
            f'{meta["label"]} <span class="count">{len(sub)}</span></div>' + "".join(rows))
    return "".join(blocks)


def main():
    for fn in (source_tmdb, source_avatar_almanac, source_wookieepedia):
        try:
            fn()
        except Exception:
            log(f"{fn.__name__} : crash inattendu\n{traceback.format_exc(limit=2)}")

    # dédoublonnage (même titre + même univers)
    seen, uniq = set(), []
    for e in sorted(results, key=lambda x: x["date_sort"]):
        k = (e["universe"], normalize(e["title"]))
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)

    existing = load_existing()
    news = sum(1 for e in uniq if not already_in_site(e, existing))
    log(f"TOTAL     : {len(uniq)} sortie(s) · {news} à ajouter")

    page = PAGE.format(
        gen=datetime.datetime.now().strftime("%d/%m/%Y à %H:%M"),
        total=len(uniq), news=news,
        body=render(uniq, existing) or "<p>Aucune sortie trouvée.</p>",
        report=html.escape("\n".join(report)))
    with open("radar.html", "w", encoding="utf-8") as f:
        f.write(page)
    with open("radar.json", "w", encoding="utf-8") as f:
        json.dump(uniq, f, ensure_ascii=False, indent=1)
    print("radar.html généré")


if __name__ == "__main__":
    main()
