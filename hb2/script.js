// --- CONFIGURACIÓN ---
let RADIO_REVELACION = 60; 
const OPACIDAD_REVELACION = 0.05; 
const META_RASPADO = 700; 
const URL_SONIDO_CLICK = '1.mp3'; 
const URL_SONIDO_EXPLOSION = '2.mp3'; 

const TAMANO_BASE_PARTICULA = 15; 
const VOLUMEN_CLICK_BASE = 0.4; 
const VOLUMEN_EXPLOSION_BASE = 0.7; 
const FACTOR_VOLUMEN_REDUCIDO = 0.08; 

const VELOCIDAD_CONFETI = 0.6; 
const DURACION_CONFETI = 0.000008; 
const DURACION_DESVANECIMIENTO_NEGRO = 10; 

const TIEMPO_ZOOM_IN = 0.4; 
const TIEMPO_ZOOM_OUT = 0.4;
const TIEMPO_VUELO = 1.5;

// --- ELEMENTOS DEL DOM ---
const lienzoMascara = document.getElementById('maskCanvas');
const lienzoCorazones = document.getElementById('heartCanvas');
const ctxMascara = lienzoMascara.getContext('2d');
const ctxCorazones = lienzoCorazones.getContext('2d');

const popupBienvenida = document.getElementById('welcomePopup');
const modalCarta = document.getElementById('letterModal');
const cajaCarta = document.querySelector('.letter-box');
const sobreContenedor = document.getElementById('envelopeWrapper');
const botonesEmoji = document.querySelectorAll('.emoji-btn');

// --- ESTADO ---
let particulas = [];
let estaArrastrando = false;
let audioDesbloqueado = false;
let emojiSeleccionado = 'heart'; 
let yaRevelado = false; 
let contadorRaspado = 0; 
let cartaAbierta = false;
let celebracionEnCurso = false;

// --- PALETA DE COLORES ---
const COLORES = ['#FF0000', '#FF69B4', '#FF1493', '#FFC0CB', '#FFFFFF', '#E31212', '#FF82AB'];

// --- OPTIMIZACIÓN: CACHÉ DE IMÁGENES (CORAZONES Y EMOJIS) ---
const cacheEmojis = {}; // Guardará los lienzos de cada emoji
const cacheCorazones = {}; // Guardará los lienzos de corazones de cada color
const tamanoCache = 64; 

// Pre-renderizar los corazones (uno por cada color)
function generarCacheCorazones() {
    COLORES.forEach(color => {
        const canvaOculto = document.createElement('canvas');
        canvaOculto.width = tamanoCache;
        canvaOculto.height = tamanoCache;
        const c = canvaOculto.getContext('2d');
        
        const s = tamanoCache * 0.6;
        c.translate(tamanoCache/2, tamanoCache/2 - s/2);
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(0, s * 0.3);
        c.bezierCurveTo(0, 0, -s/2, 0, -s/2, s * 0.3);
        c.bezierCurveTo(-s/2, s*0.7, 0, s*0.8, 0, s);
        c.bezierCurveTo(0, s*0.8, s/2, s*0.7, s/2, s*0.3);
        c.bezierCurveTo(s/2, 0, 0, 0, 0, s * 0.3);
        c.fill();
        
        cacheCorazones[color] = canvaOculto;
    });
}

// Pre-renderizar un emoji específico
function actualizarCacheEmoji(emoji) {
    if (emoji === 'heart' || cacheEmojis[emoji]) return;
    
    const canvaOculto = document.createElement('canvas');
    canvaOculto.width = tamanoCache;
    canvaOculto.height = tamanoCache;
    const c = canvaOculto.getContext('2d');
    
    c.font = `${tamanoCache * 0.7}px serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(emoji, tamanoCache / 2, tamanoCache / 2);
    
    cacheEmojis[emoji] = canvaOculto;
}

// --- AUDIO ---
const audioPrincipal = new Audio(URL_SONIDO_CLICK);
const audioExplosion = new Audio(URL_SONIDO_EXPLOSION);

function desbloquearAudio() {
    if (!audioDesbloqueado) {
        audioPrincipal.play().then(() => {
            audioPrincipal.pause();
            audioPrincipal.currentTime = 0;
            audioDesbloqueado = true;
        }).catch(() => {});
    }
}

function hayMusicaDeFondo() {
    const elementosMedia = document.querySelectorAll('#div_clickeable audio, #div_clickeable video');
    for (let media of elementosMedia) {
        if (!media.paused && !media.ended && media.readyState > 2) return true;
    }
    return false;
}

function sonarClick() {
    if (!audioDesbloqueado || cartaAbierta || celebracionEnCurso) return;
    const clonSonido = audioPrincipal.cloneNode();
    clonSonido.volume = hayMusicaDeFondo() ? VOLUMEN_CLICK_BASE * FACTOR_VOLUMEN_REDUCIDO : VOLUMEN_CLICK_BASE;
    clonSonido.play().catch(() => {});
}

function sonarExplosion() {
    if (!audioDesbloqueado) return;
    audioExplosion.volume = hayMusicaDeFondo() ? VOLUMEN_EXPLOSION_BASE * FACTOR_VOLUMEN_REDUCIDO : VOLUMEN_EXPLOSION_BASE;
    audioExplosion.play().catch(() => {});
}

// --- CLASE PARTÍCULA ---
class Particula {
    constructor(x, y, color, tipo, esGranExplosion = false) {
        this.x = x; this.y = y; this.color = color; this.tipo = tipo; this.esGranExplosion = esGranExplosion;
        const fuerza = esGranExplosion ? (15 * VELOCIDAD_CONFETI) : 8;
        this.tamano = Math.random() * TAMANO_BASE_PARTICULA + (TAMANO_BASE_PARTICULA / 2);
        this.velocidadX = (Math.random() - 0.5) * fuerza;
        this.velocidadY = (Math.random() - 0.5) * fuerza - (esGranExplosion ? (10 * VELOCIDAD_CONFETI) : 0); 
        this.gravedad = esGranExplosion ? (0.1 * VELOCIDAD_CONFETI) : 0;
        this.opacidad = 1; this.rotacion = Math.random() * Math.PI * 2;
        this.velocidadRotacion = (Math.random() - 0.5) * 0.2;
    }
    actualizar() {
        this.velocidadY += this.gravedad; this.x += this.velocidadX; this.y += this.velocidadY;
        this.opacidad -= this.esGranExplosion ? DURACION_CONFETI : 0.02;
        this.rotacion += this.velocidadRotacion;
    }
    dibujar() {
        if (this.opacidad <= 0) return;
        ctxCorazones.save(); ctxCorazones.translate(this.x, this.y); ctxCorazones.rotate(this.rotacion); ctxCorazones.globalAlpha = this.opacidad;
        
        const s = this.tamano * 1.5;
        if (this.tipo === 'heart') {
            // OPTIMIZADO: Pegar imagen del corazón ya pintado
            ctxCorazones.drawImage(cacheCorazones[this.color], -s/2, -s/2, s, s);
        } else if (this.tipo === 'emoji') {
            // OPTIMIZADO: Pegar imagen del emoji
            ctxCorazones.drawImage(cacheEmojis[this.tipoEmoji], -s/2, -s/2, s, s);
        } else if (this.tipo === 'confetti') {
            ctxCorazones.fillStyle = this.color; ctxCorazones.fillRect(-this.tamano/2, -this.tamano/4, this.tamano, this.tamano/2);
        } else if (this.tipo === 'sparkle') {
            ctxCorazones.fillStyle = '#FFF'; ctxCorazones.beginPath(); ctxCorazones.arc(0, 0, this.tamano/3, 0, Math.PI*2); ctxCorazones.fill();
        }
        ctxCorazones.restore();
    }
}

// --- GRAN CELEBRACIÓN ---
function dispararGranCelebracion() {
    if (yaRevelado) return;
    yaRevelado = true;
    celebracionEnCurso = true;
    
    lienzoMascara.style.transition = `opacity ${DURACION_DESVANECIMIENTO_NEGRO}s ease`;
    lienzoMascara.style.opacity = '0';
    setTimeout(() => { lienzoMascara.style.display = 'none'; }, DURACION_DESVANECIMIENTO_NEGRO * 1000);

    sonarExplosion();

    for (let i = 0; i < 180; i++) {
        const xI = Math.random() < 0.5 ? 50 : window.innerWidth - 50;
        const yI = window.innerHeight - 50;
        const c = COLORES[Math.floor(Math.random() * COLORES.length)];
        let t = (Math.random() < 0.4) ? (emojiSeleccionado === 'heart' ? 'heart' : 'emoji') : (Math.random() > 0.8 ? 'sparkle' : 'confetti');
        
        const p = new Particula(xI, yI, c, t, true);
        if (t === 'emoji') p.tipoEmoji = emojiSeleccionado;
        particulas.push(p);
    }

    setTimeout(() => {
        sobreContenedor.style.display = 'inline-block';
        setTimeout(() => {
            sobreContenedor.classList.add('mostrar-sobre');
            celebracionEnCurso = false;
        }, 100);
    }, 1200);
}

// --- INTERACCIÓN ---
function manejarInteraccion(x, y) {
    if (cartaAbierta || celebracionEnCurso) return;
    ctxMascara.save();
    ctxMascara.globalCompositeOperation = 'destination-out';
    const deg = ctxMascara.createRadialGradient(x, y, 0, x, y, RADIO_REVELACION);
    deg.addColorStop(0, `rgba(255, 255, 255, ${OPACIDAD_REVELACION})`);
    deg.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctxMascara.fillStyle = deg;
    ctxMascara.beginPath(); ctxMascara.arc(x, y, RADIO_REVELACION, 0, Math.PI * 2); ctxMascara.fill();
    ctxMascara.restore();

    const color = COLORES[Math.floor(Math.random() * COLORES.length)];
    const cant = estaArrastrando ? 4 : 12;
    for (let i = 0; i < cant; i++) {
        const p = new Particula(x, y, color, emojiSeleccionado === 'heart' ? 'heart' : 'emoji');
        p.tipoEmoji = emojiSeleccionado;
        particulas.push(p);
    }

    contadorRaspado++;
    if (contadorRaspado >= META_RASPADO) dispararGranCelebracion();
}

// --- EVENTOS ---
function iniciarAccion(e) {
    if (e.target.closest('button') || e.target.closest('.emoji-btn') || e.target.closest('audio') || e.target.closest('.clickeable')) return;
    if (popupBienvenida.style.display !== 'none' || modalCarta.style.display !== 'none') return;

    estaArrastrando = true;
    desbloquearAudio();
    sonarClick();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    manejarInteraccion(x, y);
}

document.getElementById('closePopup').addEventListener('click', () => {
    desbloquearAudio();
    popupBienvenida.style.opacity = '0';
    setTimeout(() => { popupBienvenida.style.display = 'none'; ajustarPantalla(); }, 500);
});

botonesEmoji.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        botonesEmoji.forEach(b => b.classList.remove('selected'));
        boton.classList.add('selected');
        emojiSeleccionado = boton.getAttribute('data-emoji');
        actualizarCacheEmoji(emojiSeleccionado);
    });
});

sobreContenedor.addEventListener('click', (e) => {
    e.stopPropagation();
    cartaAbierta = true;
    modalCarta.style.display = 'flex';
    cajaCarta.classList.remove('zoom-out');
    setTimeout(() => modalCarta.style.opacity = '1', 10);
});

document.getElementById('closeLetter').addEventListener('click', () => {
    cajaCarta.classList.add('zoom-out');
    modalCarta.style.opacity = '0';
    setTimeout(() => {
        modalCarta.style.display = 'none';
        cartaAbierta = false;
    }, TIEMPO_ZOOM_OUT * 1000);
});

document.getElementById('resetBtn').addEventListener('click', () => location.reload());

function ajustarPantalla() {
    const w = window.innerWidth + 2; const h = window.innerHeight + 2;
    RADIO_REVELACION = window.innerWidth < 600 ? 60 : (window.innerWidth < 1024 ? 80 : 150);
    lienzoMascara.width = lienzoCorazones.width = w; lienzoMascara.height = lienzoCorazones.height = h;
    if (!yaRevelado) { ctxMascara.fillStyle = 'black'; ctxMascara.fillRect(0, 0, w, h); }
}

window.addEventListener('resize', ajustarPantalla);
window.addEventListener('mousedown', iniciarAccion);
window.addEventListener('mousemove', (e) => {
    if (estaArrastrando) {
        manejarInteraccion(e.clientX, e.clientY);
        if (Math.random() > 0.96) sonarClick();
    }
});
window.addEventListener('mouseup', () => estaArrastrando = false);

window.addEventListener('touchstart', (e) => {
    if (e.target.closest('button') || e.target.closest('.emoji-btn') || e.target.closest('audio') || e.target.closest('.clickeable')) return;
    iniciarAccion(e);
    if (e.cancelable) e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (estaArrastrando) {
        const t = e.touches[0];
        manejarInteraccion(t.clientX, t.clientY);
        if (Math.random() > 0.96) sonarClick();
        if (e.cancelable) e.preventDefault();
    }
}, { passive: false });

window.addEventListener('touchend', () => estaArrastrando = false);

function animar() {
    ctxCorazones.clearRect(0, 0, lienzoCorazones.width, lienzoCorazones.height);
    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].actualizar(); particulas[i].dibujar();
        if (particulas[i].opacidad <= 0) particulas.splice(i, 1);
    }
    requestAnimationFrame(animar);
}

// Inicialización
generarCacheCorazones();
ajustarPantalla();
document.querySelector('.content').style.opacity = '1';
actualizarCacheEmoji(emojiSeleccionado);
animar();