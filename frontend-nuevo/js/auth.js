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
        
        if (user.rol === 'admin' || user.rol === 'superadmin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/inquilino.html';
        }
      }
    } else {
      // Protected pages
      if (!isLoggedIn()) {
        window.location.href = '/';
        return;
      }
      
      // Check if this is the first load of the page
      if (!window.authChecked) {
        window.authChecked = true;
        
        // Renew token and check if user is on the correct page
        renewToken()
          .then(user => {
            // Check if user is on the correct page
            if (currentPath === '/admin.html' && user.rol !== 'admin' && user.rol !== 'superadmin') {
              window.location.href = '/inquilino.html';
            } else if (currentPath === '/inquilino.html' && (user.rol === 'admin' || user.rol === 'superadmin')) {
              window.location.href = '/admin.html';
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
          
          if (user.rol === 'ADMIN') {
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

// Initialize auth module
document.addEventListener('DOMContentLoaded', Auth.init);