import { Presupuesto } from '../models/Presupuesto.js';
import { validationResult } from 'express-validator';

export const obtenerPresupuestos = (req, res) => {
  try {
    const { anio, categoria, estado } = req.query;
    let presupuestos = Presupuesto.obtenerTodos();

    // Filtrar por año si se proporciona
    if (anio) {
      presupuestos = presupuestos.filter(p => p.anio === parseInt(anio));
    }

    // Filtrar por categoría si se proporciona
    if (categoria) {
      presupuestos = presupuestos.filter(p => p.categoria === categoria);
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      presupuestos = presupuestos.filter(p => p.estado === estado);
    }

    res.json({
      success: true,
      presupuestos,
      total: presupuestos.length
    });
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const obtenerPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Presupuesto no encontrado' 
      });
    }

    res.json({
      success: true,
      presupuesto
    });
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const crearPresupuesto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errores: errors.array() 
      });
    }

    const presupuesto = await Presupuesto.crear(req.body);
    res.status(201).json({
      success: true,
      mensaje: 'Presupuesto creado exitosamente',
      presupuesto
    });
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const actualizarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuestoExistente = Presupuesto.obtenerPorId(id);
    
    if (!presupuestoExistente) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Presupuesto no encontrado' 
      });
    }

    const presupuestoActualizado = await Presupuesto.actualizar(id, req.body);

    res.json({
      success: true,
      mensaje: 'Presupuesto actualizado exitosamente',
      presupuesto: presupuestoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const eliminarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Presupuesto no encontrado' 
      });
    }

    await Presupuesto.eliminar(id);
    res.json({ 
      success: true,
      mensaje: 'Presupuesto eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const aprobarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Presupuesto no encontrado' 
      });
    }

    await Presupuesto.actualizar(id, { estado: 'aprobado' });
    res.json({ 
      success: true,
      mensaje: 'Presupuesto aprobado exitosamente' 
    });
  } catch (error) {
    console.error('Error al aprobar presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const rechazarPresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Presupuesto no encontrado' 
      });
    }

    await Presupuesto.actualizar(id, { estado: 'rechazado' });
    res.json({ 
      success: true,
      mensaje: 'Presupuesto rechazado' 
    });
  } catch (error) {
    console.error('Error al rechazar presupuesto:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const obtenerEstadisticas = (req, res) => {
  try {
    const { anio } = req.query;
    const estadisticas = Presupuesto.obtenerEstadisticas(anio ? parseInt(anio) : undefined);
    
    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};

export const obtenerAlertas = (req, res) => {
  try {
    const alertas = Presupuesto.obtenerAlertasExceso();
    
    res.json({
      success: true,
      alertas,
      total: alertas.length
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor' 
    });
  }
};
