/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — DC (prototype)
   L'architecture en zones de la prod, reconstruite :
     · Elseworlds     → Superman + Batman origins côte à côte, replié
     · 2 univers      → Arrowverse + DCEU côte à côte
     · Major Event    → pleine largeur, sans spoil
     · After the event→ Arrowverse post + Elseworlds post + DCU, 3 colonnes
   Les colonnes DISENT quelque chose : ces branches coexistent. On garde,
   et on ajoute par-dessus la recherche, la progression et les filtres.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CG = window.CG || {};
  var T = CG.t || {};
  var KEY = 'cg_dc';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var CHEV  = '<svg class="en-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var LINK  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
  var BADGES = CG.badgeLabels || {
    film: ['bf', 'MOVIE'], serie: ['bs', 'TV SHOW'], anime: ['ba', 'ANIMATED SHOW'],
    filmanim: ['bfa', 'ANIMATED MOVIE'], comic: ['bc', 'COMIC'] };
  var PH = { jeu: '🎮', film: '🎬', filmanim: '🎬', serie: '📺', anime: '📺', comic: '📚' };
  var COLKEY = { optional: ['superman', 'batman'], pre: ['av_pre', 'dceu'],
                 event: [], post: ['av_post', 'else_post', 'dcu'] };
  var FAQ = CG.faqCats || [
    { key: 'quand',    q: 'When does {name} take place?' },
    { key: 'pourquoi', q: 'Why watch {name} at this point?' },
    { key: 'spoil',    q: 'How does {name} connect to the major event?' }
  ];

  // Mapping repris tel quel de toggleUniversFilter() dans dc.html :
  // décocher une branche masque ses colonnes, et l'Arrowverse emporte
  // avec lui toutes les mentions de l'événement (barre Major Event comprise).
  var BRANCH = CG.branches || {
    elseworlds: { label: 'Elseworlds', c: '#c084fc', cols: ['superman', 'batman', 'else_post'] },
    arrowverse: { label: 'Arrowverse', c: '#22c55e', cols: ['av_pre', 'av_post'], crisis: true },
    dceu:       { label: 'DCEU',       c: '#3b82f6', cols: ['dceu'] },
    dcu:        { label: 'DCU',        c: '#f97316', cols: ['dcu'] }
  };
  var COLBRANCH = {};
  Object.keys(BRANCH).forEach(function (b) {
    BRANCH[b].cols.forEach(function (c) { COLBRANCH[c] = b; });
  });

  var BADGES_DC = CG.badges || [];

  var DATA = null, ZONES = null, RT = {};
  var state = { q: '', hideDone: false, types: {}, levels: {}, branches: {} };

  // Données en dur dans la page, ou à défaut un JSON (voir CLAUDE.md :
  // un const de premier niveau ne vit pas sur window).
  function grab(name, url) {
    if (window[name]) return Promise.resolve(window[name]);
    if (!url) return Promise.resolve(null);
    return fetch(url).then(function (r) { return r.json(); })
                     .catch(function () { return null; });
  }

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(prog)); }
  var prog = load();

  function isSep(e) { return e.type === 'separator'; }

  function badgeMap() {
    var out = {};
    BADGES_DC.forEach(function (b) {
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
    var out = [];
    Object.keys(DATA.branches).forEach(function (k) {
      DATA.branches[k].forEach(function (e) { if (!isSep(e)) out.push(e); });
    });
    return out;
  }

  // ── une entrée ───────────────────────────────────────────
  function entryHTML(e) {
    if (isSep(e)) {
      return '<div class="en-wrap is-sep" data-title="' +
          e.title.toLowerCase().replace(/"/g, '') + '"><div class="ensep">' +
        '<span class="ensep-t">' + e.title + '</span>' +
        (e.date ? '<span class="ensep-d">' + e.date + '</span>' : '') +
        (e.note ? '<p class="ensep-n">' + e.note + '</p>' : '') +
      '</div></div>';
    }
    var bd = BADGES[e.type] || ['bs', String(e.type || '').toUpperCase()];
    var LV = e.level === 'important' ? 'imp' : (e.level || 'bonus');
    var ico = LV === 'must' ? '⭐' : LV === 'imp' ? '🚨' : '';
    var rt = RT[e.id];
    var rtTxt = rt ? (rt >= 60 ? Math.floor(rt / 60) + 'h' : rt + 'min') : '';
    var sub = (e.subitems || []).length
      ? '<div class="en-sub">' + e.subitems.map(function (x) {
          return x.trim() ? '<div class="si">' + x + '</div>' : '<div class="si sep"></div>';
        }).join('') + '</div>' : '';
    // Repris de l'ancienne dc.html:750 — le badge FLASHBACK et le bignote
    // existaient en prod, la refonte les avait laissés de côté alors que les
    // données les portent toujours (tags:['flashback'], bignote:'⚠️ …').
    var fb = (e.tags || []).indexOf('flashback') !== -1
      ? '<span class="ft">FLASHBACK</span>' : '';
    var bignote = e.bignote ? '<div class="en-bignote">' + e.bignote + '</div>' : '';
    // DC n'a pas d'images locales : la vignette arrive de TMDB (voir thumbs()).
    // On pose le pictogramme de repli, l'<img> est injectée à la réponse.
    var thumb = '<span class="en-thumb"><span class="ph">' + (PH[e.type] || '🎬') + '</span></span>';
    var faq = '';
    if (e.faq) FAQ.forEach(function (c) {
      if (!e.faq[c.key]) return;
      faq += '<details class="faq"><summary>' + c.q.replace('{name}', e.title) +
             '</summary><div class="a">' + e.faq[c.key] + '</div></details>';
    });

    return '<div class="en-wrap" data-id="' + e.id + '" data-type="' + e.type + '"' +
        ' data-level="' + LV + '" data-title="' + e.title.toLowerCase().replace(/"/g, '') + '">' +
      '<div class="en' + (LV === 'must' ? ' must' : LV === 'imp' ? ' imp' : '') +
        (prog[e.id] ? ' done' : '') + '" id="' + e.id + '">' +
        '<button type="button" class="en-check" role="checkbox" data-check' +
          ' aria-checked="' + (prog[e.id] ? 'true' : 'false') + '"' +
          ' aria-label="' + (T.markWatched || 'Mark “{t}” as watched').replace('{t}', e.title.replace(/"/g, '')) + '">' +
          '<span class="mark">' + CHECK + '</span></button>' +
        '<span class="en-col">' +
          '<button type="button" class="en-main" data-toggle aria-expanded="false">' +
            '<span class="en-date"><span class="lv">' + ico + '</span>' +
              '<span class="d">' + (e.date || '—') + '</span>' +
              (e.dim ? '<span class="dim-badge">' + e.dim + '</span>' : '') +
            '</span>' +
            thumb +
            '<span class="en-body">' +
              '<span class="en-tags">' + fb +
                '<span class="b ' + bd[0] + '">' + bd[1] + '</span>' +
                // repris de dc.html:731
                (e.softcanon ? '<span class="soft-badge">SOFT-CANON</span>' : '') +
              '</span>' +
              '<span class="en-title">' + e.title + '</span>' +
              (e.note ? '<span class="en-note">' + e.note + '</span>' : '') +
            '</span>' +
            (rtTxt ? '<span class="en-rt">' + rtTxt + '</span>' : '') + CHEV +
          '</button>' + bignote + sub +
        '</span>' +
        '<a class="en-link" href="#' + e.id + '" data-copy title="' + (T.copyLink || 'Copy link to this entry') + '">' +
          LINK + '</a>' +
      '</div>' +
      '<div class="en-panel" data-tmdb="' + (e.tmdb || '0') +
          '" data-media="' + (e.media || 'tv') + '">' +
        '<div class="en-rich"></div>' +
        (faq ? '<div class="en-faq">' + faq + '</div>' : '') +
      '</div></div>';
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
    var IMG = CG.img || 'https://image.tmdb.org/t/p/';
    box.innerHTML = '<div class="expand-loading">' + (T.loading || 'Loading…') + '</div>';

    // ── jeux vidéo : RAWG, comme en prod ───────────────────
    if ((!id || id === '0') && panel.dataset.media === 'game') {
      var yt = 'https://www.youtube.com/results?search_query=' +
               encodeURIComponent(e.title + ' full movie');
      var link = '<a class="expand-trailer-link" href="' + yt + '" target="_blank"' +
                 ' rel="noopener">🎮 ' + (T.watchGame || 'Watch the full movie on YouTube') + '</a>';
      if (!CG.rawgKey) {
        box.innerHTML = '<div class="expand-inner"><div class="expand-info">' +
          '<div class="expand-synopsis">' + (e.desc || e.note || '') + '</div>' +
          meta([[T.mYear || 'Period', e.date]]) + link + '</div></div>';
        return;
      }
      fetch('https://api.rawg.io/api/games?search=' +
            encodeURIComponent(String(e.title).replace(/[:.+]/g, ' ')) +
            '&page_size=1&key=' + CG.rawgKey)
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

    if (!id || id === '0' || !CG.tmdbKey) {
      box.innerHTML = e.desc ? '<p class="en-desc">' + e.desc + '</p>' : '';
      return;
    }

    // ── films et séries : TMDB ─────────────────────────────
    var key = type + id;
    var got = detailCache[key]
      ? Promise.resolve(detailCache[key])
      : fetch('https://api.themoviedb.org/3/' + type + '/' + id +
              '?api_key=' + CG.tmdbKey + '&language=' + (CG.tmdbLang || 'en-US') +
              '&append_to_response=videos')
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var v = (d.videos && d.videos.results) || [];
            var has = v.some(function (x) { return x.type === 'Trailer' && x.site === 'YouTube'; });
            if (has) { detailCache[key] = d; return d; }
            // pas de bande annonce dans la langue : on complète en anglais
            return fetch('https://api.themoviedb.org/3/' + type + '/' + id +
                         '/videos?api_key=' + CG.tmdbKey + '&language=en-US')
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

  // ── les zones ────────────────────────────────────────────
  function build() {
    var html = '', rail = '';

    ZONES.forEach(function (z, zi) {
      var keys = COLKEY[z.id] || [];
      var slug = 'zone-' + z.id;
      var n = keys.reduce(function (a, k) {
        return a + DATA.branches[k].filter(function (e) { return !isSep(e); }).length;
      }, 0);

      if (n) {
        rail += '<a href="#' + slug + '" data-rail="' + slug + '">' +
          '<span class="n">' + z.icon + ' ' + z.name + '</span>' +
          '<span class="m" data-rail-m="' + slug + '">0/' + n + '</span>' +
          '<span class="t"><i data-rail-f="' + slug + '"></i></span></a>';
      }

      var open = z.open ? ' open' : '';
      html += '<section class="zone zone-' + z.id + '" id="' + slug + '" data-zone="' + z.id + '">' +
        '<' + (keys.length ? 'button type="button" class="zone-head" data-zone-toggle' +
              ' aria-expanded="' + (z.open ? 'true' : 'false') + '"' +
              ' aria-controls="body-' + z.id + '"' : 'div class="zone-head is-static"') + '>' +
          '<span class="zone-icon" aria-hidden="true">' + z.icon + '</span>' +
          '<span class="zone-label">' +
            '<span class="zone-name">' + z.name + '</span>' +
            '<span class="zone-desc">' + z.desc + '</span>' +
          '</span>' +
          (n ? '<span class="zone-count" data-zone-m="' + z.id + '">0 / ' + n + '</span>' : '') +
          (keys.length ? '<svg class="zone-chev" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="m6 9 6 6 6-6"/></svg>' : '') +
        '</' + (keys.length ? 'button' : 'div') + '>';

      if (keys.length) {
        html += '<div class="zone-body' + open + '" id="body-' + z.id + '"' +
                (z.open ? '' : ' hidden') + '>' +
          '<div class="zone-grid zg-' + keys.length + '">' +
            keys.map(function (k, i) {
              var col = z.cols[i] || {};
              return '<div class="zcol zcol-' + (col.kind || 'else') + '" data-col="' + k + '">' +
                '<h3 class="zcol-head">' + (col.title || k) +
                  '<span class="zcol-n" data-col-m="' + k + '"></span></h3>' +
                (col.hint ? '<p class="zcol-hint">' + col.hint + '</p>' : '') +
                '<div class="zcol-body">' +
                  DATA.branches[k].map(entryHTML).join('') +
                '</div></div>';
            }).join('') +
          '</div>' +
          // Sur mobile la grille devient un carrousel : on l'annonce.
          (keys.length > 1
            ? '<p class="zswipe">' + (T.swipe || 'Swipe to see the other branches →') + '</p>'
            : '') +
        '</div>';
      }
      // La zone Major Event porte le bloc Crisis et son dépliant SPOILERS,
      // repris mot pour mot de dc.html.
      if (z.id === 'event' && DATA.crisis) html += DATA.crisis;
      html += '</section>';
    });

    $('#zones').innerHTML = html;
    $('#rail').innerHTML = rail;
    railArrows();
    carousels();
    buildFilters();
  }

  // ── carrousel des colonnes (mobile) ──────────────────────
  // Empiler les branches ferait perdre l'idée qu'elles sont parallèles :
  // sur mobile la grille glisse à l'horizontale, avec accroche.
  // L'indication « swipe » ne s'affiche que s'il reste plus d'une colonne
  // visible après filtrage.
  function carousels() {
    $$('.zone-grid').forEach(function (grid) {
      function sync() {
        var visible = $$('.zcol', grid).filter(function (c) { return !c.hidden; });
        var sw = grid.parentNode.querySelector('.zswipe');
        if (sw) sw.hidden = visible.length < 2;
      }
      window.addEventListener('resize', sync);
      grid._sync = sync;
      sync();
    });
  }
  function syncCarousels() {
    $$('.zone-grid').forEach(function (g) { if (g._sync) g._sync(); });
  }


  function buildFilters() {
    var all = allEntries(), types = {};
    all.forEach(function (e) { types[e.type] = (types[e.type] || 0) + 1; });
    $('#f-types').innerHTML = Object.keys(types).map(function (t) {
      state.types[t] = true;
      var bd = BADGES[t] || ['bs', t];
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="type" data-v="' + t + '">' +
        '<span class="box">' + CHECK + '</span>' +
        '<span class="txt">' + bd[1] + ' <span style="opacity:.55">' + types[t] + '</span></span>' +
        '</button>';
    }).join('');

    var lv = [['imp', (T.important || '🚨 Important')], ['bonus', (T.optional || 'Optional')]];
    $('#f-branches').innerHTML = Object.keys(BRANCH).map(function (b) {
      state.branches[b] = true;
      var d = BRANCH[b];
      var n = d.cols.reduce(function (a, k) {
        return a + (DATA.branches[k] || []).filter(function (e) { return !isSep(e); }).length;
      }, 0);
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="branch" data-v="' + b + '" style="--ck:' + d.c + '">' +
        '<span class="box">' + CHECK + '</span>' +
        '<span class="dot" style="background:' + d.c + '"></span>' +
        '<span class="txt">' + d.label +
          ' <span style="opacity:.55">' + n + '</span></span>' +
        '</button>';
    }).join('');

    $('#f-levels').innerHTML = lv.filter(function (p) {
      return all.some(function (e) {
        return (e.level === 'important' ? 'imp' : (e.level || 'bonus')) === p[0];
      });
    }).map(function (p) {
      state.levels[p[0]] = true;
      var n = all.filter(function (e) {
        return (e.level === 'important' ? 'imp' : (e.level || 'bonus')) === p[0];
      }).length;
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="level" data-v="' + p[0] + '">' +
        '<span class="box">' + CHECK + '</span>' +
        '<span class="txt">' + p[1] + ' <span style="opacity:.55">' + n + '</span></span>' +
        '</button>';
    }).join('');
  }

  // ── filtrage ─────────────────────────────────────────────
  function apply() {
    var q = state.q.trim().toLowerCase(), shown = 0;
    $$('.en-wrap').forEach(function (w) {
      if (w.classList.contains('is-sep')) {
        w.hidden = !!q && w.dataset.title.indexOf(q) === -1;
        return;
      }
      var col = w.closest('.zcol');
      var br = col ? COLBRANCH[col.dataset.col] : null;
      var ok = (!br || state.branches[br] !== false) &&
               state.types[w.dataset.type] !== false &&
               state.levels[w.dataset.level] !== false &&
               (!q || w.dataset.title.indexOf(q) !== -1) &&
               !(state.hideDone && prog[w.dataset.id]);
      w.hidden = !ok;
      if (ok) shown++;
    });
    // une colonne se retire si sa branche est décochée ou si elle est vide
    $$('.zcol').forEach(function (c) {
      var b = COLBRANCH[c.dataset.col];
      var offByBranch = b && state.branches[b] === false;
      c.hidden = offByBranch ||
        !$$('.en-wrap:not(.is-sep)', c).some(function (w) { return !w.hidden; });
    });
    // Décocher l'Arrowverse fait disparaître TOUTES les mentions de l'événement :
    // la barre Major Event et le jalon planté dans la colonne.
    var crisisOn = state.branches.arrowverse !== false;
    $$('.en-wrap.is-sep').forEach(function (w) { if (!crisisOn) w.hidden = true; });
    $$('.zone').forEach(function (z) {
      var cols = $$('.zcol', z);
      // la zone Major Event n'a pas de colonne : elle suit l'Arrowverse
      z.hidden = z.dataset.zone === 'event'
        ? !crisisOn
        : cols.length > 0 && cols.every(function (c) { return c.hidden; });
      var r = $('[data-rail="zone-' + z.dataset.zone + '"]');
      if (r) r.hidden = z.hidden;
      // une zone repliée qui contient un résultat s'ouvre d'elle-même
      if (q && !z.hidden) openZone(z, true);
    });
    $('#fp-count').textContent = shown + ' / ' + allEntries().length + ' ' + (T.shown || 'shown');
    $('#empty').classList.toggle('on', shown === 0);
    $('#empty-q').textContent = q ? '“' + state.q.trim() + '”' : (T.emptyThese || 'these filters');
    syncCarousels();
    paint();
  }

  function openZone(z, on) {
    var head = $('[data-zone-toggle]', z), body = $('.zone-body', z);
    if (!head || !body) return;
    head.setAttribute('aria-expanded', on ? 'true' : 'false');
    body.hidden = !on;
    body.classList.toggle('open', on);
  }

  function paint() {
    var all = allEntries(), total = all.length;
    var done = all.filter(function (e) { return prog[e.id]; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var left = 0, unknown = 0;
    all.forEach(function (e) {
      if (prog[e.id]) return;
      var v = RT[e.id];
      if (v === undefined) { unknown++; return; }
      left += v;
    });
    $('#n-done').textContent = done;
    $('#n-total').textContent = '/ ' + total;
    $('#n-pct').textContent = pct;
    $('#bar').style.width = pct + '%';
    $('#n-h').textContent = left >= 60 ? Math.floor(left / 60) : left;
    $('#n-hu').textContent = left >= 60 ? 'h' : 'min';
    $('#star').hidden = !unknown;
    $('#mini-num').textContent = done + '/' + total;
    $('#mini-fill').style.width = pct + '%';

    Object.keys(DATA.branches).forEach(function (k) {
      var its = DATA.branches[k].filter(function (e) { return !isSep(e); });
      var d = its.filter(function (e) { return prog[e.id]; }).length;
      var m = $('[data-col-m="' + k + '"]');
      if (m) m.textContent = d + ' / ' + its.length;
    });
    ZONES.forEach(function (z) {
      var keys = COLKEY[z.id] || [];
      if (!keys.length) return;
      var its = keys.reduce(function (a, k) {
        return a.concat(DATA.branches[k].filter(function (e) { return !isSep(e); }));
      }, []);
      var d = its.filter(function (e) { return prog[e.id]; }).length;
      var m = $('[data-zone-m="' + z.id + '"]'); if (m) m.textContent = d + ' / ' + its.length;
      var rm = $('[data-rail-m="zone-' + z.id + '"]'); if (rm) rm.textContent = d + '/' + its.length;
      var rf = $('[data-rail-f="zone-' + z.id + '"]');
      if (rf) rf.style.width = (its.length ? d / its.length * 100 : 0) + '%';
      var ra = $('[data-rail="zone-' + z.id + '"]');
      if (ra) ra.classList.toggle('on', d === its.length && its.length > 0);
    });
  }

  // ── rail ─────────────────────────────────────────────────
  function railArrows() {
    var rail = $('#rail'), wrap = rail.parentNode;
    if (!wrap.classList.contains('rail-wrap')) {
      var box = document.createElement('div');
      box.className = 'rail-wrap';
      rail.parentNode.insertBefore(box, rail);
      box.appendChild(rail);
      ['prev', 'next'].forEach(function (dir) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rail-arrow rail-' + dir;
        b.setAttribute('aria-label', dir === 'prev' ? 'Scroll left' : 'Scroll right');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
          (dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6') + '"/></svg>';
        b.addEventListener('click', function () {
          rail.scrollBy({ left: (dir === 'prev' ? -1 : 1) * rail.clientWidth * 0.7, behavior: 'smooth' });
        });
        box.appendChild(b);
      });
      rail.addEventListener('scroll', railState, { passive: true });
      window.addEventListener('resize', railState);
    }
    railState();
  }
  function railState() {
    var rail = $('#rail'); if (!rail) return;
    var box = rail.parentNode;
    box.classList.toggle('is-over', rail.scrollWidth - rail.clientWidth > 4);
    box.classList.toggle('at-start', rail.scrollLeft <= 2);
    box.classList.toggle('at-end', rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
  }

  // ── interactions ─────────────────────────────────────────
  function toggleEntry(btn) {
    var id = btn.closest('.en-wrap').dataset.id;
    var before = DATA ? badgeMap() : {};
    if (prog[id]) delete prog[id]; else prog[id] = 1;
    save();
    if (DATA && window.cgBadgeFx) window.cgBadgeFx('dc', before, badgeMap(), BADGES_DC);
    localStorage.setItem('cg_last', JSON.stringify({ u: 'dc', t: Date.now() }));
    btn.setAttribute('aria-checked', prog[id] ? 'true' : 'false');
    btn.closest('.en').classList.toggle('done', !!prog[id]);
    apply();
  }

  function wire() {
    document.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-check]');
      if (c) { toggleEntry(c); return; }
      var zt = ev.target.closest('[data-zone-toggle]');
      if (zt) {
        var z = zt.closest('.zone');
        openZone(z, zt.getAttribute('aria-expanded') !== 'true');
        return;
      }
      var big = ev.target.closest('[data-big]');
      if (big) { lightbox(big.dataset.big); return; }
      var t = ev.target.closest('[data-toggle]');
      if (t) {
        var w = t.closest('.en-wrap'), op = w.classList.toggle('open');
        t.setAttribute('aria-expanded', op ? 'true' : 'false');
        if (op) loadRich(w);
        return;
      }
      var f = ev.target.closest('[data-f]');
      if (f) {
        var on = f.getAttribute('aria-checked') !== 'true';
        f.setAttribute('aria-checked', on ? 'true' : 'false');
        var bag = f.dataset.f === 'type' ? state.types
                : f.dataset.f === 'branch' ? state.branches : state.levels;
        bag[f.dataset.v] = on;
        apply(); return;
      }
      var bulk = ev.target.closest('[data-bulk]');
      if (bulk) {
        var want = bulk.dataset.bulk === 'all';
        $$('[data-f]', bulk.closest('.fp-sec')).forEach(function (b) {
          b.setAttribute('aria-checked', want ? 'true' : 'false');
          var bg = b.dataset.f === 'type' ? state.types
                 : b.dataset.f === 'branch' ? state.branches : state.levels;
          bg[b.dataset.v] = want;
        });
        apply(); return;
      }
      var cp = ev.target.closest('[data-copy]');
      if (cp) {
        ev.preventDefault();
        navigator.clipboard && navigator.clipboard.writeText(
          location.origin + location.pathname + cp.getAttribute('href'));
        cp.title = T.copied || 'Copied!';
        setTimeout(function () { cp.title = (T.copyLink || 'Copy link to this entry'); }, 1400);
        location.hash = cp.getAttribute('href');
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === ' ' || ev.key === 'Spacebar') {
        var c = ev.target.closest && ev.target.closest('[data-check]');
        if (c) { ev.preventDefault(); toggleEntry(c); }
      }
      if (ev.key === '/' && document.activeElement.tagName !== 'INPUT') {
        ev.preventDefault(); $('#q').focus();
      }
    });

    var box = $('#q'), pending;
    box.addEventListener('input', function () {
      state.q = box.value;
      box.parentNode.classList.toggle('has-value', !!box.value);
      clearTimeout(pending); pending = setTimeout(apply, 90);
    });
    $('#q-clear').addEventListener('click', function () {
      box.value = ''; state.q = '';
      box.parentNode.classList.remove('has-value'); box.focus(); apply();
    });

    var hd = $('#hide-done');
    hd.addEventListener('click', function () {
      state.hideDone = !state.hideDone;
      hd.setAttribute('aria-pressed', state.hideDone ? 'true' : 'false');
      apply();
    });

    $('[data-resume]').addEventListener('click', function () {
      var next = $$('.en-wrap').filter(function (w) {
        return !w.hidden && !w.classList.contains('is-sep') && !prog[w.dataset.id];
      })[0];
      if (!next) return;
      var z = next.closest('.zone'); if (z) openZone(z, true);
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var en = $('.en', next);
      en.classList.add('hit');
      setTimeout(function () { en.classList.remove('hit'); }, 2000);
    });

    $('#export').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, dc: prog }, null, 2)],
        { type: 'application/json' }));
      a.download = 'chronologeek-dc.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    $('#import').addEventListener('click', function () { $('#import-file').click(); });
    $('#import-file').addEventListener('change', function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          prog = d.dc || d; save();
          $$('.en-wrap:not(.is-sep)').forEach(function (w) {
            var on = !!prog[w.dataset.id];
            $('.en', w).classList.toggle('done', on);
            $('[data-check]', w).setAttribute('aria-checked', on ? 'true' : 'false');
          });
          apply();
        } catch (e) { alert(T.badFile || 'Unreadable file.'); }
      };
      r.readAsText(f); ev.target.value = '';
    });

    $('#reset').addEventListener('click', function () {
      if (!confirm(T.resetMsg || 'Reset your DC progress?')) return;
      prog = {}; save();
      $$('.en-wrap:not(.is-sep)').forEach(function (w) {
        $('.en', w).classList.remove('done');
        $('[data-check]', w).setAttribute('aria-checked', 'false');
      });
      apply();
    });

    // ── badges ────────────────────────────────────────────
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
      var got = BADGES_DC.filter(badgeState).length;
      var m = document.createElement('div');
      m.className = 'modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'My badges');
      m.innerHTML = '<div class="modal-box">' +
        '<div class="modal-head"><h2>' + (T.myBadges || 'My Badges') + '</h2>' +
          '<span class="n">' + got + ' / ' + BADGES_DC.length + ' ' + (T.unlockedN || 'unlocked') + '</span>' +
          '<button class="modal-x" aria-label="Close">✕</button></div>' +
        '<div class="badges">' + BADGES_DC.map(function (b) {
          var on = badgeState(b);
          return '<div class="bdg ' + (on ? 'on' : 'locked') + '" style="--bc:' + b.color + '">' +
            '<span class="ic">' + (on ? b.icon : '🔒') + '</span>' +
            '<span class="nm">' + b.label + '</span>' +
            '<span class="ds">' + b.desc + '</span></div>';
        }).join('') + '</div></div>';
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
      $$('[data-f]').forEach(function (b) {
        b.setAttribute('aria-checked', 'true');
        var bg2 = b.dataset.f === 'type' ? state.types
                : b.dataset.f === 'branch' ? state.branches : state.levels;
        bg2[b.dataset.v] = true;
      });
      apply();
    });
  }

  // ── vignettes TMDB ───────────────────────────────────────
  // Star Wars et Marvel ont des images locales (champ img), DC n'en a jamais eu :
  // l'ancienne page allait les chercher sur TMDB par paquets de 10 (dc.html:895).
  // La refonte avait perdu ce bout, d'où les lignes sans affiche. Repris tel quel,
  // y compris le cache par couple type+id qui évite de redemander une série
  // découpée en dix entrées (Arrow, Flash…).
  var thumbCache = {};
  // On insère l'<img> directement plutôt que de précharger via new Image() :
  // une image détachée du document avec loading="lazy" ne déclenche jamais son
  // onload, donc la vignette n'arrivait jamais. Le pictogramme reste dessous et
  // réapparaît tout seul si l'image casse (onerror).
  function applyThumb(el, src) {
    var box = $('.en-thumb', el);
    if (!box || $('img', box)) return;
    var img = document.createElement('img');
    img.loading = 'lazy'; img.alt = ''; img.width = 184; img.height = 104;
    img.onerror = function () { img.remove(); };
    img.src = src;
    box.appendChild(img);
  }
  function thumbs() {
    if (!CG.tmdbKey) return;
    var IMG = CG.img || 'https://image.tmdb.org/t/p/';
    var rows = $$('.en-panel[data-tmdb]').map(function (p) {
      return { wrap: p.closest('.en-wrap'), id: p.dataset.tmdb,
               media: p.dataset.media === 'movie' ? 'movie' : 'tv' };
    }).filter(function (r) { return r.wrap && r.id && r.id !== '0'; });

    function paint(r, path) {
      if (path) applyThumb($('.en', r.wrap) || r.wrap, IMG + 'w300' + path);
    }
    function batch(i) {
      if (i >= rows.length) return;
      Promise.all(rows.slice(i, i + 10).map(function (r) {
        var k = r.media + r.id;
        if (k in thumbCache) { paint(r, thumbCache[k]); return null; }
        thumbCache[k] = null;
        return fetch('https://api.themoviedb.org/3/' + r.media + '/' + r.id +
                     '?api_key=' + CG.tmdbKey + '&language=' + (CG.tmdbLang || 'en-US'))
          .then(function (x) { return x.json(); })
          .then(function (d) {
            thumbCache[k] = d.backdrop_path || d.poster_path || null;
            rows.forEach(function (o) { if (o.media + o.id === k) paint(o, thumbCache[k]); });
          })
          .catch(function () {});
      })).then(function () { setTimeout(function () { batch(i + 10); }, 60); });
    }
    batch(0);
  }

  Promise.all([
    // les URL viennent de la page : elles changent selon la langue
    grab('CG_DATA',  CG.data),
    grab('CG_ZONES', CG.zones),
    grab('RT',       CG.rt)
  ]).then(function (res) {
    DATA = res[0]; ZONES = res[1]; RT = res[2] || {};
    $('#intro').innerHTML = DATA.notes || '';
    build(); wire(); apply(); thumbs();
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) {
        var z = el.closest('.zone'); if (z) openZone(z, true);
        setTimeout(function () {
          el.scrollIntoView({ block: 'center' }); el.classList.add('hit');
        }, 120);
      }
    }
  });
})();
