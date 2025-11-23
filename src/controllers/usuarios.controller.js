import bcrypt from 'bcryptjs';
import { handleControllerError } from '../middleware/error-handler.js';
import { 
  logUserCreation, 
  logUserUpdate, 
  logUserDeletion, 
  logPermissionChange, 
  logRoleChange 
} from '../utils/auditLog.js';

// GET /api/usuarios - Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const { readData } = await import('../data.js');
    const data = readData();
    
    const usuarios = data.usuarios.map(u => ({
      ...u,
      password: undefined // No enviar password en respuestas
    }));
    
    res.json({ ok: true, usuarios });
  } catch (error) {
    return handleControllerError(error, res, 'obtenerUsuarios');
  }
};

// POST /api/usuarios - Crear nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const { nombre, email, rol, departamento, telefono, password } = req.body;

    // Validaciones
    if (!nombre || !email || !rol || !departamento || !password) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Faltan campos obligatorios: nombre, email, rol, departamento, password' 
      });
    }

    // Validar roles permitidos
    const rolesPermitidos = ['ADMIN', 'INQUILINO', 'COMITE'];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Rol no válido. Roles permitidos: ADMIN, INQUILINO, COMITE' 
      });
    }

    // Validar email único
    if (data.usuarios.find(u => u.email === email)) {
      return res.status(400).json({ ok: false, msg: 'El email ya está en uso' });
    }

    // Validar departamento único para inquilinos
    if (rol === 'INQUILINO' && data.usuarios.find(u => u.departamento === departamento && u.rol === 'INQUILINO')) {
      return res.status(400).json({ ok: false, msg: 'El departamento ya está asignado' });
    }

    // Validar formato de departamento para inquilinos
    if (rol === 'INQUILINO') {
      const deptoRegex = /^[1-5]0[1-4]$/;
      if (!deptoRegex.test(departamento)) {
        return res.status(400).json({ 
          ok: false, 
          msg: 'Departamento inválido. Formato esperado: 101-504 (piso + depto)' 
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
    res.status(201).json({ ok: true, usuario: respuesta });
  } catch (error) {
    return handleControllerError(error, res, 'crearUsuario');
  }
};

// PUT /api/usuarios/:id - Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const id = parseInt(req.params.id);
    const usuario = data.usuarios.find(u => u.id === id);

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    // Guardar datos anteriores para auditoría
    const usuarioAnterior = { ...usuario };
    
    const { nombre, email, rol, departamento, telefono, estatus_validacion, esEditor, password } = req.body;

    // Validar email único (excluyendo el usuario actual)
    if (email && data.usuarios.find(u => u.email === email && u.id !== id)) {
      return res.status(400).json({ ok: false, msg: 'El email ya está en uso' });
    }

    // Validar departamento único para inquilinos (excluyendo el usuario actual)
    if (rol === 'INQUILINO' && departamento && 
        data.usuarios.find(u => u.departamento === departamento && u.rol === 'INQUILINO' && u.id !== id)) {
      return res.status(400).json({ ok: false, msg: 'El departamento ya está asignado' });
    }

    // Actualizar campos
    if (nombre !== undefined) usuario.nombre = nombre;
    if (email !== undefined) usuario.email = email;
    if (rol !== undefined) usuario.rol = rol;
    if (departamento !== undefined) usuario.departamento = departamento;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (estatus_validacion !== undefined) usuario.estatus_validacion = estatus_validacion;
    if (esEditor !== undefined) usuario.esEditor = esEditor;
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
    res.json({ ok: true, usuario: respuesta });
  } catch (error) {
    return handleControllerError(error, res, 'actualizarUsuario');
  }
};

// DELETE /api/usuarios/:id - Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const id = parseInt(req.params.id);
    
    // No permitir eliminar el admin principal
    if (id === 1) {
      return res.status(400).json({ ok: false, msg: 'No se puede eliminar el administrador principal' });
    }

    const index = data.usuarios.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
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

    res.json({ ok: true, msg: 'Usuario eliminado exitosamente' });
  } catch (error) {
    return handleControllerError(error, res, 'eliminarUsuario');
  }
};

// PUT /api/usuarios/:id/editor-role - Actualizar rol de editor
export const actualizarRolEditor = async (req, res) => {
  try {
    // Check if user is admin or superadmin
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'SUPERADMIN') {
      return res.status(403).json({
        ok: false,
        msg: 'Acceso denegado'
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
        msg: 'Usuario no encontrado'
      });
    }
    
    const usuario = data.usuarios[usuarioIndex];
    
    // Only inquilinos can have editor roles
    if (usuario.rol !== 'INQUILINO') {
      return res.status(400).json({
        ok: false,
        msg: 'Solo los inquilinos pueden tener roles de editor'
      });
    }
    
    // Validate editor role
    const validEditorRoles = ['cuotas', 'presupuestos', 'gastos', 'anuncios', 'solicitudes'];
    if (rol_editor && !validEditorRoles.includes(rol_editor)) {
      return res.status(400).json({
        ok: false,
        msg: 'Rol de editor inválido'
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
      msg: 'Rol de editor actualizado correctamente'
    });
    
  } catch (error) {
    return handleControllerError(error, res, 'actualizarRolEditor');
  }
};
