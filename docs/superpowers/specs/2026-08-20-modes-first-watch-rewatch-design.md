# Deux parcours par univers : découverte et rewatch

*20 août 2026 — conception validée avec Niko, à implémenter sur Star Wars seul.*

## Ce qu'on fait

Chaque univers pourra proposer **deux parcours** au lieu d'un : celui qu'on
suit la première fois, et celui qu'on suit quand on connaît déjà. Star Wars
essuie les plâtres ; les six autres univers suivront si l'idée tient.

**La page actuelle est le parcours de découverte.** C'est tranché : son accroche
annonce déjà « l'ordre le plus optimisé, réfléchi et étudié pendant des années »,
ce qui est un ordre de première fois, pas un ordre d'archiviste. `/starwars` et
`/fr/starwars` gardent donc leur URL, leur référencement et leurs 61 entrées.
Le parcours **rewatch** est le nouveau, et c'est lui qui reste à écrire.

## Pourquoi un second tableau d'ères, et pas un rang de tri

C'est la découverte qui a façonné toute la conception, et elle mérite d'être
écrite ici parce qu'elle n'est pas évidente à la lecture des données.

Les 61 entrées de `data.js` ne sont pas des œuvres : ce sont **des morceaux
taillés pour un ordre donné**. *The Clone Wars* y est coupée en six —
`sw-tcw-pre`, `sw-tcw-22`, `sw-tcw-21`, `sw-tcw-20`, `sw-tcw-19`,
`sw-tcw-rsith` — et chacune liste ses épisodes hors ordre de diffusion, par
année BBY. Les épisodes de *Tales of the Jedi* sont éclatés de la même façon,
placés là où ils ne racontent pas la fin avant le début.

Un second parcours ne réordonne donc pas les mêmes entrées : il en découpe
d'autres. Six lignes de Clone Wars peuvent redevenir une seule, un flashback
peut retrouver sa place vraie plutôt que sa place prudente. Un champ `ord2`
posé sur chaque entrée ne saurait pas exprimer ça.

D'où : **un second tableau d'ères**, avec ses propres titres et son propre
découpage.

## 1. La donnée

`_proto/data.js` gagne une clé au premier niveau de `DATA_SW`, à côté de
`eras` :

```js
const DATA_SW={
  id:"sw", title:"Star Wars", …,
  eras:[ … ],          // existant, inchangé : le parcours DÉCOUVERTE
  erasRewatch:[ … ],   // nouveau : le parcours REWATCH
}
```

`erasRewatch` a la même forme que `eras` — un tableau d'objets
`{title, entries:[…]}` — avec une seule addition : une entrée peut n'être
qu'une **référence**.

### Les trois formes d'une entrée de `erasRewatch`

**a. La référence**, quand l'œuvre est identique dans les deux parcours :

```js
{ref:"sw-ep1"}
```

Rien d'autre. Pas de titre, pas de FAQ, pas de visuel, pas de niveau. Le
moteur va chercher l'entrée dans `eras` et l'affiche telle quelle. Corriger
la FAQ d'Épisode I la corrige dans les deux parcours, sans qu'on y pense.
C'est ce qui rend le second parcours tenable dans le temps : il ne duplique
aucune prose.

**b. La référence amendée**, quand l'œuvre est la même mais dit autre chose :

```js
{ref:"sw-toj2", note:"Ici, le flashback est à sa vraie place"}
```

Les clés posées à côté de `ref` écrasent celles de l'entrée d'origine, champ
par champ. Sert surtout à `note` et à `date`.

**c. L'entrée propre**, quand le rewatch découpe autrement. Elle s'écrit en
entier, avec un identifiant à elle, préfixé `sw-r-` :

```js
{id:"sw-r-tcw", type:"anime", level:"important", tmdb:"4194", media:"tv",
 img:"/images/clonewarsserie.webp", title:"The Clone Wars",
 date:"22–19 BBY", subitems:["Saison 1","Saison 2", …],
 covers:["sw-tcw-pre","sw-tcw-22","sw-tcw-21","sw-tcw-20","sw-tcw-19","sw-tcw-rsith"],
 faq:{…}}
```

`covers` est le pont : il dit de quelles entrées du parcours de découverte
celle-ci tient lieu. Deux choses en dépendent, la progression et les badges ;
voir plus bas.

### Le champ `warn`

Les avertissements spoiler tiennent dans un champ `warn:"…"` posé sur
l'entrée. **Il ne s'affiche qu'en mode découverte** — quelqu'un qui revoit la
saga n'a rien à protéger. C'est du texte, donc la seule addition de ce chantier
qui passe par la traduction : `traduire.mjs` doit l'ajouter à ses champs
textuels, faute de quoi il ressortira français sur la page anglaise sans qu'une
ligne le signale (c'est exactement ce qui est arrivé à `faq.comment` et
`faq.postcredits`, et c'est pourquoi le script travaille en liste noire).

`ref` et `covers` sont au contraire des champs **techniques** : ils entrent dans
la liste des clés que `traduire.mjs` recopie telles quelles, comme `img` et `ol`.

## 2. Le moteur

Tout tient dans `_proto/e-starwars.html`, dans le bloc de script qui commence
ligne 878. Rien à toucher dans `e-app.js`.

### La résolution du mode

Une variable, lue une fois, en tête :

```js
var MODE = (document.body.dataset.mode === 'rewatch' ||
            location.hash === '#rewatch') ? 'rewatch' : 'first';
var ERAS = MODE === 'rewatch' ? resolve(D.erasRewatch) : D.eras;
```

`resolve()` remplace chaque `{ref:…}` par l'entrée d'origine de `D.eras`,
fusionnée avec les clés posées à côté. Il sort en console si un `ref` ne
désigne rien — une référence morte rendrait une carte vide, sans erreur.

`data-mode` sur le `<body>` est posé par `publier.mjs` ; le `#rewatch` sert
pendant la première phase, avant qu'il y ait une seconde URL.

### Les six endroits qui lisent `D.eras`

Ils passent tous à `ERAS`. Aucun ne demande plus qu'une substitution :

| ligne | ce que c'est |
|---|---|
| 910 | la construction de `ALL` |
| 889 | `eraArt()`, le visuel d'ère |
| 1040 | `applyFilters()`, la boucle d'affichage |
| 1065 | `tally()`, le décompte par ère |
| ~1484 | `head()`, les bandes d'ère |
| — | le rail des ères, s'il lit `D.eras` |

### Quatre conséquences, et leur réponse

**La progression est partagée, et c'est voulu.** Une seule clé
`localStorage`, `cg-proto-sw`, inchangée. Cocher Épisode I dans un parcours le
coche dans l'autre : c'est la même œuvre, on l'a vue ou on ne l'a pas vue.

Le pont, c'est `covers`. Quand on coche `sw-r-tcw`, le moteur coche aussi les
six identifiants qu'elle couvre ; quand les six sont cochés, `sw-r-tcw`
s'affiche cochée. Une fonction dans les deux sens, appelée à l'écriture et à
la lecture de `prog`.

**Le HUD se recalcule tout seul.** `tally()` boucle sur `ALL`, qui est déjà
construit depuis `ERAS`. Le total « / 61 » devient celui du parcours rewatch,
quel qu'il soit, sans qu'on y touche.

**Les badges sont définis sur les identifiants de découverte**, puisque c'est
le parcours qui existe. `needOf()` et `MARKS` bouclent sur `ALL`, donc sur le
mode courant, et une entrée `sw-r-*` n'est nommée dans aucun badge : un badge
`trigger:'last'` deviendrait inatteignable en rewatch.

Réponse : `needOf()` traduit ses identifiants par `covers` avant de compter.
Un badge qui exige les six morceaux de Clone Wars est satisfait par
`sw-r-tcw` seule. **À vérifier à l'écran badge par badge** — c'est le genre de
calcul qui rend un chiffre plausible plutôt qu'une erreur.

**`runtime.py` ne connaît pas les nouveaux identifiants.** Il écrit
`RT={id:minutes}` dans `_proto/data.js` en lisant les entrées ; les `sw-r-*`
n'y seront pas, et « restant à voir » comptera faux. Deux voies, la seconde
préférée :

1. lui apprendre à lire `erasRewatch` — mais il faudrait qu'il sache résoudre
   les `ref`, et il n'a rien à voir avec cette logique ;
2. **dériver la durée depuis `covers`** dans la page : `rt(e)` additionne les
   durées des entrées couvertes quand l'entrée n'a pas la sienne. Trois lignes,
   et `runtime.py` n'est pas touché.

### La bascule à l'écran

**Deux onglets, en haut de la timeline, à côté du titre** — pas dans le
panneau de filtres. Ce n'est pas un filtre, c'est le parcours : un filtre
retire des lignes d'une liste, la bascule change la liste.

Et ce sont **des liens, pas des boutons JS**. En phase 1, `<a href="#rewatch">`
et un `hashchange` qui recharge la page ; en phase 2, `<a href="/starwars-rewatch">`
et plus une ligne de JS.

La raison est concrète : `ALL` est construit en **mutant les entrées**
(`e.n=ALL.length`, ligne 911). Basculer sans recharger laisserait des rangs
périmés sur des objets partagés entre les deux parcours, et le bouton
« Reprendre » emmènerait au mauvais endroit. Recharger supprime toute cette
classe de bugs, et sur une page servie par le service worker ça ne coûte rien.

L'onglet actif porte `aria-current="page"`, comme le fait déjà le menu.

## 3. La publication, en deux temps

### Phase 1 — le mode, sans nouvelle URL

`#rewatch` sur la page existante. Rien à toucher dans `seo.json`,
`sitemap.xml`, `sw.js`, `jsonld.mjs` ni `sync.py`.

C'est là qu'est tout le risque : le moteur, et surtout l'éditorial. Autant le
voir à l'écran avant d'engager le référencement du site.

### Phase 2 — la seconde URL

Une fois `data-mode` en place, la seconde page est **le même proto publié deux
fois**. Rien à ajouter dans `traduire-pages.mjs`, rien de neuf à relire, rien
à traduire — c'est ce qui rend l'opération peu coûteuse.

| fichier | ce qu'on y ajoute |
|---|---|
| `ROUTES` de `_proto/publier.mjs` | un bloc, avec `mode:'rewatch'` |
| `_proto/seo.json` | une clé `sw-rewatch` (fr + en) |
| `sitemap.xml` | 24 → 26 URL |
| `PRECACHE` de `sw.js` | 2 lignes |
| `_proto/jsonld.mjs` | fil d'Ariane + `ItemList` |
| `PAGES` de `sync.py` | une paire |
| menu et pied de page | **rien** |

Le menu ne bouge pas : il a déjà dû passer en déroulant à six univers, il ne
prendra pas quatorze entrées de plus. Les deux onglets de la page se lient
l'un à l'autre, et c'est le seul chemin — ce qui est cohérent, on ne choisit
un parcours qu'une fois arrivé sur l'univers.

`publier.mjs` doit apprendre une seule chose : poser `data-mode` sur le
`<body>` de la sortie. Son garde-fou `TRACES` gagne la vérification
correspondante — une page `-rewatch` publiée sans son `data-mode` afficherait
le parcours de découverte à une URL qui promet l'autre, sans une erreur.

**Le nom de l'URL** : `/starwars-rewatch` et `/fr/starwars-rewatch`. Le mot est
lu et compris en français dans ce milieu, et les alternatives françaises
(« revisionnage ») font une URL que personne ne tape. À confirmer par Niko.

## 4. L'éditorial, tranché par Niko le 20 août 2026

**Le rewatch reste une timeline écran.** Le Dossier garde le terrain des 534
romans, comics et fictions audio ; le second parcours ne s'en approche pas.
63 entrées contre 61, pour 297 heures des deux côtés — ce sont les mêmes
œuvres, autrement découpées.

Le parcours de découverte est déjà chronologique : ce que le rewatch change
n'est donc pas l'ordre des années, c'est **le traitement des flashbacks**.

**Cinq flashbacks retrouvent leur place chronologique** et perdent avec elle
leur pastille FLASHBACK et leur FAQ « pourquoi le regarder ici », qui ne
justifiait qu'une place prudente : *Tales of the Jedi* 1, 2, 3 et 4 remontent
avant et autour de l'Épisode I, et la mission 12 de *Battlefront II* passe
avant l'Épisode VII.

**Cinq restent des flashbacks.** Deux ne bougent pas — *Tales of the Jedi* 5,
juste après l'Épisode III, et le prologue de *Battlefront II*. Les trois
*Tales of the Empire* changent de place sans cesser d'en être, et chacun
**coupe en deux** le panneau où il atterrit :

| épisode | sa place au rewatch | panneau coupé |
|---|---|---|
| Tales of the Empire 1 | après les épisodes 19-22 de la saison 4 | `sw-tcw-20` |
| Tales of the Empire 2 | entre les saisons 2 et 3 de *Rebels* | `sw-rebels-s2` |
| Tales of the Empire 3 | entre les saisons 1 et 2 de *The Mandalorian* | `sw-mando-s1` |

Leur FAQ « pourquoi ici » part elle aussi : elle renvoyait à leur rencontre
dans *The Mandalorian*, qu'ils ne suivent plus.

**L'épilogue de *Rebels* disparaît en tant qu'entrée.** On ne coupe plus
l'épisode final à 42 minutes — on connaît l'histoire. `sw-r-rebels-s4` couvre
donc la saison 4 *et* l'épilogue, et la note d'avertissement tombe. La note
d'`sw-andors1` perd la parenthèse qui y renvoyait ; c'est la seule phrase de
Niko retouchée, et seulement par retrait.

Ce qui **ne** change **pas** : les niveaux d'importance restent tels quels,
les six ères gardent leurs titres et leurs bornes, et les sept badges tombent
sur la dernière entrée de leur ère dans les deux parcours.

## 5. Hors périmètre

Volontairement laissés de côté :

- **Les six autres univers.** Le moteur sera générique, mais aucune donnée
  `erasRewatch` n'est écrite ailleurs. Dragon Age n'en aura sans doute jamais :
  on joue dans l'ordre.
- **Un troisième parcours.** La donnée le permettrait ; rien ne le demande.
- **Une progression par parcours.** Une seule progression, partagée. Deux
  compteurs pour la même œuvre vue une fois seraient un mensonge.
- **Le Dossier et « À venir »** ne connaissent pas les modes.

## 6. Vérification

Le mode de défaillance de ce dépôt est connu : la page se charge, la console
reste vide, et le contenu est faux. Ce chantier y est particulièrement exposé
— un `ref` mort rend une carte vide, un `covers` incomplet rend un compteur
plausible.

Trois contrôles, au navigateur, pas dans le fichier :

1. `resolve()` sort en console à tout `ref` non résolu, et la publication
   échoue si la console en signale un.
2. Les deux parcours affichent **le même nombre d'entrées cochées** après
   qu'on a coché la même œuvre dans l'un puis regardé l'autre.
3. Chaque badge est atteignable dans les deux modes — vérifié en cochant, pas
   en lisant `needOf()`.
