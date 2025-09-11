const mensajeTextarea = document.getElementById('mensaje');
const iniciarCompararBtn = document.getElementById('iniciarComparar');
const imagenesMensajeDiv = document.getElementById('imagenesMensaje');
const claveSolBtn = document.getElementById('claveSolBtn');
const claveFaBtn = document.getElementById('claveFaBtn');
const OcultarVerMensajeCheckbox = document.getElementById('ocultarMensaje');

let mensajeOriginal = "";
let mensajeOriginalPopup = "";
let modo = "inicio";
let popupTexto = null;
let popupVisible = false;
let primeraLetraEscrita = false;
let claveSeleccionada = "sol";

// Nueva variable para almacenar los datos del Excel
let excelData = null;

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

            // Buscar la letra en el Excel
            if (excelData) {
                const clave = claveSeleccionada === "sol" ? "LetraSol" : "LetraFa";
                const fila = excelData.find(row => row[clave] === letraNormalizada);

                if (fila) {
                    nombreImagen = fila.Imagen + ".png";
                } else {
                    console.warn(`No se encontró la letra '${letraNormalizada}' en el Excel para la clave '${claveSeleccionada}'.`);
                    // Puedes poner una imagen por defecto aca si quieres
                }
            } else {
                console.warn("Los datos del Excel no se han cargado todavía.");
            }
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

document.addEventListener('DOMContentLoaded', function () {
    mensajeTextarea.focus();

    claveSolBtn.classList.add('active');
    claveFaBtn.classList.remove('active');

    generarImagenes("");

    // Leer el archivo Excel
    fetch('img/notas.xlsx')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir la hoja de cálculo en un array de objetos
            excelData = XLSX.utils.sheet_to_json(worksheet);
            console.log("Datos del Excel cargados:", excelData);

            // Opcional: Puedes llamar a generarImagenes("") aquí para que se generen
            // las imágenes iniciales después de que se carguen los datos del Excel.
            // generarImagenes("");

        })
        .catch(error => console.error("Error al leer el archivo Excel:", error));
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
    }, 500); // 1000 milisegundos = 1 segundo
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


















// Obtener referencia al elemento de la imagen
const animacionImagen = document.getElementById('Animacion');

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
