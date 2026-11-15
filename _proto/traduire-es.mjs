/* ═══ L'ESPAGNOL DU SITE ══════════════════════════════════════════════
   Posé le 14 novembre 2026. Espagnol neutre (Espagne et Amérique latine),
   tutoiement, titres d'œuvres en anglais — tranché par Niko.

       node _proto/traduire-es.mjs              écrit tout ce qui est propre
       node _proto/traduire-es.mjs sw --check   n'écrit rien, liste ce qui manque

   Le moteur est commun au portugais : `traduire-langue.mjs`. Les textes
   vivent dans `_proto/es/`, le moteur de page dans `moteur-es.mjs`.
   ══════════════════════════════════════════════════════════════════════ */
import { traduireLangue } from './traduire-langue.mjs';

await traduireLangue({
  code: 'es', adjectif: 'espagnole', locale: 'es-ES',
  titres: { champs: [['es', 'tes'], ['mx', 'tmx']] },
  moteur: 'moteur-es.mjs',
});
