/* =========================
   GENERAL CONFIGURATION
========================= */

// Snake game theme settings
const snakeTheme = {
  dark: {
    bg: "#0b1220",
    border: "#00ffff",
    head: "#00ffff",
    body: "#cbd5e1",
    food: "#ff4757",
    text: "#00ffff",
    overlay: "rgba(0,0,0,0.7)",
    flash: "rgba(0,255,255,0.06)",
  },
  light: {
    bg: "#dbe1e8",
    border: "#1d4ed8",
    head: "#2563eb",
    body: "#1f2937",
    food: "#ef4444",
    text: "#1e3a8a",
    overlay: "rgba(203,213,225,0.9)",
    flash: "rgba(37,99,235,0.06)",
  },
}

// Current theme state
let currentSnakeTheme = document.documentElement.classList.contains("light")
  ? snakeTheme.light
  : snakeTheme.dark

// Particle colors
let particleColor = "rgba(0, 255, 255, 0.7)"
let targetParticleColor = particleColor

/* =========================
   PARTICLE SYSTEM
========================= */

// Mouse tracking
const mouse = {
  x: null,
  y: null,
  radius: 120,
}

// Update mouse position
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

// Particles canvas setup
const canvas = document.getElementById("particles")
const ctx = canvas.getContext("2d")

// Resize particles canvas
function resizeParticlesCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

// Initialize and add resize listener
resizeParticlesCanvas()
window.addEventListener("resize", resizeParticlesCanvas)

// Particles array
let particlesArray = []
const PARTICLE_COUNT = 100

// Particle class
class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() - 0.5
    this.speedY = Math.random() - 0.5
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x
      const dy = this.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < mouse.radius) {
        this.x += dx / 10
        this.y += dy / 10
      }
    }

    // Border wrap-around
    if (this.x < 0) this.x = canvas.width
    if (this.x > canvas.width) this.x = 0
    if (this.y < 0) this.y = canvas.height
    if (this.y > canvas.height) this.y = 0
  }

  draw() {
    ctx.fillStyle = particleColor
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Initialize particles
function initParticles() {
  particlesArray = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particlesArray.push(new Particle())
  }
}

// Particles animation loop
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particleColor = targetParticleColor

  particlesArray.forEach((p) => {
    p.update()
    p.draw()
  })

  requestAnimationFrame(animateParticles)
}

// Start particle system
initParticles()
animateParticles()

/* =========================
   THEME SYSTEM
========================= */

// Toggle theme function
function toggleMode() {
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  const switchIcon = document.querySelector(".switch-icon")
  const themeInfo = document.getElementById("theme-info")

  // Toggle class
  html.classList.toggle("light")

  // Apply light theme settings
  if (html.classList.contains("light")) {
    img.src = "./assets/avatar-light.png"
    targetParticleColor = "rgba(0, 0, 0, 0.4)"
    localStorage.setItem("theme", "light")
    if (switchIcon) switchIcon.textContent = "☀️"
    if (themeInfo) themeInfo.textContent = "Theme: Light"
  }
  // Apply dark theme settings
  else {
    img.src = "./assets/avatar.png"
    targetParticleColor = "rgba(0, 255, 255, 0.7)"
    localStorage.setItem("theme", "dark")
    if (switchIcon) switchIcon.textContent = "🌙"
    if (themeInfo) themeInfo.textContent = "Theme: Dark"
  }

  // Update snake game theme
  currentSnakeTheme = html.classList.contains("light")
    ? snakeTheme.light
    : snakeTheme.dark

  // Redraw game screen if necessary
  if (gameState === "idle") drawStartScreen()
  if (gameState === "gameover") endGame()
}

// Initialize saved theme
function initTheme() {
  const savedTheme = localStorage.getItem("theme")
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  const switchIcon = document.querySelector(".switch-icon")
  const themeInfo = document.getElementById("theme-info")

  if (savedTheme === "light") {
    html.classList.add("light")
    if (img) img.src = "./assets/avatar-light.png"
    targetParticleColor = "rgba(0, 0, 0, 0.4)"
    if (switchIcon) switchIcon.textContent = "☀️"
    if (themeInfo) themeInfo.textContent = "Theme: Light"
  } else {
    if (switchIcon) switchIcon.textContent = "🌙"
    if (themeInfo) themeInfo.textContent = "Theme: Dark"
  }

  currentSnakeTheme = html.classList.contains("light")
    ? snakeTheme.light
    : snakeTheme.dark
}

/* =========================
   SNAKE GAME
========================= */

// Game canvas setup
const gameCanvas = document.getElementById("snakeGame")
const gameCtx = gameCanvas.getContext("2d")

// Game constants
const GRID_SIZE = 20
const GAME_SPEED = 120
let box

// Resize game canvas
function resizeGameCanvas() {
  const container = document.querySelector("#container")
  const size = Math.min(container.clientWidth, 420)

  gameCanvas.width = size
  gameCanvas.height = size
  box = Math.floor(gameCanvas.width / GRID_SIZE)
}

// Resize listener
window.addEventListener("resize", resizeGameCanvas)
resizeGameCanvas()

// Game state
let snake = []
let direction = "RIGHT"
let nextDirection = "RIGHT"
let food
let score = 0
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0
let gameState = "idle" // "idle", "running", "paused", "gameover"
let gameLoop = null

// Visual effects
let flashTimer = 0
let foodPulse = 0
let foodRing = 0

// Generate food at random position
function generateFood() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE) * box,
    y: Math.floor(Math.random() * GRID_SIZE) * box,
  }
}

// Reset game
function resetGame(start = false) {
  // Reset snake state
  snake = [{ x: 9 * box, y: 9 * box }]
  direction = "RIGHT"
  nextDirection = "RIGHT"
  score = 0

  // Reset visual effects
  flashTimer = 0
  foodPulse = 0
  foodRing = 0

  // Update interface
  document.getElementById("score").textContent = score
  document.getElementById("highScore").textContent = highScore

  // Generate new food
  food = generateFood()

  // Clear previous loop
  clearInterval(gameLoop)

  // Start new game or show start screen
  if (start) {
    gameState = "running"
    gameLoop = setInterval(drawGame, GAME_SPEED)
  } else {
    gameState = "idle"
    drawStartScreen()
  }
}

// Draw start screen
function drawStartScreen() {
  // Background
  gameCtx.fillStyle = currentSnakeTheme.bg
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Border
  gameCtx.strokeStyle = currentSnakeTheme.border
  gameCtx.lineWidth = 2
  gameCtx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Text
  gameCtx.fillStyle = currentSnakeTheme.text
  gameCtx.font = "18px Inter"
  gameCtx.textAlign = "center"
  gameCtx.fillText(
    "Press ↑ ↓ ← →",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 10
  )

  gameCtx.font = "14px Inter"
  gameCtx.fillText("to start", gameCanvas.width / 2, gameCanvas.height / 2 + 15)
}

// Draw snake eyes
function drawSnakeEyes(head) {
  gameCtx.fillStyle = "#000"
  const eyeOffset = box * 0.2
  const eyeSize = box * 0.12

  let ex1 = head.x + eyeOffset
  let ex2 = head.x + box - eyeOffset
  let ey1 = head.y + eyeOffset
  let ey2 = head.y + box - eyeOffset

  // Adjust eye position based on direction
  if (direction === "UP" || direction === "DOWN") {
    ex1 = head.x + eyeOffset
    ex2 = head.x + box - eyeOffset
    ey1 = ey2 = head.y + box / 2
  }

  if (direction === "LEFT" || direction === "RIGHT") {
    ey1 = head.y + eyeOffset
    ey2 = head.y + box - eyeOffset
    ex1 = ex2 = head.x + box / 2
  }

  // Draw eyes
  gameCtx.beginPath()
  gameCtx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2)
  gameCtx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2)
  gameCtx.fill()
}

// Main game loop
function drawGame() {
  if (gameState !== "running") return

  // Update direction
  direction = nextDirection

  // Clear canvas
  gameCtx.fillStyle = currentSnakeTheme.bg
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Flash effect (when eating food)
  if (flashTimer > 0) {
    gameCtx.fillStyle = currentSnakeTheme.flash
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)
    flashTimer--
  }

  // Border
  gameCtx.strokeStyle = currentSnakeTheme.border
  gameCtx.lineWidth = 2
  gameCtx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Draw snake
  snake.forEach((segment, index) => {
    gameCtx.fillStyle =
      index === 0 ? currentSnakeTheme.head : currentSnakeTheme.body
    gameCtx.beginPath()
    gameCtx.roundRect(segment.x, segment.y, box, box, 4)
    gameCtx.fill()

    // Draw eyes only on head
    if (index === 0) drawSnakeEyes(segment)
  })

  // Draw food with pulse effect
  const pulse = foodPulse > 0 ? 1 + foodPulse * 0.04 : 1
  gameCtx.fillStyle = currentSnakeTheme.food
  gameCtx.beginPath()
  gameCtx.arc(
    food.x + box / 2,
    food.y + box / 2,
    (box / 2 - 2) * pulse,
    0,
    Math.PI * 2
  )
  gameCtx.fill()
  if (foodPulse > 0) foodPulse--

  // Effect ring around food
  if (foodRing > 0) {
    gameCtx.strokeStyle = currentSnakeTheme.food
    gameCtx.lineWidth = 2
    gameCtx.beginPath()
    gameCtx.arc(
      food.x + box / 2,
      food.y + box / 2,
      box / 2 + foodRing,
      0,
      Math.PI * 2
    )
    gameCtx.stroke()
    foodRing--
  }

  // Calculate new head position
  let headX = snake[0].x
  let headY = snake[0].y

  switch (direction) {
    case "UP":
      headY -= box
      break
    case "DOWN":
      headY += box
      break
    case "LEFT":
      headX -= box
      break
    case "RIGHT":
      headX += box
      break
  }

  // Check collisions
  const collision =
    headX < 0 ||
    headY < 0 ||
    headX >= gameCanvas.width ||
    headY >= gameCanvas.height ||
    snake.some((s) => s.x === headX && s.y === headY)

  if (collision) {
    endGame()
    return
  }

  // Add new head
  snake.unshift({ x: headX, y: headY })

  // Check if ate food
  if (headX === food.x && headY === food.y) {
    // Update score
    score++
    document.getElementById("score").textContent = score

    // Check high score
    if (score > highScore) {
      highScore = score
      localStorage.setItem("snakeHighScore", highScore)
      document.getElementById("highScore").textContent = highScore
    }

    // Generate new food
    food = generateFood()

    // Activate visual effects
    flashTimer = 4
    foodPulse = 6
    foodRing = 8

    // Particle effect
    particlesArray.forEach((p) => {
      p.speedX *= 1.4
      p.speedY *= 1.4
    })

    // Remove effect after 300ms
    setTimeout(() => {
      particlesArray.forEach((p) => {
        p.speedX *= 0.7
        p.speedY *= 0.7
      })
    }, 300)
  } else {
    // Remove tail if didn't eat
    snake.pop()
  }
}

// End game
function endGame() {
  clearInterval(gameLoop)
  gameState = "gameover"

  // Dark overlay
  gameCtx.fillStyle = currentSnakeTheme.overlay
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Game Over text
  gameCtx.fillStyle = currentSnakeTheme.text
  gameCtx.font = "20px Inter"
  gameCtx.textAlign = "center"
  gameCtx.fillText(
    "Game Over",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 10
  )

  gameCtx.font = "14px Inter"
  gameCtx.fillText(
    "Press ENTER",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 20
  )
}

/* =========================
   CONTROLS AND EVENT LISTENERS
========================= */

// Keyboard controls
document.addEventListener("keydown", (e) => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

  // Prevent default arrow key behavior
  if (keys.includes(e.key)) e.preventDefault()

  // Start screen → start game
  if (gameState === "idle" && keys.includes(e.key)) {
    resetGame(true)
    return
  }

  // Game Over → return to start screen
  if (gameState === "gameover" && e.key === "Enter") {
    resetGame(false)
    return
  }

  // Game running → change direction
  if (gameState !== "running") return

  if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP"
  if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN"
  if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT"
  if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT"
})

// DOMContentLoaded initialization
document.addEventListener("DOMContentLoaded", () => {
  // Restart button
  const restartBtn = document.getElementById("restart-game")
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      resetGame(false)
    })
  }

  // Pause/continue button
  const pauseBtn = document.getElementById("pause-game")
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (gameState === "running") {
        clearInterval(gameLoop)
        gameState = "paused"
        pauseBtn.textContent = "▶️ Continue"
        pauseBtn.setAttribute("aria-label", "Continue game")
      } else if (gameState === "paused") {
        gameState = "running"
        gameLoop = setInterval(drawGame, GAME_SPEED)
        pauseBtn.textContent = "⏸️ Pause"
        pauseBtn.setAttribute("aria-label", "Pause game")
      }
    })
  }

  // Mobile controls (visible arrows)
  document.querySelectorAll(".control-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (gameState === "idle") {
        resetGame(true)
        return
      }

      if (gameState !== "running") return

      const dir = btn.dataset.direction
      let key

      switch (dir) {
        case "up":
          key = "ArrowUp"
          break
        case "down":
          key = "ArrowDown"
          break
        case "left":
          key = "ArrowLeft"
          break
        case "right":
          key = "ArrowRight"
          break
      }

      // Trigger keyboard event
      const event = new KeyboardEvent("keydown", { key: key })
      document.dispatchEvent(event)
    })
  })

  // Theme button - DRAGGING ISSUE FIX
  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleMode)

    // PREVENT DRAGGING ON THEME BUTTON
    themeToggle.addEventListener("dragstart", (e) => {
      e.preventDefault()
      return false
    })

    themeToggle.addEventListener("mousedown", (e) => {
      e.stopPropagation()
    })

    themeToggle.addEventListener("touchstart", (e) => {
      e.stopPropagation()
    })

    // Inline styles to ensure
    themeToggle.style.userSelect = "none"
    themeToggle.style.webkitUserSelect = "none"
    themeToggle.style.msUserSelect = "none"
    themeToggle.style.mozUserSelect = "none"
    themeToggle.style.cursor = "pointer"
  }
})

/* =========================
   INITIALIZATION
========================= */

// Initialize theme
initTheme()

// Initialize game
resetGame()

// Ensure canvas doesn't interfere
window.addEventListener("load", () => {
  // Ensure particles canvas doesn't capture events
  const particlesCanvas = document.getElementById("particles")
  if (particlesCanvas) {
    particlesCanvas.style.pointerEvents = "none"
    particlesCanvas.style.zIndex = "-1"
  }

  // Ensure theme button stays on top
  const themeButton = document.getElementById("theme-toggle")
  if (themeButton) {
    themeButton.style.zIndex = "10000"
  }
})
