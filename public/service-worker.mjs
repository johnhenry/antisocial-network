self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("my-cache").then((cache) => {
      return cache.addAll([
        // Add any assets you want to cache here
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const response = await fetch(event.request);
      const clonedResponse = response.clone();
      // Check if the original calling window is closed
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      if (clientList.length === 0 && response.ok) {
        const id = await response.text();
        self.registration.showNotification("Antisocial Network", {
          body: `A process completed in the background. ${id}`,
          icon: "/static/user.webp", // Add path to your icon
        });
      }
      return clonedResponse;
    })()
  );
});
