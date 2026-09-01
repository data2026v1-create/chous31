/* StepStore — Service Worker (PWA)
 * Stratégie : network-first avec repli sur le cache pour les requêtes
 * same-origin, afin de toujours servir le contenu le plus récent. */
const CACHE = "stepstore-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isImage = request.destination === "image";

  // Images cross-origin (Pexels) : réseau uniquement, pas de mise en cache
  if (!isSameOrigin && isImage) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("./index.html"))
      )
  );
});
