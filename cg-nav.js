/* ═══════════════════════════════════════════════════════════
   CHRONOLOGEEK — menu mobile
   Le bouton .burger existe dans le <header> de toutes les pages depuis la
   refonte, et cg.css l'affiche sous 820 px — mais plus aucun script ne
   l'écoutait, donc sous 820 px la nav était simplement introuvable
   (.nav-links passe en display:none). Ce fichier rebranche le bouton.

   Principe repris des autres composants : on ne recrée aucun lien, on
   révèle .nav-links telle quelle. Les href, les aria-current et les
   libellés traduits de la page restent ceux de la page.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var burger = document.querySelector('.burger');
  var links  = document.querySelector('.nav-links');
  var header = document.querySelector('header');
  if (!burger || !links || !header) return;

  var T = (window.CG && window.CG.t) || {};
  var FR = document.documentElement.lang === 'fr' ||
           location.pathname.indexOf('/fr/') === 0;

  links.id = links.id || 'cg-navmenu';
  burger.setAttribute('aria-controls', links.id);
  burger.setAttribute('aria-expanded', 'false');
  if (!burger.getAttribute('aria-label')) {
    burger.setAttribute('aria-label', T.menu || (FR ? 'Ouvrir le menu' : 'Open menu'));
  }

  function open()  { setState(true); }
  function close() { setState(false); }
  function setState(on) {
    header.classList.toggle('nav-open', on);
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) {
      var first = links.querySelector('a');
      if (first) first.focus();
    }
  }
  function isOpen() { return header.classList.contains('nav-open'); }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    setState(!isOpen());
  });

  // Un lien choisi ferme le menu : sur les ancres internes (#era) la page ne
  // se recharge pas, le panneau resterait ouvert par-dessus le contenu.
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { close(); burger.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (isOpen() && !links.contains(e.target) && !burger.contains(e.target)) close();
  });

  // Repasser en desktop pendant que le menu est ouvert laisserait la classe
  // posée, et .nav-open s'appliquerait à une barre déjà horizontale.
  var mq = window.matchMedia('(min-width:821px)');
  var onChange = function (m) { if (m.matches) close(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
