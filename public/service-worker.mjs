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

// https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow
self.addEventListener("notificationclick", (e) => {
  // Close the notification popout
  e.notification.close();
  // Get all the Window clients
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      // If a Window tab matching the targeted URL already exists, focus that;
      // const url = e.notification.data.url;
      const [id] = e.notification.data.id.split(",");
      const [type] = id.split(":");
      const url = `${self.location.origin}/${type}/${id}`;
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === url ? (windowClient.focus(), true) : false
      );
      // Otherwise, open a new tab to the applicable URL and focus it.
      if (!hadWindowToFocus)
        clients
          .openWindow(url)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const response = await fetch(event.request);
      if (event.request.headers.get("accept") === "text/event-stream") {
        // This is here to prevent the service worker from caching the event stream
        return response;
      }
      // Check if the original calling window is closed
      // const clientList = await self.clients.matchAll({
      //   type: "window",
      //   includeUncontrolled: true,
      // });
      const id = response.headers.get("x-id");

      if (
        // clientList.length === 0 &&
        response.ok &&
        self.Notification.permission === "granted" &&
        id
      ) {
        const notificationObject = {
          body: `item(s) created with id(s): ${id}`,
          data: { id, url: `${self.location.origin}` },
          icon: "/static/user.webp", // Add path to your icon
        };
        self.registration.showNotification(
          "Antisocial Network",
          notificationObject
        );
      }
      return response;
    })()
  );
});
