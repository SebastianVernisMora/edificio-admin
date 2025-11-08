import express from 'express';
import { getUsuariosComite, updatePermisos, registrarActividad, getActividad } from '../controllers/permisos.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas (solo administradores)
// Obtener usuarios con rol COMITE
router.get('/', verifyToken, isAdmin, getUsuariosComite);

// Actualizar permisos de un usuario
router.put('/:id', verifyToken, isAdmin, updatePermisos);

// Registrar actividad de cambios de permisos
router.post('/actividad', verifyToken, isAdmin, registrarActividad);

// Obtener historial de actividad
router.get('/actividad', verifyToken, isAdmin, getActividad);

export default router;