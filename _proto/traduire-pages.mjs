/* ═══ LA VERSION ANGLAISE DES PAGES DE LA REFONTE ════════════════════
   Produit `en-*.html` à partir des `e-*.html` français. Même principe
   que `traduire.mjs`, appliqué cette fois au HTML : on ne traduit pas,
   on retrouve dans la prod anglaise ce que la prod française dit au
   même endroit.

   D'OÙ VIENT LE LEXIQUE. Les pages racine et leurs jumelles de `/fr/`
   sont parallèles ligne à ligne — c'est la propriété sur laquelle
   `sync.py` s'appuie déjà. On lit donc les deux versions de front et on
   apparie, ligne par ligne, les textes visibles et les attributs. Ça
   donne toute la prose d'interface : navigation, pied de page, mentions
   légales, libellés de boutons.

   LE PIÈGE DU REGISTRE. La refonte vouvoie — « Cochez ce que vous avez
   vu » — là où la prod tutoie — « Coche ce que tu as vu ». L'anglais ne
   fait pas la différence, donc la traduction existe bel et bien ; c'est
   la clé française qui a changé. Le script rapproche ces variantes par
   similarité et exige qu'elles soient déclarées dans REGISTRE, avec les
   deux formes en clair : on voit ce qu'on apparie, rien n'est deviné
   en silence.

       node _proto/traduire-pages.mjs          écrit les pages
       node _proto/traduire-pages.mjs --check  n'écrit rien

   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const CHECK = process.argv.includes('--check');
const lire = p => fs.readFileSync(path.join(RACINE, p), 'utf8');

/* Où lire la prod. Plus à la racine du site : la publication de la refonte
   l'a remplacée par la sortie de ce script même, et un lexique bâti sur sa
   propre sortie ne corrige plus rien, il fige. Les pages d'avant sont
   figées dans `_proto/reference/`, avec le pourquoi dans son LISEZ-MOI. */
const lirePage = rel => lire(path.posix.join('_proto', 'reference', rel));

/* Les paires de prod qui alimentent le lexique. */
const PAIRES = [
  ['fr/starwars.html', 'starwars.html'],
  ['fr/marvel.html', 'marvel.html'],
  ['fr/dc.html', 'dc.html'],
  ['fr/dossiers/star-wars.html', 'deep-dives/star-wars.html'],
  ['fr/nouveautes.html', 'whats-new.html'],
  ['fr/a-venir.html', 'upcoming.html'],
  ['fr/index.html', 'index.html'],
];

/* ── ce qu'on sait extraire d'une ligne de HTML ────────────────────
   Deux natures : le texte entre deux balises, et les attributs qui
   s'affichent (aria-label, title, placeholder, alt). On les rend dans
   l'ordre où ils apparaissent, pour pouvoir apparier par rang. */
const ATTRS = /(?:aria-label|title|placeholder|alt|data-label)="([^"]*)"/g;

/* Un texte peut être écrit sur trois lignes dans une page et sur une
   seule dans l'autre : on compare toujours sur la forme resserrée.

   Les apostrophes et les tirets se promènent d'un fichier à l'autre —
   le proto tape « l'API », la prod « l’API » — et les insécables du
   HTML indenté s'en mêlent. `verif-textes.py` neutralise déjà ces
   écarts pour comparer la prose de Niko ; on applique la même règle,
   pour la même raison : ce sont des variantes d'écriture, pas des
   textes différents. La clé est normalisée, jamais la valeur rendue. */
const net = s => s
  .replace(/[’ʼ]/g, "'")
  .replace(/‑/g, '-')
  .replace(/[   ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function morceaux(ligne) {
  const out = [];
  for (const m of ligne.matchAll(/>([^<>]+)</g)) out.push(m[1]);
  for (const m of ligne.matchAll(ATTRS)) out.push(m[1]);
  return out.map(net).filter(Boolean);
}

/* ── le lexique ────────────────────────────────────────────────────
   Une entrée par texte français rencontré. Les collisions sont gardées
   de côté : deux anglais pour un même français veut dire qu'on ne peut
   pas trancher sans contexte, et on préfère le dire. */
const table = new Map();
const identiques = new Set();
const collisions = new Map();

/* Ce que les deux langues écrivent pareil sans qu'aucune paire de pages
   ait pu l'établir. Les déclarer les sort du rapport de relecture, où
   ils n'auraient rien à faire.

   - le titre d'onglet de la page Avatar : elle n'a pas d'homologue en
     prod, il n'a donc jamais été vu en parallèle. Les trois autres
     pages y échappent parce que la prod le leur apprend.
   - `Opening Credits` : un type de vidéo TMDB, comparé au champ `type`
     de la réponse. C'est une valeur d'API, comme les arguments du DOM —
     traduite, la comparaison ne trouverait plus rien.
   - `Star Trek` : le libellé de l'univers dans la table `UNI` de la page
     « À venir ». Il s'écrit pareil dans les deux langues, mais aucune
     paire de pages ne peut le dire — la prod est antérieure à ce
     cinquième univers, et le proto français est le seul à le porter.
   - `Avatar Legends` : le libellé du quatrième univers, renommé pour ne
     plus se confondre avec les films de James Cameron. La prod écrivait
     « Avatar » des deux côtés ; le nom complet ne s'y trouve nulle part,
     et il ne se traduit pas davantage. */
for (const s of ['Chronologeek — Avatar Legends (proto E)', 'Opening Credits',
                 'Star Trek', 'Avatar Legends']) identiques.add(s);

function ajoute(fr, en) {
  fr = net(fr); en = net(en);
  if (!fr || !en) return;
  if (fr === en) { identiques.add(fr); return; }
  const vu = table.get(fr);
  if (vu === undefined) { table.set(fr, en); return; }
  if (vu !== en) {
    if (!collisions.has(fr)) collisions.set(fr, new Set([vu]));
    collisions.get(fr).add(en);
  }
}

for (const [pf, pe] of PAIRES) {
  const lf = lirePage(pf).split('\n');
  const le = lirePage(pe).split('\n');
  const n = Math.min(lf.length, le.length);
  for (let i = 0; i < n; i++) {
    const a = morceaux(lf[i]);
    const b = morceaux(le[i]);
    /* on n'apparie que si la ligne a la même découpe des deux côtés :
       sinon les rangs ne veulent plus rien dire */
    if (a.length && a.length === b.length) a.forEach((v, j) => ajoute(v, b[j]));
  }
}

/* ═══ LE REGISTRE ═══════════════════════════════════════════════════
   Les textes que la refonte a reformulés en passant au vouvoiement.
   À gauche ce que dit le proto, à droite la forme que la prod
   française emploie — c'est elle qui donne accès à l'anglais.

   Rien n'est traduit ici : on désigne seulement quelle phrase de la
   prod dit la même chose. La traduction, elle, sort du lexique.

   Une ligne dont la forme de droite n'existe pas en prod est signalée
   au passage : c'est que la refonte a reformulé, pas seulement changé
   de personne, et la phrase relève alors de la traduction à écrire. */
const REGISTRE = [
  ['Essayez une autre orthographe, ou remettez les filtres que vous avez décochés.',
   'Essaie une autre orthographe, ou remets les filtres que tu as décochés.'],
  ['Votre progression est sauvegardée sur ce navigateur — utilisez',
   'Ta progression est sauvegardée sur ce navigateur — utilise'],
  ['pour en garder une copie ou l’importer sur un autre appareil ou navigateur',
   'pour en garder une copie ou l’importer sur un autre appareil ou navigateur'],
  ['Réinitialiser votre progression Star Wars ?', 'Réinitialiser ta progression Star Wars ?'],
  ['Réinitialiser votre progression Marvel ?', 'Réinitialiser ta progression Marvel ?'],
  ['Réinitialiser votre progression DC ?', 'Réinitialiser ta progression DC ?'],
  ['Réinitialiser votre progression du Dossier ?', 'Réinitialiser ta progression du Dossier ?'],
  ['Essayez une autre orthographe.', 'Essaie une autre orthographe.'],
];

/* ── les libellés d'interface ──────────────────────────────────────
   `window.CG.t` porte les 109 libellés de l'application, et les
   fichiers de données anglais viennent d'être produits par
   `traduire.mjs`. Les lire de front donne d'un coup tout le
   vocabulaire des boutons, filtres et messages. */
function objetsDe(rel) {
  const src = lire(rel);
  const box = { window: {} };
  const noms = [...new Set([...src.matchAll(/(?:^|[\n;{])\s*(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/g)]
    .map(m => m[1]))];
  new Function('window', src.replace(/\bconst /g, 'var ')
    + noms.map(n => `\n;try{window[${JSON.stringify(n)}]=${n}}catch(e){}`).join(''))(box.window);
  return box.window;
}

function apparieProfond(fr, en) {
  if (typeof fr === 'string' && typeof en === 'string') return ajoute(fr, en);
  if (Array.isArray(fr) && Array.isArray(en)) {
    for (let i = 0; i < Math.min(fr.length, en.length); i++) apparieProfond(fr[i], en[i]);
    return;
  }
  if (fr && en && typeof fr === 'object' && typeof en === 'object') {
    for (const k of Object.keys(fr)) if (k in en) apparieProfond(fr[k], en[k]);
  }
}

/* Les données que les pages de prod gardent hors de `DATA` : les
   descriptions de zones DC et l'intro. `traduire.mjs` s'en sert déjà
   pour les mêmes raisons. */
function scriptsDe(rel) {
  const src = lirePage(rel);
  const js = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => m[1])
    .filter(s => /\bconst\s+[A-Z][A-Z0-9_]*\s*=|window\.CG(_[A-Z]+)?\s*=/.test(s))
    .join('\n');
  const box = { window: {} };
  const noms = [...new Set([...js.matchAll(/(?:^|[\n;{])\s*(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/g)]
    .map(m => m[1]))];
  try {
    new Function('window', js.replace(/\bconst /g, 'var ')
      + noms.map(n => `\n;try{window[${JSON.stringify(n)}]=${n}}catch(e){}`).join(''))(box.window);
  } catch (e) { return {}; }
  return box.window;
}

for (const [pf, pe] of PAIRES) {
  const F = scriptsDe(pf), E = scriptsDe(pe);
  for (const v of ['CG', 'CG_ZONES', 'ZONES', 'NOTES', 'CG_DATA', 'DATA']) {
    if (F[v] !== undefined && E[v] !== undefined) apparieProfond(F[v], E[v]);
  }
}

for (const [f, e] of [
  ['_proto/data.js', '_proto/data-en.js'],
  ['_proto/data-mcu.js', '_proto/data-mcu-en.js'],
  ['_proto/data-dc.js', '_proto/data-dc-en.js'],
  ['_proto/data-dossier-sw.js', '_proto/data-dossier-sw-en.js'],
  ['_proto/data-news.js', '_proto/data-news-en.js'],
]) {
  if (!fs.existsSync(path.join(RACINE, e))) continue;
  const F = objetsDe(f), E = objetsDe(e);
  for (const v of ['CG', 'CGDT', 'CGD', 'CG_NEWS']) {
    if (F[v] && E[v]) apparieProfond(F[v], E[v]);
  }
}

/* Le registre vient en dernier : il s'appuie sur tout ce que le lexique
   a appris, `CG.t` compris, puisque c'est là que vivent les phrases
   tutoyées dont la refonte a fait des variantes vouvoyées. */
const registreOrphelin = [];
for (const [proto, prod] of REGISTRE) {
  const en = table.get(net(prod));
  if (en !== undefined) ajoute(proto, en);
  else registreOrphelin.push(prod);
}

/* ═══ CE QUI N'A PAS DE SOURCE ══════════════════════════════════════
   La prose écrite pour la direction E : accroches de l'accueil, intros
   des Dossiers, libellés du journal et de « À venir ». Elle n'existe
   qu'en français, donc elle est traduite ici — ce sont les seules
   phrases anglaises du site que Niko n'a pas écrites lui-même, et
   elles attendent sa relecture (voir `_proto/A-RELIRE-EN.md`).

   Le vocabulaire suit celui de la version anglaise en ligne : « Deep
   Dive » pour Dossier, « watched » et « read » pour les compteurs,
   « shown » pour les entrées filtrées, « movies » et « shows » pour les
   films et les séries. On ne réinvente pas un lexique en parallèle. */
const TRADUCTIONS = [
  // ── le dépliant des filtres, posé le 17 août 2026 ───────────────
  // La prod n'a jamais porté cette phrase : recherche, niveaux, types et
  // repères y étaient dépliés en permanence, sans intitulé commun.
  ['Filtres, recherche et repères', 'Filters, search and legend'],
  ['Filtres et recherche', 'Filters and search'],   // « À venir » et « Nouveautés » : pas de légende à replier
  // ── le menu remanié, posé le 18 août 2026 ───────────────────────
  // Six univers en clair débordaient la barre : trois restent, les trois
  // autres passent sous un déroulant, et le tiroir mobile les regroupe
  // sous deux intitulés. Rien de tout ça n'existait en prod.
  ['Plus d’univers', 'More universes'],
  ['Les univers', 'Universes'],
  ['Le site', 'The site'],
  // ── accueil ────────────────────────────────────────────────────
  ['Chronologeek — Accueil (proto E)', 'Chronologeek — Home (proto E)'],
  ['Navigation repliée', 'Collapsed navigation'],
  ['Chaque univers, dans l\'ordre', 'Every universe, in order'],
  ['Choisis ton', 'Choose your'],          // « Choisis ton <span>univers</span> »
  ['univers', 'universe'],
  ['Sélection de l\'univers', 'Universe selection'],
  ['Sélectionner', 'Select'],
  ['Continuer', 'Continue'],
  ['Reprendre ▸', 'Resume ▸'],             // CG.t.resume : Reprendre → Resume
  ['Ouvrir ▸', 'Open ▸'],
  ['Huit chronologies tenues à jour, en français et en anglais.',
   'Eight timelines kept up to date, in French and English.'],
  ['Suivi de progression à venir', 'Progress tracking coming soon'],
  ['Bientôt', 'Soon'],
  ['Les Dossiers', 'The Deep Dives'],
  ['Les', 'The'],                          // « Les <span>Dossiers</span> »
  ['Pour aller plus loin dans vos univers préférés : romans, comics, canon étendu et autres choses méritant votre attention',
   'To go further into your favorite universes: novels, comics, expanded canon and other things worth your attention'],
  ['8 univers · 534 au dossier', '8 universes · 534 in the Deep Dive'],
  ['entrées cochées', 'entries checked'],
  // les deux boutons d'essai du proto, qui ne partiront pas en ligne
  ['proto : simuler une progression', 'proto: simulate progress'],
  ['proto : revenir à zéro', 'proto: back to zero'],
  // CG.t.legal3, précédé du point que le HTML pose après le lien
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age et Assassin’s Creed sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed are trademarks of their respective owners; Chronologeek is an independent fan project.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age et Assassin’s Creed sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed are trademarks of their respective owners; Chronologeek is an independent fan project.'],

  /* ── la case Star Trek ──────────────────────────────────────────
     Le cinquième univers est postérieur à la prod : sa case n'a pas de
     version anglaise à retrouver, et son énumération de types reprend
     celle de sa propre page. Le slot verrouillé, lui, n'annonce plus
     Star Trek : il est sorti des univers à venir. */
  ['Films · Séries · Séries animées · Courts métrages · Timeline chronologique complète',
   'Movies · TV Shows · Animated Shows · Shorts · Full chronological timeline'],
  ['/ 248 vus', '/ 248 watched'],

  /* Le mois des six cases de l'accueil. La prod anglaise écrit « Updated ·
     <mois> » sur celles qu'elle portait ; août n'a pas d'homologue à
     retrouver, et il avait d'abord été écrit « Up to date », pour la seule
     case Star Trek. DC et The Walking Dead sont passés à août depuis :
     l'accueil annonçait donc « Updated · June » sur trois cases et « Up to
     date · August » sur les trois autres, pour la même phrase française. */
  ['À jour · août 2026', 'Updated · August 2026'],

  /* ── le bandeau de la page DC, passé à août le 18 août 2026 ──────
     La prod écrit « Updated · July 2026 » sur les quatre bandeaux ; seul
     le mois change, et il n'a pas d'homologue à retrouver tant que la
     prod anglaise est restée en juillet. */
  ['Mis à jour · Août 2026', 'Updated · August 2026'],

  /* ── le bandeau de la page Avatar Legends, passé à août le 25 août
     2026 avec l'ajout de Masters of the Elements ── même situation que
     DC, à la casse près : la page écrit le mois en minuscule. */
  ['Mis à jour · août 2026', 'Updated · August 2026'],

  /* ── la case The Walking Dead ───────────────────────────────────
     Sixième univers, même situation que Star Trek : rien à retrouver
     dans une prod qui ne l'a jamais porté. Son nom ne se traduit pas —
     aucune des six séries n'a de titre français — mais il doit figurer
     ici, sinon la nav, le tiroir et le pied de page ressortent sans
     traduction et le rapport les compte comme manquants.
     Le slot verrouillé n'annonce plus The Walking Dead : il est sorti
     des univers à venir, comme Star Trek avant lui. */
  ['The Walking Dead', 'The Walking Dead'],
  ['Séries · Webséries · Ordre chronologique complet',
   'TV Shows · Web Series · Full chronological order'],
  ['/ 45 vus', '/ 45 watched'],
  /* ── la case Dragon Age ─────────────────────────────────────────
     Septième univers, même situation que Star Trek et The Walking Dead :
     rien à retrouver dans une prod qui ne l'a jamais porté. Son nom ne se
     traduit pas — aucun jeu, aucun roman, aucun comic n'a de titre français
     — mais il doit figurer ici, sinon la nav, le tiroir et le pied de page
     ressortent sans traduction et le rapport les compte comme manquants.
     La case compte en « joués » et non en « vus » : c'est un guide de jeux,
     et sa page le dit déjà partout — filtre, HUD, badges.
     Le slot verrouillé n'annonce plus Dragon Age : il est sorti des univers
     à venir, comme Star Trek et The Walking Dead avant lui. */
  ['Dragon Age', 'Dragon Age'],
  ['Jeux · DLC · Romans · Comics · Séries · Ordre chronologique complet',
   'Games · DLC · Books · Comics · TV Shows · Full chronological order'],
  ['/ 43 joués', '/ 43 played'],
  /* ── la case Assassin's Creed ─────────────────────────────────
     Huitième univers, même situation que les trois précédents : rien à
     retrouver dans une prod qui ne l'a jamais porté. Son nom ne se traduit
     pas — aucun jeu, aucun roman, aucun comic n'a de titre français — mais il
     doit figurer ici, sinon la nav, le tiroir et le pied de page ressortent
     sans traduction et le rapport les compte comme manquants.
     Elle compte en « joués », comme Dragon Age : c'est un guide de jeux.
     Le slot verrouillé n'annonce plus Assassin's Creed : il est sorti des
     univers à venir, comme les trois autres avant lui. */
  ['Assassin’s Creed', 'Assassin’s Creed'],
  ['Jeux · DLC · Romans · Comics · Courts métrages · Ordre chronologique complet',
   'Games · DLC · Books · Comics · Short Films · Full chronological order'],
  ['/ 111 joués', '/ 111 played'],
  /* La ligne des sources du radar. La prod anglaise en portait trois ;
     le wiki Assassin's Creed est la quatrième depuis le 25 août 2026. */
  ['Mis à jour automatiquement chaque jour · sources : TMDB, Wookieepedia, Avatar Almanac, Assassin’s Creed Wiki',
   'Updated automatically every day · sources: TMDB, Wookieepedia, Avatar Almanac, Assassin’s Creed Wiki'],
  ['Stargate · Le Trône de Fer… et d\'autres univers en préparation.',
   'Stargate · Game of Thrones… and more universes in the works.'],

  // ── le choix du parcours, posé le 21 août 2026 ──────────────────
  // La question qui s'ouvre à l'arrivée et la bascule qui la remplace
  // ensuite. Rien de tout ça n'existe en prod : Star Wars est le premier
  // univers à servir deux ordres. Les deux réponses reprennent la voix
  // de l'accroche, à la première personne.
  ['Vous découvrez, ou vous revoyez ?', 'First time, or watching again?'],
  ['Je découvre', 'First time'],
  ['Je revois', 'Watching again'],
  ['Choisir le parcours', 'Choose your path'],

  // ── timelines ──────────────────────────────────────────────────
  ['Chronologeek — Star Wars (proto E)', 'Chronologeek — Star Wars (proto E)'],
  ['Chronologeek — Marvel (proto E)', 'Chronologeek — Marvel (proto E)'],
  ['Chronologeek — DC (proto E)', 'Chronologeek — DC (proto E)'],
  ['Cochez ce que vous avez vu, votre progression est sauvegardée.',
   'Check off what you\'ve watched — your progress is saved.'],
  ['Entrées', 'Entries'],
  ['À voir', 'To watch'],
  ['Commencer', 'Start'],
  ['0 débloqués', '0 unlocked'],
  ['Fermer le menu', 'Close menu'],        // pendant de CG.t.menu : Open menu
  ['film complet', 'full movie'],
  ['Films · Séries · Spider-Verse · Fox — tout le multivers dans son ordre le plus optimisé.',
   'Movies · Shows · Spider-Verse · Fox — the whole multiverse in its most optimized order.'],
  ['Guide du Multivers', 'Multiverse Guide'],   // dc.html · <h1>
  // l'intitulé des onglets de branche, lu par les lecteurs d'écran
  ['Choisir une branche', 'Choose a branch'],
  // les noms courts des ères, dans la navigation du Dossier
  ['Haute République', 'High Republic'],
  ['République', 'Republic'],
  ['Guerre des Clones', 'Clone Wars'],
  ['Rébellion', 'Rebellion'],
  ['Nouvelle République', 'New Republic'],
  ['Premier Ordre', 'First Order'],

  // ── dossiers ───────────────────────────────────────────────────
  ['Chronologeek — Dossiers (proto E)', 'Chronologeek — Deep Dives (proto E)'],
  ['Chronologeek — Dossier Star Wars (proto E)', 'Chronologeek — Star Wars Deep Dive (proto E)'],
  ['Dossier', 'Deep Dive'],
  ['Plus loin que la timeline', 'Beyond the timeline'],
  ['Sélection du dossier', 'Deep Dive selection'],
  ['Les guides qui vont plus loin que la timeline : ordres de lecture, analyses et parcours thématiques, univers par univers.',
   'The guides that go beyond the timeline: reading orders, analyses and thematic paths, universe by universe.'],
  ['Romans · Romans jeunesse · Comics — l\'ordre de lecture complet du canon, replacé entre les films et les séries.',
   'Novels · Young-reader books · Comics — the complete canon reading order, placed among the movies and shows.'],
  // Le décompte a quitté le bandeau de la case le 18 août 2026 : la carte
  // le donne déjà deux lignes plus haut, en score. Reste la date de mise
  // à jour, et sa traduction est celle de la ligne « À jour · août 2026 »
  // plus haut — une seule clé, un seul anglais.
  ['D\'autres Dossiers', 'More Deep Dives'],
  ['Qu\'aimeriez vous voir ici ? Des nouveautés arriveront.',
   'What would you like to see here? More is on the way.'],
  ['Dans le Dossier Star Wars', 'In the Star Wars Deep Dive'],
  ['Romans jeune adulte', 'Young adult novels'],
  ['Fictions audio', 'Audio dramas'],
  ['Repères écran', 'On-screen markers'],
  ['entrées lues', 'entries read'],
  ['1 dossier ouvert · 63 repères écran', '1 Deep Dive open · 63 on-screen markers'],
  ['Romans &amp; Comics', 'Novels &amp; Comics'],
  // CG.t.onScreen, sans le ▶ que le proto pose à part, et vouvoyé
  ['À l\'écran — où se placent les films et séries. Non comptés dans votre progression.',
   'On screen — where the movies and shows fall. Not counted in your progress.'],
  ['entrées (', 'entries ('],

  // ── nouveautés ─────────────────────────────────────────────────
  ['Chronologeek — Nouveautés (proto E)', 'Chronologeek — What\'s New (proto E)'],
  ['Dernier ajout', 'Latest addition'],
  ['Univers', 'Universe'],
  ['Nature', 'Kind'],                      // filtre : un média ou le site
  ['changements', 'changes'],
  ['Ajouts', 'Additions'],                 // NAT : un ajout de média…
  ['Site', 'Site'],                        // …ou un changement du site
  ['Rien ne correspond. Rallumez les filtres que vous avez éteints.',
   'Nothing matches. Turn the filters you switched off back on.'],
  ['Le journal est tenu à la main : une ligne par changement, la plus récente en haut.',
   'The log is kept by hand: one line per change, the most recent on top.'],
  ['Journal du site', 'Site log'],
  ['Le plus récent', 'Most recent'],
  ['Les mois précédents', 'Earlier months'],
  ['Dernière mise à jour ·', 'Last updated ·'],
  ['Nouveau Dossier', 'New Deep Dive'],
  ['Nouvelle timeline', 'New timeline'],
  ['dernier ·', 'latest ·'],
  ['affiché', 'shown'],

  // ── à venir ────────────────────────────────────────────────────
  ['Chronologeek — À venir (proto E)', 'Chronologeek — Upcoming (proto E)'],
  ['Mis à jour chaque jour', 'Updated every day'],
  ['Prochaine', 'Next'],
  // L'accroche énumère les univers : elle est à reprendre à chaque fois qu'on
  // en ajoute un. Star Trek y est entré le 13 août 2026, comme dans les deux
  // titres de référencement de `seo.json` et dans le pied de page.
  ['Toutes les prochaines sorties Star Wars, Marvel, DC, Avatar Legends, Star Trek et The Walking Dead — mises à jour chaque jour.',
   'Every upcoming Star Wars, Marvel, DC, Avatar Legends, Star Trek and The Walking Dead release — updated every single day.'],
  ['Rechercher une sortie', 'Search a release'],
  ['Support', 'Format'],                   // filtre par type de média
  ['Rien ne correspond. Essayez une autre orthographe, ou rallumez les filtres que vous avez éteints.',
   'Nothing matches. Try another spelling, or turn the filters you switched off back on.'],
  ['prochaine ·', 'next ·'],
  ['affichée', 'shown'],
  ['Ce mois-ci', 'This month'],
  ['avant la sortie', 'until release'],
  ['épisode', 'episode'],

  // Les douze mois et les sept jours, en entier : `MOIS` et `JOURS`
  // sont affichés dans les cartes du radar. À moitié traduits, la page
  // afficherait « 12 MER » sous « August ».
  ['janvier', 'January'], ['février', 'February'], ['mars', 'March'],
  ['avril', 'April'], ['mai', 'May'], ['juin', 'June'],
  ['juillet', 'July'], ['août', 'August'], ['septembre', 'September'],
  ['octobre', 'October'], ['novembre', 'November'], ['décembre', 'December'],
  ['dim', 'Sun'], ['lun', 'Mon'], ['mar', 'Tue'], ['mer', 'Wed'],
  ['jeu', 'Thu'], ['ven', 'Fri'], ['sam', 'Sat'],

  // ── compteurs de secours ───────────────────────────────────────
  // Ce que la page affiche avant que le script ne recalcule. Les
  // chiffres sont figés dans le HTML, seul le mot change.
  ['/ 121 vus', '/ 121 watched'],
  ['/ 534 lus', '/ 534 read'],
  ['121 / 121 affichées', '121 / 121 shown'],
  ['294 h', '294 h'],
  ['489 h', '489 h'],
  ['932 h', '932 h'],

  // dc.html donne « The post-event Arrowverse, the Elseworlds born
  // from the event, and the brand-new DCU. » ; la refonte s'arrête
  // avant le DCU, on coupe la phrase anglaise au même endroit.
  ['L\'Arrowverse post-événement, les Elseworlds issus de l\'événement.',
   'The post-event Arrowverse, the Elseworlds born from the event.'],
  // fin de la phrase « Cette page lit <code>data-news.js</code>, … »
  [', servi à côté d\'elle.', ', served next to it.'],

  // ── gabarits bâtis en JS ───────────────────────────────────────
  // Ces morceaux sont recollés à l'exécution autour d'un chiffre :
  // « Ère 3 / 7 », « 0 / 94 lus », « 2 repères à l'écran ».
  ['Ère', 'Era'],
  ['repères à l\'écran', 'on-screen markers'],
  ['au total', 'in total'],
  ['Star Wars —', 'Star Wars —'],

  // messages d'erreur, visibles seulement si un fichier manque
  ['Le journal n\'a pas pu être chargé.', 'The log could not be loaded.'],
  ['Le radar n\'a pas pu être chargé.', 'The radar could not be loaded.'],
  ['Cette page lit', 'This page reads'],
  ['à la racine : servez le dépôt (port 8947),', 'at the root: serve the repository (port 8947),'],
  ['pas le dossier', 'not the'],           // « …, pas le dossier <code>_proto</code>. »

  /* ── Avatar ──────────────────────────────────────────────────────
     Les trois autres timelines tirent ces libellés du parallélisme de
     leurs pages de prod ; Avatar n'en a pas, ils sont donc écrits ici.
     Le registre est celui qu'elles emploient déjà : « Séries » rend
     « Series », « Jeux vidéo » « Video games », d'où « Animated series »
     et « Books ». */
  ['Timeline Chronologique', 'Chronological Timeline'],
  ['Séries animées · Comics · Livres — tout l’univers Avatar Legends dans son ordre le plus optimisé.',
   'Animation · Comics · Books — the whole Avatar Legends universe in its most optimized order.'],
  ['Séries animées', 'Animated series'],
  ['Livres', 'Books'],
  // le compteur de départ, avant que le JS ne le recalcule
  ['69 / 69 affichées', '69 / 69 shown'],
  ['/ 69 vus', '/ 69 watched'],
  // la page emploie « votre » là où les données disent « ta » : c'est
  // le français qui hésite, l'anglais ne fait pas la différence
  ['Réinitialiser votre progression Avatar Legends ?', 'Reset your Avatar Legends progress?'],

  /* ── DC, les quatre colonnes ─────────────────────────────────────
     La refonte à quatre colonnes fusionne Elseworlds et « Les 2 univers
     principaux » en une seule zone, qui porte donc un nom et une
     description que la prod n'avait pas — les siennes, mises bout à
     bout, se répétaient et ne disaient pas qu'on lit les colonnes en
     parallèle.

     La bannière citée entre guillemets est le séparateur `crisis-start`,
     rendu « No turning back » par `traduire.mjs` : les deux tables
     doivent dire la même chose, sinon la description renverrait à un
     titre qui n'existe pas dans la page. */
  ['Les origines', 'The origins'],
  ['Ces histoires servent à introduire les origines des plus grands héros DC ainsi que les enjeux des différents univers, connectés ou non. Il n\'est pas conseillé de regarder les colonnes les unes à la suite des autres mais plutôt en parallèle. Assurez-vous d\'avoir regardé les éléments notés Important que vous voulez voir avant la bannière « Plus de retour en arrière » plus bas.',
   'These stories introduce the origins of DC’s greatest heroes, and what is at stake in each universe, connected or not. Watching the columns one after another is not advised — read them in parallel. Make sure you have watched the entries marked Important that you want to see before the “No turning back” banner further down.'],
  // la prod écrit « Swipe to see the other branches → » ; la flèche est
  // désormais une icône, elle ne fait plus partie de la phrase
  ['Faites glisser pour voir les autres branches', 'Swipe to see the other branches'],
];

const ECRITES = new Map(TRADUCTIONS.map(([f, e]) => [net(f), e]));

/* ═══ LES GABARITS QUI NE SE TRADUISENT PAS MOT À MOT ═══════════════
   Le français accorde deux fois, l'anglais une seule : « 31 sorties
   affichées » compte deux `s`, « 31 releases shown » un seul. Une
   substitution chaîne par chaîne rendrait « 31 releases showns ».

   On remplace donc l'expression entière, code compris, avant de
   toucher aux chaînes. Le membre de gauche doit exister tel quel dans
   le proto — le script s'arrête s'il ne le trouve pas, plutôt que de
   laisser passer un compteur faux. */
const EXPRESSIONS = [
  // « 31 sorties affichées » → « 31 releases shown »
  ["n+' sortie'+(n>1?'s':'')+' affichée'+(n>1?'s':'')",
   "n+' release'+(n>1?'s':'')+' shown'"],
  // le compteur d'une section de mois
  ["vis+' sortie'+(vis>1?'s':'')", "vis+' release'+(vis>1?'s':'')"],
  // CG.t.tracked donne « releases tracked »
  ["'sortie'+(n>1?'s':'')+' suivie'+(n>1?'s':'')",
   "'release'+(n>1?'s':'')+' tracked'"],
  // Le compte à rebours : « J » est l'initiale de Jour, « D » celle de
  // Day, et « D‑Day moins N » se dit en anglais. La pastille reste un
  // signe, comme en français — `CG.t.inDays` écrit « in {n} d » sur le
  // site en ligne, mais c'est une phrase, et elle casserait le bloc de
  // Big Shoulders 900 qui fait tout l'effet de la carte.
  ["return 'J‑'+n;", "return 'D‑'+n;"],
  // Les deux jours qui s'écrivent en toutes lettres. « DEMAIN » se retrouvait
  // seul au lexique, « AUJOURD’HUI » non — et la page anglaise l'annonçait
  // donc en français sous le compte à rebours, sans que rien ne le signale.
  // Un compteur de mots, forcément, ne voit pas un mot qui n'existe qu'ici.
  ["return 'AUJOURD’HUI';", "return 'TODAY';"],
  ["return 'DEMAIN';", "return 'TOMORROW';"],

  // ── le journal ─────────────────────────────────────────────────
  // Même accord double qu'au radar : « 8 changements affichés » ne
  // donne qu'un seul `s` en anglais.
  ["n+' changement'+(n>1?'s':'')+' affiché'+(n>1?'s':'')",
   "n+' change'+(n>1?'s':'')+' shown'"],
  ["m.items.length+' changement'+(m.items.length>1?'s':'')",
   "m.items.length+' change'+(m.items.length>1?'s':'')"],
  ["vis+' changement'+(vis>1?'s':'')", "vis+' change'+(vis>1?'s':'')"],
  ["visBack+' changement'+(visBack>1?'s':'')", "visBack+' change'+(visBack>1?'s':'')"],
  ["n+' changement'+(n>1?'s':'')", "n+' change'+(n>1?'s':'')"],
  ["'changement'+(n>1?'s':'')", "'change'+(n>1?'s':'')"],

  // Le journal pose le même badge VO, sur la carte de Legacy. Même
  // raison qu'au Dossier ci-dessous : il n'a pas d'objet en anglais.
  ["if(e.vo) tags+='<span class=\"vo\">VO</span>';",
   "/* pas de badge VO en anglais : voir traduire-pages.mjs */"],

  // ── le Dossier ─────────────────────────────────────────────────
  // Le badge « VO » dit qu'une œuvre n'a pas de version française.
  // L'information n'a pas d'objet pour un lecteur anglophone, qui lit
  // justement cette version : la page de prod anglaise ne l'affiche
  // nulle part, alors que la française le pose 1 fois. On fait pareil.
  ["(x.vo?'<span class=\"vo\" title=\"'+att(T.voTitle)+'\">VO</span>':'')",
   "'' /* pas de badge VO en anglais : voir traduire-pages.mjs */"],
];

/* ── recherche ─────────────────────────────────────────────────────
   Exacte d'abord. À défaut, on cherche la plus proche pour pouvoir la
   proposer dans le rapport — mais on ne l'applique jamais tout seul. */
function proche(fr) {
  const net = fr.trim().toLowerCase();
  let best = null, score = 0;
  for (const cle of table.keys()) {
    const c = cle.toLowerCase();
    if (Math.abs(c.length - net.length) > net.length * 0.35) continue;
    /* similarité par plus long préfixe commun, suffisant pour repérer
       une variante tu/vous sans embarquer un calcul de distance */
    let i = 0; while (i < c.length && i < net.length && c[i] === net[i]) i++;
    const s = (2 * i) / (c.length + net.length);
    if (s > score) { score = s; best = cle; }
  }
  return score >= 0.6 ? { cle: best, en: table.get(best), score } : null;
}

/* Le proto écrit « Film » là où les données portent « FILM » : la
   capitale est décidée en CSS d'un côté, dans la donnée de l'autre. On
   rattrape la correspondance à la casse près, puis on rend l'anglais
   dans la casse du français d'origine. */
const minuscules = new Map();
function indexeCasse() {
  for (const [fr, en] of table) {
    const k = fr.toLowerCase();
    if (!minuscules.has(k)) minuscules.set(k, en);
  }
}

function memeCasse(modele, texte) {
  if (modele === modele.toUpperCase() && /\p{Lu}/u.test(modele)) return texte.toUpperCase();
  if (modele === modele.toLowerCase()) return texte.toLowerCase();
  if (modele[0] === modele[0].toUpperCase()) {
    return texte[0].toUpperCase() + texte.slice(1).toLowerCase();
  }
  return texte;
}

/* ── un décompte qui change ne doit pas faire tomber sa phrase ──────
   « 533 entrées · 63 repères à l'écran » est au lexique parce que la
   prod l'écrivait ainsi des deux côtés. Ajoutez une entrée au Dossier,
   le proto écrit 534, et la clé ne correspond plus à rien : la phrase
   ressort SANS TRADUCTION, c'est-à-dire en français, sur la page
   anglaise. Rien dans la console, rien à l'écran qui alerte — seul le
   compteur du rapport bouge, et il faut le lire.

   On indexe donc aussi les phrases avec leurs nombres remplacés par un
   jeton. Deux garde-fous : le gabarit doit désigner UNE seule phrase
   anglaise — sinon on ne sait pas laquelle, et on renonce —, et les
   deux côtés doivent porter autant de nombres, dans le même ordre. On
   ne traduit rien de neuf ici : on réapplique une traduction déjà
   relue à une phrase dont seul un chiffre a bougé. */
const gabarit = s => s.replace(/[0-9]+/g, '{n}');
const gabarits = new WeakMap();     // une table source -> son index par gabarit

/* On indexe gabarit FRANÇAIS -> gabarits ANGLAIS, et pas les phrases
   anglaises entières. « 121 / 121 affichées » et « 69 / 69 affichées »
   sont deux phrases écrites, mais un seul et même gabarit des deux
   côtés : les distinguer ferait renoncer là où il n'y a aucun doute. */
function indexeGabarits(source) {
  const idx = new Map();
  for (const [fr, en] of source) {
    const g = gabarit(fr);
    if (g === fr) continue;                       // aucun nombre : rien a faire
    if (!/\p{L}/u.test(g)) continue;              // que des chiffres : trop court
    if (!idx.has(g)) idx.set(g, new Set());
    idx.get(g).add(gabarit(en));
  }
  gabarits.set(source, idx);
  return idx;
}

function parNombresDe(source, cle) {
  const idx = gabarits.get(source) || indexeGabarits(source);
  const candidats = idx.get(gabarit(cle));
  if (!candidats || candidats.size !== 1) return undefined;
  const modele = [...candidats][0];
  const chiffres = cle.match(/[0-9]+/g) || [];
  const trous = modele.match(/\{n\}/g) || [];
  /* Autant de nombres d'un côté que de trous de l'autre, sinon on ne
     sait pas lequel va où : « 2 films sur 3 » n'est pas « 2 movies ». */
  if (chiffres.length !== trous.length) return undefined;
  let i = 0;
  return modele.replace(/\{n\}/g, () => chiffres[i++]);
}

const parNombres = cle => parNombresDe(table, cle);

function traduit(fr) {
  const cle = net(fr);
  if (!cle) return undefined;
  const t = table.get(cle);
  if (t !== undefined) return t;
  if (identiques.has(cle)) return cle;
  if (!/\p{L}/u.test(cle)) return cle;
  const bas = minuscules.get(cle.toLowerCase());
  if (bas !== undefined) return memeCasse(cle, bas);
  return parNombres(cle);
}

/* Une phrase écrite à la main est appliquée, mais toujours consignée :
   elle doit passer la relecture avant d'être tenue pour acquise. */
function traduitOuEcrit(fr, signale) {
  const cle = net(fr);
  /* Aux nombres près, comme le lexique : « / 533 lus » a été écrit une
     fois, et rien n'oblige à le réécrire quand le Dossier gagne une
     entrée. La phrase reste consignée — elle est écrite, pas retrouvée. */
  const e = ECRITES.get(cle) ?? parNombresDe(ECRITES, cle);
  const t = traduit(fr);
  /* Une traduction écrite l'emporte quand le lexique se contente de
     renvoyer le mot inchangé : « jeu » est attesté identique des deux
     côtés parce qu'il sert de clé de support, mais dans le tableau des
     jours c'est l'abréviation de jeudi et il faut bien « Thu ». */
  if (e !== undefined && (t === undefined || t === cle)) { signale(cle, e); return e; }
  if (t !== undefined) return t;
  if (e !== undefined) { signale(cle, e); return e; }
  return undefined;
}

/* ── garder les deux versions alignées ─────────────────────────────
   `sync.py` vérifie la parité française/anglaise en lisant les deux
   pages ligne à ligne : c'est ce qui lui permet de dire qu'une entrée
   manque d'un côté. Une phrase française écrite sur trois lignes doit
   donc rendre trois lignes en anglais, sinon tout le fichier se décale
   et l'outil devient inutilisable après la livraison.

   On répartit donc le texte anglais sur le même nombre de lignes, en
   coupant aux espaces et en reprenant l'indentation de chaque ligne
   d'origine. */
function reflow(en, origine) {
  const lignes = origine.split('\n');
  if (lignes.length === 1) return en;

  /* l'indentation que portait chaque ligne du texte français */
  const creux = lignes.slice(1).map(l => l.match(/^[ \t]*/)[0]);
  const mots = en.split(/\s+/).filter(Boolean);
  if (mots.length < lignes.length) {
    /* moins de mots que de lignes : on garde le texte entier sur la
       première et on rend les suivantes vides, l'alignement prime */
    return en + creux.map(c => '\n' + c).join('');
  }

  const par = Math.ceil(mots.length / lignes.length);
  const bouts = [];
  for (let i = 0; i < lignes.length; i++) {
    const part = mots.slice(i * par, (i + 1) * par);
    bouts.push(part.join(' '));
  }
  /* les mots restants, s'il y en a, rejoignent la dernière ligne */
  const reste = mots.slice(lignes.length * par);
  if (reste.length) bouts[bouts.length - 1] += ' ' + reste.join(' ');

  return bouts.map((b, i) => (i === 0 ? b : creux[i - 1] + b)).join('\n');
}

/* ── code ou prose ? ───────────────────────────────────────────────
   Le JS des protos mélange des phrases affichées et des fragments
   techniques : sélecteurs, morceaux de SVG, valeurs CSS. On ne veut
   signaler que les premières — un `url(` ou un `<path d="…"/>` qui
   remonte en « texte non traduit » noie le vrai travail. */
function ressembleAuCode(s) {
  const t = s.trim();
  if (!t || !/\p{L}{2,}/u.test(t)) return true;
  if (/^[\d\s.,:%°/+-]*$/.test(t)) return true;
  if (/^(px|em|rem|vh|vw|deg|ms|s)$/i.test(t)) return true;
  if (/url\(|var\(|\d+px|scale|translate|rgba?\(|@media|prefers-|cubic-bezier/.test(t)) return true;
  if (/^https?:|^\/\/|^\/[\w/-]*$|api_key|search_query|page_size/.test(t)) return true;
  /* morceau d'attribut recollé à l'exécution : `" data-id="`, `class="` */
  if (/="|^"|"$|^&\w+;$|^\{\w+\}$/.test(t)) return true;
  if (/^[.#[]/.test(t) || /\[[\w-]+[=\]]/.test(t)) return true;   // sélecteur
  if (/^[\w-]+(\s*[>+~]\s*[\w.#-]+)+$/.test(t)) return true;
  if (/^<\/?[a-z]+[^>]*>?$/i.test(t)) return true;                // une balise seule
  if (/^use strict$/.test(t)) return true;
  /* un identifiant : un seul mot sans espace ni accent. Dans du JS,
     `'open'` et `'done'` sont des noms de classe passés à classList,
     pas des libellés — les traduire casserait le CSS. Les vrais mots
     d'interface, eux, sont déjà sortis par le lexique avant d'arriver
     ici, ou portent un accent. */
  if (!/\s/.test(t) && !/[àâäéèêëîïôöùûüçœ]/i.test(t)) return true;
  /* un début de nom de classe recollé à l'exécution : `cols zg-` */
  if (/-$/.test(t)) return true;
  return false;
}

/* ── lire le JS sans se tromper de guillemet ───────────────────────
   Les commentaires des protos sont en français, donc pleins
   d'apostrophes : « l'événement », « rien d'autre ». Un regex qui
   cherche des chaînes littérales y voit des délimiteurs et découpe la
   prose n'importe où — d'où des fragments comme « ils s » ou « est
   celui d », et le risque d'écrire dans un commentaire en croyant
   toucher une chaîne.

   On parcourt donc le source caractère par caractère en suivant l'état
   réel : code, chaîne, gabarit, commentaire. Seules les chaînes
   ressortent, avec leur position exacte. */
/* Les intervalles que le proto déclare intraduisibles.

   Certaines chaînes françaises sont des données, pas des libellés : la
   table de correspondance de « À venir » cherche « livre », « série »,
   « épisode » dans `radar.json`, lequel reste français dans les deux
   langues puisque c'est le même fichier qui alimente les deux pages.
   Les traduire ne se voit pas à la relecture du diff — le JS reste
   valide — mais la page anglaise n'affiche plus une seule sortie.

   Plutôt que de deviner, on laisse le proto le dire : tout ce qui est
   entre `i18n-off` et `i18n-on` est recopié tel quel. */
function zonesProtegees(js) {
  const zones = [];
  const re = /i18n-off([\s\S]*?)i18n-on/g;
  let m;
  while ((m = re.exec(js))) zones.push([m.index, m.index + m[0].length]);
  return zones;
}

/* Une chaîne passée à une API du DOM est un identifiant, jamais un
   libellé — et rien dans le mot lui-même ne le dit.

   `document.getElementById('note')` en est l'exemple : « Note » figure
   au lexique parce que la fiche d'un film affiche une note, traduite
   par « Rating ». La chaîne devenait donc `getElementById('rating')`,
   qui ne trouve plus rien : le script levait une exception, le `catch`
   l'avalait, et la page affichait « le radar n'a pas pu être chargé »
   sans une ligne dans la console. On regarde donc ce qui précède la
   chaîne avant d'y toucher. */
const APPELS_DOM = new RegExp(
  '(?:getElementById|querySelectorAll|querySelector|getElementsByClassName'
  + '|getElementsByTagName|createElement|createElementNS|addEventListener'
  + '|removeEventListener|getAttribute|setAttribute|removeAttribute|hasAttribute'
  + '|matches|closest|getItem|setItem|removeItem|classList\\.\\w+'
  + '|insertAdjacentHTML|dataset)\\s*\\(\\s*$');

function argumentTechnique(js, debut) {
  return APPELS_DOM.test(js.slice(Math.max(0, debut - 60), debut));
}

function chainesDu(js) {
  const out = [];
  const interdits = zonesProtegees(js);
  const protege = p => interdits.some(([a, b]) => p >= a && p < b);
  let i = 0;
  const n = js.length;
  while (i < n) {
    const c = js[i];
    if (c === '/' && js[i + 1] === '/') {
      i = js.indexOf('\n', i); if (i < 0) break; continue;
    }
    if (c === '/' && js[i + 1] === '*') {
      const f = js.indexOf('*/', i + 2); i = f < 0 ? n : f + 2; continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const debut = i; i++;
      let val = '';
      while (i < n) {
        if (js[i] === '\\') { val += js[i] + js[i + 1]; i += 2; continue; }
        if (js[i] === c) break;
        /* une chaîne simple ou double ne franchit pas la ligne : si on
           tombe sur un saut, c'est qu'on avait affaire à une apostrophe
           de prose, pas à un délimiteur */
        if (js[i] === '\n' && c !== '`') { val = null; break; }
        val += js[i]; i++;
      }
      if (val !== null && i < n) {
        if (!protege(debut) && !argumentTechnique(js, debut)) {
          out.push({ debut, fin: i + 1, quote: c, val });
        }
        i++;
      } else {
        i = debut + 1;
      }
      continue;
    }
    i++;
  }
  return out;
}

/* Une chaîne peut porter du HTML autour du texte : on traduit alors ce
   qu'il y a entre les balises, pas la chaîne entière. */
function traduitFragment(s, note, ecrit) {
  if (!/[<>]/.test(s)) {
    const en = traduitOuEcrit(s, ecrit);
    if (en !== undefined) {
      /* Les espaces de bord portent du sens : le JS colle ses morceaux
         bout à bout, et `n+' sortie'+(n>1?'s':'')` doit rendre
         « 31 releases », pas « 31releases ». Le lexique travaille sur
         la forme resserrée, donc on remet les blancs d'origine. */
      const tete = s.match(/^\s*/)[0], queue = s.match(/\s*$/)[0];
      return tete + en + queue;
    }
    if (!ressembleAuCode(s)) note(net(s));
    return null;
  }
  /* Le JS bâtit ses vues par morceaux : `'<span class="chev">Ère '`,
     `' lus</span>'`, `' repères à l’écran</span></p>'`. Le texte n'y
     est donc pas toujours encadré de deux balises — il ouvre ou ferme
     la chaîne. On découpe en alternance balise / texte pour l'attraper
     où qu'il soit, sinon les en-têtes d'ères restent en français. */
  let touche = false;
  const out = s.replace(/(<[^<>]*>?)|([^<>]+)/g, (t, balise, texte) => {
    if (balise !== undefined) {
      /* Dans une balise, un seul contenu se lit à l'écran : les
         attributs d'accessibilité. Le JS de DC bâtit ses onglets avec
         `'<div role="tablist" aria-label="Choisir une branche">'`, et
         cet intitulé est ce qu'un lecteur d'écran annonce. Tout le
         reste — class, id, data-*, href — ne se traduit pas. */
      return balise.replace(/\b(aria-label|title|placeholder|alt)="([^"]*)"/g, (a, nom, val) => {
        if (!val.trim() || !/\p{L}/u.test(val)) return a;
        const en = traduitOuEcrit(val, ecrit);
        if (en === undefined) { if (!ressembleAuCode(val)) note(net(val)); return a; }
        if (en !== net(val)) touche = true;
        return `${nom}="${en}"`;
      });
    }
    if (!texte.trim() || !/\p{L}/u.test(texte)) return t;
    const en = traduitOuEcrit(texte, ecrit);
    if (en === undefined) { if (!ressembleAuCode(texte)) note(net(texte)); return t; }
    if (en !== net(texte)) touche = true;
    const tete = texte.match(/^\s*/)[0], queue = texte.match(/\s*$/)[0];
    return tete + en + queue;
  });
  return touche ? out : null;
}

/* ═══ LES PAGES ═════════════════════════════════════════════════════ */
const PAGES = [
  { fr: 'e-accueil.html', en: 'en-accueil.html' },
  { fr: 'e-starwars.html', en: 'en-starwars.html' },
  { fr: 'e-marvel.html', en: 'en-marvel.html' },
  { fr: 'e-dc.html', en: 'en-dc.html' },
  /* Avatar n'a pas de page de prod anglaise d'où tirer un lexique — mais
     il n'en a pas besoin : sa page est le gabarit des trois autres, et
     ce sont elles qui l'ont appris. Seuls ses textes propres, qui vivent
     dans les données, ont demandé d'être écrits. */
  { fr: 'e-avatar.html', en: 'en-avatar.html' },
  { fr: 'e-dossiers.html', en: 'en-dossiers.html' },
  { fr: 'e-dossier-star-wars.html', en: 'en-dossier-star-wars.html' },
  { fr: 'e-nouveautes.html', en: 'en-nouveautes.html' },
  { fr: 'e-a-venir.html', en: 'en-a-venir.html' },
];

/* ── le sélecteur de langue ────────────────────────────────────────
   Le bouton porte le drapeau de la langue vers laquelle il emmène, pas
   celle de la page : la version française montre l'Union Jack, la
   version anglaise doit donc montrer le tricolore. Le SVG est celui de
   la prod anglaise, repris tel quel — trois rectangles, aucune finesse
   de liseré à rattraper, contrairement au drapeau britannique dont le
   commentaire d'origine explique l'épaississement.

   Les émojis drapeaux ne s'affichent pas sous Windows : c'est pour ça
   que le site en dessine partout plutôt que d'écrire 🇫🇷. */
const DRAPEAU_FR = '<svg viewBox="0 0 3 2" aria-hidden="true">'
  + '<rect width="1" height="2" fill="#002395"/>'
  + '<rect x="1" width="1" height="2" fill="#fff"/>'
  + '<rect x="2" width="1" height="2" fill="#ED2939"/></svg>';

function basculeDrapeau(html, versFR) {
  return html.replace(
    /<a class="icon-btn lang-btn"[^>]*>[\s\S]*?<\/a>/,
    (bloc) => {
      /* le bloc français compte un commentaire que le tricolore n'a pas
         besoin d'expliquer ; on rend malgré tout le même nombre de
         lignes, pour ne pas décaler la page vis-à-vis de sa jumelle */
      const lignes = bloc.split('\n');
      const out = [
        `<a class="icon-btn lang-btn" href="${versFR}" aria-label="Passer en français" title="Passer en français">`,
        `        ${DRAPEAU_FR}`,
      ];
      while (out.length < lignes.length - 1) out.push('');
      out.push(lignes[lignes.length - 1]);   // la ligne du </a>, indentation comprise
      return out.join('\n');
    });
}

/* Les données suivent la page : e-marvel charge data-mcu.js, en-marvel
   doit charger data-mcu-en.js. */
function redirigeSources(html) {
  return html.replace(/(<script\s+src=")([^"]+)(")/g, (t, a, src, c) => {
    if (/^data.*\.js$/.test(src) && !src.endsWith('-en.js')) {
      return a + src.replace(/\.js$/, '-en.js') + c;
    }
    return t;
  }).replace(/(href|src)="e-([a-z0-9-]+\.html)/g, '$1="en-$2');
}

/* ── ce qu'un renommage rend caduc ────────────────────────────────
   Le lexique apparie le proto français à la prod anglaise ligne à
   ligne : renommer un libellé dans le proto lui fait donc apprendre
   « nouveau nom français » → « ancien nom anglais », et la page
   anglaise garde l'ancien nom sans que rien ne le signale. C'est
   arrivé au renommage d'« Avatar » en « Avatar Legends » le 18 août
   2026 : le pied de page suivait, le menu et le tiroir non — leur
   ligne était parallèle à celle de la prod, la mention légale ne
   l'était plus.

   Ces clés sont donc retirées du lexique avant qu'il ne serve. Elles
   retombent alors sur `identiques`, où le nouveau nom est déclaré. */
for (const cle of ['Avatar Legends']) table.delete(cle);

/* le lexique est complet : on peut en tirer ses deux index dérivés —
   à la casse près, et aux nombres près */
indexeCasse();

const manques = [];
const ecrites = [];
const expressionsVues = new Set();
const rapport = [];

for (const P of PAGES) {
  let src = lire(`_proto/${P.fr}`);
  const avant = [];

  /* On ne touche ni au CSS ni aux commentaires de direction : on
     découpe la page en zones, et on ne traite que le HTML et les
     chaînes littérales du JS inline. */
  const zones = [];
  const re = /<style[\s\S]*?<\/style>|<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g;
  let pos = 0, m;
  while ((m = re.exec(src))) {
    zones.push({ type: 'html', txt: src.slice(pos, m.index) });
    const bloc = m[0];
    zones.push({ type: bloc.startsWith('<script') ? 'js' : 'brut', txt: bloc });
    pos = m.index + bloc.length;
  }
  zones.push({ type: 'html', txt: src.slice(pos) });

  const note = (fr, ou) => {
    const p = proche(fr);
    manques.push({ page: P.fr, ou, fr, statut: 'sans traduction',
                   proche: p ? p.cle : null, procheEn: p ? p.en : null,
                   score: p ? Math.round(p.score * 100) : 0 });
  };

  /* les phrases écrites à la main : appliquées, et listées pour la relecture */
  const ecrit = (fr, en, ou) => {
    ecrites.push({ page: P.fr, ou: ou || 'texte', fr, en, statut: 'traduit, à relire' });
  };

  const zonesTraduites = zones.map(z => {
    if (z.type === 'brut') return z.txt;

    if (z.type === 'html') {
      let out = z.txt.replace(/>([^<>]+)</g, (t, txt) => {
        if (!txt.trim() || !/\p{L}/u.test(txt)) return t;
        const en = traduitOuEcrit(txt, (f, e) => ecrit(f, e, 'texte'));
        if (en === undefined) { note(net(txt), 'texte'); return t; }
        /* l'indentation d'origine est conservée, et le texte anglais
           reprend la même découpe en lignes que le français */
        const tete = txt.match(/^\s*/)[0], queue = txt.match(/\s*$/)[0];
        const coeur = txt.slice(tete.length, txt.length - queue.length);
        return '>' + tete + reflow(en, coeur) + queue + '<';
      });
      out = out.replace(ATTRS, (t, v) => {
        if (!v.trim() || !/\p{L}/u.test(v)) return t;
        const en = traduitOuEcrit(v, (f, e) => ecrit(f, e, 'attribut'));
        if (en === undefined) { note(net(v), 'attribut'); return t; }
        return t.replace(`"${v}"`, `"${en}"`);
      });
      return out;
    }

    /* JS inline : seules les chaînes littérales, jamais les
       commentaires ni le code. On reconstruit de la fin vers le début
       pour que les positions relevées restent valables. */
    /* les gabarits à grammaire d'abord : ils remplacent du code, donc
       les positions des chaînes ne valent qu'après */
    let brut = z.txt;
    for (const [fr, en] of EXPRESSIONS) {
      if (brut.includes(fr)) { brut = brut.split(fr).join(en); expressionsVues.add(fr); }
    }

    const trouvees = chainesDu(brut);
    let out = brut;
    for (let k = trouvees.length - 1; k >= 0; k--) {
      const { debut, fin, quote, val } = trouvees[k];
      if (!val || !/\p{L}/u.test(val)) continue;
      /* ── un code de langue n'est pas un mot ──────────────────────
         `'fr'` et `'en'` sont au lexique — la page française pose
         `otherFlag:"en"`, l'anglaise `"fr"` — et l'appariement en tire
         « en » → « fr ». Appliqué à du code, ça retourne le test :
         `T.lang!=='en'`, qui protégeait le badge VO de la page Avatar,
         est devenu `T.lang!=='fr'`, vrai en anglais, et le badge s'est
         mis à s'afficher partout où le français dit VO. Rien dans la
         console, rien au rapport : la page se contentait d'être fausse.
         Ces deux chaînes-là ne se traduisent donc jamais. */
      if (/^(fr|en)$/.test(val)) continue;
      const en = traduitFragment(val, fr => note(fr, 'js'), (f, e) => ecrit(f, e, 'js'));
      if (en === null) continue;
      const echappe = en.split(quote).join('\\' + quote);
      out = out.slice(0, debut) + quote + echappe + quote + out.slice(fin);
    }
    return out;
  });

  let out = zonesTraduites.join('');
  out = out.replace(/<html lang="fr">/, '<html lang="en">');
  out = redirigeSources(out);
  out = basculeDrapeau(out, P.fr);   // le bouton renvoie à la page française

  const restants = manques.filter(x => x.page === P.fr);
  rapport.push({ page: P.fr, vers: P.en, manques: restants.length });

  if (!CHECK) fs.writeFileSync(path.join(RACINE, `_proto/${P.en}`), out, 'utf8');
}

/* ═══ BILAN ═════════════════════════════════════════════════════════ */
console.log(CHECK ? 'CONTRÔLE — rien n\'est écrit\n' : 'ÉCRITURE\n');
console.log(`  lexique : ${table.size} textes appariés, ${identiques.size} identiques`
  + (collisions.size ? `, ${collisions.size} ambigus` : ''));
console.log();
for (const r of rapport) {
  console.log(`  ${r.page.padEnd(28)} → ${r.vers.padEnd(28)} ${r.manques ? r.manques + ' à voir' : 'complet'}`);
}

const uniques = new Map();
for (const m of manques) if (!uniques.has(m.fr)) uniques.set(m.fr, m);
console.log(`\n  ${manques.length} occurrence(s), ${uniques.size} texte(s) distinct(s) sans traduction`);

/* Les phrases écrites à la main, regroupées par texte : ce sont elles
   que la relecture doit passer en revue. */
const parEcrite = new Map();
for (const e of ecrites) {
  if (!parEcrite.has(e.fr)) parEcrite.set(e.fr, { ...e, pages: new Set() });
  parEcrite.get(e.fr).pages.add(e.page);
}
console.log(`  ${ecrites.length} emploi(s) de ${parEcrite.size} phrase(s) écrite(s) à la main`);

if (CHECK || process.argv.includes('--detail')) {
  for (const m of uniques.values()) {
    console.log(`\n  [${m.page} · ${m.ou}] ${m.fr.slice(0, 120)}`);
    if (m.proche) console.log(`      proche ${m.score}% : ${m.proche.slice(0, 90)}`
      + `\n              → ${String(m.procheEn).slice(0, 90)}`);
  }
}

/* Une expression déclarée mais introuvable veut dire que le proto a
   changé : mieux vaut le dire fort que rendre un compteur faux. */
const orphelines = EXPRESSIONS.filter(([fr]) => !expressionsVues.has(fr));
if (orphelines.length) {
  console.log('\n  ⚠ gabarit(s) introuvable(s) dans les protos — à revoir :');
  for (const [fr] of orphelines) console.log('      ' + fr);
}

if (!CHECK) {
  fs.writeFileSync(path.join(RACINE, '_proto/a-traduire-pages.json'),
    JSON.stringify([...uniques.values()], null, 2), 'utf8');
  fs.writeFileSync(path.join(RACINE, '_proto/a-relire-pages.json'),
    JSON.stringify([...parEcrite.values()].map(e => ({
      fr: e.fr, en: e.en, ou: e.ou, pages: [...e.pages].sort(),
    })), null, 2), 'utf8');
  console.log('\n  → _proto/a-traduire-pages.json (rien à traduire)'
    + '\n  → _proto/a-relire-pages.json (à relire)');
}
