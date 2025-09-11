const mensajeTextarea = document.getElementById('mensaje');
const iniciarCompararBtn = document.getElementById('iniciarComparar');
const imagenesMensajeDiv = document.getElementById('imagenesMensaje');
const claveSolBtn = document.getElementById('claveSolBtn');
const claveFaBtn = document.getElementById('claveFaBtn');
const OcultarVerMensajeCheckbox = document.getElementById('ocultarMensaje');
const animacionImagen = document.getElementById('Animacion'); // Referencia a la imagen de animación

let mensajeOriginal = "";
let mensajeOriginalPopup = "";
let modo = "inicio";
let popupTexto = null;
let popupVisible = false;
let primeraLetraEscrita = false;
let claveSeleccionada = "sol";

// Función para normalizar el texto (eliminar tildes y convertir a minúsculas)
function normalizarTexto(texto) {
    let textoNormalizado = "";
    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];
        if (caracter === "ñ" || caracter === "Ñ") {
            textoNormalizado += caracter.toUpperCase();
        } else {
            textoNormalizado += caracter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        }
    }
    textoNormalizado = textoNormalizado.trim();
    return textoNormalizado;
}

// Datos de las notas (formato columnar)
const datosNotas = {
    Imagen: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    ClaveSol: ["Do3", "Re3", "Mi3", "Fa3", "Sol3", "La3", "Si3", "Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5", "Re5", "Mi5", "Fa5", "Sol5", "La5", "Si5", "Do6", "Re6", "Mi6", "Fa6", "Sol6", "La6"],
    LetraSol: ["W", "X", "J", "F", "Y", "V", "P", "M", "C", "L", "N", "R", "A", "E", "O", "S", "I", "D", "T", "U", "B", "G", "Q", "H", "Z", "K"],
    ClaveFa: ["Mi1", "Fa1", "Sol1", "La1", "Si1", "Do2", "Re2", "Mi2", "Fa2", "Sol2", "La2", "Si2", "Do3", "Re3", "Mi3", "Fa3", "Sol3", "La3", "Si3", "Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5"],
    LetraFa: ["K", "Ñ", "Z", "H", "Q", "G", "B", "U", "T", "D", "I", "S", "O", "E", "A", "R", "N", "L", "C", "M", "P", "V", "Y", "F", "J", "X", "W"]
};

function generarImagenParaLetra(letra, clave) {
    // Normalizar la letra (eliminar tildes y convertir a mayúsculas)
    const letraNormalizada = normalizarTexto(letra);

    // Encontrar el índice de la letra en el array correspondiente a la clave
    const indice = datosNotas[`Letra${clave}`].indexOf(letraNormalizada);

    if (indice !== -1) {
        // Se encontró la letra
        const imagenId = datosNotas.Imagen[indice]; // Obtener el ID de la imagen
        const nombreImagen = imagenId + ".png"; // Construir el nombre del archivo de imagen
        return nombreImagen;
    } else {
        // No se encontró la letra
        console.warn(`No se encontró la letra '${letraNormalizada}' en la clave '${clave}'.`);
        return null; // O una imagen por defecto
    }
}

function generarImagenes(texto) {
    imagenesMensajeDiv.innerHTML = "";

    const imgClave = document.createElement('img');
    imgClave.src = "img/" + claveSeleccionada + ".png";
    imagenesMensajeDiv.appendChild(imgClave);

    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];
        let nombreImagen = "";

        if (caracter === ' ') {
            const imgEspacio = document.createElement('img');
            imgEspacio.src = "img/espacio.png";
            imagenesMensajeDiv.appendChild(imgEspacio);
        } else if (caracter === '\n') {
            const imgSalto = document.createElement('img');
            imgSalto.src = "img/salto.png";
            imagenesMensajeDiv.appendChild(imgSalto);

            const br = document.createElement('br');
            imagenesMensajeDiv.appendChild(br);
            continue;
        } else {
            // Normalizar solo las letras antes de buscar la imagen
            const letraNormalizada = normalizarTexto(caracter);

            // Buscar la letra en los datos
            nombreImagen = generarImagenParaLetra(letraNormalizada, claveSeleccionada);
            console.log(`Letra: ${letraNormalizada}, Clave: ${claveSeleccionada}, Nombre Imagen: ${nombreImagen}`); // Agregado para depurar
        }

        if (nombreImagen) {
            const img = document.createElement('img');
            img.src = "img/notas/" + nombreImagen;
            imagenesMensajeDiv.appendChild(img);
        }
    }

    const imgFinal = document.createElement('img');
    imgFinal.src = "img/final.png";
    imagenesMensajeDiv.appendChild(imgFinal);
}

function limpiarImagenes() {
    let imagenes = imagenesMensajeDiv.getElementsByTagName('img');
    let imagenesArray = Array.from(imagenes);

    let i = imagenesArray.length - 2;

    while (i >= 0) {
        let imagen = imagenesArray[i];
        let src = imagen.src;

        if (src.includes("espacio.png")) {
            imagenesMensajeDiv.removeChild(imagen);
            imagenesArray.splice(i, 1);
        } else if (src.includes("salto.png")) {
            if (mensajeTextarea.value.endsWith('\n')) {
                mensajeTextarea.value = mensajeTextarea.value.slice(0, -1);
                generarImagenes(mensajeTextarea.value);
                return;
            }

            imagenesMensajeDiv.removeChild(imagen);
            imagenesArray.splice(i, 1);

            if (imagenesMensajeDiv.childNodes[i + 1] && imagenesMensajeDiv.childNodes[i + 1].tagName === 'BR') {
                imagenesMensajeDiv.removeChild(imagenesMensajeDiv.childNodes[i + 1]);
            }
        } else {
            break;
        }
        i--;
    }
}

function reiniciarJuego() {
    mensajeTextarea.value = "";
    mensajeTextarea.disabled = false;
    iniciarCompararBtn.textContent = "Iniciar";
    modo = "inicio";
    mensajeOriginal = "";
    primeraLetraEscrita = false;
    claveSeleccionada = "sol";

    if (popupTexto) {
        popupTexto.style.display = 'none';
        popupTexto.textContent = "";
        popupVisible = false;
    }

    mensajeTextarea.focus();
    mensajeTextarea.placeholder = "Escribe tu mensaje aquí...";

    claveSolBtn.classList.add('active');
    claveFaBtn.classList.remove('active');

    generarImagenes("");
    
    //mensajeTextarea.style.color = "white";

    claveSolBtn.disabled = false;
    claveFaBtn.disabled = false;
}

iniciarCompararBtn.addEventListener('click', function () {
    if (modo === "inicio") {
        if (mensajeTextarea.value.trim() === "") {
            //alert("Escriba al menos una letra para continuar");
            mostrarPopupAviso("Escriba al menos una letra para continuar", mensajeTextarea)
            mensajeTextarea.focus();
            return;
        }

        limpiarImagenes();
        mensajeOriginal = normalizarTexto(mensajeTextarea.value);

        mensajeTextarea.value = "";
        mensajeTextarea.disabled = false;

        iniciarCompararBtn.textContent = "Comparar";
        modo = "comparar";

        mensajeTextarea.placeholder = "Escribe la respuesta aquí...";
        mensajeTextarea.focus();
        //mensajeTextarea.style.color = "black";

        claveSolBtn.disabled = true;
        claveFaBtn.disabled = true;
        
        OcultarVerMensajeCheckbox.checked = false;
        mensajeTextarea.style.fontFamily = 'sans-serif';

    } else {
        const respuesta = normalizarTexto(mensajeTextarea.value);
        if (respuesta === mensajeOriginal) {
            //alert("¡Lo lograste! Se reiniciará el juego");
            mostrarPopupGanar("¡Lo lograste! Se reiniciará el juego", mensajeTextarea)
            reiniciarJuego();
            
            OcultarVerMensajeCheckbox.checked = false;
            mensajeTextarea.style.fontFamily = 'sans-serif';

        } else {
            //alert("Inténtalo de nuevo.");
            mostrarPopupPerder("Inténtalo de nuevo", mensajeTextarea)
            mensajeTextarea.focus();
        }
    }
});

mensajeTextarea.addEventListener('input', function (event) {
    let texto = mensajeTextarea.value;
    let textoFiltrado = "";
    let imagenes = imagenesMensajeDiv.getElementsByTagName('img');
    let imagenesArray = Array.from(imagenes);

    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];

        if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\n]/.test(caracter)) {
            if (textoFiltrado.split('\n').pop().length === 0 && (caracter === ' ' || caracter === '\n')) {
                continue;
            } else {
                if ((textoFiltrado.slice(-1) === ' ' && caracter === ' ') ||
                    (textoFiltrado.slice(-1) === '\n' && caracter === '\n')) {
                    continue;
                } else {
                    textoFiltrado += caracter;
                }
            }
        }
    }

    if (textoFiltrado.endsWith(' \n')) {
        textoFiltrado = textoFiltrado.slice(0, -2) + '\n';

        if (imagenesArray.length > 0) {
            let ultimaImagen = imagenesArray[imagenesArray.length - 1];
            if (ultimaImagen.src.includes("espacio.png")) {
                imagenesMensajeDiv.removeChild(ultimaImagen);
                imagenesArray.pop();
            }
        }
    }

    textoFiltrado = textoFiltrado.substring(0, 100);

    mensajeTextarea.style.height = 'auto';
    mensajeTextarea.style.height = mensajeTextarea.scrollHeight + 'px';

    if (texto !== textoFiltrado) {
        mensajeTextarea.value = textoFiltrado;
        mensajeTextarea.selectionStart = mensajeTextarea.selectionEnd = textoFiltrado.length;
    }

    if (modo === "inicio") {
        generarImagenes(textoFiltrado);
        
        
        
        mensajeOriginalPopup = mensajeTextarea.value
    }
    
    
    
    
    popupTexto.textContent = "MODO DE TESTEO:" + "\n" + "\n" + mensajeOriginalPopup;
});

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();

        if (!popupTexto) {
            popupTexto = document.createElement('pre');
            popupTexto.id = 'popupTexto';
            document.body.appendChild(popupTexto);
        }

        if (modo === "inicio") {
            //mensajeOriginal = normalizarTexto(mensajeTextarea.value);
            mensajeOriginalPopup = mensajeTextarea.value
        }

        popupVisible = !popupVisible;
        popupTexto.style.display = popupVisible ? 'block' : 'none';

        //popupTexto.textContent = normalizarTexto(mensajeOriginal);
         popupTexto.textContent = "MODO DE TESTEO:" + "\n" + "\n" + mensajeOriginalPopup;
    }
});

claveSolBtn.addEventListener('click', function () {
    claveSeleccionada = "sol";
    claveSolBtn.classList.add('active');
    claveFaBtn.classList.remove('active');
    if (modo === "inicio") {
        generarImagenes(mensajeTextarea.value);
    }
    mensajeTextarea.focus();
});

claveFaBtn.addEventListener('click', function () {
    claveSeleccionada = "fa";
    claveFaBtn.classList.add('active');
    claveSolBtn.classList.remove('active');
    if (modo === "inicio") {
        generarImagenes(mensajeTextarea.value);
    }
    mensajeTextarea.focus();
});

// Datos de las notas (formato columnar)
const datosNotas = {
    Imagen: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    ClaveSol: ["Do3", "Re3", "Mi3", "Fa3", "Sol3", "La3", "Si3", "Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5", "Re5", "Mi5", "Fa5", "Sol5", "La5", "Si5", "Do6", "Re6", "Mi6", "Fa6", "Sol6", "La6"],
    LetraSol: ["W", "X", "J", "F", "Y", "V", "P", "M", "C", "L", "N", "R", "A", "E", "O", "S", "I", "D", "T", "U", "B", "G", "Q", "H", "Z", "K"],
    ClaveFa: ["Mi1", "Fa1", "Sol1", "La1", "Si1", "Do2", "Re2", "Mi2", "Fa2", "Sol2", "La2", "Si2", "Do3", "Re3", "Mi3", "Fa3", "Sol3", "La3", "Si3", "Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5"],
    LetraFa: ["K", "Ñ", "Z", "H", "Q", "G", "B", "U", "T", "D", "I", "S", "O", "E", "A", "R", "N", "L", "C", "M", "P", "V", "Y", "F", "J", "X", "W"]
};

function generarImagenParaLetra(letra, clave) {
    // Normalizar la letra (eliminar tildes y convertir a mayúsculas)
    const letraNormalizada = normalizarTexto(letra);

    // Encontrar el índice de la letra en el array correspondiente a la clave
    const indice = datosNotas[`Letra${clave}`].indexOf(letraNormalizada);

    if (indice !== -1) {
        // Se encontró la letra
        const imagenId = datosNotas.Imagen[indice]; // Obtener el ID de la imagen
        const nombreImagen = imagenId + ".png"; // Construir el nombre del archivo de imagen
        return nombreImagen;
    } else {
        // No se encontró la letra
        console.warn(`No se encontró la letra '${letraNormalizada}' en la clave '${clave}'.`);
        return null; // O una imagen por defecto
    }
}

document.addEventListener('DOMContentLoaded', function() {
    OcultarVerMensajeCheckbox.addEventListener('change', function() {
        enmascararTexto();
        mensajeTextarea.focus();
    });

    function enmascararTexto() {
        if (OcultarVerMensajeCheckbox.checked) {
            // Aplicar la fuente Redacted Script
            mensajeTextarea.style.fontFamily = 'Redacted Script, sans-serif';
        } else {
            // Restaurar la fuente original (sans-serif por defecto)
            mensajeTextarea.style.fontFamily = 'sans-serif'; // O la fuente que usabas antes
        }
});

// Obtener referencias a los elementos del pop-up
const popupContainer = document.getElementById('popupContainer');
const popupImage = document.getElementById('popupImage');
const popupText = document.getElementById('popupText');
const popupAceptar = document.getElementById('popupAceptar');

// Función para mostrar el pop-up
function mostrarPopup(imagenSrc, texto, elementoParaFoco) {
    popupImage.src = "img/neutral.png"; // Establecer imagen inicial
    popupText.textContent = texto;
    popupContainer.style.display = 'flex'; // Usamos 'flex' para activar el display
    popupAceptar.focusElement = elementoParaFoco; // Guarda el elemento para enfocar en el botón

    // Cambiar la fuente de la imagen después de 1 segundo
    setTimeout(() => {
        popupImage.src = "img/" + imagenSrc;
    }, 1000); // 1000 milisegundos = 1 segundo
}

// Funciones específicas para cada tipo de pop-up
function mostrarPopupAviso(texto, elementoParaFoco) {
    mostrarPopup("aviso.png", texto, elementoParaFoco);
}

function mostrarPopupGanar(texto, elementoParaFoco) {
    mostrarPopup("ganar.png", texto, elementoParaFoco);
}

function mostrarPopupPerder(texto, elementoParaFoco) {
    mostrarPopup("perder.png", texto, elementoParaFoco);
}

// Evento para cerrar el pop-up al hacer clic en "Aceptar"
popupAceptar.addEventListener('click', function() {
    popupContainer.style.display = 'none';
    if (this.focusElement) {
        this.focusElement.focus(); // Restaurar el foco al elemento original
    }
});

// Evento para cerrar el pop-up con la tecla "Enter"
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && popupContainer.style.display === 'flex') {
        popupAceptar.click(); // Simula un clic en el botón "Aceptar"
        event.preventDefault(); // Evita el comportamiento predeterminado del "Enter" (ej: en forms)
    }
});

// Variables para las animaciones
let animacionActiva = null; // 'escribiendo' o 'pensando'
let frame = 1;
let timeoutId;

// Funciones para las animaciones
function animar(tipo) {
    animacionActiva = tipo;
    clearInterval(animacionImagen.intervalId); // Limpiar cualquier intervalo anterior
    frame = 1;
    animacionImagen.src = `img/${tipo}/${frame}.png`;

    animacionImagen.intervalId = setInterval(() => {
        frame++;
        if (frame > 3) {
            frame = 1;
        }
        animacionImagen.src = `img/${tipo}/${frame}.png`;
    }, 1000);
}

// Función para activar la animación "pensando"
function activarPensando() {
    animar('pensando');
}

// Función para detectar inactividad
function detectarInactividad() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        activarPensando();
    }, 3000); // 3 segundos
}

// Evento para detectar la actividad del teclado
document.addEventListener('keydown', () => {
    if (animacionActiva !== 'escribiendo') {
        animar('escribiendo');
    }
    detectarInactividad();
});

// Inicialización
animacionImagen.src = "img/0.png";
detectarInactividad(); // Iniciar la detección de inactividad al cargar la página

    mensajeTextarea.focus();

    claveSolBtn.classList.add('active');
    claveFaBtn.classList.remove('active');

    generarImagenes("");
    // Inicialización de la animación
    animacionImagen.src = "img/0.png";
    detectarInactividad(); // Iniciar la detección de inactividad al cargar la página
});