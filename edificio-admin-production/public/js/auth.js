// Auth Module
const Auth = (() => {
  // Constants
  const API_URL = '/api/auth';
  const TOKEN_KEY = 'edificio_token';
  const USER_KEY = 'edificio_user';
  const TOKEN_TIMESTAMP = 'edificio_token_timestamp';
  
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
      localStorage.setItem(TOKEN_TIMESTAMP, Date.now().toString());
      
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
    localStorage.removeItem(TOKEN_TIMESTAMP);
    window.location.href = '/';
  };
  
  // Renew token
  const renewToken = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        throw new Error('No hay token');
      }
      
      // Check if token was renewed recently (within the last minute)
      const timestamp = localStorage.getItem(TOKEN_TIMESTAMP);
      if (timestamp && Date.now() - parseInt(timestamp) < 60000) {
        // Token was renewed recently, skip renewal
        return getCurrentUser();
      }
      
      const response = await fetch(`${API_URL}/renew`, {
        method: 'GET',
        headers: {
          'x-token': token
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Error al renovar token');
      }
      
      // Update token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
      localStorage.setItem(TOKEN_TIMESTAMP, Date.now().toString());
      
      return data.usuario;
    } catch (error) {
      console.error('Error al renovar token:', error);
      logout();
      throw error;
    }
  };
  
  // Check auth and redirect if needed
  const checkAuth = () => {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' || currentPath === '/index.html') {
      // Login page
      if (isLoggedIn()) {
        const user = getCurrentUser();
        const userRole = user.rol ? user.rol.toLowerCase() : '';
        
        console.log('Redirigiendo usuario logueado desde login page. Rol:', userRole);
        
        if (userRole === 'admin' || userRole === 'superadmin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/inquilino.html';
        }
        return;
      }
    } else {
      // Protected pages
      if (!isLoggedIn()) {
        window.location.href = '/';
        return;
      }
      
      // Check if this is the first load of the page (evitar múltiples verificaciones)
      if (!window.authChecked) {
        window.authChecked = true;
        console.log('Primera verificación de auth en página:', currentPath);
        
        // Renew token and check if user is on the correct page
        console.log('Verificando usuario en página protegida:', currentPath);
        
        renewToken()
          .then(user => {
            const userRole = user.rol ? user.rol.toLowerCase() : '';
            console.log('Token renovado. Usuario:', user.nombre, 'Rol:', userRole, 'Página:', currentPath);
            
            // Check if user is on the correct page
            if (currentPath === '/admin.html' && userRole !== 'admin' && userRole !== 'superadmin') {
              console.log('Redirigiendo admin no autorizado a inquilino');
              window.location.href = '/inquilino.html';
            } else if (currentPath === '/inquilino.html' && (userRole === 'admin' || userRole === 'superadmin')) {
              console.log('Redirigiendo admin desde inquilino a admin');
              window.location.href = '/admin.html';
            } else {
              console.log('Usuario en la página correcta, no se requiere redirección');
            }
          })
          .catch(error => {
            console.error('Error al verificar autenticación:', error);
            window.location.href = '/';
          });
      }
    }
  };
  
  // Initialize auth
  const init = () => {
    // Check authentication on page load
    checkAuth();
    
    // Setup login form if on login page
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const user = await login(email, password);
          
          const userRole = user.rol ? user.rol.toLowerCase() : '';
          if (userRole === 'admin' || userRole === 'superadmin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/inquilino.html';
          }
        } catch (error) {
          alert(error.message || 'Error al iniciar sesión');
        }
      });
    }
    
    // Setup logout button if on protected page
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
    isLoggedIn,
    getCurrentUser,
    login,
    logout,
    renewToken,
    getToken: () => localStorage.getItem(TOKEN_KEY)
  };
})();

// Credentials Modal Handler
const CredentialsModal = (() => {
  const init = () => {
    const modal = document.getElementById('credentials-modal');
    const btn = document.getElementById('show-credentials-btn');
    const closeBtn = modal?.querySelector('.close');
    
    if (!modal || !btn) return;
    
    // Open modal
    btn.addEventListener('click', () => {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
    
    // Close modal
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
      }
    });
  };
  
  return { init };
})();

// Initialize modules - ONLY on login page
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  console.log('Auth init: Página actual:', currentPath);
  
  // Solo ejecutar Auth.init() en la página de login
  if (currentPath === '/' || currentPath === '/index.html') {
    console.log('Auth init: Ejecutando en página de login');
    Auth.init();
    CredentialsModal.init();
  } else {
    console.log('Auth init: Saltando en página protegida');
    // En páginas protegidas, solo verificar si está logueado
    if (!Auth.isLoggedIn()) {
      console.log('Auth init: Usuario no logueado, redirigiendo');
      window.location.href = '/';
    } else {
      console.log('Auth init: Usuario logueado, continuando');
    }
  }
});