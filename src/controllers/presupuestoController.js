import { Presupuesto } from '../models/Presupuesto.js';
import { validationResult } from 'express-validator';

export const obtenerPresupuestos = (req, res) => {
  try {
    const presupuestos = Presupuesto.obtenerTodos();
    res.json(presupuestos);
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    res.json(presupuesto);
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const crearPresupuesto = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const presupuesto = Presupuesto.crear(req.body);
    res.status(201).json({
      mensaje: 'Presupuesto creado exitosamente',
      presupuesto
    });
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const actualizarPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuestoExistente = Presupuesto.obtenerPorId(id);
    
    if (!presupuestoExistente) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    Presupuesto.actualizar(id, req.body);
    const presupuestoActualizado = Presupuesto.obtenerPorId(id);

    res.json({
      mensaje: 'Presupuesto actualizado exitosamente',
      presupuesto: presupuestoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const eliminarPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    Presupuesto.eliminar(id);
    res.json({ mensaje: 'Presupuesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const aprobarPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    Presupuesto.actualizar(id, { estado: 'aprobado' });
    res.json({ mensaje: 'Presupuesto aprobado exitosamente' });
  } catch (error) {
    console.error('Error al aprobar presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const rechazarPresupuesto = (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = Presupuesto.obtenerPorId(id);
    
    if (!presupuesto) {
      return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    }

    Presupuesto.actualizar(id, { estado: 'rechazado' });
    res.json({ mensaje: 'Presupuesto rechazado' });
  } catch (error) {
    console.error('Error al rechazar presupuesto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};