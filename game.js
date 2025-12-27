const ROWS = 17;
const COLS = 10;
const CELL = 40;

const canvas = document.getElementById("game");
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
const ctx = canvas.getContext("2d");

const appleImg = document.getElementById("appleImg");
const popSound = new Audio("pop.mp3");

let board = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => Math.floor(Math.random() * 9) + 1)
);

let selected = [];
let sum = 0;
let dragging = false;

function getCell(x, y) {
  return [
    Math.floor(y / CELL),
    Math.floor(x / CELL)
  ];
}

function isAdjacent(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function trySelect(r, c) {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
  if (board[r][c] === 0) return;
  if (selected.some(v => v[0] === r && v[1] === c)) return;

  if (selected.length > 0 && !isAdjacent(selected.at(-1), [r, c])) return;
  if (sum + board[r][c] > 10) return;

  selected.push([r, c]);
  sum += board[r][c];
}

function start(e) {
  dragging = true;
  selected = [];
  sum = 0;
}

function move(e) {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  const [r, c] = getCell(x, y);
  trySelect(r, c);
}

function end() {
  if (sum === 10) {
    popSound.currentTime = 0;
    popSound.play();
    selected.forEach(([r, c]) => board[r][c] = 0);
  }
  dragging = false;
  selected = [];
  sum = 0;
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);

canvas.addEventListener("touchstart", start);
canvas.addEventListener("touchmove", move);
canvas.addEventListener("touchend", end);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL;
      const y = r * CELL;

      ctx.strokeStyle = "#aaa";
      ctx.strokeRect(x, y, CELL, CELL);

      if (board[r][c] !== 0) {
        // 밝기 조절: 선택된 칸 제외
        if (selected.some(([sr, sc]) => sr === r && sc === c)) {
          ctx.filter = 'brightness(100%)'; // 원래 밝기
        } else {
          ctx.filter = 'brightness(50%)'; // 어둡게
        }
        ctx.drawImage(appleImg, x + 2, y + 2, CELL - 4, CELL - 4);
        ctx.filter = 'none';

        // 숫자 표시 (Comic Sans)
        ctx.fillStyle = selected.some(([sr, sc]) => sr === r && sc === c) ? 'yellow' : 'white';
        ctx.font = "bold 20px 'Comic Sans MS', cursive, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(board[r][c], x + CELL/2, y + CELL/2);

        ctx.font = "bold 20px 'Comic Neue', cursive, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// 테두리
ctx.strokeStyle = "black";
ctx.lineWidth = 3;
ctx.strokeText(board[r][c], x + CELL/2, y + CELL/2);

// 채우기
ctx.fillStyle = selected.some(([sr, sc]) => sr===r && sc===c) ? 'yellow' : 'white';
ctx.fillText(board[r][c], x + CELL/2, y + CELL/2);
      }
    }
  }

  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  selected.forEach(([r, c]) => {
    ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
  });

  requestAnimationFrame(draw);
}

draw();
