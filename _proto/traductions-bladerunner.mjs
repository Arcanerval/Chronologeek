/* ═══ LE FRANÇAIS ÉCRIT DE BLADE RUNNER ════════════════════════════════
   Trois listes, et la distinction compte.

   `BR_IDENTIQUES` — ce qui ne se traduit pas. Rien n'y est écrit, donc
   rien n'en repart à la relecture. Les titres sans deux-points y sont
   tous : les deux films et les trois séries de comics datées portent le
   même nom dans les deux langues, y compris chez Delcourt, qui a publié
   Blade Runner 2019 et Blade Runner 2029 sous leur titre d'origine.

   `BR_RETROUVES` — les titres d'exploitation française. Il n'y en a
   aucun : rien, dans cette saga, n'a changé de nom en traversant.

   `BR_TRADUCTIONS` — ce qui est vraiment écrit : l'accroche, les deux
   repères de lecture, ce qui est écarté, les trois ères, les cinq badges
   et les dix synopsis de comics. **Les titres à deux-points y sont
   aussi** : le nom ne se traduit pas, la ponctuation si — c'est la règle
   de Star Trek.
   ═════════════════════════════════════════════════════════════════════ */

export const BR_IDENTIQUES = [
  /* l'univers, et les titres que la ponctuation ne touche pas */
  'Blade Runner',
  'Blade Runner 2019',
  'Blade Runner 2019 1-4',
  'Blade Runner 2019 5-12',
  'Blade Runner 2029',
  'Blade Runner 2039',
  'Blade Runner 2049',
  /* la page elle-même, et ce qui n'est pas du texte affiché */
  'Chronologeek — Blade Runner (proto E)',
  'chronologeek-bladerunner.json',
  'bladerunner',
  'cg-proto-bladerunner',
  /* le code de ligne, et les clés de type lues par le compteur du premier écran */
  'BR', 'film', 'short', 'anime',
  '/images/bladerunnertimeline.webp',
  // la plaque de station du plan de métro : le code de ligne ne se traduit pas
  '<span class="stn-k"><span class="code">BR</span>',
];

export const BR_RETROUVES = [];

export const BR_TRADUCTIONS = [
  /* ── les titres : le nom reste, le deux-points prend son espace ──── */
  ['FCBD 2021: Blade Runner: Origins', 'FCBD 2021 : Blade Runner : Origins'],
  ['Blade Runner: Origins', 'Blade Runner : Origins'],
  ['FCBD 2020: Blade Runner 2019', 'FCBD 2020 : Blade Runner 2019'],
  ['Blade Runner: Tokyo Nexus', 'Blade Runner : Tokyo Nexus'],
  ['Blade Runner: Black Out 2022', 'Blade Runner : Black Out 2022'],
  ['FCBD 2021: Blade Runner 2029', 'FCBD 2021 : Blade Runner 2029'],
  ['Blade Runner: Black Lotus', 'Blade Runner : Black Lotus'],
  ['Blade Runner: Black Lotus - Leaving L.A.', 'Blade Runner : Black Lotus - Leaving L.A.'],
  ['Blade Runner: Black Lotus - Las Vegas', 'Blade Runner : Black Lotus - Las Vegas'],
  ['Blade Runner: 2036 Nexus Dawn', 'Blade Runner : 2036 Nexus Dawn'],
  ['Blade Runner: 2048 Nowhere to Run', 'Blade Runner : 2048 Nowhere to Run'],

  /* ── l'accroche, et les deux repères de lecture ──────────────────── */
  ['If you’re here it’s either because you watched the movies and want to discover the other '
   + 'media or want to watch and read everything at once. If you don’t want to read the comics, '
   + 'just uncheck them, they are bonus content. This guide is spoiler free like the others.',
   'Si vous êtes ici, c’est soit parce que vous avez vu les films et que vous voulez découvrir '
   + 'les autres médias, soit parce que vous voulez tout regarder et tout lire d’un coup. Si '
   + 'vous ne voulez pas lire les comics, décochez-les simplement : c’est du contenu bonus. Ce '
   + 'guide est sans spoiler, comme les autres.'],
  ['This guide works for first-time watch as well as rewatches.',
   'Ce guide convient aussi bien à une première découverte qu’à un revisionnage.'],
  ['The saga happens in &quot;our&quot; world so we’ll count in years like we do.',
   'La saga se déroule dans « notre » monde : on compte donc les années comme nous le faisons.'],
  ['The first movie is an adaptation of the 1968 novel &quot;Do Androids Dream of Electric '
   + 'Sheep?&quot; by Philip K. Dick, and this book has sequels, prequels and various '
   + 'adaptations. Here we only follow the canon around this movie and its sequel.',
   'Le premier film est une adaptation du roman de 1968 « Les androïdes rêvent-ils de moutons '
   + 'électriques ? » de Philip K. Dick, et ce livre a des suites, des préquelles et diverses '
   + 'adaptations. Ici, on ne suit que le canon autour de ce film et de sa suite.'],

  /* ── ce qui n'y est pas ──────────────────────────────────────────── */
  ['What’s left out and why?', 'Ce qui n’y est pas, et pourquoi ?'],
  ['Novels and novelizations', 'Les romans et les novélisations'],
  ['Novels and novelizations: not canon', 'Les romans et les novélisations : pas canon'],
  ['Games', 'Les jeux'],
  ['Games: not canon, not available anymore, VR only or no global story',
   'Les jeux : pas canon, plus disponibles, uniquement en VR ou sans histoire d’ensemble'],

  /* ── les trois ères ──────────────────────────────────────────────── */
  ['The Tyrell Era', 'L’ère Tyrell'],
  ['The Blackout', 'Le Blackout'],
  ['The Wallace Era', 'L’ère Wallace'],
  ['ERA 1', 'ÈRE 1'], ['ERA 2', 'ÈRE 2'], ['ERA 3', 'ÈRE 3'],

  /* ── la note du film, comme « Version Ultimate Edition !!! » chez DC ── */
  ['⚠️ Final Cut version!!!', '⚠️ Version Final Cut !!!'],

  /* ── les dix synopsis de comics ──────────────────────────────────── */
  ['A short story from the Free Comic Book Day 2021 special, set alongside Blade Runner: '
   + 'Origins: LAPD Detective Cal Moreaux and the case of a Tyrell Corporation bioengineer '
   + 'found dead.',
   'Une courte histoire tirée du numéro spécial du Free Comic Book Day 2021, en marge de Blade '
   + 'Runner : Origins : l’inspecteur Cal Moreaux, du LAPD, et l’affaire d’une bio-ingénieure '
   + 'de la Tyrell Corporation retrouvée morte.'],
  ['Los Angeles, 2009. LAPD Detective Cal Moreaux is sent to look into the apparent suicide of '
   + 'a Tyrell Corporation bioengineer. The case quickly stops looking like a suicide, and puts '
   + 'him on the trail of an experimental replicant that went missing the same night. This is '
   + 'the story of the first Blade Runner.',
   'Los Angeles, 2009. L’inspecteur Cal Moreaux, du LAPD, est envoyé enquêter sur le suicide '
   + 'apparent d’une bio-ingénieure de la Tyrell Corporation. L’affaire cesse vite de ressembler '
   + 'à un suicide, et le met sur la piste d’un réplicant expérimental disparu la même nuit. '
   + 'C’est l’histoire du premier Blade Runner.'],
  ['2026. Ash is far from Los Angeles, hiding in the Off-world colonies, and a new bounty hunter is on her trail. The second and third arcs of Blade Runner 2019, the ones that bring her back home.',
   '2026. Ash est loin de Los Angeles, cachée dans les colonies de l’espace, et un nouveau chasseur de primes est sur sa piste. Les deuxième et troisième arcs de Blade Runner 2019, ceux qui la ramènent chez elle.'],
  ['A short Free Comic Book Day story about the childhood of Aahna “Ash” Ashina: a sick girl '
   + 'raised by her grandmother in Los Angeles after her mother left for the Off-world '
   + 'colonies, years before she becomes a Blade Runner.',
   'Une courte histoire du Free Comic Book Day sur l’enfance d’Aahna « Ash » Ashina : une '
   + 'petite fille malade, élevée par sa grand-mère à Los Angeles après le départ de sa mère '
   + 'pour les colonies de l’espace, des années avant qu’elle ne devienne Blade Runner.'],
  ['Tokyo, 2015. Stix and Mead, two veterans of the Kalanthia war, set up as private '
   + 'detectives while they hunt the comrade who abandoned them on the battlefield. A '
   + 'missing-person case drops them in the middle of a patent war between the Yakuza, the '
   + 'Tyrell Corporation and a rival corporation.',
   'Tokyo, 2015. Stix et Mead, deux vétérans de la guerre de Kalanthia, s’installent comme '
   + 'détectives privés tout en traquant le camarade qui les a abandonnés sur le champ de '
   + 'bataille. Une affaire de disparition les jette au milieu d’une guerre de brevets entre '
   + 'les Yakuzas, la Tyrell Corporation et une société rivale.'],
  ['Los Angeles, 2019. Detective Aahna “Ash” Ashina, one of the first Blade Runners, is hired '
   + 'to find the missing wife and daughter of a powerful businessman. The deeper she digs, '
   + 'the more the case forces her to choose between her client, her career and the people '
   + 'she was sent to find.',
   'Los Angeles, 2019. L’inspectrice Aahna « Ash » Ashina, l’une des premières Blade Runners, '
   + 'est engagée pour retrouver la femme et la fille disparues d’un puissant homme d’affaires. '
   + 'Plus elle creuse, plus l’affaire l’oblige à choisir entre son client, sa carrière et '
   + 'celles qu’on l’a envoyée retrouver.'],
  ['A short story from the Free Comic Book Day 2021 special, set alongside Blade Runner 2029: '
   + 'Ash is back on the streets of Los Angeles, seven years after the Blackout.',
   'Une courte histoire tirée du numéro spécial du Free Comic Book Day 2021, en marge de Blade '
   + 'Runner 2029 : Ash est de retour dans les rues de Los Angeles, sept ans après le Blackout.'],
  ['Los Angeles, 2029. Replicants are banned and the Tyrell Corporation is bankrupt. Back on '
   + 'the job as a Blade Runner, Ash investigates replicants said to be working on the '
   + 'Sepulveda Sea Wall, and crosses the path of one she failed to retire years earlier — who '
   + 'is now raising an army.',
   'Los Angeles, 2029. Les réplicants sont interdits et la Tyrell Corporation a fait faillite. '
   + 'Redevenue Blade Runner, Ash enquête sur des réplicants qui travailleraient sur la digue '
   + 'de Sepulveda, et recroise celui qu’elle n’avait pas réussi à retirer des années plus tôt '
   + '— et qui lève désormais une armée.'],
  ['Picks up right after the finale of the animated show: Elle leaves Los Angeles behind and '
   + 'tries to build herself a new life.',
   'Reprend juste après le final de la série animée : l’héroïne, Elle, quitte Los Angeles et '
   + 'tente de se construire une nouvelle vie.'],
  ['Elle finds a community of replicants living in Las Vegas, while a squad of mercenaries '
   + 'working for Niander Wallace closes in on her.',
   'Elle, l’héroïne de la série, trouve une communauté de réplicants installée à Las Vegas, '
   + 'tandis qu’une escouade de mercenaires au service de Niander Wallace se rapproche.'],
  ['Los Angeles, 2039. Niander Wallace’s new replicants obey without question, and one of '
   + 'them, Luv, is now a Blade Runner hunting older models. Someone from Ash’s first case '
   + 'comes back to the city to ask for her help. The conclusion of Ash’s story, begun in '
   + 'Blade Runner 2019.',
   'Los Angeles, 2039. Les nouveaux réplicants de Niander Wallace obéissent sans discuter, et '
   + 'l’une d’entre eux, Luv, est désormais une Blade Runner qui traque les anciens modèles. '
   + 'Quelqu’un de la première affaire d’Ash revient en ville lui demander son aide. La '
   + 'conclusion de l’histoire d’Ash, commencée dans Blade Runner 2019.'],

  /* ── les cinq badges ─────────────────────────────────────────────── */
  ['More Human Than Human', 'Plus humain que l’humain'],
  ['The Tyrell era completed', 'L’ère Tyrell terminée'],
  ['Lights Out', 'Extinction des feux'],
  ['The Blackout completed', 'Le Blackout terminé'],
  ['Cells Interlinked', 'Cellules interconnectées'],
  ['The Wallace era completed', 'L’ère Wallace terminée'],
  ['Everything on screen watched', 'Les films, les courts et la série vus'],
  ['Tears in Rain', 'Des larmes dans la pluie'],
  ['Blade Runner 100% completed', 'Blade Runner terminé à 100 %'],

  /* ── le reste du gabarit, propre à cet univers ───────────────────── */
  ['Reset your Blade Runner progress?', 'Réinitialiser votre progression Blade Runner ?'],
  ['Movies · Shorts · Show · Comics', 'Films · Courts métrages · Série · Comics'],
  ['Movies · Shorts · Show · Comics — the whole Blade Runner universe in its most optimized '
   + 'order.',
   'Films · Courts métrages · Série · Comics — tout l’univers Blade Runner dans son ordre le '
   + 'plus optimisé.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil and Blade Runner are '
   + 'trademarks of their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil et Blade Runner sont des '
   + 'marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil and Blade Runner are '
   + 'trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil et Blade Runner sont des '
   + 'marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
  /* les cases du tableau du premier écran */
  ['Shorts', 'Courts'],
  ['Show', 'Série'],
  // le plan de métro
  ['Blade Runner line map', 'Plan de la ligne Blade Runner'],
  ['Blade Runner line complete', 'Ligne Blade Runner terminée'],
  ['<p><b>Terminus</b><span>End of the Blade Runner line ·', '<p><b>Terminus</b><span>Fin de la ligne Blade Runner ·'],

  /* l'ordre de sortie, posé le 21 octobre 2026 : l'accroche et les trois
     ères, découpées par période de production */
  ['This guide follows the order the works came out, from 1982 to today, but you can switch back to a chronological version higher up.',
   'Ce guide suit ici l’ordre de sortie des œuvres, de 1982 à aujourd’hui, mais vous pouvez repasser à une version chronologique plus haut.'],
  ['The Films · 1982-2017', 'Les films · 1982-2017'],
  ['The Titan Comics · 2019-2021', 'Les comics Titan · 2019-2021'],
  ['The Black Lotus Era · 2021-2025', 'L’ère Black Lotus · 2021-2025'],

  /* les regroupements de l'ordre de sortie, 22 octobre 2026 */
  ['Blade Runner 2019 1-12', 'Blade Runner 2019 1-12'],
  ['FCBD 2021: Blade Runner', 'FCBD 2021 : Blade Runner'],
  ['Blade Runner 2029', 'Blade Runner 2029'],
];

export const BR_GABARITS = [
  /* « Updated · October 2026 » est une forme, pas un libellé : le mois
     change à chaque ajout. Le gabarit passe avant le lexique. */
  [/^Updated · (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
    m => `Mis à jour · ${({ January: 'janvier', February: 'février', March: 'mars', April: 'avril',
      May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre',
      October: 'octobre', November: 'novembre', December: 'décembre' })[m[1]]} ${m[2]}`],
  [/^Season (\d+)$/, m => `Saison ${m[1]}`],
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
  [/^(\d+) entries$/, m => `${m[1]} entrées`],
];
