import express from 'express';
import { gastoController } from '../controllers/gastoController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(requiereAdmin);

// GET /api/gastos - Obtener todos los gastos
router.get('/', gastoController.obtenerTodos);

// GET /api/gastos/estadisticas - Obtener estadísticas de gastos
router.get('/estadisticas', gastoController.obtenerEstadisticas);

// GET /api/gastos/periodo - Obtener gastos por período
router.get('/periodo', gastoController.obtenerPorPeriodo);

// GET /api/gastos/fondo/:fondo - Obtener total por fondo
router.get('/fondo/:fondo', gastoController.obtenerTotalPorFondo);

// GET /api/gastos/:id - Obtener gasto por ID
router.get('/:id', gastoController.obtenerPorId);

// POST /api/gastos - Crear nuevo gasto
router.post('/', gastoController.crear);

// PUT /api/gastos/:id - Actualizar gasto
router.put('/:id', gastoController.actualizar);

// DELETE /api/gastos/:id - Eliminar gasto
router.delete('/:id', gastoController.eliminar);

export default router;