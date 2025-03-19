// Cache version - increment when assets change
const CACHE_VERSION = "v1";
const CACHE_NAME = `allmytab-cache-${CACHE_VERSION}`;

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = ["/", "/index.html", "/src/index.css", "/src/App.css"];

// Install event - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests and requests to Firebase or other external APIs
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("firestore.googleapis.com") ||
    event.request.url.includes("firebase") ||
    event.request.url.includes("google-analytics")
  ) {
    return;
  }

  // For static assets (using URL pattern detection)
  if (
    event.request.url.match(
      /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/
    ) ||
    event.request.mode === "navigate"
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Use cached response if available
        if (cachedResponse) {
          // Clone the cached response
          const clonedResponse = cachedResponse.clone();

          // Fetch from network in the background to update cache
          fetch(event.request)
            .then((networkResponse) => {
              // If valid response, update the cache
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() =>
              console.log("Failed to update cache for:", event.request.url)
            );

          return clonedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  } else {
    // For API calls - try network first, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  }
});

// Handle messages from clients (useful for cache invalidation)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
