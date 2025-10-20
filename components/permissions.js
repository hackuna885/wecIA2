// Definición de permisos por rol y configuración
const PERMISSIONS = {
  // Definición de roles (per1)
  ROLES: {
    ADMIN: 1,
    SUPERVISOR: 2,
    USUARIO: 3,
    AUDITOR: 4
  },
  
  // Definición de estados (per2)
  ESTADOS: {
    INACTIVO: 0,
    ACTIVO: 1,
    BLOQUEADO: 2
  },
  
  // Definición de configuración de tableros (per3)
  TABLEROS: {
    TODOS: 1,              // Dashboard, Proveedores, Chats, Reportes, Configuración
    SIN_PROVEEDORES: 2,    // Dashboard, Chats, Reportes, Configuración
    LIMITADO: 3,           // Chats, Configuración
    AUDITORIA: 4           // Dashboard, Auditoría, Reportes, Configuración
  },
  
  // Matriz de permisos: qué puede ver cada combinación de rol y tablero
  RUTAS_PERMITIDAS: {
    // Admin (rol 1)
    '1_1': ['dashboard', 'proveedores', 'chats', 'auditoria', 'reportes', 'conclusion', 'configuracion'], // Admin con todos los tableros
    '1_2': ['dashboard', 'chats', 'reportes', 'configuracion'],                // Admin sin proveedores
    '1_3': ['chats', 'configuracion'],                                         // Admin limitado
    '1_4': ['dashboard', 'chats', 'auditoria', 'reportes', 'conclusion', 'configuracion'],   // Admin configuración específica
    
    // Supervisor (rol 2)
    '2_1': ['dashboard', 'chats', 'auditoria', 'reportes', 'conclusion', 'configuracion'], // Supervisor con todos
    '2_2': ['dashboard', 'chats', 'reportes'],                                 // Supervisor sin proveedores
    '2_3': ['chats'],                                                          // Supervisor limitado
    '2_4': ['dashboard', 'chats', 'reportes'],                                 // Supervisor configuración específica
    
    // Usuario (rol 3)
    '3_1': ['dashboard', 'proveedores', 'chats', 'auditoria', 'reportes', 'configuracion'], // Usuario con todos
    '3_2': ['dashboard', 'chats'],                                             // Usuario sin proveedores
    '3_3': ['chats', 'conclusion'],                                                          // Usuario limitado
    '3_4': ['chats'],                                                          // Usuario configuración específica
    
    // Auditor (rol 4)
    '4_1': ['dashboard', 'proveedores', 'chats', 'auditoria', 'reportes', 'configuracion'], // Auditor con todos los tableros
    '4_2': ['dashboard', 'auditoria', 'reportes', 'configuracion'],                 // Auditor sin proveedores (mismo acceso)
    '4_3': ['chats', 'auditoria'],                                          // Auditor limitado
    '4_4': ['auditoria']                  // Auditor configuración específica
  },
  
  // Página de inicio según configuración de tableros
  PAGINA_INICIO: {
    1: '/dashboard',    // Tableros completos
    2: '/chats',    // Sin proveedores
    3: '/chats',   // Solo chats y config
    4: '/auditoria'     // Auditoría - inicio en dashboard
  }
};

// Clase para manejar permisos de usuario
class UserPermissions {
  constructor() {
    this.loadUserData();
  }
  
  // Cargar datos del usuario desde localStorage
  loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        this.user = null;
      }
    } else {
      this.user = null;
    }
  }
  
  // Guardar datos del usuario
  saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userToken', userData.token);
    this.user = userData;
  }
  
  // Limpiar datos del usuario (logout)
  clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userToken');
    this.user = null;
  }
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return this.user !== null && localStorage.getItem('isAuthenticated') === 'true';
  }
  
  // Obtener el rol del usuario
  getUserRole() {
    return this.user ? this.user.rol : null;
  }
  
  // Obtener nombre del rol
  getRoleName() {
    const roles = {
      1: 'Administrador',
      2: 'Supervisor',
      3: 'Usuario',
      4: 'Auditor'
    };
    return this.user ? roles[this.user.rol] || 'Sin rol' : 'Sin rol';
  }
  
  // Verificar si el usuario tiene acceso a una ruta
  hasAccessToRoute(routeName) {
    if (!this.user) return false;
    
    const key = `${this.user.rol}_${this.user.tableros}`;
    const rutasPermitidas = PERMISSIONS.RUTAS_PERMITIDAS[key] || [];
    
    return rutasPermitidas.includes(routeName);
  }
  
  // Obtener todas las rutas permitidas para el usuario
  getAllowedRoutes() {
    if (!this.user) return [];
    
    const key = `${this.user.rol}_${this.user.tableros}`;
    return PERMISSIONS.RUTAS_PERMITIDAS[key] || [];
  }
  
  // Obtener la página de inicio según los permisos
  getHomePage() {
    if (!this.user) return '/';
    return PERMISSIONS.PAGINA_INICIO[this.user.tableros] || '/dashboard';
  }
  
  // Verificar si es administrador
  isAdmin() {
    return this.user && this.user.rol === PERMISSIONS.ROLES.ADMIN;
  }
  
  // Verificar si es supervisor
  isSupervisor() {
    return this.user && this.user.rol === PERMISSIONS.ROLES.SUPERVISOR;
  }
  
  // Verificar si es usuario común
  isUser() {
    return this.user && this.user.rol === PERMISSIONS.ROLES.USUARIO;
  }
  
  // Verificar si es auditor
  isAuditor() {
    return this.user && this.user.rol === PERMISSIONS.ROLES.AUDITOR;
  }
}

// Instancia global de permisos
const userPermissions = new UserPermissions();