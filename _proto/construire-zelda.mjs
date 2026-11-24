/* Construit `data-zelda-en.js`, les donnees de la timeline The Legend of
   Zelda, depuis le document de Niko « Zelda.txt ». Les textes affiches en
   sont decoupes mot pour mot : accroche, reperes de lecture, titres, dates,
   intitules des trois branches et raisons d'exclusion. Rien n'y est
   reformule — ce fichier ne s'edite pas a la main, on corrige le script et
   on le rejoue.

   Seizieme univers du site, et douzieme page dont la source est anglaise :
   le francais en descendra par `traduire-zelda.mjs`.

   Un reseau, comme DC : une ligne commune (Sky, Force, Hero of Time) qui se
   separe en trois a la fin d'Ocarina of Time — Fallen Hero, Child, Adult —
   puis se rejoint a l'ere des Wilds. Les trois branches sont trois colonnes
   d'une meme zone ; leurs eres (Light and Dark, Decline, Great Sea…) sont des
   sous-stations, comme New 52 et Tomorrowverse chez DC Animation.

   Ce que le document ne donne pas, et qui est donc pose ici :

   - Le nom de la zone ou la ligne se separe, « Three Timelines ».
   - Les codes de ligne : ZL pour la ligne commune, FH, CT et AT pour les
     trois branches.
   - L'ordre de sortie et ses quatre eres de production.
   - Les badges.

   Corrections de graphie, la regle du site (les fautes se corrigent
   d'office, en le disant) : « i recommand » → « I recommend », « Fallen
   Ero » → « Fallen Hero », « Whats » → « What's », « japanase » →
   « Japanese », « i don't » → « I don't », « reincarns » → « reincarnates »,
   et pas d'espace devant « ? » en anglais.

   Les niveaux sont ceux du document : E = `must`, I = `important`, sans
   marque = `bonus`.

   Les fiches passent par RAWG, par leur identifiant (`RAWG` ci-dessous,
   releve le 22 novembre 2026). « Ocarina of Time (Remake) » est le remake
   Switch 2 du 5 novembre 2026, la version la plus recente : le document dit
   suivre les plus recentes.

   Les vignettes : celles de Niko quand elles sont deposees dans `images/`,
   sinon le visuel RAWG en attendant. Pas de table RT : des jeux. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.dirname(ICI);

/* ── Le lexique commun, repris de Borderlands ──────────────────────────── */
const src = fs.readFileSync(path.join(ICI, 'data-borderlands-en.js'), 'utf8');
const bac = { window: {}, console };
bac.window.window = bac.window;
new Function('window', src)(bac.window);
const T = JSON.parse(JSON.stringify(bac.window.CG.t));

T.nav.zelda = 'The Legend of Zelda';
T.markWatched = 'Mark “{t}” as done';
T.legal3 = 'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, ' +
  'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, ' +
  'Borderlands and The Legend of Zelda are trademarks of their respective owners; Chronologeek is an independent fan project.';

/* ── L'accroche, decoupee du document ──────────────────────────────────── */
const ic = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/>' +
       '<path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/>' +
        '<path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  flash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/>' +
         '<path d="M3 4v5h5M12 8v5l3 2"/></svg>',
  ver: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="3"/>' +
       '<path d="M7 10v4M5 12h4M15 11h.01M18 13h.01"/></svg>'
};

const ECARTES = [
  ['Zelda CDI, mini-games spin-offs and Japanese only games', 'Not canon.'],
  ['Comics, mangas, animated show', 'Not canon.'],
  ['Cadence of Hyrule', 'Not canon.'],
  ['Link\'s Crossbow Training', 'No story.'],
  ['Hyrule Warriors 1 & 2', 'Not canon or happen in other alternative timelines that I don\'t put here, you can play the first before Breath of the Wild and the second after.']
];

const ech = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const NOTES =
  '<p class="intro-lead">If you’re here it’s either because you did some of the games and want to ' +
  'discover the full universe or because you want to do everything starting from the beginning. ' +
  'This guide contains minor spoilers that are indicated. Nintendo is really not a fan of ' +
  'consistent and established timelines and released 2 books about it over the years, with many ' +
  'continuity errors and even switched place some games between the two books. With multiple ' +
  'timelines and time travel, many fans will argue that this is absurd or senseless but since even ' +
  'Nintendo release a timeline, why not?</p>' +
  '<div class="intro-tags"><span class="itag pc-first">' + ic.check +
  'This guide works for first plays or replays.</span>' +
  '<span class="itag pc-release">' + ic.check +
  'This guide follows the order the works came out, from 1987 to today, but you can switch back to a chronological version higher up.</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
  '<div class="key"><div class="key-h">' + ic.cal + 'Timeline and order</div>' +
  '<p>Nintendo has released an official timeline on which this one is based on, but as usual they ' +
  'don’t give any date or calendar indications, except the time passing between some of the games, ' +
  'so we will base the timeline on this and the most relevant fans placements. After Ocarina of ' +
  'Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing ' +
  'the Child Timeline first because it’s the direct sequel of OoT. The Fallen Hero Timeline is the ' +
  'hardest and contains the 2D and old games.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.flash + 'Flashbacks</div>' +
  '<p>Some events work better as a FLASHBACK for understanding, and are marked as such.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.ver + 'Which version</div>' +
  '<p>Many of the games have remakes or remasters, choose between the original or the new versions, ' +
  'the global story is the same but my timeline is based on the most recent versions for new ' +
  'players.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.user + 'Characters</div>' +
  '<p>Minor spoilers of the 3 main characters incoming: each game happens in a different time, only ' +
  'some of them are direct sequels to others (like Ocarina of Time and Majora’s Mask). Link ' +
  'reincarnates himself when the world is in danger, Zelda is a descendant of the royal family also ' +
  'called Zelda and Ganondorf is revived/freed and sometimes reincarnated. Some other characters ' +
  'come back in different games, many of them are descendants of the older ones.</p></div></div>' +
  '<details class="cuts"><summary>What’s left out and why?<span class="n">' +
  ECARTES.length + ' entries</span>' +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
  '</summary><div class="cuts-body"><dl class="cuts-list">' +
  ECARTES.map(([t, d]) => '<div class="cut"><dt>' + ech(t) + '</dt>' +
    (d ? '<dd>' + ech(d) + '</dd>' : '') + '</div>').join('') +
  '</dl></div></details>';

/* ── Les identifiants RAWG et les visuels d'attente ──────────────────── */
const RAWG = {
  'zl-ss': 558974, 'zl-minish': 27418, 'zl-foursw': 290864, 'zl-oot': 1019942, 'zl-alttp': 25096,
  'zl-la': 292842, 'zl-oos': 27255, 'zl-ooa': 27256, 'zl-albw': 27977, 'zl-tfh': 27991,
  'zl-eow': 983717, 'zl-loz': 24072, 'zl-aol': 53205, 'zl-mm': 23768, 'zl-tp': 24182,
  'zl-fsa': 56093, 'zl-ww': 27975, 'zl-ph': 27023, 'zl-st': 23850, 'zl-botw': 22511,
  'zl-totk': 327239, 'zl-aoi': 1010400
};
/* le visuel RAWG, reduit a 640 px, tant que Niko n'a pas depose le sien */
const ATTENTE = {
  'zl-ss': 'games/624/624ee5ea783877a9ad8ccf68b8d8300b.jpg',
  'zl-minish': 'games/25d/25d9592abbd02dccd67d83108ae79582.jpg',
  'zl-foursw': 'screenshots/063/063e24eb22d69c8d4febc5b938a50b57.jpg',
  'zl-oot': 'games/c3b/c3bc70310175785b0c9d7bfc93624d5f.jpg',
  'zl-alttp': 'games/087/08727beb32c364d30e8b2a1aa8595f8e.jpg',
  'zl-la': 'games/1bb/1bb38f1354db6596ccd6bdcb4a7f6cbc.jpg',
  'zl-oos': 'screenshots/8ab/8ab43c6316d0b5bf16039345867e025a.jpg',
  'zl-ooa': 'screenshots/0e0/0e02b3c6aaf4bf6d7a59f8c001bb3fac.jpg',
  'zl-albw': 'games/c23/c231ef56cdd277fad5fbcd2f6b7d2951.jpg',
  'zl-tfh': 'screenshots/eb8/eb82c4b98dacb91d5a5834c7e5570883.jpg',
  'zl-eow': 'games/ef0/ef095574ebf35dbe30cbb85f3798b4e5.jpg',
  'zl-loz': 'games/f87/f87de0e93f02007fd044e4bf04d453d8.jpg',
  'zl-aol': 'screenshots/2dc/2dcc5b76de63a99799364f962334525f.jpg',
  'zl-mm': 'screenshots/5a7/5a776ec17c5e6247e0c3f61ee1ade097.jpg',
  'zl-tp': 'screenshots/46e/46e49369d4a3d528db5216a5cadec38b.jpg',
  'zl-fsa': 'screenshots/336/336e29b524e0e4f17ac2d2b9339baea4.jpg',
  'zl-ww': 'screenshots/c75/c75f83d346ded0cb785e0649e0ac10cd.jpg',
  'zl-ph': 'screenshots/b23/b23b3b0f25b10123c0338cf9f5c8bc12.jpg',
  'zl-st': 'games/4a1/4a1ed758c53873d6442562f0c772b640.jpeg',
  'zl-botw': 'games/cc1/cc196a5ad763955d6532cdba236f730c.jpg',
  'zl-totk': 'games/556/55684bfd048706f4266d331d70050b37.jpg',
  'zl-aoi': 'games/480/4801940e86df11f8aa92b3c988fe92fc.jpg'
};
const rawgImg = (id, w) => 'https://media.rawg.io/media/resize/' + (w || 640) + '/-/' + ATTENTE[id];
const ATTENDUES = [];
const local = (nom, id) => fs.existsSync(path.join(RACINE, 'images', nom))
  ? '/images/' + nom : (ATTENDUES.push(nom), rawgImg(id, 1920));
const vignette = (local, id) => {
  if (fs.existsSync(path.join(RACINE, 'images', local))) return '/images/' + local;
  ATTENDUES.push(local);
  return rawgImg(id);
};

/* ── Les vingt-deux entrees ────────────────────────────────────────────
   `ere` : la bande (colonne) ; `sous` : la sous-station d'une branche. */
const E = [
  { ere: 0, id: 'zl-ss', level: 'must', title: 'Skyward Sword HD', date: '???', img: 'skywardsword.webp' },

  { ere: 1, id: 'zl-minish', level: 'important', title: 'The Minish Cap', date: '+ ~1000-5000 years', img: 'minishcap.webp' },
  { ere: 1, id: 'zl-foursw', level: 'bonus', title: 'Four Swords', date: '+ ~200-500 years', img: 'fourswords.webp' },

  { ere: 2, id: 'zl-oot', level: 'must', title: 'Ocarina of Time', date: '+ ~200-400 years', img: 'ocarinaoftime.webp' },

  { ere: 3, sous: 'Era of Light and Dark', id: 'zl-alttp', level: 'must', title: 'A Link to the Past', date: '+ ~300-500 years', img: 'alinktothepast.webp' },
  { ere: 3, id: 'zl-la', level: 'bonus', title: 'Link’s Awakening', date: '+ ~1-2 years', img: 'linksawakening.webp' },
  { ere: 3, id: 'zl-oos', level: 'bonus', title: 'Oracle of Seasons', date: '+ ~1 year', img: 'oracleofseasons.webp' },
  { ere: 3, id: 'zl-ooa', level: 'bonus', title: 'Oracle of Ages', date: '+ ~X-1X days', img: 'oracleofages.webp' },
  { ere: 3, id: 'zl-albw', level: 'important', title: 'A Link Between Worlds', date: '+ ~100-200 years', img: 'alinkbetweenworlds.webp' },
  { ere: 3, id: 'zl-tfh', level: 'bonus', title: 'Tri Force Heroes', date: '+ 1-3 years', img: 'triforceheroes.webp' },
  { ere: 3, id: 'zl-eow', level: 'important', title: 'Echoes of Wisdom', date: '+ ~200-500 years', img: 'echoesofwisdom.webp' },
  { ere: 3, sous: 'Era of Decline', id: 'zl-loz', level: 'important', title: 'The Legend of Zelda', date: '+ ~300-1000 years', img: 'zelda1.webp' },
  { ere: 3, id: 'zl-aol', level: 'important', title: 'Zelda II: The Adventure of Link', date: '+ 6 years', img: 'adventuresoflink.webp' },

  { ere: 4, sous: 'Twilight & Shadow Era', id: 'zl-mm', level: 'important', title: 'Majora’s Mask 3D', date: '+ ~2-6 months', img: 'majorasmask.webp' },
  { ere: 4, id: 'zl-tp', level: 'must', title: 'Twilight Princess HD', date: '+ ~200-300 years', img: 'twilightprincess.webp' },
  { ere: 4, id: 'zl-fsa', level: 'bonus', title: 'Four Swords Adventures', date: '+ ~100-500 years', img: 'fourswordsadventures.webp' },

  { ere: 5, sous: 'Era of the Great Sea', id: 'zl-ww', level: 'must', title: 'The Wind Waker HD', date: '+ ~500-1000 years', img: 'zeldawindwaker.webp' },
  { ere: 5, sous: 'Era of the Great Voyage', id: 'zl-ph', level: 'important', title: 'Phantom Hourglass', date: '+ ~2-6 months', img: 'phantomhourglass.webp' },
  { ere: 5, sous: 'Era of Hyrule’s Rebirth', id: 'zl-st', level: 'important', title: 'Spirit Tracks', date: '+ 100 years', img: 'spirittracks.webp' },

  { ere: 6, id: 'zl-botw', level: 'must', title: 'Breath of the Wild', date: '+ ~XXXXX years', img: 'breathofthewild.webp' },
  { ere: 6, id: 'zl-totk', level: 'must', title: 'Tears of the Kingdom', date: '+ 6-7 years', img: 'tearsofthekingdom.webp' },
  { ere: 6, id: 'zl-aoi', level: 'bonus', title: 'Hyrule Warriors: Age of Imprisonment', date: '- ~XXXXX years', tags: ['flashback'], img: 'hyrulewarriors.webp' }
];
/* Le synopsis officiel vient de RAWG, lu par la page a l'ouverture de la
   fiche (`rawgSyn()`, qui ecarte la Virtual Console, les palmares et les
   textes de wiki). Cinq jeux n'y ont pas de texte officiel : leur synopsis
   est ecrit ici, court et sans divulgacher, rien n'en est recopie. */
const DESC = {
  'zl-foursw': 'The wind sorcerer Vaati breaks free and kidnaps Princess Zelda. Drawing the Four Sword splits Link into four, and the four of them have to work together to seal him away again.',
  'zl-eow': 'Rifts are swallowing Hyrule and its people, Link among them. This time Princess Zelda sets out herself, with a staff that lets her create echoes of the things around her.',
  'zl-aol': 'A mark appears on Link’s hand and leads him to a princess under an ancient sleeping spell. To wake her, he has to find a hidden Triforce, while Ganon’s followers hunt him down.',
  'zl-fsa': 'Dark copies of Link are roaming Hyrule, and the maidens who guard Vaati’s seal have been kidnapped. Link draws the Four Sword once more and splits into four to set things right.',
  'zl-aoi': 'An action game set in the far past of Hyrule, in the war its founders fought against the Demon King — the story told in Tears of the Kingdom, seen from the battlefield.'
};
for (const e of E) {
  e.date = e.date.toUpperCase();
  if (DESC[e.id]) e.desc = DESC[e.id];
  e.type = 'jeu';
  e.media = 'game';
  e.tmdb = String(RAWG[e.id]);
  e.img = vignette(e.img, e.id);
}

/* ── Les bandes : quatre stations simples et une correspondance ──────── */
const ZONE_SPLIT = 'Three Timelines';
const ERES = [
  { title: 'Sky Era', branch: 'main', art: local('skyera.webp', 'zl-ss') },
  { title: 'Force Era', branch: 'main', art: local('forceera.webp', 'zl-minish') },
  { title: 'Era of the Hero of Time', branch: 'main', art: local('herooftime.webp', 'zl-oot') },
  { title: 'Fallen Hero Timeline', zone: ZONE_SPLIT, branch: 'fallen',
    spoil: 'Link is defeated by Ganondorf, the kingdom falls into ruin.' },
  { title: 'Child Timeline', zone: ZONE_SPLIT, branch: 'child', first: true,
    spoil: 'Link warns the royal family in the past, Ganondorf is captured and put on trial.' },
  { title: 'Adult Timeline', zone: ZONE_SPLIT, branch: 'adult',
    spoil: 'Link disappears from the future after returning in the past, Hyrule is submerged beneath the waters.' },
  { title: 'Era of the Wilds', branch: 'main', art: local('eraofthewilds.webp', 'zl-botw') }
];
const ART_SPLIT = local('threetimelineszelda.webp', 'zl-tp');

const BRANCHES = {
  fallen: { label: 'Fallen Hero Timeline', c: '#e5484d', cols: ['fallen'] },
  child: { label: 'Child Timeline', c: '#f5a524', cols: ['child'] },
  adult: { label: 'Adult Timeline', c: '#38bdf8', cols: ['adult'] },
  main: { label: 'The Legend of Zelda', c: '#43b02a', cols: ['main'] }
};

/* ── L'ordre de sortie ─────────────────────────────────────────────────
   Les jeux dans l'ordre ou ils sont sortis, dans la version que la
   timeline conseille — la plus recente, comme Resident Evil. Quatre eres
   de production. Les dates completes sont dans `ordre-sortie.mjs`. */
const SORTIE = [
  { title: 'Classic Era · 1987-2005', ids: [
    ['zl-loz', '1987'], ['zl-aol', '1988'], ['zl-alttp', '1992'], ['zl-oos', '2001'], ['zl-ooa', '2001'],
    ['zl-foursw', '2002'], ['zl-fsa', '2004'], ['zl-minish', '2005']] },
  { title: 'DS Era · 2007-2009', ids: [['zl-ph', '2007'], ['zl-st', '2009']] },
  { title: '3DS & Wii U Era · 2013-2016', ids: [
    ['zl-ww', '2013'], ['zl-albw', '2013'], ['zl-mm', '2015'], ['zl-tfh', '2015'], ['zl-tp', '2016']] },
  { title: 'Switch Era · 2017-2026', ids: [
    ['zl-botw', '2017'], ['zl-la', '2019'], ['zl-ss', '2021'], ['zl-totk', '2023'], ['zl-eow', '2024'],
    ['zl-aoi', '2025'], ['zl-oot', '2026']] }
];
const ARTS_SORTIE = ['zl-alttp', 'zl-ph', 'zl-ww', 'zl-botw'].map(i => rawgImg(i, 1920));

const ids = n => E.filter(e => e.ere === n).map(e => e.id);
const BADGES = [
  { id: 'zl_origins', universe: 'zl', icon: '🪶', color: '#43b02a', trigger: 'oeuvre',
    ids: [...ids(0), ...ids(1), ...ids(2)],
    label: 'Loftwing Rider', desc: 'Sky, Force and Hero of Time eras completed' },
  { id: 'zl_fallen', universe: 'zl', icon: '🗡️', color: '#e5484d', trigger: 'oeuvre', ids: ids(3),
    label: 'Hero of Legend', desc: 'Fallen Hero Timeline completed' },
  { id: 'zl_child', universe: 'zl', icon: '🌗', color: '#f5a524', trigger: 'oeuvre', ids: ids(4),
    label: 'Twilight Realm', desc: 'Child Timeline completed' },
  { id: 'zl_adult', universe: 'zl', icon: '⛵', color: '#38bdf8', trigger: 'oeuvre', ids: ids(5),
    label: 'King of Red Lions', desc: 'Adult Timeline completed' },
  { id: 'zl_wilds', universe: 'zl', icon: '🍃', color: '#7dd3fc', trigger: 'oeuvre', ids: ids(6),
    label: 'Champion of Hyrule', desc: 'Era of the Wilds completed' },
  { id: 'zl_100', universe: 'zl', icon: '🔺', color: '#f0c97c', trigger: '100pct', ids: [],
    label: 'Triforce', desc: 'The Legend of Zelda 100% completed' }
];

/* ── Sortie ──────────────────────────────────────────────────────────── */
const CG = {
  t: T,
  universe: 'zl',
  badgeLabels: { jeu: ['bj', 'VIDEO GAME'] },
  markLabels: { flashback: 'FLASHBACK' },
  badges: BADGES,
  resetMsg: 'Reset your The Legend of Zelda progress?',
  tmdbLang: 'en-US',
  tmdbKey: bac.window.CG.tmdbKey,
  rawgKey: bac.window.CG.rawgKey,
  img: 'https://image.tmdb.org/t/p/',
  branches: BRANCHES,
  groups: Object.fromEntries(['fallen', 'child', 'adult'].map((b, k) =>
    [b, { label: BRANCHES[b].label, color: BRANCHES[b].c, ids: ids(3 + k) }]))
};

/* les images des eres des trois branches, au nom que Niko leur donne */
const SOUS_ART = {
  'Era of Light and Dark': 'eraoflightanddark.webp', 'Era of Decline': 'eraofdecline.webp',
  'Twilight & Shadow Era': 'shadowtwilightera.webp', 'Era of the Great Sea': 'eraofthegreatsea.webp',
  'Era of the Great Voyage': 'eraofthegreatvoyage.webp', 'Era of Hyrule’s Rebirth': 'eraofhyrulesrebirth.webp'
};
const nettoie = ({ ere, sous, ...reste }) => reste;
const DATA = {
  id: 'zelda',
  title: 'The Legend of Zelda',
  subtitle: 'Complete canon timeline',
  description: 'Every story game, one timeline that splits in three',
  /* le vert de la tunique de Link, demande par Niko */
  color: '#43b02a',
  glow: 'rgba(67,176,42,.35)',
  banner: local('zelda.webp', 'zl-botw'),
  notes: NOTES,
  zoneDesc: {
    [ZONE_SPLIT]: 'After Ocarina of Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing the Child Timeline first because it’s the direct sequel of OoT.',
    'Era of the Wilds': 'Probably takes place after the 3 timelines reunited somehow.'
  },
  artSplit: ART_SPLIT,
  eras: ERES.map((er, i) => ({
    ...er, ...(er.zone ? {} : { zone: er.title }),
    entries: E.filter(e => e.ere === i).flatMap(e => e.sous
      ? [{ id: e.id + '-era', type: 'separator', title: e.sous, art: local(SOUS_ART[e.sous], e.id) }, nettoie(e)]
      : [nettoie(e)])
  })),
  erasRelease: SORTIE.map(({ ids: liste, ...er }, k) => ({
    ...er, zone: er.title, branch: 'main', art: ARTS_SORTIE[k],
    entries: liste.map(([a, rel]) => {
      const e = E.find(y => y.id === a);
      if (!e) throw new Error('Ordre de sortie : entree inconnue ' + a);
      const x = { ref: a, rel };
      if ((e.tags || []).includes('flashback')) x.drop = ['tags'];
      return x;
    })
  }))
};
{
  const places = DATA.erasRelease.flatMap(er => er.entries.map(e => e.ref));
  const oubli = E.filter(e => !places.includes(e.id)).map(e => e.id);
  if (oubli.length) throw new Error('Absentes de l\'ordre de sortie : ' + oubli.join(', '));
  if (new Set(places).size !== places.length) throw new Error('Ordre de sortie : entree en double');
}
const vus = new Set();
for (const e of E) {
  if (vus.has(e.id)) throw new Error('Identifiant en double : ' + e.id);
  vus.add(e.id);
}

const ENTETE = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .split('*/')[0].replace(/^\/\* Construit `data-zelda-en\.js`, les/, '/* Donnees de la');

const sortie = ENTETE + '*/\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.ZELDA=' + JSON.stringify(DATA) + ';\n' +
  'window.RT={};\n';

fs.writeFileSync(path.join(ICI, 'data-zelda-en.js'), sortie, 'utf8');
fs.writeFileSync(path.join(ICI, 'sorties', 'zelda.json'), JSON.stringify(DATA.erasRelease, null, 1) + '\n');
if (!process.argv.includes('--sans-detail')) {
  execFileSync('node', [path.join(ICI, 'detailler-sortie.mjs'), 'zelda'], { stdio: 'inherit' });
}
console.log('data-zelda-en.js ecrit : %d entrees, %d bandes (%d en ordre de sortie), %d badges, %d Ko',
  E.length, DATA.eras.length, DATA.erasRelease.length, BADGES.length, Math.round(sortie.length / 1024));
console.log('  niveaux : %s',
  ['must', 'important', 'bonus'].map(l => l + ' ' + E.filter(e => e.level === l).length).join(' · '));
if (ATTENDUES.length) console.log('  vignettes RAWG en attendant celles de Niko (%d) : %s', ATTENDUES.length, ATTENDUES.join(', '));
