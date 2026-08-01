"use strict";

const homeScreen = document.getElementById("home-screen");
const instructionsScreen = document.getElementById("instructions-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const missionCompleteScreen = document.getElementById("mission-complete-screen");
const objectiveOverlay = document.getElementById("objective-overlay");

const playButton = document.getElementById("play-button");
const instructionsButton = document.getElementById("instructions-button");
const backButton = document.getElementById("back-button");
const objectiveButton = document.getElementById("objective-button");
const objectiveEyebrow = document.getElementById("objective-eyebrow");
const objectiveTitle = document.getElementById("objective-title");
const objectiveDescription = document.getElementById("objective-description");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(section => section.classList.remove("active"));
  screen.classList.add("active");
}

playButton.addEventListener("click", () => {
  showScreen(gameScreen);
  currentLevel = 1;
  startLevel();
});
instructionsButton.addEventListener("click", () => showScreen(instructionsScreen));
backButton.addEventListener("click", () => showScreen(homeScreen));

/* game elements */
const playArea = document.getElementById("play-area");
const ship = document.getElementById("ship");
const shipSprite = document.getElementById("ship-sprite");
const scoreDisplay = document.getElementById("score-value");
const hearts = document.querySelectorAll(".heart-icon");
const levelIndicator = document.getElementById("level-indicator");
const introPlanet = document.getElementById("intro-planet");
const progressPlanet = document.getElementById("progress-planet");
const starfield = document.getElementById("starfield");

/* STARSSS */
(function buildStarfield() {
  const STAR_COUNT = 70;
  for (let i = 0; i < STAR_COUNT; i++) {
    const dot = document.createElement("div");
    dot.className = "star-dot";
    const size = 1 + Math.random() * 2.4;
    const duration = 4 + Math.random() * 10;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.opacity = String(0.3 + Math.random() * 0.7);
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay = `-${Math.random() * duration}s`;
    starfield.appendChild(dot);
  }
})();
const tutorialBanner = document.getElementById("tutorial-banner");
const tutorialText = document.getElementById("tutorial-text");

const gameResultTitle = document.getElementById("game-result-title");
const gameResultMessage = document.getElementById("game-result-message");
const finalScore = document.getElementById("final-score");
const nextLevelButton = document.getElementById("next-level-button");
const restartLevelButton = document.getElementById("restart-level-button");
const returnHomeButton = document.getElementById("return-home-button");
const starEls = [document.getElementById("star1"), document.getElementById("star2"), document.getElementById("star3")];

const missionFinalScore = document.getElementById("mission-final-score");
const playAgainButton = document.getElementById("play-again-button");
const missionReturnHomeButton = document.getElementById("mission-return-home-button");
const finalStarEls = [document.getElementById("fstar1"), document.getElementById("fstar2"), document.getElementById("fstar3")];

/* levels */
const levels = {
  1: { goal: 15, obstacleSpeed: 130, spawnRate: 900, enemyShooting: false },
  2: { goal: 20, obstacleSpeed: 165, spawnRate: 1200, enemyShooting: true },
  3: { goal: 30, obstacleSpeed: 205, spawnRate: 1500, enemyShooting: true }
};
const MAX_LEVEL = 3;

const SHIP_SPRITES = {
  1: "images/lvl-1.png",
  2: "images/lvl-2.png",
  3: "images/lvl-3.png"
};
const PLANET_SPRITES = {
  1: "images/planet-one.png",
  2: "images/planet-3.png",
  3: "images/planet-one.png"
};

const HAZARD_POOLS = {
  1: [
    { type: "asteroid", src: "images/hazard-1.png", alt: "Asteroid", shooter: false },
    { type: "asteroid", src: "images/hazard-2.png", alt: "Asteroid", shooter: false }
  ],
  2: [
    { type: "asteroid", src: "images/hazard-1.png", alt: "Asteroid", shooter: false },
    { type: "asteroid", src: "images/hazard-2.png", alt: "Asteroid", shooter: false },
    { type: "ship", src: "images/ship-3.png", alt: "Enemy alien ship hazard", shooter: true }
  ],
  3: [
    { type: "asteroid", src: "images/hazard-1.png", alt: "Rocky grey asteroid hazard", shooter: false },
    { type: "asteroid", src: "images/hazard-2.png", alt: "Rust-colored asteroid hazard", shooter: false },
    { type: "ship", src: "images/ship-1.png", alt: "Enemy alien ship hazard", shooter: true },
    { type: "ship", src: "images/ship-2.png", alt: "Enemy alien ship hazard", shooter: true }
  ]
};

const objectives = {
  1: {
    eyebrow: "Level 1",
    title: "Press W/S or the ⬆️ ⬇️ keys to move your spacecraft!",
    description: `Dodge ${levels[1].goal} hazards to complete the mission!`
  },
  2: {
    eyebrow: "Level 2",
    title: "Press SPACE to fire your lasers!",
    description: `Enemy ships shoot back, dodge or destroy ${levels[2].goal} hazards to complete the mission!`
  },
  3: {
    eyebrow: "Level 3",
    title: "Final approach! Stay sharp out there!",
    description: `Dodge or destroy ${levels[3].goal} hazards to bring the aliens home!`
  }
};

const tutorials = {
  1: [
    { text: "Move your ship: use W/S or the ⬆️ ⬇️ arrow keys to steer!", duration: 10000 },
    { text: "Dodge the asteroids to gain points!", duration: 6000 }
  ],
  2: [
    { text: "Press SPACE to fire your lasers!", duration: 8000 }
  ],
  3: []
};

/* variables */
let currentLevel = 1;
let destroyedCount = 0;
let dodgedCount = 0;
let score = 0;
let health = 3;
let gameRunning = false;
let introPlaying = false;
let shipX = 60;
let shipY = 300;
let lastTime = 0;
let spawnTimer = 0;
const TOP_MARGIN = 110; 

const keys = {};
const bullets = [];
const obstacles = [];
const enemyBullets = [];
let bannerTimeoutId = null;
let introTimeoutId = null;
let planetHideTimeoutId = null;

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
  if (event.code === "Space") {
    event.preventDefault();
    shoot();
  }
});
window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function moveShip(deltaTime) {
  if (!gameRunning || introPlaying) return;
  const speed = 260;
  if (keys["w"] || keys["arrowup"]) shipY -= speed * deltaTime;
  if (keys["s"] || keys["arrowdown"]) shipY += speed * deltaTime;

  shipX = Math.max(0, Math.min(playArea.clientWidth - 70, shipX));
  shipY = Math.max(TOP_MARGIN, Math.min(playArea.clientHeight - 70, shipY));

  ship.style.left = `${shipX}px`;
  ship.style.top = `${shipY}px`;
}

function clearBannerQueue() {
  if (bannerTimeoutId) {
    clearTimeout(bannerTimeoutId);
    bannerTimeoutId = null;
  }
  tutorialBanner.classList.remove("show");
}

function playTutorialQueue(queue) {
  clearBannerQueue();
  let i = 0;
  function showNext() {
    if (i >= queue.length) return;
    const step = queue[i];
    tutorialText.textContent = step.text;
    tutorialBanner.classList.remove("show");
    void tutorialBanner.offsetWidth; 
    tutorialBanner.classList.add("show");
    bannerTimeoutId = setTimeout(() => {
      tutorialBanner.classList.remove("show");
      bannerTimeoutId = setTimeout(() => {
        i++;
        showNext();
      }, 500);
    }, step.duration);
  }
  showNext();
}

function showObjectiveOverlay() {
  const info = objectives[currentLevel];
  objectiveEyebrow.textContent = info.eyebrow;
  objectiveTitle.textContent = info.title;
  objectiveDescription.textContent = info.description;
  objectiveOverlay.classList.remove("hidden");
  ship.classList.remove("reveal");
  ship.classList.add("hidden");
}

objectiveButton.addEventListener("click", () => {
  objectiveOverlay.classList.add("hidden");
  beginLevelIntro();
  ship.classList.remove("hidden");
  ship.classList.add("reveal");
});

function startLevel() {
  clearObjects();
  clearBannerQueue();

  destroyedCount = 0;
  dodgedCount = 0;
  health = 3;
  updateHearts();
  updateHUD();
  levelIndicator.textContent = `LEVEL ${currentLevel}`;
  shipSprite.src = SHIP_SPRITES[currentLevel];
  introPlanet.src = PLANET_SPRITES[currentLevel];

  progressPlanet.classList.remove("reveal");
  progressPlanet.classList.add("hidden");

  ship.classList.remove("hidden");
  ship.classList.add("reveal");

  shipX = 60;
  shipY = playArea.clientHeight / 2;

  gameRunning = false;
  introPlaying = true;

  showObjectiveOverlay();
}

function beginLevelIntro() {
  const INTRO_MS = 1150;
  if (introTimeoutId) clearTimeout(introTimeoutId);
  if (planetHideTimeoutId) clearTimeout(planetHideTimeoutId);

  introPlanet.classList.remove("hidden", "play");

  ship.classList.remove("ship-intro");
  const startX = 10;
  const startY = playArea.clientHeight - 90;
  ship.style.left = `${startX}px`;
  ship.style.top = `${startY}px`;
  void ship.offsetWidth; 

  ship.classList.add("ship-intro");
  ship.style.left = `${shipX}px`;
  ship.style.top = `${shipY}px`;

  introPlanet.classList.add("play");

  introTimeoutId = setTimeout(() => {
    ship.classList.remove("ship-intro"); 
    introPlaying = false;
    gameRunning = true;
    spawnTimer = 0;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    playTutorialQueue(tutorials[currentLevel] || []);
  }, INTRO_MS);

  planetHideTimeoutId = setTimeout(() => introPlanet.classList.add("hidden"), 6000);
}

function clearObjects() {
  bullets.forEach(bullet => bullet.element.remove());
  obstacles.forEach(obstacle => obstacle.element.remove());
  enemyBullets.forEach(bullet => bullet.element.remove());
  bullets.length = 0;
  obstacles.length = 0;
  enemyBullets.length = 0;
}

function shoot() {
  if (!gameRunning || introPlaying) return;
  const bulletElement = document.createElement("div");
  bulletElement.className = "bullet";
  playArea.appendChild(bulletElement);
  const bullet = { element: bulletElement, x: shipX + 70, y: shipY + 26, width: 30, height: 18, speed: 650 };
  bulletElement.style.left = `${bullet.x}px`;
  bulletElement.style.top = `${bullet.y}px`;
  bullets.push(bullet);
}

function spawnObstacle() {
  const pool = HAZARD_POOLS[currentLevel];
  const choice = pool[Math.floor(Math.random() * pool.length)];

  const wrapper = document.createElement("div");
  wrapper.className = "enemy";
  const img = document.createElement("img");
  img.src = choice.src;
  img.alt = choice.alt;
  img.draggable = false;
  wrapper.appendChild(img);
  playArea.appendChild(wrapper);

  const settings = levels[currentLevel];
  const obstacle = {
    element: wrapper,
    type: choice.type,
    shooter: choice.shooter,
    x: playArea.clientWidth + 80,
    y: TOP_MARGIN + Math.random() * (playArea.clientHeight - TOP_MARGIN - 80),
    width: 55, height: 55,
    speed: settings.obstacleSpeed + Math.random() * 40,
    shootTimer: 1000 + Math.random() * 3000,
    hit: false
  };
  wrapper.style.left = `${obstacle.x}px`;
  wrapper.style.top = `${obstacle.y}px`;
  obstacles.push(obstacle);
}

function enemyShoot(obstacle) {
  const bulletElement = document.createElement("div");
  bulletElement.className = "enemy-bullet";
  playArea.appendChild(bulletElement);
  const bullet = { element: bulletElement, x: obstacle.x, y: obstacle.y + 22, width: 25, height: 10, speed: 350 };
  bulletElement.style.left = `${bullet.x}px`;
  bulletElement.style.top = `${bullet.y}px`;
  enemyBullets.push(bullet);
}

function collision(a, b) {
  return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
}

function popBullet(element, list, index) {
  element.classList.add("bullet-hit");
  setTimeout(() => element.remove(), 180);
  list.splice(index, 1);
}

function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.speed * delta;
    bullet.element.style.left = `${bullet.x}px`;
    let consumed = false;


    for (let j = obstacles.length - 1; j >= 0; j--) {
      const obstacle = obstacles[j];
      if (!obstacle.hit && collision(bullet, obstacle)) {
        hitObstacle(obstacle);
        consumed = true;
        break;
      }
    }

    if (!consumed) {
      for (let k = enemyBullets.length - 1; k >= 0; k--) {
        const enemyBullet = enemyBullets[k];
        if (collision(bullet, enemyBullet)) {
          popBullet(enemyBullet.element, enemyBullets, k);
          consumed = true;
          break;
        }
      }
    }

    if (consumed || bullet.x > playArea.clientWidth) {
      bullet.element.remove();
      bullets.splice(i, 1);
    }
  }
}

function hitObstacle(obstacle) {
  if (obstacle.hit) return;
  obstacle.hit = true; 
  obstacle.element.classList.remove("enemy-hit");
  void obstacle.element.offsetWidth;
  obstacle.element.classList.add("enemy-hit");
  setTimeout(() => destroyObstacle(obstacle), 350);
}

function destroyObstacle(obstacle) {
  const index = obstacles.indexOf(obstacle);
  if (index === -1) return;
  obstacle.element.remove();
  obstacles.splice(index, 1);
  destroyedCount++;
  score += 100;
  updateHUD();
  checkProgressReveal();
  if (destroyedCount + dodgedCount >= levels[currentLevel].goal) levelComplete();
}

function checkProgressReveal() {
  const goal = levels[currentLevel].goal;
  const progressed = destroyedCount + dodgedCount;
  if (progressed >= goal * 0.7 && progressPlanet.classList.contains("hidden")) {
    progressPlanet.classList.remove("hidden");
    progressPlanet.classList.add("reveal");
  }
}

function updateObstacles(delta) {
  if (!gameRunning) return;
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.x -= obstacle.speed * delta;
    obstacle.element.style.left = `${obstacle.x}px`;

    if (obstacle.shooter && levels[currentLevel].enemyShooting && !obstacle.hit) {
      obstacle.shootTimer -= delta * 1000;
      if (obstacle.shootTimer <= 0) {
        enemyShoot(obstacle);
        obstacle.shootTimer = 2000 + Math.random() * 2000;
      }
    }

    const shipBox = { x: shipX, y: shipY, width: 70, height: 70 };
    if (!obstacle.hit && collision(obstacle, shipBox)) {
      damagePlayer();
      obstacle.element.remove();
      obstacles.splice(i, 1);
      continue;
    }
    if (obstacle.x < -100) {
      const wasHit = obstacle.hit;
      obstacle.element.remove();
      obstacles.splice(i, 1);
      if (!wasHit) {
        dodgedCount++;
        score += 25;
        updateHUD();
        checkProgressReveal();
        if (destroyedCount + dodgedCount >= levels[currentLevel].goal && gameRunning) {
          levelComplete();
          return;
        }}}}}

function updateEnemyBullets(delta) {
  if (!gameRunning) return;
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.x -= bullet.speed * delta;
    bullet.element.style.left = `${bullet.x}px`;
    if (collision(bullet, { x: shipX, y: shipY, width: 70, height: 70 })) {
      damagePlayer();
      bullet.element.remove();
      enemyBullets.splice(i, 1);
      continue;
    }
    if (bullet.x < -50) {
      bullet.element.remove();
      enemyBullets.splice(i, 1);
    }
  }
}

function damagePlayer() {
  if (!gameRunning) return; 
  health--;
  updateHearts();
  ship.classList.remove("ship-hit");
  void ship.offsetWidth;
  ship.classList.add("ship-hit");
  if (health <= 0) gameOver(false);
}

function updateHearts() {
  hearts.forEach((heart, index) => {
    const filled = index < health;
    heart.classList.toggle("grey", !filled);
    const path = heart.querySelector(".heart-path");
    if (path) {
      path.style.fill = filled ? "#ff3b52" : "#9a9a9a";
      path.style.stroke = filled ? "#7a0012" : "#5c5c5c";
    }
  });
}

function updateHUD() {
  scoreDisplay.textContent = String(score).padStart(5, "0");
}

function gameLoop(time) {
  if (!gameRunning) return;
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  moveShip(delta);

  spawnTimer += delta * 1000;
  if (spawnTimer >= levels[currentLevel].spawnRate) {
    spawnObstacle();
    spawnTimer = 0;
  }

  updateBullets(delta);
  if (!gameRunning) return; 
  updateObstacles(delta);
  if (!gameRunning) return; 
  updateEnemyBullets(delta);
  if (!gameRunning) return;

  requestAnimationFrame(gameLoop);
}

function setStars(targetEls) {
  targetEls.forEach((star, i) => star.classList.toggle("filled", i < health));
}

function levelComplete() {
  gameRunning = false;
  clearObjects();
  clearBannerQueue();

  if (currentLevel >= MAX_LEVEL) {
    missionComplete();
    return;
  }

  setStars(starEls);
  gameResultTitle.textContent = "LEVEL COMPLETE!";
  gameResultMessage.textContent = `${destroyedCount} destroyed, ${dodgedCount} dodged!`;
  finalScore.textContent = score;
  nextLevelButton.classList.remove("hidden");
  restartLevelButton.classList.remove("hidden");
  gameOverScreen.classList.remove("hidden");
}

function missionComplete() {
  setStars(finalStarEls);
  missionFinalScore.textContent = score;
  missionCompleteScreen.classList.remove("hidden");
}

function gameOver(win) {
  gameRunning = false;
  clearObjects();
  clearBannerQueue();
  setStars(starEls);
  if (win) {
    gameResultTitle.textContent = "YOU WIN!";
    gameResultMessage.textContent = "Galaxy saved!";
  } else {
    gameResultTitle.textContent = "MISSION FAILED";
    gameResultMessage.textContent = "Your spacecraft was destroyed.";
  }
  finalScore.textContent = score;
  nextLevelButton.classList.add("hidden");
  restartLevelButton.classList.remove("hidden");
  gameOverScreen.classList.remove("hidden");
}

nextLevelButton.addEventListener("click", () => {
  currentLevel++;
  gameOverScreen.classList.add("hidden");
  startLevel();
});

restartLevelButton.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startLevel();
});

returnHomeButton.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  gameRunning = false;
  clearObjects();
  clearBannerQueue();
  currentLevel = 1;
  showScreen(homeScreen);
});

playAgainButton.addEventListener("click", () => {
  missionCompleteScreen.classList.add("hidden");
  currentLevel = 1;
  startLevel();
});

missionReturnHomeButton.addEventListener("click", () => {
  missionCompleteScreen.classList.add("hidden");
  gameRunning = false;
  clearObjects();
  clearBannerQueue();
  currentLevel = 1;
  showScreen(homeScreen);
});
