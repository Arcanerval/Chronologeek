/* ═══ UNE LANGUE DE PLUS, DEPUIS L'ANGLAIS ════════════════════════════
   Le moteur commun des langues qui descendent de l'anglais : l'espagnol
   (14 novembre 2026, `traduire-es.mjs`) et le portugais (15 novembre
   2026, `traduire-pt.mjs`). Chacun de ces deux scripts ne fait que
   décrire sa langue et appeler `traduireLangue()`.

   Produit les pages `<code>-*.html` et les données `data-*-<code>.js`
   depuis l'anglais, pour tous les univers à la fois. L'anglais est la
   seule langue que toutes les pages ont : les chaînes françaises en tirent
   leur anglais (traduire.mjs, traduire-pages.mjs), les chaînes inversées
   l'ont pour source. Une langue d'ici vient donc toujours après eux :

       node _proto/traduire.mjs && node _proto/traduire-pages.mjs
       node _proto/traduire-es.mjs              écrit tout ce qui est propre
       node _proto/traduire-pt.mjs sw --check   n'écrit rien, liste ce qui manque

   RIEN N'EST RETROUVÉ, TOUT EST ÉCRIT. Les textes vivent dans
   `_proto/<code>/` :

   - `lexique.mjs`  — le gabarit du site, commun à toutes les pages
                      (menu, pied, filtres, CG.t, boutons) ;
   - `<cle>.mjs`    — ce qui est propre à un univers (titres, ères, FAQ) ;
   - `gabarits.mjs` — les formes (« Season 2 Episodes 1-4 ») et les
                      suffixes de titres (« — First Post-Credits Scene »).

   La clé est le texte anglais resserré (`net()`), donc une phrase dite
   deux fois n'est traduite qu'une fois, et une phrase anglaise corrigée
   ressort dans `a-traduire-<code>-<cle>.json` au passage suivant — c'est
   le témoin de fraîcheur de cette chaîne-ci. Un univers qui a un manque
   n'est pas écrit : sa version reste celle d'avant, rien ne casse.

   LE MOTEUR : `e-app-<code>.js` est tiré de `e-app.js` par
   `moteur-<code>.mjs`, lancé à la fin.
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { net, evalue, chainesDu, finBloc, APPELS_DOM, zonesProtegees } from './es/outils.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));

/* ═══ LES UNIVERS ══════════════════════════════════════════════════════
   `page` : le proto anglais ; `donnees` : les fichiers anglais. La sortie
   prend le code de la langue : `es-starwars.html`, `data-es.js`. */
const BASE = {
  accueil: { page: 'en-accueil.html', sortie: 'accueil.html' },
  sw:      { page: 'en-starwars.html', sortie: 'starwars.html', donnees: [['data-en.js', 'data-{L}.js']] },
  mcu: { page: 'en-marvel.html', sortie: 'marvel.html', donnees: [['data-mcu-en.js', 'data-mcu-{L}.js']] },
  dc: { page: 'en-dc.html', sortie: 'dc.html', donnees: [['data-dc-en.js', 'data-dc-{L}.js']] },
  avatar: { page: 'en-avatar.html', sortie: 'avatar.html', donnees: [['data-avatar-en.js', 'data-avatar-{L}.js']] },
  startrek: { page: 'en-startrek.html', sortie: 'startrek.html', donnees: [['data-startrek-en.js', 'data-startrek-{L}.js']] },
  twd: { page: 'en-twd.html', sortie: 'twd.html', donnees: [['data-twd-en.js', 'data-twd-{L}.js']] },
  dragonage: { page: 'en-dragonage.html', sortie: 'dragonage.html', donnees: [['data-dragonage-en.js', 'data-dragonage-{L}.js']] },
  assassinscreed: { page: 'en-assassinscreed.html', sortie: 'assassinscreed.html', donnees: [['data-assassinscreed-en.js', 'data-assassinscreed-{L}.js']] },
  dcanimation: { page: 'en-dcanimation.html', sortie: 'dcanimation.html', donnees: [['data-dcanimation-en.js', 'data-dcanimation-{L}.js']] },
  jurassic: { page: 'en-jurassic.html', sortie: 'jurassic.html', donnees: [['data-jurassic-en.js', 'data-jurassic-{L}.js']] },
  witcher: { page: 'en-witcher.html', sortie: 'witcher.html', donnees: [['data-witcher-en.js', 'data-witcher-{L}.js']] },
  residentevil: { page: 'en-residentevil.html', sortie: 'residentevil.html', donnees: [['data-re-en.js', 'data-re-{L}.js']] },
  bladerunner: { page: 'en-bladerunner.html', sortie: 'bladerunner.html', donnees: [['data-bladerunner-en.js', 'data-bladerunner-{L}.js']] },
  monsterverse: { page: 'en-monsterverse.html', sortie: 'monsterverse.html', donnees: [['data-monsterverse-en.js', 'data-monsterverse-{L}.js']] },
  borderlands: { page: 'en-borderlands.html', sortie: 'borderlands.html', donnees: [['data-borderlands-en.js', 'data-borderlands-{L}.js']] },
  zelda: { page: 'en-zelda.html', sortie: 'zelda.html', donnees: [['data-zelda-en.js', 'data-zelda-{L}.js']] },
  avenir: { page: 'en-a-venir.html', sortie: 'a-venir.html' },
  nouveautes: { page: 'en-nouveautes.html', sortie: 'nouveautes.html', donnees: [['data-news-en.js', 'data-news-{L}.js']] },
  dossiers: { page: 'en-dossiers.html', sortie: 'dossiers.html' },
  dossier: { page: 'en-dossier-star-wars.html', sortie: 'dossier-star-wars.html', donnees: [['data-dossier-sw-en.js', 'data-dossier-sw-{L}.js']] },
};
export function univers(code) {
  return Object.fromEntries(Object.entries(BASE).map(([k, u]) => [k, {
    page: u.page, sortie: `${code}-${u.sortie}`,
    ...(u.donnees ? { donnees: u.donnees.map(([en, l]) => [en, l.replace('{L}', code)]) } : {}),
  }]));
}

/* ═══ CE QUI N'EST JAMAIS DU TEXTE ═════════════════════════════════════
   Liste noire, jamais liste blanche : la leçon de `faq.comment`. */
const TECHNIQUES = new Set([
  'id', 'ids', 'idsRelease', 'universe', 'color', 'glow', 'img', 'type', 'level', 'kind', 'k', 'c',
  'tmdb', 'media', 'href', 'key', 'lang', 'locale', 'tags', 'trigger', 'uni', 'nat', 'vo',
  'otherFlag', 'otherHref', 'flag', 'art', 'banner', 'tmdb_banner', 'softcanon', 'open',
  'cols', 'groups', 'special', 'ref', 'covers', 'drop', 'rt', 'branch', 'ol',
  'tmdbLang', 'tmdbKey', 'rawgKey', 'rawg', 'isbn', 'season', 'ep', 'icon', 'emoji', 'defenders', 'universe_key',
]);
/* Une date de timeline ne se traduit jamais (« BBY » reste « BBY »). */
const IDENTIQUES_PAR_CHAMP = new Set(['date', 'rel', 'present']);
/* `zone` se traduit, comme en français : c'est le nom affiché d'une
   correspondance (DC, DC Animation, The Witcher), et la clé de sa
   description (`ZDESC`), que la page traduit aussi. La seule comparaison
   écrite en dur (« The 2 main universes » chez DC) est retouchée dans
   `<code>/dc.mjs`. */
const BLOCS_TECHNIQUES = new Set(['ol']);

/* Les sauts de paragraphe des FAQ ne peuvent venir que de la traduction :
   la clé est resserrée sur une ligne. On compte des deux côtés. */
function controleSauts(table, nom) {
  for (const [en, v] of table) {
    if (typeof v !== 'string') throw new Error(`${nom} : valeur non textuelle pour « ${en.slice(0, 60)} »`);
  }
}

const estGabarit = v => (/[<>]/.test(v) && !/\p{L}/u.test(v.replace(/<[^>]*>?|<|>/g, '')))
  || /^(\\[nrt])+$/.test(v);

/* `strict` : une chaîne du JS qui n'est dans aucune table n'est signalée
   que si elle a l'air d'une phrase. Un mot seul en minuscules est presque
   toujours une classe, une clé ou un état (« must », « fav », « end ») :
   il n'est traduit que si une table le connaît. */
const resteDuCode = v => /^\s*(?:[-[\/#.]|use strict|\[)|\.(?:json|webp|png|jpe?g|svg|js)\b|^\s*[A-Z]\s*$|\($|^[\w-]+\/[\w.+-]+$|^\s*\d+[a-z]+\s*$|[à-ÿ]|[=;{}\\]|\b(?:var|url|calc|rotate|translate)\(|https?:|^\s*[#.]?[a-z][\w-]*\s*$|^[\W\d_]*$|^&\w+;$|^\(.*\)$/.test(v);

const TITRE = /(?:entries|items)\[\]\.title$/;
const TEXTES = />([^<>]+)</g;
const ATTRS = /(?:aria-label|title|placeholder|alt|data-label)="([^"]*)"/g;

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

/* La page charge ses données et son moteur, et renvoie aux autres pages de
   sa langue — à l'anglaise tant qu'une page n'a pas de version : un lien
   qui répond dans l'autre langue vaut mieux qu'un lien mort. */
function reflow(t, origine) {
  const lignes = origine.split('\n');
  if (lignes.length === 1) return t;
  const creux = lignes.slice(1).map(l => l.match(/^[ \t]*/)[0]);
  const mots = String(t).split(/\s+/).filter(Boolean);
  if (mots.length < lignes.length) return t + creux.map(c => '\n' + c).join('');
  const par = Math.ceil(mots.length / lignes.length);
  const bouts = [];
  for (let i = 0; i < lignes.length; i++) bouts.push(mots.slice(i * par, (i + 1) * par).join(' '));
  const reste = mots.slice(lignes.length * par);
  if (reste.length) bouts[bouts.length - 1] += ' ' + reste.join(' ');
  return bouts.map((b, i) => (i === 0 ? b : creux[i - 1] + b)).join('\n');
}

/* ═══ LE PASSAGE ═══════════════════════════════════════════════════════
   `L` décrit la langue :
     code       'es', 'pt' — préfixe des fichiers et dossier des tables ;
     adjectif   'espagnole' — pour l'en-tête des fichiers produits ;
     locale     valeur de `CG.t.locale` et de `tmdbLang` ;
     titres     { champs: [['es', 'tes'], ['mx', 'tmx']] } — les clés de
                `<code>/titres.json` et les champs posés dans les données
                (le premier sert au Dossier) ;
     moteur     'moteur-es.mjs'. */
export async function traduireLangue(L, argv = process.argv.slice(2)) {
  const CODE = L.code;
  const UNIVERS = univers(CODE);
  const CHECK = argv.includes('--check');
  const lire = p => fs.readFileSync(path.join(ICI, p), 'utf8');
  const existe = p => fs.existsSync(path.join(ICI, p));

  const { GABARITS, SUFFIXES = new Map(), SUFFIXES_RE = [] } = await import(pathToFileURL(path.join(ICI, CODE, 'gabarits.mjs')));
  const { LEXIQUE, IDENTIQUES } = await import(pathToFileURL(path.join(ICI, CODE, 'lexique.mjs')));
  const identiques = new Set(IDENTIQUES.map(net));
  const commun = new Map(Object.entries(LEXIQUE).map(([k, v]) => [net(k), v]));
  controleSauts(commun, 'lexique');

  async function chargeTable(cle) {
    const f = path.join(ICI, CODE, `${cle}.mjs`);
    if (!fs.existsSync(f)) return { table: new Map(), retouches: [] };
    const m = await import(pathToFileURL(f));
    return { table: new Map(Object.entries(m.default || {}).map(([k, v]) => [net(k), v])),
             retouches: m.RETOUCHES || [] };
  }

  /* Une forme : « Season 6 Episodes 1-4 » n'a pas à figurer dans une table. */
  function gabarit(v) {
    for (const [re, rendu] of GABARITS) {
      const m = v.match(re);
      if (m) return rendu(m);
    }
    return undefined;
  }

  /* Le titre d'une œuvre reste anglais (décision de Niko) : une entrée de
     timeline ou une lecture du Dossier qu'aucune table ne connaît garde son
     titre. Seul se traduit ce qui suit le dernier tiret quand c'est une
     forme connue — « Thor: Ragnarok — First Post-Credits Scene ». Une table
     d'univers l'emporte toujours. */
  function suffixe(s) {
    if (SUFFIXES.has(s)) return SUFFIXES.get(s);
    for (const [re, f] of SUFFIXES_RE) { const m = s.match(re); if (m) return f(m); }
    const g = gabarit(s);
    if (g !== undefined || s !== s.toUpperCase()) return g;
    /* « THE ACOLYTE — EPISODES 1-2 » : les repères écran du Dossier sont en capitales */
    const bas = s.charAt(0) + s.slice(1).toLowerCase();
    const r = gabarit(bas);
    return r === undefined ? undefined : r.toUpperCase();
  }
  function titreOeuvre(c) {
    const m = c.match(/^(.*\S)(\s+[—–-]\s+)(.+)$/);
    if (!m) return c;
    const s = suffixe(m[3]);
    return s === undefined ? c : m[1] + m[2] + s;
  }

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
      if (TITRE.test(ou)) return titreOeuvre(c);
      manques.push({ ou: `${cle}:${ou}`, en: c, sauts: (brut.match(/\n/g) || []).length });
      return brut;
    };
  }

  /* ── les données ── */
  function traduitObjet(o, traduit, chemin = '', cle = '') {
    /* Un bloc technique entier (la requête Open Library `ol` : `q`, `inc`,
       `exc`) : sa clé `q` ne doit pas devenir technique ailleurs — c'est aussi
       la question de `faqCats`. */
    if (BLOCS_TECHNIQUES.has(cle)) return o;
    if (Array.isArray(o)) return o.map(v => traduitObjet(v, traduit, `${chemin}[]`, cle));
    if (o && typeof o === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(o)) out[k] = traduitObjet(v, traduit, `${chemin}.${k}`, k);
      return out;
    }
    if (typeof o !== 'string') return o;
    /* Les dates de Borderlands sont l'exception à la règle : « Year 6 » est
       une abréviation anglaise, pas une unité du monde comme BBY. Option A
       tranchée par Niko le 16 novembre 2026 (« −18 años », « Hoy ») : la
       table de l'univers les porte sous la clé « date:… ». */
    if (cle === 'date' && /^~?Year \d/.test(o)) return traduit('date:' + o, `${chemin}`);
    /* Zelda, même exception (23 novembre 2026) : ses dates sont des durées en
       toutes lettres, « + ~200-500 YEARS », dont l'unité se traduit. */
    /* Le « + » ou le « - » de tête est ce qui les distingue : l'Arkhamverse
       écrit « YEAR 0 », une date du monde, qui ne se traduit pas. */
    if (cle === 'date' && /^[+-] ~?[\dX].*\b(YEARS?|MONTHS|DAYS)\b/.test(o)) return traduit('date:' + o, `${chemin}`);
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

  /* ── les titres de la langue et le badge VO ──
     `<code>/titres.json` : les titres de l'option « Títulos en español » /
     « Títulos em português », et la VO de la langue — pas celle du
     français, que les données anglaises recopient. Une entrée de second
     parcours sans ligne à elle prend celle de la première entrée qu'elle
     couvre. */
  const CHAMPS = (L.titres && L.titres.champs) || [];
  const TITRES = existe(`${CODE}/titres.json`) ? JSON.parse(lire(`${CODE}/titres.json`)) : null;
  function poseTitres(o) {
    if (!TITRES || !o || typeof o !== 'object') return;
    const listes = ['eras', 'erasRewatch', 'erasReplay', 'erasRelease'].filter(k => Array.isArray(o[k]));
    for (const k of listes) for (const era of o[k]) {
      for (const e of era.entries || []) {
        const r = TITRES[e.id] || (e.covers && TITRES[e.covers[0]]) || null;
        if (e.ref) continue;                       // hérite de l'entrée qu'il désigne
        for (const [, champ] of CHAMPS) delete e[champ];
        if (e.lang === 'vo') delete e.lang;
        if (!r) continue;
        /* le titre vient de TMDB, son suffixe (« — Episode 2 ») de nos données :
           il se traduit comme celui d'un titre anglais */
        for (const [cleT, champ] of CHAMPS) if (r[cleT]) e[champ] = titreOeuvre(r[cleT]);
        if (r.vo) e.lang = 'vo';
      }
      for (const x of era.items || []) {
        if (x.kind !== 'it') continue;
        const r = TITRES[x.id];
        const [cleT, champ] = CHAMPS[0];
        delete x[champ]; x.vo = !!(r && r.vo);
        if (r && r[cleT]) x[champ] = r[cleT].replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]));
      }
    }
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
    for (let k = morceaux.length - 1; k >= 0; k--) {
      const { debut, fin, nom, valeur } = morceaux[k];
      const t = traduitObjet(valeur, traduit, nom);
      if (t && t.t && t.t.lang) { t.t.lang = CODE; t.t.locale = L.locale; }
      if (t && t.tmdbLang) t.tmdbLang = L.locale;
      poseTitres(t);
      out = out.slice(0, debut) + JSON.stringify(t) + out.slice(fin);
    }
    return { out };
  }

  /* ── la page ── */
  const CODES_LANGUE = /^\s*(fr|en|es|pt)\s*$/;
  function traduitJs(js, traduit, ou) {
    const protegees = zonesProtegees(js);
    const trouvees = chainesDu(js);
    let out = js;
    for (let k = trouvees.length - 1; k >= 0; k--) {
      const { debut, fin, quote, val } = trouvees[k];
      if (!val || !/\p{L}/u.test(val)) continue;
      if (CODES_LANGUE.test(val)) continue;           // un code de langue n'est pas un mot
      /* Un seul mot minuscule, sans espace autour, est un identifiant (`MODE='all'`,
         `matchMedia('all')`) : traduit, il casse la page sans un mot. Un libellé
         porte son espace (`' stops'`) ou une majuscule. */
      if (/^[a-z][a-z-]*$/.test(val)) continue;
      if (protegees.some(([a, b]) => debut >= a && fin <= b)) continue;
      if (APPELS_DOM.test(js.slice(Math.max(0, debut - 60), debut))) continue;
      /* comparée, c'est une valeur (x.type==='Trailer', ev.key==='Escape') */
      if (/(?:[!=]==?|case)s*$/.test(js.slice(Math.max(0, debut - 12), debut))) continue;
      if (/^s*(?:===?|!==?)/.test(js.slice(fin, fin + 6))) continue;
      if (quote === '`' && /\$\{/.test(val)) continue;          // gabarit à trous : à la main
      const tete = val.match(/^\s*/)[0];
      const queue = val.slice(val.replace(/\s+$/, '').length);
      const coeur = val.slice(tete.length, val.length - queue.length);
      if (!coeur) continue;
      /* Un fragment de HTML dans une chaîne : seul ce qui est entre un `>` et
         un `<` — ou un bord — est du texte, et seulement s'il a l'air d'une
         phrase. Le reste est du balisage. */
      let t;
      if (/[<>]/.test(coeur)) {
        t = coeur.replace(/(^|>)([^<>]*)(?=<|$)/g, (tt, g, v) => {
          if (!v.trim() || !/\p{L}{2}/u.test(v) || /"/.test(v)) return tt;   // un mot seul se cherche d'abord aux tables (traduit, strict)
          const a = v.match(/^\s*/)[0], b = v.match(/\s*$/)[0];
          return g + a + traduit(v, ou, true) + b;
        });
      } else {
        t = traduit(coeur, ou, true);
      }
      if (t === coeur) continue;
      const rendu = tete + t + queue;
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
        /* Les libellés posés en CSS (`html[lang=en] .ask::before{content:'…'}`,
           le français étant la règle par défaut) : une règle de la langue juste
           après chaque règle anglaise, sinon la page parle français. */
        if (z.txt.startsWith('<style')) {
          return z.txt.replace(/html\[lang=en\]([^{}]+)\{([^{}]*?)content:'((?:[^'\\]|\\.)*)'([^{}]*)\}/g, (t, sel, av, txt, ap) => {
            const coeur = txt.trim();
            const tr = /\p{L}/u.test(coeur) ? traduit(coeur, 'css') : coeur;
            const rendu = txt.replace(coeur, String(tr).replace(/'/g, "\\'"));
            return t + `html[lang=${CODE}]${sel}{${av}content:'${rendu}'${ap}}`;
          });
        }
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

  const PROTOS = new Set(Object.values(UNIVERS).map(u => u.sortie));
  function recable(html, u) {
    let h = html.replace(/<html lang="en"/, `<html lang="${CODE}"`);
    for (const [en, l] of u.donnees || []) {
      h = h.split(`src="${en}"`).join(`src="${l}"`);
    }
    h = h.replace(/src="e-app\.js"/g, `src="e-app-${CODE}.js"`);
    /* Le badge VO s'affiche dans la langue de la page : il dit ce qui n'y
       existe pas (`lang:'vo'` posé par poseTitres, d'après titres-<code>.mjs),
       pas ce qui manque en français. */
    h = h.replace(/(["'])en-([a-z0-9-]+\.html)/g, (t, q, nom) =>
      PROTOS.has(`${CODE}-` + nom) ? q + `${CODE}-` + nom : t);
    return h;
  }

  const demandes = argv.filter(a => !a.startsWith('--'));
  const cles = demandes.length ? demandes : Object.keys(UNIVERS);
  for (const c of cles) if (!UNIVERS[c]) { console.error(`univers inconnu : ${c}`); process.exit(2); }

  console.log(CHECK ? 'CONTRÔLE — rien n\'est écrit\n' : 'ÉCRITURE\n');
  let sale = 0;
  const tousManques = [];
  for (const cle of cles) {
    const u = UNIVERS[cle];
    const { table: propre, retouches } = await chargeTable(cle);
    controleSauts(propre, cle);
    const manques = [];
    const traduit = traducteur(propre, manques, cle);
    const ecrits = [];

    for (const [en, l] of u.donnees || []) {
      const { out } = traduitDonnees(lire(en), traduit);
      const entete = `/* Version ${L.adjectif} de ${en} — produite par traduire-${CODE}.mjs.\n`
        + `   Ne pas éditer à la main : corriger _proto/${CODE}/${cle}.mjs ou _proto/${CODE}/lexique.mjs, puis relancer. */\n`;
      ecrits.push([l, entete + out]);
    }
    let page = recable(traduitPage(lire(u.page), traduit), u);
    for (const [avant, apres] of retouches) {
      if (!page.includes(avant)) { manques.push({ ou: `${cle}:retouche`, en: 'retouche sans cible : ' + avant.slice(0, 90) }); continue; }
      page = page.split(avant).join(apres);
    }
    ecrits.push([u.sortie, page]);

    const uniques = new Map();
    for (const m of manques) if (!uniques.has(m.en)) uniques.set(m.en, m);
    console.log(`  ${cle.padEnd(14)} ${uniques.size ? `${uniques.size} texte(s) manquant(s)` : 'complet'}`);
    fs.writeFileSync(path.join(ICI, `a-traduire-${CODE}-${cle}.json`), JSON.stringify([...uniques.values()], null, 1), 'utf8');
    if (uniques.size) { sale++; tousManques.push(...uniques.values()); continue; }
    if (!CHECK) for (const [f, contenu] of ecrits) fs.writeFileSync(path.join(ICI, f), contenu, 'utf8');
  }

  if (argv.includes('--detail')) for (const m of tousManques) console.log(`\n  [${m.ou}] ${m.en.slice(0, 160)}`);

  /* Le moteur suit, quoi qu'il arrive : il ne dépend d'aucune table d'univers. */
  if (!demandes.length || argv.includes('--moteur')) {
    const { execFileSync } = await import('node:child_process');
    try {
      process.stdout.write(execFileSync(process.execPath, [path.join(ICI, L.moteur), ...(CHECK ? ['--check'] : [])], { encoding: 'utf8' }));
    } catch (e) { process.stdout.write(e.stdout || ''); sale++; }
  }

  if (sale) { console.log(`\n  ${sale} élément(s) incomplet(s) : rien n'a été écrit pour eux.`); process.exit(1); }
}
