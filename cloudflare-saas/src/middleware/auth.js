/**
 * Authentication middleware for Cloudflare Workers
 */

// Función para verificar el token JWT
export async function verifyToken(request, env) {
  // Obtener el token del encabezado Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Acceso no autorizado. Token no proporcionado.' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decodificar y verificar el token
    const { jwtVerify } = await import('jose');
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(env.JWT_SECRET);

    // Verificar el token
    const { payload } = await jwtVerify(token, secretKey);

    // Verificar si el token ha sido revocado (usando KV)
    const isRevoked = await env.SESSIONS.get(`revoked:${token}`);
    if (isRevoked) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Sesión expirada o inválida. Inicie sesión nuevamente.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si la verificación es exitosa, añadir el payload decodificado a la solicitud
    request.user = payload;
    return request;
  } catch (error) {
    console.error('Error verificando token:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Token inválido o expirado',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Función para generar un nuevo token JWT
export async function generateToken(payload, env) {
  const { SignJWT } = await import('jose');
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(env.JWT_SECRET);

  // Configurar las propiedades del token
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')  // Expira en 24 horas
    .sign(secretKey);

  return jwt;
}

// Función para verificar roles y permisos
export function verifyRole(roles = []) {
  return (request) => {
    const { user } = request;
    
    // Verificar si el usuario tiene un rol permitido
    if (roles.length && !roles.includes(user.role)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No tiene permisos para acceder a este recurso' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Si todo está bien, continuar con la solicitud
    return request;
  };
}

// Función para verificar si el usuario pertenece al mismo edificio
export function verifySameBuilding(request) {
  const { user } = request;
  const buildingId = request.params?.id;
  
  // Obtener el ID del edificio de los parámetros de la ruta
  if (!buildingId || !user.buildings.includes(parseInt(buildingId))) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'No tiene acceso a este edificio' 
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return request;
}

// Función para revocar un token (logout)
export async function revokeToken(token, env) {
  // Almacenar el token en la lista de revocados con un TTL de 24 horas
  // Esto es necesario para invalidar tokens antes de su expiración natural
  await env.SESSIONS.put(`revoked:${token}`, 'true', { expirationTtl: 86400 });
  return true;
}