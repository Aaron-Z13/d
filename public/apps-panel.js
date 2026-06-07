(function () {
  const openAppsButton = document.querySelector("#openAppsButton");
  const appsOverlay = document.querySelector("#appsOverlay");
  const closeAppsButton = document.querySelector("#closeAppsButton");

  if (!openAppsButton || !appsOverlay) return;

  function openApps() {
    appsOverlay.classList.remove("hidden");
  }

  function closeApps() {
    appsOverlay.classList.add("hidden");
  }

  openAppsButton.addEventListener("click", openApps);
  closeAppsButton?.addEventListener("click", closeApps);

  appsOverlay.addEventListener("click", (event) => {
    if (event.target === appsOverlay || event.target.closest(".mini-game-button")) {
      closeApps();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !appsOverlay.classList.contains("hidden")) {
      closeApps();
    }
  });
})();
