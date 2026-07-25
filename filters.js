// ═══════════════════════════════════════════════════════════
// CHRONOLOGEEK — Panneau de filtres
// Fusionne #tl-legend et la barre de filtres (.filter-bar sur
// Star Wars et Marvel, .filter-row sur DC) en un seul panneau.
//
// Principe : on DEPLACE les boutons existants au lieu d'en creer
// de nouveaux. Ils gardent leur id, leur onclick et leur classe
// .active, donc applyFilters() / applyLevelFilter() des pages
// continuent de fonctionner sans modification.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var FR = document.documentElement.lang === 'fr' ||
           location.pathname.indexOf('/fr/') === 0;

  var T = FR ? {
    title: 'Afficher', hint: 'Décochez pour masquer de la timeline',
    types: 'Types de média', levels: 'Niveau', branches: 'Branches',
    opts: 'Options', all: 'tout', none: 'aucun',
    marks: 'Repères', shown: 'affichées'
  } : {
    title: 'Show', hint: 'Uncheck to hide from the timeline',
    types: 'Media types', levels: 'Level', branches: 'Branches',
    opts: 'Options', all: 'all', none: 'none',
    marks: 'Markers', shown: 'shown'
  };

  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var LEVEL_IDS = ['lvl-must', 'lvl-imp', 'lvl-bonus', 'fbt-imp', 'fbt-bonus'];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ── couleur d'une case ───────────────────────────────────
  // Pour un type : on reprend la couleur de sa pastille de legende,
  // reperee par le libelle identique. Pour une branche DC : la
  // couleur est deja en style inline sur le bouton.
  function colorFor(btn, legend) {
    if (btn.style && btn.style.color) return btn.style.color;
    if (!legend) return '';
    var label = btn.textContent.trim().toLowerCase();
    var badges = legend.querySelectorAll('.b');
    for (var i = 0; i < badges.length; i++) {
      if (badges[i].textContent.trim().toLowerCase() === label) {
        return getComputedStyle(badges[i]).color;
      }
    }
    return '';
  }

  // ── habillage d'un bouton en case a cocher ───────────────
  function dress(btn, color) {
    if (btn.dataset.fpDressed) return;
    btn.dataset.fpDressed = '1';
    var label = btn.innerHTML;
    btn.innerHTML = '<span class="fp-box">' + CHECK + '</span>' +
      (color ? '<span class="fp-dot" style="background:' + color + '"></span>' : '') +
      '<span class="fp-txt">' + label + '</span>';
    if (color) btn.style.setProperty('--ck', color);
    btn.style.borderColor = '';       // DC posait la couleur en inline
    btn.style.color = '';
    btn.setAttribute('role', 'checkbox');
    btn.setAttribute('aria-checked', btn.classList.contains('active'));
  }

  function section(labelText, buttons, panelBody) {
    if (!buttons.length) return;
    var sec = el('div', 'fp-sec');
    var head = el('div', 'fp-sec-head',
      '<span class="fp-sec-lab">' + labelText + '</span>');
    var bulk = el('span', 'fp-bulk',
      '<button type="button" data-fp-all="1">' + T.all + '</button>' +
      '<button type="button" data-fp-none="1">' + T.none + '</button>');
    head.appendChild(bulk);
    var row = el('div', 'fp-row');
    buttons.forEach(function (b) { row.appendChild(b); });
    sec.appendChild(head);
    sec.appendChild(row);
    panelBody.appendChild(sec);
  }

  function build() {
    var bar = document.querySelector('.filter-bar, .filter-row');
    if (!bar) return false;
    var buttons = [].slice.call(bar.querySelectorAll('.fbt'));
    if (!buttons.length) return false;

    var legend = document.getElementById('tl-legend');
    var old = document.querySelector('.fp');
    if (old) old.parentNode.removeChild(old);

    // classement
    var g = { types: [], levels: [], branches: [], opts: [] };
    buttons.forEach(function (b) {
      if (b.classList.contains('type-filter-btn')) g.types.push(b);
      else if (b.dataset.univ) g.branches.push(b);
      else if (LEVEL_IDS.indexOf(b.id) !== -1) g.levels.push(b);
      else g.opts.push(b);
    });

    buttons.forEach(function (b) { dress(b, colorFor(b, legend)); });

    // panneau
    var fp = el('div', 'fp');
    var head = el('div', 'fp-head',
      '<span class="fp-title">' + T.title + '</span>' +
      '<span class="fp-hint"><svg viewBox="0 0 24 24">' +
      '<path d="M9 11l3 3L22 4"/>' +
      '<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' +
      '</svg>' + T.hint + '</span>' +
      '<span class="fp-count" id="fp-count"></span>');
    fp.appendChild(head);

    var body = el('div', 'fp-body');
    section(T.branches, g.branches, body);
    section(T.types, g.types, body);
    section(T.levels, g.levels, body);
    section(T.opts, g.opts, body);
    fp.appendChild(body);

    // bande des reperes : ce que la legende disait et qui n'est pas filtrable
    if (legend) {
      var marks = el('div', 'fp-marks',
        '<span class="fp-marks-lab">' + T.marks + '</span>');
      var kept = 0;
      // Marvel regroupe ses marqueurs dans un div intermediaire : on aplatit
      // pour ne perdre ni FLASHBACK ni CANONICITE ni TERRE-XXXX.
      function harvest(parent) {
        [].slice.call(parent.children).forEach(function (c) {
          if (c.classList.contains('b')) return;            // doublon des cases
          if (c.classList.contains('leg-title')) return;
          var t = c.textContent || '';
          if (!t.trim()) return;
          if (c.children.length && c.tagName === 'DIV') return harvest(c);
          if (t.indexOf('⭐') !== -1 || t.indexOf('🚨') !== -1) return;  // deja en cases
          marks.appendChild(c);
          kept++;
        });
      }
      harvest(legend);
      if (kept) fp.appendChild(marks);
      legend.classList.add('fp-source');
    }

    bar.classList.add('fp-source');
    bar.parentNode.insertBefore(fp, bar);
    recount();
    return true;
  }

  // ── compteur d'entrees visibles ──────────────────────────
  // DC masque des colonnes entieres plutot que les entrees une a une :
  // on remonte la chaine des parents pour savoir si une entree est visible.
  function hidden(node) {
    for (var n = node; n && n !== document.body; n = n.parentElement) {
      if (n.style && n.style.display === 'none') return true;
    }
    return false;
  }

  function recount() {
    var out = document.getElementById('fp-count');
    if (!out) return;
    var rows = document.querySelectorAll('.en[data-id]');
    var shown = 0;
    for (var i = 0; i < rows.length; i++) {
      if (!hidden(rows[i])) shown++;
    }
    out.textContent = shown + ' / ' + rows.length + ' ' + T.shown;
    var fp = document.querySelector('.fp');
    if (fp) {
      [].slice.call(fp.querySelectorAll('.fbt')).forEach(function (b) {
        b.setAttribute('aria-checked', b.classList.contains('active'));
      });
    }
  }

  // ── interactions ─────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var fp = e.target.closest ? e.target.closest('.fp') : null;
    if (!fp) return;

    var bulk = e.target.closest('[data-fp-all],[data-fp-none]');
    if (bulk) {
      var want = !!bulk.hasAttribute('data-fp-all');
      var sec = bulk.closest('.fp-sec');
      [].slice.call(sec.querySelectorAll('.fbt')).forEach(function (b) {
        // on passe par le clic du bouton : sa propre logique fait le filtrage
        if (b.classList.contains('active') !== want) b.click();
      });
      recount();
      return;
    }
    if (e.target.closest('.fbt')) { recount(); setTimeout(recount, 0); }
  });

  function start() {
    var built = build();
    var bar = document.querySelector('.filter-bar, .filter-row');
    if (bar) {
      // la barre est remplie par buildTimeline, parfois apres nous :
      // on observe uniquement la barre, jamais le panneau, donc nos
      // propres ecritures ne relancent rien.
      var pending = null;
      new MutationObserver(function () {
        clearTimeout(pending);
        pending = setTimeout(build, 40);
      }).observe(bar, { childList: true });
    }
    if (!built) setTimeout(build, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.cgRebuildFilters = build;
})();
