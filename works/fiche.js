/* e-fiche.js — publié en /works/fiche.js, chargé par les 2 400 fiches d'œuvres
   (`oeuvres.mjs`), après /app.js. Posé le 24 novembre 2026, demandé par Niko :
   « montrer où placer Jessica Jones, mais sans Agents of S.H.I.E.L.D. ».

   Deux choses, et rien d'autre :

   · **En bref** — le résumé, l'année, les genres, la note, la création, la
     distribution, la bande-annonce et « Où regarder » d'un film ou d'une série,
     lus chez TMDB à l'ouverture ; pour un jeu, RAWG et « Où jouer ». Rien n'est
     stocké : c'est la règle du radar et des cartes de timeline. Les lignes
     « Où regarder / Où jouer » sont celles d'`e-app.js` (`CG_WT`), jamais une
     copie.
   · **Les filtres de la ligne** — les mêmes que ceux de la timeline : niveaux,
     types, branches (canonicité non confirmée, Defenders, Spider-Verse,
     Fox / X-Men chez Marvel ; les lignes chez DC…) et « Masquer les
     terminés ». Le rail se redessine sans ce qui est masqué : l'arrêt d'avant
     et celui d'après sont ceux qui restent. Le réglage vit dans l'URL
     (`?o=nc&t=serie&n=bonus`) : c'est ce qui permet de le montrer à
     quelqu'un. Seul « Masquer les terminés » n'y entre pas : il dépend de la
     progression de celui qui regarde. Le rail du HTML reste celui de la ligne entière, pour
     les moteurs et sans JS ; il est redessiné à l'identique dès que
     la ligne arrive (`/works/lignes/<route>-<langue>.json`).

   Le texte est dans la langue de la page (`S`), quatre tables écrites ici : ce
   fichier ne passe pas par les chaînes de traduction. */
(function(){
  var nD = document.getElementById('f-data');
  if (!nD) return;
  var D;
  try { D = JSON.parse(nD.textContent); } catch (e) { return; }
  var LANGUE = D.l in { fr: 1, en: 1, es: 1, pt: 1 } ? D.l : 'en';
  var TMDB = '6257b37bf29ab31357853fce00232314', RAWG = 'ddc66eb38db74a77b5f41323db00d434';
  var LOC = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', pt: 'pt-BR' }[LANGUE];

  var S = {
    fr: { hideDone: 'Masquer les terminés', lvNoms: { must: 'Essentiel', important: 'Important', bonus: 'Optionnel' }, typesMedia: 'Types de média', affichees: function(n, N){ return n + ' / ' + N + ' affichées'; },
      annee: 'Année', creation: 'Création', realisation: 'Réalisation', genres: 'Genres', note: 'Note',
      saisons: function(s, e){ return s + ' saison' + (s > 1 ? 's' : '') + (e ? ' · ' + e + ' épisodes' : ''); }, format: 'Format',
      duree: 'Durée', chaine: 'Diffusion', avec: 'Avec', sortie: 'Sortie', dev: 'Développement', editeur: 'Édition',
      metacritic: 'Metacritic', trailer: 'Bande-annonce', trailerJeu: 'Bande-annonce', tmdb: 'Données : TMDB', rawg: 'Données : RAWG',
      enVo: 'EN', niveau: 'Niveau',
      copier: 'Copier le lien de cette vue', copie: 'Lien copié', reafficher: 'Tout réafficher',
      vue: 'Ligne filtrée :', sans: 'sans', masques: 'types masqués :', vus: 'terminés masqués', niveauxMasques: 'niveaux masqués :',
      ici: 'Vous êtes ici', arretDe: function(n, N){ return 'Arrêt ' + n + ' sur ' + N; },
      saut: function(n){ return n + ' arrêt' + (n > 1 ? 's' : '') + ' plus loin'; },
      premier: 'Départ de la ligne', dernier: 'Terminus de la ligne' },
    en: { hideDone: 'Hide completed', lvNoms: { must: 'Essential', important: 'Important', bonus: 'Optional' }, typesMedia: 'Media types', affichees: function(n, N){ return n + ' / ' + N + ' shown'; },
      annee: 'Year', creation: 'Created by', realisation: 'Directed by', genres: 'Genres', note: 'Rating',
      saisons: function(s, e){ return s + ' season' + (s > 1 ? 's' : '') + (e ? ' · ' + e + ' episodes' : ''); }, format: 'Format',
      duree: 'Runtime', chaine: 'Network', avec: 'Starring', sortie: 'Released', dev: 'Developer', editeur: 'Publisher',
      metacritic: 'Metacritic', trailer: 'Trailer', trailerJeu: 'Trailer', tmdb: 'Data: TMDB', rawg: 'Data: RAWG',
      enVo: 'EN', niveau: 'Level',
      copier: 'Copy the link to this view', copie: 'Link copied', reafficher: 'Show everything again',
      vue: 'Filtered line:', sans: 'without', masques: 'hidden types:', vus: 'completed hidden', niveauxMasques: 'hidden levels:',
      ici: 'You are here', arretDe: function(n, N){ return 'Stop ' + n + ' of ' + N; },
      saut: function(n){ return n + ' stop' + (n > 1 ? 's' : '') + ' further'; },
      premier: 'Start of the line', dernier: 'End of the line' },
    es: { hideDone: 'Ocultar lo terminado', lvNoms: { must: 'Esencial', important: 'Importante', bonus: 'Opcional' }, typesMedia: 'Tipos de medio', affichees: function(n, N){ return n + ' / ' + N + ' mostradas'; },
      annee: 'Año', creation: 'Creación', realisation: 'Dirección', genres: 'Géneros', note: 'Nota',
      saisons: function(s, e){ return s + ' temporada' + (s > 1 ? 's' : '') + (e ? ' · ' + e + ' episodios' : ''); }, format: 'Formato',
      duree: 'Duración', chaine: 'Emisión', avec: 'Con', sortie: 'Lanzamiento', dev: 'Desarrollo', editeur: 'Edición',
      metacritic: 'Metacritic', trailer: 'Tráiler', trailerJeu: 'Tráiler', tmdb: 'Datos: TMDB', rawg: 'Datos: RAWG',
      enVo: 'EN', niveau: 'Nivel',
      copier: 'Copiar el enlace de esta vista', copie: 'Enlace copiado', reafficher: 'Mostrar todo otra vez',
      vue: 'Línea filtrada:', sans: 'sin', masques: 'tipos ocultos:', vus: 'terminado oculto', niveauxMasques: 'niveles ocultos:',
      ici: 'Estás aquí', arretDe: function(n, N){ return 'Parada ' + n + ' de ' + N; },
      saut: function(n){ return n + ' parada' + (n > 1 ? 's' : '') + ' más adelante'; },
      premier: 'Salida de la línea', dernier: 'Terminal de la línea' },
    pt: { hideDone: 'Ocultar o que foi concluído', lvNoms: { must: 'Essencial', important: 'Importante', bonus: 'Opcional' }, typesMedia: 'Tipos de mídia', affichees: function(n, N){ return n + ' / ' + N + ' exibidas'; },
      annee: 'Ano', creation: 'Criação', realisation: 'Direção', genres: 'Gêneros', note: 'Nota',
      saisons: function(s, e){ return s + ' temporada' + (s > 1 ? 's' : '') + (e ? ' · ' + e + ' episódios' : ''); }, format: 'Formato',
      duree: 'Duração', chaine: 'Exibição', avec: 'Com', sortie: 'Lançamento', dev: 'Desenvolvimento', editeur: 'Publicação',
      metacritic: 'Metacritic', trailer: 'Trailer', trailerJeu: 'Trailer', tmdb: 'Dados: TMDB', rawg: 'Dados: RAWG',
      enVo: 'EN', niveau: 'Nível',
      copier: 'Copiar o link desta visualização', copie: 'Link copiado', reafficher: 'Mostrar tudo de novo',
      vue: 'Linha filtrada:', sans: 'sem', masques: 'tipos ocultos:', vus: 'concluído oculto', niveauxMasques: 'níveis ocultos:',
      ici: 'Você está aqui', arretDe: function(n, N){ return 'Parada ' + n + ' de ' + N; },
      saut: function(n){ return n + ' parada' + (n > 1 ? 's' : '') + ' mais adiante'; },
      premier: 'Partida da linha', dernier: 'Terminal da linha' }
  }[LANGUE];

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function $(id){ return document.getElementById(id); }
  function compact(s){
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /* ══ En bref ═══════════════════════════════════════════════════════════ */
  var ME = [];
  function mesure(k, v){ if (v) ME.push('<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>'); }
  function poseMesures(){ var m = $('f-me'); if (m) m.innerHTML = ME.join(''); }
  function synopsis(t, en){
    var p = $('f-syn');
    if (!p || p.textContent) return;
    if (!t) { p.remove(); return; }
    p.innerHTML = (en ? '<span class="f-en" title="English">' + S.enVo + '</span>' : '') + esc(t);
  }
  function action(html){ var a = $('f-act'); if (a) a.insertAdjacentHTML('beforeend', html); }
  /* Une ligne par élément, centrée : la bande-annonce, puis « Où regarder »,
     puis les sources (JustWatch, TMDB, RAWG) réunies dessous. */
  function sources(){
    var a = $('f-act'), r = $('f-srcs');
    if (!a) return null;
    if (!r) { r = document.createElement('div'); r.className = 'f-srcs'; r.id = 'f-srcs'; }
    a.appendChild(r);
    return r;
  }
  function source(html){ var r = sources(); if (r) r.insertAdjacentHTML('beforeend', html); }
  function noeud(el){
    var a = $('f-act');
    if (!a || !el) return;
    a.appendChild(el);
    var s = el.querySelector('.wt-s');
    if (s) { var r = sources(); if (r) r.insertBefore(s, r.firstChild); }
  }
  function annee(d){ return d ? String(d).slice(0, 4) : ''; }
  function hm(m){ var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : '') : r + ' min'; }
  function noms(l, n){ return (l || []).slice(0, n).map(function(x){ return x.name; }).join(', '); }
  function cssWt(){
    if (!window.CG_WT || !CG_WT.css || document.getElementById('f-wt')) return;
    var s = document.createElement('style'); s.id = 'f-wt'; s.textContent = CG_WT.css; document.head.appendChild(s);
  }
  function json(u){ return fetch(u).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }

  function ecran(){
    var type = D.md === 'tv' ? 'tv' : 'movie', base = 'https://api.themoviedb.org/3/' + type + '/' + D.tm;
    json(base + '?api_key=' + TMDB + '&language=' + LOC + '&append_to_response=videos,credits').then(function(d){
      if (!d || !d.id) { synopsis(''); poseMesures(); return; }
      // le résumé et la bande-annonce, en anglais à défaut de la langue de la page
      var v = ((d.videos && d.videos.results) || []).filter(function(x){ return x.site === 'YouTube'; });
      var besoinEn = LANGUE !== 'en' && (!d.overview || !v.some(function(x){ return x.type === 'Trailer'; }));
      var en = besoinEn ? json(base + '?api_key=' + TMDB + '&language=en-US&append_to_response=videos') : Promise.resolve(null);
      en.then(function(e){
        var ov = d.overview, ovEn = false;
        if (!ov && e && e.overview) { ov = e.overview; ovEn = true; }
        synopsis(ov, ovEn);
        if (e && e.videos) v = v.concat(((e.videos.results) || []).filter(function(x){ return x.site === 'YouTube'; }));
        var tr = v.filter(function(x){ return x.type === 'Trailer'; })[0] || v.filter(function(x){ return x.type === 'Teaser'; })[0]
          || v.filter(function(x){ return x.type === 'Opening Credits'; })[0];
        if (tr) action('<a class="f-tr" href="https://www.youtube.com/watch?v=' + encodeURIComponent(tr.key) + '" target="_blank" rel="noopener">' + S.trailer + '</a>');
        cssWt();
        var lien = '<a class="f-src" href="https://www.themoviedb.org/' + type + '/' + esc(D.tm) + '" target="_blank" rel="noopener">' + S.tmdb + '</a>';
        if (window.CG_WT && CG_WT.regarder) CG_WT.regarder(type, D.tm, TMDB).then(function(l){ noeud(l); source(lien); });
        else source(lien);
      });
      var crew = (d.credits && d.credits.crew) || [], cast = (d.credits && d.credits.cast) || [];
      if (type === 'tv') {
        var a1 = annee(d.first_air_date), a2 = annee(d.last_air_date);
        mesure(S.annee, a1 && a2 && a2 !== a1 && !d.in_production ? a1 + '–' + a2 : a1);
        mesure(S.creation, noms(d.created_by, 2));
        mesure(S.format, d.number_of_seasons ? S.saisons(d.number_of_seasons, d.number_of_episodes) : '');
        mesure(S.chaine, noms(d.networks, 2));
      } else {
        mesure(S.annee, annee(d.release_date));
        mesure(S.realisation, crew.filter(function(c){ return c.job === 'Director'; }).slice(0, 2).map(function(c){ return c.name; }).join(', '));
        mesure(S.duree, d.runtime ? hm(d.runtime) : '');
      }
      mesure(S.genres, noms(d.genres, 3));
      // une œuvre pas encore sortie n'a pas de votes : « 0.0 » se lirait comme un jugement
      mesure(S.note, d.vote_count > 0 && d.vote_average ? '★ ' + d.vote_average.toFixed(1).replace('.', LANGUE === 'en' ? '.' : ',') + ' / 10' : '');
      mesure(S.avec, noms(cast, 3));
      poseMesures();
    });
  }

  /* RAWG : le jeu par son identifiant, sinon par son titre anglais. Le texte
     de RAWG mêle souvent notices et palmarès : on garde le premier paragraphe
     qui raconte (même tri que la page Zelda). */
  function rawgSyn(g){
    var t = g && g.description_raw ? String(g.description_raw) : '';
    if (!t) return '';
    t = t.replace(/<br\s*\/?>|<\/(p|li|ul|ol|h\d)>/gi, '\n\n').replace(/<[^>]+>/g, '');
    t = t.replace(/This game is only playable in 2D\.?/g, '\n\n')
      .replace(/This classic game is part of the Virtual Console service[^\n]*/g, '\n\n');
    var p = t.split(/\n\s*\n/).map(function(x){ return x.replace(/\s+/g, ' ').trim(); })
      .filter(function(x){ return x.length > 80 && !/^(WINNER|--|Click\b|New Features|Features:)/i.test(x); });
    return p[0] || '';
  }
  function jeu(){
    var id = +D.tm && D.md === 'game' ? +D.tm : 0;
    var q = String(D.te || '').split(/\s\+\s|\s—\s/)[0].replace(/[:.+]/g, ' ').trim();
    var g = id ? json('https://api.rawg.io/api/games/' + id + '?key=' + RAWG)
      : json('https://api.rawg.io/api/games?search=' + encodeURIComponent(q) + '&page_size=1&key=' + RAWG).then(function(j){
          var r = j && j.results && j.results[0];
          if (!r || !(window.CG_WT && CG_WT.meme ? CG_WT.meme(r.name, q) : compact(r.name) === compact(q))) return null;
          return json('https://api.rawg.io/api/games/' + r.id + '?key=' + RAWG);
        });
    g.then(function(g){
      if (!g || !g.id) { synopsis(''); poseMesures(); return; }
      synopsis(rawgSyn(g), LANGUE !== 'en');
      if (g.released) {
        var d = new Date(g.released + 'T12:00:00');
        mesure(S.sortie, isNaN(d) ? g.released : d.toLocaleDateString(LOC, { year: 'numeric', month: 'long', day: 'numeric' }));
      }
      mesure(S.dev, noms(g.developers, 2));
      mesure(S.editeur, noms(g.publishers, 2));
      mesure(S.genres, noms(g.genres, 3));
      mesure(S.metacritic, g.metacritic ? String(g.metacritic) + ' / 100' : '');
      poseMesures();
      action('<a class="f-tr" href="https://www.youtube.com/results?search_query=' + encodeURIComponent((D.te || g.name) + ' trailer') +
        '" target="_blank" rel="noopener">' + S.trailerJeu + '</a>');
      cssWt();
      // la ligne « Où jouer » porte déjà le lien vers RAWG ; sinon on le pose seul
      var ligne = null;
      if (window.CG_WT && CG_WT.consoles) {
        var fixe = null;
        D.ids.forEach(function(i){ if (!fixe && CG_WT.fixes && CG_WT.fixes[i]) fixe = CG_WT.fixes[i]; });
        ligne = CG_WT.consoles(fixe || (g.platforms || []).map(function(p){
          return (CG_WT.courts && CG_WT.courts[p.platform.name]) || p.platform.name; }), g.slug);
        noeud(ligne);
      }
      if (!ligne) source('<a class="f-src" href="https://rawg.io/games/' + esc(g.slug) + '" target="_blank" rel="noopener">' + S.rawg + '</a>');
    });
  }

  // un jeu qui a son résumé dans les données le garde : RAWG donne le reste
  if (D.ec) ecran();
  else if (D.jeu) jeu();

  /* ══ Les filtres de la ligne ══════════════════════════════════════════ */
  var RAIL = $('f-rail'), FL = $('f-fl'), VUE = $('f-vue');
  if (!RAIL || !FL) return;
  var CUR = {};
  D.ids.forEach(function(i){ CUR[i] = 1; });
  var L = null, E = [], parId = {}, REP = {}, OPT = {}, PROG = {};
  var etat = lire();

  function lire(){
    var u = new URLSearchParams(location.search);
    function liste(k){ return (u.get(k) || '').split(',').filter(Boolean); }
    var e = { o: {}, t: {}, n: {}, vus: false };
    liste('o').forEach(function(o){ e.o[o] = 1; });
    liste('t').forEach(function(t){ e.t[t] = 1; });
    liste('n').forEach(function(n){ if (/^(must|important|bonus)$/.test(n)) e.n[n] = 1; });
    return e;
  }
  function actifs(){ return Object.keys(etat.o).length + Object.keys(etat.t).length + Object.keys(etat.n).length + (etat.vus ? 1 : 0); }
  // DC et DC Animation écrivent `imp` là où les autres écrivent `important`
  function niv(lv){ return lv === 'imp' ? 'important' : lv; }
  function ecrire(){
    var u = new URLSearchParams(location.search);
    var o = Object.keys(etat.o), t = Object.keys(etat.t);
    u.delete('sans');
    if (o.length) u.set('o', o.join(',')); else u.delete('o');
    if (t.length) u.set('t', t.join(',')); else u.delete('t');
    var n = Object.keys(etat.n);
    if (n.length) u.set('n', n.join(',')); else u.delete('n');
    var q = u.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q.replace(/%2C/g, ',') : '') + location.hash);
  }
  function voit(x){
    if (CUR[x.id]) return true;
    if (etat.t[x.ty]) return false;
    if (etat.vus && PROG[x.id]) return false;
    for (var k in etat.o) if (OPT[k] && OPT[k][x.i]) return false;
    if (x.lv && etat.n[niv(x.lv)]) return false;
    return true;
  }

  function charger(){
    return json('/works/lignes/' + D.r + '-' + LANGUE + '.json').then(function(j){
      if (!j || !j.e) return false;
      L = j;
      E = j.e.map(function(a){
        var x = { i: 0, id: a[0], s: a[1], ti: a[2], su: a[3], da: a[4], im: a[5], ty: a[6], lv: a[7], er: j.er[a[8]] || '' };
        parId[x.id] = x;
        var k = compact(x.ti); REP[k] = (REP[k] || 0) + 1;
        return x;
      });
      E.forEach(function(x, i){ x.i = i; });
      L.niv = {};
      E.forEach(function(x){ if (x.lv) L.niv[niv(x.lv)] = 1; });
      (j.o || []).forEach(function(o){ var m = {}; o[3].forEach(function(i){ m[i] = 1; }); OPT[o[0]] = m; });
      try { PROG = JSON.parse(localStorage.getItem(j.k) || '{}') || {}; } catch (_) { PROG = {}; }
      return true;
    });
  }

  function url(s){ return D.base + '/' + D.r + '/' + s; }
  function typeDe(x){ return (L.t && L.t[x.ty]) || ''; }
  function vignette(x, alt){ return x.im ? '<img src="' + esc(x.im) + '" alt="' + esc(alt || x.ti) + '" loading="lazy"/>' : '<span></span>'; }

  /* Le rail, à l'identique de celui d'`oeuvres.mjs` : les entrées de l'œuvre
     qui se suivent sur la ligne filtrée font une seule place, chacune entre
     l'arrêt d'avant et celui d'après. */
  function rendre(){
    var seqs = {};
    function seq(b){
      if (seqs[b]) return seqs[b];
      return (seqs[b] = (L.q[b] || L.q[''] || []).map(function(i){ return E[i]; }).filter(voit));
    }
    var places = [];
    D.ids.forEach(function(id, k){
      var x = parId[id]; if (!x) return;
      var sq = seq(D.b[k] || ''), i = sq.indexOf(x), der = places[places.length - 1];
      if (i < 0) return;
      if (der && der.sq === sq && der.fin === i - 1) { der.fin = i; der.items.push(x); }
      else places.push({ sq: sq, deb: i, fin: i, items: [x] });
    });
    if (!places.length) return;
    var out = [], eraEnCours = null, p = parId[D.ids[0]];
    function station(x){
      if (x.er && x.er !== eraEnCours) out.push('<li class="f-stn">' + esc(x.er) + '</li>');
      eraEnCours = x.er;
    }
    function carte(x){
      station(x);
      var sub = REP[compact(x.ti)] > 1 && x.su[0] ? x.su[0] : typeDe(x);
      out.push('<li class="f-a"><a class="f-card" href="' + esc(url(x.s)) + '"><span class="f-hor">' + (x.da ? esc(x.da) : '—') + '</span>' +
        vignette(x) + '<span class="f-tx"><b>' + esc(x.ti) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></a></li>');
    }
    var derSq = null, derI = -1;
    places.forEach(function(pl){
      var av = pl.sq[pl.deb - 1], ap = pl.sq[pl.fin + 1];
      if (pl.sq !== derSq) {
        if (av) carte(av); else out.push('<li class="f-bout">' + S.premier + '</li>');
      } else if (pl.deb - 1 > derI) {
        var n = pl.deb - 1 - derI - 1;
        if (n > 0) out.push('<li class="f-saut">' + S.saut(n) + '</li>');
        carte(av);
      }
      station(pl.items[0]);
      var subs = [];
      pl.items.forEach(function(x){ x.su.forEach(function(s){ subs.push('<li>' + esc(s) + '</li>'); }); });
      var x0 = pl.items[0];
      out.push('<li class="f-a f-ici"><div class="f-card"><span class="f-hor">' + (p.da ? esc(x0.da || p.da) : '—') + '</span>' +
        vignette(x0.im ? x0 : p, p.ti) + '<div class="f-tx"><span class="f-k">' + S.ici + ' · ' + S.arretDe(pl.deb + 1, pl.sq.length) +
        '</span><b>' + esc(p.ti) + '</b>' + (subs.length ? '<ul>' + subs.join('') + '</ul>' : '') + '</div></div></li>');
      if (ap) { carte(ap); derI = pl.fin + 1; }
      else { out.push('<li class="f-bout">' + S.dernier + '</li>'); derI = pl.fin; }
      derSq = pl.sq;
    });
    RAIL.innerHTML = out.join('');
    var cpt = $('f-cpt'), tot = (L.q[D.b[0] || ''] || L.q[''] || []).length;
    if (cpt) cpt.textContent = S.affichees(places[0].sq.length, tot);
    // l'afficheur du haut : « 23 / 124 » devient la place sur la ligne filtrée
    var pos = document.querySelector('[data-f="pos"]');
    if (pos && places.length === 1) pos.textContent = (places[0].deb + 1) + ' / ' + places[0].sq.length;
  }

  /* Le panneau reprend la barre des timelines (`.sieve`, `.filt`) : les
     niveaux au trait, puis les types à leur couleur, boutons enfoncés pour ce
     qui est affiché. Seul s'ajoute ce qu'une timeline n'a pas : les œuvres
     retirées par leur ✕, et le lien de la vue. */
  var LVICO = {
    must: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.1 1.1 5.9-5.2-2.8-5.2 2.8 1.1-5.9L3.6 9.8l5.9-.8z"/></svg>',
    important: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8 2.6 20.2h18.8z"/><path d="M12 9.6v4.2M12 16.9h.01"/></svg>',
    bonus: '' };
  var LVCLS = { must: 'must', important: 'imp', bonus: '' };
  function panneau(){
    var c = FL.querySelector('.f-flc');
    var h = [];
    var lv = ['must', 'important', 'bonus'].filter(function(k){ return L.niv[k]; });
    if (lv.length > 1) {
      h.push('<div class="sgroup"><span class="lab">' + S.niveau + '</span>' + lv.map(function(k){
        return '<button type="button" data-n="' + k + '" aria-pressed="' + (etat.n[k] ? 'false' : 'true') + '"' +
          (LVCLS[k] ? ' class="' + LVCLS[k] + '"' : '') + '>' + LVICO[k] + esc(S.lvNoms[k]) + '</button>';
      }).join('') + '</div>');
    }
    var types = Object.keys(L.t || {}).filter(function(t){ return E.some(function(x){ return x.ty === t && !CUR[x.id]; }); });
    if (types.length > 1) {
      h.push('<div class="sgroup"><span class="lab">' + S.typesMedia + '</span>' + types.map(function(t){
        return '<button type="button" data-t="' + esc(t) + '" style="--k:var(--t-' + esc(t) + ')" aria-pressed="' +
          (etat.t[t] ? 'false' : 'true') + '"><i></i>' + esc(L.t[t]) + '</button>';
      }).join('') + '</div>');
    }
    if ((L.o || []).length) {
      h.push('<div class="sgroup opts"><span class="lab">' + esc(L.br) + '</span>' + L.o.map(function(o){
        return '<button type="button" data-o="' + esc(o[0]) + '" style="--k:' + esc(o[2]) + '" aria-pressed="' +
          (etat.o[o[0]] ? 'false' : 'true') + '"><i></i>' + esc(o[1]) + '</button>';
      }).join('') + '</div>');
    }
    h.push('<div class="srow"><button type="button" data-vus aria-pressed="' + (etat.vus ? 'true' : 'false') + '">' + S.hideDone + '</button>' +
      '<button type="button" data-copier>' + S.copier + '</button>' +
      (actifs() ? '<button type="button" data-raz>' + S.reafficher + '</button>' : '') + '</div>');
    c.innerHTML = h.join('');
  }

  function bandeau(){
    if (!VUE) return;
    if (!actifs()) { VUE.hidden = true; VUE.innerHTML = ''; return; }
    var bouts = [];
    var sans = (L.o || []).filter(function(o){ return etat.o[o[0]]; }).map(function(o){ return '<b>' + esc(o[1]) + '</b>'; });
    if (sans.length) bouts.push(S.sans + ' ' + sans.join(', '));
    var t = Object.keys(etat.t).map(function(k){ return esc((L.t && L.t[k]) || k).toLowerCase(); });
    if (t.length) bouts.push(S.masques + ' ' + t.join(', '));
    var nv = Object.keys(etat.n).map(function(k){ return esc(S.lvNoms[k]).toLowerCase(); });
    if (nv.length) bouts.push(S.niveauxMasques + ' ' + nv.join(', '));
    if (etat.vus) bouts.push(S.vus);
    VUE.innerHTML = S.vue + ' ' + bouts.join(' · ') + '<button type="button" data-raz>' + S.reafficher + '</button>';
    VUE.hidden = false;
  }

  function tout(){ rendre(); panneau(); bandeau(); }
  function change(){ ecrire(); tout(); }

  document.addEventListener('click', function(ev){
    var b = ev.target.closest && ev.target.closest('[data-o],[data-t],[data-n],[data-vus],[data-raz],[data-copier]');
    if (!b || !L || !FL.contains(b) && !VUE.contains(b)) return;
    if (b.hasAttribute('data-o')) { var o = b.getAttribute('data-o'); if (etat.o[o]) delete etat.o[o]; else etat.o[o] = 1; change(); }
    else if (b.hasAttribute('data-vus')) { etat.vus = !etat.vus; change(); }
    else if (b.hasAttribute('data-t')) { var t = b.getAttribute('data-t'); if (etat.t[t]) delete etat.t[t]; else etat.t[t] = 1; change(); }
    else if (b.hasAttribute('data-n')) { var n = b.getAttribute('data-n'); if (etat.n[n]) delete etat.n[n]; else etat.n[n] = 1; change(); }
    else if (b.hasAttribute('data-raz')) { etat = { o: {}, t: {}, n: {}, vus: false }; change(); }
    else if (b.hasAttribute('data-copier')) {
      var ok = function(){ b.textContent = S.copie; setTimeout(function(){ if (b.isConnected) b.textContent = S.copier; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(ok, ok); else ok();
    }
  });

  charger().then(function(ok){ if (ok) tout(); });
})();
