import { getAll, getById, create } from '../data.js';
import Cuota from './Cuota.js';
import Gasto from './Gasto.js';
import Fondo from './Fondo.js';
import { programarCuotasAnuales } from '../utils/cuotasInicializacion.js';

const COLLECTION = 'cierres';

export default class Cierre {
  static async getAll() {
    return getAll(COLLECTION);
  }
  
  static async getById(id) {
    return getById(COLLECTION, id);
  }
  
  static async getByMesAño(mes, año) {
    const cierres = getAll(COLLECTION);
    return cierres.find(c => c.mes === mes && c.año === parseInt(año));
  }
  
  static async realizarCierreMensual(mes, año) {
    // Verificar si ya existe un cierre para este mes/año
    const cierreExistente = await this.getByMesAño(mes, año);
    if (cierreExistente) {
      throw new Error(`Ya existe un cierre para ${mes} ${año}`);
    }
    
    // Obtener cuotas del mes
    const cuotas = Cuota.obtenerPorMesAnio(mes, año);
    
    // NUEVO: Vencer todas las cuotas PENDIENTES del mes al realizar el cierre
    console.log(`📅 Venciendo cuotas pendientes de ${mes} ${año}...`);
    let cuotasVencidas = 0;
    
    for (const cuota of cuotas) {
      if (cuota.estado === 'PENDIENTE') {
        try {
          const actualizada = Cuota.actualizarEstado(cuota.id, 'VENCIDO');
          if (actualizada) {
            cuotasVencidas++;
          }
        } catch (error) {
          console.error(`Error venciendo cuota ${cuota.id}:`, error);
        }
      }
    }
    
    if (cuotasVencidas > 0) {
      console.log(`✅ ${cuotasVencidas} cuotas marcadas como vencidas en ${mes} ${año}`);
    }
    
    // Obtener cuotas actualizadas después del vencimiento
    const cuotasActualizadas = Cuota.obtenerPorMesAnio(mes, año);
    const cuotasPagadas = cuotasActualizadas.filter(c => c.estado === 'PAGADO');
    const cuotasPendientes = cuotasActualizadas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDO');
    
    // Calcular ingresos por cuotas
    const ingresosCuotas = cuotasPagadas.reduce((total, cuota) => total + cuota.monto, 0);
    
    // Obtener gastos del mes (convertir nombre de mes a número)
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const numeroMes = meses.indexOf(mes) + 1; // 1-12
    
    const gastos = await Gasto.getByMesAño(numeroMes, año);
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.monto, 0);
    
    // Obtener estado de fondos
    const fondos = await Fondo.getFondos();
    
    // Crear objeto de cierre
    const nuevoCierre = {
      id: `cierre_${mes}_${año}`,
      mes,
      año,
      fecha: new Date().toISOString(),
      ingresos: {
        cuotas: ingresosCuotas,
        otros: 0,
        total: ingresosCuotas
      },
      gastos: {
        total: totalGastos,
        desglose: gastos.map(g => ({
          id: g.id,
          concepto: g.concepto,
          monto: g.monto,
          categoria: g.categoria
        }))
      },
      fondos: {
        ahorroAcumulado: fondos.ahorroAcumulado,
        gastosMayores: fondos.gastosMayores,
        dineroOperacional: fondos.dineroOperacional,
        patrimonioTotal: fondos.patrimonioTotal
      },
      cuotasPendientes: cuotasPendientes.length,
      cuotasPagadas: cuotasPagadas.length,
      balance: ingresosCuotas - totalGastos,
      createdAt: new Date().toISOString()
    };
    
    return create(COLLECTION, nuevoCierre);
  }
  
  static async realizarCierreAnual(año) {
    const cierres = getAll(COLLECTION);
    const cierresAnuales = cierres.filter(c => c.año === parseInt(año));
    
    if (cierresAnuales.length === 0) {
      throw new Error(`No hay cierres mensuales para el año ${año}`);
    }
    
    console.log(`🔄 Realizando cierre anual para ${año}...`);
    
    // Calcular totales anuales
    const totalIngresos = cierresAnuales.reduce((total, cierre) => total + cierre.ingresos.total, 0);
    const totalGastos = cierresAnuales.reduce((total, cierre) => total + cierre.gastos.total, 0);
    
    // Obtener estado actual de fondos
    const fondos = await Fondo.getFondos();
    
    // Generar cuotas para los 12 meses del año siguiente
    const añoSiguiente = parseInt(año) + 1;
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let cuotasGeneradasTotal = 0;
    let mensajeGeneracion = '';
    
    try {
      console.log(`📅 Generando cuotas completas para el año ${añoSiguiente}...`);
      
      // Generar cuotas para cada uno de los 12 meses
      for (const mes of meses) {
        try {
          // Verificar si ya existen cuotas para este mes
          const cuotasExistentes = Cuota.obtenerPorMesAnio(mes, añoSiguiente);
          
          if (cuotasExistentes.length === 0) {
            // Generar cuotas para este mes usando la función de programación
            const cuotasMes = await programarCuotasAnuales(añoSiguiente);
            cuotasGeneradasTotal += cuotasMes;
            console.log(`✅ Generadas cuotas para ${mes} ${añoSiguiente}`);
          } else {
            console.log(`ℹ️ Ya existen cuotas para ${mes} ${añoSiguiente}`);
          }
        } catch (error) {
          console.error(`❌ Error generando cuotas para ${mes} ${añoSiguiente}:`, error.message);
        }
      }
      
      // Verificar que se generaron cuotas para todos los 12 meses
      const cuotasVerificacion = [];
      for (const mes of meses) {
        const cuotasMes = Cuota.obtenerPorMesAnio(mes, añoSiguiente);
        cuotasVerificacion.push({
          mes,
          cantidad: cuotasMes.length
        });
      }
      
      const mesesConCuotas = cuotasVerificacion.filter(m => m.cantidad > 0).length;
      mensajeGeneracion = `Cuotas verificadas para ${mesesConCuotas}/12 meses de ${añoSiguiente}`;
      
      console.log(`✅ ${mensajeGeneracion}`);
      
    } catch (error) {
      console.error(`❌ Error en generación de cuotas para ${añoSiguiente}:`, error.message);
      mensajeGeneracion = `Error parcial en generación de cuotas para ${añoSiguiente}`;
    }
    
    // Crear objeto de cierre anual
    const cierreAnual = {
      id: `cierre_anual_${año}`,
      tipo: 'ANUAL',
      año: parseInt(año),
      fecha: new Date().toISOString(),
      ingresos: {
        total: totalIngresos,
        desgloseMensual: cierresAnuales.map(c => ({
          mes: c.mes,
          total: c.ingresos.total
        }))
      },
      gastos: {
        total: totalGastos,
        desgloseMensual: cierresAnuales.map(c => ({
          mes: c.mes,
          total: c.gastos.total
        }))
      },
      fondos: {
        ahorroAcumulado: fondos.ahorroAcumulado,
        gastosMayores: fondos.gastosMayores,
        dineroOperacional: fondos.dineroOperacional,
        patrimonioTotal: fondos.patrimonioTotal
      },
      balance: totalIngresos - totalGastos,
      cuotasSiguienteAño: {
        año: añoSiguiente,
        generadas: true,
        cuotasGeneradas: cuotasGeneradasTotal,
        mensaje: mensajeGeneracion
      },
      createdAt: new Date().toISOString()
    };
    
    console.log(`✅ Cierre anual de ${año} completado con balance: ${cierreAnual.balance}`);
    
    return create(COLLECTION, cierreAnual);
  }
}