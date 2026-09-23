/* `node _proto/ordre-sortie.mjs` — relève la date de sortie complète de
   chaque entrée du parcours par ordre de sortie de Marvel, chez TMDB, et
   dit où l'ordre écrit dans `erasRelease` ne la suit pas. Il n'écrit
   rien : il rapporte.

   À rejouer à chaque œuvre ajoutée. `erasRelease` ne porte que l'année
   de sortie, et l'année ne suffit pas à ranger une ère : The Punisher:
   One Last Kill et Spider-Man: Brand New Day annoncent 2026 tous les
   deux, et deux mois et demi les séparent. Personne ne voit l'erreur à
   l'écran — les deux cartes disent « SORTIE 2026 » —, seul ce script la
   dit.

   Trois choses à savoir :

   - **Une série est datée par SA SAISON, jamais par sa première.** Une
     saison 2 datée par la série entière remonte de plusieurs années et
     casse tout l'ordre autour d'elle. `season` vient de l'entrée, et
     pour une saison recollée du premier bloc qu'elle couvre.
   - **La sortie américaine, pas la première au monde.** `release_date`
     d'un film peut être une projection de festival ; on lit d'abord les
     dates par pays et on ne retombe sur elle qu'à défaut.
   - **Les quatre Marvel One-Shots portent `tmdb:0`** et n'ont donc pas
     de fiche à interroger. Leur date est celle du Blu-ray qui les
     porte, écrite plus bas. Sans elles, le rapport annonçait « 4 sans
     date » et ne disait rien de leur rang. */
import fs from 'node:fs';

const src = fs.readFileSync('_proto/data-mcu.js', 'utf8');
const { CG, D } = new Function('window', 'var CGD;' + src +
  ';return {CG:window.CG,D:DATA_MCU};')({});
const KEY = CG.tmdbKey;
const BYID = {};
D.eras.forEach(e => e.entries.forEach(x => { BYID[x.id] = x; }));

const cache = new Map();
async function api(chemin) {
  if (cache.has(chemin)) return cache.get(chemin);
  const r = await fetch('https://api.themoviedb.org/3' + chemin +
    (chemin.includes('?') ? '&' : '?') + 'api_key=' + KEY);
  const j = r.ok ? await r.json() : null;
  cache.set(chemin, j);
  return j;
}

/* La date d'une entrée : celle de la saison quand c'en est une, celle
   du film sinon. On prend la sortie américaine quand TMDB la donne —
   `release_date` est la première au monde, qui peut être un festival. */
/* Les quatre Marvel One-Shots portent `tmdb:0` : ils n'ont pas de fiche
   dans les données, et leur sortie est celle du Blu-ray qui les porte. */
const ONESHOTS = {
  'mcu-consultant': '2011-09-13',  // bonus du Blu-ray Thor
  'mcu-item47': '2012-09-25',      // bonus du Blu-ray Avengers
  'mcu-ac-os': '2013-09-09',       // bonus du Blu-ray Iron Man 3
  'mcu-roi': '2014-02-04',         // bonus du Blu-ray Thor 2
};
async function dateDe(e) {
  if (ONESHOTS[e.id]) return ONESHOTS[e.id];
  if (!e.tmdb) return null;
  if (e.media === 'tv') {
    if (e.season) {
      const s = await api('/tv/' + e.tmdb + '/season/' + e.season);
      if (s && s.air_date) return s.air_date;
    }
    const t = await api('/tv/' + e.tmdb);
    return t ? t.first_air_date : null;
  }
  const rd = await api('/movie/' + e.tmdb + '/release_dates');
  const us = rd && (rd.results || []).find(x => x.iso_3166_1 === 'US');
  if (us) {
    const th = us.release_dates.filter(x => [2, 3, 4, 6].includes(x.type))
      .map(x => x.release_date).sort()[0];
    if (th) return th.slice(0, 10);
  }
  const m = await api('/movie/' + e.tmdb);
  return m ? m.release_date : null;
}

const lignes = [];
for (const era of D.erasRelease) {
  for (const x of era.entries) {
    const s = BYID[x.ref || (x.covers || [])[0]];
    /* Une saison regroupée : le numéro vient du premier bloc couvert. */
    const d = await dateDe(s);
    lignes.push({ era: era.title, id: x.ref || x.id, titre: s.title,
      sub: (x.subitems || s.subitems || [])[0] || '', rel: x.rel, tmdb: d });
  }
}

let n = 0;
for (const era of D.erasRelease) {
  const dans = lignes.filter(l => l.era === era.title);
  console.log('\n== ' + era.title);
  let prec = null;
  for (const l of dans) {
    const casse = prec && l.tmdb && l.tmdb < prec;
    if (casse) n++;
    console.log((casse ? '  ⚠ ' : '    ') + (l.tmdb || '????-??-??') +
      '   rel=' + l.rel.padEnd(9) + ' ' + l.titre +
      (l.sub ? ' — ' + l.sub : '') + '   [' + l.id + ']');
    if (l.tmdb) prec = l.tmdb;
  }
}
console.log('\n' + n + ' entrée(s) hors ordre, ' +
  lignes.filter(l => !l.tmdb).length + ' sans date TMDB.');
