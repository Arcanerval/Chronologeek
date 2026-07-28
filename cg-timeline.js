/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — PROTOTYPE
   Un seul fichier, aucune dépendance. Démontre les correctifs :
   recherche, saut d'ère, « masquer ce que j'ai vu », cases au clavier,
   deep-link, export/import de progression.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Libellés repris des pages de prod (starwars.html / fr/starwars.html).
  var BADGES = (window.CG && window.CG.badgeLabels) || {
    film:     ['bf',  'MOVIE'],
    filmanim: ['bfa', 'ANIMATED MOVIE'],
    serie:    ['bs',  'TV SHOW'],
    anime:    ['ba',  'ANIMATED SHOW'],
    jeu:      ['bj',  'VIDEO GAME'],
    special:  ['bsp', 'SPECIAL'],
    video:    ['bv',  'VIDEO'],
    comic:    ['bc',  'COMIC']
  };
  var ICO = {
    check:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    chev:   '<svg class="en-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    link:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
  };
  var PH = { jeu: '🎮', film: '🎬', filmanim: '🎬', serie: '📺', anime: '📺' };

  // Config posée par la page. Une seule et même mécanique pour Star Wars
  // et Marvel — c'est le principe de tes composants partagés, étendu aux
  // données : la page déclare, le moteur exécute.
  var CFG = window.CG || {};
  var T = CFG.t || {};
  var DATA = null, RT = {}, KEY = 'cg_' + (CFG.universe || 'sw');
  var state = { q: '', hideDone: false, types: {}, levels: {} };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  // Données en dur dans la page, ou à défaut un JSON.
  // Un `const` de premier niveau ne vit PAS sur window (voir CLAUDE.md) :
  // les pages exposent donc explicitement window.CG_DATA et window.RT.
  function grab(name, url) {
    if (window[name]) return Promise.resolve(window[name]);
    if (!url) return Promise.resolve(null);
    return fetch(url).then(function (r) { return r.json(); })
                     .catch(function () { return null; });
  }

  // ── progression ────────────────────────────────────────────
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); }
  var prog = load();

  // DC glisse des jalons narratifs (type:'separator') au milieu de ses
  // branches — « ⚡ The major event begins ». Ce n'est pas un média : pas de
  // case, pas de comptage. Prod le contourne déjà dans cgResume().
  function isSep(e) { return e.type === 'separator'; }

  // État de tous les badges, pour repérer ceux qui viennent de tomber.
  function badgeMap() {
    var defs = CFG.badges || [], out = {};
    defs.forEach(function (b) {
      if (b.trigger === '100pct') {
        out[b.id] = allEntries().every(function (e) { return prog[e.id]; });
      } else if (b.trigger === 'all') {
        out[b.id] = b.ids.length > 0 && b.ids.every(function (id) { return prog[id]; });
      } else {
        out[b.id] = !!prog[b.ids[0]];
      }
    });
    return out;
  }

  function allEntries() {
    return DATA.eras.reduce(function (a, e) {
      return a.concat(e.entries.filter(function (x) { return !isSep(x); }));
    }, []);
  }

  function sepHTML(e) {
    return '<div class="en-wrap is-sep" data-title="' +
        e.title.toLowerCase().replace(/"/g, '') + '">' +
      '<div class="ensep">' +
        '<span class="ensep-t">' + e.title + '</span>' +
        (e.date ? '<span class="ensep-d">' + e.date + '</span>' : '') +
        (e.note ? '<p class="ensep-n">' + e.note + '</p>' : '') +
      '</div></div>';
  }

  // ── construction ───────────────────────────────────────────
  function entryHTML(e) {
    var bd = BADGES[e.type] || ['bj', '?'];
    var LV = e.level === 'important' ? 'imp' : (e.level || 'bonus');
    var lvl = LV === 'must' ? 'must' : LV === 'imp' ? 'imp' : '';
    var ico = LV === 'must' ? '⭐' : LV === 'imp' ? '🚨' : '';
    var fb  = (e.tags || []).indexOf('flashback') !== -1
      ? '<span class="ft">FLASHBACK</span>' : '';
    // Canonicité non confirmée : Agent Carter, Agents of S.H.I.E.L.D.
    var isNC = (e.tags || []).indexOf('nc') !== -1;
    var nc = isNC ? '<span class="nt">' + (T.ncTag || 'CANONICITY NOT CONFIRMED') + '</span>' : '';
    var isDef = (CFG.defenders || []).indexOf(e.id) !== -1;
    // Groupes masquables (Spider-Verse, Fox) : une entrée peut en porter un.
    var grp = '';
    Object.keys(CFG.groups || {}).forEach(function (g) {
      if (CFG.groups[g].ids.indexOf(e.id) !== -1) grp = g;
    });
    // Une entrée hors timeline principale est décalée, en liseré pointillé.
    var dev = (CFG.deviate && e.dim && !e.inSeg) ? ' deviate' : '';
    var rt  = RT[e.id];
    var rtTxt = rt ? (rt >= 60 ? Math.floor(rt / 60) + 'h' + (rt % 60 ? String(rt % 60).padStart(2, '0') : '') : rt + 'min') : '';
    var thumb = e.img
      ? '<img src="' + (CFG.imgBase || '..') + e.img + '" alt="" loading="lazy" width="184" height="104"/>'
      : '<span class="ph">' + (PH[e.type] || '🎬') + '</span>';

    // Star Wars empile trop d'informations sur la ligne de titre : « The Clone
    // Wars — 22 BBY » répète mot pour mot la date de la colonne de gauche, et
    // « — Season 1 » répète les épisodes déjà listés dessous. Le qualificatif
    // descend donc sous le titre, collé, et s'il ne fait que redire la date il
    // disparaît. Les textes ne sont pas réécrits, seulement déplacés.
    // Exception demandée : les séries Tales gardent leur épisode à côté du
    // titre — c'est ce qui distingue les entrées les unes des autres.
    // Marvel n'est pas concerné : « Thor: Ragnarok — First Post-Credits Scene »
    // a besoin de son suffixe pour être identifiable.
    var titre = e.title, qual = '';
    if (CFG.universe === 'sw' && e.title.indexOf(' — ') !== -1 &&
        e.title.indexOf('Tales of the ') !== 0) {
      var bouts = e.title.split(' — ');
      titre = bouts.shift();
      qual  = bouts.join(' — ');
      if (e.date && qual.indexOf(e.date) === 0) {
        qual = qual.slice(e.date.length).replace(/^[\s—-]+/, '')
                   .replace(/^\((.*)\)$/, '$1').trim();
      }
    }

    // Les sous-items restent EN LIGNE, comme en prod : une ligne vide dans
    // la source est un séparateur d'arc (Clone Wars), pas un item à jeter.
    var sub = (e.subitems || []).length
      ? '<div class="en-sub">' + e.subitems.map(function (s) {
          return s.trim() ? '<div class="si">' + s + '</div>'
                          : '<div class="si sep"></div>';
        }).join('') + '</div>'
      : '';
    // Libellés repris tels quels des pages de prod (starwars.html:568-572,
    // marvel.html) — ce sont les formulations de Niko, on ne les réécrit pas.
    var faq = '';
    if (e.faq && CFG.faqCats) {
      var name = e.title || 'this title';
      CFG.faqCats.forEach(function (c) {
        faq += '<details class="faq"><summary>' + c.q.replace('{name}', name) +
               '</summary><div class="a">' +
               (e.faq[c.key] || (T.noInfo || 'No information available.')) +
               '</div></details>';
      });
    }

    return '' +
    '<div class="en-wrap" data-id="' + e.id + '" data-type="' + e.type + '"' +
        ' data-level="' + LV + '" data-nc="' + (isNC?'1':'0') + '" data-def="' + (isDef?'1':'0') + '" data-grp="' + grp + '" data-title="' +
        e.title.toLowerCase().replace(/"/g, '') + '">' +
      '<div class="en' + (lvl ? ' ' + lvl : '') + dev + (isNC ? ' nc-entry' : '') + (prog[e.id] ? ' done' : '') + '" id="' + e.id + '">' +

        // AVANT : <div class="en-check" onclick=...> — invisible au clavier.
        // APRÈS : un vrai bouton, avec rôle et état annoncés.
        '<button type="button" class="en-check" role="checkbox" data-check' +
          ' aria-checked="' + (prog[e.id] ? 'true' : 'false') + '"' +
          ' aria-label="' + (T.markWatched || 'Mark “{t}” as watched').replace('{t}', e.title.replace(/"/g, '')) + '">' +
          '<span class="mark">' + ICO.check + '</span>' +
        '</button>' +

        // AVANT : <div class="en-top" onclick=...>. APRÈS : bouton + aria-expanded.
        // Les sous-items sont SŒURS du bouton, pas dedans : une liste de
        // 51 épisodes à l'intérieur d'un <button>, c'est ingérable au clavier.
        '<span class="en-col">' +
          '<button type="button" class="en-main" data-toggle aria-expanded="false">' +
            // La désignation d'univers vit SOUS la date, comme en prod :
            // c'est une coordonnée temporelle, pas une étiquette de média.
            // La colonne de date porte TOUT ce qui situe l'entrée dans le temps :
            // la date, la réalité (OTHER REALITIES, OUTSIDE OF TIME) et la
            // canonicité. Ces trois-là vivaient à trois endroits différents, et
            // « canonicity not confirmed » débordait du cadre à droite.
            '<span class="en-date">' +
              '<span class="lv">' + ico + '</span>' +
              '<span class="d">' + (e.date || '—') + '</span>' +
              (e.dim ? '<span class="dim-badge">' + e.dim + '</span>' : '') +
              nc +
            '</span>' +
            '<span class="en-thumb">' + thumb + '</span>' +
            '<span class="en-body">' +
              // La puce de date en double a sauté : la colonne reste visible en
              // mobile, à gauche de l'affiche, sous la case à cocher.
              '<span class="en-tags">' + fb +
                '<span class="b ' + bd[0] + '">' + bd[1] + '</span>' +
              '</span>' +
              '<span class="en-title">' + titre + '</span>' +
              (qual ? '<span class="en-qual">' + qual + '</span>' : '') +
              (e.note ? '<span class="en-note">' + e.note + '</span>' : '') +
            '</span>' +
            (rtTxt ? '<span class="en-rt">' + rtTxt + '</span>' : '') +
            ICO.chev +
          '</button>' +
          sub +
        '</span>' +

        // AJOUT : ancre partageable. Aucun deep-link n'existe sur le site.
        '<a class="en-link" href="#' + e.id + '" data-copy title="' + (T.copyLink || 'Copy link to this entry') + '">' +
          ICO.link + '</a>' +
      '</div>' +
      '<div class="en-panel" data-tmdb="' + (e.tmdb || '0') +
          '" data-media="' + (e.media || 'tv') + '">' +
        '<div class="en-rich"></div>' +
        (faq ? '<div class="en-faq">' + faq + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  // ── fiche TMDB / RAWG ────────────────────────────────────
  // Portée de l'ancienne toggleExpand() : affiche, synopsis, méta et bande
  // annonce. La durée n'est plus dans la méta, elle vit sur la ligne.
  var detailCache = {};

  function meta(pairs) {
    var s = pairs.filter(function (p) { return p[1]; })
      .map(function (p) { return '<span><strong>' + p[0] + '</strong> ' + p[1] + '</span>'; })
      .join('');
    return s ? '<div class="expand-meta">' + s + '</div>' : '';
  }

  function lightbox(url) {
    var pm = $('#cg-pm');
    if (!pm) {
      pm = document.createElement('div');
      pm.id = 'cg-pm';
      pm.className = 'pm';
      pm.innerHTML = '<button class="pm-x" aria-label="' + (T.close || 'Close') + '">✕</button>' +
                     '<img id="cg-pmi" alt=""/>';
      pm.addEventListener('click', function () { pm.classList.remove('o'); });
      document.body.appendChild(pm);
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') pm.classList.remove('o');
      });
    }
    $('#cg-pmi').src = url;
    pm.classList.add('o');
  }

  function loadRich(wrap) {
    var panel = $('.en-panel', wrap), box = $('.en-rich', panel);
    if (!box || panel.dataset.loaded) return;
    panel.dataset.loaded = '1';

    var e = allEntries().filter(function (x) { return x.id === wrap.dataset.id; })[0] || {};
    var id = panel.dataset.tmdb, type = panel.dataset.media === 'movie' ? 'movie' : 'tv';
    var IMG = CFG.img || 'https://image.tmdb.org/t/p/';
    box.innerHTML = '<div class="expand-loading">' + (T.loading || 'Loading…') + '</div>';

    // ── jeux vidéo : RAWG, comme en prod ───────────────────
    if ((!id || id === '0') && panel.dataset.media === 'game') {
      var yt = 'https://www.youtube.com/results?search_query=' +
               encodeURIComponent(e.title + ' full movie');
      var link = '<a class="expand-trailer-link" href="' + yt + '" target="_blank"' +
                 ' rel="noopener">🎮 ' + (T.watchGame || 'Watch the full movie on YouTube') + '</a>';
      if (!CFG.rawgKey) {
        box.innerHTML = '<div class="expand-inner"><div class="expand-info">' +
          '<div class="expand-synopsis">' + (e.desc || e.note || '') + '</div>' +
          meta([[T.mYear || 'Period', e.date]]) + link + '</div></div>';
        return;
      }
      fetch('https://api.rawg.io/api/games?search=' +
            encodeURIComponent(String(e.title).replace(/[:.+]/g, ' ')) +
            '&page_size=1&key=' + CFG.rawgKey)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var g = d.results && d.results[0];
          box.innerHTML = '<div class="expand-inner">' +
            (g && g.background_image
              ? '<div class="expand-poster"><img src="' + g.background_image + '" loading="lazy" alt=""/></div>' : '') +
            '<div class="expand-info"><div class="expand-synopsis">' +
              (e.desc || (g && g.description_raw ? g.description_raw.substring(0, 300) + '…' : e.note || '')) +
            '</div>' +
            meta([[T.mReleased || 'Released', g && g.released ? g.released.substring(0, 4) : ''],
                  [T.mRating || 'Rating', g && g.rating ? '⭐ ' + g.rating.toFixed(1) + '/5' : ''],
                  [T.mPeriod || 'Period', e.date]]) +
            link + '</div></div>';
        })
        .catch(function () {
          box.innerHTML = '<div class="expand-inner"><div class="expand-info">' +
            '<div class="expand-synopsis">' + (e.desc || e.note || '') + '</div>' +
            meta([[T.mPeriod || 'Period', e.date]]) + link + '</div></div>';
        });
      return;
    }

    if (!id || id === '0' || !CFG.tmdbKey) {
      box.innerHTML = e.desc ? '<p class="en-desc">' + e.desc + '</p>' : '';
      return;
    }

    // ── films et séries : TMDB ─────────────────────────────
    var key = type + id;
    var got = detailCache[key]
      ? Promise.resolve(detailCache[key])
      : fetch('https://api.themoviedb.org/3/' + type + '/' + id +
              '?api_key=' + CFG.tmdbKey + '&language=' + (CFG.tmdbLang || 'en-US') +
              '&append_to_response=videos')
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var v = (d.videos && d.videos.results) || [];
            var has = v.some(function (x) { return x.type === 'Trailer' && x.site === 'YouTube'; });
            if (has) { detailCache[key] = d; return d; }
            // pas de bande annonce dans la langue : on complète en anglais
            return fetch('https://api.themoviedb.org/3/' + type + '/' + id +
                         '/videos?api_key=' + CFG.tmdbKey + '&language=en-US')
              .then(function (r) { return r.json(); })
              .then(function (en) {
                d.videos = { results: v.concat(en.results || []) };
                detailCache[key] = d;
                return d;
              });
          });

    got.then(function (d) {
      var trailer = ((d.videos && d.videos.results) || []).filter(function (v) {
        return v.type === 'Trailer' && v.site === 'YouTube';
      })[0];
      var poster = d.poster_path ? IMG + 'w300' + d.poster_path : null;
      box.innerHTML = '<div class="expand-inner">' +
        (poster ? '<button type="button" class="expand-poster" data-big="' +
            IMG + 'w780' + d.poster_path + '" aria-label="' + (T.zoom || 'Enlarge poster') + '">' +
            '<img src="' + poster + '" loading="lazy" alt=""/>' +
            '<span class="expand-poster-ov">🔍</span></button>' : '') +
        '<div class="expand-info">' +
          '<div class="expand-synopsis">' + (d.overview || (T.noSynopsis || 'No synopsis available.')) + '</div>' +
          meta([[T.mYear || 'Year', (d.release_date || d.first_air_date || '').substring(0, 4)],
                [T.mGenre || 'Genre', (d.genres || []).map(function (g) { return g.name; }).join(', ')],
                [T.mRating || 'Rating', d.vote_average ? '⭐ ' + d.vote_average.toFixed(1) + '/10' : '']]) +
          (trailer ? '<a class="expand-trailer-link" href="https://www.youtube.com/watch?v=' +
            trailer.key + '" target="_blank" rel="noopener">▶ ' +
            (T.trailer || 'YouTube trailer') + '</a>' : '') +
        '</div></div>';
    }).catch(function () {
      box.innerHTML = '<div class="expand-loading">' + (T.loadFail || 'Failed to load.') + '</div>';
    });
  }

  function build() {
    var tl = $('#timeline'), rail = $('#rail'), html = '', railHTML = '';

    DATA.eras.forEach(function (era, i) {
      var slug = 'era-' + i;
      railHTML +=
        '<a href="#' + slug + '" data-rail="' + slug + '">' +
          '<span class="n">' + era.title + '</span>' +
          '<span class="m" data-rail-m="' + slug + '">0/' +
            era.entries.filter(function (x) { return !isSep(x); }).length + '</span>' +
          '<span class="t"><i data-rail-f="' + slug + '"></i></span>' +
        '</a>';

      // Les deux gros segments Marvel (Spider-Verse, Fox) ont leur propre
      // cartouche : ce sont des parenthèses hors continuité principale,
      // et prod les encadrait exprès pour bien les séparer du reste.
      var SEG = { sv: 1, fox: 1 };   // pas d'emoji : Niko n'en veut pas
      var sp = era.special && SEG[era.special] ? era.special : '';

      html +=
        '<section class="era' + (sp ? ' is-seg seg-' + sp : '') + '" id="' + slug +
            '" data-era="' + slug + '">' +
          '<div class="era-h">' +
            
            '<h2>' + era.title + '</h2>' +
            '<span class="era-m" data-era-m="' + slug + '"></span>' +
          '</div>' +
          '<div class="era-body">' +
            era.entries.map(function(e){return isSep(e)?sepHTML(e):entryHTML(e)}).join('') +
          '</div>' +
        '</section>';
    });

    tl.innerHTML = html;
    rail.innerHTML = railHTML;
    railArrows();
    buildFilters();
  }

  // ── flèches du rail ──────────────────────────────────────
  // Avec 10 phases Marvel ou 7 branches DC, rien ne disait qu'il y avait
  // une suite à droite. Les flèches apparaissent quand ça déborde,
  // et disparaissent en bout de course.
  function railArrows() {
    var rail = $('#rail');
    var wrap = rail.parentNode;
    if (!wrap.classList.contains('rail-wrap')) {
      var box = document.createElement('div');
      box.className = 'rail-wrap';
      rail.parentNode.insertBefore(box, rail);
      box.appendChild(rail);
      ['prev', 'next'].forEach(function (dir) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rail-arrow rail-' + dir;
        b.setAttribute('aria-label', dir === 'prev' ? 'Scroll eras left' : 'Scroll eras right');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
          (dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6') + '"/></svg>';
        b.addEventListener('click', function () {
          rail.scrollBy({ left: (dir === 'prev' ? -1 : 1) * rail.clientWidth * 0.7,
                          behavior: 'smooth' });
        });
        box.appendChild(b);
      });
      rail.addEventListener('scroll', railState, { passive: true });
      window.addEventListener('resize', railState);
    }
    railState();
  }

  function railState() {
    var rail = $('#rail');
    if (!rail) return;
    var box = rail.parentNode;
    var over = rail.scrollWidth - rail.clientWidth > 4;
    box.classList.toggle('is-over', over);
    box.classList.toggle('at-start', rail.scrollLeft <= 2);
    box.classList.toggle('at-end', rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
  }

  function buildFilters() {
    var types = {}, all = allEntries();
    all.forEach(function (e) { types[e.type] = (types[e.type] || 0) + 1; });

    var row = Object.keys(types).filter(function(t){return types[t]>0}).map(function (t) {
      var bd = BADGES[t] || ['bj', t];
      var col = getComputedStyle(document.documentElement).getPropertyValue('--x') || '';
      state.types[t] = true;
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="type" data-v="' + t + '">' +
        '<span class="box">' + ICO.check + '</span>' +
        '<span class="dot" data-dot="' + bd[0] + '"></span>' +
        '<span class="txt">' + bd[1] + ' <span style="opacity:.55">' + types[t] + '</span></span>' +
        '</button>';
    }).join('');

    var lv = [['must', (T.essential || '⭐ Essential')], ['imp', (T.important || '🚨 Important')], ['bonus', (T.optional || 'Optional')]];
    var lvRow = lv.filter(function(p){return all.some(function(e){var L=e.level==='important'?'imp':(e.level||'bonus');return L===p[0]})}).map(function (p) {
      state.levels[p[0]] = true;
      var n = all.filter(function (e) { var L = e.level === 'important' ? 'imp' : (e.level || 'bonus'); return L === p[0]; }).length;
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="level" data-v="' + p[0] + '">' +
        '<span class="box">' + ICO.check + '</span>' +
        '<span class="txt">' + p[1] + ' <span style="opacity:.55">' + n + '</span></span>' +
        '</button>';
    }).join('');

    // Les deux options « à part » de Marvel, remises : canonicité non
    // confirmée (Agent Carter, Agents of S.H.I.E.L.D.) et séries Defenders.
    var opts = '';
    var nNC  = all.filter(function (e) { return (e.tags || []).indexOf('nc') !== -1; }).length;
    var nDef = all.filter(function (e) { return (CFG.defenders || []).indexOf(e.id) !== -1; }).length;
    if (nNC) {
      state.nc = true;
      opts += '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="opt" data-v="nc" style="--ck:var(--red)">' +
        '<span class="box">' + ICO.check + '</span>' +
        '<span class="txt">' + (T.ncLabel || 'Canonicity not confirmed') +
        ' <span style="opacity:.55">' + nNC + '</span></span></button>';
    }
    if (nDef) {
      state.def = true;
      opts += '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="opt" data-v="def" style="--ck:#a99fff">' +
        '<span class="box">' + ICO.check + '</span>' +
        '<span class="txt">' + (T.defLabel || 'Defenders series') +
        ' <span style="opacity:.55">' + nDef + '</span></span></button>';
    }

    Object.keys(CFG.groups || {}).forEach(function (g) {
      var d = CFG.groups[g];
      var n = all.filter(function (e) { return d.ids.indexOf(e.id) !== -1; }).length;
      if (!n) return;
      state[g] = true;
      opts += '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="opt" data-v="' + g + '" style="--ck:' + d.color + '">' +
        '<span class="box">' + ICO.check + '</span>' +
        '<span class="dot" style="background:' + d.color + '"></span>' +
        '<span class="txt">' + d.label + ' <span style="opacity:.55">' + n + '</span></span>' +
        '</button>';
    });

    $('#f-types').innerHTML = row;
    $('#f-levels').innerHTML = lvRow;
    var oc = $('#f-opts');
    if (oc) {
      oc.innerHTML = opts;
      oc.closest('.fp-sec').hidden = !opts;
    }

    // la pastille reprend la couleur du badge de type correspondant
    $$('[data-dot]').forEach(function (d) {
      var probe = document.createElement('span');
      probe.className = 'b ' + d.dataset.dot;
      document.body.appendChild(probe);
      d.style.background = getComputedStyle(probe).color;
      d.closest('.ck').style.setProperty('--ck', getComputedStyle(probe).color);
      probe.remove();
    });
  }

  // ── filtrage ───────────────────────────────────────────────
  function apply() {
    var q = state.q.trim().toLowerCase(), shown = 0;

    $$('.en-wrap').forEach(function (w) {
      if (w.classList.contains('is-sep')) {
        w.hidden = !!q && w.dataset.title.indexOf(q) === -1;
        return;
      }
      var ok = state.types[w.dataset.type] !== false &&
               state.levels[w.dataset.level] !== false &&
               !(state.nc === false && w.dataset.nc === '1') &&
               !(state.def === false && w.dataset.def === '1') &&
               !(w.dataset.grp && state[w.dataset.grp] === false) &&
               (!q || w.dataset.title.indexOf(q) !== -1) &&
               !(state.hideDone && prog[w.dataset.id]);
      w.hidden = !ok;
      if (ok) shown++;
    });

    // une ère sans entrée visible disparaît, rail compris
    $$('.era').forEach(function (s) {
      var vis = $$('.en-wrap', s).some(function (w) { return !w.hidden; });
      s.hidden = !vis;
      var r = $('[data-rail="' + s.dataset.era + '"]');
      if (r) r.hidden = !vis;
    });

    $('#fp-count').textContent = shown + ' / ' + allEntries().length + ' ' + (T.shown || 'shown');
    $('#empty').classList.toggle('on', shown === 0);
    $('#empty-q').textContent = q ? '“' + state.q.trim() + '”' : (T.emptyThese || 'these filters');
    paint();
  }

  // ── chiffres ───────────────────────────────────────────────
  function paint() {
    var all = allEntries(), total = all.length, done = 0, left = 0, unknown = 0;

    all.forEach(function (e) {
      if (prog[e.id]) { done++; return; }
      var v = RT[e.id];
      if (v === undefined) { unknown++; return; }
      left += v;
    });

    var pct = total ? Math.round(done / total * 100) : 0;
    $('#n-done').textContent  = done;
    $('#n-total').textContent = '/ ' + total;
    $('#n-pct').textContent   = pct;
    $('#bar').style.width     = pct + '%';
    $('#n-h').textContent     = left >= 60 ? Math.floor(left / 60) : left;
    $('#n-hu').textContent    = left >= 60 ? 'h' : 'min';
    $('#star').hidden         = !unknown;

    $('#mini-fill').style.width = pct + '%';
    $('#mini-num').textContent  = done + '/' + total;

    // par ère, sur le rail et sur l'en-tête collant
    DATA.eras.forEach(function (era, i) {
      var slug = 'era-' + i;
      var its = era.entries.filter(function (e) { return !isSep(e); });
      var d = its.filter(function (e) { return prog[e.id]; }).length;
      var t = its.length;
      var m = $('[data-rail-m="' + slug + '"]'); if (m) m.textContent = d + '/' + t;
      var f = $('[data-rail-f="' + slug + '"]'); if (f) f.style.width = (t ? d / t * 100 : 0) + '%';
      var h = $('[data-era-m="' + slug + '"]'); if (h) h.textContent = d + ' / ' + t + ' watched';
      var a = $('[data-rail="' + slug + '"]'); if (a) a.classList.toggle('on', d === t && t > 0);
    });
  }

  // ── interactions ───────────────────────────────────────────
  function toggleEntry(btn) {
    var wrap = btn.closest('.en-wrap'), id = wrap.dataset.id;
    var before = DATA ? badgeMap() : {};
    if (prog[id]) delete prog[id]; else prog[id] = 1;
    save(prog);
    if (DATA && window.cgBadgeFx) {
      window.cgBadgeFx(CFG.universe || 'sw', before, badgeMap(), CFG.badges || []);
    }
    // AJOUT : on retient le dernier univers touché. C'est ce qui permet à
    // l'accueil de proposer UNE reprise pertinente au lieu d'un tableau de bord.
    localStorage.setItem('cg_last', JSON.stringify({ u: CFG.universe || 'sw', t: Date.now() }));
    btn.setAttribute('aria-checked', prog[id] ? 'true' : 'false');
    btn.closest('.en').classList.toggle('done', !!prog[id]);
    if (state.hideDone && prog[id]) wrap.hidden = true;
    apply();
  }

  function wire() {
    document.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-check]');
      if (c) { toggleEntry(c); return; }

      // agrandissement de l'affiche
      var big = ev.target.closest('[data-big]');
      if (big) { lightbox(big.dataset.big); return; }

      var t = ev.target.closest('[data-toggle]');
      if (t) {
        var w = t.closest('.en-wrap'), open = w.classList.toggle('open');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) loadRich(w);
        return;
      }

      var f = ev.target.closest('[data-f]');
      if (f) {
        var on = f.getAttribute('aria-checked') !== 'true';
        f.setAttribute('aria-checked', on ? 'true' : 'false');
        if (f.dataset.f === 'opt') state[f.dataset.v] = on;
        else (f.dataset.f === 'type' ? state.types : state.levels)[f.dataset.v] = on;
        apply();
        return;
      }

      var bulk = ev.target.closest('[data-bulk]');
      if (bulk) {
        var want = bulk.dataset.bulk === 'all';
        $$('[data-f]', bulk.closest('.fp-sec')).forEach(function (b) {
          b.setAttribute('aria-checked', want ? 'true' : 'false');
          if (b.dataset.f === 'opt') state[b.dataset.v] = want;
          else (b.dataset.f === 'type' ? state.types : state.levels)[b.dataset.v] = want;
        });
        apply();
        return;
      }

      var cp = ev.target.closest('[data-copy]');
      if (cp) {
        ev.preventDefault();
        var url = location.origin + location.pathname + cp.getAttribute('href');
        navigator.clipboard && navigator.clipboard.writeText(url);
        cp.title = T.copied || 'Copied!';
        setTimeout(function () { cp.title = (T.copyLink || 'Copy link to this entry'); }, 1400);
        location.hash = cp.getAttribute('href');
        return;
      }
    });

    // Espace sur un role="checkbox" : le navigateur scrolle par défaut.
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== ' ' && ev.key !== 'Spacebar') return;
      var c = ev.target.closest && ev.target.closest('[data-check]');
      if (c) { ev.preventDefault(); toggleEntry(c); }
    });

    // recherche
    var box = $('#q'), pending;
    box.addEventListener('input', function () {
      state.q = box.value;
      box.parentNode.classList.toggle('has-value', !!box.value);
      clearTimeout(pending);
      pending = setTimeout(apply, 90);
    });
    $('#q-clear').addEventListener('click', function () {
      box.value = ''; state.q = '';
      box.parentNode.classList.remove('has-value');
      box.focus(); apply();
    });
    // « / » met le curseur dans la recherche, comme partout ailleurs
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement.tagName !== 'INPUT') {
        ev.preventDefault(); box.focus();
      }
      if (ev.key === 'Escape' && document.activeElement === box) {
        box.value = ''; state.q = '';
        box.parentNode.classList.remove('has-value'); apply();
      }
    });

    // masquer ce qui est vu
    var hd = $('#hide-done');
    hd.addEventListener('click', function () {
      state.hideDone = !state.hideDone;
      hd.setAttribute('aria-pressed', state.hideDone ? 'true' : 'false');
      apply();
    });

    // reprendre
    $$('[data-resume]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = $$('.en-wrap').filter(function (w) {
          return !w.hidden && !prog[w.dataset.id];
        })[0];
        if (!next) return;
        next.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var en = $('.en', next);
        en.classList.add('hit');
        setTimeout(function () { en.classList.remove('hit'); }, 2000);
      });
    });

    // AJOUT : sauvegarde. Aujourd'hui la progression peut disparaître
    // avec un simple nettoyage de navigateur, sans aucun recours.
    $('#export').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify((function(){var o={v:1};o[CFG.universe||'sw']=prog;return o})(), null, 2)],
        { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'chronologeek-' + (CFG.universe||'sw') + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#import').addEventListener('click', function () { $('#import-file').click(); });
    $('#import-file').addEventListener('change', function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          prog = d[CFG.universe || 'sw'] || d.sw || d;
          save(prog);
          $$('.en-wrap').forEach(function (w) {
            var on = !!prog[w.dataset.id];
            $('.en', w).classList.toggle('done', on);
            $('[data-check]', w).setAttribute('aria-checked', on ? 'true' : 'false');
          });
          apply();
        } catch (e) { alert(T.badFile || 'Unreadable file.'); }
      };
      r.readAsText(f);
      ev.target.value = '';
    });

    $('#reset').addEventListener('click', function () {
      if (!confirm(T.resetMsg || 'Reset your progress?')) return;
      prog = {}; save(prog);
      $$('.en-wrap').forEach(function (w) {
        $('.en', w).classList.remove('done');
        $('[data-check]', w).setAttribute('aria-checked', 'false');
      });
      apply();
    });

    // ── badges ────────────────────────────────────────────
    // Les vrais badges de badges.js, avec les trois déclencheurs d'origine :
    //   last   → l'entrée qui clôt une ère suffit
    //   all    → toutes les entrées listées
    //   100pct → l'univers entier
    var BADGES_SW = CFG.badges || [];

    function badgeState(b) {
      if (b.trigger === '100pct') {
        return allEntries().every(function (e) { return prog[e.id]; });
      }
      if (b.trigger === 'all') {
        return b.ids.length > 0 && b.ids.every(function (id) { return prog[id]; });
      }
      return !!prog[b.ids[0]];
    }

    $('#badges-btn').addEventListener('click', function () {
      var got = BADGES_SW.filter(badgeState).length;
      var m = document.createElement('div');
      m.className = 'modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'My badges');
      m.innerHTML =
        '<div class="modal-box">' +
          '<div class="modal-head"><h2>' + (T.myBadges || 'My Badges') + '</h2>' +
            '<span class="n">' + got + ' / ' + BADGES_SW.length + ' ' + (T.unlockedN || 'unlocked') + '</span>' +
            '<button class="modal-x" aria-label="Close">✕</button></div>' +
          '<div class="badges">' + BADGES_SW.map(function (b) {
            var on = badgeState(b);
            return '<div class="bdg ' + (on ? 'on' : 'locked') + '" style="--bc:' + b.color + '">' +
              '<span class="ic">' + (on ? b.icon : '🔒') + '</span>' +
              '<span class="nm">' + b.label + '</span>' +
              '<span class="ds">' + b.desc + '</span></div>';
          }).join('') + '</div>' +
        '</div>';
      document.body.appendChild(m);

      var x = m.querySelector('.modal-x');
      x.focus();
      function close() {
        m.remove();
        document.removeEventListener('keydown', esc);
        $('#badges-btn').focus();
      }
      function esc(ev) { if (ev.key === 'Escape') close(); }
      x.addEventListener('click', close);
      m.addEventListener('click', function (ev) { if (ev.target === m) close(); });
      document.addEventListener('keydown', esc);
    });

    $('#clear-filters').addEventListener('click', function () {
      state.q = ''; $('#q').value = '';
      $('#q').parentNode.classList.remove('has-value');
      state.hideDone = false;
      $('#hide-done').setAttribute('aria-pressed', 'false');
      $('[data-f]').forEach(function (b) {
        b.setAttribute('aria-checked', 'true');
        if (b.dataset.f === 'opt') state[b.dataset.v] = true;
        else (b.dataset.f === 'type' ? state.types : state.levels)[b.dataset.v] = true;
      });
      apply();
    });
  }

  // l'ère courante s'allume dans le rail pendant le défilement
  function spy() {
    var mid = window.innerHeight * 0.34, cur = null;
    $$('.era').forEach(function (s) {
      if (s.hidden) return;
      var r = s.getBoundingClientRect();
      if (r.top <= mid) cur = s.dataset.era;
    });
    $$('[data-rail]').forEach(function (a) {
      a.style.borderColor = a.dataset.rail === cur ? 'var(--tl)' : '';
    });
  }

  // ── démarrage ──────────────────────────────────────────────
  Promise.all([
    // Les données restent EN DUR dans la page : la page pose window.CG_DATA
    // et window.RT, on les lit directement. runtime.py continue donc
    // d'injecter sa table `const RT` sans rien changer.
    grab('CG_DATA', CFG.data),
    grab('RT', CFG.rt)
  ]).then(function (res) {
    DATA = res[0]; RT = res[1];

    // le texte d'intro vient de la page d'origine, mot pour mot
    $('#intro').innerHTML = DATA.notes || '';

    build();
    wire();
    apply();

    window.addEventListener('scroll', spy, { passive: true });
    spy();

    // deep-link : on ouvre et on met en évidence l'entrée visée
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) {
        var w = el.closest('.en-wrap');
        w.classList.add('open');
        $('[data-toggle]', w).setAttribute('aria-expanded', 'true');
        loadRich(w);
        setTimeout(function () {
          el.scrollIntoView({ block: 'center' });
          el.classList.add('hit');
        }, 120);
      }
    }
  });
})();
