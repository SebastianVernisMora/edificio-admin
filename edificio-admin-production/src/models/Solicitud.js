import { readData, writeData } from '../data.js';

export class Solicitud {
  constructor(id, usuarioId, titulo, descripcion, categoria, fechaCreacion, estado = 'pendiente', respuesta = null) {
    this.id = id;
    this.usuario_id = usuarioId;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha_creacion = fechaCreacion;
    this.estado = estado;
    this.respuesta = respuesta;
  }

  static obtenerTodas() {
    const datos = readData();
    return datos.solicitudes.map(s => new Solicitud(
      s.id,
      s.usuario_id,
      s.titulo,
      s.descripcion,
      s.categoria,
      s.fecha_creacion,
      s.estado,
      s.respuesta
    ));
  }

  static obtenerPorUsuario(usuarioId) {
    return this.obtenerTodas().filter(s => s.usuario_id === parseInt(usuarioId));
  }

  static obtenerPorId(id) {
    const datos = readData();
    const solicitud = datos.solicitudes.find(s => s.id === parseInt(id));
    return solicitud ? new Solicitud(
      solicitud.id,
      solicitud.usuario_id,
      solicitud.titulo,
      solicitud.descripcion,
      solicitud.categoria,
      solicitud.fecha_creacion,
      solicitud.estado,
      solicitud.respuesta
    ) : null;
  }

  static async crear(datos) {
    const datosActuales = readData();
    const nuevoId = Math.max(...datosActuales.solicitudes.map(s => s.id), 0) + 1;
    
    const nuevaSolicitud = {
      id: nuevoId,
      usuario_id: datos.usuario_id,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      categoria: datos.categoria || 'general',
      fecha_creacion: new Date().toISOString(),
      estado: 'pendiente',
      respuesta: null
    };

    datosActuales.solicitudes.push(nuevaSolicitud);
    writeData(datosActuales);
    // Data is automatically saved by writeData

    return new Solicitud(
      nuevaSolicitud.id,
      nuevaSolicitud.usuario_id,
      nuevaSolicitud.titulo,
      nuevaSolicitud.descripcion,
      nuevaSolicitud.categoria,
      nuevaSolicitud.fecha_creacion,
      nuevaSolicitud.estado,
      nuevaSolicitud.respuesta
    );
  }

  static async responder(id, respuesta, estado) {
    const datosActuales = readData();
    const indice = datosActuales.solicitudes.findIndex(s => s.id === parseInt(id));
    
    if (indice === -1) return null;

    datosActuales.solicitudes[indice].respuesta = respuesta;
    datosActuales.solicitudes[indice].estado = estado || 'respondida';

    writeData(datosActuales);
    // Data is automatically saved by writeData
    return this.obtenerPorId(id);
  }

  static async cambiarEstado(id, estado) {
    const datosActuales = readData();
    const indice = datosActuales.solicitudes.findIndex(s => s.id === parseInt(id));
    
    if (indice === -1) return null;

    datosActuales.solicitudes[indice].estado = estado;
    writeData(datosActuales);
    // Data is automatically saved by writeData
    return this.obtenerPorId(id);
  }

  static obtenerEstadisticas() {
    const solicitudes = this.obtenerTodas();
    return {
      total: solicitudes.length,
      pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
      respondidas: solicitudes.filter(s => s.estado === 'respondida').length,
      resueltas: solicitudes.filter(s => s.estado === 'resuelta').length
    };
  }

  static async eliminar(id) {
    const datosActuales = readData();
    const indice = datosActuales.solicitudes.findIndex(s => s.id === parseInt(id));
    
    if (indice === -1) return false;

    datosActuales.solicitudes.splice(indice, 1);
    writeData(datosActuales);
    // Data is automatically saved by writeData
    return true;
  }
}