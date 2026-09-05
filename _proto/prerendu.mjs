// prerendu.mjs — le texte des timelines, posé dans le HTML servi.
//
// **Le contenu du site n'existait dans aucune page.** `starwars.html` fait
// 110 Ko et le mot « Andor » n'y paraissait que dans le JSON-LD : pas un titre,
// pas une date, pas un résumé, pas une réponse de FAQ. Tout est écrit par le JS
// au chargement depuis `/data/`. Les `<h3>` et les `alt` posés le 5 septembre
// 2026 n'existaient donc que pour un navigateur qui exécute le script.
//
// Google finit par exécuter le JS, mais avec retard et budget ; Bing,
// DuckDuckGo et les moteurs de réponse le font mal ou pas du tout, et un
// extrait de résultat ne peut pas citer un texte qui n'est pas servi. Or c'est
// exactement là qu'un guide gagne : « où placer Andor », « faut-il rester après
// le générique », une question qui vise une entrée et pas la page.
//
// Ce module rend donc le texte de chaque entrée dans `<div id="timeline">`, que
// les dix pages écrasent ensuite par `$('#timeline').innerHTML = html`.
//
// Trois choses à savoir :
//
//   · **Rien à changer dans les pages, et c'est tout le principe.** Les dix
//     posent `<div id="timeline"></div>` vide et l'écrasent depuis un script
//     inline de fin de corps, donc synchrone : le remplacement a lieu avant le
//     premier rendu, et le pré-rendu ne se voit jamais. Un second moteur de
//     rendu à tenir à jour aurait été le vrai coût de ce chantier ; il n'y en a
//     pas — ce qui est posé ici est du HTML nu, sans une classe, et n'a pas à
//     ressembler à la page.
//
//   · **Liste noire, jamais liste blanche.** Les neuf univers n'ont pas le même
//     schéma : Star Wars et Marvel portent leur texte dans `faq`, DC et Star
//     Trek dans `subitems`, Assassin's Creed dans `notes` et `desc`, The Walking
//     Dead n'a ni `desc` ni `faq` du tout. Une liste des champs à rendre en
//     aurait raté la moitié sans rien dire — c'est la leçon déjà payée par
//     `traduire.mjs` avec `faq.comment`. On ratisse donc toute chaîne qui n'est
//     pas explicitement technique.
//
//   · **`decode()` puis `esc()`, comme dans `jsonld.mjs`.** L'échappement n'est
//     pas le même d'une page à l'autre : DC stocke ses titres en texte brut, le
//     Dossier les stocke échappés parce qu'il les injecte directement. Recopier
//     la valeur telle quelle rendrait `L&amp;#x27;Ère` sur l'une des deux.
//
// Le coût, mesuré : +2 à +11 Ko brotli par page, 98 Ko sur les vingt. C'est
// l'ordre de grandeur du JSON-LD déjà accepté, pour le contenu lui-même plutôt
// que pour sa description.

import { charge, SOURCES, decode } from './jsonld.mjs';

/* ── Ce qui n'est pas du texte de lecture ───────────────────────────────── */

// Chemins, identifiants, arguments d'API, codes de couleur : tout ce qu'un
// moteur n'a rien à lire. Le reste est du texte, y compris les clés qu'on ne
// connaît pas encore — une page ajoutée demain apporte les siennes.
const TECHNIQUE = /^(id|img|isbn|href|url|src|link|links|ol|q|inc|exc|media|tmdb|type|level|ep|n|rt|key|icon|color|c|k|cls|ref|drop|covers|trigger|vo|dim|kind|tags|faqq)$/;

// Les textes des entrées sont du texte nu aujourd'hui — vérifié sur les vingt
// pages, pas une balise. Mais l'accroche des pages, elle, porte du HTML depuis
// le maillage du 5 septembre 2026, et la même chose finira par arriver à une
// FAQ. Deux issues alors, toutes deux mauvaises : la laisser passer poserait un
// `<a>` non recâblé dans le pré-rendu, l'échapper afficherait la balise en
// toutes lettres. On la retire, et le texte reste lisible.
const esc = s => String(s)
  .replace(/<[^>]*>/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Le ratissage ───────────────────────────────────────────────────────── */

// Toutes les chaînes d'une entrée, dédupliquées et dans l'ordre de lecture.
// La déduplication compte : un titre repris en clé de FAQ ou un « — » posé
// partout ressortiraient autant de fois qu'ils sont écrits.
function textes(o, out = [], vus = new Set()) {
  if (!o || typeof o !== 'object') return out;
  if (Array.isArray(o)) { for (const v of o) textes(v, out, vus); return out; }
  for (const k of Object.keys(o)) {
    if (TECHNIQUE.test(k)) continue;
    const v = o[k];
    if (typeof v === 'string') {
      const t = decode(v);
      if (t.length > 2 && !vus.has(t)) { vus.add(t); out.push(t); }
    } else if (v && typeof v === 'object') {
      textes(v, out, vus);
    }
  }
  return out;
}

/* ── Le rendu ───────────────────────────────────────────────────────────── */

// `separator` est un repère de mise en page, pas une œuvre : `crisis-start` chez
// DC n'a ni titre ni page à viser. C'est la même exclusion que dans `jsonld.mjs`.
// Le texte d'une entrée, titre en tête et sans répétition.
function contenu(it) {
  const titre = decode(it.title);
  const vus = new Set([titre]);
  let corps = '';
  if (it.date) { const d = decode(it.date); vus.add(d); corps += `<p>${esc(d)}</p>`; }
  for (const t of textes(it, [], vus)) corps += `<p>${esc(t)}</p>`;
  return { titre: esc(titre), corps };
}

const rendable = it => it && it.type !== 'separator' && it.id && it.title;

// Une œuvre d'une timeline : un `<article>` nommé par un `<h3>`, la hiérarchie
// que la page rend elle-même — un h1, un h2 par ère, un h3 par œuvre.
function article(it) {
  if (!rendable(it)) return '';
  const { titre, corps } = contenu(it);
  return `<article id="${esc(it.id)}"><h3>${titre}</h3>${corps}</article>`;
}

// **Le Dossier n'a pas de h3, et c'est délibéré** : ses 535 lignes sont une
// liste de lecture, pas 535 sections — c'est la raison qui lui vaut déjà de ne
// pas avoir d'`ItemList`. Le pré-rendu suit ce choix plutôt que de le
// contredire dans le HTML servi, et une liste de lecture est bien une liste.
function ligne(it) {
  if (!rendable(it)) return '';
  const { titre, corps } = contenu(it);
  return `<li id="${esc(it.id)}"><b>${titre}</b>${corps}</li>`;
}

function section(era, liste) {
  const items = era.entries || era.items || [];
  const corps = items.map(liste ? ligne : article).join('');
  if (!corps) return '';
  const dedans = liste ? `<ul>${corps}</ul>` : corps;
  return `<section><h2>${esc(decode(era.title || ''))}</h2>${dedans}</section>`;
}

/* ── Entrée publique ────────────────────────────────────────────────────── */

// Le Dossier n'est pas dans `SOURCES` : il range ses 598 lignes sous `CGD`, et
// ses ères portent `items` là où les timelines portent `entries`.
const DOSSIER = { fr: ['data-dossier-sw.js', 'CGD'], en: ['data-dossier-sw-en.js', 'CGD'] };

/**
 * Rend le pré-rendu d'une page, ou '' si elle n'a pas de timeline (l'accueil,
 * « À venir », les Nouveautés, la liste des Dossiers).
 */
export function prerendu({ racine, cle, langue }) {
  let eras = null;
  const liste = cle === 'dossier-sw';
  if (SOURCES[cle]) {
    const [fichier, global] = SOURCES[cle][langue];
    eras = charge(racine, fichier, global)[global].eras;
  } else if (liste) {
    const [fichier, global] = DOSSIER[langue];
    eras = charge(racine, fichier, global)[global].eras;
  }
  if (!eras) return '';

  const corps = eras.map(e => section(e, liste)).join('');
  // Une page qui a des ères et rien à rendre est un appariement qui a raté, pas
  // une page vide : c'est le genre de silence que ce dépôt paie cher.
  if (!corps) throw new Error(`prerendu : ${cle}/${langue} a ${eras.length} ère(s) et aucune entrée rendue`);
  // La classe est ce que la règle du `<head>` cible pour le cacher dès que le
  // JS est là. Sans elle, le texte nu paraissait une fraction de seconde avant
  // que le script écrase `#timeline` — voir `publier.mjs`.
  return `<div class="pr"><!--prerendu-->${corps}<!--/prerendu--></div>`;
}

/** Le nombre d'entrées rendues, pour le bilan de publication. */
export function comptePrerendu(html) {
  return (html.match(/<(?:article|li) id=/g) || []).length;
}
