/* `node _proto/ordre-sortie.mjs [sw|mcu|jurassic|…]` — relève la date de sortie
   complète de chaque entrée du parcours par ordre de sortie, chez TMDB,
   et dit où l'ordre écrit dans `erasRelease` ne la suit pas. Sans
   argument, il passe tous les univers qui ont ce parcours. Il n'écrit
   rien : il rapporte, et sort en erreur s'il trouve un rang faux.

   À rejouer à chaque œuvre ajoutée. `erasRelease` ne porte que l'année
   de sortie, et l'année ne suffit pas à ranger une ère : The Punisher:
   One Last Kill et Spider-Man: Brand New Day annonçaient 2026 tous les
   deux, et deux mois et demi les séparent. Personne ne voit l'erreur à
   l'écran — les deux cartes disent « SORTIE 2026 » —, seul ce script la
   dit.

   `detailler-sortie.mjs` écrit cet ordre, jusqu'à l'épisode et au numéro :
   ce script-ci est son contrôle, et il relit les dates de son côté.

   Quatre choses à savoir :

   - **Un morceau est daté par SON PREMIER ÉPISODE, jamais par sa saison.**
     « Season 3 Episodes 5-8 » se date au cinquième, une saison entière à son
     premier, et une série à sa saison et non à sa première. Le numéro vient
     du sous-item de la carte, du champ `season` — Marvel le pose — ou du
     premier sous-item du bloc. Un comic se date dans `sorties/numeros.mjs`.
   - **La sortie américaine, pas la première au monde.** `release_date`
     d'un film peut être une projection de festival ; on lit d'abord les
     dates par pays et on ne retombe sur elle qu'à défaut.
   - **Ce que TMDB ne connaît pas est écrit ici, à la main** : les six
     jeux de Star Wars et les quatre Marvel One-Shots portent `tmdb:0`,
     et il n'y a pas de fiche à interroger. Un jeu est daté de sa sortie
     PC/console, un One-Shot du Blu-ray qui le porte. Sans ces lignes le
     rapport annonçait « 10 sans date » et ne disait rien de leur rang.
   - **Une date peut être partielle** quand seul le mois est connu —
     Zero Company. La comparaison est lexicographique, donc « 2026-08 »
     se range bien entre juillet et septembre ; l'affichage le dit avec
     des points d'interrogation plutôt que d'inventer un jour. */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { NUMEROS } from './sorties/numeros.mjs';

export const UNIVERS = {
  sw: {
    fichier: '_proto/data.js', global: 'DATA_SW',
    dates: {
      /* Les six jeux, à leur sortie PC/console. */
      'sw-rl-bf2': '2017-11-17',      // Star Wars Battlefront II
      'sw-fo': '2019-11-15',          // Jedi: Fallen Order
      'sw-squadrons': '2020-10-02',   // Squadrons
      'sw-survivor': '2023-04-28',    // Jedi: Survivor
      'sw-outlaws': '2024-08-30',     // Outlaws
      'sw-zerocompany': '2026-08',    // Zero Company, mois seul
      'sw-galacticracer': '2026-10-06', // Galactic Racer
      /* Le guide saute les six premiers épisodes de la saison 4 de The Clone
         Wars : la carte commence au septième. */
      'sw-rl-tcw-s4': '2011-10-28',
    },
    doubles: { '60554|3': [1] },
  },
  mcu: {
    fichier: '_proto/data-mcu.js', global: 'DATA_MCU',
    /* Les deux segments restent à leur place de la découverte : leurs films
       sont d'une autre époque, et ils ne fusionnent pas avec les phases. */
    flux: era => era.special || 'phases',
    dates: {
      'mcu-consultant': '2011-09-13',  // bonus du Blu-ray Thor
      'mcu-item47': '2012-09-25',      // bonus du Blu-ray Avengers
      'mcu-ac-os': '2013-09-09',       // bonus du Blu-ray Iron Man 3
      'mcu-roi': '2014-02-04',         // bonus du Blu-ray Thor 2
      'mcu-egenc': '2026-09-25',       // réédition Endgame Encore, en salles
    },
  },
  jurassic: {
    fichier: '_proto/data-jurassic-en.js', global: 'window.JURASSIC',
    dates: {
      /* Les romans, à leur parution chez Random House (fiches Penguin
         Random House). */
      'jw-claire': '2018-06-26',      // The Evolution of Claire
      'jw-maisie1': '2022-06-14',     // Maisie Lockwood Adventures 1 - Off the Grid
      'jw-maisie2': '2022-09-27',     // Maisie Lockwood Adventures 2 - The Yosemite Six
    },
  },
  dragonage: {
    fichier: '_proto/data-dragonage-en.js', global: 'DATA_DA',
    temps: false,
    /* Rien de Dragon Age ne se date chez TMDB : ses fiches de jeux
       empruntent un visuel, et la date qui vient avec est celle d'un autre
       titre. Tout est donc écrit ici, relevé sur le wiki Dragon Age (API
       MediaWiki) : un jeu et un DLC à leur première sortie, un roman à sa
       parution, un comic à son premier numéro, la sortie nord-américaine
       quand il y en a plusieurs. */
    dates: {
      'da-throne-1': '2009-03-03', 'da-calling-1': '2009-10-13',
      'da-rl-origins': '2009-11-03', 'da-stone-1': '2009-11-03', 'da-keep-1': '2009-11-03',
      'da-ostagar-1': '2010-01-13', 'da-awakening-1': '2010-03-16',
      'da-wfall-1': '2010-05-22', 'da-leliana-1': '2010-07-06',
      'da-amgarrak-1': '2010-08-10', 'da-witch-1': '2010-09-07',
      'da-rl-da2': '2011-03-08', 'da-exiled-1': '2011-03-08', 'da-legacy-1': '2011-07-26',
      'da-redemption-1': '2011-10-11', 'da-assassin-1': '2011-10-11',
      'da-asunder-1': '2011-12-20',
      /* sorti au Japon le 11 février, en DVD aux États-Unis le 29 mai */
      'da-seeker-1': '2012-05-29',
      'da-masked-1': '2014-04-08', 'da-lastflight-1': '2014-09-16',
      'da-lastcourt-1': '2014-11-07', 'da-rl-inquisition': '2014-11-18',
      'da-hakkon-1': '2015-03-24', 'da-descent-1': '2015-08-11',
      'da-trespasser-1': '2015-09-08', 'da-tevinter-1': '2020-03-10', 'da-absolution-1': '2022-12-09', 'da-veilguard-1': '2024-10-31',
    },
  },
  avatar: {
    fichier: '_proto/data-avatar.js', global: 'window.AVATAR',
    temps: false,
    /* Deux comics parus en feuilleton dans les DVD de la série. */
    periodes: {
      'avt-divided-we-fall': ['2007-01-23', '2007-08-14'],
      'avt-private-fire': ['2007-10-30', '2008-07-29'],
    },
    /* Les quatre livres de Korra ne nomment aucune saison. */
    plages: {
      'avt-la-legende-de-korra-livre-1-l-air': [{ s: 1, a: null, b: null }],
      'avt-la-legende-de-korra-livre-2-les-esprits': [{ s: 2, a: null, b: null }],
      'avt-la-legende-de-korra-livre-3-le-changemen': [{ s: 3, a: null, b: null }],
      'avt-la-legende-de-korra-livre-4-l-equilibre': [{ s: 4, a: null, b: null }],
    },
    /* L'écrit, relevé sur le wiki Avatar (API MediaWiki, champ
       `publishdate`) : un comic à sa première parution — numéro de
       Nickelodeon Magazine, Free Comic Book Day ou premier tome chez Dark
       Horse —, un roman à sa sortie en grand format. Les trois histoires
       des Lost Adventures qui n'ont jamais paru dans le magazine datent du
       recueil. */
    dates: {
      'avt-sokka-the-avatar': '2006-09-12',
      /* le jeu en ligne : sa page n'a pas de date, mais le concours qui
         l'accompagnait était en ligne en février 2007 */
      'avt-escape-from-the-spirit-world': '2007-02',
      /* un numéro ou un livre qui porte plusieurs histoires est une seule
         sortie : le deuxième Nick Mag Presents, le recueil des Lost
         Adventures, le Free Comic Book Day 2021, l'anthologie Patterns in
         Time, et les trois tomes de Fumée et Ombre au premier */
      'avt-rl-nickmag2': '2007-09-18',
      'avt-bumi-vs-toph-round-one': '2009-05', 'avt-relics': '2011-05-07',
      'avt-rl-lostadventures': '2011-06-14', 'avt-rebound': '2013-05-04', 'avt-shells': '2014-05-03',
      
      
      'avt-sisters': '2015-05-02',
      'avt-legacy': '2015-10-13',
      'avt-amies-pour-la-vie-free-comic-book-day-2016': '2016-05-07',
      'avt-lost-pets-free-comic-book-day-2018': '2018-05-05', 'avt-the-rise-of-kyoshi': '2019-07-16',
      'avt-an-avatar-s-chronicle': '2019-08-06', 'avt-legacy-of-the-fire-nation': '2020-02-04',
      'avt-the-shadow-of-kyoshi': '2020-07-21', 'avt-katara-and-the-pirate-s-silver': '2020-10-13',
      'avt-toph-beifong-s-metalbending-academy': '2021-02-16', 'avt-suki-alone': '2021-07-27',
      'avt-rl-fcbd2021': '2021-08-14',
      'avt-the-dawn-of-yangchen': '2022-07-19',
      'avt-rl-patterns': '2022-11-30',
      'avt-the-legacy-of-yangchen': '2023-07-18', 'avt-azula-in-the-spirit-temple': '2023-10-31',
      'avt-the-reckoning-of-roku': '2024-07-23', 'avt-the-bounty-hunter-and-the-tea-brewer': '2024-08-20',
      'avt-mystery-of-penquan-island': '2025-03-04', 'avt-ashes-of-the-academy': '2025-03-25',
      'avt-avatar-legends-city-of-echoes': '2025-07-22', 'avt-the-awakening-of-roku': '2025-12-30',
      'avt-earth-and-water-comics-giveaway-day-2026': '2026-05-02', 'avt-kya-and-the-secret-of-the-sand': '2026-07-28',
      'avt-masters-of-the-elements-off-duty': '2026-08-25', 'avt-jet-rebels-and-rhinos': '2026-09-08',
    },
  },
  re: {
    fichier: '_proto/data-re-en.js', global: 'window.RE',
    temps: false,
    /* Les jeux portent un identifiant RAWG dans `tmdb` : rien à demander à
       TMDB pour eux, tout est écrit ici, relevé sur le wiki Resident Evil
       (API MediaWiki), sortie nord-américaine. Un jeu est daté par la
       VERSION que la timeline conseille, tranché par Niko le 22 octobre
       2026 : RE 2 Remake en 2019, l'HD Remaster de RE en 2015 (annonce de
       Capcom), Code: Veronica X en 2001. Un manga est daté de son premier
       volume. */
    dates: {
      're-cvx': '2001-08-21', 're-re0': '2002-11-12', 're-outbreak': '2004-03-30',
      're-outbreak2': '2005-04-26', 're-umbrella': '2007-11-13',
      're-re5': '2009-03-13', 're-darkside': '2009-11-17', 're-revelations': '2012-02-07',
      're-marhawa': '2012-06-08',
      /* le court documentaire du DVD et du Blu-ray de Damnation */
      're-lasplagas': '2012-09-25',
      're-re6': '2012-10-02', 're-re1': '2015-01-20', 're-revelations2': '2015-02-24',
      're-heavenly': '2015-03-06', 're-beginninghour': '2016-06-13', 're-re7': '2017-01-24',
      're-re2': '2019-01-25', 're-re3': '2020-04-03', 're-maiden': '2021-01-21',
      're-village': '2021-05-07', 're-shadowsofrose': '2022-10-28', 're-id-comic': '2022-12-21',
      're-re4': '2023-03-24', 're-evilname': '2026-02-02', 're-requiem': '2026-02-27',
    },
  },
  bladerunner: {
    fichier: '_proto/data-bladerunner-en.js', global: 'window.BLADERUNNER',
    temps: false,
    /* Les comics de Titan, relevés sur le wiki Blade Runner (API MediaWiki,
       `publication_date`), datés de leur premier numéro. Les deux
       histoires du Free Comic Book Day 2021 sortent dans le même numéro. */
    dates: {
      /* une série ou un numéro est une sortie, datée de son premier numéro */
      'br-fcbd2020-2019': '2020-08-12', 'br-rl-fcbd2021': '2021-08-14',
      /* « Leaving L.A. » est la première série Black Lotus de Titan */
    },
  },
  monsterverse: {
    fichier: '_proto/data-monsterverse-en.js', global: 'window.MONSTERVERSE',
    temps: false,
    /* Films et séries chez TMDB. L'écrit et le jeu viennent du wiki Godzilla
       (API MediaWiki), relevés le 7 novembre 2026 : un roman graphique à sa
       sortie en librairie, les trois séries de comics numéro par numéro dans
       `sorties/numeros.mjs`. Fight or Flight est l'histoire inédite de
       l'omnibus Legends of the Monsterverse, daté de son édition en librairie
       (les contributeurs Kickstarter l'ont eu en août 2023). */
    dates: {
      'mv-aftershock': '2019-05-21', 'mv-dominion': '2021-04-06', 'mv-kingdomkong': '2021-04-06',
      'mv-fightorflight': '2024-03-05', 'mv-hunted': '2024-03-26',
      'mv-survivorinstinct': '2024-10-22', 'mv-declassified': '2025-05-13',
    },
  },
  assassinscreed: {
    fichier: '_proto/data-assassinscreed-en.js', global: 'window.ASSASSINSCREED',
    temps: false,
    /* Deux feuilletons en ligne, à leur première parution et non à leur premier
       volume relié : Dynasty de 2020 à 2022, Forgotten Temple de 2023 à 2026. Un
       chapitre par semaine : une carte, qui dit sa période. */
    periodes: {
      'ac-dynasty-1': ['2020-08-26', '2022-08-31'],
      'ac-forgotten-temple-1': ['2023-04-25', '2026-03-17'],
    },
    /* Tout sauf le film est écrit ici : les jeux portent un identifiant
       RAWG dans `tmdb`. Relevé sur le wiki Assassin's Creed (API
       MediaWiki) : un jeu et un DLC à leur sortie nord-américaine, un livre
       ou un comic à sa toute première parution — en France pour les bandes
       dessinées françaises (Conspiracies, Bloodstone, Fragments), au premier
       volume pour une série. Trois qui n'ont pas de date sur le wiki : le
       programme Animi et Abstergo Hacked prennent celle du jeu qui les
       porte, et The Heir of Memories n'a que son mois, avril 2019, d'après
       le bilan mensuel d'Ubisoft. Those Who Are Treasured est le récit
       croisé avec Valhalla du 14 décembre 2021. */
    dates: {
      'ac-game-1': '2007-11-14', 'ac-altairs-chronicles-1': '2008-02-05',
      'ac-lineage-1': '2009-10-26', 'ac-rl-ii': '2009-11-17',
      'ac-ii-discovery-1': '2009-11-17', 'ac-bloodlines-1': '2009-11-17', 'ac-ascendance-1': '2010-11-16',
      'ac-rl-brotherhood': '2010-11-16', 'ac-the-da-vinci-1': '2011-03-08',
      'ac-the-secret-crusade-1': '2011-06-23', 'ac-embers-1': '2011-11-15',
      'ac-revelations-1': '2011-11-15', 'ac-brotherhood-revelations-animi-1': '2011-11-15',
      'ac-the-lost-archive-1': '2012-02-28', 'ac-the-chain-1': '2012-08-09',
      'ac-rl-iii': '2012-10-30', 'ac-iii-liberation-1': '2012-10-30',
      'ac-benedict-arnold-1': '2012-10-30', 'ac-iii-abstergo-hacked-1': '2012-10-30',
      'ac-forsaken-1': '2012-12-04', 'ac-the-tyranny-of-1': '2013-02-20',
      'ac-iv-black-flag-2': '2013-10-29', 'ac-iv-black-flag-1': '2013-10-29',
      'ac-brahman-1': '2013-10-30', 'ac-freedom-cry-1': '2013-12-17',
      'ac-iv-black-flag-3': '2014-03-04', 'ac-unity-abstergo-entertainment-1': '2014-11-04',
      'ac-unity-1': '2014-11-11', 'ac-rogue-1': '2014-11-11',
      'ac-unity-novel-1': '2014-11-20', 'ac-dead-kings-1': '2015-01-14',
      'ac-chronicles-china-1': '2015-04-21', 'ac-rl-syndicate': '2015-10-23',
      'ac-underworld-1': '2015-11-05', 'ac-jack-the-ripper-1': '2015-12-15',
      'ac-chronicles-india-1': '2016-01-12', 'ac-chronicles-russia-1': '2016-02-09',
      'ac-chronicles-russia-secret-1': '2016-02-09', 'ac-the-last-maharaja-1': '2016-03-01',
      'ac-rl-fcbd2016': '2016-05-07', 'ac-last-descendants-1': '2016-08-30',
      'ac-conspiracies-die-glocke-1': '2016-10-21', 'ac-heresy-1': '2016-11-15',
      'ac-last-descendants-tomb-1': '2016-12-27',
      'ac-origins-desert-oath-1': '2017-10-10', 'ac-origins-1': '2017-10-27',
      'ac-conspiracies-project-rainbow-1': '2017-12-01', 'ac-last-descendants-fate-1': '2017-12-26', 'ac-the-hidden-ones-1': '2018-01-23', 'ac-the-curse-of-1': '2018-03-13',
      'ac-rl-odyssey': '2018-10-05',
      'ac-rl-legacy': '2018-12-04',
      'ac-odyssey-the-lost-1': '2019-04', 'ac-the-fate-of-1': '2019-04-23',
      'ac-gold-1': '2020-02-27',
      'ac-rl-valhalla': '2020-11-10', 'ac-valhalla-geirmunds-saga-1': '2020-11-10', 'ac-fragments-the-blade-1': '2021-04-15',
      'ac-wrath-of-the-1': '2021-05-13', 'ac-the-siege-of-1': '2021-08-12',
      'ac-valhalla-blood-brothers-1': '2021-08-14', 'ac-the-silk-road-1': '2021-09-08',
      'ac-fragments-the-highlands-1': '2021-09-16', 'ac-those-who-are-1': '2021-12-14',
      'ac-fragments-the-witches-1': '2022-01-20', 'ac-dawn-of-ragnarok-1': '2022-03-10', 'ac-valhalla-sword-of-1': '2022-04-05',
      'ac-the-engine-of-1': '2022-08-02', 'ac-escape-room-puzzle-1': '2022-11-29',
      'ac-valhalla-the-hidden-1': '2023-01-25',
      'ac-the-golden-city-1': '2023-05-02', 'ac-the-engine-of-2': '2023-07-04',
      'ac-rl-mirage': '2023-10-05', 'ac-nexus-vr-1': '2023-11-16',
      'ac-mirage-daughter-of-1': '2023-11-21',
      'ac-rl-shadows': '2025-03-20', 'ac-shadows-tales-of-1': '2025-08-20',
      'ac-claws-of-awaji-1': '2025-09-16', 'ac-valley-of-memories-1': '2025-11-18',
      'ac-black-flag-resynced-1': '2026-07-09',
    },
  },
  twd: {
    fichier: '_proto/data-twd-en.js', global: 'DATA_TWD',
    /* Les webséries d'AMC, relevées sur le wiki The Walking Dead : TMDB ne
       connaît pas les trois premières, et range Flight 462 sous la fiche
       de Fear the Walking Dead : sa saison 0 chez TMDB, d'où `saisons`. */
    dates: {
      'twd-torn-1': '2011-10-03', 'twd-cold-1': '2012-10-01', 'twd-oath-1': '2013-10-01',
    },
    saisons: { 'twd-flight-1': 0 },
  },
  witcher: {
    fichier: '_proto/data-witcher-en.js', global: 'window.WITCHER',
    temps: false,
    flux: era => era.branch || era.zone || 'tout',
    /* Deux colonnes, deux ordres : le script les lit l'une après l'autre,
       comme deux ères. Rien ne se date chez TMDB. Sapkowski : une nouvelle
       sort avec son recueil — L'Épée de la providence en 1992, Le Dernier
       Vœu en 1993, l'année seule (catalogue de la BnF et wiki polonais) —,
       et La Route sans retour dans Fantastyka d'août 1988. Le reste vient
       du wiki The Witcher (API MediaWiki) : un comic à son premier numéro,
       un jeu à sa première sortie. Kiddo est la bande dessinée offerte avec
       la mise à jour nouvelle génération de The Witcher 3. */
    dates: {
      'w-road': '1988-08', 'w-rl-sword': '1992', 'w-rl-lastwish': '1993',
      'w-blood': '1994', 'w-contempt': '1995', 'w-baptism': '1996', 'w-tower': '1997',
      'w-lady': '1999', 'w-storms': '2013-11-06', 'w-crossroads': '2024-11-28',
      'wg-w1': '2007-10-26', 'wg-neutrality': '2008-04-10', 'wg-sideeffects': '2008-09-16',
      'wg-w2': '2011-05-17', 'wc-reasons': '2011', 'wv-killing': '2013-08-14', 'wv-night': '2015-05-14',
      'wg-w3': '2015-05-19', 'wc-killing': '2015-05-19', 'wg-hos': '2015-10-13',
      'wc-conscience': '2015-10-13', 'wg-baw': '2016-05-31',
      'wg-thronebreaker': '2018-10-23', 'wc-woods': '2021-08-14', 'wc-grain': '2022-06-22',
      'wc-kiddo': '2022-12-14', 'wc-frog': '2023-05-06', 'wc-lesser': '2023-12-22',
      'wc-edge': '2025-01-21', 'wc-price': '2025-07-29',
      'wc-witcher': '2025-12-16', 'wc-lastwish': '2026-08-11',
    },
  },
  startrek: {
    fichier: '_proto/data-startrek-en.js', global: 'DATA_ST',
    /* Tout se date chez TMDB : une saison par son `air_date`, un film par
       sa sortie américaine. Rien à écrire ici. */
    dates: {},
    doubles: {
      '655|1': [1], '655|7': [25], '580|1': [1], '580|4': [1], '580|7': [25],
      '1855|1': [1], '1855|5': [15], '1855|7': [25],
    },
  },
};

const cache = new Map();
export async function api(chemin, cle) {
  if (cache.has(chemin)) return cache.get(chemin);
  const r = await fetch('https://api.themoviedb.org/3' + chemin +
    (chemin.includes('?') ? '&' : '?') + 'api_key=' + cle);
  const j = r.ok ? await r.json() : null;
  cache.set(chemin, j);
  return j;
}

/* Le numéro de saison : le champ quand il existe, le premier sous-item
   qui le nomme sinon. Les sous-items de l'entrée de parcours priment —
   c'est là qu'une saison recollée dit laquelle elle est. Rend aussi le
   premier épisode quand le libellé en nomme un : c'est lui qui date un
   morceau, jamais la saison. */
export function saisonDe(x, s) {
  for (const t of x.subitems || []) {
    const m = /^\s*(?:Saison|Season)\s+(\d+)(?:\s+(?:Épisodes?|Episodes?)\s*(\d+)?.*)?\s*$/i.exec(t);
    if (m) return { n: +m[1], e: m[2] ? +m[2] : null };
  }
  if (s.season) return { n: s.season, e: null };
  for (const t of s.subitems || []) {
    /* « Season 9 Episodes 1-5 » aussi : The Walking Dead et Star Trek
       numérotent leurs blocs ainsi, et c'est la saison qui date. */
    const m = /^\s*(?:Saison|Season)\s+(\d+)(?:\s+(?:Épisodes?|Episodes?)\s*(\d+)?.*)?\s*$/i.exec(t);
    if (m) return { n: +m[1], e: null };
  }
  return null;
}

/* Le guide compte deux fois un épisode double, là où TMDB lui donne un seul
   numéro : « Encounter at Farpoint » y vaut 1 et 2, et tout ce qui suit est
   décalé d'un cran. `doubles` nomme, saison par saison, les épisodes TMDB
   concernés ; un libellé parle toujours le numéro du guide. */
export const doubles = (U, tmdb, s) => (U.doubles || {})[tmdb + '|' + s] || [];
export const numGuide = (n, dbl) => n + dbl.filter(d => d < n).length;

/* La sortie américaine d'un film, et la première au monde à défaut. */
export async function dateFilm(tmdb, cle) {
  const rd = await api('/movie/' + tmdb + '/release_dates', cle);
  const us = rd && (rd.results || []).find(p => p.iso_3166_1 === 'US');
  if (us) {
    const th = us.release_dates.filter(p => [2, 3, 4, 6].includes(p.type))
      .map(p => p.release_date).sort()[0];
    if (th) return th.slice(0, 10);
  }
  const m = await api('/movie/' + tmdb, cle);
  return m ? m.release_date : null;
}

/* Un comic : son premier numéro, ou celui que nomme l'identifiant du morceau. */
function dateNumero(id) {
  if (NUMEROS[id]) return NUMEROS[id][0].d;
  const m = /^(.+?)(?:-rl)?-n(\d+)(?:-\d+)?$/.exec(id);
  const l = m && NUMEROS[m[1]];
  const n = l && l.find(q => q.n === +m[2]);
  return n ? n.d : null;
}

async function dateDe(x, s, cle, U) {
  if (!s.tmdb || s.tmdb === '0') return null;
  if (s.media === 'tv') {
    const pl = (U.plages || {})[s.id];
    const q = !(x.subitems || []).length && pl ? { n: pl[0].s, e: null } : saisonDe(x, s);
    if (q) {
      /* Une saison que TMDB range ailleurs que sous son numéro du guide :
         Flight 462 est la saison 0 de Fear the Walking Dead. */
      const num = (U.saisons || {})[s.id] ?? q.n;
      const sa = await api('/tv/' + s.tmdb + '/season/' + num, cle);
      if (sa) {
        const eps = (sa.episodes || []).filter(e => e.air_date);
        const dbl = doubles(U, s.tmdb, q.n);
        const ep = q.e ? eps.find(e => {
          const g = numGuide(e.episode_number, dbl);
          return g === q.e || (dbl.includes(e.episode_number) && g + 1 === q.e);
        }) : eps[0];
        if (ep) return ep.air_date;
        if (sa.air_date) return sa.air_date;
      }
    }
    const t = await api('/tv/' + s.tmdb, cle);
    return t ? t.first_air_date : null;
  }
  return dateFilm(s.tmdb, cle);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let fauxTotal = 0;
  const demandes = process.argv.slice(2).filter(a => UNIVERS[a]);
  for (const nom of (demandes.length ? demandes : Object.keys(UNIVERS))) {
    const U = UNIVERS[nom];
    const src = fs.readFileSync(new URL('../' + U.fichier, import.meta.url), 'utf8');
    const { CG, D } = new Function('window', 'var CGD;' + src +
      ';return {CG:window.CG,D:' + U.global + '};')({});
    if (!D.erasRelease) { console.log('\n### ' + nom + ' — pas de parcours par ordre de sortie'); continue; }
    const BYID = {};
    D.eras.forEach(e => e.entries.forEach(x => { BYID[x.id] = x; }));

    console.log('\n### ' + nom.toUpperCase() + ' — ' + D.title);
    let faux = 0, sans = 0, n = 0;
    for (const era of D.erasRelease) {
      console.log('\n== ' + era.title);
      let prec = null;
      for (const x of era.entries) {
        const id = x.ref || x.id;
        const s = BYID[x.ref || (x.covers || [])[0]] || {};
        const d = dateNumero(id) || ((U.periodes || {})[id] || [])[0] || U.dates[id] || await dateDe(x, s, CG.tmdbKey, U);
        n++;
        if (!d) sans++;
        /* L'année affichée — la première, pour une saison à cheval sur deux
           ans — doit être celle de la date relevée : c'est la
           seule des deux que le visiteur voit, et rien d'autre ne la
           contrôle. */
        const an = d && x.rel && (d.slice(0, 4) !== String(x.rel).slice(0, 4) ||
          /* `rel` porte désormais le jour, et c'est celui du premier épisode
             ou du premier numéro : relevé deux fois, il ne doit pas diverger. */
          (d.length === 10 && String(x.rel).length >= 10 && String(x.rel).slice(0, 10) !== d));
        /* Une date partielle qui préfixe la précédente — « 2011 » après
           « 2011-05-17 » — ne la contredit pas : on ne sait pas dans quel
           ordre elles tombent, et elle ne fait pas reculer le repère. */
        const flou = prec && d && prec.startsWith(d);
        const casse = (prec && d && d < prec && !flou) || an;
        if (casse) faux++;
        /* « 2026-08 » s'affiche « 2026-08-?? » : le tiret dit que c'est un
           jour qui manque, pas trois caractères de date en plus. */
        const vue = d ? (d.length === 7 ? d + '-??' : d) : '????-??-??';
        console.log((casse ? '  ⚠ ' : '    ') + vue +
          '   ' + String(x.rel || '—').padEnd(10) + s.title + '   [' + id + ']' + (an ? '   ← l’année affichée n’est pas la bonne' : ''));
        if (d && !flou) prec = d;
      }
    }
    console.log('\n' + n + ' entrées · ' + faux + ' hors ordre · ' + sans + ' sans date');
    fauxTotal += faux + sans;
  }
  if (fauxTotal) process.exitCode = 1;
}
