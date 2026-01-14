<?php
// f_verificar.php

// Cabeceras para permitir CORS (Opcional, si tu frontend está en un dominio diferente)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Indicar que la respuesta será en formato JSON
header('Content-Type: application/json');

// Incluir el archivo de conexión a la base de datos y las funciones
require_once 'db_conection.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Debe ser POST.']);
    exit;
}

// Obtener los datos enviados en formato JSON
$data = json_decode(file_get_contents('php://input'), true);

// Verificar si se recibieron datos
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos.']);
    exit;
}

// Validar y sanitizar el nombre de usuario
$usuario = isset($data['usuario']) ? trim($data['usuario']) : '';
$usuario = mysqli_real_escape_string($conn, $usuario);

// Verificar si el nombre de usuario está vacío
if (empty($usuario)) {
    echo json_encode(['success' => false, 'message' => 'El nombre de usuario es obligatorio.']);
    exit;
}

// Llamar a la función para verificar si el usuario existe
$existe = verificarUsuarioExistente($conn, $usuario);

// Enviar la respuesta JSON
echo json_encode(['success' => true, 'existe' => $existe]);

// Cerrar la conexión a la base de datos
$conn->close();
?>