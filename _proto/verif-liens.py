# verif-liens.py — chaque lien et chaque ressource des pages publiées répond-il ?
#
# La refonte a déplacé les données, renommé le moteur et réécrit 420 liens.
# Rien de tout cela ne casse bruyamment : un `src` mort laisse une page qui
# s'affiche et ne se remplit pas. On demande donc au serveur, une URL à la fois.
import re
import sys
import urllib.error
import urllib.request

BASE = f"http://localhost:{sys.argv[1] if len(sys.argv) > 1 else 8951}"

PAGES = [
    "/", "/starwars", "/marvel", "/dc", "/avatar",
    "/deep-dives/", "/deep-dives/star-wars", "/whats-new", "/upcoming",
    "/fr/", "/fr/starwars", "/fr/marvel", "/fr/dc", "/fr/avatar",
    "/fr/dossiers/", "/fr/dossiers/star-wars", "/fr/nouveautes", "/fr/a-venir",
]

# Les trois « # » volontaires : page courante, Soutenir le site, Contact.
IGNORE = re.compile(r"^(#|https?://|mailto:|data:|javascript:|//)")

vu = {}
soucis = []


def tete(url):
    if url in vu:
        return vu[url]
    try:
        req = urllib.request.Request(BASE + url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as r:
            vu[url] = r.status
    except urllib.error.HTTPError as e:
        vu[url] = e.code
    except Exception as e:  # noqa: BLE001
        vu[url] = str(e)
    return vu[url]


for page in PAGES:
    try:
        with urllib.request.urlopen(BASE + page, timeout=10) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        soucis.append(f"{page} : PAGE INACCESSIBLE ({e})")
        continue

    if 'name="robots"' in html and "noindex" in html:
        soucis.append(f"{page} : noindex publié")
    for attendu in ('rel="canonical"', 'hreflang="x-default"', 'property="og:image"',
                    'name="description"', "/pwa.js", "/manifest.json"):
        if attendu not in html:
            soucis.append(f"{page} : {attendu} absent")

    refs = set(re.findall(r'(?:href|src)="([^"]+)"', html))
    for ref in refs:
        if IGNORE.match(ref) or "'" in ref or "+" in ref:
            continue
        cible = ref if ref.startswith("/") else None
        if cible is None:  # relatif : plus aucun ne devrait subsister
            soucis.append(f"{page} : lien relatif restant → {ref}")
            continue
        code = tete(cible.split("#")[0])
        if code != 200:
            soucis.append(f"{page} : {cible} → {code}")

print(f"{len(PAGES)} pages, {len(vu)} ressources testées.")
if soucis:
    print(f"\n{len(soucis)} PROBLÈME(S) :")
    for s in soucis:
        print(f"  · {s}")
    sys.exit(1)
print("Aucun problème.")
