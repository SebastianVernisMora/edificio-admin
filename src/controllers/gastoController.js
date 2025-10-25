import { Gasto } from '../models/Gasto.js';

export const gastoController = {
  // Obtener todos los gastos
  obtenerTodos: (req, res) => {
    try {
      const gastos = Gasto.obtenerTodos();
      res.json(gastos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener gastos', error: error.message });
    }
  },

  // Obtener gasto por ID
  obtenerPorId: (req, res) => {
    try {
      const { id } = req.params;
      const gasto = Gasto.obtenerPorId(id);
      
      if (!gasto) {
        return res.status(404).json({ mensaje: 'Gasto no encontrado' });
      }
      
      res.json(gasto);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener gasto', error: error.message });
    }
  },

  // Crear nuevo gasto
  crear: (req, res) => {
    try {
      const { concepto, categoria, proveedor, monto, fecha_gasto, comprobante_url, origen_fondo } = req.body;

      // Validaciones
      if (!concepto || !categoria || !monto || !fecha_gasto) {
        return res.status(400).json({ 
          mensaje: 'Faltan campos obligatorios: concepto, categoria, monto, fecha_gasto' 
        });
      }

      if (monto <= 0) {
        return res.status(400).json({ mensaje: 'El monto debe ser mayor a 0' });
      }

      const datosGasto = {
        concepto,
        categoria,
        proveedor: proveedor || null,
        monto: parseFloat(monto),
        fecha_gasto,
        comprobante_url: comprobante_url || null,
        origen_fondo: origen_fondo || 'fondo_operacional'
      };

      const nuevoGasto = Gasto.crear(datosGasto);
      res.status(201).json(nuevoGasto);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear gasto', error: error.message });
    }
  },

  // Actualizar gasto
  actualizar: (req, res) => {
    try {
      const { id } = req.params;
      const datos = req.body;

      const gastoExistente = Gasto.obtenerPorId(id);
      if (!gastoExistente) {
        return res.status(404).json({ mensaje: 'Gasto no encontrado' });
      }

      // Validar monto si se está actualizando
      if (datos.monto && datos.monto <= 0) {
        return res.status(400).json({ mensaje: 'El monto debe ser mayor a 0' });
      }

      if (datos.monto) {
        datos.monto = parseFloat(datos.monto);
      }

      Gasto.actualizar(id, datos);
      const gastoActualizado = Gasto.obtenerPorId(id);
      
      res.json(gastoActualizado);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar gasto', error: error.message });
    }
  },

  // Eliminar gasto
  eliminar: (req, res) => {
    try {
      const { id } = req.params;
      
      const gastoExistente = Gasto.obtenerPorId(id);
      if (!gastoExistente) {
        return res.status(404).json({ mensaje: 'Gasto no encontrado' });
      }

      Gasto.eliminar(id);
      res.json({ mensaje: 'Gasto eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar gasto', error: error.message });
    }
  },

  // Obtener gastos por período
  obtenerPorPeriodo: (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ 
          mensaje: 'Se requieren fechaInicio y fechaFin como parámetros de consulta' 
        });
      }

      const gastos = Gasto.obtenerPorPeriodo(fechaInicio, fechaFin);
      res.json(gastos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener gastos por período', error: error.message });
    }
  },

  // Obtener estadísticas de gastos
  obtenerEstadisticas: (req, res) => {
    try {
      const { periodo } = req.query;
      const estadisticas = Gasto.obtenerEstadisticas(periodo);
      
      // Calcular totales generales
      const totalGeneral = estadisticas.reduce((sum, cat) => sum + cat.total_monto, 0);
      
      const respuesta = {
        estadisticas_por_categoria: estadisticas,
        resumen: {
          total_general: totalGeneral,
          numero_categorias: estadisticas.length,
          promedio_por_categoria: estadisticas.length > 0 ? totalGeneral / estadisticas.length : 0
        }
      };

      res.json(respuesta);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
    }
  },

  // Obtener total por fondo
  obtenerTotalPorFondo: (req, res) => {
    try {
      const { fondo } = req.params;
      const total = Gasto.obtenerTotalPorFondo(fondo);
      
      res.json({ 
        fondo, 
        total_gastado: total 
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener total por fondo', error: error.message });
    }
  }
};