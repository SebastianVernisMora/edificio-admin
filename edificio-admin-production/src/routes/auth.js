import express from 'express';
import { login, getPerfil, renovarToken } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta para inicio de sesión
router.post('/login', login);

// Ruta para obtener perfil (protegida)
router.get('/perfil', verifyToken, getPerfil);

// Ruta para renovar token (protegida)
router.get('/renew', verifyToken, renovarToken);

// Ruta para cambiar contraseña (protegida) - DESHABILITADA
// router.post('/cambiar-password', verifyToken, cambiarPassword);

// NOTA: Las rutas de gestión de usuarios se han movido a /api/usuarios
// - POST /registro -> POST /api/usuarios
// - GET /usuarios -> GET /api/usuarios

export default router;