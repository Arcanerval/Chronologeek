/* ═══ LE FRANÇAIS D'ASSASSIN'S CREED ═════════════════════════════════
   Produit `e-assassinscreed.html` et `data-assassinscreed.js` à partir
   des fichiers anglais. C'est le quatrième script du dossier qui traduit
   dans ce sens, après `traduire-startrek.mjs`, `traduire-twd.mjs` et
   `traduire-dragonage.mjs`, et pour la même raison : Niko a écrit ce
   guide-là en anglais, dans son document « ac.txt ».

   NE JAMAIS INSCRIRE ASSASSIN'S CREED DANS `traduire-pages.mjs`. Ce
   script-là produit l'anglais depuis le français : il écraserait
   `en-assassinscreed.html`, c'est-à-dire la source, avec une
   retraduction de sa propre sortie — sans erreur et sans message.

   ON NE TRADUIT QUE CE QUI EST PROPRE À ASSASSIN'S CREED. Tout ce qui
   appartient au gabarit du site — navigation, pied de page, filtres,
   niveaux, progression, boutons — existe déjà en français dans les douze
   autres protos, relu et en ligne. Le retraduire ferait diverger deux
   textes qui doivent rester le même. Le lexique vient donc de deux
   appariements :

   - les paires de protos `e-*.html` / `en-*.html`, parallèles ligne à
     ligne puisque les unes sortent des autres. **Dragon Age en tête** :
     cette page-ci est bâtie sur la sienne, et c'est la seule autre du
     site qui mêle jeux, DLC, romans et comics — « played », « left to
     play », les cinq types de médias y ont exactement le sens qu'ils
     ont ici ;
   - les paires de données `data-*.js` / `data-*-en.js`, appariées par
     chemin de clé — c'est ce qui rend les libellés de `CG.t`.

   Ce qui reste — l'accroche, les trois repères de lecture, les sept
   sagas, les notes de placement, les synopsis, les badges et les titres
   qui ont une édition française — est écrit, et vit dans
   `traductions-assassinscreed.mjs`.

       node _proto/traduire-assassinscreed.mjs          écrit les deux fichiers
       node _proto/traduire-assassinscreed.mjs --check  n'écrit rien
       node _proto/traduire-assassinscreed.mjs --detail liste ce qui manque

   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AC_IDENTIQUES, AC_TRADUCTIONS, AC_GABARITS, AC_LIENS } from './traductions-assassinscreed.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const CHECK = process.argv.includes('--check');
const lire = p => fs.readFileSync(path.join(RACINE, p), 'utf8');

/* ── évaluer plutôt que lire au regex ──────────────────────────────
   Même raison que dans `traduire.mjs` : les données sont du JSON posé
   sur une ligne, mais les commentaires autour sont pleins d'apostrophes
   françaises et un regex y laisserait des plumes. */
function evalue(js) {
  const box = { window: {} };
  const noms = [...new Set([...js.matchAll(/(?:^|[\n;{])\s*(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/g)]
    .map(m => m[1]))];
  const code = js.replace(/\bconst /g, 'var ')
    + noms.map(n => `\n;try{window[${JSON.stringify(n)}]=${n}}catch(e){}`).join('');
  new Function('window', code)(box.window);
  return box.window;
}

const net = s => String(s).replace(/\s+/g, ' ').trim();

/* ═══ LE LEXIQUE ════════════════════════════════════════════════════ */

const table = new Map();          // anglais → français
const collisions = new Map();     // un anglais, deux français
const identiques = new Set(AC_IDENTIQUES.map(net));

function ajoute(en, fr) {
  en = net(en); fr = net(fr);
  if (!en || !fr) return;
  if (!/\p{L}/u.test(en)) return;
  const dejà = table.get(en);
  if (dejà !== undefined && dejà !== fr) {
    if (!collisions.has(en)) collisions.set(en, new Set([dejà]));
    collisions.get(en).add(fr);
    return;                        // on garde le premier vu
  }
  table.set(en, fr);
}

/* ── 1. les paires de protos, ligne à ligne ─────────────────────── */
const ATTRS = /(?:aria-label|title|placeholder|alt|data-label)="([^"]*)"/g;
const TEXTES = />([^<>]+)</g;
const LITTERALES = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;

function fragmentsDe(ligne) {
  const out = [];
  for (const m of ligne.matchAll(TEXTES)) out.push(net(m[1]));
  for (const m of ligne.matchAll(ATTRS)) out.push(net(m[1]));
  for (const m of ligne.matchAll(LITTERALES)) out.push(net(m[1] ?? m[2]));
  return out.filter(v => v && /\p{L}/u.test(v));
}

const PAIRES_PAGES = [
  ['e-dragonage.html', 'en-dragonage.html'],
  ['e-twd.html', 'en-twd.html'],
  ['e-startrek.html', 'en-startrek.html'],
  ['e-accueil.html', 'en-accueil.html'],
  ['e-starwars.html', 'en-starwars.html'],
  ['e-marvel.html', 'en-marvel.html'],
  ['e-dc.html', 'en-dc.html'],
  ['e-avatar.html', 'en-avatar.html'],
  ['e-dossiers.html', 'en-dossiers.html'],
  ['e-dossier-star-wars.html', 'en-dossier-star-wars.html'],
  ['e-nouveautes.html', 'en-nouveautes.html'],
  ['e-a-venir.html', 'en-a-venir.html'],
];

/* UNE ZONE `i18n-off` N'ENTRE PAS AU LEXIQUE — voir `traduire-twd.mjs`
   pour le pourquoi : les deux protos y sont identiques, et
   l'appariement apprendrait « Year » → « Year ». */
function sansI18nOff(lignes) {
  let off = false;
  return lignes.map(l => {
    const debut = l.includes('i18n-off'), fin = l.includes('i18n-on');
    const dedans = off || debut;
    if (debut) off = true;
    if (fin) off = false;
    return dedans ? '' : l;          // la ligne reste, vidée : le rang tient
  });
}

let pagesLues = 0;
for (const [fr, en] of PAIRES_PAGES) {
  const lf = sansI18nOff(lire(`_proto/${fr}`).split(/\r?\n/));
  const le = sansI18nOff(lire(`_proto/${en}`).split(/\r?\n/));
  if (lf.length !== le.length) {
    throw new Error(`${fr} et ${en} n'ont pas le même nombre de lignes `
      + `(${lf.length} / ${le.length}) — l'appariement ligne à ligne ne tient plus. `
      + `Relancer traduire-pages.mjs (ou le script inverse concerné) avant celui-ci.`);
  }
  for (let i = 0; i < lf.length; i++) {
    const a = fragmentsDe(lf[i]), b = fragmentsDe(le[i]);
    if (a.length !== b.length) continue;      // ligne remaniée : on passe
    for (let k = 0; k < a.length; k++) ajoute(b[k], a[k]);
  }
  pagesLues++;
}

/* ── 2. les paires de données, par chemin de clé ────────────────── */
const PAIRES_DONNEES = [
  ['data-dragonage.js', 'data-dragonage-en.js'],
  ['data-twd.js', 'data-twd-en.js'],
  ['data-startrek.js', 'data-startrek-en.js'],
  ['data.js', 'data-en.js'],
  ['data-mcu.js', 'data-mcu-en.js'],
  ['data-dc.js', 'data-dc-en.js'],
  ['data-avatar.js', 'data-avatar-en.js'],
  ['data-dossier-sw.js', 'data-dossier-sw-en.js'],
];

function plat(o, p = '', out = {}) {
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) plat(v, `${p}.${k}`, out);
  } else if (typeof o === 'string') out[p] = o;
  return out;
}

const cgParChemin = new Map();    // chemin → { en, fr }
for (const [fr, en] of PAIRES_DONNEES) {
  const CGF = evalue(lire(`_proto/${fr}`)).CG;
  const CGE = evalue(lire(`_proto/${en}`)).CG;
  if (!CGF || !CGE) continue;
  const pf = plat(CGF), pe = plat(CGE);
  for (const chemin of Object.keys(pe)) {
    if (pf[chemin] === undefined) continue;
    ajoute(pe[chemin], pf[chemin]);
    if (!cgParChemin.has(chemin)) cgParChemin.set(chemin, { en: pe[chemin], fr: pf[chemin] });
  }
}

/* ── 3. ce qui est écrit ──────────────────────────────────────────── */
const ECRIT = new Map(AC_TRADUCTIONS.map(([en, fr]) => [net(en), fr]));

/* La clé du lexique est resserrée sur une seule ligne, donc un `\n` ne
   peut venir que de la traduction. S'il manque, le texte sort en un
   seul pavé, sans qu'aucune erreur ne le dise. */
for (const [en, fr] of AC_TRADUCTIONS) {
  const a = (en.match(/\n/g) || []).length, b = (String(fr).match(/\n/g) || []).length;
  if (a !== b) {
    throw new Error(`traductions-assassinscreed : ${a} saut(s) de ligne en anglais, ${b} en français`
      + `\n  ${en.slice(0, 90)}…`);
  }
}

/* ═══ TRADUIRE UNE CHAÎNE ═══════════════════════════════════════════ */

const manques = [];      // rien nulle part
const ecrites = [];      // venu de traductions-assassinscreed.mjs, à relire
const gabaritsVus = new Set();

function gabarit(v) {
  for (const [re, rendu] of AC_GABARITS) {
    const m = v.match(re);
    if (m) { gabaritsVus.add(String(re)); return rendu(m); }
  }
  return undefined;
}

const estGabarit = v => (/[<>]/.test(v) && !/\p{L}/u.test(v.replace(/<[^>]*>?|<|>/g, '')))
  || /^(\\[nrt])+$/.test(v);

function traduit(v, ou) {
  const c = net(v);
  if (!c || !/\p{L}/u.test(c)) return v;
  if (estGabarit(c)) return v;
  if (identiques.has(c)) return v;
  const g = gabarit(c);
  if (g !== undefined) return g;
  const t = table.get(c);
  if (t !== undefined) return t;
  const e = ECRIT.get(c);
  if (e !== undefined) { ecrites.push({ ou, en: c, fr: e }); return e; }
  manques.push({ ou, en: c });
  return v;
}

/* ═══ LES DONNÉES ═══════════════════════════════════════════════════ */

const liensFR = new Map(AC_LIENS);
const liensVus = new Set();

const SRC = lire('_proto/data-assassinscreed-en.js');
const boite = evalue(SRC);
const CG_EN = boite.CG, AC_EN = boite.ASSASSINSCREED;

/* Ce qui n'est jamais du texte affiché. Liste noire plutôt que liste
   blanche : une liste blanche rate mécaniquement ce qu'elle ne connaît
   pas, et c'est ce qui avait laissé 238 réponses de FAQ en français
   dans la version anglaise de Marvel. */
const TECHNIQUES = new Set([
  'id', 'ids', 'universe', 'color', 'glow', 'img', 'type', 'level', 'kind',
  'tmdb', 'media', 'href', 'key', 'lang', 'locale', 'tags', 'trigger',
  'otherFlag', 'otherHref', 'flag', 'art', 'ink',
]);

/* Une date s'écrit pareil des deux côtés — « 1191-1193 », « 70-56 BC »,
   « ~2306 IE » — et `present` est une date elle aussi : c'est l'année
   du cadre Animus, pas une prose. Les deux champs sont déclarés ici
   plutôt que dans la liste des identiques, qui compterait 195 lignes
   sans rien apprendre.

   « BC » RESTE « BC », ET C'EST LA RÈGLE DE TOUTES LES TIMELINES —
   tranché par Niko le 25 août 2026. Une date de timeline est un repère,
   pas une phrase : elle doit se lire d'un coup d'œil et se comparer
   d'une page à l'autre. « av. J.-C. » avait été essayé, et il allongeait
   la pastille sans rien apprendre à personne. C'est déjà ce que font
   « BBY » chez Star Wars et « BG » chez Avatar Legends. */
const IDENTIQUES_PAR_CHAMP = new Set(['date', 'present']);

function traduitObjet(o, chemin = '', cle = '') {
  if (Array.isArray(o)) return o.map((v) => traduitObjet(v, `${chemin}[]`, cle));
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = traduitObjet(v, `${chemin}.${k}`, k);
    return out;
  }
  if (typeof o !== 'string') return o;
  /* Les liens de visionnage, avant la liste noire : `href` est bien un
     champ technique — on ne le traduit pas mot à mot —, mais quatre
     adresses ont leur équivalent français, et c'est la seule chose du
     fichier qui les remplace. */
  if (cle === 'href' && liensFR.has(o)) { liensVus.add(o); return liensFR.get(o); }
  if (TECHNIQUES.has(cle)) return o;
  if (IDENTIQUES_PAR_CHAMP.has(cle)) return o;
  /* L'accroche de la page est un bloc de HTML : l'intro, les trois
     repères de lecture et le dépliant de ce qui n'y est pas. On traduit
     nœud de texte par nœud de texte, et le lexique les retrouve. */
  if (/<[a-z][^>]*>/i.test(o)) {
    return o.replace(TEXTES, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      const tete = v.match(/^\s*/)[0], queue = v.match(/\s*$/)[0];
      return '>' + tete + traduit(v, chemin) + queue + '<';
    });
  }
  return traduit(o, chemin);
}

/* `CG` se traduit clé par clé, jamais remplacé par celui d'un autre
   univers : il porte des clés que personne d'autre n'a — les sept
   badges de saga, les deux questions de FAQ, le repère FLASHBACK. */
const CG_FR = traduitObjet(CG_EN, 'CG');
CG_FR.t.lang = 'fr';
CG_FR.t.locale = 'fr-FR';
const AC_FR = traduitObjet(AC_EN, 'AC');

/* ═══ LES GARDE-FOUS ════════════════════════════════════════════════ */
const alertes = [];

/* 1. la structure, clé pour clé */
function memesCles(a, b, chemin = '') {
  if (Array.isArray(a) !== Array.isArray(b)) alertes.push(`forme différente en ${chemin}`);
  else if (Array.isArray(a)) {
    if (a.length !== b.length) alertes.push(`${chemin} : ${a.length} contre ${b.length}`);
    else a.forEach((v, i) => memesCles(v, b[i], `${chemin}[${i}]`));
  } else if (a && typeof a === 'object') {
    const ka = Object.keys(a).join(','), kb = Object.keys(b).join(',');
    if (ka !== kb) alertes.push(`clés différentes en ${chemin} : ${ka} / ${kb}`);
    else for (const k of Object.keys(a)) memesCles(a[k], b[k], `${chemin}.${k}`);
  }
}
memesCles(AC_EN, AC_FR, 'AC');
memesCles(CG_EN, CG_FR, 'CG');

/* 2. le champ resté anglais : si toutes les valeurs d'un champ sont
   identiques des deux côtés, il n'a pas été traduit. C'est le contrôle
   qui a révélé les 121 FAQ Marvel restées en français.

   Deux champs y échappent, et c'est propre à cet univers : la moitié
   des 111 œuvres gardent leur titre — Ubisoft ne traduit pas les noms
   de ses jeux — et « SAGA 3 » s'écrit pareil des deux côtés. Le
   garde-fou de variété, plus bas, surveille les deux. */
const CHAMPS_SANS_CONTROLE = new Set(['title', 'phase', 'label']);
function parChamp(o, acc = {}, cle = '') {
  if (Array.isArray(o)) o.forEach(v => parChamp(v, acc, cle));
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) parChamp(v, acc, k);
  } else if (typeof o === 'string' && cle) (acc[cle] ||= []).push(o);
  return acc;
}
{
  const ce = parChamp(AC_EN), cf = parChamp(AC_FR);
  for (const k of Object.keys(ce)) {
    if (TECHNIQUES.has(k) || IDENTIQUES_PAR_CHAMP.has(k) || CHAMPS_SANS_CONTROLE.has(k)) continue;
    const textuels = ce[k].filter(v => /\p{L}{3}/u.test(v));
    if (textuels.length < 3) continue;
    const bouge = ce[k].some((v, i) => v !== cf[k][i]);
    if (!bouge) alertes.push(`le champ « ${k} » est resté anglais sur ses ${ce[k].length} valeurs`);
  }
}

/* 3. les liens : une adresse anglaise de la table qui ne se retrouve
   plus dans les données, c'est la vidéo qui a bougé — et le lien
   français est alors posé nulle part, sans que rien ne le dise. */
for (const [en] of AC_LIENS) {
  if (!liensVus.has(en)) alertes.push(`le lien « ${en} » n'existe plus dans les données anglaises`);
}

/* 4. la variété : sept titres de saga distincts d'un côté et un seul de
   l'autre, ce n'est pas une traduction, c'est un appariement raté. */
{
  const ce = parChamp(AC_EN), cf = parChamp(AC_FR);
  for (const k of Object.keys(ce)) {
    const a = new Set(ce[k]).size, b = new Set(cf[k]).size;
    if (a > 3 && b < a / 2) alertes.push(`le champ « ${k} » perd sa variété : ${a} valeurs distinctes en anglais, ${b} en français`);
  }
}

/* ═══ ÉCRIRE LES DONNÉES ════════════════════════════════════════════
   On reprend le fichier anglais et on remplace ses deux blocs JSON en
   place : même squelette, mêmes commentaires, même nombre de lignes. */
const js = o => JSON.stringify(o);

function remplaceBloc(src, decl, valeur) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error(`bloc introuvable dans data-assassinscreed-en.js : ${decl}`);
  const fin = src.indexOf('\n', i);
  const ligne = src.slice(i, fin);
  const pointVirgule = ligne.trimEnd().endsWith(';') ? ';' : '';
  return src.slice(0, i) + decl + js(valeur) + pointVirgule + src.slice(fin);
}

const ENTETE_FR = `/* Version francaise de data-assassinscreed-en.js — produite par
   traduire-assassinscreed.mjs. Assassin's Creed est le quatrieme univers dont
   la source est anglaise, apres Star Trek, The Walking Dead et Dragon Age :
   Niko a ecrit ce guide-la dans cette langue, et le francais en descend. Tout
   ce qui appartient au gabarit du site est retrouve dans les douze autres
   protos, jamais retraduit ; ce qui est propre a cet univers — l'accroche, les
   reperes de lecture, les sept sagas, les notes de placement, les synopsis et
   les badges — est ecrit dans traductions-assassinscreed.mjs. Ne pas editer a
   la main : relancer le script.

   Les titres suivent l'edition francaise quand elle existe — « La Croisade
   secrete », « Le Prix de la Liberte », « L'Heritage de la Premiere lame » —
   et restent en anglais quand Ubisoft ne les a jamais traduits, ce qui est le
   cas de tous les jeux. */`;

let sortie = SRC;
sortie = remplaceBloc(sortie, 'window.CG=', CG_FR);
sortie = remplaceBloc(sortie, 'window.ASSASSINSCREED=', AC_FR);
/* l'en-tête d'origine raconte l'extraction depuis le document de Niko :
   c'est vrai du fichier anglais, pas de celui-ci. */
sortie = ENTETE_FR + sortie.slice(sortie.indexOf('*/') + 2);

/* ═══ LA PAGE ═══════════════════════════════════════════════════════ */

/* Une chaîne passée à une API du DOM est un identifiant, jamais un
   libellé — `getElementById('note')` devenu `getElementById('rating')`
   avait fait afficher « le radar n'a pas pu être chargé » sans une ligne
   dans la console. */
const APPELS_DOM = new RegExp(
  '(?:getElementById|querySelectorAll|querySelector|getElementsByClassName'
  + '|closest|matches|createElement|setAttribute|getAttribute|removeAttribute'
  + '|classList\\.(?:add|remove|toggle|contains)|dataset\\.\\w+|addEventListener'
  + '|removeEventListener|localStorage\\.(?:getItem|setItem|removeItem)'
  + '|insertAdjacentHTML|setProperty|getPropertyValue)\\s*\\(\\s*$');

/* Un `/` ouvre une expression régulière ou divise, selon ce qui précède.
   Le distinguer n'est pas un raffinement : `esc()` teste `/["&<>]/g`, et
   un scanner qui prend ce `"` pour une ouverture de chaîne repart en
   plein code et rend des fragments qui ne sont pas des chaînes. */
const AVANT_REGEX = /[(,=:[!&|?{};+\-*%~^]\s*$|\breturn\s*$|\btypeof\s*$|^\s*$/;

function chainesDu(js) {
  const out = [];
  let i = 0, etat = 'code', quote = '', debut = 0;
  while (i < js.length) {
    const c = js[i], d = js[i + 1];
    if (etat === 'code') {
      if (c === '/' && d === '/') { etat = 'ligne'; i += 2; continue; }
      if (c === '/' && d === '*') { etat = 'bloc'; i += 2; continue; }
      if (c === '/' && AVANT_REGEX.test(js.slice(Math.max(0, i - 24), i))) {
        etat = 'regex'; i++; continue;
      }
      if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; quote = c; debut = i; i++; continue; }
      i++; continue;
    }
    if (etat === 'regex') {
      if (c === '\\') { i += 2; continue; }
      if (c === '[') { etat = 'classe'; i++; continue; }
      if (c === '/' || c === '\n') { etat = 'code'; i++; continue; }
      i++; continue;
    }
    if (etat === 'classe') {
      if (c === '\\') { i += 2; continue; }
      if (c === ']') { etat = 'regex'; i++; continue; }
      i++; continue;
    }
    if (etat === 'ligne') { if (c === '\n') etat = 'code'; i++; continue; }
    if (etat === 'bloc') { if (c === '*' && d === '/') { etat = 'code'; i += 2; continue; } i++; continue; }
    if (etat === 'chaine') {
      if (c === '\\') { i += 2; continue; }
      if (c === quote) {
        out.push({ debut, fin: i + 1, quote, val: js.slice(debut + 1, i) });
        etat = 'code'; i++; continue;
      }
      i++; continue;
    }
  }
  return out;
}

function zonesProtegees(js) {
  const zones = [];
  for (const m of js.matchAll(/i18n-off([\s\S]*?)i18n-on/g)) zones.push([m.index, m.index + m[0].length]);
  return zones;
}

/* Une phrase peut tenir sur trois lignes dans la page anglaise et sur
   une seule en français. Les deux versions d'une page doivent rester
   parallèles ligne à ligne — c'est ce que vérifie `py sync.py check` —
   donc on répartit la traduction sur le même nombre de lignes. */
function reflow(fr, origine) {
  const lignes = origine.split('\n');
  if (lignes.length === 1) return fr;
  const creux = lignes.slice(1).map(l => l.match(/^[ \t]*/)[0]);
  const mots = String(fr).split(/\s+/).filter(Boolean);
  if (mots.length < lignes.length) return fr + creux.map(c => '\n' + c).join('');
  const par = Math.ceil(mots.length / lignes.length);
  const bouts = [];
  for (let i = 0; i < lignes.length; i++) bouts.push(mots.slice(i * par, (i + 1) * par).join(' '));
  const reste = mots.slice(lignes.length * par);
  if (reste.length) bouts[bouts.length - 1] += ' ' + reste.join(' ');
  return bouts.map((b, i) => (i === 0 ? b : creux[i - 1] + b)).join('\n');
}

const PAGE = lire('_proto/en-assassinscreed.html');
const decoupe = /<style[\s\S]*?<\/style>|<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g;
const zones = [];
{
  let pos = 0, m;
  while ((m = decoupe.exec(PAGE))) {
    zones.push({ type: 'html', txt: PAGE.slice(pos, m.index) });
    zones.push({ type: m[0].startsWith('<script') ? 'js' : 'brut', txt: m[0] });
    pos = m.index + m[0].length;
  }
  zones.push({ type: 'html', txt: PAGE.slice(pos) });
}

const pageTraduite = zones.map(z => {
  if (z.type === 'brut') return z.txt;
  if (z.type === 'html') {
    let out = z.txt.replace(TEXTES, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      const tete = v.match(/^\s*/)[0], queue = v.match(/\s*$/)[0];
      const coeur = v.slice(tete.length, v.length - queue.length);
      return '>' + tete + reflow(traduit(v, 'page'), coeur) + queue + '<';
    });
    out = out.replace(ATTRS, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      return t.replace(`"${v}"`, `"${traduit(v, 'attribut')}"`);
    });
    return out;
  }
  /* JS inline : seules les chaînes littérales, et pas toutes. */
  const protegees = zonesProtegees(z.txt);
  const trouvees = chainesDu(z.txt);
  let out = z.txt;
  for (let k = trouvees.length - 1; k >= 0; k--) {
    const { debut, fin, quote, val } = trouvees[k];
    if (!val || !/\p{L}/u.test(val)) continue;
    if (/^\s*(fr|en)\s*$/.test(val)) continue;                 // un code de langue n'est pas un mot
    if (protegees.some(([a, b]) => debut >= a && fin <= b)) continue;
    if (APPELS_DOM.test(z.txt.slice(Math.max(0, debut - 60), debut))) continue;
    /* L'espace du bord appartient au gabarit, pas au libellé. */
    const tete = val.match(/^\s*/)[0];
    const queue = val.slice(val.replace(/\s+$/, '').length);
    const coeur = val.slice(tete.length, val.length - queue.length);
    if (!coeur) continue;
    const fr = traduit(coeur, 'js');
    if (fr === coeur) continue;
    const rendu = tete + fr + queue;
    out = out.slice(0, debut) + quote + rendu.split(quote).join('\\' + quote) + quote + out.slice(fin);
  }
  return out;
}).join('');

/* la page française charge les données françaises, et sa navigation
   renvoie aux protos français */
let pageFR = pageTraduite
  .replace(/<html lang="en">/, '<html lang="fr">')
  .replace(/(<script\s+src=")data-assassinscreed-en\.js(")/, '$1data-assassinscreed.js$2')
  .replace(/(href|src)="en-([a-z0-9-]+\.html)/g, '$1="e-$2');

/* ── le sélecteur de langue ────────────────────────────────────────
   Le bouton porte le drapeau de la langue vers laquelle il emmène, pas
   celle de la page : la version anglaise montre le tricolore, la
   française doit montrer l'Union Jack — et pointer vers l'anglaise, ce
   que la réécriture des liens ci-dessus venait de défaire.

   Le drapeau britannique est repris des protos français, liserés
   épaissis compris : à 38 px de large, les proportions officielles
   tombent sous le pixel. Même nombre de lignes que le bloc anglais. */
{
  const re = /<a class="icon-btn lang-btn"[^>]*>[\s\S]*?<\/a>/;
  if (!re.test(pageFR)) throw new Error('pas de sélecteur de langue dans en-assassinscreed.html');
  pageFR = pageFR.replace(re, (bloc) => {
    const lignes = bloc.split('\n');
    const out = [
      '<a class="icon-btn lang-btn" href="en-assassinscreed.html" aria-label="Switch to English" title="Switch to English">',
      '        <svg viewBox="0 0 60 30" aria-hidden="true"><clipPath id="ukc"><path d="M0 0v30h60V0z"/></clipPath>'
        + '<g clip-path="url(#ukc)" fill="none"><path d="M0 0v30h60V0z" fill="#012169"/>'
        + '<path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="8"/>'
        + '<path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="3.2"/>'
        + '<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="13"/>'
        + '<path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="7"/></g></svg>',
    ];
    while (out.length < lignes.length - 1) out.push('');
    out.push(lignes[lignes.length - 1]);
    return out.join('\n');
  });
}

/* ═══ BILAN ═════════════════════════════════════════════════════════ */
console.log(CHECK ? 'CONTRÔLE — rien n\'est écrit\n' : 'ÉCRITURE\n');
console.log(`  lexique : ${table.size} textes retrouvés (${pagesLues} paires de pages, `
  + `${cgParChemin.size} clés de données), ${identiques.size} identiques`
  + (collisions.size ? `, ${collisions.size} ambigus` : ''));
console.log(`  gabarits : ${gabaritsVus.size}/${AC_GABARITS.length} employés`);

const uniques = new Map();
for (const m of manques) if (!uniques.has(m.en)) uniques.set(m.en, m);
const parEcrite = new Map();
for (const e of ecrites) if (!parEcrite.has(e.en)) parEcrite.set(e.en, e);

console.log(`  écrit   : ${ecrites.length} emploi(s) de ${parEcrite.size} phrase(s) — à relire`);
console.log(`  manque  : ${manques.length} occurrence(s), ${uniques.size} texte(s) distinct(s)`);

if (alertes.length) {
  console.log('\n  ⚠ garde-fous :');
  for (const a of alertes) console.log('      ' + a);
}

/* La liste de ce qui manque est écrite même en contrôle : c'est elle
   qu'on ouvre pour remplir la table, et la console coupe les phrases. */
fs.writeFileSync(path.join(RACINE, '_proto/a-traduire-assassinscreed.json'),
  JSON.stringify([...uniques.values()], null, 1), 'utf8');

if (process.argv.includes('--detail')) {
  for (const m of uniques.values()) console.log(`\n  [${m.ou}] ${m.en.slice(0, 160)}`);
}

if (!CHECK) {
  if (alertes.length || uniques.size) {
    console.log('\n  rien n\'a été écrit : le bilan n\'est pas propre.');
    process.exit(1);
  }
  fs.writeFileSync(path.join(RACINE, '_proto/data-assassinscreed.js'), sortie, 'utf8');
  fs.writeFileSync(path.join(RACINE, '_proto/e-assassinscreed.html'), pageFR, 'utf8');
  console.log('\n  → _proto/data-assassinscreed.js\n  → _proto/e-assassinscreed.html');
  fs.writeFileSync(path.join(RACINE, '_proto/a-relire-assassinscreed.json'),
    JSON.stringify([...parEcrite.values()], null, 2), 'utf8');
}
