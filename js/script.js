document.addEventListener("DOMContentLoaded", () => {
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const turnTextEl = document.getElementById("turnText");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreTEl = document.getElementById("scoreT");
const celebrateEl = document.getElementById("celebrate");

const btnPvP = document.getElementById("btnPvP");
const btnPvC = document.getElementById("btnPvC");
const btnStartX = document.getElementById("startX");
const btnStartO = document.getElementById("startO");
const btnResetAll = document.getElementById("resetAll");
const btnNewRound = document.getElementById("newRound");
const btnUndo = document.getElementById("undo");
const btnHint = document.getElementById("hint");

let board = Array(9).fill("");
let current = "X";
let gameOver = false;
let mode = "pvp"; // "pvp" o "pvc"
let startPlayer = "X";
let history = [];

const scores = { X: 0, O: 0, T: 0 };

// --- Inicializar tablero ---
function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.textContent = cell;
    div.addEventListener("click", () => handleMove(i));
    boardEl.appendChild(div);
    });
}

function updateStatus() {
    turnTextEl.textContent = current;
}

function handleMove(i) {
    if (gameOver || board[i]) return;
    history.push([...board]);

    board[i] = current;
    renderBoard();

    const winner = checkWinner(board);
    if (winner) {
    endGame(winner);
    return;
    }

    current = current === "X" ? "O" : "X";
    updateStatus();

    if (mode === "pvc" && current === "O") {
    setTimeout(cpuMove, 400);
    }
}

function cpuMove() {
    if (gameOver) return;
    const move = bestMove(board, "O");
    board[move] = "O";
    renderBoard();

    const winner = checkWinner(board);
    if (winner) {
    endGame(winner);
    return;
    }

    current = "X";
    updateStatus();
}

function endGame(winner) {
    gameOver = true;
    if (winner === "T") {
    statusEl.innerHTML = "¡Empate!";
    scores.T++;
    } else {
    statusEl.innerHTML = `Ganó: <strong>${winner}</strong>`;
    scores[winner]++;
    confetti();
    }
    updateScores();
}

function updateScores() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreTEl.textContent = scores.T;
}

function newRound() {
    board = Array(9).fill("");
    gameOver = false;
    current = startPlayer;
    history = [];
    renderBoard();
    updateStatus();
    statusEl.innerHTML = `Turno: <strong>${current}</strong>`;
}

function resetAll() {
    scores.X = scores.O = scores.T = 0;
    updateScores();
    newRound();
}

function undo() {
    if (history.length === 0 || gameOver) return;
    board = history.pop();
    renderBoard();
    current = current === "X" ? "O" : "X";
    updateStatus();
}

function hint() {
    if (gameOver) return;
    const move = bestMove(board, current);
    const cells = boardEl.querySelectorAll(".cell");
    cells[move].style.boxShadow = "0 0 16px 4px rgba(255,255,255,0.4)";
    setTimeout(() => {
    cells[move].style.boxShadow = "";
    }, 800);
}

function checkWinner(b) {
    const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
    ];

    for (const [a, c, d] of combos) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }

    return b.every((v) => v) ? "T" : null;
}

// --- Algoritmo MiniMax simplificado ---
function bestMove(b, player) {
    const opponent = player === "X" ? "O" : "X";
    let bestScore = -Infinity;
    let move;

    b.forEach((cell, i) => {
    if (!cell) {
        b[i] = player;
        const score = minimax(b, 0, false, player, opponent);
        b[i] = "";
        if (score > bestScore) {
        bestScore = score;
        move = i;
        }
    }
    });

    return move;
}

function minimax(b, depth, isMax, player, opponent) {
    const winner = checkWinner(b);
    if (winner === player) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (winner === "T") return 0;

    const current = isMax ? player : opponent;
    const scores = [];

    b.forEach((cell, i) => {
    if (!cell) {
        b[i] = current;
        const score = minimax(b, depth + 1, !isMax, player, opponent);
        b[i] = "";
        scores.push(score);
    }
    });

    return isMax ? Math.max(...scores) : Math.min(...scores);
}

// --- Confeti animado ---
function confetti() {
    for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.backgroundColor = randomColor();
    el.style.left = Math.random() * 100 + "%";
    el.style.animationDelay = Math.random() * 200 + "ms";
    celebrateEl.appendChild(el);
    setTimeout(() => el.remove(), 1300);
    }
}

function randomColor() {
    const colors = ["#ff6b6b", "#ffd166", "#6be3ff", "#9cff8b"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// --- Controles ---
btnPvP.addEventListener("click", () => {
    mode = "pvp";
    btnPvP.classList.add("primary");
    btnPvC.classList.remove("primary");
    newRound();
});

btnPvC.addEventListener("click", () => {
    mode = "pvc";
    btnPvC.classList.add("primary");
    btnPvP.classList.remove("primary");
    newRound();
});

btnStartX.addEventListener("click", () => {
    startPlayer = "X";
    btnStartX.classList.add("primary");
    btnStartO.classList.remove("primary");
    newRound();
});

btnStartO.addEventListener("click", () => {
    startPlayer = "O";
    btnStartO.classList.add("primary");
    btnStartX.classList.remove("primary");
    newRound();
    if (mode === "pvc") setTimeout(cpuMove, 300);
});

btnNewRound.addEventListener("click", newRound);
btnResetAll.addEventListener("click", resetAll);
btnUndo.addEventListener("click", undo);
btnHint.addEventListener("click", hint);

// --- Inicio ---
btnPvP.classList.add("primary");
btnStartX.classList.add("primary");
renderBoard();
updateStatus();
});
