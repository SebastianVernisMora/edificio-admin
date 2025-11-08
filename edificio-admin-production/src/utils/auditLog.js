import fs from 'fs';
import path from 'path';

/**
 * Sistema de Audit Trail para cambios de permisos y usuarios
 * Registra todas las modificaciones críticas del sistema
 */

// Crear directorio de auditoría si no existe
const auditDir = path.join(process.cwd(), 'logs', 'audit');
if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

/**
 * Registra un evento de auditoría
 * @param {string} action - Acción realizada (CREATE, UPDATE, DELETE, PERMISSION_CHANGE)
 * @param {string} resource - Recurso afectado (USER, PERMISSION, ROLE)
 * @param {number} targetId - ID del recurso afectado
 * @param {object} changes - Cambios realizados
 * @param {object} actor - Usuario que realizó la acción
 * @param {string} ip - Dirección IP del actor
 * @param {string} userAgent - User Agent del navegador
 */
export const logAuditEvent = (action, resource, targetId, changes, actor, ip = null, userAgent = null) => {
  const timestamp = new Date().toISOString();
  const auditEntry = {
    id: generateAuditId(),
    timestamp,
    action,
    resource,
    targetId,
    changes,
    actor: {
      id: actor.id,
      email: actor.email,
      rol: actor.rol
    },
    metadata: {
      ip,
      userAgent: userAgent?.substring(0, 200), // Limitar longitud
      sessionId: generateSessionId(actor.id, timestamp)
    }
  };

  // Escribir a archivo de auditoría diario
  const auditFile = path.join(auditDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
  const auditLine = JSON.stringify(auditEntry) + '\n';
  
  try {
    fs.appendFileSync(auditFile, auditLine);
    console.log(`[AUDIT] ${action} ${resource} ${targetId} by ${actor.email}`);
  } catch (error) {
    console.error('Error escribiendo log de auditoría:', error);
  }

  return auditEntry;
};

/**
 * Registra cambios específicos de permisos
 */
export const logPermissionChange = (userId, oldPermissions, newPermissions, actor, ip, userAgent) => {
  const changes = {
    before: oldPermissions,
    after: newPermissions,
    added: getAddedPermissions(oldPermissions, newPermissions),
    removed: getRemovedPermissions(oldPermissions, newPermissions)
  };

  return logAuditEvent('PERMISSION_CHANGE', 'USER', userId, changes, actor, ip, userAgent);
};

/**
 * Registra cambios de rol de usuario
 */
export const logRoleChange = (userId, oldRole, newRole, actor, ip, userAgent) => {
  const changes = {
    before: { rol: oldRole },
    after: { rol: newRole }
  };

  return logAuditEvent('ROLE_CHANGE', 'USER', userId, changes, actor, ip, userAgent);
};

/**
 * Registra creación de usuario
 */
export const logUserCreation = (newUser, actor, ip, userAgent) => {
  const changes = {
    created: {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      rol: newUser.rol,
      departamento: newUser.departamento,
      activo: newUser.activo
    }
  };

  return logAuditEvent('CREATE', 'USER', newUser.id, changes, actor, ip, userAgent);
};

/**
 * Registra eliminación de usuario
 */
export const logUserDeletion = (deletedUser, actor, ip, userAgent) => {
  const changes = {
    deleted: {
      id: deletedUser.id,
      email: deletedUser.email,
      nombre: deletedUser.nombre,
      rol: deletedUser.rol,
      departamento: deletedUser.departamento
    }
  };

  return logAuditEvent('DELETE', 'USER', deletedUser.id, changes, actor, ip, userAgent);
};

/**
 * Registra actualización de usuario
 */
export const logUserUpdate = (userId, oldData, newData, actor, ip, userAgent) => {
  const changes = {
    before: oldData,
    after: newData,
    modified: getModifiedFields(oldData, newData)
  };

  return logAuditEvent('UPDATE', 'USER', userId, changes, actor, ip, userAgent);
};

/**
 * Obtiene logs de auditoría por fecha
 */
export const getAuditLogs = (date = null, limit = 100) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const auditFile = path.join(auditDir, `audit-${targetDate}.log`);
  
  try {
    if (fs.existsSync(auditFile)) {
      const content = fs.readFileSync(auditFile, 'utf8');
      const logs = content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .slice(-limit); // Obtener los últimos N registros
      
      return logs.reverse(); // Más recientes primero
    }
    return [];
  } catch (error) {
    console.error('Error leyendo logs de auditoría:', error);
    return [];
  }
};

/**
 * Obtiene logs de auditoría por usuario
 */
export const getAuditLogsByUser = (userId, days = 7) => {
  const logs = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = getAuditLogs(dateStr, 1000);
    const userLogs = dayLogs.filter(log => 
      log.actor.id === userId || log.targetId === userId
    );
    
    logs.push(...userLogs);
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Obtiene estadísticas de auditoría
 */
export const getAuditStats = (days = 30) => {
  const stats = {
    totalEvents: 0,
    eventsByAction: {},
    eventsByResource: {},
    eventsByUser: {},
    recentActivity: []
  };
  
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = getAuditLogs(dateStr, 1000);
    stats.totalEvents += dayLogs.length;
    
    dayLogs.forEach(log => {
      // Por acción
      stats.eventsByAction[log.action] = (stats.eventsByAction[log.action] || 0) + 1;
      
      // Por recurso
      stats.eventsByResource[log.resource] = (stats.eventsByResource[log.resource] || 0) + 1;
      
      // Por usuario
      const userKey = `${log.actor.email} (${log.actor.rol})`;
      stats.eventsByUser[userKey] = (stats.eventsByUser[userKey] || 0) + 1;
    });
    
    // Actividad reciente (últimos 10 eventos)
    if (i === 0) {
      stats.recentActivity = dayLogs.slice(0, 10);
    }
  }
  
  return stats;
};

// Funciones auxiliares
function generateAuditId() {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(userId, timestamp) {
  return `session_${userId}_${new Date(timestamp).getTime()}`;
}

function getAddedPermissions(oldPerms, newPerms) {
  if (!oldPerms || !newPerms) return [];
  
  const added = [];
  for (const [key, value] of Object.entries(newPerms)) {
    if (value && !oldPerms[key]) {
      added.push(key);
    }
  }
  return added;
}

function getRemovedPermissions(oldPerms, newPerms) {
  if (!oldPerms || !newPerms) return [];
  
  const removed = [];
  for (const [key, value] of Object.entries(oldPerms)) {
    if (value && !newPerms[key]) {
      removed.push(key);
    }
  }
  return removed;
}

function getModifiedFields(oldData, newData) {
  const modified = {};
  
  for (const [key, newValue] of Object.entries(newData)) {
    if (oldData[key] !== newValue) {
      modified[key] = {
        from: oldData[key],
        to: newValue
      };
    }
  }
  
  return modified;
}

export default {
  logAuditEvent,
  logPermissionChange,
  logRoleChange,
  logUserCreation,
  logUserDeletion,
  logUserUpdate,
  getAuditLogs,
  getAuditLogsByUser,
  getAuditStats
};