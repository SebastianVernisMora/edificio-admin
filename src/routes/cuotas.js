import express from 'express';
import { body } from 'express-validator';
import {
  obtenerCuotas,
  obtenerCuota,
  crearCuota,
  marcarPagada,
  obtenerEstadisticasPagos,
  obtenerVencidas,
  actualizarCuota,
  eliminarCuota
} from '../controllers/cuotaController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

const validacionesCuota = [
  body('concepto').notEmpty().withMessage('El concepto es requerido'),
  body('monto').isNumeric().withMessage('El monto debe ser numérico'),
  body('fecha_vencimiento').isDate().withMessage('Fecha de vencimiento inválida')
];

router.get('/', verificarToken, obtenerCuotas);
router.get('/estadisticas', verificarToken, requiereAdmin, obtenerEstadisticasPagos);
router.get('/vencidas', verificarToken, requiereAdmin, obtenerVencidas);
router.get('/:id', verificarToken, obtenerCuota);
router.post('/', verificarToken, requiereAdmin, validacionesCuota, crearCuota);
router.patch('/:id/pagar', verificarToken, marcarPagada);
router.put('/:id', verificarToken, requiereAdmin, actualizarCuota);
router.delete('/:id', verificarToken, requiereAdmin, eliminarCuota);

export default router;