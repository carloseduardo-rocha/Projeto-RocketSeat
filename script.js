/* ===========================================
   GLOBAL CONFIGURATION & CONSTANTS
=========================================== */

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

// Which mini game is currently shown in the game selector
let activeGame = "snake"

/* ===========================================
   PARTICLE SYSTEM
=========================================== */

// Mouse tracking for particle interaction
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

// Resize particles canvas to fit window
function resizeParticlesCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

// Initialize and add resize listener
resizeParticlesCanvas()
window.addEventListener("resize", resizeParticlesCanvas)

// Particles array and count
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

    // Mouse interaction - particles react to mouse proximity
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x
      const dy = this.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < mouse.radius) {
        this.x += dx / 10
        this.y += dy / 10
      }
    }

    // Border wrap-around (infinite canvas effect)
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

// Initialize particles array
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

/* ===========================================
   THEME SYSTEM
=========================================== */

// Toggle theme function (wrapped in the View Transitions API when the
// browser supports it, for a smooth native cross-fade between themes)
function toggleMode() {
  if (document.startViewTransition) {
    document.startViewTransition(() => applyThemeToggle())
  } else {
    applyThemeToggle()
  }
}

function applyThemeToggle() {
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  const switchIcon = document.querySelector("#theme-toggle .switch-icon")
  const themeInfo = document.getElementById("theme-info")

  // Toggle light/dark class
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

// Initialize saved theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem("theme")
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  const switchIcon = document.querySelector("#theme-toggle .switch-icon")
  const themeInfo = document.getElementById("theme-info")

  if (savedTheme === "light") {
    html.classList.add("light")
    if (img) img.src = "./assets/avatar-light.png"
    targetParticleColor = "rgba(0, 0, 0, 0.4)"
    if (switchIcon) switchIcon.textContent = "☀️"
    if (themeInfo) themeInfo.textContent = "Theme: Light"
  } else {
    // Ensure dark mode is active
    html.classList.remove("light")
    if (switchIcon) switchIcon.textContent = "🌙"
    if (themeInfo) themeInfo.textContent = "Theme: Dark"
  }

  currentSnakeTheme = html.classList.contains("light")
    ? snakeTheme.light
    : snakeTheme.dark
}

/* ===========================================
   SNAKE GAME
=========================================== */

// Game canvas setup
const gameCanvas = document.getElementById("snakeGame")
const gameCtx = gameCanvas.getContext("2d")

// Game constants
const GRID_SIZE = 20
const GAME_SPEED = 100 // ms per logic step — rendering itself runs every
// animation frame and interpolates between steps, so movement stays buttery
// smooth even though the snake still advances one grid cell at a time
let box // Size of each grid cell

// Resize game canvas to fit container
function resizeGameCanvas() {
  const container = document.querySelector("#container")
  const size = Math.min(container.clientWidth, 420)

  gameCanvas.width = size
  gameCanvas.height = size
  box = Math.floor(gameCanvas.width / GRID_SIZE)
}

// Resize listener for responsive game
window.addEventListener("resize", resizeGameCanvas)
resizeGameCanvas()

// Game state variables
let snake = []
let prevSnake = [] // segment positions before the last logic step (for interpolation)
let direction = "RIGHT"
let nextDirection = "RIGHT"
let food
let score = 0
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0
let gameState = "idle" // "idle", "running", "paused", "gameover"
let animFrameId = null
let moveAccumulator = 0
let lastFrameTime = 0

// Visual effects variables
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

// Starts/stops the requestAnimationFrame render loop (replaces setInterval)
function startGameLoop() {
  cancelAnimationFrame(animFrameId)
  moveAccumulator = 0
  lastFrameTime = performance.now()
  animFrameId = requestAnimationFrame(gameLoopFrame)
}

function stopGameLoop() {
  cancelAnimationFrame(animFrameId)
  animFrameId = null
}

// Reset game to initial state
function resetGame(start = false) {
  // Reset snake state
  snake = [{ x: 9 * box, y: 9 * box }]
  prevSnake = [{ x: 9 * box, y: 9 * box }]
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

  stopGameLoop()

  // Start new game or show start screen
  if (start) {
    gameState = "running"
    startGameLoop()
  } else {
    gameState = "idle"
    drawStartScreen()
  }
}

// Draw start screen with instructions
function drawStartScreen() {
  // Background
  gameCtx.fillStyle = currentSnakeTheme.bg
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Border
  gameCtx.strokeStyle = currentSnakeTheme.border
  gameCtx.lineWidth = 2
  gameCtx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Instructions text
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

// Draw snake eyes (visual detail)
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

// One discrete logic step: advances the snake exactly one grid cell.
// Runs on a fixed cadence (GAME_SPEED) regardless of display refresh rate.
function stepGame() {
  direction = nextDirection
  prevSnake = snake.map((s) => ({ ...s }))

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

  // Check collisions (walls or self)
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

    // Check and update high score
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

    // Particle effect (speed boost)
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

  // Effect timers tick once per logic step, not per render frame
  if (flashTimer > 0) flashTimer--
  if (foodPulse > 0) foodPulse--
  if (foodRing > 0) foodRing--
}

// Draws one frame. t (0→1) interpolates every segment between where it was
// (prevSnake) and where it just moved to (snake), so the snake glides
// smoothly at the display's refresh rate instead of jumping cell to cell.
function renderGame(t) {
  // Clear canvas
  gameCtx.fillStyle = currentSnakeTheme.bg
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Flash effect (when eating food)
  if (flashTimer > 0) {
    gameCtx.fillStyle = currentSnakeTheme.flash
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)
  }

  // Border
  gameCtx.strokeStyle = currentSnakeTheme.border
  gameCtx.lineWidth = 2
  gameCtx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Draw snake, each segment sliding from its previous cell to its new one
  snake.forEach((segment, index) => {
    const prev = prevSnake[index] || segment
    const x = prev.x + (segment.x - prev.x) * t
    const y = prev.y + (segment.y - prev.y) * t

    gameCtx.fillStyle =
      index === 0 ? currentSnakeTheme.head : currentSnakeTheme.body
    gameCtx.beginPath()
    gameCtx.roundRect(x, y, box, box, 4)
    gameCtx.fill()

    // Draw eyes only on head
    if (index === 0) drawSnakeEyes({ x, y })
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
  }
}

// requestAnimationFrame loop: advances logic on a fixed cadence (catching up
// with a while-loop if a frame was dropped), then renders once per frame
function gameLoopFrame(now) {
  if (gameState !== "running") {
    animFrameId = null
    return
  }

  const delta = now - lastFrameTime
  lastFrameTime = now
  moveAccumulator += delta

  while (moveAccumulator >= GAME_SPEED) {
    moveAccumulator -= GAME_SPEED
    stepGame()
    if (gameState !== "running") break
  }

  if (gameState === "running") {
    renderGame(Math.min(moveAccumulator / GAME_SPEED, 1))
    animFrameId = requestAnimationFrame(gameLoopFrame)
  }
}

// End game and show game over screen
function endGame() {
  stopGameLoop()
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

/* ===========================================
   ACHIEVEMENTS CAROUSEL
=========================================== */

const ACHIEVEMENT_CATEGORY_LABELS = {
  formacao: { emoji: "🎓", label: "Formação Acadêmica" },
  certificado: { emoji: "📜", label: "Certificados" },
}

// Só os primeiros ACHIEVEMENTS_VISIBLE de cada grupo aparecem de cara; o resto
// fica atrás de um "Ver mais".
const ACHIEVEMENTS_VISIBLE = 3

// ORDEM (importa — é a ordem em que aparecem):
//   1. "formacao" primeiro, depois "certificado".
//   2. Dentro de "certificado", do mais forte/relevante pro mais simples:
//      relevância pro trampo atual (backend / infra / IA) → profundidade do
//      curso (carga horária) → quão recente é.
//   Ao adicionar um certificado novo, encaixa nesse critério (não é só data).
const ACHIEVEMENTS = [
  {
    category: "formacao",
    icon: "🎓",
    title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
    issuer: "SENAC · Concluído jul/2025",
    description: "Formação superior completa, colação de grau em set/2025.",
    pdf: "./assets/certificados/diploma-ads-senac.pdf",
  },
  {
    category: "formacao",
    icon: "🎓",
    title: "Pós-graduação em Perícia Digital e Computação Forense",
    issuer: "Unopar (EAD) · Em andamento · dez/2025 a out/2026",
    description: "Cursando — conclusão prevista para outubro de 2026.",
    pdf: null,
  },
  {
    category: "certificado",
    icon: "🐳",
    title: "Docker — Completo do Zero ao Avançado",
    issuer: "Udemy (André Iacono) · Ago 2026 · 5,5h",
    description: "Containers, imagens, volumes, redes e Compose — base do deploy multi-tenant do GestãoCheck (Docker + Traefik).",
    pdf: "./assets/certificados/docker-zero-avancado-udemy.pdf",
  },
  {
    category: "certificado",
    icon: "☕",
    title: "Java COMPLETO — POO + Projetos",
    issuer: "Udemy (Nelio Alves) · Jan 2026 · 54h",
    description: "Programação orientada a objetos em Java — base do Chess System.",
    pdf: "./assets/certificados/java-completo-udemy.pdf",
  },
  {
    category: "certificado",
    icon: "🚀",
    title: "Discover",
    issuer: "Rocketseat · Abr 2025 · 12h",
    description: "Fundamentos de programação web: HTML, CSS, JavaScript, Git e GitHub.",
    pdf: "./assets/certificados/discover-rocketseat.pdf",
  },
  {
    category: "certificado",
    icon: "🤖",
    title: "Imersão Dev Agentes de IA",
    issuer: "Alura + Google · Set 2025 · 5h",
    description: "Construção de agentes com LLMs, tool calling e RAG — base do projeto AI Agent de service desk.",
    pdf: "./assets/certificados/imersao-agentes-ia-alura.pdf",
  },
  {
    category: "certificado",
    icon: "🧠",
    title: "Introdução à IA — Inteligência Artificial na Prática",
    issuer: "SENAC · 10 a 13 de dez/2024",
    description: "Fundamentos de inteligência artificial aplicada.",
    pdf: "./assets/certificados/introducao-ia-senac.pdf",
  },
  {
    category: "certificado",
    icon: "🔧",
    title: "Curso para Certificação ISO/IEC 20000 Foundation",
    issuer: "Udemy (Alex Villaverde) · Ago 2025 · 6.5h",
    description: "Fundamentos de gestão de serviços de TI.",
    pdf: "./assets/certificados/iso20000-udemy.pdf",
  },
]

// Renders the achievements as sectioned responsive grids (no carousel).
// A certificate card is itself the button — clicking it opens the PDF in the
// in-page viewer (see initCertModal), no new tab.
function initAchievements() {
  const host = document.getElementById("achievements-groups")
  if (!host) return

  // Group entries by category, preserving first-seen order
  const groups = []
  ACHIEVEMENTS.forEach((a) => {
    let g = groups.find((x) => x.category === a.category)
    if (!g) {
      g = { category: a.category, items: [] }
      groups.push(g)
    }
    g.items.push(a)
  })

  host.innerHTML = groups
    .map((g, gi) => {
      const meta = ACHIEVEMENT_CATEGORY_LABELS[g.category] || {
        emoji: "•",
        label: g.category,
      }

      const visible = g.items.slice(0, ACHIEVEMENTS_VISIBLE)
      const hidden = g.items.slice(ACHIEVEMENTS_VISIBLE)

      const visibleCards = visible.map(renderAchievementCard).join("")
      let extra = ""
      if (hidden.length) {
        const moreId = `achievement-more-${gi}`
        extra = `
          <div class="achievement-more" id="${moreId}">
            <div class="achievement-more-inner achievement-grid">
              ${hidden.map(renderAchievementCard).join("")}
            </div>
          </div>
          <button type="button" class="achievement-more-toggle" aria-expanded="false" aria-controls="${moreId}">
            <span class="achievement-more-label">Ver mais ${hidden.length}</span>
            <span class="achievement-less-label">Ver menos</span>
            <span class="achievement-more-chevron" aria-hidden="true">⌄</span>
          </button>
        `
      }

      return `
        <div class="achievement-group">
          <h3 class="achievement-group-title">
            <span class="achievement-group-emoji" aria-hidden="true">${meta.emoji}</span>
            ${meta.label}
            <span class="achievement-group-count">${g.items.length}</span>
          </h3>
          <div class="achievement-grid">${visibleCards}</div>
          ${extra}
        </div>
      `
    })
    .join("")

  // "Ver mais" toggles per group
  host.querySelectorAll(".achievement-more-toggle").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"))
    if (panel) makeCollapsible(panel, btn)
  })
}

// Smooth expand/collapse driven by the measured pixel height, so it animates
// at the real content speed instead of the laggy "empty travel" you get from
// a guessed max-height ceiling. Used by "Ver mais" and the case-study "Ler mais".
function makeCollapsible(panel, btn) {
  btn.addEventListener("click", () => {
    const willOpen = !panel.classList.contains("open")
    btn.setAttribute("aria-expanded", String(willOpen))

    if (willOpen) {
      panel.classList.add("open")
      panel.style.maxHeight = panel.scrollHeight + "px"
      panel.addEventListener(
        "transitionend",
        function done() {
          // let it grow/shrink freely once open (e.g. on window resize)
          if (panel.classList.contains("open")) panel.style.maxHeight = "none"
          panel.removeEventListener("transitionend", done)
        },
        { once: true }
      )
    } else {
      // from "none" → current px → 0, with a forced reflow in between
      panel.style.maxHeight = panel.scrollHeight + "px"
      void panel.offsetHeight
      panel.classList.remove("open")
      panel.style.maxHeight = "0px"
    }
  })
}

function renderAchievementCard(a) {
  const footer = a.pdf
    ? `<span class="achievement-link"><span class="achievement-link-icon" aria-hidden="true">👁️</span> Ver certificado</span>`
    : `<span class="achievement-link achievement-link-pending">⏳ Em andamento</span>`

  return `
    <${a.pdf ? "button type=\"button\"" : "div"} class="achievement-card${
      a.pdf ? " has-pdf" : ""
    }"${
      a.pdf
        ? ` data-cert-pdf="${a.pdf}" data-cert-title="${a.title}" aria-label="Ver certificado: ${a.title}"`
        : ""
    }>
      <div class="achievement-badge">
        <span class="achievement-icon" aria-hidden="true">${a.icon}</span>
      </div>
      <h4>${a.title}</h4>
      <p class="achievement-issuer">${a.issuer}</p>
      <p class="achievement-desc">${a.description}</p>
      ${footer}
    </${a.pdf ? "button" : "div"}>
  `
}

/* ===========================================
   GAME SELECTOR (Steam/Xbox-style tile picker)
=========================================== */

// Switches which mini game panel is visible, pausing the one being left
function initGameSelector() {
  const tiles = document.querySelectorAll(".game-tile")
  const panels = document.querySelectorAll(".game-panel")
  if (!tiles.length) return

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const target = tile.dataset.game
      if (target === activeGame) return

      // Leaving Snake mid-run: pause it instead of letting it keep going hidden
      if (activeGame === "snake" && gameState === "running") {
        stopGameLoop()
        gameState = "paused"
        const pauseBtn = document.getElementById("pause-game")
        if (pauseBtn) {
          pauseBtn.textContent = "▶️ Continue"
          pauseBtn.setAttribute("aria-label", "Continue game")
        }
      }
      if (activeGame === "pong") stopPong()
      if (activeGame === "flappy") stopFlappy()

      activeGame = target

      tiles.forEach((t) => {
        const isActive = t === tile
        t.classList.toggle("active", isActive)
        t.setAttribute("aria-selected", String(isActive))
      })

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.gamePanel !== target
      })

      if (target === "pong") startPong()
      if (target === "flappy") startFlappy()
    })
  })
}

/* ===========================================
   TIC-TAC-TOE
=========================================== */

let tttBoard = Array(9).fill(null)
let tttGameOver = false
let tttMode = "cpu" // "cpu" | "friend" (2 players, same device)
let tttCurrentPlayer = "X"

const TTT_WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function tttCheckResult(board) {
  for (const line of TTT_WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  if (board.every((cell) => cell)) return { winner: "draw", line: null }
  return null
}

// Simple heuristic CPU: win if possible, block if needed, else center/corner/random
function tttCpuMove(board) {
  const empty = board
    .map((value, index) => (value === null ? index : null))
    .filter((index) => index !== null)

  for (const index of empty) {
    const copy = [...board]
    copy[index] = "O"
    if (tttCheckResult(copy)?.winner === "O") return index
  }

  for (const index of empty) {
    const copy = [...board]
    copy[index] = "X"
    if (tttCheckResult(copy)?.winner === "X") return index
  }

  if (board[4] === null) return 4

  const corners = [0, 2, 6, 8].filter((index) => board[index] === null)
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)]
  }

  return empty[Math.floor(Math.random() * empty.length)]
}

function tttRender() {
  const cells = document.querySelectorAll(".ttt-cell")
  const result = tttCheckResult(tttBoard)

  cells.forEach((cell, index) => {
    cell.textContent = tttBoard[index] || ""
    cell.disabled = !!tttBoard[index] || tttGameOver
    cell.classList.toggle(
      "win",
      !!(result && result.line && result.line.includes(index))
    )
  })

  const statusEl = document.getElementById("ttt-status")
  if (!statusEl) return

  if (result) {
    tttGameOver = true
    if (result.winner === "draw") statusEl.textContent = "Empate!"
    else if (tttMode === "friend") statusEl.textContent = `${result.winner} venceu!`
    else statusEl.textContent = result.winner === "X" ? "Você venceu!" : "CPU venceu!"
  } else if (tttMode === "friend") {
    statusEl.textContent = `Vez de ${tttCurrentPlayer}`
  } else {
    statusEl.textContent = "Sua vez"
  }
}

function tttReset() {
  tttBoard = Array(9).fill(null)
  tttGameOver = false
  tttCurrentPlayer = "X"
  tttRender()
}

function tttHandleMove(index) {
  if (tttGameOver || tttBoard[index]) return

  // vs CPU: player is always X. vs Friend: X and O take turns locally
  tttBoard[index] = tttMode === "friend" ? tttCurrentPlayer : "X"
  const result = tttCheckResult(tttBoard)
  tttRender()
  if (result) return

  if (tttMode === "friend") {
    tttCurrentPlayer = tttCurrentPlayer === "X" ? "O" : "X"
    tttRender()
    return
  }

  // Small delay before the CPU replies, feels more natural than instant
  setTimeout(() => {
    const cpuIndex = tttCpuMove(tttBoard)
    if (cpuIndex === undefined || tttBoard[cpuIndex]) return
    tttBoard[cpuIndex] = "O"
    tttRender()
  }, 400)
}

function tttToggleMode() {
  tttMode = tttMode === "cpu" ? "friend" : "cpu"

  const modeBtn = document.getElementById("ttt-mode-toggle")
  if (modeBtn) modeBtn.textContent = tttMode === "cpu" ? "🤖 vs CPU" : "👥 vs Amigo"

  const instructions = document.getElementById("ttt-instructions")
  if (instructions) {
    instructions.innerHTML =
      tttMode === "cpu"
        ? "Você é <strong>X</strong>, o computador é <strong>O</strong>."
        : "2 jogadores no mesmo aparelho — <strong>X</strong> começa."
  }

  tttReset()
}

function initTicTacToe() {
  const board = document.getElementById("ttt-board")
  if (!board) return

  board.querySelectorAll(".ttt-cell").forEach((cell) => {
    cell.addEventListener("click", () =>
      tttHandleMove(Number(cell.dataset.cell))
    )
  })

  const restartBtn = document.getElementById("restart-ttt")
  if (restartBtn) restartBtn.addEventListener("click", tttReset)

  const modeBtn = document.getElementById("ttt-mode-toggle")
  if (modeBtn) modeBtn.addEventListener("click", tttToggleMode)

  tttRender()
}

/* ===========================================
   PONG
=========================================== */

const pongCanvas = document.getElementById("pongGame")
const pongCtx = pongCanvas ? pongCanvas.getContext("2d") : null

const PONG_PADDLE_WIDTH = 10
const PONG_PADDLE_HEIGHT = 60
const PONG_BALL_SIZE = 8

const pongState = {
  playerY: 0,
  cpuY: 0,
  ballX: 0,
  ballY: 0,
  ballSpeedX: 3.5,
  ballSpeedY: 3.5,
  playerScore: 0,
  cpuScore: 0,
  running: false,
  loopId: null,
}

let pongPlayerDirection = 0 // -1 up, 1 down, 0 still (keyboard/touch buttons)
let pongPlayerTargetY = null // mouse-follow target

function resizePongCanvas() {
  if (!pongCanvas) return
  const container = pongCanvas.closest(".game-container")
  const size = Math.min(container ? container.clientWidth : 400, 420)
  pongCanvas.width = size
  pongCanvas.height = size
}

function pongResetBall() {
  pongState.ballX = pongCanvas.width / 2
  pongState.ballY = pongCanvas.height / 2
  const verticalFactor = Math.random() * 0.6 - 0.3
  const direction = Math.random() < 0.5 ? 1 : -1
  pongState.ballSpeedX = 3.5 * direction
  pongState.ballSpeedY = 3.5 * verticalFactor
}

function pongUpdateScoreUI() {
  const playerEl = document.getElementById("pong-score-player")
  const cpuEl = document.getElementById("pong-score-cpu")
  if (playerEl) playerEl.textContent = pongState.playerScore
  if (cpuEl) cpuEl.textContent = pongState.cpuScore
}

function pongReset() {
  if (!pongCanvas) return
  pongState.playerY = pongCanvas.height / 2 - PONG_PADDLE_HEIGHT / 2
  pongState.cpuY = pongCanvas.height / 2 - PONG_PADDLE_HEIGHT / 2
  pongState.playerScore = 0
  pongState.cpuScore = 0
  pongResetBall()
  pongUpdateScoreUI()
  pongDraw()
}

function pongDraw() {
  if (!pongCtx) return

  pongCtx.fillStyle = currentSnakeTheme.bg
  pongCtx.fillRect(0, 0, pongCanvas.width, pongCanvas.height)

  // Center dashed line
  pongCtx.strokeStyle = currentSnakeTheme.border
  pongCtx.setLineDash([6, 8])
  pongCtx.beginPath()
  pongCtx.moveTo(pongCanvas.width / 2, 0)
  pongCtx.lineTo(pongCanvas.width / 2, pongCanvas.height)
  pongCtx.stroke()
  pongCtx.setLineDash([])

  // Border
  pongCtx.lineWidth = 2
  pongCtx.strokeRect(0, 0, pongCanvas.width, pongCanvas.height)

  // Paddles
  pongCtx.fillStyle = currentSnakeTheme.head
  pongCtx.fillRect(10, pongState.playerY, PONG_PADDLE_WIDTH, PONG_PADDLE_HEIGHT)
  pongCtx.fillRect(
    pongCanvas.width - 20,
    pongState.cpuY,
    PONG_PADDLE_WIDTH,
    PONG_PADDLE_HEIGHT
  )

  // Ball
  pongCtx.fillStyle = currentSnakeTheme.food
  pongCtx.beginPath()
  pongCtx.arc(pongState.ballX, pongState.ballY, PONG_BALL_SIZE, 0, Math.PI * 2)
  pongCtx.fill()
}

function pongUpdate() {
  const height = pongCanvas.height
  const speed = 5

  // Player paddle: keyboard/touch direction takes priority over mouse-follow
  if (pongPlayerDirection !== 0) {
    pongState.playerY += pongPlayerDirection * speed
  } else if (pongPlayerTargetY !== null) {
    const diff = pongPlayerTargetY - (pongState.playerY + PONG_PADDLE_HEIGHT / 2)
    pongState.playerY += Math.sign(diff) * Math.min(Math.abs(diff), speed)
  }
  pongState.playerY = Math.max(
    0,
    Math.min(height - PONG_PADDLE_HEIGHT, pongState.playerY)
  )

  // CPU paddle follows the ball with a capped reaction speed (not perfect)
  const cpuCenter = pongState.cpuY + PONG_PADDLE_HEIGHT / 2
  const cpuDiff = pongState.ballY - cpuCenter
  pongState.cpuY += Math.sign(cpuDiff) * Math.min(Math.abs(cpuDiff), 3.2)
  pongState.cpuY = Math.max(
    0,
    Math.min(height - PONG_PADDLE_HEIGHT, pongState.cpuY)
  )

  // Ball movement
  pongState.ballX += pongState.ballSpeedX
  pongState.ballY += pongState.ballSpeedY

  // Bounce off top/bottom walls
  if (
    pongState.ballY <= PONG_BALL_SIZE ||
    pongState.ballY >= pongCanvas.height - PONG_BALL_SIZE
  ) {
    pongState.ballSpeedY *= -1
  }

  // Player paddle collision
  if (
    pongState.ballX - PONG_BALL_SIZE <= 10 + PONG_PADDLE_WIDTH &&
    pongState.ballY >= pongState.playerY &&
    pongState.ballY <= pongState.playerY + PONG_PADDLE_HEIGHT &&
    pongState.ballSpeedX < 0
  ) {
    pongState.ballSpeedX *= -1.05
    const hitPos = (pongState.ballY - pongState.playerY) / PONG_PADDLE_HEIGHT - 0.5
    pongState.ballSpeedY = hitPos * 6
  }

  // CPU paddle collision
  const cpuX = pongCanvas.width - 20
  if (
    pongState.ballX + PONG_BALL_SIZE >= cpuX &&
    pongState.ballY >= pongState.cpuY &&
    pongState.ballY <= pongState.cpuY + PONG_PADDLE_HEIGHT &&
    pongState.ballSpeedX > 0
  ) {
    pongState.ballSpeedX *= -1.05
    const hitPos = (pongState.ballY - pongState.cpuY) / PONG_PADDLE_HEIGHT - 0.5
    pongState.ballSpeedY = hitPos * 6
  }

  // Scoring
  if (pongState.ballX < 0) {
    pongState.cpuScore++
    pongUpdateScoreUI()
    pongResetBall()
  } else if (pongState.ballX > pongCanvas.width) {
    pongState.playerScore++
    pongUpdateScoreUI()
    pongResetBall()
  }
}

function pongLoop() {
  if (!pongState.running) return
  pongUpdate()
  pongDraw()
  pongState.loopId = requestAnimationFrame(pongLoop)
}

function startPong() {
  if (!pongCanvas || pongState.running) return

  // The panel is `hidden` (display: none) until first opened, so the
  // initial resize measured a 0-width container — fix that up now, once,
  // without resetting an in-progress game on every pause/resume
  if (!pongCanvas.width) {
    resizePongCanvas()
    pongReset()
  }

  pongState.running = true
  pongLoop()
}

function stopPong() {
  pongState.running = false
  if (pongState.loopId) cancelAnimationFrame(pongState.loopId)
}

function initPong() {
  if (!pongCanvas) return

  resizePongCanvas()
  window.addEventListener("resize", () => {
    resizePongCanvas()
    pongDraw()
  })
  pongReset()

  document.addEventListener("keydown", (e) => {
    if (activeGame !== "pong") return
    if (e.key === "ArrowUp") {
      e.preventDefault()
      pongPlayerDirection = -1
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      pongPlayerDirection = 1
    }
  })

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" && pongPlayerDirection === -1) pongPlayerDirection = 0
    if (e.key === "ArrowDown" && pongPlayerDirection === 1) pongPlayerDirection = 0
  })

  pongCanvas.addEventListener("mousemove", (e) => {
    const rect = pongCanvas.getBoundingClientRect()
    pongPlayerTargetY = ((e.clientY - rect.top) / rect.height) * pongCanvas.height
  })

  const restartBtn = document.getElementById("restart-pong")
  if (restartBtn) restartBtn.addEventListener("click", pongReset)

  const pauseBtn = document.getElementById("pause-pong")
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (pongState.running) {
        stopPong()
        pauseBtn.textContent = "▶️ Continue"
      } else {
        startPong()
        pauseBtn.textContent = "⏸️ Pause"
      }
    })
  }

  document.querySelectorAll("[data-pong-direction]").forEach((btn) => {
    const dir = btn.dataset.pongDirection === "up" ? -1 : 1
    btn.addEventListener("mousedown", () => {
      pongPlayerDirection = dir
    })
    btn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault()
        pongPlayerDirection = dir
      },
      { passive: false }
    )
    btn.addEventListener("mouseup", () => {
      pongPlayerDirection = 0
    })
    btn.addEventListener("mouseleave", () => {
      pongPlayerDirection = 0
    })
    btn.addEventListener("touchend", () => {
      pongPlayerDirection = 0
    })
  })
}

/* ===========================================
   FLAPPY
=========================================== */

const flappyCanvas = document.getElementById("flappyGame")
const flappyCtx = flappyCanvas ? flappyCanvas.getContext("2d") : null

const FLAPPY_GRAVITY = 0.45
const FLAPPY_FLAP = -7.2
const FLAPPY_PIPE_W = 52
const FLAPPY_GAP = 140
const FLAPPY_SPEED = 2.4
const FLAPPY_BIRD_R = 12
const FLAPPY_SPAWN_GAP = 190 // px of travel between pipes

const flappyState = {
  birdY: 0,
  birdV: 0,
  pipes: [],
  score: 0,
  best: Number(localStorage.getItem("flappyBest")) || 0,
  phase: "idle", // "idle" | "running" | "over"
  running: false, // rAF loop alive
  loopId: null,
  spawnTimer: 0,
}

function resizeFlappyCanvas() {
  if (!flappyCanvas) return
  const container = flappyCanvas.closest(".game-container")
  const cw = container ? container.clientWidth : 400
  const size = Math.min(cw || 400, 420)
  flappyCanvas.width = size
  flappyCanvas.height = size
}

function flappyUpdateScoreUI() {
  const s = document.getElementById("flappy-score")
  const b = document.getElementById("flappy-best")
  if (s) s.textContent = flappyState.score
  if (b) b.textContent = flappyState.best
}

function flappyReset() {
  if (!flappyCanvas) return
  flappyState.birdY = flappyCanvas.height / 2
  flappyState.birdV = 0
  flappyState.pipes = []
  flappyState.score = 0
  flappyState.spawnTimer = FLAPPY_SPAWN_GAP
  flappyState.phase = "idle"
  flappyUpdateScoreUI()
  flappyDraw()
}

function flappySpawnPipe() {
  const margin = 50
  const gapY =
    margin + Math.random() * (flappyCanvas.height - FLAPPY_GAP - margin * 2)
  flappyState.pipes.push({ x: flappyCanvas.width, gapY, passed: false })
}

// One flap — also doubles as "start" from idle and "retry" from game over
function flappyFlap() {
  if (activeGame !== "flappy" || !flappyState.running) return
  if (flappyState.phase === "over") flappyReset()
  flappyState.phase = "running"
  flappyState.birdV = FLAPPY_FLAP
}

function flappyGameOver() {
  flappyState.phase = "over"
  if (flappyState.score > flappyState.best) {
    flappyState.best = flappyState.score
    localStorage.setItem("flappyBest", flappyState.best)
  }
  flappyUpdateScoreUI()
}

function flappyUpdate() {
  if (flappyState.phase !== "running") return

  const h = flappyCanvas.height
  const w = flappyCanvas.width
  const birdX = w * 0.28

  flappyState.birdV += FLAPPY_GRAVITY
  flappyState.birdY += flappyState.birdV

  if (flappyState.birdY < FLAPPY_BIRD_R) {
    flappyState.birdY = FLAPPY_BIRD_R
    flappyState.birdV = 0
  }
  if (flappyState.birdY > h - FLAPPY_BIRD_R) {
    flappyState.birdY = h - FLAPPY_BIRD_R
    flappyGameOver()
    return
  }

  flappyState.spawnTimer -= FLAPPY_SPEED
  if (flappyState.spawnTimer <= 0) {
    flappySpawnPipe()
    flappyState.spawnTimer = FLAPPY_SPAWN_GAP
  }

  flappyState.pipes.forEach((p) => {
    p.x -= FLAPPY_SPEED

    if (!p.passed && p.x + FLAPPY_PIPE_W < birdX) {
      p.passed = true
      flappyState.score++
      flappyUpdateScoreUI()
    }

    const withinX =
      birdX + FLAPPY_BIRD_R > p.x && birdX - FLAPPY_BIRD_R < p.x + FLAPPY_PIPE_W
    const throughGap =
      flappyState.birdY - FLAPPY_BIRD_R > p.gapY &&
      flappyState.birdY + FLAPPY_BIRD_R < p.gapY + FLAPPY_GAP
    if (withinX && !throughGap) flappyGameOver()
  })

  flappyState.pipes = flappyState.pipes.filter((p) => p.x + FLAPPY_PIPE_W > -10)
}

function flappyDraw() {
  if (!flappyCtx) return
  const w = flappyCanvas.width
  const h = flappyCanvas.height
  const theme = currentSnakeTheme

  flappyCtx.fillStyle = theme.bg
  flappyCtx.fillRect(0, 0, w, h)

  flappyState.pipes.forEach((p) => {
    flappyCtx.fillStyle = theme.head
    flappyCtx.fillRect(p.x, 0, FLAPPY_PIPE_W, p.gapY)
    flappyCtx.fillRect(p.x, p.gapY + FLAPPY_GAP, FLAPPY_PIPE_W, h - (p.gapY + FLAPPY_GAP))
    flappyCtx.fillStyle = theme.border
    flappyCtx.fillRect(p.x - 3, p.gapY - 10, FLAPPY_PIPE_W + 6, 10)
    flappyCtx.fillRect(p.x - 3, p.gapY + FLAPPY_GAP, FLAPPY_PIPE_W + 6, 10)
  })

  // Bird
  const birdX = w * 0.28
  flappyCtx.save()
  flappyCtx.translate(birdX, flappyState.birdY)
  flappyCtx.rotate(Math.max(-0.5, Math.min(1.1, flappyState.birdV / 12)))
  flappyCtx.fillStyle = theme.food
  flappyCtx.beginPath()
  flappyCtx.arc(0, 0, FLAPPY_BIRD_R, 0, Math.PI * 2)
  flappyCtx.fill()
  flappyCtx.fillStyle = "#fff"
  flappyCtx.beginPath()
  flappyCtx.arc(FLAPPY_BIRD_R * 0.35, -FLAPPY_BIRD_R * 0.3, 3.2, 0, Math.PI * 2)
  flappyCtx.fill()
  flappyCtx.fillStyle = "#000"
  flappyCtx.beginPath()
  flappyCtx.arc(FLAPPY_BIRD_R * 0.5, -FLAPPY_BIRD_R * 0.3, 1.5, 0, Math.PI * 2)
  flappyCtx.fill()
  flappyCtx.restore()

  flappyCtx.strokeStyle = theme.border
  flappyCtx.lineWidth = 2
  flappyCtx.strokeRect(0, 0, w, h)

  flappyCtx.fillStyle = theme.text
  flappyCtx.textAlign = "center"
  if (flappyState.phase === "running") {
    flappyCtx.font = "bold 34px Inter"
    flappyCtx.fillText(flappyState.score, w / 2, 54)
  } else if (flappyState.phase === "idle") {
    flappyCtx.font = "16px Inter"
    flappyCtx.fillText("Toque / espaço pra voar", w / 2, h / 2 - 34)
  } else {
    flappyCtx.font = "bold 24px Inter"
    flappyCtx.fillText("Game Over", w / 2, h / 2 - 12)
    flappyCtx.font = "14px Inter"
    flappyCtx.fillText("Toque pra jogar de novo", w / 2, h / 2 + 14)
  }
}

function flappyLoop() {
  if (!flappyState.running) return
  flappyUpdate()
  flappyDraw()
  flappyState.loopId = requestAnimationFrame(flappyLoop)
}

function startFlappy() {
  if (!flappyCanvas || flappyState.running) return
  resizeFlappyCanvas()
  flappyState.running = true
  flappyReset()
  flappyLoop()
}

function stopFlappy() {
  flappyState.running = false
  if (flappyState.loopId) cancelAnimationFrame(flappyState.loopId)
}

function initFlappy() {
  if (!flappyCanvas) return

  resizeFlappyCanvas()
  window.addEventListener("resize", () => {
    resizeFlappyCanvas()
    if (!flappyState.running) flappyReset()
  })
  flappyReset()

  const flap = (e) => {
    if (activeGame !== "flappy") return
    e.preventDefault()
    flappyFlap()
  }
  flappyCanvas.addEventListener("mousedown", flap)
  flappyCanvas.addEventListener("touchstart", flap, { passive: false })

  document.addEventListener("keydown", (e) => {
    if (activeGame !== "flappy") return
    if (e.code === "Space" || e.key === "ArrowUp" || e.key === " ") {
      e.preventDefault()
      flappyFlap()
    }
  })

  const restartBtn = document.getElementById("restart-flappy")
  if (restartBtn) restartBtn.addEventListener("click", flappyReset)
}

/* ===========================================
   SKILLS TOOLTIPS
=========================================== */

// Keep each skill tooltip inside the viewport and support tap on touch devices
function initSkillTooltips() {
  const buttons = document.querySelectorAll(".skill-icon-btn")
  if (!buttons.length) return

  function clampTooltip(btn) {
    const tooltip = btn.querySelector(".skill-tooltip")
    if (!tooltip) return

    tooltip.style.setProperty("--tooltip-shift", "0px")
    const rect = tooltip.getBoundingClientRect()
    const margin = 20
    let shift = 0

    if (rect.left < margin) {
      shift = margin - rect.left
    } else if (rect.right > window.innerWidth - margin) {
      shift = window.innerWidth - margin - rect.right
    }

    tooltip.style.setProperty("--tooltip-shift", `${shift}px`)
  }

  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => clampTooltip(btn))
    btn.addEventListener("focus", () => clampTooltip(btn))

    // Tap to toggle (touch devices without real hover)
    btn.addEventListener("click", () => {
      const wasActive = btn.classList.contains("active")
      buttons.forEach((b) => b.classList.remove("active"))
      if (!wasActive) {
        btn.classList.add("active")
        clampTooltip(btn)
      }
    })
  })

  // Close open tooltip when tapping outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".skill-icon-btn")) {
      buttons.forEach((b) => b.classList.remove("active"))
    }
  })

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      buttons.forEach((b) => b.classList.remove("active"))
    }
  })
}

/* ===========================================
   PROJECT PREVIEW MODAL
=========================================== */

// Clicking a project card (with a code preview, not a live product) opens a
// bigger, auto-looping version of its visual before sending the user to
// GitHub — reuses the exact same markup already built for the card itself
// Multi-screen galleries for projects with more than 2 real screens to show.
// Order follows the actual flow: dark (splash/onboarding) screens first,
// light (form) screens after — not alphabetical or upload order.
// "phone" variant renders a phone bezel (mobile app); "desktop" renders a
// plain 16:9 frame (web app screenshots).
const PROJECT_GALLERIES = {
  fittribe: {
    variant: "phone",
    images: [
      { src: "./assets/fittribe-boasvindas.png", caption: "Boas-vindas" },
      { src: "./assets/fittribe-onboarding-mapa.png", caption: "Onboarding — Rotas" },
      { src: "./assets/fittribe-onboarding-clima.png", caption: "Onboarding — Clima" },
      { src: "./assets/fittribe-onboarding-saude.png", caption: "Onboarding — Saúde" },
      { src: "./assets/fittribe-login.png", caption: "Login" },
      { src: "./assets/fittribe-cadastro.png", caption: "Cadastro" },
      { src: "./assets/fittribe-sucesso.png", caption: "Confirmação" },
    ],
  },
  gestaocheck: {
    variant: "desktop",
    images: [
      { src: "./assets/gestaocheck-inicio-dark.png", caption: "Início — escuro" },
      { src: "./assets/gestaocheck-inicio-light.png", caption: "Início — claro" },
      { src: "./assets/gestaocheck-mobile-inicio.png", caption: "📱 100% adaptado pro mobile", variant: "phone" },
      { src: "./assets/gestaocheck-estoque-dark.png", caption: "Estoque — escuro" },
      { src: "./assets/gestaocheck-estoque-light.png", caption: "Estoque — claro" },
      { src: "./assets/gestaocheck-cmv-dark.png", caption: "CMV — escuro" },
      { src: "./assets/gestaocheck-cmv-light.png", caption: "CMV — claro" },
      { src: "./assets/gestaocheck-cmo-dark.png", caption: "CMO — escuro" },
      { src: "./assets/gestaocheck-cmo-light.png", caption: "CMO — claro" },
      { src: "./assets/gestaocheck-cmc-dark.png", caption: "CMC — escuro" },
      { src: "./assets/gestaocheck-cmc-light.png", caption: "CMC — claro" },
      { src: "./assets/gestaocheck-relatorio-dark.png", caption: "Relatório geral — escuro" },
      { src: "./assets/gestaocheck-relatorio-light.png", caption: "Relatório geral — claro" },
    ],
  },
}

// Builds a small auto-cycling carousel (image + caption) for projects with
// more real screens than the hover crossfade alone can show.
// variant "phone" = mobile app (phone bezel), "desktop" = web app (16:9 frame).
// A "desktop" gallery can still mix in individual "phone" slides (e.g. one
// mobile screenshot among web screenshots) — those render as a small
// centered phone card instead of being stretched to fill the wide frame.
function buildGalleryVisual(images, variant = "phone") {
  const isPhone = variant === "phone"

  const wrap = document.createElement("div")
  wrap.className = isPhone ? "project-visual phone-mockup" : "project-visual gallery-wide"

  const frame = document.createElement("div")
  frame.className = isPhone ? "phone-frame" : "gallery-wide-frame"
  images.forEach((img, i) => {
    const el = document.createElement("img")
    el.src = img.src
    el.alt = img.caption
    const slideIsPhone = isPhone || img.variant === "phone"
    el.className =
      (isPhone ? "phone-screen " : slideIsPhone ? "gallery-inline-phone " : "gallery-wide-screen ") +
      "gallery-screen"
    if (i === 0) el.classList.add("gallery-active")
    frame.appendChild(el)
  })
  wrap.appendChild(frame)

  const caption = document.createElement("p")
  caption.className = "gallery-caption"
  caption.textContent = images[0].caption

  const screens = frame.querySelectorAll(".gallery-screen")
  let index = 0
  const intervalId = setInterval(() => {
    screens[index].classList.remove("gallery-active")
    index = (index + 1) % screens.length
    screens[index].classList.add("gallery-active")
    caption.textContent = images[index].caption
  }, 3200)

  return { visual: wrap, caption, stop: () => clearInterval(intervalId) }
}

let stopActiveModalGallery = null
let lastFocusedBeforeModal = null

// Shared opener for the project preview modal — used both by the project
// cards (data derived from the card's own DOM) and the GestãoCheck
// case-study trigger (data passed explicitly, since it isn't a card)
function openProjectModal({ visualEl, galleryKey, title, desc, stack, ctaHref, ctaText }) {
  const modal = document.getElementById("project-modal")
  if (!modal) return

  const visualHost = document.getElementById("project-modal-visual")
  visualHost.innerHTML = ""

  if (stopActiveModalGallery) {
    stopActiveModalGallery()
    stopActiveModalGallery = null
  }

  const gallery = galleryKey && PROJECT_GALLERIES[galleryKey]
  if (gallery) {
    const { visual, caption, stop } = buildGalleryVisual(gallery.images, gallery.variant)
    visualHost.appendChild(visual)
    visualHost.appendChild(caption)
    stopActiveModalGallery = stop
  } else if (visualEl) {
    const clone = visualEl.cloneNode(true)
    clone.classList.remove("tilt-on-hover")
    clone.classList.add("autoplay")
    clone.style.transform = "none"
    visualHost.appendChild(clone)
  }

  document.getElementById("project-modal-title").textContent = title || ""
  document.getElementById("project-modal-desc").textContent = desc || ""
  document.getElementById("project-modal-stack").textContent = stack || ""
  const ctaEl = document.getElementById("project-modal-cta")
  ctaEl.href = ctaHref || "#"
  ctaEl.textContent = ctaText || "Ver mais →"

  lastFocusedBeforeModal = document.activeElement
  modal.classList.add("open")
  modal.setAttribute("aria-hidden", "false")
  document.body.style.overflow = "hidden"
  modal.querySelector(".project-modal-close").focus()
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal")
  if (!modal) return

  if (stopActiveModalGallery) {
    stopActiveModalGallery()
    stopActiveModalGallery = null
  }
  modal.classList.remove("open")
  modal.setAttribute("aria-hidden", "true")
  document.body.style.overflow = ""
  if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus()
}

function initProjectPreviewModal() {
  const cards = document.querySelectorAll(".project-card[data-preview]")
  const modal = document.getElementById("project-modal")
  if (!modal) return

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault()
      const heading = card.querySelector("h3")
      const description = card.querySelector(".project-desc")
      const stack = card.querySelector("p:not(.project-desc):not(.project-links)")
      const cta = card.querySelector(".project-links")

      openProjectModal({
        visualEl: card.querySelector(".project-visual"),
        galleryKey: card.dataset.gallery,
        title: heading ? heading.textContent : "",
        desc: description ? description.textContent : "",
        stack: stack ? stack.textContent : "",
        ctaHref: card.href,
        ctaText: cta ? cta.textContent : "Ver no GitHub →",
      })
    })
  })

  // GestãoCheck case-study "ver mais telas" trigger — not a .project-card,
  // so its data is passed explicitly instead of read from card markup
  const caseStudyTrigger = document.querySelector("[data-gallery-trigger]")
  if (caseStudyTrigger) {
    caseStudyTrigger.addEventListener("click", () => {
      openProjectModal({
        galleryKey: caseStudyTrigger.dataset.galleryTrigger,
        title: "📊 GestãoCheck",
        desc: "Mesma tela em claro e escuro — 100% do sistema é responsivo, incluindo mobile.",
        stack: "Python • Flask • PostgreSQL • Docker • Pytest",
        ctaHref: "https://gestaocheck.tech",
        ctaText: "Conhecer o produto →",
      })
    })
  }

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeProjectModal)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeProjectModal()
  })
}

/* ===========================================
   CERTIFICATE VIEWER MODAL
=========================================== */

// Opens a certificate PDF in an in-page modal (native browser PDF viewer via
// <iframe>) instead of sending the user off to a new tab. The header keeps an
// "Abrir ↗" link and there's a fallback link below in case the embed is
// blocked (some mobile browsers won't render PDFs inline).
let lastFocusedBeforeCert = null

function openCertModal(pdf, title) {
  const modal = document.getElementById("cert-modal")
  if (!modal || !pdf) return

  const iframe = document.getElementById("cert-modal-iframe")
  const openLink = document.getElementById("cert-modal-open")
  const fallbackLink = document.getElementById("cert-modal-fallback-link")

  document.getElementById("cert-modal-title").textContent = title || "Certificado"
  iframe.src = pdf
  openLink.href = pdf
  fallbackLink.href = pdf

  lastFocusedBeforeCert = document.activeElement
  modal.classList.add("open")
  modal.setAttribute("aria-hidden", "false")
  document.body.style.overflow = "hidden"
  modal.querySelector(".cert-modal-close").focus()
}

function closeCertModal() {
  const modal = document.getElementById("cert-modal")
  if (!modal) return

  modal.classList.remove("open")
  modal.setAttribute("aria-hidden", "true")
  document.body.style.overflow = ""
  // Drop the src so the PDF stops rendering / downloading in the background
  document.getElementById("cert-modal-iframe").src = "about:blank"
  if (lastFocusedBeforeCert) lastFocusedBeforeCert.focus()
}

function initCertModal() {
  const modal = document.getElementById("cert-modal")
  const host = document.getElementById("achievements-groups")
  if (!modal || !host) return

  // The cards are real <button>s, so Enter/Space fire a click natively
  host.addEventListener("click", (e) => {
    const card = e.target.closest(".achievement-card.has-pdf")
    if (!card) return
    openCertModal(card.dataset.certPdf, card.dataset.certTitle)
  })

  modal.querySelectorAll("[data-cert-close]").forEach((el) => {
    el.addEventListener("click", closeCertModal)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeCertModal()
  })
}

/* ===========================================
   CASE STUDY HOVER-SCRUB MINI CAROUSEL
=========================================== */

// Each time the cursor enters the GestãoCheck thumbnail, advance to the
// next real screen (crossfade), while the upcoming 2 screens peek out from
// behind as a photo stack — the 3D tilt keeps running on the active image
function initCaseStudyHoverCarousel() {
  const gallery = PROJECT_GALLERIES.gestaocheck
  const media = document.querySelector(".case-study-media")
  const stack = document.getElementById("gestaocheck-media-stack")
  if (!gallery || !media || !stack) return

  const activeImg = stack.querySelector(".stack-active")
  const behind1 = stack.querySelector(".stack-behind-1")
  const behind2 = stack.querySelector(".stack-behind-2")
  // Portrait (phone) slides don't crop well into this 16:9 thumb — the
  // modal gallery already shows those properly, so skip them here
  const images = gallery.images.filter((img) => img.variant !== "phone")
  let index = 0

  function render() {
    const current = images[index % images.length]
    const next1 = images[(index + 1) % images.length]
    const next2 = images[(index + 2) % images.length]

    activeImg.style.opacity = "0"
    setTimeout(() => {
      activeImg.src = current.src
      activeImg.alt = current.caption
      activeImg.style.opacity = "1"
    }, 120)

    behind1.src = next1.src
    behind2.src = next2.src
  }

  behind1.src = images[1 % images.length].src
  behind2.src = images[2 % images.length].src

  media.addEventListener("mouseenter", () => {
    index = (index + 1) % images.length
    render()
  })
}

/* ===========================================
   CASE STUDY "LER MAIS"
=========================================== */

// Collapses the tail of the GestãoCheck description so the card stays about
// as tall as the screenshot next to it; button toggles it open.
function initCaseStudyReadMore() {
  const toggle = document.querySelector(".case-study-toggle")
  const more = document.getElementById("case-study-more")
  if (!toggle || !more) return
  makeCollapsible(more, toggle)
}

/* ===========================================
   AVATAR BIO BUBBLE
=========================================== */

// Tap-to-toggle support for the avatar bio bubble on touch devices
// (desktop already gets it for free via :hover/:focus-within in CSS)
function initAvatarBioBubble() {
  const wrap = document.querySelector(".avatar-wrap")
  if (!wrap) return

  const sync = () =>
    wrap.setAttribute("aria-expanded", String(wrap.classList.contains("active")))

  wrap.addEventListener("click", (e) => {
    e.stopPropagation()
    wrap.classList.toggle("active")
    sync()
  })

  // Enter/Space activate it like a real button (it has role="button")
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      wrap.classList.toggle("active")
      sync()
    }
  })

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".avatar-wrap")) {
      wrap.classList.remove("active")
      sync()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      wrap.classList.remove("active")
      sync()
    }
  })
}

/* ===========================================
   SCROLL PROGRESS BAR
=========================================== */

function initScrollProgress() {
  const bar = document.getElementById("scroll-progress")
  if (!bar) return

  let ticking = false

  function update() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
    bar.style.width = `${Math.min(pct, 100)}%`
    ticking = false
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    },
    { passive: true }
  )

  update()
}

/* ===========================================
   CONTACT LINK OBFUSCATION
=========================================== */

// Builds the WhatsApp/email links at runtime instead of leaving the raw
// phone number and address in the static HTML, so basic scrapers that just
// read the page source (not execute JS) can't harvest them for spam
function initContactLinks() {
  const waNumber = ["55", "85", "99179", "9221"].join("")
  const waMessage = encodeURIComponent(
    "Hello, I saw your portfolio and would like to get in touch!"
  )
  const waLink = document.querySelector("[data-wa-link]")
  if (waLink) {
    waLink.href = `https://wa.me/${waNumber}?text=${waMessage}`
    waLink.removeAttribute("data-wa-link")
  }

  const email = ["cadurocha39", "gmail.com"].join("@")
  const emailLink = document.querySelector("[data-email-link]")
  if (emailLink) {
    emailLink.href = `https://mail.google.com/mail/?view=cm&to=${email}`
    emailLink.setAttribute("aria-label", `Send email to ${email}`)
    emailLink.removeAttribute("data-email-link")
  }
}

/* ===========================================
   SCROLL REVEAL
=========================================== */

// Fade + slide-up reveal for sections/cards as they enter the viewport,
// with a stagger between siblings
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  const selectors = [
    ".link-card",
    ".case-study",
    ".project-card",
    ".achievements-section",
    ".skill-category-block",
    ".game-section",
    "footer",
  ]

  const elements = document.querySelectorAll(selectors.join(","))
  if (!elements.length) return

  // Stagger delay based on position among reveal siblings sharing a parent
  const countByParent = new Map()
  elements.forEach((el) => {
    el.classList.add("reveal")
    const parent = el.parentElement
    const index = countByParent.get(parent) || 0
    countByParent.set(parent, index + 1)
    el.style.transitionDelay = prefersReducedMotion
      ? "0ms"
      : `${Math.min(index * 70, 420)}ms`
  })

  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add("is-visible"))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  )

  elements.forEach((el) => observer.observe(el))
}

/* ===========================================
   SKILL LEVEL INDICATORS
=========================================== */

// Reads each skill's level from its tooltip and renders it as filled dots
// next to the icon, so the level is visible without hovering
function initSkillLevelIndicators() {
  const levelMap = {
    AVANÇADO: 3,
    INTERMEDIÁRIO: 2,
    BÁSICO: 1,
    ESTUDANDO: 0,
  }

  document.querySelectorAll(".skill-icon-btn").forEach((btn) => {
    const levelEl = btn.querySelector(".skill-level")
    const nameSpan = btn.querySelector(":scope > span")
    if (!levelEl || !nameSpan) return

    const filled = levelMap[levelEl.textContent.trim().toUpperCase()] ?? 0

    const dots = document.createElement("span")
    dots.className = "skill-level-dots"
    dots.setAttribute("aria-hidden", "true")

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("i")
      if (i < filled) dot.classList.add("filled")
      dots.appendChild(dot)
    }

    nameSpan.insertAdjacentElement("afterend", dots)
  })
}

/* ===========================================
   CASE STUDY STAT COUNTERS
=========================================== */

// Animate GestãoCheck stat numbers (0 → target) when they scroll into view
function initStatCounters() {
  const statValues = document.querySelectorAll(".case-study .stat-value[data-count]")
  if (!statValues.length) return

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  function animateCount(el) {
    const target = Number(el.dataset.count)

    if (prefersReducedMotion) {
      el.textContent = target
      return
    }

    const duration = 1200
    const start = performance.now()

    function step(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      el.textContent = Math.round(target * eased)

      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statValues.forEach(animateCount)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )

  observer.observe(document.querySelector(".case-study"))
}

/* ===========================================
   PROJECT CARD TILT EFFECT
=========================================== */

// Subtle 3D tilt on project visuals, following the mouse position
function initTiltEffect() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  if (prefersReducedMotion) return

  const elements = document.querySelectorAll(".tilt-on-hover")
  if (!elements.length) return

  elements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      const maxTilt = 8 // degrees
      el.style.transform = `perspective(600px) rotateX(${(-y * maxTilt).toFixed(
        2
      )}deg) rotateY(${(x * maxTilt).toFixed(2)}deg)`
    })

    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)"
    })
  })
}

/* ===========================================
   CONTROLS AND EVENT LISTENERS
=========================================== */

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (activeGame !== "snake") return

  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

  // Prevent default arrow key behavior (page scrolling)
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

  // Game running → change direction (prevent 180° turns)
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
        stopGameLoop()
        gameState = "paused"
        pauseBtn.textContent = "▶️ Continue"
        pauseBtn.setAttribute("aria-label", "Continue game")
      } else if (gameState === "paused") {
        gameState = "running"
        startGameLoop()
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

      // Trigger keyboard event for consistent control handling
      const event = new KeyboardEvent("keydown", { key: key })
      document.dispatchEvent(event)
    })
  })

  // Theme button event listeners
  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleMode)

    // Prevent dragging on theme button
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

    // Inline styles to prevent text selection
    themeToggle.style.userSelect = "none"
    themeToggle.style.webkitUserSelect = "none"
    themeToggle.style.msUserSelect = "none"
    themeToggle.style.mozUserSelect = "none"
    themeToggle.style.cursor = "pointer"
  }
})

/* ===========================================
   ADDITIONAL PREVENTION FOR THEME BUTTON
=========================================== */

// Prevent accidental dragging and text selection on theme button
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")

  if (themeToggle) {
    // Prevent text selection
    themeToggle.addEventListener("selectstart", (e) => e.preventDefault())

    // Prevent dragging on mobile
    themeToggle.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault()
      },
      { passive: false }
    )

    // Ensure click always works
    themeToggle.addEventListener("mousedown", (e) => {
      e.preventDefault()
      themeToggle.focus()
    })
  }
})

/* ===========================================
   INITIALIZATION
=========================================== */

// Initialize theme from localStorage
initTheme()

// Initialize the reading progress bar
initScrollProgress()

// Build contact links (WhatsApp/email) at runtime
initContactLinks()

// Render the achievements grids
initAchievements()

// In-page certificate PDF viewer
initCertModal()

// Initialize avatar bio bubble tap support
initAvatarBioBubble()

// Initialize project preview modal
initProjectPreviewModal()

// Initialize GestãoCheck card hover-scrub mini carousel
initCaseStudyHoverCarousel()

// Initialize GestãoCheck "Ler mais" toggle
initCaseStudyReadMore()

// Initialize skills tooltips
initSkillTooltips()

// Initialize project card tilt effect
initTiltEffect()

// Initialize GestãoCheck stat counters
initStatCounters()

// Initialize skill level dot indicators
initSkillLevelIndicators()

// Initialize scroll reveal animations
initScrollReveal()

// Initialize game (shows start screen)
resetGame()

// Initialize game selector and the 3 extra mini games
initGameSelector()
initTicTacToe()
initPong()
initFlappy()

// Final setup after window loads
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

  // Loading screen fade out
  const loading = document.getElementById("loading")
  if (loading) {
    setTimeout(() => {
      loading.classList.add("hidden")
      setTimeout(() => {
        loading.style.display = "none"
      }, 300)
    }, 500)
  }

  // Set current year in footer
  const currentYear = document.getElementById("current-year")
  if (currentYear) currentYear.textContent = new Date().getFullYear()
})
