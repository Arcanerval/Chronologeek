/* Construit `en-assassinscreed.html` depuis `en-dragonage.html`.

   Dragon Age est le gabarit le plus proche : meme profil de guide — des
   jeux, des DLC, des livres et des comics, pas une minute d'ecran a sommer
   — et meme sens de traduction, l'anglais est la source. La page AC n'a
   donc rien a inventer : elle change d'encre, de sagas, de reperes et de
   donnees.

   Chaque remplacement est compte. Un motif qui ne se retrouve plus fait
   sortir le script en erreur, plutot que de laisser passer une page a
   moitie convertie — c'est le mode de defaillance du depot : rien ne
   casse, la console reste vide, et la page est fausse.

   Usage : node _proto/construire-page-assassinscreed.mjs [--check]      */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const MODELE = path.join(ICI, 'en-dragonage.html');
const SORTIE = path.join(ICI, 'en-assassinscreed.html');
const CHECK = process.argv.includes('--check');

/* ── ce que la page doit savoir des donnees ───────────────────────── */
const bac = { window: {} };
new Function('window', fs.readFileSync(path.join(ICI, 'data-assassinscreed-en.js'), 'utf8'))(bac.window);
const D = bac.window.ASSASSINSCREED;
const ALL = D.eras.flatMap((e) => e.entries);
const parType = {};
ALL.forEach((e) => { parType[e.type] = (parType[e.type] || 0) + 1; });

/* La banniere : faute de WebP local, l'illustration de Mirage tient la
   place — c'est le visuel le plus « Assassin's Creed » du lot, capuche
   blanche et lame secrete. Elle part des que Niko pose son fichier. */
const BANNIERE = (ALL.find((e) => e.id === 'ac-mirage-1') || {}).img
  || (ALL.find((e) => e.img) || {}).img;
if (!BANNIERE) throw new Error('aucun visuel : lancer visuels-assassinscreed.mjs');

/* Les protos sont en CRLF. On travaille en LF — sans quoi tout motif
   multiligne cherche un `\n` qui n'existe pas et ne trouve rien — et la
   sortie repasse en CRLF, comme les neuf autres protos. */
const CRLF = /\r\n/.test(fs.readFileSync(MODELE, 'latin1'));
let h = fs.readFileSync(MODELE, 'utf8').replace(/\r\n/g, '\n');
const journal = [];

/* remplacement compte : `n` occurrences attendues, ni plus ni moins */
function rmp(quoi, par, n = 1, quoiEstRegex = false) {
  const re = quoiEstRegex ? quoi
    : new RegExp(quoi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const trouve = (h.match(re) || []).length;
  if (trouve !== n) {
    throw new Error('motif attendu ' + n + ' fois, trouve ' + trouve + ' : ' +
      String(quoi).slice(0, 110));
  }
  h = h.replace(re, par);
  journal.push(n + '× ' + String(quoi).slice(0, 64).replace(/\s+/g, ' '));
}

/* ══ 1. en-tete du document ═══════════════════════════════════════ */
rmp('<title>Chronologeek — Dragon Age (proto E)</title>',
    '<title>Chronologeek — Assassin’s Creed (proto E)</title>');
rmp('<link rel="preload" as="image" href="/images/dragonage.webp"/>',
    '<link rel="preload" as="image" href="' + BANNIERE + '"/>');

/* ══ 2. les encres ════════════════════════════════════════════════
   L'univers prend le rouge sang de l'insigne des Assassins. Il est plus
   sombre et plus froid que le `#e23636` de Marvel, seul autre rouge de la
   charte : a cote l'un de l'autre, les deux se distinguent.

   Sept encres de saga, une par bloc du document, et elles suivent le
   recit : le sable de la Terre sainte, le vin de la Renaissance, le
   bleu-vert des Caraibes, l'acier du Paris industriel, l'or turquoise de
   l'Antiquite, le violet numerique de l'Animus Hub, et le pourpre neutre
   des Assassins de l'Histoire, qui n'ont pas d'epoque a eux.           */
rmp(`  --uni:#e07b39;`, `  --uni:#c0202f;`);
rmp(`  --era1:#7a2222; --era2:#7a5a16; --era3:#5c2233;
  --era4:#14515c; --era5:#4a3566;`,
`  --era1:#8a6a2f; --era2:#7a2230; --era3:#1c5b63;
  --era4:#2e4a7a; --era5:#146b5c; --era6:#4a2f6b; --era7:#5c3a4a;`);

/* Le commentaire des encres de Dragon Age parle de son propre recit. */
rmp(/  \/\* cinq encres d'ère[\s\S]*?violet du Loup Terrible\. \*\/\n/,
`  /* sept encres de saga, une par bloc du document de Niko. Elles suivent
     le récit : le sable de la Terre sainte, le vin de la Renaissance, le
     bleu-vert des Caraïbes, l'acier du Paris industriel, l'or turquoise
     de l'Antiquité, le violet numérique de l'Animus Hub, et le pourpre
     neutre des Assassins de l'Histoire, qui n'ont pas d'époque à eux. */\n`,
1, true);

/* Les badges de type : sept formes, celles du document. Le DLC garde la
   teinte claire du jeu ; le film reprend le bleu de la charte ; la
   fiction audio prend un vert d'eau, seule encre encore libre a cote du
   comic. */
rmp(`  --t-jeu:#ffb74d; --t-dlc:#ffcc80; --t-roman:#a99cf9; --t-comic:#4dd0e1;
  --t-video:#f472b6; --t-web:#ffa726; --t-filmanim:#90caf9; --t-anime:#ce93d8;`,
`  --t-jeu:#ffb74d; --t-dlc:#ffcc80; --t-roman:#a99cf9; --t-comic:#4dd0e1;
  --t-film:#64b5f6; --t-video:#f472b6; --t-audio:#80cbc4;`);
rmp(/  \/\* badges de type, charte du site\. Dragon Age est le premier guide à[\s\S]*?l'orange qu'il a sur Avatar, où il n'avait pas de jeu à côté de lui\. \*\/\n/,
`  /* badges de type, charte du site. Sept formes, celles du document : le
     DLC garde la teinte claire du jeu, le film reprend le bleu de la
     charte, et la fiction audio — une seule entrée, « Gold » — prend un
     vert d'eau, la seule encre encore libre à côté du comic. */\n`,
1, true);

/* Deux repères, la où Dragon Age n'en avait qu'un : le guide pose des
   flashbacks ET des flashforwards, et ces derniers sont sa signature —
   les trois Chronicles se jouent avant l'heure. */
rmp(`  /* le seul repère du guide */
  --m-flashback:#f0c97c;`,
`  /* les deux repères du guide. Le flashforward est sa signature : les
     trois Chronicles se jouent bien avant leur place dans l'Histoire. */
  --m-flashback:#f0c97c; --m-flashforward:#8fd6c4;`);

/* ══ 3. la navigation ═════════════════════════════════════════════ */
rmp(`.u-av{--k:#7dd3fc}.u-st{--k:#b48cf2}.u-twd{--k:#a8bf4f}.u-da{--k:#e07b39}`,
    `.u-av{--k:#7dd3fc}.u-st{--k:#b48cf2}.u-twd{--k:#a8bf4f}.u-da{--k:#e07b39}.u-ac{--k:#c0202f}`);
rmp(`<a href="en-twd.html">The Walking Dead</a><a href="#" aria-current="page">Dragon Age</a></div></details>`,
    `<a href="en-twd.html">The Walking Dead</a><a href="en-dragonage.html">Dragon Age</a><a href="#" aria-current="page">Assassin’s Creed</a></div></details>`);
rmp(`href="e-dragonage.html"`, `href="e-assassinscreed.html"`);
rmp(`<a href="#" class="u-da" aria-current="page"><i aria-hidden="true"></i>Dragon Age</a></div>`,
    `<a href="en-dragonage.html" class="u-da"><i aria-hidden="true"></i>Dragon Age</a>` +
    `<a href="#" class="u-ac" aria-current="page"><i aria-hidden="true"></i>Assassin’s Creed</a></div>`);
rmp(`<li><a href="en-twd.html">The Walking Dead</a></li><li><a href="#" aria-current="page">Dragon Age</a></li>`,
    `<li><a href="en-twd.html">The Walking Dead</a></li><li><a href="en-dragonage.html">Dragon Age</a></li>` +
    `<li><a href="#" aria-current="page">Assassin’s Creed</a></li>`);
rmp(`The Walking Dead and Dragon Age are trademarks of their respective`,
    `The Walking Dead, Dragon Age and Assassin’s Creed are trademarks of their respective`);

/* ══ 4. la bannière ═══════════════════════════════════════════════ */
rmp(`  background-image:url(/images/dragonage.webp)}`,
    `  background-image:url(${BANNIERE})}`);
rmp(`<h1 class="disp off">Dragon Age</h1>`,
    `<h1 class="disp off">Assassin’s Creed</h1>`);
rmp(`    <p class="dek">Games · DLC · Books · Comics — the whole Dragon Age universe in its most optimized order.`,
    `    <p class="dek">Games · DLC · Books · Comics — the whole Assassin’s Creed universe in its most optimized order.`);
rmp(`      <div class="s"><b>4</b><span>Games</span></div>
      <div class="s"><b>13</b><span>DLC</span></div>
      <div class="s"><b>6</b><span>Books</span></div>
      <div class="s"><b>9</b><span>Comics</span></div>
      <div class="s"><b id="s-tot">43</b><span>Entries</span></div>`,
`      <div class="s"><b>${parType.jeu}</b><span>Games</span></div>
      <div class="s"><b>${parType.dlc}</b><span>DLC</span></div>
      <div class="s"><b>${parType.roman}</b><span>Books</span></div>
      <div class="s"><b>${parType.comic}</b><span>Comics</span></div>
      <div class="s"><b id="s-tot">${ALL.length}</b><span>Entries</span></div>`);
rmp(`<span id="k-tot">43</span>`, `<span id="k-tot">${ALL.length}</span>`);

/* ══ 5. la légende des repères ════════════════════════════════════ */
rmp(`<div class="marks"><span>Markers</span><span class="ft" style="--k:var(--m-flashback)">FLASHBACK</span></div>`,
    `<div class="marks"><span>Markers</span>` +
    `<span class="ft" style="--k:var(--m-flashback)">FLASHBACK</span>` +
    `<span class="ft" style="--k:var(--m-flashforward)">FLASHFORWARD</span></div>`);

/* ══ 6. le bouton « remonter en haut » ════════════════════════════
   Les six autres univers ont deux WebP ; celui-ci n'en a pas encore. Trois
   chevrons d'ascension tiennent la place — ils disent ce que le bouton
   fait, et ils evoquent la montee de la tour sans emprunter l'insigne
   d'aucun ayant droit. C'est la meme solution que le chapeau de sherif
   qui a tenu une journee sur The Walking Dead : elle part le jour ou Niko
   pose `ac1.webp` / `ac2.webp`, et le selecteur CSS redevient
   `#totop img` seul, comme sur les six autres pages. */
rmp(`  <span><img class="nl" src="/images/da1.webp" alt=""/><img class="hv" src="/images/da2.webp" alt=""/></span>`,
`  <span><svg viewBox="0 0 96 96" aria-hidden="true" fill="none"
    stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 74 48 48l26 26" opacity=".3"/>
    <path d="M22 56 48 30l26 26" opacity=".62"/>
    <path d="M22 38 48 12l26 26"/></svg></span>`);
rmp(`#totop img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}`,
`#totop svg{width:100%;height:100%;color:var(--uni);
  filter:drop-shadow(0 0 10px color-mix(in srgb,var(--uni) 55%,transparent));
  transition:color .18s,transform .18s}
#totop:hover svg{color:var(--hot);transform:translateY(-3px)}`);
rmp(`#totop .hv{opacity:0}
#totop:hover .nl{opacity:0}
#totop:hover .hv{opacity:1}`, ``);

/* ══ 7. le script ═════════════════════════════════════════════════ */
rmp(`<script src="data-dragonage-en.js"></script>`,
    `<script src="data-assassinscreed-en.js"></script>`);
rmp(`var CFG=window.CG, D=window.DRAGONAGE, RT=window.RT||{};`,
    `var CFG=window.CG, D=window.ASSASSINSCREED, RT=window.RT||{};`);
rmp(`    resetDA:CFG.resetMsg,`, `    resetAC:CFG.resetMsg,`);
rmp(`T.resetDA`, `T.resetAC`);
rmp(`      || '/images/dragonage.webp';`, `      || '${BANNIERE}';`);
rmp(`  var KEY='cg-proto-dragonage';`, `  var KEY='cg-proto-assassinscreed';`);
rmp(`{u:'dragonage'}`, `{u:'assassinscreed'}`);
rmp(`a.download='chronologeek-dragonage.json';`, `a.download='chronologeek-assassinscreed.json';`);

/* Les repères : Dragon Age n'en connaissait qu'un, écrit en dur. Ce guide
   en a deux, et la table `markLabels` des données les nomme — la page
   n'a plus à en connaître la liste. */
rmp(`    var fb=(e.tags||[]).indexOf('flashback')>-1 ? '<span class="ft">FLASHBACK</span>' : '';`,
`    /* Deux repères ici, et la table des données les nomme : une page qui
       écrit « FLASHBACK » en dur ne montre pas le flashforward, sans une
       ligne dans la console. */
    var fb=(e.tags||[]).map(function(k){
      return CFG.markLabels && CFG.markLabels[k]
        ? '<span class="ft" style="--k:var(--m-'+k+')">'+esc(CFG.markLabels[k])+'</span>' : ''; }).join('');`);

/* Les notes : le document en pose jusqu'à trois sur la même entrée —
   Valhalla porte le personnage canon, la quête à ne pas manquer et les
   dix anomalies. Jointes en une phrase, elles se lisaient comme une
   seule consigne. */
rmp(`            (e.note?'<span class="bu-note">'+esc(e.note)+'</span>':'')+`,
`            (e.notes?e.notes.map(function(t){
              return '<span class="bu-note">'+esc(t)+'</span>'; }).join('')
              :(e.note?'<span class="bu-note">'+esc(e.note)+'</span>':''))+`);

/* ══ 8. garde-fous ════════════════════════════════════════════════ */
const traces = [
  /* Ce qui reste doit être exactement les quatre renvois vers l'univers
     voisin : le menu déroulant, la grille du tiroir, la liste du pied de
     page et la mention légale. Un cinquième, c'est un remplacement raté. */
  [/Dragon Age/g, 4],
  [/en-dragonage\.html/g, 3],
  [/DRAGONAGE/g, 0],
  [/\/images\/da[12]\.webp/g, 0],
  [/resetDA/g, 0],
];
const restes = [];
for (const [re, max] of traces) {
  const n = (h.match(re) || []).length;
  if (n > max) restes.push(String(re) + ' : ' + n + ' occurrences, max ' + max);
}
/* Les sept encres de saga doivent toutes exister : `--era6` et `--era7`
   sont neuves, et une saga sans encre s'affiche en noir sans rien dire. */
for (let i = 1; i <= D.eras.length; i++) {
  if (!h.includes('--era' + i + ':')) restes.push('encre manquante : --era' + i);
}
for (const t of ['--t-film:', '--t-audio:', '--m-flashforward:', '.u-ac{']) {
  if (!h.includes(t)) restes.push('déclaration manquante : ' + t);
}
if (!h.includes('<title>Chronologeek — Assassin’s Creed')) restes.push('titre non posé');
if (restes.length) { console.error('RESTES :\n- ' + restes.join('\n- ')); process.exit(1); }

console.log('Page Assassin’s Creed — ' + journal.length + ' remplacements');
journal.forEach((l) => console.log('  ' + l));
console.log('  bannière : ' + BANNIERE);
console.log('  entrées  : ' + ALL.length + ' · sagas : ' + D.eras.length);

if (CHECK) { console.log('\n--check : rien écrit.'); process.exit(0); }

fs.writeFileSync(SORTIE, CRLF ? h.replace(/\n/g, '\r\n') : h, 'utf8');
console.log('\nÉcrit : ' + path.relative(process.cwd(), SORTIE));
