/* ═══ LE CÂBLAGE DE LA NAVIGATION ════════════════════════════════════
   Remplace les `href="#"` morts des protos par leur vraie cible.

   Les protos ont été dessinés page par page, et la navigation a gardé
   des `#` de maquette : depuis l'accueil, aucun des quatre univers
   n'était cliquable ; depuis Star Wars, ni Marvel ni DC. Le menu avait
   l'air complet et ne menait nulle part.

   Un seul `#` est légitime et le script n'y touche pas : la page
   courante, reconnaissable à son `aria-current="page"`.

   « Soutenir le site » a été retiré du pied le 14 août 2026 — rien
   n'était branché pour recevoir, et le proposer avant qu'on le demande
   ne se lit pas bien. « Contact » n'est plus un `#` non plus : il porte
   `href="#contact"` et son `data-contact` ouvre le formulaire d'e-app.js.

   Avatar en faisait partie jusqu'au 8 août 2026 ; `e-avatar.html` existe
   désormais et la carte de l'accueil se déverrouille avec.

       node _proto/cabler-nav.mjs          câble les protos français
       node _proto/cabler-nav.mjs --check  n'écrit rien, montre le bilan

   Les pages anglaises n'ont pas besoin d'être traitées : `traduire-
   pages.mjs` les régénère depuis le français et réécrit les cibles.
   ══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');

/* Le libellé d'un lien suffit à savoir où il mène : les huit pages
   emploient les mêmes mots dans la barre, dans le tiroir et au pied. */
const CIBLES = new Map([
  ['Accueil', 'e-accueil.html'],
  ['Dossiers', 'e-dossiers.html'],
  ['Star Wars', 'e-starwars.html'],
  ['Marvel', 'e-marvel.html'],
  ['Marvel — MCU', 'e-marvel.html'],
  ['Avatar', 'e-avatar.html'],
  ['DC', 'e-dc.html'],
  ['DC Multivers', 'e-dc.html'],
  ['DC Multiverse', 'e-dc.html'],
  ['À venir', 'e-a-venir.html'],
  ['Sorties à venir', 'e-a-venir.html'],
  ['Nouveautés', 'e-nouveautes.html'],
  ['Dossier Star Wars', 'e-dossier-star-wars.html'],
  ['Romans & Comics', 'e-dossier-star-wars.html'],
  /* le bouton au pied de la section « Les Dossiers », sur l'accueil */
  ['Ouvrir ▸', 'e-dossiers.html'],
]);

/* Les cartes de l'accueil, repérées par l'univers qu'elles annoncent. */
const PAR_UNIVERS = new Map([
  ['sw', 'e-starwars.html'],
  ['mcu', 'e-marvel.html'],
  ['dc', 'e-dc.html'],
  ['avatar', 'e-avatar.html'],
]);

const PAGES = ['e-accueil.html', 'e-starwars.html', 'e-marvel.html', 'e-dc.html',
  'e-avatar.html', 'e-dossiers.html', 'e-dossier-star-wars.html',
  'e-nouveautes.html', 'e-a-venir.html'];

const texteSeul = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

let total = 0;
for (const page of PAGES) {
  const chemin = path.join(ICI, page);
  const avant = fs.readFileSync(chemin, 'utf8');
  const faits = [];

  let apres = avant.replace(
    /<a\b([^>]*?)href="#"([^>]*)>([\s\S]*?)<\/a>/g,
    (bloc, gauche, droite, dedans) => {
      const attrs = gauche + droite;
      /* la page où l'on est déjà : le `#` est voulu */
      if (/aria-current\s*=\s*"page"/.test(attrs)) return bloc;

      /* une carte de l'accueil, désignée par son univers */
      const u = /data-u="([a-z]+)"/.exec(attrs);
      if (u) {
        const cible = PAR_UNIVERS.get(u[1]);
        if (!cible || page === cible) return bloc;
        faits.push(`carte ${u[1]} → ${cible}`);
        return `<a${gauche}href="${cible}"${droite}>${dedans}</a>`;
      }

      /* un lien de menu ou de pied de page, désigné par son libellé */
      const cible = CIBLES.get(texteSeul(dedans));
      if (!cible || page === cible) return bloc;
      faits.push(`${texteSeul(dedans)} → ${cible}`);
      return `<a${gauche}href="${cible}"${droite}>${dedans}</a>`;
    });

  if (apres !== avant && !CHECK) fs.writeFileSync(chemin, apres, 'utf8');
  total += faits.length;

  const compte = new Map();
  for (const f of faits) compte.set(f, (compte.get(f) || 0) + 1);
  console.log(`  ${page.padEnd(28)} ${faits.length ? faits.length + ' lien(s) câblé(s)' : 'rien à faire'}`);
  for (const [f, n] of compte) console.log(`      ${f}${n > 1 ? `  ×${n}` : ''}`);
}

console.log(`\n  ${total} lien(s) au total${CHECK ? ' — rien n\'a été écrit' : ''}`);
