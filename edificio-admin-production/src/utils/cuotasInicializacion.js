import { readData, writeData } from '../data.js';
import Cuota from '../models/Cuota.js';

// Configuración por defecto para las cuotas
const CONFIGURACION_CUOTAS = {
  montoMensual: 550, // Monto por defecto, se puede cambiar
  fechaGeneracion: 1   // Día del mes en que se generan las cuotas
};

/**
 * Obtiene el último día de un mes específico
 */
function obtenerUltimoDiaMes(mes, anio) {
  // Los meses en JavaScript van de 0-11, por eso restamos 1
  const mesIndex = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].indexOf(mes);
    
  // Crear fecha del primer día del siguiente mes y restar un día
  const ultimoDia = new Date(anio, mesIndex + 1, 0);
  return ultimoDia.getDate();
}

/**
 * Genera fecha de vencimiento (último día del mes)
 */
function generarFechaVencimiento(mes, anio) {
  const mesIndex = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].indexOf(mes);
    
  const ultimoDia = obtenerUltimoDiaMes(mes, anio);
  return new Date(anio, mesIndex, ultimoDia, 23, 59, 59).toISOString();
}

/**
 * Obtiene todos los departamentos de inquilinos activos
 */
function obtenerDepartamentosActivos() {
  const data = readData();
  return data.usuarios
    .filter(u => u.rol === 'INQUILINO')
    .map(u => u.departamento)
    .filter((depto, index, arr) => arr.indexOf(depto) === index); // Eliminar duplicados
}

/**
 * Verifica si ya existen cuotas para un mes/año específico
 */
function existenCuotas(mes, anio) {
  const data = readData();
  return data.cuotas.some(c => c.mes === mes && c.anio === anio);
}

/**
 * Genera cuotas para un mes específico
 */
function generarCuotasMes(mes, anio, monto = CONFIGURACION_CUOTAS.montoMensual) {
  const departamentos = obtenerDepartamentosActivos();
  const fechaVencimiento = generarFechaVencimiento(mes, anio);
    
  const cuotasGeneradas = [];
    
  for (const departamento of departamentos) {
    try {
      const nuevaCuota = Cuota.crear({
        mes,
        anio,
        monto,
        fechaVencimiento,
        departamento
      });
            
      if (nuevaCuota) {
        cuotasGeneradas.push(nuevaCuota);
      }
    } catch (error) {
      console.error(`Error generando cuota para departamento ${departamento}:`, error);
    }
  }
    
  return cuotasGeneradas;
}

/**
 * Inicializa las cuotas para el resto del año actual y el año siguiente
 */
export function inicializarCuotasAnuales() {
  console.log('🔧 Inicializando sistema de cuotas...');
    
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
    
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth(); // 0-11
    
  let cuotasGeneradasTotal = 0;
    
  try {
    // Generar cuotas restantes del año actual (2025)
    console.log(`📅 Generando cuotas restantes para ${anioActual}...`);
        
    for (let i = mesActual; i < 12; i++) {
      const nombreMes = meses[i];
            
      if (!existenCuotas(nombreMes, anioActual)) {
        const cuotasGeneradas = generarCuotasMes(nombreMes, anioActual);
        cuotasGeneradasTotal += cuotasGeneradas.length;
        console.log(`✅ Generadas ${cuotasGeneradas.length} cuotas para ${nombreMes} ${anioActual}`);
      } else {
        console.log(`ℹ️  Ya existen cuotas para ${nombreMes} ${anioActual}`);
      }
    }
        
    // Generar todas las cuotas del año siguiente (2026)
    const anioSiguiente = anioActual + 1;
    console.log(`📅 Generando cuotas para ${anioSiguiente}...`);
        
    for (let i = 0; i < 12; i++) {
      const nombreMes = meses[i];
            
      if (!existenCuotas(nombreMes, anioSiguiente)) {
        const cuotasGeneradas = generarCuotasMes(nombreMes, anioSiguiente);
        cuotasGeneradasTotal += cuotasGeneradas.length;
        console.log(`✅ Generadas ${cuotasGeneradas.length} cuotas para ${nombreMes} ${anioSiguiente}`);
      } else {
        console.log(`ℹ️  Ya existen cuotas para ${nombreMes} ${anioSiguiente}`);
      }
    }
        
    console.log(`🎉 Sistema de cuotas inicializado. Total: ${cuotasGeneradasTotal} cuotas generadas`);
        
    return {
      success: true,
      cuotasGeneradas: cuotasGeneradasTotal,
      anioActual,
      anioSiguiente
    };
        
  } catch (error) {
    console.error('❌ Error al inicializar cuotas:', error);
    throw error;
  }
}

/**
 * Programa la generación automática de cuotas para años futuros
 * Esta función se debería llamar el 1 de enero de cada año
 */
export function programarCuotasAnuales(anio) {
  console.log(`🔧 Programando cuotas para el año ${anio}...`);
    
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
    
  let cuotasGeneradas = 0;
    
  try {
    for (const mes of meses) {
      if (!existenCuotas(mes, anio)) {
        const cuotasMes = generarCuotasMes(mes, anio);
        cuotasGeneradas += cuotasMes.length;
        console.log(`✅ Generadas ${cuotasMes.length} cuotas para ${mes} ${anio}`);
      }
    }
        
    console.log(`🎉 Cuotas del año ${anio} programadas. Total: ${cuotasGeneradas}`);
    return cuotasGeneradas;
        
  } catch (error) {
    console.error(`❌ Error programando cuotas para ${anio}:`, error);
    throw error;
  }
}

/**
 * Verifica y actualiza cuotas vencidas diariamente
 */
export function actualizarCuotasVencidas() {
  try {
    const actualizadas = Cuota.actualizarVencidas();
    if (actualizadas > 0) {
      console.log(`📅 ${actualizadas} cuotas marcadas como vencidas`);
    }
    return actualizadas;
  } catch (error) {
    console.error('❌ Error actualizando cuotas vencidas:', error);
    throw error;
  }
}

/**
 * Función para verificar el estado del sistema de cuotas
 */
export function verificarEstadoCuotas() {
  const data = readData();
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const anioSiguiente = anioActual + 1;
    
  const estadisticas = {
    anioActual: {
      total: data.cuotas.filter(c => c.anio === anioActual).length,
      pendientes: data.cuotas.filter(c => c.anio === anioActual && c.estado === 'PENDIENTE').length,
      pagadas: data.cuotas.filter(c => c.anio === anioActual && c.estado === 'PAGADO').length,
      vencidas: data.cuotas.filter(c => c.anio === anioActual && c.estado === 'VENCIDO').length
    },
    anioSiguiente: {
      total: data.cuotas.filter(c => c.anio === anioSiguiente).length,
      pendientes: data.cuotas.filter(c => c.anio === anioSiguiente && c.estado === 'PENDIENTE').length,
      pagadas: data.cuotas.filter(c => c.anio === anioSiguiente && c.estado === 'PAGADO').length,
      vencidas: data.cuotas.filter(c => c.anio === anioSiguiente && c.estado === 'VENCIDO').length
    },
    departamentosActivos: obtenerDepartamentosActivos().length
  };
    
  console.log('📊 Estado del sistema de cuotas:');
  console.log(`   ${anioActual}: ${estadisticas.anioActual.total} cuotas (${estadisticas.anioActual.pendientes} pendientes, ${estadisticas.anioActual.pagadas} pagadas, ${estadisticas.anioActual.vencidas} vencidas)`);
  console.log(`   ${anioSiguiente}: ${estadisticas.anioSiguiente.total} cuotas (${estadisticas.anioSiguiente.pendientes} pendientes)`);
  console.log(`   Departamentos activos: ${estadisticas.departamentosActivos}`);
    
  return estadisticas;
}

export default {
  inicializarCuotasAnuales,
  programarCuotasAnuales,
  actualizarCuotasVencidas,
  verificarEstadoCuotas
};