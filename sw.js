/* =============================================================================
  sw.js — MotoLog PWA Service Worker (v1)
  - Cachea app shell (offline)
  - Estrategia:
      * Navegación (HTML): network-first (para actualizar) + fallback cache
      * Assets (css/js/png/svg/json): cache-first + actualización en background
============================================================================= */

const VERSION = 'motolog-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.core.js',
  './app.ui.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k !== VERSION ? caches.delete(k) : Promise.resolve()))
    );
    self.clients.claim();
  })());
});

const isNavigation = (req) => req.mode === 'navigate' || (req.destination === '' && req.headers.get('accept')?.includes('text/html'));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo maneja mismo origen
  if (url.origin !== self.location.origin) return;

  if (isNavigation(req)) {
    // HTML: network-first
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const fresh = await fetch(req);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await cache.match(req)) || (await cache.match('./index.html'));
      }
    })());
    return;
  }

  // Assets: cache-first
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req);
    if (cached) {
      // Actualiza en background
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) await cache.put(req, fresh.clone());
        } catch (_) {}
      })());
      return cached;
    }

    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) await cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      // fallback básico: si piden un icono y no hay red, intenta el 192
      return (await cache.match('./icons/icon-192.png')) || Response.error();
    }
  })());
});
