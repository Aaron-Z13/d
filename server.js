const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");

const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, "public");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");
const youtubeApiKey = process.env.YOUTUBE_API_KEY || "";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

function emptyDb() {
  return { users: [], sessions: {}, messages: [], groups: [], friendRequests: [] };
}

function loadDb() {
  try {
    return normalizeDb(JSON.parse(fs.readFileSync(dbPath, "utf8")));
  } catch {
    return emptyDb();
  }
}

function normalizeDb(data) {
  return {
    users: Array.isArray(data.users) ? data.users : [],
    sessions: data.sessions && typeof data.sessions === "object" ? data.sessions : {},
    messages: Array.isArray(data.messages) ? data.messages : [],
    groups: Array.isArray(data.groups) ? data.groups : [],
    friendRequests: Array.isArray(data.friendRequests) ? data.friendRequests : [],
  };
}

function saveDb(db) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

let db = loadDb();

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

function currentUser(req) {
  const token = parseCookies(req).chat_session;
  if (!token) return null;
  const userId = db.sessions[token];
  return db.users.find((user) => user.id === userId) || null;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    color: user.color,
    status: user.status || "",
    createdAt: user.createdAt,
  };
}

function publicFriendRequest(request) {
  return {
    id: request.id,
    from: request.from,
    to: request.to,
    status: request.status,
    createdAt: request.createdAt,
    respondedAt: request.respondedAt || 0,
    fromUser: publicUser(db.users.find((user) => user.id === request.from) || { id: request.from, name: "未知用户", username: "", color: "#8e8e93" }),
    toUser: publicUser(db.users.find((user) => user.id === request.to) || { id: request.to, name: "未知用户", username: "", color: "#8e8e93" }),
  };
}

function conversationId(a, b) {
  return [a, b].sort().join(":");
}

function groupChatId(groupId) {
  return `group:${groupId}`;
}

function addMutualContact(a, b) {
  a.contacts ||= [];
  b.contacts ||= [];
  if (!a.contacts.includes(b.id)) a.contacts.push(b.id);
  if (!b.contacts.includes(a.id)) b.contacts.push(a.id);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function httpsJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let raw = "";
        response.on("data", (chunk) => {
          raw += chunk;
          if (raw.length > 2_000_000) {
            reject(new Error("YouTube response too large"));
            response.destroy();
          }
        });
        response.on("end", () => {
          try {
            const data = JSON.parse(raw || "{}");
            if (response.statusCode < 200 || response.statusCode >= 300) {
              reject(new Error(data.error?.message || "YouTube API 请求失败。"));
              return;
            }
            resolve(data);
          } catch {
            reject(new Error("YouTube API 返回格式不正确。"));
          }
        });
      })
      .on("error", () => reject(new Error("无法连接 YouTube API。")));
  });
}

async function searchYouTubeVideos(query, pageToken = "") {
  const params = new URLSearchParams({
    key: youtubeApiKey,
    part: "snippet",
    type: "video",
    maxResults: "8",
    q: query,
    safeSearch: "moderate",
    videoEmbeddable: "true",
  });
  if (pageToken) params.set("pageToken", pageToken);
  const data = await httpsJson(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  const videos = (data.items || [])
    .map((item) => ({
      id: item.id?.videoId || "",
      title: cleanText(item.snippet?.title || "YouTube 视频", 90),
      note: cleanText(item.snippet?.channelTitle || "来自 YouTube", 80),
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
    }))
    .filter((item) => /^[a-zA-Z0-9_-]{11}$/.test(item.id));
  return {
    videos,
    nextPageToken: data.nextPageToken || "",
    query,
  };
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      json(res, 200, {
        ok: true,
        users: db.users.length,
        groups: db.groups.length,
        messages: db.messages.length,
        dataDir,
        youtubeConfigured: Boolean(youtubeApiKey),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/register") {
      const body = await readBody(req);
      const username = cleanUsername(body.username);
      const name = cleanName(body.name || body.username);
      const password = String(body.password || "");
      if (!username || !name || password.length < 4) {
        json(res, 400, { error: "账号、昵称和至少 4 位密码必填。" });
        return;
      }
      if (db.users.some((user) => user.username === username)) {
        json(res, 409, { error: "这个账号已经被注册。" });
        return;
      }
      const user = {
        id: crypto.randomUUID(),
        username,
        name,
        color: body.color || randomColor(),
        status: "在线",
        passwordHash: hashPassword(password),
        contacts: [],
        createdAt: Date.now(),
      };
      db.users.push(user);
      saveDb(db);
      createSession(res, user);
      json(res, 201, { user: publicUser(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      const username = cleanUsername(body.username);
      const user = db.users.find((item) => item.username === username);
      if (!user || !verifyPassword(String(body.password || ""), user.passwordHash)) {
        json(res, 401, { error: "账号或密码不正确。" });
        return;
      }
      createSession(res, user);
      json(res, 200, { user: publicUser(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = parseCookies(req).chat_session;
      if (token) delete db.sessions[token];
      saveDb(db);
      res.writeHead(204, { "set-cookie": "chat_session=; Path=/; Max-Age=0; SameSite=Lax" });
      res.end();
      return;
    }

    const user = currentUser(req);
    if (!user) {
      json(res, 401, { error: "请先登录。" });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      json(res, 200, { user: publicUser(user) });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/me") {
      const body = await readBody(req);
      const name = cleanName(body.name || user.name);
      const status = cleanStatus(body.status || user.status || "在线");
      const color = cleanColor(body.color || user.color);
      if (!name) {
        json(res, 400, { error: "昵称不能为空。" });
        return;
      }
      user.name = name;
      user.status = status;
      user.color = color;
      saveDb(db);
      json(res, 200, { user: publicUser(user) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/users") {
      const query = cleanUsername(url.searchParams.get("q") || "");
      const users = db.users
        .filter((item) => item.id !== user.id)
        .filter((item) => !query || item.username.includes(query) || item.name.toLowerCase().includes(query))
        .slice(0, 20)
        .map(publicUser);
      json(res, 200, { users });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/friend-requests") {
      const requests = db.friendRequests
        .filter((request) => request.status === "pending" && (request.from === user.id || request.to === user.id))
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(publicFriendRequest);
      json(res, 200, { requests });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/videos") {
      if (!youtubeApiKey) {
        json(res, 503, { error: "还没有配置 YOUTUBE_API_KEY。" });
        return;
      }
      const query = cleanVideoQuery(url.searchParams.get("q") || "creative coding");
      const pageToken = cleanPageToken(url.searchParams.get("pageToken") || "");
      const data = await searchYouTubeVideos(query, pageToken);
      json(res, 200, data);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/contacts") {
      const contacts = user.contacts
        .map((id) => db.users.find((item) => item.id === id))
        .filter(Boolean)
        .map((contact) => ({
          ...publicUser(contact),
          unread: unreadCount(user.id, contact.id),
          lastMessage: lastMessage(user.id, contact.id),
        }))
        .sort((a, b) => (b.lastMessage?.createdAt || 0) - (a.lastMessage?.createdAt || 0));
      json(res, 200, { contacts });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/groups") {
      const groups = db.groups
        .filter((group) => group.members.includes(user.id))
        .map((group) => ({
          id: group.id,
          name: group.name,
          ownerId: group.ownerId,
          color: group.color,
          members: group.members
            .map((id) => db.users.find((item) => item.id === id))
            .filter(Boolean)
            .map(publicUser),
          unread: unreadGroupCount(user.id, group.id),
          lastMessage: lastGroupMessage(group.id),
          createdAt: group.createdAt,
        }))
        .sort((a, b) => (b.lastMessage?.createdAt || b.createdAt || 0) - (a.lastMessage?.createdAt || a.createdAt || 0));
      json(res, 200, { groups });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/contacts") {
      const body = await readBody(req);
      const target = db.users.find((item) => item.username === cleanUsername(body.username) || item.id === body.userId);
      if (!target || target.id === user.id) {
        json(res, 404, { error: "没有找到这个用户。" });
        return;
      }
      user.contacts ||= [];
      target.contacts ||= [];
      if (user.contacts.includes(target.id)) {
        json(res, 200, { status: "already", contact: publicUser(target) });
        return;
      }
      const reverseRequest = db.friendRequests.find(
        (request) => request.from === target.id && request.to === user.id && request.status === "pending"
      );
      if (reverseRequest) {
        reverseRequest.status = "accepted";
        reverseRequest.respondedAt = Date.now();
        addMutualContact(user, target);
        saveDb(db);
        json(res, 200, { status: "accepted", contact: publicUser(target) });
        return;
      }
      const existingRequest = db.friendRequests.find(
        (request) => request.from === user.id && request.to === target.id && request.status === "pending"
      );
      if (existingRequest) {
        json(res, 202, { status: "pending", request: publicFriendRequest(existingRequest) });
        return;
      }
      const request = {
        id: crypto.randomUUID(),
        from: user.id,
        to: target.id,
        status: "pending",
        createdAt: Date.now(),
      };
      db.friendRequests.push(request);
      saveDb(db);
      json(res, 202, { status: "pending", request: publicFriendRequest(request) });
      return;
    }

    if (req.method === "PATCH" && url.pathname.match(/^\/api\/friend-requests\/[^/]+$/)) {
      const requestId = url.pathname.split("/")[3];
      const request = db.friendRequests.find((item) => item.id === requestId && item.status === "pending");
      if (!request || request.to !== user.id) {
        json(res, 404, { error: "好友申请不存在。" });
        return;
      }
      const body = await readBody(req);
      const action = String(body.action || "").trim();
      if (action === "accept") {
        const sender = db.users.find((item) => item.id === request.from);
        if (!sender) {
          json(res, 404, { error: "申请人不存在。" });
          return;
        }
        request.status = "accepted";
        request.respondedAt = Date.now();
        addMutualContact(user, sender);
        saveDb(db);
        json(res, 200, { status: "accepted", contact: publicUser(sender) });
        return;
      }
      if (action === "reject") {
        request.status = "rejected";
        request.respondedAt = Date.now();
        saveDb(db);
        json(res, 200, { status: "rejected" });
        return;
      }
      json(res, 400, { error: "请选择通过或拒绝。" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/groups") {
      const body = await readBody(req);
      const name = cleanName(body.name || "新群聊");
      const usernames = Array.isArray(body.usernames)
        ? body.usernames
        : String(body.usernames || "").split(/[,，\s]+/);
      const members = new Set([user.id]);
      usernames
        .map(cleanUsername)
        .filter(Boolean)
        .forEach((username) => {
          const member = db.users.find((item) => item.username === username);
          if (member) members.add(member.id);
        });
      if (!name || members.size < 2) {
        json(res, 400, { error: "群名必填，并且至少添加 1 个有效账号。" });
        return;
      }
      const group = {
        id: crypto.randomUUID(),
        name,
        ownerId: user.id,
        members: [...members],
        color: randomColor(),
        createdAt: Date.now(),
      };
      db.groups.push(group);
      saveDb(db);
      json(res, 201, { group });
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/groups\/[^/]+\/members$/)) {
      const groupId = url.pathname.split("/")[3];
      const group = db.groups.find((item) => item.id === groupId && item.members.includes(user.id));
      if (!group) {
        json(res, 404, { error: "群聊不存在。" });
        return;
      }
      const body = await readBody(req);
      const target = db.users.find((item) => item.username === cleanUsername(body.username) || item.id === body.userId);
      if (!target) {
        json(res, 404, { error: "没有找到这个用户。" });
        return;
      }
      if (!group.members.includes(target.id)) group.members.push(target.id);
      saveDb(db);
      json(res, 200, { group });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/messages") {
      const peerId = url.searchParams.get("peerId");
      const groupId = url.searchParams.get("groupId");
      if (groupId) {
        const group = db.groups.find((item) => item.id === groupId && item.members.includes(user.id));
        if (!group) {
          json(res, 404, { error: "群聊不存在。" });
          return;
        }
        const since = Number(url.searchParams.get("since") || 0);
        const chatId = groupChatId(groupId);
        const messages = db.messages
          .filter((message) => message.chatId === chatId && message.createdAt > since)
          .slice(-160)
          .map(decorateMessage);
        db.messages.forEach((message) => {
          if (message.chatId === chatId) {
            message.readBy ||= {};
            message.readBy[user.id] = Date.now();
          }
        });
        saveDb(db);
        json(res, 200, { messages });
        return;
      }
      if (!peerId || !user.contacts.includes(peerId)) {
        json(res, 400, { error: "请选择联系人。" });
        return;
      }
      const since = Number(url.searchParams.get("since") || 0);
      const chatId = conversationId(user.id, peerId);
      const messages = db.messages
        .filter((message) => message.chatId === chatId && message.createdAt > since)
        .slice(-120)
        .map(decorateMessage);
      db.messages.forEach((message) => {
        if (message.chatId === chatId && message.to === user.id) message.readAt ||= Date.now();
      });
      saveDb(db);
      json(res, 200, { messages });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/messages") {
      const body = await readBody(req);
      const to = String(body.to || "");
      const groupId = String(body.groupId || "");
      const text = String(body.text || "").trim().slice(0, 1200);
      const stickerId = String(body.stickerId || "").trim().slice(0, 40);
      const replyTo = String(body.replyTo || "").trim();
      const kind = stickerId ? "sticker" : "text";
      const content = stickerId || text;
      if (groupId) {
        const group = db.groups.find((item) => item.id === groupId && item.members.includes(user.id));
        if (!group || !content) {
          json(res, 400, { error: "群聊或消息内容不正确。" });
          return;
        }
        const message = {
          id: crypto.randomUUID(),
          chatId: groupChatId(group.id),
          groupId: group.id,
          from: user.id,
          type: kind,
          text: kind === "text" ? text : "",
          stickerId,
          replyTo: validReplyId(replyTo, groupChatId(group.id)),
          readBy: { [user.id]: Date.now() },
          createdAt: Date.now(),
        };
        db.messages.push(message);
        saveDb(db);
        json(res, 201, { message: decorateMessage(message) });
        return;
      }
      if (!to || !user.contacts.includes(to) || !content) {
        json(res, 400, { error: "消息内容或联系人不正确。" });
        return;
      }
      const target = db.users.find((item) => item.id === to);
      if (!target) {
        json(res, 404, { error: "联系人不存在。" });
        return;
      }
      const message = {
        id: crypto.randomUUID(),
        chatId: conversationId(user.id, to),
        from: user.id,
        to,
        type: kind,
        text: kind === "text" ? text : "",
        stickerId,
        replyTo: validReplyId(replyTo, conversationId(user.id, to)),
        createdAt: Date.now(),
      };
      db.messages.push(message);
      saveDb(db);
      json(res, 201, { message: decorateMessage(message) });
      return;
    }

    if (req.method === "PATCH" && url.pathname.match(/^\/api\/messages\/[^/]+$/)) {
      const messageId = url.pathname.split("/")[3];
      const message = db.messages.find((item) => item.id === messageId);
      if (!message || !canSeeMessage(user, message)) {
        json(res, 404, { error: "消息不存在。" });
        return;
      }
      if (message.from !== user.id || message.stickerId || message.deletedAt) {
        json(res, 403, { error: "只能编辑自己发送的文字消息。" });
        return;
      }
      const body = await readBody(req);
      const text = String(body.text || "").trim().slice(0, 1200);
      if (!text) {
        json(res, 400, { error: "消息内容不能为空。" });
        return;
      }
      message.text = text;
      message.editedAt = Date.now();
      saveDb(db);
      json(res, 200, { message: decorateMessage(message) });
      return;
    }

    if (req.method === "DELETE" && url.pathname.match(/^\/api\/messages\/[^/]+$/)) {
      const messageId = url.pathname.split("/")[3];
      const message = db.messages.find((item) => item.id === messageId);
      if (!message || !canSeeMessage(user, message)) {
        json(res, 404, { error: "消息不存在。" });
        return;
      }
      if (message.from !== user.id) {
        json(res, 403, { error: "只能撤回自己发送的消息。" });
        return;
      }
      message.deletedAt = Date.now();
      message.text = "";
      message.stickerId = "";
      message.type = "deleted";
      saveDb(db);
      json(res, 200, { message: decorateMessage(message) });
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/messages\/[^/]+\/reactions$/)) {
      const messageId = url.pathname.split("/")[3];
      const message = db.messages.find((item) => item.id === messageId);
      if (!message || !canSeeMessage(user, message) || message.deletedAt) {
        json(res, 404, { error: "消息不存在。" });
        return;
      }
      const body = await readBody(req);
      const emoji = cleanReaction(body.emoji);
      if (!emoji) {
        json(res, 400, { error: "请选择一个反应。" });
        return;
      }
      message.reactions ||= {};
      message.reactions[emoji] ||= [];
      if (message.reactions[emoji].includes(user.id)) {
        message.reactions[emoji] = message.reactions[emoji].filter((id) => id !== user.id);
      } else {
        message.reactions[emoji].push(user.id);
      }
      Object.keys(message.reactions).forEach((key) => {
        if (!message.reactions[key].length) delete message.reactions[key];
      });
      saveDb(db);
      json(res, 200, { message: decorateMessage(message) });
      return;
    }

    json(res, 404, { error: "接口不存在。" });
  } catch (error) {
    json(res, 500, { error: error.message || "服务器错误。" });
  }
}

function createSession(res, user) {
  const token = crypto.randomBytes(24).toString("hex");
  db.sessions[token] = user.id;
  saveDb(db);
  res.setHeader("set-cookie", `chat_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`);
}

function cleanUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
}

function cleanName(value) {
  return String(value || "").trim().slice(0, 24);
}

function cleanStatus(value) {
  return String(value || "").trim().slice(0, 32);
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanVideoQuery(value) {
  return cleanText(value, 80) || "creative coding";
}

function cleanPageToken(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 120);
}

function cleanColor(value) {
  const color = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : randomColor();
}

function cleanReaction(value) {
  const emoji = String(value || "").trim();
  return ["👍", "❤️", "😂", "😮", "🙏", "🔥"].includes(emoji) ? emoji : "";
}

function validReplyId(messageId, chatId) {
  if (!messageId) return "";
  const message = db.messages.find((item) => item.id === messageId && item.chatId === chatId && !item.deletedAt);
  return message ? message.id : "";
}

function canSeeMessage(user, message) {
  if (message.groupId) {
    return db.groups.some((group) => group.id === message.groupId && group.members.includes(user.id));
  }
  return message.from === user.id || message.to === user.id;
}

function randomColor() {
  return ["#0a84ff", "#32d74b", "#ff9f0a", "#bf5af2", "#ff375f"][Math.floor(Math.random() * 5)];
}

function unreadCount(userId, peerId) {
  const chatId = conversationId(userId, peerId);
  return db.messages.filter((message) => message.chatId === chatId && message.to === userId && !message.readAt).length;
}

function lastMessage(userId, peerId) {
  const chatId = conversationId(userId, peerId);
  const message = db.messages.filter((item) => item.chatId === chatId).at(-1);
  return message
    ? {
        type: message.type || "text",
        text: message.text,
        stickerId: message.stickerId || "",
        from: message.from,
        senderName: senderName(message.from),
        createdAt: message.createdAt,
      }
    : null;
}

function unreadGroupCount(userId, groupId) {
  const chatId = groupChatId(groupId);
  return db.messages.filter((message) => message.chatId === chatId && message.from !== userId && !message.readBy?.[userId]).length;
}

function lastGroupMessage(groupId) {
  const message = db.messages.filter((item) => item.chatId === groupChatId(groupId)).at(-1);
  return message
    ? {
        type: message.type || "text",
        text: message.text,
        stickerId: message.stickerId || "",
        from: message.from,
        senderName: senderName(message.from),
        createdAt: message.createdAt,
      }
    : null;
}

function senderName(userId) {
  const user = db.users.find((item) => item.id === userId);
  return user?.name || "未知用户";
}

function decorateMessage(message) {
  const user = db.users.find((item) => item.id === message.from);
  return {
    ...message,
    senderName: user?.name || "未知用户",
    senderUsername: user?.username || "",
    senderColor: user?.color || "#0a84ff",
  };
}

function serveFile(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

function localAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }
  serveFile(req, res, url);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Mini Chat running at http://localhost:${port}`);
  localAddresses().forEach((address) => console.log(`LAN: http://${address}:${port}`));
});
