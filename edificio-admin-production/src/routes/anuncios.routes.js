import { Router } from 'express';
import { check } from 'express-validator';
import { getAnuncios, getAnuncioById, getAnunciosByTipo, getAnunciosRecientes, crearAnuncio, actualizarAnuncio, eliminarAnuncio, agregarArchivos, eliminarArchivo, descargarArchivo } from '../controllers/anuncios.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import upload, { handleMulterError } from '../middleware/upload.js';

const router = Router();

// Obtener todos los anuncios
router.get('/', verifyToken, getAnuncios);

// Obtener anuncio por ID
router.get('/:id', verifyToken, getAnuncioById);

// Obtener anuncios por tipo
router.get('/tipo/:tipo', verifyToken, getAnunciosByTipo);

// Obtener anuncios recientes
router.get('/recientes', verifyToken, getAnunciosRecientes);

// Crear anuncio con archivos (solo admin)
router.post('/', [
  verifyToken,
  isAdmin,
  upload.array('archivos', 5), // Máximo 5 archivos
  handleMulterError,
  check('titulo', 'El título es obligatorio').not().isEmpty(),
  check('contenido', 'El contenido es obligatorio').not().isEmpty(),
  check('tipo', 'El tipo es obligatorio').isIn(['GENERAL', 'IMPORTANTE', 'URGENTE', 'REUNION', 'MANTENIMIENTO']),
  validarCampos
], crearAnuncio);

// Actualizar anuncio (solo admin o autor)
router.put('/:id', [
  verifyToken,
  validarCampos
], actualizarAnuncio);

// Eliminar anuncio (solo admin o autor)
router.delete('/:id', [
  verifyToken
], eliminarAnuncio);

// Agregar archivos a anuncio existente (solo admin o autor)
router.post('/:id/archivos', [
  verifyToken,
  upload.array('archivos', 5),
  handleMulterError
], agregarArchivos);

// Eliminar archivo específico (solo admin o autor)
router.delete('/:id/archivos/:filename', [
  verifyToken
], eliminarArchivo);

// Descargar archivo
router.get('/:id/archivos/:filename/download', [
  verifyToken
], descargarArchivo);

export default router;