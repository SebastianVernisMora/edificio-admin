import express from 'express';
import {
  obtenerAnuncios,
  obtenerAnuncio,
  crearAnuncio,
  actualizarAnuncio,
  desactivarAnuncio,
  eliminarAnuncio,
  obtenerAnunciosPorTipo
} from '../controllers/anuncioController.js';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verificarToken, obtenerAnuncios);
router.get('/tipo/:tipo', verificarToken, obtenerAnunciosPorTipo);
router.get('/:id', verificarToken, obtenerAnuncio);
router.post('/', verificarToken, requiereAdmin, crearAnuncio);
router.put('/:id', verificarToken, requiereAdmin, actualizarAnuncio);
router.patch('/:id/desactivar', verificarToken, requiereAdmin, desactivarAnuncio);
router.delete('/:id', verificarToken, requiereAdmin, eliminarAnuncio);

export default router;