// publier.mjs — met la refonte en production.
//
// Les protos de _proto/ sont des maquettes : liens en `e-*.html`, scripts en
// chemin relatif, `noindex` en tête et aucune des cinq lignes de référencement
// que portent les pages en ligne. Les recopier telles quelles effacerait
// silencieusement le référencement de dix-huit pages — rien ne casserait, et
// le site disparaîtrait des résultats.
//
// Ce script fait donc cinq choses, et rien d'autre :
//   1. il pose sur chaque proto son référencement — titre, description, Open
//      Graph, hreflang, canonique — repris de `_proto/seo.json` ;
//   2. il réécrit les liens de maquette vers les vraies URL du site, dans le
//      HTML comme dans les données ;
//   3. il rebranche la PWA (manifeste, icônes, service worker) et la mesure
//      d'audience, que les protos n'avaient pas ;
//   4. il retire l'échafaudage de maquette — le bouton « proto : simuler une
//      progression » et son gréement — et sort en erreur s'il en reste ;
//   5. il pose les données structurées — fil d'Ariane et `ItemList` — tirées
//      des mêmes `data*.js` qu'il copie dans `/data/` (voir jsonld.mjs).
//
// Ce qu'il ne fait pas : lire les pages du site. Elles sont sa sortie, et un
// script qui se relit lui-même ne retrouve plus rien.
//
// `--check` n'écrit rien et affiche le bilan.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonLd } from './jsonld.mjs';
import { prerendu, comptePrerendu } from './prerendu.mjs';
import { SOURCES } from './jsonld.mjs';
import { sitemap } from './sitemap.mjs';
import { erreur404 } from './erreur404.mjs';
import { recherche } from './recherche.mjs';
import { flux } from './flux.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
const CHECK = process.argv.includes('--check');
const SITE = 'https://chronologeek.app';

const lire = p => readFileSync(join(RACINE, p), 'utf8');
const existe = p => existsSync(join(RACINE, p));

// Les protos sont en CRLF, et les scripts de traduction réécrivent en LF les
// seules lignes qu'ils touchent : la sortie était panachée, et deux versions au
// contenu identique ressortaient différentes à l'octet près. Le dépôt stocke en
// LF — on écrit en LF.
const ecrire = (rel, contenu) => {
  mkdirSync(dirname(join(RACINE, rel)), { recursive: true });
  writeFileSync(join(RACINE, rel), contenu.replace(/\r\n/g, '\n'));
};

/* ── Les douze pages, dans leurs deux langues ────────────────────────────── */

const ROUTES = [
  { cle: 'accueil',
    fr: { proto: 'e-accueil.html',            sortie: 'fr/index.html',            url: '/fr/' },
    en: { proto: 'en-accueil.html',           sortie: 'index.html',               url: '/' } },
  { cle: 'sw',
    fr: { proto: 'e-starwars.html',           sortie: 'fr/starwars.html',         url: '/fr/starwars' },
    en: { proto: 'en-starwars.html',          sortie: 'starwars.html',            url: '/starwars' } },
  { cle: 'mcu',
    fr: { proto: 'e-marvel.html',             sortie: 'fr/marvel.html',           url: '/fr/marvel' },
    en: { proto: 'en-marvel.html',            sortie: 'marvel.html',              url: '/marvel' } },
  { cle: 'dc',
    fr: { proto: 'e-dc.html',                 sortie: 'fr/dc.html',               url: '/fr/dc' },
    en: { proto: 'en-dc.html',                sortie: 'dc.html',                  url: '/dc' } },
  { cle: 'avatar',
    fr: { proto: 'e-avatar.html',             sortie: 'fr/avatar.html',                       url: '/fr/avatar' },
    en: { proto: 'en-avatar.html',            sortie: 'avatar.html',                       url: '/avatar' } },
  // Star Trek se publie comme les autres, alors que sa chaîne de traduction va
  // en sens inverse : c'est `en-startrek.html` qui est écrit à la main et
  // `e-startrek.html` qui en descend. La publication, elle, ne voit que deux
  // protos et deux sorties — le sens de la traduction ne la regarde pas.
  { cle: 'startrek',
    fr: { proto: 'e-startrek.html',           sortie: 'fr/startrek.html',         url: '/fr/startrek' },
    en: { proto: 'en-startrek.html',          sortie: 'startrek.html',            url: '/startrek' } },
  // The Walking Dead prend la chaîne à l'envers comme Star Trek : `en-twd.html`
  // est écrit à la main, `e-twd.html` en descend par traduire-twd.mjs.
  { cle: 'twd',
    fr: { proto: 'e-twd.html',                sortie: 'fr/walkingdead.html',      url: '/fr/walkingdead' },
    en: { proto: 'en-twd.html',               sortie: 'walkingdead.html',         url: '/walkingdead' } },
  // Dragon Age est le troisième à prendre la chaîne à l'envers :
  // `en-dragonage.html` est écrit à la main, `e-dragonage.html` en descend
  // par traduire-dragonage.mjs.
  { cle: 'dragonage',
    fr: { proto: 'e-dragonage.html',          sortie: 'fr/dragonage.html',        url: '/fr/dragonage' },
    en: { proto: 'en-dragonage.html',         sortie: 'dragonage.html',           url: '/dragonage' } },
  // Assassin's Creed est le quatrième à prendre la chaîne à l'envers :
  // `en-assassinscreed.html` est écrit à la main, `e-assassinscreed.html` en
  // descend par traduire-assassinscreed.mjs.
  { cle: 'assassinscreed',
    fr: { proto: 'e-assassinscreed.html',     sortie: 'fr/assassinscreed.html',   url: '/fr/assassinscreed' },
    en: { proto: 'en-assassinscreed.html',    sortie: 'assassinscreed.html',      url: '/assassinscreed' } },
  // DC Animation est le cinquième à prendre la chaîne à l'envers :
  // `en-dcanimation.html` est écrit à la main, `e-dcanimation.html` en descend
  // par traduire-dcanimation.mjs.
  { cle: 'dcanimation',
    fr: { proto: 'e-dcanimation.html',        sortie: 'fr/dcanimation.html',      url: '/fr/dcanimation' },
    en: { proto: 'en-dcanimation.html',       sortie: 'dcanimation.html',         url: '/dcanimation' } },
  { cle: 'dossiers',
    fr: { proto: 'e-dossiers.html',           sortie: 'fr/dossiers/index.html',   url: '/fr/dossiers/' },
    en: { proto: 'en-dossiers.html',          sortie: 'deep-dives/index.html',    url: '/deep-dives/' } },
  { cle: 'dossier-sw',
    fr: { proto: 'e-dossier-star-wars.html',  sortie: 'fr/dossiers/star-wars.html', url: '/fr/dossiers/star-wars' },
    en: { proto: 'en-dossier-star-wars.html', sortie: 'deep-dives/star-wars.html',  url: '/deep-dives/star-wars' } },
  { cle: 'nouveautes',
    fr: { proto: 'e-nouveautes.html',         sortie: 'fr/nouveautes.html',       url: '/fr/nouveautes' },
    en: { proto: 'en-nouveautes.html',        sortie: 'whats-new.html',           url: '/whats-new' } },
  { cle: 'a-venir',
    fr: { proto: 'e-a-venir.html',            sortie: 'fr/a-venir.html',          url: '/fr/a-venir' },
    en: { proto: 'en-a-venir.html',           sortie: 'upcoming.html',            url: '/upcoming' } },
];

/* Le référencement de chaque page, dans les deux langues : titre, titre Open
   Graph, description, image. Il vient des pages en ligne d'avant la refonte,
   extrait une fois dans `seo.json`.

   Il n'est plus relu dans les pages publiées, et c'est volontaire : celles-ci
   sont désormais la sortie de ce script, qui se relirait donc lui-même. Ça
   marchait — la valeur écrite est celle qu'on relit — mais rien n'aurait dit
   d'où elle venait, et une description perdue une fois l'aurait été pour
   toujours. Une table qu'on peut ouvrir et corriger vaut mieux qu'une boucle.

   Avatar y figure avec des textes écrits, faute de page en ligne à reprendre :
   c'est l'accroche que Niko a écrite, mot pour mot. */
const SEO = JSON.parse(lire('_proto/seo.json'));

/* ── Les fichiers de données et le moteur ───────────────────────────────── */

// Le nom de sortie suit celui de la page, pas celui du proto : lore_gap.py
// découvre les univers en listant la racine et n'a rien de codé en dur. S'il
// doit lire data/starwars-en.js là où il lisait starwars.html, la règle tient ;
// avec « sw-en.js » elle tombe et il faut une table de correspondance.
const ASSETS = {
  'data.js':               '/data/starwars-fr.js',
  'data-en.js':            '/data/starwars-en.js',
  'data-mcu.js':           '/data/marvel-fr.js',
  'data-mcu-en.js':        '/data/marvel-en.js',
  'data-dc.js':            '/data/dc-fr.js',
  'data-dc-en.js':         '/data/dc-en.js',
  'data-avatar.js':        '/data/avatar-fr.js',
  'data-avatar-en.js':     '/data/avatar-en.js',
  'data-startrek.js':      '/data/startrek-fr.js',
  'data-startrek-en.js':   '/data/startrek-en.js',
  'data-twd.js':           '/data/walkingdead-fr.js',
  'data-twd-en.js':        '/data/walkingdead-en.js',
  'data-dragonage.js':     '/data/dragonage-fr.js',
  'data-dragonage-en.js':  '/data/dragonage-en.js',
  'data-assassinscreed.js':    '/data/assassinscreed-fr.js',
  'data-assassinscreed-en.js': '/data/assassinscreed-en.js',
  'data-dcanimation.js':       '/data/dcanimation-fr.js',
  'data-dcanimation-en.js':    '/data/dcanimation-en.js',
  'data-dossier-sw.js':    '/data/dossier-star-wars-fr.js',
  'data-dossier-sw-en.js': '/data/dossier-star-wars-en.js',
  'data-news.js':          '/data/news-fr.js',
  'data-news-en.js':       '/data/news-en.js',
  'e-app.js':              '/app.js',
  // Chargé entre les données et le script de page, sur les huit univers :
  // il pose les entrées du visiteur dans `D.eras` avant que la page les lise.
  'e-perso.js':            '/perso.js',
};

/* ── Table des liens : nom de maquette → URL réelle ─────────────────────── */

const LIENS = {};
for (const r of ROUTES) { LIENS[r.fr.proto] = r.fr.url; LIENS[r.en.proto] = r.en.url; }

/* L'URL de chaque page par clé de route, dans les deux langues, et l'image de
   chaque univers reprise de son référencement. `jsonld.mjs` en tire les fils
   d'Ariane et les deux listes qui renvoient d'une page à l'autre. */
const URLS = { fr: {}, en: {} };
for (const r of ROUTES) { URLS.fr[r.cle] = r.fr.url; URLS.en[r.cle] = r.en.url; }

const IMAGES = Object.fromEntries(['fr', 'en'].map(langue => [langue,
  Object.fromEntries(Object.entries(SEO).map(([k, v]) => [k, v[langue] && v[langue].image]))]));

/* ── Le bloc PWA, identique sur toutes les pages en ligne ───────────────── */

const PWA = [
  '<link rel="icon" type="image/png" href="/images/icon-192.png"/>',
  '<link rel="manifest" href="/manifest.json"/>',
  '<meta name="theme-color" content="#08080f"/>',
  '<link rel="apple-touch-icon" href="/images/icon-192.png"/>',
  '<meta name="apple-mobile-web-app-capable" content="yes"/>',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>',
  '<meta name="apple-mobile-web-app-title" content="Chronologeek"/>',
].join('\n');

// Le pré-rendu ne doit jamais se voir, et il doit rester lisible sans JS.
//
// La mesure d'origine — premier rendu à 3 452 ms, script à 1 233 — était prise
// à cache froid : à cache chaud le rendu passe avant le script, et le texte nu
// paraissait une fraction de seconde, aligné à gauche et sans mise en page,
// avant que `$('#timeline').innerHTML` ne l'écrase. C'est ce que Niko a vu.
//
// La classe `js` est posée par un script d'une ligne, **dans le `<head>` et
// avant tout rendu** : le pré-rendu est donc caché dès que le JS est là, et
// visible quand il ne l'est pas. Un `display:none` inconditionnel aurait rendu
// la page vide sans JS, et le contenu affiché reste le même dans les deux cas —
// ce n'est pas du cloaking, c'est le même texte, mieux rendu.
// Le flux du journal, dans les deux langues. Le `<link rel="alternate">` qui le
// désigne est posé sur les vingt-huit pages : c'est ce qu'un navigateur et un
// lecteur de flux vont chercher, et personne ne devine une URL de flux.
const FLUX = { 'fr/feed.xml': 'fr', 'feed.xml': 'en' };
const LIEN_FLUX = langue =>
  `<link rel="alternate" type="application/atom+xml" href="/${langue === 'fr' ? 'fr/' : ''}feed.xml" ` +
  `title="${langue === 'fr' ? 'Chronologeek — Nouveautés' : 'Chronologeek — What’s new'}"/>`;

const PRERENDU_CSS =
  '<script>document.documentElement.className+=" js"</script>\n' +
  '<style>.js .pr{display:none}</style>';

// L'écran d'arrivée, sur les deux accueils seulement.
//
// Il est **posé dans le `<head>` et dessiné par deux pseudo-éléments de
// `<html>`**, pas par un `<div>` : à cet endroit `document.body` n'existe pas
// encore, et c'est justement le seul endroit qui garantisse qu'il paraisse
// avant le premier rendu. Écrit dans `e-app.js`, chargé en fin de corps, il
// serait arrivé après la page — on aurait vu l'accueil, puis un voile.
//
// **Il ne retarde rien.** C'est une superposition : la page se construit
// dessous pendant qu'il est là, et `e-app.js` le retire dès qu'elle est prête.
// Le fond est écrit en dur (`#08080f`, la couleur du manifeste) parce que
// `var(--ink)` vit dans la feuille de la page, qui n'est pas encore lue.
//
// **Une fois par session, et pas une de plus** : revenir à l'accueil depuis
// une timeline ne le rejoue pas. `?boot` le force, comme `?app=` force la
// barre d'installation — sans quoi il ne se voit qu'une fois par onglet et
// devient impossible à juger.
//
// **Il dure 620 ms et n'attend rien.** Première version : il se levait quand
// la page était prête, et c'était l'erreur — sur un réseau lent le voile
// tenait jusqu'au document prêt, et **le plus grand affichage passait de
// 0,8 s à 5,8 s**, mesuré en Slow 4G, cache vide. Un écran d'arrivée qui
// attend le chargement transforme un effet en attente, et Google chronomètre
// ce que le visiteur voit : le voile. Levé à l'heure dite, il ne coûte plus
// que sa propre durée — le contenu paraît derrière quand il paraîtrait de
// toute façon.
//
// Le lever vit donc **ici, dans le head**, et non dans `e-app.js` : celui-ci
// est en fin de corps, et sur un réseau lent il n'est lu qu'après plusieurs
// secondes — le compte à rebours n'aurait même pas commencé.
//
// **Le compte part à l'arrivée du logo, pas au début de la page.** C'est la
// seule ressource que le voile attend, et il l'attend pour une raison : en
// Slow 4G les 23 Ko du logo arrivent après 300 ms, et le voile s'ouvrait
// puis se fermait sur un aplat noir vide — l'effet exactement à l'envers.
// Il tient donc 400 ms de plus une fois le logo peint, 620 ms au moins
// depuis le début, et **1 500 ms au plus quoi qu'il arrive** : un logo qui
// n'arrive jamais ne doit pas retenir la page. Ce plafond est aussi le
// filet si le fichier a disparu — `onerror` lève le voile comme `onload`.
// Le défilé des neuf univers tient dans **un seul fichier**,
// `images/boot-univers.webp` : les neuf visuels empilés en bande verticale,
// 560 × 315 chacun, floutés au rendu et encodés à 58 — 100 Ko pour les neuf.
// Les originaux pèsent 2,3 Mo à eux tous, et les demander tous les neuf sur
// le chemin d'arrivée aurait coûté plus cher que tout ce que ce dépôt a
// économisé. Le flou n'est pas qu'un effet : il divise le poids par trois,
// et l'image passe de toute façon sous un voile à 62 %.
//
// C'est le seul endroit du site où une planche vaut mieux que des fichiers
// séparés — ailleurs, une vignette se demande seule et se met en cache seule.
const BOOT_PLANCHE = '/images/boot-univers.webp';
// L'ordre est celui du site : les trois en clair, puis « Plus d'univers ».
const BOOT_ENCRES = ['#4d9fff', '#e23636', '#f5c842', '#7dd3fc', '#b48cf2',
                     '#a8bf4f', '#e07b39', '#c0202f', '#2dd4bf'];

const BOOT =
  /* **Pas de `<link rel="preload">`**, et c'est voulu : il est inconditionnel,
     et les 85 Ko de la planche seraient descendus à chaque visite de
     l'accueil — y compris les neuf sur dix où le voile ne se joue pas. Les
     deux `new Image()` ci-dessous font le même travail au même endroit du
     `<head>`, et seulement quand il se joue. Le CSS ne charge rien non plus
     de son côté : un fond n'est demandé que si un élément le porte. */
  '<script>try{if(!sessionStorage.getItem("cg-boot")||/[?&]boot\\b/.test(location.search)){' +
  'var r=document.documentElement,f=0;r.className+=" boot";sessionStorage.setItem("cg-boot","1");' +
  'var s=function(d){if(f)return;f=1;setTimeout(function(){r.classList.add("boot-out");' +
  'setTimeout(function(){r.classList.remove("boot","boot-out");' +
  'var q=document.getElementById("cgb");if(q)q.remove();var w=document.getElementById("cgv");if(w)w.remove();var t=document.getElementById("cgt");if(t)t.remove()},360)},d)};' +
  /* Les deux images sont attendues, et le défilé ne part qu'avec elles :
     posé au parse du CSS, il aurait couru sur un fond vide et se serait
     terminé avant que la planche arrive. `boot-img` est ce qui le lance. */
  'var n=0,g=function(){if(++n<2)return;r.classList.add("boot-img");' +
  's(Math.max(2050,2100-performance.now()))};' +
  'var i=new Image();i.onload=i.onerror=g;i.src="/images/logo-chronologeek.webp";' +
  `var j=new Image();j.onload=j.onerror=g;j.src="${BOOT_PLANCHE}";` +
  'setTimeout(function(){s(0)},4200)' +
  '}}catch(e){}</script>\n' +
  '<style>' +
  /* Les propriétés sont écrites une par une, jamais dans le raccourci
     `background` : un `min()` ou un `max()` posé dans sa partie `taille`
     invalide la déclaration entière, et le voile sortait alors sans logo —
     un aplat noir, sans une ligne dans la console. */
  /* Le fond d'encre, posé dès le `<head>` : il couvre la page avant même que
     le corps existe, donc avant les neuf couches d'images, qui en demandent
     un. */
  'html.boot::before{content:"";position:fixed;inset:0;z-index:998;' +
  'background:#08080f;opacity:1;transition:opacity .34s ease}' +
  /* Les neuf univers en **fondu enchaîné**, une couche par univers, toutes
     empilées : chacune paraît en fondu par-dessus la précédente et y reste.
     Un défilement continu avait été essayé et écarté — il glisse là où un
     fondu pose. `max(100vw,177.8vh)` donne à chaque vignette de quoi couvrir
     l'écran quelle que soit sa forme — c'est le `cover` qu'une planche ne
     peut pas demander toute seule —, et le décalage d'une vignette à l'autre
     vaut exactement sa hauteur, `max(56.25vw,100vh)`. Le voile sombre est le
     `::after` du conteneur, donc au-dessus des neuf. */
  '#cgv{position:fixed;inset:0;z-index:999;opacity:1;transition:opacity .34s ease}' +
  '#cgv b{position:absolute;inset:0;opacity:0;' +
  `background-image:url(${BOOT_PLANCHE});background-repeat:no-repeat;` +
  'background-size:max(100vw,177.8vh) auto}' +
  '#cgv::after{content:"";position:absolute;inset:0;background:rgba(8,8,15,.56)}' +
  'html.boot-img #cgv b{animation:cgfondu .5s ease forwards}' +
  '@keyframes cgfondu{to{opacity:1}}' +
  /* le logo, seul dans sa couche, au-dessus du défilé */
  'html.boot::after{content:"";position:fixed;inset:0;z-index:1000;' +
  'background-image:url(/images/logo-chronologeek.webp);' +
  'background-position:center center;background-size:min(340px,68vw) auto;' +
  'background-repeat:no-repeat;opacity:1;transition:opacity .34s ease}' +
  /* les neuf cases, une par univers, qui prennent leur encre l'une après
     l'autre. Elles ne mesurent rien — rien n'est mesurable à cet instant —
     elles disent ce qu'est le site : neuf univers, et on les voit défiler
     derrière. `translateX(-50%)` et non une marge négative, la largeur
     dépendant du nombre de cases. */
  '#cgb{position:fixed;z-index:1001;left:50%;top:calc(50% + 46px);' +
  'transform:translateX(-50%);display:flex;gap:6px;' +
  'opacity:1;transition:opacity .34s ease}' +
  '#cgb i{display:block;width:min(22px,5vw);height:9px;' +
  'background:rgba(255,253,247,.13);animation:cgcase .5s ease forwards}' +
  '@keyframes cgcase{to{background:var(--c);box-shadow:0 0 13px var(--c)}}' +
  /* la phrase, sous les cases : elle change à chaque arrivée, et c'est le
     seul texte de l'écran. Elle paraît un demi-temps après le reste — d'un
     coup avec le logo, elle aurait fait bloc avec lui. */
  '#cgt{position:fixed;z-index:1001;left:50%;top:calc(50% + 74px);' +
  'transform:translateX(-50%);width:max-content;max-width:min(84vw,460px);' +
  'text-align:center;font-family:\'Big Shoulders Display\',sans-serif;' +
  'font-weight:800;font-size:14px;line-height:1.3;letter-spacing:.13em;' +
  'text-transform:uppercase;color:rgba(255,253,247,.6);' +
  'opacity:0;animation:cgtxt .55s ease .3s forwards;transition:opacity .34s ease}' +
  '@keyframes cgtxt{to{opacity:1}}' +
  'html.boot.boot-out::before,html.boot.boot-out::after,' +
  'html.boot.boot-out #cgb,html.boot.boot-out #cgv{opacity:0;pointer-events:none}' +
  /* **`animation:none` en plus de l'opacité**, et ce n'est pas une
     précaution : une animation `forwards` fige sa dernière image et bat la
     règle qui suit. Sans ça la phrase restait à l'écran pendant que tout le
     reste s'effaçait. Les cases n'ont pas ce défaut — c'est leur parent qui
     s'efface, pas elles. */
  'html.boot.boot-out #cgt{animation:none;opacity:0;pointer-events:none}' +
  /* qui a demandé moins d'animation reçoit le premier univers et le logo,
     sans fondus et sans remplissage — la durée, elle, ne bouge pas : il n'y
     a plus rien qui remue */
  '@media(prefers-reduced-motion:reduce){' +
  'html.boot-img #cgv b{animation:none}#cgv b:first-child{opacity:1}' +
  '#cgb i{animation:none}#cgt{animation:none;opacity:1}' +
  'html.boot::before,html.boot::after,#cgb,#cgv,#cgt{transition:none}}' +
  '</style>';

// Les vingt phrases de l'écran d'arrivée, une tirée au hasard à chaque
// arrivée. Les trois premières sont de Niko, mot pour mot — sa graphie
// comprise ; les dix-sept autres suivent son ton. Le français n'est pas la
// traduction de l'anglais ligne à ligne, c'est la même idée dans sa langue.
//
// **Seules les vingt de la page sont injectées** : `publier.mjs` connaît la
// langue de chaque route, il n'y a donc aucune raison d'envoyer les quarante.
const BOOT_PHRASES = {
  en: [
    'Restoring the multiverse',
    'Erasing the chronological anomalies',
    'Reseting the time loop',
    'Aligning the timelines',
    'Recalibrating the Animus',
    'Sorting nine universes',
    'Untangling the flashbacks',
    'Consulting the archives',
    'Waking up the Force',
    'Charging the warp core',
    'Checking canon status',
    'Counting the post-credit scenes',
    'Rewinding to episode one',
    'Filing the retcons',
    'Cross-checking the release dates',
    'Defragmenting the continuity',
    'Polishing the spoiler shields',
    'Summoning the watch order',
    'Warming up the projector',
    'Dusting off the comics',
  ],
  fr: [
    'Restauration du multivers',
    'Effacement des anomalies chronologiques',
    'Réinitialisation de la boucle temporelle',
    'Alignement des chronologies',
    'Recalibrage de l’Animus',
    'Tri de neuf univers',
    'Démêlage des flashbacks',
    'Consultation des archives',
    'Réveil de la Force',
    'Chargement du cœur de distorsion',
    'Vérification du canon',
    'Comptage des scènes post-générique',
    'Retour à l’épisode un',
    'Classement des retcons',
    'Recoupement des dates de sortie',
    'Défragmentation de la continuité',
    'Astiquage des boucliers anti-spoil',
    'Invocation de l’ordre de visionnage',
    'Préchauffage du projecteur',
    'Dépoussiérage des comics',
  ],
};

// Les neuf couches d'images et les neuf cases demandent des éléments, donc un
// `document.body` : ce bloc-ci est posé juste après l'ouverture du corps, là
// où le voile du `<head>` ne peut pas aller.
//
// **0,2 s d'intervalle**, pour les couches comme pour les cases : neuf fois,
// plus le demi-temps du dernier fondu, font 2,1 s — et c'est exactement ce que
// le voile tient une fois les images arrivées. Les trois valeurs se règlent
// ensemble ; changer l'une seule fait finir l'écran avant ou après lui-même.
const BOOT_PAS = 0.2;
const BOOT_CORPS = langue =>
  '<script>(function(){var r=document.documentElement;' +
  'if(!r.classList.contains("boot"))return;' +
  `var C=${JSON.stringify(BOOT_ENCRES)},P=${BOOT_PAS};` +
  /* le pas vertical d'une vignette à l'autre, écrit en CSS pour que la
     couche se cale toute seule quelle que soit la forme de l'écran */
  'var H="max(56.25vw,100vh)",v=document.createElement("div");v.id="cgv";' +
  'for(var k=0;k<C.length;k++){var b=document.createElement("b");' +
  'b.style.backgroundPosition="center calc((100vh - "+H+")/2 - "+H+"*"+k+")";' +
  'b.style.animationDelay=(k*P)+"s";v.appendChild(b)}' +
  'document.body.appendChild(v);' +
  'var d=document.createElement("div");d.id="cgb";' +
  'for(var i=0;i<C.length;i++){var s=document.createElement("i");' +
  's.style.cssText="--c:"+C[i]+";animation-delay:"+(i*P)+"s";d.appendChild(s)}' +
  'document.body.appendChild(d);' +
  /* La phrase est posée en `textContent` : elle porte des apostrophes
     typographiques, et une concaténation de HTML les aurait laissées
     passer sans échappement. */
  `var T=${JSON.stringify(BOOT_PHRASES[langue] || BOOT_PHRASES.en)};` +
  'var p=document.createElement("p");p.id="cgt";' +
  'p.textContent=T[Math.random()*T.length|0];' +
  'document.body.appendChild(p)})()</script>';

const PIED = [
  '<script src="/pwa.js"></script>',
  '<script data-goatcounter="https://arcanerval.goatcounter.com/count"',
  '        async src="//gc.zgo.at/count.js"></script>',
].join('\n');

// Les partages sociaux ne disaient pas leur langue : les hreflang etaient poses
// depuis toujours, og:locale non. Facebook et LinkedIn en tirent la langue de
// l'apercu et le lien vers l'autre version ; sans lui, ils devinent.
const LOCALES = { fr: 'fr_FR', en: 'en_US' };

function blocSeo(seo, urlEn, urlFr, moi, langue) {
  const e = s => s.replace(/&(?!(amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, '&amp;');
  const autre = langue === 'fr' ? 'en' : 'fr';
  return [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${e(seo.desc)}"/>`,
    '<meta property="og:type" content="website"/>',
    '<meta property="og:site_name" content="Chronologeek"/>',
    `<meta property="og:title" content="${e(seo.ogTitle || seo.title)}"/>`,
    `<meta property="og:description" content="${e(seo.desc)}"/>`,
    `<meta property="og:image" content="${seo.image}"/>`,
    `<meta property="og:url" content="${SITE}${moi}"/>`,
    `<meta property="og:locale" content="${LOCALES[langue]}"/>`,
    `<meta property="og:locale:alternate" content="${LOCALES[autre]}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<link rel="alternate" hreflang="en" href="${SITE}${urlEn}"/>`,
    `<link rel="alternate" hreflang="fr" href="${SITE}${urlFr}"/>`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}${urlEn}"/>`,
    `<link rel="canonical" href="${SITE}${moi}"/>`,
  ].join('\n');
}

/* ── Recablage des liens ────────────────────────────────────────────────── */

// Les liens de maquette ne vivent pas qu'en attribut : data-news.js pose
// `href:"e-marvel.html#mcu-smbnd"` sur chaque carte du journal, et ce lien-la
// n'est ecrit dans le DOM qu'au chargement. Ne recabler que le HTML laissait
// donc seize liens morts qu'aucune lecture de page ne montre. On traite toute
// chaine entre guillemets, ancre comprise.
//
// Le guillemet peut etre echappe, et il faut le prevoir : les intros portent
// depuis le 5 septembre 2026 des liens d'une page a l'autre, ecrits dans le
// HTML du champ `notes`. Cote francais ce HTML vit dans un gabarit et le
// guillemet est nu ; cote anglais il sort d'une serialisation JSON et s'ecrit
// \". Le motif ne voyait alors rien, et les trois liens anglais restaient sur
// « en-dcanimation.html » — un lien mort qu'aucune lecture de page ne montre,
// exactement le defaut que ce recablage existe pour empecher. L'echappement
// est donc capture, et la fermeture doit porter le meme.
const LIEN_RE = /(\\?)(["'])((?:e|en)-[a-z0-9-]+\.html)(#[^"'\\]*)?\1\2/g;
const ASSET_RE = /(\\?)(["'])((?:data[a-z0-9-]*|e-app|e-perso)\.js)\1\2/g;

function recabler(texte, ou, problemes) {
  let out = texte.replace(LIEN_RE, (tout, ech, q, nom, ancre) =>
    LIENS[nom] ? `${ech}${q}${LIENS[nom]}${ancre || ''}${ech}${q}` : tout);
  out = out.replace(ASSET_RE, (tout, ech, q, nom) =>
    ASSETS[nom] ? `${ech}${q}${ASSETS[nom]}${ech}${q}` : tout);

  for (const re of [LIEN_RE, ASSET_RE]) {
    re.lastIndex = 0;
    const restes = [...out.matchAll(re)].map(m => m[3]);
    if (restes.length) problemes.push(`${ou} : non recable — ${[...new Set(restes)].join(', ')}`);
  }
  return out;
}

/* ── L'échafaudage de maquette ──────────────────────────────────────────── */

// Les protos de l'accueil et de la liste des Dossiers portent un bouton
// « proto : simuler une progression » : il remplit le HUD de valeurs inventées
// pour qu'on puisse voir la page autrement qu'à zéro. Il n'avait rien à faire
// en production, et il y est passé quatre fois — publier.mjs recopiait le proto
// tel quel.
//
// Il ne fait pas un bloc mais quatre zones disjointes : la règle CSS, le bouton
// du pied de page, la variable `fake` avec sa dérivation au milieu du vrai
// calcul, et le gestionnaire de clic. Les deux dernières sont solidaires :
// retirer le bouton sans son gestionnaire ferait lever `addEventListener of
// null`, `paint()` ne tournerait jamais, et le HUD resterait à zéro sans une
// ligne dans la console.
//
// D'où des marqueurs posés dans le proto plutôt que des motifs devinés ici —
// même geste que les `i18n-off` / `i18n-on` de traduire-pages.mjs, qui ne
// touche ni au CSS ni aux commentaires : les marqueurs traversent donc la
// génération de l'anglais sans qu'on ait à les reposer.
const ECHAFAUDAGE = [
  /[ \t]*<!--\s*echafaudage-debut\s*-->[\s\S]*?<!--\s*echafaudage-fin\s*-->[ \t]*\r?\n?/g,
  /[ \t]*\/\*[^*]*echafaudage-debut[\s\S]*?echafaudage-fin\s*\*\/[ \t]*\r?\n?/g,
];

// Ce qui doit avoir disparu. Le marqueur resté en place compte autant que le
// bouton : il dit qu'une paire s'est décrochée, et un retrait qui échoue en
// silence est exactement ce qu'on cherche à empêcher.
const TRACES = [
  [/class="demo"/, 'bouton de maquette'],
  [/\bid="demo"/, 'bouton de maquette'],
  [/getElementById\((['"])demo\1\)/, 'gestionnaire du bouton de maquette'],
  [/(^|[\s,}])\.demo\s*[{:,]/m, 'règle CSS .demo'],
  [/\bvar fake\b/, 'variable d\'échafaudage `fake`'],
  [/echafaudage-(debut|fin)/, 'marqueur d\'échafaudage non apparié'],
];

/* ── Transformation d'un proto ──────────────────────────────────────────── */

const problemes = [];
const bilan = [];

function publier(route, langue) {
  const c = route[langue];
  const seo = SEO[route.cle] && SEO[route.cle][langue];
  if (!seo) { problemes.push(`${c.sortie} : rien dans _proto/seo.json pour « ${route.cle} »`); return; }
  for (const champ of ['title', 'ogTitle', 'desc', 'image']) {
    if (!seo[champ]) problemes.push(`${c.sortie} : ${champ} manquant dans _proto/seo.json`);
  }

  let h = lire(`_proto/${c.proto}`);
  const avant = h;

  // 1. le proto ne doit plus s'interdire aux moteurs
  h = h.replace(/[ \t]*<meta name="robots"[^>]*noindex[^>]*>\r?\n?/gi, '');
  if (/noindex/.test(h)) problemes.push(`${c.sortie} : noindex encore présent`);

  // 2. l'échafaudage de maquette ne va pas en production
  let retires = 0;
  for (const re of ECHAFAUDAGE) {
    h = h.replace(re, () => { retires++; return ''; });
  }
  for (const [re, quoi] of TRACES) {
    if (re.test(h)) problemes.push(`${c.sortie} : échafaudage encore présent — ${quoi}`);
  }

  // 3. PWA et icônes, juste après le charset
  // Le proto est en CRLF : chercher « /> » suivi de « \n » ne trouve rien,
  // le \r s'intercale. Même piège que le noindex ci-dessus.
  const avantPwa = h;
  h = h.replace(/(<meta charset="[^"]*"\s*\/?>)/i,
                `$1\n${PWA}\n${LIEN_FLUX(langue)}\n${PRERENDU_CSS}` +
                (route.cle === 'accueil' ? `\n${BOOT}` : ''));
  if (route.cle === 'accueil') {
    const avantCorps = h;
    h = h.replace(/(<body[^>]*>)/i, `$1\n${BOOT_CORPS(langue)}`);
    if (h === avantCorps) problemes.push(`${c.sortie} : <body> introuvable pour l'écran d'arrivée`);
  }
  if (h === avantPwa) problemes.push(`${c.sortie} : bloc PWA non injecté`);
  for (const attendu of ['/manifest.json', 'apple-touch-icon', 'theme-color']) {
    if (!h.includes(attendu)) problemes.push(`${c.sortie} : ${attendu} absent`);
  }

  // 4. titre et référencement à la place du titre de maquette
  const bloc = blocSeo(seo, route.en.url, route.fr.url, c.url, langue);
  const avantTitre = h;
  h = h.replace(/<title>[\s\S]*?<\/title>/, () => bloc);
  if (h === avantTitre) problemes.push(`${c.sortie} : <title> introuvable`);
  for (const attendu of [`content="${LOCALES[langue]}"`, 'og:locale:alternate']) {
    if (!h.includes(attendu)) problemes.push(`${c.sortie} : ${attendu} absent`);
  }

  // 5. les données structurées, en tête de page, juste avant </head>
  let ld = '';
  try {
    ld = jsonLd({ racine: RACINE, site: SITE, cle: route.cle, langue,
                  moi: c.url, urls: URLS[langue], imagesUnivers: IMAGES[langue] });
  } catch (e) {
    problemes.push(`${c.sortie} : JSON-LD — ${e.message}`);
  }
  if (ld) {
    const avantLd = h;
    h = h.replace(/<\/head>/i, `${ld}\n</head>`);
    if (h === avantLd) problemes.push(`${c.sortie} : </head> introuvable, JSON-LD non posé`);
  } else if (!problemes.some(p => p.startsWith(`${c.sortie} : JSON-LD`))) {
    problemes.push(`${c.sortie} : aucune donnée structurée`);
  }

  // 6. les liens de maquette deviennent les URL du site, les données et le
  //    moteur prennent leur nom de production
  h = recabler(h, c.sortie, problemes);

  // 7. le texte des entrées dans le HTML servi
  //
  // Il se pose **après** le recâblage : le pré-rendu est du texte sans balise
  // ni lien, il n'a rien à y gagner, et le laisser passer dessus reviendrait à
  // exposer son contenu à des substitutions faites pour du HTML de page.
  //
  // Les dix pages qui ont une timeline posent `<div id="timeline"></div>` vide
  // et l'écrasent par `innerHTML` depuis un script inline de fin de corps, donc
  // avant le premier rendu. Une page sans timeline rend '' et n'est pas touchée.
  let entrees = 0;
  try {
    const pr = prerendu({ racine: RACINE, cle: route.cle, langue });
    if (pr) {
      const avantPr = h;
      h = h.replace(/(<div id="timeline")(\s*)(><\/div>)/, `$1$2>${pr}</div>`);
      if (h === avantPr) {
        problemes.push(`${c.sortie} : <div id="timeline"></div> introuvable, pré-rendu non posé`);
      } else {
        entrees = comptePrerendu(pr);
      }
    }
  } catch (e) {
    problemes.push(`${c.sortie} : pré-rendu — ${e.message}`);
  }

  // 8. service worker et mesure d'audience
  h = h.replace(/(\r?\n)<\/body>/, `$1${PIED}$1</body>`);
  if (!h.includes('/pwa.js')) problemes.push(`${c.sortie} : pied de page non injecté`);

  if (h === avant) problemes.push(`${c.sortie} : aucune transformation appliquée`);

  bilan.push({ sortie: c.sortie, titre: seo.title, octets: h.length, retires, ld: ld.length, entrees });
  if (!CHECK) ecrire(c.sortie, h);
}

for (const r of ROUTES) { publier(r, 'fr'); publier(r, 'en'); }

/* ── Les données et le moteur, copiés sous leur nom de production ───────── */

const copies = [];
for (const [src, dest] of Object.entries(ASSETS)) {
  const de = `_proto/${src}`;
  if (!existe(de)) { problemes.push(`${de} manquant`); continue; }
  const contenu = recabler(lire(de), dest, problemes);
  copies.push({ dest, octets: contenu.length });
  if (!CHECK) ecrire(dest.slice(1), contenu);
}

/* Où éditer quoi. data/*.js est produit : y écrire une entrée à la main ne
   survivrait pas à la publication suivante. La source est le proto français,
   dont l'anglais est déduit par traduire.mjs. lore_gap.py lit cette table pour
   nommer le bon fichier, plutôt que d'en tenir une copie qui divergerait. */
const MANIFESTE = 'data/sources.json';
const table = Object.fromEntries(
  Object.entries(ASSETS).map(([src, dest]) => [dest.slice(1), `_proto/${src}`])
);
if (!CHECK) writeFileSync(join(RACINE, MANIFESTE), JSON.stringify(table, null, 2) + '\n');

/* ── Le plan du site ────────────────────────────────────────────────────── */

// Ce que chaque page doit à ses sources : son proto, et le fichier de données
// qui porte ses entrées quand elle en a un. C'est de là que sort son `lastmod`.
// Le Dossier n'est pas dans `SOURCES` — il range ses 535 lignes sous `CGD`.
const DONNEES = { 'dossier-sw': { fr: ['data-dossier-sw.js'], en: ['data-dossier-sw-en.js'] },
                  news:         { fr: ['data-news.js'],       en: ['data-news-en.js'] } };

function sourcesDe(cle, langue) {
  const route = ROUTES.find(r => r.cle === cle);
  const f = [`_proto/${route[langue].proto}`];
  const d = SOURCES[cle] ? [SOURCES[cle][langue][0]] : (DONNEES[cle] || {})[langue];
  for (const n of d || []) f.push(`_proto/${n}`);
  return f;
}

/* ── La page d'erreur ───────────────────────────────────────────────────── */

// GitHub Pages sert le `404.html` le plus proche du chemin demandé : une URL
// cassée sous `/fr/` reçoit la française, le reste l'anglaise. Elle n'est pas
// dans `ROUTES` — elle n'a pas de proto, pas de version à apparier, et c'est la
// seule page du site qui doit garder son `noindex`.
const autres = [];

/* ── Le flux du journal ─────────────────────────────────────────────────── */

// Le seul canal du site qui ne dépende de personne : pas d'algorithme entre le
// journal et qui le suit, et rien à administrer. Les liens des cartes passent
// par le **même** recâblage que le HTML — `data-news.js` pose
// `href:"e-marvel.html#mcu-smbnd"`, et deux recâblages qui divergeraient
// donneraient des liens morts dans le flux seulement.
const unLien = h => {
  const m = /^([^#]+)(#.*)?$/.exec(h) || [];
  return (LIENS[m[1]] || '') + (m[2] || '');
};

for (const [sortie, langue] of Object.entries(FLUX)) {
  const f = flux({ racine: RACINE, site: SITE, langue, moi: '/' + sortie,
                   urls: URLS[langue], lien: unLien });
  const n = (f.match(/<entry>/g) || []).length;
  if (!n) problemes.push(`${sortie} : flux vide`);
  if (/href="(?:https:\/\/chronologeek\.app)?"/.test(f)) {
    problemes.push(`${sortie} : lien de carte non recâblé`);
  }
  if (!CHECK) ecrire(sortie, f);
  autres.push({ dest: '/' + sortie, octets: f.length, note: `${n} entrées` });
}

const ERREURS = { 'fr/404.html': 'fr', '404.html': 'en' };
for (const [sortie, langue] of Object.entries(ERREURS)) {
  const page = erreur404({ racine: RACINE, langue, urls: URLS[langue] });
  if (!/name="robots" content="noindex/.test(page)) {
    problemes.push(`${sortie} : la page d'erreur doit rester en noindex`);
  }
  if (!CHECK) ecrire(sortie, page);
  autres.push({ dest: '/' + sortie, octets: page.length });
}

// L'index de la recherche de l'accueil, un fichier par langue, à la racine
// comme `radar.json` : les titres et les URL diffèrent d'une langue à l'autre.
const INDEX = { 'search-fr.json': 'fr', 'search-en.json': 'en' };
for (const [sortie, langue] of Object.entries(INDEX)) {
  let index = '';
  try {
    index = recherche({ racine: RACINE, langue, urls: URLS[langue] });
  } catch (e) {
    problemes.push(`${sortie} : ${e.message}`);
    continue;
  }
  const n = JSON.parse(index).e.length;
  if (!CHECK) writeFileSync(join(RACINE, sortie), index);
  autres.push({ dest: '/' + sortie, octets: index.length, note: `${n} œuvres` });
}

const plan = sitemap({ racine: RACINE, site: SITE, routes: ROUTES, sources: sourcesDe });
if (!CHECK) writeFileSync(join(RACINE, 'sitemap.xml'), plan);
const urls = (plan.match(/<loc>/g) || []).length;
if (urls !== ROUTES.length * 2) {
  problemes.push(`sitemap.xml : ${urls} URL pour ${ROUTES.length * 2} pages attendues`);
}

/* ── Bilan ──────────────────────────────────────────────────────────────── */

console.log(CHECK ? '— contrôle, rien n’est écrit —\n' : '— publication —\n');
for (const b of bilan) console.log(`  ${b.sortie.padEnd(34)} ${String(b.octets).padStart(7)} o   ` +
  `${String('ld ' + (b.ld < 1024 ? b.ld + ' o' : Math.round(b.ld / 1024) + ' Ko')).padEnd(10)} ` +
  `${String(b.entrees ? b.entrees + ' entrées' : '').padEnd(12)} ` +
  `${b.retires ? `[${b.retires} bloc(s) d'échafaudage retiré(s)] ` : ''}${b.titre}`);
console.log('');
// Un pré-rendu qui tombe à zéro sur une page qui en avait est le genre de
// silence que ce dépôt paie cher : il se lit ici, pas dans la page.
console.log(`  Pré-rendu : ${bilan.reduce((s, b) => s + b.entrees, 0)} entrées sur ` +
            `${bilan.filter(b => b.entrees).length} pages.`);
for (const c of copies) console.log(`  ${c.dest.padEnd(34)} ${String(c.octets).padStart(7)} o`);
console.log('');
for (const a of autres) console.log(`  ${a.dest.padEnd(34)} ${String(a.octets).padStart(7)} o` +
  (a.note ? `   ${a.note}` : ''));
console.log(`  ${'/sitemap.xml'.padEnd(34)} ${String(plan.length).padStart(7)} o   ${urls} URL datées`);
console.log(`\n  ${bilan.length} pages, ${copies.length} fichiers de données, ` +
            `2 flux, 2 pages d'erreur, 1 plan de site.`);

if (problemes.length) {
  console.error(`\n  ${problemes.length} PROBLÈME(S) :`);
  for (const p of problemes) console.error(`   · ${p}`);
  process.exit(1);
}
console.log('  Aucun problème.');
