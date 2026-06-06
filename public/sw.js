self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Mini Chat", body: "你有一条新消息。" };
  }

  const title = data.title || "Mini Chat";
  const options = {
    body: data.body || "你有一条新消息。",
    badge: data.badge || "",
    icon: data.icon || "",
    data: {
      url: data.url || "/",
    },
    tag: data.tag || "mini-chat-message",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const client = clients.find((item) => item.url.startsWith(self.location.origin));
      if (client) {
        client.focus();
        return client.navigate(targetUrl);
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
