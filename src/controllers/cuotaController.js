import { Cuota } from '../models/Cuota.js';
import { validationResult } from 'express-validator';

export const obtenerCuotas = (req, res) => {
  try {
    let cuotas;
    
    if (req.usuario.rol === 'admin') {
      cuotas = Cuota.obtenerTodas();
    } else {
      cuotas = Cuota.obtenerPorUsuario(req.usuario.id);
    }

    res.json(cuotas);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerCuota = (req, res) => {
  try {
    const { id } = req.params;
    const cuota = Cuota.obtenerPorId(id);
    
    if (!cuota) {
      return res.status(404).json({ mensaje: 'Cuota no encontrada' });
    }

    if (req.usuario.rol !== 'admin' && cuota.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver esta cuota' });
    }

    res.json(cuota);
  } catch (error) {
    console.error('Error al obtener cuota:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const crearCuota = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { tipo, ...datosCuota } = req.body;

    let resultado;
    if (tipo === 'todos') {
      resultado = Cuota.crearParaTodos(datosCuota);
      res.status(201).json({
        mensaje: `Cuotas creadas para todos los inquilinos (${resultado.length} cuotas)`,
        cuotasCreadas: resultado.length
      });
    } else {
      resultado = Cuota.crear(datosCuota);
      res.status(201).json({
        mensaje: 'Cuota creada exitosamente',
        cuota: resultado
      });
    }
  } catch (error) {
    console.error('Error al crear cuota:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const marcarPagada = (req, res) => {
  try {
    const { id } = req.params;
    const cuota = Cuota.obtenerPorId(id);
    
    if (!cuota) {
      return res.status(404).json({ mensaje: 'Cuota no encontrada' });
    }

    if (req.usuario.rol !== 'admin' && cuota.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para modificar esta cuota' });
    }

    const { metodo_pago, comprobante_url } = req.body;
    Cuota.marcarPagada(id, { metodo_pago, comprobante_url });

    res.json({ mensaje: 'Cuota marcada como pagada exitosamente' });
  } catch (error) {
    console.error('Error al marcar cuota como pagada:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerEstadisticasPagos = (req, res) => {
  try {
    const estadisticas = Cuota.obtenerEstadisticasPagos();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerVencidas = (req, res) => {
  try {
    const cuotasVencidas = Cuota.obtenerVencidas();
    res.json(cuotasVencidas);
  } catch (error) {
    console.error('Error al obtener cuotas vencidas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const actualizarCuota = (req, res) => {
  try {
    const { id } = req.params;
    const cuota = Cuota.obtenerPorId(id);
    
    if (!cuota) {
      return res.status(404).json({ mensaje: 'Cuota no encontrada' });
    }

    Cuota.actualizar(id, req.body);
    const cuotaActualizada = Cuota.obtenerPorId(id);

    res.json({
      mensaje: 'Cuota actualizada exitosamente',
      cuota: cuotaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar cuota:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const eliminarCuota = (req, res) => {
  try {
    const { id } = req.params;
    const cuota = Cuota.obtenerPorId(id);
    
    if (!cuota) {
      return res.status(404).json({ mensaje: 'Cuota no encontrada' });
    }

    Cuota.eliminar(id);
    res.json({ mensaje: 'Cuota eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuota:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};