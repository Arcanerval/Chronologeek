// sitemap.mjs — le plan du site, produit par publier.mjs.
//
// **Il était écrit à la main**, et mis à jour à chaque univers : les commits de
// Dragon Age, d'Assassin's Creed et de DC Animation le touchent tous les trois.
// C'est une liste des mêmes routes que `ROUTES` porte déjà, tenue à part — donc
// un oubli qui attend son tour. Un dixième univers y entre maintenant tout
// seul, comme il entre dans les pages.
//
// **Et il n'avait aucun `lastmod`** sur ses quarante-quatre URL. C'est ce que
// Google lit pour décider quoi recrawler : sans lui, une page corrigée hier et
// une page inchangée depuis six mois se valent, et rien ne dit qu'il faut
// revenir voir.
//
// Trois choses à savoir :
//
//   · **La date vient de git, pas du disque.** `publier.mjs` réécrit les
//     vingt-huit pages à chaque passage : leur `mtime` est celui de la dernière
//     publication, identique pour toutes, et ne dirait rien de ce qui a changé.
//     On demande donc à git la date du dernier commit qui a touché les
//     **sources** d'une page — son proto et son fichier de données.
//
//   · **Une source modifiée mais pas encore commitée vaut aujourd'hui.** Sinon
//     la page qu'on vient d'écrire s'annoncerait à la date d'avant, et le
//     sitemap serait faux précisément le jour où il compte.
//
//   · **`hreflang` reste sur chaque URL.** Les deux langues sont deux URL qui
//     se désignent l'une l'autre, et c'est ce qui empêche Google de les prendre
//     pour un doublon. Le fichier écrit à la main le faisait déjà ; on ne le
//     perd pas en le produisant.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/* ── La date d'une page ─────────────────────────────────────────────────── */

// `git log -1 --format=%cs` rend la date de commit en ISO court (2026-09-06),
// qui est exactement le format que `lastmod` attend.
function dernierCommit(racine, fichiers) {
  const vus = fichiers.filter(f => existsSync(join(racine, f)));
  if (!vus.length) return null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...vus],
                             { cwd: racine, encoding: 'utf8' }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch { return null; }
}

// Une source modifiée et pas encore commitée : la page change aujourd'hui.
function modifieMaintenant(racine, fichiers) {
  const vus = fichiers.filter(f => existsSync(join(racine, f)));
  if (!vus.length) return false;
  try {
    const out = execFileSync('git', ['status', '--porcelain', '--', ...vus],
                             { cwd: racine, encoding: 'utf8' }).trim();
    return out.length > 0;
  } catch { return false; }
}

const aujourdhui = () => new Date().toISOString().slice(0, 10);

/* ── Entrée publique ────────────────────────────────────────────────────── */

/**
 * Rend le sitemap des routes publiées. `sources(cle, langue)` doit rendre la
 * liste des fichiers dont la page dépend, relatifs à la racine du dépôt.
 */
export function sitemap({ racine, site, routes, sources }) {
  const lignes = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  // Les vingt-huit URL dans l'ordre du fichier écrit à la main : les anglaises
  // d'abord, les françaises ensuite. Rien ne l'impose, mais un plan de site qui
  // change d'ordre sans raison se relit mal d'une version à l'autre.
  for (const langue of ['en', 'fr']) {
    for (const r of routes) {
      const f = sources(r.cle, langue);
      const date = modifieMaintenant(racine, f) ? aujourdhui()
                                                : (dernierCommit(racine, f) || aujourdhui());
      lignes.push(
        `  <url><loc>${site}${r[langue].url}</loc>`,
        `    <lastmod>${date}</lastmod>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${site}${r.en.url}"/>`,
        `    <xhtml:link rel="alternate" hreflang="fr" href="${site}${r.fr.url}"/>`,
        '  </url>',
      );
    }
  }

  lignes.push('</urlset>', '');
  return lignes.join('\n');
}
