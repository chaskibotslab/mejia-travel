// Service worker para PWA — v4
// IMPORTANTE: NO cacheamos HTML porque el HTML inyecta las env vars de Supabase
// en runtime. Si cacheamos HTML, el cliente queda con vars viejas.
const CACHE = 'mtravel-v4';
const ASSETS = ['/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const isHTML = request.mode === 'navigate' || request.destination === 'document' ||
                 (request.headers.get('accept') || '').includes('text/html');
  // Nunca cachear HTML ni rutas de Next.js dinámicas; siempre traer del servidor
  if (isHTML || url.pathname.startsWith('/_next/data') || url.pathname.startsWith('/api')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first para assets estáticos (imágenes, JS, CSS)
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request))
  );
});
