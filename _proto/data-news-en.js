/* Version anglaise de data-news.js — produite par traduire.mjs.
   Chaque titre et chaque phrase vient mot pour mot de whats-new.html,
   apparie par rang dans <ol class="log">. Le journal decoupe
   « <strong>Titre</strong> — la suite » en deux champs : la suite perd
   son tiret et prend la majuscule, des deux cotes de la meme facon.
   Ne pas editer a la main : relancer le script. */
window.CG_NEWS = {
  months: [
    { key:"2026-08", label:"August 2026", items:[
      {"nat":"media","uni":"dragonage","kind":"jeu","title":"Dragon Age: The Last Court","meta":"9:41","vo":true,"txt":"Added to the Dragon Age timeline, in 9:41, just after Last Flight.","img":"/images/thelastcourt.webp","href":"en-dragonage.html#da-lastcourt-1","cta":"See in the timeline"},
      {"nat":"media","uni":"avatar","kind":"comic","title":"Masters of the Elements Vol.1 : Off Duty","meta":"290 BG","vo":true,"txt":"Added to the Avatar Legends timeline, in 290 BG, just after The Shadow of Kyoshi.","img":"/images/mastersoftheelements.webp","href":"en-avatar.html#avt-masters-of-the-elements-off-duty","cta":"See in the timeline"},
      {"nat":"site","uni":"assassinscreed","kind":"timeline","title":"New timeline: Assassin’s Creed","txt":"111 entries, from Altaïr to the Animus Hub — the games and their DLC, the novels, the comics and the short films in a single thread.","href":"en-assassinscreed.html","cta":"Open the timeline"},
      {"nat":"site","uni":"dragonage","kind":"timeline","title":"New timeline: Dragon Age","txt":"43 entries, from The Stolen Throne to The Veilguard — the games and their DLC, the books, the comics and the shows in a single thread.","href":"en-dragonage.html","cta":"Open the timeline"},
      {"nat":"media","uni":"dc","kind":"serie","title":"Lanterns","meta":"2016-2026","txt":"Added to the DC timeline, following Supergirl.","img":"https://image.tmdb.org/t/p/w500/mdbWfpbWhvxgG3k5MHpo90UgAUe.jpg","href":"en-dc.html#dcu-lanterns","cta":"See in the timeline"},
      {"nat":"site","uni":"twd","kind":"timeline","title":"New timeline: The Walking Dead","txt":"45 entries, from the Los Angeles outbreak to New York — all seven shows and the eight web series in a single thread.","href":"en-twd.html","cta":"Open the timeline"},
      {"nat":"media","uni":"sw","kind":"comic","title":"The Fall of Kylo Ren 1-5","meta":"34 ABY","vo":true,"txt":"Added to the Star Wars Deep Dive — the comic, in 34 ABY, just after Legacy of Vader.","href":"en-dossier-star-wars.html#34-aby-the-fall-of-kylo-ren-1-5","cta":"See in the Deep Dive"},
      {"nat":"site","uni":"startrek","kind":"timeline","title":"New timeline: Star Trek","txt":"248 entries, from the 21st to the 43rd century — series, movies, animation and Short Treks in a single thread.","href":"en-startrek.html","cta":"Open the timeline"}
    ]},
    { key:"2026-07", label:"July 2026", items:[
      {"nat":"media","uni":"mcu","kind":"film","title":"Spider-Man: Brand New Day","meta":"2028","txt":"Added to the Marvel timeline, in 2028, right after The Punisher: One Last Kill.","img":"/images/brandnewday.webp","href":"en-marvel.html#mcu-smbnd","cta":"See in the timeline"},
      {"nat":"media","uni":"sw","kind":"roman","title":"Legacy","meta":"34 ABY","vo":true,"txt":"Added to the Star Wars Deep Dive — the new novel, in 34 ABY, just before Pirate's Price.","href":"en-dossier-star-wars.html#34-aby-legacy","cta":"See in the Deep Dive"},
      {"nat":"media","uni":"dc","kind":"film","title":"Supergirl (2026)","meta":"2026","txt":"Added to the DC timeline, following the DCU.","img":"https://image.tmdb.org/t/p/w500/4X2YSe8PaYbsBqX3TDmmIU4vOju.jpg","href":"en-dc.html#dcu-supergirl","cta":"See in the timeline"},
      {"nat":"site","uni":"sw","kind":"dossier","title":"New Deep Dive: Star Wars novels & comics","txt":"533 entries in reading order, with 63 on-screen markers to place the movies and shows.","href":"en-dossier-star-wars.html","cta":"Open the Deep Dive"},
      {"nat":"site","uni":"avatar","kind":"timeline","title":"New timeline: Avatar Legends","txt":"69 entries, from the Yangchen, Kyoshi and Roku novels all the way to the Korra era. Episodes, comics and novels in chronological order, every medium included.","href":"en-avatar.html","cta":"Open the timeline"}
    ]},
    { key:"2026-06", label:"June 2026", items:[
      {"nat":"site","uni":"dc","kind":"timeline","title":"New timeline: DC Multiverse","txt":"The complete Elseworlds · Arrowverse · DCEU · DCU guide, with the major event kept spoiler-free.","href":"en-dc.html","cta":"Open the timeline"}
    ]},
    { key:"", label:"And before that", items:[
      {"nat":"site","uni":"sw","kind":"timeline","title":"Star Wars timeline","txt":"Movies, shows and games, canon and up to date.","href":"en-starwars.html","cta":"Open the timeline"},
      {"nat":"site","uni":"mcu","kind":"timeline","title":"Marvel — MCU timeline","txt":"The full chronological order, sagas and shows included.","href":"en-marvel.html","cta":"Open the timeline"}
    ]}
  ]
};
