/* Version anglaise de data-news.js — produite par traduire.mjs.
   Chaque titre et chaque phrase vient mot pour mot de whats-new.html,
   apparie par rang dans <ol class="log">. Le journal decoupe
   « <strong>Titre</strong> — la suite » en deux champs : la suite perd
   son tiret et prend la majuscule, des deux cotes de la meme facon.
   Ne pas editer a la main : relancer le script. */
window.CG_NEWS = {
  months: [
    { key:"2026-08", label:"August 2026", items:[
      {"nat":"site","uni":"startrek","kind":"timeline","title":"New timeline: Star Trek","txt":"248 entries, from the 21st to the 43rd century — series, movies, animation and Short Treks in a single thread.","href":"/startrek","cta":"Open the timeline"}
    ]},
    { key:"2026-07", label:"July 2026", items:[
      {"nat":"media","uni":"mcu","kind":"film","title":"Spider-Man: Brand New Day","meta":"2028","txt":"Added to the Marvel timeline, in 2028, right after The Punisher: One Last Kill.","img":"/images/brandnewday.webp","href":"/marvel#mcu-smbnd","cta":"See in the timeline"},
      {"nat":"media","uni":"sw","kind":"roman","title":"Legacy","meta":"34 ABY","vo":true,"txt":"Added to the Star Wars Deep Dive — the new novel, in 34 ABY, just before Pirate's Price.","href":"/deep-dives/star-wars#34-aby-legacy","cta":"See in the Deep Dive"},
      {"nat":"media","uni":"dc","kind":"film","title":"Supergirl (2026)","meta":"2026","txt":"Added to the DC timeline, following the DCU.","img":"https://image.tmdb.org/t/p/w500/4X2YSe8PaYbsBqX3TDmmIU4vOju.jpg","href":"/dc#dcu-supergirl","cta":"See in the timeline"},
      {"nat":"site","uni":"sw","kind":"dossier","title":"New Deep Dive: Star Wars novels & comics","txt":"533 entries in reading order, with 63 on-screen markers to place the movies and shows.","href":"/deep-dives/star-wars","cta":"Open the Deep Dive"},
      {"nat":"site","uni":"avatar","kind":"timeline","title":"New timeline: Avatar","txt":"69 entries, from the Yangchen, Kyoshi and Roku novels all the way to the Korra era. Episodes, comics and novels in chronological order, every medium included.","href":"/avatar","cta":"Open the timeline"}
    ]},
    { key:"2026-06", label:"June 2026", items:[
      {"nat":"site","uni":"dc","kind":"timeline","title":"New timeline: DC Multiverse","txt":"The complete Elseworlds · Arrowverse · DCEU · DCU guide, with the major event kept spoiler-free.","href":"/dc","cta":"Open the timeline"}
    ]},
    { key:"", label:"And before that", items:[
      {"nat":"site","uni":"sw","kind":"timeline","title":"Star Wars timeline","txt":"Movies, shows and games, canon and up to date.","href":"/starwars","cta":"Open the timeline"},
      {"nat":"site","uni":"mcu","kind":"timeline","title":"Marvel — MCU timeline","txt":"The full chronological order, sagas and shows included.","href":"/marvel","cta":"Open the timeline"}
    ]}
  ]
};
