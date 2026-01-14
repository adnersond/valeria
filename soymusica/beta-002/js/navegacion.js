//////////////////////////////////////////////////////
//                                                  //
//   FUNCIONES AUXILIARES DE URL Y VISIBILIDAD      //
//                                                  //
//////////////////////////////////////////////////////
//Variable que define el modo aprendizaje o desaio
let Modo_Juego_Actual;         // Almacenará el modo aprendizaje o experto
let Clave_Actual = null;       // Almacenará el ID (ej: sol_2)
let Tipo_Nombre_Actual = null; // Almacenará el sufijo (sn para short name o fn para full name)

//-------------------------Oculta todos los contenedores principales
function ocultar_Divs() {
    /*div_Inicio.style.display = "none";
    div_login.style.display = "none";
    div_Registro.style.display = "none";
    div_Seleccion.style.display = "none";
    div_Clave.style.display = "none";
    div_Niveles.style.display = "none";
    div_Juego.style.display = "none";*/
    
    div_Inicio.classList.add('oculto');
    div_login.classList.add('oculto');
    div_Registro.classList.add('oculto');
    div_Seleccion.classList.add('oculto');
    div_Clave.classList.add('oculto');
    div_Niveles.classList.add('oculto');
    div_Juego.classList.add('oculto');
    
    //Ocultar Popups
    div_Popup_Informacion_Nivel.classList.add('oculto');
    div_Popup_Confirmacion_Desafio.classList.add('oculto');
    div_Popup_Carga.classList.add('oculto');
    div_Popup_Resultados_Juego.classList.add('oculto');
    
    // Limpieza de procesos de juego
    if (typeof Detener_Todo_El_Juego === 'function') {
        Detener_Todo_El_Juego();
    }
    
    Limpiar_Formulario_login();
    Limpiar_Formulario_Registro();
}

//-------------------------Actualiza la URL usando el parámetro único 'view'
function actualizarParametroURL(valorView) {
    const baseURL = window.location.origin + window.location.pathname;
    const nuevaURL = `${baseURL}?view=${valorView}`;
    window.history.pushState({ seccion: valorView }, document.title, nuevaURL);
}

//-------------------------Función flexible para enviar múltiples parámetros
function actualizarMultiplesParametrosURL(objetosParametros) {
    const baseURL = window.location.origin + window.location.pathname;
    const searchParams = new URLSearchParams();

    for (const llave in objetosParametros) {
        searchParams.set(llave, objetosParametros[llave]);
    }

    const nuevaURL = `${baseURL}?${searchParams.toString()}`;
    window.history.pushState({ seccion: 'multiple' }, document.title, nuevaURL);
}





//-------------------------REEMPLAZA la URL actual (útil para saltarse el Div Juego en el historial)
function reemplazarParametroURL(valorView) {
    const baseURL = window.location.origin + window.location.pathname;
    const nuevaURL = `${baseURL}?view=${valorView}`;
    // replaceState no añade un paso nuevo, sobreescribe el actual
    window.history.replaceState({ seccion: valorView }, document.title, nuevaURL);
}

//-------------------------Versión múltiple para reemplazar (para volver a niveles con sus parámetros)
function reemplazarMultiplesParametrosURL(objetosParametros) {
    const baseURL = window.location.origin + window.location.pathname;
    const searchParams = new URLSearchParams();
    for (const llave in objetosParametros) {
        searchParams.set(llave, objetosParametros[llave]);
    }
    const nuevaURL = `${baseURL}?${searchParams.toString()}`;
    window.history.replaceState({ seccion: 'multiple' }, document.title, nuevaURL);
}


//-------------------------Limpia la URL (regresa al estado inicial)
function limpiarURL() {
    const baseURL = window.location.origin + window.location.pathname;
    window.history.pushState({ seccion: "inicio" }, document.title, baseURL);
}


//////////////////////////////////////////////////////
//                                                  //
//   FUNCIONES PARA MOSTRAR LOS DIV (VISUAL)        //
//                                                  //
//////////////////////////////////////////////////////
// 1. Variable para rastrear la sección visible para el Zoom-Out
let div_Visible_Actual = null;

// 2. FUNCIÓN MAESTRA DE NAVEGACIÓN (Soporta animaciones)
async function Navegar_A_Seccion(nuevo_div, callback_visual = null) {
    // 1. Efecto de Salida (Zoom-Out)
    if (div_Visible_Actual && div_Visible_Actual !== nuevo_div) {
        div_Visible_Actual.classList.remove('efecto-entrada');
        div_Visible_Actual.classList.add('efecto-salida');
        await new Promise(res => setTimeout(res, 200));
    }

    // 2. Limpieza Técnica (Ocultar todo)
    ocultar_Div_Limpio();

    // 3. CAMBIO AQUÍ: Primero mostramos el nuevo DIV (le quitamos el 'oculto')
    // para que el navegador lo reconozca como un elemento visible.
    nuevo_div.classList.remove('oculto', 'efecto-salida');
    nuevo_div.classList.add('efecto-entrada');
    div_Visible_Actual = nuevo_div;
    Limpiar_Formulario_login();
    Limpiar_Formulario_Registro();

    // 4. CAMBIO AQUÍ: Ahora que el div es visible, ejecutamos el callback.
    // El .focus() de Login o Registro ahora funcionará perfectamente.
    if (callback_visual) callback_visual();
}
/*async function Navegar_A_Seccion(nuevo_div, callback_visual) {
    // Si ya hay algo en pantalla, hacemos el Zoom-Out
    if (div_Visible_Actual && div_Visible_Actual !== nuevo_div) {
        div_Visible_Actual.classList.remove('efecto-entrada');
        div_Visible_Actual.classList.add('efecto-salida');
        // Esperamos 200ms para que la animación se vea
        await new Promise(res => setTimeout(res, 200));
    }

    // Ocultamos todos de golpe (Limpieza técnica)
    ocultar_Div_Limpio();
    
    // Ejecutamos la lógica visual de la sección (ej: reset de campos)
    callback_visual();

    // Mostramos el nuevo DIV con Zoom-In
    nuevo_div.classList.remove('oculto', 'efecto-salida');
    nuevo_div.classList.add('efecto-entrada');
    div_Visible_Actual = nuevo_div;
}*/

// 3. ACTUALIZACIÓN DE FUNCIONES "MOSTRAR"
// Ahora todas usan Navegar_A_Seccion para ser fluídas

function mostrar_Div_Inicio() {
    Navegar_A_Seccion(div_Inicio, () => {
        window.scrollTo(0, 0);
    });
}

function mostrar_Div_Signin() {
    Navegar_A_Seccion(div_login, () => {
        window.scrollTo(0, 0);
        txt_Usuario_login.focus();
    });
}

function mostrar_Div_Signup() {
    Navegar_A_Seccion(div_Registro, () => {
        window.scrollTo(0, 0);
        txt_Usuario_Registro.focus();
    });
}

function mostrar_Div_Welcome() {
    Navegar_A_Seccion(div_Seleccion, () => {
        window.scrollTo(0, 0);
    });
}

function mostrar_Div_Clef_Select() {
    Navegar_A_Seccion(div_Clave, () => {
        window.scrollTo(0, 0);
    });
}

function mostrar_Div_Level_Select() {
    Navegar_A_Seccion(div_Niveles, () => {
        window.scrollTo(0, 0);
    });
}

function mostrar_Div_Game() {
    Navegar_A_Seccion(div_Juego, () => {
        window.scrollTo(0, 0);
        Iniciar_Motor_Juego();
    });
}
/*
// Muestra la pantalla de Inicio
function mostrar_Div_Inicio() {
    ocultar_Divs();
    window.scrollTo(0, 0); // Devuelve la barra de desplazamiento vertical al principio
    div_Inicio.classList.remove('oculto');
    //div_Inicio.style.display = "block";
}

// Muestra la pantalla de Inicio de Sesión
function mostrar_Div_Signin() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_login.classList.remove('oculto');
    txt_Usuario_login.focus();
    //div_login.style.display = "block";
}

// Muestra la pantalla de Registro
function mostrar_Div_Signup() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_Registro.classList.remove('oculto');
    txt_Usuario_Registro.focus();
    //div_Registro.style.display = "block";
}

// Muestra la pantalla de Bienvenida
function mostrar_Div_Welcome() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_Seleccion.classList.remove('oculto');
    //div_Seleccion.style.display = "block";
}

// Muestra la pantalla de Selección de Clave
function mostrar_Div_Clef_Select() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_Clave.classList.remove('oculto');
    //div_Clave.style.display = "block";
}

// Muestra la pantalla de Selección de Nivel
function mostrar_Div_Level_Select() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_Niveles.classList.remove('oculto');
    //div_Niveles.style.display = "block";
}

// Muestra la pantalla de Juego
function mostrar_Div_Game() {
    ocultar_Divs();
    window.scrollTo(0, 0); 
    div_Juego.classList.remove('oculto');
    //div_Juego.style.display = "block";
    Iniciar_Motor_Juego(); 
}*/


// Función auxiliar interna (sin animaciones) para uso del sistema
function ocultar_Div_Limpio() {
    [div_Inicio, div_login, div_Registro, div_Seleccion, div_Clave, div_Niveles, div_Juego].forEach(d => {
        d.classList.add('oculto');
    });
    // Ocultar también Popups
    [div_Popup_Informacion_Nivel, div_Popup_Confirmacion_Desafio, div_Popup_Carga, div_Popup_Resultados_Juego].forEach(p => {
        p.classList.add('oculto');
    });
}

//////////////////////////////////////////////////////
//                                                  //
//          LÓGICA DE NAVEGACIÓN CENTRAL            //
//                                                  //
//////////////////////////////////////////////////////

// Esta función lee el parámetro 'view' y decide qué mostrar
function Gestionar_Navegacion_URL() {
    const parametros = new URLSearchParams(window.location.search);
    const vista = parametros.get('view');
    
    // --- AÑADE ESTA LÍNEA AQUÍ PARA CAPTURAR EL MODO SIEMPRE ---
    if (parametros.has('mode')) Modo_Juego_Actual = parametros.get('mode');

    // 1. RESTRICCIÓN PARA USUARIOS LOGUEADOS
    if (Usuario_Actual !== null) {
        // Si hay sesión e intenta ir a inicio, signin o signup, lo rebotamos
        if (!vista || vista === 'signin' || vista === 'signup') {
            actualizarParametroURL('welcome');
            mostrar_Div_Welcome();
            Inicializar_Estado_Usuario(); // Asegura carga de saludo en usuario.js
            return; 
        }
    }

    // 2. DETECTIVE DE VISTAS
    switch (vista) {
        case 'signin':
            mostrar_Div_Signin();
            break;
            
        case 'signup':
            mostrar_Div_Signup();
            break;
            
        case 'welcome':
            mostrar_Div_Welcome();
            Inicializar_Estado_Usuario(); 
            break;
            
        case 'clef-select':
            mostrar_Div_Clef_Select();
            // --- NUEVA LÓGICA DE PERSISTENCIA ---
            Modo_Juego_Actual  = parametros.get('mode');
            
            if (Modo_Juego_Actual === 'learning-mode') {
                
                //sel_Modo_Clave.value = "clasicas"; // Aseguramos el combo
                Cargar_Excel_En_Memoria().then(() => {
                    Configurar_Vista_Claves_Segun_Modo();
                });
            } 
            else if (Modo_Juego_Actual === 'expert-mode') {
                
                //sel_Modo_Clave.value = "clasicas";
                Cargar_Excel_En_Memoria().then(() => {
                    Configurar_Vista_Claves_Segun_Modo();
                });
            }
            
            Configurar_Vista_Claves_Segun_Modo();
            break;
            
        case 'level-select':
            mostrar_Div_Level_Select();
                     
            Modo_Juego_Actual  = parametros.get('mode');
            const clefParam = parametros.get('clef');
            if (clefParam && clefParam.includes('-')) {
                const partes = clefParam.split('-');
                Clave_Actual = partes[0];       // Ejemplo: sol_2
                Tipo_Nombre_Actual = partes[1]; // Ejemplo: sn
                
                Actualizar_H2_Niveles();
                
                Cargar_Y_Dibujar_Niveles(); 
            }
            break;
            
        case 'game':
            mostrar_Div_Game();
            
            //Iniciar_Motor_Juego(); 
            break;
            
        default:
            mostrar_Div_Inicio();
            break;
    }
}


//-------------------------Actualiza el H2 del Div Niveles según la clave y el tipo de nombre
function Actualizar_H2_Niveles() {
    if (!Clave_Actual || !Tipo_Nombre_Actual) return;

    let textoH2 = "";
    
    // Diccionario para convertir los IDs a nombres largos
    const nombresLargos = {
        "sol_2": "Clave de Sol en 2ª Línea",
        "fa_4": "Clave de Fa en 4ª Línea",
        "do_3": "Clave de Do en 3ª Línea",
        "do_4": "Clave de Do en 4ª Línea",
        "do_1": "Clave de Do en 1ª Línea",
        "do_2": "Clave de Do en 2ª Línea",
        "fa_3": "Clave de Fa en 3ª Línea",
        "sol_1": "Clave de Sol en 1ª Línea"
    };

    if (Tipo_Nombre_Actual === "sn") {
        // Nombre corto (Solo para Sol y Fa clásicas)
        textoH2 = (Clave_Actual === "sol_2") ? "Clave de Sol" : "Clave de Fa";
    } else {
        // Nombre completo (Buscamos en el diccionario)
        textoH2 = nombresLargos[Clave_Actual];
    }

    h2_Div_Niveles_Clave.innerHTML = textoH2;
}

//////////////////////////////////////////////////////
//                                                  //
//            EVENTOS DE CARGA Y SISTEMA            //
//                                                  //
//////////////////////////////////////////////////////

/*document.addEventListener("DOMContentLoaded", function() {
    Gestionar_Navegacion_URL();
});*/

window.addEventListener("popstate", function() {
    Gestionar_Navegacion_URL();
});


//////////////////////////////////////////////////////
//                                                  //
//      EVENTOS PARA LOS BOTONES Y ENLACES          //
//                                                  //
//////////////////////////////////////////////////////
function Ir_Al_Inicio() {
    limpiarURL();
    mostrar_Div_Inicio();
}

//-------------------------------Navegación desde el en Boton de Menu en el título
btn_Ir_Bienvenida_Principal.addEventListener('click', function() {
    
    // 1. Si hay una partida, pedimos confirmación antes de salir
    if (G_Partida_En_Curso) {
        if (confirm("¿Seguro que quieres volver al menú principal? Perderás tu progreso actual.")) {
            // Si ACEPTA: Desactivamos el escudo y navegamos
            G_Partida_En_Curso = false;
            Detener_Todo_El_Juego();
            
            // Usamos REEMPLAZAR para que el Div Juego se borre del historial
            reemplazarParametroURL("welcome"); 
            mostrar_Div_Welcome();
            Inicializar_Estado_Usuario();
        }
        // Si CANCELA: No hacemos nada, el juego sigue
    } else {
        // 2. Si NO hay partida, simplemente navegamos normal
        actualizarParametroURL("welcome");
        mostrar_Div_Welcome();
        Inicializar_Estado_Usuario();
    }
});

//-------------------------------Navegación desde el Div Inicio
btn_M_Libre.addEventListener('click', function () { 
    actualizarParametroURL("welcome");
    mostrar_Div_Welcome();
    Inicializar_Estado_Usuario(); 
});

btn_Ir_Iniciar_Sesion.addEventListener('click', function () { 
    actualizarParametroURL("signin");
    mostrar_Div_Signin();
});

btn_Ir_Registrar.addEventListener('click', function () { 
    actualizarParametroURL("signup");
    mostrar_Div_Signup();
});


//-------------------------------Navegación desde el Div Login
a_Registrar.addEventListener('click', function () { 
    actualizarParametroURL("signup");
    mostrar_Div_Signup();
    txt_Usuario_Registro.focus();
});

a_Inicio_login.addEventListener('click', function () {
    Ir_Al_Inicio();
});


//-------------------------------Navegación desde el Div Registro
a_I_Sesion.addEventListener('click', function () {
    actualizarParametroURL("signin");
    mostrar_Div_Signin();
    txt_Usuario_login.focus();
});

a_Inicio_Registrar.addEventListener('click', function () {
    Ir_Al_Inicio();
});

//-------------------------------Navegación desde el Div de Bienvenida Seleccion 
btn_Aprendizaje.addEventListener('click', async function () {
    // 1. Primero definimos el modo
    Modo_Juego_Actual = 'learning-mode';
    
    await Cargar_Excel_En_Memoria(); 
    
    // 2. Luego configuramos la vista (ahora sí sabrá que es modo aprendizaje)
    sel_Modo_Clave.value = "clasicas";
    
    chk_Seleccionar_Varios_Niveles.checked = false;
    IDS_CLAVES.forEach(id => {
        document.getElementById(`chk_clave_${id}`).checked = false;
    });
    
    Configurar_Vista_Claves_Segun_Modo(); 
    
    actualizarMultiplesParametrosURL({ 
        view: 'clef-select', 
        mode: Modo_Juego_Actual
    });
    
    
    mostrar_Div_Clef_Select();
});

btn_Desafio.addEventListener('click', async function () {
    // 1. Primero definimos el modo
    Modo_Juego_Actual = 'expert-mode';
    
    await Cargar_Excel_En_Memoria(); 
    
    // 2. Luego configuramos la vista
    sel_Modo_Clave.value = "clasicas";
    
    chk_Seleccionar_Varios_Niveles.checked = false;
    IDS_CLAVES.forEach(id => {
        document.getElementById(`chk_clave_${id}`).checked = false;
    });
    
    Configurar_Vista_Claves_Segun_Modo(); 
    
    actualizarMultiplesParametrosURL({ 
        view: 'clef-select', 
        mode: Modo_Juego_Actual 
    });
    
    
    mostrar_Div_Clef_Select();
});


























// --- VARIABLE DE CONTROL DE JUEGO ---
let G_Partida_En_Curso = false; // Solo será true cuando estemos jugando

//----------------------------Evento Popstate (Botón atrás)
/*window.addEventListener("popstate", function(e) {
    if (G_Partida_En_Curso) {
        // Mostramos el mensaje de confirmación
        const mensaje = "Has presionado el boton de ir atrás. ¿Seguro que quieres salir? Perderás tu progreso actual. Si cancelas se reiniciará el juego.";
        
        if (confirm(mensaje)) {
            // Si ACEPTA: Desactivamos el escudo y dejamos que el detective haga su trabajo
            G_Partida_En_Curso = false;
            Detener_Todo_El_Juego();
            Gestionar_Navegacion_URL();
        } else {
            // Si CANCELA: Volvemos a meter la URL del juego en el historial
            // Esto "anula" el retroceso y mantiene al usuario en la misma pregunta
            history.pushState(null, document.title, window.location.href);
            
            mostrar_Div_Game();
        }
    } else {
        // Navegación normal si no hay partida
        Gestionar_Navegacion_URL();
    }
});*/
window.addEventListener("popstate", function(e) {
    if (G_Partida_En_Curso) {
        // 1. Mostramos la alerta informativa
        alert("Has presionado el botón de ir atrás. Estás abandonando el juego.");

        // 2. Apagamos el motor y la llave de seguridad
        G_Partida_En_Curso = false;
        Detener_Todo_El_Juego();

        // 3. Dejamos que el sistema cargue la sección a la que se retrocedió
        Gestionar_Navegacion_URL();
    } else {
        // Navegación normal si no hay partida en curso
        Gestionar_Navegacion_URL();
    }
});

//-------------------------Redirige a welcome y limpia la URL por error de parámetros
function Redirigir_A_Welcome_Por_Error() {
    // Usamos reemplazar para que la URL mal escrita no se quede en el historial
    reemplazarParametroURL("welcome");
    mostrar_Div_Welcome();
    Inicializar_Estado_Usuario();
}