import express from 'express';
import { verifyToken, isAdmin, hasPermission, getTodayAccessLogs, getCacheStats, clearPermissionsCache } from '../middleware/auth.js';
import { 
  getAuditLogs, 
  getAuditLogsByUser, 
  getAuditStats
} from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /api/audit/logs
 * Obtiene logs de auditoría por fecha
 * Requiere permisos de administrador
 */
router.get('/logs', verifyToken, isAdmin, (req, res) => {
  try {
    const { date, limit } = req.query;
    const logs = getAuditLogs(date, parseInt(limit) || 100);
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        date: date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/audit/logs/user/:userId
 * Obtiene logs de auditoría de un usuario específico
 * Requiere permisos de administrador
 */
router.get('/logs/user/:userId', verifyToken, isAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    
    const logs = getAuditLogsByUser(parseInt(userId), parseInt(days) || 7);
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        userId: parseInt(userId),
        days: parseInt(days) || 7
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/audit/stats
 * Obtiene estadísticas de auditoría
 * Requiere permisos de administrador
 */
router.get('/stats', verifyToken, isAdmin, (req, res) => {
  try {
    const { days } = req.query;
    const stats = getAuditStats(parseInt(days) || 30);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/audit/access-logs
 * Obtiene logs de acceso del día actual
 * Requiere permisos de administrador
 */
router.get('/access-logs', verifyToken, isAdmin, (req, res) => {
  try {
    const logs = getTodayAccessLogs();
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs de acceso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/audit/cache-stats
 * Obtiene estadísticas del cache de permisos
 * Requiere permisos de administrador
 */
router.get('/cache-stats', verifyToken, isAdmin, (req, res) => {
  try {
    const stats = getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/audit/clear-cache
 * Limpia el cache de permisos
 * Requiere permisos de administrador
 */
router.post('/clear-cache', verifyToken, isAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    
    clearPermissionsCache(userId);
    
    res.json({
      success: true,
      message: userId ? 
        `Cache limpiado para usuario ${userId}` : 
        'Cache de permisos limpiado completamente'
    });
  } catch (error) {
    console.error('Error limpiando cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/audit/activity-summary
 * Obtiene resumen de actividad reciente
 * Requiere permisos de administrador
 */
router.get('/activity-summary', verifyToken, isAdmin, (req, res) => {
  try {
    const auditStats = getAuditStats(7); // Últimos 7 días
    const accessLogs = getTodayAccessLogs();
    const cacheStats = getCacheStats();
    
    // Contar accesos por tipo hoy
    const accessSummary = accessLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});
    
    // Usuarios más activos
    const activeUsers = Object.entries(auditStats.eventsByUser)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([user, count]) => ({ user, count }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalAuditEvents: auditStats.totalEvents,
          totalAccessEvents: accessLogs.length,
          cacheSize: cacheStats.size,
          activeUsers: activeUsers.length
        },
        accessSummary,
        activeUsers,
        recentActivity: auditStats.recentActivity.slice(0, 5),
        cacheStats: {
          size: cacheStats.size,
          avgAge: cacheStats.entries.length > 0 ? 
            cacheStats.entries.reduce((sum, entry) => sum + entry.age, 0) / cacheStats.entries.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen de actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;