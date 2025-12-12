import { Router } from 'express';
import { check } from 'express-validator';
import { getCierres, getCierreById, getCierreByMesAño, realizarCierreMensual, realizarCierreAnual } from '../controllers/cierres.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Obtener todos los cierres
router.get('/', verifyToken, getCierres);

// Obtener cierre por ID
router.get('/:id', verifyToken, getCierreById);

// Obtener cierre por mes/año
router.get('/fecha/:mes/:año', verifyToken, getCierreByMesAño);

// Realizar cierre mensual (solo admin)
router.post('/mensual', [
  verifyToken,
  isAdmin,
  check('mes', 'El mes es obligatorio').not().isEmpty(),
  check('año', 'El año es obligatorio').isNumeric(),
  validarCampos
], realizarCierreMensual);

// Realizar cierre anual (solo admin)
router.post('/anual', [
  verifyToken,
  isAdmin,
  check('año', 'El año es obligatorio').isNumeric(),
  validarCampos
], realizarCierreAnual);

export default router;