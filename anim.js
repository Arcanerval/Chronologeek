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
    /* halo qui suit la souris, très léger, derrière tout le contenu */
    '#cg-glow{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;',
    '  transition:opacity .6s ease;',
    '  background:radial-gradient(420px circle at var(--mx,50%) var(--my,30%),',
    '  rgba(124,106,247,.13),transparent 70%)}',
    '#cg-glow.on{opacity:1}',

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

  /* ── halo qui suit la souris (ordinateur uniquement) ───── */
  if (fine) {
    var glow = document.createElement('div');
    glow.id = 'cg-glow';
    document.body.appendChild(glow);
    var x = 0, y = 0, pending = false;
    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        glow.style.setProperty('--mx', x + 'px');
        glow.style.setProperty('--my', y + 'px');
        glow.classList.add('on');
        pending = false;
      });
    }, { passive: true });
  }

  /* ── point rouge à côté de la progression ──────────────── */
  function liveDot() {
    var targets = document.querySelectorAll('.pb-label,.pnum,.rd-note');
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
