// films.mjs — l'index des films pour l'import Letterboxd, `/films.json`.
//
// Posé le 13 novembre 2026 (n° 3 de la liste du 5 novembre). Letterboxd
// exporte ce qu'on a vu sous la forme « Name, Year » — son titre et son année
// sont ceux de TMDB, d'où il tire ses fiches. Nos entrées portent l'identifiant
// TMDB mais ni l'année ni le titre TMDB : ce fichier fait le pont, une fois,
// à la publication, plutôt que deux cents requêtes chez le visiteur.
//
// Ce qui entre : toute entrée de la découverte (`eras`) qui porte
// `media:"movie"` et un identifiant TMDB, quel que soit son type — film, film
// d'animation, court, spécial. Les seconds parcours n'y sont pas : ils se
// cochent par le pont (`bootBridge`) au chargement de la page.
//
// Le cache (`_proto/films-cache.json`, versionné) garde ce que TMDB a rendu :
// un film déjà connu ne coûte rien, et GitHub Actions n'a rien à redemander.
// Un film absent du cache est demandé avec la clé publique des données ; sans
// réseau il reste dehors, la publication le dit et continue.
//
// Une ligne de `/films.json` : [tmdb, année, [titres normalisés], [[univers,
// id], …], titre français, titre anglais]. Les titres normalisés sont ceux de
// TMDB (anglais, original, variantes US et GB) et les deux de nos données.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { charge, SOURCES, decode } from './jsonld.mjs';
import { ENCRES } from './recherche.mjs';

export function norme(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]/g, '');
}

async function tmdb(id, cle) {
  const r = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${cle}` +
    '&language=en-US&append_to_response=alternative_titles');
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  const d = await r.json();
  const alt = ((d.alternative_titles && d.alternative_titles.titles) || [])
    .filter(x => /^(US|GB)$/.test(x.iso_3166_1)).map(x => x.title);
  return { y: +(d.release_date || '').slice(0, 4) || 0, t: [d.title, d.original_title, ...alt].filter(Boolean) };
}

export async function films({ racine }) {
  const fichierCache = join(racine, '_proto', 'films-cache.json');
  const cache = existsSync(fichierCache) ? JSON.parse(readFileSync(fichierCache, 'utf8')) : {};
  const cle = charge(racine, 'data-en.js').CG.tmdbKey;

  const parId = new Map();   // tmdb → { ids:[[u,id]], fr, en, titres:Set }
  const noms = {};
  for (const u of Object.keys(SOURCES)) {
    const [ff, gf] = SOURCES[u].fr, [fe, ge] = SOURCES[u].en;
    const fr = charge(racine, ff, gf)[gf], en = charge(racine, fe, ge)[ge];
    noms[u] = { fr: decode(fr.title).split(' — ')[0], en: decode(en.title).split(' — ')[0], c: ENCRES[u] || '' };
    const titresFr = {};
    fr.eras.forEach(era => (era.entries || []).forEach(e => { if (e && e.id) titresFr[e.id] = decode(e.title); }));
    en.eras.forEach(era => (era.entries || []).forEach(e => {
      if (!e || e.media !== 'movie' || !+e.tmdb) return;
      const id = String(+e.tmdb);
      if (!parId.has(id)) parId.set(id, { ids: [], fr: titresFr[e.id] || decode(e.title), en: decode(e.title), titres: new Set() });
      const f = parId.get(id);
      if (!f.ids.some(x => x[0] === u && x[1] === e.id)) f.ids.push([u, e.id]);
      f.titres.add(norme(decode(e.title)));
      if (titresFr[e.id]) f.titres.add(norme(titresFr[e.id]));
    }));
  }

  const manquants = [...parId.keys()].filter(id => !cache[id]);
  let nouveaux = 0, echecs = 0;
  for (const id of manquants) {
    try { cache[id] = await tmdb(id, cle); nouveaux++; }
    catch (_) { echecs++; }
  }
  if (nouveaux) writeFileSync(fichierCache, JSON.stringify(cache, null, 1) + '\n');

  const lignes = [];
  for (const [id, f] of parId) {
    const c = cache[id];
    if (!c) continue;
    c.t.forEach(t => f.titres.add(norme(t)));
    lignes.push([+id, c.y, [...f.titres].filter(Boolean), f.ids, f.fr, f.en]);
  }
  lignes.sort((a, b) => a[0] - b[0]);
  return { json: JSON.stringify({ v: 1, u: noms, f: lignes }), n: lignes.length, nouveaux, echecs };
}

// node _proto/films.mjs — remplit le cache et dit ce qui manque, sans rien publier
if (process.argv[1] && process.argv[1].endsWith('films.mjs')) {
  const r = await films({ racine: join(import.meta.dirname, '..') });
  console.log(`${r.n} films · ${r.nouveaux} demandés à TMDB · ${r.echecs} échecs`);
}
