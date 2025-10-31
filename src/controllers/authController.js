import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import { readData, writeData } from '../data.js';
import { 
  logUserCreation, 
  logUserUpdate, 
  logUserDeletion, 
  logPermissionChange, 
  logRoleChange 
} from '../utils/auditLog.js';

// Controlador para registro de usuarios
export const registro = async (req, res) => {
  try {
    const { nombre, email, password, departamento, rol, permisos } = req.body;
    
    // Validar datos
    if (!nombre || !email || !password || !departamento) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }
    
    // Validar rol
    const rolesValidos = ['ADMIN', 'INQUILINO', 'COMITE'];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido. Debe ser ADMIN, INQUILINO o COMITE'
      });
    }
    
    // Validar permisos para rol COMITE
    if (rol === 'COMITE' && !permisos) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar permisos para usuarios del comité'
      });
    }
    
    // Crear usuario
    const nuevoUsuario = await Usuario.crear({
      nombre,
      email,
      password,
      departamento,
      rol,
      permisos
    });

    // Log de auditoría para creación de usuario
    const actor = req.usuario || { id: 1, email: 'system', rol: 'ADMIN' }; // Sistema o usuario actual
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    logUserCreation(nuevoUsuario, actor, ip, userAgent);
    
    // Generar token JWT
    const payload = {
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        departamento: nuevoUsuario.departamento,
        rol: nuevoUsuario.rol
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'edificio205_secret_key_2025',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        res.status(201).json({
          success: true,
          message: 'Usuario registrado exitosamente',
          token,
          usuario: {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            departamento: nuevoUsuario.departamento,
            rol: nuevoUsuario.rol,
            permisos: nuevoUsuario.permisos
          }
        });
      }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar usuario'
    });
  }
};

// Controlador para inicio de sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios'
      });
    }
    
    // Obtener datos
    const data = readData();
    
    // Buscar usuario por email
    const usuario = data.usuarios.find(u => u.email === email);
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token JWT
    const payload = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        departamento: usuario.departamento,
        rol: usuario.rol
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'edificio205_secret_key_2025',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Excluir password del objeto usuario
        const { password, ...usuarioSinPassword } = usuario;
        
        res.json({
          success: true,
          message: 'Inicio de sesión exitoso',
          token,
          usuario: usuarioSinPassword
        });
      }
    );
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
};

// Controlador para obtener perfil de usuario
export const getPerfil = async (req, res) => {
  try {
    const data = readData();
    const usuario = data.usuarios.find(u => u.id === req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Excluir password del objeto usuario
    const { password, ...usuarioSinPassword } = usuario;
    
    res.json({
      success: true,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario'
    });
  }
};

// Controlador para cambiar contraseña
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    
    // Validar datos
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        success: false,
        message: 'Ambas contraseñas son obligatorias'
      });
    }
    
    // Obtener datos
    const data = readData();
    
    // Buscar usuario
    const usuario = data.usuarios.find(u => u.id === req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(passwordActual, usuario.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Generar hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordNueva, salt);
    
    // Actualizar contraseña
    usuario.password = hashedPassword;
    
    // Guardar cambios
    const resultado = Usuario.actualizar(usuario.id, { password: hashedPassword });
    
    if (!resultado) {
      return res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña'
      });
    }
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al cambiar contraseña'
    });
  }
};

// Controlador para obtener todos los usuarios (solo admin)
export const getUsuarios = async (req, res) => {
  try {
    const data = readData();
    
    // Filtrar passwords
    const usuarios = data.usuarios.map(usuario => {
      const { password, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    });
    
    res.json({
      success: true,
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Controlador para actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, departamento, rol, permisos } = req.body;
    
    // Obtener datos actuales del usuario para auditoría
    const data = readData();
    const usuarioAnterior = data.usuarios.find(u => u.id === parseInt(id));
    
    if (!usuarioAnterior) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Validar rol
    const rolesValidos = ['ADMIN', 'INQUILINO', 'COMITE'];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido. Debe ser ADMIN, INQUILINO o COMITE'
      });
    }
    
    // Validar permisos para rol COMITE
    if (rol === 'COMITE' && !permisos) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar permisos para usuarios del comité'
      });
    }
    
    // Actualizar usuario
    const usuarioActualizado = Usuario.actualizar(parseInt(id), {
      nombre,
      email,
      departamento,
      rol,
      permisos
    });
    
    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Log de auditoría
    const actor = req.usuario;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Log general de actualización
    logUserUpdate(parseInt(id), usuarioAnterior, usuarioActualizado, actor, ip, userAgent);
    
    // Log específico para cambio de rol
    if (usuarioAnterior.rol !== rol) {
      logRoleChange(parseInt(id), usuarioAnterior.rol, rol, actor, ip, userAgent);
    }
    
    // Log específico para cambio de permisos
    if (JSON.stringify(usuarioAnterior.permisos) !== JSON.stringify(permisos)) {
      logPermissionChange(parseInt(id), usuarioAnterior.permisos, permisos, actor, ip, userAgent);
    }
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar usuario'
    });
  }
};

// Controlador para eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener datos del usuario antes de eliminarlo para auditoría
    const data = readData();
    const usuarioAEliminar = data.usuarios.find(u => u.id === parseInt(id));
    
    if (!usuarioAEliminar) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Eliminar usuario
    const resultado = Usuario.eliminar(parseInt(id));
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Log de auditoría para eliminación
    const actor = req.usuario;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    logUserDeletion(usuarioAEliminar, actor, ip, userAgent);
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar usuario'
    });
  }
};

export default {
  registro,
  login,
  getPerfil,
  cambiarPassword,
  getUsuarios,
  updateUsuario,
  deleteUsuario
};