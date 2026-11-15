/* Marvel em português do Brasil, « você » ; titres d'œuvres en anglais.
   « Terra-616 », « cena pós-créditos », « Saga do Infinito / do
   Multiverso ». La table est découpée en quatre parties (`parts/`). */
import ES from '../es/mcu.mjs';
import { memes } from './outils.mjs';
import A from './parts/mcu-1.mjs';
import B from './parts/mcu-2.mjs';
import C from './parts/mcu-3.mjs';
import D from './parts/mcu-4.mjs';
export default { ...memes(ES), ...A, ...B, ...C, ...D };
