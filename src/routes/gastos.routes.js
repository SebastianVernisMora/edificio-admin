import { Router } from 'express';
import { check } from 'express-validator';
import { getGastos, getGastoById, getGastosByCategoria, getGastosByMesAño, crearGasto, actualizarGasto, eliminarGasto } from '../controllers/gastos.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Obtener todos los gastos
router.get('/', verifyToken, getGastos);

// Obtener gasto por ID
router.get('/:id', verifyToken, getGastoById);

// Obtener gastos por categoría
router.get('/categoria/:categoria', verifyToken, getGastosByCategoria);

// Obtener gastos por mes/año
router.get('/fecha/:mes/:año', verifyToken, getGastosByMesAño);

// Obtener gastos por mes/año (ruta alternativa)
router.get('/mes/:mes/:año', verifyToken, getGastosByMesAño);

// Crear gasto (solo admin)
router.post('/', [
  verifyToken,
  isAdmin,
  check('concepto', 'El concepto es obligatorio').not().isEmpty(),
  check('monto', 'El monto es obligatorio').isNumeric(),
  check('categoria', 'La categoría es obligatoria').not().isEmpty(),
  check('proveedor', 'El proveedor es obligatorio').not().isEmpty(),
  validarCampos
], crearGasto);

// Actualizar gasto (solo admin)
router.put('/:id', [
  verifyToken,
  isAdmin,
  validarCampos
], actualizarGasto);

// Eliminar gasto (solo admin)
router.delete('/:id', [
  verifyToken,
  isAdmin
], eliminarGasto);

export default router;