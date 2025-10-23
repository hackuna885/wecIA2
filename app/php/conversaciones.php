<?php
// conversaciones.php - API para gestión de conversaciones
header("Content-Type: application/json; Charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

date_default_timezone_set('America/Mexico_City');

// Conexión a la base de datos
try {
    $db = new SQLite3("../data/data.db");
    $db->busyTimeout(5000);
    $db->exec('PRAGMA journal_mode = WAL;');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar con la base de datos']);
    exit;
}

// Obtener método y acción
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Router de acciones
switch ($method) {
    case 'GET':
        if ($action === 'listar') {
            listarConversaciones($db);
        } elseif ($action === 'obtener') {
            obtenerConversacion($db);
        } elseif ($action === 'mensajes') {
            obtenerMensajes($db);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
        }
        break;
        
    case 'POST':
        if ($action === 'crear') {
            crearConversacion($db);
        } elseif ($action === 'mensaje') {
            guardarMensaje($db);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
        }
        break;
        
    case 'PUT':
        if ($action === 'actualizar') {
            actualizarConversacion($db);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
        }
        break;
        
    case 'DELETE':
        if ($action === 'eliminar') {
            eliminarConversacion($db);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

$db->close();

// ============ FUNCIONES ============

/**
 * Listar conversaciones del usuario
 */
function listarConversaciones($db) {
    $usuario_email = $_GET['usuario_email'] ?? '';
    
    if (empty($usuario_email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email de usuario requerido']);
        return;
    }
    
    $stmt = $db->prepare('
        SELECT 
            id,
            titulo,
            fecha_creacion,
            fecha_actualizacion,
            activa,
            (SELECT contenido FROM mensajes WHERE conversacion_id = c.id ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
            (SELECT COUNT(*) FROM mensajes WHERE conversacion_id = c.id) as total_mensajes
        FROM conversaciones c
        WHERE usuario_email = :email AND activa = 1
        ORDER BY fecha_actualizacion DESC
    ');
    
    $stmt->bindValue(':email', $usuario_email, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    $conversaciones = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $conversaciones[] = $row;
    }
    
    echo json_encode(['conversaciones' => $conversaciones]);
}

/**
 * Obtener una conversación específica
 */
function obtenerConversacion($db) {
    $id = $_GET['id'] ?? 0;
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de conversación requerido']);
        return;
    }
    
    $stmt = $db->prepare('SELECT * FROM conversaciones WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $conversacion = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$conversacion) {
        http_response_code(404);
        echo json_encode(['error' => 'Conversación no encontrada']);
        return;
    }
    
    echo json_encode(['conversacion' => $conversacion]);
}

/**
 * Obtener mensajes de una conversación
 */
function obtenerMensajes($db) {
    $conversacion_id = $_GET['conversacion_id'] ?? 0;
    
    if (empty($conversacion_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de conversación requerido']);
        return;
    }
    
    // Obtener mensajes
    $stmt = $db->prepare('
        SELECT 
            m.id,
            m.rol,
            m.contenido,
            m.fecha_envio
        FROM mensajes m
        WHERE m.conversacion_id = :conversacion_id
        ORDER BY m.fecha_envio ASC
    ');
    
    $stmt->bindValue(':conversacion_id', $conversacion_id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $mensajes = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // Obtener archivos adjuntos del mensaje
        $stmtArchivos = $db->prepare('
            SELECT id, nombre_original, ruta_archivo, mime_type, tamano
            FROM archivos 
            WHERE mensaje_id = :mensaje_id
        ');
        $stmtArchivos->bindValue(':mensaje_id', $row['id'], SQLITE3_INTEGER);
        $resultArchivos = $stmtArchivos->execute();
        
        $archivos = [];
        while ($archivo = $resultArchivos->fetchArray(SQLITE3_ASSOC)) {
            $archivos[] = $archivo;
        }
        
        $row['archivos'] = $archivos;
        $mensajes[] = $row;
    }
    
    echo json_encode(['mensajes' => $mensajes]);
}

/**
 * Crear nueva conversación
 */
function crearConversacion($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $usuario_email = $data['usuario_email'] ?? '';
    $titulo = $data['titulo'] ?? 'Nueva conversación';
    
    if (empty($usuario_email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email de usuario requerido']);
        return;
    }
    
    $stmt = $db->prepare('
        INSERT INTO conversaciones (usuario_email, titulo, fecha_creacion, fecha_actualizacion)
        VALUES (:email, :titulo, datetime("now"), datetime("now"))
    ');
    
    $stmt->bindValue(':email', $usuario_email, SQLITE3_TEXT);
    $stmt->bindValue(':titulo', $titulo, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertRowID();
        echo json_encode([
            'success' => true,
            'id' => $id,
            'mensaje' => 'Conversación creada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear conversación']);
    }
}

/**
 * Guardar mensaje en una conversación
 */
function guardarMensaje($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $conversacion_id = $data['conversacion_id'] ?? 0;
    $rol = $data['rol'] ?? '';
    $contenido = $data['contenido'] ?? '';
    $archivos = $data['archivos'] ?? [];
    
    if (empty($conversacion_id) || empty($rol) || empty($contenido)) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        return;
    }
    
    // Iniciar transacción
    $db->exec('BEGIN TRANSACTION');
    
    try {
        // Insertar mensaje
        $stmt = $db->prepare('
            INSERT INTO mensajes (conversacion_id, rol, contenido, fecha_envio)
            VALUES (:conversacion_id, :rol, :contenido, datetime("now"))
        ');
        
        $stmt->bindValue(':conversacion_id', $conversacion_id, SQLITE3_INTEGER);
        $stmt->bindValue(':rol', $rol, SQLITE3_TEXT);
        $stmt->bindValue(':contenido', $contenido, SQLITE3_TEXT);
        
        if (!$stmt->execute()) {
            throw new Exception('Error al insertar mensaje');
        }
        
        $mensaje_id = $db->lastInsertRowID();
        
        // Insertar archivos si existen
        if (!empty($archivos)) {
            foreach ($archivos as $archivo) {
                $stmtArchivo = $db->prepare('
                    INSERT INTO archivos (mensaje_id, nombre_original, ruta_archivo, mime_type, tamano, fecha_subida)
                    VALUES (:mensaje_id, :nombre, :ruta, :mime, :tamano, datetime("now"))
                ');
                
                $stmtArchivo->bindValue(':mensaje_id', $mensaje_id, SQLITE3_INTEGER);
                $stmtArchivo->bindValue(':nombre', $archivo['nombre_original'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':ruta', $archivo['ruta_archivo'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':mime', $archivo['mime_type'], SQLITE3_TEXT);
                $stmtArchivo->bindValue(':tamano', $archivo['tamano'], SQLITE3_INTEGER);
                
                if (!$stmtArchivo->execute()) {
                    throw new Exception('Error al insertar archivo');
                }
            }
        }
        
        // Actualizar fecha de última actividad de la conversación
        $stmtUpdate = $db->prepare('
            UPDATE conversaciones 
            SET fecha_actualizacion = datetime("now")
            WHERE id = :id
        ');
        $stmtUpdate->bindValue(':id', $conversacion_id, SQLITE3_INTEGER);
        $stmtUpdate->execute();
        
        $db->exec('COMMIT');
        
        echo json_encode([
            'success' => true,
            'mensaje_id' => $mensaje_id,
            'mensaje' => 'Mensaje guardado exitosamente'
        ]);
        
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

/**
 * Actualizar título de conversación
 */
function actualizarConversacion($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? 0;
    $titulo = $data['titulo'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de conversación requerido']);
        return;
    }
    
    $stmt = $db->prepare('
        UPDATE conversaciones 
        SET titulo = :titulo, fecha_actualizacion = datetime("now")
        WHERE id = :id
    ');
    
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->bindValue(':titulo', $titulo, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Conversación actualizada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar conversación']);
    }
}

/**
 * Eliminar (archivar) conversación
 */
function eliminarConversacion($db) {
    $id = $_GET['id'] ?? 0;
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de conversación requerido']);
        return;
    }
    
    // No eliminar realmente, solo marcar como inactiva
    $stmt = $db->prepare('
        UPDATE conversaciones 
        SET activa = 0
        WHERE id = :id
    ');
    
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Conversación eliminada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar conversación']);
    }
}
?>
