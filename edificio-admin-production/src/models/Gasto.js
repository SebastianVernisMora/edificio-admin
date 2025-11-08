import { getAll, getById, create, update, remove } from '../data.js';

const COLLECTION = 'gastos';

export default class Gasto {
  static async getAll() {
    return getAll(COLLECTION);
  }
  
  static async getById(id) {
    return getById(COLLECTION, id);
  }
  
  static async getByCategoria(categoria) {
    const gastos = getAll(COLLECTION);
    return gastos.filter(g => g.categoria === categoria);
  }
  
  static async getByMesAño(mes, año) {
    const gastos = getAll(COLLECTION);
    return gastos.filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === mes - 1 && fecha.getFullYear() === parseInt(año);
    });
  }
  
  static async create(gastoData) {
    const newGasto = {
      id: gastoData.id || `gasto_${Date.now()}`,
      concepto: gastoData.concepto,
      monto: gastoData.monto,
      categoria: gastoData.categoria,
      proveedor: gastoData.proveedor,
      fecha: gastoData.fecha || new Date().toISOString(),
      comprobante: gastoData.comprobante || null,
      notas: gastoData.notas || '',
      createdAt: new Date().toISOString(),
      createdBy: gastoData.createdBy
    };
    
    return create(COLLECTION, newGasto);
  }
  
  static async update(id, updates) {
    return update(COLLECTION, id, updates);
  }
  
  static async delete(id) {
    return remove(COLLECTION, id);
  }
  
  static async getTotalByMesAño(mes, año) {
    const gastos = await this.getByMesAño(mes, año);
    return gastos.reduce((total, gasto) => total + gasto.monto, 0);
  }
  
  static async getTotalByCategoria(categoria) {
    const gastos = await this.getByCategoria(categoria);
    return gastos.reduce((total, gasto) => total + gasto.monto, 0);
  }
}