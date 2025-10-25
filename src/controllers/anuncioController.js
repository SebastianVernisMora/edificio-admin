import { Anuncio } from '../models/Anuncio.js';

export const obtenerAnuncios = (req, res) => {
  try {
    let anuncios;
    
    if (req.usuario.rol === 'admin') {
      anuncios = Anuncio.obtenerTodos();
    } else {
      anuncios = Anuncio.obtenerActivos();
    }

    res.json(anuncios);
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerAnuncio = (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = Anuncio.obtenerPorId(id);
    
    if (!anuncio) {
      return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
    }

    res.json(anuncio);
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const crearAnuncio = (req, res) => {
  try {
    const datosAnuncio = {
      ...req.body,
      autor_id: req.usuario.id
    };

    const anuncio = Anuncio.crear(datosAnuncio);
    res.status(201).json({
      mensaje: 'Anuncio creado exitosamente',
      anuncio
    });
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const actualizarAnuncio = (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = Anuncio.obtenerPorId(id);
    
    if (!anuncio) {
      return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && anuncio.autor_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para modificar este anuncio' });
    }

    Anuncio.actualizar(id, req.body);
    const anuncioActualizado = Anuncio.obtenerPorId(id);

    res.json({
      mensaje: 'Anuncio actualizado exitosamente',
      anuncio: anuncioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const desactivarAnuncio = (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = Anuncio.obtenerPorId(id);
    
    if (!anuncio) {
      return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && anuncio.autor_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para desactivar este anuncio' });
    }

    Anuncio.desactivar(id);
    res.json({ mensaje: 'Anuncio desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const eliminarAnuncio = (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = Anuncio.obtenerPorId(id);
    
    if (!anuncio) {
      return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && anuncio.autor_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar este anuncio' });
    }

    Anuncio.eliminar(id);
    res.json({ mensaje: 'Anuncio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerAnunciosPorTipo = (req, res) => {
  try {
    const { tipo } = req.params;
    const anuncios = Anuncio.obtenerPorTipo(tipo);
    res.json(anuncios);
  } catch (error) {
    console.error('Error al obtener anuncios por tipo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};