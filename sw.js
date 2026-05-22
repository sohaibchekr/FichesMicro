const CACHE_NAME = 'microbio-fiches-v1.6';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// Installation : Mise en cache des ressources et forcer l'activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Prendre le contrôle des pages immédiatement
});

// Stratégie : Réseau d'abord, puis Cache (pour assurer les mises à jour en ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
