const { log } = console;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.mjs", { scope: "/" })
    .then((registration) => {
      log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      error("Service Worker registration failed:", error);
    });
}
