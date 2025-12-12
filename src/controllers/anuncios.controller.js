import Anuncio from '../models/Anuncio.js';
import { handleControllerError, validateId, validateRequired } from '../middleware/error-handler.js';
import { deleteFiles } from '../middleware/upload.js';
import path from 'path';

export const getAnuncios = async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let anuncios = await Anuncio.getAll();
    
    // Filtrar por tipo si se especifica
    if (tipo) {
      anuncios = anuncios.filter(a => a.tipo === tipo);
    }
    
    res.json({
      ok: true,
      anuncios
    });
  } catch (error) {
    return handleControllerError(error, res, 'getAnuncios');
  }
};

export const getAnuncioById = async (req, res) => {
  try {
    const id = validateId(req.params.id);
    const anuncio = await Anuncio.getById(id);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    res.json({
      ok: true,
      anuncio
    });
  } catch (error) {
    return handleControllerError(error, res, 'getAnuncioById');
  }
};

export const getAnunciosByTipo = async (req, res) => {
  const { tipo } = req.params;
  
  try {
    const anuncios = await Anuncio.getByTipo(tipo);
    
    res.json({
      ok: true,
      anuncios
    });
  } catch (error) {
    return handleControllerError(error, res, 'getAnunciosByTipo');
  }
};

export const getAnunciosRecientes = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  
  try {
    const anuncios = await Anuncio.getRecientes(limit);
    
    res.json({
      ok: true,
      anuncios
    });
  } catch (error) {
    return handleControllerError(error, res, 'getAnunciosRecientes');
  }
};

export const crearAnuncio = async (req, res) => {
  const { titulo, contenido, tipo, imagen } = req.body;
  
  try {
    // Procesar archivos adjuntos si existen
    let archivos = [];
    if (req.files && req.files.length > 0) {
      archivos = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));
      
      // Validar cada archivo
      for (const archivo of archivos) {
        Anuncio.validateArchivoData(archivo);
      }
    }
    
    const anuncio = await Anuncio.create({
      titulo,
      contenido,
      tipo,
      imagen: imagen || null,
      autor: req.usuario.id,
      archivos
    });
    
    res.json({
      ok: true,
      anuncio,
      archivosSubidos: archivos.length
    });
  } catch (error) {
    // Si hay error, eliminar archivos subidos
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      deleteFiles(filePaths);
    }
    
    return handleControllerError(error, res, 'crearAnuncio');
  }
};

export const actualizarAnuncio = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const anuncio = await Anuncio.getById(id);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    // Verificar que el usuario es el autor o es admin
    if (anuncio.autor !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para editar este anuncio'
      });
    }
    
    const anuncioActualizado = await Anuncio.update(id, updates);
    
    res.json({
      ok: true,
      anuncio: anuncioActualizado
    });
  } catch (error) {
    return handleControllerError(error, res, 'actualizarAnuncio');
  }
};

export const eliminarAnuncio = async (req, res) => {
  const { id } = req.params;
  
  try {
    const anuncio = await Anuncio.getById(id);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    // Verificar que el usuario es el autor o es admin
    if (anuncio.autor !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para eliminar este anuncio'
      });
    }
    
    // Eliminar archivos asociados antes de eliminar el anuncio
    if (anuncio.archivos && anuncio.archivos.length > 0) {
      const filePaths = anuncio.archivos.map(archivo => archivo.path);
      deleteFiles(filePaths);
    }
    
    await Anuncio.delete(id);
    
    res.json({
      ok: true,
      msg: 'Anuncio eliminado correctamente'
    });
  } catch (error) {
    return handleControllerError(error, res, 'eliminarAnuncio');
  }
};

// Controlador para agregar archivos a un anuncio existente
export const agregarArchivos = async (req, res) => {
  const { id } = req.params;
  
  const anuncioId = parseInt(id) || id; // Convertir a número si es posible
  try {
    const anuncio = await Anuncio.getById(anuncioId);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    // Verificar permisos
    if (anuncio.autor !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para modificar este anuncio'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: 'No se enviaron archivos'
      });
    }
    
    // Verificar límite total de archivos (máximo 5 por anuncio)
    const archivosExistentes = anuncio.archivos || [];
    if (archivosExistentes.length + req.files.length > 5) {
      // Eliminar archivos subidos
      const filePaths = req.files.map(file => file.path);
      deleteFiles(filePaths);
      
      return res.status(400).json({
        ok: false,
        msg: `Límite de archivos excedido. Máximo 5 archivos por anuncio. Actualmente tiene ${archivosExistentes.length} archivos.`
      });
    }
    
    // Procesar nuevos archivos
    const nuevosArchivos = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    
    // Validar archivos
    for (const archivo of nuevosArchivos) {
      Anuncio.validateArchivoData(archivo);
    }
    
    const anuncioActualizado = await Anuncio.addArchivos(id, nuevosArchivos);
    
    res.json({
      ok: true,
      anuncio: anuncioActualizado,
      archivosAgregados: nuevosArchivos.length
    });
    
  } catch (error) {
    // Si hay error, eliminar archivos subidos
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      deleteFiles(filePaths);
    }
    
    return handleControllerError(error, res, 'agregarArchivos');
  }
};

// Controlador para eliminar un archivo específico
export const eliminarArchivo = async (req, res) => {
  const { id, filename } = req.params;
  
  const anuncioId = parseInt(id) || id; // Convertir a número si es posible
  try {
    const anuncio = await Anuncio.getById(anuncioId);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    // Verificar permisos
    if (anuncio.autor !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para modificar este anuncio'
      });
    }
    
    // Buscar el archivo
    const archivo = (anuncio.archivos || []).find(a => a.filename === filename);
    
    if (!archivo) {
      return res.status(404).json({
        ok: false,
        msg: 'Archivo no encontrado'
      });
    }
    
    // Eliminar archivo del sistema de archivos
    deleteFiles([archivo.path]);
    
    // Actualizar anuncio removiendo el archivo
    const anuncioActualizado = await Anuncio.removeArchivo(id, archivo.path);
    
    res.json({
      ok: true,
      anuncio: anuncioActualizado,
      msg: 'Archivo eliminado correctamente'
    });
    
  } catch (error) {
    return handleControllerError(error, res, 'eliminarArchivo');
  }
};

// Controlador para descargar un archivo
export const descargarArchivo = async (req, res) => {
  const { id, filename } = req.params;
  
  const anuncioId = parseInt(id) || id; // Convertir a número si es posible
  try {
    const anuncio = await Anuncio.getById(anuncioId);
    
    if (!anuncio) {
      return res.status(404).json({
        ok: false,
        msg: 'Anuncio no encontrado'
      });
    }
    
    // Buscar el archivo
    const archivo = (anuncio.archivos || []).find(a => a.filename === filename);
    
    if (!archivo) {
      return res.status(404).json({
        ok: false,
        msg: 'Archivo no encontrado'
      });
    }
    
    // Verificar que el archivo existe en el sistema
    const filePath = path.resolve(archivo.path);
    
    res.download(filePath, archivo.originalName, (err) => {
      if (err) {
        return handleControllerError(err, res, 'descargarArchivo');
      }
    });
    
  } catch (error) {
    return handleControllerError(error, res, 'descargarArchivo');
  }
};