(function () {
  const openArcadeButton = document.querySelector("#openArcadeButton");
  const arcadeOverlay = document.querySelector("#arcadeOverlay");
  const closeArcadeButton = document.querySelector("#closeArcadeButton");
  const arcadeGrid = document.querySelector("#arcadeGrid");
  const arcadePlay = document.querySelector("#arcadePlay");
  const arcadeStage = document.querySelector("#arcadeStage");
  const arcadeStatus = document.querySelector("#arcadeStatus");
  const arcadeTotalScore = document.querySelector("#arcadeTotalScore");
  const arcadeLastGame = document.querySelector("#arcadeLastGame");
  const arcadeLeaderboardTitle = document.querySelector("#arcadeLeaderboardTitle");
  const arcadeLeaderboardSelect = document.querySelector("#arcadeLeaderboardSelect");
  const arcadeRanks = document.querySelector("#arcadeRanks");
  const arcadeGameLabel = document.querySelector("#arcadeGameLabel");
  const arcadeGameTitle = document.querySelector("#arcadeGameTitle");
  const arcadeGameScore = document.querySelector("#arcadeGameScore");
  const arcadeGameTime = document.querySelector("#arcadeGameTime");
  const arcadeGameBest = document.querySelector("#arcadeGameBest");
  const arcadeHint = document.querySelector("#arcadeHint");
  const restartArcadeGameButton = document.querySelector("#restartArcadeGameButton");
  const backToArcadeButton = document.querySelector("#backToArcadeButton");

  if (!openArcadeButton || !arcadeOverlay || !arcadeStage) return;

  const storageKey = "mini-chat-arcade";
  const gameNames = {
    tap: "反应点击",
    memory: "记忆翻牌",
    dodge: "躲避方块",
    fruit: "Fruit Slasher",
    snake: "Snake",
    street: "Street Guessr",
    all: "全部游戏",
  };
  let stats = loadStats();
  let currentGame = "";
  let cleanup = () => {};
  let leaderboardGame = "all";
  const lastBuiltInScores = { fruit: 0, snake: 0 };

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveStats() {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  }

  function bestOf(game) {
    return Number(stats[game]?.best || 0);
  }

  function recordScore(game, score) {
    stats[game] ||= { best: 0, plays: 0 };
    stats[game].plays += 1;
    stats[game].best = Math.max(stats[game].best, score);
    stats.lastGame = gameNames[game] || "小游戏";
    saveStats();
    updateLobbyStats();
    postScore(game, score);
  }

  function recordBuiltInScore(game) {
    const scoreEl = game === "fruit" ? document.querySelector("#gameScore") : document.querySelector("#snakeScore");
    const score = Math.floor(Number(scoreEl?.textContent || 0));
    if (!score || score <= lastBuiltInScores[game]) return;
    lastBuiltInScores[game] = score;
    recordScore(game, score);
  }

  async function postScore(game, score) {
    try {
      await fetch("/api/arcade/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ game, score }),
      });
      loadLeaderboard(leaderboardGame);
    } catch {
      arcadeHint.textContent = "分数已保存在本机，联网后会再同步。";
    }
  }

  async function loadLeaderboard(game = "all") {
    leaderboardGame = game;
    if (arcadeLeaderboardTitle) arcadeLeaderboardTitle.textContent = gameNames[game] || "全部游戏";
    if (!arcadeRanks) return;
    arcadeRanks.innerHTML = '<div class="empty-state"><span>正在读取好友排行榜...</span></div>';
    try {
      const response = await fetch(`/api/arcade/leaderboard?game=${encodeURIComponent(game)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "排行榜读取失败。");
      renderLeaderboard(data.rows || []);
    } catch (error) {
      arcadeRanks.innerHTML = `<div class="empty-state"><span>${error.message || "排行榜暂时不可用。"}</span></div>`;
    }
  }

  function renderLeaderboard(rows) {
    if (!rows.length) {
      arcadeRanks.innerHTML = '<div class="empty-state"><span>好友还没有上榜。先玩一局占个位置。</span></div>';
      return;
    }
    arcadeRanks.innerHTML = rows
      .map((row, index) => {
        const user = row.user || {};
        const initial = (user.name || user.username || "?").slice(0, 1).toUpperCase();
        const gameLabel = gameNames[row.game] || row.game;
        return `
          <div class="arcade-rank">
            <div class="arcade-rank-number">${index + 1}</div>
            <div class="arcade-rank-player">
              <div class="avatar" style="--avatar:${user.color || "#0a84ff"}">${initial}</div>
              <div>
                <strong>${escapeHtml(user.name || "未知用户")}</strong>
                <span>@${escapeHtml(user.username || "-")} · ${escapeHtml(gameLabel)}</span>
              </div>
            </div>
            <div class="arcade-rank-score">
              <strong>${Number(row.score || 0)}</strong>
              <span>最高分</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function updateLobbyStats() {
    const total = Object.values(stats).reduce((sum, value) => {
      if (!value || typeof value !== "object") return sum;
      return sum + Number(value.best || 0);
    }, 0);
    arcadeTotalScore.textContent = total;
    arcadeLastGame.textContent = stats.lastGame || "无";
    arcadeStatus.textContent = currentGame ? "游戏中" : "准备开玩";
  }

  function showArcade() {
    arcadeOverlay.classList.remove("hidden");
    currentGame = "";
    arcadeGrid.classList.remove("hidden");
    arcadePlay.classList.add("hidden");
    updateLobbyStats();
    loadLeaderboard(leaderboardGame);
  }

  function hideArcade() {
    cleanup();
    currentGame = "";
    arcadeOverlay.classList.add("hidden");
    updateLobbyStats();
  }

  function closeBuiltInLobby() {
    cleanup();
    currentGame = "";
    arcadeOverlay.classList.add("hidden");
  }

  function startArcadeGame(game) {
    cleanup();
    currentGame = game;
    arcadeGrid.classList.add("hidden");
    arcadePlay.classList.remove("hidden");
    arcadeStage.innerHTML = "";
    arcadeGameLabel.textContent = "Mini Game";
    arcadeGameTitle.textContent = gameNames[game];
    arcadeGameScore.textContent = "0";
    arcadeGameTime.textContent = "0";
    arcadeGameBest.textContent = bestOf(game);
    updateLobbyStats();
    if (game === "tap") cleanup = startTapGame();
    if (game === "memory") cleanup = startMemoryGame();
    if (game === "dodge") cleanup = startDodgeGame();
  }

  function finishGame(game, score, text) {
    recordScore(game, score);
    arcadeGameBest.textContent = bestOf(game);
    arcadeHint.textContent = text;
  }

  function startTapGame() {
    let score = 0;
    let time = 20;
    let active = true;
    const target = document.createElement("button");
    target.className = "arcade-target";
    target.type = "button";
    arcadeStage.append(target);
    arcadeHint.textContent = "点击移动的光点，20 秒内越多越好。";

    function moveTarget() {
      const rect = arcadeStage.getBoundingClientRect();
      const maxX = Math.max(8, rect.width - 88);
      const maxY = Math.max(8, rect.height - 88);
      target.style.left = `${8 + Math.random() * maxX}px`;
      target.style.top = `${8 + Math.random() * maxY}px`;
    }

    function hit() {
      if (!active) return;
      score += 10 + Math.max(0, time);
      arcadeGameScore.textContent = score;
      moveTarget();
    }

    target.addEventListener("click", hit);
    moveTarget();
    arcadeGameTime.textContent = time;
    const timer = window.setInterval(() => {
      time -= 1;
      arcadeGameTime.textContent = time;
      if (time <= 0) {
        active = false;
        window.clearInterval(timer);
        target.disabled = true;
        finishGame("tap", score, `结束，得分 ${score}。`);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }

  function startMemoryGame() {
    const icons = ["🍎", "🍋", "🍇", "🍒", "🥝", "🍑"];
    const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    let score = 0;
    let moves = 0;
    let matched = 0;
    let first = null;
    let locked = false;
    const board = document.createElement("div");
    board.className = "memory-board";
    arcadeStage.append(board);
    arcadeHint.textContent = "翻出两张一样的卡牌。步数越少，分越高。";
    arcadeGameTime.textContent = "步数 0";

    cards.forEach((icon, index) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.type = "button";
      card.dataset.icon = icon;
      card.dataset.index = index;
      card.textContent = "?";
      board.append(card);
    });

    function reveal(card) {
      card.classList.add("flipped");
      card.textContent = card.dataset.icon;
    }

    function hide(card) {
      card.classList.remove("flipped");
      card.textContent = "?";
    }

    function flip(card) {
      if (locked || card.classList.contains("matched") || card === first) return;
      reveal(card);
      if (!first) {
        first = card;
        return;
      }
      moves += 1;
      arcadeGameTime.textContent = `步数 ${moves}`;
      if (first.dataset.icon === card.dataset.icon) {
        first.classList.add("matched");
        card.classList.add("matched");
        matched += 2;
        score += Math.max(30, 120 - moves * 4);
        arcadeGameScore.textContent = score;
        first = null;
        if (matched === cards.length) finishGame("memory", score, `全部配对，得分 ${score}。`);
        return;
      }
      locked = true;
      window.setTimeout(() => {
        hide(first);
        hide(card);
        first = null;
        locked = false;
      }, 560);
    }

    board.addEventListener("click", (event) => {
      const card = event.target.closest(".memory-card");
      if (card) flip(card);
    });

    return () => {};
  }

  function startDodgeGame() {
    const canvas = document.createElement("canvas");
    canvas.className = "dodge-canvas";
    arcadeStage.append(canvas);
    const ctx = canvas.getContext("2d");
    let running = true;
    let score = 0;
    let frame = 0;
    let player = { x: 0, y: 0, size: 26 };
    let blocks = [];
    let keys = new Set();
    let pointer = null;

    arcadeHint.textContent = "用方向键或拖动移动，躲开落下来的方块。";

    function resize() {
      const rect = arcadeStage.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      player.x = player.x || rect.width / 2;
      player.y = player.y || rect.height - 56;
    }

    function addBlock(width) {
      const size = 18 + Math.random() * 26;
      blocks.push({
        x: Math.random() * Math.max(1, width - size),
        y: -size,
        size,
        speed: 2.4 + Math.random() * 2.8 + score / 900,
      });
    }

    function step() {
      if (!running) return;
      const rect = arcadeStage.getBoundingClientRect();
      frame += 1;
      score += 1;
      if (frame % Math.max(12, 34 - Math.floor(score / 180)) === 0) addBlock(rect.width);

      const speed = 5.5;
      if (keys.has("ArrowLeft") || keys.has("a")) player.x -= speed;
      if (keys.has("ArrowRight") || keys.has("d")) player.x += speed;
      if (keys.has("ArrowUp") || keys.has("w")) player.y -= speed;
      if (keys.has("ArrowDown") || keys.has("s")) player.y += speed;
      if (pointer) {
        player.x += (pointer.x - player.x) * 0.18;
        player.y += (pointer.y - player.y) * 0.18;
      }
      player.x = Math.max(player.size, Math.min(rect.width - player.size, player.x));
      player.y = Math.max(player.size, Math.min(rect.height - player.size, player.y));

      blocks.forEach((block) => (block.y += block.speed));
      blocks = blocks.filter((block) => block.y < rect.height + block.size);

      const hit = blocks.some((block) => {
        const dx = block.x + block.size / 2 - player.x;
        const dy = block.y + block.size / 2 - player.y;
        return Math.hypot(dx, dy) < block.size / 2 + player.size * 0.7;
      });
      if (hit) {
        running = false;
        finishGame("dodge", score, `撞到了，生存分 ${score}。`);
      }
      draw(rect.width, rect.height);
      arcadeGameScore.textContent = score;
      arcadeGameTime.textContent = `${Math.floor(score / 60)}s`;
      requestAnimationFrame(step);
    }

    function draw(width, height) {
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0a1326");
      bg.addColorStop(1, "#07110d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      blocks.forEach((block) => {
        ctx.fillStyle = "#ff453a";
        roundRect(ctx, block.x, block.y, block.size, block.size, 7);
        ctx.fill();
      });
      ctx.fillStyle = "#32d74b";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(player.x - 7, player.y - 5, 4, 0, Math.PI * 2);
      ctx.arc(player.x + 7, player.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    }

    function keyDown(event) {
      keys.add(event.key);
    }

    function keyUp(event) {
      keys.delete(event.key);
    }

    function movePointer(event) {
      const rect = arcadeStage.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    arcadeStage.addEventListener("pointerdown", movePointer);
    arcadeStage.addEventListener("pointermove", movePointer);
    arcadeStage.addEventListener("pointerup", () => (pointer = null));
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(step);

    return () => {
      running = false;
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("resize", resize);
    };
  }

  openArcadeButton.addEventListener("click", showArcade);
  closeArcadeButton?.addEventListener("click", hideArcade);
  backToArcadeButton?.addEventListener("click", showArcade);
  arcadeLeaderboardSelect?.addEventListener("change", () => loadLeaderboard(arcadeLeaderboardSelect.value));
  window.addEventListener("mini-chat-arcade-score", (event) => {
    const game = String(event.detail?.game || "");
    const score = Number(event.detail?.score || 0);
    if (game && score > 0) recordScore(game, score);
  });
  document.querySelector("#closeGameButton")?.addEventListener("click", () => recordBuiltInScore("fruit"));
  document.querySelector("#restartGameButton")?.addEventListener("click", () => recordBuiltInScore("fruit"));
  document.querySelector("#closeSnakeButton")?.addEventListener("click", () => recordBuiltInScore("snake"));
  document.querySelector("#restartSnakeButton")?.addEventListener("click", () => recordBuiltInScore("snake"));
  restartArcadeGameButton?.addEventListener("click", () => {
    if (currentGame) startArcadeGame(currentGame);
  });
  arcadeGrid?.addEventListener("click", (event) => {
    const builtIn = event.target.closest("#openGameButton, #openSnakeButton");
    if (builtIn) {
      closeBuiltInLobby();
      return;
    }
    const tile = event.target.closest("[data-arcade-game]");
    if (tile) startArcadeGame(tile.dataset.arcadeGame);
  });

  updateLobbyStats();
})();
