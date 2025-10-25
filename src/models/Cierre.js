import { getData, saveData } from '../data.js';

export class Cierre {
  static crear(datos) {
    const { periodo, tipo, fecha_cierre, ingresos, egresos, saldo, detalles } = datos;
    const data = getData();
    
    const nuevoCierre = {
      id: data.nextId.cierres++,
      periodo,
      tipo,
      fecha_cierre,
      ingresos: parseFloat(ingresos),
      egresos: parseFloat(egresos),
      saldo: parseFloat(saldo),
      detalles,
      estado: 'completado',
      created_at: new Date().toISOString()
    };
    
    data.cierres.push(nuevoCierre);
    saveData();
    
    return nuevoCierre;
  }

  static obtenerTodos() {
    const data = getData();
    return (data.cierres || []).sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre));
  }

  static obtenerPorId(id) {
    const data = getData();
    return (data.cierres || []).find(c => c.id === parseInt(id));
  }

  static obtenerPorPeriodo(periodo) {
    const data = getData();
    return (data.cierres || []).find(c => c.periodo === periodo);
  }

  static obtenerPorTipo(tipo) {
    const data = getData();
    return (data.cierres || [])
      .filter(c => c.tipo === tipo)
      .sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre));
  }

  static existeCierre(periodo, tipo) {
    const data = getData();
    return (data.cierres || []).some(c => c.periodo === periodo && c.tipo === tipo);
  }

  static obtenerUltimoCierre(tipo = null) {
    const data = getData();
    let cierres = data.cierres || [];
    
    if (tipo) {
      cierres = cierres.filter(c => c.tipo === tipo);
    }
    
    return cierres.sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre))[0] || null;
  }

  static actualizar(id, datos) {
    const data = getData();
    const index = (data.cierres || []).findIndex(c => c.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Cierre no encontrado');
    }
    
    Object.keys(datos).forEach(key => {
      if (datos[key] !== undefined) {
        data.cierres[index][key] = datos[key];
      }
    });
    
    saveData();
    return data.cierres[index];
  }

  static eliminar(id) {
    const data = getData();
    const index = (data.cierres || []).findIndex(c => c.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Cierre no encontrado');
    }
    
    data.cierres.splice(index, 1);
    saveData();
    return true;
  }

  static obtenerEstadisticasAnuales(año) {
    const data = getData();
    const cierresAño = (data.cierres || []).filter(c => 
      new Date(c.fecha_cierre).getFullYear().toString() === año
    );
    
    return {
      total_ingresos: cierresAño.reduce((sum, c) => sum + c.ingresos, 0),
      total_egresos: cierresAño.reduce((sum, c) => sum + c.egresos, 0),
      saldo_neto: cierresAño.reduce((sum, c) => sum + c.saldo, 0),
      total_cierres: cierresAño.length
    };
  }
}