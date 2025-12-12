/**
 * CORS middleware for Cloudflare Workers
 */

// Función para manejar las solicitudes CORS
export function handleCors(request) {
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'https://edificio-admin.com',
    'https://www.edificio-admin.com',
    'http://localhost:8787', // Para desarrollo local
    'http://127.0.0.1:8787',
  ];
  
  const origin = request.headers.get('Origin');
  const isPreflight = request.method === 'OPTIONS';
  
  // Configurar encabezados CORS
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 horas
  };
  
  // Verificar si el origen está en la lista permitida o permitir todos en desarrollo
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else {
    // Si no está en la lista, permitir cualquier origen
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }
  
  // Manejar solicitud de preflight OPTIONS
  if (isPreflight) {
    return new Response(null, {
      status: 204, // No content
      headers: corsHeaders,
    });
  }
  
  // Para solicitudes no OPTIONS, continuar pero asegurar que los encabezados CORS estén establecidos
  // Añadir los encabezados CORS a la solicitud para que estén disponibles en los manejadores de ruta
  request.corsHeaders = corsHeaders;
}

// Función de utilidad para agregar encabezados CORS a cualquier respuesta
export function addCorsHeaders(response, request) {
  const corsHeaders = request.corsHeaders || {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Crear una nueva respuesta con los encabezados CORS
  const responseWithCors = new Response(response.body, response);
  
  // Añadir encabezados CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    responseWithCors.headers.set(key, value);
  });
  
  return responseWithCors;
}