// recherche.mjs — l'index que la recherche de l'accueil interroge.
//
// **Chaque page cherchait dans la sienne, et rien ne cherchait dans les
// autres.** Qui arrive sur l'accueil en se demandant où se place *Andor*, *Le
// Cycle de Kyoshi* ou *Arkham Origins* devait d'abord deviner de quel univers
// il s'agit, ouvrir la page, puis y chercher — trois gestes pour une question
// qui en vaut un. Neuf timelines et un Dossier font 3 461 œuvres : c'est
// exactement la taille où un catalogue cesse de se parcourir et commence à se
// chercher.
//
// Le fichier est produit ici, à la publication, depuis les mêmes
// `_proto/data*.js` que `jsonld.mjs` et `prerendu.mjs` lisent : une entrée
// ajoutée demain entre dans l'index sans qu'on y touche, et une liste tenue à
// part ne peut pas diverger de la timeline puisqu'il n'y en a pas.
//
// Cinq choses à savoir :
//
//   · **Un fichier par langue**, `/search-fr.json` et `/search-en.json`, à la
//     racine comme `radar.json`. Les titres diffèrent — « Les Agents du
//     S.H.I.E.L.D. » et « Agents of S.H.I.E.L.D. » — et les URL aussi.
//
//   · **Les entrées sont des tableaux, pas des objets.** `[univers, titre, id,
//     date, précision]` : les cinq mêmes clés répétées 3 461 fois pesaient
//     30 Ko de plus pour rien. L'ordre est celui de la timeline, donc celui de
//     lecture, et c'est le seul classement que l'index porte.
//
//   · **L'univers est un indice, pas une chaîne.** Son nom, son URL et son
//     encre sont dits une fois en tête ; chaque entrée n'en porte que le rang.
//
//   · **La précision vient des `subitems`**, et pour la raison déjà connue du
//     `FAQPage` : une série découpée en blocs répète son titre — treize fois
//     « Les Agents du S.H.I.E.L.D. » chez Marvel. Sans elle, treize résultats
//     identiques dont rien ne distingue la cible.
//
//   · **Le Dossier en est**, avec ses 535 romans et comics. C'est le contenu
//     le plus profond du site et le moins accessible : personne ne le
//     parcourt, on y cherche un titre. Il n'est pas dans `SOURCES` — il range
//     ses lignes sous `CGD`, et ses ères portent `items` là où les timelines
//     portent `entries`.

import { charge, SOURCES, decode } from './jsonld.mjs';

// Les neuf encres de la charte, écrites ici comme dans `erreur404.mjs` : c'est
// le seul endroit du site où la couleur d'un univers doit être connue hors de
// sa propre page, et la variable CSS de l'accueil ne porte pas ces clés-là.
const ENCRES = {
  sw: '#4d9fff', mcu: '#e23636', dc: '#f5c842', avatar: '#7dd3fc',
  startrek: '#b48cf2', twd: '#a8bf4f', dragonage: '#e07b39',
  assassinscreed: '#c0202f', dcanimation: '#2dd4bf',
};

// Le Dossier reprend l'encre de Star Wars : c'est le sien.
const DOSSIER = { fr: ['data-dossier-sw.js', 'CGD'], en: ['data-dossier-sw-en.js', 'CGD'] };

const rendable = it => it && it.type !== 'separator' && it.type !== 'note' && it.id && it.title;

function entrees(eras, rang) {
  const out = [];
  const vus = {};
  const brut = [];
  for (const era of eras || []) {
    for (const it of era.entries || era.items || []) {
      if (!rendable(it)) continue;
      const titre = decode(it.title);
      vus[titre] = (vus[titre] || 0) + 1;
      brut.push({ it, titre });
    }
  }
  for (const { it, titre } of brut) {
    // La précision n'est portée que là où le titre se répète : ailleurs elle
    // alourdirait l'index sans rien distinguer.
    const p = vus[titre] > 1
      ? (it.subitems || []).map(decode).filter(Boolean).join(' · ')
      : '';
    out.push([rang, titre, it.id, decode(it.date || ''), p]);
  }
  return out;
}

/**
 * Rend l'index d'une langue, prêt à écrire. `urls` donne l'URL de chaque clé
 * de route dans cette langue.
 */
export function recherche({ racine, langue, urls }) {
  const univers = [];
  const items = [];

  for (const cle of Object.keys(SOURCES)) {
    const [fichier, global] = SOURCES[cle][langue];
    const u = charge(racine, fichier, global)[global];
    items.push(...entrees(u.eras, univers.length));
    univers.push({ k: cle, n: decode(u.title), h: urls[cle], c: ENCRES[cle] });
  }

  const [fichier, global] = DOSSIER[langue];
  const d = charge(racine, fichier, global)[global];
  items.push(...entrees(d.eras, univers.length));
  // **Le Dossier n'a pas de titre dans ses données** — `CGD` ne porte que
  // `eras` et `intro`. Son nom se compose donc comme `jsonld.mjs` compose son
  // fil d'Ariane, à partir des libellés de navigation : « Dossiers — Star
  // Wars », et l'anglais suit sans qu'on écrive quoi que ce soit. Il faut bien
  // qu'il se distingue du groupe « Star Wars », qui est juste au-dessus.
  const t = charge(racine, langue === 'fr' ? 'data.js' : 'data-en.js').CG.t;
  univers.push({
    k: 'dossier-sw',
    n: `${decode(t.nav.deep)} — ${decode(t.nav.sw)}`,
    h: urls['dossier-sw'],
    c: ENCRES.sw,
  });

  // Un index vide est un appariement qui a raté, pas un site sans contenu.
  if (items.length < 1000) {
    throw new Error(`recherche : ${items.length} entrée(s) pour ${univers.length} univers`);
  }
  // `decode(undefined)` rend la chaîne « undefined » et se lit comme un nom :
  // c'est ce que l'en-tête du Dossier annonçait avant ce garde-fou, sans une
  // ligne dans la console. Une URL manquante enverrait, elle, sur `/undefined#`.
  for (const u of univers) {
    if (!u.n || u.n.indexOf('undefined') >= 0 || !u.h) {
      throw new Error(`recherche : l'univers « ${u.k} » sort sans nom ou sans URL (${u.n} / ${u.h})`);
    }
  }
  return JSON.stringify({ u: univers, e: items });
}
