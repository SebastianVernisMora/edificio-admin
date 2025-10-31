import express from 'express';
import bcrypt from 'bcryptjs';
import { verifyToken, hasPermission } from '../middleware/auth.js';
import { 
  logUserCreation, 
  logUserUpdate, 
  logUserDeletion, 
  logPermissionChange, 
  logRoleChange 
} from '../utils/auditLog.js';

const router = express.Router();

// Todas las rutas requieren autenticación y permiso de usuarios
router.use(verifyToken);
router.use(hasPermission('usuarios'));

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { readData } = await import('../data.js');
    const data = readData();
    
    const usuarios = data.usuarios.map(u => ({
      ...u,
      password: undefined // No enviar password en respuestas
    }));
    
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const { nombre, email, rol, departamento, telefono, password } = req.body;

    // Validaciones
    if (!nombre || !email || !rol || !departamento || !password) {
      return res.status(400).json({ 
        mensaje: 'Faltan campos obligatorios: nombre, email, rol, departamento, password' 
      });
    }

    // Validar roles permitidos
    const rolesPermitidos = ['ADMIN', 'INQUILINO', 'COMITE'];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no válido. Roles permitidos: ADMIN, INQUILINO, COMITE' });
    }

    // Validar email único
    if (data.usuarios.find(u => u.email === email)) {
      return res.status(400).json({ mensaje: 'El email ya está en uso' });
    }

    // Validar departamento único para inquilinos
    if (rol === 'INQUILINO' && data.usuarios.find(u => u.departamento === departamento && u.rol === 'INQUILINO')) {
      return res.status(400).json({ mensaje: 'El departamento ya está asignado' });
    }

    // Validar formato de departamento para inquilinos
    if (rol === 'INQUILINO') {
      const deptoRegex = /^[1-5]0[1-4]$/;
      if (!deptoRegex.test(departamento)) {
        return res.status(400).json({ 
          mensaje: 'Departamento inválido. Formato esperado: 101-504 (piso + depto)' 
        });
      }
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generar ID único
    const newId = data.usuarios.length > 0 
      ? Math.max(...data.usuarios.map(u => u.id)) + 1 
      : 1;
    
    const nuevoUsuario = {
      id: newId,
      nombre,
      email,
      password: passwordHash,
      rol,
      departamento,
      telefono: telefono || null,
      legitimidad_entregada: false,
      estatus_validacion: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      activo: true
    };

    data.usuarios.push(nuevoUsuario);
    writeData(data);

    // Log de auditoría para creación de usuario
    const actor = req.usuario;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    logUserCreation(nuevoUsuario, actor, ip, userAgent);

    const respuesta = { ...nuevoUsuario, password: undefined };
    res.status(201).json(respuesta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const id = parseInt(req.params.id);
    const usuario = data.usuarios.find(u => u.id === id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Guardar datos anteriores para auditoría
    const usuarioAnterior = { ...usuario };
    
    const { nombre, email, rol, departamento, telefono, estatus_validacion, password } = req.body;

    // Validar email único (excluyendo el usuario actual)
    if (email && data.usuarios.find(u => u.email === email && u.id !== id)) {
      return res.status(400).json({ mensaje: 'El email ya está en uso' });
    }

    // Validar departamento único para inquilinos (excluyendo el usuario actual)
    if (rol === 'INQUILINO' && departamento && 
        data.usuarios.find(u => u.departamento === departamento && u.rol === 'INQUILINO' && u.id !== id)) {
      return res.status(400).json({ mensaje: 'El departamento ya está asignado' });
    }

    // Actualizar campos
    if (nombre !== undefined) usuario.nombre = nombre;
    if (email !== undefined) usuario.email = email;
    if (rol !== undefined) usuario.rol = rol;
    if (departamento !== undefined) usuario.departamento = departamento;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (estatus_validacion !== undefined) usuario.estatus_validacion = estatus_validacion;
    if (password) {
      usuario.password = await bcrypt.hash(password, 10);
    }

    writeData(data);

    // Log de auditoría
    const actor = req.usuario;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Log general de actualización
    logUserUpdate(id, usuarioAnterior, usuario, actor, ip, userAgent);
    
    // Log específico para cambio de rol
    if (usuarioAnterior.rol !== rol && rol !== undefined) {
      logRoleChange(id, usuarioAnterior.rol, rol, actor, ip, userAgent);
    }

    const respuesta = { ...usuario, password: undefined };
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const id = parseInt(req.params.id);
    
    // No permitir eliminar el admin principal
    if (id === 1) {
      return res.status(400).json({ mensaje: 'No se puede eliminar el administrador principal' });
    }

    const index = data.usuarios.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Guardar datos del usuario antes de eliminarlo para auditoría
    const usuarioAEliminar = { ...data.usuarios[index] };

    data.usuarios.splice(index, 1);
    writeData(data);

    // Log de auditoría para eliminación
    const actor = req.usuario;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    logUserDeletion(usuarioAEliminar, actor, ip, userAgent);

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

// Update user editor role (admin/superadmin only)
router.put('/:id/editor-role', async (req, res) => {
  try {
    // Check if user is admin or superadmin
    if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'superadmin') {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso denegado'
      });
    }
    
    const { id } = req.params;
    const { rol_editor, permisos_editor } = req.body;
    
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const usuarioIndex = data.usuarios.findIndex(u => u.id === parseInt(id));
    
    if (usuarioIndex === -1) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      });
    }
    
    const usuario = data.usuarios[usuarioIndex];
    
    // Only inquilinos can have editor roles
    if (usuario.rol !== 'INQUILINO') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Solo los inquilinos pueden tener roles de editor'
      });
    }
    
    // Validate editor role
    const validEditorRoles = ['cuotas', 'presupuestos', 'gastos', 'anuncios', 'solicitudes'];
    if (rol_editor && !validEditorRoles.includes(rol_editor)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Rol de editor inválido'
      });
    }
    
    // Update user
    data.usuarios[usuarioIndex].rol_editor = rol_editor;
    data.usuarios[usuarioIndex].permisos_editor = permisos_editor || {
      lectura: true,
      escritura: false,
      aprobacion: false
    };
    
    writeData(data);
    
    // Return updated user without password
    const { password, ...usuarioActualizado } = data.usuarios[usuarioIndex];
    
    res.json({
      ok: true,
      usuario: usuarioActualizado,
      mensaje: 'Rol de editor actualizado correctamente'
    });
    
  } catch (error) {
    console.error('Error al actualizar rol de editor:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
});

export default router;