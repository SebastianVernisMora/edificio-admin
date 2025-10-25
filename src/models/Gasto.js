import { getData, saveData } from '../data.js';

export class Gasto {
  static crear(datos) {
    const { concepto, categoria, proveedor, monto, fecha_gasto, comprobante_url, origen_fondo } = datos;
    const data = getData();
    
    const nuevoGasto = {
      id: data.nextId.gastos++,
      concepto,
      categoria,
      proveedor: proveedor || null,
      monto: parseFloat(monto),
      fecha_gasto,
      comprobante_url: comprobante_url || null,
      origen_fondo: origen_fondo || 'fondo_operacional',
      created_at: new Date().toISOString()
    };
    
    data.gastos.push(nuevoGasto);
    saveData();
    
    return nuevoGasto;
  }

  static obtenerTodos() {
    const data = getData();
    return (data.gastos || []).sort((a, b) => new Date(b.fecha_gasto) - new Date(a.fecha_gasto));
  }

  static obtenerPorId(id) {
    const data = getData();
    return (data.gastos || []).find(g => g.id === parseInt(id));
  }

  static obtenerPorPeriodo(fechaInicio, fechaFin) {
    const data = getData();
    return (data.gastos || [])
      .filter(g => g.fecha_gasto >= fechaInicio && g.fecha_gasto <= fechaFin)
      .sort((a, b) => new Date(b.fecha_gasto) - new Date(a.fecha_gasto));
  }

  static obtenerPorCategoria(categoria) {
    const data = getData();
    return (data.gastos || [])
      .filter(g => g.categoria === categoria)
      .sort((a, b) => new Date(b.fecha_gasto) - new Date(a.fecha_gasto));
  }

  static obtenerEstadisticas(periodo = null) {
    const data = getData();
    let gastos = data.gastos || [];
    
    if (periodo) {
      gastos = gastos.filter(g => g.fecha_gasto.startsWith(periodo));
    }
    
    const categorias = {};
    gastos.forEach(g => {
      if (!categorias[g.categoria]) {
        categorias[g.categoria] = {
          categoria: g.categoria,
          total_gastos: 0,
          total_monto: 0
        };
      }
      categorias[g.categoria].total_gastos++;
      categorias[g.categoria].total_monto += g.monto;
    });
    
    return Object.values(categorias)
      .map(c => ({
        ...c,
        promedio_monto: c.total_gastos > 0 ? c.total_monto / c.total_gastos : 0
      }))
      .sort((a, b) => b.total_monto - a.total_monto);
  }

  static actualizar(id, datos) {
    const data = getData();
    const index = (data.gastos || []).findIndex(g => g.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Gasto no encontrado');
    }
    
    Object.keys(datos).forEach(key => {
      if (datos[key] !== undefined) {
        data.gastos[index][key] = datos[key];
      }
    });
    
    saveData();
    return data.gastos[index];
  }

  static eliminar(id) {
    const data = getData();
    const index = (data.gastos || []).findIndex(g => g.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Gasto no encontrado');
    }
    
    data.gastos.splice(index, 1);
    saveData();
    return true;
  }

  static obtenerTotalPorFondo(origenFondo) {
    const data = getData();
    return (data.gastos || [])
      .filter(g => g.origen_fondo === origenFondo)
      .reduce((total, g) => total + g.monto, 0);
  }
}