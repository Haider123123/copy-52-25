const CACHE_NAME = 'dentro-pro-v1';

// قائمة الملفات الأساسية
const INITIAL_CACHING = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://res.cloudinary.com/dvcaqoy2a/image/upload/v1765499260/Dentro-app-logo_fpqnjq.svg'
];

// المكتبات الخارجية المستخدمة في importmap
const EXTERNAL_LIBS = [
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://esm.sh/react-dom@^19.2.1',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Noto+Sans+Arabic:wght@100..900&family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Inside Install: Caching core assets and libs');
      return cache.addAll([...INITIAL_CACHING, ...EXTERNAL_LIBS]);
    })
  );
  self.skipWaiting();
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

// استراتيجية Stale-While-Revalidate: عرض من الكاش أولاً ثم التحديث في الخلفية
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchedResponse = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // إذا فشل النت كلياً، يظل الكاش هو المصدر
        return null;
      });

      return cachedResponse || fetchedResponse;
    })
  );
});