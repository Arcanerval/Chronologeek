/* Construit `data-borderlands-en.js`, les donnees de la timeline Borderlands,
   depuis le document de Niko « Borderlands.txt ». Les textes affiches en sont
   decoupes mot pour mot : accroche, reperes de lecture, titres, dates, notes
   et raisons d'exclusion. Rien n'y est reformule — ce fichier ne s'edite pas
   a la main, on corrige le script et on le rejoue.

   Quinzieme univers du site, et onzieme page dont la source est anglaise :
   le francais en descend par `traduire-borderlands.mjs`.

   Ce que le document ne donne pas, et qui est donc pose ici :

   - Les quatre eres. Le document est une liste plate de trente-cinq lignes.
     Le decoupage suit les jeux : Welcome to Pandora (le premier jeu, nomme
     par Niko), Handsome Jack (Borderlands 2, Tales from the Borderlands,
     The Pre-Sequel, jusqu'a Commander Lilith — Helios y est rentre a la
     demande de Niko le 16 novembre 2026), Children of the Vault
     (Borderlands 3 et New Tales), puis Kairos (Borderlands 4).
   - Le repere flashback est celui du document, sur Tales from the
     Borderlands Episodes 4-5, avec la note que Niko y a ajoutee le 16
     novembre 2026. The Pre-Sequel n'en porte pas : il est a sa place, c'est
     le jeu qui raconte son histoire en flashback.
   - Les badges.

   Les niveaux sont ceux du document : E = `must`, I = `important`, sans
   marque = `bonus`.

   Les fiches : les jeux et les DLC passent par RAWG, par leur identifiant
   (`RAWG` ci-dessous, releve le 16 novembre 2026) — la recherche par titre
   rendait Q.U.B.E pour Director's Cut et l'Underdome pour Mad Ellie. Six DLC
   ne sont pas au catalogue RAWG : ils pointent sur leur jeu, pour les
   plateformes, et portent leur propre synopsis. Les videos, le roman et le
   comic n'ont pas de fiche : leur synopsis (`desc`) est ecrit ici, court et
   sans divulgacher — rien n'en est recopie.

   Badge VO sur le roman, le comic et les sept videos : aucune edition
   francaise au catalogue de la BnF (releve le 16 novembre 2026), et les
   videos ne sont pas doublees. Les jeux n'en portent pas, comme ceux de
   Resident Evil.

   Pas de table RT : des jeux, un roman et un comic, qui n'ont pas de duree
   qui se compte en heures de visionnage. Meme raison que le Monsterverse. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.dirname(ICI);

/* ── Le lexique commun, repris de Resident Evil ────────────────────────── */
const src = fs.readFileSync(path.join(ICI, 'data-re-en.js'), 'utf8');
const bac = { window: {}, console };
bac.window.window = bac.window;
new Function('window', src)(bac.window);
const T = JSON.parse(JSON.stringify(bac.window.CG.t));

T.nav.borderlands = 'Borderlands';
T.markWatched = 'Mark “{t}” as done';
T.legal3 = 'Star Wars, Marvel, DC, Avatar Legends, Star Trek, The Walking Dead, Dragon Age, ' +
  'Assassin’s Creed, Jurassic World, The Witcher, Resident Evil, Blade Runner, Monsterverse and ' +
  'Borderlands are trademarks of their respective owners; Chronologeek is an independent fan project.';

/* ── L'accroche, decoupee du document ──────────────────────────────────── */
const ic = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/>' +
       '<path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/>' +
        '<path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  flash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/>' +
         '<path d="M3 4v5h5M12 8v5l3 2"/></svg>'
};

/* Ce qui est ecarte : chaque ligne du document coupee a son deux-points,
   ce qui est ecarte en intitule, la raison dessous avec sa majuscule. Ecrire un intitule a soi
   puis la ligne entiere repetait le debut de la ligne (releve par Niko le
   16 novembre 2026). La ligne des DLC n'a pas de deux-points : elle se coupe
   a sa virgule, avant « do them ». */
const ECARTES = [
  ['Borderlands movie', 'Its own universe.'],
  ['Mobile games', 'Not canon and/or not available anymore.'],
  ['Tiny Tina\'s Wonderlands and its sequel comic', 'Revolves around Tina playing a sort of Dungeons & Dragons with other characters, has no incidence on the games story and the "real world" but you can play it after her Borderlands 2 DLC if you really liked the setting.'],
  ['All the DLC that have very little to no story, events, Bounty Packs, Raid Bosses', 'Do them after their main game.'],
  ['The Fall of Fyrestone and Tannis & the Vault comics', 'Retelling of the first game.'],
  ['Origins comic and the three novels about the first game characters', 'Not considered officially canon by Gearbox, could be soft canon.']
];

const ech = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

/* Deux corrections de graphie seulement, la regle anglaise du site : pas
   d'espace devant « ? » ni « ! » (« Actual Era? », « the DLC ones! »). */
const NOTES =
  '<p class="intro-lead">If you’re here it’s because you want to discover or rediscover ' +
  'Borderlands in chronological order. This guide is spoiler free like the others.</p>' +
  '<div class="intro-tags"><span class="itag pc-first">' + ic.check +
  'This guide works for first plays or replays.</span>' +
  '<span class="itag pc-release">' + ic.check +
  'This guide follows the order the works came out, from 2009 to today, but you can switch back to a chronological version higher up.</span></div>' +
  '<div class="keys-title">How to read this</div><div class="keys">' +
  '<div class="key"><div class="key-h">' + ic.cal + 'Calendar</div>' +
  '<p>The official calendar used in Borderlands is never stated: old Facebook pages talked about ' +
  'the year 2854, we see a calendar in a DLC saying 109 AE (After Expansion? Actual Era?) but in ' +
  'another game we learn that a planet has humans on it since at least 1000 years so we can’t have ' +
  'a real date. But we know how much time passes between each games so instead, we’ll go back in ' +
  'time and indicate how long before the last release each other piece of media takes place ' +
  '(XX years ago, written y.a.).</p></div>' +
  /* l'encadre des flashbacks, que Niko avait oublie dans ce document : sa
     phrase, donnee le 16 novembre 2026 */
  '<div class="key"><div class="key-h">' + ic.flash + 'Flashbacks</div>' +
  '<p>Some events work better as a FLASHBACK for understanding, and are marked as such.</p></div>' +
  '<div class="key"><div class="key-h">' + ic.user + 'Character choices</div>' +
  '<p>The 4 (sometimes more with the DLC) Vault Hunters that you can choose from at the beginning ' +
  'of each game are ALL canonically present through the events of the story, even if you play ' +
  'solo, they all participate in the official canon. You will cross over them multiple times so ' +
  'even if you play solo remind yourself of the other characters, some can be VERY important ' +
  'sometimes after (even the DLC ones!).</p></div></div>' +
  '<details class="cuts"><summary>What’s left out and why?<span class="n">' +
  ECARTES.length + ' entries</span>' +
  '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
  '</summary><div class="cuts-body"><dl class="cuts-list">' +
  ECARTES.map(([t, d]) => '<div class="cut"><dt>' + ech(t) + '</dt>' +
    (d ? '<dd>' + ech(d) + '</dd>' : '') + '</div>').join('') +
  '</dl></div></details>';

/* ── Les vignettes : celles de Niko, deposees dans `images/` ─────────────
   Les sept videos prennent la miniature de leur page YouTube. */
const MANQUE = [];
const vignette = (local, id) => {
  if (fs.existsSync(path.join(RACINE, 'images', local))) return '/images/' + local;
  MANQUE.push(id + ' (' + local + ')');
  return undefined;
};

const YT = id => [{ href: 'https://www.youtube.com/watch?v=' + id, label: 'Watch the video' }];

/* ── Les trente-cinq entrees ─────────────────────────────────────────── */
const E = [
  { ere: 0, id: 'bl-bl1', type: 'jeu', level: 'must', media: 'game',
    title: 'Borderlands', date: '18 y.a.', img: 'borderlands1.webp' },
  { ere: 0, id: 'bl-zombieisland', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands: The Zombie Island of Dr. Ned', date: '18 y.a.', img: 'zombieisland.webp' },
  { ere: 0, id: 'bl-underdome', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands: Mad Moxxi\'s Underdome Riot', date: '18 y.a.', img: 'madmoxxisunderdome.webp' },
  { ere: 0, id: 'bl-knoxx', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands: The Secret Armory of General Knoxx', date: '18 y.a.', img: 'secretarmoryofgeneralknoxx.webp' },
  { ere: 0, id: 'bl-claptraprevolution', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands: Claptrap\'s New Robot Revolution', date: '18 y.a.', img: 'claptraprevolution.webp' },

  { ere: 1, id: 'bl-bl2', type: 'jeu', level: 'must', media: 'game',
    title: 'Borderlands 2', date: '13 y.a.', img: 'borderlands2.webp' },
  { ere: 1, id: 'bl-scarlett', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands 2: Captain Scarlett and Her Pirate\'s Booty', date: '13 y.a.', img: 'captainscarlett.webp' },
  { ere: 1, id: 'bl-torgue', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands 2: Mr. Torgue\'s Campaign of Carnage', date: '13 y.a.', img: 'mrtorguecampaign.webp' },
  { ere: 1, id: 'bl-hammerlock', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands 2: Sir Hammerlock\'s Big Game Hunt', date: '13 y.a.', img: 'sirhammerlockbiggamehunt.webp' },
  { ere: 1, id: 'bl-punching', type: 'video', level: 'bonus', lang: 'vo', links: YT('TN0bBiMpHlc'),
    desc: 'A short animated prologue to Tiny Tina’s tabletop game: before the dice start rolling, Brick, Mordecai and Lilith get their characters ready.',
    title: '+5 to Punching: A Bunkers & Badasses Prologue', date: '12 y.a.', img: 'plus5topunching.webp' },
  { ere: 1, id: 'bl-dragonkeep', type: 'dlc', level: 'bonus', media: 'game',
    note: 'During Tales from the Borderlands Episodes 1-3',
    title: 'Borderlands 2: Tiny Tina\'s Assault on Dragon Keep', date: '12 y.a.', img: 'tinytinaassault.webp' },

  { ere: 1, id: 'bl-tales-1', type: 'jeu', level: 'important', media: 'game',
    title: 'Tales from the Borderlands', subitems: ['Episodes 1-3'], date: '12 y.a.', img: 'talesfromtheborderlands.webp' },
  { ere: 1, id: 'bl-presequel', type: 'jeu', level: 'must', media: 'game',
    title: 'Borderlands: The Pre-Sequel', date: '16-12 y.a.', img: 'borderlandsthepresequel.webp' },
  { ere: 1, id: 'bl-claptastic', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands: The Pre-Sequel - Claptastic Voyage', date: '16-12 y.a.', img: 'claptasticvoyage.webp' },
  { ere: 1, id: 'bl-holodome', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands: The Pre-Sequel - The Holodome Onslaught', date: '16-12 y.a.', img: 'holodomeonslaught.webp' },
  { ere: 1, id: 'bl-tales-2', type: 'jeu', level: 'important', media: 'game', tags: ['flashback'],
    note: 'You can play them after The Pre-Sequel\'s intro if you don\'t want to wait many hours before finishing it, it happens at the same time',
    title: 'Tales from the Borderlands', subitems: ['Episodes 4-5'], date: '12 y.a.', img: 'talesfromtheborderlands.webp' },
  { ere: 1, id: 'bl-debtoralive', type: 'roman', level: 'bonus', lang: 'vo',
    desc: 'Fiona and Sasha, the con-artist sisters from Tales from the Borderlands, are back on Pandora with a fortune to spend and a long list of people who would like a piece of it — or of them.',
    title: 'Borderlands: Debt or Alive', date: '12 y.a.', img: 'debtoralive.webp' },
  { ere: 1, id: 'bl-commanderlilith', type: 'dlc', level: 'must', media: 'game',
    title: 'Borderlands 2: Commander Lilith & the Fight for Sanctuary', date: '11 y.a.', img: 'commanderlilith.webp' },

  { ere: 2, id: 'bl-bl3', type: 'jeu', level: 'must', media: 'game',
    title: 'Borderlands 3', date: '6 y.a.', img: 'borderlands3.webp' },
  { ere: 2, id: 'bl-heist', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands 3: Moxxi\'s Heist of the Handsome Jackpot', date: '6 y.a.', img: 'moxxisheist.webp' },
  { ere: 2, id: 'bl-tentacles', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands 3: Guns, Love, and Tentacles', date: '6 y.a.', img: 'gunsloveandtentacles.webp' },
  { ere: 2, id: 'bl-bountyofblood', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands 3: Bounty of Blood', date: '6 y.a.', img: 'bountyofblood.webp' },
  { ere: 2, id: 'bl-psychokrieg', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands 3: Psycho Krieg and the Fantastic Fustercluck', date: '6 y.a.', img: 'psychokrieg.webp' },
  { ere: 2, id: 'bl-directorscut', type: 'dlc', level: 'important', media: 'game',
    title: 'Borderlands 3: Director\'s Cut - Mysteriouslier', date: '6 y.a.', img: 'borderlands3directorscut.webp' },
  { ere: 2, id: 'bl-newtales', type: 'jeu', level: 'bonus', media: 'game',
    title: 'New Tales from the Borderlands', subitems: ['Episodes 1-5'], date: '5 y.a.', img: 'newtalesfromtheborderlands.webp' },
  { ere: 2, id: 'bl-memento', type: 'comic', level: 'bonus', lang: 'vo',
    desc: 'Moxxi sends the Siren Amara after a mysterious keepsake from her past, on a road trip across Pandora that nobody is quite prepared for.',
    title: 'Borderlands: Moxxi\'s Mysterious Memento', date: '~2-4 y.a.', img: 'moxxismysteriousmemento.webp' },

  { ere: 3, id: 'bl-vex', type: 'video', level: 'bonus', lang: 'vo', links: YT('BzgZvUMgtSs'),
    desc: 'An official character short introducing Vex, one of the four new Vault Hunters, before the events of Borderlands 4.',
    title: 'Vex: Purple Friday', date: 'Present day', img: 'vexpurplefriday.webp' },
  { ere: 3, id: 'bl-rafa', type: 'video', level: 'bonus', lang: 'vo', links: YT('REP1cuGbP-8'),
    desc: 'An official character short introducing Rafa, one of the four new Vault Hunters, before the events of Borderlands 4.',
    title: 'Rafa: YOLT', date: 'Present day', img: 'rafayolt.webp' },
  { ere: 3, id: 'bl-amon', type: 'video', level: 'bonus', lang: 'vo', links: YT('s_36fMCjNcI'),
    desc: 'An official character short introducing Amon, one of the four new Vault Hunters, before the events of Borderlands 4.',
    title: 'Amon: Demons', date: 'Present day', img: 'amondemons.webp' },
  { ere: 3, id: 'bl-harlowe', type: 'video', level: 'bonus', lang: 'vo', links: YT('YqtvuH4uV2E'),
    desc: 'An official character short introducing Harlowe, one of the four new Vault Hunters, before the events of Borderlands 4.',
    title: 'Harlowe: Family Reunion', date: 'Present day', img: 'harlowefamilyreunion.webp' },
  { ere: 3, id: 'bl-c4sh', type: 'video', level: 'bonus', lang: 'vo', links: YT('kiMPCYmtjCQ'),
    desc: 'An official character short introducing C4SH, the Vault Hunter of the first Borderlands 4 story pack.',
    title: 'C4SH: High Roller', date: 'Present day', img: 'c4shhighroller.webp' },
  { ere: 3, id: 'bl-loveless', type: 'video', level: 'bonus', lang: 'vo', links: YT('HxeTFR_taZU'),
    desc: 'An official character short introducing Loveless, the Vault Hunter of the second Borderlands 4 story pack.',
    title: 'Loveless: Uncontainable', date: 'Present day', img: 'lovelessuncontainable.webp' },
  { ere: 3, id: 'bl-bl4', type: 'jeu', level: 'must', media: 'game',
    title: 'Borderlands 4', date: 'Present day', img: 'borderlands4.webp' },
  { ere: 3, id: 'bl-madellie', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands 4: Mad Ellie and the Vault of the Damned', date: 'Present day', img: 'madellievaultdamned.webp' },
  { ere: 3, id: 'bl-fl4k', type: 'dlc', level: 'bonus', media: 'game',
    title: 'Borderlands 4: FL4K and the Last Resort', date: 'Present day', img: 'fl4klastresort.webp' }
];
/* Les identifiants RAWG. Les six marques « jeu » sont des DLC absents de
   RAWG : l'identifiant est celui de leur jeu, et le synopsis est le leur. */
const RAWG = {
  'bl-bl1': 4828, 'bl-zombieisland': 39955, 'bl-underdome': 39956, 'bl-knoxx': 40014,
  'bl-claptraprevolution': 40411, 'bl-bl2': 802, 'bl-scarlett': 41704, 'bl-torgue': 41761,
  'bl-hammerlock': 41796, 'bl-dragonkeep': 42186, 'bl-tales-1': 2100, 'bl-presequel': 3543,
  'bl-claptastic': 394411, 'bl-holodome': 394410, 'bl-tales-2': 2100, 'bl-commanderlilith': 336810,
  'bl-bl3': 58617, 'bl-heist': 406954, 'bl-newtales': 836447, 'bl-bl4': 988615,
  /* jeu */ 'bl-tentacles': 58617, 'bl-bountyofblood': 58617, 'bl-psychokrieg': 58617,
  /* jeu */ 'bl-directorscut': 58617, 'bl-madellie': 988615, 'bl-fl4k': 988615,
};
const DESC_DLC = {
  /* les DLC que RAWG connaît sans synopsis */
  'bl-zombieisland': 'Dr. Ned’s experiments have turned the people of Jakobs Cove into zombies, and the Vault Hunters are called in to clean up the mess.',
  'bl-underdome': 'Mad Moxxi opens her arenas: in three Underdomes, the Vault Hunters fight wave after wave of enemies for glory and loot.',
  'bl-knoxx': 'The Vault Hunters set out to raid the secret armory of the Atlas corporation, guarded by General Knoxx and his Crimson Lance.',
  'bl-claptraprevolution': 'A rogue Claptrap leads a robot uprising across Pandora, and the Vault Hunters have to stop the revolution before every Claptrap joins in.',
  'bl-scarlett': 'Captain Scarlett, a pirate queen of the sand seas, recruits the Vault Hunter to find a legendary treasure buried in the desert of Oasis.',
  'bl-torgue': 'Mr. Torgue invites the Vault Hunter to a tournament of explosions and arena fights to crown the greatest badass on Pandora.',
  'bl-hammerlock': 'Sir Hammerlock takes the Vault Hunter hunting in the swamps of Aegrus, where a mad professor has plans of his own.',
  'bl-dragonkeep': 'Tiny Tina runs a game of Bunkers & Badasses for Lilith, Mordecai and Brick: a fantasy adventure straight out of her imagination, with knights, dragons and skeletons.',
  'bl-claptastic': 'The Vault Hunters are digitized and sent inside Claptrap’s mind, a world of glitches and buried memories, to retrieve a program hidden in it.',
  'bl-holodome': 'An arena challenge: the Vault Hunters face wave after wave of enemies in the Holodome, a holographic battle arena.',
  /* les DLC absents de RAWG */
  'bl-tentacles': 'Sir Hammerlock and Wainwright Jakobs are getting married on a frozen planet, but the lodge they picked for the ceremony is haunted by a cult that worships an ancient Vault monster.',
  'bl-bountyofblood': 'A Western on the desert planet Gehenna: the Vault Hunter rides into a frontier town that a ruthless gang, the Devil Riders, is trying to bring to its knees.',
  'bl-psychokrieg': 'The Vault Hunters dive into the fractured mind of Krieg the Psycho to dig up a secret buried deep inside it, fighting his inner demons along the way.',
  'bl-directorscut': 'A new murder-mystery story mission, Mysteriouslier: Horror at Scryer’s Crypt, plus a Vault Card and behind-the-scenes content from the developers.',
  'bl-madellie': 'The first Borderlands 4 story pack: Mad Ellie drags the Vault Hunters into a cosmic-horror Vault, and a new Vault Hunter, C4SH, joins them.',
  'bl-fl4k': 'The second Borderlands 4 story pack: FL4K is back, at the Last Resort, and a new Vault Hunter, Loveless, joins the roster.',
};
for (const e of E) {
  if (e.media === 'game') {
    if (!RAWG[e.id]) throw new Error('Identifiant RAWG absent : ' + e.id);
    e.tmdb = String(RAWG[e.id]);
  }
  if (DESC_DLC[e.id]) e.desc = DESC_DLC[e.id];
  e.img = vignette(e.img, e.id);
  if (!e.img) delete e.img;
}

/* Les images de station : celles de Niko. */
const ERES = [
  { title: 'Welcome to Pandora', phase: 'ERA 1', ink: 1, art: '/images/welcometopandoraera.webp' },
  { title: 'Handsome Jack', phase: 'ERA 2', ink: 2, art: '/images/handsomejackera.webp' },
  { title: 'Children of the Vault', phase: 'ERA 3', ink: 3, art: '/images/childrenofthevaultera.webp' },
  { title: 'Kairos', phase: 'ERA 4', ink: 4, art: '/images/kairosera.webp' }
];

/* ── L'ordre de sortie ─────────────────────────────────────────────────
   Les œuvres entières dans l'ordre où elles sont sorties. Quatre ères de
   production, une par jeu numéroté. Les dates complètes sont dans
   `ordre-sortie.mjs`. La note de Dragon Keep ne parle que de son placement
   chronologique : elle tombe. */
const SORTIE = [
  { title: 'Borderlands · 2009-2010', phase: 'ERA 1', ink: 1, art: ERES[0].art, ids: [
    ['bl-bl1', '2009'], ['bl-zombieisland', '2009'], ['bl-underdome', '2009'],
    ['bl-knoxx', '2010'], ['bl-claptraprevolution', '2010']] },
  { title: 'Borderlands 2 · 2012-2015', phase: 'ERA 2', ink: 2, art: ERES[1].art, ids: [
    ['bl-bl2', '2012'], ['bl-scarlett', '2012'], ['bl-torgue', '2012'], ['bl-hammerlock', '2013'],
    ['bl-dragonkeep', '2013', ['note']], ['bl-punching', '2014'], ['bl-presequel', '2014'],
    ['bl-tales-1', '2014'], ['bl-holodome', '2014'], ['bl-claptastic', '2015'], ['bl-tales-2', '2015', ['note']]] },
  { title: 'Borderlands 3 · 2019-2022', phase: 'ERA 3', ink: 3, art: ERES[2].art, ids: [
    ['bl-commanderlilith', '2019'], ['bl-bl3', '2019'], ['bl-heist', '2019'], ['bl-tentacles', '2020'],
    ['bl-bountyofblood', '2020'], ['bl-psychokrieg', '2020'], ['bl-directorscut', '2021'],
    ['bl-newtales', '2022']] },
  { title: 'Borderlands 4 · 2024-2026', phase: 'ERA 4', ink: 4, art: ERES[3].art, ids: [
    ['bl-debtoralive', '2024'], ['bl-memento', '2024'], ['bl-vex', '2025'], ['bl-rafa', '2025'],
    ['bl-amon', '2025'], ['bl-harlowe', '2025'], ['bl-bl4', '2025'], ['bl-c4sh', '2026'],
    ['bl-madellie', '2026'], ['bl-loveless', '2026'], ['bl-fl4k', '2026']] }
];

const DLC = E.filter(e => e.type === 'dlc').map(e => e.id);

const BADGES = [
  { id: 'bl_vault', universe: 'bl', icon: '🗝️', color: '#e0a83a', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 0).map(e => e.id),
    label: 'Vault Hunter', desc: 'Welcome to Pandora completed' },
  { id: 'bl_jack', universe: 'bl', icon: '😎', color: '#f0c97c', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 1).map(e => e.id),
    label: 'Sanctuary Citizen', desc: 'Handsome Jack completed' },
  { id: 'bl_cov', universe: 'bl', icon: '🎯', color: '#e05b5b', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 2).map(e => e.id),
    label: 'Crimson Raider', desc: 'Children of the Vault completed' },
  { id: 'bl_kairos', universe: 'bl', icon: '🪐', color: '#a35be0', trigger: 'oeuvre',
    ids: E.filter(e => e.ere === 3).map(e => e.id),
    label: 'Kairos Breakout', desc: 'Kairos completed' },
  { id: 'bl_dlc', universe: 'bl', icon: '🎟️', color: '#ffb74d', trigger: 'oeuvre',
    ids: DLC,
    label: 'Season Pass', desc: 'Every DLC played' },
  { id: 'bl_100', universe: 'bl', icon: '🤖', color: '#ffe600', trigger: '100pct', ids: [],
    label: 'Claptrap’s Best Friend', desc: 'Borderlands 100% completed' }
];

/* ── Sortie ──────────────────────────────────────────────────────────── */
const CG = {
  t: T,
  universe: 'bl',
  badgeLabels: {
    jeu: ['bj', 'VIDEO GAME'], dlc: ['bd', 'DLC'], video: ['bv', 'VIDEO'],
    roman: ['br', 'BOOK'], comic: ['bc', 'COMIC']
  },
  markLabels: { flashback: 'FLASHBACK' },
  badges: BADGES,
  resetMsg: 'Reset your Borderlands progress?',
  tmdbLang: 'en-US',
  tmdbKey: bac.window.CG.tmdbKey,
  rawgKey: bac.window.CG.rawgKey,
  img: 'https://image.tmdb.org/t/p/'
};

const DATA = {
  id: 'bl',
  title: 'Borderlands',
  subtitle: 'Complete canon timeline',
  description: 'Games · DLC · Videos · Book · Comic',
  /* le jaune citron du logo des jeux, demandé par Niko. Plus froid et plus
     saturé que le jaune de DC (#f5c842), qui tire vers l'or. */
  color: '#ffe600',
  glow: 'rgba(255,230,0,.35)',
  notes: NOTES,
  eras: ERES.map((er, i) => ({
    title: er.title, phase: er.phase, ink: er.ink, art: er.art,
    entries: E.filter(e => e.ere === i).map(({ ere, ...reste }) => reste)
  })),
  erasRelease: SORTIE.map(({ ids, ...er }) => ({
    ...er,
    entries: ids.map(([a, rel, drop]) => {
      const x = { ref: a };
      const e = E.find(y => y.id === a);
      if (!e) throw new Error('Ordre de sortie : entree inconnue ' + a);
      x.rel = rel;
      const d = [...(drop || [])];
      if ((e.tags || []).includes('flashback')) d.push('tags');
      if (d.length) x.drop = d;
      return x;
    })
  }))
};
{
  const places = DATA.erasRelease.flatMap(er => er.entries.map(e => e.ref));
  const oubli = E.filter(e => !places.includes(e.id)).map(e => e.id);
  if (oubli.length) throw new Error('Absentes de l\'ordre de sortie : ' + oubli.join(', '));
  if (new Set(places).size !== places.length) throw new Error('Ordre de sortie : entree en double');
}

for (const er of DATA.eras) {
  if (!er.entries.length) throw new Error('Ere vide : ' + er.title);
}
const vus = new Set();
for (const e of E) {
  if (vus.has(e.id)) throw new Error('Identifiant en double : ' + e.id);
  vus.add(e.id);
  if (!CG.badgeLabels[e.type]) throw new Error('Type inconnu : ' + e.type + ' (' + e.id + ')');
}
for (const b of BADGES) {
  for (const id of b.ids) {
    if (!vus.has(id)) throw new Error('Badge ' + b.id + ' : entree inconnue ' + id);
  }
}

const ENTETE = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .split('*/')[0].replace(/^\/\* Construit `data-borderlands-en\.js`, les/, '/* Donnees de la');

const sortie = ENTETE + '*/\n' +
  'window.CG=' + JSON.stringify(CG) + ';\n' +
  'window.BORDERLANDS=' + JSON.stringify(DATA) + ';\n';

fs.writeFileSync(path.join(ICI, 'data-borderlands-en.js'), sortie, 'utf8');
fs.writeFileSync(path.join(ICI, 'sorties', 'borderlands.json'), JSON.stringify(DATA.erasRelease, null, 1) + '\n');
execFileSync('node', [path.join(ICI, 'detailler-sortie.mjs'), 'borderlands'], { stdio: 'inherit' });
console.log('data-borderlands-en.js ecrit : %d entrees, %d eres (%d en ordre de sortie), %d badges, %d Ko',
  E.length, DATA.eras.length, DATA.erasRelease.length, BADGES.length, Math.round(sortie.length / 1024));
console.log('  niveaux : %s',
  ['must', 'important', 'bonus'].map(l => l + ' ' + E.filter(e => e.level === l).length).join(' · '));
console.log('  types   : %s',
  Object.keys(CG.badgeLabels).map(t => t + ' ' + E.filter(e => e.type === t).length).join(' · '));
if (MANQUE.length) console.log('  sans vignette (%d) : %s', MANQUE.length, MANQUE.join(', '));
