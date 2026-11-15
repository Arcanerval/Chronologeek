/* Les titres d'œuvres restent anglais (décision de Niko) : les entrées
   d'une table espagnole qui se rendent à l'identique — titres, noms
   propres — valent aussi pour le portugais. `memes(ES)` les reprend, et la
   table portugaise n'écrit que ce qui se traduit. Une entrée portugaise
   écrite l'emporte toujours (elle vient après dans l'objet). */
export const memes = t => Object.fromEntries(Object.entries(t).filter(([k, v]) => k === v));
