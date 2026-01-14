//////////////////////////////////////////////////////
//                                                  //
//      FUNCION PARA VALIDAR LA ENTRADA DE TEXTO    //
//                                                  //
//////////////////////////////////////////////////////

function validar_Input(event) {
    const input = event.target;
    const valor = input.value;
    const nuevoCaracter = event.key;

    // Expresión regular para permitir solo letras, números y guión bajo
    let regex;

    if (valor.length === 0) {
        // Si es el primer carácter, permitir solo letras y números
        regex = /^[a-zA-Z0-9ñÑ]+$/;
    } else {
        // Permitir letras, números y guión bajo
        regex = /^[a-zA-Z0-9ñÑ_]+$/;
      
        // Evitar doble guión bajo seguido
        if (valor.slice(-1) === "_" && nuevoCaracter === "_") {
            event.preventDefault();
            return;
        }
    }

    // Verificar si el carácter ingresado coincide con la expresión regular
    if (!regex.test(event.key)) {
        event.preventDefault();
    }

    // Limitar la longitud a 15 caracteres
    if (valor.length >= 15) {
        event.preventDefault();
    }
}


//////////////////////////////////////////////////////
//                                                  //
//   EJECUTA LA FUNCION AL PRESIONAR LAS TECLAS     //
//                                                  //
//////////////////////////////////////////////////////

txt_Usuario_Registro.addEventListener('keypress', validar_Input);
txt_Password_Registro.addEventListener('keypress', validar_Input);
txt_Confirmar_Password_Registro.addEventListener('keypress', validar_Input);

txt_Usuario_login.addEventListener('keypress', validar_Input);
txt_Password_login.addEventListener('keypress', validar_Input);


//////////////////////////////////////////////////////
//                                                  //
//         FUNCIONES DE TECLADO PARA REGISTRO       //
//                                                  //
//////////////////////////////////////////////////////

// Inicialmente, ocultar los mensajes
p_Mensaje_Confirmar.style.display = 'none';
p_Mensaje_Usuario.style.display = 'none';
p_Mensaje_Password.style.display = 'none';

txt_Confirmar_Password_Registro.disabled = true;

// Función para validar la longitud del nombre de usuario
function validar_Longitud_Usuario() {
    if (txt_Usuario_Registro.value.length >= 6) {
        p_Mensaje_Usuario.style.display = 'none';
    } else {
        p_Mensaje_Usuario.style.display = 'block';
        p_Mensaje_Usuario.innerHTML = 'El nombre de usuario debe tener entre 6 a 15 caracteres';
    }
}

// Función para validar la longitud de la contraseña
function validar_Longitud_Password() {
    if (txt_Password_Registro.value.length >= 6) {
        p_Mensaje_Password.style.display = 'none';
        txt_Confirmar_Password_Registro.disabled = false;
    } else {
        p_Mensaje_Password.style.display = 'block';
        txt_Confirmar_Password_Registro.disabled = true;
    }
}

// Función para validar la coincidencia de contraseñas
function validar_Coincidencia_Passwords() {
    if (txt_Password_Registro.value === txt_Confirmar_Password_Registro.value) {
        p_Mensaje_Confirmar.style.display = 'none';
    } else {
        p_Mensaje_Confirmar.style.display = 'block';
    }
}

// Event listener para mostrar/ocultar la contraseña en Registro
chk_Ver_Password_Registro.addEventListener('change', function() {
    const tipo = chk_Ver_Password_Registro.checked ? 'text' : 'password';
    txt_Password_Registro.type = tipo;
    txt_Confirmar_Password_Registro.type = tipo;
    txt_Password_Registro.focus();
});


//////////////////////////////////////////////////////
//                                                  //
//         EVENTO PARA VER CONTRASEÑA login        //
//                                                  //
//////////////////////////////////////////////////////

chk_Ver_Password_login.addEventListener('change', function() {
    txt_Password_login.type = this.checked ? "text" : "password";
    txt_Password_login.focus();
});


//////////////////////////////////////////////////////
//                                                  //
//         ASIGNACIÓN DE EVENTOS KEYUP              //
//                                                  //
//////////////////////////////////////////////////////

txt_Usuario_Registro.addEventListener('keyup', validar_Longitud_Usuario);
txt_Password_Registro.addEventListener('keyup', validar_Longitud_Password);
txt_Confirmar_Password_Registro.addEventListener('keyup', validar_Coincidencia_Passwords);

//////////////////////////////////////////////////////
//                                                  //
//         NAVEGACIÓN CON TECLA ENTER               //
//                                                  //
//////////////////////////////////////////////////////

// --- EVENTOS PARA LOGIN ---

txt_Usuario_login.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        txt_Password_login.focus();
    }
});

txt_Password_login.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        btn_login.click(); // Simula el clic en el botón de Iniciar Sesión
    }
});


// --- EVENTOS PARA REGISTRO ---

txt_Usuario_Registro.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        txt_Password_Registro.focus();
    }
});

txt_Password_Registro.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Solo pasa al siguiente si no está deshabilitado
        if (!txt_Confirmar_Password_Registro.disabled) {
            txt_Confirmar_Password_Registro.focus();
        }
    }
});

txt_Confirmar_Password_Registro.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        btn_Registrar.click(); // Simula el clic en el botón de Registrarse
    }
});