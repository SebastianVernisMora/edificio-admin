import { readData, writeData } from '../data.js';

export class Presupuesto {
  constructor(id, titulo, monto, categoria, descripcion, fechaCreacion, estado = 'borrador', anio = new Date().getFullYear(), montoEjecutado = 0) {
    this.id = id;
    this.titulo = titulo;
    this.monto = monto;
    this.categoria = categoria;
    this.descripcion = descripcion;
    this.fecha_creacion = fechaCreacion;
    this.estado = estado;
    this.anio = anio;
    this.monto_ejecutado = montoEjecutado;
    this.porcentaje_ejecucion = monto > 0 ? ((montoEjecutado / monto) * 100).toFixed(2) : 0;
    this.monto_disponible = monto - montoEjecutado;
  }

  static obtenerTodos() {
    const datos = readData();
    return datos.presupuestos.map(p => new Presupuesto(
      p.id,
      p.titulo,
      p.monto,
      p.categoria,
      p.descripcion,
      p.fecha_creacion,
      p.estado,
      p.anio || new Date().getFullYear(),
      p.monto_ejecutado || 0
    ));
  }

  static obtenerPorId(id) {
    const datos = readData();
    const presupuesto = datos.presupuestos.find(p => p.id === parseInt(id));
    return presupuesto ? new Presupuesto(
      presupuesto.id,
      presupuesto.titulo,
      presupuesto.monto,
      presupuesto.categoria,
      presupuesto.descripcion,
      presupuesto.fecha_creacion,
      presupuesto.estado,
      presupuesto.anio || new Date().getFullYear(),
      presupuesto.monto_ejecutado || 0
    ) : null;
  }

  static obtenerPorAnio(anio) {
    const datos = readData();
    return datos.presupuestos
      .filter(p => p.anio === parseInt(anio))
      .map(p => new Presupuesto(
        p.id,
        p.titulo,
        p.monto,
        p.categoria,
        p.descripcion,
        p.fecha_creacion,
        p.estado,
        p.anio,
        p.monto_ejecutado || 0
      ));
  }

  static obtenerPorCategoria(categoria) {
    const datos = readData();
    return datos.presupuestos
      .filter(p => p.categoria === categoria)
      .map(p => new Presupuesto(
        p.id,
        p.titulo,
        p.monto,
        p.categoria,
        p.descripcion,
        p.fecha_creacion,
        p.estado,
        p.anio || new Date().getFullYear(),
        p.monto_ejecutado || 0
      ));
  }

  static async crear(datos) {
    const datosActuales = readData();
    const nuevoId = Math.max(...datosActuales.presupuestos.map(p => p.id), 0) + 1;
    
    const nuevoPresupuesto = {
      id: nuevoId,
      titulo: datos.titulo,
      monto: parseFloat(datos.monto),
      categoria: datos.categoria,
      descripcion: datos.descripcion || '',
      fecha_creacion: new Date().toISOString(),
      estado: 'borrador',
      anio: datos.anio || new Date().getFullYear(),
      monto_ejecutado: 0
    };

    datosActuales.presupuestos.push(nuevoPresupuesto);
    writeData(datosActuales);

    return new Presupuesto(
      nuevoPresupuesto.id,
      nuevoPresupuesto.titulo,
      nuevoPresupuesto.monto,
      nuevoPresupuesto.categoria,
      nuevoPresupuesto.descripcion,
      nuevoPresupuesto.fecha_creacion,
      nuevoPresupuesto.estado,
      nuevoPresupuesto.anio,
      nuevoPresupuesto.monto_ejecutado
    );
  }

  static async actualizar(id, datos) {
    const datosActuales = readData();
    const indice = datosActuales.presupuestos.findIndex(p => p.id === parseInt(id));
    
    if (indice === -1) return null;

    if (datos.monto) datos.monto = parseFloat(datos.monto);
    if (datos.monto_ejecutado) datos.monto_ejecutado = parseFloat(datos.monto_ejecutado);

    datosActuales.presupuestos[indice] = {
      ...datosActuales.presupuestos[indice],
      ...datos
    };

    writeData(datosActuales);
    return this.obtenerPorId(id);
  }

  static async eliminar(id) {
    const datosActuales = readData();
    const indice = datosActuales.presupuestos.findIndex(p => p.id === parseInt(id));
    
    if (indice === -1) return false;

    datosActuales.presupuestos.splice(indice, 1);
    writeData(datosActuales);
    return true;
  }

  static obtenerEstadisticas(anio = new Date().getFullYear()) {
    const presupuestos = this.obtenerPorAnio(anio);
    
    const total = presupuestos.reduce((sum, p) => sum + p.monto, 0);
    const ejecutado = presupuestos.reduce((sum, p) => sum + p.monto_ejecutado, 0);
    const disponible = total - ejecutado;
    const porcentajeEjecucion = total > 0 ? ((ejecutado / total) * 100).toFixed(2) : 0;

    const porCategoria = {};
    presupuestos.forEach(p => {
      if (!porCategoria[p.categoria]) {
        porCategoria[p.categoria] = {
          presupuestado: 0,
          ejecutado: 0,
          disponible: 0
        };
      }
      porCategoria[p.categoria].presupuestado += p.monto;
      porCategoria[p.categoria].ejecutado += p.monto_ejecutado;
      porCategoria[p.categoria].disponible += p.monto_disponible;
    });

    return {
      anio,
      total,
      ejecutado,
      disponible,
      porcentajeEjecucion,
      porCategoria,
      totalPresupuestos: presupuestos.length
    };
  }

  static obtenerAlertasExceso() {
    const presupuestos = this.obtenerTodos();
    const alertas = [];

    presupuestos.forEach(p => {
      const porcentaje = parseFloat(p.porcentaje_ejecucion);
      if (porcentaje >= 100) {
        alertas.push({
          presupuesto: p,
          tipo: 'critico',
          mensaje: `Presupuesto "${p.titulo}" excedido (${porcentaje}%)`
        });
      } else if (porcentaje >= 80) {
        alertas.push({
          presupuesto: p,
          tipo: 'advertencia',
          mensaje: `Presupuesto "${p.titulo}" cerca del límite (${porcentaje}%)`
        });
      }
    });

    return alertas;
  }
}
