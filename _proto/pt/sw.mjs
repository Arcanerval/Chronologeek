/* Star Wars em português do Brasil, « você ». Les titres restent les
   titres originaux anglais, dans les titres comme dans les phrases. */
import ES from '../es/sw.mjs';
import { memes } from './outils.mjs';

const T = { ...memes(ES) };
for (const s of ['Jedi', 'Empire']) for (let i = 1; i <= 6; i++) T[`Tales of the ${s} — Episode ${i}`] = `Tales of the ${s} — Episódio ${i}`;

export default {
  ...T,
  'Tales of the Underworld — Episode 1': 'Tales of the Underworld — Episódio 1',
  'Tales of the Underworld — Episodes 2-3': 'Tales of the Underworld — Episódios 2-3',

  /* ── page ──────────────────────────────────────────────────────────── */
  'Movies · TV Shows · Animation · Video Games — the whole saga in the order it happened.':
    'Filmes · Séries · Animação · Videogames: a saga inteira na ordem em que aconteceu.',
  'Star Wars line map': 'Mapa da linha Star Wars',
  'End of the Star Wars line ·': 'Fim da linha Star Wars ·',
  'Star Wars line complete': 'Linha Star Wars concluída',

  /* ── descripteur ───────────────────────────────────────────────────── */
  'Movies · TV Shows · Animation · Video Games': 'Filmes · Séries · Animação · Videogames',

  /* ── l'accroche ────────────────────────────────────────────────────── */
  "If you're here, it's because you want to explore the entire Star Wars cinematic universe in its most optimized order, thought through and studied over years. You'll find extra details by clicking on each media, and this entire site is guaranteed free of major spoilers.":
    'Se você está aqui, é porque quer percorrer todo o universo cinematográfico de Star Wars na ordem mais otimizada, pensada e estudada ao longo de anos. Você encontra mais detalhes clicando em cada obra, e o site inteiro é garantidamente livre de grandes spoilers.',
  "If you're still not satisfied after all that, I recommend": 'Se depois de tudo isso você ainda quiser mais, recomendo',
  'the Star Wars comics and novels Deep Dive': 'o Dossiê de quadrinhos e romances de Star Wars',
  'on this same site.': 'deste mesmo site.',
  'This guide follows the order the works came out, from 1977 to today, but you can switch back to a chronological version higher up.':
    'Este guia segue a ordem em que as obras foram lançadas, de 1977 até hoje, mas você pode voltar a uma versão cronológica mais acima.',
  'Year 0 of the calendar is the Battle of Yavin (Star Wars Episode IV), so': 'O ano 0 do calendário é a Batalha de Yavin (Star Wars Episódio IV), então',
  '= Before the Battle of Yavin /': '= antes da Batalha de Yavin (Before the Battle of Yavin) /',
  '= After the Battle of Yavin.': '= depois da Batalha de Yavin (After the Battle of Yavin).',
  'The video games': 'Os videogames',
  'The Clone Wars': 'The Clone Wars',
  "Basically, all Star Wars TV shows, animated or not, are spin-offs of The Clone Wars. It introduces and develops many important characters that come back in later shows, movies and even video games. It's the foundation of the expanded universe and even if I don't mark it as essential, it's the most important thing after the main movies.":
    "Basicamente, todas as séries de Star Wars, animadas ou não, são spin-offs de The Clone Wars. Ela apresenta e desenvolve muitos personagens importantes que voltam em séries, filmes e até videogames posteriores. É a base do universo expandido e, mesmo que eu não a marque como essencial, é o mais importante depois dos filmes principais.",
  "If the video games' stories interest you (all of them are very interesting except Squadrons and Outlaws, which are more forgettable) but you don't want to play them, there's a link in each game's description to watch a summary of the story on YouTube.":
    'Se as histórias dos videogames interessam a você (todas são muito interessantes, menos Squadrons e Outlaws, mais esquecíveis) mas você não quer jogá-los, a descrição de cada jogo tem um link para assistir a um resumo da história no YouTube.',
  'Some media is intentionally left out, and the explanations are below:': 'Algumas obras ficaram de fora de propósito; as explicações estão abaixo:',
  "The show was canceled, so until another media picks up its story, there's no point in watching it.":
    'A série foi cancelada, então, até que outra obra retome a história, não faz sentido assisti-la.',
  'The skipped Clone Wars episodes': 'Os episódios de The Clone Wars que pulamos',
  "They're filler episodes centered on Jar Jar or C-3PO/R2-D2 that add nothing to the story; you'll sometimes get a recap at the start of the next episode.":
    'São episódios de enchimento centrados em Jar Jar ou em C-3PO/R2-D2 que não acrescentam nada à história; às vezes há um resumo no começo do episódio seguinte.',
  'Tales of the Underworld (the Cad Bane episodes)': 'Tales of the Underworld (os episódios de Cad Bane)',
  "Only watch them if you're a true fan of the character, and watch them whenever you want: his youth takes place before Episode I but doesn't add much.":
    'Assista só se você for muito fã do personagem, e quando quiser: a juventude dele se passa antes do Episódio I, mas não acrescenta muito.',
  'A fairly childish animated show, packed with fillers, that adds very little to the saga as a whole.':
    'Uma série animada bem infantil, cheia de enchimento, que acrescenta muito pouco à saga como um todo.',
  "Kids' shows": 'Séries infantis',
  "Only watch them if you're under 10.": 'Assista só se você tiver menos de 10 anos.',
  'Mobile games': 'Jogos de celular',
  'No longer available, no solo campaign, nothing added to the story, not interesting…':
    'Não estão mais disponíveis, sem campanha solo, não acrescentam nada à história, sem interesse…',
  'Comics and novels': 'Quadrinhos e romances',
  'Find them in': 'Você os encontra',
  'the dedicated Deep Dive': 'no Dossiê dedicado',
  '— the timeline here is already long enough.': ': esta cronologia já é longa o bastante.',

  /* ── les ères ──────────────────────────────────────────────────────── */
  'THE REPUBLIC ERA': 'A ERA DA REPÚBLICA',
  'THE CLONE WARS': 'AS GUERRAS CLÔNICAS',
  'THE IMPERIAL ERA': 'A ERA IMPERIAL',
  'THE REBELLION ERA': 'A ERA DA REBELIÃO',
  'THE NEW REPUBLIC ERA': 'A ERA DA NOVA REPÚBLICA',
  'THE FIRST ORDER ERA': 'A ERA DA PRIMEIRA ORDEM',
  'THE ORIGINAL TRILOGY · 1977-1983': 'A TRILOGIA ORIGINAL · 1977-1983',
  'THE PREQUEL ERA · 1999-2014': 'A ERA DAS PREQUELAS · 1999-2014',
  'THE DISNEY TAKEOVER · 2014-2018': 'A CHEGADA DA DISNEY · 2014-2018',
  'THE DISNEY+ ERA · 2019-2026': 'A ERA DISNEY+ · 2019-2026',

  /* ── sous-items ────────────────────────────────────────────────────── */
  'During The Phantom Menace': 'Durante The Phantom Menace',
  'During Revenge of the Sith': 'Durante Revenge of the Sith',
  'During The Clone Wars': 'Durante The Clone Wars',
  'Season 7 Episode 12 (epilogue ~17 BBY)': 'Temporada 7 Episódio 12 (epílogo ~17 BBY)',
  'Episode 1 during Revenge of the Sith': 'Episódio 1 durante Revenge of the Sith',
  'Prologue before Revenge of the Sith; the death of this episode\'s character happens in the novel Dark Disciple (read a summary if you\'re curious)':
    'Prólogo antes de Revenge of the Sith; a morte da personagem deste episódio acontece no romance Dark Disciple (leia um resumo se tiver curiosidade)',
  'Prologue during Revenge of the Sith': 'Prólogo durante Revenge of the Sith',
  'Shorts 1-4 (The Machine in the Ghost, Art Attack, Entanglement, Property of Ezra Bridger)':
    'Curtas 1-4 (The Machine in the Ghost, Art Attack, Entanglement, Property of Ezra Bridger)',
  'Season 2 Episodes 1-9 (Stealth Strike)': 'Temporada 2 Episódios 1-9 (Stealth Strike)',
  'Season 3 Episodes 1-17 (Through Imperial Eyes)': 'Temporada 3 Episódios 1-17 (Through Imperial Eyes)',
  'Stop the series finale at the 42-minute mark if you\'ve never seen Star Wars IV-V-VI. The epilogue takes place later.':
    'Pare o final da série no minuto 42 se você nunca viu Star Wars IV-V-VI. O epílogo se passa mais tarde.',

  /* ── notes et FAQ ──────────────────────────────────────────────────── */
  'The movie takes place in 32 BBY during the age of the Republic': 'O filme se passa em 32 BBY, na época da República',
  'Because the movie lays the foundations of the saga, and you need to see it first for context on the characters':
    'Porque o filme lança as bases da saga, e é preciso vê-lo primeiro para ter o contexto dos personagens',
  'The movie takes place 10 years after Episode I': 'O filme se passa 10 anos depois do Episódio I',
  'Because this is where it falls chronologically': 'Porque é aqui que ele cai cronologicamente',
  'The episode takes place about 30 years before The Phantom Menace': 'O episódio se passa cerca de 30 anos antes de The Phantom Menace',
  "Because it's better to already know the characters and experience this story as a flashback for better understanding":
    'Porque é melhor já conhecer os personagens e viver esta história como um flashback para entendê-la melhor',
  'The episode takes place about 10 years after the previous one': 'O episódio se passa cerca de 10 anos depois do anterior',
  'The episode takes place at the same time as The Phantom Menace': 'O episódio se passa ao mesmo tempo que The Phantom Menace',
  'The episodes grouped below are story arcs, separated by blank lines': 'Os episódios agrupados abaixo são arcos narrativos, separados por linhas em branco',
  'Originally conceived as an anthology series with standalone stories, the show transitioned to a more classic format from season 4 onward and works much better watched in chronological order':
    'Concebida no início como uma série antológica de histórias independentes, ela passou a um formato mais clássico a partir da temporada 4 e funciona muito melhor assistida em ordem cronológica',
  'Because this is where they fall chronologically': 'Porque é aqui que eles caem cronologicamente',
  'The episode is set a few years before The Phantom Menace': 'O episódio se passa alguns anos antes de The Phantom Menace',
  'An extremely important character is introduced in the animated The Clone Wars movie, and this episode serves as their origin story — watch it before or after the movie, as you prefer':
    'Uma personagem importantíssima é apresentada no filme animado The Clone Wars, e este episódio conta a origem dela: assista antes ou depois do filme, como preferir',
  'The movie takes place at the start of the Clone Wars in 22 BBY': 'O filme se passa no início das Guerras Clônicas, em 22 BBY',
  "Because this is the show's chronological order, arc by arc, without the filler episodes":
    'Porque é a ordem cronológica da série, arco por arco, sem os episódios de enchimento',
  'The movie takes place at the end of the Clone Wars in 19 BBY': 'O filme se passa no fim das Guerras Clônicas, em 19 BBY',
  'The episodes take place in parallel with the events of Revenge of the Sith': 'Os episódios se passam em paralelo aos acontecimentos de Revenge of the Sith',
  "Because you'd better have seen the movie first, for obvious spoiler reasons": 'Porque é melhor ter visto o filme antes, por razões óbvias de spoiler',
  'The episode spans several periods during the Clone Wars': 'O episódio abrange vários momentos das Guerras Clônicas',
  "The end of the episode spoils an episode of The Clone Wars, so it's better to watch it afterward":
    'O final do episódio revela um episódio de The Clone Wars, então é melhor assisti-lo depois',
  'The episode takes place in parallel with the events of Revenge of the Sith': 'O episódio se passa em paralelo aos acontecimentos de Revenge of the Sith',
  'Because the episode spoils the movie': 'Porque o episódio revela o filme',
  'The episode takes place shortly after Revenge of the Sith': 'O episódio se passa pouco depois de Revenge of the Sith',
  'Season 1 starts during Revenge of the Sith and continues after the events of the movie':
    'A temporada 1 começa durante Revenge of the Sith e continua depois dos acontecimentos do filme',
  'The show takes place in 18 BBY, after the events of Revenge of the Sith': 'A série se passa em 18 BBY, depois dos acontecimentos de Revenge of the Sith',
  'The episode starts a little before Revenge of the Sith, with the rest probably taking place between 18 and 16 BBY':
    'O episódio começa um pouco antes de Revenge of the Sith, e o resto provavelmente se passa entre 18 e 16 BBY',
  'Because the episode continues the adventures of a character who appears in The Bad Batch':
    'Porque o episódio continua as aventuras de uma personagem que aparece em The Bad Batch',
  'The episodes probably take place between 18 and 16 BBY': 'Os episódios provavelmente se passam entre 18 e 16 BBY',
  'Because the episodes continue the adventures of a character who appears in The Bad Batch':
    'Porque os episódios continuam as aventuras de uma personagem que aparece em The Bad Batch',
  'Season 1 probably takes place shortly after Revenge of the Sith, between 18 and 16 BBY':
    'A temporada 1 provavelmente se passa pouco depois de Revenge of the Sith, entre 18 e 16 BBY',
  "Maul: Shadow Lord is an animated series following Maul's journey after the events of The Clone Wars.":
    'Maul: Shadow Lord é uma série animada que acompanha a trajetória de Maul depois dos acontecimentos de The Clone Wars.',
  'The episode opens during Revenge of the Sith, then unfolds over an undetermined period between 16 and 14 BBY':
    'O episódio começa durante Revenge of the Sith e depois se desenrola em um período indeterminado entre 16 e 14 BBY',
  'The game takes place in 14 BBY, 5 years after Episode III': 'O jogo se passa em 14 BBY, 5 anos depois do Episódio III',
  'Developed by Respawn Entertainment, Jedi: Fallen Order sets its story between the third and fourth entries of the saga. You play as a young Padawan on the run from the Empire and its hunt for the last surviving Jedi — a manhunt led by Darth Vader.':
    'Desenvolvido pela Respawn Entertainment, Jedi: Fallen Order situa sua história entre o terceiro e o quarto capítulos da saga. Você joga como um jovem Padawan em fuga do Império e da caçada aos últimos Jedi sobreviventes, uma perseguição liderada por Darth Vader.',
  'The game takes place in 19-18 BBY, before, during and after Revenge of the Sith':
    'O jogo se passa em 19-18 BBY, antes, durante e depois de Revenge of the Sith',
  'Because it spoils elements from different media before': 'Porque revela elementos de várias obras anteriores',
  'Star Wars Zero Company is a turn-based tactics game developed by Bit Reactor with Respawn Entertainment and Lucasfilm Games. It takes place in the final days of the Clone Wars, where a former Republic officer gathers a squad of fighters from all walks of life.':
    'Star Wars Zero Company é um jogo de tática por turnos desenvolvido pela Bit Reactor com a Respawn Entertainment e a Lucasfilm Games. Ele se passa nos últimos dias das Guerras Clônicas, quando um ex-oficial da República reúne um esquadrão de combatentes de todo tipo.',
  'The movie mostly takes place in 10 BBY': 'O filme se passa principalmente em 10 BBY',
  'The show takes place in 9 BBY': 'A série se passa em 9 BBY',
  "We don't know exactly when the episode takes place, but probably after the Obi-Wan Kenobi series, in the following months or years":
    'Não sabemos exatamente quando o episódio se passa, mas provavelmente depois da série Obi-Wan Kenobi, nos meses ou anos seguintes',
  'Because the episode features a character from Obi-Wan Kenobi and works well as a direct follow-up':
    'Porque o episódio traz uma personagem de Obi-Wan Kenobi e funciona bem como continuação direta',
  'The game takes place 5 years after Fallen Order': 'O jogo se passa 5 anos depois de Fallen Order',
  'Because the game works better after the events of Obi-Wan Kenobi': 'Porque o jogo funciona melhor depois dos acontecimentos de Obi-Wan Kenobi',
  'Star Wars Jedi: Survivor takes place five years after Fallen Order and once again follows the story of Cal Kestis. Now a fully-fledged Jedi, our hero fights to survive on the far edges of the Galaxy. Still accompanied by BD-1, he will face the terrible Galactic Empire once more.':
    'Star Wars Jedi: Survivor se passa cinco anos depois de Fallen Order e volta a acompanhar a história de Cal Kestis. Agora um Jedi completo, nosso herói luta para sobreviver nos confins da Galáxia. Sempre acompanhado de BD-1, ele vai enfrentar mais uma vez o terrível Império Galáctico.',
  "We'll be alternating between an animated show and a live-action show quite a few times. If the big tonal shift between Andor and Rebels really bothers you, watch Rebels first (except the finale's epilogue, as noted below), then Andor. But honestly, trust me — it's worth it narratively":
    'Vamos alternar várias vezes entre uma série animada e uma live-action. Se a grande mudança de tom entre Andor e Rebels incomodar muito você, assista primeiro a Rebels (menos o epílogo do final, como indicado abaixo) e depois a Andor. Mas, sério, confie em mim: vale a pena pela história',
  'The first season takes place in 5 BBY': 'A primeira temporada se passa em 5 BBY',
  "I'm adding episode names because depending on where you watch, some season premieres or finales are grouped into TV movies, which changes the season's episode count and can shift everything":
    'Coloco os nomes dos episódios porque, dependendo de onde você assiste, algumas estreias ou finais de temporada são agrupados em telefilmes, o que muda o número de episódios da temporada e pode bagunçar tudo',
  'The shorts, the first season and the start of season 2 take place between 5 and 4 BBY':
    'Os curtas, a primeira temporada e o começo da temporada 2 se passam entre 5 e 4 BBY',
  'Because the episodes fall here chronologically': 'Porque os episódios caem aqui cronologicamente',
  'The first episodes of the season take place in 4 BBY, one year after season 1, then we jump another year for what follows':
    'Os primeiros episódios da temporada se passam em 4 BBY, um ano depois da temporada 1; depois pulamos mais um ano para o que vem a seguir',
  'The rest of season 2 takes place in 3 BBY, and season 3 takes place in 2 BBY':
    'O resto da temporada 2 se passa em 3 BBY, e a temporada 3, em 2 BBY',
  'The episodes take place one year after the previous ones, in 2 BBY': 'Os episódios se passam um ano depois dos anteriores, em 2 BBY',
  'Because the episodes tell of an event that will be brought to light later in Rebels':
    'Porque os episódios contam um acontecimento que virá à tona mais tarde em Rebels',
  'The episodes take place in 2 BBY, right after Andor': 'Os episódios se passam em 2 BBY, logo depois de Andor',
  'Because episode 18 runs in parallel with episode 9 of Andor': 'Porque o episódio 18 se passa em paralelo ao episódio 9 de Andor',
  'The season takes place in 1 BBY': 'A temporada se passa em 1 BBY',
  'Because although it runs in parallel with the end of Andor, that ending is much better watched right before Rogue One':
    'Porque, embora se passe em paralelo ao final de Andor, esse final é muito melhor assistido logo antes de Rogue One',
  'The season ends one year after the previous episodes, just before Rogue One in 1 BBY':
    'A temporada termina um ano depois dos episódios anteriores, logo antes de Rogue One, em 1 BBY',
  'Because the end of Andor and Rogue One flow perfectly into each other': 'Porque o final de Andor e Rogue One se encaixam perfeitamente',
  'The movie picks up right after the end of Andor and concludes at the start of Episode IV in 1 BBY':
    'O filme começa logo depois do final de Andor e termina no início do Episódio IV, em 1 BBY',
  "The movie takes place between 1 BBY and 0 ABY, making it the calendar's starting point":
    'O filme se passa entre 1 BBY e 0 ABY, o que faz dele o ponto de partida do calendário',
  'The movie takes place 3 years after A New Hope, in 3 ABY': 'O filme se passa 3 anos depois de A New Hope, em 3 ABY',
  'The game takes place during the year separating Episode V from Episode VI, in 3 ABY':
    'O jogo se passa durante o ano que separa o Episódio V do Episódio VI, em 3 ABY',
  'Star Wars Outlaws is a video game developed by Massive Entertainment, published by Ubisoft under the LucasFilm license. It is an open-world adventure set in the Star Wars universe, between The Empire Strikes Back and Return of the Jedi.':
    'Star Wars Outlaws é um videogame desenvolvido pela Massive Entertainment e publicado pela Ubisoft sob licença da Lucasfilm. É uma aventura de mundo aberto ambientada no universo Star Wars, entre The Empire Strikes Back e Return of the Jedi.',
  'The movie takes place 1 year after The Empire Strikes Back, in 4 ABY': 'O filme se passa 1 ano depois de The Empire Strikes Back, em 4 ABY',
  "The game's prologue takes place just before the events of Return of the Jedi": 'O prólogo do jogo se passa logo antes dos acontecimentos de Return of the Jedi',
  "Because even though it serves as the game's introduction and takes place earlier, it's better to play the Prologue then the rest of the missions without pausing to watch a movie":
    'Porque, embora sirva de introdução ao jogo e se passe antes, é melhor jogar o Prólogo e depois o resto das missões sem parar para assistir a um filme',
  "Star Wars Battlefront II is an FPS set in the universe of the hit saga. Take part in ground and aerial battles across the movies' most iconic locations. Join the ranks of the Empire or the Rebellion in frantic multiplayer matches, or dive into a brand-new solo campaign as an Imperial soldier.":
    'Star Wars Battlefront II é um FPS ambientado no universo da famosa saga. Participe de batalhas terrestres e aéreas nos lugares mais icônicos dos filmes. Junte-se às fileiras do Império ou da Rebelião em partidas multijogador frenéticas, ou mergulhe em uma campanha solo inédita como soldado imperial.',
  'The first 6 missions take place right after Return of the Jedi, in 4 ABY': 'As 6 primeiras missões se passam logo depois de Return of the Jedi, em 4 ABY',
  'The prologue takes place during Episode IV, and the rest of the game runs in parallel with the events of Battlefront II':
    'O prólogo se passa durante o Episódio IV, e o resto do jogo em paralelo aos acontecimentos de Battlefront II',
  "Because the 2 games take place at roughly the same time, and Battlefront II's campaign then jumps forward a year — so might as well play this one here":
    'Porque os 2 jogos se passam mais ou menos ao mesmo tempo, e a campanha de Battlefront II depois avança um ano: melhor jogar este aqui',
  "Star Wars: Squadrons is a first-person space combat game. You play as a pilot at the controls of the franchise's most iconic ships. The game takes place after the events of Episode VI, Return of the Jedi. It features a story mode as well as 5v5 multiplayer.":
    'Star Wars: Squadrons é um jogo de combate espacial em primeira pessoa. Você é um piloto no comando das naves mais icônicas da franquia. O jogo se passa depois dos acontecimentos do Episódio VI, Return of the Jedi. Tem um modo história e multijogador 5 contra 5.',
  'The rest of the game takes place one year after the previous missions': 'O resto do jogo se passa um ano depois das missões anteriores',
  'The game takes place in the first years after the fall of the Empire between 5 ABY and 10 ABY':
    'O jogo se passa nos primeiros anos após a queda do Império, entre 5 ABY e 10 ABY',
  "Because it's not tied to any other media but happens after the fall of the Empire so it fits better here":
    'Porque não está ligado a nenhuma outra obra, mas acontece depois da queda do Império, então se encaixa melhor aqui',
  'Star Wars: Galactic Racer is a racing game developed by Fuse Games, a studio founded by former Criterion Games staff, and published by Secret Mode. It takes place in the years following the fall of the Empire and brings speeder and podracer races back across the galaxy.':
    'Star Wars: Galactic Racer é um jogo de corrida desenvolvido pela Fuse Games, um estúdio fundado por ex-integrantes da Criterion Games, e publicado pela Secret Mode. Ele se passa nos anos seguintes à queda do Império e traz de volta as corridas de speeders e de pods por toda a galáxia.',
  'The show takes place in 9 ABY': 'A série se passa em 9 ABY',
  'The episode takes place during The Clone Wars, in 20 BBY': 'O episódio se passa durante The Clone Wars, em 20 BBY',
  "Since this episode's central character is introduced in season 2 episode 5 of The Mandalorian, learning about her past after meeting her helps you understand her better":
    'Como a personagem central deste episódio aparece no episódio 5 da temporada 2 de The Mandalorian, conhecer o passado dela depois de conhecê-la ajuda a entendê-la melhor',
  'The episode probably takes place between season 2 and season 3 of Rebels': 'O episódio provavelmente se passa entre a temporada 2 e a temporada 3 de Rebels',
  'The episode probably takes place at most a few months before the The Mandalorian episode':
    'O episódio provavelmente se passa, no máximo, alguns meses antes do episódio de The Mandalorian',
  'The show takes place in 9 ABY, after season 2 of The Mandalorian': 'A série se passa em 9 ABY, depois da temporada 2 de The Mandalorian',
  "Because this is where it falls chronologically, and 2 episodes are dedicated to the Mandalorian — skip this show and you won't understand what comes next":
    'Porque é aqui que ela cai cronologicamente, e 2 episódios são dedicados ao Mandaloriano: se você pular esta série, não vai entender o que vem depois',
  'The show takes place in 9 ABY and picks up directly after The Book of Boba Fett': 'A série se passa em 9 ABY e continua diretamente depois de The Book of Boba Fett',
  'The movie takes place some time after the end of season 3 — anywhere from several months to two years':
    'O filme se passa algum tempo depois do fim da temporada 3: de alguns meses a dois anos',
  'Because it follows the series and is best watched here': 'Porque continua a série e é melhor assistido aqui',
  'The Rebels epilogue takes place in 9 ABY, during the Ahsoka series': 'O epílogo de Rebels se passa em 9 ABY, durante a série Ahsoka',
  "Because besides spoiling the original trilogy if watched at the end of Rebels, watching it now gets you back up to speed and reminds you of the show's events":
    'Porque, além de revelar a trilogia original se for visto no fim de Rebels, assisti-lo agora atualiza você e relembra os acontecimentos da série',
  'The show takes place right after season 2 of The Mandalorian, in 9 ABY': 'A série se passa logo depois da temporada 2 de The Mandalorian, em 9 ABY',
  'The show probably takes place at the same time as the others from this period, in 9 ABY':
    'A série provavelmente se passa ao mesmo tempo que as outras deste período, em 9 ABY',
  'The movie takes place in 34 ABY': 'O filme se passa em 34 ABY',
  'The mission takes place shortly before Episode VII': 'A missão se passa pouco antes do Episódio VII',
  "Because it's better to first meet the characters in the movie": 'Porque é melhor conhecer primeiro os personagens no filme',
  'The 3 missions take place before, during and after The Force Awakens': 'As 3 missões se passam antes, durante e depois de The Force Awakens',
  "Because it's a good companion to the previous movie and a good introduction to the next one":
    'Porque complementa bem o filme anterior e é uma boa introdução ao seguinte',
  'The movie takes place right after the events of Episode VII, in 34 ABY': 'O filme se passa logo depois dos acontecimentos do Episódio VII, em 34 ABY',
  'The movie takes place one year after The Last Jedi': 'O filme se passa um ano depois de The Last Jedi',
  'Because it covers a fairly long period and fits well here, without any spoilers':
    'Porque abrange um período bem longo e se encaixa bem aqui, sem nenhum spoiler',
  "We're going to alternate between an animated series and a live action one quite a few times; if the very sharp change of tone between Andor and Rebels really bothers you, watch Rebels first, then Andor. But honestly, trust me, it's worth it for the storytelling":
    'Vamos alternar várias vezes entre uma série animada e uma live-action; se a mudança de tom tão brusca entre Andor e Rebels incomodar muito você, assista primeiro a Rebels e depois a Andor. Mas, sério, confie em mim: vale a pena pela história',

  /* ── badges et FAQ ─────────────────────────────────────────────────── */
  'The Republic Era completed': 'Era da República concluída',
  'The original trilogy completed': 'Trilogia original concluída',
  'Jedi Knight': 'Cavaleiro Jedi',
  'The Clone Wars completed': 'Guerras Clônicas concluídas',
  'The prequel trilogy completed': 'Trilogia das prequelas concluída',
  'Jedi on the Run': 'Jedi em fuga',
  'The Imperial Era completed': 'Era Imperial concluída',
  'The Clone Wars years completed': 'Anos de The Clone Wars concluídos',
  'Rebel Jedi': 'Jedi rebelde',
  'The Rebellion Era completed': 'Era da Rebelião concluída',
  'The Disney takeover completed': 'Chegada da Disney concluída',
  'Jedi Survivor': 'Jedi sobrevivente',
  'The New Republic Era completed': 'Era da Nova República concluída',
  'The early Disney+ years completed': 'Primeiros anos do Disney+ concluídos',
  'Last Jedi': 'Último Jedi',
  'The First Order Era completed': 'Era da Primeira Ordem concluída',
  'The Disney+ era completed': 'Era Disney+ concluída',
  'May the Force be with you': 'Que a Força esteja com você',
  'Star Wars 100% completed': 'Star Wars 100% concluído',
  'When does {name} take place in the Star Wars universe?': 'Quando se passa {name} no universo Star Wars?',
};
