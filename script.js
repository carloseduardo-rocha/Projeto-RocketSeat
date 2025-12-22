let particleColor = "rgba(0, 255, 255, 0.7)"
let targetParticleColor = particleColor

const savedTheme = localStorage.getItem("theme")
if (savedTheme === "light") {
  document.documentElement.classList.add("light")
  particleColor = "rgba(0, 0, 0, 0.4)"
  targetParticleColor = particleColor
}

/* =========================
   MOUSE INTERACTION
========================= */

const mouse = {
  x: null,
  y: null,
  radius: 120,
}

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x
  mouse.y = e.y
})

/* =========================
   PARTICLES
========================= */

const canvas = document.getElementById("particles")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let particlesArray = []

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() - 0.5
    this.speedY = Math.random() - 0.5
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    if (mouse.x && mouse.y) {
      const dx = this.x - mouse.x
      const dy = this.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < mouse.radius) {
        this.x += dx / 10
        this.y += dy / 10
      }
    }

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

function initParticles() {
  particlesArray = []
  for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle())
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // smooth color transition
  particleColor = targetParticleColor

  particlesArray.forEach((p) => {
    p.update()
    p.draw()
  })

  requestAnimationFrame(animateParticles)
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles()
})

initParticles()
animateParticles()

/* =========================
   THEME TOGGLE
========================= */

function toggleMode() {
  const html = document.documentElement
  const img = document.querySelector("#profile img")

  html.classList.toggle("light")

  if (html.classList.contains("light")) {
    img.src = "./assets/avatar-light.png"
    targetParticleColor = "rgba(0, 0, 0, 0.4)"
    localStorage.setItem("theme", "light")
  } else {
    img.src = "./assets/avatar.png"
    targetParticleColor = "rgba(0, 255, 255, 0.7)"
    localStorage.setItem("theme", "dark")
  }
}

/* =========================
   SNAKE GAME
========================= */

const gameCanvas = document.getElementById("snakeGame")
const gameCtx = gameCanvas.getContext("2d")

function resizeGameCanvas() {
  const container = document.querySelector("#container")
  const size = Math.min(container.clientWidth, 420)

  gameCanvas.width = size
  gameCanvas.height = size
}

resizeGameCanvas()
window.addEventListener("resize", resizeGameCanvas)

let box

function updateBoxSize() {
  box = Math.floor(gameCanvas.width / 20)
}

updateBoxSize()
window.addEventListener("resize", updateBoxSize)

let snake = [{ x: 9 * box, y: 9 * box }]
let direction = "RIGHT"
let nextDirection = direction
let food = generateFood()
let score = 0
let gameRunning = true
let gameLoop

function generateFood() {
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box,
  }
}

document.addEventListener("keydown", (e) => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

  if (keys.includes(e.key)) {
    e.preventDefault()
  }

  if (!gameRunning && e.key === "Enter") {
    resetGame()
    return
  }

  if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP"
  if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN"
  if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT"
  if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT"
})

function drawGame() {
  if (!gameRunning) return

  direction = nextDirection

  // bottom
  gameCtx.fillStyle = "#0b1220"
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // edge
  gameCtx.strokeStyle = "#00ffff"
  gameCtx.lineWidth = 2
  gameCtx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height)

  snake.forEach((segment, index) => {
    gameCtx.fillStyle = index === 0 ? "#00ffff" : "#ffffff"
    gameCtx.beginPath()
    gameCtx.roundRect(segment.x, segment.y, box, box, 4)
    gameCtx.fill()

    if (index === 0) {
      gameCtx.fillStyle = "#000"
      gameCtx.beginPath()
      gameCtx.arc(segment.x + 4, segment.y + 4, 2, 0, Math.PI * 2)
      gameCtx.arc(segment.x + 10, segment.y + 4, 2, 0, Math.PI * 2)
      gameCtx.fill()
    }
  })

  // food
  gameCtx.fillStyle = "#ff4757"
  gameCtx.beginPath()
  gameCtx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, Math.PI * 2)
  gameCtx.fill()

  let headX = snake[0].x
  let headY = snake[0].y

  if (direction === "UP") headY -= box
  if (direction === "DOWN") headY += box
  if (direction === "LEFT") headX -= box
  if (direction === "RIGHT") headX += box

  const newHead = { x: headX, y: headY }

  if (
    headX < 0 ||
    headY < 0 ||
    headX >= gameCanvas.width ||
    headY >= gameCanvas.height ||
    snake.some((s) => s.x === newHead.x && s.y === newHead.y)
  ) {
    endGame()
    return
  }

  snake.unshift(newHead)

  if (headX === food.x && headY === food.y) {
    score++
    document.getElementById("score").innerText = score
    food = generateFood()

    particlesArray.forEach((p) => {
      p.speedX *= 1.5
      p.speedY *= 1.5
    })

    setTimeout(() => {
      particlesArray.forEach((p) => {
        p.speedX *= 0.5
        p.speedY *= 0.5
      })
    }, 300)
  } else {
    snake.pop()
  }
}

function endGame() {
  gameRunning = false
  clearInterval(gameLoop)

  gameCtx.fillStyle = "rgba(0,0,0,0.7)"
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  gameCtx.fillStyle = "#00ffff"
  gameCtx.font = "20px Inter"
  gameCtx.textAlign = "center"
  gameCtx.fillText("Game Over", 150, 130)

  gameCtx.font = "14px Inter"
  gameCtx.fillText("Pressione ENTER", 150, 160)
}

function resetGame() {
  snake = [{ x: 9 * box, y: 9 * box }]
  direction = "RIGHT"
  score = 0
  document.getElementById("score").innerText = score
  food = generateFood()
  gameRunning = true
  gameLoop = setInterval(drawGame, 120)
}

gameLoop = setInterval(drawGame, 120)
const switchButton = document.querySelector("#switch")

switchButton.addEventListener("click", toggleMode)
