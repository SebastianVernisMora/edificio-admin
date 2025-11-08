import jwt from 'jsonwebtoken';
import { readData } from '../data.js';
import Usuario from '../models/Usuario.js';
import fs from 'fs';
import path from 'path';

// Cache de permisos para mejorar performance
const permissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Sistema de logging mejorado
const logAccess = (type, userId, userRole, resource, permission, granted, ip, userAgent) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    userId,
    userRole,
    resource,
    permission,
    granted,
    ip,
    userAgent: userAgent?.substring(0, 100) // Limitar longitud
  };

  // Crear directorio de logs si no existe
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Escribir log de acceso
  const logFile = path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error('Error escribiendo log de acceso:', error);
  }
};

// Función para limpiar cache expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of permissionsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      permissionsCache.delete(key);
    }
  }
};

// Limpiar cache cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('x-auth-token');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Verificar si existe token
    if (!token) {
      logAccess('AUTH_FAILED', null, null, req.path, null, false, ip, userAgent);
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edificio205_secret_key_2025');
    req.usuario = decoded.usuario;
    
    // Log de autenticación exitosa
    logAccess('AUTH_SUCCESS', req.usuario.id, req.usuario.rol, req.path, null, true, ip, userAgent);
    
    next();
  } catch (error) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    logAccess('AUTH_FAILED', null, null, req.path, null, false, ip, userAgent);
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (req.usuario && req.usuario.rol === 'ADMIN') {
    logAccess('ADMIN_ACCESS_GRANTED', req.usuario.id, req.usuario.rol, req.path, 'admin', true, ip, userAgent);
    next();
  } else {
    logAccess('ADMIN_ACCESS_DENIED', req.usuario?.id, req.usuario?.rol, req.path, 'admin', false, ip, userAgent);
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
};

// Middleware para verificar rol de comité o administrador
export const isComiteOrAdmin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (req.usuario && (req.usuario.rol === 'ADMIN' || req.usuario.rol === 'COMITE')) {
    logAccess('COMITE_ADMIN_ACCESS_GRANTED', req.usuario.id, req.usuario.rol, req.path, 'comite_admin', true, ip, userAgent);
    next();
  } else {
    logAccess('COMITE_ADMIN_ACCESS_DENIED', req.usuario?.id, req.usuario?.rol, req.path, 'comite_admin', false, ip, userAgent);
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador o comité.'
    });
  }
};

// Middleware para verificar permisos específicos con cache y logging
export const hasPermission = (permiso) => {
  return (req, res, next) => {
    const userId = req.usuario.id;
    const cacheKey = `${userId}-${permiso}`;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Verificar cache primero
    const cachedResult = permissionsCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
      if (cachedResult.hasPermission) {
        logAccess('PERMISSION_GRANTED_CACHED', userId, req.usuario.rol, req.path, permiso, true, ip, userAgent);
        return next();
      } else {
        logAccess('PERMISSION_DENIED_CACHED', userId, req.usuario.rol, req.path, permiso, false, ip, userAgent);
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. No tiene permiso para ${permiso}.`
        });
      }
    }
    
    // Obtener usuario completo de la base de datos para tener acceso a los permisos
    const data = readData();
    const usuarioCompleto = data.usuarios.find(u => u.id === userId);
    
    if (!usuarioCompleto) {
      logAccess('USER_NOT_FOUND', userId, req.usuario.rol, req.path, permiso, false, ip, userAgent);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el usuario tiene el permiso requerido
    const hasPermissionResult = Usuario.tienePermiso(usuarioCompleto, permiso);
    
    // Guardar en cache
    permissionsCache.set(cacheKey, {
      hasPermission: hasPermissionResult,
      timestamp: Date.now()
    });
    
    if (hasPermissionResult) {
      logAccess('PERMISSION_GRANTED', userId, req.usuario.rol, req.path, permiso, true, ip, userAgent);
      next();
    } else {
      logAccess('PERMISSION_DENIED', userId, req.usuario.rol, req.path, permiso, false, ip, userAgent);
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. No tiene permiso para ${permiso}.`
      });
    }
  };
};

// Middleware para verificar que el usuario accede a sus propios recursos
export const isOwner = (req, res, next) => {
  const { id } = req.params;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (req.usuario.rol === 'ADMIN' || req.usuario.id === parseInt(id)) {
    logAccess('OWNER_ACCESS_GRANTED', req.usuario.id, req.usuario.rol, req.path, 'owner', true, ip, userAgent);
    next();
  } else {
    logAccess('OWNER_ACCESS_DENIED', req.usuario.id, req.usuario.rol, req.path, 'owner', false, ip, userAgent);
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. No tiene permisos para acceder a este recurso.'
    });
  }
};

// Función para limpiar cache manualmente
export const clearPermissionsCache = (userId = null) => {
  if (userId) {
    // Limpiar cache específico del usuario
    for (const key of permissionsCache.keys()) {
      if (key.startsWith(`${userId}-`)) {
        permissionsCache.delete(key);
      }
    }
  } else {
    // Limpiar todo el cache
    permissionsCache.clear();
  }
};

// Función para obtener estadísticas del cache
export const getCacheStats = () => {
  return {
    size: permissionsCache.size,
    entries: Array.from(permissionsCache.entries()).map(([key, value]) => ({
      key,
      hasPermission: value.hasPermission,
      age: Date.now() - value.timestamp
    }))
  };
};

// Función para obtener logs de acceso del día
export const getTodayAccessLogs = () => {
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(process.cwd(), 'logs', `access-${today}.log`);
  
  try {
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    }
    return [];
  } catch (error) {
    console.error('Error leyendo logs de acceso:', error);
    return [];
  }
};

// Función para generar JWT token
export const generarJWT = (userId, userRole, userDepartamento) => {
  const payload = {
    usuario: {
      id: userId,
      rol: userRole,
      departamento: userDepartamento
    }
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'admin-secreto-2026', {
    expiresIn: '24h'
  });
};

export default {
  verifyToken,
  isAdmin,
  isComiteOrAdmin,
  hasPermission,
  isOwner,
  generarJWT,
  clearPermissionsCache,
  getCacheStats,
  getTodayAccessLogs
};