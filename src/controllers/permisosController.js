import { readData, updateItem, addItem } from '../data.js';
import Usuario from '../models/Usuario.js';

// Obtener usuarios con rol COMITE
export const getUsuariosComite = (req, res) => {
  try {
    const data = readData();
        
    // Filtrar usuarios según el parámetro 'todos'
    let usuarios;
        
    if (req.query.todos === 'true') {
      // Mostrar todos los usuarios (excepto el usuario actual)
      usuarios = data.usuarios.filter(u => u.id !== req.usuario.id);
    } else {
      // Mostrar solo usuarios con rol COMITE
      usuarios = data.usuarios.filter(u => u.rol === 'COMITE');
    }
        
    // Eliminar contraseñas
    const usuariosSinPassword = usuarios.map(u => {
      const { password, ...usuarioSinPassword } = u;
      return usuarioSinPassword;
    });
        
    return res.status(200).json({
      success: true,
      usuarios: usuariosSinPassword
    });
  } catch (error) {
    console.error('Error al obtener usuarios del comité:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios del comité',
      error: error.message
    });
  }
};

// Actualizar permisos de un usuario
export const updatePermisos = (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body;
        
    if (!permisos) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron permisos para actualizar'
      });
    }
        
    // Verificar que el usuario existe
    const data = readData();
    const usuario = data.usuarios.find(u => u.id === parseInt(id));
        
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
        
    // Verificar que el usuario tiene rol COMITE
    if (usuario.rol !== 'COMITE') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden actualizar permisos de usuarios con rol COMITE'
      });
    }
        
    // Validar permisos
    const permisosValidos = {
      anuncios: permisos.anuncios === true,
      gastos: permisos.gastos === true,
      presupuestos: permisos.presupuestos === true,
      cuotas: permisos.cuotas === true,
      usuarios: permisos.usuarios === true,
      cierres: permisos.cierres === true
    };
        
    // Actualizar permisos
    updateItem('usuarios', parseInt(id), { permisos: permisosValidos });
        
    return res.status(200).json({
      success: true,
      message: 'Permisos actualizados correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar permisos',
      error: error.message
    });
  }
};

// Registrar actividad de cambios de permisos
export const registrarActividad = (req, res) => {
  try {
    const { usuarioId, descripcion } = req.body;
        
    if (!usuarioId || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
        
    // Verificar que el usuario existe
    const data = readData();
    const usuario = data.usuarios.find(u => u.id === parseInt(usuarioId));
        
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
        
    // Verificar si la colección existe y crearla si no
    if (!data.permisosActividad) {
      data.permisosActividad = [];
    }
        
    // Crear registro de actividad
    const actividad = {
      id: Date.now(), // Añadir un ID único
      fecha: new Date().toISOString(),
      administradorId: req.usuario.id,
      administrador: req.usuario.nombre,
      usuarioId: parseInt(usuarioId),
      usuario: usuario.nombre,
      descripcion
    };
        
    // Guardar actividad
    addItem('permisosActividad', actividad);
        
    return res.status(201).json({
      success: true,
      message: 'Actividad registrada correctamente'
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar actividad',
      error: error.message
    });
  }
};

// Obtener historial de actividad
export const getActividad = (req, res) => {
  try {
    const data = readData();
        
    // Si no existe la colección 'permisosActividad', inicializarla
    if (!data.permisosActividad) {
      data.permisosActividad = [];
    }
        
    // Ordenar por fecha (más reciente primero)
    const actividadOrdenada = [...data.permisosActividad].sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
        
    return res.status(200).json({
      success: true,
      actividad: actividadOrdenada
    });
  } catch (error) {
    console.error('Error al obtener historial de actividad:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial de actividad',
      error: error.message
    });
  }
};