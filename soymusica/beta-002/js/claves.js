//////////////////////////////////////////////////////
//                                                  //
//         VARIABLES Y DICCIONARIOS                 //
//                                                  //
//////////////////////////////////////////////////////

// Diccionario para obtener los nombres según el tipo
const NOMBRES_CLAVES = {
    "sol_2": { sn: "Clave de Sol", fn: "Clave de Sol en 2ª Línea" },
    "fa_4": { sn: "Clave de Fa", fn: "Clave de Fa en 4ª Línea" },
    "do_3": { sn: "Clave de Do en 3ª Línea", fn: "Clave de Do en 3ª Línea" },
    "do_4": { sn: "Clave de Do en 4ª Línea", fn: "Clave de Do en 4ª Línea" },
    "do_1": { sn: "Clave de Do en 1ª Línea", fn: "Clave de Do en 1ª Línea" },
    "do_2": { sn: "Clave de Do en 2ª Línea", fn: "Clave de Do en 2ª Línea" },
    "fa_3": { sn: "Clave de Fa en 3ª Línea", fn: "Clave de Fa en 3ª Línea" },
    "sol_1": { sn: "Clave de Sol en 1ª Línea", fn: "Clave de Sol en 1ª Línea" }
};

// Listado de IDs de claves para bucles
const IDS_CLAVES = ["sol_2", "fa_4", "do_3", "do_4", "do_1", "do_2", "fa_3", "sol_1"];

//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE VISIBILIDAD DINÁMICA           //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Controla qué se ve basándose en Modo, Combo e Interruptor
function Actualizar_Interfaz_Claves() {
    const modoFiltro = sel_Modo_Clave.value;
    const seleccionMultipleActiva = chk_Seleccionar_Varios_Niveles.checked;

    if (seleccionMultipleActiva) {
        div_Botones_Claves.classList.add('oculto');
        div_Checkbox_Claves.classList.remove('oculto');
        
        legend_Clave.innerHTML = "Elije tus claves:";
    } else {
        div_Botones_Claves.classList.remove('oculto');
        div_Checkbox_Claves.classList.add('oculto');
        
        legend_Clave.innerHTML = "Elije una clave:";
        
        // --- NUEVA LÓGICA: Resetear checks al desactivar el interruptor ---
        IDS_CLAVES.forEach(id => {
            document.getElementById(`chk_clave_${id}`).checked = false;
        });
    }

    // (El resto de la lógica de visibilidad de botones y checks se queda igual...)
    IDS_CLAVES.forEach(id => {
        const btn = document.getElementById(`btn_clave_${id}`);
        const divCheck = document.getElementById(`div_chk_clave_${id}`);
        const nivelMax = Obtener_Nivel_Maximo_Clave(id);
        const esClasica = (id === "sol_2" || id === "fa_4");

        if (nivelMax === 0) {
            btn.classList.add('oculto');
            divCheck.classList.add('oculto');
        } else {
            if (modoFiltro === "clasicas" && !esClasica) {
                btn.classList.add('oculto');
                divCheck.classList.add('oculto');
            } else {
                btn.classList.remove('oculto');
                divCheck.classList.remove('oculto');
            }
        }
        const texto = (modoFiltro === "clasicas") ? NOMBRES_CLAVES[id].sn : NOMBRES_CLAVES[id].fn;
        btn.innerHTML = texto;
        divCheck.querySelector('label').innerHTML = texto;
    });
}

//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE POPUP Y NAVEGACIÓN             //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Prepara el popup para el modo Desafío
function Abrir_Confirmacion_Desafio(clavesSeleccionadas) {
    const cantidad = clavesSeleccionadas.length;
    if (cantidad === 0) {
        alert("Debes seleccionar al menos una clave.");
        return;
    }

    const modoCombo = (sel_Modo_Clave.value === "clasicas") ? "sn" : "fn";
    let listaNombresHtml = "";
    let clefParamFinal = "";

    // 1. Construir el Título del Popup y el parámetro de URL
    if (cantidad === 1) {
        // --- CASO SELECCIÓN ÚNICA ---
        const idUnico = clavesSeleccionadas[0];
        listaNombresHtml = NOMBRES_CLAVES[idUnico][modoCombo];
        clefParamFinal = `${idUnico}-${modoCombo}`; // Ejemplo: sol_2-sn
    } else {
        // --- CASO SELECCIÓN MÚLTIPLE ---
        clavesSeleccionadas.forEach(id => {
            listaNombresHtml += NOMBRES_CLAVES[id][modoCombo] + "<br>";
        });
        clefParamFinal = clavesSeleccionadas.join('-') + "-mc"; // Ejemplo: sol_2-fa_4-mc
    }

    h2_Popup_Desafio_Titulo.innerHTML = listaNombresHtml;
    const articulo = (cantidad > 1) ? "las" : "la";
    const sustantivo_clave = (cantidad > 1) ? "claves" : "clave";
    const adjetivo_clave = (cantidad > 1) ? "seleccionadas" : "seleccionada";
    
    p_Popup_Desafio_Mensaje.innerHTML = `Estás a punto de practicar ${articulo} ${sustantivo_clave} ${adjetivo_clave} en su máximo nivel. <br><br> ¿Todo listo para empezar?`;

    btn_Popup_Desafio_Aceptar.onclick = function() {
        div_Popup_Confirmacion_Desafio.classList.add('oculto');
        const nivelParaJugar = Obtener_Nivel_Maximo_Clave(clavesSeleccionadas[0]);

        actualizarMultiplesParametrosURL({
            view: 'game',
            mode: Modo_Juego_Actual,
            clef: clefParamFinal,
            game_level: nivelParaJugar
        });
        mostrar_Div_Game();
    };

    div_Popup_Confirmacion_Desafio.classList.remove('oculto');
}

//-------------------------Función que se ejecuta al hacer clic en un botón de clave
function Manejar_Clic_Clave_Unica(idBoton) {
    const idLimpio = idBoton.replace('btn_clave_', '');
    
    if (Modo_Juego_Actual === 'learning-mode') {
        // MODO APRENDIZAJE: Ir a Niveles
        const sufijo = (sel_Modo_Clave.value === "clasicas") ? "sn" : "fn";
        Clave_Actual = idLimpio;
        Tipo_Nombre_Actual = sufijo;
        Actualizar_H2_Niveles();

        actualizarMultiplesParametrosURL({ 
            view: 'level-select', 
            mode: Modo_Juego_Actual,
            clef: `${idLimpio}-${sufijo}`
        });
        mostrar_Div_Level_Select();
        Cargar_Y_Dibujar_Niveles();
    } else {
        // MODO DESAFÍO (Selección Única): Abrir Popup
        Abrir_Confirmacion_Desafio([idLimpio]);
    }
}

//////////////////////////////////////////////////////
//                                                  //
//         EVENTOS                                  //
//                                                  //
//////////////////////////////////////////////////////

// Cambio en Combo o en Interruptor
sel_Modo_Clave.addEventListener('change', Actualizar_Interfaz_Claves);
chk_Seleccionar_Varios_Niveles.addEventListener('change', Actualizar_Interfaz_Claves);

// Clic en botones individuales
IDS_CLAVES.forEach(id => {
    document.getElementById(`btn_clave_${id}`).addEventListener('click', function() {
        Manejar_Clic_Clave_Unica(this.id);
    });
});

// Clic en botón Aceptar (Selección Múltiple)
btn_Aceptar_Multiples_Claves.addEventListener('click', function() {
    const seleccionadas = [];
    IDS_CLAVES.forEach(id => {
        if (document.getElementById(`chk_clave_${id}`).checked) {
            seleccionadas.push(id);
        }
    });
    Abrir_Confirmacion_Desafio(seleccionadas);
});


// Eventos de cierre del popup desafío
btn_Popup_Desafio_Cerrar.onclick = () => div_Popup_Confirmacion_Desafio.classList.add('oculto');
btn_Popup_Desafio_Cancelar.onclick = () => div_Popup_Confirmacion_Desafio.classList.add('oculto');

//////////////////////////////////////////////////////
//                                                  //
//         INICIALIZACIÓN                           //
//                                                  //
//////////////////////////////////////////////////////

// Se llama desde Gestionar_Navegacion_URL en navegacion.js
/*function Configurar_Vista_Claves_Segun_Modo() {
    // 1. Resetear todos los checkboxes
    /*chk_Seleccionar_Varios_Niveles.checked = false;
    IDS_CLAVES.forEach(id => {
        document.getElementById(`chk_clave_${id}`).checked = false;
    });*/

    // 2. Mostrar u ocultar el interruptor maestro
    /*if (Modo_Juego_Actual === 'learning-mode') {
        div_Checkbox_Seleccionar_Varios_Niveles.classList.add('oculto');
        
        h2_Div_Clave.innerHTML = "Modo Aprendizaje";
        h5_Div_Clave.innerHTML = 'En este modo podrás avanzar progresivamente o seleccionar el nivel que tú deseas practicar.';
        
        legend_Clave.innerHTML = "Elije una clave:";
    } else {
        div_Checkbox_Seleccionar_Varios_Niveles.classList.remove('oculto');
        
        h2_Div_Clave.innerHTML = "Modo Desafío";
        h5_Div_Clave.innerHTML = 'En este modo pondrás a prueba tus conocimientos en el máximo nivel.';
        
        legend_Clave.innerHTML = "Elije una clave:";
        
    }

    // 3. Actualizar la interfaz para que muestre los botones (por el reset del check maestro)
    Actualizar_Interfaz_Claves();
}*/


// Se añade 'async' para poder esperar la carga del Excel
/*async function Configurar_Vista_Claves_Segun_Modo() {
    // 1. Ocultar contenedores y mostrar mensaje de carga en el legend
    div_Botones_Claves.classList.add('oculto');
    div_Checkbox_Claves.classList.add('oculto');
    div_Checkbox_Seleccionar_Varios_Niveles.classList.add('oculto');
    legend_Clave.innerHTML = "Cargando claves...";

    // 2. SI LOS DATOS NO ESTÁN, LOS ESPERAMOS (Igual que en niveles.js)
    if (Datos_Excel_Global === null) {
        await Cargar_Excel_En_Memoria();
    }

    // 3. Configurar textos según el modo de juego
    if (Modo_Juego_Actual === 'learning-mode') {
        div_Checkbox_Seleccionar_Varios_Niveles.classList.add('oculto');
        h2_Div_Clave.innerHTML = "Modo Aprendizaje";
        h5_Div_Clave.innerHTML = 'En este modo podrás avanzar progresivamente o seleccionar el nivel que tú deseas practicar.';
        legend_Clave.innerHTML = "Elije una clave:";
    } else {
        div_Checkbox_Seleccionar_Varios_Niveles.classList.remove('oculto');
        h2_Div_Clave.innerHTML = "Modo Desafío";
        h5_Div_Clave.innerHTML = 'En este modo pondrás a prueba tus conocimientos en el máximo nivel.';
        legend_Clave.innerHTML = "Elije una clave:";
    }

    // 4. Una vez tenemos los datos, actualizamos la interfaz para mostrar los botones
    Actualizar_Interfaz_Claves();
}*/


// Se añade 'async' para poder esperar la carga del Excel
async function Configurar_Vista_Claves_Segun_Modo() {
    // 1. Ocultar contenedores de botones y checks para que no se vean vacíos
    div_Botones_Claves.classList.add('oculto');
    div_Checkbox_Claves.classList.add('oculto');
    div_Checkbox_Seleccionar_Varios_Niveles.classList.add('oculto');

    // 2. Crear el elemento <p> de carga (igual que en niveles)
    const p_Cargando = document.createElement('p');
    p_Cargando.id = "p_Mensaje_Carga_Claves";
    p_Cargando.innerHTML = "Cargando claves...";
    p_Cargando.style.textAlign = "center"; // Para mantener la estética
    
    // Lo insertamos dentro del fieldset (el padre de legend_Clave)
    legend_Clave.parentNode.appendChild(p_Cargando);

    // 3. SI LOS DATOS NO ESTÁN, LOS ESPERAMOS
    if (Datos_Excel_Global === null) {
        await Cargar_Excel_En_Memoria();
    }

    // 4. Una vez cargado, eliminamos el mensaje de carga del DOM
    p_Cargando.remove();

    // 5. Configurar textos según el modo de juego
    if (Modo_Juego_Actual === 'learning-mode') {
        h2_Div_Clave.innerHTML = "Modo Aprendizaje";
        h5_Div_Clave.innerHTML = 'En este modo podrás avanzar progresivamente o seleccionar el nivel que tú deseas practicar.';
    } else {
        // Solo en modo desafío mostramos el interruptor de selección múltiple
        div_Checkbox_Seleccionar_Varios_Niveles.classList.remove('oculto');
        h2_Div_Clave.innerHTML = "Modo Desafío";
        h5_Div_Clave.innerHTML = 'En este modo pondrás a prueba tus conocimientos en el máximo nivel.';
    }

    // 6. Actualizar la interfaz (Esto mostrará los botones y pondrá el texto correcto al legend)
    Actualizar_Interfaz_Claves();
}