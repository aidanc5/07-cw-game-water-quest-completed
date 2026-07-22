// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
const TIME_LIMIT = 30;       // Seconds allowed to play
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for the countdown timer
let timeLeft = TIME_LIMIT;  // Seconds remaining in the game
let currentDifficulty = 'medium';

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

function updateScoreDisplay() {
  document.getElementById('current-cans').textContent = currentCans;
}

function updateTimerDisplay() {
  document.getElementById('timer').textContent = timeLeft;
}

function updateAchievementMessage(message = '') {
  document.getElementById('achievements').textContent = message;
}

// Ensure the grid is created when the page loads
createGrid();

function getDifficultyConfig() {
  switch (currentDifficulty) {
    case 'easy':
      return { positiveCells: 1, negativeCells: 0 };
    case 'hard':
      return { positiveCells: 1, negativeCells: 8 };
    case 'medium':
    default:
      return { positiveCells: 1, negativeCells: 1 };
  }
}

// Spawns targets based on the selected difficulty
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');

  // Clear all cells before spawning new targets
  cells.forEach(cell => (cell.innerHTML = ''));

  const availableCells = Array.from(cells);
  const difficultyConfig = getDifficultyConfig();
  const positiveCell = availableCells[Math.floor(Math.random() * availableCells.length)];

  positiveCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can" role="button" tabindex="0" aria-label="Collect water can"></div>
    </div>
  `;

  if (difficultyConfig.negativeCells === 0) {
    return;
  }

  const otherCells = availableCells.filter(cell => cell !== positiveCell);

  if (difficultyConfig.negativeCells === 1) {
    const negativeCell = otherCells[Math.floor(Math.random() * otherCells.length)];
    negativeCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-droplet" role="button" tabindex="0" aria-label="Avoid bacteria"></div>
      </div>
    `;
    return;
  }

  otherCells.forEach(cell => {
    cell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-droplet" role="button" tabindex="0" aria-label="Avoid bacteria"></div>
      </div>
    `;
  });
}

function handleCanClick(event) {
  const target = event.target.closest('.water-can, .water-droplet');
  if (!target || !gameActive) return;

  const cell = target.closest('.grid-cell');
  if (cell) {
    cell.innerHTML = '';
  }

  if (target.classList.contains('water-can')) {
    currentCans += 1;
  } else {
    currentCans = Math.max(0, currentCans - 1);
  }

  updateScoreDisplay();

  if (currentCans >= GOAL_CANS) {
    endGame('Congratulations! Youve completed the goal!');
  }
}

function tickTimer() {
  timeLeft -= 1;
  updateTimerDisplay();

  if (timeLeft <= 0) {
    endGame('Time is up!');
  }
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  timeLeft = TIME_LIMIT;
  updateScoreDisplay();
  updateTimerDisplay();
  updateAchievementMessage('');
  createGrid(); // Set up the game grid
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(tickTimer, 1000); // Countdown the timer every second
}

function endGame(message = '') {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop the countdown timer

  if (message) {
    updateAchievementMessage(message);
  }
}

function resetGame() {
  endGame();
  currentCans = 0;
  timeLeft = TIME_LIMIT;
  updateScoreDisplay();
  updateTimerDisplay();
  updateAchievementMessage('');
  createGrid();
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
document.querySelector('.game-grid').addEventListener('click', handleCanClick);
document.getElementById('difficulty-select').addEventListener('change', (event) => {
  currentDifficulty = event.target.value;
});
