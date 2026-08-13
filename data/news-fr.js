/* ═══ LE JOURNAL DE CHRONOLOGEEK ═════════════════════════════════════
   Le contenu de la page Nouveautés, sorti du HTML pour qu'un ajout de
   média soit une ligne à écrire, pas une balise à retrouver.

   TEXTES : repris de fr/nouveautes.html mot pour mot. La prose de Niko
   dit « <strong>Titre</strong> — la suite de la phrase » ; ici le titre
   et la suite sont deux champs, donc la suite reçoit sa majuscule
   initiale et perd le tiret de liaison. C'est la seule retouche, et
   `verif-textes.py` la contrôle : il compare chaque `txt` à la source,
   première lettre remise en minuscule.

   DÉNORMALISÉ VOLONTAIREMENT. Le journal ne va pas chercher le titre ni
   la vignette dans data.js / data-mcu.js / data-dc.js : ce serait 180 Ko
   pour une page de journal, et surtout un journal est un instantané. Si
   une entrée est renommée ou déplacée dans six mois, la ligne du journal
   doit garder ce qu'elle disait ce jour-là.

   nat   "media" un média ajouté à une timeline ou à un Dossier
         "site"  une timeline, un Dossier, une fonctionnalité
   uni   sw | mcu | dc | avatar | startrek, ou "" si le changement ne vise
         pas un univers
   kind  la clé de type, pour le badge et son encre (voir KIND dans la page)
   meta  la date in-universe, telle qu'elle s'affiche dans la timeline
   img   la vignette, au format 16/9 comme les visuels d'entrée des
         timelines — l'image est vue telle qu'elle a été composée. Les
         romans et les comics du Dossier n'en ont pas : la carte reprend
         alors la bannière du Dossier de leur univers (table DOSS dans la
         page), et à défaut pose un aplat dans l'encre du type.
   href  où va la carte. L'ancre de l'entrée pour un média, la page pour
         le reste. "" quand la cible n'existe pas encore dans le proto.
   vo    le média n'est pas disponible en français.
*/
window.CG_NEWS = {
  months: [

    /* Le plus récent en haut : un journal se lit par le début, et la
       vedette du premier écran reprend simplement cette première ligne. */
    { key:"2026-08", label:"Août 2026", items:[

      { nat:"site", uni:"startrek", kind:"timeline",
        title:"Nouvelle timeline : Star Trek",
        txt:"248 entrées, du 21e au 43e siècle — séries, films, animés et "+
            "Short Treks dans un seul fil.",
        href:"/fr/startrek", cta:"Ouvrir la timeline" }

    ]},

    { key:"2026-07", label:"Juillet 2026", items:[

      { nat:"media", uni:"mcu", kind:"film",
        title:"Spider-Man : Brand New Day", meta:"2028",
        txt:"Ajouté à la timeline Marvel, en 2028, juste après "+
            "The Punisher : One Last Kill.",
        img:"/images/brandnewday.webp",
        href:"/fr/marvel#mcu-smbnd", cta:"Voir dans la timeline" },

      { nat:"media", uni:"sw", kind:"roman",
        title:"Legacy", meta:"34 ABY", vo:true,
        txt:"Ajouté au Dossier Star Wars — le nouveau roman, en 34 ABY, "+
            "juste avant Le Prix de la Liberté.",
        href:"/fr/dossiers/star-wars#34-aby-legacy", cta:"Voir dans le Dossier" },

      { nat:"media", uni:"dc", kind:"film",
        title:"Supergirl (2026)", meta:"2026",
        txt:"Ajoutée à la timeline DC, à la suite du DCU.",
        img:"https://image.tmdb.org/t/p/w500/4X2YSe8PaYbsBqX3TDmmIU4vOju.jpg",
        href:"/fr/dc#dcu-supergirl", cta:"Voir dans la timeline" },

      { nat:"site", uni:"sw", kind:"dossier",
        title:"Nouveau Dossier : romans & comics Star Wars",
        txt:"533 entrées dans l'ordre de lecture, avec 63 repères à l'écran "+
            "pour situer les films et les séries.",
        href:"/fr/dossiers/star-wars", cta:"Ouvrir le Dossier" },

      { nat:"site", uni:"avatar", kind:"timeline",
        title:"Nouvelle timeline : Avatar",
        txt:"69 entrées, des romans de Yangchen, Kyoshi et Roku jusqu'à l'ère "+
            "de Korra. Épisodes, comics et romans dans l'ordre chronologique, "+
            "avec la disponibilité VF/VO de chaque média.",
        href:"/fr/avatar", cta:"Ouvrir la timeline" }

    ]},

    { key:"2026-06", label:"Juin 2026", items:[

      { nat:"site", uni:"dc", kind:"timeline",
        title:"Nouvelle timeline : DC Multivers",
        txt:"Le guide complet Elseworlds · Arrowverse · DCEU · DCU, avec "+
            "l'événement majeur sans spoil.",
        href:"/fr/dc", cta:"Ouvrir la timeline" }

    ]},

    /* Le fond du journal : ce qui existait avant qu'on le tienne. Pas de
       mois, donc toujours au bout, et toujours dans le dépliant. */
    { key:"", label:"Et avant ça", items:[

      { nat:"site", uni:"sw", kind:"timeline",
        title:"Timeline Star Wars",
        txt:"Films, séries et jeux, canon et à jour.",
        href:"/fr/starwars", cta:"Ouvrir la timeline" },

      { nat:"site", uni:"mcu", kind:"timeline",
        title:"Timeline Marvel — MCU",
        txt:"L'ordre chronologique intégral, sagas et séries incluses.",
        href:"/fr/marvel", cta:"Ouvrir la timeline" }

    ]}

  ]
};
