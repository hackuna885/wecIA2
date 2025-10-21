app.component("web-home", {
  template: /*html*/ `
        <!-- Inicia Código -->
        <header>
          <div class="centrado-h-v" id="vantaHalo">
            <div class="row">
              <div class="col-md-8 p-5 mx-auto">
        
                <div class="shadow border-0 rounded border-light p-4 p-lg-5 text-white"
                  style="background-color: rgba(0, 0, 0, .5); width: 100%;">
                  <div class="row">
                    <div class="col-8 mx-auto">
                      <img src="assets/img/logo.svg" class="img-fluid my-3" alt="logo">
                    </div>
                  </div>
                  <div class="text-center text-md-center mb-4 mt-md-0">
                    <h1 class="mb-0 h3">Inicio de Sesión</h1>
                  </div>
        
                  <form class="mt-4" @submit.prevent="revDatos">
                    <div class="form-group mb-4">
                      <label>Correo</label>
                      <div class="input-group">
                        <span class="input-group-text" id="basic-addon1">
                          <svg class="icon icon-xs text-gray-600" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                          </svg>
                        </span>
                        <input type="email" class="form-control" placeholder="ejemplo@correo.com" id="email" autofocus
                          v-model="nCorreo" required>
                      </div>
                    </div>
                    <div class="form-group" v-html="datos"></div>
                    <div class="form-group">
        
                      <div class="form-group mb-4">
                        <label>Contraseña</label>
                        <div class="input-group">
                          <span class="input-group-text" id="basic-addon2">
                            <svg class="icon icon-xs text-gray-600" fill="currentColor" viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clip-rule="evenodd"></path>
                            </svg>
                          </span>
                          <input type="password" placeholder="Contraseña" class="form-control" id="password" v-model="passUsr"
                            required>
                        </div>
                      </div>
        
                      <div class="form-group mb-4">
                        <label>Confirmar contraseña</label>
                        <div class="input-group">
                          <span class="input-group-text" id="basic-addon2">
                            <svg class="icon icon-xs text-gray-600" fill="currentColor" viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clip-rule="evenodd"></path>
                            </svg>
                          </span>
                          <input type="password" placeholder="Confirmar contraseña" class="form-control" id="confirm_password"
                            v-model="passUsrDos" :disabled="estadoPass" required>
                        </div>
                      </div>
                      <div :class="notificaEstadoPass" role="alert">
                        {{validaContrasena}}
                      </div>
        
                    </div>
                    <br>
                    <div class="d-grid">
                      <button type="submit" class="btn btn-gray-800 btn-lg" :disabled="!formularioValido">Iniciar Sesión</button>
                    </div>
                  </form>
        
                </div>
        
              </div>
            </div>
          </div>
        </header>
        <!-- Inicia Código -->


`,
  data() {
    return {
      datos: "",
      nCorreo: "",
      passUsr: "",
      passUsrDos: "",
      msgAlert: "",
      estadoPass: true,
      notificaEstadoPass: "",
      validaBtn: false,
      estadoBtn: false,
      redirectUrl: null,
      vantaEffect: null, // Añadimos una propiedad para almacenar la referencia al efecto
    };
  },
  computed: {
    validaContrasena() {
      this.notificaEstadoPass = "small alert alert-light text-muted";
      this.validaBtn = false;

      if (this.passUsr.length < 6) {
        this.estadoPass = true;
        return "La contraseña debe tener al menos seis (6) caracteres.";
      }

      this.estadoPass = false;

      if (this.passUsrDos.length < 6) {
        return "La segunda contraseña también debe tener al menos seis (6) caracteres.";
      }

      if (this.passUsr !== this.passUsrDos) {
        this.notificaEstadoPass = "small alert alert-danger";
        return "¡Error! Las contraseñas no coinciden.";
      }

      this.notificaEstadoPass = "small alert alert-success";
      this.validaBtn = true;
      return "Contraseña válida.";
    },
    // valida boton
    formularioValido() {
      return this.nCorreo && this.passUsr && this.passUsrDos && this.validaBtn;
    },

  },
  methods: {
    revDatos() {
      axios
        .post("../wecIA2/verifica/verifica.app", {
          opcion: 1,
          nCorreo: this.nCorreo,
          passUsr: this.passUsr,
        })
        .then((response) => {
          // Verificar si es la respuesta antigua (string "correcto") o la nueva (objeto)
          if (response.data === "correcto") {
            // Respuesta antigua - crear datos de usuario por defecto
            const defaultUser = {
              id: 1,
              nombre: 'Administrador',
              correo: this.nCorreo,
              rol: 1,      // Admin por defecto
              estado: 1,   // Activo
              tableros: 1, // Todos los tableros
              token: btoa(JSON.stringify({ email: this.nCorreo, timestamp: Date.now() }))
            };

            // Guardar estado de autenticación (compatible con el sistema anterior)
            localStorage.setItem("isAuthenticated", "true");

            //Guarda Varible de Correo de Usuario
            localStorage.setItem('userEmail', this.nCorreo);

            // Si tienes userPermissions disponible, úsalo
            if (typeof userPermissions !== 'undefined') {
              userPermissions.saveUserData(defaultUser);
            } else {
              // Fallback al sistema anterior
              localStorage.setItem("userData", JSON.stringify(defaultUser));
            }

            Swal.fire({
              icon: "success",
              title: "¡Bienvenido!",
              showConfirmButton: false,
              timer: 2000,
              willClose: () => {
                this.$router.push('/dashboard');
              },
            });

          } else if (response.data.status === "success") {
            // Nueva respuesta con permisos
            userPermissions.saveUserData(response.data.user);

            //Guarda Varible de Correo de Usuario
            localStorage.setItem('userEmail', this.nCorreo);

            Swal.fire({
              icon: "success",
              title: "¡Bienvenido!",
              text: `Hola ${response.data.user.nombre}`,
              showConfirmButton: false,
              timer: 2000,
              willClose: () => {
                const homePage = userPermissions.getHomePage();
                const redirectUrl = new URLSearchParams(window.location.search).get("redirect");

                if (redirectUrl && userPermissions.hasAccessToRoute(redirectUrl.replace('/', ''))) {
                  this.$router.push(redirectUrl);
                } else {
                  this.$router.push(homePage);
                }
              },
            });
          } else if (response.data.status === "error") {
            // Nueva respuesta de error
            this.datos = response.data.message;
          } else {
            // Respuesta antigua de error (HTML)
            this.datos = response.data;
          }
        })
        .catch((error) => {
          console.error("Error de autenticación:", error);
          Swal.fire({
            icon: "error",
            title: "Error de inicio de sesión",
            text: "No se pudo iniciar sesión. Intente nuevamente.",
          });
        });
    },

    // ####
    checkAuth() {
      return localStorage.getItem("isAuthenticated") === "true";
    },
    // ####
  },
  created() {
    // Captura el parámetro de redirección de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    this.redirectUrl = urlParams.get("redirect");

    // Si el usuario ya está autenticado, redirigir inmediatamente
    if (this.checkAuth()) {
      const redirectTo = this.redirectUrl || "/dashboard";
      this.$router.push(redirectTo);
    }
  },
  mounted() {
    // Inicializar el efecto VANTA.HALO cuando el componente esté montado
    this.vantaEffect = VANTA.WAVES({
      el: "#vantaHalo",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x2c52,
      waveSpeed: 1.05
    });
  },
  // Importante: limpiar el efecto cuando el componente se destruya para evitar memory leaks
  beforeUnmount() {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }

});

app.component("web-dashBoard", {
  template: /*html*/ `
      <!-- Inicia Código -->
      <base-layout>
      </base-layout>

        <!-- Termina Código -->


  `,
  data() {
    return {
      
    };
  },
  computed: {},
  methods: {},
  created() { },
  mounted() { },
});

// Componente de Proveedores
app.component("web-usuarios", {
  template: /*html*/ `
  <base-layout>
  <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow mb-4">
            <div class="card-header">
              <div class="row align-items-center">
                <div class="col">
                  <h2 class="h5">Gestión de Usuarios</h2>
                  <p class="mb-0">Administra tu base de Usuarios</p>
                </div>
                <div class="col-auto">
                  <button class="btn btn-sm btn-primary" @click="agregarProveedor()">
                    <svg class="icon icon-xs me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Nuevo Usuario
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-centered table-nowrap mb-0 rounded">
                  <thead class="thead-light">
                    <tr>
                      <th class="border-0">#</th>
                      <th class="border-0">Empresa</th>
                      <th class="border-0">Email</th>
                      <th class="border-0">Teléfono</th>
                      <th class="border-0">Estado</th>
                      <th class="border-0">Editar/Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(liProveedores, index) in datos" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td class="fw-bold">{{ liProveedores.nomEmpresa }}</td>
                      <td>{{ liProveedores.correo }}</td>
                      <td>{{ liProveedores.telefono }}</td>
                      <td>
                        <span class="badge"
                          :class="liProveedores.per2 == 1 ? 'bg-success' : liProveedores.per2 == 0 ? 'bg-warning' : 'bg-danger'">
                          {{ liProveedores.per2 == 1 ? 'Activo' : liProveedores.per2 == 0 ? 'Inactivo' : 'Bloqueado' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-1" @click="editProveedor(liProveedores.id,liProveedores.nomEmpresa, liProveedores.nombre, liProveedores.aPaterno, liProveedores.aMaterno, liProveedores.telefono, liProveedores.correo, liProveedores.password)">
                          <svg class="icon icon-xs" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="eliminarProveedor(liProveedores.id, liProveedores.nomEmpresa)" data-bs-toggle="tooltip"
                          data-bs-placement="top" title="Eliminar proveedor">
                          <svg class="icon icon-xs" fill="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </base-layout>
  `,
  data() {
    return {
      datos: [],

    };
  },
  computed: {
    validaBtn() {
      return this.nomUsr != '' && this.apeUsr != '' && this.corUsr != '' && this.pasUsr.length >= 5 ? this.estado = false : this.estado = true
    }
  },
  methods: {
    // BOTONES

    // Boton Alta
    async agregarProveedor() {
      const { value: formValues } = await Swal.fire({
        title: 'Nuevo Usuario',
        html: /*html*/ `
                <div class="row m-0 p-0">
                  <div class="form-group mb-3 col-md-12">
                    <input type="text" class="form-control" placeholder="Nom Empresa..." value="" id="nomEmpre" name="nomEmpre" required />
                  </div>
                  <div class="form-group mb-3 col-md-12">
                    <input type="text" class="form-control" placeholder="Nombre..." value="" id="nombre" name="nombre" required />
                  </div>
                  <div class="form-group mb-3 col-md-12">
                    <input type="text" class="form-control" placeholder="Apellido Paterno..." value="" id="aPaterno" name="aPaterno" required />
                  </div>
                  <div class="form-group mb-3 col-md-12">
                    <input type="text" class="form-control" placeholder="Apellido Materno..." value="" id="aMaterno" name="aMaterno" required />
                  </div>
                  <div class="form-group mb-3 col-md-6">
                    <input type="text" class="form-control" placeholder="Teléfono..." value="" id="telefono" name="telefono" required />
                  </div>
                  <div class="form-group mb-3 col-md-6">
                  </div>
                  <div class="form-group mb-3 col-md-6">
                    <input type="email" class="form-control" placeholder="Correo..." value="" id="correo" name="correo" required />
                  </div>
                  <div class="form-group mb-3 col-md-6">
                    <input type="password" class="form-control" placeholder="Contraseña..." value="" id="password" name="password" required />
                  </div>
                </div>
                `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        confirmButtonColor: '#1f2a38',
        cancelButtonColor: '#d33'
      })
        .then((result) => {
          if (result.value) {
            const nomEmpre = document.getElementById('nomEmpre').value;
            const nombre = document.getElementById('nombre').value;
            const aPaterno = document.getElementById('aPaterno').value;
            const aMaterno = document.getElementById('aMaterno').value;
            const telefono = document.getElementById('telefono').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            this.alta(nomEmpre, nombre, aPaterno, aMaterno, telefono, correo, password);
            Swal.fire(
              '¡Alta Exitosa!',
              'Proveedor Agregado.',
              'success'
            );
          }
        })
    },

    // Boton de Actualizar
    editProveedor(id, nomEmpre, nombre, aPaterno, aMaterno, telefono, correo, password) {
      const proveedorActual = this.datos.find(p => p.id == id);
      const estadoActual = proveedorActual ? proveedorActual.per2 : 0;
      Swal.fire({
        title: 'Editar',
        html: /*html*/ `
                <div class="row m-0 p-0">
                    <div class="form-group mb-3 col-md-12">
                        <input type="text" class="form-control" placeholder="Nom Empresa..." value="${nomEmpre}" id="nomEmpre" name="nomEmpre" required />
                    </div>
                    <div class="form-group mb-3 col-md-12">
                        <input type="text" class="form-control" placeholder="Nombre..." value="${nombre}" id="nombre" name="nombre" required />
                    </div>
                    <div class="form-group mb-3 col-md-12">
                        <input type="text" class="form-control" placeholder="Apellido Paterno..." value="${aPaterno}" id="aPaterno" name="aPaterno" required />
                    </div>
                    <div class="form-group mb-3 col-md-12">
                        <input type="text" class="form-control" placeholder="Apellido Materno..." value="${aMaterno}" id="aMaterno" name="aMaterno" required />
                    </div>
                    <div class="form-group mb-3 col-md-6">
                        <input type="email" class="form-control" placeholder="Teléfono..." value="${telefono}" id="telefono" name="telefono" required />
                    </div>
                    <div class="form-group mb-3 col-md-6">
                    </div>
                    <div class="form-group mb-3 col-md-6">
                        <input type="email" class="form-control" placeholder="Correo..." value="${correo}" id="correo" name="correo" required />
                    </div>
                    <div class="form-group mb-3 col-md-6">
                        <input type="password" class="form-control" placeholder="Contraseña..." value="${password}" id="password" name="password" required />
                    </div>

                    <!-- Switch para Estado del Usuario -->
                    <div class="form-group mb-3 col-md-12">
                      <div class="d-flex align-items-center justify-content-between p-3 border rounded">
                        <div>
                          <label for="estadoSwitch" class="form-label mb-0 fw-bold">Estado del Usuario:</label>
                          <small class="text-muted d-block">Activa o desactiva el acceso del usuario</small>
                        </div>
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="estadoSwitch" name="estadoSwitch" ${estadoActual == 1 ? 'checked' : ''} style="transform: scale(1.2);">
                          <label class="form-check-label fw-bold" for="estadoSwitch" id="estadoLabel" style="color: ${estadoActual == 1 ? '#28a745' : '#dc3545'};">
                            ${estadoActual == 1 ? 'ACTIVO' : 'INACTIVO'}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                </div>
                `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        confirmButtonColor: '#1f2a38',
        cancelButtonColor: '#d33',
        width: '600px',

        didOpen: () => {
          // El script se ejecuta cuando el modal se abre
          document.getElementById('estadoSwitch').addEventListener('change', function () {
            const label = document.getElementById('estadoLabel');
            if (this.checked) {
              label.textContent = 'ACTIVO';
              label.style.color = '#28a745'; // Verde
            } else {
              label.textContent = 'INACTIVO';
              label.style.color = '#dc3545'; // Rojo
            }
          });
        }
      })
        .then((result) => {
          if (result.value) {
            nomEmpre = document.getElementById('nomEmpre').value,
              nombre = document.getElementById('nombre').value,
              aPaterno = document.getElementById('aPaterno').value,
              aMaterno = document.getElementById('aMaterno').value,
              telefono = document.getElementById('telefono').value,
              correo = document.getElementById('correo').value,
              password = document.getElementById('password').value,
              estado = document.getElementById('estadoSwitch').checked ? 1 : 0;

            this.editar(id, nomEmpre, nombre, aPaterno, aMaterno, telefono, correo, password, estado);

            Swal.fire(
              '¡Actualizado!',
              'El registro ha sido actualizado.',
              'success'
            )
          }
        })
    },

    // Boton de Eliminar
    eliminarProveedor(id, nomEmpre) {
      Swal.fire({
        title: '¿Estás seguro de eliminar ' + nomEmpre + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1f2a38',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Borrar'
      })
        .then(result => {
          if (result.value) {
            this.eliminar(id)

            Swal.fire(
              '¡Eliminado!',
              'El registro ha sido eliminado.',
              'success'
            )
          }
        })
    },

    // PROCESOS

    // Proceso Alta
    alta(nomEmpre, nombre, aPaterno, aMaterno, telefono, correo, password) {
      axios.post('../wecIA2/datos/datos.app', {
        opcion: 1,
        nomEmpre: nomEmpre,
        nombre: nombre,
        aPaterno: aPaterno,
        aMaterno: aMaterno,
        telefono: telefono,
        correo: correo,
        password: password
      })
        .then(response => {
          this.liProveedores()
        })
    },

    // Proceso Editar
    editar(id, nomEmpre, nombre, aPaterno, aMaterno, telefono, correo, password, estado) {
      axios.post('../wecIA2/datos/datos.app', {
        opcion: 2,
        id: id,
        nomEmpre: nomEmpre,
        nombre: nombre,
        aPaterno: aPaterno,
        aMaterno: aMaterno,
        telefono: telefono,
        correo: correo,
        password: password,
        estado: estado,
      })
        .then(response => {
          this.liProveedores();
        });
    },

    // Proceso Eliminar
    eliminar(id) {
      axios.post('../wecIA2/datos/datos.app', {
        opcion: 3,
        id: id
      })
        .then(response => {
          this.liProveedores()
        })
    },

    // Lista de datos
    liProveedores() {
      axios.post('../wecIA2/datos/datos.app', {
        opcion: 4
      })
        .then(response => {
          this.datos = response.data
          // console.log(response.data)
        })
    }
  },
  created() {
    this.liProveedores()
  },
  mounted() { },
});

// Componente de Chats
app.component("web-chats", {
  template: /*html*/ `
  <base-layout>
    <div class="container-fluid">
      <div class="row">
        <div class="col-mb-10 mx-auto">
          <div class="card border-0 shadow mb-4">
            <div class="card-header">
              <div class="row align-items-center">
                <div class="col">
                  <h2 class="h5">Consulta a WEC IA</h2>
                  <p class="mb-0">Sube tu documento y realiza consultas inteligentes</p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <form @submit.prevent="enviarConsulta" enctype="multipart/form-data">
                <div class="row">
                  
                  <!-- Zona de carga de archivo -->
                  <div class="col-md-12 mb-4">
                    <label class="form-label fw-bold">Seleccionar imagen (JPG, JPEG) o PDF:</label>
                    <div class="border rounded p-4 text-center" 
                         style="border: 2px dashed #dee2e6 !important; background-color: #f8f9fa; cursor: pointer; transition: all 0.3s ease;"
                         @dragenter.prevent="resaltarZona"
                         @dragover.prevent="resaltarZona"
                         @dragleave.prevent="quitarResaltado"
                         @drop.prevent="manejarArchivo"
                         @click="$refs.archivoInput.click()">
                      
                      <svg class="mb-3" width="48" height="48" fill="none" stroke="#6c757d" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      
                      <p class="mb-1 fw-bold text-muted">Haz clic para seleccionar o arrastra tu archivo aquí</p>
                      <p class="mb-0 small text-muted">Formatos permitidos: JPG, JPEG, PDF</p>
                      
                      <input type="file" 
                             class="d-none" 
                             ref="archivoInput"
                             @change="mostrarVistaPrevia" 
                             accept=".jpg, .jpeg, .pdf">
                    </div>
                  </div>

                  <!-- Vista previa del documento -->
                  <div class="col-md-12 mb-4" v-if="archivoSeleccionado">
                    <div class="card border-0 shadow-sm">
                      <div class="card-body text-center">
                        <img v-if="esImagen" 
                             :src="vistaPreviaUrl" 
                             class="img-fluid rounded" 
                             alt="Vista previa del documento" 
                             style="max-height: 400px;">
                        
                        <p v-if="!esImagen" class="mb-0 fw-bold text-primary">
                          📄 {{ nombreArchivo }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Campo de consulta -->
                  <div class="col-md-12 mb-4">
                    <label for="consulta" class="form-label fw-bold">Ingrese su consulta sobre el documento:</label>
                    <textarea v-model="consulta" 
                              class="form-control" 
                              rows="6" 
                              placeholder="Escribe tu consulta aquí..." 
                              style="resize: vertical;"></textarea>
                  </div>

                  <!-- Botón de envío -->
                  <div class="col-md-12 mb-3">
                    <button type="submit" 
                            class="btn btn-primary btn-lg w-100"
                            :disabled="cargando">
                      
                      <span v-if="!cargando">
                        <svg class="icon icon-xs me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Consultar
                      </span>
                      
                      <span v-else>
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Espere, por favor...
                      </span>
                    </button>
                  </div>

                  <!-- Contenedor de resultados -->
                  <div class="col-md-12" v-if="mostrarResultado">
                    <div class="card border-0 shadow-sm">
                      <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Resultado:</h5>
                      </div>
                      <div class="card-body">
                        <div v-html="resultado" 
                             class="mb-0" 
                             style="white-space: normal; word-wrap: break-word; font-family: inherit; background-color: #f8f9fa; padding: 1rem; border-radius: 0.375rem;">
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </base-layout>
  `,
  
  // AQUÍ GUARDAMOS LOS DATOS
  data() {
    return {
      archivoSeleccionado: null,
      vistaPreviaUrl: '',
      nombreArchivo: '',
      esImagen: false,
      consulta: '',
      resultado: '',
      mostrarResultado: false,
      cargando: false
    };
  },
  
  // AQUÍ VAN LAS FUNCIONES
  methods: {
    // Cuando arrastras un archivo sobre la zona
    resaltarZona(evento) {
      evento.target.style.borderColor = '#0d6efd';
      evento.target.style.backgroundColor = '#e7f1ff';
    },
    
    // Cuando quitas el archivo de la zona
    quitarResaltado(evento) {
      evento.target.style.borderColor = '#dee2e6';
      evento.target.style.backgroundColor = '#f8f9fa';
    },
    
    // Cuando sueltas el archivo en la zona
    manejarArchivo(evento) {
      this.quitarResaltado(evento);
      const archivos = evento.dataTransfer.files;
      
      if (archivos.length > 0) {
        this.$refs.archivoInput.files = archivos;
        this.mostrarVistaPrevia();
      }
    },
    
    // Mostrar la imagen o nombre del PDF
    mostrarVistaPrevia() {
      const archivo = this.$refs.archivoInput.files[0];
      
      if (!archivo) return;
      
      this.archivoSeleccionado = archivo;
      this.nombreArchivo = archivo.name;
      this.consulta = '';
      this.resultado = '';
      this.mostrarResultado = false;
      
      // Si es imagen, mostrar vista previa
      if (archivo.type === 'image/jpeg' || archivo.type === 'image/png') {
        this.esImagen = true;
        const lector = new FileReader();
        lector.onload = (e) => {
          this.vistaPreviaUrl = e.target.result;
        };
        lector.readAsDataURL(archivo);
      } else {
        // Si es PDF, solo mostrar el nombre
        this.esImagen = false;
      }
    },
    
    // Enviar el formulario
    async enviarConsulta() {
      // Validaciones
      if (!this.consulta.trim()) {
        alert('Por favor, ingrese su consulta sobre el documento.');
        return;
      }
      
      this.cargando = true;
      this.resultado = 'Cargando...';
      this.mostrarResultado = true;
      
      // Preparar datos para enviar
      const datosFormulario = new FormData();
      datosFormulario.append('consulta', this.consulta);
      datosFormulario.append('documento', this.archivoSeleccionado);
      
      try {
        // Enviar a tu servidor PHP
        const respuesta = await fetch('../wecIA2/chats/chats.app', {
          method: 'POST',
          body: datosFormulario
        });
        
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const data = await respuesta.json();
        
        // Limpiar el HTML de la respuesta
        let htmlLimpio = data.mensaje;
        htmlLimpio = htmlLimpio.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        
        this.resultado = htmlLimpio;
        
      } catch (error) {
        console.error('Error:', error);
        this.resultado = `Error: No se pudo procesar la consulta. (${error.message})`;
      } finally {
        this.cargando = false;
      }
    }
  },
  
  created() {},
  mounted() {}
});

// Componente de Configuración
app.component("web-configuracion", {
  template: /*html*/ `
  <base-layout>
  </base-layout>
  `,
  data() {
    return {
      datos: "",

    };
  },
  computed: {},
  methods: {},
  created() { },
  mounted() { },
});