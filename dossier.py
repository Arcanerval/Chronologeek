#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chronologeek — Dossier « Romans & Comics Star Wars »

Lit dossier-source.txt, interroge la Wookieepedia (EN pour le type de média,
FR pour les titres traduits), puis génère dossier-comics.html.

Le type de média n'est jamais deviné : il vient des catégories de l'article.
"""

import os, re, json, html, datetime, difflib
import requests
from dossier_i18n import (SCREEN, SHOWS, NOTES, ERAS, INTRO_FR, INTRO_EN,
                          SERIES_KIND, TITLE_KIND)

TMDB_KEY = os.environ.get("TMDB_KEY", "")
TMDB = "https://api.themoviedb.org/3"

EN_API = "https://starwars.fandom.com/api.php"
FR_API = "https://starwars.fandom.com/fr/api.php"
UA = {"User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                     "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
      "Accept": "application/json,text/html;q=0.9,*/*;q=0.8"}

SOURCE = "dossier-source.txt"
OUTPUT = "dossier-comics.html"
CACHE  = "dossier-cache.json"       # évite de réinterroger le wiki à chaque exécution

report = []
def log(m):
    report.append(m); print(m)

# ───────────────────────────────────────────────── 1. PARSEUR
DATE = re.compile(r'^\s*(~?\d+(?:\s*[-–]\s*~?\d+)?\s*(?:BBY|ABY)'
                  r'(?:\s*[-–]\s*~?\d+\s*(?:BBY|ABY))?)\s+(.*)$')
ERA_LINE = re.compile(r"^[A-Z][A-Z '&-]+$")
NOTE_WORDS = re.compile(r'^(avant|apr[èe]s|pendant|prologue|epilogue|épilogue|audiobook|'
                        r'au d[ée]but|[àa] la fin|entre|juste|se d[ée]roule|flashback|'
                        r'lire|voir|d[ée]but|fin)\b', re.I)
RANGE = re.compile(r'^(.*?)\s+(\d+)\s*[-–]\s*(\d+)\s*$')
SINGLE = re.compile(r'^(.*?)\s+(\d+)\s*$')

def split_note(title):
    notes, t = [], title.strip()
    while True:
        m = re.search(r'\s*\(([^()]*)\)\s*$', t)
        if not m:
            break
        inner = m.group(1).strip()
        if NOTE_WORDS.match(inner) or len(inner.split()) > 3:
            notes.insert(0, inner); t = t[:m.start()].rstrip()
        else:
            break
    return t, " · ".join(notes)


def wiki_title(t):
    w = re.sub(r'\s*:\s*', ': ', t).strip()
    w = re.sub(r'\s+', ' ', w)
    m = RANGE.match(w)
    if m:
        return f"{m.group(1)} {m.group(2)}"
    m = re.match(r'^(.*?\s\d+):\s.+$', w)
    if m:
        return m.group(1)
    return w


def issue_span(t):
    m = RANGE.match(t)
    if m:
        a, b = int(m.group(2)), int(m.group(3))
        return [a, max(a, b)]
    m = SINGLE.match(t)
    if m and not re.search(r'\b(19|20)\d\d$', t):
        return [int(m.group(2))] * 2
    return None


def parse(path):
    era, out = "", []
    for raw in open(path, encoding='utf-8'):
        line = raw.rstrip('\r\n').strip()
        if not line:
            continue
        m = DATE.match(line)
        if not m:
            if ERA_LINE.match(line):
                era = line
            continue
        date = re.sub(r'\s+', ' ', m.group(1).strip())
        rest = m.group(2).strip()
        core = re.sub(r'\([^()]*\)', '', rest).strip()
        screen = bool(core and core == core.upper() and re.search(r'[A-Z]', core))
        title, note = split_note(rest)
        out.append({"era": era, "date": date, "title": title, "note": note,
                    "screen": screen, "wiki": "" if screen else wiki_title(title),
                    "span": None if screen else issue_span(title),
                    "kind": "screen" if screen else "", "fr": "", "en": "", "frOk": None})
    return out


# ───────────────────────────────────────────────── 2. TYPE DE MÉDIA (catégories EN)
def batch(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def fetch_categories(titles):
    """{titre demandé: [catégories]} — gère la continuation de l'API."""
    out = {}
    for part in batch(titles, 20):
        pages, alias, cont = {}, {}, {}
        for _ in range(12):                      # sécurité anti-boucle infinie
            try:
                params = {"action": "query", "prop": "categories", "cllimit": "max",
                          "redirects": 1, "format": "json", "formatversion": 2,
                          "titles": "|".join(part)}
                params.update(cont)
                r = requests.get(EN_API, timeout=60, headers=UA, params=params)
                r.raise_for_status()
                j = r.json()
            except Exception as e:
                log(f"Catégories : lot ignoré — {str(e)[:80]}")
                break
            q = j.get("query", {})
            for n in q.get("normalized", []) + q.get("redirects", []):
                alias[n["from"]] = n["to"]
            for p in q.get("pages", []):
                if p.get("missing") or not p.get("title"):
                    continue
                pages.setdefault(p["title"], []).extend(
                    c.get("title", "").replace("Category:", "")
                    for c in (p.get("categories") or []))
            if "continue" in j:
                cont = j["continue"]
            else:
                break
        for t in part:
            key = t
            for _ in range(4):
                key = alias.get(key, key)
            if key in pages:
                out[t] = pages[key]
    return out


def en_search(title):
    try:
        r = requests.get(EN_API, timeout=30, headers=UA, params={
            "action": "query", "list": "search", "srsearch": f'"{title}"',
            "srlimit": 3, "format": "json", "formatversion": 2})
        r.raise_for_status()
        return [h["title"] for h in r.json().get("query", {}).get("search", [])]
    except Exception:
        return []


def resolve_categories(titles):
    """Trouve la page Wookieepedia de chaque titre, en essayant plusieurs formes."""
    found, stats = {}, {}
    pending = list(titles)

    def is_media(cs):
        low = [c.lower() for c in cs]
        return ("canon media" in low or "legends media" in low
                or any(re.search(r'canon (novel|comic|junior|young|audio|short)', c) for c in low))

    def take(mapping, label):
        nonlocal pending
        cats = fetch_categories(list(mapping))
        got = 0
        for probe, cs in cats.items():
            src = mapping[probe]
            if src not in found and is_media(cs):
                found[src] = (probe, cs); got += 1
        if got:
            stats[label] = got
        pending = [t for t in pending if t not in found]

    take({t: t for t in pending}, "titre exact")
    if pending:
        take({f"Star Wars: {t}": t for t in pending}, "préfixe Star Wars")
    if pending:                                    # page de série : on retire le numéro
        m = {}
        for t in pending:
            base = re.sub(r'\s+\d+$', '', t)
            if base != t:
                m.setdefault(base, t)
        if m:
            take(m, "page de série")
    if pending:
        m = {}
        for t in pending:
            base = re.sub(r'\s+\d+$', '', t)
            if base != t:
                m.setdefault(f"Star Wars: {base}", t)
        if m:
            take(m, "série + préfixe")
    for suffix in (" (novel)", " (comic)", " (short story)", " (audio drama)"):
        if not pending:
            break
        take({t + suffix: t for t in pending}, f"désambiguïsation{suffix}")
    if pending:                                    # dernier recours : recherche
        m = {}
        for t in pending[:250]:
            for hit in en_search(t):
                if difflib.SequenceMatcher(None, norm(t), norm(hit)).ratio() >= 0.72:
                    m.setdefault(hit, t)
                    break
        if m:
            take(m, "recherche")
    log("Résolution: " + " · ".join(f"{k}: {v}" for k, v in stats.items())
        + (f" · introuvable: {len(pending)}" if pending else ""))
    return found


def fetch_wikitext(titles):
    """{titre demandé: début du wikitexte} — pour lire l'infobox."""
    out = {}
    for part in batch(titles, 25):
        try:
            r = requests.get(EN_API, timeout=60, headers=UA, params={
                "action": "query", "prop": "revisions", "rvprop": "content",
                "rvslots": "main", "redirects": 1, "format": "json",
                "formatversion": 2, "titles": "|".join(part)})
            r.raise_for_status()
            q = r.json().get("query", {})
            alias = {}
            for n in q.get("normalized", []) + q.get("redirects", []):
                alias[n["from"]] = n["to"]
            pages = {}
            for p in q.get("pages", []):
                if p.get("missing") or not p.get("title"):
                    continue
                revs = p.get("revisions") or []
                txt = ((revs[0].get("slots", {}).get("main", {}) or {}).get("content", "")
                       if revs else "")
                pages[p["title"]] = txt[:3000]
            for t in part:
                key = t
                for _ in range(4):
                    key = alias.get(key, key)
                if key in pages:
                    out[t] = pages[key]
        except Exception as e:
            log(f"Infobox   : lot ignoré — {str(e)[:80]}")
    return out


def classify_from_text(txt, cats):
    """Type déduit de l'infobox quand les catégories ne disent rien."""
    t = (txt or "")
    low = t.lower()
    blob = " | ".join(cats).lower()
    if re.search(r'\{\{\s*(audio|radio)\b', low) or 'audio drama' in blob:
        return "audio"
    if re.search(r'\{\{\s*comic', low) or re.search(r'\|\s*(penciller|inker|colorist|letterer)\s*=', low):
        return "comic"
    if re.search(r'\{\{\s*(book|novel)', low) or re.search(r'\|\s*isbn\s*=', low):
        if re.search(r'junior|young[- ]reader|chapter book', blob):
            return "jeunesse"
        if re.search(r'young[- ]adult', blob):
            return "jeunesse"
        return "roman"
    if re.search(r'\{\{\s*short story', low):
        return "comic" if re.search(r'\b\d+ stories\b', blob) else "nouvelle"
    return ""


def fallback_kind(title, span):
    """Dernier recours : structure du titre, puis série connue."""
    key = re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]+', ' ', title.lower())).strip()
    if key in TITLE_KIND:
        return TITLE_KIND[key]
    if span or re.search(r'\(20\d\d\)', title):     # numéro de fascicule ou année de série
        return "comic"
    for prefix, kind in SERIES_KIND.items():
        if key.startswith(prefix):
            return kind
    return ""


def classify(cats, title):
    """Type de média déduit des catégories de l'article (jamais deviné)."""
    blob = " | ".join(cats).lower()
    if re.search(r'audio ?(drama|book)|radio', blob):
        return "audio"
    if re.search(r'junior novel|young[- ]reader|chapter book|early reader', blob):
        return "jeunesse"
    if re.search(r'young[- ]adult', blob):
        return "jeunesse"
    if re.search(r'comic|graphic novel|manga|trade paperback|one[- ]shot', blob):
        return "comic"
    if re.search(r'\b\d+ stories\b', blob):        # récit publié dans un comic anthologie
        return "comic"
    if re.search(r'\bnovels?\b|novella', blob):
        return "roman"
    if re.search(r'short stor|antholog', blob):
        return "nouvelle"
    if re.search(r'reference book|guide', blob):
        return "guide"
    return ""


# ───────────────────────────────────────────────── 3. TITRES FRANÇAIS
NON_LATIN = re.compile(r"[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff]")
FR_PUB = re.compile(r'\b(Panini|Delcourt|Pocket|Nathan|Hachette|Bragelonne|Fleuve|'
                    r'Milan|Glénat|Huginn|Le Masque|Éditions?)\b', re.I)


def norm(t):
    t = (t or "").lower()
    t = re.sub(r'\((roman|comics?|bd|nouvelle|jeu|film|s[ée]rie)[^)]*\)', ' ', t)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', t)).strip()


def fetch_fr(titles):
    """{titre EN: (titre FR, publié en français ?)} via la Wookieepedia francophone."""
    out = {}
    for part in batch(titles, 40):
        try:
            r = requests.get(FR_API, timeout=60, headers=UA, params={
                "action": "query", "prop": "revisions", "rvprop": "content",
                "rvslots": "main", "redirects": 1, "format": "json",
                "formatversion": 2, "titles": "|".join(part)})
            r.raise_for_status()
            j = r.json().get("query", {})
            norm_map = {n["from"]: n["to"] for n in j.get("normalized", [])}
            norm_map.update({n["from"]: n["to"] for n in j.get("redirects", [])})
            pages = {}
            for p in j.get("pages", []):
                if p.get("missing") or not p.get("title"):
                    continue
                revs = p.get("revisions") or []
                txt = ((revs[0].get("slots", {}).get("main", {}) or {}).get("content", "")
                       if revs else "")
                pages[p["title"]] = txt
            for t in part:
                key = norm_map.get(t, t)
                if key in pages:
                    out[t] = (key, bool(FR_PUB.search(pages[key][:4000])))
        except Exception as e:
            log(f"Titres FR : lot ignoré — {str(e)[:90]}")
    return out


def fr_search(title):
    """Recherche sur le wiki FR quand le titre anglais n'existe pas tel quel."""
    try:
        r = requests.get(FR_API, timeout=30, headers=UA, params={
            "action": "query", "list": "search", "srsearch": f'"{title}"',
            "srlimit": 3, "format": "json", "formatversion": 2})
        r.raise_for_status()
        return [h["title"] for h in r.json().get("query", {}).get("search", [])]
    except Exception:
        return []


def keep_fr(en_title, fr_title):
    if not fr_title or NON_LATIN.search(fr_title):
        return ""
    if norm(fr_title) == norm(en_title):
        return ""
    return re.sub(r'\s*\((roman|comics?|bd|nouvelle|livre)[^)]*\)\s*$', '', fr_title).strip()


def _norm_ep(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', (t or '').lower())).strip()


def tmdb_show_id(name, year):
    r = requests.get(f"{TMDB}/search/tv", timeout=30, headers=UA,
                     params={"api_key": TMDB_KEY, "query": name, "language": "en-US"})
    r.raise_for_status()
    best = None
    for it in r.json().get("results", []):
        y = (it.get("first_air_date") or "")[:4]
        if y == str(year):
            return it["id"]
        best = best or it.get("id")
    return best


def tmdb_episode_index(show_id):
    """{nom normalisé EN: (saison, épisode, nom EN, nom FR)}"""
    out, byse = {}, {}
    r = requests.get(f"{TMDB}/tv/{show_id}", timeout=30, headers=UA,
                     params={"api_key": TMDB_KEY, "language": "en-US"})
    r.raise_for_status()
    seasons = [s["season_number"] for s in r.json().get("seasons", [])
               if s.get("season_number", 0) > 0]
    for lang in ("en-US", "fr-FR"):
        for sn in seasons:
            try:
                rr = requests.get(f"{TMDB}/tv/{show_id}/season/{sn}", timeout=30, headers=UA,
                                  params={"api_key": TMDB_KEY, "language": lang})
                rr.raise_for_status()
                for ep in rr.json().get("episodes", []):
                    key = (sn, ep.get("episode_number"))
                    slot = byse.setdefault(key, {})
                    slot["fr" if lang == "fr-FR" else "en"] = (ep.get("name") or "").strip()
            except Exception:
                pass
    for (sn, en_), names in byse.items():
        en_name = names.get("en", "")
        if en_name:
            out[_norm_ep(en_name)] = (sn, en_, en_name, names.get("fr", en_name))
    return out


EP_MARK = re.compile(r'^(?P<show>.+?)\s+EPISODES?\s+(?P<ep>.+)$', re.I)


def resolve_screen(entries, cache):
    """Complète chaque repère écran avec ses libellés FR et EN."""
    need = {}
    for e in entries:
        if not e["screen"]:
            continue
        raw = e["title"].strip()
        if raw in SCREEN:
            e["fr"], e["en"] = SCREEN[raw]
            continue
        m = EP_MARK.match(raw)
        if m:
            show = m.group("show").strip().upper().replace("REBELES", "REBELS")
            if show in SHOWS:
                need.setdefault(show, []).append((e, m.group("ep").strip()))
                continue
        e["fr"] = e["en"] = raw          # inconnu : on garde tel quel

    for show, items in need.items():
        key = f"__eps__{show}"
        idx = cache.get(key)
        if idx is None and TMDB_KEY:
            try:
                sid = tmdb_show_id(*SHOWS[show])
                idx = {k: list(v) for k, v in tmdb_episode_index(sid).items()}
                cache[key] = idx
                log(f"TMDB      : {show} — {len(idx)} épisode(s) indexé(s)")
            except Exception as ex:
                log(f"TMDB      : {show} — {str(ex)[:80]}")
                idx = {}
        idx = idx or {}
        miss = []
        for e, epname in items:
            hit = idx.get(_norm_ep(epname))
            if not hit:
                close = difflib.get_close_matches(_norm_ep(epname), list(idx), 1, 0.86)
                hit = idx[close[0]] if close else None
            if hit and len(hit) == 4:
                sn, en_, name_en, name_fr = hit
                e["fr"] = f"{show} — S{sn}E{en_} · {name_fr.upper()}"
                e["en"] = f"{show} — S{sn}E{en_} · {name_en.upper()}"
            else:
                e["fr"] = e["en"] = f"{show} — {epname}"
                miss.append(epname)
            if not e.get("fr"):
                e["fr"] = e["en"] = raw
        if miss:
            log(f"Épisodes  : {show} — non résolu(s) : {', '.join(miss[:6])}")


# ───────────────────────────────────────────────── 4. PAGE
KIND = {
    "roman":    ("Roman",          "Novel",         "#a78bfa"),
    "jeunesse": ("Roman jeunesse", "Young readers", "#4ade80"),
    "comic":    ("Comic",          "Comic",         "#fb923c"),
    "audio":    ("Audio",          "Audio",         "#f472b6"),
    "nouvelle": ("Nouvelle",       "Short story",   "#94a3b8"),
    "guide":    ("Guide",          "Guide",         "#94a3b8"),
    "screen":   ("Écran",          "On screen",     "#64b5f6"),
    "":         ("À vérifier",     "Unverified",    "#6b7280"),
}
FILTERS = ["roman", "jeunesse", "comic", "audio"]


def slug(e):
    base = f'{e["date"]}|{e["title"]}'
    out = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')
    if len(out) > 58:                       # tronquer sans jamais créer de doublon
        import hashlib
        out = out[:58] + '-' + hashlib.md5(base.encode('utf-8')).hexdigest()[:6]
    return out


def build_page(data, lang="fr"):
    fr = lang == "fr"
    kinds = {k: (v[0] if fr else v[1]) for k, v in KIND.items()}
    colors = {k: v[2] for k, v in KIND.items()}
    rows, current_era = [], None
    for e in data:
        if e["era"] != current_era:
            current_era = e["era"]
            label = ERAS.get(current_era, (current_era, current_era))[0 if fr else 1]
            rows.append(f'<div class="era">{html.escape(label)}</div>')
        k = e["kind"] or ""
        if e["screen"]:
            title = (e.get("fr") or e["title"]) if fr else (e.get("en") or e["title"])
        else:
            title = (e["fr"] if (fr and e["fr"]) else e["title"])
        cls = "screen" if e["screen"] else "it"
        vo = ('<span class="vo" title="pas de version française connue">VO</span>'
              if (fr and not e["screen"] and e["frOk"] is False) else "")
        raw_note = e["note"]
        tn = NOTES.get(raw_note)
        shown_note = (tn[0] if fr else tn[1]) if tn else raw_note
        note = (f'<div class="note">{html.escape(shown_note)}</div>' if shown_note else "")
        ck = "" if e["screen"] else f'<span class="ck" data-id="{slug(e)}">✓</span>'
        rows.append(
            f'<div class="{cls}" data-k="{k}" style="--c:{colors.get(k, "#6b7280")}">'
            f'{ck}<span class="dt">{html.escape(e["date"])}</span>'
            f'<span class="tt">{html.escape(title)}{vo}</span>'
            f'<span class="kd">{html.escape(kinds.get(k, ""))}</span>{note}</div>')
    chips = "".join(
        f'<button class="chip on" data-f="{k}" style="--c:{KIND[k][2]}">'
        f'{KIND[k][0] if fr else KIND[k][1]}</button>' for k in FILTERS)
    return chips, "\n".join(rows)


TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title}</title>
<meta name="description" content="{desc}"/>
<link rel="alternate" hreflang="fr" href="https://chronologeek.app/fr/dossiers/star-wars"/>
<link rel="alternate" hreflang="en" href="https://chronologeek.app/deep-dives/star-wars"/>
<link rel="alternate" hreflang="x-default" href="https://chronologeek.app/deep-dives/star-wars"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Chronologeek"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{desc}"/>
<meta property="og:image" content="https://chronologeek.app/images/starwars-banner.webp"/>
<meta property="og:url" content="{canon}"/>
<meta name="twitter:card" content="summary_large_image"/>
{siteStyles}
<style>
.wrap{{max-width:1000px;margin:0 auto;padding:2rem 1.2rem 4rem}}
h1{{font-size:1.7rem;font-weight:900;letter-spacing:-.5px;background:linear-gradient(135deg,#4d9fff,#7c6af7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.sub{{color:var(--muted2);font-size:.86rem;margin:.5rem 0 1.5rem;line-height:1.65}}
.h1sub{{display:block;font-size:.92rem;font-weight:600;letter-spacing:.02em;-webkit-text-fill-color:var(--muted);margin-top:.15rem}}
.chips{{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.6rem}}
.chip{{font:inherit;font-size:.78rem;font-weight:700;padding:.42rem .9rem;border-radius:20px;cursor:pointer;
      background:transparent;border:1px solid var(--border);color:var(--muted);transition:all .18s}}
.chip.on{{background:color-mix(in srgb,var(--c) 16%,transparent);border-color:var(--c);color:var(--c)}}
.chip:hover{{border-color:var(--c)}}
.count{{color:var(--muted);font-size:.75rem}}
.prog{{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin:.9rem 0 1.7rem;
      padding:.7rem .9rem;border:1px solid var(--border);border-radius:10px;background:var(--surface)}}
.pbar{{flex:1;min-width:140px;height:7px;border-radius:6px;background:var(--border);overflow:hidden}}
.pbar i{{display:block;height:100%;width:0;background:linear-gradient(90deg,#7c6af7,#f06292);transition:width .3s}}
.pnum{{font-size:.76rem;color:var(--muted2);font-variant-numeric:tabular-nums;white-space:nowrap}}
.preset{{font:inherit;font-size:.7rem;padding:.3rem .7rem;border-radius:14px;cursor:pointer;
        background:transparent;border:1px solid var(--border2);color:var(--muted)}}
.preset:hover{{border-color:#f06292;color:#f06292}}
.ck{{width:18px;height:18px;flex-shrink:0;border:2px solid #7e7ea8;box-shadow:0 0 0 1px rgba(126,126,168,.25);
    border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:.7rem;color:transparent;transition:all .18s;align-self:center}}
.ck:hover{{border-color:var(--accent)}}
.it.read .ck{{background:var(--accent);border-color:var(--accent);color:#fff}}
.it.read .tt{{opacity:.5;text-decoration:line-through}}
.era{{font-size:.78rem;font-weight:800;letter-spacing:.12em;color:var(--muted);
     border-bottom:1px solid var(--border);padding:1.8rem 0 .5rem;margin-bottom:.7rem}}
.it,.screen{{display:grid;grid-template-columns:22px 104px 1fr auto;gap:.3rem .8rem;align-items:baseline;
     padding:.5rem .8rem;border-left:3px solid var(--c);border-radius:7px;margin-bottom:.3rem;background:var(--surface)}}
.screen{{background:transparent;border-left-style:dashed;opacity:.62}}
.screen .tt{{font-weight:800;letter-spacing:.04em;font-size:.78rem;color:#9fd0ff}}
.dt{{color:var(--muted);font-size:.75rem;font-variant-numeric:tabular-nums;white-space:nowrap}}
.tt{{font-size:.9rem;line-height:1.35}}
.kd{{font-size:.68rem;color:var(--c);font-weight:700;white-space:nowrap}}
.note{{grid-column:3/-1;color:var(--muted);font-size:.72rem;font-style:italic;margin-top:.1rem}}
.vo{{font-size:.58rem;font-weight:800;letter-spacing:.06em;padding:.05rem .32rem;border-radius:4px;
    background:rgba(148,163,184,.16);color:#94a3b8;margin-left:.4rem;vertical-align:2px}}
.hide{{display:none}}
@media(max-width:640px){{
  .it{{grid-template-columns:22px 1fr auto}}
  .screen{{grid-template-columns:1fr auto}}
  .it .dt{{grid-column:2/-1}}
  .note{{grid-column:1/-1}}
}}
</style>
</head>
<body>
{nav}
{mmenu}
<div class="wrap">
<h1>{h1}</h1>
<p class="sub">{intro}</p>
<div class="chips">{chips}</div>
<div class="prog">
  <span class="pnum" id="pnum"></span>
  <div class="pbar"><i id="pfill"></i></div>
  <button class="preset" id="preset">{reset}</button>
</div>
<div class="count" id="count"></div>
{rows}
</div>
{scripts}
<script>
(function(){{
  var KEY='cg_dossier_starwars';
  var done={{}};
  try{{ done=JSON.parse(localStorage.getItem(KEY)||'{{}}')||{{}}; }}catch(e){{ done={{}}; }}
  function save(){{ try{{ localStorage.setItem(KEY,JSON.stringify(done)); }}catch(e){{}} }}

  var items=[].slice.call(document.querySelectorAll('.it'));
  var chips=[].slice.call(document.querySelectorAll('.chip'));
  var pnum=document.getElementById('pnum');
  var pfill=document.getElementById('pfill');

  function refresh(){{
    var off={{}};
    chips.forEach(function(c){{ if(!c.classList.contains('on')) off[c.dataset.f]=1; }});
    var shown=0, read=0;
    items.forEach(function(el){{
      var hide=!!off[el.dataset.k];
      el.classList.toggle('hide',hide);
      if(!hide){{
        shown++;
        if(done[el.querySelector('.ck').dataset.id]) read++;
      }}
    }});
    document.getElementById('count').textContent='{cnt}'.replace('%s',shown).replace('%t',items.length);
    pnum.textContent='{pn}'.replace('%r',read).replace('%s',shown);
    pfill.style.width=(shown?Math.round(read/shown*100):0)+'%';
  }}

  items.forEach(function(el){{
    var ck=el.querySelector('.ck');
    if(done[ck.dataset.id]) el.classList.add('read');
    ck.addEventListener('click',function(ev){{
      ev.stopPropagation();
      var id=ck.dataset.id;
      if(done[id]){{ delete done[id]; el.classList.remove('read'); }}
      else {{ done[id]=1; el.classList.add('read'); }}
      save(); refresh();
    }});
  }});

  chips.forEach(function(c){{ c.addEventListener('click',function(){{ c.classList.toggle('on'); refresh(); }}); }});
  document.getElementById('preset').addEventListener('click',function(){{
    if(!confirm('{conf}')) return;
    done={{}}; save();
    items.forEach(function(el){{ el.classList.remove('read'); }});
    refresh();
  }});
  refresh();
}})();
</script>
</body>
</html>
"""


SHELL_SRC = {"fr": "fr/index.html", "en": "index.html"}
DOSS_HREF = {"fr": "/fr/dossiers/", "en": "/deep-dives/"}


def site_shell(lang, alt_href):
    """Reprend l'ossature du site (styles, nav, menu mobile) depuis une page existante."""
    try:
        src = open(SHELL_SRC[lang], encoding='utf-8').read()
    except Exception as e:
        log(f"Coquille  : {SHELL_SRC[lang]} illisible ({e}) — page autonome")
        return None

    styles = "\n".join(f"<style>{m}</style>"
                       for m in re.findall(r'<style>(.*?)</style>', src, re.S))
    nav_m = re.search(r'<nav.*?</nav>', src, re.S)
    mm_m = re.search(r'<div id="mmenu".*?</div>', src, re.S)
    if not nav_m or not mm_m:
        log("Coquille  : nav introuvable — page autonome")
        return None
    nav, mmenu = nav_m.group(0), mm_m.group(0)

    # la page courante n'est plus « Nouveautés » mais « Dossiers »
    nav = re.sub(r'\s*style="color:var\(--text\);font-weight:700"', '', nav)
    mmenu = mmenu.replace('class="cur news"', 'class="news"')
    href = DOSS_HREF[lang]
    nav = nav.replace('<a href="#" class="doss">',
                      f'<a href="{href}" class="doss" style="color:var(--text);font-weight:700">')
    mmenu = mmenu.replace('<a href="#" class="doss">', f'<a href="{href}" class="cur doss">')
    # bouton de langue vers la page équivalente
    nav = re.sub(r'(<a class="lang-btn" href=")[^"]*(")',
                 lambda m: m.group(1) + alt_href + m.group(2), nav)

    scripts = ('<script src="/pwa.js"></script>\n'
               '<script data-goatcounter="https://arcanerval.goatcounter.com/count"\n'
               '        async src="//gc.zgo.at/count.js"></script>')
    return {"styles": styles, "nav": nav, "mmenu": mmenu, "scripts": scripts}


OUT_FR = "fr/dossiers/star-wars.html"
OUT_EN = "deep-dives/star-wars.html"
IDX_FR = "fr/dossiers/index.html"
IDX_EN = "deep-dives/index.html"

DOSSIERS = [
    {"slug": "star-wars", "fr": "Star Wars", "en": "Star Wars", "color": "#4d9fff",
     "img": "/images/starwarscomics.jpg",
     "dfr": "Romans · Romans jeunesse · Comics — l'ordre de lecture complet du canon, "
            "replacé entre les films et les séries.",
     "den": "Novels · Young readers · Comics — the complete canon reading order, "
            "placed between the movies and shows.",
     "tfr": "Disponible", "ten": "Available", "ready": True},
]

INDEX_TPL = """<!DOCTYPE html>
<html lang="{lang}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title}</title><meta name="description" content="{desc}"/>
<link rel="alternate" hreflang="fr" href="https://chronologeek.app/fr/dossiers/"/>
<link rel="alternate" hreflang="en" href="https://chronologeek.app/deep-dives/"/>
<meta property="og:title" content="{title}"/><meta property="og:description" content="{desc}"/>
<meta property="og:image" content="https://chronologeek.app/images/og-banner.png"/>
{siteStyles}
<style>
.dwrap{{max-width:1180px;margin:0 auto;padding:2.6rem 1.2rem 4.5rem;text-align:center}}
.dtitle{{font-size:2rem;font-weight:900;letter-spacing:-.6px;background:linear-gradient(135deg,#7c6af7,#f06292);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.dsub{{color:var(--muted2);font-size:.95rem;margin:.6rem auto 2.6rem;max-width:60ch;line-height:1.65}}
.soon{{opacity:.4;pointer-events:none}}
</style></head>
<body>{nav}{mmenu}
<div class="dwrap">
<div class="dtitle">{h1}</div>
<p class="dsub">{intro}</p>
<div class="ugrid">{cards}</div>
</div>
{scripts}</body></html>
"""


def build_index(lang):
    fr = lang == "fr"
    sh = site_shell(lang, "/deep-dives/" if fr else "/fr/dossiers/") or {
        "styles": "", "nav": "", "mmenu": "", "scripts": ""}
    cards = []
    for d in DOSSIERS:
        href = (f"/fr/dossiers/{d['slug']}" if fr else f"/deep-dives/{d['slug']}")
        cards.append(
            f'<a class="ucard{"" if d.get("ready") else " soon"}" href="{href}">'
            f'<div class="cbanner"><img src="{d["img"]}" alt="{d["en"]}" '
            f'onerror="this.style.display=\'none\'"/></div>'
            f'<div class="cbody">'
            f'<div class="ctitle" style="color:{d["color"]}">{d["fr"] if fr else d["en"]}</div>'
            f'<div class="csub">{d["dfr"] if fr else d["den"]}</div>'
            f'<div class="ctag-row"><span class="ctag tag-live">'
            f'{d["tfr"] if fr else d["ten"]}</span></div>'
            f'</div></a>')
    return INDEX_TPL.format(
        lang=lang,
        title=("Dossiers — Chronologeek" if fr else "Deep Dives — Chronologeek"),
        desc=("Les dossiers Chronologeek : ordres de lecture, guides et analyses par univers."
              if fr else "Chronologeek deep dives: reading orders, guides and breakdowns, universe by universe."),
        h1=("Dossiers" if fr else "Deep Dives"),
        intro=("Les guides qui vont plus loin que la timeline : ordres de lecture, "
               "analyses et parcours thématiques, univers par univers."
               if fr else "The guides that go further than the timeline: reading orders, "
                          "breakdowns and themed paths, universe by universe."),
        cards="".join(cards),
        siteStyles=sh["styles"], nav=sh["nav"], mmenu=sh["mmenu"], scripts=sh["scripts"])


def main():
    data = parse(SOURCE)
    books = [e for e in data if not e["screen"]]
    log(f"Source    : {len(data)} lignes · {len(books)} œuvres · "
        f"{len(data)-len(books)} repères écran")

    CACHE_VERSION = 3
    cache = {}
    if os.path.exists(CACHE):
        try:
            cache = json.load(open(CACHE, encoding='utf-8'))
        except Exception:
            cache = {}
    if cache.get("__version__") != CACHE_VERSION:
        keep = {k: v for k, v in cache.items() if k.startswith("__eps__")}
        if cache:
            log(f"Cache     : version {cache.get('__version__', 1)} → {CACHE_VERSION}, "
                f"catégories réinterrogées ({len(keep)} index TMDB conservé(s))")
        cache = keep
        cache["__version__"] = CACHE_VERSION

    todo = sorted({e["wiki"] for e in books
                   if e["wiki"] and e["wiki"] not in cache})
    log(f"Wookiee   : {len(todo)} titre(s) à interroger ({len(cache)} en cache)")

    if todo:
        resolved = resolve_categories(todo)
        cats = {t: v[1] for t, v in resolved.items()}
        frs = fetch_fr(todo)
        missing_fr = [t for t in todo if t not in frs]
        found = {}
        for t in missing_fr[:200]:
            for hit in fr_search(t):
                if difflib.SequenceMatcher(None, norm(t), norm(hit)).ratio() >= 0.7:
                    found[t] = hit
                    break
        if found:
            extra = fetch_fr(list(found.values()))
            for en, hit in found.items():
                if hit in extra:
                    frs[en] = extra[hit]
        blind = [t for t in todo if not classify(cats.get(t, []), t)]
        texts = fetch_wikitext(blind) if blind else {}
        if blind:
            log(f"Infobox   : {len(texts)}/{len(blind)} article(s) relu(s) pour le type")
        for t in todo:
            cache[t] = {"cats": cats.get(t, []),
                        "byText": classify_from_text(texts.get(t, ""), cats.get(t, [])),
                        "fr": frs.get(t, ("", None))[0],
                        "frOk": frs.get(t, ("", None))[1]}
        json.dump(cache, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    stats, unknown = {}, []
    for e in books:
        _k = re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]+', ' ', e["title"].lower())).strip()
        c = cache.get(e["wiki"], {})
        e["kind"] = TITLE_KIND.get(_k) or (classify(c.get("cats", []), e["title"])
                     or c.get("byText", "")
                     or fallback_kind(e["title"], e["span"]))
        e["kind"] = e["kind"] or ""
        e["fr"] = keep_fr(e["title"], c.get("fr", ""))
        e["frOk"] = c.get("frOk")
        stats[e["kind"] or "?"] = stats.get(e["kind"] or "?", 0) + 1
        if not e["kind"]:
            unknown.append(e["title"])
    log("Types     : " + " · ".join(f"{KIND.get(k, ('?',))[0]}: {v}"
                                    for k, v in sorted(stats.items(), key=lambda x: -x[1])))
    log(f"Titres FR : {sum(1 for e in books if e['fr'])} traduit(s) · "
        f"{sum(1 for e in books if e['frOk'] is False)} sans VF connue")
    if unknown:
        log(f"À vérifier: {len(unknown)} — " + "; ".join(unknown[:8])
            + ("…" if len(unknown) > 8 else ""))

    resolve_screen(data, cache)
    json.dump(cache, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    ALT = {"fr": "/deep-dives/star-wars", "en": "/fr/dossiers/star-wars"}
    CANON = {"fr": "https://chronologeek.app/fr/dossiers/star-wars",
             "en": "https://chronologeek.app/deep-dives/star-wars"}
    for lang, out, title, desc, h1, intro in (
        ("fr", OUT_FR,
         "Dossier Star Wars : romans &amp; comics — l'ordre de lecture | Chronologeek",
         "L'ordre de lecture complet des romans, romans jeunesse et comics Star Wars canon, "
         "replacé dans la chronologie des films et séries.",
         "Dossier Star Wars<span class=\'h1sub\'>Romans &amp; Comics</span>", INTRO_FR),
        ("en", OUT_EN,
         "Star Wars Deep Dive: novels &amp; comics reading order | Chronologeek",
         "The complete reading order for canon Star Wars novels, young-reader books and comics, "
         "placed within the movie and show chronology.",
         "Star Wars Deep Dive<span class=\'h1sub\'>Novels &amp; Comics</span>", INTRO_EN)):
        chips, rows = build_page(data, lang)
        sh = site_shell(lang, ALT[lang]) or {"styles": "", "nav": "", "mmenu": "", "scripts": ""}
        page = TEMPLATE.format(
            lang=lang, title=title, desc=desc, h1=h1, intro=intro, chips=chips, rows=rows,
            siteStyles=sh["styles"], nav=sh["nav"], mmenu=sh["mmenu"],
            scripts=sh["scripts"], canon=CANON[lang],
            cnt=("%s œuvres affichées sur %t" if lang == "fr" else "%s of %t entries shown"),
            reset=("Réinitialiser" if lang == "fr" else "Reset"),
            pn=("%r lu(s) sur %s" if lang == "fr" else "%r of %s read"),
            conf=("Réinitialiser ta progression ?" if lang == "fr"
                  else "Reset your progress?"))
        d = os.path.dirname(out)
        if d and os.path.isfile(d):
            os.remove(d)
            log(f"Nettoyage : fichier parasite « {d} » supprimé")
        if d:
            os.makedirs(d, exist_ok=True)
        open(out, 'w', encoding='utf-8').write(page)
        log(f"Page      : {out} généré")

    for lang, out in (("fr", IDX_FR), ("en", IDX_EN)):
        d = os.path.dirname(out)
        if d and os.path.isfile(d):
            os.remove(d)
            log(f"Nettoyage : fichier parasite « {d} » supprimé")
        if d:
            os.makedirs(d, exist_ok=True)
        open(out, 'w', encoding='utf-8').write(build_index(lang))
    log("Index     : pages Dossiers / Deep Dives générées")
    json.dump(data, open('dossier-data.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


if __name__ == "__main__":
    import traceback, sys
    try:
        main()
    except Exception:
        print("\n" + "=" * 60)
        print("ÉCHEC — trace complète :")
        traceback.print_exc()
        print("=" * 60)
        try:
            open("dossier-erreur.txt", "w", encoding="utf-8").write(
                "\n".join(report) + "\n\n" + traceback.format_exc())
        except Exception:
            pass
        sys.exit(1)
