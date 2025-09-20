const CACHE_NAME = 'quickbucks-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/statistics.html',
  '/settings.html',
  '/about.html',
  '/style.css',
  '/script.js',
  '/statistics.js',
  '/settings.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});