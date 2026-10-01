/* ═══ LA PONCTUATION FRANÇAISE DES TITRES ═══════════════════════════
   Un titre resté anglais garde ses mots, pas sa ponctuation : la page
   française écrit « Dragon Age : Origins », comme elle écrit déjà
   « Star Trek : Voyager » depuis le 13 août 2026. Les chaînes inversées
   recopiaient le deux-points collé de leur source anglaise, et la même
   page alignait les deux graphies — 81 titres en tout, relevés le
   30 septembre 2026.

   Ne touche qu'aux valeurs des champs de texte affiché (`title`, `desc`,
   `note`, `notes`, `intro`), dans une sortie déjà sérialisée : jamais au code, jamais à
   un identifiant ni à une requête. Le motif exige un espace après le
   deux-points, ce qui laisse passer les URL (`https://`). */
const CHAMPS = /("(?:title|desc|notes?|intro)":")((?:[^"\\]|\\.)*)(")/g;

export function typoFr(sortie) {
  return sortie.replace(CHAMPS, (m, a, v, z) =>
    a + v.replace(/([^\s:])\s?:\s(?=\S)/g, '$1 : ') + z);
}
