/* The Witcher em português do Brasil, « você » ; titres d'œuvres en
   anglais. Jaskier pour Dandelion, comme les éditions brésiliennes. */
import ES from '../es/witcher.mjs';
import { memes } from './outils.mjs';
import A from './parts/witcher-1.mjs';
import B from './parts/witcher-2.mjs';

export const RETOUCHES = [
  ["' station'+(ZONES.length>1?'s':'')", "(ZONES.length>1?' estações':' estação')"],
];
export default { ...memes(ES), "The 2 timelines": "As 2 cronologias", ...A, ...B };
