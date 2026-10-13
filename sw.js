const CACHE_VERSION = "33";
const STATIC_CACHE = `career-radar-static-v${CACHE_VERSION}`;
const DATA_CACHE = `career-radar-data-v${CACHE_VERSION}`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=33",
  "./app.js?v=33",
  "./manifest.webmanifest",
  "./assets/icon.svg",
];
const PUBLIC_DATA = [
  "./data/jobs.json",
  "./data/sources.json",
  "./data/official-careers.json",
];
const CACHEABLE_DATA_PATHS = new Set([
  "/data/jobs.json",
  "/data/sources.json",
  "/data/official-careers.json",
  "/data/messages.json",
  "/data/applications.json",
  "/data/inbox.json",
]);

function isCacheableResponse(response) {
  const cacheControl = response.headers.get("Cache-Control") || "";
  return Boolean(response && response.ok && response.type === "basic" && !/no-store/i.test(cacheControl));
}

async function networkFirst(event, cacheName, fallbackUrl = "") {
  const { request } = event;
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await caches.match(request)) || (fallbackUrl ? await caches.match(fallbackUrl) : null);
    if (cached) return cached;
    return new Response("当前离线，且此内容尚未缓存。", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }

  const response = await refresh;
  return response || new Response("", { status: 504, statusText: "Offline" });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
      caches.open(DATA_CACHE).then((cache) => cache.addAll(PUBLIC_DATA)),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const activeCaches = new Set([STATIC_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("career-radar-") && !activeCaches.has(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.endsWith("/sw.js")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(event, STATIC_CACHE, "./index.html"));
    return;
  }

  if (url.pathname.startsWith("/data/")) {
    if (CACHEABLE_DATA_PATHS.has(url.pathname)) event.respondWith(networkFirst(event, DATA_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(event, STATIC_CACHE));
});



