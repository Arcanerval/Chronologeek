# Chronologeek

Référence mondiale des timelines geek, publiée sur GitHub Pages à `chronologeek.app`.
Site statique : HTML/CSS/JS vanilla, pas de build front, pas de framework.
Des scripts Python génèrent ou enrichissent les pages et sont lancés par GitHub Actions.

## Structure

- Racine = version **anglaise** : `starwars.html`, `marvel.html`, `dc.html`,
  `avatar.html`, `startrek.html`
- `/fr/` = version **française**, mêmes noms de fichiers
- `/deep-dives/star-wars.html` et `/fr/dossiers/star-wars.html` = le Dossier
  (534 romans, comics et fictions audio, plus 63 repères écran)
- `index.html`, `whats-new.html` / `nouveautes.html`, `upcoming.html` / `a-venir.html`
- `/data/` — les entrées de chaque page, `<nom de page>-fr.js` et `-en.js`
- `app.js` — le moteur, bilingue, un seul fichier
- `radar.html` — vue interne du radar, `noindex`, hors du site public

### Ce qui s'édite, et ce qui se produit

**Les vingt pages du site ne s'éditent pas.** Elles sont produites depuis
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
20 pages + /data/ + app.js               ← le site, jamais édité à la main
```

Star Trek prend cette chaîne à l'envers : sa source est anglaise, et
`node _proto/traduire-startrek.mjs` en tire le français. Voir « Star Trek, la
chaîne inversée » plus bas.

`py sync.py check` vérifie ensuite la parité des deux langues.

**Règle absolue : toute modification d'une page racine doit être répliquée dans `/fr/`.**
Elle tient toujours — elle est simplement assurée par la chaîne : on écrit en
français, l'anglais se déduit, et les deux sortent ensemble.

## Charte couleurs

Univers : Star Wars `#4d9fff`, Marvel `#e23636`, DC `#f5c842`, Avatar `#7dd3fc`.
Chaque page pose `data-universe` sur `<body>` (`sw`, `mcu`, `dc`, `avatar`) et `--tl-color`.
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
vrai risque du dépôt. Les 534 entrées du Dossier vivent dans `_proto/data-dossier-sw.js`,
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
à côté de la vraie. Aucun des cinq guides ne suit de podcast. Et côté Star Wars,
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

### Les quatre sources du radar

`source_tmdb` sert les quatre premiers univers, par **société de production** —
Lucasfilm, Marvel Studios, DC Studios, Avatar Studios. `source_avatar_almanac` y
ajoute l'écrit, que TMDB ne couvre pas, et `source_wookieepedia` la timeline des
médias canon Star Wars.

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

## Synchronisation FR/EN

`sync.py` sert la règle absolue ci-dessus. Contrairement aux scripts de génération,
il n'utilise pas `TMDB_KEY` et aucune action ne le lance : il s'appelle à la main.
L'interpréteur est `py` sur la machine de Niko, pas `python`.

- `py sync.py check` — vérifie les dix paires : même nombre de lignes dans le
  HTML, mêmes identifiants dans les données. Les dix clés sont `sw`, `mcu`, `dc`,
  `avatar`, `startrek`, `dossier`, `news`, `accueil`, `avenir`, `dossiers`.
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
message. Le proto source est le français partout, **sauf Star Trek** dont
`langue_source` vaut `en` : écrire dans `e-startrek.html` serait écrasé au
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
  aucun univers n'était cliquable ; depuis Star Wars, ni Marvel ni DC. Un seul `#`
  reste volontaire — la page courante (`aria-current="page"`).
- `node _proto/relecture.mjs` — regroupe dans `A-RELIRE-EN.md` les seules phrases
  qu'il a fallu écrire, contre plusieurs milliers reprises telles quelles. **Ce
  fichier et les trois JSON dont il sort ne sont plus versionnés** (voir
  `.gitignore`) : Niko ne relit pas un document, il ouvre le proto anglais au
  navigateur et valide ou non. Le script reste, sa sortie est locale.
- `node _proto/traduire-startrek.mjs` — le seul qui traduit dans l'autre sens :
  `e-startrek.html` et `data-startrek.js` depuis les fichiers anglais, qui sont la
  source. Voir « Star Trek, la chaîne inversée ».
- `node _proto/publier.mjs` — pose les vingt pages, `/data/` et `app.js`. Voir
  « La publication » plus bas.

Les quatre premiers acceptent `--check`, qui n'écrit rien et affiche le bilan.
**Ne jamais éditer un fichier `en-*` à la main** : corriger la table `TRADUCTIONS`
du script concerné, puis relancer.

## La publication

`node _proto/publier.mjs` fait quatre choses, et rien d'autre.

**1. Le référencement.** Les protos n'ont aucune des lignes que portent les pages
en ligne — canonique, `hreflang`, Open Graph, Twitter Card, description — et ils
posent `noindex`. Les recopier tels quels aurait effacé le référencement de
vingt pages : rien n'aurait cassé, la console serait restée vide, et le site
aurait disparu des résultats. Ces textes vivent dans **`_proto/seo.json`**, extrait
une fois des pages d'avant la refonte, avec Avatar écrit à la main faute de page à
reprendre. Le script ne les relit pas dans les pages publiées : celles-ci sont sa
sortie, et la boucle aurait marché sans que rien ne dise d'où venait la valeur.

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

**Ne jamais inscrire Star Trek dans `PAGES` de `traduire-pages.mjs`.** Ce script
produit l'anglais depuis le français : il écraserait la source avec une
retraduction de sa propre sortie, sans erreur et sans message.

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
`e-accueil.html` (« 5 univers · 534 au dossier »). Le reste est calculé au
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
les vingt pages partagent. L'écrire dans les protos aurait voulu dire vingt copies
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
  modal, et les vingt pages posent `*{margin:0}` : sans le rappel, la boîte se colle
  en haut à gauche de l'écran. Rien dans la console, la page marche — elle est juste
  de travers.
- **Le lien porte `data-contact` et `href="#contact"`.** L'attribut est ce que le
  script cherche ; l'ancre évite un `href="#"` de plus. `cabler-nav.mjs` ne voit
  donc plus qu'un seul `#` légitime, celui de la page courante.

Au-delà de 1 500 signes les messageries tronquent le corps sans prévenir : le champ
est borné, et un compteur apparaît à partir de 1 200.

## Niveaux d'importance

`level:"must"` (⭐), `level:"important"` (🚨), `level:"bonus"` (rien).
DC et Avatar écrivent `imp` là où Star Wars et Marvel écrivent `important` : un
parseur doit accepter les deux.
Répartitions actuelles :
Star Wars 61 (9 must / 37 important / 15 bonus), Marvel 121 (49 / 30 / 42),
DC 147 (117 imp / 30 bonus), Avatar 69 (17 / 18 / 34).

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

- Monétisation : rien n'est branché, et « Soutenir le site » a quitté le pied de
  page le 14 août 2026. Demander avant qu'on ait demandé comment payer ne se lit
  pas bien. Le lien reviendra le jour où il y aura une page derrière.
- **Le formulaire de contact envoie par `mailto:`, faute de serveur.** Le site est
  statique : personne ne peut recevoir un POST. Le vrai envoi demande un compte
  chez un passeur de formulaire (Formspree, Web3Forms — gratuits à ce volume) et
  sa clé ; seul le corps de `envoyer()`, dans `_proto/e-app.js`, change alors.
- **Un univers ajouté se met dans les textes, pas seulement dans le code.** Trois
  endroits énumèrent les cinq : l'accroche de « À venir » (`.dek`), les deux
  titres et les deux descriptions de `seo.json`, et le pied de page de toutes les
  pages. Les trois portent Star Trek depuis le 13 août 2026 ; les deux premiers y
  sont entrés avec deux mois de retard sur la page elle-même, parce que rien ne
  les relie à la liste des univers. La formule est la sienne, celle du pied de
  page : « Star Wars, Marvel, DC, Avatar et Star Trek ». L'accroche anglaise se
  tient dans `TRADUCTIONS` de `traduire-pages.mjs`, la prod n'ayant jamais porté
  cette phrase-là.
- Les 120 phrases françaises de Star Trek sont **écrites, pas retrouvées** : les
  titres de films, les huit ères, les trente réponses de FAQ, les neuf bandeaux
  et les badges. Elles se relisent au navigateur sur `e-startrek.html`.
- Sa bannière `images/startrek.jpg` fait 576×324 : elle est étirée sur la case
  pleine largeur de l'accueil et sur son propre bandeau. Les autres univers ont
  1280 px ou plus.
- Relecture de l'anglais écrit — 147 phrases de données et 110 de pages. Ce sont
  les seules que la prod n'avait pas ; tout le reste est repris mot pour mot. Elle
  se fait **au navigateur, sur le proto anglais**, pas dans `A-RELIRE-EN.md`. Le
  bon geste serait de marquer ces phrases-là dans le proto pour qu'elles se voient
  à l'écran ; ce n'est pas fait.
- Avatar n'a pas de table `RT` : pas de temps de visionnage, donc pas de compteur
  « temps restant » sur sa page. Les trois autres univers en ont une.
- Images trop lourdes — 21 fichiers de `images/` dépassent 900 Ko, dont
  `battlefront.png` à 20,8 Mo en 5333×3000 pour une vignette. Redimensionnement
  décidé le 10 août 2026.
- Un bouton de maquette est publié en ligne : « proto : simuler une progression »
  (`.demo`), sur l'accueil et sur la page des Dossiers, dans les deux langues.
  `publier.mjs` le recopie tel quel — il devrait le retirer et refuser de laisser
  passer, comme il le fait déjà pour `noindex`.
- La correction de `ST_FRAICHEUR` n'a **pas encore tourné en vrai** : `TMDB_KEY`
  vit dans un secret GitHub et rien ne se teste en local. Le premier passage
  suivant de `radar.yml` est le contrôle — lire son journal, section « Star Trek »,
  et vérifier que la ligne annonce des épisodes plutôt que « rien retenu ». Le
  journal du passage est dans `radar.html`, qui est commité avec `radar.json` :
  `git show <commit>:radar.html`, le bloc `.rep` en fin de fichier. C'est lui qui
  a nommé le coupable la première fois.
