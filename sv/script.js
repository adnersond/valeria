// --- CONFIGURACIÓN AJUSTABLE ---
const HEART_SIZE = 15;
const REVEAL_RADIUS = 60;
const REVEAL_OPACITY = 0.05; // Un poco más para que al arrastrar se note más rápido
const SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'; // Sonido mágico/brillo


const maskCanvas = document.getElementById('maskCanvas');
const heartCanvas = document.getElementById('heartCanvas');
const mCtx = maskCanvas.getContext('2d');
const hCtx = heartCanvas.getContext('2d');

let particles = [];
let isDragging = false;
let audioUnlocked = false; // Nueva variable para control de audio
const colors = ['#FF0000', '#FF69B4', '#FF1493', '#FFC0CB', '#FFFFFF', '#E31212', '#FF82AB'];

const clickSound = new Audio(SOUND_URL);
clickSound.volume = 0.3;

function init() {
    resize();
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    // Revelamos el contenido después de asegurar que el canvas es negro
    document.querySelector('.content').style.opacity = '1';
    animate();
}

function resize() {
    maskCanvas.width = heartCanvas.width = window.innerWidth;
    maskCanvas.height = heartCanvas.height = window.innerHeight;
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
}

window.addEventListener('resize', resize);

class HeartParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * HEART_SIZE + (HEART_SIZE / 2);
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
        this.size -= 0.1;
        if (this.opacity < 0) this.opacity = 0;
        if (this.size < 0) this.size = 0;
    }

    draw() {
        if (this.opacity <= 0) return;
        hCtx.save();
        hCtx.globalAlpha = this.opacity;
        hCtx.fillStyle = this.color;
        hCtx.beginPath();
        const s = this.size;
        hCtx.moveTo(this.x, this.y + s * 0.3);
        hCtx.bezierCurveTo(this.x, this.y, this.x - s / 2, this.y, this.x - s / 2, this.y + s * 0.3);
        hCtx.bezierCurveTo(this.x - s / 2, this.y + s * 0.7, this.x, this.y + s * 0.8, this.x, this.y + s);
        hCtx.bezierCurveTo(this.x, this.y + s * 0.8, this.x + s / 2, this.y + s * 0.7, this.x + s / 2, this.y + s * 0.3);
        hCtx.bezierCurveTo(this.x + s / 2, this.y, this.x, this.y, this.x, this.y + s * 0.3);
        hCtx.fill();
        hCtx.restore();
    }
}

function revealArea(x, y) {
    mCtx.save();
    mCtx.globalCompositeOperation = 'destination-out';
    const gradient = mCtx.createRadialGradient(x, y, 0, x, y, REVEAL_RADIUS);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${REVEAL_OPACITY})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    mCtx.fillStyle = gradient;
    mCtx.beginPath();
    mCtx.arc(x, y, REVEAL_RADIUS, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.restore();
}

function playMagicalSound() {
    // Si es la primera vez, intentamos reproducir el audio original para desbloquearlo
    if (!audioUnlocked) {
        clickSound.play().then(() => {
            audioUnlocked = true;
        }).catch(e => console.log("Esperando interacción..."));
    }
    
    // Clonamos para permitir sonidos simultáneos
    const soundClone = clickSound.cloneNode();
    soundClone.volume = 0.2;
    soundClone.play();
}

function handleInteraction(x, y) {
    revealArea(x, y);
    const clickColor = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 5; i++) {
        particles.push(new HeartParticle(x, y, clickColor));
    }
}

// MOUSE
maskCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    playMagicalSound(); // El sonido se llama primero para aprovechar la interacción directa
    handleInteraction(e.clientX, e.clientY);
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        handleInteraction(e.clientX, e.clientY);
        if (Math.random() > 0.93) playMagicalSound(); 
    }
});

window.addEventListener('mouseup', () => isDragging = false);

// TACTIL
maskCanvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    playMagicalSound();
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const touch = e.touches[0];
        handleInteraction(touch.clientX, touch.clientY);
        if (Math.random() > 0.93) playMagicalSound();
    }
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);

function animate() {
    hCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].opacity <= 0 || particles[i].size <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

init();






const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
    /*
    // 1. Volver a pintar la máscara de negro
    mCtx.globalCompositeOperation = 'source-over'; // Volver al modo normal de dibujo
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);    
    
    // 2. (Opcional) Si quieres que el sonido suene al reiniciar
    playMagicalSound();*/
    
    location. reload();
});