const CACHE_NAME = "peernotez-v2"; // Increment version for updates
const OFFLINE_URL = "/"; // Fallback page

const ASSETS_TO_CACHE = [
  "/",
  "/search",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

// 1. INSTALL: Pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core Assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become active
});

// 2. ACTIVATE: Cleanup old caches to keep storage lean
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing Old Cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages immediately
});

// 3. FETCH: Stale-While-Revalidate Strategy
// This is the gold standard for SEO & Performance
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip caching for API calls or Auth routes to prevent stale user data
  if (event.request.url.includes("/api/") || event.request.url.includes("/login")) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update the cache with the fresh version from the network
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Fallback logic for complete offline state
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});