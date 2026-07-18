// Chronologeek PWA — enregistrement + bannière d'installation
(function(){
  const FR = document.documentElement.lang === 'fr' || location.pathname.startsWith('/fr/');
  const T = FR ? {
    title:'Installer Chronologeek',
    android:'progression et timelines, même hors-ligne',
    btn:'Installer',
    ios:'appuie sur <strong>Partager</strong> puis « Sur l\u2019écran d\u2019accueil »'
  } : {
    title:'Install Chronologeek',
    android:'your progress and timelines, even offline',
    btn:'Install',
    ios:'tap <strong>Share</strong> then \u201CAdd to Home Screen\u201D'
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('[CG PWA] Service worker enregistré ✓', reg.scope);
      // Auto-update : re-vérifie le SW quand on revient sur l'app + toutes les heures
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(()=>{});
      });
      setInterval(() => reg.update().catch(()=>{}), 3600000);
    }).catch(err => console.error('[CG PWA] Échec service worker ✗', err));
  } else { console.warn('[CG PWA] serviceWorker non supporté'); }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  console.log('[CG PWA] standalone:', isStandalone, '| dismiss:', localStorage.getItem('cg_pwa_dismiss'));
  if (isStandalone) return;
  const dismissed = localStorage.getItem('cg_pwa_dismiss');
  if (dismissed && Date.now() - Number(dismissed) < 7*24*3600*1000) return;

  function banner(html, onAction){
    const b = document.createElement('div');
    b.id = 'cg-pwa-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9500;background:linear-gradient(135deg,#1a1a2e,#16213e);border-bottom:1px solid #7c6af7;padding:.6rem 1rem;display:flex;align-items:center;gap:.7rem;font-family:inherit;font-size:.82rem;color:#e2e2f0;animation:cgSlideDown .35s ease';
    b.innerHTML = html;
    const style = document.createElement('style');
    style.textContent = '@keyframes cgSlideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}';
    document.head.appendChild(style);
    document.body.appendChild(b);
    b.querySelector('.cg-pwa-close').onclick = () => {
      localStorage.setItem('cg_pwa_dismiss', Date.now());
      b.remove();
    };
    const act = b.querySelector('.cg-pwa-install');
    if (act && onAction) act.onclick = onAction;
  }

  // Android / Chrome : vraie installation
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    console.log('[CG PWA] beforeinstallprompt reçu ✓');
    e.preventDefault();
    deferredPrompt = e;
    banner(
      '<span style="font-size:1.2rem">📲</span><span style="flex:1"><strong>'+T.title+'</strong> — '+T.android+'</span>'+
      '<button class="cg-pwa-install" style="background:linear-gradient(135deg,#7c6af7,#f06292);color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-size:.8rem;font-weight:700;cursor:pointer">'+T.btn+'</button>'+
      '<button class="cg-pwa-close" style="background:none;border:none;color:#686880;font-size:1rem;cursor:pointer">✕</button>',
      async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        const b = document.getElementById('cg-pwa-banner'); if (b) b.remove();
      }
    );
  });

  // iOS Safari : tutoriel (pas d'install auto possible)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  if (isIOS) {
    window.addEventListener('load', () => setTimeout(() => {
      if (document.getElementById('cg-pwa-banner')) return;
      banner(
        '<span style="font-size:1.2rem">📲</span><span style="flex:1"><strong>'+T.title+'</strong> — '+T.ios+'</span>'+
        '<button class="cg-pwa-close" style="background:none;border:none;color:#686880;font-size:1rem;cursor:pointer">✕</button>'
      );
    }, 1500));
  }
})();
