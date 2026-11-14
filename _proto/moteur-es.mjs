/* ═══ LE MOTEUR EN ESPAGNOL ═══════════════════════════════════════════
   `e-app.js` est bilingue dans un seul fichier : chaque libellé s'y écrit
   `FR ? 'français' : 'anglais'`, avec `FR = lang !== 'en'`. Sur une page
   espagnole, `FR` vaut donc vrai, et c'est la branche française qui sert.

   On ne touche pas à `e-app.js`. On en tire `e-app-es.js`, où la branche
   française de chaque bascule est remplacée par **la traduction de la
   branche anglaise** — le même chemin que le reste de la chaîne, qui part
   de l'anglais. Un libellé ajouté demain dans `e-app.js` ressort dans
   `a-traduire-es-moteur.json` au passage suivant, sans qu'on le cherche.

   Une branche anglaise qui n'est pas que des littéraux (`x.f[5]`,
   `e.title_fr`) ne se recopie pas : la française reste, et la bascule doit
   être décidée dans `RETOUCHES` ci-dessous, par son texte exact. Une
   bascule non décidée bloque l'écriture.

       node _proto/moteur-es.mjs            écrit e-app-es.js
       node _proto/moteur-es.mjs --check    n'écrit rien
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { net, chainesDu, masque } from './es/outils.mjs';
import { LEXIQUE, IDENTIQUES } from './es/lexique.mjs';
import { GABARITS } from './es/gabarits.mjs';
import MOTEUR, { RETOUCHES, IMPURES_OK } from './es/moteur.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const SRC = fs.readFileSync(path.join(ICI, 'e-app.js'), 'utf8');
const M = masque(SRC);

const tables = [new Map(Object.entries(MOTEUR).map(([k, v]) => [net(k), v])),
                new Map(Object.entries(LEXIQUE).map(([k, v]) => [net(k), v]))];
const identiques = new Set(IDENTIQUES.map(net));
const manques = new Map();

const resteDuCode = v => /^\s*(?:[-[\/#.]|use strict)|\.(?:json|webp|png|jpe?g|svg|js)\b|^\s*[A-Z]\s*$|\($|^[\w-]+\/[\w.+-]+$|^\s*\d+[a-z]+\s*$|[=;{}\\]|\b(?:var|url|calc|rotate|translate)\(|https?:|^\s*[#.][a-z][\w-]*\s*$|^\s*[a-z]+[-_][\w-]+\s*$|^[\W\d_]*$|^&\w+;$/.test(v);

const NOMBRE = /\d+(?:[.,]\d+)?/g;
function cherche(c) {
  if (identiques.has(c)) return c;
  for (const [re, f] of GABARITS) { const m = c.match(re); if (m) return f(m); }
  for (const t of tables) if (t.has(c)) return t.get(c);
  const nombres = c.match(NOMBRE);
  if (nombres) {
    const k = c.replace(NOMBRE, '{n}');
    for (const t of tables) if (t.has(k)) { let i = 0; return t.get(k).replace(/\{n\}/g, () => nombres[i++] ?? ''); }
  }
  return undefined;
}

function traduit(v, ou) {
  const tete = v.match(/^\s*/)[0], queue = v.slice(v.replace(/\s+$/, '').length);
  const coeur = v.slice(tete.length, v.length - queue.length);
  const c = net(coeur);
  if (!c || !/\p{L}/u.test(c)) return v;
  const t = cherche(c);
  if (t !== undefined) return tete + t + queue;
  /* Un fragment de HTML : les nœuds de texte, un par un. */
  if (/[<>]/.test(coeur)) {
    return v.replace(/(^|>)([^<>]*)(?=<|$)/g, (tt, g, s) => {
      if (!s.trim() || !/\p{L}{2}/u.test(s) || resteDuCode(s) || /"/.test(s)) return tt;
      const a = s.match(/^\s*/)[0], b = s.match(/\s*$/)[0];
      const r = cherche(net(s));
      if (r === undefined) { if (!manques.has(net(s))) manques.set(net(s), ou); return tt; }
      return g + a + r + b;
    });
  }
  if (resteDuCode(c)) return v;
  if (!manques.has(c)) manques.set(c, ou);
  return v;
}

/* Le texte d'un morceau de code, ses littéraux traduits. */
function traduitCode(debut, fin, ou) {
  const bout = SRC.slice(debut, fin);
  const ch = chainesDu(bout);
  let out = bout;
  for (let k = ch.length - 1; k >= 0; k--) {
    const { debut: a, fin: b, quote, val } = ch[k];
    if (quote === '`' && /\$\{/.test(val)) {
      /* gabarit à trous : on traduit les morceaux de texte entre les trous */
      const r = val.replace(/(^|\})([^${}]*)(?=\$\{|$)/g, (t, g, s) => g + (s.trim() ? traduit(s, ou) : s));
      out = out.slice(0, a) + '`' + r + '`' + out.slice(b);
      continue;
    }
    const brut = val.replace(new RegExp('\\\\' + quote, 'g'), quote);
    const r = traduit(brut, ou);
    if (r === brut) continue;
    out = out.slice(0, a) + quote + r.split(quote).join('\\' + quote) + quote + out.slice(b);
  }
  return out;
}

/* ── trouver les bascules ──────────────────────────────────────────── */
const OUVRE = '([{', FERME = ')]}';
function finConsequent(i) {          // i : juste après le `?`
  let prof = 0, imbr = 0;
  for (; i < M.length; i++) {
    const c = M[i];
    if (OUVRE.includes(c)) prof++;
    else if (FERME.includes(c)) { if (prof === 0) return -1; prof--; }
    else if (prof === 0 && c === '?' && M[i + 1] !== '.' && M[i + 1] !== '?' && M[i - 1] !== '?') imbr++;
    else if (prof === 0 && c === ':') { if (imbr === 0) return i; imbr--; }
  }
  return -1;
}
function finAlternative(i) {         // i : juste après le `:`
  let prof = 0, imbr = 0;
  for (; i < M.length; i++) {
    const c = M[i];
    if (OUVRE.includes(c)) prof++;
    else if (FERME.includes(c)) { if (prof === 0) return i; prof--; }
    else if (prof === 0) {
      if (c === ',' || c === ';') return i;
      if (c === '?' && M[i + 1] !== '.' && M[i + 1] !== '?' && M[i - 1] !== '?') imbr++;
      else if (c === ':') { if (imbr === 0) return i; imbr--; }
      else if (c === '\n') {
        const avant = M.slice(0, i).replace(/\s+$/, '').slice(-1);
        const apres = M.slice(i).replace(/^\s+/, '')[0];
        if (!/[+\-*\/?:.,&|(=]/.test(avant) && !/[+\-*\/?:.,&|)\]}]/.test(apres)) return i;
      }
    }
  }
  return M.length;
}

/* Une branche « pure » n'est faite que de littéraux : chaînes, nombres,
   objets et tableaux de littéraux, concaténations. */
const pure = s => !/[A-Za-z$](?![\w$]*\s*:)/.test(s.replace(/'_*'|"_*"|`_*`/g, '').replace(/\b(true|false|null)\b/g, '').replace(/\d+/g, ''))
  || /^\s*[\[{]/.test(s) && !/[A-Za-z$][\w$]*\s*\(|[A-Za-z$][\w$]*\s*[.[](?!\s*$)/.test(s.replace(/'_*'|"_*"|`_*`/g, '').replace(/^\s*[{[]|[\]}]\s*$/g, '').replace(/[\w$]+\s*:/g, ''));

const remplacements = [];
const impures = [];
const re = /\b(FR|EN)\b(\s*)\?(?![.?])/g;
let m;
while ((m = re.exec(M))) {
  const q = m.index + m[0].length;           // après le `?`
  if (/[.\w$]$/.test(M.slice(0, m.index))) continue;     // x.FR, !FR…
  if (/!\s*$/.test(M.slice(Math.max(0, m.index - 3), m.index))) continue;
  const c = finConsequent(q);
  if (c < 0) continue;
  const f = finAlternative(c + 1);
  const [vrai, faux] = [[q, c], [c + 1, f]];
  const [fr, en] = m[1] === 'FR' ? [vrai, faux] : [faux, vrai];
  const texteEn = SRC.slice(en[0], en[1]);
  const ligne = SRC.slice(0, m.index).split('\n').length;
  /* Un objet ou un tableau de libellés se recopie même s'il porte des
     fonctions : leur code vaut pour toutes les langues, seuls les littéraux
     changent. */
  if (!/^\s*[[{]/.test(M.slice(en[0], en[1])) && !pure(M.slice(en[0], en[1]))) {
    impures.push({ ligne, fr: net(SRC.slice(fr[0], fr[1])), en: net(texteEn) });
    continue;
  }
  /* la branche espagnole garde la mise en forme de la française : ses
     blancs de tête et de queue */
  const blancsFr = SRC.slice(fr[0], fr[1]).match(/^\s*/)[0], queueFr = SRC.slice(fr[0], fr[1]).match(/\s*$/)[0];
  const coeurEn = texteEn.trim();
  const debutEn = en[0] + texteEn.indexOf(coeurEn);
  const es = traduitCode(debutEn, debutEn + coeurEn.length, `l.${ligne}`);
  remplacements.push({ a: fr[0], b: fr[1], txt: blancsFr + es + queueFr });
}

let OUT = SRC;
for (const r of remplacements.sort((x, y) => y.a - x.a)) OUT = OUT.slice(0, r.a) + r.txt + OUT.slice(r.b);

/* ── les bascules qui ne sont pas de simples libellés ─────────────────
   Chaque retouche est un remplacement exact ; une retouche qui ne trouve
   plus sa cible arrête tout, comme le reste de la chaîne. */
const ratees = [];
for (const [avant, apres] of RETOUCHES) {
  const n = OUT.split(avant).length - 1;
  if (!n) { ratees.push(avant); continue; }
  OUT = OUT.split(avant).join(apres);
}
const nonDecidees = impures.filter(i => !IMPURES_OK.has(i.en));

/* ── bilan ─────────────────────────────────────────────────────────── */
fs.writeFileSync(path.join(ICI, 'a-traduire-es-moteur.json'),
  JSON.stringify({ manques: [...manques].map(([en, ou]) => ({ ou, en })), impures: nonDecidees, retouchesRatees: ratees }, null, 1), 'utf8');
const propre = !manques.size && !nonDecidees.length && !ratees.length;
console.log(`  moteur         ${remplacements.length} bascules, ${impures.length - nonDecidees.length} décidées à la main`
  + (propre ? ', complet' : ` — ${manques.size} texte(s) manquant(s), ${nonDecidees.length} bascule(s) à décider, ${ratees.length} retouche(s) ratée(s)`));
if (!propre) process.exit(1);
if (!CHECK) {
  fs.writeFileSync(path.join(ICI, 'e-app-es.js'),
    '/* Version espagnole de e-app.js — produite par moteur-es.mjs. Ne pas éditer :\n'
    + '   corriger _proto/es/moteur.mjs ou _proto/es/lexique.mjs, puis relancer. */\n' + OUT, 'utf8');
}
