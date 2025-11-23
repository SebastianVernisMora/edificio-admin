// Constantes del Frontend - Edificio Admin
// Siguiendo estándares BLACKBOX.md

// API Endpoints
const API_BASE_URL = '/api';

const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        VERIFY: `${API_BASE_URL}/auth/verify`,
        REFRESH: `${API_BASE_URL}/auth/refresh`
    },
    
    // Usuarios
    USUARIOS: {
        BASE: `${API_BASE_URL}/usuarios`,
        BY_ID: (id) => `${API_BASE_URL}/usuarios/${id}`,
        PROFILE: `${API_BASE_URL}/usuarios/profile`
    },
    
    // Cuotas
    CUOTAS: {
        BASE: `${API_BASE_URL}/cuotas`,
        BY_ID: (id) => `${API_BASE_URL}/cuotas/${id}`,
        BY_DEPARTAMENTO: (dpto) => `${API_BASE_URL}/cuotas/departamento/${dpto}`,
        VERIFICAR: `${API_BASE_URL}/cuotas/verificar-vencimientos`,
        ACUMULADO: (userId, year) => `${API_BASE_URL}/cuotas/acumulado-anual/${userId}/${year}`
    },
    
    // Gastos
    GASTOS: {
        BASE: `${API_BASE_URL}/gastos`,
        BY_ID: (id) => `${API_BASE_URL}/gastos/${id}`,
        BY_CATEGORIA: (cat) => `${API_BASE_URL}/gastos/categoria/${cat}`,
        BY_FECHA: (mes, año) => `${API_BASE_URL}/gastos/fecha/${mes}/${año}`
    },
    
    // Cierres
    CIERRES: {
        BASE: `${API_BASE_URL}/cierres`,
        BY_ID: (id) => `${API_BASE_URL}/cierres/${id}`,
        BY_FECHA: (mes, año) => `${API_BASE_URL}/cierres/fecha/${mes}/${año}`,
        MENSUAL: `${API_BASE_URL}/cierres/mensual`,
        ANUAL: `${API_BASE_URL}/cierres/anual`
    }
};

// Headers estándar
const HEADERS = {
    AUTH_TOKEN: 'x-auth-token', // ÚNICO header de auth permitido
    CONTENT_TYPE: 'application/json'
};

// Response format estándar
const RESPONSE_FORMAT = {
    SUCCESS: 'ok',
    ERROR: 'ok',
    MESSAGE: 'msg'
};

// Roles de usuario
const USER_ROLES = {
    ADMIN: 'ADMIN',
    COMITE: 'COMITE',
    INQUILINO: 'INQUILINO'
};

// Estados de cuotas
const CUOTA_ESTADOS = {
    PENDIENTE: 'PENDIENTE',
    PAGADA: 'PAGADA',
    VENCIDA: 'VENCIDA',
    PARCIAL: 'PARCIAL'
};

// Categorías de gastos
const GASTO_CATEGORIAS = {
    MANTENIMIENTO: 'MANTENIMIENTO',
    SERVICIOS: 'SERVICIOS',
    ADMINISTRACION: 'ADMINISTRACION',
    MEJORAS: 'MEJORAS',
    OTROS: 'OTROS'
};

// Mensajes de error comunes
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
    UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
    TOKEN_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
    VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
    SERVER_ERROR: 'Error interno del servidor. Intente nuevamente más tarde.'
};

// Configuración de la aplicación
const APP_CONFIG = {
    TOKEN_STORAGE_KEY: 'edificio-token',
    USER_STORAGE_KEY: 'edificio-user',
    THEME_STORAGE_KEY: 'edificio-theme',
    LANGUAGE_STORAGE_KEY: 'edificio-language'
};