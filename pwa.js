// Chronologeek PWA — enregistrement + bannière d'installation
(function(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
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
    e.preventDefault();
    deferredPrompt = e;
    banner(
      '<span style="font-size:1.2rem">📲</span><span style="flex:1"><strong>Installer Chronologeek</strong> — progression et timelines, même hors-ligne</span>'+
      '<button class="cg-pwa-install" style="background:linear-gradient(135deg,#7c6af7,#f06292);color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-size:.8rem;font-weight:700;cursor:pointer">Installer</button>'+
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
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    window.addEventListener('load', () => setTimeout(() => {
      if (document.getElementById('cg-pwa-banner')) return;
      banner(
        '<span style="font-size:1.2rem">📲</span><span style="flex:1"><strong>Installer Chronologeek</strong> — appuie sur <strong>Partager</strong> puis « Sur l\'écran d\'accueil »</span>'+
        '<button class="cg-pwa-close" style="background:none;border:none;color:#686880;font-size:1rem;cursor:pointer">✕</button>'
      );
    }, 1500));
  }
})();
