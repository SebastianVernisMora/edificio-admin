import express from 'express';
import { verifyToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

// Placeholder para controladores de anuncios
const anunciosController = {
  getAnuncios: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de anuncios en construcción',
      anuncios: []
    });
  },
  crearAnuncio: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Endpoint para crear anuncio en construcción',
      anuncio: {}
    });
  }
};

// Ruta para obtener todos los anuncios (protegida)
router.get('/', verifyToken, anunciosController.getAnuncios);

// Ruta para crear un nuevo anuncio (requiere permiso de anuncios)
router.post('/', verifyToken, hasPermission('anuncios'), anunciosController.crearAnuncio);

export default router;