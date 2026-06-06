(() => {
  const originalTitle = document.title || "Mini Chat";
  let unreadTotal = 0;
  let faviconLink = null;
  let pollTimer = null;

  function isLoggedIn() {
    return !document.querySelector("#chatShell")?.classList.contains("hidden");
  }

  function notificationsEnabled() {
    try {
      return localStorage.getItem("mini-chat-notify") !== "0";
    } catch {
      return true;
    }
  }

  function ensureFaviconLink() {
    if (faviconLink) return faviconLink;
    faviconLink = document.querySelector("link[rel~='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      document.head.appendChild(faviconLink);
    }
    return faviconLink;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function drawFaviconBadge(count) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, "#65d86a");
    gradient.addColorStop(1, "#0a84ff");
    ctx.fillStyle = gradient;
    roundedRect(ctx, 8, 8, 48, 48, 15);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 30px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", 32, 34);

    if (count > 0) {
      const text = count > 99 ? "99+" : String(count);
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.arc(48, 16, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = text.length > 2 ? "900 11px -apple-system, BlinkMacSystemFont, sans-serif" : "900 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(text, 48, 16);
    }

    ensureFaviconLink().href = canvas.toDataURL("image/png");
  }

  async function setSystemBadge(count) {
    try {
      if (count > 0 && "setAppBadge" in navigator) {
        await navigator.setAppBadge(count);
      } else if ("clearAppBadge" in navigator) {
        await navigator.clearAppBadge();
      }
    } catch {
      return;
    }
  }

  function updateBadge(count) {
    unreadTotal = Math.max(0, Number(count) || 0);
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${originalTitle}` : originalTitle;
    drawFaviconBadge(unreadTotal);
    setSystemBadge(unreadTotal);
  }

  async function fetchUnreadCount() {
    if (window.location.protocol === "file:" || !isLoggedIn() || !notificationsEnabled()) {
      updateBadge(0);
      return;
    }

    try {
      const [contactsResponse, groupsResponse] = await Promise.all([
        fetch("/api/contacts", { credentials: "same-origin" }),
        fetch("/api/groups", { credentials: "same-origin" }),
      ]);
      if (!contactsResponse.ok || !groupsResponse.ok) return;
      const [contactsData, groupsData] = await Promise.all([contactsResponse.json(), groupsResponse.json()]);
      const contacts = contactsData.contacts || [];
      const groups = groupsData.groups || [];
      const total = [...contacts, ...groups].reduce((sum, thread) => sum + (Number(thread.unread) || 0), 0);
      updateBadge(total);
    } catch {
      return;
    }
  }

  function requestNotificationPermission() {
    if (!notificationsEnabled()) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fetchUnreadCount();
  });

  document.querySelector("#notifyToggle")?.addEventListener("change", requestNotificationPermission);
  drawFaviconBadge(0);
  pollTimer = window.setInterval(fetchUnreadCount, 1800);
  fetchUnreadCount();
})();
