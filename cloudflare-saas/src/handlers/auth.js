/**
 * Authentication handlers
 */
import { generateToken, revokeToken } from '../middleware/auth';
import User from '../models/User';
import { addCorsHeaders } from '../middleware/cors';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

// Registro de usuario
export async function register(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    
    const { name, email, password, plan_id } = data;
    
    if (!name || !email || !password) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Nombre, email y contraseña son campos requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Comprobar si el email ya existe
    const existingUser = await User.getByEmail(request.db, email);
    if (existingUser) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Este email ya está registrado'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Crear usuario (el modelo User se encarga del hash de la contraseña)
    const user = await User.create(request.db, {
      name,
      email,
      password,
      role: 'owner' // El primer usuario es propietario/super-admin
    });

    // Generar token de sesión
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      buildings: [] // Inicialmente sin edificios
    }, env);

    // Almacenar información del plan seleccionado en KV para el proceso de onboarding
    if (plan_id) {
      await env.SESSIONS.put(`onboarding:${user.id}`, JSON.stringify({
        step: 'plan_selected',
        plan_id,
        completed: false,
        timestamp: Date.now()
      }), {expirationTtl: 86400 * 7}); // Expira en 7 días
    }

    // Enviar email de verificación
    try {
      await sendVerificationEmail(env, user.email, user.name, user.verification_token);
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      // No fallamos el registro si falla el envío de email
    }

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      },
      token,
      onboarding_required: true
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error en registro:', error);
    return addCorsHeaders(new Response(JSON.stringify({
      success: false,
      message: 'Error en el servidor',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  }
}

// Inicio de sesión
export async function login(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    
    const { email, password } = data;
    
    if (!email || !password) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Email y contraseña son campos requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Verificar credenciales
    const user = await User.verifyCredentials(request.db, email, password);
    
    if (!user) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Credenciales inválidas'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Generar token JWT con información del usuario
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      buildings: user.buildings.map(b => b.building_id)
    }, env);

    // Verificar si el usuario necesita completar el onboarding
    let onboardingStatus = null;
    if (user.role === 'owner') {
      // Verificar si hay edificios asociados al usuario
      if (user.buildings.length === 0) {
        // Verificar si hay datos de onboarding en KV
        const onboardingData = await env.SESSIONS.get(`onboarding:${user.id}`);
        if (onboardingData) {
          onboardingStatus = JSON.parse(onboardingData);
        } else {
          onboardingStatus = { 
            step: 'start',
            completed: false,
            timestamp: Date.now()
          };
        }
      }
    }

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
        buildings: user.buildings.map(b => ({
          id: b.building_id,
          name: b.building_name,
          role: b.role
        }))
      },
      token,
      onboarding_required: onboardingStatus !== null,
      onboarding_status: onboardingStatus
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return addCorsHeaders(new Response(JSON.stringify({
      success: false,
      message: 'Error en el servidor',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  }
}

// Cerrar sesión
export async function logout(request, env) {
  try {
    // Obtener token del encabezado
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Token no proporcionado'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    const token = authHeader.split(' ')[1];
    
    // Revocar token (agregarlo a la lista de tokens revocados)
    await revokeToken(token, env);
    
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Sesión cerrada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error en cierre de sesión:', error);
    return addCorsHeaders(new Response(JSON.stringify({
      success: false,
      message: 'Error en el servidor',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  }
}

// Obtener perfil de usuario
export async function getProfile(request, env) {
  try {
    // El middleware verifyToken ya verificó el token y añadió user a la solicitud
    const { user } = request;

    // Obtener información detallada del usuario
    const userDetails = await User.getById(request.db, user.id);
    
    if (!userDetails) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      user: {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        email_verified: userDetails.email_verified,
        created_at: userDetails.created_at,
        last_login: userDetails.last_login,
        buildings: userDetails.buildings.map(b => ({
          id: b.building_id,
          name: b.building_name,
          role: b.role,
          permissions: b.permissions
        }))
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return addCorsHeaders(new Response(JSON.stringify({
      success: false,
      message: 'Error en el servidor',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  }
}

// Verificar email
export async function verifyEmail(request, env) {
  try {
    const token = request.params.token;
    
    if (!token) {
      return new Response('Token no proporcionado', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Verificar token
    const success = await User.verifyEmail(request.db, token);
    
    if (!success) {
      // Redirigir a página de error
      return Response.redirect(`${new URL(request.url).origin}/email-verification-error`, 302);
    }
    
    // Redirigir a página de éxito
    return Response.redirect(`${new URL(request.url).origin}/email-verification-success`, 302);
  } catch (error) {
    console.error('Error verificando email:', error);
    return new Response('Error al verificar el email', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Solicitar restablecimiento de contraseña
export async function resetPassword(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    
    const { email } = data;
    
    if (!email) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Email es un campo requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Generar token de restablecimiento
    const resetResult = await User.requestPasswordReset(request.db, email);
    
    if (!resetResult.success) {
      // No informamos si el email existe o no por seguridad
      return addCorsHeaders(new Response(JSON.stringify({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Enviar email con instrucciones
    try {
      await sendPasswordResetEmail(env, resetResult.email, resetResult.resetToken);
    } catch (emailError) {
      console.error('Error enviando email de restablecimiento:', emailError);
      // No fallamos el endpoint si falla el envío de email
    }

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    return addCorsHeaders(new Response(JSON.stringify({
      success: false,
      message: 'Error en el servidor',
      error: env.ENVIRONMENT === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  }
}