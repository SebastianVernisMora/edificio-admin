import bcrypt from 'bcryptjs';
import { readData, writeData } from './src/data.js';
import Usuario from './src/models/Usuario.js';

async function createComiteUser() {
  try {
    console.log('Creando usuario de prueba con rol COMITE...');
    
    // Datos del usuario
    const userData = {
      nombre: 'Comité de Prueba',
      email: 'comite@edificio205.com',
      password: 'Gemelo1',
      departamento: '101',
      rol: 'COMITE',
      permisos: {
        anuncios: true,
        gastos: true,
        presupuestos: false,
        cuotas: true,
        usuarios: false,
        cierres: false
      }
    };
    
    // Verificar si el usuario ya existe
    const data = readData();
    const existeEmail = data.usuarios.some(u => u.email === userData.email);
    
    if (existeEmail) {
      console.log('El usuario ya existe. Actualizando permisos...');
      
      // Encontrar el usuario y actualizar sus permisos
      const usuarioIndex = data.usuarios.findIndex(u => u.email === userData.email);
      
      if (usuarioIndex !== -1) {
        data.usuarios[usuarioIndex].rol = 'COMITE';
        data.usuarios[usuarioIndex].permisos = userData.permisos;
        
        // Guardar cambios
        writeData(data);
        console.log('Usuario actualizado exitosamente.');
        console.log('Permisos asignados:', userData.permisos);
      }
    } else {
      // Crear nuevo usuario
      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Crear nuevo usuario con contraseña hasheada
      const nuevoUsuario = {
        id: Date.now(),
        nombre: userData.nombre,
        email: userData.email,
        password: hashedPassword,
        departamento: userData.departamento,
        rol: userData.rol,
        permisos: userData.permisos,
        fechaCreacion: new Date().toISOString(),
        activo: true
      };
      
      // Agregar a la base de datos
      data.usuarios.push(nuevoUsuario);
      writeData(data);
      
      console.log('Usuario creado exitosamente.');
      console.log('Email:', userData.email);
      console.log('Contraseña:', userData.password);
      console.log('Rol:', userData.rol);
      console.log('Permisos asignados:', userData.permisos);
    }
    
    console.log('Proceso completado.');
  } catch (error) {
    console.error('Error al crear usuario de comité:', error);
  }
}

// Ejecutar función
createComiteUser();