const { log } = console;

Notification.requestPermission().then((result) => {
  log(result);
});
