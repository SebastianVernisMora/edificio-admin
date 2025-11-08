import { getFondos, updateFondos } from '../data.js';

export default class Fondo {
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
    const fondos = await this.getFondos();
    
    if (!fondos[origen] || !fondos[destino]) {
      throw new Error('Fondo de origen o destino inválido');
    }
    
    if (fondos[origen] < monto) {
      throw new Error('Fondos insuficientes para la transferencia');
    }
    
    const updates = {
      [origen]: fondos[origen] - monto,
      [destino]: fondos[destino] + monto
    };
    
    return this.updateFondos(updates);
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
    
    if (!fondos[fondo]) {
      throw new Error('Fondo inválido');
    }
    
    return this.updateFondos({
      [fondo]: fondos[fondo] + monto
    });
  }
}