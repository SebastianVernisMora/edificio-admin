import express from 'express';
import { verifyToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

// Placeholder para controladores de gastos
const gastosController = {
  getGastos: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de gastos en construcción',
      gastos: []
    });
  },
  crearGasto: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Endpoint para crear gasto en construcción',
      gasto: {}
    });
  }
};

// Ruta para obtener todos los gastos (protegida)
router.get('/', verifyToken, gastosController.getGastos);

// Ruta para crear un nuevo gasto (requiere permiso de gastos)
router.post('/', verifyToken, hasPermission('gastos'), gastosController.crearGasto);

export default router;