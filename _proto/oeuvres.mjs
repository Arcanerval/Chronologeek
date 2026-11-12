// oeuvres.mjs — une page par œuvre : « Où placer Andor ? »
//
// Posé le 5 novembre 2026. **Une ancre `/starwars#sw-andor` n'est pas une page**
// : Google ne la classe pas à part, et un lien partagé montre l'image de
// l'univers. Or la question à laquelle ce site répond vise une œuvre. Ces pages
// sont produites à la publication depuis les mêmes `data*.js` que le reste :
// une œuvre ajoutée a la sienne sans qu'on y touche.
//
// Sept choses à savoir :
//
//   · **Une page par œuvre, pas par entrée.** « Les Agents du S.H.I.E.L.D. »
//     tient treize entrées et une seule page, qui liste ses places. Une œuvre se
//     reconnaît au titre anglais et à sa fiche TMDB : deux « Superman » de fiches
//     différentes sont deux œuvres, et le second prend `-2`.
//   · **Le chemin est celui de l'anglais dans les deux langues** — `/works/
//     starwars/andor`, `/fr/oeuvres/starwars/andor` —, ce qui apparie les deux
//     versions et survit à un titre français corrigé.
//   · **L'habillage est celui du site, relu dans la page Star Wars publiée** :
//     menu, tiroir, pied de page et CSS. `rendre()` reçoit donc ces morceaux
//     après la publication des pages, et `/works/fiche.css` porte le CSS de la
//     page Star Wars, plus les règles `.f-*` d'ici. Une retouche du menu suit
//     toute seule ; deux copies auraient divergé.
//   · **Le Dossier n'en a pas** : ses lignes n'ont qu'un titre et une date, et
//     550 pages presque vides nuiraient au reste.
//   · **Une ligne, c'est sa branche.** Chez DC, DC Animation et The Witcher,
//     l'arrêt d'avant est celui de la même branche, et les essentiels aussi : le
//     DCU ne demande pas l'Arrowverse.
//   · **Rien n'est écrit ici que des intitulés.** Les textes sont ceux des
//     données, à l'identique. « Les essentiels du guide » dit ce que le guide
//     classe `must` avant cet arrêt : un fait, pas une dépendance d'intrigue.
//   · **`/works/<route>.json` donne `{id: chemin}`** : `e-app.js` s'en sert pour
//     poser le bouton « Fiche complète » à l'ouverture d'une carte.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { charge, SOURCES, decode, typeSchema } from './jsonld.mjs';
import { TETE_REGLAGES } from './reglages.mjs';
import { ENCRES } from './recherche.mjs';

const CODES = { sw:'SW', mcu:'MCU', dc:'DC', avatar:'AV', startrek:'ST', twd:'TWD', dragonage:'DA',
  assassinscreed:'AC', dcanimation:'DCA', jurassic:'JW', witcher:'TW', residentevil:'RE', bladerunner:'BR', monsterverse:'MV' };

const T = {
  fr: { base:'/fr/oeuvres', accueil:'Accueil', sur:'Sur la ligne', premier:'Départ de la ligne', dernier:'Terminus de la ligne',
    ici:'Vous êtes ici', voir:'Voir sur la ligne', billet:'Votre arrêt', calcul:'Calculer mon itinéraire',
    essentiels:'Les essentiels avant cet arrêt', aucun:'Aucun : la ligne peut commencer ici.',
    autres:n=>`Afficher les ${n} autres`, type:'Type', date:'Date', present:'Présent', niveau:'Niveau', duree:'Durée',
    arret:'Arrêt', arretDe:(n,N)=>`Arrêt ${n} sur ${N}`, places:'Places', lignes:'Ligne', station:'Station', saut:n=>`${n} arrêt${n>1?'s':''} plus loin`,
    notes:'À savoir', blocs:n=>`Cette œuvre revient ${n} fois sur la ligne.`, depart:'Départ', terminus:'Terminus',
    niveaux:{must:'Essentiel',important:'Important',imp:'Important',bonus:'Optionnel'},
    mem:'Souvenirs', compte:n=>`${n} œuvre${n>1?'s':''}`, heures:h=>`environ ${h} h`, fil:'Fil d’Ariane',
    guide:'Selon les niveaux du guide.',
    tag:'Où placer', fin:(u,c)=>c?`dans ${u} ?`:'?',
    q:(t,u,c)=>c?`Où placer ${t} dans ${u} ?`:`Où placer ${t} ?`,
    d:(t,u,pos,av,ap,date)=>`${t} sur la ligne ${u} : ${pos}${av?`, après ${av}`:''}${ap?`, avant ${ap}`:''}.${date?` Date : ${date}.`:''} Ordre chronologique sans spoil.`,
    pos1:'premier arrêt', posN:'terminus', posK:(n,N)=>`arrêt ${n} sur ${N}`, posB:n=>`${n} places`, menu:['Ouvrir le menu','Fermer le menu'] },
  en: { base:'/works', accueil:'Home', sur:'On the line', premier:'Start of the line', dernier:'End of the line',
    ici:'You are here', voir:'See it on the line', billet:'Your stop', calcul:'Plan my route',
    essentiels:'The essentials before this stop', aucun:'None: the line can start here.',
    autres:n=>`Show the other ${n}`, type:'Type', date:'Date', present:'Present', niveau:'Level', duree:'Runtime',
    arret:'Stop', arretDe:(n,N)=>`Stop ${n} of ${N}`, places:'Places', lignes:'Line', station:'Station', saut:n=>`${n} stop${n>1?'s':''} further`,
    notes:'Good to know', blocs:n=>`This work comes back ${n} times on the line.`, depart:'Departure', terminus:'Terminus',
    niveaux:{must:'Essential',important:'Important',imp:'Important',bonus:'Optional'},
    mem:'Memories', compte:n=>`${n} work${n>1?'s':''}`, heures:h=>`about ${h} h`, fil:'Breadcrumb',
    guide:'Based on the guide’s levels.',
    tag:'Where does', fin:(u,c)=>c?`fit in ${u}?`:'fit?',
    q:(t,u,c)=>c?`Where does ${t} fit in ${u}?`:`Where does ${t} fit?`,
    d:(t,u,pos,av,ap,date)=>`${t} on the ${u} line: ${pos}${av?`, after ${av}`:''}${ap?`, before ${ap}`:''}.${date?` Date: ${date}.`:''} Spoiler-free chronological order.`,
    pos1:'first stop', posN:'last stop', posK:(n,N)=>`stop ${n} of ${N}`, posB:n=>`${n} places`, menu:['Open menu','Close menu'] },
};

const nb = s => s.replace(/ ([?:!])/g, '\u00a0$1');
const esc = s => String(s).replace(/<[^>]+>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = s => esc(decode(s));
const compact = s => decode(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slug = s => decode(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/['’*.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'oeuvre';
const rendable = it => it && it.type !== 'separator' && it.type !== 'note' && it.id && it.title;
const abs = (site, u) => !u ? '' : /^https?:/.test(u) ? u : site + u;
const hm = m => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ' ' + String(r).padStart(2, '0') : ''}` : `${r} min`; };

/* Les règles propres aux fiches, posées après le CSS de la page Star Wars. */
const CSS_FICHE = `
.f-fil{font-size:12.5px;color:rgba(255,253,247,.72);margin-bottom:22px}
.f-fil a{color:inherit;text-decoration:none;display:inline-block;padding:3px 0}.f-fil a:hover{color:var(--paper);text-decoration:underline}
.f-hero .ln-head h1 .nm{overflow-wrap:anywhere;text-wrap:balance}
.f-hero .ln-head h1 .nm.l2{font-size:.72em;line-height:.9}
.f-hero .ln-head h1 .nm.l3{font-size:.5em;line-height:.95}
.f-hero .ln-head h1 .nm.l4{font-size:.36em;line-height:1}
.f-fin{display:block;font-size:clamp(20px,3vw,32px);line-height:1.1;letter-spacing:.02em;color:var(--uni);margin-top:12px;text-shadow:none}
.ln-board.f-board{display:flex;flex-wrap:wrap;justify-content:center;width:fit-content;max-width:100%;margin-top:24px}
.f-board b{font-size:clamp(21px,2.6vw,30px);white-space:nowrap}
.f-plan{max-width:760px;margin:28px auto 0;padding:0 9px}
.f-voie{position:relative;height:8px;border-radius:9px;background:var(--rest)}
.f-fait{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--uni)}
.f-st{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:var(--paper);border:3px solid var(--ink)}
.f-pt{position:absolute;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:var(--hot);border:4px solid var(--ink);box-shadow:0 0 0 3px var(--hot)}
.f-bouts{display:flex;justify-content:space-between;margin-top:12px;font-family:'Big Shoulders Display';font-weight:800;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,253,247,.72)}
.f-corps{max-width:900px;padding-top:44px;padding-bottom:60px}
.f-sec{margin-top:48px}.f-sec:first-child{margin-top:0}
.f-h2{font-family:'Big Shoulders Display';font-weight:900;font-size:clamp(30px,4.4vw,42px);line-height:1;text-transform:uppercase;letter-spacing:.01em}
.f-dek{margin-top:7px;color:rgba(255,253,247,.72);font-size:14.5px}
.f-rail{list-style:none;position:relative;margin-top:22px;padding-left:38px}
.f-rail::before{content:'';position:absolute;left:12px;top:14px;bottom:14px;width:6px;border-radius:6px;background:var(--uni)}
.f-rail>li{position:relative;margin-top:12px}.f-rail>li:first-child{margin-top:0}
.f-rail>li.f-a::before{content:'';position:absolute;left:-35px;top:50%;width:24px;height:24px;margin-top:-12px;border-radius:50%;background:var(--ink);border:6px solid var(--uni)}
.f-rail>li.f-ici::before{left:-40px;width:34px;height:34px;margin-top:-17px;background:var(--hot);border:7px solid var(--ink);box-shadow:0 0 0 4px var(--hot)}
.f-card{display:grid;grid-template-columns:96px 112px minmax(0,1fr);align-items:stretch;border:2px solid var(--line);border-radius:3px;overflow:hidden;background:rgba(255,253,247,.035);color:inherit;text-decoration:none;transition:transform .12s,border-color .12s}
a.f-card:hover{border-color:var(--hot);transform:translate(-3px,-3px)}
.f-hor{display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;border-right:2px dashed var(--line);font-family:'Big Shoulders Display';font-weight:800;font-size:16px;line-height:1.05;color:var(--uni)}
.f-card img{display:block;width:100%;height:100%;min-height:63px;object-fit:cover;background:var(--ink)}
.f-tx{display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0;padding:9px 14px}
.f-tx b{font-family:'Big Shoulders Display';font-weight:800;font-size:21px;line-height:1.05;text-transform:uppercase;overflow-wrap:anywhere}
.f-tx small{font-size:12.5px;line-height:1.35;color:rgba(255,253,247,.72)}
.f-k{font-family:'Big Shoulders Display';font-weight:800;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--hot)}
.f-ici .f-card{grid-template-columns:96px 190px minmax(0,1fr);border-color:var(--hot);background:color-mix(in srgb,var(--hot) 9%,var(--ink));box-shadow:6px 6px 0 color-mix(in srgb,var(--hot) 40%,transparent)}
.f-ici .f-tx{padding:13px 16px}.f-ici .f-tx b{font-size:30px}
.f-ici ul{list-style:none;margin-top:3px;font-size:13.5px;line-height:1.4;color:rgba(255,253,247,.82)}
.f-stn{font-family:'Big Shoulders Display';font-weight:800;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--paper);padding:10px 0 2px}
.f-stn::before{content:'';position:absolute;left:-29px;top:14px;width:12px;height:12px;border-radius:3px;background:var(--paper);outline:3px solid var(--ink)}
.f-saut{font-size:12.5px;color:rgba(255,253,247,.66);padding:2px 0;font-style:italic}
.f-saut::before{content:'';position:absolute;left:-26px;top:0;bottom:0;width:6px;background:repeating-linear-gradient(var(--ink) 0 4px,transparent 4px 9px)}
.f-bout{font-family:'Big Shoulders Display';font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,253,247,.72);padding:6px 0}
.f-bout::before{content:'';position:absolute;left:-35px;top:6px;width:24px;height:24px;border-radius:3px;background:var(--uni);border:5px solid var(--ink)}
.f-tete{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 20px}
.f-iti{display:inline-block;font-family:'Big Shoulders Display';font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;color:var(--ink);background:var(--hot);padding:10px 18px;border-radius:3px}
.f-iti:hover{filter:brightness(1.1)}
.f-grille{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:20px}
.f-grille a{display:block;height:100%;border:2px solid var(--line);border-radius:3px;overflow:hidden;color:inherit;text-decoration:none;background:rgba(255,253,247,.035);transition:transform .12s,border-color .12s}
.f-grille a:hover{border-color:var(--hot);transform:translate(-3px,-3px)}
.f-grille img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--ink)}
.f-grille span{display:block;padding:7px 9px 9px;font-family:'Big Shoulders Display';font-weight:700;font-size:16px;line-height:1.08;text-transform:uppercase;overflow-wrap:anywhere}
.f-plus{margin-top:12px}.f-plus summary{cursor:pointer;font-weight:700;color:var(--hot);padding:8px 0}
.f-plus ul{list-style:none;columns:2;column-gap:26px;font-size:14px;margin-top:4px}
.f-plus li{break-inside:avoid;padding:3px 0}.f-plus a{color:inherit}
.f-qr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}
.f-q{border:2px solid var(--line);border-radius:3px;padding:13px 15px;background:rgba(255,253,247,.03)}
.f-q h3{font-size:14.5px;line-height:1.3;font-weight:700;margin-bottom:5px;color:var(--paper)}
.f-q p{font-size:14.5px;line-height:1.5;color:rgba(255,253,247,.8)}
.f-q.n{grid-column:1/-1;border-color:color-mix(in srgb,var(--uni) 55%,transparent);border-left-width:6px}
@media(max-width:640px){
  .f-board b{font-size:21px}.ln-board.f-board .s{flex:1 1 30%;padding:8px 10px}
  .ticket-row .f-go-t{display:none}.ticket-row .t-nm{white-space:normal;font-size:24px}.ticket-row .t-st{font-size:12px}
  .f-rail{padding-left:32px}.f-rail::before{left:9px}
  .f-rail>li.f-a::before{left:-32px;width:22px;height:22px;margin-top:-11px;border-width:5px}
  .f-rail>li.f-ici::before{left:-35px;width:28px;height:28px;margin-top:-14px;border-width:6px}
  .f-stn::before{left:-26px}.f-saut::before{left:-23px}.f-bout::before{left:-32px;width:22px;height:22px}
  .f-card,.f-ici .f-card{grid-template-columns:82px minmax(0,1fr)}
  .f-hor{grid-column:1/-1;justify-content:flex-start;border-right:0;border-bottom:2px dashed var(--line);padding:5px 12px;font-size:15px}
  .f-tx b{font-size:19px}.f-ici .f-tx b{font-size:24px}.f-tx{padding:8px 11px}
  .f-qr{grid-template-columns:minmax(0,1fr)}.f-plus ul{columns:1}
}`;

/* Une table `RT` est un `const` du fichier : hors de portée de `charge()`. */
function tableRT(racine, fichier) {
  const m = readFileSync(join(racine, '_proto', fichier), 'utf8').match(/\bRT\s*=\s*(\{[^}]*\})/);
  if (!m) return {};
  try { return new Function(`return ${m[1]}`)(); } catch (_) { return {}; }
}

// Le nom d'un univers dans une phrase : « Marvel Cinematic Universe » y pèse trop.
const NOMS = { mcu: 'Marvel' };

/* ── Le modèle d'un univers, dans une langue ─────────────────────────────── */
function modele(racine, cle, langue) {
  const [f, g] = SOURCES[cle][langue];
  const w = charge(racine, f, g);
  const u = w[g];
  const RT = tableRT(racine, f);
  const lignes = [];
  const parId = {};
  const aBranches = u.eras.some(e => e.branch);
  const bl = {};
  u.eras.forEach((era, r) => {
    for (const e of era.entries || []) {
      if (!rendable(e)) continue;
      const l = { e, era, r, rt: e.rt || RT[e.id] || 0 };
      lignes.push(l); parId[e.id] = l;
    }
  });
  // Une bande sans branche d'un réseau est commune : elle se lit à part.
  const seqDe = b => lignes.filter(l => !aBranches ? true : (b ? l.era.branch === b || !l.era.branch : !l.era.branch));
  const seq = b => bl[b || ''] || (bl[b || ''] = seqDe(b));
  const a = lignes.some(l => l.e.level === 'must') ? 'must' : lignes.some(l => l.e.level === 'imp') ? 'imp' : null;
  return { u, CG: w.CG || {}, lignes, parId, seq, aBranches, a, nom: NOMS[cle] || decode(u.title).split(' — ')[0] };
}

/* ── L'assemblage : quelles œuvres, sous quel chemin ─────────────────────── */
function oeuvresDe(en) {
  const groupes = new Map();
  for (const l of en.lignes) {
    const k = compact(l.e.title) + '|' + (l.e.tmdb && l.e.tmdb !== '0' ? l.e.tmdb : '');
    if (!groupes.has(k)) groupes.set(k, []);
    groupes.get(k).push(l.e.id);
  }
  const pris = {};
  const out = [];
  for (const ids of groupes.values()) {
    let s = slug(en.parId[ids[0]].e.title);
    pris[s] = (pris[s] || 0) + 1;
    if (pris[s] > 1) s += '-' + pris[s];
    out.push({ s, ids });
  }
  return out;
}

/* ── Le menu et le pied, repris de la page Star Wars publiée ─────────────── */
export function habillage(html, urlSw) {
  const head = html.slice(0, html.indexOf('</head>'));
  const styles = [...head.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  const principal = styles.reduce((a, b) => (b.length > a.length ? b : a), '');
  const repli = styles.find(s => s.includes('BSD repli')) || '';
  const propre = s => s.replace(/href="#"\s+aria-current="page"/g, `href="${urlSw}"`);
  const m1 = html.match(/<header>[\s\S]*?<\/header>/);
  const m2 = html.match(/<footer>[\s\S]*?<\/footer>/);
  if (!m1 || !m2 || principal.length < 10000) throw new Error('oeuvres : habillage introuvable dans la page Star Wars');
  return { css: repli + '\n' + principal, header: propre(m1[0]), footer: propre(m2[0]) };
}

function page({ cle, route, langue, m, ids, s, site, urlDe, urlU, sAccueil, autreUrl, labelsRepli, ch }) {
  const t = T[langue];
  const encre = ENCRES[cle];
  const lignes = ids.map(i => m.parId[i]).filter(Boolean);
  if (!lignes.length) throw new Error(`oeuvres : ${cle}/${s} sans entrée en ${langue}`);
  const p = lignes[0].e;
  const titre = decode(p.title);
  const moi = `${t.base}/${route}/${s}`;
  const seq = m.seq(lignes[0].era.branch);
  const pos = l => m.seq(l.era.branch).indexOf(l);
  const labels = m.CG.badgeLabels || labelsRepli || {};
  const typeDe = e => labels[e.type] ? decode(labels[e.type][1]) : '';

  // Les places : les entrées qui se suivent sur leur ligne n'en font qu'une.
  const places = [];
  for (const l of lignes) {
    const sq = m.seq(l.era.branch), i = sq.indexOf(l), der = places[places.length - 1];
    if (der && der.sq === sq && der.fin === i - 1) { der.fin = i; der.items.push(l); }
    else places.push({ sq, deb: i, fin: i, items: [l] });
  }
  const repetes = {};
  for (const l of m.lignes) { const k = compact(l.e.title); repetes[k] = (repetes[k] || 0) + 1; }
  const vignette = (e, classe) => e.img ? `<img src="${esc(e.img)}" alt="${esc(decode(e.title))}" loading="lazy"${classe || ''}/>` : '<span></span>';

  // Le rail : une seule ligne, où deux places voisines partagent leur arrêt.
  const rail = [];
  let eraEnCours = null;
  const station = l => {
    const n = decode(l.era.title || '');
    if (n && l.era !== eraEnCours) rail.push(`<li class="f-stn">${esc(n)}</li>`);
    eraEnCours = l.era;
  };
  const carte = l => {
    station(l);
    const sub = repetes[compact(l.e.title)] > 1 && l.e.subitems && l.e.subitems[0] ? decode(l.e.subitems[0]) : typeDe(l.e);
    rail.push(`<li class="f-a"><a class="f-card" href="${urlDe(l.e.id)}"><span class="f-hor">${l.e.date ? txt(l.e.date) : '—'}</span>${vignette(l.e)}` +
      `<span class="f-tx"><b>${txt(l.e.title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></a></li>`);
  };
  let derSq = null, derI = -1;
  for (const pl of places) {
    const av = pl.sq[pl.deb - 1], ap = pl.sq[pl.fin + 1];
    if (pl.sq !== derSq) {
      if (av) carte(av); else rail.push(`<li class="f-bout">${t.premier}</li>`);
    } else if (pl.deb - 1 > derI) {
      const n = pl.deb - 1 - derI - 1;
      if (n > 0) rail.push(`<li class="f-saut">${t.saut(n)}</li>`);
      carte(av);
    }
    station(pl.items[0]);
    const subs = pl.items.flatMap(l => l.e.subitems || []).map(x => `<li>${txt(x)}</li>`).join('');
    rail.push(`<li class="f-a f-ici"><div class="f-card"><span class="f-hor">${p.date ? txt(pl.items[0].e.date || p.date) : '—'}</span>${vignette(p)}` +
      `<div class="f-tx"><span class="f-k">${t.ici} · ${t.arretDe(pl.deb + 1, pl.sq.length)}</span><b>${esc(titre)}</b>${subs ? `<ul>${subs}</ul>` : ''}</div></div></li>`);
    if (ap) { carte(ap); derI = pl.fin + 1; }
    else { rail.push(`<li class="f-bout">${t.dernier}</li>`); derI = pl.fin; }
    derSq = pl.sq;
  }

  // Les essentiels : ce que le guide classe au sommet avant le premier arrêt.
  const iPrem = pos(lignes[0]);
  const memes = new Set(ids);
  const deja = {};
  const liste = [];
  let manque = false, minutes = 0;
  if (m.a) for (const l of seq.slice(0, iPrem)) {
    if (l.e.level !== m.a || memes.has(l.e.id)) continue;
    if (cle === 'mcu' && l.e.dim && !p.dim) continue;
    if (l.rt) minutes += l.rt; else manque = true;
    const k = compact(l.e.title);
    if (!deja[k]) { deja[k] = 1; liste.push(l); }
  }
  const vers = `${urlU}?vers=${encodeURIComponent(p.id)}`;
  const VISIBLES = 12;
  const grille = liste.slice(0, VISIBLES).map(l => `<li><a href="${urlDe(l.e.id)}">${vignette(l.e)}<span>${txt(l.e.title)}</span></a></li>`).join('');
  const reste = liste.slice(VISIBLES).map(l => `<li><a href="${urlDe(l.e.id)}">${txt(l.e.title)}</a></li>`).join('');
  const blocEss = !m.a ? '' : `<section class="f-sec"><div class="f-tete"><div><h2 class="f-h2">${t.essentiels}</h2>` +
    `<p class="f-dek">${liste.length ? t.compte(liste.length) + (manque || !minutes ? '' : ' · ' + t.heures(Math.round(minutes / 60))) + ' · ' + t.guide : t.aucun}</p></div>` +
    `${liste.length ? `<a class="f-iti" href="${vers}">${t.calcul}</a>` : ''}</div>` +
    (grille ? `<ul class="f-grille">${grille}</ul>` : '') +
    (reste ? `<details class="f-plus"><summary>${t.autres(liste.length - VISIBLES)}</summary><ul>${reste}</ul></details>` : '') + `</section>`;

  // Les textes, à l'identique des données.
  const cats = (m.CG.faqCats || []).filter(c => c && c.key && c.q);
  const textes = [];
  const vus = new Set();
  const garde = v => { const k = compact(v); if (!k || vus.has(k)) return false; vus.add(k); return true; };
  for (const l of lignes) {
    const e = l.e;
    for (const c of ['desc', 'bignote', 'note']) {
      if (typeof e[c] === 'string' && garde(e[c])) textes.push(`<div class="f-q n"><p>${txt(e[c])}</p></div>`);
    }
    if (Array.isArray(e.notes)) for (const n of e.notes) {
      const v = typeof n === 'string' ? n : n && (n.text || n.t);
      if (v && garde(v)) textes.push(`<div class="f-q n"><p>${txt(v)}</p></div>`);
    }
    if (e.faq) for (const c of cats) {
      const r = e.faq[c.key];
      if (typeof r !== 'string' || !r || !garde(r)) continue;
      // Une série en plusieurs places repose la même question : le morceau les distingue.
      const sub = lignes.length > 1 && e.subitems && e.subitems[0] ? ` (${decode(e.subitems[0])})` : '';
      textes.push(`<div class="f-q"><h3>${esc(nb(decode(c.q).replace(/\{name\}/g, titre + sub)))}</h3><p>${txt(r)}</p></div>`);
    }
  }
  const blocTx = textes.length ? `<section class="f-sec"><h2 class="f-h2">${t.notes}</h2><div class="f-qr">${textes.join('')}</div></section>` : '';

  // L'afficheur du premier écran.
  const dur = lignes.reduce((a, l) => a + l.rt, 0);
  const lv = p.level && t.niveaux[p.level];
  const typeNom = typeDe(p);
  const cases = [
    places.length > 1 ? [String(places.length), t.places] : [`${places[0].deb + 1} / ${places[0].sq.length}`, t.arret],
    p.present && [decode(p.present), t.present],
    p.date && [decode(p.date), p.present ? t.mem : t.date],
    dur > 0 && !lignes.some(l => !l.rt) && [hm(dur), t.duree],
    lv && [lv, t.niveau],
    typeNom && [typeNom, t.type],
  ].filter(Boolean).map(([v, l]) => `<div class="s"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('');

  // Le plan du haut : la ligne entière, et où l'œuvre y tombe.
  const sq0 = places[0].sq;
  const ou = i => ((i + .5) / sq0.length * 100).toFixed(2);
  const stations = [];
  let eraPrec = null;
  sq0.forEach((l, i) => { if (l.era !== eraPrec) { stations.push(`<i class="f-st" style="left:${ou(i)}%"></i>`); eraPrec = l.era; } });
  const plan = `<div class="f-plan" aria-hidden="true"><div class="f-voie"><i class="f-fait" style="width:${ou(places[0].deb)}%"></i>${stations.join('')}` +
    places.filter(pl => pl.sq === sq0).map(pl => `<i class="f-pt" style="left:${ou(pl.deb)}%"></i>`).join('') +
    `</div><div class="f-bouts"><span>${t.depart}</span><span>${t.terminus}</span></div></div>`;

  const img = abs(site, p.img);

  // Le référencement.
  const contient = compact(titre).includes(compact(m.nom));
  const q = nb(t.q(titre, m.nom, !contient));
  const q60 = (q + ' | Chronologeek').length <= 60 ? q : nb(t.q(titre, m.nom, false));
  const pl0 = places[0];
  const av0 = pl0.sq[pl0.deb - 1], ap0 = pl0.sq[pl0.fin + 1];
  const posTxt = places.length > 1 ? t.posB(places.length) : pl0.deb === 0 ? t.pos1 : !ap0 ? t.posN : t.posK(pl0.deb + 1, pl0.sq.length);
  const n = x => x ? decode(x.e.title) : '';
  const dat = p.date ? decode(p.date) : '';
  let desc = nb(t.d(titre, m.nom, posTxt, n(av0), n(ap0), dat));
  if (desc.length > 160) desc = nb(t.d(titre, m.nom, posTxt, '', n(ap0), dat));
  if (desc.length > 160) desc = nb(t.d(titre, m.nom, posTxt, '', '', dat));
  if (desc.length > 160) desc = nb(t.d(titre, m.nom, posTxt, '', '', ''));

  const enUrl = langue === 'en' ? moi : autreUrl, frUrl = langue === 'fr' ? moi : autreUrl;
  const fil = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
    { '@type':'ListItem', position:1, name:t.accueil, item:site+sAccueil },
    { '@type':'ListItem', position:2, name:m.nom, item:site+urlU },
    { '@type':'ListItem', position:3, name:titre, item:site+moi } ] };
  const schema = typeSchema(p);
  const oeuvre = { '@context':'https://schema.org', '@type':schema, name:titre, url:site+moi, inLanguage:langue,
    ...(img ? { image:img } : {}), ...(p.isbn && schema === 'Book' ? { isbn:p.isbn } : {}) };
  const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g,'\\u003c')}</script>`;

  // Le menu du site, avec l'univers de l'œuvre allumé et le drapeau vers sa version.
  const ici = h => h.split(`<a href="${urlU}"`).join(`<a href="${urlU}" aria-current="true"`);
  const header = ici(ch.header).replace(/(class="icon-btn lang-btn" href=")[^"]*"/g, `$1${autreUrl}"`);
  const footer = ici(ch.footer);
  const L = compact(titre).length;
  const taille = L <= 10 ? '' : L <= 18 ? ' l2' : L <= 30 ? ' l3' : ' l4';
  const station1 = decode(lignes[0].era.title || '');

  const html = `<!doctype html>
<html lang="${langue}" style="--uni:${encre}">
<head>
<meta charset="utf-8"/>
${TETE_REGLAGES}
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc((q60 + ' | Chronologeek').length <= 60 ? q60 + ' | Chronologeek' : q60)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${site}${moi}"/>
<link rel="alternate" hreflang="en" href="${site}${enUrl}"/>
<link rel="alternate" hreflang="fr" href="${site}${frUrl}"/>
<link rel="alternate" hreflang="x-default" href="${site}${enUrl}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="Chronologeek"/>
<meta property="og:title" content="${esc(q60)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${site}${moi}"/>
${img ? `<meta property="og:image" content="${esc(img)}"/>\n` : ''}<meta property="og:locale" content="${langue === 'fr' ? 'fr_FR' : 'en_US'}"/>
<meta property="og:locale:alternate" content="${langue === 'fr' ? 'en_US' : 'fr_FR'}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" type="image/png" href="/images/icon-192.png"/>
<link rel="manifest" href="/manifest.json"/>
<meta name="theme-color" content="#08080f"/>
<link rel="preload" as="font" type="font/woff2" href="/fonts/bigshoulders-latin.woff2" crossorigin/>
<link rel="stylesheet" href="/works/fiche.css"/>
${ld(fil)}
${ld(oeuvre)}
</head>
<body>
${header}
<section class="ln-hero f-hero">
  ${p.img ? `<div class="ln-bg" style="background-image:url(${esc(p.img)})" aria-hidden="true"></div>` : '<div class="ln-bg" style="background-image:none" aria-hidden="true"></div>'}
  <div class="wrap">
    <nav class="f-fil" aria-label="${t.fil}"><a href="${sAccueil}">${t.accueil}</a> › <a href="${urlU}">${esc(m.nom)}</a> › ${esc(titre)}</nav>
    <div class="ln-head"><h1 class="disp"><span class="tag">${t.tag}</span> <span class="nm${taille}">${esc(titre)}</span> <span class="f-fin">${esc(nb(t.fin(m.nom, !contient)))}</span></h1></div>
    <div class="ln-board stats f-board">${cases}</div>
    ${plan}
  </div>
</section>
<div class="wrap ticket-row">
  <a class="ticket" href="${urlU}#${esc(p.id)}" style="text-decoration:none">
    <span class="t-stub" aria-hidden="true"><span>${CODES[cle]}</span></span>
    <span class="t-txt"><span class="t-k">${t.billet}</span><span class="t-nm">${esc(titre)}</span><span class="t-st">${station1 ? esc(station1) : esc(m.nom)}</span></span>
    <span class="start t-go" aria-label="${t.voir}"><span class="f-go-t">${t.voir} </span><em>▸</em></span>
  </a>
</div>
<main class="wrap f-corps">
<section class="f-sec"><h2 class="f-h2">${t.sur}</h2>${places.length > 1 ? `<p class="f-dek">${t.blocs(places.length)}</p>` : ''}<ol class="f-rail">${rail.join('')}</ol></section>
${blocEss}
${blocTx}
</main>
${footer}
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer');if(b&&d)b.addEventListener('click',function(){var o=d.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',${JSON.stringify(t.menu[1])}.replace(/.*/,o?${JSON.stringify(t.menu[1])}:${JSON.stringify(t.menu[0])}))})})();</script>
<script data-goatcounter="https://arcanerval.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<script src="/pwa.js"></script>
<script src="/app.js"></script>
</body>
</html>
`;
  return { sortie: `${moi.slice(1)}.html`, url: moi, html };
}

/**
 * Prépare les pages. `urls[langue][cle]` donne l'URL d'une route. Sort `tables`
 * (`{route: {id: chemin}}`, dont le pré-rendu a besoin tôt), `plan` (le sitemap) et
 * `rendre(habillages)`, à appeler une fois la page Star Wars publiée.
 */
export function oeuvres({ racine, site, urls }) {
  const tables = {}, plan = [], taches = [];
  const repli = {
    fr: charge(racine, 'data.js').CG.badgeLabels,
    en: charge(racine, 'data-en.js').CG.badgeLabels,
  };
  for (const cle of Object.keys(SOURCES)) {
    const route = urls.en[cle].split('/').pop();
    const mo = { fr: modele(racine, cle, 'fr'), en: modele(racine, cle, 'en') };
    const liste = oeuvresDe(mo.en);
    const chemin = {};
    for (const o of liste) for (const i of o.ids) chemin[i] = o.s;
    for (const i of Object.keys(mo.fr.parId)) {
      if (!chemin[i]) throw new Error(`oeuvres : ${i} existe en français seulement`);
    }
    tables[route] = chemin;
    for (const o of liste) {
      const url = l => `${T[l].base}/${route}/${o.s}`;
      for (const langue of ['fr', 'en']) {
        const autre = langue === 'fr' ? 'en' : 'fr';
        taches.push(ch => page({ cle, route, langue, m: mo[langue], ids: o.ids, s: o.s, site, ch: ch[langue],
          urlDe: id => `${T[langue].base}/${route}/${chemin[id]}`,
          urlU: urls[langue][cle], sAccueil: urls[langue].accueil, autreUrl: url(autre),
          labelsRepli: repli[langue] }));
      }
      plan.push({ cle, en: url('en'), fr: url('fr') });
    }
  }
  if (taches.length < 1000) throw new Error(`oeuvres : ${taches.length} pages seulement`);
  return { tables, plan,
    rendre: ch => ({ pages: taches.map(f => f(ch)), css: ch.en.css + CSS_FICHE }) };
}

/** L'adresse d'une œuvre, pour le pré-rendu. */
export const baseOeuvres = langue => T[langue].base;
