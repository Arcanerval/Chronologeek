/* ═══════════════════════════════════════════════════════════════════
   MES AJOUTS — les entrées que le visiteur pose lui-même
   ═══════════════════════════════════════════════════════════════════

   Une œuvre manque à une timeline ? On peut la suggérer par le bouton
   de « Ce qui est écarté » — c'est alors une lettre, et l'arbitrage
   reste éditorial. Ici, c'est l'autre réponse : le visiteur ajoute
   l'œuvre à *sa* copie de la page, et elle n'en sort jamais.

   Le principe tient en une phrase : **une entrée perso est une entrée
   comme les autres**. Ce fichier ne rend rien, ne dessine rien, ne
   touche à aucune des neuf pages qui ont une timeline. Il se glisse
   entre le fichier de données et le script de la page, et pose ses
   entrées dans `D.eras` avant que quiconque l'ait lu.

     <script src="data-mcu.js"></script>
     <script src="e-perso.js"></script>     ← ici
     <script> … la page … </script>

   Tout suit alors sans une ligne de plus : `ALL` les numérote, `row()`
   les dessine, `applyFilters()` les filtre, `tally()` les compte, la
   case à cocher les retient, la barre de progression les intègre. Neuf
   pages, deux langues, un seul fichier.

   Trois choses valent d'être sues.

   **Le rendu est déjà fait quand on ajoute.** L'interface d'ajout vit
   dans `e-app.js`, chargé en dernier ; elle écrit dans le stockage puis
   recharge la page. C'est le geste qu'emploie déjà la bascule des deux
   parcours — « c'est le rechargement qui rebâtit la page ». Réinjecter
   à chaud demanderait à ce fichier de connaître le rendu de chacune des
   neuf pages, ce qu'il se refuse à faire.

   **Le second parcours reçoit un `ref`, pas une copie.** Star Wars,
   Marvel et Dragon Age ont un ordre de reprise fait d'`{ref:"<id>"}`
   résolus après nous. Une entrée perso posée dans `eras` seulement
   manquerait à qui rejoue, sans que rien ne le signale — c'est le
   piège que le CLAUDE.md nomme déjà pour les ajouts éditoriaux. On y
   pose donc un `ref` en face.

   **L'identifiant est préfixé `p-`.** C'est à ça que `e-app.js`
   reconnaît une entrée perso pour la marquer, et à ça que l'accueil
   pourra les écarter de son décompte, qui est écrit en dur.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* Le nom du global change d'une page à l'autre — la même table que
     `SOURCES` de jsonld.mjs, plus le Dossier qui n'y figure pas. On
     s'arrête au premier qui porte des ères : une page n'en charge
     jamais deux. */
  var NOMS = ['SW', 'MCU', 'DC', 'AVATAR', 'ST', 'TWD', 'DATA_DA',
              'ASSASSINSCREED', 'CGD'];

  var D = null, nom = '';
  for (var i = 0; i < NOMS.length; i++) {
    var v = window[NOMS[i]];
    if (v && typeof v === 'object' && v.eras && v.eras.length) { D = v; nom = NOMS[i]; break; }
  }
  if (!D) return;

  /* Une seule clé pour les deux langues : c'est la même page, et un
     ajout écrit côté français n'a pas à disparaître en passant à
     l'anglais. Son texte reste dans la langue où il a été écrit — c'est
     le visiteur qui l'a tapé, on ne va pas le traduire. */
  var KEY = 'cg-perso-' + nom.toLowerCase();

  function lis(){
    var l = [];
    try { l = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (_) { l = []; }
    if (!Array.isArray(l)) l = [];
    /* Un stockage abîmé — édité à la main, écrit par une version plus
       ancienne — ne doit pas emporter la page avec lui : ce qui n'a pas
       de titre n'est pas une entrée. */
    return l.filter(function(a){ return a && typeof a === 'object' && a.title; });
  }

  function ecris(l){
    try { localStorage.setItem(KEY, JSON.stringify(l)); return true; }
    catch (_) { return false; }   /* navigation privée, quota : l'appelant le dira */
  }

  /* Où poser l'entrée : juste après celle que le visiteur a désignée.
     Un `apres` vide, ou qui ne désigne plus rien — l'entrée a été
     renommée depuis, ou l'ajout vient d'un autre parcours —, la met en
     tête plutôt que de la perdre. */
  function place(eras, apres){
    if (apres) for (var i = 0; i < eras.length; i++) {
      var es = eras[i].entries || [];
      for (var j = 0; j < es.length; j++)
        if ((es[j].id || es[j].ref) === apres) return { era: i, at: j + 1 };
    }
    return { era: 0, at: 0 };
  }

  var ajouts = lis();
  if (ajouts.length) {
    ajouts.forEach(function(a){
      var e = {
        id: a.id, title: a.title, type: a.type || 'film',
        date: a.date || '', perso: true
      };
      if (a.note) e.note = a.note;

      var p = place(D.eras, a.apres);
      D.eras[p.era].entries.splice(p.at, 0, e);

      /* Le second parcours, quand la page en a un. Un `ref`, comme les
         entrées éditoriales : le résolveur ira chercher celle qu'on
         vient de poser. */
      var second = D.erasRewatch || D.erasReplay;
      if (second) {
        var q = place(second, a.apres);
        second[q.era].entries.splice(q.at, 0, { ref: a.id });
      }
    });
  }

  /* Ce que `e-app.js` reprend pour son interface. `eras` sert à peupler
     le choix « juste après… » : il le lit ici plutôt que de refaire la
     recherche du global. */
  window.CGP = {
    key: KEY, nom: nom, data: D,
    lis: lis, ecris: ecris,
    /* l'identifiant est daté : deux ajouts faits dans la même seconde
       sur la même page sont l'exception, le suffixe aléatoire la couvre */
    neuf: function(){ return 'p-' + Date.now().toString(36) +
                      Math.floor(Math.random() * 1296).toString(36); }
  };
})();
