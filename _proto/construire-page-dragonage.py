# Genere _proto/en-dragonage.html a partir de _proto/en-avatar.html.
#
# La page d'Avatar Legends est le seul gabarit du site qui porte deja tout
# ce dont Dragon Age a besoin : la branche RAWG des jeux, le volet FAQ, le
# bouton de lien externe, le repere FLASHBACK, les livres et les comics, et
# le compte en entrees plutot qu'en heures — un guide de jeux video n'a pas
# de duree a sommer, comme Avatar n'en a pas.
#
#   py _proto/construire-page-dragonage.py
#
# Le script ne fait que des remplacements exacts, et il sort en erreur des
# qu'un motif ne se trouve plus. C'est le seul garde-fou qui vaille : une
# substitution qui rate en silence laisse une page qui s'affiche et qui est
# fausse — le mode de defaillance propre a ce depot.
#
# `en-dragonage.html` est la SOURCE, comme `en-startrek.html` et
# `en-twd.html` : le francais en descendra. Il ne faut donc PAS inscrire
# Dragon Age dans `PAGES` de `traduire-pages.mjs`.
import io, os, re, sys

SRC = '_proto/en-avatar.html'
OUT = '_proto/en-dragonage.html'
h = io.open(SRC, encoding='utf-8', newline='').read()

# Les protos sont en CRLF — sauf `en-startrek.html`. Les motifs sont ecrits
# ici avec des sauts simples : on les remet au format du fichier avant de
# chercher, sinon aucun motif multiligne ne se trouve. C'est le piege que
# `publier.mjs` documente deja.
EOL = '\r\n' if '\r\n' in h else '\n'
def _n(s):
    return s.replace('\r\n', '\n').replace('\n', EOL)

R = []           # (avant, apres, pourquoi)
def rem(avant, apres, pourquoi, n=1):
    R.append((_n(avant), _n(apres), pourquoi, n))

# ── identite ─────────────────────────────────────────────────────────────
rem('<title>Chronologeek — Avatar Legends (proto E)</title>',
    '<title>Chronologeek — Dragon Age (proto E)</title>', 'titre')
rem('<link rel="preload" as="image" href="/images/avatar.webp"/>',
    '<link rel="preload" as="image" href="/images/dragonage.webp"/>',
    'preload de la banniere')
rem('background-image:url(/images/avatar.webp)}',
    'background-image:url(/images/dragonage.webp)}', 'banniere')

# ── couleurs ─────────────────────────────────────────────────────────────
rem('  --uni:#7dd3fc;',
    '  --uni:#e07b39;', 'encre de l\'univers')
rem('''  /* huit encres d'ère : la page se noie dedans, une région à la fois.
     Elles suivent les nations — l'air d'abord, puis la terre, le feu, et
     les trois Livres qui reprennent chacun l'élément de son titre. */
  --era1:#8a6a12; --era2:#2d6a3f; --era3:#a8331b; --era4:#134a72;
  --era5:#4a6b1f; --era6:#8f3b1e; --era7:#0f6d63; --era8:#5c2060;''',
    '''  /* cinq encres d'ère, une par phase. Le document de Niko n'a pas de
     phases — c'est une liste continue de 43 entrées — et les cinq titres
     viennent de `construire-dragonage.py`, pas de sa prose. Les teintes
     suivent le récit : le sang du Cinquième Fléau, l'ocre de Kirkwall, le
     vin de la guerre mages-templiers, le bleu-vert de l'Inquisition et le
     violet du Loup Terrible. */
  --era1:#7a2222; --era2:#7a5a16; --era3:#5c2233;
  --era4:#14515c; --era5:#4a3566;''',
    'palette des ères')
rem('''  /* badges de type, charte du site */
  --t-filmanim:#90caf9; --t-anime:#ce93d8; --t-video:#f472b6;
  --t-roman:#a99cf9; --t-comic:#ffb74d;''',
    '''  /* badges de type, charte du site. Dragon Age est le premier guide à
     porter les huit formes à la fois — le DLC prend la teinte claire du
     jeu, comme le film d'animation prend celle du film ; le comic quitte
     l'orange qu'il a sur Avatar, où il n'avait pas de jeu à côté de lui. */
  --t-jeu:#ffb74d; --t-dlc:#ffcc80; --t-roman:#a99cf9; --t-comic:#4dd0e1;
  --t-video:#f472b6; --t-web:#ffa726; --t-filmanim:#90caf9; --t-anime:#ce93d8;
  /* le seul repère du guide */
  --m-flashback:#f0c97c;''',
    'badges de type')
# Le repère prend son encre comme sur The Walking Dead : `--k` d'abord, l'or
# à défaut. Sans ça FLASHBACK sort de la même couleur que l'accent.
rem('''.ft{font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;
  padding:2px 8px;color:var(--hot);border:1px solid var(--hot)}''',
    '''.ft{font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;
  padding:2px 8px;color:var(--k,var(--hot));border:1px solid var(--k,var(--hot))}''',
    'encre du repère')
# Le fond du volet de FAQ était figé sur le bleu de Star Wars, d'où il vient.
rem('.faq{border-left:3px solid var(--uni);background:rgba(77,159,255,.07)}',
    '.faq{border-left:3px solid var(--uni);'
    'background:color-mix(in srgb,var(--uni) 7%,transparent)}',
    'fond du volet de FAQ')

# ── navigation ───────────────────────────────────────────────────────────
rem('<div class="more-pop"><a href="#" aria-current="page">Avatar Legends</a>'
    '<a href="en-startrek.html">Star Trek</a>'
    '<a href="en-twd.html">The Walking Dead</a></div>',
    '<div class="more-pop"><a href="en-avatar.html">Avatar Legends</a>'
    '<a href="en-startrek.html">Star Trek</a>'
    '<a href="en-twd.html">The Walking Dead</a>'
    '<a href="#" aria-current="page">Dragon Age</a></div>',
    'déroulant « More universes »')
rem('href="e-avatar.html" aria-label="Passer en français"',
    'href="e-dragonage.html" aria-label="Passer en français"', 'bouton de langue')
rem('<a href="#" class="u-av" aria-current="page"><i aria-hidden="true"></i>Avatar Legends</a>',
    '<a href="en-avatar.html" class="u-av"><i aria-hidden="true"></i>Avatar Legends</a>',
    'tiroir : Avatar redevient un lien')
rem('<a href="en-twd.html" class="u-twd"><i aria-hidden="true"></i>The Walking Dead</a></div>',
    '<a href="en-twd.html" class="u-twd"><i aria-hidden="true"></i>The Walking Dead</a>'
    '<a href="#" class="u-da" aria-current="page"><i aria-hidden="true"></i>Dragon Age</a></div>',
    'tiroir : Dragon Age')
rem('.u-twd{--k:#a8bf4f}', '.u-twd{--k:#a8bf4f}.u-da{--k:#e07b39}',
    'pastille du tiroir')

# ── pied de page ─────────────────────────────────────────────────────────
rem('<li><a href="#" aria-current="page">Avatar Legends</a></li>'
    '<li><a href="en-startrek.html">Star Trek</a></li>'
    '<li><a href="en-twd.html">The Walking Dead</a></li>',
    '<li><a href="en-avatar.html">Avatar Legends</a></li>'
    '<li><a href="en-startrek.html">Star Trek</a></li>'
    '<li><a href="en-twd.html">The Walking Dead</a></li>'
    '<li><a href="#" aria-current="page">Dragon Age</a></li>',
    'liste « Timelines » du pied')
rem('Star Wars, Marvel, DC, Avatar Legends, Star Trek',
    'Star Wars, Marvel, DC, Avatar Legends, Star Trek, Dragon Age',
    'mention légale', n=None)

# ── le bouton « remonter en haut » ───────────────────────────────────────
# Placeholder assumé : les six autres univers ont deux WebP locaux, posés
# par Niko (Grogu, Miss Minutes, Appa, le bat-signal, le delta Starfleet,
# Rick Grimes). Dragon Age attend les siens ; d'ici là l'affiche TMDB
# d'Absolution tient la place, et le survol ne change rien.
rem('<span><img class="nl" src="/images/appa1.webp" alt=""/>'
    '<img class="hv" src="/images/appa2.webp" alt=""/></span>',
    '<!-- PLACEHOLDER : en attente des deux WebP de Niko, comme twd1/twd2. -->\n'
    '  <span><img class="nl" src="https://image.tmdb.org/t/p/w300/uw5N97cCH78ZQyx4OSV4qNVzZJ.jpg" alt=""/>'
    '<img class="hv" src="https://image.tmdb.org/t/p/w300/uw5N97cCH78ZQyx4OSV4qNVzZJ.jpg" alt=""/></span>',
    'bouton « remonter en haut »')

# ── le hero ──────────────────────────────────────────────────────────────
rem('''    <span class="tag">Chronological Timeline</span>
    <h1 class="disp off">Avatar Legends</h1>
    <p class="dek">Animation · Comics · Books — the whole Avatar Legends universe in its most optimized order.
      <b>Check off what you've watched — your progress is saved.</b></p>
    <p class="upd"><i aria-hidden="true"></i> Updated · july 2026</p>
    <!-- Pas de case « À voir » : runtime.py n'a pas encore de table RT pour
         Avatar, et une case qui annonce « 0 h » ment plus qu'elle n'informe. -->
    <div class="stats">
      <div class="s"><b>2</b><span>Animated series</span></div>
      <div class="s"><b>1</b><span>Animated movie</span></div>
      <div class="s"><b>41</b><span>Comics</span></div>
      <div class="s"><b>10</b><span>Books</span></div>
      <div class="s"><b id="s-tot">69</b><span>Entries</span></div>
    </div>''',
    '''    <span class="tag">Chronological Timeline</span>
    <h1 class="disp off">Dragon Age</h1>
    <p class="dek">Games · DLC · Books · Comics — the whole Dragon Age universe in its most optimized order.
      <b>Check off what you've played — your progress is saved.</b></p>
    <p class="upd"><i aria-hidden="true"></i> Updated · August 2026</p>
    <!-- Pas de case « À voir » : un guide de jeux vidéo n'a pas de durée à
         sommer, et une case qui annonce « 0 h » ment plus qu'elle n'informe.
         Même raison qu'Avatar Legends. -->
    <div class="stats">
      <div class="s"><b>5</b><span>Games</span></div>
      <div class="s"><b>12</b><span>DLC</span></div>
      <div class="s"><b>6</b><span>Books</span></div>
      <div class="s"><b>9</b><span>Comics</span></div>
      <div class="s"><b id="s-tot">43</b><span>Entries</span></div>
    </div>''',
    'hero')

# ── compteurs ────────────────────────────────────────────────────────────
rem('<span class="fcount" id="fcount">69 / 69 shown</span>',
    '<span class="fcount" id="fcount">43 / 43 shown</span>', 'compteur des filtres')
rem('<b><em id="k-on">0</em> / <span id="k-tot">61</span></b>',
    '<b><em id="k-on">0</em> / <span id="k-tot">43</span></b>', 'HUD : total')
rem('<b style="font-size:14px" id="k-left">69</b>',
    '<b style="font-size:14px" id="k-left">43</b>', 'HUD : restant')
rem('<div class="marks"><span>Markers</span><span class="ft">FLASHBACK</span></div>',
    '<div class="marks"><span>Markers</span>'
    '<span class="ft" style="--k:var(--m-flashback)">FLASHBACK</span></div>',
    'légende du repère')

# ── le script ────────────────────────────────────────────────────────────
rem('<script src="data-avatar-en.js"></script>',
    '<script src="data-dragonage-en.js"></script>', 'source des données')
rem('var CFG=window.CG, D=window.AVATAR, RT=window.RT||{};',
    'var CFG=window.CG, D=window.DRAGONAGE, RT=window.RT||{};', 'objet de données')
rem("    resetAvatar:'Reset your Avatar Legends progress?',",
    "    resetDA:CFG.resetMsg,", 'message de remise à zéro')
rem('if(!confirm(T.resetAvatar)) return;', 'if(!confirm(T.resetDA)) return;',
    'appel du message')
rem("var KEY='cg-proto-avatar';", "var KEY='cg-proto-dragonage';", 'clé de stockage')
rem("localStorage.setItem('cg_last',JSON.stringify({u:'avatar'}))",
    "localStorage.setItem('cg_last',JSON.stringify({u:'dragonage'}))", 'dernier univers')
rem("a.download='chronologeek-avatar.json';", "a.download='chronologeek-dragonage.json';",
    'nom du fichier exporté')

# ── la bande d'ère ───────────────────────────────────────────────────────
# Les données de Dragon Age posent `art` sur chaque ère : c'est le visuel
# du jeu qui ouvre la phase, et il vaut mieux que la première vignette,
# qui serait celle d'un DLC ou d'un comic selon l'ordre du document.
rem('''    return (must||era.entries.filter(function(e){ return e.img; })[0]||{}).img
      || '/images/avatar.webp';''',
    '''    return era.art
      || (must||era.entries.filter(function(e){ return e.img; })[0]||{}).img
      || '/images/dragonage.webp';''',
    'visuel de bande')
# Le document numérote des PHASES ; c'est l'intitulé des données qui
# s'affiche, comme sur The Walking Dead.
rem("'<span class=\"chev\">Era '+(i+1)+' / '+D.eras.length+'</span>'+",
    "'<span class=\"chev\">'+esc(era.phase||('Era '+(i+1)))+' / '+D.eras.length+'</span>'+",
    'chevron de bande')

# ── la fiche RAWG : par identifiant, pas par titre ───────────────────────
# La page d'Avatar cherche le jeu par son titre, faute d'identifiant dans
# ses donnees — elle n'a d'ailleurs aucun jeu, la branche vient de Star
# Wars. Sur Dragon Age, la recherche par titre se trompe trois fois : les
# DLC portent des noms nus. « Trespasser » rendait le Jurassic Park de
# 1998, « The Descent » un jeu de 2014, « Legacy » un jeu de 2018. Les
# identifiants RAWG sont dans les donnees : on les demande directement, et
# on ne se rabat sur le titre que pour ce qui n'en a pas.
rem('''      if(!CFG.rawgKey){ fallback(null); return; }
      /* RAWG ne trouve rien si on lui envoie le titre entier : « Outlaws
         + DLC Wild Card + DLC A Pirate's Fortune » ou « Campagne : Missions
         1-6 » ne sont pas des noms de jeux. On coupe aux DLC et au
         sous-titre pour ne chercher que le jeu lui-même. */
      var q=String(e.title).split(/\\s\\+\\s|\\s—\\s/)[0].replace(/\\s*:\\s*(Campagne|Prologue).*$/i,'')
                           .replace(/[:.+]/g,' ').trim();
      fetch('https://api.rawg.io/api/games?search='+encodeURIComponent(q)+
            '&page_size=1&key='+CFG.rawgKey)
        .then(function(r){return r.json();})
        .then(function(d){ fallback(d.results&&d.results[0]); })
        .catch(function(){ fallback(null); });
      return;''',
    '''      if(!CFG.rawgKey){ fallback(null); return; }
      /* L'identifiant RAWG est stocké dans le même champ que celui de TMDB :
         c'est `media` qui dit laquelle des deux API le lit. Une fiche
         demandée par son numéro ne peut pas se tromper de jeu — la
         recherche par titre, elle, rendait Jurassic Park pour
         « Trespasser ». Les DLC qui ne sont pas dans le catalogue RAWG
         n'ont pas d'identifiant : eux repassent par le titre. */
      if(id&&id!=='0'){
        fetch('https://api.rawg.io/api/games/'+encodeURIComponent(id)+'?key='+CFG.rawgKey)
          .then(function(r){return r.json();})
          .then(function(g){ fallback(g&&g.id?g:null); })
          .catch(function(){ fallback(null); });
        return;
      }
      var q=String(e.title).replace(/[:.+]/g,' ').trim();
      fetch('https://api.rawg.io/api/games?search='+encodeURIComponent(q)+
            '&page_size=1&key='+CFG.rawgKey)
        .then(function(r){return r.json();})
        .then(function(d){ fallback(d.results&&d.results[0]); })
        .catch(function(){ fallback(null); });
      return;''',
    'fiche RAWG par identifiant')
# RAWG rend un resume en `description_raw` ; la page d'Avatar ne le lisait
# pas, faute de jeux. Le document de Niko ne decrit aucun des dix-sept
# jeux, et la fiche n'affichait donc que trois mesures.
rem("'<div class=\"expand-info\"><div class=\"expand-synopsis\">'+esc(e.desc||e.note||'')+'</div>'+",
    "'<div class=\"expand-info\"><div class=\"expand-synopsis\">'+"
    "esc(e.desc||e.note||(g&&g.description_raw?String(g.description_raw).split('\\n')[0]:'')||T.noSynopsis)+'</div>'+",
    'synopsis RAWG')

# ── la FAQ ───────────────────────────────────────────────────────────────
# Les trois questions du document changent de verbe selon le média —
# « Why play », « Why read », « Why watch » — et une entrée n'en porte
# qu'une. Sans ce filtre, chaque fiche affichait deux volets vides.
rem('''      $('.en-faq',panel).innerHTML=CFG.faqCats.map(function(c){''',
    '''      $('.en-faq',panel).innerHTML=CFG.faqCats.filter(function(c){
        return e.faq[c.key]; }).map(function(c){''',
    'FAQ : sauter les catégories sans réponse')

# ── application ──────────────────────────────────────────────────────────
manques = []
for avant, apres, pourquoi, n in R:
    c = h.count(avant)
    if c == 0:
        manques.append((pourquoi, avant[:70]))
        continue
    if n is not None and c != n:
        manques.append(('%s — %d occurrence(s), %d attendue(s)' % (pourquoi, c, n),
                        avant[:70]))
        continue
    h = h.replace(avant, apres)

if manques:
    print('MOTIF INTROUVABLE — la page n\'est pas ecrite :')
    for p, a in manques:
        print('  ', p, '->', repr(a))
    sys.exit(1)

# ── garde-fous sur la sortie ─────────────────────────────────────────────
TRACES = ['data-avatar-en.js', 'window.AVATAR', 'cg-proto-avatar',
          'chronologeek-avatar.json', '/images/appa', 'resetAvatar',
          '/images/avatar.webp']
restes = [t for t in TRACES if t in h]
if restes:
    print('TRACE D\'AVATAR DANS LA SORTIE :', ', '.join(restes))
    sys.exit(1)
for t in ('Dragon Age', 'data-dragonage-en.js', 'window.DRAGONAGE', '--t-dlc',
          '--m-flashback', 'u-da'):
    if t not in h:
        print('ABSENT DE LA SORTIE :', t)
        sys.exit(1)

io.open(OUT, 'w', encoding='utf-8', newline='').write(h)
print('%s ecrit, %d remplacement(s), %d Ko' % (OUT, len(R), len(h) // 1024))
