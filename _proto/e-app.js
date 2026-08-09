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
