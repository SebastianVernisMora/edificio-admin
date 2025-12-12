import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken, isAdmin, hasPermission } from '../middleware/auth.js';
import {
  obtenerSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  responderSolicitud,
  cambiarEstadoSolicitud,
  obtenerEstadisticasSolicitudes,
  eliminarSolicitud
} from '../controllers/solicitudes.controller.js';

const router = express.Router();

// Middleware para validar errores
const validarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errores.array()
    });
  }
  next();
};

// Validaciones para crear solicitud
const validacionesCrearSolicitud = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 5, max: 100 })
    .withMessage('El título debe tener entre 5 y 100 caracteres'),
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  body('categoria')
    .optional()
    .isIn(['mantenimiento', 'seguridad', 'limpieza', 'administracion', 'general'])
    .withMessage('Categoría no válida')
];

// Validaciones para responder solicitud
const validacionesResponderSolicitud = [
  body('respuesta')
    .notEmpty()
    .withMessage('La respuesta es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La respuesta debe tener entre 10 y 500 caracteres'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'completada', 'rechazada'])
    .withMessage('Estado no válido')
];

// Validaciones para cambiar estado
const validacionesCambiarEstado = [
  body('estado')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['pendiente', 'en_proceso', 'completada', 'rechazada'])
    .withMessage('Estado no válido')
];

// Rutas públicas (requieren autenticación)
router.use(verifyToken);

// GET /api/solicitudes - Obtener todas las solicitudes (admin) o del usuario (inquilino)
router.get('/', obtenerSolicitudes);

// GET /api/solicitudes/estadisticas - Obtener estadísticas (solo admin)
router.get('/estadisticas', isAdmin, obtenerEstadisticasSolicitudes);

// GET /api/solicitudes/:id - Obtener solicitud específica
router.get('/:id', obtenerSolicitud);

// POST /api/solicitudes - Crear nueva solicitud
router.post('/', validacionesCrearSolicitud, validarErrores, crearSolicitud);

// PUT /api/solicitudes/:id/responder - Responder solicitud (solo admin)
router.put('/:id/responder', 
  isAdmin, 
  validacionesResponderSolicitud, 
  validarErrores, 
  responderSolicitud
);

// PUT /api/solicitudes/:id/estado - Cambiar estado de solicitud (solo admin)
router.put('/:id/estado', 
  isAdmin, 
  validacionesCambiarEstado, 
  validarErrores, 
  cambiarEstadoSolicitud
);

// DELETE /api/solicitudes/:id - Eliminar solicitud
router.delete('/:id', eliminarSolicitud);

export default router;