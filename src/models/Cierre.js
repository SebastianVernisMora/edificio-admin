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
    const cuotasPagadas = cuotas.filter(c => c.estado === 'PAGADO');
    const cuotasPendientes = cuotas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDO');
    
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
    
    // Generar cuotas para el año siguiente
    const añoSiguiente = parseInt(año) + 1;
    try {
      console.log(`📅 Generando cuotas para el año ${añoSiguiente}...`);
      const cuotasGeneradas = await programarCuotasAnuales(añoSiguiente);
      console.log(`✅ ${cuotasGeneradas} cuotas generadas para ${añoSiguiente}`);
    } catch (error) {
      if (error.message && error.message.includes('Ya existen cuotas')) {
        console.log(`ℹ️ Las cuotas para ${añoSiguiente} ya estaban generadas`);
      } else {
        console.error(`❌ Error generando cuotas para ${añoSiguiente}:`, error.message);
        // No lanzamos el error para no impedir el cierre anual
      }
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
        mensaje: `Cuotas para ${añoSiguiente} generadas automáticamente`
      },
      createdAt: new Date().toISOString()
    };
    
    console.log(`✅ Cierre anual de ${año} completado con balance: $${cierreAnual.balance}`);
    
    return create(COLLECTION, cierreAnual);
  }
}