import { validationResult } from 'express-validator';

export const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    console.log('Errores de validación:', errores.array());
    return res.status(400).json({
      ok: false,
      msg: 'Errores de validación',
      errores: errores.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitizar entrada HTML para prevenir XSS
export const sanitizarEntrada = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key]
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
  }
  next();
};