// erreur404.mjs — la page servie quand l'URL ne mène nulle part.
//
// **Il n'y en avait aucune.** Toute la navigation du site passe par des URL
// sans extension — `/starwars`, pas `/starwars.html` —, donc une faute de
// frappe, un lien d'un vieux partage ou une adresse tapée de mémoire tombaient
// sur la page par défaut de GitHub Pages : fond blanc, un chat en pixel art,
// aucun menu, aucun retour. Quelqu'un qui arrive là repart.
//
// Deux fichiers, `/404.html` et `/fr/404.html` : GitHub Pages sert le `404.html`
// le plus proche du chemin demandé, donc une URL cassée sous `/fr/` reçoit la
// page française et le reste la page anglaise. C'est la seule raison pour
// laquelle il y en a deux.
//
// Trois choses à savoir :
//
//   · **Elle est en `noindex`, et c'est la seule page du site à l'être.**
//     `publier.mjs` retire le `noindex` des protos et sort en erreur s'il en
//     reste un — c'est son premier garde-fou. Cette page-ci n'y passe pas :
//     elle n'est pas dans `ROUTES`, elle est écrite ici de bout en bout.
//
//   · **Les noms d'univers sont lus dans les données**, comme le fait
//     `jsonld.mjs` pour ses fils d'Ariane. Une liste écrite ici serait la
//     troisième copie de la même chose, et celle qu'on oublierait au dixième
//     univers.
//
//   · **Elle ne charge ni `app.js`, ni données, ni service worker.** Une page
//     d'erreur doit répondre tout de suite et ne rien supposer de ce qui a
//     échoué : son style est en ligne, elle pèse quelques kilo-octets, et elle
//     n'a qu'un travail — rendre des chemins.

import { charge, SOURCES, decode } from './jsonld.mjs';

const T = {
  fr: {
    lang: 'fr', code: '404', titre: 'Page introuvable',
    dek: 'Cette adresse ne mène nulle part. Elle a peut-être changé, ou elle a été mal recopiée.',
    univers: 'Les timelines', pages: 'Le reste du site',
    accueil: 'Retour à l’accueil',
    nav: { dossiers: 'Dossiers', 'a-venir': 'À venir', nouveautes: 'Nouveautés' },
  },
  en: {
    lang: 'en', code: '404', titre: 'Page not found',
    dek: 'This address leads nowhere. It may have changed, or been mistyped.',
    univers: 'The timelines', pages: 'The rest of the site',
    accueil: 'Back to the home page',
    nav: { dossiers: 'Deep dives', 'a-venir': 'Upcoming', nouveautes: 'What’s new' },
  },
};

// Les neuf univers, dans l'ordre de l'accueil, avec leur encre de la charte.
const UNIVERS = [
  ['sw', '#4d9fff'], ['mcu', '#e23636'], ['dc', '#f5c842'], ['avatar', '#7dd3fc'],
  ['startrek', '#b48cf2'], ['twd', '#a8bf4f'], ['dragonage', '#e07b39'],
  ['assassinscreed', '#c0202f'], ['dcanimation', '#2dd4bf'],
];

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `*{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#08080f;--paper:#fffdf7;--hot:#f5c842}
body{background:var(--ink);color:var(--paper);min-height:100vh;
  font:16px/1.55 'Chivo',system-ui,-apple-system,'Segoe UI',sans-serif;
  display:flex;align-items:center;justify-content:center;padding:40px 20px}
.box{width:100%;max-width:760px;text-align:center}
.code{font-family:'Big Shoulders Display','Arial Narrow',sans-serif;font-weight:900;
  font-size:clamp(90px,22vw,180px);line-height:.85;color:var(--hot);letter-spacing:.02em}
h1{font-family:'Big Shoulders Display','Arial Narrow',sans-serif;font-weight:800;
  font-size:clamp(26px,6vw,40px);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}
.dek{margin:14px auto 0;max-width:46ch;color:rgba(255,253,247,.72);font-size:15px}
.lab{margin:34px 0 12px;font-family:'Big Shoulders Display','Arial Narrow',sans-serif;
  font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(255,253,247,.5)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.grid a{display:block;padding:11px 12px;text-decoration:none;color:var(--paper);
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:9px;
  border-left:3px solid var(--u);font-weight:700;font-size:14px;transition:background .15s}
.grid a:hover{background:rgba(255,255,255,.09)}
.row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.row a{padding:9px 14px;text-decoration:none;color:rgba(255,253,247,.82);font-size:13.5px;
  border:1px solid rgba(255,255,255,.10);border-radius:9px}
.row a:hover{color:var(--paper);border-color:rgba(255,255,255,.28)}
.home{display:inline-block;margin-top:28px;padding:12px 22px;background:var(--hot);
  color:var(--ink);text-decoration:none;font-weight:800;border-radius:9px;
  font-family:'Big Shoulders Display','Arial Narrow',sans-serif;font-size:17px;
  letter-spacing:.06em;text-transform:uppercase;
  clip-path:polygon(0 0,100% 0,calc(100% - 11px) 100%,0 100%);padding-right:30px}`;

/**
 * Rend la page 404 d'une langue. `urls` donne l'URL de chaque clé de route.
 */
export function erreur404({ racine, langue, urls }) {
  const t = T[langue];

  // Le nom que porte un univers dans ses propres données — « The Walking Dead »
  // plutôt que « twd ». C'est le repli que `jsonld.mjs` emploie déjà, et pour la
  // même raison : `CG.t.nav` ne porte que les quatre premiers.
  const nom = cle => {
    const [fichier, global] = SOURCES[cle][langue];
    return decode(charge(racine, fichier, global)[global].title);
  };

  const tuiles = UNIVERS
    .map(([cle, encre]) =>
      `<a href="${urls[cle]}" style="--u:${encre}">${esc(nom(cle))}</a>`)
    .join('');

  const liens = ['dossiers', 'a-venir', 'nouveautes']
    .map(cle => `<a href="${urls[cle]}">${esc(t.nav[cle])}</a>`)
    .join('');

  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,follow"/>
<title>${esc(t.titre)} | Chronologeek</title>
<link rel="icon" type="image/png" href="/images/icon-192.png"/>
<meta name="theme-color" content="#08080f"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=Chivo:wght@400;700&display=swap"/>
<style>${CSS}</style>
</head>
<body>
<main class="box">
  <p class="code">${t.code}</p>
  <h1>${esc(t.titre)}</h1>
  <p class="dek">${esc(t.dek)}</p>
  <p class="lab">${esc(t.univers)}</p>
  <div class="grid">${tuiles}</div>
  <p class="lab">${esc(t.pages)}</p>
  <div class="row">${liens}</div>
  <p><a class="home" href="${urls.accueil}">${esc(t.accueil)}</a></p>
</main>
</body>
</html>
`;
}
