import { Router } from 'express';
import { check } from 'express-validator';
import { getFondos, actualizarFondos, transferirEntreFondos } from '../controllers/fondos.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Obtener fondos
router.get('/', verifyToken, getFondos);

// Actualizar fondos (solo admin)
router.put('/', [
  verifyToken,
  isAdmin,
  validarCampos
], actualizarFondos);

// Transferir entre fondos (solo admin)
router.post('/transferir', [
  verifyToken,
  isAdmin,
  check('origen', 'El fondo de origen es obligatorio').isIn(['ahorroAcumulado', 'gastosMayores', 'dineroOperacional']),
  check('destino', 'El fondo de destino es obligatorio').isIn(['ahorroAcumulado', 'gastosMayores', 'dineroOperacional']),
  check('monto', 'El monto es obligatorio').isNumeric(),
  validarCampos
], transferirEntreFondos);

// Alias para compatibilidad
router.post('/transferencia', [
  verifyToken,
  isAdmin,
  check('origen', 'El fondo de origen es obligatorio').isIn(['ahorroAcumulado', 'gastosMayores', 'dineroOperacional']),
  check('destino', 'El fondo de destino es obligatorio').isIn(['ahorroAcumulado', 'gastosMayores', 'dineroOperacional']),
  check('monto', 'El monto es obligatorio').isNumeric(),
  validarCampos
], transferirEntreFondos);

export default router;