// Les badges VO devenus faux.
//
//   node _proto/verifier-vf.mjs                  toutes les timelines et le Dossier
//   node _proto/verifier-vf.mjs witcher avatar   quelques univers (clé ou route)
//   node _proto/verifier-vf.mjs --rafraichir     sans le cache
//
// Le badge VO dit qu'une œuvre n'existe pas en français. C'est vrai le jour où
// on le pose, et ça cesse de l'être le jour où un éditeur français la sort —
// sans que rien dans le dépôt ne le sache. Ce script relit toutes les œuvres
// **écrites** qui portent le badge (comics, romans, jeunesse, audio) et demande
// au catalogue de la BnF s'il en connaît une édition française.
//
// Il **signale**, il ne corrige rien : le rapport donne la notice trouvée, son
// niveau de confiance et le fichier où retirer le badge, et c'est Niko qui
// tranche. Ce qui se regarde n'y entre pas — la règle y est « jamais doublé
// vaut VO, même sous-titré », et la BnF n'en dit rien.
//
// Deux sources, chacune pour ce qu'elle sait :
//
// - **La BnF** (`catalogue.bnf.fr/api/SRU`, notices UNIMARC), qui répond à un
//   script là où Google Books coupe au quota. Une notice n'est retenue que si
//   sa langue (zone 101) est le français : une édition anglaise importée et
//   cataloguée en France porte `eng`, et c'est le faux positif à écarter.
// - **Open Library**, pour l'auteur. Un titre français ne ressemble souvent pas
//   à l'original, et nos données ne portent aucun auteur : on le demande à Open
//   Library par le titre original, puis on cherche ses traductions à la BnF.
//
// Le cache (`_proto/.cache-vf.json`, non versionné) garde chaque réponse trente
// jours : un second passage ne réinterroge rien, un passage le mois suivant
// voit les nouveautés. Une panne de réseau n'arrête rien — l'œuvre sort
// « non vérifiée » et le passage va au bout. Le script rend alors 3, ce qui
// ne dit qu'une chose à `publier.mjs` : retenter à la prochaine publication.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { charge, SOURCES, decode } from './jsonld.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
const CACHE = join(ICI, '.cache-vf.json');
const RAPPORT = join(ICI, 'rapport-vf.md');
const TTL = 30 * 864e5;
// Le cache garde la réponse déjà réduite, pas le XML : changer `notices()`
// ou la lecture d'Open Library demande de monter son numéro, sans quoi on
// relirait l'ancienne réduction.
const FORME = { 'catalogue.bnf.fr': 2, 'openlibrary.org': 3 };
const ARGS = process.argv.slice(2);
const RAFRAICHIR = ARGS.includes('--rafraichir');
// `--temoin` rejoue la recherche sur deux œuvres dont on sait qu'elles ont une
// édition française — Blade Runner 2019 et 2029, chez Delcourt, relevées à la
// BnF le 12 octobre 2026 — et sort en erreur si l'une n'est pas trouvée en
// confiance haute. C'est la preuve que le contrôle voit ce qu'il doit voir.
const TEMOIN = ARGS.includes('--temoin');

/* ── Ce qu'on lit ───────────────────────────────────────────────────────── */

// Liste noire, comme partout dans ce dépôt : un type d'écrit qu'on n'aurait pas
// prévu entre au contrôle plutôt que d'en sortir sans un mot.
const ECRAN = new Set(['film', 'filmanime', 'animated', 'anime', 'serie', 'series', 'animserie',
  'short', 'web', 'video', 'jeu', 'game', 'dlc', 'special', 'tv', 'movie', 'separator', 'note']);

// Ce qui désigne la franchise dans une notice. À défaut, le nom de l'univers
// lu dans ses données : un univers neuf entre au contrôle sans qu'on touche ici.
const FRANCHISE = {
  avatar: ['avatar'],
  twd: ['walking dead'],
  dragonage: ['dragon age'],
  assassinscreed: ['assassin creed'],
  jurassic: ['jurassic'],
  witcher: ['witcher', 'sorceleur'],
  bladerunner: ['blade runner'],
  dossier: ['star wars'],
};

// Les routes ne portent pas toujours la clé des données.
const ALIAS = { walkingdead: 'twd', jurassicworld: 'jurassic', 're': 'residentevil',
  'star-wars': 'dossier', 'dossier-sw': 'dossier', starwars: 'sw', marvel: 'mcu' };

// Le fichier où le badge se retire : la source, jamais une sortie.
function ouCorriger(cle) {
  if (cle === 'dossier') return '_proto/data-dossier-sw.js';
  if (cle === 'bladerunner') return '_proto/construire-bladerunner.mjs';
  const inverse = existsSync(join(ICI, `traduire-${cle}.mjs`));
  return '_proto/' + SOURCES[cle][inverse ? 'en' : 'fr'][0];
}

/* ── Texte ──────────────────────────────────────────────────────────────── */

const VIDES = new Set(['the', 'of', 'a', 'an', 'and', 'in', 'on', 'to', 'for', 'from', 'with',
  'at', 'by', 'le', 'la', 'les', 'de', 'des', 'du', 'et', 'l', 'd', 's', 'vol', 'volume', 'tome',
  'special', 'edition']);
const net = s => decode(String(s ?? '')).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[’'`]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const mots = s => net(s).split(' ').filter(m => m && !VIDES.has(m));
const contient = (texte, ms) => { const t = ' ' + net(texte) + ' '; return ms.every(m => t.includes(' ' + m + ' ')); };
// Un titre sans sa franchise, sans ses numéros ni ses parenthèses : « Dragon
// Age : Le Trône Volé » et la notice « Le trône volé » doivent se reconnaître.
function cle(titre, franchise) {
  let t = ' ' + mots(decode(titre).replace(/\([^)]*\)/g, ' ').replace(/\b\d+\s*-\s*\d+\s*$/, '')).join(' ') + ' ';
  for (const f of franchise) t = t.split(' ' + mots(f).join(' ') + ' ').join(' ');
  return t.replace(/\s+/g, ' ').trim();
}
// Chaque mot de l'œuvre, au besoin à une lettre près : la BnF a catalogué
// Brotherhood de Mike Chen sous « Star wars : brotherwood ».
function approche(texte, ms) {
  const t = net(texte).split(' ');
  return ms.length > 0 && ms.every(m => t.some(x => x === m
    || (m.length > 5 && Math.abs(x.length - m.length) < 2 && lev(x, m) < 2)));
}
function lev(a, b) {
  let p = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++) {
    const q = [i];
    for (let j = 1; j <= b.length; j++) q[j] = Math.min(p[j] + 1, q[j - 1] + 1, p[j - 1] + (a[i - 1] !== b[j - 1]));
    p = q;
  }
  return p[b.length];
}
const suite = (texte, ms) => (' ' + net(texte) + ' ').includes(' ' + ms.join(' ') + ' ');

// « Star Wars Adventures (2020) 6: Tales of Villainy - The Gaze Electric » :
// le dernier segment qui dit quelque chose est l'œuvre, le reste est la série.
// Les numéros, les parenthèses et la franchise seule ne disent rien.
function segments(titre, franchise) {
  const f = franchise.map(x => mots(x).join(' '));
  return decode(titre).replace(/\([^)]*\)/g, ' ')
    .split(/\s*:\s+|\s+[-–—]\s+/)
    .map(s => s.replace(/\b(\d+\s*-\s*\d+|vol\.?\s*\d+)\s*$/i, '').replace(/^(fcbd|free comic book day)\s*\d{4}\s*/i, '').trim())
    .filter(s => {
      // « Blade Runner 2019 » : une année fait l'œuvre, un numéro non.
      const n = mots(s).filter(m => !/^\d+$/.test(m) || /^(19|20)\d\d$/.test(m)).join(' ');
      return n && !f.includes(n);
    });
}

/* ── Réseau, avec cache ─────────────────────────────────────────────────── */

let cache = {};
try { cache = JSON.parse(readFileSync(CACHE, 'utf8')); } catch {}
const maintenant = Date.now();
const derniers = {};
let pannes = 0;
const PAUSE = { 'catalogue.bnf.fr': 1000, 'openlibrary.org': 350 };
const dort = ms => new Promise(r => setTimeout(r, ms));

async function lit(url, traite) {
  const c = cache[url];
  const hote = new URL(url).host;
  if (c && c.f === FORME[hote] && !RAFRAICHIR && maintenant - c.t < TTL) return c.v;
  if (pannes >= 4) return null;
  for (let essai = 0; essai < 2; essai++) {
    const attente = (derniers[hote] || 0) + PAUSE[hote] - Date.now();
    if (attente > 0) await dort(attente);
    derniers[hote] = Date.now();
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(25000),
        headers: { 'user-agent': 'chronologeek.app verifier-vf (arcanerval)' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const v = traite(await r.text());
      cache[url] = { t: Date.now(), f: FORME[hote], v };
      pannes = 0;
      return v;
    } catch (e) {
      if (essai === 1) { pannes++; console.log(`    ! ${hote} : ${e.message}`); }
    }
  }
  return null;
}

/* ── La BnF ─────────────────────────────────────────────────────────────── */

// Une notice UNIMARC réduite à ce qui sert : on ne garde pas le XML dans le cache.
function notices(xml) {
  return xml.split('<srw:record>').slice(1).map(r => {
    const z = {};
    for (const m of r.matchAll(/<mxc:datafield tag="(\d+)"[^>]*>([\s\S]*?)<\/mxc:datafield>/g)) {
      const sous = [...m[2].matchAll(/code="(.)">([^<]*)</g)].map(([, c, v]) => [c, decode(v)]);
      (z[m[1]] ||= []).push(sous);
    }
    const s = (tag, codes) => (z[tag] || []).map(f => f.filter(([c]) => codes.includes(c)).map(([, v]) => v).join(' ')).filter(Boolean);
    const ark = (r.match(/<srw:recordIdentifier>([^<]*)/) || [])[1] || '';
    return {
      ark: ark ? 'https://catalogue.bnf.fr/' + ark : '',
      doc: ((r.match(/<mxc:leader>([^<]*)/) || [])[1] || '').charAt(6),
      langue: s('101', 'a'), depuis: s('101', 'c'),
      titre: s('200', 'aehi').join(' ; '),
      titreA: s('200', 'a')[0] || '',
      series: [...s('225', 'a'), ...s('461', 't')],
      serie: [...s('225', 'av'), ...s('461', 'tv')].join(' ; '),
      editeur: [...s('210', 'c'), ...s('214', 'c')].join(', '),
      date: ([...s('210', 'd'), ...s('214', 'd')].join(' ').match(/\d{4}/) || [])[0] || (s('100', 'a')[0] || '').slice(9, 13),
      original: [...s('454', 'tae'), ...s('500', 'a'), ...s('300', 'a')].join(' ; '),
      contenu: [...s('327', 'a'), ...s('464', 't')].join(' ; '),
      resume: s('330', 'a').join(' '),
      isbn: s('010', 'a').join(', '),
    };
  });
}

const sru = q => 'https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve'
  + '&recordSchema=unimarcxchange&maximumRecords=12&query=' + encodeURIComponent(q);
const cql = s => net(s).replace(/"/g, '');
const deFranchise = f => '(' + f.map(x => `bib.anywhere all "${cql(x)}"`).join(' or ') + ')';

/* ── Open Library : l'auteur ────────────────────────────────────────────── */

async function auteurs(e, oeuvre, franchise) {
  const url = e.ol?.q
    ? `https://openlibrary.org/search.json?q=${encodeURIComponent(e.ol.q)}&fields=title,author_name,language,first_publish_year&limit=5`
    : `https://openlibrary.org/search.json?title=${encodeURIComponent(net(oeuvre))}&q=${encodeURIComponent(franchise[0])}&fields=title,author_name,language,first_publish_year&limit=5`;
  const docs = await lit(url, t => (JSON.parse(t).docs || []).map(d => ({ t: d.title, a: d.author_name || [], l: d.language || [], an: d.first_publish_year || 0 })));
  if (!docs) return null;
  const ms = mots(oeuvre);
  // Le premier document dont le titre porte l'œuvre — pas le premier tout
  // court, qui peut être un recueil de cinq romans ou la Bible.
  const d = docs.find(d => contient(d.t, ms) && !/collection|box set|omnibus/i.test(d.t));
  // L'année est la plus ancienne des éditions qui portent l'œuvre : Open
  // Library date « Blade Runner 2029 » de 2025, l'intégrale, et le tome 1
  // de 2021 — sur la première, l'édition Delcourt de 2022 serait écartée.
  const an = Math.min(...docs.filter(x => contient(x.t, ms) && x.an).map(x => x.an), 9999);
  // Le premier auteur seulement : le second est souvent le dessinateur de la
  // couverture, et Phil Noto ramenait tous les Poe Dameron de Panini.
  return d ? { auteurs: d.a.slice(0, 1), fre: d.l.includes('fre'), titre: d.t, an: an < 9999 ? an : 0 }
    : { auteurs: [], fre: false, an: 0 };
}

/* ── Une œuvre ──────────────────────────────────────────────────────────── */

const RANG = { haute: 3, moyenne: 2, basse: 1 };

async function verifie(e, franchise, connus) {
  const segs = segments(e.titreEn, franchise);
  const oeuvre = segs[segs.length - 1] || decode(e.titreEn);
  // Un comic qui s'appelle « The Witcher » tout court ne se reconnaît pas à
  // son titre : toutes les notices de la franchise le portent. Il ne reste
  // alors que l'auteur.
  const ms = segs.length ? mots(oeuvre) : [];
  const plein = segs.length ? mots(e.titreEn).filter(m => !/^\d+$/.test(m) || /^(19|20)\d\d$/.test(m)) : [];
  const fr = deFranchise(franchise);
  const requetes = [
    `bib.anywhere all "${cql(oeuvre)}" and ${fr} and bib.language any "fre"`,
  ];
  if (segs.length > 1) requetes.push(`bib.anywhere all "${cql(segs.join(' '))}" and bib.language any "fre"`);
  if (e.isbn) requetes.push(`bib.isbn any "${e.isbn.replace(/\D/g, '')}"`);
  const ol = await auteurs(e, oeuvre, franchise);
  for (const a of ol?.auteurs || []) {
    // Le nom entier, prénom compris : « Wein » seul ramenait Len Wein,
    // scénariste des Star Wars de Marvel, à la place d'Elizabeth.
    if (mots(a).length) requetes.push(`bib.author all "${cql(a)}" and ${fr} and bib.language any "fre"`);
  }

  const vus = new Map();
  let reseau = true, imports = 0;
  for (const q of requetes) {
    const ns = await lit(sru(q), notices);
    if (!ns) { reseau = false; continue; }
    const parAuteur = q.startsWith('bib.author');
    for (const n of ns) {
      if (!n.langue.includes('fre')) { if (n.langue.length) imports++; continue; }
      // Une bande originale ou un jeu vidéo traduit ne sont pas l'œuvre.
      const sonore = e.k === 'audio' && n.doc === 'i';
      if (n.doc && n.doc !== 'a' && !sonore) continue;
      const k = cle(n.titreA, franchise);
      const connu = connus.has(k) || n.series.some(x => connus.has(cle(x, franchise)));
      const tout = [n.titre, n.serie, n.original, n.contenu, n.resume].join(' ; ');
      const enTete = n.titre + ' ; ' + n.serie + ' ; ' + n.original;
      // Le titre original, quand la notice le déclare, dit aussi ce qu'elle
      // n'est pas : « The legend of Korra » n'est pas The Rise of Kyoshi, même
      // signé du même auteur.
      const declare = net(n.original).replace(/\b(trad|traduit|traduction|de|du|l|anglais|americain|etats|unis|par|texte|imprime)\b/g, ' ').trim();
      const autre = declare && ms.length && !approche(declare, ms);
      const court = ms.length < 2 && !plein.some(m => /^(19|20)\d\d$/.test(m));
      let niveau = null, pourquoi = '';
      if (ms.length > 1 && suite(n.contenu, ms)) {
        niveau = 'haute'; pourquoi = 'au sommaire du volume';
      } else if (ms.length && suite(n.resume, ms)) {
        // Un résumé cite les personnages de son volume : « Jyn Erso » est dans
        // celui de l'adaptation de Rogue One, qui n'est pas le one-shot. Il ne
        // compte vraiment que s'il annonce l'œuvre en complément — « Et en
        // plus : plongez dans le passé de Kelnacca ».
        const r = ' ' + net(n.resume) + ' ', i = r.indexOf(' ' + ms.join(' ') + ' ');
        if (/\b(en plus|egalement|suivi de|contient|comprend|inclut|bonus|inedit)\b/.test(r.slice(Math.max(0, i - 200), i))) {
          niveau = 'moyenne'; pourquoi = 'annoncé en complément par le résumé de l\'éditeur';
        }
      }
      // Ce qui précède vaut même dans un volume d'une série que le guide
      // connaît : Kelnacca est au bout d'un tome de la Haute République.
      // Le reste non — une notice au titre déjà au guide est une autre
      // œuvre de la même série, et une traduction parue avant l'original
      // n'en est pas une.
      if (!niveau) {
        if (connu || (ol?.an && +n.date && +n.date < ol.an)) continue;
        // Un titre d'un seul mot — « Legacy », « Brotherhood » — n'est
        // reconnu dans le titre original que s'il en est tout le titre,
        // franchise ôtée : « Star wars legacy, saison II » est une autre œuvre.
        const exact = !court || cle(declare, franchise).split(' ').filter(Boolean).length === ms.length;
        if (ms.length && exact && (contient(n.original, plein) || suite(n.original, ms))) {
          niveau = court ? 'moyenne' : 'haute'; pourquoi = 'le titre original est dans la notice';
        } else if (ms.length && exact && approche(declare, ms) && ms.some(m => m.length > 5)) {
          niveau = court ? 'moyenne' : 'haute'; pourquoi = `titre original à une lettre près (« ${n.original} »)`;
        } else if (autre) {
          continue;
        } else if (plein.length && contient(n.titre + ' ; ' + n.serie, plein)) {
          niveau = court ? 'moyenne' : 'haute'; pourquoi = 'même titre';
        } else if (ms.length && contient(n.titre + ' ; ' + n.serie, ms) && franchise.some(f => contient(tout, mots(f)))) {
          niveau = court ? 'basse' : 'moyenne'; pourquoi = 'titre de l\'œuvre et franchise dans la notice';
        } else if (parAuteur && n.depuis.length && franchise.some(f => contient(enTete, mots(f)))) {
          niveau = 'basse'; pourquoi = `traduction du même auteur (${ol.auteurs.join(', ')}), titre à confirmer`;
        }
      }
      // « Dragon age » tout court, trouvé par l'auteur : un recueil ou la notice
      // de la collection, qui ne désigne aucune œuvre.
      if (!niveau || (niveau === 'basse' && !k)) continue;
      const deja = vus.get(n.ark);
      if (!deja || RANG[niveau] > RANG[deja.niveau]) vus.set(n.ark, { ...n, niveau, pourquoi });
    }
  }
  // Trois notices au plus, les meilleures : une série traduite en douze tomes
  // ou un auteur traduit par dizaines n'apprennent rien de plus à la
  // treizième ligne.
  const trouves = [...vus.values()].sort((a, b) => RANG[b.niveau] - RANG[a.niveau]
    || String(a.date).localeCompare(String(b.date))).slice(0, 3);
  return { ...e, oeuvre, ol, reseau, imports, trouves };
}

/* ── Les univers ────────────────────────────────────────────────────────── */

function univers() {
  const liste = [];
  const parId = eras => new Map(eras.flatMap(er => er.entries || er.items || []).map(x => [x.id, x]));
  for (const [u, src] of Object.entries(SOURCES)) {
    const [f, g] = src.fr, [fe, ge] = src.en;
    const D = charge(RACINE, f, g)[g], E = charge(RACINE, fe, ge)[ge];
    const en = parId(E.eras || []);
    const toutes = (D.eras || []).flatMap(er => er.entries || []);
    const vo = toutes.filter(x => x.lang === 'vo' && !ECRAN.has(net(x.type).replace(/ /g, '')));
    const franchise = FRANCHISE[u] || [decode(D.title || u)];
    const connus = new Set(toutes.filter(x => x.lang !== 'vo').map(x => cle(x.title, franchise)));
    liste.push({ cle: u, nom: decode(D.title || u), connus, franchise,
      oeuvres: vo.map(x => ({ id: x.id, k: net(x.type), titre: decode(x.title),
        titreEn: decode(en.get(x.id)?.title || x.title), isbn: x.isbn || en.get(x.id)?.isbn, ol: x.ol || en.get(x.id)?.ol })) });
  }
  const D = charge(RACINE, 'data-dossier-sw.js', 'CGD').CGD, E = charge(RACINE, 'data-dossier-sw-en.js', 'CGD').CGD;
  const en = parId(E.eras);
  const items = D.eras.flatMap(er => er.items || []).filter(x => x.kind === 'it');
  liste.push({ cle: 'dossier', nom: 'Dossier Star Wars', franchise: FRANCHISE.dossier,
    connus: new Set(items.filter(x => !x.vo).map(x => cle(x.title, FRANCHISE.dossier))),
    oeuvres: items.filter(x => x.vo).map(x => ({ id: x.id, k: x.k, titre: decode(x.title),
      titreEn: decode(en.get(x.id)?.title || x.title), isbn: x.isbn })) });
  return liste;
}

/* ── Le rapport ─────────────────────────────────────────────────────────── */

async function temoin() {
  const br = univers().find(u => u.cle === 'bladerunner');
  const E = charge(RACINE, 'data-bladerunner-en.js', 'BLADERUNNER').BLADERUNNER;
  const parId = new Map(E.eras.flatMap(er => er.entries).map(x => [x.id, x]));
  let ok = true;
  for (const id of ['br-2019', 'br-2029']) {
    const x = parId.get(id);
    // Sans `connus` : l'édition Delcourt est justement celle que le guide connaît.
    const r = await verifie({ id, k: 'comic', titre: x.title, titreEn: x.title }, br.franchise, new Set());
    const n = r.trouves[0];
    const bon = n && n.niveau === 'haute' && /delcourt/i.test(n.editeur);
    ok &&= bon;
    console.log(`  ${bon ? 'ok ' : 'RATÉ'} ${x.title} → ${n ? `${n.titre} (${n.editeur}, ${n.date}) — ${n.niveau}` : 'rien'}`);
  }
  try { writeFileSync(CACHE, JSON.stringify(cache)); } catch {}
  if (!ok) process.exitCode = 1;
}

async function main() {
  if (TEMOIN) return temoin();
  const demandes = ARGS.filter(a => !a.startsWith('--')).map(a => ALIAS[a] || a);
  let liste = univers();
  if (demandes.length) {
    const inconnus = demandes.filter(d => !liste.some(u => u.cle === d));
    if (inconnus.length) console.log(`  Univers inconnu(s) : ${inconnus.join(', ')} — clés : ${liste.map(u => u.cle).join(', ')}`);
    liste = liste.filter(u => demandes.includes(u.cle));
  }
  const total = liste.reduce((n, u) => n + u.oeuvres.length, 0);
  console.log(`  Badges VO : ${total} œuvre(s) écrite(s) sur ${liste.filter(u => u.oeuvres.length).length} univers, à la BnF.`);

  const md = [`# Badges VO à revoir`, '', `Passage du ${new Date().toISOString().slice(0, 10)} — `
    + `\`node _proto/verifier-vf.mjs\`. Rien n'est corrigé : retirer le badge dans le fichier indiqué, `
    + `puis relancer la chaîne de l'univers.`, ''];
  const bilan = { haute: 0, moyenne: 0, basse: 0, rien: 0, reseau: 0 };
  let fait = 0;
  for (const u of liste) {
    if (!u.oeuvres.length) continue;
    const lignes = [];
    for (const e of u.oeuvres) {
      const r = await verifie(e, u.franchise, u.connus);
      fait++;
      if (fait % 10 === 0) console.log(`    … ${fait} / ${total}`);
      if (!r.reseau && !r.trouves.length) { bilan.reseau++; lignes.push(`- **${r.titre}** — non vérifiée (réseau)`); continue; }
      if (!r.trouves.length) { bilan.rien++; continue; }
      const meilleur = r.trouves[0].niveau;
      bilan[meilleur]++;
      lignes.push(`- **${r.titre}** (\`${r.id}\`) — confiance **${meilleur}**`
        + (r.ol?.auteurs?.length ? ` · auteur ${r.ol.auteurs.join(', ')}` : ''));
      for (const n of r.trouves) {
        lignes.push(`  - ${n.niveau} : *${n.titre}* — ${n.editeur || 'éditeur ?'}, ${n.date || 'date ?'}`
          + `${n.serie ? ` · série ${n.serie}` : ''} · ${n.pourquoi} · ${n.ark}`);
      }
      console.log(`  [${meilleur}] ${u.nom} · ${r.titre} → ${r.trouves[0].titre} (${r.trouves[0].editeur}, ${r.trouves[0].date})`);
    }
    if (lignes.length) md.push(`## ${u.nom} — \`${ouCorriger(u.cle)}\``, '', ...lignes, '');
  }
  try { writeFileSync(CACHE, JSON.stringify(cache)); } catch {}
  const aRevoir = bilan.haute + bilan.moyenne + bilan.basse;
  md.push('---', '', `${total} œuvres · ${bilan.haute} haute · ${bilan.moyenne} moyenne · ${bilan.basse} basse · `
    + `${bilan.rien} sans édition française trouvée · ${bilan.reseau} non vérifiée(s).`, '');
  writeFileSync(RAPPORT, md.join('\n'));
  console.log(`\n  ${aRevoir} badge(s) VO à revoir (${bilan.haute} haute, ${bilan.moyenne} moyenne, ${bilan.basse} basse)`
    + `, ${bilan.rien} sans édition française${bilan.reseau ? `, ${bilan.reseau} non vérifiée(s) faute de réseau` : ''}.`);
  console.log(`  Rapport : _proto/rapport-vf.md`);
  if (bilan.reseau) process.exitCode = 3;
}

main().catch(e => { console.log(`  verifier-vf : ${e.message} — rien n'est bloqué.`); process.exitCode = 3; }).finally(() => process.exit(process.exitCode || 0));
