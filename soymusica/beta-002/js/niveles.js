//////////////////////////////////////////////////////
//                                                  //
//         CONFIGURACIÓN Y RUTAS                    //
//                                                  //
//////////////////////////////////////////////////////

const RUTA_EXCEL_NOTAS = "resources/notas.xlsx";
const LIMITE_FILAS_BUSQUEDA = 52;
const ruta_Obtener_Progreso = "js/cn/f_obtener_progreso.php";

// Variable global para guardar los datos una vez leídos (por si se necesitan en el juego)
let Datos_Excel_Global = null;


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE LECTURA DE EXCEL               //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Carga el archivo Excel y gestiona el progreso del usuario
async function Cargar_Y_Dibujar_Niveles() {
    try {
        div_Contenedor_Niveles.innerHTML = "<p>Cargando niveles...</p>";

        // 1. Obtener datos del Excel (Proceso que ya tenías)
        const respuestaExcel = await fetch(RUTA_EXCEL_NOTAS);
        const buffer = await respuestaExcel.arrayBuffer();
        const libro = XLSX.read(buffer, { type: 'array' });
        const nombreHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[nombreHoja];
        const filas = XLSX.utils.sheet_to_json(hoja, { range: 1, defval: null });
        //const filas = XLSX.utils.sheet_to_json(hoja, { range: 1 });
        Datos_Excel_Global = filas;

        // 2. Determinar el progreso (Nivel hasta donde puede jugar)
        let nivelMaximoPermitido = 0;

        if (Usuario_Actual !== null) {
            // --- CASO USUARIO: Pedir progreso al servidor ---
            const datos_a_enviar = { usuario: Usuario_Actual, clave: Clave_Actual };
            
            const respuestaProgreso = await fetch(ruta_Obtener_Progreso, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos_a_enviar)
            });

            const dataProgreso = await respuestaProgreso.json();

            if (dataProgreso.success) {
                nivelMaximoPermitido = dataProgreso.nivel;
            } else {
                // Error reportado por el PHP (ej: usuario no encontrado)
                throw new Error("Error en datos de progreso");
            }
        } else {
            // --- CASO INVITADO: Desbloquear todo (ponemos un número muy alto) ---
            nivelMaximoPermitido = 999; 
        }

        // 3. Dibujar los botones enviando el límite de progreso
        Dibujar_Botones_Desde_Excel(filas, nivelMaximoPermitido);

    } catch (error) {
        console.error("Error en la carga de niveles:", error);
        // Mensaje de error personalizado solicitado
        div_Contenedor_Niveles.innerHTML = `
            <div class="mensaje-error-niveles">
                <p>Ha ocurrido un error. Por favor intenta nuevamente recargando la página.</p>
                <p>Si el error persiste, vuelve luego o ingresa por el modo libre cerrando tu sesión.</p>
            </div>`;
    }
}


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE DIBUJO DE BOTONES              //
//                                                  //
//////////////////////////////////////////////////////
//-------------------------Carga el Excel siempre para asegurar datos frescos
/*async function Cargar_Excel_En_Memoria() {
    try {
        // Añadimos un parámetro de tiempo para evitar que el navegador use una copia vieja (Caché)
        const cacheBuster = "?t=" + new Date().getTime();
        const respuestaExcel = await fetch(RUTA_EXCEL_NOTAS + cacheBuster);
        
        const buffer = await respuestaExcel.arrayBuffer();
        const libro = XLSX.read(buffer, { type: 'array' });
        const nombreHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[nombreHoja];
        
        // Sobrescribimos los datos siempre con la versión más nueva
        Datos_Excel_Global = XLSX.utils.sheet_to_json(hoja, { range: 1, defval: null });
        
        //console.log("Base de datos musical actualizada desde el Excel.");
        return true;
    } catch (error) {
        //console.error("Error cargando base de datos musical:", error);
        return false;
    }
}*/

//-------------------------Carga el Excel con reintentos automáticos para conexiones lentas
async function Cargar_Excel_En_Memoria() {
    let cargadoExitosamente = false;
    let intentos = 0;

    while (!cargadoExitosamente) {
        try {
            const cacheBuster = "?t=" + new Date().getTime();
            const respuestaExcel = await fetch(RUTA_EXCEL_NOTAS + cacheBuster);
            
            if (!respuestaExcel.ok) throw new Error("Error de red");

            const buffer = await respuestaExcel.arrayBuffer();
            const libro = XLSX.read(buffer, { type: 'array' });
            const nombreHoja = libro.SheetNames[0];
            const hoja = libro.Sheets[nombreHoja];
            
            Datos_Excel_Global = XLSX.utils.sheet_to_json(hoja, { range: 1, defval: null });
            
            cargadoExitosamente = true; // Salimos del bucle
            return true;
        } catch (error) {
            intentos++;
            console.warn(`Reintentando carga de base de datos... (Intento ${intentos})`);
            
            // Esperamos 2 segundos antes de volver a intentar para no saturar
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}

//-------------------------Busca el nivel máximo de una clave específica en el Excel
function Obtener_Nivel_Maximo_Clave(idDeLaClave) {
    if (!Datos_Excel_Global) return 0;

    const columnaBusqueda = ("Nivel_" + idDeLaClave).toLowerCase();
    let nivelMaximo = 0;

    // Escanear las filas buscando el valor más alto
    for (let i = 0; i < Datos_Excel_Global.length && i < LIMITE_FILAS_BUSQUEDA; i++) {
        const fila = Datos_Excel_Global[i];

        for (let propiedad in fila) {
            if (propiedad.toLowerCase().trim() === columnaBusqueda) {
                const valor = parseInt(fila[propiedad]);
                if (!isNaN(valor) && valor > nivelMaximo) {
                    nivelMaximo = valor;
                }
            }
        }
    }
    return nivelMaximo;
}

//-------------------------Escanea los datos reales y crea los elementos con lógica de bloqueo
function Dibujar_Botones_Desde_Excel(datos, nivelMaximoPermitido) {
    // 1. Obtenemos el total de niveles usando nuestra nueva función
    const totalNivelesExistentes = Obtener_Nivel_Maximo_Clave(Clave_Actual);

    div_Contenedor_Niveles.innerHTML = "";

    if (totalNivelesExistentes > 0) {
        for (let n = 1; n <= totalNivelesExistentes; n++) {
            const btn = document.createElement('button');
            btn.innerHTML = n;
            
            if (n <= nivelMaximoPermitido) {
                btn.className = "boton_niveles nivel-desbloqueado";
                btn.onclick = function() { Preparar_Y_Abrir_Popup_Nivel(n); };
            } else {
                btn.className = "boton_niveles nivel-bloqueado";
                btn.disabled = true;
            }
            div_Contenedor_Niveles.appendChild(btn);
        }
    } else {
        div_Contenedor_Niveles.innerHTML = "<p>No se encontraron niveles para esta clave.</p>";
    }
}

//-------------------------Navega al juego con los parámetros correctos
function Seleccionar_Nivel_Para_Jugar(numeroNivel) {
    actualizarMultiplesParametrosURL({ 
        view: 'game', 
        mode: Modo_Juego_Actual,
        clef: Clave_Actual + "-" + Tipo_Nombre_Actual,
        game_level: numeroNivel 
    });
    
    //console.log(Modo_Juego_Actual);
    mostrar_Div_Game();
}


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DEL POPUP DE INFORMACIÓN          //
//                                                  //
//////////////////////////////////////////////////////

function Preparar_Y_Abrir_Popup_Nivel(numeroNivel) {
    const nombreClaveActual = h2_Div_Niveles_Clave.innerHTML;
    
    div_Popup_Nivel_Imagenes.innerHTML = "";
    p_Popup_Nivel_Descripcion.innerHTML = "";
    h2_Popup_Nivel_Titulo.innerHTML = nombreClaveActual + " <br> Nivel " + numeroNivel;

    

    // 1. Encontrar los nombres reales de las columnas buscando en todas las filas
    let colNivelReal, colNotaReal, colImagenReal;

    for (let fila of Datos_Excel_Global) {
        const llaves = Object.keys(fila);
        if (!colNivelReal) colNivelReal = llaves.find(k => k.toLowerCase().trim() === ("Nivel_" + Clave_Actual).toLowerCase());
        if (!colNotaReal) colNotaReal = llaves.find(k => k.toLowerCase().trim() === ("Nota_" + Clave_Actual).toLowerCase());
        if (!colImagenReal) colImagenReal = llaves.find(k => k.toLowerCase().trim() === "imagen");
        if (colNivelReal && colNotaReal && colImagenReal) break;
    }

    // 2. Filtrar datos (usando == para comparar números con texto)
    let notasNivel = [];
    if (numeroNivel == 1) {
        notasNivel = Datos_Excel_Global.filter(f => f[colNivelReal] == 0 || f[colNivelReal] == 1);
    } else {
        notasNivel = Datos_Excel_Global.filter(f => f[colNivelReal] == numeroNivel);
    }

    // 3. Validar si encontramos datos
    if (notasNivel.length === 0) {
        p_Popup_Nivel_Descripcion.innerHTML = "No se encontró información para este nivel.";
        div_Popup_Informacion_Nivel.classList.remove('oculto');
        return;
    }

    // 4. Inyectar imagen de la CLAVE
    const imgClave = document.createElement('img');
    imgClave.src = `resources/claves/${Clave_Actual}.png`;
    div_Popup_Nivel_Imagenes.appendChild(imgClave);

    // 5. Construir mensaje e imágenes de NOTAS
    let mensaje = "";
    if (numeroNivel == 1) {
        const n0 = notasNivel.find(f => f[colNivelReal] == 0);
        const n1 = notasNivel.find(f => f[colNivelReal] == 1);

        if (n0 && n1) {
            // --- LIMPIEZA DE NOMBRES AQUÍ ---
            const nombre0 = n0[colNotaReal].split('_')[0];
            const nombre1 = n1[colNotaReal].split('_')[0];

            mensaje = `En este nivel practicaremos y aprenderemos las notas <b>${nombre0}</b> y <b>${nombre1}</b>. Aquí te mostramos un ejemplo de estas notas respectivamente. Recuerda que el nombre de la nota dependerá de donde se dibuje el ovalo. <br><br> ¿Todo listo para empezar?`;
            
            //mensaje = `En este nivel practicaremos y aprenderemos las notas <b>${nombre0}</b> y <b>${nombre1}</b> en la ${nombreClaveActual}. Aquí te mostramos un ejemplo de estas notas respectivamente. Recuerda que el nombre de la nota dependerá de donde se dibuje el ovalo. <br><br> ¿Todo listo para empezar?`;
            
            [n0, n1].forEach(n => {
                const img = document.createElement('img');
                img.src = `resources/notas/${n[colImagenReal]}.png`;
                div_Popup_Nivel_Imagenes.appendChild(img);
            });
        }
    } else {
        const nAct = notasNivel[0];
        
        // --- LIMPIEZA DE NOMBRE AQUÍ ---
        const nombreActual = nAct[colNotaReal].split('_')[0];

        mensaje = `En este nivel practicaremos la nota <b>${nombreActual}</b>, aquí te mostramos un ejemplo de esta nota, también repasaremos las notas de los niveles anteriores. Recuerda que el nombre de la nota dependerá de donde se dibuje el ovalo. <br><br> ¿Todo listo para empezar?`;
        
        //mensaje = `En este nivel practicaremos la nota <b>${nombreActual}</b>, aquí te mostramos un ejemplo de esta nota, también repasaremos las notas de los niveles anteriores en la ${nombreClaveActual}. Recuerda que el nombre de la nota dependerá de donde se dibuje el ovalo. <br><br> ¿Todo listo para empezar?`;
        
        const img = document.createElement('img');
        img.src = `resources/notas/${nAct[colImagenReal]}.png`;
        div_Popup_Nivel_Imagenes.appendChild(img);
    }

    // --- IMAGEN FINAL (Se añade al final de las notas) ---
    const imgFinal = document.createElement('img');
    imgFinal.src = 'resources/otros/final.png';
    div_Popup_Nivel_Imagenes.appendChild(imgFinal);
    
    p_Popup_Nivel_Descripcion.innerHTML = mensaje;

    // 6. Programar botón Aceptar
    btn_Popup_Nivel_Aceptar.onclick = function() {
        Cerrar_Popup_Nivel();
        Seleccionar_Nivel_Para_Jugar(numeroNivel);
    };

    div_Popup_Informacion_Nivel.classList.remove('oculto');
    
    //console.log(Modo_Juego_Actual);
}


//-------------------------Cierra el popup visualmente
function Cerrar_Popup_Nivel() {
    div_Popup_Informacion_Nivel.classList.add('oculto');
}

//////////////////////////////////////////////////////
//                                                  //
//         EVENTOS DE CIERRE DEL POPUP              //
//                                                  //
//////////////////////////////////////////////////////

btn_Popup_Nivel_Cerrar.addEventListener('click', Cerrar_Popup_Nivel);
btn_Popup_Nivel_Cancelar.addEventListener('click', Cerrar_Popup_Nivel);

// Cerrar si hacen clic fuera del cuadro blanco (en el fondo oscuro)
div_Popup_Informacion_Nivel.addEventListener('click', function(e) {
    if (e.target === div_Popup_Informacion_Nivel) {
        Cerrar_Popup_Nivel();
    }
});


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE CONFIGURACIÓN DE VISTA         //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Configura qué elementos ve el invitado o el usuario
function Inicializar_Vista_Niveles() {
    /* 
    if (Usuario_Actual !== null) {
        div_Desbloquear_Niveles.classList.add('oculto');
    } else {
        div_Desbloquear_Niveles.classList.remove('oculto');
    }
    chk_desbloquear_niveles.checked = false;
    */
}