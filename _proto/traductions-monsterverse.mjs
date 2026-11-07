/* ═══ LE FRANÇAIS ÉCRIT DU MONSTERVERSE ═══════════════════════════════
   Trois listes, et la distinction compte.

   `MV_IDENTIQUES` — ce qui ne se traduit pas. Rien n'y est écrit, donc
   rien n'en repart à la relecture : les titres sans deux-points, que
   personne n'a traduits — aucun comic n'a d'édition française.

   `MV_RETROUVES` — les titres d'exploitation française, pris chez TMDB
   (fr-FR) : trois films ont changé de nom en traversant.

   `MV_TRADUCTIONS` — ce qui est vraiment écrit : l'accroche, les deux
   repères de lecture, ce qui est écarté, les quatre ères et les trois
   ères de sortie, les six badges et les dix synopsis. **Les titres à
   deux-points y sont aussi** : le nom ne se traduit pas, la ponctuation
   si — c'est la règle de Star Trek.
   ═════════════════════════════════════════════════════════════════════ */

export const MV_IDENTIQUES = [
  /* l'univers, et les titres que la ponctuation ne touche pas */
  'Monsterverse',
  'Skull Island',
  'Godzilla',
  'Godzilla vs. Kong',
  'Return to Skull Island',
  'Escape from Skull Island',
  'Kingdom Kong',
  'Godzilla Dominion',
  'MonsterVerse Declassified',
  /* la page elle-même, et ce qui n'est pas du texte affiché */
  'Chronologeek — Monsterverse (proto E)',
  'chronologeek-monsterverse.json',
  'monsterverse',
  'cg-proto-monsterverse',
  /* le code de ligne, et les clés de type lues par le compteur du premier écran */
  'MV', 'film', 'serie', 'anime', 'comic', 'jeu',
  '/images/monsterverse.webp',
  // la plaque de station du plan de métro : le code de ligne ne se traduit pas
  '<span class="stn-k"><span class="code">MV</span>',
];

export const MV_RETROUVES = [
  ['Kong: Skull Island', 'Kong : Skull Island'],
  ['Godzilla: King of the Monsters', 'Godzilla II : Roi des Monstres'],
  ['Godzilla x Kong: The New Empire', 'Godzilla x Kong : Le Nouvel Empire'],
];

export const MV_TRADUCTIONS = [
  /* ── les titres : le nom reste, le deux-points prend son espace ──── */
  ['Skull Island: The Birth of Kong', 'Skull Island : The Birth of Kong'],
  ['Godzilla: Aftershock', 'Godzilla : Aftershock'],
  ['Monarch: Legacy of Monsters', 'Monarch : Legacy of Monsters'],
  ['Godzilla: Fight or Flight', 'Godzilla : Fight or Flight'],
  ['Kong: Survivor Instinct', 'Kong : Survivor Instinct'],
  ['Godzilla x Kong: The Hunted', 'Godzilla x Kong : The Hunted'],

  /* ── l'accroche, et les deux repères de lecture ──────────────────── */
  ['If you’re here it’s either because you watched some of the movies and want to discover the '
   + 'expanded universe or because you want to discover the full universe. This guide is '
   + 'spoiler free like the others.',
   'Si vous êtes ici, c’est soit parce que vous avez vu certains des films et que vous voulez '
   + 'découvrir l’univers étendu, soit parce que vous voulez découvrir l’univers tout entier. '
   + 'Ce guide est sans spoiler, comme les autres.'],
  ['This guide works for first-time watch as well as rewatches.',
   'Ce guide convient aussi bien à une première découverte qu’à un revisionnage.'],
  ['Calendar', 'Le calendrier'],
  ['The saga happens in &quot;our&quot; world so we’ll count in years like we do.',
   'La saga se déroule dans « notre » monde : on compte donc les années comme nous le faisons.'],
  ['The comics are not really important but the more the universe expands the more monsters we '
   + 'discover and since the movies focus on Kong and/or Godzilla the other monsters are '
   + 'characters in the different comics, which also focus the 2 main Titans fighting them. But '
   + 'like Godzilla Awakening, they can be decanonized when something comes out and contradicts '
   + 'its story.',
   'Les comics ne sont pas vraiment importants, mais plus l’univers s’étend, plus on découvre de '
   + 'monstres : et comme les films se concentrent sur Kong et/ou Godzilla, les autres monstres '
   + 'sont des personnages des différents comics, qui suivent aussi les deux Titans principaux '
   + 'en train de les combattre. Mais comme Godzilla Awakening, ils peuvent sortir du canon '
   + 'quand une nouvelle œuvre arrive et contredit leur histoire.'],

  /* ── ce qui n'y est pas ──────────────────────────────────────────── */
  ['What’s left out and why?', 'Ce qui n’y est pas, et pourquoi ?'],
  ['Movies novelizations', 'Les novélisations des films'],
  ['Mobile games', 'Les jeux mobiles'],
  ['Mobile games: no story, not canon and/or not available anymore.',
   'Les jeux mobiles : pas d’histoire, pas canon et/ou plus disponibles.'],
  ['Children books', 'Les livres pour enfants'],
  ['Godzilla Awakening comic', 'Le comic Godzilla Awakening'],
  ['Godzilla Awakening comic: not canon anymore since the release of the Monarch TV show.',
   'Le comic Godzilla Awakening : plus canon depuis la sortie de la série Monarch.'],
  ['Justice League crossover comics', 'Les comics croisés avec la Justice League'],
  ['Justice League crossover comics: not canon obviously.',
   'Les comics croisés avec la Justice League : pas canon, évidemment.'],

  /* ── les quatre ères ─────────────────────────────────────────────── */
  ['Godzilla Returns', 'Le Retour de Godzilla'],
  ['The Titans Awaken', 'L’Éveil des Titans'],
  ['Hollow Earth', 'La Terre creuse'],
  ['ERA 1', 'ÈRE 1'], ['ERA 2', 'ÈRE 2'], ['ERA 3', 'ÈRE 3'], ['ERA 4', 'ÈRE 4'],

  /* ── les dix synopsis : neuf comics et le jeu ────────────────────── */
  ['Set after the animated series. A group of survivors is stranded on Skull Island, where every '
   + 'creature is a threat — Kong included — and the island keeps more secrets than they '
   + 'bargained for.',
   'Après la série animée. Un groupe de survivants est échoué sur Skull Island, où chaque '
   + 'créature est une menace — Kong compris —, et l’île cache bien plus de secrets qu’ils ne '
   + 'l’imaginaient.'],
  ['The survivors are still trapped on the island while something ancient stirs beneath it. In '
   + 'flashbacks, the young Kong fights the battles that made him the island’s king.',
   'Les survivants sont toujours prisonniers de l’île, tandis que quelque chose d’ancien '
   + 's’éveille sous elle. En flashback, le jeune Kong livre les combats qui ont fait de lui le '
   + 'roi de l’île.'],
  ['A secret Monarch team returns to Skull Island to learn the truth about Kong, and about the '
   + 'ancient war between Titans that left him the last of his kind. Both a sequel and a prequel '
   + 'to Kong: Skull Island.',
   'Une équipe secrète de Monarch retourne sur Skull Island pour percer la vérité sur Kong, et '
   + 'sur l’ancienne guerre entre Titans qui a fait de lui le dernier de son espèce. À la fois '
   + 'une suite et une préquelle de Kong : Skull Island.'],
  ['After San Francisco, a new Titan rises from deep underground and sets off earthquakes around '
   + 'the globe, while Monarch’s Dr. Emma Russell tries to understand what is coming. The bridge '
   + 'between Godzilla and King of the Monsters.',
   'Après San Francisco, un nouveau Titan surgit des profondeurs et déclenche des séismes tout '
   + 'autour du globe, tandis que le Dr Emma Russell, de Monarch, cherche à comprendre ce qui '
   + 'arrive. Le pont entre Godzilla et Roi des Monstres.'],
  ['Elite pilots gather on Skull Island to train for a mission into the Hollow Earth, until a '
   + 'bat-like Titan, Camazotz, attacks Kong’s home. A sequel to The Birth of Kong.',
   'Des pilotes d’élite se réunissent sur Skull Island pour préparer une mission dans la Terre '
   + 'creuse, jusqu’à ce qu’un Titan pareil à une chauve-souris, Camazotz, attaque le domaine '
   + 'de Kong. Une suite de The Birth of Kong.'],
  ['Told entirely from Godzilla’s point of view: the new king of the Titans looks for a home and '
   + 'defends his territory against the other Titans, as another king waits in the wings.',
   'Raconté tout entier du point de vue de Godzilla : le nouveau roi des Titans se cherche un '
   + 'foyer et défend son territoire contre les autres Titans, tandis qu’un autre roi attend '
   + 'son heure.'],
  ['A short story leading straight into Godzilla vs. Kong, first published in the Legends of the '
   + 'Monsterverse omnibus.',
   'Une courte histoire qui mène tout droit à Godzilla vs. Kong, publiée d’abord dans '
   + 'l’omnibus Legends of the Monsterverse.'],
  ['Shortly after Godzilla vs. Kong, a father searches for his daughter in a coastal city turned '
   + 'into a Titan battlefield, while mercenaries hunt him for a Monarch device he stumbled upon.',
   'Peu après Godzilla vs. Kong, un père cherche sa fille dans une ville côtière devenue un '
   + 'champ de bataille de Titans, traqué par des mercenaires pour un appareil de Monarch '
   + 'tombé entre ses mains.'],
  ['A Skull Island trophy hunter sets a trap for Kong deep in the Hollow Earth, and pits Godzilla '
   + 'against another Titan to keep him busy on the surface. Leads directly into The New Empire.',
   'Un chasseur de trophées de Skull Island tend un piège à Kong au plus profond de la Terre '
   + 'creuse, et lance un autre Titan contre Godzilla pour l’occuper à la surface. Mène tout '
   + 'droit au Nouvel Empire.'],
  ['An anthology that opens Monarch’s classified files on four Titans, Behemoth and Tiamat among '
   + 'them: their legends, their origins, and where they were before The New Empire.',
   'Une anthologie qui ouvre les dossiers classés de Monarch sur quatre Titans, dont Behemoth '
   + 'et Tiamat : leurs légendes, leurs origines, et où ils se trouvaient avant Le Nouvel '
   + 'Empire.'],

  /* ── les six badges ──────────────────────────────────────────────── */
  ['Eighth Wonder', 'La Huitième Merveille'],
  ['Skull Island completed', 'Skull Island terminée'],
  ['Let Them Fight', 'Laissez-les se battre'],
  ['Godzilla Returns completed', 'Le Retour de Godzilla terminé'],
  ['Long Live the King', 'Longue vie au roi'],
  ['The Titans Awaken completed', 'L’Éveil des Titans terminé'],
  ['Rise Together', 'Plus forts ensemble'],
  ['Hollow Earth completed', 'La Terre creuse terminée'],
  ['Monarch Clearance', 'Habilitation Monarch'],
  ['Everything on screen watched', 'Les films et les séries vus'],
  ['King of the Monsters', 'Roi des Monstres'],
  ['Monsterverse 100% completed', 'Monsterverse terminé à 100 %'],

  /* ── le reste du gabarit, propre à cet univers ───────────────────── */
  ['Reset your Monsterverse progress?', 'Réinitialiser votre progression Monsterverse ?'],
  ['Movies · Shows · Comics · Game', 'Films · Séries · Comics · Jeu'],
  ['Movies · Shows · Comics · Game — the whole Monsterverse in its most optimized order.',
   'Films · Séries · Comics · Jeu — tout le Monsterverse dans son ordre le plus optimisé.'],
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner and Monsterverse '
   + 'are trademarks of their respective owners; Chronologeek is an independent fan project.',
   'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner et Monsterverse '
   + 'sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan '
   + 'indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner and Monsterverse '
   + 'are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, '
   + 'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner et Monsterverse '
   + 'sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan '
   + 'indépendant.'],
  /* les cases du tableau du premier écran */
  ['Shows', 'Séries'],
  ['Animated show', 'Série animée'],
  ['Game', 'Jeu'],
  // le plan de métro
  ['Monsterverse line map', 'Plan de la ligne Monsterverse'],
  ['Monsterverse line complete', 'Ligne Monsterverse terminée'],
  ['<p><b>Terminus</b><span>End of the Monsterverse line ·', '<p><b>Terminus</b><span>Fin de la ligne Monsterverse ·'],

  /* l'ordre de sortie : l'accroche et les trois ères de production */
  ['This guide follows the order the works came out, from 2014 to today, but you can switch back to a chronological version higher up.',
   'Ce guide suit ici l’ordre de sortie des œuvres, de 2014 à aujourd’hui, mais vous pouvez repasser à une version chronologique plus haut.'],
  ['The First Films · 2014-2017', 'Les premiers films · 2014-2017'],
  ['Clash of the Titans · 2019-2021', 'Le Choc des Titans · 2019-2021'],
  ['The Expanded Universe · 2023-2026', 'L’univers étendu · 2023-2026'],
];

export const MV_GABARITS = [
  /* « Updated · November 2026 » est une forme, pas un libellé : le mois
     change à chaque ajout. Le gabarit passe avant le lexique. */
  [/^Updated · (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
    m => `Mis à jour · ${({ January: 'janvier', February: 'février', March: 'mars', April: 'avril',
      May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre',
      October: 'octobre', November: 'novembre', December: 'décembre' })[m[1]]} ${m[2]}`],
  [/^Season (\d+)$/, m => `Saison ${m[1]}`],
  [/^Season (\d+) Episodes? ([\d-]+)$/, m => `Saison ${m[1]} ${m[2].includes('-') ? 'Épisodes' : 'Épisode'} ${m[2]}`],
  [/^(Return to Skull Island|Escape from Skull Island|Skull Island: The Birth of Kong) (#[\d-]+)$/,
    m => `${m[1].replace(': ', ' : ')} ${m[2]}`],
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
  [/^(\d+) entries$/, m => `${m[1]} entrées`],
];
