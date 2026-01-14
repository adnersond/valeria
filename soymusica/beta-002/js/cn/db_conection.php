<?php
// db_conection.php
//ONLINE
$servername = "sql101.infinityfree.com"; 
$username = "if0_40062938";
$password = "ZNOh5rcHNWLzwt";
$database = "if0_40062938_db_soy_musica";

//LOCAL 1
/*$servername = "localhost"; 
$username = "admin";
$password = "123456";
$database = "db_soy_musica";*/

//LOCAL 2
/*$servername = "localhost";
$username = "root"; 
$password = ""; 
$database = "db_soy_musica";*/

// Crear conexión
$conn = new mysqli($servername, $username, $password, $database);

// Verificar conexión
if ($conn->connect_error) {
    // En producción, es mejor no mostrar el error detallado, pero para desarrollo está bien
    die(json_encode(['success' => false, 'message' => "Conexión fallida: " . $conn->connect_error]));
}

// Establecer el juego de caracteres a utf8 para evitar problemas con tildes/eñes
$conn->set_charset("utf8");






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA ELIMINAR USUARIOS INACTIVOS
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * ELIMINAR USUARIOS INACTIVOS
 * Se ha mejorado para que la base de datos calcule el tiempo directamente.
 * Ahora devuelve cuántos registros se eliminaron.
 */
/*function eliminarUsuariosInactivos($conn) {
    // Usamos INTERVAL de SQL para que sea más legible y eficiente
    // Eliminamos usuarios que no han iniciado sesión en los últimos 6 meses
    $sql = "DELETE FROM tb_usuarios WHERE ultima_sesion < NOW() - INTERVAL 6 MONTH";

    if ($conn->query($sql) === TRUE) {
        // Devolvemos el número de filas afectadas (cuántos usuarios se borraron)
        return $conn->affected_rows; 
    } else {
        return 0;
    }
}*/

//FUNCION PARA ELIMINAR DE AMBAS TABLAS
function eliminarUsuariosInactivos($conn) {
    // 1. Primero identificamos a los usuarios que llevan más de 6 meses inactivos
    // y los eliminamos de la tabla de progreso
    $sqlProgreso = "DELETE FROM tb_progreso 
                    WHERE usuario IN (SELECT usuario FROM tb_usuarios WHERE ultima_sesion < NOW() - INTERVAL 6 MONTH)";
    
    $conn->query($sqlProgreso);

    // 2. Ahora eliminamos a los usuarios de la tabla principal
    $sqlUsuarios = "DELETE FROM tb_usuarios WHERE ultima_sesion < NOW() - INTERVAL 6 MONTH";

    if ($conn->query($sqlUsuarios) === TRUE) {
        // Devolvemos el número de usuarios eliminados
        return $conn->affected_rows; 
    } else {
        return 0;
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA REGISTRAR UN NUEVO USUARIO
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * REGISTRAR UN NUEVO USUARIO CON PROGRESO INICIAL
 * Utiliza una Transacción para asegurar que se registre en ambas tablas o en ninguna.
 */
function registrarUsuario($conn, $usuario, $contrasenna) {
    // 1. Verificar si el usuario ya existe
    if (verificarUsuarioExistente($conn, $usuario)) {
        return ['success' => false, 'message' => 'El nombre de usuario ya existe.'];
    }

    $contrasenna_encriptada = password_hash($contrasenna, PASSWORD_DEFAULT);

    // 2. Iniciar la transacción
    $conn->begin_transaction();

    try {
        // --- PASO 1: Insertar en tb_usuarios ---
        $stmt1 = $conn->prepare("INSERT INTO tb_usuarios (usuario, contrasenna, ultima_sesion) VALUES (?, ?, NOW())");
        $stmt1->bind_param("ss", $usuario, $contrasenna_encriptada);
        
        if (!$stmt1->execute()) {
            throw new Exception("Error al crear la cuenta de usuario.");
        }
        $stmt1->close();

        // --- PASO 2: Insertar en tb_progreso ---
        // Se inicializan todas las claves en nivel 1
        $sqlProgreso = "INSERT INTO tb_progreso (usuario, sol_2, fa_4, do_3, do_4, do_1, do_2, fa_3, sol_1) 
                        VALUES (?, 1, 1, 1, 1, 1, 1, 1, 1)";
        
        $stmt2 = $conn->prepare($sqlProgreso);
        $stmt2->bind_param("s", $usuario);
        
        if (!$stmt2->execute()) {
            throw new Exception("Error al inicializar el progreso del juego.");
        }
        $stmt2->close();

        // --- FINALIZACIÓN: Si todo salió bien, confirmamos los cambios ---
        $conn->commit();
        return ['success' => true, 'message' => 'Usuario registrado exitosamente.'];

    } catch (Exception $e) {
        // --- ERROR: Si algo falló, deshacemos TODO lo anterior ---
        $conn->rollback();
        return ['success' => false, 'message' => 'El registro falló: ' . $e->getMessage()];
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA VERIFICAR SI YA EXISTE EL USUARIO ANTES DEL REGISTRO
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * VERIFICAR SI YA EXISTE EL USUARIO
 * (Mejorada con Sentencias Preparadas)
 */
function verificarUsuarioExistente($conn, $usuario) {
    // 1. Preparamos la consulta (el "?" es un marcador de posición)
    $stmt = $conn->prepare("SELECT usuario FROM tb_usuarios WHERE usuario = ? LIMIT 1");
    
    // 2. Vinculamos el parámetro ("s" significa que el dato es un string)
    $stmt->bind_param("s", $usuario);
    
    // 3. Ejecutamos
    $stmt->execute();
    
    // 4. Guardamos el resultado para contar filas
    $stmt->store_result();
    $existe = $stmt->num_rows > 0;
    
    $stmt->close();
    return $existe;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA LOGUEARSE
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * AUTENTICAR USUARIO (LOGIN)
 */
function autenticarUsuario($conn, $usuario, $contrasenna) {
    // 1. Buscamos al usuario en la base de datos
    $stmt = $conn->prepare("SELECT contrasenna FROM tb_usuarios WHERE usuario = ? LIMIT 1");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($fila = $resultado->fetch_assoc()) {
        // 2. El usuario existe, ahora verificamos la contraseña
        // password_verify compara el texto plano con el hash de la DB
        if (password_verify($contrasenna, $fila['contrasenna'])) {
            
            // 3. Login correcto: Actualizamos la última sesión
            $stmt_update = $conn->prepare("UPDATE tb_usuarios SET ultima_sesion = NOW() WHERE usuario = ?");
            $stmt_update->bind_param("s", $usuario);
            $stmt_update->execute();
            $stmt_update->close();

            return ['success' => true, 'message' => '¡Bienvenido!'];
        } else {
            // Contraseña incorrecta
            return ['success' => false, 'message' => 'Usuario o contraseña incorrectos.'];
        }
    } else {
        // Usuario no encontrado
        return ['success' => false, 'message' => 'Usuario o contraseña incorrectos.'];
    }

    $stmt->close();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA ACTUALIZAR LA FECHA DE ULTIMA SESION
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * ACTUALIZAR ÚLTIMA SESIÓN (ACTIVIDAD)
 */
/*function actualizarUltimaSesion($conn, $usuario) {
    $stmt = $conn->prepare("UPDATE tb_usuarios SET ultima_sesion = NOW() WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Sesión actualizada.'];
    } else {
        return ['success' => false, 'message' => 'Error al actualizar sesión: ' . $stmt->error];
    }
    $stmt->close();
}*/
function actualizarUltimaSesion($conn, $usuario) {
    // 1. Verificamos primero si el usuario existe en la base de datos
    if (!verificarUsuarioExistente($conn, $usuario)) {
        return ['success' => false, 'message' => 'Usuario inexistente.'];
    }

    // 2. Si existe, procedemos a actualizar la fecha
    // Ya no nos importa si affected_rows es 0 o 1, porque ya sabemos que el usuario está ahí.
    $stmt = $conn->prepare("UPDATE tb_usuarios SET ultima_sesion = NOW() WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $stmt->close();

    return ['success' => true, 'message' => 'Actividad renovada.'];
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA OBTENER EL PROGRESO DEL USUARIO
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Consulta el nivel máximo alcanzado por un usuario en una clave específica.
 */
function obtenerProgresoUsuario($conn, $usuario, $clave) {
    // 1. Lista de columnas permitidas (Seguridad)
    $columnasValidas = ['sol_2', 'fa_4', 'do_3', 'do_4', 'do_1', 'do_2', 'fa_3', 'sol_1'];
    
    // Si la clave enviada no está en la lista, rechazamos la petición
    if (!in_array($clave, $columnasValidas)) {
        return ['success' => false, 'message' => 'Clave musical no válida.'];
    }

    // 2. Preparar la consulta
    // Nota: El nombre de la columna ($clave) no se puede pasar como parámetro "?" 
    // pero al validarlo contra el array anterior, es 100% seguro.
    $stmt = $conn->prepare("SELECT $clave FROM tb_progreso WHERE usuario = ? LIMIT 1");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($fila = $resultado->fetch_assoc()) {
        // Devolvemos el valor numérico de la columna solicitada
        return [
            'success' => true, 
            'nivel' => (int)$fila[$clave]
        ];
    } else {
        // Si el usuario no tiene fila en tb_progreso (no debería pasar por nuestra transacción)
        return [
            'success' => false, 
            'message' => 'No se encontró registro de progreso.'
        ];
    }

    $stmt->close();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                                  FUNCION PARA ACTUALIZAR PROGRESO (SUBIR NIVEL)
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Incrementa el nivel del usuario en una clave específica.
 */
/*function subirNivelUsuario($conn, $usuario, $clave, $nuevoNivel) {
    // 1. Validar columna (Seguridad)
    $columnasValidas = ['sol_2', 'fa_4', 'do_3', 'do_4', 'do_1', 'do_2', 'fa_3', 'sol_1'];
    if (!in_array($clave, $columnasValidas)) {
        return ['success' => false, 'message' => 'Clave no válida.'];
    }

    // 2. Verificar el nivel actual para no sobreescribir con un nivel menor
    $stmtCheck = $conn->prepare("SELECT $clave FROM tb_progreso WHERE usuario = ?");
    $stmtCheck->bind_param("s", $usuario);
    $stmtCheck->execute();
    $res = $stmtCheck->get_result();
    $fila = $res->fetch_assoc();
    
    if ($fila && (int)$fila[$clave] >= $nuevoNivel) {
        // Si el nivel en la DB ya es igual o mayor al que queremos subir, no hacemos nada
        return ['success' => true, 'message' => 'El progreso ya estaba registrado.'];
    }
    $stmtCheck->close();

    // 3. Actualizar al nuevo nivel
    $stmt = $conn->prepare("UPDATE tb_progreso SET $clave = ? WHERE usuario = ?");
    $stmt->bind_param("is", $nuevoNivel, $usuario);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Nivel desbloqueado con éxito.'];
    } else {
        return ['success' => false, 'message' => 'Error al actualizar el progreso: ' . $stmt->error];
    }
    $stmt->close();
}*/
/**
 * ACTUALIZAR NIVEL Y RENOVACIÓN DE SESIÓN (TRANSACCIONAL)
 * Actualiza tb_progreso (si el nivel es mayor) y tb_usuarios (última_sesion)
 */
function subirNivelUsuario($conn, $usuario, $clave, $nuevoNivel) {
    // 1. Validar columna por seguridad
    $columnasValidas = ['sol_2', 'fa_4', 'do_3', 'do_4', 'do_1', 'do_2', 'fa_3', 'sol_1'];
    if (!in_array($clave, $columnasValidas)) {
        return ['success' => false, 'message' => 'Clave musical no válida.'];
    }

    // 2. INICIAR TRANSACCIÓN
    $conn->begin_transaction();

    try {
        // --- PASO 1: Verificar existencia y nivel actual ---
        $stmtCheck = $conn->prepare("SELECT $clave FROM tb_progreso WHERE usuario = ? LIMIT 1");
        $stmtCheck->bind_param("s", $usuario);
        $stmtCheck->execute();
        $res = $stmtCheck->get_result();

        if (!$fila = $res->fetch_assoc()) {
            throw new Exception("Usuario no encontrado en el sistema.");
        }
        $nivelActual = (int)$fila[$clave];
        $stmtCheck->close();

        // --- PASO 2: Actualizar fecha de última sesión ---
        // Esto garantiza que el usuario no sea borrado por inactividad mientras juega
        $stmtSesion = $conn->prepare("UPDATE tb_usuarios SET ultima_sesion = NOW() WHERE usuario = ?");
        $stmtSesion->bind_param("s", $usuario);
        if (!$stmtSesion->execute()) {
            throw new Exception("Error al actualizar la actividad del usuario.");
        }
        $stmtSesion->close();

        // --- PASO 3: Actualizar el nivel (solo si el nuevo es mayor) ---
        if ($nuevoNivel > $nivelActual) {
            $stmtNivel = $conn->prepare("UPDATE tb_progreso SET $clave = ? WHERE usuario = ?");
            $stmtNivel->bind_param("is", $nuevoNivel, $usuario);
            if (!$stmtNivel->execute()) {
                throw new Exception("Error al guardar el nuevo nivel.");
            }
            $stmtNivel->close();
            $mensajeFinal = "¡Nivel superado y sesión renovada!";
        } else {
            $mensajeFinal = "Sesión renovada. Nivel ya registrado.";
        }

        // --- FINALIZACIÓN: Si todo salió bien, guardamos cambios ---
        $conn->commit();
        return ['success' => true, 'message' => $mensajeFinal];

    } catch (Exception $e) {
        // --- ERROR: Si algo falla, deshacemos todo para evitar inconsistencias ---
        $conn->rollback();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

















?>