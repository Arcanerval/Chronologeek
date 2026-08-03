# Chronologeek

Référence mondiale des timelines geek, publiée sur GitHub Pages à `chronologeek.app`.
Site statique : HTML/CSS/JS vanilla, pas de build front, pas de framework.
Des scripts Python génèrent ou enrichissent les pages et sont lancés par GitHub Actions.

## Structure

- Racine = version **anglaise** : `starwars.html`, `marvel.html`, `dc.html`, `avatar.html`
- `/fr/` = version **française**, mêmes noms de fichiers
- `/deep-dives/star-wars.html` et `/fr/dossiers/star-wars.html` = le Dossier
  (533 romans, comics et fictions audio, plus 63 repères écran)
- `index.html`, `whats-new.html` / `nouveautes.html`, `upcoming.html` / `a-venir.html`, `radar.html`

**Règle absolue : toute modification d'une page racine doit être répliquée dans `/fr/`.**
Vérifier après coup que les deux versions produisent les mêmes comptes d'entrées.
`py sync.py check` fait cette vérification ; voir « Synchronisation FR/EN » plus bas.

## Charte couleurs

Univers : Star Wars `#4d9fff`, Marvel `#e23636`, DC `#f5c842`, Avatar `#7dd3fc`.
Chaque page pose `data-universe` sur `<body>` (`sw`, `mcu`, `dc`, `avatar`) et `--tl-color`.
Badges de type : film `#64b5f6`, film animé `#90caf9`, série `#81c784`, série animée `#ce93d8`,
jeu `#ffb74d`, spécial `#ffa726`, vidéo `#f472b6`.
Cases à cocher : `border:2px solid #7e7ea8` + `box-shadow:0 0 0 1px rgba(126,126,168,.25)`.

## Composants partagés

Quatre fichiers à la racine, chargés par toutes les pages timeline et par le Dossier.

- `progress.css` / `progress.js` — bloc de progression. Tout est scopé sous
  `[data-cgv="2"]`, posé par le script, pour battre les anciennes règles `.progress-block`
  sans `!important` et sans dépendre de l'ordre de chargement.
- `intro.css` — intro de page (accroche, bulle, cartes de repères, dépliant des omissions),
  plus la barre de stats. Neutralise `#tl-notes.nb` avec un sélecteur d'id.
- `filters.css` / `filters.js` — panneau unique qui remplace la légende et la barre de filtres.
  Tout est scopé sous `.fp` parce que le Dossier utilise déjà `.chip` et `.chips`.

### Principe de conception à respecter

`progress.js` et `filters.js` **déplacent** les boutons existants des pages au lieu d'en
recréer. Ils gardent leur `id`, leur `onclick` et leurs `addEventListener`, donc
`applyFilters()`, `applyLevelFilter()` et `refresh()` des pages continuent de tourner
sans modification. Ne jamais casser ça : c'est ce qui rend les composants sûrs.

Corollaire : détacher un bouton **avant** d'écraser l'`innerHTML` du bloc parent,
sinon il est détruit avec ses écouteurs.

Les nœuds que le code des pages alimente encore (`#pb-counts`, `#pb-fill` sur les
timelines, `#pnum`, `#pfill` sur le Dossier) sont conservés cachés dans `.pb-legacy`.
Les supprimer fait planter les pages au premier clic.

### Deux conventions coexistent

| | Timelines | Dossier |
|---|---|---|
| bloc progression | `.progress-block` | `.prog` |
| entrées | `.en[data-id]`, terminé = `.done` | `.it`, lu = `.read`, filtré = `.hide` |
| filtres | `.fbt`, actif = `.active` | `.chip`, actif = `.on` |
| conteneur filtres | `.filter-bar` (SW, Marvel), `.filter-row` (DC) | `.chips` |
| verbe | « vus » / « watched » | « lus » / « read » |

## Scripts de génération

Tous lisent leur clé TMDB dans la variable d'environnement `TMDB_KEY`
(secret GitHub du même nom). Tous sont rejouables : ils nettoient leur propre bloc
avant de réinjecter.

- `dossier.py`, `dossier_i18n.py` — génèrent le Dossier dans les deux langues.
  Table `FR_OVERRIDE_RAW` pour les titres français corrigés à la main.
  **Ne plus les lancer tels quels.** Depuis la refonte, le Dossier est une page
  aux composants partagés dont les 533 entrées vivent dans `window.CG_DATA` ;
  ces deux scripts produisent encore l'ancien HTML et écraseraient la refonte.
  Leur workflow est en `workflow_dispatch` seul, donc rien ne part tout seul :
  le risque, c'est un clic sur « Run workflow ». Pour ajouter des entrées,
  modifier le JSON dans la page, ou régénérer puis repasser `_run_dossier.js`.
- `runtime.py` — calcule le temps de visionnage par entrée et injecte
  `const RT={id:minutes}`. Workflow `runtime.yml`, déclenchement manuel.
- `radar.py` — radar des sorties, workflow `radar.yml`, une fois par jour
  (`cron: "0 6 * * *"`, soit 8 h à Paris en été, 7 h en hiver). Il n'y a pas
  assez de sorties pour tourner plus souvent.

### Les dates du radar

Un film ne sort pas le même jour partout. `radar.py` écrit la sortie **US** dans
`date_sort` / `date_txt` et la **française** dans `date_sort_fr` / `date_txt_fr`,
laissées vides quand les deux coïncident.

TMDB ne filtre `/discover` que sur `primary_release_date`, la **première sortie
au monde**, qui n'est ni l'une ni l'autre. Interroger à partir d'aujourd'hui
faisait donc disparaître un film avant sa propre date. La fenêtre remonte
maintenant de `FILM_LOOKBACK` (45 jours) dans le passé pour les films, et c'est
`tmdb_country_dates()` qui tranche : l'entrée reste au radar tant que **l'un des
deux pays** ne l'a pas vue sortir, le jour J compris.

`radar.json` porte donc l'union des deux pays, et chaque langue coupe à sa propre
date dans `cg-upcoming.js` (`stillUpcoming`). Brand New Day reste sur « À venir »
jusqu'au 29/07 et sur « Upcoming » jusqu'au 31/07.

Ne pas remettre de filtre `d < TODAY` avant la lecture des dates par pays : c'est
précisément ce qui annulait la fenêtre élargie.

Après avoir poussé une page à la main, **relancer l'action concernée** : les pages
livrées n'ont pas la table `RT`, c'est l'action qui l'injecte. Pousser d'abord,
lancer ensuite, sinon le push écrase la table.

## Synchronisation FR/EN

`sync.py` sert la règle absolue ci-dessus. Contrairement aux scripts de génération,
il n'utilise pas `TMDB_KEY` et aucune action ne le lance : il s'appelle à la main.
L'interpréteur est `py` sur la machine de Niko, pas `python`.

- `py sync.py check` — vérifie que chaque paire racine / `fr/` a le même nombre de
  lignes, le même nombre d'entrées et les mêmes `id`. Signale `avatar.html`, qui
  n'a pas encore de version française.
- `py sync.py show <univers> <id>` — affiche une entrée dans les deux langues sans
  ouvrir les pages entières. `<univers>` vaut `sw`, `mcu`, `dc` ou `avatar`.
- `py sync.py mirror <univers> "<ancien>" "<nouveau>"` — remplace dans les deux
  versions à la fois.

Le script s'appuie sur le fait que les deux versions sont **parallèles ligne à ligne**.
`mirror` n'écrit que sur les lignes strictement identiques entre EN et FR, donc sur
le code ; dès qu'une ligne porte un texte traduit il refuse et la signale. Les textes
restent à écrire à la main dans chaque langue, conformément à la section sur les
textes de Niko.

Lecture / écriture avec `newline=""` : sans ça Python retraduit CRLF en LF et
réécrit les fichiers entiers alors que le dépôt les stocke en LF.

## Le gardien du lore

Repère les sorties du radar qui ne figurent pas encore dans les timelines, et
propose où les placer. Le travail est coupé en deux, volontairement.

`lore_gap.py` fait la moitié mécanique : il tient un registre, le confronte aux
pages, et écrit `lore-gap.json` (ce qu'il reste à placer dans les jours proches),
`lore-index/<univers>.json` (l'index compact de chaque timeline) et
`lore-ledger.json` (le registre). Aucun réseau, aucune clé, aucun jugement. Il
tourne chaque jour dans le workflow `radar.yml`, juste après `radar.py`.

**Pourquoi un registre plutôt qu'une lecture directe de `radar.json`.** Une
sortie quitte le radar le lendemain de sa date, et personne ne l'a encore placée
dans une timeline à ce moment-là : elle n'est visible qu'un jour, puis plus
jamais. Filtrer `radar.json` par date raterait donc exactement ce qu'on cherche.
Le registre garde trace de toute entrée vue au moins une fois et ne l'oublie que
lorsqu'elle apparaît dans une timeline (ou au bout d'un an).

Le radar a d'ailleurs longtemps lâché ses entrées *avant* leur date : il
interrogeait TMDB sur `primary_release_date.gte`, la première sortie mondiale,
qui précède souvent la sortie US comme la sortie FR. Spider-Man: Brand New Day,
sorti le 28/07 sur un premier marché, a ainsi disparu le 29 alors qu'il sortait
le 29 en France et le 31 aux États-Unis. Corrigé le 29/07/2026, voir « Les dates
du radar » plus haut ; le registre reste utile pour la raison ci-dessus.

**Le passage quotidien dans l'action est ce qui fait vivre le registre.** C'est
le seul moment où une entrée sur le point de disparaître est encore visible. Si
l'étape saute plusieurs jours, des sorties passent à la trappe —
`py lore_gap.py --seed` reconstruit le registre depuis l'historique git de
`radar.json` et rattrape le manque.

**Règle de destination : comics, romans et fictions audio vont au Dossier de
leur univers, jamais à la timeline cinéma.** Un roman Star Wars se place dans
`deep-dives/star-wars.html`, pas dans `starwars.html` ; films, séries et jeux
vidéo suivent le chemin inverse. Le script route tout seul et écrit la
destination dans `cible`. Sans ce routage, tout le catalogue écrit ressortait en
faux positif — c'est ce qui faisait signaler Legacy comme absent alors qu'il est
au Dossier depuis toujours. Un univers sans Dossier envoie tout à sa timeline.

Le Dossier ne se parse pas comme une timeline : ses entrées sont du JSON dans
`window.CG_DATA`, groupées par ère, avec `k` / `c` / slug d'`id` et une `date`
in-universe. Il n'a pas de `level`. Son index compact vit dans
`lore-index/<univers>-dossier.json`.

`CG_DATA` mélange deux natures d'items. `kind:"it"` sont les 533 vraies entrées,
les seules qui comptent dans la progression. `kind:"screen"` sont 63 repères
posant les films et séries au milieu de la chronologie — ils situent une entrée
mais n'en sont pas une. L'index les garde, marqués `ecran:true`, parce qu'ils
servent de points d'ancrage pour un placement ; en revanche ils sont exclus du
test de présence, sans quoi un titre de film ferait passer une vraie absence
pour une entrée déjà placée.

Le placement, lui, demande du jugement et se fait en session. Quand Niko dit
« fais tourner le gardien du lore », suivre `PLACEMENT.md`.

La fenêtre par défaut est de 2 jours de part et d'autre du jour courant, réglable
avec `--jours N`. Hors fenêtre, les entrées restent au registre et sont comptées,
pas listées : une passe quotidienne ne doit pas rouvrir tout le retard accumulé.

Il découvre les univers tout seul : la correspondance `universe` → page est
dérivée de `radar.json` et du listing de la racine, jamais codée en dur. Ajouter
un univers ne demande de toucher à rien. Un univers au radar sans page racine est
signalé dans `univers_sans_page`.

`py lore_gap.py --check` affiche le bilan sans rien écrire. Le contrôle de bonne
santé : la répartition Star Wars doit sortir à 61 entrées, 9 must / 37 important
/ 15 bonus. Si ces chiffres bougent sans que la timeline ait changé, le parseur
a décroché.

## Niveaux d'importance

`level:"must"` (⭐), `level:"important"` (🚨), `level:"bonus"` (rien).
Rendu : classe `.must` / `.imp` sur `.en` (liseré or / orange), icône dans `.en-level-icon`,
attribut `data-level` pour le filtrage.
Star Wars : 9 must, 37 important, 15 bonus. Marvel et DC ont leurs propres répartitions.

## Pièges déjà rencontrés

- `const RT` au premier niveau d'un script **n'est pas** sur `window` : lire l'identifiant
  nu protégé par `typeof`, jamais `window.RT`.
- DC n'a pas de `#tl-content` : utiliser `.en[data-id]` sans préfixe de conteneur.
- DC masque des **colonnes entières** (`.zcol`) et pas les entrées : pour compter les
  entrées visibles, remonter la chaîne des parents.
- DC écrit ses objets JS avec des **apostrophes simples**, SW et Marvel avec des doubles.
  Un parseur doit gérer les deux, et les apostrophes internes (`Propriété d'Ezra Bridger`)
  cassent un regex naïf : apparier la même quote.
- Wookieepedia : l'API `/api/v1` de Fandom renvoie 403, passer par l'API MediaWiki standard.
- TMDB : résoudre les identifiants de société dynamiquement, jamais en dur.
- OpenLibrary : espacer les requêtes de 350 ms, dédupliquer le cache, préférer les ISBN directs.
- Les émojis drapeaux ne s'affichent pas sur Windows : utiliser des SVG pour les
  sélecteurs de langue.
- `openpyxl` en `read_only` : vérifier la longueur des tuples, les lignes vides en
  renvoient des courts.
- Ne pas remettre l'échappatoire `showTypes.size===0` dans `applyFilters` : zéro type
  coché doit afficher zéro entrée, sinon décocher tout réaffiche toute la timeline.

## Les textes de Niko

**Ne jamais réécrire ses textes.** Quand il fournit un texte, l'extraire mot pour mot
et vérifier par script que chaque fragment affiché existe à l'identique dans la source.
Reformuler, condenser ou « améliorer » sa prose est une erreur, pas une initiative.

Seules exceptions admises, et à signaler explicitement : les intitulés de structure
(titres de cartes, libellés de catégories) quand sa version en prose n'en a pas,
et la majuscule initiale quand on découpe une phrase.

## Ce qui reste à faire

- Reconstruire `avatar.html` avec les quatre composants partagés (132 entrées, 8 ères,
  calendrier BG/AG). La version anglaise à la racine est encore la page française
  non traduite.
- Passer les pages « Nouveautés » et « À venir » aux composants partagés.
- Monétisation : Patreon ou Ko-fi, pas encore activée.
