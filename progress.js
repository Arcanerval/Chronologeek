// ═══════════════════════════════════════════════════════════
// CHRONOLOGEEK — Bloc progression
// Reconstruit .progress-block et tient les compteurs a jour.
// Le temps restant vient de la table RT injectee par runtime.py ;
// si RT est absente, le compteur d'heures se masque simplement.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var COLORS = { sw: '#4d9fff', mcu: '#e23636', dc: '#f5c842', avatar: '#7dd3fc' };

  var FR = document.documentElement.lang === 'fr' ||
           location.pathname.indexOf('/fr/') === 0;

  var T = FR ? {
    eyebrow: 'Ma progression', watched: 'vus', left: 'restantes', done: 'terminé',
    resume: 'Reprendre', badges: 'Badges', reset: 'Remettre à zéro',
    hint: 'Cochez votre progression, elle est sauvegardée sur ce navigateur',
    unknown: 'Durée inconnue pour certaines entrées'
  } : {
    eyebrow: 'My progress', watched: 'watched', left: 'left', done: 'done',
    resume: 'Resume', badges: 'Badges', reset: 'Reset',
    hint: 'Check off your progress — it stays saved in this browser',
    unknown: 'No runtime data for some entries'
  };

  // ── couleur de l'univers ─────────────────────────────────
  function accent() {
    var u = (document.body && document.body.dataset.universe) || '';
    if (COLORS[u]) return COLORS[u];
    var v = getComputedStyle(document.documentElement)
              .getPropertyValue('--tl-color').trim();
    return (v && v.charAt(0) === '#') ? v : '#7c6af7';
  }

  function paintAccent() {
    var c = accent();
    var r = parseInt(c.slice(1, 3), 16),
        g = parseInt(c.slice(3, 5), 16),
        b = parseInt(c.slice(5, 7), 16);
    var s = document.documentElement.style;
    s.setProperty('--tl', c);
    s.setProperty('--tl-soft', 'rgba(' + r + ',' + g + ',' + b + ',.14)');
    s.setProperty('--tl-glow', 'rgba(' + r + ',' + g + ',' + b + ',.5)');
  }

  // ── titre de l'univers, pour l'eyebrow ───────────────────
  function universeName() {
    var el = document.getElementById('tl-title') ||
             document.querySelector('.page-title');
    var txt = el ? el.textContent.trim() : '';
    return txt.split('\n')[0].slice(0, 40);
  }

  var ICONS = {
    resume: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    badges: '<path d="M8 21h8M12 17v4M17 4H7v6a5 5 0 0 0 10 0V4zM7 5H4v2a4 4 0 0 0 3 3.9M17 5h3v2a4 4 0 0 1-3 3.9"/>',
    reset:  '<path d="M20 11A8 8 0 1 0 7 17.7M20 5v6h-6"/>'
  };

  function btn(id, icon, label, cls) {
    return '<button type="button" id="' + id + '"' +
           (cls ? ' class="' + cls + '"' : '') + '>' +
           '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[icon] +
           '</svg><span>' + label + '</span></button>';
  }

  function build() {
    var pb = document.querySelector('.progress-block');
    if (!pb || pb.dataset.cgv === '2') return false;
    pb.dataset.cgv = '2';

    var name = universeName();

    pb.innerHTML =
      '<div class="pb-head"><div class="pb-eyebrow">' + T.eyebrow +
        (name ? ' · <em>' + name + '</em>' : '') + '</div></div>' +

      '<div class="pb-body">' +
        '<div class="pb-reads">' +
          '<div class="rd">' +
            '<div class="rd-val"><span id="cg-done">0</span>' +
            '<span class="of" id="cg-total">/ 0</span></div>' +
            '<div class="rd-lab">' + T.watched + '</div>' +
          '</div>' +
          '<div class="rd is-time" id="cg-rd-time" hidden>' +
            '<div class="rd-val"><span id="cg-h">0</span>' +
            '<span class="u" id="cg-hu">h</span>' +
            '<span class="rd-star" id="cg-star" hidden title="' + T.unknown + '">*</span></div>' +
            '<div class="rd-lab">' + T.left + '</div>' +
          '</div>' +
          '<div class="rd is-done">' +
            '<div class="rd-val"><span id="cg-pct">0</span><span class="u">%</span></div>' +
            '<div class="rd-lab">' + T.done + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pb-acts">' +
          btn('cg-b-resume', 'resume', T.resume) +
          btn('cg-b-badges', 'badges', T.badges) +
          btn('cg-b-reset', 'reset', T.reset, 'pb-danger') +
        '</div>' +
      '</div>' +

      '<div class="pb-bar"><div class="pb-bar-fill" id="cg-fill"></div></div>' +
      '<div class="pb-hint">' + T.hint + '</div>' +

      // Noeuds conserves : le code des pages ecrit encore dedans.
      '<div class="pb-legacy"><div id="pb-fill"></div>' +
      '<span id="pb-counts"></span></div>';

    document.getElementById('cg-b-resume').onclick = function () {
      if (typeof window.cgResume === 'function') window.cgResume();
    };
    document.getElementById('cg-b-badges').onclick = function () {
      if (typeof window.openBadgeModal === 'function') window.openBadgeModal();
    };
    document.getElementById('cg-b-reset').onclick = function () {
      if (typeof window.resetProgress === 'function') window.resetProgress();
    };
    return true;
  }

  // ── mise a jour des chiffres ─────────────────────────────
  function fmtInt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, FR ? '\u202f' : ',');
  }

  // runtime.py declare la table avec `const RT`. Un const de premier niveau
  // vit dans la portee lexicale globale et n'apparait PAS sur window : on lit
  // donc l'identifiant nu, protege par typeof (qui ne leve jamais).
  function table() {
    if (typeof RT !== 'undefined' && RT) return RT;
    if (window.RT) return window.RT;
    return null;
  }

  function paint() {
    var el = document.getElementById('cg-done');
    if (!el) return;

    var rows = document.querySelectorAll('.en[data-id]');
    var RT = table();
    var total = 0, done = 0, left = 0, unknown = 0;

    for (var i = 0; i < rows.length; i++) {
      total++;
      if (rows[i].classList.contains('done')) { done++; continue; }
      if (!RT) continue;
      var v = RT[rows[i].dataset.id];
      if (v === undefined || v === null) { unknown++; continue; }
      left += v;
    }

    var pct = total ? Math.round(done / total * 100) : 0;
    el.textContent = done;
    document.getElementById('cg-total').textContent = '/ ' + total;
    document.getElementById('cg-pct').textContent = pct;
    document.getElementById('cg-fill').style.width = pct + '%';

    var time = document.getElementById('cg-rd-time');
    if (!RT) { time.hidden = true; return; }
    time.hidden = false;
    document.getElementById('cg-h').textContent =
      left >= 60 ? fmtInt(Math.floor(left / 60)) : left;
    document.getElementById('cg-hu').textContent = left >= 60 ? 'h' : 'min';
    document.getElementById('cg-star').hidden = !unknown;
  }

  // ── branchement sur le rendu existant des pages ──────────
  function hook() {
    if (typeof window.renderProgress !== 'function' ||
        window.renderProgress.cgWrapped) return;
    var orig = window.renderProgress;
    var wrapped = function () {
      var out = orig.apply(this, arguments);
      paint();
      return out;
    };
    wrapped.cgWrapped = true;
    window.renderProgress = wrapped;
  }

  function start() {
    paintAccent();
    build();
    hook();
    paint();

    // La timeline peut etre construite apres nous : on repeint
    // quand des entrees arrivent. On ignore les mutations venant du
    // bloc lui-meme, sinon nos propres ecritures relanceraient la boucle.
    var block = document.querySelector('.progress-block');
    var pending = null;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (block && block.contains(muts[i].target)) continue;
        hook();
        clearTimeout(pending);
        pending = setTimeout(paint, 60);
        return;
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.cgPaintProgress = paint;
})();
