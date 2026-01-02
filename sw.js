const CACHE_NAME = 'dentro-pro-v2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://res.cloudinary.com/dvcaqoy2a/image/upload/v1765499260/Dentro-app-logo_fpqnjq.svg'
];

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
      console.log('SW: Pre-caching core shell');
      return cache.addAll([...CORE_ASSETS, ...EXTERNAL_LIBS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // استراتيجية التعامل مع طلبات التنقل (Navigation) لضمان العمل أوفلاين
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // استراتيجية Cache-First للملفات الثابتة والمكتبات
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