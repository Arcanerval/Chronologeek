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

   Quatre choses à savoir :

   - **Une série est datée par SA SAISON, jamais par sa première.** Une
     saison 2 datée par la série entière remonte de plusieurs années et
     casse tout l'ordre autour d'elle. Le numéro vient du champ `season`
     quand il existe — Marvel le pose — et sinon du premier sous-item,
     « Saison 3 », qui est la seule marque que Star Wars en donne.
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

const UNIVERS = {
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
      /* The Clone Wars entre à la date de sa première télé, et non de
         sa saison 1 : le bloc tient les sept saisons d'un coup, rangées
         dans l'ordre du guide et non dans celui des sorties. C'est le
         seul endroit du parcours où l'ordre de sortie ne descend pas
         jusqu'à l'intérieur de l'entrée — la série a diffusé sur douze
         ans, et ses arcs ne sortent pas dans l'ordre où on les regarde. */
      'sw-rl-tcw': '2008-10-03',
    },
  },
  mcu: {
    fichier: '_proto/data-mcu.js', global: 'DATA_MCU',
    dates: {
      'mcu-consultant': '2011-09-13',  // bonus du Blu-ray Thor
      'mcu-item47': '2012-09-25',      // bonus du Blu-ray Avengers
      'mcu-ac-os': '2013-09-09',       // bonus du Blu-ray Iron Man 3
      'mcu-roi': '2014-02-04',         // bonus du Blu-ray Thor 2
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
      'da-asunder-1': '2011-12-20', 'da-grove-1': '2012-02-22',
      /* sorti au Japon le 11 février, en DVD aux États-Unis le 29 mai */
      'da-seeker-1': '2012-05-29',
      'da-speak-1': '2012-08-22', 'da-sleep-1': '2013-03-27',
      'da-masked-1': '2014-04-08', 'da-lastflight-1': '2014-09-16',
      'da-lastcourt-1': '2014-11-07', 'da-rl-inquisition': '2014-11-18',
      'da-hakkon-1': '2015-03-24', 'da-descent-1': '2015-08-11',
      'da-trespasser-1': '2015-09-08', 'da-magekiller-1': '2015-12-16',
      'da-errant-1': '2017-05-10', 'da-deception-1': '2018-10-17',
      'da-wraith-1': '2020-01-15', 'da-tevinter-1': '2020-03-10',
      'da-fortress-1': '2021-03-31', 'da-absolution-1': '2022-12-09',
      'da-missing-1': '2023-01-25', 'da-veilguard-1': '2024-10-31',
    },
  },
  avatar: {
    fichier: '_proto/data-avatar.js', global: 'window.AVATAR',
    /* L'écrit, relevé sur le wiki Avatar (API MediaWiki, champ
       `publishdate`) : un comic à sa première parution — numéro de
       Nickelodeon Magazine, Free Comic Book Day ou premier tome chez Dark
       Horse —, un roman à sa sortie en grand format. Les trois histoires
       des Lost Adventures qui n'ont jamais paru dans le magazine datent du
       recueil. Les quatre livres de Korra n'ont pas de sous-item « Saison » :
       sans ces lignes, ils prendraient tous la première de la série. */
    dates: {
      'avt-sokka-the-avatar': '2006-09-12', 'avt-divided-we-fall': '2007-01-23',
      /* le jeu en ligne : sa page n'a pas de date, mais le concours qui
         l'accompagnait était en ligne en février 2007 */
      'avt-escape-from-the-spirit-world': '2007-02',
      /* un numéro ou un livre qui porte plusieurs histoires est une seule
         sortie : le deuxième Nick Mag Presents, le recueil des Lost
         Adventures, le Free Comic Book Day 2021, l'anthologie Patterns in
         Time, et les trois tomes de Fumée et Ombre au premier */
      'avt-rl-nickmag2': '2007-09-18', 'avt-private-fire': '2007-10-30',
      'avt-bumi-vs-toph-round-one': '2009-05', 'avt-relics': '2011-05-07',
      'avt-rl-lostadventures': '2011-06-14',
      'avt-la-promesse-the-promise': '2012-01-25',
      'avt-la-legende-de-korra-livre-1-l-air': '2012-04-14',
      'avt-la-recherche-the-search': '2013-03-20', 'avt-rebound': '2013-05-04',
      'avt-la-legende-de-korra-livre-2-les-esprits': '2013-09-13',
      'avt-the-rift': '2014-03-05', 'avt-shells': '2014-05-03',
      'avt-la-legende-de-korra-livre-3-le-changemen': '2014-06-27',
      'avt-la-legende-de-korra-livre-4-l-equilibre': '2014-10-03',
      'avt-sisters': '2015-05-02', 'avt-rl-smoke': '2015-09-23',
      'avt-legacy': '2015-10-13',
      'avt-amies-pour-la-vie-free-comic-book-day-2016': '2016-05-07',
      'avt-north-and-south': '2016-09-14', 'avt-turf-wars': '2017-07-26',
      'avt-lost-pets-free-comic-book-day-2018': '2018-05-05', 'avt-imbalance': '2018-12-18',
      'avt-ruins-of-the-empire': '2019-05-21', 'avt-the-rise-of-kyoshi': '2019-07-16',
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
      'avt-earth-and-water-comics-giveaway-day-2026': '2026-05-02',
      'avt-the-kyoshi-warriors-13': '2026-05-06', 'avt-kya-and-the-secret-of-the-sand': '2026-07-28',
      'avt-masters-of-the-elements-off-duty': '2026-08-25', 'avt-jet-rebels-and-rhinos': '2026-09-08',
    },
  },
  re: {
    fichier: '_proto/data-re-en.js', global: 'window.RE',
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
    /* Les comics de Titan, relevés sur le wiki Blade Runner (API MediaWiki,
       `publication_date`), datés de leur premier numéro. Les deux
       histoires du Free Comic Book Day 2021 sortent dans le même numéro. */
    dates: {
      /* une série ou un numéro est une sortie, datée de son premier numéro */
      'br-rl-2019': '2019-07-17',
      'br-fcbd2020-2019': '2020-08-12', 'br-2029': '2020-12-16',
      'br-origins': '2021-03-10', 'br-rl-fcbd2021': '2021-08-14',
      /* « Leaving L.A. » est la première série Black Lotus de Titan */
      'br-bl-leavingla': '2022-08-10', 'br-2039': '2022-12-07',
      'br-tokyonexus': '2024-07-31', 'br-bl-lasvegas': '2025-09-17',
    },
  },
  assassinscreed: {
    fichier: '_proto/data-assassinscreed-en.js', global: 'window.ASSASSINSCREED',
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
      'ac-ii-discovery-1': '2009-11-17', 'ac-bloodlines-1': '2009-11-17',
      'ac-the-fall-1': '2010-11-10', 'ac-ascendance-1': '2010-11-16',
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
      'ac-rl-fcbd2016': '2016-05-07',
      'ac-assassins-trial-by-1': '2016-05-25', 'ac-last-descendants-1': '2016-08-30',
      'ac-conspiracies-die-glocke-1': '2016-10-21', 'ac-assassins-setting-sun-1': '2016-11-02',
      'ac-templars-black-cross-1': '2016-11-09', 'ac-heresy-1': '2016-11-15',
      'ac-last-descendants-tomb-1': '2016-12-27', 'ac-reflections-1': '2017-03-08',
      'ac-templars-cross-of-1': '2017-04-19', 'ac-last-descendants-locus-1': '2017-05-09',
      'ac-assassins-homecoming-1': '2017-05-10', 'ac-uprising-common-ground-1': '2017-08-02',
      'ac-origins-desert-oath-1': '2017-10-10', 'ac-origins-1': '2017-10-27',
      'ac-conspiracies-project-rainbow-1': '2017-12-01', 'ac-last-descendants-fate-1': '2017-12-26',
      'ac-uprising-inflection-point-1': '2018-01-17', 'ac-the-hidden-ones-1': '2018-01-23',
      'ac-origins-2': '2018-03-07', 'ac-the-curse-of-1': '2018-03-13',
      'ac-rl-odyssey': '2018-10-05', 'ac-uprising-finale-1': '2018-10-23',
      'ac-rl-legacy': '2018-12-04',
      'ac-bloodstone-1': '2019-03-29',
      'ac-odyssey-the-lost-1': '2019-04', 'ac-the-fate-of-1': '2019-04-23',
      'ac-gold-1': '2020-02-27', 'ac-valhalla-song-of-1': '2020-10-21',
      'ac-rl-valhalla': '2020-11-10', 'ac-valhalla-geirmunds-saga-1': '2020-11-10',
      'ac-dynasty-1': '2021-04-01', 'ac-fragments-the-blade-1': '2021-04-15',
      'ac-wrath-of-the-1': '2021-05-13', 'ac-the-siege-of-1': '2021-08-12',
      'ac-valhalla-blood-brothers-1': '2021-08-14', 'ac-the-silk-road-1': '2021-09-08',
      'ac-fragments-the-highlands-1': '2021-09-16', 'ac-those-who-are-1': '2021-12-14',
      'ac-fragments-the-witches-1': '2022-01-20', 'ac-dawn-of-ragnarok-1': '2022-03-10',
      'ac-valhalla-forgotten-myths-1': '2022-03-16', 'ac-valhalla-sword-of-1': '2022-04-05',
      'ac-the-engine-of-1': '2022-08-02', 'ac-escape-room-puzzle-1': '2022-11-29',
      'ac-valhalla-the-hidden-1': '2023-01-25', 'ac-forgotten-temple-1': '2023-04-25',
      'ac-the-golden-city-1': '2023-05-02', 'ac-the-engine-of-2': '2023-07-04',
      'ac-rl-mirage': '2023-10-05', 'ac-nexus-vr-1': '2023-11-16',
      'ac-mirage-daughter-of-1': '2023-11-21', 'ac-mirage-a-soar-1': '2025-03-12',
      'ac-rl-shadows': '2025-03-20', 'ac-shadows-tales-of-1': '2025-08-20',
      'ac-claws-of-awaji-1': '2025-09-16', 'ac-valley-of-memories-1': '2025-11-18',
      'ac-black-flag-resynced-1': '2026-07-09',
    },
  },
  twd: {
    fichier: '_proto/data-twd-en.js', global: 'DATA_TWD',
    /* Les webséries d'AMC, relevées sur le wiki The Walking Dead : TMDB ne
       connaît pas les trois premières, et range Flight 462 sous la fiche
       de Fear the Walking Dead, dont il prendrait la date de première. */
    dates: {
      'twd-torn-1': '2011-10-03', 'twd-cold-1': '2012-10-01', 'twd-oath-1': '2013-10-01',
      'twd-flight-1': '2015-10-04', 'twd-passage-1': '2016-10-17',
    },
  },
  witcher: {
    fichier: '_proto/data-witcher-en.js', global: 'window.WITCHER',
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
      'wg-w2': '2011-05-17', 'wc-reasons': '2011', 'wv-killing': '2013-08-14',
      'wc-glass': '2014-03-19', 'wc-fox': '2015-04-01', 'wv-night': '2015-05-14',
      'wg-w3': '2015-05-19', 'wc-killing': '2015-05-19', 'wg-hos': '2015-10-13',
      'wc-conscience': '2015-10-13', 'wg-baw': '2016-05-31', 'wc-crows': '2016-08-31',
      'wg-thronebreaker': '2018-10-23', 'wc-flesh': '2018-12-19', 'wc-fading': '2020-11-25',
      'wc-lament': '2021-05-26', 'wc-woods': '2021-08-14', 'wc-grain': '2022-06-22',
      'wc-kiddo': '2022-12-14', 'wc-wolves': '2022-12-21', 'wc-frog': '2023-05-06',
      'wc-wild': '2023-09-20', 'wc-lesser': '2023-12-22', 'wc-corvo': '2024-05-08',
      'wc-edge': '2025-01-21', 'wc-bear': '2025-04-23', 'wc-price': '2025-07-29',
      'wc-witcher': '2025-12-16', 'wc-bloodstone': '2026-01-28', 'wc-lastwish': '2026-08-11',
    },
  },
  startrek: {
    fichier: '_proto/data-startrek-en.js', global: 'DATA_ST',
    /* Tout se date chez TMDB : une saison par son `air_date`, un film par
       sa sortie américaine. Rien à écrire ici. */
    dates: {},
  },
};

const cache = new Map();
async function api(chemin, cle) {
  if (cache.has(chemin)) return cache.get(chemin);
  const r = await fetch('https://api.themoviedb.org/3' + chemin +
    (chemin.includes('?') ? '&' : '?') + 'api_key=' + cle);
  const j = r.ok ? await r.json() : null;
  cache.set(chemin, j);
  return j;
}

/* Le numéro de saison : le champ quand il existe, le premier sous-item
   qui le nomme sinon. Les sous-items de l'entrée de parcours priment —
   c'est là qu'une saison recollée dit laquelle elle est. */
function saisonDe(x, s) {
  if (s.season) return s.season;
  for (const t of [...(x.subitems || []), ...(s.subitems || [])]) {
    /* « Season 9 Episodes 1-5 » aussi : The Walking Dead et Star Trek
       numérotent leurs blocs ainsi, et c'est la saison qui date. */
    const m = /^\s*(?:Saison|Season)\s+(\d+)(?:\s+(?:Épisodes?|Episodes?)\b.*)?\s*$/i.exec(t);
    if (m) return +m[1];
  }
  return null;
}

async function dateDe(x, s, cle) {
  if (!s.tmdb || s.tmdb === '0') return null;
  if (s.media === 'tv') {
    const n = saisonDe(x, s);
    if (n) {
      const sa = await api('/tv/' + s.tmdb + '/season/' + n, cle);
      if (sa && sa.air_date) return sa.air_date;
    }
    const t = await api('/tv/' + s.tmdb, cle);
    return t ? t.first_air_date : null;
  }
  const rd = await api('/movie/' + s.tmdb + '/release_dates', cle);
  const us = rd && (rd.results || []).find(p => p.iso_3166_1 === 'US');
  if (us) {
    const th = us.release_dates.filter(p => [2, 3, 4, 6].includes(p.type))
      .map(p => p.release_date).sort()[0];
    if (th) return th.slice(0, 10);
  }
  const m = await api('/movie/' + s.tmdb, cle);
  return m ? m.release_date : null;
}

let fauxTotal = 0;
const demandes = process.argv.slice(2).filter(a => UNIVERS[a]);
for (const nom of (demandes.length ? demandes : Object.keys(UNIVERS))) {
  const U = UNIVERS[nom];
  const src = fs.readFileSync(U.fichier, 'utf8');
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
      const d = U.dates[id] || await dateDe(x, s, CG.tmdbKey);
      n++;
      if (!d) sans++;
      /* L'année affichée — la première, pour une saison à cheval sur deux
         ans — doit être celle de la date relevée : c'est la
         seule des deux que le visiteur voit, et rien d'autre ne la
         contrôle. */
      const an = d && x.rel && d.slice(0, 4) !== String(x.rel).slice(0, 4);
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
