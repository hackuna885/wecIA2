const Inicio = { template: '<web-home></web-home>' }
const Web_dashBoard = { template: '<web-dashBoard></web-dashBoard>' }
const Web_usuarios = { template: '<web-usuarios></web-usuarios>' }
const Web_chats = { template: '<web-chats></web-chats>' }
const Web_configuracion = { template: '<web-configuracion></web-configuracion>' }


const routes = [
  { 
    path: '/', 
    name: 'login',
    component: Inicio 
  },
  { 
    path: '/dashboard', 
    name: 'dashboard',
    component: Web_dashBoard, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/usuarios', 
    name: 'usuarios',
    component: Web_usuarios, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/chats', 
    name: 'chats',
    component: Web_chats, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/configuracion', 
    name: 'configuracion',
    component: Web_configuracion, 
    meta: { requiresAuth: true } 
  }
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

// Guard de navegación compatible con ambos sistemas
router.beforeEach((to, from, next) => {
  // Verificar si userPermissions está disponible
  const hasPermissionsSystem = typeof userPermissions !== 'undefined';
  
  if (hasPermissionsSystem) {
    // Sistema nuevo con permisos
    const isAuthenticated = userPermissions.isAuthenticated();
    
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        next({
          path: '/',
          query: { redirect: to.fullPath }
        });
      } else {
        const routeName = to.name;
        
        if (userPermissions.hasAccessToRoute(routeName)) {
          next();
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para acceder a esta sección',
            timer: 3000
          });
          next(userPermissions.getHomePage());
        }
      }
    } else {
      if (to.path === '/' && isAuthenticated) {
        next(userPermissions.getHomePage());
      } else {
        next();
      }
    }
  } else {
    // Sistema anterior sin permisos
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        next({
          path: '/',
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

const app = Vue.createApp({
    data() {
        return {}
    }
})