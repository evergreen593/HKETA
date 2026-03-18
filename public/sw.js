const CACHE_NAME = 'lrt-eta-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache for API, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For API calls, try network only (no cache fallback as requested)
  if (url.hostname === 'rt.data.gov.hk') {
    event.respondWith(fetch(request));
    return;
  }

  // For other assets, try cache first
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful GET requests
          if (request.method === 'GET' && fetchResponse.status === 200) {
            cache.put(request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});
