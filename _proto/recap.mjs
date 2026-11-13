// recap.mjs — `/recap.json`, ce que le récap de l'année lit (n° 13 de la liste
// du 5 novembre, posé le 13 novembre 2026).
//
// Le récap part de `cg-dates` ({id: "AAAA-MM-JJ"}), posé le 5 novembre 2026 :
// le jour de chaque coche. Il lui faut, pour chaque identifiant, son univers,
// sa nature et sa durée — ce que seules les pages savent, chacune pour la
// sienne. Ce fichier le dit pour toutes, accueil compris.
//
// Tous les parcours y sont, pas seulement la découverte : une coche posée
// dans l'ordre de sortie porte l'identifiant du morceau (`twd-rl-ftwd-s1`),
// et c'est lui que `cg-dates` retient. Un renvoi (`{ref}`) porte l'identifiant
// de l'œuvre même, il n'ajoute rien. Un morceau qui recolle ou découpe
// (`covers`) prend sa propre durée s'il en a une, sinon la part de chaque bloc
// couvert — un bloc partagé par deux morceaux est compté à moitié chacun —, et
// son titre est celui du premier bloc couvert (quatrième place).
//
// Une ligne : id → [rang de l'univers, nature, minutes(, id de découverte)].
// Nature : f film, s série, j jeu, l lecture, a écoute, v vidéo.

import { charge, SOURCES, decode } from './jsonld.mjs';
import { ENCRES } from './recherche.mjs';

const NATURE = {
  film: 'f', filmanim: 'f', movie: 'f', short: 'f', special: 'f',
  serie: 's', anime: 's', tv: 's',
  jeu: 'j', dlc: 'j',
  roman: 'l', comic: 'l', jeunesse: 'l', manga: 'l', livre: 'l',
  audio: 'a', video: 'v', web: 'v',
};

export function recap({ racine }) {
  const univers = [], e = {};
  for (const u of Object.keys(SOURCES)) {
    const [ff, gf] = SOURCES[u].fr, [fe, ge] = SOURCES[u].en;
    const wf = charge(racine, ff, 'RT');
    const d = wf[gf] || charge(racine, ff, gf)[gf];
    const en = charge(racine, fe, ge)[ge];
    const RT = wf.RT || {};
    const i = univers.push([u, decode(d.title).split(' — ')[0], decode(en.title).split(' — ')[0], ENCRES[u] || '']) - 1;

    const base = {};
    d.eras.forEach(era => (era.entries || []).forEach(x => {
      if (!x || !x.id || !NATURE[x.type]) return;
      const m = +x.rt || +RT[x.id] || 0;
      base[x.id] = { n: NATURE[x.type], m };
      e[x.id] = [i, NATURE[x.type], m];
    }));
    for (const cle of ['erasRewatch', 'erasReplay', 'erasRelease']) {
      if (!d[cle]) continue;
      const morceaux = d[cle].flatMap(era => era.entries || []).filter(x => x && x.id && x.covers && !base[x.id]);
      const parts = {};
      morceaux.forEach(x => x.covers.forEach(c => { parts[c] = (parts[c] || 0) + 1; }));
      morceaux.forEach(x => {
        const couverts = x.covers.filter(c => base[c]);
        if (!couverts.length) return;
        const m = +x.rt || Math.round(couverts.reduce((s, c) => s + base[c].m / parts[c], 0));
        e[x.id] = [i, base[couverts[0]].n, m, couverts[0]];
      });
    }
  }

  // le Dossier Star Wars : des lectures, sans durée
  const D = charge(racine, 'data-dossier-sw.js', 'CGD').CGD;
  const i = univers.push(['dossier-sw', 'Dossier Star Wars', 'Star Wars Deep Dive', ENCRES.sw]) - 1;
  D.eras.forEach(era => (era.items || era.entries || []).forEach(x => {
    if (!x || x.kind !== 'it' || !x.id) return;
    e[x.id] = [i, x.k === 'audio' ? 'a' : 'l', 0];
  }));

  return { json: JSON.stringify({ v: 1, u: univers, e }), n: Object.keys(e).length };
}
