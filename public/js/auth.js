// auth.js - Manejo de autenticación

// Constantes
const API_URL = '/api';
const TOKEN_KEY = 'edificio_auth_token';
const USER_KEY = 'edificio_user';

// Función para iniciar sesión
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        // Guardar token y datos de usuario en localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));

        return data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Redireccionar a la página de inicio
    window.location.href = '/';
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// Función para obtener el token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Función para obtener los datos del usuario
function getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Función para verificar si el usuario es administrador
function isAdmin() {
    const user = getUser();
    return user && user.rol === 'ADMIN';
}

// Función para verificar si el usuario es miembro del comité
function isComite() {
    const user = getUser();
    return user && user.rol === 'COMITE';
}

// Función para verificar si el usuario tiene un permiso específico
function hasPermission(permiso) {
    const user = getUser();
    
    // Administradores tienen todos los permisos
    if (user && user.rol === 'ADMIN') {
        return true;
    }
    
    // Miembros del comité tienen permisos específicos
    if (user && user.rol === 'COMITE' && user.permisos) {
        return user.permisos[permiso] === true;
    }
    
    // Inquilinos no tienen permisos administrativos
    return false;
}

// Función para redireccionar según el rol
function redirectByRole() {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const user = getUser();
    
    if (user.rol === 'ADMIN' || user.rol === 'COMITE') {
        window.location.href = '/admin';
    } else {
        window.location.href = '/inquilino';
    }
}

// Función para proteger rutas
function protectRoute() {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const user = getUser();
    const currentPath = window.location.pathname;
    
    // Verificar acceso a rutas protegidas
    if (currentPath === '/admin' && user.rol !== 'ADMIN' && user.rol !== 'COMITE') {
        window.location.href = '/inquilino';
    } else if (currentPath === '/inquilino' && (user.rol === 'ADMIN' || user.rol === 'COMITE')) {
        window.location.href = '/admin';
    }
}

// Función para realizar peticiones autenticadas
async function fetchAuth(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // Si no es una respuesta exitosa, manejar diferentes tipos de errores
        if (!response.ok) {
            // Si el token expiró o es inválido
            if (response.status === 401) {
                logout();
                window.location.href = '/';
                return;
            }
        }
        
        // Intentar parsear como JSON
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Si no es JSON válido, obtener el texto de la respuesta
            const text = await response.text();
            console.error('Respuesta no es JSON válido:', text);
            throw new Error('El servidor devolvió una respuesta inválida');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        // Si es un error de red o conexión
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Error de conexión:', error);
            throw new Error('Error de conexión con el servidor');
        }
        
        console.error('Error en fetchAuth:', error);
        throw error;
    }
}

// Función para mostrar alertas
function showAlert(container, message, type = 'danger', timeout = 5000) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertContainer = document.getElementById(container);
    if (alertContainer) {
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertElement);
        
        if (timeout) {
            setTimeout(() => {
                alertElement.classList.remove('show');
                setTimeout(() => alertElement.remove(), 300);
            }, timeout);
        }
    }
}

// Función para mostrar/ocultar secciones según permisos
function setupPermissionBasedUI() {
    const user = getUser();
    
    // Si no hay usuario o no estamos en la página de admin, no hacer nada
    if (!user || window.location.pathname !== '/admin') {
        return;
    }
    
    // Si es administrador, mostrar todo
    if (user.rol === 'ADMIN') {
        return;
    }
    
    // Si es miembro del comité, mostrar solo secciones con permiso
    if (user.rol === 'COMITE') {
        const sections = {
            'anuncios': document.querySelector('a[data-section="anuncios"]'),
            'gastos': document.querySelector('a[data-section="gastos"]'),
            'presupuestos': document.querySelector('a[data-section="presupuestos"]'),
            'cuotas': document.querySelector('a[data-section="cuotas"]'),
            'usuarios': document.querySelector('a[data-section="usuarios"]'),
            'cierres': document.querySelector('a[data-section="cierres"]')
        };
        
        // Ocultar sección de permisos (solo visible para administradores)
        const permisosMenuItem = document.getElementById('permisosMenuItem');
        if (permisosMenuItem) {
            permisosMenuItem.style.display = 'none';
        }
        
        // Ocultar secciones sin permiso
        for (const [permiso, element] of Object.entries(sections)) {
            if (element && !hasPermission(permiso)) {
                const li = element.closest('li');
                if (li) {
                    li.style.display = 'none';
                }
            }
        }
        
        // Manejar específicamente la sección de configuración
        // La sección de configuración solo debe ser visible si el usuario tiene permiso de 'usuarios'
        const configSection = document.querySelector('a[data-section="configuracion"]');
        if (configSection) {
            const configLi = configSection.closest('li');
            if (configLi) {
                // Ocultar la sección de configuración si el usuario no tiene permiso de usuarios
                configLi.style.display = hasPermission('usuarios') ? '' : 'none';
            }
        }
    }
}

// Inicializar eventos de login en la página de inicio
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Si el usuario ya está autenticado, redirigir
        if (isAuthenticated()) {
            redirectByRole();
            return;
        }
        
        // Manejar envío del formulario de login
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const data = await login(email, password);
                showAlert('alertContainer', 'Inicio de sesión exitoso. Redireccionando...', 'success');
                
                // Redireccionar según el rol
                setTimeout(() => redirectByRole(), 1000);
            } catch (error) {
                showAlert('alertContainer', error.message || 'Error al iniciar sesión');
            }
        });
        
        // Toggle para mostrar/ocultar contraseña
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Cambiar ícono
                this.querySelector('i').classList.toggle('bi-eye');
                this.querySelector('i').classList.toggle('bi-eye-slash');
            });
        }
    } else {
        // Proteger rutas en otras páginas
        protectRoute();
        
        // Configurar botones de logout
        const logoutButtons = document.querySelectorAll('#btnLogout, #btnLogoutDropdown');
        logoutButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        });
        
        // Mostrar nombre de usuario
        const userNameElements = document.querySelectorAll('#userName');
        const user = getUser();
        
        if (user && userNameElements) {
            userNameElements.forEach(element => {
                element.textContent = user.nombre;
            });
        }
        
        // Configurar UI basada en permisos
        setupPermissionBasedUI();
    }
});