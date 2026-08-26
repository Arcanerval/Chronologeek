/* ═══ LA VERSION ANGLAISE DES DONNÉES DE LA REFONTE ══════════════════
   Produit `data-*-en.js` à partir des `data-*.js` français, sans jamais
   écrire une phrase : chaque texte est repris mot pour mot de la page de
   prod anglaise correspondante.

   POURQUOI ON N'ÉCRIT PAS DE TRADUCTION. Le site tourne déjà en deux
   langues : la racine est anglaise, `/fr/` est française, et les deux
   sont tenues à parité. La refonte a extrait ses données du français ;
   l'anglais est donc déjà écrit, relu et en ligne. Le traduire à nouveau
   ferait diverger deux textes qui doivent rester le même.

   COMMENT ON APPARIE. Deux mécanismes, dans cet ordre.

   1. Par identifiant. Les entrées de timeline et les items du Dossier
      portent le même `id` des deux côtés — on lit le champ homologue de
      l'entrée anglaise de même id. C'est exact, et insensible à l'ordre.
   2. Par lexique. Ce qui n'a pas d'identifiant — libellés d'interface,
      titres d'ères, colonnes DC, prose d'introduction — est apparié en
      lisant les deux pages en parallèle : `CG.t` clé par clé, `ZONES`
      colonne par colonne, les ères rang par rang. On en tire une table
      français → anglais, et toute chaîne restante y est cherchée.

   Ce qui n'est trouvé ni par l'un ni par l'autre n'est pas deviné : la
   valeur française est conservée telle quelle et l'entrée part dans
   `_proto/a-traduire.json`, pour être écrite à la main puis relue.

   Les champs techniques — `id`, `tmdb`, `img`, `media`, `level`, `k`,
   les couleurs — ne sont jamais touchés : ils viennent du proto, qui
   fait foi sur la structure puisque c'est lui que les pages chargent.

       node _proto/traduire.mjs          écrit les fichiers
       node _proto/traduire.mjs --check  n'écrit rien, affiche le bilan

   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AVATAR_TRADUCTIONS, AVATAR_IDENTIQUES } from './traductions-avatar.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const CHECK = process.argv.includes('--check');

const lire = p => fs.readFileSync(path.join(RACINE, p), 'utf8');

/* ── où lire la prod ────────────────────────────────────────────────
   Plus à la racine du site : la publication de la refonte l'a remplacée
   par la sortie de ce script même, et se relire soi-même ne retrouve
   plus rien — ça fige. Les pages d'avant sont figées dans
   `_proto/reference/`, avec le pourquoi dans son LISEZ-MOI. */
const PROD = 'reference';
const lirePage = rel => lire(path.posix.join('_proto', PROD, rel));

/* ── évaluer plutôt que lire au regex ──────────────────────────────
   Les `notes` sont des template literals bourrés de HTML, de guillemets
   et d'apostrophes. Un regex y laisserait des plumes ; le moteur JS, non. */
function evalue(js) {
  const box = { window: {} };
  /* On ne devine pas les noms : on lit ceux que le fichier déclare —
     DATA, NOTES, CG_ZONES, RT… — et on les repousse sur `window`. DC
     range son intro dans `NOTES` et ses branches dans `CG_ZONES`, ce
     qu'une liste écrite d'avance aurait manqué. */
  const noms = [...new Set([...js.matchAll(/(?:^|[\n;{])\s*(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=/g)]
    .map(m => m[1]))];
  const code = js.replace(/\bconst /g, 'var ')
    + noms.map(n => `\n;try{window[${JSON.stringify(n)}]=${n}}catch(e){}`).join('');
  new Function('window', code)(box.window);
  return box.window;
}

/* Les scripts inline d'une page de prod qui portent des données. */
function depuisPage(rel) {
  const src = lirePage(rel);
  /* Tout script inline qui déclare une constante en majuscules ou pose
     `window.CG*` porte des données ; le reste est du comportement. */
  const js = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => m[1])
    .filter(s => /\bconst\s+[A-Z][A-Z0-9_]*\s*=|window\.CG(_[A-Z]+)?\s*=/.test(s))
    .join('\n');
  return evalue(js);
}

const depuisProto = rel => evalue(lire(rel));

/* ═══ L'APPOINT ═════════════════════════════════════════════════════
   Quelques textes sont en anglais dans la prod mais hors des données :
   DC écrit son titre dans le `<h1>` et son sous-titre dans `.sub`, pas
   dans `DATA`. Ils sont recopiés ici avec leur provenance, pour que la
   relecture puisse remonter à la source. Rien n'est écrit de ma main :
   toute ligne ajoutée ici doit exister mot pour mot dans la page citée.

   Ce n'est pas un fourre-tour à traductions : ce qui n'a pas de source
   anglaise part dans a-traduire.json, pas ici. */
const APPOINT = [
  // dc.html · <h1><span class="u">DC</span> — Multiverse Guide</h1>
  ['DC — Guide du Multivers', 'DC — Multiverse Guide'],
  ['Guide du Multivers', 'Multiverse Guide'],
  // dc.html · <p class="sub">Elseworlds · Arrowverse · DCEU · DCU — the
  // complete multiverse guide… — le proto n'en garde que l'énumération,
  // identique dans les deux langues puisqu'elle n'est faite que de noms.
  ['Elseworlds · Arrowverse · DCEU · DCU', 'Elseworlds · Arrowverse · DCEU · DCU'],
  // whats-new.html · « Spider-Man: Brand New Day added to the Marvel
  // timeline, in 2028, right after The Punisher: One Last Kill. »
  ['Spider-Man : Brand New Day', 'Spider-Man: Brand New Day'],
];

/* ═══ CE QUI N'A PAS DE SOURCE ══════════════════════════════════════
   Dix-sept chaînes, et dix-sept seulement, n'existent nulle part en
   anglais : une entrée Marvel ajoutée après la dernière mise à jour de
   la prod, les libellés de bouton du journal, qui sont nés avec la
   refonte, le séparateur DC réécrit le 10 août 2026, et la carte Star
   Trek du journal, écrite le 11.

   ⚠ CE SONT LES SEULES PHRASES ÉCRITES, PAS EXTRAITES. Elles attendent
   la relecture de Niko — voir `_proto/A-RELIRE-EN.md`, qui les présente
   avec leur contexte. Tout le reste du site anglais vient de la prod.

   Chacune est calquée sur une formule déjà employée dans la version
   anglaise, citée en commentaire, pour ne pas introduire un registre
   qui détonnerait au milieu des 900 autres entrées. */
const TRADUCTIONS = [
  // marvel.html · « The movie takes place during what's known as Fury's
  // Big Week, so in 2010 » + « right after the events of… »
  ['Le film se déroule pendant l\'automne 2028 après les évènements de The Punisher : One Last Kill',
   'The movie takes place in the fall of 2028, after the events of The Punisher: One Last Kill'],
  // marvel.html · « Because this is where it falls chronologically »
  ['Parce que le film se situe ici chronologiquement',
   'Because this is where the movie falls chronologically'],
  // marvel.html · « The post-credits scene matters. » est la formule
  // employée pour les scènes qu'il ne faut pas manquer.
  ['La scène post-crédits est importante.', 'The post-credits scene matters.'],

  /* ── les fiches corrigées après la dernière mise à jour de la prod ──
     Ces quatre réponses ont été réécrites dans le proto français ; la
     version anglaise en ligne est restée sur l'ancien texte, qui dit
     autre chose. On traduit donc la nouvelle, et le script signale la
     divergence tant qu'elle n'est pas relue. */
  // Doctor Strange — la fiche disait « juste après No Way Home »
  ['Le film se déroule sur 2016 et 2017, l\'entraînement de Stephen Strange à Kamar-Taj s\'étalant sur plusieurs mois',
   'The movie takes place across 2016 and 2017, Stephen Strange\'s training at Kamar-Taj spanning several months'],
  ['La première scène est un extrait de Thor Ragnarok que vous pouvez passer, la deuxième n\'a toujours pas de résolu à ce jour mais vous pouvez la regarder',
   'The first scene is a clip from Thor: Ragnarok that you can skip; the second still has no resolution to this day, but you can watch it'],
  // Thunderbolts* — la fiche portait la FAQ de sa scène post-générique
  ['Le film se déroule en 2027', 'The movie takes place in 2027'],
  ['La première scène est importante, la deuxième est très importante et placée plus loin dans la timeline',
   'The first scene is important; the second is very important, and placed later in the timeline'],
  // whats-new.html emploie « Deep Dive » au singulier, et `nav.deep`
  // « Deep Dives » au pluriel : c'est le nom anglais du Dossier.
  ['Voir dans la timeline', 'See in the timeline'],
  ['Voir dans le Dossier', 'See in the Deep Dive'],
  ['Ouvrir la timeline', 'Open the timeline'],
  ['Ouvrir le Dossier', 'Open the Deep Dive'],
  // dc.html · « The post-event Arrowverse, the Elseworlds born from the
  // event, and the brand-new DCU. » — la refonte s'arrête avant le DCU,
  // on coupe la phrase anglaise au même endroit.
  ['L\'Arrowverse post-événement, les Elseworlds issus de l\'événement.',
   'The post-event Arrowverse, the Elseworlds born from the event.'],

  /* ── le séparateur DC, réécrit le 10 août 2026 ──
     La prod annonçait « ⚡ The major event begins » et renvoyait aux
     Elseworlds « marked 🚨 » ; le proto a rebaptisé la bannière et changé
     ce qu'elle demande — le DCEU et les deux origines, plus les
     Elseworlds. On traduit donc le texte neuf, mais la clause du DCEU
     reprend mot pour mot celle de la prod, déjà relue. */
  ['Plus de retour en arrière', 'No turning back'],
  ['Si vous comptiez regarder le DCEU (au moins jusqu\'à Justice League inclus) et les deux origines de Batman et Superman (les éléments Important) faites le avant de continuer l\'Arrowverse.',
   'If you were planning to watch the DCEU (at least up to and including Justice League) and the two Batman and Superman origins (the Important entries), do it before going on with the Arrowverse.'],

  /* ── la carte Star Trek du journal, écrite le 11 août 2026 ──
     Le cinquième univers est postérieur à la prod : il n'y a rien à
     retrouver, ces trois lignes sont écrites. La carte n'est montrée
     que sur la page anglaise — c'est `e-nouveautes.html` qui l'écarte
     du français, le temps que Star Trek ait sa page dans cette langue.

     La carte a d'abord dit « En anglais pour le moment », le temps que
     le proto français de Star Trek soit écrit. Il l'est. */
  // whats-new.html · « New timeline: Avatar », la même formule
  ['Nouvelle timeline : Star Trek', 'New timeline: Star Trek'],
  /* La carte Avatar du journal était au lexique tant que l'univers
     s'appelait « Avatar » des deux côtés. Le renommage l'en sort : la
     formule est celle de la prod, seul le nom a changé. */
  ['Nouvelle timeline : Avatar Legends', 'New timeline: Avatar Legends'],
  // whats-new.html · « 69 entries, from the Yangchen, Kyoshi and Roku
  // novels all the way to the Korra era. »
  ['248 entrées, du 21e au 43e siècle — séries, films, animés et Short Treks dans un seul fil.',
   '248 entries, from the 21st to the 43rd century — series, movies, animation and Short Treks in a single thread.'],
  // whats-new.html · « July 2026 », « June 2026 »
  ['Août 2026', 'August 2026'],

  /* ── la carte The Walking Dead du journal, écrite le 16 août 2026 ──
     Même situation que Star Trek : le sixième univers est postérieur à
     la prod, il n'y a rien à retrouver. Le titre de la timeline ne se
     traduit pas — aucune des sept séries n'a de titre français. */
  ['Nouvelle timeline : The Walking Dead', 'New timeline: The Walking Dead'],
  ['45 entrées, de l\'épidémie de Los Angeles à New York — les sept séries et les huit webséries dans un seul fil.',
   '45 entries, from the Los Angeles outbreak to New York — all seven shows and the eight web series in a single thread.'],

  /* ── la carte Dragon Age, écrite le 20 août 2026 ────────────────────
     Septième univers, même situation que les deux précédents. Ni les
     jeux, ni les DLC, ni les comics n'ont de titre français : seuls
     quatre romans en ont un, et « Le Trône Volé » est le premier de la
     timeline. */
  ['Nouvelle timeline : Dragon Age', 'New timeline: Dragon Age'],
  ['43 entrées, du Trône Volé au Veilguard — les jeux et leurs DLC, les romans, les comics et les séries dans un seul fil.',
   '43 entries, from The Stolen Throne to The Veilguard — the games and their DLC, the books, the comics and the shows in a single thread.'],

  /* ── la carte Assassin's Creed, écrite le 25 août 2026 ─────────
     Huitième univers, même situation que les trois précédents. Les deux
     bornes de l'accroche sont des noms propres : Altaïr ouvre la timeline,
     l'Animus Hub la ferme, et ni l'un ni l'autre ne se traduit. */
  ['Nouvelle timeline : Assassin’s Creed', 'New timeline: Assassin’s Creed'],
  ['111 entrées, d\'Altaïr à l\'Animus Hub — les jeux et leurs DLC, les romans, les comics et les courts métrages dans un seul fil.',
   '111 entries, from Altaïr to the Animus Hub — the games and their DLC, the novels, the comics and the short films in a single thread.'],

  /* ── la carte du comic Kylo Ren, écrite le 13 août 2026 ──
     Même moule que la carte « Legacy » de juillet, qui dit en anglais
     « Added to the Star Wars Deep Dive — the new novel, in 34 ABY, just
     before Pirate's Price ». Le titre, lui, ne se traduit pas : le comic
     sort en VO, il est déclaré identique plus bas.

     Le voisin cité change de nom d'une langue à l'autre — la prod
     anglaise écrit « Legacy of Vader », que le Dossier français rend
     par « L'Héritage de Vador ». */
  ['Ajouté au Dossier Star Wars — le comic, en 34 ABY, juste après L\'Héritage de Vador.',
   'Added to the Star Wars Deep Dive — the comic, in 34 ABY, just after Legacy of Vader.'],

  /* ── la carte Lanterns du journal, écrite le 18 août 2026 ──
     whats-new.html · « Supergirl (2026) added to the DC timeline,
     following the DCU. » — même moule, seul le voisin cité change. Le
     titre, lui, ne se traduit pas : il est déclaré identique plus bas. */
  ['Ajoutée à la timeline DC, à la suite de Supergirl.',
   'Added to the DC timeline, following Supergirl.'],

  /* ── la carte Masters of the Elements du journal, écrite le 25 août
     2026 ── même moule que les précédentes, le voisin cité étant un
     titre qui ne se traduit pas. */
  ['Ajouté à la timeline Avatar Legends, en 290 BG, juste après The Shadow of Kyoshi.',
   'Added to the Avatar Legends timeline, in 290 BG, just after The Shadow of Kyoshi.'],

  /* ── la carte The Last Court du journal, écrite le 26 août 2026 ──
     Même moule encore. La date de Thédas s'écrit pareil des deux côtés,
     comme « 290 BG » : une date de timeline ne se traduit jamais. */
  ['Ajouté à la timeline Dragon Age, en 9:41, juste après Last Flight.',
   'Added to the Dragon Age timeline, in 9:41, just after Last Flight.'],

  /* ── le parcours rewatch de Star Wars, écrit le 21 août 2026 ────────
     Le second parcours est né après la prod : ses coupes et sa note
     n'ont pas d'homologue anglais à retrouver. Les sous-items suivent
     le moule des cent autres, « Season N Episodes A-B ». */
  ['Saison 2 Épisodes 1-4', 'Season 2 Episodes 1-4'],
  ['Saison 2 Épisodes 5-8', 'Season 2 Episodes 5-8'],
  /* La note qui prévient de l'alternance Andor / Rebels. Registre parlé,
     comme l'accroche de la page : « if you're here, it's because you
     want to explore… ». */
  ['On va alterner entre une série animée et une série live action pas mal de fois, si le changement de ton très important entre Andor et Rebels vous dérange vraiment regardez Rebels d\'abord, puis Andor. Mais en vrai faites moi confiance ça vaut le coup en terme de narration',
   'We\'re going to alternate between an animated series and a live action one quite a few times; if the very sharp change of tone between Andor and Rebels really bothers you, watch Rebels first, then Andor. But honestly, trust me, it\'s worth it for the storytelling'],
  /* Tales of the Empire 2 : la date est passée à ~3–2 BBY le 21 août
     2026, et la réponse « quand » a suivi. Le moule anglais est celui
     des 60 autres : « The episode takes place… ». */
  ['L\'épisode se déroule probablement entre la saison 2 et la saison 3 de Rebels',
   'The episode probably takes place between season 2 and season 3 of Rebels'],

  /* ── le parcours rewatch de Marvel, écrit le 21 août 2026 ───────────
     La saison 1 de What If…? est coupée en deux pour recevoir Marvel
     Zombies. Même moule que les coupes de Star Wars ci-dessus. Le reste
     du parcours n'est que déplacements : ses entrées se retrouvent
     toutes par leur identifiant, et la réponse qu'elles partagent —
     « Parce qu'elle se situe ici chronologiquement » — est celle de
     cinquante-deux autres entrées Marvel, donc déjà en prod anglaise. */
  ['Saison 1 Épisodes 1-5', 'Season 1 Episodes 1-5'],
  ['Saison 1 Épisodes 6-9', 'Season 1 Episodes 6-9'],
];

/* ═══ LE LEXIQUE ════════════════════════════════════════════════════
   Une table français → anglais construite uniquement par appariement
   structurel. On n'y met jamais deux anglais pour un même français sans
   le signaler : une collision veut dire que l'appariement a décroché. */
/* ── ce qu'un renommage rend caduc ────────────────────────────────
   L'appariement est structurel : la clé `nav.avatar` du proto français
   est mise en face de la clé `nav.avatar` de la prod anglaise. Renommer
   le libellé dans le proto fait donc apprendre au lexique « Avatar
   Legends » → « Avatar », et la page anglaise garde l'ancien nom sans
   qu'aucun contrôle ne s'en aperçoive : la clé est bien traduite, elle
   l'est juste vers ce qu'on venait de retirer. Renommage du 18 août
   2026, « Avatar » devenu « Avatar Legends » pour ne plus se confondre
   avec les films de James Cameron.

   Ces textes ne s'apprennent donc pas : ils sont tenus pour identiques,
   ce qu'ils sont — un nom d'univers ne se traduit pas. `RENOMMES` porte
   l'ancien nom en clé, pour les rares endroits où la valeur anglaise est
   reprise en bloc plutôt que traduite champ par champ. */
const RENOMMES = new Map([['Avatar', 'Avatar Legends']]);
const RENOMMES_NOUVEAUX = new Set(RENOMMES.values());

/* ── ce que la prod anglaise dit encore et qui n'est plus vrai ──────
   `CG.t` n'est pas traduit clé par clé : quand la prod anglaise porte la
   clé, sa valeur est reprise telle quelle — c'est le principe même du
   « retrouver plutôt que traduire ». Corriger la phrase française ne
   suffit donc pas : l'anglais garde l'ancienne, et rien ne le signale,
   la clé étant bien renseignée.

   `legal3` en est le seul cas connu. Il énumérait quatre univers, la
   prod datant d'avant Star Trek et The Walking Dead ; il n'est affiché
   nulle part — le pied de page porte son propre texte — mais une donnée
   fausse qui traîne finit par ressortir. Mis à six le 18 août 2026, avec
   la formule du pied de page.

   Avatar n'entre pas ici : n'ayant aucune prod anglaise, il n'a rien à
   reprendre — sa phrase est écrite, dans `traductions-avatar.mjs`. */
const PERIMES = new Map([
  ['Star Wars, Marvel, DC and Avatar are trademarks of their respective owners;'
   + ' Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed'
   + ' are trademarks of their respective owners; Chronologeek is an independent fan'
   + ' project.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek and The Walking Dead are trademarks'
   + ' of their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed'
   + ' are trademarks of their respective owners; Chronologeek is an independent fan'
   + ' project.'],
]);

/* ═══ LES RETOUCHES DE FRAGMENT ═════════════════════════════════════
   `notes` est un bloc de quatre mille signes repris **en entier** de la
   prod anglaise : accroche, repères de lecture, liste des écartés. Quand
   une seule de ses phrases change dans le proto français, il n'y a rien
   à retrouver pour elle — et rien à signaler non plus, puisque le champ
   est bien traduit. La phrase anglaise d'avant reste alors en ligne.

   D'où cette table : le fragment anglais périmé en clé, sa version à
   jour en valeur. C'est la même idée que `PERIMES`, appliquée à un
   morceau de chaîne plutôt qu'à la chaîne entière.

   Le garde-fou est le compte : un motif qui ne se trouve plus fait
   sortir le script en erreur. Sans lui, une retouche devenue caduque
   passerait inaperçue — et c'est exactement ce qu'elle est censée
   empêcher.

   `ou` désigne l'univers, et il est **obligatoire**. La phrase de
   l'accroche est la même mot pour mot dans les six guides — « This guide
   works for first-time watches as well as rewatches. » — donc une
   retouche sans univers s'applique aux six. C'est ce qui est arrivé le
   21 août 2026 : Star Wars a reçu ses deux parcours, et Marvel et DC ont
   reçu les deux phrases qui les annoncent. Le CSS qui n'en montre qu'une
   (`.pc-first` / `.pc-rewatch`) ne vit que dans la page Star Wars : les
   deux pages anglaises affichaient donc les deux, l'une sous l'autre,
   dont une qui parle d'une bascule qui n'existe pas chez elles. Rien
   dans la console, rien au rapport — la clé *est* traduite. */
const COCHE = '<svg viewBox="0 0 24 24" aria-hidden="true">'
  + '<path d="M20 6 9 17l-5-5"/></svg>';
/* L'accroche d'un guide à deux parcours, mot pour mot. Les six guides
   partagent la phrase d'origine : c'est l'univers qui dit lesquels y
   passent, pas le motif. */
const PARCOURS_DE = '<span class="itag">' + COCHE
  + 'This guide works for first-time watches as well as rewatches.</span>';
const PARCOURS_A = '<span class="itag pc-first">' + COCHE
  + 'This guide works best for first-time watches but you can switch to the'
  + ' rewatch version higher up.</span>'
  + '<span class="itag pc-rewatch">' + COCHE
  + 'This guide works best for rewatches but you can switch to the'
  + ' first-watch version higher up.</span>';
const RETOUCHES = [
  { quoi: 'Star Wars · l’accroche dit maintenant quel parcours on suit',
    ou: 'SW', de: PARCOURS_DE, a: PARCOURS_A },
  { quoi: 'Marvel · l’accroche dit maintenant quel parcours on suit',
    ou: 'MCU', de: PARCOURS_DE, a: PARCOURS_A },
];
const retouchesFaites = new Map();
function retouche(s, ou) {
  let out = s;
  for (const r of RETOUCHES) {
    if (r.ou !== ou) continue;
    if (!out.includes(r.de)) continue;
    out = out.split(r.de).join(r.a);
    retouchesFaites.set(r.quoi, (retouchesFaites.get(r.quoi) || 0) + 1);
  }
  return out;
}

/* Reprend un objet de libellés anglais copié de la prod et y rejoue ce
   que le proto a changé depuis. Sans ça, `nav.avatar` y resterait
   « Avatar » : ce bloc-là n'est pas traduit, il est recopié. */
function rejoueRenommages(o) {
  if (typeof o === 'string') return PERIMES.get(o) ?? RENOMMES.get(o) ?? o;
  if (Array.isArray(o)) return o.map(rejoueRenommages);
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = rejoueRenommages(v);
    return out;
  }
  return o;
}

class Lexique {
  /* `parent` est un lexique de recours, alimenté par toutes les pages.
     Chaque univers cherche d'abord chez lui — un même mot peut se
     traduire autrement d'un univers à l'autre — puis chez le parent, qui
     sait par exemple que « 34 ABY » s'écrit pareil dans les deux langues
     parce que le Dossier l'a établi. */
  constructor(parent) {
    this.parent = parent || null;
    this.table = new Map(); this.collisions = []; this.identiques = new Set();
    for (const [fr, en] of APPOINT) {
      if (fr === en) this.identiques.add(fr); else this.table.set(fr, en);
    }
  }

  ajoute(fr, en) {
    if (typeof fr !== 'string' || typeof en !== 'string') return;
    fr = fr.trim(); en = en.trim();
    if (!fr || !en) return;
    if (RENOMMES_NOUVEAUX.has(fr)) {
      this.identiques.add(fr); if (this.parent) this.parent.identiques.add(fr);
      return;
    }
    /* Un texte que les deux langues écrivent pareil — « Arrowverse »,
       « DCEU », « 22 BBY » — n'est pas une traduction manquante : c'est
       une traduction qui se trouve être l'identité. On le note, sinon il
       ressortirait en faux positif à chaque passage. */
    if (fr === en) { this.identiques.add(fr); if (this.parent) this.parent.identiques.add(fr); return; }
    const vu = this.table.get(fr);
    if (vu && vu !== en) { this.collisions.push([fr, vu, en]); return; }
    this.table.set(fr, en);
    if (this.parent && !this.parent.table.has(fr)) this.parent.table.set(fr, en);
  }

  /* Deux structures parallèles : on descend en parallèle et on apparie
     les feuilles textuelles. Sert pour CG.t, ZONES, faqCats, badges. */
  parallele(fr, en) {
    if (typeof fr === 'string') return this.ajoute(fr, en);
    if (Array.isArray(fr) && Array.isArray(en)) {
      const n = Math.min(fr.length, en.length);
      for (let i = 0; i < n; i++) this.parallele(fr[i], en[i]);
      return;
    }
    if (fr && en && typeof fr === 'object' && typeof en === 'object') {
      for (const k of Object.keys(fr)) if (k in en) this.parallele(fr[k], en[k]);
    }
  }

  cherche(fr) {
    if (typeof fr !== 'string') return undefined;
    const brut = this.table.get(fr);
    if (brut !== undefined) return brut;
    const net = fr.trim();
    const rogne = this.table.get(net);
    if (rogne !== undefined) return rogne;
    /* attesté identique des deux côtés, ou dépourvu de lettre — une
       date, un numéro de tome, un séparateur : rien à traduire */
    if (this.identiques.has(net) || !/\p{L}/u.test(net)) return fr;
    return this.parent ? this.parent.cherche(net) : undefined;
  }
}

/* ═══ L'ÉCHAPPEMENT SUIT LA CONVENTION DU FRANÇAIS ══════════════════
   Chaque page a sa règle, et le proto français la respecte déjà : DC
   rend ses titres avec `esc()` et les stocke donc en texte brut, le
   Dossier les injecte directement et les stocke échappés — d'où les
   `L&#x27;Ère` de ses 533 items, qui sont normaux.

   Les pages de prod, elles, échappent partout. Recopier leur valeur
   telle quelle donnait « Superman &amp; Lois » dans les données DC :
   la page ré-échappait, et l'écran affichait l'entité en toutes
   lettres. On aligne donc l'anglais sur ce que fait le français pour
   le même champ — si sa valeur ne porte pas d'entité, on décode celle
   de l'anglais ; s'il en porte, on n'y touche pas. */
const ENTITES = /&(amp|lt|gt|quot|apos|nbsp|#x27|#39);/i;

function decodeEntites(s) {
  return s.replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');   // en dernier, sinon on décode deux fois
}

function memeEchappement(fr, en) {
  if (ENTITES.test(fr) || !ENTITES.test(en)) return en;
  return decodeEntites(en);
}

/* Une valeur du proto resserrée pour la comparaison. */
const net = s => String(s)
  .replace(/[’ʼ]/g, "'").replace(/‑/g, '-')
  .replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();

/* ═══ REJOUER UNE COUPE, PLUTÔT QUE DEVINER ═════════════════════════
   La refonte a raccourci des titres : « The Clone Wars — 22 BBY » est
   devenu « The Clone Wars », la date étant désormais affichée à part.
   La prod anglaise, elle, porte encore le titre long.

   Quand le proto est exactement le début du titre de la prod française,
   on coupe l'anglais au même endroit — au même séparateur, avec le même
   nombre de segments gardés. Rien n'est traduit ni inventé : on applique
   une opération que le français a déjà faite.

   Si la coupe ne se rejoue pas proprement — séparateur absent en
   anglais, découpe qui ne tombe pas juste — on renvoie `undefined`, et
   la valeur part en relecture plutôt que d'être bricolée. */
function memeCoupe(protoFr, prodFr, prodEn) {
  if (typeof prodEn !== 'string' || !prodEn.trim()) return undefined;
  const p = net(protoFr), d = net(prodFr), e = net(prodEn);
  if (!d.startsWith(p) || d === p) return undefined;

  /* le séparateur qui suit la partie gardée, tel qu'il est écrit */
  const reste = d.slice(p.length);
  const sep = (reste.match(/^\s*(—|–|-|:|·|\()/) || [])[1];
  if (!sep) return undefined;

  const coupeEn = e.split(sep)[0].trim();
  if (!coupeEn || coupeEn === e) return undefined;
  return coupeEn;
}

/* ═══ LA TRADUCTION D'UNE VALEUR ════════════════════════════════════
   Liste blanche : on ne traduit que des champs connus pour porter du
   texte. Tout le reste passe sans être vu. `date` en fait partie parce
   que Marvel y écrit parfois de la prose (« années 1940 »), et `type`
   parce que le Dossier y met « Roman » / « Novel ». */
const TEXTUELS = new Set([
  'title', 'subtitle', 'description', 'notes', 'note', 'bignote', 'desc',
  'date', 'season', 'dim', 'subitems', 'faq', 'quand', 'pourquoi',
  'name', 'hint', 'label', 'crisis', 'txt', 'meta', 'cta',
  /* DC groupe ses ères en zones affichées au-dessus des colonnes, et
     chaque colonne porte une phrase d'aide. Les deux se lisent à
     l'écran, et la prod anglaise les a dans `CG_ZONES`. */
  'zone', 'intro',
]);

/* `type` est ambigu et c'est voulu : sur une timeline il vaut « film »,
   « serie », « anime », « jeu » — des clés qui pilotent les badges et
   les filtres, donc à ne surtout pas traduire. Dans le Dossier il porte
   le libellé affiché, « Roman » côté français et « Novel » côté anglais. */
const TEXTUEL_SI_DOSSIER = new Set(['type']);

/* Avatar est le seul univers sans page anglaise en ligne : ses textes
   sont écrits et non retrouvés, et ils sont assez nombreux pour vivre
   dans leur propre fichier. Ils entrent ici comme les autres, donc
   partent à la relecture comme les autres. */
const TRAD = new Map([...TRADUCTIONS, ...AVATAR_TRADUCTIONS]);

/* Jamais traduits : ce sont des clés, des chemins ou des couleurs. */
const TECHNIQUES = new Set([
  'id', 'tmdb', 'img', 'media', 'level', 'k', 'c', 'kind', 'color', 'glow',
  'banner', 'tmdb_banner', 'href', 'uni', 'nat', 'key', 'vo', 'tags',
  'softcanon', 'open', 'cols', 'groups',
  /* Le parcours rewatch : `ref` désigne l'entrée de découverte dont
     l'entrée hérite, `covers` celles dont elle tient lieu pour la
     progression, `drop` les champs à retirer, `rt` la durée en minutes.
     Quatre clés de structure — les traduire casserait l'appariement. */
  'ref', 'covers', 'drop', 'rt',
  /* `branch` désigne la colonne où l'ère se range — arrowverse, dceu,
     elseworlds, dcu. C'est une clé de disposition, pas un libellé. */
  'branch',
  /* `ids` liste les entrées que déclenche un badge : des identifiants,
     jamais du texte. */
  'ids',
  /* `ol` porte la requête OpenLibrary d'une entrée — `q` cherché,
     `inc` exigé, `exc` écarté. Ce sont des arguments d'API, exactement
     le piège de `getElementById('note')` : traduits, ils continuent de
     s'exécuter et ne ramènent plus rien. Avatar est le seul univers à
     en avoir, ses romans n'étant pas au catalogue TMDB. */
  'ol',
]);

export function creerTraducteur(lex, manques, contexte) {
  const estTextuel = k => TEXTUELS.has(k)
    || (contexte === 'Dossier' && TEXTUEL_SI_DOSSIER.has(k));

  /* `refEn` est l'entrée anglaise homologue quand elle existe : on la
     préfère au lexique, parce qu'un même mot français peut se traduire
     autrement d'une entrée à l'autre.

     `refFr` est son pendant français, et il sert de témoin de fraîcheur.
     Le proto a été extrait de la prod, puis corrigé depuis — un titre
     raccourci, une FAQ réécrite. Quand la valeur du proto ne dit plus ce
     que dit la prod française, la valeur anglaise de la prod ne traduit
     plus rien : elle est restée sur l'ancienne version. La reprendre
     réintroduirait en anglais ce que la correction avait retiré. */
  function valeur(champ, fr, refEn, chemin, refFr) {
    if (typeof fr === 'string') {
      if (!fr.trim()) return fr;
      /* Un libellé renommé ne se cherche pas : la prod ne connaît que
         l'ancien nom, et le nouveau s'écrit pareil dans les deux
         langues. Le laisser passer par le témoin de fraîcheur le
         rendrait « sans traduction » à chaque passage. */
      if (RENOMMES_NOUVEAUX.has(fr.trim())) return fr;

      const perime = typeof refFr === 'string' && net(refFr) !== net(fr);
      if (perime) {
        /* Le cas courant : le proto a coupé la fin du titre — « The Clone
           Wars — 22 BBY » est devenu « The Clone Wars », la date étant
           affichée à part. La coupe se rejoue telle quelle sur l'anglais,
           sans rien inventer. */
        const coupe = memeCoupe(fr, refFr, refEn);
        if (coupe !== undefined) return memeEchappement(fr, coupe);
        const auLexique = lex.cherche(fr);
        if (auLexique !== undefined) return memeEchappement(fr, auLexique);
        const ecriteBis = TRAD.get(fr.trim());
        if (ecriteBis !== undefined) {
          manques.push({ contexte, chemin, champ, fr, en: ecriteBis,
                         statut: 'traduit, à relire', cause: 'corrigé depuis la prod' });
          return ecriteBis;
        }
        manques.push({ contexte, chemin, champ, fr, statut: 'sans traduction',
                       cause: 'corrigé depuis la prod', prodFr: refFr, prodEn: refEn });
        return fr;
      }

      if (refEn !== undefined && typeof refEn === 'string' && refEn.trim()) {
        return retouche(memeEchappement(fr, refEn), contexte);
      }
      const trouve = lex.cherche(fr);
      if (trouve !== undefined) return retouche(memeEchappement(fr, trouve), contexte);
      /* dernier recours : une des dix phrases écrites à la main. On
         l'applique, mais on la consigne quand même — elle doit passer
         par la relecture avant d'être considérée comme acquise. */
      const ecrite = TRAD.get(fr.trim());
      if (ecrite !== undefined) {
        manques.push({ contexte, chemin, champ, fr, en: ecrite, statut: 'traduit, à relire' });
        return ecrite;
      }
      manques.push({ contexte, chemin, champ, fr, statut: 'sans traduction' });
      return fr;
    }
    if (Array.isArray(fr)) {
      return fr.map((v, i) => valeur(champ, v,
        Array.isArray(refEn) ? refEn[i] : undefined, `${chemin}[${i}]`,
        Array.isArray(refFr) ? refFr[i] : undefined));
    }
    if (fr && typeof fr === 'object') return objet(fr, refEn, chemin, refFr);
    return fr;
  }

  function objet(fr, refEn, chemin, refFr) {
    const out = Array.isArray(fr) ? [] : {};
    for (const [k, v] of Object.entries(fr)) {
      const sous = refEn && typeof refEn === 'object' ? refEn[k] : undefined;
      const sousFr = refFr && typeof refFr === 'object' ? refFr[k] : undefined;
      if (TECHNIQUES.has(k)) { out[k] = v; continue; }
      if (estTextuel(k)) { out[k] = valeur(k, v, sous, `${chemin}.${k}`, sousFr); continue; }
      if (v && typeof v === 'object') { out[k] = objet(v, sous, `${chemin}.${k}`, sousFr); continue; }

      /* Un champ ni technique ni déclaré textuel. On le traduit quand
         même, et on le signale.

         La liste blanche seule ratait ce qu'elle ne connaissait pas :
         `faq` n'y avait que `quand` et `pourquoi`, si bien que les 121
         réponses `comment` et les 117 `postcredits` de Marvel sont
         restées en français sans que rien ne le dise. Une liste noire
         se trompe dans l'autre sens — au pire on traduit une clé, et le
         contrôle de structure le voit tout de suite. */
      if (typeof v === 'string' && v.trim()) {
        inconnus.add(k);
        out[k] = valeur(k, v, sous, `${chemin}.${k}`, sousFr);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  return { objet, valeur };
}

/* ═══ SÉRIALISATION ═════════════════════════════════════════════════
   Une entrée par ligne, ères indentées : le fichier reste diffable, et
   une entrée qui bouge se voit sur une seule ligne. */
function js(v) {
  return JSON.stringify(v);
}

function serialiseTimeline(nom, D) {
  const l = [];
  l.push(`const ${nom}={`);
  for (const [k, v] of Object.entries(D)) {
    if (k === 'eras' || k === 'erasRewatch') continue;
    l.push(`  ${k}:${js(v)},`);
  }
  /* Les deux parcours sortent au même format, une entrée par ligne. Le
     rewatch en dernier : c'est l'ordre du proto français, et deux
     fichiers qui ne rangent pas leurs clés pareil ne se comparent plus. */
  blocEres(l, 'eras', D.eras, !D.erasRewatch);
  if (D.erasRewatch) blocEres(l, 'erasRewatch', D.erasRewatch, true);
  l.push('};');
  return l.join('\n');
}

function blocEres(l, nom, eras, dernier) {
  l.push(`  ${nom}:[`);
  eras.forEach((era, i) => {
    /* Toutes les clés de l'ère, pas seulement `title` et `entries` : DC
       range dans `zone`, `branch` et `hint` de quoi bâtir ses colonnes.
       Les perdre ne casse rien au chargement — la page s'affiche, mais à
       plat, sur une seule colonne au lieu de deux. */
    const tete = Object.entries(era)
      .filter(([k]) => k !== 'entries')
      .map(([k, v]) => `${k}:${js(v)}`)
      .join(',');
    l.push(`    {${tete},entries:[`);
    (era.entries || []).forEach((e, j, arr) => {
      l.push(`      ${js(e)}${j < arr.length - 1 ? ',' : ''}`);
    });
    l.push(`    ]}${i < eras.length - 1 ? ',' : ''}`);
  });
  l.push(dernier ? '  ]' : '  ],');
}

/* ═══ LES TROIS TIMELINES ═══════════════════════════════════════════ */
const TIMELINES = [
  { nom: 'SW', proto: '_proto/data.js', sortie: '_proto/data-en.js',
    varData: 'DATA_SW', varWin: 'SW', pageFR: 'fr/starwars.html', pageEN: 'starwars.html' },
  { nom: 'MCU', proto: '_proto/data-mcu.js', sortie: '_proto/data-mcu-en.js',
    varData: 'DATA_MCU', varWin: 'MCU', pageFR: 'fr/marvel.html', pageEN: 'marvel.html' },
  { nom: 'DC', proto: '_proto/data-dc.js', sortie: '_proto/data-dc-en.js',
    varData: 'DATA_DC', varWin: 'DC', pageFR: 'fr/dc.html', pageEN: 'dc.html' },
];

/* Aplatit une page de prod, quelle que soit sa forme, en index par id.
   SW et Marvel rangent par ères ; DC range par branches, et chaque
   branche est un tableau de colonnes ou d'entrées. */
function indexParId(D) {
  const idx = new Map();
  const pose = e => { if (e && typeof e === 'object' && e.id) idx.set(e.id, e); };
  const descend = n => {
    if (Array.isArray(n)) return n.forEach(descend);
    if (!n || typeof n !== 'object') return;
    if (n.id && (n.title || n.faq || n.type)) pose(n);
    for (const k of ['eras', 'entries', 'items', 'zones', 'cols']) if (n[k]) descend(n[k]);
    if (!n.id) for (const v of Object.values(n)) if (v && typeof v === 'object') descend(v);
  };
  descend(D);
  return idx;
}

const manques = [];
const bilan = [];
/* les clés rencontrées hors des deux listes : à ranger d'un côté ou
   de l'autre après coup, mais traduites en attendant */
const inconnus = new Set();
const collisions = [];

/* Le lexique de recours, nourri par tout ce que les quatre paires de
   pages ont appris. Il rattrape ce qu'un univers seul ne peut pas
   savoir — une date in-universe, un titre d'œuvre non traduit. */
const GLOBAL = new Lexique();

/* ── les titres qui s'écrivent pareil des deux côtés ────────────────
   Une entrée ajoutée après la refonte n'a pas d'homologue dans la
   référence : le lexique ne peut rien retrouver, et le script la
   signale « sans traduction ». C'est juste pour de la prose, faux pour
   un titre jamais traduit en français — le comic sort en VO, il porte
   le même nom dans les deux langues.

   Rien n'est écrit ici, on constate. La sortie serait la même sans
   cette liste, puisqu'une chaîne sans traduction est rendue telle
   quelle ; ce qui change, c'est que l'avertissement reste vrai — il ne
   doit désigner que des phrases réellement restées en français.

   Ce n'est PAS l'endroit d'un titre traduit : celui-là va dans
   TRADUCTIONS, où son emploi est consigné et part en relecture. */
const TITRES_IDENTIQUES = [
  // Dossier Star Wars · 34 ABY, comic VO ajouté le 13 août 2026
  'The Fall of Kylo Ren 1-5',
  // DC · la série du DCU ajoutée le 18 août 2026, sans titre français
  'Lanterns',
  /* Avatar Legends · le comic VO ajouté le 25 août 2026, et sa date.
     « BG » est une unité inventée : elle ne se traduit pas. */
  'Masters of the Elements Vol.1 : Off Duty',
  '290 BG',
  /* Dragon Age · le jeu de navigateur ajouté le 26 août 2026. Il n'a
     jamais eu de version française, et « 9:41 » est une date. */
  'Dragon Age: The Last Court',
  '9:41',
  /* Star Wars · deux dates du parcours rewatch, écrites le 21 août 2026.
     Une date ne se traduit pas, mais « BBY » est une lettre : sans
     cette ligne le contrôle les compte comme restées en français. */
  '~3–2 BBY',
  '3 BBY',
];
for (const t of TITRES_IDENTIQUES) GLOBAL.ajoute(t, t);

for (const T of TIMELINES) {
  const P = depuisProto(T.proto);
  const FR = depuisPage(T.pageFR);
  const EN = depuisPage(T.pageEN);
  const dP = P[T.varData];
  const dF = FR.DATA || FR[T.varData];
  const dE = EN.DATA || EN[T.varData];

  const lex = new Lexique(GLOBAL);
  lex.parallele(FR.CG, EN.CG);                      // les 109 libellés
  lex.parallele(dF, dE);                            // ères, intro, entrées
  /* DC ne range ni son intro ni ses branches dans DATA : l'intro est
     dans NOTES, les huit titres de branches et l'encart Crisis dans
     CG_ZONES. Les deux pages les déclarent au même endroit, donc la
     lecture en parallèle les apparie sans ambiguïté. */
  for (const v of ['NOTES', 'CG_ZONES', 'ZONES', 'CG_DATA']) {
    if (FR[v] !== undefined && EN[v] !== undefined) lex.parallele(FR[v], EN[v]);
  }

  const idxEN = indexParId(dE);
  /* la prod française sert de témoin : elle dit ce que le proto disait
     avant d'être corrigé, et donc si la valeur anglaise est encore bonne */
  const idxFR = indexParId(dF);
  const tr = creerTraducteur(lex, manques, T.nom);

  /* la structure vient du proto ; seuls les textes changent */
  /* L'ère passe entière par le traducteur : son titre, mais aussi sa
     `zone` et son `hint`, que DC affiche au-dessus et sous chaque
     colonne. Ne traduire que le titre les laissait en français. */
  const sortie = { ...dP, eras: dP.eras.map(era => {
    const { entries, ...enTete } = era;
    return {
      ...tr.objet(enTete, undefined, 'eras'),
      entries: (entries || []).map(e => tr.objet(e, idxEN.get(e.id), `#${e.id}`, idxFR.get(e.id))),
    };
  }) };
  /* ── le second parcours ────────────────────────────────────────────
     `erasRewatch` a la forme d'`eras`, mais ses entrées sont pour la
     plupart des renvois (`ref`) sans un mot à elles : seules les coupes
     portent des sous-items, une date ou une note. Sans ce passage, le
     bloc sortait recopié tel quel — sous-items français sur la page
     anglaise, et pas une ligne au rapport, la traduction ne regardant
     que `eras`. Une entrée qui renvoie à une entrée de découverte
     hérite de son homologue anglais, comme elle hérite de son titre. */
  if (dP.erasRewatch) sortie.erasRewatch = dP.erasRewatch.map(era => {
    const { entries, ...enTete } = era;
    return {
      ...tr.objet(enTete, undefined, 'erasRewatch'),
      entries: (entries || []).map(e => {
        const src = e.ref || (e.covers || [])[0];
        return tr.objet(e, idxEN.get(src), `#${e.id || e.ref}`, idxFR.get(src));
      }),
    };
  });

  /* l'en-tête de la timeline : titre, sous-titre, intro, encarts. La
     racine passe par la même liste blanche que les entrées, sinon on
     signalerait une couleur ou un chemin d'image comme non traduits. */
  for (const k of Object.keys(dP)) {
    if (k === 'eras' || TECHNIQUES.has(k)) continue;
    if (!TEXTUELS.has(k)) continue;
    sortie[k] = tr.valeur(k, dP[k], dE ? dE[k] : undefined, `${T.nom}.${k}`);
  }

  const nEntrees = sortie.eras.reduce((n, e) => n + (e.entries || []).length, 0);
  const sansSource = sortie.eras.flatMap(e => e.entries || []).filter(e => !idxEN.has(e.id)).map(e => e.id);
  bilan.push({ nom: T.nom, entrees: nEntrees, sansSource, collisions: lex.collisions.length,
               lexique: lex.table.size });
  for (const c of lex.collisions) collisions.push({ contexte: T.nom, fr: c[0], en1: c[1], en2: c[2] });

  if (!CHECK) {
    const entete = `/* Version anglaise de ${path.basename(T.proto)} — produite par traduire.mjs.
   Chaque texte vient mot pour mot de ${T.pageEN} ; la structure vient du
   proto français. Ne pas editer a la main : relancer le script. */\n`;
    /* `window.CG` du proto traduit, et non celui de la prod recopié :
       la refonte y a ajouté des clés que la page en ligne ne connaît
       pas. `groups` porte les quatre branches DC — Elseworlds,
       Arrowverse, DCEU, DCU — avec leurs couleurs et la liste des
       entrées de chacune. En prenant le CG de la prod tel quel, la
       clé disparaissait et le groupe « Branches » du panneau de
       filtres s'affichait vide : un intitulé, aucun bouton. */
    const cgTraduit = rejoueRenommages(tr.objet(P.CG, EN.CG, 'CG'));
    const cg = `window.CG=${js(cgTraduit)};\n`;
    const rt = EN.RT ? `const RT=${js(EN.RT)};\n` : '';
    const queue = `window.${T.varWin}=${T.varData};\n${EN.RT ? 'window.RT=RT;\n' : ''}`;
    fs.writeFileSync(path.join(RACINE, T.sortie),
      entete + cg + serialiseTimeline(T.varData, sortie) + '\n' + rt + queue, 'utf8');
  }
}

/* ═══ LE DOSSIER ════════════════════════════════════════════════════
   Même principe, autre forme : `window.CGD` porte les 596 items groupés
   par ère, `window.CGDT` les libellés. Les items ont un id, donc tout
   passe par l'appariement exact. */
{
  const P = depuisProto('_proto/data-dossier-sw.js');
  const FR = depuisPage('fr/dossiers/star-wars.html');
  const EN = depuisPage('deep-dives/star-wars.html');

  const lex = new Lexique(GLOBAL);
  lex.parallele(FR.CG, EN.CG);
  lex.parallele(FR.CG_DATA, EN.CG_DATA);

  /* ── apparier par identifiant, et par rang seulement à défaut ─────
     Les 63 repères écran n'ont pas d'`id` : indexés par id, ils se
     retrouvaient tous sous la clé `undefined`, et le dernier écrasait
     les 62 autres. Chacun héritait donc du titre du dernier — les 63
     repères annonçaient « Episode IX: The Rise of Skywalker ».

     Le rang, qui a corrigé ça, avait son propre défaut : il suppose que
     les trois versions listent exactement les mêmes items. Une entrée
     AJOUTÉE au proto décalait alors tout ce qui la suit dans son ère, et
     chaque item recevait le texte anglais de son voisin de gauche — 533
     entrées justes le jour d'avant, fausses le lendemain, sans une ligne
     dans la console.

     Les 533 identifiants sont uniques dans les trois versions : ils
     apparient exactement, et un ajout n'a pas d'homologue, ce qui est la
     bonne réponse — la nouvelle entrée part en relecture. Les repères
     écran, eux, s'apparient par leur rang PARMI LES ÉCRANS, que l'ajout
     d'une entrée ne déplace pas. */
  const tr = creerTraducteur(lex, manques, 'Dossier');
  const eresEN = EN.CG_DATA.eras;
  const eresFR = FR.CG_DATA.eras;

  /* index par id + file des écrans dans l'ordre du document */
  function indexDossier(eras) {
    const parId = new Map();
    const ecrans = [];
    for (const era of eras) {
      for (const it of era.items) {
        if (it.id) parId.set(it.id, it);
        else ecrans.push(it);
      }
    }
    return { parId, ecrans };
  }
  const refEN = indexDossier(eresEN);
  const refFR = indexDossier(eresFR);

  let nEcran = 0;
  const inedits = [];
  const sortie = { ...P.CGD, eras: P.CGD.eras.map((era, i) => ({
    ...era,
    title: eresEN[i] ? eresEN[i].title : era.title,
    items: era.items.map((it, j) => {
      let en, fr;
      if (it.id) {
        en = refEN.parId.get(it.id);
        fr = refFR.parId.get(it.id);
        if (!en) inedits.push(it.id);
      } else {
        en = refEN.ecrans[nEcran];
        fr = refFR.ecrans[nEcran];
        nEcran++;
      }
      return tr.objet(it, en, `#${it.id || `${i}.${j}`}`, fr);
    }),
  })) };

  if (nEcran !== refEN.ecrans.length) {
    console.log(`\n  ⚠ Dossier : ${nEcran} repère(s) écran dans le proto, `
      + `${refEN.ecrans.length} dans la référence — l'appariement par rang a glissé`);
  }
  if (inedits.length) {
    console.log(`\n  · Dossier : ${inedits.length} entrée(s) sans homologue anglais `
      + `(ajoutées depuis la référence) — ${inedits.slice(0, 3).join(', ')}`);
  }

  /* `intro` est de la prose, pas une liste d'entrées : elle passe par le
     traducteur comme le reste. La page de prod anglaise a la sienne, au
     même endroit, et le lexique l'a apprise en lisant les deux. */
  for (const k of Object.keys(P.CGD)) {
    if (k === 'eras') continue;
    sortie[k] = tr.valeur(k, P.CGD[k], EN.CG_DATA ? EN.CG_DATA[k] : undefined, `Dossier.${k}`);
  }

  const nItems = sortie.eras.reduce((n, e) => n + e.items.length, 0);
  /* appariés par identifiant : il manque une source quand l'entrée est
     nouvelle depuis la référence, donc jamais écrite en anglais */
  const sansSource = inedits.slice();
  bilan.push({ nom: 'Dossier', entrees: nItems, sansSource, collisions: lex.collisions.length,
               lexique: lex.table.size });
  for (const c of lex.collisions) collisions.push({ contexte: 'Dossier', fr: c[0], en1: c[1], en2: c[2] });

  if (!CHECK) {
    const l = ['/* Version anglaise de data-dossier-sw.js — produite par traduire.mjs.',
      '   Chaque texte vient mot pour mot de deep-dives/star-wars.html ; la structure',
      '   vient du proto francais. Ne pas editer a la main : relancer le script. */',
      'window.CGD={"eras":['];
    sortie.eras.forEach((era, i) => {
      l.push(`{"title":${js(era.title)},"items":[`);
      era.items.forEach((it, j, arr) => l.push(`  ${js(it)}${j < arr.length - 1 ? ',' : ''}`));
      l.push(`]}${i < sortie.eras.length - 1 ? ',' : ''}`);
    });
    /* Les autres clés de CGD — `intro`, la prose d'accroche que la page
       injecte dans `#intro`. Les oublier ne casse rien au chargement :
       la page écrit simplement `undefined` en haut, en gros. */
    l.push(']');
    for (const [k, v] of Object.entries(sortie)) {
      if (k !== 'eras') l.push(`,${js(k)}:${js(v)}`);
    }
    l.push('};');
    /* CGDT reprend les libellés anglais de la page, plus ce que le proto
       ajoute et que la prod ne connaît pas (kindLabels de la refonte). */
    const cgdt = rejoueRenommages({ ...P.CGDT, ...EN.CG, t: { ...P.CGDT.t, ...EN.CG.t } });
    l.push(`window.CGDT=${js(cgdt)};`);
    fs.writeFileSync(path.join(RACINE, '_proto/data-dossier-sw-en.js'), l.join('\n') + '\n', 'utf8');
  }
}

/* ═══ AVATAR ════════════════════════════════════════════════════════
   Le seul univers sans source anglaise. `avatar.html` à la racine est
   encore la page française non traduite, et `fr/avatar.html` n'existe
   pas : il n'y a ni page à apparier ni entrée homologue à lire. Rien
   ici ne peut être retrouvé, tout doit être écrit — voir l'en-tête de
   `traductions-avatar.mjs`, qui porte les phrases et leur pourquoi.

   Deux choses le rendent malgré tout peu coûteux. L'interface est la
   même que celle des trois autres timelines : les 109 libellés de
   `CG.t`, les catégories de FAQ, les intitulés de badges sont déjà au
   lexique GLOBAL, appris en lisant SW, Marvel et DC en parallèle. Et
   la moitié des titres sont américains d'origine — ils s'écrivent
   pareil des deux côtés, le lexique les reconnaît identiques.

   Reste ce que Niko a écrit lui-même : l'intro, les titres d'ères, les
   synopsis. C'est ce que la table couvre, ligne à ligne. */
{
  const P = depuisProto('_proto/data-avatar.js');
  const D = P.AVATAR;

  const lex = new Lexique(GLOBAL);
  /* Seules les identiques passent par le lexique. Les phrases écrites
     sont dans `TRAD`, où le traducteur ne va qu'en dernier recours et
     en consignant chaque emploi : c'est ce qui les fait apparaître au
     rapport de relecture. Les poser au lexique les rendrait muettes. */
  for (const s of AVATAR_IDENTIQUES) lex.ajoute(s, s);

  /* Chaque emploi d'une phrase écrite est consigné, comme ailleurs :
     `manques` est ce qui alimente A-RELIRE-EN.md. La différence est
     qu'ici c'est la règle et non l'exception, d'où le `cause` qui le
     dit au rapport plutôt que de laisser croire à une anomalie. */
  const manquesAvant = manques.length;
  const tr = creerTraducteur(lex, manques, 'Avatar');

  const sortie = { ...D, eras: D.eras.map(era => {
    const { entries, ...enTete } = era;
    return {
      ...tr.objet(enTete, undefined, 'eras'),
      entries: (entries || []).map(e => tr.objet(e, undefined, `#${e.id}`)),
    };
  }) };
  for (const k of Object.keys(D)) {
    if (k === 'eras' || TECHNIQUES.has(k)) continue;
    if (!TEXTUELS.has(k)) continue;
    sortie[k] = tr.valeur(k, D[k], undefined, `Avatar.${k}`);
  }
  for (const m of manques.slice(manquesAvant)) {
    if (m.contexte === 'Avatar' && !m.cause) m.cause = 'aucune source anglaise';
  }

  const nEntrees = sortie.eras.reduce((n, e) => n + (e.entries || []).length, 0);
  bilan.push({ nom: 'Avatar', entrees: nEntrees, sansSource: [],
               collisions: lex.collisions.length, lexique: lex.table.size });
  for (const c of lex.collisions) collisions.push({ contexte: 'Avatar', fr: c[0], en1: c[1], en2: c[2] });

  /* ── le garde-fou du champ resté français ────────────────────────
     Ailleurs il se déduit de la comparaison avec la prod. Ici il n'y a
     pas de prod : on regarde donc le français lui-même. Une chaîne
     rendue à l'identique alors qu'elle porte une lettre accentuée ou
     un mot de liaison français n'a pas été traduite, elle est passée
     au travers. */
  const FRANCAIS = /[àâçéèêëîïôùûœ]|\b(le|la|les|des|dans|avec|pour|sur|entre|son|ses|une|aux)\b/i;
  const suspects = [];
  const compare = (fr, en, ou) => {
    if (typeof fr === 'string') {
      if (fr === en && fr.trim() && FRANCAIS.test(fr)) suspects.push(`${ou} · ${fr}`);
      return;
    }
    if (fr && typeof fr === 'object' && en && typeof en === 'object') {
      for (const k of Object.keys(fr)) if (!TECHNIQUES.has(k)) compare(fr[k], en[k], `${ou}.${k}`);
    }
  };
  compare(D, sortie, 'Avatar');
  if (suspects.length) {
    console.log(`\n  ⚠ Avatar : ${suspects.length} chaîne(s) rendue(s) telles quelles alors qu'elles ont l'air françaises`);
    for (const s of suspects.slice(0, 8)) console.log('      ' + s);
  }

  if (!CHECK) {
    const entete = `/* Version anglaise de data-avatar.js — produite par traduire.mjs.
   Avatar est le seul univers sans page anglaise en ligne : ses textes sont
   écrits, pas repris, et vivent dans traductions-avatar.mjs. La structure
   vient du proto français. Ne pas editer a la main : relancer le script. */\n`;
    const cgTraduit = rejoueRenommages(tr.objet(P.CG, undefined, 'CG'));
    fs.writeFileSync(path.join(RACINE, '_proto/data-avatar-en.js'),
      entete + `window.CG=${js(cgTraduit)};\n`
      + serialiseTimeline('AVATAR', sortie) + '\nwindow.AVATAR=AVATAR;\n', 'utf8');
  }
}

/* ═══ LE JOURNAL ════════════════════════════════════════════════════
   `data-news.js` n'a pas d'identifiants : ses huit entrées sont de la
   prose rangée à la main. L'appariement se fait donc par position dans
   la liste `<ol class="log">` des deux pages — même nombre de mois,
   même nombre d'items par mois, même ordre, ce que le script vérifie
   avant de s'en servir.

   Le journal découpe « <strong>Titre</strong> — la suite » en deux
   champs, donc la suite perd son tiret et prend une majuscule. On
   applique la même règle à l'anglais, et on la valide en la rejouant
   sur le français : si elle ne reproduit pas les `txt` déjà en place au
   caractère près, c'est qu'elle est fausse et le script s'arrête. */
{
  const entites = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  function journal(rel) {
    const src = lirePage(rel);
    const ol = src.match(/<ol class="log">([\s\S]*?)<\/ol>/);
    if (!ol) throw new Error(`pas de <ol class="log"> dans ${rel}`);
    return [...ol[1].matchAll(/<li class="log-m"><h2>(.*?)<\/h2><ul>([\s\S]*?)<\/ul><\/li>/g)]
      .map(m => ({
        mois: entites(m[1].trim()),
        items: [...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => {
          const brut = x[1].replace(/\s+/g, ' ').trim();
          const fort = brut.match(/<strong>([\s\S]*?)<\/strong>/);
          const reste = brut.replace(/<strong>[\s\S]*?<\/strong>/, '');
          /* le tiret de liaison saute, la suite prend la majuscule */
          const txt = entites(reste.replace(/<[^>]+>/g, '').replace(/^\s*[—–-]\s*/, '').trim());
          return {
            title: fort ? entites(fort[1].replace(/<[^>]+>/g, '').trim()) : '',
            txt: txt ? txt[0].toUpperCase() + txt.slice(1) : '',
          };
        }),
      }));
  }

  const JF = journal('fr/nouveautes.html');
  const JE = journal('whats-new.html');

  if (JF.length !== JE.length) throw new Error('journal : nombre de mois différent');
  JF.forEach((m, i) => {
    if (m.items.length !== JE[i].items.length) {
      throw new Error(`journal : ${m.mois} a ${m.items.length} entrées contre ${JE[i].items.length} en anglais`);
    }
  });

  const P = depuisProto('_proto/data-news.js');
  const N = P.CG_NEWS;

  /* Validation de la règle de découpe : elle doit retrouver le français
     déjà écrit. Sinon on ne peut pas lui faire confiance sur l'anglais. */
  const platFR = JF.flatMap(m => m.items);
  const platEN = JE.flatMap(m => m.items);
  const rejoue = [];
  const lexNews = new Lexique(GLOBAL);
  JF.forEach((m, i) => {
    lexNews.ajoute(m.mois, JE[i].mois);
    m.items.forEach((it, j) => {
      lexNews.ajoute(it.title, JE[i].items[j].title);
      lexNews.ajoute(it.txt, JE[i].items[j].txt);
    });
  });

  const trouve = (v) => {
    const t = lexNews.cherche(v);
    return t;
  };

  let ecarts = 0;
  const nSortie = { ...N, months: N.months.map(mois => {
    /* Le libellé du mois vient du lexique — « Juillet 2026 » est en face
       de « July 2026 » dans les deux pages de prod. Un mois né depuis,
       lui, n'y est pas : il se traduit à la main comme les phrases des
       cartes, et part en relecture avec elles. « Août 2026 » est le
       premier — c'est le mois où Star Trek est arrivé. */
    let label = trouve(mois.label);
    if (label === undefined) {
      const ecrite = TRAD.get(mois.label.trim());
      manques.push({ contexte: 'Journal', chemin: `${mois.key || 'avant'}.label`, champ: 'label', fr: mois.label,
                     ...(ecrite !== undefined ? { en: ecrite, statut: 'traduit, à relire' }
                                              : { statut: 'sans traduction' }) });
      if (ecrite !== undefined) label = ecrite;
    }
    return {
      ...mois,
      label: label !== undefined ? label : mois.label,
      items: mois.items.map(it => {
        const out = { ...it };
        for (const k of ['title', 'txt', 'meta', 'cta']) {
          if (typeof it[k] !== 'string' || !it[k].trim()) continue;
          const t = trouve(it[k]);
          if (t !== undefined) { out[k] = t; continue; }
          const ecrite = TRAD.get(it[k].trim());
          out[k] = ecrite !== undefined ? ecrite : it[k];
          manques.push({ contexte: 'Journal', chemin: `${it.title} · ${k}`, champ: k, fr: it[k],
                         ...(ecrite !== undefined ? { en: ecrite, statut: 'traduit, à relire' }
                                                  : { statut: 'sans traduction' }) });
        }
        /* les liens pointent vers les pages anglaises */
        if (typeof it.href === 'string') out.href = it.href.replace(/^e-/, 'en-');
        return out;
      }),
    };
  }) };

  /* contrôle : le français rejoué doit exister tel quel dans le proto */
  const titresProto = new Set(N.months.flatMap(m => m.items.map(i => i.title)));
  for (const it of platFR) if (it.title && !titresProto.has(it.title)) rejoue.push(it.title);

  bilan.push({ nom: 'Journal', entrees: N.months.reduce((a, m) => a + m.items.length, 0),
               sansSource: rejoue, collisions: lexNews.collisions.length, lexique: lexNews.table.size });

  if (!CHECK) {
    const l = ['/* Version anglaise de data-news.js — produite par traduire.mjs.',
      '   Chaque titre et chaque phrase vient mot pour mot de whats-new.html,',
      '   apparie par rang dans <ol class="log">. Le journal decoupe',
      '   « <strong>Titre</strong> — la suite » en deux champs : la suite perd',
      '   son tiret et prend la majuscule, des deux cotes de la meme facon.',
      '   Ne pas editer a la main : relancer le script. */',
      'window.CG_NEWS = {', '  months: ['];
    nSortie.months.forEach((m, i) => {
      l.push(`    { key:${js(m.key)}, label:${js(m.label)}, items:[`);
      m.items.forEach((it, j, arr) => l.push(`      ${js(it)}${j < arr.length - 1 ? ',' : ''}`));
      l.push(`    ]}${i < nSortie.months.length - 1 ? ',' : ''}`);
    });
    l.push('  ]', '};');
    fs.writeFileSync(path.join(RACINE, '_proto/data-news-en.js'), l.join('\n') + '\n', 'utf8');
  }
}

/* ═══ CONTRÔLE DE STRUCTURE ═════════════════════════════════════════
   Le fichier anglais doit avoir exactement la forme du français : mêmes
   objets, mêmes clés, mêmes identifiants, dans le même ordre. Seuls les
   textes changent.

   Ce contrôle est né d'une clé perdue. La sérialisation du Dossier
   n'écrivait que `eras` et laissait tomber `intro` ; rien ne plantait,
   la page affichait simplement « undefined » à la place de son accroche.
   Un fichier qui se charge n'est pas un fichier juste. */
if (!CHECK) {
  /* `type` vaut « film » ou « serie » sur une timeline — une clé — mais
     « Roman » / « Novel » dans le Dossier, où il est affiché. Même
     distinction que dans TEXTUEL_SI_DOSSIER. */
  const CLE_TECHNIQUE = new Set(['id', 'tmdb', 'img', 'media', 'level', 'type',
    'tags', 'softcanon', 'k', 'c', 'kind', 'vo', 'color', 'glow', 'href']);
  const anomalies = [];

  const compare = (nom, a, b, chemin) => {
    const technique = k => CLE_TECHNIQUE.has(k) && !(nom === 'Dossier' && k === 'type');
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return;
    const ka = Object.keys(a).sort().join(','), kb = Object.keys(b).sort().join(',');
    if (ka !== kb) { anomalies.push(`${nom} ${chemin} : clés ${ka} vs ${kb}`); return; }
    for (const k of Object.keys(a)) {
      if (technique(k)) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
          anomalies.push(`${nom} ${chemin}.${k} : ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`);
        }
      } else if (a[k] && typeof a[k] === 'object') {
        compare(nom, a[k], b[k], `${chemin}.${k}`);
      }
    }
  };

  for (const T of TIMELINES) {
    const F = depuisProto(T.proto)[T.varData];
    const E = depuisProto(T.sortie)[T.varData];
    if (!E) { anomalies.push(`${T.nom} : ${T.varData} absent du fichier anglais`); continue; }
    compare(T.nom, F, E, T.varData);
    /* `window.CG` aussi : c'est là que vivent `groups`, `badges` et les
       109 libellés. Une clé qui s'y perd ne casse rien, elle vide
       simplement un morceau de l'interface. */
    compare(T.nom, depuisProto(T.proto).CG, depuisProto(T.sortie).CG, 'CG');
  }
  const DF = depuisProto('_proto/data-dossier-sw.js');
  const DE = depuisProto('_proto/data-dossier-sw-en.js');
  if (!DE.CGD) anomalies.push('Dossier : window.CGD absent');
  else compare('Dossier', DF.CGD, DE.CGD, 'CGD');
  if (!DE.CGDT) anomalies.push('Dossier : window.CGDT absent');

  /* une valeur `undefined` traversée jusqu'au HTML se voit à l'écran */
  for (const f of ['_proto/data-en.js', '_proto/data-mcu-en.js', '_proto/data-dc-en.js',
                   '_proto/data-dossier-sw-en.js', '_proto/data-news-en.js']) {
    if (/:\s*undefined/.test(lire(f))) anomalies.push(`${f} contient une valeur undefined`);
  }

  /* ── le champ resté français ──────────────────────────────────────
     Un champ dont *toutes* les valeurs sont identiques d'une langue à
     l'autre n'a pas été traduit — sauf s'il ne contient que des noms
     propres. C'est ce test qui manquait : `faq.comment` et
     `faq.postcredits` étaient français dans les 121 entrées Marvel, et
     rien ne le disait, parce qu'ils n'étaient dans aucune des deux
     listes. On regarde donc les valeurs, pas les intentions. */
  const ACCENTS = /[àâäéèêëîïôöùûüçœ]/i;
  const suspects = [];
  const recense = (nom, F, E, prefixe) => {
    const stat = new Map();
    const voir = (a, b, chemin) => {
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return;
      for (const k of Object.keys(a)) {
        if (CLE_TECHNIQUE.has(k) && !(nom === 'Dossier' && k === 'type')) continue;
        const va = a[k], vb = b[k];
        if (typeof va === 'string' && typeof vb === 'string') {
          if (!va.trim() || !ACCENTS.test(va)) continue;   // rien à traduire, ou pas de français dedans
          const s = stat.get(k) || { total: 0, idem: 0, ex: null };
          s.total++;
          if (va === vb) { s.idem++; if (!s.ex) s.ex = va; }
          stat.set(k, s);
        } else if (va && typeof va === 'object') voir(va, vb, `${chemin}.${k}`);
      }
    };
    voir(F, E, prefixe);
    for (const [k, s] of stat) {
      if (s.total >= 3 && s.idem === s.total) {
        suspects.push(`${nom} · ${k} : ${s.idem}/${s.total} valeurs identiques au français — ex. « ${s.ex.slice(0, 60)} »`);
      }
    }
  };
  for (const T of TIMELINES) {
    recense(T.nom, depuisProto(T.proto)[T.varData], depuisProto(T.sortie)[T.varData], T.varData);
  }
  recense('Dossier', DF.CGD, DE.CGD, 'CGD');

  if (suspects.length) {
    console.log(`\n  ⚠ ${suspects.length} champ(s) probablement non traduit(s)`);
    for (const s of suspects) console.log('      ' + s);
  }

  /* ── l'entité de trop ─────────────────────────────────────────────
     Une valeur anglaise qui porte `&amp;` là où la française écrit un
     « & » sera ré-échappée par la page : l'écran affiche l'entité en
     toutes lettres. C'est ce qui donnait « Superman &amp; Lois ». */
  const entites = [];
  const compareEchappement = (nom, F, E, chemin) => {
    if (!F || !E || typeof F !== 'object' || typeof E !== 'object') return;
    for (const k of Object.keys(F)) {
      const a = F[k], b = E[k];
      if (typeof a === 'string' && typeof b === 'string') {
        if (!ENTITES.test(a) && ENTITES.test(b)) {
          entites.push(`${nom} ${chemin}.${k} : « ${b.slice(0, 60)} »`);
        }
      } else if (a && typeof a === 'object') compareEchappement(nom, a, b, `${chemin}.${k}`);
    }
  };
  for (const T of TIMELINES) {
    compareEchappement(T.nom, depuisProto(T.proto)[T.varData], depuisProto(T.sortie)[T.varData], T.varData);
  }
  compareEchappement('Dossier', DF.CGD, DE.CGD, 'CGD');

  if (entites.length) {
    console.log(`\n  ⚠ ${entites.length} valeur(s) anglaise(s) échappée(s) là où le français ne l'est pas`);
    for (const e of entites.slice(0, 10)) console.log('      ' + e);
  }

  /* ── la valeur qui se répète ──────────────────────────────────────
     Si le français a 63 titres distincts et l'anglais un seul, ce n'est
     pas une traduction, c'est un appariement qui a raté. Les 63 repères
     écran du Dossier n'ont pas d'`id` : indexés par id, ils tombaient
     tous sur la même clé et héritaient tous du dernier. On compare donc
     la variété des deux côtés, ce qu'aucun contrôle de clés ne voit. */
  const repetitions = [];
  const variete = (nom, listeF, listeE, champ) => {
    const vF = listeF.map(x => x[champ]).filter(v => typeof v === 'string' && v.trim());
    const vE = listeE.map(x => x[champ]).filter(v => typeof v === 'string' && v.trim());
    if (vF.length < 5 || vF.length !== vE.length) return;
    const dF = new Set(vF).size, dE = new Set(vE).size;
    if (dF >= 5 && dE < dF / 2) {
      repetitions.push(`${nom} · ${champ} : ${dF} valeurs distinctes en français, ${dE} en anglais`);
    }
  };
  for (const T of TIMELINES) {
    const eF = depuisProto(T.proto)[T.varData].eras.flatMap(e => e.entries || []);
    const eE = depuisProto(T.sortie)[T.varData].eras.flatMap(e => e.entries || []);
    for (const c of ['title', 'date', 'note']) variete(T.nom, eF, eE, c);
  }
  for (const k of ['it', 'screen']) {
    const iF = DF.CGD.eras.flatMap(e => e.items).filter(x => x.kind === k);
    const iE = DE.CGD.eras.flatMap(e => e.items).filter(x => x.kind === k);
    for (const c of ['title', 'date']) variete(`Dossier ${k}`, iF, iE, c);
  }

  if (repetitions.length) {
    console.log(`\n  ⚠ ${repetitions.length} champ(s) dont l'anglais se répète anormalement`);
    for (const r of repetitions) console.log('      ' + r);
  }

  if (anomalies.length) {
    console.log(`\n  ⚠ ${anomalies.length} ANOMALIE(S) DE STRUCTURE`);
    for (const a of anomalies.slice(0, 20)) console.log('      ' + a);
  } else {
    console.log('\n  structure : identique au français, clé pour clé');
  }
}

/* ═══ BILAN ═════════════════════════════════════════════════════════ */
console.log(CHECK ? 'CONTRÔLE — rien n\'est écrit\n' : 'ÉCRITURE\n');
for (const b of bilan) {
  console.log(`  ${b.nom.padEnd(9)} ${String(b.entrees).padStart(4)} entrées   `
    + `lexique ${String(b.lexique).padStart(4)}   `
    + (b.sansSource.length ? `SANS SOURCE : ${b.sansSource.join(', ')}` : 'toutes appariées')
    + (b.collisions ? `   ⚠ ${b.collisions} collisions` : ''));
}

const aRelire = manques.filter(m => m.statut === 'traduit, à relire');
const sansRien = manques.filter(m => m.statut !== 'traduit, à relire');
const distinctes = new Set(aRelire.map(m => m.fr)).size;
console.log(`\n  ${aRelire.length} emploi(s) de ${distinctes} phrase(s) écrite(s) à la main, en attente de relecture`);
if (sansRien.length) {
  console.log(`  ⚠ ${sansRien.length} chaîne(s) SANS AUCUNE traduction — restées en français`);
}

/* Le détail, pour juger sur pièces plutôt que sur un compte. Une
   collision veut dire qu'un même français est traduit de deux façons
   dans la prod : sans gravité quand l'entrée a un id — on lit alors son
   homologue directement — mais à vérifier pour le reste. */
if (CHECK || process.argv.includes('--detail')) {
  if (manques.length) {
    console.log('\n  ── sans source anglaise ──');
    const vues = new Set();
    for (const m of manques) {
      if (vues.has(m.fr)) continue;
      vues.add(m.fr);
      const n = manques.filter(x => x.fr === m.fr).length;
      console.log(`  [${m.contexte}] ${m.chemin}${n > 1 ? `  (${n} emplois)` : ''}`);
      console.log(`      FR  ${m.fr.length > 130 ? m.fr.slice(0, 130) + '…' : m.fr}`);
      console.log(`      EN  ${m.en ? (m.en.length > 130 ? m.en.slice(0, 130) + '…' : m.en) : '— rien, resté en français'}`);
    }
  }
  if (collisions.length) {
    console.log('\n  ── deux anglais pour un même français ──');
    for (const c of collisions) {
      console.log(`  [${c.contexte}] ${c.fr.slice(0, 70)}`);
      console.log(`      retenu : ${c.en1.slice(0, 70)}`);
      console.log(`      écarté : ${c.en2.slice(0, 70)}`);
    }
  }
}

/* Une retouche qui ne trouve plus son motif est une retouche caduque —
   ou un bloc anglais qui a changé de forme. Dans les deux cas la phrase
   à jour n'est pas passée, et rien d'autre ne le dirait. */
const orphelines = RETOUCHES.filter(r => !retouchesFaites.has(r.quoi));
if (orphelines.length) {
  console.error('\n  ✖ retouche(s) sans motif trouvé :');
  for (const r of orphelines) console.error(`     ${r.quoi}`);
  process.exit(1);
}
console.log(`  ${RETOUCHES.length} retouche(s) de fragment, toutes appliquées`);

if (!CHECK) {
  fs.writeFileSync(path.join(RACINE, '_proto/a-traduire.json'),
    JSON.stringify(manques, null, 2), 'utf8');
  console.log('  → _proto/a-traduire.json');
}
