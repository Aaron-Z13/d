(function () {
  const notifyToggle = document.querySelector("#notifyToggle");
  const authForm = document.querySelector("#authForm");
  const registerButton = document.querySelector("#registerButton");
  const logoutButton = document.querySelector("#logoutButton");

  function enabledByPrefs() {
    try {
      return localStorage.getItem("mini-chat-notify") !== "0";
    } catch {
      return true;
    }
  }

  function supported() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost")
    );
  }

  function toUint8Array(value) {
    const padding = "=".repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    return Uint8Array.from(Array.from(raw, (char) => char.charCodeAt(0)));
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      ...options,
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "请求失败");
    return data;
  }

  async function loggedIn() {
    try {
      await requestJson("/api/me");
      return true;
    } catch {
      return false;
    }
  }

  async function subscribePush(askPermission) {
    if (!supported() || !enabledByPrefs() || !(await loggedIn())) return;
    const permission =
      Notification.permission === "granted"
        ? "granted"
        : askPermission
          ? await Notification.requestPermission()
          : Notification.permission;
    if (permission !== "granted") return;

    const [{ publicKey }, registration] = await Promise.all([
      requestJson("/api/push/public-key"),
      navigator.serviceWorker.register("/sw.js"),
    ]);
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(publicKey),
      }));

    await requestJson("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({ subscription }),
    });
  }

  async function unsubscribePush() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    await requestJson("/api/push/subscribe", {
      method: "DELETE",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => {});
    await subscription.unsubscribe().catch(() => {});
  }

  function subscribeAfterAuth() {
    window.setTimeout(() => {
      subscribePush(true).catch(() => {});
    }, 900);
  }

  notifyToggle?.addEventListener("change", () => {
    if (notifyToggle.checked) {
      subscribePush(true).catch(() => {});
    } else {
      unsubscribePush().catch(() => {});
    }
  });

  authForm?.addEventListener("submit", subscribeAfterAuth);
  registerButton?.addEventListener("click", subscribeAfterAuth);
  logoutButton?.addEventListener("click", () => unsubscribePush().catch(() => {}));

  if (Notification?.permission === "granted") {
    subscribePush(false).catch(() => {});
  }
})();
