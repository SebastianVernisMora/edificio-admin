import express from 'express';
import {
  obtenerSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  responderSolicitud,
  cambiarEstadoSolicitud,
  obtenerEstadisticasSolicitudes,
  eliminarSolicitud
} from '../controllers/solicitudController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verificarToken, obtenerSolicitudes);
router.get('/estadisticas', verificarToken, requiereAdmin, obtenerEstadisticasSolicitudes);
router.get('/:id', verificarToken, obtenerSolicitud);
router.post('/', verificarToken, crearSolicitud);
router.post('/:id/responder', verificarToken, requiereAdmin, responderSolicitud);
router.patch('/:id/estado', verificarToken, requiereAdmin, cambiarEstadoSolicitud);
router.delete('/:id', verificarToken, eliminarSolicitud);

export default router;