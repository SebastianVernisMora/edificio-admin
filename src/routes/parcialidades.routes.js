import { Router } from 'express';
import { check } from 'express-validator';
import { getConfig, updateConfig, getPagos, getPagosByDepartamento, registrarPago, getEstadoPagos } from '../controllers/parcialidades.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin, isOwner } from '../middleware/auth.js';

const router = Router();

// Obtener configuración
router.get('/config', verifyToken, getConfig);

// Actualizar configuración (solo admin)
router.put('/config', [
  verifyToken,
  esAdmin,
  validarCampos
], updateConfig);

// Obtener todos los pagos
router.get('/pagos', verifyToken, getPagos);

// Obtener pagos por departamento
router.get('/pagos/departamento/:departamento', [
  verifyToken,
  esPropietario
], getPagosByDepartamento);

// Obtener mis parcialidades (inquilino)
router.get('/mis-parcialidades', verifyToken, async (req, res) => {
  try {
    const { getData } = await import('../data.js');
    const data = getData();
    
    // Filtrar parcialidades del usuario actual
    const misParcialidades = (data.parcialidades2026?.pagos || []).filter(pago => 
      pago.usuario_id === req.usuario.id
    );
    
    res.json(misParcialidades);
  } catch (error) {
    console.error('Error al obtener mis parcialidades:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener parcialidades'
    });
  }
});

// Registrar pago (solo admin)
router.post('/pagos', [
  verifyToken,
  esAdmin,
  check('departamento', 'El departamento es obligatorio').not().isEmpty(),
  check('monto', 'El monto es obligatorio').isNumeric(),
  validarCampos
], registrarPago);

// Obtener estado de pagos
router.get('/estado', verifyToken, getEstadoPagos);

export default router;