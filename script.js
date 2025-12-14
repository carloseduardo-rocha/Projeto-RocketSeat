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
    this.speedX = Math.random() * 1 - 0.5
    this.speedY = Math.random() * 1 - 0.5
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
  }

  draw() {
    ctx.fillStyle = "rgba(0, 255, 255, 0.7)"
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
  particlesArray.forEach((particle) => {
    particle.update()
    particle.draw()
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

function toggleMode() {
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  html.classList.toggle("light")

  if (html.classList.contains("light")) {
    img.setAttribute("src", "./assets/avatar-light.png")
    img.setAttribute(
      "alt",
      "Foto de Carlos Eduardo, com barba, cabelo solto, na empresa Alares."
    )
  } else {
    img.setAttribute("src", "./assets/avatar.png")
    img.setAttribute(
      "alt",
      "Foto de Carlos Eduardo, sorrindo, com barba, cabelo amarrado, no Senac."
    )
  }
}

const gameCanvas = document.getElementById("snakeGame")
const gameCtx = gameCanvas.getContext("2d")

const box = 15
let snake = [{ x: 9 * box, y: 9 * box }]
let direction = "RIGHT"
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box,
}
let score = 0

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP"
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN"
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT"
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT"
})

function drawGame() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height)

  snake.forEach((segment, index) => {
    gameCtx.fillStyle = index === 0 ? "#00ffff" : "#ffffff"
    gameCtx.fillRect(segment.x, segment.y, box, box)
  })

  gameCtx.fillStyle = "red"
  gameCtx.fillRect(food.x, food.y, box, box)

  let headX = snake[0].x
  let headY = snake[0].y

  if (direction === "UP") headY -= box
  if (direction === "DOWN") headY += box
  if (direction === "LEFT") headX -= box
  if (direction === "RIGHT") headX += box

  if (headX === food.x && headY === food.y) {
    score++
    document.getElementById("score").innerText = score
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    }
  } else {
    snake.pop()
  }

  const newHead = { x: headX, y: headY }

  if (
    headX < 0 ||
    headY < 0 ||
    headX >= gameCanvas.width ||
    headY >= gameCanvas.height ||
    snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    alert("Game Over!")
    snake = [{ x: 9 * box, y: 9 * box }]
    direction = "RIGHT"
    score = 0
    document.getElementById("score").innerText = score
    return
  }

  snake.unshift(newHead)
}

setInterval(drawGame, 120)
