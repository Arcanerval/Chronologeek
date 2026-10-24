/* Video narree d'une grosse sortie : ou elle se place dans sa timeline.
   node _proto/sortie.mjs <id d'entree> [--lang en|fr] [--voix …] [--debit +8%]

   Verticale 1080x1920, voix Ava (voix.mjs), plan de metro, coupe nette entre
   les plans — les deux regles de Niko pour la promo. 30 s au moins, 60 au plus.

   Ce qui vient des donnees : les stations dans l'ordre du monde (le second
   parcours quand la page en a un, sinon `eras`), leurs dates, leurs encres,
   leurs images, les essentiels qui precedent la sortie, le nombre d'arrets.
   Ce qui vient de TMDB : l'affiche, la date de sortie, le diffuseur, le
   nombre d'episodes. Ce qui s'ecrit a la main : les phrases, dans SORTIES —
   une sortie, un texte, parce que ce qu'il faut savoir avant n'est jamais
   le meme. Une phrase ne doit rien affirmer que les donnees ou TMDB ne
   portent pas.

   Les plans : hook (affiche), ligne (toutes les stations), station (une ere),
   saut (l'ecart entre deux eres), fiche (la sortie), avant (les essentiels
   qui la precedent), fin. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { VOIX, DEBIT, parle, duree } from './voix.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

const UNIVERS = {
  avatar: { code: 'AV', page: 'e-avatar', data: 'data-avatar', encre: '#7dd3fc' },
  mcu: { code: 'MCU', page: 'e-marvel', data: 'data-mcu', encre: '#e23636' },
  dc: { code: 'DC', page: 'e-dc', data: 'data-dc', encre: '#f5c842' },
};

/* Une sortie : son univers, ses plans. `ere` designe une station par son
   titre dans les donnees anglaises (le meme rang sert le francais). */
const SORTIES = {
  'avt-seven-havens-s1': {
    univers: 'avatar',
    en: [
      { t: 'hook', lit: 'Where does *Seven Havens* fit?',
        dit: 'Avatar: Seven Havens is out. So where does it fit in the Avatar timeline?' },
      { t: 'ligne', lit: '*9 eras*, nearly 900 years',
        dit: 'The Avatar timeline covers nine eras, and nearly nine hundred years of history.' },
      { t: 'station', ere: 'THE AANG ERA', lit: 'Aang ends *the war*',
        dit: 'In 100 AG, Aang ends the Hundred Year War.' },
      { t: 'station', ere: 'THE KORRA ERA', lit: 'Then, *Korra*',
        dit: "Two generations later, it's Korra's turn." },
      { t: 'saut', de: 'THE KORRA ERA', a: 'THE PAVI & NISHA ERA', lit: 'A jump of *{n} years*',
        dit: 'Then the timeline jumps more than two centuries ahead.' },
      { t: 'fiche', lit: 'The Avatar *after Korra*',
        dit: '399 AG. After a cataclysm, a young Earthbender learns she is the Avatar after Korra, and the world sees her as its destroyer.' },
      { t: 'avant', lit: 'Watch *these first*',
        dit: 'Before you start, the essentials: The Last Airbender, the Aang movie, and The Legend of Korra.' },
      { t: 'fin', dit: 'All {stops} stops, in order, on Chronologeek dot app.' },
    ],
    fr: [
      { t: 'hook', lit: 'Où placer *Les Sept Refuges* ?',
        dit: 'Avatar : Les Sept Refuges est sorti. Alors, où se place la série dans la chronologie d’Avatar ?' },
      { t: 'ligne', lit: '*9 ères*, près de 900 ans',
        dit: 'La chronologie d’Avatar couvre neuf ères, et près de neuf cents ans d’histoire.' },
      { t: 'station', ere: 'THE AANG ERA', lit: 'Aang met fin *à la guerre*',
        dit: 'En 100 AG, Aang met fin à la guerre de Cent Ans.' },
      { t: 'station', ere: 'THE KORRA ERA', lit: 'Puis *Korra*',
        dit: 'Deux générations plus tard, c’est au tour de Korra.' },
      { t: 'saut', de: 'THE KORRA ERA', a: 'THE PAVI & NISHA ERA', lit: 'Un saut de *{n} ans*',
        dit: 'Puis la chronologie fait un bond de plus de deux siècles.' },
      { t: 'fiche', lit: 'L’Avatar *après Korra*',
        dit: '399 AG. Après une catastrophe, une jeune maîtresse de la terre découvre qu’elle est l’Avatar qui succède à Korra, et le monde la voit comme un présage de fin.' },
      { t: 'avant', lit: 'À voir *avant*',
        dit: 'Avant de commencer, les essentiels : Le Dernier Maître de l’Air, le film d’Aang, et La Légende de Korra.' },
      { t: 'fin', dit: 'Les {stops} arrêts, dans l’ordre, sur Chronologeek point app.' },
    ],
  },

  /* Le placement est celui de Niko, le 24 octobre 2026 : le film ne donne
     aucune année, mais sa technologie le dit récent, et il précède
     Creature Commandos, où Clayface apparaît — donc le début des années
     2020. DC est un réseau : la vidéo ne montre que la station du DCU.
     Anglais seulement, tranché par Niko le 24 octobre 2026 : tous les
     réseaux sont en anglais, une vidéo française ne sert à rien. */
  'dcu-clayface': {
    univers: 'dc',
    en: [
      { t: 'hook', lit: 'Where does *Clayface* fit?',
        dit: 'Clayface is out. So where does it fit in the DC timeline?' },
      { t: 'station', ere: 'DCU — New Universe', art: 'images/dcu.webp', de: '2016', a: '2026', lit: 'The new *DCU*',
        dit: 'Clayface belongs to the DCU, the new DC universe, the last station on the line.' },
      { t: 'fiche', lit: '*Early 2020s*, before Creature Commandos',
        dit: 'The movie never gives a year, but its technology points to the early 2020s, and it has to come before Creature Commandos, where Clayface appears. A rising Gotham actor, disfigured by a crime boss, turns to an experimental treatment that changes far more than his face.' },
      { t: 'trilogie', ids: ['dcu-clayface', 'dcu-cc', 'dcu-superman'], lit: 'Before *Creature Commandos*',
        dit: 'In story order: Clayface, then Creature Commandos, then Superman.' },
      { t: 'fin', dit: 'All {ligne} DCU stops, in order, on Chronologeek dot app.' },
    ],
  },

  /* Le placement est la FAQ de Niko. D'abord « entre l'automne et l'hiver
     2028, juste après Brand New Day » ; le 24 octobre 2026 les épisodes l'ont
     datée de mai 2028, l'anniversaire de la bataille de Sokovie, et elle passe
     juste après The Punisher : One Last Kill (début à mi-2028). La trilogie est demandée par Niko le
     15 octobre 2026. */
  'mcu-vq': {
    univers: 'mcu',
    /* refaite le 24 octobre 2026 : la couverture le dit */
    revise: true,
    en: [
      { t: 'hook', lit: 'Where does *VisionQuest* fit?',
        dit: 'VisionQuest is out. So where does it fit in the Marvel timeline?' },
      { t: 'ligne', lit: '*10 stations*, {stops} stops',
        dit: 'The Marvel timeline runs through ten stations, from Phase One to Phase Six.' },
      { t: 'station', ere: 'PHASE VI — The Multiverse Saga (ongoing)', lit: 'The latest station: *Phase VI*',
        dit: 'VisionQuest sits in Phase Six, the latest station on the line.' },
      { t: 'fiche', lit: '*May 2028*, the Sokovia anniversary',
        dit: 'May 2028, during the anniversary of the Battle of Sokovia from Avengers: Age of Ultron. With a bounty on his head, Vision must confront his nature and resist Ultron’s influence to survive.' },
      { t: 'trilogie', ids: ['mcu-wv', 'mcu-agatha', 'mcu-vq'], lit: 'The end of the *WandaVision trilogy*',
        dit: 'And it closes the WandaVision trilogy: WandaVision, then Agatha All Along, and now VisionQuest, about a year and a half later.' },
      { t: 'fin', dit: 'All {stops} stops, in order, on Chronologeek dot app.' },
    ],
    fr: [
      { t: 'hook', lit: 'Où placer *VisionQuest* ?',
        dit: 'VisionQuest est sortie. Alors, où se place la série dans la chronologie Marvel ?' },
      { t: 'ligne', lit: '*10 stations*, {stops} arrêts',
        dit: 'La chronologie Marvel traverse dix stations, de la Phase Un à la Phase Six.' },
      { t: 'station', ere: 'PHASE VI — The Multiverse Saga (ongoing)', lit: 'Dernière station : *Phase VI*',
        dit: 'VisionQuest se place dans la Phase Six, la dernière station de la ligne.' },
      { t: 'fiche', lit: '*Mai 2028*, l’anniversaire de Sokovie',
        dit: 'Mai 2028, pendant l’anniversaire de la bataille de Sokovie d’Avengers : L’Ère d’Ultron. Sa tête mise à prix, Vision doit fuir, résister à l’influence d’Ultron et se confronter à sa propre nature.' },
      { t: 'trilogie', ids: ['mcu-wv', 'mcu-agatha', 'mcu-vq'], lit: 'La fin de la *trilogie WandaVision*',
        dit: 'Et elle clôt la trilogie WandaVision : WandaVision, puis Agatha All Along, et enfin VisionQuest, environ un an et demi plus tard.' },
      { t: 'fin', dit: 'Les {stops} arrêts, dans l’ordre, sur Chronologeek point app.' },
    ],
  },
};

const T = {
  en: { nouveau: 'New release', revise: 'Revised', ordre: 'In story order', station: 'Station', stops: 'stops', stop: 'stop',
        ans: 'years', essentiels: 'The essentials', episodes: 'episodes', saison: 'Season', sortie: 'Out',
        terminus: 'Terminus', cta: 'chronologeek.app', ici: 'You are here',
        fin: { l1: 'Free', l2: 'No account', l3: 'No spoilers', bio: 'Link in bio' } },
  fr: { nouveau: 'Nouvelle sortie', revise: 'Mise à jour', ordre: 'Dans l’ordre de l’histoire', station: 'Station', stops: 'arrêts', stop: 'arrêt',
        ans: 'ans', essentiels: 'Les essentiels', episodes: 'épisodes', saison: 'Saison', sortie: 'Sortie',
        terminus: 'Terminus', cta: 'chronologeek.app', ici: 'Vous êtes ici',
        fin: { l1: 'Gratuit', l2: 'Sans compte', l3: 'Sans spoiler', bio: 'Lien en bio' } },
};

const TYPES = { film: '#64b5f6', filmanim: '#90caf9', serie: '#81c784', anime: '#ce93d8', jeu: '#ffb74d',
                comic: '#f472b6', roman: '#e0c27a' };

const DOUZE = ['#4d9fff','#e23636','#f5c842','#7dd3fc','#b48cf2','#a8bf4f',
               '#e07b39','#d4a02c','#2dd4bf','#45c46b','#b0bec5','#dc0000','#ff5f1f'];
const FILET = 'linear-gradient(90deg,' + DOUZE.map((c, i) =>
  `${c} ${(i * 100 / DOUZE.length).toFixed(2)}% ${((i + 1) * 100 / DOUZE.length).toFixed(2)}%`).join(',') + ')';
const TRAIN = '<svg class="train" viewBox="0 0 38 20" aria-hidden="true">' +
  '<rect class="body" x="1" y="1" width="36" height="18" rx="8"/>' +
  '<rect class="win" x="8" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="16.5" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="25" y="6" width="5" height="5" rx="1"/></svg>';
const ETOILE = '<svg class="lvi" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.1 1.1 5.9-5.2-2.8-5.2 2.8 1.1-5.9L3.6 9.8l5.9-.8z"/></svg>';

const SOUFFLE = 0.35, ENTREE = 0.12, FIN_EN_PLUS = 1.6;

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const decode = s => String(s ?? '').replace(/&#x27;/g,"'").replace(/&#39;/g,"'")
  .replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const or = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const url = src => !src ? '' : /^https?:/.test(src) ? src
  : 'file:///' + path.join(RACINE, String(src).replace(/^\//, '')).replace(/\\/g, '/');

function charge(fichier) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ICI, fichier + '.js'), 'utf8'), ctx);
  const D = [...Object.values(ctx.window), ...Object.values(ctx)]
    .find(v => v && typeof v === 'object' && Array.isArray(v.eras));
  return { D, CG: ctx.window.CG || null, src: fs.readFileSync(path.join(ICI, fichier + '.js'), 'utf8') };
}

/* Les stations dans l'ordre du monde : le second parcours resout ses `ref`
   par les entrees de la decouverte. Chaque station garde son rang dans la
   decouverte, pour l'image et les arrets. */
function stationsMonde(D) {
  const parId = {};
  D.eras.forEach(e => e.entries.forEach(x => { if (x.id) parId[x.id] = x; }));
  const src = D.erasRewatch || D.eras;
  return src.map((era, k) => {
    const entrees = era.entries.map(x => x.ref ? { ...parId[x.ref], ...x } : x)
      .filter(x => x && x.type !== 'separator' && x.type !== 'note');
    const dates = entrees.map(x => decode(x.date)).filter(Boolean);
    return { k, titre: decode(era.title), era, entrees, n: entrees.length,
             debut: dates[0] || '', fin: dates[dates.length - 1] || '',
             iDecouverte: D.eras.findIndex(e => e.title === era.title) };
  });
}

/* l'encre d'une station : --eraN de la page, numerote par l'ordre du monde (ENCRE) */
function encres(page) {
  const css = fs.readFileSync(path.join(ICI, page + '.html'), 'utf8');
  const eres = {};
  for (const m of css.matchAll(/--era(\d+):\s*(#[0-9a-f]{3,8})/gi)) eres[m[1]] ??= m[2];
  /* les images d'ere de la page (ARTS), par parcours */
  const arts = {};
  const m = css.match(/var ARTS=\{([\s\S]*?)\};/);
  if (m) for (const p of m[1].matchAll(/(\w+):\[([^\]]*)\]/g))
    arts[p[1]] = [...p[2].matchAll(/'([^']+)'/g)].map(x => x[1]);
  return { eres, arts };
}

/* l'annee d'une date de calendrier fictif, signee : « 483 BG » → -483 */
const annee = d => {
  const m = String(d).match(/(\d+)\s*([A-Z]+)?/);
  if (!m) return null;
  return /^(BG|BBY|BC)$/.test(m[2] || '') ? -Number(m[1]) : Number(m[1]);
};

async function tmdb(cle, media, id, lang) {
  const plus = media === 'movie' ? '&append_to_response=release_dates' : '';
  const r = await fetch(`https://api.themoviedb.org/3/${media}/${id}?api_key=${cle}&language=${lang === 'fr' ? 'fr-FR' : 'en-US'}${plus}`);
  if (!r.ok) throw new Error(`TMDB ${media}/${id} : ${r.status}`);
  return r.json();
}

const dateLongue = (iso, lang) => iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString(
  lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

/* ---------- rendu ---------- */

function page(ctx) {
  const { lang, U, ST, cible, sCible, ink, art, F, fiche, essentiels, nomUnivers, typeLib, stops, oeuvre, revise } = ctx;
  /* le rang de la sortie sur la ligne, dans l'ordre du monde */
  const rang = ST.flatMap(s => s.entrees).findIndex(x => x.id === cible.id) + 1;
  const t = T[lang];
  const oeil = `<p class="eye"><span class="code">${esc(U.code)}</span>${esc(nomUnivers)} · ${esc(t.ordre)}</p>`;
  const titre = (pl, cls = '') => `<h2 class="lit ${cls}">${or(pl.lit || '')}</h2>`;

  /* le plan en miniature : les stations a parts egales, le train sur `cur` */
  const mini = cur => `<div class="mini"><div class="mtrack">
      <i class="mfill" style="width:${(cur / (ST.length - 1) * 100).toFixed(2)}%"></i>
      ${ST.map((s, k) => `<span class="mst${k <= cur ? ' v' : ''}${k === cur ? ' cur' : ''}${k === sCible.k ? ' new' : ''}" style="left:${(k / (ST.length - 1) * 100).toFixed(2)}%;--e:${ink(s)}"></span>`).join('')}
      <span class="mtrain" style="left:${(cur / (ST.length - 1) * 100).toFixed(2)}%">${TRAIN}</span>
    </div></div>
    <p class="url">${esc(t.cta)}</p>`;

  const station = s => ST.find(x => x.titre === s) || (() => { throw new Error(`station inconnue : ${s}`); })();
  /* « PHASE VI — The Multiverse Saga (ongoing) » : le nom de station s'arrete au tiret */
  const nomEre = s => decode(s.titreAff || s.titre).split(/\s+[—–]\s+/)[0];

  const plan = (pl) => {
    if (pl.t === 'hook') return `<section class="f hook">
      <div class="flou" style="background-image:url('${esc(fiche.affiche || art(sCible))}')"></div>
      <div class="filet"></div>
      <p class="kick"><span class="code">${esc(U.code)}</span>${esc(t.nouveau)}</p>
      <div class="aff"><img src="${esc(fiche.affiche || art(sCible))}" alt="">${revise ? `<span class="tampon">${esc(t.revise)}</span>` : ''}</div>
      <h1>${or(pl.lit)}</h1>
      <p class="sous">${esc([fiche.date, fiche.reseau].filter(Boolean).join(' · '))}</p>
      <div class="rail12"></div>
    </section>`;

    if (pl.t === 'ligne') {
      const pas = Math.min(120, Math.floor(940 / ST.length));
      return `<section class="f std">
      ${oeil}${titre(pl)}
      <div class="vplan" style="--pas:${pas}px">
        ${ST.map(s => `<div class="vs${s === sCible ? ' new' : ''}" style="--era:${ink(s)}">
          <span class="vd"></span><b>${esc(nomEre(s))}</b><span class="vdate">${esc(s.debut)}</span>
          </div>`).join('')}
      </div>
      ${mini(sCible.k)}
    </section>`;
    }

    if (pl.t === 'station') {
      const s = station(pl.ere);
      /* `art`, `de` et `a` du plan l'emportent : la bande DCU de DC va de
         « 2016 » à « 2016-2026 », et sa premiere image est Suicide Squad */
      const de = pl.de || s.debut, a = pl.a || s.fin;
      return `<section class="f plate" style="--era:${ink(s)}">
      <img class="pbg" src="${esc(pl.art ? url(pl.art) : art(s))}" alt="">
      ${oeil}
      <div class="pbody">
        <p class="pk"><span class="code">${esc(U.code)}</span>${esc(t.station)} ${s.k + 1} / ${ST.length}</p>
        <h2 class="pn">${esc(nomEre(s))}</h2>
        <div class="diodes"><b>${esc(de)}</b>${a && a !== de ? `<i>→</i><b>${esc(a)}</b>` : ''}</div>
        ${titre(pl, 'bas')}
      </div>
      ${mini(s.k)}
    </section>`;
    }

    if (pl.t === 'saut') {
      const a = station(pl.de), b = station(pl.a);
      const n = annee(b.debut) - annee(a.fin);
      return `<section class="f std saut">
      ${oeil}${titre({ lit: pl.lit.replace('{n}', n) })}
      <div class="gap">
        <div class="gs" style="--era:${ink(a)}"><span class="vd"></span><div><b>${esc(nomEre(a))}</b><small>${esc(a.fin)}</small></div></div>
        <div class="gmid"><span class="dash"></span><div class="big">+${n}<small>${esc(t.ans)}</small></div></div>
        <div class="gs new" style="--era:${ink(b)}"><span class="vd"></span><div><b>${esc(nomEre(b))}</b><small>${esc(b.debut)}</small></div></div>
      </div>
      ${mini(b.k)}
    </section>`;
    }

    if (pl.t === 'fiche') {
      const infos = [fiche.saison, fiche.episodes, fiche.reseau, fiche.date].filter(Boolean);
      return `<section class="f std" style="--era:${ink(sCible)}">
      <img class="pbg dim" src="${esc(art(sCible))}" alt="">
      ${oeil}${titre(pl)}
      <div class="bulle">
        <div class="vis"><img src="${esc(url(cible.img) || fiche.fond)}" alt=""></div>
        <div class="time"><div class="tn"><small>${esc(t.stop)}</small><b>${rang}</b></div>
          <p class="d">${esc(decode(cible.date))}</p><span class="tag">${esc(t.nouveau)}</span></div>
        <div class="txt">
          <p class="tags"><span class="b" style="--k:${TYPES[cible.type] || '#8f8fa8'}">${esc(typeLib(cible.type))}</span>${cible.level === 'must' ? ETOILE : ''}<span class="sn">${esc(nomEre(sCible))}</span></p>
          <h3>${esc(decode(cible.title))}</h3>
          <p class="inf">${infos.map(esc).join(' <i>·</i> ')}</p>
        </div>
      </div>
      ${mini(sCible.k)}
    </section>`;
    }

    if (pl.t === 'avant') return `<section class="f std">
      ${oeil}${titre(pl)}
      <div class="liste">
        ${essentiels.map(e => `<div class="li" style="--era:${e.ink}"><span class="vd"></span>
          <div><p class="tags"><span class="b" style="--k:${TYPES[e.type] || '#8f8fa8'}">${esc(typeLib(e.type))}</span>${ETOILE}</p>
          <b>${esc(e.titre)}</b><small>${esc(e.n > 1 ? `${e.n} ${t.stops}` : e.date)}</small></div></div>`).join('')}
        <div class="li new" style="--era:${ink(sCible)}"><span class="vd"></span>
          <div><p class="tags"><span class="tag">${esc(t.ici)}</span></p><b>${esc(decode(cible.title))}</b><small>${esc(decode(cible.date))}</small></div></div>
      </div>
      ${mini(sCible.k)}
    </section>`;

    /* quelques oeuvres liees, dans l'ordre du monde, la sortie en dernier */
    if (pl.t === 'trilogie') return `<section class="f std">
      ${oeil}${titre(pl)}
      <div class="liste tri">
        ${pl.ids.map(x => { const { e, s } = oeuvre(x), neuf = x === cible.id;
          return `<div class="li${neuf ? ' new' : ''}" style="--era:${ink(s)}"><span class="vd"></span>
          <div class="tv"><img src="${esc(url(e.img))}" alt=""></div>
          <div><p class="tags"><span class="b" style="--k:${TYPES[e.type] || '#8f8fa8'}">${esc(typeLib(e.type))}</span>${neuf ? `<span class="tag">${esc(t.ici)}</span>` : ''}</p>
          <b>${esc(decode(e.title))}</b><small>${esc(decode(e.date))} · ${esc(nomEre(s))}</small></div></div>`; }).join('')}
      </div>
      ${mini(sCible.k)}
    </section>`;

    if (pl.t === 'fin') return `<section class="f fin">
      <div class="filet"></div>
      <img class="logo" src="${esc(url('images/logo-chronologeek.webp'))}" alt="">
      <div class="url2">chronologeek.app</div>
      <div class="trois"><span>${esc(F.l1)}</span><b></b><span>${esc(F.l2)}</span><b></b><span>${esc(F.l3)}</span></div>
      <div class="ligne">${DOUZE.map(c => `<s style="--c:${c}"></s>`).join('')}</div>
      <div class="bio">${esc(F.bio)}</div>
    </section>`;
    throw new Error('plan inconnu : ' + pl.t);
  };

  const police = n => url('fonts/' + n);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${police('bigshoulders-latin.woff2')}) format('woff2')}
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${police('bigshoulders-latin-ext.woff2')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF}
@font-face{font-family:'Chivo';font-weight:100 900;src:url(${police('chivo-latin.woff2')}) format('woff2')}
:root{--ink:#0d0b12;--paper:#fffdf7;--line:rgba(255,253,247,.26);--hot:#f0c97c;--uni:${U.encre};
  --rest:color-mix(in srgb,var(--uni) 26%,#1c1a26);--board:#07060b;
  --led:radial-gradient(rgba(255,253,247,.07) 1.6px,transparent 2.2px) 0 0/7px 7px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Chivo,sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3,.eye,.code,.kick,.sous,.b,.tag,.url,.url2,.pk,.diodes,.vs,.gs,.big,.d,.tn,.sn,.inf,.li,.trois,.bio,.tampon{font-family:'Big Shoulders Display',sans-serif}
em{font-style:normal;color:var(--hot)}
.f{position:relative;isolation:isolate;width:1080px;height:1920px;overflow:hidden;background:var(--ink);color:var(--paper);
  display:flex;flex-direction:column;--era:var(--uni)}
.f>*{flex-shrink:0}
.f::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(120% 42% at 50% 0%,color-mix(in srgb,var(--era) 42%,transparent),transparent 62%)}
/* l'en-tete de TikTok couvre ~130 px, sa legende et ses boutons ~300 */
.std,.plate{padding:140px 56px 300px}
.eye{position:relative;z-index:3;display:flex;align-items:center;gap:16px;font-weight:800;font-size:31px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,253,247,.7);white-space:nowrap}
.code{display:inline-grid;place-items:center;flex:none;background:var(--uni);color:var(--ink);border:3px solid var(--ink);
  border-radius:9px;padding:3px 13px 1px;font-weight:900;font-size:32px;letter-spacing:.04em;line-height:1.1;box-shadow:0 0 0 2px var(--paper)}
.lit{position:relative;z-index:2;margin-top:34px;font-weight:900;font-size:112px;line-height:.92;text-transform:uppercase;text-wrap:balance;text-shadow:5px 5px 0 var(--ink)}
.tag{display:inline-block;background:var(--hot);color:var(--ink);border:3px solid var(--ink);border-radius:9px;font-weight:900;
  font-size:30px;letter-spacing:.12em;text-transform:uppercase;line-height:1;padding:8px 14px 6px;box-shadow:0 0 0 2px var(--hot)}
.filet{position:absolute;left:0;right:0;top:0;height:14px;background:${FILET};border-bottom:3px solid var(--paper);z-index:5}
.rail12{position:absolute;left:0;right:0;bottom:0;height:14px;background:${FILET};border-top:3px solid var(--paper);z-index:5}

/* ---- accroche : l'affiche, et la question (la couverture : tout dans y 240-1680) ---- */
.hook{align-items:center;justify-content:center;gap:0}
.flou{position:absolute;inset:-80px;background-size:cover;background-position:center;filter:blur(40px) brightness(.35) saturate(1.2);z-index:-1}
.kick{display:flex;align-items:center;gap:16px;font-weight:900;font-size:40px;letter-spacing:.16em;text-transform:uppercase;color:var(--hot)}
.aff{margin-top:40px;width:560px;border-radius:24px;overflow:hidden;border:4px solid var(--paper);box-shadow:14px 14px 0 #000,0 30px 90px #000c}
.aff img{display:block;width:100%;aspect-ratio:2/3;object-fit:cover}
/* une video refaite (placement corrige) : un tampon sur l'affiche, comme
   le « Terminus atteint » du site — rouge, penche, a l'encre epaisse */
.aff{position:relative}
.tampon{position:absolute;top:30px;right:22px;transform:rotate(8deg);background:#e5484d;color:var(--paper);
  border:5px solid var(--paper);border-radius:12px;box-shadow:8px 8px 0 #000;font-weight:900;font-size:54px;
  letter-spacing:.1em;text-transform:uppercase;line-height:1;padding:14px 26px 10px}
.hook h1{margin-top:44px;padding:0 60px;font-weight:900;font-size:124px;line-height:.9;text-transform:uppercase;text-align:center;text-wrap:balance;text-shadow:6px 6px 0 var(--ink)}
.sous{margin-top:26px;font-weight:800;font-size:40px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,253,247,.8)}

/* ---- la ligne entiere, verticale ---- */
.vplan{position:relative;margin:56px 0 0 30px;flex:1 1 auto}
.vplan::before{content:"";position:absolute;left:27px;top:28px;height:calc(var(--pas) * ${ST.length - 1});width:14px;border-radius:7px;background:var(--uni)}
.vs{position:relative;height:var(--pas);display:flex;align-items:center;gap:30px;padding-left:96px}
.vd{position:absolute;left:6px;top:50%;width:56px;height:56px;margin-top:-28px;border-radius:50%;background:var(--paper);border:8px solid var(--era);box-shadow:0 0 0 6px var(--ink)}
.vs b{font-weight:900;font-size:56px;text-transform:uppercase;line-height:1;white-space:nowrap}
.vs .vdate{margin-left:auto;font-weight:900;font-size:50px;color:var(--hot);white-space:nowrap}
.vs.new .vd{background:var(--hot);border-color:var(--paper);box-shadow:0 0 0 6px var(--ink),0 0 40px 12px rgba(240,201,124,.6)}
.vs.new b{color:var(--hot)}

/* ---- une station, son image en plein ecran ---- */
.pbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;filter:brightness(.5) saturate(1.1)}
.pbg.dim{filter:blur(26px) brightness(.32)}
.plate::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(13,11,18,.75),rgba(13,11,18,.15) 35%,rgba(13,11,18,.2) 55%,rgba(13,11,18,.92))}
.pbody{margin-top:auto;padding-bottom:20px}
.pk{display:flex;align-items:center;gap:16px;font-weight:800;font-size:38px;letter-spacing:.14em;text-transform:uppercase}
.pn{margin-top:22px;font-weight:900;font-size:150px;line-height:.86;text-transform:uppercase;text-shadow:6px 6px 0 var(--ink);
  border-left:16px solid var(--era);padding-left:28px}
.diodes{margin-top:34px;display:inline-flex;align-items:center;gap:22px;padding:22px 34px;border-radius:18px;background:var(--led),var(--board);border:3px solid var(--line)}
.diodes b{font-weight:900;font-size:96px;line-height:.9;color:var(--hot);text-shadow:0 0 22px rgba(240,201,124,.45)}
.diodes i{font-style:normal;font-size:60px;color:rgba(255,253,247,.5)}
.lit.bas{margin-top:40px;font-size:92px}
.plate .mini{margin-top:60px}

/* ---- le saut ---- */
.gap{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;margin-left:30px}
.gs{position:relative;display:flex;align-items:center;padding-left:110px;min-height:120px}
.gs .vd{left:0;width:76px;height:76px;margin-top:-38px}
.gs b{display:block;font-weight:900;font-size:64px;text-transform:uppercase;line-height:1}
.gs small{display:block;margin-top:8px;font-weight:900;font-size:56px;color:var(--hot)}
.gs.new .vd{background:var(--hot);border-color:var(--paper);box-shadow:0 0 0 6px var(--ink),0 0 40px 12px rgba(240,201,124,.6)}
.gmid{position:relative;height:620px;display:flex;align-items:center}
.dash{position:absolute;left:31px;top:-20px;bottom:-20px;width:14px;background:repeating-linear-gradient(var(--uni) 0 34px,transparent 34px 60px)}
.big{margin-left:110px;font-weight:900;font-size:260px;line-height:.8;color:var(--hot);text-shadow:0 0 50px rgba(240,201,124,.4),8px 8px 0 var(--ink)}
.big small{display:block;font-size:80px;letter-spacing:.1em;text-transform:uppercase;color:var(--paper);text-shadow:none;margin-top:14px}

/* ---- la fiche ---- */
.bulle{margin-top:46px;border:3px solid var(--line);border-radius:22px;overflow:hidden;background:color-mix(in srgb,var(--era) 18%,#0f0d16);box-shadow:10px 10px 0 #000}
.vis{aspect-ratio:16/8;background:#16141f;border-bottom:3px solid var(--ink)}
.vis img{width:100%;height:100%;object-fit:cover;display:block}
.time{height:150px;display:flex;align-items:center;gap:30px;padding:0 34px;background:var(--led),var(--board);border-bottom:3px dashed rgba(255,253,247,.16)}
.tn{display:flex;flex-direction:column;align-items:center;padding-right:30px;border-right:3px dashed rgba(255,253,247,.16)}
.tn small{font-weight:800;font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,253,247,.55)}
.tn b{font-weight:900;font-size:62px;line-height:.9}
.d{flex:1;font-weight:900;font-size:96px;line-height:.9;color:var(--hot);text-shadow:0 0 22px rgba(240,201,124,.45);white-space:nowrap}
.txt{padding:30px 34px 38px}
.tags{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.b{display:inline-block;flex:none;background:var(--k);color:var(--ink);border:3px solid var(--ink);border-radius:9px;
  font-weight:800;font-size:30px;letter-spacing:.09em;text-transform:uppercase;line-height:1;padding:8px 14px 6px}
.lvi{width:46px;height:46px;flex:none;fill:color-mix(in srgb,var(--hot) 30%,transparent);stroke:var(--hot);stroke-width:2}
.sn{margin-left:auto;font-weight:800;font-size:28px;letter-spacing:.12em;text-transform:uppercase;color:color-mix(in srgb,var(--era) 45%,var(--paper));white-space:nowrap}
.txt h3{font-weight:900;font-size:86px;line-height:.92;text-transform:uppercase;text-wrap:balance;text-shadow:5px 5px 0 var(--ink)}
.inf{margin-top:22px;padding-top:18px;border-top:3px dashed rgba(255,253,247,.16);font-weight:800;font-size:38px;letter-spacing:.04em;color:#e4e1ee}
.inf i{font-style:normal;color:var(--hot)}

/* ---- les essentiels, en arrets ---- */
.liste{position:relative;flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;gap:44px;margin-left:30px}
.liste::before{content:"";position:absolute;left:27px;top:60px;bottom:60px;width:14px;border-radius:7px;background:var(--uni)}
.li{position:relative;padding-left:110px}
.li .vd{left:6px}
.li b{display:block;font-weight:900;font-size:70px;line-height:.92;text-transform:uppercase;text-wrap:balance}
.li small{display:block;margin-top:8px;font-weight:800;font-size:40px;letter-spacing:.06em;color:var(--hot)}
.li .tags{margin-bottom:10px}
.tri .li{display:flex;align-items:center;gap:30px}
.tri .tv{flex:0 0 300px;aspect-ratio:16/9;border:3px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:8px 8px 0 #000}
.tri .tv img{width:100%;height:100%;object-fit:cover;display:block}
.tri .li.new .tv{border-color:var(--hot)}
.tri .li b{font-size:64px}
.li.new .vd{background:var(--hot);border-color:var(--paper);box-shadow:0 0 0 6px var(--ink),0 0 40px 12px rgba(240,201,124,.6)}

/* ---- le plan en miniature ---- */
.mini{margin-top:auto;padding:0 36px}
.mtrack{position:relative;height:16px;border-radius:8px;background:var(--rest);box-shadow:0 0 0 4px var(--ink)}
.mfill{position:absolute;left:0;top:0;bottom:0;border-radius:8px;background:var(--uni)}
.mst{position:absolute;top:50%;width:32px;height:32px;transform:translate(-50%,-50%);border-radius:50%;background:var(--paper);border:5px solid var(--ink);box-shadow:0 0 0 3px var(--rest)}
.mst.v{background:var(--e);border-color:var(--paper);box-shadow:0 0 0 3px var(--ink)}
.mst.new{background:var(--hot);border-color:var(--paper)}
.mst.cur{box-shadow:0 0 0 5px var(--hot)}
.mtrain{position:absolute;top:-58px;transform:translateX(-50%)}
.train{width:76px;height:40px}.train .body{fill:var(--hot);stroke:var(--ink);stroke-width:2}.train .win{fill:var(--ink)}
.url{margin-top:30px;text-align:center;font-weight:900;font-size:44px;letter-spacing:.04em;color:var(--hot)}

/* ---- fin ---- */
.fin{align-items:center;justify-content:center;background:radial-gradient(ellipse 80% 50% at 50% 45%,#1b1b2c,#08080f 70%)}
.fin .logo{width:860px;height:auto;margin-top:-120px}
.fin .url2{margin-top:70px;font-weight:900;font-size:132px;color:var(--hot)}
.fin .trois{margin-top:46px;display:flex;align-items:center;gap:26px;font-weight:800;font-size:54px;text-transform:uppercase;letter-spacing:.06em}
.fin .trois b{width:14px;height:14px;border-radius:50%;background:var(--hot)}
.fin .ligne{margin-top:90px;display:flex;align-items:center;width:860px;height:16px;background:${FILET};border-radius:8px;justify-content:space-between;padding:0 4px}
.fin .ligne s{width:34px;height:34px;border-radius:50%;background:#08080f;border:6px solid var(--c)}
.fin .bio{margin-top:70px;font-size:44px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,253,247,.7)}
</style></head><body>
${ctx.plans.map(plan).join('\n')}
</body></html>`;
}

/* ---------- montage (celui de presentation.mjs) ---------- */

function monte(plans, dossier, sortie) {
  const total = plans.reduce((s, p) => s + p.dur, 0);
  fs.writeFileSync(path.join(dossier, '_plans.txt'),
    plans.map(p => `file '${p.img.replace(/\\/g,'/')}'\nduration ${p.dur.toFixed(3)}`).join('\n')
    + `\nfile '${plans[plans.length - 1].img.replace(/\\/g,'/')}'\n`, 'utf8');
  const morceaux = plans.map((p, i) => {
    const wav = path.join(dossier, `piste-${i}.wav`);
    execFileSync('ffmpeg', ['-y','-loglevel','error','-i', p.wav,
      '-af', `aresample=48000,adelay=${Math.round(ENTREE * 1000)}:all=1,apad=whole_dur=${p.dur.toFixed(3)},atrim=0:${p.dur.toFixed(3)}`,
      '-ac','2','-ar','48000', wav]);
    return `file '${wav.replace(/\\/g,'/')}'`;
  });
  fs.writeFileSync(path.join(dossier, '_voix.txt'), morceaux.join('\n'), 'utf8');
  execFileSync('ffmpeg', ['-y','-loglevel','error',
    '-f','concat','-safe','0','-i', path.join(dossier, '_plans.txt'),
    '-f','concat','-safe','0','-i', path.join(dossier, '_voix.txt'),
    '-t', total.toFixed(3), '-c:v','libx264','-preset','slow','-crf','19',
    '-vf','fps=30,format=yuv420p','-r','30',
    '-af','loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a','aac','-b:a','192k','-ar','48000',
    '-movflags','+faststart', sortie], { stdio: ['ignore','ignore','pipe'] });
  return total;
}

async function main() {
  const a = process.argv.slice(2);
  const val = (n, d) => a.includes(n) ? a[a.indexOf(n) + 1] : d;
  const id = a.find(x => !x.startsWith('--') && !a[a.indexOf(x) - 1]?.startsWith('--'));
  const S = SORTIES[id];
  if (!S) throw new Error(`sortie inconnue : ${id} — connues : ${Object.keys(SORTIES).join(', ')}`);
  const lang = val('--lang', 'en') === 'fr' ? 'fr' : 'en';
  const U = UNIVERS[S.univers];
  const t = T[lang];

  /* la structure vient de l'anglais (les plans y nomment les stations), le
     texte de la langue demandee, au meme rang */
  const { D: Den } = charge(U.data + '-en');
  const { D, CG, src } = charge(lang === 'en' ? U.data + '-en' : U.data);
  const STen = stationsMonde(Den), ST = stationsMonde(D);
  ST.forEach((s, k) => { s.titreAff = s.titre; s.titre = STen[k].titre; });
  const sCible = ST.find(s => s.entrees.some(x => x.id === id));
  const cible = sCible.entrees.find(x => x.id === id);

  const { eres, arts } = encres(U.page);
  const ink = s => eres[s.k + 1] || U.encre;
  const listeArts = arts.rewatch || arts.first || [];
  const art = s => url(listeArts[s.k] || s.era.art ||
    (s.entrees.find(x => x.img && x.level === 'must') || s.entrees.find(x => x.img) || {}).img);
  const typeLib = ty => (CG && CG.badgeLabels && CG.badgeLabels[ty] && CG.badgeLabels[ty][1]) || String(ty).toUpperCase();

  /* les essentiels avant la sortie, dans la decouverte, regroupes par oeuvre */
  const essentiels = [];
  for (const era of D.eras) for (const e of era.entries) {
    if (e.id === id) break;
    if (e.level !== 'must') continue;
    const titre = decode(e.title).split(/\s+[-–—]\s+/)[0];
    const der = essentiels.find(x => x.titre === titre);
    if (der) { der.n++; continue; }
    const s = ST.find(x => x.entrees.some(y => y.id === e.id));
    essentiels.push({ titre, n: 1, type: e.type, date: decode(e.date), ink: s ? ink(s) : U.encre });
  }
  const stops = D.eras.reduce((n, era) => n + era.entries.filter(x => x.type !== 'separator' && x.type !== 'note').length, 0);

  /* TMDB : l'affiche, la date, le diffuseur, les episodes */
  const cle = (src.match(/\b[a-f0-9]{32}\b/) || [])[0];
  const fiche = {};
  if (cle && cible.tmdb && cible.tmdb !== '0') {
    const j = await tmdb(cle, cible.media || 'tv', cible.tmdb, lang);
    if (j.poster_path) fiche.affiche = 'https://image.tmdb.org/t/p/w780' + j.poster_path;
    if (j.backdrop_path) fiche.fond = 'https://image.tmdb.org/t/p/w1280' + j.backdrop_path;
    /* Un film : la sortie en salles du pays de la langue (type 3), puis
       limitee (2), puis numerique (4). `release_date` est la premiere sortie
       au monde — Clayface y annoncait le 19 octobre pour une sortie
       americaine le 23, l'avant-premiere du 13 etant de type 1. */
    const pays = ((j.release_dates || {}).results || []).find(x => x.iso_3166_1 === (lang === 'fr' ? 'FR' : 'US'));
    const parType = ty => ((pays || {}).release_dates || []).filter(x => x.type === ty).map(x => x.release_date.slice(0, 10)).sort()[0];
    const sortiePays = pays && (parType(3) || parType(2) || parType(4));
    fiche.date = `${t.sortie} ${dateLongue(j.first_air_date || sortiePays || j.release_date, lang)}`;
    fiche.reseau = (j.networks || [])[0]?.name || '';
    if (j.number_of_episodes) fiche.episodes = `${j.number_of_episodes} ${t.episodes}`;
    const sub = (cible.subitems || [])[0];
    if (sub) fiche.saison = decode(sub);
  }

  /* `{stops}` compte toute la page, `{ligne}` la seule station de la sortie :
     DC est un reseau, et 148 arrets ne disent rien a qui ne suit que le DCU */
  const remplit = x => x.replace('{stops}', stops).replace('{ligne}', sCible.n);
  const plans = S[lang].map(p => ({ ...p, dit: remplit(p.dit),
    ...(p.lit ? { lit: remplit(p.lit) } : {}) }));
  const dossier = path.join(RACINE, 'promo', `sortie-${id}-${lang}`);
  fs.mkdirSync(dossier, { recursive: true });

  /* la voix d'abord : chaque plan dure le temps de sa phrase */
  /* une phrase deja rendue avec la meme voix ne repart pas chez Microsoft */
  const voixNom = val('--voix', VOIX[lang]), debit = val('--debit', DEBIT);
  plans.forEach((p, i) => {
    p.wav = path.join(dossier, `voix-${i}.wav`);
    const memo = p.wav.replace(/\.wav$/, '.txt'), cle = `${voixNom}|${debit}|${p.dit}`;
    const parleDur = fs.existsSync(p.wav) && fs.existsSync(memo) && fs.readFileSync(memo, 'utf8') === cle
      ? duree(p.wav) : parle(p.dit, lang, p.wav, { voix: voixNom, debit });
    fs.writeFileSync(memo, cle, 'utf8');
    p.dur = ENTREE + parleDur + SOUFFLE + (p.t === 'fin' ? FIN_EN_PLUS : 0);
  });

  /* une oeuvre par son id : l'entree et sa station dans l'ordre du monde */
  const oeuvre = x => {
    const st = ST.find(s => s.entrees.some(y => y.id === x));
    if (!st) throw new Error(`oeuvre inconnue : ${x}`);
    return { e: st.entrees.find(y => y.id === x), s: st };
  };
  const html = page({ lang, U, ST, cible, sCible, ink, art, F: t.fin, fiche, essentiels, plans, stops,
    nomUnivers: decode(D.title), typeLib, oeuvre, revise: !!S.revise });
  const apercu = path.join(dossier, '_apercu.html');
  fs.writeFileSync(apercu, html, 'utf8');
  const nav = await chromium.launch();
  const pg = await nav.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await pg.goto('file:///' + apercu.replace(/\\/g, '/'), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 30000 });
  const morts = await pg.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
  if (morts.length) throw new Error('image morte : ' + morts.join(', '));
  const cadres = await pg.$$('.f');
  for (let i = 0; i < cadres.length; i++) {
    plans[i].img = path.join(dossier, 'plan-' + String(i).padStart(2, '0') + '.png');
    await cadres[i].screenshot({ path: plans[i].img });
  }
  await nav.close();

  const mp4 = path.join(RACINE, 'promo', `sortie-${id}-${lang}.mp4`);
  const total = monte(plans, dossier, mp4);
  console.log(plans.map((p, i) => `  ${String(i).padStart(2)}  ${p.dur.toFixed(2)} s  ${p.dit}`).join('\n'));
  console.log(`sortie-${id}-${lang} — ${plans.length} plans, ${total.toFixed(1)} s, ${(fs.statSync(mp4).size / 1048576).toFixed(1)} Mo`);
  console.log(`→ promo/sortie-${id}-${lang}.mp4`);
  if (total < 30) console.warn('  ⚠ sous 30 s');
  if (total > 60.05) console.warn('  ⚠ au-dela de 60 s : trop long pour une musique TikTok');
}

main().catch(e => { console.error(e.stack || e); process.exit(1); });
