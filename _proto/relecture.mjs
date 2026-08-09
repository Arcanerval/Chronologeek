/* ═══ LE DOSSIER DE RELECTURE ════════════════════════════════════════
   Rassemble, en un seul document lisible, les seules phrases anglaises
   du site que Niko n'a pas écrites lui-même.

   Tout le reste — 925 entrées de timeline, 596 items du Dossier, les
   109 libellés d'interface, le journal — est repris mot pour mot de la
   version anglaise déjà en ligne. Ce fichier ne liste donc que le
   reliquat : la prose née avec la direction E, plus une entrée Marvel
   ajoutée après la dernière mise à jour de la prod.

       node _proto/relecture.mjs      écrit _proto/A-RELIRE-EN.md

   Les deux scripts de traduction doivent avoir tourné avant : c'est
   d'eux que viennent les relevés. ══════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lire = p => JSON.parse(fs.readFileSync(path.join(RACINE, p), 'utf8'));

const donnees = lire('_proto/a-traduire.json');
const pages = lire('_proto/a-relire-pages.json');

/* Les pages, regroupées par fichier d'origine pour que la relecture
   suive le parcours du site plutôt que l'ordre alphabétique. */
const ORDRE = ['e-accueil.html', 'e-starwars.html', 'e-marvel.html', 'e-dc.html',
  'e-dossiers.html', 'e-dossier-star-wars.html', 'e-nouveautes.html', 'e-a-venir.html'];
const NOM = {
  'e-accueil.html': 'Accueil', 'e-starwars.html': 'Star Wars',
  'e-marvel.html': 'Marvel', 'e-dc.html': 'DC', 'e-dossiers.html': 'Dossiers',
  'e-dossier-star-wars.html': 'Dossier Star Wars',
  'e-nouveautes.html': 'Nouveautés', 'e-a-venir.html': 'À venir',
};

const parPage = new Map(ORDRE.map(p => [p, []]));
const communes = [];
for (const e of pages) {
  if (e.pages.length > 2) communes.push(e);
  else for (const p of e.pages) (parPage.get(p) || []).push(e);
}

const l = [];
l.push('# À relire — la version anglaise de la refonte');
l.push('');
l.push('Ce document ne liste pas la traduction du site : il liste ce qui **n’a pas pu');
l.push('être repris de l’anglais existant**, et qu’il a donc fallu écrire.');
l.push('');
l.push('La racine du site est déjà en anglais et `/fr/` en français, tenues à parité.');
l.push('La refonte ayant extrait ses données du français, l’anglais correspondant était');
l.push('déjà écrit, relu et en ligne : il a été repris mot pour mot, entrée par entrée,');
l.push('libellé par libellé. Le reliquat ci-dessous est ce que la direction E a créé et');
l.push('qui n’existait donc dans aucune des deux versions.');
l.push('');
l.push('| Repris de l’anglais en ligne | |');
l.push('|---|---|');
l.push('| Entrées de timeline | 925 — Star Wars 61, Marvel 121, DC 147, plus leurs fiches |');
l.push('| Items du Dossier | 596 — 533 entrées et 63 repères écran |');
l.push('| Libellés d’interface | 109 par page, appariés clé par clé |');
l.push('| Textes des huit pages | 1 565 appariés, 1 749 identiques dans les deux langues |');
l.push('| Entrées du journal | 8, appariées par rang dans `whats-new.html` |');
l.push('');
l.push(`**${donnees.length + pages.length} phrases ont dû être écrites** : `
  + `${donnees.length} dans les données, ${pages.length} dans les pages. Ce sont elles, et`);
l.push('elles seules, qui suivent.');
l.push('');
l.push('Corrige directement dans les tables `TRADUCTIONS` de `_proto/traduire.mjs`');
l.push('(données) et `_proto/traduire-pages.mjs` (pages), puis relance les deux');
l.push('scripts : les fichiers anglais sont régénérés, jamais édités à la main.');
l.push('');

/* ── les données ──────────────────────────────────────────────────── */
l.push('---');
l.push('');
l.push('## 1. Données — l’entrée Marvel sans source anglaise');
l.push('');
l.push('`Spider-Man: Brand New Day` a été ajouté à la timeline après la dernière mise');
l.push('à jour de la version anglaise en ligne : sa fiche n’existe qu’en français. Le');
l.push('titre, lui, vient de `whats-new.html`, où il figure déjà en anglais.');
l.push('');
const vues = new Set();
for (const d of donnees) {
  if (vues.has(d.fr)) continue;
  vues.add(d.fr);
  const n = donnees.filter(x => x.fr === d.fr).length;
  l.push(`**${d.chemin}**${n > 1 ? ` — ${n} emplois` : ''}`);
  l.push('');
  l.push(`> FR — ${d.fr}`);
  l.push(`> EN — ${d.en || '**rien : resté en français**'}`);
  l.push('');
}

/* ── les pages ────────────────────────────────────────────────────── */
l.push('---');
l.push('');
l.push('## 2. Pages — la prose de la direction E');
l.push('');

if (communes.length) {
  l.push('### Communes à toutes les pages');
  l.push('');
  l.push('Navigation, pied de page, boutons partagés.');
  l.push('');
  l.push('| Français | Anglais |');
  l.push('|---|---|');
  for (const e of communes.sort((a, b) => a.fr.localeCompare(b.fr, 'fr'))) {
    l.push(`| ${e.fr.replace(/\|/g, '\\|')} | ${e.en.replace(/\|/g, '\\|')} |`);
  }
  l.push('');
}

for (const p of ORDRE) {
  const items = parPage.get(p);
  if (!items || !items.length) continue;
  l.push(`### ${NOM[p]}`);
  l.push('');
  l.push('| Français | Anglais |');
  l.push('|---|---|');
  for (const e of items.sort((a, b) => a.fr.localeCompare(b.fr, 'fr'))) {
    l.push(`| ${e.fr.replace(/\|/g, '\\|')} | ${e.en.replace(/\|/g, '\\|')} |`);
  }
  l.push('');
}

/* ── les décisions de fond ────────────────────────────────────────── */
l.push('---');
l.push('');
l.push('## 3. Trois décisions qui dépassent la traduction');
l.push('');
l.push('Elles changent le rendu, pas seulement les mots. À valider ou à trancher.');
l.push('');
l.push('**Le badge « VO » ne s’affiche pas en anglais.** Il signale qu’une œuvre n’a pas');
l.push('de version française — information sans objet pour qui lit justement l’anglais.');
l.push('C’est déjà le choix de la prod : `deep-dives/star-wars.html` ne l’affiche nulle');
l.push('part, `fr/dossiers/star-wars.html` le pose. La refonte fait pareil.');
l.push('');
l.push('**Le compte à rebours passe de « J‑8 » à « D‑8 ».** J comme Jour, D comme Day —');
l.push('et « D‑Day moins N » se dit en anglais. `CG.t.inDays` écrit « in {n} d » sur le');
l.push('site en ligne, mais c’est une phrase là où la pastille est un signe : elle');
l.push('casserait le bloc de Big Shoulders 900 qui fait l’effet de la carte.');
l.push('');
l.push('**Les accords doubles deviennent simples.** « 31 sorties affichées » accorde deux');
l.push('fois, « 31 releases shown » une seule. Les gabarits concernés sont réécrits en');
l.push('entier dans `EXPRESSIONS`, sans quoi la page afficherait « 31 releases showns ».');
l.push('');
l.push('---');
l.push('');
l.push('## 4. Ce qui reste à faire');
l.push('');
l.push('- **Avatar** — ni page française ni page anglaise dans la refonte. Le proto');
l.push('  d’accueil garde son créneau verrouillé, et le journal annonce déjà la timeline.');
l.push('- **La livraison** — les pages vivent encore dans `_proto/` sous les noms');
l.push('  `en-*.html`. Les mettre en ligne demande de les renommer et de recâbler les');
l.push('  liens vers les chemins de prod (`/starwars`, `/fr/starwars`, …).');
l.push('- **`sync.py`** — il compare `fr/X.html` à `X.html`. Les paires de la refonte');
l.push('  sont alignées ligne à ligne, donc il saura les vérifier une fois livrées.');
l.push('');

fs.writeFileSync(path.join(RACINE, '_proto/A-RELIRE-EN.md'), l.join('\n'), 'utf8');
console.log(`_proto/A-RELIRE-EN.md — ${donnees.length} phrase(s) de données, `
  + `${pages.length} de pages (${communes.length} communes)`);
