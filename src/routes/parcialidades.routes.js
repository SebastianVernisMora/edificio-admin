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
  isAdmin,
  validarCampos
], updateConfig);

// Obtener todos los pagos
router.get('/pagos', verifyToken, getPagos);

// Obtener pagos por departamento (admin o el propio inquilino)
router.get('/pagos/departamento/:departamento', verifyToken, getPagosByDepartamento);

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

// Registrar pago (admin o el propio inquilino)
router.post('/pagos', [
  verifyToken,
  check('departamento', 'El departamento es obligatorio').not().isEmpty(),
  check('monto', 'El monto es obligatorio').isNumeric(),
  validarCampos
], registrarPago);

// Alias para compatibilidad (admin o el propio inquilino)
router.post('/', [
  verifyToken,
  check('departamento', 'El departamento es obligatorio').not().isEmpty(),
  check('monto', 'El monto es obligatorio').isNumeric(),
  validarCampos
], registrarPago);

// Obtener estado de pagos
router.get('/estado', verifyToken, getEstadoPagos);

// Validar/rechazar pago (solo admin)
router.put('/pagos/:id/validar', [
  verifyToken,
  isAdmin
], async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const Fondo = (await import('../models/Fondo.js')).default;
    
    const data = readData();
    const pagoId = parseInt(req.params.id);
    const { estado } = req.body;
    
    if (!data.parcialidades2026 || !data.parcialidades2026.pagos) {
      return res.status(404).json({ ok: false, msg: 'No hay pagos registrados' });
    }
    
    const pago = data.parcialidades2026.pagos.find(p => p.id === pagoId);
    
    if (!pago) {
      return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });
    }
    
    const estadoAnterior = pago.estado;
    
    // Actualizar estado del pago PRIMERO
    pago.estado = estado;
    pago.validadoEn = new Date().toISOString();
    pago.validadoPor = req.usuario.id;
    
    // Actualizar fondos en la misma data antes de guardar
    if (estado === 'validado' && estadoAnterior !== 'validado') {
      data.fondos.ahorroAcumulado += pago.monto;
      data.fondos.patrimonioTotal = 
        data.fondos.ahorroAcumulado + 
        data.fondos.gastosMayores + 
        data.fondos.dineroOperacional;
      console.log(`✅ Ingreso de $${pago.monto} a Ahorro Acumulado por validación de parcialidad`);
    }
    // Si se está rechazando (y antes estaba validado), revertir fondos
    else if (estado === 'pendiente' && estadoAnterior === 'validado') {
      data.fondos.ahorroAcumulado -= pago.monto;
      data.fondos.patrimonioTotal = 
        data.fondos.ahorroAcumulado + 
        data.fondos.gastosMayores + 
        data.fondos.dineroOperacional;
      console.log(`✅ Egreso de $${pago.monto} de Ahorro Acumulado por rechazo de parcialidad`);
    }
    
    // UNA SOLA escritura con todo
    writeData(data);
    
    res.json({
      ok: true,
      pago,
      msg: `Pago ${estado === 'validado' ? 'validado' : 'rechazado'} exitosamente`
    });
  } catch (error) {
    console.error('Error validando pago:', error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
});

export default router;