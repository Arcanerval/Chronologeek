/* ═══ LE FRANÇAIS DE DRAGON AGE ══════════════════════════════════════
   Produit `e-dragonage.html` et `data-dragonage.js` à partir des fichiers
   anglais. C'est le troisième script du dossier qui traduit dans ce sens,
   après `traduire-startrek.mjs` et `traduire-twd.mjs`, et pour la même
   raison : Niko a écrit ce guide-là en anglais. Les quatre premiers
   univers s'écrivent en français et l'anglais s'en déduit ; ici la source
   est anglaise.

   NE JAMAIS INSCRIRE DRAGON AGE DANS `traduire-pages.mjs`. Ce script-là
   produit l'anglais depuis le français : il écraserait
   `en-dragonage.html`, c'est-à-dire la source, avec une retraduction de
   sa propre sortie — sans erreur et sans message.

   ON NE TRADUIT QUE CE QUI EST PROPRE À DRAGON AGE. Tout ce qui
   appartient au gabarit du site — navigation, pied de page, filtres,
   niveaux, progression, boutons — existe déjà en français dans les onze
   autres protos, relu et en ligne. Le retraduire ferait diverger deux
   textes qui doivent rester le même. Le lexique vient donc de deux
   appariements :

   - les paires de protos `e-*.html` / `en-*.html`, parallèles ligne à
     ligne puisque les unes sortent des autres. **Avatar Legends en fait
     partie, et en tête** : `en-dragonage.html` est sorti de
     `en-avatar.html` par `construire-page-dragonage.py`, et c'est de loin
     la paire qui rend le plus — bandeaux, tamis, HUD, FAQ, bouton de
     lien externe, badge VO ;
   - les paires de données `data-*.js` / `data-*-en.js`, appariées par
     chemin de clé — c'est ce qui rend les libellés de `CG.t`.

   Ce qui reste — l'accroche, les trois repères de lecture, les cinq
   phases, les badges, les résumés — est écrit, et vit dans
   `traductions-dragonage.mjs`.

   DEUX CHOSES NE SONT PAS DES TRADUCTIONS, ET SONT FAITES ICI :

   - le badge **VO**. Aucun comic, roman ni vidéo de cet univers n'a de
     version française, sauf cinq œuvres — le champ `lang` est posé par
     `construire-dragonage.py`, et la page ne montre la pastille que
     lorsque `T.lang !== 'en'`. Rien à faire de ce côté-ci : le champ est
     technique, il traverse.
   - les **deux liens YouTube**. Le document donne l'adresse de la vidéo
     et celle de la liste de lecture, toutes deux en anglais sans
     sous-titres officiels : la page française ne pointe donc pas la
     vidéo mais une recherche « VOSTFR ». C'est `LIENS_FR` plus bas.

       node _proto/traduire-dragonage.mjs          écrit les deux fichiers
       node _proto/traduire-dragonage.mjs --check  n'écrit rien
       node _proto/traduire-dragonage.mjs --detail liste ce qui manque

   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DA_IDENTIQUES, DA_TRADUCTIONS, DA_GABARITS } from './traductions-dragonage.mjs';

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
const identiques = new Set(DA_IDENTIQUES.map(net));

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
   `en-marvel.html` sort de `e-marvel.html`, `e-startrek.html` sort de
   `en-startrek.html` : dans les deux sens, les deux fichiers ont le même
   nombre de lignes et la même découpe. On apparie donc les textes et les
   attributs par rang à l'intérieur de chaque ligne. */
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

/* Avatar Legends d'abord : c'est la page dont celle-ci est bâtie, et la
   première vue gagne en cas de collision. Le volet FAQ, le repère
   FLASHBACK, le badge VO, le bouton de lien externe et le compte en
   entrées plutôt qu'en heures y ont exactement le sens qu'ils ont ici.
   The Walking Dead et Star Trek suivent : ce sont les deux autres pages
   dont la source est anglaise, donc les deux autres qui ont déjà eu à
   nommer en français ce que le gabarit ne portait pas. */
const PAIRES_PAGES = [
  ['e-avatar.html', 'en-avatar.html'],
  ['e-twd.html', 'en-twd.html'],
  ['e-startrek.html', 'en-startrek.html'],
  ['e-accueil.html', 'en-accueil.html'],
  ['e-starwars.html', 'en-starwars.html'],
  ['e-marvel.html', 'en-marvel.html'],
  ['e-dc.html', 'en-dc.html'],
  ['e-dossiers.html', 'en-dossiers.html'],
  ['e-dossier-star-wars.html', 'en-dossier-star-wars.html'],
  ['e-nouveautes.html', 'en-nouveautes.html'],
  ['e-a-venir.html', 'en-a-venir.html'],
];

/* UNE ZONE `i18n-off` N'ENTRE PAS AU LEXIQUE. C'est le pendant, à la
   lecture, de ce que `traduire-pages.mjs` fait à l'écriture — et il a
   manqué. Le radar porte les deux langues côte à côte dans un seul
   fichier, la page choisissant ses mots à l'exécution : les deux protos
   sont donc identiques sur ces lignes, et l'appariement y apprenait
   « Year » → « Year », « YouTube trailer » → « YouTube trailer »,
   « en-US » → « en-US ». Les paires de pages passant avant les paires de
   données et la première vue gagnant, ces auto-traductions écrasaient les
   bonnes, qui seraient venues de `data-startrek.js`. La page française de
   The Walking Dead sortait alors avec Year, Rating, Period et un
   `tmdbLang` en `en-US` — donc des synopsis TMDB en anglais. Rien dans la
   console, rien au rapport : « manque : 0 ». */
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
      + `Relancer traduire-pages.mjs (ou traduire-startrek.mjs) avant celui-ci.`);
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
   le contrôle de structure — donc la valeur française se lit au même
   chemin. Star Trek en tête, pour la même raison que ci-dessus. */
const PAIRES_DONNEES = [
  ['data-avatar.js', 'data-avatar-en.js'],
  ['data-twd.js', 'data-twd-en.js'],
  ['data-startrek.js', 'data-startrek-en.js'],
  ['data.js', 'data-en.js'],
  ['data-mcu.js', 'data-mcu-en.js'],
  ['data-dc.js', 'data-dc-en.js'],
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
const ECRIT = new Map(DA_TRADUCTIONS.map(([en, fr]) => [net(en), fr]));

/* La clé du lexique est resserrée sur une seule ligne — c'est ce qui
   permet de retrouver un texte quelle que soit sa mise en forme — donc
   un `\n` ne peut venir que de la traduction. S'il manque, le texte sort
   en un seul pavé, sans qu'aucune erreur ne le dise. */
for (const [en, fr] of DA_TRADUCTIONS) {
  const a = (en.match(/\n/g) || []).length, b = (String(fr).match(/\n/g) || []).length;
  if (a !== b) {
    throw new Error(`traductions-dragonage : ${a} saut(s) de ligne en anglais, ${b} en français`
      + `\n  ${en.slice(0, 90)}…`);
  }
}

/* ═══ TRADUIRE UNE CHAÎNE ═══════════════════════════════════════════ */

const manques = [];      // rien nulle part
const ecrites = [];      // venu de traductions-dragonage.mjs, à relire
const gabaritsVus = new Set();

/* Les gabarits d'abord : « Season 6 Episodes 1-4 » n'a pas à figurer
   dans une table, c'est une forme. Les 41 sous-items en sortent, et les
   quatorze « PHASE N » avec eux. */
function gabarit(v) {
  for (const [re, rendu] of DA_GABARITS) {
    const m = v.match(re);
    if (m) { gabaritsVus.add(String(re)); return rendu(m); }
  }
  return undefined;
}

/* Un morceau de gabarit n'est pas un libellé : `'<div class="bn-body">'`
   est une balise, et si on retire les balises il ne reste pas une lettre.
   Le test porte donc sur ce qui reste une fois les `<…>` enlevés —
   `'<span class="lbl">Reveal</span>'` garde « Reveal » et continue d'être
   signalé, ce qui est bien ce qu'on veut. */
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

const SRC = lire('_proto/data-dragonage-en.js');
const boite = evalue(SRC);
const CG_EN = boite.CG, DA_EN = boite.DRAGONAGE;

/* Ce qui n'est jamais du texte affiché. Liste noire plutôt que liste
   blanche : une liste blanche rate mécaniquement ce qu'elle ne connaît
   pas, et c'est ce qui avait laissé 238 réponses de FAQ en français dans
   la version anglaise de Marvel. */
const TECHNIQUES = new Set([
  'id', 'ids', 'universe', 'color', 'glow', 'img', 'type', 'level', 'kind',
  'tmdb', 'media', 'href', 'key', 'lang', 'locale', 'tags', 'trigger',
  'otherFlag', 'otherHref', 'flag', 'art',
]);

/* Une date in-universe s'écrit pareil des deux côtés. Ici ce sont les
   dates du calendrier de la Chantrie — « 9:30 », « 9:52 » — et le champ
   est déclaré ici plutôt que dans la liste des identiques, qui
   compterait 43 lignes sans rien apprendre. */
const IDENTIQUES_PAR_CHAMP = new Set(['date']);

function traduitObjet(o, chemin = '', cle = '') {
  if (Array.isArray(o)) return o.map((v) => traduitObjet(v, `${chemin}[]`, cle));
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = traduitObjet(v, `${chemin}.${k}`, k);
    return out;
  }
  if (typeof o !== 'string') return o;
  if (TECHNIQUES.has(cle)) return o;
  if (IDENTIQUES_PAR_CHAMP.has(cle)) return o;
  /* L'accroche de la page est un bloc de HTML : l'intro, les trois
     repères de lecture et le dépliant de ce qui n'y est pas. Le poser en
     un seul morceau dans la table le rendrait intraduisible en pratique
     — et surtout, ses intitulés sont ceux des six autres univers, déjà
     écrits en français. On traduit donc nœud de texte par nœud de texte,
     et le lexique les retrouve. */
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
   univers : il porte des clés que personne d'autre n'a — les cinq badges
   de Thedas, les huit types de médias, les trois questions de FAQ. */
const CG_FR = traduitObjet(CG_EN, 'CG');
CG_FR.t.lang = 'fr';
CG_FR.t.locale = 'fr-FR';
const DA_FR = traduitObjet(DA_EN, 'DRAGONAGE');

/* ── les deux liens YouTube, côté français ─────────────────────────
   « Warden's Fall » et la websérie « Redemption » n'existent qu'en
   anglais : ni doublage, ni sous-titres officiels. Pointer la vidéo
   depuis la page française enverrait le lecteur sur de la VO nue. Le
   bouton pointe donc une recherche YouTube « VOSTFR » — c'est ce que
   Niko a demandé, et c'est le seul endroit où les deux versions d'une
   même entrée ne mènent pas au même endroit.

   `href` est un champ technique : il traverse la traduction sans être
   regardé, et c'est bien ici qu'il doit être remplacé. Le libellé, lui,
   est traduit juste avant — on l'écrase, la recherche n'étant pas la
   vidéo. */
const LIENS_FR = {
  'da-wfall-1': {
    href: 'https://www.youtube.com/results?search_query=Dragon+Age+Warden%27s+Fall+VOSTFR',
    label: 'Chercher en VOSTFR sur YouTube',
  },
  'da-redemption-1': {
    href: 'https://www.youtube.com/results?search_query=Dragon+Age+Redemption+VOSTFR',
    label: 'Chercher en VOSTFR sur YouTube',
  },
};
{
  const vus = new Set();
  for (const era of DA_FR.eras) {
    for (const e of era.entries) {
      const l = LIENS_FR[e.id];
      if (!l) continue;
      if (!e.link) throw new Error(`${e.id} n'a pas de lien à remplacer`);
      e.link = { href: l.href, label: l.label };
      vus.add(e.id);
    }
  }
  for (const id of Object.keys(LIENS_FR)) {
    if (!vus.has(id)) throw new Error(`LIENS_FR : ${id} ne figure plus dans la timeline`);
  }
}

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
memesCles(DA_EN, DA_FR, 'DRAGONAGE');
memesCles(CG_EN, CG_FR, 'CG');

/* 2. le champ resté anglais : si toutes les valeurs d'un champ sont
   identiques des deux côtés, il n'a pas été traduit. C'est le contrôle
   qui a révélé les 121 FAQ Marvel restées en français.

   Deux champs y échappent, et c'est propre à cet univers : sur les
   trente-six œuvres de Dragon Age, **cinq seulement ont un titre
   français** — les trois comics de l'Intégrale Volume 1 et les deux
   romans parus chez Milady — et « PHASE 3 » s'écrit pareil des deux
   côtés. Le contrôle dirait vrai — ces champs n'ont presque pas bougé —
   sans rien signaler d'anormal.

   `title` porte aussi les cinq titres de phase, qui eux se traduisent :
   le garde-fou de variété, plus bas, les surveille. */
const CHAMPS_SANS_CONTROLE = new Set(['title', 'phase']);
function parChamp(o, acc = {}, cle = '') {
  if (Array.isArray(o)) o.forEach(v => parChamp(v, acc, cle));
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) parChamp(v, acc, k);
  } else if (typeof o === 'string' && cle) (acc[cle] ||= []).push(o);
  return acc;
}
{
  const ce = parChamp(DA_EN), cf = parChamp(DA_FR);
  for (const k of Object.keys(ce)) {
    if (TECHNIQUES.has(k) || IDENTIQUES_PAR_CHAMP.has(k) || CHAMPS_SANS_CONTROLE.has(k)) continue;
    const textuels = ce[k].filter(v => /\p{L}{3}/u.test(v));
    if (textuels.length < 3) continue;
    const bouge = ce[k].some((v, i) => v !== cf[k][i]);
    if (!bouge) alertes.push(`le champ « ${k} » est resté anglais sur ses ${ce[k].length} valeurs`);
  }
}

/* 3. la variété : cinq titres de phase distincts d'un côté et un seul
   de l'autre, ce n'est pas une traduction, c'est un appariement raté. */
{
  const ce = parChamp(DA_EN), cf = parChamp(DA_FR);
  for (const k of Object.keys(ce)) {
    const a = new Set(ce[k]).size, b = new Set(cf[k]).size;
    if (a > 3 && b < a / 2) alertes.push(`le champ « ${k} » perd sa variété : ${a} valeurs distinctes en anglais, ${b} en français`);
  }
}

/* ═══ ÉCRIRE LES DONNÉES ════════════════════════════════════════════
   On reprend le fichier anglais et on remplace ses deux blocs JSON en
   place : même squelette, mêmes commentaires, même nombre de lignes. La
   table `RT` n'est pas touchée — ce sont des minutes. */
const js = o => JSON.stringify(o);

function remplaceBloc(src, decl, valeur) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error(`bloc introuvable dans data-dragonage-en.js : ${decl}`);
  const fin = src.indexOf('\n', i);
  const ligne = src.slice(i, fin);
  const pointVirgule = ligne.trimEnd().endsWith(';') ? ';' : '';
  return src.slice(0, i) + decl + js(valeur) + pointVirgule + src.slice(fin);
}

const ENTETE_FR = `/* Version francaise de data-dragonage-en.js — produite par
   traduire-dragonage.mjs. Dragon Age est le troisieme univers dont la source
   est anglaise, apres Star Trek et The Walking Dead : Niko a ecrit ce guide-la
   dans cette langue, et le francais en descend. Tout ce qui appartient au
   gabarit du site est retrouve dans les onze autres protos, jamais retraduit ;
   ce qui est propre a cet univers — l'accroche, les reperes de lecture, les
   cinq phases, les badges, les resumes — est ecrit dans
   traductions-dragonage.mjs. Ne pas editer a la main : relancer le script.

   Deux differences avec l'anglais, et elles sont voulues. Trente et une des
   trente-six oeuvres gardent leur titre, faute d'edition francaise, et portent
   alors le badge VO (champ lang, pose par construire-dragonage.py) ; les cinq
   autres — les trois comics de l'Integrale Volume 1 et les deux romans parus
   chez Milady — prennent leur titre francais. Et les deux liens YouTube
   pointent ici une recherche VOSTFR, non la video : elle n'existe qu'en
   anglais. */`;

let sortie = SRC;
sortie = remplaceBloc(sortie, 'window.CG=', CG_FR);
sortie = remplaceBloc(sortie, 'var DATA_DA=', DA_FR);
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

const PAGE = lire('_proto/en-dragonage.html');
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
    /* L'espace du bord appartient au gabarit, pas au libellé : la clé du
       lexique est resserrée par `net()`, donc la traduction revient
       rognée. On retrouve les bords de la chaîne d'origine, exactement
       comme le fait la branche HTML avec `tete` et `queue`. */
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
  .replace(/(<script\s+src=")data-dragonage-en\.js(")/, '$1data-dragonage.js$2')
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
  if (!re.test(pageFR)) throw new Error('pas de sélecteur de langue dans en-dragonage.html');
  pageFR = pageFR.replace(re, (bloc) => {
    const lignes = bloc.split('\n');
    const out = [
      '<a class="icon-btn lang-btn" href="en-dragonage.html" aria-label="Switch to English" title="Switch to English">',
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
console.log(`  gabarits : ${gabaritsVus.size}/${DA_GABARITS.length} employés`);

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
fs.writeFileSync(path.join(RACINE, '_proto/a-traduire-dragonage.json'),
  JSON.stringify([...uniques.values()], null, 1), 'utf8');

if (process.argv.includes('--detail')) {
  for (const m of uniques.values()) console.log(`\n  [${m.ou}] ${m.en.slice(0, 160)}`);
}

if (!CHECK) {
  if (alertes.length || uniques.size) {
    console.log('\n  rien n\'a été écrit : le bilan n\'est pas propre.');
    process.exit(1);
  }
  fs.writeFileSync(path.join(RACINE, '_proto/data-dragonage.js'), sortie, 'utf8');
  fs.writeFileSync(path.join(RACINE, '_proto/e-dragonage.html'), pageFR, 'utf8');
  console.log('\n  → _proto/data-dragonage.js\n  → _proto/e-dragonage.html');
  fs.writeFileSync(path.join(RACINE, '_proto/a-relire-dragonage.json'),
    JSON.stringify([...parEcrite.values()], null, 2), 'utf8');
}
