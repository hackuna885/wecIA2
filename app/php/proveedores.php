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
$folio = (isset($_SESSION["folio"])) ? $_SESSION["folio"] : '';
$tipoPersona = (isset($_POST['tipoPersona'])) ? $_POST['tipoPersona'] : '';
$rfc = (isset($_POST['rfc'])) ? $_POST['rfc'] : '';
$razonSocial = (isset($_POST['razonSocial'])) ? $_POST['razonSocial'] : '';
$nombreComercial = (isset($_POST['nombreComercial'])) ? $_POST['nombreComercial'] : '';
$usoCfdi = (isset($_POST['usoCfdi'])) ? $_POST['usoCfdi'] : '';
$metodoPago = (isset($_POST['metodoPago'])) ? $_POST['metodoPago'] : '';
$formaPago = (isset($_POST['formaPago'])) ? $_POST['formaPago'] : '';
$descripcionEmpresa = (isset($_POST['descripcionEmpresa'])) ? $_POST['descripcionEmpresa'] : '';
$descripcionProductos = (isset($_POST['descripcionProductos'])) ? $_POST['descripcionProductos'] : '';
$listadoPrecios = (isset($_POST['listadoPrecios'])) ? $_POST['listadoPrecios'] : '';
$numColaboradores = (isset($_POST['numColaboradores'])) ? $_POST['numColaboradores'] : '';
$grupoMultinacional = (isset($_POST['grupoMultinacional'])) ? $_POST['grupoMultinacional'] : '';
$direccionFiscal = (isset($_POST['direccionFiscal'])) ? $_POST['direccionFiscal'] : '';
$mismaDireccionNotificacion = (isset($_POST['mismaDireccionNotificacion'])) ? $_POST['mismaDireccionNotificacion'] : '';
$direccionNotificaciones = (isset($_POST['direccionNotificaciones'])) ? $_POST['direccionNotificaciones'] : '';
$otrasUbicaciones = (isset($_POST['otrasUbicaciones'])) ? $_POST['otrasUbicaciones'] : '';
$contactoPrincipal = (isset($_POST['contactoPrincipal'])) ? $_POST['contactoPrincipal'] : '';
$emailPrincipal = (isset($_POST['emailPrincipal'])) ? $_POST['emailPrincipal'] : '';
$telefonoPrincipal = (isset($_POST['telefonoPrincipal'])) ? $_POST['telefonoPrincipal'] : '';
$contactoAdministrativo = (isset($_POST['contactoAdministrativo'])) ? $_POST['contactoAdministrativo'] : '';
$emailAdministrativo = (isset($_POST['emailAdministrativo'])) ? $_POST['emailAdministrativo'] : '';
$telefonoAdministrativo = (isset($_POST['telefonoAdministrativo'])) ? $_POST['telefonoAdministrativo'] : '';
$paginaWeb = (isset($_POST['paginaWeb'])) ? $_POST['paginaWeb'] : '';
$redesSociales = (isset($_POST['redesSociales'])) ? $_POST['redesSociales'] : '';
$idioma = (isset($_POST['idioma'])) ? $_POST['idioma'] : '';
$nombreBanco = (isset($_POST['nombreBanco'])) ? $_POST['nombreBanco'] : '';
$numeroCuenta = (isset($_POST['numeroCuenta'])) ? $_POST['numeroCuenta'] : '';
$clabeBancaria = (isset($_POST['clabeBancaria'])) ? $_POST['clabeBancaria'] : '';

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
        $cs = $con -> query("INSERT INTO infoProveedores (folio, tipoPersona, rfc, razonSocial, nombreComercial, usoCfdi, metodoPago, formaPago, descripcionEmpresa, descripcionProductos, listadoPrecios, numColaboradores, grupoMultinacional, direccionFiscal, mismaDireccionNotificacion, direccionNotificaciones, otrasUbicaciones, contactoPrincipal, emailPrincipal, telefonoPrincipal, contactoAdministrativo, emailAdministrativo, telefonoAdministrativo, paginaWeb, redesSociales, idioma, nombreBanco, numeroCuenta, clabeBancaria, fechaHoraReg) VALUES('$folio', '$tipoPersona', '$rfc', '$razonSocial', '$nombreComercial', '$usoCfdi', '$metodoPago', '$formaPago','$descripcionEmpresa', '$descripcionProductos', '$listadoPrecios', '$numColaboradores', '$grupoMultinacional', '$direccionFiscal', '$mismaDireccionNotificacion', '$direccionNotificaciones', '$otrasUbicaciones', '$contactoPrincipal', '$emailPrincipal', '$telefonoPrincipal', '$contactoAdministrativo', '$emailAdministrativo', '$telefonoAdministrativo', '$paginaWeb', '$redesSociales', '$idioma', '$nombreBanco', '$numeroCuenta', '$clabeBancaria', '$fechaHoraReg')");

        break;
    // Actualizar
    case 2 :
        $cs = $con -> query("UPDATE infoProveedores SET tipoPersona = '$tipoPersona', rfc = '$rfc', razonSocial = '$razonSocial', nombreComercial = '$nombreComercial', usoCfdi = '$usoCfdi', metodoPago = '$metodoPago', formaPago = '$formaPago', descripcionEmpresa = '$descripcionEmpresa', descripcionProductos = '$descripcionProductos', listadoPrecios = '$listadoPrecios', numColaboradores = '$numColaboradores', grupoMultinacional = '$grupoMultinacional', direccionFiscal = '$direccionFiscal', mismaDireccionNotificacion = '$mismaDireccionNotificacion', direccionNotificaciones = '$direccionNotificaciones', otrasUbicaciones = '$otrasUbicaciones', contactoPrincipal = '$contactoPrincipal', emailPrincipal = '$emailPrincipal', telefonoPrincipal = '$telefonoPrincipal', contactoAdministrativo = '$contactoAdministrativo', emailAdministrativo = '$emailAdministrativo', telefonoAdministrativo = '$telefonoAdministrativo', paginaWeb = '$paginaWeb', redesSociales = '$redesSociales', idioma = '$idioma', nombreBanco = '$nombreBanco', numeroCuenta = '$numeroCuenta', clabeBancaria = '$clabeBancaria', fechaHoraReg = '$fechaHoraReg'  WHERE id = '$id'");        

        break;
    // Eliminar
    case 3 :
        $cs = $con -> query("DELETE FROM infoProveedores WHERE id = '$id'");
        break;
    // Leer
    case 4 :
        $cs = $con -> query("SELECT * FROM infoProveedores WHERE folio = '$folio'");
        $datos = array();


        if ($resul = $cs->fetchArray()) {
            $datos['existe'] = true;
            $datos['id'] = $resul['id'];
            $datos['tipoPersona'] = $resul['tipoPersona'];
            $datos['rfc'] = $resul['rfc'];
            $datos['razonSocial'] = $resul['razonSocial'];
            $datos['nombreComercial'] = $resul['nombreComercial'];
            $datos['usoCfdi'] = $resul['usoCfdi'];
            $datos['metodoPago'] = $resul['metodoPago'];
            $datos['formaPago'] = $resul['formaPago'];
            $datos['descripcionEmpresa'] = $resul['descripcionEmpresa'];
            $datos['descripcionProductos'] = $resul['descripcionProductos'];
            $datos['listadoPrecios'] = $resul['listadoPrecios'];
            $datos['numColaboradores'] = $resul['numColaboradores'];
            $datos['grupoMultinacional'] = $resul['grupoMultinacional'];
            $datos['direccionFiscal'] = $resul['direccionFiscal'];
            $datos['mismaDireccionNotificacion'] = $resul['mismaDireccionNotificacion'];
            $datos['direccionNotificaciones'] = $resul['direccionNotificaciones'];
            $datos['otrasUbicaciones'] = $resul['otrasUbicaciones'];
            $datos['contactoPrincipal'] = $resul['contactoPrincipal'];
            $datos['emailPrincipal'] = $resul['emailPrincipal'];
            $datos['telefonoPrincipal'] = $resul['telefonoPrincipal'];
            $datos['contactoAdministrativo'] = $resul['contactoAdministrativo'];
            $datos['emailAdministrativo'] = $resul['emailAdministrativo'];
            $datos['telefonoAdministrativo'] = $resul['telefonoAdministrativo'];
            $datos['paginaWeb'] = $resul['paginaWeb'];
            $datos['redesSociales'] = $resul['redesSociales'];
            $datos['idioma'] = $resul['idioma'];
            $datos['nombreBanco'] = $resul['nombreBanco'];
            $datos['numeroCuenta'] = $resul['numeroCuenta'];
            $datos['clabeBancaria'] = $resul['clabeBancaria'];
            $datos['fechaHoraReg'] = $resul['fechaHoraReg'];
        } else {
            $datos['existe'] = false;
        }

        break;
    // endpoint folio proveedores
    case 5:
    // ✅ DEBUG DETALLADO DE LA SESIÓN
    error_log("=== DEBUG SESIÓN COMPLETO ===");
    error_log("Session ID: " . session_id());
    error_log("Session status: " . session_status());
    error_log("Session save path: " . session_save_path());
    error_log("Session name: " . session_name());
    
    // Debug de toda la sesión
    error_log("Variables de sesión completas:");
    foreach ($_SESSION as $key => $value) {
        error_log("  \$_SESSION['$key'] = '$value' (" . gettype($value) . ")");
    }
    
    // ✅ OBTENER FOLIO DIRECTAMENTE DE LA SESIÓN (no usar la variable $folio del inicio)
    $folioEnSesion = isset($_SESSION["folio"]) ? $_SESSION["folio"] : null;
    error_log("Folio específico:");
    error_log("  isset: " . (isset($_SESSION["folio"]) ? 'true' : 'false'));
    error_log("  empty: " . (empty($_SESSION["folio"]) ? 'true' : 'false'));
    error_log("  valor: '" . $folioEnSesion . "'");
    error_log("  tipo: " . gettype($folioEnSesion));
    error_log("  longitud: " . strlen($folioEnSesion ?? ''));
    
    // Debug del request
    $input = file_get_contents("php://input");
    error_log("Request input: " . $input);
    error_log("POST data: " . print_r($_POST, true));
    
    $datos = array();
    
    // ✅ VERIFICACIÓN MEJORADA - usar $folioEnSesion en lugar de $folio
    if (isset($_SESSION["folio"]) && !empty($_SESSION["folio"]) && trim($_SESSION["folio"]) !== '') {
        $datos['folio'] = $_SESSION["folio"];
        $datos['existe_folio'] = true;
        $datos['debug'] = [
            'session_id' => session_id(),
            'folio_type' => gettype($_SESSION["folio"]),
            'folio_length' => strlen($_SESSION["folio"]),
            'folio_trimmed' => trim($_SESSION["folio"]),
            'folio_trimmed_length' => strlen(trim($_SESSION["folio"])),
            'all_session_keys' => array_keys($_SESSION),
            'session_count' => count($_SESSION)
        ];
        error_log("✅ Folio encontrado y enviado: '" . $_SESSION["folio"] . "'");
    } else {
        $datos['folio'] = '';
        $datos['existe_folio'] = false;
        $datos['debug'] = [
            'session_id' => session_id(),
            'session_keys' => array_keys($_SESSION),
            'session_data' => $_SESSION,
            'session_count' => count($_SESSION),
            'folio_isset' => isset($_SESSION["folio"]),
            'folio_empty' => empty($_SESSION["folio"]),
            'folio_value' => $_SESSION["folio"] ?? 'NOT_SET',
            'message' => 'No hay folio válido en $_SESSION'
        ];
        error_log("❌ No hay folio válido en la sesión");
        error_log("❌ Debugging info: " . print_r($datos['debug'], true));
    }
    
    error_log("Respuesta que se enviará: " . json_encode($datos));
    break;
}
$datos = (isset($datos) ? $datos : '');
echo json_encode($datos);

$con -> close();


?>