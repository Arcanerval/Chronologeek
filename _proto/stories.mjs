/* Stories verticales (1080x1920) du radar, pour TikTok et Instagram.
   node _proto/stories.mjs [--lang en|fr] [--par 5] [--n 2]
   Sortie : promo/stories-radar-<langue>/01.png ...

   Rien n'est ecrit a la main ici : titres, dates, affiches, episodes et univers
   viennent de radar.json, que radar.yml regenere chaque nuit. Une sortie
   annoncee demain entre dans la story sans qu'on touche au script.

   Les dates suivent la regle du site : date_sort est la sortie americaine,
   date_sort_fr la francaise, et chaque langue coupe a la sienne. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

/* cle du radar -> encre de la charte, nom affiche, visuel de repli.
   Ce sont les cles de radar.json (starwars, marvel), pas celles du depot. */
const UNIVERS = {
  starwars:       { encre:'#4d9fff', nom:'Star Wars',        img:'starwars-banner' },
  marvel:         { encre:'#e23636', nom:'Marvel',           img:'mcu' },
  dc:             { encre:'#f5c842', nom:'DC',               img:'dcmultivers' },
  avatar:         { encre:'#7dd3fc', nom:'Avatar Legends',   img:'avatar' },
  startrek:       { encre:'#b48cf2', nom:'Star Trek',        img:'startrek' },
  twd:            { encre:'#a8bf4f', nom:'The Walking Dead', img:'twd' },
  dragonage:      { encre:'#e07b39', nom:'Dragon Age',       img:'dragonage' },
  assassinscreed: { encre:'#c0202f', nom:"Assassin's Creed", img:'acuniverse' },
  dcanimation:    { encre:'#2dd4bf', nom:'DC Animation',     img:'dcanimation' },
  jurassic:       { encre:'#45c46b', nom:'Jurassic World',   img:'jurassicworld' },
};

/* radar.json reste francais dans les deux langues — c'est le meme fichier qui
   alimente les deux pages —, donc le type se traduit ici, jamais la donnee. */
const TYPES = {
  'épisode':'EPISODE', 'série':'SERIES', 'film':'FILM', 'roman':'NOVEL',
  'comic':'COMIC', 'jeu vidéo':'GAME', 'jeu':'GAME', 'livre':'BOOK',
  'court métrage':'SHORT FILM', 'spécial':'SPECIAL',
};

const T = {
  en: { sur:'UPCOMING RELEASES', titre1:'WHAT DROPS NEXT', titre2:'AND THEN',
        reperes:{ premiere:'PREMIERE', finale:'FINALE', saison:'FULL SEASON' },
        aujourdhui:'TODAY', demain:'TOMORROW', signe:'D',
        pied:'chronologeek.app', cta:'Full radar · chronologeek.app/upcoming',
        mois:['January','February','March','April','May','June','July','August',
              'September','October','November','December'] },
  fr: { sur:'PROCHAINES SORTIES', titre1:'CE QUI SORT', titre2:'ET ENSUITE',
        reperes:{ premiere:'PREMIÈRE', finale:'FINALE', saison:'SAISON ENTIÈRE' },
        aujourdhui:"AUJOURD'HUI", demain:'DEMAIN', signe:'J',
        pied:'chronologeek.app', cta:'Le radar complet · chronologeek.app/a-venir',
        mois:['janvier','février','mars','avril','mai','juin','juillet','août',
              'septembre','octobre','novembre','décembre'] },
};

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const AUJ = new Date(); AUJ.setHours(0, 0, 0, 0);

/* ---------- lecture du radar ---------- */

/* les trois memes fonctions qu'e-a-venir.html et que l'encart des timelines :
   deux lectures qui divergeraient donneraient deux dates pour une sortie. */
const iso = (e, lang) => (lang === 'fr' && e.date_sort_fr) ? e.date_sort_fr : e.date_sort;
const titreDe = (e, lang) => (lang === 'fr' && e.title_fr) ? e.title_fr : e.title;

function dateDe(e, lang) {
  const d = iso(e, lang);
  if (!d) return '';
  const [a, m, j] = d.split('-').map(Number);
  return lang === 'fr'
    ? `${j} ${T.fr.mois[m - 1]} ${a}`
    : `${T.en.mois[m - 1]} ${j}, ${a}`;
}

function jours(e, lang) {
  const d = iso(e, lang);
  if (!d) return null;
  const [a, m, j] = d.split('-').map(Number);
  return Math.round((new Date(a, m - 1, j) - AUJ) / 86400000);
}

/* Le compte a rebours est un signe, pas une phrase — "D‑8" en anglais, "J‑8" en
   francais. Les deux derniers jours il devient un mot, et un mot ne tient pas
   dans la place d'un signe : la carte le resserre (classe "mot"). */
function rebours(n, t) {
  if (n <= 0) return [t.aujourdhui, true];
  if (n === 1) return [t.demain, true];
  return [`${t.signe}‑${n}`, false];
}

function visuel(e) {
  if (e.poster) return 'https://image.tmdb.org/t/p/w342' + e.poster;
  /* 19 des 41 sorties n'ont pas d'affiche — les comics et romans de
     Wookieepedia et de l'Avatar Almanac. La banniere de l'univers ne montre
     pas l'oeuvre, elle dit d'ou elle vient : c'est le geste du journal. */
  const u = UNIVERS[e.universe];
  for (const n of [u && u.img, e.universe]) {
    if (!n) continue;
    for (const ext of ['.webp', '.png', '.jpg']) {
      const p = path.join(RACINE, 'images', n + ext);
      if (fs.existsSync(p)) return 'file:///' + p.replace(/\\/g, '/');
    }
  }
  return '';
}

/* ---------- rendu ---------- */

function carte(e, lang, t) {
  const u = UNIVERS[e.universe] || { encre:'#8f8fa8', nom:e.universe };
  const n = jours(e, lang);
  const [cd, mot] = rebours(n, t);
  const kind = String(e.kind || '').toLowerCase();
  const type = lang === 'en' ? (TYPES[kind] || kind.toUpperCase()) : String(e.kind || '').toUpperCase();
  const ep = e.ep ? `S${e.ep.s}${e.ep.e ? 'E' + String(e.ep.e).padStart(2, '0') : ''}` : '';
  const src = visuel(e);
  const gen = !e.poster;

  /* premiere, finale, saison entiere : le repere du radar, et c'est ce qui
     distingue un episode de plus d'un rendez-vous. Il se pose sous le compte a
     rebours, ou il y a la place — dans la ligne du type, il chassait la date. */
  const rep = e.ep && e.ep.mark ? (t.reperes[e.ep.mark] || '') : '';

  return `<li class="card" style="--c:${u.encre}">
    <span class="cdw">
      <span class="cd${mot ? ' mot' : ''}">${esc(cd)}</span>
      ${rep ? `<span class="rep ${esc(e.ep.mark)}">${esc(rep)}</span>` : ''}
    </span>
    ${src ? `<img class="po${gen ? ' gen' : ''}" src="${esc(src)}" alt="">` : '<span class="po ph"></span>'}
    <span class="meta">
      <span class="uni">${esc(u.nom)}</span>
      <span class="ti">${esc(titreDe(e, lang))}</span>
      <span class="sub">
        <span class="ty">${esc(type)}</span>
        ${ep ? `<span class="ep">${esc(ep)}</span>` : ''}
        <span class="dt">${esc(dateDe(e, lang))}</span>
      </span>
    </span>
  </li>`;
}

/* Le sur-titre dit le mois du lot, pas celui du jour : la seconde story court
   jusqu'en octobre, et elle s'annoncait "SEPTEMBER 2026". */
function plage(lot, lang) {
  const t = T[lang];
  const d = lot.map(e => iso(e, lang)).filter(Boolean).sort();
  if (!d.length) return '';
  const [a1, m1] = d[0].split('-').map(Number);
  const [a2, m2] = d[d.length - 1].split('-').map(Number);
  if (m1 === m2 && a1 === a2) return `${t.mois[m1 - 1]} ${a1}`;
  return a1 === a2
    ? `${t.mois[m1 - 1]} → ${t.mois[m2 - 1]} ${a2}`
    : `${t.mois[m1 - 1]} ${a1} → ${t.mois[m2 - 1]} ${a2}`;
}

function page(pages, lang) {
  const t = T[lang];

  const corps = pages.map((lot, i) => `
  <section class="st">
    <div class="halo"></div>
    <header class="hd">
      <p class="site">chronologeek.app</p>
      <p class="eyebrow"><span class="pill"></span>${esc(t.sur)} · ${esc(plage(lot, lang).toUpperCase())}</p>
      <h1>${esc(i === 0 ? t.titre1 : t.titre2)}</h1>
    </header>
    <ul class="cards">${lot.map(e => carte(e, lang, t)).join('')}</ul>
    <footer class="ft">
      <span class="cta">${esc(t.cta)}</span>
      <span class="pg">${i + 1} / ${pages.length}</span>
    </footer>
  </section>`).join('');

  return `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Archivo:wght@400;500;600;700&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Archivo,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}

/* 1080x1920, et les marges sont celles des stories : l'interface de TikTok et
   d'Instagram mange le haut et surtout le bas de l'ecran. Rien de lisible
   au-dessus de 150 px ni sous les 300 derniers. */
.st{position:relative;width:1080px;height:1920px;overflow:hidden;background:#08080f;
  color:#eceaf2;display:flex;flex-direction:column;padding:150px 64px 300px}

/* les six encres du radar disent d'un coup que la story couvre tous les univers */
.halo{position:absolute;inset:-10% -10% auto;height:58%;pointer-events:none;opacity:.5;
  background:
    radial-gradient(42% 46% at 12% 0%, #4d9fff33, transparent 70%),
    radial-gradient(42% 46% at 34% 4%, #e2363633, transparent 70%),
    radial-gradient(42% 46% at 56% 0%, #f5c84233, transparent 70%),
    radial-gradient(42% 46% at 76% 5%, #b48cf233, transparent 70%),
    radial-gradient(42% 46% at 96% 0%, #a8bf4f2b, transparent 70%)}

.hd{position:relative;z-index:2;flex:none}
.site{font-family:"Big Shoulders Display";font-weight:800;font-size:30px;letter-spacing:.17em;
  text-transform:uppercase;color:#fff;border:1px solid #3a3a4a;background:#0d0d16cc;
  display:inline-block;padding:9px 18px;border-radius:3px}
.eyebrow{margin-top:34px;font-family:"Big Shoulders Display";font-weight:700;font-size:29px;
  letter-spacing:.15em;text-transform:uppercase;color:#9a98b0;display:flex;align-items:center;gap:14px}
.pill{width:38px;height:5px;background:#eceaf2;flex:none;border-radius:1px}
.hd h1{font-family:"Big Shoulders Display";font-weight:900;font-size:124px;line-height:.87;
  text-transform:uppercase;margin-top:16px;color:#fff}

/* les cartes se partagent la hauteur restante : quatre ou six sorties
   remplissent la meme story, sans bloc de vide en bas. */
.cards{list-style:none;position:relative;z-index:2;flex:1;display:flex;flex-direction:column;
  justify-content:center;gap:22px;margin-top:56px;min-height:0}
.card{flex:1 1 0;max-height:230px;display:grid;grid-template-columns:150px 128px 1fr;
  align-items:center;gap:26px;background:#12121b;border:1px solid #23232e;border-left:6px solid var(--c);
  border-radius:5px;padding:18px 26px;min-height:0}

.cdw{display:flex;flex-direction:column;align-items:center;gap:9px;min-width:0}
.cd{font-family:"Big Shoulders Display";font-weight:900;font-size:76px;line-height:1;
  color:var(--c);text-align:center;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
/* les trois encres du radar : verte la premiere, orange la finale, bleue la
   saison qui tombe d'un bloc. */
.rep{font-family:"Big Shoulders Display";font-weight:900;font-size:21px;letter-spacing:.09em;
  line-height:1.2;padding:3px 9px;border-radius:2px;white-space:nowrap;
  border:1px solid currentColor}
.rep.premiere{color:#5fd38a}
.rep.finale{color:#f0a13c}
.rep.saison{color:#6ab6ff}
/* "AUJOURD'HUI" fait onze signes contre trois : le mot se resserre plutot que
   de pousser le titre hors de la carte. */
.cd.mot{font-size:34px;line-height:1.05;letter-spacing:.04em}

.po{width:128px;height:100%;max-height:186px;object-fit:cover;border-radius:4px;display:block;
  background:#1c1c26}
/* un visuel d'univers n'est pas une affiche : il s'efface d'un cran pour ne pas
   se faire passer pour l'oeuvre. */
.po.gen{object-fit:cover;opacity:.62;filter:saturate(.85)}
.po.ph{background:#1c1c26}

.meta{min-width:0;display:flex;flex-direction:column;gap:9px}
.uni{font-family:"Big Shoulders Display";font-weight:800;font-size:25px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--c)}
.ti{font-size:42px;font-weight:600;line-height:1.1;color:#fff;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sub{display:flex;align-items:center;gap:14px;min-width:0;flex-wrap:nowrap}
.ty{font-family:"Big Shoulders Display";font-weight:800;font-size:22px;letter-spacing:.1em;
  color:#b6b4c8;border:1px solid #3a3a4a;padding:3px 10px;border-radius:2px;
  white-space:nowrap;line-height:1.25;flex:none}
.ep{font-family:"Big Shoulders Display";font-weight:900;font-size:26px;color:var(--c);
  white-space:nowrap;flex:none;letter-spacing:.04em}
.dt{font-size:27px;color:#9d9bb2;font-weight:500;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis;min-width:0}

.ft{position:relative;z-index:2;flex:none;margin-top:44px;display:flex;
  justify-content:space-between;align-items:center;border-top:1px solid #23232e;padding-top:26px;
  font-family:"Big Shoulders Display";font-weight:800;font-size:30px;letter-spacing:.1em;
  text-transform:uppercase;color:#8d8ba3}
.ft .pg{color:#fff;font-variant-numeric:tabular-nums}
</style>
${corps}`;
}

/* ---------- sortie ---------- */

async function main() {
  const args = process.argv.slice(2);
  const val = (n, d) => args.includes(n) ? Number(args[args.indexOf(n) + 1]) : d;
  const lang = (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en') === 'fr' ? 'fr' : 'en';
  const par = val('--par', 5);
  const n = val('--n', 2);

  const radar = JSON.parse(fs.readFileSync(path.join(RACINE, 'radar.json'), 'utf8'));

  /* chaque langue coupe a sa propre date, jour J compris : une sortie deja
     passee aux Etats-Unis peut etre encore a venir en France. */
  const aVenir = radar
    .filter(e => iso(e, lang) && jours(e, lang) >= 0)
    .sort((a, b) => iso(a, lang).localeCompare(iso(b, lang)));

  if (!aVenir.length) throw new Error('aucune sortie a venir dans radar.json');

  /* Une serie qui diffuse tient quatre lignes au radar, et c'est juste la —
     on y vient pour savoir quand tombe chaque episode. Dans une story, trois
     "Lanterns" d'affilee avec la meme affiche n'apprennent rien : on garde la
     plus proche de chaque titre, et la place va a un autre univers. */
  const vus = new Set();
  const distinct = aVenir.filter(e => {
    const cle = titreDe(e, lang);
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });

  const pages = [];
  for (let i = 0; i < n && i * par < distinct.length; i++) {
    pages.push(distinct.slice(i * par, (i + 1) * par));
  }

  const html = page(pages, lang);
  const sortie = path.join(RACINE, 'promo', `stories-radar-${lang}`);
  fs.mkdirSync(sortie, { recursive: true });
  fs.writeFileSync(path.join(sortie, '_apercu.html'), html, 'utf8');

  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.join(sortie, '_apercu.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  /* les affiches viennent de TMDB : une image qui n'arrive pas laisse un bloc
     gris, et c'est le genre de silence qu'il vaut mieux voir au rapport. */
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 30000 });
  const mortes = await p.evaluate(() =>
    [...document.images].filter(i => !i.naturalWidth).map(i => i.src));

  const cadres = await p.$$('.st');
  for (let i = 0; i < cadres.length; i++) {
    await cadres[i].screenshot({ path: path.join(sortie, String(i + 1).padStart(2, '0') + '.png') });
  }
  await nav.close();

  if (mortes.length) console.warn(`  ⚠ ${mortes.length} visuel(s) introuvable(s) : ${mortes[0]}`);
  console.log(`radar/${lang} — ${cadres.length} stories, ${pages.flat().length} sorties sur ${distinct.length} titres distincts (${aVenir.length} à venir)`);
  console.log(`→ ${path.relative(RACINE, sortie).replace(/\\/g, '/')}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
