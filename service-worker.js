const CACHE_NAME = "vendas-pro-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

// INSTALAR
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ATIVAR
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});