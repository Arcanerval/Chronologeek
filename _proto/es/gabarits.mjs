/* Les formes : un sous-item de saison ou d'épisode se rend par motif, pas
   par table. L'ordre compte, le premier qui répond gagne. */
const plur = (n, s, p) => (/[-–,]| and /.test(n) ? p : s);
export const GABARITS = [
  [/^Season (\d+) Episodes? ([\d\s,–-]+(?: and \d+)?)$/, m => `Temporada ${m[1]} ${plur(m[2], 'Episodio', 'Episodios')} ${m[2].replace(/ and /g, ' y ')}`],
  [/^Seasons? ([\d\s,–-]+(?: and \d+)?)$/, m => `${plur(m[1], 'Temporada', 'Temporadas')} ${m[1].replace(/ and /g, ' y ')}`],
  [/^Episodes? ([\d\s,–-]+(?: and \d+)?)$/, m => `${plur(m[1], 'Episodio', 'Episodios')} ${m[1].replace(/ and /g, ' y ')}`],
  [/^Chapters? ([\d\s,–-]+)$/, m => `${plur(m[1], 'Capítulo', 'Capítulos')} ${m[1]}`],
  [/^Issues? #?([\d\s,–-]+)$/, m => `${plur(m[1], 'Número', 'Números')} ${m[1]}`],
  [/^Part (\d+)$/, m => `Parte ${m[1]}`],
  [/^ERA (\d+)$/, m => `ERA ${m[1]}`],
  [/^Era (\d+)$/, m => `Era ${m[1]}`],
  [/^PHASE (\d+)$/, m => `FASE ${m[1]}`],
  [/^SAGA (\d+)$/, m => `SAGA ${m[1]}`],
  [/^Volume (\d+)$/, m => `Volumen ${m[1]}`],
];
GABARITS.push([/^EARTH-([\dA-Z\/]+)$/, m => `TIERRA-${m[1]}`]);
/* « Season 1 Episode 7 (P.O.V.) » : le titre d'épisode reste anglais. */
GABARITS.push([/^Seasons? (\d+) (Episodes?) ([\d\s,–-]+) \((.+)\)$/, m => `Temporada ${m[1]} ${m[2] === 'Episode' ? 'Episodio' : 'Episodios'} ${m[3]} (${m[4]})`]);
