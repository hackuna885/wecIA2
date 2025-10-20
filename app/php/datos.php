<?php
error_reporting(E_ALL ^ E_DEPRECATED);
header("Content-Type: text/html; Charset=UTF-8");
session_start();

include_once 'info.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpMailer/Exception.php';
require 'phpMailer/PHPMailer.php';
require 'phpMailer/SMTP.php';

// Codifica el formato json
$_POST = json_decode(file_get_contents("php://input"), true);

// 🔥 CONFIGURACIÓN RÁPIDA
$email = 'ovelazquez@corsec.com.mx';
$appPassword = 'oifh ogvh bdli klvf'; // ⚠️ CAMBIAR ESTO

$opcion = (isset($_POST['opcion'])) ? $_POST['opcion'] : '';

// Intradas del form
$id = (isset($_POST['id'])) ? $_POST['id'] : '';
$nomEmpre = (isset($_POST['nomEmpre'])) ? $_POST['nomEmpre'] : '';
$nombre = (isset($_POST['nombre'])) ? $_POST['nombre'] : '';
$aPaterno = (isset($_POST['aPaterno'])) ? $_POST['aPaterno'] : '';
$aMaterno = (isset($_POST['aMaterno'])) ? $_POST['aMaterno'] : '';
$telefono = (isset($_POST['telefono'])) ? $_POST['telefono'] : '';
$correo = (isset($_POST['correo'])) ? $_POST['correo'] : '';
$password = (isset($_POST['password'])) ? $_POST['password'] : '';
$estado = (isset($_POST['estado'])) ? $_POST['estado'] : '';

// Enciptar entrada
$corCrip = (isset($_POST['correo'])) ? md5($_POST['correo']) : '';
$pasCrip = (isset($_POST['password'])) ? md5($_POST['password']) : '';

$mes = sprintf('%02d', date('n'));
$año = date('y');
$prefijo = "SEPGA{$mes}{$año}";

$varNavega = $info["browser"];	
$varVersio = $info["version"];
$varSitemaO = $info["os"];
$fechaCap = date('d-m-Y');
$horaCap = date('g:i:s a');
$fechaHoraReg = $fechaCap . ' ' . $horaCap;

// Conexion a DB
$con = new SQLite3("../data/data.db") or die("Problemas para conectar");

// Opciones del CRUD
switch ($opcion) {
    // Insertar
    case 1 :
        $query_count = $con->query("SELECT COUNT(*) as total FROM usr WHERE folio LIKE '{$prefijo}%'");
        $resultado = $query_count->fetchArray(SQLITE3_ASSOC);

        $siguiente_consecutivo = ($resultado['total'] ?? 0) + 1;

        $consecutivo_formateado = sprintf('%04d', $siguiente_consecutivo);
        $folio = $prefijo . $consecutivo_formateado;

        $cs = $con -> query("INSERT INTO usr (folio,nomEmpresa,nombre,aPaterno,aMaterno,telefono,correo,password,correoCript,passCript,varNavega,varVerNav,varSisOp,fechaHoraReg,per1,per2,per3) VALUES('$folio','$nomEmpre','$nombre','$aPaterno', '$aMaterno','$telefono','$correo','$password','$corCrip','$pasCrip','$varNavega', '$varVersio', '$varSitemaO', '$fechaHoraReg','3','0','3')");
        break;
    // Actualizar
    case 2 :

        //Obtiene folio y nombre de la empresa anterior.
        $csFolio = $con->query("SELECT folio, nomEmpresa FROM usr WHERE id = '$id'");
        $row = $csFolio->fetchArray();
        $folio = $row['folio'];
        $nomEmpresaAnterior = $row['nomEmpresa'];        

        //Actualiza la base de datos para el módulo de proveedores.
        $cs = $con -> query("UPDATE usr SET nomEmpresa = '$nomEmpre', nombre = '$nombre', aPaterno = '$aPaterno', aMaterno = '$aMaterno', telefono = '$telefono', correo = '$correo', password = '$password', correoCript = '$corCrip', passCript = '$pasCrip', fechaHoraReg = '$fechaHoraReg', per2 = '$estado' WHERE id = '$id'");
        
        //Actualiza el nombre de la empresa en todas las tablas relacionadas.
        $csDos = $con -> query("UPDATE auditoria_empresas SET empresa_nombre = '$nomEmpre' WHERE folio_auditoria = '$folio'");
        $csTres = $con -> query("UPDATE conclusiones_auditoria SET empresa_nombre = '$nomEmpre' WHERE folio = '$folio'");
        $csCuatro = $con -> query("UPDATE infoProveedores SET razonSocial = '$nomEmpre', nombreComercial = '$nomEmpre' WHERE folio = '$folio'");       

        //Normaliza la variable para convertirla a minúsculas, eliminar espacios y caracteres especiales

        $nombreOriginalBase = $nomEmpresaAnterior;
        $nombreArchivo = $nomEmpre;

        
        function slugify($texto) {
            $texto = mb_strtolower($texto, 'UTF-8');
            $reemplazar = array(
                'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
                'ü' => 'u', 'ñ' => 'n', 'ç' => 'c', '-' => ''
            );
            $texto = strtr($texto, $reemplazar);
            $texto = preg_replace('/[^a-z0-9\s]/', ' ', $texto);
            $texto = preg_replace('/\s+/', '_', trim($texto));
            return $texto;
        }
                
        //Normaliza nombres de variables
        $nombreCorregidoAnterior = slugify($nombreOriginalBase);
        $nombreCorregidoNuevo = slugify($nombreArchivo);

        //Actualiza la base con las rutas de las modificaciones de los nombres
        $csCinco = $con -> query("UPDATE auditoria_archivos SET ruta_archivo = REPLACE(ruta_archivo, '$nombreCorregidoAnterior', '$nombreCorregidoNuevo') WHERE ruta_archivo LIKE '%$nombreCorregidoAnterior%';"); 


        $rutaOrigen = '../archivos_auditoria/'.$nombreCorregidoAnterior;
        $rutaDestino = '../archivos_auditoria/'.$nombreCorregidoNuevo;

        if (file_exists($rutaOrigen)) {
            rename($rutaOrigen, $rutaDestino);
        } else {
            echo "Error: El directorio origen no existe";
        }


        if ($estado === 1) {
            
            try {
                $mail = new PHPMailer(true);
                
                // Configuración mínima
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = $email;
                $mail->Password = $appPassword;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port = 465;
                $mail->CharSet = 'UTF-8';
                
                // Email mínimo
                $mail->setFrom($email, 'SEPGA');
                $mail->addAddress($correo);
                $mail->Subject = 'Bienvenido(a) a SEPGA – Acceso a la Plataforma';
                $mail->isHTML(true);
                $mail->Body = '
                <html style="background-color: #000;">
                
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <title>SEPGA</title>
                </head>
                <center>
                    <div style="width: 600px; background-color: #000;">
                        <div>
                            <img src="https://corsec.tech/correoSEPGA/img/banner1.jpg" width="600px" height="auto" margin: 0px; padding:
                                0px;>
                        </div>
                        <div>
                            <img src="https://corsec.tech/correoSEPGA/img/banner2.jpg" width="600px" height="auto" margin: 0px; padding:
                                0px;>
                        </div>
                        <div style="width: 600px; margin: 0px; padding: 0px;">
                            <table width="100%" align="center" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" valign="middle" width="10%"
                                        style="color: white; font-family: Arial, sans-serif; font-size: 16px; padding: 20px;">
                                        <h1>Bienvenido(a) a SEPGA – Acceso a la Plataforma</h1>
                                        <br>
                                        <p style="text-align: justify;"><b>Estimado(a) </b>'.$nombre.' '.$aPaterno.' '.$aMaterno.',
                                            <br>
                                            <br>
                                            Le damos la más cordial bienvenida al <b>Sistema de Evaluación de Proveedores con Gestión y
                                                Auditoría (SEPGA)</b>,
                                            plataforma designada por <b>Grupo Ángeles</b> y gestionada por <b>Grupo CORSEC</b> para
                                            llevar a cabo su proceso de evaluación.
                                            <br>
                                            <br>
                                            A continuación encontrará sus credenciales de acceso:
                                            <br>
                                            <br>
                                        </p>
                                        <h3>
                                            Usuario: '.$correo.'
                                            <br>
                                            Contraseña: '.$password.'
                                            <br>
                                            Enlace de acceso: <a href="http://sepga.corsec.tech">http://sepga.corsec.tech</a>
                                        </h3>
                                        <br>
                                        <p style="text-align: justify;">
                                            En SEPGA podrá actualizar su expediente y firmar los convenios de confidencialidad
                                            requeridos para continuar con el
                                            proceso.
                                            <br>
                                            <br>
                                            Para apoyarle, adjuntamos el <b>Manual de Usuario SEPGA</b>, que le servirá como guía en
                                            cada etapa.
                                            <br>
                                            <br>
                                            Si presenta algún inconveniente para acceder, no dude en contactarnos al <b>55-8854-8383 y
                                                55-4123-29116</b> o por este mismo
                                            medio.
                                            <br>
                                            <br>
                                            Agradecemos su colaboración y compromiso para garantizar la calidad que Grupo Ángeles exige
                                            a sus proveedores.
                                            <br>
                                            <br>
                                            Atentamente
                                            <br>
                                            <b>Equipo de Auditoría – Grupo CORSEC</b>
                                            <br>
                                            Info@corsec.com.mx
                                            <br>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div style="width: 600px; margin: 0px; padding: 0px;">
                            <br>
                            <br>
                            <table swidth="100%" align="center" cellspacing="0" cellpadding="0" style="background-color: #fff;">
                                <tr>
                                    <td align="center" valign="middle" width="25%" style="padding-top: 20px; padding-bottom: 20px;">
                                        <p style="font-family: Arial, sans-serif; font-size: 12px; padding: 5px;"">
                                            <img src=" https://corsec.tech/correoSEPGA/img/iconF1.png"
                                            style="vertical-align: middle; margin-left: 10px; width: 24px; height: 24px;">
                                            www.corsec.com.mx
                                            <img src="https://corsec.tech/correoSEPGA/img/iconF2.png"
                                                style="vertical-align: middle; margin-left: 10px; width: 24px; height: 24px;">
                                            info@corsec.com.mx
                                            <img src="https://corsec.tech/correoSEPGA/img/iconF3.png"
                                                style="vertical-align: middle; margin-left: 10px; width: 24px; height: 24px;">
                                            55 3967 7341 / 56 2566 0300
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </center>
                
                </html>
                ';
                
                if ($mail->send()) {
                    echo json_encode('correcto', JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode('error_envio', JSON_UNESCAPED_UNICODE);
                }
                
            } catch (Exception $e) {
                // Solo una respuesta según el tipo de error
                if (strpos($e->getMessage(), 'authenticate') !== false) {
                    echo json_encode('Contraseña incorrecta', JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode('Error: ' . $e->getMessage(), JSON_UNESCAPED_UNICODE);
                }
            }
        }
        

        break;
    // Eliminar
    case 3 :
        $cs = $con -> query("DELETE FROM usr WHERE id = '$id'");
        break;
    // Leer
    case 4: // Leer con documentos (con caché)
        $cs = $con->query("SELECT * FROM usr");
        $datos = array();
        $i = 0;

        while ($resul = $cs->fetchArray()) {
            $folio = $resul['folio'];
            $rutaCarpeta = __DIR__ . "/../uploads/proveedores/{$folio}";

            // Obtener RFC y razónSocial de infoProveedores
            $infoQuery = $con->query("SELECT rfc, razonSocial FROM infoProveedores WHERE folio = '{$folio}' LIMIT 1");
            $infoData = $infoQuery->fetchArray();
            $rfc = $infoData['rfc'] ?? null;
            $razonSocial = $infoData['razonSocial'] ?? null;
            
            // Usar valores de caché de la BD
            $numDocumentos = $resul['num_documentos'] ?? 0;
            $ultimaModificacion = $resul['fecha_ultima_actualizacion'];
            
            // Solo recalcular si la carpeta existe y el caché está vacío
            if (is_dir($rutaCarpeta) && ($numDocumentos === 0 || $ultimaModificacion === null)) {
                $archivos = array_diff(scandir($rutaCarpeta), ['.', '..']);
                $extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'];
                
                $archivosValidos = array_filter($archivos, function($item) use ($rutaCarpeta, $extensionesPermitidas) {
                    if (!is_file("{$rutaCarpeta}/{$item}")) return false;
                    $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                    return in_array($ext, $extensionesPermitidas);
                });
                
                $numDocumentos = count($archivosValidos);
                
                if ($numDocumentos > 0) {
                    $timestamps = array_map(function($file) use ($rutaCarpeta) {
                        return filemtime("{$rutaCarpeta}/{$file}");
                    }, $archivosValidos);
                    $ultimaModificacion = date('Y-m-d H:i:s', max($timestamps));
                } else {
                    $ultimaModificacion = null;
                }
                
                // Actualizar caché en la BD
                $id = $resul['id'];
                $con->query("UPDATE usr SET num_documentos = {$numDocumentos}, fecha_ultima_actualizacion = '{$ultimaModificacion}' WHERE id = {$id}");
            }
            
            $datos[$i] = [
                'id' => $resul['id'],
                'folio' => $resul['folio'],
                'nomEmpresa' => $resul['nomEmpresa'],
                'nombre' => $resul['nombre'],
                'aPaterno' => $resul['aPaterno'],
                'aMaterno' => $resul['aMaterno'],
                'telefono' => $resul['telefono'],
                'correo' => $resul['correo'],
                'password' => $resul['password'],
                'per2' => $resul['per2'],
                'rfc' => $rfc,
                'razonSocial' => $razonSocial,
                'documentos' => $numDocumentos,
                'fechaActualizacion' => $ultimaModificacion
            ];
            $i++;
        }
        break;

    // Listar archivos de un proveedor
    case 5: 
        $folio = (isset($_POST['folio'])) ? $_POST['folio'] : '';
        $rutaCarpeta = __DIR__ . "/../uploads/proveedores/{$folio}";
        
        $archivos = array();
        
        if (is_dir($rutaCarpeta)) {
            $files = array_diff(scandir($rutaCarpeta), ['.', '..']);
            $extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'];
            
            foreach ($files as $file) {
                $rutaCompleta = "{$rutaCarpeta}/{$file}";
                if (is_file($rutaCompleta)) {
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($ext, $extensionesPermitidas)) {
                        // Leer archivo y convertir a base64
                        $contenido = file_get_contents($rutaCompleta);
                        $base64 = base64_encode($contenido);
                        
                        $archivos[] = [
                            'nombre' => $file,
                            'contenido' => $base64,
                            'tipo' => mime_content_type($rutaCompleta)
                        ];
                    }
                }
            }
        }
        
        $datos = $archivos;
        break;        
    // Actualizar caché de documentos
    case 6: 
        $folio = (isset($_POST['folio'])) ? $_POST['folio'] : '';
        $rutaCarpeta = __DIR__ . "/../uploads/proveedores/{$folio}";
        
        $numDocumentos = 0;
        $ultimaModificacion = null;
        
        if (is_dir($rutaCarpeta)) {
            $archivos = array_diff(scandir($rutaCarpeta), ['.', '..']);
            $extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'];
            
            $archivosValidos = array_filter($archivos, function($item) use ($rutaCarpeta, $extensionesPermitidas) {
                if (!is_file("{$rutaCarpeta}/{$item}")) return false;
                $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                return in_array($ext, $extensionesPermitidas);
            });
            
            $numDocumentos = count($archivosValidos);
            
            if ($numDocumentos > 0) {
                $timestamps = array_map(function($file) use ($rutaCarpeta) {
                    return filemtime("{$rutaCarpeta}/{$file}");
                }, $archivosValidos);
                $ultimaModificacion = date('Y-m-d H:i:s', max($timestamps));
            }
            
            // Actualizar caché en la BD
            $con->query("UPDATE usr SET num_documentos = {$numDocumentos}, fecha_ultima_actualizacion = '{$ultimaModificacion}' WHERE folio = '{$folio}'");
        }
        
        $datos = [
            'success' => true,
            'documentos' => $numDocumentos,
            'fechaActualizacion' => $ultimaModificacion
        ];
        break;
}
$datos = (isset($datos) ? $datos : '');
echo json_encode($datos);

$con -> close();


?>