const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");

const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, "public");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

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
  return { users: [], sessions: {}, messages: [] };
}

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch {
    return emptyDb();
  }
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

function conversationId(a, b) {
  return [a, b].sort().join(":");
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

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      json(res, 200, {
        ok: true,
        users: db.users.length,
        messages: db.messages.length,
        dataDir,
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

    if (req.method === "POST" && url.pathname === "/api/contacts") {
      const body = await readBody(req);
      const target = db.users.find((item) => item.username === cleanUsername(body.username) || item.id === body.userId);
      if (!target || target.id === user.id) {
        json(res, 404, { error: "没有找到这个用户。" });
        return;
      }
      user.contacts ||= [];
      target.contacts ||= [];
      if (!user.contacts.includes(target.id)) user.contacts.push(target.id);
      if (!target.contacts.includes(user.id)) target.contacts.push(user.id);
      saveDb(db);
      json(res, 201, { contact: publicUser(target) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/messages") {
      const peerId = url.searchParams.get("peerId");
      if (!peerId || !user.contacts.includes(peerId)) {
        json(res, 400, { error: "请选择联系人。" });
        return;
      }
      const since = Number(url.searchParams.get("since") || 0);
      const chatId = conversationId(user.id, peerId);
      const messages = db.messages
        .filter((message) => message.chatId === chatId && message.createdAt > since)
        .slice(-120);
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
      const text = String(body.text || "").trim().slice(0, 1200);
      if (!to || !user.contacts.includes(to) || !text) {
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
        text,
        createdAt: Date.now(),
      };
      db.messages.push(message);
      saveDb(db);
      json(res, 201, { message });
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
  return message ? { text: message.text, from: message.from, createdAt: message.createdAt } : null;
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
