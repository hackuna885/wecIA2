<?php 

error_reporting(E_ALL ^ E_DEPRECATED);
header("Content-Type: text/html; Charset=UTF-8");
date_default_timezone_set('America/Mexico_City');
session_start();

// Codifica el formato json
$_POST = json_decode(file_get_contents("php://input"), true);

// Entradas Form
$opcion = (isset($_POST['opcion'])) ? $_POST['opcion'] : '';

$nCorreo = (isset($_POST['nCorreo'])) ? $_POST['nCorreo'] : '';
$passUsr = (isset($_POST['passUsr'])) ? $_POST['passUsr'] : '';


// Conexion a DB
$con = new SQLite3("../data/data.db");

if ($opcion === 1) {
	if($nCorreo === '' || $passUsr === ''){
		echo json_encode([
			'status' => 'error',
			'message' => '
			<div class="alert alert-danger text-center animate__animated animate__fadeIn" role="alert">
				Llena todos los campos
			</div>
			'
		]);
	}else{
		
		$correoCript = md5($nCorreo);
		$passCript = md5($passUsr);

		
		$cs = $con -> query("SELECT id, folio, nombre, aPaterno, correo, correoCript, passCript, per1, per2, per3 FROM usr WHERE correoCript = '$correoCript'");
	
		$userData = null;
		while ($resul = $cs -> fetchArray()) {
			$userData = [
				'id' => $resul['id'],
				'folio' => $resul['folio'],
				'nombre' => $resul['nombre'],
				'aPaterno' => $resul['aPaterno'],
				'correo' => $resul['correo'],
				'correoMd5' => $resul['correoCript'],
				'password' => $resul['passCript'],
				'per1' => $resul['per1'], // Rol: 1=Admin, 2=Supervisor, 3=Usuario
				'per2' => $resul['per2'], // Estado: 0=Inactivo, 1=Activo, 2=Bloqueado
				'per3' => $resul['per3']  // Tableros permitidos
			];
		}
		//Variable hiperglobal de folio
		$_SESSION["folio"] = $userData['folio'] ?? '';

		if($userData === null){

			echo json_encode([
				'status' => 'error',
				'message' => '
				<div class="alert alert-danger text-center animate__animated animate__fadeIn" role="alert">
					¡Error! Correo no registrado
				</div>
				'
			]);

		}else{

			if($passCript === $userData['password']){

				// Verificar que el usuario esté activo (per2 = 1)
				if($userData['per2'] == 1){
					
					// Generar token simple (en producción usar JWT)
					$token = base64_encode(json_encode([
						'id' => $userData['id'],
						'email' => $userData['correo'],
						'timestamp' => time(),
						'signature' => md5($userData['id'] . $userData['correo'] . time() . 'tu_clave_secreta_aqui')
					]));
					
					echo json_encode([
						'status' => 'success',
						'message' => 'correcto',
						'user' => [
							'id' => $userData['id'],
							'nombre' => $userData['nombre'] . ' ' . $userData['aPaterno'],
							'correo' => $userData['correo'],
							'rol' => intval($userData['per1']),      // 1=Admin, 2=Supervisor, 3=Usuario
							'estado' => intval($userData['per2']),    // 0=Inactivo, 1=Activo, 2=Bloqueado
							'tableros' => intval($userData['per3']),  // 1=Todos, 2=Sin proveedores, 3=Solo Doc y Config
							'token' => $token
						]
					]);
					
				}else if($userData['per2'] == 0){
					
					echo json_encode([
						'status' => 'error',
						'message' => '
						<div class="alert alert-warning text-center animate__animated animate__fadeIn" role="alert">
							Tu cuenta está inactiva. Por favor, contacta al administrador.
						</div>
						'
					]);
					
				}else{
	
					echo json_encode([
						'status' => 'error',
						'message' => '
						<div class="alert alert-danger text-center animate__animated animate__fadeIn" role="alert">
							¡Acceso bloqueado. Por favor, consulta en oficinas!
						</div>
						'
					]);	
				}
			}else{
				echo json_encode([
					'status' => 'error',
					'message' => '
					<div class="alert alert-danger text-center animate__animated animate__fadeIn" role="alert">
						¡Error! Contraseña no válida
					</div>
					'
				]);
			}

		}
	}
}else{
	echo json_encode(['status' => 'error', 'message' => 'Opción no válida']);
}

$con -> close();

 ?>