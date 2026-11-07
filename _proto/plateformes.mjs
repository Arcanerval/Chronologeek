// Où regarder chaque œuvre, pays par pays : `/plateformes.json`.
// Posé le 5 novembre 2026, pour l'option « Mes plateformes » des réglages.
//
//   node _proto/plateformes.mjs           écrit /plateformes.json
//   node _proto/plateformes.mjs --check   n'écrit rien, dit ce qui changerait
//
// **Pourquoi une table et pas les appels de la page.** Mettre en avant ses
// plateformes sur toute une timeline voudrait une requête TMDB par œuvre et par
// visite — 248 pour Star Trek. Une action refait la table chaque nuit
// (`plateformes.yml`), et la page ne demande qu'un fichier, et seulement quand
// le visiteur a coché ses plateformes.
//
// **Ce que ça coûte** : une requête par œuvre à l'écran ayant une fiche TMDB
// (~350), toutes les nuits, sur l'API gratuite de TMDB et les minutes gratuites
// des actions d'un dépôt public : zéro euro. Le fichier ne garde que
// l'abonnement, le gratuit et la publicité, dans les pays du panneau.
// L'action ne commite que si la table a changé.
//
// Les marques suivent `marqueDe()` de `e-app.js` : une offre « Amazon Channel »
// ou « Premium » est la même plateforme que l'offre directe.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { charge, SOURCES } from './jsonld.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const PAYS = ['FR', 'BE', 'CH', 'LU', 'CA', 'US', 'GB', 'IE', 'DE', 'ES', 'IT', 'NL', 'AU'];
const ECRAN = { film: 1, filmanim: 1, serie: 1, anime: 1, short: 1, special: 1, web: 1 };

function marqueDe(nom) {
  return String(nom).toLowerCase()
    .replace(/\s*\bplus\b/g, '+')
    .replace(/\b(amazon|apple tv|roku( premium)?) channel\b|\bchannel\b|\bwith ads\b|\b(premium|essential|basic|standard|ads)\b/g, '')
    .replace(/\s+/g, ' ').trim();
}

// Le nom lu dans le panneau : sans la chaîne qui revend l'offre ni la formule.
// TMDB laisse parfois une espace au bout (« Cine+ OCS Amazon Channel ») : on rogne d'abord.
const nomCourt = n => String(n).trim()
  .replace(/\s*(Amazon|Apple TV|Roku( Premium)?) Channels?$/i, '')
  .replace(/\s+(Premium|Essential|Standard|Basic|with Ads)$/i, '').trim();

// Les œuvres : une fiche TMDB, une fois, quel que soit le nombre d'entrées.
const fiches = new Set();
let cle = process.env.TMDB_KEY || '';
for (const s of Object.values(SOURCES)) {
  const w = charge(RACINE, s.en[0], s.en[1]);
  if (!cle && w.CG && w.CG.tmdbKey) cle = w.CG.tmdbKey;
  const D = w[s.en[1]];
  for (const era of D.eras) for (const e of era.entries) {
    if (!ECRAN[e.type] || !e.tmdb || e.tmdb === '0' || (e.media !== 'movie' && e.media !== 'tv')) continue;
    fiches.add(e.media + '/' + e.tmdb);
  }
}
if (!cle) { console.error('plateformes : pas de clé TMDB'); process.exit(1); }

const marques = new Map();   // marque → [marque, nom, logo]
const parMarque = {};        // pays → marque → nombre d'œuvres
const w = {};
const liste = [...fiches].sort();
let fait = 0, echecs = 0;

async function une(f) {
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/${f}/watch/providers?api_key=${cle}`);
      if (r.status === 429) { await new Promise(ok => setTimeout(ok, 1500)); continue; }
      if (!r.ok) return null;
      return (await r.json()).results || {};
    } catch (_) { await new Promise(ok => setTimeout(ok, 800)); }
  }
  return null;
}

async function ouvrier() {
  while (liste.length) {
    const f = liste.shift();
    const res = await une(f);
    if (!res) { echecs++; continue; }
    fait++;
    for (const p of PAYS) {
      const o = res[p];
      if (!o) continue;
      const vus = new Set();
      for (const x of [...(o.flatrate || []), ...(o.free || []), ...(o.ads || [])]) {
        if (!x.logo_path) continue;
        const m = marqueDe(x.provider_name);
        const deja = marques.get(m);
        // l'offre directe plutôt que la chaîne revendue, pour le nom et le logo
        if (!deja || (/channel/i.test(deja[1]) && !/channel/i.test(x.provider_name)))
          marques.set(m, [m, nomCourt(x.provider_name), x.logo_path]);
        vus.add(m);
      }
      if (!vus.size) continue;
      (w[f] = w[f] || {})[p] = [...vus];
      for (const m of vus) (parMarque[p] = parMarque[p] || {})[m] = ((parMarque[p] || {})[m] || 0) + 1;
    }
  }
}
await Promise.all(Array.from({ length: 6 }, ouvrier));

// Une marque est un rang dans `p` : les œuvres n'écrivent que des nombres.
const p = [...marques.values()].sort((a, b) => a[0].localeCompare(b[0]));
const rang = new Map(p.map((x, i) => [x[0], i]));
const ww = {};
for (const f of Object.keys(w).sort()) {
  ww[f] = {};
  for (const [pays, l] of Object.entries(w[f])) ww[f][pays] = l.map(m => rang.get(m)).sort((a, b) => a - b);
}
// Le panneau propose d'abord les plateformes les plus présentes du pays.
const n = {};
for (const pays of PAYS) n[pays] = Object.entries(parMarque[pays] || {})
  .sort((a, b) => b[1] - a[1]).map(([m]) => rang.get(m));

const sortie = JSON.stringify({ pays: PAYS, p, n, w: ww });
const cible = join(RACINE, 'plateformes.json');
const avant = existsSync(cible) ? readFileSync(cible, 'utf8') : '';
console.log(`plateformes : ${fait} fiches lues, ${echecs} échecs, ${p.length} marques, ${sortie.length} octets` +
  (avant === sortie ? ' — inchangé' : ''));
if (echecs > fiches.size / 4) { console.error('plateformes : trop d\'échecs, rien n\'est écrit'); process.exit(1); }
if (!CHECK && avant !== sortie) writeFileSync(cible, sortie);
