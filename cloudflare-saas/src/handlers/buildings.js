/**
 * Buildings/Condominiums handlers
 */
import { addCorsHeaders } from '../middleware/cors';
import Building from '../models/Building';
import User from '../models/User';
import { verifySameBuilding } from '../middleware/auth';

// Crear un nuevo edificio/condominio
export async function create(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Verificar autenticación (el middleware verifyToken ya añadió user a la solicitud)
    const { user } = request;

    // Verificar que el usuario tenga permiso para crear edificios (debe ser owner)
    if (user.role !== 'owner') {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para crear edificios'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { 
      name, 
      address, 
      units,
      subscription_id = null
    } = data;
    
    // Validación básica
    if (!name || !address || !units) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Nombre, dirección y número de unidades son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Crear edificio en la base de datos
    const building = await Building.create(request.db, {
      name,
      address,
      units: parseInt(units),
      owner_id: user.id,
      subscription_id,
      subscription_status: subscription_id ? 'active' : 'pending'
    });

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Edificio creado exitosamente',
      building
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error creando edificio:', error);
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

// Listar edificios del usuario
export async function list(request, env) {
  try {
    // Verificar autenticación
    const { user } = request;

    let buildings = [];
    
    // Si es propietario/owner, puede ver todos sus edificios
    if (user.role === 'owner') {
      buildings = await Building.list(request.db, { owner_id: user.id });
    } else {
      // Para otros roles, obtener edificios asociados del usuario
      const userDetails = await User.getById(request.db, user.id);
      if (userDetails && userDetails.buildings) {
        // Obtener los IDs de los edificios
        const buildingIds = userDetails.buildings.map(b => b.building_id);
        
        // Obtener detalles completos de cada edificio
        for (const id of buildingIds) {
          const building = await Building.getById(request.db, id);
          if (building) {
            buildings.push({
              ...building,
              role: userDetails.buildings.find(b => b.building_id === id).role
            });
          }
        }
      }
    }

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      buildings
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error listando edificios:', error);
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

// Obtener detalles de un edificio
export async function getDetails(request, env) {
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
    
    // Verificar si el usuario tiene acceso a este edificio
    const verifyResult = verifySameBuilding(request);
    if (verifyResult instanceof Response) {
      return addCorsHeaders(verifyResult, request);
    }

    // Obtener detalles del edificio
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
    
    // Obtener estadísticas del edificio
    const stats = await Building.getStats(request.db, buildingId);

    // Obtener rol del usuario en este edificio
    const userDetails = await User.getById(request.db, user.id);
    const buildingUserInfo = userDetails.buildings.find(b => b.building_id === buildingId);
    
    // Combinar la información
    const response = {
      ...building,
      role: buildingUserInfo ? buildingUserInfo.role : null,
      permissions: buildingUserInfo ? buildingUserInfo.permissions : {},
      stats
    };

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      building: response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error obteniendo detalles del edificio:', error);
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

// Actualizar un edificio
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
    
    // Obtener el edificio actual
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
    
    // Verificar que el usuario sea propietario o admin del edificio
    const userDetails = await User.getById(request.db, user.id);
    const buildingUserInfo = userDetails.buildings.find(b => b.building_id === buildingId);
    
    if (user.role !== 'owner' && (!buildingUserInfo || buildingUserInfo.role !== 'admin')) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para actualizar este edificio'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { 
      name, 
      address, 
      units,
      logo_url,
      custom_domain,
      settings
    } = data;
    
    // Crear objeto de actualizaciones
    const updates = {};
    
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (units && !isNaN(parseInt(units))) updates.units = parseInt(units);
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (custom_domain !== undefined) updates.custom_domain = custom_domain;
    if (settings !== undefined) updates.settings = settings;
    
    // Verificar que haya al menos un campo para actualizar
    if (Object.keys(updates).length === 0) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No se proporcionaron campos válidos para actualizar'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Actualizar el edificio
    const updatedBuilding = await Building.update(request.db, buildingId, updates);
    
    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Edificio actualizado exitosamente',
      building: updatedBuilding
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error actualizando edificio:', error);
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

// Eliminar un edificio
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
    
    // Obtener el edificio actual
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
    
    // Verificar que el usuario sea el propietario (solo el propietario puede eliminar)
    if (user.role !== 'owner' || building.owner_id !== user.id) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No tiene permisos para eliminar este edificio'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Eliminar el edificio
    const deleted = await Building.delete(request.db, buildingId);
    
    if (!deleted) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Error al eliminar el edificio'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Edificio eliminado exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error eliminando edificio:', error);
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