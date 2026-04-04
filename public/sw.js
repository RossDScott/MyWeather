const CACHE_NAME = 'myweather-v1';
const API_CACHE = 'myweather-api-v1';
const API_HOST = 'api.open-meteo.com';

// Cache app shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/index.html'])
    )
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

// Network-first for API, cache-first for app shell
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname === API_HOST) {
    // Network-first for weather API — cache response for offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else if (event.request.mode === 'navigate') {
    // Cache-first for navigation
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
