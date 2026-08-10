# À relire — la version anglaise de la refonte

Ce document ne liste pas la traduction du site : il liste ce qui **n’a pas pu
être repris de l’anglais existant**, et qu’il a donc fallu écrire.

La racine du site est déjà en anglais et `/fr/` en français, tenues à parité.
La refonte ayant extrait ses données du français, l’anglais correspondant était
déjà écrit, relu et en ligne : il a été repris mot pour mot, entrée par entrée,
libellé par libellé. Le reliquat ci-dessous est ce que la direction E a créé et
qui n’existait donc dans aucune des deux versions.

| Repris de l’anglais en ligne | |
|---|---|
| Entrées de timeline | 925 — Star Wars 61, Marvel 121, DC 147, plus leurs fiches |
| Items du Dossier | 596 — 533 entrées et 63 repères écran |
| Libellés d’interface | 109 par page, appariés clé par clé |
| Textes des huit pages | 1 565 appariés, 1 749 identiques dans les deux langues |
| Entrées du journal | 8, appariées par rang dans `whats-new.html` |

**257 phrases ont dû être écrites** : 147 dans les données, 110 dans les pages. Ce sont elles, et
elles seules, qui suivent.

Corrige directement dans les tables `TRADUCTIONS` de `_proto/traduire.mjs`
(données) et `_proto/traduire-pages.mjs` (pages), puis relance les deux
scripts : les fichiers anglais sont régénérés, jamais édités à la main.

---

## 1. Données — l’entrée Marvel sans source anglaise

`Spider-Man: Brand New Day` a été ajouté à la timeline après la dernière mise
à jour de la version anglaise en ligne : sa fiche n’existe qu’en français. Le
titre, lui, vient de `whats-new.html`, où il figure déjà en anglais.

**#mcu-ds1.faq.quand**

> FR — Le film se déroule sur 2016 et 2017, l'entraînement de Stephen Strange à Kamar-Taj s'étalant sur plusieurs mois
> EN — The movie takes place across 2016 and 2017, Stephen Strange's training at Kamar-Taj spanning several months

**#mcu-ds1.faq.postcredits**

> FR — La première scène est un extrait de Thor Ragnarok que vous pouvez passer, la deuxième n'a toujours pas de résolu à ce jour mais vous pouvez la regarder
> EN — The first scene is a clip from Thor: Ragnarok that you can skip; the second still has no resolution to this day, but you can watch it

**#mcu-tb.faq.quand**

> FR — Le film se déroule en 2027
> EN — The movie takes place in 2027

**#mcu-tb.faq.postcredits**

> FR — La première scène est importante, la deuxième est très importante et placée plus loin dans la timeline
> EN — The first scene is important; the second is very important, and placed later in the timeline

**#mcu-smbnd.faq.quand**

> FR — Le film se déroule pendant l'automne 2028 après les évènements de The Punisher : One Last Kill
> EN — The movie takes place in the fall of 2028, after the events of The Punisher: One Last Kill

**#mcu-smbnd.faq.pourquoi**

> FR — Parce que le film se situe ici chronologiquement
> EN — Because this is where the movie falls chronologically

**#mcu-smbnd.faq.postcredits**

> FR — La scène post-crédits est importante.
> EN — The post-credits scene matters.

**#crisis-start.title**

> FR — Plus de retour en arrière
> EN — No turning back

**#crisis-start.note**

> FR — Si vous comptiez regarder le DCEU (au moins jusqu'à Justice League inclus) et les deux origines de Batman et Superman (les éléments Important) faites le avant de continuer l'Arrowverse.
> EN — If you were planning to watch the DCEU (at least up to and including Justice League) and the two Batman and Superman origins (the Important entries), do it before going on with the Arrowverse.

**eras.hint**

> FR — L'Arrowverse post-événement, les Elseworlds issus de l'événement.
> EN — The post-event Arrowverse, the Elseworlds born from the event.

**eras.title**

> FR — ÈRE DE YANGCHEN
> EN — THE YANGCHEN ERA

**#avt-the-dawn-of-yangchen.desc**

> FR — Jeune Avatar hantée par les souvenirs de ses vies antérieures, Yangchen navigue entre diplomatie et complots dans la ville corrompue de Bin-Er.
> EN — A young Avatar haunted by the memories of her past lives, Yangchen navigates diplomacy and conspiracy in the corrupt city of Bin-Er.

**#avt-the-legacy-of-yangchen.desc**

> FR — Yangchen affronte les conséquences de ses choix et un complot qui menace l'équilibre entre les nations.
> EN — Yangchen faces the consequences of her choices, and a plot that threatens the balance between the nations.

**eras.title**

> FR — ÈRE DE KYOSHI
> EN — THE KYOSHI ERA

**#avt-the-rise-of-kyoshi.desc**

> FR — Servante ignorant qu'elle est l'Avatar, Kyoshi fuit après une tragédie et apprend à survivre auprès de hors-la-loi. L'origine brutale de la plus légendaire des Avatars.
> EN — A servant who has no idea she is the Avatar, Kyoshi flees after a tragedy and learns to survive among outlaws. The brutal origin of the most legendary Avatar of them all.

**#avt-the-shadow-of-kyoshi.desc**

> FR — Deux ans plus tard, Kyoshi est convoquée à la Nation du Feu, où une menace venue du Monde des Esprits couve derrière la politique.
> EN — Two years later, Kyoshi is summoned to the Fire Nation, where a threat from the Spirit World is brewing behind the politics.

**eras.title**

> FR — ÈRE DE ROKU
> EN — THE ROKU ERA

**#avt-the-reckoning-of-roku.desc**

> FR — Le jeune Roku accepte une mission secrète du prince Sozin et découvre des agendas cachés sur une île isolée, aux côtés de son nouvel ami Gyatso.
> EN — Young Roku takes on a secret mission from Prince Sozin and uncovers hidden agendas on a remote island, alongside his new friend Gyatso.

**#avt-the-awakening-of-roku.desc**

> FR — Impatient de maîtriser l'État d'Avatar, Roku canalise l'énergie du solstice d'hiver — et déclenche le chaos sur l'Île du Croissant.
> EN — Impatient to master the Avatar State, Roku channels the energy of the winter solstice — and unleashes chaos on Crescent Island.

**eras.title**

> FR — LIVRE 1 : L'EAU
> EN — BOOK ONE : WATER

**eras.group** — 3 emplois

> FR — GUERRE DE CENT ANS
> EN — HUNDRED YEAR WAR

**#avt-s1e01-10.title** — 12 emplois

> FR — Avatar : Le Dernier Maître de l'Air
> EN — Avatar : The Last Airbender

**#avt-s1e01-10.subitems[0]**

> FR — Saison 1 Épisodes 1-10
> EN — Season 1 Episodes 1-10

**#avt-s1e11-16.subitems[0]**

> FR — Saison 1 Épisodes 11-16
> EN — Season 1 Episodes 11-16

**#avt-relics.title**

> FR — Les Aventures Perdues : Reliques
> EN — The Lost Adventures : Relics

**#avt-relics.desc** — 11 emplois

> FR — Histoire courte du recueil Les Aventures Perdues (The Lost Adventures).
> EN — Short story from The Lost Adventures collection.

**#avt-s1e17-20.subitems[0]**

> FR — Saison 1 Épisodes 17-20
> EN — Season 1 Episodes 17-20

**eras.title**

> FR — LIVRE 2 : LA TERRE
> EN — BOOK TWO : EARTH

**#avt-the-kyoshi-warriors-13.desc**

> FR — Suki et les guerrières Kyoshi rejoignent l'armée du Royaume de la Terre.
> EN — Suki and the Kyoshi Warriors join the Earth Kingdom army.

**#avt-s2e01-09.subitems[0]**

> FR — Saison 2 Épisodes 1-9
> EN — Season 2 Episodes 1-9

**#avt-katara-and-the-pirate-s-silver.title**

> FR — Les Héroïnes de la Team Avatar : Katara et l'Argent des Pirates
> EN — Katara and the Pirate's Silver

**#avt-katara-and-the-pirate-s-silver.desc**

> FR — Séparée du groupe après une embuscade, Katara doit s'allier à des pirates pour retrouver ses amis. VF dans le recueil Les Héroïnes de la Team Avatar.
> EN — Separated from the group after an ambush, Katara has to side with pirates to find her friends again.

**#avt-sokka-the-avatar.title**

> FR — Les Aventures Perdues : Sokka l'Avatar
> EN — The Lost Adventures : Sokka the Avatar

**#avt-divided-we-fall.title**

> FR — Les Aventures Perdues : Séparés, Nous Chutons
> EN — The Lost Adventures : Divided We Fall

**#avt-s2e10-20.subitems[0]**

> FR — Saison 2 Épisodes 10-20
> EN — Season 2 Episodes 10-20

**#avt-escape-from-the-spirit-world.desc**

> FR — Histoires animées interactives à regarder gratuitement sur YouTube, pendant le coma d'Aang entre les Livres 2 et 3.
> EN — Interactive animated stories to watch for free on YouTube, set during Aang's coma between Books Two and Three.

**#avt-escape-from-the-spirit-world.link.label**

> FR — Regarder sur YouTube
> EN — Watch on YouTube

**#avt-it-s-only-natural.title**

> FR — Les Aventures Perdues : C'est Bien Naturel
> EN — The Lost Adventures : It's Only Natural

**#avt-going-home-again.title**

> FR — Les Aventures Perdues : Retour à la Maison
> EN — The Lost Adventures : Going Home Again

**#avt-the-bridge.title**

> FR — Les Aventures Perdues : Le Pont
> EN — The Lost Adventures : The Bridge

**eras.title**

> FR — LIVRE 3 : LE FEU
> EN — BOOK THREE : FIRE

**#avt-s3e01-02.subitems[0]**

> FR — Saison 3 Épisodes 1-2
> EN — Season 3 Episodes 1-2

**#avt-private-fire.title**

> FR — Les Aventures Perdues : Soldat Feu
> EN — The Lost Adventures : Private Fire

**#avt-s3e03-06.subitems[0]**

> FR — Saison 3 Épisodes 3-6
> EN — Season 3 Episodes 3-6

**#avt-combustion-man-on-a-train.title**

> FR — Les Aventures Perdues : L'Homme Explosif Dans un Train
> EN — The Lost Adventures : Combustion Man on a Train

**#avt-s3e08-13.subitems[0]**

> FR — Saison 3 Épisodes 8-13
> EN — Season 3 Episodes 8-13

**#avt-dragon-days.title**

> FR — Les Aventures Perdues : L'Epoque des Dragons
> EN — The Lost Adventures : Dragon Days

**#avt-suki-alone.title**

> FR — Les Héroïnes de la Team Avatar : Suki, Seule
> EN — Suki, Alone

**#avt-suki-alone.desc**

> FR — Prisonnière à la Roche Bouillante, Suki organise en secret un jardin — et une rébellion — parmi les détenus. VF dans le recueil Les Héroïnes de la Team Avatar.
> EN — Imprisoned at the Boiling Rock, Suki secretly grows a garden — and a rebellion — among the inmates.

**#avt-love-is-a-battlefield.title**

> FR — Les Aventures Perdues : L'Amour est un Champ de Bataille
> EN — The Lost Adventures : Love Is a Battlefield

**#avt-s3e15-19.subitems[0]**

> FR — Saison 3 Épisodes 15-19
> EN — Season 3 Episodes 15-19

**#avt-bumi-vs-toph-round-one.title**

> FR — Les Aventures Perdues : Bumi contre Toph, Premier Round
> EN — The Lost Adventures : Bumi vs. Toph, Round One

**#avt-s3e20-21.subitems[0]**

> FR — Saison 3 Épisodes 20-21
> EN — Season 3 Episodes 20-21

**eras.title**

> FR — ÈRE DE AANG
> EN — THE AANG ERA

**#avt-avatar-legends-city-of-echoes.desc**

> FR — Roman jeunesse de l'univers Avatar Legends, entre esprits et mystères.
> EN — A young readers novel set in the Avatar Legends universe, between spirits and mysteries.

**#avt-la-promesse-the-promise.title**

> FR — La Promesse 1-3
> EN — The Promise 1-3

**#avt-la-promesse-the-promise.desc**

> FR — Aang et Zuko s'opposent sur le sort des colonies de la Nation du Feu — la naissance douloureuse d'un nouveau monde après la guerre.
> EN — Aang and Zuko clash over the fate of the Fire Nation colonies — the painful birth of a new world after the war.

**#avt-rebound.title**

> FR — Rebond (Free Comic Book Day 2012)
> EN — Rebound (Free Comic Book Day 2012)

**#avt-rebound.desc** — 3 emplois

> FR — Aussi disponible dans le recueil Team Avatar Tales
> EN — Also available in the Team Avatar Tales collection

**#avt-la-recherche-the-search.title**

> FR — La Recherche 1-3
> EN — The Search 1-3

**#avt-la-recherche-the-search.desc**

> FR — Zuko part enfin à la recherche de sa mère Ursa, accompagné d'une Azula imprévisible. La vérité l'attend dans une vallée peuplée d'esprits.
> EN — Zuko finally sets out to find his mother Ursa, with an unpredictable Azula in tow. The truth is waiting for him in a valley full of spirits.

**#avt-smoke-and-shadow-partie-1.title**

> FR — Fumée et Ombre 1
> EN — Smoke and Shadow 1

**#avt-smoke-and-shadow-partie-1.desc**

> FR — Zuko rentre dans une Nation du Feu rongée par la peur : la Société de la Nouvelle Ozai complote et des enfants disparaissent, enlevés par les mystérieux Kemurikage.
> EN — Zuko comes home to a Fire Nation eaten away by fear: the New Ozai Society is plotting and children are disappearing, taken by the mysterious Kemurikage.

**#avt-the-rift.title**

> FR — Le Désaccord 1-3
> EN — The Rift 1-3

**#avt-the-rift.desc**

> FR — Aang veut honorer un festival oublié des Nomades de l'Air, mais découvre une raffinerie sur une terre sacrée — dirigée par le père de Toph.
> EN — Aang sets out to honor a forgotten Air Nomad festival, but finds a refinery on sacred ground — run by Toph's father.

**#avt-smoke-and-shadow-parties-2-3.title**

> FR — Fumée et Ombre 2-3
> EN — Smoke and Shadow 2-3

**#avt-smoke-and-shadow-parties-2-3.desc**

> FR — La traque des Kemurikage s'intensifie — Zuko doit choisir entre la peur et la confiance, tandis qu'Azula tire les ficelles dans l'ombre.
> EN — The hunt for the Kemurikage intensifies — Zuko has to choose between fear and trust, while Azula pulls the strings from the shadows.

**#avt-north-and-south.title**

> FR — Nord et Sud 1-3
> EN — North and South 1-3

**#avt-north-and-south.desc**

> FR — Katara et Sokka rentrent au Pôle Sud et découvrent leur tribu transformée par la modernité — et convoitée par des intérêts étrangers.
> EN — Katara and Sokka return to the South Pole and find their tribe transformed by modernity — and coveted by foreign interests.

**#avt-shells.title**

> FR — Coquillages (Free Comic Book Day 2014)
> EN — Shells (Free Comic Book Day 2014)

**#avt-sisters.title**

> FR — Sœurs (Free Comic Book Day 2013)
> EN — Sisters (Free Comic Book Day 2013)

**#avt-azula-in-the-spirit-temple.title**

> FR — Feu et Trésor Familial : Azula Face au Temple des Esprits
> EN — Azula in the Spirit Temple

**#avt-azula-in-the-spirit-temple.desc**

> FR — Seule et en fuite, Azula arrive dans un temple mystérieux où des esprits la confrontent à ses souvenirs et à ses choix. VF dans le recueil Feu et Trésor Familial.
> EN — Alone and on the run, Azula reaches a mysterious temple where spirits confront her with her memories and her choices.

**#avt-ashes-of-the-academy.title**

> FR — Feu et Trésor Familial : Les Cendres de l'Académie
> EN — Ashes of the Academy

**#avt-ashes-of-the-academy.desc**

> FR — Mai est nommée à la tête de la réforme de l'éducation de la Nation du Feu — entre souvenirs d'Azula et menaces des loyalistes. VF dans le recueil Feu et Trésor Familial.
> EN — Mai is put in charge of reforming Fire Nation education — between memories of Azula and threats from the loyalists.

**#avt-imbalance.title**

> FR — Déséquilibre 1-3
> EN — Imbalance 1-3

**#avt-imbalance.desc**

> FR — À Cranefish Town, Team Avatar affronte une montée des tensions entre maîtres et non-maîtres qui annonce les conflits de l'ère de Korra.
> EN — In Cranefish Town, Team Avatar faces rising tensions between benders and non-benders that foreshadow the conflicts of the Korra era.

**#avt-toph-beifong-s-metalbending-academy.title**

> FR — Les Héroïnes de la Team Avatar : L'Académie de la Maîtrise du Métal de Toph Beifong
> EN — Toph Beifong's Metalbending Academy

**#avt-toph-beifong-s-metalbending-academy.desc**

> FR — Toph a ouvert la première académie de maîtrise du métal, mais ses élèves peinent — et l'inspiration lui manque. VF dans le recueil Les Héroïnes de la Team Avatar.
> EN — Toph has opened the first metalbending academy, but her students are struggling — and she is short on inspiration.

**#avt-the-bounty-hunter-and-the-tea-brewer.title**

> FR — Feu et Trésor Familial : La Chasseuse de Primes et le Maître du Thé
> EN — The Bounty Hunter and the Tea Brewer

**#avt-the-bounty-hunter-and-the-tea-brewer.desc**

> FR — June la chasseuse de primes accepte un contrat qui la mène droit au salon de thé d'Iroh. VF dans le recueil Feu et Trésor Familial.
> EN — June the bounty hunter takes a contract that leads her straight to Iroh's tea shop.

**#avt-aang-the-last-airbender.title**

> FR — Avatar Aang : Le Dernier Maître de l'Air
> EN — Aang : The Last Airbender

**#avt-legacy.desc**

> FR — Livre-objet : Aang transmet souvenirs et reliques à son fils Tenzin.
> EN — An in-universe book: Aang passes his memories and relics on to his son Tenzin.

**eras.title**

> FR — ÈRE DE KORRA
> EN — THE KORRA ERA

**#avt-amies-pour-la-vie-free-comic-book-day-2016.title**

> FR — Amies pour la Vie (Free Comic Book Day 2016)
> EN — Friends for Life (Free Comic Book Day 2016)

**#avt-amies-pour-la-vie-free-comic-book-day-2016.desc** — 2 emplois

> FR — Aussi disponible dans le recueil Patterns in Time
> EN — Also available in the Patterns in Time collection

**#avt-la-legende-de-korra-livre-1-l-air.title**

> FR — La Légende de Korra - Livre 1 : L'Air
> EN — The Legend of Korra - Book One : Air

**#avt-la-legende-de-korra-livre-2-les-esprits.title**

> FR — La Légende de Korra - Livre 2 : Les Esprits
> EN — The Legend of Korra - Book Two : Spirits

**#avt-la-legende-de-korra-livre-3-le-changemen.title**

> FR — La Légende de Korra - Livre 3 : Le Changement
> EN — The Legend of Korra - Book Three : Change

**#avt-la-legende-de-korra-livre-4-l-equilibre.title**

> FR — La Légende de Korra - Livre 4 : L'Équilibre
> EN — The Legend of Korra - Book Four : Balance

**#avt-turf-wars.title**

> FR — Guerres de Territoires 1-3
> EN — Turf Wars 1-3

**#avt-turf-wars.desc**

> FR — Suite directe de la série : Korra et Asami reviennent du Monde des Esprits et affrontent un caïd qui exploite le nouveau portail spirituel.
> EN — A direct sequel to the series: Korra and Asami come back from the Spirit World and take on a crime boss cashing in on the new spirit portal.

**#avt-an-avatar-s-chronicle.desc**

> FR — Livre-objet retraçant le voyage de Korra, annoté de sa main.
> EN — An in-universe book retracing Korra's journey, annotated in her own hand.

**#avt-ruins-of-the-empire.title**

> FR — Les Ruines de l'Empire 1-3
> EN — Ruins of the Empire 1-3

**#avt-ruins-of-the-empire.desc**

> FR — À la veille d'élections historiques dans le Royaume de la Terre, Kuvira peut-elle être rachetée ?
> EN — On the eve of historic elections in the Earth Kingdom, can Kuvira be redeemed?

**#avt-legacy-of-the-fire-nation.desc**

> FR — Livre-objet : Iroh partage souvenirs et sagesse avec Zuko.
> EN — An in-universe book: Iroh shares his memories and his wisdom with Zuko.

**#avt-mystery-of-penquan-island.desc**

> FR — Histoire courte de l'ère Korra.
> EN — A short story from the Korra era.

**Avatar.subtitle**

> FR — Timeline Chronologique
> EN — Chronological Timeline

**Avatar.description**

> FR — Séries animées · Comics · Livres
> EN — Animation · Comics · Books

**Avatar.notes**

> FR — <p class="intro-lead">Si vous êtes ici c'est que vous souhaitez lire et regarder l'univers Avatar Legends dans son ordre le plus optimisé, un mélange d'ordre chronologique et d'ordre de sortie, vous trouverez des détails supplémentaires en cliquant sur chaque média et tout ce site est garanti sans spoil majeur.</p><div class="intro-tags"><span class="itag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Ce guide est plutôt à destination des revisionnages, pour un premier visionnage regardez les séries et films mais si vous êtes persuadés d'aimer l'univers vous pouvez tout à fait suivre ce guide.</span></div><div class="keys-title">Repères de lecture</div><div class="keys"><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>Le calendrier</div><p>L'an 0 du calendrier est l'année du Génocide des Nomades de l'Air donc BG = Before Genocide / AG = After Genocide.</p></div><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19 2 12l9-7v14zM22 19l-9-7 9-7v14z"/></svg>Les flashback</div><p>Certains événements sont mieux à voir en tant que FLASHBACK pour comprendre et sont donc indiqués comme tel.</p></div><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/></svg>Les romans et comics</div><p>Les romans font majoritairement partie de la collection "Les Chroniques de l'Avatar" et racontent les histoires des Avatars du passé, ils sont loin d'être obligatoires mais ajoute du contexte, lisez des résumés si vous préférez.</p><p>Les comics font parti intégrante de l'oeuvre et continuent certaines intrigues des séries, certains sont très importants et d'autres anecdotiques, tout est indiqué.</p></div></div><details class="cuts"><summary>Ce qui est écarté et pourquoi<span class="n">5 entrées</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="cuts-body"><dl class="cuts-list"><div class="cut"><dt>Les Aventures Perdues</dt><dd>La plupart des histoires ne sont que des sketchs sans développement de personnage ni avancée de l'intrigue, les quelques exceptions sont dans la timeline.</dd></div><div class="cut"><dt>Team Avatar Tales</dt><dd>La plupart des histoires ne sont que des sketchs sans développement de personnage ni avancée de l'intrigue, les quelques exceptions sont dans la timeline.</dd></div><div class="cut"><dt>Les romans pour enfants</dt><dd>Seulement si vous êtes un enfant.</dd></div><div class="cut"><dt>Les histoires du JDR papier</dt><dd>Les manuels du jeu de rôle papier sont une mine d'or en terme de lore mais impossible à caser dans une timeline chronologique.</dd></div><div class="cut"><dt>Le jeu mobile Avatar Générations et les jeux sur Korra</dt><dd>Les serveurs sont hors ligne et/ou les jeux ne sont plus en vente.</dd></div></dl></div></details>
> EN — <p class="intro-lead">If you're here, it's because you want to read and watch the Avatar Legends universe in its most optimized order, a mix of chronological order and release order. You'll find extra details by clicking on each media, and this entire site is guaranteed free of major spoilers.</p><div class="intro-tags"><span class="itag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>This guide is meant mostly for rewatches: for a first watch, go through the shows and movies, but if you're sure you'll love the universe, you can absolutely follow this guide.</span></div><div class="keys-title">How to read this</div><div class="keys"><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>The calendar</div><p>Year 0 of the calendar is the year of the Air Nomad Genocide, so BG = Before Genocide / AG = After Genocide.</p></div><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19 2 12l9-7v14zM22 19l-9-7 9-7v14z"/></svg>Flashbacks</div><p>Some events work better as a FLASHBACK for understanding, and are marked as such.</p></div><div class="key"><div class="key-h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/></svg>The novels and comics</div><p>Most of the novels belong to the "Chronicles of the Avatar" collection and tell the stories of the Avatars of the past. They are far from required, but they add context — read summaries instead if you prefer.</p><p>The comics are an integral part of the work and continue some of the storylines from the shows. Some are very important and others are minor, and it is all marked.</p></div></div><details class="cuts"><summary>What's left out, and why<span class="n">5 entries</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="cuts-body"><dl class="cuts-list"><div class="cut"><dt>The Lost Adventures</dt><dd>Most of the stories are just sketches with no character development and no plot progress; the few exceptions are in the timeline.</dd></div><div class="cut"><dt>Team Avatar Tales</dt><dd>Most of the stories are just sketches with no character development and no plot progress; the few exceptions are in the timeline.</dd></div><div class="cut"><dt>Kids' novels</dt><dd>Only if you are a child.</dd></div><div class="cut"><dt>The tabletop RPG stories</dt><dd>The tabletop role-playing books are a goldmine of lore, but impossible to fit into a chronological timeline.</dd></div><div class="cut"><dt>The mobile game Avatar Generations and the Korra games</dt><dd>The servers are offline and/or the games are no longer on sale.</dd></div></dl></div></details>

**CG.t.resetAvatar**

> FR — Effacer toute ta progression Avatar ? Cette action est définitive.
> EN — Erase all your Avatar progress? This cannot be undone.

**CG.badgeLabels.roman.1**

> FR — LIVRE
> EN — BOOK

**CG.badges.0.label**

> FR — Maître de l'Eau
> EN — Waterbending Master

**CG.badges.0.desc**

> FR — Livre 1 : L'Eau terminé
> EN — Book One : Water completed

**CG.badges.1.label**

> FR — Maître de la Terre
> EN — Earthbending Master

**CG.badges.1.desc**

> FR — Livre 2 : La Terre terminé
> EN — Book Two : Earth completed

**CG.badges.2.label**

> FR — Maître du Feu
> EN — Firebending Master

**CG.badges.2.desc**

> FR — Livre 3 : Le Feu terminé
> EN — Book Three : Fire completed

**CG.badges.3.label**

> FR — Gardien de l'Équilibre
> EN — Keeper of Balance

**CG.badges.3.desc**

> FR — L'ère de Korra terminée
> EN — The Korra Era completed

**CG.badges.4.label**

> FR — Avatar Accompli
> EN — Fully Realized Avatar

**CG.badges.4.desc**

> FR — 100% Avatar complété
> EN — Avatar 100% completed

**CG.resetMsg**

> FR — Réinitialiser la progression Avatar ?
> EN — Reset your Avatar progress?

**Spider-Man : Brand New Day · cta** — 2 emplois

> FR — Voir dans la timeline
> EN — See in the timeline

**Legacy · cta**

> FR — Voir dans le Dossier
> EN — See in the Deep Dive

**Nouveau Dossier : romans & comics Star Wars · cta**

> FR — Ouvrir le Dossier
> EN — Open the Deep Dive

**Nouvelle timeline : Avatar · cta** — 4 emplois

> FR — Ouvrir la timeline
> EN — Open the timeline

---

## 2. Pages — la prose de la direction E

### Communes à toutes les pages

Navigation, pied de page, boutons partagés.

| Français | Anglais |
|---|---|
| . Star Wars, Marvel, DC et Avatar sont des marques de leurs ayants droit respectifs ; Chronologeek est un projet de fan indépendant. | . Star Wars, Marvel, DC and Avatar are trademarks of their respective owners; Chronologeek is an independent fan project. |
| 0 débloqués | 0 unlocked |
| À voir | To watch |
| au total | in total |
| Cochez ce que vous avez vu, votre progression est sauvegardée. | Check off what you've watched — your progress is saved. |
| Commencer | Start |
| Entrées | Entries |
| Ère | Era |
| Fermer le menu | Close menu |
| film complet | full movie |
| Navigation repliée | Collapsed navigation |

### Accueil

| Français | Anglais |
|---|---|
| / 121 vus | / 121 watched |
| / 69 vus | / 69 watched |
| 4 univers · 533 au dossier | 4 universes · 533 in the Deep Dive |
| Bientôt | Soon |
| Chaque univers, dans l'ordre | Every universe, in order |
| Choisis ton | Choose your |
| Chronologeek — Accueil (proto E) | Chronologeek — Home (proto E) |
| Continuer | Continue |
| entrées cochées | entries checked |
| Les Dossiers | The Deep Dives |
| Ouvrir ▸ | Open ▸ |
| Pour aller plus loin dans vos univers préférés : romans, comics, canon étendu et autres choses méritant votre attention | To go further into your favorite universes: novels, comics, expanded canon and other things worth your attention |
| proto : revenir à zéro | proto: back to zero |
| proto : simuler une progression | proto: simulate progress |
| Quatre chronologies tenues à jour, en français et en anglais. | Four timelines kept up to date, in French and English. |
| Reprendre ▸ | Resume ▸ |
| Sélection de l'univers | Universe selection |
| Sélectionner | Select |
| univers | universe |

### Star Wars

| Français | Anglais |
|---|---|
| 294 h | 294 h |
| Chronologeek — Star Wars (proto E) | Chronologeek — Star Wars (proto E) |

### Marvel

| Français | Anglais |
|---|---|
| 121 / 121 affichées | 121 / 121 shown |
| 294 h | 294 h |
| 489 h | 489 h |
| Chronologeek — Marvel (proto E) | Chronologeek — Marvel (proto E) |
| Films · Séries · Spider-Verse · Fox — tout le multivers dans son ordre le plus optimisé. | Movies · Shows · Spider-Verse · Fox — the whole multiverse in its most optimized order. |

### DC

| Français | Anglais |
|---|---|
| 932 h | 932 h |
| Ces histoires servent à introduire les origines des plus grands héros DC ainsi que les enjeux des différents univers, connectés ou non. Il n'est pas conseillé de regarder les colonnes les unes à la suite des autres mais plutôt en parallèle. Assurez-vous d'avoir regardé les éléments notés Important que vous voulez voir avant la bannière « Plus de retour en arrière » plus bas. | These stories introduce the origins of DC’s greatest heroes, and what is at stake in each universe, connected or not. Watching the columns one after another is not advised — read them in parallel. Make sure you have watched the entries marked Important that you want to see before the “No turning back” banner further down. |
| Choisir une branche | Choose a branch |
| Chronologeek — DC (proto E) | Chronologeek — DC (proto E) |
| Faites glisser pour voir les autres branches | Swipe to see the other branches |
| Guide du Multivers | Multiverse Guide |
| L'Arrowverse post-événement, les Elseworlds issus de l'événement. | The post-event Arrowverse, the Elseworlds born from the event. |
| Les origines | The origins |

### Dossiers

| Français | Anglais |
|---|---|
| / 533 lus | / 533 read |
| 1 dossier ouvert · 63 repères écran | 1 Deep Dive open · 63 on-screen markers |
| 533 entrées · 7 ères · à jour · juillet 2026 | 533 entries · 7 eras · up to date · July 2026 |
| Bientôt | Soon |
| Chronologeek — Dossiers (proto E) | Chronologeek — Deep Dives (proto E) |
| Continuer | Continue |
| D'autres Dossiers | More Deep Dives |
| Dans le Dossier Star Wars | In the Star Wars Deep Dive |
| entrées lues | entries read |
| Fictions audio | Audio dramas |
| Les | The |
| Les guides qui vont plus loin que la timeline : ordres de lecture, analyses et parcours thématiques, univers par univers. | The guides that go beyond the timeline: reading orders, analyses and thematic paths, universe by universe. |
| Plus loin que la timeline | Beyond the timeline |
| Pour aller plus loin dans vos univers préférés : romans, comics, canon étendu et autres choses méritant votre attention | To go further into your favorite universes: novels, comics, expanded canon and other things worth your attention |
| proto : revenir à zéro | proto: back to zero |
| proto : simuler une progression | proto: simulate progress |
| Qu'aimeriez vous voir ici ? Des nouveautés arriveront. | What would you like to see here? More is on the way. |
| Repères écran | On-screen markers |
| Reprendre ▸ | Resume ▸ |
| Romans · Romans jeunesse · Comics — l'ordre de lecture complet du canon, replacé entre les films et les séries. | Novels · Young-reader books · Comics — the complete canon reading order, placed among the movies and shows. |
| Romans jeune adulte | Young adult novels |
| Sélection du dossier | Deep Dive selection |
| Sélectionner | Select |
| Star Wars — | Star Wars — |

### Dossier Star Wars

| Français | Anglais |
|---|---|
| À l'écran — où se placent les films et séries. Non comptés dans votre progression. | On screen — where the movies and shows fall. Not counted in your progress. |
| Chronologeek — Dossier Star Wars (proto E) | Chronologeek — Star Wars Deep Dive (proto E) |
| Dossier | Deep Dive |
| entrées ( | entries ( |
| Guerre des Clones | Clone Wars |
| Haute République | High Republic |
| Nouvelle République | New Republic |
| Plus loin que la timeline | Beyond the timeline |
| Premier Ordre | First Order |
| Rébellion | Rebellion |
| repères à l'écran | on-screen markers |
| République | Republic |
| Romans &amp; Comics | Novels &amp; Comics |

### Nouveautés

| Français | Anglais |
|---|---|
| , servi à côté d'elle. | , served next to it. |
| Ajouts | Additions |
| Cette page lit | This page reads |
| changements | changes |
| Chronologeek — Nouveautés (proto E) | Chronologeek — What's New (proto E) |
| dernier · | latest · |
| Dernier ajout | Latest addition |
| Dernière mise à jour · | Last updated · |
| Dossier | Deep Dive |
| Journal du site | Site log |
| Le journal est tenu à la main : une ligne par changement, la plus récente en haut. | The log is kept by hand: one line per change, the most recent on top. |
| Le journal n'a pas pu être chargé. | The log could not be loaded. |
| Le plus récent | Most recent |
| Les mois précédents | Earlier months |
| Nature | Kind |
| Nouveau Dossier | New Deep Dive |
| Nouvelle timeline | New timeline |
| Rien ne correspond. Rallumez les filtres que vous avez éteints. | Nothing matches. Turn the filters you switched off back on. |
| Site | Site |
| Univers | Universe |

### À venir

| Français | Anglais |
|---|---|
| à la racine : servez le dépôt (port 8947), | at the root: serve the repository (port 8947), |
| avant la sortie | until release |
| Ce mois-ci | This month |
| Cette page lit | This page reads |
| Chronologeek — À venir (proto E) | Chronologeek — Upcoming (proto E) |
| Le radar n'a pas pu être chargé. | The radar could not be loaded. |
| Mis à jour chaque jour | Updated every day |
| pas le dossier | not the |
| Prochaine | Next |
| prochaine · | next · |
| Rechercher une sortie | Search a release |
| Rien ne correspond. Essayez une autre orthographe, ou rallumez les filtres que vous avez éteints. | Nothing matches. Try another spelling, or turn the filters you switched off back on. |
| Support | Format |
| Univers | Universe |

---

## 3. Trois décisions qui dépassent la traduction

Elles changent le rendu, pas seulement les mots. À valider ou à trancher.

**Le badge « VO » ne s’affiche pas en anglais.** Il signale qu’une œuvre n’a pas
de version française — information sans objet pour qui lit justement l’anglais.
C’est déjà le choix de la prod : `deep-dives/star-wars.html` ne l’affiche nulle
part, `fr/dossiers/star-wars.html` le pose. La refonte fait pareil.

**Le compte à rebours passe de « J‑8 » à « D‑8 ».** J comme Jour, D comme Day —
et « D‑Day moins N » se dit en anglais. `CG.t.inDays` écrit « in {n} d » sur le
site en ligne, mais c’est une phrase là où la pastille est un signe : elle
casserait le bloc de Big Shoulders 900 qui fait l’effet de la carte.

**Les accords doubles deviennent simples.** « 31 sorties affichées » accorde deux
fois, « 31 releases shown » une seule. Les gabarits concernés sont réécrits en
entier dans `EXPRESSIONS`, sans quoi la page afficherait « 31 releases showns ».

---

## 4. Ce qui reste à faire

- **Avatar** — ni page française ni page anglaise dans la refonte. Le proto
  d’accueil garde son créneau verrouillé, et le journal annonce déjà la timeline.
- **La livraison** — les pages vivent encore dans `_proto/` sous les noms
  `en-*.html`. Les mettre en ligne demande de les renommer et de recâbler les
  liens vers les chemins de prod (`/starwars`, `/fr/starwars`, …).
- **`sync.py`** — il compare `fr/X.html` à `X.html`. Les paires de la refonte
  sont alignées ligne à ligne, donc il saura les vérifier une fois livrées.
