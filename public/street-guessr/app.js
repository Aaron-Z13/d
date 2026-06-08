const apiKeyInput = document.querySelector("#apiKeyInput");
const saveKeyButton = document.querySelector("#saveKeyButton");
const startButton = document.querySelector("#startButton");
const setupPanel = document.querySelector("#setupPanel");
const gamePanel = document.querySelector("#gamePanel");
const mapGallery = document.querySelector("#mapGallery");
const fileWarning = document.querySelector("#fileWarning");
const roundText = document.querySelector("#roundText");
const scoreText = document.querySelector("#scoreText");
const bestText = document.querySelector("#bestText");
const hintText = document.querySelector("#hintText");
const submitButton = document.querySelector("#submitButton");
const nextButton = document.querySelector("#nextButton");
const resultBox = document.querySelector("#resultBox");
const endModal = document.querySelector("#endModal");
const endTitle = document.querySelector("#endTitle");
const endText = document.querySelector("#endText");
const playAgainButton = document.querySelector("#playAgainButton");
const backToMapsButton = document.querySelector("#backToMapsButton");

const TOTAL_ROUNDS = 5;
const STORAGE_KEY = "street-guessr-google-key";
const BEST_KEY = "street-guessr-best";
const MAP_KEY = "street-guessr-map-pack";
const mapPacks = [
  {
    id: "random",
    title: "Random Mix",
    difficulty: "Surprise",
    level: 3,
    cover: "linear-gradient(135deg, #3a0ca3, #4cc9f0)",
    desc: "每回合随机抽一个地图包，完全不知道会去哪。",
    spread: 0.22,
    radius: 65000,
    seeds: [],
  },
  {
    id: "world",
    title: "World",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #2b5876, #4e4376)",
    desc: "全球城市、海岸、山地和地标混合。",
    spread: 0.22,
    radius: 65000,
    seeds: [
      { name: "Tokyo", lat: 35.6812, lng: 139.7671 },
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "New York", lat: 40.758, lng: -73.9855 },
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Singapore", lat: 1.3521, lng: 103.8198 },
      { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
      { name: "Rio", lat: -22.9068, lng: -43.1729 },
      { name: "Reykjavik", lat: 64.1466, lng: -21.9426 },
      { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
      { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
      { name: "Seoul", lat: 37.5665, lng: 126.978 },
      { name: "Auckland", lat: -36.8485, lng: 174.7633 },
      { name: "Prague", lat: 50.0755, lng: 14.4378 },
      { name: "Dublin", lat: 53.3498, lng: -6.2603 },
    ],
  },
  {
    id: "famous",
    title: "Famous Places",
    difficulty: "Hard",
    level: 3,
    cover: "linear-gradient(135deg, #77623a, #1f3f5f)",
    desc: "地标附近，但未必直接给你看地标。",
    spread: 0.08,
    radius: 30000,
    seeds: [
      { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
      { name: "Colosseum", lat: 41.8902, lng: 12.4922 },
      { name: "Times Square", lat: 40.758, lng: -73.9855 },
      { name: "Shibuya", lat: 35.6595, lng: 139.7005 },
      { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153 },
      { name: "Tower Bridge", lat: 51.5055, lng: -0.0754 },
      { name: "Golden Gate Bridge", lat: 37.8199, lng: -122.4783 },
      { name: "Sagrada Familia", lat: 41.4036, lng: 2.1744 },
      { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777 },
      { name: "CN Tower", lat: 43.6426, lng: -79.3871 },
      { name: "Christchurch", lat: -43.5321, lng: 172.6362 },
      { name: "Hallstatt", lat: 47.5622, lng: 13.6493 },
    ],
  },
  {
    id: "usa",
    title: "United States",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #22577a, #f8961e)",
    desc: "美国城市、公路和郊区。",
    spread: 0.28,
    radius: 80000,
    seeds: [
      { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
      { name: "New York", lat: 40.7128, lng: -74.006 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
      { name: "Seattle", lat: 47.6062, lng: -122.3321 },
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
      { name: "Denver", lat: 39.7392, lng: -104.9903 },
      { name: "Boston", lat: 42.3601, lng: -71.0589 },
      { name: "Austin", lat: 30.2672, lng: -97.7431 },
      { name: "Portland", lat: 45.5152, lng: -122.6784 },
      { name: "Las Vegas", lat: 36.1699, lng: -115.1398 },
    ],
  },
  {
    id: "japan",
    title: "Japan",
    difficulty: "Easy",
    level: 1,
    cover: "linear-gradient(135deg, #1d3557, #e63946)",
    desc: "日本街道、城市标识和窄路。",
    spread: 0.16,
    radius: 45000,
    seeds: [
      { name: "Tokyo", lat: 35.6812, lng: 139.7671 },
      { name: "Osaka", lat: 34.6937, lng: 135.5023 },
      { name: "Kyoto", lat: 35.0116, lng: 135.7681 },
      { name: "Sapporo", lat: 43.0618, lng: 141.3545 },
      { name: "Fukuoka", lat: 33.5904, lng: 130.4017 },
      { name: "Nagoya", lat: 35.1815, lng: 136.9066 },
      { name: "Hiroshima", lat: 34.3853, lng: 132.4553 },
      { name: "Naha", lat: 26.2124, lng: 127.6792 },
      { name: "Kanazawa", lat: 36.5613, lng: 136.6562 },
    ],
  },
  {
    id: "uk",
    title: "United Kingdom",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #31572c, #8d99ae)",
    desc: "英国城市、乡村和道路标线。",
    spread: 0.16,
    radius: 50000,
    seeds: [
      { name: "London", lat: 51.5072, lng: -0.1276 },
      { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
      { name: "Manchester", lat: 53.4808, lng: -2.2426 },
      { name: "Bristol", lat: 51.4545, lng: -2.5879 },
      { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
      { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
      { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
      { name: "Oxford", lat: 51.752, lng: -1.2577 },
    ],
  },
  {
    id: "france",
    title: "France",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #74b9ff, #6c5ce7)",
    desc: "法国城市、海岸和欧洲街区。",
    spread: 0.18,
    radius: 52000,
    seeds: [
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Nice", lat: 43.7102, lng: 7.262 },
      { name: "Lyon", lat: 45.764, lng: 4.8357 },
      { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
      { name: "Marseille", lat: 43.2965, lng: 5.3698 },
      { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
      { name: "Nantes", lat: 47.2184, lng: -1.5536 },
      { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
    ],
  },
  {
    id: "spain",
    title: "Spain",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #f6d365, #fda085)",
    desc: "西班牙城市、阳光海岸和老街。",
    spread: 0.18,
    radius: 52000,
    seeds: [
      { name: "Madrid", lat: 40.4168, lng: -3.7038 },
      { name: "Barcelona", lat: 41.3874, lng: 2.1686 },
      { name: "Valencia", lat: 39.4699, lng: -0.3763 },
      { name: "Seville", lat: 37.3891, lng: -5.9845 },
      { name: "Bilbao", lat: 43.263, lng: -2.935 },
      { name: "Malaga", lat: 36.7213, lng: -4.4214 },
      { name: "Granada", lat: 37.1773, lng: -3.5986 },
      { name: "Zaragoza", lat: 41.6488, lng: -0.8891 },
    ],
  },
  {
    id: "germany",
    title: "Germany",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #6d6875, #b5838d)",
    desc: "德国城镇、道路和老城区。",
    spread: 0.17,
    radius: 52000,
    seeds: [
      { name: "Berlin", lat: 52.52, lng: 13.405 },
      { name: "Munich", lat: 48.1351, lng: 11.582 },
      { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
      { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
      { name: "Cologne", lat: 50.9375, lng: 6.9603 },
      { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
      { name: "Dresden", lat: 51.0504, lng: 13.7373 },
      { name: "Nuremberg", lat: 49.4521, lng: 11.0767 },
    ],
  },
  {
    id: "italy",
    title: "Italy",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #bc6c25, #283618)",
    desc: "意大利古城、海岸和山地小镇。",
    spread: 0.18,
    radius: 50000,
    seeds: [
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Florence", lat: 43.7696, lng: 11.2558 },
      { name: "Milan", lat: 45.4642, lng: 9.19 },
      { name: "Naples", lat: 40.8518, lng: 14.2681 },
      { name: "Venice", lat: 45.4408, lng: 12.3155 },
      { name: "Bologna", lat: 44.4949, lng: 11.3426 },
      { name: "Turin", lat: 45.0703, lng: 7.6869 },
      { name: "Palermo", lat: 38.1157, lng: 13.3615 },
    ],
  },
  {
    id: "canada",
    title: "Canada",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #457b9d, #a8dadc)",
    desc: "加拿大城市、湖泊和辽阔道路。",
    spread: 0.26,
    radius: 80000,
    seeds: [
      { name: "Toronto", lat: 43.6532, lng: -79.3832 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Montreal", lat: 45.5019, lng: -73.5674 },
      { name: "Calgary", lat: 51.0447, lng: -114.0719 },
      { name: "Ottawa", lat: 45.4215, lng: -75.6972 },
      { name: "Quebec City", lat: 46.8139, lng: -71.208 },
      { name: "Winnipeg", lat: 49.8951, lng: -97.1384 },
      { name: "Halifax", lat: 44.6488, lng: -63.5752 },
    ],
  },
  {
    id: "turkiye",
    title: "Türkiye",
    difficulty: "Moderate",
    level: 2,
    cover: "linear-gradient(135deg, #8338ec, #fb5607)",
    desc: "土耳其城市、海峡和山地道路。",
    spread: 0.18,
    radius: 58000,
    seeds: [
      { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
      { name: "Ankara", lat: 39.9334, lng: 32.8597 },
      { name: "Izmir", lat: 38.4237, lng: 27.1428 },
      { name: "Antalya", lat: 36.8969, lng: 30.7133 },
      { name: "Bursa", lat: 40.1885, lng: 29.061 },
      { name: "Konya", lat: 37.8746, lng: 32.4932 },
      { name: "Trabzon", lat: 41.0027, lng: 39.7168 },
      { name: "Gaziantep", lat: 37.0662, lng: 37.3833 },
    ],
  },
  {
    id: "australia",
    title: "Australia",
    difficulty: "Hard",
    level: 3,
    cover: "linear-gradient(135deg, #f77f00, #003049)",
    desc: "澳大利亚城市、海岸和荒野道路。",
    spread: 0.32,
    radius: 90000,
    seeds: [
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
      { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
      { name: "Perth", lat: -31.9523, lng: 115.8613 },
      { name: "Adelaide", lat: -34.9285, lng: 138.6007 },
      { name: "Hobart", lat: -42.8821, lng: 147.3272 },
      { name: "Darwin", lat: -12.4634, lng: 130.8456 },
      { name: "Gold Coast", lat: -28.0167, lng: 153.4 },
    ],
  },
];

let mapsLoaded = false;
let panorama;
let guessMap;
let streetService;
let actualMarker;
let guessMarker;
let resultLine;
let currentLocation = null;
let guessedLocation = null;
let round = 1;
let score = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let selectedMapId = localStorage.getItem(MAP_KEY) || "random";
let activeRoundPackId = null;
let unusedSeeds = [];
let lastLocations = JSON.parse(localStorage.getItem("street-guessr-last-locations") || "[]");

apiKeyInput.value = localStorage.getItem(STORAGE_KEY) || "";
bestText.textContent = best;
fileWarning.classList.toggle("hidden", window.location.protocol !== "file:");

function selectedPack() {
  return mapPacks.find((pack) => pack.id === selectedMapId) || mapPacks[0];
}

function playablePacks() {
  return mapPacks.filter((pack) => pack.id !== "random");
}

function roundPack() {
  if (selectedMapId !== "random") return selectedPack();
  return mapPacks.find((pack) => pack.id === activeRoundPackId) || playablePacks()[0];
}

function resetSeedBag() {
  const pack = roundPack();
  unusedSeeds = [...pack.seeds].sort(() => Math.random() - 0.5);
}

function renderMapGallery() {
  mapGallery.innerHTML = mapPacks
    .map((pack) => {
      const bars = [1, 2, 3].map((level) => `<i class="${level > pack.level ? "muted" : ""}"></i>`).join("");
      return `
        <button class="map-card ${pack.id === selectedMapId ? "active" : ""}" type="button" data-map="${pack.id}" style="--cover: ${pack.cover}">
          <span class="map-card-inner">
            <h3>${pack.title}</h3>
            <p>${pack.desc}</p>
            <span class="map-meta">
              <span class="bars">${bars}</span>
              <span class="difficulty">${pack.difficulty}</span>
            </span>
          </span>
        </button>
      `;
    })
    .join("");
}

function loadGoogleMaps(key) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      mapsLoaded = true;
      resolve();
      return;
    }
    window.initStreetGuessr = () => {
      mapsLoaded = true;
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initStreetGuessr`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps 加载失败，请检查 API key 和网络。"));
    document.head.appendChild(script);
  });
}

function randomSeed() {
  if (selectedMapId === "random" && !activeRoundPackId) {
    const packs = playablePacks();
    activeRoundPackId = packs[Math.floor(Math.random() * packs.length)].id;
    resetSeedBag();
  }
  const pack = roundPack();
  if (!unusedSeeds.length) resetSeedBag();
  let seed = unusedSeeds.pop();
  const recentNames = new Set(lastLocations.slice(-12));
  let guard = 0;
  while (recentNames.has(`${pack.id}:${seed.name}`) && unusedSeeds.length && guard < 8) {
    unusedSeeds.unshift(seed);
    seed = unusedSeeds.pop();
    guard += 1;
  }
  lastLocations.push(`${pack.id}:${seed.name}`);
  lastLocations = lastLocations.slice(-30);
  localStorage.setItem("street-guessr-last-locations", JSON.stringify(lastLocations));
  return {
    lat: seed.lat + (Math.random() - 0.5) * pack.spread,
    lng: seed.lng + (Math.random() - 0.5) * pack.spread,
  };
}

function findStreetViewLocation() {
  return new Promise((resolve, reject) => {
    const origin = randomSeed();
    streetService.getPanorama(
      {
        location: origin,
        radius: roundPack().radius,
        preference: google.maps.StreetViewPreference.BEST,
        source: google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          resolve(data.location.latLng);
        } else {
          reject(new Error("没有找到可用街景，正在重试。"));
        }
      },
    );
  });
}

function haversine(a, b) {
  const radius = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat() - a.lat());
  const dLng = toRad(b.lng() - a.lng());
  const lat1 = toRad(a.lat());
  const lat2 = toRad(b.lat());
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function pointsForDistance(km) {
  return Math.max(0, Math.round(5000 * Math.exp(-km / 1450)));
}

function initMaps() {
  streetService = new google.maps.StreetViewService();
  panorama = new google.maps.StreetViewPanorama(document.querySelector("#streetView"), {
    addressControl: false,
    fullscreenControl: true,
    motionTracking: false,
    panControl: true,
    showRoadLabels: false,
    zoomControl: true,
  });
  guessMap = new google.maps.Map(document.querySelector("#guessMap"), {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  });
  guessMap.addListener("click", (event) => {
    if (nextButton.classList.contains("hidden")) setGuess(event.latLng);
  });
}

function setGuess(latLng) {
  guessedLocation = latLng;
  if (!guessMarker) {
    guessMarker = new google.maps.Marker({
      map: guessMap,
      label: "你",
      title: "你的猜测",
    });
  }
  guessMarker.setPosition(latLng);
  resultBox.innerHTML = `
    <span>结果</span>
    <strong>已选择位置</strong>
    <p>点击“提交猜测”计算距离和分数。</p>
  `;
}

async function startRound() {
  submitButton.disabled = false;
  nextButton.classList.add("hidden");
  guessedLocation = null;
  if (guessMarker) guessMarker.setMap(null);
  if (actualMarker) actualMarker.setMap(null);
  if (resultLine) resultLine.setMap(null);
  guessMarker = null;
  actualMarker = null;
  resultLine = null;
  roundText.textContent = `${round} / ${TOTAL_ROUNDS}`;
  scoreText.textContent = score;
  if (selectedMapId === "random") {
    const packs = playablePacks();
    const previous = activeRoundPackId;
    let nextPack = packs[Math.floor(Math.random() * packs.length)];
    if (packs.length > 1) {
      let guard = 0;
      while (nextPack.id === previous && guard < 8) {
        nextPack = packs[Math.floor(Math.random() * packs.length)];
        guard += 1;
      }
    }
    activeRoundPackId = nextPack.id;
    resetSeedBag();
  }
  hintText.textContent = `正在 ${roundPack().title} 地图寻找可用街景...`;
  resultBox.innerHTML = `
    <span>结果</span>
    <strong>先在地图上点一个位置</strong>
    <p>提交后会显示真实位置、距离和本回合得分。</p>
  `;

  for (let tries = 0; tries < 6; tries += 1) {
    try {
      currentLocation = await findStreetViewLocation();
      panorama.setPosition(currentLocation);
      panorama.setPov({ heading: Math.random() * 360, pitch: 0 });
      guessMap.setCenter({ lat: 20, lng: 0 });
      guessMap.setZoom(2);
      hintText.textContent = `${roundPack().title} · 观察街景，然后在右边地图点一个位置。`;
      return;
    } catch {
      hintText.textContent = "这个地点没有街景，正在换一个...";
    }
  }
  resultBox.innerHTML = `
    <span>错误</span>
    <strong>没有找到街景</strong>
    <p>请确认 API key 可用，并且 Maps JavaScript API 已启用。</p>
  `;
}

function submitGuess() {
  if (!guessedLocation || !currentLocation) {
    resultBox.innerHTML = `
      <span>结果</span>
      <strong>还没有猜测</strong>
      <p>先在右边地图上点一个位置。</p>
    `;
    return;
  }
  const distance = haversine(currentLocation, guessedLocation);
  const roundScore = pointsForDistance(distance);
  score += roundScore;
  scoreText.textContent = score;
  submitButton.disabled = true;
  actualMarker = new google.maps.Marker({
    map: guessMap,
    position: currentLocation,
    label: "真",
    title: "真实位置",
  });
  resultLine = new google.maps.Polyline({
    map: guessMap,
    path: [currentLocation, guessedLocation],
    strokeColor: "#64d26e",
    strokeOpacity: 0.85,
    strokeWeight: 3,
  });
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(currentLocation);
  bounds.extend(guessedLocation);
  guessMap.fitBounds(bounds, 48);
  resultBox.innerHTML = `
    <span>Round ${round}</span>
    <strong>${roundScore} 分</strong>
    <p>距离 ${distance.toFixed(distance > 100 ? 0 : 1)} km。${roundScore > 4200 ? "太准了。" : roundScore > 2500 ? "不错。" : "再观察一下路牌和地貌。"}</p>
  `;
  nextButton.textContent = round >= TOTAL_ROUNDS ? "查看结算" : "下一回合";
  nextButton.classList.remove("hidden");
}

function finishGame() {
  best = Math.max(best, score);
  localStorage.setItem(BEST_KEY, String(best));
  bestText.textContent = best;
  postMiniChatScore(score);
  endTitle.textContent = `总分 ${score}`;
  endText.textContent = `最高分 ${best}。可以直接再来一局，也可以返回地图选择换地图。`;
  endModal.classList.remove("hidden");
  resultBox.innerHTML = `
    <span>Game Over</span>
    <strong>总分 ${score}</strong>
    <p>最高分 ${best}。</p>
  `;
}

function postMiniChatScore(finalScore) {
  const safeScore = Math.max(0, Math.floor(Number(finalScore) || 0));
  if (!safeScore || window.parent === window) return;
  try {
    window.parent.postMessage({ type: "street-guessr-score", score: safeScore }, window.location.origin);
  } catch {
    // The standalone game still works even when it is not embedded in Mini Chat.
  }
}

async function startGame() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    resultBox.innerHTML = "";
    alert("先输入 Google Maps API Key。");
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  localStorage.setItem(MAP_KEY, selectedMapId);
  startButton.disabled = true;
  startButton.textContent = "加载中...";
  try {
    await loadGoogleMaps(key);
    if (!mapsLoaded) return;
    endModal.classList.add("hidden");
    setupPanel.classList.add("hidden");
    gamePanel.classList.remove("hidden");
    if (!panorama) initMaps();
    round = 1;
    score = 0;
    resetSeedBag();
    await startRound();
  } catch (error) {
    alert(error.message);
  } finally {
    startButton.disabled = false;
    startButton.textContent = "开始游戏";
  }
}

saveKeyButton.addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, apiKeyInput.value.trim());
  saveKeyButton.textContent = "已保存";
  setTimeout(() => {
    saveKeyButton.textContent = "保存 Key";
  }, 900);
});

mapGallery.addEventListener("click", (event) => {
  const button = event.target.closest("[data-map]");
  if (!button) return;
  selectedMapId = button.dataset.map;
  localStorage.setItem(MAP_KEY, selectedMapId);
  resetSeedBag();
  renderMapGallery();
});

startButton.addEventListener("click", startGame);
submitButton.addEventListener("click", submitGuess);
nextButton.addEventListener("click", async () => {
  if (round >= TOTAL_ROUNDS) {
    finishGame();
    return;
  }
  round += 1;
  await startRound();
});

playAgainButton.addEventListener("click", startGame);
backToMapsButton.addEventListener("click", () => {
  endModal.classList.add("hidden");
  gamePanel.classList.add("hidden");
  setupPanel.classList.remove("hidden");
  startButton.textContent = "开始游戏";
  renderMapGallery();
});

renderMapGallery();
