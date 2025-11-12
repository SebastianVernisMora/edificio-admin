import express from 'express';
import { verifyToken, hasPermission } from '../middleware/auth.js';
import { body } from 'express-validator';
import {
  obtenerPresupuestos,
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto,
  aprobarPresupuesto,
  rechazarPresupuesto,
  obtenerEstadisticas,
  obtenerAlertas
} from '../controllers/presupuestos.controller.js';

const router = express.Router();

// Validaciones para crear/actualizar presupuesto
const validacionPresupuesto = [
  body('titulo').notEmpty().withMessage('El título es obligatorio'),
  body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('categoria').notEmpty().withMessage('La categoría es obligatoria'),
  body('descripcion').optional(),
  body('anio').optional().isInt({ min: 2020, max: 2100 }).withMessage('Año inválido')
];

// Obtener estadísticas de presupuestos
router.get('/estadisticas/resumen', verifyToken, obtenerEstadisticas);

// Obtener alertas de exceso de presupuesto
router.get('/alertas/exceso', verifyToken, obtenerAlertas);

// Obtener todos los presupuestos
router.get('/', verifyToken, obtenerPresupuestos);

// Obtener un presupuesto específico
router.get('/:id', verifyToken, obtenerPresupuesto);

// Crear nuevo presupuesto (requiere permiso)
router.post('/', verifyToken, hasPermission('presupuestos'), validacionPresupuesto, crearPresupuesto);

// Actualizar presupuesto (requiere permiso)
router.put('/:id', verifyToken, hasPermission('presupuestos'), actualizarPresupuesto);

// Eliminar presupuesto (requiere permiso)
router.delete('/:id', verifyToken, hasPermission('presupuestos'), eliminarPresupuesto);

// Aprobar presupuesto (requiere permiso)
router.patch('/:id/aprobar', verifyToken, hasPermission('presupuestos'), aprobarPresupuesto);

// Rechazar presupuesto (requiere permiso)
router.patch('/:id/rechazar', verifyToken, hasPermission('presupuestos'), rechazarPresupuesto);

export default router;