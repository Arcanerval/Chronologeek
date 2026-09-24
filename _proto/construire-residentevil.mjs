/* Construit `data-re-en.js`, les donnees de la timeline Resident Evil, depuis
   le document de Niko « RE.txt ». Les textes affiches en sont decoupes mot
   pour mot : accroche, reperes de lecture, titres, dates, notes de placement
   et raisons d'exclusion. Rien n'y est reformule — ce fichier ne s'edite pas
   a la main, on corrige le script et on le rejoue.

   Douzieme univers du site, et septieme page dont la source est anglaise,
   apres Star Trek, The Walking Dead, Dragon Age, Assassin's Creed, DC
   Animation, Jurassic World et The Witcher : le francais reste a ecrire.

   Ce que le document ne donne pas, et qui est donc pose ici :

   - Les cinq eres. Le document est une liste plate de trente lignes, sans
     phases. Le decoupage suit ses propres dates — Raccoon City en 1998, puis
     l'apres-Umbrella, la bioterreur mondiale, le retour a l'horreur, et
     Requiem. Ce sont des intitules de structure, l'exception que le
     CLAUDE.md admet quand la prose n'en a pas.
   - Les niveaux. Le document les dit en une phrase, et c'est elle qui tranche :
     « If you just want to discover the games in chronological order uncheck
     the rest, all other medias are bonus content (some important) ». Les jeux
     sont donc `must`, le reste `bonus`, et `important` va aux quatre films
     d'animation canon, a la serie Infinite Darkness et aux deux demos, qui
     sont des jeux mais pas des jeux complets.
   - Les cinq badges.

   Les fiches : les jeux passent par RAWG (`media:"game"`), les films et la
   serie par TMDB. Le comic « Infinite Darkness - The Beginning » n'a de
   fiche nulle part et reprend le visuel de la serie qu'il precede, comme
   Flight 462 reprend celui de Fear the Walking Dead.

   Pas de table RT : un guide de jeux video n'a pas de duree a sommer, meme
   raison qu'Avatar Legends, Dragon Age et Assassin's Creed. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));

/* ── Le lexique commun, repris d'Assassin's Creed ────────────────────────
   Meme profil de guide : des jeux d'abord, et d'autres medias autour. On en
   reprend donc le vocabulaire (« Played », « Left to play »), et on ne
   change que ce qui nomme l'univers. */
const src = fs.readFileSync(path.join(ICI, 'data-assassinscreed-en.js'), 'utf8');
const bac = { window: {}, console };
bac.window.window = bac.window;
new Function('window', src)(bac.window);
const T = JSON.parse(JSON.stringify(bac.window.CG.t));

T.nav.residentevil = 'Resident Evil';
T.legal3 = 'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, ' +
  'Assassin’s Creed, Jurassic World, The Witcher and Resident Evil are trademarks of their ' +
  'respective owners; Chronologeek is an independent fan project.';

/* ── L'accroche, decoupee du document ──────────────────────────────────── */
const ic = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/>' +
       '<path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/>' +
        '<path d="M3 4v5h5M12 8v5l3 2"/></svg>',
  canon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 ' +
         '4.6-.7 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
};

const ECARTES = [
  ['Original games', 'Original game if a remake exists'],
  ['Ports', 'Ports of some games on other consoles (like Nintendo DS)'],
  ['Novelizations', 'Novelizations of games/movies, DVD bonus, documents...'],
  ['Japanese-only media', 'All japanese-only media: not canon for the most of them'],
  ['Survivor games', 'Survivor games: arcade spin-offs hard to find these days and don’t add much to the lore'],
  ['Biohazard 4D-Executer', 'Biohazard 4D-Executer: not canon'],
  ['Live action movies and shows', 'Live action movies and shows: their own canon'],
  ['Multiplayer and mobile games', 'Multiplayer only games and mobile games']
];

const ech = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const NOTES =
  '<p class="intro-lead">If you’re here it’s either because you did some games and want to ' +
  'discover the other media or want to do all the games again and add the rest. If you just ' +
  'want to discover the games in chronological order uncheck the rest, all other medias are ' +
  'bonus content (some important). This guide is spoiler free like the others.</p>' +
  '<div class="intro-tags"><span class="itag">' + ic.check +
  'This guide works for first-time plays as well as replays.</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
  '<div class="key"><div class="key-h">' + ic.cal + 'The Calendar</div>' +
  '<p>The saga happens in &quot;our&quot; world so we’ll count in years like we do.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.back + 'Flashback</div>' +
  '<p>Some events work better as a FLASHBACK for understanding, and are marked as such.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.canon + 'Canonicity</div>' +
  '<p>The main games are all being remaked and are fixing the timeline issues so until ' +
  'everything is remaked some little things can be a bit odd. In RE and RE: 2 you have to ' +
  'choose between characters but the canon story is a mix of both paths</p></div></div>' +
  '<details class="cuts"><summary>What’s left out and why?<span class="n">' +
  ECARTES.length + ' entries</span>' +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
  '</summary><div class="cuts-body"><dl class="cuts-list">' +
  ECARTES.map(([t, d]) => '<div class="cut"><dt>' + ech(t) + '</dt><dd>' + ech(d) + '</dd></div>').join('') +
  '</dl></div></details>';

/* ── Les trente entrees ──────────────────────────────────────────────────
   type      : jeu, dlc, short, filmanim, anime, comic, roman, video
   tmdb      : identifiant RAWG pour les jeux (media "game"), TMDB sinon
   date      : celle du document, jamais traduite
   notes     : les lignes que Niko pose sous un titre, mot pour mot */
const E = [
  { ere: 0, id: 're-re0', type: 'jeu', level: 'must', tmdb: '17179', media: 'game',
    title: 'Resident Evil 0', date: '1998', img: '/images/re0.webp' },
  { ere: 0, id: 're-re1', type: 'jeu', level: 'must', tmdb: '42920', media: 'game',
    title: 'Resident Evil HD Remaster', date: '1998', img: '/images/re1.webp' },
  { ere: 0, id: 're-evilname', type: 'short', level: 'bonus', tmdb: '1627865', media: 'movie',
    title: 'Evil Has Always Had A Name', date: '1998', img: '/images/reevilname.webp' },
  { ere: 0, id: 're-outbreak', type: 'jeu', level: 'must', tmdb: '59207', media: 'game',
    title: 'Resident Evil Outbreak', date: '1998', img: '/images/reoutbreak.webp',
    notes: ['Same week as RE 2 and 3'] },
  { ere: 0, id: 're-outbreak2', type: 'dlc', level: 'must', tmdb: '59208', media: 'game',
    title: 'Resident Evil Outbreak File #2', date: '1998', img: '/images/reoutbreak2.webp',
    notes: ['Same week as RE 2 and 3'] },
  { ere: 0, id: 're-re2', type: 'jeu', level: 'must', tmdb: '58813', media: 'game',
    title: 'Resident Evil 2 Remake', date: '1998', img: '/images/re2.webp',
    notes: ['Same week as RE Outbreak and 3'] },
  { ere: 0, id: 're-re3', type: 'jeu', level: 'must', tmdb: '397477', media: 'game',
    title: 'Resident Evil 3 Remake', date: '1998', img: '/images/re3.webp',
    notes: ['Same week as RE Outbreak and 2'] },
  { ere: 0, id: 're-cvx', type: 'jeu', level: 'must', tmdb: '290879', media: 'game',
    title: 'Resident Evil: Code Veronica X', date: '1998', img: '/images/recodeveronica.webp' },
  { ere: 0, id: 're-darkside', type: 'jeu', level: 'must', tmdb: '26188', media: 'game',
    title: 'Resident Evil: The Darkside Chronicles', date: '1998-2002',
    img: '/images/redarkside.webp', tags: ['flashback'] },
  { ere: 0, id: 're-umbrella', type: 'jeu', level: 'must', tmdb: '25310', media: 'game',
    title: 'Resident Evil: The Umbrella Chronicles', date: '1998-2003',
    img: '/images/reumbrella.webp', tags: ['flashback'] },

  { ere: 1, id: 're-re4', type: 'jeu', level: 'must', tmdb: '795632', media: 'game',
    title: 'Resident Evil 4 Remake', date: '2004', img: '/images/re4.webp' },
  { ere: 1, id: 're-revelations', type: 'jeu', level: 'must', tmdb: '4012', media: 'game',
    title: 'Resident Evil: Revelations', date: '2005', img: '/images/rerevelations.webp' },
  { ere: 1, id: 're-degeneration', type: 'filmanim', level: 'important', tmdb: '13648', media: 'movie',
    title: 'Resident Evil: Degeneration', date: '2005', img: '/images/redegeneration.webp' },
  { ere: 1, id: 're-id-comic', type: 'comic', level: 'bonus',
    title: 'Resident Evil: Infinite Darkness - The Beginning', date: '2006',
    img: '/images/reinfinitedarkness.webp' },
  { ere: 1, id: 're-id', type: 'anime', level: 'important', tmdb: '110642', media: 'tv',
    title: 'Resident Evil: Infinite Darkness', date: '2006',
    img: '/images/reinfinitedarkness.webp', subitems: ['Season 1'] },

  { ere: 2, id: 're-re5', type: 'jeu', level: 'must', tmdb: '13461', media: 'game',
    title: 'Resident Evil 5', date: '2009', img: '/images/re5.webp' },
  { ere: 2, id: 're-damnation', type: 'filmanim', level: 'important', tmdb: '133121', media: 'movie',
    title: 'Resident Evil: Damnation', date: '2011', img: '/images/redamnation.webp' },
  { ere: 2, id: 're-lasplagas', type: 'video', level: 'bonus',
    title: 'Las Plagas: Organisms of War', date: '2012', img: '/images/relasplagas.webp',
    links: [{ href: 'https://www.youtube.com/watch?v=NS-wB3vS3LU', label: 'Watch the video' }] },
  { ere: 2, id: 're-revelations2', type: 'jeu', level: 'must', tmdb: '17174', media: 'game',
    title: 'Resident Evil: Revelations 2', date: '2011-2012', img: '/images/rerevelations2.webp' },
  { ere: 2, id: 're-marhawa', type: 'roman', level: 'bonus',
    title: 'Resident Evil: The Marhawa Desire', date: '2012', img: '/images/remarhawa.webp' },
  { ere: 2, id: 're-re6', type: 'jeu', level: 'must', tmdb: '2623', media: 'game',
    title: 'Resident Evil 6', date: '2012-2013', img: '/images/re6.webp' },
  { ere: 2, id: 're-heavenly', type: 'roman', level: 'bonus',
    title: 'Resident Evil: Heavenly Island', date: '2014', img: '/images/reheavenly.webp' },
  { ere: 2, id: 're-vendetta', type: 'filmanim', level: 'important', tmdb: '400136', media: 'movie',
    title: 'Resident Evil: Vendetta', date: '2014', img: '/images/revendetta.webp' },
  { ere: 2, id: 're-deathisland', type: 'filmanim', level: 'important', tmdb: '1083862', media: 'movie',
    title: 'Resident Evil: Death Island', date: '2015', img: '/images/redeathisland.webp' },

  { ere: 3, id: 're-beginninghour', type: 'jeu', level: 'important', tmdb: '12606', media: 'game',
    title: 'Resident Evil 7 Teaser: Beginning Hour', date: '2017',
    img: '/images/rebeginninghour.webp', notes: ['Prequel demo for RE 7: Biohazard'] },
  { ere: 3, id: 're-re7', type: 'jeu', level: 'must', tmdb: '480', media: 'game',
    title: 'Resident Evil 7: Biohazard', date: '2017', img: '/images/re7.webp' },
  { ere: 3, id: 're-maiden', type: 'jeu', level: 'important', tmdb: '546461', media: 'game',
    title: 'Maiden', date: '2021', img: '/images/remaiden.webp',
    notes: ['Prequel demo for RE: Village'] },
  { ere: 3, id: 're-village', type: 'jeu', level: 'must', tmdb: '452649', media: 'game',
    title: 'Resident Evil Village', date: '2021', img: '/images/revillage.webp' },

  { ere: 4, id: 're-requiem', type: 'jeu', level: 'must', tmdb: '1004511', media: 'game',
    title: 'Resident Evil: Requiem', date: '2026', img: '/images/rerequiem.webp' },
  { ere: 4, id: 're-shadowsofrose', type: 'dlc', level: 'must', tmdb: '802434', media: 'game',
    title: 'Resident Evil Village: Shadows of Rose', date: '2037',
    img: '/images/reshadowsofrose.webp' }
];

const ERES = [
  { title: 'Raccoon City', phase: 'PHASE 1', ink: 1, art: '/images/re2.webp' },
  { title: 'After Umbrella', phase: 'PHASE 2', ink: 2, art: '/images/re4.webp' },
  { title: 'Global Bioterrorism', phase: 'PHASE 3', ink: 3, art: '/images/re6.webp' },
  { title: 'Back to Horror', phase: 'PHASE 4', ink: 4, art: '/images/re7.webp' },
  { title: 'Requiem', phase: 'PHASE 5', ink: 5, art: '/images/rerequiem.webp' }
];

const BADGES = [
  { id: 're_raccoon', universe: 're', icon: '🧪', color: '#c0392b', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 0).map(e => e.id),
    label: 'Raccoon City Survivor', desc: 'The 1998 outbreak completed' },
  { id: 're_umbrella', universe: 're', icon: '☂️', color: '#e74c3c', trigger: 'oeuvre',
    ids: ['re-cvx', 're-darkside', 're-umbrella', 're-re4'],
    label: 'Umbrella’s Fall', desc: 'The end of Umbrella completed' },
  { id: 're_bsaa', universe: 're', icon: '🛡️', color: '#4a90d9', trigger: 'oeuvre',
    ids: ['re-revelations', 're-re5', 're-revelations2', 're-re6'],
    label: 'B.S.A.A. Agent', desc: 'The bioterrorism years completed' },
  { id: 're_winters', universe: 're', icon: '🏚️', color: '#8e6f9e', trigger: 'oeuvre',
    ids: ['re-beginninghour', 're-re7', 're-maiden', 're-village', 're-shadowsofrose'],
    label: 'The Winters Family', desc: 'Ethan and Rose’s story completed' },
  { id: 're_100', universe: 're', icon: '☣️', color: '#7fe03c', trigger: '100pct', ids: [],
    label: 'Biohazard Master', desc: 'Resident Evil 100% completed' }
];

/* ── Sortie ──────────────────────────────────────────────────────────── */
const CG = {
  t: T,
  universe: 're',
  badgeLabels: {
    jeu: ['bj', 'VIDEO GAME'], dlc: ['bd', 'DLC'], short: ['bh', 'SHORT'],
    filmanim: ['bfa', 'ANIMATED MOVIE'], anime: ['ba', 'ANIMATED SHOW'],
    comic: ['bc', 'COMIC'], roman: ['br', 'BOOK'], video: ['bv', 'VIDEO']
  },
  markLabels: { flashback: 'FLASHBACK' },
  badges: BADGES,
  resetMsg: 'Reset your Resident Evil progress?',
  tmdbLang: 'en-US',
  tmdbKey: bac.window.CG.tmdbKey,
  rawgKey: bac.window.CG.rawgKey,
  img: 'https://image.tmdb.org/t/p/'
};

const DATA = {
  id: 're',
  title: 'Resident Evil',
  subtitle: 'Complete canon timeline',
  description: 'Games · Movies · Show · Books · Comics',
  color: '#7fe03c',
  glow: 'rgba(127,224,60,.35)',
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
  .split('*/')[0].replace(/^\/\* Construit `data-re-en\.js`, les/, '/* Donnees de la');

const sortie = ENTETE + '*/\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.RE=' + JSON.stringify(DATA) + ';\n';

fs.writeFileSync(path.join(ICI, 'data-re-en.js'), sortie, 'utf8');
console.log('data-re-en.js ecrit : %d entrees, %d eres, %d badges, %d Ko',
  E.length, DATA.eras.length, BADGES.length, Math.round(sortie.length / 1024));
console.log('  niveaux : %s',
  ['must', 'important', 'bonus'].map(l => l + ' ' + E.filter(e => e.level === l).length).join(' · '));
console.log('  types   : %s',
  Object.keys(CG.badgeLabels).map(t => t + ' ' + E.filter(e => e.type === t).length).join(' · '));
