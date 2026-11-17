// public/sw.js
// Service worker minimal : requis pour que le navigateur propose l'installation.
// Il ne met rien en cache (les données financières doivent toujours être à jour)
// et affiche une page simple si le réseau est coupé.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;
  event.respondWith(
    fetch(req).catch(
      () =>
        new Response(
          '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne</title></head><body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#F0F0F3;color:#17151D;text-align:center;padding:24px"><div><h1 style="font-size:20px;margin:0 0 8px">Vous êtes hors ligne</h1><p style="margin:0;color:#6B7280">Reconnectez-vous à Internet puis réessayez.</p></div></body></html>',
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
    )
  );
});
