/* ═══ LE MOTEUR EN ESPAGNOL ═══════════════════════════════════════════
   `e-app-es.js` tiré de `e-app.js` : voir `moteur-langue.mjs`.

       node _proto/moteur-es.mjs            écrit e-app-es.js
       node _proto/moteur-es.mjs --check    n'écrit rien
   ══════════════════════════════════════════════════════════════════════ */
import { moteurLangue } from './moteur-langue.mjs';
await moteurLangue({ code: 'es', adjectif: 'espagnole' });
