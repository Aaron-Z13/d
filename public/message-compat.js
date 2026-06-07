(function () {
  const nativeFetch = window.fetch.bind(window);
  let mePromise = null;

  function loadMe() {
    if (!mePromise) {
      mePromise = nativeFetch("/api/me", { credentials: "same-origin" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => data?.user || null)
        .catch(() => null);
    }
    return mePromise;
  }

  function sameUser(message, me) {
    if (!message || !me) return false;
    return Boolean(
      message.isMine ||
        message.from === me.id ||
        message.from === me.username ||
        message.senderUsername === me.username ||
        (message.senderName && message.senderName === me.name)
    );
  }

  function normalizeMessage(message, me) {
    if (sameUser(message, me)) {
      return { ...message, from: me.id, isMine: true };
    }
    return { ...message, isMine: false };
  }

  async function normalizePayload(payload) {
    const me = await loadMe();
    if (!me || !payload || typeof payload !== "object") return payload;
    if (Array.isArray(payload.messages)) {
      return { ...payload, messages: payload.messages.map((message) => normalizeMessage(message, me)) };
    }
    if (payload.message) {
      return { ...payload, message: normalizeMessage(payload.message, me) };
    }
    return payload;
  }

  window.fetch = async function patchedFetch(input, init) {
    const response = await nativeFetch(input, init);
    const url = typeof input === "string" ? input : input?.url || "";
    if (!url.includes("/api/messages")) return response;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return response;

    try {
      const payload = await response.clone().json();
      const normalized = await normalizePayload(payload);
      return new Response(JSON.stringify(normalized), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      return response;
    }
  };
})();
