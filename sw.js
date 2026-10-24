// MICROBIO v4.14.15 - Service Worker avec Cache-First + Navigation instantanée Offline
const CACHE_NAME = 'microbio-cache-v4.14.15';
const ASSETS = [
  './',
  './index.html',
  './programme.js',
  './manifest.json',
  './sohaib.png',
  './logo.PNG',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap'
];

// Installation : mise en cache de tous les assets critiques
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => cache.add(url).catch((err) => {
          console.warn('[SW] Pré-cache ignoré pour :', url, err);
        }))
      );
    })
  );
});

// Activation : suppression immédiate des anciens caches
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
    }).then(() => self.clients.claim())
  );
});

// Stratégie de chargement :
// 1. Requêtes de navigation : Cache-First instantané (0 ms de délai hors ligne)
// 2. Ressources statiques : Cache-First avec revalidation en arrière-plan
// 3. Firestore / Firebase : Laisser passer (géré par IndexedDB offline de Firebase)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Laisser Firebase gérer son propre cache offline (IndexedDB)
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseio.com')) {
    return;
  }

  // NAVIGATION (Entrée dans l'application / PWA) : Servir immédiatement index.html du cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html', { ignoreSearch: true })
        .then((cached) => cached || caches.match('./', { ignoreSearch: true }))
        .then((cached) => {
          if (cached) {
            // Revalidation silencieuse en arrière-plan si réseau disponible (sans bloquer l'affichage)
            fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put('./index.html', networkResponse);
                });
              }
            }).catch(() => {});
            return cached;
          }
          // Si pas encore en cache (tout premier lancement)
          return fetch(event.request);
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // RESSOURCES STATIQUES (JS, CSS, Images, Fonts) : Cache-First instantané
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        // Servir depuis le cache ET mettre à jour en arrière-plan si en ligne
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cached;
      }

      // Pas en cache : chercher sur le réseau
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
