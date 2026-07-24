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
    /* curseur : la flèche du système, aux couleurs du site */
    'html.cg-cursor,html.cg-cursor *{cursor:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4Ij48ZmlsdGVyIGlkPSJzIj48ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMSIgc3RkRGV2aWF0aW9uPSIxLjIiIGZsb29kLWNvbG9yPSJyZ2JhKDEyNCwxMDYsMjQ3LC45KSIgZmxvb2Qtb3BhY2l0eT0iLjg1Ii8+PC9maWx0ZXI+PHBhdGggZD0iTTUgMi41IEw1IDIxIEw5LjcgMTYuNiBMMTIuNiAyMi40IEwxNS40IDIxIEwxMi41IDE1LjQgTDE5IDE1LjQgWiIgZmlsbD0iIzdjNmFmNyIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI3MpIi8+PC9zdmc+") 5 2,auto}',
    'html.cg-cursor a,html.cg-cursor button,html.cg-cursor summary,html.cg-cursor .chip,',
    'html.cg-cursor .fbt,html.cg-cursor .ck,html.cg-cursor .tab,html.cg-cursor .lang-btn,',
    'html.cg-cursor .ucard,html.cg-cursor .burger,html.cg-cursor [onclick],',
    'html.cg-cursor .preset,html.cg-cursor .presume{',
    '  cursor:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4Ij48ZmlsdGVyIGlkPSJzIj48ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMSIgc3RkRGV2aWF0aW9uPSIxLjIiIGZsb29kLWNvbG9yPSJyZ2JhKDI0MCw5OCwxNDYsLjkpIiBmbG9vZC1vcGFjaXR5PSIuODUiLz48L2ZpbHRlcj48cGF0aCBkPSJNNSAyLjUgTDUgMjEgTDkuNyAxNi42IEwxMi42IDIyLjQgTDE1LjQgMjEgTDEyLjUgMTUuNCBMMTkgMTUuNCBaIiBmaWxsPSIjZjA2MjkyIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWx0ZXI9InVybCgjcykiLz48L3N2Zz4=") 5 2,pointer}',
    'html.cg-cursor input,html.cg-cursor textarea{cursor:text}',
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

  if (fine) document.documentElement.classList.add('cg-cursor');

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
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var els = document.querySelectorAll('.en:not(.cg-in),.it:not(.cg-in),' +
                                        '.rd-card:not(.cg-in),.ucard:not(.cg-in)');
    for (var i = 0; i < els.length; i++) {
      if (els[i].dataset.cgSeen) continue;
      els[i].dataset.cgSeen = '1';
      var r = els[i].getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        els[i].classList.add('cg-in');   // déjà à l'écran : visible tout de suite
      } else {
        io.observe(els[i]);
      }
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
