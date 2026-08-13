// publier.mjs — met la refonte en production.
//
// Les protos de _proto/ sont des maquettes : liens en `e-*.html`, scripts en
// chemin relatif, `noindex` en tête et aucune des cinq lignes de référencement
// que portent les pages en ligne. Les recopier telles quelles effacerait
// silencieusement le référencement de dix-huit pages — rien ne casserait, et
// le site disparaîtrait des résultats.
//
// Ce script fait donc trois choses, et rien d'autre :
//   1. il pose sur chaque proto son référencement — titre, description, Open
//      Graph, hreflang, canonique — repris de `_proto/seo.json` ;
//   2. il réécrit les liens de maquette vers les vraies URL du site, dans le
//      HTML comme dans les données ;
//   3. il rebranche la PWA (manifeste, icônes, service worker) et la mesure
//      d'audience, que les protos n'avaient pas.
//
// Ce qu'il ne fait pas : lire les pages du site. Elles sont sa sortie, et un
// script qui se relit lui-même ne retrouve plus rien.
//
// `--check` n'écrit rien et affiche le bilan.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/* ── Les neuf pages, dans leurs deux langues ────────────────────────────── */

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
  'data-dossier-sw.js':    '/data/dossier-star-wars-fr.js',
  'data-dossier-sw-en.js': '/data/dossier-star-wars-en.js',
  'data-news.js':          '/data/news-fr.js',
  'data-news-en.js':       '/data/news-en.js',
  'e-app.js':              '/app.js',
};

/* ── Table des liens : nom de maquette → URL réelle ─────────────────────── */

const LIENS = {};
for (const r of ROUTES) { LIENS[r.fr.proto] = r.fr.url; LIENS[r.en.proto] = r.en.url; }

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

const PIED = [
  '<script src="/pwa.js"></script>',
  '<script data-goatcounter="https://arcanerval.goatcounter.com/count"',
  '        async src="//gc.zgo.at/count.js"></script>',
].join('\n');

function blocSeo(seo, urlEn, urlFr, moi) {
  const e = s => s.replace(/&(?!(amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, '&amp;');
  return [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${e(seo.desc)}"/>`,
    '<meta property="og:type" content="website"/>',
    '<meta property="og:site_name" content="Chronologeek"/>',
    `<meta property="og:title" content="${e(seo.ogTitle || seo.title)}"/>`,
    `<meta property="og:description" content="${e(seo.desc)}"/>`,
    `<meta property="og:image" content="${seo.image}"/>`,
    `<meta property="og:url" content="${SITE}${moi}"/>`,
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
const LIEN_RE = /(["'])((?:e|en)-[a-z0-9-]+\.html)(#[^"']*)?\1/g;
const ASSET_RE = /(["'])((?:data[a-z0-9-]*|e-app)\.js)\1/g;

function recabler(texte, ou, problemes) {
  let out = texte.replace(LIEN_RE, (tout, q, nom, ancre) =>
    LIENS[nom] ? `${q}${LIENS[nom]}${ancre || ''}${q}` : tout);
  out = out.replace(ASSET_RE, (tout, q, nom) =>
    ASSETS[nom] ? `${q}${ASSETS[nom]}${q}` : tout);

  for (const re of [LIEN_RE, ASSET_RE]) {
    re.lastIndex = 0;
    const restes = [...out.matchAll(re)].map(m => m[2]);
    if (restes.length) problemes.push(`${ou} : non recable — ${[...new Set(restes)].join(', ')}`);
  }
  return out;
}

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

  // 2. PWA et icônes, juste après le charset
  // Le proto est en CRLF : chercher « /> » suivi de « \n » ne trouve rien,
  // le \r s'intercale. Même piège que le noindex ci-dessus.
  const avantPwa = h;
  h = h.replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1\n${PWA}`);
  if (h === avantPwa) problemes.push(`${c.sortie} : bloc PWA non injecté`);
  for (const attendu of ['/manifest.json', 'apple-touch-icon', 'theme-color']) {
    if (!h.includes(attendu)) problemes.push(`${c.sortie} : ${attendu} absent`);
  }

  // 3. titre et référencement à la place du titre de maquette
  const bloc = blocSeo(seo, route.en.url, route.fr.url, c.url);
  const avantTitre = h;
  h = h.replace(/<title>[\s\S]*?<\/title>/, () => bloc);
  if (h === avantTitre) problemes.push(`${c.sortie} : <title> introuvable`);

  // 4. les liens de maquette deviennent les URL du site, les données et le
  //    moteur prennent leur nom de production
  h = recabler(h, c.sortie, problemes);

  // 5. service worker et mesure d'audience
  h = h.replace(/(\r?\n)<\/body>/, `$1${PIED}$1</body>`);
  if (!h.includes('/pwa.js')) problemes.push(`${c.sortie} : pied de page non injecté`);

  if (h === avant) problemes.push(`${c.sortie} : aucune transformation appliquée`);

  bilan.push({ sortie: c.sortie, titre: seo.title, octets: h.length });
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

/* ── Bilan ──────────────────────────────────────────────────────────────── */

console.log(CHECK ? '— contrôle, rien n’est écrit —\n' : '— publication —\n');
for (const b of bilan) console.log(`  ${b.sortie.padEnd(34)} ${String(b.octets).padStart(7)} o   ${b.titre}`);
console.log('');
for (const c of copies) console.log(`  ${c.dest.padEnd(34)} ${String(c.octets).padStart(7)} o`);
console.log(`\n  ${bilan.length} pages, ${copies.length} fichiers de données.`);

if (problemes.length) {
  console.error(`\n  ${problemes.length} PROBLÈME(S) :`);
  for (const p of problemes) console.error(`   · ${p}`);
  process.exit(1);
}
console.log('  Aucun problème.');
