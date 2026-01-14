<?php
// f_login.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once 'db_conection.php';

function handleLogin($conn) {
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
    $contrasenna = isset($data['contrasenna']) ? trim($data['contrasenna']) : '';

    // Validaciones básicas de vacío
    if (empty($usuario) || empty($contrasenna)) {
        return ['success' => false, 'message' => 'Todos los campos son obligatorios.'];
    }

    // Llamar a la función de autenticación
    return autenticarUsuario($conn, $usuario, $contrasenna);
}

$response = handleLogin($conn);
echo json_encode($response);

$conn->close();
?>