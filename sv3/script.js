// --- TUS VARIABLES ACTUALIZADAS ---
const REVEAL_OPACITY = 0.05; 
const SOUND_URL = '1.mp3'; 
const HEART_SIZE = 15;
const REVEAL_RADIUS = 60;

const maskCanvas = document.getElementById('maskCanvas');
const heartCanvas = document.getElementById('heartCanvas');
const mCtx = maskCanvas.getContext('2d');
const hCtx = heartCanvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

let particles = [];
let isDragging = false;
let audioContextStarted = false;

// 1. Cargamos el sonido y lo preparamos
const clickSound = new Audio(SOUND_URL);
clickSound.load(); // Forzar carga desde el inicio

function init() {
    resize();
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
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

// --- LÓGICA DE AUDIO DEFINITIVA PARA MÓVILES ---
function forcePlaySound() {
    // Intentamos reproducir el sonido original para "despertar" el canal de audio del móvil
    if (!audioContextStarted) {
        clickSound.play().then(() => {
            audioContextStarted = true;
            clickSound.pause(); // Lo pausamos inmediatamente, ya cumplió su función de desbloquear
            clickSound.currentTime = 0;
        }).catch(err => console.log("Esperando interacción fuerte..."));
    }

    // Usamos el clon para el efecto de sonido real
    const soundClone = clickSound.cloneNode();
    soundClone.volume = 0.4;
    soundClone.play().catch(() => {});
}

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
        if (this.opacity <= 0 || this.size <= 0) return;
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

function handleInteraction(x, y) {
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

    const colors = ['#FF0000', '#FF69B4', '#FF1493', '#FFC0CB', '#FFFFFF', '#E31212', '#FF82AB'];
    const clickColor = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 5; i++) {
        particles.push(new HeartParticle(x, y, clickColor));
    }
}

// --- EVENTOS COORDINADOS ---
function startAction(e) {
    isDragging = true;
    forcePlaySound(); // Prioridad máxima al sonido
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    handleInteraction(x, y);
}

function moveAction(e) {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    handleInteraction(x, y);
    // Probabilidad de sonido durante el arrastre (ajustada para que no sature)
    if (Math.random() > 0.95) forcePlaySound();
}

maskCanvas.addEventListener('mousedown', startAction);
window.addEventListener('mousemove', moveAction);
window.addEventListener('mouseup', () => isDragging = false);

// Eventos táctiles mejorados
maskCanvas.addEventListener('touchstart', (e) => {
    startAction(e);
    if (e.cancelable) e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    moveAction(e);
    if (e.cancelable) e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);

// RECARGAR PÁGINA AL HACER CLIC EN REINICIAR
resetBtn.addEventListener('click', () => {
    location.reload();
});

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