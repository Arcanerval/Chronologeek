/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — À VENIR
   Reprend le rendu de upcoming.html : radar.json est lu à chaud,
   rien n'est figé dans la page. radar.py réécrit radar.json toutes
   les 6 h, la page suit sans être régénérée.
   Ajouts : colonnes par univers, compte à rebours, recherche.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CG = window.CG || {};
  var T = CG.t || {};
  var FR = document.documentElement.lang === 'fr';

  var UNI = [['starwars', 'Star Wars', '#4d9fff'], ['marvel', 'Marvel', '#e23636'],
             ['dc', 'DC', '#f5c842'], ['avatar', 'Avatar', '#7dd3fc']];

  // couleurs et libellés repris tels quels de upcoming.html
  var COL = { film: '#64b5f6', tv: '#81c784', comic: '#fb923c', novel: '#a78bfa',
              game: '#ffb74d', book: '#94a3b8', video: '#f472b6',
              special: '#ffa726', other: '#6b7280' };
  var LBL = CG.kinds || (FR
    ? { film: 'Film', tv: 'Série', comic: 'Comic', novel: 'Roman', game: 'Jeu vidéo',
        book: 'Livre', video: 'Vidéo', special: 'Spécial', other: 'Autre' }
    : { film: 'Movie', tv: 'TV show', comic: 'Comic', novel: 'Novel', game: 'Video game',
        book: 'Book', video: 'Video', special: 'Special', other: 'Other' });

  var NONLATIN = /[぀-ヿ㐀-鿿가-힯Ѐ-ӿ֐-ۿ]/;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Le champ `kind` est corrompu pour quelques entrées Avatar (type collé à
  // « Chronology: »). `kindKey` est propre — on le préfère, et on ne retombe
  // sur la table de correspondance de upcoming.html qu'à défaut.
  var MATCH = [['graphic', 'comic'], ['comic', 'comic'], ['jeu', 'game'], ['game', 'game'],
               ['roman', 'novel'], ['novel', 'novel'], ['young', 'novel'], ['junior', 'novel'],
               ['nouvelle', 'book'], ['short', 'book'], ['livre', 'book'], ['book', 'book'],
               ['audio', 'video'], ['vid', 'video'], ['spécial', 'special'], ['special', 'special'],
               ['promo', 'special'], ['épisode', 'tv'], ['episode', 'tv'], ['série', 'tv'],
               ['serie', 'tv'], ['tv', 'tv'], ['film', 'film'], ['movie', 'film']];

  function keyOf(e) {
    if (e.kindKey) return e.kindKey;
    var k = (e.kind || '').toLowerCase();
    for (var i = 0; i < MATCH.length; i++) {
      if (k.indexOf(MATCH[i][0]) > -1) return MATCH[i][1];
    }
    return 'other';
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  function fmt(e) {
    if (FR) return e.date_txt || '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.date_sort || '');
    if (!m) return e.date_txt || '';
    return MON[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + m[1];
  }

  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function countdown(d) {
    var t = new Date(d);
    if (isNaN(t)) return '';
    var n = Math.round((t - TODAY) / 86400000);
    if (n <= 0) return T.outNow || 'out now';
    if (n === 1) return T.tomorrow || 'tomorrow';
    if (n < 31) return (T.inDays || 'in {n} d').replace('{n}', n);
    if (n < 365) return (T.inMonths || 'in {n} mo').replace('{n}', Math.round(n / 30));
    return (T.inYears || 'in {n} y').replace('{n}', (n / 365).toFixed(1));
  }

  var host = document.getElementById('rd-body');
  if (!host) return;

  fetch('/radar.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(render)
    .catch(function () {
      host.innerHTML = '<p class="rd-note">' + (T.loadFail || 'Failed to load.') + '</p>';
    });

  function render(data) {
    var total = 0;
    var grid = UNI.map(function (u) {
      var list = data.filter(function (e) { return e.universe === u[0]; })
        .sort(function (a, b) {
          return (a.date_sort || '').localeCompare(b.date_sort || '');
        });
      total += list.length;

      var rows = list.map(function (e) {
        var key = keyOf(e);
        var title = (FR && e.title_fr && !NONLATIN.test(e.title_fr)) ? e.title_fr : e.title;
        var syn = '', enMark = false;
        if (FR) { if (e.syn_fr) { syn = e.syn_fr; } else if (e.syn) { syn = e.syn; enMark = true; } }
        else { syn = e.syn || ''; }

        var head =
          '<span class="uc-top"><span class="uc-d">' + esc(fmt(e)) + '</span>' +
            '<span class="uc-c">' + countdown(e.date_sort) + '</span></span>' +
          '<span class="uc-t">' + esc(title) + '</span>' +
          '<span class="uc-tags">' +
            '<span class="rd-k" style="--k:' + (COL[key] || COL.other) + '">' +
              esc(LBL[key] || e.kind || '') + '</span>' +
            (e.era ? '<span class="dim">' + esc(e.era) + '</span>' : '') +
          '</span>';

        var body = syn
          ? '<details class="uc-row"><summary>' + head +
              '<span class="uc-chev" aria-hidden="true">▾</span></summary>' +
              '<p class="uc-syn">' + (enMark ? '<span class="uc-en">EN</span> ' : '') +
              esc(syn) + '</p></details>'
          : '<div class="uc-row">' + head + '</div>';

        return '<li class="uc-li" data-title="' +
          esc((title + ' ' + (LBL[key] || '')).toLowerCase()).replace(/"/g, '') + '">' +
          body + '</li>';
      }).join('');

      if (!rows) {
        rows = '<li class="uc-li"><div class="uc-row"><span class="uc-t">' +
               (T.emptyH || 'Nothing') + '</span></div></li>';
      }
      return '<div class="ucol" style="--uc:' + u[2] + '" data-u="' + u[0] + '">' +
        '<h2 class="ucol-head">' + u[1] + '<span class="ucol-n">' + list.length + '</span></h2>' +
        '<ol class="ucol-list">' + rows + '</ol></div>';
    }).join('');

    host.innerHTML = '<div class="ugrid-cols">' + grid + '</div>' +
                     '<p class="rd-note">' + (T.rdNote || '') + '</p>';
    document.getElementById('up-count').textContent =
      total + ' ' + (total === 1 ? (T.release || 'release') : (T.releases || 'releases'));
    wire();
  }

  function wire() {
    var q = document.getElementById('q');
    var lis = [].slice.call(document.querySelectorAll('.uc-li'));
    var t;

    function apply() {
      var v = q.value.trim().toLowerCase(), n = 0;
      lis.forEach(function (li) {
        var ok = !v || (li.dataset.title || '').indexOf(v) !== -1;
        li.hidden = !ok;
        if (ok) n++;
      });
      [].forEach.call(document.querySelectorAll('.ucol'), function (c) {
        c.hidden = ![].slice.call(c.querySelectorAll('.uc-li'))
                       .some(function (li) { return !li.hidden; });
      });
      document.getElementById('up-count').textContent =
        n + ' ' + (n === 1 ? (T.release || 'release') : (T.releases || 'releases'));
      var em = document.getElementById('empty');
      if (em) {
        em.classList.toggle('on', n === 0);
        document.getElementById('empty-q').textContent =
          v ? '“' + q.value.trim() + '”' : (T.emptyThat || 'that');
      }
      q.parentNode.classList.toggle('has-value', !!q.value);
    }

    q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(apply, 90); });
    document.getElementById('q-clear').addEventListener('click', function () {
      q.value = ''; apply(); q.focus();
    });
    addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault(); q.focus();
      }
    });
  }
})();
