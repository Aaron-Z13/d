const authScreen = document.querySelector("#authScreen");
const chatShell = document.querySelector("#chatShell");
const authForm = document.querySelector("#authForm");
const registerButton = document.querySelector("#registerButton");
const authHint = document.querySelector("#authHint");
const nameInput = document.querySelector("#nameInput");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const myAvatar = document.querySelector("#myAvatar");
const myName = document.querySelector("#myName");
const myUsername = document.querySelector("#myUsername");
const logoutButton = document.querySelector("#logoutButton");
const contactsEl = document.querySelector("#contacts");
const addContactForm = document.querySelector("#addContactForm");
const contactInput = document.querySelector("#contactInput");
const peerAvatar = document.querySelector("#peerAvatar");
const peerName = document.querySelector("#peerName");
const peerStatus = document.querySelector("#peerStatus");
const messagesEl = document.querySelector("#messages");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const backButton = document.querySelector("#backButton");
const toastEl = document.querySelector("#toast");

let me = null;
let contacts = [];
let activePeer = null;
let lastMessageTime = 0;
let pollTimer = null;

function serverHint() {
  return "请用服务器地址打开。部署到公网后，任何 Wi‑Fi 或手机流量都能访问同一个网址。";
}

async function api(path, options = {}) {
  if (window.location.protocol === "file:") {
    throw new Error(serverHint());
  }
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

function initials(user) {
  return String(user?.name || user?.username || "?").slice(0, 1).toUpperCase();
}

function avatarBg(user) {
  return `linear-gradient(135deg, ${user?.color || "#0a84ff"}, rgba(255, 255, 255, 0.18))`;
}

function setLoggedIn(user) {
  me = user;
  authScreen.classList.add("hidden");
  chatShell.classList.remove("hidden");
  myAvatar.textContent = initials(user);
  myAvatar.style.setProperty("--avatar", avatarBg(user));
  myName.textContent = user.name;
  myUsername.textContent = `@${user.username}`;
  loadContacts();
  startPolling();
}

async function boot() {
  if (window.location.protocol === "file:") {
    authScreen.classList.remove("hidden");
    chatShell.classList.add("hidden");
    authHint.textContent = serverHint();
    return;
  }
  try {
    const data = await api("/api/me");
    setLoggedIn(data.user);
  } catch {
    authScreen.classList.remove("hidden");
    chatShell.classList.add("hidden");
  }
}

async function submitAuth(mode) {
  const payload = {
    name: nameInput.value,
    username: usernameInput.value,
    password: passwordInput.value,
  };
  try {
    const data = await api(mode === "register" ? "/api/register" : "/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    authHint.textContent = mode === "register" ? "注册成功。" : "登录成功。";
    setLoggedIn(data.user);
  } catch (error) {
    authHint.textContent = error.message;
  }
}

async function loadContacts() {
  try {
    const data = await api("/api/contacts");
    contacts = data.contacts || [];
    renderContacts();
    if (activePeer) {
      activePeer = contacts.find((item) => item.id === activePeer.id) || activePeer;
    }
  } catch (error) {
    showToast(error.message);
  }
}

function renderContacts() {
  contactsEl.innerHTML = "";
  if (!contacts.length) {
    contactsEl.innerHTML = `<div class="empty-state"><span>还没有联系人。输入对方账号添加好友。</span></div>`;
    return;
  }

  contacts.forEach((contact) => {
    const button = document.createElement("button");
    button.className = `contact${activePeer?.id === contact.id ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <div class="avatar" style="--avatar:${avatarBg(contact)}">${initials(contact)}</div>
      <div>
        <strong>${escapeHtml(contact.name)}</strong>
        <span>${escapeHtml(contact.lastMessage?.text || `@${contact.username}`)}</span>
      </div>
      ${contact.unread ? `<em class="badge">${contact.unread}</em>` : ""}
    `;
    button.addEventListener("click", () => openPeer(contact));
    contactsEl.appendChild(button);
  });
}

async function openPeer(contact) {
  activePeer = contact;
  lastMessageTime = 0;
  peerAvatar.textContent = initials(contact);
  peerAvatar.style.setProperty("--avatar", avatarBg(contact));
  peerName.textContent = contact.name;
  peerStatus.textContent = `@${contact.username}`;
  messageInput.disabled = false;
  sendButton.disabled = false;
  messagesEl.classList.remove("empty");
  messagesEl.innerHTML = "";
  chatShell.classList.add("in-chat");
  renderContacts();
  await loadMessages(true);
  messageInput.focus();
}

async function loadMessages(reset = false) {
  if (!activePeer) return;
  try {
    const data = await api(`/api/messages?peerId=${encodeURIComponent(activePeer.id)}&since=${reset ? 0 : lastMessageTime}`);
    const messages = data.messages || [];
    if (reset) messagesEl.innerHTML = "";
    messages.forEach((message) => {
      appendMessage(message);
      lastMessageTime = Math.max(lastMessageTime, message.createdAt);
    });
    if (!messagesEl.children.length) {
      messagesEl.classList.add("empty");
      messagesEl.innerHTML = `<div class="empty-state"><strong>${escapeHtml(activePeer.name)}</strong><span>还没有消息，打个招呼吧。</span></div>`;
    } else {
      messagesEl.classList.remove("empty");
    }
    if (messages.length) messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    showToast(error.message);
  }
}

function appendMessage(message) {
  if (messagesEl.classList.contains("empty")) {
    messagesEl.classList.remove("empty");
    messagesEl.innerHTML = "";
  }
  const item = document.createElement("div");
  item.className = `message${message.from === me.id ? " mine" : ""}`;
  item.innerHTML = `
    <div class="bubble">${escapeHtml(message.text)}</div>
    <div class="time">${formatTime(message.createdAt)}</div>
  `;
  messagesEl.appendChild(item);
}

async function sendMessage() {
  if (!activePeer) return;
  const text = messageInput.value.trim();
  if (!text) return;
  messageInput.value = "";
  try {
    const data = await api("/api/messages", {
      method: "POST",
      body: JSON.stringify({ to: activePeer.id, text }),
    });
    appendMessage(data.message);
    lastMessageTime = Math.max(lastMessageTime, data.message.createdAt);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    loadContacts();
  } catch (error) {
    showToast(error.message);
    messageInput.value = text;
  }
}

function startPolling() {
  window.clearInterval(pollTimer);
  pollTimer = window.setInterval(() => {
    loadContacts();
    loadMessages();
  }, 1200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuth("login");
});

registerButton.addEventListener("click", () => submitAuth("register"));

addContactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = contactInput.value.trim();
  if (!username) return;
  try {
    const data = await api("/api/contacts", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    contactInput.value = "";
    showToast(`已添加 ${data.contact.name}`);
    await loadContacts();
    openPeer(data.contact);
  } catch (error) {
    showToast(error.message);
  }
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  window.location.reload();
});

backButton.addEventListener("click", () => {
  chatShell.classList.remove("in-chat");
});

boot();
