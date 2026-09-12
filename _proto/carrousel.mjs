/* Carrousels Instagram (1080x1350) produits depuis les donnees du site.
   node _proto/carrousel.mjs <univers> [--lang fr|en] [--max 11]
   Sortie : promo/carrousel-<univers>-<langue>/01.png ...

   Rien n'est ecrit a la main ici : titres, dates, vignettes, ordre et decoupage
   en eres viennent de _proto/data*.js, comme le JSON-LD et le prerendu. Une
   oeuvre ajoutee demain sort dans le carrousel sans qu'on touche au script. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

/* cle -> fichier de donnees, encre de la charte, nom affiche de secours */
const UNIVERS = {
  sw:             { data: 'data',                 encre: '#4d9fff' },
  mcu:            { data: 'data-mcu',             encre: '#e23636' },
  dc:             { data: 'data-dc',              encre: '#f5c842' },
  avatar:         { data: 'data-avatar',          encre: '#7dd3fc' },
  startrek:       { data: 'data-startrek',        encre: '#b48cf2' },
  twd:            { data: 'data-twd',             encre: '#a8bf4f' },
  dragonage:      { data: 'data-dragonage',       encre: '#e07b39' },
  assassinscreed: { data: 'data-assassinscreed',  encre: '#c0202f' },
  dcanimation:    { data: 'data-dcanimation',     encre: '#2dd4bf' },
  jurassic:       { data: 'data-jurassic',        encre: '#45c46b' },
};

/* encres des badges de type, charte du site */
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
};

const T = {
  fr: { ordre:"L'ORDRE COMPLET", suite:'(suite)', oeuvres:'œuvres', eres:'ères',
        essentiel:'Essentiel', important:'Important',
        sansSpoil:'Sans spoil', cover2:'dans l’ordre', fin1:'La timeline complète, gratuite',
        fin2:'Coche ce que tu as vu. Le site retient ta progression.',
        fin3:(u, n) => `${u} univers · ${n.toLocaleString('fr-FR').replace(/\s/g, ' ')} œuvres · FR + EN` },
  en: { ordre:'THE FULL ORDER', suite:'(cont.)', oeuvres:'entries', eres:'eras',
        essentiel:'Essential', important:'Important',
        sansSpoil:'Spoiler-free', cover2:'in order', fin1:'The full timeline, free',
        fin2:'Check off what you have seen. The site remembers.',
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

/* Le niveau intermediaire s'ecrit de deux facons : "important" chez huit
   univers, "imp" chez DC — c'est la valeur qui change, pas le champ, et
   CLAUDE.md le dit. N'accepter que la premiere laissait les 118 entrees de DC
   sans triangle : rien ne cassait, la marque manquait, et c'est le seul univers
   qui n'a pas d'essentiel pour le faire remarquer. */
const IMPORTANT = new Set(['important', 'imp']);

function decoupe(D, maxParSlide, t) {
  const slides = [];
  let n = 0;
  for (const ere of D.eras) {
    const entrees = (ere.entries || []).filter(e => e && e.title && e.type !== 'separator');
    if (!entrees.length) continue;
    const morceaux = Math.ceil(entrees.length / maxParSlide);
    const parMorceau = Math.ceil(entrees.length / morceaux);
    for (let i = 0; i < morceaux; i++) {
      const lot = entrees.slice(i * parMorceau, (i + 1) * parMorceau);
      slides.push({
        ere: ere.title || '',
        suite: i > 0 ? t.suite : '',
        entrees: lot.map(e => {
          const niveau = e.level || e.imp || '';
          /* les trois marques calculees ici ecrasent le champ de donnees du meme
             nom, comme dans video.mjs. */
          return { ...e, rang: ++n,
            must: niveau === 'must',
            imp: IMPORTANT.has(niveau),
            flashback: (e.tags || []).includes('flashback') };
        }),
      });
    }
  }
  return slides;
}

/* ---------- rendu ---------- */

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decode = s => String(s ?? '').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/* les vignettes sont referencees en /images/x.webp : chemin absolu pour file://.
   DC Animation, lui, pointe ses 80 affiches directement chez TMDB — une URL
   se laisse telle quelle, la transformer en chemin local perdait la page entiere. */
const visuel = src => {
  if (!src) return '';
  const s = String(src);
  if (/^https?:\/\//i.test(s)) return s;
  return 'file:///' + path.join(RACINE, s.replace(/^\//, '')).replace(/\\/g, '/');
};

/* les memes visuels que les cases de l'accueil, pas des fichiers a nous */
const COUVERTURES = {
  sw:'starwars-banner', mcu:'mcu', dc:'dcmultivers', avatar:'avatar', startrek:'startrek',
  twd:'twd', dragonage:'dragonage', assassinscreed:'acuniverse', dcanimation:'dcanimation',
  jurassic:'jurassicworld',
};

function trouveCouverture(cle) {
  for (const n of [COUVERTURES[cle], cle]) {
    for (const ext of ['.webp', '.png', '.jpg']) {
      const p = path.join(RACINE, 'images', n + ext);
      if (fs.existsSync(p)) return 'file:///' + p.replace(/\\/g, '/');
    }
  }
  console.warn(`  ⚠ pas de visuel de couverture pour ${cle}`);
  return '';
}

/* le triangle des importants est celui des pages (LVICO de e-starwars.html) et
   celui des videos, trait et encre compris : les trois surfaces doivent porter
   le meme signe, sinon il n'apprend rien a qui passe de l'une a l'autre. */
const IMP = '<svg class="imp" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 3.8 2.6 20.2h18.8z"/><path d="M12 9.6v4.2M12 16.9h.01"/></svg>';

function ligne(e, lang) {
  const [encre, fr, en] = TYPES[e.type] || ['#8f8fa8', String(e.type || '').toUpperCase(), String(e.type || '').toUpperCase()];
  /* L'etoile, le triangle et la pastille FLASHBACK, comme dans les videos. Le
     carrousel ne montrait que l'etoile : "important" porte 37 entrees sur 62
     chez Star Wars, et une seconde etoile repetee a ce point n'aurait rien
     distingue. Le triangle, lui, est un signe different et discret — c'est la
     reponse deja trouvee par les pages et par video.mjs. */
  /* les sous-items partent en entier, le CSS tronque : en montrer deux sur huit
     donnerait une liste d'arcs qui a l'air complete et ne l'est pas. */
  const sous = Array.isArray(e.subitems)
    ? e.subitems.filter(s => s && s.trim()).join(' · ')
    : '';
  return `<li class="row${e.must ? ' must' : ''}">
    <span class="rank">${String(e.rang).padStart(2, '0')}</span>
    <span class="vis">
      ${e.img ? `<img class="thumb" src="${esc(visuel(e.img))}" alt="">` : '<span class="thumb ph"></span>'}
      ${e.flashback ? '<span class="fb">FLASHBACK</span>' : ''}
    </span>
    <span class="meta">
      <span class="title">${esc(decode(e.title))}</span>
      <span class="sub">
        <span class="btype" style="--bt:${encre}">${esc(lang === 'en' ? en : fr)}</span>
        ${e.date ? `<span class="date">${esc(decode(e.date))}</span>` : ''}
        ${sous ? `<span class="si">${esc(decode(sous))}</span>` : ''}
      </span>
    </span>
    <span class="mark">${e.must ? '★' : e.imp ? IMP : ''}</span>
  </li>`;
}

function page(cle, D, slides, lang, total) {
  const t = T[lang];
  const encre = UNIVERS[cle].encre;
  const nom = decode(D.title || cle);
  const cover = trouveCouverture(cle);
  const nSlides = slides.length + 2;
  /* la legende des signes, et seulement de ceux que le carrousel montre : Star
     Trek n'a pas de niveaux, un univers sans flashback n'a pas de pastille.
     Meme regle et memes mots que video.mjs et que les filtres du site. */
  const toutes = slides.flatMap(s => s.entrees);
  const legende = [
    toutes.some(e => e.must) && `<span><i class="lstar">★</i>${esc(t.essentiel)}</span>`,
    toutes.some(e => e.imp) && `<span>${IMP.replace('class="imp"', 'class="limp"')}${esc(t.important)}</span>`,
    toutes.some(e => e.flashback) && `<span><i class="lfb">FLASHBACK</i></span>`,
  ].filter(Boolean);

  const corps = slides.map((s, i) => `
  <section class="slide">
    <header class="head">
      <p class="eyebrow"><span class="pill"></span>${esc(nom)} · ${t.ordre}</p>
      <h2>${esc(decode(s.ere))}${s.suite ? ` <em>${t.suite}</em>` : ''}</h2>
    </header>
    <ul class="rows n${s.entrees.length}">${s.entrees.map(e => ligne(e, lang)).join('')}</ul>
    <footer class="foot"><span>chronologeek.app</span><span class="pg">${i + 2} / ${nSlides}</span></footer>
  </section>`).join('');

  return `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Archivo:wght@400;500;600;700&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Archivo,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.slide{
  position:relative;width:1080px;height:1350px;overflow:hidden;background:#08080f;color:#eceaf2;
  display:flex;flex-direction:column;padding:62px 62px 46px;
}
.slide::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 62% at 50% -8%, ${encre}22, transparent 62%)}
.head{position:relative;z-index:2;flex:none}
.eyebrow{font-family:"Big Shoulders Display";font-weight:700;font-size:25px;letter-spacing:.15em;
  text-transform:uppercase;color:#8d8ba3;display:flex;align-items:center;gap:13px}
.pill{width:34px;height:5px;background:${encre};flex:none;border-radius:1px}
.head h2{font-family:"Big Shoulders Display";font-weight:900;font-size:76px;line-height:.92;
  text-transform:uppercase;margin-top:15px;letter-spacing:.004em;color:#fff}
.head h2 em{font-style:normal;font-size:40px;color:#7e7c93;font-weight:800}

/* les rangees se partagent la hauteur restante : une slide de 5 entrees et une
   slide de 11 remplissent la meme page, sans bloc de vide en bas. */
.rows{list-style:none;position:relative;z-index:2;flex:1;display:flex;flex-direction:column;
  justify-content:center;gap:12px;margin-top:32px;min-height:0}
.row{flex:1 1 0;max-height:150px;display:grid;grid-template-columns:56px 152px 1fr 40px;
  align-items:center;gap:20px;background:#12121b;border:1px solid #23232e;border-radius:4px;
  padding:12px 16px;min-height:0}
.row.must{border-color:${encre}66;background:linear-gradient(90deg,${encre}14,#12121b 42%)}
.rank{font-family:"Big Shoulders Display";font-weight:900;font-size:38px;color:#5d5b73;
  text-align:right;font-variant-numeric:tabular-nums;line-height:1}
.row.must .rank{color:${encre}}
/* la vignette est enveloppee pour porter la pastille FLASHBACK : align-self lui
   donne la hauteur de la rangee, qui varie d'une slide de 5 entrees a une slide
   de 11 — une hauteur fixe ecrasait les slides denses. */
.vis{position:relative;align-self:stretch;max-height:96px;display:block}
.thumb{width:100%;height:100%;object-fit:cover;border-radius:3px;
  display:block;background:#1c1c26}
.thumb.ph{background:#1c1c26}
/* la pastille du site (.ft) et des videos, en plein plutot qu'au trait : sur une
   vignette de 152 px elle doit se lire sans qu'on s'arrete dessus. */
.fb{position:absolute;left:0;top:0;z-index:3;background:#f0c97c;color:#08080f;
  font-family:"Big Shoulders Display";font-weight:900;font-size:15px;letter-spacing:.07em;
  line-height:1;padding:5px 12px 4px 7px;
  clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.meta{min-width:0;display:flex;flex-direction:column;gap:7px}
.title{font-size:31px;font-weight:600;line-height:1.16;color:#fff;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sub{display:flex;align-items:center;gap:12px;min-width:0}
.btype{font-family:"Big Shoulders Display";font-weight:800;font-size:19px;letter-spacing:.09em;
  color:var(--bt);border:1px solid color-mix(in srgb, var(--bt) 45%, transparent);
  padding:2px 9px;border-radius:2px;white-space:nowrap;line-height:1.25;flex:none}
.date{font-size:23px;color:#9d9bb2;font-weight:500;white-space:nowrap;flex:none}
.si{font-size:20px;color:#6f6d85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mark{font-family:"Big Shoulders Display";font-weight:900;font-size:34px;
  line-height:1;color:${encre};display:flex;align-items:center;justify-content:center}
.mark .imp{width:33px;height:33px;fill:none;stroke:#ff9d5c;stroke-width:2.3;
  stroke-linejoin:miter;stroke-linecap:square}
/* les slides denses se resserrent d'un cran */
.rows.n10 .title,.rows.n11 .title{font-size:29px;-webkit-line-clamp:1}
.rows.n10,.rows.n11{gap:9px}

.foot{position:relative;z-index:2;flex:none;margin-top:26px;display:flex;justify-content:space-between;
  align-items:center;font-family:"Big Shoulders Display";font-weight:800;font-size:25px;
  letter-spacing:.11em;text-transform:uppercase;color:#6f6d85;
  border-top:1px solid #23232e;padding-top:18px}
.foot .pg{color:${encre};font-variant-numeric:tabular-nums}

/* ---- couverture ---- */
.cover{justify-content:flex-end;padding:0}
.cover .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42}
.cover::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,#08080fcc 0%,#08080f55 34%,#08080fee 74%,#08080f 100%)}
.cover .in{position:relative;z-index:3;padding:0 62px 74px}
.cover h1{font-family:"Big Shoulders Display";font-weight:900;font-size:150px;line-height:.86;
  text-transform:uppercase;color:#fff;letter-spacing:.002em}
.cover .ord{font-family:"Big Shoulders Display";font-weight:900;font-size:78px;line-height:.9;
  color:${encre};text-transform:uppercase;margin-top:6px}
.cover .stats{display:flex;gap:0;margin-top:40px;border-top:2px solid ${encre}}
.cover .st{flex:1;padding:22px 0 0}
.cover .st b{display:block;font-family:"Big Shoulders Display";font-weight:900;font-size:64px;
  line-height:.9;color:#fff;font-variant-numeric:tabular-nums}
.cover .st span{display:block;margin-top:8px;font-size:22px;letter-spacing:.09em;
  text-transform:uppercase;color:#9d9bb2;font-weight:600}
.cover .lg{display:flex;align-items:center;gap:34px;margin-top:34px;flex-wrap:wrap;
  font-family:"Big Shoulders Display";font-weight:800;font-size:27px;letter-spacing:.11em;
  text-transform:uppercase;color:#cfcde0}
.cover .lg>span{display:flex;align-items:center;gap:11px}
.lstar{font-style:normal;font-weight:900;font-size:36px;line-height:1;color:${encre}}
.limp{width:36px;height:36px;fill:none;stroke:#ff9d5c;stroke-width:2.3;stroke-linejoin:miter;
  stroke-linecap:square}
.lfb{font-style:normal;background:#f0c97c;color:#08080f;font-weight:900;font-size:23px;
  letter-spacing:.11em;line-height:1;padding:8px 18px 6px 13px;
  clip-path:polygon(0 0,100% 0,calc(100% - 9px) 100%,0 100%)}
.cover .site{position:absolute;top:56px;left:62px;z-index:3;font-family:"Big Shoulders Display";
  font-weight:800;font-size:29px;letter-spacing:.16em;text-transform:uppercase;color:#fff;
  background:#08080fcc;border:1px solid ${encre}88;padding:9px 18px;border-radius:3px}

/* ---- derniere slide ---- */
.end{justify-content:center;align-items:flex-start;gap:0}
.end h2{font-family:"Big Shoulders Display";font-weight:900;font-size:104px;line-height:.9;
  text-transform:uppercase;color:#fff;max-width:16ch}
.end .url{font-family:"Big Shoulders Display";font-weight:900;font-size:82px;color:${encre};
  margin-top:34px;letter-spacing:.01em}
.end p{font-size:34px;color:#a7a5ba;margin-top:26px;max-width:24ch;line-height:1.4}
.end .tail{margin-top:52px;padding-top:26px;border-top:1px solid #23232e;width:100%;
  font-family:"Big Shoulders Display";font-weight:800;font-size:27px;letter-spacing:.11em;
  text-transform:uppercase;color:#6f6d85}
</style>

<section class="slide cover">
  ${cover ? `<img class="bg" src="${esc(cover)}" alt="">` : ''}
  <span class="site">chronologeek.app</span>
  <div class="in">
    <h1>${esc(nom)}</h1>
    <p class="ord">${esc(t.cover2)}</p>
    <div class="stats">
      <div class="st"><b>${total}</b><span>${esc(t.oeuvres)}</span></div>
      <div class="st"><b>${D.eras.length}</b><span>${esc(t.eres)}</span></div>
      <div class="st"><b>${esc(t.sansSpoil)}</b><span>${lang === 'en' ? 'guaranteed' : 'garanti'}</span></div>
    </div>
    ${legende.length ? `<div class="lg">${legende.join('')}</div>` : ''}
  </div>
</section>
${corps}
<section class="slide end">
  <span class="site">chronologeek.app</span>
  <h2>${esc(t.fin1)}</h2>
  <p class="url">chronologeek.app</p>
  <p>${esc(t.fin2)}</p>
  <p class="tail">${esc(t.fin3(...decompte()))}</p>
</section>`;
}

/* ---------- sortie ---------- */

async function main() {
  const args = process.argv.slice(2);
  const cle = args.find(a => !a.startsWith('--'));
  const lang = (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'fr') === 'en' ? 'en' : 'fr';
  const max = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : 11;

  if (!cle || !UNIVERS[cle]) {
    console.error('usage : node _proto/carrousel.mjs <' + Object.keys(UNIVERS).join('|') + '> [--lang fr|en] [--max 11]');
    process.exit(1);
  }

  const fichier = UNIVERS[cle].data + (lang === 'en' ? '-en' : '');
  const { D } = charge(fichier);
  const slides = decoupe(D, max, T[lang]);
  const total = slides.reduce((n, s) => n + s.entrees.length, 0);
  if (!total) throw new Error(`aucune entree lue dans ${fichier}.js`);

  const html = page(cle, D, slides, lang, total);
  const sortie = path.join(RACINE, 'promo', `carrousel-${cle}-${lang}`);
  fs.mkdirSync(sortie, { recursive: true });
  fs.writeFileSync(path.join(sortie, '_apercu.html'), html, 'utf8');

  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.join(sortie, '_apercu.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 20000 });

  const cadres = await p.$$('.slide');
  for (let i = 0; i < cadres.length; i++) {
    await cadres[i].screenshot({ path: path.join(sortie, String(i + 1).padStart(2, '0') + '.png') });
  }
  await nav.close();

  const mortes = html.match(/src="file:\/\/\/([^"]+)"/g)?.filter(m => {
    const f = decodeURIComponent(m.slice(13, -1));
    return !fs.existsSync(f);
  }) || [];
  if (mortes.length) console.warn('  ⚠ ' + mortes.length + ' visuel(s) introuvable(s)');

  console.log(`${cle}/${lang} — ${cadres.length} images, ${total} œuvres, ${slides.length} slides d'ère`);
  console.log(`→ ${path.relative(RACINE, sortie).replace(/\\/g, '/')}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
