/* ═══ LES TITRES ESPAGNOLS, ET CE QUI N'EXISTE PAS EN ESPAGNOL ═══════════
   Posé le 14 novembre 2026, demandé par Niko : une option « Títulos en
   español » sur le site espagnol (l'inverse des « Titres originaux » du
   français : par défaut les titres restent anglais), et un badge VO sur ce
   qui n'existe pas en espagnol.

       node _proto/titres-es.mjs              relit ce qui manque, écrit la table
       node _proto/titres-es.mjs --rafraichir sans le cache
       node _proto/titres-es.mjs --check      n'écrit rien

   Sortie : `_proto/es/titres.json`, versionné — `{ id: { es, mx, vo } }`.
   `traduire-es.mjs` la pose dans les données espagnoles : `tes` (titre
   d'Espagne), `tmx` (titre d'Amérique latine quand il diffère), et `lang:'vo'`
   ou `vo:true` (Dossier) sur ce qui n'existe pas en espagnol.

   - **L'écran** : le titre vient des traductions TMDB (`es-ES`, `es-MX`).
     Un titre égal à l'anglais n'est pas écrit. Le suffixe d'une entrée
     (« — First Post-Credits Scene ») suit le titre traduit, en espagnol.
     Ce qui n'a jamais été doublé en espagnol est écrit à la main dans
     `SANS_DOUBLAGE` : TMDB ne le sait pas.
   - **L'écrit** : la Biblioteca Nacional de España (`catalogo.bne.es`, SRU,
     notices MARC). Une notice en espagnol (041/008) dont le titre original
     (240, 246, 500 « Tít. orig. », 765) est exactement celui de l'œuvre
     donne son titre (245) — jamais pour un comic en série numérotée. Le
     badge VO demande deux absences : à la BNE, et en français (la VO du
     français, vérifiée à la BnF). La BNE seule rate trop d'éditions.
     Ce qu'elle ignore ou confond se corrige dans `CORRECTIONS`.
   - **Les jeux** n'ont ni titre ni badge : ils gardent leur titre anglais en
     espagnol, et le badge VO ne les a jamais concernés.
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { charge, SOURCES, decode } from './jsonld.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const CACHE_F = path.join(ICI, '.cache-es.json');
const SORTIE = path.join(ICI, 'es', 'titres.json');
const FORME = 3;                       // monter si la lecture des réponses change
let cache = {};
if (!ARGS.includes('--rafraichir')) try { cache = JSON.parse(fs.readFileSync(CACHE_F, 'utf8')); } catch (_) {}
if (cache.forme !== FORME) cache = { forme: FORME };
const garde = () => { if (!CHECK) fs.writeFileSync(CACHE_F, JSON.stringify(cache)); };

const ECRAN = new Set(['film', 'filmanim', 'serie', 'anime', 'short', 'special', 'web', 'video']);
const ECRIT = new Set(['roman', 'comic', 'jeunesse', 'audio']);

/* Jamais doublé en espagnol : relevé à la main, à partir de la liste VO du
   français. Black Lotus en sort (Crunchyroll la double en espagnol). */
const SANS_DOUBLAGE = new Set([
  'avt-escape-from-the-spirit-world',
  'twd-flight-1', 'twd-passage-1', 'twd-cold-1', 'twd-oath-1', 'twd-torn-1', 'twd-machete-1', 'twd-althea-1', 'twd-water-1',
  'da-wfall-1', 'da-redemption-1', 'da-lastcourt-1',
  'ac-ascendance-1', 'ac-iii-abstergo-hacked-1',
  'jw-babr', 'br-blackout2022', 'br-nexusdawn', 'br-nowheretorun',
  'bl-punching', 'bl-vex', 'bl-rafa', 'bl-amon', 'bl-harlowe', 'bl-c4sh', 'bl-loveless',
]);
/* Ce que la BNE ignore ou confond : `{ id: { es: 'titre' } }` ou `{ id: { vo: false } }`. */
const CORRECTIONS = {
  '48-bby-mace-windu': { es: '' },                               // la notice trouvée ne nomme pas ce comic
  '21-17-bby-catalyst-a-rogue-one-novel': { es: 'Catalizador: una novela de Rogue One' },
  '1-bby-thrawn-treason': { es: 'Thrawn: Traición' },
};

/* ── outils ─────────────────────────────────────────────────────────── */
const attends = ms => new Promise(r => setTimeout(r, ms));
const norm = s => decode(String(s || '')).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const FRANCHISES = /^(star wars|marvel|dc|avatar the last airbender|avatar|the legend of korra|star trek|the walking dead|dragon age|assassin s creed|assassins creed|jurassic world|jurassic park|the witcher|resident evil|biohazard|blade runner|godzilla|kong)\s+/;
const coeur = s => norm(s).replace(/\b(the|a|an)\b /, m => m).replace(FRANCHISES, '').replace(/\b(\d+\s*)+$/, '').trim();
const MOTS_VIDES = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'to', 'on', 'for', 'vol', 'volume', 'part', 'book']);

/* ── TMDB ───────────────────────────────────────────────────────────── */
let CLE = process.env.TMDB_KEY || '';
async function tmdb(media, id) {
  const k = `tmdb:${media}/${id}`;
  if (cache[k]) return cache[k];
  const r = await fetch(`https://api.themoviedb.org/3/${media}/${id}/translations?api_key=${CLE}`);
  if (!r.ok) return null;
  const j = await r.json();
  const t = {};
  for (const x of j.translations || []) {
    const v = (x.data && (x.data.title || x.data.name)) || '';
    if (!v) continue;
    if (x.iso_639_1 === 'es') t[x.iso_3166_1] = v;
    if (x.iso_639_1 === 'en' && x.iso_3166_1 === 'US') t.EN = v;
  }
  cache[k] = t;
  return t;
}

/* ── BNE ────────────────────────────────────────────────────────────── */
function champs(rec, tag, codes) {
  const out = [];
  for (const m of rec.matchAll(new RegExp(`tag="${tag}"[^>]*>([\\s\\S]*?)</datafield>`, 'g'))) {
    const sub = [...m[1].matchAll(/code="(\w)">([^<]*)</g)].filter(s => !codes || codes.includes(s[1]));
    out.push(sub.map(s => [s[1], s[2]]));
  }
  return out;
}
const texte = s => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
async function bne(requete) {
  const k = `bne:${requete}`;
  if (cache[k]) return cache[k];
  const url = 'https://catalogo.bne.es/view/sru/34BNE_INST?version=1.2&operation=searchRetrieve&maximumRecords=12&query='
    + encodeURIComponent(requete);
  let x = '';
  for (let essai = 0; essai < 3 && !x; essai++) {
    try { const r = await fetch(url); if (r.ok) x = await r.text(); } catch (_) {}
    if (!x) await attends(3000);
  }
  await attends(900);
  if (!x) return null;
  const notices = x.split('<record xmlns').slice(1).map(r => {
    const c008 = (r.match(/tag="008">([^<]*)/) || [])[1] || '';
    const langues = champs(r, '041', 'a').flat().map(s => s[1]);
    const t245 = champs(r, '245', 'abnp')[0] || [];
    let titre = '';
    for (const [c, v] of t245) titre += (titre ? (c === 'b' ? ': ' : c === 'p' ? ': ' : ' ') : '') + v;
    const orig = [
      ...champs(r, '240', 'a').map(s => s.map(x => x[1]).join(' ')),
      ...champs(r, '246', 'a').map(s => s.map(x => x[1]).join(' ')),
      ...champs(r, '765', 't').map(s => s.map(x => x[1]).join(' ')),
      ...champs(r, '500', 'a').map(s => s.map(x => x[1]).join(' ')).filter(v => /orig/i.test(v))
        .map(v => v.replace(/^.*?orig[a-z.]*\s*:?\s*/i, '')),
    ];
    const tout = ['100', '245', '240', '246', '490', '500', '765', '830']
      .flatMap(t => champs(r, t).map(s => s.map(x => x[1]).join(' '))).join(' ');
    return { es: c008.slice(35, 38) === 'spa' || langues.includes('spa'),
             titre: texte(titre), orig: orig.map(texte), tout: norm(texte(tout)) };
  });
  cache[k] = notices;
  return notices;
}
/* Le titre espagnol de la notice, nettoyé : le titre parallèle (« = The last
   flight ») tombe, comme « Parte 1 de 6 », « (novela) » et la franchise en
   tête quand le titre anglais ne la porte pas. */
const nettoie = (t, en) => {
  let v = propre(t.split(/\s*=\s*/)[0]).replace(/\s*:?\s*Parte \d+ de \d+$/i, '').replace(/\s*\((novela|cómic|comic)\)$/i, '');
  if (!/^star wars/i.test(en)) v = v.replace(/^Star Wars[,.:]?\s+/i, '');
  return propre(v);
};
const propre = t => t.replace(/®|™/g, '').replace(/\s*:(\s*:)+/g, ':').replace(/\s*[\/:;,.=]\s*$/, '').replace(/\s+:\s+/g, ': ').replace(/\s+\./g, '.')
  .replace(/\s{2,}/g, ' ').replace(/\[|\]/g, '').trim();

/* La notice dit-elle traduire cette œuvre-ci ? Son titre original, franchise
   ôtée, est celui de l'œuvre : à l'identique, ou en entier dans une note
   assez courte pour ne pas parler d'autre chose. */
function correspond(n, c) {
  if (!n.es || !c) return false;
  return n.orig.some(o => {
    const v = coeur(o);
    if (!v) return false;
    if (v === c) return true;
    return c.length >= 8 && (` ${v} `.includes(` ${c} `)) && v.length <= c.length + 30;
  });
}

/* L'écrit rend `{ es }` (un titre sûr), `{ ok }` (une édition espagnole
   existe), `{ rien }` (la BNE ne la connaît pas) ou `{ erreur }`.
   - **Un titre n'est pris que si le titre original est exactement celui de
     l'œuvre** : « contient » suffit à dire qu'une édition existe, pas à
     nommer l'œuvre.
   - **Jamais pour un comic en série numérotée** (« Darth Vader (2015)
     #2-4 ») : l'Espagne le publie en recueils titrés à part, et le titre
     d'un recueil (« ¡Al fuego! ») n'est pas celui de ces numéros. */
const FRANCHISE = {
  sw: /star wars/, mcu: /marvel/, dc: /\b(dc|batman|superman)\b/, avatar: /avatar|korra|aang|kyoshi|yangchen|roku/,
  startrek: /star trek/, twd: /walking dead/, dragonage: /dragon age/, assassinscreed: /assassin/,
  dcanimation: /\b(dc|batman|superman)\b/, jurassic: /jurassic/, witcher: /witcher|brujo|sapkowski/,
  residentevil: /resident evil|biohazard/, bladerunner: /blade runner/, monsterverse: /godzilla|kong|monsterverse/, borderlands: /borderlands/, zelda: /zelda/,
};
async function ecrit(e, nature, univers) {
  const brut = decode(e.title);
  const titre = brut.replace(/\s+[#]?\d+(\s*[-–]\s*\d+)?$/, '');
  const c = coeur(titre);
  if (!c) return null;
  const mots = c.split(' ').filter(m => m.length > 1 && !MOTS_VIDES.has(m)).slice(0, 6);
  if (!mots.length) return null;
  const notices = await bne(`alma.title all "${mots.join(' ')}"`);
  if (!notices) return { erreur: true };
  const n = notices.find(x => correspond(x, c) && (!FRANCHISE[univers] || FRANCHISE[univers].test(x.tout || '')));
  if (!n) return { rien: true };
  const exact = n.orig.some(o => coeur(o) === c);
  const serie = nature === 'comic' && (/\d/.test(brut) || /\(\d{4}\)/.test(brut));
  const es = nettoie(n.titre, brut);
  if (!exact || serie || !es || norm(es) === norm(titre) || norm(es) === c) return { ok: true };
  return { es };
}

/* La VO du français (`lang:'vo'`, `vo:true`), vérifiée à la BnF : une œuvre
   que la BNE ne connaît pas n'est dite « sans espagnol » que si le français
   ne l'a pas non plus. La BNE rate trop d'éditions — surtout d'Amérique
   latine — pour qu'on l'affirme sur elle seule. */
const VO_FR = new Set();
for (const s of Object.values(SOURCES)) {
  const w = charge(RACINE, s.fr[0], s.fr[1])[s.fr[1]];
  for (const era of w.eras) for (const e of era.entries || []) if (e.lang === 'vo') VO_FR.add(e.id);
}
for (const era of charge(RACINE, 'data-dossier-sw.js', 'CGD').CGD.eras)
  for (const x of era.items || []) if (x.vo) VO_FR.add(x.id);

/* ── le passage ─────────────────────────────────────────────────────── */
const table = {};
let lus = 0, erreurs = 0;
const avec = { ecran: 0, ecrit: 0, vo: 0 };

for (const [cle, s] of Object.entries(SOURCES)) {
  const w = charge(RACINE, s.en[0], s.en[1]);
  if (!CLE && w.CG && w.CG.tmdbKey) CLE = w.CG.tmdbKey;
  const U = w[s.en[1]];
  for (const era of U.eras) for (const e of era.entries || []) {
    if (!e.id || !e.title || e.type === 'note' || e.type === 'separator') continue;
    const r = {};
    if (ECRAN.has(e.type)) {
      if (SANS_DOUBLAGE.has(e.id)) r.vo = true;
      if (e.tmdb && e.tmdb !== '0' && (e.media === 'movie' || e.media === 'tv')) {
        const t = await tmdb(e.media, e.tmdb);
        lus++;
        if (t) {
          const titre = decode(e.title);
          const [base, ...suite] = titre.split(' — ');
          const reste = suite.length ? ' — ' + suite.join(' — ') : '';
          const pose = v => v && norm(v) !== norm(base) && norm(v) !== norm(t.EN || '') ? v + reste : '';
          const es = pose(t.ES), mx = pose(t.MX);
          if (es) r.es = es;
          if (mx && mx !== es) r.mx = mx;
          if (r.es || r.mx) avec.ecran++;
        } else erreurs++;
      }
    } else if (ECRIT.has(e.type)) {
      const x = await ecrit(e, e.type, cle);
      lus++;
      if (x && x.erreur) erreurs++;
      else if (x && x.rien && VO_FR.has(e.id)) r.vo = true;
      else if (x && x.es) { r.es = x.es; avec.ecrit++; }
    }
    Object.assign(r, CORRECTIONS[e.id] || {});
    if (r.vo === false) delete r.vo;
    if (r.es === '') delete r.es;
    if (r.vo) avec.vo++;
    if (Object.keys(r).length) table[e.id] = r;
    if (lus % 25 === 0) { garde(); process.stdout.write(`\r  ${lus} œuvres lues…`); }
  }
}

/* Le Dossier : ses lectures, par le même chemin que l'écrit. */
{
  const D = charge(RACINE, 'data-dossier-sw-en.js', 'CGD').CGD;
  for (const era of D.eras) for (const x of era.items || []) {
    if (x.kind !== 'it' || !x.id) continue;
    const r = await ecrit(x, x.k, 'sw');
    lus++;
    const o = {};
    if (r && r.erreur) erreurs++;
    else if (r && r.rien && VO_FR.has(x.id)) o.vo = true;
    else if (r && r.es) { o.es = r.es; avec.ecrit++; }
    Object.assign(o, CORRECTIONS[x.id] || {});
    if (o.vo === false) delete o.vo;
    if (o.es === '') delete o.es;
    if (o.vo) avec.vo++;
    if (Object.keys(o).length) table[x.id] = o;
    if (lus % 25 === 0) { garde(); process.stdout.write(`\r  ${lus} œuvres lues…`); }
  }
}
garde();

console.log(`\r  ${lus} œuvres lues · ${avec.ecran} titres d'écran · ${avec.ecrit} titres d'écrit · ${avec.vo} sans espagnol · ${erreurs} erreur(s)`);
if (erreurs > lus / 10) { console.error('  trop d\'erreurs : la table n\'est pas écrite (réseau ?)'); process.exit(3); }
if (!CHECK) {
  fs.writeFileSync(SORTIE, JSON.stringify(table, null, 1) + '\n');
  console.log(`  écrit : ${path.relative(RACINE, SORTIE)}`);
}
