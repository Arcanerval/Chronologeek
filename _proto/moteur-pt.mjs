/* ═══ LE MOTEUR EN PORTUGAIS ══════════════════════════════════════════
   `e-app-pt.js` tiré de `e-app.js` : voir `moteur-langue.mjs`.

       node _proto/moteur-pt.mjs            écrit e-app-pt.js
       node _proto/moteur-pt.mjs --check    n'écrit rien
   ══════════════════════════════════════════════════════════════════════ */
import { moteurLangue } from './moteur-langue.mjs';
await moteurLangue({ code: 'pt', adjectif: 'portugaise' });
