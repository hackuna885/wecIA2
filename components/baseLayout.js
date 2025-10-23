// Componente Layout Base - Archivo: BaseLayout.js
app.component("base-layout", {
  template: /*html*/ `
<div class="dashboard-container d-flex flex-column min-vh-100">
  <!-- Mobile navbar -->
  <nav class="navbar navbar-dark navbar-theme-primary px-4 col-12 d-lg-none">
    <div class="navbar-brand me-lg-5">
      <img class="navbar-brand-dark" src="assets/img/logo.svg" alt="Volt logo" />
    </div>
    <div class="d-flex align-items-center">
      <button class="navbar-toggler d-lg-none collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>

  <div class="d-flex flex-grow-1">
    <!-- Sidebar -->
    <nav id="sidebarMenu" class="sidebar d-lg-block bg-gray-800 text-white collapse" data-simplebar>
      <div class="sidebar-inner px-4 pt-3">

        <!-- Botón de cierre para móvil -->
        <div class="d-flex d-lg-none justify-content-end mb-3">
          <button type="button" class="btn-close btn-close-white" aria-label="Close" data-bs-toggle="collapse"
            data-bs-target="#sidebarMenu" style="filter: brightness(0) invert(1);">
          </button>
        </div>

        <!-- User card for mobile -->
        <div
          class="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
          <div class="d-flex align-items-center">
            <div class="avatar-lg me-4">
              <img src="assets/img/team/team.jpg" class="card-img-top rounded-circle border-white" alt="Admin">
            </div>
            <div class="d-block">
              <h2 class="h5 mb-3">Hola, {{ nombreUsuario }}!</h2>
              <p class="small text-gray-400">{{ rolUsuario }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu dinámico -->
        <ul class="nav flex-column pt-3 pt-md-0">
          <li class="nav-item">
            <div class="nav-link d-flex align-items-center">
              <span class="sidebar-icon">
                <img src="assets/img/logo.svg" height="60" width="60" alt="Logo">
              </span>
              <span class="mt-1 ms-1 sidebar-text display-1">{{ empresaUsuario || 'IA' }}</span>
            </div>
          </li>

          <!-- Menú dinámico basado en permisos -->
          <li v-for="item in menuItems" :key="item.name" class="nav-item" :class="{ active: isActiveRoute(item.name) }">
            <router-link :to="item.path" class="nav-link" @click="closeMobileMenu">
              <span class="sidebar-icon">
                <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" v-html="item.icon"></svg>
              </span>
              <span class="sidebar-text">{{ item.label }}</span>
            </router-link>
          </li>

          <!-- SECCIÓN DE HISTORIAL DE CHATS (solo visible en ruta de chats) -->
          <template v-if="isActiveRoute('chats')">
            <li role="separator" class="dropdown-divider mt-4 mb-3 border-gray-700"></li>

            <!-- Header de historial -->
            <li class="nav-item">
              <div class="d-flex align-items-center justify-content-between px-3 mb-2">
                <span class="sidebar-text small text-gray-400">HISTORIAL</span>
                <button @click="nuevaConversacionChat" class="btn btn-sm btn-success"
                  style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Nueva conversación">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </li>

            <!-- Loading del historial -->
            <li v-if="cargandoHistorial" class="nav-item">
              <div class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-success" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="small text-gray-400 mt-2">Cargando historial...</p>
              </div>
            </li>

            <!-- Sin conversaciones -->
            <li v-else-if="conversaciones.length === 0" class="nav-item">
              <div class="text-center py-3">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-gray-600">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                  </path>
                </svg>
                <p class="small text-gray-400 mt-2 mb-0">No hay conversaciones</p>
              </div>
            </li>

            <!-- Lista de conversaciones -->
            <template v-else>
              <li v-for="conv in conversaciones" :key="conv.id" class="nav-item conversacion-item-sidebar"
                :class="{ 'conversacion-activa': conv.id === conversacionActivaId }">

                <div class="nav-link conversacion-link" @click="seleccionarConversacionChat(conv.id)"
                  style="cursor: pointer; padding: 0.5rem 0.75rem;">

                  <div class="d-flex flex-column">
                    <span class="sidebar-text text-truncate" style="font-size: 0.85rem;">
                      {{ conv.titulo }}
                    </span>
                    <small class="text-gray-500" style="font-size: 0.7rem;">
                      {{ formatearFechaChat(conv.fecha_actualizacion) }} · {{ conv.total_mensajes }} msg
                    </small>
                  </div>

                  <!-- Botones de acción -->
                  <div class="conversacion-acciones-sidebar">
                    <!-- Renombrar (solo Admin) -->
                    <button v-if="esAdministrador" @click.stop="editarTituloChat(conv)" class="btn btn-sm btn-link text-gray-400 p-0 me-1"
                      title="Renombrar">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path>
                      </svg>
                    </button>
                  
                    <!-- Exportar (solo Admin) -->
                    <button v-if="esAdministrador" @click.stop="mostrarMenuExportarChat(conv.id)"
                      class="btn btn-sm btn-link text-gray-400 p-0 me-1" title="Exportar">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4">
                        </path>
                      </svg>
                    </button>
                  
                    <!-- Eliminar (PARA TODOS) -->
                    <button @click.stop="eliminarConversacionChat(conv.id)" class="btn btn-sm btn-link text-danger p-0" title="Eliminar">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                      </svg>
                    </button>
                  </div>

                </div>
              </li>
            </template>
          </template>

          <li role="separator" class="dropdown-divider mt-4 mb-3 border-gray-700"></li>



          <!-- Logout -->
          <li class="nav-item">
            <router-link to="/" @click="logoutAndClose"
              class="btn btn-success d-flex align-items-center justify-content-center btn-upgrade-pro">
              <span class="sidebar-icon d-inline-flex align-items-center justify-content-center">
                <svg class="icon icon-xxs me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                  </path>
                </svg>
              </span>
              Cerrar sesión
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="content d-flex flex-column flex-grow-1">
      <!-- Top Navigation -->
      <nav class="navbar navbar-top navbar-expand navbar-dashboard navbar-dark ps-0 pe-2 pb-0">
        <div class="container-fluid px-0">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex align-items-center">
              <h4 class="mb-0">{{ currentPageTitle }}</h4>
            </div>

            <!-- User menu and notifications -->
            <ul class="navbar-nav align-items-center">
              <!-- Notifications -->
              <li class="nav-item dropdown">
                <div class="nav-link text-dark notification-bell unread dropdown-toggle" role="button"
                  data-bs-toggle="dropdown">
                  <svg class="icon icon-sm text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z">
                    </path>
                  </svg>
                </div>
                <!-- Notification dropdown content -->
                <div class="dropdown-menu dropdown-menu-lg dropdown-menu-center mt-2 py-0">
                  <div class="list-group list-group-flush">
                    <div class="text-center text-primary fw-bold border-bottom border-light py-3">Notificaciones</div>
                    <!-- Notification items here -->
                  </div>
                </div>
              </li>

              <!-- User dropdown -->
              <li class="nav-item dropdown ms-lg-3">
                <div class="nav-link dropdown-toggle pt-1 px-0" role="button" data-bs-toggle="dropdown">
                  <div class="media d-flex align-items-center">
                    <img class="avatar rounded-circle" src="assets/img/team/team.jpg" alt="User">
                    <div class="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                      <span class="mb-0 font-small fw-bold text-gray-900">{{ nombreUsuario }}</span>
                    </div>
                  </div>
                </div>
                <div class="dropdown-menu dropdown-menu-end mt-2 py-1">
                  <div class="dropdown-header">
                    <h6 class="text-overflow m-0">{{ nombreUsuario }}</h6>
                    <p class="text-gray-400 mb-0 small">{{ correoUsuario }}</p>
                    <p class="text-gray-400 mb-0 small">{{ rolUsuario }}</p>
                  </div>
                  <div role="separator" class="dropdown-divider my-1"></div>
                  <div class="dropdown-item d-flex align-items-center">
                    <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clip-rule="evenodd"></path>
                    </svg>
                    Mi perfil
                  </div>
                  <div role="separator" class="dropdown-divider my-1"></div>
                  <router-link to="/" @click="logout" class="dropdown-item d-flex align-items-center">
                    <svg class="dropdown-icon text-danger me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                      </path>
                    </svg>
                    Cerrar sesión
                  </router-link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Área de contenido dinámico -->
      <div class="py-4 flex-grow-1">
        <!-- Aquí se renderiza el contenido específico de cada página -->
        <slot></slot>
      </div>

      <!-- Footer -->
      <footer class="bg-white rounded shadow p-5 mt-auto mb-3">
        <div class="row">
          <div class="col-12 col-md-4 col-xl-6 mb-0">
            <p class="mb-0 text-center text-lg-start">© <span class="current-year"></span> Creado por WEC</p>
          </div>
        </div>
      </footer>
    </main>
    <!-- Modal de exportación -->
    <div v-if="menuExportarVisible" class="modal fade show d-block" tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);" @click="cerrarMenuExportarChat">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Exportar conversación</h5>
            <button type="button" class="btn-close" @click="cerrarMenuExportarChat"></button>
          </div>
          <div class="modal-body">
            <p>Selecciona el formato de exportación:</p>
            <div class="d-grid gap-2">
              <button @click="exportarChat('json')" class="btn btn-outline-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="me-2">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                JSON
              </button>
              <button @click="exportarChat('txt')" class="btn btn-outline-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="me-2">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                TXT
              </button>
              <button @click="exportarChat('pdf')" class="btn btn-outline-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="me-2">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                  </path>
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  data() {
    return {
      menuItems: [],
      userData: null,
      nombreUsuario: 'Usuario',
      empresaUsuario: '',
      correoUsuario: '',
      rolUsuario: 'Usuario',
      conversaciones: [],
      conversacionActivaId: null,
      cargandoHistorial: false,
      menuExportarVisible: false,
      conversacionParaExportar: null,
      intervalHistorial: null
    };
  },
  computed: {
    esAdministrador() {
      return this.rolUsuario === 'Administrador';
    },
    currentPageTitle() {
      const titles = {
        'dashboard': 'Tablero Principal',
        'usuarios': 'Gestión de Usuarios',
        'chats': 'Chats',
        'configuracion': 'Configuración'
      };
      return titles[this.$route.name] || 'Dashboard';
    }
  },
  methods: {
    logout() {
      axios.post('../proCorsec/logout/logout.app', {})
      // Limpiar todos los datos del usuario
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');

      // Si existe userPermissions, usarlo
      if (typeof userPermissions !== 'undefined') {
        userPermissions.clearUserData();
      }

      this.$router.push('/');
    },
    logoutAndClose() {
      axios.post('../proCorsec/logout/logout.app', {})
      this.closeMobileMenu();
      this.logout();
    },
    isActiveRoute(routeName) {
      return this.$route.name === routeName;
    },
    closeMobileMenu() {
      if (window.innerWidth < 992) {
        const sidebarMenu = document.getElementById('sidebarMenu');
        if (sidebarMenu && sidebarMenu.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(sidebarMenu) ||
            new bootstrap.Collapse(sidebarMenu, { toggle: false });
          bsCollapse.hide();
        }
      }
    },
    loadUserInfo() {
      const userData = localStorage.getItem('userData');
      const userEmail = localStorage.getItem('userEmail');

      if (userData) {
        try {
          const info = JSON.parse(userData);
          this.nombreUsuario = info.nombre || 'Usuario';
          this.empresaUsuario = info.nomEmpresa || '';
          this.correoUsuario = info.correo || userEmail || '';
          this.rolUsuario = this.getRoleName(info.rol);
        } catch (e) {
          console.error('Error al cargar información del usuario:', e);
        }
      } else if (userEmail) {
        this.correoUsuario = userEmail;
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
    generateMenu() {
      // Menú completo disponible
      const fullMenu = [
        {
          name: 'dashboard',
          path: '/dashboard',
          label: 'Tablero',
          icon: '<path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>'
        },
        {
          name: 'usuarios',
          path: '/usuarios',
          label: 'Usuarios',
          icon: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        },
        {
          name: 'chats',
          path: '/chats',
          label: 'Chats',
          icon: '<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" clip-rule="evenodd"></path>'
        },
        {
          name: 'configuracion',
          path: '/configuracion',
          label: 'Configuración',
          icon: '<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>'
        }
      ];

      // Si existe sistema de permisos, filtrar según permisos
      if (typeof userPermissions !== 'undefined' && userPermissions.user) {
        const allowedRoutes = userPermissions.getAllowedRoutes();
        this.menuItems = fullMenu.filter(item => allowedRoutes.includes(item.name));
      } else {
        // Sin sistema de permisos, mostrar todo el menú
        this.menuItems = fullMenu;
      }
    },
    /**
   * Cargar conversaciones del usuario desde la API
   */
    async cargarConversacionesChat() {
      if (!this.correoUsuario || !this.isActiveRoute('chats')) return;

      this.cargandoHistorial = true;

      try {
        const respuesta = await fetch(
          `../wecIA2/conversaciones/conversaciones.app?action=listar&usuario_email=${encodeURIComponent(this.correoUsuario)}`
        );

        if (!respuesta.ok) {
          throw new Error('Error al cargar conversaciones');
        }

        const data = await respuesta.json();
        this.conversaciones = data.conversaciones || [];

      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      } finally {
        this.cargandoHistorial = false;
      }
    },

    /**
     * Iniciar nueva conversación
     */
    nuevaConversacionChat() {
      this.conversacionActivaId = null;
      // Emitir evento para que el componente de chat lo capture
      window.dispatchEvent(new CustomEvent('nueva-conversacion-chat'));
    },

    /**
     * Seleccionar una conversación existente
     */
    seleccionarConversacionChat(id) {
      this.conversacionActivaId = id;
      // Emitir evento para que el componente de chat lo capture
      window.dispatchEvent(new CustomEvent('seleccionar-conversacion-chat', { detail: { id } }));
    },

    /**
     * Editar título de conversación (solo Admin)
     */
    async editarTituloChat(conversacion) {
      const { value: nuevoTitulo } = await Swal.fire({
        title: 'Renombrar conversación',
        input: 'text',
        inputValue: conversacion.titulo,
        inputPlaceholder: 'Escribe el nuevo título',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10a37f',
        inputValidator: (value) => {
          if (!value) {
            return 'El título no puede estar vacío';
          }
        }
      });

      if (nuevoTitulo) {
        try {
          const respuesta = await fetch('../wecIA2/conversaciones/conversaciones.app?action=actualizar', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: conversacion.id,
              titulo: nuevoTitulo
            })
          });

          if (!respuesta.ok) {
            throw new Error('Error al actualizar');
          }

          await this.cargarConversacionesChat();

          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Título actualizado correctamente',
            timer: 2000,
            showConfirmButton: false
          });

        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el título',
            confirmButtonColor: '#10a37f'
          });
        }
      }
    },

    /**
     * Eliminar conversación
     */
    async eliminarConversacionChat(id) {
      const resultado = await Swal.fire({
        title: '¿Eliminar conversación?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6e6e80'
      });

      if (resultado.isConfirmed) {
        try {
          const respuesta = await fetch(
            `../wecIA2/conversaciones/conversaciones.app?action=eliminar&id=${id}`,
            { method: 'DELETE' }
          );

          if (!respuesta.ok) {
            throw new Error('Error al eliminar');
          }

          if (this.conversacionActivaId === id) {
            this.conversacionActivaId = null;
            window.dispatchEvent(new CustomEvent('conversacion-eliminada-chat'));
          }

          await this.cargarConversacionesChat();

          Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'Conversación eliminada correctamente',
            timer: 2000,
            showConfirmButton: false
          });

        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la conversación',
            confirmButtonColor: '#10a37f'
          });
        }
      }
    },

    /**
     * Mostrar modal de exportación
     */
    mostrarMenuExportarChat(id) {
      this.conversacionParaExportar = id;
      this.menuExportarVisible = true;
    },

    /**
     * Cerrar modal de exportación
     */
    cerrarMenuExportarChat() {
      this.menuExportarVisible = false;
      this.conversacionParaExportar = null;
    },

    /**
     * Exportar conversación en formato seleccionado
     */
    async exportarChat(formato) {
      const url = `../wecIA2/exportar/exportar.app?formato=${formato}&conversacion_id=${this.conversacionParaExportar}&rol_usuario=${encodeURIComponent(this.rolUsuario)}`;

      window.open(url, '_blank');

      this.cerrarMenuExportarChat();

      Swal.fire({
        icon: 'success',
        title: 'Exportando',
        text: 'La descarga comenzará en breve',
        timer: 2000,
        showConfirmButton: false
      });
    },

    /**
     * Formatear fecha para mostrar en el historial
     */
    formatearFechaChat(fecha) {
      const date = new Date(fecha);
      const ahora = new Date();
      const diff = ahora - date;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Ayer';
      if (dias < 7) return `Hace ${dias} días`;

      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
      });
    },

    /**
     * Método público para actualizar historial desde componente de chat
     */
    actualizarHistorial() {
      this.cargarConversacionesChat();
    },

    /**
     * Método público para establecer conversación activa
     */
    setConversacionActiva(id) {
      this.conversacionActivaId = id;
    },
  },
  created() {
    // Cargar información del usuario
    this.loadUserInfo();

    // Generar menú según permisos
    this.generateMenu();
  },
  mounted() {
    // Inicializar dropdowns de Bootstrap
    const dropdowns = this.$el.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdowns.forEach(dropdownEl => {
      new bootstrap.Dropdown(dropdownEl);
    });

    // Añadir el año actual al footer
    const currentYearElements = this.$el.querySelectorAll('.current-year');
    currentYearElements.forEach(element => {
      element.textContent = new Date().getFullYear();
    });

    // ===== CÓDIGO NUEVO para historial de chats =====
    // Cargar historial de chats si estamos en la ruta de chats
    if (this.isActiveRoute('chats')) {
      this.cargarConversacionesChat();

      // Actualizar cada 30 segundos
      this.intervalHistorial = setInterval(() => {
        if (this.isActiveRoute('chats')) {
          this.cargarConversacionesChat();
        }
      }, 30000);
    }
  },

  beforeUnmount() {
    // Limpiar interval cuando se destruye el componente
    if (this.intervalHistorial) {
      clearInterval(this.intervalHistorial);
    }
  },

  watch: {
    '$route': function (to, from) {
      // ===== Código ORIGINAL (mantener) =====
      this.loadUserInfo();

      // ===== CÓDIGO NUEVO para gestionar historial =====
      // Cargar historial cuando se navega a chats
      if (to.name === 'chats') {
        this.cargarConversacionesChat();

        // Iniciar auto-refresh si no está activo
        if (!this.intervalHistorial) {
          this.intervalHistorial = setInterval(() => {
            if (this.isActiveRoute('chats')) {
              this.cargarConversacionesChat();
            }
          }, 30000);
        }
      } else {
        // Limpiar interval cuando se sale de chats
        if (this.intervalHistorial) {
          clearInterval(this.intervalHistorial);
          this.intervalHistorial = null;
        }
      }
    }
  }
});