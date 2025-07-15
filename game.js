const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
canvas.width = 300; // 10 * 30
canvas.height = 600; // 20 * 30
context.scale(30, 30); // 블록 크기 30px

const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const ROWS = 20;
const COLS = 10;

function createMatrix(rows, cols) {
    const matrix = [];
    while (rows--) {
        matrix.push(new Array(cols).fill(0));
    }
    return matrix;
}

const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 0, 0], [1, 1, 1]], // J
    [[0, 0, 1], [1, 1, 1]], // L
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
];

const colors = [
    null,
    '#00bfff', // I (밝은 파랑)
    '#ffd700', // O (노랑)
    '#8a2be2', // T (보라)
    '#1e90ff', // J (중간 파랑)
    '#ff8c00', // L (주황)
    '#32cd32', // S (초록)
    '#dc143c', // Z (빨강)
];

let arena = createMatrix(ROWS, COLS);
let player = {
    pos: {x: 3, y: 0},
    matrix: null,
    score: 0
};

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineWidth = 0.03; // 더 얇은 테두리
                context.strokeStyle = "#222"; // 어두운 테두리
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] &&
                (arena[y + o.y] &&
                 arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const rand = Math.floor(Math.random() * tetrominoes.length);
    player.matrix = tetrominoes[rand].map(row => row.slice());
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena = createMatrix(ROWS, COLS);
        player.score = 0;
        updateScore();
    }
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (!arena[y][x]) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore() {
    scoreElement.innerText = `점수: ${player.score}`;
}

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function draw() {
    context.fillStyle = "#fff"; // 흰색 배경
    context.fillRect(0, 0, COLS, ROWS);
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

restartBtn.addEventListener('click', () => {
    arena = createMatrix(ROWS, COLS);
    player.score = 0;
    updateScore();
    playerReset();
});

playerReset();
updateScore();
update();