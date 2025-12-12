import { getAll, getById, create, update, remove } from '../data.js';

const COLLECTION = 'anuncios';

export default class Anuncio {
  static async getAll() {
    return getAll(COLLECTION);
  }
  
  static async getById(id) {
    return getById(COLLECTION, id);
  }
  
  static async getByTipo(tipo) {
    const anuncios = getAll(COLLECTION);
    return anuncios.filter(a => a.tipo === tipo);
  }
  
  static async create(anuncioData) {
    const newAnuncio = {
      id: anuncioData.id || `anuncio_${Date.now()}`,
      titulo: anuncioData.titulo,
      contenido: anuncioData.contenido,
      tipo: anuncioData.tipo || 'GENERAL',
      imagen: anuncioData.imagen || null,
      createdAt: new Date().toISOString(),
      autor: anuncioData.autor,
      createdBy: anuncioData.createdBy,
      archivos: anuncioData.archivos || []
    };
    
    return create(COLLECTION, newAnuncio);
  }
  
  static async update(id, updates) {
    return update(COLLECTION, id, updates);
  }
  
  static async delete(id) {
    return remove(COLLECTION, id);
  }
  
  static async getRecientes(limit = 5) {
    const anuncios = getAll(COLLECTION);
    return anuncios
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
  
  // Métodos específicos para gestión de archivos
  static async addArchivos(id, archivos) {
    const anuncio = await this.getById(id);
    if (!anuncio) {
      throw new Error('Anuncio no encontrado');
    }
    
    const archivosExistentes = anuncio.archivos || [];
    const nuevosArchivos = [...archivosExistentes, ...archivos];
    
    return this.update(id, { archivos: nuevosArchivos });
  }
  
  static async removeArchivo(id, archivoPath) {
    const anuncio = await this.getById(id);
    if (!anuncio) {
      throw new Error('Anuncio no encontrado');
    }
    
    const archivosActualizados = (anuncio.archivos || []).filter(
      archivo => archivo.path !== archivoPath
    );
    
    return this.update(id, { archivos: archivosActualizados });
  }
  
  static async getArchivos(id) {
    const anuncio = await this.getById(id);
    return anuncio ? (anuncio.archivos || []) : [];
  }
  
  static validateArchivoData(archivo) {
    const requiredFields = ['originalName', 'filename', 'path', 'mimetype', 'size'];
    
    for (const field of requiredFields) {
      if (!archivo[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
    
    // Validar tamaño (5MB máximo)
    if (archivo.size > 5 * 1024 * 1024) {
      throw new Error('Archivo demasiado grande. Máximo 5MB');
    }
    
    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(archivo.mimetype)) {
      throw new Error('Tipo de archivo no permitido');
    }
    
    return true;
  }
}