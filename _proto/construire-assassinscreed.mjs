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

   Les niveaux viennent du document depuis le 24 aout 2026 : chaque ligne
   d'entree s'ouvre sur E, I ou O — Essential, Important, Optional. Ils
   etaient auparavant deduits du type de media, ce qui donnait « tous les
   jeux essentiels » ; le document dit autre chose, et c'est lui qui tranche.

   L'annee entre parentheses n'est PAS l'annee de sortie de l'oeuvre :
   c'est la date du PRESENT, celle du cadre Animus. « Assassin's Creed:
   Bloodlines » est sorti en 2009 et porte (2012), parce que Desmond revit
   ce souvenir en 2012. Tout le guide est bati sur cette ligne du present
   (« This guide in based on the present timeline »), et la page l'affiche
   donc a cote de la date dans l'univers. Elle etait lue mais jetee : le
   champ s'appelait `released` et rien ne l'affichait.

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
const DESCS = path.join(ICI, 'desc-assassinscreed.json');
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
/* Les trois niveaux du document, tels que sa legende les nomme :
   « Levels : Essential / important / optional ». */
const NIVEAUX = { E: 'must', I: 'important', O: 'bonus' };

const RE_ENTREE = new RegExp(
  '^([EIO])\\s+(' + Object.keys(TYPES).join('|') + ')\\s+' +
  '(FLASHBACK|FLASHFORWARD)?\\s*(.+)$');

/* ── decoupe d'une ligne d'entree ─────────────────────────────────────
   « VIDEO GAME 1191 (2012) Assassin's Creed » se lit en trois morceaux :
   la date dans l'univers, la date du present entre parentheses, le titre.
   Trois entrees n'ont pas de date d'univers, une trentaine n'ont pas de
   date de present ; c'est la parenthese qui tranche, et a defaut le mot
   « Assassin », par lequel tous les titres sans parenthese commencent.

   La parenthese porte parfois une plage (« 2007-2012 », « 1998-2000 ») ou
   une approximation (« ~2081 ») : elle est reprise telle quelle, jamais
   ramenee a une annee.                                                  */
function decoupe(reste) {
  const paren = reste.match(/\(([^)]*\d[^)]*)\)/);
  if (paren) {
    return {
      date:    reste.slice(0, paren.index).trim(),
      present: paren[1].trim(),
      title:   reste.slice(paren.index + paren[0].length).trim(),
    };
  }
  const i = reste.search(/Assassin[’']s Creed/);
  if (i < 0) throw new Error('titre introuvable : ' + reste);
  return { date: reste.slice(0, i).trim(), present: '', title: reste.slice(i).trim() };
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
    const { date, present, title } = decoupe(m[4]);
    const type = TYPES[m[2]];
    courante = {
      id: identifiant(title, type),
      type,
      level: NIVEAUX[m[1]],
      title,
      date: date || '',
      present: present || '',
    };
    if (m[3]) courante.tags = [m[3].toLowerCase()];
    era.entries.push(courante);
    dansFaq = null;
    continue;
  }

  if (!courante) continue;

  /* La FAQ du guide est unique en son genre : une seule question, la meme
     partout — qui revit ces souvenirs au present ? — et une reponse d'une
     ligne. Quatre entrees la posent avec la mention SPOILERS, qui est une
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
  /* Une note qui n'est qu'une URL est un lien, pas une remarque. Le document
     pose l'adresse en clair — « PART 1 https://… » pour les deux moities
     d'Abstergo Hacked, l'adresse nue pour Liberation, Russia et le programme
     d'entrainement des Animi. Ecrite telle quelle sous le titre, elle donnait
     une ligne d'URL brute qu'on ne peut pas cliquer ; elle part au depliant,
     avec les bandes-annonces, ou un lien est un lien. Le libelle est le
     prefixe du document quand il y en a un (« PART 1 »), le libelle commun
     sinon. */
  const url = t.match(/^(.*?)(https?:\/\/\S+)$/);
  if (url) {
    (courante.links = courante.links || []).push({
      href:  url[2],
      label: url[1].trim() ? casse(url[1].trim()) : 'Watch the video',
    });
    continue;
  }
  /* tout le reste est une note de placement ou un conseil de jeu */
  (courante.notes = courante.notes || []).push(t);
}

/* « PART 1 » -> « Part 1 » : le document ecrit ses prefixes en capitales,
   comme ses intertitres, et le bouton du depliant se lit en casse de phrase
   comme « YouTube trailer » juste a cote. */
function casse(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const ALL = eras.flatMap((e) => e.entries);

/* ── la seule phrase du document reformulee ───────────────────────────
   Elle designait un endroit qui n'existe plus. La note de Liberation disait
   « look at the video just beneath » quand l'adresse YouTube etait posee en
   clair a la ligne suivante ; les URL partent maintenant au depliant, et la
   phrase renvoyait a du vide. Reformulation validee par Niko le 24 aout
   2026 — trois mots changes, le reste mot pour mot.

   Elle vit ici et non dans `ac.txt` : le document est sa source, il se
   reexporte, et une retouche faite dedans se perdrait au prochain rescan
   sans rien signaler. La table sort en erreur si sa phrase ne se retrouve
   plus — c'est ce qui dira que le document a bouge. */
const REFORMULATIONS = [{
  de: 'look at the video just beneath',
  a:  'look at the video in the panel below',
}];
for (const r of REFORMULATIONS) {
  r.vu = 0;
  for (const e of ALL) {
    if (!e.notes) continue;
    e.notes = e.notes.map((n) => {
      if (!n.includes(r.de)) return n;
      r.vu++;
      return n.replace(r.de, r.a);
    });
  }
}

/* ── l'avertissement ──────────────────────────────────────────────────
   Une note qui porte ses trois points d'exclamation n'est pas une remarque
   de placement, c'est une consigne : « Not Resynced !!! (yet...) » dit que
   Black Flag n'a pas encore sa version refaite, et il faut le voir avant
   d'ouvrir la fiche. Meme traitement que « Ultimate Edition version!!! »
   sur Batman v Superman, dont la page DC tire son `bignote` : plein,
   accentue, precede du drapeau. Une seule entree du guide en porte. */
for (const e of ALL) {
  if (!e.notes) continue;
  const i = e.notes.findIndex((n) => n.includes('!!!'));
  if (i < 0) continue;
  e.bignote = e.notes[i];
  e.notes.splice(i, 1);
  if (!e.notes.length) delete e.notes;
}

/* ── les visuels, quand le depannage RAWG/TMDB en a trouve ────────────
   Meme situation que Dragon Age a sa naissance : les WebP locaux n'existent
   pas encore, et les URL d'API tiennent la place en attendant. La regle
   « WebP local x4 » vaut des que Niko pose ses fichiers.

   Le JSON est indexe par identifiant, et l'identifiant porte un rang
   (`ac-ii-2`) : une entree ajoutee au document decale tout ce qui la suit
   et colle l'affiche du voisin. C'est le piege d'appariement du depot, en
   plus discret encore — une image fausse ne leve rien. Chaque visuel porte
   donc le titre qu'il decrivait, et un titre qui ne correspond plus fait
   sortir le script en erreur plutot que d'ecrire l'image d'a cote.      */
let visuels = {};
try { visuels = JSON.parse(fs.readFileSync(VISUELS, 'utf8')); } catch (_) {}
const desaccords = [];
for (const e of ALL) {
  const v = visuels[e.id];
  if (!v) continue;
  if (v.title && v.title !== e.title) {
    desaccords.push(e.id + ' : visuel « ' + v.title +' », entree « ' + e.title + ' »');
    continue;
  }
  if (v.img)  e.img = v.img;
  if (v.tmdb) e.tmdb = String(v.tmdb);
  if (v.desc) e.desc = v.desc;
}
/* ── les resumes des romans, comics, videos et de la fiction audio ────
   Ni RAWG ni TMDB ne les couvrent, et la page n'a donc rien a ouvrir sur
   leur fiche : elle affichait « No synopsis available » sur cinquante-cinq
   entrees. `descriptions-assassinscreed.py` les recolte une fois sur le
   wiki AC, comme Dragon Age le fait sur le sien, et le JSON garde le titre
   qu'il decrivait — meme garde-fou que les visuels, meme raison. */
let descs = {};
try { descs = JSON.parse(fs.readFileSync(DESCS, 'utf8')); } catch (_) {}
for (const e of ALL) {
  const d = descs[e.id];
  if (!d || !d.desc) continue;
  if (d.title && d.title !== e.title) {
    desaccords.push(e.id + ' : resume « ' + d.title + ' », entree « ' + e.title + ' »');
    continue;
  }
  e.desc = d.desc;
}

for (const e of ALL) {
  if (!e.tmdb) e.tmdb = '0';
  e.media = e.type === 'film' ? 'movie' : (e.type === 'jeu' || e.type === 'dlc') ? 'game' : 'tv';
}

/* ── l'accroche, les reperes de lecture, les exclusions ───────────────
   Tout ce bloc sort du document, phrase par phrase. Les trois intitules du
   depliant sont ses propres intertitres, repasses en casse de phrase.   */
/* Les intertitres du document sont retrouves a la ligne exacte. Une lecture
   qui ne trouve pas son intertitre ne doit pas rendre le document entier ni
   la liste vide : c'est le mode de defaillance du depot — un bloc muet qui
   passe pour un feu vert. « WHAT LEFT OUT ? » est devenu « WHAT'S LEFT
   OUT ? » le 24 aout 2026, et la lecture rendait alors tout le fichier. */
function texte(depuis, jusqua) {
  const a = lignes.findIndex((l) => l.trim() === depuis);
  if (a < 0) throw new Error('intertitre introuvable : ' + depuis);
  const b = lignes.findIndex((l, i) => i > a && l.trim() === jusqua);
  if (b < 0) throw new Error('intertitre introuvable : ' + jusqua);
  return lignes.slice(a + 1, b).map((l) => l.trim()).filter(Boolean);
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
const coupes = texte("WHAT'S LEFT OUT ?", 'FILTERS, SEARCH AND LEGEND').map((l) => {
  const i = l.indexOf(' : ');
  return i < 0 ? { dt: l, dd: '' } : { dt: l.slice(0, i).trim(), dd: l.slice(i + 3).trim() };
});

const notes =
  '<p class="intro-lead">' + esc(accroche.join(' ')) + '</p>' +
  '<div class="intro-tags"><span class="itag">' + SVG_CHK + esc(premiere) + '</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
    cle('The calendar', SVG_CAL, texte('THE CALENDAR', 'FLASHBACKS AND FLASHFOWARDS')) +
    cle('Flashbacks and flashforwards', SVG_HOR, texte('FLASHBACKS AND FLASHFOWARDS', 'GAMES ORDER')) +
    cle('Games order', SVG_MAN, texte('GAMES ORDER', "WHAT'S LEFT OUT ?")) +
  '</div>' +
  '<details class="cuts"><summary>What&#x27;s left out and why?<span class="n">' +
    coupes.length + ' entries</span>' + SVG_CHV + '</summary><div class="cuts-body">' +
    '<dl class="cuts-list">' + coupes.map((c) =>
      '<div class="cut"><dt>' + esc(c.dt) + '</dt><dd>' + esc(c.dd) + '</dd></div>').join('') +
    '</dl></div></details>';

/* ── les sept badges ──────────────────────────────────────────────────
   Aucun document n'en porte. Ils suivent les porteurs de l'Animus que le
   guide nomme lui-meme dans ses reponses de FAQ — Desmond, les employes
   d'Abstergo, Layla, l'utilisateur de l'Animus EGO — et le dernier couronne
   le tout.                                                              */
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
  /* La cinquieme saga est la plus longue du guide — 39 entrees, d'Origins
     a Mirage — et elle n'avait pas de badge : les quatre premiers
     couvraient les quatre premieres sagas, et le cinquieme comptait les
     livres. Layla Hassan porte le Baton d'Hermes Trismegiste, qui est ce
     que ses trois jeux ont en commun ; l'encre est le sable de l'Antiquite,
     la seule libre a cote des quatre autres. */
  { id: 'ac_layla',    icon: '🏛️', color: '#e0a45c', trigger: 'oeuvre',
    ids: idsSaga(4), label: 'Bearer of the Staff',
    desc: 'The Layla Hassan saga completed' },
  /* La sixieme saga en a un, la septieme non, et c'est un arbitrage de Niko
     du 24 aout 2026 : l'Animus Hub est une epoque du recit — sept entrees,
     un porteur, une place dans la ligne du present — la ou « Assassins
     Through History » est un fourre-tout de quatre entrees qui n'ont
     justement pas d'epoque. On ne decerne pas un badge pour avoir lu ce qui
     ne se range nulle part. L'encre est le violet numerique de l'ere 6,
     remonte pour se lire sur le noir, et le libelle vient de la reponse de
     FAQ du guide : « Animus EGO user ». */
  { id: 'ac_hub',      icon: '🌐', color: '#c07bf0', trigger: 'oeuvre',
    ids: idsSaga(5), label: 'Animus EGO User',
    desc: 'The Animus Hub saga completed' },
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
/* La mesure que ce guide-ci a en propre : l'annee du present, celle depuis
   laquelle le souvenir est revecu. Elle vient a cote de `mPeriod`, qui reste
   la date dans l'univers. */
CG.t.mPresent = 'Present day';
/* La date qui se lit en grand sur la carte est celle du present, et celle de
   l'univers vient a cote dans son encadre : ce sont les souvenirs qu'on
   revit depuis cette annee-la. D'ou l'intitule, qui n'est pas « Period ».
   `mPeriod` reste, lui, dans les mesures du depliant. */
CG.t.mMemories = 'Memories';
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
      if (x.bignote)  o.bignote = x.bignote;
      if (x.links)    o.links = x.links;
      if (x.desc)     o.desc = x.desc;
      if (x.faq)      o.faq = x.faq;
      if (x.present)  o.present  = x.present;
      return o;
    }),
  })),
};

/* ── garde-fous ───────────────────────────────────────────────────────
   Chacun est ne d'un mode de defaillance silencieux du depot : une lecture
   qui rend zero passe pour un feu vert, et une entree perdue ne leve rien. */
const erreurs = [];
for (const d of desaccords) erreurs.push('visuel decale — ' + d);
if (eras.length !== 7) erreurs.push('sagas lues : ' + eras.length + ', attendu 7');
/* Le document pose un niveau par entree : aucune ne doit sortir sans. */
for (const e of ALL) if (!e.level) erreurs.push('sans niveau : ' + e.id);
if (ALL.length < 100) erreurs.push('entrees lues : ' + ALL.length + ', trop peu');
const vus = new Set();
for (const e of ALL) {
  if (vus.has(e.id)) erreurs.push('identifiant double : ' + e.id);
  vus.add(e.id);
  if (!e.title) erreurs.push('titre vide : ' + e.id);
  if (!TYPES[Object.keys(TYPES).find((k) => TYPES[k] === e.type)])
    erreurs.push('type inconnu : ' + e.type);
}
/* Une reformulation qui ne trouve plus sa phrase n'est pas un detail : soit
   le document l'a reecrite, soit il l'a retiree, et dans les deux cas la
   table ment sur ce qu'elle fait. */
for (const r of REFORMULATIONS) {
  if (!r.vu) erreurs.push('reformulation sans emploi : « ' + r.de + ' »');
}
/* Une URL restee dans une note ressort en clair sous le titre, non
   cliquable, et rien ne le signale : c'est exactement ce que la sortie des
   liens vient corriger. */
for (const e of ALL) {
  for (const n of (e.notes || [])) if (/https?:\/\//.test(n)) erreurs.push('URL restee en note : ' + e.id);
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
console.log('  liens   : ' + ALL.reduce((s, e) => s + (e.links ? e.links.length : 0), 0) +
            ' sur ' + ALL.filter((e) => e.links).length + ' entree(s)');
console.log('  alertes : ' + ALL.filter((e) => e.bignote).length);
console.log('  reperes : ' + ALL.filter((e) => e.tags).length);
console.log('  present : ' + ALL.filter((e) => e.present).length + ' / ' + ALL.length);
console.log('  visuels : ' + ALL.filter((e) => e.img).length + ' / ' + ALL.length);
console.log('  resumes : ' + ALL.filter((e) => e.desc).length + ' / ' + ALL.length);
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
   souvenirs au present ? Quatre entrees la posent avec la mention SPOILERS,
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
