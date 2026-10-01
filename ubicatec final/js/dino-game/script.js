import { updateGround, setupGround } from "./ground.js"
import { updateclouds, setupclouds } from "./clouds.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const stopScreenElem = document.querySelector("[data-end-screen]")

function ubTrack(name, options) {
  try { window.ubicatecTrack && window.ubicatecTrack(name, options) } catch {}
}

ubTrack('dino_page_open')

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)

function waitForStart() {
  document.addEventListener("keydown", handleStart, { once: true })
  document.addEventListener("touchstart", handleStart, { once: true })
}

waitForStart()

let lastTime
let speedScale
let score
let Highscore
function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateclouds(delta, speedScale)
  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  updateCactus(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)
  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const dinoRect = getDinoRect()
  return getCactusRects().some(rect => isCollision(rect, dinoRect))
}


function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)
}


function handleStart() {
  // Solo iniciar si el juego está activo (visible)
  if (!document.body.classList.contains("game-active")) {
    waitForStart()
    return
  }

  lastTime = null
  speedScale = 1
  score = 0
  Highscore = 1000
  setupclouds()
  setupGround()
  setupDino()
  setupCactus()
  startScreenElem.classList.add("hide")
  ubTrack('dino_game_start')
  window.requestAnimationFrame(update)
}

function handleLose() {
  setDinoLose()
  ubTrack('dino_game_over', { label: String(Math.floor(score || 0)) })
  setTimeout(() => {
    waitForStart()
    startScreenElem.classList.remove("hide")
  }, 100)
}

if (score > Highscore) {
  Highscore = score;
}

function setPixelToWorldScale() {
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }
  
  // Update world size based on container
  if(worldElem) {
      const width = WORLD_WIDTH * worldToPixelScale
      const height = WORLD_HEIGHT * worldToPixelScale
      worldElem.style.width = `${width}px`
      worldElem.style.height = `${height}px`
      
      // OPTIMIZATION: Set CSS variables for transform calculations
      worldElem.style.setProperty('--world-width', width)
      worldElem.style.setProperty('--world-height', height)
  }
}
