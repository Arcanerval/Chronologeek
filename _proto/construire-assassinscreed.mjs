/* Construit `data-assassinscreed-en.js` depuis le document de Niko
   « ac.txt ». Les textes affiches en sont decoupes mot pour mot : accroche,
   reperes de lecture, titres, dates, notes de placement, reponses de FAQ et
   raisons d'exclusion. Rien n'y est reformule.

   Quatrieme page dont la source est anglaise, apres Star Trek, The Walking
   Dead et Dragon Age : le francais reste a ecrire.

   Ce qui est ecrit ici, et qui n'est pas dans le document :
   - les sept titres de saga viennent de ses propres intertitres (ALTAIR
     SAGA, EZIO SAGA...), seule la casse change ;
   - les trois intitules du depliant « How to read this » sont ses propres
     intertitres (THE CALENDAR, FLASHBACKS..., GAMES ORDER) ;
   - les cinq badges, qu'aucun document n'a jamais.

   Deux coquilles du document sont corrigees, et seulement dans un intitule
   de structure : « FLASHFOWARDS » -> flashforwards, « TROUGHT » -> through.
   Aucune phrase de prose n'est touchee.

   Les niveaux ne viennent pas du document : il annonce « Essential /
   important / optional » sans en poser aucun. Sa deuxieme ligne donne les
   jeux pour essentiels et le reste pour bonus (« all other medias are bonus
   content »), et c'est ce qui est applique ; les DLC prennent
   « important », comme sur Dragon Age.

   Pas de table RT : un guide de jeux video n'a pas de duree a sommer, meme
   raison qu'Avatar Legends et Dragon Age.

   Usage : node _proto/construire-assassinscreed.mjs [--check]           */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = process.env.AC_SOURCE || 'C:/Users/nprad/Desktop/ac.txt';
const SORTIE = path.join(ICI, 'data-assassinscreed-en.js');
const VISUELS = path.join(ICI, 'visuels-assassinscreed.json');
const CHECK = process.argv.includes('--check');

/* ── le document ──────────────────────────────────────────────────── */
const brut = fs.readFileSync(SOURCE, 'utf8');
const lignes = brut.split(/\r?\n/);

/* ── les sept sagas, dans l'ordre du document ─────────────────────── */
const SAGAS = [
  { cle: 'ALTAÏR SAGA',                    titre: 'Altaïr Saga' },
  { cle: 'EZIO SAGA',                      titre: 'Ezio Saga' },
  { cle: 'KENWAY SAGA',                    titre: 'Kenway Saga' },
  { cle: 'HELIX & ABSTERGO SAGA',          titre: 'Helix & Abstergo Saga' },
  { cle: 'LAYLA HASSAN SAGA',              titre: 'Layla Hassan Saga' },
  { cle: 'ANIMUS HUB SAGA',                titre: 'Animus Hub Saga' },
  { cle: 'ASSASSINS TROUGHT HISTORY SAGA', titre: 'Assassins Through History Saga' },
];

/* ── les sept formes de media du document ─────────────────────────── */
const TYPES = {
  'VIDEO GAME': 'jeu',
  'DLC':        'dlc',
  'BOOK':       'roman',
  'COMIC':      'comic',
  'MOVIE':      'film',
  'VIDEO':      'video',
  'AUDIO':      'audio',
};
const NIVEAUX = { jeu: 'must', dlc: 'important' };

const RE_ENTREE = new RegExp(
  '^(' + Object.keys(TYPES).join('|') + ')\\s+(FLASHBACK|FLASHFORWARD)?\\s*(.+)$');

/* ── decoupe d'une ligne d'entree ─────────────────────────────────────
   « VIDEO GAME 1191 (2007) Assassin's Creed » se lit en trois morceaux :
   la date dans l'univers, l'annee de sortie entre parentheses, le titre.
   Trois entrees n'ont pas de date d'univers, quatre n'ont pas d'annee de
   sortie ; c'est la parenthese qui tranche, et a defaut le mot
   « Assassin », par lequel tous les titres sans parenthese commencent.  */
function decoupe(reste) {
  const paren = reste.match(/\(([^)]*\d[^)]*)\)/);
  if (paren) {
    return {
      date:    reste.slice(0, paren.index).trim(),
      sortie:  paren[1].trim(),
      title:   reste.slice(paren.index + paren[0].length).trim(),
    };
  }
  const i = reste.search(/Assassin[’']s Creed/);
  if (i < 0) throw new Error('titre introuvable : ' + reste);
  return { date: reste.slice(0, i).trim(), sortie: '', title: reste.slice(i).trim() };
}

/* ── identifiants : le titre, ampute de la marque, resserre a trois mots
   au plus, puis numerote. « Assassin's Creed II » revient trois fois dans
   le document — c'est le meme jeu, coupe par ses DLC — et ses trois
   entrees doivent porter trois identifiants distincts.                */
const compte = {};
const REPLI = { jeu: 'game', film: 'movie', roman: 'book', comic: 'comic',
                dlc: 'dlc', video: 'video', audio: 'audio' };
function identifiant(title, type) {
  /* L'identifiant est une ancre d'URL (`/assassinscreed#ac-mirage-1`) : les
     diacritiques et les apostrophes n'y ont rien a faire. « Dawn of
     Ragnarök » rendait `ac-dawn-of-ragnarök-1`, et « Geirmund's Saga » un
     `-s-` sorti de son apostrophe. */
  let s = title
    .replace(/Assassin[’']s Creed:?\s*/i, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-')
    .toLowerCase();
  /* Deux entrees s'appellent « Assassin's Creed » tout court : le jeu de
     2007 et le film de 2016. Leur forme les separe. */
  if (!s) s = REPLI[type] || 'ac';
  compte[s] = (compte[s] || 0) + 1;
  return 'ac-' + s + '-' + compte[s];
}

/* ── lecture ──────────────────────────────────────────────────────── */
const eras = [];
let era = null, courante = null, dansFaq = null;

const iDebut = lignes.findIndex((l) => l.trim() === SAGAS[0].cle);
if (iDebut < 0) throw new Error('premiere saga introuvable');

for (let i = iDebut; i < lignes.length; i++) {
  const l = lignes[i];
  const t = l.trim();
  if (!t) { dansFaq = null; continue; }

  const saga = SAGAS.find((s) => s.cle === t);
  if (saga) {
    era = { title: saga.titre, phase: 'SAGA ' + (eras.length + 1), entries: [] };
    eras.push(era);
    courante = null; dansFaq = null;
    continue;
  }

  const m = t.match(RE_ENTREE);
  if (m && era) {
    const { date, sortie, title } = decoupe(m[3]);
    const type = TYPES[m[1]];
    courante = {
      id: identifiant(title, type),
      type,
      level: NIVEAUX[type] || 'bonus',
      title,
      date: date || '',
      released: sortie || '',
    };
    if (m[2]) courante.tags = [m[2].toLowerCase()];
    era.entries.push(courante);
    dansFaq = null;
    continue;
  }

  if (!courante) continue;

  /* La FAQ du guide est unique en son genre : une seule question, la meme
     partout — qui revit ces souvenirs au present ? — et une reponse d'une
     ligne. Neuf entrees la posent avec la mention SPOILERS, qui est une
     seconde question et non une note dans la reponse. */
  if (/^FAQ\s*:/i.test(t)) {
    dansFaq = /SPOILERS\s*$/i.test(t) ? 'animusSpoiler' : 'animus';
    continue;
  }
  if (dansFaq) {
    courante.faq = courante.faq || {};
    courante.faq[dansFaq] = t;
    dansFaq = null;
    continue;
  }
  /* tout le reste est une note de placement ou un conseil de jeu */
  (courante.notes = courante.notes || []).push(t);
}

const ALL = eras.flatMap((e) => e.entries);

/* ── les visuels, quand le depannage RAWG/TMDB en a trouve ────────────
   Meme situation que Dragon Age a sa naissance : les WebP locaux n'existent
   pas encore, et les URL d'API tiennent la place en attendant. La regle
   « WebP local x4 » vaut des que Niko pose ses fichiers.               */
let visuels = {};
try { visuels = JSON.parse(fs.readFileSync(VISUELS, 'utf8')); } catch (_) {}
for (const e of ALL) {
  const v = visuels[e.id];
  if (!v) continue;
  if (v.img)  e.img = v.img;
  if (v.tmdb) e.tmdb = String(v.tmdb);
  if (v.desc) e.desc = v.desc;
}
for (const e of ALL) {
  if (!e.tmdb) e.tmdb = '0';
  e.media = e.type === 'film' ? 'movie' : (e.type === 'jeu' || e.type === 'dlc') ? 'game' : 'tv';
}

/* ── l'accroche, les reperes de lecture, les exclusions ───────────────
   Tout ce bloc sort du document, phrase par phrase. Les trois intitules du
   depliant sont ses propres intertitres, repasses en casse de phrase.   */
function texte(depuis, jusqua) {
  const a = lignes.findIndex((l) => l.trim() === depuis);
  const b = lignes.findIndex((l, i) => i > a && l.trim() === jusqua);
  return lignes.slice(a + 1, b < 0 ? lignes.length : b)
    .map((l) => l.trim()).filter(Boolean);
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const accroche = lignes.slice(2, 5).map((l) => l.trim()).filter(Boolean);
const premiere = lignes[5].trim();   // « This guide works best for first-time plays. »

const SVG_CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>';
const SVG_HOR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 8v5l3 2"/></svg>';
const SVG_MAN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/></svg>';
const SVG_CHK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const SVG_CHV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

function cle(titre, svg, paras) {
  return '<div class="key"><div class="key-h">' + svg + esc(titre) + '</div>' +
    paras.map((p) => '<p>' + esc(p) + '</p>').join('') + '</div>';
}

/* « WHAT LEFT OUT ? » : sept lignes « sujet : raison », coupees au premier
   deux-points, exactement comme la liste de Dragon Age.                */
const coupes = texte('WHAT LEFT OUT ?', 'FILTERS, SEARCH AND LEGEND').map((l) => {
  const i = l.indexOf(' : ');
  return i < 0 ? { dt: l, dd: '' } : { dt: l.slice(0, i).trim(), dd: l.slice(i + 3).trim() };
});

const notes =
  '<p class="intro-lead">' + esc(accroche.join(' ')) + '</p>' +
  '<div class="intro-tags"><span class="itag">' + SVG_CHK + esc(premiere) + '</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
    cle('The calendar', SVG_CAL, texte('THE CALENDAR', 'FLASHBACKS AND FLASHFOWARDS')) +
    cle('Flashbacks and flashforwards', SVG_HOR, texte('FLASHBACKS AND FLASHFOWARDS', 'GAMES ORDER')) +
    cle('Games order', SVG_MAN, texte('GAMES ORDER', 'WHAT LEFT OUT ?')) +
  '</div>' +
  '<details class="cuts"><summary>What&#x27;s left out and why?<span class="n">' +
    coupes.length + ' entries</span>' + SVG_CHV + '</summary><div class="cuts-body">' +
    '<dl class="cuts-list">' + coupes.map((c) =>
      '<div class="cut"><dt>' + esc(c.dt) + '</dt><dd>' + esc(c.dd) + '</dd></div>').join('') +
    '</dl></div></details>';

/* ── les cinq badges ──────────────────────────────────────────────────
   Aucun document n'en porte. Ils suivent les quatre porteurs de l'Animus
   que le guide nomme lui-meme dans ses reponses de FAQ — Desmond, les
   employes d'Abstergo, Layla — et le cinquieme couronne le tout.       */
const idsDe = (f) => ALL.filter(f).map((e) => e.id);
const idsSaga = (i) => eras[i].entries.map((e) => e.id);

const badges = [
  { id: 'ac_desmond',  icon: '🗡️', color: '#c0202f', trigger: 'oeuvre',
    ids: [...idsSaga(0), ...idsSaga(1)],
    label: 'The Assassin\u2019s Blood', desc: 'The Altaïr and Ezio sagas completed' },
  { id: 'ac_kenway',   icon: '🏴', color: '#4dd0e1', trigger: 'oeuvre',
    ids: idsSaga(2), label: 'Kenway\u2019s Fleet', desc: 'The Kenway saga completed' },
  { id: 'ac_helix',    icon: '🧬', color: '#8fb8de', trigger: 'oeuvre',
    ids: idsSaga(3), label: 'Helix Initiate', desc: 'The Helix & Abstergo saga completed' },
  { id: 'ac_isu',      icon: '📜', color: '#a99cf9', trigger: 'oeuvre',
    ids: idsDe((e) => e.type === 'roman' || e.type === 'comic'),
    label: 'Keeper of the Codex', desc: 'Every book and comic completed' },
  { id: 'ac_nothing',  icon: '🔺', color: '#ffd700', trigger: '100pct', ids: [],
    label: 'Nothing Is True', desc: 'Assassin\u2019s Creed 100% completed' },
];
badges.forEach((b) => { b.universe = 'assassinscreed'; });

/* ── l'ossature CG, reprise de Dragon Age et corrigee pour cet univers ─ */
const modele = fs.readFileSync(path.join(ICI, 'data-dragonage-en.js'), 'utf8');
const bac = { window: {} };
new Function('window', modele)(bac.window);
const CG = bac.window.CG;

CG.universe = 'assassinscreed';
CG.t.nav.assassinscreed = 'Assassin\u2019s Creed';
CG.t.hideDone = 'Hide played';
CG.t.resetDA = undefined; delete CG.t.resetDA;
CG.resetMsg = 'Reset your Assassin\u2019s Creed progress?';
CG.badgeLabels = {
  jeu:   ['bj',  'VIDEO GAME'],
  dlc:   ['bd',  'DLC'],
  roman: ['br',  'BOOK'],
  comic: ['bc',  'COMIC'],
  film:  ['bf',  'MOVIE'],
  video: ['bv',  'VIDEO'],
  audio: ['bau', 'AUDIO'],
};
CG.markLabels = { flashback: 'FLASHBACK', flashforward: 'FLASHFORWARD' };
CG.faqCats = [
  { key: 'animus',        q: 'Who experiences the memories in the present days?' },
  { key: 'animusSpoiler', q: 'Who experiences the memories in the present days? SPOILERS' },
];
CG.badges = badges;

/* ── le descripteur d'univers ─────────────────────────────────────── */
const DATA = {
  id: 'assassinscreed',
  title: 'Assassin\u2019s Creed',
  subtitle: 'Chronological Timeline',
  description: 'Games · DLC · Books · Comics',
  color: '#c0202f',
  glow: 'rgba(192,32,47,.35)',
  notes,
  eras: eras.map((e, i) => ({
    title: e.title,
    phase: e.phase,
    ink: i + 1,
    entries: e.entries.map((x) => {
      const o = { id: x.id, type: x.type, level: x.level, tmdb: x.tmdb, media: x.media,
                  title: x.title, date: x.date };
      if (x.img)      o.img = x.img;
      if (x.tags)     o.tags = x.tags;
      if (x.notes)    o.notes = x.notes;
      if (x.desc)     o.desc = x.desc;
      if (x.faq)      o.faq = x.faq;
      if (x.released) o.released = x.released;
      return o;
    }),
  })),
};

/* ── garde-fous ───────────────────────────────────────────────────────
   Chacun est ne d'un mode de defaillance silencieux du depot : une lecture
   qui rend zero passe pour un feu vert, et une entree perdue ne leve rien. */
const erreurs = [];
if (eras.length !== 7) erreurs.push('sagas lues : ' + eras.length + ', attendu 7');
if (ALL.length < 100) erreurs.push('entrees lues : ' + ALL.length + ', trop peu');
const vus = new Set();
for (const e of ALL) {
  if (vus.has(e.id)) erreurs.push('identifiant double : ' + e.id);
  vus.add(e.id);
  if (!e.title) erreurs.push('titre vide : ' + e.id);
  if (!TYPES[Object.keys(TYPES).find((k) => TYPES[k] === e.type)])
    erreurs.push('type inconnu : ' + e.type);
}
/* Le titre ne doit jamais avoir avale la date ni l'annee de sortie : c'est
   la faute que la decoupe peut commettre sans rien casser. */
for (const e of ALL) {
  if (/^\d|^~|^\(/.test(e.title)) erreurs.push('titre commencant par une date : ' + e.title);
}
if (erreurs.length) { console.error('ERREURS :\n- ' + erreurs.join('\n- ')); process.exit(1); }

/* ── bilan ────────────────────────────────────────────────────────── */
const parType = {};
ALL.forEach((e) => { parType[e.type] = (parType[e.type] || 0) + 1; });
const parNiveau = {};
ALL.forEach((e) => { parNiveau[e.level] = (parNiveau[e.level] || 0) + 1; });

console.log('Assassin\u2019s Creed — ' + ALL.length + ' entrees, ' + eras.length + ' sagas');
eras.forEach((e, i) => console.log('  ' + (i + 1) + '. ' + e.title.padEnd(34) + e.entries.length));
console.log('  types   : ' + Object.entries(parType).map(([k, v]) => k + ' ' + v).join(', '));
console.log('  niveaux : ' + Object.entries(parNiveau).map(([k, v]) => k + ' ' + v).join(', '));
console.log('  FAQ     : ' + ALL.filter((e) => e.faq).length +
            ' (dont ' + ALL.filter((e) => e.faq && e.faq.animusSpoiler).length + ' avec SPOILERS)');
console.log('  notes   : ' + ALL.filter((e) => e.notes).length);
console.log('  reperes : ' + ALL.filter((e) => e.tags).length);
console.log('  visuels : ' + ALL.filter((e) => e.img).length + ' / ' + ALL.length);
console.log('  exclus  : ' + coupes.length);

if (CHECK) { console.log('\n--check : rien ecrit.'); process.exit(0); }

/* ── ecriture ─────────────────────────────────────────────────────── */
const entete = `/* Donnees de la timeline Assassin's Creed, ecrites depuis le document de
   Niko « ac.txt » par \`construire-assassinscreed.mjs\`. Les textes affiches
   en sont decoupes mot pour mot : accroche, reperes de lecture, titres,
   dates, notes de placement, reponses de FAQ et raisons d'exclusion. Rien
   n'y est reformule — ce fichier ne s'edite pas a la main, on corrige le
   script et on le rejoue.

   Quatrieme page dont la source est anglaise, apres Star Trek, The Walking
   Dead et Dragon Age : le francais reste a ecrire.

   La FAQ de ce guide n'a qu'une question, la meme partout : qui revit ces
   souvenirs au present ? Neuf entrees la posent avec la mention SPOILERS,
   qui est une seconde question et non une note dans la reponse — d'ou les
   deux cles de \`faqCats\`.

   Pas de table RT : un guide de jeux video n'a pas de duree a sommer, meme
   raison qu'Avatar Legends et Dragon Age. */
`;

fs.writeFileSync(SORTIE,
  entete +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.ASSASSINSCREED=' + JSON.stringify(DATA) + ';\n',
  { encoding: 'utf8' });

console.log('\nEcrit : ' + path.relative(process.cwd(), SORTIE));
