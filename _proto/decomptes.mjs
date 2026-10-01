#!/usr/bin/env node
/* decomptes.mjs — les chiffres de l'accueil, de la liste des Dossiers et du
   Dossier, recalculés depuis les données.

   Ces pages ne chargent aucun fichier de données : elles annoncent des
   décomptes écrits dans leur HTML — douze `data-total`, « 79 stations,
   1 029 arrêts », le HUD, la table `E` du plan, le `TOTAL` du Dossier. Chaque
   ajout de média en faisait autant de retouches à la main, et un oubli ne se
   voyait qu'au 119 % d'une barre. `publier.mjs` les recalcule donc à la
   publication, dans les deux langues.

   La règle d'un arrêt est celle des pages : toute entrée d'une ère qui n'est
   ni `separator` ni `note` — DC compte 147 sans l'ouverture de l'événement,
   Star Trek 248 sans ses six repères de lecture. Le Dossier compte ses items
   `kind:'it'`, pas les 63 repères écran. Vérifié contre les douze cartes et
   la table `E` le jour de l'écriture : tout tombait juste.

   **Les dates de départ de `E` ne sont pas calculées.** Elles sont choisies :
   2063 pour le 21e siècle de Star Trek, dont la seule entrée est une note ;
   « ~2324 » pour le 24e, et pas la date de la première série. On les garde
   par ère, et seule une ère neuve reçoit la date de sa première entrée.
   Le mois « À jour · … » n'est pas touché non plus : c'est la date
   éditoriale, que seul Niko connaît.

     node _proto/decomptes.mjs            ce qui diffère dans les protos
     node _proto/decomptes.mjs --ecrire   le réécrit dans les protos français */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { charge, SOURCES } from './jsonld.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));

const DOSSIER = { fr: ['data-dossier-sw.js', 'CGD'], en: ['data-dossier-sw-en.js', 'CGD'] };

const arret = x => x && x.type !== 'separator' && x.type !== 'note';
const donnees = (racine, [f, g]) => charge(racine, f, g)[g];

/* ── Les chiffres ─────────────────────────────────────────────────────── */

export function decomptes(racine) {
  const univers = {};
  for (const [k, src] of Object.entries(SOURCES)) {
    const fr = donnees(racine, src.fr), en = donnees(racine, src.en);
    if (!fr?.eras?.length || !en?.eras?.length) throw new Error(`${k} : données sans ères`);
    if (fr.eras.length !== en.eras.length) throw new Error(`${k} : ${fr.eras.length} ères en français, ${en.eras.length} en anglais`);
    const eras = fr.eras.map((e, i) => {
      const a = (e.entries || []).filter(arret);
      return { fr: e.title, en: en.eras[i].title, n: a.length, date: (a[0] || {}).date || '' };
    });
    univers[k] = { total: eras.reduce((s, e) => s + e.n, 0), stations: eras.length, eras };
  }
  const d = donnees(racine, DOSSIER.fr);
  const eras = d.eras.map(e => (e.items || []).filter(x => x.kind === 'it').length);
  const dossier = { total: eras.reduce((s, n) => s + n, 0), stations: eras.length, eras };
  const total = Object.values(univers).reduce((s, u) => s + u.total, 0);
  const stations = Object.values(univers).reduce((s, u) => s + u.stations, 0);
  return { univers, dossier, total, stations, n: Object.keys(univers).length };
}

/* ── L'application, page par page ─────────────────────────────────────── */

const nombre = (n, langue) => langue === 'en'
  ? n.toLocaleString('en-US')
  : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const NB = '[0-9][0-9  ,]*';

/* Chaque remplacement doit trouver sa cible : un motif qui ne trouve plus
   rien est un chiffre qui ne serait plus tenu, sans un mot. */
function remplaceur(html, nom) {
  const r = { html, changes: [], manquants: [] };
  r.sub = (etiquette, re, fn) => {
    let vu = 0;
    r.html = r.html.replace(re, (...m) => {
      vu++;
      const neuf = fn(...m);
      if (neuf !== m[0]) r.changes.push(etiquette);
      return neuf;
    });
    if (!vu) r.manquants.push(`${nom} : ${etiquette} introuvable`);
  };
  return r;
}

function accueil(html, langue, V, nom) {
  const r = remplaceur(html, nom);
  for (const [k, u] of Object.entries(V.univers)) {
    r.sub(`${k} data-total`, new RegExp(`(data-u="${k}" data-total=")\\d+`), (_, a) => a + u.total);
    // la ligne « 0 / 62 · 6 stations » de la même case, et d'elle seule
    r.sub(`${k} carte`, new RegExp(`(data-u="${k}"[\\s\\S]*?<b class="d-n">0</b> / )\\d+( · )\\d+`),
      (_, a, b) => a + u.total + b + u.stations);
    r.sub(`${k} U.total`, new RegExp(`("u":"${k}","total":)\\d+`), (_, a) => a + u.total);
  }
  r.sub('stations et arrêts', new RegExp(`(m-nb"><b>)${NB}(</b>[^<]*<b>)${NB}(</b>)`),
    (_, a, b, c) => a + nombre(V.stations, langue) + b + nombre(V.total, langue) + c);
  r.sub('HUD', /(<em id="k-on">0<\/em> \/ )\d+/, (_, a) => a + V.total);
  r.sub('univers et Dossier', /(<span class="lbl">)\d+( univers(?:es)? · )\d+/,
    (_, a, b) => a + V.n + b + V.dossier.total);

  // La table du plan : noms et comptes depuis les données, dates gardées.
  r.sub('table E', /(var E=)(\{.*?\});(\r?\n)/, (_, a, json, nl) => {
    const E = JSON.parse(json);
    const neuf = {};
    for (const [k, u] of Object.entries(V.univers)) {
      const ancien = E[k] || [];
      neuf[k] = u.eras.map((e, i) => {
        const garde = ancien[i] && (ancien[i][0] === e.fr || ancien[i][1] === e.en) ? ancien[i][3] : e.date;
        return [e.fr, e.en, e.n, garde];
      });
    }
    return a + JSON.stringify(neuf) + ';' + nl;
  });
  return r;
}

function dossiers(html, langue, V, nom) {
  const r = remplaceur(html, nom);
  const D = V.dossier;
  r.sub('data-total', /(data-u="dossier-sw" data-total=")\d+/, (_, a) => a + D.total);
  r.sub('carte', /(data-u="dossier-sw"[\s\S]*?<b class="d-n">0<\/b> \/ )\d+( · )\d+/,
    (_, a, b) => a + D.total + b + D.stations);
  r.sub('bande', /(<div class="s"><b>)\d+(<\/b><span>(?:œuvres|works))/, (_, a, b) => a + D.total + b);
  r.sub('HUD', /(<em id="k-on">0<\/em> \/ )\d+/, (_, a) => a + D.total);
  r.sub('TOTAL', /(var TOTAL=)\d+/, (_, a) => a + D.total);
  // `E` : les noms courts sont écrits pour le plan, on ne touche qu'aux comptes.
  r.sub('table E', /(var E=)(\[[\s\S]*?\]\])(\.map)/, (_, a, corps, b) => {
    let i = 0;
    const neuf = corps.replace(/(\["[^"]*","[^"]*",)\d+/g, (m, t) => t + D.eras[i++]);
    if (i !== D.stations) r.manquants.push(`${nom} : table E à ${i} stations, le Dossier en a ${D.stations}`);
    return a + neuf + b;
  });
  return r;
}

function dossier(html, langue, V, nom) {
  const r = remplaceur(html, nom);
  const n = V.dossier.total;
  r.sub('s-tot', /(id="s-tot">)\d+/, (_, a) => a + n);
  r.sub('fcount', /(id="fcount">)\d+ \/ \d+/, (_, a) => `${a}${n} / ${n}`);
  r.sub('k-tot', /(id="k-tot">)\d+/, (_, a) => a + n);
  r.sub('k-left', /(id="k-left">)\d+/, (_, a) => a + n);
  return r;
}

const PAGES = { accueil, dossiers, 'dossier-sw': dossier };

/* Pour `publier.mjs` : `null` si la route n'a pas de décompte. */
export function appliquer(html, cle, langue, V, nom = cle) {
  const f = PAGES[cle];
  return f ? f(html, langue, V, nom) : null;
}

/* ── En ligne de commande ─────────────────────────────────────────────── */

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const racine = dirname(ICI);
  const ECRIRE = process.argv.includes('--ecrire');
  const V = decomptes(racine);
  console.log(`${V.n} univers, ${V.stations} stations, ${V.total} arrêts ; Dossier ${V.dossier.total} œuvres.`);
  const PROTOS = [['accueil', 'e-accueil.html', 'fr'], ['accueil', 'en-accueil.html', 'en'],
    ['dossiers', 'e-dossiers.html', 'fr'], ['dossiers', 'en-dossiers.html', 'en'],
    ['dossier-sw', 'e-dossier-star-wars.html', 'fr'], ['dossier-sw', 'en-dossier-star-wars.html', 'en']];
  let manque = 0;
  for (const [cle, f, langue] of PROTOS) {
    const src = readFileSync(join(ICI, f), 'utf8');
    const r = appliquer(src, cle, langue, V, f);
    manque += r.manquants.length;
    r.manquants.forEach(m => console.log('  ✗ ' + m));
    console.log(`  ${f.padEnd(28)} ${r.changes.length ? r.changes.length + ' à corriger : ' + r.changes.join(', ') : 'à jour'}`);
    // Les `en-*` sont produits : seuls les protos français s'écrivent ici.
    if (ECRIRE && langue === 'fr' && r.changes.length) writeFileSync(join(ICI, f), r.html);
  }
  if (manque) process.exit(1);
}
