// Les réglages du visiteur, côté publication. Posé le 5 novembre 2026.
//
// Trois choses sortent d'ici :
//
//   · **TETE_REGLAGES**, un script et son style, posés dans le <head> de toutes
//     les pages. Il lit `cg-options` avant le premier rendu : sans ça, les cartes
//     compactes, le grand texte et le calme arriveraient après coup, et la page
//     sauterait à chaque chargement. Le CSS n'est écrit que si une option le
//     demande : le visiteur qui n'a rien réglé ne paie que le script.
//   · **boutonReglages(langue)**, la roue dentée, posée juste avant le drapeau de
//     langue. Écrite à la publication et non par `e-app.js` : insérée au
//     chargement, elle décalerait la barre du menu sur toutes les pages. Les
//     pages d'œuvres relisent le menu de la page Star Wars publiée, elles
//     l'ont donc aussi.
//   · **reglages({racine})**, `/reglages.js` : les libellés de types, les noms et
//     les encres des univers, et chaque arrêt avec son type, son niveau et son
//     badge VO. Le panneau s'en sert pour dire ce qu'on peut masquer, et l'accueil
//     pour recompter ses totaux. **Il n'est demandé que par qui en a besoin** :
//     le panneau ouvert, ou un accueil dont une option masque quelque chose.
//
// Google n'est pas touché : tout joue dans le navigateur. Le pré-rendu et le
// JSON-LD restent entiers.

import { charge, SOURCES, decode } from './jsonld.mjs';
import { ENCRES } from './recherche.mjs';

const DANS = 'html[data-cg-';
const NON_COCHE = '.bu:has([data-check][aria-checked="false"])';

// Le CSS de chaque option : écrit seulement si l'option est active.
const CSS = {
  // Sans vignette. Les règles de la page ont deux poids selon la largeur, d'où
  // les !important : c'est le seul endroit du site où une option les retourne.
  cp: `${DANS}cp] .bu-fig{display:none!important}` +
      `${DANS}cp] .bu-card>.bu-head{grid-template-columns:minmax(0,1fr) 34px!important;padding-left:18px}` +
      `${DANS}cp] .bu-card>.bu-head .bu-txt{grid-column:1!important;padding-top:9px;padding-bottom:9px}` +
      `${DANS}cp] .bu-card>.bu-head .bu-end{grid-column:2!important}` +
      `${DANS}cp] .bu-card>.bu-sub{padding-left:18px!important}` +
      `@media(max-width:720px){${DANS}cp] .bu-card>.bu-head{padding-left:12px}${DANS}cp] .bu-card>.bu-sub{padding-left:12px!important}}`,
  // Le site écrit ses corps en pixels : `zoom` est la seule façon de tout grandir
  // d'un coup sans réécrire 900 règles, et les mises en page suivent.
  txt: `${DANS}txt] body{zoom:1.12}`,
  // Un filtre sur la racine ne crée pas de bloc conteneur : les éléments fixes
  // restent à leur place (le cas est écrit dans la spécification).
  ctr: `${DANS}ctr]{filter:contrast(1.22) brightness(1.1)}`,
  calme: `${DANS}calme] *,${DANS}calme] *::before,${DANS}calme] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}` +
         `${DANS}calme] .ln-svg .p{display:none!important}`,
  // Le synopsis attend la coche. La FAQ reste : elle est sans spoil, tranché par Niko.
  sp: `${DANS}sp] ${NON_COCHE} .expand-synopsis{display:none}` +
      `${DANS}sp] ${NON_COCHE} .expand-info::before{content:"Synopsis masqué jusqu’à la coche";display:block;font-style:italic;font-size:12.5px;opacity:.72;margin-bottom:6px}` +
      `html[lang=en]${DANS}sp] ${NON_COCHE} .expand-info::before{content:"Synopsis hidden until you tick it"}`,
  flou: `${DANS}flou] ${NON_COCHE} .bu-fig img,${DANS}flou] ${NON_COCHE} .expand-poster img{filter:blur(9px) saturate(.8)}`,
};

// Écrit à la main parce qu'il part tel quel dans chaque page. `h.lang` est lu ici
// et non `CG.t.lang` : les données ne sont pas encore là.
//
// `voit()` est la seule règle de masquage du site, et la page, le Dossier et
// l'accueil passent tous par elle. `sansMust` : DC n'a pas d'essentiels en
// multivers, son niveau le plus haut est `imp` — « essentiels seulement » le
// viderait, donc le niveau le plus haut de la page en tient lieu.
//
// `matchMedia` est remplacé pour le seul test du mouvement réduit : les pages
// décident en JS de dessiner la ligne entière et de couper leurs impulsions, et
// elles passent toutes par lui. Une option de plus à lire dans chacune aurait été
// treize endroits à tenir.
// La roue n'a pas sa place dans l'en-tête d'un téléphone : le logo y est fixe,
// et le burger sortait de 19 px à 375. Elle passe alors dans le tiroir.
const TOUJOURS = '<style>header .cg-roue{border:0!important;background:none!important;box-shadow:none!important;color:var(--paper);width:40px}' +
  'header .cg-roue svg{width:25px;height:25px;display:block;transition:transform .6s cubic-bezier(.3,1.5,.5,1)}' +
  'header .cg-roue .moyeu{fill:var(--hot);stroke:var(--hot)}header .cg-roue:hover{color:var(--hot);transform:none}' +
  'header .cg-roue:hover svg{transform:rotate(90deg)}header .cg-roue:focus-visible{outline:2px solid var(--hot);outline-offset:2px}' +
  '.dw-rg{display:none}@media(max-width:440px){header .cg-roue{display:none!important}' +
  '.dw-rg{display:flex;align-items:center;width:100%;background:none;border:0;border-bottom:1.6px solid rgba(255,253,247,.26);' +
  "padding:8px 12px;font:800 17px/1.05 'Big Shoulders Display','BSD repli',sans-serif;letter-spacing:.05em;" +
  'text-transform:uppercase;color:var(--paper);cursor:pointer;text-align:left}}</style>';

export const TETE_REGLAGES = TOUJOURS + '<script>(function(){' +
  'var o={},h=document.documentElement,d=h.dataset;' +
  'try{o=JSON.parse(localStorage.getItem("cg-options"))||{}}catch(e){}' +
  'var en=h.lang==="en",T={},c="",S=' + JSON.stringify(CSS) + ';' +
  '(o.t||[]).forEach(function(k){T[k]=1});' +
  'for(var k in S)if(o[k]){d["cg"+k.charAt(0).toUpperCase()+k.slice(1)]=1;c+=S[k]}' +
  'if(o.calme){var m=window.matchMedia;window.matchMedia=function(q){return/reduced-motion/.test(q)&&/reduce\\b/.test(q)' +
  '?{matches:true,media:q,addEventListener:function(){},removeEventListener:function(){},addListener:function(){},removeListener:function(){}}' +
  ':m.call(window,q)}}' +
  'if(c)document.write("<style>"+c+"</style>");' +
  'window.CG_OPT={o:o,en:en,masque:!!((o.t&&o.t.length)||o.n||(o.vf&&!en)),' +
  'ex:function(){return Object.keys(o).length?o:void 0},' +
  'voit:function(t,l,v,sansMust){if(T[t])return false;if(v&&o.vf&&!en)return false;' +
  'if(o.n&&l){var a=l==="must",b=l==="imp"||l==="important";' +
  'if(o.n==="must"&&!(a||(sansMust&&b)))return false;if(o.n==="imp"&&!(a||b))return false}return true}}' +
  '})();</script>';

// La roue : le dessin de Lucide (licence ISC), un trait fin et un moyeu doré.
// Sans le cadre carré des autres boutons du menu, demandé par Niko le 7 novembre 2026.
const ROUE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>' +
  '<circle class="moyeu" cx="12" cy="12" r="3"/></svg>';

export const tiroirReglages = langue =>
  `<button type="button" class="dw-rg" data-reglages>${langue === 'en' ? 'Settings' : 'Réglages'}</button>`;

export const boutonReglages = langue => {
  const n = langue === 'en' ? 'Settings' : 'Réglages';
  return `<button type="button" class="icon-btn cg-roue" data-reglages aria-label="${n}" title="${n}">${ROUE}</button>`;
};

// Les noms que le visiteur lit dans le panneau. Le type lui-même vient toujours des
// `badgeLabels` et des `kindLabels` : un type absent d'ici garde son libellé.
const PLURIELS = {
  film: ['Films', 'Movies'], filmanim: ['Films animés', 'Animated movies'], serie: ['Séries', 'Series'],
  anime: ['Séries animées', 'Animated series'], jeu: ['Jeux vidéo', 'Video games'], dlc: ['DLC', 'DLC'],
  comic: ['Comics', 'Comics'], roman: ['Romans', 'Novels'], jeunesse: ['Romans jeune adulte', 'Young adult novels'],
  audio: ['Livres audio', 'Audiobooks'], short: ['Courts métrages', 'Short films'], video: ['Vidéos', 'Videos'],
  web: ['Webséries', 'Web series'], special: ['Spéciaux', 'Specials'],
};

const casse = s => {
  const t = decode(String(s)).toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const arret = e => e && e.id && e.type !== 'separator' && e.type !== 'note';

// Les codes de ligne du plan de l'accueil : le panneau les pose comme des pastilles.
const CODES = { sw: 'SW', mcu: 'MCU', dc: 'DC', avatar: 'AV', startrek: 'ST', twd: 'TWD', dragonage: 'DA',
  assassinscreed: 'AC', dcanimation: 'DCA', jurassic: 'JW', witcher: 'TW', residentevil: 'RE', bladerunner: 'BR', monsterverse: 'MV' };

export function reglages({ racine }) {
  const types = {}, u = {};
  function type(k, fr, en) {
    if (!types[k]) types[k] = PLURIELS[k] || [casse(fr || k), casse(en || fr || k)];
  }
  for (const [cle, s] of Object.entries(SOURCES)) {
    const wf = charge(racine, s.fr[0], s.fr[1]), we = charge(racine, s.en[0], s.en[1]);
    const D = wf[s.fr[1]];
    if (!D || !D.eras) throw new Error(`reglages : ${cle} sans ères`);
    const lf = (wf.CG && wf.CG.badgeLabels) || {}, le = (we.CG && we.CG.badgeLabels) || {};
    for (const k of Object.keys(lf)) type(k, lf[k][1], (le[k] || [])[1]);
    u[cle] = {
      c: ENCRES[cle], k: CODES[cle],
      // le nom court, celui du menu : « DC — Guide du Multivers » s'arrête à « DC »
      n: [decode(D.title), decode((we[s.en[1]] || D).title)]
        .map(t => t.replace(/\s+[—–-]\s.*$/, '').replace(/^Marvel Cinematic Universe$/, 'Marvel')),
      // Une rangée par ère, dans l'ordre de la table `E` de l'accueil.
      e: D.eras.map(era => (era.entries || []).filter(arret).map(x => [x.id, x.type, x.level || 0, x.lang === 'vo' ? 1 : 0])),
    };
  }
  const wf = charge(racine, 'data-dossier-sw.js', 'CGD'), we = charge(racine, 'data-dossier-sw-en.js', 'CGD');
  const kf = ((wf.CGDT || wf.CG) || {}).kindLabels || {}, ke = ((we.CGDT || we.CG) || {}).kindLabels || {};
  for (const k of Object.keys(kf)) type(k, kf[k], ke[k]);
  u['dossier-sw'] = {
    c: ENCRES.sw, dossier: 1,
    e: wf.CGD.eras.map(era => era.items.filter(x => x.kind === 'it').map(x => [x.id, x.k, 0, x.vo ? 1 : 0])),
  };
  return '/* Produit par publier.mjs — voir reglages.mjs. */\nwindow.CG_TABLE=' +
    JSON.stringify({ types, u }) + ';\n';
}
