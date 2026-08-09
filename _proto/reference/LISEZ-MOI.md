# La mémoire de l'anglais déjà écrit

Ces quatorze fichiers sont les pages de production **telles qu'elles étaient la
veille de la refonte**, figées au commit `b69cfb3`. Ce ne sont pas des pages du
site : rien ne les sert, rien ne les lie, et elles ne doivent jamais être
modifiées.

## Pourquoi elles existent

`traduire.mjs` et `traduire-pages.mjs` **ne traduisent pas : ils retrouvent.**
La racine du site était déjà anglaise et `/fr/` française, tenues à parité ; la
refonte ayant extrait ses données du français, l'anglais correspondant était
déjà écrit, relu et en ligne. Les deux scripts allaient donc le lire dans les
pages de production.

La publication de la refonte a remplacé ces pages par sa propre sortie. Les
scripts se seraient alors relus eux-mêmes : `traduire.mjs` levait déjà
`Cannot read properties of undefined (reading 'eras')`, le Dossier ne posant
plus ses items dans `window.CG_DATA` mais dans un fichier de données. Et là où
il n'aurait pas planté, il aurait été pire — un lexique bâti sur sa propre
sortie ne corrige plus rien, il fige.

Figer la référence à l'état d'avant la publication garde exactement le sens
voulu : la référence, c'est **ce qui a été écrit et relu**, pas ce que le
script vient de produire.

## Le témoin de fraîcheur continue de jouer

Le français de cette référence sert à savoir si l'anglais correspondant vaut
encore. Quand le proto français ne dit plus ce que disait la prod française, la
valeur anglaise ne traduit plus rien et n'est pas reprise : soit la coupe se
rejoue, soit la phrase part en relecture dans `A-RELIRE-EN.md`. Voir la section
« Le proto fait foi, pas la prod » de `CLAUDE.md`.

Ce mécanisme ne fonctionne que parce que la référence est figée. Si elle suivait
la production, le témoin dirait toujours « c'est à jour » et ne signalerait plus
jamais rien.

## Retrouver ces fichiers

```bash
git show b69cfb3:starwars.html
```
