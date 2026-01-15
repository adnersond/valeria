// js/precarga.js

/*async function Ejecutar_Precarga_Global() {
    const msg = document.getElementById('p_Mensaje_Preloader');
    let cargaAbortada = false;

    const timerTimeout = setTimeout(() => {
        cargaAbortada = true;
        msg.style.color = "red";
        msg.innerHTML = "La carga está tardando demasiado. Es posible que haya un error de conexión o recursos faltantes. Por favor, intenta recargar la página manualmente.";
    }, 180000); 

    try {
        msg.innerHTML = "Sincronizando base de datos musical...";
        await Cargar_Excel_En_Memoria();

        const imagenesNotas = [...new Set(Datos_Excel_Global.map(f => `resources/notas/${f.Imagen}.png`))];
        const claves = ["sol_2", "fa_4", "do_3", "do_4", "do_1", "do_2", "fa_3", "sol_1"].map(c => `resources/claves/${c}.png`);
        const sistema = [
            "img/logo.png", "img/inicio.png", "img/bienvenido.png", "img/clave.png",
            "img/mute.png", "img/unmute.png", "resources/otros/barra.png", "resources/otros/final.png",
            "resources/otros/fondo_juego_nota.png"
        ];
        const audiosSistema = ["resources/sonidos_juego/acierto.mp3", "resources/sonidos_juego/error.mp3"];

        const totalActivos = [...imagenesNotas, ...claves, ...sistema, ...audiosSistema];
        let cargados = 0;

        // --- FUNCIÓN CARGADOR CORREGIDA PARA iOS ---
        const cargarRecurso = (url) => {
            return new Promise((res) => {
                const ext = url.split('.').pop().toLowerCase();
                
                if (ext === 'mp3') {
                    // Usamos fetch en lugar de new Audio() para evitar bloqueos de iOS
                    fetch(url)
                        .then(response => {
                            if (response.ok) G_Activos_Cargados.add(url);
                            res();
                        })
                        .catch(() => res()); // Si falla, saltamos para no trabar
                } else {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => { G_Activos_Cargados.add(url); res(); };
                    img.onerror = res;
                }
            }).then(() => {
                if (!cargaAbortada) {
                    cargados++;
                    const porc = Math.round((cargados / totalActivos.length) * 100);
                    msg.innerHTML = `Preparando recursos... ${porc}%`;
                }
            });
        };

        await Promise.all(totalActivos.map(url => cargarRecurso(url)));

        if (!cargaAbortada) {
            clearTimeout(timerTimeout);
            msg.innerHTML = "¡Todo listo!";
            
            setTimeout(() => {
                document.getElementById('div_Preloader_Global').classList.add('oculto');
                const mainApp = document.getElementById('main_app');
                mainApp.style.opacity = "1";
                mainApp.classList.add('efecto-entrada');
                Gestionar_Navegacion_URL();
            }, 600);
        }

    } catch (e) {
        if (!cargaAbortada) {
            msg.innerHTML = "Error crítico al iniciar. Por favor intenta recargar.";
            console.error(e);
        }
    }
}

Ejecutar_Precarga_Global();*/



async function Ejecutar_Precarga_Global() {
    const msg = document.getElementById('p_Mensaje_Preloader');
    const preloaderDiv = document.getElementById('div_Preloader_Global');
    const mainApp = document.getElementById('main_app');
    
    let cargaAbortada = false;
    const tiempoInicio = Date.now(); // 1. Iniciamos el cronómetro de rendimiento

    // CONFIGURAR TIMEOUT (3 MINUTOS)
    const timerTimeout = setTimeout(() => {
        cargaAbortada = true;
        msg.style.color = "red";
        msg.innerHTML = "La carga está tardando demasiado. Por favor, intenta recargar la página manualmente.";
    }, 180000); 

    try {
        // 2. CARGAR BASE DE DATOS (EXCEL)
        msg.innerHTML = "Sincronizando base de datos musical...";
        await Cargar_Excel_En_Memoria();

        // 3. GENERAR LISTA DE ACTIVOS
        const imagenesNotas = [...new Set(Datos_Excel_Global.map(f => `resources/notas/${f.Imagen}.png`))];
        const claves = ["sol_2", "fa_4", "do_3", "do_4", "do_1", "do_2", "fa_3", "sol_1"].map(c => `resources/claves/${c}.png`);
        const sistema = [
            "img/logo.png", "img/inicio.png", "img/bienvenido.png", "img/clave.png",
            "img/mute.png", "img/unmute.png", "resources/otros/barra.png", "resources/otros/final.png",
            "resources/otros/fondo_juego_nota.png"
        ];
        const audiosSistema = [/*"resources/sonidos_juego/acierto.mp3", "resources/sonidos_juego/error.mp3"*/];

        const totalActivos = [...imagenesNotas, ...claves, ...sistema, ...audiosSistema];
        let cargados = 0;

        // 4. FUNCIÓN CARGADOR INDIVIDUAL (Optimizado para iOS y Caché)
        const cargarRecurso = (url) => {
            return new Promise((res) => {
                // Usamos FETCH para todo: es más preciso para medir tiempo de caché y seguro para audio en iPhone
                fetch(url)
                    .then(response => {
                        if (response.ok) G_Activos_Cargados.add(url);
                        res();
                    })
                    .catch(() => res()); // Ignoramos errores para no trabar
            }).then(() => {
                if (!cargaAbortada) {
                    cargados++;
                    const porc = Math.round((cargados / totalActivos.length) * 100);
                    msg.innerHTML = `Preparando recursos... ${porc}%`;
                }
            });
        };

        // 5. EJECUCIÓN MASIVA
        await Promise.all(totalActivos.map(url => cargarRecurso(url)));

        // --- LÓGICA DE INTELIGENCIA DE CACHÉ ---
        const tiempoCargaTotal = Date.now() - tiempoInicio;
        
        // Si tardó menos de 500ms, los archivos estaban en Caché. 
        // Si tardó más, es una descarga real de internet.
        let esperaVisual = 0;
        if (tiempoCargaTotal > 500) {
            // Es descarga real: Aseguramos que el popup se vea al menos 3 segundos para suavidad
            esperaVisual = Math.max(0, 3000 - tiempoCargaTotal);
        } else {
            // Es Caché: No esperamos nada, vamos directo a la App
            esperaVisual = 0;
            console.log("🚀 Carga instantánea desde caché.");
        }

        if (!cargaAbortada) {
            clearTimeout(timerTimeout);
            
            setTimeout(() => {
                preloaderDiv.classList.add('oculto');
                mainApp.style.opacity = "1";
                mainApp.classList.add('efecto-entrada');
                
                // DESPERTAR NAVEGACIÓN
                Gestionar_Navegacion_URL();
            }, esperaVisual);
        }

    } catch (e) {
        if (!cargaAbortada) {
            msg.innerHTML = "Error crítico al iniciar. Por favor intenta recargar.";
            console.error(e);
        }
    }
}

// Arrancamos el motor de precarga
Ejecutar_Precarga_Global();
