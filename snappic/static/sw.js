
const CACHE_NAME = 'snappic-cache-v1';
const urlsToCache = [
    '/',
    '/gallery',
    '/static/style.css',
    '/static/script.js',
    '/static/icon-192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Serve from cache
                }
                return fetch(event.request); // Fetch from network
            })
    );
});
