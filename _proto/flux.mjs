// flux.mjs — le journal des Nouveautés en Atom, produit par publier.mjs.
//
// Le site n'avait aucun canal de retour. Quelqu'un qui découvre une timeline et
// veut savoir quand elle bouge n'a que deux choix : revenir voir de temps en
// temps, ou attendre que Google le lui rappelle. `nouveautes.html` tient déjà
// le journal, carte par carte, avec sa date et son lien — il ne manquait qu'un
// fichier que les lecteurs de flux sachent lire.
//
// C'est aussi le seul canal du site qui ne dépend de personne : pas d'algorithme
// entre le journal et qui le suit, et rien à administrer.
//
// **Atom plutôt que RSS**, pour trois raisons qui comptent ici : les dates y
// sont en ISO 8601 (RSS 2.0 veut du RFC 822, un format à mois anglais qu'il
// faudrait écrire à la main), `xml:lang` y est natif alors que le site publie
// deux flux, et chaque entrée exige un `id` stable — ce que le journal n'a pas,
// et qu'il vaut mieux se voir imposer que d'oublier. Les lecteurs modernes
// lisent les deux formats.
//
// Trois choses à savoir :
//
//   · **Le journal n'a pas d'identifiants**, ses cartes se comptent au titre.
//     L'`id` d'une entrée est donc fabriqué — `tag:` + la clé du mois + le
//     titre normalisé —, et il doit rester stable : un lecteur qui le voit
//     changer croit à une nouvelle entrée et la remontre. C'est pour ça qu'il
//     ne dépend ni du rang de la carte, ni de son texte, ni de son lien.
//
//   · **Le journal date au mois, pas au jour.** Toutes les cartes d'un mois
//     tomberaient donc à la même seconde, et un lecteur qui trie par date
//     perdrait l'ordre éditorial — or la première carte du mois est la plus
//     importante. Chaque entrée recule d'une minute sur la précédente à
//     l'intérieur de son mois : l'heure n'est pas une donnée du site, elle ne
//     prétend rien, et elle préserve l'ordre.
//
//   · **« Et avant ça » n'a pas de clé de mois** — c'est le bloc qui range les
//     deux timelines fondatrices, sans date. Ses cartes ne sont pas dans le
//     flux : une entrée sans date honnête n'a rien à faire dans un fil
//     chronologique, et elle remonterait en tête ou en queue au hasard du
//     lecteur.

import { charge } from './jsonld.mjs';

const SOURCES = { fr: ['data-news.js', 'CG_NEWS'], en: ['data-news-en.js', 'CG_NEWS'] };

const T = {
  fr: { titre: 'Chronologeek — Nouveautés',
        sous: 'Les ajouts et les mises à jour des timelines et des Dossiers.' },
  en: { titre: 'Chronologeek — What’s new',
        sous: 'Additions and updates across the timelines and deep dives.' },
};

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// L'identifiant d'une entrée : stable tant que son mois et son titre ne
// bougent pas. Les accents tombent, le reste devient du tiret.
const cleTitre = s => String(s)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ── Entrée publique ────────────────────────────────────────────────────── */

/**
 * Rend le flux Atom d'une langue. `lien(href)` recâble un lien de maquette vers
 * son URL de production — c'est la même fonction que la publication applique au
 * HTML, et deux recâblages qui divergeraient donneraient des liens morts.
 */
export function flux({ racine, site, langue, moi, urls, lien }) {
  const [fichier, global] = SOURCES[langue];
  const mois = charge(racine, fichier, global)[global].months || [];
  const t = T[langue];

  const entrees = [];
  for (const m of mois) {
    // « Et avant ça » : pas de clé, donc pas de date. Voir l'en-tête.
    if (!/^\d{4}-\d{2}$/.test(m.key || '')) continue;
    m.items.forEach((it, i) => {
      // Le premier du mois à midi, puis une minute de moins par carte : l'ordre
      // du journal survit au tri par date des lecteurs.
      const d = new Date(`${m.key}-01T12:00:00Z`);
      d.setUTCMinutes(d.getUTCMinutes() - i);
      entrees.push({
        id: `tag:chronologeek.app,${m.key}:${cleTitre(it.title)}`,
        titre: it.title,
        texte: it.txt || '',
        url: site + (it.href ? lien(it.href) : urls.nouveautes),
        date: d.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      });
    });
  }

  // Le plus récent d'abord, et jamais plus de trente : un flux est une fenêtre
  // sur ce qui vient de changer, pas une archive — la page Nouveautés l'est.
  entrees.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const gardees = entrees.slice(0, 30);

  const maj = gardees.length ? gardees[0].date : new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const moiUrl = site + moi;

  const corps = gardees.map(e => `  <entry>
    <title>${esc(e.titre)}</title>
    <link rel="alternate" type="text/html" href="${esc(e.url)}"/>
    <id>${esc(e.id)}</id>
    <updated>${e.date}</updated>
    <summary>${esc(e.texte)}</summary>
  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${langue}">
  <title>${esc(t.titre)}</title>
  <subtitle>${esc(t.sous)}</subtitle>
  <link rel="self" type="application/atom+xml" href="${site}${moi}"/>
  <link rel="alternate" type="text/html" href="${site}${urls.nouveautes}"/>
  <id>${moiUrl}</id>
  <updated>${maj}</updated>
  <author><name>Chronologeek</name></author>
${corps}
</feed>
`;
}
