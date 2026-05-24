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
const openSettingsButton = document.querySelector("#openSettingsButton");
const closeSettingsButton = document.querySelector("#closeSettingsButton");
const settingsOverlay = document.querySelector("#settingsOverlay");
const settingsTabs = document.querySelector(".settings-tabs");
const profileForm = document.querySelector("#profileForm");
const profileNameInput = document.querySelector("#profileNameInput");
const profileStatusInput = document.querySelector("#profileStatusInput");
const profileColorGrid = document.querySelector("#profileColorGrid");
const compactToggle = document.querySelector("#compactToggle");
const notifyToggle = document.querySelector("#notifyToggle");
const friendRequestList = document.querySelector("#friendRequestList");
const threadsEl = document.querySelector("#threads");
const addContactForm = document.querySelector("#addContactForm");
const contactInput = document.querySelector("#contactInput");
const threadSearchInput = document.querySelector("#threadSearchInput");
const groupForm = document.querySelector("#groupForm");
const groupNameInput = document.querySelector("#groupNameInput");
const groupMembersInput = document.querySelector("#groupMembersInput");
const wallpaperGrid = document.querySelector("#wallpaperGrid");
const wallpaperFileInput = document.querySelector("#wallpaperFileInput");
const openGameButton = document.querySelector("#openGameButton");
const gameOverlay = document.querySelector("#gameOverlay");
const closeGameButton = document.querySelector("#closeGameButton");
const restartGameButton = document.querySelector("#restartGameButton");
const fruitGame = document.querySelector("#fruitGame");
const gameScoreEl = document.querySelector("#gameScore");
const gameTimeEl = document.querySelector("#gameTime");
const gameComboEl = document.querySelector("#gameCombo");
const gameHintEl = document.querySelector("#gameHint");
const openSnakeButton = document.querySelector("#openSnakeButton");
const snakeOverlay = document.querySelector("#snakeOverlay");
const closeSnakeButton = document.querySelector("#closeSnakeButton");
const restartSnakeButton = document.querySelector("#restartSnakeButton");
const pauseSnakeButton = document.querySelector("#pauseSnakeButton");
const snakeGame = document.querySelector("#snakeGame");
const snakeScoreEl = document.querySelector("#snakeScore");
const snakeBestEl = document.querySelector("#snakeBest");
const snakeSpeedEl = document.querySelector("#snakeSpeed");
const snakeHintEl = document.querySelector("#snakeHint");
const openVideoButton = document.querySelector("#openVideoButton");
const videoOverlay = document.querySelector("#videoOverlay");
const closeVideoButton = document.querySelector("#closeVideoButton");
const videoAddForm = document.querySelector("#videoAddForm");
const videoUrlInput = document.querySelector("#videoUrlInput");
const videoFeed = document.querySelector("#videoFeed");
const prevVideoButton = document.querySelector("#prevVideoButton");
const nextVideoButton = document.querySelector("#nextVideoButton");
const loadMoreVideosButton = document.querySelector("#loadMoreVideosButton");
const resetVideosButton = document.querySelector("#resetVideosButton");
const peerAvatar = document.querySelector("#peerAvatar");
const peerName = document.querySelector("#peerName");
const peerStatus = document.querySelector("#peerStatus");
const messagesEl = document.querySelector("#messages");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const stickerToggle = document.querySelector("#stickerToggle");
const stickerPanel = document.querySelector("#stickerPanel");
const toggleSearchButton = document.querySelector("#toggleSearchButton");
const messageSearchBar = document.querySelector("#messageSearchBar");
const messageSearchInput = document.querySelector("#messageSearchInput");
const clearMessageSearchButton = document.querySelector("#clearMessageSearchButton");
const backButton = document.querySelector("#backButton");
const toastEl = document.querySelector("#toast");

let me = null;
let contacts = [];
let groups = [];
let activeThread = null;
let lastMessageTime = 0;
let pollTimer = null;
let threadFilter = "";
let profileColor = "#0a84ff";
let appPrefs = { compact: false, notify: true };
let friendRequests = [];
let videoItems = [];
let videoCustomItems = [];
let videoQuery = "creative coding";
let videoNextPageToken = "";
let videoLoading = false;
let videoApiEnabled = true;

const wallpaperPresets = {
  aurora: {
    app:
      "radial-gradient(circle at 16% 14%, rgba(10, 132, 255, 0.22), transparent 28%), radial-gradient(circle at 82% 10%, rgba(50, 215, 75, 0.16), transparent 24%), linear-gradient(180deg, #101217, #0c0d10)",
    chat:
      "radial-gradient(circle at 78% 10%, rgba(50, 215, 75, 0.13), transparent 34%), linear-gradient(145deg, rgba(8, 10, 16, 0.95), rgba(8, 18, 13, 0.85))",
  },
  mist: {
    app:
      "radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.13), transparent 30%), radial-gradient(circle at 80% 30%, rgba(100, 210, 255, 0.14), transparent 28%), linear-gradient(180deg, #161a20, #0b0d11)",
    chat:
      "radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.1), transparent 28%), linear-gradient(145deg, rgba(19, 23, 31, 0.95), rgba(12, 14, 18, 0.88))",
  },
  sunset: {
    app:
      "radial-gradient(circle at 18% 18%, rgba(255, 159, 10, 0.24), transparent 28%), radial-gradient(circle at 78% 18%, rgba(255, 55, 95, 0.18), transparent 28%), linear-gradient(180deg, #1b1114, #0c0d10)",
    chat:
      "radial-gradient(circle at 72% 14%, rgba(255, 159, 10, 0.16), transparent 34%), linear-gradient(145deg, rgba(20, 12, 14, 0.95), rgba(10, 11, 14, 0.9))",
  },
  plain: {
    app: "linear-gradient(180deg, #111318, #08090d)",
    chat: "linear-gradient(145deg, rgba(16, 17, 22, 0.96), rgba(8, 9, 12, 0.92))",
  },
};

const fruitCtx = fruitGame?.getContext("2d");
let fruitObjects = [];
let fruitSplashes = [];
let fruitSlash = [];
let fruitScore = 0;
let fruitTime = 30;
let fruitCombo = 1;
let fruitBestCombo = 1;
let fruitRunning = false;
let fruitLastFrame = 0;
let fruitSpawn = 0;
let fruitAnimation = 0;
let fruitPointerDown = false;

const fruitKinds = [
  { skin: "#32d74b", flesh: "#ff375f", seed: "#111" },
  { skin: "#ff9f0a", flesh: "#ffd6a5", seed: "#fff7ed" },
  { skin: "#bf5af2", flesh: "#f0abfc", seed: "#581c87" },
  { skin: "#ff453a", flesh: "#fecaca", seed: "#7f1d1d" },
];

const snakeCtx = snakeGame?.getContext("2d");
let snake = [];
let snakeFood = { x: 0, y: 0 };
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let snakeScore = 0;
let snakeBest = 0;
let snakeSpeed = 1;
let snakeRunning = false;
let snakePaused = false;
let snakeTimer = 0;
let snakeTouchStart = null;

const stickerPack = [
  { id: "sprout-hi", name: "冒芽嗨", image: "assets/stickers/sprout-hi.png" },
  { id: "berry-laugh", name: "莓有烦恼", image: "assets/stickers/berry-laugh.png" },
  { id: "moon-ok", name: "月亮收到", image: "assets/stickers/moon-ok.png" },
  { id: "toast-wow", name: "烤焦震惊", image: "assets/stickers/toast-wow.png" },
  { id: "cloud-sleep", name: "云朵困了", image: "assets/stickers/cloud-sleep.png" },
  { id: "star-fire", name: "星星发光", image: "assets/stickers/star-fire.png" },
  { id: "ice-calm", name: "冰镇淡定", image: "assets/stickers/ice-calm.png" },
  { id: "grape-shy", name: "葡萄害羞", image: "assets/stickers/grape-shy.png" },
];

const defaultVideos = [
  { id: "jNQXAC9IVRw", title: "Me at the zoo", note: "YouTube 第一支公开视频" },
  { id: "M7lc1UVf-VE", title: "YouTube Player Demo", note: "播放器示例" },
  { id: "aqz-KE-bpKQ", title: "Big Buck Bunny", note: "开放动画短片" },
  { id: "YE7VzlLtp-4", title: "Sintel", note: "开放动画短片" },
];

function serverHint() {
  return "请用服务器地址打开。部署到公网后，任何 Wi-Fi 或手机流量都能访问同一个网址。";
}

async function api(path, options = {}) {
  if (window.location.protocol === "file:") throw new Error(serverHint());
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
  }, 2300);
}

function initials(item) {
  return String(item?.name || item?.username || "?").slice(0, 1).toUpperCase();
}

function avatarBg(item) {
  return `linear-gradient(135deg, ${item?.color || "#0a84ff"}, rgba(255, 255, 255, 0.18))`;
}

function threadKey(thread) {
  return `${thread.type}:${thread.id}`;
}

function setLoggedIn(user) {
  me = user;
  authScreen.classList.add("hidden");
  chatShell.classList.remove("hidden");
  updateProfileUi(user);
  populateProfileSettings(user);
  loadThreads();
  startPolling();
}

function updateProfileUi(user) {
  myAvatar.textContent = initials(user);
  myAvatar.style.setProperty("--avatar", avatarBg(user));
  myName.textContent = user.name;
  myUsername.textContent = user.status ? `@${user.username} · ${user.status}` : `@${user.username}`;
}

function populateProfileSettings(user) {
  profileNameInput.value = user.name || "";
  profileStatusInput.value = user.status || "";
  profileColor = user.color || "#0a84ff";
  profileColorGrid?.querySelectorAll("[data-profile-color]").forEach((button) => {
    button.classList.toggle("active", button.dataset.profileColor === profileColor);
  });
}

function loadWallpaperSetting() {
  try {
    return {
      preset: localStorage.getItem("mini-chat-wallpaper") || "aurora",
      custom: localStorage.getItem("mini-chat-custom-wallpaper") || "",
    };
  } catch {
    return { preset: "aurora", custom: "" };
  }
}

function saveWallpaperSetting(preset, custom = "") {
  try {
    localStorage.setItem("mini-chat-wallpaper", preset);
    if (custom) localStorage.setItem("mini-chat-custom-wallpaper", custom);
    if (!custom && preset !== "custom") localStorage.removeItem("mini-chat-custom-wallpaper");
  } catch {
    showToast("图片太大了，无法保存为本地壁纸。");
  }
}

function applyWallpaper(preset, custom = "") {
  const root = document.documentElement;
  if (preset === "custom" && custom) {
    const image = `url("${custom}")`;
    root.style.setProperty(
      "--app-wallpaper",
      `linear-gradient(rgba(8, 9, 13, 0.32), rgba(8, 9, 13, 0.76)), ${image}`
    );
    root.style.setProperty(
      "--chat-wallpaper",
      `linear-gradient(rgba(8, 9, 13, 0.46), rgba(8, 9, 13, 0.52)), ${image}`
    );
  } else {
    const wallpaper = wallpaperPresets[preset] || wallpaperPresets.aurora;
    root.style.setProperty("--app-wallpaper", wallpaper.app);
    root.style.setProperty("--chat-wallpaper", wallpaper.chat);
  }
  wallpaperGrid?.querySelectorAll("[data-wallpaper]").forEach((button) => {
    button.classList.toggle("active", button.dataset.wallpaper === preset);
  });
}

function initializeWallpaper() {
  const setting = loadWallpaperSetting();
  applyWallpaper(setting.preset, setting.custom);
}

function loadPrefs() {
  try {
    return {
      compact: localStorage.getItem("mini-chat-compact") === "1",
      notify: localStorage.getItem("mini-chat-notify") !== "0",
    };
  } catch {
    return { compact: false, notify: true };
  }
}

function savePrefs() {
  try {
    localStorage.setItem("mini-chat-compact", appPrefs.compact ? "1" : "0");
    localStorage.setItem("mini-chat-notify", appPrefs.notify ? "1" : "0");
  } catch {
    return;
  }
}

function applyPrefs() {
  document.body.classList.toggle("compact", appPrefs.compact);
  if (compactToggle) compactToggle.checked = appPrefs.compact;
  if (notifyToggle) notifyToggle.checked = appPrefs.notify;
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

async function loadThreads() {
  try {
    const [contactData, groupData] = await Promise.all([
      api("/api/contacts"),
      api("/api/groups"),
    ]);
    contacts = (contactData.contacts || []).map((contact) => ({ ...contact, type: "direct" }));
    groups = (groupData.groups || []).map((group) => ({ ...group, type: "group" }));
    renderThreads();
    if (activeThread) {
      activeThread = [...contacts, ...groups].find((item) => threadKey(item) === threadKey(activeThread)) || activeThread;
      updateChatHead(activeThread);
    }
  } catch (error) {
    showToast(error.message);
  }
}

async function loadFriendRequests() {
  try {
    const data = await api("/api/friend-requests");
    friendRequests = data.requests || [];
    renderFriendRequests();
  } catch (error) {
    showToast(error.message);
  }
}

function renderFriendRequests() {
  if (!friendRequestList) return;
  if (!friendRequests.length) {
    friendRequestList.innerHTML = `<div class="empty-state"><span>暂无好友申请。</span></div>`;
    return;
  }
  friendRequestList.innerHTML = friendRequests
    .map((request) => {
      const incoming = request.to === me.id;
      const person = incoming ? request.fromUser : request.toUser;
      return `
        <article class="request-item">
          <div class="avatar small" style="--avatar:${avatarBg(person)}">${initials(person)}</div>
          <div>
            <strong>${escapeHtml(person.name)}</strong>
            <span>${incoming ? "想添加你为好友" : "等待对方通过"} · @${escapeHtml(person.username)}</span>
          </div>
          ${
            incoming
              ? `<div class="request-actions">
                  <button type="button" data-request-action="reject" data-request-id="${escapeHtml(request.id)}">拒绝</button>
                  <button class="primary" type="button" data-request-action="accept" data-request-id="${escapeHtml(request.id)}">通过</button>
                </div>`
              : `<em>等待中</em>`
          }
        </article>
      `;
    })
    .join("");
}

function renderThreads() {
  const threads = [...contacts, ...groups]
    .filter((thread) => {
      if (!threadFilter) return true;
      const last = thread.lastMessage?.stickerId ? "表情" : thread.lastMessage?.text || "";
      return `${thread.name} ${thread.username || ""} ${last}`.toLowerCase().includes(threadFilter);
    })
    .sort((a, b) => (b.lastMessage?.createdAt || b.createdAt || 0) - (a.lastMessage?.createdAt || a.createdAt || 0));
  threadsEl.innerHTML = "";
  if (!threads.length) {
    threadsEl.innerHTML = `<div class="empty-state"><span>${threadFilter ? "没有匹配的会话。" : "还没有会话。添加好友，或者创建一个群聊。"}</span></div>`;
    return;
  }

  threads.forEach((thread) => {
    const button = document.createElement("button");
    const active = activeThread && threadKey(activeThread) === threadKey(thread);
    button.className = `contact${active ? " active" : ""}`;
    button.type = "button";
    const label = thread.type === "group" ? `${thread.members?.length || 0} 人群` : `@${thread.username}`;
    const last = thread.lastMessage
      ? `${thread.lastMessage.senderName ? `${thread.lastMessage.senderName}: ` : ""}${thread.lastMessage.stickerId ? "[表情]" : thread.lastMessage.text}`
      : label;
    button.innerHTML = `
      <div class="avatar ${thread.type === "group" ? "group-avatar" : ""}" style="--avatar:${avatarBg(thread)}">${thread.type === "group" ? "群" : initials(thread)}</div>
      <div>
        <strong>${escapeHtml(thread.name)}</strong>
        <span>${escapeHtml(last)}</span>
      </div>
      ${thread.unread ? `<em class="badge">${thread.unread}</em>` : ""}
    `;
    button.addEventListener("click", () => openThread(thread));
    threadsEl.appendChild(button);
  });
}

async function openThread(thread) {
  activeThread = thread;
  lastMessageTime = 0;
  if (messageSearchInput) messageSearchInput.value = "";
  messageSearchBar?.classList.add("hidden");
  updateChatHead(thread);
  messageInput.disabled = false;
  sendButton.disabled = false;
  stickerToggle.disabled = false;
  toggleSearchButton.disabled = false;
  messagesEl.classList.remove("empty");
  messagesEl.innerHTML = "";
  chatShell.classList.add("in-chat");
  renderThreads();
  await loadMessages(true);
  messageInput.focus();
}

function updateChatHead(thread) {
  peerAvatar.textContent = thread.type === "group" ? "群" : initials(thread);
  peerAvatar.classList.toggle("group-avatar", thread.type === "group");
  peerAvatar.style.setProperty("--avatar", avatarBg(thread));
  peerName.textContent = thread.name;
  peerStatus.textContent =
    thread.type === "group"
      ? `${thread.members?.length || 0} 位成员 · 消息自动刷新`
      : `@${thread.username} · 消息自动刷新`;
}

async function loadMessages(reset = false) {
  if (!activeThread) return;
  try {
    const query =
      activeThread.type === "group"
        ? `groupId=${encodeURIComponent(activeThread.id)}`
        : `peerId=${encodeURIComponent(activeThread.id)}`;
    const data = await api(`/api/messages?${query}&since=${reset ? 0 : lastMessageTime}`);
    const messages = data.messages || [];
    if (reset) messagesEl.innerHTML = "";
    messages.forEach((message) => {
      appendMessage(message);
      if (!reset && message.from !== me.id) notifyNewMessage(message);
      lastMessageTime = Math.max(lastMessageTime, message.createdAt);
    });
    if (!messagesEl.children.length) {
      messagesEl.classList.add("empty");
      messagesEl.innerHTML = `<div class="empty-state"><strong>${escapeHtml(activeThread.name)}</strong><span>还没有消息，打个招呼吧。</span></div>`;
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
  const mine = message.from === me.id;
  const showSender = activeThread?.type === "group" && !mine;
  const item = document.createElement("div");
  item.className = `message${mine ? " mine" : ""}`;
  const sticker = stickerPack.find((item) => item.id === message.stickerId);
  item.dataset.search = `${message.senderName || ""} ${sticker ? sticker.name : message.text || ""}`.toLowerCase();
  const body = sticker
    ? `<div class="sticker-bubble">
        <img src="${escapeHtml(sticker.image)}" alt="${escapeHtml(sticker.name)}" />
        <small>${escapeHtml(sticker.name)}</small>
      </div>`
    : `<div class="bubble">${escapeHtml(message.text)}</div>`;
  item.innerHTML = `
    ${showSender ? `<div class="sender" style="color:${message.senderColor || "#0a84ff"}">${escapeHtml(message.senderName || "未知用户")}</div>` : ""}
    ${body}
    <div class="time">${formatTime(message.createdAt)}</div>
  `;
  messagesEl.appendChild(item);
  applyMessageSearch();
}

async function sendMessage() {
  if (!activeThread) return;
  const text = messageInput.value.trim();
  if (!text) return;
  messageInput.value = "";
  const payload = activeThread.type === "group" ? { groupId: activeThread.id, text } : { to: activeThread.id, text };
  try {
    const data = await api("/api/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    appendMessage(data.message);
    lastMessageTime = Math.max(lastMessageTime, data.message.createdAt);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    loadThreads();
  } catch (error) {
    showToast(error.message);
    messageInput.value = text;
  }
}

async function sendSticker(stickerId) {
  if (!activeThread) return;
  const payload =
    activeThread.type === "group"
      ? { groupId: activeThread.id, stickerId }
      : { to: activeThread.id, stickerId };
  try {
    const data = await api("/api/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    appendMessage(data.message);
    lastMessageTime = Math.max(lastMessageTime, data.message.createdAt);
    stickerPanel.classList.add("hidden");
    messagesEl.scrollTop = messagesEl.scrollHeight;
    loadThreads();
  } catch (error) {
    showToast(error.message);
  }
}

function renderStickerPanel() {
  if (!stickerPanel) return;
  stickerPanel.innerHTML = stickerPack
    .map(
      (sticker) => `
        <button
          class="sticker-button"
          type="button"
          data-sticker-id="${escapeHtml(sticker.id)}"
          aria-label="${escapeHtml(sticker.name)}"
        >
          <img src="${escapeHtml(sticker.image)}" alt="" />
          <small>${escapeHtml(sticker.name)}</small>
        </button>
      `
    )
    .join("");
}

function notifyNewMessage(message) {
  if (!appPrefs.notify || document.hidden === false) return;
  const text = message.stickerId ? "发来一个表情" : message.text;
  showToast(`${message.senderName || "新消息"}：${text}`);
}

function applyMessageSearch() {
  const query = (messageSearchInput?.value || "").trim().toLowerCase();
  messagesEl.querySelectorAll(".message").forEach((item) => {
    item.classList.toggle("search-hide", Boolean(query) && !item.dataset.search.includes(query));
  });
}

function openSettings(tab = "profile") {
  settingsOverlay.classList.remove("hidden");
  selectSettingsTab(tab);
  if (tab === "friends") loadFriendRequests();
}

function closeSettings() {
  settingsOverlay.classList.add("hidden");
}

function selectSettingsTab(tab) {
  settingsTabs?.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.settingsTab === tab);
  });
  settingsOverlay?.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.settingsPanel === tab);
  });
  if (tab === "friends") loadFriendRequests();
}

function startPolling() {
  window.clearInterval(pollTimer);
  pollTimer = window.setInterval(() => {
    loadThreads();
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

function openFruitGame() {
  if (!fruitGame || !fruitCtx) return;
  closeSettings();
  gameOverlay.classList.remove("hidden");
  resizeFruitCanvas();
  resetFruitGame();
  fruitRunning = true;
  fruitLastFrame = performance.now();
  cancelAnimationFrame(fruitAnimation);
  fruitAnimation = requestAnimationFrame(loopFruitGame);
}

function closeFruitGame() {
  fruitRunning = false;
  cancelAnimationFrame(fruitAnimation);
  gameOverlay.classList.add("hidden");
}

function resizeFruitCanvas() {
  const rect = fruitGame.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  fruitGame.width = Math.max(1, Math.floor(rect.width * ratio));
  fruitGame.height = Math.max(1, Math.floor(rect.height * ratio));
  fruitCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resetFruitGame() {
  fruitObjects = [];
  fruitSplashes = [];
  fruitSlash = [];
  fruitScore = 0;
  fruitTime = 30;
  fruitCombo = 1;
  fruitBestCombo = 1;
  fruitSpawn = 0;
  fruitPointerDown = false;
  updateFruitHud();
  gameHintEl.textContent = "拖动鼠标或手指划过水果，避开炸弹。";
}

function updateFruitHud() {
  gameScoreEl.textContent = fruitScore;
  gameTimeEl.textContent = Math.ceil(Math.max(0, fruitTime));
  gameComboEl.textContent = `x${fruitCombo}`;
}

function loopFruitGame(time) {
  const delta = Math.min(time - fruitLastFrame, 34);
  fruitLastFrame = time;
  updateFruitGame(delta);
  drawFruitGame();
  if (fruitRunning) fruitAnimation = requestAnimationFrame(loopFruitGame);
}

function updateFruitGame(delta) {
  fruitTime -= delta / 1000;
  if (fruitTime <= 0) {
    fruitTime = 0;
    fruitRunning = false;
    gameHintEl.textContent = `时间到！得分 ${fruitScore}，最高连击 x${fruitBestCombo}`;
  }

  fruitSpawn += delta;
  if (fruitRunning && fruitSpawn > 560) {
    fruitSpawn = 0;
    const count = Math.random() > 0.72 ? 2 : 1;
    for (let i = 0; i < count; i += 1) fruitObjects.push(createFruitObject());
  }

  fruitObjects.forEach((item) => {
    item.x += item.vx * (delta / 16.67);
    item.y += item.vy * (delta / 16.67);
    item.vy += 0.28 * (delta / 16.67);
    item.rotation += item.spin * (delta / 16.67);
  });
  fruitSplashes.forEach((piece) => {
    piece.age += delta;
    piece.x += piece.vx * (delta / 16.67);
    piece.y += piece.vy * (delta / 16.67);
    piece.vy += 0.08 * (delta / 16.67);
  });
  const height = fruitGame.clientHeight;
  fruitObjects = fruitObjects.filter((item) => item.y < height + 70 && !item.hit);
  fruitSplashes = fruitSplashes.filter((piece) => piece.age < 760);
  fruitSlash = fruitSlash.filter((point) => performance.now() - point.time < 180);
  updateFruitHud();
}

function createFruitObject() {
  const width = fruitGame.clientWidth;
  const height = fruitGame.clientHeight;
  const bomb = Math.random() < 0.12;
  const radius = bomb ? 23 : 25 + Math.random() * 12;
  const x = radius + Math.random() * Math.max(1, width - radius * 2);
  return {
    bomb,
    kind: fruitKinds[Math.floor(Math.random() * fruitKinds.length)],
    x,
    y: height + radius,
    vx: (width / 2 - x) / width * 6 + (Math.random() - 0.5) * 3,
    vy: -10 - Math.random() * 4.5,
    radius,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.12,
    hit: false,
  };
}

function drawFruitGame() {
  const width = fruitGame.clientWidth;
  const height = fruitGame.clientHeight;
  fruitCtx.clearRect(0, 0, width, height);
  const bg = fruitCtx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#101722");
  bg.addColorStop(1, "#07110d");
  fruitCtx.fillStyle = bg;
  fruitCtx.fillRect(0, 0, width, height);

  fruitCtx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 46; i += 1) {
    fruitCtx.fillRect((i * 83) % width, (i * 47) % height, 2, 2);
  }

  fruitSplashes.forEach(drawFruitSplash);
  fruitObjects.forEach((item) => item.bomb ? drawMiniBomb(item) : drawMiniFruit(item));
  drawFruitSlash();
}

function drawMiniFruit(item) {
  fruitCtx.save();
  fruitCtx.translate(item.x, item.y);
  fruitCtx.rotate(item.rotation);
  fruitCtx.fillStyle = item.kind.skin;
  fruitCtx.beginPath();
  fruitCtx.arc(0, 0, item.radius, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.fillStyle = item.kind.flesh;
  fruitCtx.beginPath();
  fruitCtx.arc(item.radius * 0.12, -item.radius * 0.08, item.radius * 0.64, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.fillStyle = "rgba(255,255,255,0.32)";
  fruitCtx.beginPath();
  fruitCtx.ellipse(-item.radius * 0.25, -item.radius * 0.28, item.radius * 0.18, item.radius * 0.1, -0.5, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.fillStyle = item.kind.seed;
  for (let i = 0; i < 4; i += 1) {
    fruitCtx.beginPath();
    fruitCtx.ellipse(Math.cos(i * 1.5) * item.radius * 0.28, Math.sin(i * 1.5) * item.radius * 0.24, 2, 4, i, 0, Math.PI * 2);
    fruitCtx.fill();
  }
  fruitCtx.restore();
}

function drawMiniBomb(item) {
  fruitCtx.save();
  fruitCtx.translate(item.x, item.y);
  fruitCtx.rotate(item.rotation);
  fruitCtx.fillStyle = "#14171c";
  fruitCtx.beginPath();
  fruitCtx.arc(0, 0, item.radius, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.strokeStyle = "#ffd60a";
  fruitCtx.lineWidth = 3;
  fruitCtx.beginPath();
  fruitCtx.moveTo(item.radius * 0.25, -item.radius * 0.75);
  fruitCtx.quadraticCurveTo(item.radius * 0.7, -item.radius * 1.14, item.radius, -item.radius * 0.82);
  fruitCtx.stroke();
  fruitCtx.fillStyle = "#fff";
  fruitCtx.beginPath();
  fruitCtx.arc(-item.radius * 0.32, -item.radius * 0.3, item.radius * 0.18, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.restore();
}

function drawFruitSplash(piece) {
  const alpha = Math.max(0, 1 - piece.age / 760);
  fruitCtx.save();
  fruitCtx.globalAlpha = alpha;
  fruitCtx.fillStyle = piece.color;
  fruitCtx.beginPath();
  fruitCtx.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2);
  fruitCtx.fill();
  fruitCtx.restore();
}

function drawFruitSlash() {
  if (fruitSlash.length < 2) return;
  fruitCtx.save();
  fruitCtx.lineCap = "round";
  fruitCtx.lineJoin = "round";
  fruitCtx.lineWidth = 7;
  fruitCtx.strokeStyle = "#ffffff";
  fruitCtx.shadowColor = "#32d74b";
  fruitCtx.shadowBlur = 18;
  fruitCtx.beginPath();
  fruitCtx.moveTo(fruitSlash[0].x, fruitSlash[0].y);
  fruitSlash.slice(1).forEach((point) => fruitCtx.lineTo(point.x, point.y));
  fruitCtx.stroke();
  fruitCtx.restore();
}

function fruitPointerPosition(event) {
  const rect = fruitGame.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function slashFruitAt(event) {
  if (!fruitRunning) return;
  const point = fruitPointerPosition(event);
  fruitSlash.push({ ...point, time: performance.now() });
  if (fruitSlash.length > 12) fruitSlash.shift();
  fruitObjects.forEach((item) => {
    if (item.hit || Math.hypot(item.x - point.x, item.y - point.y) > item.radius + 18) return;
    item.hit = true;
    if (item.bomb) {
      fruitCombo = 1;
      fruitScore = Math.max(0, fruitScore - 40);
      gameHintEl.textContent = "碰到炸弹，扣 40 分。";
      addFruitBurst(item, ["#ff453a", "#ffd60a", "#ffffff"], 18);
      return;
    }
    fruitScore += 10 * fruitCombo;
    fruitCombo = Math.min(9, fruitCombo + 1);
    fruitBestCombo = Math.max(fruitBestCombo, fruitCombo);
    gameHintEl.textContent = fruitCombo >= 5 ? "漂亮连击！" : "继续切！";
    addFruitBurst(item, [item.kind.skin, item.kind.flesh, "#ffffff"], 14);
  });
  updateFruitHud();
}

function addFruitBurst(item, colors, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    fruitSplashes.push({
      x: item.x,
      y: item.y,
      vx: Math.cos(angle) * (1.5 + Math.random() * 3.8),
      vy: Math.sin(angle) * (1.5 + Math.random() * 3.4) - 1.6,
      size: 3 + Math.random() * 4,
      color: colors[i % colors.length],
      age: 0,
    });
  }
}

function loadSnakeBest() {
  try {
    return Number(localStorage.getItem("mini-chat-snake-best") || 0);
  } catch {
    return 0;
  }
}

function saveSnakeBest() {
  try {
    localStorage.setItem("mini-chat-snake-best", String(snakeBest));
  } catch {
    return;
  }
}

function openSnakeGame() {
  if (!snakeGame || !snakeCtx) return;
  closeSettings();
  snakeOverlay.classList.remove("hidden");
  snakeBest = loadSnakeBest();
  resizeSnakeCanvas();
  resetSnakeGame();
  startSnakeLoop();
}

function closeSnakeGame() {
  snakeRunning = false;
  window.clearInterval(snakeTimer);
  snakeOverlay.classList.add("hidden");
}

function resizeSnakeCanvas() {
  const rect = snakeGame.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  snakeGame.width = Math.max(1, Math.floor(rect.width * ratio));
  snakeGame.height = Math.max(1, Math.floor(rect.height * ratio));
  snakeCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawSnakeGame();
}

function resetSnakeGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  snakeDir = { x: 1, y: 0 };
  snakeNextDir = { x: 1, y: 0 };
  snakeScore = 0;
  snakeSpeed = 1;
  snakeRunning = true;
  snakePaused = false;
  pauseSnakeButton.textContent = "暂停";
  placeSnakeFood();
  updateSnakeHud();
  snakeHintEl.textContent = "方向键或滑动控制，吃到苹果会加速。";
  drawSnakeGame();
}

function startSnakeLoop() {
  window.clearInterval(snakeTimer);
  snakeTimer = window.setInterval(stepSnakeGame, Math.max(70, 170 - snakeSpeed * 12));
}

function updateSnakeHud() {
  snakeScoreEl.textContent = snakeScore;
  snakeBestEl.textContent = snakeBest;
  snakeSpeedEl.textContent = snakeSpeed;
}

function placeSnakeFood() {
  do {
    snakeFood = {
      x: Math.floor(Math.random() * 18) + 1,
      y: Math.floor(Math.random() * 18) + 1,
    };
  } while (snake.some((part) => part.x === snakeFood.x && part.y === snakeFood.y));
}

function setSnakeDirection(x, y) {
  if (!snakeRunning || snakePaused) return;
  if (snakeDir.x + x === 0 && snakeDir.y + y === 0) return;
  snakeNextDir = { x, y };
}

function stepSnakeGame() {
  if (!snakeRunning || snakePaused) return;
  snakeDir = snakeNextDir;
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
  const hitWall = head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) {
    snakeRunning = false;
    snakeHintEl.textContent = `游戏结束，得分 ${snakeScore}。`;
    drawSnakeGame();
    return;
  }

  snake.unshift(head);
  if (head.x === snakeFood.x && head.y === snakeFood.y) {
    snakeScore += 10;
    snakeBest = Math.max(snakeBest, snakeScore);
    snakeSpeed = Math.min(10, 1 + Math.floor(snakeScore / 40));
    saveSnakeBest();
    placeSnakeFood();
    startSnakeLoop();
  } else {
    snake.pop();
  }
  updateSnakeHud();
  drawSnakeGame();
}

function drawSnakeGame() {
  if (!snakeGame || !snakeCtx) return;
  const size = Math.min(snakeGame.clientWidth, snakeGame.clientHeight);
  const cell = size / 20;
  snakeCtx.clearRect(0, 0, snakeGame.clientWidth, snakeGame.clientHeight);
  const bg = snakeCtx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#111722");
  bg.addColorStop(1, "#07130c");
  snakeCtx.fillStyle = bg;
  snakeCtx.fillRect(0, 0, size, size);
  snakeCtx.strokeStyle = "rgba(255,255,255,0.05)";
  snakeCtx.lineWidth = 1;
  for (let i = 0; i <= 20; i += 1) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(i * cell, 0);
    snakeCtx.lineTo(i * cell, size);
    snakeCtx.moveTo(0, i * cell);
    snakeCtx.lineTo(size, i * cell);
    snakeCtx.stroke();
  }

  snakeCtx.fillStyle = "#ff453a";
  snakeCtx.beginPath();
  snakeCtx.arc((snakeFood.x + 0.5) * cell, (snakeFood.y + 0.5) * cell, cell * 0.34, 0, Math.PI * 2);
  snakeCtx.fill();
  snakeCtx.fillStyle = "#32d74b";
  snakeCtx.fillRect((snakeFood.x + 0.54) * cell, (snakeFood.y + 0.12) * cell, cell * 0.12, cell * 0.22);

  snake.forEach((part, index) => {
    const inset = index === 0 ? 0.08 : 0.14;
    snakeCtx.fillStyle = index === 0 ? "#32d74b" : "#2fd158";
    snakeCtx.beginPath();
    roundRect(snakeCtx, (part.x + inset) * cell, (part.y + inset) * cell, cell * (1 - inset * 2), cell * (1 - inset * 2), cell * 0.24);
    snakeCtx.fill();
  });

  if (!snakeRunning) {
    snakeCtx.fillStyle = "rgba(0,0,0,0.52)";
    snakeCtx.fillRect(0, 0, size, size);
    snakeCtx.fillStyle = "#fff";
    snakeCtx.font = "700 24px -apple-system, BlinkMacSystemFont, sans-serif";
    snakeCtx.textAlign = "center";
    snakeCtx.fillText("游戏结束", size / 2, size / 2 - 8);
    snakeCtx.font = "500 14px -apple-system, BlinkMacSystemFont, sans-serif";
    snakeCtx.fillText("点击重新开始再来一局", size / 2, size / 2 + 22);
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
}

function loadVideos() {
  try {
    const saved = JSON.parse(localStorage.getItem("mini-chat-videos") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveVideos() {
  try {
    localStorage.setItem("mini-chat-videos", JSON.stringify(videoCustomItems));
  } catch {
    showToast("视频列表保存失败。");
  }
}

function parseYouTubeId(value) {
  const raw = String(value || "").trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
    return marker >= 0 ? parts[marker + 1] || "" : "";
  } catch {
    return "";
  }
}

function openVideoFeed() {
  closeSettings();
  videoCustomItems = loadVideos();
  videoItems = videoCustomItems.length ? [...videoCustomItems] : [...defaultVideos];
  videoNextPageToken = "";
  videoApiEnabled = true;
  renderVideoFeed();
  videoOverlay.classList.remove("hidden");
  loadYouTubeVideos({ append: true });
}

function closeVideoFeed() {
  videoOverlay.classList.add("hidden");
  videoFeed.querySelectorAll("iframe").forEach((frame) => {
    frame.src = frame.src;
  });
}

function renderVideoFeed() {
  if (!videoFeed) return;
  videoFeed.innerHTML = videoItems
    .map(
      (item, index) => `
        <section class="video-card" data-video-index="${index}">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${escapeHtml(item.id)}?rel=0&playsinline=1"
            title="${escapeHtml(item.title || "YouTube video")}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
          <div class="video-meta">
            <strong>${escapeHtml(item.title || "YouTube 视频")}</strong>
            <span>${escapeHtml(item.note || "来自 YouTube")}</span>
          </div>
        </section>
      `
    )
    .join("");
}

async function loadYouTubeVideos({ append = true, query = videoQuery } = {}) {
  if (videoLoading || !videoApiEnabled) return;
  videoLoading = true;
  loadMoreVideosButton.disabled = true;
  loadMoreVideosButton.textContent = "加载中";
  try {
    const params = new URLSearchParams({ q: query });
    if (append && videoNextPageToken) params.set("pageToken", videoNextPageToken);
    const data = await api(`/api/videos?${params.toString()}`);
    videoQuery = data.query || query;
    videoNextPageToken = data.nextPageToken || "";
    const incoming = (data.videos || []).filter((video) => !videoItems.some((item) => item.id === video.id));
    videoItems = append ? [...videoItems, ...incoming] : [...videoCustomItems, ...incoming];
    if (!videoItems.length) videoItems = [...defaultVideos];
    renderVideoFeed();
    if (!incoming.length && !videoNextPageToken) showToast("没有更多视频了。");
  } catch (error) {
    videoApiEnabled = false;
    if (!videoItems.length) {
      videoItems = videoCustomItems.length ? [...videoCustomItems] : [...defaultVideos];
      renderVideoFeed();
    }
    showToast(`${error.message} 先使用内置视频流。`);
  } finally {
    videoLoading = false;
    loadMoreVideosButton.disabled = false;
    loadMoreVideosButton.textContent = "加载更多";
  }
}

function scrollVideo(direction) {
  const current = Math.round(videoFeed.scrollTop / Math.max(1, videoFeed.clientHeight));
  const next = Math.max(0, Math.min(videoItems.length - 1, current + direction));
  videoFeed.scrollTo({ top: next * videoFeed.clientHeight, behavior: "smooth" });
  if (videoItems.length - next < 3) loadYouTubeVideos({ append: true });
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
    if (data.status === "pending") {
      showToast("好友申请已发送，等待对方通过。");
      await loadFriendRequests();
      openSettings("friends");
      return;
    }
    showToast(data.status === "accepted" ? `已通过 ${data.contact.name} 的申请` : `已添加 ${data.contact.name}`);
    await loadThreads();
    openThread({ ...data.contact, type: "direct" });
  } catch (error) {
    showToast(error.message);
  }
});

groupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = groupNameInput.value.trim();
  const usernames = groupMembersInput.value.trim();
  if (!name || !usernames) {
    showToast("请输入群名和成员账号。");
    return;
  }
  try {
    const data = await api("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, usernames }),
    });
    groupNameInput.value = "";
    groupMembersInput.value = "";
    showToast(`已创建群聊：${data.group.name}`);
    await loadThreads();
    const group = groups.find((item) => item.id === data.group.id) || { ...data.group, type: "group" };
    closeSettings();
    openThread(group);
  } catch (error) {
    showToast(error.message);
  }
});

threadSearchInput?.addEventListener("input", () => {
  threadFilter = threadSearchInput.value.trim().toLowerCase();
  renderThreads();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

stickerToggle?.addEventListener("click", () => {
  if (!activeThread) return;
  stickerPanel.classList.toggle("hidden");
});

stickerPanel?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sticker-id]");
  if (!button) return;
  sendSticker(button.dataset.stickerId);
});

toggleSearchButton?.addEventListener("click", () => {
  if (!activeThread) return;
  messageSearchBar.classList.toggle("hidden");
  if (!messageSearchBar.classList.contains("hidden")) messageSearchInput.focus();
});

messageSearchInput?.addEventListener("input", applyMessageSearch);

clearMessageSearchButton?.addEventListener("click", () => {
  messageSearchInput.value = "";
  applyMessageSearch();
  messageSearchInput.focus();
});

openSettingsButton?.addEventListener("click", () => openSettings("profile"));
closeSettingsButton?.addEventListener("click", closeSettings);

settingsOverlay?.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});

settingsTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-settings-tab]");
  if (!button) return;
  selectSettingsTab(button.dataset.settingsTab);
});

friendRequestList?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-request-action]");
  if (!button) return;
  try {
    const data = await api(`/api/friend-requests/${button.dataset.requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: button.dataset.requestAction }),
    });
    showToast(data.status === "accepted" ? "已通过好友申请。" : "已拒绝好友申请。");
    await loadFriendRequests();
    await loadThreads();
  } catch (error) {
    showToast(error.message);
  }
});

profileColorGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile-color]");
  if (!button) return;
  profileColor = button.dataset.profileColor;
  profileColorGrid.querySelectorAll("[data-profile-color]").forEach((item) => item.classList.toggle("active", item === button));
});

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: profileNameInput.value,
        status: profileStatusInput.value,
        color: profileColor,
      }),
    });
    me = data.user;
    updateProfileUi(me);
    populateProfileSettings(me);
    showToast("资料已保存。");
    await loadThreads();
  } catch (error) {
    showToast(error.message);
  }
});

compactToggle?.addEventListener("change", () => {
  appPrefs.compact = compactToggle.checked;
  savePrefs();
  applyPrefs();
});

notifyToggle?.addEventListener("change", () => {
  appPrefs.notify = notifyToggle.checked;
  savePrefs();
  applyPrefs();
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  window.location.reload();
});

backButton.addEventListener("click", () => {
  chatShell.classList.remove("in-chat");
});

wallpaperGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-wallpaper]");
  if (!button) return;
  const preset = button.dataset.wallpaper || "aurora";
  saveWallpaperSetting(preset);
  applyWallpaper(preset);
  showToast(`已切换壁纸：${button.textContent}`);
});

wallpaperFileInput?.addEventListener("change", () => {
  const file = wallpaperFileInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件。");
    return;
  }
  if (file.size > 1_800_000) {
    showToast("图片有点大，建议选择 1.8MB 以内的图片。");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const dataUrl = String(reader.result || "");
    saveWallpaperSetting("custom", dataUrl);
    applyWallpaper("custom", dataUrl);
    showToast("已设置自己的壁纸。");
  });
  reader.readAsDataURL(file);
});

openGameButton?.addEventListener("click", openFruitGame);
closeGameButton?.addEventListener("click", closeFruitGame);
restartGameButton?.addEventListener("click", () => {
  resetFruitGame();
  fruitRunning = true;
  fruitLastFrame = performance.now();
  cancelAnimationFrame(fruitAnimation);
  fruitAnimation = requestAnimationFrame(loopFruitGame);
});

openSnakeButton?.addEventListener("click", openSnakeGame);
closeSnakeButton?.addEventListener("click", closeSnakeGame);
restartSnakeButton?.addEventListener("click", () => {
  resetSnakeGame();
  startSnakeLoop();
});
pauseSnakeButton?.addEventListener("click", () => {
  if (!snakeRunning) return;
  snakePaused = !snakePaused;
  pauseSnakeButton.textContent = snakePaused ? "继续" : "暂停";
  snakeHintEl.textContent = snakePaused ? "已暂停。" : "方向键或滑动控制，吃到苹果会加速。";
});

openVideoButton?.addEventListener("click", openVideoFeed);
closeVideoButton?.addEventListener("click", closeVideoFeed);
nextVideoButton?.addEventListener("click", () => scrollVideo(1));
prevVideoButton?.addEventListener("click", () => scrollVideo(-1));
loadMoreVideosButton?.addEventListener("click", () => loadYouTubeVideos({ append: true }));
resetVideosButton?.addEventListener("click", () => {
  videoCustomItems = [];
  videoItems = [...defaultVideos];
  videoNextPageToken = "";
  videoApiEnabled = true;
  saveVideos();
  renderVideoFeed();
  showToast("视频流已重置。");
});

videoAddForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = parseYouTubeId(videoUrlInput.value);
  if (!id) {
    const query = videoUrlInput.value.trim();
    if (!query) return;
    videoQuery = query;
    videoNextPageToken = "";
    videoApiEnabled = true;
    videoUrlInput.value = "";
    loadYouTubeVideos({ append: false, query });
    return;
  }
  if (videoItems.some((item) => item.id === id)) {
    showToast("这个视频已经在列表里。");
    return;
  }
  const item = { id, title: "自定义 YouTube 视频", note: "你添加的视频" };
  videoCustomItems.unshift(item);
  videoItems.unshift(item);
  saveVideos();
  renderVideoFeed();
  videoUrlInput.value = "";
  videoFeed.scrollTo({ top: 0, behavior: "smooth" });
});

videoFeed?.addEventListener("scroll", () => {
  if (videoFeed.scrollTop + videoFeed.clientHeight * 2 >= videoFeed.scrollHeight) {
    loadYouTubeVideos({ append: true });
  }
});

window.addEventListener("keydown", (event) => {
  if (snakeOverlay?.classList.contains("hidden")) return;
  const keys = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    w: [0, -1],
    s: [0, 1],
    a: [-1, 0],
    d: [1, 0],
  };
  const direction = keys[event.key];
  if (!direction) return;
  event.preventDefault();
  setSnakeDirection(direction[0], direction[1]);
});

snakeGame?.addEventListener("pointerdown", (event) => {
  snakeTouchStart = { x: event.clientX, y: event.clientY };
});

snakeGame?.addEventListener("pointerup", (event) => {
  if (!snakeTouchStart) return;
  const dx = event.clientX - snakeTouchStart.x;
  const dy = event.clientY - snakeTouchStart.y;
  snakeTouchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    setSnakeDirection(dx > 0 ? 1 : -1, 0);
  } else {
    setSnakeDirection(0, dy > 0 ? 1 : -1);
  }
});

fruitGame?.addEventListener("pointerdown", (event) => {
  fruitPointerDown = true;
  fruitGame.setPointerCapture?.(event.pointerId);
  slashFruitAt(event);
});

fruitGame?.addEventListener("pointermove", (event) => {
  if (fruitPointerDown) slashFruitAt(event);
});

fruitGame?.addEventListener("pointerup", () => {
  fruitPointerDown = false;
});

fruitGame?.addEventListener("pointercancel", () => {
  fruitPointerDown = false;
});

window.addEventListener("resize", () => {
  if (!gameOverlay?.classList.contains("hidden")) resizeFruitCanvas();
  if (!snakeOverlay?.classList.contains("hidden")) resizeSnakeCanvas();
});

initializeWallpaper();
appPrefs = loadPrefs();
applyPrefs();
renderStickerPanel();
boot();
