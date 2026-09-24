/* ═══ LE FRANÇAIS ÉCRIT DE RESIDENT EVIL ═══════════════════════════════
   Trois listes, et la distinction compte.

   `RE_IDENTIQUES` — ce qui ne se traduit pas. Rien n'y est écrit, donc
   rien n'en repart à la relecture. Les titres sans deux-points y sont
   tous : aucune œuvre du guide n'a de titre français, ni les jeux, ni les
   films d'animation, ni les deux mangas.

   `RE_RETROUVES` — les titres d'exploitation française. Il n'y en a
   aucun ici, et c'est la seule page du site dans ce cas : Capcom n'a
   jamais traduit un titre de la saga, et les mangas paraissent sous leur
   nom anglais.

   `RE_TRADUCTIONS` — ce qui est vraiment écrit, et qui part en relecture :
   l'accroche, les trois repères de lecture, ce qui est écarté, les quatre
   ères et les cinq badges. **Les titres à deux-points y sont aussi** : le
   nom ne se traduit pas, la ponctuation si — c'est la règle de Star Trek,
   et c'est ce que fait déjà Assassin's Creed, dont cette page est bâtie.
   ═════════════════════════════════════════════════════════════════════ */

export const RE_IDENTIQUES = [
  /* l'univers, et les titres que la ponctuation ne touche pas */
  'Resident Evil',
  'Resident Evil 0',
  'Resident Evil HD Remaster',
  'Resident Evil Outbreak',
  'Resident Evil Outbreak File #2',
  'Resident Evil 2 Remake',
  'Resident Evil 3 Remake',
  'Resident Evil 4 Remake',
  'Resident Evil 5',
  'Resident Evil 6',
  'Resident Evil Village',
  'Maiden',
  'Evil Has Always Had A Name',
  /* Raccoon City est un nom de lieu, il ne se traduit pas plus que
     Raccoon City Police Department */
  'Raccoon City',
  /* « PHASE » s'écrit pareil dans les deux langues — c'est déjà le cas
     chez Marvel */
  'PHASE 1', 'PHASE 2', 'PHASE 3', 'PHASE 4',
  /* la page elle-même, et ce qui n'est pas du texte affiché */
  'Chronologeek — Resident Evil (proto E)',
  'chronologeek-residentevil.json',
  'residentevil',
  'filmanim',
  'cg-proto-re',
  '/images/residentevil.webp',
];

export const RE_RETROUVES = [];

export const RE_TRADUCTIONS = [
  /* ── les titres : le nom reste, le deux-points prend son espace ──── */
  ['Resident Evil: Code Veronica X', 'Resident Evil : Code Veronica X'],
  ['Resident Evil: The Darkside Chronicles', 'Resident Evil : The Darkside Chronicles'],
  ['Resident Evil: The Umbrella Chronicles', 'Resident Evil : The Umbrella Chronicles'],
  ['Resident Evil: Revelations', 'Resident Evil : Revelations'],
  ['Resident Evil: Revelations 2', 'Resident Evil : Revelations 2'],
  ['Resident Evil: Degeneration', 'Resident Evil : Degeneration'],
  ['Resident Evil: Infinite Darkness - The Beginning',
   'Resident Evil : Infinite Darkness - The Beginning'],
  ['Resident Evil: Infinite Darkness', 'Resident Evil : Infinite Darkness'],
  ['Resident Evil: Damnation', 'Resident Evil : Damnation'],
  ['Resident Evil: The Marhawa Desire', 'Resident Evil : The Marhawa Desire'],
  ['Resident Evil: Heavenly Island', 'Resident Evil : Heavenly Island'],
  ['Resident Evil: Vendetta', 'Resident Evil : Vendetta'],
  ['Resident Evil: Death Island', 'Resident Evil : Death Island'],
  ['Resident Evil 7 Teaser: Beginning Hour', 'Resident Evil 7 Teaser : Beginning Hour'],
  ['Resident Evil 7: Biohazard', 'Resident Evil 7 : Biohazard'],
  ['Resident Evil: Requiem', 'Resident Evil : Requiem'],
  ['Resident Evil Village: Shadows of Rose', 'Resident Evil Village : Shadows of Rose'],
  ['Las Plagas: Organisms of War', 'Las Plagas : Organisms of War'],

  /* ── l'accroche, et les trois repères de lecture ─────────────────── */
  ['If you’re here it’s either because you did some games and want to discover the other '
   + 'media or want to do all the games again and add the rest. If you just want to discover '
   + 'the games in chronological order uncheck the rest, all other medias are bonus content '
   + '(some important). This guide is spoiler free like the others.',
   'Si vous êtes ici, c’est soit parce que vous avez fait quelques jeux et que vous voulez '
   + 'découvrir les autres médias, soit parce que vous voulez refaire tous les jeux en y '
   + 'ajoutant le reste. Si vous voulez seulement découvrir les jeux dans l’ordre '
   + 'chronologique, décochez le reste : tous les autres médias sont du contenu bonus '
   + '(certains importants). Ce guide est sans spoiler, comme les autres.'],
  ['The saga happens in &quot;our&quot; world so we’ll count in years like we do.',
   'La saga se déroule dans « notre » monde : on compte donc les années comme nous le faisons.'],
  ['Flashback', 'Flashback'],
  ['The main games are all being remade and are fixing the timeline issues so until '
   + 'everything is remade some little things can be a bit odd. In RE and RE: 2 you have to '
   + 'choose between characters but the canon story is a mix of both paths',
   'Les jeux principaux sont tous en cours de remake et corrigent les problèmes de '
   + 'chronologie : tant que tout n’est pas refait, quelques petites choses peuvent paraître '
   + 'un peu étranges. Dans RE et RE : 2, il faut choisir entre deux personnages, mais '
   + 'l’histoire canon est un mélange des deux parcours'],

  /* ── ce qui n'y est pas ──────────────────────────────────────────── */
  ['What’s left out and why?', 'Ce qui n’y est pas, et pourquoi ?'],
  ['Original games', 'Les jeux d’origine'],
  ['Original game if a remake exists', 'Le jeu d’origine quand un remake existe'],
  ['Ports', 'Les portages'],
  ['Ports of some games on other consoles (like Nintendo DS)',
   'Les portages de certains jeux sur d’autres consoles (comme la Nintendo DS)'],
  ['Novelizations', 'Les novélisations'],
  ['Novelizations of games/movies, DVD bonus, documents...',
   'Les novélisations de jeux et de films, les bonus DVD, les documents…'],
  ['Japanese-only media', 'Les médias japonais uniquement'],
  ['All Japanese-only media: not canon for the most of them',
   'Tous les médias sortis au Japon seulement : la plupart ne sont pas canon'],
  ['Survivor games', 'Les jeux Survivor'],
  ['Survivor games: arcade spin-offs hard to find these days and don’t add much to the lore',
   'Les jeux Survivor : des spin-offs d’arcade difficiles à trouver aujourd’hui, et qui '
   + 'n’apportent pas grand-chose au lore'],
  ['Biohazard 4D-Executer', 'Biohazard 4D-Executer'],
  ['Biohazard 4D-Executer: not canon', 'Biohazard 4D-Executer : pas canon'],
  ['Live action movies and shows', 'Les films et séries en prises de vues réelles'],
  ['Live action movies and shows: their own canon',
   'Les films et séries en prises de vues réelles : ils ont leur propre canon'],
  ['Multiplayer and mobile games', 'Les jeux multijoueur et mobiles'],
  ['Multiplayer only games and mobile games',
   'Les jeux uniquement multijoueur et les jeux mobiles'],

  /* ── les quatre ères ─────────────────────────────────────────────── */
  ['After Umbrella', 'Après Umbrella'],
  ['Global Bioterrorism', 'Bioterrorisme mondial'],
  ['Back to Horror', 'Retour à l’horreur'],

  /* ── les notes de placement ──────────────────────────────────────── */
  ['Same week as RE 2 and 3', 'La même semaine que RE 2 et 3'],
  ['Same week as RE Outbreak and 3', 'La même semaine que RE Outbreak et 3'],
  ['Same week as RE Outbreak and 2', 'La même semaine que RE Outbreak et 2'],
  ['Prequel demo for RE 7: Biohazard', 'Démo préquelle de RE 7 : Biohazard'],
  ['Prequel demo for RE: Village', 'Démo préquelle de RE : Village'],
  ['Watch the video', 'Voir la vidéo'],

  /* ── les cinq badges ─────────────────────────────────────────────── */
  ['Raccoon City Survivor', 'Survivant de Raccoon City'],
  ['The 1998 outbreak completed', 'L’épidémie de 1998 terminée'],
  ['Umbrella’s Fall', 'La Chute d’Umbrella'],
  ['The end of Umbrella completed', 'La fin d’Umbrella terminée'],
  ['B.S.A.A. Agent', 'Agent du B.S.A.A.'],
  ['The bioterrorism years completed', 'Les années de bioterrorisme terminées'],
  ['The Winters Family', 'La Famille Winters'],
  ['Ethan and Rose’s story completed', 'L’histoire d’Ethan et Rose terminée'],
  ['Biohazard Master', 'Maître du Biohazard'],
  ['Resident Evil 100% completed', 'Resident Evil terminé à 100 %'],

  /* ── le reste du gabarit, propre à cet univers ───────────────────── */
  ['Reset your Resident Evil progress?', 'Réinitialiser votre progression Resident Evil ?'],
  ['Games · Movies · Show · Books · Comics', 'Jeux · Films · Série · Livres · Comics'],
  ['Games · Movies · Show · Books · Comics — the whole Resident Evil universe in its most '
   + 'optimized order.',
   'Jeux · Films · Série · Livres · Comics — tout l’univers Resident Evil dans son ordre le '
   + 'plus optimisé.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher and Resident Evil are trademarks of '
   + 'their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher et Resident Evil sont des marques de '
   + 'leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher and Resident Evil are trademarks of '
   + 'their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher et Resident Evil sont des marques de '
   + 'leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
];

export const RE_GABARITS = [
  [/^Season (\d+)$/, m => `Saison ${m[1]}`],
  [/^Season (\d+) Episodes? (\d+(?:-\d+)?)$/, m =>
    `Saison ${m[1]} ${m[2].includes('-') ? 'Épisodes' : 'Épisode'} ${m[2]}`],
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
];
