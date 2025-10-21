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
        <div class="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
          <div class="d-flex align-items-center">
            <div class="avatar-lg me-4">
              <img src="assets/img/team/teamCorsec.jpg" class="card-img-top rounded-circle border-white" alt="Admin">
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
          <li v-for="item in menuItems" :key="item.name" 
              class="nav-item" 
              :class="{ active: isActiveRoute(item.name) }">
            <router-link :to="item.path" class="nav-link" @click="closeMobileMenu">
              <span class="sidebar-icon">
                <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" v-html="item.icon"></svg>
              </span>
              <span class="sidebar-text">{{ item.label }}</span>
            </router-link>
          </li>

          <li role="separator" class="dropdown-divider mt-4 mb-3 border-gray-700"></li>

          <!-- Logout -->
          <li class="nav-item">
            <router-link to="/" @click="logoutAndClose"
              class="btn btn-secondary d-flex align-items-center justify-content-center btn-upgrade-pro">
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
                    <img class="avatar rounded-circle" src="assets/img/team/teamCorsec.jpg" alt="User">
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
      rolUsuario: 'Usuario'
    };
  },
  computed: {
    currentPageTitle() {
      const titles = {
        'dashboard': 'Tablero Principal',
        'usuarios': 'Gestión de Usuarios',
        'chats': 'Chats',
        'reportes': 'Reportes',
        'conclusion': 'Conclusión',
        'configuracion': 'Configuración',
        'auditoria': 'Auditoría'
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
                            new bootstrap.Collapse(sidebarMenu, {toggle: false});
          bsCollapse.hide();
        }
      }
    },
    loadUserInfo() {
      // Intentar cargar información del usuario desde localStorage
      const userInfo = localStorage.getItem('userInfo');
      const userData = localStorage.getItem('userData');
      
      if (userInfo) {
        try {
          const info = JSON.parse(userInfo);
          this.nombreUsuario = info.nombre || 'Usuario';
          this.empresaUsuario = info.nomEmpresa || '';
          this.correoUsuario = info.correo || '';
          this.rolUsuario = this.getRoleName(info.rol);
        } catch (e) {
          console.error('Error al cargar información del usuario:', e);
        }
      } else if (userData) {
        try {
          const data = JSON.parse(userData);
          this.nombreUsuario = data.nombre || 'Usuario';
          this.empresaUsuario = data.nomEmpresa || '';
          this.correoUsuario = data.correo || '';
          this.rolUsuario = this.getRoleName(data.rol);
        } catch (e) {
          console.error('Error al cargar datos del usuario:', e);
        }
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
          name: 'auditoria',
          path: '/auditoria',
          label: 'Auditoría',
          icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
        },
        {
          name: 'reportes',
          path: '/reportes',
          label: 'Reportes',
          icon: '<path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z" clip-rule="evenodd"></path>'
        },
        {
          name: 'conclusion',
          path: '/conclusion',
          label: 'Conclusión',
          icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
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
    }
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
  },
  watch: {
    // Observar cambios en la ruta para actualizar información si es necesario
    '$route': function() {
      this.loadUserInfo();
    }
  }
});