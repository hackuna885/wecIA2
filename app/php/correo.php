<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpMailer/Exception.php';
require 'phpMailer/PHPMailer.php';
require 'phpMailer/SMTP.php';

$_POST = json_decode(file_get_contents("php://input"), true);

// 🔥 CONFIGURACIÓN RÁPIDA
$email = 'ovelazquez@corsec.com.mx';
$appPassword = 'oifh ogvh bdli klvf'; // ⚠️ CAMBIAR ESTO

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
    $mail->setFrom($email, 'Hack Test');
    $mail->addAddress($email);
    $mail->Subject = 'Bienvenido(a) a SEPGA – Acceso a la Plataforma';
    $mail->isHTML(true);
    $mail->Body = '
    <html style="background-color: black;">
    
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
                            <p style="text-align: justify;"><b>Estimado(a) </b>[Nombre del Proveedor],
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
                                Usuario: [usuario_asignado]
                                <br>
                                Contraseña: [contraseña_asignada]
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

?>
