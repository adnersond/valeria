<?php
// f_obtener_progreso.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db_conection.php';

/**
 * Función principal para manejar la consulta de progreso
 */
function handleGetProgress($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        return ['success' => false, 'message' => 'Método no permitido.'];
    }

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        return ['success' => false, 'message' => 'No se recibieron datos.'];
    }

    $usuario = isset($data['usuario']) ? trim($data['usuario']) : '';
    $clave = isset($data['clave']) ? trim($data['clave']) : '';

    if (empty($usuario) || empty($clave)) {
        return ['success' => false, 'message' => 'Faltan datos obligatorios (usuario o clave).'];
    }

    // Llamar a la función que añadimos a db_conection.php
    return obtenerProgresoUsuario($conn, $usuario, $clave);
}

$response = handleGetProgress($conn);
echo json_encode($response);

$conn->close();
?>