/* ═══ STAR TREK : LE FRANÇAIS ÉCRIT ══════════════════════════════════
   Star Trek est le second univers qu'il faut vraiment traduire, après
   Avatar — et pour la raison inverse. Avatar n'avait pas de page
   anglaise à reprendre ; Star Trek n'a pas de page française, parce que
   Niko a écrit ce guide-là en anglais.

   Tout ce qui appartient au gabarit du site est retrouvé dans les neuf
   autres protos par `traduire-startrek.mjs`, jamais écrit ici : 1 686
   textes, navigation, pied de page, filtres, progression, boutons.
   Cette table ne porte que ce qui est propre à Star Trek.

   TROIS RÈGLES, DANS CET ORDRE.

   1. Un titre d'œuvre n'est pas traduit, il est **repris de son
      exploitation française**. Les onze longs métrages ont tous un titre
      français — The Wrath of Khan est sorti sous « La Colère de Khan ».
      Les séries se partagent : TOS, TAS et TNG ont un titre français,
      Discovery, Picard, Strange New Worlds, Lower Decks, Prodigy et
      Enterprise ont gardé le leur. Ce qui garde son titre anglais est
      déclaré identique plus bas, et ne repart donc pas à la relecture.
   2. La prose est de Niko, et se traduit au plus près. Pas de raccourci,
      pas d'ajout, pas d'« amélioration ». Ses réponses de FAQ sont
      parfois en deux ou trois paragraphes, séparés par un `\n` que la
      page rend en `<p>` : le français porte les mêmes, et le script
      s'arrête si le compte ne correspond pas.
   3. Ce qui vaut pour les deux langues est déclaré identique.

   LE REGISTRE. La refonte vouvoie — « Cochez ce que vous avez vu » — et
   c'est ce que suit la prose traduite ici. Les libellés d'interface, eux,
   viennent des autres protos et gardent le tutoiement de la prod quand
   c'est ce qu'ils disent : ils ne sont pas réécrits.

   ══════════════════════════════════════════════════════════════════ */

/* Ce qui s'écrit pareil des deux côtés : les titres que la France n'a
   pas traduits, les codes de type, et les valeurs de données que le
   traducteur croise en chemin. Déclarés, ils ne repartent pas au
   rapport de relecture — il n'y a rien à y relire. */
export const ST_IDENTIQUES = [
  'Star Trek',
  /* Le nom du quatrième univers, renommé pour ne plus se confondre avec
     les films de James Cameron. Il ne se traduit pas. */
  'Avatar Legends',
  'Star Trek Into Darkness',
  'Star Trek (2009)',
  'Short Treks',
  'Chronologeek — Star Trek (proto E)',
  '746 h',
  'flashback',
  'kelvin',
  'st',
  'bh',
  'major',
  'plain',
  'bn-ico',
  'cg-proto-st',
  'chronologeek-startrek.json',
  '#b48cf2',
  'rv" id="bn',
];

/* Les formes, plutôt que des tables : « Season 6 Episodes 1-4 » n'a rien
   à faire dans une liste de 254 lignes. L'ordre compte — le plus précis
   d'abord — et chaque gabarit doit servir au moins une fois, sinon le
   script le signale. */
export const ST_GABARITS = [
  // les trois sous-items qui nomment un épisode entre parenthèses. Le
  // titre d'épisode reste en anglais : c'est celui que la page affiche
  // partout ailleurs, et Niko n'en donne pas la version française.
  //
  // « Épisode » prend sa majuscule : c'est ainsi que l'écrivent les
  // sous-items des quatre autres univers — « Saison 3 Épisode 12 » dans
  // data.js, data-mcu.js, data-dc.js et data-avatar.js, sans une seule
  // exception. Star Trek en portait 380 en minuscule, seul de son espèce.
  [/^Season (\d+) Episode (\d+) \(Original Pilot - The Cage\)$/,
   m => `Saison ${m[1]} Épisode ${m[2]} (pilote d'origine — The Cage)`],
  [/^Season (\d+) Episode (\d+) \(New Pilot - Where No Man Has Gone Before\)$/,
   m => `Saison ${m[1]} Épisode ${m[2]} (nouveau pilote — Where No Man Has Gone Before)`],
  [/^Season (\d+) Episode (\d+) \(The Man Trap\)$/,
   m => `Saison ${m[1]} Épisode ${m[2]} (The Man Trap)`],
  // Season 1 Episodes 12-11  →  Saison 1 Épisodes 12-11
  [/^Season (\d+) Episodes ([\d\s,–-]+)$/,
   m => `Saison ${m[1]} Épisodes ${m[2].trim()}`],
  // « Season 3 Episode 12-14 » : la source écrit parfois le singulier
  // devant une plage. On rend le pluriel, qui est ce que la plage dit.
  [/^Season (\d+) Episode (\d+[–-]\d+)$/,
   m => `Saison ${m[1]} Épisodes ${m[2]}`],
  // Season 2 Episode 5  →  Saison 2 Épisode 5
  [/^Season (\d+) Episode (\d+)$/,
   m => `Saison ${m[1]} Épisode ${m[2]}`],
  // les huit ères : « 21ST CENTURY » → « 21E SIÈCLE »
  [/^(\d+)(?:ST|ND|RD|TH) CENTURY$/, m => `${m[1]}E SIÈCLE`],
];

/* Chaque ligne part au rapport de relecture. */
export const ST_TRADUCTIONS = [

  /* ── les titres restés anglais, à la ponctuation française ─────────
     Discovery, Picard, Strange New Worlds, Lower Decks, Prodigy et
     Enterprise n'ont pas de titre français : le nom ne bouge pas. Le
     deux-points, lui, bouge — le français lui met une espace devant, et
     les quatre autres univers l'écrivent ainsi sans une exception (zéro
     deux-points collé dans data.js, data-mcu.js, data-dc.js et
     data-avatar.js). Les laisser aux identiques donnait une page qui
     écrivait « Star Trek : La Nouvelle Génération » deux lignes au-dessus
     de « Star Trek: Voyager ».

     `Star trek: Lower Decks` est une coquille de la source anglaise, avec
     un t minuscule ; le français la corrige, l'anglais reste à voir. */
  ['Star Trek: Discovery', 'Star Trek : Discovery'],
  ['Star Trek: Picard', 'Star Trek : Picard'],
  ['Star Trek: Strange New Worlds', 'Star Trek : Strange New Worlds'],
  ['Star Trek: Lower Decks', 'Star Trek : Lower Decks'],
  ['Star trek: Lower Decks', 'Star Trek : Lower Decks'],
  ['Star Trek: Prodigy', 'Star Trek : Prodigy'],
  ['Star Trek: Short Treks', 'Star Trek : Short Treks'],
  ['Star Trek: Deep Space Nine', 'Star Trek : Deep Space Nine'],
  ['Star Trek: Voyager', 'Star Trek : Voyager'],
  ['Star Trek: Enterprise', 'Star Trek : Enterprise'],
  ['Star Trek: Section 31', 'Star Trek : Section 31'],
  ['Star Trek: Starfleet Academy', 'Star Trek : Starfleet Academy'],
  // le onzième film est sorti en France sans deux-points ni sous-titre
  ['Star Trek: Into Darkness', 'Star Trek Into Darkness'],

  /* ── les titres, repris de l'exploitation française ─────────────── */
  ['Star Trek: The Original Series', 'Star Trek : La Série originale'],
  ['Star Trek: The Animated Series', 'Star Trek : La Série animée'],
  ['Star Trek: The Motion Picture', 'Star Trek, le film'],
  ['Star Trek II: The Wrath of Khan', 'Star Trek II : La Colère de Khan'],
  ['Star Trek III: The Search for Spock', 'Star Trek III : À la recherche de Spock'],
  ['Star Trek IV: The Voyage Home', 'Star Trek IV : Retour sur Terre'],
  ['Star Trek V: The Final Frontier', 'Star Trek V : L\'Ultime Frontière'],
  ['Star Trek VI: The Undiscovered Country', 'Star Trek VI : Terre inconnue'],
  ['Star Trek: The Next Generation', 'Star Trek : La Nouvelle Génération'],
  ['Star Trek: Generations', 'Star Trek : Générations'],
  ['Star Trek: First Contact', 'Star Trek : Premier Contact'],
  ['Star Trek: Insurrection', 'Star Trek : Insurrection'],
  ['Star Trek: Nemesis', 'Star Trek : Nemesis'],
  ['Star Trek: Beyond', 'Star Trek : Sans limites'],

  /* ── l'univers et son premier écran ─────────────────────────────── */
  ['In-Universe Order', 'Ordre chronologique interne'],
  ['Movies · TV Shows · Animated Shows · Shorts',
   'Films · Séries · Séries animées · Courts métrages'],
  ['Movies · TV Shows · Animated Shows · Shorts — the whole saga from the 21st to the 43rd century.',
   'Films · Séries · Séries animées · Courts métrages — toute la saga, du 21e au 43e siècle.'],
  ['Tick what you have watched, your progress is saved.',
   'Cochez ce que vous avez vu, votre progression est sauvegardée.'],
  ['Updated · August 2026', 'À jour · août 2026'],
  ['Movies', 'Films'],
  ['TV Shows', 'Séries'],
  ['Animated Shows', 'Séries animées'],
  ['248 / 248 shown', '248 / 248 affichées'],
  ['SHORT', 'COURT'],
  ['Why now ?', 'Pourquoi maintenant ?'],

  /* ── les repères, les spoils, la remise à zéro ──────────────────── */
  // « FLASHBACK » s'écrit pareil ; la ligne Kelvin est nommée par les
  // fans comme dans la version française : la chronologie Kelvin.
  ['KELVIN TIMELINE', 'CHRONOLOGIE KELVIN'],
  ['Minor spoilers', 'Spoilers mineurs'],
  ['Major spoilers', 'Spoilers majeurs'],
  ['Reveal the minor spoilers', 'Révéler les spoilers mineurs'],
  ['Reveal the major spoilers', 'Révéler les spoilers majeurs'],
  // la formule des quatre autres univers, au mot près
  ['Reset your Star Trek progress?', 'Réinitialiser ta progression Star Trek ?'],
  // le pied de page compte un univers de plus que celui des autres pages
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead and Dragon Age are trademarks of their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead et Dragon Age sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead and Dragon Age are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead et Dragon Age sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],

  /* ── les huit badges : les grades de Starfleet ──────────────────────
     La version française des séries garde « Commander » et « Commodore »
     et traduit les autres. Le dernier badge est le salut vulcain, qui a
     sa formule consacrée. */
  ['Cadet', 'Cadet'],
  ['Ensign', 'Enseigne'],
  ['Lieutenant', 'Lieutenant'],
  ['Commander', 'Commander'],
  ['Captain', 'Capitaine'],
  ['Commodore', 'Commodore'],
  ['Admiral', 'Amiral'],
  ['Live long and prosper', 'Longue vie et prospérité'],
  ['The 22nd century completed', 'Le 22e siècle terminé'],
  ['The 23rd century completed', 'Le 23e siècle terminé'],
  ['The 24th century completed', 'Le 24e siècle terminé'],
  ['The 25th century completed', 'Le 25e siècle terminé'],
  ['The 31st century completed', 'Le 31e siècle terminé'],
  ['The 32nd century completed', 'Le 32e siècle terminé'],
  ['The 43rd century completed', 'Le 43e siècle terminé'],
  ['Star Trek 100% completed', 'Star Trek terminé à 100 %'],

  /* ── les fragments de gabarit du script de la page ──────────────── */
  ['watched</span><span>', 'vues</span><span>'],
  ['<span class="bu-done" aria-hidden="true"><span>watched</span></span>',
   '<span class="bu-done" aria-hidden="true"><span>vues</span></span>'],
  ['<span class="bn-cta"><span class="lbl">Reveal</span>',
   '<span class="bn-cta"><span class="lbl">Révéler</span>'],

  /* ── l'accroche de la page, nœud de texte par nœud de texte ────────
     Les intitulés reprennent ceux des quatre autres univers :
     « Repères de lecture », « Ce qui est écarté et pourquoi ». */
  ['If you\'re here, it\'s because you want to discover the Star Trek universe in in-universe story order, all the way from the 21st to the 43rd centuries, while making adjustments as needed to ensure an enjoyable viewing experience.',
   'Si vous êtes ici, c\'est que vous souhaitez découvrir l\'univers Star Trek dans l\'ordre de son histoire interne, du 21e au 43e siècle, avec les ajustements nécessaires pour que le visionnage reste agréable.'],
  ['You\'ll find extra details by clicking on each media, and this entire site is guaranteed free of major spoilers.',
   'Vous trouverez des détails supplémentaires en cliquant sur chaque média, et tout ce site est garanti sans spoil majeur.'],
  ['This guide works for first-time watches as well as rewatches.',
   'Ce guide vaut aussi bien pour un premier visionnage que pour un revisionnage.'],
  ['How to read this', 'Repères de lecture'],
  ['THE CALENDAR', 'Le calendrier'],
  ['The timeline of Star Trek is based on our universe so we use the gregorian calendar since the saga follows mostly USA born human main characters.',
   'La chronologie de Star Trek s\'appuie sur notre univers : nous employons donc le calendrier grégorien, puisque la saga suit surtout des personnages humains nés aux États-Unis.'],
  ['They also use a system of "Stardates" but it\'s not consistent through old and modern tv shows and is really hard to understand, but in-universe it eventually makes sense because aliens all use their own calendar system.',
   'Il existe aussi un système de « dates stellaires », mais il n\'est pas cohérent entre les séries anciennes et modernes et il est vraiment difficile à suivre — dans l\'univers, cela finit par se tenir, puisque chaque peuple extraterrestre a son propre calendrier.'],
  ['TIMELINES', 'Les chronologies'],
  ['Star Trek is not one single universe following the timestream, there is time travel and multiple dimensions / universes / timelines.',
   'Star Trek n\'est pas un univers unique qui suivrait le cours du temps : il y a des voyages temporels et plusieurs dimensions, univers et chronologies.'],
  ['SPOILERS', 'Les spoilers'],
  ['Multiple spoiler banners are spread across the timeline, revealing some plot elements. You have Minor Spoilers and Major Spoilers, choose what you want to see or not depending if you have already seen Star Trek medias and know some of the story.',
   'Plusieurs bandeaux de spoil sont posés le long de la timeline et dévoilent des éléments d\'intrigue. Il y a des spoilers mineurs et des spoilers majeurs : choisissez ce que vous voulez voir ou non, selon ce que vous avez déjà vu de Star Trek et ce que vous connaissez de l\'histoire.'],
  ['CONSISTENCY', 'La cohérence'],
  ['Star Trek celebrated its 60th birthday in 2026, this guide covers the saga from the start and we will switch from old shows to modern shows and you will probably see a lot of consistency mistakes. Some characters change personality (and of course face), some events are depicted another way, some technologies disappear... The Original Series is also available in two versions: the classic 1960s version and a CGI- enhanced remastered version made from 2006-08. The remastered versions do not alter the stories in any way making the version you choose a matter of personal preference.',
   'Star Trek a fêté ses 60 ans en 2026 ; ce guide couvre la saga depuis le début, et comme nous passerons des séries anciennes aux séries modernes, vous verrez probablement beaucoup d\'incohérences. Certains personnages changent de personnalité (et bien sûr de visage), certains événements sont racontés autrement, certaines technologies disparaissent… La série originale existe aussi en deux versions : la version classique des années 1960 et une version remasterisée aux effets refaits en images de synthèse entre 2006 et 2008. Les versions remasterisées ne modifient en rien les histoires : le choix de la version tient donc à votre seule préférence.'],
  ['What\'s left out, and why ?', 'Ce qui est écarté et pourquoi'],
  ['1 entry', '1 entrée'],
  ['Books, novels, comics, video games...', 'Livres, romans, comics, jeux vidéo…'],
  ['The Star Trek primary canon is called Alpha Canon and covers only movies and shows, the rest is Beta Canon and can change whenever an autor or director wants to. If you plan on staying stuck in the Star Trek universe for the reste of your life there\'s about 850 novels and hundred of comics waiting for you... We\'ll stay in the cinematographic experience for now.',
   'Le canon principal de Star Trek s\'appelle l\'Alpha Canon et ne couvre que les films et les séries ; le reste est du Beta Canon et peut changer dès qu\'un auteur ou un réalisateur le décide. Si vous comptez rester enfermé dans l\'univers Star Trek pour le restant de vos jours, environ 850 romans et des centaines de comics vous attendent… Nous en restons pour l\'instant à l\'expérience cinématographique.'],

  /* ── les neuf bandeaux posés dans la timeline ───────────────────── */
  ['On this day, Zefram Cochrane invents "warp drive," or faster-than-light travel, which enables humans to first encounter extraterrestrial life, the Vulcans. This is effectively the beginning of Star Trek. We\'ll see this moment but not it until much later in the timeline because it would otherwise make remarkably little sense. For the time being, just think of it as the backstory that initiates everything in the Star Trek world.',
   'Ce jour-là, Zefram Cochrane invente la « distorsion », le voyage plus rapide que la lumière, qui permet aux humains de rencontrer pour la première fois une vie extraterrestre : les Vulcains. C\'est là que commence vraiment Star Trek. Nous verrons ce moment, mais bien plus tard dans la timeline, parce qu\'il n\'aurait sinon presque aucun sens. Pour l\'instant, voyez-le simplement comme l\'arrière-plan qui met tout en marche dans l\'univers de Star Trek.'],
  ['This is where the Earth-Romulan War takes place. Unfortunately, Enterprise was canceled after Season Four, even tho they planned to start covering this in the fifth season. The struggle affects Enterprise and beyond, even tho we don\'t get to see it on television. A loosely organized Coalition of Planets made up of humans, Vulcans, Andorians, and Tellarites successfully defeats the Romulans during the conflict and leads to...',
   'C\'est ici que se déroule la guerre Terre-Romuliens. Enterprise a malheureusement été annulée après la saison quatre, alors qu\'il était prévu de commencer à la raconter dans la cinquième. Le conflit pèse sur Enterprise et sur la suite, même si nous ne le voyons pas à l\'écran. Une Coalition des planètes assez lâche, formée d\'humains, de Vulcains, d\'Andoriens et de Tellarites, l\'emporte sur les Romuliens et mène à…'],
  ['...the United Federation of Planets, the main political setting of the Star Trek franchise, is formed as a direct result of this Coalition after the conflict.',
   '…la Fédération des planètes unies, le cadre politique principal de la franchise Star Trek, née directement de cette Coalition une fois le conflit terminé.'],
  ['Star Trek then centers on the Federation, showing its times of expansion, decline, war, and peace.',
   'Star Trek se recentre alors sur la Fédération, et montre ses périodes d\'expansion, de déclin, de guerre et de paix.'],
  ['In the Star Trek franchise, there are two primary "universes": the Prime timeline, which includes pretty much everything, and the Kelvin timeline, which consists of three feature films. Events that split the universe into the Kelvin and Prime timelines take place this year, 2233. In this viewing sequence, we will continue to use the Prime timeline for the time being, but we will consider the Kelvin timeline in the future. Note the existence of the "Mirror" universe, a third reality, and sporadic other timelines. Our travels there will, however, be integrated into the Prime episodes for simplicity\'s sake.',
   'La franchise Star Trek compte deux « univers » principaux : la chronologie Prime, qui contient à peu près tout, et la chronologie Kelvin, qui tient en trois longs métrages. Les événements qui séparent l\'univers en chronologies Kelvin et Prime ont lieu cette année-là, en 2233. Dans cet ordre de visionnage, nous restons pour l\'instant dans la chronologie Prime, et nous prendrons la chronologie Kelvin plus tard. Notez l\'existence de l\'univers « Miroir », une troisième réalité, et d\'autres chronologies de temps en temps. Nos passages là-bas restent intégrés aux épisodes Prime, par simplicité.'],
  ['The USS Kelvin flies through space, exploring strange new worlds.',
   'L\'USS Kelvin file dans l\'espace, à la découverte de nouveaux mondes étranges.'],
  ['In the Prime universe, nothing happens and all is well. This is the universe we will be staying in for now.',
   'Dans l\'univers Prime, il ne se passe rien et tout va bien. C\'est l\'univers dans lequel nous restons pour l\'instant.'],
  ['This is where the movie Star Trek: Section 31 is set, but because of time travel magic, it has characters and storylines that you haven\'t even begun to get to know yet, so we\'ll watch it much later in the chronology.',
   'C\'est ici que se situe le film Star Trek : Section 31, mais par la magie du voyage dans le temps, il met en scène des personnages et des intrigues que vous n\'avez pas encore commencé à connaître : nous le regarderons donc bien plus tard dans la chronologie.'],
  ['So, the Romulan empire is destroyed in 2387 when the Romulan sun explodes. The Romulan mining ship Narada is inadvertently sent back to 2233 as a result of Starfleet\'s futile attempt to stop this, establishing an other reality known to fans as the "Kelvin Timeline" or "Kelvinverse" and referred to in-universe as the Narada Incursion. Next, we\'ll see the three films that are situated in this universe. It\'s important to remember that this new chronology DOES NOT take the place of the original "Prime" timeline, which is still in use and will soon be revisited.',
   'L\'empire romulien est donc détruit en 2387, quand le soleil romulien explose. Le vaisseau minier romulien Narada est renvoyé par accident en 2233 à la suite de la tentative vaine de Starfleet pour l\'empêcher, ce qui établit une autre réalité, appelée par les fans « chronologie Kelvin » ou « Kelvinverse », et nommée dans l\'univers l\'incursion du Narada. Nous verrons ensuite les trois films situés dans cet univers. Il est important de retenir que cette nouvelle chronologie NE REMPLACE PAS la chronologie « Prime » d\'origine, toujours en cours, et que nous retrouverons bientôt.'],

  /* ── les trente réponses de FAQ ─────────────────────────────────── */
  ['We begin with Star Trek: Enterprise, which up until season three was simply called Enterprise. Despite being the first in the timeline, this story was actually the sixth Star Trek series produced, and as such, it contains numerous deliberate foreshadowings about what will happen in the future.\nWhile we will flip episodes 11 and 12 from this season and postpone some episodes from Seasons 2 and 4 until later in the viewing sequence, we generally stick to the release order.',
   'Nous commençons par Star Trek : Enterprise, qui s\'appelait simplement Enterprise jusqu\'à la troisième saison. Bien qu\'elle soit la première de la timeline, cette histoire est en réalité la sixième série Star Trek produite, et elle contient à ce titre de nombreuses annonces volontaires de ce qui arrivera plus tard.\nNous inverserons les épisodes 11 et 12 de cette saison et repousserons quelques épisodes des saisons 2 et 4 à plus loin dans l\'ordre de visionnage, mais nous suivons globalement l\'ordre de diffusion.'],
  ['This viewing order flips episodes 11 and 12 to respect in-episode calendar dates, but it doesn’t actually have any real significance otherwise.',
   'Cet ordre de visionnage inverse les épisodes 11 et 12 pour respecter les dates du calendrier données dans les épisodes, mais cela n\'a pas vraiment d\'importance par ailleurs.'],
  ['Since episode 23 ("Regeneration") depends on knowledge of future events that you won\'t yet have, we will be delaying it until later in this viewing order. To be clear, you will have seen every single Star Trek episode in a way that guaranties they make sense by the conclusion of the viewing order. This is the first of a few times we will skip episodes like this.',
   'Comme l\'épisode 23 (« Regeneration ») repose sur des événements futurs que vous ne connaissez pas encore, nous le repoussons à plus tard dans cet ordre de visionnage. Pour être clair : à la fin de l\'ordre de visionnage, vous aurez vu chaque épisode de Star Trek, et d\'une façon qui garantit qu\'ils ont du sens. C\'est la première des quelques fois où nous sauterons des épisodes de cette manière.'],
  ['Please pay attention to the episode numbers as we will be skipping episodes 18, 19, and 22 until later in the chronology.',
   'Faites attention aux numéros d\'épisodes : nous sautons les épisodes 18, 19 et 22 jusqu\'à plus tard dans la chronologie.'],
  ['Even tho we\'re leaving Enterprise after this year, we\'ll come back to see the series finale episode 22 as well as the omitted episodes 18 and 19. Rather, we\'re heading out on a two-parter, which is almost universally seen as a better conclusion for this section of the narrative.',
   'Même si nous quittons Enterprise après cette année-là, nous reviendrons voir l\'épisode 22, le final de la série, ainsi que les épisodes 18 et 19 laissés de côté. Nous partons plutôt sur un double épisode, que presque tout le monde considère comme une meilleure conclusion pour cette partie du récit.'],
  ['This is our first "Short Treks" episode, which is an adaption of a (real) ancient African narrative told to a young girl we will later meet as an adult. These mini-episodes will sporadically occur throughout this list and are not associated with any particular period or location in the Star Trek franchise.',
   'C\'est notre premier épisode « Short Treks », l\'adaptation d\'un (vrai) récit africain ancien raconté à une petite fille que nous retrouverons adulte plus tard. Ces mini-épisodes reviennent de temps en temps dans cette liste et ne sont liés à aucune époque ni à aucun lieu particulier de la franchise Star Trek.'],
  ['We arrive at The Cage, the first Star Trek episode ever made, which aired in 1965. After NBC rejected the show because it was "too cerebral," studio owner Lucille Ball persuaded the network to give it another shot and they filmed another pilot. This one was released later and retrofited into canon. Although "The Menagerie", a subsequent episode, uses a lot of The Cage\'s footage, you should watch both.',
   'Nous voici à The Cage, le tout premier épisode de Star Trek jamais tourné, diffusé en 1965. Après que NBC a rejeté la série parce qu\'elle était « trop cérébrale », Lucille Ball, propriétaire du studio, a convaincu la chaîne de lui laisser une seconde chance et un autre pilote a été tourné. Celui-ci est sorti plus tard et a été rattaché au canon après coup. « The Menagerie », un épisode ultérieur, reprend beaucoup d\'images de The Cage, mais regardez tout de même les deux.'],
  ['We now start Star Trek: Discovery, the second series in chronological order but the seventh Star Trek series released. Additionally, it is the first series to drastically change the visual designs, breaking with the preconceived notion that the 23rd century will resemble the original series from the 1960s. The designs are updated, and we are expected to believe that they have always looked this way. This includes alien cosmetics, ships, uniforms, and more. Particularly, the Klingons had a major overhaul, however it was largely changed again after the first season. We could nitpick specifics if we wanted to, but they are not continuity issues and shouldn\'t be seen as such.',
   'Nous commençons maintenant Star Trek : Discovery, la deuxième série dans l\'ordre chronologique, mais la septième sortie. C\'est aussi la première à changer radicalement les partis pris visuels, en rompant avec l\'idée reçue selon laquelle le 23e siècle devrait ressembler à la série originale des années 1960. Les designs sont modernisés, et l\'on attend de nous que nous croyions qu\'ils ont toujours été ainsi : maquillages extraterrestres, vaisseaux, uniformes, et le reste. Les Klingons, en particulier, ont été profondément refondus — puis largement remaniés à nouveau après la première saison. On pourrait chipoter sur les détails, mais ce ne sont pas des erreurs de continuité et il ne faut pas les voir comme telles.'],
  ['When watching in this order, there is a peculiarity in episode 10 when the USS Defiant is, to avoid spoilers, not where it should be. Don\'t worry about it; the show assumes we already know the answer. When we get to 2268, we\'ll find out why, but for now, it has no bearing whatsoever on the plot of Discovery.',
   'Dans cet ordre de visionnage, une bizarrerie apparaît à l\'épisode 10, quand l\'USS Defiant n\'est pas — sans spoiler — là où il devrait être. Ne vous en souciez pas : la série suppose que nous connaissons déjà la réponse. Nous saurons pourquoi en arrivant à 2268 ; pour l\'instant, cela n\'a aucune incidence sur l\'intrigue de Discovery.'],
  ['Even tho there are still episodes of Discovery to watch, it should be obvious why we are suspending our viewing after watching the episode mentioned above. We\'ll return to Discovery when it\'s time to finish the series.',
   'Même s\'il reste des épisodes de Discovery à voir, la raison pour laquelle nous interrompons le visionnage après l\'épisode ci-dessus devrait être évidente. Nous reviendrons à Discovery quand il sera temps de terminer la série.'],
  ['Skipping episode 7 until later in the guide…',
   'On saute l\'épisode 7 jusqu\'à plus loin dans le guide…'],
  ['With most of the iconic Star Trek crew from the 1960s, this is the second Original Series pilot that Lucille Ball battled for. Although there still aren\'t some of the main characters yet, Kirk has a different middle initial, and the sets and uniforms are still a little off, we are finally able to identify ourselves in the world of the program that began it all.',
   'Avec l\'essentiel de l\'équipage emblématique des années 1960, voici le second pilote de la série originale, celui pour lequel Lucille Ball s\'est battue. Certains personnages principaux manquent encore, l\'initiale du deuxième prénom de Kirk n\'est pas la bonne, les décors et les uniformes ne sont pas tout à fait au point — mais nous reconnaissons enfin l\'univers de la série qui a tout commencé.'],
  ['To be clear, compared to the other Star Trek series we have seen thus far, the original Star Trek will seem less sophisticated in terms of its designs and esthetics, but this is only because of the constraints of television production at the time. This is not "true" in terms of the plot; the technology and society in TOS should be interpreted as being comparable to those in Discovery and Strange New Worlds, both of which occur at roughly this same point in time, and the Enterprise should be recognized as being the exact same ship that Pike commanded in Strange New Worlds despite its different appearance.\nRegarding the actual watching sequence, it is advised to watch TOS in production order rather than by air date in order to fully appreciate the show\'s evolution. Generally speaking, don\'t become overly fixated on continuity with the rest of the series during these early stages; it takes a long time to establish certain aspects that the rest of the brand takes for granted.\nEpisode 11 "The Menagerie" is largely reedited from The Cage, which we watched a while back, but don’t skip it - after spending so much time with Spock and Pike since, this episode is absolutely essential.',
   'Pour être clair : comparée aux autres séries Star Trek vues jusqu\'ici, la série originale paraîtra moins sophistiquée dans ses designs et son esthétique, mais c\'est uniquement dû aux contraintes de la production télévisée de l\'époque. Ce n\'est pas « vrai » du point de vue de l\'intrigue : la technologie et la société de TOS doivent être comprises comme comparables à celles de Discovery et de Strange New Worlds, qui se déroulent à peu près à la même période, et l\'Enterprise doit être reconnu comme exactement le même vaisseau que celui commandé par Pike dans Strange New Worlds, malgré son apparence différente.\nQuant à l\'ordre de visionnage lui-même, il est conseillé de regarder TOS dans l\'ordre de production plutôt que dans l\'ordre de diffusion, pour bien apprécier l\'évolution de la série. De manière générale, ne vous focalisez pas trop sur la continuité avec le reste de la saga à ces débuts-là : certains aspects que la marque tient ensuite pour acquis mettent longtemps à s\'installer.\nL\'épisode 11, « The Menagerie », est en grande partie remonté à partir de The Cage, que nous avons vu il y a un moment, mais ne le sautez pas : après avoir passé tant de temps avec Spock et Pike depuis, cet épisode est absolument essentiel.'],
  ['This part is one of the most entertaining examples of how the programs connect. A TOS episode that leads into two of the Enterprise episodes we skipped, plus we finally learn why the Discovery found the USS Defiant in the Mirror Universe.',
   'Ce passage est l\'un des exemples les plus réjouissants de la façon dont les séries se répondent. Un épisode de TOS qui amène deux des épisodes d\'Enterprise que nous avions sautés, et nous apprenons enfin pourquoi le Discovery a trouvé l\'USS Defiant dans l\'univers Miroir.'],
  ['Star Trek: The Animated Series brings Kirk\'s Five-Year Mission to an end. Is TAS completely canon? Maybe. Later works in the franchise, such as Enterprise\'s Vulcan arc and many more seemed to contradict Star Trek creator Gene Roddenberry\'s later claims that it wasn\'t. Therefore, I don\'t see any reason not to regard it as canonical as everything else.',
   'Star Trek : La Série animée met un terme à la mission de cinq ans de Kirk. TAS est-elle entièrement canon ? Peut-être. Des œuvres ultérieures de la franchise, comme l\'arc vulcain d\'Enterprise et bien d\'autres, semblent contredire Gene Roddenberry, créateur de Star Trek, qui a affirmé plus tard qu\'elle ne l\'était pas. Je ne vois donc aucune raison de ne pas la tenir pour aussi canonique que le reste.'],
  ['It\'s time for the first movie! For the background: a new Star Trek series called "Star Trek Phase II" was supposed to serve as the foundation for Paramount\'s planned new network. They decided to pick one of the scripts and turn it into a (very long) movie after network plans failed and Star Wars became a smashing hit.\nSo, is it far too long for the amount of story it contains? Yes, but it\'s also charming. In any case, either version works narratively, but if you have access to it, I suggest the Director\'s Cut, which has far better pacing and replaces some really bad effects.',
   'Place au premier film ! Pour le contexte : une nouvelle série, « Star Trek Phase II », devait servir de socle à la chaîne que Paramount projetait de lancer. Les plans de chaîne ayant échoué et Star Wars étant devenu un succès retentissant, ils ont décidé de prendre l\'un des scénarios et d\'en faire un film (très long).\nAlors, est-il beaucoup trop long pour ce qu\'il raconte ? Oui, mais il a aussi son charme. Les deux versions se tiennent sur le plan du récit ; si vous y avez accès, je conseille le Director\'s Cut, dont le rythme est bien meilleur et qui remplace quelques effets vraiment ratés.'],
  ['Ephraim and Dot ’s continuity really makes no sense anywhere, but it’s cute so who cares. Anyway, this seemed the best place to put it.',
   'La continuité d\'Ephraim and Dot n\'a de sens nulle part, mais c\'est mignon, alors peu importe. Quoi qu\'il en soit, c\'est ici que sa place semblait la meilleure.'],
  ['Sidenote: The opening sequence of the film Star Trek: Generations takes place this year, a few months after The Undiscovered Country. I very much do not expect people to watch things in pieces, but as there IS a clear delineation in the film, you can, optionally, watch the beginning of Generations and stop when the “78 years later” caption comes up.\nOr you can just not worry about it, and watch the whole film in one sitting when we reach it.',
   'À noter : la séquence d\'ouverture du film Star Trek : Générations se déroule cette année-là, quelques mois après Terre inconnue. Je n\'attends vraiment de personne qu\'il regarde les choses en morceaux, mais comme il y a bel et bien une coupure nette dans le film, vous pouvez, si vous le souhaitez, regarder le début de Générations et vous arrêter à l\'apparition du carton « 78 ans plus tard ».\nOu vous pouvez ne pas vous en soucier, et voir le film d\'une traite quand nous y arriverons.'],
  ['Now, we fast-forward about 70 years to a much more developed Federation and Star Trek: The Next Generation, which is arguably the most well-known and cherished Star Trek series to date. However, you will need to give it some time because it is very difficult at first. I assure you that the show improves significantly with time and merits the admiration it still enjoys now.',
   'Nous avançons maintenant d\'environ 70 ans, vers une Fédération bien plus développée et vers Star Trek : La Nouvelle Génération, sans doute la série Star Trek la plus connue et la plus aimée à ce jour. Il faudra toutefois lui laisser du temps, car elle est très difficile au début. Je vous assure qu\'elle s\'améliore nettement au fil des saisons et qu\'elle mérite l\'admiration dont elle jouit encore aujourd\'hui.'],
  ['Star Trek\'s first major attempt at serialized narrative will finally appear in Star Trek: Deep Space Nine. It starts out slowly, just like past programs in the genre, but once it gets rolling, it\'s a true delight. We will alternate between TNG and DS9, and then DS9 and Voyager, to maintain the proper chronological order, with sporadic small adjustments to prevent disrupting ongoing story arcs.',
   'La première grande tentative de récit feuilletonnant de Star Trek arrive enfin avec Star Trek : Deep Space Nine. Elle démarre lentement, comme les séries du genre avant elle, mais une fois lancée, c\'est un vrai régal. Nous alternerons entre TNG et DS9, puis entre DS9 et Voyager, pour tenir l\'ordre chronologique, avec quelques petits ajustements de temps en temps pour ne pas couper un arc en cours.'],
  ['Like Phase II was intented to do, Voyager was introduced as the focal point of a new network, the short-lived UPN (which ultimately became The CW). Keep in mind that because to various oddities in production, Voyager episode orders, especially in season two, fluctuate a little.',
   'Comme Phase II devait le faire, Voyager a été lancée comme la locomotive d\'une nouvelle chaîne, l\'éphémère UPN (devenue plus tard The CW). Gardez en tête qu\'en raison de diverses bizarreries de production, l\'ordre des épisodes de Voyager, surtout en saison deux, varie un peu.'],
  ['222 years later, Enterprise is officially finished and explains some plot elements of The Next Generation.',
   '222 ans plus tard, Enterprise se termine officiellement et éclaire certains éléments d\'intrigue de La Nouvelle Génération.'],
  ['We are skipping Voyager episode 23 for now, and will be watching it later.',
   'Nous sautons pour l\'instant l\'épisode 23 de Voyager, que nous regarderons plus tard.'],
  ['This movie doesn\'t really make sense anywhere, but this is perhaps the best place to put it.',
   'Ce film n\'a vraiment sa place nulle part, mais c\'est sans doute ici qu\'il tient le mieux.'],
  ['Star Trek returns to animation with its ninth series, and first all-out comedy, aimed towards a more adult audience than The Animated Series. It references pretty much all the shows and has various cameos and easter eggs.',
   'Star Trek revient à l\'animation avec sa neuvième série, et sa première vraie comédie, visant un public plus adulte que La Série animée. Elle fait référence à peu près à toutes les séries et multiplie les caméos et les clins d\'œil.'],
  ['Star Trek: Prodigy, which takes place on the edge of the Delta Quadrant last seen in Voyager and featuring the return of various characters, is the first Star Trek since The Animated Series designed primarily for children. However, don\'t write off this as "just a kids show" since it\'s really great, sophisticated, and Star Trek.',
   'Star Trek : Prodigy, qui se déroule aux confins du quadrant Delta vu pour la dernière fois dans Voyager et qui ramène plusieurs personnages, est le premier Star Trek depuis La Série animée conçu d\'abord pour les enfants. Ne la balayez pas d\'un « c\'est juste une série pour enfants » : elle est vraiment très bonne, très fine, et c\'est du Star Trek.'],
  ['This film did not perform to expectations, meaning that the long-promised fourth film has been in-and-out of production for years, and I cannot say if we’ll ever see the Kelvin timeline again.\nTherefore, we now return to the Prime timeline, already in progress, fourteen years after the attack on Mars we saw at the end of Prodigy.',
   'Ce film n\'a pas rencontré le succès espéré : le quatrième, promis de longue date, entre et sort de production depuis des années, et je ne saurais dire si nous reverrons un jour la chronologie Kelvin.\nNous revenons donc à la chronologie Prime, déjà en cours, quatorze ans après l\'attaque de Mars vue à la fin de Prodigy.'],
  ['You\'ll see why the precise positioning can be disputed as you watch this, but roughly 3074 looked ideal. We finish Star Trek: Voyager with this episode. Remember that this entire episode is set in the Delta quadrant, which is far from the majority of the franchise\'s prior and subsequent events.',
   'Vous verrez en le regardant pourquoi son placement exact peut se discuter, mais 3074 semblait à peu près idéal. Cet épisode termine Star Trek : Voyager. Rappelez-vous qu\'il se déroule entièrement dans le quadrant Delta, loin de la plupart des événements de la franchise, avant comme après.'],
  ['Last we saw the Discovery crew, they were sent far into the future. Several hundred years later, we rejoin Star Trek: Discovery, to find a very different Federation…',
   'La dernière fois que nous avons vu l\'équipage du Discovery, il était envoyé loin dans le futur. Plusieurs siècles plus tard, nous retrouvons Star Trek : Discovery, et une Fédération très différente…'],
  ['While the Section 31 movie actually takes place way back in 2324, it wouldn’t have made sense why Georgiou was there if you’d watched it then.',
   'Le film Section 31 se déroule en réalité bien plus tôt, en 2324, mais la présence de Georgiou n\'aurait eu aucun sens si vous l\'aviez regardé à ce moment-là.'],
];
