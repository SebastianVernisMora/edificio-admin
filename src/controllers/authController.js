import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { body, validationResult } from 'express-validator';

export const registrar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { nombre, email, password, rol, departamento, telefono } = req.body;

    const usuarioExistente = Usuario.obtenerPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const nuevoUsuario = await Usuario.crear({
      nombre,
      email,
      password,
      rol: rol || 'inquilino',
      departamento,
      telefono
    });

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { email, password } = req.body;

    const usuario = Usuario.obtenerPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const passwordValido = await Usuario.validarPassword(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const perfil = (req, res) => {
  try {
    const usuario = Usuario.obtenerPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const validacionesRegistro = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('departamento').notEmpty().withMessage('El departamento es requerido')
];

export const validacionesLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];