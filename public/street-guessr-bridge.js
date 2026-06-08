(function () {
  const gameId = "street";
  const gameName = "Street Guessr";
  const openButton = document.querySelector("#openStreetGuessrButton");
  const overlay = document.querySelector("#streetGuessrOverlay");
  const closeButton = document.querySelector("#closeStreetGuessrButton");
  const frame = document.querySelector("#streetGuessrFrame");
  const leaderboardSelect = document.querySelector("#arcadeLeaderboardSelect");
  const leaderboardTitle = document.querySelector("#arcadeLeaderboardTitle");
  const arcadeHint = document.querySelector("#arcadeHint");

  function openStreetGuessr(event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!overlay) return;
    if (frame && !frame.getAttribute("src")) {
      frame.setAttribute("src", "street-guessr/index.html");
    }
    overlay.classList.remove("hidden");
  }

  function closeStreetGuessr() {
    overlay?.classList.add("hidden");
  }

  function fixStreetLeaderboardTitle() {
    if (leaderboardSelect?.value === gameId && leaderboardTitle) {
      leaderboardTitle.textContent = gameName;
    }
  }

  async function syncStreetScore(score) {
    const safeScore = Math.max(0, Math.floor(Number(score) || 0));
    if (!safeScore) return;
    try {
      await fetch("/api/arcade/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ game: gameId, score: safeScore }),
      });
      if (arcadeHint) arcadeHint.textContent = "Street Guessr 分数已同步到好友排行榜。";
      if (leaderboardSelect) {
        leaderboardSelect.value = gameId;
        leaderboardSelect.dispatchEvent(new Event("change"));
      }
      setTimeout(fixStreetLeaderboardTitle, 0);
    } catch {
      if (arcadeHint) arcadeHint.textContent = "Street Guessr 分数已保存在游戏内，联网后可以再同步。";
    }
  }

  openButton?.addEventListener("click", openStreetGuessr);
  closeButton?.addEventListener("click", closeStreetGuessr);
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeStreetGuessr();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay && !overlay.classList.contains("hidden")) {
      closeStreetGuessr();
    }
  });
  leaderboardSelect?.addEventListener("change", () => setTimeout(fixStreetLeaderboardTitle, 0));
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "street-guessr-score") {
      syncStreetScore(event.data.score);
    }
  });
})();
