import Usuario from '../models/Usuario.js';
import { generarJWT } from '../middleware/auth.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validar formato de email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        ok: false,
        msg: 'Formato de email inválido'
      });
    }
    
    // Validar que la contraseña no esté vacía
    if (!password || password.length < 3) {
      return res.status(400).json({
        ok: false,
        msg: 'Contraseña requerida'
      });
    }
    
    // Verificar si el email existe
    const usuario = await Usuario.getByEmail(email);
    if (!usuario) {
      console.log(`Intento de login fallido para email: ${email}`);
      return res.status(401).json({
        ok: false,
        msg: 'Credenciales inválidas'
      });
    }
    
    // Verificar la contraseña
    const validPassword = await Usuario.validatePassword(usuario, password);
    if (!validPassword) {
      console.log(`Contraseña incorrecta para usuario: ${email}`);
      return res.status(401).json({
        ok: false,
        msg: 'Credenciales inválidas'
      });
    }
    
    // Log exitoso
    console.log(`Login exitoso para usuario: ${email}`);
    
    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.rol, usuario.departamento);
    
    res.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        departamento: usuario.departamento,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor'
    });
  }
};

export const registro = async (req, res) => {
  const { nombre, email, password, departamento, telefono } = req.body;
  
  try {
    // Validaciones
    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        msg: 'Nombre debe tener al menos 2 caracteres'
      });
    }
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        ok: false,
        msg: 'Email válido requerido'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        ok: false,
        msg: 'Contraseña debe tener al menos 6 caracteres'
      });
    }
    
    if (!departamento) {
      return res.status(400).json({
        ok: false,
        msg: 'Departamento es requerido'
      });
    }
    
    // Verificar si el email ya existe
    const existeEmail = await Usuario.getByEmail(email);
    if (existeEmail) {
      return res.status(409).json({
        ok: false,
        msg: 'El email ya está registrado'
      });
    }
    
    // Crear usuario
    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password,
      departamento,
      telefono: telefono || '',
      rol: 'inquilino'
    });
    
    console.log(`Nuevo usuario registrado: ${email}`);
    
    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.rol, usuario.departamento);
    
    res.status(201).json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        departamento: usuario.departamento,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor'
    });
  }
};

export const renovarToken = async (req, res) => {
  const { usuario } = req;
  
  // Generar nuevo JWT
  const token = await generarJWT(usuario.id, usuario.rol, usuario.departamento);
  
  res.json({
    ok: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      departamento: usuario.departamento,
      rol: usuario.rol
    },
    token
  });
};

export const getPerfil = async (req, res) => {
  const { usuario } = req;
  
  res.json({
    ok: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      departamento: usuario.departamento,
      rol: usuario.rol
    }
  });
};