import express from 'express';
import { verifyToken, hasPermission } from '../middleware/auth.js';
import { 
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarRolEditor
} from '../controllers/usuarios.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación y permiso de usuarios
router.use(verifyToken);
router.use(hasPermission('usuarios'));

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', obtenerUsuarios);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', crearUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', eliminarUsuario);

// Update user editor role (admin/superadmin only)
router.put('/:id/editor-role', actualizarRolEditor);

export default router;