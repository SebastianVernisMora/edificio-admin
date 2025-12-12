// presupuestos-api.test.js - Tests de integración para la API de presupuestos

import request from 'supertest';
import express from 'express';
import presupuestosRouter from '../src/routes/presupuestos.js';
import { Presupuesto } from '../src/models/Presupuesto.js';
import { getData, setData } from '../src/data.js';

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

// Mock para middleware de autenticación
jest.mock('../src/middleware/auth.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, nombre: 'Admin Test', rol: 'ADMIN' };
    next();
  },
  hasPermission: (permission) => (req, res, next) => {
    next();
  }
}));

describe('API de Presupuestos', () => {
  let app;
  
  beforeEach(() => {
    // Configurar app de Express para tests
    app = express();
    app.use(express.json());
    app.use('/api/presupuestos', presupuestosRouter);
    
    // Reiniciar datos mock
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

  test('GET /api/presupuestos debe retornar todos los presupuestos', async () => {
    const response = await request(app).get('/api/presupuestos');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.presupuestos).toHaveLength(2);
  });

  test('GET /api/presupuestos con filtros debe filtrar correctamente', async () => {
    const response = await request(app)
      .get('/api/presupuestos')
      .query({ anio: 2025, categoria: 'Mantenimiento' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.presupuestos).toHaveLength(1);
    expect(response.body.presupuestos[0].categoria).toBe('Mantenimiento');
  });

  test('GET /api/presupuestos/:id debe retornar un presupuesto específico', async () => {
    const response = await request(app).get('/api/presupuestos/1');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.presupuesto.id).toBe(1);
    expect(response.body.presupuesto.titulo).toBe('Presupuesto de prueba 1');
  });

  test('GET /api/presupuestos/:id con ID inexistente debe retornar 404', async () => {
    const response = await request(app).get('/api/presupuestos/999');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/presupuestos debe crear un nuevo presupuesto', async () => {
    const nuevoPresupuesto = {
      titulo: 'Nuevo presupuesto de test',
      monto: 30000,
      categoria: 'Limpieza',
      descripcion: 'Descripción de test',
      anio: 2026
    };
    
    const response = await request(app)
      .post('/api/presupuestos')
      .send(nuevoPresupuesto);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.presupuesto.titulo).toBe('Nuevo presupuesto de test');
    expect(response.body.presupuesto.estado).toBe('borrador');
    
    // Verificar que se agregó a los datos
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(3);
  });

  test('PUT /api/presupuestos/:id debe actualizar un presupuesto', async () => {
    const datosActualizados = {
      titulo: 'Presupuesto actualizado',
      monto: 15000
    };
    
    const response = await request(app)
      .put('/api/presupuestos/1')
      .send(datosActualizados);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.presupuesto.titulo).toBe('Presupuesto actualizado');
    expect(response.body.presupuesto.monto).toBe(15000);
    
    // Verificar que se actualizó en los datos
    const presupuesto = Presupuesto.obtenerPorId(1);
    expect(presupuesto.titulo).toBe('Presupuesto actualizado');
  });

  test('DELETE /api/presupuestos/:id debe eliminar un presupuesto', async () => {
    const response = await request(app).delete('/api/presupuestos/1');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que se eliminó de los datos
    const presupuestos = Presupuesto.obtenerTodos();
    expect(presupuestos).toHaveLength(1);
    expect(presupuestos[0].id).toBe(2);
  });

  test('PATCH /api/presupuestos/:id/aprobar debe aprobar un presupuesto', async () => {
    const response = await request(app).patch('/api/presupuestos/1/aprobar');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que se actualizó el estado
    const presupuesto = Presupuesto.obtenerPorId(1);
    expect(presupuesto.estado).toBe('aprobado');
  });

  test('PATCH /api/presupuestos/:id/rechazar debe rechazar un presupuesto', async () => {
    const response = await request(app).patch('/api/presupuestos/1/rechazar');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verificar que se actualizó el estado
    const presupuesto = Presupuesto.obtenerPorId(1);
    expect(presupuesto.estado).toBe('rechazado');
  });

  test('GET /api/presupuestos/estadisticas/resumen debe retornar estadísticas', async () => {
    const response = await request(app).get('/api/presupuestos/estadisticas/resumen');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.estadisticas).toBeDefined();
    expect(response.body.estadisticas.total).toBe(30000); // 10000 + 20000
    expect(response.body.estadisticas.ejecutado).toBe(17000); // 2000 + 15000
  });

  test('GET /api/presupuestos/alertas/exceso debe retornar alertas', async () => {
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
    
    const response = await request(app).get('/api/presupuestos/alertas/exceso');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.alertas).toHaveLength(2);
  });
});