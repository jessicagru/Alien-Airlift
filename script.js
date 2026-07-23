"use strict";

const homeScreen = document.getElementById("home-screen");
const instructionsScreen = document.getElementById("instructions-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const playButton = document.getElementById("play-button");
const instructionsButton = document.getElementById("instructions-button");
const backButton = document.getElementById("back-button");

function showScreen(screen){
    document
    .querySelectorAll(".screen")
    .forEach(section => {
        section.classList.remove("active");
    });
    screen.classList.add("active");
}

playButton.addEventListener("click", ()=>{
    showScreen(gameScreen);
    startLevel();
});

instructionsButton.addEventListener("click", ()=>{
    showScreen(instructionsScreen);
});

backButton.addEventListener("click", ()=>{
    showScreen(homeScreen);
});

function showGame(){
    homeScreen.classList.remove("active");
    gameScreen.classList.add("active");
}

function showInstructions(){
    homeScreen.classList.remove("active");
    instructionsScreen.classList.add("active");
}

function returnHome(){
    instructionsScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    gameOverScreen.classList.remove("active");
    homeScreen.classList.add("active");

}

/*game elements */
const playArea = document.getElementById("play-area");
const ship = document.getElementById("ship");
const scoreDisplay = document.getElementById("score-value");
const hearts = document.querySelectorAll(".heart");
const gameResultTitle =
document.getElementById("game-result-title")
const gameResultMessage =
document.getElementById("game-result-message");
const finalScore =
document.getElementById("final-score");
const nextLevelButton =
document.getElementById("next-level-button");
const restartLevelButton =
document.getElementById("restart-level-button");
const returnHomeButton =
document.getElementById("return-home-button");


/* levels */
const levels = {
    1: {
        goal:15,
        obstacleSpeed:120,
        spawnRate:900,
        enemyShooting:false
    },

    2: {
        goal:30,
        obstacleSpeed:155,
        spawnRate:1200,
        enemyShooting:true
    },

    3: {

        goal:50,
        obstacleSpeed:185,
        spawnRate:1500,
        enemyShooting:true
    }
};

/* variables */
let currentLevel = 1;
let destroyedCount = 0;
let score = 0;
let health = 3;
let gameRunning = false;
let shipX = 60;
let shipY = 300;
let lastTime = 0;
let spawnTimer = 0;
const keys = {};
const bullets = [];
const obstacles = [];
const enemyBullets = [];



window.addEventListener(
"keydown",
(event)=>{
    keys[event.key.toLowerCase()] = true;
    if(event.code === "Space"){
        shoot();
    }
});

window.addEventListener(
"keyup",
(event)=>{
    keys[event.key.toLowerCase()] = false;
});


function moveShip(deltaTime){
    const speed = 260;
    if(keys["w"] || keys["arrowup"]){
        shipY -= speed * deltaTime;
    }
    if(keys["s"] || keys["arrowdown"]){
        shipY += speed * deltaTime;
    }
    if(keys["a"] || keys["arrowleft"]){
        shipX -= speed * deltaTime;
    }
    if(keys["d"] || keys["arrowright"]){
        shipX += speed * deltaTime;
    }

    shipX =
    Math.max(
        0,
        Math.min(
            playArea.clientWidth - 60,
            shipX
        )
    );

    shipY =
    Math.max(
        0,
        Math.min(
            playArea.clientHeight - 60,
            shipY
        )
    );

    ship.style.left =
    `${shipX}px`;

    ship.style.top =
    `${shipY}px`;
}



function startLevel(){
    clearObjects();
    destroyedCount = 0;
    health = 3;
    updateHUD();
    gameRunning = true;
    shipX = 60;
    shipY =
    playArea.clientHeight / 2;
    ship.style.left =
    `${shipX}px`;
    ship.style.top =
    `${shipY}px`;
    lastTime =
    performance.now();
    requestAnimationFrame(gameLoop);
    /*hearts.forEach(heart=>{
        heart.classList.remove("grey");
    });*/
}


function clearObjects(){
    bullets.forEach(
        bullet =>
        bullet.element.remove()
    );
    obstacles.forEach(
        obstacle =>
        obstacle.element.remove()
    );
    enemyBullets.forEach(
        bullet =>
        bullet.element.remove()
    );
    bullets.length = 0;
    obstacles.length = 0;
    enemyBullets.length = 0;
}

function shoot(){
    if(!gameRunning) return;
    const bulletElement =
    document.createElement("div");
    bulletElement.className = "bullet";
    playArea.appendChild(
        bulletElement
    );
    const bullet = {
        element: bulletElement,
        x: shipX + 60,
        y: shipY + 22,
        width:30,
        height:18,
        speed:650
    };
    bulletElement.style.left =
    `${bullet.x}px`;
    bulletElement.style.top =
    `${bullet.y}px`;
    bullets.push(bullet);
}


function spawnObstacle(){
    const obstacleElement =
    document.createElement("div");
    obstacleElement.className =
    "enemy";
    playArea.appendChild(
        obstacleElement
    );
    const settings =
    levels[currentLevel];
    const obstacle = {
        element: obstacleElement,
        x:
        playArea.clientWidth + 80,
        y:
        Math.random() *
        (playArea.clientHeight - 80),
        width:55,
        height:55,
        speed:
        settings.obstacleSpeed
        +
        Math.random()*40,
        shootTimer:
        Math.random()*3000
    };
    obstacleElement.style.left =
    `${obstacle.x}px`;
    obstacleElement.style.top =
    `${obstacle.y}px`;
    obstacles.push(obstacle);
}


function enemyShoot(obstacle){
    const bulletElement =
    document.createElement("div");
    bulletElement.className = "enemy-bullet";
    playArea.appendChild(
        bulletElement
    );
    const bullet = {
        element:bulletElement,
        x:obstacle.x,
        y:obstacle.y+25,
        width:25,
        height:10,
        speed:350
    };
    bulletElement.style.left =
    `${bullet.x}px`;
    bulletElement.style.top =
    `${bullet.y}px`;
    enemyBullets.push(bullet);
}

function collision(a,b){
return (
a.x < b.x+b.width &&
a.x+a.width > b.x &&
a.y < b.y+b.height &&
a.y+a.height > b.y
);
}
function updateBullets(delta){
    for(let i=bullets.length-1;i>=0; i--){
        const bullet =
        bullets[i];
        bullet.x +=
        bullet.speed * delta;
        bullet.element.style.left =
        `${bullet.x}px`;
        for(let j=obstacles.length-1; j>=0; j--){
            const obstacle =
            obstacles[j];
            if(collision(bullet, obstacle)){hitObstacle(obstacle);
                bullet.element.remove();
                bullets.splice(i,1);
                break;
            }
        }
        if(bullet.x >playArea.clientWidth){
            bullet.element.remove();
            bullets.splice(i,1);
        }
    }
}

function hitObstacle(obstacle){
    obstacle.element.classList.remove(
        "enemy-hit");
    void obstacle.element.offsetWidth;
    obstacle.element.classList.add(
        "enemy-hit"
    );
    setTimeout(()=>{
        destroyObstacle(
            obstacle
        );
    },400);
}

function destroyObstacle(obstacle){
    const index =
    obstacles.indexOf(
        obstacle
    );
    if(index === -1)
    return;
    obstacle.element.remove();
    obstacles.splice(
        index,
        1
    );
    destroyedCount++;
    score +=100;

    updateHUD();
    if(destroyedCount >= levels[currentLevel].goal){ levelComplete();}
}

function updateObstacles(delta){
for(let i=obstacles.length-1;i>=0; i--){
const obstacle =
obstacles[i];
obstacle.x -=
obstacle.speed*delta;
obstacle.element.style.left =
`${obstacle.x}px`;
if(levels[currentLevel].enemyShooting){
obstacle.shootTimer -=
delta*1000;
if(obstacle.shootTimer <=0
){
enemyShoot(obstacle);
obstacle.shootTimer =
2000+
Math.random()*2000;
}}
const shipBox={
x:shipX,
y:shipY,
width:60,
height:60
};
if(collision(obstacle, shipBox)){
    damagePlayer();
    obstacle.element.remove();
    obstacles.splice(i,1);
    continue;
}

if(obstacle.x < -100){
obstacle.element.remove();
obstacles.splice(i,1);
}}}

function updateEnemyBullets(delta){
for(let i=enemyBullets.length-1;i>=0;i--){
    const bullet =
    enemyBullets[i];
    bullet.x -=
    bullet.speed*delta;
    bullet.element.style.left =
`${bullet.x}px`;

if(collision(bullet,
{x:shipX,y:shipY,width:60,height:60})){
    damagePlayer();
    bullet.element.remove();
    enemyBullets.splice(i,1);
    continue;
}

if(bullet.x < -50){
    bullet.element.remove();
    enemyBullets.splice(i,1);
}}}


function damagePlayer(){
    health--;
    const damagedHeart =
    hearts[health];
if(damagedHeart){damagedHeart.classList.add("grey");}

ship.classList.remove(
"ship-hit"
);

void ship.offsetWidth;

ship.classList.add(
"ship-hit");

if(health<=0){
gameOver(false);
}}


function updateHUD(){
    scoreDisplay.textContent =
    String(score)
    .padStart(5,"0");}


function gameLoop(time){
    if(!gameRunning) return;
    const delta =
    (time-lastTime)/1000;
    lastTime=time;
    moveShip(delta);



spawnTimer +=
delta*1000;

if(spawnTimer >=levels[currentLevel].spawnRate){
    spawnObstacle();
    spawnTimer=0;
}

updateBullets(delta);
updateObstacles(delta);
updateEnemyBullets(delta);

requestAnimationFrame(gameLoop);
}

function levelComplete(){
    gameRunning=false;
    gameResultTitle.textContent =
    "LEVEL COMPLETE!";
    gameResultMessage.textContent =
    `${destroyedCount} obstacles destroyed!`;
    finalScore.textContent =
    score;
    nextLevelButton.classList.remove("hidden");


    restartLevelButton.classList.add(
    "hidden"
);



gameOverScreen.classList.remove(
    "hidden"
);}

function gameOver(win){
gameRunning=false;
if(win){gameResultTitle.textContent ="YOU WIN!";

gameResultMessage.textContent =
    "Galaxy saved!";
}
else{  
gameResultTitle.textContent =
    "MISSION FAILED";
gameResultMessage.textContent =
    "Your spacecraft was destroyed.";
}

finalScore.textContent =
score;
nextLevelButton.classList.add(
"hidden"
);
restartLevelButton.classList.remove(
"hidden"
);
gameOverScreen.classList.remove(
"hidden"
);
}

nextLevelButton.addEventListener(
"click",
()=>{currentLevel++;


gameOverScreen.classList.add(
"hidden"
);
startLevel();
}
);

restartLevelButton.addEventListener(
"click",
()=>{
gameOverScreen.classList.add(
"hidden"
);
startLevel();
}
);
returnHomeButton.addEventListener(
"click",
()=>{
gameOverScreen.classList.add(
"hidden"
);
showScreen(homeScreen);
}
);