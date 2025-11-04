const CACHE_NAME = 'camara-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json'
];

// Instalar SW
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Activar SW (limpiar viejos)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => 
            Promise.all(
                names.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            )
        )
    );
});