/* ═══ LES PLACES RÉSERVÉES ═════════════════════════════════════════════
   Deux blocs arrivent après le premier affichage : l'encart « prochaine
   sortie », qui attend `radar.json`, et le champ de recherche de
   l'accueil. Tout ce qui était dessous descendait d'un coup — 0,02 et 0,08
   de décalage de mise en page. `publier.mjs` pose dans le `<head>` un
   script qui réserve leur hauteur avant le premier rendu : celle mesurée
   ici à la visite précédente, sinon une valeur par défaut calculée à la
   publication. `CG_RES` libère la place au moment même où le bloc s'insère,
   dans la même tâche, donc sans rien faire bouger — et retient la hauteur
   réelle pour la fois suivante. `h` à `null` libère sans rien retenir. */
window.CG_RES = function(cle, h){
  document.documentElement.classList.remove('res-' + cle);
  if (h == null) return;
  try {
    var m = matchMedia('(max-width:560px)').matches ? 'm' : 'd';
    var c = JSON.parse(localStorage.getItem('cg-res') || '{}');
    var p = c[location.pathname] || (c[location.pathname] = {});
    (p[cle] || (p[cle] = {}))[m] = Math.round(h * 100) / 100;
    localStorage.setItem('cg-res', JSON.stringify(c));
  } catch (_) {}
};

/* ═══ LA TAILLE DES CARTES SELON LE NIVEAU ═════════════════════════════
   Posée le 13 novembre 2026, demandée par Niko : la « hiérarchie de la
   liste » de la maquette du 12 novembre. L'essentiel en grande carte, son
   horaire sur une plaque blanche ; l'important un cran plus petit ;
   l'optionnel en ligne serrée, sur un fond effacé, avec sa vignette en petit
   (96 px) — Niko voulait que les optionnels gardent leur image.

   - **Le niveau est déjà dans la carte** : les treize pages posent
     `<span class="lv must|imp">` dans `.bu-tags`, et rien pour l'optionnel.
     Tout se lit donc par `:has()`, sans toucher aux gabarits des pages, et
     une carte redessinée (filtres, parcours) garde sa taille.
   - **Seulement là où il y a des niveaux** : la classe `cg-niv` n'est posée
     que si la timeline porte au moins un `.lv`. Star Trek n'en a aucun, et
     toutes ses cartes seraient passées pour optionnelles. Le Dossier non
     plus, ses lignes n'ont pas de niveau.
   - **Synchrone, en tête de `e-app.js`** : les pages ont déjà écrit leur
     timeline quand ce fichier s'exécute, et le premier rendu n'a pas eu
     lieu. Rien ne saute.
   - **Les cartes compactes des réglages l'emportent** : leurs règles sont
     en `!important`, et une carte sans vignette n'a pas à changer de taille.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  var tl = document.getElementById('timeline');
  if (!tl || !tl.querySelector('.bu-tags .lv')) return;
  document.documentElement.classList.add('cg-niv');
  var M = '.cg-niv .bu:has(.bu-tags .lv.must)', I = '.cg-niv .bu:has(.bu-tags .lv.imp)',
      B = '.cg-niv .bu.rv:not(:has(.bu-tags .lv))';
  var st = document.createElement('style');
  st.textContent = [
    // l'essentiel : grande carte, horaire sur plaque blanche
    M + ' .bu-card>.bu-head{grid-template-columns:236px minmax(0,1fr) 34px}',
    M + ' .bu-fig{width:236px}',
    M + ' .bu-title{font-size:33px}',
    M + ' .bu-card>.bu-sub{padding-left:272px}',
    M + ' .bu-time{background:var(--paper)}',
    M + ' .bu-time .bu-n{color:rgba(19,18,21,.6)}',
    M + ' .bu-time .d{color:var(--ink);font-size:29px}',
    M + '.done .bu-time .d{color:rgba(19,18,21,.5)}',
    M + ' .bu-time .rel{background:none;border-color:var(--ink);color:var(--ink)}',
    // l'important : un cran plus petit
    I + ' .bu-card>.bu-head{grid-template-columns:150px minmax(0,1fr) 34px}',
    I + ' .bu-fig{width:150px;margin:10px 0}',
    I + ' .bu-title{font-size:22px}',
    I + ' .bu-card>.bu-sub{padding-left:186px}',
    I + ' .bu-time .d{font-size:21px}',
    // l'optionnel : une ligne serrée, sa vignette en petit, sur un fond effacé
    B + ' .bu-card{background:none;box-shadow:inset 0 0 0 1px rgba(255,253,247,.16)}',
    B + ' .bu-card:hover{box-shadow:inset 0 0 0 1px rgba(255,253,247,.16),3px 3px 0 var(--uni)}',
    B + ' .bu-time{background:none;gap:3px;padding:6px 8px}',
    B + ' .bu-time .bu-n{font-size:10.5px}',
    B + ' .bu-time .d{font-size:17px;color:rgba(240,201,124,.85)}',
    B + ' .bu-card>.bu-head{grid-template-columns:96px minmax(0,1fr) 34px}',
    B + ' .bu-fig{width:96px;margin:7px 0}',
    B + ' .bu-done span{font-size:10px;padding:1px 5px}',
    B + ' .bu-txt{padding:8px 0 7px}',
    B + ' .bu-tags{margin-bottom:3px}',
    B + ' .bu-title{font-size:17px;color:rgba(255,253,247,.86)}',
    B + ' .bu-meta{margin-top:3px}',
    B + ' .bu-card>.bu-sub{padding-left:132px}',
    '@media(max-width:720px){',
    M + ' .bu-card>.bu-head{grid-template-columns:118px minmax(0,1fr) 22px}',
    M + ' .bu-fig{width:118px}',
    M + ' .bu-title{font-size:21px}',
    M + ' .bu-time .d{font-size:21px}',
    I + ' .bu-card>.bu-head{grid-template-columns:88px minmax(0,1fr) 22px}',
    I + ' .bu-fig{width:88px}',
    I + ' .bu-title{font-size:18px}',
    B + ' .bu-card>.bu-head{grid-template-columns:64px minmax(0,1fr) 22px}',
    B + ' .bu-fig{width:64px}',
    B + ' .bu-title{font-size:15.5px}',
    B + ' .bu-time{flex-direction:row}',
    M + ' .bu-card>.bu-sub,' + I + ' .bu-card>.bu-sub,' + B + ' .bu-card>.bu-sub{padding-left:12px}',
    '}'
  ].join('');
  document.head.appendChild(st);
})();

/* ═══ UN VÉHICULE PAR UNIVERS ══════════════════════════════════════════
   Proto du 13 novembre 2026 (n° 6 de la liste du 5 novembre) : le train doré
   devient le véhicule de l'univers, aux trois endroits où il roule — le plan
   du haut (`.lm-train`), la barre du bas (`.hud-train`) et « Vous en êtes
   là » sur la ligne (`.rows>.ici::before`).

   Le véhicule est une **image déjà colorée** (`images/vehicules/*.webp`) :
   la silhouette que Niko fournit, tournée nez vers la droite (le sens de la
   marche — la ligne verticale la tourne déjà de 90°), la coque à l'or du site
   (#f0c97c) et ses détails comblés à l'encre (#131215) : Niko ne veut pas
   voir à travers. Un dessin de mémoire ne ressemblait pas.
   `r` est le rapport largeur / hauteur du fichier. Une page sans véhicule
   dans `VEHICULES` garde son train. */
(function(){
  // `dy` : la part de la hauteur dont on remonte l'image pour que le gros du véhicule soit sur la ligne
  function v(nom, w, h, dy){ return { img: '/images/vehicules/' + nom + '.webp', r: w / h, dy: dy || 0 }; }
  var VEHICULES = {
    starwars: v('faucon', 195, 146), dc: v('batmobile', 250, 93), avatar: v('appa', 250, 143),
    startrek: v('enterprise', 202, 100), walkingdead: v('campingcar', 250, 119), dragonage: v('griffon', 212, 146),
    jurassicworld: v('jeep', 250, 146), witcher: v('ablette', 174, 146), residentevil: v('helicoptere', 250, 107),
    bladerunner: v('spinner', 204, 74), monsterverse: v('porteavions', 250, 138, .25),
    marvel: v('helicarrier', 250, 128), assassinscreed: v('aigle', 123, 146), dcanimation: v('batmobile', 250, 93)
  };
  // les noms des protos et du Dossier
  VEHICULES['star-wars'] = VEHICULES['dossier-star-wars'] = VEHICULES.starwars;
  VEHICULES.twd = VEHICULES.walkingdead; VEHICULES.jurassic = VEHICULES.jurassicworld;
  var route = (location.pathname.split('/').filter(Boolean).pop() || '')
    .replace(/\.html$/, '').replace(/^en?-/, '');
  var V = VEHICULES[route];
  if (!V) return;
  /* Tous à la même surface plutôt que dans la même boîte : dans une boîte, un
     porte-avions tombait à 15 px de haut et l'aigle à 28 de large. Plafonds
     en largeur et en hauteur pour les formes extrêmes. */
  function taille(aire, lmax, hmax){
    var h = Math.sqrt(aire / V.r), w = h * V.r;
    if (w > lmax) { w = lmax; h = w / V.r; }
    // une aile volante vue de dessus est haute et étroite : elle a droit à plus de hauteur
    if (V.r < .6) hmax = Math.round(hmax * 1.4);
    if (h > hmax) { h = hmax; w = h * V.r; }
    return 'width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px';
  }
  var image = 'url("' + V.img + '") center/contain no-repeat';
  var st = document.createElement('style');
  st.textContent =
    '.lm-train{' + taille(1900, 86, 44) + '}.hud-train{' + taille(1000, 64, 30) + '}' +
    '.veh{display:block;width:100%;height:100%;background:' + image +
    (V.dy ? ';transform:translateY(' + (-V.dy * 100) + '%)' : '') + '}' +
    '.rows>.ici::before{' + taille(1700, 80, 42) + ';border:0;border-radius:0;background:' + image +
    // la ligne verticale tourne l'image de 90° : le décalage se fait dans son repère à elle
    (V.dy ? ';transform:rotate(90deg) translateY(' + (-V.dy * 100) + '%)' : '') + '}';
  document.head.appendChild(st);
  function remplace(){
    [].forEach.call(document.querySelectorAll('.lm-train,.hud-train'), function(t){
      if (!t.querySelector('.veh')) t.innerHTML = '<span class="veh" aria-hidden="true"></span>';
    });
  }
  remplace();
  new MutationObserver(remplace).observe(document.body, { childList: true, subtree: true });
})();

/* ═══ LA DATE DE CHAQUE COCHE ═══════════════════════════════════════════
   Posée le 5 novembre 2026. `prog[id]` ne dit que 1 ou rien : sans date, ni
   bilan de l'année, ni « cette semaine », et un historique qui ne se
   rattrape pas — chaque mois sans date est perdu pour de bon.

   **Une clé à part, `cg-dates`, `{id:"AAAA-MM-JJ"}`, le jour et pas l'heure**
   : l'heure n'apprendrait rien et dirait quand le visiteur regarde. Rien dans
   les pages : ce bloc écoute après elles, comme le Maj + clic, et lit l'état
   neuf dans `aria-checked` — les clics rejoués d'une plage passent donc ici.

   **Seule la case cliquée est datée.** Ce que `bridge()` coche par ricochet
   est la même œuvre, vue une seule fois : la dater ferait compter deux fois.
   Une coche d'avant ce bloc n'a pas de date, et n'en recevra pas. Et une date
   ne vaut que si la coche existe encore : « Réinitialiser » vide la progression
   sans passer par ici, donc qui lit cette clé la croise avec la progression.

   L'export des pages et celui de l'accueil la portent (`dates`), l'import
   fusionne, le plus récent gagnant. Le lien de transfert ne la porte pas : il
   doit tenir dans un QR code, et rien n'y est perdu — comme les images des
   ajouts, elle reste sur l'appareil qui l'a. */
window.CG_DATES = function(entrants){
  var k = 'cg-dates', d = {};
  try { d = JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (_) {}
  if (entrants && typeof entrants === 'object') {
    Object.keys(entrants).forEach(function(i){
      if (/^\d{4}-\d{2}-\d{2}$/.test(entrants[i]) && !(d[i] >= entrants[i])) d[i] = entrants[i];
    });
    try { localStorage.setItem(k, JSON.stringify(d)); } catch (_) {}
  }
  return d;
};
(function(){
  'use strict';
  document.addEventListener('click', function(ev){
    var c = ev.target.closest && ev.target.closest('[data-check]');
    var l = c && c.closest('[data-id]');
    if (!l) return;
    var d = window.CG_DATES(), id = l.getAttribute('data-id');
    if (c.getAttribute('aria-checked') === 'true') {
      var n = new Date();
      d[id] = n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2);
    } else delete d[id];
    try { localStorage.setItem('cg-dates', JSON.stringify(d)); } catch (_) {}
  });
  /* L'import d'une page est à elle : on relit le même fichier à côté, en
     capture, avant que la page ne vide le champ. */
  document.addEventListener('change', function(ev){
    var f = ev.target && ev.target.id === 'import-file' && ev.target.files && ev.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function(){
      try {
        var j = JSON.parse(r.result);
        window.CG_DATES(j.dates);
        if (j.options && window.CG_OPT && CG_OPT.ecrire) CG_OPT.ecrire(j.options);
      } catch (_) {}
    };
    r.readAsText(f);
  }, true);
})();

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

/* ═══ LE BILLET DU BAS — la forme des deux barres ═════════════════════
   La barre d'installation et le rappel de sauvegarde prennent la même
   place et ne paraissent jamais ensemble : elles ont donc une seule
   forme, posée une fois par celle qui arrive. Refaite le 28 septembre
   2026 au dessin du plan de métro : un filet aux douze encres en tête,
   comme le pied de page, et le message sur un billet papier à souche
   dorée, comme le « prochain départ » de l'accueil.

   Le billet est découpé par un `mask` (les deux encoches de la souche) :
   une ombre posée sur lui serait découpée avec, d'où l'absence d'ombre —
   c'est la barre d'encre autour qui le détache. */
function cgBillet(){
  if (document.getElementById('cg-billet')) return;
  var st = document.createElement('style');
  st.id = 'cg-billet';
  st.textContent = [
    '.cgbar{position:fixed;left:0;right:0;bottom:var(--hud-h,0px);z-index:76;',
    '  background:var(--ink);animation:cgbUp .35s cubic-bezier(.2,.9,.3,1)}',
    '@keyframes cgbUp{from{transform:translateY(100%)}to{transform:none}}',
    /* le bouton « remonter en haut » se cale au-dessus tant qu'elle est là */
    'html.cg-bar #totop{bottom:calc(var(--hud-h,0px) + var(--cg-bar-h,64px) + 20px)}',
    '.cgb-rail{display:block;height:8px;border-top:2px solid var(--paper);',
    '  background:linear-gradient(90deg,#4d9fff 0 7.14%,#e23636 0 14.29%,#f5c842 0 21.43%,',
    '  #7dd3fc 0 28.57%,#b48cf2 0 35.71%,#a8bf4f 0 42.86%,#e07b39 0 50.00%,#d4a02c 0 57.14%,',
    '  #2dd4bf 0 64.29%,#45c46b 0 71.43%,#b0bec5 0 78.57%,#dc0000 0 85.71%,#ff5f1f 0 92.86%,#d946ef 0)}',
    '.cgbar .wrap{display:flex;align-items:center;gap:16px;padding-top:12px;padding-bottom:12px}',
    /* `--st` est la largeur de la souche : les deux encoches se calent dessus */
    '.cgb-tk{--st:54px;flex:1;min-width:0;display:flex;align-items:stretch;background:var(--paper);color:var(--ink);',
    '  -webkit-mask:radial-gradient(circle 7px at var(--st) 0,#0000 98%,#000) top/100% 51% no-repeat,',
    '    radial-gradient(circle 7px at var(--st) 100%,#0000 98%,#000) bottom/100% 51% no-repeat;',
    '  mask:radial-gradient(circle 7px at var(--st) 0,#0000 98%,#000) top/100% 51% no-repeat,',
    '    radial-gradient(circle 7px at var(--st) 100%,#0000 98%,#000) bottom/100% 51% no-repeat}',
    '.cgb-stub{flex:0 0 var(--st);display:grid;place-items:center;background:var(--hot);',
    '  border-right:2px dashed var(--ink)}',
    '.cgb-stub svg{width:22px;height:22px;fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:square}',
    '.cgb-txt{flex:1;min-width:0;padding:10px 18px 11px 16px;font-size:13.5px;line-height:1.38;color:#3a3548}',
    '.cgb-txt em{display:block;font-style:normal;font-family:\'Big Shoulders Display\',sans-serif;',
    '  font-weight:800;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#6b6480}',
    '.cgb-txt b{display:block;font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;',
    '  font-size:20px;letter-spacing:.03em;text-transform:uppercase;color:var(--ink);line-height:1;margin:2px 0 4px}',
    '.cgb-txt i{font-style:normal;font-weight:700;color:var(--ink)}',
    '.cgb-act{flex:0 0 auto;display:flex;align-items:center;gap:10px}',
    '.cgbar button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:transform .1s,box-shadow .1s}',
    '.cgb-go{background:var(--hot);border:2px solid var(--hot);color:var(--ink);',
    '  font-size:16px;padding:9px 18px}',
    '.cgb-go em{font-style:normal}',
    '.cgb-go:hover{transform:translate(-2px,-2px);box-shadow:3px 3px 0 var(--paper)}',
    '.cgb-x{width:40px;height:40px;background:none;border:2px solid var(--line);',
    '  color:rgba(255,253,247,.65);font-size:14px;line-height:1;padding:0}',
    '.cgb-x:hover{border-color:var(--paper);color:var(--paper)}',
    /* en étroit, le billet prend la ligne et les boutons passent dessous :
       comprimé sur une seule ligne, le texte tombait à deux mots par ligne */
    '@media(max-width:640px){',
    '  .cgbar .wrap{flex-wrap:wrap;gap:10px}',
    '  .cgb-tk{--st:40px;flex:1 0 100%}',
    '  .cgb-stub svg{width:19px;height:19px}',
    '  .cgb-txt{padding:9px 12px 10px 13px;font-size:13px}',
    '  .cgb-txt b{font-size:18px}',
    '  .cgb-act{flex:1 0 100%}',
    '  .cgb-go{flex:1}',
    /* la barre Apple n'a pas de bouton : la croix reste à côté du billet
       plutôt que de prendre une ligne à elle seule */
    '  .cgbar .wrap:not(:has(.cgb-go)){flex-wrap:nowrap;align-items:flex-start}',
    '  .cgbar .wrap:not(:has(.cgb-go)) .cgb-tk{flex:1 1 auto}',
    '  .cgbar .wrap:not(:has(.cgb-go)) .cgb-act{flex:0 0 auto}',
    '}',
    '@media(prefers-reduced-motion:reduce){.cgbar{animation:none}.cgbar button{transition:none}}'
  ].join('');
  document.head.appendChild(st);
}

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
  /* la ligne de service du billet, au-dessus du titre */
  var KICKER = FR ? 'Voyager hors ligne' : 'Travel offline';

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
  /* La forme vit dans `cgBillet()`, commune au rappel de sauvegarde. */

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

    cgBillet();

    var bar = document.createElement('aside');
    bar.className = 'cgbar';
    bar.id = 'appbar';
    bar.innerHTML =
      '<i class="cgb-rail" aria-hidden="true"></i>' +
      '<div class="wrap">' +
        '<div class="cgb-tk">' +
          '<span class="cgb-stub" aria-hidden="true"><svg viewBox="0 0 24 24">' + v.ico + '</svg></span>' +
          '<p class="cgb-txt"><em>' + KICKER + '</em><b>' + TITRE + '</b>' +
            v.txt.replace(/<b>/g,'<i>').replace(/<\/b>/g,'</i>') + '</p>' +
        '</div>' +
        '<div class="cgb-act">' +
          (v.btn ? '<button type="button" class="cgb-go">' + v.btn + ' <em>▸</em></button>' : '') +
          '<button type="button" class="cgb-x" aria-label="' + FERMER + '">✕</button>' +
        '</div>' +
      '</div>';

    /* en fin de corps et en fixe : posée n'importe où ailleurs, elle
       déplacerait ce qui la suit. Sa hauteur est mesurée une fois posée,
       et c'est elle qui remonte le bouton « en haut ». */
    document.body.appendChild(bar);
    pose(bar);

    bar.querySelector('.cgb-x').addEventListener('click', function(){
      try { localStorage.setItem(KEY, String(Date.now())); } catch(e){}
      retire(bar);
    });
    var go = bar.querySelector('.cgb-go');
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
    deux:   function(c, a){ return 'Vous avez complété ' + c + ' œuvres, et vous en avez ajouté ' + a +
              '. Tout cela ne vit que dans ce navigateur, qui peut l’effacer tout seul — Safari le ' +
              'fait après sept jours sans visite. Le fichier d’export le garde, et le rapporte sur ' +
              'un autre appareil.'; },
    coches: function(c){ return 'Vous avez complété ' + c + ' œuvres. Votre progression ne vit que dans ' +
              'ce navigateur, qui peut l’effacer tout seul — Safari le fait après sept jours sans ' +
              'visite. Le fichier d’export la garde, et la rapporte sur un autre appareil.'; },
    ajouts: function(a){ return 'Vous avez ajouté ' + a + ' œuvres. Elles ne vivent que dans ce ' +
              'navigateur, qui peut les effacer tout seul — Safari le fait après sept jours sans ' +
              'visite. Le fichier d’export les garde, et les rapporte sur un autre appareil.'; },
    go:     'Exporter',
    /* la consigne des gares : on y laisse ses bagages à l'abri */
    kicker: 'Consigne',
    fermer: 'Fermer'
  } : {
    titreP: 'Keep your progress safe',
    titreA: 'Keep your additions safe',
    deux:   function(c, a){ return 'You have completed ' + c + ' works, and added ' + a +
              ' of your own. None of it lives anywhere but this browser, which can wipe it on its ' +
              'own — Safari does after seven days without a visit. The export file keeps it, and ' +
              'carries it to another device.'; },
    coches: function(c){ return 'You have completed ' + c + ' works. Your progress lives in this ' +
              'browser only, and it can be wiped without warning — Safari does it after seven days ' +
              'without a visit. The export file keeps it, and carries it to another device.'; },
    ajouts: function(a){ return 'You have added ' + a + ' works. They live in this browser only, ' +
              'and it can wipe them on its own — Safari does after seven days without a visit. ' +
              'The export file keeps them, and carries them to another device.'; },
    go:     'Export',
    kicker: 'Left luggage',
    fermer: 'Close'
  };

  /* La barre est celle de l'installation — même place, même billet,
     même geste pour la fermer : sa forme vit dans `cgBillet()`. */

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

    cgBillet();

    var bar = document.createElement('aside');
    bar.className = 'cgbar';
    bar.id = 'svbar';
    bar.innerHTML =
      '<i class="cgb-rail" aria-hidden="true"></i>' +
      '<div class="wrap">' +
        '<div class="cgb-tk">' +
          '<span class="cgb-stub" aria-hidden="true"><svg viewBox="0 0 24 24">' +
            '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>' +
          '</svg></span>' +
          '<p class="cgb-txt"><em></em><b></b><span></span></p>' +
        '</div>' +
        '<div class="cgb-act">' +
          '<button type="button" class="cgb-go"></button>' +
          '<button type="button" class="cgb-x"></button>' +
        '</div>' +
      '</div>';

    /* Le titre suit ce qui a déclenché : qui n'a rien coché mais a écrit
       cinq œuvres n'a pas de « progression » à mettre à l'abri. */
    var assez = c >= COCHES;
    /* en texte, pas en HTML : les nombres viennent d'une donnée du visiteur */
    bar.querySelector('.cgb-txt em').textContent = T.kicker;
    bar.querySelector('.cgb-txt b').textContent = assez ? T.titreP : T.titreA;
    bar.querySelector('.cgb-txt span').textContent =
      assez && a >= AJOUTS ? T.deux(c, a) : assez ? T.coches(c) : T.ajouts(a);
    var go = bar.querySelector('.cgb-go');
    go.textContent = T.go + ' ';
    go.appendChild(document.createElement('em')).textContent = '▸';

    var x = bar.querySelector('.cgb-x');
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
    go.addEventListener('click', function(){
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
  /* `alt` n'est là que pour les univers qui servent plus d'un parcours :
     leurs entrées recoupées vivent dans une clé à part, et elles doivent
     voyager avec le reste, sinon un export-import fait perdre le détail
     d'une série suivie saison par saison. Depuis l'ordre de sortie du
     21 octobre 2026, seuls DC, DC Animation, Resident Evil et le Dossier
     n'en ont pas : leurs parcours ne recollent ni ne coupent rien. */
  var UNIVERS = [
    { u:'sw',             prog:'cg-proto-sw',             perso:'cg-perso-sw',             alt:'cg-proto-sw-alt' },
    { u:'mcu',            prog:'cg-proto-mcu',            perso:'cg-perso-mcu',            alt:'cg-proto-mcu-alt' },
    { u:'dc',             prog:'cg-proto-dc',             perso:'cg-perso-dc' },
    { u:'avatar',         prog:'cg-proto-avatar',         perso:'cg-perso-avatar',         alt:'cg-proto-avatar-alt' },
    { u:'startrek',       prog:'cg-proto-st',             perso:'cg-perso-st',             alt:'cg-proto-st-alt' },
    { u:'twd',            prog:'cg-proto-twd',            perso:'cg-perso-twd',            alt:'cg-proto-twd-alt' },
    { u:'dragonage',      prog:'cg-proto-dragonage',      perso:'cg-perso-data_da',        alt:'cg-proto-dragonage-alt' },
    { u:'assassinscreed', prog:'cg-proto-assassinscreed', perso:'cg-perso-assassinscreed', alt:'cg-proto-assassinscreed-alt' },
    { u:'dcanimation',    prog:'cg-proto-dcanim',         perso:'cg-perso-dcanim' },
    { u:'jurassic',       prog:'cg-proto-jurassic',       perso:'cg-perso-jurassic',       alt:'cg-proto-jurassic-alt' },
    { u:'witcher',        prog:'cg-proto-witcher',        perso:'cg-perso-witcher',        alt:'cg-proto-witcher-alt' },
    { u:'residentevil',   prog:'cg-proto-re',             perso:'cg-perso-re' },
    { u:'bladerunner',    prog:'cg-proto-bladerunner',    perso:'cg-perso-bladerunner',    alt:'cg-proto-bladerunner-alt' },
    { u:'monsterverse',   prog:'cg-proto-monsterverse',   perso:'cg-perso-monsterverse',   alt:'cg-proto-monsterverse-alt' },
    { u:'dossier-sw',     prog:'cg-proto-dossier-sw',     perso:null }
  ];

  /* Les entrées de second parcours ne sont plus dans cette clé — elles
     vivent sous `alt` —, donc il ne reste à écarter que les ajouts du
     visiteur : ils sont bien des œuvres, mais les totaux de l'accueil
     sont éditoriaux. Ils partent dans le fichier, c'est le compte affiché
     qui les laisse de côté, pour dire le même nombre que la barre du bas.
     Le pourquoi est en entier dans `e-accueil.html`. */
  var PARCOURS = /^p-/;

  var T = FR ? {
    titre: 'Toutes vos timelines, en un fichier',
    dek:   'Ce que vous avez complété sur les douze timelines et le Dossier, et les œuvres que vous avez ajoutées vous-même. Un seul fichier à emporter sur un autre appareil ou un autre navigateur, au lieu d’exporter page par page.',
    exp:   'Tout exporter',
    imp:   'Importer',
    nom:   'chronologeek-tout.json',
    rien:  'Rien de terminé pour l’instant — ouvrez une timeline, le fichier suivra.',
    mauvais: 'Ce fichier n’est pas un export Chronologeek.',
    vide:  'Ce fichier ne porte aucune progression.',
    plein: 'Le navigateur a refusé d’enregistrer : mémoire pleine, ou navigation privée.',
    etat:  function(n, c, a){
      return n + ' univers · ' +
             c + (c > 1 ? ' entrées terminées' : ' entrée terminée') +
             (a ? ' · ' + a + (a > 1 ? ' ajouts à vous' : ' ajout à vous') : '');
    },
    lien:   'Lien de transfert',
    envoi:  'Ouvrez ce lien sur l’autre appareil, ou scannez le code avec son appareil photo. Votre progression voyage dans le lien lui-même : rien ne passe par un serveur.',
    envoiSansQr: 'Ouvrez ce lien sur l’autre appareil : envoyez-le-vous par message ou par courriel. Votre progression voyage dans le lien lui-même : rien ne passe par un serveur.',
    dense:  'Trop de progression pour un code lisible à l’écran : passez par le lien.',
    images: 'Les images de vos ajouts ne voyagent pas par lien — le fichier, lui, les emporte.',
    copier: 'Copier',
    copie:  'Copié',
    partager: 'Partager',
    recoit: 'Sur l’application installée, ou si le lien s’est ouvert ailleurs : collez-le ici.',
    colle:  'Collez un lien de transfert',
    lire:   'Lire',
    lienKo: 'Ce lien de transfert est incomplet ou abîmé.',
    lienVieux: 'Ce lien date d’avant une mise à jour du site : recréez-le sur l’autre appareil.',
    arrive: function(n, c){
      return 'Ce lien apporte ' + n + ' univers · ' + c +
             (c > 1 ? ' entrées terminées' : ' entrée terminée') +
             '. Il remplace la progression de ces univers sur cet appareil ; vos ajouts sont conservés.';
    },
    appliquer: 'Remplacer ici',
    drive: 'Google Drive',
    driveEn: 'Synchronisation…',
    driveOk: function(q){ return 'Synchronisé avec votre Google Drive · ' + q + '. Le fichier chronologeek.json y garde votre progression : rien ne passe par Chronologeek.'; },
    driveKo: 'Google Drive n’a pas répondu. Réessayez dans un instant.',
    driveRefus: 'Accès à Google Drive refusé : rien n’a été synchronisé.',
    driveBloque: 'Votre navigateur a bloqué la fenêtre de Google : autorisez les fenêtres pour chronologeek.app, puis recliquez.',
    driveFerme: 'La fenêtre de Google a été fermée : rien n’a été synchronisé.',
    ignorer: 'Ignorer'
  } : {
    titre: 'All your timelines, in one file',
    dek:   'What you’ve completed across the twelve timelines and the Deep Dive, plus the works you added yourself. One file to carry to another device or browser, instead of exporting page by page.',
    exp:   'Export everything',
    imp:   'Import',
    nom:   'chronologeek-all.json',
    rien:  'Nothing completed yet — open a timeline and the file will follow.',
    mauvais: 'This file is not a Chronologeek export.',
    vide:  'This file holds no progress.',
    plein: 'The browser refused to save: storage full, or private browsing.',
    etat:  function(n, c, a){
      return n + (n > 1 ? ' universes · ' : ' universe · ') +
             c + (c > 1 ? ' entries completed' : ' entry completed') +
             (a ? ' · ' + a + (a > 1 ? ' works of yours' : ' work of yours') : '');
    },
    lien:   'Transfer link',
    envoi:  'Open this link on the other device, or scan the code with its camera. Your progress travels inside the link itself: nothing goes through a server.',
    envoiSansQr: 'Open this link on the other device: send it to yourself by message or email. Your progress travels inside the link itself: nothing goes through a server.',
    dense:  'Too much progress for a code readable on screen: use the link.',
    images: 'The images of your own additions don’t travel by link — the file carries them.',
    copier: 'Copy',
    copie:  'Copied',
    partager: 'Share',
    recoit: 'On the installed app, or if the link opened somewhere else: paste it here.',
    colle:  'Paste a transfer link',
    lire:   'Read',
    lienKo: 'This transfer link is incomplete or damaged.',
    lienVieux: 'This link predates a site update: create it again on the other device.',
    arrive: function(n, c){
      return 'This link brings ' + n + (n > 1 ? ' universes · ' : ' universe · ') + c +
             (c > 1 ? ' entries completed' : ' entry completed') +
             '. It replaces the progress of these universes on this device; your own additions are kept.';
    },
    appliquer: 'Replace here',
    drive: 'Google Drive',
    driveEn: 'Syncing…',
    driveOk: function(q){ return 'Synced with your Google Drive · ' + q + '. The chronologeek.json file there keeps your progress: nothing goes through Chronologeek.'; },
    driveKo: 'Google Drive did not answer. Try again in a moment.',
    driveRefus: 'Google Drive access denied: nothing was synced.',
    driveBloque: 'Your browser blocked Google’s window: allow pop-ups for chronologeek.app, then click again.',
    driveFerme: 'Google’s window was closed: nothing was synced.',
    ignorer: 'Dismiss'
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
    '.sy-err.ok{color:#81c784}',
    /* Étroit, les deux boutons prennent la ligne chacun : côte à côte ils
       tombaient à deux mots par ligne. */
    '@media(max-width:420px){',
    '  .sy-act{align-self:stretch;flex-direction:column}',
    '  .sy-b{justify-content:center}',
    '}',
    /* Le panneau du lien : le code à gauche, le lien et la réception à
       droite ; empilés sous 640 px. Même `[hidden]` rappelé que plus haut. */
    '.sy-l{display:flex;gap:22px;align-items:flex-start;text-align:left;',
    '  width:100%;max-width:760px;border:2px solid var(--line);padding:18px}',
    '.sy-l[hidden],.sy-l [hidden]{display:none}',
    '.sy-qr{flex:0 0 200px;width:200px;background:#fff;padding:0}',
    '.sy-qr svg{display:block;width:100%;height:auto}',
    '.sy-l.gros{flex-direction:column;align-items:stretch}',
    '.sy-l.gros .sy-qr{flex:none;align-self:center}',
    '.sy-lc{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:10px}',
    '.sy-l p{margin:0}',
    '.sy-row{display:flex;gap:8px}',
    '.sy-row input{flex:1 1 auto;min-width:0;font:inherit;font-size:13px;',
    '  background:var(--ink);color:var(--paper);border:1px solid var(--line);padding:8px 10px}',
    '.sy-row .sy-b{padding:7px 14px;font-size:13.5px;flex:0 0 auto}',
    '.sy-n{font-size:12.5px!important;color:rgba(255,253,247,.55)!important}',
    '.sy-sep{border-top:1px solid var(--line);padding-top:12px}',
    '.sy-ok{font-size:13.5px!important;color:var(--paper)!important;font-weight:700}',
    '.sy-b.fait{border-color:#81c784;color:#81c784;background:none}',
    '@media(max-width:640px){',
    '  .sy-l{flex-direction:column;align-items:stretch;padding:14px}',
    '  .sy-qr{flex:none;align-self:center}',
    '  .sy-row{flex-wrap:wrap}.sy-row input{flex:1 1 100%}',
    '  .sy-row .sy-b{flex:1 1 auto;justify-content:center}',
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
      var a = x.alt ? lis(x.alt, {}) : null;
      if (a && typeof a === 'object' && Object.keys(a).length) bloc.alt = a;
      if (m.length) bloc.mine = m;
      var mode = null;
      try { mode = localStorage.getItem(x.prog + '-mode'); } catch (_) {}
      if (mode) bloc.mode = mode;
      out[x.u] = bloc;
      n++;
      coches += cles.filter(function(k){ return !PARCOURS.test(k); }).length;
      ajouts += m.length;
    });
    return { universes: out, dates: window.CG_DATES(), options: window.CG_OPT ? CG_OPT.ex() : undefined,
             n: n, coches: coches, ajouts: ajouts };
  }

  /* ── la fusion des ajouts, celle de `e-perso.js` ──────────────────
     Reprise ici plutôt qu'appelée : `e-perso.js` n'est chargé que par
     les pages qui ont une timeline, et il ne connaît que la sienne.
     Rend `false` sur la seule écriture refusée — « rien à changer » est
     un succès, pas un échec. */
  function fusionne(cle, entrants, sansImages){
    if (!Array.isArray(entrants) || !entrants.length) return true;
    var par = {}, ordre = [], change = false;
    var actuels = lis(cle, []);
    if (!Array.isArray(actuels)) actuels = [];
    actuels.forEach(function(x){
      if (x && x.id) { par[x.id] = x; ordre.push(x.id); }
    });
    entrants.forEach(function(x){
      if (!x || typeof x !== 'object' || !x.id || !x.title) return;
      /* Un lien ne porte pas les images : l'absence n'y veut pas dire qu'on
         l'a retirée, et celle qu'on a déjà ici reste. */
      if (sansImages && !x.img && par[x.id] && par[x.id].img) x.img = par[x.id].img;
      if (!par[x.id]) ordre.push(x.id);
      else if (JSON.stringify(par[x.id]) === JSON.stringify(x)) return;
      par[x.id] = x; change = true;
    });
    if (!change) return true;
    return pose(cle, ordre.map(function(i){ return par[i]; }));
  }

  /* ── le lien de transfert ────────────────────────────────────────────
     Le fichier demande de le déposer quelque part et de le retrouver sur
     l'autre appareil ; un lien s'envoie par message, un code se scanne. Il
     porte le même contenu que « Tout exporter », sous une forme serrée :
     les coches deviennent des listes d'identifiants, les clés une lettre,
     et le tout passe par `deflate` avant la base64 d'URL.

     **Le contenu est dans le fragment, après `#`.** Le navigateur ne
     l'envoie jamais au serveur, ni à GoatCounter : la progression ne
     quitte pas l'appareil qui l'ouvre. C'est la seule raison pour laquelle
     un lien peut porter ça sans compte.

     **Les images des ajouts n'y entrent pas.** Réduites, elles pèsent
     encore quelques kilo-octets chacune — de quoi faire passer le lien de
     deux mille signes à cinquante mille. Le fichier les garde, et la
     fusion ne retire pas une image qu'on a déjà. */
  /* **Une coche vaut un bit**, depuis le 27 septembre 2026. En toutes
     lettres, huit cents coches faisaient un lien de six mille signes :
     trop pour un QR code, qui plafonne à 2 953 octets, et c'est justement
     sur l'ordinateur — là où l'on suit le plus d'univers, et d'où l'on
     scanne avec son téléphone — que le code disparaissait. L'index de la
     recherche porte déjà tous les identifiants du site, univers par
     univers : triés, ils donnent un rang à chacun, et une progression
     devient une suite de bits. Les 1 565 œuvres tiennent en 196 octets.

     Ce qui n'est pas dans l'index — ajouts `p-`, entrées propres à un
     second parcours — reste écrit en toutes lettres. Le lien porte une
     empreinte de la liste : ajouter une œuvre décale les rangs, et un lien
     d'avant la publication serait relu de travers sans un mot. Il est
     refusé, avec la raison. Les deux index ont les mêmes identifiants,
     donc un lien français se relit sur la page anglaise. */
  var catalogue = null;
  function charge(){
    if (catalogue) return catalogue;
    catalogue = fetch(FR ? '/search-fr.json' : '/search-en.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(ix){
        if (!ix || !ix.u || !ix.e) return null;
        var ids = {}, tout = [];
        ix.u.forEach(function(u){ ids[u.k] = []; });
        ix.e.forEach(function(e){ var k = ix.u[e[0]] && ix.u[e[0]].k; if (k) ids[k].push(e[2]); });
        Object.keys(ids).sort().forEach(function(k){
          ids[k].sort();
          tout.push(k + ':' + ids[k].join(','));
        });
        var h = 0x811c9dc5, s = tout.join('|');
        for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
        return { ids: ids, h: (h >>> 0).toString(36) };
      })
      .catch(function(){ return null; });
    return catalogue;
  }
  function bits(liste, coches){
    var o = new Uint8Array(Math.ceil(liste.length / 8)), n = 0;
    liste.forEach(function(id, i){ if (coches[id]) { o[i >> 3] |= 1 << (i & 7); n++; } });
    return n ? b64(o) : '';
  }
  function debits(liste, s){
    var o = deb64(s), r = [];
    liste.forEach(function(id, i){ if (o[i >> 3] & (1 << (i & 7))) r.push(id); });
    return r;
  }

  function serre(r, last, cat){
    var u = {};
    Object.keys(r.universes).forEach(function(k){
      var b = r.universes[k], s = {};
      var p = Object.keys(b.progress || {}).filter(function(i){ return b.progress[i]; });
      var liste = cat && cat.ids[k];
      if (liste) {
        var connus = {};
        liste.forEach(function(i){ connus[i] = 1; });
        var bs = bits(liste, b.progress || {});
        if (bs) s.b = bs;
        p = p.filter(function(i){ return !connus[i]; });
      }
      if (p.length) s.p = p;
      if (b.alt) {
        var a = Object.keys(b.alt).filter(function(i){ return b.alt[i]; });
        if (a.length) s.a = a;
      }
      if (b.mine) s.m = b.mine.map(function(x){
        var y = {}; for (var c in x) if (c !== 'img' || !/^data:/.test(x[c] || '')) y[c] = x[c];
        return y;
      });
      if (b.mode) s.o = b.mode;
      u[k] = s;
    });
    var d = cat ? { v: 2, h: cat.h, u: u } : { v: 1, u: u };
    if (last) d.l = last;
    /* les réglages, quelques dizaines de signes une fois serrés */
    if (r.options) d.s = r.options;
    return d;
  }
  /* Rend le fichier d'import, `null` si le lien n'en est pas un, et
     `'vieux'` si la liste des œuvres a changé depuis sa création. */
  function desserre(d, cat){
    if (!d || (d.v !== 1 && d.v !== 2) || !d.u || typeof d.u !== 'object') return null;
    if (d.v === 2 && (!cat || cat.h !== d.h)) return 'vieux';
    var out = {};
    function ens(l){
      var o = {};
      if (Array.isArray(l)) l.forEach(function(i){ if (typeof i === 'string') o[i] = 1; });
      return o;
    }
    Object.keys(d.u).forEach(function(k){
      var s = d.u[k] || {}, b = { progress: ens(s.p) };
      if (d.v === 2 && typeof s.b === 'string' && cat.ids[k])
        debits(cat.ids[k], s.b).forEach(function(i){ b.progress[i] = 1; });
      if (s.a) b.alt = ens(s.a);
      if (Array.isArray(s.m)) b.mine = s.m;
      if (typeof s.o === 'string') b.mode = s.o;
      out[k] = b;
    });
    var f = { chronologeek: 1, kind: 'all', universes: out };
    if (d.l) f.last = d.l;
    if (d.s && typeof d.s === 'object') f.options = d.s;
    return f;
  }

  /* `CompressionStream` manque aux navigateurs d'avant 2023 : le lien part
     alors en clair, préfixé `j` au lieu de `z`, et se relit pareil. */
  function b64(octets){
    var s = '';
    for (var i = 0; i < octets.length; i += 8192)
      s += String.fromCharCode.apply(null, octets.subarray(i, i + 8192));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function deb64(s){
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var b = atob(s), o = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
    return o;
  }
  function flot(octets, Classe){
    var st = new Blob([octets]).stream().pipeThrough(new Classe('deflate-raw'));
    return new Response(st).arrayBuffer().then(function(ab){ return new Uint8Array(ab); });
  }
  function encode(obj){
    var brut = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === 'undefined') return Promise.resolve('j' + b64(brut));
    return flot(brut, CompressionStream).then(function(z){ return 'z' + b64(z); });
  }
  function decode(code){
    return Promise.resolve().then(function(){
      var o = deb64(code.slice(1));
      if (code[0] === 'j') return o;
      if (code[0] !== 'z' || typeof DecompressionStream === 'undefined') throw 0;
      return flot(o, DecompressionStream);
    }).then(function(o){
      var d = JSON.parse(new TextDecoder().decode(o));
      return (d && d.v === 2 ? charge() : Promise.resolve(null))
        .then(function(cat){ return desserre(d, cat); });
    });
  }
  /* On accepte le lien entier comme le code seul : un lien collé depuis
     une messagerie arrive parfois avec du texte autour. */
  function codeDe(s){
    var m = /import=([jz][A-Za-z0-9_-]+)/.exec(s || '');
    if (m) return m[1];
    s = (s || '').trim();
    return /^[jz][A-Za-z0-9_-]{8,}$/.test(s) ? s : null;
  }

  /* ── le QR code ──────────────────────────────────────────────────────
     Écrit ici plutôt que tiré d'une bibliothèque : le site n'appelle aucun
     serveur tiers, et une bibliothèque vendue pèserait trois fois ce bloc
     pour des modes dont on n'a pas l'usage. Mode octet seul, niveaux de
     correction L et M, versions 1 à 40 — l'algorithme de la norme
     ISO 18004, dans l'ordre où Project Nayuki l'expose. */
  function qrMatrice(texte){
    var ECC = {
      L: [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
      M: [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]
    };
    var BLOCS = {
      L: [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
      M: [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]
    };
    var FORMAT = { L: 1, M: 0 };

    var octets = unescape(encodeURIComponent(texte));
    var data = [];
    for (var i = 0; i < octets.length; i++) data.push(octets.charCodeAt(i));

    function brut(v){
      var r = (16 * v + 128) * v + 64;
      if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
      return r;
    }
    function utiles(v, e){ return Math.floor(brut(v) / 8) - ECC[e][v] * BLOCS[e][v]; }

    /* La plus petite version qui tient, en M d'abord, en L sinon. */
    var ver = 0, ecl = null;
    ['M', 'L'].some(function(e){
      for (var v = 1; v <= 40; v++) {
        var bits = 4 + (v <= 9 ? 8 : 16) + data.length * 8;
        if (bits <= utiles(v, e) * 8) { ver = v; ecl = e; return true; }
      }
      return false;
    });
    if (!ver) return null;

    /* Les bits de données, puis le bourrage. */
    var bb = [];
    function pousse(val, n){ for (var k = n - 1; k >= 0; k--) bb.push((val >>> k) & 1); }
    pousse(4, 4);
    pousse(data.length, ver <= 9 ? 8 : 16);
    data.forEach(function(b){ pousse(b, 8); });
    var cap = utiles(ver, ecl) * 8;
    pousse(0, Math.min(4, cap - bb.length));
    pousse(0, (8 - bb.length % 8) % 8);
    for (var pad = 0xEC; bb.length < cap; pad ^= 0xEC ^ 0x11) pousse(pad, 8);
    var mots = [];
    for (i = 0; i < bb.length; i += 8) {
      var o = 0; for (var j = 0; j < 8; j++) o = (o << 1) | bb[i + j];
      mots.push(o);
    }

    /* Reed-Solomon sur GF(256), polynôme 0x11D. */
    function mul(x, y){
      var z = 0;
      for (var k = 7; k >= 0; k--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> k) & 1) * x; }
      return z;
    }
    function diviseur(deg){
      var r = []; for (var k = 0; k < deg - 1; k++) r.push(0); r.push(1);
      var root = 1;
      for (k = 0; k < deg; k++) {
        for (var m = 0; m < r.length; m++) { r[m] = mul(r[m], root); if (m + 1 < r.length) r[m] ^= r[m + 1]; }
        root = mul(root, 2);
      }
      return r;
    }
    function reste(d, div){
      var r = div.map(function(){ return 0; });
      d.forEach(function(b){
        var f = b ^ r.shift(); r.push(0);
        div.forEach(function(c, k){ r[k] ^= mul(c, f); });
      });
      return r;
    }

    /* Les blocs, et leur entrelacement. */
    var nb = BLOCS[ecl][ver], lecc = ECC[ecl][ver], total = Math.floor(brut(ver) / 8);
    var courts = nb - total % nb, lcourt = Math.floor(total / nb);
    var blocs = [], div = diviseur(lecc), pos = 0;
    for (i = 0; i < nb; i++) {
      var dat = mots.slice(pos, pos + lcourt - lecc + (i < courts ? 0 : 1));
      pos += dat.length;
      var e = reste(dat, div);
      if (i < courts) dat.push(0);
      blocs.push(dat.concat(e));
    }
    var flux = [];
    for (i = 0; i < blocs[0].length; i++)
      for (j = 0; j < blocs.length; j++)
        if (i !== lcourt - lecc || j >= courts) flux.push(blocs[j][i]);

    /* La grille : motifs fixes d'abord, marqués pour que ni les données ni
       le masque ne les touchent. */
    var n = ver * 4 + 17, mod = [], fixe = [];
    for (i = 0; i < n; i++) { mod.push(new Array(n).fill(false)); fixe.push(new Array(n).fill(false)); }
    function pose(x, y, v){ mod[y][x] = v; fixe[y][x] = true; }

    for (i = 0; i < n; i++) { pose(6, i, i % 2 === 0); pose(i, 6, i % 2 === 0); }
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(function(c){
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = c[0] + dx, yy = c[1] + dy;
        if (xx >= 0 && xx < n && yy >= 0 && yy < n) pose(xx, yy, d !== 2 && d !== 4);
      }
    });
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2;
      var pas = Math.floor((ver * 8 + na * 3 + 5) / (na * 4 - 4)) * 2;
      var al = [6];
      for (var p = n - 7; al.length < na; p -= pas) al.splice(1, 0, p);
      al.forEach(function(ay, a){
        al.forEach(function(ax, b){
          if ((a === 0 && b === 0) || (a === 0 && b === na - 1) || (a === na - 1 && b === 0)) return;
          for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++)
            pose(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        });
      });
    }
    function format(masque){
      var d = FORMAT[ecl] << 3 | masque, r = d;
      for (var k = 0; k < 10; k++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var b = (d << 10 | r) ^ 0x5412;
      var bit = function(k){ return ((b >>> k) & 1) !== 0; };
      for (k = 0; k <= 5; k++) pose(8, k, bit(k));
      pose(8, 7, bit(6)); pose(8, 8, bit(7)); pose(7, 8, bit(8));
      for (k = 9; k < 15; k++) pose(14 - k, 8, bit(k));
      for (k = 0; k < 8; k++) pose(n - 1 - k, 8, bit(k));
      for (k = 8; k < 15; k++) pose(8, n - 15 + k, bit(k));
      pose(8, n - 8, true);
    }
    format(0);                                  /* réserve la place */
    if (ver >= 7) {
      var r = ver;
      for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      var vb = ver << 12 | r;
      for (i = 0; i < 18; i++) {
        var bit = ((vb >>> i) & 1) !== 0, a = n - 11 + i % 3, b = Math.floor(i / 3);
        pose(a, b, bit); pose(b, a, bit);
      }
    }

    /* Les données, en zigzag de deux colonnes, du bas à droite. */
    var k = 0;
    for (var droite = n - 1; droite >= 1; droite -= 2) {
      if (droite === 6) droite = 5;
      for (var vert = 0; vert < n; vert++) for (j = 0; j < 2; j++) {
        var x = droite - j, monte = ((droite + 1) & 2) === 0, y = monte ? n - 1 - vert : vert;
        if (!fixe[y][x] && k < flux.length * 8) {
          mod[y][x] = ((flux[k >>> 3] >>> (7 - (k & 7))) & 1) !== 0;
          k++;
        }
      }
    }

    /* Les huit masques, et le moins pénalisé. La pénalité ne compte que
       les suites, les carrés et l'équilibre : c'est ce qui gêne un lecteur
       d'écran à l'autre, et tout masque reste valide. */
    var MASQUES = [
      function(x, y){ return (x + y) % 2 === 0; },
      function(x, y){ return y % 2 === 0; },
      function(x){ return x % 3 === 0; },
      function(x, y){ return (x + y) % 3 === 0; },
      function(x, y){ return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function(x, y){ return x * y % 2 + x * y % 3 === 0; },
      function(x, y){ return (x * y % 2 + x * y % 3) % 2 === 0; },
      function(x, y){ return ((x + y) % 2 + x * y % 3) % 2 === 0; }
    ];
    function masque(m){
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++)
        if (!fixe[y][x] && MASQUES[m](x, y)) mod[y][x] = !mod[y][x];
    }
    function penalite(){
      var s = 0, noirs = 0, x, y, run;
      for (y = 0; y < n; y++) {
        run = 1;
        for (x = 1; x <= n; x++) {
          if (x < n && mod[y][x] === mod[y][x - 1]) run++;
          else { if (run >= 5) s += run - 2; run = 1; }
        }
      }
      for (x = 0; x < n; x++) {
        run = 1;
        for (y = 1; y <= n; y++) {
          if (y < n && mod[y][x] === mod[y - 1][x]) run++;
          else { if (run >= 5) s += run - 2; run = 1; }
        }
      }
      for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) {
        var c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) s += 3;
      }
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (mod[y][x]) noirs++;
      s += Math.floor(Math.abs(noirs * 20 - n * n * 10) / (n * n)) * 10;
      return s;
    }
    var meilleur = 0, min = Infinity;
    for (var m = 0; m < 8; m++) {
      masque(m); format(m);
      var pen = penalite();
      if (pen < min) { min = pen; meilleur = m; }
      masque(m);                                /* XOR : se défait lui-même */
    }
    masque(meilleur); format(meilleur);
    return { n: n, m: mod, version: ver };
  }

  /* Le code en SVG : net à toute taille, et un seul chemin. */
  function qrSvg(texte){
    var q = qrMatrice(texte);
    if (!q) return null;
    var d = '', marge = 4, cote = q.n + marge * 2;
    for (var y = 0; y < q.n; y++) for (var x = 0; x < q.n; x++)
      if (q.m[y][x]) d += 'M' + (x + marge) + ' ' + (y + marge) + 'h1v1h-1z';
    return { version: q.version,
             svg: '<svg viewBox="0 0 ' + cote + ' ' + cote + '" shape-rendering="crispEdges" role="img">' +
                  '<rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>' };
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
          '<button type="button" class="sy-b alt" id="sy-lk" aria-expanded="false" aria-controls="sy-l">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>' +
            '<span></span></button>' +
          '<button type="button" class="sy-b alt" id="sy-gd" hidden>' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l6 11-4 7H6l-4-7z"/><path d="M8 3l10 18M16 3 6 21M2 14h20"/></svg>' +
            '<span></span></button>' +
          '<input type="file" accept="application/json,.json" id="sy-f" hidden/>' +
        '</div>' +
        '<span class="sy-err" hidden></span>' +
        '<div class="sy-l" id="sy-l" hidden>' +
          '<div class="sy-qr" hidden></div>' +
          '<div class="sy-lc">' +
            '<div class="sy-env" hidden>' +
              '<p class="sy-e1"></p>' +
              '<div class="sy-row" style="margin-top:10px">' +
                '<label class="skip" for="sy-url"></label>' +
                '<input id="sy-url" readonly/>' +
                '<button type="button" class="sy-b" id="sy-cp"><span></span></button>' +
                '<button type="button" class="sy-b alt" id="sy-sh" hidden><span></span></button>' +
              '</div>' +
              '<p class="sy-n sy-e2" hidden style="margin-top:8px"></p>' +
            '</div>' +
            '<div class="sy-rec">' +
              '<p class="sy-n sy-r1"></p>' +
              '<div class="sy-row" style="margin-top:8px">' +
                '<label class="skip" for="sy-col"></label>' +
                '<input id="sy-col" autocomplete="off" spellcheck="false"/>' +
                '<button type="button" class="sy-b alt" id="sy-rd"><span></span></button>' +
              '</div>' +
              '<div class="sy-cf" hidden style="margin-top:10px">' +
                '<p class="sy-ok"></p>' +
                '<div class="sy-row" style="margin-top:8px">' +
                  '<button type="button" class="sy-b" id="sy-go"><span></span></button>' +
                  '<button type="button" class="sy-b alt" id="sy-no"><span></span></button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* `textContent` plutôt qu'une concaténation : les libellés portent
       des apostrophes typographiques. */
    sec.querySelector('h2').textContent = T.titre;
    sec.querySelector('p').textContent = T.dek;
    sec.querySelector('#sy-out span').textContent = T.exp;
    sec.querySelector('#sy-in span').textContent = T.imp;
    sec.querySelector('#sy-lk span').textContent = T.lien;
    sec.querySelector('#sy-gd span').textContent = T.drive;
    sec.querySelector('label[for="sy-url"]').textContent = T.lien;
    sec.querySelector('#sy-cp span').textContent = T.copier;
    sec.querySelector('#sy-sh span').textContent = T.partager;
    sec.querySelector('.sy-r1').textContent = T.recoit;
    sec.querySelector('label[for="sy-col"]').textContent = T.colle;
    sec.querySelector('#sy-col').placeholder = T.colle;
    sec.querySelector('#sy-rd span').textContent = T.lire;
    sec.querySelector('#sy-go span').textContent = T.appliquer;
    sec.querySelector('#sy-no span').textContent = T.ignorer;

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

    function dit(m, bon){ err.textContent = m || ''; err.hidden = !m; err.classList.toggle('ok', !!bon); }

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
                universes: r.universes, dates: r.dates, options: r.options };
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

    /* L'import, que le fichier et le lien partagent. `sansImages` dit que
       les ajouts arrivent sans leur image, et qu'il faut garder la nôtre. */
    function applique(d, sansImages){
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
        /* La seconde clé suit la première. Un fichier d'avant la
           séparation n'a pas d'`alt` et porte tout dans `progress` :
           la page le range à sa prochaine ouverture. */
        if (x.alt && b.alt && typeof b.alt === 'object' && !Array.isArray(b.alt)) {
          if (pose(x.alt, b.alt)) faits++; else refus++;
        }
        if (x.perso && Array.isArray(b.mine) && b.mine.length) {
          if (fusionne(x.perso, b.mine, sansImages)) faits++; else refus++;
        }
        if (typeof b.mode === 'string' && b.mode) {
          try { localStorage.setItem(x.prog + '-mode', b.mode); } catch (_) {}
        }
      });
      if (d.last && typeof d.last === 'object') pose('cg_last', d.last);
      window.CG_DATES(d.dates);
      if (d.options && window.CG_OPT && CG_OPT.ecrire) CG_OPT.ecrire(d.options);

      if (refus) return dit(T.plein);
      if (!faits) return dit(T.vide);
      /* Les cases, le score et le bandeau de reprise sont peints au
         chargement : c'est le rechargement qui les rebâtit, comme sur
         les neuf pages. Le fragment part avant : recharger sur un
         `#import=` rejouerait la question. */
      if (/import=/.test(location.hash))
        history.replaceState(null, '', location.pathname + location.search);
      location.reload();
    }

    champ.addEventListener('change', function(){
      var f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      var r = new FileReader();
      r.onload = function(){
        var d;
        try { d = JSON.parse(r.result); } catch (_) { return dit(T.mauvais); }
        applique(d, false);
      };
      r.readAsText(f);
    });

    /* ── la synchro Google Drive ─────────────────────────────────────────
       Posée le 14 novembre 2026 (n° 5 de la liste du 5 novembre). Le visiteur
       range sa progression dans un fichier `chronologeek.json` de SON Google
       Drive : rien n'est stocké chez nous, rien ne passe par nous. Portée
       `drive.file` : l'appli ne voit que les fichiers qu'elle a créés, et
       Google la classe « non sensible ».

       - **Un bouton, jamais en arrière-plan** : une page ne peut pas demander
         de jeton à Google sans un geste du visiteur (la fenêtre serait
         bloquée). Le script de Google n'est chargé qu'au survol ou au clic du
         bouton — aucune requête vers Google pour qui ne s'en sert pas.
       - **La fusion est une union** : une coche faite sur l'un ou l'autre
         appareil reste. Une coche retirée sur un appareil revient donc si
         l'autre l'a encore ; c'est le prix d'une synchro sans horodatage par
         case, et le moins grave des deux défauts (on ne perd rien). Les
         ajouts se rejoignent par identifiant, les dates gardent la plus
         récente, les réglages restent ceux de l'appareil.
       - **`DRIVE_ID` vide = bouton caché.** L'identifiant OAuth est celui du
         projet Google Cloud de Niko ; il est public par nature. */
    var DRIVE_ID = '462461566472-odtqk1klk077r2g6cclceq0o9v98r91s.apps.googleusercontent.com';
    var gd = sec.querySelector('#sy-gd');
    var GSI = null, jeton = null;
    function gsi(){
      GSI = GSI || new Promise(function(ok, ko){
        var s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
        s.onload = function(){ ok(window.google); }; s.onerror = ko;
        document.head.appendChild(s);
      });
      return GSI;
    }
    function demandeJeton(){
      return gsi().then(function(g){
        return new Promise(function(ok, ko){
          var c = g.accounts.oauth2.initTokenClient({
            client_id: DRIVE_ID, scope: 'https://www.googleapis.com/auth/drive.file',
            callback: function(r){ if (r && r.access_token) { jeton = r.access_token; ok(jeton); } else ko('refus'); },
            // la fenêtre bloquée ou fermée n'est pas un refus : le dire autrement
            error_callback: function(e){ ko(e && e.type === 'popup_failed_to_open' ? 'bloque' : e && e.type === 'popup_closed' ? 'ferme' : 'refus'); }
          });
          c.requestAccessToken({ prompt: lis('cg-drive', null) ? '' : 'consent' });
        });
      });
    }
    function api(url, o){
      o = o || {}; o.headers = o.headers || {}; o.headers.Authorization = 'Bearer ' + jeton;
      return fetch(url, o).then(function(r){ if (!r.ok) throw r.status; return r; });
    }
    function trouve(){
      var memo = lis('cg-drive', null);
      var q = encodeURIComponent("name='chronologeek.json' and trashed=false");
      return api('https://www.googleapis.com/drive/v3/files?spaces=drive&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc&q=' + q)
        .then(function(r){ return r.json(); })
        .then(function(j){
          var f = (j.files || [])[0];
          return f ? f.id : (memo && memo.id) || null;
        });
    }
    function ecrit(id, corps){
      var b = JSON.stringify(corps);
      if (id) return api('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media',
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: b }).then(function(){ return id; });
      var lim = 'cg' + Date.now();
      var multi = '--' + lim + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify({ name: 'chronologeek.json', mimeType: 'application/json' }) + '\r\n--' + lim +
        '\r\nContent-Type: application/json\r\n\r\n' + b + '\r\n--' + lim + '--';
      return api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + lim }, body: multi })
        .then(function(r){ return r.json(); }).then(function(j){ return j.id; });
    }
    // l'union de ce qui est ici et de ce qui est sur Drive
    function union(ici, la){
      var out = { chronologeek: 1, kind: 'all', date: new Date().toISOString(), universes: {}, dates: {}, options: ici.options };
      var U = {};
      Object.keys(ici.universes || {}).concat(Object.keys((la && la.universes) || {})).forEach(function(k){ U[k] = 1; });
      Object.keys(U).forEach(function(k){
        var a = (ici.universes || {})[k] || {}, b = ((la && la.universes) || {})[k] || {}, m = {};
        ['progress', 'alt'].forEach(function(c){
          var o = {}, x = a[c] || {}, y = b[c] || {};
          Object.keys(y).forEach(function(i){ if (y[i]) o[i] = y[i]; });
          Object.keys(x).forEach(function(i){ if (x[i]) o[i] = x[i]; });
          if (Object.keys(o).length) m[c] = o;
        });
        var vus = {}, mine = [];
        (a.mine || []).concat(b.mine || []).forEach(function(e){ if (e && e.id && !vus[e.id]) { vus[e.id] = 1; mine.push(e); } });
        if (mine.length) m.mine = mine;
        if (a.mode || b.mode) m.mode = a.mode || b.mode;
        out.universes[k] = m;
      });
      [la && la.dates, ici.dates].forEach(function(d){
        Object.keys(d || {}).forEach(function(i){ if (!(out.dates[i] >= d[i])) out.dates[i] = d[i]; });
      });
      var last = lis('cg_last', null) || (la && la.last);
      if (last) out.last = last;
      return out;
    }
    function compte(d){
      var n = 0;
      Object.keys(d.universes || {}).forEach(function(k){
        var u = d.universes[k];
        n += Object.keys(u.progress || {}).length + Object.keys(u.alt || {}).length + (u.mine || []).length;
      });
      return n;
    }
    function quand(){
      var n = new Date();
      return n.toLocaleDateString(FR ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' }) + ' ' +
        n.toLocaleTimeString(FR ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    }
    window.CG_DRIVE_UNION = union;   // pour la vérifier sans compte Google
    if (DRIVE_ID) {
      gd.hidden = false;
      gd.addEventListener('pointerenter', function(){ gsi().catch(function(){}); }, { once: true });
      gd.addEventListener('click', function(){
        var r = recolte(), ici = { universes: r.universes, dates: r.dates, options: r.options };
        dit(T.driveEn);
        demandeJeton().then(trouve).then(function(id){
          var lecture = id ? api('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media')
            .then(function(x){ return x.json(); }).catch(function(){ return null; }) : Promise.resolve(null);
          return lecture.then(function(la){
            var m = union(ici, la);
            return ecrit(id, m).then(function(nid){
              pose('cg-drive', { id: nid, quand: new Date().toISOString() });
              // rien de neuf venu de Drive : pas de rechargement
              if (compte(m) === compte(ici)) { dit(T.driveOk(quand()), true); return; }
              applique(m, false);
            });
          });
        }).catch(function(e){ dit(e === 'refus' ? T.driveRefus : e === 'bloque' ? T.driveBloque : e === 'ferme' ? T.driveFerme : T.driveKo); });
      });
    }

    /* ── le lien ── */
    var lk = sec.querySelector('#sy-lk'), pan = sec.querySelector('#sy-l');
    var qr = sec.querySelector('.sy-qr'), env = sec.querySelector('.sy-env');
    var url = sec.querySelector('#sy-url'), cp = sec.querySelector('#sy-cp');
    var sh = sec.querySelector('#sy-sh'), e2 = sec.querySelector('.sy-e2');
    var col = sec.querySelector('#sy-col'), cf = sec.querySelector('.sy-cf');
    var recu = null;

    function ouvre(){
      pan.hidden = false;
      lk.setAttribute('aria-expanded', 'true');
      var r = recolte();
      if (!r.n) { env.hidden = true; qr.hidden = true; return; }
      var images = Object.keys(r.universes).some(function(k){
        return (r.universes[k].mine || []).some(function(x){ return /^data:/.test(x.img || ''); });
      });
      charge().then(function(cat){
        return encode(serre(r, lis('cg_last', null), cat));
      }).then(function(code){
        var lien = location.origin + location.pathname + '#import=' + code;
        url.value = lien;
        /* Le code se scanne sur l'écran d'un ordinateur avec un téléphone :
           il n'y a donc pas de plafond autre que la norme (version 40), mais
           un code dense doit grandir. Trois pixels par module, 200 au moins,
           520 au plus ; au-delà de 240 il prend la ligne entière au-dessus du
           lien. Un premier plafond à mille signes cachait le code dès qu'on
           suivait plusieurs univers — précisément sur l'ordinateur. */
        var q = qrSvg(lien);
        qr.innerHTML = q ? q.svg : '';
        qr.hidden = !q;
        if (q) {
          var px = Math.min(520, Math.max(200, (q.version * 4 + 25) * 3));
          qr.style.width = qr.style.flexBasis = 'min(' + px + 'px,100%)';
          pan.classList.toggle('gros', px > 240);
        }
        if (q) qr.firstChild.setAttribute('aria-label', T.lien);
        sec.querySelector('.sy-e1').textContent = q ? T.envoi : T.envoiSansQr;
        var notes = [];
        if (!q) notes.push(T.dense);
        if (images) notes.push(T.images);
        e2.textContent = notes.join(' ');
        e2.hidden = !notes.length;
        sh.hidden = !navigator.share;
        cp.classList.remove('fait');
        cp.firstChild.textContent = T.copier;
        env.hidden = false;
      }, function(){ env.hidden = true; });
    }
    lk.addEventListener('click', function(){
      if (pan.hidden) ouvre();
      else { pan.hidden = true; lk.setAttribute('aria-expanded', 'false'); }
    });
    url.addEventListener('focus', function(){ this.select(); });
    cp.addEventListener('click', function(){
      var fait = function(){ cp.classList.add('fait'); cp.firstChild.textContent = T.copie; };
      if (navigator.clipboard) navigator.clipboard.writeText(url.value).then(fait, function(){ url.select(); });
      else { url.select(); }
    });
    sh.addEventListener('click', function(){
      navigator.share({ title: 'Chronologeek', url: url.value }).catch(function(){});
    });

    /* Recevoir : on lit, on dit ce que le lien apporte, et l'on attend le
       geste. Remplacer une progression sans le dire serait la seule façon
       de perdre quelque chose ici. */
    function lit(texte){
      var code = codeDe(texte);
      cf.hidden = true; recu = null;
      if (!code) { dit(T.lienKo); return; }
      decode(code).then(function(f){
        if (f === 'vieux') { dit(T.lienVieux); return; }
        if (!f) throw 0;
        var n = 0, c = 0;
        Object.keys(f.universes).forEach(function(k){
          n++;
          c += Object.keys(f.universes[k].progress).filter(function(i){ return !PARCOURS.test(i); }).length;
        });
        recu = f;
        dit('');
        cf.querySelector('.sy-ok').textContent = T.arrive(n, c);
        cf.hidden = false;
      }).catch(function(){ dit(T.lienKo); });
    }
    sec.querySelector('#sy-rd').addEventListener('click', function(){ lit(col.value); });
    col.addEventListener('keydown', function(e){ if (e.key === 'Enter') lit(col.value); });
    sec.querySelector('#sy-go').addEventListener('click', function(){ if (recu) applique(recu, true); });
    sec.querySelector('#sy-no').addEventListener('click', function(){
      cf.hidden = true; recu = null; col.value = '';
      if (/import=/.test(location.hash))
        history.replaceState(null, '', location.pathname + location.search);
    });

    /* Arriver par un lien : le panneau s'ouvre sur la question, et la page
       descend jusqu'à lui — l'écran d'arrivée passé. */
    /* L'envoi reste fermé : qui arrive avec un lien vient recevoir, et un
       second code à l'écran brouillerait la question. */
    if (/import=/.test(location.hash)) {
      pan.hidden = false;
      lk.setAttribute('aria-expanded', 'true');
      col.value = location.href;
      lit(location.href);
      setTimeout(function(){ pan.scrollIntoView({ block: 'center' }); }, 400);
    }
  }

  /* Même report que les deux blocs précédents : `e-app.js` est chargé en
     fin de corps, donc pendant l'analyse du document. */
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', demarre);
  else demarre();
})();

/* ═══ IMPORTER DEPUIS LETTERBOXD ══════════════════════════════════════
   Posé le 13 novembre 2026 (n° 3 de la liste du 5 novembre). Quelqu'un qui
   arrive avec quarante films vus devait faire quarante clics. Letterboxd
   donne à chacun l'export de son compte (Settings → Import & Export →
   Export your data) : un .zip dont `watched.csv` liste chaque film vu,
   « Date, Name, Year ». On le lit ici, dans le navigateur — rien ne part
   nulle part —, et l'on coche ce qu'il reconnaît, après validation.

   - **L'appariement est fait par `/films.json`** (`_proto/films.mjs`), écrit
     à la publication : pour chaque film des timelines, son année et ses
     titres TMDB, ceux que Letterboxd exporte. Un film est reconnu quand son
     titre normalisé est l'un des siens et que l'année tombe à un an près.
   - **On ne coche rien sans montrer la liste.** Elle est groupée par
     univers, tout est coché d'office, ce qui l'était déjà est dit et grisé.
   - **On écrit dans la clé de chaque univers** (`UNIVERS` du bloc d'export,
     recopié ici), l'identifiant de découverte à 1, et le jour du visionnage
     dans `cg-dates` quand il n'y en avait pas. Les seconds parcours suivent
     au chargement de la page, par son pont (`bootBridge`).
   - **Le zip se lit sans bibliothèque** : répertoire central, puis
     `DecompressionStream('deflate-raw')`. Un navigateur qui ne l'a pas
     demande le `watched.csv` décompressé, et le dit.
   Seul l'accueil le porte (`#sync`, le bloc « Toutes vos timelines »).
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (!document.querySelector('.slot[data-u]')) return;
  var FR = document.documentElement.lang !== 'en';
  var CLES = { sw: 'cg-proto-sw', mcu: 'cg-proto-mcu', dc: 'cg-proto-dc', avatar: 'cg-proto-avatar',
    startrek: 'cg-proto-st', twd: 'cg-proto-twd', dragonage: 'cg-proto-dragonage',
    assassinscreed: 'cg-proto-assassinscreed', dcanimation: 'cg-proto-dcanim', jurassic: 'cg-proto-jurassic',
    witcher: 'cg-proto-witcher', residentevil: 'cg-proto-re', bladerunner: 'cg-proto-bladerunner',
    monsterverse: 'cg-proto-monsterverse' };
  var T = FR ? {
    bouton: 'Importer Letterboxd',
    titre: 'Importer depuis Letterboxd',
    aide: 'Sur Letterboxd : Settings → Import & Export → Export your data. Déposez ici le fichier .zip reçu, ou le watched.csv qu’il contient. Il est lu dans votre navigateur : rien n’est envoyé.',
    choisir: 'Choisir le fichier',
    lecture: 'Lecture…',
    pasCsv: 'Ce fichier n’est pas un export Letterboxd : il faut le .zip, ou watched.csv.',
    pasZip: 'Votre navigateur ne sait pas ouvrir ce .zip : décompressez-le et déposez watched.csv.',
    pasIndex: 'La liste des films du site n’a pas pu être chargée. Réessayez dans un instant.',
    rien: function(n){ return n + ' films lus, aucun n’est dans les timelines.'; },
    bilan: function(n, k){ return n + ' films lus · ' + k + (k > 1 ? ' sont dans les timelines' : ' est dans les timelines'); },
    deja: 'déjà coché',
    valider: function(k){ return 'Cocher ' + k + (k > 1 ? ' œuvres' : ' œuvre'); },
    fait: function(k){ return k + (k > 1 ? ' œuvres cochées.' : ' œuvre cochée.') + ' La page se recharge.'; },
    plein: 'Le navigateur a refusé d’enregistrer : mémoire pleine, ou navigation privée.',
    fermer: 'Fermer'
  } : {
    bouton: 'Import Letterboxd',
    titre: 'Import from Letterboxd',
    aide: 'On Letterboxd: Settings → Import & Export → Export your data. Drop the .zip you receive here, or the watched.csv inside it. It is read in your browser: nothing is sent anywhere.',
    choisir: 'Choose the file',
    lecture: 'Reading…',
    pasCsv: 'This is not a Letterboxd export: use the .zip, or watched.csv.',
    pasZip: 'Your browser can’t open this .zip: unzip it and drop watched.csv.',
    pasIndex: 'The site’s film list could not be loaded. Try again in a moment.',
    rien: function(n){ return n + ' films read, none of them is in the timelines.'; },
    bilan: function(n, k){ return n + ' films read · ' + k + (k > 1 ? ' are in the timelines' : ' is in the timelines'); },
    deja: 'already checked',
    valider: function(k){ return 'Check ' + k + (k > 1 ? ' works' : ' work'); },
    fait: function(k){ return k + (k > 1 ? ' works checked.' : ' work checked.') + ' The page is reloading.'; },
    plein: 'The browser refused to save: storage full, or private browsing.',
    fermer: 'Close'
  };

  var CSS = [
    'dialog.lb{margin:auto;width:min(620px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;',
    'background:#101019;color:#fffdf7;border:2px solid var(--hot,#f0c97c);border-radius:3px;padding:20px;',
    'font:15px/1.5 \'Chivo\',sans-serif}dialog.lb::backdrop{background:rgba(4,4,10,.78)}',
    '.lb-h{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}',
    '.lb-h h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:26px;line-height:1;text-transform:uppercase}',
    '.lb-x{background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;width:32px;height:32px}',
    '.lb p{font-size:13.5px;color:rgba(255,253,247,.72)}',
    '.lb-b{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:14.5px;letter-spacing:.07em;',
    'text-transform:uppercase;cursor:pointer;padding:9px 20px;margin-top:14px;background:var(--hot,#f0c97c);',
    'border:2px solid var(--hot,#f0c97c);color:var(--ink,#131215)}',
    '.lb-b:hover{background:#fffdf7;border-color:#fffdf7}.lb-b[hidden],.lb [hidden]{display:none}',
    '.lb-s{margin-top:14px;font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:20px;color:var(--hot,#f0c97c)}',
    '.lb-e{margin-top:12px;font-weight:700;color:#e5484d}',
    '.lb-g{margin-top:14px}.lb-g h3{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;',
    'border-left:4px solid var(--c,#f0c97c);padding-left:8px;margin-bottom:6px}',
    '.lb-g label{display:flex;align-items:baseline;gap:8px;padding:3px 0;font-size:14px;cursor:pointer}',
    '.lb-g label small{opacity:.55;font-size:12px}',
    '.lb-g input{accent-color:var(--hot,#f0c97c)}',
    '.lb-g label.d{opacity:.5;cursor:default}'
  ].join('');

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function norme(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]/g, '');
  }
  function lis(k){
    try { var v = JSON.parse(localStorage.getItem(k) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
    catch (_) { return {}; }
  }

  /* ── le CSV : guillemets doublés, virgules et sauts de ligne dans un champ ── */
  function csv(txt){
    var lignes = [], l = [], c = '', g = false;
    txt = txt.replace(/^﻿/, '');
    for (var i = 0; i < txt.length; i++) {
      var ch = txt[i];
      if (g) {
        if (ch === '"' && txt[i + 1] === '"') { c += '"'; i++; }
        else if (ch === '"') g = false;
        else c += ch;
      } else if (ch === '"') g = true;
      else if (ch === ',') { l.push(c); c = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && txt[i + 1] === '\n') i++;
        l.push(c); c = '';
        if (l.length > 1 || l[0]) lignes.push(l);
        l = [];
      } else c += ch;
    }
    if (c || l.length) { l.push(c); lignes.push(l); }
    return lignes;
  }

  /* ── le zip : le répertoire central, puis l'entrée cherchée ────────── */
  function dezip(buf){
    var v = new DataView(buf), u8 = new Uint8Array(buf), fin = -1;
    for (var i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
      if (v.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) return Promise.reject(new Error('zip'));
    var n = v.getUint16(fin + 10, true), p = v.getUint32(fin + 16, true), trouve = null, repli = null;
    for (var k = 0; k < n; k++) {
      if (v.getUint32(p, true) !== 0x02014b50) break;
      var meth = v.getUint16(p + 10, true), taille = v.getUint32(p + 20, true);
      var ln = v.getUint16(p + 28, true), le = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true);
      var loc = v.getUint32(p + 42, true);
      var nom = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + ln));
      var e = { meth: meth, taille: taille, loc: loc };
      if (/(^|\/)watched\.csv$/i.test(nom)) trouve = e;
      else if (/(^|\/)diary\.csv$/i.test(nom)) repli = e;
      p += 46 + ln + le + lc;
    }
    var e2 = trouve || repli;
    if (!e2) return Promise.reject(new Error('csv'));
    var deb = e2.loc + 30 + v.getUint16(e2.loc + 26, true) + v.getUint16(e2.loc + 28, true);
    var brut = u8.subarray(deb, deb + e2.taille);
    if (e2.meth === 0) return Promise.resolve(new TextDecoder().decode(brut));
    if (e2.meth !== 8 || typeof DecompressionStream === 'undefined') return Promise.reject(new Error('zip'));
    var flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(flux).text();
  }

  function lireFichier(f){
    return f.arrayBuffer().then(function(buf){
      var u8 = new Uint8Array(buf);
      if (u8[0] === 0x50 && u8[1] === 0x4b) return dezip(buf);
      return new TextDecoder().decode(u8);
    });
  }

  /* ── Name + Year → œuvres du site ─────────────────────────────────── */
  var INDEX = null;
  function index(){
    INDEX = INDEX || fetch('/films.json').then(function(r){ if (!r.ok) throw 0; return r.json(); });
    return INDEX;
  }
  function apparie(rows, idx){
    var tete = rows[0].map(function(x){ return x.trim().toLowerCase(); });
    var iN = tete.indexOf('name'), iY = tete.indexOf('year');
    var iD = tete.indexOf('watched date'); if (iD < 0) iD = tete.indexOf('date');
    if (iN < 0 || iY < 0) return null;
    var parTitre = {};
    idx.f.forEach(function(f){
      f[2].forEach(function(t){ (parTitre[t] = parTitre[t] || []).push(f); });
    });
    var vus = {}, lus = 0;
    rows.slice(1).forEach(function(r){
      if (!r[iN]) return;
      lus++;
      var y = +r[iY], cands = parTitre[norme(r[iN])] || [];
      var f = cands.filter(function(c){ return !y || !c[1] || Math.abs(c[1] - y) <= 1; })
        .sort(function(a, b){ return Math.abs(a[1] - y) - Math.abs(b[1] - y); })[0];
      if (!f) return;
      var d = /^\d{4}-\d{2}-\d{2}$/.test(r[iD] || '') ? r[iD] : '';
      var deja = vus[f[0]];
      if (!deja || (d && (!deja.d || d < deja.d))) vus[f[0]] = { f: f, d: d };
    });
    return { lus: lus, films: Object.keys(vus).map(function(k){ return vus[k]; }) };
  }

  /* ── la fenêtre ────────────────────────────────────────────────────── */
  var dlg = null, choix = [];
  function bati(){
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-labelledby', 'lb-t');
    dlg.innerHTML = '<div class="lb-h"><h2 id="lb-t"></h2><button type="button" class="lb-x" aria-label="">✕</button></div>' +
      '<p class="lb-a"></p><input type="file" accept=".zip,.csv,application/zip,text/csv" hidden>' +
      '<button type="button" class="lb-b lb-f"></button>' +
      '<div class="lb-s" hidden></div><div class="lb-e" hidden></div><div class="lb-l"></div>' +
      '<button type="button" class="lb-b lb-v" hidden></button>';
    dlg.querySelector('h2').textContent = T.titre;
    dlg.querySelector('.lb-x').setAttribute('aria-label', T.fermer);
    dlg.querySelector('.lb-a').textContent = T.aide;
    dlg.querySelector('.lb-f').textContent = T.choisir;
    document.body.appendChild(dlg);
    var champ = dlg.querySelector('input'), err = dlg.querySelector('.lb-e'), s = dlg.querySelector('.lb-s');
    var liste = dlg.querySelector('.lb-l'), v = dlg.querySelector('.lb-v');
    dlg.querySelector('.lb-x').addEventListener('click', function(){ dlg.close(); });
    dlg.querySelector('.lb-f').addEventListener('click', function(){ champ.click(); });
    function erreur(t){ err.textContent = t; err.hidden = false; s.hidden = true; }
    champ.addEventListener('change', function(){
      var f = champ.files && champ.files[0];
      champ.value = '';
      if (!f) return;
      err.hidden = true; liste.innerHTML = ''; v.hidden = true;
      s.textContent = T.lecture; s.hidden = false;
      Promise.all([lireFichier(f), index()]).then(function(r){
        var res = apparie(csv(r[0]), r[1]);
        if (!res) return erreur(T.pasCsv);
        montre(res, r[1]);
      }).catch(function(e){
        erreur(e && e.message === 'zip' ? T.pasZip : e && e.message === 'csv' ? T.pasCsv : T.pasIndex);
      });
    });
    v.addEventListener('click', function(){ ecris(); });
    dlg.addEventListener('change', function(ev){
      if (ev.target.closest && ev.target.closest('.lb-l')) compte();
    });
  }

  function compte(){
    var n = dlg.querySelectorAll('.lb-l input:checked:not([disabled])').length, v = dlg.querySelector('.lb-v');
    v.textContent = T.valider(n);
    v.hidden = !n;
  }

  function montre(res, idx){
    var s = dlg.querySelector('.lb-s'), liste = dlg.querySelector('.lb-l');
    if (!res.films.length) { s.textContent = T.rien(res.lus); return; }
    s.textContent = T.bilan(res.lus, res.films.length);
    // une ligne par œuvre du site, rangée par univers
    var parU = {}, ordre = Object.keys(CLES), progs = {};
    choix = [];
    res.films.forEach(function(x){
      x.f[3].forEach(function(p){
        var u = p[0];
        if (!CLES[u]) return;
        progs[u] = progs[u] || lis(CLES[u]);
        (parU[u] = parU[u] || []).push({ id: p[1], titre: FR ? x.f[4] : x.f[5], an: x.f[1], d: x.d, fait: !!progs[u][p[1]] });
      });
    });
    var h = '';
    ordre.forEach(function(u){
      if (!parU[u]) return;
      var c = (idx.u[u] || {}).c || '';
      h += '<div class="lb-g"' + (c ? ' style="--c:' + esc(c.trim()) + '"' : '') + '><h3>' +
        esc((idx.u[u] || {})[FR ? 'fr' : 'en'] || u) + '</h3>';
      parU[u].forEach(function(o){
        var i = choix.push({ u: u, id: o.id, d: o.d }) - 1;
        h += '<label' + (o.fait ? ' class="d"' : '') + '><input type="checkbox" data-i="' + i + '" checked' +
          (o.fait ? ' disabled' : '') + '> <span>' + esc(o.titre) + ' <small>' + esc(o.an || '') +
          (o.fait ? ' · ' + T.deja : '') + '</small></span></label>';
      });
      h += '</div>';
    });
    liste.innerHTML = h;
    compte();
  }

  function ecris(){
    var parU = {}, dates = {}, n = 0;
    [].forEach.call(dlg.querySelectorAll('.lb-l input:checked:not([disabled])'), function(c){
      var o = choix[+c.dataset.i];
      (parU[o.u] = parU[o.u] || []).push(o.id);
      if (o.d) dates[o.id] = o.d;
      n++;
    });
    var ok = true;
    Object.keys(parU).forEach(function(u){
      var p = lis(CLES[u]);
      parU[u].forEach(function(id){ p[id] = 1; });
      try { localStorage.setItem(CLES[u], JSON.stringify(p)); } catch (_) { ok = false; }
    });
    if (!ok) { var e = dlg.querySelector('.lb-e'); e.textContent = T.plein; e.hidden = false; return; }
    // le jour du visionnage, seulement là où la coche n'en avait pas
    var tous = window.CG_DATES ? window.CG_DATES() : {}, neufs = {};
    Object.keys(dates).forEach(function(id){ if (!tous[id]) neufs[id] = dates[id]; });
    if (window.CG_DATES && Object.keys(neufs).length) window.CG_DATES(neufs);
    var s = dlg.querySelector('.lb-s');
    s.textContent = T.fait(n);
    dlg.querySelector('.lb-v').hidden = true;
    setTimeout(function(){ location.reload(); }, 1200);
  }

  function ouvre(){
    if (!dlg) bati();
    index().catch(function(){ INDEX = null; });
    dlg.showModal();
  }

  function pose(){
    var act = document.querySelector('#sync .sy-act');
    if (!act || act.querySelector('#sy-lb')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sy-b alt';
    b.id = 'sy-lb';
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="3"/><circle cx="12" cy="12" r="3"/>' +
      '<circle cx="19" cy="12" r="3"/></svg><span></span>';
    b.querySelector('span').textContent = T.bouton;
    b.addEventListener('click', ouvre);
    var f = act.querySelector('input[type=file]');
    act.insertBefore(b, f || null);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LE VOTE POUR LA PROCHAINE LIGNE ═════════════════════════════════
   Posé le 13 novembre 2026 (n° 14 de la liste du 5 novembre). Un bouton à
   côté de « Suggérer une timeline », sur la case « Lignes en chantier » de
   l'accueil, ouvre la liste des candidats choisis par Niko.

   - **Le vote est un événement GoatCounter** (`vote-<clé>`), le compteur
     déjà présent sur le site : rien à héberger, rien de stocké chez nous.
     Un bloqueur de publicité qui coupe GoatCounter coupe aussi le vote, et
     la fenêtre ne prétend alors rien.
   - **Un vote par univers et par navigateur**, retenu dans `cg-votes`. On
     peut soutenir plusieurs candidats ; on ne peut pas retirer un vote,
     GoatCounter ne décompte pas.
   - **Les résultats sont publics**, choix de Niko : lus sur
     `/counter/vote-<clé>.json`, qui ne répond que si l'option « Allow adding
     visitor counts on your website » est cochée dans GoatCounter. Sans
     elle, la liste reste dans son ordre, sans chiffres, et rien ne casse.
   - **Les candidats se changent dans `CANDIDATS`** : la clé ne doit plus
     bouger une fois des votes reçus, c'est elle que GoatCounter compte.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var lock = document.querySelector('.slot.lock');
  if (!lock || !document.querySelector('.slot[data-u]')) return;
  var FR = document.documentElement.lang !== 'en';
  var GC = 'https://arcanerval.goatcounter.com';
  var CANDIDATS = [
    ['borderlands', 'Borderlands'], ['alien-predator', 'Alien / Predator'], ['zelda', 'The Legend of Zelda'],
    ['stargate', 'Stargate'], ['god-of-war', 'God of War'], ['gears-of-war', 'Gears of War'],
    ['mass-effect', 'Mass Effect'], ['dnd', FR ? 'Donjons & Dragons' : 'Dungeons & Dragons'],
    ['terminator', 'Terminator'], ['avatar-cameron', FR ? 'Avatar (les films de James Cameron)' : 'Avatar (James Cameron’s films)'],
    ['pokemon', 'Pokémon'], ['dragons', FR ? 'Dragons (How to Train Your Dragon)' : 'How to Train Your Dragon']
  ];
  var T = FR ? {
    bouton: 'Voter pour la prochaine ligne', titre: 'La prochaine ligne',
    aide: 'Quel univers aimeriez-vous voir arriver ? Votez pour autant de candidats que vous voulez, une fois chacun.',
    voter: 'Je vote', vote: 'Voté', fermer: 'Fermer',
    total: function(n){ return n + (n > 1 ? ' votes' : ' vote') + ' au total'; },
    sansRes: 'Les résultats paraîtront ici bientôt.',
    bloque: 'Votre navigateur bloque le compteur du site : ce vote n’a pas pu être envoyé.'
  } : {
    bouton: 'Vote for the next line', titre: 'The next line',
    aide: 'Which universe would you like to see next? Vote for as many candidates as you like, once each.',
    voter: 'Vote', vote: 'Voted', fermer: 'Close',
    total: function(n){ return n + (n > 1 ? ' votes' : ' vote') + ' in total'; },
    sansRes: 'Results will show up here soon.',
    bloque: 'Your browser blocks the site’s counter: this vote could not be sent.'
  };
  var CSS = [
    'dialog.vt{margin:auto;width:min(560px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;',
    'background:#131215;color:#fffdf7;border:2px solid var(--hot,#f0c97c);border-radius:3px;padding:20px;font:15px/1.5 \'Chivo\',sans-serif}',
    'dialog.vt::backdrop{background:rgba(4,4,10,.78)}',
    '.vt-h{display:flex;justify-content:space-between;align-items:center;gap:12px}',
    '.vt-h h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:28px;line-height:1;text-transform:uppercase}',
    '.vt-x{background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;width:32px;height:32px}',
    '.vt p{font-size:13.5px;color:rgba(255,253,247,.72);margin-top:6px}',
    '.vt ol{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}',
    '.vt li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;',
    'padding:8px 10px;background:#1c1b20;border-radius:3px}',
    '.vt li b{font-size:14.5px}',
    '.vt li .vt-g{grid-column:1;height:6px;background:rgba(255,253,247,.1)}',
    '.vt li .vt-g i{display:block;height:100%;background:var(--hot,#f0c97c)}',
    '.vt li small{grid-column:1;font-size:11.5px;color:rgba(255,253,247,.6)}',
    '.vt li button{grid-column:2;grid-row:1/span 3;font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    'font-size:13.5px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;padding:6px 14px;',
    'background:none;border:2px solid var(--hot,#f0c97c);color:var(--hot,#f0c97c)}',
    '.vt li button:hover{background:var(--hot,#f0c97c);color:#131215}',
    '.vt li button[disabled]{cursor:default;border-color:#81c784;color:#81c784;background:none}',
    '.vt-t{margin-top:12px;font-size:12.5px!important}.vt-e{color:#e5484d!important;font-weight:700}.vt [hidden]{display:none}'
  ].join('');

  function lis(){ try { return JSON.parse(localStorage.getItem('cg-votes') || '{}') || {}; } catch (_) { return {}; } }
  function garde(v){ try { localStorage.setItem('cg-votes', JSON.stringify(v)); } catch (_) {} }

  // le compteur public d'un événement ; null si l'option est fermée
  function compte(cle){
    return fetch(GC + '/counter/' + encodeURIComponent('vote-' + cle) + '.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ return j ? +String(j.count).replace(/[^\d]/g, '') || 0 : null; })
      .catch(function(){ return null; });
  }

  function envoie(c){
    var path = 'vote-' + c[0], titre = 'Vote : ' + c[1];
    if (window.goatcounter && goatcounter.count) {
      goatcounter.count({ path: path, title: titre, event: true });
      return true;
    }
    return false;
  }

  var dlg = null, RES = null;
  function dessine(){
    var v = lis(), ol = dlg.querySelector('ol'), tot = 0, max = 0;
    var liste = CANDIDATS.slice();
    if (RES) {
      liste.forEach(function(c){ var n = RES[c[0]] || 0; tot += n; if (n > max) max = n; });
      liste.sort(function(a, b){ return (RES[b[0]] || 0) - (RES[a[0]] || 0); });
    }
    ol.innerHTML = liste.map(function(c){
      var n = RES ? RES[c[0]] || 0 : null;
      return '<li><b></b>' +
        (RES ? '<span class="vt-g"><i style="width:' + (max ? Math.round(n / max * 100) : 0) + '%"></i></span>' +
               '<small>' + n + (tot ? ' · ' + Math.round(n / tot * 100) + ' %' : '') + '</small>' : '') +
        '<button type="button" data-v="' + c[0] + '"' + (v[c[0]] ? ' disabled' : '') + '>' +
        (v[c[0]] ? '✓ ' + T.vote : T.voter) + '</button></li>';
    }).join('');
    [].forEach.call(ol.querySelectorAll('li b'), function(b, i){ b.textContent = liste[i][1]; });
    var t = dlg.querySelector('.vt-t');
    t.textContent = RES ? T.total(tot) : T.sansRes;
  }

  function ouvre(){
    if (!dlg) {
      var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      dlg = document.createElement('dialog');
      dlg.className = 'vt';
      dlg.setAttribute('aria-labelledby', 'vt-t');
      dlg.innerHTML = '<div class="vt-h"><h2 id="vt-t"></h2><button type="button" class="vt-x">✕</button></div>' +
        '<p class="vt-a"></p><ol></ol><p class="vt-t"></p><p class="vt-e" hidden></p>';
      dlg.querySelector('h2').textContent = T.titre;
      dlg.querySelector('.vt-x').setAttribute('aria-label', T.fermer);
      dlg.querySelector('.vt-a').textContent = T.aide;
      dlg.querySelector('.vt-e').textContent = T.bloque;
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function(ev){
        if (ev.target === dlg || (ev.target.closest && ev.target.closest('.vt-x'))) return dlg.close();
        var b = ev.target.closest && ev.target.closest('button[data-v]');
        if (!b || b.disabled) return;
        var c = CANDIDATS.filter(function(x){ return x[0] === b.dataset.v; })[0];
        if (!c) return;
        if (!envoie(c)) { dlg.querySelector('.vt-e').hidden = false; return; }
        var v = lis(); v[c[0]] = 1; garde(v);
        if (RES) RES[c[0]] = (RES[c[0]] || 0) + 1;
        dessine();
      });
    }
    dessine();
    dlg.showModal();
    // les résultats, une fois par visite
    if (!RES) Promise.all(CANDIDATS.map(function(c){ return compte(c[0]); })).then(function(ns){
      if (ns.every(function(n){ return n === null; })) return;
      RES = {};
      CANDIDATS.forEach(function(c, i){ RES[c[0]] = ns[i] || 0; });
      // un vote de cette visite n'est peut-être pas encore compté par GoatCounter
      var v = lis();
      Object.keys(v).forEach(function(k){ if (RES[k] === 0) RES[k] = 1; });
      if (dlg.open) dessine();
    });
  }

  function pose(){
    var p = lock.querySelector('.sg-p');
    if (!p || p.querySelector('.sg-vote')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sg sg-vote';
    b.textContent = T.bouton;
    b.addEventListener('click', ouvre);
    p.appendChild(b);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LE RÉCAP DE L'ANNÉE ═════════════════════════════════════════════
   Posé le 13 novembre 2026 (n° 13 de la liste du 5 novembre). Il lit
   `cg-dates`, le jour de chaque coche depuis le 5 novembre 2026 (et le jour
   de visionnage Letterboxd pour un film importé), et `/recap.json`
   (`_proto/recap.mjs`) pour l'univers, la nature et la durée de chaque
   identifiant, seconds parcours compris.

   - **Une date ne compte que si la coche est encore là** : « Réinitialiser »
     vide la progression d'une page sans passer par `cg-dates`. On fait
     l'union de toutes les clés `cg-proto-*` du stockage, `-alt` comprises.
   - **Les ajouts du visiteur (`p-`) n'y sont pas** : ils n'ont ni univers
     ni durée connus du fichier.
   - **Sur l'accueil seulement** : une bande sous « Toutes vos timelines »,
     qui ne paraît que s'il y a une coche datée, et la fenêtre détaillée.
     L'image à partager est un canvas 1080 × 1350, le format portrait des
     réseaux, en aplats comme le reste du site.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (!document.querySelector('.slot[data-u]')) return;
  var FR = document.documentElement.lang !== 'en';
  var MOIS = FR ? ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
                : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var NAT = FR ? { f: ['film', 'films'], s: ['série', 'séries'], j: ['jeu', 'jeux'], l: ['lecture', 'lectures'], a: ['écoute', 'écoutes'], v: ['vidéo', 'vidéos'] }
               : { f: ['film', 'films'], s: ['series', 'series'], j: ['game', 'games'], l: ['read', 'reads'], a: ['listen', 'listens'], v: ['video', 'videos'] };
  var T = FR ? {
    titre: function(a){ return 'Votre année ' + a; },
    oeuvres: function(n){ return n > 1 ? 'œuvres terminées' : 'œuvre terminée'; },
    heures: 'heures', univers: function(n){ return n > 1 ? 'univers' : 'univers'; },
    voir: 'Voir mon récap', partager: 'Partager l’image', telecharger: 'Télécharger l’image', fermer: 'Fermer',
    parU: 'Par univers', parM: 'Mois par mois', parN: 'Par nature',
    premiere: 'Première', derniere: 'Dernière', record: function(m, n){ return 'Le mois le plus chargé : ' + m + ', ' + n + ' œuvre' + (n > 1 ? 's' : '') + '.'; },
    note: 'Compté depuis le 5 novembre 2026, le jour où les coches ont commencé à garder leur date. Les films importés de Letterboxd gardent leur date de visionnage.',
    image: 'MON ANNÉE', site: 'chronologeek.app', texte: function(a){ return 'Mon année ' + a + ' sur Chronologeek'; }
  } : {
    titre: function(a){ return 'Your ' + a + ' in review'; },
    oeuvres: function(n){ return n > 1 ? 'works completed' : 'work completed'; },
    heures: 'hours', univers: function(n){ return n > 1 ? 'universes' : 'universe'; },
    voir: 'See my recap', partager: 'Share the image', telecharger: 'Download the image', fermer: 'Close',
    parU: 'By universe', parM: 'Month by month', parN: 'By kind',
    premiere: 'First', derniere: 'Latest', record: function(m, n){ return 'Busiest month: ' + m + ', ' + n + ' work' + (n > 1 ? 's' : '') + '.'; },
    note: 'Counted since November 5, 2026, when checkmarks started keeping their date. Films imported from Letterboxd keep their watch date.',
    image: 'MY YEAR', site: 'chronologeek.app', texte: function(a){ return 'My ' + a + ' on Chronologeek'; }
  };

  var CSS = [
    '.rc{border-bottom:2px solid var(--paper)}',
    '.rc .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 26px;padding-top:22px;padding-bottom:22px;text-align:center}',
    '.rc h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:clamp(21px,2.6vw,28px);',
    '  letter-spacing:.02em;text-transform:uppercase;line-height:.95}',
    '.rc-n{display:flex;gap:18px;flex-wrap:wrap;justify-content:center}',
    '.rc-n span{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,253,247,.66)}',
    '.rc-n b{display:block;font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:30px;line-height:1;color:var(--hot);letter-spacing:.02em}',
    '.rc-b,.rcd-b{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:14.5px;letter-spacing:.07em;',
    '  text-transform:uppercase;cursor:pointer;padding:9px 20px;background:var(--hot);border:2px solid var(--hot);color:var(--ink)}',
    '.rc-b:hover,.rcd-b:hover{background:var(--paper);border-color:var(--paper)}',
    '.rcd-b.alt{background:none;color:var(--hot)}.rcd-b.alt:hover{background:var(--hot);color:var(--ink)}',
    'dialog.rcd{margin:auto;width:min(680px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;',
    '  background:#131215;color:#fffdf7;border:2px solid var(--hot,#f0c97c);border-radius:3px;padding:0;font:15px/1.5 \'Chivo\',sans-serif}',
    'dialog.rcd::backdrop{background:rgba(4,4,10,.78)}',
    '.rcd-f{height:8px;display:flex}.rcd-f i{flex:1}',
    '.rcd-in{padding:18px 20px 22px}',
    '.rcd-h{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}',
    '.rcd-h h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:34px;line-height:.95;text-transform:uppercase}',
    '.rcd-x{background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;width:32px;height:32px;flex:none}',
    '.rcd-ans{display:flex;gap:6px;margin-top:10px}.rcd-ans button{font:inherit;font-size:13px;font-weight:700;cursor:pointer;',
    '  padding:3px 10px;border-radius:3px;border:1px solid rgba(255,253,247,.34);background:none;color:inherit}',
    '.rcd-ans button[aria-pressed=true]{background:var(--hot,#f0c97c);border-color:var(--hot,#f0c97c);color:#131215}',
    '.rcd .rc-n{justify-content:flex-start;margin-top:16px;gap:26px}',
    '.rcd h3{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,253,247,.6);margin:20px 0 8px}',
    '.rcd-u{display:grid;grid-template-columns:minmax(0,9em) 1fr auto;gap:5px 10px;align-items:center;font-size:13.5px}',
    '.rcd-u i{display:block;height:12px;background:var(--c);min-width:3px}',
    '.rcd-u small{color:rgba(255,253,247,.6);font-size:12px;white-space:nowrap}',
    '.rcd-m{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:end;height:90px}',
    '.rcd-m div{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;gap:3px;font-size:10.5px;color:rgba(255,253,247,.6)}',
    '.rcd-m i{display:block;width:100%;background:var(--hot,#f0c97c);min-height:2px}',
    '.rcd-m b{font-size:11px;color:#fffdf7}',
    '.rcd-k{display:flex;flex-wrap:wrap;gap:6px}.rcd-k span{border:1px solid rgba(255,253,247,.34);border-radius:3px;padding:2px 9px;font-size:13px}',
    '.rcd-k b{color:var(--hot,#f0c97c)}',
    '.rcd-p{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rcd-p div{border-left:4px solid var(--c,#f0c97c);padding-left:9px;font-size:13.5px}',
    '.rcd-p small{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,253,247,.6)}',
    '.rcd-r{margin-top:14px;font-size:13.5px}.rcd-note{margin-top:14px;font-size:12px;color:rgba(255,253,247,.55)}',
    '.rcd-act{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.rcd [hidden]{display:none}',
    '@media(max-width:520px){.rcd-p{grid-template-columns:1fr}.rcd-h h2{font-size:28px}}'
  ].join('');

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function dec(s){ var t = document.createElement('textarea'); t.innerHTML = String(s || ''); return t.value; }
  function nb(n){ return FR ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ── ce qui est coché, toutes clés confondues ─────────────────────── */
  function coches(){
    var on = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!/^cg-proto-/.test(k) || /-mode$/.test(k)) continue;
        var v = JSON.parse(localStorage.getItem(k) || '{}');
        if (v && typeof v === 'object' && !Array.isArray(v)) Object.keys(v).forEach(function(id){ if (v[id]) on[id] = 1; });
      }
    } catch (_) {}
    return on;
  }
  function datees(){
    var d = window.CG_DATES ? window.CG_DATES() : {}, on = coches(), out = [];
    Object.keys(d).forEach(function(id){ if (on[id] && !/^p-/.test(id)) out.push({ id: id, d: d[id] }); });
    return out;
  }

  var DATA = null, TITRES = null;
  function donnees(){
    DATA = DATA || Promise.all([
      fetch('/recap.json').then(function(r){ if (!r.ok) throw 0; return r.json(); }),
      fetch('/search-' + (FR ? 'fr' : 'en') + '.json').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })
    ]).then(function(v){
      TITRES = {};
      ((v[1] && v[1].e) || []).forEach(function(x){ TITRES[x[2]] = dec(x[1]); });
      return v[0];
    });
    return DATA;
  }

  function bilan(rc, liste, an){
    var res = { an: an, n: 0, min: 0, u: {}, m: [0,0,0,0,0,0,0,0,0,0,0,0], k: {}, items: [] };
    liste.forEach(function(x){
      if (x.d.slice(0, 4) !== String(an)) return;
      var e = rc.e[x.id];
      if (!e) return;
      res.n++; res.min += e[2] || 0;
      var u = rc.u[e[0]];
      var bu = res.u[u[0]] = res.u[u[0]] || { nom: FR ? u[1] : u[2], c: u[3], n: 0, min: 0 };
      bu.n++; bu.min += e[2] || 0;
      res.m[+x.d.slice(5, 7) - 1]++;
      res.k[e[1]] = (res.k[e[1]] || 0) + 1;
      res.items.push({ d: x.d, titre: TITRES[x.id] || TITRES[e[3]] || x.id, c: u[3] });
    });
    res.items.sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
    res.liste = Object.keys(res.u).map(function(k){ return res.u[k]; })
      .sort(function(a, b){ return b.n - a.n || b.min - a.min; });
    return res;
  }
  function annees(liste){
    var a = {};
    liste.forEach(function(x){ a[x.d.slice(0, 4)] = 1; });
    return Object.keys(a).sort();
  }
  function hdur(min){ return Math.round(min / 60); }

  function chiffres(r){
    var h = hdur(r.min);
    return '<div class="rc-n"><span><b>' + nb(r.n) + '</b>' + T.oeuvres(r.n) + '</span>' +
      (h ? '<span><b>' + nb(h) + '</b>' + T.heures + '</span>' : '') +
      '<span><b>' + r.liste.length + '</b>' + T.univers(r.liste.length) + '</span></div>';
  }

  /* ── la fenêtre ────────────────────────────────────────────────────── */
  var dlg = null, courant = null, RC = null, LISTE = null;
  function fenetre(){
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'rcd';
    dlg.setAttribute('aria-labelledby', 'rcd-t');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function(ev){
      if (ev.target === dlg) return dlg.close();
      var b = ev.target.closest && ev.target.closest('button');
      if (!b) return;
      if (b.classList.contains('rcd-x')) dlg.close();
      else if (b.dataset.an) remplit(+b.dataset.an);
      else if (b.dataset.a) image(b.dataset.a);
    });
    return dlg;
  }

  function remplit(an){
    var r = courant = bilan(RC, LISTE, an), ans = annees(LISTE);
    var max = Math.max.apply(null, r.m) || 1, umax = r.liste.length ? r.liste[0].n : 1;
    var rec = r.m.indexOf(Math.max.apply(null, r.m));
    var peut = !!(navigator.canShare && window.File && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })) &&
               matchMedia('(pointer:coarse)').matches;
    var prem = r.items[0], der = r.items[r.items.length - 1];
    dlg.innerHTML =
      '<div class="rcd-f">' + RC.u.map(function(u){ return '<i style="background:' + esc(u[3]) + '"></i>'; }).join('') + '</div>' +
      '<div class="rcd-in"><div class="rcd-h"><h2 id="rcd-t">' + esc(T.titre(an)) + '</h2>' +
      '<button type="button" class="rcd-x" aria-label="' + esc(T.fermer) + '">✕</button></div>' +
      (ans.length > 1 ? '<div class="rcd-ans">' + ans.map(function(a){
        return '<button type="button" data-an="' + a + '" aria-pressed="' + (+a === an) + '">' + a + '</button>'; }).join('') + '</div>' : '') +
      chiffres(r) +
      '<h3>' + T.parU + '</h3><div class="rcd-u">' + r.liste.map(function(u){
        var h = hdur(u.min);
        return '<span>' + esc(u.nom) + '</span><i style="--c:' + esc(u.c) + ';width:' + Math.max(2, Math.round(u.n / umax * 100)) + '%"></i>' +
          '<small>' + u.n + (h ? ' · ' + h + ' h' : '') + '</small>';
      }).join('') + '</div>' +
      '<h3>' + T.parM + '</h3><div class="rcd-m">' + r.m.map(function(n, i){
        return '<div title="' + esc(MOIS[i]) + ' : ' + n + '">' + (n ? '<b>' + n + '</b>' : '') +
          '<i style="height:' + Math.round(n / max * 64) + 'px"></i>' + MOIS[i].charAt(0).toUpperCase() + '</div>';
      }).join('') + '</div>' +
      '<h3>' + T.parN + '</h3><div class="rcd-k">' + ['f', 's', 'j', 'l', 'a', 'v'].filter(function(k){ return r.k[k]; }).map(function(k){
        return '<span><b>' + r.k[k] + '</b> ' + NAT[k][r.k[k] > 1 ? 1 : 0] + '</span>'; }).join('') + '</div>' +
      (prem ? '<h3>' + T.premiere + ' · ' + T.derniere + '</h3><div class="rcd-p">' +
        '<div style="--c:' + esc(prem.c) + '"><small>' + esc(jour(prem.d)) + '</small>' + esc(prem.titre) + '</div>' +
        '<div style="--c:' + esc(der.c) + '"><small>' + esc(jour(der.d)) + '</small>' + esc(der.titre) + '</div></div>' : '') +
      (r.n > 1 ? '<p class="rcd-r">' + esc(T.record(MOIS[rec], r.m[rec])) + '</p>' : '') +
      '<div class="rcd-act">' + (peut ? '<button type="button" class="rcd-b" data-a="share">' + T.partager + '</button>' : '') +
      '<button type="button" class="rcd-b' + (peut ? ' alt' : '') + '" data-a="dl">' + T.telecharger + '</button></div>' +
      '<p class="rcd-note">' + esc(T.note) + '</p></div>';
  }
  function jour(d){
    var j = +d.slice(8, 10), m = MOIS[+d.slice(5, 7) - 1];
    return FR ? (j === 1 ? '1er' : j) + ' ' + m : m + ' ' + j;
  }

  /* ── l'image : 1080 × 1350, en aplats ─────────────────────────────── */
  function dessine(r){
    var D = '"Big Shoulders Display", sans-serif', C = 'Chivo, sans-serif';
    var att = document.fonts ? Promise.all([document.fonts.load('900 100px "Big Shoulders Display"'),
      document.fonts.load('800 30px "Big Shoulders Display"'), document.fonts.load('400 26px Chivo')]).catch(function(){}) : Promise.resolve();
    return att.then(function(){
      var W = 1080, H = 1350, cv = document.createElement('canvas'), x = cv.getContext('2d');
      cv.width = W; cv.height = H;
      var OR = '#f0c97c', PA = '#fffdf7', GR = 'rgba(255,253,247,.6)';
      x.fillStyle = '#131215'; x.fillRect(0, 0, W, H);
      var bw = W / RC.u.length;
      RC.u.forEach(function(u, i){ x.fillStyle = u[3]; x.fillRect(Math.floor(i * bw), 0, Math.ceil(bw), 16); });
      x.textBaseline = 'alphabetic';
      x.fillStyle = OR; x.font = '800 30px ' + D; x.letterSpacing = '8px';
      x.fillText('CHRONOLOGEEK', 72, 110);
      x.fillStyle = PA; x.font = '900 120px ' + D; x.letterSpacing = '2px';
      x.fillText(T.image, 68, 230);
      x.fillStyle = OR; x.font = '900 250px ' + D;
      x.fillText(String(r.an), 62, 450);
      // les trois chiffres
      var h = hdur(r.min), cases = [[nb(r.n), T.oeuvres(r.n)]];
      if (h) cases.push([nb(h), T.heures]);
      cases.push([String(r.liste.length), T.univers(r.liste.length)]);
      cases.forEach(function(c, i){
        var cx = 72 + i * 330;
        x.fillStyle = PA; x.font = '900 104px ' + D; x.letterSpacing = '1px'; x.fillText(c[0], cx, 600);
        x.fillStyle = GR; x.font = '700 24px ' + C; x.letterSpacing = '2px'; x.fillText(c[1].toUpperCase(), cx, 640);
      });
      // les univers, six au plus
      var top = r.liste.slice(0, 6), umax = top.length ? top[0].n : 1, y0 = 720;
      top.forEach(function(u, i){
        var y = y0 + i * 62;
        x.fillStyle = PA; x.font = '800 30px ' + D; x.letterSpacing = '2px';
        x.fillText(u.nom.toUpperCase().slice(0, 26), 72, y + 24);
        x.fillStyle = u.c; x.fillRect(470, y + 2, Math.max(8, Math.round((W - 470 - 150) * u.n / umax)), 26);
        x.fillStyle = OR; x.textAlign = 'right'; x.font = '900 34px ' + D; x.fillText(String(u.n), W - 72, y + 27);
        x.textAlign = 'left';
      });
      // les mois
      var mb = 1090, mh = 130, mmax = Math.max.apply(null, r.m) || 1, cw = (W - 144) / 12;
      r.m.forEach(function(n, i){
        var hh = Math.round(n / mmax * mh);
        x.fillStyle = n ? OR : 'rgba(255,253,247,.16)';
        x.fillRect(72 + i * cw + 6, mb + mh - Math.max(hh, 4), cw - 12, Math.max(hh, 4));
        x.fillStyle = GR; x.font = '700 22px ' + C; x.letterSpacing = '0px'; x.textAlign = 'center';
        x.fillText(MOIS[i].charAt(0).toUpperCase(), 72 + i * cw + cw / 2, mb + mh + 34);
        x.textAlign = 'left';
      });
      x.fillStyle = PA; x.font = '800 28px ' + D; x.letterSpacing = '6px'; x.textAlign = 'right';
      x.fillText(T.site.toUpperCase(), W - 72, H - 50);
      x.textAlign = 'left';
      return new Promise(function(res){ cv.toBlob(function(b){ res(b); }, 'image/png'); });
    });
  }
  function image(a){
    if (!courant) return;
    dessine(courant).then(function(blob){
      if (!blob) return;
      var f = new File([blob], 'chronologeek-' + courant.an + '.png', { type: 'image/png' });
      if (a === 'share' && navigator.share) {
        navigator.share({ files: [f], title: 'Chronologeek', text: T.texte(courant.an) + ' — ' + location.origin }).catch(function(){});
        return;
      }
      var l = document.createElement('a');
      l.href = URL.createObjectURL(blob);
      l.download = f.name;
      document.body.appendChild(l); l.click(); l.remove();
      setTimeout(function(){ URL.revokeObjectURL(l.href); }, 4000);
    });
  }

  /* ── la bande de l'accueil ─────────────────────────────────────────── */
  function pose(){
    LISTE = datees();
    if (!LISTE.length) return;
    donnees().then(function(rc){
      RC = rc;
      var ans = annees(LISTE), cette = String(new Date().getFullYear());
      var an = +(ans.indexOf(cette) > -1 ? cette : ans[ans.length - 1]);
      var r = bilan(rc, LISTE, an);
      if (!r.n) return;
      var st = document.createElement('style');
      st.textContent = CSS;
      document.head.appendChild(st);
      var sec = document.createElement('section');
      sec.className = 'rc';
      sec.id = 'recap';
      sec.innerHTML = '<div class="wrap"><h2>' + esc(T.titre(an)) + '</h2>' + chiffres(r) +
        '<button type="button" class="rc-b">' + esc(T.voir) + '</button></div>';
      sec.querySelector('.rc-b').addEventListener('click', function(){
        fenetre(); remplit(an); dlg.showModal();
      });
      // sous le duo « Les Dossiers » / « Toutes vos timelines », sur toute la largeur
      var sync = document.getElementById('sync');
      var ap = sync && (sync.closest('.duo') || sync);
      if (ap) ap.parentNode.insertBefore(sec, ap.nextSibling);
      else (document.getElementById('main') || document.body).appendChild(sec);
    }).catch(function(){});
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
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

/* ═══ LES SOURCES, AU BAS DU DÉPLIANT DES FILTRES ═════════════════════
   Posées le 21 septembre 2026, liste de Niko. Pas de nouveau dépliant :
   celui des filtres s'appelle désormais « Filtres, recherche, repères et
   sources », et elles viennent sous l'astuce du Maj + clic.

   Elles vivent ici plutôt que dans les données pour deux raisons : ce
   sont des noms propres, rien à traduire — sauf Wikipédia, qui prend son
   accent en français —, et une seule table sert les deux langues là où
   les `intro` en demanderaient vingt-deux copies. La clé est le nom de
   la route ; les protos (`e-starwars`, `en-twd`…) s'y ramènent. Une page
   absente de la table n'affiche rien. Une source sans lien reste du texte. */
(function(){
  var FR = document.documentElement.lang !== 'en';
  var WIKI = FR ? 'Wikipédia' : 'Wikipedia';
  var ABOE = ['A Bit of Everything', 'https://www.youtube.com/@AbitofEverything4U'];
  var BVG  = 'https://www.beyondvideogaming.com/en/timelines/';
  var SOURCES = {
    starwars: [['Wookieepedia', 'https://starwars.fandom.com/wiki/Timeline_of_canon_media#js'],
               [WIKI], ABOE, ['Reddit']],
    marvel: [['MCUTimeline.fr', 'https://mcutimeline.fr/'], [WIKI],
             ['Fandom', 'https://marvelcinematicuniverse.fandom.com/wiki/Chronological_Order'],
             ['Marvel.com', 'https://www.marvel.com/'], ['Reddit'], ABOE],
    dc: [[WIKI], ['Reddit'],
         ['Love thy Nerd', 'https://lovethynerd.com/arrowverse-the-definitive-watch-order/'],
         ['Arrowverse.info', 'https://arrowverse.info/'],
         ['Fandom', 'https://dcextendeduniverse.fandom.com/wiki/Timeline'], ABOE],
    avatar: [['Avatar', 'https://www.avatarstudiosofficial.com/timeline/'], ['Reddit'],
             ['Fandom', 'https://avatar.fandom.com/wiki/History_of_the_World_of_Avatar'],
             ['Avatar Almanac', 'https://avataralmanac.com/timeline-order/'],
             ['Avatar Timeline', 'https://avatartimeline.com/']],
    startrek: [['Memory Alpha', 'https://memory-alpha.fandom.com/wiki/Timeline'],
               ['ST Viewing Guide', 'https://startrekviewingguide.com/'], [WIKI], ['Reddit']],
    walkingdead: [['Fandom', 'https://walkingdead.fandom.com/wiki/TV_Series_Timeline'], ['Reddit'],
                  ['TimelineTWD', 'https://www.timelinetwd.com/']],
    dragonage: [['Fandom', 'https://dragonage.fandom.com/wiki/Timeline'],
                ['BVG', BVG + 'dragon-age-timeline-everything-in-chronological-order/'], ['Reddit']],
    assassinscreed: [['Reddit'],
                     ['BVG', BVG + 'assassins-creed-timeline-everything-in-chronological-order/'],
                     ['Fandom', 'https://assassinscreed.fandom.com/fr/wiki/Chronologie_compl%C3%A8te'],
                     [WIKI]],
    dcanimation: [['Fandom DCAMU', 'https://dcanimatedmovieuniverse.fandom.com/wiki/Timeline'], ['Reddit'],
                  ['Watchtower Database', 'https://www.youtube.com/@dcauwatchtower'], [WIKI],
                  ['DCAUTimeline', 'https://dcautimeline.tumblr.com/eras'],
                  ['Fandom Arkham', 'https://arkhamcity.fandom.com/wiki/Timeline'],
                  ['Fandom DCAU', 'https://dcau.fandom.com/wiki/Timeline']],
    jurassicworld: [['Fandom', 'https://jurassicpark.fandom.com/wiki/Timeline'], [WIKI], ['Reddit']],
    residentevil: [['Eklecty-City', 'https://www.eklecty-city.fr/jeux-video/resident-evil-requiem-chronologie-complete-histoire/'],
                   ['Fandom', 'https://residentevil.fandom.com/wiki/Prime_universe'],
                   ['RETimelineApp', 'https://residenteviltimelineapp.com/']],
    bladerunner: [['Fandom', 'https://bladerunner.fandom.com/wiki/Main_Page'],
                  ['DeviantArt', 'https://www.deviantart.com/morsoth/art/Timeline-Blade-Runner-1021386153']],
    monsterverse: [['Fandom', 'https://godzilla.fandom.com/wiki/MonsterVerse'], [WIKI], ['Reddit']],
    witcher: [['Fandom', 'https://witcher.fandom.com/wiki/Timeline'],
              ['Mina86', 'https://mina86.com/2022/witcher-chronological-order/'], ['Reddit'], [WIKI],
              ['BVG', BVG + 'the-witcher-timeline-everything-in-chronological-order/']],
    /* Le Dossier et le radar : `star-wars` finit les deux routes du Dossier,
       `a-venir` et `upcoming` sont les deux du radar. Ce dernier cite ce que
       `radar.py` lit vraiment, une source par univers suivi. */
    'star-wars': [['Wookieepedia', 'https://starwars.fandom.com/wiki/Timeline_of_canon_media#js']],
    'a-venir': [['TMDB', 'https://www.themoviedb.org/'],
                ['Wookieepedia', 'https://starwars.fandom.com/wiki/Timeline_of_canon_media#js'],
                ['Avatar Almanac', 'https://avataralmanac.com/'],
                ['Assassin’s Creed Wiki', 'https://assassinscreed.fandom.com/'],
                ['Witcher Wiki', 'https://witcher.fandom.com/'],
                ['Blade Runner Wiki', 'https://bladerunner.fandom.com/']]
  };
  SOURCES.upcoming = SOURCES['a-venir'];
  var PROTO = { twd: 'walkingdead', jurassic: 'jurassicworld', 'dossier-star-wars': 'star-wars' };

  function pose(){
    var route = (location.pathname.replace(/\/+$/, '').split('/').pop() || '')
                  .replace(/\.html$/, '').replace(/^en?-/, '')
                  /* les maquettes de refonte (`maquette-starwars-train`)
                     gardent les sources de leur page */
                  .replace(/^maquette-([a-z]+)-.*$/, '$1');
    var liste = SOURCES[PROTO[route] || route];
    var corps = document.querySelector('#sieve .filt-body') || document.getElementById('sieve')
             || document.querySelector('.sieve .filt-body');
    if (!liste || !corps || corps.querySelector('.src-h')) return;
    var p = document.createElement('p');
    p.className = 'src-h';
    p.style.cssText = 'margin:0;font-size:11.5px;line-height:1.6;text-align:center;' +
      'opacity:.62;letter-spacing:.02em';
    p.appendChild(document.createTextNode(FR ? 'Sources : ' : 'Sources: '));
    liste.forEach(function(s, i){
      if (i) p.appendChild(document.createTextNode(' · '));
      if (!s[1]) { p.appendChild(document.createTextNode(s[0])); return; }
      var a = document.createElement('a');
      a.href = s[1]; a.textContent = s[0];
      a.target = '_blank'; a.rel = 'noopener';
      a.style.cssText = 'color:inherit;text-decoration:underline;text-underline-offset:2px';
      p.appendChild(a);
    });
    var apres = corps.querySelector('.rng-h');
    if (apres) apres.after(p); else corps.appendChild(p);
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
      /* « Masquer les terminés » se règle pour tout le site (bloc des
         réglages), plus page par page. */
      if (b.id === 'hide-done') return;
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
  /* Le train est partout à la dernière case cochée — l'intro, la barre du
     bas, ce trait, « Reprendre » — et l'accueil doit dire la même chose.
     Il n'a que les coches sous la main, pas l'ordre des œuvres : la page
     lui laisse donc sa position, en part de la ligne, sous le nom de sa
     route (`cg-train`). Sans elle, l'accueil retombe sur le décompte. */
  function route(p){ return (p.split('/').pop() || '').replace(/\.html$/, '').replace(/^en?-/, ''); }
  function retient(){
    var cases = document.querySelectorAll('[data-id] [data-check]'), der = -1;
    for (var i = 0; i < cases.length; i++)
      if (cases[i].getAttribute('aria-checked') === 'true') der = i;
    try {
      var t = JSON.parse(localStorage.getItem('cg-train') || '{}');
      t[route(location.pathname)] = cases.length ? (der + 1) / cases.length : 0;
      localStorage.setItem('cg-train', JSON.stringify(t));
    } catch (e) {}
  }
  function pose(){
    retient();
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
    assassinscreed: { u: 'assassinscreed' },
    witcher:        { u: 'witcher' },
    bladerunner:    { u: 'bladerunner' },
    monsterverse:   { u: 'monsterverse' }
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
    /* L'encre de l'univers, éclaircie d'un quart : le rouge de Marvel tombait à
       4,48 de contraste sur le fond de l'encart, sous le 4,5 exigé. */
    '.nx{padding-top:34px;margin:0 auto;--nx-c:color-mix(in srgb,var(--uni) 75%,#fff)}',
    /* Centré et à la largeur de son contenu, comme la pastille du titre et la
       ligne « Mis à jour » : les encadrés de ces pages ne s'étirent pas d'un
       bord à l'autre, ils se posent au milieu. `max-width` le borne quand le
       titre est long. */
    '.nx-in{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;',
      'width:max-content;max-width:100%;margin-inline:auto;',
      'padding:11px 16px;border:1px solid rgba(255,255,255,.10);border-radius:3px;',
      'background:color-mix(in srgb,var(--uni) 9%,transparent);',
      'border-left:3px solid var(--uni);border-right:3px solid var(--uni)}',
    '.nx-lab{font-weight:700;font-size:11px;line-height:1;letter-spacing:.09em;',
      'text-transform:uppercase;color:var(--nx-c);flex:0 0 auto}',
    '.nx-t{font-weight:700;font-size:14.5px;flex:1 1 auto;min-width:0}',
    '.nx-ep{opacity:.72;font-weight:400}',
    '.nx-d{font-size:12.5px;opacity:.66;flex:0 0 auto}',
    /* Le compte à rebours est un signe, pas une phrase. Les deux derniers
       jours il devient un mot, et un mot ne tient pas dans la place d'un
       signe : il se resserre, comme au radar. */
    '.nx-cd{font-weight:900;font-size:15px;line-height:1;color:var(--nx-c);flex:0 0 auto;',
      'padding:5px 9px;border:1px solid color-mix(in srgb,var(--uni) 45%,transparent);',
      'border-radius:3px}',
    '.nx-cd.mot{font-size:11px;letter-spacing:.06em}',
    '.nx-a{flex:0 0 auto;font-size:12.5px;color:var(--nx-c);text-decoration:none;',
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
    if (!hote || !hote.parentNode || document.querySelector('.nx')) { CG_RES('nx', null); return; }

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var mot = jours <= 1;
    var cd  = jours <= 0 ? T.auj : jours === 1 ? T.dem : T.cd(jours);
    /* Une saison qui sort d'un bloc porte `e:0` : elle n'a pas de numéro
       d'épisode, et s'arrête à « S1 » comme sur « À venir ». Sans ce test,
       Blade Runner 2099 s'annonçait « S1E00 ». */
    var ep  = entree.ep ? 'S' + entree.ep.s +
      (entree.ep.e ? 'E' + String(entree.ep.e).replace(/^(\d)$/, '0$1') : '') : '';

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
    CG_RES('nx', box.getBoundingClientRect().height);
  }

  var route = (location.pathname.replace(/\/+$/, '').split('/').pop() || '')
                .replace(/\.html$/, '');
  var page = RADAR[route];
  if (!page) { CG_RES('nx', null); return; }

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
      if (!data || !data.length) { CG_RES('nx', null); return; }
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
      /* Rien à venir : la place se libère, et la fois suivante on n'en
         réserve plus. */
      if (!suite.length) { CG_RES('nx', 0); return; }
      suite.sort(function(a, b){ return iso(a) < iso(b) ? -1 : iso(a) > iso(b) ? 1 : 0; });

      var n = Math.round((new Date(iso(suite[0]) + 'T00:00:00') - jour) / 86400000);
      var faire = function(){ pose(suite[0], n); };
      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', faire);
      else faire();
    })
    .catch(function(){ CG_RES('nx', null); });
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
    if (!lien || !dek || document.querySelector('.fx')) { CG_RES('fx', null); return; }

    /* Seule la page du journal le montre : ailleurs, le flux n'est pas ce
       qu'on est venu chercher. On la reconnaît à son `#tag-t`, l'indicateur
       de fraîcheur que le JS remplit, et que personne d'autre ne porte. */
    if (!document.getElementById('tag-t')) { CG_RES('fx', null); return; }

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
    /* Même geste que l'agenda : la place réservée dans le `<head>` se rend
       au moment où la ligne s'insère, et sa hauteur réelle est retenue. */
    var pere = dek.parentNode;
    document.documentElement.classList.remove('res-fx');
    var avant = pere.getBoundingClientRect().height;
    pere.insertBefore(p, dek.nextSibling);
    CG_RES('fx', pere.getBoundingClientRect().height - avant);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LES SORTIES DANS SON AGENDA ══════════════════════════════════════
   Le radar se consultait, il s'abonne maintenant aussi. `radar.py` écrit
   chaque nuit un fichier iCalendar par langue et par univers dans
   `/agenda/` ; ce bloc ne fait que donner les trois façons de s'y abonner.

   Trois choses à savoir :
   - **`webcal://` pour Apple et Outlook, `cid=` pour Google.** Un lien
     `https://` vers un `.ics` le télécharge une fois — c'est un import, pas
     un abonnement, et les sorties suivantes n'arriveraient jamais.
   - **La langue de l'agenda est celle de la page**, donc la date aussi :
     sortie française d'un côté, américaine de l'autre, comme au radar.
   - **Les univers sont ceux que `radar.py` suit**, pas ceux du site. Un
     univers qui n'est pas au radar n'a pas de fichier.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';

  var UNIS = [
    ['',               FR ? 'Tous les univers' : 'All universes'],
    ['starwars',       'Star Wars'],
    ['marvel',         'Marvel'],
    ['dc',             'DC'],
    ['avatar',         'Avatar Legends'],
    ['startrek',       'Star Trek'],
    ['twd',            'The Walking Dead'],
    ['assassinscreed', 'Assassin’s Creed'],
    ['witcher',        'The Witcher'],
    ['bladerunner',    'Blade Runner'],
    ['monsterverse',   'Monsterverse']
  ];

  var T = FR ? {
    titre: 'Les sorties dans votre agenda',
    dek:   'Un abonnement, et chaque sortie datée arrive toute seule dans votre calendrier — épisodes compris, mis à jour chaque jour.',
    uni:   'Univers',
    apple: 'Apple · Outlook',
    goog:  'Google Agenda',
    copie: 'Copier l’adresse',
    ok:    'Adresse copiée'
  } : {
    titre: 'Releases in your calendar',
    dek:   'Subscribe once, and every dated release lands in your calendar on its own — episodes included, updated daily.',
    uni:   'Universe',
    apple: 'Apple · Outlook',
    goog:  'Google Calendar',
    copie: 'Copy address',
    ok:    'Address copied'
  };

  var CSS = [
    /* Centré, comme l'accroche au-dessus : le héros de la page l'est tout
       entier, et des boutons calés à gauche y avaient l'air tombés. */
    '.ag{margin-top:16px;display:flex;flex-wrap:wrap;align-items:center;',
    '  justify-content:center;gap:10px 12px}',
    '.ag-t{flex:1 1 100%;font-size:13.5px;line-height:1.5;color:rgba(255,253,247,.72)}',
    '.ag-t b{color:var(--paper);font-weight:700;margin-right:6px}',
    '.ag select{font:inherit;font-size:13px;background:var(--ink);color:var(--paper);',
    '  border:1px solid var(--line);padding:7px 10px;border-radius:0}',
    '.ag a,.ag button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:14px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;',
    '  padding:7px 14px;border:2px solid var(--hot);color:var(--hot);background:none;',
    '  text-decoration:none;display:inline-flex;align-items:center;gap:7px}',
    '.ag a:hover,.ag button:hover{background:var(--hot);color:var(--ink)}',
    '.ag svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2}',
    '.ag button.ok{border-color:#81c784;color:#81c784}',
    '.ag button.ok:hover{background:none}',
    '@media(max-width:560px){.ag select{flex:1 1 100%}.ag a,.ag button{flex:1 1 auto;justify-content:center}}'
  ].join('');

  function pose(){
    var dek = document.querySelector('.attract .dek');
    if (!dek || !document.getElementById('cal') || document.querySelector('.ag')) { CG_RES('ag', null); return; }

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var box = document.createElement('div');
    box.className = 'ag';
    box.id = 'agenda';
    box.innerHTML =
      '<p class="ag-t"><b></b><span></span></p>' +
      '<label class="skip" for="ag-u"></label><select id="ag-u"></select>' +
      '<a id="ag-a"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/></svg><span></span></a>' +
      '<a id="ag-g" target="_blank" rel="noopener"><span></span></a>' +
      '<button type="button" id="ag-c"><span></span></button>';
    var q = function(s){ return box.querySelector(s); };
    q('.ag-t b').textContent = T.titre;
    q('.ag-t span').textContent = T.dek;
    q('label').textContent = T.uni;
    q('#ag-a span').textContent = T.apple;
    q('#ag-g span').textContent = T.goog;
    q('#ag-c span').textContent = T.copie;
    var sel = q('#ag-u');
    UNIS.forEach(function(u){
      var o = document.createElement('option');
      o.value = u[0]; o.textContent = u[1];
      sel.appendChild(o);
    });

    function adresse(){
      return location.host + '/agenda/' + (FR ? 'fr' : 'en') +
             (sel.value ? '-' + sel.value : '') + '.ics';
    }
    function maj(){
      var w = 'webcal://' + adresse();
      q('#ag-a').href = w;
      q('#ag-g').href = 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(w);
      var b = q('#ag-c');
      b.classList.remove('ok');
      b.firstChild.textContent = T.copie;
    }
    sel.addEventListener('change', maj);
    q('#ag-c').addEventListener('click', function(){
      var b = this, url = 'https://' + adresse();
      var fait = function(){ b.classList.add('ok'); b.firstChild.textContent = T.ok; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(fait, function(){ prompt('', url); });
      else prompt('', url);
    });
    maj();

    var fx = document.querySelector('.fx');
    var ref = fx || dek;
    /* La place réservée se mesure par la différence de hauteur du héros :
       elle tient compte de la marge du bloc et de celle du texte au-dessus,
       que les deux se fusionnent ou non. Tout se fait dans la même tâche,
       donc sans rendu intermédiaire. */
    var pere = ref.parentNode;
    document.documentElement.classList.remove('res-ag');
    var avant = pere.getBoundingClientRect().height;
    pere.insertBefore(box, ref.nextSibling);
    CG_RES('ag', pere.getBoundingClientRect().height - avant);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ PARTAGER SA PROGRESSION ══════════════════════════════════════════
   Les courriers de Reddit disaient tous la même chose : « j'en suis là ».
   Une image la dit mieux qu'une phrase, et elle porte l'adresse du site
   là où on la poste. Un bouton de plus dans le panneau de la barre du
   bas, à côté d'Exporter, sur les douze timelines et le Dossier.

   **Tout est lu dans la page, rien n'est recalculé** : le décompte et le
   temps restant dans le HUD, que le `tally()` de chaque page tient déjà,
   le nom dans le h1, l'encre dans `--uni`, le fond dans la bannière de
   `.attract`. Deux calculs pourraient diverger, un seul ne le peut pas.

   Quatre choses à savoir :
   - **1200 × 630**, le format des aperçus de lien : Reddit, Discord,
     Bluesky et X le montrent sans le rogner.
   - **La bannière est sur le même domaine**, donc le canvas n'est pas
     « souillé » et `toBlob` répond. Une image d'un autre domaine le
     bloquerait sans un mot — d'où le fond uni si elle manque.
   - **Les polices sont attendues avant de dessiner.** `font-display:block`
     vaut pour le DOM, pas pour le canvas, qui écrirait dans la police de
     repli sans prévenir.
   - **`navigator.share` avec un fichier sur téléphone, un téléchargement
     ailleurs.** Windows et macOS portent l'API, mais leur feuille de
     partage n'envoie pas une image là où on la veut.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';

  var T = FR ? {
    btn:     'Partager',
    billet:  'Billet · Ma progression',
    ligne:   'Ligne',
    arrets:  'Arrêts',
    reste:   'Trajet restant',
    der:     'Dernier arrêt',
    depart:  'Premier départ',
    fini:    'Terminus',
    parcouru:'Parcouru',
    share:   'Partager l’image',
    dl:      'Télécharger',
    ferme:   'Fermer',
    texte: function(nom){ return 'Ma progression ' + nom + ' sur Chronologeek'; },
    alt:     'Aperçu de l’image à partager'
  } : {
    btn:     'Share',
    billet:  'Ticket · My progress',
    ligne:   'Line',
    arrets:  'Stops',
    reste:   'Time to go',
    der:     'Last stop',
    depart:  'First departure',
    fini:    'Terminus',
    parcouru:'Travelled',
    share:   'Share image',
    dl:      'Download',
    ferme:   'Close',
    texte: function(nom){ return 'My ' + nom + ' progress on Chronologeek'; },
    alt:     'Preview of the image to share'
  };

  var CSS = [
    /* `margin:auto` rappelé : les pages posent `*{margin:0}`, et un
       dialogue modal sans lui se colle en haut à gauche. */
    '.pg{margin:auto;padding:0;border:2px solid var(--uni,#f0c97c);background:#0d0b12;',
    '  color:#fffdf7;max-width:min(760px,calc(100vw - 32px));width:100%}',
    '.pg::backdrop{background:rgba(8,8,15,.82)}',
    '.pg img{display:block;width:100%;height:auto;aspect-ratio:1200/630;background:#08080f}',
    '.pg-act{display:flex;gap:10px;flex-wrap:wrap;padding:14px;justify-content:flex-end}',
    '.pg-act button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:14.5px;',
    '  letter-spacing:.07em;text-transform:uppercase;cursor:pointer;padding:8px 18px;',
    '  background:none;border:2px solid var(--uni,#f0c97c);color:var(--uni,#f0c97c)}',
    '.pg-act button.go{background:var(--uni,#f0c97c);color:#0d0b12}',
    '.pg-act button[hidden]{display:none}',
    '@media(max-width:480px){.pg-act button{flex:1 1 auto}}'
  ].join('');

  function texte(sel){
    var e = document.querySelector(sel);
    return e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function nomUnivers(){
    var h1 = document.querySelector('h1');
    if (!h1) return document.title;
    var nm = h1.querySelector('.nm');
    if (nm) return nm.textContent.trim();
    /* Le Dossier : « Dossier » puis « Star Wars » dans un span, sans espace
       entre les deux dans le DOM. */
    return Array.prototype.filter.call(h1.childNodes, function(n){
      return !(n.classList && (n.classList.contains('sub') || n.classList.contains('tag')));
    }).map(function(n){ return n.textContent.trim(); }).filter(Boolean).join(' ');
  }
  function derniere(){
    var c = document.querySelectorAll('[data-check][aria-checked="true"]');
    for (var i = c.length - 1; i >= 0; i--) {
      var row = c[i].closest('[data-id]');
      var t = row && row.querySelector('.bu-title');
      if (t) return t.textContent.replace(/\s+/g, ' ').trim();
    }
    return '';
  }
  /* Le fond : le décor du premier écran — `.ln-bg` sur les pages au plan
     de métro, les plans de `.attract` sur les autres. */
  function banniere(){
    var el = document.querySelectorAll('.ln-bg, .attract .plane, .attract');
    for (var i = 0; i < el.length; i++) {
      var m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el[i]).backgroundImage || '');
      if (m) return m[1];
    }
    return '';
  }
  function charge(src){
    return new Promise(function(ok){
      if (!src) return ok(null);
      var im = new Image();
      im.onload = function(){ ok(im); };
      im.onerror = function(){ ok(null); };
      im.src = src;
    });
  }
  /* Le code de ligne de la souche : celui du billet de la page quand elle
     en porte un (« SW », « MCU »), sinon les initiales du nom. */
  function codeLigne(nom){
    var s = document.querySelector('.t-stub span');
    if (s && s.textContent.trim()) return s.textContent.trim();
    var m = nom.replace(/^(the|le|la|les)\s+/i, '').split(/[\s:'’\-]+/).filter(Boolean);
    if (!m.length) return '';
    return (m.length > 1 ? m.slice(0, 3).map(function(w){ return w[0]; }).join('') : m[0].slice(0, 3)).toUpperCase();
  }
  // l'affiche de la ligne (bloc suivant) reprend ces quatre-là
  window.CG_CARTE = { nomUnivers: nomUnivers, banniere: banniere, charge: charge, codeLigne: codeLigne };
  /* Où commence chaque station, en fraction de la ligne : le nombre
     d'œuvres de chaque ère, tel que la page l'a rendu. */
  function stations(){
    var n = [], tot = 0, c = 0, out = [];
    Array.prototype.forEach.call(document.querySelectorAll('.era-sec'), function(s){
      var k = s.querySelectorAll('[data-id]').length; n.push(k); tot += k;
    });
    n.forEach(function(k){ if (tot) out.push(c / tot); c += k; });
    return out;
  }

  /* Réduit la taille jusqu'à ce que le texte tienne dans `max`. */
  function ajuste(ctx, txt, poids, taille, famille, max){
    do { ctx.font = poids + ' ' + taille + 'px ' + famille; taille -= 2; }
    while (ctx.measureText(txt).width > max && taille > 14);
  }
  function rond(x, px, py, w, h, r){
    x.beginPath();
    x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r);
    x.closePath();
  }
  var ENCRES = ['#4d9fff','#e23636','#f5c842','#7dd3fc','#b48cf2','#a8bf4f',
                '#e07b39','#d4a02c','#2dd4bf','#45c46b','#b0bec5','#dc0000','#ff5f1f','#d946ef'];

  /* Le billet : même papier, même souche encochée et même filet aux douze
     encres que les barres du bas (`cgBillet`). Souche à l'encre de
     l'univers avec son code de ligne et le parcouru ; à droite, le nom de
     la ligne, son plan avec le train, et trois cases comme sur un titre de
     transport. Tout est lu dans la page, rien n'est recalculé. */
  function dessine(){
    var W = 1200, H = 630;
    var uni = (getComputedStyle(document.body).getPropertyValue('--uni') ||
               getComputedStyle(document.documentElement).getPropertyValue('--uni') || '').trim() || '#f0c97c';
    var on = parseInt(texte('#k-on'), 10) || 0;
    var tot = parseInt(texte('#k-tot'), 10) || 0;
    var f = tot ? Math.min(1, on / tot) : 0, pct = Math.floor(f * 100);
    var temps = texte('#k-time');
    var nom = nomUnivers(), code = codeLigne(nom);
    var der = derniere(), fini = tot && on >= tot;
    var D = '"Big Shoulders Display", sans-serif', C = 'Chivo, sans-serif';
    var PAPIER = '#fffdf7', ENCRE = '#0d0b12', GRIS = '#6b6480', TRAIT = '#e3ddd0';

    return Promise.all([
      charge(banniere()),
      document.fonts ? Promise.all([
        document.fonts.load('900 100px "Big Shoulders Display"'),
        document.fonts.load('800 30px "Big Shoulders Display"'),
        document.fonts.load('400 26px Chivo')
      ]).catch(function(){}) : null
    ]).then(function(r){
      var img = r[0];
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var x = cv.getContext('2d');

      /* le décor, voilé */
      x.fillStyle = '#08080f';
      x.fillRect(0, 0, W, H);
      if (img) {
        var s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        var iw = img.naturalWidth * s, ih = img.naturalHeight * s;
        x.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      }
      x.fillStyle = 'rgba(8,8,15,.66)';
      x.fillRect(0, 0, W, H);

      /* le billet, dessiné à part pour y percer les encoches */
      var TX = 70, TY = 70, TW = 1060, TH = 480, ST = 250, R = 22;
      var tk = document.createElement('canvas');
      tk.width = W; tk.height = H;
      var t = tk.getContext('2d');
      t.save();
      rond(t, TX, TY, TW, TH, R); t.clip();
      t.fillStyle = PAPIER; t.fillRect(TX, TY, TW, TH);
      t.fillStyle = uni; t.fillRect(TX, TY, ST, TH);
      var fl = (TW - ST) / ENCRES.length;
      ENCRES.forEach(function(c, i){ t.fillStyle = c; t.fillRect(TX + ST + i * fl, TY, fl + 1, 10); });
      t.restore();
      t.strokeStyle = 'rgba(13,11,18,.4)'; t.lineWidth = 3; t.setLineDash([10, 9]);
      t.beginPath(); t.moveTo(TX + ST, TY + 30); t.lineTo(TX + ST, TY + TH - 30); t.stroke();
      t.setLineDash([]);
      t.globalCompositeOperation = 'destination-out';
      [TY, TY + TH].forEach(function(cy){ t.beginPath(); t.arc(TX + ST, cy, 22, 0, 2 * Math.PI); t.fill(); });
      t.globalCompositeOperation = 'source-over';
      x.save();
      x.shadowColor = '#000'; x.shadowOffsetX = 10; x.shadowOffsetY = 10;
      x.drawImage(tk, 0, 0);
      x.restore();

      /* la souche */
      var cx = TX + ST / 2;
      x.textAlign = 'center';
      x.fillStyle = ENCRE;
      x.font = '800 22px ' + D; x.letterSpacing = '5px';
      x.fillText(T.ligne.toUpperCase(), cx + 2, TY + 78);
      x.letterSpacing = '0px';
      ajuste(x, code, 900, 118, D, ST - 44);
      x.fillText(code, cx, TY + 200);
      x.font = '800 20px ' + D; x.letterSpacing = '4px';
      x.fillText(T.parcouru.toUpperCase(), cx + 2, TY + TH - 132);
      x.letterSpacing = '0px';
      x.font = '900 76px ' + D;
      x.fillText(pct + ' %', cx, TY + TH - 60);

      /* le corps */
      var X0 = TX + ST + 50, XR = TX + TW - 50, LW = XR - X0;
      x.textAlign = 'left';
      x.fillStyle = GRIS;
      x.font = '800 21px ' + D; x.letterSpacing = '4px';
      x.fillText(T.billet.toUpperCase(), X0, TY + 64);
      x.letterSpacing = '0px';
      x.fillStyle = ENCRE;
      ajuste(x, nom.toUpperCase(), 900, 88, D, LW);
      x.fillText(nom.toUpperCase(), X0, TY + 148);

      /* le plan de la ligne, et le train */
      var LY = TY + 206;
      x.lineCap = 'round';
      x.lineWidth = 12; x.strokeStyle = TRAIT;
      x.beginPath(); x.moveTo(X0, LY); x.lineTo(XR, LY); x.stroke();
      if (f > 0) {
        x.strokeStyle = uni;
        x.beginPath(); x.moveTo(X0, LY); x.lineTo(X0 + LW * f, LY); x.stroke();
      }
      /* une station trop près de la précédente ne se dessine pas : des ères
         très inégales (Star Trek) les empilaient en fin de ligne */
      var prec = -99;
      stations().forEach(function(p){
        var px = X0 + LW * p, passe = p <= f && f > 0;
        if (px - prec < 30 || XR - px < 30) return;
        prec = px;
        x.beginPath(); x.arc(px, LY, 11, 0, 2 * Math.PI);
        x.fillStyle = passe ? uni : PAPIER; x.fill();
        x.lineWidth = 4; x.strokeStyle = ENCRE; x.stroke();
      });
      x.fillStyle = fini ? uni : PAPIER; x.lineWidth = 4; x.strokeStyle = ENCRE;
      rond(x, XR - 12, LY - 12, 24, 24, 5); x.fill(); x.stroke();
      var tx = Math.max(X0 + 22, Math.min(XR - 22, X0 + LW * f));
      x.save();
      x.fillStyle = '#f0c97c'; rond(x, tx - 24, LY - 14, 48, 28, 11); x.fill();
      x.restore();
      x.lineWidth = 3; x.strokeStyle = ENCRE; rond(x, tx - 24, LY - 14, 48, 28, 11); x.stroke();
      x.fillStyle = ENCRE;
      [-13, -3, 7].forEach(function(dx){ x.fillRect(tx + dx, LY - 6, 7, 7); });

      /* les trois cases */
      var FY = TY + 282, cases = [
        [T.arrets, on + ' / ' + tot, 180],
        [T.reste, fini ? '0 h' : (temps || '—'), 220],
        [fini ? T.fini : (der ? T.der : T.depart), fini ? nom : (der || '—'), LW - 400]
      ], cxs = X0;
      cases.forEach(function(c, i){
        x.fillStyle = GRIS; x.font = '800 18px ' + D; x.letterSpacing = '3px';
        x.fillText(c[0].toUpperCase(), cxs, FY);
        x.letterSpacing = '0px';
        x.fillStyle = ENCRE;
        if (i < 2) x.font = '900 44px ' + D;
        else ajuste(x, c[1].toUpperCase(), 800, 34, D, c[2]);
        x.fillText(i < 2 ? c[1] : c[1].toUpperCase(), cxs, FY + 46);
        cxs += c[2];
      });

      /* le pied : un filet, l'adresse, la marque et un code-barres */
      x.strokeStyle = TRAIT; x.lineWidth = 2; x.setLineDash([8, 7]);
      x.beginPath(); x.moveTo(X0, TY + 364); x.lineTo(XR, TY + 364); x.stroke();
      x.setLineDash([]);
      x.fillStyle = GRIS; x.font = '400 20px ' + C;
      x.fillText(location.host.replace(/^www\./, '') + location.pathname.replace(/\.html$/, ''), X0, TY + TH - 84);
      x.fillStyle = ENCRE;
      x.font = '900 34px ' + D; x.letterSpacing = '2px';
      x.fillText('CHRONOLOGEEK', X0, TY + TH - 42);
      x.letterSpacing = '0px';
      var h = 0, bx = XR - 250, u = location.pathname + nom;
      for (var k = 0; k < u.length; k++) h = (h * 31 + u.charCodeAt(k)) >>> 0;
      while (bx < XR) {
        h = (h * 1103515245 + 12345) >>> 0;
        var bw = 2 + (h >>> 28) % 4;
        x.fillRect(bx, TY + TH - 100, Math.min(bw, XR - bx), 64);
        bx += bw + 2 + (h >>> 24) % 3;
      }

      /* timeline terminée : le tampon */
      if (fini) {
        x.save();
        x.translate(XR - 170, TY + 300); x.rotate(-0.16);
        x.strokeStyle = uni; x.fillStyle = uni; x.lineWidth = 5; x.globalAlpha = .9;
        rond(x, -130, -44, 260, 76, 10); x.stroke();
        x.textAlign = 'center'; x.font = '900 46px ' + D; x.letterSpacing = '4px';
        x.fillText(T.fini.toUpperCase(), 0, 14);
        x.restore();
      }

      return new Promise(function(ok){ cv.toBlob(ok, 'image/png'); });
    }).then(function(blob){ return { blob: blob, nom: nom }; });
  }

  var dlg = null, courant = null;
  function dialogue(){
    if (dlg) return dlg;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.className = 'pg';
    dlg.innerHTML = '<img alt=""/><div class="pg-act">' +
      '<button type="button" class="go" data-a="share" hidden></button>' +
      '<button type="button" data-a="dl"></button>' +
      '<button type="button" data-a="x"></button></div>';
    dlg.querySelector('img').alt = T.alt;
    dlg.querySelector('[data-a="share"]').textContent = T.share;
    dlg.querySelector('[data-a="dl"]').textContent = T.dl;
    dlg.querySelector('[data-a="x"]').textContent = T.ferme;
    dlg.addEventListener('click', function(e){
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (e.target === dlg || a === 'x') return dlg.close();
      if (!courant) return;
      if (a === 'dl') {
        var l = document.createElement('a');
        l.href = URL.createObjectURL(courant.blob);
        l.download = courant.fichier.name;
        document.body.appendChild(l); l.click(); l.remove();
      }
      if (a === 'share') {
        navigator.share({ files: [courant.fichier], title: 'Chronologeek',
                          text: T.texte(courant.nom) + ' — ' + location.origin + location.pathname.replace(/\.html$/, '') })
          .catch(function(){});
      }
    });
    dlg.addEventListener('close', function(){
      var im = dlg.querySelector('img');
      if (im.src) URL.revokeObjectURL(im.src);
      im.removeAttribute('src');
    });
    document.body.appendChild(dlg);
    return dlg;
  }

  function ouvre(){
    var d = dialogue();
    dessine().then(function(r){
      if (!r.blob) return;
      var slug = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'chronologeek').replace(/\.html$/, '');
      var f = new File([r.blob], 'chronologeek-' + slug + '.png', { type: 'image/png' });
      courant = { blob: r.blob, fichier: f, nom: r.nom };
      d.querySelector('img').src = URL.createObjectURL(r.blob);
      var peut = !!(navigator.canShare && navigator.canShare({ files: [f] })) &&
                 matchMedia('(pointer:coarse)').matches;
      d.querySelector('[data-a="share"]').hidden = !peut;
      if (!d.open) d.showModal();
    });
  }

  function pose(){
    var ex = document.getElementById('export');
    if (!ex || !document.getElementById('k-on') || document.getElementById('share-prog')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = ex.className;
    b.id = 'share-prog';
    b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg> ';
    b.appendChild(document.createTextNode(T.btn));
    b.addEventListener('click', ouvre);
    var badges = document.getElementById('badges-btn');
    var apres = badges || document.getElementById('import') || ex;
    apres.parentNode.insertBefore(b, apres.nextSibling);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ L'AFFICHE DE LA LIGNE ═════════════════════════════════════════════
   Posée le 14 novembre 2026 (n° 8 de la liste du 5 novembre) : la ligne
   entière en grand format, chaque arrêt coché ou non, à télécharger ou à
   imprimer. Le bouton « Affiche » se pose à côté de « Partager », dans le
   panneau de la barre du bas des treize timelines et du Dossier.

   - **Tout se relit dans la page**, comme la carte de partage : les
     stations (`.era-sec`, leur nom et leur encre `--era`), les colonnes
     des réseaux (`.col`, nom `.col-t`, encre `--br`), chaque arrêt
     (`.bu[data-id]`, son titre, sa case). Le parcours affiché est celui
     de l'affiche, et rien n'est recalculé.
   - **Le format suit la ligne** : 2 400 px de large, une à six colonnes,
     choisies pour approcher le format A (largeur × √2). Au-delà de six
     colonnes pleines l'affiche s'allonge — le Dossier et ses 550 lectures.
   - **Un titre qui se répète** (« Star Trek: The Next Generation » trente
     fois) reçoit son premier sous-titre (« Saison 1 Épisodes 1-10 »).
   - **En JPEG à 92** : une photo d'en-tête et 2 400 px de large pèsent
     plusieurs mégaoctets en PNG pour rien de plus à l'impression.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var FR = document.documentElement.lang !== 'en';
  var MOIS = FR ? ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
                : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var T = FR ? {
    btn: 'Affiche', dl: 'Télécharger', share: 'Partager', ferme: 'Fermer', alt: 'Affiche de votre ligne',
    ma: 'Ma ligne', arrets: 'arrêts terminés', fini: 'Ligne terminée',
    edite: function(d){ return 'Édité le ' + (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); },
    texte: function(n){ return 'Ma ligne ' + n + ' sur Chronologeek'; }, prep: 'Préparation de l’affiche…'
  } : {
    btn: 'Poster', dl: 'Download', share: 'Share', ferme: 'Close', alt: 'Poster of your line',
    ma: 'My line', arrets: 'stops completed', fini: 'Line completed',
    edite: function(d){ return 'Printed ' + MOIS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); },
    texte: function(n){ return 'My ' + n + ' line on Chronologeek'; }, prep: 'Preparing the poster…'
  };
  var CSS = [
    '.af{margin:auto;padding:0;border:2px solid var(--uni,#f0c97c);background:#131215;color:#fffdf7;',
    '  max-width:min(620px,calc(100vw - 32px));width:100%;max-height:calc(100dvh - 32px);display:flex;flex-direction:column}',
    '.af:not([open]){display:none}',
    '.af::backdrop{background:rgba(8,8,15,.82)}',
    '.af-v{overflow:auto;flex:1 1 auto;min-height:0;background:#08080f}',
    '.af-v img{display:block;width:100%;height:auto}',
    '.af-v p{padding:40px 20px;text-align:center;color:rgba(255,253,247,.66)}',
    '.af-act{display:flex;gap:10px;flex-wrap:wrap;padding:14px;justify-content:flex-end}',
    '.af-act button{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:14.5px;',
    '  letter-spacing:.07em;text-transform:uppercase;cursor:pointer;padding:8px 18px;',
    '  background:none;border:2px solid var(--uni,#f0c97c);color:var(--uni,#f0c97c)}',
    '.af-act button.go{background:var(--uni,#f0c97c);color:#131215}',
    '.af-act button[hidden],.af [hidden]{display:none}'
  ].join('');

  function txt(e){ return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function encre(el, v){ var c = getComputedStyle(el).getPropertyValue(v).trim(); return c || ''; }

  /* ── ce que porte la ligne, dans l'ordre de la page ─────────────────── */
  function releve(){
    var uni = encre(document.body, '--uni') || '#f0c97c';
    var vus = {}, out = [];
    [].forEach.call(document.querySelectorAll('#timeline .bu[data-id]'), function(b){
      var t = txt(b.querySelector('.bu-title')); vus[t] = (vus[t] || 0) + 1;
    });
    function arret(b){
      var t = txt(b.querySelector('.bu-title'));
      var s = vus[t] > 1 ? txt(b.querySelector('.bu-sub .si')) : '';
      var c = b.querySelector('[data-check]');
      return { t: 'bu', titre: t, sub: s, fait: !!c && c.getAttribute('aria-checked') === 'true' };
    }
    [].forEach.call(document.querySelectorAll('#timeline .era-sec'), function(sec){
      var rows = sec.querySelectorAll('.bu[data-id]');
      if (!rows.length) return;
      var fa = 0; [].forEach.call(rows, function(b){ var c = b.querySelector('[data-check]'); if (c && c.getAttribute('aria-checked') === 'true') fa++; });
      out.push({ t: 'st', nom: txt(sec.querySelector('.stn-nm')), c: encre(sec, '--era') || uni, n: rows.length, f: fa });
      var cols = sec.querySelectorAll('.col');
      if (cols.length) {
        [].forEach.call(cols, function(col){
          var r = col.querySelectorAll('.bu[data-id]');
          if (!r.length) return;
          out.push({ t: 'col', nom: txt(col.querySelector('.col-t')), code: col.getAttribute('data-code') || '', c: encre(col, '--br') || uni });
          [].forEach.call(r, function(b){ out.push(arret(b)); });
        });
      } else [].forEach.call(rows, function(b){ out.push(arret(b)); });
    });
    return { uni: uni, lignes: out };
  }

  /* ── la mise en colonnes ──────────────────────────────────────────── */
  var W = 2400, M = 110, G = 64, HAUT = 860, BAS = 210, PAPIER = 2400 * Math.SQRT2;
  var POIDS = { st: 1.7, col: 1.25, bu: 1 };
  function colonnes(lignes){
    var tot = lignes.reduce(function(s, l){ return s + POIDS[l.t]; }, 0);
    var corps = PAPIER - HAUT - BAS, C = Math.max(1, Math.min(6, Math.ceil(tot / (corps / 46))));
    var parCol = tot / C, rowH = Math.max(46, Math.min(74, corps / parCol));
    var cols = [[]], acc = 0;
    lignes.forEach(function(l, i){
      // une station ne finit jamais une colonne : elle passe à la suivante avec ses arrêts
      var seuil = parCol * cols.length;
      if (acc + POIDS[l.t] > seuil + .01 && cols.length < C && cols[cols.length - 1].length) cols.push([]);
      if (l.t !== 'bu' && cols.length < C && acc + POIDS[l.t] + 2 > seuil && cols[cols.length - 1].length) cols.push([]);
      cols[cols.length - 1].push(l); acc += POIDS[l.t];
    });
    var haut = Math.max.apply(null, cols.map(function(c){ return c.reduce(function(s, l){ return s + POIDS[l.t]; }, 0); }));
    return { cols: cols, C: C, rowH: rowH, H: Math.round(Math.max(PAPIER, HAUT + BAS + haut * rowH + 40)) };
  }

  function rogne(x, s, w){
    if (x.measureText(s).width <= w) return s;
    while (s.length > 1 && x.measureText(s + '…').width > w) s = s.slice(0, -1);
    return s.trim() + '…';
  }
  function cover(x, im, dx, dy, dw, dh){
    var r = Math.max(dw / im.width, dh / im.height), sw = dw / r, sh = dh / r;
    x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, dx, dy, dw, dh);
  }

  function dessine(){
    var C0 = window.CG_CARTE || {};
    var D = '"Big Shoulders Display", sans-serif';
    var R = releve(), L = colonnes(R.lignes), H = L.H, rowH = L.rowH;
    var nom = C0.nomUnivers ? C0.nomUnivers() : document.title, code = C0.codeLigne ? C0.codeLigne(nom) : '';
    // le bouton enfoncé de la bascule sous le plan (`.par`, `.ln-go`) ; rien sur une page à un seul parcours
    var par = document.querySelector('.par [aria-pressed="true"], .ln-go [aria-pressed="true"]');
    var parcours = par ? txt(par) : '';
    var arrets = R.lignes.filter(function(l){ return l.t === 'bu'; }), fait = arrets.filter(function(l){ return l.fait; }).length;
    var PREFIXE = new RegExp('^' + nom.replace(/^Dossier\s+/i, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*', 'i');
    var polices = document.fonts ? Promise.all([document.fonts.load('900 100px "Big Shoulders Display"'),
      document.fonts.load('700 40px "Big Shoulders Display"')]).catch(function(){}) : Promise.resolve();
    return Promise.all([polices, C0.charge ? C0.charge(C0.banniere()) : Promise.resolve(null)]).then(function(v){
      var im = v[1], cv = document.createElement('canvas'), x = cv.getContext('2d');
      cv.width = W; cv.height = H;
      var OR = '#f0c97c', PA = '#fffdf7', INK = '#131215', uni = R.uni;
      x.fillStyle = INK; x.fillRect(0, 0, W, H);

      // l'en-tête : le décor du premier écran sous un voile uni
      if (im) { cover(x, im, 0, 0, W, HAUT); x.fillStyle = 'rgba(19,18,21,.74)'; x.fillRect(0, 0, W, HAUT); }
      x.fillStyle = uni; x.fillRect(0, 0, W, 18);
      x.fillStyle = PA; x.fillRect(0, HAUT - 6, W, 6);
      x.textBaseline = 'alphabetic';
      if (code) {
        x.font = '900 58px ' + D; var cw = x.measureText(code).width + 48;
        x.fillStyle = uni; x.fillRect(M, 120, cw, 84);
        x.fillStyle = INK; x.fillText(code, M + 24, 184);
        x.fillStyle = OR; x.font = '800 44px ' + D; x.letterSpacing = '10px';
        x.fillText(T.ma.toUpperCase(), M + cw + 34, 180); x.letterSpacing = '0px';
      }
      // le parcours choisi : « Je découvre », « Ordre de sortie »… ou la ligne choisie chez DC
      if (parcours) {
        x.font = '800 44px ' + D; x.letterSpacing = '6px';
        var pw = x.measureText(parcours.toUpperCase()).width + 56;
        x.strokeStyle = uni; x.lineWidth = 5; x.strokeRect(W - M - pw, 122, pw, 80);
        x.fillStyle = PA; x.textAlign = 'right'; x.fillText(parcours.toUpperCase(), W - M - 28, 178);
        x.textAlign = 'left'; x.letterSpacing = '0px';
      }
      var taille = 230; x.font = '900 ' + taille + 'px ' + D;
      while (x.measureText(nom.toUpperCase()).width > W - 2 * M && taille > 90) { taille -= 8; x.font = '900 ' + taille + 'px ' + D; }
      x.fillStyle = PA; x.fillText(nom.toUpperCase(), M, 220 + taille * .9);
      x.fillStyle = OR; x.font = '900 150px ' + D;
      var chiffre = fait + ' / ' + arrets.length; x.fillText(chiffre, M, HAUT - 90);
      var cx0 = M + x.measureText(chiffre).width + 40;
      x.fillStyle = 'rgba(255,253,247,.72)'; x.font = '800 46px ' + D; x.letterSpacing = '6px';
      x.fillText(T.arrets.toUpperCase(), cx0, HAUT - 140);
      x.fillText(Math.round(arrets.length ? fait / arrets.length * 100 : 0) + ' %', cx0, HAUT - 90);
      x.letterSpacing = '0px';
      if (arrets.length && fait === arrets.length) {
        x.save(); x.translate(W - M - 300, HAUT - 200); x.rotate(-.14);
        x.strokeStyle = '#e5484d'; x.fillStyle = '#e5484d'; x.lineWidth = 8;
        x.strokeRect(-280, -70, 560, 120); x.textAlign = 'center'; x.font = '900 72px ' + D; x.letterSpacing = '6px';
        x.fillText(T.fini.toUpperCase(), 0, 16); x.restore(); x.letterSpacing = '0px';
      }

      // les colonnes
      var cwid = (W - 2 * M - (L.C - 1) * G) / L.C, y0 = HAUT + 70;
      L.cols.forEach(function(col, ci){
        var cx = M + ci * (cwid + G), y = y0, rail = cx + rowH * .45, pts = [];
        col.forEach(function(l){
          var h = rowH * POIDS[l.t];
          if (l.t === 'st') {
            x.fillStyle = l.c; x.fillRect(cx, y + h * .12, cwid, h * .8);
            x.fillStyle = PA; x.font = '900 ' + Math.round(rowH * .62) + 'px ' + D;
            var cpt = l.f + ' / ' + l.n, wc = x.measureText(cpt).width;
            x.fillText(rogne(x, l.nom.toUpperCase(), cwid - wc - 70), cx + 22, y + h * .12 + h * .8 * .7);
            x.textAlign = 'right'; x.fillText(cpt, cx + cwid - 22, y + h * .12 + h * .8 * .7); x.textAlign = 'left';
            pts.push(null);
          } else if (l.t === 'col') {
            x.fillStyle = l.c; x.font = '900 ' + Math.round(rowH * .55) + 'px ' + D; x.letterSpacing = '3px';
            x.fillText(rogne(x, (l.code && l.code !== l.nom.toUpperCase() ? l.code + ' · ' : '') + l.nom.toUpperCase(), cwid), cx, y + h * .72);
            x.letterSpacing = '0px'; pts.push(null);
          } else {
            pts.push({ y: y + h / 2, fait: l.fait });
            x.fillStyle = l.fait ? PA : 'rgba(255,253,247,.55)';
            x.font = '700 ' + Math.round(rowH * .5) + 'px ' + D;
            var tx = rail + rowH * .6, place = cx + cwid - tx, base = y + h / 2 + rowH * .18;
            // « Star Trek : » répété à chaque ligne ne dit rien sur l'affiche de Star Trek
            var t = l.titre.replace(PREFIXE, '') || l.titre; x.fillText(rogne(x, t, place), tx, base);
            if (l.sub) {
              var wt = Math.min(place, x.measureText(t).width);
              if (place - wt > 120) {
                x.fillStyle = 'rgba(255,253,247,.5)'; x.font = '700 ' + Math.round(rowH * .4) + 'px ' + D;
                x.fillText(rogne(x, '· ' + l.sub, place - wt - 18), tx + wt + 14, base);
              }
            }
          }
          y += h;
        });
        // la voie, puis ses arrêts : plein entre deux arrêts faits
        var seg = [];
        pts.forEach(function(p){ if (p) seg.push(p); else if (seg.length) { voie(seg); seg = []; } });
        if (seg.length) voie(seg);
        function voie(s){
          x.lineCap = 'round'; x.lineWidth = rowH * .16;
          x.strokeStyle = uni; x.globalAlpha = .3;
          x.beginPath(); x.moveTo(rail, s[0].y); x.lineTo(rail, s[s.length - 1].y); x.stroke(); x.globalAlpha = 1;
          for (var i = 1; i < s.length; i++) if (s[i].fait && s[i - 1].fait) {
            x.beginPath(); x.moveTo(rail, s[i - 1].y); x.lineTo(rail, s[i].y); x.stroke();
          }
          s.forEach(function(p){
            x.beginPath(); x.arc(rail, p.y, rowH * .22, 0, 2 * Math.PI);
            x.fillStyle = p.fait ? uni : INK; x.fill();
            x.lineWidth = rowH * .07; x.strokeStyle = p.fait ? PA : uni; x.stroke();
          });
        }
      });

      // le pied
      x.fillStyle = uni; x.fillRect(0, H - 18, W, 18);
      x.fillStyle = OR; x.font = '900 56px ' + D; x.letterSpacing = '10px';
      x.fillText('CHRONOLOGEEK.APP', M, H - 90); x.letterSpacing = '0px';
      x.fillStyle = 'rgba(255,253,247,.6)'; x.font = '800 38px ' + D; x.textAlign = 'right';
      x.fillText(T.edite(new Date()).toUpperCase(), W - M, H - 92); x.textAlign = 'left';
      return new Promise(function(ok){ cv.toBlob(ok, 'image/jpeg', .92); }).then(function(b){ return { blob: b, nom: nom }; });
    });
  }

  var dlg = null, courant = null;
  function dialogue(){
    if (dlg) return dlg;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.className = 'af';
    dlg.innerHTML = '<div class="af-v"><p></p><img alt="" hidden/></div><div class="af-act">' +
      '<button type="button" class="go" data-a="share" hidden></button>' +
      '<button type="button" data-a="dl"></button><button type="button" data-a="x"></button></div>';
    dlg.querySelector('img').alt = T.alt;
    dlg.querySelector('p').textContent = T.prep;
    dlg.querySelector('[data-a="share"]').textContent = T.share;
    dlg.querySelector('[data-a="dl"]').textContent = T.dl;
    dlg.querySelector('[data-a="x"]').textContent = T.ferme;
    dlg.addEventListener('click', function(e){
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (e.target === dlg || a === 'x') return dlg.close();
      if (!courant) return;
      if (a === 'dl') {
        var l = document.createElement('a');
        l.href = URL.createObjectURL(courant.blob); l.download = courant.fichier.name;
        document.body.appendChild(l); l.click(); l.remove();
      }
      if (a === 'share') navigator.share({ files: [courant.fichier], title: 'Chronologeek', text: T.texte(courant.nom) }).catch(function(){});
    });
    dlg.addEventListener('close', function(){
      var im = dlg.querySelector('img');
      if (im.src) URL.revokeObjectURL(im.src);
      im.removeAttribute('src'); im.hidden = true; dlg.querySelector('p').hidden = false; courant = null;
    });
    document.body.appendChild(dlg);
    return dlg;
  }
  function ouvre(){
    var d = dialogue();
    if (!d.open) d.showModal();
    dessine().then(function(r){
      if (!r.blob || !d.open) return;
      var slug = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'chronologeek').replace(/\.html$/, '');
      var f = new File([r.blob], 'chronologeek-affiche-' + slug + '.jpg', { type: 'image/jpeg' });
      courant = { blob: r.blob, fichier: f, nom: r.nom };
      var im = d.querySelector('img'); im.src = URL.createObjectURL(r.blob); im.hidden = false;
      d.querySelector('p').hidden = true;
      d.querySelector('[data-a="share"]').hidden = !(navigator.canShare && navigator.canShare({ files: [f] }) &&
        matchMedia('(pointer:coarse)').matches);
    });
  }
  function pose(){
    var avant = document.getElementById('share-prog');
    if (!avant || !document.querySelector('#timeline .era-sec') || document.getElementById('affiche')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = avant.className; b.id = 'affiche';
    b.innerHTML = '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/></svg> ';
    b.appendChild(document.createTextNode(T.btn));
    b.addEventListener('click', ouvre);
    avant.parentNode.insertBefore(b, avant.nextSibling);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ LA VERSION IMPRIMABLE ═════════════════════════════════════════════
   Posée le 14 novembre 2026 (n° 9 de la liste du 5 novembre) : imprimer une
   timeline donne une checklist papier, en noir sur blanc. Bouton « Imprimer »
   à côté de « Affiche », mais Ctrl+P donne le même résultat : tout est dans
   une feuille `@media print`, une seule copie pour les treize timelines et le
   Dossier, posée sur les mêmes repères que l'affiche (`.era-sec`, `.col`,
   `.bu`).

   - **Ce qui reste** : un en-tête (univers, parcours, décompte, adresse),
     chaque station en titre, chaque arrêt sur une ligne — case, arrêt, date,
     titre, sous-titres —, sur deux colonnes. La case cochée à l'écran sort
     cochée. Les filtres de la page s'appliquent : ce qui est masqué ne
     s'imprime pas.
   - **Ce qui part** : images, menus, premier écran, plan, barre du bas,
     fiches dépliées, liens et boutons. Les arrêts animés à l'arrivée (`.rv`)
     sont forcés visibles : sinon ceux sous la ligne de flottaison sortaient
     blancs.
   - **Tout en `!important`** : les pages posent leurs règles en dur, à
     plusieurs poids selon la largeur ; c'est le seul moyen d'en sortir sans
     les relire une à une.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (!document.querySelector('#timeline .era-sec')) return;
  var FR = document.documentElement.lang !== 'en';
  var T = FR ? { btn: 'Imprimer', arrets: 'arrêts terminés' } : { btn: 'Print', arrets: 'stops completed' };
  var I = '!important';
  var R = [
    '@page{margin:12mm}',
    'html,body{background:#fff' + I + ';color:#000' + I + '}',
    'body *{box-shadow:none' + I + ';text-shadow:none' + I + '}',
    '.cg-imp{display:block' + I + ';font:11pt/1.3 Chivo,sans-serif' + I + ';border-bottom:2pt solid #000;padding-bottom:4mm;margin-bottom:5mm}',
    '.cg-imp b{display:block;font:900 26pt/1 "Big Shoulders Display",sans-serif;text-transform:uppercase}',
    'main,.wrap,#timeline,.rows,.era-sec,.col,.zone,.cols{display:block' + I + ';width:auto' + I + ';max-width:none' + I + ';margin:0' + I + ';padding:0' + I + ';' +
    'background:none' + I + ';border:0' + I + ';position:static' + I + ';transform:none' + I + '}',
    '#timeline{columns:2;column-gap:9mm}',
    '.col[hidden]{display:block' + I + '}',
    '.stn,.stn-plate,.stn-txt{display:block' + I + ';background:none' + I + ';color:#000' + I + ';padding:0' + I + ';margin:0' + I + ';border:0' + I + ';min-height:0' + I + '}',
    '.era-sec{break-inside:auto;margin-top:4mm' + I + '}',
    '.stn-nm{font:900 13pt/1.1 "Big Shoulders Display",sans-serif' + I + ';color:#000' + I + ';margin:3mm 0 1mm' + I + ';' +
    'border-bottom:1pt solid #000' + I + ';break-after:avoid;text-transform:uppercase}',
    '.stn-k{display:none' + I + '}',
    '.stn-meta{display:block' + I + ';font:8pt/1.2 Chivo,sans-serif' + I + ';color:#444' + I + ';margin:0 0 1.5mm' + I + '}',
    '.stn-meta b{display:inline' + I + ';color:#000' + I + ';font-weight:700' + I + '}',
    '.stn-meta span+span::before{content:" · "}',
    '.col-h{display:block' + I + ';font:800 10pt/1.2 "Big Shoulders Display",sans-serif' + I + ';margin:2mm 0 1mm' + I + ';color:#000' + I + ';background:none' + I + ';border:0' + I + '}',
    '.bu,.bu.rv{display:grid' + I + ';grid-template-columns:5mm 1fr;column-gap:2mm;align-items:start;break-inside:avoid;' +
    'opacity:1' + I + ';transform:none' + I + ';margin:0 0 1.2mm' + I + ';padding:0' + I + ';animation:none' + I + '}',
    '.bu[hidden]{display:none' + I + '}',
    '.bu-side{display:block' + I + ';position:static' + I + ';width:auto' + I + '}',
    '.bu-chk{position:static' + I + ';transform:none' + I + ';width:3.6mm' + I + ';height:3.6mm' + I + ';border:1pt solid #000' + I + ';' +
    'border-radius:0' + I + ';background:#fff' + I + ';display:grid' + I + ';place-items:center;padding:0' + I + ';margin-top:.4mm' + I + '}',
    '.bu-chk svg{width:3mm' + I + ';height:3mm' + I + ';stroke:#000' + I + ';opacity:0' + I + '}',
    '.bu-chk[aria-checked="true"] svg{opacity:1' + I + '}',
    // un bouton ne se met jamais « en ligne » dans Chrome : la carte passe en flex, heure et titre côte à côte
    '.bu-card{display:flex' + I + ';flex-wrap:wrap;align-items:baseline;column-gap:1.5mm;background:none' + I + ';border:0' + I + ';padding:0' + I + ';color:#000' + I + ';transform:none' + I + '}',
    '.bu-head{display:block' + I + ';width:auto' + I + ';flex:1 1 0;min-width:0;text-align:left' + I + '}',
    '.bu-sub{flex-basis:100%}',
    '.bu-time{display:inline' + I + ';background:none' + I + ';border:0' + I + ';padding:0' + I + ';margin:0 1.5mm 0 0' + I + '}',
    '.bu-time .bu-n,.bu-time .d,.bu-time .rel,.bu-time .mem{display:inline' + I + ';font:8pt Chivo,sans-serif' + I + ';color:#555' + I + ';' +
    'background:none' + I + ';border:0' + I + ';padding:0' + I + ';margin:0 1.2mm 0 0' + I + '}',
    '.bu-head{display:inline' + I + ';background:none' + I + ';border:0' + I + ';padding:0' + I + ';color:#000' + I + '}',
    '.bu-txt{display:inline' + I + ';padding:0' + I + '}',
    '.bu-tags{display:inline' + I + ';margin:0' + I + '}',
    '.bu-tags .b{background:none' + I + ';color:#555' + I + ';border:0' + I + ';padding:0' + I + ';font:8pt Chivo,sans-serif' + I + ';margin-right:1.2mm' + I + '}',
    '.bu-tags .lv,.bu-tags .vo{display:none' + I + '}',
    '.bu-title{display:inline' + I + ';font:700 10pt/1.25 Chivo,sans-serif' + I + ';color:#000' + I + ';text-transform:none' + I + '}',
    '.bu.dr .bu-title{font-weight:600' + I + '}',
    '.bu-sub{display:block' + I + ';padding:0' + I + ';margin:0' + I + '}',
    '.bu-sub .arc{display:inline' + I + ';border:0' + I + ';padding:0' + I + '}',
    '.bu-sub .si{display:inline' + I + ';background:none' + I + ';border:0' + I + ';padding:0' + I + ';font:8pt Chivo,sans-serif' + I + ';color:#444' + I + '}',
    '.bu-sub .si+.si::before,.bu-sub .arc+.arc::before{content:" · "}',
    'a{color:#000' + I + ';text-decoration:none' + I + '}',
    // tout ce qui n'est pas la liste, en dernier : `.wrap` plus haut réaffichait le billet
    'header,nav,footer,.drawer,.attract,.ln-hero,.ticket-row,.ln-map,.hud,.sieve,#sieve,#totop,.cg-bar,dialog,' +
    '.bu-fig,.bu-link,.bu-panel,.bu-end,.bu-done,.stn-img,.stn-rail,.stn-cx,.ln-svg,.rows>.ici,.ztabs,.col-tabs,' +
    '.dep,.board,.cuts,#intro,.pr,.sg-p,.mine-act,.bu-side::after,.lv .ic,.sep-row,.sep-fin,.scr,.bu-buy,.wl,.wt,' +
    '.next-out,.rc,.sy,.bu-tags .ft,.bu-meta,.bu-note{display:none' + I + '}'
  ].join('');
  var st = document.createElement('style');
  st.media = 'print';
  st.textContent = R;
  document.head.appendChild(st);
  window.CG_IMPRIME = R;   // pour vérifier à l'écran sans imprimer

  // l'en-tête, invisible à l'écran : univers, parcours, décompte, adresse
  function entete(){
    var h = document.querySelector('.cg-imp');
    if (!h) {
      h = document.createElement('div'); h.className = 'cg-imp'; h.style.display = 'none';
      var tl = document.getElementById('timeline'); tl.parentNode.insertBefore(h, tl);
    }
    var C0 = window.CG_CARTE || {}, nom = C0.nomUnivers ? C0.nomUnivers() : document.title;
    var par = document.querySelector('.par [aria-pressed="true"], .ln-go [aria-pressed="true"]');
    var tous = document.querySelectorAll('#timeline .bu[data-id]'), faits = 0;
    [].forEach.call(tous, function(b){ var c = b.querySelector('[data-check]'); if (c && c.getAttribute('aria-checked') === 'true') faits++; });
    h.innerHTML = '<b></b><span></span>';
    h.querySelector('b').textContent = nom;
    h.querySelector('span').textContent = (par ? par.textContent.replace(/\s+/g, ' ').trim() + ' · ' : '') +
      faits + ' / ' + tous.length + ' ' + T.arrets + ' · ' + location.host + location.pathname.replace(/\.html$/, '');
  }
  window.addEventListener('beforeprint', entete);

  function pose(){
    var avant = document.getElementById('affiche') || document.getElementById('share-prog');
    if (!avant || document.getElementById('imprime')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = avant.className; b.id = 'imprime';
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6M7 18H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/></svg> ';
    b.appendChild(document.createTextNode(T.btn));
    b.addEventListener('click', function(){ entete(); window.print(); });
    avant.parentNode.insertBefore(b, avant.nextSibling);
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
    phC:  'Chercher une œuvre…',
    lab:  'Chercher dans les timelines',
    rien: 'Aucune œuvre de ce nom.',
    plus: function(n, t){ return n + ' sur ' + t + ' résultats'; }
  } : {
    ph:   'Search a title — movie, show, game, novel, comic…',
    phC:  'Search a title…',
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
      'border-radius:3px;transition:border-color .15s,background .15s}',
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
      'background:#14141f;border:1px solid rgba(255,253,247,.16);border-radius:3px;',
      '}',
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
          /* La sixième place porte le titre de l'autre langue quand il
             diffère (« Seven Havens » pour « Les Sept Refuges ») : on le
             range plus loin avant d'écrire les formes de comparaison. */
          var alias = typeof d.e[i][5] === 'string' ? d.e[i][5] : '';
          d.e[i][5] = norm(d.e[i][1]);
          d.e[i][6] = compact(d.e[i][1]);
          d.e[i][7] = alias;
          d.e[i][8] = alias ? norm(alias) : '';
          d.e[i][9] = alias ? compact(alias) : '';
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
  function rang(n, c, q, qc){
    var i = n.indexOf(q);
    if (i === 0) return 0;
    if (i > 0) return /[a-z0-9]/.test(n.charAt(i - 1)) ? 2 : 1;
    if (qc.length > 2 && c.indexOf(qc) >= 0) return 3;
    return -1;
  }
  /* Le titre de la page d'abord ; celui de l'autre langue ne compte que s'il
     fait mieux, et à rang égal il passe juste derrière. `e[10]` retient par
     lequel des deux l'entrée a répondu : le rendu le montre. */
  function score(e, q, qc){
    var s = rang(e[5], e[6], q, qc);
    e[10] = 0;
    if (!e[7]) return s;
    var a = rang(e[8], e[9], q, qc);
    if (a < 0 || (s >= 0 && s <= a)) return s;
    e[10] = 1;
    return a + 0.5;
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
        /* trouvé par son titre dans l'autre langue : on le dit, sans quoi
           « seven havens » rendrait un titre où le mot ne paraît pas */
        if (it[10] && it[7]) {
          var al = document.createElement('span');
          al.className = 'p';
          al.textContent = '  ' + it[7];
          t.appendChild(al);
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
    /* Sur un téléphone, la phrase entière était coupée net après « jeu, » :
       le champ n'en montre que la moitié. La forme courte dit l'essentiel. */
    champ.placeholder = matchMedia('(max-width:560px)').matches ? T.phC : T.ph;
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
    CG_RES('sr', bloc.getBoundingClientRect().height);
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
    '  text-decoration:none;border-radius:3px;transition:color .15s ease,background .15s ease}',
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

/* ══ Le titre de l'autre langue, dans la recherche des pages ══════════════
   Posé le 10 octobre 2026, demandé par Niko : un titre d'origine doit se
   trouver quelle que soit la langue de la page. *Avatar : Les Sept Refuges*
   ne répondait plus à « seven havens » dans le champ de `/fr/avatar`.

   L'index de l'accueil porte déjà l'autre titre de chaque œuvre, en sixième
   place (`recherche.mjs`). On le lit au premier focus du champ `#q` et on le
   range dans `window.CG_ALT`, identifiant → titre en minuscules ; la ligne de
   filtre de chacune des treize pages le consulte après son propre titre. Tant
   qu'il n'est pas arrivé, ou s'il n'arrive pas, la recherche fait ce qu'elle
   faisait. Une frappe partie avant lui est rejouée à son arrivée.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  var q = document.getElementById('q');
  if (!q || !document.getElementById('timeline')) return;
  var fait = false;
  function charge(){
    if (fait) return;
    fait = true;
    fetch(document.documentElement.lang === 'en' ? '/search-en.json' : '/search-fr.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.e) return;
        var m = {};
        for (var i = 0; i < d.e.length; i++)
          if (typeof d.e[i][5] === 'string') m[d.e[i][2]] = d.e[i][5].toLowerCase();
        window.CG_ALT = m;
        if (q.value) q.dispatchEvent(new Event('input', { bubbles: true }));
      })
      .catch(function(){});
  }
  q.addEventListener('focus', charge);
  q.addEventListener('input', charge);
})();

/* ══ Où regarder, dans la fiche TMDB ══════════════════════════════════════
   Posé le 1er octobre 2026. La fiche ouverte disait tout d'une œuvre sauf
   la seule chose qu'on fait juste après l'avoir lue : la regarder. TMDB
   tient les plateformes pays par pays (`/watch/providers`), avec la clé
   déjà présente dans `CG.tmdbKey` ; la France pour la page française, les
   États-Unis pour l'anglaise, comme les dates du radar.

   Une seule copie pour les douze timelines, parce que toutes rendent leur
   fiche pareil : un `.bu-panel` qui porte `data-tmdb` et `data-media`, et
   un `.expand-info` qui n'est écrit qu'à l'ouverture. On observe donc
   `#timeline` et l'on complète la fiche quand elle arrive, sans toucher au
   code de rendu des pages.

   Quatre choses à savoir :

   - **Le type de l'œuvre décide, jamais `media`.** Les romans et comics
     d'Avatar, les DLC de Dragon Age empruntent la fiche de leur série
     (`media:"tv"`) : sans ce filtre, *Le Cycle de Kyoshi* annoncerait
     Netflix. Seuls les types d'écran passent, lus dans les données de la
     page — le même piège que `typeSchema()` de `jsonld.mjs`.
   - **L'abonnement d'abord, la location seulement à défaut.** Une ligne
     qui aligne quatorze boutiques de location ne dit plus où l'œuvre est
     incluse. Rien n'est affiché si TMDB n'a rien : une ligne vide se
     lirait comme « nulle part ».
   - **JustWatch est cité, et c'est une condition.** TMDB tient ces données
     de JustWatch et demande de le dire ; le lien mène à la page TMDB de
     l'œuvre, qui renvoie chez chaque plateforme.
   - **Les logos restent chez TMDB**, comme les affiches : `w92` pour un
     rendu de 28 px, le palier au-dessus du ×3.

   Les jeux ont la même ligne depuis le 1er novembre 2026, « Où jouer »,
   lue chez RAWG (`platforms`) : voir `consoles()` plus bas.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var EN = document.documentElement.lang === 'en';
  /* Le pays se règle dans le panneau des réglages ; à défaut, la France pour
     la page française et les États-Unis pour l'anglaise. */
  var MES = (window.CG_OPT && CG_OPT.o) || {};
  var PAYS = MES.pays || (EN ? 'US' : 'FR');
  var MIENNES = {}, MIENNES_N = 0;
  (MES.pf || []).forEach(function(k){ MIENNES[k] = 1; MIENNES_N++; });
  var MES_CS = {};
  (MES.cs || []).forEach(function(k){ MES_CS[k] = 1; });
  var L = EN
    ? { titre: 'Where to watch', location: 'rent or buy', source: 'Data: JustWatch', tmdb: 'Data: TMDB',
        jouer: 'Where to play', rawg: 'Data: RAWG' }
    : { titre: 'Où regarder', location: 'location ou achat', source: 'Données : JustWatch', tmdb: 'Données : TMDB',
        jouer: 'Où jouer', rawg: 'Données : RAWG' };
  var ECRAN = { film: 1, filmanim: 1, serie: 1, anime: 1, short: 1, special: 1, web: 1 };
  var NOMS = ['SW', 'MCU', 'DC', 'AVATAR', 'ST', 'TWD', 'DATA_DA',
              'ASSASSINSCREED', 'DCANIM', 'JURASSIC', 'WITCHER', 'RE', 'BLADERUNNER', 'MONSTERVERSE'];

  var CSS = [
    '.wt{display:flex;align-items:center;gap:6px 8px;flex-wrap:wrap;margin-top:10px;',
    '  font-size:11.5px;color:rgba(255,253,247,.72)}',
    '.wt strong{color:var(--hot);font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-right:2px}',
    '.wt-l{display:inline-flex;gap:6px;flex-wrap:wrap}',
    '.wt-l img{width:28px;height:28px;border-radius:3px;display:block;background:rgba(255,255,255,.08)}',
    '.wt-k{font-style:italic}',
    '.wt-p{display:inline-grid;place-items:center;min-height:28px;padding:0 9px;border:1px solid rgba(255,253,247,.34);',
    '  border-radius:3px;background:rgba(255,255,255,.08);color:var(--paper);font-weight:700;font-size:11.5px;white-space:nowrap}',
    '.wt-l .wt-p img{width:auto;height:18px;max-width:66px;object-fit:contain;border-radius:0;background:none;filter:brightness(0) invert(1)}',
    '.wt a.wt-s{color:rgba(255,253,247,.55);font-size:10.5px;text-decoration:none}',
    '.wt a.wt-s:hover{color:var(--paper);text-decoration:underline}',
    '.wt-l img.on{box-shadow:0 0 0 2px var(--ink),0 0 0 4px var(--hot)}',
    '.wt-p.on{border-color:var(--hot);box-shadow:0 0 0 1px var(--hot)}',
    '.wt-m{display:inline-flex;gap:3px;align-items:center;margin-left:2px;vertical-align:middle}',
    '.wt-m img{width:20px;height:20px;border-radius:3px;display:block;box-shadow:0 0 0 1px var(--hot)}'
  ].join('');

  /* identifiant d'entrée → type, second parcours compris (`ref`) */
  var TYPES = null, TITRES = {}, ORIGINE = {};
  function typeDe(id){
    if (!TYPES) {
      var D = null;
      for (var i = 0; i < NOMS.length && !D; i++) {
        var v = window[NOMS[i]];
        if (v && typeof v === 'object' && v.eras && v.eras.length) D = v;
      }
      if (!D) return null;
      TYPES = {};
      var refs = [];
      ['eras', 'erasRewatch', 'erasReplay', 'erasRelease'].forEach(function(cle){
        (D[cle] || []).forEach(function(era){
          (era.entries || []).forEach(function(e){
            if (!e || !e.id) return;
            if (e.type) TYPES[e.id] = e.type;
            else if (e.ref) refs.push([e.id, e.ref]);
            if (e.title) TITRES[e.id] = e.title;
          });
        });
      });
      refs.forEach(function(r){
        if (!TYPES[r[0]]) TYPES[r[0]] = TYPES[r[1]];
        ORIGINE[r[0]] = r[1];
      });
    }
    return TYPES[id] || null;
  }

  var cache = {};
  function plateformes(media, id, cle){
    if (cache[media + id]) return cache[media + id];
    return (cache[media + id] = fetch('https://api.themoviedb.org/3/' + media + '/' + id +
        '/watch/providers?api_key=' + cle)
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        var res = d && d.results;
        if (res && res[PAYS]) return res[PAYS];
        // aucun pays du tout : JustWatch ne connaît pas encore l'œuvre
        if (media === 'tv' && res && !Object.keys(res).length) return diffuseur(id, cle);
        return null;
      })
      .catch(function(){ return null; }));
  }

  /* Le repli sur le diffuseur, posé le 10 octobre 2026 avec *Avatar: Seven
     Havens*. Une série sortie la veille n'a encore AUCUNE plateforme chez
     TMDB — JustWatch met des jours à la relever —, et sa fiche restait sans
     ligne au moment précis où on la cherche. Sa fiche TMDB nomme pourtant
     son diffuseur (`networks`), Paramount+ ici.

     Deux garde-fous. Le repli ne joue que si TMDB n'a de plateforme pour
     AUCUN pays : une vieille série absente d'un seul pays ne doit pas
     annoncer sa chaîne d'origine. Et le diffuseur doit être une plateforme
     du pays de la page, retrouvée par sa marque dans le catalogue TMDB du
     pays — on en tire son logo carré, celui des autres lignes. La source
     citée devient TMDB : ce n'est plus une donnée JustWatch. */
  function cleMarque(nom){ return marqueDe(nom).replace(/^amazon /, ''); }

  var catalogueP = null;
  function catalogue(cle){
    if (catalogueP) return catalogueP;
    return (catalogueP = fetch('https://api.themoviedb.org/3/watch/providers/tv?watch_region=' +
        PAYS + '&api_key=' + cle)
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        var m = {};
        ((d && d.results) || []).forEach(function(x){
          if (!x.logo_path) return;
          var k = cleMarque(x.provider_name), deja = m[k];
          if (!deja || (/channel/i.test(deja.provider_name) && !/channel/i.test(x.provider_name))) m[k] = x;
        });
        return m;
      })
      .catch(function(){ return {}; }));
  }

  function diffuseur(id, cle){
    return Promise.all([
      fetch('https://api.themoviedb.org/3/tv/' + id + '?api_key=' + cle)
        .then(function(r){ return r.ok ? r.json() : null; }),
      catalogue(cle)
    ]).then(function(v){
      var cat = v[1] || {}, liste = [];
      ((v[0] && v[0].networks) || []).forEach(function(n){
        var x = cat[cleMarque(n.name)];
        if (x) liste.push(x);
      });
      return liste.length
        ? { flatrate: liste, link: 'https://www.themoviedb.org/tv/' + id, reseau: true }
        : null;
    }).catch(function(){ return null; });
  }

  /* Une marque, une fois. TMDB sépare les offres d'une même plateforme —
     « Paramount Plus Premium », « Paramount Plus Essential », « Paramount+
     Amazon Channel », « … Roku Premium Channel » — et la série Avatar
     alignait quatre Paramount+ à côté d'un Netflix. */
  function marqueDe(nom){
    return String(nom).toLowerCase()
      .replace(/\s*\bplus\b/g, '+')
      .replace(/\b(amazon|apple tv|roku( premium)?) channel\b|\bchannel\b|\bwith ads\b|\b(premium|essential|basic|standard|ads)\b/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  /* l'abonnement et le gratuit, sinon la location et l'achat, sans doublon */
  function choisir(p){
    function liste(cles){
      var vus = {}, out = [];
      cles.forEach(function(k){ (p[k] || []).forEach(function(x){ out.push(x); }); });
      out.sort(function(a, b){ return (a.display_priority || 99) - (b.display_priority || 99); });
      /* La marque garde le rang de sa meilleure offre, mais montre l'offre
         directe plutôt qu'une chaîne revendue : TMDB classe « HBO Max
         Amazon Channel » devant HBO Max aux États-Unis. */
      var ordre = [];
      out.forEach(function(x){
        if (!x.logo_path) return;
        var m = marqueDe(x.provider_name), deja = vus[m];
        if (!deja) { vus[m] = x; ordre.push(m); }
        else if (/channel/i.test(deja.provider_name) && !/channel/i.test(x.provider_name)) vus[m] = x;
      });
      /* Les plateformes du visiteur passent devant, et ne tombent jamais
         sous la coupe des six. */
      if (MIENNES_N) ordre.sort(function(a, b){ return (MIENNES[b] ? 1 : 0) - (MIENNES[a] ? 1 : 0); });
      return ordre.map(function(m){ return vus[m]; }).slice(0, 6);
    }
    var flux = liste(['flatrate', 'free', 'ads']);
    if (flux.length) return { liste: flux, location: false };
    var achat = liste(['rent', 'buy']);
    return achat.length ? { liste: achat, location: true } : null;
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* Le panneau des réglages reprend la marque, le pays et l'ordre des consoles
     d'ici : deux écritures divergeraient. */
  window.CG_WT = { marque: marqueDe, pays: PAYS };

  function completer(info){
    if (info.dataset.wt) return;
    info.dataset.wt = '1';
    var panel = info.closest('.bu-panel'), art = info.closest('[data-id]');
    var CG = window.CG || {};
    if (!panel || !art || !CG.tmdbKey) return;
    var id = panel.dataset.tmdb, media = panel.dataset.media;
    if (media === 'game') { consoles(info, art.dataset.id, id); return; }
    if (!id || id === '0' || (media !== 'movie' && media !== 'tv')) return;
    if (!ECRAN[typeDe(art.dataset.id)]) return;

    plateformes(media, id, CG.tmdbKey).then(function(p){
      var ligne = ligneDe(p);
      if (!ligne || !info.isConnected || info.querySelector('.wt')) return;
      // sous les mesures, au-dessus de la bande-annonce
      var tr = info.querySelector('.expand-trailer-link');
      info.insertBefore(ligne, tr || null);
    });
  }

  function ligneDe(p){
    var c = p && choisir(p);
    if (!c) return null;
    var ligne = document.createElement('div');
    ligne.className = 'wt';
    ligne.innerHTML = '<strong>' + L.titre + '</strong><span class="wt-l">' +
      c.liste.map(function(x){
        return '<img' + (MIENNES[marqueDe(x.provider_name)] ? ' class="on"' : '') + ' src="https://image.tmdb.org/t/p/w92' + esc(x.logo_path) + '" alt="' +
          esc(x.provider_name) + '" title="' + esc(x.provider_name) + '" loading="lazy">';
      }).join('') + '</span>' +
      (c.location ? '<span class="wt-k">' + L.location + '</span>' : '') +
      (p.link ? '<a class="wt-s" href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
        (p.reseau ? L.tmdb : L.source) + '</a>' : '<span class="wt-s">' + L.source + '</span>');
    return ligne;
  }

  /* ── où jouer ───────────────────────────────────────────────────────
     Un jeu n'a pas de plateforme de flux : la question devient « sur quoi »,
     et RAWG, qui sert déjà les fiches de jeux, la tient dans `platforms`.
     RAWG ne fournit aucun logo : les vingt-quatre de `images/consoles/`
     sont servis par le site, et passés en blanc par un filtre CSS. Une
     plateforme sans logo garde son nom écrit.

     Quatre choses à savoir :

     - **RAWG est interrogé une seconde fois**, comme TMDB ici : les pages
       gardent leur réponse dans leur script, hors de portée d'ici.
     - **L'identifiant, puis le titre.** Star Wars, DC Animation et The
       Witcher n'ont pas d'identifiant RAWG et cherchent par titre, et un
       titre français ne trouve rien : la page française prend le titre
       anglais dans son index de recherche (sixième place).
     - **Le premier résultat n'est pas toujours le bon**, d'où `meme()` : si
       ses mots ne sont pas tous dans le titre cherché, ou l'inverse, on se
       tait. Une ligne fausse vaut moins que pas de ligne.
     - **`CONSOLES_FIXES` l'emporte sur RAWG**, là où RAWG se trompe : le
       *Side Effects* qu'il rend n'est pas le module de The Witcher, *Arkham
       Shadow* n'y a aucune plateforme, et la version Android d'*Arkham
       Origins* est un autre jeu. */
  var JEU = { jeu: 1, dlc: 1 };
  var CONSOLES_FIXES = {
    'ark-shadow': ['Meta Quest 3'],
    'ark-origins': ['Wii U', 'PC', 'PS3', 'Xbox 360'],
    'wg-sideeffects': ['PC'],
    'sw-galacticracer': ['PS5', 'Xbox Series', 'PC'],
    'sw-outlaws': ['PS5', 'Xbox Series', 'Switch 2', 'PC'],
    /* RAWG ne répondait plus (522) le jour de la publication du Monsterverse,
       le 7 novembre 2026 : les plateformes viennent du wiki Godzilla. */
    'mv-survivorinstinct': ['PS5', 'Xbox Series', 'PC']
  };
  var COURTS = { 'PlayStation 5': 'PS5', 'PlayStation 4': 'PS4', 'PlayStation 3': 'PS3', 'PlayStation 2': 'PS2',
    'PlayStation': 'PS1', 'Xbox Series S/X': 'Xbox Series', 'Nintendo Switch 2': 'Switch 2', 'Nintendo Switch': 'Switch',
    'Nintendo 3DS': '3DS', 'Nintendo DS': 'DS', 'macOS': 'Mac' };
  var LOGOS = { 'PS5': 'ps5', 'PS4': 'ps4', 'PS3': 'ps3', 'PS2': 'ps2', 'PS1': 'ps1', 'PSP': 'psp', 'PS Vita': 'psvita',
    'Xbox Series': 'xboxseries', 'Xbox One': 'xboxone', 'Xbox 360': 'xbox360', 'Xbox': 'xbox',
    'Switch 2': 'switch2', 'Switch': 'switch', 'Wii U': 'wiiu', 'Wii': 'wii', 'GameCube': 'gamecube', '3DS': '3ds', 'DS': 'ds',
    'PC': 'pc', 'Mac': 'mac', 'iOS': 'ios', 'Android': 'android', 'Linux': 'linux', 'Meta Quest 3': 'quest' };
  // du plus récent au plus ancien, le mobile après
  var RANG = ['PS5', 'Xbox Series', 'Switch 2', 'Switch', 'Meta Quest 3', 'PC', 'Mac', 'Linux', 'PS4', 'Xbox One', 'Wii U',
    'PS Vita', '3DS', 'PS3', 'Xbox 360', 'Wii', 'PSP', 'DS', 'PS2', 'Xbox', 'GameCube', 'PS1', 'iOS', 'Android'];
  window.CG_WT.rang = RANG; window.CG_WT.logos = LOGOS;

  function dec(s){
    var t = document.createElement('textarea');
    t.innerHTML = String(s);
    return t.value;
  }
  function mots(s){
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/).filter(function(m){ return m && !/^(the|a|an|of|and|le|la|les|de|du|des|et)$/.test(m); });
  }
  function meme(a, b){
    var x = mots(a), y = mots(b);
    function dans(p, g){ return p.every(function(m){ return g.indexOf(m) !== -1; }); }
    // un seul mot ne suffit pas : « The Witcher » n'est pas The Witcher 3
    if (Math.min(x.length, y.length) < 2 && x.length !== y.length) return false;
    return !!x.length && !!y.length && (dans(x, y) || dans(y, x));
  }

  // la page française cherche sous le titre anglais, celui que RAWG connaît
  var INDEX = null;
  function titreDeRecherche(id){
    var ici = TITRES[id] || TITRES[ORIGINE[id]] || '';
    if (EN) return Promise.resolve(dec(ici));
    INDEX = INDEX || fetch('/search-fr.json').then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
    return INDEX.then(function(j){
      var cle = TITRES[id] ? id : ORIGINE[id];
      var l = j && j.e && j.e.filter(function(x){ return x[2] === id || x[2] === cle; })[0];
      return dec((l && (l[5] || l[1])) || ici);
    });
  }

  var fiches = {};
  function rawg(cle, rawgId, id){
    if (+rawgId) {
      return fiches[rawgId] || (fiches[rawgId] = fetch('https://api.rawg.io/api/games/' + (+rawgId) + '?key=' + cle)
        .then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }));
    }
    return titreDeRecherche(id).then(function(t){
      // la même coupe que les pages : ni les DLC, ni « Campaign » ne sont des noms de jeux
      var q = t.split(/\s\+\s|\s—\s/)[0].replace(/[:.+]/g, ' ').trim();
      if (!q) return null;
      return fetch('https://api.rawg.io/api/games?search=' + encodeURIComponent(q) + '&page_size=1&key=' + cle)
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(j){
          var g = j && j.results && j.results[0];
          return g && meme(g.name, q) ? g : null;
        }).catch(function(){ return null; });
    });
  }

  function ligneConsoles(noms, slug){
    var vus = {}, liste = noms.filter(function(n){
      if (vus[n] || n === 'Web') return false;
      return (vus[n] = true);
    });
    function rang(n){ var i = RANG.indexOf(n); return i === -1 ? 99 : i; }
    liste.sort(function(a, b){ return (MES_CS[b] ? 1 : 0) - (MES_CS[a] ? 1 : 0) || rang(a) - rang(b); });
    if (!liste.length) return null;
    var ligne = document.createElement('div');
    ligne.className = 'wt';
    ligne.innerHTML = '<strong>' + L.jouer + '</strong><span class="wt-l">' +
      liste.map(function(n){
        return '<span class="wt-p' + (MES_CS[n] ? ' on' : '') + '">' + (LOGOS[n]
          ? '<img src="/images/consoles/' + LOGOS[n] + '.svg" alt="' + esc(n) + '" title="' + esc(n) + '" loading="lazy">'
          : esc(n)) + '</span>';
      }).join('') + '</span>' +
      (slug ? '<a class="wt-s" href="https://rawg.io/games/' + esc(slug) + '" target="_blank" rel="noopener">' + L.rawg + '</a>' : '');
    return ligne;
  }

  function consoles(info, id, rawgId){
    var CG = window.CG || {};
    if (!JEU[typeDe(id)] || !CG.rawgKey) return;
    function pose(ligne){
      if (!ligne || !info.isConnected || info.querySelector('.wt')) return;
      info.insertBefore(ligne, info.querySelector('.expand-trailer-link') || null);
    }
    var fixe = CONSOLES_FIXES[id] || CONSOLES_FIXES[ORIGINE[id]];
    if (fixe) { pose(ligneConsoles(fixe)); return; }
    rawg(CG.rawgKey, rawgId, id).then(function(g){
      if (!g || !g.platforms) return;
      pose(ligneConsoles(g.platforms.map(function(p){
        return COURTS[p.platform.name] || p.platform.name;
      }), g.slug));
    });
  }

  /* ── le radar ───────────────────────────────────────────────────────
     « À venir » ne charge aucun fichier de données : sa clé TMDB est dans
     son propre script, hors de portée d'ici, d'où la même clé publique en
     repli. Sa carte porte sa fiche dans `data-tm` (« tv/12345 »), une
     carte d'épisode celle de sa série — ce sont bien les plateformes de la
     série qu'on cherche. Ce qui n'est pas encore sorti n'a rien chez
     TMDB, et la carte reste sans ligne : c'est la bonne réponse. Seules
     servent les séries en diffusion et les films déjà sortis d'un côté.

     La fiche du radar s'écrit en plusieurs fois — mesures, résumé de la
     série, bande-annonce, chacun à son retour de TMDB. La ligne se pose
     donc à la fin de `.inf`, et un observateur la remet devant `.tr`
     quand la bande-annonce arrive après elle. */
  var CLE_RADAR = '6257b37bf29ab31357853fce00232314';

  function radar(d){
    if (!d.open || d.dataset.wt || !d.dataset.tm) return;
    d.dataset.wt = '1';
    var ref = d.dataset.tm.split('/'), inf = d.querySelector('.inf');
    if (!inf || (ref[0] !== 'movie' && ref[0] !== 'tv') || !+ref[1]) return;
    plateformes(ref[0], ref[1], CLE_RADAR).then(function(p){
      var ligne = ligneDe(p);
      if (!ligne || inf.querySelector('.wt')) return;
      function place(){
        var tr = inf.querySelector('.tr');
        if (tr && ligne.nextSibling !== tr) inf.insertBefore(ligne, tr);
        else if (!tr && inf.lastChild !== ligne) inf.appendChild(ligne);
      }
      place();
      var obs = new MutationObserver(place);
      obs.observe(inf, { childList: true });
      setTimeout(function(){ obs.disconnect(); }, 20000);
    });
  }

  function pose(){
    var cal = document.getElementById('cal');
    var tl = document.getElementById('timeline');
    if (cal) {
      var s = document.createElement('style');
      s.textContent = CSS;
      document.head.appendChild(s);
      // `toggle` ne remonte pas : il se capte, comme dans la page
      cal.addEventListener('toggle', function(ev){
        if (ev.target && ev.target.tagName === 'DETAILS') radar(ev.target);
      }, true);
      return;
    }
    if (!tl || !document.querySelector('.bu-panel[data-tmdb]')) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    new MutationObserver(function(muts){
      for (var i = 0; i < muts.length; i++) {
        var n = muts[i].target;
        if (n.nodeType !== 1) continue;
        var infos = n.querySelectorAll('.expand-info:not([data-wt])');
        for (var j = 0; j < infos.length; j++) completer(infos[j]);
      }
    }).observe(tl, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ══ Où lire ══════════════════════════════════════════════════════════
   Posé le 13 novembre 2026 (n° 11 de la liste du 5 novembre). La ligne qui
   manquait à côté de « Où regarder » et « Où jouer » : les romans, comics et
   livres audio de huit timelines et les 550 lectures du Dossier.

   Ce sont des **liens de recherche**, pas des fiches : aucune base libre ne
   dit quel libraire a quel livre, et une recherche ne peut pas être fausse.
   Le titre cherché est celui de la page, sauf pour une œuvre VO sur la page
   française — elle n'existe qu'en anglais, on cherche donc son titre anglais
   (sixième place de `/search-fr.json`). Le nom de la franchise est ajouté
   quand le titre ne le porte pas : « The Road of No Return » seul ramène
   n'importe quoi. Les numéros d'une série de comics (« 1-5 », « #5-8 »)
   tombent : on cherche le recueil. L'ISBN des données n'est pris que sur la
   page anglaise — c'est celui de l'édition anglaise.

   Affiliation : `AFFIL` porte les identifiants Amazon Partenaires, vides
   tant qu'aucun compte n'est ouvert. Dès qu'un identifiant est posé, la
   ligne le dit (« liens affiliés »), c'est une obligation.

   Timelines : la ligne se pose à la fin de la fiche dépliée (`.en-rich`),
   écrite par la page au clic ; on l'attend par un observateur, comme « Où
   regarder ». Dossier : pas de fiche, donc un bouton livre à côté du lien
   de partage, qui déplie la ligne sous le titre.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var EN = document.documentElement.lang === 'en';
  var AFFIL = { fr: '', en: '' };
  var ECRIT = { roman: 1, comic: 1, jeunesse: 1, manga: 1, livre: 1, audio: 1 };
  var L = EN
    ? { lire: 'Where to read', ecouter: 'Where to listen', note: 'search links', affil: 'affiliate links',
        bouton: 'Where to read' }
    : { lire: 'Où lire', ecouter: 'Où écouter', note: 'liens de recherche', affil: 'liens affiliés',
        bouton: 'Où lire' };
  var FRANCHISE = { starwars: 'Star Wars', 'star-wars': 'Star Wars', 'dossier-star-wars': 'Star Wars',
    avatar: 'Avatar', witcher: EN ? 'Witcher' : 'Sorceleur', assassinscreed: 'Assassin’s Creed',
    dragonage: 'Dragon Age', jurassic: 'Jurassic', jurassicworld: 'Jurassic', bladerunner: 'Blade Runner',
    residentevil: 'Resident Evil', monsterverse: 'Godzilla' };
  var NOMS = ['SW', 'MCU', 'DC', 'AVATAR', 'ST', 'TWD', 'DATA_DA', 'ASSASSINSCREED', 'DCANIM',
              'JURASSIC', 'WITCHER', 'RE', 'BLADERUNNER', 'MONSTERVERSE'];

  var route = (location.pathname.split('/').filter(Boolean).pop() || '')
    .replace(/\.html$/, '').replace(/^en?-/, '');
  var MARQUE = FRANCHISE[route] || '';

  var CSS = [
    '.wl{display:flex;align-items:center;gap:6px 8px;flex-wrap:wrap;margin-top:10px;',
    '  font-size:11.5px;color:rgba(255,253,247,.72)}',
    '.wl strong{color:var(--hot);font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-right:2px}',
    '.wl-l{display:inline-flex;gap:6px;flex-wrap:wrap}',
    '.wl-l a{display:inline-grid;place-items:center;min-height:28px;padding:0 10px;border:1px solid rgba(255,253,247,.34);',
    '  border-radius:3px;background:rgba(255,255,255,.08);color:var(--paper);font-weight:700;font-size:11.5px;',
    '  white-space:nowrap;text-decoration:none}',
    '.wl-l a:hover,.wl-l a:focus-visible{border-color:var(--hot);color:var(--hot)}',
    '.wl-k{color:rgba(255,253,247,.5);font-size:10.5px;font-style:italic}',
    /* Dossier : le bouton se range à gauche du lien de partage, et se montre comme lui */
    '.bu-buy{position:absolute;top:9px;right:38px;z-index:4;width:26px;height:26px;display:grid;place-items:center;',
    '  padding:0;border:0;background:none;color:rgba(255,253,247,.5);cursor:pointer;opacity:0;transition:opacity .15s}',
    '.bu-card:hover .bu-buy,.bu-buy:focus-visible,.bu-buy[aria-expanded=true]{opacity:1}',
    '.bu-buy:hover,.bu-buy[aria-expanded=true]{color:var(--hot)}',
    '.bu-buy svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linejoin:round}',
    '@media(hover:none){.bu-buy{opacity:1}}',
    '.bu-txt .wl{margin-top:9px}'
  ].join('');
  var LIVRE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.6 1.6 0 0 0-1.6-1.6H4z"/>' +
    '<path d="M20 4.5h-6a2 2 0 0 0-2 2V20a1.6 1.6 0 0 1 1.6-1.6H20z"/></svg>';

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function dec(s){
    var t = document.createElement('textarea');
    t.innerHTML = String(s || '');
    return t.value;
  }
  function plat(s){
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  }

  /* identifiant → { type, titre, vo, isbn }, second parcours compris (`ref`) */
  var FICHES = null;
  function ficheDe(id){
    if (!FICHES) {
      var D = null;
      for (var i = 0; i < NOMS.length && !D; i++) {
        var v = window[NOMS[i]];
        if (v && typeof v === 'object' && v.eras && v.eras.length) D = v;
      }
      FICHES = {};
      if (!D) return null;
      var refs = [];
      ['eras', 'erasRewatch', 'erasReplay', 'erasRelease'].forEach(function(cle){
        (D[cle] || []).forEach(function(era){
          (era.entries || []).forEach(function(e){
            if (!e || !e.id) return;
            if (e.ref && !e.type) { refs.push([e.id, e.ref]); return; }
            FICHES[e.id] = { type: e.type, titre: dec(e.title), vo: e.lang === 'vo', isbn: e.isbn || '' };
          });
        });
      });
      refs.forEach(function(r){ if (!FICHES[r[0]] && FICHES[r[1]]) FICHES[r[0]] = FICHES[r[1]]; });
    }
    return FICHES[id] || null;
  }

  // la page française cherche une œuvre VO sous son titre anglais
  var INDEX = null;
  function titreAnglais(id, repli){
    INDEX = INDEX || fetch('/search-fr.json').then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
    return INDEX.then(function(j){
      var l = j && j.e && j.e.filter(function(x){ return x[2] === id; })[0];
      return dec((l && l[5]) || repli);
    });
  }

  function requete(titre){
    var q = dec(titre)
      .replace(/\s*\([^)]*\)/g, ' ')
      .replace(/\s+#?\d+(\s*[-–]\s*\d+)?\s*$/, '')
      .replace(/\s+/g, ' ').trim();
    // « Sorceleur » est ajouté sur la page française, mais un titre qui dit déjà « Witcher » suffit
    var deja = [MARQUE].concat(MARQUE === 'Sorceleur' ? ['Witcher'] : []).some(function(m){
      return plat(q).indexOf(plat(m)) !== -1; });
    if (MARQUE && !deja) q += ' ' + MARQUE;
    return q;
  }

  function boutiques(q, audio){
    var e = encodeURIComponent(q);
    if (audio) return [['Audible', (EN ? 'https://www.audible.com' : 'https://www.audible.fr') + '/search?keywords=' + e]];
    return EN ? [
      ['Bookshop.org', 'https://bookshop.org/search?keywords=' + e],
      ['Amazon', 'https://www.amazon.com/s?k=' + e + '&i=stripbooks' + (AFFIL.en ? '&tag=' + AFFIL.en : '')],
      ['Library', 'https://search.worldcat.org/search?q=' + e]
    ] : [
      ['Librairies indépendantes', 'https://www.placedeslibraires.fr/listeliv.php?base=allbooks&mots_recherche=' + e],
      ['Fnac', 'https://www.fnac.com/SearchResult/ResultList.aspx?Search=' + e],
      ['Amazon', 'https://www.amazon.fr/s?k=' + e + '&i=stripbooks' + (AFFIL.fr ? '&tag=' + AFFIL.fr : '')]
    ];
  }

  function ligne(q, audio, tag){
    var el = document.createElement(tag || 'div');
    el.className = 'wl';
    el.innerHTML = '<strong>' + (audio ? L.ecouter : L.lire) + '</strong><span class="wl-l">' +
      boutiques(q, audio).map(function(b){
        return '<a href="' + esc(b[1]) + '" target="_blank" rel="noopener' +
          (/amazon/.test(b[1]) && (AFFIL.fr || AFFIL.en) ? ' sponsored' : '') + '">' + esc(b[0]) + '</a>';
      }).join('') + '</span><span class="wl-k">' +
      ((EN ? AFFIL.en : AFFIL.fr) ? L.affil : L.note) + '</span>';
    return el;
  }

  // la requête d'une œuvre : ISBN en anglais, titre anglais pour la VO en français
  function requeteDe(id, f){
    if (EN && f.isbn) return Promise.resolve(f.isbn);
    if (!EN && f.vo) return titreAnglais(id, f.titre).then(requete);
    return Promise.resolve(requete(f.titre));
  }

  /* ── les timelines ─────────────────────────────────────────────── */
  function completer(rich){
    if (rich.querySelector('.wl, .expand-loading') || !rich.firstChild) return;
    var art = rich.closest('[data-id]');
    var f = art && ficheDe(art.dataset.id);
    if (!f || !ECRIT[f.type]) return;
    rich.dataset.wl = '1';
    requeteDe(art.dataset.id, f).then(function(q){
      if (!q || !rich.isConnected || rich.querySelector('.wl, .expand-loading')) return;
      var hote = rich.querySelector('.expand-info') || rich;
      hote.appendChild(ligne(q, f.type === 'audio'));
    });
  }

  /* ── le Dossier ────────────────────────────────────────────────── */
  function bouton(row){
    var card = row.querySelector('.bu-card');
    if (!card || card.querySelector('.bu-buy')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bu-buy';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', L.bouton);
    b.title = L.bouton;
    b.innerHTML = LIVRE;
    card.appendChild(b);
  }
  function deplie(b){
    var row = b.closest('.bu'), txt = row && row.querySelector('.bu-txt');
    if (!txt) return;
    var deja = txt.querySelector('.wl');
    if (deja) { deja.remove(); b.setAttribute('aria-expanded', 'false'); return; }
    var t = row.querySelector('.bu-title'), id = row.dataset.id;
    var titre = t ? t.textContent.trim() : '', vo = !!row.querySelector('.bu-tags .vo');
    var audio = row.dataset.k === 'audio';
    (!EN && vo ? titreAnglais(id, titre) : Promise.resolve(titre)).then(function(x){
      if (txt.querySelector('.wl')) return;
      txt.appendChild(ligne(requete(x), audio, 'span'));
      b.setAttribute('aria-expanded', 'true');
    });
  }

  function pose(){
    var tl = document.getElementById('timeline');
    if (!tl) return;
    var dossier = !!tl.querySelector('.bu.dr');
    if (!dossier) {
      // une page sans aucun écrit n'a rien à observer
      var D = null;
      for (var i = 0; i < NOMS.length && !D; i++) {
        var v = window[NOMS[i]];
        if (v && typeof v === 'object' && v.eras) D = v;
      }
      if (!D || !D.eras.some(function(era){
        return (era.entries || []).some(function(e){ return e && ECRIT[e.type]; }); })) return;
    }
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    if (dossier) {
      [].forEach.call(tl.querySelectorAll('.bu.dr'), bouton);
      tl.addEventListener('click', function(ev){
        var b = ev.target.closest && ev.target.closest('.bu-buy');
        if (!b) return;
        ev.preventDefault(); ev.stopPropagation();
        deplie(b);
      }, true);
      new MutationObserver(function(){
        [].forEach.call(tl.querySelectorAll('.bu.dr'), bouton);
      }).observe(tl, { childList: true, subtree: true });
      return;
    }
    new MutationObserver(function(muts){
      for (var i = 0; i < muts.length; i++) {
        var n = muts[i].target;
        if (n.nodeType !== 1) continue;
        var rich = n.closest && n.closest('.en-rich');
        if (rich) { completer(rich); continue; }
        var riches = n.querySelectorAll ? n.querySelectorAll('.en-rich') : [];
        for (var j = 0; j < riches.length; j++) if (riches[j].firstChild) completer(riches[j]);
      }
    }).observe(tl, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ══ LIGNE TERMINÉE : le billet composté et la barre dorée ═══════════
   Posé le 1er octobre 2026, demandé par Niko : une timeline finie doit se
   voir d'un coup d'œil, sur le billet du premier écran comme sur la barre
   du bas. Une copie pour les treize pages — elles portent toutes `#ticket`,
   `#k-on`, `#k-tot` et `.hud .bar` — et rien dans les protos.

   Trois choses à savoir :
   - **Le décompte du HUD fait foi**, `#k-on` contre `#k-tot`, que chaque
     page écrit déjà dans `tally()`. On l'observe plutôt que de recompter :
     le pont de rejeu et les parcours sont déjà dedans.
   - **Le tampon n'est joué qu'au passage**, quand la dernière case se coche
     sous les yeux du visiteur (`cg-fini-go`). À l'arrivée sur une page déjà
     finie, il est simplement là.
   - **Le libellé d'après la jauge s'efface** (« Restant 0 h », « 0 left ») :
     la pastille « Ligne terminée » prend sa place, il ne disait plus rien.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var FR = document.documentElement.lang !== 'en';
  var MOT = FR ? 'Ligne terminée' : 'Line complete';
  var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7"/></svg>';
  var CSS =
    '.ticket{position:relative}' +
    '.cg-fini .ticket{background:#f3d48e;' +
      'box-shadow:6px 6px 0 var(--ink),6px 6px 0 2px var(--hot)}' +
    '.cg-fini .t-stub{grid-auto-flow:row;align-content:center;gap:3px}' +
    '.t-stub .cg-ok{display:none}' +
    '.cg-fini .t-stub .cg-ok{display:block;width:26px;height:26px;margin:0 auto;border-radius:50%;' +
      'background:var(--ink);padding:4px;box-sizing:border-box}' +
    '.t-stub .cg-ok svg{display:block;width:100%;height:100%}' +
    '.t-stub .cg-ok path,.cg-fin-chip svg path{fill:none;stroke:var(--hot);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.cg-fini .t-k{align-self:flex-start;color:#a3201c;border:2px solid currentColor;border-radius:3px;' +
      'padding:2px 7px 1px;margin:0 0 5px;transform:rotate(-3deg);letter-spacing:.16em;' +
      'box-shadow:inset 0 0 0 1px rgba(163,32,28,.35);mix-blend-mode:multiply}' +
    '.cg-fini .t-st{color:#2a2536}' +
    '.cg-fini-go .t-k{animation:cg-tampon .55s cubic-bezier(.2,1.6,.4,1) both}' +
    '.cg-fini-go .ticket{animation:cg-choc .55s ease-out .18s both}' +
    '@keyframes cg-tampon{0%{transform:rotate(-14deg) scale(2.4);opacity:0}100%{transform:rotate(-3deg) scale(1);opacity:1}}' +
    '@keyframes cg-choc{0%,100%{translate:0 0}30%{translate:0 3px}}' +
    /* la barre du bas */
    '.cg-fini .hud{border-top-color:var(--hot);}' +
    '.cg-fini .hud .bar i{background:var(--hot)}' +
    '.cg-fini .hud .bar .hs,.cg-fini .hud .bar .hs.v{background:var(--hot);border-color:var(--ink)}' +
    '.cg-fini #k-on{color:var(--hot)}' +
    '.cg-fini #hud-btn .bar~.lbl{display:none}' +
    '.cg-fin-chip{display:none}' +
    '.cg-fini .cg-fin-chip{display:inline-flex;align-items:center;gap:6px;flex:none;margin-left:12px;white-space:nowrap;' +
      'background:var(--hot);color:var(--ink);border-radius:3px;padding:3px 11px 3px 5px;' +
      'font-family:"Big Shoulders Display",sans-serif;font-weight:900;font-size:14px;letter-spacing:.08em;' +
      'text-transform:uppercase;}' +
    '.cg-fin-chip svg{width:18px;height:18px;border-radius:50%;background:var(--ink);padding:3px;box-sizing:border-box}' +
    '.cg-fini-go .cg-fin-chip{animation:cg-tampon .55s cubic-bezier(.2,1.6,.4,1) .1s both}' +
    '@media(max-width:560px){.cg-fini .cg-fin-chip{font-size:12px;padding:2px 9px 2px 4px}.cg-fin-chip svg{width:16px;height:16px}}' +
    /* sur téléphone la pastille ne garde que sa coche : avec son mot, la
       barre passait sur deux lignes */
    '@media(max-width:480px){.cg-fini .cg-fin-chip{padding:3px}.cg-fin-chip span{display:none}.cg-fin-chip svg{width:18px;height:18px}}' +
    '@media(prefers-reduced-motion:reduce){.cg-fini .ticket::after,.cg-fini .hud .bar i{animation:none}' +
      '.cg-fini-go .t-k,.cg-fini-go .ticket,.cg-fini-go .cg-fin-chip{animation:none}}';

  function pose(){
    var on = document.getElementById('k-on'), tot = document.getElementById('k-tot');
    var tk = document.getElementById('ticket');
    if (!on || !tot || !tk) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var stub = tk.querySelector('.t-stub');
    if (stub) { var ok = document.createElement('span'); ok.className = 'cg-ok'; ok.innerHTML = OK; stub.appendChild(ok); }
    var bar = document.querySelector('#hud-btn .bar');
    if (bar) {
      var chip = document.createElement('span');
      chip.className = 'cg-fin-chip';
      chip.innerHTML = OK + '<span>' + MOT + '</span>';
      chip.title = MOT;
      bar.parentNode.insertBefore(chip, bar.nextSibling);
    }

    var html = document.documentElement, avant = null, minuterie = 0;
    function etat(){
      var n = parseInt(on.textContent, 10), t = parseInt(tot.textContent, 10);
      var fini = t > 0 && n >= t;
      if (fini === avant) return;
      html.classList.toggle('cg-fini', fini);
      /* le tampon ne tombe qu'au passage, pas à l'arrivée */
      if (fini && avant === false) {
        html.classList.add('cg-fini-go');
        clearTimeout(minuterie);
        minuterie = setTimeout(function(){ html.classList.remove('cg-fini-go'); }, 1200);
      }
      avant = fini;
    }
    etat();
    var obs = new MutationObserver(etat);
    obs.observe(on, { childList: true, characterData: true, subtree: true });
    obs.observe(tot, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pose);
  else pose();
})();

/* ═══ L'ITINÉRAIRE, ET LE LIEN VERS LA PAGE DE L'ŒUVRE ═════════════════════
   Posés le 5 novembre 2026. « Je veux voir Thunderbolts*, quel est le minimum ?
   » est la question qu'une timeline de 123 arrêts ne sait pas poser. On choisit
   une arrivée, on répond en arrêts et en heures, comme une appli de transport.

   **Rien ne bouge dans la timeline, et rien n'est filtré** : le visiteur ne
   réordonne pas les guides (« Ce qui est tranché »), et masquer des lignes
   demanderait de redessiner le rail de treize pages. L'itinéraire est une liste
   dans un dialogue, dont chaque case rejoue un vrai clic sur la case de la page :
   ponts, badges, dates et compteurs passent donc par leur chemin habituel.

   **Il suit ce qui est à l'écran.** L'ordre est celui des lignes du DOM, donc du
   parcours choisi ; le niveau vient des données, une entrée de second parcours
   héritant de celle qu'elle reprend (`ref`, ou son premier `covers`). Chez DC, DC
   Animation et The Witcher on reste sur la branche de l'arrivée, et chez Marvel
   les autres univers (`dim`) ne s'imposent pas à une œuvre de la ligne.

   **Le Dossier n'en a pas** : sans niveaux, l'itinéraire serait la ligne entière.
   Star Trek l'a depuis ses niveaux, le 13 novembre 2026. Le niveau dit ce que le guide juge essentiel, pas ce dont
   l'intrigue dépend : les libellés restent « essentiels », jamais « requis ». */
(function(){
  'use strict';
  var P = window.CGP;
  if (!P || !P.data || P.nom === 'CGD' || !document.querySelector('.bu[data-id]')) return;
  var FR = document.documentElement.lang !== 'en';
  var D = P.data, info = {};

  var RTS = {};
  try { if (typeof RT !== 'undefined') RTS = RT; else if (window.RT) RTS = window.RT; } catch (_) {}

  (D.eras || []).forEach(function(era){
    (era.entries || []).forEach(function(e){
      if (e && e.id) info[e.id] = { e:e, lv:e.level, br:era.branch || '', rt:e.rt || RTS[e.id] || 0, src:e.id };
    });
  });
  ['erasRewatch', 'erasReplay', 'erasRelease'].forEach(function(k){
    (D[k] || []).forEach(function(era){
      (era.entries || []).forEach(function(e){
        if (!e) return;
        var id = e.id || e.ref;
        if (!id || info[id]) return;
        var couv = e.covers || [];
        var s = info[e.ref] || info[couv[0]];
        if (!s) return;
        var rt = e.rt || 0;
        if (!rt) couv.forEach(function(c){ if (info[c]) rt += info[c].rt; });
        info[id] = { e:s.e, lv:e.level || s.lv, br:s.br, rt:rt || s.rt, src:s.src };
      });
    });
  });

  var st = document.createElement('style');
  st.textContent = [
    '.iti-b{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:15px;letter-spacing:.06em;',
    'text-transform:uppercase;color:var(--paper,#fffdf7);background:none;border:0;border-bottom:2px solid currentColor;',
    'padding:3px 1px;cursor:pointer}.iti-b:hover{color:var(--hot,#f5c842)}',
    '.iti-fiche{display:inline-block;margin-top:12px;font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    'font-size:15px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:4px 11px;border-radius:3px;',
    'border:2px solid var(--hot,#f0c97c);color:var(--hot,#f0c97c)}',
    '.iti-fiche:hover{background:var(--hot,#f0c97c);color:var(--ink,#0d0b12)}',
    '.expand-trailer-link+.iti-fiche{margin-left:8px}',
    'dialog.iti{margin:auto;width:min(620px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;',
    'background:#101019;color:#fffdf7;border:2px solid var(--uni,#f5c842);border-radius:3px;padding:20px;',
    'font:15px/1.5 \'Chivo\',sans-serif}dialog.iti::backdrop{background:rgba(4,4,10,.78)}',
    '.iti-h{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}',
    '.iti-h h2{font-family:\'Big Shoulders Display\',sans-serif;font-weight:900;font-size:28px;line-height:1;text-transform:uppercase}',
    '.iti-x{background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;width:32px;height:32px}',
    '.iti label{display:block}.iti-t{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.66;margin-bottom:4px}',
    '.iti select{width:100%;font:inherit;color:#fffdf7;background:#08080f;border:1px solid rgba(255,253,247,.3);border-radius:3px;padding:8px}',
    '.iti fieldset{border:0;margin:12px 0 0}.iti legend{padding:0}.iti-o{display:flex;flex-wrap:wrap;gap:6px 14px}',
    '.iti-o label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px}',
    '.iti-d{display:flex!important;align-items:center;gap:7px;margin-top:10px;font-size:14px;cursor:pointer}',
    '.iti-s{margin-top:16px;font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:24px;line-height:1.15;color:var(--uni,#f5c842)}',
    '.iti-p{font-size:12.5px;opacity:.66;margin-top:2px}',
    '.iti ol{list-style:none;margin:12px 0 0 7px;padding:0 0 0 18px;border-left:3px solid var(--uni,#f5c842)}',
    '.iti li{position:relative;padding:5px 0}',
    '.iti li button{position:absolute;left:-30px;top:8px;width:18px;height:18px;border-radius:50%;cursor:pointer;',
    'background:#101019;border:3px solid var(--uni,#f5c842);padding:0}',
    '.iti li button[aria-checked=true]{background:var(--uni,#f5c842)}',
    '.iti li a{color:inherit;text-decoration:none;font-weight:700}.iti li a:hover{text-decoration:underline}',
    '.iti li small{display:block;font-weight:400;opacity:.66;font-size:12.5px}',
    '.iti li.fin a{color:var(--uni,#f5c842)}'
  ].join('');
  document.head.appendChild(st);

  /* ── Le lien vers la page de l'œuvre, à l'ouverture d'une carte ───────── */
  var ROUTE = location.pathname.split('/').pop().replace(/\.html$/, '');
  var BASE = (FR ? '/fr/oeuvres/' : '/works/') + ROUTE + '/';
  var table = null;
  function chargeTable(){
    if (!table) table = fetch('/works/' + ROUTE + '.json').then(function(r){ return r.ok ? r.json() : {}; })
      .catch(function(){ return {}; });
    return table;
  }
  function poseFiche(zone){
    zone.setAttribute('data-fi', '');
    var art = zone.closest('[data-id]');
    var id = art && art.getAttribute('data-id');
    var i = id && info[id];
    if (!i || /^p-/.test(id)) return;
    chargeTable().then(function(t){
      var s = t[id] || t[i.src];
      if (!s) return;
      var a = document.createElement('a');
      a.className = 'iti-fiche';
      a.href = BASE + s;
      a.textContent = FR ? 'Fiche complète' : 'Full page';
      zone.appendChild(a);
    });
  }
  var tl = document.getElementById('timeline');
  if (tl && !/^e(n)?-/.test(ROUTE)) new MutationObserver(function(muts){
    muts.forEach(function(m){
      [].forEach.call(m.addedNodes, function(n){
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches('.expand-info:not([data-fi])')) poseFiche(n);
        if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('.expand-info:not([data-fi])'), poseFiche);
      });
    });
  }).observe(tl, { childList:true, subtree:true });

  /* ── L'itinéraire ─────────────────────────────────────────────────────── */
  var ids = Object.keys(info);
  var haut = ids.some(function(i){ return info[i].lv === 'must'; }) ? 'must'
           : ids.some(function(i){ return info[i].lv === 'imp'; }) ? 'imp' : null;
  if (!haut) return;
  var aImp = haut === 'must' && ids.some(function(i){ return info[i].lv === 'important'; });

  var T = FR ? {
    btn:'Calculer mon itinéraire', titre:'Votre itinéraire', arr:'Arrivée', rang:'Arrêts',
    ess:'Les essentiels', imp:'Essentiels et importants', tout:'Tous', deja:'Retirer ce que j’ai déjà coché',
    fermer:'Fermer', arret:function(n){ return n + (n > 1 ? ' arrêts' : ' arrêt'); }, finale:'Arrivée',
    retire:function(n){ return n + (n > 1 ? ' déjà cochés retirés' : ' déjà coché retiré'); },
    guide:'Selon les niveaux du guide, dans l’ordre du parcours affiché.', coche:'Cocher', moins:'au moins'
  } : {
    btn:'Plan my route', titre:'Your route', arr:'Destination', rang:'Stops',
    ess:'Essentials only', imp:'Essentials and important', tout:'All', deja:'Remove what I’ve already ticked',
    fermer:'Close', arret:function(n){ return n + (n > 1 ? ' stops' : ' stop'); }, finale:'Destination',
    retire:function(n){ return n + ' already ticked, removed'; },
    guide:'Based on the guide’s levels, in the order of the route on screen.', coche:'Tick', moins:'at least'
  };

  function dec(s){ var t = document.createElement('textarea'); t.innerHTML = String(s == null ? '' : s); return t.value; }
  function hm(m){ var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : '') : r + ' min'; }
  function lignes(){
    return [].filter.call(document.querySelectorAll('.bu[data-id]'), function(a){ return info[a.getAttribute('data-id')]; });
  }
  function titreDe(a){ var t = a.querySelector('.bu-title'); return t ? t.textContent.trim() : dec(info[a.getAttribute('data-id')].e.title); }
  function coche(a){ var c = a.querySelector('[data-check]'); return !!c && c.getAttribute('aria-checked') === 'true'; }

  var dlg = null, sel, liste, resume;

  function calcule(){
    var rs = lignes();
    var cible = document.getElementById(sel.value);
    var i = rs.indexOf(cible);
    if (i < 0) { liste.textContent = ''; resume.textContent = ''; return; }
    var c = info[sel.value];
    var rang = (dlg.querySelector('[name=iti-n]:checked') || {}).value || 'ess';
    var sans = dlg.querySelector('#iti-d').checked;
    var etapes = [], retires = 0, min = 0, trou = false;
    rs.slice(0, i).forEach(function(a){
      var f = info[a.getAttribute('data-id')];
      if (f.br && c.br && f.br !== c.br) return;
      if (f.e.dim && !c.e.dim && D === window.MCU) return;
      var ok = rang === 'tout' || f.lv === haut || (rang === 'imp' && f.lv === 'important');
      if (!ok) return;
      if (sans && coche(a)) { retires++; return; }
      etapes.push(a);
    });
    etapes.push(cible);
    liste.textContent = '';
    etapes.forEach(function(a){
      var id = a.getAttribute('data-id'), f = info[id];
      if (f.rt) min += f.rt; else trou = true;
      var li = document.createElement('li');
      if (a === cible) li.className = 'fin';
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'checkbox');
      b.setAttribute('aria-checked', coche(a) ? 'true' : 'false');
      b.setAttribute('aria-label', T.coche + ' : ' + titreDe(a));
      b.addEventListener('click', function(){
        var k = a.querySelector('[data-check]');
        if (k) k.click();
        b.setAttribute('aria-checked', coche(a) ? 'true' : 'false');
      });
      var l = document.createElement('a');
      l.href = '#' + id;
      l.textContent = titreDe(a);
      l.addEventListener('click', function(){ dlg.close(); });
      var sub = (f.e.subitems || [])[0];
      if (sub) { var s = document.createElement('small'); s.textContent = dec(sub); l.appendChild(s); }
      li.appendChild(b); li.appendChild(l);
      liste.appendChild(li);
    });
    resume.querySelector('b').textContent = T.arret(etapes.length) + (min ? ' · ' + (trou ? T.moins + ' ' : '') + hm(min) : '');
    resume.querySelector('span').textContent = (retires ? T.retire(retires) + '. ' : '') + T.guide;
  }

  function bati(){
    dlg = document.createElement('dialog');
    dlg.className = 'iti';
    dlg.innerHTML = '<div class="iti-h"><h2>' + T.titre + '</h2><button type="button" class="iti-x" aria-label="' + T.fermer + '">✕</button></div>' +
      '<label><span class="iti-t">' + T.arr + '</span><select id="iti-a"></select></label>' +
      '<fieldset><legend class="iti-t">' + T.rang + '</legend><div class="iti-o">' +
      '<label><input type="radio" name="iti-n" value="ess" checked> ' + T.ess + '</label>' +
      (aImp ? '<label><input type="radio" name="iti-n" value="imp"> ' + T.imp + '</label>' : '') +
      '<label><input type="radio" name="iti-n" value="tout"> ' + T.tout + '</label></div></fieldset>' +
      '<label class="iti-d"><input type="checkbox" id="iti-d" checked> ' + T.deja + '</label>' +
      '<div class="iti-resume"><p class="iti-s"><b></b></p><p class="iti-p"><span></span></p></div><ol></ol>';
    document.body.appendChild(dlg);
    sel = dlg.querySelector('#iti-a');
    liste = dlg.querySelector('ol');
    resume = dlg.querySelector('.iti-resume');
    var vus = {};
    lignes().forEach(function(a){
      var id = a.getAttribute('data-id'), f = info[id], t = titreDe(a);
      if (/^p-/.test(id)) return;
      var k = t + '|' + f.br;
      if (vus[k]) return;
      vus[k] = 1;
      var o = document.createElement('option');
      o.value = id;
      o.textContent = t;
      sel.appendChild(o);
    });
    dlg.querySelector('.iti-x').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('change', calcule);
    dlg.addEventListener('click', function(ev){ if (ev.target === dlg) dlg.close(); });
  }
  function ouvre(id){
    if (!dlg) bati();
    if (id) sel.value = id;
    /* Sans arrivée demandée, la dernière choisie, sinon le terminus : un select
       s'ouvre sur sa première option, et un itinéraire d'un seul arrêt n'apprend rien. */
    else if (!dlg.dataset.vu && sel.options.length) sel.selectedIndex = sel.options.length - 1;
    dlg.dataset.vu = '1';
    calcule();
    if (!dlg.open) dlg.showModal();
  }

  var go = document.querySelector('.ln-go');
  if (go) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'iti-b'; b.textContent = T.btn;
    b.addEventListener('click', function(){ ouvre(); });
    go.appendChild(b);
  }

  /* Un lien de page d'œuvre : `?vers=<id>`. On le retire de l'URL aussitôt,
     sans quoi recharger la page rouvrirait le dialogue. */
  var q = null;
  try { q = new URLSearchParams(location.search).get('vers'); } catch (_) {}
  if (q) {
    var cible = document.getElementById(q);
    if (!cible || !info[q]) {
      var t = lignes().filter(function(a){ return info[a.getAttribute('data-id')].src === q; })[0];
      cible = t || cible;
    }
    if (cible && info[cible.getAttribute('data-id')]) {
      var vid = cible.getAttribute('data-id');
      if (!dlg) bati();
      /* La liste ne garde qu'un représentant par titre : on y ajoute celui-ci. */
      var f = [].filter.call(sel.options, function(o){ return o.value === vid; })[0];
      if (!f) {
        var op = [].filter.call(sel.options, function(o){ return o.textContent === titreDe(cible); })[0];
        if (op) op.value = vid;
      }
      ouvre(vid);
    }
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  }
})();

/* ═══ LES RÉGLAGES ══════════════════════════════════════════════════════
   Posés le 5 novembre 2026, demandés par Niko. Une roue dentée dans le menu,
   à côté du drapeau (posée par `publier.mjs`, voir `reglages.mjs`), ouvre un
   dialogue. Tout tient dans une clé, `cg-options`, sans compte.

   Ce qui se joue où :
   - **Masquer des types, un niveau, la VO** : `CG_OPT.garde()` de
     `e-perso.js`, après la résolution des parcours, sur les treize timelines ;
     le Dossier a son tri en ligne ; l'accueil recompte avec `/reglages.js`.
   - **Le reste de l'affichage** (cartes compactes, grand texte, contraste,
     calme, anti-spoil) : le CSS du <head>, avant le premier rendu.
   - **Ici** : le panneau, le rappel « Tout réafficher », les coches masquées
     partout, les boutons de filtres qui n'ont plus d'objet, les titres
     originaux, et les plateformes mises en avant sur la timeline.

   Une option ne retire jamais rien du stockage : la progression d'une œuvre
   masquée reste où elle est, et revient avec elle.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var O = window.CG_OPT;
  if (!O) return;                  /* un proto servi sans publication */
  var EN = document.documentElement.lang === 'en';
  var KEY = 'cg-options';

  function lis(){
    try { var o = JSON.parse(localStorage.getItem(KEY)); return o && typeof o === 'object' ? o : {}; }
    catch (_) { return {}; }
  }
  /* Une option à sa valeur par défaut n'est pas écrite : le fichier
     d'export et le lien de transfert n'emportent que ce qui a été choisi. */
  function propre(o){
    var r = {};
    Object.keys(o).forEach(function(k){
      var v = o[k];
      if (v === 0 || v === false || v === '' || v == null) return;
      if (Array.isArray(v) && !v.length) return;
      if (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) return;
      r[k] = v;
    });
    return r;
  }
  O.ecrire = function(v){
    try {
      var o = propre(v || {});
      if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o));
      else localStorage.removeItem(KEY);
      return true;
    } catch (_) { return false; }
  };

  var T = EN ? {
    titre: 'Settings', dek: 'Saved in this browser, no account. Your settings travel with your exports and transfer link.',
    contenu: 'Content', types: 'Hide these media everywhere', niveau: 'Level', nTout: 'Everything',
    nImp: 'Essentials and important', nMust: 'Essentials only', nNote: 'Star Trek has no levels and is not affected.',
    vf: 'Only what exists in French', vus: 'Hide what I’ve finished, on every page', vo: 'Original titles',
    univers: 'My universes', uNote: 'On the home page and on Upcoming. A star puts it first.',
    fav: 'Favourite', cacher: 'Hide', spoil: 'Spoilers', sp: 'Hide the synopsis until the box is ticked (the FAQ stays)',
    flou: 'Blur posters until ticked', aff: 'Display', cp: 'Compact cards, no thumbnails', txt: 'Larger text',
    ctr: 'Stronger contrast', calme: 'No intro screen, no line animations',
    regarder: 'Where to watch', pays: 'My country', defaut: 'Default', pf: 'My platforms',
    pfNote: 'Shown first in “Where to watch”, and marked on the timeline.', pfVide: 'The platform list is unavailable right now.',
    jouer: 'Where to play', cs: 'My consoles', csNote: 'Shown first in “Where to play”.',
    raz: 'Reset all', fermer: 'Close', applique: 'Apply',
    masques: 'Hidden', stops: function(a, b){ return a + ' / ' + b + ' stops shown'; },
    tout: 'Show everything', modifier: 'Settings',
    vusR: 'Finished works hidden', lvMust: 'essentials only', lvImp: 'essentials and important', voR: 'original-language only',
    susLien: 'Settings paused to show the work you asked for', reapp: 'Apply them again',
    susVide: 'Your settings would hide the whole timeline: it is shown in full',
    uOff: function(n){ return n + (n > 1 ? ' universes hidden' : ' universe hidden'); }
  } : {
    titre: 'Réglages', dek: 'Enregistrés dans ce navigateur, sans compte. Vos réglages voyagent dans vos exports et dans le lien de transfert.',
    contenu: 'Contenu', types: 'Masquer ces médias sur tout le site', niveau: 'Niveau', nTout: 'Tout',
    nImp: 'Essentiels et importants', nMust: 'Essentiels seulement', nNote: 'Star Trek n’a pas de niveaux : il n’est pas concerné.',
    vf: 'Seulement ce qui existe en français', vus: 'Masquer ce que j’ai terminé, sur toutes les pages', vo: 'Titres originaux',
    univers: 'Mes univers', uNote: 'À l’accueil et sur « À venir ». L’étoile le met en premier.',
    fav: 'Favori', cacher: 'Masquer', spoil: 'Anti-spoil', sp: 'Cacher le synopsis tant que la case n’est pas cochée (la FAQ reste)',
    flou: 'Flouter les affiches non cochées', aff: 'Affichage', cp: 'Cartes compactes, sans vignette', txt: 'Texte plus grand',
    ctr: 'Contraste renforcé', calme: 'Sans écran d’arrivée ni animations de la ligne',
    regarder: 'Où regarder', pays: 'Mon pays', defaut: 'Par défaut', pf: 'Mes plateformes',
    pfNote: 'Mises en premier dans « Où regarder », et signalées sur la timeline.', pfVide: 'La liste des plateformes est indisponible pour l’instant.',
    jouer: 'Où jouer', cs: 'Mes consoles', csNote: 'Mises en premier dans « Où jouer ».',
    raz: 'Tout réinitialiser', fermer: 'Fermer', applique: 'Appliquer',
    masques: 'Masqués', stops: function(a, b){ return a + ' / ' + b + ' arrêts affichés'; },
    tout: 'Tout réafficher', modifier: 'Réglages',
    vusR: 'Œuvres terminées masquées', lvMust: 'essentiels seulement', lvImp: 'essentiels et importants', voR: 'VO masquée',
    susLien: 'Réglages suspendus pour montrer l’œuvre demandée', reapp: 'Les réappliquer',
    susVide: 'Vos réglages masqueraient toute la timeline : elle s’affiche entière',
    uOff: function(n){ return n + (n > 1 ? ' univers masqués' : ' univers masqué'); }
  };

  /* Les pays où l'on regarde le plus le site, et ceux qu'on a demandés :
     la Belgique, la Suisse, le Canada. Les noms viennent du navigateur. */
  var PAYS = ['FR', 'BE', 'CH', 'LU', 'CA', 'US', 'GB', 'IE', 'DE', 'ES', 'IT', 'NL', 'AU'];
  function nomPays(c){
    try { return new Intl.DisplayNames([EN ? 'en' : 'fr'], { type: 'region' }).of(c); } catch (_) { return c; }
  }

  /* Le panneau reprend le dessin du site : le filet aux treize encres du
     billet, une ligne de métro dont chaque section est une station, des
     pastilles arrondies, les codes de ligne des univers. Redessiné le
     7 novembre 2026, à la demande de Niko. */
  var ENCRES = ['#4d9fff', '#e23636', '#f5c842', '#7dd3fc', '#b48cf2', '#a8bf4f', '#e07b39',
                '#d4a02c', '#2dd4bf', '#45c46b', '#b0bec5', '#dc0000', '#ff5f1f', '#d946ef'];
  var FILET = 'linear-gradient(90deg,' + ENCRES.map(function(c, i){
    return c + ' ' + (i * 100 / ENCRES.length).toFixed(2) + '% ' + ((i + 1) * 100 / ENCRES.length).toFixed(2) + '%';
  }).join(',') + ')';
  var BS = "'Big Shoulders Display','BSD repli',sans-serif";
  var CSS = [
    /* Un attribut `hidden` ne suffit jamais sur ce site. */
    '#sieve button[hidden]{display:none!important}',
    '.rg-rap{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 10px;width:max-content;max-width:100%;',
    '  margin:18px auto 4px;padding:8px 16px;border:1.5px dashed var(--hot);border-radius:3px;color:var(--paper);font-size:13px;line-height:1.4;text-align:center}',
    '.rg-rap b{font-family:' + BS + ';font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--hot)}',
    '.rg-rap button{font:inherit;font-size:12.5px;background:none;border:0;padding:0;color:var(--paper);text-decoration:underline;cursor:pointer}',
    '.rg-rap button:hover{color:var(--hot)}',

    '.rg{width:min(640px,calc(100vw - 20px));max-height:calc(100dvh - 20px);margin:auto;padding:0;color:var(--paper);',
    '  background:#0f0d16;border:0;border-radius:3px;overflow:hidden auto;overscroll-behavior:contain;',
    '  box-shadow:0 0 0 1px rgba(255,253,247,.14)}',
    '.rg::backdrop{background:rgba(8,8,15,0.91);}',
    '.rg-tete{position:sticky;top:0;z-index:3;background:#0f0d16;padding:0 0 14px;border-bottom:1px solid rgba(255,253,247,.1)}',
    '.rg-filet{height:5px;background:' + FILET + '}',
    '.rg h2{display:flex;align-items:center;gap:11px;margin:18px 70px 6px 24px;font-family:' + BS + ';font-weight:900;',
    '  font-size:30px;letter-spacing:.02em;text-transform:uppercase;line-height:1}',
    '.rg h2 svg{width:26px;height:26px;flex:0 0 auto;color:var(--hot)}',
    '.rg h2 svg .moyeu{fill:var(--hot)}',
    '.rg-dek{margin:0 24px;font-size:12.5px;line-height:1.5;color:rgba(255,253,247,.62)}',
    '.rg-x{position:absolute;top:16px;right:18px;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;',
    '  background:rgba(255,253,247,.06);border:1px solid rgba(255,253,247,.18);color:rgba(255,253,247,.75);cursor:pointer;font-size:13px;line-height:1}',
    '.rg-x:hover{background:var(--paper);color:var(--ink)}',

    /* la ligne : un trait doré le long des sections, une station par section */
    '.rg-corps{position:relative;padding:4px 24px 10px 60px;min-height:120px}',
    '.rg-corps::before{content:"";position:absolute;left:35px;top:34px;bottom:40px;width:3px;border-radius:2px;',
    '  background:var(--hot)}',
    '.rg-s{position:relative;padding:20px 0 8px}',
    '.rg-s+.rg-s{border-top:1px dashed rgba(255,253,247,.12)}',
    '.rg-s::before{content:attr(data-n);position:absolute;left:-38px;top:18px;width:26px;height:26px;box-sizing:border-box;',
    '  border-radius:50%;background:#0f0d16;border:3px solid var(--hot);color:var(--hot);',
    '  font:800 12px/20px ' + BS + ';text-align:center}',
    '.rg-s h3{margin:0 0 4px;font-family:' + BS + ';font-weight:800;font-size:18px;letter-spacing:.07em;',
    '  text-transform:uppercase;line-height:1.3;color:var(--paper)}',
    '.rg-l{margin:14px 0 8px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,253,247,.5)}',
    '.rg-n{margin:8px 0 0;font-size:11.5px;line-height:1.45;color:rgba(255,253,247,.48);font-style:italic}',

    /* les pastilles */
    '.rg-ch{display:flex;flex-wrap:wrap;gap:7px}',
    '.rg-ch button{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:6px 13px;border-radius:3px;cursor:pointer;',
    '  font:600 12.5px/1.1 inherit;color:var(--paper);background:rgba(255,253,247,.05);border:1.5px solid rgba(255,253,247,.2);',
    '  transition:background .15s,border-color .15s,color .15s}',
    '.rg-ch button:hover{border-color:rgba(255,253,247,.6)}',
    '.rg-ch:not(.barre) button[aria-pressed=true]{background:var(--hot);border-color:var(--hot);color:var(--ink)}',
    '.rg-ch:not(.barre) button[aria-pressed=true]::before{content:"";width:8px;height:4px;margin:-3px 1px 0 -2px;',
    '  border-left:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg)}',
    /* un type masqué : barré, en pointillés, comme une voie fermée */
    '.rg-ch.barre button[aria-pressed=true]{background:none;border-style:dashed;border-color:rgba(255,253,247,.28);',
    '  color:rgba(255,253,247,.42);text-decoration:line-through}',
    '.rg-ch img{height:20px;width:auto;max-width:58px;display:block;border-radius:3px}',
    '.rg-ch img.cs{border-radius:0;filter:brightness(0) invert(1)}',
    '.rg-ch button[aria-pressed=true] img.cs{filter:brightness(0)}',
    '.rg-ch button:has(img.cs){padding:6px 14px}',

    /* le niveau : un sélecteur à trois voies */
    '.rg-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border-radius:3px;background:rgba(255,253,247,.06)}',
    '.rg-seg button{min-height:38px;padding:7px 6px;border:0;border-radius:3px;background:none;cursor:pointer;',
    '  font:600 12.5px/1.15 inherit;color:rgba(255,253,247,.78)}',
    '.rg-seg button:hover{color:var(--paper);background:rgba(255,253,247,.06)}',
    '.rg-seg button[aria-pressed=true]{background:var(--hot);color:var(--ink);font-weight:700}',

    /* les interrupteurs */
    '.rg-sw{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:7px 0;padding:11px 14px;cursor:pointer;',
    '  font-size:13.5px;line-height:1.35;border-radius:3px;background:rgba(255,253,247,.04);border:1px solid rgba(255,253,247,.08)}',
    '.rg-sw:hover{border-color:rgba(255,253,247,.22)}',
    '.rg-sw input{appearance:none;-webkit-appearance:none;flex:0 0 auto;position:relative;width:40px;height:23px;margin:0;',
    '  border-radius:999px;background:rgba(255,253,247,.18);cursor:pointer;transition:background .2s}',
    '.rg-sw input::after{content:"";position:absolute;top:3px;left:3px;width:17px;height:17px;border-radius:50%;',
    '  background:var(--paper);transition:transform .2s cubic-bezier(.3,1.4,.5,1)}',
    '.rg-sw input:checked{background:var(--hot)}',
    '.rg-sw input:checked::after{transform:translateX(17px);background:var(--ink)}',
    '.rg-sw input:focus-visible,.rg-ch button:focus-visible,.rg-seg button:focus-visible,.rg-uc button:focus-visible,.rg select:focus-visible',
    '  {outline:2px solid var(--hot);outline-offset:2px}',

    /* les univers : leur code de ligne, à leur encre */
    '.rg-u{display:grid;grid-template-columns:1fr 1fr;gap:7px}',
    '.rg-uc{display:flex;align-items:center;gap:9px;padding:7px 7px 7px 9px;border-radius:3px;',
    '  background:rgba(255,253,247,.04);border:1px solid rgba(255,253,247,.08);transition:opacity .2s,border-color .2s}',
    '.rg-uc b{flex:0 0 auto;min-width:36px;padding:3px 6px;border-radius:3px;text-align:center;background:var(--k);color:#0d0b12;',
    '  font:800 12px/1.2 ' + BS + ';letter-spacing:.06em}',
    '.rg-uc b.w{color:#fffdf7}',
    '.rg-uc span{flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.rg-uc button{flex:0 0 auto;width:30px;height:30px;display:grid;place-items:center;border-radius:50%;border:0;',
    '  background:none;color:rgba(255,253,247,.4);cursor:pointer}',
    '.rg-uc button:hover{color:var(--paper);background:rgba(255,253,247,.08)}',
    '.rg-uc button svg{width:17px;height:17px;display:block}',
    '.rg-uc button[data-v=fav][aria-pressed=true]{color:var(--hot)}',
    '.rg-uc button[data-v=off][aria-pressed=true]{color:var(--paper);background:rgba(255,253,247,.12)}',
    '.rg-uc.fav{border-color:color-mix(in srgb,var(--hot) 55%,transparent)}',
    '.rg-uc.off{opacity:.45}',
    '.rg-uc.off span{text-decoration:line-through}',

    '.rg select{appearance:none;-webkit-appearance:none;max-width:100%;padding:9px 38px 9px 13px;border-radius:3px;cursor:pointer;',
    '  font:600 13.5px inherit;color:var(--paper);background-color:rgba(255,253,247,.06);border:1px solid rgba(255,253,247,.18);',
    '  background-image:linear-gradient(45deg,transparent 50%,var(--hot) 50%),linear-gradient(135deg,var(--hot) 50%,transparent 50%);',
    '  background-position:calc(100% - 19px) 55%,calc(100% - 13px) 55%;background-size:6px 6px;background-repeat:no-repeat}',
    '.rg option{background:#0f0d16;color:var(--paper)}',

    '.rg-bar{position:sticky;bottom:0;z-index:3;display:flex;gap:12px;align-items:center;justify-content:space-between;',
    '  padding:14px 24px;background:#0f0d16;border-top:1px solid rgba(255,253,247,.1)}',
    '.rg-raz{font:inherit;font-size:12.5px;background:none;border:0;padding:0;color:rgba(255,253,247,.6);text-decoration:underline;cursor:pointer}',
    '.rg-raz:hover{color:var(--paper)}',
    '.rg-go{font-family:' + BS + ';font-weight:800;font-size:16px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;',
    '  background:var(--hot);border:0;border-radius:3px;color:var(--ink);padding:10px 26px;transition:background .15s}',
    '.rg-go:hover{background:var(--paper)}',
    '@media(max-width:560px){.rg h2{font-size:26px;margin-left:18px}.rg-dek{margin:0 18px}',
    '  .rg-corps{padding:2px 16px 10px 48px}.rg-corps::before{left:25px}.rg-s::before{left:-34px}',
    '  .rg-u{grid-template-columns:1fr}.rg-bar{padding:12px 16px}.rg-x{right:14px}.rg-seg button{font-size:11.5px;padding:7px 3px}}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var ETOILE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.1 1.1 5.9-5.2-2.8-5.2 2.8 1.1-5.9L3.6 9.8l5.9-.8z"/></svg>';
  var OEIL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20 20 4"/></svg>';

  function cap(s){ s = String(s).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function dec(s){ var t = document.createElement('textarea'); t.innerHTML = String(s == null ? '' : s); return t.value; }

  /* ── P : les coches masquées partout ────────────────────────────────
     Le bouton de la page ne vaut plus pour elle seule : il écrit le
     réglage, et chaque page le reprend à son chargement. Le rappel
     « Reprendre » qui remet les filtres à zéro ne le touche pas — il ne
     passe pas par le bouton. */
  var hd = document.getElementById('hide-done');
  if (hd) {
    if (O.o.vus && hd.getAttribute('aria-pressed') !== 'true') hd.click();
    hd.addEventListener('click', function(){
      setTimeout(function(){
        var o = lis();
        if (hd.getAttribute('aria-pressed') === 'true') o.vus = 1; else delete o.vus;
        O.ecrire(o); O.o.vus = o.vus;
        rappel();
      }, 0);
    });
  }

  /* ── les boutons de filtres qui n'ont plus d'objet ──────────────────
     Un type masqué n'a plus rien à filtrer : son bouton s'en va, sans quoi
     le panneau de la page et celui des réglages se contrediraient. */
  if (O.stat && !O.stat.suspendu) {
    var T_ = {};
    (O.o.t || []).forEach(function(k){ T_[k] = 1; });
    [].forEach.call(document.querySelectorAll('#sieve [data-k]'), function(b){ if (T_[b.dataset.k]) b.hidden = true; });
    var aMust = !!document.querySelector('#sieve [data-lv="must"]');
    [].forEach.call(document.querySelectorAll('#sieve [data-lv]'), function(b){
      var l = b.dataset.lv;
      if (O.o.n && l === 'bonus') b.hidden = true;
      if (O.o.n === 'must' && aMust && (l === 'imp' || l === 'important')) b.hidden = true;
    });
  }

  /* La bande du premier écran compte les films, les séries, les jeux sur la
     page entière, écrits à la publication : avec des médias masqués, ces
     cases mentiraient. Seules restent celles que la page recalcule (arrêts,
     trajet), qui portent un identifiant. */
  if (O.stat && !O.stat.suspendu && O.stat.reste < O.stat.total)
    [].forEach.call(document.querySelectorAll('.ln-board.stats .s'), function(s){
      if (!s.querySelector('[id]')) s.style.display = 'none';
    });

  /* ── le rappel ───────────────────────────────────────────────────────
     Une page à quarante arrêts au lieu de soixante-deux aurait l'air
     cassée : dès que quelque chose est masqué, la page le dit, avec de
     quoi tout réafficher. */
  var rap = null;
  /* Le rappel nomme des familles, pas une carte : le pluriel des types connus,
     le libellé de la page pour les autres. Les mêmes que `reglages.mjs`. */
  var PLUR = {
    film: ['Films', 'Movies'], filmanim: ['Films animés', 'Animated movies'], serie: ['Séries', 'Series'],
    anime: ['Séries animées', 'Animated series'], jeu: ['Jeux vidéo', 'Video games'], dlc: ['DLC', 'DLC'],
    comic: ['Comics', 'Comics'], roman: ['Romans', 'Novels'], jeunesse: ['Romans jeune adulte', 'Young adult novels'],
    audio: ['Livres audio', 'Audiobooks'], short: ['Courts métrages', 'Short films'], video: ['Vidéos', 'Videos'],
    web: ['Webséries', 'Web series'], special: ['Spéciaux', 'Specials']
  };
  function labels(){
    var CG = window.CG || {}, l = {};
    var l0 = l;
    Object.keys(PLUR).forEach(function(k){ l0['_' + k] = PLUR[k][EN ? 1 : 0]; });
    var b = CG.badgeLabels || {};
    Object.keys(b).forEach(function(k){ l[k] = cap(dec(b[k][1])); });
    var kl = CG.kindLabels || (window.CGDT && CGDT.kindLabels) || {};
    Object.keys(kl).forEach(function(k){ l[k] = cap(dec(kl[k])); });
    Object.keys(l).forEach(function(k){ if (k.charAt(0) !== '_' && l['_' + k]) l[k] = l['_' + k]; });
    return l;
  }
  function ancre(){
    var i = document.getElementById('intro');
    if (i) return i.closest('.wrap') || i;
    var s = document.querySelector('.slot[data-u]');
    if (s) return s.parentNode;
    return document.getElementById('cal');
  }
  function rappel(){
    var bouts = [], actions = '';
    var S = O.stat;
    if (S && S.suspendu === 'lien') {
      bouts.push(T.susLien);
      actions = '<button type="button" data-rg="reapp">' + T.reapp + '</button>';
    } else if (S && S.suspendu === 'vide') {
      bouts.push(T.susVide);
      actions = '<button type="button" data-reglages>' + T.modifier + '</button>';
    } else {
      /* sur une page qui a des entrées, seulement ce qu'elle a vraiment retiré ;
         ailleurs (accueil, Dossiers), tout ce qui est réglé */
      var global = !S && O.masque && !!document.querySelector('.slot[data-u]');
      if ((S && S.reste < S.total) || global) {
        var l = labels(), noms = (O.o.t || []).filter(function(k){ return global ? PLUR[k] || l[k] : l[k] && (!S.t || S.t[k]); })
          .map(function(k){ return global && PLUR[k] ? PLUR[k][EN ? 1 : 0] : l[k]; });
        var q = [];
        if (noms.length) q.push(noms.join(', '));
        if (O.o.n === 'must' && (global || S.lv)) q.push(T.lvMust);
        if (O.o.n === 'imp' && (global || S.lv)) q.push(T.lvImp);
        if (O.o.vf && !EN && (global || S.vf)) q.push(T.voR);
        bouts.push('<b>' + T.masques + '</b> ' + q.join(' · '));
        if (S) bouts.push(T.stops(S.reste, S.total));
      }
      if (O.o.vus && hd) bouts.push(T.vusR);
      if (O.accueil && O.accueil.off) bouts.push(T.uOff(O.accueil.off));
      if (bouts.length) actions = '<button type="button" data-rg="tout">' + T.tout + '</button> · ' +
        '<button type="button" data-reglages>' + T.modifier + '</button>';
    }
    if (!bouts.length) { if (rap) { rap.remove(); rap = null; } return; }
    if (!rap) {
      var a = ancre();
      if (!a) return;
      rap = document.createElement('p');
      rap.className = 'rg-rap';
      rap.setAttribute('role', 'status');
      a.parentNode.insertBefore(rap, a);
    }
    rap.innerHTML = bouts.join(' · ') + (actions ? ' · ' + actions : '');
  }
  rappel();
  O.rappel = rappel;

  document.addEventListener('click', function(ev){
    var b = ev.target.closest && ev.target.closest('[data-rg]');
    if (!b) return;
    if (b.dataset.rg === 'reapp') {
      if (history.replaceState) history.replaceState(null, '', location.pathname);
      location.reload();
    } else if (b.dataset.rg === 'tout') {
      var o = lis();
      delete o.t; delete o.n; delete o.vf; delete o.vus;
      if (o.u) Object.keys(o.u).forEach(function(k){ if (o.u[k] === 'off') delete o.u[k]; });
      O.ecrire(o);
      try {
        var c = 'cg-filtres-' + location.pathname, f = JSON.parse(localStorage.getItem(c) || 'null');
        if (f) { delete f['hide-done']; localStorage.setItem(c, JSON.stringify(f)); }
      } catch (_) {}
      location.reload();
    }
  });

  /* Un lien vers une œuvre masquée, suivi sans quitter la page : on
     recharge, et `garde()` suspend le tri pour la montrer. */
  addEventListener('hashchange', function(){
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) {}
    if (id && O.voitId && !O.voitId(id) && !document.getElementById(id)) location.reload();
  });

  /* ── M : les titres originaux ────────────────────────────────────────
     `garde()` les pose avant le rendu, depuis un cache : l'index de la
     recherche porte le titre anglais en sixième place, et il arrive trop
     tard pour un rendu synchrone. Le cache se refait chaque semaine. */
  var TKEY = 'cg-titres-vo';
  function titres(){
    return fetch('/search-fr.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
      if (!j || !j.e) return null;
      var m = {};
      j.e.forEach(function(x){ if (x[5]) m[x[2]] = x[5]; });
      try { localStorage.setItem(TKEY, JSON.stringify({ d: Date.now(), m: m })); } catch (_) {}
      return m;
    }).catch(function(){ return null; });
  }
  if (O.o.vo && !EN) {
    var c0 = null;
    try { c0 = JSON.parse(localStorage.getItem(TKEY) || 'null'); } catch (_) {}
    if (!c0 || !c0.d || Date.now() - c0.d > 7 * 864e5) titres().then(function(m){
      /* première fois : la page est déjà rendue, on reprend les titres à l'écran */
      if (!m || c0) return;
      [].forEach.call(document.querySelectorAll('.bu[data-id]'), function(a){
        var t = m[a.dataset.id], h = a.querySelector('.bu-title');
        if (t && h) h.textContent = t;
      });
    });
  }

  /* ── K : mes plateformes, sur la timeline ────────────────────────────
     `/plateformes.json` est refait chaque nuit par une action (voir
     `plateformes.mjs`) : une seule requête au lieu d'une par œuvre. Il n'est
     demandé que si le visiteur a choisi ses plateformes. */
  var PF = null;
  function plateformesJson(){
    return PF || (PF = fetch('/plateformes.json').then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; }));
  }
  if ((O.o.pf || []).length && document.querySelector('.bu-panel[data-tmdb]')) {
    plateformesJson().then(function(j){
      if (!j || !j.w) return;
      var pays = (window.CG_WT && CG_WT.pays) || O.o.pays || (EN ? 'US' : 'FR');
      var mes = {};
      O.o.pf.forEach(function(k){ mes[k] = 1; });
      [].forEach.call(document.querySelectorAll('.bu[data-id]'), function(a){
        var p = a.querySelector('.bu-panel[data-tmdb]'), tg = a.querySelector('.bu-tags');
        if (!p || !tg || tg.querySelector('.wt-m')) return;
        var w = j.w[p.dataset.media + '/' + p.dataset.tmdb], l = w && w[pays];
        if (!l) return;
        var ici = l.map(function(i){ return j.p[i]; }).filter(function(x){ return x && mes[x[0]]; });
        if (!ici.length) return;
        var s = document.createElement('span');
        s.className = 'wt-m';
        ici.slice(0, 3).forEach(function(x){
          var im = document.createElement('img');
          im.src = 'https://image.tmdb.org/t/p/w92' + x[2];
          im.alt = x[1]; im.title = x[1]; im.loading = 'lazy';
          s.appendChild(im);
        });
        tg.appendChild(s);
      });
    });
  }

  /* ── le panneau ──────────────────────────────────────────────────── */
  var dlg = null, avant = '';
  function table(){
    if (window.CG_TABLE) return Promise.resolve(window.CG_TABLE);
    return new Promise(function(ok){
      var s = document.createElement('script');
      s.src = '/reglages.js';
      s.onload = function(){ ok(window.CG_TABLE || null); };
      s.onerror = function(){ ok(null); };
      document.head.appendChild(s);
    });
  }
  function bouton(txt, on, attrs){
    return '<button type="button" aria-pressed="' + (on ? 'true' : 'false') + '"' + (attrs || '') + '>' + txt + '</button>';
  }
  /* le texte d'abord, l'interrupteur au bout de la ligne */
  function sw(id, txt, on){
    return '<label class="rg-sw" for="rg-' + id + '"><span>' + txt + '</span><input type="checkbox" id="rg-' + id + '"' + (on ? ' checked' : '') + '/></label>';
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var NOIR = { mcu: 1, residentevil: 1 };   /* leur rouge est trop sombre pour l'encre */
  function section(n, titre, corps){
    return '<section class="rg-s" data-n="' + n + '"><h3>' + titre + '</h3>' + corps + '</section>';
  }

  function remplis(tab, pf){
    var o = lis(), h = '', c = '';
    var T_ = {};
    (o.t || []).forEach(function(k){ T_[k] = 1; });
    c = '<p class="rg-l">' + T.types + '</p><div class="rg-ch barre" id="rg-t">';
    if (tab) Object.keys(tab.types).sort(function(a, b){
      return tab.types[a][EN ? 1 : 0].localeCompare(tab.types[b][EN ? 1 : 0]);
    }).forEach(function(k){ c += bouton(esc(tab.types[k][EN ? 1 : 0]), T_[k], ' data-t="' + k + '"'); });
    c += '</div><p class="rg-l">' + T.niveau + '</p><div class="rg-seg" id="rg-n">' +
      bouton(T.nTout, !o.n, ' data-n=""') + bouton(T.nImp, o.n === 'imp', ' data-n="imp"') +
      bouton(T.nMust, o.n === 'must', ' data-n="must"') + '</div><p class="rg-n">' + T.nNote + '</p><p class="rg-l"></p>';
    if (!EN) c += sw('vf', T.vf, o.vf);
    c += sw('vus', T.vus, o.vus);
    if (!EN) c += sw('vo', T.vo, o.vo);
    h += section(1, T.contenu, c);

    c = '<div class="rg-u" id="rg-u">';
    if (tab) Object.keys(tab.u).forEach(function(k){
      var u = tab.u[k];
      if (u.dossier) return;
      var e = (o.u || {})[k], nom = esc(u.n[EN ? 1 : 0]);
      c += '<div class="rg-uc' + (e ? ' ' + e : '') + '" data-u="' + k + '" style="--k:' + u.c + '">' +
        '<b' + (NOIR[k] ? ' class="w"' : '') + '>' + esc(u.k || '') + '</b><span>' + nom + '</span>' +
        '<button type="button" data-v="fav" aria-pressed="' + (e === 'fav') + '" aria-label="' + T.fav + ' : ' + nom + '" title="' + T.fav + '">' + ETOILE + '</button>' +
        '<button type="button" data-v="off" aria-pressed="' + (e === 'off') + '" aria-label="' + T.cacher + ' : ' + nom + '" title="' + T.cacher + '">' + OEIL + '</button></div>';
    });
    h += section(2, T.univers, c + '</div><p class="rg-n">' + T.uNote + '</p>');

    h += section(3, T.spoil, sw('sp', T.sp, o.sp) + sw('flou', T.flou, o.flou));
    h += section(4, T.aff, sw('cp', T.cp, o.cp) + sw('txt', T.txt, o.txt) + sw('ctr', T.ctr, o.ctr) + sw('calme', T.calme, o.calme));

    h += section(5, T.regarder, '<p class="rg-l"><label for="rg-pays">' + T.pays + '</label></p><select id="rg-pays">' +
      '<option value="">' + T.defaut + ' (' + esc(nomPays(EN ? 'US' : 'FR')) + ')</option>' +
      PAYS.map(function(p){ return '<option value="' + p + '"' + (o.pays === p ? ' selected' : '') + '>' + esc(nomPays(p)) + '</option>'; }).join('') +
      '</select><p class="rg-l">' + T.pf + '</p><div class="rg-ch" id="rg-pf">' + pfChips(pf, o) + '</div><p class="rg-n">' + T.pfNote + '</p>');

    var W = window.CG_WT, mesC = {};
    (o.cs || []).forEach(function(k){ mesC[k] = 1; });
    c = '<p class="rg-l">' + T.cs + '</p><div class="rg-ch" id="rg-cs">';
    if (W) W.rang.forEach(function(n){
      c += bouton(W.logos[n] ? '<img class="cs" src="/images/consoles/' + W.logos[n] + '.svg" alt="' + esc(n) + '" title="' + esc(n) + '">' : esc(n),
        mesC[n], ' data-c="' + esc(n) + '" title="' + esc(n) + '"');
    });
    h += section(6, T.jouer, c + '</div><p class="rg-n">' + T.csNote + '</p>');
    dlg.querySelector('.rg-corps').innerHTML = h;
  }
  function pfChips(pf, o){
    if (!pf || !pf.p) return '<span class="rg-n">' + T.pfVide + '</span>';
    var pays = o.pays || (EN ? 'US' : 'FR'), mes = {};
    (o.pf || []).forEach(function(k){ mes[k] = 1; });
    var l = (pf.n && pf.n[pays]) || [];
    /* les vingt plus présentes dans le pays, plus celles déjà choisies */
    var ids = l.slice(0, 20);
    pf.p.forEach(function(x, i){ if (mes[x[0]] && ids.indexOf(i) < 0) ids.push(i); });
    return ids.map(function(i){
      var x = pf.p[i];
      return bouton('<img src="https://image.tmdb.org/t/p/w92' + esc(x[2]) + '" alt="">' + esc(x[1]), mes[x[0]], ' data-p="' + esc(x[0]) + '"');
    }).join('');
  }

  function change(fn){
    var o = lis();
    fn(o);
    O.ecrire(o);
    /* l'affichage suit tout de suite ; le reste au rechargement */
    var d = document.documentElement.dataset;
    ['cp', 'txt', 'ctr', 'calme', 'sp', 'flou'].forEach(function(k){
      var a = 'cg' + k.charAt(0).toUpperCase() + k.slice(1);
      if (!o[k]) delete d[a];
    });
  }

  function bati(){
    dlg = document.createElement('dialog');
    dlg.className = 'rg';
    dlg.setAttribute('aria-labelledby', 'rg-h');
    /* la roue du menu, en grand à côté du titre (même dessin) */
    var roue = (document.querySelector('.cg-roue svg') || {}).outerHTML || '';
    dlg.innerHTML = '<div class="rg-in"><div class="rg-tete"><div class="rg-filet"></div>' +
      '<button type="button" class="rg-x" aria-label="' + T.fermer + '">✕</button>' +
      '<h2 id="rg-h">' + roue + T.titre + '</h2><p class="rg-dek">' + T.dek + '</p></div><div class="rg-corps"></div>' +
      '<div class="rg-bar"><button type="button" class="rg-raz">' + T.raz + '</button>' +
      '<button type="button" class="rg-go">' + T.applique + '</button></div></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.rg-x').addEventListener('click', function(){ dlg.close(); });
    dlg.querySelector('.rg-go').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('click', function(ev){ if (ev.target === dlg) dlg.close(); });
    dlg.querySelector('.rg-raz').addEventListener('click', function(){
      O.ecrire({});
      try { localStorage.removeItem(TKEY); } catch (_) {}
      dlg.close();
    });
    /* Fermer, c'est appliquer : un réglage qui change la timeline demande
       de la rebâtir, et c'est le rechargement qui le fait. */
    dlg.addEventListener('close', function(){
      if (JSON.stringify(lis()) !== avant) location.reload();
    });
    dlg.addEventListener('click', function(ev){
      var b = ev.target.closest('button');
      if (!b || !dlg.contains(b)) return;
      var r = b.closest('[data-u]');
      if (b.dataset.t) {
        change(function(o){
          var l = o.t || [], i = l.indexOf(b.dataset.t);
          if (i < 0) l.push(b.dataset.t); else l.splice(i, 1);
          o.t = l;
        });
      } else if (b.dataset.n != null) {
        change(function(o){ o.n = b.dataset.n; });
        [].forEach.call(dlg.querySelectorAll('[data-n]'), function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        return;
      } else if (r && b.dataset.v) {
        var on = b.getAttribute('aria-pressed') !== 'true';
        change(function(o){
          o.u = o.u || {};
          if (on) o.u[r.dataset.u] = b.dataset.v; else delete o.u[r.dataset.u];
        });
        [].forEach.call(r.querySelectorAll('[data-v]'), function(x){ x.setAttribute('aria-pressed', on && x === b ? 'true' : 'false'); });
        r.classList.toggle('off', on && b.dataset.v === 'off');
        r.classList.toggle('fav', on && b.dataset.v === 'fav');
        return;
      } else if (b.dataset.p) {
        change(function(o){
          var l = o.pf || [], i = l.indexOf(b.dataset.p);
          if (i < 0) l.push(b.dataset.p); else l.splice(i, 1);
          o.pf = l;
        });
      } else if (b.dataset.c) {
        change(function(o){
          var l = o.cs || [], i = l.indexOf(b.dataset.c);
          if (i < 0) l.push(b.dataset.c); else l.splice(i, 1);
          o.cs = l;
        });
      } else return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
    dlg.addEventListener('change', function(ev){
      var t = ev.target;
      if (t.id === 'rg-pays') {
        change(function(o){ o.pays = t.value; });
        plateformesJson().then(function(pf){ dlg.querySelector('#rg-pf').innerHTML = pfChips(pf, lis()); });
        return;
      }
      if (!t.id || t.id.indexOf('rg-') !== 0 || t.type !== 'checkbox') return;
      var k = t.id.slice(3);
      change(function(o){ o[k] = t.checked ? 1 : 0; });
      if (k === 'vo' && t.checked && !EN) titres();
    });
  }

  function ouvre(){
    /* depuis le tiroir d'un téléphone : on le referme derrière nous */
    var dr = document.getElementById('drawer'), bg = document.getElementById('burger');
    if (dr && dr.classList.contains('open')) {
      dr.classList.remove('open');
      if (bg) bg.setAttribute('aria-expanded', 'false');
    }
    if (!dlg) bati();
    avant = JSON.stringify(lis());
    dlg.querySelector('.rg-corps').innerHTML = '';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    Promise.all([table(), plateformesJson()]).then(function(v){ remplis(v[0], v[1]); });
  }
  document.addEventListener('click', function(ev){
    var b = ev.target.closest && ev.target.closest('[data-reglages]');
    if (!b) return;
    ev.preventDefault();
    ouvre();
  });
})();
