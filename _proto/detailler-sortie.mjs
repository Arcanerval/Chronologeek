/* `node _proto/detailler-sortie.mjs [twd|startrek|…] [--check]` — détaille le
   parcours par ordre de sortie : toutes les sorties d'un univers fusionnées
   par date, jusqu'à l'épisode et au numéro.

   Demandé par Niko le 4 novembre 2026, et ça corrige la règle du 22 octobre
   (« une saison est une sortie ») : une saison reste une seule carte tant que
   rien ne s'y intercale, deux séries qui diffusent en même temps alternent
   épisode par épisode, un film au milieu d'une saison la coupe en deux blocs,
   une saison sortie d'un coup reste une carte.

   La source est `_proto/sorties/<univers>.json` : l'ordre de sortie **par
   œuvres entières**, ères comprises. C'est là qu'on ajoute une œuvre, puis on
   relance : `erasRelease` est écrit dans le fichier de données, et toute
   retouche faite à la main y serait perdue au passage suivant.

   Rien n'est perdu d'un morceau à l'autre : chacun porte `covers` vers les
   blocs de découverte dont il tient des épisodes, et `bridge()` coche un bloc
   quand tous ses morceaux le sont.

   `node _proto/ordre-sortie.mjs` reste le contrôle : il relit les dates chez
   TMDB et sort en erreur sur un rang faux. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIVERS, api, dateFilm, doubles, numGuide } from './ordre-sortie.mjs';
import { NUMEROS } from './sorties/numeros.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const CHECK = process.argv.includes('--check');

const MOTS = {
  en: { saison: 'Season', ep1: 'Episode', epN: 'Episodes' },
  fr: { saison: 'Saison', ep1: 'Épisode', epN: 'Épisodes' },
};

/* Un sous-item qui nomme une saison, avec ou sans épisodes. Trois graphies à
   tenir : « Season 1 Episodes 3 » au pluriel, « Saison 2 Épisodes 7-8-9 », et
   « Saison 3 Épisodes 1-17 (Un Espion en Danger) », le nom d'arc derrière. */
const RE_SOUS = /^\s*(?:Saison|Season)\s+(\d+)(?:\s+(?:Épisodes?|Episodes?)\s*(\d+(?:\s*[-–]\s*\d+)*))?\s*(?:\(.*\))?\s*$/i;

function lire(sous) {
  const m = RE_SOUS.exec(sous);
  if (!m) return null;
  if (!m[2]) return { s: +m[1], a: null, b: null };
  /* « Season 1 Episodes 12-11 » : deux épisodes vus à l'envers. */
  const ns = m[2].split(/[-–]/).map(Number);
  return { s: +m[1], a: Math.min(...ns), b: Math.max(...ns) };
}

/* Les saisons et les épisodes que nomme un bloc de découverte. */
function plagesDe(bloc, U) {
  const p = (U.plages || {})[bloc.id];
  if (p) return p;
  const out = [];
  for (const t of bloc.subitems || []) {
    const q = lire(t);
    if (q) out.push(q);
  }
  if (!out.length && bloc.season) out.push({ s: bloc.season, a: null, b: null });
  return out;
}

/* Les épisodes d'une carte : saison par saison, lesquels elle tient et dans
   quels blocs ils vivent. `null` : la carte ne se découpe pas. */
async function episodesDeCarte(x, BYID, U, cle) {
  const ids = x.ref ? [x.ref] : (x.covers || []);
  const blocs = ids.map(i => BYID[i]).filter(Boolean);
  if (!blocs.length) throw new Error('référence morte : ' + JSON.stringify(x));
  const b0 = blocs[0];
  if (b0.media !== 'tv' || !b0.tmdb || b0.tmdb === '0') return null;
  if (blocs.some(b => b.tmdb !== b0.tmdb)) return null;
  if (U.dates[x.ref || x.id]) return null;   // daté à la main : une sortie
  if ((U.atomiques || []).includes(x.ref || x.id)) return null;

  /* Les sous-items de la carte restreignent : « Season 2 » sur un bloc qui
     en tient trois. */
  const voulues = (x.subitems || []).map(lire).filter(Boolean);
  const parSaison = new Map();
  for (const b of blocs) {
    for (const p of plagesDe(b, U)) {
      if (voulues.length && !voulues.some(v => v.s === p.s &&
        (v.a == null || p.a == null || (p.a <= v.b && p.b >= v.a)))) continue;
      if (!parSaison.has(p.s)) parSaison.set(p.s, []);
      parSaison.get(p.s).push({ bloc: b.id, a: p.a, b: p.b });
    }
  }
  /* Une série d'une seule saison n'en nomme aucune : Kenobi, Ahsoka, Boba
     Fett. Quand aucun bloc ne dit rien, c'est la saison 1 entière. */
  if (!parSaison.size) {
    if (blocs.some(b => plagesDe(b, U).length)) return null;
    parSaison.set(1, blocs.map(b => ({ bloc: b.id, a: null, b: null })));
  }
  /* Un bloc qui ne nomme rien à côté de blocs qui nomment : l'épilogue de
     Rebels, dans la saison 4. Il se rattache au dernier épisode de la carte. */
  const orphelins = blocs.map(b => b.id).filter(i => ![...parSaison.values()].flat().some(p => p.bloc === i));

  const atomes = [];
  for (const [s, plages] of parSaison) {
    /* Flight 462 est la saison 0 de Fear the Walking Dead chez TMDB. */
    const num = (U.saisons || {})[b0.id] ?? s;
    const sa = await api('/tv/' + b0.tmdb + '/season/' + num, cle);
    if (!sa || !sa.episodes) return null;
    const rts = sa.episodes.map(e => e.runtime).filter(Boolean);
    const moy = rts.length ? rts.reduce((a, c) => a + c, 0) / rts.length : 0;
    const vs = voulues.filter(q => q.s === s);
    const dbl = doubles(U, b0.tmdb, s);
    for (const e of sa.episodes) {
      if (!e.air_date) continue;
      /* Le numéro du guide, qui compte deux fois les épisodes doubles. */
      const n = numGuide(e.episode_number, dbl);
      const z = n + (dbl.includes(e.episode_number) ? 1 : 0);
      if (vs.length && !vs.some(v => v.a == null || (z >= v.a && n <= v.b))) continue;
      const dans = plages.filter(p => p.a == null || (z >= p.a && n <= p.b)).map(p => p.bloc);
      if (!dans.length) continue;
      atomes.push({ d: e.air_date, t: b0.tmdb, s, e: n, ez: z, rt: e.runtime || moy, blocs: dans });
    }
  }
  atomes.sort((p, q) => p.d < q.d ? -1 : p.d > q.d ? 1 : p.s - q.s || p.e - q.e);
  if (!atomes.length) return null;
  if (orphelins.length) atomes[atomes.length - 1].blocs.push(...orphelins);
  return atomes;
}

/* Une série : un atome par épisode. Un comic au numéro : un atome par numéro,
   relevé dans `sorties/numeros.mjs`. Tout le reste : un seul atome, daté comme
   `ordre-sortie.mjs` le date. */
async function atomesDe(x, carte, BYID, U, cle) {
  const id = x.ref || x.id;
  const num = NUMEROS[id];
  if (num) return num.map((n, i) => ({ carte, d: n.d, num: n, i }));
  /* Un feuilleton : une carte, sa période. */
  const per = (U.periodes || {})[id];
  if (per) return [{ carte, d: per[0], fin: per[1], seul: true }];
  const eps = await episodesDeCarte(x, BYID, U, cle);
  const src = BYID[x.ref || (x.covers || [])[0]] || {};
  /* Une websérie reste une carte : seize épisodes d'une minute intercalés dans
     une saison feraient trente-deux cartes pour seize minutes. Elle dit sa
     période, du premier au dernier épisode. */
  if (eps && src.type === 'web') return [{ carte, d: eps[0].d, fin: eps[eps.length - 1].d, seul: true }];
  if (eps) return eps.map(a => ({ ...a, carte }));
  let d = U.dates[id];
  if (!d && src.media === 'movie' && src.tmdb && src.tmdb !== '0') d = await dateFilm(src.tmdb, cle);
  if (!d && src.media === 'tv' && src.tmdb && src.tmdb !== '0') {
    const t = await api('/tv/' + src.tmdb, cle);
    d = t && t.first_air_date;
  }
  if (!d && x.rel) d = String(x.rel);
  if (!d) throw new Error('sans date : ' + id);
  return [{ carte, d, seul: true }];
}

const relDe = (a, z) => a === z ? a : a + '/' + z;

/* La date du monde d'un morceau qui tient plusieurs blocs : du premier au
   dernier nombre quand elles sont simples, sinon les deux bouts tels quels. */
function dateMonde(blocs) {
  const ds = [...new Set(blocs.map(b => String(b.date ?? '')))].filter(Boolean);
  if (ds.length <= 1) return null;
  if (ds.every(d => /^~?\d+(?:-\d+)?$/.test(d))) {
    const nums = ds.flatMap(d => d.match(/\d+/g).map(Number));
    const tilde = ds.some(d => d.startsWith('~')) ? '~' : '';
    const lo = Math.min(...nums), hi = Math.max(...nums);
    return tilde + (lo === hi ? lo : lo + '-' + hi);
  }
  const propres = ds.filter(d => d !== '???');
  return propres.length === 1 ? propres[0] : propres[0] + ' – ' + propres[propres.length - 1];
}

/* Deux atomes qui se suivent restent sur la même carte s'ils sont de la même
   saison, ou de la même série de numéros. */
function memeSuite(p, q) {
  if (p.carte !== q.carte) return false;
  if (p.num || q.num) return !!(p.num && q.num && p.i + 1 === q.i && p.num.v === q.num.v);
  if (p.seul || q.seul) return false;
  return p.t === q.t && p.s === q.s;
}

function morceauEpisodes(x, m, tous, BYID, M, U, RT) {
  const s = m[0].s, a = m[0].e, b = m[m.length - 1].ez;
  const saisonsCarte = new Set(tous.map(t => t.s));
  const base = x.id || (x.ref + '-rl');
  const entiere = m.length === tous.filter(t => t.s === s).length;
  const id = base +
    (saisonsCarte.size > 1 && !new RegExp('-s' + s + '$').test(base) ? '-s' + s : '') +
    (entiere ? '' : '-e' + a + (a === b ? '' : '-' + b));
  const covers = [...new Set(m.flatMap(t => t.blocs))];
  const libelle = entiere ? M.saison + ' ' + s
    : M.saison + ' ' + s + ' ' + (a === b ? M.ep1 + ' ' + a : M.epN + ' ' + a + '-' + b);
  const out = { id, covers, subitems: [libelle] };
  const blocs = covers.map(i => BYID[i]);
  const d = dateMonde(blocs);
  if (d) out.date = d;
  else if (x.date && !x.ref && covers.length === (x.covers || []).length) out.date = x.date;
  /* La durée : TMDB, épisode par épisode. Sans lui, la part du bloc. */
  if (U.temps !== false) {
    let rt = Math.round(m.reduce((n, t) => n + (t.rt || 0), 0));
    if (!rt && RT) {
      const tot = blocs.reduce((n, q) => n + (RT[q.id] || 0), 0);
      rt = Math.round(tot * m.length / tous.length);
    }
    if (rt) out.rt = rt;
  }
  const drop = new Set(x.drop || []);
  /* Le repère de placement du premier bloc couvert : flashback en découverte,
     il n'a plus lieu d'être ici — la carte entière l'avait retiré pour son
     propre premier bloc, qui n'est pas forcément celui du morceau. */
  const tags = BYID[covers[0]].tags || [];
  const PLACE = ['flashback', 'flashforward'];
  if (tags.some(t => PLACE.includes(t))) {
    if (tags.every(t => PLACE.includes(t))) drop.add('tags');
    else out.tags = tags.filter(t => !PLACE.includes(t));
  }
  if (drop.size) out.drop = [...drop];
  out.rel = relDe(m[0].d, m[m.length - 1].d);
  return out;
}

/* Un numéro ne se dit qu'avec son chiffre : « #5 », « #5-8 ». Rien à traduire,
   et c'est ce que porte la couverture dans les deux langues. */
function morceauNumeros(x, m, BYID) {
  const a = m[0].num.n, z = m[m.length - 1].num.n;
  const id = (x.id || (x.ref + '-rl')) + '-n' + a + (a === z ? '' : '-' + z);
  const tous = x.ref ? [x.ref] : x.covers;
  const covers = [...new Set(m.map(t => t.num.c || tous).flat())];
  /* Le numéro à l'intérieur de son volume : « Die With Honor #1-3 ». */
  const nu = m[0].num, nz = m[m.length - 1].num;
  const pa = nu.v ? nu.k : a, pz = nu.v ? nz.k : z;
  const out = { id, covers, subitems: [(nu.v ? nu.v + ' ' : '') + (pa === pz ? '#' + pa : '#' + pa + '-' + pz)] };
  const d = dateMonde(covers.map(i => BYID[i]));
  if (d) out.date = d;
  if (x.drop) out.drop = x.drop;
  out.rel = relDe(m[0].d, m[m.length - 1].d);
  return out;
}

/* Seul le tableau `erasRelease` change, dans l'écriture du fichier : serrée
   chez Node, à espaces chez Python, accents gardés ou échappés. */
function ecrire(v, espace, ascii) {
  const ch = t => {
    const j = JSON.stringify(t);
    return ascii ? j.replace(/[^\x00-\x7e]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) : j;
  };
  const sep = espace ? ', ' : ',', dp = espace ? ': ' : ':';
  if (Array.isArray(v)) return '[' + v.map(x => ecrire(x, espace, ascii)).join(sep) + ']';
  if (v && typeof v === 'object') return '{' + Object.entries(v).map(([k, x]) => ch(k) + dp + ecrire(x, espace, ascii)).join(sep) + '}';
  return typeof v === 'string' ? ch(v) : JSON.stringify(v);
}
/* Star Wars et Marvel écrivent leurs données à la main, clés sans guillemets
   et une entrée par ligne : on garde cette écriture-là. */
function ecrireMain(v) {
  const k = o => Object.entries(o).filter(([c]) => c !== 'entries')
    .map(([c, x]) => (/^[a-zA-Z_]\w*$/.test(c) ? c : JSON.stringify(c)) + ':' + val(x)).join(',');
  const val = x => Array.isArray(x) ? '[' + x.map(val).join(',') + ']'
    : x && typeof x === 'object' ? '{' + k(x) + '}' : JSON.stringify(x);
  return '[\n' + v.map(era => '    {' + k(era) + ',entries:[\n' +
    era.entries.map(e => '      ' + val(e)).join(',\n') + '\n    ]}').join(',\n') + '\n  ]';
}
function poser(src, sortie) {
  const cle = /"?erasRelease"?\s*:\s*\[/.exec(src);
  if (!cle) throw new Error('erasRelease introuvable');
  const deb = cle.index + cle[0].length - 1;
  let i = deb, prof = 0, chaine = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (chaine) { if (c === '\\') i++; else if (c === '"') chaine = false; continue; }
    if (c === '"') chaine = true;
    else if (c === '[' || c === '{') prof++;
    else if (c === ']' || c === '}') { if (--prof === 0) break; }
  }
  const ancien = src.slice(deb, i + 1);
  if (!cle[0].startsWith('"')) return src.slice(0, deb) + ecrireMain(sortie) + src.slice(i + 1);
  const espace = /": /.test(ancien.slice(0, 400));
  const ascii = /\\u[0-9a-f]{4}/.test(ancien);
  return src.slice(0, deb) + ecrire(sortie, espace, ascii) + src.slice(i + 1);
}

async function detaille(nom, U) {
  const ficSpec = path.join(ICI, 'sorties', nom + '.json');
  const ficData = path.join(RACINE, U.fichier);
  const src = fs.readFileSync(ficData, 'utf8');
  const { CG, D, RT } = new Function('window', 'var CGD;' + src +
    ';return {CG:window.CG,D:' + U.global + ',RT:window.RT||(typeof RT!=="undefined"?RT:null)};')({});
  if (!fs.existsSync(ficSpec)) {
    fs.writeFileSync(ficSpec, JSON.stringify(D.erasRelease, null, 1) + '\n');
    console.log('amorcé : ' + path.relative(RACINE, ficSpec));
  }
  const spec = JSON.parse(fs.readFileSync(ficSpec, 'utf8'));
  const M = MOTS[/-en\.js$/.test(U.fichier) ? 'en' : 'fr'];
  const cle = CG.tmdbKey;
  const BYID = {};
  D.eras.forEach(e => e.entries.forEach(x => { BYID[x.id] = x; }));

  /* Toute œuvre de la découverte doit être quelque part. */
  const vus = new Set();
  spec.forEach(e => e.entries.forEach(x => (x.ref ? [x.ref] : x.covers || []).forEach(i => {
    if (!BYID[i]) throw new Error(nom + ' : référence morte ' + i);
    vus.add(i);
  })));
  const manque = Object.keys(BYID).filter(i => !vus.has(i) && !['separator', 'note'].includes(BYID[i].type));
  if (manque.length) throw new Error(nom + ' : absentes de ' + path.basename(ficSpec) + ' : ' + manque.join(', '));

  /* Les flux : les ères d'un même flux fusionnent. Marvel met ses segments à
     part (leurs films sont d'une autre époque), The Witcher ses deux colonnes. */
  const fluxDe = U.flux || (() => 'tout');
  const flux = new Map();
  spec.forEach((era, i) => {
    const k = fluxDe(era, i);
    if (!flux.has(k)) flux.set(k, []);
    flux.get(k).push(i);
  });

  const sortie = spec.map(era => ({ ...era, entries: [] }));
  for (const indices of flux.values()) {
    const cartes = [];
    const premiereDe = new Map();
    for (const i of indices) {
      spec[i].entries.forEach((x, j) => {
        if (j === 0) premiereDe.set(cartes.length, i);
        cartes.push({ x, era: i });
      });
    }
    const atomes = [];
    for (let c = 0; c < cartes.length; c++) {
      cartes[c].atomes = await atomesDe(cartes[c].x, c, BYID, U, cle);
      cartes[c].atomes.forEach(a => atomes.push({ ...a, rang: atomes.length }));
    }
    atomes.sort((p, q) => {
      if (p.d !== q.d) return p.d < q.d ? -1 : 1;
      return p.carte - q.carte || p.rang - q.rang;
    });

    const morceaux = [];
    for (const a of atomes) {
      const dern = morceaux[morceaux.length - 1];
      if (dern && memeSuite(dern[dern.length - 1], a)) dern.push(a);
      else morceaux.push([a]);
    }

    /* Les ères se recoupent à la place de leur première œuvre : tout ce qui
       sort après elle est de son ère, même la fin d'une saison commencée
       avant. */
    const posDeb = new Map();
    for (const [c, i] of premiereDe) posDeb.set(morceaux.findIndex(m => m[0].carte === c), i);
    const nbParCarte = new Map();
    morceaux.forEach(m => nbParCarte.set(m[0].carte, (nbParCarte.get(m[0].carte) || 0) + 1));

    let eraCourante = indices[0];
    morceaux.forEach((m, pos) => {
      if (posDeb.has(pos)) eraCourante = posDeb.get(pos);
      const c = cartes[m[0].carte];
      const debut = m[0].d, fin = m[m.length - 1].fin || m[m.length - 1].d;
      /* Une carte qui ne se coupe pas reste ce qu'elle était. */
      if (nbParCarte.get(m[0].carte) === 1 && m.length === c.atomes.length) {
        sortie[eraCourante].entries.push({ ...c.x, rel: relDe(debut, fin) });
      } else {
        sortie[eraCourante].entries.push(m[0].num ? morceauNumeros(c.x, m, BYID)
          : morceauEpisodes(c.x, m, c.atomes, BYID, M, U, RT));
      }
    });
  }

  const ident = new Set();
  sortie.forEach(e => e.entries.forEach(x => {
    const i = x.ref || x.id;
    if (ident.has(i)) throw new Error(nom + ' : identifiant en double ' + i);
    ident.add(i);
  }));

  /* Aucun bloc ne doit tomber entre deux morceaux : il ne se cocherait plus. */
  const couverts = new Set();
  sortie.forEach(e => e.entries.forEach(x => (x.ref ? [x.ref] : x.covers || []).forEach(i => couverts.add(i))));
  const perdus = [...vus].filter(i => !couverts.has(i));
  if (perdus.length) throw new Error(nom + ' : blocs sans morceau : ' + perdus.join(', '));

  const avant = spec.reduce((n, e) => n + e.entries.length, 0);
  const apres = sortie.reduce((n, e) => n + e.entries.length, 0);
  console.log(nom + ' : ' + avant + ' → ' + apres + ' cartes · ' +
    sortie.map(e => e.entries.length).join(' / '));
  if (!CHECK) fs.writeFileSync(ficData, poser(src, sortie));
}

const demandes = process.argv.slice(2).filter(a => UNIVERS[a]);
if (!demandes.length) { console.error('Quel univers ? ' + Object.keys(UNIVERS).join(', ')); process.exit(2); }
process.chdir(RACINE);
fs.mkdirSync(path.join(ICI, 'sorties'), { recursive: true });
for (const n of demandes) await detaille(n, UNIVERS[n]);
