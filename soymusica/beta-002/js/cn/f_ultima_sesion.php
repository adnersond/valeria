<?php
// f_ultima_sesion.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db_conection.php';

function handleUpdateSession($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        return ['success' => false, 'message' => 'Método no permitido.'];
    }

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['usuario'])) {
        return ['success' => false, 'message' => 'Usuario no proporcionado.'];
    }

    $usuario = trim($data['usuario']);

    if (empty($usuario)) {
        return ['success' => false, 'message' => 'El nombre de usuario está vacío.'];
    }

    // Llamar a la función para actualizar la fecha en la DB
    return actualizarUltimaSesion($conn, $usuario);
}

$response = handleUpdateSession($conn);
echo json_encode($response);

$conn->close();
?>