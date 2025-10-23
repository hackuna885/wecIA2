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
    <div class="chat-wrapper">
      
      <!-- Sidebar de historial -->
      <chat-sidebar 
        :usuario-email="usuarioEmail"
        :rol-usuario="rolUsuario"
        @nueva-conversacion="iniciarNuevaConversacion"
        @seleccionar-conversacion="cargarConversacion"
        @conversacion-eliminada="limpiarChat"
        ref="sidebar">
      </chat-sidebar>

      <!-- Contenedor principal con drag & drop -->
      <div class="chat-container" 
           :class="{ 'drag-over': isDragOver && archivosSeleccionados.length < 5 }"
           @dragenter.prevent="handleDragEnter"
           @dragover.prevent="handleDragOver"
           @dragleave.prevent="handleDragLeave"
           @drop.prevent="handleDrop">
        
        <!-- Área de contenido central -->
        <div class="chat-content">
          
          <!-- Mensaje de bienvenida -->
          <div class="welcome-section" v-if="archivosSeleccionados.length === 0 && !mostrarResultado">
            <h1 class="welcome-title">Haz tu consulta</h1>
            <p class="welcome-subtitle">Escribe tu pregunta o adjunta documentos para análisis</p>
            
            <div class="upload-hint">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                </path>
              </svg>
              <p>Opcionalmente, arrastra hasta 5 archivos aquí</p>
              <small>Formatos: JPG, JPEG, PNG, PDF, DOCX, DOC, TXT, XLSX, XLS, CSV, PPTX, PPT</small>
            </div>
          </div>

          <!-- Vista previa de documentos subidos -->
          <div class="documents-preview" v-if="archivosSeleccionados.length > 0">
            <h3 class="preview-title">Archivos seleccionados ({{ archivosSeleccionados.length }}/5)</h3>
            
            <div class="files-grid">
              <div v-for="(archivo, index) in archivosSeleccionados" 
                   :key="index" 
                   class="file-card">
                
                <div v-if="archivo.esImagen" class="file-thumbnail">
                  <img :src="archivo.vistaPreviaUrl" :alt="archivo.nombre" class="thumbnail-image">
                </div>
                
                <div v-else class="file-thumbnail file-icon-container">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                    </path>
                  </svg>
                  <span class="file-extension">{{ obtenerExtension(archivo.nombre) }}</span>
                </div>
                
                <div class="file-info">
                  <p class="file-name" :title="archivo.nombre">{{ archivo.nombre }}</p>
                  <p class="file-size">{{ formatearTamano(archivo.tamano) }}</p>
                </div>
                
                <button class="btn-remove-card" @click="eliminarArchivo(index)" type="button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Área de resultados -->
          <div class="results-section" v-if="mostrarResultado">
            <div class="message-container">
              <div v-for="(mensaje, index) in mensajesConversacion" :key="index">
                <!-- Mensaje del usuario -->
                <div v-if="mensaje.rol === 'user'" class="message user-message">
                  <div class="message-content">
                    <div class="message-header">
                      <strong>Tu consulta:</strong>
                    </div>
                    <p>{{ mensaje.contenido }}</p>
                    <div class="message-files" v-if="mensaje.archivos && mensaje.archivos.length > 0">
                      <div v-for="archivo in mensaje.archivos" :key="archivo.id" class="message-file-item">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                          </path>
                        </svg>
                        <span>{{ archivo.nombre_original }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Respuesta del asistente -->
                <div v-else class="message assistant-message">
                  <div class="message-content">
                    <div class="message-header">
                      <strong>Respuesta:</strong>
                    </div>
                    <div v-html="mensaje.contenido" class="response-text"></div>
                  </div>
                </div>
              </div>

              <!-- Indicador de carga -->
              <div v-if="cargando" class="message assistant-message">
                <div class="message-content">
                  <div class="loading-indicator">
                    <span class="spinner"></span>
                    <span>Procesando tu consulta...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Input fijo en la parte inferior -->
        <div class="chat-input-wrapper">
          <div class="chat-input-container">
            <form @submit.prevent="enviarConsulta" class="input-form">
              
              <button type="button" 
                      class="btn-attach" 
                      @click="abrirSelectorArchivos"
                      :disabled="cargando || archivosSeleccionados.length >= 5"
                      :title="archivosSeleccionados.length >= 5 ? 'Máximo 5 archivos' : 'Adjuntar archivo'">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                  </path>
                </svg>
              </button>

              <textarea v-model="consulta"
                        ref="textareaInput"
                        class="text-input"
                        placeholder="Escribe tu consulta..."
                        rows="1"
                        @input="ajustarAlturaTextarea"
                        @keydown.enter.exact.prevent="enviarConsulta"
                        :disabled="cargando">
              </textarea>

              <button type="submit" 
                      class="btn-send" 
                      :disabled="!puedeEnviar || cargando"
                      title="Enviar consulta">
                <svg v-if="!cargando" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8">
                  </path>
                </svg>
                <span v-else class="spinner-small"></span>
              </button>

              <input type="file" 
                     ref="archivoInput"
                     class="file-input-hidden"
                     @change="manejarSeleccionArchivo"
                     accept=".jpg,.jpeg,.png,.pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.pptx,.ppt"
                     multiple>
            </form>

            <div class="file-indicator" v-if="archivosSeleccionados.length > 0 && !mostrarResultado">
              <span class="file-count-badge">
                📎 {{ archivosSeleccionados.length }} archivo{{ archivosSeleccionados.length > 1 ? 's' : '' }} adjunto{{ archivosSeleccionados.length > 1 ? 's' : '' }}
              </span>
              <button @click="limpiarArchivos" type="button" class="btn-clear-all">
                Limpiar todos
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <style>
      .chat-wrapper {
        display: flex;
        height: calc(100vh - 200px);
        gap: 0;
      }

      /* Importar estilos del chat original */
      /* ... (copiar todos los estilos del inicio-multiarchivo.js) ... */
    </style>
  </base-layout>
  `,

  data() {
    return {
      // Datos del usuario
      usuarioEmail: '',
      rolUsuario: 'Usuario',

      // Conversación actual
      conversacionId: null,
      mensajesConversacion: [],

      // Archivos
      archivosSeleccionados: [],

      // UI
      consulta: '',
      resultado: '',
      mostrarResultado: false,
      cargando: false,
      isDragOver: false
    };
  },

  computed: {
    puedeEnviar() {
      return this.consulta.trim().length >= 1 && !this.cargando;
    }
  },

  methods: {
    // ========== Inicialización ==========

    cargarDatosUsuario() {

      // Tu sistema usa 'userData' en lugar de 'userInfo'
      const userData = localStorage.getItem('userData');
      const userEmail = localStorage.getItem('userEmail');

      if (userData) {
        try {
          const info = JSON.parse(userData);
          console.log('📋 Datos del usuario:', info);

          // Extraer datos
          this.usuarioEmail = info.correo || userEmail || '';
          this.rolUsuario = this.getRoleName(info.rol);


        } catch (e) {
        }
      } else if (userEmail) {
        // Fallback: usar solo userEmail
        this.usuarioEmail = userEmail;
        this.rolUsuario = 'Usuario';
      }
    },

    getRoleName(rol) {
      const roles = {
        1: 'Administrador',
        2: 'Supervisor',
        3: 'Usuario',
        4: 'Auditor'
      };
      return roles[rol] || 'Usuario';
    },

    // ========== Gestión de conversaciones ==========

    iniciarNuevaConversacion() {
      this.conversacionId = null;
      this.mensajesConversacion = [];
      this.limpiarChat();
    },

    async cargarConversacion(id) {
      this.conversacionId = id;
      this.cargando = true;

      try {
        const respuesta = await fetch(
          `../wecIA2/conversaciones/conversaciones.app?action=mensajes&conversacion_id=${id}`
        );

        if (!respuesta.ok) {
          throw new Error('Error al cargar mensajes');
        }

        const data = await respuesta.json();
        this.mensajesConversacion = data.mensajes || [];
        this.mostrarResultado = this.mensajesConversacion.length > 0;

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los mensajes',
          confirmButtonColor: '#10a37f'
        });
      } finally {
        this.cargando = false;
      }
    },

    limpiarChat() {
      this.consulta = '';
      this.resultado = '';
      this.mostrarResultado = false;
      this.mensajesConversacion = [];
      this.limpiarArchivos();
    },

    // ========== Drag & Drop (igual que antes) ==========

    handleDragEnter(evento) {
      if (this.cargando || this.archivosSeleccionados.length >= 5) return;
      this.isDragOver = true;
    },

    handleDragOver(evento) {
      if (this.cargando || this.archivosSeleccionados.length >= 5) return;
      this.isDragOver = true;
    },

    handleDragLeave(evento) {
      if (evento.target === evento.currentTarget) {
        this.isDragOver = false;
      }
    },

    handleDrop(evento) {
      this.isDragOver = false;
      if (this.cargando) return;
      const archivos = Array.from(evento.dataTransfer.files);
      this.procesarArchivos(archivos);
    },

    // ========== Gestión de archivos (igual que antes) ==========

    abrirSelectorArchivos() {
      if (this.archivosSeleccionados.length >= 5) {
        Swal.fire({
          icon: 'warning',
          title: 'Límite de archivos',
          text: 'Solo puedes subir un máximo de 5 archivos.',
          confirmButtonColor: '#10a37f'
        });
        return;
      }
      this.$refs.archivoInput.click();
    },

    manejarSeleccionArchivo(evento) {
      const archivos = Array.from(evento.target.files);
  
      if (archivos.length === 0) {
        return;
      }

      this.procesarArchivos(archivos);
      evento.target.value = '';
  
    },

    procesarArchivos(archivos) {
        
      const tiposPermitidos = [
        'image/jpeg', 'image/png', 'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword', 'text/plain',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel', 'text/csv',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint'
      ];

      const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.csv', '.pptx', '.ppt'];
      const tamañoMaximo = 10 * 1024 * 1024;
      const espacioDisponible = 5 - this.archivosSeleccionados.length;


      if (espacioDisponible === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Límite alcanzado',
          text: 'Ya has alcanzado el límite de 5 archivos.',
          confirmButtonColor: '#10a37f'
        });
        return;
      }

      const archivosAProcesar = archivos.slice(0, espacioDisponible);

      if (archivos.length > espacioDisponible) {
        Swal.fire({
          icon: 'info',
          title: 'Archivos limitados',
          text: `Solo se pueden agregar ${espacioDisponible} archivo(s) más.`,
          confirmButtonColor: '#10a37f'
        });
      }

      archivosAProcesar.forEach((archivo, index) => {

        const extension = '.' + archivo.name.split('.').pop().toLowerCase();

        // ===== NUEVO: Verificar si ya existe =====
        const yaExiste = this.archivosSeleccionados.some(a => 
          a.nombre === archivo.name && a.tamano === archivo.size
        );
        
        if (yaExiste) {
          return;
        }

        if (!tiposPermitidos.includes(archivo.type) && !extensionesPermitidas.includes(extension)) {
          Swal.fire({
            icon: 'error',
            title: 'Archivo no permitido',
            text: `El archivo "${archivo.name}" no es válido.`,
            confirmButtonColor: '#10a37f'
          });
          return;
        }

        if (archivo.size > tamañoMaximo) {
          Swal.fire({
            icon: 'warning',
            title: 'Archivo demasiado grande',
            text: `El archivo "${archivo.name}" excede el tamaño máximo de 10MB.`,
            confirmButtonColor: '#10a37f'
          });
          return;
        }

        const archivoData = {
          archivo: archivo,
          nombre: archivo.name,
          tamano: archivo.size,
          esImagen: archivo.type.startsWith('image/'),
          vistaPreviaUrl: ''
        };

        if (archivoData.esImagen) {
          const lector = new FileReader();
          lector.onload = (e) => {
            archivoData.vistaPreviaUrl = e.target.result;
          };
          lector.readAsDataURL(archivo);
        }

        this.archivosSeleccionados.push(archivoData);
      });

      // this.$forceUpdate();


      // Forzar actualización
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    eliminarArchivo(index) {
      this.archivosSeleccionados.splice(index, 1);
    },

    limpiarArchivos() {
      // Limpiar array de archivos
      this.archivosSeleccionados = [];

      // Limpiar input de archivo de forma más robusta
      this.$nextTick(() => {
        if (this.$refs.archivoInput) {
          this.$refs.archivoInput.value = '';  // SOLO ESTO
        }
      });
    },

    // ========== Utilidades ==========

    obtenerExtension(nombreArchivo) {
      return nombreArchivo.split('.').pop().toUpperCase();
    },

    formatearTamano(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    ajustarAlturaTextarea(evento) {
      const textarea = evento.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    },

    // NUEVO - Iniciar nueva conversación
    iniciarNuevaConversacion() {
      this.conversacionId = null;
      this.mensajesConversacion = [];
      this.limpiarChat();
    },

    // NUEVO - Cargar conversación existente
    async cargarConversacion(id) {
      this.conversacionId = id;
      this.cargando = true;

      try {
        const respuesta = await fetch(
          `../wecIA2/conversaciones/conversaciones.app?action=mensajes&conversacion_id=${id}`
        );

        if (!respuesta.ok) {
          throw new Error('Error al cargar mensajes');
        }

        const data = await respuesta.json();
        this.mensajesConversacion = data.mensajes || [];
        this.mostrarResultado = this.mensajesConversacion.length > 0;

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los mensajes',
          confirmButtonColor: '#10a37f'
        });
      } finally {
        this.cargando = false;
      }
    },

    // NUEVO - Limpiar chat
    limpiarChat() {
      this.consulta = '';
      this.resultado = '';
      this.mostrarResultado = false;
      this.mensajesConversacion = [];
      this.limpiarArchivos();
    },

    // MODIFICAR - enviarConsulta para integrar con BD
    async enviarConsulta() {
      if (!this.puedeEnviar) return;

      if (!this.consulta.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Consulta vacía',
          text: 'Por favor, escribe tu consulta.',
          confirmButtonColor: '#10a37f'
        });
        return;
      }

      this.cargando = true;
      this.mostrarResultado = true;

      // Agregar mensaje del usuario a la vista inmediatamente
      const mensajeUsuario = {
        rol: 'user',
        contenido: this.consulta,
        archivos: this.archivosSeleccionados.map(a => ({ nombre_original: a.nombre }))
      };
      this.mensajesConversacion.push(mensajeUsuario);

      const datosFormulario = new FormData();
      datosFormulario.append('consulta', this.consulta.trim());
      datosFormulario.append('usuario_email', this.usuarioEmail);

      // ===== IMPORTANTE: Enviar conversacion_id si existe =====
      if (this.conversacionId) {
        datosFormulario.append('conversacion_id', this.conversacionId);
      }

      this.archivosSeleccionados.forEach((archivoData) => {
        datosFormulario.append('documentos[]', archivoData.archivo);
      });

      try {
        const respuesta = await fetch('../wecIA2/chats/chats.app', {
          method: 'POST',
          body: datosFormulario
        });

        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const data = await respuesta.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // ===== IMPORTANTE: Actualizar ID de conversación si es nuevo =====
        if (data.conversacion_id && !this.conversacionId) {
          this.conversacionId = data.conversacion_id;
        }

        let htmlLimpio = data.mensaje || 'No se recibió respuesta del servidor.';
        htmlLimpio = htmlLimpio.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

        // Agregar respuesta del asistente
        this.mensajesConversacion.push({
          rol: 'assistant',
          contenido: htmlLimpio
        });

        // ===== NUEVO: Actualizar sidebar del baseLayout =====
        // Buscar el componente baseLayout en el árbol de componentes
        // ===== ACTUALIZAR SIDEBAR =====
        // if (this.$refs.sidebar) {
        //   // Verificar qué método tiene el sidebar para recargar
        //   if (typeof this.$refs.sidebar.cargarConversaciones === 'function') {
        //     this.$refs.sidebar.cargarConversaciones();
        //   } else if (typeof this.$refs.sidebar.actualizarHistorial === 'function') {
        //     this.$refs.sidebar.actualizarHistorial();
        //   } else {
        //   }
          
        //   // Establecer conversación activa
        //   if (this.$refs.sidebar.conversacionActiva !== undefined) {
        //     this.$refs.sidebar.conversacionActiva = this.conversacionId;
        //   }
          
        // }

        // ===== LIMPIEZA MEJORADA CON LOGS =====
        
        // Limpiar texto y archivos
        this.consulta = '';
        this.archivosSeleccionados = [];
        

        this.$nextTick(() => {
          // Limpiar input de archivos
          if (this.$refs.archivoInput) {
            this.$refs.archivoInput.value = '';
          }

          // Ajustar textarea
          if (this.$refs.textareaInput) {
            this.$refs.textareaInput.style.height = 'auto';
            this.$refs.textareaInput.focus();
          }

          // Verificación final
          
          if (this.archivosSeleccionados.length === 0) {
          } else {
          }
        });

      } catch (error) {

        // Quitar el mensaje del usuario de la vista
        this.mensajesConversacion.pop();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#10a37f'
        });
      } finally {
        this.cargando = false;
        // DEBUG: Verificar que realmente se puso en false

        // Forzar actualización de Vue
        this.$forceUpdate();
      }
    }

  },

  mounted() {

    this.cargarDatosUsuario();

    // ===== NUEVO - Escuchar eventos del baseLayout =====
    window.addEventListener('nueva-conversacion-chat', this.iniciarNuevaConversacion);

    window.addEventListener('seleccionar-conversacion-chat', (e) => {
      this.cargarConversacion(e.detail.id);
    });

    window.addEventListener('conversacion-eliminada-chat', this.limpiarChat);

    this.$nextTick(() => {
      if (this.$refs.textareaInput) {
        this.$refs.textareaInput.focus();
      }
    });

    this.$nextTick(() => {
      if (this.$refs.textareaInput) {
        this.$refs.textareaInput.focus();
      }
    });

    window.addEventListener('seleccionar-conversacion-chat', (e) => {
      this.cargarConversacion(e.detail.id);
    });
  },
  beforeUnmount() {
    // Limpiar listeners de eventos
    window.removeEventListener('nueva-conversacion-chat', this.iniciarNuevaConversacion);
    window.removeEventListener('seleccionar-conversacion-chat', this.cargarConversacion);
    window.removeEventListener('conversacion-eliminada-chat', this.limpiarChat);
  },
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