# Product

Chronologeek — la référence mondiale des chronologies geek. Elle range tout ce
qu'un univers de fiction contient (films, séries, romans, comics, fictions audio,
jeux) dans un ordre unique et consultable, et retient ce que le visiteur a déjà vu
ou lu.

## Platform

Web. Site statique publié par GitHub Pages sur `chronologeek.app`. HTML/CSS/JS
vanilla, aucun build front, aucun framework. PWA avec service worker
(réseau d'abord). Des scripts Python génèrent ou enrichissent les pages via
GitHub Actions.

## Users

Public geek francophone et anglophone, quatre scènes d'usage confirmées, toutes
également importantes :

- **Avant de lancer.** Il hésite à commencer un univers et vient trancher par quoi
  démarrer, dans quel ordre. Visite courte, une décision à la clé.
- **Pendant le marathon.** Il revient régulièrement, souvent sur téléphone, pour
  cocher ce qu'il vient de voir et repérer le suivant. C'est l'usage qui fait
  revenir.
- **Pour fouiller le détail.** Il connaît déjà l'univers et vérifie un point précis :
  où se place un roman, quelle durée totale, quelle ère.
- **En veille sur les sorties.** Passages brefs et répétés sur le radar et les
  nouveautés.

## Product Purpose

Répondre à « dans quel ordre je regarde ça, et où j'en suis ». Le produit vaut par
l'exhaustivité et par l'ordre : c'est un travail de catalogue, pas un blog.

## Positioning

Face aux fils Reddit, aux ordres de lecture dispersés et aux wikis d'univers, une
seule référence tenue à jour, dans deux langues, qui couvre quatre univers avec la
même rigueur — et qui suit la progression personnelle, ce qu'aucun wiki ne fait.

## Operating Context

Consultation majoritairement en mobilité et sur téléphone, en français comme en
anglais. Pages lourdes en contenu (une timeline fait 19 k à 42 k tokens de source ;
le Dossier Star Wars porte 533 entrées écrites et 63 repères écran). Hébergement
statique gratuit : pas de serveur, pas de base, pas de rendu côté serveur.

## Capabilities and Constraints

Capacités : quatre univers (Star Wars, Marvel, DC, Avatar) ; version anglaise à la
racine et française sous `/fr/`, strictement parallèles ; suivi de progression
persistant par cases à cocher ; filtres par type et par niveau d'importance ;
durées de visionnage cumulées ; Dossier approfondi pour l'écrit ; radar des sorties
à venir alimenté quotidiennement ; nouveautés.

Contraintes : toute modification d'une page racine doit être répliquée dans `/fr/`
et les deux versions restent parallèles ligne à ligne ; pas de build, donc pas de
bundler, pas de compilation CSS ; budget de performance serré sur mobile ; les
pages sont partiellement générées par script, donc leur structure doit rester
scriptable.

## Brand Commitments

**Intouchable :** la mécanique de progression — cases à cocher, persistance,
compteurs. C'est la fonction qui fait revenir.

**Ouvert :** le mot-symbole actuel (capitales biseautées, dégradé or vers bleu
acier) et les quatre couleurs d'univers (`#4d9fff`, `#e23636`, `#f5c842`,
`#7dd3fc`) peuvent être repris si une direction l'exige. Le violet `#7c6af7`
actuellement dominant n'est pas une couleur de marque : il ne vient d'aucune
décision et ne figure pas dans le logo.

**Interdit :** le pastiche d'univers. Le site couvre quatre mondes ; emprunter la
police ou l'imagerie de l'un d'eux le disqualifie pour les trois autres. Il lui
faut sa voix propre.

## Evidence on Hand

Données réelles et vérifiables, déjà dans le dépôt : 533 entrées écrites et
63 repères écran au Dossier Star Wars ; 61 entrées sur la timeline Star Wars
(9 must, 37 important, 15 bonus) ; durées exactes par entrée ; dates de sortie
US et françaises distinctes ; environ 190 visuels d'œuvres dans `images/`.

## Product Principles

- L'ordre et l'exhaustivité passent avant l'opinion : le site range, il ne commente
  pas.
- Ce que le visiteur a déjà vu doit être lisible d'un coup d'œil, sur toutes les
  pages.
- Les textes de l'auteur ne sont jamais réécrits par un outil.
- Rejouable : chaque script nettoie son propre bloc avant de réinjecter.

## Accessibility & Inclusion

Contrastes déjà repris pour atteindre AA sur le texte secondaire. Focus visible
global et lien d'évitement en place. Deux langues à parité. La densité de la
timeline doit rester lisible au clavier et sur petit écran : c'est un critère
d'échec explicite, pas une option.
