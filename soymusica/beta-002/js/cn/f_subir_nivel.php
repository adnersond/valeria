<?php
// f_subir_nivel.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db_conection.php';

function handleUpdateLevel($conn) {
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
    $nuevoNivel = isset($data['nuevoNivel']) ? (int)$data['nuevoNivel'] : 0;

    if (empty($usuario) || empty($clave) || $nuevoNivel <= 0) {
        return ['success' => false, 'message' => 'Datos de actualización incompletos.'];
    }

    // Llamar a la función en db_conection
    return subirNivelUsuario($conn, $usuario, $clave, $nuevoNivel);
}

$response = handleUpdateLevel($conn);
echo json_encode($response);

$conn->close();
?>