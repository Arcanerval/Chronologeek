#!/usr/bin/env node
/* verifier.mjs — ouvre les pages publiées dans un vrai navigateur et sort en
   erreur sur tout ce qui casse sans le dire.

   C'est le mode de défaillance propre à ce dépôt : le fichier se charge, la
   console reste vide, et la page est fausse — « undefined » dans la barre de
   reprise, une image morte, une ancre que le JS ne pose plus. Aucune lecture
   de fichier ne le voit, la moitié du contenu étant écrite au chargement.
   Ce script charge donc chaque page comme un visiteur, à deux largeurs, et
   relève ce que le DOM dit.

     node _proto/verifier.mjs              toutes les pages
     node _proto/verifier.mjs starwars dc  seulement les URL qui contiennent ces mots

   `publier.mjs` l'appelle à la fin, hors GitHub Actions (pas de navigateur
   là-bas). Il sert le site lui-même, avec le même mappage que `serveur.py`
   — les URL sans extension —, sur un port libre : rien à lancer à côté.

   Ce qui est vérifié, page par page :
     · aucune erreur JS, ni dans la console ni non rattrapée ;
     · aucune ressource du site en 404 (une ressource extérieure qui échoue
       n'est qu'un avertissement : TMDB n'est pas à nous) ;
     · aucune image locale morte (`naturalWidth === 0`), lazy comprises ;
     · ni « undefined », ni « NaN », ni « [object Object] » dans le texte,
       replié ou non ;
     · un seul h1 ;
     · le pré-rendu remplacé par le rendu du JS (`.pr` disparu) ;
     · chaque ancre de l'`ItemList` présente dans le DOM ;
     · le service worker installé (PRECACHE complet) ;
     · aucun contenu coupé par le bord de l'écran, à 1366 et à 375 px ;
     · tout lien interne mène à un fichier qui existe. */

import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = dirname(ICI);
const FILTRES = process.argv.slice(2).filter(a => !a.startsWith('--'));

/* ── Les URL, lues dans ROUTES de publier.mjs ─────────────────────────── */

function urlsDeRoutes() {
  const src = readFileSync(join(ICI, 'publier.mjs'), 'utf8');
  const debut = src.indexOf('const ROUTES');
  const bloc = src.slice(debut, src.indexOf('\n];', debut));
  const urls = [...bloc.matchAll(/url:\s*'([^']+)'/g)].map(m => m[1]);
  if (!urls.length) throw new Error('ROUTES illisible dans publier.mjs');
  return urls;
}

/* ── Le serveur, au mappage de GitHub Pages ───────────────────────────── */

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json', '.ics': 'text/calendar',
};

/* Le chemin d'URL → le fichier que GitHub Pages servirait, ou null. */
function fichierDe(chemin) {
  let p;
  try { p = decodeURIComponent(chemin.split(/[?#]/)[0]); } catch { return null; }
  const abs = normalize(join(RACINE, p));
  if (!abs.startsWith(RACINE)) return null;
  if (existsSync(abs) && statSync(abs).isDirectory()) {
    const idx = join(abs, 'index.html');
    return existsSync(idx) ? idx : null;
  }
  if (existsSync(abs)) return abs;
  if (!extname(abs) && existsSync(abs + '.html')) return abs + '.html';
  return null;
}

function serveur() {
  const srv = createServer((req, res) => {
    const f = fichierDe(req.url);
    if (!f) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(readFileSync(f));
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

/* ── Ce qui se mesure dans la page ────────────────────────────────────── */

/* Exécuté dans le navigateur. Rend une liste de problèmes, et la liste des
   liens internes à contrôler côté disque. */
async function relever(largeur) {
  const P = [];
  const ici = location.origin;

  // Les images lazy ne sont demandées qu'à l'écran : on les force, puis on
  // attend qu'elles aient répondu, bien ou mal.
  const imgs = [...document.images].filter(i => i.getAttribute('src'));
  imgs.forEach(i => { i.loading = 'eager'; });
  await Promise.race([
    Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => {
      i.addEventListener('load', r, { once: true });
      i.addEventListener('error', r, { once: true });
    }))),
    new Promise(r => setTimeout(r, 15000)),
  ]);
  const mortes = imgs.filter(i => i.complete && i.naturalWidth === 0);
  for (const i of mortes) {
    const src = i.currentSrc || i.src;
    P.push({ grave: src.startsWith(ici), quoi: 'image morte : ' + src.replace(ici, '') });
  }

  // Le texte, replié compris : innerText ignore les <details> fermés, on y
  // ajoute leur textContent sans les ouvrir (l'ouverture déclenche TMDB).
  const morceaux = [document.body.innerText];
  document.querySelectorAll('details:not([open])').forEach(d => {
    const c = d.cloneNode(true);
    c.querySelectorAll('script,style,template').forEach(n => n.remove());
    morceaux.push(c.textContent);
  });
  const texte = morceaux.join('\n');
  for (const mot of ['undefined', 'NaN', '[object Object]']) {
    const re = new RegExp('(^|[^\\w])' + mot.replace(/[[\]]/g, '\\$&') + '(?![\\w])', 'g');
    const n = (texte.match(re) || []).length;
    if (n) {
      const i = texte.search(re);
      const autour = texte.slice(Math.max(0, i - 40), i + mot.length + 40).replace(/\s+/g, ' ').trim();
      P.push({ grave: true, quoi: `« ${mot} » ×${n} dans le texte — …${autour}…` });
    }
  }

  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) P.push({ grave: true, quoi: `${h1} h1 au lieu d'un` });

  if (document.querySelector('#timeline .pr')) {
    P.push({ grave: true, quoi: 'le pré-rendu est resté : le JS n\'a pas rendu la timeline' });
  }

  // Les ancres que le JSON-LD promet aux moteurs.
  let ancres = 0;
  const manquantes = [];
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    let d; try { d = JSON.parse(s.textContent); } catch { P.push({ grave: true, quoi: 'JSON-LD illisible' }); continue; }
    for (const b of [].concat(d)) {
      if (b['@type'] !== 'ItemList') continue;
      for (const el of b.itemListElement || []) {
        const url = (el.item && el.item.url) || el.url || '';
        const h = url.indexOf('#');
        if (h < 0) continue;
        ancres++;
        const id = decodeURIComponent(url.slice(h + 1));
        if (!document.getElementById(id)) manquantes.push(id);
      }
    }
  }
  if (manquantes.length) {
    P.push({ grave: true, quoi: `${manquantes.length}/${ancres} ancre(s) de l'ItemList absente(s) du DOM : ` +
      manquantes.slice(0, 6).join(', ') + (manquantes.length > 6 ? '…' : '') });
  }

  // Le service worker : `addAll` est tout ou rien, et un seul fichier de
  // PRECACHE absent fait échouer l'installation sans un mot.
  if ('serviceWorker' in navigator) {
    const sw = await Promise.race([
      navigator.serviceWorker.ready.then(() => true),
      new Promise(r => setTimeout(() => r(false), 10000)),
    ]);
    if (!sw) P.push({ grave: true, quoi: 'service worker non installé (un fichier de PRECACHE manque ?)' });
  }

  // Le débordement. `html` porte `overflow-x:clip` : un élément trop large ne
  // fait plus défiler la page, il est coupé — sans barre, sans un mot. On
  // cherche donc le contenu réel (texte, image, bouton, champ) qui sort de
  // l'écran sans être dans un conteneur qui le rogne ou le fait défiler.
  const W = window.innerWidth;
  const rogne = n => {
    for (let a = n.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/hidden|clip|auto|scroll/.test(cs.overflowX)) return true;
      if (cs.position === 'fixed') return true;           // tiroir, barre, dialogue
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    }
    return false;
  };
  const coupes = [];
  for (const n of document.body.querySelectorAll('*')) {
    const contenu = /^(IMG|BUTTON|INPUT|SELECT|TEXTAREA|VIDEO)$/.test(n.tagName) ||
      [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
    if (!contenu) continue;
    const r = n.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // À cheval sur un bord : visible en partie, coupé pour le reste. Ce qui est
    // entièrement dehors est voulu — liens d'évitement à −10 000 px, tiroirs.
    const aCheval = (r.right > W + 1 && r.left < W - 1) || (r.left < -1 && r.right > 1);
    if (!aCheval) continue;
    const cs = getComputedStyle(n);
    if (cs.visibility === 'hidden' || cs.position === 'fixed' || +cs.opacity === 0) continue;
    if (n.closest('[aria-hidden="true"],[hidden],.sr-only,.visually-hidden')) continue;
    if (rogne(n)) continue;
    coupes.push(n);
  }
  if (coupes.length) {
    const nom = n => n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
      (n.classList.length ? '.' + [...n.classList].join('.') : '');
    const pire = coupes.reduce((m, n) => n.getBoundingClientRect().right > m.getBoundingClientRect().right ? n : m);
    const dep = Math.round(pire.getBoundingClientRect().right - W);
    P.push({ grave: true, quoi: `${coupes.length} élément(s) coupé(s) par le bord à ${largeur} px — ` +
      `${nom(pire)} dépasse de ${dep} px (« ${(pire.textContent || pire.alt || '').trim().slice(0, 40)} »)` });
  }

  // Un <a> de SVG porte un `href` objet : on lit l'attribut.
  const liens = [...new Set([...document.querySelectorAll('a[href]')]
    .map(a => { try { return new URL(a.getAttribute('href'), location.href).href; } catch { return ''; } })
    .filter(h => h.startsWith(ici))
    .map(h => h.slice(ici.length).split('#')[0]).filter(Boolean))];

  return { P, liens, ancres };
}

/* ── Une page, à une largeur ──────────────────────────────────────────── */

const LARGEURS = [{ nom: 'bureau', width: 1366, height: 900 }, { nom: 'mobile', width: 375, height: 812 }];

async function verifier(nav, base, url, vue) {
  const ctx = await nav.newContext({
    viewport: { width: vue.width, height: vue.height },
    ...(vue.nom === 'mobile' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
  });
  // La mesure d'audience ne doit pas compter nos passages.
  await ctx.route(/goatcounter/, r => r.abort());
  const page = await ctx.newPage();
  const P = [];
  page.on('pageerror', e => P.push({ grave: true, quoi: 'erreur JS : ' + String(e.message || e).split('\n')[0] }));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/^Failed to load resource/.test(t)) return;   // relevé par la réponse, avec son URL
    P.push({ grave: true, quoi: 'console : ' + t.split('\n')[0].slice(0, 200) });
  });
  page.on('response', r => {
    if (r.status() < 400) return;
    const u = r.url();
    const local = u.startsWith(base);
    P.push({ grave: local, quoi: `${r.status()} sur ${local ? u.slice(base.length) : u}` });
  });
  page.on('requestfailed', r => {
    const u = r.url();
    if (/goatcounter/.test(u)) return;
    const local = u.startsWith(base);
    P.push({ grave: local, quoi: `requête échouée (${r.failure()?.errorText}) : ${local ? u.slice(base.length) : u}` });
  });

  let res = { liens: [], ancres: 0 };
  try {
    await page.goto(base + url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(400);
    res = await page.evaluate(relever, vue.width);
    P.push(...res.P);
  } catch (e) {
    P.push({ grave: true, quoi: 'chargement impossible : ' + String(e.message).split('\n')[0] });
  }
  await ctx.close();
  return { url, vue: vue.nom, P, liens: res.liens, ancres: res.ancres };
}

/* ── Le tout ──────────────────────────────────────────────────────────── */

async function main() {
  let urls = urlsDeRoutes();
  if (FILTRES.length) urls = urls.filter(u => FILTRES.some(f => u.includes(f)));
  if (!urls.length) { console.error('aucune page ne correspond'); process.exit(1); }

  const srv = await serveur();
  const base = `http://127.0.0.1:${srv.address().port}`;
  let nav;
  try { nav = await chromium.launch(); }
  catch (e) {
    srv.close();
    console.error('Chromium introuvable : `npx playwright install chromium`, puis relancer.');
    process.exit(2);
  }

  const t0 = Date.now();
  const taches = urls.flatMap(u => LARGEURS.map(v => [u, v]));
  const resultats = [];
  let i = 0;
  const ouvrier = async () => {
    while (i < taches.length) {
      const [u, v] = taches[i++];
      resultats.push(await verifier(nav, base, u, v));
    }
  };
  await Promise.all(Array.from({ length: 4 }, ouvrier));
  await nav.close();
  srv.close();

  // Les liens internes, contrôlés une fois chacun sur le disque.
  const liens = new Map();
  for (const r of resultats) for (const l of r.liens) {
    if (!liens.has(l)) liens.set(l, new Set());
    liens.get(l).add(r.url);
  }
  const morts = [...liens].filter(([l]) => !fichierDe(l));

  // Le rapport, une ligne par problème, les deux largeurs fusionnées quand
  // elles disent la même chose.
  let graves = 0, avert = 0;
  const parPage = new Map();
  for (const r of resultats) {
    if (!parPage.has(r.url)) parPage.set(r.url, new Map());
    const m = parPage.get(r.url);
    for (const p of r.P) {
      const k = (p.grave ? '!' : '?') + p.quoi;
      if (!m.has(k)) m.set(k, new Set());
      m.get(k).add(r.vue);
    }
  }
  console.log('— vérification au navigateur —\n');
  for (const u of urls) {
    const m = parPage.get(u);
    const anc = Math.max(...resultats.filter(r => r.url === u).map(r => r.ancres));
    const g = [...m.keys()].filter(k => k[0] === '!').length;
    console.log(`  ${g ? '✗' : '✓'} ${u.padEnd(26)}${anc ? `${anc} ancres` : ''}`);
    for (const [k, vues] of m) {
      const largeurs = vues.size === LARGEURS.length ? '' : ` [${[...vues].join(', ')}]`;
      if (k[0] === '!') { graves++; console.log(`      · ${k.slice(1)}${largeurs}`); }
      else { avert++; if (process.argv.includes('--tout')) console.log(`      ~ ${k.slice(1)}${largeurs}`); }
    }
  }
  for (const [l, depuis] of morts) {
    graves++;
    console.log(`  ✗ lien mort ${l}  (depuis ${[...depuis].slice(0, 3).join(', ')})`);
  }

  const s = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`\n  ${urls.length} pages × ${LARGEURS.length} largeurs, ${liens.size} liens internes, ${s} s.`);
  if (avert) console.log(`  ${avert} avertissement(s) sur des ressources extérieures (--tout pour les voir).`);
  if (graves) { console.error(`  ${graves} PROBLÈME(S).`); process.exit(1); }
  console.log('  Aucun problème.');
}

main().catch(e => { console.error(e.stack || e); process.exit(1); });
