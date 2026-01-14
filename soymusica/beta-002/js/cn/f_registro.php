<?php
// f_registro.php

// Cabeceras para permitir CORS e indicar formato JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Incluir la conexión (que ya tiene las funciones de seguridad con Sentencias Preparadas)
require_once 'db_conection.php';

/**
 * Función principal para manejar el registro
 */
function handleRegistration($conn) {
    // 1. Verificar el método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        return ['success' => false, 'message' => 'Método no permitido.'];
    }

    // 2. Obtener datos JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        return ['success' => false, 'message' => 'No se recibieron datos válidos.'];
    }

    // 3. Extraer y limpiar datos
    $usuario = isset($data['usuario']) ? trim($data['usuario']) : '';
    $contrasenna = isset($data['contrasenna']) ? trim($data['contrasenna']) : '';

    // 4. VALIDACIONES DE BACKEND (Consistentes con tu JS y HTML)
    
    // Validar Usuario (6 a 15 caracteres)
    if (strlen($usuario) < 6 || strlen($usuario) > 15) {
        return ['success' => false, 'message' => 'El usuario debe tener entre 6 y 15 caracteres.'];
    }

    // Validar Contraseña (6 a 15 caracteres)
    if (strlen($contrasenna) < 6 || strlen($contrasenna) > 15) {
        return ['success' => false, 'message' => 'La contraseña debe tener entre 6 y 15 caracteres.'];
    }

    // 5. Intentar registrar (la función registrarUsuario en db_conection ya verifica si existe)
    return registrarUsuario($conn, $usuario, $contrasenna);
}

// Ejecutar y devolver respuesta
$response = handleRegistration($conn);
echo json_encode($response);

// Cerrar conexión
$conn->close();
?>