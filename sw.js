const CACHE_NAME = 'dentro-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Check if valid response. 
        // We accept 'basic' (same-origin) and 'cors' (CDN) responses with status 200.
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        }

        // If response is 404 (NOT_FOUND) and it is a navigation request, fallback to index.html
        if ((!response || response.status === 404) && request.mode === 'navigate') {
             return caches.match('/index.html');
        }

        return response;
      })
      .catch(() => {
        // Network failure (Offline)
        return caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                
                // Navigation fallback
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return null;
            });
      })
  );
});