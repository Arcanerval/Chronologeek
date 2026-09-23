/* `node _proto/ordre-sortie.mjs [sw|mcu]` — relève la date de sortie
   complète de chaque entrée du parcours par ordre de sortie, chez TMDB,
   et dit où l'ordre écrit dans `erasRelease` ne la suit pas. Sans
   argument, il passe les deux univers qui ont ce parcours. Il n'écrit
   rien : il rapporte, et sort en erreur s'il trouve un rang faux.

   À rejouer à chaque œuvre ajoutée. `erasRelease` ne porte que l'année
   de sortie, et l'année ne suffit pas à ranger une ère : The Punisher:
   One Last Kill et Spider-Man: Brand New Day annonçaient 2026 tous les
   deux, et deux mois et demi les séparent. Personne ne voit l'erreur à
   l'écran — les deux cartes disent « SORTIE 2026 » —, seul ce script la
   dit.

   Quatre choses à savoir :

   - **Une série est datée par SA SAISON, jamais par sa première.** Une
     saison 2 datée par la série entière remonte de plusieurs années et
     casse tout l'ordre autour d'elle. Le numéro vient du champ `season`
     quand il existe — Marvel le pose — et sinon du premier sous-item,
     « Saison 3 », qui est la seule marque que Star Wars en donne.
   - **La sortie américaine, pas la première au monde.** `release_date`
     d'un film peut être une projection de festival ; on lit d'abord les
     dates par pays et on ne retombe sur elle qu'à défaut.
   - **Ce que TMDB ne connaît pas est écrit ici, à la main** : les six
     jeux de Star Wars et les quatre Marvel One-Shots portent `tmdb:0`,
     et il n'y a pas de fiche à interroger. Un jeu est daté de sa sortie
     PC/console, un One-Shot du Blu-ray qui le porte. Sans ces lignes le
     rapport annonçait « 10 sans date » et ne disait rien de leur rang.
   - **Une date peut être partielle** quand seul le mois est connu —
     Zero Company. La comparaison est lexicographique, donc « 2026-08 »
     se range bien entre juillet et septembre ; l'affichage le dit avec
     des points d'interrogation plutôt que d'inventer un jour. */
import fs from 'node:fs';

const UNIVERS = {
  sw: {
    fichier: '_proto/data.js', global: 'DATA_SW',
    dates: {
      /* Les six jeux, à leur sortie PC/console. */
      'sw-rl-bf2': '2017-11-17',      // Star Wars Battlefront II
      'sw-fo': '2019-11-15',          // Jedi: Fallen Order
      'sw-squadrons': '2020-10-02',   // Squadrons
      'sw-survivor': '2023-04-28',    // Jedi: Survivor
      'sw-outlaws': '2024-08-30',     // Outlaws
      'sw-zerocompany': '2026-08',    // Zero Company, mois seul
      /* The Clone Wars entre à la date de sa première télé, et non de
         sa saison 1 : le bloc tient les sept saisons d'un coup, rangées
         dans l'ordre du guide et non dans celui des sorties. C'est le
         seul endroit du parcours où l'ordre de sortie ne descend pas
         jusqu'à l'intérieur de l'entrée — la série a diffusé sur douze
         ans, et ses arcs ne sortent pas dans l'ordre où on les regarde. */
      'sw-rl-tcw': '2008-10-03',
    },
  },
  mcu: {
    fichier: '_proto/data-mcu.js', global: 'DATA_MCU',
    dates: {
      'mcu-consultant': '2011-09-13',  // bonus du Blu-ray Thor
      'mcu-item47': '2012-09-25',      // bonus du Blu-ray Avengers
      'mcu-ac-os': '2013-09-09',       // bonus du Blu-ray Iron Man 3
      'mcu-roi': '2014-02-04',         // bonus du Blu-ray Thor 2
    },
  },
};

const cache = new Map();
async function api(chemin, cle) {
  if (cache.has(chemin)) return cache.get(chemin);
  const r = await fetch('https://api.themoviedb.org/3' + chemin +
    (chemin.includes('?') ? '&' : '?') + 'api_key=' + cle);
  const j = r.ok ? await r.json() : null;
  cache.set(chemin, j);
  return j;
}

/* Le numéro de saison : le champ quand il existe, le premier sous-item
   qui le nomme sinon. Les sous-items de l'entrée de parcours priment —
   c'est là qu'une saison recollée dit laquelle elle est. */
function saisonDe(x, s) {
  if (s.season) return s.season;
  for (const t of [...(x.subitems || []), ...(s.subitems || [])]) {
    const m = /^\s*(?:Saison|Season)\s+(\d+)\s*$/.exec(t);
    if (m) return +m[1];
  }
  return null;
}

async function dateDe(x, s, cle) {
  if (!s.tmdb || s.tmdb === '0') return null;
  if (s.media === 'tv') {
    const n = saisonDe(x, s);
    if (n) {
      const sa = await api('/tv/' + s.tmdb + '/season/' + n, cle);
      if (sa && sa.air_date) return sa.air_date;
    }
    const t = await api('/tv/' + s.tmdb, cle);
    return t ? t.first_air_date : null;
  }
  const rd = await api('/movie/' + s.tmdb + '/release_dates', cle);
  const us = rd && (rd.results || []).find(p => p.iso_3166_1 === 'US');
  if (us) {
    const th = us.release_dates.filter(p => [2, 3, 4, 6].includes(p.type))
      .map(p => p.release_date).sort()[0];
    if (th) return th.slice(0, 10);
  }
  const m = await api('/movie/' + s.tmdb, cle);
  return m ? m.release_date : null;
}

let fauxTotal = 0;
const demandes = process.argv.slice(2).filter(a => UNIVERS[a]);
for (const nom of (demandes.length ? demandes : Object.keys(UNIVERS))) {
  const U = UNIVERS[nom];
  const src = fs.readFileSync(U.fichier, 'utf8');
  const { CG, D } = new Function('window', 'var CGD;' + src +
    ';return {CG:window.CG,D:' + U.global + '};')({});
  if (!D.erasRelease) { console.log('\n### ' + nom + ' — pas de parcours par ordre de sortie'); continue; }
  const BYID = {};
  D.eras.forEach(e => e.entries.forEach(x => { BYID[x.id] = x; }));

  console.log('\n### ' + nom.toUpperCase() + ' — ' + D.title);
  let faux = 0, sans = 0, n = 0;
  for (const era of D.erasRelease) {
    console.log('\n== ' + era.title);
    let prec = null;
    for (const x of era.entries) {
      const id = x.ref || x.id;
      const s = BYID[x.ref || (x.covers || [])[0]] || {};
      const d = U.dates[id] || await dateDe(x, s, CG.tmdbKey);
      n++;
      if (!d) sans++;
      const casse = prec && d && d < prec;
      if (casse) faux++;
      /* « 2026-08 » s'affiche « 2026-08-?? » : le tiret dit que c'est un
         jour qui manque, pas trois caractères de date en plus. */
      const vue = d ? (d.length === 7 ? d + '-??' : d) : '????-??-??';
      console.log((casse ? '  ⚠ ' : '    ') + vue +
        '   ' + String(x.rel || '—').padEnd(10) + s.title + '   [' + id + ']');
      if (d) prec = d;
    }
  }
  console.log('\n' + n + ' entrées · ' + faux + ' hors ordre · ' + sans + ' sans date');
  fauxTotal += faux + sans;
}
if (fauxTotal) process.exitCode = 1;
