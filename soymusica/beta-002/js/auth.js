//////////////////////////////////////////////////////
//                                                  //
//         RUTAS DE LOS ARCHIVOS PHP                //
//                                                  //
//////////////////////////////////////////////////////

const ruta_Verificar = "js/cn/f_verificar.php";
const ruta_Registro = "js/cn/f_registro.php";
const ruta_login = "js/cn/f_login.php";

// Nombre de la llave de seguridad para localStorage
//const LLAVE_PERSISTENCIA = 'usuario_soymusica_978120_VI_562738_BQ';


//////////////////////////////////////////////////////
//                                                  //
//         VARIABLES GLOBALES DE ESTADO             //
//                                                  //
//////////////////////////////////////////////////////

// Almacena si el nombre de usuario está disponible (0: No, 1: Si)
let verificar_usuario;


//////////////////////////////////////////////////////
//                                                  //
//         FUNCIONES DE LIMPIEZA                    //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Limpia los campos del área de registro
function Limpiar_Formulario_Registro() {
    txt_Usuario_Registro.value = "";
    txt_Password_Registro.value = "";
    txt_Confirmar_Password_Registro.value = "";
    
    chk_Aceptar_Terminos.checked = false;
    chk_Ver_Password_Registro.checked = false;

    p_Mensaje_Usuario.style.display = 'none';
    p_Mensaje_Password.style.display = 'none';
    p_Mensaje_Confirmar.style.display = 'none';
}

//-------------------------Limpia los campos del área de login
function Limpiar_Formulario_login() {
    txt_Usuario_login.value = "";
    txt_Password_login.value = "";
    
    chk_Ver_Password_login.checked = false;
    txt_Password_login.type = "password";
}


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE REGISTRO DE USUARIO            //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Verifica disponibilidad de nombre en tiempo real
async function Verificar_Usuario_Existente(usuario) {
    const datos_a_enviar = { usuario: usuario };

    try {
        const respuesta = await fetch(ruta_Verificar, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos_a_enviar)
        });

        const datos = await respuesta.json();

        if (datos.success) {
            if (datos.existe) {
                p_Mensaje_Usuario.style.display = 'block';
                p_Mensaje_Usuario.innerHTML = 'Este nombre de usuario ya está registrado';
                verificar_usuario = 0;
            } else {
                p_Mensaje_Usuario.style.display = 'none';
                verificar_usuario = 1;
            }
        }
    } catch (error) {
        console.error('Error en f_verificar.php:', error);
    }
}

//-------------------------Envía la petición de nuevo registro al servidor
async function Registrar_Nuevo_Usuario(usuario, contrasenna) {
    const datos_a_enviar = { usuario: usuario, contrasenna: contrasenna };

    try {
        const respuesta = await fetch(ruta_Registro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos_a_enviar)
        });

        const datos = await respuesta.json();

        if (datos.success) {
            alert("¡Registro exitoso! Ahora puedes inicar sesión.");
            Limpiar_Formulario_Registro();
            //Navegación
            actualizarParametroURL("signin"); // Antes era ("signin", "1")
            mostrar_Div_Signin(); 
            
        } else {
            alert("Error: " + datos.message);
        }
    } catch (error) {
        alert("Ocurrió un error al intentar registrar.");
    }
}


//////////////////////////////////////////////////////
//                                                  //
//         LÓGICA DE INICIO DE SESIÓN               //
//                                                  //
//////////////////////////////////////////////////////

//-------------------------Valida las credenciales e inicia sesión
async function Iniciar_Sesion_Usuario(usuario, contrasenna) {
    const datos_a_enviar = { usuario: usuario, contrasenna: contrasenna };

    try {
        const respuesta = await fetch(ruta_login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos_a_enviar)
        });

        const datos = await respuesta.json();

        if (datos.success) {
            // 1. Guardar con la nueva llave segura
            localStorage.setItem(LLAVE_PERSISTENCIA, usuario);
            
            // 2. Actualizar variable global (definida en usuario.js)
            Usuario_Actual = usuario;

            alert("Inicio de sesión exitoso");
            Limpiar_Formulario_login();

            // 3. Actualizar fecha de actividad (definida en usuario.js)
            await Actualizar_Sesion_Usuario(usuario);

            // 4. Navegación y bienvenida
            actualizarParametroURL("welcome"); 
            mostrar_Div_Welcome(); 
            p_Bienvenida.innerHTML = '¡Hola ' + Usuario_Actual + '! Te doy la bienvenida. ¿Qué quieres hacer hoy?';
            btn_Cerrar_Sesion.innerHTML = 'Cerrar Sesión';

        } else {
            alert(datos.message);
            txt_Usuario_login.focus();
        }
    } catch (error) {
        alert("Ocurrió un error al intentar iniciar sesión.");
    }
}


//////////////////////////////////////////////////////
//                                                  //
//         EVENTOS DE ACCIÓN (CLICKS / KEYUP)       //
//                                                  //
//////////////////////////////////////////////////////

// Evento para verificar usuario mientras escribe
txt_Usuario_Registro.addEventListener('keyup', async function() {
    const usuario = txt_Usuario_Registro.value;
    if(usuario.length >= 6 && usuario.length <= 15){
        await Verificar_Usuario_Existente(usuario);
    }
});

// Evento para procesar el Registro
btn_Registrar.addEventListener('click', async function() {
    const usuario = txt_Usuario_Registro.value.trim();
    const pass = txt_Password_Registro.value.trim();
    const confirm = txt_Confirmar_Password_Registro.value.trim();

    if (usuario === "" || pass === "" || confirm === "") {
        alert("Uno o más campos están vacíos");
        if (usuario === "") txt_Usuario_Registro.focus();
        else if (pass === "") txt_Password_Registro.focus();
        else txt_Confirmar_Password_Registro.focus();
        return;
    }

    if (pass !== confirm) {
        alert("Las contraseñas no coinciden");
        txt_Confirmar_Password_Registro.focus();
        return;
    }

    if (verificar_usuario !== 1) {
        alert("El nombre de usuario no está disponible.");
        txt_Usuario_Registro.focus();
        return;
    }

    if (!chk_Aceptar_Terminos.checked) {
        alert("Debes aceptar los términos y condiciones.");
        return;
    }

    await Registrar_Nuevo_Usuario(usuario, pass);
});

// Evento para procesar el Login
btn_login.addEventListener('click', async function() {
    const usuario = txt_Usuario_login.value.trim();
    const pass = txt_Password_login.value.trim();

    if (usuario === "" || pass === "") {
        alert("Hay uno o más campos vacíos");
        if (usuario === "") txt_Usuario_login.focus();
        else txt_Password_login.focus();
        return;
    }

    await Iniciar_Sesion_Usuario(usuario, pass);
});