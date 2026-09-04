# Chronologeek

Référence mondiale des timelines geek, publiée sur GitHub Pages à `chronologeek.app`.
Site statique : HTML/CSS/JS vanilla, pas de build front, pas de framework.
Des scripts Python génèrent ou enrichissent les pages et sont lancés par GitHub Actions.

## Structure

- Racine = version **anglaise** : `starwars.html`, `marvel.html`, `dc.html`,
  `avatar.html`, `startrek.html`, `walkingdead.html`, `dragonage.html`,
  `assassinscreed.html`, `dcanimation.html`
- `/fr/` = version **française**, mêmes noms de fichiers
- `/deep-dives/star-wars.html` et `/fr/dossiers/star-wars.html` = le Dossier
  (535 romans, comics et fictions audio, plus 63 repères écran)
- `index.html`, `whats-new.html` / `nouveautes.html`, `upcoming.html` / `a-venir.html`
- `/data/` — les entrées de chaque page, `<nom de page>-fr.js` et `-en.js`
- `app.js` — le moteur, bilingue, un seul fichier
- `radar.html` — vue interne du radar, `noindex`, hors du site public

### Ce qui s'édite, et ce qui se produit

**Les vingt-huit pages du site ne s'éditent pas.** Elles sont produites depuis
`_proto/` par `node _proto/publier.mjs`, et toute retouche faite directement dans
`starwars.html` est perdue à la publication suivante — sans erreur, sans message.

La chaîne, dans l'ordre :

```
_proto/e-*.html + _proto/data*.js        ← le français, écrit à la main
        │  node _proto/traduire.mjs           les données anglaises
        │  node _proto/traduire-pages.mjs     les pages anglaises
        ▼
_proto/en-*.html + _proto/data-*-en.js
        │  node _proto/publier.mjs
        ▼
26 pages + /data/ + app.js               ← le site, jamais édité à la main
```

Star Trek prend cette chaîne à l'envers : sa source est anglaise, et
`node _proto/traduire-startrek.mjs` en tire le français. Voir « Star Trek, la
chaîne inversée » plus bas. **The Walking Dead fait pareil** —
`en-twd.html` + `data-twd-en.js` sont la source, `node _proto/traduire-twd.mjs`
écrit `e-twd.html` et `data-twd.js`. Publié le 16 août 2026 sous
`/walkingdead` et `/fr/walkingdead`. **Dragon Age est le troisième** —
`en-dragonage.html` + `data-dragonage-en.js` sont la source,
`node _proto/traduire-dragonage.mjs` écrit `e-dragonage.html` et
`data-dragonage.js`. Publié le 20 août 2026 sous `/dragonage` et
`/fr/dragonage`. **Assassin's Creed est le quatrième** —
`en-assassinscreed.html` + `data-assassinscreed-en.js` sont la source,
`node _proto/traduire-assassinscreed.mjs` écrit `e-assassinscreed.html` et
`data-assassinscreed.js`. Publié le 25 août 2026 sous `/assassinscreed` et
`/fr/assassinscreed`. **DC Animation est le cinquième** —
`en-dcanimation.html` + `data-dcanimation-en.js` sont la source,
`node _proto/traduire-dcanimation.mjs` écrit `e-dcanimation.html` et
`data-dcanimation.js`. Publié le 4 septembre 2026 sous `/dcanimation` et
`/fr/dcanimation` : le site compte vingt-huit pages et neuf univers.

`py sync.py check` vérifie ensuite la parité des deux langues.

**Règle absolue : toute modification d'une page racine doit être répliquée dans `/fr/`.**
Elle tient toujours — elle est simplement assurée par la chaîne : on écrit en
français, l'anglais se déduit, et les deux sortent ensemble.

## Charte couleurs

Univers : Star Wars `#4d9fff`, Marvel `#e23636`, DC `#f5c842`, Avatar Legends `#7dd3fc`,
Star Trek `#b48cf2`, The Walking Dead `#a8bf4f`, Dragon Age `#e07b39`,
Assassin's Creed `#c0202f`, DC Animation `#2dd4bf` (branches DCAU `#5aa9f8`,
DCAMU `#c084fc`, Arkhamverse `#4ade80`).
Chaque page pose `data-universe` sur `<body>` (`sw`, `mcu`, `dc`, `avatar`) et `--tl-color`.

**Le quatrième univers s'appelle « Avatar Legends » depuis le 18 août 2026**, pour ne
plus se confondre avec les films de James Cameron. Seul le libellé change : le fichier
reste `avatar.html`, la clé reste `avatar`, l'URL reste `/avatar`. Et rien de ce qui
porte le mot dans une œuvre ne bouge — *Avatar : Le Dernier Maître de l'Air*, les
*Chronicles of the Avatar*, *Team Avatar Tales*, l'Avatar lui-même, l'Avatar Almanac
du radar. Le badge « Avatar Accompli » garde son nom : il joue sur le personnage.
Badges de type : film `#64b5f6`, film animé `#90caf9`, série `#81c784`, série animée `#ce93d8`,
jeu `#ffb74d`, spécial `#ffa726`, vidéo `#f472b6`.
Cases à cocher : `border:2px solid #7e7ea8` + `box-shadow:0 0 0 1px rgba(126,126,168,.25)`.

## Ce que la refonte a remplacé

Les composants partagés d'avant — `cg.css`, `cg-timeline.js`, `cg-dc.js`,
`cg-dossier.js`, `cg-badges-fx.js`, `cg-upcoming.js`, `cg-nav.js`, `progress.css`,
`progress.js`, `intro.css`, `filters.css`, `filters.js`, `anim.js`, `badges.js` —
**ont été supprimés**. Chaque page de la refonte porte son propre CSS et son propre
JS, et `app.js` tient le peu qui est commun.

Ne pas les remettre dans `PRECACHE` de `sw.js` : `addAll` est tout ou rien, et un
seul fichier absent fait échouer l'installation du service worker en entier. Le
hors-ligne disparaît alors sans un mot dans la console.

Les deux conventions qui coexistaient (`.progress-block` / `.prog`,
`.en[data-id]` / `.it`, `.fbt` / `.chip`) n'ont plus cours : la refonte a le sien.
Un script qui cherche encore `.en[data-id]` dans une page ne trouve rien —
et rendra zéro plutôt qu'une erreur.

## Scripts de génération

Tous lisent leur clé TMDB dans la variable d'environnement `TMDB_KEY`
(secret GitHub du même nom). Tous sont rejouables : ils nettoient leur propre bloc
avant de réinjecter. Ils sont deux.

- `runtime.py` — calcule le temps de visionnage par entrée et injecte
  `const RT={id:minutes}`. Workflow `runtime.yml`, déclenchement manuel.
  Il écrit dans **`_proto/data.js`, `_proto/data-mcu.js`, `_proto/data-dc.js`**,
  pas dans les pages : celles-ci sont produites, et une table posée dedans serait
  perdue à la publication suivante. Le workflow enchaîne donc `traduire.mjs` puis
  `publier.mjs` et commite les deux bouts. Avatar n'a pas de table `RT`.
- `radar.py` — radar des sorties, workflow `radar.yml`, une fois par jour
  (`cron: "0 6 * * *"`, soit 8 h à Paris en été, 7 h en hiver). Il n'y a pas
  assez de sorties pour tourner plus souvent.

`dossier.py` et `dossier_i18n.py` ont été **supprimés le 10 août 2026**,
avec leur workflow et leurs deux caches : ils produisaient l'ancien HTML du Dossier et
auraient écrasé `deep-dives/star-wars.html` et `fr/dossiers/star-wars.html`, publiées
depuis `_proto/` depuis la refonte. Rien ne les lançait tout seuls — leur workflow était
en `workflow_dispatch` — mais un clic sur « Run workflow » suffisait, et c'était le seul
vrai risque du dépôt. Les 535 entrées du Dossier vivent dans `_proto/data-dossier-sw.js`,
et c'est là qu'on ajoute. Ne pas les rétablir depuis l'historique git.

### Ce que le radar écarte

`EXCLUDE` porte, par univers, des motifs testés sur « titre + type ». On y trouve
LEGO et les novélisations, et depuis le 5 août 2026 **Batman: Knightfall** : c'est un
film d'animation du Tomorrowverse, hors du périmètre du guide DC, qui suit les
Elseworlds, l'Arrowverse, le DCEU et le DCU. Le motif `\bknightfall\b` attrape les
deux parties annoncées.

Deux exclusions du 13 août 2026. `\bpodcast\b` est dans la clé `*`, donc pour tous
les univers : **Lanterns: The Official Podcast** n'est pas la série Lanterns, c'est
l'émission qui en parle, et TMDB la range parmi les séries — elle arrivait au radar
à côté de la vraie. Aucun des six guides ne suit de podcast. Et côté Star Wars,
`\bthe book of boba fett \d` écarte le **comic** qui adapte la série chapitre par
chapitre : quatre numéros au radar pour une série déjà au guide. Le chiffre suffit à
les distinguer, la série n'en portant pas.

Deux exclusions DC du 13 août 2026, même règle que Knightfall : **Teen Titans
Go!** et **My Adventures with Superman** sont de l'animation télé, hors du
périmètre du guide. Elles sont arrivées avec la lecture des épisodes — DC Studios
produit l'animation aussi, et interroger `air_date` la fait remonter là où la
seule date de première ne la montrait pas.

Retirer une entrée de `radar.json` à la main ne suffit pas : le fichier est régénéré
chaque jour. C'est dans `EXCLUDE` que l'exclusion doit vivre — le JSON n'est nettoyé
en plus que pour ne pas attendre le lendemain.

### Les cinq sources du radar

`source_tmdb` sert six univers sur huit, par **société de production** —
Lucasfilm, Marvel Studios, DC Studios, Avatar Studios, AMC Studios, Ubisoft
Film & Television.

**Dragon Age n'est pas au radar, et c'est délibéré.** Le septième univers est
fait de jeux, de DLC, de romans et de comics : TMDB ne connaît aucun des quatre
comme sortie datée, et interroger Electronic Arts ou BioWare par société
ramènerait le catalogue EA entier. Il faudrait une cinquième source — RAWG, dont
la page porte déjà la clé — et il n'y a rien à annoncer : *The Veilguard* est
sorti, rien n'est daté après lui. La page publie donc sa timeline sans entrer au
radar, et l'accroche de « À venir » continue de n'énumérer que les six univers
que le radar suit.
`source_avatar_almanac` y ajoute l'écrit, que TMDB ne couvre pas, et
`source_wookieepedia` la timeline des médias canon Star Wars.

**DC Animation n'est pas au radar non plus, publié le 4 septembre 2026.**
Ses trois continuités sont closes — le DCAU s'est terminé en 2019, le DCAMU
en 2020, et l'Arkhamverse n'a rien d'annoncé après *Arkham Shadow*. Le studio
qui les porte est déjà interrogé par la colonne DC, et ce qu'il annonce
aujourd'hui appartient au DCU, pas à ces trois-là. La page publie donc sa
timeline sans entrer au radar, comme Dragon Age, et l'accroche de « À venir »
continue de n'énumérer que les six univers que le radar suit.

**Assassin's Creed est au radar depuis le 25 août 2026, et sa colonne est vide.**
C'est voulu, et ce n'est pas le cas de Dragon Age : la saga a bien sept œuvres
annoncées — Hexe, Invictus, Jade, le jeu mobile Netflix et les trois séries —
mais **aucune n'a de date**. `main()` écarte les entrées sans date, et
`e-a-venir.html` n'affiche de colonne et de bouton de filtre que pour un univers
qui a au moins une carte : la colonne paraîtra donc toute seule le jour où une
date tombera. Rien à rebrancher à ce moment-là — sauf l'accroche, voir plus bas.

Deux sources pour lui, et une troisième qui n'en est pas une :

- **`source_assassinscreed`** lit la section « Upcoming Assassin's Creed
  releases » du blog de Kulurak sur le wiki Assassin's Creed, par l'API
  MediaWiki standard — celle de Fandom, `/api/v1`, répond 403, comme pour
  Wookieepedia. Le tableau donne la date, un code de type (VG, MG, F, B, C) et
  le titre entre `''`. Trois lignes désignent leur page par une **redirection**
  (« Hexe » pour « Codename Hexe ») : `ac_intros` reporte le contenu du titre
  d'arrivée sur celui de départ, sans quoi ces trois-là sortaient sans synopsis.
  Et `fill_wiki_synopses` ne sert pas ici : elle interroge starwars.fandom.com
  en dur.
- **`source_tmdb`**, qui connaît la série Netflix (`tv/209962`) mais **sans date
  de première** : `/discover` filtre sur `first_air_date` et ne la voit donc pas.
  Elle arrivera d'elle-même le jour où Netflix en annoncera une.
  `UNIVERS_TITRE["assassinscreed"]` exige `\bassassin.?s creed\b` — l'apostrophe
  est facultative, TMDB écrit les deux — parce qu'« Ubisoft » tout court ramène
  Rayman Minis, Splinter Cell: Deathwatch, Side Quest et Mythic Quest. Même
  garde-fou qu'Avatar et The Walking Dead.
- **IMDb n'est pas lisible par un script.** La fiche de la série existe
  (`tt13363220`, TMDB la désigne), mais imdb.com répond **202 et une page vide**
  — un mur anti-robot AWS WAF — à toute requête, même avec un user-agent de
  navigateur, et une IP de GitHub Actions n'arrangerait rien. Ne pas le
  reproposer : TMDB porte la même fiche, avec les dates par pays, les synopsis
  dans les deux langues et l'affiche.

**The Walking Dead a le même garde-fou, pour la même raison.** AMC Studios,
AMC Networks et Skybound portent aussi Mad Men, Breaking Bad et Interview with
the Vampire : sans motif de titre, la lecture des épisodes ramènerait la grille
AMC entière. `UNIVERS_TITRE["twd"]` exige `\bwalking dead\b`, et les quinze
œuvres de la timeline le disent toutes — « Fear the… », « Tales of the… »,
« The Walking Dead: Dead City ».

`source_startrek` est la quatrième, et elle passe elle aussi par **TMDB** depuis le
13 août 2026. Elle interrogeait Memory Alpha, faute de savoir isoler la franchise :
Paramount produit tout le reste du catalogue, et chercher par société aurait ramené
le cinéma entier. Mais un guide qui ne suit que des films et des séries n'a rien à
aller chercher dans un wiki — TMDB les connaît mieux, avec les dates par pays, les
synopsis dans les deux langues et le découpage en épisodes que le portail annonçait
à la main, une semaine à la fois. Ce que Memory Alpha donnait en plus — coffrets
Blu-ray, comics IDW, romans — est justement ce que le guide écarte.

La franchise se retrouve de deux façons, réunies puis dédoublonnées par `main()` :
le **mot-clé TMDB** « star trek », résolu dynamiquement comme les sociétés le sont,
et la **recherche par titre**, parce qu'une annonce fraîche arrive souvent avant que
quiconque ait posé le mot-clé sur sa fiche. La recherche par titre exige que le
titre commence par « Star Trek » — sans quoi elle ramène les documentaires et les
hommages, et « The Center Seat: 55 Years of Star Trek » n'est pas un épisode.

**`ST_TITRE` vaut aussi pour les séries en diffusion.** Le mot-clé TMDB est posé
par les contributeurs sur tout ce qui *parle* de la franchise, pas seulement sur
ce qui *en est* : le 13 août 2026, il a rapporté vingt et un épisodes de
« A Captain's Log », une émission d'entretiens, sous la bannière Star Trek. Le
motif `\bpodcast\b` de la clé `*` ne l'attrapait pas — son titre ne le dit pas.
C'est donc le titre qui tranche, à l'entrée du chemin « hors catalogue », comme
`UNIVERS_TITRE` le fait pour Avatar. Une série de la franchise s'est toujours
appelée « Star Trek: quelque chose ».

### Les épisodes, semaine par semaine

Une série qui diffuse n'est plus une sortie : sa date de première est passée, et
`/discover`, qui filtre sur `first_air_date`, ne la voit donc plus. Ses épisodes,
eux, sortent chaque semaine — et c'est ce qu'un radar doit annoncer. Les cinq
univers les ont depuis le **13 août 2026** ; seul Star Trek en avait, et
`TRACKED_SHOWS`, la liste d'ids à tenir à la main, a disparu avec.

Trois fonctions, partagées par `source_tmdb` et `source_startrek` :

- `tmdb_series_qui_diffusent()` — le seul filtre de `/discover/tv` qui retrouve
  une série au milieu de sa saison est **`air_date`**, qui porte sur les épisodes
  là où `first_air_date` porte sur la série. Le paramètre `cle` vaut
  `with_companies` pour les quatre univers qui se désignent par leur studio, et
  `with_keywords` pour Star Trek, que Paramount ne suffit pas à isoler.
- `tmdb_saison()` — la saison dans les deux langues, appariée par **numéro
  d'épisode**, jamais par rang dans la liste.
- `tmdb_episodes()` — la fiche de la série donne la saison en cours
  (`next_episode_to_air`), puis la saison entière rend la grille sur plusieurs
  semaines au lieu du seul épisode suivant. *The Original Series* n'a pas de
  prochain épisode, et la fiche est le seul endroit qui le dise.

**L'âge d'une série ne dit rien de ce qu'elle a encore à sortir.** Star Trek
n'appelait `tmdb_episodes()` que pour les séries dont la première avait moins de
trois ans, `ST_FRAICHEUR`, pour s'épargner des fiches. Ce filtre a fait tomber
l'univers entier au premier vrai passage, le 13 août 2026 : « 0 film(s),
0 série(s), 0 épisode(s) — 27 fiche(s) série lues », et une colonne « Rien à
venir » au radar. *Strange New Worlds* a débuté en 2022 et diffuse aujourd'hui ;
la fenêtre la jetait, ainsi que tout ce qui dure. `ST_FRAICHEUR` a été retiré —
le catalogue tient en une trentaine de fiches, on les demande toutes, et
`tmdb_series_qui_diffusent()` par mot-clé complète pour les séries qui ne
commencent pas par « Star Trek ». Ne pas remettre de fenêtre comptée depuis la
première : c'est `next_episode_to_air` qui répond, rien d'autre.

**Le titre d'une carte d'épisode est celui de la série, et rien d'autre.** La
saison et le numéro sont dans `ep`, et la page les écrit sous le nom. Accrocher
le titre de l'épisode donnait deux cartes qui ne se ressemblaient pas : l'anglais
rendait `Teen Titans Go! — "Teen Titans Go to the Repair Shop (1)"`, le français
`Teen Titans Go! — « Épisode 45 »`, TMDB n'ayant pas traduit le titre. `S9E45`
s'écrit pareil des deux côtés. Le dédoublonnage de `main()` porte donc aussi sur
`ep.s` / `ep.e` : sur le seul titre, une saison entière se réduirait à une carte.

**`UNIVERS_TITRE` est né de là.** Le filtre par société ne suffit plus dès qu'on
interroge `air_date` : **Nickelodeon Animation Studio produit tout le catalogue de
la chaîne**, et il est dans la liste d'Avatar parce qu'« Avatar Studios » seul ne
porte pas *Seven Havens*. Tant que le radar ne demandait que les séries dont la
première est à venir, ça ne se voyait pas — il y en a peu. Le premier passage a
ramené douze épisodes de *SpongeBob SquarePants*, *The Patrick Star Show* et
*Rock, Paper, Scissors* au radar Avatar. Le titre doit maintenant répondre à
`\b(avatar|korra|aang|airbender)\b`, et il est jugé **avant** que la fiche soit
demandée — une fiche coûte trois requêtes. Lucasfilm, Marvel Studios et DC Studios
ne désignent qu'un univers : eux n'ont pas de garde-fou. C'est la même idée que
`ST_TITRE`, que Star Trek applique à sa recherche par titre.

Chaque épisode porte `ep:{s,e,mark}`, et cette clé n'existe que là — la poser à
`null` sur les huit cents autres entrées n'apprendrait rien à la page. `mark` vaut
`premiere` au premier épisode, `finale` au dernier, `saison` quand la saison sort
d'un bloc, et `""` entre les deux. La page en tire une pastille à contour : verte
avec un triangle, orange avec un drapeau, bleue avec trois barres, et le numéro
écrit `S2E05` dans les deux langues.

**Une saison qui tombe d'un bloc n'est pas treize sorties, c'en est une.**
*Avatar: Seven Havens* lâche ses treize épisodes le 09/10 ; sans regroupement, la
journée comptait treize cartes au même nom que seul leur numéro distinguait.
`tmdb_episodes()` n'en rend alors qu'une, avec `e:0` — la saison entière n'a pas
de numéro d'épisode, et la page s'arrête à « S1 ». Deux garde-fous : il faut au
moins deux épisodes, et la saison doit être **complète** au sens d'`episode_count`
— quatre épisodes du même jour sur treize sont un lot, pas une saison. Si le bloc
tombe le jour de la première, rien n'est ajouté : c'est la carte de la série qui
reçoit le repère.

Deux pièges qui ont chacun leur garde-fou dans `tmdb_episodes()` :

- **Une saison n'est pas toujours listée en entier.** Si TMDB annonce dix épisodes
  et n'en donne que quatre, le dernier connu est un épisode du milieu, et il
  sortirait marqué « finale ». Le repère n'est posé que si `episode_count` de la
  fiche vaut le nombre d'épisodes rendus.
- **Une série neuve s'annonce deux fois.** Elle arrive par `first_air_date` comme
  « Série », et son S1E1 arrive par `air_date` le même jour et sous le même nom :
  deux cartes pour une seule sortie. `sauf_le` écarte l'épisode qui tombe le jour
  de la première. Mais **son repère n'existait que sur la carte écartée** : la
  carte qui reste était la seule du radar à ne rien dire de son rang, et
  « Lanterns » s'annonçait sans sa mention « Première ». La carte d'une série
  porte donc `PREMIERE` d'emblée — les deux `/discover/tv` filtrent sur
  `first_air_date`, qui est par définition le jour du premier épisode, et le
  repère est connu sans rien demander de plus. `tmdb_episodes` l'affine ensuite
  en rendant `(compte, repère du premier)`, ce qui ne sert que si TMDB a la
  grille : *Avatar: Seven Havens* et *VisionQuest* n'ont pas encore la leur.

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

### Les affiches, posées le 19 août 2026

`add()` prend un `poster`, et les quatre appels TMDB — les deux de
`source_tmdb`, celui des films de `source_startrek`, les deux de
`tmdb_episodes` — y passent `poster_path`. Les épisodes reprennent l'affiche de
leur série : TMDB donne bien une vignette par épisode (`still_path`), mais une
image de plateau ne se reconnaît pas au vol là où une affiche se reconnaît.

Trois choses à savoir :

- **On stocke le chemin nu** (`/8Vt6.jpg`), jamais l'URL. La page compose
  `https://image.tmdb.org/t/p/w342` + le chemin, et choisit donc sa taille sans
  qu'on regénère le radar. `radar.json` tient en 28 Ko ; vingt-cinq URL
  entières le gonfleraient pour rien.
- **La clé est absente quand il n'y a pas d'affiche**, comme `ep`. Wookieepedia
  et l'Avatar Almanac n'en ont aucune — 19 des 44 sorties, les comics Star Wars
  et les romans Avatar. La carte n'affiche alors rien du tout.
- **La règle « WebP local ×4 » ne s'applique pas ici.** Ces images restent chez
  TMDB : le radar est régénéré chaque jour, et rapatrier vingt-cinq fichiers
  quotidiens ferait grossir le dépôt sans fin. Le ×4 vaut quand même pour la
  taille demandée — 82 px de rendu, donc `w342`, le palier TMDB juste au-dessus
  de 328.

**Côté page, l'affiche n'existe qu'une fois la carte ouverte.** Elle est dans le
corps du `<details>`, à gauche du synopsis, et `row()` ne pose qu'un
`<span class="po" data-po="…">` vide : c'est un `toggle` capté sur `#cal` qui
écrit le `<img>`, une seule fois.

`loading="lazy"` ne suffisait pas, et c'est le piège : **un `<img>` dans un
`<details>` fermé est chargé quand même** dès que sa ligne est à l'écran. Vérifié
au navigateur — vingt-cinq affiches, près d'un mégaoctet, sur une page où la
plupart des cartes restent repliées. L'événement `toggle` ne remonte pas : il se
capte (`addEventListener('toggle', …, true)`).

Le radar n'aura ses affiches qu'au prochain passage de `radar.yml` (cron 6 h UTC,
ou « Run workflow »). D'ici là les cartes s'ouvrent comme avant, sans image.

### La fiche TMDB, posée le 19 août 2026

L'affiche seule ne disait rien de plus que le titre. La carte ouverte porte
maintenant la bande des six pages d'univers : synopsis, année, deux genres,
note et bande-annonce. `add()` prend un `tmdb` (l'identifiant) et un `media`
(`movie` ou `tv`, le segment d'URL de l'API), posés par les cinq mêmes appels
que `poster` ; 25 des 44 sorties en ont, les 19 autres venant de Wookieepedia
et de l'Avatar Almanac.

**Rien d'autre n'est stocké, et c'est délibéré.** La note bouge avec les votes,
la bande-annonce paraît quand elle paraît : les figer dans un fichier régénéré
chaque nuit ne les tiendrait pas plus à jour que l'appel direct, et
`radar.json` porterait quarante fiches dont on n'ouvre qu'une poignée. La page
appelle donc TMDB elle-même à l'ouverture (`ficheTmdb`), avec la clé publique
déjà présente dans les douze `data-*.js` du site. Deux requêtes, une troisième
pour un épisode.

**La disposition est celle des six pages d'univers, au pixel près** : les
quatre mesures sur une ligne — `<strong>Année</strong> 2026`, Genre, Note,
Période — et la bande-annonce en dessous, seule. Une même donnée doit se lire
au même endroit d'une page à l'autre. Seule l'encre du bouton change : les
pages d'univers n'en ont qu'une, le radar en aligne six, et `var(--c)` porte
celle de la ligne.

La **Période** est la seule mesure que TMDB ne donne pas : elle vient de la
pastille `.era` de l'en-tête, lue dans le DOM plutôt que portée deux fois. Ne
pas s'étonner de ne la voir nulle part — seul Wookieepedia pose une ère, et ses
entrées n'ont pas de fiche TMDB. La mesure attend celle qui en aura une.

Quatre points qui ont demandé un arbitrage :

- **Le synopsis d'épisode passe avant celui de la série, mais pas avant
  l'anglais déjà là.** Douze des vingt épisodes du radar n'ont aucun synopsis
  chez TMDB, et aucun n'en a en français. Strange New Worlds S4E5 a le sien en
  anglais dans `radar.json` : « une panne de téléporteur change tout l'équipage
  en marionnettes » apprend plus que le pitch de la série, et il est conservé
  avec son badge EN. La série ne reprend la main que si la carte n'avait rien —
  Lanterns S1E2, par exemple — ou s'il ne s'agit pas d'un épisode, où c'est la
  même fiche, mieux traduite.
- **Les deux tiennent, l'épisode d'abord.** Le résumé de la série revient sous
  celui de l'épisode, sous l'intitulé « La série », plus petit et plus pâle :
  qui arrive au radar sans connaître Strange New Worlds n'avait rien pour la
  situer. Rien n'est ajouté quand la carte affiche déjà le résumé de la série.
- **Une œuvre pas encore sortie n'a pas de votes.** TMDB rend `0`, et
  « ★ 0.0/10 » se lit comme un jugement là où c'est un silence : la pastille
  n'est posée que si la note existe. Clayface n'en a pas, Lanterns si.
- **Sous 560 px, la bande passe sous l'affiche.** La colonne de texte fait
  170 px : les mesures s'y empilaient une par ligne, et la carte ouverte
  gagnait cent pixels. `.bd` devient une grille, `.inf` s'efface en
  `display:contents`, `.syn` reste en colonne 2 et `.ser`, `.tm`, `.tr`
  prennent `grid-column:1/-1`. Le bouton a besoin en plus de
  `justify-self:start` : un `inline-block` devenu item de grille s'étire sur
  toute la colonne, et son biseau partait à deux cents pixels de son texte.

Tout cela vit dans un bloc `i18n-off` : les deux libellés (« Bande-annonce » /
« Trailer ») sont choisis à l'exécution, comme les noms de mois.

## Les deux parcours

Star Wars et Marvel ont deux ordres de lecture depuis la refonte, Dragon Age
un troisième depuis le **26 août 2026** : la découverte, et la reprise. La
question se pose une fois à l'arrivée (`dialog.ask`), la bascule vit ensuite
sous le bouton d'entrée (`.par`), et le choix est retenu dans
`localStorage` sous `<clé de la page>-mode`. Le second ordre s'écrit dans
l'URL par un hash — `#rewatch` chez les deux premiers, **`#replay` chez
Dragon Age** : on y rejoue, on n'y revoit pas. La découverte reste le
parcours de base, sans hash : c'est le lien qu'on partage.

Le second ordre vit dans les données, à côté de `eras` : `erasRewatch` pour
Star Wars et Marvel, `erasReplay` pour Dragon Age. **Il ne recopie presque
aucune entrée** — chaque ligne est un `{ref:"<id>"}`, et `drop` retire ce
qui n'a plus lieu d'être une fois l'œuvre remise dans l'ordre du monde : le
repère `tags` du flashback, la FAQ « pourquoi ici », la note de placement de
Leliana's Song. Chez Dragon Age les cinq ères ne sont pas répétées non plus
— `resolve()` les reprend par leur rang. `ref`, `drop` et `covers` sont dans
`TECHNIQUES` de `traduire-dragonage.mjs` : « tags » ou « faq.read » traduits
ne retireraient plus rien.

Quatre choses à savoir :

- **Une entrée ajoutée à `eras` ne paraît pas dans le second parcours.**
  Elle n'y a pas de `ref`, et rien ne le signale : la page se charge, la
  console reste vide, et l'œuvre manque à qui rejoue. C'est le contrôle à
  faire à chaque ajout.
- **Dragon Age n'a qu'un seul `covers`, et il recolle Origins.** Leliana's
  Song passait entre `da-origins-2` et `da-origins-3` ; le flashback remonté
  au début, les deux segments devenaient deux cartes identiques côte à côte.
  Le rejeu les remplace par `da-r-origins-mid`, qui les couvre tous les deux
  et porte sa propre note, « Early to endgame ». D'où **43 entrées en rejeu
  contre 44 en découverte** — `s-tot`, `fcount` et le HUD sont recalculés
  depuis `ALL`, il n'y a rien à corriger à la main.
- **Le pont de progression tient les deux sens.** `COVERS` / `COVERED`,
  `bridge()` au clic et `bootBridge()` au chargement et à l'import : cocher
  la carte recollée coche les deux segments, décocher l'un des deux la
  décoche. C'est ce qui garde les cinq badges vrais dans les deux parcours —
  `da_warden` nomme `da-origins-2` et `da-origins-3`, qui n'existent pas
  en rejeu. Pas de `markId()` en revanche : les badges de Dragon Age listent
  leurs entrées eux-mêmes (`trigger:"oeuvre"`), là où Star Wars nomme la
  dernière d'une ère.
- **Le seul texte d'`erasReplay` est cette note-là.** Tout le reste n'est
  qu'identifiants : une entrée du rejeu hérite de celle qu'elle référence,
  titre et résumé compris.

## Les colonnes parallèles sous 1440 px

DC est le seul univers à colonnes, et depuis le **2 septembre 2026** elles ne
glissent plus : **une branche à la fois, choisie aux onglets.** La règle vaut
telle quelle pour tout dossier multi-colonnes qu'on ajouterait.

Ce qui l'a imposée est une mesure. Le carrousel mettait les quatre colonnes
dans une seule ligne flex, donc **la plus haute donnait sa hauteur à la bande** :
sur « Les origines », la grille faisait 15 486 px, l'Arrowverse en occupait
15 478 et « Origines de Superman » 851. Choisir Superman sur un téléphone,
c'était trois fiches puis quatorze mille pixels de rien — et l'onglet pour en
sortir était resté tout en haut. La bande fait maintenant la hauteur de la
branche qu'on lit.

Le parallélisme n'est pas perdu : il est dit par les onglets, quatre noms côte
à côte en permanence avec le décompte de chacun, là où le carrousel le disait
par un morceau de colonne coupé au bord.

Sept choses à savoir :

- **La borne est 1440, pas 820.** Le carrousel de la tranche 821-1439 avait le
  même défaut à la même hauteur — montrer deux colonnes au lieu d'une ne change
  rien au vide des trois autres. Bornes décimales (`1439.98`), pour la raison
  déjà dite ailleurs : la largeur de fenêtre n'est pas entière. **`MOB` en JS et
  la requête média doivent porter la même valeur.**
- **`.col.on:not([hidden])`, et le `:not` n'est pas une précaution.** `.on` a
  plus de poids que le `.col[hidden]` du filtre : sans lui, une branche décochée
  revenait à l'écran dès qu'elle était l'onglet actif. Même famille de piège que
  `.ztabs button[hidden]{display:none}`, sans quoi l'onglet d'une branche
  décochée restait cliquable — **un attribut `hidden` ne suffit jamais ici.**
- **On arrive sur la branche la plus fournie, par décompte.** Pas sur la
  première, qui n'a que trois fiches, et pas sur un rang écrit à la main. Les
  deux zones tombent sur l'Arrowverse, et la règle tient pour une zone ajoutée.
- **Les onglets sont collants dans leur bande**, pas dans la page :
  `position:sticky` sur un élément du corps de la zone se décroche seul quand
  la zone sort de l'écran. C'est ce qui permet de changer de branche depuis
  n'importe quelle profondeur.
- **`--stick` se mesure, il ne s'écrit pas.** C'est le bas de la barre de
  filtres **une fois collée** (`getComputedStyle(sieve).top + hauteur`), pas la
  somme des deux hauteurs : la barre se colle à 63 alors que le bandeau en fait
  64, et la somme laissait un pixel de fente où les fiches défilaient. Elle vaut
  59 px à 375, 47 à 1000, et **48 au premier rendu contre 59 une fois Big
  Shoulders chargée** — d'où le `ResizeObserver`, qui couvre les polices, le
  redimensionnement et le panneau déplié sans rien savoir de la cause. Une ombre
  haute de 8 px bouche ce qu'un demi-pixel laisserait encore passer.
- **Le glissement est rendu, sur la commutation.** Trois garde-fous, chacun né
  d'un faux positif : plus horizontal que vertical (un défilement de lecture
  oblique changeait de branche), plus de 55 px, moins de 700 ms. Tout en
  `passive` — on ne prend jamais la main sur le défilement vertical. Il saute
  les branches décochées et ne boucle pas au bout.
- **Rejoindre une entrée demande d'ouvrir sa branche d'abord.** « Reprendre »,
  l'ancre de l'URL et les badges visent un identifiant, pas une branche : sans
  ce détour (`reveal`), on défilait jusqu'à une entrée qui n'est pas à l'écran.

La phrase d'aide vit dans le `T` local de `e-dc.html` (vouvoiement) et sa
traduction dans `TRADUCTIONS` de `traduire-pages.mjs`, pas dans `CG.t.swipe` :
celui-ci sert les autres pages, et le renommer serait le piège du lexique.

## Synchronisation FR/EN

`sync.py` sert la règle absolue ci-dessus. Contrairement aux scripts de génération,
il n'utilise pas `TMDB_KEY` et aucune action ne le lance : il s'appelle à la main.
L'interpréteur est `py` sur la machine de Niko, pas `python`.

- `py sync.py check` — vérifie les quatorze paires : même nombre de lignes dans
  le HTML, mêmes identifiants dans les données. Les quatorze clés sont `sw`,
  `mcu`, `dc`, `avatar`, `startrek`, `twd`, `dragonage`, `assassinscreed`,
  `dcanimation`, `dossier`, `news`, `accueil`, `avenir`, `dossiers`.
- `py sync.py show <page> <id>` — affiche une entrée dans les deux langues sans
  ouvrir les fichiers entiers.
- `py sync.py mirror <page> "<ancien>" "<nouveau>"` — remplace dans le proto
  français, et rappelle les commandes à relancer pour propager.

**Une page ne porte plus ses entrées** : elle charge `data/<nom>-<langue>.js`. Le
contrôle regarde donc deux couples à la fois. Chercher les entrées dans le HTML ne
rendait pas d'erreur — il rendait zéro de chaque côté, et « 0 (aligne) » passait
pour un feu vert. C'est le mode de défaillance propre à ce projet ; le script
signale maintenant « LECTURE VIDE » plutôt que de compter zéro contre zéro.

Le compte affiché est celui de **tous** les identifiants du fichier, badges et
descripteur d'univers compris : 70 pour Star Wars, pas 61. Ne restreindre au bloc
`eras` que si on trouve mieux qu'un découpage par ligne — le français tient sur une
ligne, l'anglais est indenté, et la même donnée ressortait à 71 d'un côté et 69 de
l'autre. Un contrôle de parité ne doit pas dépendre de la mise en forme. Les
chiffres d'entrées réels se comptent dans les données, pas ici.

`mirror` écrit dans le proto source, plus dans les deux fichiers publiés. Écrire
dans ce qui est produit se perdrait à la publication suivante, sans erreur et sans
message. Le proto source est le français partout, **sauf les cinq chaînes
inversées** — Star Trek, The Walking Dead, Dragon Age, Assassin's Creed et
DC Animation — dont `langue_source` vaut `en` : écrire dans `e-startrek.html` serait écrasé au
prochain `traduire-startrek.mjs`. Le journal des Nouveautés n'a pas
d'identifiants : ses cartes se comptent au titre.

Lecture / écriture avec `newline=""` : sans ça Python retraduit CRLF en LF et
réécrit les fichiers entiers alors que le dépôt les stocke en LF.

## La version anglaise de la refonte

Deux scripts Node produisent les fichiers `en-*` de `_proto/` à partir des `e-*`.
**Ils ne traduisent pas : ils retrouvent.** La racine du site était déjà anglaise et
`/fr/` française, tenues à parité ; la refonte ayant extrait ses données du
français, l'anglais correspondant était déjà écrit, relu et en ligne. Le retraduire
ferait diverger deux textes qui doivent rester le même.

**Cet anglais-là est maintenant figé dans `_proto/reference/`.** Les scripts le
lisaient dans les pages du site ; la publication de la refonte les a remplacées par
sa propre sortie, et un script qui se relit lui-même ne retrouve plus rien.
`traduire.mjs` levait d'ailleurs `Cannot read properties of undefined (reading
'eras')`, le Dossier ne posant plus ses items dans `window.CG_DATA`. Le dossier de
référence contient les seize pages telles qu'elles étaient la veille, avec le
pourquoi dans son `LISEZ-MOI.md`. **Ne jamais le régénérer depuis le site.**

- `node _proto/traduire.mjs` — les six `data-*-en.js`. Les entrées de timeline et
  les items du Dossier portent le même `id` des deux côtés : on lit le champ
  homologue de l'entrée anglaise. Ce qui n'a pas d'identifiant — libellés, titres
  d'ères, colonnes DC — passe par un lexique bâti en lisant les deux pages de prod
  en parallèle. 994 entrées, 597 items, 109 libellés.
- `node _proto/traduire-pages.mjs` — les neuf `en-*.html`. Même principe appliqué au
  HTML, le lexique venant cette fois du parallélisme **ligne à ligne** des pages de
  prod, celui-là même sur lequel `sync.py` s'appuie.
- `node _proto/cabler-nav.mjs` — remplace les `href="#"` morts des protos par leur
  cible. Les maquettes avaient gardé des liens de démonstration : depuis l'accueil,
  aucun univers n'était cliquable ; depuis Star Wars, ni Marvel ni DC. Un `#` ne
  reste volontaire que sur la page courante, et il porte alors `aria-current="page"`
  — c'est la marque à laquelle on reconnaît celui qui n'est pas un oubli.

  **Le script n'avait regardé que le menu, pas le pied de page.** Corrigé le
  18 août 2026 : quarante liens morts y dormaient depuis la refonte, deux par
  page. Le lien de la mention légale (`© 2026 Chronologeek — chronologeek.app`)
  ne conduisait nulle part sur les vingt-quatre alors publiées ; il pointe maintenant l'accueil de
  sa langue. Et la liste « Timelines » désignait la page courante par un `#` nu,
  sans `aria-current` — seul le pied de page d'Avatar Legends était conforme, et
  c'est son écriture qui a servi de modèle aux huit autres. Rien ne cassait : un
  `#` fait remonter en haut, ce qui ressemble assez à une page qui répond.
- `node _proto/relecture.mjs` — regroupe dans `A-RELIRE-EN.md` les seules phrases
  qu'il a fallu écrire, contre plusieurs milliers reprises telles quelles. **Ce
  fichier et les trois JSON dont il sort ne sont plus versionnés** (voir
  `.gitignore`) : Niko ne relit pas un document, il ouvre le proto anglais au
  navigateur et valide ou non. Le script reste, sa sortie est locale.
- `node _proto/traduire-startrek.mjs` — l'un des deux qui traduisent dans l'autre
  sens : `e-startrek.html` et `data-startrek.js` depuis les fichiers anglais, qui
  sont la source. Voir « Star Trek, la chaîne inversée ».
- `node _proto/traduire-twd.mjs` — l'autre, pour The Walking Dead. Même script à
  quelques lignes près, et une différence qui compte : **Star Trek fait partie de
  ses paires de pages**. La page TWD est bâtie sur la sienne, et c'est de loin ce
  qui rend le plus — 1 808 textes retrouvés, 42 emplois de 39 phrases écrites,
  zéro manque. Ce qui reste à écrire vit dans `traductions-twd.mjs` : l'accroche,
  les trois repères de lecture, les quatorze phases et les cinq badges. Les quinze
  œuvres, elles, gardent leur titre — aucune n'a de titre français.
- `node _proto/publier.mjs` — pose les vingt-huit pages, `/data/` et `app.js`. Voir
  « La publication » plus bas.

Les quatre premiers acceptent `--check`, qui n'écrit rien et affiche le bilan.
**Ne jamais éditer un fichier `en-*` à la main** : corriger la table `TRADUCTIONS`
du script concerné, puis relancer.

## La publication

`node _proto/publier.mjs` fait cinq choses, et rien d'autre.

**1. Le référencement.** Les protos n'ont aucune des lignes que portent les pages
en ligne — canonique, `hreflang`, Open Graph, Twitter Card, description — et ils
posent `noindex`. Les recopier tels quels aurait effacé le référencement de
vingt-huit pages : rien n'aurait cassé, la console serait restée vide, et le site
aurait disparu des résultats. Ces textes vivent dans **`_proto/seo.json`**, extrait
une fois des pages d'avant la refonte, avec Avatar écrit à la main faute de page à
reprendre. Le script ne les relit pas dans les pages publiées : celles-ci sont sa
sortie, et la boucle aurait marché sans que rien ne dise d'où venait la valeur.

**`og:locale` ne vient pas de `seo.json`, il se déduit de la langue.** Posé le
18 août 2026, avec `og:locale:alternate` qui désigne l'autre version — les
`hreflang` le disaient aux moteurs depuis toujours, les partages sociaux ne le
disaient à personne. La table `LOCALES` tient les deux valeurs (`fr_FR`,
`en_US`) et `blocSeo()` reçoit désormais `langue` : rien à écrire par page, rien
à tenir à jour. Un neuvième univers n'y entre pas, une troisième **langue** si.
Le garde-fou vérifie les deux balises dans chaque page produite, à côté de celui
du `<title>`.

**2. Les liens.** `e-marvel.html` devient `/marvel`, et les scripts prennent leur
nom de production. Ça vaut aussi **dans les données** : `data-news.js` pose
`href:"e-marvel.html#mcu-smbnd"` sur chaque carte du journal, et ce lien-là n'est
écrit dans le DOM qu'au chargement. Ne recâbler que le HTML laissait seize liens
morts qu'aucune lecture de page ne montre.

**3. La PWA et l'audience.** Manifeste, icônes, `theme-color`, `pwa.js`,
GoatCounter : les protos n'en avaient rien.

**4. L'échafaudage de maquette.** L'accueil et la liste des Dossiers portent un
bouton « proto : simuler une progression » qui remplit le HUD de valeurs
inventées, pour qu'on puisse voir la page autrement qu'à zéro. Il était en
production sur les quatre pages produites depuis `e-accueil.html` et
`e-dossiers.html` — la publication recopiait le proto tel quel.

Ce n'est pas un bloc mais **cinq zones disjointes** par page : la règle CSS
`.demo`, le bouton du pied de page, `var fake=null;`, la dérivation
`if(fake) return …` posée au milieu du vrai calcul, et le gestionnaire de clic.
Les deux dernières sont solidaires du bouton : le retirer sans son gestionnaire
ferait lever `addEventListener of null`, `paint()` ne tournerait jamais, et le
HUD resterait à zéro sans une ligne dans la console.

D'où des **marqueurs posés dans le proto** plutôt que des motifs devinés dans le
script — `echafaudage-debut` / `echafaudage-fin`, dans un commentaire HTML, CSS
ou JS selon l'endroit, même geste que les `i18n-off` / `i18n-on` de
`traduire-pages.mjs`. Celui-ci ne touche ni au CSS ni aux commentaires : les
marqueurs traversent la génération de l'anglais sans qu'on ait à les reposer
dans les `en-*`. Ils tiennent tous sur des lignes existantes, pour que
`py sync.py check` continue de voir le même nombre de lignes des deux côtés.

Le garde-fou est dans `TRACES` : la publication sort en erreur si `class="demo"`,
`id="demo"`, `getElementById('demo')`, une règle `.demo`, `var fake` ou un
marqueur non apparié survit dans une page produite. Le bilan annonce le nombre
de blocs retirés par page — cinq sur chacune des quatre — parce qu'un retrait
qui échoue en silence est exactement ce qu'on cherche à empêcher.

Tout nouvel échafaudage se pose donc entre marqueurs, et rien n'est à changer
dans `publier.mjs`.

**5. Les données structurées**, depuis le 18 août 2026, dans `_proto/jsonld.mjs`.
Trois blocs, jamais plus : `WebSite` sur les deux accueils, `BreadcrumbList` sur
les vingt-six autres pages, `ItemList` sur les neuf univers, la liste des
Dossiers et l'accueil. Chaque entrée de timeline y est un `Movie`, une
`TVSeries`, un `Book`, un `ComicStory`, un `VideoGame` ou un `VideoObject`, avec
son ancre (`/dc#dcu-lanterns`), son nom et son visuel — plus son `isbn` quand
c'est un livre. 742 éléments par langue, 765 en comptant les fils d'Ariane.

Le script lit les mêmes `_proto/data*.js` que la publication copie dans
`/data/` : la donnée structurée et la donnée affichée ne peuvent pas diverger.

Six choses à savoir :

- **`type` passe avant `media`, et c'est tout le piège.** `media` ne dit pas ce
  qu'est l'œuvre, il dit quelle fiche TMDB la page ouvrira : les trente-quatre
  romans et comics d'Avatar portent `media:"tv"` parce qu'ils empruntent le
  visuel de la série. Lu dans l'autre sens, *Le Cycle de Kyoshi* ressortait en
  `TVSeries`. L'écrit se reconnaît à son `type` ; `media` reprend la main pour
  tout le reste, où il est plus sûr que des vocabulaires qui ne s'alignent pas
  d'une page à l'autre.
- **Le Dossier n'a pas d'`ItemList`, et c'est délibéré.** Ses 535 œuvres
  pesaient 10 Ko brotli et faisaient passer la page de 65 à 168 Ko de HTML brut
  — la plus lourde du site — pour un gain nul : Google ne fait pas de carrousel
  de livres. Il garde son fil d'Ariane. Ne pas la rétablir sans une raison qui
  vaille ce poids. Le reste coûte +1 à +2,7 Ko brotli par page, +14 Ko sur douze.
- **`CG.t.nav` ne porte que quatre univers.** Star Trek, The Walking Dead,
  Dragon Age et Assassin's Creed sont sous « Plus d'univers » et n'y ont pas
  tous de clé : sans repli sur le `title` de leurs données, leur fil d'Ariane
  annoncerait « startrek », « twd », « dragonage » et « assassinscreed ».
- **`dlc` et `video` se rangent avant `media`, comme l'écrit.** Les quinze DLC de
  Dragon Age et sa vidéo YouTube portent `media:"tv"` faute de fiche à eux : lus
  dans l'autre sens, ils ressortaient en `TVSeries`. C'est exactement le piège du
  premier point, sur deux clés de plus.
- **`charge()` doit connaître le nom du global.** Onze fichiers sur douze posent
  `window.X = {…}` ; `data-dragonage.js` déclare `var DATA_DA` au premier niveau.
  Dans un navigateur c'est la même chose — un `var` de premier niveau est une
  propriété de `window` —, mais dans le `new Function` du script il reste local
  et l'objet est introuvable. La page Dragon Age et les deux accueils sortaient
  en « Cannot read properties of undefined ». Le nom vient de `SOURCES`, et un
  pont l'y rapatrie.
- **`decode()` passe sur tous les titres.** L'échappement n'est pas le même
  d'une page à l'autre — DC stocke en texte brut et rend avec `esc()`, d'autres
  stockent échappé parce qu'ils injectent directement. JSON-LD veut le texte.

Le contrôle ne se fait pas dans le fichier : les ancres sont posées par le JS au
chargement, et `document.getElementById()` sur les 742 identifiants est ce qui
dit qu'une ancre est morte. Une lecture statique les déclare toutes fausses.

Le script sort en erreur au moindre doute — `noindex` resté, lien de maquette non
recâblé, entrée manquante de `seo.json`. Trois pièges rencontrés valent d'être
retenus : les protos sont en **CRLF**, donc un motif qui cherche `/>` suivi de `\n`
ne trouve rien ; la sortie est normalisée en LF, sans quoi deux versions au contenu
identique diffèrent à l'octet près ; et le nom des fichiers de `/data/` suit celui
des pages — un outil qui découvre les univers en listant la racine y compte.

`data/sources.json` dit d'où vient chaque fichier publié. `sync.py` le lit pour
nommer le fichier à éditer plutôt que celui qui en sort.

### Vérifier avant de pousser

`py _proto/serveur.py 8951` sert le site comme GitHub Pages. `python -m http.server`
ne suffit pas : il ne connaît pas les URL sans extension, et toute la navigation de
la refonte passe par `/starwars`, pas `/starwars.html`. Une vérification locale qui
tombe en 404 sur chaque lien ne prouve rien.

### Star Trek, la chaîne inversée

Le cinquième univers est parti de l'anglais — Niko a écrit ce guide-là dans cette
langue. `en-startrek.html` et `data-startrek-en.js` sont donc la **source**, et le
français en descend, par `node _proto/traduire-startrek.mjs`. C'est le seul endroit
du dépôt où l'on traduit dans ce sens.

**Ne jamais inscrire Star Trek, The Walking Dead, Dragon Age, Assassin's Creed
ni DC Animation dans `PAGES` de `traduire-pages.mjs`.** Ce script produit l'anglais depuis le français : il
écraserait la source avec une retraduction de sa propre sortie, sans erreur et
sans message.

En revanche il est inscrit partout ailleurs, et sans exception : `ROUTES` et
`ASSETS` de `publier.mjs`, `seo.json`, `PAGES` de `sync.py` (avec
`langue_source="en"`), `PRECACHE` de `sw.js` et `sitemap.xml`. La publication ne
voit que deux protos et deux sorties — le sens de la traduction ne la regarde
pas.

Ce qui rend le script tenable, c'est qu'il ne traduit presque rien. Le gabarit du
site — navigation, pied de page, filtres, progression, boutons — existe déjà en
français dans les neuf autres protos, relu et en ligne : il est **retrouvé**, par
deux appariements, exactement comme `traduire-pages.mjs` retrouve l'anglais.

- les paires `e-*.html` / `en-*.html`, parallèles ligne à ligne — textes,
  attributs **et chaînes littérales du JS**, d'où viennent « Fermer le menu » ou
  « Bande-annonce » ;
- les paires `data-*.js` / `data-*-en.js`, appariées par chemin de clé, qui
  rendent les 112 libellés de `CG.t`.

1 686 textes retrouvés, 254 sous-items sortis d'un gabarit (« Season 6 Episodes
1-4 » → « Saison 6 Épisodes 1-4 »), et **120 phrases écrites** : les titres repris
de l'exploitation française, les huit ères, les trente réponses de FAQ, les neuf
bandeaux, les badges. Elles vivent dans `_proto/traductions-startrek.mjs`.

Six points qui ont coûté quelque chose :

- **Le `\n` des réponses de FAQ.** La clé du lexique est resserrée sur une ligne,
  donc le saut de paragraphe ne peut venir que de la traduction. Sans lui, la
  réponse sort en un seul pavé. Le script compte les sauts des deux côtés.
- **Le nombre de lignes.** Une phrase tient sur trois lignes en anglais et sur une
  en français ; `reflow()` la répartit sur le même nombre de lignes, sans quoi
  `py sync.py check` verrait les deux versions désalignées.
- **Le scanner de chaînes doit connaître les expressions régulières.** `esc()`
  teste `/["&<>]/g` : un scanner qui prend ce `"` pour une ouverture de chaîne
  repart en plein code et rend des fragments qui n'en sont pas.
- **L'accroche de la page est un bloc de HTML de quatre mille signes.** Elle se
  traduit nœud de texte par nœud de texte — ses intitulés sont ceux des quatre
  autres univers, déjà écrits.
- **L'espace du bord appartient au gabarit, pas au libellé.** La clé du lexique
  est resserrée par `net()`, donc la traduction revient rognée : `' watched'` et
  `' in total'` ressortaient collés au nombre qui les précède, et les huit bandes
  d'ère annonçaient « ÈRE2 / 8 », « 0 / 8VUES », « 68 H 31AU TOTAL ». La branche
  JS retrouve maintenant les bords de la chaîne d'origine, comme le faisait déjà
  la branche HTML avec `tete` et `queue`. Rien dans la console, rien au rapport :
  seule la page le disait.
- **La ponctuation française du deux-points.** Les titres restés anglais —
  Discovery, Picard, Voyager, Deep Space Nine… — étaient déclarés identiques, et
  la page écrivait donc « Star Trek : La Nouvelle Génération » deux lignes
  au-dessus de « Star Trek: Voyager ». Le nom ne se traduit pas, la ponctuation
  si : les quatre autres univers n'ont pas un seul deux-points collé. Ces titres
  sont passés aux traductions, avec l'espace. `Star trek: Lower Decks` est une
  coquille de la source anglaise, corrigée côté français seulement.

`en-startrek.html` est en **LF**, contrairement aux autres protos qui sont en CRLF.

### Avatar, la seule exception

Avatar est le seul univers qu'il faut vraiment traduire. `avatar.html` à la racine
est encore la page française non traduite et `fr/avatar.html` n'existe pas : il n'y
a ni page à apparier ni entrée homologue à lire. Ses textes sont donc **écrits**,
et ils vivent dans `_proto/traductions-avatar.mjs`, à part des douze phrases de
`traduire.mjs` pour ne pas noyer celles-ci.

Le fichier a deux listes, et la distinction compte. `AVATAR_IDENTIQUES` entre au
lexique : ce sont les titres jamais traduits en français (les six *Chronicles of the
Avatar*, *Patterns in Time*, *An Avatar's Chronicle*), les repères de calendrier
« 483 BG », et les valeurs de données croisées en chemin. Rien n'y est écrit, donc
rien n'en repart à la relecture. `AVATAR_TRADUCTIONS` entre dans `TRAD`, où le
traducteur ne va qu'en dernier recours **et en consignant chaque emploi** : c'est ce
qui fait apparaître les 103 phrases dans `A-RELIRE-EN.md`. Les poser au lexique les
rendrait muettes.

Ce que la traduction fait tomber, et pourquoi. Les recueils « Les Héroïnes de la
Team Avatar » et « Feu et Trésor Familial » sont des éditions françaises : en
anglais, *Katara and the Pirate's Silver*, *Suki, Alone* et les autres ont paru
chacune de leur côté, et le titre reste donc seul, sans préfixe qui n'existe pas.
La phrase « VF dans le recueil… » tombe pour la même raison que le badge VO. Les
recueils qui existent des deux côtés restent : « Aussi disponible dans le recueil
Team Avatar Tales » devient « Also available in the Team Avatar Tales collection ».

Deux points de vigilance propres à cet univers. Le champ `ol` porte la requête
OpenLibrary d'un roman — `q` cherché, `inc` exigé, `exc` écarté ; il est dans
`TECHNIQUES`, exactement pour la raison qui vaut aux arguments du DOM. Et faute de
prod à qui se comparer, le garde-fou du champ resté français regarde le français
lui-même : une chaîne rendue à l'identique alors qu'elle porte un accent ou un mot
de liaison français n'a pas été traduite, elle est passée au travers.

### Le proto fait foi, pas la prod

**C'est la règle la plus importante, et celle qui a été apprise le plus cher.**

Le raisonnement de départ — « le proto vient de la prod, donc l'anglais existe
déjà » — était vrai le jour de l'extraction, et faux ensuite. Les protos français
continuent d'être corrigés : un titre raccourci, une FAQ réécrite, un `~` retiré
d'une date. La prod anglaise, elle, garde l'ancienne version. La reprendre
réintroduit en anglais ce que la correction avait retiré, et **sans rien signaler**.

Le script lit donc les trois versions : le proto français, la prod française et la
prod anglaise. La prod française sert de témoin de fraîcheur — quand le proto ne dit
plus ce qu'elle dit, la valeur anglaise ne traduit plus rien et n'est pas reprise.

Deux suites possibles, dans cet ordre :

- **La coupe se rejoue.** Le proto a raccourci « The Clone Wars — 22 BBY » en « The
  Clone Wars », la date étant affichée à part. Quand le proto est exactement le début
  du titre de la prod, on coupe l'anglais au même séparateur. Rien n'est traduit, on
  applique une opération que le français a déjà faite. Quinze titres Star Wars.
- **Sinon, la phrase part en relecture.** Les FAQ de Doctor Strange et de
  Thunderbolts* avaient été réécrites : la version anglaise en ligne racontait autre
  chose. Elles sont traduites et signalées avec la mention « corrigé depuis la prod ».

### Apparier par identifiant, et par rang seulement à défaut

Les 63 repères écran du Dossier n'ont pas d'`id`. Indexés par identifiant, ils
tombaient tous sur la clé `undefined` et le dernier écrasait les 62 autres : les
63 repères annonçaient « Episode IX: The Rise of Skywalker ».

Le rang, qui a corrigé ça, avait son propre défaut : il suppose que les trois
versions listent exactement les mêmes items. **Une entrée ajoutée au proto
décalait alors tout ce qui la suit dans son ère**, et chaque item recevait le texte
anglais de son voisin de gauche — 533 entrées justes la veille, fausses le
lendemain, sans une ligne dans la console. Corrigé le 13 août 2026, en ajoutant
*The Fall of Kylo Ren 1-5*.

Les 533 identifiants sont uniques dans les trois versions : ils **apparient
exactement**, et une entrée neuve n'a pas d'homologue, ce qui est la bonne réponse
— elle part en relecture, et le script la nomme. Les repères écran, eux,
s'apparient par leur rang **parmi les écrans**, que l'ajout d'une entrée ne déplace
pas.

Un garde-fou en découle : si le français a 63 titres distincts et l'anglais un seul,
ce n'est pas une traduction, c'est un appariement qui a raté. Le script compare la
variété des valeurs des deux côtés — aucun contrôle de clés ne voit ça.

### Renommer un libellé : le lexique rend l'ancien nom

**C'est le piège du renommage, et il ne se voit qu'à l'écran.** Les deux scripts
retrouvent l'anglais par appariement — `traduire-pages.mjs` ligne à ligne avec la
prod, `traduire.mjs` clé par clé. Renommer un libellé dans le proto français leur
apprend donc « nouveau nom français » → **ancien nom anglais**, et la page anglaise
garde l'ancien nom. Aucun compteur ne bouge : la clé *est* traduite, elle l'est
juste vers ce qu'on venait de retirer.

Au renommage d'« Avatar » en « Avatar Legends », le 18 août 2026, la mention légale
a suivi — sa ligne avait changé, l'appariement a décroché — mais le menu, le tiroir,
le pied de page, la tuile d'accueil et `NAMES` sont restés en « Avatar » côté
anglais. Le rapport annonçait « complet, 0 sans traduction ».

Deux garde-fous, un par script, et il faut nourrir les deux :

- `traduire-pages.mjs` — la clé est retirée du lexique (`table.delete`) juste avant
  `indexeCasse()`, puis déclarée dans `identiques`.
- `traduire.mjs` — `RENOMMES` porte `ancien → nouveau`. Le nouveau nom ne s'apprend
  plus (`Lexique.ajoute`) et ne se cherche plus (`valeur`, avant le témoin de
  fraîcheur, sinon il ressort « sans traduction » à chaque passage).

**`CG.t` n'est pas traduit clé par clé.** Quand la prod anglaise porte la clé, sa
valeur est reprise telle quelle — c'est le principe même du « retrouver plutôt que
traduire ». Corriger la phrase française ne change donc rien à l'anglaise, et le
rapport reste propre : la clé *est* renseignée. C'est ce qui est arrivé à `legal3`,
la mention légale des données, qui énumérait quatre univers ; le 18 août 2026 elle
passe à six, et quatre univers sur cinq gardaient l'ancienne. `rejoueRenommages()`
applique donc `PERIMES` — la phrase anglaise périmée en clé — aux trois sorties
`CG`. Avatar n'y entre pas : sans prod anglaise il n'a rien à reprendre, sa phrase
est écrite dans `traductions-avatar.mjs`.

`legal3` n'est affiché nulle part, le pied de page portant son propre texte. Ce
n'est pas une raison de le laisser faux : une donnée périmée qui traîne finit par
ressortir, et c'est le seul endroit du dépôt qui comptait encore quatre univers.

Les deux scripts inverses ont leur propre liste : `ST_IDENTIQUES` pour Star Trek,
et pour The Walking Dead la valeur doit être corrigée dans sa source anglaise
(`data-twd-en.js`), sans quoi le français hérite de l'ancien nom.

**Le contrôle est le même des deux côtés** : compter le nouveau nom dans la page
française et dans l'anglaise, et exiger le même chiffre. Un écart, c'est
l'appariement qui a rendu l'ancien.

### Un décompte qui bouge ne doit pas faire tomber sa phrase

« 533 entrées · 63 repères à l'écran » est au lexique parce que la prod l'écrivait
ainsi des deux côtés. Ajoutez une entrée, le proto écrit 534, et la clé ne
correspond plus à rien : la phrase ressort **en français sur la page anglaise**.
Rien dans la console, rien qui alerte à l'écran — seul le compteur « sans
traduction » du rapport bouge, et il faut le lire.

`traduire-pages.mjs` indexe donc aussi les phrases **avec leurs nombres remplacés
par un jeton**, le lexique comme les traductions écrites. Deux garde-fous : le
gabarit doit désigner un seul gabarit anglais — sinon on ne sait pas lequel, et on
renonce —, et les deux côtés doivent porter autant de nombres. Ce sont bien des
gabarits qui sont comparés, pas les phrases : « 121 / 121 affichées » et « 69 / 69
affichées » sont deux traductions écrites pour un seul et même moule.

Rien de neuf n'est traduit là : on réapplique une traduction déjà relue à une
phrase dont seul un chiffre a bougé. Ce qui change vraiment de mots — « à jour ·
juillet 2026 » devenu « août 2026 » — reste à écrire à la main.

Quatre décomptes sont écrits en dur dans les protos et doivent suivre un ajout :
`e-dossier-star-wars.html` (le bandeau `.upd`, `s-tot`, `fcount`, `k-tot`,
`k-left`), `e-dossiers.html` (`data-total`, le score, le bandeau, le HUD) et
`e-accueil.html` (« 8 univers · 535 au dossier »). Le reste est calculé au
chargement. Le rail des ères du Dossier divisait par 533 en dur : il divise
maintenant par `ALL.length`, sinon la progression n'atteint jamais 100 %.

### Les quatre garde-fous, et pourquoi ils existent

Chacun est né d'un bug qui n'avait **rien cassé** — le fichier se chargeait, la
console restait vide, et la page était fausse. C'est le mode de défaillance propre
à ce travail : ne pas se fier à « ça marche ».

**Les clés, une par une.** `traduire.mjs` compare la sortie anglaise au proto
français clé par clé. La sérialisation du Dossier n'écrivait que `eras` et jetait
`intro` : la page affichait « undefined » en gros à la place de son accroche. Celle
des timelines ne gardait que `title` et `entries`, perdant les `zone`, `branch` et
`hint` dont DC tire ses deux colonnes — la page s'affichait, à plat.

**Le champ resté français.** Un champ dont *toutes* les valeurs sont identiques
d'une langue à l'autre n'a pas été traduit. `faq.comment` et `faq.postcredits`
étaient français dans les 121 entrées Marvel parce qu'ils ne figuraient pas dans la
liste blanche des champs textuels — 238 réponses, et rien ne le disait.

**Liste noire plutôt que liste blanche.** C'est la leçon du point précédent : une
liste blanche rate mécaniquement ce qu'elle ne connaît pas. On traduit désormais
tout ce qui n'est pas explicitement technique, et les clés inconnues sont signalées.

**Les arguments du DOM ne se traduisent jamais.** `getElementById('note')` était
devenu `getElementById('rating')`, « Note » figurant au lexique. Le script levait
une exception, le `catch` de la page l'avalait, et « À venir » annonçait « le radar
n'a pas pu être chargé » sans une ligne dans la console.

### Ce que la traduction ne voit pas : les regex et les sélecteurs

Trois divergences se sont glissées là où le script ne regarde pas, parce que ce ne
sont ni des chaînes affichées ni des clés de données.

**Un regex qui teste un mot français.** `subs()` groupait les sous-items quand ils
commençaient tous par « Saison N » ; en anglais ils s'écrivent « Season N », le test
échouait et la page empilait ce que le français mettait côte à côte. Les dix saisons
de Smallville tenaient sur une bande d'un côté, sur dix lignes de l'autre. DC empile
désormais des deux côtés — c'est la disposition qui tient dans les deux langues.
Star Wars et Marvel gardent leurs arcs, avec un test bilingue **et insensible à la
casse** : l'anglais écrit « Season 7 Episode 9 », avec deux majuscules.

**Une clé ajoutée par la refonte, écrasée par la prod.** `window.CG` était recopié
tel quel depuis la page anglaise, ce qui perdait `groups` — les quatre branches DC
avec leurs couleurs et leurs identifiants. Le groupe « Branches » du panneau de
filtres s'affichait alors vide : un intitulé, aucun bouton. Le CG du proto est
maintenant *traduit*, jamais remplacé.

**Un échappement qui n'est pas le même partout.** Chaque page a sa convention et le
proto français la respecte déjà : DC rend ses titres avec `esc()` et les stocke donc
en texte brut, le Dossier les injecte directement et les stocke échappés — d'où les
`L&#x27;Ère` de ses items, qui sont normaux. Les pages de prod, elles, échappent
partout : recopier leur valeur telle quelle donnait `Superman &amp; Lois` dans les
données DC, que la page ré-échappait, et l'écran affichait l'entité en toutes
lettres. L'anglais suit maintenant l'échappement du français, champ par champ.

**Un code de langue pris pour un mot.** `'fr'` et `'en'` sont au lexique — la page
française pose `otherFlag:"en"`, l'anglaise `"fr"`, et l'appariement en tire
« en » → « fr ». Appliqué à du code, ça **retourne le test** : le badge VO de la
page Avatar était protégé par `T.lang!=='en'`, devenu `T.lang!=='fr'`, vrai en
anglais — et le badge s'affichait sur les vingt entrées où le français le pose.
Rien dans la console, rien au rapport. `traduire-pages.mjs` ne traduit désormais
jamais une chaîne qui vaut exactement `fr` ou `en`.

**Un sélecteur d'élément trop large.** `header{position:sticky;top:0;z-index:60}`
visait tous les `<header>`, or les têtes de colonnes DC en sont. « SUPERMAN
ORIGINS » venait donc se coller par-dessus le menu et la légende au défilement. La
règle est passée à `body>header`. Seul DC avait des `<header>` imbriqués.

### Vérifier au navigateur, pas dans le fichier

Lire le HTML ne suffit pas : la moitié des textes sont écrits par le JS au
chargement, et les fiches, FAQ et panneaux sont repliés. Une vérification sérieuse
déplie tout — `details.open = true`, un clic sur chaque entrée — avant de relever le
français résiduel. Chercher des accents ne suffit pas non plus : « Continuer »,
« univers » et « Ouvrir » n'en portent pas.

### Les quatre pièges de la traduction automatique

Chacun a été rencontré, et chacun a coûté un bug silencieux.

**Ne jamais traduire l'argument d'une API du DOM.** « Note » est au lexique parce
qu'une fiche de film affiche une note, rendue par « Rating » ; `getElementById('note')`
est donc devenu `getElementById('rating')`, qui ne trouve plus rien. Le `catch` de la
page avalait l'exception et « À venir » affichait « le radar n'a pas pu être chargé »
sans une ligne dans la console. Le script regarde maintenant ce qui précède la chaîne.

**Les tables de correspondance sont des données, pas des libellés.** `MATCH`, dans
`e-a-venir.html`, cherche « livre », « série », « épisode » dans `radar.json`, lequel
reste français dans les deux langues puisque c'est le même fichier qui alimente les
deux pages. La zone est encadrée par `i18n-off` / `i18n-on`, que le script respecte.

**Les commentaires français sont pleins d'apostrophes.** Un regex qui cherche des
chaînes littérales prend le `'` de « l'événement » pour un délimiteur et découpe la
prose n'importe où. Le script parcourt le JS caractère par caractère en suivant son
état réel — code, chaîne, gabarit, commentaire.

**L'anglais n'accorde qu'une fois.** « 31 sorties affichées » porte deux `s`,
« 31 releases shown » un seul : une substitution mot à mot rendait « showns ». Ces
gabarits sont réécrits en entier dans `EXPRESSIONS`, et le script s'arrête si l'un
d'eux ne se retrouve plus dans le proto.

### Le radar est commun, les dates ne le sont pas

`e-a-venir.html` lit `radar.json`, un fichier unique qui sert les deux langues. La
page décide donc elle-même de ce qu'elle en montre, comme `cg-upcoming.js` le fait
en production : `var FR = document.documentElement.lang !== 'en'`, et trois fonctions
en dépendent.

- `iso()` — la date de coupure. `radar.py` écrit la sortie **US** dans `date_sort` et
  la **française** dans `date_sort_fr` ; chaque langue s'arrête à la sienne, jour J
  compris. Batman: Knightfall sort le 23/06 en France et le 25/08 aux États-Unis :
  il quitte « À venir » le 24/06 et « Upcoming » le 26/08. Prendre la date française
  sur la page anglaise faisait disparaître le film deux mois trop tôt.
- `dateTxt()` — `date_txt` et `date_txt_fr` sont **tous deux** en JJ/MM/AAAA, y
  compris la sortie américaine. La page anglaise reformate donc depuis `date_sort` :
  « August 12, 2026 ».
- `titleOf()` — `title_fr` ne vaut que pour le français ; l'anglais veut toujours le
  titre d'origine.

Ces trois fonctions, ainsi que les tableaux `MOIS` et `JOURS`, sont encadrées par
`i18n-off` / `i18n-on` : la traduction automatique n'a rien à y faire, elle ne
saurait pas garder les deux versions côte à côte.

### Deux écarts assumés entre les deux langues

Le badge **VO** ne s'affiche pas en anglais : il signale l'absence de version
française, information sans objet pour qui lit justement l'anglais. C'est déjà le
choix de la prod, où `deep-dives/star-wars.html` ne le pose nulle part. La règle
vaut partout où le badge apparaît : le Dossier et le journal des Nouveautés, qui
le posait sur la carte de Legacy. Les deux sont neutralisés par une entrée
`EXPRESSIONS` de `traduire-pages.mjs`, pas par une retouche du proto français —
c'est la même donnée `vo` qui sert les deux langues.

La **bande-annonce** ne se replie que dans un sens. Sans trailer dans la langue de
la page, la fiche complète en anglais, et en anglais seulement : une bande-annonce
française n'a rien à faire sur la page anglaise. Le repli ne joue donc que depuis
le français — ne pas le rendre symétrique.

Reste le cas où TMDB n'a pas de trailer du tout : la série *Avatar : Le Dernier
Maître de l'Air* (`tv/246`) n'a en anglais qu'un « Opening Credits », son seul
trailer étant la bande-annonce DVD française. **À défaut de bande-annonce, on
prend le générique** — il montre la série, il fait le même travail. Le bouton
garde son libellé. `Opening Credits` est une valeur de l'API TMDB, comparée au
champ `type` de la réponse : elle est déclarée identique dans
`traduire-pages.mjs`, comme les arguments du DOM, sinon la comparaison ne
trouverait plus rien du côté anglais.

Le compte à rebours du radar passe de **« J‑8 » à « D‑8 »** : J comme Jour, D comme
Day, et « D‑Day moins N » se dit en anglais. `CG.t.inDays` écrit « in {n} d » sur le
site en ligne, mais c'est une phrase là où la pastille est un signe — elle casserait
le bloc de Big Shoulders 900 qui fait l'effet de la carte. Ne pas y remettre « T‑8 » :
le « T‑minus » des lancements se compte en secondes, pas en jours.

**Les deux derniers jours, le compteur n'est plus un signe mais un mot**, et un
mot ne tient pas dans la place d'un signe : « AUJOURD’HUI » fait onze caractères
contre trois. La classe `mot`, posée par le JS quand il reste un jour ou moins,
répare trois choses d'un coup — le cadran du bloc « Prochaine » descend de 72 à
44 px, « avant la sortie » disparaît (la phrase ne dit rien de plus, et « demain
avant la sortie » se lit mal), et sur mobile `.hd:has(.cd.mot) .txt` rend au
titre sa ligne entière. Ce dernier repli existait déjà en intention — `.cd` porte
`order:3` depuis toujours — mais il ne se déclenchait jamais : `.txt` a
`min-width:0` et se comprimait au lieu de passer à la ligne, réduisant « Star
Trek: Strange New Worlds » à 97 px. Il n'est forcé que pour la classe `mot` :
sous les quarante cartes, une ligne de plus chacune coûterait un écran entier.

`classList.\w+` figure dans les arguments techniques de `traduire-pages.mjs` :
`classList.toggle('mot', …)` traverse donc la traduction sans que « mot » soit
pris pour un libellé. La même chaîne écrite en dur dans une concaténation de
`class="…"`, elle, n'est protégée par rien — vérifier après génération qu'elle
est encore là, comme pour tout sélecteur.

`e-app.js` est **bilingue dans un seul fichier**, sur le modèle de `pwa.js` : il lit
`documentElement.lang`. Deux jumeaux se seraient désynchronisés à la première
retouche du CSS, qui est commun.

### Le menu : trois univers en clair, trois sous un déroulant

Six univers alignés débordaient la barre. Depuis le **18 août 2026**, Star Wars,
Marvel et DC restent en clair ; Avatar Legends, Star Trek, The Walking Dead,
Dragon Age depuis le 20 août, Assassin's Creed depuis le 25 et DC Animation
depuis le 4 septembre passent sous
« Plus d'univers » / « More universes ». C'est un `<details class="nav-more">`
natif : **pas une ligne de JS pour l'ouvrir**, et le clavier le pilote seul.
`.nav-more:has(a[aria-current])>summary` le passe à l'or quand la page courante
est dedans — sans ça, cinq pages sur vingt-huit n'auraient rien d'allumé au menu.

Le tiroir mobile a suivi : les neuf univers en **grille à deux colonnes** avec
leur pastille de couleur (`.u-sw` … `.u-dca`, les neuf encres de la charte), puis
les quatre pages du site. La règle générique `.drawer a` est devenue `.dw-site a`
— laissée telle quelle, elle repassait les tuiles d'univers en blocs de 21 px et
la grille tombait. Même chose pour le `@media(max-width:720px)`.

Le burger porte deux dessins dans un seul SVG, `<g class="m">` et `<g class="x">`,
commutés par `aria-expanded` — que le script de chaque page pose déjà.

**Ce qui referme ces deux menus vit dans `e-app.js`**, pas dans les pages : clic
à côté, clic sur un lien du tiroir, touche Échap. Le HTML ne le fait pour aucun
des deux, et un menu resté ouvert par-dessus la page qu'on vient d'ouvrir passe
pour une page cassée. Une seule copie pour vingt-huit pages, comme le formulaire
de contact ci-dessous.

Un dixième univers se pose donc dans le déroulant et dans la grille du tiroir,
pas dans la rangée du haut — et dans les douze protos source, jamais dans les
`en-*` produits.

### Le pied de page et son formulaire de contact

Le pied faisait **722 px de haut sur un téléphone**, presque un écran entier : une
seule colonne empilait l'accroche, six liens de timelines, quatre liens « Plus »
et la mention légale. Sous 720 px, les deux listes passent maintenant côte à côte,
le bloc de tête garde la largeur entière, et le reste se resserre — **455 px**,
rien de retiré. La règle qui tenait ça en une ligne
(`.foot{grid-template-columns:1fr}`) est devenue un bloc de treize, dans chacun
des dix protos source.

**Une police plus petite rétrécit la cible tactile.** À 12,5 px les liens
tombaient à 19 px de haut, là où un doigt vise 24. Ils reçoivent un rembourrage
vertical, et un `display:inline-block` sans lequel il n'agrandirait rien — un
lien est `inline` par défaut. Le sélecteur est `.foot li a` et non `.foot a` :
TMDB et Open Library sont au milieu d'une phrase, et l'`inline-block` y gonflait
les lignes de la mention légale.

**« Soutenir le site » n'est plus là** (14 août 2026) : rien ne recevait derrière,
et le proposer avant qu'on ait demandé comment payer ne se lit pas bien.

« Contact » ouvre un formulaire, et il vit dans `e-app.js` — le seul fichier que
les vingt-huit pages partagent. L'écrire dans les protos aurait voulu dire vingt-huit copies
du même dialogue et de son CSS. Quatre choses à savoir :

- **L'envoi passe par `mailto:`**, faute de serveur : GitHub Pages ne reçoit pas de
  POST. Le formulaire remplit sujet et corps, la messagerie du visiteur envoie.
  C'est dit sous le bouton — un formulaire qui a l'air de partir tout seul et qui
  ouvre une fenêtre de messagerie passe pour cassé. Et le dialogue **reste ouvert**
  après l'envoi : sans messagerie installée il ne se passe rien du tout, et
  l'adresse écrite en dessous est alors le seul recours.
- **L'adresse n'est nulle part dans le HTML** : elle est recomposée en JS. Les
  moissonneuses ramassent les pages, pas les concaténations.
- **`margin:auto` est rappelé sur le `<dialog>`.** C'est lui qui centre un dialogue
  modal, et les vingt-huit pages posent `*{margin:0}` : sans le rappel, la boîte se colle
  en haut à gauche de l'écran. Rien dans la console, la page marche — elle est juste
  de travers.
- **Le lien porte `data-contact` et `href="#contact"`.** L'attribut est ce que le
  script cherche ; l'ancre évite un `href="#"` de plus. `cabler-nav.mjs` ne voit
  donc plus qu'un seul `#` légitime, celui de la page courante.

Au-delà de 1 500 signes les messageries tronquent le corps sans prévenir : le champ
est borné, et un compteur apparaît à partir de 1 200.

### Suggérer, et ajouter — les deux réponses au « il manque quelque chose »

Posées le 1er septembre 2026, après les premiers courriers de remerciement
venus de Reddit. La demande revenait sous deux formes qui n'appellent pas la
même réponse, et le site fait les deux.

**Suggérer** est une lettre : l'arbitrage reste éditorial. Deux boutons, tous
deux dans `e-app.js`, qui ouvrent le formulaire de contact déjà en place avec
le motif choisi et un gabarit de trois lignes — une suggestion sans titre ni
raison ne se traite pas.

- « Suggérer une œuvre » est injecté au bas de `.cuts-body`, la section « Ce
  qui est écarté », sur les neuf univers **et le Dossier**. C'est là qu'on lit
  ce qui manque, donc là qu'on se dit qu'il manque autre chose.
- « Suggérer une timeline » est dans le HTML de `e-accueil.html`, sur la case
  « Bientôt », qui annonce déjà les univers en préparation.

Trois choses à savoir. Le bloc `.cuts` **vit dans le champ `intro` des
`data-*.js`**, en HTML : le poser en JS évite d'écrire le même bouton dans
dix-huit fichiers de données. Le bouton de l'accueil est écrit **vide** et
reçoit son libellé au chargement — un texte dans le HTML devrait être traduit
dans `traduire-pages.mjs`, et le gabarit du message avec lui. Et
`data-contact` prend désormais une **valeur** (`oeuvre`, `timeline`) là où les
vingt-huit liens du pied de page le portent nu ; la capture est passée en
délégation sur `document`, sans quoi les boutons injectés plus tard ne
seraient jamais écoutés.

Au passage : `.cx-cpt[hidden]` ne se cachait pas, `display:block` battant
l'attribut. Invisible tant que la boîte s'ouvrait vide — un gabarit pré-écrit
donne au compteur un texte à montrer.

**Ajouter** est l'autre réponse : l'œuvre entre dans *sa* copie de la page et
n'en sort jamais. Le principe tient en une phrase — **une entrée perso est une
entrée comme les autres**. `_proto/e-perso.js` se glisse entre le fichier de
données et le script de la page, et pose ses entrées dans `D.eras` avant que
quiconque l'ait lu :

```
<script src="data-mcu.js"></script>
<script src="e-perso.js"></script>     ← ici
<script> … la page … </script>
```

Tout suit alors sans une ligne de plus : `ALL` les numérote, `row()` les
dessine, `applyFilters()` les filtre, `tally()` les compte, la case à cocher
les retient. Le fichier est publié en `/perso.js` (`ASSETS` et `ASSET_RE` de
`publier.mjs`, `PRECACHE` de `sw.js`), et l'interface — dialogue, crayon,
marquage — vit dans `e-app.js`, une copie pour vingt-huit pages.

Six points, tous rencontrés :

- **Le second parcours reçoit un `{ref}`, pas une copie.** Sans lui, l'ajout
  manquerait à qui rejoue, sans un mot — c'est exactement le piège que « Les
  deux parcours » nomme déjà pour les ajouts éditoriaux.
- **Un ajout recharge la page.** Le rendu est déjà fait quand `e-app.js`
  s'exécute ; réinjecter à chaud demanderait de connaître le rendu de chacune
  des huit pages. C'est le geste qu'emploie déjà la bascule des deux parcours.
- **La suppression retire aussi la coche.** La clé de progression est déclarée
  dans le script de chaque page (`var KEY='cg-proto-mcu'`), inaccessible d'ici :
  `oublie()` cherche donc l'identifiant lui-même dans toutes les clés du
  stockage. Il est unique et préfixé `p-`, rien d'autre ne peut porter ce nom.
- **`PARCOURS`, sur l'accueil, écarte les ids `p-`** comme il écarte déjà ceux
  du rejeu. Les huit `data-total` sont éditoriaux et écrits à la main : trois
  ajouts cochés, et le HUD annonçait 850 / 847.
- **Le type vient de `CG.badgeLabels`, jamais d'une liste à nous.** C'est lui
  qui décide de la couleur du badge et des cases du panneau de filtres ; un
  type inventé s'afficherait tel quel et ne répondrait à aucun filtre. Il n'y a
  **pas de niveau** : `offLv[undefined]` est faux, donc une entrée sans niveau
  reste visible quels que soient les filtres — c'est ce qui rend Star Trek,
  qui n'a pas de niveaux du tout, faisable sans cas particulier.
- **Le Dossier n'en est pas.** Sa liste de romans n'a ni `.bu-tags` ni carte
  bâtie comme celles des timelines ; il ne charge pas `e-perso.js`, et le
  garde-fou de `e-app.js` le laisserait sortir de toute façon. Il garde le
  bouton « Suggérer une œuvre », lui.

**L'export emporte les ajouts, et l'import fusionne.** Le fichier ne portait
que les coches ; réimporté sur un navigateur neuf, il y ramenait des coches
`p-` **sans les entrées qui vont avec** — des identifiants morts que rien
n'affiche. Il porte maintenant une clé `mine`, la liste complète : titre,
type, date, durée, note, image et placement.

L'import ne remplace pas cette liste, il la fusionne. La progression, elle,
reste remplacée par le fichier — c'est le choix des pages, et il tient, on
restaure une sauvegarde. Les ajouts sont d'une autre nature : des œuvres
écrites à la main, parfois avec une image, et perdre celles qu'on a faites
depuis la sauvegarde serait une perte sèche. Le fichier gagne à identifiant
égal, le reste est conservé.

`fusionne()` ne rend `true` que si quelque chose a changé **et** que
l'écriture a réussi : c'est ce qui décide du rechargement — et recharger sur
une écriture refusée ramènerait la page sans les entrées, sans un mot. Le
rechargement est nécessaire parce qu'un ajout change la timeline elle-même,
là où une coche ne change qu'un état.

Ce sont les deux seules lignes de ce chantier qui vivent dans les huit pages
plutôt que dans `e-app.js` : l'export est à elles, `prog` et la clé d'univers
leur appartenant.

Au passage, **quatre pages annonçaient le mauvais univers dans leur export** —
Avatar « sw », The Walking Dead « st », Dragon Age et Assassin's Creed « sw »,
chacune ayant gardé la clé de celle sur laquelle elle a été bâtie. Rien ne
cassait, le champ n'étant alors pas relu à l'import, mais il était faux dans un
fichier que le visiteur garde. **Il est relu depuis le 2 septembre 2026** —
c'est par lui que l'accueil reconnaît un fichier de page —, et à vérifier au
prochain univers : c'est le genre de valeur qu'un copier-coller emporte sans
qu'on la relise.

**Tout exporter, depuis l'accueil.** Posé le 2 septembre 2026, après des
courriers de gens qui suivent quatre univers à la fois : ils devaient faire
le geste quatre fois, sur quatre pages, et tenir quatre fichiers. Le bloc
« Toutes vos timelines, en un fichier » se pose sous « Les Dossiers », et
il est **entièrement dans `e-app.js`** — pas une ligne dans `e-accueil.html`,
donc rien à traduire dans `traduire-pages.mjs` et pas une ligne de plus à
apparier pour `py sync.py check`. Il se reconnaît à `.slot[data-u]`, que
seul l'accueil porte.

Le fichier n'invente rien : c'est l'union des exports de page, rangés par
univers sous `universes`, plus le mode de parcours (`<clé>-mode`) et
`cg_last`. Quatre choses à savoir :

- **Les deux sens se lisent.** Un fichier de page s'importe sur l'accueil
  (`universe` désigne alors le seul bloc), et le fichier global s'importe
  sur une page, qui n'en prend que sa part : `if(d&&d.universes)
  d=d.universes.mcu||{};`, une ligne dans chacune des neuf. **Sans elle,
  `d.progress` étant absent, la page prenait le fichier entier pour une
  progression** et rangeait `universes` et `chronologeek` parmi ses coches.
  Rien n'aurait cassé, et la page aurait été fausse. C'est la seule ligne
  de ce chantier qui vit dans les pages ; elle s'écrit donc dans les
  **sources** — les cinq protos français et les quatre protos anglais des
  chaînes inversées.
- **La clé de bloc est celle du champ `universe`, pas celle du stockage.**
  Star Trek stocke sous `cg-proto-st` et s'annonce `startrek` ; le Dossier
  fait `dossier-sw`. La table `UNIVERS` porte les trois colonnes en clair
  plutôt qu'une dérivation, et les ajouts de Dragon Age s'y rangent sous
  `cg-perso-data_da`, du nom de son global.
- **La ligne d'état dit ce que le fichier contiendra**, avec le filtre du
  HUD (`p-` et `-r-` écartés) pour annoncer le même nombre que la barre du
  bas. À zéro, le bouton se ferme : un fichier vide n'apprend rien.
- **`fusionne()` est recopié, pas appelé.** Celui de `e-perso.js` ne vit que
  sur les pages qui ont une timeline, et ne connaît que la sienne. La
  version de l'accueil rend `false` sur la seule écriture refusée — « rien à
  changer » est un succès.

Un neuvième univers se pose dans `UNIVERS`, et sa page reçoit la ligne
d'extraction.

**La durée entre dans les compteurs, et n'est proposée que là où ils
existent.** Un champ de plus dans le formulaire, et l'ajout compte dans le
« restant à voir » du HUD, le total du bandeau et le « au total » de son ère —
tout cela est déjà calculé depuis `rt()`, il n'y a rien à additionner nulle
part.

Trois choses à savoir :

- **Elle se pose aux deux endroits où les pages la cherchent.** Star Wars et
  Marvel écrivent `rt(e){ return e.rt || RT[e.id] || … }` ; les six autres ne
  connaissent que `RT[e.id]`, la table que `runtime.py` injecte. Écrire `e.rt`
  **et** `window.RT[id]` est la seule forme qui vaille partout, et rien ne se
  marche dessus — un identifiant `p-` n'existe dans aucune table publiée.
- **Cinq pages sur huit comptent le temps** : Star Wars, Marvel, DC, Star Trek
  et The Walking Dead. À ne pas confondre avec les trois que `runtime.py`
  alimente — Star Trek et TWD ont bien une table `RT`, mais elle est écrite à
  la main dans leur source anglaise, et le script ne les connaît pas. Avatar
  Legends, Dragon Age et Assassin's Creed n'en ont aucune, et le champ n'y
  paraît pas. D'où le
  `if (window.RT)` de `e-perso.js` : **créer la table là où elle n'existe pas
  ferait apparaître le champ dans un formulaire où il ne mènerait nulle part**,
  `e-app.js` s'y fiant pour savoir si la page compte le temps.
- **La saisie n'est pas le stockage.** On stocke des minutes, comme `RT`, mais
  personne ne connaît une série en minutes : « 12 h 57 » plutôt que 777. Le
  champ accepte `2 h 15`, `2h15`, `2:15`, `90 min` et `135`, et l'édition rend
  l'écriture qui se lit le mieux.

Au passage : les intitulés du dialogue sont posés par leur champ
(`label[for="mx-r"]`) et non par leur rang — un champ inséré au milieu
décalait toute la suite, et les intitulés partaient sur les mauvaises lignes.

**La croix ne supprime pas, elle demande.** « Retirer ? Oui / Non » prend la
place des deux boutons dans la carte, et Échap, un clic ailleurs ou le « Non »
les ramènent. Le bloc `.mine-act` est calé par la droite, donc la question
s'étend vers la gauche sans rien déplacer : 151 px, dans une carte qui en fait
295 sur un téléphone. Il n'y a **pas de `confirm()`** — il serait sorti du
site, se serait posé au milieu de l'écran et n'aurait pas dit de quelle carte
il parlait. Le dialogue n'a donc plus de bouton « Retirer » : un seul chemin,
une seule confirmation.

**L'image est réduite dans le navigateur, jamais stockée telle quelle.** La
règle du site vaut ici aussi — quatre fois les 190 px de la vignette, donc
760, et on n'agrandit jamais. Un canvas redimensionne, `toDataURL` encode en
WebP (JPEG à défaut), et la qualité descend par paliers tant que le résultat
dépasse 300 Ko. Une photo de téléphone de 2,9 Mo ressort à 6 Ko.

Ce n'est pas un raffinement : le stockage local compte cinq mégaoctets pour
tout le site. Une seule image brute y entrerait, et elle ferait tomber
l'écriture de tout le reste — d'où le message d'échec qui nomme l'image quand
il y en a une, plutôt que de renvoyer à un réglage de navigateur qui n'y est
pour rien. `toDataURL` d'un format inconnu rend du PNG **sans le dire** : c'est
l'en-tête du résultat qui répond, pas une déclaration.

Deux pièges rencontrés, tous deux de la même famille que `.cx-cpt[hidden]` :
les pages posent `img{display:block}`, qui bat le `display:none` de l'attribut
`hidden` — l'aperçu vide occupait sa place avant tout choix ; et le champ de
fichier héritait de `.mx-f input` (bordure, rembourrage, pleine largeur) et
ressortait en petit bloc à côté du bouton qui le pilote. **Un attribut `hidden`
ne suffit jamais sur ce site : il faut la règle `[hidden]{display:none}` en
face.**

Les deux boutons partagent la classe `.sg` et le `<p class="sg-p">` qui les
porte. Les deux blocs de `e-app.js` s'inscrivent sur `DOMContentLoaded` —
`e-app.js` est chargé en fin de corps, donc pendant l'analyse du document, et
le bloc des ajouts ne trouverait pas le `.sg-p` que l'autre pose. Il en
créerait un second, et les deux boutons tomberaient sur deux lignes.

### Ce qui efface la progression, et les trois réponses

Posées le 3 septembre 2026, après un courrier : un visiteur avait ajouté
plusieurs œuvres à sa timeline Marvel et les a retrouvées disparues en
revenant. **Rien dans le code ne les perd** — écriture, relecture, second
parcours, import, réinitialisation, filtres non persistés, aucun appel à
`clear()` : tout a été vérifié au navigateur. C'est le navigateur du
visiteur qui vide, et c'est normal — **Safari efface les données d'un site
après sept jours sans visite**, ce qui est court pour une timeline qui se
suit sur des années. Chrome et Firefox le font quand le disque se remplit,
et certains réglages effacent à la fermeture.

L'IP n'y est pour rien, et ça revient à chaque fois : `localStorage` est
indexé par **origine + profil de navigateur**. Le site n'a qu'une origine,
`www`, `http` et `arcanerval.github.io` redirigeant tous en 301 vers
`https://chronologeek.app`.

Trois réponses, toutes dans `e-app.js` :

- **`navigator.storage.persist()`**, qui n'était appelé nulle part. Il
  n'est demandé **que si le visiteur a déjà coché ou ajouté quelque
  chose** : Firefox ouvre une demande d'autorisation, la poser devant une
  page vierge ne veut rien dire, et un refus ne se redemande pas. Chrome
  l'accorde en silence sur ses heuristiques.
- **La barre d'installation Apple vend la persistance, plus le
  hors-ligne.** Sur l'écran d'accueil, une web app échappe au cap de sept
  jours — c'est la seule exemption que WebKit documente, et donc la seule
  sur laquelle compter côté Safari. Elle donne l'ordre des gestes parce
  que **le conteneur de l'application est distinct de celui de Safari et
  démarre à vide** : exporter, installer, réimporter. Sans ça on remplace
  une perte à une semaine par une perte immédiate.
- **Le rappel de sauvegarde**, une barre à la place et à l'allure de la
  précédente, qui déclenche le `#export` de la page. Deux seuils, parce
  que ce n'est pas la même perte : **vingt coches**, qui se refont de
  mémoire, ou **cinq ajouts**, tapés à la main et parfois avec une image.
  Fermée pour une semaine, et **jamais en même temps que la barre
  d'installation** — sur iPhone c'est elle qui porte la vraie réponse.
  D'où le report à `load` + 1,4 s : la barre Apple se construit à 1,2 s,
  et on regarde une fois qu'elle a eu sa chance.

Trois choses à savoir :

- **Le rappel ne dépend pas de « Mes ajouts ».** Son premier jet vivait
  dans ce bloc-là et ne comptait que les entrées écrites à la main — le
  cas rare : la plupart des visiteurs cochent sans jamais rien ajouter.
  Il est son propre bloc, et ne regarde que deux choses que les dix pages
  ont toutes : les lignes cochées dans le DOM et le bouton `#export`. Le
  Dossier, qui porte 535 œuvres et la plus longue progression du site, ne
  charge pas `perso.js` et n'aurait jamais rien vu.
- **On compte `aria-checked`, jamais la classe `done`.** Les huit
  timelines posent les deux au rendu ; **le Dossier ne pose `done` qu'au
  clic**, et ses 535 lignes arrivent donc cochées à l'écran et sans la
  classe. Un compteur qui cherche `.done` rend zéro là où la progression
  est la plus longue — sans erreur, sans une ligne dans la console. Les
  neuf pages écrivent `aria-checked` dans le gabarit de leur ligne : c'est
  la seule marque qui vaille pour les neuf. Même famille de piège que le
  `.en[data-id]` d'avant la refonte, qui rendait zéro plutôt qu'une erreur.
- **Les coches se comptent au rendu, pas dans le stockage.** La clé de
  progression est déclarée dans le script de chaque page, sous un nom qui
  change à la publication, et un navigateur qui a vu quatre univers en
  porte quatre. Le DOM, lui, ne dit qu'une chose : ce qui est coché sur
  cette page-ci. C'est le même raisonnement qu'`oublie()`.

Ce qui n'a pas été fait, et pourquoi. **Un cookie de secours** ne marche
pas : Safari plafonne aussi à sept jours les cookies posés en JS, et
GitHub Pages ne peut pas en poser côté serveur. **IndexedDB** non plus :
mêmes règles d'effacement, seul le quota est plus grand. **La File System
Access API** — un fichier choisi une fois, réécrit tout seul — n'existe
que sur Chrome et Edge de bureau, donc rate exactement la plateforme
touchée. Et **un compte avec stockage serveur** est la seule chose qui
survive vraiment à des années : il fait passer « rien n'est envoyé » à
faux, et ajoute un service à administrer. À rouvrir seulement si les
courriers se répètent.

## Les images

**Tout est en WebP, à quatre fois la taille où l'image s'affiche.** Le 14 août 2026,
`images/` pesait 25 Mo pour 207 fichiers, dont **20,8 Mo de vignettes d'entrée** :
`.bu-fig` les rend dans une case de **190 px de large**, et `thelegendofkorra.png`
arrivait en 3840×2160. Les données, elles, tiennent en 17 Ko compressés — le poids
du site n'a jamais été là.

Les largeurs, toutes plafonnées à la taille native (on n'agrandit jamais) :

| ce que c'est | affiché à | fichier |
|---|---|---|
| vignette d'entrée (`img` des `data-*.js`) | 190 px | **760 px** |
| bannière, carte d'accueil, image de partage | 1 240 px | **1 920 px** |
| bouton « remonter en haut » | 96 à 217 px | 400 à 900 px |
| `icon-192`, `icon-512`, `icon-maskable-512` | — | **restent en PNG** |

Les trois icônes sont celles du manifeste PWA : il les déclare en `image/png`, et
elles ne se convertissent pas.

**Huit univers sur neuf ont deux WebP dans `images/` pour leur bouton
« remonter en haut »** — DC Animation reprend le bat-signal de DC — Grogu, Miss Minutes, Appa, le bat-signal, le delta de Starfleet, le
soleil de la Chantrie (`da1.webp` / `da2.webp`, 384×384), l'insigne des Assassins
(`actop1.webp` / `actop2.webp`, 384×384 — grisé au repos, doré et brisé au
survol), et Rick Grimes
depuis le 17 août 2026 : assis le revolver contre l'épaule
(`twd1.webp`), en joue au survol (`twd2.webp`). Un chapeau de shérif dessiné en
SVG en ligne a tenu la place une journée — plus léger, sans source à trouver,
sans personnage — mais deux photos disent la série mieux qu'une silhouette. Le
sélecteur du CSS est redevenu `#totop img` seul, comme sur les cinq autres pages.

**Ces deux-là partagent une seule toile, 360×480.** C'est la règle du calage dans
l'image, celle que les deux fichiers de Star Trek avaient enfreinte : la source du
survol faisait exactement la moitié de l'autre, l'autre a été réduite de moitié,
et rien n'a été agrandi. Une image portrait rendue dans le carré de 96 px par
`object-fit:contain` occupe 72×96 : 360×480 est bien la règle du ×4.

**Un cutout PNG se réduit en alpha prémultiplié, jamais autrement.** Les pixels
transparents de `twd1` portaient du blanc en RGB ; un rééchantillonnage naïf mêle
ce blanc aux bords et cerne le personnage d'un halo clair, très visible sur le
fond sombre de la page. Multiplier RGB par alpha avant le redimensionnement, puis
diviser après, l'enlève entièrement.

Trois choses apprises en le faisant :

- **Un WebP déjà à la bonne taille ne se retouche pas.** Le ré-encoder dégrade
  l'image pour rien, et le premier passage a fait *grossir* `autresunivers.webp` de
  322 à 392 Ko. Le script ne touche un WebP que s'il doit le réduire.
- **Le renommage traverse toute la chaîne.** 59 fichiers ont changé d'extension,
  soit 318 références dans les protos source, `seo.json` et `spec-avatar.json` —
  `img` étant un champ technique, `traduire.mjs` le recopie tel quel et l'anglais
  suit. Une référence oubliée ne lève rien : l'image manque, c'est tout.
- **Le contrôle se fait au navigateur, pas au disque.** La moitié des visuels sont
  posés par le JS au chargement et n'apparaissent nulle part dans le HTML :
  `document.images` avec `naturalWidth === 0` est ce qui dit qu'une image est morte.

Le script de conversion n'est pas versionné — il ne resservira pas tel quel. Ce qui
compte est la règle : **une image neuve se pose déjà à sa taille d'affichage ×4, en
WebP.** Une capture de 4 000 px déposée dans `images/` annule le travail sans que
rien ne le signale.

## Niveaux d'importance

`level:"must"` (⭐), `level:"important"` (🚨), `level:"bonus"` (rien).
DC et Avatar écrivent `imp` là où Star Wars et Marvel écrivent `important` : un
parseur doit accepter les deux.
Répartitions actuelles :
Star Wars 62 (9 must / 37 important / 16 bonus), Marvel 121 (49 / 30 / 42),
DC 147 (117 imp / 30 bonus), Avatar 69 (17 / 18 / 34),
The Walking Dead 45 (29 must / 3 important / 13 bonus),
Dragon Age 44 (15 must / 10 important / 19 bonus),
Assassin's Creed 111 (34 must / 36 important / 41 bonus),
DC Animation 80 (61 must / 9 important / 10 bonus).

**Star Trek n'a pas de niveaux du tout** : sa page trie par type de média et par
repère, pas par importance. Ses 248 entrées sortent donc « sans niveau ». Un
parseur qui reconnaît une entrée à son seul niveau les fait toutes tomber du côté
ignoré, sans erreur et sans message : une entrée se reconnaît à son niveau **ou**
à son couple titre+date. Les deux ensemble, parce que cinq entrées Marvel n'ont
pas de date et que le titre+date seul les perdait.

## Pièges déjà rencontrés

- `const RT` au premier niveau d'un script **n'est pas** sur `window` : lire l'identifiant
  nu protégé par `typeof`, jamais `window.RT`.
- Un parseur d'entrées doit accepter la clé **avec et sans guillemets** : les pages
  d'avant écrivaient `{id:"sw-ep1"`, les données de la refonte sortent d'une
  sérialisation JSON et écrivent `{"id":"sw-ep1"`. Une seule des deux formes rend
  zéro entrée — sans erreur et sans message.
- Les apostrophes internes (`Propriété d'Ezra Bridger`) cassent un regex naïf :
  apparier la même quote.
- `crisis-start` est un `type:"separator"`, pas une entrée : DC compte 146 entrées
  et 147 identifiants. Ce n'est pas un manque.
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

- **Un constructeur de timeline**, idée de Niko le 1er septembre 2026, en
  réponse aux demandes de réordonnancement. Plutôt que de laisser bouger
  l'ordre des huit guides — ce que « Ce qui est tranché » écarte, les badges
  et les ères y tenant —, une page où le visiteur fait *sa* timeline : ses
  entrées, son ordre, ses repères, sans rien qui présuppose un travail
  éditorial derrière.

  Deux briques existent déjà. `e-perso.js` sait poser des entrées dans une
  structure d'ères avant le rendu, et le dialogue de `e-app.js` sait les
  saisir, image comprise, réduite dans le navigateur. Ce qui manque est la
  page elle-même, la création d'ères, et un moyen de sortir le résultat —
  un fichier JSON, faute de serveur pour le partager.

  Rien n'est commencé, et rien ne presse : la demande est venue une fois.
- Monétisation : rien n'est branché, et « Soutenir le site » a quitté le pied de
  page le 14 août 2026. Demander avant qu'on ait demandé comment payer ne se lit
  pas bien. Le lien reviendra le jour où il y aura une page derrière.
- **Le formulaire de contact envoie par `mailto:`, faute de serveur.** Le site est
  statique : personne ne peut recevoir un POST. Le vrai envoi demande un compte
  chez un passeur de formulaire (Formspree, Web3Forms — gratuits à ce volume) et
  sa clé ; seul le corps de `envoyer()`, dans `_proto/e-app.js`, change alors.
- **Un univers ajouté se met dans les textes, pas seulement dans le code.** Trois
  endroits énumèrent les univers : l'accroche de « À venir » (`.dek`), les deux
  `ogTitle` et les deux `desc` de `seo.json`, et le pied de page de toutes les
  pages. **Les deux premiers ne comptent que ce que le radar suit, pas ce que le
  site publie.** Dragon Age n'y est donc pas entré le 20 août 2026 : `radar.py`
  n'a pas de source pour les jeux, la colonne serait vide et l'accroche
  promettrait des sorties qui n'arriveront jamais. Le pied de page, lui, énumère
  bien les huit — c'est la liste des univers du site, pas celle du radar.
  **Assassin's Creed est le cas limite** : le radar le suit depuis le 25 août
  2026, mais ses sept œuvres annoncées sont toutes sans date. L'annoncer à
  l'accroche promettrait des sorties que la colonne ne montre pas. Il y entre —
  accroche, deux `ogTitle`, deux `desc` — le jour où une date tombe, pas avant. **Plus les deux `title` de `a-venir`** : ils portaient la même
  énumération et faisaient 103 signes rendus, quand Google en montre soixante —
  le nom du site, en fin de titre, était coupé sur les deux pages les plus
  souvent partagées. Ils s'arrêtent depuis le 18 août 2026 à « Star Wars,
  Marvel, DC », les six restant dans l'`ogTitle` et la description, où la
  longueur ne coûte rien. Un septième univers n'a donc plus à y entrer.
  Les trois portent Star Trek depuis le 13 août 2026 et The Walking Dead
  depuis le 16 ; pour Star Trek, les deux premiers y sont entrés avec deux mois
  de retard sur la page elle-même, parce que rien ne les relie à la liste des
  univers. La formule est la sienne, celle du pied de page : « Star Wars,
  Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age et
  Assassin's Creed ».
  L'accroche anglaise se tient dans `TRADUCTIONS` de `traduire-pages.mjs`, la
  prod n'ayant jamais porté cette phrase-là.

  Trois autres décomptes suivent sur l'accueil, et aucun n'est calculé : le
  sous-titre (« Huit chronologies… »), le HUD (`0 / 845`, « 8 univers · 535 au
  dossier ») et le numéro de la case verrouillée. Huit univers plus elle font
  **neuf** cases dans une grille à deux colonnes : la case « Bientôt » tombe
  seule sur la dernière rangée, et `.slot.lock` prend alors la largeur entière
  parce qu'elle est sur un rang impair (`:nth-child(odd)`). À sept univers la
  rangée était pleine et la case gardait la taille des autres : la règle
  alterne d'un univers à l'autre, et c'est voulu. Ne pas remettre
  `grid-column:1/-1` en dur — au neuvième univers il laisserait un trou à
  droite de la huitième.
- Le mois « À jour · <mois> » des huit cases de l'accueil est écrit à la main,
  huit fois, dans `e-accueil.html` — et une neuvième dans `traduire-pages.mjs`
  quand le mois n'a pas d'homologue en prod. **Ce n'est pas une donnée calculée,
  et il ne faut pas l'automatiser** : il annonce la dernière mise à jour
  *éditoriale* de l'univers, ce que Niko sait et qu'aucun fichier ne dit — la
  date git d'un `data-*.js` bouge à la moindre correction globale (`legal3` a
  touché les sept le 18 août 2026 sans qu'une seule œuvre soit ajoutée). Il se
  met à jour à la main, à l'ajout d'un média, et il est dans la checklist.
  Ce qui a été corrigé le 18 août, c'est l'anglais : trois cases disaient
  « Updated » et trois « Up to date ». Les neuf portent maintenant « Updated · »,
  ou « In progress » pour la case verrouillée.

## Ce qui est tranché, et ne revient pas

- **Le visiteur ne réordonne pas la timeline.** Tranché par Niko le 1er
  septembre 2026, à la première demande venue des courriers. Il peut ajouter
  ce qui manque et choisir où son ajout se place — c'est le champ « Juste
  après » —, mais les entrées du guide restent où elles sont.

  La raison n'est pas le coût : réutiliser le select « Juste après » pour un
  bouton « Déplacer » aurait tenu en quatre heures, `e-perso.js` manipulant
  déjà `D.eras` avant le rendu. C'est que **les ères et les badges tiennent
  à l'ordre**. Six badges Star Wars et un badge Marvel portent
  `trigger:"last"` et se débloquent sur la **dernière entrée d'une ère** :
  sortir celle qui y était, ou en pousser une autre à sa place, change quel
  badge tombe et quand — sans erreur, sans message. Les bannières d'ère et
  les notes de placement (« ne pas regarder avant… ») supposent le même
  ordre.

  Le glisser-déposer, lui, n'a jamais été sur la table : trois à quatre
  jours pour 248 entrées réparties en sections, des cartes qui se déplient,
  et un conflit avec le défilement sur mobile.

  La suite est ailleurs — **un outil pour se construire sa propre timeline**,
  où l'ordre, les ères et les repères seraient à celui qui la fait. Voir
  « Ce qui reste à faire ». Ne pas reproposer le déplacement dans les huit
  guides en attendant : ce serait cet outil-là, en moins bien, et au prix de
  la cohérence de ceux-ci.

- **« Reprendre » ramène à la dernière entrée vue, pas à la première non
  vue.** Tranché par Niko le 26 août 2026. Le bouton visait jusque-là le
  premier trou de la progression, ce qui renvoyait au début dès qu'une œuvre
  avait été sautée : sauter est un choix, pas un oubli, et le bouton n'a pas
  à y ramener. `startBtn()` prend donc la **dernière** entrée cochée dans
  l'ordre de `ALL` — `vues[vues.length-1]` —, avec `ALL[0]` et le libellé
  « Commencer » quand rien n'est coché. Les neuf pages qui ont ce bouton
  portent le même bloc, et il faut l'écrire dans les **sources** : les cinq
  protos français (`e-starwars`, `e-marvel`, `e-dc`, `e-avatar`,
  `e-dossier-star-wars`) et les quatre protos anglais des chaînes inversées
  (`en-startrek`, `en-twd`, `en-dragonage`, `en-assassinscreed`). L'accueil
  et la liste des Dossiers n'ont rien à changer : leur bandeau de reprise ne
  fait que renvoyer vers la page avec `#reprendre`, qui rejoue le clic.
- **Les deux dates d'Assassin's Creed se lisent côte à côte, sous le
  titre, à toute largeur, et l'absence de présent ne s'écrit pas.**
  Tranché par Niko le 26 août 2026. La grande date en or est celle du
  présent, le cadre rouge « Souvenirs » celle du passé : séparées sur deux
  lignes, elles n'ont plus l'air d'un couple. La colonne de texte tombait à
  100 px sur un téléphone — la vignette en prenait 128 — et le cadre, qui
  ne se coupe pas, passait donc sous le grand nombre quand il ne débordait
  pas de la carte.

  Trois gestes sous 560 px, et **la bande reste où elle a toujours été** :
  la vignette devient fluide (`clamp(64px,23vw,96px)`), les corps se
  resserrent d'un cran de plus sous 400 px, et **le mot « Souvenirs »
  quitte le cadre** — une quarantaine de pixels pour redire ce que le rouge
  dit déjà, là où la date entière en fait soixante. Le cadre garde l'encre
  des souvenirs et l'or reste au présent : les deux se distinguent à la
  couleur, comme partout ailleurs sur la page. Le libellé revient au-dessus
  de 560 px. Le pire couple du guide — « 1998-2000 » et « 1888-1918 », les
  deux dates de *The Fall* — s'arrête alors à 34 px du chevron sur un écran
  de 375 px, à 61 px sur 430.

  Deux choses à ne pas défaire. **`white-space:nowrap` sur `.bu-meta .d`
  n'est pas une précaution** : « 1998-2000 » se coupe au tiret, et *The
  Fall* écrivait « 1998- » puis « 2000 » sous lui-même, le cadre à côté du
  premier morceau. Deux dates d'intervalle dans le guide, une seule tombait
  dessus. Et **ne pas remettre `flex-wrap:wrap` sur `.bu-meta` en mobile**,
  c'est ce qui faisait tomber le cadre à la ligne.

  Le `—` qui tenait la place du présent a disparu de partout, mobile
  comme bureau : 27 des 111 entrées n'en ont pas, et un tiret se lit comme
  une donnée manquante là où il n'y a rien à manquer — c'est déjà la règle
  du cadre « Souvenirs », qui ne se pose que si la date existe.
- **Une date de timeline ne se traduit jamais, et « BC » reste « BC ».**
  Tranché par Niko le 25 août 2026, et la règle vaut pour **toutes** les
  timelines, pas seulement Assassin's Creed. Une date est un repère qu'on lit
  d'un coup d'œil et qu'on compare d'une page à l'autre, pas une phrase :
  « 49-43 BC » se lit pareil dans les deux langues, « 49-43 av. J.-C. » allonge
  la pastille sans rien apprendre à personne. C'est déjà ce que font « BBY »
  chez Star Wars et « BG » chez Avatar Legends — à cette différence près que
  ceux-là sont des unités inventées, alors que « BC » a un équivalent français
  et que la tentation de le poser revient. Le champ `date` est donc dans
  `IDENTIQUES_PAR_CHAMP` de chaque script de traduction, avec `present` là où
  il existe. Cela ne concerne que les dates : dans la prose d'un synopsis,
  « le Vᵉ siècle av. J.-C. » reste du français.
- **Dragon Age n'entre pas au radar.** Tranché par Niko le 20 août 2026 : la
  saga est au point mort, rien n'est annoncé après *The Veilguard*. La raison
  technique tenait déjà — `radar.py` n'a aucune source pour les jeux, les DLC,
  les romans et les comics, et interroger EA ou BioWare par société ramènerait
  le catalogue EA entier — mais celle-ci suffit seule : un radar sans rien à
  annoncer est une colonne vide. L'accroche de « À venir », les deux `ogTitle`
  et les deux `desc` de `seo.json` continuent donc de n'énumérer que les six
  univers que le radar suit. Le pied de page, lui, en compte bien huit : c'est
  la liste des univers du site, pas celle du radar. Ne pas le reproposer tant
  qu'un jeu n'est pas daté.
- **Le visuel d'univers de Dragon Age est recadré, pas encadré.**
  `images/dragonage.webp` arrivait avec un encadrement doré à coins à encoches ;
  la case de l'accueil, en 20/9 et `object-fit:cover`, le rognait en haut et en
  bas mais le laissait voir à gauche et à droite. Le cadre est retiré du fichier
  (1733×907 → 1575×813), pas masqué par un `transform:scale()` posé sur un seul
  univers : le même fichier sert la case, la bannière de la page et l'`og:image`,
  et une règle de zoom aurait eu à coexister avec celui du survol. **La leçon
  vaut pour tout visuel neuf** — un cadre, un filigrane ou une marge dans la
  source se voit dans la case, et ça se corrige dans l'image.
- **La bannière Star Trek reste en 576×324.** Elle est étirée sur la case pleine
  largeur de l'accueil et sur son propre bandeau, là où les autres univers ont
  1280 px ou plus. Il n'existe pas de source meilleure, et agrandir est pire que
  le défaut. Ne pas le reproposer.
- **Avatar Legends n'aura pas de table `RT`.** Ce n'est pas un oubli de
  `runtime.py` : sa timeline mêle comics et romans, qui n'ont pas de durée. Un
  compteur « temps restant » qui n'additionnerait qu'une partie des entrées
  mentirait sur le reste. Star Wars, Marvel et DC en ont une parce qu'elles sont
  presque entièrement à l'écran.
- **Les relectures sont faites, validées par Niko le 19 août 2026.** Les 120
  phrases françaises de Star Trek — titres de films, huit ères, trente réponses
  de FAQ, neuf bandeaux, badges — et les 257 phrases anglaises écrites, dont
  tout Avatar Legends, qui n'avait aucune page anglaise en prod à retrouver. Le
  reste du site n'a jamais été traduit, il a été retrouvé mot pour mot : il n'y
  a rien à relire là. `A-RELIRE-EN.md` n'est plus un document ouvert.
