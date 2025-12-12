// Middleware centralizado para manejo de errores
export const errorHandler = (error) => {
  const timestamp = new Date().toISOString();
  
  console.error('Error capturado:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp,
    name: error.name
  });

  // Mapear errores específicos a respuestas HTTP
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      response: {
        ok: false,
        msg: 'Error de validación',
        detalles: error.message
      }
    };
  }

  if (error.name === 'CastError' || error.message.includes('Invalid ID')) {
    return {
      status: 400,
      response: {
        ok: false,
        msg: 'ID inválido'
      }
    };
  }

  if (error.message.includes('not found') || error.message.includes('no encontrado')) {
    return {
      status: 404,
      response: {
        ok: false,
        msg: 'Recurso no encontrado'
      }
    };
  }

  if (error.message.includes('already exists') || error.message.includes('ya existe')) {
    return {
      status: 409,
      response: {
        ok: false,
        msg: 'El recurso ya existe'
      }
    };
  }

  if (error.message.includes('Unauthorized') || error.message.includes('no autorizado')) {
    return {
      status: 401,
      response: {
        ok: false,
        msg: 'No autorizado'
      }
    };
  }

  if (error.message.includes('Forbidden') || error.message.includes('sin permisos')) {
    return {
      status: 403,
      response: {
        ok: false,
        msg: 'Sin permisos para realizar esta acción'
      }
    };
  }

  // Error genérico de servidor
  return {
    status: 500,
    response: {
      ok: false,
      msg: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        timestamp 
      })
    }
  };
};

// Helper para controllers
export const handleControllerError = (error, res, context = '') => {
  const { status, response } = errorHandler(error);
  
  if (context) {
    console.error(`Error en ${context}:`, error.message);
  }
  
  return res.status(status).json(response);
};

// Validaciones comunes
export const validateRequired = (fields, body) => {
  const missing = [];
  
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    const error = new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    error.name = 'ValidationError';
    throw error;
  }
};

export const validateId = (id) => {
  if (!id || isNaN(parseInt(id))) {
    const error = new Error('ID inválido');
    error.name = 'CastError';
    throw error;
  }
  return parseInt(id);
};

export const validateNumber = (value, fieldName) => {
  if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
    const error = new Error(`${fieldName} debe ser un número válido mayor a 0`);
    error.name = 'ValidationError';
    throw error;
  }
  return parseFloat(value);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    const error = new Error('Email inválido');
    error.name = 'ValidationError';
    throw error;
  }
  return email.toLowerCase().trim();
};