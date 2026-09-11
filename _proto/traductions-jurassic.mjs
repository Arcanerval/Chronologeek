/* ═══ LE FRANÇAIS ÉCRIT DE JURASSIC WORLD ═════════════════════════════
   Trois listes, et la distinction compte.

   `JW_IDENTIQUES` — ce qui ne se traduit pas. Rien n'y est écrit, donc
   rien n'en repart à la relecture.

   `JW_RETROUVES` — les titres d'exploitation française. Ils ne sont pas
   écrits : ils viennent de TMDB en fr-FR, et celui du roman de Claire du
   catalogue de la BnF (« Le Destin de Claire », Glénat jeunesse, 2018).
   Les deux Maisie Lockwood n'ont pas d'édition française : ils gardent
   leur titre et prennent le badge VO.

   `JW_TRADUCTIONS` — ce qui est vraiment écrit, et qui part en relecture :
   l'accroche, le repère des séries animées, ce qui est écarté, les quatre
   ères, les badges et les trois résumés de romans. Le deux-points des
   titres restés anglais y est aussi : le nom ne se traduit pas, la
   ponctuation si — c'est la règle de Star Trek.
   ═════════════════════════════════════════════════════════════════════ */

export const JW_IDENTIQUES = [
  'Jurassic World',
  'Jurassic Park',
  'Jurassic Park III',
  'Chronologeek — Jurassic World (proto E)',
  '50 h',
  /* les deux surnoms de bande : ce sont des noms propres, comme
     Flashpoint ou Knightfall chez DC Animation */
  'Camp Fam',
  'Nublar Six',
  /* le nom du fichier d'export, la clé de stockage, la clé d'univers et
     le visuel : une seule copie sert les deux langues */
  'chronologeek-jurassicworld.json',
  'jurassic',
  'cg-proto-jurassic',
  '/images/jurassicworld.webp',
];

export const JW_RETROUVES = [
  ['The Lost World: Jurassic Park', 'Le Monde perdu : Jurassic Park'],
  ['Jurassic World: Camp Cretaceous', 'Jurassic World : La Colo du Crétacé'],
  ['Jurassic World: Fallen Kingdom', 'Jurassic World : Fallen Kingdom'],
  ['Battle at Big Rock', 'La Bataille de Big Rock'],
  ['Jurassic World: Dominion', 'Jurassic World : Le Monde d’après'],
  ['Jurassic World: Chaos Theory', 'Jurassic World : La théorie du chaos'],
  ['Jurassic World: Rebirth', 'Jurassic World : Renaissance'],
  ['The Evolution of Claire', 'Le Destin de Claire'],
];

export const JW_TRADUCTIONS = [
  /* les badges */
  ['Welcome to Jurassic Park', 'Bienvenue à Jurassic Park'],
  ['The three Jurassic Park movies completed', 'Les trois films Jurassic Park terminés'],
  ['Camp Cretaceous completed', 'La Colo du Crétacé terminée'],
  ['The Alpha', 'L’Alpha'],
  ['The three Jurassic World movies completed', 'Les trois films Jurassic World terminés'],
  ['Chaos Theory completed', 'La théorie du chaos terminée'],
  /* la réplique de Ian Malcolm, telle que la version française la dit */
  ['Life Finds a Way', 'La vie trouve toujours un chemin'],
  ['Jurassic World 100% completed', '100% Jurassic World complété'],
  ['Reset your Jurassic World progress?', 'Réinitialiser votre progression Jurassic World ?'],

  /* l'univers et l'accroche */
  ['Movies · Animated Shows · Books', 'Films · Séries animées · Livres'],
  ['Movies · Animated Shows · Books — all the Jurassic World franchise in its most optimized order.',
   'Films · Séries animées · Livres — toute la franchise Jurassic World dans son ordre le plus optimisé.'],
  ['If you&#x27;re here, it&#x27;s because you want to discover or rediscover all the Jurassic World franchise in its most optimized order, a mix of chronological order and release order. This entire site is guaranteed free of major spoilers.',
   'Si vous êtes ici c&#x27;est que vous souhaitez découvrir ou redécouvrir toute la franchise Jurassic World dans son ordre le plus optimisé, un mélange d&#x27;ordre chronologique et d&#x27;ordre de sortie. Tout ce site est garanti sans spoil majeur.'],
  ['ANIMATED SHOWS', 'SÉRIES ANIMÉES'],
  ['Both animated series are aimed primarily at children, but they feature events that are important to the overall lore of the saga, and the characters are endearing.',
   'Les deux séries animées s&#x27;adressent avant tout aux enfants, mais elles comportent des événements importants pour l&#x27;univers de la saga dans son ensemble, et les personnages sont attachants.'],

  /* ce qui est écarté */
  ['5 entries', '5 entrées'],
  ['Jurassic World: Live Tour', 'Jurassic World : Live Tour'],
  ['A live theatrical show, its canonicity is not confirmed', 'Un spectacle vivant, sa canonicité n&#x27;est pas confirmée'],
  ['The Jurassic World: Apatosaurus VR Experience', 'L&#x27;expérience VR Jurassic World : Apatosaurus'],
  ['A virtual reality experience with no story', 'Une expérience de réalité virtuelle sans histoire'],
  ['Jurassic World: Blue', 'Jurassic World : Blue'],
  ['A virtual reality experience with a very light story around Blue', 'Une expérience de réalité virtuelle avec une histoire très légère autour de Blue'],
  ['The comics, Jurassic Park: Adventures novels and games', 'Les comics, les romans Jurassic Park : Adventures et les jeux'],
  ['Not canon or soft-canon', 'Pas canon, ou à moitié'],
  ['The original novels', 'Les romans d&#x27;origine'],
  ['In their own universe', 'Dans leur propre univers'],

  /* les quatre ères */
  ['THE INGEN ISLANDS', 'LES ÎLES D’INGEN'],
  ['THE PARK REOPENS', 'LE PARC ROUVRE'],
  ['A WORLD OF DINOSAURS', 'UN MONDE DE DINOSAURES'],
  ['A NEW ERA', 'UNE NOUVELLE ÈRE'],

  /* les deux romans sans édition française : le titre reste, le
     deux-points prend son espace */
  ['Jurassic World: Maisie Lockwood Adventures 1 - Off the Grid', 'Jurassic World : Maisie Lockwood Adventures 1 - Off the Grid'],
  ['Jurassic World: Maisie Lockwood Adventures 2 - The Yosemite Six', 'Jurassic World : Maisie Lockwood Adventures 2 - The Yosemite Six'],

  /* les trois résumés : Open Library et l'éditeur ne les donnent qu'en anglais */
  ['This original hardcover novel tells the all-new adventures of Maisie Lockwood as she navigates a world filled with dinosaurs both ferocious and friendly.',
   'Ce roman inédit raconte les nouvelles aventures de Maisie Lockwood dans un monde peuplé de dinosaures, féroces comme amicaux.'],
  ['When Maisie, Owen, and Claire track Blue to Yosemite, they find her tracker in the park, but the dinosaur is nowhere to be found. Owen and Claire decide they should stay until they locate Blue, and that means Maisie has to go on her most exciting adventure yet—school! She’s nervous, but quickly makes new friends but also discovers there are six dinosaurs that need their protection. Unfortunately, there’s also a predator hunting in the area. Is it Blue, or is there a more dangerous carnivore on the loose? Maisie will need all of her skills and bravery to save her new friends and the Yosemite Six.',
   'Quand Maisie, Owen et Claire suivent Blue jusqu’à Yosemite, ils retrouvent sa balise dans le parc, mais le dinosaure reste introuvable. Owen et Claire décident de rester jusqu’à ce qu’ils la retrouvent, et Maisie part donc pour sa plus grande aventure : l’école ! Elle est nerveuse, se fait vite de nouveaux amis, mais découvre aussi six dinosaures qui ont besoin de protection. Hélas, un prédateur rôde dans les parages. Est-ce Blue, ou un carnivore plus dangereux s’est-il échappé ? Maisie aura besoin de tout son courage et de tout son savoir-faire pour sauver ses nouveaux amis et les Six de Yosemite.'],
  ['In this prequel to the "Jurassic World" movies, college freshman Claire Dearing interns at the soon-to-open Jurassic World theme park, where she falls in love with fellow student Justin and uncovers a sinister plot.',
   'Dans ce préquel des films Jurassic World, Claire Dearing, étudiante de première année, fait un stage dans le parc à thème Jurassic World, qui s’apprête à ouvrir. Elle y tombe amoureuse de Justin, un autre étudiant, et met au jour un sinistre complot.'],

  /* la mention légale du pied de page, qui compte désormais Jurassic World */
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed and Jurassic World are trademarks of their respective owners; Chronologeek is an independent fan project.',
   '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed et Jurassic World sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
];

export const JW_GABARITS = [
  [/^Season (\d+)$/, m => `Saison ${m[1]}`],
  [/^Season (\d+) Episodes? (\d+(?:-\d+)?)$/, m =>
    `Saison ${m[1]} ${m[2].includes('-') ? 'Épisodes' : 'Épisode'} ${m[2]}`],
  [/^(\d+) \/ (\d+) shown$/, m => `${m[1]} / ${m[2]} affichées`],
];
