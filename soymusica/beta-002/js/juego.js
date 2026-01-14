//////////////////////////////////////////////////////
//                                                  //
//         SISTEMA E INICIALIZACIÓN                 //
//                                                  //
//////////////////////////////////////////////////////
function Bloquear_Recarga_Pagina(event) {
    if (G_Partida_En_Curso) {
        event.preventDefault();
        event.returnValue = ""; 
    }
}
window.addEventListener('beforeunload', Bloquear_Recarga_Pagina);

function Desbloquear_Audio_Navegador() {
    const audioSilencioso = new Audio();
    audioSilencioso.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    
    audioSilencioso.play().then(() => {
        console.log("Audio desbloqueado por el usuario.");
        window.removeEventListener('click', Desbloquear_Audio_Navegador);
        window.removeEventListener('keydown', Desbloquear_Audio_Navegador);
    }).catch(error => {
        console.warn("El audio aún no ha sido interactuado.");
    });
}

window.addEventListener('click', Desbloquear_Audio_Navegador);
window.addEventListener('keydown', Desbloquear_Audio_Navegador);


//////////////////////////////////////////////////////
//                                                  //
//         VARIABLES DE CONFIGURACIÓN               //
//                                                  //
//////////////////////////////////////////////////////
const MSJ_JUEGO = {
    ERROR_CARGA: "Ha ocurrido un error al cargar el juego, por favor vuelva a ingresar.",
    FIN_100: "¡Felicidades! Has completado el nivel con éxito. Puedes empezar a practicar el siguiente nivel.",
    FIN_MEDIO: "¡Buen trabajo! Pero tienes que lograr el 100% para pasar al siguiente nivel. Continúa practicando.",
    FIN_MAL: "Estás haciéndolo bien. Continúa practicando. La constancia hace al maestro.",
    TODO_COMPLETO: "¡Felicidades! Has completado todos los niveles. Si deseas ahora puedes ingresar desde el Modo Desafío."
};

const TIEMPO_ESPERA_MAX_CARGA = 180000; 
const TIEMPO_MIN_POPUP_CARGA = 3000;    
const INTERVALO_SIGUIENTE_PREGUNTA = 1000; 

const RUTA_NOTAS_IMG = "resources/notas/";
const RUTA_NOTAS_AUDIO = "resources/notas/sonidos_notas/";
const RUTA_CLAVES_IMG = "resources/claves/";
const RUTA_OTROS_IMG = "resources/otros/";
const RUTA_OTROS_AUDIO = "resources/sonidos_juego/";

const CANTIDAD_MINIMA_PREGUNTAS_M_APRENDIZAJE = 10;
const AUMENTO_PREGUNTAS_POR_NIVEL = 10;
const CANTIDAD_MAXIMA_PREGUNTAS_M_DESAFIO = 100;

const PROB_LVL1 = 0.50;      
const PROB_LVL2 = 0.34;      
const PROB_LVL3_MAS = 0.30;  

const MAX_REPETICIONES_NOTA = 2; 


//////////////////////////////////////////////////////
//                                                  //
//         VARIABLES DE ESTADO (GLOBALES)           //
//                                                  //
//////////////////////////////////////////////////////
let Preguntas_Totales = 0;
let Pregunta_Actual = 1;
let Contador_Aciertos = 0;
let Contador_Errores = 0;
let Sonido_Muteado = false; 

let Timer_Dificultad = 4000;
let Tiempo_Restante = 0;
let Intervalo_Juego_Barra = null;
let Intervalo_Cuenta_Regresiva = null; // Nuevo: Para control estricto de la pausa
let Juego_Pausado = false;

let G_Claves_Seleccionadas = [];
let G_Notas_Filtradas = [];
let G_Historial_Notas = [];
let G_Notas_Vistas_Garantia = new Set();

let Audio_Nota_Actual = null;
let Turnos_Clave_Actual = 0;
let Clave_En_Ronda = "";
let Nota_Correcta_Nombre = "";
let G_Nivel_Actual = 1;

let G_Ultima_Posicion_Correcta = -1; 
let G_Repeticiones_Posicion = 0;    

let G_Activos_Cargados = new Set(); 
let G_Sonidos_Cargados_Notas = 0;
let G_Sonidos_Cargados_Juego = 0;
let G_Total_Esperado_Notas = 0;
let G_Total_Esperado_Juego = 0;

let G_Carga_En_Progreso = false;

let Timeout_Siguiente_Pregunta = null; // Nueva variable global

//////////////////////////////////////////////////////
//                                                  //
//         LOGICA DE CARGA Y PREPARACIÓN            //
//                                                  //
//////////////////////////////////////////////////////
/*async function Ejecutar_Precarga_Activos() {
    G_Carga_En_Progreso = true;
    p_Popup_Carga_Mensaje.innerHTML = "Preparando partituras y sonidos...";
    
    const imagenesParaCargar = [];
    const sonidosParaCargar = [];
    const llavesExcel = Object.keys(Datos_Excel_Global[0]);

    const setNotasEsperadas = new Set();
    const setJuegoEsperado = new Set();

    G_Notas_Filtradas.forEach(n => {
        const imgPath = RUTA_NOTAS_IMG + n.Imagen + ".png";
        if (!G_Activos_Cargados.has(imgPath)) imagenesParaCargar.push(imgPath);

        G_Claves_Seleccionadas.forEach(c => {
            const colNota = llavesExcel.find(k => k.toLowerCase().trim() === ("Nota_" + c).toLowerCase());
            if (n[colNota]) {
                const nombreFormateado = Obtener_Nombre_Formateado_Para_Sonido_De_Nota(n[colNota]);
                const audioPath = RUTA_NOTAS_AUDIO + nombreFormateado + ".mp3";
                setNotasEsperadas.add(audioPath);
            }
        });
    });

    const fijos = [
        { url: RUTA_OTROS_IMG + 'barra.png', tipo: 'img' },
        { url: RUTA_OTROS_IMG + 'final.png', tipo: 'img' },
        { url: RUTA_OTROS_AUDIO + 'acierto.mp3', tipo: 'audio' },
        { url: RUTA_OTROS_AUDIO + 'error.mp3', tipo: 'audio' }
    ];

    fijos.forEach(item => {
        if (item.tipo === 'audio') setJuegoEsperado.add(item.url);
        else if (item.tipo === 'img' && !G_Activos_Cargados.has(item.url)) imagenesParaCargar.push(item.url);
    });

    G_Sonidos_Cargados_Notas = 0;
    G_Sonidos_Cargados_Juego = 0;

    setNotasEsperadas.forEach(url => {
        if (G_Activos_Cargados.has(url)) G_Sonidos_Cargados_Notas++;
        else sonidosParaCargar.push(url);
    });

    setJuegoEsperado.forEach(url => {
        if (G_Activos_Cargados.has(url)) G_Sonidos_Cargados_Juego++;
        else sonidosParaCargar.push(url);
    });

    G_Total_Esperado_Notas = setNotasEsperadas.size;
    G_Total_Esperado_Juego = setJuegoEsperado.size;

    const promesas = [
        ...imagenesParaCargar.map(url => new Promise(res => {
            const img = new Image(); img.src = url;
            img.onload = () => { G_Activos_Cargados.add(url); res(); };
            img.onerror = res; 
        })),
        ...sonidosParaCargar.map(url => new Promise(res => {
            const audio = new Audio();
            audio.src = url;
            audio.oncanplaythrough = () => { 
                G_Activos_Cargados.add(url); 
                if (url.includes(RUTA_NOTAS_AUDIO)) G_Sonidos_Cargados_Notas++;
                else if (url.includes(RUTA_OTROS_AUDIO)) G_Sonidos_Cargados_Juego++;
                res(); 
            };
            audio.onerror = () => {
                console.error("❌ Error al cargar archivo de audio:", url);
                res();
            };
        }))
    ];

    await Promise.all([Promise.all(promesas), new Promise(res => setTimeout(res, TIEMPO_MIN_POPUP_CARGA))]);

    // Pausa el flujo si el usuario presionó Escape durante la carga
    while (Juego_Pausado) {
        await new Promise(res => setTimeout(res, 500));
    }

    console.log(`📊 Notas: ${G_Sonidos_Cargados_Notas}/${G_Total_Esperado_Notas} | Juego: ${G_Sonidos_Cargados_Juego}/${G_Total_Esperado_Juego}`);

    const notasCompletas = G_Sonidos_Cargados_Notas === G_Total_Esperado_Notas && G_Total_Esperado_Notas > 0;
    const juegoCompleto = G_Sonidos_Cargados_Juego === G_Total_Esperado_Juego && G_Total_Esperado_Juego > 0;

    if (notasCompletas || juegoCompleto) {
        btn_Sonido.disabled = false;
        if (Sonido_Muteado) { btn_Sonido.classList.add('mute'); btn_Sonido.classList.remove('unmute'); }
        else { btn_Sonido.classList.add('unmute'); btn_Sonido.classList.remove('mute'); }
    } else {
        Sonido_Muteado = true;
        btn_Sonido.classList.add('mute');
        btn_Sonido.disabled = true;
    }

    div_Popup_Carga.classList.add('oculto');
    G_Carga_En_Progreso = false;
    Lanzar_Cuenta_Regresiva();
}*/
async function Ejecutar_Precarga_Activos() {
    G_Carga_En_Progreso = true;
    p_Popup_Carga_Mensaje.innerHTML = "Preparando partituras y sonidos...";
    
    const urlsParaCargar = [];
    const llavesExcel = Object.keys(Datos_Excel_Global[0]);

    // 1. DETERMINAR TOTALES ESPERADOS (Resetear contadores)
    const setNotasTotal = new Set();
    const setJuegoTotal = new Set();

    G_Notas_Filtradas.forEach(n => {
        G_Claves_Seleccionadas.forEach(c => {
            const colNota = llavesExcel.find(k => k.toLowerCase().trim() === ("Nota_" + c).toLowerCase());
            if (n[colNota]) {
                const nombreFormateado = Obtener_Nombre_Formateado_Para_Sonido_De_Nota(n[colNota]);
                setNotasTotal.add(RUTA_NOTAS_AUDIO + nombreFormateado + ".mp3");
            }
        });
    });

    setJuegoTotal.add(RUTA_OTROS_AUDIO + 'acierto.mp3');
    setJuegoTotal.add(RUTA_OTROS_AUDIO + 'error.mp3');

    G_Total_Esperado_Notas = setNotasTotal.size;
    G_Total_Esperado_Juego = setJuegoTotal.size;
    G_Sonidos_Cargados_Notas = 0;
    G_Sonidos_Cargados_Juego = 0;

    // 2. IDENTIFICAR QUÉ DESCARGAR Y QUÉ CONTAR YA COMO CARGADO
    const imagenesParaBajar = [];
    const audiosParaBajar = [];

    // Notas (Sonido)
    setNotasTotal.forEach(url => {
        if (G_Activos_Cargados.has(url)) G_Sonidos_Cargados_Notas++;
        else audiosParaBajar.push({ url, tipo: 'audio_nota' });
    });

    // Juego (Sonido)
    setJuegoTotal.forEach(url => {
        if (G_Activos_Cargados.has(url)) G_Sonidos_Cargados_Juego++;
        else audiosParaBajar.push({ url, tipo: 'audio_juego' });
    });

    // Imágenes
    G_Notas_Filtradas.forEach(n => {
        const url = RUTA_NOTAS_IMG + n.Imagen + ".png";
        if (!G_Activos_Cargados.has(url)) imagenesParaBajar.push({ url, tipo: 'img' });
    });
    [RUTA_OTROS_IMG + 'barra.png', RUTA_OTROS_IMG + 'final.png'].forEach(url => {
        if (!G_Activos_Cargados.has(url)) imagenesParaBajar.push({ url, tipo: 'img' });
    });

    const listaDescarga = [...imagenesParaBajar, ...audiosParaBajar];
    let descargadosAhora = 0;
    const totalAhora = listaDescarga.length;

    // 3. INICIAR EL RELOJ (Para el tiempo mínimo)
    const tiempoInicio = Date.now();

    // 4. EJECUTAR DESCARGAS
    const cargarRecurso = async (item) => {
        try {
            if (item.tipo === 'img') {
                await new Promise((res, rej) => {
                    const img = new Image();
                    img.src = item.url;
                    img.onload = res;
                    img.onerror = rej;
                });
            } else {
                await new Promise((res, rej) => {
                    const audio = new Audio();
                    audio.src = item.url;
                    audio.oncanplaythrough = res;
                    audio.onerror = rej;
                });
                if (item.tipo === 'audio_nota') G_Sonidos_Cargados_Notas++;
                else G_Sonidos_Cargados_Juego++;
            }
            G_Activos_Cargados.add(item.url);
            descargadosAhora++;
            const porc = Math.round((descargadosAhora / totalAhora) * 100) || 0;
            p_Popup_Carga_Mensaje.innerHTML = `Descargando recursos... ${porc}%`;
        } catch (e) {
            console.warn("Fallo al cargar:", item.url);
        }
    };

    try {
        // Esperamos a que terminen las descargas (o el timeout de 3 min)
        await Promise.race([
            Promise.all(listaDescarga.map(item => cargarRecurso(item))),
            new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), TIEMPO_ESPERA_MAX_CARGA))
        ]);

        // 5. ASEGURAR TIEMPO MÍNIMO VISUAL (3 segundos)
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const tiempoRestante = TIEMPO_MIN_POPUP_CARGA - tiempoTranscurrido;
        if (tiempoRestante > 0) await new Promise(res => setTimeout(res, tiempoRestante));

        while (Juego_Pausado) await new Promise(res => setTimeout(res, 500));
        
        console.log(`📊 Carga finalizada -> Notas: ${G_Sonidos_Cargados_Notas}/${G_Total_Esperado_Notas} | Juego: ${G_Sonidos_Cargados_Juego}/${G_Total_Esperado_Juego}`);

        div_Popup_Carga.classList.add('oculto');
        G_Carga_En_Progreso = false;
        Lanzar_Cuenta_Regresiva();

    } catch (error) {
        G_Partida_En_Curso = false;
        alert(MSJ_JUEGO.ERROR_CARGA);
        Ir_A_Seccion_Anterior();
    }
}


//////////////////////////////////////////////////////
//                                                  //
//         INICIALIZACIÓN Y CONTROL                 //
//                                                  //
//////////////////////////////////////////////////////
async function Iniciar_Motor_Juego(repitiendo = false) {
    // 1. LIMPIEZA ABSOLUTA
    Detener_Todo_El_Juego(); 
    
    G_Partida_En_Curso = true;

    // 2. GESTIÓN DEL POPUP DE CARGA
    if (!repitiendo) {
        div_Popup_Carga.classList.remove('oculto');
        div_Popup_Carga_Error_Acciones.classList.add('oculto');
        p_Popup_Carga_Mensaje.innerHTML = "Iniciando motor de juego...";
    } else {
        div_Popup_Carga.classList.add('oculto');
    }

    if (Datos_Excel_Global === null) {
        p_Popup_Carga_Mensaje.innerHTML = "Leyendo base de datos musical...";
        await Cargar_Excel_En_Memoria(); 
    }

    const params = new URLSearchParams(window.location.search);
    G_Nivel_Actual = parseInt(params.get('game_level')) || 1;
    Modo_Juego_Actual = params.get('mode');
    const clefRaw = params.get('clef') || "";

    G_Claves_Seleccionadas = clefRaw.replace('-sn', '').replace('-fn', '').replace('-mc', '').split('-');
    Clave_En_Ronda = G_Claves_Seleccionadas[0]; 
    
    h2_Div_Juego.innerHTML = (Modo_Juego_Actual === 'expert-mode') ? "Modo Desafío" : "Nivel " + G_Nivel_Actual;
    
    if (Usuario_Actual !== null && Modo_Juego_Actual === 'learning-mode') {
        const datos_a_enviar = { usuario: Usuario_Actual, clave:  Clave_En_Ronda};
        const respuestaProgreso = await fetch(ruta_Obtener_Progreso, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos_a_enviar)
        });

        const dataProgreso = await respuestaProgreso.json();
        if (dataProgreso.success) {
            const progresoReal = dataProgreso.nivel;
            if (G_Nivel_Actual > progresoReal) {
                Detener_Todo_El_Juego();
                G_Partida_En_Curso = false;
                alert(MSJ_JUEGO.ERROR_CARGA);
                
                //ESTE IF PARECE SER IMPORTANTE A LA HORA DE IR A LA SECCION DE SELECCION DE NIVEL AUNQUE AUN NO SE PORQUE XD
                if (clefRaw && clefRaw.includes('-')) {
                    const partes = clefRaw.split('-');
                    Clave_Actual = partes[0];
                    Tipo_Nombre_Actual = partes[1];
                    Actualizar_H2_Niveles();
                }
                reemplazarMultiplesParametrosURL({ view: 'level-select', mode: Modo_Juego_Actual, clef: clefRaw });
                mostrar_Div_Level_Select();
                Cargar_Y_Dibujar_Niveles();
                return;
            }
        } 
        else{
            Detener_Todo_El_Juego();
            Sesion_Caducada_Error(); 
            return;
        }
    }
    
    if (G_Claves_Seleccionadas.length > 1) {
        h3_Div_Juego.innerHTML = "Múltiples Claves";
    } else {
        const tipoLabel = clefRaw.includes('-sn') ? 'sn' : 'fn';
        h3_Div_Juego.innerHTML = NOMBRES_CLAVES[G_Claves_Seleccionadas[0]][tipoLabel];
    }

    /*Preguntas_Totales = (Modo_Juego_Actual === 'learning-mode') 
        ? CANTIDAD_MINIMA_PREGUNTAS_M_APRENDIZAJE + ((G_Nivel_Actual - 1) * AUMENTO_PREGUNTAS_POR_NIVEL) 
        : CANTIDAD_MAXIMA_PREGUNTAS_M_DESAFIO;*/
    
    //DEFINIR CANTIDAD DE PREGUNTAS (Con tope máximo de 100)
    Preguntas_Totales = (Modo_Juego_Actual === 'learning-mode') 
    ? Math.min(CANTIDAD_MAXIMA_PREGUNTAS_M_DESAFIO, CANTIDAD_MINIMA_PREGUNTAS_M_APRENDIZAJE + ((G_Nivel_Actual - 1) * AUMENTO_PREGUNTAS_POR_NIVEL)) 
    : CANTIDAD_MAXIMA_PREGUNTAS_M_DESAFIO;
    
    console.log(Preguntas_Totales);

    Pregunta_Actual = 1;
    Contador_Aciertos = 0;
    Contador_Errores = 0;
    Timer_Dificultad = 4000;
    G_Historial_Notas = [];
    G_Notas_Vistas_Garantia.clear();
    Turnos_Clave_Actual = 1;

    const llaves = Object.keys(Datos_Excel_Global[0]);
    G_Notas_Filtradas = Datos_Excel_Global.filter(fila => {
        return G_Claves_Seleccionadas.some(c => {
            const colNivel = llaves.find(k => k.toLowerCase().trim() === ("Nivel_" + c).toLowerCase());
            return fila[colNivel] !== null && parseInt(fila[colNivel]) <= G_Nivel_Actual;
        });
    });

    if (repitiendo) {
        Lanzar_Cuenta_Regresiva();
    } else {
        await Ejecutar_Precarga_Activos();
    }
}


/*function Detener_Todo_El_Juego() {
    clearInterval(Intervalo_Juego_Barra);
    clearInterval(Intervalo_Cuenta_Regresiva);
    
    if (G_Carga_En_Progreso) {
        div_Popup_Carga.classList.add('oculto');
        G_Carga_En_Progreso = false;
    }
    
    if (Audio_Nota_Actual) {
        Audio_Nota_Actual.pause();
        Audio_Nota_Actual.currentTime = 0;
    }
    Juego_Pausado = false;
    Pregunta_Actual = 1;
    Contador_Aciertos = 0;
    Contador_Errores = 0;
    G_Historial_Notas = [];
    G_Notas_Vistas_Garantia.clear();
    div_Popup_Resultados_Juego.classList.add('oculto');
    div_Juego_Iniciado.classList.add('espacio');
}*/
function Detener_Todo_El_Juego() {
    // 1. Limpiar todos los intervalos y tiempos de espera
    clearInterval(Intervalo_Juego_Barra);
    clearInterval(Intervalo_Cuenta_Regresiva);
    if (typeof Timeout_Siguiente_Pregunta !== 'undefined') clearTimeout(Timeout_Siguiente_Pregunta);
    
    // 2. Detener audio
    if (Audio_Nota_Actual) {
        Audio_Nota_Actual.pause();
        Audio_Nota_Actual.currentTime = 0;
    }

    // 3. Resetear estados lógicos (OJO: NO TOCAR G_Partida_En_Curso AQUÍ)
    Juego_Pausado = false;
    G_Carga_En_Progreso = false;
    
    // 4. Limpieza visual
    div_Popup_Resultados_Juego.classList.add('oculto');
    div_Popup_Carga.classList.add('oculto');
    div_Listos_Ya.classList.add('oculto');
    div_Juego_Iniciado.classList.add('espacio');
    
    btn_Alternativa_1.classList.remove('correcto', 'incorrecto'); 
    btn_Alternativa_2.classList.remove('correcto', 'incorrecto'); 
    btn_Alternativa_3.classList.remove('correcto', 'incorrecto'); 
    btn_Alternativa_4.classList.remove('correcto', 'incorrecto'); 
    
    console.log("Juego Detenido");
}

function Lanzar_Cuenta_Regresiva() {
    div_Listos_Ya.classList.remove('oculto');
    let s = 3; 
    p_PC.classList.remove('oculto');
    h1_Listos_Ya.innerHTML = "¡PREPARATE!";
    
    div_Listos_Ya.onclick = () => {
        if (Juego_Pausado) return; // No iniciar si está en pausa
        
        div_Listos_Ya.onclick = null; 
        h1_Listos_Ya.innerHTML = s;
        p_PC.classList.add('oculto');
        s--; 

        Intervalo_Cuenta_Regresiva = setInterval(() => {            
            if (!Juego_Pausado) {
                if (s > 0) {
                    h1_Listos_Ya.innerHTML = s;
                }
                else if (s === 0) {
                    h1_Listos_Ya.innerHTML = "¡YA!";
                }
                else {
                    clearInterval(Intervalo_Cuenta_Regresiva);
                    div_Listos_Ya.classList.add('oculto');
                    div_Juego_Iniciado.classList.remove('espacio');
                    Arrancar_Nueva_Pregunta();
                }
                s--; 
            }
        }, 1000);
    };
}


//////////////////////////////////////////////////////
//                                                  //
//         MOTOR DE PREGUNTAS                       //
//                                                  //
//////////////////////////////////////////////////////
function Arrancar_Nueva_Pregunta() {
    if (Juego_Pausado) return;

    const ejemplo = Datos_Excel_Global[0];
    const llaves = Object.keys(ejemplo);

    G_Notas_Filtradas = Datos_Excel_Global.filter(fila => {
        return G_Claves_Seleccionadas.some(c => {
            const colNivel = llaves.find(k => k.toLowerCase().trim() === ("Nivel_" + c).toLowerCase());
            return fila[colNivel] !== null && fila[colNivel] !== undefined && fila[colNivel] !== "";
        });
    });

    if (G_Notas_Filtradas.length === 0) {
        alert("Error: No hay notas disponibles.");
        Ir_A_Seccion_Anterior();
        return;
    }

    Generar_Pregunta_Musical();
}

function Generar_Pregunta_Musical() {
    if (Pregunta_Actual > Preguntas_Totales) {
        Mostrar_Popup_Resultados();
        return;
    }

    let claveElegida = "";
    if (G_Claves_Seleccionadas.length > 1) {
        if (Clave_En_Ronda === "") {
            claveElegida = G_Claves_Seleccionadas[Math.floor(Math.random() * G_Claves_Seleccionadas.length)];
            Turnos_Clave_Actual = 1;
        } else if (Turnos_Clave_Actual >= 10) {
            const otrasClaves = G_Claves_Seleccionadas.filter(c => c !== Clave_En_Ronda);
            claveElegida = otrasClaves[Math.floor(Math.random() * otrasClaves.length)];
            Turnos_Clave_Actual = 1;
        } else {
            claveElegida = G_Claves_Seleccionadas[Math.floor(Math.random() * G_Claves_Seleccionadas.length)];
            Turnos_Clave_Actual = (claveElegida === Clave_En_Ronda) ? Turnos_Clave_Actual + 1 : 1;
        }
    } else {
        claveElegida = G_Claves_Seleccionadas[0];
    }
    Clave_En_Ronda = claveElegida;

    const llaves = Object.keys(Datos_Excel_Global[0]);
    const colNivel = llaves.find(k => k.toLowerCase().trim() === ("Nivel_" + Clave_En_Ronda).toLowerCase());

    const notasValidasParaEstaClave = G_Notas_Filtradas.filter(f => {
        return f[colNivel] !== null && f[colNivel] !== undefined && f[colNivel] !== "" && parseInt(f[colNivel]) <= G_Nivel_Actual;
    });

    let fila;
    const notasNoVistas = notasValidasParaEstaClave.filter(f => !G_Notas_Vistas_Garantia.has(f.Imagen + Clave_En_Ronda));
    
    if (notasNoVistas.length > 0 && (Preguntas_Totales - Pregunta_Actual) < notasNoVistas.length) {
        fila = notasNoVistas[Math.floor(Math.random() * notasNoVistas.length)];
    } else {
        let probActual;
        if (G_Nivel_Actual === 1) probActual = PROB_LVL1;
        else if (G_Nivel_Actual === 2) probActual = PROB_LVL2;
        else probActual = PROB_LVL3_MAS;

        if (Modo_Juego_Actual === 'learning-mode' && Math.random() < probActual) {
            const notasNuevas = notasValidasParaEstaClave.filter(f => f[colNivel] == G_Nivel_Actual);
            fila = (notasNuevas.length > 0) ? notasNuevas[Math.floor(Math.random() * notasNuevas.length)] : notasValidasParaEstaClave[Math.floor(Math.random() * notasValidasParaEstaClave.length)];
        } else {
            fila = notasValidasParaEstaClave[Math.floor(Math.random() * notasValidasParaEstaClave.length)];
        }
    }

    if (fila && G_Historial_Notas.length === MAX_REPETICIONES_NOTA && G_Historial_Notas.every(v => v === fila.Imagen)) {
        return Generar_Pregunta_Musical();
    }

    if (!fila) return Generar_Pregunta_Musical();

    G_Historial_Notas.push(fila.Imagen);
    if (G_Historial_Notas.length > MAX_REPETICIONES_NOTA) G_Historial_Notas.shift();
    G_Notas_Vistas_Garantia.add(fila.Imagen + Clave_En_Ronda);

    Pintar_Pregunta_En_Pantalla(fila);
}


function Pintar_Pregunta_En_Pantalla(fila) {
    const llaves = Object.keys(fila);
    const colNota = llaves.find(k => k.toLowerCase().trim() === ("Nota_" + Clave_En_Ronda).toLowerCase());
    const colImagen = llaves.find(k => k.toLowerCase().trim() === "imagen");
    
    Nota_Correcta_Nombre = fila[colNota].split('_')[0];

    img_Clave_Juego.src = RUTA_CLAVES_IMG + Clave_En_Ronda + ".png";
    img_Nota_Juego.src = RUTA_NOTAS_IMG + fila[colImagen] + ".png";
    img_Ultima_Imagen_Juego.src = (Pregunta_Actual === Preguntas_Totales) 
        ? RUTA_OTROS_IMG + "final.png" 
        : RUTA_OTROS_IMG + "barra.png";
    p_Div_Juego.innerHTML = `${Pregunta_Actual} / ${Preguntas_Totales}`;

    const nombreFormateado = Obtener_Nombre_Formateado_Para_Sonido_De_Nota(fila[colNota]);
    Manejar_Sonido_Nota(RUTA_NOTAS_AUDIO + nombreFormateado + ".mp3");

    let distractores = [...new Set(G_Notas_Filtradas.map(f => f[colNota].split('_')[0]))].filter(n => n !== Nota_Correcta_Nombre);
    
    if (distractores.length < 3) {
        distractores = [...new Set(Datos_Excel_Global.map(f => {
            const val = f[colNota];
            return val ? val.split('_')[0] : null;
        }))].filter(n => n !== null && n !== Nota_Correcta_Nombre);
    }
    
    distractores.sort(() => Math.random() - 0.5);
    let opciones = [Nota_Correcta_Nombre, distractores[0], distractores[1], distractores[2]];

    let posicionActual;
    let intentosBarajado = 0;

    do {
        opciones.sort(() => Math.random() - 0.5);
        posicionActual = opciones.indexOf(Nota_Correcta_Nombre);
        intentosBarajado++;
    } while (posicionActual === G_Ultima_Posicion_Correcta && G_Repeticiones_Posicion >= 2 && intentosBarajado < 10);

    if (posicionActual === G_Ultima_Posicion_Correcta) {
        G_Repeticiones_Posicion++;
    } else {
        G_Ultima_Posicion_Correcta = posicionActual;
        G_Repeticiones_Posicion = 1;
    }

    const botones = [btn_Alternativa_1, btn_Alternativa_2, btn_Alternativa_3, btn_Alternativa_4];
    botones.forEach((btn, i) => {
        btn.innerHTML = opciones[i];
        btn.classList.remove('correcto', 'incorrecto'); 
        btn.disabled = false;
        btn.onclick = () => Procesar_Respuesta(opciones[i], Nota_Correcta_Nombre, btn);
    });

    Arrancar_Barra_Tiempo();
}

function Obtener_Nombre_Formateado_Para_Sonido_De_Nota(nombreExcel) {
    if (!nombreExcel) return "";
    let limpio = nombreExcel.trim().toLowerCase();
    let octava = limpio.slice(-1);
    let nota = limpio.slice(0, -1).replace(/_/g, "");
    
    const mapaIndices = { "do": 1, "re": 2, "mi": 3, "fa": 4, "sol": 5, "la": 6, "si": 7 };
    let notaBase = nota.replace(/[#|b]/g, ""); 
    let numeroNota = mapaIndices[notaBase] || 0;
    
    return `${octava}_${numeroNota}-${nota}_${octava}`;
}


//////////////////////////////////////////////////////
//                                                  //
//         BARRA DE TIEMPO Y RESPUESTA              //
//                                                  //
//////////////////////////////////////////////////////
function Arrancar_Barra_Tiempo() {
    clearInterval(Intervalo_Juego_Barra);

    let anchoAlFinalizar = div_Barra_Temporizador.style.width || "0%";
    div_Barra_Temporizador.style.transition = "none";
    div_Barra_Temporizador.style.width = anchoAlFinalizar;
    div_Barra_Temporizador.style.backgroundColor = ""; 

    div_Barra_Temporizador.offsetHeight; 

    const tiempoLlenado = 200; 
    div_Barra_Temporizador.style.transition = `width ${tiempoLlenado}ms ease-out`;
    div_Barra_Temporizador.style.width = "100%";

    setTimeout(() => {
        if (Juego_Pausado) return; // Si pausó durante el llenado, no arrancar descuento

        Tiempo_Restante = Timer_Dificultad;
        div_Barra_Temporizador.style.transition = "width 0.05s linear";

        Intervalo_Juego_Barra = setInterval(() => {
            if (!Juego_Pausado) {
                Tiempo_Restante -= 50;
                let p = (Tiempo_Restante / Timer_Dificultad) * 100;
                if (p < 0) p = 0;
                div_Barra_Temporizador.style.width = p + "%";

                if (Tiempo_Restante <= 0) {
                    clearInterval(Intervalo_Juego_Barra);
                    div_Barra_Temporizador.style.width = "0%";
                    Procesar_Respuesta(null, "FALLO_TIEMPO", null);
                }
            }
        }, 50);

    }, tiempoLlenado);
}


function Procesar_Respuesta(elegida, correcta, boton) {
    if (Juego_Pausado) return;
    clearInterval(Intervalo_Juego_Barra);
    [btn_Alternativa_1, btn_Alternativa_2, btn_Alternativa_3, btn_Alternativa_4].forEach(b => b.disabled = true);

    if (elegida === correcta) {
        Contador_Aciertos++;
        boton.classList.add('correcto');
        Reproducir_Sonido_Sistema(RUTA_OTROS_AUDIO + 'acierto.mp3');
        Timer_Dificultad = Math.min(5000, Timer_Dificultad + 250);
    } else {
        Contador_Errores++;
        if (boton) boton.classList.add('incorrecto');
        else {
            div_Barra_Temporizador.style.backgroundColor = "red";
            div_Barra_Temporizador.style.width = "0%";
        }
        
        const btnCorrecto = [btn_Alternativa_1, btn_Alternativa_2, btn_Alternativa_3, btn_Alternativa_4].find(b => b.innerHTML === Nota_Correcta_Nombre);
        if(btnCorrecto) btnCorrecto.classList.add('correcto');
        
        Reproducir_Sonido_Sistema(RUTA_OTROS_AUDIO + 'error.mp3');
        Timer_Dificultad = Math.max(3000, Timer_Dificultad - 250);
    }

    /*setTimeout(() => {
        if (!Juego_Pausado) {
            Pregunta_Actual++;
            Generar_Pregunta_Musical();
        }
    }, INTERVALO_SIGUIENTE_PREGUNTA);*/
    Timeout_Siguiente_Pregunta = setTimeout(() => {
        // Solo avanzamos si la partida sigue en curso (no si el usuario salió)
        if (!Juego_Pausado && G_Partida_En_Curso) {
            Pregunta_Actual++;
            Generar_Pregunta_Musical();
        }
    }, INTERVALO_SIGUIENTE_PREGUNTA);
}


//////////////////////////////////////////////////////
//                                                  //
//         RESULTADOS Y FINALIZACIÓN                //
//                                                  //
//////////////////////////////////////////////////////
async function Mostrar_Popup_Resultados() {
    G_Partida_En_Curso = false;
    
    const p = (Contador_Aciertos / Preguntas_Totales) * 100;
    let img = "perder.png", msg = MSJ_JUEGO.FIN_MAL;

    if (p === 100) {
        img = "ganar.png";
        msg = MSJ_JUEGO.FIN_100;
        if (Usuario_Actual && Modo_Juego_Actual === 'learning-mode') {
            const max = Obtener_Nivel_Maximo_Clave(G_Claves_Seleccionadas[0]);
            if (G_Nivel_Actual < max) await Actualizar_Progreso_Servidor(G_Nivel_Actual + 1);
            else msg = MSJ_JUEGO.TODO_COMPLETO;
        }
    } else if (p >= 50) {
        img = "masomenos.png";
        msg = MSJ_JUEGO.FIN_MEDIO;
    }

    img_Resultado_Juego.src = `resources/otros/${img}`;
    p_Resumen_Aciertos.innerHTML = `Aciertos: ${Contador_Aciertos}`;
    p_Resumen_Errores.innerHTML = `Errores: ${Contador_Errores}`;
    p_Mensaje_Final_Juego.innerHTML = msg;

    btn_Popup_Resultado_Aceptar.onclick = () => {
        div_Popup_Resultados_Juego.classList.add('oculto');
        const p = new URLSearchParams(window.location.search);
        const clefRaw = p.get('clef');

        if (Modo_Juego_Actual === 'learning-mode') {
            if (clefRaw && clefRaw.includes('-')) {
                const partes = clefRaw.split('-');
                Clave_Actual = partes[0];
                Tipo_Nombre_Actual = partes[1];
                Actualizar_H2_Niveles();
            }
            reemplazarMultiplesParametrosURL({ view: 'level-select', mode: Modo_Juego_Actual, clef: clefRaw });
            mostrar_Div_Level_Select();
            Cargar_Y_Dibujar_Niveles();
        } else {
            reemplazarMultiplesParametrosURL({ view: 'clef-select', mode: Modo_Juego_Actual });
            mostrar_Div_Clef_Select();
            Configurar_Vista_Claves_Segun_Modo();
        }
    };

    btn_Popup_Repetir_Nivel.onclick = () => {
        div_Popup_Resultados_Juego.classList.add('oculto');
        Iniciar_Motor_Juego(true);
    };

    div_Popup_Resultados_Juego.classList.remove('oculto');
}

function Ir_A_Seccion_Anterior() {
    G_Partida_En_Curso = false;
    Detener_Todo_El_Juego();
    
    if (Modo_Juego_Actual === 'learning-mode') {
        actualizarParametroURL("level-select");
        mostrar_Div_Level_Select();
        Cargar_Y_Dibujar_Niveles();      
    } else {
        actualizarParametroURL("clef-select");
        mostrar_Div_Clef_Select();
        Configurar_Vista_Claves_Segun_Modo();
    }
}

function Manejar_Sonido_Nota(ruta) {
    if (Sonido_Muteado) return;

    const notasCompletas = G_Sonidos_Cargados_Notas === G_Total_Esperado_Notas && G_Total_Esperado_Notas > 0;

    if (notasCompletas) {
        if (Audio_Nota_Actual) { Audio_Nota_Actual.pause(); Audio_Nota_Actual.currentTime = 0; }
        Audio_Nota_Actual = new Audio(ruta);
        Audio_Nota_Actual.play().catch(e => console.error("Error al reproducir:", e));
    }
}

btn_Sonido.addEventListener('click', () => {
    if (btn_Sonido.disabled) return;
    Sonido_Muteado = !Sonido_Muteado;
    if (Sonido_Muteado) {
        btn_Sonido.classList.remove('unmute');
        btn_Sonido.classList.add('mute');
        if (Audio_Nota_Actual) { Audio_Nota_Actual.pause(); Audio_Nota_Actual.currentTime = 0; }
    } else {
        btn_Sonido.classList.remove('mute');
        btn_Sonido.classList.add('unmute');
    }
});

function Reproducir_Sonido_Sistema(ruta) {
    if (Sonido_Muteado) return;
    const juegoCompleto = G_Sonidos_Cargados_Juego === G_Total_Esperado_Juego && G_Total_Esperado_Juego > 0;
    if (juegoCompleto) {
        let audioSistema = new Audio(ruta);
        audioSistema.play().catch(() => {});
    }
}

//////////////////////////////////////////////////////
//                                                  //
//         GESTIÓN DE PAUSA (TECLADO)               //
//                                                  //
//////////////////////////////////////////////////////

window.addEventListener('keydown', (e) => {
    // 1. Cambiado a tecla Escape y verificación de div visible
    if (e.code === 'Escape' && !div_Juego.classList.contains('oculto')) {
        e.preventDefault();
        Toggle_Pausa_Manual();
    }
});

function Toggle_Pausa_Manual() {
    Juego_Pausado = !Juego_Pausado;

    if (Juego_Pausado) {
        console.log("Juego pausado");
        clearInterval(Intervalo_Juego_Barra);
        // Pausar audio si está sonando
        if (Audio_Nota_Actual) Audio_Nota_Actual.pause();
    } else {
        console.log("Juego despausado");
        // Reanudar audio si no está muteado
        if (Audio_Nota_Actual && !Sonido_Muteado) Audio_Nota_Actual.play().catch(()=>{});
        
        // Reanudar barra de tiempo si hay tiempo restante
        if (Tiempo_Restante > 0) {
            Arrancar_Barra_Tiempo_Reanudado();
        }
    }
}

function Arrancar_Barra_Tiempo_Reanudado() {
    // Limpieza de seguridad antes de reanudar
    clearInterval(Intervalo_Juego_Barra);
    
    Intervalo_Juego_Barra = setInterval(() => {
        if (!Juego_Pausado) {
            Tiempo_Restante -= 50;
            let p = (Tiempo_Restante / Timer_Dificultad) * 100;
            if (p < 0) p = 0;
            div_Barra_Temporizador.style.width = p + "%";
            
            if (Tiempo_Restante <= 0) {
                clearInterval(Intervalo_Juego_Barra);
                Procesar_Respuesta(null, "FALLO_TIEMPO", null);
            }
        }
    }, 50);
}

/*async function Actualizar_Progreso_Servidor(n) {
    const d = { usuario: Usuario_Actual, clave: G_Claves_Seleccionadas[0], nuevoNivel: n };
    await fetch("js/cn/f_subir_nivel.php", { method: 'POST', body: JSON.stringify(d) });
}*/
async function Actualizar_Progreso_Servidor(n) {
    const d = { usuario: Usuario_Actual, clave: G_Claves_Seleccionadas[0], nuevoNivel: n };
    
    try {
        const respuesta = await fetch("js/cn/f_subir_nivel.php", { 
            method: 'POST', 
            body: JSON.stringify(d) 
        });
        
        const datos = await respuesta.json();

        // --- CLAVE DE SEGURIDAD ---
        if (!datos.success) {
            // Si el servidor reporta error (ej: usuario eliminado), expulsamos
            Sesion_Caducada_Error(); 
        } else {
            console.log("Servidor: " + datos.message);
        }
    } catch (error) {
        console.error("Error de conexión al guardar progreso.");
    }
}