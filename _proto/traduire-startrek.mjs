/* ═══ LE FRANÇAIS DE STAR TREK ═══════════════════════════════════════
   Produit `e-startrek.html` et `data-startrek.js` à partir des fichiers
   anglais. C'est le seul script du dossier qui traduit dans ce sens, et
   la raison est simple : Niko a écrit ce guide-là en anglais. Les quatre
   autres univers s'écrivent en français et l'anglais s'en déduit ; ici
   la source est anglaise, et le français en descend.

   NE JAMAIS INSCRIRE STAR TREK DANS `traduire-pages.mjs`. Ce script-là
   produit l'anglais depuis le français : il écraserait `en-startrek.html`,
   c'est-à-dire la source, avec une retraduction de sa propre sortie.

   ON NE TRADUIT QUE CE QUI EST PROPRE À STAR TREK. Tout ce qui appartient
   au gabarit du site — navigation, pied de page, filtres, libellés de
   progression, boutons — existe déjà en français dans les neuf autres
   protos, relu et en ligne. Le retraduire ferait diverger deux textes qui
   doivent rester le même. Le lexique vient donc de deux appariements :

   - les paires de protos `e-*.html` / `en-*.html`, parallèles ligne à
     ligne puisque les secondes sortent des premières ;
   - les paires de données `data-*.js` / `data-*-en.js`, appariées par
     chemin de clé — c'est ce qui rend les 112 libellés de `CG.t`.

   Ce qui reste — titres d'œuvres, ères, réponses de FAQ, bandeaux,
   badges — est écrit, et vit dans `traductions-startrek.mjs`.

       node _proto/traduire-startrek.mjs          écrit les deux fichiers
       node _proto/traduire-startrek.mjs --check  n'écrit rien

   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ST_IDENTIQUES, ST_TRADUCTIONS, ST_GABARITS } from './traductions-startrek.mjs';

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
const identiques = new Set(ST_IDENTIQUES.map(net));

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

/* ── 1. les paires de protos, ligne à ligne ───────────────────────
   `en-marvel.html` sort de `e-marvel.html` : les deux fichiers ont le
   même nombre de lignes et la même découpe. On apparie donc les textes
   et les attributs par rang à l'intérieur de chaque ligne. */
const ATTRS = /(?:aria-label|title|placeholder|alt|data-label)="([^"]*)"/g;
const TEXTES = />([^<>]+)</g;

/* Les chaînes littérales du JS entrent au lexique comme le reste : les
   pages sont parallèles jusque dans leur script, et c'est de là que
   viennent « Fermer le menu », « Bande-annonce » ou « Spoilers mineurs ».
   Les sélecteurs et les fragments de HTML s'y apparient avec eux-mêmes,
   ce qui est exactement ce qu'on veut — une identité déclarée par les
   pages plutôt que devinée par une règle. */
const LITTERALES = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;

function fragmentsDe(ligne) {
  const out = [];
  for (const m of ligne.matchAll(TEXTES)) out.push(net(m[1]));
  for (const m of ligne.matchAll(ATTRS)) out.push(net(m[1]));
  for (const m of ligne.matchAll(LITTERALES)) out.push(net(m[1] ?? m[2]));
  return out.filter(v => v && /\p{L}/u.test(v));
}

const PAIRES_PAGES = [
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

let pagesLues = 0;
for (const [fr, en] of PAIRES_PAGES) {
  const lf = lire(`_proto/${fr}`).split(/\r?\n/);
  const le = lire(`_proto/${en}`).split(/\r?\n/);
  if (lf.length !== le.length) {
    throw new Error(`${fr} et ${en} n'ont pas le même nombre de lignes `
      + `(${lf.length} / ${le.length}) — l'appariement ligne à ligne ne tient plus. `
      + `Relancer traduire-pages.mjs avant celui-ci.`);
  }
  for (let i = 0; i < lf.length; i++) {
    const a = fragmentsDe(lf[i]), b = fragmentsDe(le[i]);
    if (a.length !== b.length) continue;      // ligne remaniée : on passe
    for (let k = 0; k < a.length; k++) ajoute(b[k], a[k]);
  }
  pagesLues++;
}

/* ── 2. les paires de données, par chemin de clé ──────────────────
   `CG.t` porte tous les libellés de l'interface. Les deux versions d'un
   même fichier ont exactement les mêmes clés — c'est ce que vérifie déjà
   le contrôle de structure de `traduire.mjs` — donc la valeur française
   se lit au même chemin. */
const PAIRES_DONNEES = [
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
const ECRIT = new Map(ST_TRADUCTIONS.map(([en, fr]) => [net(en), fr]));

/* Les réponses de Niko tiennent parfois en deux ou trois paragraphes,
   séparés par un `\n` que la page rend en `<p>`. La clé du lexique est
   resserrée sur une seule ligne — c'est ce qui permet de retrouver un
   texte quelle que soit sa mise en forme — donc le `\n` ne peut venir
   que de la traduction. S'il manque, la réponse sort en un seul pavé et
   la respiration du texte disparaît, sans qu'aucune erreur ne le dise. */
for (const [en, fr] of ST_TRADUCTIONS) {
  const a = (en.match(/\n/g) || []).length, b = (String(fr).match(/\n/g) || []).length;
  if (a !== b) {
    throw new Error(`traductions-startrek : ${a} saut(s) de ligne en anglais, ${b} en français`
      + `\n  ${en.slice(0, 90)}…`);
  }
}

/* ═══ TRADUIRE UNE CHAÎNE ═══════════════════════════════════════════ */

const manques = [];      // rien nulle part
const ecrites = [];      // venu de traductions-startrek.mjs, à relire
const gabaritsVus = new Set();

/* Les gabarits d'abord : « Season 6 Episodes 1-4 » n'a pas à figurer
   dans une table, c'est une forme. 254 sous-items sur 352 en sortent. */
function gabarit(v) {
  for (const [re, rendu] of ST_GABARITS) {
    const m = v.match(re);
    if (m) { gabaritsVus.add(String(re)); return rendu(m); }
  }
  return undefined;
}

/* Un morceau de gabarit n'est pas un libellé. La page construit ses
   bandeaux de spoil en concaténant `'<div class="bn-body">'` et le
   reste : ce sont des balises, et si on retire les balises il ne reste
   pas une lettre. Le test porte donc sur ce qui reste une fois les
   `<…>` enlevés — `'<span class="lbl">Reveal</span>'` garde « Reveal »
   et continue d'être signalé, ce qui est bien ce qu'on veut.

   Même chose pour une chaîne qui n'est qu'une échappée : `'\n'`. */
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

const SRC = lire('_proto/data-startrek-en.js');
const boite = evalue(SRC);
const CG_EN = boite.CG, ST_EN = boite.ST;

/* Ce qui n'est jamais du texte affiché. Liste noire plutôt que liste
   blanche : une liste blanche rate mécaniquement ce qu'elle ne connaît
   pas, et c'est ce qui avait laissé 238 réponses de FAQ en français dans
   la version anglaise de Marvel. */
const TECHNIQUES = new Set([
  'id', 'ids', 'universe', 'color', 'glow', 'img', 'type', 'level', 'kind',
  'tmdb', 'media', 'href', 'key', 'lang', 'locale', 'tags', 'trigger',
  'otherFlag', 'otherHref', 'flag', 'art',
]);

/* Une date in-universe s'écrit pareil des deux côtés — « 2151 »,
   « 2156-2160 ». Le champ est déclaré ici plutôt que dans la liste des
   identiques, qui compterait 66 lignes sans rien apprendre. */
const IDENTIQUES_PAR_CHAMP = new Set(['date']);

function traduitObjet(o, chemin = '', cle = '') {
  if (Array.isArray(o)) return o.map((v, i) => traduitObjet(v, `${chemin}[]`, cle));
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = traduitObjet(v, `${chemin}.${k}`, k);
    return out;
  }
  if (typeof o !== 'string') return o;
  if (TECHNIQUES.has(cle)) return o;
  if (IDENTIQUES_PAR_CHAMP.has(cle)) return o;
  /* L'accroche de la page est un bloc de HTML de quatre mille signes :
     l'intro, les quatre clés de lecture et le dépliant de ce qui n'y est
     pas. Le poser en un seul morceau dans la table le rendrait
     intraduisible en pratique — et surtout, ses intitulés sont ceux des
     quatre autres univers, déjà écrits en français. On traduit donc
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
   univers : la refonte y a ajouté des clés — les badges de Star Trek,
   ses deux repères — qu'aucune autre page ne porte. */
const CG_FR = traduitObjet(CG_EN, 'CG');
CG_FR.t.lang = 'fr';
CG_FR.t.locale = 'fr-FR';
const ST_FR = traduitObjet(ST_EN, 'ST');

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
memesCles(ST_EN, ST_FR, 'ST');
memesCles(CG_EN, CG_FR, 'CG');

/* 2. le champ resté anglais : si toutes les valeurs d'un champ sont
   identiques des deux côtés, il n'a pas été traduit. C'est le contrôle
   qui a révélé les 121 FAQ Marvel restées en français. */
function parChamp(o, acc = {}, cle = '') {
  if (Array.isArray(o)) o.forEach(v => parChamp(v, acc, cle));
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) parChamp(v, acc, k);
  } else if (typeof o === 'string' && cle) (acc[cle] ||= []).push(o);
  return acc;
}
{
  const ce = parChamp(ST_EN), cf = parChamp(ST_FR);
  for (const k of Object.keys(ce)) {
    if (TECHNIQUES.has(k) || IDENTIQUES_PAR_CHAMP.has(k)) continue;
    const textuels = ce[k].filter(v => /\p{L}{3}/u.test(v));
    if (textuels.length < 3) continue;
    const bouge = ce[k].some((v, i) => v !== cf[k][i]);
    if (!bouge) alertes.push(`le champ « ${k} » est resté anglais sur ses ${ce[k].length} valeurs`);
  }
}

/* 3. la variété : 63 titres distincts d'un côté et un seul de l'autre,
   ce n'est pas une traduction, c'est un appariement raté. */
{
  const ce = parChamp(ST_EN), cf = parChamp(ST_FR);
  for (const k of Object.keys(ce)) {
    const a = new Set(ce[k]).size, b = new Set(cf[k]).size;
    if (a > 3 && b < a / 2) alertes.push(`le champ « ${k} » perd sa variété : ${a} valeurs distinctes en anglais, ${b} en français`);
  }
}

/* ═══ ÉCRIRE LES DONNÉES ════════════════════════════════════════════
   On reprend le fichier anglais et on remplace ses deux blocs JSON en
   place : même squelette, mêmes commentaires, même nombre de lignes.
   Sérialiser à neuf perdrait ce que le fichier dit de lui-même. */
const js = o => JSON.stringify(o);

function remplaceBloc(src, decl, valeur) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error(`bloc introuvable dans data-startrek-en.js : ${decl}`);
  const fin = src.indexOf('\n', i);
  const ligne = src.slice(i, fin);
  const pointVirgule = ligne.trimEnd().endsWith(';') ? ';' : '';
  return src.slice(0, i) + decl + js(valeur) + pointVirgule + src.slice(fin);
}

const ENTETE_FR = `/* Version francaise de data-startrek-en.js — produite par
   traduire-startrek.mjs. Star Trek est le seul univers dont la source est
   anglaise : Niko a ecrit ce guide-la dans cette langue, et le francais en
   descend. Tout ce qui appartient au gabarit du site est retrouve dans les
   neuf autres protos, jamais retraduit ; ce qui est propre a Star Trek —
   titres, eres, FAQ, bandeaux, badges — est ecrit dans
   traductions-startrek.mjs. Ne pas editer a la main : relancer le script. */`;

let sortie = SRC;
sortie = remplaceBloc(sortie, 'window.CG=', CG_FR);
sortie = remplaceBloc(sortie, 'const DATA_ST=', ST_FR);
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
   plein code et rend des fragments qui ne sont pas des chaînes. Ils ne
   se traduisaient pas — aucun ne figure au lexique — mais ils encombraient
   le rapport, et une position fausse est une corruption qui attend. */
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
   donc on répartit la traduction sur le même nombre de lignes, en
   coupant aux espaces et en reprenant l'indentation d'origine. */
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

const PAGE = lire('_proto/en-startrek.html');
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
    /* L'espace du bord appartient au gabarit, pas au libellé. La clé du
       lexique est resserrée par `net()`, donc la traduction revient rognée :
       `' watched</span><span>'` ressortait collé au nombre qui le précède,
       et les huit bandes d'ère annonçaient « 0 / 8vues » et « 68 h 31au
       total ». On retrouve les bords de la chaîne d'origine, exactement
       comme le fait déjà la branche HTML avec `tete` et `queue`. */
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
  .replace(/(<script\s+src=")data-startrek-en\.js(")/, '$1data-startrek.js$2')
  .replace(/(href|src)="en-([a-z0-9-]+\.html)/g, '$1="e-$2');

/* ── le sélecteur de langue ────────────────────────────────────────
   Le bouton porte le drapeau de la langue vers laquelle il emmène, pas
   celle de la page : la version anglaise montre le tricolore, la
   française doit montrer l'Union Jack — et pointer vers l'anglaise, ce
   que la réécriture des liens ci-dessus venait de défaire. Ses deux
   libellés, eux, viennent du lexique comme le reste.

   Le drapeau britannique est repris des protos français, liserés
   épaissis compris : à 38 px de large, les proportions officielles
   tombent sous le pixel. Même nombre de lignes que le bloc anglais. */
{
  const re = /<a class="icon-btn lang-btn"[^>]*>[\s\S]*?<\/a>/;
  if (!re.test(pageFR)) throw new Error('pas de sélecteur de langue dans en-startrek.html');
  pageFR = pageFR.replace(re, (bloc) => {
    const lignes = bloc.split('\n');
    const out = [
      '<a class="icon-btn lang-btn" href="en-startrek.html" aria-label="Switch to English" title="Switch to English">',
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
console.log(`  gabarits : ${gabaritsVus.size}/${ST_GABARITS.length} employés`);

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
fs.writeFileSync(path.join(RACINE, '_proto/a-traduire-startrek.json'),
  JSON.stringify([...uniques.values()], null, 1), 'utf8');

if (process.argv.includes('--detail')) {
  for (const m of uniques.values()) console.log(`\n  [${m.ou}] ${m.en.slice(0, 160)}`);
}

if (!CHECK) {
  if (alertes.length || uniques.size) {
    console.log('\n  rien n\'a été écrit : le bilan n\'est pas propre.');
    process.exit(1);
  }
  fs.writeFileSync(path.join(RACINE, '_proto/data-startrek.js'), sortie, 'utf8');
  fs.writeFileSync(path.join(RACINE, '_proto/e-startrek.html'), pageFR, 'utf8');
  console.log('\n  → _proto/data-startrek.js\n  → _proto/e-startrek.html');
  fs.writeFileSync(path.join(RACINE, '_proto/a-relire-startrek.json'),
    JSON.stringify([...parEcrite.values()], null, 2), 'utf8');
}
