// Kill-switch service worker: limpia cachés y se desregistra en dispositivos
// donde una versión previa de la PWA quedó instalada.
const CACHE_NAME = "seniorsafe-killswitch-v2026-05-29";
self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) =>
  e.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(clients.map((c) => {
      const url = new URL(c.url);
      url.searchParams.set("sw-cleanup", Date.now().toString());
      return c.navigate(url.toString());
    }));
    await self.registration.unregister();
  })())
);
