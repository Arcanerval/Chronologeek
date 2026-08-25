/* ═══ CE QU'IL A FALLU ÉCRIRE POUR ASSASSIN'S CREED ══════════════════
   Tout le reste — navigation, pied de page, filtres, progression,
   badges génériques — est retrouvé dans les douze autres protos par
   `traduire-assassinscreed.mjs`. Ne vit ici que ce qui est propre à cet
   univers et n'existe nulle part ailleurs en français.

   Trois listes :

   - `AC_IDENTIQUES` — ce qui s'écrit pareil dans les deux langues.
     Rien n'y est écrit, donc rien n'en repart à la relecture.
   - `AC_TRADUCTIONS` — ce qui est écrit, et se relit : les titres, les
     notes de placement de Niko, les synopsis, l'accroche, les sept
     sagas, les badges.
   - `AC_GABARITS` — les formes : les sept « SAGA N ».

   LES TITRES SUIVENT L'ÉDITION FRANÇAISE, PAS UNE TRADUCTION. Vérifié
   œuvre par œuvre sur les deux wikis et chez les éditeurs :
   « The Secret Crusade » est paru chez Milady sous « La Croisade
   secrète », mais « Forsaken », « Underworld » et « Heresy » ont gardé
   leur titre anglais chez le même éditeur. Même chose côté jeu :
   « Freedom Cry » s'appelle « Le Prix de la Liberté » dans la VF,
   « Dead Kings » et « The Hidden Ones » n'ont jamais été traduits.
   Ne rien inventer ici — si l'édition française n'existe pas, le titre
   reste anglais.

   L'ESPACE AVANT LE DEUX-POINTS EST LA RÈGLE DU SITE. C'est celle qui
   a été tranchée pour Star Trek : « Star Trek : Voyager » et « Star
   Trek : La Nouvelle Génération » sur la même page, et pas l'un collé
   à côté de l'autre. Les quatre-vingt-dix-neuf titres d'Assassin's
   Creed la suivent, y compris ceux qui restent en anglais. Ubisoft, de
   son côté, n'écrit pas de deux-points du tout — « Assassin's Creed
   Odyssey » — mais c'est la forme du document de Niko qui fait foi
   pour la structure du titre, et elle en porte un.

   ══════════════════════════════════════════════════════════════════ */

/* ── ce qui ne bouge pas ─────────────────────────────────────────── */
export const AC_IDENTIQUES = [
  /* techniques : clés de stockage, classes, chemins, types de médias.
     `jeu`, `dlc`, `roman` et `comic` sont des valeurs de données, pas
     des libellés — la page les rend par `CG.t`, qui est traduit. */
  'assassinscreed', 'cg-proto-assassinscreed', 'chronologeek-assassinscreed.json',
  '/images/acuniverse.webp', '#6fd0e8', '#s-',
  'jeu', 'dlc', 'roman', 'comic', 'bau', 'AUDIO',

  /* Le nom de la franchise, tel qu'il s'écrit partout. */
  'Assassin’s Creed',
  'Assassin\'s Creed',
  'Assassin\'s Creed II',
  'Assassin\'s Creed III',
  'Chronologeek — Assassin’s Creed (proto E)',

  /* Repères de lecture : les deux mots sont employés tels quels en
     français, et le badge FLASHBACK l'est déjà sur les autres pages. */
  'FLASHFORWARD',

  /* Titres sans édition française — vérifiés un par un. Ils gardent
     aussi leur ponctuation : aucun deux-points à espacer. */
  'Benedict Arnold',
  'Assassin\'s Creed III - Abstergo Hacked',
  'Assassin\'s Creed FCBD 2016 - Great Wall',
  'Assassin\'s Creed FCBD 2016 - The Chair',
  'Dead Kings',
  'The Hidden Ones',
  /* Le DLC de Shadows garde son nom anglais — décision de Niko,
     25 août 2026 —, alors que la presse française écrit « Les Griffes
     d'Awaji ». */
  'Claws of Awaji',

  /* Les noms de ceux qui revivent les souvenirs : réponses de la FAQ,
     un nom propre chacune. Ce qui les entoure — « Probably », « Random
     Abstergo employee » — est traduit, eux ne bougent pas. */
  'Desmond Miles', 'Juhani Otso Berg', 'Daniel Cross', 'Jot Soora',
  'Robert Fraser', 'Charlotte de la Cruz', 'Owen Meyers', 'Sean Molloy',
  'Simon Hathaway', 'Callum Lynch', 'Layla Hassan', 'Maxime Gorm',
  'Tomo Sakagawa', 'Basim', 'Joey', 'Noa Kim',
];

/* ── ce qui est écrit ────────────────────────────────────────────── */
export const AC_TRADUCTIONS = [

  /* ════ LES SEPT SAGAS ═════════════════════════════════════════ */
  ['Altaïr Saga', 'Saga d\'Altaïr'],
  ['Ezio Saga', 'Saga d\'Ezio'],
  ['Kenway Saga', 'Saga des Kenway'],
  ['Helix & Abstergo Saga', 'Saga Helix & Abstergo'],
  ['Layla Hassan Saga', 'Saga de Layla Hassan'],
  ['Animus Hub Saga', 'Saga de l\'Animus Hub'],
  ['Assassins Through History Saga', 'Saga des Assassins à travers l\'Histoire'],

  /* ════ LES TITRES ═════════════════════════════════════════════
     Ordre de la timeline. Trois cas : l'édition française existe et on
     la reprend ; elle n'existe pas et le titre reste anglais, espacé ;
     c'est une mission ou une extension et c'est la VF du jeu qui
     tranche. */

  /* — saga d'Altaïr — */
  ['Assassin\'s Creed: Altaïr\'s Chronicles', 'Assassin\'s Creed : Altaïr\'s Chronicles'],
  ['Assassin\'s Creed: Bloodlines', 'Assassin\'s Creed : Bloodlines'],

  /* — saga d'Ezio — */
  ['Assassin\'s Creed: Lineage', 'Assassin\'s Creed : Lineage'],
  ['Assassin\'s Creed II: Discovery', 'Assassin\'s Creed II : Discovery'],
  ['Assassin\'s Creed: Ascendance', 'Assassin\'s Creed : Ascendance'],
  ['Assassin\'s Creed: Brotherhood', 'Assassin\'s Creed : Brotherhood'],
  /* VF du jeu : le DLC de Brotherhood s'appelle « La Disparition de
     Da Vinci ». */
  ['The Da Vinci Disappearance', 'La Disparition de Da Vinci'],
  /* Milady, 2011. */
  ['Assassin’s Creed: The Secret Crusade', 'Assassin\'s Creed : La Croisade secrète'],
  ['Assassin\'s Creed: Revelations', 'Assassin\'s Creed : Revelations'],
  ['Assassin\'s Creed: Brotherhood & Revelations - Animi Training Program',
    'Assassin\'s Creed : Brotherhood & Revelations - Programme d\'entraînement Animus'],
  /* VF du jeu : le DLC de Revelations s'appelle « L'Archive perdue ». */
  ['The Lost Archive', 'L\'Archive perdue'],
  ['Assassin\'s Creed: Embers', 'Assassin\'s Creed : Embers'],
  ['Assassin\'s Creed Chronicles: China', 'Assassin\'s Creed Chronicles : China'],
  ['Assassin\'s Creed: The Fall', 'Assassin\'s Creed : The Fall'],
  ['Assassin\'s Creed Chronicles: Russia', 'Assassin\'s Creed Chronicles : Russia'],
  ['Assassin\'s Creed: The Chain', 'Assassin\'s Creed : The Chain'],

  /* — saga des Kenway — */
  ['The Tyranny of King Washington', 'La Tyrannie du Roi Washington'],
  ['Assassin’s Creed: Forsaken', 'Assassin\'s Creed : Forsaken'],
  ['Assassin\'s Creed III: Liberation', 'Assassin\'s Creed III : Liberation'],
  ['Assassin\'s Creed IV: Black Flag - Aveline', 'Assassin\'s Creed IV : Black Flag - Aveline'],
  ['Assassin\'s Creed IV: Black Flag', 'Assassin\'s Creed IV : Black Flag'],
  ['Assassin\'s Creed IV Black Flag: Blackbeard – The Lost Journal',
    'Assassin\'s Creed IV Black Flag : Barbe Noire - Le journal perdu'],
  /* VF du jeu : « Freedom Cry » est « Le Prix de la Liberté » dans
     Black Flag comme dans le jeu autonome. */
  ['Freedom Cry', 'Le Prix de la Liberté'],
  ['Assassin\'s Creed: Brahman', 'Assassin\'s Creed : Brahman'],
  ['Assassin\'s Creed Chronicles: India', 'Assassin\'s Creed Chronicles : India'],
  /* Panini a publié le tome 2 sous « Croix de guerre ». Le tome 1
     n'apparaît nulle part en français : « Black Cross » reste tel
     quel — décision de Niko, 25 août 2026 — et seule la numérotation
     s'aligne sur celle du tome 2. */
  ['Assassin’s Creed: Templars - Black Cross', 'Assassin\'s Creed Templars, tome 1 : Black Cross'],
  ['Assassin\'s Creed: Rogue', 'Assassin\'s Creed : Rogue'],

  /* — saga Helix & Abstergo — */
  ['Assassin\'s Creed: Unity', 'Assassin\'s Creed : Unity'],
  ['Assassin\'s Creed Unity: Abstergo Entertainment: Employee Handbook',
    'Assassin\'s Creed Unity : Abstergo Entertainment, manuel de l\'employé'],
  ['Assassin\'s Creed: Syndicate', 'Assassin\'s Creed : Syndicate'],
  ['The Last Maharaja', 'Le Dernier Maharaja'],
  ['Jack the Ripper', 'Jack l\'Éventreur'],
  ['Assassin\'s Creed Chronicles: Russia - Secret Ending',
    'Assassin\'s Creed Chronicles : Russia - Fin secrète'],
  ['Assassin’s Creed: Underworld', 'Assassin\'s Creed : Underworld'],
  /* La série « The Engine of History » n'a qu'un tome traduit. */
  ['Assassin\'s Creed: The Engine of History – The Magus Conspiracy',
    'Assassin\'s Creed : La Conspiration du Mage'],
  ['Assassin\'s Creed: The Engine of History – The Resurrection Plot',
    'Assassin\'s Creed : The Resurrection Plot'],
  /* Panini : la série Titan « Assassin's Creed » paraît en France sous
     le seul nom de la franchise, numérotée par tomes. */
  ['Assassin\'s Creed: Assassins - Trial by Fire', 'Assassin\'s Creed, tome 1 : L\'Épreuve du feu'],
  ['Assassin\'s Creed: Assassins - Setting Sun', 'Assassin\'s Creed, tome 2 : Soleil couchant'],
  ['Assassin\'s Creed: Assassins - Homecoming', 'Assassin\'s Creed, tome 3 : Retour aux sources'],
  ['Assassin\'s Creed: Templars - Cross of War', 'Assassin\'s Creed Templars, tome 2 : Croix de guerre'],
  ['Assassin\'s Creed: Last Descendants', 'Assassin\'s Creed : Last Descendants'],
  ['Assassin\'s Creed: Last Descendants - Locus', 'Assassin\'s Creed : Last Descendants - Locus'],
  ['Assassin\'s Creed: Heresy', 'Assassin\'s Creed : Heresy'],
  ['Assassin\'s Creed: Last Descendants – Tomb of the Khan',
    'Assassin\'s Creed Last Descendants : La Tombe du Khan'],
  ['Assassin\'s Creed: Last Descendants – Fate of the Gods',
    'Assassin\'s Creed Last Descendants : La Chute des dieux'],
  ['Assassin\'s Creed: Reflections', 'Assassin\'s Creed : Reflections'],
  /* Uprising paraît en France en tomes numérotés. Le tome 1 n'a pas de
     sous-titre français, le tome 2 s'appelle « La Croisée des
     Chemins », et le tome 3 n'est pas encore traduit : il garde donc
     son sous-titre anglais. Les trois formes viennent de Niko,
     25 août 2026. */
  ['Assassin\'s Creed: Uprising - Common Ground', 'Assassin\'s Creed Uprising : Tome 1'],
  ['Assassin\'s Creed: Uprising - Inflection Point', 'Assassin\'s Creed Uprising : Tome 2 - La Croisée des Chemins'],
  ['Assassin\'s Creed: Uprising - Finale', 'Assassin\'s Creed : Uprising - Finale'],

  /* — saga de Layla Hassan — */
  ['Assassin\'s Creed Origins: Desert Oath', 'Assassin\'s Creed Origins : Le Serment du désert'],
  ['Assassin\'s Creed: Origins', 'Assassin\'s Creed : Origins'],
  ['The Curse of the Pharaohs', 'La Malédiction des pharaons'],
  /* « Conspirations » est une série française d'origine, chez Les Deux
     Royaumes : c'est l'anglais qui en est la traduction. */
  ['Assassin\'s Creed: Conspiracies - Die Glocke', 'Assassin\'s Creed Conspirations, tome 1 : Die Glocke'],
  ['Assassin\'s Creed: Conspiracies - Project Rainbow',
    'Assassin\'s Creed Conspirations, tome 2 : Le Projet Rainbow'],
  ['Assassin\'s Creed: Bloodstone', 'Assassin\'s Creed : Bloodstone'],
  ['Assassin\'s Creed: Odyssey', 'Assassin\'s Creed : Odyssey'],
  /* VF du jeu, épisode par épisode. */
  ['Legacy of the First Blade - Hunted', 'L\'Héritage de la Première lame - La traque'],
  ['Legacy of the First Blade - Shadow Heritage', 'L\'Héritage de la Première lame - L\'héritage de l\'ombre'],
  ['Legacy of the First Blade - Bloodline', 'L\'Héritage de la Première lame - Lignée'],
  ['Assassin\'s Creed: Odyssey - The Lost Tales of Greece: The Heir of Memories',
    'Assassin\'s Creed : Odyssey - Les contes perdus de Grèce : L\'Héritière des souvenirs'],
  ['The Fate of Atlantis', 'Le Sort de l\'Atlantide'],
  /* Aucune VF trouvée sur les deux wikis ni chez Ubisoft : le titre
     français est celui de Niko, 25 août 2026. */
  ['Those Who Are Treasured', 'Ceux qui sont précieux'],
  ['Assassin\'s Creed: Gold', 'Assassin\'s Creed : Gold'],
  ['Assassin\'s Creed: Valhalla – Song of Glory', 'Assassin\'s Creed Valhalla : Le Chant de gloire'],
  ['Assassin\'s Creed: Valhalla', 'Assassin\'s Creed : Valhalla'],
  ['Assassin\'s Creed: Valhalla – Blood Brothers', 'Assassin\'s Creed Valhalla : Blood Brothers'],
  ['Assassin\'s Creed: Valhalla – Geirmund\'s Saga', 'Assassin\'s Creed Valhalla : La Saga de Geirmund'],
  /* La bande dessinée paraît en France sous le seul nom de la série,
     avec le sous-titre de l'album — « Les Convertis ». */
  ['Assassin\'s Creed: Valhalla – The Hidden Codex', 'Assassin\'s Creed : Valhalla (Les Convertis)'],
  ['Assassin\'s Creed: Valhalla – Sword of the White Horse',
    'Assassin\'s Creed Valhalla : L\'Épée du cheval blanc'],
  ['Wrath of the Druids', 'La Colère des Druides'],
  ['The Siege of Paris', 'Le Siège de Paris'],
  ['Assassin\'s Creed: Valhalla - Forgotten Myths', 'Assassin\'s Creed Valhalla : Les Mythes oubliés'],
  ['Dawn of Ragnarök', 'L\'Aube du Ragnarök'],
  ['Assassin\'s Creed: Escape Room Puzzle Book', 'Assassin\'s Creed : Escape Game'],
  ['Assassin\'s Creed: Mirage', 'Assassin\'s Creed : Mirage'],
  ['Valley of Memories', 'Vallée de la mémoire'],
  ['Assassin\'s Creed: Mirage – Daughter of No One', 'Assassin\'s Creed Mirage : La Fille de Personne'],
  ['Assassin\'s Creed: Mirage - A Soar of Eagles', 'Assassin\'s Creed Mirage : A Soar of Eagles'],
  ['Assassin\'s Creed: The Golden City', 'Assassin\'s Creed : La Cité Dorée'],
  /* Ce n'est pas un roman mais un livre-jeu, et il paraît en France
     dans la collection « Le livre dont vous êtes l'Assassin ». */
  ['Assassin\'s Creed: The Silk Road',
    'Assassin\'s Creed - Le livre dont vous êtes l\'Assassin : La Route de la soie'],

  /* — saga de l'Animus Hub — */
  ['Assassin\'s Creed: Forgotten Temple', 'Assassin\'s Creed : Forgotten Temple'],
  ['Assassin\'s Creed: Nexus VR', 'Assassin\'s Creed : Nexus VR'],
  ['Assassin\'s Creed: Shadows', 'Assassin\'s Creed : Shadows'],
  ['Assassin\'s Creed: Shadows – Tales of Iga', 'Assassin\'s Creed Shadows : Les Légendes d\'Iga'],
  ['Assassin\'s Creed: Black Flag Resynced', 'Assassin\'s Creed : Black Flag Resynced'],

  /* — saga des Assassins à travers l'Histoire — */
  ['Assassin\'s Creed: Dynasty', 'Assassin\'s Creed : Dynasty'],
  /* « Fragments » est né en France, chez 404 éditions : les trois
     titres français sont les originaux. */
  ['Assassin\'s Creed: Fragments – The Highlands Children',
    'Assassin\'s Creed Fragments : Les Enfants des Highlands'],
  ['Assassin\'s Creed: Fragments – The Witches of the Moors',
    'Assassin\'s Creed Fragments : Les Sorcières des Landes'],
  ['Assassin\'s Creed: Fragments – The Blade of Aizu',
    'Assassin\'s Creed Fragments : La Lame d\'Aizu'],

  /* ════ LES NOTES DE PLACEMENT ═════════════════════════════════
     Ce sont les mots de Niko : on les traduit, on ne les réécrit pas.
     Les noms de séquences et de mémoires suivent la VF du jeu. */
  ['Until end of Sequence 12 (Battle of Forli)', 'Jusqu\'à la fin de la Séquence 12 (La bataille de Forlì)'],
  ['I highly recommend you to complete the optional 20 hidden glyphs but if you don\'t like collectibles look for "The Truth" video on YouTube when you completed the game it\'s pretty important !',
    'Je vous recommande vivement de trouver les 20 glyphes cachés facultatifs, mais si vous n\'aimez pas les collectibles cherchez la vidéo « La Vérité » sur YouTube une fois le jeu terminé, c\'est assez important !'],
  ['Bonfire of the Vanities and endgame', 'Le Bûcher des Vanités et la fin du jeu'],
  ['Until end of Sequence 8 (The Borgia)', 'Jusqu\'à la fin de la Séquence 8 (Les Borgia)'],
  ['Endgame', 'La fin du jeu'],
  ['It\'s the in-universe book that Ezio is reading at the beginning of Revelations, it retells events from Altaïr\'s saga but adds much more.',
    'C\'est le livre que lit Ezio au début de Revelations : il raconte à nouveau les événements de la saga d\'Altaïr, mais en ajoute bien davantage.'],
  ['So... these games don\'t have present time parts but still happen much later... We will not bother about that for now. I highly recommend you to complete the optional 3 hidden Assassin logos (in the 3 Chronicles games) to unlock a secret ending cinematic in the last game but we will come back to it much later.',
    'Alors... ces jeux n\'ont pas de parties au présent mais se déroulent quand même bien plus tard... On ne va pas s\'en occuper pour l\'instant. Je vous recommande vivement de trouver les 3 logos Assassins cachés facultatifs (dans les 3 jeux Chronicles) pour débloquer une cinématique de fin secrète dans le dernier jeu, mais on y reviendra bien plus tard.'],
  ['So... these games don\'t have present time parts but still happen much later (and this one is the last one but we play it now). We will not bother about that for now. I highly recommend you to complete the optional 3 hidden Assassin logos (in the 3 Chronicles games) to unlock a secret ending cinematic in this game but we will come back to it much later.',
    'Alors... ces jeux n\'ont pas de parties au présent mais se déroulent quand même bien plus tard (et celui-ci est le dernier, mais on y joue maintenant). On ne va pas s\'en occuper pour l\'instant. Je vous recommande vivement de trouver les 3 logos Assassins cachés facultatifs (dans les 3 jeux Chronicles) pour débloquer une cinématique de fin secrète dans ce jeu, mais on y reviendra bien plus tard.'],
  ['So... these games don\'t have present time parts but still happen much later... We will not bother about that for now. I highly recommend you to complete the optional 3 hidden Assassin logos (in the 3 Chronicles games) to unlock a secret ending cinematic in the last game but we will come back to it much later so don\'t watch it now.',
    'Alors... ces jeux n\'ont pas de parties au présent mais se déroulent quand même bien plus tard... On ne va pas s\'en occuper pour l\'instant. Je vous recommande vivement de trouver les 3 logos Assassins cachés facultatifs (dans les 3 jeux Chronicles) pour débloquer une cinématique de fin secrète dans le dernier jeu, mais on y reviendra bien plus tard, alors ne la regardez pas maintenant.'],
  ['Until end of Sequence 10 (Battle of Monmouth)', 'Jusqu\'à la fin de la Séquence 10 (La bataille de Monmouth)'],
  ['I highly recommend you to complete all the optional Citizen E glitchs to unlock the real end of the game but if you don\'t like to do this look at the video in the panel below when you completed the game it\'s pretty important !',
    'Je vous recommande vivement de faire tous les bugs Citizen E facultatifs pour débloquer la vraie fin du jeu, mais si vous n\'aimez pas ça regardez la vidéo dans le panneau ci-dessous une fois le jeu terminé, c\'est assez important !'],
  ['Also available in a standalone game titled Assassin\'s Creed: Freedom Cry',
    'Également disponible en jeu autonome sous le titre Assassin\'s Creed : Le Prix de la Liberté'],
  ['Until end of Sequence 9 (Shall We Dance?)', 'Jusqu\'à la fin de la Séquence 9 (On danse ?)'],
  ['Happens in parallel of the movie', 'Se déroule en parallèle du film'],
  ['Kassandra is the canon character so you should play her',
    'Kassandra est le personnage canonique, vous devriez donc jouer avec elle'],
  ['Until end of Unified Front memory', 'Jusqu\'à la fin de la mémoire Front uni'],
  ['Until end of A Blood Feast memory', 'Jusqu\'à la fin de la mémoire Festivités sanglantes'],
  ['Until end of Atlantis Destroyed memory', 'Jusqu\'à la fin de la mémoire Atlantide détruite'],
  ['As seen in the comic, woman Eivor is the canon character',
    'Comme le montre le comic, l\'Eivor féminine est le personnage canonique'],
  ['Don\'t forget to do the important quest A Fated Encounter on the isle of Skye while doing the game',
    'N\'oubliez pas de faire l\'importante quête Une rencontre prédestinée sur l\'île de Skye pendant votre partie'],
  ['I highly recommend you to complete the optional 10 Animus anomalies but if you don\'t like them look for "The Hidden Truth" video on YouTube when you completed the game it\'s pretty important !',
    'Je vous recommande vivement de faire les 10 anomalies de l\'Animus facultatives, mais si vous n\'aimez pas ça cherchez la vidéo « The Hidden Truth » sur YouTube une fois le jeu terminé, c\'est assez important !'],
  ['Read it after the main game or while playing after meeting Ivarr and Halfdan',
    'À lire après le jeu principal, ou en cours de partie après avoir rencontré Ivarr et Halfdan'],
  ['Read it after the main game or while playing after the East Anglia alliance arc',
    'À lire après le jeu principal, ou en cours de partie après l\'arc de l\'alliance d\'Est-Anglie'],
  ['Accessible early but happens after the end of the main story in the past but not in the present',
    'Accessible tôt, mais se déroule après la fin de l\'histoire principale dans le passé — pas au présent'],
  ['The Forgotten Saga free update + The Last Chapter epilogue',
    'La mise à jour gratuite La saga oubliée + l\'épilogue Le dernier chapitre'],
  ['Until end of The Return memory', 'Jusqu\'à la fin de la mémoire Le Retour'],
  ['Black Tides epilogue', 'L\'épilogue Marées noires'],
  ['So... think like this : after the events of present time in Black Flag, Abstergo rewrote Edward Kenway\'s story to release their version on the Animus Hub',
    'Alors... voyez ça comme ça : après les événements du présent dans Black Flag, Abstergo a réécrit l\'histoire d\'Edward Kenway pour en sortir sa version sur l\'Animus Hub'],
  /* « Resynced » ne se traduit pas : c'est le nom que porte la version
     refaite de Black Flag, et l'avertissement dit qu'elle n'existe pas
     encore. Décision de Niko, 25 août 2026. */
  ['Not Resynced !!! (yet...)', 'Pas Resynced !!! (pour l\'instant...)'],

  /* ════ L'ACCROCHE ET LES REPÈRES DE LECTURE ═══════════════════
     Le texte de Niko, traduit phrase par phrase. Les entités HTML de
     la source anglaise (`&#x27;`, `&quot;`) sont dans la clé ; le
     français les rend en caractères, la page injectant ce bloc tel
     quel. */
  /* « Livres », pas « Romans » : c'est le mot des cinq autres univers,
     et la timeline compte aussi des artbooks et un livre-jeu. */
  ['Games · DLC · Books · Comics', 'Jeux · DLC · Livres · Comics'],
  ['If you&#x27;re here it&#x27;s either because you did some of the games and want to discover the lore of Assassin&#x27;s Creed or you&#x27;re absolutely sure to love this universe before even trying it. If you just want to discover the games in chronological order uncheck the rest, all other medias are bonus content (some very important). This guide is spoiler free like the others.',
    'Si vous êtes ici, c\'est soit parce que vous avez fait quelques-uns des jeux et que vous voulez découvrir le lore d\'Assassin\'s Creed, soit parce que vous êtes absolument sûr d\'aimer cet univers avant même de l\'essayer. Si vous voulez seulement découvrir les jeux dans l\'ordre chronologique, décochez le reste : tous les autres médias sont du contenu bonus (certains très importants). Ce guide est sans spoiler, comme les autres.'],
  ['This guide works best for first-time plays.', 'Ce guide est fait avant tout pour une première partie.'],
  ['How to read this', 'Comment lire ce guide'],
  ['The calendar', 'Le calendrier'],
  ['The saga happens in &quot;our&quot; world so we&#x27;ll count in years like we do.',
    'La saga se déroule dans « notre » monde : on compte donc les années comme nous le faisons.'],
  ['Flashbacks and flashforwards', 'Flashbacks et flashforwards'],
  ['Some events work better as a FLASHBACK because they spoil details from the games or gives your character an unnatural omniscience that can break immersion. There are also some FLASHFORWARDS because the events of the past are a lot more important compared to the present day framing.',
    'Certains événements passent mieux en FLASHBACK, parce qu\'ils dévoilent des détails des jeux ou donnent à votre personnage une omniscience contre nature qui peut casser l\'immersion. Il y a aussi des FLASHFORWARDS, parce que les événements du passé sont bien plus importants que le cadre du présent.'],
  ['Games order', 'L\'ordre des jeux'],
  ['Most of the games have a present timeline but the core of the games all happen in the past.',
    'La plupart des jeux ont une trame au présent, mais le cœur des jeux se déroule toujours dans le passé.'],
  ['This guide in based on the present timeline, we will go back and forth in history many times but it makes more sense like this.',
    'Ce guide est bâti sur la trame du présent : on fera de nombreux allers-retours dans l\'Histoire, mais c\'est comme ça que ça a le plus de sens.'],
  ['What&#x27;s left out and why?', 'Ce qui n\'y est pas, et pourquoi ?'],
  ['7 entries', '7 entrées'],
  ['Mobile and web games (Pirates, Identity, Rebellion...)',
    'Les jeux mobiles et web (Pirates, Identity, Rebellion...)'],
  ['Not available anymore or non-canon', 'Plus disponibles, ou non canoniques'],
  ['Game novelizations', 'Les novélisations des jeux'],
  ['it&#x27;s a game based timeline but if you just want to read replace all the games by their official novelization.',
    'c\'est une timeline bâtie sur les jeux, mais si vous voulez seulement lire, remplacez tous les jeux par leur novélisation officielle.'],
  ['Les Deux Royaumes comics', 'Les comics Les Deux Royaumes'],
  ['All the parts in the present are non-canon, the parts in the past are probably canon, you read them when you want keeping this in mind.',
    'Toutes les parties au présent sont non canoniques, celles dans le passé le sont probablement : lisez-les quand vous voulez, en gardant ça en tête.'],
  ['The Ming Storm and The Desert Threat', 'The Ming Storm et The Desert Threat'],
  ['Not canon.', 'Non canoniques.'],
  ['Blade of Shao Jun', 'Blade of Shao Jun'],
  ['It&#x27;s a manga adaptation of Chronicles China with a new modern times story and is considered canon but it doesn&#x27;t make sense storywise.. if you want to read it, it happens after Odyssey&#x27;s last DLC.',
    'C\'est une adaptation en manga de Chronicles China, avec une nouvelle histoire au présent ; elle est considérée comme canonique mais n\'a pas de sens dans le récit.. si vous voulez la lire, elle se place après le dernier DLC d\'Odyssey.'],
  ['The roleplaying game', 'Le jeu de rôle'],
  ['Too hard to fit in the timeline but adds a lot of lore.',
    'Trop difficile à placer dans la timeline, mais il ajoute beaucoup de lore.'],
  ['The chinese books', 'Les livres chinois'],
  ['Unless you speak chinese...', 'À moins que vous ne parliez chinois...'],

  /* ════ LA PAGE ET LES LIBELLÉS PROPRES À CET UNIVERS ══════════ */
  ['Present day', 'Présent'],
  ['Memories', 'Souvenirs'],
  ['Who experiences the memories in the present days?', 'Qui revit ces souvenirs à notre époque ?'],
  ['Who experiences the memories in the present days? SPOILERS',
    'Qui revit ces souvenirs à notre époque ? SPOILERS'],
  ['Reset your Assassin’s Creed progress?', 'Réinitialiser votre progression Assassin\'s Creed ?'],
  ['Watch the video', 'Voir la vidéo'],
  ['Part 1', 'Partie 1'],
  ['Part 2', 'Partie 2'],
  ['Games · DLC · Books · Comics — the whole Assassin’s Creed universe in its most optimized order.',
    'Jeux · DLC · Livres · Comics — tout l\'univers Assassin\'s Creed dans son ordre le plus optimisé.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age and Assassin’s Creed are trademarks of their respective owners; Chronologeek is an independent fan project.',
    '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age et Assassin\'s Creed sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],

  /* ════ LES SEPT BADGES ════════════════════════════════════════ */
  ['The Assassin’s Blood', 'Le Sang de l\'Assassin'],
  ['The Altaïr and Ezio sagas completed', 'Les sagas d\'Altaïr et d\'Ezio terminées'],
  ['Kenway’s Fleet', 'La Flotte des Kenway'],
  ['The Kenway saga completed', 'La saga des Kenway terminée'],
  ['Helix Initiate', 'Initié Helix'],
  ['The Helix & Abstergo saga completed', 'La saga Helix & Abstergo terminée'],
  ['Bearer of the Staff', 'Porteur du Bâton'],
  ['The Layla Hassan saga completed', 'La saga de Layla Hassan terminée'],
  ['Animus EGO User', 'Utilisateur de l\'Animus EGO'],
  ['The Animus Hub saga completed', 'La saga de l\'Animus Hub terminée'],
  ['Keeper of the Codex', 'Gardien du Codex'],
  ['Nothing Is True', 'Rien n\'est vrai'],
  ['Assassin’s Creed 100% completed', 'Assassin\'s Creed terminé à 100 %'],

  /* ════ LES RÉPONSES DE FAQ ════════════════════════════════════
     Les noms propres ne bougent pas ; seul ce qui les entoure se
     traduit. */
  ['Probably Desmond Miles', 'Probablement Desmond Miles'],
  ['Random Abstergo employee', 'Un employé d\'Abstergo'],
  ['Random Helix customer', 'Un client d\'Helix'],
  ['Abstergo employee "Noob"', 'L\'employé d\'Abstergo « Noob »'],
  ['Abstergo employee "Numbskull"', 'L\'employé d\'Abstergo « Numbskull »'],
  ['Probably Basim', 'Probablement Basim'],
  ['Random Assassin', 'Un Assassin'],
  ['Undercover Assassin hacker', 'Un hacker Assassin infiltré'],
  ['Animus EGO user', 'Un utilisateur de l\'Animus EGO'],

  /* ════ LES SYNOPSIS ═══════════════════════════════════════════
     Ils viennent des fiches TMDB et des quatrièmes de couverture,
     collectés par `descriptions-assassinscreed.py`. Traduits, pas
     réécrits. */
  /* Les six jeux et DLC dont RAWG ne rend rien d'utilisable : Brotherhood
     n'y a que du packaging d'édition, les quatre extensions n'ont aucune
     description, et le texte d'Altaïr's Chronicles y est coupé au retour à
     la ligne. Le wiki AC les a — voir `descriptions-assassinscreed.py`. */
  ['As the direct prequel of the critically acclaimed console title Assassin’s Creed, discover more of the story of Altaïr as he must find “the chalice,” an object of such power that whoever is in possession of it can end the Crusades.',
    'Préquelle directe d\'Assassin\'s Creed, le jeu console salué par la critique, il prolonge l\'histoire d\'Altaïr, parti en quête du « calice » — un objet d\'un tel pouvoir que celui qui le détient peut mettre fin aux Croisades.'],
  ['Using the Animus 2.0, Desmond Miles attempts to relive one of the later memories of his ancestor, Ezio Auditore, hoping that it will reveal the location of his Apple of Eden, which could allow the Assassins to prevent the disaster foretold by Minerva. However, instead of entering the memory set in 1506, he is forced into a different one, occurring during a battle in Viana.',
    'À l\'aide de l\'Animus 2.0, Desmond Miles tente de revivre l\'un des derniers souvenirs de son ancêtre Ezio Auditore, dans l\'espoir d\'y trouver l\'emplacement de sa Pomme d\'Éden — de quoi permettre aux Assassins d\'empêcher la catastrophe annoncée par Minerve. Mais au lieu du souvenir de 1506, c\'en est un autre qui s\'impose à lui : une bataille, à Viana.'],
  ['Welcome to Assassin\'s Creed III\'s Tyranny of King Washington — a 3-part DLC series exploring an alternate reality in which George Washington goes mad with unlimited power, foregoing Presidency to rule as tyrannical King. In this alternate world, Connor is and remains Ratonhnhaké:ton. Having never become an Assassin, he must endure new trials, acquiring the skills he\'ll need to take down a possessed Washington and win freedom for his land once and for all. – Ubisoft.',
    'Bienvenue dans La Tyrannie du Roi Washington, l\'extension d\'Assassin\'s Creed III en trois parties : une réalité parallèle où George Washington, rendu fou par un pouvoir sans limite, renonce à la présidence pour régner en tyran. Dans ce monde-là, Connor est et reste Ratonhnhaké:ton. N\'étant jamais devenu Assassin, il doit affronter de nouvelles épreuves et acquérir ce qu\'il lui faut pour abattre un Washington possédé et rendre enfin sa liberté à sa terre. – Ubisoft.'],
  ['The Last Maharaja is a single-player downloadable content addition for Assassin\'s Creed: Syndicate and was released on 1 March 2016. The Last Maharajah memories can be accessed after Sequence 3, but take place after Sequence 9.',
    'Le Dernier Maharaja est un contenu téléchargeable solo pour Assassin\'s Creed : Syndicate, sorti le 1er mars 2016. Ses mémoires sont accessibles dès la fin de la Séquence 3, mais se déroulent après la Séquence 9.'],
  ['20 years after the events of Assassin\'s Creed Syndicate,\' Jack the Ripper\' has embarked on a brutal reign of terror that shocks London to its core and threatens the very existence of the Brotherhood of Assassins.',
    'Vingt ans après les événements d\'Assassin\'s Creed Syndicate, « Jack l\'Éventreur » a entamé un règne de terreur d\'une brutalité qui ébranle Londres jusqu\'aux fondations et menace l\'existence même de la Confrérie des Assassins.'],
  ['Explore the haunted wilds and beautiful landscapes of Ireland as you battle a druidic cult known as the Children of Danu. Conquer ring forts, master the art of smuggling, and gain the favor of Gaelic kings in a new open-world adventure.',
    'Explorez les étendues sauvages et hantées de l\'Irlande et ses paysages superbes, en affrontant un culte druidique connu sous le nom des Enfants de Danu. Prenez les forts circulaires, maîtrisez l\'art de la contrebande et gagnez la faveur des rois gaéliques dans une nouvelle aventure en monde ouvert.'],

  /* Lineage, Ascendance et Embers : les trois résumés posés par Niko le
     25 août 2026, les deux premiers repris de la description de leur
     vidéo, le troisième du wiki — la fiche TMDB d'Embers désignait une
     autre œuvre et a été retirée. */
  ['When the Duke of Milan is brutally murdered, the Assassin Giovanni Auditore is dispatched to investigate. The answers he uncovers implicate Italy’s most powerful families reaching all the way back to the Vatican itself. As Giovanni draws closer to the truth, he becomes hunted himself. He must expose the conspirators before he joins their ever growing list of victims. Lineage is the prequel to the Assassin’s Creed II story, revealing the machinations of 15th century Italy through the actions of Ezio’s father, Giovanni.',
    'Quand le duc de Milan est sauvagement assassiné, l\'Assassin Giovanni Auditore est envoyé enquêter. Ce qu\'il découvre met en cause les familles les plus puissantes d\'Italie, jusqu\'au Vatican lui-même. À mesure qu\'il approche de la vérité, Giovanni devient à son tour une proie : il lui faut démasquer les conspirateurs avant de rejoindre leur liste de victimes, qui ne cesse de s\'allonger. Lineage est la préquelle d\'Assassin\'s Creed II, et dévoile les manœuvres de l\'Italie du XVᵉ siècle à travers les actes du père d\'Ezio, Giovanni.'],
  ['Ubisoft’s short film, Assassin’s Creed: Ascendance details Cesare Borgia’s rise to power.',
    'Le court métrage d\'Ubisoft, Assassin\'s Creed : Ascendance, détaille la montée en puissance de Cesare Borgia.'],
  ['The short film follows an elderly Ezio, living a peaceful life in the Tuscan countryside with his wife Sofia and his children Flavia and Marcello and writing his memoirs. One day a stranger appears, a Chinese female Assassin called Shao Jun, who came to Ezio in order to seek knowledge of his life as an Assassin. Although Ezio prefers that Jun not stay, due to his desire to leave his days as an Assassin behind, Sofia allows her to stay for the night. The next day, Ezio catches Jun reading his memoirs and bids her to leave, but relents after she asks him about what it means to be an Assassin.',
    'Le court métrage suit Ezio vieillissant, qui coule des jours paisibles dans la campagne toscane avec sa femme Sofia et ses enfants Flavia et Marcello, et qui écrit ses mémoires. Un jour, une inconnue se présente : Shao Jun, une Assassine chinoise venue chercher auprès d\'Ezio ce qu\'il sait de sa vie d\'Assassin. Ezio préférerait qu\'elle ne reste pas — il veut laisser derrière lui ses années d\'Assassin —, mais Sofia lui offre l\'hospitalité pour la nuit. Le lendemain, Ezio surprend Jun en train de lire ses mémoires et lui demande de partir, avant de céder quand elle lui demande ce que signifie être un Assassin.'],
  ['Niccolò Polo, father of Marco, will finally reveal the story he has kept secret all his life – the story of Altaïr, one of the Brotherhood\'s most extraordinary assassins. Altaïr embarks on a formidable mission – one that takes him throughout the Holy Land and shows him the true meaning of the Assassin\'s Creed. To demonstrate his commitment, Altaïr must defeat nine deadly enemies, including the Templar leader, Robert de Sablé.',
    'Niccolò Polo, le père de Marco, va enfin révéler l\'histoire qu\'il a gardée secrète toute sa vie : celle d\'Altaïr, l\'un des assassins les plus extraordinaires de la Confrérie. Altaïr se lance dans une mission redoutable, qui le mène à travers toute la Terre sainte et lui montre le vrai sens du Credo des Assassins. Pour prouver son engagement, Altaïr doit vaincre neuf ennemis mortels, dont le chef des Templiers, Robert de Sablé.'],
  ['The Animi Training Program was a secret Templar initiative to train Abstergo Industries employees in the skills they needed to fight against the remnants of the Assassins, such as combat and freerunning, through the use of the Animus, a device created by Abstergo that allowed a person to relive genetic memories.',
    'Le Programme d\'entraînement Animus était une initiative templière secrète destinée à former les employés d\'Abstergo Industries aux compétences nécessaires pour combattre les derniers Assassins — combat, parkour — grâce à l\'Animus, l\'appareil créé par Abstergo qui permet de revivre des souvenirs génétiques.'],
  ['Now living in a cozy Tuscan Villa with his wife and their two children, Ezio spends his time enjoying the company of family, old friends, and cultivating his vineyards. The life of this former Assassin Mentor will not stay quiet for long. One day, a mysterious Assassin shows up at Ezio\'s door quite unexpectedly, begging for Ezio\'s aid. Will this old Assassin\'s fire die out before he can save the ones he loves, or will it burn brightly one last time?',
    'Installé dans une villa toscane avec sa femme et leurs deux enfants, Ezio coule des jours heureux entre sa famille, ses vieux amis et ses vignes. La vie de cet ancien Mentor des Assassins ne restera pas tranquille bien longtemps. Un jour, un Assassin mystérieux se présente à sa porte à l\'improviste et le supplie de l\'aider. Le feu de ce vieil Assassin s\'éteindra-t-il avant qu\'il puisse sauver ceux qu\'il aime, ou brûlera-t-il une dernière fois ?'],
  ['Assassin\'s Creed: The Fall is a 2010-2011 comic book written by Cameron Stewart and Karl Kerschl. A sequel comic book entitled Assassin\'s Creed: The Chain, again following the lives of Daniel Cross and Nikolai Orelov, was announced after San Diego Comic-Con 2011 and released in late July 2012.',
    'Assassin\'s Creed : The Fall est un comic de 2010-2011 écrit par Cameron Stewart et Karl Kerschl. Une suite intitulée Assassin\'s Creed : The Chain, qui suit à nouveau Daniel Cross et Nikolai Orelov, a été annoncée après le San Diego Comic-Con 2011 et publiée fin juillet 2012.'],
  ['Assassin\'s Creed: The Chain is a 2012 comic book, a sequel to Assassin\'s Creed: The Fall and the conclusion of the story of Nikolai Orelov. Whereas The Fall was first published by DC WildStorm as monthly comic issues, The Chain is only available to pre-order through Ubiworkshop.',
    'Assassin\'s Creed : The Chain est un comic de 2012, suite d\'Assassin\'s Creed : The Fall et conclusion de l\'histoire de Nikolai Orelov. Là où The Fall avait d\'abord paru chez DC WildStorm en numéros mensuels, The Chain n\'est disponible qu\'en précommande chez Ubiworkshop.'],
  ['1735 – London, Haytham Kenway has been taught to use a sword from the age he was able to hold one. When his family\'s house is attacked – his father murdered and his sister taken by armed men, Haytham defends his home the only way he can: he kills. With no family, he is taken in by a mysterious tutor who trains him to become a deadly killer. Consumed by his thirst for revenge, Haytham begins a quest for retribution, trusting no one and questioning everything he has ever known.',
    '1735, Londres. Haytham Kenway a appris à manier l\'épée dès qu\'il a été en âge d\'en tenir une. Quand la maison familiale est attaquée — son père assassiné, sa sœur enlevée par des hommes armés —, Haytham défend son foyer de la seule façon qu\'il connaisse : il tue. Sans famille, il est recueilli par un précepteur mystérieux qui en fait un tueur redoutable. Dévoré par sa soif de vengeance, Haytham part en quête de représailles, sans faire confiance à personne et en remettant en cause tout ce qu\'il croyait savoir.'],
  ['Aveline is a single-player downloadable content addition for Assassin\'s Creed IV: Black Flag. The content features the French-African Assassin Aveline de Grandpré, and is exclusive to the PlayStation 3, PlayStation 4 and PC. It is also included in The Rebel Collection along with all other single player DLC for the Nintendo Switch.',
    'Aveline est un contenu téléchargeable solo pour Assassin\'s Creed IV : Black Flag. On y incarne l\'Assassine franco-africaine Aveline de Grandpré ; il est exclusif à la PlayStation 3, la PlayStation 4 et le PC. Il est aussi inclus dans The Rebel Collection, avec tous les autres DLC solo, sur Nintendo Switch.'],
  ['Few moments in history have proven as timelessly fascinating as the lawless Golden Age of Piracy, which was largely played out in the Caribbean of the 16th and early 17th centuries. In this time of rebellion, fortune, intrigue, and adventure, Blackbeard stands as one of the most fearsome captains to have ever sailed the seas.',
    'Peu de moments de l\'Histoire fascinent autant que l\'âge d\'or de la piraterie et son absence de loi, qui s\'est joué pour l\'essentiel dans les Caraïbes du XVIᵉ et du début du XVIIᵉ siècle. En ce temps de révolte, de fortune, d\'intrigue et d\'aventure, Barbe Noire reste l\'un des capitaines les plus redoutables à avoir jamais navigué.'],
  ['Who is Jot Soora? Devoted fiancé of movie star Monima Das, gifted programmer at software giant MysoreTech, or deadly Assassin with a secret? When Jot stumbles into a layer of code deep in his company\'s new device, the discovery threatens his relationship, his job and his life. it also reveals shocking links to an ancestral past that cause him to question everything he knows about himself.',
    'Qui est Jot Soora ? Le fiancé dévoué de la star de cinéma Monima Das, le programmeur surdoué du géant du logiciel MysoreTech, ou un Assassin redoutable qui cache son jeu ? Quand Jot tombe sur une couche de code enfouie dans le nouvel appareil de son entreprise, sa découverte menace son couple, son emploi et sa vie. Elle révèle aussi des liens troublants avec un passé ancestral qui lui font remettre en cause tout ce qu\'il croyait savoir de lui-même.'],
  ['In 1927, Darius Gift, young, handsome, terribly entitled, is given his first mission for the ancient Templar Order, and the chance to clear his tarnished family name. All doesn\'t quite go to plan when he arrives in Shanghai, however, and his inexperience jeopardizes the whole operation. Thankfully, he isn\'t the only Templar new to the city, as the enigmatic Black Cross is stalking the shadows... and saving Darius from failure!',
    'En 1927, Darius Gift — jeune, beau et terriblement imbu de lui-même — reçoit sa première mission pour l\'antique Ordre des Templiers, et l\'occasion de laver le nom terni de sa famille. Rien ne se passe comme prévu à son arrivée à Shanghai : son inexpérience met toute l\'opération en péril. Heureusement, il n\'est pas le seul Templier fraîchement débarqué en ville — l\'énigmatique Croix Noire rôde dans l\'ombre... et sauve Darius du fiasco !'],
  ['Enter the shadowy world of the Assassins and Templars, two feuding factions who have battled over the centuries to decide the course of humanity! Two all-new short stories, written and illustrated by the creative teams of the regular comics, highlight a shocking event in the life of new Assassin Charlotte de la Cruz, and reveal the true extent of the mysterious Templar Black Cross\'s terrifying skills!',
    'Entrez dans le monde obscur des Assassins et des Templiers, deux factions rivales qui s\'affrontent depuis des siècles pour décider du sort de l\'humanité ! Deux histoires courtes inédites, écrites et dessinées par les équipes des séries régulières, éclairent un événement bouleversant de la vie de la nouvelle Assassine Charlotte de la Cruz et révèlent toute l\'étendue des terrifiants talents du mystérieux Templier Croix Noire !'],
  ['Crafted to resemble a set of Abstergo case files, this immersive and interactive book provides a glimpse into the technology that allows characters to inhabit the lives of their ancestors — a cornerstone of the Assassin\'s Creed narrative.',
    'Conçu comme un dossier d\'archives d\'Abstergo, ce livre immersif et interactif donne un aperçu de la technologie qui permet aux personnages d\'habiter la vie de leurs ancêtres — la pierre angulaire du récit d\'Assassin\'s Creed.'],
  ['The game follows Nikolai Orelov in Russia in 1918, taking place between the events of the comic Assassin\'s Creed: The Fall and Assassin\'s Creed: The Chain. As the final installment in the Assassin\'s Creed Chronicles series, the game differs stylistically from most previous entries in the franchise, being set on a 2.5D plane like Assassin\'s Creed II: Discovery.',
    'Le jeu suit Nikolai Orelov dans la Russie de 1918, entre les événements des comics Assassin\'s Creed : The Fall et Assassin\'s Creed : The Chain. Dernier volet de la série Assassin\'s Creed Chronicles, il tranche avec la plupart des épisodes précédents de la franchise : l\'action se déroule sur un plan en 2.5D, comme dans Assassin\'s Creed II : Discovery.'],
  ['A disgraced Assassin. A deep-cover agent. A quest for redemption. 1862, and with London in the grip of the Industrial Revolution, the world\'s first underground railway is under construction. When a body is discovered at the dig, it sparks the beginning of the latest deadly chapter in the centuries-old battle between the Assassins and Templars.',
    'Un Assassin déchu. Un agent infiltré. Une quête de rédemption. 1862 : Londres est en pleine révolution industrielle et le premier chemin de fer souterrain du monde est en construction. La découverte d\'un corps sur le chantier ouvre un nouveau chapitre meurtrier dans la lutte séculaire entre Assassins et Templiers.'],
  ['The war between Assassins and Templars wreaks havoc in the Victorian era, in this breakneck thriller which opens up a whole new chapter of the Assassin’s Creed universe London, 1851 — When Pierrette, daring acrobat performing at the Great Exhibition, rescues the mathematician Ada Lovelace from a gang of thugs, she becomes immersed in an ancient feud between Assassins and Templars.',
    'La guerre entre Assassins et Templiers ravage l\'époque victorienne dans ce thriller haletant, qui ouvre un tout nouveau chapitre de l\'univers Assassin\'s Creed. Londres, 1851 — quand Pierrette, acrobate intrépide de la Grande Exposition, sauve la mathématicienne Ada Lovelace d\'une bande de malfrats, elle plonge dans une querelle vieille de plusieurs siècles.'],
  ['The conspiracies of the Templars reverberate across nineteenth century Europe as they seize control of the future, and only the Brotherhood of Assassins can hold them back, in this globetrotting adventure from Assassin\'s Creed. Cairo, 1869. When a bomb goes off at the Khedivial Opera House celebrating the opening of the new Suez Canal, visiting Assassin Pierrette Arnaud investigates, only to uncover a plot to eradicate free will...',
    'Les complots des Templiers résonnent dans toute l\'Europe du XIXᵉ siècle tandis qu\'ils s\'emparent de l\'avenir, et seule la Confrérie des Assassins peut les arrêter, dans cette aventure d\'Assassin\'s Creed qui court le monde. Le Caire, 1869. Quand une bombe explose à l\'Opéra khédivial, qui célèbre l\'ouverture du canal de Suez, l\'Assassine de passage Pierrette Arnaud enquête et découvre un plan visant à supprimer le libre arbitre...'],
  ['The first stunning arc of the Assassin\'s Creed series collected. New initiate Charlotte de la Cruz ventures into the Animus, and the genetic memories of her ancestor, Tom Stoddard, to discover the truth about the hidden world of the Assassins and Templars and the feud that spans centuries.',
    'Le premier arc de la série Assassin\'s Creed, enfin réuni. La nouvelle initiée Charlotte de la Cruz s\'aventure dans l\'Animus et dans les souvenirs génétiques de son ancêtre Tom Stoddard pour découvrir la vérité sur le monde caché des Assassins et des Templiers, et sur leur querelle vieille de plusieurs siècles.'],
  ['Collecting the second arc of the critically-acclaimed Assassin\'s Creed comics, Setting Sun sees Charlotte searching for a clue that will help the Assassins on their quest to foil the Templar\'s plans. Hidden deep in the memories of her Inca ancestor lies a word that will save them – if it\'s not too late! Collects Assassin’s Creed: Assassin’s #6-10',
    'Réunissant le deuxième arc des comics Assassin\'s Creed salués par la critique, Soleil couchant suit Charlotte à la recherche d\'un indice qui aidera les Assassins à déjouer les plans des Templiers. Enfoui dans les souvenirs de son ancêtre inca se cache un mot qui les sauvera — s\'il n\'est pas déjà trop tard ! Contient Assassin\'s Creed : Assassins #6-10'],
  ['The Brotherhood of the Assassins is in trouble. Resources depleted by their long feud with the Templar Order, faced with a world where the goalposts are constantly shifting, they can only struggle to regain their footing. A mysterious collective offers an alliance, but is this third faction a golden opportunity? Or a Faustian bargain? Join Charlotte de la Cruz and Galina Voronina as they try and navigate a clear path for the Assassins through turbulent waters!',
    'La Confrérie des Assassins est en difficulté. Ses ressources épuisées par sa longue querelle avec l\'Ordre des Templiers, face à un monde dont les règles changent sans cesse, elle peine à retrouver son équilibre. Un collectif mystérieux lui propose une alliance : cette troisième faction est-elle une occasion en or, ou un pacte avec le diable ? Suivez Charlotte de la Cruz et Galina Voronina qui tentent de tracer une route sûre pour les Assassins en eaux troubles !'],
  ['Collects the incredible second arc of the riveting Black Cross saga! In the dungeons of Tripoli, a man will have his fortunes changed forever as he becomes an agent of honor for the legendary Templar Order! The introduction of the second character ever to be officially called the Black Cross, defender of the Templar Order ideals!',
    'Contient le deuxième arc de la formidable saga Croix Noire ! Dans les geôles de Tripoli, un homme voit son destin basculer à jamais en devenant un agent d\'honneur du légendaire Ordre des Templiers. L\'entrée en scène du deuxième personnage à porter officiellement le nom de Croix Noire, défenseur des idéaux templiers !'],
  ['Nothing in Owen\'s life has been right since his father died in prison, accused of a crime Owen is certain he didn\'t commit. Monroe, the IT guy at school, might finally bring Owen the means to clear his father\'s name by letting him use an Animus — a device that lets users explore the genetic memories buried within their own DNA. The experience brings Owen more than he bargained for.',
    'Rien ne va plus dans la vie d\'Owen depuis que son père est mort en prison, accusé d\'un crime qu\'il n\'a pas commis, Owen en est sûr. Monroe, l\'informaticien du lycée, va peut-être enfin lui donner de quoi laver le nom de son père en le laissant utiliser un Animus — un appareil qui permet d\'explorer les souvenirs génétiques enfouis dans son propre ADN. L\'expérience lui apporte bien plus que ce qu\'il avait prévu.'],
  ['Assassin\'s Creed: Last Descendants – Locus, otherwise simply known as Locus, is a comic book miniseries published by Titan Comics. A tie-in to the Last Descendants young adult book series as well as a return to the Victorian era London setting of Assassin\'s Creed: Syndicate, the comic is written by Ian Edginton and illustrated by Caspar Wijngaard.',
    'Assassin\'s Creed : Last Descendants - Locus, plus simplement appelé Locus, est une mini-série de comics publiée par Titan Comics. Dérivée de la série de romans pour jeunes adultes Last Descendants et retour au Londres victorien d\'Assassin\'s Creed : Syndicate, elle est écrite par Ian Edginton et dessinée par Caspar Wijngaard.'],
  ['The new book set in the universe of Assassin\'s Creed. Reliving the memories of his ancestor who fought beside Joan of Arc, high-ranking Templar Simon Hathaway slowly uncovers secrets of the past that could dangerously impact his present... and that of the entire Templar order. An endless conflict. An old wrong. A new revelation.',
    'Le nouveau roman de l\'univers Assassin\'s Creed. En revivant les souvenirs de son ancêtre qui combattit aux côtés de Jeanne d\'Arc, le Templier de haut rang Simon Hathaway met peu à peu au jour des secrets du passé qui pourraient bouleverser son présent... et celui de tout l\'Ordre des Templiers. Un conflit sans fin. Une vieille injustice. Une révélation nouvelle.'],
  ['Owen and his friends have lost. They managed to do something incredible, but were defeated nonetheless. When they located the first piece of an ancient and powerful relic long considered a legend-the Trident of Eden -it seemed little could stop them. This piece was sought by the Brotherhood of Assassins and the Templar Order, but before either organization could take the piece, it was stolen by an unknown third party.',
    'Owen et ses amis ont perdu. Ils ont réussi quelque chose d\'incroyable, et pourtant ils ont été battus. Quand ils ont localisé le premier fragment d\'une relique ancienne et puissante longtemps tenue pour une légende — le Trident d\'Éden —, plus rien ne semblait pouvoir les arrêter. Ce fragment était convoité par la Confrérie des Assassins et par l\'Ordre des Templiers, mais avant que l\'une ou l\'autre organisation ne s\'en empare, il a été volé par un tiers inconnu.'],
  ['The stunning conclusion to the Last Descendants Trilogy! Only one piece of the Trident of Eden remains - Isaiah, a rogue Templar agent, has discovered both the faith prong and the fear prong of this powerful relic. Should he possess the devotion prong, there is little that can stop him. For the time being, Owen and his fellow teens have established an uneasy alliance across Assassin and Templar lines in order to stop Isaiah while they still can.',
    'La conclusion éclatante de la trilogie Last Descendants ! Il ne reste qu\'un fragment du Trident d\'Éden : Isaiah, agent templier renégat, a déjà mis la main sur la dent de la foi et sur celle de la peur. S\'il obtient la dent de la dévotion, plus grand-chose ne pourra l\'arrêter. En attendant, Owen et ses camarades ont noué une alliance fragile par-delà la ligne qui sépare Assassins et Templiers, pour arrêter Isaiah tant qu\'ils le peuvent encore.'],
  ['Assassin\'s Creed: Reflections is a comic book miniseries published by Titan Comics to mark the franchise\'s tenth anniversary.',
    'Assassin\'s Creed : Reflections est une mini-série de comics publiée par Titan Comics pour les dix ans de la franchise.'],
  ['A game-changing new chapter in the ongoing Assassin\'s Creed saga! With the Phoenix Project nearing its completion, tensions are running high for both the Brotherhood and the Templar Order. A new world order is on the horizon and only Charlotte and her new allies have the knowledge and skill to save humanity from subjugation!',
    'Un nouveau chapitre qui change tout dans la saga Assassin\'s Creed ! Alors que le Projet Phoenix touche à sa fin, la tension monte des deux côtés, chez la Confrérie comme chez l\'Ordre des Templiers. Un nouvel ordre mondial se profile, et seules Charlotte et ses nouvelles alliées ont le savoir et le talent nécessaires pour sauver l\'humanité de la soumission !'],
  ['The Phoenix project saga begins to unravel in this second thrilling chapter of Assassin’s Creed Uprising! Our modern day Assassins take the fight to the heart of the Spanish Civil War in order to secure a valuable artifact that could change the course of history. But when a brand new enemy rears its ugly head, both the Brotherhood and Templar Order are forced to form a shaky alliance.',
    'La saga du Projet Phoenix commence à se défaire dans ce deuxième chapitre haletant d\'Assassin\'s Creed Uprising ! Nos Assassins d\'aujourd\'hui portent le combat au cœur de la guerre civile espagnole pour mettre la main sur un artefact précieux qui pourrait changer le cours de l\'Histoire. Mais quand un ennemi tout neuf sort de l\'ombre, la Confrérie et l\'Ordre des Templiers doivent nouer une alliance fragile.'],
  ['Before Assassin\'s Creed: Origins, there was an Oath. Egypt, 70BC, a merciless killer stalks the land. His mission: to find and destroy the last members of an ancient order, the Medjay — to eradicate the bloodline. In peaceful Siwa, the town\'s protector abruptly departs, leaving his teenage son, Bayek, with questions about his own future and a sense of purpose he knows he must fulfill.',
    'Avant Assassin\'s Creed : Origins, il y eut un serment. Égypte, 70 av. J.-C. : un tueur impitoyable écume le pays. Sa mission — retrouver et éliminer les derniers membres d\'un ordre ancien, les Medjaÿ, et en effacer la lignée. Dans la paisible Siwa, le protecteur de la ville s\'en va brusquement, laissant son fils adolescent, Bayek, face à des questions sur son avenir et à une vocation qu\'il sait devoir accomplir.'],
  ['The player takes on the role of a Medjay named Bayek and his wife Aya, as they work to protect the people of the Ptolemaic Kingdom during a time of widespread upheaval: the Pharaoh, Ptolemy XIII, struggles to maintain his rule whilst harboring ambitions of expanding his kingdom; his sister, the recently deposed Queen Cleopatra, begins marshalling loyalist forces to launch a counter-coup against Ptolemy; and frequent incursions into the Kingdom by the Roman Republic under the command of Julius Caesar lead to fears of an imminent invasion.',
    'Le joueur incarne un Medjaÿ nommé Bayek et sa femme Aya, qui protègent le peuple du royaume lagide en pleine tourmente : le pharaon Ptolémée XIII peine à conserver son pouvoir tout en nourrissant des ambitions d\'expansion ; sa sœur, la reine Cléopâtre récemment déposée, rassemble ses fidèles pour un contre-coup d\'État ; et les incursions répétées de la République romaine, menée par Jules César, font craindre une invasion imminente.'],
  ['New era - New adventure - New Assassin. Europe, World War II. On the sidelines of the race for the atomic bomb, discover the story of Eddie Gorm and his integration into the Assassin Brotherhood while he infiltrates the Templars to foil their plan to create a devastating weapon. Eddie Gorm is the boss of the docks and his only obsession is to run his small business.',
    'Nouvelle époque - Nouvelle aventure - Nouvel Assassin. Europe, Seconde Guerre mondiale. En marge de la course à la bombe atomique, découvrez l\'histoire d\'Eddie Gorm et son entrée dans la Confrérie des Assassins, tandis qu\'il infiltre les Templiers pour déjouer leur projet d\'arme dévastatrice. Eddie Gorm règne sur les docks et n\'a qu\'une obsession : faire tourner sa petite affaire.'],
  ['April 1939, Nazi Germany launch a race against the Allies to build the first nuclear bomb. Soon, Colonel Boris Pash, a member of the Assassin Brotherhood, discovers that the Nazi program is only a decoy to divert the attention of the Allies. Hitler is actually looking for a far superior and striking power, thanks in particular to a mysterious weapon: Die Glocke.',
    'Avril 1939 : l\'Allemagne nazie lance une course contre les Alliés pour construire la première bombe nucléaire. Le colonel Boris Pash, membre de la Confrérie des Assassins, découvre bientôt que le programme nazi n\'est qu\'un leurre destiné à détourner l\'attention des Alliés. Hitler cherche en réalité une puissance de frappe bien supérieure, grâce notamment à une arme mystérieuse : Die Glocke.'],
  ['The secret struggle between Assassins and Templars hits the Vietnam War! Part one of a new thriller set in the world of Assassin\'s Creed, from Guillaume Dorison ( Assassin\'s Creed: Conspiracies, Devil May Cry ) and artist Ennio Bufi ( They Made History ). Tomo, one of the youngest members of the Japanese Assassin cell, has uncovered a conspiracy.',
    'La lutte secrète entre Assassins et Templiers gagne la guerre du Viêt Nam ! Premier volet d\'un nouveau thriller situé dans l\'univers d\'Assassin\'s Creed, par Guillaume Dorison (Assassin\'s Creed Conspirations, Devil May Cry) et le dessinateur Ennio Bufi (Ils ont fait l\'Histoire). Tomo, l\'un des plus jeunes membres de la cellule japonaise des Assassins, a mis au jour un complot.'],
  ['The final chapter of Assassin\'s Creed: Uprising concludes the Phoenix Project Saga in epic fashion – the end of a ten-year storyline straight from the video games! Time has run out for our modern-day assassins! While fan-favorite characters Juno, Otso Berg and Black Cross face the advent of a new world order, Charlotte and her cell confront the biggest threat the brotherhood has ever encountered... and not all of them will survive!',
    'Le dernier chapitre d\'Assassin\'s Creed : Uprising conclut en beauté la saga du Projet Phoenix — la fin d\'une intrigue de dix ans venue tout droit des jeux ! Le temps est écoulé pour nos Assassins d\'aujourd\'hui. Tandis que Juno, Otso Berg et Croix Noire, personnages chouchous des fans, affrontent l\'avènement d\'un nouvel ordre mondial, Charlotte et sa cellule font face à la plus grande menace que la Confrérie ait jamais connue... et tous n\'y survivront pas !'],
  ['Assassin\'s Creed: Gold is a stand-alone tale from the Assassin\'s Creed universe in which we meet Aliyah Khan, a card shark and hustler, who\'s been dealt a rough hand in life. Surviving through her smarts and street scams, Aliyah struggles to get by until she loses big time to a mysterious older man, Gavin Banks. Her only option to repay Banks is to become an Assassin.',
    'Assassin\'s Creed : Gold est un récit autonome de l\'univers Assassin\'s Creed, où l\'on rencontre Aliyah Khan, joueuse de cartes et arnaqueuse à qui la vie n\'a pas fait de cadeau. Elle survit grâce à son intelligence et à ses combines de rue, jusqu\'au jour où elle perd gros face à un homme mystérieux plus âgé, Gavin Banks. Le seul moyen de le rembourser : devenir Assassine.'],
  ['A Tale from the Saga of a Viking Warrior Blades clash in this prequel to Ubisoft\'s next hit video game, Assassin’s Creed Valhalla. Written by Cavan Scott ( Star Wars Adventures, Vikings ), illustrated by Martin Tunica, and colored by Michael Atiyeh ( The Orville, Dragon Age: Blue Wraith ), Assassin’s Creed Valhalla: Song of Glory takes readers back to a Mid-9th Century Norway. Eivor, a Viking warrior, observes a village raided by a neighboring kingdom.',
    'Un récit tiré de la saga d\'une guerrière viking. Les lames s\'entrechoquent dans cette préquelle du prochain grand jeu d\'Ubisoft, Assassin\'s Creed Valhalla. Écrit par Cavan Scott (Star Wars Adventures, Vikings), dessiné par Martin Tunica et mis en couleur par Michael Atiyeh (The Orville, Dragon Age : Blue Wraith), Assassin\'s Creed Valhalla : Le Chant de gloire ramène le lecteur dans la Norvège du milieu du IXᵉ siècle. Eivor, guerrière viking, assiste au pillage d\'un village par un royaume voisin.'],
  ['Not long before the exploits of Eivor Wolf-Kissed, Jarl Stensson and his [sons], Ulf and Björn, make their way to England at the behest of Halfdan Ragnarsson and Ivarr the Boneless. Filled with excitement, confidence and bloodlust, the [two] brothers are eager to go to war against Aelfred the Great and his Anglo Saxon army. But they would do well not to underestimate what awaits them on those green shores...',
    'Peu avant les exploits d\'Eivor Baisée-par-le-Loup, le jarl Stensson et ses [fils], Ulf et Björn, font route vers l\'Angleterre à la demande de Halfdan Ragnarsson et d\'Ivarr le Désossé. Pleins d\'entrain, d\'assurance et de soif de sang, les [deux] frères ont hâte de partir en guerre contre Alfred le Grand et son armée anglo-saxonne. Mais ils feraient bien de ne pas sous-estimer ce qui les attend sur ces rivages verdoyants...'],
  ['Discover the epic tale of legendary viking Geirmund Hel-hide in this new novel set in the world of Assassin\'s Creed Valhalla Mid-9th Century CE. The Viking attacks and invasions are shattering England’s kingdoms. Born into a royal lineage of Norwegian kings, Geirmund Hel-hide sets out for adventure to prove his worth as a Viking and a warrior.',
    'Découvrez le récit épique du légendaire Viking Geirmund Peau-d\'Enfer dans ce nouveau roman de l\'univers Assassin\'s Creed Valhalla. Milieu du IXᵉ siècle : les attaques et les invasions vikings mettent en pièces les royaumes d\'Angleterre. Né dans une lignée royale de rois norvégiens, Geirmund Peau-d\'Enfer part à l\'aventure pour prouver sa valeur de Viking et de guerrier.'],
  ['Assassin\'s Creed: Valhalla – The Hidden Codex is a bande dessinée graphic novel by the same artists behind Assassin\'s Creed: Valhalla\' s tie-in webcomic.',
    'Assassin\'s Creed : Valhalla - The Hidden Codex est une bande dessinée signée par les mêmes auteurs que le webcomic dérivé d\'Assassin\'s Creed : Valhalla.'],
  ['A Celtic warrior defending her people from Viking raiders infiltrates an ancient sect to save her homeland, in this gripping original saga set in the world of Assassin\'s Creed Valhalla. Mercia, 878. Witch-warrior Niamh discovers a new order called the Hidden Ones is seeking to establish a foothold in Lunden. Her land is already scarred by Viking raiders, bloody wars, and clashing cultures.',
    'Une guerrière celte qui défend son peuple contre les pillards vikings infiltre une secte ancienne pour sauver sa terre, dans cette saga originale et haletante de l\'univers Assassin\'s Creed Valhalla. Mercie, 878. Niamh, guerrière-sorcière, découvre qu\'un nouvel ordre, les Invisibles, cherche à prendre pied à Lunden. Sa terre est déjà meurtrie par les pillards vikings, les guerres sanglantes et le choc des cultures.'],
  ['Thor, Baldr, and Heimdall have discovered trouble lurking at Asgard\'s borders once again. A mighty fire giant from Muspelheim is threatening the land of the Æsir. In the aftermath of the raging battle, Baldr discovers that the Muspels are now massing at the gates of Svartalfheim and begins a journey to bring peace to the realms.',
    'Thor, Baldr et Heimdall découvrent qu\'un danger rôde une fois de plus aux frontières d\'Asgard : un puissant géant de feu venu de Muspelheim menace la terre des Ases. Au lendemain de la bataille, Baldr comprend que les Muspels se massent maintenant aux portes de Svartalfheim, et part en voyage pour ramener la paix dans les royaumes.'],
  ['The Assassin\'s Creed Escape Room Puzzle Book is an exciting journey through history in which you must solve a series of puzzles and mysteries to save humanity. You are Joey, a museum worker who comes across a mysterious blade that sets in motion a chain of events that completely upends your life. Drawn into the world of the Assassins, you must tour through time and space — from 5th century BCE Greece to the catacombs of medieval Venice — in order to foil a malevolent Isu plot.',
    'L\'Assassin\'s Creed Escape Game est un voyage palpitant à travers l\'Histoire, où il vous faut résoudre une série d\'énigmes et de mystères pour sauver l\'humanité. Vous êtes Joey, employé de musée, qui tombe sur une lame mystérieuse et déclenche une suite d\'événements qui bouleverse sa vie. Entraîné dans le monde des Assassins, vous devez parcourir le temps et l\'espace — de la Grèce du Vᵉ siècle av. J.-C. aux catacombes de la Venise médiévale — pour déjouer un complot isu.'],
  ['Master Assassin Roshan\'s past is revealed in the hunt along the Silk Road for a powerful mysterious artifact in this essential Assassin\'s Creed adventure Cairo, 824 – In the bowels of prison, escape is out of the question. The best Roshan can hope for is a quick death. She certainly doesn\'t expect a second chance offered by a cloaked stranger who says Roshan is exactly what they need: Someone who can disappear, who will do what needs to be done, someone expendable...',
    'Le passé de la Maître Assassine Roshan se dévoile au fil d\'une traque le long de la route de la Soie, à la recherche d\'un artefact aussi puissant que mystérieux, dans cette aventure essentielle d\'Assassin\'s Creed. Le Caire, 824 — au fond d\'une geôle, s\'évader est hors de question. Le mieux que Roshan puisse espérer, c\'est une mort rapide. Elle ne s\'attend certainement pas à la seconde chance que lui offre un inconnu encapuchonné, pour qui Roshan est exactement ce qu\'il leur faut : quelqu\'un qui sait disparaître, qui fera ce qu\'il y a à faire, quelqu\'un de sacrifiable...'],
  ['Years before the events of Assassin\'s Creed Mirage, a young Fuladh must return to his homeland to investigate political unrest that could point to a secret Order of the Ancients\' stronghold. But in order to discover what\'s behind the chaos and violence in Adulis, Fuladh and Roshan will have to confront a more immediate danger.',
    'Des années avant les événements d\'Assassin\'s Creed Mirage, le jeune Fuladh doit rentrer au pays pour enquêter sur des troubles politiques qui pourraient trahir une place forte secrète de l\'Ordre des Anciens. Mais pour comprendre ce qui se cache derrière le chaos et la violence à Adoulis, Fuladh et Roshan devront affronter un danger plus immédiat.'],
  ['A young emperor\'s life hangs in the balance, and only the Brotherhood of Assassins can save him, in this action-packed historical adventure from the award-winning Assassin\'s Creed universe. Constantinople, 867 – A murderous plot is afoot. Assisted by the Order of the Ancients, the emperor schemes to assassinate his son and throw the city into chaos.',
    'La vie d\'un jeune empereur ne tient qu\'à un fil, et seule la Confrérie des Assassins peut le sauver, dans cette aventure historique pleine d\'action tirée de l\'univers primé d\'Assassin\'s Creed. Constantinople, 867 — un complot meurtrier se trame. Aidé par l\'Ordre des Anciens, l\'empereur projette de faire assassiner son fils et de plonger la ville dans le chaos.'],
  ['Put yourself in the shoes of an Assassin and immerse yourself in a completely new interactive adventure. France, 870 CE. You play as Oisel, a young Assassin from the Chinon Bureau whose daily life is turned upside down upon receiving a strange letter from Basim, illustrious mentor of Constantinople. With your best friend, Matthias, and your loyal raptor, Alouette, you are sent on his tracks along the Silk Road. Your first stop: Antioch.',
    'Glissez-vous dans la peau d\'un Assassin et plongez dans une aventure interactive entièrement inédite. France, 870. Vous incarnez Oisel, jeune Assassin du bureau de Chinon, dont le quotidien bascule à la réception d\'une étrange lettre de Basim, illustre mentor de Constantinople. Avec votre meilleur ami, Matthias, et votre fidèle rapace, Alouette, vous partez sur ses traces le long de la route de la Soie. Première étape : Antioche.'],
  ['Edward Kenway returns to take the leap of faith in an all-new adventure. The high-seas hunt is on for a long-lost treasure left by Those Who Came Before. But this time, the Templars aren\'t the only ones after the prize. Join history\'s most cunning pirate in an epic journey around the Chinese Sea.',
    'Edward Kenway revient faire le saut de la foi dans une aventure inédite. La chasse est lancée en haute mer à un trésor perdu depuis longtemps, laissé par Ceux Qui Étaient Là Avant. Mais cette fois, les Templiers ne sont pas les seuls sur le coup. Suivez le plus rusé des pirates de l\'Histoire dans un périple épique autour de la mer de Chine.'],
  ['Assassin\'s Creed: Shadows – Tales of Iga (Japanese: アサシン クリード シャドウズ 伊賀の物語, Assassin\'s Creed: Shadows – Iga no Monogatari ) is an ongoing manga that has been released on Japan\'s Weekly Young Magazine website since 20 March 2025. The manga serves as a prequel to Assassin\'s Creed: Shadows and explores the backstories of Fujibayashi Nagato, Hattori Hanzō, and Tsuyu, who come together to fight against the growing Templar threat in Japan in 1560.',
    'Assassin\'s Creed Shadows : Les Légendes d\'Iga (en japonais : アサシン クリード シャドウズ 伊賀の物語, Assassin\'s Creed: Shadows – Iga no Monogatari) est un manga en cours de publication sur le site du Weekly Young Magazine japonais depuis le 20 mars 2025. Préquelle d\'Assassin\'s Creed : Shadows, il explore le passé de Fujibayashi Nagato, Hattori Hanzō et Tsuyu, qui s\'unissent pour combattre la menace templière grandissante au Japon en 1560.'],
  ['In the 14th year of the Tianbao Era (CE 755) An Lushan, a military governor with ties to the Knights Templar, leads his elite corps to rebel against the Tang dynasty, and the ill-prepared Tang empire falters under the threat. As the Tang dynasty starts to crumble, Li E, a shady Assassin trained by the Hidden Ones in the far West, teams up with Tang loyalists to turn the tide and save both the dynasty and the country from this crisis.',
    'En la quatorzième année de l\'ère Tianbao (755), An Lushan, gouverneur militaire lié aux Templiers, lance son corps d\'élite dans une rébellion contre la dynastie Tang, et l\'empire mal préparé vacille sous la menace. Alors que les Tang commencent à s\'effondrer, Li E, Assassin trouble formé par les Invisibles dans le lointain Occident, s\'allie aux loyalistes pour renverser le cours des choses et sauver la dynastie comme le pays.'],
  ['The events of the novel take place in Scotland, following Fillan and his sister Ailéas during the country\'s invasion by the army of King Edward I of England in 1296, and it focuses on the local culture of the Highlands.',
    'Le roman se déroule en Écosse et suit Fillan et sa sœur Ailéas pendant l\'invasion du pays par l\'armée du roi Édouard Iᵉʳ d\'Angleterre en 1296 ; il s\'attache à la culture locale des Highlands.'],
  ['At Bayonne, running within the Château-Vieux, Judge Pierre de Lancre held his documents and settled in to escape the heat.',
    'À Bayonne, courant dans le Château-Vieux, le juge Pierre de Lancre serrait ses documents et s\'installa pour échapper à la chaleur.'],
  ['Japan, 1868. The opposition between the Tokugawa Shogunate and the Emperor\'s supporters is growing under the influence of external forces. The Templars have infiltrated the Emperor\'s court and are pushing him to go to war against Tokugawa, an ally of the Assassin Brotherhood. Could the glorious era of the Samurai be on the verge of collapse? Atsuko, a 16-year-old Japanese girl, grew up in the wealthy neighborhoods of the city of Aizu.',
    'Japon, 1868. L\'opposition entre le shogunat Tokugawa et les partisans de l\'Empereur s\'aggrave sous l\'influence de forces extérieures. Les Templiers ont infiltré la cour impériale et poussent l\'Empereur à faire la guerre aux Tokugawa, alliés de la Confrérie des Assassins. La glorieuse ère des samouraïs serait-elle sur le point de s\'effondrer ? Atsuko, une Japonaise de 16 ans, a grandi dans les quartiers riches de la ville d\'Aizu.'],
];

/* ── les vidéos, une adresse par langue ──────────────────────────────
   Un lien de visionnage n'est pas un libellé : c'est la même œuvre dans
   une autre langue, et la page française doit ouvrir la version
   française. `href` étant un champ technique, il est recopié tel quel
   par le script ; cette table est la seule chose qui le remplace.

   Les quatre paires viennent de Niko, le 25 août 2026. Une adresse
   anglaise qui ne se retrouve plus dans les données fait sortir le
   script en erreur — c'est ce qui dira que le lien a bougé.

   Ascendance n'a pas de version doublée : sa vidéo française est
   sous-titrée, et l'entrée porte donc aussi le badge VO. */
export const AC_LIENS = [
  /* Lineage — le film complet, VF remasterisée */
  ['https://www.youtube.com/watch?v=vcE8xJkK6t4', 'https://www.youtube.com/watch?v=xHAFe-7chDI'],
  /* Ascendance — VOSTFR */
  ['https://www.youtube.com/watch?v=BCcLbHaJ2Po', 'https://www.youtube.com/watch?v=KGbcp7Zkv7w'],
  /* Animi Training Program — les cinématiques du multi de Revelations */
  ['https://www.youtube.com/watch?v=Ah2XSXZqrcA', 'https://www.youtube.com/watch?v=iqjt-SQ5AnM'],
  /* Embers — les deux adresses démarrent après l'introduction */
  ['https://www.youtube.com/watch?v=VZ6lIW9Ls30&t=21s', 'https://www.youtube.com/watch?v=2pGXCKhE2xM&t=250s'],
  /* Chronicles: Russia — la fin secrète */
  ['https://www.youtube.com/watch?v=0JKrEU7o1Nk', 'https://www.youtube.com/watch?v=bIL4dWRicbg'],
];

/* ── les formes ──────────────────────────────────────────────────── */
export const AC_GABARITS = [
  /* Les sept bandeaux de saga. « SAGA » se dit pareil des deux côtés,
     et le chiffre ne bouge pas — c'est une forme, pas un libellé. */
  [/^SAGA (\d+)$/, m => `SAGA ${m[1]}`],
];
