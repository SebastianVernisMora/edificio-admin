import bcrypt from 'bcryptjs';
import { readData, addItem, updateItem, deleteItem } from '../data.js';

class Usuario {
  constructor(nombre, email, password, departamento, rol = 'INQUILINO', permisos = {}) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.departamento = departamento;
    this.rol = rol;
    this.permisos = permisos; // Nuevo campo para permisos configurables
    this.fechaCreacion = new Date().toISOString();
    this.activo = true;
  }
  
  // Método para crear un nuevo usuario
  static async crear(userData) {
    try {
      // Verificar si el email ya existe
      const data = readData();
      const existeEmail = data.usuarios.some(u => u.email === userData.email);
      
      if (existeEmail) {
        throw new Error('El email ya está registrado');
      }
      
      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Configurar permisos según el rol
      let permisos = {};
      
      if (userData.rol === 'COMITE') {
        // Permisos por defecto para el comité (todos desactivados)
        permisos = {
          anuncios: userData.permisos?.anuncios || false,
          gastos: userData.permisos?.gastos || false,
          presupuestos: userData.permisos?.presupuestos || false,
          cuotas: userData.permisos?.cuotas || false,
          usuarios: userData.permisos?.usuarios || false,
          cierres: userData.permisos?.cierres || false
        };
      } else if (userData.rol === 'ADMIN') {
        // Administrador tiene todos los permisos
        permisos = {
          anuncios: true,
          gastos: true,
          presupuestos: true,
          cuotas: true,
          usuarios: true,
          cierres: true
        };
      }
      
      // Crear nuevo usuario con contraseña hasheada y permisos
      const nuevoUsuario = new Usuario(
        userData.nombre,
        userData.email,
        hashedPassword,
        userData.departamento,
        userData.rol || 'INQUILINO',
        permisos
      );
      
      // Guardar en la base de datos
      return addItem('usuarios', nuevoUsuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
  
  // Método para obtener todos los usuarios
  static obtenerTodos() {
    const data = readData();
    return data.usuarios.map(u => {
      const { password, ...usuarioSinPassword } = u;
      return usuarioSinPassword;
    });
  }
  
  // Método para obtener un usuario por ID
  static obtenerPorId(id) {
    const data = readData();
    const usuario = data.usuarios.find(u => u.id === id);
    
    if (!usuario) return null;
    
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
  
  // Método para obtener un usuario por email
  static obtenerPorEmail(email) {
    const data = readData();
    return data.usuarios.find(u => u.email === email);
  }
  
  // Método para actualizar un usuario
  static actualizar(id, updates) {
    // No permitir actualizar la contraseña directamente
    const { password, ...actualizaciones } = updates;
    
    // Si se están actualizando permisos y el rol es COMITE, asegurarse de que los permisos sean válidos
    if (actualizaciones.permisos && actualizaciones.rol === 'COMITE') {
      actualizaciones.permisos = {
        anuncios: actualizaciones.permisos.anuncios || false,
        gastos: actualizaciones.permisos.gastos || false,
        presupuestos: actualizaciones.permisos.presupuestos || false,
        cuotas: actualizaciones.permisos.cuotas || false,
        usuarios: actualizaciones.permisos.usuarios || false,
        cierres: actualizaciones.permisos.cierres || false
      };
    } else if (actualizaciones.rol === 'ADMIN') {
      // Si se cambia el rol a ADMIN, asignar todos los permisos
      actualizaciones.permisos = {
        anuncios: true,
        gastos: true,
        presupuestos: true,
        cuotas: true,
        usuarios: true,
        cierres: true
      };
    } else if (actualizaciones.rol === 'INQUILINO') {
      // Si se cambia el rol a INQUILINO, eliminar permisos
      actualizaciones.permisos = {};
    }
    
    return updateItem('usuarios', id, actualizaciones);
  }
  
  // Método para cambiar contraseña
  static async cambiarPassword(id, passwordActual, passwordNueva) {
    try {
      const data = readData();
      const usuario = data.usuarios.find(u => u.id === id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
      
      if (!passwordValida) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordNueva, salt);
      
      // Actualizar contraseña
      return updateItem('usuarios', id, { password: hashedPassword });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
  
  // Método para eliminar un usuario
  static eliminar(id) {
    return deleteItem('usuarios', id);
  }
  
  // Método para validar credenciales
  static async validarCredenciales(email, password) {
    try {
      const usuario = Usuario.obtenerPorEmail(email);
      
      if (!usuario) {
        return null;
      }
      
      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValida) {
        return null;
      }
      
      // Retornar usuario sin contraseña
      const { password: _, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    } catch (error) {
      console.error('Error al validar credenciales:', error);
      throw error;
    }
  }
  
  // Métodos alias para compatibilidad con controladores existentes
  static getByEmail(email) {
    return Usuario.obtenerPorEmail(email);
  }
  
  static async validatePassword(usuario, password) {
    try {
      return await bcrypt.compare(password, usuario.password);
    } catch (error) {
      console.error('Error al validar contraseña:', error);
      return false;
    }
  }
  
  static async create(userData) {
    return Usuario.crear(userData);
  }
  
  static getById(id) {
    return Usuario.obtenerPorId(id);
  }
  
  // Método para verificar si un usuario tiene un permiso específico
  static tienePermiso(usuario, permiso) {
    // Administradores tienen todos los permisos
    if (usuario.rol === 'ADMIN') {
      return true;
    }
    
    // Miembros del comité tienen permisos específicos
    if (usuario.rol === 'COMITE' && usuario.permisos) {
      return usuario.permisos[permiso] === true;
    }
    
    // Inquilinos no tienen permisos administrativos
    return false;
  }
}

export default Usuario;