// js/precarga.js

async function Ejecutar_Precarga_Global() {
    const msg = document.getElementById('p_Mensaje_Preloader');
    let cargaAbortada = false;

    // 1. CONFIGURAR TIMEOUT (3 MINUTOS)
    const timerTimeout = setTimeout(() => {
        cargaAbortada = true;
        msg.style.color = "red";
        msg.innerHTML = "La carga está tardando demasiado. Es posible que haya un error de conexión o recursos faltantes. Por favor, intenta recargar la página manualmente.";
        // El spinner seguirá girando, pero no se desbloqueará la app.
    }, 180000); 

    try {
        // 2. CARGAR BASE DE DATOS (EXCEL)
        msg.innerHTML = "Sincronizando base de datos musical...";
        await Cargar_Excel_En_Memoria();

        // 3. GENERAR LISTA DE ACTIVOS
        // Notas desde el Excel
        const imagenesNotas = [...new Set(Datos_Excel_Global.map(f => `resources/notas/${f.Imagen}.png`))];
        // Claves
        const claves = ["sol_2", "fa_4", "do_3", "do_4", "do_1", "do_2", "fa_3", "sol_1"].map(c => `resources/claves/${c}.png`);
        // Sistema e Iconos
        const sistema = [
            "img/logo.png", "img/inicio.png", "img/bienvenido.png", "img/clave.png",
            "img/mute.png", "img/unmute.png", "resources/otros/barra.png", "resources/otros/final.png",
            "resources/otros/fondo_juego_nota.png"
        ];
        // Sonidos fijos
        const audiosSistema = ["resources/sonidos_juego/acierto.mp3", "resources/sonidos_juego/error.mp3"];

        const totalActivos = [...imagenesNotas, ...claves, ...sistema, ...audiosSistema];
        let cargados = 0;

        // 4. FUNCIÓN CARGADOR INDIVIDUAL
        const cargarRecurso = (url) => {
            return new Promise((res) => {
                const ext = url.split('.').pop().toLowerCase();
                if (ext === 'mp3') {
                    const a = new Audio();
                    a.src = url;
                    a.oncanplaythrough = () => { G_Activos_Cargados.add(url); res(); };
                    a.onerror = res; // Ignoramos errores para no trabar la app
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

        // 5. EJECUCIÓN MASIVA
        await Promise.all(totalActivos.map(url => cargarRecurso(url)));

        // 6. FINALIZACIÓN (Solo si no hubo timeout)
        if (!cargaAbortada) {
            clearTimeout(timerTimeout); // Cancelamos el reloj de 3 min
            msg.innerHTML = "¡Todo listo!";
            
            setTimeout(() => {
                document.getElementById('div_Preloader_Global').classList.add('oculto');
                const mainApp = document.getElementById('main_app');
                mainApp.style.opacity = "1";
                mainApp.classList.add('efecto-entrada');
                
                // DESPERTAR NAVEGACIÓN
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

// Arrancamos el motor de precarga al cargar el script
Ejecutar_Precarga_Global();