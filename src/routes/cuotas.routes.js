import express from 'express';
import { 
  getCuotas, 
  getCuotaById,
  getCuotasByDepartamento,
  crearCuota,
  actualizarCuota,
  verificarVencimientos,
  getAcumuladoAnual
} from '../controllers/cuotas.controller.js';
import { verifyToken, hasPermission } from '../middleware/auth.js';
import { verificarEstadoCuotas, inicializarCuotasAnuales, programarCuotasAnuales } from '../utils/cuotasInicializacion.js';

const router = express.Router();

// Ruta para obtener todas las cuotas (protegida)
router.get('/', verifyToken, getCuotas);

// Ruta para obtener cuota por ID (protegida)
router.get('/:id', verifyToken, getCuotaById);

// Ruta para crear cuota (requiere permiso de cuotas)
router.post('/generar', verifyToken, hasPermission('cuotas'), crearCuota);

// Ruta para verificar vencimientos (protegida)
router.post('/verificar-vencimientos', verifyToken, verificarVencimientos);

// Ruta para actualizar estado de cuota (requiere permiso de cuotas)
router.put('/:id/estado', verifyToken, hasPermission('cuotas'), actualizarCuota);

// Ruta para obtener acumulado anual de pagos por usuario
router.get('/acumulado-anual/:usuarioId/:year', verifyToken, getAcumuladoAnual);

// Rutas administrativas para manejo de cuotas
router.get('/sistema/estado', verifyToken, hasPermission('cuotas'), (req, res) => {
  try {
    const estado = verificarEstadoCuotas();
    res.json({
      success: true,
      data: estado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado de cuotas',
      error: error.message
    });
  }
});

router.post('/sistema/inicializar', verifyToken, hasPermission('cuotas'), async (req, res) => {
  try {
    const resultado = await inicializarCuotasAnuales();
    res.json({
      success: true,
      message: 'Cuotas inicializadas correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al inicializar cuotas',
      error: error.message
    });
  }
});

router.post('/sistema/programar/:anio', verifyToken, hasPermission('cuotas'), async (req, res) => {
  try {
    const anio = parseInt(req.params.anio);
    const cuotasGeneradas = await programarCuotasAnuales(anio);
    res.json({
      success: true,
      message: `Cuotas programadas para el año ${anio}`,
      cuotasGeneradas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error al programar cuotas para ${req.params.anio}`,
      error: error.message
    });
  }
});

// Obtener cuotas por departamento
router.get('/departamento/:departamento', [
  verifyToken,
  // isOwner - comentado por ahora, verificar si es necesario
], getCuotasByDepartamento);

// Obtener cuotas por mes/año
router.get('/mes/:mes/:año', verifyToken, async (req, res) => {
  try {
    const { readData } = await import('../data.js');
    const data = readData();
    const { mes, año } = req.params;
    
    const cuotas = data.cuotas.filter(cuota => 
      cuota.mes === mes && cuota.anio === parseInt(año)
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
    const { readData } = await import('../data.js');
    const data = readData();
    
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

export default router;