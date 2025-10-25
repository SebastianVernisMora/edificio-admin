import express from 'express';
import { body } from 'express-validator';
import {
  obtenerPresupuestos,
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto,
  aprobarPresupuesto,
  rechazarPresupuesto
} from '../controllers/presupuestoController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

const validacionesPresupuesto = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('monto_total').isNumeric().withMessage('El monto debe ser numérico'),
  body('items').isArray().optional().withMessage('Los items deben ser un array')
];

router.get('/', verificarToken, obtenerPresupuestos);
router.get('/:id', verificarToken, obtenerPresupuesto);
router.post('/', verificarToken, requiereAdmin, validacionesPresupuesto, crearPresupuesto);
router.put('/:id', verificarToken, requiereAdmin, actualizarPresupuesto);
router.delete('/:id', verificarToken, requiereAdmin, eliminarPresupuesto);
router.patch('/:id/aprobar', verificarToken, requiereAdmin, aprobarPresupuesto);
router.patch('/:id/rechazar', verificarToken, requiereAdmin, rechazarPresupuesto);

export default router;