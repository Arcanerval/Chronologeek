/* The Legend of Zelda en espagnol neutre, tutoiement ; titres en anglais.
   Les noms des eres et des trois lignes sont ceux du wiki Zelda espagnol
   (« Cronología », zelda.fandom.com/es), sauf l'Ere des Terres sauvages. */

/* Les dates sont des durees ecrites en toutes lettres : leur unite se traduit,
   comme le « Año 6 » de Borderlands. Une cle `date:` par valeur. */
const DATES = ['+ ~1000-5000 YEARS', '+ ~200-500 YEARS', '+ ~200-400 YEARS', '+ ~300-500 YEARS',
  '+ ~1-2 YEARS', '+ ~1 YEAR', '+ ~X-1X DAYS', '+ ~100-200 YEARS', '+ 1-3 YEARS', '+ ~300-1000 YEARS',
  '+ 6 YEARS', '+ ~2-6 MONTHS', '+ ~200-300 YEARS', '+ ~100-500 YEARS', '+ ~500-1000 YEARS',
  '+ 100 YEARS', '+ ~XXXXX YEARS', '+ 6-7 YEARS', '- ~XXXXX YEARS'];
export const unites = (d, an, ans, mois, jours) => d.replace(/\bYEARS\b/, ans).replace(/\bYEAR\b/, an)
  .replace(/\bMONTHS\b/, mois).replace(/\bDAYS\b/, jours);
export const DATES_ZELDA = DATES;

export default {
  "The Legend of Zelda": "The Legend of Zelda",
  "Chronologeek — The Legend of Zelda (proto E)": "Chronologeek — The Legend of Zelda (proto E)",
  "ZL": "ZL", "FH": "FH", "CT": "CT", "AT": "AT",
  "Ocarina of Time": "Ocarina of Time",
  "Cadence of Hyrule": "Cadence of Hyrule",
  "Link&#x27;s Crossbow Training": "Link&#x27;s Crossbow Training",
  "Hyrule Warriors 1 &amp; 2": "Hyrule Warriors 1 &amp; 2",
  "/images/threetimelineszelda.webp": "/images/threetimelineszelda.webp",
  "Spoilers": "Spoilers",

  "Every story game, one timeline that splits in three": "Todos los juegos con historia, una cronología que se divide en tres",
  "Every story game, from Skyward Sword to Tears of the Kingdom — one timeline that splits in three, then comes back together.":
    "Todos los juegos con historia, de Skyward Sword a Tears of the Kingdom: una cronología que se divide en tres y luego vuelve a unirse.",
  "The Legend of Zelda network map": "Plano de la red The Legend of Zelda",
  "End of the Zelda network ·": "Fin de la red Zelda ·",
  "Zelda network complete": "Red Zelda completada",
  "Reset your The Legend of Zelda progress?": "¿Reiniciar tu progreso de The Legend of Zelda?",
  "Eras": "Eras",
  "Era": "Era",
  "Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands and The Legend of Zelda are trademarks of their respective owners; Chronologeek is an independent fan project.":
    "Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse, Borderlands y The Legend of Zelda son marcas de sus respectivos propietarios; Chronologeek es un proyecto fan independiente.",

  "If you’re here it’s either because you did some of the games and want to discover the full universe or because you want to do everything starting from the beginning. This guide contains minor spoilers that are indicated. Nintendo is really not a fan of consistent and established timelines and released 2 books about it over the years, with many continuity errors and even switched place some games between the two books. With multiple timelines and time travel, many fans will argue that this is absurd or senseless but since even Nintendo release a timeline, why not?":
    "Si estás aquí, es porque ya jugaste algunos de los juegos y quieres descubrir el universo completo, o porque quieres hacerlo todo desde el principio. Esta guía contiene spoilers menores, que están señalados. A Nintendo no le gustan nada las cronologías coherentes y establecidas, y ha publicado 2 libros sobre el tema a lo largo de los años, con muchos errores de continuidad, llegando incluso a cambiar de sitio algunos juegos de un libro a otro. Con varias cronologías y viajes en el tiempo, muchos fans dirán que es absurdo o que no tiene sentido, pero si hasta Nintendo publica una cronología, ¿por qué no?",
  "This guide works for first plays or replays.": "Esta guía sirve tanto para una primera partida como para volver a jugar.",
  "This guide follows the order the works came out, from 1987 to today, but you can switch back to a chronological version higher up.":
    "Esta guía sigue el orden en que salieron las obras, de 1987 a hoy, pero puedes volver a una versión cronológica más arriba.",
  "Timeline and order": "Cronología y orden",
  "Nintendo has released an official timeline on which this one is based on, but as usual they don’t give any date or calendar indications, except the time passing between some of the games, so we will base the timeline on this and the most relevant fans placements. After Ocarina of Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing the Child Timeline first because it’s the direct sequel of OoT. The Fallen Hero Timeline is the hardest and contains the 2D and old games.":
    "Nintendo ha publicado una cronología oficial, en la que se basa esta, pero como siempre no da ninguna fecha ni indicación de calendario, salvo el tiempo que pasa entre algunos juegos, así que basaremos la cronología en ella y en las ubicaciones de los fans más pertinentes. Después de Ocarina of Time, la cronología se divide en 3; puedes elegir cuál hacer primero, y te recomiendo empezar por la Línea Temporal de Link Niño, porque es la secuela directa de OoT. La Línea Temporal del Fracaso del Héroe es la más difícil y contiene los juegos en 2D y los más antiguos.",
  "Which version": "Qué versión",
  "Many of the games have remakes or remasters, choose between the original or the new versions, the global story is the same but my timeline is based on the most recent versions for new players.":
    "Muchos de los juegos tienen remakes o remasters: elige entre el original o las nuevas versiones, la historia es la misma, pero mi cronología se basa en las versiones más recientes, para los nuevos jugadores.",
  "Characters": "Personajes",
  "Minor spoilers of the 3 main characters incoming: each game happens in a different time, only some of them are direct sequels to others (like Ocarina of Time and Majora’s Mask). Link reincarnates himself when the world is in danger, Zelda is a descendant of the royal family also called Zelda and Ganondorf is revived/freed and sometimes reincarnated. Some other characters come back in different games, many of them are descendants of the older ones.":
    "Spoilers menores de los 3 personajes principales: cada juego transcurre en una época distinta, y solo algunos son secuelas directas de otros (como Ocarina of Time y Majora’s Mask). Link se reencarna cuando el mundo está en peligro, Zelda es una descendiente de la familia real, también llamada Zelda, y Ganondorf es revivido o liberado, y a veces reencarnado. Otros personajes vuelven en distintos juegos, y muchos son descendientes de los anteriores.",

  "Zelda CDI, mini-games spin-offs and Japanese only games": "Zelda CDI, spin-offs de minijuegos y juegos solo japoneses",
  "Not canon.": "No canon.",
  "Comics, mangas, animated show": "Cómics, mangas, serie animada",
  "No story.": "Sin historia.",
  "Not canon or happen in other alternative timelines that I don&#x27;t put here, you can play the first before Breath of the Wild and the second after.":
    "No canon o transcurren en otras cronologías alternativas que no incluyo aquí; puedes jugar el primero antes de Breath of the Wild y el segundo después.",
  "After Ocarina of Time, the timeline splits itself in 3, you can choose which one to do first, I recommend doing the Child Timeline first because it’s the direct sequel of OoT.":
    "Después de Ocarina of Time, la cronología se divide en 3; puedes elegir cuál hacer primero, y te recomiendo empezar por la Línea Temporal de Link Niño, porque es la secuela directa de OoT.",
  "Probably takes place after the 3 timelines reunited somehow.":
    "Probablemente transcurre después de que las 3 cronologías se reunieran de algún modo.",

  "Sky Era": "Era del Cielo",
  "Force Era": "Era de la Fuerza",
  "Era of the Hero of Time": "Era del Héroe del Tiempo",
  "Three Timelines": "Tres líneas temporales",
  "Fallen Hero Timeline": "Línea Temporal del Fracaso del Héroe",
  "Child Timeline": "Línea Temporal de Link Niño",
  "Adult Timeline": "Línea Temporal de Link Adulto",
  "Era of Light and Dark": "Era de la Luz y Oscuridad",
  "Era of Decline": "Era del Declive",
  "Twilight & Shadow Era": "Era del Crepúsculo y de las Sombras",
  "Era of the Great Sea": "Era del Gran Mar",
  "Era of the Great Voyage": "Era de la Gran Travesía",
  "Era of Hyrule’s Rebirth": "Era del Renacimiento de Hyrule",
  "Era of the Wilds": "Era de lo Salvaje",
  "Classic Era · 1987-2005": "Era clásica · 1987-2005",
  "DS Era · 2007-2009": "Era DS · 2007-2009",
  "3DS & Wii U Era · 2013-2016": "Era 3DS y Wii U · 2013-2016",
  "Switch Era · 2017-2026": "Era Switch · 2017-2026",

  "Link is defeated by Ganondorf, the kingdom falls into ruin.": "Link es derrotado por Ganondorf y el reino cae en la ruina.",
  "Link warns the royal family in the past, Ganondorf is captured and put on trial.":
    "Link advierte a la familia real en el pasado, y Ganondorf es capturado y juzgado.",
  "Link disappears from the future after returning in the past, Hyrule is submerged beneath the waters.":
    "Link desaparece del futuro tras volver al pasado, y Hyrule queda sumergido bajo las aguas.",

  "The wind sorcerer Vaati breaks free and kidnaps Princess Zelda. Drawing the Four Sword splits Link into four, and the four of them have to work together to seal him away again.":
    "El hechicero del viento Vaati se libera y secuestra a la princesa Zelda. Al desenvainar la Espada de Cuatro, Link se divide en cuatro, y los cuatro deben colaborar para volver a sellarlo.",
  "Rifts are swallowing Hyrule and its people, Link among them. This time Princess Zelda sets out herself, with a staff that lets her create echoes of the things around her.":
    "Unas grietas se están tragando Hyrule y a sus habitantes, Link incluido. Esta vez es la princesa Zelda quien parte, con un báculo que le permite crear ecos de lo que la rodea.",
  "A mark appears on Link’s hand and leads him to a princess under an ancient sleeping spell. To wake her, he has to find a hidden Triforce, while Ganon’s followers hunt him down.":
    "Una marca aparece en la mano de Link y lo lleva hasta una princesa sumida en un antiguo hechizo de sueño. Para despertarla, debe encontrar una Trifuerza oculta mientras los seguidores de Ganon le dan caza.",
  "Dark copies of Link are roaming Hyrule, and the maidens who guard Vaati’s seal have been kidnapped. Link draws the Four Sword once more and splits into four to set things right.":
    "Copias oscuras de Link recorren Hyrule, y las doncellas que guardan el sello de Vaati han sido secuestradas. Link vuelve a desenvainar la Espada de Cuatro y se divide en cuatro para arreglarlo.",
  "An action game set in the far past of Hyrule, in the war its founders fought against the Demon King — the story told in Tears of the Kingdom, seen from the battlefield.":
    "Un juego de acción ambientado en el pasado remoto de Hyrule, durante la guerra que sus fundadores libraron contra el Rey Demonio: la historia contada en Tears of the Kingdom, vista desde el campo de batalla.",

  "Loftwing Rider": "Jinete de pelícaro",
  "Sky, Force and Hero of Time eras completed": "Eras del Cielo, la Fuerza y el Héroe del Tiempo completadas",
  "Hero of Legend": "Héroe legendario",
  "Fallen Hero Timeline completed": "Línea Temporal del Fracaso del Héroe completada",
  "Twilight Realm": "Reino del Crepúsculo",
  "Child Timeline completed": "Línea Temporal de Link Niño completada",
  "King of Red Lions": "Mascarón Rojo",
  "Adult Timeline completed": "Línea Temporal de Link Adulto completada",
  "Champion of Hyrule": "Campeón de Hyrule",
  "Era of the Wilds completed": "Era de lo Salvaje completada",
  "Triforce": "Trifuerza",
  "The Legend of Zelda 100% completed": "The Legend of Zelda completado al 100 %",

  ...Object.fromEntries(DATES.map(d => ['date:' + d, unites(d, 'AÑO', 'AÑOS', 'MESES', 'DÍAS')])),
};
