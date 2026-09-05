/* ═══ THE WALKING DEAD : LE FRANÇAIS ÉCRIT ═══════════════════════════
   The Walking Dead est le troisième univers qu'il faut vraiment
   traduire, après Avatar et Star Trek — et pour la même raison que
   Star Trek : Niko a écrit ce guide-là en anglais.

   Tout ce qui appartient au gabarit du site est retrouvé dans les dix
   autres protos par `traduire-twd.mjs`, jamais écrit ici : navigation,
   pied de page, tamis, niveaux, progression, badges, boutons. Cette
   table ne porte que ce qui est propre à The Walking Dead.

   QUATRE RÈGLES, DANS CET ORDRE.

   1. Un titre d'œuvre n'est pas traduit, il est repris de son
      exploitation française — et **aucune des quinze œuvres de cet
      univers n'a de titre français**. AMC les a toutes diffusées sous
      leur titre d'origine, séries web comprises. Elles sont donc
      déclarées identiques, et ne repartent pas à la relecture.
   2. La prose est de Niko, et se traduit au plus près. Pas de
      raccourci, pas d'ajout, pas d'« amélioration ».
   3. **Ce que Star Trek a déjà dit se dit pareil ici.** Trois phrases de
      l'accroche sont mot pour mot celles du guide Star Trek — « You'll
      find extra details… », « This guide works for first-time watches… »
      — et deux intitulés aussi : « How to read this », « What's left out
      and why? ». Leur français est celui de `data-startrek.js`, recopié
      sans une virgule de différence. Ils ne se retrouvent pas tout seuls
      parce que l'appariement des données ne lit que `CG`, jamais
      l'accroche ; mais deux formulations différentes pour une même
      phrase se verraient d'une page à l'autre.
   4. Ce qui vaut pour les deux langues est déclaré identique.

   LE REGISTRE. La refonte vouvoie — « Cochez ce que vous avez vu » — et
   c'est ce que suit la prose traduite ici.

   ══════════════════════════════════════════════════════════════════ */

/* Ce qui s'écrit pareil des deux côtés : les quinze œuvres, les deux
   lieux qui gardent leur nom, et les valeurs de données que le
   traducteur croise en chemin. Déclarés, ils ne repartent pas au
   rapport de relecture — il n'y a rien à y relire. */
export const TWD_IDENTIQUES = [
  // les quinze œuvres. Aucune n'a de titre français : « Fear the
  // Walking Dead », « Dead City » et les huit séries web ont été
  // diffusées telles quelles.
  'The Walking Dead',
  'Fear the Walking Dead',
  'Fear the Walking Dead: Flight 462',
  'Fear the Walking Dead: Passage',
  'Fear the Walking Dead: Dead in the Water',
  'The Walking Dead: Cold Storage',
  'The Walking Dead: The Oath',
  'The Walking Dead: Torn Apart',
  'The Walking Dead: Red Machete',
  'The Althea Tapes',
  'Tales of the Walking Dead',
  'The Walking Dead: World Beyond',
  'The Walking Dead: The Ones Who Live',
  'The Walking Dead: Daryl Dixon',
  'The Walking Dead: Dead City',
  // deux titres de phase qui ne se traduisent pas : le sigle de la
  // Civic Republic Military, et une ville qui garde son nom.
  'CRM',
  'New-York',
  // valeurs de données et repères techniques croisés en chemin
  'bw',
  // le badge des webséries jamais doublées. Il ne s'écrit qu'en français —
  // la page anglaise ne le pose pas — mais la chaîne est dans la source,
  // et « VO » y reste « VO ».
  'VO',
  'cg-proto-twd',
  'chronologeek-twd.json',
  '288 h',
  'Phases',
  '#a8bf4f',
  'Chronologeek — The Walking Dead (proto E)',
];

/* Les formes, plutôt que des tables : « Season 6 Episodes 1-4 » n'a rien
   à faire dans une liste de 41 lignes. L'ordre compte — le plus précis
   d'abord — et chaque gabarit doit servir au moins une fois, sinon le
   script le signale.

   « Épisode » prend sa majuscule : c'est ainsi que l'écrivent les
   sous-items des cinq autres univers, sans une seule exception. */
export const TWD_GABARITS = [
  // Season 1 Episodes 1-3  →  Saison 1 Épisodes 1-3
  [/^Season (\d+) Episodes ([\d\s,–-]+)$/, m => `Saison ${m[1]} Épisodes ${m[2].trim()}`],
  // Season 1 Episode 2  →  Saison 1 Épisode 2
  [/^Season (\d+) Episode (\d+)$/, m => `Saison ${m[1]} Épisode ${m[2]}`],
  // « PHASE 12 » s'écrit pareil dans les deux langues, mais il faut le
  // dire : sans ce gabarit, les quatorze phases partent au rapport des
  // textes manquants et le bilan n'est jamais propre.
  [/^PHASE (\d+)$/, m => `PHASE ${m[1]}`],
  // 45 / 45 shown  →  45 / 45 affichées
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
];

export const TWD_TRADUCTIONS = [
  /* ── la pastille du h1, posée le 5 septembre 2026 ──
     Elle vivait au-dessus du titre, hors de lui : le h1 ne portait
     donc que le nom nu de la franchise, là où c'est le deuxième
     signal que lit un moteur. Elle est entrée dans le h1 et dit
     maintenant la requête. Le champ subtitle du descripteur
     d'univers en reprend le texte, d'où deux emplois. */
  ["Chronological Watch Order",
   "Ordre de visionnage chronologique"],

  /* ── l'accroche ───────────────────────────────────────────────────
     La première phrase est propre à ce guide ; la seconde est celle de
     Star Trek, et son français vient de `data-startrek.js`. Les deux
     tiennent dans un seul nœud de texte, d'où une seule entrée. */
  ['If you\'re here, it\'s because you want to watch all The Walking Dead in its most optimized order, thought through and studied over years. You\'ll find extra details by clicking on each media, and this entire site is guaranteed free of major spoilers.',
   'Si vous êtes ici, c\'est que vous voulez voir tout The Walking Dead dans l\'ordre le plus optimisé, réfléchi et étudié pendant des années. Vous trouverez des détails supplémentaires en cliquant sur chaque média, et tout ce site est garanti sans spoil majeur.'],
  // mot pour mot la phrase du guide Star Trek, et donc sa traduction
  ['This guide works for first-time watches as well as rewatches.',
   'Ce guide vaut aussi bien pour un premier visionnage que pour un revisionnage.'],

  /* ── CG.t.resetTWD ────────────────────────────────────────────────
     La page reprenait `resetST` : le bouton « Réinitialiser » de The
     Walking Dead demandait confirmation pour la progression Star Trek.
     La clé est neuve, donc sans homologue à retrouver — et le tutoiement
     est celui de Star Trek, dont elle est le voisin de table. */
  ['Reset your Walking Dead progress?',
   'Réinitialiser ta progression The Walking Dead ?'],

  /* ── les trois repères de lecture ─────────────────────────────────
     L'intitulé et deux des trois titres sont ceux de Star Trek. */
  ['How to read this', 'Repères de lecture'],
  ['The Calendar', 'Le calendrier'],
  ['The saga happens in &quot;our&quot; world so we\'ll count in years like we do.',
   'La saga se déroule dans « notre » monde : nous comptons donc les années comme nous le faisons.'],
  ['Flashbacks', 'Les flashbacks'],
  ['Some events work better as a FLASHBACK for understanding, and are marked as such.',
   'Certains événements se comprennent mieux en FLASHBACK, et sont signalés comme tels.'],
  ['Consistency', 'La cohérence'],
  ['No official timeline exists for TWD universe so you\'ll maybe find some little continuity problems here and there but just don\'t overthink too much and enjoy. Actors might also be aging very fast in-universe in a span of a few months and go from child to teenager really fast, just pretend it\'s not a problem neither.',
   'Il n\'existe aucune chronologie officielle de l\'univers TWD : vous trouverez donc peut-être quelques petits problèmes de continuité ici et là, mais n\'y réfléchissez pas trop et profitez. Les acteurs peuvent aussi vieillir très vite dans l\'univers, en l\'espace de quelques mois, et passer d\'enfant à adolescent très rapidement — faites comme si ce n\'était pas un problème non plus.'],

  /* ── ce qui est écarté ────────────────────────────────────────────
     L'intitulé et le compteur sont ceux de Star Trek, au signe près. */
  ['What\'s left out and why?', 'Ce qui est écarté et pourquoi'],
  ['1 entry', '1 entrée'],
  ['Video Games', 'Jeux vidéo'],
  ['The 3 canonical games are either bad, not interesting or not available anymore.',
   'Les 3 jeux canoniques sont soit mauvais, soit sans intérêt, soit devenus introuvables.'],

  /* ── les quatorze phases ──────────────────────────────────────────
     Des lieux, dans l'ordre où la saga les traverse. Sans article, comme
     les huit ères de Star Trek et les sept d'Avatar : ce sont des
     bandeaux, pas des phrases. */
  ['Los Angeles & Mexico Outbreak', 'Épidémie à Los Angeles et au Mexique'],
  ['Atlanta Outbreak', 'Épidémie à Atlanta'],
  ['Georgia', 'Géorgie'],
  ['Virginia', 'Virginie'],
  ['Texas', 'Texas'],
  ['Back to Virginia', 'Retour en Virginie'],
  ['Back to Texas', 'Retour au Texas'],
  ['Roadtrip', 'Sur la route'],
  ['Back to Georgia', 'Retour en Géorgie'],
  ['Across the ocean', 'De l\'autre côté de l\'océan'],

  /* ── les cinq badges ──────────────────────────────────────────────
     Le gabarit de leur description est celui de Star Trek : « Le 22e
     siècle terminé », « Star Trek terminé à 100 % ». Une série est
     féminine, l'univers ne l'est pas — d'où le dernier au masculin. */
  ['Los Angeles Survivor', 'Survivant de Los Angeles'],
  ['Atlanta Survivor', 'Survivant d\'Atlanta'],
  ['New-York Survivor', 'Survivant de New-York'],
  ['European Survivor', 'Survivant d\'Europe'],
  ['Ultimate Survivor', 'Survivant ultime'],
  ['Fear the Walking Dead completed', 'Fear the Walking Dead terminée'],
  ['The Walking Dead completed', 'The Walking Dead terminée'],
  ['Dead City completed', 'Dead City terminée'],
  ['Daryl Dixon completed', 'Daryl Dixon terminée'],
  ['The Walking Dead 100% completed', 'The Walking Dead terminé à 100 %'],

  /* ── les libellés de la page ──────────────────────────────────────
     « TV SHOW » et « TV Shows » sont retrouvés dans les données des
     autres univers ; leurs équivalents web n'existent que sur cette
     page-ci. */
  // « websérie », en un mot : c'est le terme de Niko, et « série web » ne
  // se dit pas. Le badge est au singulier, il porte une entrée ; la case
  // des statistiques et la description en comptent huit.
  ['WEB SERIES', 'WEBSÉRIE'],
  ['Web Series', 'Webséries'],
  ['TV Shows · Web Series', 'Séries · Webséries'],
  ['Chronological Order', 'Ordre chronologique'],
  // le rail des phases, quand une phase n'a pas de numéro : « Era 3 / 14 »
  ['Era', 'Ère'],
  /* La mention légale est celle des dix autres protos, mais son nœud de
     texte ne se découpe pas au même endroit — la version française tient
     la première ligne avec le lien Open Library — et l'appariement ligne
     à ligne la manque. Elle est donc recopiée telle quelle. Le jour où
     The Walking Dead sera publié, les deux langues devront nommer six
     univers au lieu de cinq, ici comme dans `seo.json`. */
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age et Assassin’s Creed sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
];
