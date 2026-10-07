/* Videos verticales 1080x1920 (TikTok, Reels, Shorts) produites depuis les donnees.
   node _proto/video.mjs <univers> [--lang en|fr] [--dur 0.62 | --total 60] [--only must|must+] [--types jeu,dlc] [--ere N] [--sans N,N] [--plus id,id] [--titre "..."] [--cadre 0%] [--couv img]

   --cadre cale la couverture de l'accroche (object-position horizontal) : la
   bannière DC montre l'Arrowverse à gauche et le DCEU à droite, et une vidéo
   Arrowverse se cadre à 0 %.

   --couv remplace cette couverture, chemin depuis la racine ou URL : le DCU
   n'est nulle part sur la bannière DC, et aucun cadrage ne le rattrape.

   --titre remplace le nom de l'univers a l'accroche, en tete de carte et a la fin :
   une video DC sans les origines ne montre plus le « Multiverse Guide » entier,
   elle montre « Arrowverse, DCEU & DCU ».

   --types ne garde que ces types de la donnee (`jeu,dlc` : les jeux d'Assassin's
   Creed sans les romans, comics et videos). C'est une selection, comme --only :
   le rang de la page reste, et l'accroche dit ce qu'on montre.

   --plus tire une entree hors du filtre et la met au rang des essentiels : Rogue One
   est "important" dans les donnees, et le site n'a pas a changer pour une video.

   Une oeuvre par carte, coupe nette : pas de defilement. C'est le choix de Niko
   du 6 septembre 2026 — une timeline qui glisse est vite penible a regarder, la
   coupe donne le rythme. Consequence technique : rien n'est anime, donc rien
   n'est capture image par image. On rend une PNG par carte et ffmpeg les tient
   chacune sa duree. Une video de 42 s coute 64 captures, pas 1 260.

   L'anglais est la langue par defaut : le compte vise l'international, et le
   site dit lui-meme qu'il existe en francais.

   Depuis le 29 septembre 2026, la DA est celle du plan de metro : l'accroche
   montre la ligne entiere en plan vertical, chaque ere ouvre sur sa plaque de
   station (PLAQUE, 1 s, comptee dans --total), chaque oeuvre est un arret avec
   son horaire en diodes, et la fin est le terminus. Code de ligne, encres
   d'ere (`--eraN`) et de type (`--t-*`) sont relus dans la page de l'univers. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

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

const TYPES = {
  film:['#64b5f6','FILM','FILM'], filmanim:['#90caf9','FILM ANIMÉ','ANIMATED FILM'],
  serie:['#81c784','SÉRIE','SERIES'], anime:['#ce93d8','SÉRIE ANIMÉE','ANIMATED SERIES'],
  jeu:['#ffb74d','JEU','GAME'], dlc:['#ffb74d','DLC','DLC'],
  special:['#ffa726','SPÉCIAL','SPECIAL'], video:['#f472b6','VIDÉO','VIDEO'],
  livre:['#c5a880','ROMAN','NOVEL'], comic:['#c5a880','COMIC','COMIC'],
  /* "roman" et "short" : les ecritures de Jurassic World et d'autres donnees ;
     sans elles la video anglaise affichait "ROMAN" en francais */
  roman:['#c5a880','ROMAN','NOVEL'], short:['#f472b6','COURT MÉTRAGE','SHORT FILM'],
  audio:['#80cbc4','AUDIO','AUDIO'],
};

const T = {
  en: { ordre:'IN ORDER', hookSub:'no spoilers', entries:'entries', eras:'eras', ere1:'era',
        essentiels:'THE ESSENTIALS', essentielsN:'essentials', importants:'THE IMPORTANTS', total:'in total',
        premiere:'FIRST WATCH ORDER', premiereJeu:'FIRST PLAYTHROUGH', essentiel:'Essential', important:'Important',
        outro1:'The full order', outro2:'free, no account',
        station:'Station', stop:'Stop', stops:'stops', stations:'stations', spoil:'spoilers',
        souvenirs:'Memories', terminus:'Terminus', fin:'End of the line', prochain:'Next departure',
        outro3:(u, n) => `${u} universes · ${n.toLocaleString('en-US')} entries · EN + FR`,
        cta:'chronologeek.app' },
  fr: { ordre:"DANS L'ORDRE", hookSub:'sans spoil', entries:'œuvres', eras:'ères', ere1:'ère',
        essentiels:'LES ESSENTIELS', essentielsN:'essentiels', importants:'LES IMPORTANTS', total:'au total',
        premiere:'PREMIÈRE VISION', premiereJeu:'PREMIÈRE PARTIE', essentiel:'Essentiel', important:'Important',
        outro1:"L'ordre complet", outro2:'gratuit, sans compte',
        station:'Station', stop:'Arrêt', stops:'arrêts', stations:'stations', spoil:'spoiler',
        souvenirs:'Souvenirs', terminus:'Terminus', fin:'Fin de la ligne', prochain:'Prochain départ',
        outro3:(u, n) => `${u} univers · ${n.toLocaleString('fr-FR').replace(/\s/g, ' ')} œuvres · FR + EN`,
        cta:'chronologeek.app' },
};

/* Le decompte de fin se lit dans l'index de la recherche, que la publication
   produit depuis les memes donnees : ecrit en dur, il annoncait encore
   "9 universes · 1,463 entries" le jour ou Jurassic World en faisait dix. */
function decompte() {
  const idx = JSON.parse(fs.readFileSync(path.join(RACINE, 'search-en.json'), 'utf8'));
  return [Object.keys(UNIVERS).length, idx.e.length];
}

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const decode = s => String(s ?? '').replace(/&#x27;/g,"'").replace(/&#39;/g,"'")
  .replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

const visuel = src => {
  if (!src) return '';
  const s = String(src);
  if (/^https?:\/\//i.test(s)) return s;
  return 'file:///' + path.join(RACINE, s.replace(/^\//,'')).replace(/\\/g,'/');
};

function charge(fichier) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ICI, fichier + '.js'), 'utf8'), ctx);
  const D = [...Object.values(ctx.window), ...Object.values(ctx)]
    .find(v => v && typeof v === 'object' && Array.isArray(v.eras));
  if (!D) throw new Error(`aucun objet avec "eras" dans ${fichier}.js`);
  /* CG porte les libelles de type de la page (badgeLabels) : la video les
     reprend plutot que de tenir les siens */
  return { D, CG: ctx.window.CG || ctx.CG || null };
}

function couverture(cle) {
  for (const n of [UNIVERS[cle].cover, cle]) {
    for (const ext of ['.webp','.png','.jpg']) {
      const p = path.join(RACINE, 'images', n + ext);
      if (fs.existsSync(p)) return 'file:///' + p.replace(/\\/g,'/');
    }
  }
  return '';
}

/* ---------- selection ---------- */

/* Le niveau intermediaire s'ecrit de deux facons : "important" chez huit
   univers, "imp" chez DC — c'est la valeur qui change, pas le champ, et
   CLAUDE.md le dit. N'accepter que la premiere laissait les 118 entrees de DC
   sans triangle, et `--only must+` rendait zero carte chez lui : rien ne
   cassait, DC n'ayant aucun essentiel pour le faire remarquer. */
const IMPORTANT = new Set(['important', 'imp']);

function suite(D, opts) {
  const out = [];
  let rang = 0;
  D.eras.forEach((ere, i) => {
    for (const e of (ere.entries || [])) {
      if (!e || !e.title || e.type === 'separator') continue;
      rang++;
      if (opts.ere != null && i !== opts.ere) continue;
      if (opts.sans && opts.sans.has(i)) continue;
      if (opts.types && !opts.types.has(e.type)) continue;
      const niveau = e.level || e.imp || '';
      const force = opts.plus && opts.plus.has(e.id);
      if (!force && opts.only === 'must' && niveau !== 'must') continue;
      if (!force && opts.only === 'must+' && niveau !== 'must' && !IMPORTANT.has(niveau)) continue;
      /* une entree tiree par --plus est mise au rang des essentiels : sans ca elle
         sortirait sans etoile ni bordure au milieu de cartes qui les portent. */
      out.push({ ...e, rang, ereI: i, ere: ere.title || '', must: niveau === 'must' || !!force,
        imp: IMPORTANT.has(niveau) && !force,
        flashback: (e.tags || []).includes('flashback'),
        flashforward: (e.tags || []).includes('flashforward') });
    }
  });
  return out;
}

/* ---------- rendu ---------- */

/* l'accroche et la fin tiennent plus longtemps : on y lit une adresse */
const ACCROCHE = 3.0, FIN = 3.4;
/* la plaque de station se lit en un regard — un nom et un decompte — mais
   elle doit tenir plus qu'un arret : c'est elle qui dit qu'on change d'ere */
const PLAQUE = 1.0;

/* Les episodes d'une entree, en une ligne qui se lit en moins d'une seconde.
   Sans eux, six cartes "The Clone Wars" se suivent sans qu'on comprenne
   pourquoi la serie est coupee. `subitems` les liste un par un, dans l'ordre de
   visionnage et pas dans l'ordre de diffusion : "Season 2 Episode 17" peut
   preceder "Season 2 Episode 4". On resserre donc sans jamais trier — les
   episodes qui se suivent deviennent une plage, et la saison ne se repete pas
   tant qu'elle ne change pas : "S1 E11-12, 15, 19-21 · S2 E1-3, 17-19, 4-8".
   Ce qui n'est pas un episode seul ("Season 1", "Season 2 Episodes 1-6") passe
   tel quel, raccourci en S/E. Les " " de la donnee separent des arcs, pas des
   episodes : ils ne comptent pas. */
const EP_RE = /^(?:season|saison)\s+(\d+)\s+(?:episode|épisode)\s+(\d+)$/i;
function episodes(subitems, lang) {
  const items = (subitems || []).map(s => decode(s).trim()).filter(Boolean);
  if (!items.length) return null;
  const morceaux = [];   // [{s, plages:[[a,b]]}] ou {brut}
  let seuls = 0;
  for (const it of items) {
    const m = it.match(EP_RE);
    if (!m) {
      /* une parenthese qui enumere des titres ("Shorts 1-4 (The Machine in the
         Ghost, Art Attack, …)") ne se lit pas en une seconde : elle tombe. Celle
         qui nomme un arc ou un repere ("(Stealth Strike)", "(epilogue ~17 BBY)")
         reste. */
      morceaux.push({ brut: it
        .replace(/\s*\([^)]*,[^)]*\)/g, '')
        .replace(/\b(?:season|saison)\s+(\d+)\s+(?:episodes?|épisodes?)\s+/gi, 'S$1 E')
        .replace(/\b(?:season|saison)\s+(\d+)/gi, 'S$1')
        .replace(/(\d)-(?=\d)/g, '$1–') });
      continue;
    }
    seuls++;
    const s = +m[1], e = +m[2];
    const der = morceaux[morceaux.length - 1];
    if (der && der.s === s) {
      const p = der.plages[der.plages.length - 1];
      if (e === p[1] + 1) p[1] = e; else der.plages.push([e, e]);
    } else morceaux.push({ s, plages: [[e, e]] });
  }
  const txt = morceaux.map(m => m.brut ?? `S${m.s} E` +
    m.plages.map(([a, b]) => a === b ? a : `${a}–${b}`).join(', ')).join('  ·  ')
    /* la ligne ne se coupe qu'aux virgules et aux points : "S3 E5–" puis "7" a
       la ligne suivante se lisait comme deux plages. Espace insecable dans
       "S3 E5", gluon apres le tiret, que Chrome tient sinon pour une coupure. */
    .replace(/\b(S\d+) (E)/g, '$1 $2').replace(/–/g, '–⁠');
  /* le decompte n'a de sens que si chaque ligne est un episode : "Season 1"
     n'en dit pas le nombre */
  const n = seuls === items.length ? seuls : null;
  return { txt, n, tete: n ? `${n} ${lang === 'en' ? (n > 1 ? 'episodes' : 'episode') : (n > 1 ? 'épisodes' : 'épisode')}` : null };
}

/* La carte d'ouverture doit dire ce que la video montre, pas ce que la page
   contient : "62 entries" au-dessus de dix cartes est un mensonge, et c'est la
   premiere image que le spectateur voit. Une selection remplace donc "IN ORDER"
   par son nom et met le total de la page en seconde mesure. */
function ouverture(D, cartes, lang, total, sel) {
  const t = T[lang];
  /* un univers a deux parcours ne peut montrer que l'un des deux : la video suit
     `eras`, la decouverte, et le dit — "in order" seul laisserait croire a la
     chronologie du monde, qui est l'autre parcours. */
  const eres = new Set(cartes.map(c => c.ere)).size;
  if (!sel) return {
    ord: D.erasReplay ? t.premiereJeu : D.erasRewatch ? t.premiere : t.ordre,
    /* --sans retire des eres : la video complete ne montre alors plus toute la
       page, et l'accroche compte ce qui passe a l'ecran, pas ce que la page porte.
       Une branche seule n'en laisse qu'une, et "1 eras" se lit a l'accroche. */
    st: [[cartes.length, t.stops], [eres, eres === 1 ? t.station : t.stations], ['0', t.spoil]],
  };
  return {
    ord: sel.nom,
    st: [[cartes.length, sel.unite], [total, t.total], ['0', t.spoil]],
  };
}

/* ---------- rendu : le plan de metro ---------- */

/* La DA des pages depuis le 28 septembre 2026 : une timeline est une ligne,
   une ere une station, une oeuvre un arret. La video reprend le meme
   dessin — plaque de station a l'image de l'ere, horaire en diodes, train
   dore — pour qu'on reconnaisse la page en y arrivant. Rien n'y bouge pour
   autant : c'est toujours une PNG par plan et une coupe nette. */

/* le train des pages (TRAIN de en-assassinscreed.html), sans son onde */
const TRAIN = '<svg class="train" viewBox="0 0 38 20" aria-hidden="true">' +
  '<rect class="body" x="1" y="1" width="36" height="18" rx="8"/>' +
  '<rect class="win" x="8" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="16.5" y="6" width="5" height="5" rx="1"/>' +
  '<rect class="win" x="25" y="6" width="5" height="5" rx="1"/></svg>';

/* les deux signes de niveau des pages (LVICO), trait compris */
const ETOILE = '<svg class="lvi must" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.1 1.1 5.9-5.2-2.8-5.2 2.8 1.1-5.9L3.6 9.8l5.9-.8z"/></svg>';
const TRIANGLE = '<svg class="lvi imp" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 3.8 2.6 20.2h18.8z"/><path d="M12 9.6v4.2M12 16.9h.01"/></svg>';

/* le filet aux douze encres du pied de page et des barres du bas */
const DOUZE = ['#4d9fff','#e23636','#f5c842','#7dd3fc','#b48cf2','#a8bf4f',
               '#e07b39','#d4a02c','#2dd4bf','#45c46b','#b0bec5','#dc0000'];
const FILET = 'linear-gradient(90deg,' + DOUZE.map((c, i) =>
  `${c} ${(i * 100 / 12).toFixed(2)}% ${((i + 1) * 100 / 12).toFixed(2)}%`).join(',') + ')';

/* Les encres de la page : `--eraN` des plaques et `--t-<type>` des badges
   sont ecrites dans son CSS, et nulle part ailleurs. Les relire evite une
   troisieme copie de la charte qui divergerait au premier changement —
   Assassin's Creed est passe du rouge a l'or le 24 septembre. */
function encresPage(cle) {
  const f = path.join(ICI, UNIVERS[cle].page + '.html');
  const css = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  const eres = {}, types = {};
  for (const m of css.matchAll(/--era(\d+):\s*(#[0-9a-f]{3,8})/gi)) eres[m[1]] ??= m[2];
  for (const m of css.matchAll(/--t-([a-z]+):\s*(#[0-9a-f]{3,8})/gi)) types[m[1]] ??= m[2];
  return { eres, types };
}

/* Les stations de la video : les eres qui ont au moins une carte, dans
   l'ordre, avec leur rang dans la page et le nombre de cartes qu'elles
   portent. Une selection (--only, --ere) n'a donc que ses propres stations. */
function stations(D, cartes) {
  const out = [];
  cartes.forEach((c, i) => {
    const der = out[out.length - 1];
    if (der && der.i === c.ereI) { der.n++; return; }
    out.push({ i: c.ereI, ere: D.eras[c.ereI], debut: i, n: 1 });
  });
  return out;
}

/* L'echelle mixte des pages (ech() de en-startrek.html) : la moitie de la
   ligne a parts egales entre stations, l'autre au prorata des arrets. Au
   seul prorata, les trois arrets d'Altair tiennent dans les 3 % de gauche
   et sa station colle au depart. */
function echelle(st, total) {
  const S = st.length;
  return (k, j) => {
    const n = st[k].n;
    return 0.5 * (k + j / n) / S + 0.5 * (st[k].debut + j) / total;
  };
}

function page(cle, D, CG, cartes, lang, total, sel, titre, cadre, couv) {
  const t = T[lang];
  const U = UNIVERS[cle];
  const encre = U.encre;
  const nom = titre || decode(D.title || cle);
  const ouv = ouverture(D, cartes, lang, total, sel);
  const { eres: inkEre, types: inkType } = encresPage(cle);
  const cover = couv ? (/^https?:/.test(couv)
    ? couv
    : 'file:///' + path.resolve(RACINE, couv).replace(/\\/g,'/')) : couverture(cle);
  /* Dragon Age se rejoue (#replay), il ne se revoit pas : la page le dit, la video aussi */
  const parcours = D.erasReplay ? t.premiereJeu : D.erasRewatch ? t.premiere : t.ordre;
  const ST = stations(D, cartes);
  const X = echelle(ST, cartes.length);
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
    : `${t.station} ${ST.indexOf(s) + 1} / ${ST.length}`;
  const arrets = n => `${n} ${n > 1 ? t.stops : t.stop}`;

  const typeDe = e => {
    const [bt, fr, en] = TYPES[e.type] || ['#8f8fa8', String(e.type||'').toUpperCase(), String(e.type||'').toUpperCase()];
    const lib = CG && CG.badgeLabels && CG.badgeLabels[e.type] && CG.badgeLabels[e.type][1];
    return { k: inkType[e.type] || bt, lib: lib || (lang === 'en' ? en : fr) };
  };

  /* le plan en miniature, celui de la barre du bas des pages : une station
     par ere, le parcouru jusqu'au train, le terminus en carre. `pos` va de
     0 a 1 ; `cur` est le rang de la station ou l'on est. */
  const plan = (pos, cur, legende) => `<div class="mini">
      <div class="mtrack"><i class="mfill" style="width:${(pos * 100).toFixed(2)}%"></i>
        ${ST.map((s, k) => {
          const x = X(k, 0);
          return `<span class="mst${x <= pos + 1e-6 ? ' v' : ''}${k === cur ? ' cur' : ''}" style="left:${(x * 100).toFixed(2)}%"></span>`;
        }).join('')}
        <span class="mst tm${pos >= 1 ? ' v' : ''}" style="left:100%"></span>
        <span class="mtrain" style="left:${(pos * 100).toFixed(2)}%">${TRAIN}</span>
      </div>
      ${legende ? `<p class="mlab">${legende}</p>` : ''}
    </div>`;

  const oeil = `<p class="eye"><span class="code">${esc(U.code)}</span>${esc(nom)} · ${esc(parcours)}</p>`;

  /* ---- la plaque de station : une par ere, l'image en plein ecran ---- */
  const plaque = (s, k) => `<section class="f plate" style="--era:${encreEre(s)}">
      ${artEre(s) ? `<img class="pbg" src="${esc(artEre(s))}" alt="">` : ''}
      ${oeil}
      <div class="pbody">
        <div class="prail"><span class="pdot${k === 0 ? '' : ' v'}"></span></div>
        <div class="ptxt">
          <p class="pk"><span class="code">${esc(U.code)}</span>${esc(rangEre(s))}</p>
          <h2 class="${nomEre(s).length > 22 ? 'n3' : nomEre(s).length > 14 ? 'n2' : ''}">${esc(nomEre(s))}</h2>
          <p class="pm"><b>${s.n}</b> ${esc(s.n > 1 ? t.stops : t.stop)}</p>
        </div>
      </div>
      ${plan(X(k, 0), k, `<b>${esc(t.station)} ${k + 1}</b> / ${ST.length}`)}
      <p class="url">${esc(t.cta)}</p>
    </section>`;

  /* ---- l'arret : une oeuvre ---- */
  const carte = (e, i) => {
    const k = ST.findIndex(s => s.i === e.ereI);
    const s = ST[k];
    const ty = typeDe(e);
    const titreE = decode(e.title);
    const taille = titreE.length > 40 ? 't3' : titreE.length > 24 ? 't2' : '';
    const ep = episodes(e.subitems, lang);
    /* l'horaire des pages : la date en or ; chez Assassin's Creed le present
       en or et les souvenirs dans leur cadre rouge, dessous. Sans present,
       rien ne s'ecrit a sa place — un tiret se lirait comme un manque. */
    const grand = e.present ? decode(e.present) : e.date ? decode(e.date) : '';
    const souvenir = e.present && e.date ? decode(e.date) : '';
    const marques = [
      e.flashback && `<span class="mk" style="--k:#f0c97c">FLASHBACK</span>`,
      e.flashforward && `<span class="mk" style="--k:#8fd6c4">FLASHFORWARD</span>`,
    ].filter(Boolean).join('');
    return `<section class="f card" style="--era:${encreEre(s)}">
      ${oeil}
      <div class="stop"><div class="row">
        <div class="rail"><span class="dot"></span></div>
        <div class="bulle">
          <div class="vis">
            ${e.img ? `<img src="${esc(visuel(e.img))}" alt="">` : '<div class="ph"></div>'}
            ${marques ? `<div class="mks">${marques}</div>` : ''}
          </div>
          <div class="time">
            <div class="tn"><small>${esc(t.stop)}</small><b>${String(e.rang).padStart(2,'0')}</b></div>
            ${grand ? `<p class="d${grand.length > 11 ? ' dl' : ''}">${esc(grand)}</p>` : '<p class="d"></p>'}
            ${souvenir ? `<p class="mem"><small>${esc(t.souvenirs)}</small><b>${esc(souvenir)}</b></p>` : ''}
          </div>
          <div class="txt">
            <p class="tags"><span class="b" style="--k:${ty.k}">${esc(ty.lib)}</span>${e.must ? ETOILE : ''}${e.imp ? TRIANGLE : ''}<span class="sn">${esc(nomEre(s))}</span></p>
            <h2 class="${taille}">${esc(titreE)}</h2>
            ${ep ? `<div class="eps${ep.txt.length > 150 ? ' e3' : ep.txt.length > 80 ? ' e2' : ''}">` +
              `${ep.tete ? `<b>${esc(ep.tete)}</b>` : ''}<p>${esc(ep.txt)}</p></div>` : ''}
          </div>
        </div>
      </div></div>
      ${plan(X(k, i - s.debut), k, `<b>${esc(t.stop)} ${i + 1}</b> / ${cartes.length}`)}
      <p class="url">${esc(t.cta)}</p>
    </section>`;
  };

  /* la legende des signes, et seulement de ceux que la video montre */
  const legende = [
    cartes.some(c => c.must) && `<span>${ETOILE}${esc(t.essentiel)}</span>`,
    cartes.some(c => c.imp) && `<span>${TRIANGLE}${esc(t.important)}</span>`,
    cartes.some(c => c.flashback) && `<span><i class="mk" style="--k:#f0c97c">FLASHBACK</i></span>`,
    cartes.some(c => c.flashforward) && `<span><i class="mk" style="--k:#8fd6c4">FLASHFORWARD</i></span>`,
  ].filter(Boolean);

  /* le plan vertical de l'accroche : toute la ligne d'un coup d'oeil, avant
     d'y monter. Le pas se resserre avec le nombre de stations — sept chez
     Assassin's Creed, quatorze chez The Walking Dead. */
  const pas = Math.min(96, Math.floor(690 / ST.length));
  const corps = Math.min(46, Math.round(pas * 0.5));
  const vplan = `<div class="vplan" style="--pas:${pas}px;--corps:${corps}px">
      ${ST.map((s, k) => `<div class="vs" style="--era:${encreEre(s)}"><span class="vd${k === 0 ? ' cur' : ''}"></span>` +
        `<b>${esc(nomEre(s))}</b><small>${esc(arrets(s.n))}</small></div>`).join('')}
      <div class="vs tm"><span class="vd"></span><b>${esc(t.terminus)}</b></div>
    </div>`;

  const suite = [];
  cartes.forEach((c, i) => {
    const k = ST.findIndex(s => s.i === c.ereI);
    if (ST[k].debut === i) suite.push(plaque(ST[k], k));
    suite.push(carte(c, i));
  });

  const police = n => 'file:///' + path.join(RACINE, 'fonts', n).replace(/\\/g,'/');
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
:root{--ink:#0d0b12;--paper:#fffdf7;--line:rgba(255,253,247,.26);--hot:#f0c97c;--uni:${encre};
  --rest:color-mix(in srgb,var(--uni) 26%,#1c1a26);--board:#07060b;--memory:#e2515f;
  --led:radial-gradient(rgba(255,253,247,.07) 1.6px,transparent 2.2px) 0 0/7px 7px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Chivo,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.disp,h1,h2,.eye,.code,.b,.mk,.url,.mlab,.tn,.d,.mem,.pk,.pm,.vs,.st,.lg,.tk{font-family:'Big Shoulders Display',sans-serif}
.f{position:relative;isolation:isolate;width:1080px;height:1920px;overflow:hidden;background:var(--ink);color:var(--paper);
   display:flex;flex-direction:column;--era:var(--uni)}
/* rien ne se tasse : un tableau ecrase perdait ses libelles sans un mot */
.f>*{flex-shrink:0}
.f::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:radial-gradient(120% 42% at 50% 0%,color-mix(in srgb,var(--era) 42%,transparent),transparent 62%)}

/* le haut et le bas de l'ecran appartiennent a l'application : l'en-tete
   de TikTok couvre environ 130 px, la legende, les boutons et le nom du
   compte environ 300. Rien de lisible n'y descend. */
.card,.plate{padding:140px 56px 300px}
/* au-dessus de la voie : sur les plaques elle monte jusqu'a la pastille et la coupait */
.eye{position:relative;z-index:3;display:flex;align-items:center;gap:16px;font-weight:800;font-size:31px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,253,247,.66);white-space:nowrap;overflow:hidden}
.code{display:inline-grid;place-items:center;flex:none;background:var(--uni);color:var(--ink);border:3px solid var(--ink);
  border-radius:9px;padding:3px 13px 1px;font-weight:900;font-size:32px;letter-spacing:.04em;line-height:1.1;
  box-shadow:0 0 0 2px var(--paper)}

/* ---- l'arret ---- */
/* l'arret se centre dans la place qui reste ; la ligne court au-dela de la
   bulle jusqu'aux bords de cette place, et s'y coupe (overflow) */
.stop{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:center;overflow:hidden;
  margin-top:26px;--dy:626px}
.row{display:grid;grid-template-columns:84px minmax(0,1fr);column-gap:22px;padding:0 12px 12px 0}
.rail{position:relative}
.rail::before{content:"";position:absolute;left:50%;top:-1600px;bottom:-1600px;width:14px;margin-left:-7px;border-radius:7px;
  background:linear-gradient(var(--uni) 0 calc(1600px + var(--dy)),var(--rest) calc(1600px + var(--dy)))}
.dot{position:absolute;left:50%;top:var(--dy);width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;
  background:var(--uni);border:6px solid var(--paper);box-shadow:0 0 0 6px var(--ink),0 0 34px 8px color-mix(in srgb,var(--hot) 55%,transparent)}
.rail::after{content:"";position:absolute;top:var(--dy);left:calc(50% + 30px);right:-22px;height:10px;margin-top:-5px;background:var(--uni)}
.bulle{border:3px solid var(--line);border-radius:22px;overflow:hidden;align-self:start;
  background:color-mix(in srgb,var(--era) 16%,#0f0d16);box-shadow:10px 10px 0 #000}
.vis{position:relative;aspect-ratio:16/10;background:#16141f;border-bottom:3px solid var(--ink)}
.vis img{width:100%;height:100%;object-fit:cover;display:block}
.vis .ph{width:100%;height:100%;background:#16141f}
.mks{position:absolute;left:22px;top:22px;display:flex;gap:12px}
.mk{font-style:normal;display:inline-block;background:var(--k);color:var(--ink);border:3px solid var(--ink);border-radius:9px;
  font-weight:900;font-size:38px;letter-spacing:.1em;line-height:1;padding:10px 18px 7px;box-shadow:0 6px 22px #000a}
/* l'horaire, en diodes : le numero de l'arret, la date en or, les souvenirs */
.time{height:150px;display:flex;align-items:center;gap:30px;padding:0 34px;background:var(--led),var(--board);
  border-bottom:3px dashed rgba(255,253,247,.16)}
.tn{display:flex;flex-direction:column;align-items:center;padding-right:30px;border-right:3px dashed rgba(255,253,247,.16)}
.tn small{font-weight:800;font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,253,247,.55)}
.tn b{font-weight:900;font-size:62px;line-height:.9;font-variant-numeric:tabular-nums}
.d{flex:1;font-weight:900;font-size:84px;line-height:.9;color:var(--hot);text-shadow:0 0 22px rgba(240,201,124,.45);white-space:nowrap}
.d.dl{font-size:62px}
.mem{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 18px 9px;border-radius:10px;
  border:2px solid color-mix(in srgb,var(--memory) 60%,transparent);background:color-mix(in srgb,var(--memory) 16%,transparent);color:var(--memory)}
.mem small{font-weight:800;font-size:20px;letter-spacing:.16em;text-transform:uppercase}
.mem b{font-weight:900;font-size:44px;line-height:1;white-space:nowrap}
.txt{padding:30px 34px 38px}
.tags{display:flex;align-items:center;gap:14px;margin-bottom:18px;min-width:0}
.b{display:inline-block;flex:none;background:var(--k);color:var(--ink);border:3px solid var(--ink);border-radius:9px;
  box-shadow:0 0 0 2px color-mix(in srgb,var(--k) 40%,transparent);
  font-weight:800;font-size:32px;letter-spacing:.09em;text-transform:uppercase;line-height:1;padding:8px 14px 6px}
.lvi{width:50px;height:50px;flex:none;fill:none;stroke-width:2;stroke-linejoin:miter;stroke-linecap:square}
.lvi.must{stroke:var(--hot);fill:color-mix(in srgb,var(--hot) 30%,transparent)}
.lvi.imp{stroke:#ff9d5c}
.sn{margin-left:auto;font-family:'Big Shoulders Display';font-weight:800;font-size:28px;letter-spacing:.12em;
  text-transform:uppercase;color:color-mix(in srgb,var(--era) 45%,var(--paper));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.txt h2{font-weight:900;font-size:112px;line-height:.92;text-transform:uppercase;text-wrap:balance;text-shadow:5px 5px 0 var(--ink)}
.txt h2.t2{font-size:94px} .txt h2.t3{font-size:76px;line-height:.96}
.eps{margin-top:24px;padding-top:20px;border-top:3px dashed rgba(255,253,247,.16);
  font-family:'Big Shoulders Display';font-weight:800;font-size:44px;line-height:1.2;letter-spacing:.03em;color:#e4e1ee}
.eps p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
.eps.e2{font-size:39px} .eps.e3{font-size:35px}
.eps b{display:block;font-weight:900;font-size:28px;letter-spacing:.14em;text-transform:uppercase;color:var(--hot);margin-bottom:6px}

/* ---- le plan en miniature, en bas ---- */
.mini{flex:none;margin-top:34px;padding:0 36px}
.mtrack{position:relative;height:16px;border-radius:8px;background:var(--rest);box-shadow:0 0 0 4px var(--ink)}
.mfill{position:absolute;left:0;top:0;bottom:0;border-radius:8px;background:var(--uni)}
.mst{position:absolute;top:50%;width:32px;height:32px;transform:translate(-50%,-50%);border-radius:50%;
  background:var(--paper);border:5px solid var(--ink);box-shadow:0 0 0 3px var(--rest)}
.mst.v{background:var(--uni);border-color:var(--paper);box-shadow:0 0 0 3px var(--ink)}
.mst.cur{box-shadow:0 0 0 5px var(--hot)}
.mst.tm{border-radius:7px;width:36px;height:36px}
.mtrain{position:absolute;top:50%;z-index:2;width:66px;height:34px;transform:translate(-50%,-50%)}
.train{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 12px var(--hot))}
.train .body{fill:var(--hot);stroke:var(--ink);stroke-width:2.2}
.train .win{fill:var(--ink)}
.mlab{margin-top:34px;text-align:right;font-weight:800;font-size:30px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,253,247,.6)}
.mlab b{color:var(--hot);font-weight:900}
.url{margin-top:14px;text-align:center;font-weight:800;font-size:38px;letter-spacing:.19em;text-transform:uppercase;color:rgba(255,253,247,.66)}

/* ---- la plaque de station ---- */
.plate .pbg{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.05)}
.plate::before{z-index:-1;background:
  linear-gradient(180deg,var(--ink) 0%,color-mix(in srgb,var(--ink) 55%,transparent) 22%,
    color-mix(in srgb,var(--era) 30%,transparent) 50%,color-mix(in srgb,var(--era) 78%,var(--ink)) 72%,var(--ink) 100%)}
.pbody{flex:1;display:grid;grid-template-columns:84px minmax(0,1fr);column-gap:22px;align-items:end;padding-bottom:40px}
.prail{position:relative;align-self:stretch}
.prail::before{content:"";position:absolute;left:50%;top:-40px;bottom:-40px;width:14px;margin-left:-7px;border-radius:7px;
  background:linear-gradient(var(--uni) 0 70%,var(--rest) 70%)}
.pdot{position:absolute;left:50%;top:70%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;
  background:var(--paper);border:14px solid var(--ink);box-shadow:0 0 0 7px var(--uni),0 0 44px 10px color-mix(in srgb,var(--hot) 45%,transparent)}
.ptxt{padding:34px 40px 38px;border:4px solid var(--paper);border-radius:22px;background:color-mix(in srgb,var(--era) 64%,rgba(13,11,18,.55));
  box-shadow:12px 12px 0 var(--ink);display:flex;flex-direction:column;gap:18px}
.pk{display:flex;align-items:center;gap:16px;font-weight:800;font-size:34px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,253,247,.9)}
.ptxt h2{font-weight:900;font-size:150px;line-height:.86;text-transform:uppercase;text-shadow:7px 7px 0 var(--ink);text-wrap:balance}
.ptxt h2.n2{font-size:124px} .ptxt h2.n3{font-size:100px;line-height:.9}
.pm{font-weight:800;font-size:40px;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 2px 6px var(--ink)}
.pm b{color:var(--hot);font-weight:900}

/* ---- l'accroche ---- */
.hook,.out{padding:0 56px 300px}
.filet{position:absolute;left:0;right:0;top:0;height:14px;background:${FILET};border-bottom:3px solid var(--paper)}
.hook .bg{position:absolute;inset:-30px;z-index:-2;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;
  filter:blur(5px) saturate(.85);opacity:.4}
.hook::before{background:radial-gradient(140% 90% at 50% 26%,rgba(13,11,18,.2) 0%,rgba(13,11,18,.78) 60%,var(--ink) 100%)}
.hook .tag{align-self:center;margin-top:170px;background:var(--paper);color:var(--ink);font-family:'Big Shoulders Display';
  font-weight:900;font-size:38px;letter-spacing:.14em;text-transform:uppercase;padding:9px 22px 6px;border-radius:8px;box-shadow:6px 6px 0 var(--ink)}
.hook h1{margin-top:22px;text-align:center;font-weight:900;font-size:172px;line-height:.84;text-transform:uppercase;
  text-shadow:9px 9px 0 var(--ink);text-wrap:balance}
.vplan{position:relative;margin:48px auto 0;width:max-content;max-width:100%;padding-left:6px}
.vplan::before{content:"";position:absolute;left:calc(6px + 23px);top:calc(var(--pas) / 2);bottom:calc(var(--pas) / 2);width:12px;
  margin-left:-6px;border-radius:6px;background:var(--rest);box-shadow:0 0 0 4px var(--ink)}
.vs{position:relative;display:flex;align-items:center;gap:26px;height:var(--pas)}
.vd{flex:none;position:relative;z-index:1;width:46px;height:46px;border-radius:50%;background:var(--paper);border:8px solid var(--ink);
  box-shadow:0 0 0 5px var(--era)}
.vd.cur{box-shadow:0 0 0 6px var(--hot),0 0 26px 6px color-mix(in srgb,var(--hot) 50%,transparent)}
.vs.tm .vd{border-radius:10px;background:var(--paper);box-shadow:0 0 0 5px var(--rest)}
.vs b{font-weight:900;font-size:var(--corps);letter-spacing:.03em;text-transform:uppercase;line-height:1;text-shadow:3px 3px 0 var(--ink);white-space:nowrap}
.vs small{font-weight:800;font-size:calc(var(--corps) * .6);letter-spacing:.12em;text-transform:uppercase;color:var(--hot);white-space:nowrap}
.vs.tm b{color:rgba(255,253,247,.7)}
.st{display:flex;align-self:center;margin-top:44px;background:var(--led),var(--board);border:3px solid var(--paper);border-radius:16px;
  overflow:hidden;box-shadow:9px 9px 0 var(--ink)}
.st div{padding:18px 36px 18px;border-right:3px dashed rgba(255,253,247,.16);text-align:center}
.st div:last-child{border-right:0}
.st b{display:block;font-weight:900;font-size:74px;line-height:.9;color:var(--hot);text-shadow:0 0 18px rgba(240,201,124,.45);white-space:nowrap}
.st span{display:block;margin-top:8px;font-family:Chivo;font-weight:700;font-size:21px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,253,247,.7)}
.lg{display:flex;justify-content:center;align-items:center;gap:40px;margin-top:40px;flex-wrap:wrap;font-weight:800;font-size:36px;
  letter-spacing:.12em;text-transform:uppercase;color:#e4e1ee}
.lg span{display:flex;align-items:center;gap:12px}
.lg .mk{font-size:28px;padding:8px 14px 5px;box-shadow:none}

/* ---- le terminus ---- */
.out{justify-content:center;align-items:center;text-align:center}
.out .tmk{width:120px;height:120px;border-radius:24px;background:var(--uni);border:16px solid var(--ink);box-shadow:0 0 0 8px var(--paper),0 0 50px 12px color-mix(in srgb,var(--hot) 40%,transparent)}
.out .k{margin-top:46px;font-family:'Big Shoulders Display';font-weight:800;font-size:40px;letter-spacing:.24em;text-transform:uppercase;color:var(--hot)}
.out h2{margin-top:14px;font-weight:900;font-size:136px;line-height:.86;text-transform:uppercase;text-shadow:8px 8px 0 #000}
.tk{--st:150px;display:flex;align-items:stretch;margin-top:64px;background:var(--paper);color:var(--ink);text-align:left;transform:rotate(-1.6deg);
  -webkit-mask:radial-gradient(circle 16px at var(--st) 0,#0000 98%,#000) top/100% 51% no-repeat,
    radial-gradient(circle 16px at var(--st) 100%,#0000 98%,#000) bottom/100% 51% no-repeat}
.tk .stub{flex:0 0 var(--st);display:grid;place-items:center;background:var(--uni);border-right:4px dashed var(--ink);
  font-weight:900;font-size:54px}
.tk .tx{padding:24px 40px 26px 32px}
.tk em{display:block;font-style:normal;font-weight:800;font-size:26px;letter-spacing:.22em;text-transform:uppercase;color:#6b6480}
.tk b{display:block;font-weight:900;font-size:78px;line-height:.95;text-transform:uppercase;margin:4px 0 6px}
.tk span{display:block;font-family:Chivo;font-weight:600;font-size:30px;color:#3a3548}
.out .t{margin-top:70px;font-family:'Big Shoulders Display';font-weight:800;font-size:34px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,253,247,.55)}
.out .rail12{position:absolute;left:0;right:0;bottom:250px;height:14px;background:${FILET};border-top:3px solid var(--paper)}
</style>

<section class="f hook" style="--era:${encre}">
  ${cover ? `<img class="bg" src="${esc(cover)}"${cadre ? ` style="object-position:${esc(cadre)} 50%"` : ''} alt="">` : ''}
  <span class="filet"></span>
  <p class="tag">${esc(ouv.ord)}</p>
  <h1 style="font-size:${nom.length > 22 ? 120 : nom.length > 14 ? 150 : 172}px">${esc(nom)}</h1>
  ${vplan}
  <div class="st">
    ${ouv.st.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('\n    ')}
  </div>
  ${legende.length ? `<div class="lg">${legende.join('')}</div>` : ''}
</section>
${suite.join('')}
<section class="f out">
  <span class="tmk"></span>
  <p class="k">${esc(t.fin)}</p>
  <h2>${esc(t.outro1)}</h2>
  <div class="tk"><span class="stub">${esc(U.code)}</span><div class="tx"><em>${esc(t.prochain)}</em><b>${esc(t.cta)}</b><span>${esc(t.outro2)}</span></div></div>
  <p class="t">${esc(t.outro3(...decompte()))}</p>
  <span class="rail12"></span>
</section>`;
}

/* ---------- assemblage ---------- */

function monte(dossier, plans, sortie, audio) {
  /* le demuxer concat rejoue la derniere image sans duree : elle est repetee,
     sinon ffmpeg coupe la fin de la video au lieu de la tenir. */
  const liste = plans.map(p =>
    `file '${p.img.replace(/\\/g,'/')}'\nduration ${p.dur.toFixed(3)}`).join('\n')
    + `\nfile '${plans[plans.length-1].img.replace(/\\/g,'/')}'\n`;
  const f = path.join(dossier, '_plans.txt');
  fs.writeFileSync(f, liste, 'utf8');

  /* la duree de la derniere entree du concat est ignoree par le demuxer : elle
     reprend celle d'avant et la video depassait de trois secondes. On coupe donc
     a la duree voulue, sinon l'ecran de fin tient deux fois trop longtemps. */
  const total = plans.reduce((s, p) => s + p.dur, 0);

  /* --audio boucle la piste plutot que de laisser du silence si elle est plus
     courte que la video, et la ferme sur un fondu : une musique coupee net a la
     derniere image s'entend comme un bug. Sans --audio, la piste reste muette —
     TikTok et Instagram refusent une video sans aucune piste audio. */
  const entree = audio
    ? ['-stream_loop', '-1', '-i', audio]
    : ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'];
  const fondu = Math.min(1.5, total / 4);
  const filtre = audio
    ? ['-af', `afade=t=in:st=0:d=0.5,afade=t=out:st=${(total - fondu).toFixed(3)}:d=${fondu.toFixed(3)}`]
    : [];

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', f,
    ...entree,
    '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
    '-vf', 'fps=30,format=yuv420p', '-r', '30',
    ...filtre,
    '-c:a', 'aac', '-b:a', audio ? '192k' : '96k',
    '-movflags', '+faststart',
    sortie,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
}

/* ---------- ---------- */

async function main() {
  const a = process.argv.slice(2);
  const val = (n, d) => a.includes(n) ? a[a.indexOf(n) + 1] : d;
  const cle = a.find(x => !x.startsWith('--') && UNIVERS[x]);
  const lang = val('--lang', 'en') === 'fr' ? 'fr' : 'en';
  let dur = Number(val('--dur', '0.62'));
  const cible = a.includes('--total') ? Number(val('--total')) : null;
  const only = val('--only', null);
  const ere = a.includes('--ere') ? Number(val('--ere')) : null;
  const sans = new Set(String(val('--sans', '')).split(',').filter(Boolean).map(Number));
  const plus = new Set(String(val('--plus', '')).split(',').map(s => s.trim()).filter(Boolean));
  const types = a.includes('--types') ? new Set(String(val('--types')).split(',').map(s => s.trim()).filter(Boolean)) : null;
  const audio = val('--audio', null);
  const titre = val('--titre', null);
  const cadre = val('--cadre', null);
  const couv = val('--couv', null);

  if (!cle) {
    console.error('usage : node _proto/video.mjs <' + Object.keys(UNIVERS).join('|') +
      '> [--lang en|fr] [--dur 0.62 | --total 60] [--only must|must+] [--types jeu,dlc] [--ere N] [--sans N,N] [--plus id,id] [--couv img] [--audio piste.mp3]');
    process.exit(1);
  }
  if (audio && !fs.existsSync(audio)) throw new Error(`--audio : fichier introuvable "${audio}"`);

  const { D, CG } = charge(UNIVERS[cle].data + (lang === 'en' ? '-en' : ''));
  const cartes = suite(D, { only, ere, plus, sans, types });
  for (const id of plus) {
    if (!cartes.some(c => c.id === id)) throw new Error(`--plus : aucune entree "${id}"`);
  }
  const total = suite(D, {}).length;
  /* --sans retire des eres de l'histoire : l'accroche compte ce qui passe a l'ecran,
     les numeros doivent suivre. Garder ceux de la page faisait partir la video DC
     a 12, les onze origines retirees laissant leur trou. --only, lui, garde le rang
     de la page : c'est une selection dans la timeline, pas une autre histoire. */
  if (sans.size && !only) cartes.forEach((c, i) => { c.rang = i + 1; });
  if (!cartes.length) throw new Error('la selection ne retient aucune entree');
  /* --total fixe la duree de la video et en deduit celle d'une carte : une minute
     est le format que Niko vise, et le nombre de cartes change d'un univers et
     d'un ajout a l'autre. L'accroche et la fin gardent leurs 3 et 3,4 s. */
  if (cible) {
    const nPlaques = new Set(cartes.map(c => c.ereI)).size;
    dur = (cible - ACCROCHE - FIN - nPlaques * PLAQUE) / cartes.length;
    if (dur < 0.3) throw new Error(`--total ${cible} : ${dur.toFixed(2)} s par carte, illisible`);
  }

  const suffixe = [types ? [...types].join('-') : null, only, ere != null ? 'ere' + ere : null, sans.size ? 'sans' + [...sans].join('') : null, plus.size ? 'plus' : null]
    .filter(Boolean).join('-');
  const nomFichier = `${cle}-${lang}${suffixe ? '-' + suffixe : ''}`;
  const dossier = path.join(RACINE, 'promo', 'video-' + nomFichier);
  fs.mkdirSync(dossier, { recursive: true });

  const sel = types ? { nom: lang === 'en' ? ([...types].join(' & ').replace('jeu', 'GAMES').replace('dlc', 'DLC'))
                                          : ([...types].join(' ET ').replace('jeu', 'JEUX').replace('dlc', 'DLC')),
                        unite: T[lang].stops }
    : only === 'must' ? { nom: T[lang].essentiels, unite: T[lang].essentielsN }
    : ere != null ? { nom: decode(D.eras[ere].title || ''), unite: T[lang].entries }
    : only === 'must+' ? { nom: T[lang].importants, unite: T[lang].entries }
    : null;

  const html = page(cle, D, CG, cartes, lang, total, sel, titre, cadre, couv);
  const apercu = path.join(dossier, '_apercu.html');
  fs.writeFileSync(apercu, html, 'utf8');

  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + apercu.replace(/\\/g,'/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 30000 });

  const cadres = await p.$$('.f');
  const plans = [];
  for (let i = 0; i < cadres.length; i++) {
    const img = path.join(dossier, String(i).padStart(3, '0') + '.png');
    await cadres[i].screenshot({ path: img });
    /* l'accroche et la fin tiennent plus longtemps : on y lit une adresse */
    const plaque = await cadres[i].evaluate(n => n.classList.contains('plate'));
    plans.push({ img, dur: i === 0 ? ACCROCHE : i === cadres.length - 1 ? FIN : plaque ? PLAQUE : dur });
  }
  await nav.close();

  const mp4 = path.join(RACINE, 'promo', nomFichier + '.mp4');
  monte(dossier, plans, mp4, audio);

  const secondes = plans.reduce((s, p) => s + p.dur, 0);
  const poids = (fs.statSync(mp4).size / 1048576).toFixed(1);
  console.log(`${nomFichier} — ${cartes.length} cartes a ${dur.toFixed(3)} s, ${secondes.toFixed(1)} s, ${poids} Mo`);
  console.log(`→ promo/${nomFichier}.mp4`);
  /* TikTok ne pose pas plus d'une minute de musique sur une video ; les Shorts
     acceptent trois minutes depuis octobre 2024 */
  if (secondes > 180.05) console.warn('  ⚠ au-dela de 3 min : hors format Shorts et TikTok');
  else if (secondes > 60.05) console.warn('  ⚠ au-dela de 60 s : trop long pour une musique TikTok (--total 60)');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
