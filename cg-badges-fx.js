/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — Confettis + toast de badge
   Porté à l'identique de badges.js (launchConfetti / showBadgeToast) :
   mêmes couleurs par univers, mêmes durées, mêmes animations.
   Exposé en global pour que app.js et dc.js s'en servent.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FR = document.documentElement.lang === 'fr';
  var T = FR
    ? { unlocked: 'Badge débloqué !' }
    : { unlocked: 'Badge unlocked!' };

  var CONFETTI_COLORS = {
    sw:     ['#ffe81f', '#fff', '#4ade80', '#60a5fa', '#f87171'],
    mcu:    ['#f43f5e', '#fbbf24', '#60a5fa', '#fff', '#a78bfa'],
    dc:     ['#1e90ff', '#ffd700', '#c084fc', '#22c55e', '#fff'],
    avatar: ['#4fc3f7', '#8bc34a', '#ff7043', '#b39ddb', '#fff']
  };

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function launchConfetti(universe, big) {
    if (reduce) return;
    var colors = CONFETTI_COLORS[universe] || ['#fff', '#ffd700', '#60a5fa'];
    var count = big ? 180 : 80;
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(box);

    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      var color = colors[Math.floor(Math.random() * colors.length)];
      var size = Math.random() * 8 + 4;
      el.style.cssText =
        'position:absolute;left:' + (Math.random() * 100) + 'vw;top:-10px;' +
        'width:' + size + 'px;height:' + (size * 1.4) + 'px;' +
        'background:' + color + ';' +
        'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
        'animation:cgFall ' + (1.2 + Math.random() * 1.2) + 's ' +
          (Math.random() * (big ? 0.8 : 0.4)) + 's ease-in forwards;' +
        'transform-origin:center;';
      box.appendChild(el);
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes cgFall{' +
      '0%{transform:translateY(0) rotate(0deg);opacity:1}' +
      '80%{opacity:1}' +
      '100%{transform:translateY(105vh) rotate(' +
        (Math.random() > 0.5 ? '' : '-') + '720deg);opacity:0}}';
    document.head.appendChild(style);
    setTimeout(function () { box.remove(); style.remove(); }, (big ? 2.5 : 2) * 1000);
  }

  function showBadgeToast(b) {
    var old = document.getElementById('cg-badge-toast');
    if (old) old.remove();

    var toast = document.createElement('div');
    toast.id = 'cg-badge-toast';
    toast.setAttribute('role', 'status');
    toast.style.cssText =
      'position:fixed;bottom:7rem;right:1.5rem;z-index:8000;' +
      'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
      'border:1px solid ' + b.color + ';border-radius:14px;padding:.85rem 1.1rem;' +
      'display:flex;align-items:center;gap:.75rem;' +
      'box-shadow:0 4px 30px rgba(0,0,0,.6),0 0 20px ' + b.color + '44;' +
      'animation:cgToastIn .4s cubic-bezier(.34,1.56,.64,1) forwards;max-width:280px';
    toast.innerHTML =
      '<div style="font-size:1.8rem;flex-shrink:0">' + b.icon + '</div><div>' +
        '<div style="font-size:.66rem;font-weight:700;letter-spacing:.1em;' +
          'text-transform:uppercase;color:' + b.color + ';margin-bottom:.15rem">' +
          T.unlocked + '</div>' +
        '<div style="font-size:.9rem;font-weight:700;color:#e8e8f4">' + b.label + '</div>' +
        '<div style="font-size:.76rem;color:#a0a0c0;margin-top:.1rem">' + b.desc + '</div>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '@keyframes cgToastIn{from{opacity:0;transform:translateX(60px)}' +
      'to{opacity:1;transform:translateX(0)}}' +
      '@keyframes cgToastOut{from{opacity:1;transform:translateX(0)}' +
      'to{opacity:0;transform:translateX(60px)}}';
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = 'cgToastOut .3s ease forwards';
      setTimeout(function () { toast.remove(); style.remove(); }, 300);
    }, 3500);
  }

  // Compare l'état des badges avant/après une coche et fête les nouveaux.
  // Le badge 100 % déclenche les gros confettis, comme en prod.
  window.cgBadgeFx = function (universe, before, after, defs) {
    var fired = 0;
    defs.forEach(function (b) {
      if (after[b.id] && !before[b.id]) {
        setTimeout(function () {
          showBadgeToast(b);
          launchConfetti(universe, b.trigger === '100pct');
        }, fired * 450);
        fired++;
      }
    });
    return fired;
  };
})();
