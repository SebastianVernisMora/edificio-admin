// presupuestos.test.js - Tests para la funcionalidad de presupuestos

import { Presupuesto } from '../src/models/Presupuesto.js';
import { getData, setData } from '../src/data.js';
import assert from 'assert';

// Mock para data.js
jest.mock('../src/data.js', () => {
  let mockData = {
    presupuestos: []
  };
  
  return {
    getData: jest.fn(() => mockData),
    setData: jest.fn(data => { mockData = data; }),
    saveData: jest.fn(() => Promise.resolve())
  };
});

describe('Modelo Presupuesto', () => {
  beforeEach(() => {
    // Reiniciar datos mock antes de cada test
    setData({
      presupuestos: [
        {
          id: 1,
          titulo: 'Presupuesto de prueba 1',
          monto: 10000,
          categoria: 'Mantenimiento',
          descripcion: 'Descripción de prueba 1',
          fecha_creacion: '2025-01-01T00:00:00.000Z',
          estado: 'borrador',
          anio: 2025,
          monto_ejecutado: 2000
        },
        {
          id: 2,
          titulo: 'Presupuesto de prueba 2',
          monto: 20000,
          categoria: 'Reparación',
          descripcion: 'Descripción de prueba 2',
          fecha_creacion: '2025-01-02T00:00:00.000Z',
          estado: 'aprobado',
          anio: 2025,
          monto_ejecutado: 15000
        }
      ]
    });
  });

  test('obtenerTodos debe retornar todos los presupuestos', () => {
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(2);
    expect(presupuestos[0].id).toBe(1);
    expect(presupuestos[1].id).toBe(2);
  });

  test('obtenerPorId debe retornar el presupuesto correcto', () => {
    const presupuesto = Presupuesto.obtenerPorId(1);
    expect(presupuesto).not.toBeNull();
    expect(presupuesto.id).toBe(1);
    expect(presupuesto.titulo).toBe('Presupuesto de prueba 1');
  });

  test('obtenerPorId debe retornar null si no existe el presupuesto', () => {
    const presupuesto = Presupuesto.obtenerPorId(999);
    expect(presupuesto).toBeNull();
  });

  test('obtenerPorAnio debe filtrar por año', () => {
    const presupuestos = Presupuesto.obtenerPorAnio(2025);
    expect(presupuestos).toHaveLength(2);
    
    const presupuestos2026 = Presupuesto.obtenerPorAnio(2026);
    expect(presupuestos2026).toHaveLength(0);
  });

  test('obtenerPorCategoria debe filtrar por categoría', () => {
    const presupuestos = Presupuesto.obtenerPorCategoria('Mantenimiento');
    expect(presupuestos).toHaveLength(1);
    expect(presupuestos[0].categoria).toBe('Mantenimiento');
  });

  test('crear debe agregar un nuevo presupuesto', async () => {
    const nuevoDato = {
      titulo: 'Nuevo presupuesto',
      monto: 30000,
      categoria: 'Limpieza',
      descripcion: 'Nueva descripción',
      anio: 2026
    };
    
    const nuevoPresupuesto = await Presupuesto.crear(nuevoDato);
    expect(nuevoPresupuesto).not.toBeNull();
    expect(nuevoPresupuesto.id).toBe(3); // Siguiente ID después de 1 y 2
    expect(nuevoPresupuesto.titulo).toBe('Nuevo presupuesto');
    expect(nuevoPresupuesto.estado).toBe('borrador');
    expect(nuevoPresupuesto.monto_ejecutado).toBe(0);
    
    // Verificar que se guardó en los datos
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(3);
  });

  test('actualizar debe modificar un presupuesto existente', async () => {
    const datosActualizados = {
      titulo: 'Presupuesto actualizado',
      monto: 15000
    };
    
    const presupuestoActualizado = await Presupuesto.actualizar(1, datosActualizados);
    expect(presupuestoActualizado).not.toBeNull();
    expect(presupuestoActualizado.id).toBe(1);
    expect(presupuestoActualizado.titulo).toBe('Presupuesto actualizado');
    expect(presupuestoActualizado.monto).toBe(15000);
    // Verificar que otros campos no cambiaron
    expect(presupuestoActualizado.categoria).toBe('Mantenimiento');
  });

  test('actualizar debe retornar null si el presupuesto no existe', async () => {
    const presupuestoActualizado = await Presupuesto.actualizar(999, { titulo: 'No existe' });
    expect(presupuestoActualizado).toBeNull();
  });

  test('eliminar debe remover un presupuesto', async () => {
    const resultado = await Presupuesto.eliminar(1);
    expect(resultado).toBe(true);
    
    // Verificar que se eliminó
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(1);
    expect(presupuestos[0].id).toBe(2);
  });

  test('eliminar debe retornar false si el presupuesto no existe', async () => {
    const resultado = await Presupuesto.eliminar(999);
    expect(resultado).toBe(false);
    
    // Verificar que no se modificó la cantidad
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(2);
  });

  test('obtenerEstadisticas debe calcular correctamente', () => {
    const estadisticas = Presupuesto.obtenerEstadisticas(2025);
    
    expect(estadisticas.anio).toBe(2025);
    expect(estadisticas.total).toBe(30000); // 10000 + 20000
    expect(estadisticas.ejecutado).toBe(17000); // 2000 + 15000
    expect(estadisticas.disponible).toBe(13000); // 30000 - 17000
    expect(parseFloat(estadisticas.porcentajeEjecucion)).toBeCloseTo(56.67, 1); // (17000/30000)*100
    
    // Verificar categorías
    expect(estadisticas.porCategoria).toHaveProperty('Mantenimiento');
    expect(estadisticas.porCategoria).toHaveProperty('Reparación');
    expect(estadisticas.porCategoria.Mantenimiento.presupuestado).toBe(10000);
    expect(estadisticas.porCategoria.Mantenimiento.ejecutado).toBe(2000);
    expect(estadisticas.porCategoria.Reparación.presupuestado).toBe(20000);
    expect(estadisticas.porCategoria.Reparación.ejecutado).toBe(15000);
  });

  test('obtenerAlertasExceso debe identificar presupuestos excedidos', () => {
    // Modificar un presupuesto para que esté excedido
    setData({
      presupuestos: [
        {
          id: 1,
          titulo: 'Presupuesto de prueba 1',
          monto: 10000,
          categoria: 'Mantenimiento',
          descripcion: 'Descripción de prueba 1',
          fecha_creacion: '2025-01-01T00:00:00.000Z',
          estado: 'borrador',
          anio: 2025,
          monto_ejecutado: 9000 // 90% ejecutado
        },
        {
          id: 2,
          titulo: 'Presupuesto de prueba 2',
          monto: 20000,
          categoria: 'Reparación',
          descripcion: 'Descripción de prueba 2',
          fecha_creacion: '2025-01-02T00:00:00.000Z',
          estado: 'aprobado',
          anio: 2025,
          monto_ejecutado: 21000 // 105% ejecutado (excedido)
        }
      ]
    });
    
    const alertas = Presupuesto.obtenerAlertasExceso();
    
    expect(alertas).toHaveLength(2);
    
    // Verificar alerta de advertencia (cerca del límite)
    const alertaAdvertencia = alertas.find(a => a.tipo === 'advertencia');
    expect(alertaAdvertencia).toBeDefined();
    expect(alertaAdvertencia.presupuesto.id).toBe(1);
    
    // Verificar alerta crítica (excedido)
    const alertaCritica = alertas.find(a => a.tipo === 'critico');
    expect(alertaCritica).toBeDefined();
    expect(alertaCritica.presupuesto.id).toBe(2);
  });
});