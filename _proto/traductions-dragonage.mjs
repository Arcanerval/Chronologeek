/* ═══ DRAGON AGE : LE FRANÇAIS ÉCRIT ═════════════════════════════════
   Dragon Age est le quatrième univers qu'il faut vraiment traduire, après
   Avatar Legends, Star Trek et The Walking Dead — et pour la même raison
   que les deux derniers : Niko a écrit ce guide-là en anglais.

   Tout ce qui appartient au gabarit du site est retrouvé dans les onze
   autres protos par `traduire-dragonage.mjs`, jamais écrit ici :
   navigation, pied de page, tamis, niveaux, progression, boutons, volet
   FAQ. Cette table ne porte que ce qui est propre à Dragon Age.

   CINQ RÈGLES, DANS CET ORDRE.

   1. Un titre d'œuvre n'est pas traduit, il est repris de son
      exploitation française — et **dix-sept œuvres sur trente-six en
      ont une**. Les douze DLC de la timeline, dont le menu français
      porte le nom traduit ; les trois comics de Dark Horse parus dans
      l'« Intégrale Volume 1 » ; les deux romans parus chez Milady. Les
      dix-neuf autres — les cinq jeux, les quatre romans, les six comics,
      les deux vidéos, le film et la série — gardent leur titre
      d'origine ; elles sont déclarées identiques, et ne repartent pas à
      la relecture.
   2. **Le vocabulaire est celui de la localisation française des jeux**,
      pas une traduction littérale : Blight → Enclin, Grey Warden → Garde
      des Ombres, Dread Wolf → Loup Implacable, Thedas → Thédas,
      Chantry → Chantrie. C'est ce que lit quelqu'un qui joue en
      français.
   3. La prose est de Niko, et se traduit au plus près. Pas de raccourci,
      pas d'ajout, pas d'« amélioration ». Les résumés récoltés au wiki
      suivent la même règle.
   4. **Un nom de quête est celui du journal de quêtes français**, relevé
      dans le jeu par Niko, jamais traduit de mémoire : « Le Passé de
      Leliana » et « Yeux Sombres et Cœur Cruel ». Ce sont des repères que
      le lecteur va chercher dans sa propre partie — une chaîne
      approchante l'y enverrait pour rien.
   5. Ce qui vaut pour les deux langues est déclaré identique.

   LE REGISTRE. La refonte vouvoie — « Cochez ce que vous avez vu » — et
   c'est ce que suit la prose traduite ici.

   ══════════════════════════════════════════════════════════════════ */

/* Ce qui s'écrit pareil des deux côtés : les dix-neuf œuvres sans titre
   français, et les valeurs de données que le traducteur croise
   en chemin. Déclarés, ils ne repartent pas au rapport de relecture — il
   n'y a rien à y relire. */
export const DA_IDENTIQUES = [
  // ── les cinq jeux ────────────────────────────────────────────────
  // EA n'a jamais traduit un titre de jeu Dragon Age : la boîte
  // française annonce « Dragon Age: Origins ». Les treize DLC, eux, le
  // sont — ils sont plus bas, dans les traductions.
  'Dragon Age',
  'Dragon Age: Origins',
  'Dragon Age: Origins - Awakening',
  'Dragon Age II',
  'Dragon Age: Inquisition',
  'Dragon Age: The Veilguard',
  // ── l'écrit sans édition française ───────────────────────────────
  'Dragon Age: The Calling',
  'Dragon Age: Asunder',
  'Dragon Age: Last Flight',
  'Tevinter Nights',
  'Dragon Age: Magekiller',
  'Dragon Age: Knight Errant',
  'Dragon Age: Deception',
  'Dragon Age: Blue Wraith',
  'Dragon Age: Dark Fortress',
  'Dragon Age: The Missing',
  // ── l'image et l'animation ───────────────────────────────────────
  'Dragon Age: Warden\'s Fall',
  'Dragon Age: Redemption',
  'Dragon Age: Dawn of the Seeker',
  'Dragon Age: Absolution',
  // ── ce qui est écarté, et qui garde son nom ──────────────────────
  // « The Darkspawn Chronicles » n'est pas ici : c'est un DLC, il a été
  // traduit comme les douze autres.
  'Dragon Age (IDW, 2010)',
  'Hard in Hightown',
  'The Final Conversation',
  'Vows and Vengeance',
  // ── valeurs de données et repères techniques croisés en chemin ───
  'bd',
  'DLC',
  'VO',
  'dragonage',
  'cg-proto-dragonage',
  'chronologeek-dragonage.json',
  '/images/dragonage.webp',
  'https://api.rawg.io/api/games/',
  '?key=',
  'Chronologeek — Dragon Age (proto E)',
];

/* Les formes, plutôt que des tables. L'ordre compte — le plus précis
   d'abord — et chaque gabarit doit servir au moins une fois, sinon le
   script le signale.

   « Épisode » prend sa majuscule : c'est ainsi que l'écrivent les
   sous-items des six autres univers, sans une seule exception. */
export const DA_GABARITS = [
  // Season 1 Episodes 1-6  →  Saison 1 Épisodes 1-6
  [/^Season (\d+) Episodes ([\d\s,–-]+)$/, m => `Saison ${m[1]} Épisodes ${m[2].trim()}`],
  // « PHASE 3 » s'écrit pareil dans les deux langues, mais il faut le
  // dire : sans ce gabarit, les cinq phases partent au rapport des
  // textes manquants et le bilan n'est jamais propre.
  [/^PHASE (\d+)$/, m => `PHASE ${m[1]}`],
  // 43 / 43 shown  →  43 / 43 affichées
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
];

export const DA_TRADUCTIONS = [
  /* ── les cinq œuvres qui ont une édition française ────────────────
     Trois comics et deux romans, les seuls de l'univers. Les comics
     n'ont jamais paru seuls en France : ils sont dans l'« Intégrale
     Volume 1 » de Dark Horse France, et la page le dit sous le résumé —
     même geste que le « VF dans le recueil… » d'Avatar Legends. Les
     deux romans ont paru chez Milady sous leur titre français.

     Le deux-points prend son espace : c'est la ponctuation française,
     et les six autres univers n'en ont pas un seul collé. */
  ['Dragon Age: The Silent Grove', 'Dragon Age : Le Bosquet Secret'],
  ['Dragon Age: Those Who Speak', 'Dragon Age : Ceux Qui Parlent'],
  ['Dragon Age: Until We Sleep', 'Dragon Age : Jusqu\'à Ce Que Nous Dormions'],
  ['Dragon Age: The Stolen Throne', 'Dragon Age : Le Trône Volé'],
  ['Dragon Age: The Masked Empire', 'Dragon Age : L\'Empire Masqué'],

  /* ── les treize DLC ───────────────────────────────────────────────
     Contrairement aux jeux, ils sont traduits : c'est le nom que porte
     le menu français, relevé par Niko le 20 août 2026. « The Darkspawn
     Chronicles » est du lot, bien qu'il ne soit pas dans la timeline —
     il est nommé dans le dépliant de ce qui est écarté.

     Ces noms reviennent dans les résumés, et y sont traduits aussi :
     une entrée qui s'intitule « Le Prisonnier de la Pierre » et dont le
     résumé commence par « The Stone Prisoner est… » se lit mal. */
  ['The Stone Prisoner', 'Le Prisonnier de la Pierre'],
  ['Warden\'s Keep', 'Forteresse des Gardes des Ombres'],
  ['Leliana\'s Song', 'Le Chant de Leliana'],
  ['Return to Ostagar', 'Retour à Ostagar'],
  ['The Darkspawn Chronicles', 'Les Chroniques des Engeances'],
  ['The Golems of Amgarrak', 'Les Golems d\'Amgarrak'],
  ['Witch Hunt', 'Chasse aux Sorcières'],
  ['The Exiled Prince', 'Le Prince Exilé'],
  ['Mark of the Assassin', 'La Marque de l\'Assassin'],
  ['Legacy', 'L\'Héritage'],
  ['Jaws of Hakkon', 'Les Crocs d\'Hakkon'],
  ['The Descent', 'La Descente'],
  ['Trespasser', 'Intrus'],

  /* ── l'accroche ───────────────────────────────────────────────────
     Les deux paragraphes sont propres à ce guide : aucun autre univers
     ne prévient qu'on peut décocher le reste pour ne garder que les
     jeux. */
  ['If you\'re here it\'s either because you did some of the games and want to discover the lore of Thedas (Dragon Age\'s world name) or you\'re absolutely sure to love this universe before even trying it. If you just want to discover the games in chronological order uncheck the rest, all other medias are bonus content (some very important). This guide is spoiler free like the others.',
   'Si vous êtes ici, c\'est soit que vous avez fait certains des jeux et que vous voulez découvrir le lore de Thédas (le nom du monde de Dragon Age), soit que vous êtes absolument sûr d\'aimer cet univers avant même de l\'avoir essayé. Si vous voulez seulement découvrir les jeux dans l\'ordre chronologique, décochez le reste : tous les autres médias sont du contenu bonus (certains très importants). Ce guide est sans spoil, comme les autres.'],
  ['This guide works best for first-time plays and people who want to discover the other medias.',
   'Ce guide vaut avant tout pour une première partie et pour ceux qui veulent découvrir les autres médias.'],

  /* ── les trois repères de lecture ────────────────────────────────
     L'intitulé et « Le calendrier » sont ceux de Star Trek et de The
     Walking Dead ; les deux autres titres n'existent que sur cette
     page-ci. « Blight » est rendu par « Enclin », « Chantry » par
     « Chantrie » et « Divine » par « Divine » : c'est le vocabulaire de
     la localisation française des jeux. */
  ['Three main calendars exist in this world but the most common is the Chantry calendar, which measures time in &quot;Ages&quot;. Each age lasts 100 years, the current Age is the Dragon Age (got it ?), the ninth since the founding of the Chantry and the crowning of Justinia I the first Divine giving the first Age its name.',
   'Il existe trois calendriers principaux dans ce monde, mais le plus courant est celui de la Chantrie, qui mesure le temps en « Âges ». Chaque âge dure 100 ans ; l\'Âge actuel est l\'Âge du Dragon (vous avez saisi ?), le neuvième depuis la fondation de la Chantrie et le couronnement de Justinia Ire, la première Divine, qui a donné son nom au premier Âge.'],
  /* Ces trois intitulés sont ceux de Star Trek et de The Walking Dead,
     au mot près. Ils ne se retrouvent pas tout seuls : l'appariement des
     données ne lit que `CG`, jamais l'accroche, et les pages ne les
     portent pas — c'est le JS qui les écrit au chargement. Le troisième
     est échappé, `construire-dragonage.py` passant l'accroche par
     `esc()`. */
  ['How to read this', 'Repères de lecture'],
  ['The Calendar', 'Le calendrier'],
  ['What&#x27;s left out and why?', 'Ce qui est écarté et pourquoi'],
  ['Flashbacks and DLC placement', 'Les flashbacks et le placement des DLC'],
  ['Some events work better as a FLASHBACK because they spoil details from the games or gives your character an unnatural omniscience that can break immersion.',
   'Certains événements se comprennent mieux en FLASHBACK, parce qu\'ils dévoilent des détails des jeux ou donnent à votre personnage une omniscience contre nature qui peut casser l\'immersion.'],
  ['DLC placement was studied to be the best possible with the flow of the games.',
   'Le placement des DLC a été étudié pour coller au mieux au déroulé des jeux.'],
  ['Canonicity', 'La canonicité'],
  ['The games offer different choices and endings that other medias can\'t follow. So there is a &quot;Bioware Canon&quot; and your own canon. For exemple if you do Dragon Age 2 without doing Origins they will explain events with the &quot;Bioware Canon&quot; but you can also import your save if you did it. The other medias follow this canon so you can find things weird depending on your choices in the games.',
   'Les jeux offrent des choix et des fins que les autres médias ne peuvent pas suivre. Il existe donc un « canon BioWare » et votre propre canon. Par exemple, si vous faites Dragon Age 2 sans avoir fait Origins, les événements vous seront expliqués selon le « canon BioWare » — mais vous pouvez aussi importer votre sauvegarde si vous l\'avez faite. Les autres médias suivent ce canon : certaines choses pourront donc vous sembler étranges selon vos choix dans les jeux.'],

  /* ── ce qui est écarté ────────────────────────────────────────────
     L'intitulé et le compteur sont ceux de Star Trek, au signe près. */
  ['8 entries', '8 entrées'],
  ['Dragon Age IDW comic from 2010 has too many inconsistencies and the events are never referenced again so it\'s considered non-canon.',
   'Le comic Dragon Age d\'IDW, paru en 2010, a trop d\'incohérences et ses événements ne sont jamais repris ensuite : il est considéré comme non canonique.'],
  ['The Darkspawn Chronicles DLC from Origins is a &quot;what-if&quot; scenario, you can do it after the main game but it\'s not canon.',
   'Le DLC Les Chroniques des Engeances d\'Origins est un scénario « et si ? » : vous pouvez le faire après le jeu principal, mais il n\'est pas canonique.'],
  ['Hard in Hightown is a in-universe story written by one of the characters, it\'s pretty cool to read if you want to but it\'s not in the timeline.',
   'Hard in Hightown est un récit interne à l\'univers, écrit par l\'un des personnages : plutôt sympa à lire si vous en avez envie, mais il n\'est pas dans la timeline.'],
  ['The Final Conversation is a fanfiction written by an ex-Bioware employee, even if he created the character the story is about it can\'t be considered canon but you can read it.',
   'The Final Conversation est une fanfiction écrite par un ancien employé de BioWare : même s\'il a créé le personnage dont parle l\'histoire, elle ne peut pas être considérée comme canonique — vous pouvez la lire malgré tout.'],
  ['The webcomics', 'Les webcomics'],
  ['The webcomics are very short stories not really important.',
   'Les webcomics sont de très courtes histoires, sans réelle importance.'],
  ['The short stories', 'Les nouvelles'],
  ['The short stories of DA2, DAI and DAV can be read found on internet but it\'s hard to place them so i prefer not to risk myself, read them after each game if you want.',
   'Les nouvelles de DA2, DAI et DAV se trouvent sur Internet, mais elles sont difficiles à placer : je préfère ne pas m\'y risquer. Lisez-les après chaque jeu si vous voulez.'],
  ['Browser and mobile games', 'Les jeux navigateur et mobiles'],
  ['The browser and mobile games are not available anymore.',
   'Les jeux navigateur et mobiles ne sont plus disponibles.'],
  ['Dragon Age: Vows and Vengeance is a narrative podcast available on YouTube, it\'s canon but lacking any images I\'m struggling placing it here but if you want listen to it before playing DAV.',
   'Dragon Age: Vows and Vengeance est un podcast narratif disponible sur YouTube. Il est canonique, mais faute d\'images j\'ai du mal à le placer ici : si vous voulez, écoutez-le avant de jouer à DAV.'],

  /* ── les cinq phases ──────────────────────────────────────────────
     Des événements, pas des lieux : elles gardent donc leur article,
     contrairement aux quatorze phases de The Walking Dead. « Blight »
     est rendu par « Enclin » et « Dread Wolf » par « Loup Implacable »,
     comme dans les jeux en français. */
  ['The Fifth Blight', 'Le Cinquième Enclin'],
  ['The Champion of Kirkwall', 'Le Champion de Kirkwall'],
  ['The Mage-Templar War', 'La Guerre des Mages et des Templiers'],
  ['The Inquisition', 'L\'Inquisition'],
  ['The Dread Wolf Rises', 'L\'Ascension du Loup Implacable'],

  /* ── les cinq badges ──────────────────────────────────────────────
     Le gabarit de leur description est celui de Star Trek et de The
     Walking Dead : « Star Trek terminé à 100 % ». Un jeu est masculin,
     l'univers aussi — tout est au masculin ici. */
  ['Grey Warden', 'Garde des Ombres'],
  ['Dragon Age: Origins and its DLC completed', 'Dragon Age: Origins et ses DLC terminés'],
  ['Champion of Kirkwall', 'Champion de Kirkwall'],
  ['Dragon Age II and its DLC completed', 'Dragon Age II et ses DLC terminés'],
  ['Inquisitor', 'Inquisiteur'],
  ['Dragon Age: Inquisition and its DLC completed', 'Dragon Age: Inquisition et ses DLC terminés'],
  ['Loremaster of Thedas', 'Maître du Savoir de Thédas'],
  ['Every book and comic completed', 'Tous les livres et comics terminés'],
  ['The Dread Wolf', 'Le Loup Implacable'],
  ['Dragon Age 100% completed', 'Dragon Age terminé à 100 %'],

  /* ── les deux questions de FAQ ────────────────────────────────────
     La troisième — « Why watch… » — est retrouvée dans `data-startrek.js`,
     et ces deux-ci en reprennent la forme au mot près. */
  ['Why play {name} at this point in the timeline?',
   'Pourquoi jouer à {name} maintenant dans la timeline ?'],
  ['Why read {name} at this point in the timeline?',
   'Pourquoi lire {name} maintenant dans la timeline ?'],

  /* ── les libellés de la page ──────────────────────────────────────
     `DLC` n'est pas dans cette liste : il s'écrit pareil, et il est
     déclaré identique plus haut. */
  ['Reset your Dragon Age progress?', 'Réinitialiser la progression Dragon Age ?'],
  /* Le gabarit vient de Star Trek et annonçait « Left to watch » — donc
     « Restant à voir », qui est au lexique. On ne regarde pas un jeu, on
     y joue : `construire-dragonage.py` réécrit la clé, et il faut donc
     écrire la française, qu'aucune page du site ne porte encore. Elle
     sert deux fois, dans `CG.t.left` et dans le HUD de la page. */
  ['Left to play', 'Restant à jouer'],
  ['Played', 'Joués'],
  ['played', 'joués'],
  /* Le compteur du bandeau de phase est concaténé en JS, et sa balise
     fermante fait partie de la chaîne littérale : le scanner rend
     « played</span> », pas « played ». Deux entrées pour un même mot,
     donc — c'est ainsi qu'Avatar Legends porte déjà « vus » et
     « vus</span> ». */
  ['played</span>', 'joués</span>'],
  ['Hide played', 'Masquer les joués'],
  ['Mark “{t}” as played', 'Marquer « {t} » comme joué'],
  ['Games · Books · Comics', 'Jeux · Livres · Comics'],
  ['Games', 'Jeux'],
  ['Games · DLC · Books · Comics — the whole Dragon Age universe in its most optimized order.',
   'Jeux · DLC · Livres · Comics — tout l\'univers Dragon Age dans son ordre le plus optimisé.'],
  ['Check off what you\'ve played — your progress is saved.',
   'Cochez ce que vous avez joué, votre progression est sauvegardée.'],
  // le bouton de lien externe. Il est écrasé juste après par `LIENS_FR`
  // — la page française pointe une recherche VOSTFR, pas la vidéo — mais
  // la chaîne doit avoir une traduction, sinon le bilan n'est pas propre.
  ['Watch on YouTube', 'Regarder sur YouTube'],
  /* La mention légale nomme les sept univers. Elle est celle des onze
     autres protos, mais son nœud de texte ne se découpe pas au même
     endroit — la version française tient la première ligne avec le lien
     Open Library — et l'appariement ligne à ligne la manque. */
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, Dragon Age and The Walking Dead are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, Dragon Age et The Walking Dead sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],

  /* ── les seize lignes de placement ────────────────────────────────
     Elles sont dans `note`, sous le titre, comme sur la timeline
     Marvel. Deux noms de quête restent en anglais : voir la règle 4 en
     tête de fichier. */
  ['Early game until level 5-8', 'Début du jeu, jusqu\'au niveau 5-8'],
  ['Between level 5-8 after finishing Lothering',
   'Entre les niveaux 5 et 8, après avoir terminé Lothering'],
  ['Between level 7-12 after finishing Lothering',
   'Entre les niveaux 7 et 12, après avoir terminé Lothering'],
  ['Early to midgame', 'Du début au milieu du jeu'],
  ['Best done after the end of her personal quest "Leliana\'s Past"',
   'À faire de préférence après la fin de sa quête personnelle « Le Passé de Leliana »'],
  ['Midgame to endgame', 'Du milieu à la fin du jeu'],
  ['Between level 15-18 or after you get Wynne',
   'Entre les niveaux 15 et 18, ou après avoir recruté Wynne'],
  ['Endgame', 'Fin du jeu'],
  ['Early Act 1', 'Début de l\'acte 1'],
  ['Start the DLC in Act 1', 'Commencer le DLC pendant l\'acte 1'],
  ['Act 2', 'Acte 2'],
  ['Early Act 3', 'Début de l\'acte 3'],
  ['Act 3', 'Acte 3'],
  ['Until the end of Act 2 (quest Wicked Eyes and Wicked Hearts)',
   'Jusqu\'à la fin de l\'acte 2 (quête « Yeux Sombres et Cœur Cruel »)'],
  ['Act 3 and endgame', 'Acte 3 et fin du jeu'],

  /* ── les vingt-huit résumés ───────────────────────────────────────
     Ceux du document de Niko et ceux récoltés au wiki, dans l'ordre de
     la timeline. Les trois comics de l'Intégrale Volume 1 portent en
     plus la phrase qui dit où les lire en français — c'est le seul
     ajout de tout le fichier, et il est propre à la version française
     puisque le recueil l'est aussi. */
  ['The Stone Prisoner is downloadable content for Dragon Age: Origins. The Stone Prisoner refers to the titular character of this downloadable content, Shale.',
   'Le Prisonnier de la Pierre est un contenu téléchargeable pour Dragon Age: Origins. Le titre désigne le personnage central du DLC, Shale.'],
  ['Warden\'s Keep is downloadable content available on the Xbox Live Marketplace, the PlayStation Store, and BioWare\'s official site for the PC. Warden\'s Keep grants players access to the fortress of Soldier\'s Peak, a quest to unlock the mysteries of the fortress, two new talents / spells for each class from the Power of Blood school, two achievements, and various items.',
   'Forteresse des Gardes des Ombres est un contenu téléchargeable disponible sur le Xbox Live Marketplace, le PlayStation Store et le site officiel de BioWare pour le PC. Il donne accès à la forteresse du Pic du Soldat, à une quête qui en perce les mystères, à deux nouveaux talents ou sorts par classe issus de l\'école du Pouvoir du Sang, à deux succès et à divers objets.'],
  ['Leliana\'s Song is a prequel DLC for Dragon Age: Origins that explores Leliana\'s back-story in greater detail. It includes fully voiced cutscenes and includes a reward item, the Battledress of the Provocateur, that once attained transfers to both existing saved games and new games of Dragon Age: Origins and Dragon Age: Awakening.',
   'Le Chant de Leliana est un DLC préquelle de Dragon Age: Origins qui explore en détail le passé de Leliana. Il contient des cinématiques entièrement doublées et un objet de récompense, la Tenue de combat de la Provocatrice, qui une fois obtenu se transmet aux sauvegardes existantes comme aux nouvelles parties de Dragon Age: Origins et de Dragon Age: Awakening.'],
  ['Playing it after her personal quest preserves the mystery of her past, avoids heavy spoilers, and makes the DLC feel like an interactive flashback of the exact events you just witnessed.',
   'Y jouer après sa quête personnelle préserve le mystère de son passé, évite de gros spoilers et fait du DLC une sorte de flashback interactif des événements que vous venez justement d\'apprendre.'],
  ['Return to Ostagar is downloadable content for Dragon Age: Origins. It allows the Warden to return to the first battlefield of Ostagar where the Grey Wardens were nearly wiped out by the darkspawn.',
   'Retour à Ostagar est un contenu téléchargeable pour Dragon Age: Origins. Il permet au Garde de revenir sur le premier champ de bataille d\'Ostagar, où les Gardes des Ombres ont été presque entièrement anéantis par les engeances.'],
  ['When the beloved rebel queen is murdered, her son Maric sets out on a mission of vengeance against the faithless lords who were responsible for his mother\'s untimely death. The nation of Ferelden that once prospered under his family\'s reign now suffers under the cruel hands of the invading Orlesians. His countrymen now live in fear and no one is to be trusted. Maric soon becomes the leader of a rebel army hell-bent on retaking Ferelden from the control of a foreign tyrant.',
   'Lorsque la reine rebelle tant aimée est assassinée, son fils Maric part en quête de vengeance contre les seigneurs félons responsables de sa mort prématurée. La nation de Férelden, jadis prospère sous le règne de sa famille, subit désormais la cruauté des envahisseurs orlésiens. Ses compatriotes vivent dans la peur et personne n\'est digne de confiance. Maric devient bientôt le chef d\'une armée rebelle décidée à reprendre le Férelden au tyran étranger.'],
  ['Knowing the book\'s secrets gives your Warden an unnatural omniscience, which can slightly break roleplay immersion if your character shouldn\'t know those details.',
   'Connaître les secrets du livre donne à votre Garde une omniscience contre nature, qui peut légèrement casser l\'immersion si votre personnage n\'est pas censé connaître ces détails.'],
  ['In Dragon Age: The Stolen Throne, Maric sets out on a mission of vengeance, against the faithless lords who were responsible for his mother\'s death. Now, having reclaimed the throne, King Maric finally allows the legendary Grey Wardens to return to Ferelden after two hundred years of exile. When they come, however, they bring dire news: one of their own has escaped into the Deep Roads and aligned himself with their ancient enemy, the monstrous darkspawn.',
   'Dans Dragon Age : Le Trône Volé, Maric part en quête de vengeance contre les seigneurs félons responsables de la mort de sa mère. Aujourd\'hui, le trône reconquis, le roi Maric autorise enfin les légendaires Gardes des Ombres à revenir en Férelden après deux cents ans d\'exil. Mais ils arrivent avec une sombre nouvelle : l\'un des leurs s\'est enfui dans les Tréfonds et s\'est rangé du côté de leur ennemi ancestral, les monstrueuses engeances.'],
  ['About the fate of Grey Warden Kristoff after the end of Origins.',
   'Sur le sort du Garde des Ombres Kristoff après la fin d\'Origins.'],
  ['The Golems of Amgarrak is DLC for Dragon Age: Origins. It\'s also possible to unlock three reward items that show up in Origins and Awakening.',
   'Les Golems d\'Amgarrak est un DLC pour Dragon Age: Origins. Il permet aussi de débloquer trois objets de récompense qui apparaissent dans Origins et dans Awakening.'],
  ['Witch Hunt is downloadable content for Dragon Age: Origins that explores the whereabouts of Morrigan, the Witch of the Wilds, who aided the Warden during the Fifth Blight.',
   'Chasse aux Sorcières est un contenu téléchargeable pour Dragon Age: Origins qui part sur les traces de Morrigan, la Sorcière des Terres Sauvages, qui a aidé le Garde pendant le Cinquième Enclin.'],
  ['The Exiled Prince is downloadable content for Dragon Age II, included in the signature edition or available separately from the Xbox Live Marketplace, PlayStation Network, and BioWare\'s site for the PC. It can be played at any time after reaching Kirkwall in the main campaign.',
   'Le Prince Exilé est un contenu téléchargeable pour Dragon Age II, inclus dans l\'édition signature ou disponible séparément sur le Xbox Live Marketplace, le PlayStation Network et le site de BioWare pour le PC. Il peut se jouer à tout moment une fois Kirkwall atteinte dans la campagne principale.'],
  ['Mark of the Assassin is the final piece of story-driven downloadable content for Dragon Age II. It can be played at any time after reaching Kirkwall in the main campaign, though it takes place before the events of the game ending.',
   'La Marque de l\'Assassin est le dernier contenu téléchargeable scénarisé de Dragon Age II. Il peut se jouer à tout moment une fois Kirkwall atteinte dans la campagne principale, même s\'il se déroule avant les événements de la fin du jeu.'],
  ['The story of Tallis, an elven assassin who adopts the Qun.',
   'L\'histoire de Tallis, une assassine elfe qui embrasse le Qun.'],
  ['Knowing Tallis\'s backstory before meeting her could influence your decisions and gives Hawke an unnatural omniscience, which can slightly break roleplay immersion if your character shouldn\'t know those details.',
   'Connaître le passé de Tallis avant de la rencontrer pourrait influencer vos décisions et donne à Hawke une omniscience contre nature, qui peut légèrement casser l\'immersion si votre personnage n\'est pas censé connaître ces détails.'],
  ['Legacy is story-driven downloadable content for Dragon Age II. It can be played at any time after reaching Kirkwall and takes place before the events of the end game.',
   'L\'Héritage est un contenu téléchargeable scénarisé pour Dragon Age II. Il peut se jouer à tout moment une fois Kirkwall atteinte, et se déroule avant les événements de la fin du jeu.'],
  ['The backstory of Cassandra Pentaghast, a Seeker of Truth.',
   'Le passé de Cassandra Pentaghast, une Chercheuse de Vérité.'],
  ['The movie was released after the game as a backstory and knowing Cassandra\'s backstory before meeting her would unveil the mysteries.',
   'Le film est sorti après le jeu comme un récit des origines : connaître le passé de Cassandra avant de la rencontrer lèverait les mystères.'],
  ['King Alistair of Ferelden, Isabela, a pirate raider, and Varric Tethras, a merchant prince of Kirkwall, travel to Antiva City.',
   'Le roi Alistair de Férelden, Isabela, pirate et pilleuse, et Varric Tethras, prince marchand de Kirkwall, font route vers la cité d\'Antiva. VF dans le recueil Dragon Age (Intégrale Volume 1).'],
  ['Dragon Age: Those Who Speak is a three-part comic series by BioWare and Dark Horse Comics. The story expands on the plot told in Dragon Age: The Silent Grove, as King Alistair travels across Thedas to discover his father \'s fate.',
   'Dragon Age : Ceux Qui Parlent est une série de comics en trois parties de BioWare et Dark Horse Comics. L\'histoire prolonge l\'intrigue de Dragon Age : Le Bosquet Secret, tandis que le roi Alistair traverse Thédas pour découvrir le sort de son père. VF dans le recueil Dragon Age (Intégrale Volume 1).'],
  ['Dragon Age: Until We Sleep is a three-part comic series by BioWare and Dark Horse Comics. The story focuses on Varric and provides more insight on his past (with Alistair having been the focus of The Silent Grove and Isabela the focus of Those Who Speak ).',
   'Dragon Age : Jusqu\'à Ce Que Nous Dormions est une série de comics en trois parties de BioWare et Dark Horse Comics. L\'histoire se concentre sur Varric et éclaire son passé (Alistair étant au centre du Bosquet Secret et Isabela de Ceux Qui Parlent). VF dans le recueil Dragon Age (Intégrale Volume 1).'],
  ['A mystical killer stalks the halls of the White Spire, the heart of templar power in the mighty Orlesian Empire. To prove his innocence, Rhys reluctantly embarks on a journey into the western wastelands that will not only reveal much more than he bargained for but change the fate of his fellow mages forever.',
   'Un tueur mystique rôde dans les couloirs de la Flèche Blanche, cœur du pouvoir templier au sein du puissant Empire orlésien. Pour prouver son innocence, Rhys se lance à contrecœur dans un voyage vers les terres désolées de l\'ouest, qui lui révélera bien plus qu\'il ne l\'imaginait et changera à jamais le destin de ses semblables mages.'],
  ['It provides backstory for the mage-templar war, adds emotional context for the factions and doesn\'t spoil anything of the game unless the backstory of one companion but it\'s nothing really problematic.',
   'Il donne le contexte de la guerre des mages et des templiers, ajoute une charge émotionnelle aux factions et ne spoile rien du jeu, hormis le passé d\'un compagnon — rien de vraiment gênant.'],
  ['The Grey Wardens are heroes across Thedas once again: the Archdemon has been defeated with relative ease and the scattered darkspawn are being driven back underground. The Blight is over. Or so it seems. Valya, a young elven mage recently recruited into the Wardens, has been tasked with studying the historical record of previous Blights in order to gain insight into newly reported, and disturbing, darkspawn phenomena.',
   'Les Gardes des Ombres sont de nouveau des héros dans tout Thédas : l\'Archidémon a été vaincu assez facilement et les engeances dispersées sont repoussées sous terre. L\'Enclin est terminé. Du moins en apparence. Valya, une jeune mage elfe récemment recrutée par les Gardes, est chargée d\'étudier les archives des Enclins précédents afin d\'éclairer de nouveaux phénomènes, aussi inédits qu\'inquiétants, liés aux engeances.'],
  ['Enter an overgrown wilderness filled with Avvar, fiercely independent hunters who settled in the southern mountains of Thedas.',
   'Entrez dans une nature envahie par la végétation, peuplée d\'Avvars, des chasseurs farouchement indépendants installés dans les montagnes du sud de Thédas.'],
  ['Empress Celene of Orlais rose to the throne of the most powerful nation in Thedas through wisdom, wit, and ruthless manipulation. Now, the empire she has guided into an age of enlightenment is threatened from within by imminent war between the templars and the mages, even as rebellion stirs among the downtrodden elves. To save Orlais, Celene must keep her hold on the throne by any means necessary.',
   'L\'impératrice Célène d\'Orlaïs est montée sur le trône de la nation la plus puissante de Thédas à force de sagesse, d\'esprit et de manipulation impitoyable. Aujourd\'hui, l\'empire qu\'elle a conduit vers un âge de lumières est menacé de l\'intérieur par la guerre imminente entre templiers et mages, tandis que la révolte gronde chez les elfes opprimés. Pour sauver l\'Orlaïs, Célène doit se maintenir sur le trône par tous les moyens.'],
  ['Knowing the book\'s secrets gives your Warden an unnatural omniscience and influence your Inquisitor decisions, which can slightly break roleplay immersion if your character shouldn\'t know those details.',
   'Connaître les secrets du livre donne à votre Garde une omniscience contre nature et influence les décisions de votre Inquisiteur, ce qui peut légèrement casser l\'immersion si votre personnage n\'est pas censé connaître ces détails.'],
  ['Dragon Age: Magekiller is a comic from publisher Dark Horse by writer Greg Rucka. It tells the story, in several arcs, of the \'mage-killer\' Marius and his handler, Tessa Forsythia.',
   'Dragon Age: Magekiller est un comic paru chez Dark Horse, écrit par Greg Rucka. Il raconte, en plusieurs arcs, l\'histoire du « tueur de mages » Marius et de son intermédiaire, Tessa Forsythia.'],
  ['Dragon Age: Knight Errant is a five-part comic by BioWare and Dark Horse Comics. It tells the story of the elven thief Vaea, who arrives in Kirkwall just in time for the appointment of the city\'s latest Viscount, Varric Tethras.',
   'Dragon Age: Knight Errant est un comic en cinq parties de BioWare et Dark Horse Comics. Il raconte l\'histoire de la voleuse elfe Vaea, qui arrive à Kirkwall juste à temps pour la nomination du nouveau vicomte de la ville, Varric Tethras.'],
  ['Dragon Age: Deception is a three-part comic by BioWare and Dark Horse Comics. It tells the tale of Olivia Pryde, a failed actress turned con artist, as she targets the heir of a wealthy house, Calix Qintara.',
   'Dragon Age: Deception est un comic en trois parties de BioWare et Dark Horse Comics. Il raconte l\'histoire d\'Olivia Pryde, actrice ratée devenue arnaqueuse, qui prend pour cible l\'héritier d\'une riche maison, Calix Qintara.'],
  ['Dragon Age: Blue Wraith starts off with the fanatical Qunari seeking to topple the Tevinter magocracy. Caught in the middle, one powerful young mage ’s desperate search for her father brings her face-to-face with a notorious mage hunter— Fenris, the Blue Wraith.',
   'Dragon Age: Blue Wraith s\'ouvre sur les Qunari fanatiques cherchant à renverser la magocratie tévintide. Prise entre les deux camps, une jeune mage puissante part désespérément à la recherche de son père — et se retrouve face à un chasseur de mages redouté : Fenris, le Spectre Bleu.'],
  ['For Fenris\' latest adventure, he is joined by Inquisition agents to prepare for an assault on an unbreakable fortress in yet another effort to save Thedas from unimaginable horrors.',
   'Pour sa dernière aventure, Fenris est rejoint par des agents de l\'Inquisition afin de préparer l\'assaut d\'une forteresse imprenable, dans une nouvelle tentative de sauver Thédas d\'horreurs inimaginables.'],
  ['Ancient horrors. Marauding invaders. Powerful mages. And a world that refuses to stay fixed. Welcome to Thedas. From the stoic Grey Wardens to the otherworldly Mortalitasi necromancers, from the proud Dalish elves to the underhanded Antivan Crow assassins, Dragon Age is filled with monsters, magic, and memorable characters making their way through dangerous world whose only constant is change.',
   'Des horreurs anciennes. Des envahisseurs en maraude. Des mages puissants. Et un monde qui refuse de rester en place. Bienvenue à Thédas. Des stoïques Gardes des Ombres aux nécromanciens Mortalitasi venus d\'ailleurs, des fiers elfes dalatiens aux assassins retors des Corbeaux d\'Antiva, Dragon Age regorge de monstres, de magie et de personnages marquants qui avancent dans un monde dangereux dont la seule constante est le changement.'],
  ['Varric Tethras and Lace Harding descend into the abandoned Deep Roads beneath Marnas Pell in pursuit of a former friend.',
   'Varric Tethras et Lace Harding descendent dans les Tréfonds abandonnés sous Marnas Pell, à la poursuite d\'un ancien ami.'],
];
