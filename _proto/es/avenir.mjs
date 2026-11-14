/* « Próximamente » (le radar) en espagnol neutre, tutoiement. */
export default {
  "Chronologeek — Upcoming (proto E)": "Chronologeek — Próximamente (proto E)",
  "Updated every day": "Actualizado cada día",
  "Every upcoming Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, DC Animation, Jurassic World, The Witcher, Resident Evil, Blade Runner and Monsterverse release — updated every single day.":
    "Todos los próximos estrenos de Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, Assassin’s Creed, DC Animation, Jurassic World, The Witcher, Resident Evil, Blade Runner y Monsterverse, actualizados cada día.",
  "upcoming releases": "próximos estrenos",
  "universes departing": "universos con salidas",
  "next departure": "próxima salida",
  "months ahead": "meses por delante",
  "Map of the timeline": "Plano de la cronología",
  "Next departure ·": "Próxima salida ·",
  "Filters, search and sources": "Filtros, búsqueda y fuentes",
  "Search a release": "Buscar un estreno",
  "Format": "Formato",
  "Nothing matches. Try another spelling, or turn the filters you switched off back on.": "Nada coincide. Prueba otra forma de escribirlo o vuelve a activar los filtros que quitaste.",
  "next ·": "próxima ·",
  "T00:00:00": "T00:00:00", "_blank": "_blank", "_proto": "_proto",
  "Next station:": "Próxima estación:",
  "until release": "para el estreno",
  "Updated automatically every day": "Actualizado automáticamente cada día",
  "Terminus for now": "Terminal por ahora",
  "New releases are added every night": "Los nuevos estrenos se añaden cada noche",
  "not the": "no el",
  "at the root: serve the repository (port 8947),": "en la raíz: sirve el repositorio (puerto 8947),",
  "The radar could not be loaded.": "No se ha podido cargar el radar.",
  "D‑": "D‑",
  "TOMORROW": "MAÑANA",
  "TODAY": "HOY",
  "Other": "Otro",
};

/* Les blocs `i18n-off` de la page choisissent leur langue à l'exécution :
   `FR` vaut vrai dès que la page n'est pas anglaise. Sur la page espagnole,
   on prend la branche anglaise (sortie américaine, titre original, comme
   le moteur) et on en traduit les mots. */
const MOIS_ES = "['enero','febrero','marzo','abril','mayo','junio',";
export const RETOUCHES = [
  /* « estreno » est masculin : « mostrados », pas « mostradas » */
  ["(n>1?'s':'')+' mostradas';", "(n>1?'s':'')+' mostrado'+(n>1?'s':'');"],
  /* les mots seuls du décompte : pl() ajoute le « s » */
  [",'release')", ",'estreno')"],
  ["(total>1?'releases':'release')", "(total>1?'estrenos':'estreno')"],
  ["textContent='release'+(n>1?'s':'')+' tracked';", "textContent='estreno'+(n>1?'s':'')+' seguido'+(n>1?'s':'');"],
  ["var FR = document.documentElement.lang !== 'en';", "var FR = false;"],
  ["['January','February','March','April','May','June',", MOIS_ES],
  ["'July','August','September','October','November','December']", "'julio','agosto','septiembre','octubre','noviembre','diciembre']"],
  ["['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']", "['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic']"],
  ["['Sun','Mon','Tue','Wed','Thu','Fri','Sat']", "['dom','lun','mar','mié','jue','vie','sáb']"],
  ["['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']", "['domingo','lunes','martes','miércoles','jueves','viernes','sábado']"],
  ["JOURS_L[d.getDay()]+', '+MOIS[d.getMonth()]+' '+d.getDate();", "JOURS_L[d.getDay()]+' '+d.getDate()+' de '+MOIS[d.getMonth()];"],
  ["return MOIS[parseInt(m[2],10)-1]+' '+parseInt(m[3],10)+', '+m[1];", "return parseInt(m[3],10)+' de '+MOIS[parseInt(m[2],10)-1]+' de '+m[1];"],
  ["{premiere:'Premiere',finale:'Finale',saison:'All season'}", "{premiere:'Estreno',finale:'Final',saison:'Temporada completa'}"],
  ["lang:FR?'fr-FR':'en-US'}", "lang:FR?'fr-FR':'es-ES'}"],
  ["{annee:'Year',genre:'Genre',note:'Rating',periode:'Period',", "{annee:'Año',genre:'Género',note:'Nota',periode:'Periodo',"],
  ["serie:'The series',trailer:'YouTube trailer'}", "serie:'La serie',trailer:'Tráiler en YouTube'}"],
  /* le radar n'a pas de synopsis espagnol : l'anglais est signalé */
  ["else { syn=e.syn||''; }", "else { syn=e.syn||''; if(syn) marque='<span class=\"en\">EN</span>'; }"],
];
