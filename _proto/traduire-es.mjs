/* ═══ L'ESPAGNOL DU SITE ══════════════════════════════════════════════
   Produit les pages `es-*.html` et les données `data-*-es.js` depuis
   l'anglais, pour tous les univers à la fois. L'anglais est la seule
   langue que toutes les pages ont : les chaînes françaises en tirent leur
   anglais (traduire.mjs, traduire-pages.mjs), les chaînes inversées l'ont
   pour source. L'espagnol vient donc toujours après eux :

       node _proto/traduire.mjs && node _proto/traduire-pages.mjs
       node _proto/traduire-es.mjs              écrit tout ce qui est propre
       node _proto/traduire-es.mjs sw --check   n'écrit rien, liste ce qui manque

   Variante d'Espagne (es-ES), tutoiement — tranché par Niko le
   14 novembre 2026. Titres de l'exploitation espagnole.

   RIEN N'EST RETROUVÉ, TOUT EST ÉCRIT. Il n'y a jamais eu d'espagnol en
   ligne. Les textes vivent dans `_proto/es/` :

   - `lexique.mjs`  — le gabarit du site, commun à toutes les pages
                      (menu, pied, filtres, CG.t, boutons) ;
   - `<cle>.mjs`    — ce qui est propre à un univers (titres, ères, FAQ) ;
   - `gabarits.mjs` — les formes (« Season 2 Episodes 1-4 »).

   La clé est le texte anglais resserré (`net()`), donc une phrase dite
   deux fois n'est traduite qu'une fois, et une phrase anglaise corrigée
   ressort dans `a-traduire-es-<cle>.json` au passage suivant — c'est le
   témoin de fraîcheur de cette chaîne-ci. Un univers qui a un manque
   n'est pas écrit : son espagnol reste celui d'avant, rien ne casse.

   LE MOTEUR : `e-app-es.js` est tiré de `e-app.js` par `moteur-es.mjs`,
   lancé à la fin de ce script.
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { net, evalue, chainesDu, finBloc, APPELS_DOM, zonesProtegees } from './es/outils.mjs';
import { GABARITS } from './es/gabarits.mjs';
import { LEXIQUE, IDENTIQUES } from './es/lexique.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const lire = p => fs.readFileSync(path.join(ICI, p), 'utf8');
const existe = p => fs.existsSync(path.join(ICI, p));

/* ═══ LES UNIVERS ══════════════════════════════════════════════════════
   `page` : le proto anglais ; `donnees` : les fichiers anglais et leur
   sortie espagnole. Un univers entre ici quand sa table est écrite —
   l'accueil et Star Wars d'abord, validés à l'écran, puis les autres. */
export const UNIVERS = {
  accueil: { page: 'en-accueil.html', sortie: 'es-accueil.html' },
  sw:      { page: 'en-starwars.html', sortie: 'es-starwars.html',
             donnees: [['data-en.js', 'data-es.js']] },
};

/* ═══ CE QUI N'EST JAMAIS DU TEXTE ═════════════════════════════════════
   Liste noire, jamais liste blanche : la leçon de `faq.comment`. */
const TECHNIQUES = new Set([
  'id', 'ids', 'idsRelease', 'universe', 'color', 'glow', 'img', 'type', 'level', 'kind', 'k', 'c',
  'tmdb', 'media', 'href', 'key', 'lang', 'locale', 'tags', 'trigger', 'uni', 'nat', 'vo',
  'otherFlag', 'otherHref', 'flag', 'art', 'banner', 'tmdb_banner', 'softcanon', 'open',
  'cols', 'groups', 'special', 'ref', 'covers', 'drop', 'rt', 'branch', 'ol', 'zone',
  'tmdbLang', 'tmdbKey', 'rawgKey', 'rawg', 'isbn', 'season', 'ep', 'icon', 'emoji',
]);
/* Une date de timeline ne se traduit jamais (« BBY » reste « BBY »). */
const IDENTIQUES_PAR_CHAMP = new Set(['date', 'rel', 'present']);

/* ═══ LE LEXIQUE ═══════════════════════════════════════════════════════ */
const identiques = new Set(IDENTIQUES.map(net));
const commun = new Map(Object.entries(LEXIQUE).map(([k, v]) => [net(k), v]));

function chargeTable(cle) {
  const f = path.join(ICI, 'es', `${cle}.mjs`);
  if (!fs.existsSync(f)) return new Map();
  return import(pathToFileURL(f)).then(m => new Map(Object.entries(m.default || {}).map(([k, v]) => [net(k), v])));
}

/* Les sauts de paragraphe des FAQ ne peuvent venir que de la traduction :
   la clé est resserrée sur une ligne. On compte des deux côtés. */
function controleSauts(table, nom) {
  for (const [en, es] of table) {
    if (typeof es !== 'string') throw new Error(`${nom} : valeur non textuelle pour « ${en.slice(0, 60)} »`);
  }
}
controleSauts(commun, 'lexique');

/* Une forme : « Season 6 Episodes 1-4 » n'a pas à figurer dans une table. */
function gabarit(v) {
  for (const [re, rendu] of GABARITS) {
    const m = v.match(re);
    if (m) return rendu(m);
  }
  return undefined;
}

const estGabarit = v => (/[<>]/.test(v) && !/\p{L}/u.test(v.replace(/<[^>]*>?|<|>/g, '')))
  || /^(\\[nrt])+$/.test(v);

/* Un décompte qui bouge ne doit pas faire tomber sa phrase : « / 63 · 6
   stations » se cherche aussi en « / {n} · {n} stations », et les nombres
   reviennent dans l'ordre. Même idée que les jetons de traduire-pages.mjs. */
const NOMBRE = /\d+(?:[.,]\d{3})*(?:[.,]\d+)?/g;
function parGabarit(c, tables) {
  if (!NOMBRE.test(c)) return undefined;
  NOMBRE.lastIndex = 0;
  const nombres = c.match(NOMBRE);
  const cle = c.replace(NOMBRE, '{n}');
  for (const t of tables) {
    if (!t.has(cle)) continue;
    let i = 0;
    return t.get(cle).replace(/\{n\}/g, () => {
      const n = nombres[i++] ?? '';
      return /^\d{1,3}(,\d{3})+$/.test(n) ? n.replace(/,/g, '.') : n;   // 1,028 → 1.028
    });
  }
  return undefined;
}

/* `strict` : une chaîne du JS qui n'est dans aucune table n'est signalée
   que si elle a l'air d'une phrase. Un mot seul en minuscules est presque
   toujours une classe, une clé ou un état (« must », « fav », « end ») :
   il n'est traduit que si une table le connaît. */
const resteDuCode = v => /^\s*(?:[-[\/#.]|use strict|\[)|\.(?:json|webp|png|jpe?g|svg|js)\b|^\s*[A-Z]\s*$|\($|^[\w-]+\/[\w.+-]+$|^\s*\d+[a-z]+\s*$|[à-ÿ]|[=;{}\\]|\b(?:var|url|calc|rotate|translate)\(|https?:|^\s*[#.]?[a-z][\w-]*\s*$|^[\W\d_]*$|^&\w+;$|^\(.*\)$/.test(v);

function traducteur(propre, manques, cle) {
  return function traduit(v, ou, strict = false) {
    const brut = String(v);
    const c = net(brut);
    if (!c || !/\p{L}/u.test(c)) return brut;
    if (estGabarit(c)) return brut;
    if (identiques.has(c)) return brut;
    const g = gabarit(c);
    if (g !== undefined) return g;
    if (propre.has(c)) return propre.get(c);
    if (commun.has(c)) return commun.get(c);
    const n = parGabarit(c, [propre, commun]);
    if (n !== undefined) return n;
    if (strict && resteDuCode(c)) return brut;
    manques.push({ ou: `${cle}:${ou}`, en: c, sauts: (brut.match(/\n/g) || []).length });
    return brut;
  };
}

/* ═══ LES DONNÉES ══════════════════════════════════════════════════════ */
const TEXTES = />([^<>]+)</g;
const ATTRS = /(?:aria-label|title|placeholder|alt|data-label)="([^"]*)"/g;

function traduitObjet(o, traduit, chemin = '', cle = '') {
  if (Array.isArray(o)) return o.map(v => traduitObjet(v, traduit, `${chemin}[]`, cle));
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = traduitObjet(v, traduit, `${chemin}.${k}`, k);
    return out;
  }
  if (typeof o !== 'string') return o;
  if (TECHNIQUES.has(cle) || IDENTIQUES_PAR_CHAMP.has(cle)) return o;
  /* Un champ qui porte du HTML (les accroches) se traduit nœud par nœud. */
  if (/<[a-z][^>]*>/i.test(o)) {
    return o.replace(TEXTES, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      const tete = v.match(/^\s*/)[0], queue = v.match(/\s*$/)[0];
      return '>' + tete + traduit(v, chemin) + queue + '<';
    }).replace(ATTRS, (t, v) => (!v.trim() || !/\p{L}/u.test(v)) ? t
      : t.replace(`"${v}"`, `"${String(traduit(v, chemin)).replace(/"/g, '&quot;')}"`));
  }
  /* Les bords d'espace appartiennent à la donnée (« Season 2 Episode 16 »
     suivi de « » comme séparateur) : on les garde. */
  const tete = o.match(/^\s*/)[0], queue = o.slice(o.replace(/\s+$/, '').length);
  const coeur = o.slice(tete.length, o.length - queue.length);
  if (!coeur) return o;
  return tete + traduit(coeur, chemin) + queue;
}

/* Chaque déclaration de premier niveau qui porte un littéral est remplacée
   en place par sa traduction : même squelette, mêmes commentaires. */
function traduitDonnees(src, traduit) {
  const boite = evalue(src);
  const decl = /(?:^|\n)\s*(window\.([A-Za-z_$][\w$]*)|(?:const|var|let)\s+([A-Za-z_$][\w$]*))\s*=\s*/g;
  const morceaux = [];
  let m;
  while ((m = decl.exec(src))) {
    const nom = m[2] || m[3];
    const debut = m.index + m[0].length;
    if (src[debut] !== '{' && src[debut] !== '[') continue;
    const fin = finBloc(src, debut);
    const valeur = boite[nom];
    if (valeur === undefined) throw new Error(`déclaration introuvable à l'évaluation : ${nom}`);
    morceaux.push({ debut, fin, nom, valeur });
    decl.lastIndex = fin;
  }
  let out = src;
  const sorties = {};
  for (let k = morceaux.length - 1; k >= 0; k--) {
    const { debut, fin, nom, valeur } = morceaux[k];
    let t = traduitObjet(valeur, traduit, nom);
    if (t && t.t && t.t.lang) { t.t.lang = 'es'; t.t.locale = 'es-ES'; }
    if (t && t.tmdbLang) t.tmdbLang = 'es-ES';
    sorties[nom] = t;
    out = out.slice(0, debut) + JSON.stringify(t) + out.slice(fin);
  }
  return { out, sorties, entree: boite };
}

/* ═══ LA PAGE ══════════════════════════════════════════════════════════ */
function reflow(es, origine) {
  const lignes = origine.split('\n');
  if (lignes.length === 1) return es;
  const creux = lignes.slice(1).map(l => l.match(/^[ \t]*/)[0]);
  const mots = String(es).split(/\s+/).filter(Boolean);
  if (mots.length < lignes.length) return es + creux.map(c => '\n' + c).join('');
  const par = Math.ceil(mots.length / lignes.length);
  const bouts = [];
  for (let i = 0; i < lignes.length; i++) bouts.push(mots.slice(i * par, (i + 1) * par).join(' '));
  const reste = mots.slice(lignes.length * par);
  if (reste.length) bouts[bouts.length - 1] += ' ' + reste.join(' ');
  return bouts.map((b, i) => (i === 0 ? b : creux[i - 1] + b)).join('\n');
}

function traduitJs(js, traduit, ou) {
  const protegees = zonesProtegees(js);
  const trouvees = chainesDu(js);
  let out = js;
  for (let k = trouvees.length - 1; k >= 0; k--) {
    const { debut, fin, quote, val } = trouvees[k];
    if (!val || !/\p{L}/u.test(val)) continue;
    if (/^\s*(fr|en|es)\s*$/.test(val)) continue;           // un code de langue n'est pas un mot
    if (protegees.some(([a, b]) => debut >= a && fin <= b)) continue;
    if (APPELS_DOM.test(js.slice(Math.max(0, debut - 60), debut))) continue;
    /* comparée, c'est une valeur (x.type==='Trailer', ev.key==='Escape') */
    if (/(?:[!=]==?|case)s*$/.test(js.slice(Math.max(0, debut - 12), debut))) continue;
    if (/^s*(?:===?|!==?)/.test(js.slice(fin, fin + 6))) continue;
    if (quote === '`' && /\$\{/.test(val)) continue;          // gabarit à trous : à la main
    const tete = val.match(/^\s*/)[0];
    const queue = val.slice(val.replace(/\s+$/, '').length);
    const coeur = val.slice(tete.length, val.length - queue.length);
    if (!coeur) continue;
    /* Un fragment de HTML dans une chaîne (les gabarits de rendu concatènent
       `'" title="'`, `'">NEXUS · CENTRAL STATION'`…) : seul ce qui est entre
       un `>` et un `<` — ou un bord — est du texte, et seulement s'il a
       l'air d'une phrase. Le reste est du balisage. */
    let es;
    if (/[<>]/.test(coeur)) {
      es = coeur.replace(/(^|>)([^<>]*)(?=<|$)/g, (t, g, v) => {
        if (!v.trim() || !/\p{L}{2}/u.test(v) || resteDuCode(v) || /"/.test(v)) return t;
        const a = v.match(/^\s*/)[0], b = v.match(/\s*$/)[0];
        return g + a + traduit(v, ou, true) + b;
      });
    } else {
      es = traduit(coeur, ou, true);
    }
    if (es === coeur) continue;
    const rendu = tete + es + queue;
    out = out.slice(0, debut) + quote + rendu.split(quote).join('\\' + quote) + quote + out.slice(fin);
  }
  return out;
}

function traduitPage(src, traduit) {
  const decoupe = /<style[\s\S]*?<\/style>|<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g;
  const zones = [];
  let pos = 0, m;
  while ((m = decoupe.exec(src))) {
    zones.push({ type: 'html', txt: src.slice(pos, m.index) });
    zones.push({ type: m[0].startsWith('<script') ? 'js' : 'brut', txt: m[0] });
    pos = m.index + m[0].length;
  }
  zones.push({ type: 'html', txt: src.slice(pos) });

  /* Un bloc `i18n-off` dans le HTML ne se traduit pas non plus. */
  let off = false;
  return zones.map(z => {
    if (z.type === 'brut') {
      if (z.txt.includes('i18n-off')) off = true;
      if (z.txt.includes('i18n-on')) off = false;
      return z.txt;
    }
    if (z.type === 'js') return traduitJs(z.txt, traduit, 'js');
    if (off) return z.txt;
    let out = z.txt.replace(TEXTES, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      const tete = v.match(/^\s*/)[0], queue = v.match(/\s*$/)[0];
      const coeur = v.slice(tete.length, v.length - queue.length);
      return '>' + tete + reflow(traduit(coeur, 'page'), coeur) + queue + '<';
    });
    out = out.replace(ATTRS, (t, v) => {
      if (!v.trim() || !/\p{L}/u.test(v)) return t;
      return t.replace(`"${v}"`, `"${String(traduit(v, 'attribut')).replace(/"/g, '&quot;')}"`);
    });
    return out;
  }).join('');
}

/* La page espagnole charge ses données et son moteur, et renvoie aux
   autres pages espagnoles — à l'anglaise tant qu'une page n'a pas
   d'espagnol : un lien qui répond dans l'autre langue vaut mieux qu'un
   lien mort. */
const PROTOS_ES = new Set(Object.values(UNIVERS).map(u => u.sortie));
function recable(html, u) {
  let h = html.replace(/<html lang="en"/, '<html lang="es"');
  for (const [en, es] of u.donnees || []) {
    h = h.split(`src="${en}"`).join(`src="${es}"`);
  }
  h = h.replace(/src="e-app\.js"/g, 'src="e-app-es.js"');
  h = h.replace(/(["'])en-([a-z0-9-]+\.html)/g, (t, q, nom) =>
    PROTOS_ES.has('es-' + nom) ? q + 'es-' + nom : t);
  return h;
}

/* ═══ LE PASSAGE ═══════════════════════════════════════════════════════ */
const demandes = ARGS.filter(a => !a.startsWith('--'));
const cles = demandes.length ? demandes : Object.keys(UNIVERS);
for (const c of cles) if (!UNIVERS[c]) { console.error(`univers inconnu : ${c}`); process.exit(2); }

console.log(CHECK ? 'CONTRÔLE — rien n\'est écrit\n' : 'ÉCRITURE\n');
let sale = 0;
const tousManques = [];
for (const cle of cles) {
  const u = UNIVERS[cle];
  const propre = await chargeTable(cle);
  controleSauts(propre, cle);
  const manques = [];
  const traduit = traducteur(propre, manques, cle);
  const ecrits = [];

  for (const [en, es] of u.donnees || []) {
    const { out } = traduitDonnees(lire(en), traduit);
    const entete = `/* Version espagnole de ${en} — produite par traduire-es.mjs.\n`
      + `   Ne pas éditer à la main : corriger _proto/es/${cle}.mjs ou _proto/es/lexique.mjs, puis relancer. */\n`;
    ecrits.push([es, entete + out]);
  }
  const page = recable(traduitPage(lire(u.page), traduit), u);
  ecrits.push([u.sortie, page]);

  const uniques = new Map();
  for (const m of manques) if (!uniques.has(m.en)) uniques.set(m.en, m);
  console.log(`  ${cle.padEnd(14)} ${uniques.size ? `${uniques.size} texte(s) manquant(s)` : 'complet'}`);
  fs.writeFileSync(path.join(ICI, `a-traduire-es-${cle}.json`), JSON.stringify([...uniques.values()], null, 1), 'utf8');
  if (uniques.size) { sale++; tousManques.push(...uniques.values()); continue; }
  if (!CHECK) for (const [f, contenu] of ecrits) fs.writeFileSync(path.join(ICI, f), contenu, 'utf8');
}

if (ARGS.includes('--detail')) for (const m of tousManques) console.log(`\n  [${m.ou}] ${m.en.slice(0, 160)}`);

/* Le moteur suit, quoi qu'il arrive : il ne dépend d'aucune table d'univers. */
if (!demandes.length || ARGS.includes('--moteur')) {
  const { execFileSync } = await import('node:child_process');
  try {
    process.stdout.write(execFileSync(process.execPath, [path.join(ICI, 'moteur-es.mjs'), ...(CHECK ? ['--check'] : [])], { encoding: 'utf8' }));
  } catch (e) { process.stdout.write(e.stdout || ''); sale++; }
}

if (sale) { console.log(`\n  ${sale} élément(s) incomplet(s) : rien n'a été écrit pour eux.`); process.exit(1); }
