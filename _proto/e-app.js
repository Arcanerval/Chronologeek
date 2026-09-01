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
       on les rejoint par une espace et on laisse le sous-titre dehors. */
    var out = [];
    for (var n = h.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n.className && /\bsub\b/.test(n.className)) continue;
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
    dek:    'Elle n’apparaîtra que sur cet appareil, dans votre navigateur. Rien n’est envoyé, et la timeline publique ne bouge pas.',
    fTitre: 'Titre',
    fType:  'Type',
    fDate:  'Date',
    fNote:  'Note',
    fOu:    'Juste après',
    debut:  '— au tout début —',
    phT:    'Le titre de l’œuvre',
    phD:    'Une année, une date, une époque…',
    phN:    'Ce que vous voulez vous rappeler (facultatif)',
    ok:     'Ajouter',
    save:   'Enregistrer',
    del:    'Retirer',
    conf:   'Retirer « {t} » de votre timeline ?',
    ko:     'Votre navigateur refuse d’enregistrer — navigation privée, peut-être. L’ajout n’a pas été conservé.',
    fermer: 'Fermer',
    modif:  'Modifier votre ajout'
  } : {
    add:    'Add a work',
    tag:    'Your addition',
    titreN: 'Add a work',
    titreE: 'Edit your addition',
    dek:    'It only shows on this device, in your browser. Nothing is sent, and the public timeline stays as it is.',
    fTitre: 'Title',
    fType:  'Type',
    fDate:  'Date',
    fNote:  'Note',
    fOu:    'Right after',
    debut:  '— at the very beginning —',
    phT:    'The title of the work',
    phD:    'A year, a date, an era…',
    phN:    'Whatever you want to remember (optional)',
    ok:     'Add',
    save:   'Save',
    del:    'Remove',
    conf:   'Remove “{t}” from your timeline?',
    ko:     'Your browser refused to save — private browsing, perhaps. The addition was not kept.',
    fermer: 'Close',
    modif:  'Edit your addition'
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
    /* Le crayon se range à gauche du lien de copie, qui occupe déjà le
       coin. Il reste visible en permanence, lui : un bouton qui
       n'apparaît qu'au survol ne se découvre pas sur un téléphone. */
    '.mine-e{position:absolute;top:9px;right:41px;z-index:5;width:26px;height:26px;',
    '  display:grid;place-items:center;cursor:pointer;background:none;border:none;',
    '  padding:0;color:rgba(255,253,247,.55)}',
    '.mine-e:hover,.mine-e:focus-visible{color:var(--hot)}',
    '.mine-e svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;',
    '  stroke-linecap:square}',
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
    '.mx-go{font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;',
    '  font-size:15px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;',
    '  background:var(--hot);border:2px solid var(--hot);color:var(--ink);padding:8px 22px}',
    '.mx-go:hover{background:var(--paper);border-color:var(--paper)}',
    '.mx-del{font-family:inherit;font-size:12.5px;cursor:pointer;background:none;',
    '  border:none;padding:0;color:rgba(255,253,247,.6);text-decoration:underline}',
    '.mx-del:hover{color:var(--paper)}',
    '.mx-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;',
    '  margin-top:4px}',
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
        '</div>' +
        '<p class="mx-f"><label for="mx-n"></label>' +
          '<input id="mx-n" type="text" maxlength="160" autocomplete="off"/></p>' +
        '<p class="mx-f"><label for="mx-a"></label><select id="mx-a"></select></p>' +
        '<div class="mx-bar"><button type="submit" class="mx-go"></button>' +
          '<button type="button" class="mx-del" hidden></button></div>' +
        '<p class="mx-ko" hidden></p>' +
      '</form>';
    document.body.appendChild(boite);

    boite.querySelector('.mx-x').setAttribute('aria-label', T.fermer);
    boite.querySelector('.mx-dek').textContent = T.dek;
    var lb = boite.querySelectorAll('label');
    lb[0].textContent = T.fTitre; lb[1].textContent = T.fType;
    lb[2].textContent = T.fDate;  lb[3].textContent = T.fNote;
    lb[4].textContent = T.fOu;
    boite.querySelector('#mx-t').placeholder = T.phT;
    boite.querySelector('#mx-d').placeholder = T.phD;
    boite.querySelector('#mx-n').placeholder = T.phN;
    boite.querySelector('.mx-del').textContent = T.del;

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
    boite.querySelector('.mx-del').addEventListener('click', function(){
      if (!edite) return;
      if (!confirm(T.conf.replace('{t}', dec(edite.title)))) return;
      var l = P.lis().filter(function(x){ return x.id !== edite.id; });
      if (!P.ecris(l)) { rate(); return; }
      oublie(edite.id);
      location.reload();
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
     pas : la page reviendrait sans l'entrée, et sans un mot. */
  function rate(){
    var p = boite.querySelector('.mx-ko');
    p.textContent = T.ko; p.hidden = false;
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
    d.querySelector('.mx-del').hidden = !edite;
    d.querySelector('#mx-t').value = edite ? edite.title : '';
    d.querySelector('#mx-d').value = edite ? (edite.date || '') : '';
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
      if (card) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mine-e';
        b.title = T.modif; b.setAttribute('aria-label', T.modif);
        b.innerHTML = CRAYON;
        /* `stopPropagation` : le crayon est posé dans la carte, et la
           carte entière écoute le clic pour déplier son panneau. */
        b.addEventListener('click', (function(ent, bt){
          return function(ev){ ev.preventDefault(); ev.stopPropagation(); ouvre(ent, bt); };
        })(a, b));
        card.appendChild(b);
      }
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
