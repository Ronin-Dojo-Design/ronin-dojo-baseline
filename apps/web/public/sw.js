/**
 * BBL service worker — hand-rolled installable-PWA v1 (no workbox/next-pwa).
 *
 * Deploy-safety contract:
 *  - HTML navigations are ALWAYS network-first (never cached → no stale-deploy
 *    trap); the only fallback is the pre-cached /offline.html.
 *  - Static assets are stale-while-revalidate: /_next/static/ is content-hashed
 *    (a new deploy = new URLs), brand media revalidates in the background.
 *  - /api/ and /app/ (auth'd console) are never intercepted.
 *
 * Bump VERSION to invalidate every cached asset on the next activate.
 */
const VERSION = "bbl-v1"
const OFFLINE_URL = "/offline.html"

const STATIC_PREFIXES = ["/_next/static/", "/brand/", "/images/brands/"]
const BYPASS_PREFIXES = ["/api/", "/app/"]

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", event => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (BYPASS_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) return

  // Navigations: network-first; cached offline page only when the network fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(OFFLINE_URL)
          .then(cached => cached ?? new Response("Offline", { status: 503 })),
      ),
    )
    return
  }

  // Static assets: stale-while-revalidate.
  if (STATIC_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.open(VERSION).then(async cache => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached ?? Response.error())
        return cached ?? network
      }),
    )
  }
})
