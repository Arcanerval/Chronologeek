/* ═══ LE FRANÇAIS ÉCRIT DE BORDERLANDS ════════════════════════════════
   Trois listes, et la distinction compte.

   `BL_IDENTIQUES` — ce qui ne se traduit pas. Rien n'y est écrit, donc
   rien n'en repart à la relecture : les titres sans deux-points.

   `BL_RETROUVES` — vide : les noms français des DLC, ceux des versions
   françaises des jeux, sont dans `BL_TRADUCTIONS` avec le deux-points des
   titres. Relevés le 16 novembre 2026 sur le wiki Borderlands francophone
   (liens interlangues du wiki anglais) ; Wikipédia donne les mêmes pour
   Borderlands 2.

   `BL_TRADUCTIONS` — ce qui est vraiment écrit : l'accroche, les deux
   repères de lecture, ce qui est écarté, les quatre ères et les quatre ères
   de sortie, les six badges, la note de Dragon Keep et les neuf synopsis.
   **Les titres à deux-points y sont aussi** : le nom ne se traduit pas, la
   ponctuation si — c'est la règle de Star Trek.
   ═════════════════════════════════════════════════════════════════════ */

export const BL_IDENTIQUES = [
  'Borderlands',
  'Borderlands 2',
  'Borderlands 3',
  'Borderlands 4',
  'Tales from the Borderlands',
  'New Tales from the Borderlands',
  'Kairos',
  /* la page elle-même, et ce qui n'est pas du texte affiché */
  'Chronologeek — Borderlands (proto E)',
  'chronologeek-borderlands.json',
  'borderlands',
  'cg-proto-borderlands',
  'BL', 'jeu', 'dlc', 'video', 'roman', 'comic',
  '/images/borderlands.webp',
  '<span class="stn-k"><span class="code">BL</span>',
];

export const BL_RETROUVES = [];

export const BL_TRADUCTIONS = [
  /* ── les titres : le nom reste, le deux-points prend son espace ──── */
  ['Borderlands: The Zombie Island of Dr. Ned', 'Borderlands : The Zombie Island of Dr. Ned'],
  ['Borderlands: Mad Moxxi\'s Underdome Riot', 'Borderlands : Émeute dans l’Underdome de Mad Moxxi'],
  ['Borderlands: The Secret Armory of General Knoxx', 'Borderlands : L’Armurerie Secrète du Général Knoxx'],
  ['Borderlands: Claptrap\'s New Robot Revolution', 'Borderlands : Nouvelle Révolution'],
  ['Borderlands 2: Captain Scarlett and Her Pirate\'s Booty', 'Borderlands 2 : Le Capitaine Scarlett et son Butin de Pirate'],
  ['Borderlands 2: Mr. Torgue\'s Campaign of Carnage', 'Borderlands 2 : Le Carnage sanglant de Mr. Torgue'],
  ['Borderlands 2: Sir Hammerlock\'s Big Game Hunt', 'Borderlands 2 : La chasse au gros gibier de Sir Hammerlock'],
  ['+5 to Punching: A Bunkers & Badasses Prologue', '+5 to Punching : A Bunkers & Badasses Prologue'],
  ['Borderlands 2: Tiny Tina\'s Assault on Dragon Keep', 'Borderlands 2 : Tiny Tina et la Forteresse du Dragon'],
  ['Borderlands: The Pre-Sequel', 'Borderlands : The Pre-Sequel'],
  ['Borderlands: The Pre-Sequel - Claptastic Voyage', 'Borderlands : The Pre-Sequel - Claptastic Voyage'],
  ['Borderlands: The Pre-Sequel - The Holodome Onslaught', 'Borderlands : The Pre-Sequel - The Holodome Onslaught'],
  ['Borderlands: Debt or Alive', 'Borderlands : Debt or Alive'],
  ['Borderlands 2: Commander Lilith & the Fight for Sanctuary', 'Borderlands 2 : Commandant Lilith et la Bataille pour Sanctuary'],
  ['Borderlands 3: Moxxi\'s Heist of the Handsome Jackpot', 'Borderlands 3 : Le Casse du Beau Jackpot'],
  ['Borderlands 3: Guns, Love, and Tentacles', 'Borderlands 3 : Flingues, Amour et Tentacules'],
  ['Borderlands 3: Bounty of Blood', 'Borderlands 3 : Une prime sanglante'],
  ['Borderlands 3: Psycho Krieg and the Fantastic Fustercluck', 'Borderlands 3 : Krieg le Sadique et l’Incroyable Butin de Pordel'],
  ['Borderlands 3: Director\'s Cut - Mysteriouslier', 'Borderlands 3 : Director\'s Cut - Mysteriouslier'],
  ['Borderlands: Moxxi\'s Mysterious Memento', 'Borderlands : Moxxi\'s Mysterious Memento'],
  ['Vex: Purple Friday', 'Vex : Purple Friday'],
  ['Rafa: YOLT', 'Rafa : YOLT'],
  ['Amon: Demons', 'Amon : Demons'],
  ['Harlowe: Family Reunion', 'Harlowe : Family Reunion'],
  ['C4SH: High Roller', 'C4SH : High Roller'],
  ['Loveless: Uncontainable', 'Loveless : Uncontainable'],
  ['Borderlands 4: Mad Ellie and the Vault of the Damned', 'Borderlands 4 : Mad Ellie and the Vault of the Damned'],
  ['Borderlands 4: FL4K and the Last Resort', 'Borderlands 4 : FL4K and the Last Resort'],

  /* ── l'accroche, et les deux repères de lecture ──────────────────── */
  ['If you’re here it’s because you want to discover or rediscover Borderlands in chronological '
   + 'order. This guide is spoiler free like the others.',
   'Si vous êtes ici, c’est que vous voulez découvrir ou redécouvrir Borderlands dans l’ordre '
   + 'chronologique. Ce guide est sans spoiler, comme les autres.'],
  ['This guide works for first plays or replays.',
   'Ce guide convient aussi bien à une première partie qu’à une nouvelle.'],
  ['Calendar', 'Le calendrier'],
  ['The official calendar used in Borderlands is never stated: old Facebook pages talked about '
   + 'the year 2854, we see a calendar in a DLC saying 109 AE (After Expansion? Actual Era?) but in '
   + 'another game we learn that a planet has humans on it since at least 1000 years so we can’t '
   + 'have a real date. But we know how much time passes between each games so instead, we’ll count '
   + 'from the first game, which takes place in Year 0, and date every other piece of media in '
   + 'years after it.',
   'Le calendrier officiel de Borderlands n’est jamais donné : d’anciennes pages Facebook '
   + 'parlaient de l’année 2854, on voit dans un DLC un calendrier qui indique 109 AE (After '
   + 'Expansion ? Actual Era ?), mais dans un autre jeu on apprend qu’une planète est habitée '
   + 'par des humains depuis au moins 1000 ans : impossible donc d’avoir une vraie date. On sait '
   + 'en revanche combien de temps passe entre chaque jeu : on compte donc à partir du premier '
   + 'jeu, qui se déroule en An 0, et chaque autre œuvre est datée en années après lui.'],
  ['Character choices', 'Le choix des personnages'],
  ['The 4 (sometimes more with the DLC) Vault Hunters that you can choose from at the beginning '
   + 'of each game are ALL canonically present through the events of the story, even if you play '
   + 'solo, they all participate in the official canon. You will cross over them multiple times '
   + 'so even if you play solo remind yourself of the other characters, some can be VERY important '
   + 'sometimes after (even the DLC ones!).',
   'Les 4 Chasseurs de l’Arche (parfois plus avec les DLC) que vous pouvez choisir au début de '
   + 'chaque jeu sont TOUS présents dans le canon tout au long de l’histoire : même si vous jouez '
   + 'en solo, ils participent tous au canon officiel. Vous les recroiserez plusieurs fois, donc '
   + 'même en solo, gardez en tête les autres personnages : certains peuvent devenir TRÈS '
   + 'importants par la suite (même ceux des DLC !).'],

  /* ── ce qui n'y est pas ──────────────────────────────────────────── */
  ['What’s left out and why?', 'Ce qui n’y est pas, et pourquoi ?'],
  ['Borderlands movie', 'Le film Borderlands'],
  ['Its own universe.', 'Son propre univers.'],
  ['Mobile games', 'Les jeux mobiles'],
  ['Not canon and/or not available anymore.', 'Pas canon et/ou plus disponibles.'],
  ['Tiny Tina&#x27;s Wonderlands and its sequel comic', 'Tiny Tina’s Wonderlands et sa suite en comic'],
  ['Revolves around Tina playing a sort of Dungeons &amp; Dragons with other characters, has no '
   + 'incidence on the games story and the &quot;real world&quot; but you can play it after her '
   + 'Borderlands 2 DLC if you really liked the setting.',
   'Tina y joue à une sorte de Donjons &amp; Dragons avec d’autres personnages, sans incidence '
   + 'sur l’histoire des jeux et le « vrai monde », mais vous pouvez y jouer après son DLC de '
   + 'Borderlands 2 si vous avez vraiment aimé l’univers.'],
  ['All the DLC that have very little to no story, events, Bounty Packs, Raid Bosses',
   'Tous les DLC qui n’ont que peu ou pas d’histoire, les événements, les Bounty Packs, les Raid Bosses'],
  ['Do them after their main game.', 'Faites-les après leur jeu principal.'],
  ['The Fall of Fyrestone and Tannis &amp; the Vault comics',
   'Les comics The Fall of Fyrestone et Tannis &amp; the Vault'],
  ['Retelling of the first game.', 'Ils racontent à nouveau le premier jeu.'],
  ['Origins comic and the three novels about the first game characters',
   'Le comic Origins et les trois romans sur les personnages du premier jeu'],
  ['Not considered officially canon by Gearbox, could be soft canon.',
   'Gearbox ne les considère pas comme officiellement canon, ils pourraient l’être à moitié.'],

  /* ── les quatre ères ──────────────────────────────────────────────── */
  ['Welcome to Pandora', 'Bienvenue sur Pandore'],
  ['Handsome Jack', 'Le Beau Jack'],
  ['Children of the Vault', 'Descendants de l’Arche'],
  ['ERA 1', 'ÈRE 1'], ['ERA 2', 'ÈRE 2'], ['ERA 3', 'ÈRE 3'], ['ERA 4', 'ÈRE 4'],

  ['Watch the video', 'Regarder la vidéo'],


  /* ── les deux notes de placement ─────────────────────────────────── */
  ['During Tales from the Borderlands Episodes 1-3',
   'Pendant Tales from the Borderlands, épisodes 1 à 3'],
  ['You can play them after The Pre-Sequel\'s intro if you don\'t want to wait many hours before '
   + 'finishing it, it happens at the same time',
   'Vous pouvez y jouer après l’introduction de The Pre-Sequel si vous ne voulez pas attendre des '
   + 'heures avant de le finir : ils se déroulent en même temps'],

  /* ── les neuf synopsis : sept vidéos, le roman et le comic ───────── */
  ['A short animated prologue to Tiny Tina’s tabletop game: before the dice start rolling, Brick, '
   + 'Mordecai and Lilith get their characters ready.',
   'Un court prologue animé à la partie de jeu de rôle de Tiny Tina : avant que les dés ne '
   + 'roulent, Brick, Mordecai et Lilith préparent leurs personnages.'],
  ['Fiona and Sasha, the con-artist sisters from Tales from the Borderlands, are back on Pandora '
   + 'with a fortune to spend and a long list of people who would like a piece of it — or of them.',
   'Fiona et Sasha, les deux sœurs arnaqueuses de Tales from the Borderlands, sont de retour sur '
   + 'Pandore avec une fortune à dépenser et une longue liste de gens qui en voudraient bien une '
   + 'part — ou leur peau.'],
  ['Moxxi sends the Siren Amara after a mysterious keepsake from her past, on a road trip across '
   + 'Pandora that nobody is quite prepared for.',
   'Moxxi lance la Sirène Amara sur la piste d’un mystérieux souvenir de son passé, dans un '
   + 'road trip à travers Pandore auquel personne n’est vraiment préparé.'],
  ['An official character short introducing Vex, one of the four new Vault Hunters, before the '
   + 'events of Borderlands 4.',
   'Un court métrage officiel qui présente Vex, l’un des quatre nouveaux Chasseurs de l’Arche, '
   + 'avant les événements de Borderlands 4.'],
  ['An official character short introducing Rafa, one of the four new Vault Hunters, before the '
   + 'events of Borderlands 4.',
   'Un court métrage officiel qui présente Rafa, l’un des quatre nouveaux Chasseurs de l’Arche, '
   + 'avant les événements de Borderlands 4.'],
  ['An official character short introducing Amon, one of the four new Vault Hunters, before the '
   + 'events of Borderlands 4.',
   'Un court métrage officiel qui présente Amon, l’un des quatre nouveaux Chasseurs de l’Arche, '
   + 'avant les événements de Borderlands 4.'],
  ['An official character short introducing Harlowe, one of the four new Vault Hunters, before '
   + 'the events of Borderlands 4.',
   'Un court métrage officiel qui présente Harlowe, l’un des quatre nouveaux Chasseurs de '
   + 'l’Arche, avant les événements de Borderlands 4.'],
  ['An official character short introducing C4SH, the Vault Hunter of the first Borderlands 4 '
   + 'story pack.',
   'Un court métrage officiel qui présente C4SH, le Chasseur de l’Arche du premier pack '
   + 'd’histoire de Borderlands 4.'],
  ['An official character short introducing Loveless, the Vault Hunter of the second Borderlands '
   + '4 story pack.',
   'Un court métrage officiel qui présente Loveless, la Chasseuse de l’Arche du second pack '
   + 'd’histoire de Borderlands 4.'],

  /* ── les synopsis des DLC sans fiche RAWG complète ── */
  ['Rhys, a Hyperion company man with big ambitions, and Fiona, a Pandoran con artist, each tell their own version of the same deal gone wrong: a fake Vault Key, ten million dollars and a chase across Pandora.',
   'Rhys, un cadre d’Hyperion aux grandes ambitions, et Fiona, une arnaqueuse de Pandore, racontent chacun leur version de la même affaire qui tourne mal : une fausse clé de l’Arche, dix millions de dollars et une course-poursuite à travers Pandore.'],
  ['Dr. Ned’s experiments have turned the people of Jakobs Cove into zombies, and the Vault Hunters are called in to clean up the mess.',
   'Les expériences du Dr Ned ont changé les habitants de Jakobs Cove en zombies, et les Chasseurs de l’Arche sont appelés pour réparer les dégâts.'],
  ['Mad Moxxi opens her arenas: in three Underdomes, the Vault Hunters fight wave after wave of enemies for glory and loot.',
   'Mad Moxxi ouvre ses arènes : dans trois Underdomes, les Chasseurs de l’Arche affrontent vague après vague d’ennemis, pour la gloire et le butin.'],
  ['The Vault Hunters set out to raid the secret armory of the Atlas corporation, guarded by General Knoxx and his Crimson Lance.',
   'Les Chasseurs de l’Arche partent piller l’armurerie secrète de la société Atlas, gardée par le général Knoxx et sa Lance Écarlate.'],
  ['A rogue Claptrap leads a robot uprising across Pandora, and the Vault Hunters have to stop the revolution before every Claptrap joins in.',
   'Un Claptrap devenu incontrôlable mène une révolte des robots à travers Pandore, et les Chasseurs de l’Arche doivent l’arrêter avant que tous les Claptrap s’y joignent.'],
  ['Captain Scarlett, a pirate queen of the sand seas, recruits the Vault Hunter to find a legendary treasure buried in the desert of Oasis.',
   'Le capitaine Scarlett, reine pirate des mers de sable, recrute le Chasseur de l’Arche pour trouver un trésor légendaire enfoui dans le désert d’Oasis.'],
  ['Mr. Torgue invites the Vault Hunter to a tournament of explosions and arena fights to crown the greatest badass on Pandora.',
   'Mr. Torgue invite le Chasseur de l’Arche à un tournoi d’explosions et de combats d’arène pour couronner le plus grand dur à cuire de Pandore.'],
  ['Sir Hammerlock takes the Vault Hunter hunting in the swamps of Aegrus, where a mad professor has plans of his own.',
   'Sir Hammerlock emmène le Chasseur de l’Arche chasser dans les marais d’Aegrus, où un professeur fou a ses propres projets.'],
  ['Tiny Tina runs a game of Bunkers & Badasses for Lilith, Mordecai and Brick: a fantasy adventure straight out of her imagination, with knights, dragons and skeletons.',
   'Tiny Tina mène une partie de Bunkers & Badasses pour Lilith, Mordecai et Brick : une aventure de fantasy sortie tout droit de son imagination, avec chevaliers, dragons et squelettes.'],
  ['The Vault Hunters are digitized and sent inside Claptrap’s mind, a world of glitches and buried memories, to retrieve a program hidden in it.',
   'Les Chasseurs de l’Arche sont numérisés et envoyés dans l’esprit de Claptrap, un monde de bugs et de souvenirs enfouis, pour y récupérer un programme caché.'],
  ['An arena challenge: the Vault Hunters face wave after wave of enemies in the Holodome, a holographic battle arena.',
   'Un défi d’arène : les Chasseurs de l’Arche affrontent vague après vague d’ennemis dans l’Holodome, une arène de combat holographique.'],
  ['Sir Hammerlock and Wainwright Jakobs are getting married on a frozen planet, but the lodge they picked for the ceremony is haunted by a cult that worships an ancient Vault monster.',
   'Sir Hammerlock et Wainwright Jakobs se marient sur une planète gelée, mais le pavillon choisi pour la cérémonie est hanté par une secte qui vénère un ancien monstre de l’Arche.'],
  ['A Western on the desert planet Gehenna: the Vault Hunter rides into a frontier town that a ruthless gang, the Devil Riders, is trying to bring to its knees.',
   'Un western sur la planète désertique Gehenna : le Chasseur de l’Arche arrive dans une ville de la frontière qu’un gang sans pitié, les Devil Riders, veut mettre à genoux.'],
  ['The Vault Hunters dive into the fractured mind of Krieg the Psycho to dig up a secret buried deep inside it, fighting his inner demons along the way.',
   'Les Chasseurs de l’Arche plongent dans l’esprit fracturé de Krieg le Sadique pour y déterrer un secret enfoui, en affrontant ses démons intérieurs.'],
  ['A new murder-mystery story mission, Mysteriouslier: Horror at Scryer’s Crypt, plus a Vault Card and behind-the-scenes content from the developers.',
   'Une nouvelle mission d’histoire en forme d’enquête criminelle, Mysteriouslier: Horror at Scryer’s Crypt, avec une Vault Card et des coulisses racontées par les développeurs.'],
  ['The first Borderlands 4 story pack: Mad Ellie drags the Vault Hunters into a cosmic-horror Vault, and a new Vault Hunter, C4SH, joins them.',
   'Le premier pack d’histoire de Borderlands 4 : Mad Ellie entraîne les Chasseurs de l’Arche dans une Arche d’horreur cosmique, et un nouveau Chasseur, C4SH, les rejoint.'],
  ['The second Borderlands 4 story pack: FL4K is back, at the Last Resort, and a new Vault Hunter, Loveless, joins the roster.',
   'Le second pack d’histoire de Borderlands 4 : FL4K est de retour, au Last Resort, et une nouvelle Chasseuse de l’Arche, Loveless, rejoint l’équipe.'],

  /* ── les sept badges ─────────────────────────────────────────────── */
  ['Vault Hunter', 'Chasseur de l’Arche'],
  ['Welcome to Pandora completed', 'Bienvenue sur Pandore terminé'],
  ['Sanctuary Citizen', 'Citoyen de Sanctuary'],
  ['Handsome Jack completed', 'Le Beau Jack terminé'],
  ['Crimson Raider', 'Crimson Raider'],
  ['Children of the Vault completed', 'Descendants de l’Arche terminé'],
  ['Kairos Breakout', 'L’évasion de Kairos'],
  ['Kairos completed', 'Kairos terminé'],
  ['Season Pass', 'Season Pass'],
  ['Every DLC played', 'Tous les DLC joués'],
  ['Claptrap’s Best Friend', 'Meilleur ami de Claptrap'],
  ['Borderlands 100% completed', 'Borderlands terminé à 100 %'],

  /* ── le reste du gabarit, propre à cet univers ───────────────────── */
  ['Reset your Borderlands progress?', 'Réinitialiser votre progression Borderlands ?'],
  ['Games · DLC · Videos · Book · Comic', 'Jeux · DLC · Vidéos · Roman · Comic'],
  ['Games · DLC · Videos · Book · Comic — the whole Borderlands saga in its most optimized order.',
   'Jeux · DLC · Vidéos · Roman · Comic — toute la saga Borderlands dans son ordre le plus optimisé.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse and '
   + 'Borderlands are trademarks of their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse et '
   + 'Borderlands sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet '
   + 'de fan indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse and '
   + 'Borderlands are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse et '
   + 'Borderlands sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet '
   + 'de fan indépendant.'],
  /* les cases du tableau du premier écran */
  ['Games', 'Jeux'],
  ['Videos', 'Vidéos'],
  ['Book', 'Roman'],
  // le plan de métro
  ['Borderlands line map', 'Plan de la ligne Borderlands'],
  ['Borderlands line complete', 'Ligne Borderlands terminée'],
  ['<p><b>Terminus</b><span>End of the Borderlands line ·', '<p><b>Terminus</b><span>Fin de la ligne Borderlands ·'],

  /* l'ordre de sortie : l'accroche et les quatre ères de production */
  ['This guide follows the order the works came out, from 2009 to today, but you can switch back to a chronological version higher up.',
   'Ce guide suit ici l’ordre de sortie des œuvres, de 2009 à aujourd’hui, mais vous pouvez repasser à une version chronologique plus haut.'],
  ['Borderlands · 2009-2010', 'Borderlands · 2009-2010'],
  ['Borderlands 2 · 2012-2015', 'Borderlands 2 · 2012-2015'],
  ['Borderlands 3 · 2019-2022', 'Borderlands 3 · 2019-2022'],
  ['Borderlands 4 · 2024-2026', 'Borderlands 4 · 2024-2026'],
];

export const BL_GABARITS = [
  [/^Updated · (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
    m => `Mis à jour · ${({ January: 'janvier', February: 'février', March: 'mars', April: 'avril',
      May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre',
      October: 'octobre', November: 'novembre', December: 'décembre' })[m[1]]} ${m[2]}`],
  [/^Episodes (\d+)-(\d+)$/, m => `Épisodes ${m[1]}-${m[2]}`],
  [/^Episode (\d+)$/, m => `Épisode ${m[1]}`],
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
  [/^(\d+) entries$/, m => `${m[1]} entrées`],
];

/* Les dates du monde, comptées depuis le premier jeu (Year 0), tranché par
   Niko le 19 novembre 2026 : « Year 6 » → « An 6 », « Year 2 & 6 » →
   « An 2 et 6 » (The Pre-Sequel, deux périodes), « ~Year 14-16 » → « ~An 14-16 ».
   Une date que la fonction ne reconnaît pas fait échouer la traduction. */
export function BL_DATE(d) {
  const m = /^(~?)Year (\d+(?:-\d+)?(?: & \d+)?)$/.exec(d);
  if (m) return m[1] + 'An ' + m[2].replace(' & ', ' et ');
  throw new Error('date Borderlands non reconnue : ' + d);
}
