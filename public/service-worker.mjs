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
      console.log({ response });

      // Check if the original calling window is closed
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      console.log("clientList", clientList);

      if (clientList.length === 0) {
        self.registration.showNotification("Antisocial Network", {
          body: "A process completed in the background.",
          icon: "/static/user.webp", // Add path to your icon
        });
      }

      return clonedResponse;
    })()
  );
});
