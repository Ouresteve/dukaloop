const CACHE_NAME = 'dukaloop-v2';   // Increase version when you update the app

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',           // change if your css file has different name
  '/app.js',              // change if your main js file has different name
  // Add any other important files here (icons, fonts, etc.)
];

// Install - Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate - Clean old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch - Cache-first strategy for offline support
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) return cachedResponse;

        // Otherwise try network
        return fetch(event.request).then(networkResponse => {
          // Cache successful responses for future offline use
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Optional: Return a fallback page if offline and no cache
        return caches.match('/index.html');
      })
  );
});

// Basic push notification support (for future use)
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/images/logo.png',
    badge: 'images/logo.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Dukaloop', options)
  );
});

// Background sync (for future offline actions like syncing losses)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-losses' || event.tag === 'sync-sales') {
    // Future: handle background sync here
    console.log('Background sync triggered:', event.tag);
  }
});