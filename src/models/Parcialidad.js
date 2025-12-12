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
    
    // Inicializar si no existe
    if (!data.parcialidades2026) {
      data.parcialidades2026 = {
        objetivo: 285000,
        pagos: []
      };
      writeData(data);
    }
    
    return data.parcialidades2026.pagos || [];
  }
  
  static async getPagosByDepartamento(departamento) {
    const pagos = await this.getPagos();
    return pagos.filter(p => p.departamento === departamento);
  }
  
  static async registrarPago(pagoData) {
    const data = readData();
    
    // Inicializar parcialidades2026 si no existe
    if (!data.parcialidades2026) {
      data.parcialidades2026 = {
        objetivo: 285000,
        pagos: []
      };
    }
    
    if (!data.parcialidades2026.pagos) {
      data.parcialidades2026.pagos = [];
    }
    
    const nuevoPago = {
      id: data.parcialidades2026.pagos.length > 0 
        ? Math.max(...data.parcialidades2026.pagos.map(p => p.id || 0)) + 1 
        : 1,
      departamento: pagoData.departamento,
      monto: pagoData.monto,
      fecha: pagoData.fecha || new Date().toISOString(),
      comprobante: pagoData.comprobante || null,
      notas: pagoData.notas || '',
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    };
    
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
    
    // Agrupar pagos por departamento - SOLO VALIDADOS
    const pagosPorDepartamento = {};
    pagos.forEach(pago => {
      // Solo contar pagos validados en el progreso
      if (pago.estado === 'validado') {
        if (!pagosPorDepartamento[pago.departamento]) {
          pagosPorDepartamento[pago.departamento] = 0;
        }
        pagosPorDepartamento[pago.departamento] += pago.monto;
      }
    });
    
    // Crear resumen de estado de pagos - usando departamentos reales (101-504)
    const estadoPagos = [];
    const departamentosReales = [
      '101', '102', '103', '104',
      '201', '202', '203', '204',
      '301', '302', '303', '304',
      '401', '402', '403', '404',
      '501', '502', '503', '504'
    ];
    
    departamentosReales.forEach(depto => {
      const pagado = pagosPorDepartamento[depto] || 0;
      const pendiente = config.montoPorDepartamento - pagado;
      const porcentaje = (pagado / config.montoPorDepartamento) * 100;
      
      estadoPagos.push({
        departamento: depto,
        pagado,
        pendiente: pendiente > 0 ? pendiente : 0,
        porcentaje: porcentaje > 0 ? porcentaje : 0,
        completado: pendiente <= 0
      });
    });
    
    return estadoPagos;
  }
}