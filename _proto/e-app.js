/* ═══ STOCKAGE PERSISTANT ═════════════════════════════════════════════
   Un navigateur peut effacer tout seul ce que le site a écrit, et le
   visiteur n'y est pour rien : Safari le fait après sept jours sans
   visite, Chrome et Firefox le font quand le disque se remplit. Une
   timeline se suit sur des années — sept jours, c'est le délai entre
   deux épisodes.

   `navigator.storage.persist()` demande l'exemption. Chrome l'accorde
   en silence dès que le site est en favori, installé ou assez visité ;
   Firefox ouvre une demande d'autorisation. Safari porte l'API depuis
   15.4, mais **l'exemption sur laquelle il faut compter chez lui est
   l'écran d'accueil**, la seule que WebKit documente — d'où le discours
   de la barre d'installation, plus bas.

   **On ne demande que si le visiteur a quelque chose à perdre.** La
   demande de Firefox posée à quelqu'un qui n'a pas encore coché une
   case ne veut rien dire, et une autorisation refusée ne se redemande
   pas. On attend donc la première coche ou le premier ajout.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (!navigator.storage || !navigator.storage.persist) return;

  var aPerdre = false;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf('cg-proto-') !== 0 && k.indexOf('cg-perso-') !== 0) continue;
      var v = localStorage.getItem(k);
      /* `{}` et `[]` sont des clés vides : une page visitée, rien coché */
      if (v && v.length > 2) { aPerdre = true; break; }
    }
  } catch (_) { return; }     /* stockage fermé : rien à protéger */
  if (!aPerdre) return;

  function rien(){}
  navigator.storage.persisted().then(function(deja){
    if (!deja) navigator.storage.persist().then(rien, rien);
  }, rien);
})();

/* ═══ BARRE D'INSTALLATION — direction E ══════════════════════════════
   Reprend le système de pwa.js : on ne montre rien si l'appli tourne
   déjà en autonome, rien non plus pendant sept jours après une fermeture.
   Trois discours selon la machine — Windows, Android, Apple — parce que
   l'installation n'y a ni le même geste ni le même nom.

   Windows et Android reçoivent « beforeinstallprompt » : le navigateur
   installe pour de bon, on n'affiche donc la barre qu'une fois l'événement
   arrivé. Apple ne le déclenche jamais : là, la barre explique le geste et
   n'a pas de bouton.

   Aperçu : ?app=win, ?app=apk ou ?app=apple force une variante, bouton
   compris, pour juger le rendu sans attendre le bon navigateur.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var KEY = 'cg_pwa_dismiss', WEEK = 7*24*3600*1000;

  /* Deux langues, un seul fichier : on lit la langue de la page,
     comme `pwa.js` le fait deja en production. Deux scripts jumeaux
     se seraient desynchronises a la premiere retouche du CSS, qui
     est commun et ne depend pas de la langue. */
  var FR = document.documentElement.lang !== 'en';

  /* ── les trois discours ───────────────────────────────────────────
     Icônes dessinées maison : un écran, un téléphone, le carré-flèche
     du partage. Aucun logo de marque, seulement le geste attendu. */
  var VAR = {
    win: {
      ico:'<rect x="2.5" y="4" width="19" height="13"/><path d="M8 21h8M12 17v4"/>',
      txt: FR
        ? 'Chronologeek s’installe sur Windows comme un vrai logiciel : une icône, sa fenêtre, vos coches et vos timelines même sans connexion.'
        : 'Chronologeek installs on Windows like a real program: an icon, its own window, your check marks and your timelines even without a connection.',
      btn: FR ? 'Installer' : 'Install'
    },
    apk: {
      ico:'<rect x="6" y="2.5" width="12" height="19"/><path d="M10.5 18.5h3"/>',
      txt: FR
        ? 'Chronologeek s’installe sur Android comme une appli du Play Store : une icône, plein écran, vos coches et vos timelines même sans connexion.'
        : 'Chronologeek installs on Android like a Play Store app: an icon, full screen, your check marks and your timelines even without a connection.',
      btn: FR ? 'Installer' : 'Install'
    },
    apple: {
      ico:'<path d="M12 3v12M12 3 8 7M12 3l4 4"/><path d="M5 12v9h14v-9"/>',
      txt: FR
        ? 'Safari efface les données d’un site après sept jours sans visite, vos coches comprises. Sur l’écran d’accueil, l’application y échappe. Dans l’ordre : <b>exportez</b> depuis Safari, touchez <b>Partager</b> puis « Sur l’écran d’accueil », et réimportez — l’application a son propre stockage et démarre à vide.'
        : 'Safari wipes a site’s data after seven days without a visit, your check marks included. On the Home Screen, the app escapes that. In order: <b>export</b> from Safari, tap <b>Share</b> then “Add to Home Screen”, then import again — the app has its own storage and starts empty.',
      btn:null
    }
  };

  /* les deux libelles hors des trois discours */
  var TITRE = FR ? 'L’application Chronologeek' : 'The Chronologeek app';
  var FERMER = FR ? 'Fermer' : 'Close';

  /* ── pourquoi elle est en bas, depuis le 6 septembre 2026 ──────────
     Elle s'insérait dans le flux au-dessus du bandeau, et poussait donc
     toute la page de 141 px à son arrivée, une seconde après l'ouverture.
     Mesuré au navigateur, réseau lent et cache vide : c'est **0,158 de
     décalage cumulé**, seul, sur les vingt-huit pages — le seuil que
     Google tient pour bon est 0,1, et le reste du site tombait à zéro
     quand on la retirait. Elle passe donc en fixe, hors du flux : rien
     ne bouge plus, et elle reste lisible pendant qu'on défile au lieu de
     partir au premier geste.

     `bottom:var(--hud-h,0px)` la pose **au-dessus de la barre de
     progression**, dont `paint()` mesure la hauteur à chaque changement ;
     les pages qui n'en ont pas ne posent pas la variable, et elle tombe
     alors au bas de l'écran. Réserver sa place en haut aurait été l'autre
     réponse, mais elle ne paraît pas à tout le monde — déjà installée,
     fermée depuis moins d'une semaine, Firefox — et le trou aurait été
     pour tous les autres. */
  var CSS = [
    '.appbar{background:var(--ink);border-top:2px solid var(--paper);',
    '  position:fixed;left:0;right:0;bottom:var(--hud-h,0px);z-index:76;',
    '  animation:abDrop .35s ease}',
    /* le bouton « remonter en haut » se cale au-dessus d'elle tant
       qu'elle est là : les deux vivent dans le même coin */
    'html.cg-bar #totop{bottom:calc(var(--hud-h,0px) + var(--cg-bar-h,64px)',
    '  + 20px)}',
    '.appbar .wrap{display:flex;align-items:center;gap:14px;',
    '  padding-top:11px;padding-bottom:11px}',
    '.ab-ico{flex:0 0 auto;width:34px;height:34px;background:var(--hot);',
    '  display:grid;place-items:center}',
    '.ab-ico svg{width:19px;height:19px;fill:none;stroke:var(--ink);',
    '  stroke-width:2;stroke-linecap:square}',
    '.ab-txt{flex:1;min-width:0;font-size:13.5px;line-height:1.35;',
    '  color:rgba(255,253,247,.78)}',
    '.ab-txt b{display:block;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:900;font-size:19px;letter-spacing:.03em;text-transform:uppercase;',
    '  color:var(--paper);line-height:1}',
    '.ab-txt i{font-style:normal;font-weight:700;color:var(--paper)}',
    '.appbar button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:14.5px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}',
    '.ab-go{flex:0 0 auto;background:var(--hot);border:2px solid var(--hot);',
    '  color:var(--ink);padding:6px 16px}',
    '.ab-go:hover{background:var(--paper);border-color:var(--paper)}',
    '.ab-x{flex:0 0 auto;background:none;border:2px solid var(--line);',
    '  color:rgba(255,253,247,.6);padding:4px 9px;font-size:13px;line-height:1}',
    '.ab-x:hover{border-color:var(--paper);color:var(--paper)}',
    '@keyframes abDrop{from{transform:translateY(100%)}to{transform:none}}',
    /* en étroit, le texte prend la ligne et les boutons passent dessous :
       comprimé sur une seule ligne, il tombait à deux mots par ligne */
    '@media(max-width:640px){',
    '  .appbar .wrap{flex-wrap:wrap;gap:10px 12px;align-items:flex-start}',
    '  .ab-txt{flex:1 0 calc(100% - 48px)}',
    '  .ab-go{order:3}.ab-x{order:4;margin-left:auto}',
    '}',
    '@media(prefers-reduced-motion:reduce){.appbar{animation:none}}'
  ].join('');

  /* Poser et retirer une barre du bas. La hauteur est relevée après
     coup — elle dépend de la largeur, le texte passant sur deux ou trois
     lignes en étroit — et sert au seul élément qui partage ce coin, le
     bouton « remonter en haut ». */
  function pose(bar){
    var h = Math.round(bar.getBoundingClientRect().height);
    var r = document.documentElement;
    if (h > 0) r.style.setProperty('--cg-bar-h', h + 'px');
    r.classList.add('cg-bar');
  }
  function retire(bar){
    bar.remove();
    var r = document.documentElement;
    r.classList.remove('cg-bar');
    r.style.removeProperty('--cg-bar-h');
  }

  function build(v, onGo){
    /* Jamais deux bandeaux empilés : le rappel de sauvegarde prend la
       même place, et celui qui arrive le second attend la visite
       suivante — tous deux se ferment pour une semaine. */
    if (document.getElementById('appbar')) return;
    if (document.getElementById('svbar')) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bar = document.createElement('aside');
    bar.className = 'appbar';
    bar.id = 'appbar';
    bar.innerHTML =
      '<div class="wrap">' +
        '<span class="ab-ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + v.ico + '</svg></span>' +
        '<p class="ab-txt"><b>' + TITRE + '</b>' +
          v.txt.replace(/<b>/g,'<i>').replace(/<\/b>/g,'</i>') + '</p>' +
        (v.btn ? '<button type="button" class="ab-go">' + v.btn + '</button>' : '') +
        '<button type="button" class="ab-x" aria-label="' + FERMER + '">✕</button>' +
      '</div>';

    /* en fin de corps et en fixe : posée n'importe où ailleurs, elle
       déplacerait ce qui la suit. Sa hauteur est mesurée une fois posée,
       et c'est elle qui remonte le bouton « en haut ». */
    document.body.appendChild(bar);
    pose(bar);

    bar.querySelector('.ab-x').addEventListener('click', function(){
      try { localStorage.setItem(KEY, String(Date.now())); } catch(e){}
      retire(bar);
    });
    var go = bar.querySelector('.ab-go');
    if (go && onGo) go.addEventListener('click', onGo);
    return bar;
  }

  /* ── l'aperçu force la main ─────────────────────────────────────── */
  var forced = (location.search.match(/[?&]app=(win|apk|apple)/) || [])[1];
  if (forced) {
    var f = VAR[forced];
    if (forced === 'apple') build(f);
    else build({ ico:f.ico, txt:f.txt, btn:f.btn }, function(){});
    return;
  }

  /* ── les deux verrous de pwa.js ─────────────────────────────────── */
  if (window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true) return;
  var last = 0;
  try { last = Number(localStorage.getItem(KEY)) || 0; } catch(e){}
  if (last && Date.now() - last < WEEK) return;

  /* ── quelle machine ─────────────────────────────────────────────── */
  var ua = navigator.userAgent;
  var isAndroid = /android/i.test(ua);
  var isApple = /iphone|ipad|ipod/i.test(ua) ||
                (/Mac/.test(ua) && 'ontouchend' in document) ||
                (/Mac/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua));

  /* Windows et Android : on attend l'événement, sinon le bouton mentirait */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    build(isAndroid ? VAR.apk : VAR.win, function(){
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function(){
        deferred = null;
        var b = document.getElementById('appbar');
        if (b) retire(b);
      });
    });
  });

  /* Apple : pas d'événement, jamais — la barre explique le geste */
  if (isApple) {
    addEventListener('load', function(){
      setTimeout(function(){ build(VAR.apple); }, 1200);
    });
  }
})();

/* ═══ LE RAPPEL DE SAUVEGARDE ═════════════════════════════════════════
   Le bouton d'export existe depuis toujours, et personne ne le trouve
   avant d'avoir perdu quelque chose : il est dans le panneau du HUD,
   replié. Le rappel va donc le chercher, à partir du moment où il y a
   vraiment quelque chose à perdre.

   **Il ne dépend pas de « Mes ajouts ».** Le premier jet vivait dans ce
   bloc-là et ne comptait que les entrées écrites à la main — or c'est
   le cas rare : la plupart des visiteurs cochent sans jamais rien
   ajouter, et le Dossier, qui porte 535 œuvres et la plus longue
   progression du site, ne charge même pas `perso.js`. Le rappel ne
   regarde donc que deux choses, que les dix pages ont toutes : les
   cartes cochées dans le DOM, et le bouton `#export`.

   Les cartes se comptent au rendu plutôt que dans le stockage : la clé
   de progression est déclarée dans le script de chaque page, sous un
   nom qui change à la publication, et un navigateur qui a vu quatre
   univers en porte quatre. Le DOM, lui, ne dit qu'une chose — ce qui
   est coché **sur cette page-ci**.

   **On lit `aria-checked`, pas la classe `done`.** C'était le piège :
   les neuf timelines posent les deux au rendu, le Dossier ne pose
   `done` qu'au clic — ses 535 lignes arrivent cochées à l'écran et
   sans la classe. Un rappel qui compte `.done` ne se déclenchait donc
   jamais là où la progression est la plus longue du site, et rien ne
   le disait : la page se chargeait, la console restait vide. Les neuf
   pages écrivent `aria-checked` dans le gabarit de leur ligne, c'est
   la seule marque qui vaille pour les neuf.

   Trois bornes :

   - **Vingt coches, ou cinq ajouts.** Deux seuils parce que ce n'est pas
     la même perte : une coche se refait de mémoire, un ajout a été tapé
     à la main, parfois avec une image. Sous ces nombres, ce qui se perd
     se refait en une minute, et un bandeau posé au premier clic se lit
     comme une menace.
   - **Une semaine** après une fermeture, comme la barre d'installation.
   - **Jamais en même temps qu'elle.** Sur iPhone, c'est elle qui porte
     la vraie réponse — elle dit déjà d'exporter, et elle dit en plus
     comment ne plus avoir à le refaire. D'où le report à `load` : la
     barre Apple se construit 1,2 s après, et on regarde une fois qu'elle
     a eu sa chance.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var SVKEY = 'cg_save_nudge', SEMAINE = 7*24*3600*1000;
  var COCHES = 20, AJOUTS = 5;

  var FR = document.documentElement.lang !== 'en';

  /* Trois phrases plutôt qu'une à trous : en français le pronom suit ce
     dont on parle — « le garde », « la garde », « les garde » —, et une
     phrase recousue de morceaux aurait fini par accorder de travers. */
  var T = FR ? {
    titreP: 'Mettez votre progression à l’abri',
    titreA: 'Mettez vos ajouts à l’abri',
    deux:   function(c, a){ return 'Vous avez coché ' + c + ' œuvres, et vous en avez ajouté ' + a +
              '. Tout cela ne vit que dans ce navigateur, qui peut l’effacer tout seul — Safari le ' +
              'fait après sept jours sans visite. Le fichier d’export le garde, et le rapporte sur ' +
              'un autre appareil.'; },
    coches: function(c){ return 'Vous avez coché ' + c + ' œuvres. Votre progression ne vit que dans ' +
              'ce navigateur, qui peut l’effacer tout seul — Safari le fait après sept jours sans ' +
              'visite. Le fichier d’export la garde, et la rapporte sur un autre appareil.'; },
    ajouts: function(a){ return 'Vous avez ajouté ' + a + ' œuvres. Elles ne vivent que dans ce ' +
              'navigateur, qui peut les effacer tout seul — Safari le fait après sept jours sans ' +
              'visite. Le fichier d’export les garde, et les rapporte sur un autre appareil.'; },
    go:     'Exporter',
    fermer: 'Fermer'
  } : {
    titreP: 'Keep your progress safe',
    titreA: 'Keep your additions safe',
    deux:   function(c, a){ return 'You have checked ' + c + ' works, and added ' + a +
              ' of your own. None of it lives anywhere but this browser, which can wipe it on its ' +
              'own — Safari does after seven days without a visit. The export file keeps it, and ' +
              'carries it to another device.'; },
    coches: function(c){ return 'You have checked ' + c + ' works. Your progress lives in this ' +
              'browser only, and it can be wiped without warning — Safari does it after seven days ' +
              'without a visit. The export file keeps it, and carries it to another device.'; },
    ajouts: function(a){ return 'You have added ' + a + ' works. They live in this browser only, ' +
              'and it can wipe them on its own — Safari does after seven days without a visit. ' +
              'The export file keeps them, and carries them to another device.'; },
    go:     'Export',
    fermer: 'Close'
  };

  /* La barre reprend trait pour trait celle de l'installation — même
     place, même hauteur, même geste pour la fermer — mais elle ne peut
     pas reprendre ses règles : celles-ci ne sont posées que si cette
     barre-là se construit, et les deux ne paraissent jamais ensemble. */
  var CSS = [
    /* même place que la barre d'installation, donc même correction :
       en bas, en fixe, au-dessus de la barre de progression. Dans le
       flux, elle poussait la page à son arrivée — voir le pourquoi
       au-dessus de `.appbar`. */
    '.svbar{background:var(--ink);border-top:2px solid var(--paper);',
    '  position:fixed;left:0;right:0;bottom:var(--hud-h,0px);z-index:76;',
    '  animation:svUp .35s ease}',
    '@keyframes svUp{from{transform:translateY(100%)}to{transform:none}}',
    'html.cg-bar #totop{bottom:calc(var(--hud-h,0px) + var(--cg-bar-h,64px)',
    '  + 20px)}',
    '@media(prefers-reduced-motion:reduce){.svbar{animation:none}}',
    '.svbar .wrap{display:flex;align-items:center;gap:14px;',
    '  padding-top:11px;padding-bottom:11px}',
    '.sv-ico{flex:0 0 auto;width:34px;height:34px;background:var(--hot);',
    '  display:grid;place-items:center}',
    '.sv-ico svg{width:19px;height:19px;fill:none;stroke:var(--ink);',
    '  stroke-width:2;stroke-linecap:square}',
    '.sv-txt{flex:1;min-width:0;font-size:13.5px;line-height:1.35;',
    '  color:rgba(255,253,247,.78)}',
    '.sv-txt b{display:block;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:900;font-size:19px;letter-spacing:.03em;text-transform:uppercase;',
    '  color:var(--paper);line-height:1}',
    '.svbar button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:14.5px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}',
    '.sv-go{flex:0 0 auto;background:var(--hot);border:2px solid var(--hot);',
    '  color:var(--ink);padding:6px 16px}',
    '.sv-go:hover{background:var(--paper);border-color:var(--paper)}',
    '.sv-x{flex:0 0 auto;background:none;border:2px solid var(--line);',
    '  color:rgba(255,253,247,.6);padding:4px 9px;font-size:13px;line-height:1}',
    '.sv-x:hover{border-color:var(--paper);color:var(--paper)}',
    '@media(max-width:640px){',
    '  .svbar .wrap{flex-wrap:wrap;gap:10px 12px;align-items:flex-start}',
    '  .sv-txt{flex:1 0 calc(100% - 48px)}',
    '  .sv-go{order:3}.sv-x{order:4;margin-left:auto}',
    '}'
  ].join('');

  function rappel(){
    if (document.getElementById('appbar')) return;
    if (document.getElementById('svbar')) return;

    var sortie = document.getElementById('export');
    if (!sortie) return;                    /* page sans export : rien à proposer */

    var c = document.querySelectorAll('[data-check][aria-checked="true"]').length;
    var a = window.CGP ? window.CGP.lis().length : 0;
    if (c < COCHES && a < AJOUTS) return;

    var vu = 0;
    try { vu = Number(localStorage.getItem(SVKEY)) || 0; } catch (_) {}
    if (vu && Date.now() - vu < SEMAINE) return;

    function range(){ try { localStorage.setItem(SVKEY, String(Date.now())); } catch (_) {} }

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bar = document.createElement('aside');
    bar.className = 'svbar';
    bar.id = 'svbar';
    bar.innerHTML =
      '<div class="wrap">' +
        '<span class="sv-ico" aria-hidden="true"><svg viewBox="0 0 24 24">' +
          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>' +
        '</svg></span>' +
        '<p class="sv-txt"><b></b><span></span></p>' +
        '<button type="button" class="sv-go"></button>' +
        '<button type="button" class="sv-x"></button>' +
      '</div>';

    /* Le titre suit ce qui a déclenché : qui n'a rien coché mais a écrit
       cinq œuvres n'a pas de « progression » à mettre à l'abri. */
    var assez = c >= COCHES;
    /* en texte, pas en HTML : les nombres viennent d'une donnée du visiteur */
    bar.querySelector('.sv-txt b').textContent = assez ? T.titreP : T.titreA;
    bar.querySelector('.sv-txt span').textContent =
      assez && a >= AJOUTS ? T.deux(c, a) : assez ? T.coches(c) : T.ajouts(a);
    bar.querySelector('.sv-go').textContent = T.go;

    var x = bar.querySelector('.sv-x');
    x.textContent = '✕';
    x.setAttribute('aria-label', T.fermer);

    /* en fin de corps et en fixe, comme la barre d'installation */
    document.body.appendChild(bar);
    var h = Math.round(bar.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--cg-bar-h', h + 'px');
    document.documentElement.classList.add('cg-bar');

    function ferme(){
      bar.remove();
      document.documentElement.classList.remove('cg-bar');
      document.documentElement.style.removeProperty('--cg-bar-h');
    }

    /* On ne refait pas l'export ici : le bouton de la page le tient déjà,
       avec la clé d'univers et les ajouts. Le clic suffit. */
    bar.querySelector('.sv-go').addEventListener('click', function(){
      range(); ferme(); sortie.click();
    });
    x.addEventListener('click', function(){ range(); ferme(); });
  }

  if (document.readyState === 'complete') setTimeout(rappel, 1400);
  else addEventListener('load', function(){ setTimeout(rappel, 1400); });
})();

/* ═══ LA HAUTEUR DE LA BARRE DU BAS ══════════════════════════════════
   La barre de progression passe sur deux lignes dès que l'écran se
   resserre : 50 px sur un écran large, 84 sur un téléphone. Le bas des
   pages et le bat-signal étaient calés sur des valeurs fixes, si bien
   que la barre recouvrait la fin de la page et que le bat-signal lui
   rentrait dedans.

   On mesure donc la barre — sa bande seulement, jamais son dépliant, qui
   n'a pas à repousser la page quand il s'ouvre — et on pose `--hud-h`,
   dont le CSS de chaque page se sert pour son `padding-bottom` et pour
   le `bottom` du bat-signal et de la bulle de badge.

   La mesure est refaite au redimensionnement, à la rotation et à l'arrivée
   des polices : Big Shoulders arrive après le premier rendu et change le
   retour à la ligne de la barre.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var hud = document.querySelector('.hud');
  if (!hud) return;
  /* les pages d'univers ont une bande dépliable, les autres une simple
     barre : on mesure ce qui existe */
  var bande = hud.querySelector('.hud-bar');

  function pose(){
    var h;
    if (bande) {
      var bt = parseFloat(getComputedStyle(hud).borderTopWidth) || 0;
      h = bande.getBoundingClientRect().height + bt;
    } else {
      h = hud.getBoundingClientRect().height;
    }
    if (h > 0) document.documentElement.style.setProperty('--hud-h', Math.round(h) + 'px');
  }

  pose();
  addEventListener('resize', pose);
  addEventListener('orientationchange', pose);
  if (window.ResizeObserver) new ResizeObserver(pose).observe(bande || hud);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pose);
})();

/* ═══ LE FORMULAIRE DE CONTACT ════════════════════════════════════════
   Le pied de page annonçait « Contact » depuis la refonte et menait à un
   `#` mort. Le site est statique, publié sur GitHub Pages : il n'a aucun
   serveur pour recevoir un envoi, et rien de tiers n'est branché. Le
   formulaire compose donc un `mailto:` — on écrit ici, la messagerie du
   visiteur envoie. C'est dit sous le bouton, parce qu'un formulaire qui
   a l'air de partir tout seul et qui ouvre une fenêtre de messagerie
   passe pour cassé.

   Il reste ouvert après l'envoi : si aucune messagerie n'est installée,
   il ne se passe rien du tout, et l'adresse écrite juste en dessous est
   alors le seul recours. Se refermer sur un clic sans effet serait la
   pire des réponses.

   L'adresse n'est écrite nulle part dans le HTML — elle est recomposée
   ici. Les moissonneuses ramassent les pages, pas les concaténations.

   Le jour où un vrai envoi sera voulu, il faudra un compte chez un
   passeur de formulaire (Formspree, Web3Forms) et sa clé ; seul le corps
   de `envoyer()` change, le reste tient.

   Un seul fichier pour les deux langues, comme la barre d'installation
   plus haut : on lit `documentElement.lang`.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var liens = document.querySelectorAll('a[data-contact]');
  if (!liens.length) return;

  var FR = document.documentElement.lang !== 'en';

  var ADRESSE = ['arcanerval', 'gmail.com'].join('@');

  /* Au-delà, les messageries tronquent le corps sans prévenir : mieux vaut
     un compteur visible qu'un message coupé en chemin. */
  var MAX = 1500, SEUIL = 1200;

  var T = FR ? {
    titre:   'Écrire à Chronologeek',
    dek:     'Une erreur dans une timeline, une sortie oubliée, une idée : c’est ici.',
    sujet:   'Sujet',
    sujets:  ['Une erreur dans une timeline', 'Une sortie manquante',
              'Une œuvre à ajouter', 'Une timeline à suggérer',
              'Une suggestion', 'Autre chose'],
    message: 'Message',
    place:   'Votre message…',
    envoyer: 'Envoyer',
    note:    'Le bouton ouvre votre messagerie avec le message déjà écrit : rien ne part avant que vous l’envoyiez.',
    ou:      'Ou écrire directement à',
    copie:   'Adresse copiée',
    fermer:  'Fermer',
    /* Les deux gabarits. Une suggestion sans titre ni raison ne se traite
       pas : les trois lignes sont là pour que la réponse arrive complète
       du premier coup, pas pour faire remplir un formulaire. */
    sgOeuvreT: 'Une œuvre manque à cette liste ?',
    sgOeuvreB: 'Suggérer une œuvre',
    sgOeuvreC: function(uni){ return 'Univers : ' + uni + '\n\n' +
                 'L’œuvre : \n' +
                 'Où elle se place : \n' +
                 'Pourquoi elle mérite d’y être : \n'; },
    sgTlT:     'Un univers manque à l’appel ?',
    sgTlB:     'Suggérer une timeline',
    sgTlC:     function(){ return 'L’univers ou le média : \n' +
                 'Ce qu’il faudrait y mettre (films, séries, romans, jeux…) : \n' +
                 'Pourquoi il mérite sa timeline : \n'; }
  } : {
    titre:   'Write to Chronologeek',
    dek:     'An error in a timeline, a release gone missing, an idea: this is the place.',
    sujet:   'Subject',
    sujets:  ['An error in a timeline', 'A missing release',
              'A work to add', 'A timeline to suggest',
              'A suggestion', 'Something else'],
    message: 'Message',
    place:   'Your message…',
    envoyer: 'Send',
    note:    'The button opens your mail app with the message already written: nothing goes out until you send it.',
    ou:      'Or write straight to',
    copie:   'Address copied',
    fermer:  'Close',
    sgOeuvreT: 'Something missing from this list?',
    sgOeuvreB: 'Suggest a work',
    sgOeuvreC: function(uni){ return 'Universe: ' + uni + '\n\n' +
                 'The work: \n' +
                 'Where it belongs: \n' +
                 'Why it deserves a place: \n'; },
    sgTlT:     'A universe missing from the site?',
    sgTlB:     'Suggest a timeline',
    sgTlC:     function(){ return 'The universe or medium: \n' +
                 'What it would cover (films, shows, novels, games…): \n' +
                 'Why it deserves its own timeline: \n'; }
  };

  var CSS = [
    /* `margin:auto` est ce qui centre un `dialog`, et les vingt pages
       posent `*{margin:0}` : sans le rappel, la boîte se colle en haut
       à gauche de l'écran. */
    '.cx{width:min(560px,calc(100vw - 22px));margin:auto;padding:0;',
    '  color:var(--paper);background:var(--ink);border:2px solid var(--paper)}',
    '.cx::backdrop{background:rgba(8,8,15,.74)}',
    '.cx-in{position:relative;padding:22px 22px 20px}',
    '.cx h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;',
    '  font-size:27px;letter-spacing:.03em;text-transform:uppercase;line-height:1;',
    '  margin:0 38px 7px 0}',
    '.cx-dek{font-size:13px;line-height:1.45;color:rgba(255,253,247,.72);margin-bottom:17px}',
    '.cx-f{margin-bottom:13px}',
    '.cx-f label{display:block;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:800;font-size:13.5px;letter-spacing:.08em;text-transform:uppercase;',
    '  color:var(--hot);margin-bottom:5px}',
    '.cx-f select,.cx-f textarea{display:block;width:100%;font-family:inherit;',
    '  font-size:14px;color:var(--paper);background:var(--ink);',
    '  border:2px solid var(--line);padding:9px 10px}',
    '.cx-f textarea{min-height:132px;resize:vertical;line-height:1.45}',
    '.cx-f select:focus,.cx-f textarea:focus{outline:none;border-color:var(--hot)}',
    /* sans ça, Windows peint la liste déroulante en clair sur clair */
    '.cx-f option{background:var(--ink);color:var(--paper)}',
    '.cx-cpt{display:block;text-align:right;font-size:11.5px;',
    '  color:rgba(255,253,247,.5);margin-top:4px}',
    /* `display:block` bat le `display:none` que porte l'attribut `hidden` :
       sans ce rappel, le compteur reste à l'écran sous le seuil. Ça ne se
       voyait pas tant que la boîte s'ouvrait vide — le compteur n'avait
       alors pas de texte à montrer. Un gabarit pré-écrit lui en donne un. */
    '.cx-cpt[hidden]{display:none}',
    '.cx-go{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:15px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;',
    '  background:var(--hot);border:2px solid var(--hot);color:var(--ink);padding:8px 22px}',
    '.cx-go:hover{background:var(--paper);border-color:var(--paper)}',
    '.cx-note{font-size:11.5px;line-height:1.5;color:rgba(255,253,247,.5);margin-top:9px}',
    '.cx-alt{border-top:2px solid var(--line);margin-top:16px;padding-top:13px;',
    '  font-size:12.5px;color:rgba(255,253,247,.6)}',
    '.cx-mail{font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;',
    '  background:none;border:none;padding:0;color:var(--paper);text-decoration:underline}',
    '.cx-mail:hover{color:var(--hot)}',
    '.cx-ok{color:var(--hot);font-weight:700}',
    '.cx-x{position:absolute;top:15px;right:15px;background:none;cursor:pointer;',
    '  border:2px solid var(--line);color:rgba(255,253,247,.6);padding:4px 9px;',
    '  font-size:13px;line-height:1}',
    '.cx-x:hover{border-color:var(--paper);color:var(--paper)}',
    '@media(max-width:520px){',
    '  .cx-in{padding:18px 16px 16px}',
    '  .cx h2{font-size:23px}',
    '  .cx-go{width:100%}',
    '}'
  ].join('');

  var boite = null, appelant = null;

  function bati(){
    if (boite) return boite;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    boite = document.createElement('dialog');
    boite.className = 'cx';
    boite.id = 'contact';
    boite.innerHTML =
      '<form class="cx-in" novalidate>' +
        '<button type="button" class="cx-x" aria-label="' + T.fermer + '">✕</button>' +
        '<h2>' + T.titre + '</h2>' +
        '<p class="cx-dek">' + T.dek + '</p>' +
        '<p class="cx-f"><label for="cx-s">' + T.sujet + '</label>' +
          '<select id="cx-s">' +
            T.sujets.map(function(s){ return '<option>' + s + '</option>'; }).join('') +
          '</select></p>' +
        '<p class="cx-f"><label for="cx-m">' + T.message + '</label>' +
          '<textarea id="cx-m" maxlength="' + MAX + '" placeholder="' + T.place + '"></textarea>' +
          '<span class="cx-cpt" hidden></span></p>' +
        '<button type="submit" class="cx-go">' + T.envoyer + '</button>' +
        '<p class="cx-note">' + T.note + '</p>' +
        '<p class="cx-alt">' + T.ou + ' ' +
          '<button type="button" class="cx-mail">' + ADRESSE + '</button> ' +
          '<span class="cx-ok" hidden>' + T.copie + '</span></p>' +
      '</form>';
    document.body.appendChild(boite);

    var form = boite.querySelector('form');
    var sel = boite.querySelector('#cx-s');
    var zone = boite.querySelector('#cx-m');
    var cpt = boite.querySelector('.cx-cpt');

    zone.addEventListener('input', function(){
      var n = zone.value.length;
      cpt.hidden = n < SEUIL;
      cpt.textContent = n + ' / ' + MAX;
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var corps = zone.value.trim();
      if (!corps) { zone.focus(); return; }
      location.href = 'mailto:' + ADRESSE +
        '?subject=' + encodeURIComponent('Chronologeek — ' + sel.value) +
        '&body=' + encodeURIComponent(corps);
    });

    var ok = boite.querySelector('.cx-ok');
    boite.querySelector('.cx-mail').addEventListener('click', function(){
      var dit = function(){ ok.hidden = false; setTimeout(function(){ ok.hidden = true; }, 2400); };
      if (navigator.clipboard) navigator.clipboard.writeText(ADRESSE).then(dit, function(){});
    });

    boite.querySelector('.cx-x').addEventListener('click', function(){ boite.close(); });
    /* le fond : la boîte occupe tout le `dialog`, un clic qui l'atteint
       est donc un clic à côté */
    boite.addEventListener('click', function(e){ if (e.target === boite) boite.close(); });
    boite.addEventListener('close', function(){ if (appelant) appelant.focus(); });

    return boite;
  }

  /* ── Ouvrir, éventuellement pré-rempli ────────────────────────────
     `data-contact` nu ouvre la boîte vide, comme avant. `data-contact`
     valant « oeuvre » ou « timeline » choisit le motif et pose un
     gabarit de trois lignes.

     Le gabarit est écrit ici, pas dans un attribut du HTML : un
     `data-corps` en français devrait être traduit dans chacun des
     scripts de traduction, et le nom de l'univers y serait figé page
     par page. Ici, une seule copie sert les vingt-six pages et les
     deux langues.

     Ce que le visiteur a tapé ne s'écrase jamais : on ne pose le
     gabarit que sur un champ vide, ou sur le gabarit précédent —
     rouvrir la boîte depuis un autre bouton doit changer de gabarit,
     pas effacer un message en cours. */
  var gabarit = '';

  function titrePage(){
    var h = document.querySelector('h1');
    if (!h) return '';
    /* Le Dossier écrit son titre en trois morceaux — « Dossier », « Star
       Wars », puis un sous-titre. `textContent` les colle bout à bout ;
       on les rejoint par une espace et on laisse le sous-titre dehors.
       La pastille `.tag` est dans le h1 des neuf univers depuis qu'elle
       y porte la requête ; elle en sort pareillement, sinon le sujet du
       courrier s'annonce « Ordre de visionnage canon — Star Wars ». */
    var out = [];
    for (var n = h.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n.className && /\b(sub|tag)\b/.test(n.className)) continue;
      var t = (n.textContent || '').trim();
      if (t) out.push(t);
    }
    /* Le tiret plutôt qu'une espace : l'anglais met son qualificatif
       devant (« Deep Dive », « Star Wars »), le français aussi mais dans
       l'autre ordre. Joints par une espace, l'un des deux sort de
       travers ; joints par un tiret, les deux se lisent comme un chemin
       de page. Les huit univers n'ont qu'un morceau et n'en voient rien. */
    return out.join(' — ');
  }

  function ouvre(el){
    appelant = el;
    var d = bati();
    var sel = d.querySelector('#cx-s'), zone = d.querySelector('#cx-m');
    var quoi = el.getAttribute('data-contact') || '';
    var suj = '', corps = '';

    if (quoi === 'oeuvre')        { suj = T.sujets[2]; corps = T.sgOeuvreC(titrePage()); }
    else if (quoi === 'timeline') { suj = T.sujets[3]; corps = T.sgTlC(); }

    if (suj) for (var i = 0; i < sel.options.length; i++)
      if (sel.options[i].value === suj) { sel.selectedIndex = i; break; }

    if (corps && (!zone.value.trim() || zone.value === gabarit)) {
      zone.value = corps;
      gabarit = corps;
      /* le compteur vit sur `input` : sans ça il ne saurait rien de ce
         qu'on vient d'écrire à sa place */
      zone.dispatchEvent(new Event('input'));
    }

    d.showModal();              /* la touche Échap et le piège au clavier viennent avec */
    if (corps) {
      zone.focus();
      /* le curseur au bout de la première ligne à remplir, pas au début
         du gabarit : la boîte s'ouvre là où il y a à écrire */
      var p = zone.value.indexOf('\n', zone.value.indexOf(': '));
      if (p < 0) p = zone.value.length;
      zone.setSelectionRange(p, p);
    } else sel.focus();
  }

  /* Délégation : les deux boutons de suggestion sont posés plus bas,
     après ce bloc, et une boucle sur `querySelectorAll` ne les aurait
     jamais vus. */
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('[data-contact]') : null;
    if (!a) return;
    e.preventDefault();
    ouvre(a);
  });

  /* ── Les deux points d'entrée ─────────────────────────────────────
     « Suggérer une œuvre » se pose au bas de « Ce qui est écarté » des
     huit univers et du Dossier : c'est là qu'on lit ce qui manque, donc
     là qu'on se dit qu'il manque autre chose. Le bloc vit dans le champ
     `intro` des `data-*.js`, en HTML, et le poser en JS évite d'écrire
     le même bouton dans dix-huit fichiers de données.

     « Suggérer une timeline » est dans le HTML de l'accueil, sur la case
     « Bientôt » : elle annonce déjà les univers en préparation. Le JS
     n'a qu'à l'habiller. */
  var CSS_SG = [
    '.sg-p{margin-top:18px;padding-top:15px;border-top:2px solid var(--line);',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 14px}',
    '.sg-t{font-size:13.5px;color:rgba(255,253,247,.7)}',
    '.sg{display:inline-block;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:800;font-size:14px;letter-spacing:.07em;text-transform:uppercase;',
    '  cursor:pointer;color:var(--hot);background:none;border:2px solid var(--hot);',
    '  padding:6px 16px;text-decoration:none;white-space:nowrap}',
    '.sg:hover,.sg:focus-visible{color:var(--ink);background:var(--hot)}',
    /* Dans la case « Bientôt » de l'accueil, le bouton est seul et le reste
       de la case est centré. Le filet de séparation tombe, lui : la mention
       « En cours » en pose déjà un juste au-dessus, et deux traits à onze
       pixels l'un de l'autre se lisent comme une erreur de mise en page. */
    '.slot.lock .sg-p{margin-top:11px;padding-top:0;border-top:none}'
  ].join('');

  function pose(){
    var cible = document.querySelector('.cuts-body');
    var deja = document.querySelectorAll('.sg');
    if (!cible && !deja.length) return;

    var st = document.createElement('style');
    st.textContent = CSS_SG;
    document.head.appendChild(st);

    /* Les boutons déjà dans le HTML — celui de l'accueil — sont écrits
       vides : leur libellé est posé ici, comme celui du bouton injecté.
       Un texte dans le HTML devrait être traduit dans les scripts, et
       l'accueil est l'une des pages qui se traduisent ligne à ligne. */
    for (var i = 0; i < deja.length; i++)
      if (!deja[i].textContent.trim())
        deja[i].textContent = deja[i].getAttribute('data-contact') === 'timeline'
          ? T.sgTlB : T.sgOeuvreB;

    if (!cible) return;
    var p = document.createElement('p');
    p.className = 'sg-p';
    p.innerHTML = '<span class="sg-t"></span>' +
                  '<a class="sg" href="#contact" data-contact="oeuvre"></a>';
    /* `textContent` plutôt qu'une concaténation : les deux libellés
       portent des apostrophes typographiques, et l'un d'eux un titre de
       page qu'on n'a pas écrit. */
    p.firstChild.textContent = T.sgOeuvreT;
    p.lastChild.textContent = T.sgOeuvreB;
    cible.appendChild(p);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LE MENU — fermetures que le HTML ne fait pas tout seul ═══════════
   Le tiroir mobile et le déroulant « Plus d'univers » s'ouvrent chacun
   par leur propre moyen — un bouton dans la page, un <details> natif —
   mais ni l'un ni l'autre ne se referme quand on clique ailleurs. Un
   menu resté ouvert derrière la page qu'on vient de quitter passe pour
   une page cassée. Le code est ici plutôt que dans les vingt-deux pages
   pour la raison qui vaut au reste de ce fichier : une seule copie.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var FR = document.documentElement.lang !== 'en';
  var bg = document.getElementById('burger'), dr = document.getElementById('drawer');

  function fermeTiroir(){
    if (!dr || !dr.classList.contains('open')) return;
    dr.classList.remove('open');
    bg.setAttribute('aria-expanded', 'false');
    bg.setAttribute('aria-label', FR ? 'Ouvrir le menu' : 'Open menu');
  }
  function fermePop(sauf){
    var d = document.querySelectorAll('details.nav-more[open]');
    for (var i = 0; i < d.length; i++) if (d[i] !== sauf) d[i].removeAttribute('open');
  }

  document.addEventListener('click', function(e){
    /* un lien suivi depuis le tiroir : l'ancre interne ne recharge pas la
       page, et le menu resterait donc étalé par-dessus la destination */
    if (dr && dr.contains(e.target)) { if (e.target.closest('a')) fermeTiroir(); }
    else if (!bg || !bg.contains(e.target)) fermeTiroir();

    var d = e.target.closest ? e.target.closest('details.nav-more') : null;
    fermePop(d);
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    fermeTiroir(); fermePop(null);
  });
})();

/* ═══ MES AJOUTS — l'interface ════════════════════════════════════════
   `e-perso.js` pose les entrées du visiteur dans les données avant que
   la page ne les lise ; ici on lui donne de quoi les écrire, les
   corriger et les retirer. Les deux moitiés ne se parlent que par
   `window.CGP`, et le stockage est le seul état partagé.

   Le fichier est chargé en dernier : la timeline est déjà dessinée
   quand ce bloc s'exécute. C'est pourquoi un ajout recharge la page —
   réinjecter à chaud demanderait de connaître le rendu de chacune des
   huit pages, qui n'ont en commun que quelques classes.

   Le Dossier Star Wars n'en est pas : sa liste de romans n'a ni
   `.bu-tags` ni carte bâtie comme celles des timelines. Il ne charge pas
   `e-perso.js`, et le garde-fou ci-dessous le laisserait sortir de
   toute façon.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var P = window.CGP;
  if (!P) return;                                    /* page sans timeline */
  if (!document.querySelector('.bu-tags')) return;   /* structure inattendue */

  var FR = document.documentElement.lang !== 'en';
  var CFG = window.CG || {};

  var T = FR ? {
    add:    'Ajouter une œuvre',
    tag:    'Votre ajout',
    titreN: 'Ajouter une œuvre',
    titreE: 'Modifier votre ajout',
    dek:    'Elle n’apparaîtra que sur cet appareil, dans votre navigateur. Rien n’est envoyé, et la timeline publique ne bouge pas. Un navigateur qui efface ses données l’emporte avec lui : le bouton Exporter en garde une copie.',
    fTitre: 'Titre',
    fType:  'Type',
    fDate:  'Date',
    fNote:  'Note',
    fOu:    'Juste après',
    fImg:   'Image',
    fDur:   'Durée',
    debut:  '— au tout début —',
    phT:    'Le titre de l’œuvre',
    phDur:  '2 h 15, ou 135',
    phD:    'Une année, une date, une époque…',
    phN:    'Ce que vous voulez vous rappeler (facultatif)',
    ok:     'Ajouter',
    save:   'Enregistrer',
    ko:     'Votre navigateur refuse d’enregistrer — navigation privée, ou mémoire pleine. L’ajout n’a pas été conservé.',
    koImg:  'Votre navigateur refuse d’enregistrer : l’image est sans doute de trop. Retirez-la, ou choisissez-en une plus légère.',
    fermer: 'Fermer',
    modif:  'Modifier votre ajout',
    sup:    'Retirer cet ajout',
    supQ:   'Retirer ?',
    supOui: 'Oui',
    supNon: 'Non',
    imgAdd: 'Choisir une image…',
    imgChg: 'Changer',
    imgRm:  'Retirer l’image',
    imgKo:  'Ce fichier n’a pas pu être lu comme une image.'
  } : {
    add:    'Add a work',
    tag:    'Your addition',
    titreN: 'Add a work',
    titreE: 'Edit your addition',
    dek:    'It only shows on this device, in your browser. Nothing is sent, and the public timeline stays as it is. A browser that clears its data takes it along: the Export button keeps a copy.',
    fTitre: 'Title',
    fType:  'Type',
    fDate:  'Date',
    fNote:  'Note',
    fOu:    'Right after',
    fImg:   'Image',
    fDur:   'Runtime',
    debut:  '— at the very beginning —',
    phT:    'The title of the work',
    phDur:  '2 h 15, or 135',
    phD:    'A year, a date, an era…',
    phN:    'Whatever you want to remember (optional)',
    ok:     'Add',
    save:   'Save',
    ko:     'Your browser refused to save — private browsing, or storage full. The addition was not kept.',
    koImg:  'Your browser refused to save: the image is most likely what tipped it over. Remove it, or pick a lighter one.',
    fermer: 'Close',
    modif:  'Edit your addition',
    sup:    'Remove this addition',
    supQ:   'Remove?',
    supOui: 'Yes',
    supNon: 'No',
    imgAdd: 'Choose an image…',
    imgChg: 'Change',
    imgRm:  'Remove the image',
    imgKo:  'That file could not be read as an image.'
  };

  var CSS = [
    /* La carte : le trait passe au pointillé, dans la couleur de
       l'univers. C'est à ça qu'on distingue d'un coup d'œil ce qu'on a
       posé soi-même de ce que la page apporte — sans rien ajouter à la
       carte, qui est déjà dense. */
    '.bu.mine>.bu-card{border-style:dashed}',
    '.bu.mine>.bu-card:hover{border-style:solid}',
    '.mine-t{font-family:\'Chivo\',sans-serif;font-size:10px;font-weight:700;',
    '  letter-spacing:.09em;text-transform:uppercase;padding:2px 7px;',
    '  border:1px dashed var(--uni,var(--hot));color:var(--uni,var(--hot))}',
    /* Le crayon et la croix se rangent à gauche du lien de copie, qui
       occupe déjà le coin. Ils restent visibles en permanence, eux : un
       bouton qui n'apparaît qu'au survol ne se découvre pas sur un
       téléphone. Le bloc est calé par la droite, donc la demande de
       confirmation s'étend vers la gauche sans rien déplacer. */
    '.mine-act{position:absolute;top:9px;right:41px;z-index:5;',
    '  display:flex;align-items:center;gap:2px}',
    '.mine-b{width:26px;height:26px;display:grid;place-items:center;cursor:pointer;',
    '  background:none;border:none;padding:0;color:rgba(255,253,247,.55)}',
    '.mine-b:hover,.mine-b:focus-visible{color:var(--hot)}',
    '.mine-b svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;',
    '  stroke-linecap:square}',
    /* La confirmation se pose là où était la croix, plutôt que dans une
       boîte système : `confirm()` sort du site, se place au milieu de
       l'écran et ne dit pas de quelle carte il parle. Ici la question
       est à côté de la ligne qu'elle vise. */
    '.mine-q{display:flex;align-items:center;gap:6px;background:var(--ink);',
    '  border:2px solid var(--line);padding:1px 4px 1px 8px}',
    '.mine-q>span{font-size:11.5px;color:var(--paper);white-space:nowrap}',
    '.mine-q button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;',
    '  background:none;border:2px solid var(--line);color:var(--paper);padding:1px 8px}',
    '.mine-q button:hover{border-color:var(--paper)}',
    '.mine-q .oui:hover{background:var(--paper);color:var(--ink)}',
    /* Le dialogue reprend la charte du formulaire de contact ; il ne
       reprend pas ses règles, qui ne sont posées qu'à sa première
       ouverture. Deux blocs indépendants valent mieux qu'un ordre à
       tenir entre eux. */
    '.mx{width:min(520px,calc(100vw - 22px));margin:auto;padding:0;',
    '  color:var(--paper);background:var(--ink);border:2px solid var(--paper)}',
    '.mx::backdrop{background:rgba(8,8,15,.74)}',
    '.mx-in{position:relative;padding:22px 22px 20px}',
    '.mx h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;',
    '  font-size:25px;letter-spacing:.03em;text-transform:uppercase;line-height:1;',
    '  margin:0 38px 7px 0}',
    '.mx-dek{font-size:12.5px;line-height:1.45;color:rgba(255,253,247,.7);margin-bottom:16px}',
    '.mx-f{margin-bottom:12px}',
    '.mx-f label{display:block;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;',
    '  color:var(--hot);margin-bottom:5px}',
    '.mx-f input,.mx-f select{display:block;width:100%;font-family:inherit;',
    '  font-size:14px;color:var(--paper);background:var(--ink);',
    '  border:2px solid var(--line);padding:9px 10px}',
    '.mx-f input:focus,.mx-f select:focus{outline:none;border-color:var(--hot)}',
    /* sans ça, Windows peint les listes déroulantes en clair sur clair */
    '.mx-f option,.mx-f optgroup{background:var(--ink);color:var(--paper)}',
    '.mx-2{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}',
    /* La durée n'est proposée que sur les cinq pages qui comptent le
       temps ; la ligne passe alors à trois colonnes. `:has()` évite de
       poser une classe depuis le JS pour un état qui ne change jamais
       après le premier rendu. */
    '.mx-2:has(.mx-rt:not([hidden])){grid-template-columns:1fr 1fr 1fr}',
    '.mx-f[hidden]{display:none}',
    /* L'image : un aperçu à la taille où elle paraîtra dans la timeline,
       190 px de large en 16/9. Voir sa vignette avant de valider vaut
       mieux que la découvrir recadrée une fois la page rechargée. */
    '.mx-img{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
    /* Le champ de fichier hérite de `.mx-f input` — bordure, rembourrage,
       pleine largeur — et ressortait donc en petit bloc à côté du bouton
       qui le pilote. Il faut le défaire, pas seulement le rétrécir. */
    '.mx-img input[type=file]{position:absolute;width:1px;height:1px;padding:0;',
    '  border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.mx-prev{flex:0 0 auto;width:118px;aspect-ratio:16/9;object-fit:cover;',
    '  background:var(--ink);border:2px solid var(--line)}',
    /* Les pages posent `img{display:block}`, qui bat le `display:none` de
       l'attribut `hidden` — le même piège que le compteur du formulaire
       de contact, à deux blocs d'ici. Sans ce rappel, l'aperçu vide
       occupe sa place avant qu'on ait choisi quoi que ce soit. */
    '.mx-prev[hidden]{display:none}',
    '.mx-rm[hidden]{display:none}',
    '.mx-pick{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:13.5px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;',
    '  background:none;border:2px solid var(--line);color:var(--paper);padding:6px 13px}',
    '.mx-pick:hover{border-color:var(--hot);color:var(--hot)}',
    '.mx-rm{font-family:inherit;font-size:12px;cursor:pointer;background:none;',
    '  border:none;padding:0;color:rgba(255,253,247,.6);text-decoration:underline}',
    '.mx-rm:hover{color:var(--paper)}',
    '.mx-go{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:15px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;',
    '  background:var(--hot);border:2px solid var(--hot);color:var(--ink);padding:8px 22px}',
    '.mx-go:hover{background:var(--paper);border-color:var(--paper)}',
    '.mx-bar{display:flex;align-items:center;gap:14px;margin-top:4px}',
    '.mx-ko{font-size:12px;line-height:1.45;color:var(--hot);margin-top:10px}',
    '.mx-x{position:absolute;top:15px;right:15px;background:none;cursor:pointer;',
    '  border:2px solid var(--line);color:rgba(255,253,247,.6);padding:4px 9px;',
    '  font-size:13px;line-height:1}',
    '.mx-x:hover{border-color:var(--paper);color:var(--paper)}',
    '@media(max-width:520px){.mx-in{padding:18px 16px 16px}.mx-2{grid-template-columns:1fr}',
    '  .mx-go{flex:1}}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  /* Les titres ne sont pas échappés de la même façon d'une page à
     l'autre — DC les stocke en texte brut et les rend avec `esc()`, le
     Dossier les stocke échappés. Un `<option>` veut du texte. */
  var tampon = document.createElement('div');
  function dec(s){ tampon.innerHTML = s == null ? '' : String(s); return tampon.textContent; }

  var CRAYON = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
               '<path d="M4 20h4L20 8l-4-4L4 16z"/></svg>';
  var CROIX  = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
               '<path d="M5 5l14 14M19 5 5 19"/></svg>';

  /* ── le dialogue ──────────────────────────────────────────────────── */
  var boite = null, edite = null, appelant = null;

  function bati(){
    if (boite) return boite;

    boite = document.createElement('dialog');
    boite.className = 'mx';
    boite.innerHTML =
      '<form class="mx-in" novalidate>' +
        '<button type="button" class="mx-x">✕</button>' +
        '<h2></h2><p class="mx-dek"></p>' +
        '<p class="mx-f"><label for="mx-t"></label>' +
          '<input id="mx-t" type="text" maxlength="120" autocomplete="off"/></p>' +
        '<div class="mx-2">' +
          '<p class="mx-f"><label for="mx-k"></label><select id="mx-k"></select></p>' +
          '<p class="mx-f"><label for="mx-d"></label>' +
            '<input id="mx-d" type="text" maxlength="40" autocomplete="off"/></p>' +
          '<p class="mx-f mx-rt"><label for="mx-r"></label>' +
            '<input id="mx-r" type="text" maxlength="12" autocomplete="off"/></p>' +
        '</div>' +
        '<p class="mx-f"><label for="mx-n"></label>' +
          '<input id="mx-n" type="text" maxlength="160" autocomplete="off"/></p>' +
        '<p class="mx-f"><label for="mx-a"></label><select id="mx-a"></select></p>' +
        '<p class="mx-f"><label for="mx-i"></label><span class="mx-img">' +
          '<img class="mx-prev" alt="" hidden/>' +
          '<input id="mx-i" type="file" accept="image/*"/>' +
          '<button type="button" class="mx-pick"></button>' +
          '<button type="button" class="mx-rm" hidden></button></span></p>' +
        '<div class="mx-bar"><button type="submit" class="mx-go"></button></div>' +
        '<p class="mx-ko" hidden></p>' +
      '</form>';
    document.body.appendChild(boite);

    boite.querySelector('.mx-x').setAttribute('aria-label', T.fermer);
    boite.querySelector('.mx-dek').textContent = T.dek;
    /* Nommés par leur champ, pas par leur rang : un champ inséré au
       milieu décalerait toute la suite, et les intitulés partiraient sur
       les mauvaises lignes sans que rien ne le signale. */
    var LIB = { 't':T.fTitre, 'k':T.fType, 'd':T.fDate, 'r':T.fDur,
                'n':T.fNote, 'a':T.fOu, 'i':T.fImg };
    Object.keys(LIB).forEach(function(c){
      boite.querySelector('label[for="mx-' + c + '"]').textContent = LIB[c];
    });
    boite.querySelector('#mx-t').placeholder = T.phT;
    boite.querySelector('#mx-d').placeholder = T.phD;
    boite.querySelector('#mx-r').placeholder = T.phDur;
    boite.querySelector('#mx-n').placeholder = T.phN;
    boite.querySelector('.mx-rm').textContent = T.imgRm;

    /* Cinq pages sur huit comptent le temps — Star Wars, Marvel, DC,
       Star Trek et The Walking Dead. Les trois autres n'ont pas de table
       `RT` du tout, et Avatar Legends n'en aura pas : sa timeline mêle
       comics et romans, qui n'ont pas de durée. Un champ qui n'irait
       nulle part n'a rien à faire dans le formulaire. */
    boite.querySelector('.mx-rt').hidden = !TEMPS;

    /* Les types sont ceux de la page, pas une liste à nous : c'est
       `CG.badgeLabels` qui décide de la couleur du badge et des cases du
       panneau de filtres. Un type inventé s'afficherait tel quel et ne
       répondrait à aucun filtre. */
    var k = boite.querySelector('#mx-k');
    Object.keys(CFG.badgeLabels || {}).forEach(function(c){
      var o = document.createElement('option');
      o.value = c; o.textContent = dec(CFG.badgeLabels[c][1]);
      k.appendChild(o);
    });

    /* « Juste après » : toutes les entrées, groupées par ère. Un select
       natif encaisse cent-vingt options mieux qu'une liste faite à la
       main, et il vient avec la recherche au clavier. */
    var a = boite.querySelector('#mx-a');
    var o0 = document.createElement('option');
    o0.value = ''; o0.textContent = T.debut;
    a.appendChild(o0);
    (P.data.eras || []).forEach(function(era){
      var g = document.createElement('optgroup');
      g.label = dec(era.title);
      (era.entries || []).forEach(function(e){
        if (!e.id) return;
        var o = document.createElement('option');
        o.value = e.id;
        o.textContent = dec(e.title) + (e.date ? '  ·  ' + dec(e.date) : '');
        g.appendChild(o);
      });
      if (g.children.length) a.appendChild(g);
    });

    boite.querySelector('form').addEventListener('submit', function(ev){
      ev.preventDefault();
      valide();
    });

    /* Le champ de fichier natif est masqué et piloté par un bouton : son
       rendu n'est ni le même d'un navigateur à l'autre ni celui du site,
       et il ne se met pas à la charte. Le bouton, lui, est un bouton. */
    var file = boite.querySelector('#mx-i');
    boite.querySelector('.mx-pick').addEventListener('click', function(){ file.click(); });
    file.addEventListener('change', function(){
      var f = file.files && file.files[0];
      /* remis à zéro tout de suite : sans ça, rechoisir le même fichier
         après l'avoir retiré ne déclenche plus rien */
      file.value = '';
      if (!f) return;
      reduit(f, function(d){ img = d; montreImg(); },
                function(){ dit(T.imgKo); });
    });
    boite.querySelector('.mx-rm').addEventListener('click', function(){
      img = ''; montreImg();
    });

    boite.querySelector('.mx-x').addEventListener('click', function(){ boite.close(); });
    boite.addEventListener('click', function(ev){ if (ev.target === boite) boite.close(); });
    boite.addEventListener('close', function(){ if (appelant) appelant.focus(); });

    return boite;
  }

  /* Retirer l'entrée ne suffit pas : sa coche reste dans la progression,
     et c'est un identifiant mort de plus à chaque suppression. La clé de
     progression n'est pas la nôtre — elle est déclarée dans le script de
     chaque page, sous un nom qui change à la publication —, alors plutôt
     que de la deviner on cherche l'identifiant lui-même. Il est unique et
     préfixé `p-` : rien d'autre ne peut porter ce nom. */
  function oublie(id){
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k === P.key) continue;
        var v = localStorage.getItem(k);
        if (!v || v.indexOf(id) < 0 || v.charAt(0) !== '{') continue;
        var o = JSON.parse(v);
        if (o && typeof o === 'object' && (id in o)) {
          delete o[id];
          localStorage.setItem(k, JSON.stringify(o));
        }
      }
    } catch (_) {}    /* du JSON qui n'en est pas, un stockage fermé : sans effet */
  }

  /* Le stockage peut refuser — navigation privée, quota plein. Le dire
     dans la boîte plutôt que de recharger sur un ajout qui n'existe
     pas : la page reviendrait sans l'entrée, et sans un mot. Quand une
     image est jointe, c'est presque toujours elle : le message le dit,
     et propose de la retirer plutôt que de renvoyer à un réglage de
     navigateur qui n'y est pour rien. */
  function dit(txt){
    var p = boite.querySelector('.mx-ko');
    p.textContent = txt; p.hidden = false;
  }
  function rate(){ dit(img ? T.koImg : T.ko); }

  /* ── l'image ──────────────────────────────────────────────────────
     La règle du site vaut ici aussi : quatre fois la taille de rendu, et
     on n'agrandit jamais. La vignette fait 190 px de large, d'où 760.

     Redimensionner n'est pas un raffinement : une photo de téléphone
     pèse cinq mégaoctets, et le stockage local en compte cinq pour tout
     le site. Une seule image y entrerait, et elle ferait tomber
     l'écriture de tout le reste. */
  var LARGE = 760, POIDS = 300 * 1024;
  var img = '';

  /* ── la durée ─────────────────────────────────────────────────────
     Elle se stocke en minutes, comme la table `RT` que `runtime.py`
     injecte, mais elle ne se saisit pas comme ça : on connaît un film
     en heures et une série en heures aussi — « 12 h 57 » plutôt que
     777. Les deux écritures sont acceptées, et l'édition rend celle qui
     se lit le mieux. */
  var TEMPS = !!window.RT && typeof window.RT === 'object';

  function enMinutes(s){
    s = String(s == null ? '' : s).trim().toLowerCase().replace(',', '.');
    if (!s) return 0;
    var m = s.match(/^(\d+)\s*(?:h|:)\s*(\d*)\s*(?:min|mn|m)?$/);
    if (m) return (+m[1]) * 60 + (+(m[2] || 0));
    m = s.match(/^(\d+)\s*(?:min|mn|m)?$/);
    return m ? +m[1] : 0;
  }

  function enTexte(n){
    n = +n || 0;
    if (!n) return '';
    if (n < 60) return n + ' min';
    return Math.floor(n / 60) + ' h ' + ('0' + (n % 60)).slice(-2);
  }

  function reduit(fichier, fait, echoue){
    var fr = new FileReader();
    fr.onerror = echoue;
    fr.onload = function(){
      var im = new Image();
      im.onerror = echoue;
      im.onload = function(){
        var w = im.naturalWidth, h = im.naturalHeight;
        if (!w || !h) return echoue();
        var k = Math.min(1, LARGE / w, LARGE / h);
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        /* WebP quand le navigateur sait l'écrire — c'est le format du
           reste du site, et la moitié du poids du JPEG à qualité égale.
           `toDataURL` d'un format inconnu rend du PNG sans le dire :
           c'est l'en-tête du résultat qui répond, pas une déclaration.
           La qualité descend tant que le résultat ne tient pas. */
        var q = [0.82, 0.6, 0.45], out = '';
        for (var i = 0; i < q.length; i++) {
          out = c.toDataURL('image/webp', q[i]);
          if (out.indexOf('data:image/webp') !== 0) out = c.toDataURL('image/jpeg', q[i]);
          if (out.length <= POIDS) break;
        }
        fait(out);
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(fichier);
  }

  function montreImg(){
    if (!boite) return;
    var prev = boite.querySelector('.mx-prev');
    prev.hidden = !img;
    if (img) prev.src = img;
    boite.querySelector('.mx-rm').hidden = !img;
    boite.querySelector('.mx-pick').textContent = img ? T.imgChg : T.imgAdd;
  }

  function valide(){
    var t = boite.querySelector('#mx-t').value.trim();
    if (!t) { boite.querySelector('#mx-t').focus(); return; }

    var a = {
      id:    edite ? edite.id : P.neuf(),
      title: t,
      type:  boite.querySelector('#mx-k').value,
      date:  boite.querySelector('#mx-d').value.trim(),
      note:  boite.querySelector('#mx-n').value.trim(),
      apres: boite.querySelector('#mx-a').value
    };
    if (img) a.img = img;
    var mn = TEMPS ? enMinutes(boite.querySelector('#mx-r').value) : 0;
    if (mn > 0) a.rt = mn;

    var l = P.lis();
    if (edite) {
      for (var i = 0; i < l.length; i++) if (l[i].id === edite.id) { l[i] = a; break; }
    } else l.push(a);

    if (P.ecris(l)) location.reload(); else rate();
  }

  function ouvre(a, depuis){
    edite = a || null;
    appelant = depuis || null;
    var d = bati();
    d.querySelector('.mx-ko').hidden = true;
    d.querySelector('h2').textContent = edite ? T.titreE : T.titreN;
    d.querySelector('.mx-go').textContent = edite ? T.save : T.ok;
    img = edite ? (edite.img || '') : '';
    montreImg();
    d.querySelector('#mx-t').value = edite ? edite.title : '';
    d.querySelector('#mx-d').value = edite ? (edite.date || '') : '';
    d.querySelector('#mx-r').value = edite ? enTexte(edite.rt) : '';
    d.querySelector('#mx-n').value = edite ? (edite.note || '') : '';
    if (edite) {
      d.querySelector('#mx-k').value = edite.type || '';
      /* L'ancre a pu disparaître depuis — une entrée retirée du guide,
         un autre ajout supprimé. Le select retombe alors sur « au tout
         début », ce que `place()` fait déjà de son côté. */
      d.querySelector('#mx-a').value = edite.apres || '';
    }
    d.showModal();
    d.querySelector('#mx-t').focus();
  }

  /* ── le crayon et la croix, sur la carte ─────────────────────────── */
  function retire(id){
    var l = P.lis().filter(function(x){ return x.id !== id; });
    if (!P.ecris(l)) return;   /* rien à écrire ne peut rien casser */
    oublie(id);
    location.reload();
  }

  /* La croix ne supprime pas : elle demande. Le second clic supprime, et
     tout le reste — la touche Échap, un clic ailleurs, le « Non » —
     ramène les deux boutons. Un `confirm()` aurait sorti du site, se
     serait posé au milieu de l'écran et n'aurait pas dit de quelle carte
     il parlait. */
  function actions(a){
    var box = document.createElement('span');
    box.className = 'mine-act';

    function repose(){
      box.innerHTML = '';
      var e = document.createElement('button');
      e.type = 'button'; e.className = 'mine-b';
      e.title = T.modif; e.setAttribute('aria-label', T.modif);
      e.innerHTML = CRAYON;
      e.addEventListener('click', function(ev){ stop(ev); ouvre(a, e); });

      var x = document.createElement('button');
      x.type = 'button'; x.className = 'mine-b';
      x.title = T.sup; x.setAttribute('aria-label', T.sup);
      x.innerHTML = CROIX;
      x.addEventListener('click', function(ev){ stop(ev); demande(); });

      box.appendChild(e); box.appendChild(x);
    }

    function demande(){
      box.innerHTML = '';
      var q = document.createElement('span');
      q.className = 'mine-q';
      var t = document.createElement('span');
      t.textContent = T.supQ;
      var oui = document.createElement('button');
      oui.type = 'button'; oui.className = 'oui'; oui.textContent = T.supOui;
      oui.addEventListener('click', function(ev){ stop(ev); retire(a.id); });
      var non = document.createElement('button');
      non.type = 'button'; non.textContent = T.supNon;
      non.addEventListener('click', function(ev){ stop(ev); repose(); });
      q.appendChild(t); q.appendChild(oui); q.appendChild(non);
      box.appendChild(q);
      oui.focus();
      /* Une question laissée ouverte finit par se faire répondre par
         mégarde : le clic suivant, où qu'il tombe, la referme. */
      setTimeout(function(){
        document.addEventListener('click', function ailleurs(ev){
          if (box.contains(ev.target)) return;
          document.removeEventListener('click', ailleurs);
          if (box.querySelector('.mine-q')) repose();
        });
      }, 0);
      document.addEventListener('keydown', function ech(ev){
        if (ev.key !== 'Escape') return;
        document.removeEventListener('keydown', ech);
        if (box.querySelector('.mine-q')) repose();
      });
    }

    repose();
    return box;
  }

  /* Le bloc est posé dans la carte, et la carte entière écoute le clic
     pour déplier son panneau. */
  function stop(ev){ ev.preventDefault(); ev.stopPropagation(); }

  /* ── marquer ce qui est à nous ───────────────────────────────────── */
  function marque(){
    var l = P.lis();
    if (!l.length) return;
    var par = {};
    l.forEach(function(a){ par[a.id] = a; });

    var arts = document.querySelectorAll('[data-id^="p-"]');
    for (var i = 0; i < arts.length; i++) {
      var art = arts[i], a = par[art.getAttribute('data-id')];
      if (!a) continue;
      art.classList.add('mine');

      var tags = art.querySelector('.bu-tags');
      if (tags) {
        var s = document.createElement('span');
        s.className = 'mine-t';
        s.textContent = T.tag;
        tags.insertBefore(s, tags.firstChild);
      }
      var card = art.querySelector('.bu-card');
      if (card) card.appendChild(actions(a));
    }
  }

  /* ── le bouton d'ajout, au bas de « Ce qui est écarté » ──────────── */
  function bouton(){
    var p = document.querySelector('.sg-p');
    if (!p) {
      var corps = document.querySelector('.cuts-body');
      if (!corps) return;
      p = document.createElement('p');
      p.className = 'sg-p';
      corps.appendChild(p);
    }
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sg';
    b.textContent = T.add;
    b.addEventListener('click', function(){ ouvre(null, b); });
    p.appendChild(b);
  }

  /* Le même report que le bloc des suggestions, et pour la même raison :
     `e-app.js` est chargé en fin de corps, donc pendant l'analyse du
     document. Sans lui, `bouton()` ne trouverait pas le `.sg-p` que
     l'autre bloc pose au chargement — il en créerait un second, et les
     deux boutons se retrouveraient sur deux lignes, dans le désordre. */
  function demarre(){ marque(); bouton(); }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', demarre);
  else demarre();
})();

/* ═══ TOUTES SES TIMELINES EN UN FICHIER — l'accueil ══════════════════
   Les neuf pages qui ont une timeline exportent chacune la leur, et
   c'est ce qu'il faut quand on n'en suit qu'une. Qui en suit quatre
   devait faire quatre fois le geste, sur quatre pages, et tenir quatre
   fichiers — un changement de navigateur devenait une corvée. Le bouton
   est donc aussi ici, là où l'on voit déjà les huit progressions à la
   fois.

   Le fichier n'invente rien : c'est l'union des exports de page, rangés
   par univers, plus le mode de parcours et l'univers en cours de
   lecture. Deux conséquences, qui tiennent tout le reste :

   - **Un fichier de page s'importe ici**, celui qu'on avait avant ce
     bouton comme celui d'aujourd'hui : `universe` désigne alors le seul
     bloc, et la suite ne change pas.
   - **Le fichier global s'importe sur une page**, qui n'en prend que sa
     part — une ligne dans chacune des neuf. Sans elle, `d.progress`
     étant absent, la page prenait le fichier entier pour une
     progression et rangeait `universes` et `chronologeek` parmi ses
     coches. Rien n'aurait cassé, et la page aurait été fausse.

   La progression est remplacée par le fichier, les ajouts sont
   fusionnés : c'est déjà l'arbitrage des neuf pages, et il vaut ici
   pour la même raison — on restaure une sauvegarde de coches, mais une
   œuvre écrite à la main ne se perd pas.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* L'accueil est la seule page qui aligne des cases d'univers. */
  if (!document.querySelector('.slot[data-u]')) return;

  var FR = document.documentElement.lang !== 'en';

  /* Les onze clés du stockage, écrites en clair. Deux ne se déduisent
     pas du nom d'univers : Star Trek stocke sous `st`, et les ajouts de
     Dragon Age sous `data_da`, du nom de son global. Le Dossier n'a pas
     d'ajouts — il ne charge pas `e-perso.js`.

     La clé de bloc est celle que les pages écrivent déjà dans leur champ
     `universe` : un fichier exporté avant ce bouton se relit sans
     conversion. */
  var UNIVERS = [
    { u:'sw',             prog:'cg-proto-sw',             perso:'cg-perso-sw' },
    { u:'mcu',            prog:'cg-proto-mcu',            perso:'cg-perso-mcu' },
    { u:'dc',             prog:'cg-proto-dc',             perso:'cg-perso-dc' },
    { u:'avatar',         prog:'cg-proto-avatar',         perso:'cg-perso-avatar' },
    { u:'startrek',       prog:'cg-proto-st',             perso:'cg-perso-st' },
    { u:'twd',            prog:'cg-proto-twd',            perso:'cg-perso-twd' },
    { u:'dragonage',      prog:'cg-proto-dragonage',      perso:'cg-perso-data_da' },
    { u:'assassinscreed', prog:'cg-proto-assassinscreed', perso:'cg-perso-assassinscreed' },
    { u:'dcanimation',    prog:'cg-proto-dcanim',         perso:'cg-perso-dcanim' },
    { u:'jurassic',       prog:'cg-proto-jurassic',       perso:'cg-perso-jurassic' },
    { u:'dossier-sw',     prog:'cg-proto-dossier-sw',     perso:null }
  ];

  /* Le même filtre que le HUD juste au-dessus : un identifiant de second
     parcours (`sw-r-…`) recouvre une œuvre déjà comptée, et un ajout
     perso (`p-`) n'est pas dans les totaux éditoriaux. Ils partent bien
     dans le fichier — c'est le compte affiché qui les écarte, pour dire
     le même nombre que la barre du bas. */
  var PARCOURS = /^([a-z]+-r-|p-)/;

  var T = FR ? {
    titre: 'Toutes vos timelines, en un fichier',
    dek:   'Vos coches sur les dix timelines et le Dossier, et les œuvres que vous avez ajoutées vous-même. Un seul fichier à emporter sur un autre appareil ou un autre navigateur, au lieu d’exporter page par page.',
    exp:   'Tout exporter',
    imp:   'Importer',
    nom:   'chronologeek-tout.json',
    rien:  'Rien de coché pour l’instant — ouvrez une timeline, le fichier suivra.',
    mauvais: 'Ce fichier n’est pas un export Chronologeek.',
    vide:  'Ce fichier ne porte aucune progression.',
    plein: 'Le navigateur a refusé d’enregistrer : mémoire pleine, ou navigation privée.',
    etat:  function(n, c, a){
      return n + ' univers · ' +
             c + (c > 1 ? ' entrées cochées' : ' entrée cochée') +
             (a ? ' · ' + a + (a > 1 ? ' ajouts à vous' : ' ajout à vous') : '');
    }
  } : {
    titre: 'All your timelines, in one file',
    dek:   'Your check marks across the ten timelines and the Deep Dive, plus the works you added yourself. One file to carry to another device or browser, instead of exporting page by page.',
    exp:   'Export everything',
    imp:   'Import',
    nom:   'chronologeek-all.json',
    rien:  'Nothing checked yet — open a timeline and the file will follow.',
    mauvais: 'This file is not a Chronologeek export.',
    vide:  'This file holds no progress.',
    plein: 'The browser refused to save: storage full, or private browsing.',
    etat:  function(n, c, a){
      return n + (n > 1 ? ' universes · ' : ' universe · ') +
             c + (c > 1 ? ' entries checked' : ' entry checked') +
             (a ? ' · ' + a + (a > 1 ? ' works of yours' : ' work of yours') : '');
    }
  };

  var CSS = [
    '.sy{border-bottom:2px solid var(--paper)}',
    /* Une colonne centrée à toute largeur : le texte, puis les deux
       boutons dessous. C'est la seule bande du site où l'on agit sur ce
       qu'on vient de lire, et la lecture doit mener au geste, pas le
       longer. */
    '.sy .wrap{display:flex;flex-direction:column;align-items:center;',
    '  text-align:center;gap:15px;padding-top:26px;padding-bottom:26px}',
    '.sy-txt{max-width:66ch}',
    '.sy h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;',
    '  font-size:clamp(21px,2.6vw,28px);letter-spacing:.02em;text-transform:uppercase;',
    '  line-height:.95}',
    '.sy p{font-size:13.5px;line-height:1.5;color:rgba(255,253,247,.72);',
    '  margin-top:6px}',
    '.sy-et{display:block;font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:14px;letter-spacing:.07em;text-transform:uppercase;color:var(--hot);',
    '  margin-top:9px}',
    '.sy-et.no{color:rgba(255,253,247,.5)}',
    '.sy-act{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}',
    '.sy-b{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:14.5px;',
    '  letter-spacing:.07em;text-transform:uppercase;cursor:pointer;padding:9px 20px;',
    '  background:var(--hot);border:2px solid var(--hot);color:var(--ink);',
    '  display:inline-flex;align-items:center;gap:8px}',
    '.sy-b:hover{background:var(--paper);border-color:var(--paper)}',
    '.sy-b[disabled]{cursor:not-allowed;background:none;border-color:var(--line);',
    '  color:rgba(255,253,247,.4)}',
    '.sy-b.alt{background:none;color:var(--hot)}',
    '.sy-b.alt:hover{background:var(--hot);color:var(--ink)}',
    '.sy-b svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;',
    '  stroke-linecap:square}',
    /* `display:block` bat le `display:none` que porte l'attribut `hidden` :
       sans ce rappel, le message occupe sa ligne avant d'exister. */
    '.sy-err{display:block;font-size:13px;font-weight:700;color:var(--mcu)}',
    '.sy-err[hidden]{display:none}',
    /* Étroit, les deux boutons prennent la ligne chacun : côte à côte ils
       tombaient à deux mots par ligne. */
    '@media(max-width:420px){',
    '  .sy-act{align-self:stretch;flex-direction:column}',
    '  .sy-b{justify-content:center}',
    '}'
  ].join('');

  /* ── le stockage, sans jamais lever ──────────────────────────────── */
  function lis(k, defaut){
    try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v || defaut; }
    catch (_) { return defaut; }
  }
  function pose(k, v){
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; }
  }

  /* ── ce qu'il y a à emporter ─────────────────────────────────────── */
  function recolte(){
    var out = {}, n = 0, coches = 0, ajouts = 0;
    UNIVERS.forEach(function(x){
      var p = lis(x.prog, {}), m = x.perso ? lis(x.perso, []) : [];
      if (!p || typeof p !== 'object' || Array.isArray(p)) p = {};
      if (!Array.isArray(m)) m = [];
      var cles = Object.keys(p);
      if (!cles.length && !m.length) return;      /* un univers jamais ouvert */
      var bloc = { progress: p };
      if (m.length) bloc.mine = m;
      var mode = null;
      try { mode = localStorage.getItem(x.prog + '-mode'); } catch (_) {}
      if (mode) bloc.mode = mode;
      out[x.u] = bloc;
      n++;
      coches += cles.filter(function(k){ return !PARCOURS.test(k); }).length;
      ajouts += m.length;
    });
    return { universes: out, n: n, coches: coches, ajouts: ajouts };
  }

  /* ── la fusion des ajouts, celle de `e-perso.js` ──────────────────
     Reprise ici plutôt qu'appelée : `e-perso.js` n'est chargé que par
     les pages qui ont une timeline, et il ne connaît que la sienne.
     Rend `false` sur la seule écriture refusée — « rien à changer » est
     un succès, pas un échec. */
  function fusionne(cle, entrants){
    if (!Array.isArray(entrants) || !entrants.length) return true;
    var par = {}, ordre = [], change = false;
    var actuels = lis(cle, []);
    if (!Array.isArray(actuels)) actuels = [];
    actuels.forEach(function(x){
      if (x && x.id) { par[x.id] = x; ordre.push(x.id); }
    });
    entrants.forEach(function(x){
      if (!x || typeof x !== 'object' || !x.id || !x.title) return;
      if (!par[x.id]) ordre.push(x.id);
      else if (JSON.stringify(par[x.id]) === JSON.stringify(x)) return;
      par[x.id] = x; change = true;
    });
    if (!change) return true;
    return pose(cle, ordre.map(function(i){ return par[i]; }));
  }

  /* ── le bloc, posé sous « Les Dossiers » ─────────────────────────── */
  function bati(){
    var apres = document.querySelector('.deep');
    var pere = apres ? apres.parentNode : document.getElementById('main');
    if (!pere) return null;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var sec = document.createElement('section');
    sec.className = 'sy';
    sec.id = 'sync';
    sec.innerHTML =
      '<div class="wrap">' +
        '<div class="sy-txt"><h2></h2><p></p><span class="sy-et"></span></div>' +
        '<div class="sy-act">' +
          '<button type="button" class="sy-b" id="sy-out">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' +
            '<span></span></button>' +
          '<button type="button" class="sy-b alt" id="sy-in">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>' +
            '<span></span></button>' +
          '<input type="file" accept="application/json,.json" id="sy-f" hidden/>' +
        '</div>' +
        '<span class="sy-err" hidden></span>' +
      '</div>';

    /* `textContent` plutôt qu'une concaténation : les libellés portent
       des apostrophes typographiques. */
    sec.querySelector('h2').textContent = T.titre;
    sec.querySelector('p').textContent = T.dek;
    sec.querySelector('#sy-out span').textContent = T.exp;
    sec.querySelector('#sy-in span').textContent = T.imp;

    if (apres) pere.insertBefore(sec, apres.nextSibling);
    else pere.appendChild(sec);
    return sec;
  }

  function demarre(){
    var sec = bati();
    if (!sec) return;

    var etat = sec.querySelector('.sy-et');
    var err = sec.querySelector('.sy-err');
    var out = sec.querySelector('#sy-out');
    var champ = sec.querySelector('#sy-f');

    function dit(m){ err.textContent = m || ''; err.hidden = !m; }

    /* Le compte dit ce que le fichier contiendra. Vide, il n'apprendrait
       rien à personne : le bouton se ferme, et la ligne dit pourquoi. */
    function bilan(){
      var r = recolte();
      etat.textContent = r.n ? T.etat(r.n, r.coches, r.ajouts) : T.rien;
      etat.className = r.n ? 'sy-et' : 'sy-et no';
      out.disabled = !r.n;
    }
    bilan();

    out.addEventListener('click', function(){
      var r = recolte();
      var f = { chronologeek: 1, kind: 'all', date: new Date().toISOString(),
                universes: r.universes };
      var last = lis('cg_last', null);
      if (last) f.last = last;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(f, null, 1)],
                                            { type:'application/json' }));
      a.download = T.nom;
      document.body.appendChild(a); a.click(); a.remove();
      dit('');
    });

    sec.querySelector('#sy-in').addEventListener('click', function(){ champ.click(); });

    champ.addEventListener('change', function(){
      var f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      var r = new FileReader();
      r.onload = function(){
        var d;
        try { d = JSON.parse(r.result); } catch (_) { return dit(T.mauvais); }
        if (!d || typeof d !== 'object') return dit(T.mauvais);

        /* Un fichier de page — `{universe, progress, mine}` — se lit ici
           aussi : il désigne un seul bloc, et la suite ne change pas. */
        var blocs = d.universes;
        if (!blocs && typeof d.universe === 'string') {
          blocs = {}; blocs[d.universe] = d;
        }
        if (!blocs || typeof blocs !== 'object') return dit(T.mauvais);

        var faits = 0, refus = 0;
        UNIVERS.forEach(function(x){
          var b = blocs[x.u];
          if (!b || typeof b !== 'object') return;
          var p = b.progress;
          if (p && typeof p === 'object' && !Array.isArray(p)) {
            if (pose(x.prog, p)) faits++; else refus++;
          }
          if (x.perso && Array.isArray(b.mine) && b.mine.length) {
            if (fusionne(x.perso, b.mine)) faits++; else refus++;
          }
          if (typeof b.mode === 'string' && b.mode) {
            try { localStorage.setItem(x.prog + '-mode', b.mode); } catch (_) {}
          }
        });
        if (d.last && typeof d.last === 'object') pose('cg_last', d.last);

        if (refus) return dit(T.plein);
        if (!faits) return dit(T.vide);
        /* Les cases, le score et le bandeau de reprise sont peints au
           chargement : c'est le rechargement qui les rebâtit, comme sur
           les neuf pages. */
        location.reload();
      };
      r.readAsText(f);
    });
  }

  /* Même report que les deux blocs précédents : `e-app.js` est chargé en
     fin de corps, donc pendant l'analyse du document. */
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', demarre);
  else demarre();
})();

/* ═══ COCHER EN SÉRIE — Maj + clic ════════════════════════════════════
   Le Dossier porte 535 lignes et Star Trek 248 : quelqu'un qui arrive en
   ayant déjà vu quarante œuvres devait faire quarante clics, et rien dans
   la page ne proposait mieux. Maj + clic sur une case aligne toute la
   plage depuis la case cliquée juste avant, sur l'état que la page vient
   de poser — on coche vers l'avant, on décoche vers l'arrière, c'est le
   même geste que dans un explorateur de fichiers.

   Quatre choses à savoir :

   - **On rejoue de vrais clics.** La coche, le pont de progression, les
     badges, le décompte et l'écriture dans le stockage vivent dans le
     script de chaque page, sous des noms qui lui appartiennent ; d'ici on
     ne les atteint pas. `click()` sur la case voisine fait passer la page
     par son propre chemin, celui qui est déjà juste. D'où le drapeau
     `enCours`, sans lequel chaque clic rejoué relancerait une plage.
   - **L'ordre est celui du DOM, et seules les lignes visibles comptent.**
     Un filtre posé, une branche DC repliée : ce qui n'est pas à l'écran
     n'entre pas dans la plage, sinon on cocherait ce qu'on ne voit pas.
   - **`checkVisibility()`, jamais `offsetParent`.** Le second répond sur
     la mise en page : il coûte une disposition complète — 54 ms sur les
     535 lignes du Dossier, à chaque clic — et il rend `null` pour toute
     la page quand celle-ci n'est pas peinte, ce qui vidait la plage sans
     un mot. Le premier répond sur le style, et c'est bien `display:none`
     que l'on cherche.
   - **`e-app.js` est chargé en fin de corps**, donc notre écouteur est
     inscrit après celui de la page : quand il s'exécute, `aria-checked`
     de la case cliquée porte déjà l'état neuf. C'est lui qu'on propage.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  if (!document.querySelector('[data-check]')) return;
  var FR = document.documentElement.lang !== 'en';

  var ancre = null;      // la dernière case cliquée à la main
  var enCours = false;   // les clics rejoués ne redeviennent pas ancre

  /* `peinte` se mesure une fois par appel, jamais par ligne : c'est une
     lecture de disposition, et il y en a 535 au Dossier. */
  function peinte(){ return !!document.body.offsetHeight; }
  function vue(r, p){
    if (!r) return false;
    for (var n = r; n && n !== document.body; n = n.parentElement)
      if (n.hidden) return false;
    /* Le style ne répond que sur une page peinte : dans un onglet jamais
       affiché, une prévisualisation ou une capture de vignette, la page
       fait 0 × 0 et `checkVisibility()` rend faux pour tout — la plage se
       viderait et le marqueur disparaîtrait sans un mot. L'attribut
       `hidden` parcouru ci-dessus suffit alors ; il porte déjà les filtres,
       les ères vides et les colonnes DC décochées. */
    if (!p) return true;
    return r.checkVisibility ? r.checkVisibility() : true;
  }
  function cases(){
    var p = peinte();
    return [].filter.call(document.querySelectorAll('[data-check]'), function(c){
      return vue(c.closest('[data-id]'), p);
    });
  }

  document.addEventListener('click', function(ev){
    if (enCours || !ev.target.closest) return;
    var c = ev.target.closest('[data-check]');
    if (!c) return;

    /* La liste ne se bâtit que pour une plage : un clic simple n'en a pas
       besoin, et il y en a mille fois plus. */
    if (ev.shiftKey && ancre && ancre !== c) {
      var liste = cases(), i = liste.indexOf(c), j = liste.indexOf(ancre);
      if (i > -1 && j > -1) {
        var etat = c.getAttribute('aria-checked');
        var a = Math.min(i, j), b = Math.max(i, j);
        enCours = true;
        for (var k = a; k <= b; k++)
          if (liste[k] !== c && liste[k].getAttribute('aria-checked') !== etat)
            liste[k].click();
        enCours = false;
        /* Maj + clic pose une sélection de texte par-dessus la timeline */
        var s = getSelection && getSelection();
        if (s && s.removeAllRanges) s.removeAllRanges();
      }
    }
    ancre = c;
  });

  /* Le geste ne s'invente pas : il se dit une fois, dans le panneau de
     filtres, là où le visiteur cherche déjà comment mener sa liste. */
  function pose(){
    var corps = document.querySelector('#sieve .filt-body') || document.getElementById('sieve');
    if (!corps || corps.querySelector('.rng-h')) return;
    var p = document.createElement('p');
    p.className = 'rng-h';
    p.style.cssText = 'margin:0;font-size:11.5px;line-height:1.4;text-align:center;' +
      'opacity:.62;letter-spacing:.02em';
    p.textContent = FR
      ? 'Astuce : Maj + clic sur une case coche tout depuis la précédente.'
      : 'Tip: Shift + click a box to tick everything since the previous one.';
    corps.appendChild(p);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LES FILTRES SE RETIENNENT ═══════════════════════════════════════
   Rien n'était persisté : décocher « Jeu vidéo » et « Bonus » pour ne
   garder que l'essentiel, puis revenir le lendemain, et la timeline
   entière était de retour. Le travail se refaisait à chaque visite,
   alors que la progression, elle, tient depuis toujours.

   Trois choses à savoir :

   - **On repose l'état par des clics, pas en écrivant `aria-pressed`.**
     `offLv`, `offK`, `offOpt` et `hideDone` vivent dans le script de la
     page ; poser l'attribut à la main laisserait le bouton allumé et le
     filtre éteint. Même raison qu'au bloc précédent.
   - **La recherche ne se retient pas**, et c'est délibéré : une requête
     oubliée qui masque quatre-vingts entrées se lit comme une page
     cassée, là où un type décoché se voit au décompte « 40 / 62 ».
   - **La clé porte le chemin de la page.** Une page par univers, un
     réglage par univers ; et le proto ne se mélange pas au site, leurs
     chemins diffèrent.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var sieve = document.getElementById('sieve');
  if (!sieve) return;
  var CLE = 'cg-filtres-' + location.pathname;

  function boutons(){
    return [].slice.call(sieve.querySelectorAll('button[aria-pressed]'));
  }
  /* Le rang ne vaut rien — un type ajouté décale tout. L'identifiant ou
     les `data-*` désignent le bouton et lui seul. */
  function nom(b){
    if (b.id) return b.id;
    var s = '';
    for (var k in b.dataset) s += k + '=' + b.dataset[k] + ';';
    return s || (b.textContent || '').trim();
  }
  function garde(){
    var o = {};
    boutons().forEach(function(b){ o[nom(b)] = b.getAttribute('aria-pressed'); });
    try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (_) {}
  }
  function relit(){
    var o = null;
    try { o = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (_) {}
    if (!o || typeof o !== 'object') return;
    boutons().forEach(function(b){
      var v = o[nom(b)];
      if ((v === 'true' || v === 'false') && v !== b.getAttribute('aria-pressed')) b.click();
    });
  }

  relit();
  /* On garde après coup : le clic est d'abord traité par la page, qui
     pose l'état. « Reprendre » remet tous les filtres à zéro sans passer
     par les boutons — il est donc écouté lui aussi. */
  document.addEventListener('click', function(ev){
    if (!ev.target.closest) return;
    if (ev.target.closest('#sieve button[aria-pressed]') || ev.target.closest('#start'))
      setTimeout(garde, 0);
  });
})();

/* ═══ LE TEMPS RESTANT, EN SOIRÉES ════════════════════════════════════
   « Restant à voir 937 h » ne se convertit pas de tête : on lit un grand
   nombre et on n'en fait rien. « ≈ 312 soirées » se pose tout de suite —
   c'est la même donnée, dans l'unité où le visiteur la vivra.

   Trois choses à savoir :

   - **Trois heures par soirée**, ce qui est un film et demi ou quatre
     épisodes. Le chiffre est rond et se dit dans l'infobulle plutôt que
     dans la ligne, qui est déjà chargée.
   - **On lit `#k-time`, on ne recalcule rien.** Le total restant est
     déjà additionné par le `tally()` de chaque page, à partir de sa
     table `RT` et des durées des ajouts perso ; le refaire ici demanderait
     de connaître cinq pages, et les deux chiffres pourraient diverger.
     Un `MutationObserver` suffit à suivre.
   - **Six pages sur dix comptent le temps** — Star Wars, Marvel, DC,
     Star Trek, The Walking Dead et DC Animation, dont la table `RT` de
     80 entrées est écrite à la main dans sa source anglaise, comme celles
     des deux précédentes. Avatar Legends, Dragon Age, Assassin's Creed et
     le Dossier n'ont pas de `#k-time`, et le bloc s'arrête là de lui-même.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var k = document.getElementById('k-time');
  if (!k) return;
  var FR = document.documentElement.lang !== 'en', SOIR = 3;

  var out = document.createElement('i');
  out.id = 'k-soirs';
  out.style.cssText = 'font-style:normal;font-size:11px;letter-spacing:.04em;' +
    'opacity:.7;margin-left:7px;white-space:nowrap';
  k.insertAdjacentElement('afterend', out);

  function pose(){
    var h = parseInt((k.textContent || '').replace(/[^0-9]/g, ''), 10);
    if (!h || h < SOIR) { out.textContent = ''; out.removeAttribute('title'); return; }
    var n = Math.round(h / SOIR);
    out.textContent = '≈ ' + n + (FR ? ' soirées' : ' evenings');
    out.title = FR ? 'à 3 h par soirée' : 'at 3 h an evening';
  }
  pose();
  new MutationObserver(pose).observe(k, { childList: true, characterData: true, subtree: true });
})();

/* ═══ « VOUS EN ÊTES LÀ » ═════════════════════════════════════════════
   Le bouton « Reprendre » ramène à la dernière entrée vue, mais il vit
   tout en haut de la page : en défilant, plus rien ne dit où l'on s'était
   arrêté. Un trait posé sous la dernière entrée cochée le dit sans qu'on
   ait à remonter, et il se déplace à chaque case cochée.

   Cinq choses à savoir :

   - **`aria-checked`, jamais la classe `done`.** Les neuf timelines
     posent les deux au rendu ; le Dossier ne pose `done` qu'au clic, et
     ses 535 lignes arrivent cochées à l'écran sans la classe. C'est déjà
     la raison du rappel de sauvegarde plus haut.
   - **La dernière ligne cochée *visible*.** Un filtre posé, une branche
     DC repliée : le trait irait se ranger dans un pan de page qui n'est
     pas à l'écran, et le visiteur ne le verrait jamais. Même
     `checkVisibility()` qu'au bloc de la coche en série, pour la même
     raison.
   - **Rien quand tout est coché**, où il ne dirait plus rien, ni quand
     rien ne l'est — c'est alors « Commencer », et le haut de la page.
   - **Il se repose après coup**, la page traitant le clic la première,
     et seulement sur les clics qui peuvent l'avoir déplacé : une case,
     un filtre. Ouvrir une fiche n'y change rien.
   - **`--uni` porte l'encre de l'univers**, déclarée par les dix pages.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  if (!document.querySelector('[data-check]')) return;
  var FR = document.documentElement.lang !== 'en';

  var css = document.createElement('style');
  css.textContent =
    '.ici{display:flex;align-items:center;gap:9px;margin:3px 0;' +
      'font-size:11px;font-weight:700;line-height:1;' +
      'letter-spacing:.15em;text-transform:uppercase;color:var(--uni,#e8b53d)}' +
    '.ici::before{content:"";flex:0 0 auto;width:8px;height:8px;' +
      'background:currentColor;transform:rotate(45deg)}' +
    '.ici::after{content:"";flex:1;height:2px;background:currentColor;opacity:.4}' +
    '@media print{.ici{display:none}}';
  document.head.appendChild(css);

  var trait = document.createElement('p');
  trait.className = 'ici';
  trait.setAttribute('aria-hidden', 'true');
  trait.appendChild(document.createTextNode(FR ? 'Vous en êtes là' : 'You are here'));

  /* `peinte` se mesure une fois par appel, jamais par ligne : c'est une
     lecture de disposition, et il y en a 535 au Dossier. */
  function peinte(){ return !!document.body.offsetHeight; }
  function vue(r, p){
    if (!r) return false;
    for (var n = r; n && n !== document.body; n = n.parentElement)
      if (n.hidden) return false;
    /* Le style ne répond que sur une page peinte : dans un onglet jamais
       affiché, une prévisualisation ou une capture de vignette, la page
       fait 0 × 0 et `checkVisibility()` rend faux pour tout — la plage se
       viderait et le marqueur disparaîtrait sans un mot. L'attribut
       `hidden` parcouru ci-dessus suffit alors ; il porte déjà les filtres,
       les ères vides et les colonnes DC décochées. */
    if (!p) return true;
    return r.checkVisibility ? r.checkVisibility() : true;
  }
  function retire(){ if (trait.parentNode) trait.parentNode.removeChild(trait); }
  function pose(){
    var vues = document.querySelectorAll('[data-check][aria-checked="true"]');
    if (!vues.length || vues.length >= document.querySelectorAll('[data-check]').length)
      return retire();
    /* On remonte depuis la fin et on s'arrête à la première ligne visible :
       c'est presque toujours la première essayée, là où filtrer la liste
       entière coûterait autant de résolutions de style que de lignes
       cochées — 500 au Dossier, à chaque clic. */
    var p = peinte();
    for (var i = vues.length - 1; i >= 0; i--) {
      var ligne = vues[i].closest('[data-id]');
      if (!vue(ligne, p)) continue;
      if (ligne.nextSibling !== trait) ligne.parentNode.insertBefore(trait, ligne.nextSibling);
      return;
    }
    retire();
  }

  pose();
  /* Tout clic le repose, plutôt que la liste de ceux qui le déplacent :
     cocher, filtrer, « Reprendre », mais aussi changer d'onglet de branche
     chez DC, où le trait ne devait paraître que dans la branche lue. La
     liste aurait manqué le dernier, et personne ne l'aurait vu manquer.
     La recherche et le glissement, eux, ne passent pas par un clic. */
  document.addEventListener('click', function(){ setTimeout(pose, 0); });
  addEventListener('touchend', function(){ setTimeout(pose, 0); }, { passive: true });
  var q = document.getElementById('q');
  if (q) q.addEventListener('input', function(){ setTimeout(pose, 0); });
})();
/* ═══ LA PROCHAINE SORTIE, EN TÊTE DE SA TIMELINE ══════════════════════
   `radar.json` était lu par une seule page sur vingt-huit. Les neuf
   guides ne disaient rien de ce qui sort demain, alors que c'est la
   question que se pose quiconque suit une saga en cours — et le radar
   avait déjà la réponse, à un lien de là.

   Un encart d'une ligne, sous l'accroche : ce qui tombe le plus tôt pour
   cet univers-là, son compte à rebours, et le lien vers « À venir ».
   Deux gains d'un coup — une page statique qui se rafraîchit toute seule
   chaque jour, et un maillage vers le radar depuis les pages les plus
   visitées du site.

   Cinq choses à savoir :

   · **La clé du radar n'est pas celle du site.** `radar.json` écrit
     `starwars` et `marvel` là où le dépôt dit `sw` et `mcu`, et The
     Walking Dead s'y appelle `twd` quand sa route est `walkingdead`. On
     part donc du dernier segment de l'URL, qui est le nom de la route, et
     la table dit le reste. Un univers absent de la table n'a pas
     d'encart : Dragon Age et DC Animation ne sont pas au radar, et c'est
     délibéré.

   · **Assassin's Creed est dans la table et n'affichera rien**, comme sa
     colonne au radar : ses sept œuvres annoncées sont toutes sans date.
     L'encart paraîtra tout seul le jour où une date tombera, sans rien à
     rebrancher — la même règle que la colonne.

   · **Chaque langue coupe à sa propre date**, exactement comme
     `e-a-venir.html` : `date_sort` porte la sortie américaine,
     `date_sort_fr` la française. Prendre la française sur la page
     anglaise ferait disparaître un film deux mois trop tôt. `iso()`,
     `titreDe()` et `dateDe()` sont les siennes, à l'identique — deux
     lectures qui divergeraient donneraient deux dates pour une sortie.

   · **Le fetch part tout de suite, pas après `load`.** Sur ces pages le
     premier rendu arrive bien après le script — 3 452 ms contre 1 233 —
     donc l'encart est en place avant que l'écran s'allume et ne décale
     rien. Différé, il serait arrivé après coup et aurait poussé toute la
     page vers le bas.

   · **Rien ne paraît si quoi que ce soit manque** — pas de radar, pas
     d'univers, rien à venir. Un encart qui annonce son propre échec sur
     une page qui n'a rien demandé vaut moins que pas d'encart.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';

  /* Le nom de la route → la clé d'univers de `radar.json`, et ce que la page
     a le droit d'annoncer.

     **Star Wars est coupé en deux, et c'est le partage éditorial du site.**
     Quatorze de ses seize sorties au radar sont des comics et des romans, que
     la timeline principale ne couvre pas : elle n'a que des films, des séries,
     des animés et des jeux, et l'écrit vit dans le Dossier. L'encart annonçait
     donc à peu près toujours une œuvre dont la page ne parle pas. La timeline
     ne montre plus que l'écran et les jeux, le Dossier reçoit l'écrit — et un
     encart qu'il n'avait pas.

     Les autres univers n'ont pas de coupure parce qu'ils n'ont pas de Dossier :
     les comics d'Avatar Legends sont dans sa timeline, ils ont donc leur place
     dans son encart. Un dixième univers n'en a besoin que le jour où son écrit
     sortira dans une page à lui. */
  var ECRIT  = { comic: 1, novel: 1 };
  var RADAR = {
    starwars:       { u: 'starwars', tri: 'ecran' },
    'star-wars':    { u: 'starwars', tri: 'ecrit' },
    marvel:         { u: 'marvel' },
    dc:             { u: 'dc' },
    avatar:         { u: 'avatar' },
    startrek:       { u: 'startrek' },
    walkingdead:    { u: 'twd' },
    assassinscreed: { u: 'assassinscreed' }
  };

  var T = FR ? {
    quoi: 'Prochaine sortie',
    tout: 'Toutes les sorties',
    auj:  'AUJOURD’HUI',
    dem:  'DEMAIN',
    cd:   function(n){ return 'J‑' + n; }
  } : {
    quoi: 'Next release',
    tout: 'All upcoming',
    auj:  'TODAY',
    dem:  'TOMORROW',
    cd:   function(n){ return 'D‑' + n; }
  };

  var MOIS = FR
    ? ['janvier','février','mars','avril','mai','juin','juillet','août',
       'septembre','octobre','novembre','décembre']
    : ['January','February','March','April','May','June','July','August',
       'September','October','November','December'];

  var CSS = [
    /* Les dix pages posent `.intro{padding:34px 0 8px}` : c'est cette
       respiration-là qui détachait l'accroche de la barre de stats, et
       l'encart la lui avait prise en se glissant devant. Il la reprend pour
       lui en haut, et le padding de l'accroche fait l'espace du dessous —
       34 px de chaque côté, sans rien ajouter à ce que la page mesure déjà.

       **En `padding`, pas en `margin`.** L'encart est le premier enfant du
       `<main>`, qui n'a ni padding ni bordure : une marge haute s'en échappe
       par effondrement et ne sépare plus rien — mesurée à 0 px du haut du
       corps. Le cadre est porté par `.nx-in`, donc le padding du conteneur ne
       se voit pas. */
    '.nx{padding-top:34px;margin:0 auto}',
    /* Centré et à la largeur de son contenu, comme la pastille du titre et la
       ligne « Mis à jour » : les encadrés de ces pages ne s'étirent pas d'un
       bord à l'autre, ils se posent au milieu. `max-width` le borne quand le
       titre est long, et le dégradé part alors des deux côtés. */
    '.nx-in{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;',
      'width:max-content;max-width:100%;margin-inline:auto;',
      'padding:11px 16px;border:1px solid rgba(255,255,255,.10);border-radius:10px;',
      'background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--uni) 13%,transparent) 50%,transparent);',
      'border-left:3px solid var(--uni);border-right:3px solid var(--uni)}',
    '.nx-lab{font-weight:700;font-size:11px;line-height:1;letter-spacing:.09em;',
      'text-transform:uppercase;color:var(--uni);flex:0 0 auto}',
    '.nx-t{font-weight:700;font-size:14.5px;flex:1 1 auto;min-width:0}',
    '.nx-ep{opacity:.72;font-weight:400}',
    '.nx-d{font-size:12.5px;opacity:.66;flex:0 0 auto}',
    /* Le compte à rebours est un signe, pas une phrase. Les deux derniers
       jours il devient un mot, et un mot ne tient pas dans la place d'un
       signe : il se resserre, comme au radar. */
    '.nx-cd{font-weight:900;font-size:15px;line-height:1;color:var(--uni);flex:0 0 auto;',
      'padding:5px 9px;border:1px solid color-mix(in srgb,var(--uni) 45%,transparent);',
      'border-radius:7px}',
    '.nx-cd.mot{font-size:11px;letter-spacing:.06em}',
    '.nx-a{flex:0 0 auto;font-size:12.5px;color:var(--uni);text-decoration:none;',
      'border-bottom:1px solid color-mix(in srgb,var(--uni) 40%,transparent);padding-bottom:1px}',
    '.nx-a:hover{border-bottom-color:var(--uni)}',
    /* Sous 560 px la ligne se plie : le titre garde sa ligne entière et le
       reste passe dessous. Sans `order`, le compte à rebours se retrouvait
       entre le libellé et le titre. */
    '@media(max-width:560px){',
      /* `width:max-content` et un titre qui prend la ligne entière ne vont pas
         ensemble : la boîte reprend la largeur disponible pour se plier. */
      '.nx-in{gap:8px 10px;width:auto;text-align:center}',
      '.nx-t{flex:1 1 100%;order:2}',
      '.nx-lab{order:1}.nx-cd{order:1}.nx-d{order:3}.nx-a{order:3}',
    '}'
  ].join('');

  function iso(e){ return (FR && e.date_sort_fr) || e.date_sort || ''; }
  function titreDe(e){ return (FR && e.title_fr) ? e.title_fr : e.title; }
  function dateDe(e){
    if (FR) return e.date_txt_fr || e.date_txt || '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.date_sort || '');
    return m ? MOIS[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + m[1]
             : (e.date_txt || '');
  }

  function pose(entree, jours){
    /* L'encart se pose **juste au-dessus de l'accroche**, en tête du corps
       de page : ce qui sort demain se lit avant ce qui explique la page, pas
       après. `#intro` est dans un `.wrap`, lui-même dans le `<main>`. */
    var intro = document.getElementById('intro');
    var hote  = intro && intro.parentNode;
    if (!hote || !hote.parentNode || document.querySelector('.nx')) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var mot = jours <= 1;
    var cd  = jours <= 0 ? T.auj : jours === 1 ? T.dem : T.cd(jours);
    var ep  = entree.ep ? 'S' + entree.ep.s + 'E' + String(entree.ep.e).replace(/^(\d)$/, '0$1') : '';

    var box = document.createElement('div');
    box.className = 'nx wrap';
    box.innerHTML =
      '<div class="nx-in">' +
        '<span class="nx-lab"></span>' +
        '<span class="nx-cd' + (mot ? ' mot' : '') + '"></span>' +
        '<span class="nx-t"></span>' +
        '<span class="nx-d"></span>' +
        '<a class="nx-a" href="' + (FR ? '/fr/a-venir' : '/upcoming') + '"></a>' +
      '</div>';
    /* `textContent` plutôt qu'une concaténation : les titres portent des
       apostrophes typographiques et des esperluettes qu'on n'a pas écrites. */
    var q = function(s){ return box.querySelector(s); };
    q('.nx-lab').textContent = T.quoi;
    q('.nx-cd').textContent  = cd;
    q('.nx-t').textContent   = titreDe(entree);
    if (ep) {
      var sp = document.createElement('span');
      sp.className = 'nx-ep';
      sp.textContent = '  ' + ep;
      q('.nx-t').appendChild(sp);
    }
    q('.nx-d').textContent = dateDe(entree);
    q('.nx-a').textContent = T.tout;

    hote.parentNode.insertBefore(box, hote);
  }

  var route = (location.pathname.replace(/\/+$/, '').split('/').pop() || '')
                .replace(/\.html$/, '');
  var page = RADAR[route];
  if (!page) return;

  function retenu(e){
    if (e.universe !== page.u) return false;
    var ecrit = !!ECRIT[e.kindKey];
    if (page.tri === 'ecran') return !ecrit;
    if (page.tri === 'ecrit') return ecrit;
    return true;
  }

  /* `no-cache` comme `e-a-venir.html` : le radar est régénéré chaque nuit,
     et un encart qui annonce une sortie déjà passée vaut moins que rien. */
  fetch('/radar.json', { cache: 'no-cache' })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.length) return;
      var t    = new Date();
      var jour = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      var iso0 = jour.getFullYear() + '-' +
                 String(jour.getMonth() + 1).replace(/^(\d)$/, '0$1') + '-' +
                 String(jour.getDate()).replace(/^(\d)$/, '0$1');

      var suite = [];
      for (var i = 0; i < data.length; i++) {
        var e = data[i];
        if (retenu(e) && iso(e) && iso(e) >= iso0) suite.push(e);
      }
      if (!suite.length) return;
      suite.sort(function(a, b){ return iso(a) < iso(b) ? -1 : iso(a) > iso(b) ? 1 : 0; });

      var n = Math.round((new Date(iso(suite[0]) + 'T00:00:00') - jour) / 86400000);
      var faire = function(){ pose(suite[0], n); };
      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', faire);
      else faire();
    })
    .catch(function(){});
})();

/* ═══ LE FLUX DU JOURNAL, DIT À VOIX HAUTE ═════════════════════════════
   Les vingt-huit pages portent le `<link rel="alternate">` qui désigne le
   flux : un lecteur de flux le trouve tout seul, un navigateur aussi. Un
   visiteur, non — et personne ne devine une URL de flux.

   Un lien sous l'accroche des Nouveautés, la seule page où il veut dire
   quelque chose. Il est ici plutôt que dans le proto pour la même raison
   que les deux boutons « Suggérer » : un texte dans le HTML devrait être
   traduit dans `traduire-pages.mjs`, et les Nouveautés sont l'une des
   pages qui s'apparient ligne à ligne.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';

  function pose(){
    /* Le `<link>` du `<head>` est la seule source de l'URL : deux écritures
       divergeraient, et c'est `publier.mjs` qui la connaît. */
    var lien = document.querySelector('link[type="application/atom+xml"]');
    var dek  = document.querySelector('.attract .dek');
    if (!lien || !dek || document.querySelector('.fx')) return;

    /* Seule la page du journal le montre : ailleurs, le flux n'est pas ce
       qu'on est venu chercher. On la reconnaît à son `#tag-t`, l'indicateur
       de fraîcheur que le JS remplit, et que personne d'autre ne porte. */
    if (!document.getElementById('tag-t')) return;

    var st = document.createElement('style');
    st.textContent =
      '.fx{margin-top:12px;font-size:13px}' +
      '.fx a{color:var(--hot);text-decoration:none;' +
        'border-bottom:1px solid color-mix(in srgb,var(--hot) 40%,transparent);padding-bottom:1px}' +
      '.fx a:hover{border-bottom-color:var(--hot)}' +
      '.fx span{color:rgba(255,253,247,.55);margin-left:7px}';
    document.head.appendChild(st);

    var p = document.createElement('p');
    p.className = 'fx';
    p.innerHTML = '<a></a><span></span>';
    p.firstChild.href = lien.getAttribute('href');
    p.firstChild.textContent = FR ? 'Suivre par flux RSS' : 'Follow by RSS';
    p.lastChild.textContent  = FR ? 'sans compte, sans algorithme'
                                  : 'no account, no algorithm';
    dek.parentNode.insertBefore(p, dek.nextSibling);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LA RECHERCHE, DEPUIS L'ACCUEIL ═══════════════════════════════════
   Chaque page cherchait dans la sienne, et rien ne cherchait dans les
   autres. Qui arrive en se demandant où se place *Andor*, *Le Cycle de
   Kyoshi* ou *Arkham Origins* devait deviner l'univers, ouvrir la page,
   puis y chercher — trois gestes pour une question qui en vaut un. Neuf
   timelines et un Dossier font 1 463 œuvres : la taille où un catalogue
   cesse de se parcourir et commence à se chercher.

   L'index est produit à la publication par `_proto/recherche.mjs`, un
   fichier par langue, depuis les mêmes `data*.js` que le reste : une
   œuvre ajoutée demain s'y trouve sans qu'on y touche.

   Six choses à savoir :

   · **Tout est ici, pas une ligne dans `e-accueil.html`.** Donc rien à
     traduire dans `traduire-pages.mjs` et rien de plus à apparier pour
     `py sync.py check` — la raison qui vaut déjà pour « Tout exporter »
     et les quatre conforts. L'accueil se reconnaît à `.slot[data-u]`.

   · **Le bloc se pose entre « Continuer » et la sélection.** Pas dans le
     héros : `.attract` porte `overflow:hidden` pour ses plans et son
     halftone, et le panneau de résultats y serait coupé net. L'ordre dit
     d'ailleurs le bon parcours — on reprend, sinon on cherche, sinon on
     parcourt.

   · **L'index se charge au premier focus**, pas au chargement de la page
     ni à la première frappe. 120 Ko qu'on ne demande jamais à qui vient
     cliquer sur une tuile, et qui sont là avant la fin du premier mot.

   · **La ponctuation ne doit pas faire échouer la recherche.** « shield »
     ne trouve pas « S.H.I.E.L.D. » par sous-chaîne : chaque titre porte
     donc aussi une forme compacte, sans accent ni ponctuation, et c'est
     le dernier recours du classement.

   · **La précision distingue les blocs d'une même série**, pour la raison
     déjà connue du `FAQPage` : « Les Agents du S.H.I.E.L.D. » revient
     treize fois chez Marvel, et treize résultats identiques ne désignent
     rien. Elle vient de l'index, qui ne la porte que là où le titre se
     répète.

   · **Rien ne paraît si l'index manque.** Le panneau ne s'ouvre qu'une
     fois le fichier lu ; un champ qui ne cherche pas vaut moins que pas
     de champ.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';

  var ancre = document.getElementById('uni');
  if (!ancre || !document.querySelector('.slot[data-u]')) return;

  var T = FR ? {
    ph:   'Chercher une œuvre — film, série, jeu, roman, comic…',
    lab:  'Chercher dans les timelines',
    rien: 'Aucune œuvre de ce nom.',
    plus: function(n, t){ return n + ' sur ' + t + ' résultats'; }
  } : {
    ph:   'Search a title — film, series, game, novel, comic…',
    lab:  'Search the timelines',
    rien: 'No work by that name.',
    plus: function(n, t){ return n + ' of ' + t + ' results'; }
  };

  var MAX = 30;

  var CSS = [
    /* `padding-top` seul, jamais la forme courte : le bloc porte la classe
       `wrap`, qui pose `padding:0 20px`, et un `padding:26px 0 0` écrit ici
       passe après elle et remet les côtés à zéro. Le champ se collait alors
       aux deux bords de l'écran sur un téléphone, seul bloc de la page dans
       ce cas. */
    '.sr{padding-top:26px;position:relative;z-index:4}',
    '.sr-box{display:flex;align-items:center;gap:10px;max-width:640px;margin-inline:auto;',
      'padding:0 14px;background:rgba(255,253,247,.05);border:1px solid rgba(255,253,247,.16);',
      'border-radius:11px;transition:border-color .15s,background .15s}',
    '.sr-box:focus-within{border-color:var(--hot);background:rgba(255,253,247,.08)}',
    '.sr-box svg{flex:0 0 auto;opacity:.5}',
    '.sr-box:focus-within svg{opacity:.9}',
    /* Le champ hérite sinon du `font-family` du navigateur, qui n'est celui
       d'aucune autre ligne de la page. */
    '.sr-q{flex:1 1 auto;min-width:0;background:none;border:0;outline:0;',
      'font:inherit;font-size:15.5px;color:var(--paper);padding:13px 0}',
    '.sr-q::placeholder{color:rgba(255,253,247,.42)}',
    /* La croix native de `type="search"` ne suit ni la couleur ni la taille du
       reste : on la retire, le champ se vide à Échap et au clavier. */
    '.sr-q::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}',
    /* Le panneau flotte : les tuiles ne doivent pas descendre à chaque frappe.
       Il est absolu dans `.sr`, qui est en flux — il suit donc la largeur du
       champ sans rien mesurer. */
    /* Les 20 px sont ceux du `.wrap` : un élément absolu se cale sur la boîte
       de padding de son conteneur, pas sur son contenu, et `left:0` mettait
       donc le panneau 20 px plus large que le champ de chaque côté. */
    '.sr-out{position:absolute;left:20px;right:20px;top:100%;z-index:8;',
      /* `overscroll-behavior:contain` coupe le report du défilement : arrivé au
         bout de la liste, la molette continuait dans la page derrière, et on
         perdait le panneau qu'on était en train de lire. */
      'max-width:640px;margin:6px auto 0;max-height:min(56vh,460px);overflow:auto;',
      'overscroll-behavior:contain;',
      'background:#14141f;border:1px solid rgba(255,253,247,.16);border-radius:11px;',
      'box-shadow:0 18px 44px rgba(0,0,0,.55)}',
    /* Un attribut `hidden` ne suffit jamais ici : il faut la règle en face. */
    '.sr-out[hidden]{display:none}',
    '.sr-u{display:flex;align-items:center;gap:7px;padding:9px 14px 5px;',
      'font-weight:700;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase}',
    '.sr-u i{width:8px;height:8px;border-radius:2px;flex:0 0 auto}',
    '.sr-r{display:flex;align-items:baseline;gap:10px;padding:8px 14px;',
      'text-decoration:none;color:var(--paper);border-left:3px solid transparent}',
    '.sr-r:hover,.sr-r:focus{outline:0;background:rgba(255,253,247,.07)}',
    '.sr-r .t{flex:1 1 auto;min-width:0;font-size:14.5px}',
    '.sr-r .p{opacity:.55;font-weight:400;font-size:12.5px}',
    '.sr-r .d{flex:0 0 auto;font-size:12px;opacity:.5}',
    '.sr-n{padding:14px;font-size:14px;opacity:.6;text-align:center}',
    '.sr-f{padding:8px 14px 11px;font-size:11.5px;opacity:.45;text-align:center}',
    '@media(max-width:560px){',
      '.sr{padding-top:20px}',
      '.sr-q{font-size:15px;padding:11px 0}',
      '.sr-r{flex-wrap:wrap;gap:2px 10px}.sr-r .d{flex:1 1 100%}',
    '}'
  ].join('');

  /* Sans accent ni casse : « epee » doit trouver « L'Épée ». */
  function norm(s){
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function compact(s){ return norm(s).replace(/[^a-z0-9]/g, ''); }

  var index = null, chargement = null;

  function charge(){
    if (chargement) return chargement;
    chargement = fetch(FR ? '/search-fr.json' : '/search-en.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.e || !d.e.length) return null;
        /* Les deux formes sont calculées une fois pour toutes : les refaire à
           chaque frappe, c'est 1 463 `normalize()` par lettre tapée. */
        for (var i = 0; i < d.e.length; i++) {
          d.e[i][5] = norm(d.e[i][1]);
          d.e[i][6] = compact(d.e[i][1]);
        }
        index = d;
        return d;
      })
      .catch(function(){ return null; });
    return chargement;
  }

  /* Le classement, du plus sûr au plus large : le titre commence par la
     requête, un de ses mots commence par elle, elle est quelque part dedans,
     et enfin la forme sans ponctuation. « Andor » passe ainsi devant « Rogue
     One : Cassian Andor » sans qu'on mesure quoi que ce soit.

     **À score égal, l'ordre de l'index, qui est celui de la timeline.** Un
     tri par longueur de titre avait l'air plus fin et rendait les huit jeux
     Arkham dans le désordre — VR, City, Shadow, Asylum — là où l'ordre de
     lecture est précisément ce que le site a à dire. */
  function score(e, q, qc){
    var i = e[5].indexOf(q);
    if (i === 0) return 0;
    if (i > 0) return /[a-z0-9]/.test(e[5].charAt(i - 1)) ? 2 : 1;
    if (qc.length > 2 && e[6].indexOf(qc) >= 0) return 3;
    return -1;
  }

  function cherche(texte){
    var q = norm(texte), qc = compact(texte);
    if (!index || q.length < 2) return null;
    var hits = [];
    for (var i = 0; i < index.e.length; i++) {
      var s = score(index.e[i], q, qc);
      if (s >= 0) hits.push([s, i]);
    }
    hits.sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
    return { total: hits.length, tete: hits.slice(0, MAX) };
  }

  function rend(out, res){
    out.textContent = '';
    if (!res.total) {
      var v = document.createElement('p');
      v.className = 'sr-n';
      v.textContent = T.rien;
      out.appendChild(v);
      return;
    }
    /* Groupé par univers, dans l'ordre où chacun paraît : c'est le meilleur
       résultat qui décide de la place de son univers, pas une table. */
    var vus = {}, ordre = [];
    for (var i = 0; i < res.tete.length; i++) {
      var e = index.e[res.tete[i][1]];
      if (!vus[e[0]]) { vus[e[0]] = []; ordre.push(e[0]); }
      vus[e[0]].push(e);
    }
    for (var j = 0; j < ordre.length; j++) {
      var uni = index.u[ordre[j]];
      var tete = document.createElement('div');
      tete.className = 'sr-u';
      tete.style.color = uni.c;
      var pastille = document.createElement('i');
      pastille.style.background = uni.c;
      tete.appendChild(pastille);
      tete.appendChild(document.createTextNode(uni.n));
      out.appendChild(tete);

      var liste = vus[ordre[j]];
      for (var k = 0; k < liste.length; k++) {
        var it = liste[k];
        var a = document.createElement('a');
        a.className = 'sr-r';
        a.href = uni.h + '#' + it[2];
        a.style.borderLeftColor = uni.c;
        a.setAttribute('role', 'option');
        var t = document.createElement('span');
        t.className = 't';
        /* `textContent` : les titres portent des apostrophes typographiques et
           des esperluettes qu'on n'a pas écrites. */
        t.textContent = it[1];
        if (it[4]) {
          var p = document.createElement('span');
          p.className = 'p';
          p.textContent = '  ' + it[4];
          t.appendChild(p);
        }
        a.appendChild(t);
        if (it[3]) {
          var d = document.createElement('span');
          d.className = 'd';
          d.textContent = it[3];
          a.appendChild(d);
        }
        out.appendChild(a);
      }
    }
    if (res.total > res.tete.length) {
      var f = document.createElement('p');
      f.className = 'sr-f';
      f.textContent = T.plus(res.tete.length, res.total);
      out.appendChild(f);
    }
  }

  function pose(){
    if (document.querySelector('.sr')) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bloc = document.createElement('div');
    bloc.className = 'sr wrap';
    bloc.innerHTML =
      '<div class="sr-box">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" ' +
          'stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
          '<circle cx="10.5" cy="10.5" r="7"/><path d="M15.8 15.8 21 21"/></svg>' +
        '<input class="sr-q" type="search" autocomplete="off" spellcheck="false" ' +
          'role="combobox" aria-expanded="false" aria-controls="sr-out">' +
      '</div>' +
      '<div class="sr-out" id="sr-out" role="listbox" hidden></div>';

    var champ = bloc.querySelector('.sr-q');
    var out   = bloc.querySelector('.sr-out');
    champ.placeholder = T.ph;
    champ.setAttribute('aria-label', T.lab);
    out.setAttribute('aria-label', T.lab);

    function ferme(){
      out.hidden = true;
      champ.setAttribute('aria-expanded', 'false');
    }
    function montre(){
      var res = cherche(champ.value);
      if (!res) { ferme(); return; }
      rend(out, res);
      out.hidden = false;
      out.scrollTop = 0;
      champ.setAttribute('aria-expanded', 'true');
    }

    champ.addEventListener('focus', function(){ charge().then(montre); });
    champ.addEventListener('input', function(){
      if (index) montre(); else charge().then(montre);
    });

    /* Les flèches parcourent les résultats, Échap referme et rend la main au
       champ. Entrée n'a rien à faire ici : le focus est sur un lien, le
       navigateur le suit — et il sait aussi l'ouvrir dans un onglet. */
    bloc.addEventListener('keydown', function(ev){
      if (ev.key === 'Escape') { ferme(); champ.focus(); return; }
      if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
      if (out.hidden) return;
      var liens = [].slice.call(out.querySelectorAll('.sr-r'));
      if (!liens.length) return;
      ev.preventDefault();
      var i = liens.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') i = i < 0 ? 0 : Math.min(i + 1, liens.length - 1);
      else if (i <= 0) { champ.focus(); return; }
      else i--;
      liens[i].focus();
    });

    /* Un clic ailleurs referme, comme les deux menus. Le `focusout` seul n'y
       suffit pas : le focus part aussi vers les liens du panneau. */
    document.addEventListener('click', function(ev){
      if (!bloc.contains(ev.target)) ferme();
    });

    ancre.parentNode.insertBefore(bloc, ancre);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ SOUTENIR LE SITE ════════════════════════════════════════════════
   Un Ko-fi existe depuis le 6 septembre 2026 (`ko-fi.com/chronologeek`),
   et « Ce qui reste à faire » posait la condition depuis le 14 août : le
   lien revient le jour où il y a une page derrière. C'est ce jour-là.

   **C'est le bouton officiel de Ko-fi**, celui que leur aide donne à
   copier — mais **servi depuis `images/`**, pas depuis leurs serveurs. Le
   fichier est le leur, à l'octet près ; ce qui change est qu'il ne coûte
   pas une requête vers un tiers sur chacune des vingt-huit pages, et que
   l'adresse IP du visiteur ne part nulle part. C'est déjà pourquoi les
   deux polices du site sont auto-hébergées.

   **Un seul endroit : le pied de page**, sous l'accroche. Le panneau de
   la barre du bas l'a porté une heure et n'était pas la bonne place — on
   y va pour sa progression, ses badges et son export, pas pour payer. Un
   bouton flottant a été essayé le même jour, puis retiré : Niko n'en veut
   pas, et le coin bas de l'écran est déjà pris par quatre choses.

   Le libellé du bouton est en anglais dans les deux langues : Ko-fi n'en
   fournit pas d'autre, et c'est le prix du visuel officiel. Le texte de
   remplacement, lui, suit la page.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var FR = document.documentElement.lang !== 'en';
  var URL = 'https://ko-fi.com/chronologeek';
  var ALT = FR ? 'Soutenez-moi sur Ko-fi' : 'Support me on Ko-fi';

  var CSS = [
    /* `.foot a.kofi` et non `.kofi` : le pied pose sa propre taille et sa
       propre encre sur ses liens, et une seule classe perd contre lui. */
    '.foot a.kofi{display:inline-block;margin-top:16px;line-height:0;',
    '  text-decoration:none;transition:transform .15s ease,filter .15s ease}',
    '.foot a.kofi:hover{transform:translateY(-2px);filter:brightness(1.08)}',
    /* La taille est donnée ici et l'image porte les siennes en attributs :
       la place est réservée avant le chargement, donc rien ne se décale. */
    '.foot a.kofi img{display:block;width:auto;height:38px}',
    '@media(prefers-reduced-motion:reduce){.foot a.kofi{transition:none}',
    '  .foot a.kofi:hover{transform:none}}'
  ].join('');

  function pose(){
    var pied = document.querySelector('.foot');
    if (!pied || document.querySelector('.kofi')) return;
    var hote = pied.firstElementChild;
    if (!hote) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var a = document.createElement('a');
    a.href = URL;
    a.target = '_blank';
    /* `noopener` par principe, `noreferrer` non : Ko-fi n'a rien à savoir
       de plus, mais le référent lui dit d'où viennent ses visiteurs, et
       c'est une information que Niko a intérêt à lui laisser. */
    a.rel = 'noopener';
    a.className = 'kofi';

    var img = document.createElement('img');
    img.src = '/images/kofi-button.svg';
    /* Les proportions d'origine, 223 × 30 : posées en attributs, elles
       réservent la place avant le chargement. C'est la seule image du
       site qui les porte — les vignettes ont leur taille en CSS. */
    img.width = 223; img.height = 30;
    img.alt = ALT;
    /* Pas de `loading="lazy"` : 16 Ko, et il est en bas de page, donc
       exactement là où le report se voit — l'image arrivait après le
       défilement, et le pied montrait un trou à sa place. */
    a.appendChild(img);
    hote.appendChild(a);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ══════════════════════════════════════════════════════════════════
   LES TROIS COMPTES, DANS LE PIED DE PAGE
   ──────────────────────────────────────────────────────────────────
   YouTube, Instagram et TikTok, ouverts le 6 septembre 2026. Ils vivent
   ici et non dans les protos pour la raison qui vaut déjà au Ko-fi, au
   formulaire de contact et aux deux « Suggérer » : écrits dans le HTML,
   il y en aurait vingt-huit copies à tenir, et leur intitulé passerait
   par `traduire-pages.mjs` alors qu'un nom de plateforme ne se traduit
   pas.

   **Une seule ligne, trois icônes, dans la liste qui porte Contact.**
   C'est là que Niko les a demandés, et c'est la forme qui ne rallonge
   pas le pied : trois `<li>` de texte auraient rendu les soixante-dix
   pixels que la refonte du 6 septembre venait de lui retirer sur
   téléphone.

   Trois choses à savoir :

   - **`.foot li.soc a`, jamais `.soc a`.** Le pied pose sa propre taille
     et sa propre encre sur `.foot a`, et son `.foot li a{padding:4px 0}`
     sur les listes : une seule classe perd contre eux, et les icônes
     sortaient décalées vers le bas. Même famille de piège que
     `.foot a.kofi`.
   - **La cible fait 34 px, l'icône 19.** La règle des 24 px du pied de
     page vaut ici aussi, et un carré de 19 px ne se vise pas au doigt.
     Le rembourrage est dans le lien, pas autour de la rangée.
   - **`aria-label`, pas de texte visible.** Un logo seul n'annonce rien
     à un lecteur d'écran, et « YouTube » écrit à côté rendrait la ligne
     trois fois plus longue pour ne rien apprendre à qui voit l'icône.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* Le compte YouTube est celui de Niko, pas un compte au nom du site :
     l'adresse est donc @arcanerval et il ne faut pas la « corriger ». */
  var COMPTES = [
    ['YouTube',   'https://www.youtube.com/@arcanerval',
     'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z'],
    ['Instagram', 'https://www.instagram.com/chronologeek.app/',
     'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.26 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.07.36-2.24.41-1.27.06-1.65.07-4.86.07s-3.59-.01-4.86-.07c-1.17-.06-1.82-.26-2.24-.42-.57-.22-.96-.48-1.38-.9-.42-.42-.69-.82-.9-1.38-.16-.42-.36-1.06-.42-2.23-.04-1.26-.06-1.65-.06-4.84s.02-3.59.06-4.86c.06-1.17.26-1.81.42-2.23.21-.57.48-.96.9-1.38.42-.42.81-.69 1.38-.9.42-.17 1.05-.36 2.22-.42 1.27-.05 1.65-.06 4.86-.06zM12 0C8.74 0 8.33.02 7.05.07c-1.28.06-2.15.26-2.91.56-.79.3-1.46.72-2.13 1.38C1.34 2.68.93 3.35.63 4.14c-.3.77-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.02 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.77.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.02 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.77.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.02-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.77-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z'],
    ['TikTok',    'https://www.tiktok.com/@chronologeek',
     'M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'],
  ];

  var CSS = [
    '.foot li.soc{display:flex;gap:4px;margin-top:2px}',
    /* `.foot li.soc a` bat `.foot a` et `.foot li a`, qui posent l'encre,
       le corps et un rembourrage vertical fait pour du texte. */
    '.foot li.soc a{display:inline-flex;align-items:center;justify-content:center;',
    '  width:34px;height:34px;padding:0;color:rgba(255,253,247,.72);',
    '  text-decoration:none;border-radius:4px;transition:color .15s ease,background .15s ease}',
    '.foot li.soc a:hover{color:var(--paper);background:rgba(255,255,255,.08);text-decoration:none}',
    '.foot li.soc a:focus-visible{outline:2px solid var(--hot);outline-offset:2px}',
    '.foot li.soc svg{width:19px;height:19px;display:block;fill:currentColor}',
    '@media(prefers-reduced-motion:reduce){.foot li.soc a{transition:none}}'
  ].join('');

  function pose(){
    var contact = document.querySelector('.foot a[data-contact]');
    if (!contact || document.querySelector('.foot li.soc')) return;
    var li = contact.closest ? contact.closest('li') : null;
    if (!li || !li.parentNode) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var rangee = document.createElement('li');
    rangee.className = 'soc';

    for (var i = 0; i < COMPTES.length; i++) {
      var a = document.createElement('a');
      a.href = COMPTES[i][1];
      a.target = '_blank';
      /* `noopener` seul, comme pour Ko-fi : le référent dit à la
         plateforme d'où viennent ses visiteurs, et c'est utile. */
      a.rel = 'noopener';
      a.setAttribute('aria-label', COMPTES[i][0]);
      a.title = COMPTES[i][0];

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', COMPTES[i][2]);
      svg.appendChild(p);
      a.appendChild(svg);
      rangee.appendChild(a);
    }

    li.parentNode.insertBefore(rangee, li.nextSibling);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();
