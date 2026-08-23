/* Depannage de visuels pour le proto Assassin's Creed.

   Les WebP locaux n'existent pas encore — Niko les pose lui-meme, a la
   taille d'affichage x4, comme pour les six autres univers. En attendant,
   ce script va chercher une affiche chez RAWG (jeux et DLC), TMDB (le film)
   et OpenLibrary (les romans), et ecrit `visuels-assassinscreed.json` que
   `construire-assassinscreed.mjs` relit.

   C'est exactement ce que Dragon Age a connu a sa naissance : « les URL
   d'API n'etaient qu'un depannage en attendant ces fichiers ». La regle
   « WebP local x4 » reprend la main des que les fichiers sont la — il
   suffit alors de supprimer le JSON et de rejouer la construction.

   Les comics et les videos n'ont aucune source fiable : ils restent sans
   vignette, et la page les affiche tres bien ainsi.

   Usage : node _proto/visuels-assassinscreed.mjs                        */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RAWG = 'ddc66eb38db74a77b5f41323db00d434';
const TMDB = '6257b37bf29ab31357853fce00232314';
const SORTIE = path.join(ICI, 'visuels-assassinscreed.json');

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/* les donnees deja construites, sans visuels */
const bac = { window: {} };
new Function('window', fs.readFileSync(path.join(ICI, 'data-assassinscreed-en.js'), 'utf8'))(bac.window);
const eras = bac.window.ASSASSINSCREED.eras;
const ALL = eras.flatMap((e) => e.entries);

/* Le parent d'un DLC est le jeu qui le precede immediatement dans le
   guide : RAWG range « Legacy of the First Blade » sous « Assassin's Creed
   Odyssey », et le chercher seul ne rend rien. */
const parent = {};
let dernierJeu = '';
for (const e of ALL) {
  if (e.type === 'jeu') dernierJeu = e.title;
  if (e.type === 'dlc') parent[e.id] = dernierJeu;
}

const sortie = fs.existsSync(SORTIE) ? JSON.parse(fs.readFileSync(SORTIE, 'utf8')) : {};

async function rawg(q) {
  const u = 'https://api.rawg.io/api/games?search=' + encodeURIComponent(q) +
            '&page_size=3&key=' + RAWG;
  try {
    const j = await (await fetch(u)).json();
    return (j.results || [])[0] || null;
  } catch (_) { return null; }
}

async function openlib(q) {
  const u = 'https://openlibrary.org/search.json?q=' + encodeURIComponent(q) +
            '&fields=title,cover_i&limit=3';
  try {
    const j = await (await fetch(u)).json();
    const d = (j.docs || []).find((x) => x.cover_i);
    return d ? 'https://covers.openlibrary.org/b/id/' + d.cover_i + '-L.jpg' : null;
  } catch (_) { return null; }
}

let n = 0, trouves = 0;
for (const e of ALL) {
  if (sortie[e.id]) { trouves++; continue; }
  n++;
  let v = null;

  if (e.type === 'jeu' || e.type === 'dlc') {
    const q = e.type === 'dlc' && parent[e.id]
      ? parent[e.id] + ' ' + e.title.replace(/^Assassin[’']s Creed[^-–:]*[-–:]\s*/, '')
      : e.title;
    const g = await rawg(q);
    if (g && g.background_image) {
      v = { img: g.background_image, tmdb: String(g.id) };
      if (g.description_raw) v.desc = g.description_raw;
    }
    await pause(280);
  } else if (e.type === 'film' || e.type === 'video') {
    /* Les trois courts metrages — Lineage, Ascendance, Embers — ont leur
       fiche chez TMDB au meme titre que le film de 2016. */
    try {
      const j = await (await fetch('https://api.themoviedb.org/3/search/movie?api_key=' + TMDB +
        '&query=' + encodeURIComponent(e.title) +
        (e.type === 'film' ? '&year=2016' : ''))).json();
      const f = (j.results || []).find((x) => x.poster_path);
      if (f) v = { img: 'https://image.tmdb.org/t/p/w342' + f.poster_path, tmdb: String(f.id) };
    } catch (_) {}
    await pause(280);
  } else if (e.type === 'roman') {
    const img = await openlib(e.title);
    if (img) v = { img };
    await pause(380);   /* OpenLibrary : 350 ms entre deux requetes */
  }

  if (v) { sortie[e.id] = v; trouves++; }
  process.stdout.write('\r' + n + ' interroges, ' + trouves + ' visuels   ');
}

fs.writeFileSync(SORTIE, JSON.stringify(sortie, null, 1), 'utf8');
console.log('\nEcrit : ' + path.relative(process.cwd(), SORTIE) +
            ' — ' + Object.keys(sortie).length + ' / ' + ALL.length);
