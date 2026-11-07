/* ── la case « Sortie » de l'ordre de sortie ─────────────────────────────
   Une seule copie pour les onze pages qui ont ce parcours : elles passent
   toutes par ici avant de rendre une ligne. `rel` vaut une année, un mois, un
   jour, ou « début/fin » pour ce qui sort sur une période. L'année reste le
   gros de la case, le jour vient dessous : deux séries qui alternent tombent
   la même année, et seul le jour dit laquelle passe devant.
   La langue du navigateur n'y est pour rien : c'est celle de la page. */
window.CG_REL = function (rel, mot) {
  var loc = document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR';
  function quand(d) {
    var p = d.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +(p[2] || 1)));
  }
  function fmt(d) {
    var o = { month: 'short', timeZone: 'UTC' };
    if (d.length > 7) o.day = 'numeric';
    return new Intl.DateTimeFormat(loc, o);
  }
  var q = String(rel).split('/'), a = q[0], z = q[1] || a;
  var an = a.slice(0, 4) === z.slice(0, 4) ? a.slice(0, 4) : a.slice(0, 4) + '-' + z.slice(0, 4);
  var j = '';
  if (a.length > 4) {
    /* « 10 – 17 oct. » plutôt que « 10 oct. – 17 oct. » : la case fait 100 px. */
    try {
      if (z === a) j = fmt(a).format(quand(a));
      /* Sur deux années, formatRange les redit : elles sont déjà au-dessus. */
      else if (a.slice(0, 4) !== z.slice(0, 4)) j = fmt(a).format(quand(a)) + ' – ' + fmt(z).format(quand(z));
      else j = fmt(a).formatRange(quand(a), quand(z));
    }
    catch (_) { j = fmt(a).format(quand(a)); }
  }
  return '<span class="rel"><i>' + mot + '</i><b>' + an + '</b>' + (j ? '<i style="letter-spacing:.04em">' + j + '</i>' : '') + '</span>';
};

/* ── les réglages : ce qui reste à l'écran ───────────────────────────────
   `voit()` et les options viennent du <head> (reglages.mjs). Le tri se fait
   APRÈS la résolution des parcours, sur `ERAS` et non sur `D.eras` : `BYID`,
   `COVERS` et le pont restent complets, et une coche ne se perd pas. Un lien
   vers une œuvre masquée suspend le tri pour ce chargement, et une page que
   les réglages videraient s'affiche entière. */
(function(){
  var O = window.CG_OPT || (window.CG_OPT = { o: {}, en: false, masque: false,
    ex: function(){}, voit: function(){ return true; } });
  var hors = {};
  function arret(e){ return e.type !== 'separator' && e.type !== 'note'; }
  O.voitId = function(id){ return !hors[id]; };
  O.rang = function(era, i){ return (era.rg != null ? era.rg : i) + 1; };
  O.plein = function(eras){
    var l = [];
    eras.forEach(function(era){ era.entries.forEach(function(e){ if (arret(e)) l.push(e); }); });
    return l;
  };
  /* M : les titres originaux, sur la page française. Le cache est écrit par
     `e-app.js` depuis l'index de la recherche (sixième place). Une entrée de
     second parcours sans titre à elle prend celui de ce qu'elle couvre. Les
     titres des timelines sont du texte brut : rien à échapper. */
  O.titres = function(eras, D){
    if (!O.o.vo || O.en) return;
    var m = null;
    try { m = (JSON.parse(localStorage.getItem('cg-titres-vo') || 'null') || {}).m; } catch (_) {}
    if (!m) return;
    var avant = {};
    D.eras.forEach(function(era){ era.entries.forEach(function(e){
      avant[e.id] = e.title; if (m[e.id]) e.title = m[e.id]; }); });
    eras.forEach(function(era){ era.entries.forEach(function(e){
      if (m[e.id]) e.title = m[e.id];
      else if (e.covers && m[e.covers[0]] && avant[e.covers[0]] === e.title) e.title = m[e.covers[0]];
    }); });
  };
  O.garde = function(eras, D){
    O.titres(eras, D);
    if (!O.masque) return eras;
    var BY = {}, sansMust = true;
    D.eras.forEach(function(era){ era.entries.forEach(function(e){
      BY[e.id] = e; if (e.level === 'must') sansMust = false; }); });
    function passeE(e){ return !arret(e) || e.perso || O.voit(e.type, e.level, e.lang === 'vo', sansMust); }
    /* Un bloc qui recolle plusieurs entrées reste tant que l'une d'elles reste. */
    function passe(e){
      return e.covers && e.covers.length
        ? e.covers.some(function(d){ return BY[d] ? passeE(BY[d]) : true; }) : passeE(e);
    }
    /* Ce que le rappel dira : seulement ce que la page a vraiment retiré. */
    var R = { t: {}, lv: false, vf: false }, MT = {};
    (O.o.t || []).forEach(function(k){ MT[k] = 1; });
    function pourquoi(e){
      if (MT[e.type]) R.t[e.type] = 1;
      else if (e.lang === 'vo' && O.o.vf && !O.en) R.vf = true;
      else R.lv = true;
    }
    var cible = '';
    try { cible = decodeURIComponent(location.hash.slice(1)) ||
      new URLSearchParams(location.search).get('vers') || ''; } catch (_) {}
    var total = 0, reste = 0, vise = false;
    D.eras.forEach(function(era){ era.entries.forEach(function(e){ if (!passeE(e)) hors[e.id] = 1; }); });
    var out = eras.map(function(era, i){
      var n = era.entries.filter(arret).length, k = era.entries.filter(function(e){
        var ok = passe(e);
        if (!ok) { hors[e.id] = 1; if (e.id === cible) vise = true; pourquoi(e); }
        return ok;
      });
      var r = k.filter(arret).length;
      total += n; reste += r;
      return n && !r ? null : Object.assign({}, era, { entries: k, rg: i });
    }).filter(Boolean);
    if (hors[cible]) vise = true;
    O.stat = { total: total, reste: reste, t: R.t, lv: R.lv, vf: R.vf };
    if (vise || !reste) { hors = {}; O.stat.suspendu = vise ? 'lien' : 'vide'; return eras; }
    return out;
  };
})();

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
              'ASSASSINSCREED', 'DCANIM', 'JURASSIC', 'WITCHER', 'RE', 'BLADERUNNER', 'CGD'];

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
      /* L'image est une donnée en clair — un `data:` produit par le
         navigateur du visiteur, réduit à la taille de la vignette. Les
         neuf pages écrivent toutes `e.img?'<img src="'+e.img`, et un
         `data:` y passe comme un chemin de fichier. */
      if (a.img) e.img = a.img;

      /* La durée, en minutes, posée aux deux endroits où les pages la
         cherchent. Star Wars et Marvel lisent `e.rt` en premier ; les
         six autres ne connaissent que `RT[e.id]`, la table que
         `runtime.py` injecte dans les données. Écrire les deux est la
         seule forme qui vaille partout, et rien ne se marche dessus —
         un identifiant `p-` n'existe dans aucune table publiée.

         Le `if (window.RT)` n'est pas une précaution : créer la table sur
         une page qui n'en a pas ferait apparaître le champ « Durée » dans
         son formulaire, `e-app.js` s'y fiant pour savoir si la page
         compte le temps. Avatar Legends n'en aura jamais. */
      if (a.rt > 0) {
        e.rt = a.rt;
        if (window.RT) window.RT[a.id] = a.rt;
      }

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

  /* Ce que l'export des huit pages emporte, et ce que leur import
     rapporte. Le fichier n'avait jusqu'ici que les coches : réimporté
     sur un navigateur neuf, il y ramenait des coches `p-` sans les
     entrées qui vont avec — des identifiants morts que rien n'affiche.

     Un import ne doit rien faire disparaître. La progression, elle, est
     remplacée par le fichier : c'est le choix des pages, et il tient,
     on restaure une sauvegarde. Les ajouts sont d'une autre nature —
     des œuvres écrites à la main, parfois avec une image —, et perdre
     celles qu'on a faites depuis la sauvegarde serait une perte sèche.
     Le fichier gagne à identifiant égal, le reste est conservé.

     Rend `true` quand quelque chose a changé **et** que l'écriture a
     réussi : c'est ce qui décide du rechargement, et recharger sur une
     écriture refusée ramènerait la page sans les entrées, sans un mot. */
  function fusionne(entrants){
    if (!Array.isArray(entrants) || !entrants.length) return false;
    var par = {}, ordre = [], change = false;
    lis().forEach(function(x){ par[x.id] = x; ordre.push(x.id); });
    entrants.forEach(function(x){
      if (!x || typeof x !== 'object' || !x.id || !x.title) return;
      if (!par[x.id]) ordre.push(x.id);
      else if (JSON.stringify(par[x.id]) === JSON.stringify(x)) return;
      par[x.id] = x; change = true;
    });
    if (!change) return false;
    return ecris(ordre.map(function(i){ return par[i]; }));
  }

  /* Ce que `e-app.js` reprend pour son interface. `eras` sert à peupler
     le choix « juste après… » : il le lit ici plutôt que de refaire la
     recherche du global. */
  window.CGP = {
    key: KEY, nom: nom, data: D,
    lis: lis, ecris: ecris, fusionne: fusionne,
    /* l'identifiant est daté : deux ajouts faits dans la même seconde
       sur la même page sont l'exception, le suffixe aléatoire la couvre */
    neuf: function(){ return 'p-' + Date.now().toString(36) +
                      Math.floor(Math.random() * 1296).toString(36); }
  };
})();
