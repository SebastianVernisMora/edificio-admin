// Auth Module - Versión Simplificada
const Auth = (() => {
  // Constants
  const API_URL = '/api/auth';
  const TOKEN_KEY = 'edificio_token';
  const USER_KEY = 'edificio_user';
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem(TOKEN_KEY);
  };
  
  // Get current user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  };
  
  // Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Error al iniciar sesión');
      }
      
      // Save token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
      
      return data.usuario;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  };
  
  // Check auth - VERSIÓN ULTRA SIMPLE SIN LOOPS
  const checkAuth = () => {
    const currentPath = window.location.pathname;
    
    // En página de login
    if (currentPath === '/' || currentPath === '/index.html') {
      if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user && user.rol) {
          // Solo redirigir si tenemos usuario válido
          if (user.rol === 'ADMIN' || user.rol === 'COMITE') {
            window.location.replace('/admin.html');
          } else {
            window.location.replace('/inquilino.html');
          }
        }
      }
      return; // Terminar aquí
    }
    
    // En páginas protegidas
    if (currentPath === '/admin.html' || currentPath === '/inquilino.html') {
      if (!isLoggedIn()) {
        // No hay token, ir al login
        window.location.replace('/');
      }
      // SI hay token, NO hacer nada más (evitar loops)
    }
  };
  
  // Initialize auth
  const init = () => {
    // Solo ejecutar checkAuth UNA VEZ al cargar
    checkAuth();
    
    // Setup login form si existe
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const user = await login(email, password);
          
          // Redirigir según rol
          if (user.rol === 'ADMIN' || user.rol === 'COMITE') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/inquilino.html';
          }
        } catch (error) {
          alert(error.message || 'Error al iniciar sesión');
        }
      });
    }
    
    // Setup logout button si existe
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
      });
    }
  };
  
  // Public API
  return {
    init,
    login,
    logout,
    isLoggedIn,
    getCurrentUser
  };
})();

// Auto-initialize cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Auth.init);
} else {
  Auth.init();
}
