import express from 'express';
import { cierreController } from '../controllers/cierreController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(requiereAdmin);

// GET /api/cierres - Obtener todos los cierres
router.get('/', cierreController.obtenerTodos);

// GET /api/cierres/estadisticas - Obtener estadísticas de cierres
router.get('/estadisticas', cierreController.obtenerEstadisticas);

// GET /api/cierres/:id - Obtener cierre por ID
router.get('/:id', cierreController.obtenerPorId);

// POST /api/cierres - Crear nuevo cierre
router.post('/', cierreController.crear);

export default router;