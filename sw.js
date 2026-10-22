// Bewaart de quiz op het toestel zodat hij ook zonder internet opent.
const CACHE = "azt-quiz-v9";
const FILES = ["./", "./index.html", "./vragen.json", "./app.js", "./fonts/fonts.css", "./fonts/Archivo-normal-500-900-latin-ext.woff2", "./fonts/Archivo-normal-500-900-latin.woff2", "./fonts/AtkinsonHyperlegible-italic-400-latin-ext.woff2", "./fonts/AtkinsonHyperlegible-italic-400-latin.woff2", "./fonts/AtkinsonHyperlegible-normal-400-latin-ext.woff2", "./fonts/AtkinsonHyperlegible-normal-400-latin.woff2", "./fonts/AtkinsonHyperlegible-normal-700-latin-ext.woff2", "./fonts/AtkinsonHyperlegible-normal-700-latin.woff2", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Eerst het netwerk (zodat aanpassingen meteen zichtbaar zijn), bij geen verbinding de bewaarde versie.
self.addEventListener("fetch", e => {
  // alleen eigen bestanden; verzoeken naar andere sites gaan niet via de cache
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
