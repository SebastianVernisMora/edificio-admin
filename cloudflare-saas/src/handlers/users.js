/**
 * Users management handlers
 */
import { addCorsHeaders } from '../middleware/cors';
import User from '../models/User';
import Building from '../models/Building';
import { verifySameBuilding } from '../middleware/auth';
import { sendInvitationEmail } from '../utils/email';

// Crear un nuevo usuario para un edificio
export async function create(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Verificar autenticación (middleware verifyToken ya añadió user a la solicitud)
    const { user } = request;
    
    // Obtener ID del edificio de los parámetros
    const buildingId = parseInt(request.params.id);
    if (isNaN(buildingId)) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'ID de edificio no válido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Verificar que el usuario tenga acceso a este edificio
    const verifyResult = verifySameBuilding(request);
    if (verifyResult instanceof Response) {
      return addCorsHeaders(verifyResult, request);
    }

    // Verificar que el usuario tenga permisos para gestionar usuarios
    const userDetails = await User.getById(request.db, user.id);
    const buildingUserInfo = userDetails.buildings.find(b => b.building_id === buildingId);
    
    if (user.role !== 'owner' && (!buildingUserInfo || buildingUserInfo.role !== 'admin')) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para gestionar usuarios en este edificio'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Obtener el edificio
    const building = await Building.getById(request.db, buildingId);
    if (!building) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Edificio no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { 
      name, 
      email, 
      role,
      unit,
      phone,
      permissions
    } = data;
    
    // Validación básica
    if (!name || !email || !role) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Nombre, email y rol son campos requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Validar que el rol sea válido
    const validRoles = ['admin', 'committee', 'resident'];
    if (!validRoles.includes(role)) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Rol no válido. Debe ser: admin, committee o resident'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Si es residente, validar la unidad/departamento
    if (role === 'resident' && !unit) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Para residentes, el número de unidad/departamento es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Verificar si el usuario ya existe
    let newUser;
    const existingUser = await User.getByEmail(request.db, email);
    
    if (existingUser) {
      // Verificar si ya está asociado al edificio
      const userDetails = await User.getById(request.db, existingUser.id);
      const alreadyInBuilding = userDetails.buildings.some(b => b.building_id === buildingId);
      
      if (alreadyInBuilding) {
        return addCorsHeaders(new Response(JSON.stringify({
          success: false,
          message: 'Este usuario ya está asociado al edificio'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }), request);
      }
      
      // Si existe pero no está en el edificio, asociarlo
      // Generar contraseña temporal si no la tiene
      const tempPassword = existingUser.verification_token ? null : generateTemporaryPassword();
      
      if (tempPassword) {
        // Actualizar la contraseña del usuario existente
        await User.changePassword(request.db, existingUser.id, tempPassword);
      }
      
      // Crear usuario a partir del existente
      newUser = existingUser;
    } else {
      // Crear un nuevo usuario
      const tempPassword = generateTemporaryPassword();
      
      newUser = await User.create(request.db, {
        name,
        email,
        password: tempPassword,
        role: 'user',  // Rol global básico
        unit,
        phone,
        building_id: buildingId,
        permissions: role === 'committee' ? permissions : undefined
      });
      
      // Enviar email de invitación con la contraseña temporal
      try {
        await sendInvitationEmail(env, {
          email,
          name,
          buildingName: building.name,
          role,
          tempPassword,
          invitedBy: userDetails.name
        });
      } catch (emailError) {
        console.error('Error enviando email de invitación:', emailError);
        // No fallamos la creación si falla el envío de email
      }
    }

    // Asociar usuario al edificio con el rol específico
    await request.db.prepare(`
      INSERT INTO building_users (
        building_id, user_id, role, permissions, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      buildingId,
      newUser.id,
      role,
      role === 'committee' && permissions ? JSON.stringify(permissions) : null
    )
    .run();

    // Obtener el usuario completo
    const createdUser = await User.getById(request.db, newUser.id);

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Usuario creado y asociado al edificio exitosamente',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role,  // Rol específico en este edificio
        unit: unit || null,
        phone: phone || null,
        permissions: role === 'committee' ? permissions : {}
      },
      email_sent: true
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error creando usuario:', error);
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

// Listar usuarios de un edificio
export async function list(request, env) {
  try {
    // Verificar autenticación
    const { user } = request;
    
    // Obtener ID del edificio de los parámetros
    const buildingId = parseInt(request.params.id);
    if (isNaN(buildingId)) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'ID de edificio no válido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Verificar que el usuario tenga acceso a este edificio
    const verifyResult = verifySameBuilding(request);
    if (verifyResult instanceof Response) {
      return addCorsHeaders(verifyResult, request);
    }

    // Obtener parámetros de consulta (para filtrado)
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Obtener usuarios del edificio
    const users = await User.listByBuilding(request.db, buildingId, {
      role,
      limit,
      offset
    });

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        unit: u.unit,
        phone: u.phone,
        permissions: u.permissions,
        created_at: u.created_at,
        active: u.active,
        email_verified: u.email_verified
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error listando usuarios:', error);
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

// Actualizar un usuario de un edificio
export async function update(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'PUT') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'PUT' }
      });
    }
    
    // Verificar autenticación
    const { user } = request;
    
    // Obtener IDs de los parámetros
    const buildingId = parseInt(request.params.id);
    const userId = parseInt(request.params.userId);
    if (isNaN(buildingId) || isNaN(userId)) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'IDs no válidos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Verificar que el usuario tenga acceso a este edificio
    const verifyResult = verifySameBuilding(request);
    if (verifyResult instanceof Response) {
      return addCorsHeaders(verifyResult, request);
    }

    // Verificar que el usuario tenga permisos para gestionar usuarios
    const userDetails = await User.getById(request.db, user.id);
    const buildingUserInfo = userDetails.buildings.find(b => b.building_id === buildingId);
    
    if (user.role !== 'owner' && (!buildingUserInfo || buildingUserInfo.role !== 'admin')) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para gestionar usuarios en este edificio'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Verificar que el usuario a actualizar existe y está en el edificio
    const targetUser = await User.getById(request.db, userId);
    if (!targetUser) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    const targetUserInBuilding = targetUser.buildings.find(b => b.building_id === buildingId);
    if (!targetUserInBuilding) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'El usuario no pertenece a este edificio'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { 
      name, 
      email, 
      role,
      unit,
      phone,
      permissions,
      active
    } = data;
    
    // Crear objeto de actualizaciones
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email.toLowerCase();
    if (phone !== undefined) userUpdates.phone = phone;
    if (unit !== undefined) userUpdates.unit = unit;
    if (active !== undefined) userUpdates.active = active;
    
    // Aplicar actualizaciones al usuario
    if (Object.keys(userUpdates).length > 0) {
      await User.update(request.db, userId, userUpdates);
    }
    
    // Actualizar la relación usuario-edificio si cambia el rol o permisos
    if (role || permissions) {
      // Validar rol
      if (role) {
        const validRoles = ['admin', 'committee', 'resident'];
        if (!validRoles.includes(role)) {
          return addCorsHeaders(new Response(JSON.stringify({
            success: false,
            message: 'Rol no válido. Debe ser: admin, committee o resident'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }), request);
        }
      }
      
      // Actualizar en la base de datos
      const permissionsJSON = permissions ? JSON.stringify(permissions) : null;
      await request.db.prepare(`
        UPDATE building_users 
        SET role = COALESCE(?, role), 
            permissions = CASE WHEN ? IS NOT NULL THEN ? ELSE permissions END
        WHERE building_id = ? AND user_id = ?
      `)
      .bind(
        role || null,
        permissionsJSON !== null ? 1 : null,
        permissionsJSON,
        buildingId,
        userId
      )
      .run();
    }

    // Obtener el usuario actualizado
    const updatedUser = await User.getById(request.db, userId);
    const updatedUserInBuilding = updatedUser.buildings.find(b => b.building_id === buildingId);

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUserInBuilding.role,
        unit: updatedUser.unit,
        phone: updatedUser.phone,
        permissions: updatedUserInBuilding.permissions || {},
        active: updatedUser.active,
        email_verified: updatedUser.email_verified
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
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

// Eliminar un usuario de un edificio
export async function remove(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'DELETE') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'DELETE' }
      });
    }
    
    // Verificar autenticación
    const { user } = request;
    
    // Obtener IDs de los parámetros
    const buildingId = parseInt(request.params.id);
    const userId = parseInt(request.params.userId);
    if (isNaN(buildingId) || isNaN(userId)) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'IDs no válidos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Verificar que el usuario tenga acceso a este edificio
    const verifyResult = verifySameBuilding(request);
    if (verifyResult instanceof Response) {
      return addCorsHeaders(verifyResult, request);
    }

    // Verificar que el usuario tenga permisos para gestionar usuarios
    const userDetails = await User.getById(request.db, user.id);
    const buildingUserInfo = userDetails.buildings.find(b => b.building_id === buildingId);
    
    if (user.role !== 'owner' && (!buildingUserInfo || buildingUserInfo.role !== 'admin')) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para gestionar usuarios en este edificio'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // No permitir que un usuario se elimine a sí mismo
    if (userId === user.id) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No puede eliminarse a sí mismo'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Verificar que el usuario a eliminar existe y está en el edificio
    const targetUser = await User.getById(request.db, userId);
    if (!targetUser) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    const targetUserInBuilding = targetUser.buildings.find(b => b.building_id === buildingId);
    if (!targetUserInBuilding) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'El usuario no pertenece a este edificio'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Eliminar la relación usuario-edificio
    const removed = await User.removeFromBuilding(request.db, userId, buildingId);
    
    if (!removed) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Error al eliminar el usuario del edificio'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Usuario eliminado del edificio exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
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

// Función auxiliar para generar contraseña temporal
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Generar una contraseña de 10 caracteres
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}