const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

function setUserInfo(user) {
    localStorage.setItem('userInfo', JSON.stringify(user));
}

function removeUserInfo() {
    localStorage.removeItem('userInfo');
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error en la solicitud');
        }

        return data;
    } catch (error) {
        console.error('Error en API request:', error);
        throw error;
    }
}

function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function logout() {
    removeToken();
    removeUserInfo();
    window.location.href = '/';
}

function checkAuth() {
    const token = getToken();
    const userInfo = getUserInfo();
    
    if (!token || !userInfo) {
        window.location.href = '/';
        return false;
    }
    
    if (window.location.pathname === '/admin' && userInfo.rol !== 'admin') {
        window.location.href = '/inquilino';
        return false;
    }
    
    if (window.location.pathname === '/inquilino' && userInfo.rol !== 'inquilino') {
        window.location.href = '/admin';
        return false;
    }
    
    return true;
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
            
            setToken(response.token);
            setUserInfo(response.usuario);
            
            if (response.usuario.rol === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/inquilino';
            }
        } catch (error) {
            showMessage(error.message);
        }
    });
}

if (window.location.pathname === '/admin' || window.location.pathname === '/inquilino') {
    document.addEventListener('DOMContentLoaded', () => {
        if (checkAuth()) {
            const userInfo = getUserInfo();
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = userInfo.nombre;
            }
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-AR');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('es-AR');
}