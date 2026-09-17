const CACHE_NAME = 'mybetoracle-v1';

const STATIC_ASSETS = [
  '/',
  '/predictions',
  '/accumulators', 
  '/betslip',
  '/about',
  '/how-to-use',
  '/beginners-guide',
  '/faq',
  '/contact',
  '/special',
  '/manifest.json',
  '/icons/maskable_icon_x192.png',
  '/icons/maskable_icon_x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match('/');
            });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If request is successful, clone and cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If network request fails, try to serve from cache
        return caches.match(event.request)
          .then((response) => {
            return response || caches.match('/');
          });
      })
  );
});