<?php
// chats-con-bd.php - Backend de chat integrado con base de datos
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
        echo json_encode(['error' => 'Error de configuración: La clave API de Gemini no está definida.']);
        error_log("Error: La clave API de Gemini no está configurada en config.php.");
        exit();
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error de configuración: El archivo "config.php" no se encuentra.']);
    error_log("Error: El archivo de configuración 'config.php' no se encontró.");
    exit();
}

// Conexión a la base de datos SQLite3
try {
    $db = new SQLite3("../data/data.db");
    $db->busyTimeout(5000);
    $db->exec('PRAGMA journal_mode = WAL;');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar con la base de datos']);
    error_log("Error de conexión a BD: " . $e->getMessage());
    exit();
}

// Define la URL de la API de Gemini
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' . $apiKey;

// Validación y Sanitización de Entradas
if (!isset($_POST['consulta'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere una consulta.']);
    exit;
}

// Obtener datos del usuario
$usuario_email = $_POST['usuario_email'] ?? '';
$conversacion_id = $_POST['conversacion_id'] ?? null;

if (empty($usuario_email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email de usuario requerido.']);
    exit;
}

// Sanitizar la consulta de texto
$consulta = htmlspecialchars(trim($_POST['consulta']), ENT_QUOTES, 'UTF-8');

// Variables para los documentos
$documentos = [];
$archivosTemporal = [];
$archivosGuardados = []; // Para guardar en BD

// Tipos MIME permitidos
$tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint'
];

// Directorio para guardar archivos
$uploadDir = '../data/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Procesar documentos (compatible con ambos formatos)
if (isset($_FILES['documentos']) && is_array($_FILES['documentos']['name'])) {
    $totalArchivos = count($_FILES['documentos']['name']);
    
    if ($totalArchivos > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Solo puedes subir un máximo de 5 archivos.']);
        exit;
    }
    
    for ($i = 0; $i < $totalArchivos; $i++) {
        if ($_FILES['documentos']['error'][$i] === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        
        if ($_FILES['documentos']['error'][$i] !== UPLOAD_ERR_OK) {
            foreach ($archivosTemporal as $temp) {
                if (file_exists($temp)) unlink($temp);
            }
            http_response_code(500);
            echo json_encode(['error' => 'Error al subir el archivo.']);
            exit;
        }
        
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->file($_FILES['documentos']['tmp_name'][$i]);
        
        if (!in_array($mime_type, $tiposPermitidos)) {
            foreach ($archivosTemporal as $temp) {
                if (file_exists($temp)) unlink($temp);
            }
            http_response_code(400);
            echo json_encode(['error' => 'Tipo de archivo no permitido: ' . $_FILES['documentos']['name'][$i]]);
            exit;
        }
        
        $tamañoMaximo = 10 * 1024 * 1024;
        if ($_FILES['documentos']['size'][$i] > $tamañoMaximo) {
            foreach ($archivosTemporal as $temp) {
                if (file_exists($temp)) unlink($temp);
            }
            http_response_code(400);
            echo json_encode(['error' => 'El archivo excede el tamaño máximo de 10MB.']);
            exit;
        }
        
        try {
            // Crear nombre único para el archivo
            $extension = pathinfo($_FILES['documentos']['name'][$i], PATHINFO_EXTENSION);
            $nombreUnico = uniqid() . '_' . time() . '.' . $extension;
            $rutaArchivo = $uploadDir . $nombreUnico;
            
            if (!move_uploaded_file($_FILES['documentos']['tmp_name'][$i], $rutaArchivo)) {
                throw new Exception('No se pudo mover el archivo.');
            }
            
            // Guardar info del archivo para la BD
            $archivosGuardados[] = [
                'nombre_original' => $_FILES['documentos']['name'][$i],
                'ruta_archivo' => $rutaArchivo,
                'mime_type' => $mime_type,
                'tamano' => $_FILES['documentos']['size'][$i]
            ];
            
            // Leer y codificar para Gemini API
            $documentData = base64_encode(file_get_contents($rutaArchivo));
            
            $documentos[] = [
                'mime_type' => $mime_type,
                'data' => $documentData
            ];
            
        } catch (Exception $e) {
            foreach ($archivosTemporal as $temp) {
                if (file_exists($temp)) unlink($temp);
            }
            http_response_code(500);
            echo json_encode(['error' => 'Error al procesar el archivo.']);
            error_log("Error: " . $e->getMessage());
            exit;
        }
    }
}
// Formato antiguo (documento único)
elseif (isset($_FILES['documento']) && $_FILES['documento']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['documento']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al subir el documento.']);
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($_FILES['documento']['tmp_name']);

    if (!in_array($mime_type, $tiposPermitidos)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de archivo no permitido.']);
        exit;
    }
    
    $tamañoMaximo = 10 * 1024 * 1024;
    if ($_FILES['documento']['size'] > $tamañoMaximo) {
        http_response_code(400);
        echo json_encode(['error' => 'El archivo excede el tamaño máximo de 10MB.']);
        exit;
    }

    try {
        $extension = pathinfo($_FILES['documento']['name'], PATHINFO_EXTENSION);
        $nombreUnico = uniqid() . '_' . time() . '.' . $extension;
        $rutaArchivo = $uploadDir . $nombreUnico;
        
        if (!move_uploaded_file($_FILES['documento']['tmp_name'], $rutaArchivo)) {
            throw new Exception('No se pudo mover el archivo.');
        }
        
        $archivosGuardados[] = [
            'nombre_original' => $_FILES['documento']['name'],
            'ruta_archivo' => $rutaArchivo,
            'mime_type' => $mime_type,
            'tamano' => $_FILES['documento']['size']
        ];
        
        $documentData = base64_encode(file_get_contents($rutaArchivo));
        
        $documentos[] = [
            'mime_type' => $mime_type,
            'data' => $documentData
        ];

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al procesar el documento.']);
        error_log("Error: " . $e->getMessage());
        exit;
    }
}

// Preparar los Datos de Solicitud para la API de Gemini
$systemPrompt = "Responde siempre en español, no inventes nada, no des nada por hecho, responde siempre en formato HTML válido. Usa etiquetas como <p>, <ul>, <li>, <strong>, <em>, <h3>, etc. para estructurar tu respuesta. No incluyas <!DOCTYPE>, <html>, <head> ni <body>, solo el contenido HTML del cuerpo.";

$parts = [['text' => $systemPrompt . "\n\nConsulta del usuario: " . $consulta]];

// Agregar todos los documentos al array de parts
foreach ($documentos as $doc) {
    $parts[] = [
        'inline_data' => [
            'mime_type' => $doc['mime_type'],
            'data' => $doc['data']
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
    http_response_code(500);
    echo json_encode(['error' => 'Error interno al preparar los datos para la API.']);
    exit;
}

// Configuración y Ejecución de cURL
$curl = curl_init();

if ($curl === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno: No se pudo inicializar cURL.']);
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

// Manejo de Errores de cURL y de la Respuesta de la API
if ($respGemini === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de comunicación con la API de Gemini.']);
    error_log("Error al conectar con la API de Gemini: " . $curl_error);
    exit;
}

$respuesta = json_decode($respGemini, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno al decodificar la respuesta de la API.']);
    exit;
}

if ($http_code !== 200) {
    $apiErrorMessage = "La API de Gemini devolvió un error (HTTP " . $http_code . ").";
    if (isset($respuesta['error']['message'])) {
        $apiErrorMessage .= " Mensaje: " . $respuesta['error']['message'];
    }
    http_response_code($http_code);
    echo json_encode(['error' => 'Error de la API de Gemini. Código: ' . $http_code]);
    error_log("Error de la API de Gemini: " . $apiErrorMessage);
    exit;
}

// Extraer la Respuesta
if (isset($respuesta['candidates'][0]['content']['parts'][0]['text'])) {
    $geminiResponseText = $respuesta['candidates'][0]['content']['parts'][0]['text'];
    
    // ========== GUARDAR EN BASE DE DATOS ==========
    
    $db->exec('BEGIN TRANSACTION');
    
    try {
        // Si no hay conversación activa, crear una nueva
        if (empty($conversacion_id)) {
            // Generar título automático basado en la consulta (primeras 50 caracteres)
            $titulo = mb_substr($consulta, 0, 50) . (mb_strlen($consulta) > 50 ? '...' : '');
            
            $stmtConv = $db->prepare('
                INSERT INTO conversaciones (usuario_email, titulo, fecha_creacion, fecha_actualizacion)
                VALUES (:email, :titulo, datetime("now"), datetime("now"))
            ');
            
            $stmtConv->bindValue(':email', $usuario_email, SQLITE3_TEXT);
            $stmtConv->bindValue(':titulo', $titulo, SQLITE3_TEXT);
            
            if (!$stmtConv->execute()) {
                throw new Exception('Error al crear conversación');
            }
            
            $conversacion_id = $db->lastInsertRowID();
        } else {
            // Actualizar fecha de última actividad
            $stmtUpdate = $db->prepare('
                UPDATE conversaciones 
                SET fecha_actualizacion = datetime("now")
                WHERE id = :id
            ');
            $stmtUpdate->bindValue(':id', $conversacion_id, SQLITE3_INTEGER);
            $stmtUpdate->execute();
        }
        
        // Guardar mensaje del usuario
        $stmtMsgUser = $db->prepare('
            INSERT INTO mensajes (conversacion_id, rol, contenido, fecha_envio)
            VALUES (:conversacion_id, "user", :contenido, datetime("now"))
        ');
        
        $stmtMsgUser->bindValue(':conversacion_id', $conversacion_id, SQLITE3_INTEGER);
        $stmtMsgUser->bindValue(':contenido', $consulta, SQLITE3_TEXT);
        
        if (!$stmtMsgUser->execute()) {
            throw new Exception('Error al guardar mensaje del usuario');
        }
        
        $mensaje_user_id = $db->lastInsertRowID();
        
        // Guardar archivos asociados al mensaje del usuario
        if (!empty($archivosGuardados)) {
            foreach ($archivosGuardados as $archivo) {
                $stmtArchivo = $db->prepare('
                    INSERT INTO archivos (mensaje_id, nombre_original, ruta_archivo, mime_type, tamano, fecha_subida)
                    VALUES (:mensaje_id, :nombre, :ruta, :mime, :tamano, datetime("now"))
                ');
                
                $stmtArchivo->bindValue(':mensaje_id', $mensaje_user_id, SQLITE3_INTEGER);
                $stmtArchivo->bindValue(':nombre', $archivo['nombre_original'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':ruta', $archivo['ruta_archivo'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':mime', $archivo['mime_type'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':tamano', $archivo['tamano'], SQLITE3_INTEGER);
                
                if (!$stmtArchivo->execute()) {
                    throw new Exception('Error al guardar archivo adjunto');
                }
            }
        }
        
        // Guardar respuesta del asistente
        $stmtMsgAssistant = $db->prepare('
            INSERT INTO mensajes (conversacion_id, rol, contenido, fecha_envio)
            VALUES (:conversacion_id, "assistant", :contenido, datetime("now"))
        ');
        
        $stmtMsgAssistant->bindValue(':conversacion_id', $conversacion_id, SQLITE3_INTEGER);
        $stmtMsgAssistant->bindValue(':contenido', $geminiResponseText, SQLITE3_TEXT);
        
        if (!$stmtMsgAssistant->execute()) {
            throw new Exception('Error al guardar respuesta del asistente');
        }
        
        $db->exec('COMMIT');
        
        // Retornar respuesta con el ID de la conversación
        echo json_encode([
            'mensaje' => $geminiResponseText,
            'conversacion_id' => $conversacion_id
        ]);
        
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        error_log("Error al guardar en BD: " . $e->getMessage());
        
        // Aunque falle el guardado, retornar la respuesta de Gemini
        echo json_encode([
            'mensaje' => $geminiResponseText,
            'advertencia' => 'La respuesta no pudo ser guardada en el historial'
        ]);
    }
    
} else {
    http_response_code(500);
    echo json_encode(['error' => 'La respuesta de Gemini no contiene el formato esperado.']);
}

$db->close();
?>
