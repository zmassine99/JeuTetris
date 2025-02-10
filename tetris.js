const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const blockSize = 30;
const rows = 20;
const cols = 10;

let grid;
let currentPiece;
let score = 0;
let gameRunning = true;

const pieces = [
  { shape: [[1, 1, 1, 1]], color: 'cyan' }, // I
  { shape: [[1, 1], [1, 1]], color: 'yellow' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' }, // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' }, // J
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'red' } // Z
];

// Initialize game grid
function initGrid() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(null));
}

// Draw game grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col]) {
        ctx.fillStyle = grid[row][col];
        ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
        ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Spawn a random piece
function spawnPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  const { shape, color } = pieces[index];

  currentPiece = {
    shape: shape,
    color: color,
    x: Math.floor(cols / 2) - Math.floor(shape[0].length / 2),
    y: 0
  };
}

// Draw current piece
function drawPiece() {
  ctx.fillStyle = currentPiece.color;
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        ctx.fillRect(
          (currentPiece.x + col) * blockSize,
          (currentPiece.y + row) * blockSize,
          blockSize,
          blockSize
        );
        ctx.strokeRect(
          (currentPiece.x + col) * blockSize,
          (currentPiece.y + row) * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
}

// Rotate the piece clockwise
function rotatePiece() {
  const newShape = currentPiece.shape[0].map((_, index) =>
    currentPiece.shape.map(row => row[index])
  ).reverse();

  currentPiece.shape = newShape;
}

// Move piece down
function movePieceDown() {
  currentPiece.y++;
  if (checkCollision()) {
    currentPiece.y--;
    placePiece();
    spawnPiece();
  }
}

// Place piece on grid
function placePiece() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        const x = currentPiece.x + col;
        const y = currentPiece.y + row;

        if (y < 0) {
          endGame();
          return;
        }

        grid[y][x] = currentPiece.color;
      }
    }
  }
  clearLines();
}

// Clear complete lines
function clearLines() {
  grid = grid.filter(row => row.some(cell => cell === null));
  const clearedLines = rows - grid.length;

  for (let i = 0; i < clearedLines; i++) {
    grid.unshift(Array(cols).fill(null));
  }

  score += clearedLines * 100;
  updateScore();
}

// Update score display
function updateScore() {
  document.getElementById('score-value').textContent = score;
}

// Check for collision
function checkCollision() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        const x = currentPiece.x + col;
        const y = currentPiece.y + row;

        if (x < 0 || x >= cols || y >= rows || (grid[y] && grid[y][x])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
  if (!gameRunning) return;

  switch (event.key) {
    case 'ArrowLeft':
      currentPiece.x--;
      if (checkCollision()) currentPiece.x++;
      break;

    case 'ArrowRight':
      currentPiece.x++;
      if (checkCollision()) currentPiece.x--;
      break;

    case 'ArrowDown':
      movePieceDown();
      break;

    case 'ArrowUp':
      rotatePiece();
      break;
  }
});

// End the game
function endGame() {
  gameRunning = false;
  document.getElementById('game-over').style.display = 'block';
}

// Start the game
function startGame() {
  gameRunning = true;
  score = 0;
  updateScore();
  document.getElementById('game-over').style.display = 'none';
  initGrid();
  spawnPiece();
  gameLoop();
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  drawGrid();
  drawPiece();
  movePieceDown();

  setTimeout(gameLoop, 500);
}

startGame();
