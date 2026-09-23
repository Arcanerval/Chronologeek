/* ═══ LE CÂBLAGE DES UNIVERS ═════════════════════════════════════════
   Un univers se pose à dix-neuf endroits, et **aucun oubli ne lève
   d'erreur** : la barre de reprise de l'accueil a affiché « undefined »
   deux jours durant parce que la table `NAMES` s'arrêtait à Jurassic
   World, et « Mes ajouts » ne s'ouvrait pas sur la page Witcher parce que
   `NOMS` de `e-perso.js` ne connaissait pas son global. Ni l'un ni l'autre
   ne se voit dans la console — c'est le mode de défaillance du dépôt.

   Ce script lit `ROUTES` de `publier.mjs` comme source de vérité, en tire
   les quatre écritures de chaque univers (la clé, le nom du proto, celui
   des données, la route publiée), puis vérifie que chaque table le porte.
   Il ne connaît aucun univers par son nom : un douzième est contrôlé le
   jour où il entre dans `ROUTES`, sans qu'on touche à ce fichier.

       node _proto/cablage.mjs           le tableau, et la sortie en erreur
       node _proto/cablage.mjs --court   la seule dernière ligne

   `publier.mjs` l'appelle avant d'écrire : un univers à moitié câblé ne
   part pas en ligne.
   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const lire = p => fs.readFileSync(path.join(RACINE, p), 'utf8');
const existe = p => fs.existsSync(path.join(RACINE, p));

/* ── les univers, lus dans ROUTES ─────────────────────────────────
   Les pages qui ne sont pas des univers — accueil, nouveautés, à venir,
   la liste des Dossiers — n'ont ni données ni case, et le Dossier
   Star Wars est une page d'univers sans en être un : il n'a ni carte à
   l'accueil, ni couleur, ni entrée au radar. */
const HORS = new Set(['accueil', 'nouveautes', 'a-venir', 'dossiers', 'dossier-sw']);

function universDeRoutes() {
  const src = lire('_proto/publier.mjs');
  const bloc = src.slice(src.indexOf('const ROUTES'), src.indexOf('\n];', src.indexOf('const ROUTES')));
  const out = [];
  const re = /\{\s*cle:\s*'([^']+)',\s*fr:\s*\{[^}]*proto:\s*'([^']+)'[^}]*sortie:\s*'([^']+)'[^}]*\},\s*en:\s*\{[^}]*proto:\s*'([^']+)'[^}]*sortie:\s*'([^']+)'/g;
  for (const m of bloc.matchAll(re)) {
    const [, cle, protoFr, sortieFr, protoEn, sortieEn] = m;
    if (HORS.has(cle)) continue;
    const route = sortieEn.replace(/\.html$/, '');    // starwars, walkingdead, witcher…
    /* Le nom du fichier de données ne se déduit pas de celui du proto :
       Star Wars s'appelle `data.js` tout court. C'est `ASSETS` qui apparie
       le proto et la sortie, et c'est donc lui qui répond. */
    const m2 = src.match(new RegExp(`'(data[a-z0-9-]*)\\.js':\\s*'/data/${route}-fr\\.js'`));
    out.push({ cle, protoFr, protoEn, route, donnees: m2 ? m2[1] : null });
  }
  return out;
}

/* Le nom du global d'un fichier de données : `window.WITCHER = {…}` ou
   `var DATA_DA = {…}`. Lu dans le fichier plutôt que deviné — les onze ne
   suivent pas la même convention. */
function globalDe(u) {
  const src = lire(`_proto/${u.donnees}-en.js`);
  /* Le fichier déclare aussi `window.CG` (les libellés) et `window.RT`
     (les durées) : le global de la timeline est celui qui reste.

     On rend TOUS les noms sous lesquels il est atteignable. Huit fichiers
     écrivent `var DATA_SW = {…}` puis `window.SW = DATA_SW` ; Dragon Age
     porte `var DATA_DA` et `window.DRAGONAGE`. Un `var` de premier niveau
     étant de toute façon une propriété de `window`, les deux répondent —
     il suffit donc que `NOMS` en connaisse un. */
  const noms = [
    ...[...src.matchAll(/window\.([A-Z_][A-Z0-9_]*)\s*=/g)].map(m => m[1]),
    ...[...src.matchAll(/\b(?:var|const)\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{/g)].map(m => m[1]),
  ].filter(n => n !== 'CG' && n !== 'RT');
  return [...new Set(noms)];
}

/* La clé de stockage déclarée par la page : `var KEY='cg-proto-witcher'`. */
function cleStockage(u) {
  const m = lire(`_proto/${u.protoEn}`).match(/var\s+KEY\s*=\s*'([^']+)'/);
  return m ? m[1] : null;
}

/* Le champ `universe` de l'export, écrit dans la page. */
function cleExport(u) {
  const m = lire(`_proto/${u.protoEn}`).match(/universe:\s*'([^']+)'/);
  return m ? m[1] : null;
}

const univers = universDeRoutes();
const manques = [];
const note = (u, quoi, ok) => { if (!ok) manques.push(`${u.cle.padEnd(16)} ${quoi}`); };

/* ── les fichiers lus une fois ────────────────────────────────────── */
const F = {
  publier: lire('_proto/publier.mjs'),
  jsonld: lire('_proto/jsonld.mjs'),
  sync: lire('sync.py'),
  sw: lire('sw.js'),
  recherche: lire('_proto/recherche.mjs'),
  err404: lire('_proto/erreur404.mjs'),
  app: lire('_proto/e-app.js'),
  perso: lire('_proto/e-perso.js'),
  accueil: lire('_proto/e-accueil.html'),
  news: lire('_proto/e-nouveautes.html'),
  avenir: lire('_proto/e-a-venir.html'),
  video: lire('_proto/video.mjs'),
  carrousel: lire('_proto/carrousel.mjs'),
  stories: lire('_proto/stories.mjs'),
  radar: lire('radar.py'),
  seo: JSON.parse(lire('_proto/seo.json')),
};

/* Les univers que le radar suit : lui seul décide, et trois tables ne
   valent que pour ceux-là — la colonne d'« À venir », l'encart des pages
   et la table `UNIVERSES` de `radar.py`. */
const blocRadar = F.radar.slice(F.radar.indexOf('UNIVERSES = {'), F.radar.indexOf('\n}', F.radar.indexOf('UNIVERSES = {')));
const auRadar = new Set([...blocRadar.matchAll(/^\s*"([a-z]+)":/gm)].map(m => m[1]));

for (const u of univers) {
  const g = globalDe(u);
  const stock = cleStockage(u);
  const exp = cleExport(u);

  // 1. les deux fichiers de données sont publiés
  note(u, 'ASSETS de publier.mjs (fr)', F.publier.includes(`'${u.donnees}.js'`));
  note(u, 'ASSETS de publier.mjs (en)', F.publier.includes(`'${u.donnees}-en.js'`));
  // 2. le référencement
  note(u, 'seo.json', !!F.seo[u.cle]);
  // 3. les données structurées : la source et la liste des univers
  note(u, 'SOURCES de jsonld.mjs', new RegExp(`\\b${u.cle}:\\s*\\{\\s*fr:`).test(F.jsonld));
  note(u, "liste d'univers de jsonld.mjs", new RegExp(`'${u.cle}'`).test(F.jsonld.slice(F.jsonld.indexOf('BreadcrumbList') > 0 ? 0 : 0)) && F.jsonld.includes(`'${u.cle}'`));
  // 4. la parité FR/EN
  note(u, 'PAGES de sync.py', new RegExp(`"${u.cle}":\\s*Paire\\(`).test(F.sync));
  // 5. le hors-ligne
  note(u, 'PRECACHE de sw.js (page en)', F.sw.includes(`'/${u.route}.html'`));
  note(u, 'PRECACHE de sw.js (page fr)', F.sw.includes(`'/fr/${u.route}.html'`));
  note(u, 'PRECACHE de sw.js (données)', F.sw.includes(`/data/${u.route}-en.js`) && F.sw.includes(`/data/${u.route}-fr.js`));
  // 6. les deux tables de couleurs
  note(u, 'couleur de recherche.mjs', new RegExp(`\\b${u.cle}:\\s*'#`).test(F.recherche));
  note(u, "couleur d'erreur404.mjs", new RegExp(`\\['${u.cle}',\\s*'#`).test(F.err404));
  // 7. e-app.js : l'export global, et l'encart du radar
  note(u, "table UNIVERS d'e-app.js", new RegExp(`u:\\s*'${exp || u.cle}'`).test(F.app));
  note(u, 'clé de stockage cohérente', !!stock && F.app.includes(`prog:'${stock}'`.replace(/'/g, "'")) || F.app.includes(stock || '###'));
  if (auRadar.has(u.cle) || auRadar.has(u.route)) {
    note(u, "table RADAR d'e-app.js", new RegExp(`${u.route}:\\s*\\{\\s*u:`).test(F.app));
    note(u, "colonne d'À venir (UNI)", new RegExp(`\\b${[...auRadar].find(k => k === u.cle || k === u.route)}:\\s*\\[`).test(F.avenir));
  }
  // 8. l'accueil : la case, le nom de la barre de reprise
  note(u, "case de l'accueil", F.accueil.includes(`data-u="${exp || u.cle}"`));
  note(u, "NAMES de l'accueil (barre de reprise)", new RegExp(`\\b${exp || u.cle}:\\s*'`).test(F.accueil.slice(F.accueil.indexOf('NAMES='), F.accueil.indexOf('}', F.accueil.indexOf('NAMES=')))));
  // 9. le journal
  note(u, 'table UNI des Nouveautés', new RegExp(`\\b${exp || u.cle}:\\s*\\[`).test(F.news));
  // 10. les ajouts perso
  note(u, "NOMS d'e-perso.js", g.length > 0 && g.some(n => F.perso.includes(`'${n}'`)));
  // 11. la promo
  note(u, 'video.mjs', new RegExp(`\\b${u.cle}:\\s*\\{\\s*data:`).test(F.video));
  note(u, 'carrousel.mjs (données)', new RegExp(`\\b${u.cle}:\\s*\\{\\s*data:`).test(F.carrousel));
  note(u, 'carrousel.mjs (visuel)', new RegExp(`\\b${u.cle}:\\s*'`).test(F.carrousel.slice(F.carrousel.indexOf('sw:'))));
  /* `stories.mjs` part de `radar.json`, donc de SES clés : « starwars » là
     où le dépôt dit « sw ». L'une ou l'autre fait l'affaire. */
  note(u, 'stories.mjs', new RegExp(`\\b(?:${u.cle}|${u.route}):\\s*\\{\\s*encre:`).test(F.stories));
  // 12. la nav des protos source : la page se rejoint depuis les autres
  for (const [nom, src] of [['accueil', F.accueil], ['nouveautés', F.news], ['à venir', F.avenir]]) {
    note(u, `lien depuis ${nom}`, src.includes(`"${u.protoFr}"`));
  }
}

/* ── l'écran d'arrivée : une encre et une vignette par univers ─────── */
const encres = (F.publier.match(/const BOOT_ENCRES = \[([\s\S]*?)\];/) || [, ''])[1]
  .match(/#[0-9a-f]{6}/gi) || [];
if (encres.length !== univers.length) {
  manques.push(`BOOT_ENCRES : ${encres.length} encres pour ${univers.length} univers`);
}
const planche = path.join(RACINE, 'images/boot-univers.webp');
if (fs.existsSync(planche)) {
  // la hauteur d'une bande vaut 315 px par vignette ; on la lit dans l'en-tête WebP
  const buf = fs.readFileSync(planche);
  /* En-tête WebP : un morceau « VP8X » porte la taille de la toile en
     24 bits — largeur puis hauteur, moins un ; un « VP8 » simple la porte
     après sa signature de trois octets. */
  let hauteur = 0;
  const x = buf.indexOf('VP8X'), v = buf.indexOf('VP8 ');
  if (x >= 0) hauteur = 1 + (buf[x + 15] | (buf[x + 16] << 8) | (buf[x + 17] << 16));
  else if (v >= 0) hauteur = buf.readUInt16LE(v + 16) & 0x3fff;   // +14 est la largeur
  const attendu = univers.length * 315;
  if (hauteur && hauteur !== attendu) {
    manques.push(`boot-univers.webp : ${hauteur} px de haut, ${attendu} attendus (${univers.length} × 315)`);
  }
}

/* ── la seconde clé de progression ────────────────────────────────
   Une page qui sert plus d'un parcours se donne des entrées qui en
   recoupent d'autres — une série coupée saison par saison, six blocs
   remis en un. Ce sont des états de lecture, pas des œuvres, et elles
   vivent donc dans une clé à part, `<clé>-alt`, que l'accueil et
   l'export global ne comptent pas.

   Avant cette séparation, tout tenait dans la même clé et l'accueil
   devait deviner à la forme de l'identifiant : `[a-z]+-r-` n'a pas vu
   les `sw-rl-…` de l'ordre de sortie et comptait 74 œuvres pour 62,
   soit 119 %. Rien dans la console — un compte faux ne lève pas. La
   clé à part ne se devine pas, mais elle se câble, et c'est ce qui se
   vérifie ici : la page qui en a besoin la déclare, l'export global la
   connaît, et les deux filtres restants n'écartent plus que `p-`.

   « En avoir besoin » se lit dans les données, jamais dans une liste :
   un `covers` dans un second parcours, et la page doit ranger à part. */
{
  const AVEC_COVERS = new Set();
  for (const f of fs.readdirSync(path.join(RACINE, '_proto'))) {
    if (!/^data.*\.js$/.test(f) || /-en\.js$/.test(f)) continue;
    let W;
    try { W = new Function('var window={};' + lire('_proto/' + f) + ';return window;')(); }
    catch (_) { continue; }
    for (const g of Object.values(W)) {
      if (!g || typeof g !== 'object' || typeof g.id !== 'string') continue;
      for (const cle of ['erasRewatch', 'erasReplay', 'erasRelease']) {
        if (!Array.isArray(g[cle])) continue;
        for (const era of g[cle]) for (const e of (era.entries || [])) {
          if (e.covers) AVEC_COVERS.add(g.id);
        }
      }
    }
  }
  for (const u of univers) {
    if (!AVEC_COVERS.has(u.cle)) continue;
    /* les deux protos portent le même JS : l'un descend de l'autre */
    const proto = lire('_proto/' + u.protoEn);
    note(u, 'seconde clé dans la page', /var AKEY\s*=\s*KEY\s*\+\s*'-alt'/.test(proto));
    note(u, 'seconde clé dans l’export global',
      new RegExp(`u:'${u.cle}',[^}]*alt:'`).test(F.app));
  }
  /* Les deux filtres ne doivent plus écarter que les ajouts du visiteur :
     un motif qui recommencerait à deviner les parcours rouvrirait la
     porte, dans un sens comme dans l'autre. */
  for (const [nom, src, re] of [
    ['e-accueil.html', F.accueil, /var PARCOURS=(\/[^;]+\/)/],
    ['e-app.js', F.app, /var PARCOURS = (\/[^;]+\/)/],
  ]) {
    const motif = (src.match(re) || [])[1];
    if (motif !== '/^p-/') manques.push(`${nom} : PARCOURS vaut ${motif || 'rien'}, /^p-/ attendu`);
  }
}

/* ── le bilan ─────────────────────────────────────────────────────── */
const court = process.argv.includes('--court');
if (!court) {
  console.log(`\n  CÂBLAGE — ${univers.length} univers, ${univers.length * 24} points vérifiés\n`);
  for (const u of univers) {
    const siens = manques.filter(m => m.startsWith(u.cle.padEnd(16)));
    console.log(`  ${siens.length ? '✕' : '·'} ${u.cle.padEnd(16)} ${u.route.padEnd(16)}`
      + (siens.length ? `${siens.length} manque(s)` : 'complet'));
  }
}
if (manques.length) {
  console.log('\n  ⚠ à câbler :');
  for (const m of manques) console.log('      ' + m);
  console.log(`\n  ${manques.length} point(s) manquant(s).`);
  process.exit(1);
}
console.log('\n  Tous les univers sont câblés partout.\n');
