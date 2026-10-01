import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = { 
    apiKey: "AIzaSyAVr9LEZaxuC1HSxDF2zdE0Y-1Q9qlmp00", 
    authDomain: "ubicatec-scores.firebaseapp.com", 
    databaseURL: "https://ubicatec-scores-default-rtdb.firebaseio.com", 
    projectId: "ubicatec-scores", 
    storageBucket: "ubicatec-scores.firebasestorage.app", 
    messagingSenderId: "883273877501", 
    appId: "1:883273877501:web:0b505be5302e117a1d7b94", 
    measurementId: "G-MF5WCW3E12" 
};

// Initialize Firebase safely
let app = null;
let db = null;
try {
    app = initializeApp(firebaseConfig, "flappy-scores-app");
    db = getDatabase(app);
} catch (e) {
    console.warn("[Flappy] Firebase no pudo inicializarse:", e);
}

function ubTrack(name, options) {
    try { window.ubicatecTrack && window.ubicatecTrack(name, options); } catch {}
}

let ubFlappyStarted = false;
let ubFlappyGameOverTracked = false;

// CANVAS RESOLUTION (Arcade 320x480)
const cvs = document.getElementById("bird");
const ctx = cvs ? cvs.getContext("2d") : null;

const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 480;

if (cvs) {
    cvs.width = VIRTUAL_WIDTH;
    cvs.height = VIRTUAL_HEIGHT;
}

// FUENTE ARCADE GOOGLE FONT: Press Start 2P
const FONT_FAMILY = '"Press Start 2P", monospace';

// Precarga de fuente para Canvas
try {
    if (document.fonts) {
        document.fonts.load(`16px ${FONT_FAMILY}`).then(() => {
            if (state.current === state.getReady) draw();
        });
    }
} catch (e) {}

// GAME SPEED AND CONSTANTS
const GAME_SPEED = 2.4;
const DEGREE = Math.PI / 180;

let frames = 0;
let lastSpawnFrame = 0;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/flappy/sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio("audio/flappy/sfx_point.wav");
const FLAP = new Audio("audio/flappy/sfx_flap.wav");
const HIT = new Audio("audio/flappy/sfx_hit.wav");
const SWOOSHING = new Audio("audio/flappy/sfx_swooshing.wav");
const DIE = new Audio("audio/flappy/sfx_die.wav");

function playSound(audio) {
    if (!audio) return;
    try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === "function") {
            p.catch(() => {});
        }
    } catch (e) {}
}

// GAME STATE
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
    recording: 3
};

// SCOREBOARD LOGIC
let globalScores = [];

async function loadLocalScoresFallback() {
    try {
        const res = await fetch('data/scores.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
            globalScores = data
                .filter(x => x && typeof x.score === 'number' && typeof x.name === 'string')
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
        }
    } catch {}
}

function loadGlobalScores() {
    if (!db) {
        loadLocalScoresFallback();
        return;
    }
    try {
        const scoresRef = query(ref(db, 'scores'), orderByChild('score'), limitToLast(10));
        onValue(scoresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                globalScores = Object.values(data).sort((a, b) => b.score - a.score);
            } else {
                loadLocalScoresFallback();
            }
        }, async () => {
            await loadLocalScoresFallback();
        });
    } catch (e) {
        loadLocalScoresFallback();
    }
}

function showScoreboard() {
    const container = document.getElementById('flappy-scoreboard-container');
    const list = document.getElementById('scoreboard-list');
    
    if (!container || !list) return;
    
    list.innerHTML = '';
    globalScores.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'scoreboard-item';
        div.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${item.name}</span>
            <span class="score-val">${item.score}</span>
        `;
        list.appendChild(div);
    });
    
    container.style.display = 'block';
    ubTrack('flappy_scoreboard_open');
}

function checkNewRecord(currentScore) {
    if (globalScores.length < 10 || currentScore > globalScores[globalScores.length - 1].score) {
        state.current = state.recording;
        ubTrack('flappy_new_record_prompt', { label: String(currentScore || 0) });
        
        const modal = document.getElementById('new-record-modal');
        const scoreDisplay = document.getElementById('record-score-display');
        const nameInput = document.getElementById('player-name-input');
        const saveBtn = document.getElementById('save-score-btn');
        
        if (modal && scoreDisplay) {
            scoreDisplay.textContent = currentScore;
            modal.style.display = 'flex';
            
            saveBtn.onclick = () => {
                const name = (nameInput && nameInput.value.trim()) || "Anónimo";
                ubTrack('flappy_new_record_save', { label: String(currentScore || 0) });
                saveNewScore(name, currentScore);
                modal.style.display = 'none';
                state.current = state.over;
                showScoreboard();
            };
        }
    }
}

function saveNewScore(name, scoreValue) {
    if (!db) {
        loadLocalScoresFallback();
        return;
    }
    try {
        const newScoreKey = Date.now();
        const newScoreRef = ref(db, 'scores/' + newScoreKey);
        set(newScoreRef, {
            name: name,
            score: scoreValue
        }).catch(() => loadLocalScoresFallback());
    } catch (e) {
        loadLocalScoresFallback();
    }
}

loadGlobalScores();

// INPUT HANDLING
function handleFlap() {
    if (!document.body.classList.contains("game-active")) return;

    switch(state.current){
        case state.getReady:
            state.current = state.game;
            playSound(SWOOSHING);
            ubFlappyGameOverTracked = false;
            if (!ubFlappyStarted) {
                ubFlappyStarted = true;
                ubTrack('flappy_game_start');
            } else {
                ubTrack('flappy_game_restart');
            }
            bird.flap();
            playSound(FLAP);
            break;
            
        case state.game:
            if (bird.y - bird.radius <= 0) return;
            bird.flap();
            playSound(FLAP);
            break;
            
        case state.over:
            const scoreboard = document.getElementById('flappy-scoreboard-container');
            if (scoreboard && scoreboard.style.display === 'block') return;
            const recordModal = document.getElementById('new-record-modal');
            if (recordModal && recordModal.style.display === 'flex') return;
            
            pipes.reset();
            bird.speedReset();
            score.reset();
            frames = 0;
            lastSpawnFrame = 0;
            state.current = state.getReady;
            break;
            
        case state.recording:
            break;
    }
}

function inputHandler(evt) {
    if (!document.body.classList.contains("game-active")) return;

    let clickX = VIRTUAL_WIDTH / 2;
    let clickY = VIRTUAL_HEIGHT / 2;

    if (evt && (evt.type === 'touchstart' || evt.type === 'click')) {
        const rect = cvs.getBoundingClientRect();
        const scaleX = VIRTUAL_WIDTH / (rect.width || 1);
        const scaleY = VIRTUAL_HEIGHT / (rect.height || 1);
        
        let clientX = evt.clientX;
        let clientY = evt.clientY;
        if (evt.type === 'touchstart') {
            const t = evt.touches[0];
            clientX = t.clientX;
            clientY = t.clientY;
            if (evt.cancelable) evt.preventDefault();
        }
        
        clickX = (clientX - rect.left) * scaleX;
        clickY = (clientY - rect.top) * scaleY;
        
        if (state.current === state.over) {
            if (gameOver.checkClick(clickX, clickY)) return;
        }
    }

    handleFlap();
}

if (cvs) {
    cvs.addEventListener("click", inputHandler);
    cvs.addEventListener("touchstart", inputHandler, { passive: false });
}

window.addEventListener("keydown", function(e) {
    if (!document.body.classList.contains("game-active")) return;
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleFlap();
    } else if (e.code === "Escape") {
        e.preventDefault();
        if (typeof window.toggleDinoGame === 'function') {
            window.toggleDinoGame();
        }
    }
});

// BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: VIRTUAL_HEIGHT - 226,
    
    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
};

// FOREGROUND (SUELO)
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: VIRTUAL_HEIGHT - 112,
    dx: GAME_SPEED,
    
    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(dt){
        if(state.current === state.game){
            this.x = (this.x - this.dx * dt) % (this.w / 2);
        }
    }
};

// BIRD (Física ágil, equilibrada a velocidad 2.4)
const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
    x: 60,
    y: 160,
    w: 34,
    h: 24,
    radius: 12,
    frame: 0,
    animTimer: 0,
    
    gravity: 0.24,
    jump: 4.6,
    speed: 0,
    rotation: 0,
    maxFallSpeed: 7.5,
    
    draw: function(){
        let b = this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, b.sX, b.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    },
    
    flap: function(){
        this.speed = -this.jump;
        this.rotation = -20 * DEGREE;
    },
    
    update: function(dt){
        const period = state.current === state.getReady ? 9 : 5;
        this.animTimer += dt;
        if (this.animTimer >= period) {
            this.animTimer = 0;
            this.frame = (this.frame + 1) % this.animation.length;
        }
        
        if (state.current === state.getReady) {
            this.y = 165 + Math.sin(frames * 0.06) * 5;
            this.rotation = 0;
            this.speed = 0;
        } else {
            this.speed += this.gravity * dt;
            if (this.speed > this.maxFallSpeed) this.speed = this.maxFallSpeed;
            this.y += this.speed * dt;
            
            // Colisión con el suelo
            if (this.y + this.h / 2 >= VIRTUAL_HEIGHT - fg.h) {
                this.y = VIRTUAL_HEIGHT - fg.h - this.h / 2;
                if (state.current === state.game) {
                    state.current = state.over;
                    playSound(DIE);
                    if (!ubFlappyGameOverTracked) {
                        ubFlappyGameOverTracked = true;
                        ubTrack('flappy_game_over', { label: String(score.value || 0) });
                    }
                    setTimeout(() => checkNewRecord(score.value), 600);
                }
            }
            
            // Rotación suave continua
            if (this.speed > 1.2) {
                this.rotation = Math.min(80 * DEGREE, this.rotation + 2.6 * DEGREE * dt);
                this.frame = 1;
            } else {
                this.rotation = -20 * DEGREE;
            }
        }
    },
    
    speedReset: function(){
        this.speed = 0;
        this.rotation = 0;
        this.animTimer = 0;
    }
};

// GET READY MESSAGE
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: Math.round((VIRTUAL_WIDTH - 173) / 2),
    y: 80,
    
    draw: function(){
        if(state.current === state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
            
            ctx.save();
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;
            ctx.font = `9px ${FONT_FAMILY}`;
            ctx.textAlign = "center";
            
            const textY1 = Math.round(this.y + this.h + 20);
            const textY2 = Math.round(this.y + this.h + 34);
            const centerX = Math.round(VIRTUAL_WIDTH / 2);
            
            // Outline atrás, relleno al frente
            ctx.strokeText("TOCA O ESPACIO", centerX, textY1);
            ctx.fillText("TOCA O ESPACIO", centerX, textY1);
            
            ctx.strokeText("PARA VOLAR", centerX, textY2);
            ctx.fillText("PARA VOLAR", centerX, textY2);
            ctx.restore();
        }
    }
};

// GAME OVER MESSAGE
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: Math.round((VIRTUAL_WIDTH - 225) / 2),
    y: 75,
    
    draw: function(){
        if(state.current === state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
            
            ctx.save();
            // Botón GLOBAL SCORES
            ctx.fillStyle = "#e86101";
            ctx.fillRect(this.x + 36, this.y + 204, 153, 26);
            ctx.fillStyle = "#FFF";
            ctx.font = `8px ${FONT_FAMILY}`;
            ctx.textAlign = "center";
            ctx.fillText("GLOBAL SCORES", Math.round(this.x + 112), Math.round(this.y + 221));
            
            // Texto de reinicio
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "#FFF";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;
            ctx.font = `9px ${FONT_FAMILY}`;
            
            const centerX = Math.round(VIRTUAL_WIDTH / 2);
            const rY1 = Math.round(this.y + 252);
            const rY2 = Math.round(this.y + 266);
            
            ctx.strokeText("CLICK O ESPACIO", centerX, rY1);
            ctx.fillText("CLICK O ESPACIO", centerX, rY1);
            
            ctx.strokeText("PARA REINICIAR", centerX, rY2);
            ctx.fillText("PARA REINICIAR", centerX, rY2);
            ctx.restore();
        }
    },
    
    checkClick: function(x, y) {
        if(state.current === state.over) {
            if(x > this.x + 36 && x < this.x + 36 + 153 && y > this.y + 204 && y < this.y + 204 + 26) {
                showScoreboard();
                return true;
            }
        }
        return false;
    }
};

// PIPES (TUBERÍAS)
const pipes = {
    position: [],
    top: { sX: 553, sY: 0 },
    bottom: { sX: 502, sY: 0 },
    w: 52,
    h: 400,
    gap: 110,
    dx: GAME_SPEED,
    
    draw: function(){
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            let topY = p.y;
            let bottomY = p.y + this.h + this.gap;
            
            // Extensión de tubería superior
            if (topY > 0) {
                ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, 1, p.x, 0, this.w, topY);
            }
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topY, this.w, this.h);
            
            // Tubería inferior
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomY, this.w, this.h);
            
            // Extensión hacia el piso
            let floorY = VIRTUAL_HEIGHT - fg.h;
            let pipeEndY = bottomY + this.h;
            if (pipeEndY < floorY) {
                ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY + this.h - 1, this.w, 1, p.x, pipeEndY, this.w, floorY - pipeEndY);
            }
        }
    },
    
    update: function(dt){
        if(state.current !== state.game) return;
        
        // Spawn cada 90 frames (~216px de separación a velocidad 2.4)
        if (frames - lastSpawnFrame >= 90) {
            lastSpawnFrame = frames;
            
            let minGapY = 50;
            let maxGapY = VIRTUAL_HEIGHT - fg.h - this.gap - 50;
            let gapY = Math.random() * (maxGapY - minGapY) + minGapY;
            
            this.position.push({
                x: VIRTUAL_WIDTH,
                y: gapY - this.h,
                passed: false
            });
        }
        
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            let bottomPipeY = p.y + this.h + this.gap;
            
            // Colisiones con tolerancia justa
            const birdLeft = bird.x - bird.radius + 3;
            const birdRight = bird.x + bird.radius - 3;
            const birdTop = bird.y - bird.radius + 3;
            const birdBottom = bird.y + bird.radius - 3;
            
            // Tubería superior
            if (birdRight > p.x && birdLeft < p.x + this.w && birdTop < p.y + this.h) {
                state.current = state.over;
                playSound(HIT);
                if (!ubFlappyGameOverTracked) {
                    ubFlappyGameOverTracked = true;
                    ubTrack('flappy_game_over', { label: String(score.value || 0) });
                }
                setTimeout(() => checkNewRecord(score.value), 600);
            }
            
            // Tubería inferior
            if (birdRight > p.x && birdLeft < p.x + this.w && birdBottom > bottomPipeY) {
                state.current = state.over;
                playSound(HIT);
                if (!ubFlappyGameOverTracked) {
                    ubFlappyGameOverTracked = true;
                    ubTrack('flappy_game_over', { label: String(score.value || 0) });
                }
                setTimeout(() => checkNewRecord(score.value), 600);
            }
            
            // Movimiento fluido multiplicado por dt
            p.x -= this.dx * dt;
            
            // Puntaje al pasar la tubería
            if (!p.passed && p.x + this.w < bird.x) {
                p.passed = true;
                score.value += 1;
                playSound(SCORE_S);
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
            
            // Eliminar si sale de pantalla
            if(p.x + this.w <= -10){
                this.position.shift();
                i--;
            }
        }
    },
    
    reset: function(){
        this.position = [];
    }
};

// SCORE (Contador nítido con orden correcto: Stroke detrás, Fill al frente)
const score = {
    best: localStorage.getItem("best") || 0,
    value: 0,
    
    draw: function(){
        ctx.save();
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        
        if(state.current === state.game){
            // Contador grande en juego
            ctx.font = `24px ${FONT_FAMILY}`;
            ctx.lineWidth = 4;
            ctx.textAlign = "center";
            
            const scoreX = Math.round(VIRTUAL_WIDTH / 2);
            const scoreY = 55;
            
            // 1. Contorno negro atrás
            ctx.strokeText(score.value, scoreX, scoreY);
            // 2. Relleno blanco nítido al frente
            ctx.fillText(score.value, scoreX, scoreY);
            
        } else if(state.current === state.over){
            let msgX = Math.round((VIRTUAL_WIDTH - 225) / 2);
            let msgY = gameOver.y;
            
            ctx.textAlign = "right";
            ctx.font = `12px ${FONT_FAMILY}`;
            ctx.lineWidth = 3;
            
            const targetX = Math.round(msgX + 225 - 28);
            const scoreY = Math.round(msgY + 93);
            const bestY = Math.round(msgY + 135);
            
            // Score actual
            ctx.strokeText(score.value, targetX, scoreY);
            ctx.fillText(score.value, targetX, scoreY);
            
            // Best score
            ctx.strokeText(score.best, targetX, bestY);
            ctx.fillText(score.best, targetX, bestY);
        }
        ctx.restore();
    },
    
    reset: function(){
        this.value = 0;
    }
};

// RESET GAME HOOK
window.flappyResetGame = function() {
    pipes.reset();
    bird.speedReset();
    score.reset();
    frames = 0;
    lastSpawnFrame = 0;
    state.current = state.getReady;
    ubFlappyGameOverTracked = false;
    const modal = document.getElementById('new-record-modal');
    if (modal) modal.style.display = 'none';
    const sb = document.getElementById('flappy-scoreboard-container');
    if (sb) sb.style.display = 'none';
};

// DRAW
function draw(){
    if (!ctx) return;
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(dt){
    bird.update(dt);
    fg.update(dt);
    pipes.update(dt);
}

// DELTA-TIME LOOP
let lastTime = 0;

function loop(now){
    if (document.body.classList.contains("game-active")) {
        if (!lastTime) lastTime = now;
        const deltaMs = now - lastTime;
        lastTime = now;
        
        let dt = deltaMs / (1000 / 60);
        if (dt > 1.8) dt = 1.0;
        if (dt < 0.2) dt = 0.2;
        
        update(dt);
        draw();
        frames += dt;
    } else {
        lastTime = 0;
    }
    
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
