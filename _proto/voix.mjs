/* La voix off des videos : edge-tts (`pip install edge-tts`), gratuit.
   Partagee par presentation.mjs et video.mjs.

   La voix anglaise est Ava, choisie par Niko le 5 octobre 2026 (« hyper
   naturelle ») — et pas la variante « Multilingual » : celle-ci devine la
   langue phrase par phrase, et sur « Chronolo-geek dot app » elle changeait
   d'accent a la derniere phrase. */

import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const VOIX = { en: 'en-US-AvaNeural', fr: 'fr-FR-VivienneMultilingualNeural' };
export const DEBIT = '+8%';

/* « geek » se dit « guik », comme le mot : d'un seul tenant, la synthese lisait
   « chronolo-djik ». Seul ce qui est lu change, jamais le texte affiche. */
const PRONONCE = { en: [/Chronologeek/g, 'Chronolo-geek'], fr: [/Chronologeek/g, 'Chronolo-guik'] };

export const duree = f => Number(execFileSync('ffprobe',
  ['-v','error','-show_entries','format=duration','-of','csv=p=0', f]).toString().trim());

/* Rend `texte` dans `wav` (48 kHz stereo) et en donne la duree. edge-tts laisse
   un tiers de seconde de silence en fin de phrase : il est retire, sinon il
   s'ajoute a la respiration et le montage traine. */
export function parle(texte, lang, wav, { voix = VOIX[lang], debit = DEBIT } = {}) {
  const mp3 = wav.replace(/\.wav$/, '') + '.mp3';
  execFileSync('py', ['-m', 'edge_tts', '--voice', voix, `--rate=${debit}`,
    '--text', texte.replace(...PRONONCE[lang]), '--write-media', mp3], { stdio: 'ignore' });
  execFileSync('ffmpeg', ['-y','-loglevel','error','-i', mp3,
    '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar','48000','-ac','2', wav]);
  return duree(wav);
}

export const chemin = (dossier, nom) => path.join(dossier, nom + '.wav');
