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
        ? 'Sur iPhone, iPad et Mac, c’est Safari qui installe : touchez <b>Partager</b>, puis « Sur l’écran d’accueil ».'
        : 'On iPhone, iPad and Mac, Safari does the installing: tap <b>Share</b>, then “Add to Home Screen”.',
      btn:null
    }
  };

  /* les deux libelles hors des trois discours */
  var TITRE = FR ? 'L’application Chronologeek' : 'The Chronologeek app';
  var FERMER = FR ? 'Fermer' : 'Close';

  var CSS = [
    '.appbar{background:var(--ink);border-bottom:2px solid var(--paper);',
    '  position:relative;z-index:65;animation:abDrop .35s ease}',
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
    '@keyframes abDrop{from{transform:translateY(-100%)}to{transform:none}}',
    /* en étroit, le texte prend la ligne et les boutons passent dessous :
       comprimé sur une seule ligne, il tombait à deux mots par ligne */
    '@media(max-width:640px){',
    '  .appbar .wrap{flex-wrap:wrap;gap:10px 12px;align-items:flex-start}',
    '  .ab-txt{flex:1 0 calc(100% - 48px)}',
    '  .ab-go{order:3}.ab-x{order:4;margin-left:auto}',
    '}',
    '@media(prefers-reduced-motion:reduce){.appbar{animation:none}}'
  ].join('');

  function build(v, onGo){
    if (document.getElementById('appbar')) return;

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

    /* avant le bandeau, dans le flux : elle se lit en arrivant puis part
       au défilement, sans jamais recouvrir la navigation collante */
    var hdr = document.querySelector('header');
    if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(bar, hdr);
    else document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelector('.ab-x').addEventListener('click', function(){
      try { localStorage.setItem(KEY, String(Date.now())); } catch(e){}
      bar.remove();
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
        if (b) b.remove();
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
              'Une suggestion', 'Autre chose'],
    message: 'Message',
    place:   'Votre message…',
    envoyer: 'Envoyer',
    note:    'Le bouton ouvre votre messagerie avec le message déjà écrit : rien ne part avant que vous l’envoyiez.',
    ou:      'Ou écrire directement à',
    copie:   'Adresse copiée',
    fermer:  'Fermer'
  } : {
    titre:   'Write to Chronologeek',
    dek:     'An error in a timeline, a release gone missing, an idea: this is the place.',
    sujet:   'Subject',
    sujets:  ['An error in a timeline', 'A missing release',
              'A suggestion', 'Something else'],
    message: 'Message',
    place:   'Your message…',
    envoyer: 'Send',
    note:    'The button opens your mail app with the message already written: nothing goes out until you send it.',
    ou:      'Or write straight to',
    copie:   'Address copied',
    fermer:  'Close'
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

  for (var i = 0; i < liens.length; i++) {
    liens[i].addEventListener('click', function(e){
      e.preventDefault();
      appelant = e.currentTarget;
      var d = bati();
      d.showModal();            /* la touche Échap et le piège au clavier viennent avec */
      d.querySelector('#cx-s').focus();
    });
  }
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
