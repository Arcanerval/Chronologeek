/* Carrousels Instagram (1080x1350) produits depuis les donnees du site.
   node _proto/carrousel.mjs <univers> [--lang en|fr] [--max 11]
   Sortie : promo/carrousel-<univers>-<langue>/01.png ...

   Rien n'est ecrit a la main ici : titres, dates, vignettes, ordre et decoupage
   en eres viennent de _proto/data*.js, comme le JSON-LD et le prerendu. Une
   oeuvre ajoutee demain sort dans le carrousel sans qu'on touche au script.

   Depuis le 1er octobre 2026, la DA est celle du plan de metro, comme les
   videos (video.mjs) et les pages : la couverture montre la ligne entiere en
   plan vertical et le tableau des departs en diodes ; chaque slide s'ouvre sur
   la plaque de sa station, image d'ere comprise ; chaque oeuvre est un arret
   pose sur la ligne, avec son horaire en diodes ; le plan en miniature porte
   le train en bas ; la fin est le terminus, avec son billet. Code de ligne,
   encres d'ere (`--eraN`) et de type (`--t-*`) sont relus dans la page.

   L'anglais est la langue par defaut, comme pour les videos : le compte vise
   l'international. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

/* cle -> code de ligne, proto de la page (pour ses encres), donnees, encre de
   la charte, visuel de couverture (celui des cases de l'accueil) */
const UNIVERS = {
  sw:             { code: 'SW',  page: 'e-starwars',        data: 'data',                encre: '#4d9fff', cover: 'starwars-banner' },
  mcu:            { code: 'MCU', page: 'e-marvel',          data: 'data-mcu',            encre: '#e23636', cover: 'mcu' },
  dc:             { code: 'DC',  page: 'e-dc',              data: 'data-dc',             encre: '#f5c842', cover: 'dcmultivers' },
  avatar:         { code: 'AV',  page: 'e-avatar',          data: 'data-avatar',         encre: '#7dd3fc', cover: 'avatar' },
  startrek:       { code: 'ST',  page: 'en-startrek',       data: 'data-startrek',       encre: '#b48cf2', cover: 'startrek' },
  twd:            { code: 'TWD', page: 'en-twd',            data: 'data-twd',            encre: '#a8bf4f', cover: 'twd' },
  dragonage:      { code: 'DA',  page: 'en-dragonage',      data: 'data-dragonage',      encre: '#e07b39', cover: 'dragonage' },
  assassinscreed: { code: 'AC',  page: 'en-assassinscreed', data: 'data-assassinscreed', encre: '#d4a02c', cover: 'acuniverse' },
  dcanimation:    { code: 'DCA', page: 'en-dcanimation',    data: 'data-dcanimation',    encre: '#2dd4bf', cover: 'dcanimation' },
  jurassic:       { code: 'JW',  page: 'en-jurassic',       data: 'data-jurassic',       encre: '#45c46b', cover: 'jurassicworld' },
  witcher:        { code: 'TW',  page: 'en-witcher',        data: 'data-witcher',        encre: '#b0bec5', cover: 'witcher' },
  residentevil:   { code: 'RE',  page: 'en-residentevil',   data: 'data-re',             encre: '#dc0000', cover: 'residentevil' },
};

/* encres des badges de type, charte du site — repli si la page n'a pas son --t-* */
const TYPES = {
  film:     ['#64b5f6', 'FILM',        'FILM'],
  filmanim: ['#90caf9', 'FILM ANIMÉ',  'ANIMATED FILM'],
  serie:    ['#81c784', 'SÉRIE',       'SERIES'],
  anime:    ['#ce93d8', 'SÉRIE ANIMÉE','ANIMATED SERIES'],
  jeu:      ['#ffb74d', 'JEU',         'GAME'],
  dlc:      ['#ffb74d', 'DLC',         'DLC'],
  special:  ['#ffa726', 'SPÉCIAL',     'SPECIAL'],
  video:    ['#f472b6', 'VIDÉO',       'VIDEO'],
  livre:    ['#c5a880', 'ROMAN',       'NOVEL'],
  comic:    ['#c5a880', 'COMIC',       'COMIC'],
  roman:    ['#c5a880', 'ROMAN',       'NOVEL'],
  short:    ['#f472b6', 'COURT MÉTRAGE','SHORT FILM'],
  audio:    ['#80cbc4', 'AUDIO',       'AUDIO'],
};

const T = {
  fr: { ordre:"DANS L'ORDRE", premiere:'PREMIÈRE VISION', suite:'suite', entries:'œuvres',
        essentiel:'Essentiel', important:'Important', station:'Station', stations:'stations',
        stop:'Arrêt', stops:'arrêts', spoil:'spoiler', souvenirs:'Souvenirs', terminus:'Terminus',
        fin:'Fin de la ligne', fin1:'La timeline complète, gratuite', prochain:'Prochain départ',
        fin2:'Cochez ce que vous avez vu. Le site retient votre progression.',
        swipe:'Faites glisser',
        fin3:(u, n) => `${u} univers · ${n.toLocaleString('fr-FR').replace(/\s/g, ' ')} œuvres · FR + EN` },
  en: { ordre:'IN ORDER', premiere:'FIRST WATCH ORDER', suite:'cont.', entries:'entries',
        essentiel:'Essential', important:'Important', station:'Station', stations:'stations',
        stop:'Stop', stops:'stops', spoil:'spoilers', souvenirs:'Memories', terminus:'Terminus',
        fin:'End of the line', fin1:'The full timeline, free', prochain:'Next departure',
        fin2:'Check off what you have seen. The site remembers.',
        swipe:'Swipe',
        fin3:(u, n) => `${u} universes · ${n.toLocaleString('en-US')} entries · EN + FR` },
};

/* Le decompte de fin se lit dans l'index de la recherche, que la publication
   produit depuis les memes donnees : ecrit en dur, il annoncait encore
   "9 univers · 1 463 oeuvres" le jour ou Jurassic World en faisait dix. */
function decompte() {
  const idx = JSON.parse(fs.readFileSync(path.join(RACINE, 'search-en.json'), 'utf8'));
  return [Object.keys(UNIVERS).length, idx.e.length];
}

/* ---------- lecture des donnees ---------- */

function charge(fichier) {
  const src = fs.readFileSync(path.join(ICI, fichier + '.js'), 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const candidats = [...Object.values(ctx.window), ...Object.values(ctx)];
  const D = candidats.find(v => v && typeof v === 'object' && Array.isArray(v.eras));
  if (!D) throw new Error(`aucun objet avec "eras" dans ${fichier}.js`);
  return { D, CG: ctx.window.CG };
}

/* Les encres de la page : `--eraN` des plaques et `--t-<type>` des badges
   sont ecrites dans son CSS, et nulle part ailleurs (meme lecture que
   video.mjs) — une troisieme copie de la charte divergerait au premier
   changement. */
function encresPage(cle) {
  const f = path.join(ICI, UNIVERS[cle].page + '.html');
  const css = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  const eres = {}, types = {};
  for (const m of css.matchAll(/--era(\d+):\s*(#[0-9a-f]{3,8})/gi)) eres[m[1]] ??= m[2];
  for (const m of css.matchAll(/--t-([a-z]+):\s*(#[0-9a-f]{3,8})/gi)) types[m[1]] ??= m[2];
  return { eres, types };
}

/* Le niveau intermediaire s'ecrit de deux facons : "important" chez huit
   univers, "imp" chez DC — c'est la valeur qui change, pas le champ, et
   CLAUDE.md le dit. N'accepter que la premiere laissait les 118 entrees de DC
   sans triangle : rien ne cassait, la marque manquait. */
const IMPORTANT = new Set(['important', 'imp']);

/* Les stations : les eres qui ont au moins une oeuvre, dans l'ordre, avec
   leur rang dans la page et le rang de leur premiere oeuvre. Les slides
   s'en deduisent : une ere trop longue se coupe en morceaux egaux. */
function decoupe(D, maxParSlide) {
  const stations = [], slides = [];
  let n = 0;
  D.eras.forEach((ere, i) => {
    const entrees = (ere.entries || []).filter(e => e && e.title && e.type !== 'separator');
    if (!entrees.length) return;
    const st = { i, k: stations.length, ere, debut: n, n: entrees.length };
    stations.push(st);
    const morceaux = Math.ceil(entrees.length / maxParSlide);
    const parMorceau = Math.ceil(entrees.length / morceaux);
    for (let m = 0; m < morceaux; m++) {
      const lot = entrees.slice(m * parMorceau, (m + 1) * parMorceau);
      slides.push({
        st, morceau: m, morceaux,
        entrees: lot.map(e => {
          const niveau = e.level || e.imp || '';
          /* les trois marques calculees ici ecrasent le champ de donnees du meme
             nom, comme dans video.mjs. */
          return { ...e, rang: ++n, j: n - 1 - st.debut,
            must: niveau === 'must',
            imp: IMPORTANT.has(niveau),
            flashback: (e.tags || []).includes('flashback'),
            flashforward: (e.tags || []).includes('flashforward') };
        }),
      });
    }
  });
  return { stations, slides, total: n };
}

/* L'echelle mixte des pages (ech() de en-startrek.html) : la moitie de la
   ligne a parts egales entre stations, l'autre au prorata des arrets. Au
   seul prorata, les trois arrets d'Altair tiennent dans les 3 % de gauche. */
function echelle(st, total) {
  const S = st.length;
  return (k, j) => 0.5 * (k + j / st[k].n) / S + 0.5 * (st[k].debut + j) / total;
}

/* ---------- rendu ---------- */

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decode = s => String(s ?? '').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/* les vignettes sont referencees en /images/x.webp : chemin absolu pour file://.
   Une URL (TMDB) se laisse telle quelle. */
const visuel = src => {
  if (!src) return '';
  const s = String(src);
  if (/^https?:\/\//i.test(s)) return s;
  return 'file:///' + path.join(RACINE, s.replace(/^\//, '')).replace(/\\/g, '/');
};

function trouveCouverture(cle) {
  for (const n of [UNIVERS[cle].cover, cle]) {
    for (const ext of ['.webp', '.png', '.jpg']) {
      const p = path.join(RACINE, 'images', n + ext);
      if (fs.existsSync(p)) return 'file:///' + p.replace(/\\/g, '/');
    }
  }
  console.warn(`  ⚠ pas de visuel de couverture pour ${cle}`);
  return '';
}

/* le train des pages, sans son onde */
const TRAIN = '<svg class="train" viewBox="0 0 38 20" aria-hidden="true">' +
  '<rect class="body" x="1" y="1" width="36" height="18" rx="8"/>' +
  '<rect class="win" x="8" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="16.5" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="25" y="6" width="5" height="5" rx="1"/></svg>';

/* les deux signes de niveau des pages (LVICO), trait compris : les trois
   surfaces — pages, videos, carrousels — portent le meme signe */
const ETOILE = '<svg class="lvi must" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.1 1.1 5.9-5.2-2.8-5.2 2.8 1.1-5.9L3.6 9.8l5.9-.8z"/></svg>';
const TRIANGLE = '<svg class="lvi imp" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 3.8 2.6 20.2h18.8z"/><path d="M12 9.6v4.2M12 16.9h.01"/></svg>';

/* le filet aux douze encres du pied de page et des barres du bas */
const DOUZE = ['#4d9fff','#e23636','#f5c842','#7dd3fc','#b48cf2','#a8bf4f',
               '#e07b39','#d4a02c','#2dd4bf','#45c46b','#b0bec5','#dc0000'];
const FILET = 'linear-gradient(90deg,' + DOUZE.map((c, i) =>
  `${c} ${(i * 100 / 12).toFixed(2)}% ${((i + 1) * 100 / 12).toFixed(2)}%`).join(',') + ')';

function page(cle, D, CG, decoupage, lang) {
  const t = T[lang];
  const U = UNIVERS[cle];
  const encre = U.encre;
  const nom = decode(D.title || cle);
  const { stations: ST, slides, total } = decoupage;
  const X = echelle(ST, total);
  const { eres: inkEre, types: inkType } = encresPage(cle);
  const cover = trouveCouverture(cle);
  const nSlides = slides.length + 2;
  /* un univers a deux parcours ne montre que l'un des deux : le carrousel suit
     `eras`, la decouverte, et le dit — comme la video */
  const parcours = (D.erasRewatch || D.erasReplay) ? t.premiere : t.ordre;

  const encreEre = s => inkEre[s.ere.ink || s.i + 1] || encre;
  /* l'image d'une ere : son `art`, sinon la vignette de sa premiere oeuvre
     essentielle, comme la plaque de la page */
  const artEre = s => {
    if (s.ere.art) return visuel(s.ere.art);
    const e = (s.ere.entries || []).find(x => x.img && x.level === 'must') ||
              (s.ere.entries || []).find(x => x.img);
    return e ? visuel(e.img) : '';
  };
  const nomEre = s => decode(s.ere.title || '').split(/\s+[—–-]\s+/)[0];
  const rangEre = s => s.ere.phase
    ? `${decode(s.ere.phase)} / ${ST.length}`
    : `${t.station} ${s.k + 1} / ${ST.length}`;
  const arrets = n => `${n} ${n > 1 ? t.stops : t.stop}`;

  const typeDe = e => {
    const [bt, fr, en] = TYPES[e.type] || ['#8f8fa8', String(e.type || '').toUpperCase(), String(e.type || '').toUpperCase()];
    const lib = CG && CG.badgeLabels && CG.badgeLabels[e.type] && CG.badgeLabels[e.type][1];
    return { k: inkType[e.type] || bt, lib: lib || (lang === 'en' ? en : fr) };
  };

  const oeil = `<p class="eye"><span class="code">${esc(U.code)}</span>${esc(nom)} · ${esc(parcours)}</p>`;

  /* le plan en miniature, celui de la barre du bas des pages */
  const plan = (pos, cur) => `<div class="mtrack"><i class="mfill" style="width:${(pos * 100).toFixed(2)}%"></i>
        ${ST.map((s, k) => {
          const x = X(k, 0);
          return `<span class="mst${x <= pos + 1e-6 ? ' v' : ''}${k === cur ? ' cur' : ''}" style="left:${(x * 100).toFixed(2)}%"></span>`;
        }).join('')}
        <span class="mst tm${pos >= 1 ? ' v' : ''}" style="left:100%"></span>
        <span class="mtrain" style="left:${(pos * 100).toFixed(2)}%">${TRAIN}</span>
      </div>`;

  const pied = (pos, cur, i) => `<footer class="foot">
      ${plan(pos, cur)}
      <p class="fl"><span>chronologeek.app</span><span class="pg"><b>${i}</b> / ${nSlides}</span></p>
    </footer>`;

  /* ---- un arret : une oeuvre posee sur la ligne ---- */
  const arret = e => {
    const ty = typeDe(e);
    /* l'horaire des pages : la date en or ; chez Assassin's Creed le present
       en or et les souvenirs dans leur cadre rouge, dessous. Sans present,
       rien ne s'ecrit a sa place. */
    const grand = e.present ? decode(e.present) : e.date ? decode(e.date) : '';
    const souvenir = e.present && e.date ? decode(e.date) : '';
    const titre = decode(e.title);
    /* les sous-items partent en entier, le CSS tronque : sans eux, onze cartes
       « Arrow » / « The Flash » se suivent chez DC sans qu'on sache pourquoi */
    const sous = Array.isArray(e.subitems) ? e.subitems.map(x => decode(x).trim()).filter(Boolean).join(' · ') : '';
    const marques = [
      e.flashback && `<span class="mk" style="--k:#f0c97c">FLASHBACK</span>`,
      e.flashforward && `<span class="mk" style="--k:#8fd6c4">FLASHFORWARD</span>`,
    ].filter(Boolean).join('');
    return `<li class="ar${e.must ? ' must' : ''}">
      <span class="dot"></span>
      <div class="bu">
        <div class="tm"><small>${esc(t.stop)} ${String(e.rang).padStart(2, '0')}</small>
          ${grand ? `<b class="${grand.length > 11 ? 'dl' : grand.length > 8 ? 'dm' : ''}">${esc(grand)}</b>` : ''}
          ${souvenir ? `<i class="mem">${esc(souvenir)}</i>` : ''}</div>
        <span class="vis">${e.img ? `<img src="${esc(visuel(e.img))}" alt="">` : '<span class="ph"></span>'}${marques ? `<span class="mks">${marques}</span>` : ''}</span>
        <div class="tx">
          <p class="tg"><span class="b" style="--k:${ty.k}">${esc(ty.lib)}</span>${e.must ? ETOILE : ''}${e.imp ? TRIANGLE : ''}</p>
          <p class="ti${titre.length > 46 ? ' t3' : titre.length > 30 ? ' t2' : ''}">${esc(titre)}</p>
          ${sous ? `<p class="si">${esc(sous)}</p>` : ''}
        </div>
      </div>
    </li>`;
  };

  /* ---- une slide : la plaque de sa station, puis ses arrets ---- */
  const corps = slides.map((sl, i) => {
    const s = sl.st;
    const nE = nomEre(s);
    const der = sl.entrees[sl.entrees.length - 1];
    /* le train se pose au dernier arret de la slide : on avance d'une slide a
       l'autre comme sur la ligne */
    const pos = X(s.k, Math.min(der.j + 1, s.n - 1e-9));
    return `
  <section class="sl ere" style="--era:${encreEre(s)}">
    <header class="pl">
      ${artEre(s) ? `<img class="pbg" src="${esc(artEre(s))}" alt="">` : ''}
      ${oeil}
      <p class="pk"><span class="code">${esc(U.code)}</span>${esc(rangEre(s))}${sl.morceaux > 1 ? `<em>${sl.morceau + 1} / ${sl.morceaux}</em>` : ''}</p>
      <h2 class="${nE.length > 22 ? 'n3' : nE.length > 14 ? 'n2' : ''}">${esc(nE)}</h2>
      <p class="pm"><b>${s.n}</b> ${esc(s.n > 1 ? t.stops : t.stop)}</p>
    </header>
    <ul class="ln n${sl.entrees.length}${sl.morceau > 0 ? ' av' : ''}${sl.morceau < sl.morceaux - 1 || s.k < ST.length - 1 ? ' ap' : ''}">${sl.entrees.map(arret).join('')}</ul>
    ${pied(pos, s.k, i + 2)}
  </section>`;
  }).join('');

  /* la legende des signes, et seulement de ceux que le carrousel montre :
     Star Trek n'a pas de niveaux, un univers sans flashback n'a pas de pastille */
  const toutes = slides.flatMap(s => s.entrees);
  const legende = [
    toutes.some(e => e.must) && `<span>${ETOILE}${esc(t.essentiel)}</span>`,
    toutes.some(e => e.imp) && `<span>${TRIANGLE}${esc(t.important)}</span>`,
    toutes.some(e => e.flashback) && `<span><i class="mk" style="--k:#f0c97c">FLASHBACK</i></span>`,
    toutes.some(e => e.flashforward) && `<span><i class="mk" style="--k:#8fd6c4">FLASHFORWARD</i></span>`,
  ].filter(Boolean);

  /* le plan vertical de la couverture : toute la ligne d'un coup d'oeil. Le pas
     se resserre avec le nombre de stations — sept chez Assassin's Creed,
     quatorze chez The Walking Dead. */
  const pas = Math.min(64, Math.floor(620 / (ST.length + 1)));
  const corpsV = Math.min(38, Math.max(22, Math.round(pas * 0.56)));
  const vplan = `<div class="vplan" style="--pas:${pas}px;--corps:${corpsV}px">
      ${ST.map((s, k) => `<div class="vs" style="--era:${encreEre(s)}"><span class="vd${k === 0 ? ' cur' : ''}"></span>` +
        `<b>${esc(nomEre(s))}</b><small>${esc(arrets(s.n))}</small></div>`).join('')}
      <div class="vs tmn"><span class="vd"></span><b>${esc(t.terminus)}</b></div>
    </div>`;

  const police = n => 'file:///' + path.join(RACINE, 'fonts', n).replace(/\\/g, '/');
  return `<!doctype html><meta charset="utf-8">
<style>
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${police('bigshoulders-latin.woff2')}) format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212}
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${police('bigshoulders-latin-ext.woff2')}) format('woff2');
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB}
@font-face{font-family:'Chivo';font-weight:100 900;src:url(${police('chivo-latin.woff2')}) format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F}
@font-face{font-family:'Chivo';font-weight:100 900;src:url(${police('chivo-latin-ext.woff2')}) format('woff2');
  unicode-range:U+0100-02BA,U+1E00-1E9F}
:root{--ink:#0d0b12;--paper:#fffdf7;--line:rgba(255,253,247,.22);--hot:#f0c97c;--uni:${encre};
  --rest:color-mix(in srgb,var(--uni) 26%,#1c1a26);--board:#07060b;--memory:#e2515f;
  --led:radial-gradient(rgba(255,253,247,.07) 1.4px,transparent 2px) 0 0/6px 6px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Chivo,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,.eye,.code,.b,.mk,.pk,.pm,.tm,.fl,.vs,.st,.lg,.tkt,.ti,.k,.tail{font-family:'Big Shoulders Display',sans-serif}
.sl{position:relative;isolation:isolate;width:1080px;height:1350px;overflow:hidden;background:var(--ink);color:var(--paper);
  display:flex;flex-direction:column;--era:var(--uni)}
.sl>*{flex-shrink:0}
.eye{display:flex;align-items:center;gap:14px;font-weight:800;font-size:25px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,253,247,.72);white-space:nowrap;overflow:hidden}
.code{display:inline-grid;place-items:center;flex:none;background:var(--uni);color:var(--ink);border:3px solid var(--ink);
  border-radius:8px;padding:2px 11px 0;font-weight:900;font-size:27px;letter-spacing:.04em;line-height:1.1;
  box-shadow:0 0 0 2px var(--paper)}
.mk{font-style:normal;display:inline-block;background:var(--k);color:var(--ink);border:2px solid var(--ink);border-radius:6px;
  font-weight:900;font-size:16px;letter-spacing:.1em;line-height:1;padding:5px 8px 3px}
.lvi{width:30px;height:30px;flex:none;fill:none;stroke-width:2;stroke-linejoin:miter;stroke-linecap:square}
.lvi.must{stroke:var(--hot);fill:color-mix(in srgb,var(--hot) 30%,transparent)}
.lvi.imp{stroke:#ff9d5c}

/* ---- la plaque de station, en tete de slide ---- */
.pl{position:relative;isolation:isolate;padding:50px 56px 30px;border-bottom:4px solid var(--paper);
  display:flex;flex-direction:column;gap:10px}
.pl .eye{margin-bottom:26px}
.pbg{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.05)}
.pl::before{content:"";position:absolute;inset:0;z-index:-1;background:
  linear-gradient(180deg,rgba(13,11,18,.86) 0%,color-mix(in srgb,var(--ink) 45%,transparent) 34%,
    color-mix(in srgb,var(--era) 52%,rgba(13,11,18,.4)) 76%,color-mix(in srgb,var(--era) 74%,var(--ink)) 100%)}
.pk{display:flex;align-items:center;gap:14px;font-weight:800;font-size:28px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,253,247,.92);text-shadow:0 2px 6px var(--ink)}
.pk em{font-style:normal;margin-left:auto;letter-spacing:.12em;color:var(--hot)}
.pl h2{margin-top:8px;font-weight:900;font-size:100px;line-height:.9;text-transform:uppercase;text-shadow:6px 6px 0 var(--ink)}
.pl h2.n2{font-size:86px} .pl h2.n3{font-size:70px;line-height:.92}
.pm{font-weight:800;font-size:30px;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 2px 6px var(--ink)}
.pm b{color:var(--hot);font-weight:900}

/* ---- la ligne et ses arrets ---- */
.ln{list-style:none;position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:center;
  gap:12px;padding:22px 56px 22px 38px}
/* la voie court d'un bord a l'autre quand la ligne continue sur la slide d'avant
   ou d'apres, et s'arrete au premier ou au dernier arret sinon */
.ln::before{content:"";position:absolute;left:calc(38px + 25px);top:var(--haut,50%);bottom:var(--bas,50%);width:12px;margin-left:-6px;
  border-radius:6px;background:var(--uni);box-shadow:0 0 0 3px var(--ink)}
.ln.av{--haut:0} .ln.ap{--bas:0}
.ar{position:relative;flex:1 1 0;max-height:118px;min-height:0;display:grid;grid-template-columns:50px minmax(0,1fr);
  column-gap:18px;align-items:center}
.dot{position:relative;z-index:1;justify-self:center;width:32px;height:32px;border-radius:50%;background:var(--paper);
  border:6px solid var(--ink);box-shadow:0 0 0 4px var(--era)}
.ar.must .dot{width:40px;height:40px;background:var(--uni);border-color:var(--paper);
  box-shadow:0 0 0 4px var(--ink),0 0 18px 4px color-mix(in srgb,var(--hot) 45%,transparent)}
/* le raccord de l'arret a sa bulle, comme sur les pages */
.ar::after{content:"";position:absolute;left:44px;width:22px;top:50%;height:6px;margin-top:-3px;background:var(--era);z-index:0}
.bu{position:relative;height:100%;min-height:0;display:grid;grid-template-columns:170px 150px minmax(0,1fr);
  border:2px solid var(--line);border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--era) 12%,#0f0d16);
  box-shadow:6px 6px 0 #000}
.ar.must .bu{border-color:color-mix(in srgb,var(--hot) 70%,transparent);
  background:linear-gradient(90deg,color-mix(in srgb,var(--era) 24%,#0f0d16),color-mix(in srgb,var(--era) 10%,#0f0d16) 60%)}
/* l'horaire, en diodes : le numero de l'arret, la date en or, les souvenirs */
.tm{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 16px;background:var(--led),var(--board);
  border-right:2px dashed rgba(255,253,247,.16);min-width:0}
.tm small{font-weight:800;font-size:17px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,253,247,.55);white-space:nowrap}
.tm b{font-weight:900;font-size:38px;line-height:.92;color:var(--hot);text-shadow:0 0 14px rgba(240,201,124,.4);white-space:nowrap}
.tm b.dm{font-size:31px} .tm b.dl{font-size:24px}
.tm .mem{align-self:flex-start;font-style:normal;font-weight:900;font-size:19px;line-height:1;padding:3px 7px 2px;border-radius:5px;
  border:2px solid color-mix(in srgb,var(--memory) 60%,transparent);background:color-mix(in srgb,var(--memory) 16%,transparent);
  color:var(--memory);white-space:nowrap}
.vis{position:relative;display:block;min-height:0;background:#16141f;border-right:2px solid var(--ink)}
.vis img,.vis .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.mks{position:absolute;left:6px;top:6px;display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.tx{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:8px 18px}
.tg{display:flex;align-items:center;gap:10px}
.b{display:inline-block;flex:none;background:var(--k);color:var(--ink);border:2px solid var(--ink);border-radius:6px;
  font-weight:800;font-size:17px;letter-spacing:.09em;text-transform:uppercase;line-height:1;padding:4px 8px 3px}
.ti{font-weight:900;font-size:33px;line-height:.98;text-transform:uppercase;letter-spacing:.01em;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ti.t2{font-size:29px} .ti.t3{font-size:25px}
.si{font-size:19px;font-weight:600;color:rgba(255,253,247,.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* les slides denses se resserrent d'un cran */
/* une slide clairsemee (les trois arrets d'Altair) prend des bulles plus
   hautes plutot qu'un grand vide au milieu */
.ln.n1 .ar,.ln.n2 .ar,.ln.n3 .ar,.ln.n4 .ar,.ln.n5 .ar,.ln.n6 .ar{max-height:150px}
.ln.n1 .ti,.ln.n2 .ti,.ln.n3 .ti,.ln.n4 .ti,.ln.n5 .ti,.ln.n6 .ti{font-size:38px}
.ln.n1 .tm b,.ln.n2 .tm b,.ln.n3 .tm b,.ln.n4 .tm b,.ln.n5 .tm b,.ln.n6 .tm b{font-size:44px}
.ln.n10,.ln.n11{gap:9px}
.ln.n10 .ti,.ln.n11 .ti{-webkit-line-clamp:1}
.ln.n10 .b,.ln.n11 .b{font-size:15px;padding:3px 7px 2px}
.ln.n10 .lvi,.ln.n11 .lvi{width:22px;height:22px}
.ln.n10 .tm,.ln.n11 .tm{gap:1px}
.ln.n10 .tm small,.ln.n11 .tm small{font-size:14px}
.ln.n10 .tm b,.ln.n11 .tm b{font-size:31px}
.ln.n10 .tm b.dm,.ln.n11 .tm b.dm{font-size:26px}
.ln.n10 .tm b.dl,.ln.n11 .tm b.dl{font-size:21px}
.ln.n10 .tm .mem,.ln.n11 .tm .mem{font-size:16px;padding:2px 6px 1px}
/* sur une slide dense, le badge passe sur la ligne du titre : trois lignes
   ne tiennent plus, et les sous-items sont ce qui distingue onze « Arrow » */
.ln.n10 .tx,.ln.n11 .tx{display:grid;grid-template-columns:auto minmax(0,1fr);align-content:center;align-items:center;
  column-gap:10px;row-gap:2px;padding:2px 18px}
.ln.n10 .si,.ln.n11 .si{grid-column:1/-1}
.ln.n10 .ti,.ln.n11 .ti{font-size:28px}
.ln.n10 .si,.ln.n11 .si{font-size:17px}

/* ---- le pied : le plan en miniature, le site, le rang ---- */
.foot{padding:26px 56px 34px;border-top:2px dashed rgba(255,253,247,.14);background:color-mix(in srgb,var(--ink) 88%,var(--era))}
.mtrack{position:relative;height:12px;margin:0 18px;border-radius:6px;background:var(--rest);box-shadow:0 0 0 3px var(--ink)}
.mfill{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:var(--uni)}
.mst{position:absolute;top:50%;width:24px;height:24px;transform:translate(-50%,-50%);border-radius:50%;
  background:var(--paper);border:4px solid var(--ink);box-shadow:0 0 0 2px var(--rest)}
.mst.v{background:var(--uni);border-color:var(--paper);box-shadow:0 0 0 2px var(--ink)}
.mst.cur{box-shadow:0 0 0 4px var(--hot)}
.mst.tm{border-radius:5px;width:26px;height:26px}
.mtrain{position:absolute;top:50%;z-index:2;width:50px;height:26px;transform:translate(-50%,-50%)}
.train{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 9px var(--hot))}
.train .body{fill:var(--hot);stroke:var(--ink);stroke-width:2.2}
.train .win{fill:var(--ink)}
.fl{margin-top:24px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:25px;
  letter-spacing:.16em;text-transform:uppercase;color:rgba(255,253,247,.62)}
.fl .pg b{color:var(--hot);font-weight:900}

/* ---- la couverture ---- */
.cov{padding:0 62px 54px;justify-content:center;align-items:center;text-align:center}
.filet{position:absolute;left:0;right:0;top:0;height:12px;background:${FILET};border-bottom:3px solid var(--paper)}
.cov .bg{position:absolute;inset:-30px;z-index:-2;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;
  filter:blur(4px) saturate(.85);opacity:.42}
.cov::before{content:"";position:absolute;inset:0;z-index:-1;
  background:radial-gradient(140% 90% at 50% 24%,rgba(13,11,18,.18) 0%,rgba(13,11,18,.8) 62%,var(--ink) 100%)}
.cov .tag{margin-top:30px;background:var(--paper);color:var(--ink);font-family:'Big Shoulders Display';
  font-weight:900;font-size:32px;letter-spacing:.14em;text-transform:uppercase;padding:7px 20px 4px;border-radius:7px;box-shadow:5px 5px 0 var(--ink)}
.cov h1{margin-top:18px;font-weight:900;line-height:.84;text-transform:uppercase;text-shadow:8px 8px 0 var(--ink);text-wrap:balance}
.vplan{position:relative;margin:34px auto 0;width:max-content;max-width:100%;text-align:left}
.vplan::before{content:"";position:absolute;left:calc(min(42px,calc(var(--pas) - 8px)) / 2);top:calc(var(--pas) / 2);bottom:calc(var(--pas) / 2);width:10px;
  margin-left:-5px;border-radius:5px;background:var(--rest);box-shadow:0 0 0 3px var(--ink)}
.vs{position:relative;display:flex;align-items:center;gap:20px;height:var(--pas)}
.vd{flex:none;position:relative;z-index:1;width:min(42px,calc(var(--pas) - 8px));aspect-ratio:1;border-radius:50%;background:var(--paper);border:min(7px,calc(var(--pas) / 7)) solid var(--ink);
  box-shadow:0 0 0 4px var(--era)}
.vd.cur{box-shadow:0 0 0 5px var(--hot),0 0 22px 5px color-mix(in srgb,var(--hot) 50%,transparent)}
.vs.tmn .vd{border-radius:9px;box-shadow:0 0 0 4px var(--rest)}
.vs b{font-weight:900;font-size:var(--corps);letter-spacing:.03em;text-transform:uppercase;line-height:1;text-shadow:3px 3px 0 var(--ink);white-space:nowrap}
.vs small{font-weight:800;font-size:calc(var(--corps) * .62);letter-spacing:.12em;text-transform:uppercase;color:var(--hot);white-space:nowrap}
.vs.tmn b{color:rgba(255,253,247,.7)}
.st{display:flex;margin-top:34px;background:var(--led),var(--board);border:3px solid var(--paper);border-radius:14px;
  overflow:hidden;box-shadow:8px 8px 0 var(--ink)}
.st div{padding:14px 32px;border-right:3px dashed rgba(255,253,247,.16)}
.st div:last-child{border-right:0}
.st b{display:block;font-weight:900;font-size:60px;line-height:.9;color:var(--hot);text-shadow:0 0 16px rgba(240,201,124,.45);white-space:nowrap}
.st span{display:block;margin-top:6px;font-family:Chivo;font-weight:700;font-size:18px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,253,247,.7)}
.lg{display:flex;justify-content:center;align-items:center;gap:32px;margin-top:30px;flex-wrap:wrap;font-weight:800;font-size:28px;
  letter-spacing:.12em;text-transform:uppercase;color:#e4e1ee}
.lg span{display:flex;align-items:center;gap:10px}
.lg .lvi{width:36px;height:36px}
.lg .mk{font-size:22px;padding:6px 11px 4px}
.cov .sw{position:absolute;right:56px;bottom:40px;font-family:'Big Shoulders Display';font-weight:800;font-size:24px;
  letter-spacing:.18em;text-transform:uppercase;color:rgba(255,253,247,.6)}
.cov .sw b{color:var(--hot)}
.cov .site{position:absolute;left:56px;bottom:40px;font-family:'Big Shoulders Display';font-weight:800;font-size:24px;
  letter-spacing:.18em;text-transform:uppercase;color:rgba(255,253,247,.6)}

/* ---- le terminus ---- */
.out{justify-content:center;align-items:center;text-align:center;padding:0 62px 60px}
.out::before{content:"";position:absolute;inset:0;z-index:-1;
  background:radial-gradient(110% 50% at 50% 0%,color-mix(in srgb,var(--uni) 34%,transparent),transparent 64%)}
.out .tmk{width:96px;height:96px;border-radius:20px;background:var(--uni);border:13px solid var(--ink);
  box-shadow:0 0 0 7px var(--paper),0 0 44px 10px color-mix(in srgb,var(--hot) 40%,transparent)}
.out .k{margin-top:38px;font-weight:800;font-size:34px;letter-spacing:.24em;text-transform:uppercase;color:var(--hot)}
.out h2{margin-top:12px;font-weight:900;font-size:110px;line-height:.86;text-transform:uppercase;text-shadow:7px 7px 0 #000;text-wrap:balance}
.tkt{--st:130px;display:flex;align-items:stretch;margin-top:54px;background:var(--paper);color:var(--ink);text-align:left;transform:rotate(-1.6deg);
  -webkit-mask:radial-gradient(circle 14px at var(--st) 0,#0000 98%,#000) top/100% 51% no-repeat,
    radial-gradient(circle 14px at var(--st) 100%,#0000 98%,#000) bottom/100% 51% no-repeat}
.tkt .stub{flex:0 0 var(--st);display:grid;place-items:center;background:var(--uni);border-right:4px dashed var(--ink);
  font-weight:900;font-size:46px}
.tkt .tx2{padding:22px 36px 24px 28px}
.tkt em{display:block;font-style:normal;font-weight:800;font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:#6b6480}
.tkt b{display:block;font-weight:900;font-size:68px;line-height:.95;text-transform:uppercase;margin:4px 0 8px}
.tkt span{display:block;font-family:Chivo;font-weight:600;font-size:24px;line-height:1.3;color:#3a3548;max-width:22ch}
.out .tail{margin-top:56px;font-weight:800;font-size:28px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,253,247,.55)}
.out .rail12{position:absolute;left:0;right:0;bottom:0;height:12px;background:${FILET};border-top:3px solid var(--paper)}
</style>

<section class="sl cov">
  ${cover ? `<img class="bg" src="${esc(cover)}" alt="">` : ''}
  <span class="filet"></span>
  <p class="tag">${esc(parcours)}</p>
  <h1 style="font-size:${nom.length > 22 ? 100 : nom.length > 14 ? 124 : 146}px">${esc(nom)}</h1>
  ${vplan}
  <div class="st">
    <div><b>${total}</b><span>${esc(t.stops)}</span></div>
    <div><b>${ST.length}</b><span>${esc(t.stations)}</span></div>
    <div><b>0</b><span>${esc(t.spoil)}</span></div>
  </div>
  ${legende.length ? `<div class="lg">${legende.join('')}</div>` : ''}
  <span class="site">chronologeek.app</span>
  <span class="sw">${esc(t.swipe)} <b>→</b></span>
</section>
${corps}
<section class="sl out">
  <span class="tmk"></span>
  <p class="k">${esc(t.fin)}</p>
  <h2>${esc(t.fin1)}</h2>
  <div class="tkt"><span class="stub">${esc(U.code)}</span><div class="tx2"><em>${esc(t.prochain)}</em><b>chronologeek.app</b><span>${esc(t.fin2)}</span></div></div>
  <p class="tail">${esc(t.fin3(...decompte()))}</p>
  <span class="rail12"></span>
</section>`;
}

/* ---------- sortie ---------- */

async function main() {
  const args = process.argv.slice(2);
  const cle = args.find(a => !a.startsWith('--') && UNIVERS[a]);
  const lang = (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en') === 'fr' ? 'fr' : 'en';
  const max = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : 11;

  if (!cle) {
    console.error('usage : node _proto/carrousel.mjs <' + Object.keys(UNIVERS).join('|') + '> [--lang en|fr] [--max 11]');
    process.exit(1);
  }

  const fichier = UNIVERS[cle].data + (lang === 'en' ? '-en' : '');
  const { D, CG } = charge(fichier);
  const decoupage = decoupe(D, max);
  if (!decoupage.total) throw new Error(`aucune entree lue dans ${fichier}.js`);

  const html = page(cle, D, CG, decoupage, lang);
  const sortie = path.join(RACINE, 'promo', `carrousel-${cle}-${lang}`);
  fs.mkdirSync(sortie, { recursive: true });
  /* les images d'un passage precedent partent : une ere de moins laisserait
     sinon une 17e slide d'avant au bout du carrousel */
  for (const f of fs.readdirSync(sortie)) if (/^\d+\.png$/.test(f)) fs.rmSync(path.join(sortie, f));
  fs.writeFileSync(path.join(sortie, '_apercu.html'), html, 'utf8');

  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.join(sortie, '_apercu.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 30000 });
  /* la voie part du premier arret : sa hauteur se mesure, elle depend du
     nombre d'arrets que la slide porte */
  await p.evaluate(() => document.querySelectorAll('.ln:not(.av)').forEach(ul => {
    const a = ul.querySelector('.ar');
    if (a) ul.style.setProperty('--haut', (a.offsetTop + a.offsetHeight / 2) + 'px');
  }));
  await p.evaluate(() => document.querySelectorAll('.ln:not(.ap)').forEach(ul => {
    const a = [...ul.querySelectorAll('.ar')].pop();
    if (a) ul.style.setProperty('--bas', (ul.offsetHeight - a.offsetTop - a.offsetHeight / 2) + 'px');
  }));

  const cadres = await p.$$('.sl');
  for (let i = 0; i < cadres.length; i++) {
    await cadres[i].screenshot({ path: path.join(sortie, String(i + 1).padStart(2, '0') + '.png') });
  }
  await nav.close();

  const mortes = html.match(/src="file:\/\/\/([^"]+)"/g)?.filter(m => {
    const f = decodeURIComponent(m.slice(13, -1));
    return !fs.existsSync(f);
  }) || [];
  if (mortes.length) console.warn('  ⚠ ' + mortes.length + ' visuel(s) introuvable(s)');

  console.log(`${cle}/${lang} — ${cadres.length} images, ${decoupage.total} œuvres, ${decoupage.slides.length} slides d'ère`);
  if (cadres.length > 20) console.warn('  ⚠ au-dela de 20 images : Instagram coupe le carrousel (--max plus grand)');
  console.log(`→ ${path.relative(RACINE, sortie).replace(/\\/g, '/')}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
