# Gardien du lore — consignes de placement

Procédure à suivre quand Niko dit « fais tourner le gardien du lore ».

`lore_gap.py` a déjà fait la moitié mécanique du travail : il a confronté son
registre aux timelines et écrit `lore-gap.json`, restreint aux sorties dont la
date tombe dans les jours proches. Il ne reste que la moitié qui demande du
jugement — décider **où** chaque sortie se place et **pourquoi**.

## Point de départ

Lire `lore-gap.json`. Rien d'autre. Il contient :

| Clé | Contenu |
|---|---|
| `a_placer` | Les sorties de la fenêtre absentes de leur page cible. Le vrai travail. |
| `cible` / `fichier_cible` | Sur chaque entrée : `timeline` ou `dossier`, et le fichier concerné. Déjà décidé par le script, ne pas le remettre en cause. |
| `a_verifier` | Rapprochements douteux entre une sortie et une entrée existante. Trancher en premier : une fausse absence fait perdre du temps sur les deux tableaux. |
| `fenetre` | Les bornes de dates retenues. |
| `hors_fenetre` | Nombre d'entrées en attente dont la date est plus lointaine. Un compte, pas une liste : ne pas s'en occuper sauf demande explicite. |
| `index` | Chemin vers l'index compact de chaque univers concerné. |
| `univers_sans_page` | Univers présents au radar mais sans page. À signaler, pas à traiter. |

Si `a_placer` et `a_verifier` sont vides, il n'y a rien à faire : le dire en une
phrase et s'arrêter. C'est le cas le plus fréquent, les sorties arrivent par
à-coups.

Les index vivent dans `lore-index/<univers>.json` : une ligne par entrée de
timeline, avec `id`, `title`, `date`, `level` et `block`. **Ne charger que ceux
des univers effectivement traités** — les quatre d'un coup font 25 000 tokens,
un seul en fait 3 000 à 6 000. Traiter un univers à la fois est le bon rythme.

**Ne jamais ouvrir une page de timeline en entier.** Elles pèsent 19 000 à
42 000 tokens pièce, et l'index contient déjà tout ce qu'il faut pour choisir un
point d'insertion. Si un détail manque sur une entrée précise, `grep` sur son
`id` — jamais une lecture intégrale.

## Ce qu'il faut produire, par sortie

- **Point d'insertion** : après quel `id`, dans quel bloc.
- **Le pourquoi**, trois phrases maximum : ce qui ancre la sortie à cet endroit
  de la chronologie interne. La date de sortie ne compte pas, seule compte la
  position dans l'univers.
- **Le niveau proposé**, avec une phrase de justification.
- **L'objet JS prêt à coller**, au style exact de la page visée.
- **Le degré de certitude.** En cas d'hésitation entre deux emplacements, donner
  les deux et dire ce qui trancherait. Une incertitude signalée vaut mieux
  qu'une affirmation fausse.

## Timeline ou Dossier : deux destinations distinctes

**Les comics, romans et fictions audio se placent dans le Dossier de leur
univers, jamais dans la timeline cinéma.** Un roman Star Wars va dans
`deep-dives/star-wars.html`, pas dans `starwars.html`. Films, séries et jeux
vidéo suivent le chemin inverse : la timeline, pas le Dossier.

Le script applique déjà cette règle et écrit la destination dans `cible` sur
chaque entrée. La respecter telle quelle.

Un univers sans Dossier envoie tout à sa timeline, faute de mieux. Aujourd'hui
seul Star Wars a un Dossier ; les romans graphiques Avatar tombent donc dans la
timeline en attendant que ce point soit tranché.

### Le Dossier n'a pas le même format que les timelines

Ses entrées sont du JSON propre dans `window.CG_DATA`, structuré en ères :

```json
{"kind":"it","k":"roman","c":"#a78bfa","id":"382-bby-the-high-republic-convergence",
 "date":"382 BBY","title":"The High Republic : Convergence","type":"Novel",
 "vo":false,"note":""}
```

Le Dossier mélange deux natures d'items, et l'index les distingue par `ecran` :

- **Les entrées** (533) — romans, comics, fictions audio. C'est le contenu du
  Dossier, et la seule chose qui compte dans la progression du lecteur.
- **Les repères écran** (63) — les films et séries posés au milieu de la
  chronologie, du type `THE ACOLYTE — EPISODES 1-2` à `148 BBY`. Ils situent,
  ils ne se lisent pas. **Ne jamais en proposer un**, et ne jamais conclure
  qu'une sortie est déjà placée parce qu'un repère porte son titre. En revanche
  ce sont d'excellents points d'ancrage : dire « juste après le repère Acolyte »
  est souvent plus parlant que citer un slug de comic.

Points d'attention :

- L'`id` est un slug construit sur la date in-universe et le titre, pas un
  préfixe d'univers. Reprendre la forme des voisins.
- `date` porte une date interne à l'univers (`382 BBY`), pas une année de sortie.
- `k` vaut `roman`, `jeunesse`, `comic` ou `audio`, et détermine la couleur `c`.
  Reprendre le couple `k` / `c` d'une entrée du même type.
- `vo` marque l'absence de version française, `note` un commentaire libre.
- Le Dossier n'utilise pas `level` : la hiérarchie de niveaux est propre aux
  timelines. Ne pas en inventer une.

L'index du Dossier vit dans `lore-index/<univers>-dossier.json`, distinct de
celui de la timeline.

## Conventions à respecter

**Guillemets.** Star Wars et Marvel écrivent leurs objets avec des guillemets
doubles, DC avec des apostrophes simples. Une apostrophe interne doit être
échappée en conséquence.

**Niveaux.** Le vocabulaire diffère selon les pages : Star Wars et Marvel
écrivent `level:"important"`, DC et Avatar `level:'imp'`. Reprendre celui de la
page visée. Les répartitions sont volontairement serrées — Star Wars tient
9 `must` pour 37 `important` et 15 `bonus`. Ne proposer `must` que pour une
sortie réellement structurante.

**Identifiants.** Chaque univers a son préfixe (`sw-`, `mcu-`, …). Le déduire
des entrées voisines dans l'`index`, et vérifier par `grep` que l'id proposé est
libre avant de le retenir.

## Sources

- **Fandom** : API MediaWiki standard (`/api.php`). L'API `/api/v1` renvoie 403.
- **TMDB** : résoudre les identifiants de société dynamiquement, jamais en dur.
- **La grille du site prime.** Les champs `date` des entrées voisines sont la
  chronologie de référence de Chronologeek. Si une source externe la contredit,
  signaler la contradiction plutôt que trancher seul.

## Règles fermes

**Exhaustivité dans la fenêtre.** Toute entrée de `a_placer` et de `a_verifier`
doit être traitée, y compris celles qu'on écarte volontairement — avec le motif.
Un silence sur une entrée est une erreur, pas une économie. En revanche les
entrées `hors_fenetre` ne se traitent que si Niko le demande.

**Ne rien écrire dans les pages sans validation.** Le livrable est une liste de
propositions. C'est Niko qui applique.

**Ne jamais écrire de prose française destinée au site.** Il écrit ses textes
lui-même, c'est une règle du projet. Les champs `faq` des propositions se
rédigent en anglais, langue des pages racine ; la version française reste à sa
main.

**Réplication FR/EN.** Toute entrée validée doit être répercutée dans `fr/`.
Le rappeler à chaque proposition, et vérifier avec `py sync.py check` après
application.

**Pas d'emojis**, ni dans les propositions ni dans le rapport.
