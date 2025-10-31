import { Router } from 'express';
import { check } from 'express-validator';
import { getCuotas, getCuotaById, getCuotasByDepartamento, crearCuota, actualizarCuota, verificarVencimientos, getAcumuladoAnual } from '../controllers/cuotas.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin, isOwner } from '../middleware/auth.js';

const router = Router();

// Obtener todas las cuotas
router.get('/', verifyToken, getCuotas);

// Obtener cuota por ID
router.get('/:id', verifyToken, getCuotaById);

// Obtener cuotas por departamento
router.get('/departamento/:departamento', [
  verifyToken,
  isOwner
], getCuotasByDepartamento);

// Obtener acumulado anual de pagos por usuario
router.get('/acumulado-anual/:usuarioId/:year', [
  verifyToken
], getAcumuladoAnual);

// Obtener cuotas por mes/año
router.get('/mes/:mes/:año', verifyToken, async (req, res) => {
  try {
    const { getData } = await import('../data.js');
    const data = getData();
    const { mes, año } = req.params;
    
    const cuotas = data.cuotas.filter(cuota => 
      cuota.mes === mes && cuota.año === parseInt(año)
    );
    
    res.json({
      ok: true,
      cuotas
    });
  } catch (error) {
    console.error('Error al obtener cuotas por mes/año:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener cuotas'
    });
  }
});

// Obtener mis cuotas (inquilino)
router.get('/mis-cuotas', verifyToken, async (req, res) => {
  try {
    const { getData } = await import('../data.js');
    const data = getData();
    
    // Filtrar cuotas del usuario actual
    const misCuotas = data.cuotas.filter(cuota => 
      cuota.usuario_id === req.usuario.id || 
      cuota.departamento === req.usuario.departamento
    );
    
    res.json(misCuotas);
  } catch (error) {
    console.error('Error al obtener mis cuotas:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener cuotas'
    });
  }
});

// Reportar pago (inquilino)
router.post('/reportar-pago', [
  verifyToken,
  check('cuota_id', 'El ID de la cuota es obligatorio').isNumeric(),
  validarCampos
], async (req, res) => {
  try {
    const { getData, saveData } = await import('../data.js');
    const data = getData();
    
    const { cuota_id, observaciones } = req.body;
    const cuotaIndex = data.cuotas.findIndex(c => 
      c.id === parseInt(cuota_id) && 
      (c.usuario_id === req.usuario.id || c.departamento === req.usuario.departamento)
    );
    
    if (cuotaIndex === -1) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cuota no encontrada o no autorizada'
      });
    }
    
    // Actualizar cuota como "reportada"
    data.cuotas[cuotaIndex].estado = 'reportada';
    data.cuotas[cuotaIndex].fecha_reporte = new Date().toISOString();
    data.cuotas[cuotaIndex].observaciones_inquilino = observaciones || '';
    
    await saveData();
    
    res.json({
      ok: true,
      mensaje: 'Pago reportado correctamente'
    });
  } catch (error) {
    console.error('Error al reportar pago:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al reportar pago'
    });
  }
});

// Crear cuota (solo admin)
router.post('/', [
  verifyToken,
  isAdmin,
  check('mes', 'El mes es obligatorio').not().isEmpty(),
  check('año', 'El año es obligatorio').isNumeric(),
  check('monto', 'El monto es obligatorio').isNumeric(),
  check('departamento', 'El departamento es obligatorio').not().isEmpty(),
  check('fechaVencimiento', 'La fecha de vencimiento es obligatoria').isISO8601(),
  validarCampos
], crearCuota);

// Actualizar cuota (solo admin)
router.put('/:id', [
  verifyToken,
  isAdmin,
  check('estado', 'El estado es obligatorio').isIn(['PENDIENTE', 'PAGADO', 'VENCIDO']),
  validarCampos
], actualizarCuota);

// Verificar vencimientos (solo admin)
router.post('/verificar-vencimientos', [
  verifyToken,
  isAdmin
], verificarVencimientos);

export default router;