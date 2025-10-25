import { Cierre } from '../models/Cierre.js';
import { Cuota } from '../models/Cuota.js';
import { Gasto } from '../models/Gasto.js';

export const cierreController = {
  // Obtener todos los cierres
  obtenerTodos: (req, res) => {
    try {
      const cierres = Cierre.obtenerTodos();
      res.json(cierres);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener cierres', error: error.message });
    }
  },

  // Obtener cierre por ID
  obtenerPorId: (req, res) => {
    try {
      const { id } = req.params;
      const cierre = Cierre.obtenerPorId(id);
      
      if (!cierre) {
        return res.status(404).json({ mensaje: 'Cierre no encontrado' });
      }
      
      res.json(cierre);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener cierre', error: error.message });
    }
  },

  // Crear nuevo cierre
  crear: async (req, res) => {
    try {
      const { periodo, tipo, incluir_saldos_fondos } = req.body;

      // Validaciones
      if (!periodo || !tipo) {
        return res.status(400).json({ 
          mensaje: 'Faltan campos obligatorios: periodo y tipo' 
        });
      }

      if (!['mensual', 'anual'].includes(tipo)) {
        return res.status(400).json({ 
          mensaje: 'El tipo debe ser "mensual" o "anual"' 
        });
      }

      // Verificar si ya existe un cierre para este período y tipo
      if (Cierre.existeCierre(periodo, tipo)) {
        return res.status(400).json({ 
          mensaje: `Ya existe un cierre ${tipo} para el período ${periodo}` 
        });
      }

      // Calcular fechas según el tipo de cierre
      let fechaInicio, fechaFin;
      if (tipo === 'mensual') {
        fechaInicio = `${periodo}-01`;
        const fecha = new Date(periodo + '-01');
        fecha.setMonth(fecha.getMonth() + 1);
        fecha.setDate(0); // Último día del mes
        fechaFin = fecha.toISOString().split('T')[0];
      } else { // anual
        fechaInicio = `${periodo}-01-01`;
        fechaFin = `${periodo}-12-31`;
      }

      // Calcular ingresos (cuotas pagadas en el período)
      const cuotasPagadas = await this.obtenerCuotasPagadasPeriodo(fechaInicio, fechaFin);
      const totalIngresos = cuotasPagadas.reduce((sum, c) => sum + c.monto, 0);

      // Calcular egresos (gastos del período)
      const gastosPeriodo = Gasto.obtenerPorPeriodo(fechaInicio, fechaFin);
      const totalEgresos = gastosPeriodo.reduce((sum, g) => sum + g.monto, 0);

      // Calcular saldo
      const saldoPeriodo = totalIngresos - totalEgresos;

      // Preparar detalles
      const detalles = {
        periodo_inicio: fechaInicio,
        periodo_fin: fechaFin,
        cuotas_pagadas: cuotasPagadas.length,
        gastos_registrados: gastosPeriodo.length,
        ingresos_detalle: {
          cuotas_mensuales: cuotasPagadas.filter(c => c.tipo_cuota !== 'fondo_mayor').reduce((sum, c) => sum + c.monto, 0),
          fondo_gastos_mayores: cuotasPagadas.filter(c => c.tipo_cuota === 'fondo_mayor').reduce((sum, c) => sum + c.monto, 0)
        },
        gastos_por_categoria: this.agruparGastosPorCategoria(gastosPeriodo)
      };

      // Agregar saldos de fondos si se solicita
      if (incluir_saldos_fondos) {
        detalles.saldos_fondos = await this.calcularSaldosFondos();
      }

      const datosCircre = {
        periodo,
        tipo,
        fecha_cierre: new Date().toISOString(),
        ingresos: totalIngresos,
        egresos: totalEgresos,
        saldo: saldoPeriodo,
        detalles
      };

      const nuevoCierre = Cierre.crear(datosCircre);
      res.status(201).json(nuevoCierre);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear cierre', error: error.message });
    }
  },

  // Obtener estadísticas de cierres
  obtenerEstadisticas: (req, res) => {
    try {
      const { año } = req.query;
      
      if (!año) {
        return res.status(400).json({ mensaje: 'Se requiere el parámetro año' });
      }

      const estadisticas = Cierre.obtenerEstadisticasAnuales(año);
      const cierresMensuales = Cierre.obtenerPorTipo('mensual').filter(c => 
        c.fecha_cierre.includes(año)
      );
      const cierresAnuales = Cierre.obtenerPorTipo('anual').filter(c => 
        c.fecha_cierre.includes(año)
      );

      const respuesta = {
        año,
        estadisticas_generales: estadisticas,
        cierres_mensuales: cierresMensuales,
        cierres_anuales: cierresAnuales,
        resumen: {
          total_cierres_mensuales: cierresMensuales.length,
          total_cierres_anuales: cierresAnuales.length,
          promedio_ingresos_mensuales: cierresMensuales.length > 0 ? 
            cierresMensuales.reduce((sum, c) => sum + c.ingresos, 0) / cierresMensuales.length : 0,
          promedio_egresos_mensuales: cierresMensuales.length > 0 ? 
            cierresMensuales.reduce((sum, c) => sum + c.egresos, 0) / cierresMensuales.length : 0
        }
      };

      res.json(respuesta);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener estadísticas de cierres', error: error.message });
    }
  },

  // Métodos auxiliares
  obtenerCuotasPagadasPeriodo: async (fechaInicio, fechaFin) => {
    // Esta función debería usar el modelo Cuota para obtener las cuotas pagadas
    // Por ahora simulamos con datos
    return [];
  },

  agruparGastosPorCategoria: (gastos) => {
    const agrupados = {};
    gastos.forEach(gasto => {
      if (!agrupados[gasto.categoria]) {
        agrupados[gasto.categoria] = {
          total: 0,
          cantidad: 0,
          gastos: []
        };
      }
      agrupados[gasto.categoria].total += gasto.monto;
      agrupados[gasto.categoria].cantidad += 1;
      agrupados[gasto.categoria].gastos.push({
        concepto: gasto.concepto,
        monto: gasto.monto,
        fecha: gasto.fecha_gasto
      });
    });
    return agrupados;
  },

  calcularSaldosFondos: async () => {
    // Calcular saldos actuales de los fondos
    const fondoOperacional = 48000; // Datos base
    const fondoAhorro = 67500;
    const fondoGastosMayores = 125000;
    
    // Restar gastos de cada fondo
    const gastosOperacional = Gasto.obtenerTotalPorFondo('fondo_operacional');
    const gastosGastosMayores = Gasto.obtenerTotalPorFondo('fondo_gastos_mayores');
    
    return {
      fondo_operacional: fondoOperacional - gastosOperacional,
      fondo_ahorro_acumulado: fondoAhorro,
      fondo_gastos_mayores: fondoGastosMayores - gastosGastosMayores,
      patrimonio_total: (fondoOperacional - gastosOperacional) + fondoAhorro + (fondoGastosMayores - gastosGastosMayores)
    };
  }
};