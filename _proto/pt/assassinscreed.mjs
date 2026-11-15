/* Assassin's Creed em português do Brasil, « você » ; titres d'œuvres en
   anglais. La table est découpée en deux parties (`parts/`). */
import ES from '../es/assassinscreed.mjs';
import { memes } from './outils.mjs';
import A from './parts/ac-1.mjs';
import B from './parts/ac-2.mjs';
export default { ...memes(ES), ...A, ...B };
