import express from 'express';
import { verifyToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

// Placeholder para controladores de cierres
const cierresController = {
  getCierres: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de cierres en construcción',
      cierres: []
    });
  },
  realizarCierre: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Endpoint para realizar cierre en construcción',
      cierre: {}
    });
  }
};

// Ruta para obtener todos los cierres (protegida)
router.get('/', verifyToken, cierresController.getCierres);

// Ruta para realizar un nuevo cierre (requiere permiso de cierres)
router.post('/', verifyToken, hasPermission('cierres'), cierresController.realizarCierre);

export default router;