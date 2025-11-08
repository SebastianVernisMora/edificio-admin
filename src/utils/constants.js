// Constantes centralizadas del proyecto Edificio 205

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// Roles de usuario
export const ROLES = {
  ADMIN: 'ADMIN',
  COMITE: 'COMITE', 
  INQUILINO: 'INQUILINO'
};

// Headers estándar
export const HEADERS = {
  AUTH_TOKEN: 'x-auth-token',
  CONTENT_TYPE: 'content-type'
};

// Response formats estándar
export const RESPONSE_FORMAT = {
  SUCCESS: (data = {}) => ({ ok: true, ...data }),
  ERROR: (msg = 'Error interno del servidor') => ({ ok: false, msg })
};

// Estados de cuotas
export const ESTADOS_CUOTA = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO', 
  VENCIDO: 'VENCIDO',
  NO_GENERADA: 'NO_GENERADA'
};

// Estados de anuncios
export const ESTADOS_ANUNCIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo'
};

// Tipos de anuncios
export const TIPOS_ANUNCIO = {
  URGENTE: 'urgente',
  NORMAL: 'normal',
  MANTENIMIENTO: 'mantenimiento'
};

// Configuración del sistema
export const CONFIG = {
  YEAR_FISCAL: 2026,
  CUOTA_MENSUAL: 75000,
  TOTAL_DEPARTAMENTOS: 20,
  TOTAL_ANUAL: 18000000,
  JWT_EXPIRE: '30d'
};

// Departamentos válidos
export const DEPARTAMENTOS = [
  '101', '102', '103', '104',
  '201', '202', '203', '204', 
  '301', '302', '303', '304',
  '401', '402', '403', '404',
  '501', '502', '503', '504'
];

// Categorías de gastos
export const CATEGORIAS_GASTO = [
  'Servicios Públicos',
  'Mantenimiento',
  'Seguridad', 
  'Limpieza',
  'Administración',
  'Emergencias',
  'Mejoras',
  'Otros'
];

// Validaciones
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'No autorizado para realizar esta acción',
  TOKEN_INVALID: 'Token inválido o expirado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  DEPARTMENT_TAKEN: 'Departamento ya asignado',
  INVALID_EMAIL: 'Formato de email inválido',
  WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
  REQUIRED_FIELDS: 'Campos requeridos faltantes',
  INVALID_ID: 'ID inválido',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
  DUPLICATE_RESOURCE: 'El recurso ya existe',
  INTERNAL_ERROR: 'Error interno del servidor'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente', 
  USER_DELETED: 'Usuario eliminado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  CUOTA_CREATED: 'Cuota creada exitosamente',
  CUOTA_PAID: 'Cuota marcada como pagada',
  GASTO_CREATED: 'Gasto registrado exitosamente',
  ANUNCIO_CREATED: 'Anuncio publicado exitosamente'
};

export default {
  HTTP_STATUS,
  ROLES,
  HEADERS,
  RESPONSE_FORMAT,
  ESTADOS_CUOTA,
  ESTADOS_ANUNCIO,
  TIPOS_ANUNCIO,
  CONFIG,
  DEPARTAMENTOS,
  CATEGORIAS_GASTO,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};