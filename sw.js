const CACHE_NAME = 'dentro-offline-v5';

// الملفات التي يجب أن تعمل بدون إنترنت
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://res.cloudinary.com/dvcaqoy2a/image/upload/v1765499260/Dentro-app-logo_fpqnjq.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Noto+Sans+Arabic:wght@100..900&family=Inter:wght@300;400;500;600;700&display=swap'
];

// المكتبات البرمجية الأساسية
const LIBS = [
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://esm.sh/react-dom@^19.2.1'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Pre-caching logic updated for full offline support');
      return cache.addAll([...ASSETS_TO_CACHE, ...LIBS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // استراتيجية خاصة بطلب الصفحة الرئيسية (الوضع الأوفلاين الحقيقي)
  if (event.request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      caches.match('/index.html').then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/index.html', cacheCopy));
          }
          return networkResponse;
        }).catch(() => null);

        // العودة للكاش فوراً إذا وجد، وإلا انتظر الشبكة
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // باقي الملفات (الصور، التنسيقات، المكتبات)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => null);
    })
  );
});