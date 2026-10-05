/* Video de presentation du site, verticale 1080x1920, avec voix off.
   node _proto/presentation.mjs [--lang en|fr] [--voix en-US-AndrewMultilingualNeural] [--debit +8%] [--sans-capture]

   Pour l'epingle de TikTok, Instagram et YouTube : ce que fait le site, en dix
   plans, chacun une vraie capture du site a 390 px. Coupe nette entre les
   plans, comme les videos d'univers (choix de Niko du 6 septembre 2026).

   La voix vient d'edge-tts (`pip install edge-tts`), gratuit, rien a payer : le
   texte part chez Microsoft, qui rend un MP3. Chaque plan dure le temps de sa
   phrase, plus une respiration — changer un texte recale tout seul le montage.

   Les captures se font sur le site servi en local par serveur.py, donc sur ce
   qui sortira de la prochaine publication. --sans-capture reprend celles du
   passage precedent (utile pour ne changer que la voix ou un texte).

   Anglais par defaut, comme les autres videos : le compte vise l'international. */

import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const fichier = p => 'file:///' + path.join(RACINE, p).replace(/\\/g, '/');

const DOUZE = ['#4d9fff','#e23636','#f5c842','#7dd3fc','#b48cf2','#a8bf4f',
               '#e07b39','#d4a02c','#2dd4bf','#45c46b','#b0bec5','#dc0000'];
const FILET = 'linear-gradient(90deg,' + DOUZE.map((c, i) =>
  `${c} ${(i * 100 / 12).toFixed(2)}% ${((i + 1) * 100 / 12).toFixed(2)}%`).join(',') + ')';
/* les couvertures des douze univers, dans l'ordre de l'accueil */
const COUV = ['starwars-banner','mcu','dcmultivers','avatar','startrek','twd',
              'dragonage','acuniverse','dcanimation','jurassicworld','witcher','residentevil'];

/* Les plans. `cap` est la capture (voir CAPTURES), `dit` la voix, `lit` le
   titre a l'ecran — plus court que la voix : on regarde ces videos sans le son,
   le titre doit tenir seul. `*mot*` passe le mot a l'or. */
const PLANS = {
  en: [
    { cap: null,      lit: 'What order do I *watch it in?*',
      dit: 'Twelve sagas. Over a thousand stories. So, what order do you watch them in?' },
    { cap: 'home',    kick: 'chronologeek.app', lit: '12 universes, *in story order*',
      dit: 'Chronologeek puts every one of them in story order. For free.' },
    { cap: 'cartes',  lit: 'Star Wars, Marvel, DC *and 9 more*',
      dit: 'Star Wars, Marvel, DC, Star Trek, The Witcher, Resident Evil, and more.' },
    { cap: 'sw',      lit: 'Every saga is a *metro line*',
      dit: 'Every saga is a metro line. Every era, a station.' },
    { cap: 'arrets',  lit: 'Check it off. *The train follows.*',
      dit: "Every movie, show, game and book is a stop. Check what you've seen, and the train follows you." },
    { cap: 'voies',   lit: 'Pick *your track*',
      dit: 'First time, rewatch, or release order? Pick your track.' },
    { cap: 'fiche',   lit: 'Synopsis, trailer, *where to stream*',
      dit: 'Tap any stop for the synopsis, the trailer, and where to stream it.' },
    { cap: 'cherche', lit: 'Search *every universe*',
      dit: 'Search any title, across every universe.' },
    { cap: 'radar',   lit: "What's next, *updated daily*",
      dit: "And the release radar shows what's coming next, updated every morning." },
    { cap: null,      fin: true,
      dit: 'No account. No spoilers. Chronologeek dot app.' },
  ],
  fr: [
    { cap: null,      lit: 'Dans quel ordre *les regarder ?*',
      dit: 'Douze sagas. Plus de mille œuvres. Alors, dans quel ordre les regarder ?' },
    { cap: 'home',    kick: 'chronologeek.app', lit: '12 univers, *dans l’ordre*',
      dit: 'Chronologeek les remet toutes dans l’ordre de l’histoire. Gratuitement.' },
    { cap: 'cartes',  lit: 'Star Wars, Marvel, DC *et 9 autres*',
      dit: 'Star Wars, Marvel, DC, Star Trek, The Witcher, Resident Evil, et d’autres.' },
    { cap: 'sw',      lit: 'Chaque saga est *une ligne de métro*',
      dit: 'Chaque saga est une ligne de métro. Chaque époque, une station.' },
    { cap: 'arrets',  lit: 'Cochez. *Le train vous suit.*',
      dit: 'Chaque film, série, jeu ou livre est un arrêt. Cochez ce que vous avez vu, et le train vous suit.' },
    { cap: 'voies',   lit: 'Choisissez *votre voie*',
      dit: 'Première fois, revisionnage, ou ordre de sortie ? Choisissez votre voie.' },
    { cap: 'fiche',   lit: 'Résumé, bande-annonce, *où regarder*',
      dit: 'Touchez un arrêt pour le résumé, la bande-annonce, et où le regarder.' },
    { cap: 'cherche', lit: 'Cherchez *partout*',
      dit: 'Cherchez n’importe quel titre, dans tous les univers.' },
    { cap: 'radar',   lit: 'Les sorties, *chaque matin*',
      dit: 'Et le radar des sorties annonce la suite, mis à jour chaque matin.' },
    { cap: null,      fin: true,
      dit: 'Sans compte. Sans spoiler. Chronologeek point app.' },
  ],
};
const FIN = {
  en: { l1: 'Free', l2: 'No account', l3: 'No spoilers', bio: 'Link in bio' },
  fr: { l1: 'Gratuit', l2: 'Sans compte', l3: 'Sans spoiler', bio: 'Lien en bio' },
};
/* voix feminines, choix de Niko du 5 octobre 2026. L'anglaise n'est pas la
   « Multilingual » : celle-ci devine la langue phrase par phrase, et sur
   « Chronolo-geek dot app » elle changeait d'accent a la derniere phrase. */
const VOIX = { en: 'en-US-AvaNeural', fr: 'fr-FR-VivienneMultilingualNeural' };
/* « geek » se dit « guik », comme le mot : d'un seul tenant, la synthese lisait
   « chronolo-djik ». Le texte affiche n'est pas touche, seul ce qui est lu. */
const PRONONCE = { en: [/Chronologeek/g, 'Chronolo-geek'], fr: [/Chronologeek/g, 'Chronolo-guik'] };

/* respiration apres chaque phrase, et la fin tient plus longtemps : on y lit
   une adresse */
const SOUFFLE = 0.35, ENTREE = 0.12, FIN_EN_PLUS = 1.6;

/* ---------- captures ---------- */

const VUE = { width: 390, height: 744 };   /* 780x1488 a x2, le cadre du telephone */

function portLibre() {
  return new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
}

async function captures(lang, dossier) {
  const port = await portLibre();
  const serveur = spawn('py', [path.join(ICI, 'serveur.py'), String(port)], { cwd: RACINE, stdio: 'ignore' });
  const B = `http://localhost:${port}` + (lang === 'fr' ? '/fr' : '');
  const SW = lang === 'fr' ? '/starwars' : '/starwars', UP = lang === 'fr' ? '/a-venir' : '/upcoming';
  try {
    for (let i = 0; i < 40; i++) {
      try { await fetch(B + '/'); break; } catch { await new Promise(r => setTimeout(r, 250)); }
    }
    const nav = await chromium.launch();
    const ctx = await nav.newContext({ viewport: VUE, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    /* une progression de visiteur : sept arrets coches, pour que la ligne ait un
       train et des coches a montrer. Pas d'ecran d'arrivee, pas de barre
       d'installation : ils couvriraient la page. */
    await ctx.addInitScript(() => { try {
      sessionStorage.setItem('cg-boot', '1');
      const sw = {}; ['sw-ep1','sw-ep2','sw-tcw-film','sw-ep3','sw-solo','sw-kenobi','sw-andor1'].forEach(i => sw[i] = 1);
      localStorage.setItem('cg-proto-sw', JSON.stringify(sw));
      localStorage.setItem('cg-proto-sw-mode', 'first');
      localStorage.removeItem('cg-proto-mcu-mode');
    } catch (e) {} });
    const p = await ctx.newPage();
    const va = async u => {
      await p.goto(B + u, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(1600);
    };
    const prends = async nom => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(dossier, nom + '.png') }); };

    await va('/');                                   await prends('home');
    await p.evaluate(() => window.scrollTo(0, 1500)); await prends('cartes');
    await va(SW);                                    await prends('sw');
    await p.evaluate(() => window.scrollTo(0, 1800)); await prends('arrets');
    await va('/marvel');                             await prends('voies');

    await va('/');
    const champ = p.locator('input[type=search]').first();
    await champ.scrollIntoViewIfNeeded(); await champ.click();
    await champ.type('andor', { delay: 60 }); await p.waitForTimeout(1200);
    await p.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); window.scrollBy(0, r.top - 150); });
    await prends('cherche');

    /* la fiche attend TMDB : synopsis, note, plateformes, bande-annonce */
    await va(SW + '#sw-rogue');
    const tete = p.locator('[data-id="sw-rogue"] .bu-head').first();
    await tete.scrollIntoViewIfNeeded(); await tete.click(); await p.waitForTimeout(3500);
    await p.evaluate(() => { const r = document.querySelector('[data-id="sw-rogue"]').getBoundingClientRect(); window.scrollBy(0, r.top - 120); });
    await prends('fiche');

    await va(UP); await p.evaluate(() => window.scrollTo(0, 1000)); await prends('radar');
    await nav.close();
  } finally { serveur.kill(); }
}

/* ---------- voix ---------- */

const duree = f => Number(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0', f]).toString().trim());

function voix(plans, lang, voixNom, debit, dossier) {
  plans.forEach((pl, i) => {
    const mp3 = path.join(dossier, `voix-${i}.mp3`);
    execFileSync('py', ['-m', 'edge_tts', '--voice', voixNom, `--rate=${debit}`, '--text', pl.dit.replace(...PRONONCE[lang]), '--write-media', mp3], { stdio: 'ignore' });
    /* edge-tts laisse un tiers de seconde de silence en fin de phrase : on le
       retire, sinon il s'ajoute a la respiration et le montage traine */
    const wav = path.join(dossier, `voix-${i}.wav`);
    execFileSync('ffmpeg', ['-y','-loglevel','error','-i', mp3,
      '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar','48000','-ac','2', wav]);
    pl.mp3 = wav;
    pl.parle = duree(wav);
    pl.dur = ENTREE + pl.parle + SOUFFLE + (pl.fin ? FIN_EN_PLUS : 0);
  });
}

/* ---------- plans ---------- */

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const or = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

function page(plans, lang, dossier) {
  const F = FIN[lang];
  const tuiles = COUV.map(n => {
    const ext = ['.webp','.png','.jpg'].find(e => fs.existsSync(path.join(RACINE, 'images', n + e)));
    return `<i style="background-image:url('${fichier('images/' + n + ext)}')"></i>`;
  }).join('');
  const cadre = (pl, i) => {
    if (pl.fin) return `<section class="f fin">
  <div class="filet"></div>
  <img class="logo" src="${fichier('images/logo-chronologeek.webp')}" alt="">
  <div class="url">chronologeek.app</div>
  <div class="trois"><span>${F.l1}</span><b></b><span>${F.l2}</span><b></b><span>${F.l3}</span></div>
  <div class="ligne">${DOUZE.map(c => `<s style="--c:${c}"></s>`).join('')}</div>
  <div class="bio">${F.bio}</div>
</section>`;
    if (!pl.cap) return `<section class="f hook">
  <div class="mur">${tuiles}</div><div class="voile"></div>
  <div class="filet"></div>
  <h1>${or(pl.lit)}</h1>
  <div class="rail12"></div>
</section>`;
    const img = 'file:///' + path.join(dossier, pl.cap + '.png').replace(/\\/g, '/');
    return `<section class="f ecran">
  <div class="fond" style="background-image:url('${img}')"></div>
  <div class="filet"></div>
  ${pl.kick ? `<div class="kick">${esc(pl.kick)}</div>` : `<div class="num">${String(i).padStart(2,'0')} / ${String(plans.length - 2).padStart(2,'0')}</div>`}
  <h2>${or(pl.lit)}</h2>
  <div class="tel"><img src="${img}" alt=""></div>
</section>`;
  };
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${fichier('fonts/bigshoulders-latin.woff2')}) format('woff2')}
@font-face{font-family:'Big Shoulders Display';font-weight:100 900;src:url(${fichier('fonts/bigshoulders-latin-ext.woff2')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF}
@font-face{font-family:'Chivo';font-weight:100 900;src:url(${fichier('fonts/chivo-latin.woff2')}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000}
.f{position:relative;width:1080px;height:1920px;overflow:hidden;background:#08080f;color:#f4efe6;font-family:'Chivo',sans-serif}
.filet{position:absolute;left:0;right:0;top:0;height:14px;background:${FILET};border-bottom:3px solid #f4efe6;z-index:5}
.rail12{position:absolute;left:0;right:0;bottom:0;height:14px;background:${FILET};border-top:3px solid #f4efe6;z-index:5}
em{font-style:normal;color:#f0c97c}
h1,h2{font-family:'Big Shoulders Display',sans-serif;font-weight:900;text-transform:uppercase;text-align:center;line-height:.92;letter-spacing:.005em}

/* accroche : les douze univers en mur, le titre par-dessus */
.mur{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(6,1fr)}
.mur i{background-size:cover;background-position:center;border:2px solid #08080f}
.voile{position:absolute;inset:0;background:radial-gradient(ellipse 90% 45% at 50% 50%,rgba(8,8,15,.92),rgba(8,8,15,.55) 75%,rgba(8,8,15,.35))}
.hook h1{position:absolute;left:60px;right:60px;top:50%;transform:translateY(-55%);font-size:168px;text-shadow:0 6px 30px rgba(0,0,0,.6)}

/* un plan : le titre en haut, le telephone dessous, la meme capture floutee au fond */
.fond{position:absolute;inset:-60px;background-size:cover;background-position:center top;filter:blur(38px) brightness(.38) saturate(1.2)}
.kick,.num{position:absolute;top:120px;left:0;right:0;text-align:center;font-family:'Big Shoulders Display';font-weight:800;font-size:40px;letter-spacing:.14em;text-transform:uppercase;color:#f0c97c}
.kick{text-transform:none;letter-spacing:.04em}
.ecran h2{position:absolute;left:50px;right:50px;top:182px;font-size:104px;text-shadow:0 4px 20px rgba(0,0,0,.5)}
.tel{position:absolute;left:50%;top:470px;width:744px;transform:translateX(-50%);border-radius:52px;padding:12px;background:#15151f;
  box-shadow:0 0 0 3px rgba(244,239,230,.18),0 40px 90px rgba(0,0,0,.75)}
.tel img{display:block;width:720px;height:1374px;object-fit:cover;object-position:top;border-radius:42px}

/* fin */
.fin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  background:radial-gradient(ellipse 80% 50% at 50% 45%,#1b1b2c,#08080f 70%)}
.fin .logo{width:860px;height:auto;margin-top:-120px}
.fin .url{margin-top:70px;font-family:'Big Shoulders Display';font-weight:900;font-size:132px;color:#f0c97c;letter-spacing:.01em}
.fin .trois{margin-top:46px;display:flex;align-items:center;gap:26px;font-family:'Big Shoulders Display';font-weight:800;font-size:54px;text-transform:uppercase;letter-spacing:.06em}
.fin .trois b{width:14px;height:14px;border-radius:50%;background:#f0c97c}
.fin .ligne{margin-top:90px;display:flex;align-items:center;width:860px;height:16px;background:${FILET};border-radius:8px;justify-content:space-between;padding:0 4px}
.fin .ligne s{width:34px;height:34px;border-radius:50%;background:#08080f;border:6px solid var(--c)}
.fin .bio{margin-top:70px;font-size:44px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,239,230,.7)}
</style></head><body>
${plans.map(cadre).join('\n')}
</body></html>`;
}

/* ---------- montage ---------- */

function monte(plans, dossier, sortie) {
  const total = plans.reduce((s, p) => s + p.dur, 0);
  const liste = plans.map(p => `file '${p.img.replace(/\\/g,'/')}'\nduration ${p.dur.toFixed(3)}`).join('\n')
    + `\nfile '${plans[plans.length - 1].img.replace(/\\/g,'/')}'\n`;
  fs.writeFileSync(path.join(dossier, '_plans.txt'), liste, 'utf8');

  /* chaque phrase calee au debut de son plan, du silence jusqu'au suivant */
  const morceaux = plans.map((p, i) => {
    const wav = path.join(dossier, `piste-${i}.wav`);
    execFileSync('ffmpeg', ['-y','-loglevel','error','-i', p.mp3,
      '-af', `aresample=48000,adelay=${Math.round(ENTREE * 1000)}:all=1,apad=whole_dur=${p.dur.toFixed(3)},atrim=0:${p.dur.toFixed(3)}`,
      '-ac','2','-ar','48000', wav]);
    return `file '${wav.replace(/\\/g,'/')}'`;
  });
  fs.writeFileSync(path.join(dossier, '_voix.txt'), morceaux.join('\n'), 'utf8');

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', path.join(dossier, '_plans.txt'),
    '-f', 'concat', '-safe', '0', '-i', path.join(dossier, '_voix.txt'),
    '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
    '-vf', 'fps=30,format=yuv420p', '-r', '30',
    /* -16 LUFS : le niveau que TikTok et YouTube visent, la voix ne sort ni
       ecrasee ni noyee sous un son ajoute dans l'application */
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart',
    sortie,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  return total;
}

async function main() {
  const a = process.argv.slice(2);
  const val = (n, d) => a.includes(n) ? a[a.indexOf(n) + 1] : d;
  const lang = val('--lang', 'en') === 'fr' ? 'fr' : 'en';
  const voixNom = val('--voix', VOIX[lang]);
  const debit = val('--debit', '+8%');
  const plans = PLANS[lang].map(p => ({ ...p }));

  const dossier = path.join(RACINE, 'promo', 'presentation-' + lang);
  fs.mkdirSync(dossier, { recursive: true });

  if (!a.includes('--sans-capture')) await captures(lang, dossier);
  for (const p of plans) if (p.cap && !fs.existsSync(path.join(dossier, p.cap + '.png')))
    throw new Error(`capture absente : ${p.cap}.png (relancer sans --sans-capture)`);

  voix(plans, lang, voixNom, debit, dossier);

  const apercu = path.join(dossier, '_apercu.html');
  fs.writeFileSync(apercu, page(plans, lang, dossier), 'utf8');
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file:///' + apercu.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 30000 });
  const cadres = await p.$$('.f');
  for (let i = 0; i < cadres.length; i++) {
    plans[i].img = path.join(dossier, 'plan-' + String(i).padStart(2, '0') + '.png');
    await cadres[i].screenshot({ path: plans[i].img });
  }
  await nav.close();

  const mp4 = path.join(RACINE, 'promo', `presentation-${lang}.mp4`);
  const total = monte(plans, dossier, mp4);
  console.log(plans.map((p, i) => `  ${String(i).padStart(2)}  ${p.dur.toFixed(2)} s  ${p.dit}`).join('\n'));
  console.log(`presentation-${lang} — ${plans.length} plans, ${total.toFixed(1)} s, voix ${voixNom}, ${(fs.statSync(mp4).size / 1048576).toFixed(1)} Mo`);
  console.log(`→ promo/presentation-${lang}.mp4`);
  if (total > 60.05) console.warn('  ⚠ au-dela de 60 s : trop long pour une musique TikTok');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
