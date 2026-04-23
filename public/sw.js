const CACHE_NAME = 'myweather-v3';
const API_CACHE = 'myweather-api-v1';
const API_HOST = 'api.open-meteo.com';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];
const API_TIMEOUT_MS = 6000;

// Cache app shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch a request with a timeout; rejects if the network hasn't responded in time.
function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    fetch(request).then(
      (response) => { clearTimeout(timer); resolve(response); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// Serve from cache immediately, refresh cache in the background.
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const networkUpdate = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);
      return cached || networkUpdate.then((r) => r || Response.error());
    })
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Weather API: network-first with a timeout, fall back to cache.
  if (url.hostname === API_HOST) {
    event.respondWith(
      fetchWithTimeout(request, API_TIMEOUT_MS)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error()))
    );
    return;
  }

  // App shell navigations: cache-first so poor reception never blocks the splash.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => cached || cache.match('/index.html')).then((cached) => {
          const networkUpdate = fetch(request)
            .then((response) => {
              if (response && response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => null);
          return cached || networkUpdate.then((r) => r || Response.error());
        })
      )
    );
    return;
  }

  // Same-origin static assets (JS/CSS/icons/fonts): stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});
