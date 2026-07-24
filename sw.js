// MICROBIO v4.6.0 - Service Worker avec Cache-First + Offline complet
const CACHE_NAME = 'microbio-cache-v4.6.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sohaib.png',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap'
];

// Installation : mise en cache de tous les assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On tente de mettre en cache chaque ressource individuellement
      // pour ne pas bloquer si une échoue
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
});

// Activation : supprimer les anciens caches
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
  return self.clients.claim();
});

// Stratégie: Cache-First pour les ressources locales
//            Network-First pour les requêtes Firebase/API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Firebase Firestore / Auth : toujours réseau (Firestore gère son propre cache offline)
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseio.com')) {
    return; // Laisser Firebase gérer ça nativement
  }

  // Pour les assets locaux (index.html, js libs, fonts, images) : Cache-First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Servir depuis le cache ET mettre à jour en arrière-plan (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cached;
      }
      // Pas en cache : essayer le réseau
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Hors ligne ET pas en cache : retourner index.html (SPA fallback)
        return caches.match('./index.html');
      });
    })
  );
});
