/* Ce qui est propre a The Legend of Zelda pour `traduire-zelda.mjs`.
   Le gabarit du site se retrouve dans les autres protos ; ici ne vit que ce
   qui n'existe nulle part ailleurs : l'accroche et les reperes de lecture de
   Niko, les eres, les badges, les synopsis ecrits. */

/* Ce qui s'ecrit pareil dans les deux langues : les titres des jeux (Nintendo
   France garde les titres anglais), les codes de ligne, et ce que le script
   de la page manipule sans l'afficher. */
export const Z_IDENTIQUES = [
  'The Legend of Zelda', 'ZL', 'FH', 'CT', 'AT', 'Hyrule Historia', 'Nintendo',
  'Skyward Sword HD', 'The Minish Cap', 'Four Swords', 'Ocarina of Time', 'A Link to the Past',
  'Link’s Awakening', 'Oracle of Seasons', 'Oracle of Ages', 'A Link Between Worlds',
  'Tri Force Heroes', 'Echoes of Wisdom', 'Zelda II: The Adventure of Link', 'Majora’s Mask 3D',
  'Twilight Princess HD', 'Four Swords Adventures', 'The Wind Waker HD', 'Phantom Hourglass',
  'Spirit Tracks', 'Breath of the Wild', 'Tears of the Kingdom', 'Cadence of Hyrule',
  'Link&#x27;s Crossbow Training', 'Hyrule Warriors 1 &amp; 2',
  'Chronologeek — The Legend of Zelda (proto E)',
  'fallen', 'child', 'adult', '/images/threetimelineszelda.webp',
  'chronologeek-zelda.json', 'zelda', 'cg-proto-zelda', 'data-first', '--era2', '--era4',
  'style="--br:', '" data-sep style="--era:color-mix(in srgb,', 'class="h"',
  '<span class="bn-k">Spoilers</span><span class="bn-d">Ocarina of Time</span>',
  '<span class="stn-k"><span class="code">ZL</span>Station',
];

/* Rien n'est retrouve chez TMDB : les jeux n'y sont pas. */
export const Z_RETROUVES = [];

/* Les phrases ecrites. Les noms d'eres et des trois timelines sont ceux du
   wiki Zelda francais (« Chronologie des Zelda », zelda.fandom.com/fr),
   releves le 23 novembre 2026, sauf l'Ere de la Force (le wiki la coupe en
   deux) et l'Ere des Terres sauvages (il n'en a pas). */
export const Z_TRADUCTIONS = [
  ['Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands and The Legend of Zelda are trademarks of their respective owners; Chronologeek is an independent fan project.',
    'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands et The Legend of Zelda sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],
  ['. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands and The Legend of Zelda are trademarks of their respective owners; Chronologeek is an independent fan project.',
    '. Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands et The Legend of Zelda sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant.'],

  // les badges
  ['Loftwing Rider', 'Cavalier de Célestrier'],
  ['Sky, Force and Hero of Time eras completed', 'Ère céleste, Ère de la Force et Ère du Héros du Temps terminées'],
  ['Hero of Legend', 'Héros de légende'],
  ['Fallen Hero Timeline completed', 'Timeline de la Défaite terminée'],
  ['Twilight Realm', 'Royaume du Crépuscule'],
  ['Child Timeline completed', 'Timeline de l’enfance terminée'],
  ['King of Red Lions', 'Lion Rouge'],
  ['Adult Timeline completed', 'Timeline de l’âge adulte terminée'],
  ['Champion of Hyrule', 'Prodige d’Hyrule'],
  ['Era of the Wilds completed', 'Ère des Terres sauvages terminée'],
  ['Triforce', 'Triforce'],
  ['The Legend of Zelda 100% completed', 'The Legend of Zelda terminé à 100 %'],
  ['Reset your The Legend of Zelda progress?', 'Réinitialiser votre progression The Legend of Zelda ?'],

  // les trois chronologies et les eres
  ['Fallen Hero Timeline', 'Timeline de la Défaite'],
  ['Child Timeline', 'Timeline de l’enfance'],
  ['Adult Timeline', 'Timeline de l’âge adulte'],
  ['Three Timelines', 'Trois timelines'],
  ['Sky Era', 'Ère céleste'],
  ['Force Era', 'Ère de la Force'],
  ['Era of the Hero of Time', 'Ère du Héros du Temps'],
  ['Era of Light and Dark', 'Ère de l’Ombre et de la Lumière'],
  ['Era of Decline', 'Ère du Déclin'],
  ['Twilight & Shadow Era', 'Ère du Crépuscule et de l’Ombre'],
  ['Era of the Great Sea', 'Ère de la Grande Mer'],
  ['Era of the Great Voyage', 'Ère du Grand Voyage'],
  ['Era of Hyrule’s Rebirth', 'Ère de la Renaissance d’Hyrule'],
  ['Era of the Wilds', 'Ère des Terres sauvages'],
  ['Classic Era · 1987-2005', 'Ère classique · 1987-2005'],
  ['DS Era · 2007-2009', 'Ère DS · 2007-2009'],
  ['3DS & Wii U Era · 2013-2016', 'Ère 3DS et Wii U · 2013-2016'],
  ['Switch Era · 2017-2026', 'Ère Switch · 2017-2026'],

  // l'accroche
  ['Every story game, one timeline that splits in three', 'Tous les jeux à histoire, une chronologie qui se sépare en trois'],
  ['Every story game, from Skyward Sword to Tears of the Kingdom — one timeline that splits in three, then comes back together.',
    'Tous les jeux à histoire, de Skyward Sword à Tears of the Kingdom — une chronologie qui se sépare en trois, puis se rejoint.'],
  ['If you’re here it’s either because you did some of the games and want to discover the full universe or because you want to do everything starting from the beginning. This guide contains minor spoilers that are indicated. Nintendo is really not a fan of consistent and established timelines and released 2 books about it over the years, with many continuity errors and even switched place some games between the two books. With multiple timelines and time travel, many fans will argue that this is absurd or senseless but since even Nintendo release a timeline, why not?',
    'Si vous êtes ici, c’est soit parce que vous avez fait certains jeux et voulez découvrir l’univers complet, soit parce que vous voulez tout faire depuis le début. Ce guide contient des spoilers mineurs, qui sont signalés. Nintendo n’est vraiment pas fan des chronologies cohérentes et établies, et a sorti deux livres à ce sujet au fil des années, avec de nombreuses erreurs de continuité, allant jusqu’à intervertir la place de certains jeux d’un livre à l’autre. Avec plusieurs chronologies et des voyages dans le temps, beaucoup de fans diront que c’est absurde ou insensé, mais puisque même Nintendo publie une chronologie, pourquoi pas ?'],
  ['This guide works for first plays or replays.', 'Ce guide convient aussi bien à une première partie qu’à une nouvelle.'],
  ['This guide follows the order the works came out, from 1987 to today, but you can switch back to a chronological version higher up.',
    'Ce guide suit ici l’ordre de sortie des œuvres, de 1987 à aujourd’hui, mais vous pouvez repasser à une version chronologique plus haut.'],
  ['How to read this', 'Repères de lecture'],
  ['Timeline and order', 'Chronologie et ordre'],
  ['Nintendo has released an official timeline on which this one is based on, but as usual they don’t give any date or calendar indications, except the time passing between some of the games, so we will base the timeline on this and the most relevant fans placements. After Ocarina of Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing the Child Timeline first because it’s the direct sequel of OoT. The Fallen Hero Timeline is the hardest and contains the 2D and old games.',
    'Nintendo a publié une chronologie officielle, sur laquelle celle-ci s’appuie, mais comme d’habitude sans aucune date ni indication de calendrier, hormis le temps qui passe entre certains jeux : on s’appuie donc sur elle et sur les placements de fans les plus pertinents. Après Ocarina of Time, la chronologie se sépare en trois, vous pouvez choisir laquelle faire en premier ; je recommande de commencer par la timeline de l’enfance, car c’est la suite directe d’OoT. La timeline de la Défaite est la plus difficile et contient les jeux en 2D et les plus anciens.'],
  ['Flashbacks', 'Les flashback'],
  ['Some events work better as a FLASHBACK for understanding, and are marked as such.',
    'Certains événements sont mieux à voir en tant que FLASHBACK pour comprendre et sont donc indiqués comme tel.'],
  ['Which version', 'Quelle version'],
  ['Many of the games have remakes or remasters, choose between the original or the new versions, the global story is the same but my timeline is based on the most recent versions for new players.',
    'Beaucoup de jeux ont des remakes ou des remasters : choisissez entre l’original et les nouvelles versions, l’histoire est la même, mais ma chronologie se base sur les versions les plus récentes, pour les nouveaux joueurs.'],
  ['Characters', 'Personnages'],
  ['Minor spoilers of the 3 main characters incoming: each game happens in a different time, only some of them are direct sequels to others (like Ocarina of Time and Majora’s Mask). Link reincarnates himself when the world is in danger, Zelda is a descendant of the royal family also called Zelda and Ganondorf is revived/freed and sometimes reincarnated. Some other characters come back in different games, many of them are descendants of the older ones.',
    'Spoilers mineurs sur les 3 personnages principaux : chaque jeu se déroule à une époque différente, et seuls certains sont la suite directe d’un autre (comme Ocarina of Time et Majora’s Mask). Link se réincarne quand le monde est en danger, Zelda est une descendante de la famille royale, appelée elle aussi Zelda, et Ganondorf est ressuscité ou libéré, et parfois réincarné. D’autres personnages reviennent dans plusieurs jeux, et beaucoup sont des descendants des anciens.'],
  ['What’s left out and why?', 'Ce qui n’y est pas, et pourquoi ?'],
  ['5 entries', '5 entrées'],
  ['Zelda CDI, mini-games spin-offs and Japanese only games', 'Zelda CDI, spin-offs de mini-jeux et jeux sortis seulement au Japon'],
  ['Not canon.', 'Pas canon.'],
  ['Comics, mangas, animated show', 'Comics, mangas, série animée'],
  ['No story.', 'Pas d’histoire.'],
  ['Not canon or happen in other alternative timelines that I don&#x27;t put here, you can play the first before Breath of the Wild and the second after.',
    'Pas canon, ou se déroulent dans d’autres chronologies alternatives que je ne mets pas ici : vous pouvez jouer au premier avant Breath of the Wild et au second après.'],
  ['After Ocarina of Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing the Child Timeline first because it’s the direct sequel of OoT.',
    'Après Ocarina of Time, la chronologie se sépare en trois, vous pouvez choisir laquelle faire en premier ; je recommande de commencer par la timeline de l’enfance, car c’est la suite directe d’OoT.'],
  ['Probably takes place after the 3 timelines reunited somehow.',
    'Se déroule probablement après que les 3 chronologies se sont réunies, d’une manière ou d’une autre.'],

  // les intitules a spoiler des trois branches
  ['Link is defeated by Ganondorf, the kingdom falls into ruin.', 'Link est vaincu par Ganondorf, le royaume tombe en ruine.'],
  ['Link warns the royal family in the past, Ganondorf is captured and put on trial.',
    'Link avertit la famille royale dans le passé, Ganondorf est capturé et jugé.'],
  ['Link disappears from the future after returning in the past, Hyrule is submerged beneath the waters.',
    'Link disparaît du futur après être retourné dans le passé, Hyrule est englouti sous les eaux.'],

  // les cinq synopsis ecrits (les autres viennent de RAWG, a l'ouverture)
  ['The wind sorcerer Vaati breaks free and kidnaps Princess Zelda. Drawing the Four Sword splits Link into four, and the four of them have to work together to seal him away again.',
    'Le sorcier des vents Vaati se libère et enlève la princesse Zelda. En tirant l’Épée de Quatre, Link se divise en quatre, et les quatre doivent s’entraider pour le sceller à nouveau.'],
  ['Rifts are swallowing Hyrule and its people, Link among them. This time Princess Zelda sets out herself, with a staff that lets her create echoes of the things around her.',
    'Des failles engloutissent Hyrule et ses habitants, Link compris. Cette fois, c’est la princesse Zelda qui part elle-même, avec un bâton qui lui permet de créer des échos de ce qui l’entoure.'],
  ['A mark appears on Link’s hand and leads him to a princess under an ancient sleeping spell. To wake her, he has to find a hidden Triforce, while Ganon’s followers hunt him down.',
    'Une marque apparaît sur la main de Link et le mène à une princesse plongée dans un sommeil ancien. Pour la réveiller, il doit trouver une Triforce cachée, tandis que les fidèles de Ganon le traquent.'],
  ['Dark copies of Link are roaming Hyrule, and the maidens who guard Vaati’s seal have been kidnapped. Link draws the Four Sword once more and splits into four to set things right.',
    'Des copies maléfiques de Link parcourent Hyrule, et les prêtresses qui gardent le sceau de Vaati ont été enlevées. Link tire de nouveau l’Épée de Quatre et se divise en quatre pour remettre de l’ordre.'],
  ['An action game set in the far past of Hyrule, in the war its founders fought against the Demon King — the story told in Tears of the Kingdom, seen from the battlefield.',
    'Un jeu d’action dans le passé lointain d’Hyrule, pendant la guerre que ses fondateurs ont menée contre le Roi Démon — l’histoire racontée dans Tears of the Kingdom, vue du champ de bataille.'],

  // la page
  ['Eras', 'Ères'],
  ['The Legend of Zelda network map', 'Plan du réseau The Legend of Zelda'],
  ['22 / 22 shown', '22 / 22 affichées'],
  ['<p><b>Terminus</b><span>End of the Zelda network ·', '<p><b>Terminus</b><span>Fin du réseau Zelda ·'],
  ['<span class="bn-cta"><span class="lbl">Reveal</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>',
    '<span class="bn-cta"><span class="lbl">Révéler</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>'],
  ['completed</span></p>', 'terminés</span></p>'],
  ['</span>Era', '</span>Ère'],
  ['Zelda network complete', 'Réseau Zelda terminé'],
];

export const Z_GABARITS = [
  [/^Updated · (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
    m => `Mis à jour · ${({ January: 'janvier', February: 'février', March: 'mars', April: 'avril',
      May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre',
      October: 'octobre', November: 'novembre', December: 'décembre' })[m[1]]} ${m[2]}`],
];

/* Titre par identifiant. Les jeux gardent en France leur titre anglais, a une
   exception pres : Age of Imprisonment y sort sous un sous-titre francais. */
export const Z_TITRES = {
  'zl-aoi': 'Hyrule Warriors : Les Chroniques du Sceau'
};
