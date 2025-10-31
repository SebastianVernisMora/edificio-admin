import express from 'express';
import { 
  getCuotas, 
  getCuotasPorMesAnio, 
  generarCuotasMensuales, 
  registrarPago, 
  actualizarEstado 
} from '../controllers/cuotasController.js';
import { getAcumuladoAnual } from '../controllers/cuotas.controller.js';
import { verifyToken, hasPermission } from '../middleware/auth.js';
import { verificarEstadoCuotas, inicializarCuotasAnuales, programarCuotasAnuales } from '../utils/cuotasInicializacion.js';

const router = express.Router();

// Ruta para obtener todas las cuotas (protegida)
router.get('/', verifyToken, getCuotas);

// Ruta para obtener cuotas por mes y año (protegida)
router.get('/:mes/:anio', verifyToken, getCuotasPorMesAnio);

// Ruta para generar cuotas mensuales (requiere permiso de cuotas)
router.post('/generar', verifyToken, hasPermission('cuotas'), generarCuotasMensuales);

// Ruta para registrar pago de cuota (protegida)
router.post('/:id/pago', verifyToken, registrarPago);

// Ruta para actualizar estado de cuota (requiere permiso de cuotas)
router.put('/:id/estado', verifyToken, hasPermission('cuotas'), actualizarEstado);

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

export default router;