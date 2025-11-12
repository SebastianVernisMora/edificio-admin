import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { 
  obtenerLogs,
  obtenerLogsPorUsuario,
  obtenerEstadisticas,
  obtenerLogsAcceso,
  obtenerEstadisticasCache,
  limpiarCache,
  obtenerResumenActividad
} from '../controllers/audit.controller.js';

const router = express.Router();

/**
 * GET /api/audit/logs
 * Obtiene logs de auditoría por fecha
 * Requiere permisos de administrador
 */
router.get('/logs', verifyToken, isAdmin, obtenerLogs);

/**
 * GET /api/audit/logs/user/:userId
 * Obtiene logs de auditoría de un usuario específico
 * Requiere permisos de administrador
 */
router.get('/logs/user/:userId', verifyToken, isAdmin, obtenerLogsPorUsuario);

/**
 * GET /api/audit/stats
 * Obtiene estadísticas de auditoría
 * Requiere permisos de administrador
 */
router.get('/stats', verifyToken, isAdmin, obtenerEstadisticas);

/**
 * GET /api/audit/access-logs
 * Obtiene logs de acceso del día actual
 * Requiere permisos de administrador
 */
router.get('/access-logs', verifyToken, isAdmin, obtenerLogsAcceso);

/**
 * GET /api/audit/cache-stats
 * Obtiene estadísticas del cache de permisos
 * Requiere permisos de administrador
 */
router.get('/cache-stats', verifyToken, isAdmin, obtenerEstadisticasCache);

/**
 * POST /api/audit/clear-cache
 * Limpia el cache de permisos
 * Requiere permisos de administrador
 */
router.post('/clear-cache', verifyToken, isAdmin, limpiarCache);

/**
 * GET /api/audit/activity-summary
 * Obtiene resumen de actividad reciente
 * Requiere permisos de administrador
 */
router.get('/activity-summary', verifyToken, isAdmin, obtenerResumenActividad);

export default router;