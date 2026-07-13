// Chronologeek Service Worker
// ⚠️ BUMPER LA VERSION À CHAQUE MISE À JOUR DU SITE ⚠️
const VERSION = 'cg-v1';
const PRECACHE = [
  '/', '/index.html', '/starwars.html', '/marvel.html', '/dc.html', '/avatar.html',
  '/badges.js', '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION && k !== 'cg-img').map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Pages HTML : réseau d'abord (toujours frais), cache si hors-ligne
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Images TMDB / covers Open Library : cache-first (économie de data)
  if (url.hostname === 'image.tmdb.org' || url.hostname === 'covers.openlibrary.org') {
    e.respondWith(
      caches.open('cg-img').then(c => c.match(e.request).then(r => r || fetch(e.request).then(fr => {
        if (fr.ok) c.put(e.request, fr.clone());
        return fr;
      })))
    );
    return;
  }

  // APIs (TMDB data, Open Library search) : réseau pur
  if (url.hostname.includes('themoviedb.org') || url.hostname.includes('openlibrary.org')) return;

  // Assets même origine : cache-first + mise en cache
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(fr => {
        if (fr.ok) { const copy = fr.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return fr;
      }))
    );
  }
});
