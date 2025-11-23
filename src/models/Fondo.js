import { getFondos, updateFondos } from '../data.js';

export default class Fondo {
  static obtenerFondos() {
    return getFondos();
  }
  
  static async getFondos() {
    return getFondos();
  }
  
  static async updateFondos(updates) {
    const fondos = await this.getFondos();
    const nuevoPatrimonio = 
      (updates.ahorroAcumulado !== undefined ? updates.ahorroAcumulado : fondos.ahorroAcumulado) +
      (updates.gastosMayores !== undefined ? updates.gastosMayores : fondos.gastosMayores) +
      (updates.dineroOperacional !== undefined ? updates.dineroOperacional : fondos.dineroOperacional);
    
    return updateFondos({
      ...updates,
      patrimonioTotal: nuevoPatrimonio
    });
  }
  
  static async transferirEntreFondos(origen, destino, monto) {
    const { readData, writeData } = await import('../data.js');
    const data = readData();
    const fondos = data.fondos;
    
    if (!fondos[origen] || fondos[origen] === undefined) {
      throw new Error('Fondo de origen inválido');
    }
    
    if (!fondos[destino] || fondos[destino] === undefined) {
      throw new Error('Fondo de destino inválido');
    }
    
    if (fondos[origen] < monto) {
      throw new Error('Fondos insuficientes para la transferencia');
    }
    
    // Actualizar fondos
    const updates = {
      [origen]: fondos[origen] - monto,
      [destino]: fondos[destino] + monto
    };
    
    const fondosActualizados = await this.updateFondos(updates);
    
    // Registrar movimiento
    if (!data.movimientos) {
      data.movimientos = [];
    }
    
    const movimiento = {
      id: data.movimientos.length > 0 ? Math.max(...data.movimientos.map(m => m.id || 0)) + 1 : 1,
      tipo: 'transferencia',
      origen,
      destino,
      monto,
      fecha: new Date().toISOString(),
      descripcion: `Transferencia de ${this.formatFondoName(origen)} a ${this.formatFondoName(destino)}`
    };
    
    data.movimientos.push(movimiento);
    writeData(data);
    
    return fondosActualizados;
  }
  
  static formatFondoName(fondo) {
    const nombres = {
      'ahorroAcumulado': 'Ahorro Acumulado',
      'gastosMayores': 'Gastos Mayores',
      'dineroOperacional': 'Dinero Operacional'
    };
    return nombres[fondo] || fondo;
  }
  
  static async registrarGasto(monto, fondo = 'dineroOperacional') {
    const fondos = await this.getFondos();
    
    if (!fondos[fondo]) {
      throw new Error('Fondo inválido');
    }
    
    if (fondos[fondo] < monto) {
      throw new Error('Fondos insuficientes para el gasto');
    }
    
    return this.updateFondos({
      [fondo]: fondos[fondo] - monto
    });
  }
  
  static async registrarIngreso(monto, fondo = 'dineroOperacional') {
    const fondos = await this.getFondos();
    
    if (fondos[fondo] === undefined) {
      throw new Error('Fondo inválido');
    }
    
    const nuevoMonto = fondos[fondo] + monto;
    console.log(`💰 Registrando ingreso: ${fondo} = ${fondos[fondo]} + ${monto} = ${nuevoMonto}`);
    
    const resultado = await this.updateFondos({
      [fondo]: nuevoMonto
    });
    
    console.log(`✅ Fondo ${fondo} actualizado a:`, resultado[fondo]);
    
    return resultado;
  }
}