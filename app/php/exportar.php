<?php
// exportar.php - Sistema de exportación de conversaciones
header("Content-Type: application/json; Charset=UTF-8");
date_default_timezone_set('America/Mexico_City');

// Conexión a la base de datos
try {
    $db = new SQLite3("../data/data.db");
    $db->busyTimeout(5000);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar con la base de datos']);
    exit;
}

// Validar permisos de administrador
$rol_usuario = $_POST['rol_usuario'] ?? $_GET['rol_usuario'] ?? '';

if ($rol_usuario !== 'Administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para exportar conversaciones']);
    exit;
}

$formato = $_GET['formato'] ?? 'json';
$conversacion_id = $_GET['conversacion_id'] ?? 0;

if (empty($conversacion_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de conversación requerido']);
    exit;
}

// Obtener datos de la conversación
$stmt = $db->prepare('SELECT * FROM conversaciones WHERE id = :id');
$stmt->bindValue(':id', $conversacion_id, SQLITE3_INTEGER);
$result = $stmt->execute();
$conversacion = $result->fetchArray(SQLITE3_ASSOC);

if (!$conversacion) {
    http_response_code(404);
    echo json_encode(['error' => 'Conversación no encontrada']);
    exit;
}

// Obtener mensajes
$stmtMensajes = $db->prepare('
    SELECT m.*, 
           (SELECT GROUP_CONCAT(nombre_original, ", ") 
            FROM archivos 
            WHERE mensaje_id = m.id) as archivos_nombres
    FROM mensajes m
    WHERE m.conversacion_id = :conversacion_id
    ORDER BY m.fecha_envio ASC
');
$stmtMensajes->bindValue(':conversacion_id', $conversacion_id, SQLITE3_INTEGER);
$resultMensajes = $stmtMensajes->execute();

$mensajes = [];
while ($row = $resultMensajes->fetchArray(SQLITE3_ASSOC)) {
    $mensajes[] = $row;
}

// Exportar según formato
switch ($formato) {
    case 'json':
        exportarJSON($conversacion, $mensajes);
        break;
    case 'txt':
        exportarTXT($conversacion, $mensajes);
        break;
    case 'pdf':
        exportarPDF($conversacion, $mensajes);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Formato no soportado']);
        break;
}

$db->close();

// ============ FUNCIONES DE EXPORTACIÓN ============

/**
 * Exportar como JSON
 */
function exportarJSON($conversacion, $mensajes) {
    $data = [
        'conversacion' => $conversacion,
        'mensajes' => $mensajes,
        'exportado_en' => date('Y-m-d H:i:s')
    ];
    
    $filename = 'conversacion_' . $conversacion['id'] . '_' . date('YmdHis') . '.json';
    
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

/**
 * Exportar como TXT
 */
function exportarTXT($conversacion, $mensajes) {
    $filename = 'conversacion_' . $conversacion['id'] . '_' . date('YmdHis') . '.txt';
    
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    $output = "=================================================\n";
    $output .= "CONVERSACIÓN: " . $conversacion['titulo'] . "\n";
    $output .= "Usuario: " . $conversacion['usuario_email'] . "\n";
    $output .= "Fecha de creación: " . $conversacion['fecha_creacion'] . "\n";
    $output .= "=================================================\n\n";
    
    foreach ($mensajes as $mensaje) {
        $rol = strtoupper($mensaje['rol']);
        $output .= "[$rol] - {$mensaje['fecha_envio']}\n";
        $output .= str_repeat("-", 50) . "\n";
        
        // Limpiar HTML del contenido
        $contenido = strip_tags($mensaje['contenido']);
        $output .= $contenido . "\n";
        
        if (!empty($mensaje['archivos_nombres'])) {
            $output .= "\nArchivos adjuntos: " . $mensaje['archivos_nombres'] . "\n";
        }
        
        $output .= "\n";
    }
    
    $output .= "\n=================================================\n";
    $output .= "Exportado el: " . date('Y-m-d H:i:s') . "\n";
    $output .= "=================================================\n";
    
    echo $output;
}

/**
 * Exportar como PDF (usando HTML2PDF o similar)
 */
function exportarPDF($conversacion, $mensajes) {
    // Verificar si existe TCPDF o alguna librería PDF
    if (!class_exists('TCPDF')) {
        // Crear PDF simple con HTML y convertir
        $html = generarHTMLParaPDF($conversacion, $mensajes);
        
        // Por ahora, retornar HTML que el navegador puede imprimir como PDF
        $filename = 'conversacion_' . $conversacion['id'] . '_' . date('YmdHis') . '.html';
        
        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        echo $html;
    } else {
        // Usar TCPDF si está disponible
        // Implementar aquí
    }
}

/**
 * Generar HTML para PDF
 */
function generarHTMLParaPDF($conversacion, $mensajes) {
    $html = '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Conversación - ' . htmlspecialchars($conversacion['titulo']) . '</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            background-color: #10a37f;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
        }
        .mensaje {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 4px solid #e5e5e5;
            background-color: #f7f7f8;
        }
        .mensaje.user {
            border-left-color: #10a37f;
        }
        .mensaje.assistant {
            border-left-color: #6e6e80;
        }
        .mensaje-header {
            font-weight: bold;
            margin-bottom: 10px;
            color: #2d2d2d;
        }
        .mensaje-fecha {
            font-size: 0.85em;
            color: #6e6e80;
        }
        .archivos {
            margin-top: 10px;
            font-size: 0.9em;
            color: #6e6e80;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #6e6e80;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>' . htmlspecialchars($conversacion['titulo']) . '</h1>
        <p>Usuario: ' . htmlspecialchars($conversacion['usuario_email']) . '</p>
        <p>Fecha: ' . htmlspecialchars($conversacion['fecha_creacion']) . '</p>
    </div>
    
    <div class="conversacion">';
    
    foreach ($mensajes as $mensaje) {
        $rolClass = $mensaje['rol'];
        $rolNombre = $mensaje['rol'] === 'user' ? 'Usuario' : 'Asistente';
        
        $html .= '<div class="mensaje ' . $rolClass . '">
            <div class="mensaje-header">
                ' . $rolNombre . ' 
                <span class="mensaje-fecha">' . htmlspecialchars($mensaje['fecha_envio']) . '</span>
            </div>
            <div class="mensaje-contenido">' . $mensaje['contenido'] . '</div>';
        
        if (!empty($mensaje['archivos_nombres'])) {
            $html .= '<div class="archivos">📎 Archivos: ' . htmlspecialchars($mensaje['archivos_nombres']) . '</div>';
        }
        
        $html .= '</div>';
    }
    
    $html .= '</div>
    
    <div class="footer">
        <p>Exportado el ' . date('d/m/Y H:i:s') . '</p>
        <p>WEC IA - Sistema de Chat con Inteligencia Artificial</p>
    </div>
    
    <script>
        // Auto-abrir diálogo de impresión para guardar como PDF
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>';
    
    return $html;
}
?>
