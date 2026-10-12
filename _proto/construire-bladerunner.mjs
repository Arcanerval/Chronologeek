/* Construit `data-bladerunner-en.js`, les donnees de la timeline Blade Runner,
   depuis le document de Niko « Blade Runner.txt ». Les textes affiches en sont
   decoupes mot pour mot : accroche, reperes de lecture, titres, dates, note de
   placement et raisons d'exclusion. Rien n'y est reformule — ce fichier ne
   s'edite pas a la main, on corrige le script et on le rejoue.

   Treizieme univers du site, a l'etat de proto, et neuvieme page dont la
   source est anglaise : le francais reste a ecrire.

   Ce que le document ne donne pas, et qui est donc pose ici :

   - Les trois eres. Le document est une liste plate de seize lignes, sans
     phases. Le decoupage suit ses propres dates et les trois temps du
     monde : les annees Tyrell, jusqu'au film de 2019 ; le Blackout de 2022
     et ce qui le suit ; puis les annees Wallace, qui s'ouvrent avec
     « 2036: Nexus Dawn » et menent a 2049. Ce sont des intitules de
     structure, l'exception que le CLAUDE.md admet quand la prose n'en a pas.
   - Les niveaux, eux, sont dans le document : « E » vaut `must`, « I »
     `important`, et une ligne sans marque est `bonus` — « they are bonus
     content ». La serie Black Lotus n'en porte pas : elle sort donc en
     `bonus`, comme les comics.
   - Les cinq badges.

   Les fiches : les deux films, les trois courts et la serie passent par TMDB.
   Les comics n'en ont pas : leur synopsis (`desc`) est ecrit ici, court et
   sans divulgacher, d'apres les pages du wiki Blade Runner — rien n'en est
   recopie.

   Une coquille est corrigee, comme Niko le demande d'office : « it's sequel »
   devient « its sequel ». Le reste de sa prose est intact, tournures
   comprises.

   Pas de table RT : dix des seize entrees sont des comics, qui n'ont pas de
   duree. Meme raison qu'Avatar Legends. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.dirname(ICI);

/* ── Le lexique commun, repris de Jurassic World ─────────────────────────
   Meme profil de guide : des films, des courts et une serie animee, et de
   l'ecrit autour. On en reprend le vocabulaire (« Watched », « Left to
   watch »), et on ne change que ce qui nomme l'univers. */
const src = fs.readFileSync(path.join(ICI, 'data-jurassic-en.js'), 'utf8');
const bac = { window: {}, console };
bac.window.window = bac.window;
new Function('window', src)(bac.window);
const T = JSON.parse(JSON.stringify(bac.window.CG.t));

T.nav.bladerunner = 'Blade Runner';
T.markWatched = 'Mark “{t}” as done';
T.legal3 = 'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, ' +
  'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil and Blade Runner are trademarks ' +
  'of their respective owners; Chronologeek is an independent fan project.';

/* ── L'accroche, decoupee du document ──────────────────────────────────── */
const ic = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/>' +
       '<path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  canon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 ' +
         '4.6-.7 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
};

const ECARTES = [
  ['Novels and novelizations', 'Novels and novelizations: not canon'],
  ['Games', 'Games: not canon, not available anymore, VR only or no global story']
];

const ech = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const NOTES =
  '<p class="intro-lead">If you’re here it’s either because you watched the movies and want to ' +
  'discover the other media or want to watch and read everything at once. If you don’t want to ' +
  'read the comics, just uncheck them, they are bonus content. This guide is spoiler free like ' +
  'the others.</p>' +
  '<div class="intro-tags"><span class="itag">' + ic.check +
  'This guide works for first-time watch as well as rewatches.</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
  '<div class="key"><div class="key-h">' + ic.cal + 'The Calendar</div>' +
  '<p>The saga happens in &quot;our&quot; world so we’ll count in years like we do.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.canon + 'Canonicity</div>' +
  '<p>The first movie is an adaptation of the 1968 novel &quot;Do Androids Dream of Electric ' +
  'Sheep?&quot; by Philip K. Dick, and this book has sequels, prequels and various adaptations. ' +
  'Here we only follow the canon around this movie and its sequel.</p></div></div>' +
  '<details class="cuts"><summary>What’s left out and why?<span class="n">' +
  ECARTES.length + ' entries</span>' +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
  '</summary><div class="cuts-body"><dl class="cuts-list">' +
  ECARTES.map(([t, d]) => '<div class="cut"><dt>' + ech(t) + '</dt><dd>' + ech(d) + '</dd></div>').join('') +
  '</dl></div></details>';

/* ── Les vignettes ───────────────────────────────────────────────────────
   Niko depose les siennes dans `images/`, sous ses noms a lui : une vignette
   locale l'emporte toujours. A defaut, une oeuvre a l'ecran emprunte son
   visuel a TMDB le temps du proto, et un comic n'en a pas. */
const TMDB_IMG = 'https://image.tmdb.org/t/p/w780';
const vignette = (local, tmdb) => {
  if (local && fs.existsSync(path.join(RACINE, 'images', local))) return '/images/' + local;
  return tmdb ? TMDB_IMG + tmdb : undefined;
};

/* ── Les seize entrees ───────────────────────────────────────────────────
   type      : film, short, anime, comic
   tmdb      : identifiant TMDB, pour ce qui se regarde
   date      : celle du document, jamais traduite
   bignote   : la ligne que Niko pose sous le film, rendue comme
               « Ultimate Edition » chez DC
   desc      : le synopsis d'un comic — TMDB ne les connait pas
   lang      : 'vo' quand l'oeuvre n'a pas de version francaise — pas
               d'edition francaise pour un comic, jamais doublee pour ce qui
               se regarde, la regle des webseries de The Walking Dead et de
               Battle at Big Rock. Releve le 12 octobre 2026 :
               · comics : seuls Blade Runner 2019 et 2029 ont une edition
                 francaise, chez Delcourt (catalogue de la BnF) ;
               · les trois courts : sortis en France en bonus du DVD et du
                 Blu-ray de 2049 (« Prologues »), sous-titres, jamais doubles ;
               · Black Lotus : sous-titree en francais chez Crunchyroll, qui
                 ne la double qu'en espagnol d'Amerique latine.
               Les deux films, eux, sont doubles. */
const E = [
  { ere: 0, id: 'br-fcbd2021-origins', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A short story from the Free Comic Book Day 2021 special, set alongside Blade Runner: Origins: LAPD Detective Cal Moreaux and the case of a Tyrell Corporation bioengineer found dead.',
    title: 'FCBD 2021: Blade Runner: Origins', date: '2009',
    img: vignette('fcbd2021bladerunner.webp') },
  { ere: 0, id: 'br-origins', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Los Angeles, 2009. LAPD Detective Cal Moreaux is sent to look into the apparent suicide of a Tyrell Corporation bioengineer. The case quickly stops looking like a suicide, and puts him on the trail of an experimental replicant that went missing the same night. This is the story of the first Blade Runner.',
    title: 'Blade Runner: Origins', date: '2009', img: vignette('bladerunnerorigins.webp') },
  { ere: 0, id: 'br-fcbd2020-2019', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A short Free Comic Book Day story about the childhood of Aahna “Ash” Ashina: a sick girl raised by her grandmother in Los Angeles after her mother left for the Off-world colonies, years before she becomes a Blade Runner.',
    title: 'FCBD 2020: Blade Runner 2019', date: '2000-2013',
    img: vignette('fcbd2020bladerunner.webp') },
  { ere: 0, id: 'br-tokyonexus', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Tokyo, 2015. Stix and Mead, two veterans of the Kalanthia war, set up as private detectives while they hunt the comrade who abandoned them on the battlefield. A missing-person case drops them in the middle of a patent war between the Yakuza, the Tyrell Corporation and a rival corporation.',
    title: 'Blade Runner: Tokyo Nexus', date: '2015', img: vignette('tokyonexus.webp') },
  { ere: 0, id: 'br-2019', type: 'comic', level: 'bonus',
    desc: 'Los Angeles, 2019. Detective Aahna “Ash” Ashina, one of the first Blade Runners, is hired to find the missing wife and daughter of a powerful businessman. The deeper she digs, the more the case forces her to choose between her client, her career and the people she was sent to find.',
    title: 'Blade Runner 2019', date: '2019', img: vignette('bladerunner2019.webp') },
  { ere: 0, id: 'br-bladerunner', type: 'film', level: 'must', tmdb: '78', media: 'movie',
    title: 'Blade Runner', date: '2019',
    img: vignette('bladerunnermovie.webp', '/2spEHYDcyE9r9mS7AFEscfKVDzO.jpg'),
    bignote: '⚠️ Final Cut version!!!' },

  { ere: 1, id: 'br-blackout2022', type: 'short', level: 'important', lang: 'vo', tmdb: '475946', media: 'movie',
    title: 'Blade Runner: Black Out 2022', date: '2022',
    img: vignette('blackout2022.webp', '/7gZR9nztTzZIskcRCuDfhvrd5Ds.jpg') },
  { ere: 1, id: 'br-fcbd2021-2029', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A short story from the Free Comic Book Day 2021 special, set alongside Blade Runner 2029: Ash is back on the streets of Los Angeles, seven years after the Blackout.',
    title: 'FCBD 2021: Blade Runner 2029', date: '2029',
    img: vignette('fcbd2021bladerunner.webp') },
  { ere: 1, id: 'br-2029', type: 'comic', level: 'bonus',
    desc: 'Los Angeles, 2029. Replicants are banned and the Tyrell Corporation is bankrupt. Back on the job as a Blade Runner, Ash investigates replicants said to be working on the Sepulveda Sea Wall, and crosses the path of one she failed to retire years earlier — who is now raising an army.',
    title: 'Blade Runner 2029', date: '2029', img: vignette('bladerunner2029.webp') },
  { ere: 1, id: 'br-blacklotus', type: 'anime', level: 'bonus', lang: 'vo', tmdb: '84553', media: 'tv',
    title: 'Blade Runner: Black Lotus', date: '2032',
    img: vignette('blacklotus.webp', '/vRyC5WT7ytRflfEFFyRmGeZc0Cf.jpg') },
  { ere: 1, id: 'br-bl-leavingla', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Picks up right after the finale of the animated show: Elle leaves Los Angeles behind and tries to build herself a new life.',
    title: 'Blade Runner: Black Lotus - Leaving L.A.', date: '2032',
    img: vignette('leavingla.webp') },
  { ere: 1, id: 'br-bl-lasvegas', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Elle finds a community of replicants living in Las Vegas, while a squad of mercenaries working for Niander Wallace closes in on her.',
    title: 'Blade Runner: Black Lotus - Las Vegas', date: '2032',
    img: vignette('lasvegas.webp') },

  { ere: 2, id: 'br-nexusdawn', type: 'short', level: 'important', lang: 'vo', tmdb: '473072', media: 'movie',
    title: 'Blade Runner: 2036 Nexus Dawn', date: '2036',
    img: vignette('2036nexusdawn.webp', '/pMYSFleKKpLGhIbTiqd3o5r96jo.jpg') },
  { ere: 2, id: 'br-2039', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Los Angeles, 2039. Niander Wallace’s new replicants obey without question, and one of them, Luv, is now a Blade Runner hunting older models. Someone from Ash’s first case comes back to the city to ask for her help. The conclusion of Ash’s story, begun in Blade Runner 2019.',
    title: 'Blade Runner 2039', date: '2039', img: vignette('bladerunner2039.webp') },
  { ere: 2, id: 'br-nowheretorun', type: 'short', level: 'important', lang: 'vo', tmdb: '475759', media: 'movie',
    title: 'Blade Runner: 2048 Nowhere to Run', date: '2048',
    img: vignette('2048nowheretorun.webp', '/gps88CAZeTTuorh66xwMXg0lBG4.jpg') },
  { ere: 2, id: 'br-2049', type: 'film', level: 'must', tmdb: '335984', media: 'movie',
    title: 'Blade Runner 2049', date: '2049',
    img: vignette('bladerunner2049.webp', '/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg') }
];
for (const e of E) if (!e.img) delete e.img;

/* Les images de station : celles de Niko quand elles y sont, sinon le visuel
   TMDB de l'oeuvre qui porte l'ere, le temps du proto. */
const TMDB_ART = 'https://image.tmdb.org/t/p/w1280';
const art = (local, tmdb) =>
  fs.existsSync(path.join(RACINE, 'images', local)) ? '/images/' + local : TMDB_ART + tmdb;

const ERES = [
  { title: 'The Tyrell Era', phase: 'ERA 1', ink: 1,
    art: art('tyrellera.webp', '/2spEHYDcyE9r9mS7AFEscfKVDzO.jpg') },
  { title: 'The Blackout', phase: 'ERA 2', ink: 2,
    art: art('blackoutera.webp', '/7gZR9nztTzZIskcRCuDfhvrd5Ds.jpg') },
  { title: 'The Wallace Era', phase: 'ERA 3', ink: 3,
    art: art('wallaceera.webp', '/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg') }
];

const ECRAN = E.filter(e => e.type !== 'comic').map(e => e.id);

const BADGES = [
  { id: 'br_tyrell', universe: 'br', icon: '🦉', color: '#3fb8c9', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 0).map(e => e.id),
    label: 'More Human Than Human', desc: 'The Tyrell era completed' },
  { id: 'br_blackout', universe: 'br', icon: '🌃', color: '#9b6bdf', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 1).map(e => e.id),
    label: 'Lights Out', desc: 'The Blackout completed' },
  { id: 'br_wallace', universe: 'br', icon: '🏜️', color: '#f08a2c', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 2).map(e => e.id),
    label: 'Cells Interlinked', desc: 'The Wallace era completed' },
  { id: 'br_screen', universe: 'br', icon: '🎬', color: '#64b5f6', trigger: 'oeuvre',
    ids: ECRAN,
    label: 'Blade Runner', desc: 'Everything on screen watched' },
  { id: 'br_100', universe: 'br', icon: '🦄', color: '#ff5f1f', trigger: '100pct', ids: [],
    label: 'Tears in Rain', desc: 'Blade Runner 100% completed' }
];

/* ── Sortie ──────────────────────────────────────────────────────────── */
const CG = {
  t: T,
  universe: 'br',
  badgeLabels: {
    film: ['bf', 'MOVIE'], short: ['bh', 'SHORT'],
    anime: ['ba', 'ANIMATED SHOW'], comic: ['bc', 'COMIC']
  },
  markLabels: {},
  badges: BADGES,
  resetMsg: 'Reset your Blade Runner progress?',
  tmdbLang: 'en-US',
  tmdbKey: bac.window.CG.tmdbKey,
  img: 'https://image.tmdb.org/t/p/'
};

const DATA = {
  id: 'br',
  title: 'Blade Runner',
  subtitle: 'Complete canon timeline',
  description: 'Movies · Shorts · Show · Comics',
  /* l'orange du logo Tyrell et des titres de 2049, demande par Niko. Il est
     pousse vers le vermillon et sature a fond : Dragon Age tient deja un
     orange brule (#e07b39), et deux oranges voisins ne se distingueraient
     plus sur l'accueil. */
  color: '#ff5f1f',
  glow: 'rgba(255,95,31,.35)',
  notes: NOTES,
  eras: ERES.map((er, i) => ({
    title: er.title, phase: er.phase, ink: er.ink, art: er.art,
    entries: E.filter(e => e.ere === i).map(({ ere, ...reste }) => reste)
  }))
};

for (const er of DATA.eras) {
  if (!er.entries.length) throw new Error('Ere vide : ' + er.title);
}
const vus = new Set();
for (const e of E) {
  if (vus.has(e.id)) throw new Error('Identifiant en double : ' + e.id);
  vus.add(e.id);
  if (!CG.badgeLabels[e.type]) throw new Error('Type inconnu : ' + e.type + ' (' + e.id + ')');
}
for (const b of BADGES) {
  for (const id of b.ids) {
    if (!vus.has(id)) throw new Error('Badge ' + b.id + ' : entree inconnue ' + id);
  }
}

const ENTETE = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .split('*/')[0].replace(/^\/\* Construit `data-bladerunner-en\.js`, les/, '/* Donnees de la');

const sortie = ENTETE + '*/\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.BLADERUNNER=' + JSON.stringify(DATA) + ';\n';

fs.writeFileSync(path.join(ICI, 'data-bladerunner-en.js'), sortie, 'utf8');
console.log('data-bladerunner-en.js ecrit : %d entrees, %d eres, %d badges, %d Ko',
  E.length, DATA.eras.length, BADGES.length, Math.round(sortie.length / 1024));
console.log('  niveaux : %s',
  ['must', 'important', 'bonus'].map(l => l + ' ' + E.filter(e => e.level === l).length).join(' · '));
console.log('  types   : %s',
  Object.keys(CG.badgeLabels).map(t => t + ' ' + E.filter(e => e.type === t).length).join(' · '));
console.log('  sans vignette : %s', E.filter(e => !e.img).map(e => e.id).join(', ') || 'aucune');
