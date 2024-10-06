const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ROWS = 16; // Reduced number of rows
const COLS = 10; // Same number of columns
const BLOCK_SIZE = 30; // Size of each block

const COLORS = [
    null,
    '#FF5733', // Tetrimino 1 (Red)
    '#33FF57', // Tetrimino 2 (Green)
    '#3357FF', // Tetrimino 3 (Blue)
    '#FF33A8', // Tetrimino 4 (Pink)
    '#FFFF33', // Tetrimino 5 (Yellow)
    '#33FFFF', // Tetrimino 6 (Cyan)
    '#FF33FF', // Tetrimino 7 (Magenta)
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let gameInterval;
let score = 0;

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const color = COLORS[board[y][x]];
            if (color) drawBlock(x, y, color);
        }
    }
}

function createPiece() {
    const pieces = [
        [[1, 1, 1, 1]], // I
        [[2, 2], [2, 2]], // O
        [[0, 3, 0], [3, 3, 3]], // T
        [[0, 4, 4], [4, 4, 0]], // S
        [[5, 5, 0], [0, 5, 5]], // Z
        [[0, 6, 0], [0, 6, 6], [0, 0, 6]], // J
        [[7, 0, 0], [7, 7, 7], [0, 0, 0]], // L
    ];

    const type = Math.floor(Math.random() * pieces.length);
    const piece = pieces[type];
    currentPiece = { shape: piece, posX: Math.floor(COLS / 2) - Math.floor(piece[0].length / 2), posY: 0 };
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) drawBlock(currentPiece.posX + x, currentPiece.posY + y, COLORS[value]);
        });
    });
}

function rotatePiece() {
    const originalShape = currentPiece.shape;
    currentPiece.shape = currentPiece.shape[0].map((val, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );

    if (collides()) {
        currentPiece.shape = originalShape; // Revert if collision
    }
}

function collides() {
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = currentPiece.posX + x;
                const newY = currentPiece.posY + y;
                return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
            }
            return false;
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) board[currentPiece.posY + y][currentPiece.posX + x] = value;
        });
    });
}

function removeFullRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 10;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
    }
}

function dropPiece() {
    currentPiece.posY++;
    if (collides()) {
        currentPiece.posY--;
        mergePiece();
        removeFullRows();
        createPiece();
        if (collides()) {
            clearInterval(gameInterval);
            alert('Game Over');
        }
    }
}

function update() {
    drawBoard();
    drawPiece();
    dropPiece();
}

document.getElementById('startButton').addEventListener('click', () => {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    document.getElementById('score').innerText = `Score: ${score}`;
    createPiece();
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 500);
});

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            currentPiece.posX--;
            if (collides()) currentPiece.posX++;
            break;
        case 'ArrowRight':
            currentPiece.posX++;
            if (collides()) currentPiece.posX--;
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
    }
});
