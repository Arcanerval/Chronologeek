// Chronologeek PWA — enregistrement du service worker
//
// La bannière d'installation vivait ici jusqu'au 19 août 2026. Elle a été
// retirée : `app.js` (produit depuis `_proto/e-app.js`) en porte une autre,
// avec ses trois discours — Windows, Android, Apple. Les deux se posaient
// l'une par-dessus l'autre, et fermer celle du dessus révélait la seconde.
// Ne pas la remettre ici : une seule barre, et elle est dans `e-app.js`.
(function(){
  if (!('serviceWorker' in navigator)) { console.warn('[CG PWA] serviceWorker non supporté'); return; }
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('[CG PWA] Service worker enregistré ✓', reg.scope);
    // Auto-update : re-vérifie le SW quand on revient sur l'app + toutes les heures
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(()=>{});
    });
    setInterval(() => reg.update().catch(()=>{}), 3600000);
  }).catch(err => console.error('[CG PWA] Échec service worker ✗', err));
})();
