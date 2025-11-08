// Auth Debug Script - Para diagnosticar problemas de autenticación
console.log('🔍 Auth Debug: Iniciando diagnóstico...');

// Verificar estado de autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Auth Debug: DOM cargado, verificando autenticación...');
  
  // Verificar localStorage
  const token = localStorage.getItem('edificio_token');
  const user = localStorage.getItem('edificio_user');
  const timestamp = localStorage.getItem('edificio_token_timestamp');
  
  console.log('🔍 LocalStorage:', {
    hasToken: !!token,
    hasUser: !!user,
    hasTimestamp: !!timestamp
  });
  
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log('🔍 Usuario:', {
        nombre: userObj.nombre,
        email: userObj.email,
        rol: userObj.rol,
        rolType: typeof userObj.rol,
        rolLower: userObj.rol ? userObj.rol.toLowerCase() : 'undefined'
      });
    } catch (error) {
      console.error('🔍 Error parseando usuario:', error);
    }
  }
  
  // Verificar Auth module
  if (typeof Auth !== 'undefined') {
    console.log('🔍 Auth module disponible');
    const currentUser = Auth.getCurrentUser();
    console.log('🔍 Auth.getCurrentUser():', currentUser);
  } else {
    console.error('🔍 Auth module NO disponible');
  }
});

// Interceptar redirecciones
const originalAssign = window.location.assign;
const originalHref = window.location.href;

Object.defineProperty(window.location, 'href', {
  set: function(value) {
    console.log('🔍 Redirección interceptada:', value);
    console.trace('🔍 Stack trace de redirección:');
    // Permitir la redirección después del log
    window.location.assign(value);
  },
  get: function() {
    return originalHref;
  }
});

// Interceptar Auth methods si están disponibles
setTimeout(() => {
  if (typeof Auth !== 'undefined') {
    const originalGetCurrentUser = Auth.getCurrentUser;
    Auth.getCurrentUser = function() {
      const result = originalGetCurrentUser.call(this);
      console.log('🔍 Auth.getCurrentUser() llamado, resultado:', result);
      return result;
    };
  }
}, 100);