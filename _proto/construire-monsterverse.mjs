/* Construit `data-monsterverse-en.js`, les donnees de la timeline Monsterverse,
   depuis le document de Niko « Monsterverse.txt ». Les textes affiches en sont
   decoupes mot pour mot : accroche, reperes de lecture, titres, dates et
   raisons d'exclusion. Rien n'y est reformule — ce fichier ne s'edite pas a
   la main, on corrige le script et on le rejoue.

   Quatorzieme univers du site, et dixieme page dont la source est anglaise :
   le francais en descend par `traduire-monsterverse.mjs`.

   Ce que le document ne donne pas, et qui est donc pose ici :

   - Les quatre eres. Le document est une liste plate de dix-huit lignes.
     Le decoupage suit ses dates et les quatre temps du monde : Skull Island,
     de 1973 a 2012 ; le retour de Godzilla en 2014 et les annees Monarch
     qui le suivent ; l'eveil des Titans de 2019 ; puis la Terre creuse, de
     Godzilla vs. Kong a The New Empire. Ce sont des intitules de structure,
     l'exception que le CLAUDE.md admet quand la prose n'en a pas.
   - Les niveaux. Le document n'en pose aucun ; il dit seulement que « the
     comics are not really important ». Les cinq films sont donc `must`, les
     deux saisons de Monarch `important` ; la serie Skull Island, les neuf
     comics et le jeu `bonus` — Skull Island tranchee par Niko le 7 novembre
     2026.
   - Les badges.

   Les fiches : les films et les series passent par TMDB, le jeu par RAWG
   (par son titre : RAWG ne repondait pas le 7 novembre 2026). Les comics
   n'en ont pas : leur synopsis (`desc`) est ecrit ici, court et sans
   divulgacher, d'apres les pages du wiki Godzilla — rien n'en est recopie.

   Badge VO sur les neuf comics : aucun n'a d'edition francaise au catalogue
   de la BnF (releve le 7 novembre 2026). Les films et les deux series sont
   doubles ; le jeu n'en porte pas, comme ceux de Resident Evil.

   Pas de table RT : neuf des dix-huit entrees sont des comics, qui n'ont pas
   de duree. Meme raison qu'Avatar Legends et Blade Runner. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.dirname(ICI);

/* ── Le lexique commun, repris de Resident Evil ──────────────────────────
   Il a deja les libelles d'une fiche de jeu (« Watch the game », « Released »),
   qu'un guide sans jeu n'aurait pas. On ne change que ce qui nomme l'univers. */
const src = fs.readFileSync(path.join(ICI, 'data-re-en.js'), 'utf8');
const bac = { window: {}, console };
bac.window.window = bac.window;
new Function('window', src)(bac.window);
const T = JSON.parse(JSON.stringify(bac.window.CG.t));

T.nav.monsterverse = 'Monsterverse';
T.markWatched = 'Mark “{t}” as done';
T.legal3 = 'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, ' +
  'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner and Monsterverse ' +
  'are trademarks of their respective owners; Chronologeek is an independent fan project.';

/* ── L'accroche, decoupee du document ──────────────────────────────────── */
const ic = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/>' +
       '<path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/>' +
        '<path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
};

/* Ce qui est ecarte : l'intitule, puis la ligne du document. Deux lignes n'ont
   pas de raison — on ne repete pas l'intitule en guise de raison. */
const ECARTES = [
  ['Movies novelizations', ''],
  ['Mobile games', 'Mobile games: no story, not canon and/or not available anymore.'],
  ['Children books', ''],
  ['Godzilla Awakening comic', 'Godzilla Awakening comic: not canon anymore since the release of the Monarch TV show.'],
  ['Justice League crossover comics', 'Justice League crossover comics: not canon obviously.']
];

const ech = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const NOTES =
  '<p class="intro-lead">If you’re here it’s either because you watched some of the movies and ' +
  'want to discover the expanded universe or because you want to discover the full universe. ' +
  'This guide is spoiler free like the others.</p>' +
  '<div class="intro-tags"><span class="itag pc-first">' + ic.check +
  'This guide works for first-time watch as well as rewatches.</span>' +
  '<span class="itag pc-release">' + ic.check +
  'This guide follows the order the works came out, from 2014 to today, but you can switch back to a chronological version higher up.</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
  '<div class="key"><div class="key-h">' + ic.cal + 'Calendar</div>' +
  '<p>The saga happens in &quot;our&quot; world so we’ll count in years like we do.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.book + 'Comics</div>' +
  '<p>The comics are not really important but the more the universe expands the more monsters ' +
  'we discover and since the movies focus on Kong and/or Godzilla the other monsters are ' +
  'characters in the different comics, which also focus the 2 main Titans fighting them. But ' +
  'like Godzilla Awakening, they can be decanonized when something comes out and contradicts ' +
  'its story.</p></div></div>' +
  '<details class="cuts"><summary>What’s left out and why?<span class="n">' +
  ECARTES.length + ' entries</span>' +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
  '</summary><div class="cuts-body"><dl class="cuts-list">' +
  ECARTES.map(([t, d]) => '<div class="cut"><dt>' + ech(t) + '</dt>' +
    (d ? '<dd>' + ech(d) + '</dd>' : '') + '</div>').join('') +
  '</dl></div></details>';

/* ── Les vignettes : celles de Niko, deposees dans `images/` ──────────── */
const vignette = local => {
  if (fs.existsSync(path.join(RACINE, 'images', local))) return '/images/' + local;
  throw new Error('Vignette absente : images/' + local);
};

/* ── Les dix-huit entrees ─────────────────────────────────────────────────
   type   : film, serie, anime, comic, jeu
   tmdb   : identifiant TMDB pour ce qui se regarde ; le jeu n'en a pas et
            passe par son titre chez RAWG
   date   : celle du document, jamais traduite
   desc   : le synopsis d'un comic ou du jeu
   lang   : 'vo' — aucun des neuf comics n'a d'edition francaise */
const E = [
  { ere: 0, id: 'mv-kongskullisland', type: 'film', level: 'must', tmdb: '293167', media: 'movie',
    title: 'Kong: Skull Island', date: '1973', img: vignette('kongskullisland.webp') },
  { ere: 0, id: 'mv-skullisland', type: 'anime', level: 'bonus', tmdb: '117678', media: 'tv',
    title: 'Skull Island', subitems: ['Season 1'], date: '1993', img: vignette('skullisland.webp') },
  { ere: 0, id: 'mv-returntoskullisland', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Set after the animated series. A group of survivors is stranded on Skull Island, where every creature is a threat — Kong included — and the island keeps more secrets than they bargained for.',
    title: 'Return to Skull Island', date: '1993', img: vignette('returntoskullisland.webp') },
  { ere: 0, id: 'mv-escapefromskullisland', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'The survivors are still trapped on the island while something ancient stirs beneath it. In flashbacks, the young Kong fights the battles that made him the island’s king.',
    title: 'Escape from Skull Island', date: '1993', img: vignette('escapefromskullisland.webp') },
  { ere: 0, id: 'mv-birthofkong', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A secret Monarch team returns to Skull Island to learn the truth about Kong, and about the ancient war between Titans that left him the last of his kind. Both a sequel and a prequel to Kong: Skull Island.',
    title: 'Skull Island: The Birth of Kong', date: '2012', img: vignette('thebirthofkong.webp') },

  { ere: 1, id: 'mv-godzilla', type: 'film', level: 'must', tmdb: '124905', media: 'movie',
    title: 'Godzilla', date: '2014', img: vignette('godzilla2014.webp') },
  { ere: 1, id: 'mv-aftershock', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'After San Francisco, a new Titan rises from deep underground and sets off earthquakes around the globe, while Monarch’s Dr. Emma Russell tries to understand what is coming. The bridge between Godzilla and King of the Monsters.',
    title: 'Godzilla: Aftershock', date: '2014', img: vignette('godzillaaftershock.webp') },
  { ere: 1, id: 'mv-monarch-s1', type: 'serie', level: 'important', tmdb: '202411', media: 'tv',
    title: 'Monarch: Legacy of Monsters', subitems: ['Season 1'], date: '2015',
    img: vignette('monarchlegacyofmonsters.webp') },
  { ere: 1, id: 'mv-monarch-s2', type: 'serie', level: 'important', tmdb: '202411', media: 'tv',
    title: 'Monarch: Legacy of Monsters', subitems: ['Season 2'], date: '2017',
    img: vignette('monarchlegacyofmonsters.webp') },

  { ere: 2, id: 'mv-kotm', type: 'film', level: 'must', tmdb: '373571', media: 'movie',
    title: 'Godzilla: King of the Monsters', date: '2019', img: vignette('godzillakingofthemonsters.webp') },
  { ere: 2, id: 'mv-kingdomkong', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Elite pilots gather on Skull Island to train for a mission into the Hollow Earth, until a bat-like Titan, Camazotz, attacks Kong’s home. A sequel to The Birth of Kong.',
    title: 'Kingdom Kong', date: '2019', img: vignette('kingdomkong.webp') },
  { ere: 2, id: 'mv-dominion', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Told entirely from Godzilla’s point of view: the new king of the Titans looks for a home and defends his territory against the other Titans, as another king waits in the wings.',
    title: 'Godzilla Dominion', date: '2021', img: vignette('godzilladominion.webp') },
  { ere: 2, id: 'mv-fightorflight', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A short story leading straight into Godzilla vs. Kong, first published in the Legends of the Monsterverse omnibus.',
    title: 'Godzilla: Fight or Flight', date: '2024', img: vignette('godzillafightofflight.webp') },

  { ere: 3, id: 'mv-gvk', type: 'film', level: 'must', tmdb: '399566', media: 'movie',
    title: 'Godzilla vs. Kong', date: '2024', img: vignette('godzillavskong.webp') },
  { ere: 3, id: 'mv-survivorinstinct', type: 'jeu', level: 'bonus', media: 'game',
    desc: 'Shortly after Godzilla vs. Kong, a father searches for his daughter in a coastal city turned into a Titan battlefield, while mercenaries hunt him for a Monarch device he stumbled upon.',
    title: 'Kong: Survivor Instinct', date: '2024', img: vignette('kongsurvivalinstinct.webp') },
  { ere: 3, id: 'mv-hunted', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'A Skull Island trophy hunter sets a trap for Kong deep in the Hollow Earth, and pits Godzilla against another Titan to keep him busy on the surface. Leads directly into The New Empire.',
    title: 'Godzilla x Kong: The Hunted', date: '2027', img: vignette('godzillathehunted.webp') },
  { ere: 3, id: 'mv-declassified', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'An anthology that opens Monarch’s classified files on four Titans, Behemoth and Tiamat among them: their legends, their origins, and where they were before The New Empire.',
    title: 'MonsterVerse Declassified', date: '2019-2027', img: vignette('monsterversedeclassified.webp') },
  { ere: 3, id: 'mv-newempire', type: 'film', level: 'must', tmdb: '823464', media: 'movie',
    title: 'Godzilla x Kong: The New Empire', date: '2027', img: vignette('godzillathenewempire.webp') }
];

/* Les images de station : celles de Niko quand elles y sont, sinon le visuel
   TMDB du film qui porte l'ere, le temps du proto. */
const TMDB_ART = 'https://image.tmdb.org/t/p/w1280';
const art = (local, tmdb) =>
  fs.existsSync(path.join(RACINE, 'images', local)) ? '/images/' + local : TMDB_ART + tmdb;

const ERES = [
  { title: 'Skull Island', phase: 'ERA 1', ink: 1,
    art: art('skullislandera.webp', '/nVodCGKYLpqNC8YwQAbivKlWCgZ.jpg') },
  { title: 'Godzilla Returns', phase: 'ERA 2', ink: 2,
    art: art('godzillareturnsera.webp', '/6CLNOzMXO9bvapDD8gsdwkJU4wN.jpg') },
  { title: 'The Titans Awaken', phase: 'ERA 3', ink: 3,
    art: art('titansawakensera.webp', '/mzRJpkWPjXdXak0WCc8ZxVH4hug.jpg') },
  { title: 'Hollow Earth', phase: 'ERA 4', ink: 4,
    art: art('hollowearthera.webp', '/gvLG3Fnznkxl4SmYfcK8gUuqxM8.jpg') }
];

/* ── L'ordre de sortie ─────────────────────────────────────────────────
   Les œuvres entières dans l'ordre où elles sont sorties ; `detailler-sortie.mjs`
   les coupe ensuite au numéro et à l'épisode — Escape from Skull Island et la
   saison 2 de Monarch sortent en même temps, au printemps 2026. Trois ères de
   production, écrites ici, le document n'en ayant pas. Les dates complètes
   sont dans `ordre-sortie.mjs` et `sorties/numeros.mjs`. */
const SORTIE = [
  { title: 'The First Films · 2014-2017', phase: 'ERA 1', ink: 1, art: ERES[1].art, ids: [
    ['mv-godzilla', '2014'], ['mv-kongskullisland', '2017'], ['mv-birthofkong', '2017']] },
  { title: 'Clash of the Titans · 2019-2021', phase: 'ERA 2', ink: 3, art: ERES[2].art, ids: [
    ['mv-aftershock', '2019'], ['mv-kotm', '2019'], ['mv-gvk', '2021'],
    ['mv-dominion', '2021'], ['mv-kingdomkong', '2021']] },
  { title: 'The Expanded Universe · 2023-2026', phase: 'ERA 3', ink: 4, art: ERES[3].art, ids: [
    ['mv-skullisland', '2023'], ['mv-monarch-s1', '2023'], ['mv-fightorflight', '2024'],
    ['mv-hunted', '2024'], ['mv-newempire', '2024'], ['mv-survivorinstinct', '2024'],
    ['mv-declassified', '2025'], ['mv-returntoskullisland', '2025'],
    ['mv-escapefromskullisland', '2026'], ['mv-monarch-s2', '2026']] }
];

const ECRAN = E.filter(e => e.type !== 'comic' && e.type !== 'jeu').map(e => e.id);

const BADGES = [
  { id: 'mv_skull', universe: 'mv', icon: '🦍', color: '#3fae6a', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 0).map(e => e.id),
    label: 'Eighth Wonder', desc: 'Skull Island completed' },
  { id: 'mv_godzilla', universe: 'mv', icon: '🦖', color: '#4fa3e0', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 1).map(e => e.id),
    label: 'Let Them Fight', desc: 'Godzilla Returns completed' },
  { id: 'mv_titans', universe: 'mv', icon: '🐉', color: '#e0a83a', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 2).map(e => e.id),
    label: 'Long Live the King', desc: 'The Titans Awaken completed' },
  { id: 'mv_hollow', universe: 'mv', icon: '🌋', color: '#a35be0', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 3).map(e => e.id),
    label: 'Rise Together', desc: 'Hollow Earth completed' },
  { id: 'mv_screen', universe: 'mv', icon: '🎬', color: '#64b5f6', trigger: 'oeuvre',
    ids: ECRAN,
    label: 'Monarch Clearance', desc: 'Everything on screen watched' },
  { id: 'mv_100', universe: 'mv', icon: '👑', color: '#d946ef', trigger: '100pct', ids: [],
    label: 'King of the Monsters', desc: 'Monsterverse 100% completed' }
];

/* ── Sortie ──────────────────────────────────────────────────────────── */
const CG = {
  t: T,
  universe: 'mv',
  badgeLabels: {
    film: ['bf', 'MOVIE'], serie: ['bs', 'TV SHOW'], anime: ['ba', 'ANIMATED SHOW'],
    comic: ['bc', 'COMIC'], jeu: ['bj', 'VIDEO GAME']
  },
  markLabels: {},
  badges: BADGES,
  resetMsg: 'Reset your Monsterverse progress?',
  tmdbLang: 'en-US',
  tmdbKey: bac.window.CG.tmdbKey,
  rawgKey: bac.window.CG.rawgKey,
  img: 'https://image.tmdb.org/t/p/'
};

const DATA = {
  id: 'mv',
  title: 'Monsterverse',
  subtitle: 'Complete canon timeline',
  description: 'Movies · Shows · Comics · Game',
  /* le fuchsia des plaques dorsales de Godzilla dans The New Empire. Les bleus
     de son souffle atomique sont pris trois fois sur l'accueil (Star Wars,
     Avatar Legends, DC Animation), et les verts deux (Jurassic World, The
     Walking Dead). */
  color: '#d946ef',
  glow: 'rgba(217,70,239,.35)',
  notes: NOTES,
  eras: ERES.map((er, i) => ({
    title: er.title, phase: er.phase, ink: er.ink, art: er.art,
    entries: E.filter(e => e.ere === i).map(({ ere, ...reste }) => reste)
  })),
  erasRelease: SORTIE.map(({ ids, ...er }) => ({
    ...er,
    entries: ids.map(([a, rel]) => {
      const x = typeof a === 'string' ? { ref: a } : { ...a };
      const srcs = (x.ref ? [x.ref] : x.covers).map(id => E.find(e => e.id === id));
      if (srcs.some(e => !e)) throw new Error('Ordre de sortie : entree inconnue ' + (x.ref || x.covers));
      x.rel = rel;
      if (srcs.some(e => (e.tags || []).includes('flashback'))) x.drop = ['tags'];
      return x;
    })
  }))
};
{
  const places = DATA.erasRelease.flatMap(er => er.entries.flatMap(e => e.ref ? [e.ref] : e.covers));
  const oubli = E.filter(e => !places.includes(e.id)).map(e => e.id);
  if (oubli.length) throw new Error('Absentes de l\'ordre de sortie : ' + oubli.join(', '));
  if (new Set(places).size !== places.length) throw new Error('Ordre de sortie : entree en double');
}

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
  .split('*/')[0].replace(/^\/\* Construit `data-monsterverse-en\.js`, les/, '/* Donnees de la');

const sortie = ENTETE + '*/\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.MONSTERVERSE=' + JSON.stringify(DATA) + ';\n';

fs.writeFileSync(path.join(ICI, 'data-monsterverse-en.js'), sortie, 'utf8');
/* L'ordre de sortie écrit ici est celui des œuvres entières : c'est la source de
   `detailler-sortie.mjs`, qui pose les morceaux dans le fichier de données. */
fs.writeFileSync(path.join(ICI, 'sorties', 'monsterverse.json'), JSON.stringify(DATA.erasRelease, null, 1) + '\n');
execFileSync('node', [path.join(ICI, 'detailler-sortie.mjs'), 'monsterverse'], { stdio: 'inherit' });
console.log('data-monsterverse-en.js ecrit : %d entrees, %d eres (%d en ordre de sortie), %d badges, %d Ko',
  E.length, DATA.eras.length, DATA.erasRelease.length, BADGES.length, Math.round(sortie.length / 1024));
console.log('  niveaux : %s',
  ['must', 'important', 'bonus'].map(l => l + ' ' + E.filter(e => e.level === l).length).join(' · '));
console.log('  types   : %s',
  Object.keys(CG.badgeLabels).map(t => t + ' ' + E.filter(e => e.type === t).length).join(' · '));
