// Chronologeek Service Worker — zéro maintenance
// Stratégie : réseau d'abord pour tout le code (toujours frais en ligne),
// cache = filet de sécurité hors-ligne uniquement. Rien à bumper.
const CACHE = 'cg-app';
const IMG_CACHE = 'cg-img';
// `addAll` est tout ou rien : un seul 404 fait echouer l'installation entiere
// et le hors-ligne disparait sans rien dire. Cette liste ne doit donc contenir
// que des fichiers qui existent — la refonte a supprime les anciens composants
// partages, ne pas les remettre ici.
const PRECACHE = [
  '/', '/index.html', '/starwars.html', '/marvel.html', '/dc.html', '/avatar.html',
  '/startrek.html', '/walkingdead.html', '/dragonage.html', '/assassinscreed.html',
  '/whats-new.html', '/upcoming.html',
  '/fr/', '/fr/starwars.html', '/fr/marvel.html', '/fr/dc.html', '/fr/avatar.html',
  '/fr/startrek.html', '/fr/walkingdead.html', '/fr/dragonage.html', '/fr/assassinscreed.html',
  '/fr/nouveautes.html', '/fr/a-venir.html',
  '/deep-dives/', '/deep-dives/star-wars.html',
  '/fr/dossiers/', '/fr/dossiers/star-wars.html',
  '/pwa.js', '/manifest.json',
  // les polices, servies par le site depuis le 17 aout 2026 : sans elles au
  // cache, chaque navigation repassait par la police de secours le temps que
  // Google reponde, et le hors-ligne n'avait pas de typographie du tout.
  '/fonts/bigshoulders-latin.woff2', '/fonts/bigshoulders-latin-ext.woff2',
  '/fonts/chivo-latin.woff2', '/fonts/chivo-latin-ext.woff2',
  '/fonts/chivo-italic-latin.woff2', '/fonts/chivo-italic-latin-ext.woff2',
  // le moteur de la refonte, bilingue, et les donnees de chaque page
  '/app.js',
  // les entrees que le visiteur ajoute lui-meme : charge par les huit pages
  // d'univers entre leurs donnees et leur script. Absent du cache, la page
  // hors ligne se chargerait sans les ajouts, et sans un mot pour le dire.
  '/perso.js',
  '/data/starwars-en.js', '/data/marvel-en.js', '/data/dc-en.js', '/data/avatar-en.js',
  '/data/startrek-en.js', '/data/walkingdead-en.js', '/data/dragonage-en.js',
  '/data/assassinscreed-en.js',
  '/data/news-en.js',
  '/data/starwars-fr.js', '/data/marvel-fr.js', '/data/dc-fr.js', '/data/avatar-fr.js',
  '/data/startrek-fr.js', '/data/walkingdead-fr.js', '/data/dragonage-fr.js',
  '/data/assassinscreed-fr.js',
  '/data/news-fr.js',
  '/data/dossier-star-wars-en.js', '/data/dossier-star-wars-fr.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Code & pages (HTML, JS, JSON même origine) : RÉSEAU D'ABORD → jamais périmé en ligne
  const isCode = url.origin === location.origin &&
    (e.request.mode === 'navigate' || /\.(html|js|json)$/.test(url.pathname) || url.pathname === '/');
  if (isCode) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Affiches TMDB + covers Open Library : cache-first (elles ne changent pas, économie de data)
  if (url.hostname === 'image.tmdb.org' || url.hostname === 'covers.openlibrary.org') {
    e.respondWith(
      caches.open(IMG_CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(fr => {
        if (fr.ok) c.put(e.request, fr.clone());
        return fr;
      })))
    );
    return;
  }

  // APIs de données : réseau pur, on ne touche pas
  if (url.hostname.includes('themoviedb.org') || url.hostname.includes('openlibrary.org')) return;

  // Images du site : réseau d'abord aussi (si tu remplaces une image, elle suit)
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      }).catch(() => caches.match(e.request))
    );
  }
});
