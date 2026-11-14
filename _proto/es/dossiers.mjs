/* La liste des Expedientes en espagnol neutre, tutoiement. */
export default {
  "Chronologeek — Deep Dives (proto E)": "Chronologeek — Expedientes (proto E)",
  "works": "obras",
  "stations": "estaciones",
  "Star Wars Deep Dive": "Expediente Star Wars",
  "Deep Dive selection": "Selección de Expedientes",
  "The guides that go beyond the timeline: reading orders, analyses and thematic paths, universe by universe.":
    "Las guías que van más allá de la cronología: órdenes de lectura, análisis y recorridos temáticos, universo por universo.",
  "Available": "Disponible",
  "Novels · Young-reader books · Comics — the complete canon reading order, placed among the movies and shows.":
    "Novelas · Libros juveniles · Cómics: el orden de lectura canónico completo, situado entre las películas y las series.",
  "Soon": "Pronto",
  "What would you like to see here? More is on the way.": "¿Qué te gustaría ver aquí? Hay más en camino.",
  "Line under construction": "Línea en obras",
  "In progress": "En preparación",
  "Train composition": "Composición del tren",
  "In the Star Wars Deep Dive": "En el Expediente Star Wars",
  "I'm assuming that if you're here, you've already watched the animated and live-action media.":
    "Doy por hecho que, si estás aquí, ya has visto las obras animadas y de imagen real.",
  "Audio dramas": "Audiodramas",
  "On-screen markers": "Referencias en pantalla",
  "{n} Deep Dive open · {n} on-screen markers": "{n} Expediente abierto · {n} referencias en pantalla",
  "en-dossier-star-wars.html": "en-dossier-star-wars.html",
  "e-dossier-star-wars.html#reprendre": "e-dossier-star-wars.html#reprendre",
};

/* Le bloc `i18n-off` du plan : la colonne anglaise, en espagnol. Les
   comptes sont recalculés à la publication (decomptes.mjs). */
export const RETOUCHES = [
  ["var EN=document.documentElement.lang==='en';", "var EN=true;"],
  ['"High Republic",', '"Alta República",'], ['"Republic",', '"República",'], ['"Clone Wars",', '"Guerras Clon",'],
  ['"Empire",', '"Imperio",'], ['"Rebellion",', '"Rebelión",'], ['"New Republic",', '"Nueva República",'],
  ['"First Order",', '"Primera Orden",'],
  ["{oe:function(n){return n+(n>1?' works':' work');},dep:'Departure',end:'Terminus',fin:'End of the line',",
   "{oe:function(n){return n+(n>1?' obras':' obra');},dep:'Salida',end:'Terminal',fin:'Fin de la línea',"],
  ["cnt:'works',st:'Station',first:'First departure',next:'Next departure',wo:'works',lb:'Station ',start:'Departure: ',now:'Your train: '}",
   "cnt:'obras',st:'Estación',first:'Primera salida',next:'Próxima salida',wo:'obras',lb:'Estación ',start:'Salida: ',now:'Tu tren: '}"],
];
