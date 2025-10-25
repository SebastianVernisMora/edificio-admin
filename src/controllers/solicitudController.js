import { Solicitud } from '../models/Solicitud.js';

export const obtenerSolicitudes = (req, res) => {
  try {
    let solicitudes;
    
    if (req.usuario.rol === 'admin') {
      solicitudes = Solicitud.obtenerTodas();
    } else {
      solicitudes = Solicitud.obtenerPorUsuario(req.usuario.id);
    }

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerSolicitud = (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = Solicitud.obtenerPorId(id);
    
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    if (req.usuario.rol !== 'admin' && solicitud.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver esta solicitud' });
    }

    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const crearSolicitud = (req, res) => {
  try {
    const datosSolicitud = {
      ...req.body,
      usuario_id: req.usuario.id
    };

    const solicitud = Solicitud.crear(datosSolicitud);
    res.status(201).json({
      mensaje: 'Solicitud creada exitosamente',
      solicitud
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const responderSolicitud = (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta, estado } = req.body;
    
    const solicitud = Solicitud.obtenerPorId(id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    Solicitud.responder(id, respuesta, estado || 'completada');
    res.json({ mensaje: 'Solicitud respondida exitosamente' });
  } catch (error) {
    console.error('Error al responder solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const cambiarEstadoSolicitud = (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const solicitud = Solicitud.obtenerPorId(id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    Solicitud.cambiarEstado(id, estado);
    res.json({ mensaje: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerEstadisticasSolicitudes = (req, res) => {
  try {
    const estadisticas = Solicitud.obtenerEstadisticas();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const eliminarSolicitud = (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = Solicitud.obtenerPorId(id);
    
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    if (req.usuario.rol !== 'admin' && solicitud.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar esta solicitud' });
    }

    Solicitud.eliminar(id);
    res.json({ mensaje: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};