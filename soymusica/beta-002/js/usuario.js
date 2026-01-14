//////////////////////////////////////////////////////
//                                                  //
//         RUTAS Y CONSTANTES DE SEGURIDAD          //
//                                                  //
//////////////////////////////////////////////////////

const ruta_Actualizar_Sesion = "js/cn/f_ultima_sesion.php";
const LLAVE_PERSISTENCIA = 'usuario_soymusica_978120_VI_562738_BQ';


//////////////////////////////////////////////////////
//                                                  //
//         VARIABLES GLOBALES DE USUARIO             //
//                                                  //
//////////////////////////////////////////////////////

// Leemos el estado del usuario al cargar el archivo
let Usuario_Actual = localStorage.getItem(LLAVE_PERSISTENCIA) || null;


//////////////////////////////////////////////////////
//                                                  //
//         FUNCIONES DE ACTIVIDAD (SERVIDOR)        //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Actualiza la fecha en la DB y detecta sesiones caducadas
async function Actualizar_Sesion_Usuario(usuario) {
    const datos_a_enviar = { usuario: usuario };

    try {
        const respuesta = await fetch(ruta_Actualizar_Sesion, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos_a_enviar)
        });

        // Verificamos si la respuesta del servidor es correcta
        if (!respuesta.ok) { throw new Error("Error de red"); }

        const datos = await respuesta.json();

        if (datos.success) {
            console.log("Actividad renovada para: " + usuario);
        } else {
            // El servidor detectó un problema (usuario eliminado o sesión inválida)
            Sesion_Caducada_Error();
        }

    } catch (error) {
        // Error de conexión o base de datos caída
        console.error('Error de conexión:', error);
        Sesion_Caducada_Error();
    }
}

//-------------------------Limpia todo y expulsa al usuario al inicio
function Sesion_Caducada_Error() {
    alert("Ha ocurrido un error y tu sesión se ha cerrado, vuelve a iniciar sesión.");
    localStorage.removeItem(LLAVE_PERSISTENCIA);
    Usuario_Actual = null;
    Ir_Al_Inicio(); // Función de navegacion.js
}


//////////////////////////////////////////////////////
//                                                  //
//         GESTIÓN DE SESIÓN Y BIENVENIDA           //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Configura el saludo y el botón según el estado
function Inicializar_Estado_Usuario() {
    if (Usuario_Actual !== null) {
        // --- ESTADO: USUARIO REGISTRADO ---
        p_Bienvenida.innerHTML = '¡Hola ' + Usuario_Actual + '! Te doy la bienvenida. ¿Qué quieres hacer hoy?';
        btn_Cerrar_Sesion.innerHTML = 'Cerrar Sesión';
        
        // Intentamos actualizar su actividad en el servidor
        Actualizar_Sesion_Usuario(Usuario_Actual);
        
    } else {
        // --- ESTADO: INVITADO ---
        p_Bienvenida.innerHTML = '¡Hola! Le doy la bienvenida a nuestro invitado(a). ¿Qué quieres hacer hoy?';
        btn_Cerrar_Sesion.innerHTML = 'Iniciar Sesión / Registrarse';
        console.log("Navegando como invitado.");
    }
}

//-------------------------Maneja la acción del botón de salida/entrada
function Manejar_Accion_Cerrar_Sesion() {
    if (Usuario_Actual !== null) {
        // 1. Mostrar cuadro de confirmación
        const respuesta = confirm("¿Seguro que deseas cerrar sesión?");
        
        // 2. Si el usuario acepta (clic en Aceptar)
        if (respuesta) {
            localStorage.removeItem(LLAVE_PERSISTENCIA);
            Usuario_Actual = null;
            alert("Has cerrado sesión correctamente.");
            Ir_Al_Inicio();
        }
        // Si cancela, no hace nada y el usuario se queda donde está
        
    } else {
        // Si es invitado, solo vamos al inicio sin preguntar
        Ir_Al_Inicio();
    }
}


//////////////////////////////////////////////////////
//                                                  //
//         MANTENIMIENTO DEL PERFIL                 //
//                                                  //
//////////////////////////////////////////////////////

/* 
   -----------------------------------------------------------
   A FUTURO: Aquí añadiremos la lógica para cambiar contraseña
   -----------------------------------------------------------
*/


//////////////////////////////////////////////////////
//                                                  //
//         EVENTOS E INICIALIZACIÓN                 //
//                                                  //
//////////////////////////////////////////////////////

// Asignar el evento al botón dinámico
btn_Cerrar_Sesion.addEventListener('click', Manejar_Accion_Cerrar_Sesion);

// Ejecutar la configuración inicial al cargar el script
Inicializar_Estado_Usuario();