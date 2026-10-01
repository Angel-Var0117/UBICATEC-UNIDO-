import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./update.js"

const dinoElem = document.querySelector("[data-dino]")
const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const DINO_FRAME_COUNT = 2
const FRAME_TIME = 100

// UPDATE: Paths corrected
let gameSound = new Audio("audio/dino/press_sound.mp3");
gameSound.volume=0.5;
let Collisionsound = new Audio("audio/dino/hit_sound.mp3");
Collisionsound.volume = 0.5;

let isJumping
let dinoFrame
let currentFrameTime
let yVelocity
export function setupDino() {
  isJumping = false
  dinoFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  setCustomProperty(dinoElem, "--bottom", 0)
  document.removeEventListener("keydown", onJump)
  document.addEventListener("keydown", onJump)
  // UPDATE: Add touch support
  document.removeEventListener("touchstart", onJumpTouch)
  document.addEventListener("touchstart", onJumpTouch, { passive: false })
}

export function updateDino(delta, speedScale) {
  handleRun(delta, speedScale)
  handleJump(delta)
}

export function getDinoRect() {
  return dinoElem.getBoundingClientRect()
}

export function setDinoLose() {
  // UPDATE: Path corrected
  dinoElem.src = "img/dino/new/dino-lose.png"
  Collisionsound.play();
  
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    // UPDATE: Path corrected
    dinoElem.src = `img/dino/new/dino-stationary.png`
    return
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT
    // UPDATE: Path corrected
    dinoElem.src = `img/dino/new/dino-run-${dinoFrame}.png`
    currentFrameTime -= FRAME_TIME
  }
  currentFrameTime += delta * speedScale
}

function handleJump(delta) {
  if (!isJumping) return

  incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta)

  if (getCustomProperty(dinoElem, "--bottom") <= 0) {
    setCustomProperty(dinoElem, "--bottom", 0)
    isJumping = false
  }

  yVelocity -= GRAVITY * delta
}

function onJump(e) {
  if (e.code !== "Space" || isJumping) return

  yVelocity = JUMP_SPEED
  isJumping = true
  gameSound.play()
}

// UPDATE: Touch handler
function onJumpTouch(e) {
  if (isJumping) return
  // Prevent default to avoid scrolling/zooming while playing
  if(e.target.closest('.world')) {
      e.preventDefault();
  }
  
  yVelocity = JUMP_SPEED
  isJumping = true
  gameSound.play()
}