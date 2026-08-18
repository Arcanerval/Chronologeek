// jsonld.mjs — les données structurées, posées par publier.mjs.
//
// Les vingt-deux pages n'avaient pas une ligne de JSON-LD, alors qu'une timeline
// chronologique est exactement ce qu'`ItemList` décrit et chaque entrée un
// `Movie`, une `TVSeries` ou un `Book`. C'est le seul gain de référencement qui
// ne se voit pas à l'écran : rien à redessiner, un `<script type="application/
// ld+json">` en tête de page.
//
// Trois blocs, jamais plus :
//   · `WebSite`        — l'accueil seul, dans sa langue ;
//   · `BreadcrumbList` — toutes les pages sauf l'accueil ; c'est le seul des
//     trois qui donne un résultat enrichi chez Google, et il ne coûte rien ;
//   · `ItemList`       — les six univers, la liste des Dossiers et l'accueil.
//     Chaque élément porte son ancre, son nom et son visuel.
//
// **Le Dossier n'a pas d'`ItemList`, et c'est délibéré.** Ses 534 œuvres
// pesaient 10 Ko brotli et faisaient passer la page de 65 à 168 Ko de HTML brut
// — sur celle qui était déjà la plus lourde du site — pour un gain nul en
// résultat enrichi : Google ne fait pas de carrousel de livres. Il garde son
// fil d'Ariane. Ne pas la rétablir sans une raison qui vaille ce poids.
//
// Ce que le script ne fait pas : lire les pages publiées. Il lit les mêmes
// `_proto/data*.js` que `publier.mjs` copie ensuite dans `/data/`, donc la
// donnée structurée et la donnée affichée ne peuvent pas diverger.
//
// Deux pièges qui ont chacun leur ligne ici :
//   · l'échappement n'est pas le même d'une page à l'autre — DC stocke ses
//     titres en texte brut et les rend avec `esc()`, d'autres les stockent
//     échappés parce qu'ils les injectent directement. JSON-LD veut le texte,
//     pas l'entité : `decode()` passe donc sur tous les titres ;
//   · un `<` laissé tel quel dans le JSON refermerait le `<script>` qui le
//     porte. Il sort échappé en notation unicode, qui reste du JSON valide.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* ── Lecture des données ────────────────────────────────────────────────── */

// Les `data*.js` posent `window.X = {...}` : on les exécute avec un faux
// `window` plutôt que de les analyser. `require` ne convient pas — il met en
// cache, et le second appel sur le même fichier ne rejouerait pas l'affectation.
function charge(racine, fichier) {
  const w = {};
  new Function('window', 'document', readFileSync(join(racine, '_proto', fichier), 'utf8'))(w, {});
  return w;
}

/* ── Correspondances ────────────────────────────────────────────────────── */

// Quelle page tire ses éléments de quel fichier, et sous quel global.
const SOURCES = {
  sw:       { fr: ['data.js', 'SW'],            en: ['data-en.js', 'SW'] },
  mcu:      { fr: ['data-mcu.js', 'MCU'],       en: ['data-mcu-en.js', 'MCU'] },
  dc:       { fr: ['data-dc.js', 'DC'],         en: ['data-dc-en.js', 'DC'] },
  avatar:   { fr: ['data-avatar.js', 'AVATAR'], en: ['data-avatar-en.js', 'AVATAR'] },
  startrek: { fr: ['data-startrek.js', 'ST'],   en: ['data-startrek-en.js', 'ST'] },
  twd:      { fr: ['data-twd.js', 'TWD'],       en: ['data-twd-en.js', 'TWD'] },
};

// Le fil d'Ariane des pages qui n'ont pas de timeline. La clé du libellé est
// celle de `CG.t.nav`, lue dans les données : rien n'est réécrit ici.
const FIL = {
  dossiers:   [['deep', null]],
  'dossier-sw': [['deep', 'dossiers'], ['sw', 'dossier-sw']],
  nouveautes: [['news', null]],
  'a-venir':  [['upcoming', null]],
};

// Le type schema.org d'une entrée.
//
// **`type` passe avant `media`, et c'est tout le piège.** `media` ne dit pas ce
// qu'est l'œuvre, il dit quelle fiche TMDB la page va ouvrir : les trente-quatre
// romans et comics d'Avatar portent `media:"tv"` parce qu'ils empruntent le
// visuel et la fiche de la série. Lu dans l'autre sens, *Le Cycle de Kyoshi*
// ressortait en `TVSeries`. L'écrit se reconnaît à son `type`, jamais à son
// `media` — et `media` reprend la main pour tout le reste, où il est plus sûr
// que le `type` (DC et Avatar écrivent `imp` là où Star Wars écrit
// `important` : les vocabulaires ne sont pas alignés d'une page à l'autre).
function typeSchema(it) {
  switch (it.type) {
    case 'roman': case 'jeunesse': return 'Book';
    case 'comic':                  return 'ComicStory';
    case 'audio':                  return 'Audiobook';
    case 'jeu':                    return 'VideoGame';
  }
  if (it.media === 'movie') return 'Movie';
  if (it.media === 'tv')    return 'TVSeries';
  if (it.media === 'game')  return 'VideoGame';
  switch (it.type) {
    case 'film': case 'filmanim': case 'short': case 'special': return 'Movie';
    case 'serie': case 'anime': case 'web':                     return 'TVSeries';
    case 'video':                                               return 'VideoObject';
    default:                                                    return 'CreativeWork';
  }
}

/* ── Outils ─────────────────────────────────────────────────────────────── */

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Les titres n'ont pas le même échappement d'une page à l'autre : DC les stocke
// en texte brut et les rend avec `esc()`, le Dossier les stocke échappés parce
// qu'il les injecte directement. JSON-LD veut le texte dans les deux cas.
const decode = s => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g,        (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi,     (t, n) => ENTITES[n.toLowerCase()] ?? t)
  .trim();

// Un `<` dans le JSON refermerait le `<script>` qui le porte. Échappé en
// notation unicode, il reste du JSON valide et ne ressemble plus à une balise.
const enScript = obj =>
  '<script type="application/ld+json">' +
  JSON.stringify(obj).replace(/</g, '\\u003c') +
  '</script>';

const abs = (site, u) => !u ? undefined : /^https?:/.test(u) ? u : site + u;

/* ── Les trois blocs ────────────────────────────────────────────────────── */

function blocSite(site, t, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Chronologeek',
    url: site + url,
    inLanguage: t.locale,
  };
}

function blocFil(site, t, cle, urls, moi, nomUnivers) {
  const etapes = [{ name: decode(t.nav.home), url: site + urls.accueil }];
  for (const [libelle, page] of (FIL[cle] || [[cle, cle]])) {
    // `CG.t.nav` ne porte que les quatre premiers univers — Star Trek et The
    // Walking Dead sont sous « Plus d'univers » et n'y ont pas de clé. Sans ce
    // repli, leur fil d'Ariane annoncerait « startrek » et « twd ».
    etapes.push({
      name: decode(t.nav[libelle] || nomUnivers(libelle) || libelle),
      url: site + (page ? urls[page] : moi),
    });
  }
  // La dernière étape est la page courante : son URL est celle qu'on publie,
  // quelle que soit la table.
  etapes[etapes.length - 1].url = site + moi;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: etapes.map((e, i) => ({
      '@type': 'ListItem', position: i + 1, name: e.name, item: e.url,
    })),
  };
}

function blocListe(nom, langue, elements) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nom,
    inLanguage: langue,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: elements.length,
    itemListElement: elements.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': e.t,
        name: e.nom,
        url: e.url,
        // `isbn` n'appartient qu'à `Book` dans le vocabulaire : le poser sur un
        // `ComicStory` donnerait une propriété inconnue, alors que les comics
        // d'Avatar en portent un eux aussi.
        ...(e.isbn && e.t === 'Book' ? { isbn: e.isbn } : {}),
        ...(e.img ? { image: e.img } : {}),
      },
    })),
  };
}

/* ── Les éléments, par page ─────────────────────────────────────────────── */

// Une timeline : toutes les entrées de toutes les ères, à plat et dans l'ordre.
// `separator` et `note` sont écartés — `crisis-start` est un séparateur, pas une
// entrée, et les notes de Star Trek sont des repères de lecture.
function elementsTimeline(univers, site, moi) {
  const out = [];
  for (const era of univers.eras || []) {
    for (const it of era.entries || []) {
      if (it.type === 'separator' || it.type === 'note' || !it.id || !it.title) continue;
      out.push({
        t: typeSchema(it),
        nom: decode(it.title),
        url: `${site}${moi}#${it.id}`,
        img: abs(site, it.img),
        isbn: it.isbn,
      });
    }
  }
  return out;
}

/* ── Entrée publique ────────────────────────────────────────────────────── */

/**
 * Rend les `<script type="application/ld+json">` d'une page, ou '' si elle n'en
 * a pas. `urls` donne l'URL de chaque clé de route dans la langue demandée.
 */
export function jsonLd({ racine, site, cle, langue, moi, urls, imagesUnivers }) {
  const t = charge(racine, langue === 'fr' ? 'data.js' : 'data-en.js').CG.t;
  const blocs = [];

  // Le nom que porte un univers dans ses propres données — « The Walking Dead »
  // plutôt que « twd ». Chargé à la demande : une page n'en nomme qu'un ou deux.
  const nomUnivers = k => {
    if (!SOURCES[k]) return null;
    const [fichier, global] = SOURCES[k][langue];
    return decode(charge(racine, fichier)[global].title);
  };

  if (cle === 'accueil') {
    blocs.push(blocSite(site, t, moi));
    // Les six univers : la liste que l'accueil montre, et la seule de la page.
    const six = ['sw', 'mcu', 'dc', 'avatar', 'startrek', 'twd'].map(k => ({
      t: 'CollectionPage',
      nom: nomUnivers(k),
      url: site + urls[k],
      img: abs(site, imagesUnivers[k]),
    }));
    blocs.push(blocListe('Chronologeek', t.locale, six));
  } else {
    blocs.push(blocFil(site, t, cle, urls, moi, nomUnivers));
  }

  if (SOURCES[cle]) {
    const [fichier, global] = SOURCES[cle][langue];
    const u = charge(racine, fichier)[global];
    blocs.push(blocListe(decode(u.title), t.locale, elementsTimeline(u, site, moi)));
  } else if (cle === 'dossiers') {
    blocs.push(blocListe(decode(t.nav.deep), t.locale, [{
      t: 'CollectionPage',
      nom: decode(t.nav.sw),
      url: site + urls['dossier-sw'],
      img: abs(site, imagesUnivers.sw),
    }]));
  }

  return blocs.map(enScript).join('\n');
}
