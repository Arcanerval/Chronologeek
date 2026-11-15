/* Les formes : un sous-item de saison ou d'épisode se rend par motif, pas
   par table. L'ordre compte, le premier qui répond gagne. Portugais du
   Brésil. */
const plur = (n, s, p) => (/[-–,]| and /.test(n) ? p : s);
export const GABARITS = [
  [/^Season (\d+) Episodes? ([\d\s,–-]+(?: and \d+)?)$/, m => `Temporada ${m[1]} ${plur(m[2], 'Episódio', 'Episódios')} ${m[2].replace(/ and /g, ' e ')}`],
  [/^Seasons? ([\d\s,–-]+(?: and \d+)?)$/, m => `${plur(m[1], 'Temporada', 'Temporadas')} ${m[1].replace(/ and /g, ' e ')}`],
  [/^Episodes? ([\d\s,–-]+(?: and \d+)?)$/, m => `${plur(m[1], 'Episódio', 'Episódios')} ${m[1].replace(/ and /g, ' e ')}`],
  [/^Chapters? ([\d\s,–-]+)$/, m => `${plur(m[1], 'Capítulo', 'Capítulos')} ${m[1]}`],
  [/^Issues? #?([\d\s,–-]+)$/, m => `${plur(m[1], 'Edição', 'Edições')} ${m[1]}`],
  [/^Part (\d+)$/, m => `Parte ${m[1]}`],
  [/^ERA (\d+)$/, m => `ERA ${m[1]}`],
  [/^Era (\d+)$/, m => `Era ${m[1]}`],
  [/^PHASE (\d+)$/, m => `FASE ${m[1]}`],
  [/^SAGA (\d+)$/, m => `SAGA ${m[1]}`],
  [/^Volume (\d+)$/, m => `Volume ${m[1]}`],
];
GABARITS.push([/^EARTH-([\dA-Z\/]+)$/, m => `TERRA-${m[1]}`]);
/* « Season 1 Episode 7 (P.O.V.) » : le titre d'épisode reste anglais. */
GABARITS.push([/^Seasons? (\d+) (Episodes?) ([\d\s,–-]+) \((.+)\)$/, m => `Temporada ${m[1]} ${m[2] === 'Episode' ? 'Episódio' : 'Episódios'} ${m[3]} (${m[4]})`]);

/* Le suffixe d'un titre d'œuvre (« Thor: Ragnarok — First Post-Credits
   Scene ») : le titre reste anglais, seul ce qui suit le tiret se traduit. */
export const SUFFIXES = new Map([
  ['First Post-Credits Scene', 'Primeira cena pós-créditos'],
  ['Second Post-Credits Scene', 'Segunda cena pós-créditos'],
  ['Post-Credits Scene', 'Cena pós-créditos'],
  ['Pre-Credits Scene (Peggy & Steve) + Both Post-Credits Scenes', 'Cena pré-créditos (Peggy e Steve) + as duas cenas pós-créditos'],
  ['SERIES FINALE', 'FINAL DA SÉRIE'],
  ['THE MOVIE', 'O FILME'],
  ['Secret Ending', 'Final secreto'],
  ['Epilogue', 'Epílogo'],
]);
export const SUFFIXES_RE = [
  [/^SEASON (\d+) FINALE$/, m => `FINAL DA TEMPORADA ${m[1]}`],
  [/^SEASON (\d+)$/, m => `TEMPORADA ${m[1]}`],
  [/^MISSIONS? ([\d-]+)$/, m => `${/-/.test(m[1]) ? 'MISSÕES' : 'MISSÃO'} ${m[1]}`],
];
