/* Final consolidated game.js - see conversation for full feature list */
const ROWS = 17;
const COLS = 10;
const CELL = 40;

const canvas = document.getElementById("game");
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
const ctx = canvas.getContext("2d");

const appleImg = document.getElementById("appleImg");

const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.4;

const popSound = new Audio("pop.mp3");
const gameOverSound = new Audio("gameover.mp3");

let board, score, timeLeft, gameOver;
let dragging = false;
let dragStart = null;
let dragEnd = null;

const restartButton = { x: 0, y: 0, width: 180, height: 50 };

function initBoard() {
  board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.floor(Math.random() * 9) + 1)
  );
}

function resetGame() {
  initBoard();
  score = 0;
  timeLeft = 120;
  gameOver = false;
  dragging = false;
  dragStart = dragEnd = null;

  gameOverSound.pause();
  gameOverSound.currentTime = 0;
  bgm.currentTime = 0;
  bgm.play().catch(()=>{});
}

resetGame();

setInterval(() => {
  if (gameOver) return;
  timeLeft--;
  if (timeLeft <= 0) {
    timeLeft = 0;
    gameOver = true;
    bgm.pause();
    gameOverSound.play();
  }
}, 1000);

function start(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  if (gameOver) {
    if (
      x >= restartButton.x && x <= restartButton.x + restartButton.width &&
      y >= restartButton.y && y <= restartButton.y + restartButton.height
    ) resetGame();
    return;
  }

  if (bgm.paused) bgm.play().catch(()=>{});

  dragging = true;
  dragStart = { x, y };
  dragEnd = { x, y };
}

function move(e) {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  dragEnd = {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  };
}

function end() {
  if (!dragging) return;

  const minX = Math.min(dragStart.x, dragEnd.x);
  const maxX = Math.max(dragStart.x, dragEnd.x);
  const minY = Math.min(dragStart.y, dragEnd.y);
  const maxY = Math.max(dragStart.y, dragEnd.y);

  let sum = 0;
  let cells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = c * CELL + CELL / 2;
      const cy = r * CELL + CELL / 2;
      if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
        if (board[r][c] !== 0) {
          sum += board[r][c];
          cells.push([r, c]);
        }
      }
    }
  }

  if (sum === 10) {
    popSound.currentTime = 0;
    popSound.play();
    cells.forEach(([r, c]) => board[r][c] = 0);
    score++;
  }

  dragging = false;
  dragStart = dragEnd = null;
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("touchstart", start);
canvas.addEventListener("touchmove", move);
canvas.addEventListener("touchend", end);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let minX, maxX, minY, maxY;
  if (dragging && dragStart && dragEnd) {
    minX = Math.min(dragStart.x, dragEnd.x);
    maxX = Math.max(dragStart.x, dragEnd.x);
    minY = Math.min(dragStart.y, dragEnd.y);
    maxY = Math.max(dragStart.y, dragEnd.y);
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL;
      const y = r * CELL;

      ctx.strokeStyle = "#aaa";
      ctx.strokeRect(x, y, CELL, CELL);

      if (board[r][c] !== 0) {
        ctx.filter = "brightness(60%)";
        ctx.drawImage(appleImg, x + 2, y + 2, CELL - 4, CELL - 4);
        ctx.filter = "none";

        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        const selected = dragging && cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;

        ctx.font = "bold 20px 'Comic Neue', cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(board[r][c], cx, cy);
        ctx.fillStyle = selected ? "cyan" : "white";
        ctx.fillText(board[r][c], cx, cy);
      }
    }
  }

  if (dragging) {
    ctx.fillStyle = "rgba(0,255,255,0.15)";
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    ctx.strokeStyle = "cyan";
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  }

  ctx.fillStyle = "black";
  ctx.font = "bold 18px 'Comic Neue', cursive";
  ctx.textAlign = "left";
  ctx.fillText("Time: " + timeLeft, 10, 22);
  ctx.textAlign = "center";
  ctx.fillText("Score: " + score, canvas.width / 2, 22);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 32px 'Comic Neue', cursive";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = "bold 22px 'Comic Neue', cursive";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 - 20);

    restartButton.x = canvas.width / 2 - restartButton.width / 2;
    restartButton.y = canvas.height / 2 + 20;

    ctx.fillStyle = "#ff4d4d";
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Comic Neue', cursive";
    ctx.fillText("RESTART", canvas.width / 2, restartButton.y + 32);
  }

  requestAnimationFrame(draw);
}

draw();
