import { getData, saveData } from '../data.js';

export class Cuota {
  static crear(datos) {
    const { usuario_id, concepto, monto, fecha_vencimiento } = datos;
    const data = getData();
    
    const nuevaCuota = {
      id: data.nextId.cuotas++,
      usuario_id: parseInt(usuario_id),
      concepto,
      monto: parseFloat(monto),
      fecha_vencimiento,
      pagado: false,
      fecha_pago: null,
      metodo_pago: null,
      comprobante_url: null,
      created_at: new Date().toISOString()
    };
    
    data.cuotas.push(nuevaCuota);
    saveData();
    
    return nuevaCuota;
  }

  static crearParaTodos(datos) {
    const { concepto, monto, fecha_vencimiento } = datos;
    const data = getData();
    
    const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
    const cuotasCreadas = [];
    
    inquilinos.forEach(inquilino => {
      const nuevaCuota = {
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        concepto,
        monto: parseFloat(monto),
        fecha_vencimiento,
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        comprobante_url: null,
        created_at: new Date().toISOString()
      };
      
      data.cuotas.push(nuevaCuota);
      cuotasCreadas.push(nuevaCuota.id);
    });
    
    saveData();
    return cuotasCreadas;
  }

  static obtenerTodas() {
    const data = getData();
    const cuotas = data.cuotas || [];
    
    return cuotas.map(cuota => {
      const usuario = data.usuarios.find(u => u.id === cuota.usuario_id);
      return {
        ...cuota,
        usuario_nombre: usuario ? usuario.nombre : 'Usuario no encontrado',
        departamento: usuario ? usuario.departamento : 'N/A'
      };
    }).sort((a, b) => {
      // Ordenar por fecha de vencimiento DESC, luego por departamento
      const fechaDiff = new Date(b.fecha_vencimiento) - new Date(a.fecha_vencimiento);
      if (fechaDiff !== 0) return fechaDiff;
      return a.departamento.localeCompare(b.departamento);
    });
  }

  static obtenerPorUsuario(usuarioId) {
    const data = getData();
    return (data.cuotas || [])
      .filter(c => c.usuario_id === parseInt(usuarioId))
      .sort((a, b) => new Date(b.fecha_vencimiento) - new Date(a.fecha_vencimiento));
  }

  static obtenerPorId(id) {
    const data = getData();
    const cuota = (data.cuotas || []).find(c => c.id === parseInt(id));
    
    if (!cuota) return null;
    
    const usuario = data.usuarios.find(u => u.id === cuota.usuario_id);
    return {
      ...cuota,
      usuario_nombre: usuario ? usuario.nombre : 'Usuario no encontrado',
      departamento: usuario ? usuario.departamento : 'N/A'
    };
  }

  static marcarPagada(id, datos) {
    const { metodo_pago, comprobante_url } = datos;
    const data = getData();
    
    const cuota = (data.cuotas || []).find(c => c.id === parseInt(id));
    if (!cuota) {
      throw new Error('Cuota no encontrada');
    }
    
    cuota.pagado = true;
    cuota.fecha_pago = new Date().toISOString();
    cuota.metodo_pago = metodo_pago;
    cuota.comprobante_url = comprobante_url;
    
    saveData();
    return cuota;
  }

  static obtenerEstadisticasPagos() {
    const data = getData();
    const ahora = new Date();
    const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    
    const cuotasMes = (data.cuotas || []).filter(c => 
      c.fecha_vencimiento.startsWith(mesActual)
    );
    
    const cuotasPagadas = cuotasMes.filter(c => c.pagado);
    const cuotasPendientes = cuotasMes.filter(c => !c.pagado);
    
    return {
      total_cuotas: cuotasMes.length,
      cuotas_pagadas: cuotasPagadas.length,
      cuotas_pendientes: cuotasPendientes.length,
      monto_total: cuotasMes.reduce((sum, c) => sum + c.monto, 0),
      monto_pagado: cuotasPagadas.reduce((sum, c) => sum + c.monto, 0),
      monto_pendiente: cuotasPendientes.reduce((sum, c) => sum + c.monto, 0)
    };
  }

  static obtenerVencidas() {
    const data = getData();
    const hoy = new Date().toISOString().split('T')[0];
    
    const cuotasVencidas = (data.cuotas || [])
      .filter(c => !c.pagado && c.fecha_vencimiento < hoy)
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
    
    return cuotasVencidas.map(cuota => {
      const usuario = data.usuarios.find(u => u.id === cuota.usuario_id);
      return {
        ...cuota,
        usuario_nombre: usuario ? usuario.nombre : 'Usuario no encontrado',
        departamento: usuario ? usuario.departamento : 'N/A',
        telefono: usuario ? usuario.telefono : null
      };
    });
  }

  static actualizar(id, datos) {
    const data = getData();
    const cuota = (data.cuotas || []).find(c => c.id === parseInt(id));
    
    if (!cuota) {
      throw new Error('Cuota no encontrada');
    }
    
    Object.keys(datos).forEach(key => {
      if (datos[key] !== undefined) {
        cuota[key] = datos[key];
      }
    });
    
    saveData();
    return cuota;
  }

  static eliminar(id) {
    const data = getData();
    const index = (data.cuotas || []).findIndex(c => c.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Cuota no encontrada');
    }
    
    data.cuotas.splice(index, 1);
    saveData();
    return true;
  }
}