/* L'Expediente Star Wars en espagnol neutre, tutoiement. Les titres des
   lectures restent anglais (règle des titres de traduire-es.mjs). */
export default {
  "Chronologeek — Star Wars Deep Dive (proto E)": "Chronologeek — Expediente Star Wars (proto E)",
  "Novels &amp; Comics": "Novelas y cómics",
  "The complete reading order for canon Star Wars novels, young-reader books and comics, placed within the movie and show chronology.":
    "El orden de lectura completo de las novelas, los libros juveniles y los cómics canónicos de Star Wars, situados en la cronología de películas y series.",
  "Audiobooks": "Audiolibros", "Audiobook": "Audiolibro",
  "Entries": "Obras",
  "On screen — where the movies and shows fall. Not counted in your progress.": "En pantalla: dónde caen las películas y series. No cuenta en tu progreso.",
  "End of the Star Wars Deep Dive line ·": "Fin de la línea del Expediente Star Wars ·",
  "SW · On screen": "SW · En pantalla",
  "On screen": "En pantalla",
  "Star Wars Deep Dive completed": "Expediente Star Wars completado",

  "THE HIGH REPUBLIC ERA": "LA ERA DE LA ALTA REPÚBLICA",
  "THE REPUBLIC ERA": "LA ERA DE LA REPÚBLICA",
  "THE CLONE WARS": "LAS GUERRAS CLON",
  "THE IMPERIAL ERA": "LA ERA IMPERIAL",
  "THE REBELLION ERA": "LA ERA DE LA REBELIÓN",
  "THE NEW REPUBLIC ERA": "LA ERA DE LA NUEVA REPÚBLICA",
  "THE FIRST ORDER ERA": "LA ERA DE LA PRIMERA ORDEN",

  "I'm assuming that if you're here, you've already completed": "Doy por hecho que, si estás aquí, ya has terminado",
  "the animated and live-action media": "las obras animadas y de imagen real",
  "The omitted media are the same as on": "Las obras omitidas son las mismas que en",
  "the main timeline": "la cronología principal",
  ", except": ", salvo",
  "The Acolyte": "The Acolyte",
  ", which may be worth watching if you read the comics: it's the only screen production (besides": ", que puede merecer la pena si lees los cómics: es la única producción en pantalla (además de",
  "Star Wars: Young Jedi Adventures": "Star Wars: Young Jedi Adventures",
  ") set during the High Republic.": ") ambientada en la Alta República.",
  "The omitted comics are throwaway one-shots, comics aimed at young children, or adaptations of screen productions.":
    "Los cómics omitidos son números sueltos prescindibles, cómics para niños pequeños o adaptaciones de producciones de pantalla.",

  "audio drama, script published as a book": "audiodrama, guion publicado como libro",
  "before and during The High Republic: Light of the Jedi": "antes y durante The High Republic: Light of the Jedi",
  "Manga": "Manga",
  "during The High Republic: Light of the Jedi": "durante The High Republic: Light of the Jedi",
  "during The High Republic: The Rising Storm": "durante The High Republic: The Rising Storm",
  "prologue during The High Republic: Temptation of the Force": "prólogo durante The High Republic: Temptation of the Force",
  "during The High Republic: Tears of the Nameless": "durante The High Republic: Tears of the Nameless",
  "epilogue during Episode I": "epílogo durante el Episodio I",
  "during Episode I": "durante el Episodio I",
  "before and during Episode I, epilogue during Episode IV": "antes y durante el Episodio I, epílogo durante el Episodio IV",
  "prologue during Episode I, epilogue during Episode III": "prólogo durante el Episodio I, epílogo durante el Episodio III",
  "during and after Episode II": "durante y después del Episodio II",
  "before and after Darth Maul: Son of Dathomir": "antes y después de Darth Maul: Son of Dathomir",
  "before and during Solo": "antes y durante Solo",
  "before and during the Rebels episode Breaking Ranks": "antes y durante el episodio Breaking Ranks de Rebels",
  "prologue during Kanan 7": "prólogo durante Kanan 7",
  "before and during the Rebels episode Vision of Hope": "antes y durante el episodio Vision of Hope de Rebels",
  "before, during and after the Rebels episode Fire Across the Galaxy": "antes, durante y después del episodio Fire Across the Galaxy de Rebels",
  "during and after Episode IV": "durante y después del Episodio IV",
  "during Episode V": "durante el Episodio V",
  "before and during War of the Bounty Hunters: Aphra": "antes y durante War of the Bounty Hunters: Aphra",
  "epilogue during Star Wars Outlaws": "epílogo durante Star Wars Outlaws",
  "during and after Episode VI": "durante y después del Episodio VI",
  "prologue during Episode VI": "prólogo durante el Episodio VI",
  "before, during and after Episodes IV, V and VI · prologue in 11 BBY": "antes, durante y después de los Episodios IV, V y VI · prólogo en 11 BBY",
  "prologue and epilogue just before Episode VII": "prólogo y epílogo justo antes del Episodio VII",
  "during and after Episode VII": "durante y después del Episodio VII",
  "during Episode VII": "durante el Episodio VII",
};

/* Le type d'un repère écran est un libellé, mais `type` est technique
   dans les données : la page le traduit à l'affichage. */
export const RETOUCHES = [
  ["'<span class=\"scr-y\">'+att(x.type)+'</span>'", "'<span class=\"scr-y\">'+att(x.type==='On screen'?'En pantalla':x.type)+'</span>'"],
];
