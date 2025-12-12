/**
 * Subscription and payment handlers
 */
import { addCorsHeaders } from '../middleware/cors';
import Building from '../models/Building';
import { generateRandomId } from '../utils/helpers';

// Estructura de planes disponibles
const SUBSCRIPTION_PLANS = {
  basico: {
    id: 'plan_basico',
    name: 'Plan Básico',
    price: 499,
    units_limit: 20,
    billing_cycle: 'monthly',
    features: [
      'Gestión de cuotas',
      'Registro de gastos',
      'Comunicados',
      'Acceso para residentes'
    ],
    custom: false
  },
  profesional: {
    id: 'plan_profesional',
    name: 'Plan Profesional',
    price: 999,
    units_limit: 50,
    billing_cycle: 'monthly',
    features: [
      'Todo en Plan Básico',
      'Gestión de presupuestos',
      'Notificaciones por email',
      'Reportes mensuales',
      'Roles personalizados'
    ],
    custom: false
  },
  empresarial: {
    id: 'plan_empresarial',
    name: 'Plan Empresarial',
    price: 1999,
    units_limit: 200,
    billing_cycle: 'monthly',
    features: [
      'Todo en Plan Profesional',
      'Múltiples condominios',
      'Dashboard personalizado',
      'API para integraciones',
      'Soporte prioritario'
    ],
    custom: false
  }
};

// Seleccionar un plan
export async function selectPlan(request, env) {
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

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { plan_id } = data;
    
    if (!plan_id) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'ID de plan es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Verificar si el plan existe
    const selectedPlan = Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === plan_id);
    if (!selectedPlan && plan_id !== 'custom') {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Plan no válido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Actualizar información de onboarding en KV
    await env.SESSIONS.put(`onboarding:${user.id}`, JSON.stringify({
      step: 'plan_selected',
      plan_id,
      selectedPlan: selectedPlan || { id: 'custom', name: 'Plan Personalizado' },
      completed: false,
      timestamp: Date.now()
    }), {expirationTtl: 86400 * 7}); // Expira en 7 días

    // Si es un plan personalizado, retornar info diferente
    if (plan_id === 'custom') {
      return addCorsHeaders(new Response(JSON.stringify({
        success: true,
        message: 'Plan personalizado seleccionado',
        next_step: 'custom_plan',
        plan: {
          id: 'custom',
          name: 'Plan Personalizado',
          custom: true
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Plan seleccionado exitosamente',
      next_step: 'checkout',
      plan: selectedPlan
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error seleccionando plan:', error);
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

// Configurar plan personalizado
export async function customPlan(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Verificar autenticación
    const { user } = request;

    // Obtener y validar datos del cuerpo
    const data = await request.json();
    const { 
      units, 
      features = [], 
      billing_cycle = 'monthly'
    } = data;
    
    if (!units || isNaN(parseInt(units))) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Número de unidades es requerido y debe ser un número'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Calcular precio basado en unidades y características seleccionadas
    // (esto sería solo un mockup para esta implementación)
    const unitsNumber = parseInt(units);
    let basePrice = 0;
    
    if (unitsNumber <= 20) {
      basePrice = 499;
    } else if (unitsNumber <= 50) {
      basePrice = 999;
    } else if (unitsNumber <= 100) {
      basePrice = 1499;
    } else {
      basePrice = 1999;
    }
    
    // Adicionar precio por características extra
    const featuresPricing = {
      'notificaciones_email': 100,
      'reportes_avanzados': 150,
      'roles_personalizados': 100,
      'api_integracion': 300,
      'soporte_prioritario': 200,
      'multiple_buildings': 500,
    };
    
    let featuresPrice = 0;
    features.forEach(feature => {
      if (featuresPricing[feature]) {
        featuresPrice += featuresPricing[feature];
      }
    });
    
    // Precio final
    const totalPrice = basePrice + featuresPrice;
    
    // Aplicar descuento si el ciclo es anual
    const finalPrice = billing_cycle === 'annual' 
      ? Math.round(totalPrice * 0.85) // 15% de descuento
      : totalPrice;
    
    // Crear objeto de plan personalizado
    const customPlan = {
      id: `custom_plan_${generateRandomId()}`,
      name: 'Plan Personalizado',
      price: finalPrice,
      units_limit: unitsNumber,
      billing_cycle,
      features: [
        'Gestión de cuotas',
        'Registro de gastos',
        'Comunicados básicos',
        'Acceso para residentes',
        ...features.map(f => featuresPricing[f] ? f.replace('_', ' ') : f)
      ],
      custom: true
    };

    // Actualizar información de onboarding en KV
    await env.SESSIONS.put(`onboarding:${user.id}`, JSON.stringify({
      step: 'custom_plan_configured',
      plan_id: customPlan.id,
      selectedPlan: customPlan,
      completed: false,
      timestamp: Date.now()
    }), {expirationTtl: 86400 * 7}); // Expira en 7 días

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Plan personalizado configurado exitosamente',
      next_step: 'checkout',
      plan: customPlan
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error configurando plan personalizado:', error);
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

// Procesamiento de pago (mockup)
export async function checkout(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Verificar autenticación
    const { user } = request;

    // Obtener datos de onboarding del KV
    const onboardingData = await env.SESSIONS.get(`onboarding:${user.id}`);
    if (!onboardingData) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No hay un plan seleccionado'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    const onboarding = JSON.parse(onboardingData);
    const { selectedPlan } = onboarding;

    // Obtener y validar datos del cuerpo (información de pago)
    const data = await request.json();
    const { 
      payment_method, 
      card_number, 
      card_expiry,
      card_cvc,
      billing_name,
      billing_address
    } = data;
    
    // Validación básica de datos de pago
    if (!payment_method) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Método de pago es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    if (payment_method === 'card') {
      if (!card_number || !card_expiry || !card_cvc || !billing_name) {
        return addCorsHeaders(new Response(JSON.stringify({
          success: false,
          message: 'Información de tarjeta incompleta'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }), request);
      }
      
      // Aquí iría la integración con un procesador de pagos real
      // Por ahora es un mockup que siempre tiene éxito
    }

    // Generar un ID de suscripción y transacción (simulado)
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Actualizar información de onboarding en KV
    await env.SESSIONS.put(`onboarding:${user.id}`, JSON.stringify({
      ...onboarding,
      step: 'payment_completed',
      subscription_id: subscriptionId,
      transaction_id: transactionId,
      payment_method: payment_method,
      billing_name: billing_name,
      completed: false,
      timestamp: Date.now()
    }), {expirationTtl: 86400 * 7}); // Expira en 7 días

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Pago procesado exitosamente',
      next_step: 'building_setup',
      subscription: {
        id: subscriptionId,
        plan: selectedPlan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          return date.toISOString();
        })()
      },
      transaction: {
        id: transactionId,
        amount: selectedPlan.price,
        currency: 'MXN',
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error procesando pago:', error);
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

// Confirmar y completar el proceso de onboarding
export async function confirm(request, env) {
  try {
    // Validar solicitud
    if (request.method !== 'POST') {
      return new Response('Método no permitido', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    // Verificar autenticación
    const { user } = request;

    // Obtener datos de onboarding del KV
    const onboardingData = await env.SESSIONS.get(`onboarding:${user.id}`);
    if (!onboardingData) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'No hay información de onboarding'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }
    
    const onboarding = JSON.parse(onboardingData);
    
    // Verificar que el proceso de pago se completó
    if (onboarding.step !== 'payment_completed') {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Primero debes completar el pago'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }), request);
    }

    // Obtener y validar datos del edificio/condominio
    const data = await request.json();
    const { 
      name, 
      address, 
      units,
      admin_name,
      admin_email
    } = data;
    
    // Validación básica
    if (!name || !address || !units) {
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        message: 'Información del edificio incompleta'
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
      subscription_id: onboarding.subscription_id,
      subscription_status: 'active'
    });

    // Actualizar información de onboarding en KV marcándola como completada
    await env.SESSIONS.put(`onboarding:${user.id}`, JSON.stringify({
      ...onboarding,
      step: 'completed',
      building_id: building.id,
      completed: true,
      timestamp: Date.now()
    }), {expirationTtl: 86400 * 7}); // Mantener para referencia durante 7 días

    // Retornar respuesta
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      message: 'Configuración completada exitosamente',
      building: {
        id: building.id,
        name: building.name,
        address: building.address,
        units: building.units
      },
      subscription: {
        id: onboarding.subscription_id,
        status: 'active',
        plan: onboarding.selectedPlan
      },
      next_url: '/dashboard' // URL a donde redirigir al usuario
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }), request);
  } catch (error) {
    console.error('Error en confirmación de onboarding:', error);
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