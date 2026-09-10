/* Videos verticales 1080x1920 (TikTok, Reels, Shorts) produites depuis les donnees.
   node _proto/video.mjs <univers> [--lang en|fr] [--dur 0.62] [--only must|must+] [--ere N] [--plus id,id]

   --plus tire une entree hors du filtre et la met au rang des essentiels : Rogue One
   est "important" dans les donnees, et le site n'a pas a changer pour une video.

   Une oeuvre par carte, coupe nette : pas de defilement. C'est le choix de Niko
   du 6 septembre 2026 — une timeline qui glisse est vite penible a regarder, la
   coupe donne le rythme. Consequence technique : rien n'est anime, donc rien
   n'est capture image par image. On rend une PNG par carte et ffmpeg les tient
   chacune sa duree. Une video de 42 s coute 64 captures, pas 1 260.

   L'anglais est la langue par defaut : le compte vise l'international, et le
   site dit lui-meme qu'il existe en francais. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');

const UNIVERS = {
  sw:             { data: 'data',                encre: '#4d9fff', cover: 'starwars-banner' },
  mcu:            { data: 'data-mcu',            encre: '#e23636', cover: 'mcu' },
  dc:             { data: 'data-dc',             encre: '#f5c842', cover: 'dcmultivers' },
  avatar:         { data: 'data-avatar',         encre: '#7dd3fc', cover: 'avatar' },
  startrek:       { data: 'data-startrek',       encre: '#b48cf2', cover: 'startrek' },
  twd:            { data: 'data-twd',            encre: '#a8bf4f', cover: 'twd' },
  dragonage:      { data: 'data-dragonage',      encre: '#e07b39', cover: 'dragonage' },
  assassinscreed: { data: 'data-assassinscreed', encre: '#c0202f', cover: 'acuniverse' },
  dcanimation:    { data: 'data-dcanimation',    encre: '#2dd4bf', cover: 'dcanimation' },
};

const TYPES = {
  film:['#64b5f6','FILM','FILM'], filmanim:['#90caf9','FILM ANIMÉ','ANIMATED FILM'],
  serie:['#81c784','SÉRIE','SERIES'], anime:['#ce93d8','SÉRIE ANIMÉE','ANIMATED SERIES'],
  jeu:['#ffb74d','JEU','GAME'], dlc:['#ffb74d','DLC','DLC'],
  special:['#ffa726','SPÉCIAL','SPECIAL'], video:['#f472b6','VIDÉO','VIDEO'],
  livre:['#c5a880','ROMAN','NOVEL'], comic:['#c5a880','COMIC','COMIC'],
};

const T = {
  en: { ordre:'IN ORDER', hookSub:'no spoilers', entries:'entries', eras:'eras',
        outro1:'The full order', outro2:'free, no account',
        outro3:'9 universes · 1,463 entries · EN + FR', cta:'chronologeek.app' },
  fr: { ordre:"DANS L'ORDRE", hookSub:'sans spoil', entries:'œuvres', eras:'ères',
        outro1:"L'ordre complet", outro2:'gratuit, sans compte',
        outro3:'9 univers · 1 463 œuvres · FR + EN', cta:'chronologeek.app' },
};

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
  return D;
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

function suite(D, opts) {
  const out = [];
  let rang = 0;
  D.eras.forEach((ere, i) => {
    for (const e of (ere.entries || [])) {
      if (!e || !e.title || e.type === 'separator') continue;
      rang++;
      if (opts.ere != null && i !== opts.ere) continue;
      const niveau = e.level || e.imp || '';
      const force = opts.plus && opts.plus.has(e.id);
      if (!force && opts.only === 'must' && niveau !== 'must') continue;
      if (!force && opts.only === 'must+' && niveau !== 'must' && niveau !== 'important') continue;
      /* une entree tiree par --plus est mise au rang des essentiels : sans ca elle
         sortirait sans etoile ni bordure au milieu de cartes qui les portent. */
      out.push({ ...e, rang, ere: ere.title || '', must: niveau === 'must' || !!force });
    }
  });
  return out;
}

/* ---------- rendu ---------- */

function page(cle, D, cartes, lang, total) {
  const t = T[lang];
  const encre = UNIVERS[cle].encre;
  const nom = decode(D.title || cle);
  const cover = couverture(cle);

  const carte = (e, i) => {
    const [bt, fr, en] = TYPES[e.type] || ['#8f8fa8', String(e.type||'').toUpperCase(), String(e.type||'').toUpperCase()];
    const pct = ((i + 1) / cartes.length * 100).toFixed(2);
    const titre = decode(e.title);
    /* le corps du titre suit sa longueur : "Andor" et "Episode I: The Phantom
       Menace" ne peuvent pas tenir le meme corps sans que l'un deborde. */
    const taille = titre.length > 40 ? ' t3' : titre.length > 24 ? ' t2' : '';
    return `<section class="f card${e.must ? ' must' : ''}">
      <p class="eye"><span class="pill"></span>${esc(nom)} · ${esc(t.ordre)}</p>
      <div class="vis">
        ${e.img ? `<img src="${esc(visuel(e.img))}" alt="">` : '<div class="ph"></div>'}
        <span class="no">${String(e.rang).padStart(2,'0')}</span>
        ${e.must ? '<span class="star">★</span>' : ''}
      </div>
      <div class="txt">
        <p class="era">${esc(decode(e.ere))}</p>
        <h2 class="${taille.trim()}">${esc(titre)}</h2>
        <p class="line">
          <span class="bt" style="--bt:${bt}">${esc(lang === 'en' ? en : fr)}</span>
          ${e.date ? `<span class="dt">${esc(decode(e.date))}</span>` : ''}
        </p>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <p class="url">${esc(t.cta)}</p>
    </section>`;
  };

  return `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Archivo:wght@400;500;600;700&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;font-family:Archivo,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.f{position:relative;width:1080px;height:1920px;overflow:hidden;background:#08080f;color:#fff;
   display:flex;flex-direction:column}
.f::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;
  background:radial-gradient(120% 46% at 50% 0%, ${encre}26, transparent 60%)}

/* ---- carte ---- */
/* le bas de l'ecran appartient a l'application : legende, boutons et nom du
   compte couvrent environ 300 px sur TikTok et Reels. Rien de lisible n'y
   descend — la barre et l'adresse s'arretent au-dessus. */
.card{padding:150px 58px 300px;justify-content:flex-start}
.eye{position:relative;z-index:3;font-family:"Big Shoulders Display";font-weight:700;font-size:31px;
  letter-spacing:.16em;text-transform:uppercase;color:#8d8ba3;display:flex;align-items:center;gap:15px}
.pill{width:40px;height:6px;background:${encre};flex:none;border-radius:1px}
.vis{position:relative;z-index:3;margin-top:44px;width:100%;aspect-ratio:16/9;border-radius:6px;
  overflow:hidden;background:#16161f;border:1px solid #262632}
.card.must .vis{border-color:${encre}}
.vis img{width:100%;height:100%;object-fit:cover;display:block}
.vis .ph{width:100%;height:100%;background:#16161f}
.no{position:absolute;left:0;bottom:0;z-index:4;font-family:"Big Shoulders Display";font-weight:900;
  font-size:132px;line-height:.78;color:#fff;padding:0 26px 12px;font-variant-numeric:tabular-nums;
  text-shadow:0 6px 34px #000c,0 2px 8px #000e}
.card.must .no{color:${encre}}
.star{position:absolute;right:26px;top:20px;z-index:4;font-family:"Big Shoulders Display";
  font-weight:900;font-size:76px;color:${encre};line-height:1;text-shadow:0 4px 22px #000c}
.txt{position:relative;z-index:3;margin-top:48px;flex:1;display:flex;flex-direction:column;
  justify-content:center}
.era{font-family:"Big Shoulders Display";font-weight:800;font-size:34px;letter-spacing:.13em;
  text-transform:uppercase;color:${encre};margin-bottom:20px}
.txt h2{font-family:"Big Shoulders Display";font-weight:900;font-size:112px;line-height:.94;
  text-transform:uppercase;letter-spacing:.004em;text-wrap:balance}
.txt h2.t2{font-size:96px} .txt h2.t3{font-size:78px;line-height:.98}
.line{display:flex;align-items:center;gap:24px;margin-top:34px;flex-wrap:wrap}
.bt{font-family:"Big Shoulders Display";font-weight:800;font-size:32px;letter-spacing:.1em;
  color:var(--bt);border:2px solid color-mix(in srgb,var(--bt) 50%,transparent);
  padding:5px 16px;border-radius:3px;line-height:1.2}
.dt{font-family:"Big Shoulders Display";font-weight:900;font-size:52px;color:#cfcde0;line-height:1}
.bar{position:relative;z-index:3;height:7px;background:#22222c;border-radius:4px;overflow:hidden}
.bar i{display:block;height:100%;background:${encre}}
.url{position:relative;z-index:3;margin-top:30px;text-align:center;
  font-family:"Big Shoulders Display";font-weight:800;font-size:38px;letter-spacing:.19em;
  text-transform:uppercase;color:#9d9bb2}

/* ---- accroche ---- */
.hook{justify-content:flex-end;padding:0}
.hook .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5}
.hook::before{content:"";position:absolute;inset:0;z-index:2;
  background:linear-gradient(180deg,#08080fbb 0%,#08080f44 30%,#08080fe8 70%,#08080f 100%)}
.hook .in{position:relative;z-index:3;padding:0 58px 190px}
.hook h1{font-family:"Big Shoulders Display";font-weight:900;font-size:186px;line-height:.84;
  text-transform:uppercase}
.hook .ord{font-family:"Big Shoulders Display";font-weight:900;font-size:112px;line-height:.9;
  color:${encre};text-transform:uppercase;margin-top:8px}
.hook .st{display:flex;gap:56px;margin-top:56px;padding-top:34px;border-top:3px solid ${encre}}
.hook .st div b{display:block;font-family:"Big Shoulders Display";font-weight:900;font-size:86px;
  line-height:.9;font-variant-numeric:tabular-nums}
.hook .st div span{display:block;margin-top:10px;font-family:"Big Shoulders Display";font-weight:800;
  font-size:30px;letter-spacing:.13em;text-transform:uppercase;color:#a8a6bc}

/* ---- fin ---- */
.out{justify-content:center;align-items:center;text-align:center;padding:0 58px;gap:0}
.out h2{font-family:"Big Shoulders Display";font-weight:900;font-size:128px;line-height:.9;
  text-transform:uppercase;position:relative;z-index:3}
.out .u{position:relative;z-index:3;font-family:"Big Shoulders Display";font-weight:900;font-size:104px;
  color:${encre};margin-top:44px;letter-spacing:.01em}
.out .s{position:relative;z-index:3;font-family:"Big Shoulders Display";font-weight:800;font-size:44px;
  letter-spacing:.13em;text-transform:uppercase;color:#a8a6bc;margin-top:26px}
.out .t{position:relative;z-index:3;margin-top:78px;padding-top:34px;border-top:2px solid #262632;
  font-family:"Big Shoulders Display";font-weight:800;font-size:34px;letter-spacing:.12em;
  text-transform:uppercase;color:#6f6d85}
</style>

<section class="f hook">
  ${cover ? `<img class="bg" src="${esc(cover)}" alt="">` : ''}
  <div class="in">
    <h1>${esc(nom)}</h1>
    <p class="ord">${esc(t.ordre)}</p>
    <div class="st">
      <div><b>${total}</b><span>${esc(t.entries)}</span></div>
      <div><b>${D.eras.length}</b><span>${esc(t.eras)}</span></div>
      <div><b>${esc(t.hookSub)}</b><span>${lang === 'en' ? 'guaranteed' : 'garanti'}</span></div>
    </div>
  </div>
</section>
${cartes.map(carte).join('')}
<section class="f out">
  <h2>${esc(t.outro1)}</h2>
  <p class="u">${esc(t.cta)}</p>
  <p class="s">${esc(t.outro2)}</p>
  <p class="t">${esc(t.outro3)}</p>
</section>`;
}

/* ---------- assemblage ---------- */

function monte(dossier, plans, sortie) {
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

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', f,
    /* une piste muette : TikTok et Instagram refusent une video sans audio */
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
    '-vf', 'fps=30,format=yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '96k',
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
  const dur = Number(val('--dur', '0.62'));
  const only = val('--only', null);
  const ere = a.includes('--ere') ? Number(val('--ere')) : null;
  const plus = new Set(String(val('--plus', '')).split(',').map(s => s.trim()).filter(Boolean));

  if (!cle) {
    console.error('usage : node _proto/video.mjs <' + Object.keys(UNIVERS).join('|') +
      '> [--lang en|fr] [--dur 0.62] [--only must|must+] [--ere N] [--plus id,id]');
    process.exit(1);
  }

  const D = charge(UNIVERS[cle].data + (lang === 'en' ? '-en' : ''));
  const cartes = suite(D, { only, ere, plus });
  for (const id of plus) {
    if (!cartes.some(c => c.id === id)) throw new Error(`--plus : aucune entree "${id}"`);
  }
  const total = suite(D, {}).length;
  if (!cartes.length) throw new Error('la selection ne retient aucune entree');

  const suffixe = [only, ere != null ? 'ere' + ere : null, plus.size ? 'plus' : null]
    .filter(Boolean).join('-');
  const nomFichier = `${cle}-${lang}${suffixe ? '-' + suffixe : ''}`;
  const dossier = path.join(RACINE, 'promo', 'video-' + nomFichier);
  fs.mkdirSync(dossier, { recursive: true });

  const html = page(cle, D, cartes, lang, total);
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
    plans.push({ img, dur: i === 0 ? 2.4 : i === cadres.length - 1 ? 3.4 : dur });
  }
  await nav.close();

  const mp4 = path.join(RACINE, 'promo', nomFichier + '.mp4');
  monte(dossier, plans, mp4);

  const secondes = plans.reduce((s, p) => s + p.dur, 0);
  const poids = (fs.statSync(mp4).size / 1048576).toFixed(1);
  console.log(`${nomFichier} — ${cartes.length} cartes, ${secondes.toFixed(1)} s, ${poids} Mo`);
  console.log(`→ promo/${nomFichier}.mp4`);
  if (secondes > 60) console.warn('  ⚠ au-dela de 60 s : hors format Shorts, et long pour TikTok');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
