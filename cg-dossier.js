/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — Le Dossier (prototype)
   532 entrées, 63 repères « On screen », 7 ères.
   Même mécanique que les timelines : recherche, saut d'ère,
   masquer-ce-qui-est-lu, cases au clavier, export/import.
   Le verbe change : ici on « lit », pas on « regarde ».
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var T = (window.CG && window.CG.t) || {};
  var KEY = 'cg_dossier';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var DATA = null;
  var state = { q: '', hideDone: false, kinds: {} };

  function grab(name, url) {
    if (window[name]) return Promise.resolve(window[name]);
    if (!url) return Promise.resolve(null);
    return fetch(url).then(function (r) { return r.json(); })
                     .catch(function () { return null; });
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(prog)); }
  var prog = load();

  function items() {
    return DATA.eras.reduce(function (a, e) {
      return a.concat(e.items.filter(function (x) { return x.kind === 'it'; }));
    }, []);
  }

  // ── rendu ────────────────────────────────────────────────
  function itemHTML(x) {
    return '<div class="dr-wrap" data-id="' + x.id + '" data-k="' + x.k + '"' +
        ' data-title="' + (x.title + ' ' + x.type).toLowerCase().replace(/"/g, '') + '">' +
      '<div class="dr' + (prog[x.id] ? ' done' : '') + '" id="' + x.id + '" style="--c:' + x.c + '">' +
        '<button type="button" class="dr-ck" role="checkbox" data-check' +
          ' aria-checked="' + (prog[x.id] ? 'true' : 'false') + '"' +
          ' aria-label="' + (T.markRead || 'Mark “{t}” as read').replace('{t}', x.title.replace(/"/g, '')) + '">' +
          '<span class="mark">' + CHECK + '</span></button>' +
        '<span class="dr-dt">' + x.date + '</span>' +
        '<span class="dr-main">' +
          '<span class="dr-tt">' + x.title +
            // Badge VO : « pas de version française connue ». En prod il est
            // injecté DANS le titre, ici c'est un frère, il ne casse plus rien.
            (x.vo ? '<span class="vo" title="' +
              (T.voTitle || 'No known French version') + '">VO</span>' : '') +
          '</span>' +
          (x.note ? '<span class="dr-note">' + x.note + '</span>' : '') +
        '</span>' +
        '<span class="dr-kd">' + x.type + '</span>' +
        '<a class="en-link" href="#' + x.id + '" data-copy title="' + (T.copyLink || 'Copy link to this entry') + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/>' +
          '<path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></a>' +
      '</div></div>';
  }

  // Le repère « On screen » : ce n'est pas une lecture, c'est un jalon.
  // Il n'a pas de case et ne compte pas dans la progression.
  function screenHTML(x) {
    return '<div class="dr-wrap is-screen" data-title="' +
        x.title.toLowerCase().replace(/"/g, '') + '">' +
      '<div class="dscreen" style="--c:' + x.c + '">' +
        '<span class="dscreen-ic" aria-hidden="true">▶</span>' +
        '<span class="dr-dt">' + x.date + '</span>' +
        '<span class="dr-tt">' + x.title + '</span>' +
        '<span class="dr-kd">' + x.type + '</span>' +
      '</div></div>';
  }

  function build() {
    var html = '', rail = '';
    DATA.eras.forEach(function (era, i) {
      var slug = 'era-' + i;
      var n = era.items.filter(function (x) { return x.kind === 'it'; }).length;
      rail += '<a href="#' + slug + '" data-rail="' + slug + '">' +
        '<span class="n">' + era.title + '</span>' +
        '<span class="m" data-rail-m="' + slug + '">0/' + n + '</span>' +
        '<span class="t"><i data-rail-f="' + slug + '"></i></span></a>';

      html += '<section class="era" id="' + slug + '" data-era="' + slug + '">' +
        '<div class="era-h"><h2>' + era.title + '</h2>' +
        '<span class="era-m" data-era-m="' + slug + '"></span></div>' +
        '<div class="era-body">' +
          era.items.map(function (x) {
            return x.kind === 'screen' ? screenHTML(x) : itemHTML(x);
          }).join('') +
        '</div></section>';
    });
    $('#timeline').innerHTML = html;
    $('#rail').innerHTML = rail;
    railArrows();

    // filtres par type de média, couleur reprise de la source
    var kinds = {};
    items().forEach(function (x) {
      var KL = (window.CG && window.CG.kindLabels) || {};
      if (!kinds[x.k]) kinds[x.k] = { n: 0, label: KL[x.k] || x.type, c: x.c };
      kinds[x.k].n++;
    });
    $('#f-types').innerHTML = Object.keys(kinds).map(function (k) {
      state.kinds[k] = true;
      var d = kinds[k];
      return '<button type="button" class="ck" role="checkbox" aria-checked="true"' +
        ' data-f="kind" data-v="' + k + '" style="--ck:' + d.c + '">' +
        '<span class="box">' + CHECK + '</span>' +
        '<span class="dot" style="background:' + d.c + '"></span>' +
        '<span class="txt">' + d.label + ' <span style="opacity:.55">' + d.n + '</span></span>' +
        '</button>';
    }).join('');
  }

  // ── flèches du rail ──────────────────────────────────────
  // Même mécanique que sur les timelines : rien ne disait qu'il y avait
  // une suite à droite.
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
    box.classList.toggle('is-over', rail.scrollWidth - rail.clientWidth > 4);
    box.classList.toggle('at-start', rail.scrollLeft <= 2);
    box.classList.toggle('at-end', rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
  }

  // ── filtrage ─────────────────────────────────────────────
  function apply() {
    var q = state.q.trim().toLowerCase(), shown = 0;
    $$('.dr-wrap').forEach(function (w) {
      if (w.classList.contains('is-screen')) {
        // un repère ne se filtre que par la recherche
        w.hidden = !!q && w.dataset.title.indexOf(q) === -1;
        return;
      }
      var ok = state.kinds[w.dataset.k] !== false &&
               (!q || w.dataset.title.indexOf(q) !== -1) &&
               !(state.hideDone && prog[w.dataset.id]);
      w.hidden = !ok;
      if (ok) shown++;
    });
    $$('.era').forEach(function (s) {
      var vis = $$('.dr-wrap', s).some(function (w) { return !w.hidden; });
      s.hidden = !vis;
      var r = $('[data-rail="' + s.dataset.era + '"]');
      if (r) r.hidden = !vis;
    });
    $('#fp-count').textContent = shown + ' / ' + items().length + ' ' + (T.shown || 'shown');
    $('#empty').classList.toggle('on', shown === 0);
    $('#empty-q').textContent = q ? '“' + state.q.trim() + '”' : (T.emptyThese || 'these filters');
    paint();
  }

  function paint() {
    var all = items(), total = all.length;
    var done = all.filter(function (x) { return prog[x.id]; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    $('#n-done').textContent = done;
    $('#n-total').textContent = '/ ' + total;
    $('#n-pct').textContent = pct;
    $('#n-left').textContent = total - done;
    $('#bar').style.width = pct + '%';
    $('#mini-num').textContent = done + '/' + total;
    $('#mini-fill').style.width = pct + '%';
    DATA.eras.forEach(function (era, i) {
      var slug = 'era-' + i;
      var its = era.items.filter(function (x) { return x.kind === 'it'; });
      var d = its.filter(function (x) { return prog[x.id]; }).length;
      var m = $('[data-rail-m="' + slug + '"]'); if (m) m.textContent = d + '/' + its.length;
      var f = $('[data-rail-f="' + slug + '"]'); if (f) f.style.width = (its.length ? d / its.length * 100 : 0) + '%';
      var h = $('[data-era-m="' + slug + '"]'); if (h) h.textContent = d + ' / ' + its.length + ' ' + (T.read || 'read').toLowerCase() + ';'
      var a = $('[data-rail="' + slug + '"]');
      if (a) a.classList.toggle('on', d === its.length && its.length > 0);
    });
  }

  function toggle(btn) {
    var id = btn.closest('.dr-wrap').dataset.id;
    if (prog[id]) delete prog[id]; else prog[id] = 1;
    save();
    localStorage.setItem('cg_last', JSON.stringify({ u: 'dossier', t: Date.now() }));
    btn.setAttribute('aria-checked', prog[id] ? 'true' : 'false');
    btn.closest('.dr').classList.toggle('done', !!prog[id]);
    apply();
  }

  function wire() {
    document.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-check]');
      if (c) { toggle(c); return; }
      var f = ev.target.closest('[data-f]');
      if (f) {
        var on = f.getAttribute('aria-checked') !== 'true';
        f.setAttribute('aria-checked', on ? 'true' : 'false');
        state.kinds[f.dataset.v] = on;
        apply(); return;
      }
      var bulk = ev.target.closest('[data-bulk]');
      if (bulk) {
        var want = bulk.dataset.bulk === 'all';
        $$('[data-f]').forEach(function (b) {
          b.setAttribute('aria-checked', want ? 'true' : 'false');
          state.kinds[b.dataset.v] = want;
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
        if (c) { ev.preventDefault(); toggle(c); }
      }
      if (ev.key === '/' && document.activeElement.tagName !== 'INPUT') {
        ev.preventDefault(); $('#q').focus();
      }
    });

    var box = $('#q'), pending;
    box.addEventListener('input', function () {
      state.q = box.value;
      box.parentNode.classList.toggle('has-value', !!box.value);
      clearTimeout(pending);
      pending = setTimeout(apply, 90);
    });
    $('#q-clear').addEventListener('click', function () {
      box.value = ''; state.q = ''; box.parentNode.classList.remove('has-value');
      box.focus(); apply();
    });

    var hd = $('#hide-done');
    hd.addEventListener('click', function () {
      state.hideDone = !state.hideDone;
      hd.setAttribute('aria-pressed', state.hideDone ? 'true' : 'false');
      apply();
    });

    $('[data-resume]').addEventListener('click', function () {
      var next = $$('.dr-wrap').filter(function (w) {
        return !w.hidden && !w.classList.contains('is-screen') && !prog[w.dataset.id];
      })[0];
      if (!next) return;
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var d = $('.dr', next);
      d.classList.add('hit');
      setTimeout(function () { d.classList.remove('hit'); }, 2000);
    });

    $('#export').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, dossier: prog }, null, 2)],
        { type: 'application/json' }));
      a.download = 'chronologeek-dossier.json';
      a.click(); URL.revokeObjectURL(a.href);
    });
    $('#import').addEventListener('click', function () { $('#import-file').click(); });
    $('#import-file').addEventListener('change', function (ev) {
      var f = ev.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          prog = d.dossier || d; save();
          $$('.dr-wrap:not(.is-screen)').forEach(function (w) {
            var on = !!prog[w.dataset.id];
            $('.dr', w).classList.toggle('done', on);
            $('[data-check]', w).setAttribute('aria-checked', on ? 'true' : 'false');
          });
          apply();
        } catch (e) { alert(T.badFile || 'Unreadable file.'); }
      };
      r.readAsText(f); ev.target.value = '';
    });

    $('#reset').addEventListener('click', function () {
      if (!confirm(T.resetMsg || 'Reset your Deep Dive progress?')) return;
      prog = {}; save();
      $$('.dr-wrap:not(.is-screen)').forEach(function (w) {
        $('.dr', w).classList.remove('done');
        $('[data-check]', w).setAttribute('aria-checked', 'false');
      });
      apply();
    });

    $('#clear-filters').addEventListener('click', function () {
      state.q = ''; $('#q').value = '';
      $('#q').parentNode.classList.remove('has-value');
      state.hideDone = false;
      $('#hide-done').setAttribute('aria-pressed', 'false');
      $$('[data-f]').forEach(function (b) {
        b.setAttribute('aria-checked', 'true');
        state.kinds[b.dataset.v] = true;
      });
      apply();
    });
  }

  grab('CG_DATA', window.CG && window.CG.data).then(function (d) {
    DATA = d;
    $('#intro').innerHTML = d.intro || '';
    build(); wire(); apply();
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(function () {
        el.scrollIntoView({ block: 'center' }); el.classList.add('hit');
      }, 120);
    }
  });
})();
