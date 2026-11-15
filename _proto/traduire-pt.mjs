/* ═══ LE PORTUGAIS DU SITE ════════════════════════════════════════════
   Posé le 15 novembre 2026. Portugais du Brésil, « você », titres
   d'œuvres en anglais avec l'option « Títulos em português » — tranché par
   Niko. Même chaîne que l'espagnol : `traduire-langue.mjs`.

       node _proto/traduire-pt.mjs              écrit tout ce qui est propre
       node _proto/traduire-pt.mjs sw --check   n'écrit rien, liste ce qui manque

   Les textes vivent dans `_proto/pt/`, le moteur de page dans
   `moteur-pt.mjs`, les titres portugais dans `titres-pt.mjs`.
   ══════════════════════════════════════════════════════════════════════ */
import { traduireLangue } from './traduire-langue.mjs';

await traduireLangue({
  code: 'pt', adjectif: 'portugaise', locale: 'pt-BR',
  titres: { champs: [['br', 'tpt'], ['pt', 'tpp']] },
  moteur: 'moteur-pt.mjs',
});
