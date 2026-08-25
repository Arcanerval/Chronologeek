#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chronologeek — Radar des sorties
Agrège les sorties à venir (Star Wars, Marvel, DC, Avatar, Star Trek,
The Walking Dead, Assassin's Creed) depuis
plusieurs sources, croise avec les timelines déjà en ligne, et génère
radar.html.

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
# De combien la première sortie mondiale peut précéder la sortie US ou FR.
# Six semaines couvrent les avant-premières et les marchés qui ouvrent en
# avance ; au-delà, la sortie américaine n'est plus « à venir » pour personne.
FILM_LOOKBACK = datetime.timedelta(days=45)
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
    "startrek": {"label": "Star Trek",     "color": "#b48cf2", "file": "startrek.html"},
    "twd":      {"label": "The Walking Dead", "color": "#a8bf4f", "file": "walkingdead.html"},
    "assassinscreed": {"label": "Assassin's Creed", "color": "#c0202f",
                       "file": "assassinscreed.html"},
}

# Sociétés recherchées par nom sur TMDB (les IDs sont résolus automatiquement)
TMDB_COMPANY_NAMES = {
    "starwars": ["Lucasfilm"],
    "marvel":   ["Marvel Studios", "Marvel Television", "Marvel Entertainment"],
    "dc":       ["DC Studios", "DC Films", "DC Entertainment", "DC Comics"],
    "avatar":   ["Avatar Studios", "Nickelodeon Animation Studio"],
    # AMC Studios produit toute la franchise, Skybound est la maison de Robert
    # Kirkman : ni l'une ni l'autre ne designe l'univers a elle seule, d'ou le
    # garde-fou de titre ci-dessous.
    "twd":      ["AMC Studios", "AMC Networks", "Skybound Entertainment"],
    # Ubisoft Film & Television porte les trois series Netflix ; « Ubisoft »
    # tout court ramene en plus les studios de jeux, qui produisent Rayman,
    # Splinter Cell, Far Cry et Mythic Quest. D'ou le garde-fou de titre
    # ci-dessous, comme pour Avatar et The Walking Dead.
    "assassinscreed": ["Ubisoft Film & Television", "Ubisoft"],
}

# Quand la société couvre plus large que l'univers, le titre doit encore
# répondre à ce motif. **Nickelodeon Animation Studio produit tout le catalogue
# de la chaîne**, et « Avatar Studios » seul ne suffit pas : c'est Nickelodeon
# qui porte Seven Havens. Tant que le radar ne demandait que les séries dont la
# première est à venir, ça ne se voyait pas — il y en a peu. La lecture des
# épisodes interroge `air_date`, donc toutes celles qui diffusent, et
# SpongeBob SquarePants, The Patrick Star Show et Rock, Paper, Scissors sont
# arrivés au radar Avatar : douze épisodes le 13 août 2026.
#
# Lucasfilm, Marvel Studios et DC Studios ne désignent qu'un univers : eux
# n'ont pas besoin de garde-fou. C'est la même idée que `ST_TITRE`, que Star
# Trek applique à sa recherche par titre pour la même raison.
UNIVERS_TITRE = {
    "avatar": re.compile(r"\b(avatar|korra|aang|airbender)\b", re.I),
    # AMC Studios et AMC Networks portent Mad Men, Breaking Bad, Interview with
    # the Vampire et le reste du catalogue de la chaine : sans ce motif, la
    # lecture des episodes ramene toute la grille AMC au radar The Walking Dead.
    # Les quinze oeuvres de la timeline disent toutes « Walking Dead » —
    # « Fear the… », « Tales of the… », « The Walking Dead: Dead City ».
    "twd": re.compile(r"\bwalking dead\b", re.I),
    # Ubisoft produit tout son catalogue : sans ce motif, Rayman Minis,
    # Splinter Cell: Deathwatch, Side Quest et Mythic Quest arrivent au radar
    # Assassin's Creed. L'apostrophe est facultative — TMDB ecrit les deux.
    "assassinscreed": re.compile(r"\bassassin.?s creed\b", re.I),
}


def hors_univers(uni, titre):
    """Un titre que la société a rapporté mais que l'univers ne reconnaît pas."""
    motif = UNIVERS_TITRE.get(uni)
    return bool(motif) and not motif.search(titre or "")

# Exclusions : jamais canon ou hors périmètre. Motifs testés sur "titre + type".
EXCLUDE = {
    # « A Novel Based on the Animated Film » est une novélisation qui ne dit pas
    # son nom : le motif noveli[sz]ation ne l'attrape pas. Même chose pour les
    # livres dérivés qui mettent le film entre parenthèses après leur titre
    # (« Meet Team Avatar (Avatar Aang: The Last Airbender) ») : le film cité
    # ainsi n'est jamais l'œuvre elle-même, c'est toujours un produit dérivé.
    # Les « Junior Novel » sont des romans pour enfants, hors périmètre. La
    # littérature young adult reste, elle : seules ses novélisations sautent,
    # attrapées par les motifs ci-dessus. Ne pas mordre sur les « Graphic
    # Novel », qui restent aussi.
    "avatar":   [r"noveli[sz]ation", r"a novel based on",
                 r"\(avatar aang: the last airbender\)",
                 r"junior novel"],
    # Visions Presents – The Ninth Jedi n'est pas canon. « The Book of Boba
    # Fett 1 » et les suivants ne sont pas non plus des sorties : c'est le
    # comic qui adapte la série, chapitre par chapitre, et la série est déjà
    # au guide. Le chiffre du numéro suffit à les distinguer — la série,
    # elle, n'en porte pas.
    "starwars": [r"\blego\b", r"noveli[sz]ation", r"the ninth jedi",
                 r"\bthe book of boba fett \d"],
    # « Spidey and the Avengers: Halloween Team-Up! » est un special de
    # « Spidey and His Amazing Friends », l'animation prescolaire de Disney
    # Junior : hors du perimetre du guide, qui suit le MCU. Meme regle que
    # Teen Titans Go! et My Adventures with Superman cote DC. Le motif porte
    # sur « spidey », qui ne designe que cette serie — le guide ecrit
    # « Spider-Man » partout ailleurs.
    "marvel":   [r"\blego\b", r"\bspidey\b"],
    # Batman: Knightfall est un film d'animation du Tomorrowverse, hors du
    # périmètre du guide : la timeline DC suit les Elseworlds, l'Arrowverse,
    # le DCEU et le DCU, pas les longs métrages animés. Le motif attrape les
    # deux parties annoncées, et la saga comics du même nom, qui n'y est pas
    # davantage.
    #
    # Teen Titans Go! et My Adventures with Superman relèvent de la même règle,
    # et sont arrivés le 13 août 2026 par la lecture des épisodes : DC Studios
    # produit l'animation télé aussi, et interroger `air_date` la fait remonter
    # là où la seule date de première ne la montrait pas. Ni l'une ni l'autre
    # n'est au guide.
    "dc":       [r"\blego\b", r"\bknightfall\b",
                 r"\bteen titans go\b", r"\bmy adventures with superman\b"],
    # Le guide Star Trek ne couvre que l'Alpha Canon — films et séries. Niko
    # l'écrit noir sur blanc dans « What's left out, and why ? » : romans,
    # comics et jeux vidéo sont du Beta Canon et restent dehors. TMDB ne
    # connaît ni romans ni comics, mais il range les captations de convention
    # et les making-of parmi les films ; ces motifs restent le garde-fou.
    "startrek": [r"\blego\b", r"\bidw\b", r"blu-ray", r"\bdvd\b",
                 r"\bissue \d", r"noveli[sz]ation"],
    # « Lanterns: The Official Podcast » n'est pas la série Lanterns : c'est
    # l'émission qui en parle, interviews de l'équipe à l'appui. TMDB la range
    # parmi les séries, et elle arrivait donc au radar à côté de la vraie.
    # Aucun des cinq guides ne suit de podcast — le motif vaut pour tous.
    "*":        [r"\bpodcast\b"],
}

# Avatar : seuls ces types de médias nous intéressent (le reste = goodies).
# Les films et les séries sont VOLONTAIREMENT absents : TMDB les fournit déjà,
# et l'Almanac les redonnait sous un autre libellé — d'où « Avatar: Seven
# Havens » en double, une fois par source. L'Almanac ne sert plus que pour
# l'écrit, que TMDB ne couvre pas.
AVATAR_KEEP = ("comic", "graphic novel", "comic story", "novel")
AVATAR_DROP = ("video game", "ttrpg", "coloring", "colouring", "color-by",
               "activity", "artbook", "scrapbook", "amigurumi", "pop-up",
               "audio drama", "website", "encyclopedia", "dictionary",
               "handbook", "miscellaneous", "tonie")

results = []      # {universe, title, date_txt, date_sort, kind, source}
report  = []      # lignes de diagnostic
excluded = []     # entrées filtrées par EXCLUDE


def log(msg):
    report.append(msg)
    print(msg)


# Corriger un type mal renseigné à la source (clé = titre en minuscules sans ponctuation)
KIND_OVERRIDE = {
    "hiding from the dark": "Roman jeunesse",   # roman middle grade, pas un jeu vidéo
}

# Titres à ne jamais traduire (le média sort sous son titre original en France).
# Mettre "" pour forcer le titre original, ou une chaîne pour imposer une VF précise.
TITLE_FR_OVERRIDE = {
    "man of tomorrow": "",
}
# Alphabets non latins : un « titre français » en japonais ou en russe est une erreur de source
_NON_LATIN = re.compile(r"[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0590-\u06ff]")


def fr_title_ok(en_title, fr_title):
    """Filtre les titres FR douteux avant de les publier."""
    ov = TITLE_FR_OVERRIDE.get(_norm_title(en_title))
    if ov is not None:
        return ov
    if not fr_title or _norm_title(fr_title) == _norm_title(en_title):
        return ""
    if _NON_LATIN.search(fr_title):
        return ""
    return fr_title


def tmdb_country_dates(base, movie_id):
    """Dates de sortie US et FR d'un film. TMDB ne donne dans /discover que la
    « primary release date », qui est la première au monde : un film sorti en
    France avant les États-Unis affichait donc la date française côté anglais,
    et inversement. On va chercher les sorties pays par pays.

    Types TMDB : 1 première, 2 sortie limitée, 3 sortie nationale, 4 numérique,
    5 physique, 6 TV. On prend la sortie en salle, puis le numérique à défaut.
    """
    out = {}
    try:
        r = requests.get(f"{base}/movie/{movie_id}/release_dates",
                         timeout=20, headers=UA, params={"api_key": TMDB_KEY})
        r.raise_for_status()
        for entry in r.json().get("results", []):
            pays = entry.get("iso_3166_1")
            if pays not in ("US", "FR"):
                continue
            best = None
            for prefere in (3, 2, 1, 4):
                for rd in entry.get("release_dates", []):
                    if rd.get("type") == prefere:
                        best = parse_iso((rd.get("release_date") or "")[:10])
                        if best:
                            break
                if best:
                    break
            if best:
                out[pays] = best
    except Exception:
        pass
    return out


def add(universe, title, date_sort, date_txt, kind, source, precision="day", era="", syn="", wiki="", syn_fr="", title_fr="", date_sort_fr="", date_txt_fr="", ep=None, poster="", tmdb=0, media=""):
    title = re.sub(r"\s+", " ", (title or "")).strip(" –-—:")
    if not title:
        return
    title_fr = fr_title_ok(title, title_fr)
    kind = KIND_OVERRIDE.get(_norm_title(title), kind)
    blob = f"{title} {kind or ''}"
    for pat in EXCLUDE.get(universe, []) + EXCLUDE.get("*", []):
        if re.search(pat, blob, re.I):
            excluded.append(f"{universe}: {title}")
            return
    entry = {
        "universe": universe, "title": title, "date_sort": date_sort,
        "date_txt": date_txt, "kind": kind or "", "source": source,
        "precision": precision, "era": era, "syn": syn, "wiki": wiki,
        "syn_fr": syn_fr, "kindKey": kind_key(kind), "title_fr": title_fr,
        # Date de sortie française quand elle diffère. Vide = mêmes dates,
        # l'affichage retombe alors sur date_sort / date_txt.
        "date_sort_fr": date_sort_fr, "date_txt_fr": date_txt_fr,
    }
    # Saison, numéro et repère d'un épisode. Absent partout ailleurs : une
    # clé posée à `null` sur les huit cents autres entrées n'apprendrait rien
    # à la page et pèserait dans radar.json.
    # Copié : `PREMIERE` est un gabarit partagé, et une carte ne doit jamais
    # tenir le repère d'une autre.
    if ep:
        entry["ep"] = dict(ep)
    # L'affiche TMDB, en chemin nu (`/8Vt6.jpg`) : la page compose l'URL avec
    # la taille qu'elle veut. Écrire l'URL entière ici la répéterait quarante
    # fois dans un fichier qui tient en 28 Ko. Absente comme `ep` quand il n'y
    # en a pas — Wookieepedia et l'Avatar Almanac n'en ont aucune, et une clé
    # vide sur la moitié des entrées ne dit rien de plus qu'une clé absente.
    if poster:
        entry["poster"] = poster
    # La fiche TMDB, pour que la carte ouverte aille chercher ce que le radar
    # n'a pas à stocker : la note, les genres, la bande-annonce, et le synopsis
    # de l'épisode. La page fait l'appel elle-même, exactement comme les six
    # pages d'univers le font depuis toujours — la note change avec le temps,
    # et la figer dans un fichier régénéré chaque jour n'aurait rien apporté.
    # `media` vaut « movie » ou « tv » : c'est le segment d'URL de l'API.
    # Absents comme `ep` et `poster` hors TMDB — Wookieepedia et l'Avatar
    # Almanac n'ont pas de fiche.
    if tmdb:
        entry["tmdb"] = tmdb
        entry["media"] = media
    results.append(entry)
    # Rendue à l'appelant : la carte d'une série neuve reçoit après coup le
    # repère de son propre premier épisode. Voir `tmdb_episodes`.
    return entry


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


# ─────────────────────────── Les épisodes des séries qui diffusent déjà
# Une série en cours n'est plus une « sortie » : sa première est passée, et
# /discover, qui filtre sur `first_air_date`, ne la voit donc plus. Ses
# épisodes, eux, sortent chaque semaine — et c'est ce qu'un radar doit dire.
#
# TMDB ne les donne pas dans /discover : il faut la fiche de la série pour
# savoir quelle saison diffuse (`next_episode_to_air`), puis la saison entière
# pour en avoir la grille sur plusieurs semaines au lieu du seul suivant. Une
# saison coûte deux requêtes, une par langue.


# La carte d'une série est celle de sa PREMIÈRE : les deux `/discover/tv` du
# radar filtrent sur `first_air_date`, qui est par définition le jour du premier
# épisode. Le repère est donc connu sans rien demander de plus, et il est posé
# d'emblée — TMDB n'a pas toujours la grille d'une série pas encore diffusée,
# et « Avatar: Seven Havens » comme « VisionQuest » s'annonçaient sans mention.
# `tmdb_episodes` l'affine ensuite quand la grille existe.
PREMIERE = {"s": 1, "e": 1, "mark": "premiere"}


def tmdb_series_qui_diffusent(base, joined, cle="with_companies"):
    """Les séries dont un épisode reste à venir : {id: nom}.

    `air_date` porte sur les épisodes là où `first_air_date` porte sur la
    série : c'est le seul filtre de /discover qui retrouve une série au
    milieu de sa saison.

    `cle` vaut `with_companies` pour les quatre univers qui se désignent par
    leur studio, et `with_keywords` pour Star Trek, que Paramount ne suffit
    pas à isoler."""
    out = {}
    for page in (1, 2, 3):
        try:
            r = requests.get(base + "/discover/tv", timeout=25, headers=UA, params={
                "api_key": TMDB_KEY, cle: joined,
                "air_date.gte": TODAY.isoformat(),
                "air_date.lte": HORIZON.isoformat(),
                "sort_by": "first_air_date.desc",
                "language": "en-US", "include_adult": "false", "page": page,
            })
            r.raise_for_status()
            j = r.json()
        except Exception as e:
            log(f"Épisodes  : séries en diffusion — {e}")
            return out
        for it in j.get("results", []):
            out[it.get("id")] = it.get("name") or it.get("original_name") or ""
        if page >= j.get("total_pages", 1):
            break
    return out


def tmdb_saison(base, serie_id, saison):
    """Les épisodes d'une saison : (liste anglaise, {numéro: fiche française}).

    Les deux appels sont la même requête à `language` près, et l'appariement
    se fait par numéro d'épisode — jamais par rang dans la liste."""
    def une(lang):
        r = requests.get(f"{base}/tv/{serie_id}/season/{saison}", timeout=25,
                         headers=UA, params={"api_key": TMDB_KEY, "language": lang})
        r.raise_for_status()
        return r.json()
    en = une("en-US")
    try:
        fr = {e.get("episode_number"): e for e in une("fr-FR").get("episodes", [])}
    except Exception:
        fr = {}
    return en.get("episodes") or [], fr


def tmdb_episodes(base, uni, serie_id, nom, sauf_le=None):
    """Ajoute au radar les prochains épisodes d'une série.

    Renvoie `(compte, repère du premier)` — le second n'est rempli que si
    `sauf_le` a écarté un épisode, et c'est celui de la carte de la série."""
    zero = (0, None)
    try:
        r = requests.get(f"{base}/tv/{serie_id}", timeout=25, headers=UA,
                         params={"api_key": TMDB_KEY, "language": "en-US"})
        r.raise_for_status()
        fiche = r.json()
    except Exception as e:
        log(f"Épisodes  : fiche de {nom} — {e}")
        return zero
    saison = (fiche.get("next_episode_to_air") or {}).get("season_number")
    if saison is None:                      # plus rien à diffuser
        return zero
    try:
        eps, fr = tmdb_saison(base, serie_id, saison)
    except Exception as e:
        log(f"Épisodes  : saison {saison} de {nom} — {e}")
        return zero
    if not eps:
        return zero
    # Le dernier numéro connu ne fait une finale que si la saison est
    # complète : TMDB n'en liste parfois qu'une partie, et un épisode du
    # milieu se retrouverait alors annoncé comme la fin de la saison.
    attendus = next((s.get("episode_count") for s in (fiche.get("seasons") or [])
                     if s.get("season_number") == saison), None)
    dernier = max(e.get("episode_number") or 0 for e in eps) \
        if (attendus is None or attendus == len(eps)) else 0

    def repere(num):
        return {"s": saison, "e": num,
                "mark": "premiere" if num == 1
                        else "finale" if dernier > 1 and num == dernier
                        else ""}

    # Une saison qui tombe d'un bloc n'est pas treize sorties : c'en est une.
    # *Avatar: Seven Havens* lâche ses treize épisodes le 09/10 — sans ce
    # regroupement, la journée du 09/10 comptait treize cartes au même nom,
    # que seul leur numéro distinguait. Le repère se met alors à `e:0`, que la
    # page lit comme « Saison entière » et écrit « S1 », sans numéro.
    #
    # La saison doit être COMPLÈTE pour qu'on l'annonce ainsi : TMDB n'en
    # liste parfois qu'une partie, et quatre épisodes du même jour sur treize
    # sont un lot, pas une saison. `attendus` fait foi quand la fiche le donne.
    fenetre = [(parse_iso(e.get("air_date") or ""), e) for e in eps]
    fenetre = [(d, e) for d, e in fenetre if d and TODAY <= d <= HORIZON]
    total = attendus if attendus is not None else len(eps)
    jours = {d for d, _ in fenetre}
    bloc = len(fenetre) > 1 and len(jours) == 1 and len(fenetre) == total
    if bloc:
        jour = next(iter(jours))
        entiere = {"s": saison, "e": 0, "mark": "saison"}
        # Le jour de la première, la carte de la série porte déjà la sortie :
        # on lui rend le repère et on n'ajoute rien.
        if sauf_le and jour == sauf_le:
            return 0, entiere
        f = fr.get(1) or {}
        e1 = fenetre[0][1]
        add(uni, nom, jour.isoformat(), jour.strftime("%d/%m/%Y"),
            "Épisode", "TMDB",
            syn=(e1.get("overview") or "").strip(),
            syn_fr=(f.get("overview") or "").strip(),
            ep=entiere, poster=fiche.get("poster_path") or "",
            tmdb=serie_id, media="tv")
        return 1, None

    n, premier = 0, None
    for e in eps:
        d = parse_iso(e.get("air_date") or "")
        if not d or d < TODAY or d > HORIZON:
            continue
        num = e.get("episode_number") or 0
        # La première d'une série neuve est déjà annoncée par la série
        # elle-même, le même jour et sous le même nom : deux cartes pour une
        # seule sortie. Mais son repère, lui, n'existe que là — sans quoi la
        # carte qui reste est la seule du radar à ne rien dire de son rang, et
        # « Lanterns » s'annonçait sans sa mention « Première ».
        if sauf_le and d == sauf_le:
            # Le plus PETIT numéro du jour, pas le dernier vu. Une saison
            # entière peut tomber d'un bloc — *Avatar: Seven Havens* lâche ses
            # treize épisodes le 09/10 — et la carte de la série annonçait
            # alors « Finale S1E13 » le jour de sa propre première.
            if premier is None or num < premier["e"]:
                premier = repere(num)
            continue
        f = fr.get(num) or {}
        # Le titre de la carte est celui de la SÉRIE, et rien d'autre : la
        # saison et le numéro sont dans `ep`, que la page écrit sous le nom.
        # Accrocher le titre de l'épisode au nom donnait deux cartes qui ne se
        # ressemblaient pas — l'anglais rendait « Teen Titans Go! — "Teen
        # Titans Go to the Repair Shop (1)" » là où le français, faute de titre
        # traduit chez TMDB, rendait « Teen Titans Go! — « Épisode 45 » ».
        # Le repère S9E45 s'écrit pareil des deux côtés, lui.
        add(uni, nom,
            d.isoformat(), d.strftime("%d/%m/%Y"), "Épisode", "TMDB",
            syn=(e.get("overview") or "").strip(),
            syn_fr=(f.get("overview") or "").strip(),
            ep=repere(num), poster=fiche.get("poster_path") or "",
            tmdb=serie_id, media="tv")
        n += 1
    return n, premier


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
        debuts = {}          # id TMDB -> date de première, pour les séries neuves
        for kind, path, datefield in (
            ("Film",  "/discover/movie", "primary_release_date"),
            ("Série", "/discover/tv",    "first_air_date"),
        ):
            # `primary_release_date` est la PREMIÈRE sortie au monde, pas la
            # sortie américaine ni la française. Filtrer dessus à partir
            # d'aujourd'hui fait disparaître un film avant sa propre date :
            # Spider-Man: Brand New Day, sorti le 28/07 sur un premier marché,
            # quittait le radar le 29 alors qu'il sortait le 29 en France et le
            # 31 aux États-Unis. On remonte donc la fenêtre dans le passé pour
            # les films, et c'est la date du pays, lue plus bas, qui tranche.
            # Les séries n'ont pas ce décalage : `first_air_date` fait foi.
            debut = TODAY - FILM_LOOKBACK if kind == "Film" else TODAY
            for page in (1, 2, 3):
                def query(lang):
                    r = requests.get(base + path, timeout=25, headers=UA, params={
                        "api_key": TMDB_KEY,
                        "with_companies": joined,
                        f"{datefield}.gte": debut.isoformat(),
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
                        fr = {it.get("id"): ((it.get("overview") or "").strip(),
                                             (it.get("title") or it.get("name") or "").strip())
                              for it in query("fr-FR").get("results", [])}
                    except Exception:
                        fr = {}
                    for it in j.get("results", []):
                        if hors_univers(uni, it.get("title") or it.get("name")):
                            continue
                        raw = it.get("release_date") or it.get("first_air_date")
                        d = parse_iso(raw or "")
                        if not d:
                            continue
                        # Un film n'a pas la même date des deux côtés de
                        # l'Atlantique : la version anglaise annonce la sortie
                        # américaine, la française la sortie française.
                        d_fr = None
                        if kind == "Film":
                            pays = tmdb_country_dates(base, it.get("id"))
                            d = pays.get("US") or d
                            d_fr = pays.get("FR")
                        # Le jour de la sortie compte encore : l'entrée reste
                        # au radar le jour J et ne s'en va que le lendemain,
                        # et seulement quand les DEUX pays l'ont vue sortir.
                        # Chaque langue masque ensuite ce qui est déjà sorti
                        # chez elle, voir cg-upcoming.js.
                        if d < TODAY and (not d_fr or d_fr < TODAY):
                            continue
                        carte = add(uni, it.get("title") or it.get("name"), d.isoformat(),
                            d.strftime("%d/%m/%Y"), kind, "TMDB",
                            syn=(it.get("overview") or "").strip(),
                            syn_fr=fr.get(it.get("id"), ("", ""))[0],
                            title_fr=fr.get(it.get("id"), ("", ""))[1],
                            date_sort_fr=(d_fr.isoformat() if d_fr and d_fr != d else ""),
                            date_txt_fr=(d_fr.strftime("%d/%m/%Y") if d_fr and d_fr != d else ""),
                            ep=(PREMIERE if kind == "Série" else None),
                            poster=it.get("poster_path") or "",
                            tmdb=it.get("id") or 0,
                            media=("movie" if kind == "Film" else "tv"))
                        if kind == "Série":
                            debuts[it.get("id")] = (d, carte)
                        found += 1
                    if page >= j.get("total_pages", 1):
                        break
                except Exception as e:
                    log(f"TMDB      : erreur {uni} ({kind}) — {e}")
                    break
        # Puis les épisodes, série par série. `debuts` évite de doubler la
        # première d'une série neuve, déjà annoncée juste au-dessus, et garde
        # sa carte sous la main pour lui rendre le repère de cet épisode-là.
        eps = ecartees = 0
        for sid, snom in tmdb_series_qui_diffusent(base, joined).items():
            # Une fiche coûte trois requêtes : le titre se juge AVANT de la
            # demander, sans quoi le catalogue Nickelodeon entier est lu pour
            # être jeté ensuite.
            if hors_univers(uni, snom):
                ecartees += 1
                continue
            jour, carte = debuts.get(sid, (None, None))
            n, premier = tmdb_episodes(base, uni, sid, snom, sauf_le=jour)
            eps += n
            if carte and premier:
                carte["ep"] = premier
        if ecartees:
            log(f"TMDB      : {uni} — {ecartees} série(s) de la société écartée(s), "
                f"hors de l'univers")
        found += eps
        log(f"TMDB      : {uni} — sociétés {joined} → {found} entrée(s), "
            f"dont {eps} épisode(s)")
        total += found
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
            # Les lignes non sorties portent un marqueur de classe ou un fond coloré.
            # On ne tranche PAS tout de suite : Wookieepedia retire ce marqueur le
            # jour même de la sortie, et l'entrée disparaissait donc du radar le
            # jour J au lieu du lendemain. La décision est reprise plus bas, une
            # fois la date de sortie connue.
            upcoming = bool(re.search(r"unpublished|unrelease|notyet|upcoming", blob))
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
            # Une sortie reste au radar TANT QUE le jour J n'est pas passé, même
            # si le wiki l'a déjà basculée en « parue ». Elle s'en va le lendemain.
            if not upcoming and ds < TODAY.isoformat():
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


# ────────────────────────────────────────── SOURCE 4 : TMDB, Star Trek
# Star Trek est passé un temps par le portail « TV and films » de Memory Alpha,
# faute de savoir l'isoler dans TMDB : les autres univers s'y trouvent par leur
# société de production, et Paramount produit tout le reste du catalogue — la
# recherche par société aurait ramené le cinéma entier.
#
# Mais un guide qui ne suit que des films et des séries n'a rien à aller
# chercher dans un wiki. TMDB les connaît mieux : dates de sortie par pays,
# synopsis dans les deux langues, et le découpage en épisodes que le portail
# annonçait à la main, une semaine à la fois. Ce que Memory Alpha donnait en
# plus — coffrets Blu-ray, comics IDW, romans — est justement ce que le guide
# écarte, puisqu'il ne couvre que l'Alpha Canon.
#
# La franchise se retrouve de deux façons, réunies puis dédoublonnées par
# main() sur (univers, titre) :
#   · le MOT-CLÉ TMDB « star trek », résolu dynamiquement comme les sociétés
#     le sont — un ID en dur périme ;
#   · la RECHERCHE PAR TITRE, parce qu'une annonce fraîche arrive souvent avant
#     que quiconque ait posé le mot-clé sur sa fiche.
#
# Les deux ensemble : le mot-clé attrape « Section 31 » si TMDB le range un
# jour sans « Star Trek » devant, le titre attrape ce qui vient d'être créé.
ST_MOTCLE = "star trek"
ST_TITRE = re.compile(r"^\s*star\s*trek\b", re.I)


def tmdb_keyword_ids(name):
    """Résout un mot-clé en IDs TMDB. Même règle que pour les sociétés :
    jamais d'ID écrit en dur, ils périment sans prévenir."""
    try:
        r = requests.get("https://api.themoviedb.org/3/search/keyword", timeout=25,
                         headers=UA, params={"api_key": TMDB_KEY, "query": name})
        r.raise_for_status()
        return [k["id"] for k in r.json().get("results", [])[:8]
                if _norm_title(k.get("name") or "") == _norm_title(name)]
    except Exception as e:
        log(f"Star Trek : recherche mot-clé '{name}' — {e}")
        return []


def _st_get(base, chemin, **params):
    """Une requête TMDB dans les deux langues. Renvoie (anglais, {id: français}).

    Les deux appels sont la même requête à `language` près : c'est ce que fait
    déjà `source_tmdb`, et ça garantit que les deux listes portent les mêmes
    fiches — un synopsis français apparié par id, jamais par rang."""
    def une(lang):
        r = requests.get(base + chemin, timeout=25, headers=UA,
                         params={"api_key": TMDB_KEY, "language": lang, **params})
        r.raise_for_status()
        return r.json()
    en = une("en-US")
    try:
        fr = {it.get("id"): it for it in une("fr-FR").get("results", [])}
    except Exception:
        fr = {}
    return en, fr


def st_catalogue(base, kw_ids):
    """Les films et les séries de la franchise, indexés par id TMDB.

    Chaque fiche est gardée avec son homologue français sous la clé `_fr` :
    l'appel qui la rapporte est le seul endroit où l'on tient les deux."""
    films, series = {}, {}

    def moisson(chemin, dest, pages, verifier_titre, **params):
        for page in pages:
            try:
                en, fr = _st_get(base, chemin, page=page, **params)
            except Exception as e:
                log(f"Star Trek : {chemin} p{page} — {e}")
                return
            for it in en.get("results", []):
                # Le mot-clé fait foi : ce qu'il rapporte est de la franchise.
                # La recherche par titre, elle, ramène aussi les documentaires
                # et les hommages — « The Center Seat: 55 Years of Star Trek »
                # n'est pas un épisode de Star Trek.
                if verifier_titre and not any(
                        ST_TITRE.match((it.get(c) or ""))
                        for c in ("name", "original_name", "title", "original_title")):
                    continue
                it["_fr"] = fr.get(it.get("id")) or {}
                dest.setdefault(it.get("id"), it)
            if page >= en.get("total_pages", 1):
                return

    if kw_ids:
        joined = "|".join(str(i) for i in kw_ids)      # | = OU chez TMDB
        # Même fenêtre que les autres univers : les films remontent de
        # FILM_LOOKBACK, parce que `primary_release_date` est la première
        # sortie AU MONDE et non la sortie américaine ou française. Voir le
        # commentaire de `source_tmdb`, c'est exactement le même piège.
        moisson("/discover/movie", films, (1, 2, 3), False,
                with_keywords=joined, include_adult="false",
                sort_by="primary_release_date.asc",
                **{"primary_release_date.gte": (TODAY - FILM_LOOKBACK).isoformat(),
                   "primary_release_date.lte": HORIZON.isoformat()})
        moisson("/discover/tv", series, (1, 2, 3), False,
                with_keywords=joined, include_adult="false",
                sort_by="first_air_date.asc",
                **{"first_air_date.gte": TODAY.isoformat(),
                   "first_air_date.lte": HORIZON.isoformat()})

    # La recherche par titre ignore les dates : c'est elle qui doit rapporter
    # les séries DÉJÀ diffusées, dont on veut le prochain épisode. Le tri par
    # date, lui, se fait plus bas, fiche par fiche.
    moisson("/search/movie", films, (1, 2), True, query="Star Trek", include_adult="false")
    moisson("/search/tv", series, (1, 2), True, query="Star Trek", include_adult="false")
    return films, series


def source_startrek():
    if not TMDB_KEY:
        log("Star Trek : ⚠ pas de clé (secret TMDB_KEY absent)")
        return
    base = "https://api.themoviedb.org/3"
    kw = tmdb_keyword_ids(ST_MOTCLE)
    if not kw:
        log("Star Trek : aucun mot-clé « star trek » trouvé — la recherche par "
            "titre prend seule le relais")
    films, series = st_catalogue(base, kw)

    n_film = n_serie = n_ep = 0
    for it in films.values():
        d = parse_iso(it.get("release_date") or "")
        if not d:
            continue
        # Un film n'a pas la même date des deux côtés de l'Atlantique.
        pays = tmdb_country_dates(base, it.get("id"))
        d = pays.get("US") or d
        d_fr = pays.get("FR")
        if d > HORIZON:
            continue
        # Le jour de la sortie compte encore : l'entrée s'en va le lendemain,
        # et seulement quand les DEUX pays l'ont vue sortir.
        if d < TODAY and (not d_fr or d_fr < TODAY):
            continue
        f = it.get("_fr") or {}
        add("startrek", it.get("title"), d.isoformat(), d.strftime("%d/%m/%Y"),
            "Film", "TMDB",
            syn=(it.get("overview") or "").strip(),
            syn_fr=(f.get("overview") or "").strip(),
            title_fr=(f.get("title") or "").strip(),
            date_sort_fr=(d_fr.isoformat() if d_fr and d_fr != d else ""),
            date_txt_fr=(d_fr.strftime("%d/%m/%Y") if d_fr and d_fr != d else ""),
            poster=it.get("poster_path") or "",
            tmdb=it.get("id") or 0, media="movie")
        n_film += 1

    # Les séries qui diffusent en ce moment, demandées à /discover comme pour
    # les quatre autres univers : c'est `air_date` qui les retrouve, jamais
    # `first_air_date`. Le mot-clé remplace la société — Paramount produit tout
    # le reste du catalogue, et chercher par studio ramènerait le cinéma entier.
    diffusent = {}
    if kw:
        diffusent = tmdb_series_qui_diffusent(
            base, "|".join(str(i) for i in kw), cle="with_keywords")

    for it in series.values():
        nom = it.get("name") or it.get("original_name") or ""
        f = it.get("_fr") or {}
        debut = parse_iso(it.get("first_air_date") or "")
        # Une série qui n'a pas commencé est elle-même une sortie.
        carte = None
        if debut and TODAY <= debut <= HORIZON:
            carte = add("startrek", nom, debut.isoformat(), debut.strftime("%d/%m/%Y"),
                        "Série", "TMDB",
                        syn=(it.get("overview") or "").strip(),
                        syn_fr=(f.get("overview") or "").strip(),
                        title_fr=(f.get("name") or "").strip(),
                        ep=PREMIERE, poster=it.get("poster_path") or "",
                        tmdb=it.get("id") or 0, media="tv")
            n_serie += 1
        # Une série sans date de début est une annonce sans grille : rien à
        # lire. Pour les autres, seule la fiche dit s'il reste un épisode à
        # venir, et c'est `next_episode_to_air` qui le dit.
        #
        # Il y avait ici une fenêtre de fraîcheur de trois ans, comptée depuis
        # la PREMIÈRE de la série : elle a fait tomber les six univers Star Trek
        # d'un coup au premier vrai passage, le 13 août 2026 — « 0 film(s),
        # 0 série(s), 0 épisode(s) — 27 fiche(s) série lues ». Strange New
        # Worlds a débuté en 2022 et diffuse aujourd'hui : l'âge d'une série ne
        # dit rien de ce qu'elle a encore à sortir. Le catalogue tient en une
        # trentaine de fiches, on les demande toutes.
        if not debut:
            continue
        diffusent.pop(it.get("id"), None)
        n, premier = tmdb_episodes(base, "startrek", it.get("id"), nom,
                                   sauf_le=(debut if debut >= TODAY else None))
        n_ep += n
        if carte and premier:
            carte["ep"] = premier

    # Ce que /discover a rapporté et que le catalogue n'avait pas. Le mot-clé
    # « star trek » est posé par les contributeurs de TMDB sur tout ce qui PARLE
    # de la franchise, pas seulement sur ce qui EN est : le 13 août 2026, il a
    # rapporté « A Captain's Log », S6E16, une émission d'entretiens. Le titre
    # doit donc répondre à `ST_TITRE` ici aussi — le même garde-fou que la
    # recherche par titre, et la même idée qu'`UNIVERS_TITRE` pour Avatar. Une
    # série de la franchise s'est toujours appelée « Star Trek: quelque chose ».
    hors = 0
    for sid, nom in diffusent.items():
        if not ST_TITRE.match(nom or ""):
            hors += 1
            continue
        n_ep += tmdb_episodes(base, "startrek", sid, nom)[0]

    log(f"Star Trek : {n_film} film(s), {n_serie} série(s), {n_ep} épisode(s) "
        f"— {len(films)} fiche(s) film et {len(series)} fiche(s) série lues, "
        f"{len(diffusent) - hors} série(s) en diffusion hors catalogue, "
        f"{hors} écartée(s) par le titre")
    if n_film + n_serie + n_ep == 0:
        log("Star Trek : ⚠ rien retenu — mot-clé, titres ou fenêtre à revoir")


# ────────────────────────────── SOURCE 5 : Assassin's Creed, la liste Kulurak
# Le huitieme univers ne se retrouve nulle part ailleurs. TMDB connait la serie
# Netflix (tv/209962) mais sans date de premiere, et ne sait rien des jeux :
# `source_tmdb` la verra le jour ou Netflix en annoncera une, pas avant. IMDb,
# que la fiche de la serie designe pourtant (tt13363220), sert un mur
# anti-robot AWS a toute requete — 202 et une page vide, meme depuis un
# navigateur : ce n'est pas une source qu'un script peut lire.
#
# Reste la liste que Niko a trouvee : la section « Upcoming Assassin's Creed
# releases » du blog de Kulurak sur le wiki Assassin's Creed, tenue a la main
# et a jour. C'est la meme mecanique que Wookieepedia pour Star Wars — un
# tableau de wiki, lu par l'API MediaWiki standard, l'API `/api/v1` de Fandom
# repondant 403.
#
# **Aujourd'hui elle ne rend rien, et c'est normal.** Sur ses huit lignes, une
# seule porte une date — Black Flag Resynced, sorti le 09/07/2026 — et les
# sept autres sont « TBA » : Hexe, Invictus, Jade, le jeu mobile Netflix et
# les trois series. `main()` ecarte les entrees sans date, et la page « A
# venir » n'affiche une colonne que pour les univers qui en ont au moins une.
# La colonne apparaitra donc toute seule le jour ou une date tombera, sans
# qu'on ait a y revenir.
AC_WIKI = "https://assassinscreed.fandom.com/api.php"
AC_BLOG = "User blog:Kulurak/Chronological order of Assassin's Creed franchise"
AC_SECTION = "==Upcoming Assassin's Creed releases=="

# Une ligne du tableau : la date sur sept colonnes fusionnees, le code de type
# dans une cellule coloree, puis le titre en italique.
AC_LIGNE = re.compile(
    r"\|\s*colspan=\"7\"[^|\n]*\|\s*(?P<date>[^|\n]+?)\s*\|\|"
    r"[^|\n]*\|\s*(?P<code>[A-Z]{1,3})\s*\|\|"
    r"\s*''(?P<titre>.+?)''")

# Les codes du tableau. MG (mobile game) compte comme un jeu : `kind_key`
# range « Jeu video » et « Jeu mobile » sous la meme cle.
AC_TYPES = {"VG": "Jeu vidéo", "MG": "Jeu mobile", "B": "Livre",
            "C": "Comic", "N": "Roman", "F": "Film"}


def ac_titre(brut):
    """[[Page|Affichage]] ou [[Page]] -> (affichage, page du wiki)."""
    m = re.match(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", brut.strip())
    if not m:
        return re.sub(r"[\[\]']", "", brut).strip(), ""
    page = m.group(1).strip()
    return (m.group(2) or page).strip(), page


def ac_intros(pages):
    """Le premier paragraphe de chaque page du wiki Assassin's Creed.

    `fill_wiki_synopses` ne sert que Star Wars — elle interroge
    starwars.fandom.com en dur. On lit donc ici, en un seul appel groupe."""
    if not pages:
        return {}
    try:
        r = requests.get(AC_WIKI, timeout=45, headers=UA_BROWSER, params={
            "action": "query", "prop": "revisions", "rvprop": "content",
            "rvslots": "main", "redirects": 1, "format": "json",
            "formatversion": 2, "titles": "|".join(pages)})
        r.raise_for_status()
        q = r.json().get("query", {})
        out = {}
        for pg in q.get("pages", []):
            revs = pg.get("revisions") or []
            if not revs:
                continue
            contenu = (revs[0].get("slots", {}).get("main", {}) or {}).get("content", "")
            out[(pg.get("title") or "").lower()] = clean_wikitext(contenu)
        # Le tableau du blog désigne trois pages par une redirection — « Hexe »
        # pour « Codename Hexe », « Live-action … television series » pour la
        # fiche Netflix. L'API les suit, mais rend le contenu sous le titre
        # d'arrivée : sans ce report, ces trois-là ressortaient sans synopsis.
        for pont in ("normalized", "redirects"):
            for r_ in q.get(pont, []):
                cible = (r_.get("to") or "").lower()
                if cible in out:
                    out.setdefault((r_.get("from") or "").lower(), out[cible])
        return out
    except Exception as e:
        log(f"AC        : synopsis — {str(e)[:120]}")
        return {}


def source_assassinscreed():
    try:
        r = requests.get(AC_WIKI, timeout=30, headers=UA_BROWSER, params={
            "action": "parse", "page": AC_BLOG, "prop": "wikitext",
            "format": "json", "formatversion": 2})
        r.raise_for_status()
        texte = r.json()["parse"]["wikitext"]
    except Exception as e:
        log(f"AC        : ÉCHEC lecture du blog — {str(e)[:140]}")
        return

    i = texte.find(AC_SECTION)
    if i < 0:
        log("AC        : section « Upcoming » introuvable — titre à revoir")
        return
    bloc = texte[i:]

    lignes = list(AC_LIGNE.finditer(bloc))
    if not lignes:
        log(f"AC        : aucune ligne lue dans {len(bloc)} signes — motif à revoir")
        return

    # Les pages du wiki, pour le synopsis. Une seule requête pour tout le lot.
    vues = []
    for m in lignes:
        _, page = ac_titre(m.group("titre"))
        if page:
            vues.append(page)
    intros = ac_intros(vues)

    n = sans_date = passees = 0
    for m in lignes:
        titre, page = ac_titre(m.group("titre"))
        if not titre:
            continue
        code = m.group("code")
        kind = AC_TYPES.get(code, "")
        # Le wiki range les trois productions Netflix sous « F », comme les
        # films : ce sont des séries, et leur titre le dit.
        if code == "F" and re.search(r"\b(television series|anime|series)\b", titre, re.I):
            kind = "Série"
        ds, dt, prec = loose_date(m.group("date"))
        if prec == "tba":
            sans_date += 1
            continue
        if ds < TODAY.isoformat():
            passees += 1
            continue
        add("assassinscreed", titre, ds, dt, kind, "Assassin's Creed Wiki", prec,
            syn=intros.get(page.lower(), ""))
        n += 1

    log(f"AC        : {n} sortie(s) datée(s) · {sans_date} sans date · "
        f"{passees} déjà sortie(s) — {len(lignes)} ligne(s) au tableau")


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
FR_WIKI = "https://starwars.fandom.com/fr/api.php"


def _norm_title(t):
    t = (t or "").lower()
    t = re.sub(r"\((roman|novel|comics?|bd|jeu|game|film|s[ée]rie)\)", " ", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def _clean_fr_title(t):
    """Retire le suffixe de désambiguïsation : « Legacy (roman) » -> « Legacy »."""
    return re.sub(r"\s*\((roman|nouvelle|comics?|bd|jeu vid[ée]o|jeu|film|s[ée]rie[^)]*|livre)\)\s*$",
                  "", t or "", flags=re.I).strip()


def _wiki_fr_langlinks(chunk):
    """Passe 1 : liens interlangue (absents sur Wookieepedia, gardés au cas où)."""
    r = requests.get("https://starwars.fandom.com/api.php", timeout=45,
                     headers=UA_BROWSER, params={
                         "action": "query", "prop": "langlinks",
                         "lllang": "fr", "lllimit": "max", "redirects": 1,
                         "format": "json", "formatversion": 2,
                         "titles": "|".join(e["wiki"] for e in chunk),
                     })
    r.raise_for_status()
    out = {}
    for p in r.json().get("query", {}).get("pages", []):
        for ll in (p.get("langlinks") or []):
            if ll.get("lang") == "fr" and ll.get("title"):
                out[(p.get("title") or "").lower()] = ll["title"]
    return out


def _fr_intros(titles):
    """Intro française par lots depuis la Wookieepedia FR."""
    out, titles = {}, [t for t in titles if t]
    for i in range(0, len(titles), 20):
        part = titles[i:i + 20]
        try:
            r = requests.get(FR_WIKI, timeout=45, headers=UA_BROWSER, params={
                "action": "query", "prop": "revisions", "rvprop": "content",
                "rvslots": "main", "redirects": 1,
                "format": "json", "formatversion": 2,
                "titles": "|".join(part),
            })
            r.raise_for_status()
            for p in r.json().get("query", {}).get("pages", []):
                if p.get("missing"):
                    continue
                revs = p.get("revisions") or []
                if not revs:
                    continue
                content = (revs[0].get("slots", {}).get("main", {}) or {}).get("content", "")
                txt = clean_wikitext(content)
                if txt:
                    out[_norm_title(p.get("title"))] = (p.get("title") or "", txt)
        except Exception as e:
            log(f"Résumés FR: lecture lot {i // 20 + 1} — {str(e)[:90]}")
    return out


def _fr_search(title):
    """Passe 3 : renvoie jusqu'à 3 pages candidates du wiki FR."""
    r = requests.get(FR_WIKI, timeout=30, headers=UA_BROWSER, params={
        "action": "query", "list": "search", "srsearch": f'"{title}"',
        "srlimit": 3, "format": "json", "formatversion": 2,
    })
    r.raise_for_status()
    return [h.get("title") for h in r.json().get("query", {}).get("search", []) if h.get("title")]


def _validate(en_title, fr_title, fr_text):
    """Accepte si le texte FR cite le titre anglais, ou si les titres se ressemblent."""
    from difflib import SequenceMatcher
    if not fr_text:
        return False
    if _norm_title(en_title) in _norm_title(fr_text):
        return True
    return SequenceMatcher(None, _norm_title(en_title), _norm_title(fr_title)).ratio() >= 0.78


def fill_wiki_synopses_fr(entries):
    """syn_fr pour les entrées Star Wars, en trois passes successives."""
    todo = [e for e in entries if e.get("wiki") and not e.get("syn_fr")]
    if not todo:
        return
    stats = {"langlinks": 0, "titre identique": 0, "recherche": 0}

    # passe 1 — liens interlangue
    mapping = {}
    for i in range(0, len(todo), 20):
        try:
            mapping.update(_wiki_fr_langlinks(todo[i:i + 20]))
        except Exception as e:
            if i == 0:
                log(f"Résumés FR: liens interlangue KO — {str(e)[:90]}")
            break

    # passe 2 — le titre anglais existe tel quel sur le wiki FR
    wanted = {}
    for e in todo:
        fr = mapping.get(e["wiki"].lower())
        wanted[e["wiki"]] = fr or e["wiki"]
    intros = _fr_intros(set(wanted.values()))
    for e in todo:
        hit = intros.get(_norm_title(wanted[e["wiki"]]))
        if hit:
            fr_title, txt = hit
            e["syn_fr"] = txt
            if fr_title and _norm_title(fr_title) != _norm_title(e["wiki"]):
                e["title_fr"] = _clean_fr_title(fr_title)
            stats["langlinks" if mapping.get(e["wiki"].lower()) else "titre identique"] += 1

    # passe 3 — recherche, validée sur le contenu de la page trouvée
    rest = [e for e in todo if not e.get("syn_fr")][:40]
    if rest:
        cands = {}
        for e in rest:
            try:
                hits = _fr_search(e["wiki"])
                if hits:
                    cands[e["wiki"]] = hits
            except Exception as ex:
                if e is rest[0]:
                    log(f"Résumés FR: recherche KO — {str(ex)[:90]}")
                break
        if cands:
            allc = {t for lst in cands.values() for t in lst}
            intros2 = _fr_intros(allc)
            for e in rest:
                for hit in cands.get(e["wiki"], []):
                    got2 = intros2.get(_norm_title(hit))
                    if got2 and _validate(e["wiki"], hit, got2[1]):
                        e["syn_fr"] = got2[1]
                        if got2[0] and _norm_title(got2[0]) != _norm_title(e["wiki"]):
                            e["title_fr"] = _clean_fr_title(got2[0])
                        stats["recherche"] += 1
                        break

    got = sum(1 for e in todo if e.get("syn_fr"))
    detail = ", ".join(f"{k}: {v}" for k, v in stats.items() if v)
    log(f"Résumés FR: {got}/{len(todo)} synopsis français"
        + (f" ({detail})" if detail else " — le wiki FR n'a pas ces pages"))


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
    ("jeunesse", "novel"), ("middle grade", "novel"),
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
    """Mot entier obligatoire : « jeu » ne doit pas matcher « jeunesse »."""
    k = (kind or "").lower()
    for token, key in _KIND_MATCH:
        if re.search(r'\b' + re.escape(token) + r'\b', k):
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
<h1>Radar des sorties</h1>
<div class="sub">Généré le {gen} · {total} sortie(s) à venir</div>
<div class="legend">{legend}</div>
<div class="grid">{body}</div>
<div class="rep">{report}</div>
</body></html>"""


def render(entries):
    cols = []
    for uni, meta in UNIVERSES.items():
        sub = [e for e in entries if e["universe"] == uni]
        # radar.html est la page française : elle annonce la sortie française
        # quand elle existe, et se trie dessus. date_sort reste la date US.
        sub.sort(key=lambda e: (e.get("date_sort_fr") or e["date_sort"], e["title"]))
        rows = []
        for e in sub:
            col = kind_color(e["kind"])
            ep = e.get("ep") or {}
            # `e:0` marque la saison entière : elle n'a pas de numéro
            # d'épisode, et « S1E00 » ne voudrait rien dire.
            repere = ({"premiere": "Première", "finale": "Finale",
                       "saison": "Saison entière"}.get(ep.get("mark"), "")
                      + (f' S{ep["s"]}E{ep["e"]:02d}' if ep and ep["e"]
                         else f' S{ep["s"]}' if ep else "")).strip()
            head = (f'<div class="date">{html.escape(e.get("date_txt_fr") or e["date_txt"])}</div>'
                    f'<div class="t">{html.escape(e["title"])}</div>'
                    f'<div class="meta"><span>{html.escape(e["kind"] or "—")}'
                    f'{(" · " + html.escape(repere)) if repere else ""}</span>'
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
    for fn in (source_tmdb, source_avatar_almanac, source_wookieepedia,
               source_startrek, source_assassinscreed):
        try:
            fn()
        except Exception:
            log(f"{fn.__name__} : crash inattendu\n{traceback.format_exc(limit=2)}")

    # Dédoublonnage : même titre, même univers. Les épisodes portent tous le
    # nom de leur série et rien d'autre — c'est leur repère de saison qui les
    # distingue, sans quoi une saison entière se réduirait à une seule carte.
    seen, uniq = set(), []
    dropped = sum(1 for e in results if e["precision"] == "tba")
    for e in sorted([r for r in results if r["precision"] != "tba"],
                    key=lambda x: x["date_sort"]):
        ep = e.get("ep") or {}
        k = (e["universe"], normalize(e["title"]), ep.get("s"), ep.get("e"))
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)

    fill_wiki_synopses(uniq)
    fill_wiki_synopses_fr(uniq)
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
