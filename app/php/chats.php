<?php
// 1. Configuración inicial
// Desactivar la visualización de errores en producción y activar el registro
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
error_reporting(E_ALL);

header("Content-Type: application/json; Charset=UTF-8");
date_default_timezone_set('America/Mexico_City');

// Incluir el archivo de configuración con la clave API
if (file_exists('config.php')) {
    include 'config.php';
    if (!isset($apiKey) || empty($apiKey) || $apiKey === '') {
        http_response_code(500);
        echo json_encode(['error' => 'Error de configuración: La clave API de Gemini no está definida o es la predeterminada.']);
        error_log("Error: La clave API de Gemini no está configurada en config.php.");
        exit();
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error de configuración: El archivo "config.php" no se encuentra.']);
    error_log("Error: El archivo de configuración 'config.php' no se encontró.");
    exit();
}

// Define la URL de la API de Gemini
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' . $apiKey;

// 2. Validación y Sanitización de Entradas
if (!isset($_POST['consulta'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere una consulta.']);
    exit;
}

// Sanitizar la consulta de texto
$consulta = htmlspecialchars(trim($_POST['consulta']), ENT_QUOTES, 'UTF-8');

// Variables para el documento
$documentData = null;
$mime_type = null;
$documentoTemporal = null;

// Procesar documento solo si se envió
if (isset($_FILES['documento']) && $_FILES['documento']['error'] !== UPLOAD_ERR_NO_FILE) {
    
    // Validar la subida del documento
    if ($_FILES['documento']['error'] !== UPLOAD_ERR_OK) {
        $errorMessage = 'Error desconocido al subir el documento.';
        switch ($_FILES['documento']['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $errorMessage = 'El archivo subido excede la directiva upload_max_filesize en php.ini.';
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'El archivo subido excede la directiva MAX_FILE_SIZE que se especificó en el formulario HTML.';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'El archivo se subió solo parcialmente.';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage = 'Falta una carpeta temporal en el servidor.';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage = 'No se pudo escribir el archivo en el disco.';
                break;
            case UPLOAD_ERR_EXTENSION:
                $errorMessage = 'Una extensión de PHP detuvo la carga del archivo.';
                break;
        }
        http_response_code(500);
        echo json_encode(['error' => 'Error al subir el documento: ' . $errorMessage]);
        error_log("Error de subida de archivo: " . $errorMessage . " (Código: " . $_FILES['documento']['error'] . ")");
        exit;
    }

    // Verificar el tipo de archivo (MIME type) por seguridad
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($_FILES['documento']['tmp_name']);

    // Solo se aceptan JPEG y PDF
    if ($mime_type !== 'image/jpeg' && $mime_type !== 'application/pdf') {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se aceptan imágenes JPG/JPEG y documentos PDF.']);
        error_log("Intento de subida de archivo con tipo MIME no permitido: " . $mime_type);
        exit;
    }

    // 3. Manejo del Archivo Temporal
    try {
        // Crear un nombre de archivo temporal único
        $documentoTemporal = tempnam(sys_get_temp_dir(), 'gemini_doc_');
        if ($documentoTemporal === false) {
            throw new Exception('No se pudo crear el archivo temporal.');
        }

        // Mover el archivo subido
        if (!move_uploaded_file($_FILES['documento']['tmp_name'], $documentoTemporal)) {
            throw new Exception('No se pudo mover el archivo subido al directorio temporal.');
        }

        // Leer y codificar en Base64
        $documentData = base64_encode(file_get_contents($documentoTemporal));
        if ($documentData === false) {
            throw new Exception('No se pudo leer el contenido del documento para codificar.');
        }

    } catch (Exception $e) {
        if ($documentoTemporal && file_exists($documentoTemporal)) {
            unlink($documentoTemporal);
        }
        http_response_code(500);
        echo json_encode(['error' => 'Error interno al procesar el documento. Por favor, inténtelo de nuevo.']);
        error_log("Error en el manejo del archivo temporal: " . $e->getMessage());
        exit;
    }
}

// 4. Preparar los Datos de Solicitud para la API de Gemini
$systemPrompt = "Responde siempre en español, no inventes nada, no des nada por hecho, responde siempre en formato HTML válido. Usa etiquetas como <p>, <ul>, <li>, <strong>, <em>, <h3>, etc. para estructurar tu respuesta. No incluyas <!DOCTYPE>, <html>, <head> ni <body>, solo el contenido HTML del cuerpo.";

$parts = [['text' => $systemPrompt . "\n\nConsulta del usuario: " . $consulta]];

// Agregar documento solo si existe
if ($documentData !== null && $mime_type !== null) {
    $parts[] = [
        'inline_data' => [
            'mime_type' => $mime_type,
            'data' => $documentData
        ]
    ];
}

$datos = [
    'contents' => [
        ['parts' => $parts]
    ]
];

$datosJSON = json_encode($datos);

if ($datosJSON === false) {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error interno al preparar los datos para la API.']);
    error_log("Error al codificar los datos JSON para la API: " . json_last_error_msg());
    exit;
}

// 5. Configuración y Ejecución de cURL
$curl = curl_init();

if ($curl === false) {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error interno: No se pudo inicializar cURL.']);
    error_log("Error: No se pudo inicializar cURL.");
    exit;
}

$opciones = array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '',
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => $datosJSON,
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($datosJSON)
    ),
    CURLOPT_TIMEOUT => 300,
    CURLOPT_CONNECTTIMEOUT => 10,
);

curl_setopt_array($curl, $opciones);

$respGemini = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curl_error = curl_error($curl);

curl_close($curl);

// 6. Manejo de Errores de cURL y de la Respuesta de la API
if ($respGemini === false) {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error de comunicación con la API de Gemini. Por favor, inténtelo de nuevo.']);
    error_log("Error al conectar con la API de Gemini: " . $curl_error);
    exit;
}

$respuesta = json_decode($respGemini, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error interno al decodificar la respuesta de la API.']);
    error_log("Error al decodificar la respuesta JSON de la API: " . json_last_error_msg() . " | Respuesta cruda: " . $respGemini);
    exit;
}

if ($http_code !== 200) {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    $apiErrorMessage = "La API de Gemini devolvió un error (HTTP " . $http_code . ").";
    if (isset($respuesta['error']['message'])) {
        $apiErrorMessage .= " Mensaje: " . $respuesta['error']['message'];
    } elseif (isset($respuesta['message'])) {
        $apiErrorMessage .= " Mensaje: " . $respuesta['message'];
    }

    http_response_code($http_code);
    echo json_encode(['error' => 'Error de la API de Gemini. Código: ' . $http_code . '.']);
    error_log("Error de la API de Gemini: " . $apiErrorMessage . " | Respuesta completa: " . $respGemini);
    exit;
}

// 7. Extraer y Enviar la Respuesta
if (isset($respuesta['candidates'][0]['content']['parts'][0]['text'])) {
    $geminiResponseText = $respuesta['candidates'][0]['content']['parts'][0]['text'];
    echo json_encode(['mensaje' => $geminiResponseText]);
} else {
    if ($documentoTemporal && file_exists($documentoTemporal)) {
        unlink($documentoTemporal);
    }
    http_response_code(500);
    echo json_encode(['error' => 'La respuesta de Gemini no contiene el formato esperado.']);
    error_log("La respuesta de Gemini no tiene el formato esperado. Respuesta completa: " . print_r($respuesta, true));
}

// 8. Limpiar el Archivo Temporal
if ($documentoTemporal && file_exists($documentoTemporal)) {
    unlink($documentoTemporal);
}

?>