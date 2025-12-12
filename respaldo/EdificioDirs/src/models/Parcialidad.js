import { readData, writeData } from '../data.js';

export default class Parcialidad {
  static async getConfig() {
    const data = readData();
    return data.parcialidades2026;
  }
  
  static async updateConfig(updates) {
    const data = readData();
    data.parcialidades2026 = { ...data.parcialidades2026, ...updates };
    return writeData(data) ? data.parcialidades2026 : null;
  }
  
  static async getPagos() {
    const data = readData();
    return data.parcialidades2026.pagos || [];
  }
  
  static async getPagosByDepartamento(departamento) {
    const pagos = await this.getPagos();
    return pagos.filter(p => p.departamento === departamento);
  }
  
  static async registrarPago(pagoData) {
    const data = readData();
    
    const nuevoPago = {
      id: pagoData.id || `parcialidad_${Date.now()}`,
      departamento: pagoData.departamento,
      monto: pagoData.monto,
      fecha: pagoData.fecha || new Date().toISOString(),
      comprobante: pagoData.comprobante || null,
      notas: pagoData.notas || '',
      createdAt: new Date().toISOString()
    };
    
    if (!data.parcialidades2026.pagos) {
      data.parcialidades2026.pagos = [];
    }
    
    data.parcialidades2026.pagos.push(nuevoPago);
    return writeData(data) ? nuevoPago : null;
  }
  
  static async getTotalPagadoPorDepartamento(departamento) {
    const pagos = await this.getPagosByDepartamento(departamento);
    return pagos.reduce((total, pago) => total + pago.monto, 0);
  }
  
  static async getEstadoPagos() {
    const config = await this.getConfig();
    const pagos = await this.getPagos();
    
    // Agrupar pagos por departamento
    const pagosPorDepartamento = {};
    pagos.forEach(pago => {
      if (!pagosPorDepartamento[pago.departamento]) {
        pagosPorDepartamento[pago.departamento] = 0;
      }
      pagosPorDepartamento[pago.departamento] += pago.monto;
    });
    
    // Crear resumen de estado de pagos
    const estadoPagos = [];
    for (let i = 1; i <= 20; i++) {
      const departamento = i.toString();
      const pagado = pagosPorDepartamento[departamento] || 0;
      const pendiente = config.montoPorDepartamento - pagado;
      const porcentaje = (pagado / config.montoPorDepartamento) * 100;
      
      estadoPagos.push({
        departamento,
        pagado,
        pendiente,
        porcentaje,
        completado: pendiente <= 0
      });
    }
    
    return estadoPagos;
  }
}