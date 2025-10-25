import jwt from 'jsonwebtoken';
import { getData } from '../data.js';

export const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ mensaje: 'No se proporcionó token de autorización' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = getData();
    const usuario = data.usuarios.find(u => u.id === decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    req.usuario = { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol,
      departamento: usuario.departamento
    };
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

export const requiereAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

export const requiereInquilinoOAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'inquilino') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  next();
};