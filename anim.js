/* Chronologeek — animations discrètes, partagées par toutes les pages.
   Tout est désactivé si le système demande de réduire les animations. */
(function () {
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var fine = !window.matchMedia || window.matchMedia('(pointer: fine)').matches;

  /* ── styles ────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    /* curseur personnalisé */
    'html.cg-cursor,html.cg-cursor *{cursor:none !important}',
    'html.cg-cursor input,html.cg-cursor textarea{cursor:text !important}',
    '#cg-dot,#cg-ring{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;',
    '  border-radius:50%;will-change:transform;opacity:0;transition:opacity .25s}',
    '#cg-dot{width:6px;height:6px;margin:-3px 0 0 -3px;background:#f0f0ff}',
    '#cg-ring{width:30px;height:30px;margin:-15px 0 0 -15px;border:1.5px solid rgba(124,106,247,.75);',
    '  transition:opacity .25s,width .2s,height .2s,margin .2s,border-color .2s,background .2s}',
    '#cg-dot.on,#cg-ring.on{opacity:1}',
    '#cg-ring.hot{width:46px;height:46px;margin:-23px 0 0 -23px;',
    '  border-color:rgba(240,98,146,.9);background:rgba(124,106,247,.12)}',
    '#cg-ring.tap{width:20px;height:20px;margin:-10px 0 0 -10px}',
    /* point rouge « en direct » */
    '.cg-live{display:inline-block;width:7px;height:7px;border-radius:50%;',
    '  background:#ff4d5a;margin-right:.45rem;vertical-align:middle;',
    '  box-shadow:0 0 0 0 rgba(255,77,90,.7);animation:cgPulse 2s infinite}',
    '@keyframes cgPulse{',
    '  0%{box-shadow:0 0 0 0 rgba(255,77,90,.65)}',
    '  70%{box-shadow:0 0 0 7px rgba(255,77,90,0)}',
    '  100%{box-shadow:0 0 0 0 rgba(255,77,90,0)}}',

    /* lueur au survol des boutons et pastilles */
    '.fbt,.chip,.preset,.presume,.tab,.lang-btn,.ucard{transition:',
    '  box-shadow .25s ease,transform .25s ease,border-color .25s ease}',
    '.fbt:hover,.chip:hover,.preset:hover,.presume:hover,.tab:hover{',
    '  box-shadow:0 0 16px rgba(124,106,247,.35)}',
    '.ucard:hover{box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 22px rgba(124,106,247,.22)}',

    /* apparition au défilement */
    '.cg-anim .en,.cg-anim .it,.cg-anim .rd-card,.cg-anim .ucard{',
    '  opacity:0;transform:translateY(10px);',
    '  transition:opacity .5s ease,transform .5s ease}',
    '.cg-anim .en.cg-in,.cg-anim .it.cg-in,.cg-anim .rd-card.cg-in,',
    '.cg-anim .ucard.cg-in{opacity:1;transform:none}'
  ].join('');
  document.head.appendChild(css);

  /* ── curseur personnalisé (ordinateur uniquement) ──────── */
  if (fine) {
    var dot = document.createElement('div'); dot.id = 'cg-dot';
    var ring = document.createElement('div'); ring.id = 'cg-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('cg-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100, started = false;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!started) {
        started = true; rx = mx; ry = my;
        dot.classList.add('on'); ring.classList.add('on');
      }
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    var HOT = 'a,button,.chip,.fbt,.ck,.tab,.lang-btn,.ucard,.burger,summary,' +
              '.preset,.presume,input,select,[onclick],[role="button"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOT)) ring.classList.add('hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOT)) ring.classList.remove('hot');
    });
    document.addEventListener('mousedown', function () { ring.classList.add('tap'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('tap'); });
    document.addEventListener('mouseleave', function () {
      dot.classList.remove('on'); ring.classList.remove('on');
    });
    document.addEventListener('mouseenter', function () {
      if (started) { dot.classList.add('on'); ring.classList.add('on'); }
    });
  }

  /* ── point rouge à côté de la progression ──────────────── */
  function liveDot() {
    var targets = document.querySelectorAll('.pb-label,.pnum,.rd-note,#pbn-label');
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (t.querySelector('.cg-live')) continue;
      var dot = document.createElement('i');
      dot.className = 'cg-live';
      t.insertBefore(dot, t.firstChild);
    }
  }

  /* ── apparition au défilement ──────────────────────────── */
  var io = null;
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('cg-anim');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('cg-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
  }

  function scan() {
    liveDot();
    if (!io) return;
    var els = document.querySelectorAll('.en:not(.cg-in),.it:not(.cg-in),' +
                                        '.rd-card:not(.cg-in),.ucard:not(.cg-in)');
    for (var i = 0; i < els.length; i++) {
      if (els[i].dataset.cgSeen) continue;
      els[i].dataset.cgSeen = '1';
      io.observe(els[i]);
    }
  }

  /* filet de sécurité : rien ne doit rester invisible */
  function revealAll() {
    document.documentElement.classList.remove('cg-anim');
  }

  scan();
  ['DOMContentLoaded', 'load'].forEach(function (ev) {
    window.addEventListener(ev, scan);
  });
  [300, 900, 2000].forEach(function (d) { setTimeout(scan, d); });
  setTimeout(revealAll, 8000);          // si un rendu tardif échappe à l'observateur

  if ('MutationObserver' in window) {
    new MutationObserver(function () { scan(); })
      .observe(document.body, { childList: true, subtree: true });
  }
})();
