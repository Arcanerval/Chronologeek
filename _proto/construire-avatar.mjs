/* Construit _proto/data-avatar.js a partir de deux sources et de rien d'autre.
 *
 *   avatar.html        la page de prod : synopsis, ISBN, images, identifiants TMDB
 *   spec-avatar.json   la timeline telle que Niko l'a ecrite : ordre, dates, niveaux
 *
 * Le script ne REDIGE jamais. Il deplace des textes deja ecrits, et il s'arrete
 * des qu'il devrait en inventer un. Les titres affiches sont ceux de la spec,
 * verbatim ; les synopsis sont ceux de la prod, verbatim. Toute entree sans
 * synopsis est signalee, jamais comblee.
 *
 *   node _proto/construire-avatar.mjs           ecrit data-avatar.js
 *   node _proto/construire-avatar.mjs --check   n'ecrit rien, affiche le bilan
 */

import fs from 'fs';
import path from 'path';

const RACINE = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const erreurs = [], alertes = [];

/* ---------------------------------------------------------------- la prod --
 * DATA_AVATAR est un litteral JS, pas du JSON : cles nues, apostrophes dans
 * les valeurs, gabarits multilignes. On borne l'objet en suivant l'etat reel
 * du source — code, chaine, gabarit, commentaire — plutot qu'au premier '}'
 * rencontre, qui tombe au milieu du premier synopsis.
 */
function litObjetJS(src, apres) {
  const BS = String.fromCharCode(92);
  const debut = src.indexOf(apres) + apres.length;
  let prof = 0, i = debut, etat = 'code', quote = '';
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1];
    if (etat === 'code') {
      if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; quote = c; }
      else if (c === '/' && src[i + 1] === '/') etat = 'ligne';
      else if (c === '/' && src[i + 1] === '*') etat = 'bloc';
      else if (c === '{' || c === '[') prof++;
      else if (c === '}' || c === ']') { prof--; if (prof === 0) { i++; break; } }
    } else if (etat === 'chaine') { if (c === quote && p !== BS) etat = 'code'; }
    else if (etat === 'ligne') { if (c === '\n') etat = 'code'; }
    else if (etat === 'bloc') { if (c === '/' && p === '*') etat = 'code'; }
  }
  return eval('(' + src.slice(debut, i) + ')');
}

const htmlProd = fs.readFileSync(path.join(RACINE, 'avatar.html'), 'utf8');
const PROD = litObjetJS(htmlProd, 'const DATA_AVATAR=');

const parTitre = new Map();
const episodes = new Map();               // "1x07" -> entree de la prod
for (const ere of PROD.eras) for (const e of ere.entries) {
  if (parTitre.has(e.title)) erreurs.push(`prod : deux entrees s'appellent « ${e.title} »`);
  parTitre.set(e.title, e);
  const m = e.title.match(/^(\d)×(\d\d)\s·\s/);
  if (m) episodes.set(m[1] + 'x' + m[2], e);
}

/* ------------------------------------------------------------------ la spec */
const SPEC = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'spec-avatar.json'), 'utf8'));
if (!SPEC.serie) erreurs.push('spec : la cle « serie » manque — les blocs d\'episodes n\'ont pas de titre');

/* Cinq types, ceux des filtres de Niko. `livre` de la prod (artbooks et guides)
 * rejoint `roman`, et son `film` devient `filmanim` : Avatar Aang est un film
 * d'animation. Un type hors de cette table arrete le script. */
const TYPES = { roman: 'roman', livre: 'roman', comic: 'comic', anime: 'anime', film: 'filmanim', video: 'video' };
const AUTORISES = new Set(['roman', 'comic', 'anime', 'filmanim', 'video']);
const AVEC_LANG = new Set(['roman', 'comic', 'video']);   // convention de la prod

/* avatar.html vit a la racine et ecrit « images/suki.webp » ; le proto vit dans
 * _proto/ et resoudrait ce chemin en _proto/images/suki.webp. On absolutise. */
const abs = p => /^(?:https?:|\/)/.test(p) ? p : '/' + p.replace(/^\.?\//, '');

const slug = s => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, '').replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

const vus = new Set(), reprises = [], ecrits = [];
/* Les badges de badges.js pointent l'episode qui clot un Livre — « avt-1x20 ».
 * Le proto ne descend pas jusqu'a l'episode : il pose un bloc. Cette table dit
 * dans quel bloc chaque episode a atterri, pour reporter les badges dessus. */
const blocDe = new Map();
const eras = [];

for (const ereSpec of SPEC.eras) {
  const entries = [];
  for (const s of ereSpec.entries) {
    const e = {};

    if (s.bloc) {
      /* Un bloc d'episodes. Les titres d'episodes ne sont pas affiches : aucune
       * timeline du site ne les a jamais montres. La mise en page est celle de
       * Marvel et de DC — l'entree porte le nom de la serie et un sous-item
       * unique, « Saison 1 Episodes 1-10 », comme « Saison 1 Épisodes 1-7 »
       * chez les Agents du S.H.I.E.L.D. ou « Saison 1 » chez Daredevil. Les
       * episodes de la prod servent encore a deux choses : verifier que le bloc
       * couvre des episodes reels, et reporter les badges (voir blocDe). */
      const [saison, a, b] = s.bloc;
      e.id = `avt-s${saison}e${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
      for (let n = a; n <= b; n++) {
        const k = saison + 'x' + String(n).padStart(2, '0');
        const ep = episodes.get(k);
        if (!ep) { erreurs.push(`bloc « ${s.t} » : l'episode ${k} est absent de avatar.html`); continue; }
        blocDe.set(ep.id, e.id);
      }
      const premier = episodes.get(saison + 'x' + String(a).padStart(2, '0'));
      e.type = 'anime';
      if (premier) { e.tmdb = premier.tmdb; e.media = premier.media; if (premier.img) e.img = abs(premier.img); }
      e.subitems = [s.t];

    } else if (s.prod) {
      const p = parTitre.get(s.prod);
      if (!p) { erreurs.push(`« ${s.t} » : aucune entree « ${s.prod} » dans avatar.html`); continue; }
      const t = TYPES[p.type];
      if (!t) { erreurs.push(`« ${s.t} » : type inconnu « ${p.type} » en prod`); continue; }
      e.id = p.id;
      e.type = t;
      if (p.tmdb) e.tmdb = p.tmdb;
      if (p.media) e.media = p.media;
      if (p.img) e.img = abs(p.img);
      if (p.isbn) e.isbn = p.isbn;
      if (p.ol) e.ol = p.ol;
      if (p.desc) {
        /* La prod glisse parfois un lien YouTube en HTML au bout de son
         * synopsis. La page du proto echappe le texte qu'elle affiche : la
         * balise arrivait en clair a l'ecran, « <a href='https://… ». Le lien
         * devient donc une donnee a part, dont la page fait une ancre. */
        const m = p.desc.match(/^([\s\S]*?)<br>\s*<a href='([^']+)'[^>]*>\s*▶?\s*([^<]+)<\/a>\s*$/);
        e.desc = m ? m[1] : p.desc;
        if (m) e.link = { href: m[2], label: m[3].trim() };
        reprises.push([s.t, e.desc]);
      }

    } else if (s.type) {
      if (!AUTORISES.has(s.type)) { erreurs.push(`« ${s.t} » : type « ${s.type} » hors des cinq filtres`); continue; }
      e.id = 'avt-' + slug(s.t);
      e.type = s.type;
      /* tmdb:"0" + media:"tv" est ce que la prod pose sur ses comics et romans.
       * Sans ces deux cles la fiche appelle TMDB avec undefined. */
      e.tmdb = '0';
      e.media = 'tv';

    } else {
      erreurs.push(`« ${s.t} » : ni prod, ni bloc, ni type — le script ne sait pas quoi en faire`);
      continue;
    }

    e.level = s.lv;
    /* Un bloc d'episodes s'appelle du nom de la serie ; partout ailleurs le
     * titre affiche est celui de la spec, verbatim. */
    e.title = s.bloc ? SPEC.serie : s.t;
    e.date = s.d;
    /* La spec passe devant la prod sur ces deux champs : ses vignettes sont
     * celles que Niko a livrees, et son synopsis celui qu'il vient d'ecrire.
     * Les deux sont verifies plus bas — fichier present, texte retrouve. */
    if (s.img) e.img = abs(s.img);
    /* `false` retire ce que la prod portait : un synopsis que le titre redit
     * maintenant, un lien que Niko ne veut plus. Le distinguer de l'absence de
     * cle evite de recopier en spec un texte de prod pour pouvoir le vider. */
    if (s.desc === false) delete e.desc;
    else if (s.desc) { e.desc = s.desc; ecrits.push([s.t, s.desc]); }
    if (s.link === false) delete e.link;
    else if (s.link !== undefined) erreurs.push(`« ${s.t} » : « link » n'accepte que false`);
    if (s.flash) e.tags = ['flashback'];
    if (AVEC_LANG.has(e.type)) e.lang = s.vo ? 'vo' : 'vf';
    else if (s.vo) alertes.push(`« ${s.t} » est marquee VO mais son type (${e.type}) ne porte pas de mention de langue`);

    if (vus.has(e.id)) erreurs.push(`identifiant en double : ${e.id} (« ${s.t} »)`);
    vus.add(e.id);

    /* Ordre des cles calque sur celui des autres data-*.js du proto. */
    const ORDRE = ['id', 'type', 'level', 'tmdb', 'media', 'img', 'title', 'date', 'lang', 'isbn', 'ol', 'tags', 'note', 'subitems', 'desc', 'link'];
    const range = {};
    for (const k of ORDRE) if (e[k] !== undefined) range[k] = e[k];
    for (const k of Object.keys(e)) if (range[k] === undefined) { range[k] = e[k]; alertes.push(`cle inattendue « ${k} » sur « ${s.t} »`); }
    entries.push(range);
  }
  const ere = { title: ereSpec.title };
  if (ereSpec.group) ere.group = ereSpec.group;
  ere.entries = entries;
  eras.push(ere);
}

/* ------------------------------------------------- garde-fou : les synopsis --
 * Chaque synopsis doit se retrouver a l'identique dans avatar.html. C'est la
 * regle « ne jamais reecrire les textes de Niko » rendue mecanique : si une
 * chaine a ete retouchee en chemin, meme d'un caractere, le script s'arrete.
 */
for (const [titre, desc] of reprises)
  if (!htmlProd.includes(desc))
    erreurs.push(`le synopsis de « ${titre} » ne se retrouve pas mot pour mot dans avatar.html`);

/* --------------------------------------------------- garde-fou : les comptes */
const toutes = eras.flatMap(e => e.entries);

/* --------------------------------------------------- garde-fou : les vignettes
 * Une image absente ne casse rien : le navigateur affiche un cadre vide et la
 * page continue. C'est exactement le mode de defaillance silencieux contre
 * lequel ce script existe — six .jpg supprimes du depot avaient laisse six
 * fiches sans vignette sans qu'aucune console ne le dise.
 */
for (const e of toutes)
  if (e.img && /^\//.test(e.img) && !fs.existsSync(path.join(RACINE, e.img.slice(1))))
    erreurs.push(`vignette introuvable : ${e.img} (« ${e.title} »)`);

/* ---------------------------------------------- garde-fou : pas de HTML en desc
 * La page echappe les synopsis avant de les ecrire. Une balise laissee dans les
 * donnees s'affiche donc en clair au lieu d'agir : c'est ce qui rendait le lien
 * YouTube d'Escape from the Spirit World illisible.
 */
for (const e of toutes)
  if (e.desc && /<[a-z/]/i.test(e.desc))
    erreurs.push(`le synopsis de « ${e.title} » porte du HTML — la page l'afficherait en clair`);
const compte = k => toutes.reduce((m, e) => (m[e[k]] = (m[e[k]] || 0) + 1, m), {});
const niveaux = compte('level'), types = compte('type');
const ATTENDU = { entrees: 69, eres: 8, must: 17, important: 18, bonus: 34 };

if (toutes.length !== ATTENDU.entrees) erreurs.push(`${toutes.length} entrees au lieu de ${ATTENDU.entrees}`);
if (eras.length !== ATTENDU.eres) erreurs.push(`${eras.length} eres au lieu de ${ATTENDU.eres}`);
for (const n of ['must', 'important', 'bonus'])
  if ((niveaux[n] || 0) !== ATTENDU[n]) erreurs.push(`${niveaux[n] || 0} « ${n} » au lieu de ${ATTENDU[n]}`);
for (const t of Object.keys(types)) if (!AUTORISES.has(t)) erreurs.push(`type non autorise en sortie : ${t}`);

/* -------------------------------------------------------------- les libelles --
 * CG.t est lu dans data.js plutot que recopie : les libelles d'interface sont
 * les memes pour toutes les timelines, et une copie aurait divergé au premier
 * ajustement. Seul ce qui est propre a Avatar est remplace.
 */
const globalFactice = {};
(new Function('window', fs.readFileSync(path.join(import.meta.dirname, 'data.js'), 'utf8')))(globalFactice);
const CG = structuredClone(globalFactice.CG);
CG.universe = 'avatar';
/* L'ordre compte : le panneau de filtres se construit en parcourant cette table,
 * et c'est celui que Niko a ecrit — Romans, Serie Animee, Comic, Film Anime, Video.
 * Les libelles restent au singulier et en capitales, comme les badges FILM et
 * SÉRIE des autres pages : ils qualifient une entree, pas une categorie. */
/* « LIVRE » plutot que « ROMAN » : la categorie tient aussi les artbooks et les
 * scrapbooks, qui ne sont pas des romans. Le type reste `roman` dans les
 * donnees — c'est celui de la prod, et le renommer ne changerait qu'ici. */
CG.badgeLabels = {
  roman: ['br', 'LIVRE'], anime: ['ba', 'SÉRIE ANIMÉE'], comic: ['bc', 'COMIC'],
  filmanim: ['bfa', 'FILM ANIMÉ'], video: ['bv', 'VIDÉO']
};
CG.faqCats = [];                       // Avatar n'a pas de FAQ : la prod n'en a pas

/* Les badges sont ceux du site, repris tels quels dans badges.js : « Maître de
 * l'Eau », « Gardien de l'Équilibre ». Rien n'est invente ici, et les libelles
 * anglais de BADGE_EN restent valables puisque les identifiants ne bougent pas.
 * Seuls les `ids` sont traduits : la prod vise l'episode qui clot un Livre,
 * « avt-1x20 », que le proto a fondu dans un bloc. `blocDe` fait le report. */
const BADGE_DEFS = litObjetJS(fs.readFileSync(path.join(RACINE, 'badges.js'), 'utf8'), 'const BADGE_DEFS =');
CG.badges = Object.values(BADGE_DEFS).filter(b => b.universe === 'avatar').map(b => {
  const ids = (b.ids || []).map(id => blocDe.get(id) || id);
  for (const id of ids)
    if (!vus.has(id)) erreurs.push(`badge « ${b.label} » : l'entree ${id} n'est pas dans la timeline`);
  return b.ids ? { ...b, ids } : { ...b };
});
if (!CG.badges.length) erreurs.push('badges.js ne definit aucun badge Avatar');
CG.resetMsg = CG.t.resetAvatar || 'Réinitialiser la progression Avatar ?';
delete CG.t.resetSW; delete CG.t.resetMCU; delete CG.t.resetDC; delete CG.t.resetDos;
CG.t.resetAvatar = 'Effacer toute ta progression Avatar ? Cette action est définitive.';

/* ------------------------------------------------------------- l'intro -----
 * La prose de la page est celle de Niko, prise dans son document et verifiee
 * fragment par fragment contre lui : `phrase()` s'arrete si la chaine demandee
 * n'y figure pas au caractere pres. Rien n'est reformule, condense ni corrige —
 * les coquilles de la source arrivent telles quelles a l'ecran, et c'est voulu.
 * Seules libertes, celles que CLAUDE.md autorise : les intitules de cartes, que
 * sa prose n'a pas, et la casse d'un titre de section repris en libelle.
 */
const SOURCE = fs.readFileSync(path.join(import.meta.dirname, 'timeline-avatar-source.txt'), 'utf8');
const lignes = SOURCE.split(/\r?\n/).map(l => l.trim());

/* Les synopsis que la spec porte elle-meme echappent au controle contre
 * avatar.html, puisqu'ils n'en viennent pas. Ils sont donc verifies contre le
 * document de Niko : meme regle, autre source. Un synopsis qui n'y figure pas
 * est un texte que le script aurait redige, et il s'arrete. */
for (const [titre, d] of ecrits)
  if (!SOURCE.includes(d))
    erreurs.push(`le synopsis de « ${titre} » ne se retrouve pas dans timeline-avatar-source.txt`);

function phrase(debut) {
  const l = lignes.find(x => x.startsWith(debut));
  if (!l) { erreurs.push(`intro : aucune ligne de la source ne commence par « ${debut.slice(0, 40)}… »`); return ''; }
  return l;
}
function ecarte(titre) {
  const l = lignes.find(x => x.startsWith(titre + ' :'));
  if (!l) { erreurs.push(`omissions : « ${titre} » est absent de la source`); return ['', '']; }
  return [titre, l.slice(titre.length + 3).trim()];
}

const SVG = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  flash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19 2 12l9-7v14zM22 19l-9-7 9-7v14z"/></svg>',
  livre: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/></svg>'
};

const OMISSIONS = ['Les Aventures Perdues', 'Team Avatar Tales', 'Les romans pour enfants',
  'Les histoires du JDR papier', 'Le jeu mobile Avatar Générations et les jeux sur Korra'].map(ecarte);

const notes =
  `<p class="intro-lead">${phrase('Si vous êtes ici')}</p>` +
  `<div class="intro-tags"><span class="itag">${SVG.check}${phrase('Ce guide est plutôt')}</span></div>` +
  '<div class="keys-title">Repères de lecture</div><div class="keys">' +
  `<div class="key"><div class="key-h">${SVG.cal}Le calendrier</div><p>${phrase("L'an 0 du calendrier")}</p></div>` +
  `<div class="key"><div class="key-h">${SVG.flash}Les flashback</div><p>${phrase('Certains événements')}</p></div>` +
  `<div class="key"><div class="key-h">${SVG.livre}Les romans et comics</div>` +
  `<p>${phrase('Les romans font majoritairement')}</p><p>${phrase('Les comics font parti')}</p></div>` +
  '</div>' +
  `<details class="cuts"><summary>Ce qui est écarté et pourquoi<span class="n">${OMISSIONS.length} entrées</span>` +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>' +
  '<div class="cuts-body"><dl class="cuts-list">' +
  OMISSIONS.map(([t, d]) => `<div class="cut"><dt>${t}</dt><dd>${d}</dd></div>`).join('') +
  '</dl></div></details>';

const AVATAR = {
  id: 'avatar',
  title: PROD.title,
  subtitle: PROD.subtitle,
  description: 'Séries animées · Comics · Livres',
  color: '#7dd3fc',                    // la charte du site pour Avatar
  glow: 'rgba(125,211,252,.3)',
  tmdb_banner: PROD.tmdb_banner,
  notes,
  eras
};

/* ------------------------------------------------------------------- bilan --*/
console.log('entrees   ', toutes.length);
console.log('eres      ', eras.length, '(' + eras.map(e => e.entries.length).join(' + ') + ')');
console.log('niveaux   ', JSON.stringify(niveaux));
console.log('types     ', JSON.stringify(types));
console.log('flashback ', toutes.filter(e => e.tags && e.tags.includes('flashback')).length);
console.log('VO        ', toutes.filter(e => e.lang === 'vo').length);
/* Une entree sans synopsis n'est pas forcement une fiche vide : quand elle porte
 * un identifiant TMDB, la page va y chercher le resume au clic, comme la prod le
 * fait deja pour les series et les films. Les vraies fiches vides sont celles qui
 * n'ont ni synopsis ni TMDB — et seul Niko peut les remplir. */
const sans = toutes.filter(e => !e.desc);
const parTMDB = sans.filter(e => e.tmdb && e.tmdb !== '0');
const vides = sans.filter(e => !(e.tmdb && e.tmdb !== '0'));
console.log('vignettes ', toutes.filter(e => e.img).length, '/', toutes.length);
console.log('badges    ', CG.badges.length, '(' + CG.badges.map(b => b.label).join(', ') + ')');
console.log('synopsis  ', reprises.length, 'repris de avatar.html,', ecrits.length, 'de la spec,',
  parTMDB.length, 'via TMDB,', vides.length, 'a ecrire');
if (vides.length) { console.log('\nFICHES VIDES — ni synopsis ni TMDB, a ecrire par Niko :'); for (const e of vides) console.log('   ' + ((e.subitems || [])[0] || e.title)); }
if (alertes.length) { console.log('\nALERTES :'); for (const a of alertes) console.log('   ' + a); }
if (erreurs.length) { console.log('\nERREURS :'); for (const e of erreurs) console.log('   ' + e); console.log('\nRien n’a ete ecrit.'); process.exit(1); }

if (CHECK) { console.log('\n--check : rien ecrit.'); process.exit(0); }

const sortie = path.join(import.meta.dirname, 'data-avatar.js');
fs.writeFileSync(sortie,
  '/* Genere par construire-avatar.mjs — ne pas editer a la main.\n' +
  '   Titres, dates et niveaux viennent de spec-avatar.json (le document de Niko).\n' +
  '   Synopsis, ISBN et images viennent de avatar.html, mot pour mot.\n' +
  '   Pour corriger : modifier spec-avatar.json, puis relancer le script. */\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.AVATAR=' + JSON.stringify(AVATAR) + ';\n', 'utf8');
console.log('\ndata-avatar.js ecrit (' + (fs.statSync(sortie).size / 1024).toFixed(1) + ' Ko)');
