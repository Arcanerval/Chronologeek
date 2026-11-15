/* ═══ LES TITRES PORTUGAIS, ET CE QUI N'EXISTE PAS EN PORTUGAIS ════════
   Posé le 15 novembre 2026, sur le modèle de `titres-es.mjs` : une option
   « Títulos em português » sur le site portugais (par défaut les titres
   restent anglais), et un badge VO sur ce qui n'existe pas en portugais.

       node _proto/titres-pt.mjs              relit ce qui manque, écrit la table
       node _proto/titres-pt.mjs --rafraichir sans le cache
       node _proto/titres-pt.mjs --check      n'écrit rien

   Sortie : `_proto/pt/titres.json`, versionné — `{ id: { br, pt, vo } }`.
   `traduire-pt.mjs` la pose dans les données portugaises : `tpt` (titre du
   Brésil), `tpp` (titre du Portugal quand il diffère), et `lang:'vo'` ou
   `vo:true` (Dossier) sur ce qui n'existe pas en portugais.

   - **L'écran** : le titre vient des traductions TMDB (`pt-BR`, `pt-PT`).
     Un titre égal à l'anglais n'est pas écrit. Le suffixe d'une entrée
     (« — First Post-Credits Scene ») suit le titre traduit, en portugais.
     Ce qui n'a jamais été doublé en portugais est écrit à la main dans
     `SANS_DOUBLAGE` : TMDB ne le sait pas.
   - **L'écrit** : ni la Biblioteca Nacional de Portugal (`porbase`, 403) ni
     la Fundação Biblioteca Nacional du Brésil (Cloudflare) ne répondent à un
     script, et Google Books coupe au quota — relevé le 15 novembre 2026. La
     source est donc **Open Library** (déjà utilisée par le site), par ses
     éditions en portugais (`por`). Elle connaît peu d'éditions portugaises :
     les titres sont rares, et c'est voulu qu'ils le soient plutôt que faux.
   - **Le badge VO de l'écrit demande trois absences** : Open Library n'a pas
     d'édition portugaise, **et** l'œuvre n'existe ni en français ni en
     espagnol (la VO de l'espagnol, `es/titres.json`, qui demande déjà la VO
     du français). Open Library seul rate trop d'éditions.
   - **Les jeux** n'ont ni titre ni badge, comme en espagnol.
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { charge, SOURCES, decode } from './jsonld.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const CACHE_F = path.join(ICI, '.cache-pt.json');
const SORTIE = path.join(ICI, 'pt', 'titres.json');
const FORME = 1;                       // monter si la lecture des réponses change
let cache = {};
if (!ARGS.includes('--rafraichir')) try { cache = JSON.parse(fs.readFileSync(CACHE_F, 'utf8')); } catch (_) {}
if (cache.forme !== FORME) cache = { forme: FORME };
const garde = () => { if (!CHECK) fs.writeFileSync(CACHE_F, JSON.stringify(cache)); };

const ECRAN = new Set(['film', 'filmanim', 'serie', 'anime', 'short', 'special', 'web', 'video']);
const ECRIT = new Set(['roman', 'comic', 'jeunesse', 'audio']);

/* Jamais doublé en portugais : la liste de l'espagnol, plus *Black Lotus*,
   que Crunchyroll ne double qu'en espagnol (sous-titrée en portugais). La
   règle du site : jamais doublé vaut VO, même sous-titré. */
const SANS_DOUBLAGE = new Set([
  'avt-escape-from-the-spirit-world',
  'twd-flight-1', 'twd-passage-1', 'twd-cold-1', 'twd-oath-1', 'twd-torn-1', 'twd-machete-1', 'twd-althea-1', 'twd-water-1',
  'da-wfall-1', 'da-redemption-1', 'da-lastcourt-1',
  'ac-ascendance-1', 'ac-iii-abstergo-hacked-1',
  'jw-babr', 'br-blackout2022', 'br-nexusdawn', 'br-nowheretorun',
  'br-blacklotus',
]);
/* Ce qu'Open Library ignore ou confond : `{ id: { br: 'titre' } }` ou `{ id: { vo: false } }`. */
const CORRECTIONS = {};

/* ── outils ─────────────────────────────────────────────────────────── */
const attends = ms => new Promise(r => setTimeout(r, ms));
const norm = s => decode(String(s || '')).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const FRANCHISES = /^(star wars|marvel|dc|avatar the last airbender|avatar|the legend of korra|star trek|the walking dead|dragon age|assassin s creed|assassins creed|jurassic world|jurassic park|the witcher|resident evil|biohazard|blade runner|godzilla|kong)\s+/;
const coeur = s => norm(s).replace(FRANCHISES, '').replace(/\b(\d+\s*)+$/, '').trim();

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
    if (x.iso_639_1 === 'pt') t[x.iso_3166_1] = v;
    if (x.iso_639_1 === 'en' && x.iso_3166_1 === 'US') t.EN = v;
  }
  cache[k] = t;
  return t;
}

/* ── Open Library ───────────────────────────────────────────────────── */
/* Une recherche par titre : les œuvres trouvées, leurs langues, et le titre
   de leur première édition portugaise (`lang=por` la fait passer devant). */
async function ol(titre) {
  const k = `ol:${titre}`;
  if (cache[k]) return cache[k];
  const url = 'https://openlibrary.org/search.json?fields=key,title,language,editions,editions.title,editions.language&lang=por&limit=8&q='
    + encodeURIComponent(`title:(${titre})`);
  let j = null;
  for (let essai = 0; essai < 3 && !j; essai++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': 'Chronologeek (titres-pt.mjs)' } }); if (r.ok) j = await r.json(); } catch (_) {}
    if (!j) await attends(3000);
  }
  await attends(350);
  if (!j) return null;
  const oeuvres = (j.docs || []).map(d => {
    const ed = ((d.editions || {}).docs || [])[0] || {};
    return { titre: d.title || '', langues: d.language || [],
             pt: (ed.language || []).includes('por') ? (ed.title || '') : '' };
  });
  cache[k] = oeuvres;
  return oeuvres;
}

/* L'écrit rend `{ br }` (un titre portugais), `{ ok }` (une édition portugaise
   existe), `{ rien }` (Open Library n'en connaît pas) ou `{ erreur }`.
   Jamais de titre pour un comic en série numérotée, comme en espagnol. */
async function ecrit(e, nature) {
  const brut = decode(e.title);
  const titre = brut.replace(/\s+[#]?\d+(\s*[-–]\s*\d+)?$/, '');
  const c = coeur(titre);
  if (!c || c.length < 3) return null;
  const oeuvres = await ol(titre.replace(/[:"()]/g, ' ').replace(/\s+/g, ' ').trim());
  if (!oeuvres) return { erreur: true };
  const o = oeuvres.find(x => coeur(x.titre) === c && x.langues.includes('por'));
  if (!o) return { rien: true };
  const serie = nature === 'comic' && (/\d/.test(brut) || /\(\d{4}\)/.test(brut));
  const pt = (o.pt || '').replace(/\s+/g, ' ').trim();
  if (serie || !pt || norm(pt) === norm(titre) || coeur(pt) === c) return { ok: true };
  return { br: pt };
}

/* La VO de l'espagnol (`es/titres.json`), qui demande déjà la VO du
   français : une œuvre qu'Open Library ne connaît pas en portugais n'est dite
   « sans portugais » que si elle n'existe ni en français ni en espagnol. */
const VO_ES = new Set();
try {
  const t = JSON.parse(fs.readFileSync(path.join(ICI, 'es', 'titres.json'), 'utf8'));
  for (const [id, r] of Object.entries(t)) if (r.vo) VO_ES.add(id);
} catch (_) { console.error('  es/titres.json introuvable : lancer titres-es.mjs d\'abord'); process.exit(2); }

/* ── le passage ─────────────────────────────────────────────────────── */
const table = {};
let lus = 0, erreurs = 0;
const avec = { ecran: 0, ecrit: 0, vo: 0 };

for (const [, s] of Object.entries(SOURCES)) {
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
          const br = pose(t.BR), pt = pose(t.PT);
          if (br) r.br = br;
          if (pt && pt !== br) r.pt = pt;
          if (r.br || r.pt) avec.ecran++;
        } else erreurs++;
      }
    } else if (ECRIT.has(e.type)) {
      const x = await ecrit(e, e.type);
      lus++;
      if (x && x.erreur) erreurs++;
      else if (x && x.rien && VO_ES.has(e.id)) r.vo = true;
      else if (x && x.br) { r.br = x.br; avec.ecrit++; }
    }
    Object.assign(r, CORRECTIONS[e.id] || {});
    if (r.vo === false) delete r.vo;
    if (r.br === '') delete r.br;
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
    const r = await ecrit(x, x.k);
    lus++;
    const o = {};
    if (r && r.erreur) erreurs++;
    else if (r && r.rien && VO_ES.has(x.id)) o.vo = true;
    else if (r && r.br) { o.br = r.br; avec.ecrit++; }
    Object.assign(o, CORRECTIONS[x.id] || {});
    if (o.vo === false) delete o.vo;
    if (o.br === '') delete o.br;
    if (o.vo) avec.vo++;
    if (Object.keys(o).length) table[x.id] = o;
    if (lus % 25 === 0) { garde(); process.stdout.write(`\r  ${lus} œuvres lues…`); }
  }
}
garde();

console.log(`\r  ${lus} œuvres lues · ${avec.ecran} titres d'écran · ${avec.ecrit} titres d'écrit · ${avec.vo} sans portugais · ${erreurs} erreur(s)`);
if (erreurs > lus / 10) { console.error('  trop d\'erreurs : la table n\'est pas écrite (réseau ?)'); process.exit(3); }
if (!CHECK) {
  fs.writeFileSync(SORTIE, JSON.stringify(table, null, 1) + '\n');
  console.log(`  écrit : ${path.relative(RACINE, SORTIE)}`);
}
