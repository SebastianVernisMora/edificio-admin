import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loadData, saveData, getData } from './data.js';

// Importar rutas
import gastosRoutes from './routes/gastos.js';
import cierresRoutes from './routes/cierres.js';
import usuariosRoutes from './routes/usuarios.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

await loadData();

function verificarToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ mensaje: 'No se proporcionó token de autorización' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = getData();
    const usuario = data.usuarios.find(u => u.id === decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    req.usuario = { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol,
      departamento: usuario.departamento
    };
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

function requiereAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = getData();
    
    const usuario = data.usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

app.get('/api/auth/perfil', verificarToken, (req, res) => {
  const data = getData();
  const usuario = data.usuarios.find(u => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  const { password: _, ...usuarioSinPassword } = usuario;
  res.json(usuarioSinPassword);
});

app.get('/api/presupuestos', verificarToken, (req, res) => {
  const data = getData();
  res.json(data.presupuestos);
});

app.get('/api/presupuestos/:id', verificarToken, (req, res) => {
  const data = getData();
  const presupuesto = data.presupuestos.find(p => p.id === parseInt(req.params.id));
  
  if (!presupuesto) {
    return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
  }

  res.json(presupuesto);
});

app.post('/api/presupuestos', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const nuevoPresupuesto = {
    id: data.nextId.presupuestos++,
    ...req.body,
    estado: 'pendiente',
    created_at: new Date().toISOString()
  };

  data.presupuestos.push(nuevoPresupuesto);
  await saveData();

  res.status(201).json({
    mensaje: 'Presupuesto creado exitosamente',
    presupuesto: nuevoPresupuesto
  });
});

app.patch('/api/presupuestos/:id/aprobar', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const presupuesto = data.presupuestos.find(p => p.id === parseInt(req.params.id));
  
  if (!presupuesto) {
    return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
  }

  presupuesto.estado = 'aprobado';
  await saveData();
  res.json({ mensaje: 'Presupuesto aprobado exitosamente' });
});

app.patch('/api/presupuestos/:id/rechazar', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const presupuesto = data.presupuestos.find(p => p.id === parseInt(req.params.id));
  
  if (!presupuesto) {
    return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
  }

  presupuesto.estado = 'rechazado';
  await saveData();
  res.json({ mensaje: 'Presupuesto rechazado' });
});

app.delete('/api/presupuestos/:id', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const index = data.presupuestos.findIndex(p => p.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
  }

  data.presupuestos.splice(index, 1);
  await saveData();
  res.json({ mensaje: 'Presupuesto eliminado exitosamente' });
});

app.get('/api/cuotas', verificarToken, (req, res) => {
  const data = getData();
  
  let cuotas = data.cuotas.map(cuota => {
    const usuario = data.usuarios.find(u => u.id === cuota.usuario_id);
    return {
      ...cuota,
      usuario_nombre: usuario?.nombre || 'Usuario no encontrado',
      departamento: usuario?.departamento || 'N/A'
    };
  });

  if (req.usuario.rol !== 'admin') {
    cuotas = cuotas.filter(c => c.usuario_id === req.usuario.id);
  }

  res.json(cuotas);
});

app.get('/api/cuotas/estadisticas', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  const cuotasEstesMes = data.cuotas.filter(c => {
    const fechaVenc = new Date(c.fecha_vencimiento);
    const ahora = new Date();
    return fechaVenc.getMonth() === ahora.getMonth() && fechaVenc.getFullYear() === ahora.getFullYear();
  });

  const estadisticas = {
    total_cuotas: cuotasEstesMes.length,
    cuotas_pagadas: cuotasEstesMes.filter(c => c.pagado).length,
    cuotas_pendientes: cuotasEstesMes.filter(c => !c.pagado).length,
    monto_total: cuotasEstesMes.reduce((sum, c) => sum + c.monto, 0),
    monto_pagado: cuotasEstesMes.filter(c => c.pagado).reduce((sum, c) => sum + c.monto, 0),
    monto_pendiente: cuotasEstesMes.filter(c => !c.pagado).reduce((sum, c) => sum + c.monto, 0)
  };

  res.json(estadisticas);
});

app.post('/api/cuotas', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { tipo, usuario_id, ...datosCuota } = req.body;

  if (tipo === 'todos') {
    const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
    const cuotasCreadas = [];

    inquilinos.forEach(inquilino => {
      const nuevaCuota = {
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        ...datosCuota,
        pagado: false,
        created_at: new Date().toISOString()
      };
      data.cuotas.push(nuevaCuota);
      cuotasCreadas.push(nuevaCuota.id);
    });

    await saveData();
    res.status(201).json({
      mensaje: `Cuotas creadas para todos los inquilinos (${cuotasCreadas.length} cuotas)`,
      cuotasCreadas: cuotasCreadas.length
    });
  } else {
    const nuevaCuota = {
      id: data.nextId.cuotas++,
      usuario_id: parseInt(usuario_id),
      ...datosCuota,
      pagado: false,
      created_at: new Date().toISOString()
    };

    data.cuotas.push(nuevaCuota);
    await saveData();

    res.status(201).json({
      mensaje: 'Cuota creada exitosamente',
      cuota: nuevaCuota
    });
  }
});

app.patch('/api/cuotas/:id/pagar', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const cuota = data.cuotas.find(c => c.id === parseInt(req.params.id));
  
  if (!cuota) {
    return res.status(404).json({ mensaje: 'Cuota no encontrada' });
  }

  const { metodo_pago, comprobante_url } = req.body;
  cuota.pagado = true;
  cuota.fecha_pago = new Date().toISOString();
  cuota.metodo_pago = metodo_pago;
  cuota.comprobante_url = comprobante_url;
  cuota.validado_por = req.usuario.id;

  await saveData();
  res.json({ mensaje: 'Cuota validada como pagada exitosamente' });
});

app.delete('/api/cuotas/:id', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const index = data.cuotas.findIndex(c => c.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Cuota no encontrada' });
  }

  data.cuotas.splice(index, 1);
  await saveData();
  res.json({ mensaje: 'Cuota eliminada exitosamente' });
});

app.get('/api/anuncios', verificarToken, (req, res) => {
  const data = getData();
  
  let anuncios = data.anuncios.map(anuncio => {
    const autor = data.usuarios.find(u => u.id === anuncio.autor_id);
    return {
      ...anuncio,
      autor_nombre: autor?.nombre || 'Usuario no encontrado'
    };
  });

  if (req.usuario.rol !== 'admin') {
    const ahora = new Date();
    anuncios = anuncios.filter(a => 
      a.activo && (!a.fecha_expiracion || new Date(a.fecha_expiracion) >= ahora)
    );
  }

  res.json(anuncios);
});

app.post('/api/anuncios', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const nuevoAnuncio = {
    id: data.nextId.anuncios++,
    ...req.body,
    autor_id: req.usuario.id,
    activo: true,
    created_at: new Date().toISOString()
  };

  data.anuncios.push(nuevoAnuncio);
  await saveData();

  res.status(201).json({
    mensaje: 'Anuncio creado exitosamente',
    anuncio: nuevoAnuncio
  });
});

app.patch('/api/anuncios/:id/desactivar', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const anuncio = data.anuncios.find(a => a.id === parseInt(req.params.id));
  
  if (!anuncio) {
    return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
  }

  anuncio.activo = false;
  await saveData();
  res.json({ mensaje: 'Anuncio desactivado exitosamente' });
});

app.delete('/api/anuncios/:id', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const index = data.anuncios.findIndex(a => a.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Anuncio no encontrado' });
  }

  data.anuncios.splice(index, 1);
  await saveData();
  res.json({ mensaje: 'Anuncio eliminado exitosamente' });
});

app.get('/api/solicitudes', verificarToken, (req, res) => {
  const data = getData();
  
  let solicitudes = data.solicitudes.map(solicitud => {
    const usuario = data.usuarios.find(u => u.id === solicitud.usuario_id);
    return {
      ...solicitud,
      usuario_nombre: usuario?.nombre || 'Usuario no encontrado',
      departamento: usuario?.departamento || 'N/A'
    };
  });

  if (req.usuario.rol !== 'admin') {
    solicitudes = solicitudes.filter(s => s.usuario_id === req.usuario.id);
  }

  res.json(solicitudes);
});

app.get('/api/solicitudes/estadisticas', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  const estadisticas = {};
  
  data.solicitudes.forEach(solicitud => {
    estadisticas[solicitud.estado] = (estadisticas[solicitud.estado] || 0) + 1;
  });

  const result = Object.entries(estadisticas).map(([estado, cantidad]) => ({
    estado,
    cantidad
  }));

  res.json(result);
});

app.post('/api/solicitudes', verificarToken, async (req, res) => {
  const data = getData();
  const nuevaSolicitud = {
    id: data.nextId.solicitudes++,
    ...req.body,
    usuario_id: req.usuario.id,
    estado: 'pendiente',
    created_at: new Date().toISOString()
  };

  data.solicitudes.push(nuevaSolicitud);
  await saveData();

  res.status(201).json({
    mensaje: 'Solicitud creada exitosamente',
    solicitud: nuevaSolicitud
  });
});

app.post('/api/solicitudes/:id/responder', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const solicitud = data.solicitudes.find(s => s.id === parseInt(req.params.id));
  
  if (!solicitud) {
    return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
  }

  const { respuesta, estado } = req.body;
  solicitud.respuesta = respuesta;
  solicitud.estado = estado || 'completada';
  solicitud.fecha_respuesta = new Date().toISOString();

  await saveData();
  res.json({ mensaje: 'Solicitud respondida exitosamente' });
});

app.delete('/api/solicitudes/:id', verificarToken, async (req, res) => {
  const data = getData();
  const index = data.solicitudes.findIndex(s => s.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
  }

  const solicitud = data.solicitudes[index];
  
  if (req.usuario.rol !== 'admin' && solicitud.usuario_id !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No tiene permisos para eliminar esta solicitud' });
  }

  data.solicitudes.splice(index, 1);
  await saveData();
  res.json({ mensaje: 'Solicitud eliminada exitosamente' });
});

// Rutas para gastos
app.get('/api/gastos', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  res.json(data.gastos || []);
});

app.post('/api/gastos', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  if (!data.gastos) data.gastos = [];
  
  const nuevoGasto = {
    id: data.nextId.gastos++,
    ...req.body,
    created_at: new Date().toISOString()
  };

  data.gastos.push(nuevoGasto);
  await saveData();

  res.status(201).json({
    mensaje: 'Gasto registrado exitosamente',
    gasto: nuevoGasto
  });
});

app.delete('/api/gastos/:id', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  if (!data.gastos) data.gastos = [];
  
  const index = data.gastos.findIndex(g => g.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Gasto no encontrado' });
  }

  data.gastos.splice(index, 1);
  await saveData();
  res.json({ mensaje: 'Gasto eliminado exitosamente' });
});

// Rutas para cierres contables
app.get('/api/cierres', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  res.json(data.cierres_contables || []);
});

app.get('/api/cierres/estadisticas', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  const { periodo, tipo } = req.query; // periodo: 2024-01, tipo: mensual/anual
  
  let fechaInicio, fechaFin;
  
  if (tipo === 'anual') {
    const año = periodo || new Date().getFullYear();
    fechaInicio = `${año}-01-01`;
    fechaFin = `${año}-12-31`;
  } else {
    const [año, mes] = (periodo || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`).split('-');
    const ultimoDiaMes = new Date(año, mes, 0).getDate();
    fechaInicio = `${año}-${mes}-01`;
    fechaFin = `${año}-${mes}-${ultimoDiaMes}`;
  }

  // Calcular ingresos (cuotas pagadas en el período)
  const cuotasPeriodo = (data.cuotas || []).filter(c => {
    if (!c.fecha_pago) return false;
    const fechaPago = c.fecha_pago.split('T')[0];
    return fechaPago >= fechaInicio && fechaPago <= fechaFin;
  });

  // Calcular egresos (gastos en el período)
  const gastosPeriodo = (data.gastos || []).filter(g => {
    return g.fecha >= fechaInicio && g.fecha <= fechaFin;
  });

  const totalIngresos = cuotasPeriodo.reduce((sum, c) => sum + c.monto, 0);
  const totalEgresos = gastosPeriodo.reduce((sum, g) => sum + g.monto, 0);

  // Cuotas pendientes del período
  const cuotasPendientes = (data.cuotas || []).filter(c => {
    if (c.pagado) return false;
    const fechaVenc = c.fecha_vencimiento;
    return fechaVenc >= fechaInicio && fechaVenc <= fechaFin;
  });

  const estadisticas = {
    periodo: periodo || (tipo === 'anual' ? new Date().getFullYear().toString() : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`),
    tipo: tipo || 'mensual',
    resumen: {
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      saldo: totalIngresos - totalEgresos,
      cuotas_pagadas: cuotasPeriodo.length,
      cuotas_pendientes: cuotasPendientes.length,
      monto_pendiente: cuotasPendientes.reduce((sum, c) => sum + c.monto, 0)
    },
    detalle_ingresos: cuotasPeriodo.map(c => ({
      concepto: c.concepto,
      monto: c.monto,
      fecha: c.fecha_pago,
      usuario: data.usuarios.find(u => u.id === c.usuario_id)?.nombre || 'Usuario no encontrado'
    })),
    detalle_egresos: gastosPeriodo.map(g => ({
      concepto: g.concepto,
      monto: g.monto,
      fecha: g.fecha,
      categoria: g.categoria,
      proveedor: g.proveedor
    })),
    gastos_por_categoria: gastosPeriodo.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
      return acc;
    }, {}),
    cuotas_pendientes_detalle: cuotasPendientes.map(c => ({
      usuario: data.usuarios.find(u => u.id === c.usuario_id)?.nombre || 'Usuario no encontrado',
      departamento: data.usuarios.find(u => u.id === c.usuario_id)?.departamento || 'N/A',
      concepto: c.concepto,
      monto: c.monto,
      fecha_vencimiento: c.fecha_vencimiento
    }))
  };

  res.json(estadisticas);
});

app.post('/api/cierres', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  if (!data.cierres_contables) data.cierres_contables = [];
  
  const { periodo, tipo } = req.body;
  
  // Verificar si ya existe un cierre para este período
  const cierreExistente = data.cierres_contables.find(c => c.periodo === periodo && c.tipo === tipo);
  if (cierreExistente) {
    return res.status(400).json({ mensaje: 'Ya existe un cierre para este período' });
  }

  // Obtener estadísticas del período para crear el cierre
  const estadisticas = await new Promise((resolve) => {
    req.query = { periodo, tipo };
    const mockRes = {
      json: (data) => resolve(data)
    };
    // Simular la llamada al endpoint de estadísticas
    const fechaInicio = tipo === 'anual' ? `${periodo}-01-01` : `${periodo}-01`;
    const fechaFin = tipo === 'anual' ? `${periodo}-12-31` : `${periodo}-31`;
    
    const cuotasPeriodo = (data.cuotas || []).filter(c => {
      if (!c.fecha_pago) return false;
      const fechaPago = c.fecha_pago.split('T')[0];
      return fechaPago >= fechaInicio && fechaPago <= fechaFin;
    });

    const gastosPeriodo = (data.gastos || []).filter(g => {
      return g.fecha >= fechaInicio && g.fecha <= fechaFin;
    });

    const totalIngresos = cuotasPeriodo.reduce((sum, c) => sum + c.monto, 0);
    const totalEgresos = gastosPeriodo.reduce((sum, g) => sum + g.monto, 0);

    resolve({
      resumen: {
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        saldo: totalIngresos - totalEgresos,
        cuotas_pagadas: cuotasPeriodo.length,
        cuotas_pendientes: 0
      }
    });
  });

  const nuevoCierre = {
    id: data.nextId.cierres_contables++,
    periodo,
    tipo,
    fecha_cierre: new Date().toISOString().split('T')[0],
    total_ingresos: estadisticas.resumen.total_ingresos,
    total_egresos: estadisticas.resumen.total_egresos,
    saldo: estadisticas.resumen.saldo,
    estado: 'cerrado',
    created_at: new Date().toISOString()
  };

  data.cierres_contables.push(nuevoCierre);
  await saveData();

  res.status(201).json({
    mensaje: 'Cierre contable creado exitosamente',
    cierre: nuevoCierre
  });
});

// Ruta para generar cuotas anuales completas
app.post('/api/cuotas/generar-anual', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { año, monto } = req.body;
  
  const montoFinal = monto || 550; // Monto por defecto $550 MXN (400 mantenimiento + 150 fondo basura)
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Verificar si ya existen cuotas para este año
  const cuotasExistentes = data.cuotas.filter(c => 
    c.concepto.includes(año.toString())
  );

  if (cuotasExistentes.length > 0) {
    return res.status(400).json({ mensaje: `Ya existen cuotas para el año ${año}` });
  }

  const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
  const cuotasCreadas = [];

  inquilinos.forEach(inquilino => {
    for (let mes = 0; mes < 12; mes++) {
      const fechaVencimiento = new Date(año, mes, 10);
      const nuevaCuota = {
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        concepto: `Expensas ${meses[mes]} ${año}`,
        monto: montoFinal,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        validado_por: null,
        created_at: new Date().toISOString()
      };
      data.cuotas.push(nuevaCuota);
      cuotasCreadas.push(nuevaCuota.id);
    }
  });

  await saveData();

  res.status(201).json({
    mensaje: `Cuotas anuales generadas para ${inquilinos.length} inquilinos`,
    año,
    monto: montoFinal,
    cuotasCreadas: cuotasCreadas.length,
    totalCuotas: inquilinos.length * 12
  });
});

// Ruta para generar cuotas mensuales (individual)
app.post('/api/cuotas/generar-mensual', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { mes, año, monto } = req.body;
  
  const montoFinal = monto || 550;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const nombreMes = meses[mes - 1];
  const fechaVencimiento = `${año}-${String(mes).padStart(2, '0')}-10`;

  // Verificar si ya existen cuotas para este período
  const cuotasExistentes = data.cuotas.filter(c => 
    c.concepto === `Expensas ${nombreMes} ${año}`
  );

  if (cuotasExistentes.length > 0) {
    return res.status(400).json({ mensaje: `Ya existen cuotas para ${nombreMes} ${año}` });
  }

  const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
  const cuotasCreadas = [];

  inquilinos.forEach(inquilino => {
    const nuevaCuota = {
      id: data.nextId.cuotas++,
      usuario_id: inquilino.id,
      concepto: `Expensas ${nombreMes} ${año}`,
      monto: montoFinal,
      fecha_vencimiento: fechaVencimiento,
      pagado: false,
      fecha_pago: null,
      metodo_pago: null,
      validado_por: null,
      created_at: new Date().toISOString()
    };
    data.cuotas.push(nuevaCuota);
    cuotasCreadas.push(nuevaCuota.id);
  });

  await saveData();

  res.status(201).json({
    mensaje: `Cuotas de ${nombreMes} ${año} generadas para ${inquilinos.length} inquilinos`,
    periodo: `${nombreMes} ${año}`,
    monto: montoFinal,
    cuotasCreadas: cuotasCreadas.length,
    fechaVencimiento
  });
});

// Ruta para marcar múltiples cuotas como pagadas
app.post('/api/cuotas/pagar-multiple', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { cuotaIds, metodo_pago } = req.body;
  
  if (!Array.isArray(cuotaIds) || cuotaIds.length === 0) {
    return res.status(400).json({ mensaje: 'Debe proporcionar al menos una cuota para marcar como pagada' });
  }

  let cuotasPagadas = 0;
  let montoTotal = 0;

  cuotaIds.forEach(id => {
    const cuota = data.cuotas.find(c => c.id === parseInt(id));
    if (cuota && !cuota.pagado) {
      cuota.pagado = true;
      cuota.fecha_pago = new Date().toISOString();
      cuota.metodo_pago = metodo_pago || 'efectivo';
      cuota.validado_por = req.usuario.id;
      if (cuota.tipo_cuota === 'fondo_mayor') {
        cuota.monto_pagado = cuota.monto; // Marcar como completamente pagado
      }
      cuotasPagadas++;
      montoTotal += cuota.monto;
    }
  });

  await saveData();

  res.json({
    mensaje: `${cuotasPagadas} cuotas marcadas como pagadas`,
    cuotasPagadas,
    montoTotal
  });
});

// Rutas para manejar parcialidades del fondo de gastos mayores
app.get('/api/cuotas/:id/parcialidades', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  if (!data.parcialidades) data.parcialidades = [];
  
  const parcialidades = data.parcialidades.filter(p => p.cuota_id === parseInt(req.params.id));
  res.json(parcialidades);
});

app.post('/api/cuotas/:id/parcialidad', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  if (!data.parcialidades) data.parcialidades = [];
  
  const cuotaId = parseInt(req.params.id);
  const cuota = data.cuotas.find(c => c.id === cuotaId);
  
  if (!cuota) {
    return res.status(404).json({ mensaje: 'Cuota no encontrada' });
  }

  if (cuota.tipo_cuota !== 'fondo_mayor') {
    return res.status(400).json({ mensaje: 'Las parcialidades solo aplican para el Fondo de Gastos Mayores' });
  }

  const { monto_parcialidad, metodo_pago, fecha_pago, observaciones } = req.body;

  // Validar que la parcialidad no exceda el saldo pendiente
  const parcialidadesExistentes = data.parcialidades.filter(p => p.cuota_id === cuotaId);
  const totalPagado = parcialidadesExistentes.reduce((sum, p) => sum + p.monto, 0);
  const saldoPendiente = cuota.monto - totalPagado;

  if (monto_parcialidad > saldoPendiente) {
    return res.status(400).json({ 
      mensaje: `El monto excede el saldo pendiente de $${saldoPendiente} MXN` 
    });
  }

  // Registrar la parcialidad
  const nuevaParcialidad = {
    id: data.nextId.parcialidades++,
    cuota_id: cuotaId,
    usuario_id: cuota.usuario_id,
    monto: parseFloat(monto_parcialidad),
    metodo_pago: metodo_pago || 'efectivo',
    fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
    observaciones: observaciones || '',
    validado_por: req.usuario.id,
    created_at: new Date().toISOString()
  };

  data.parcialidades.push(nuevaParcialidad);

  // Actualizar el monto pagado en la cuota
  const nuevoTotalPagado = totalPagado + parseFloat(monto_parcialidad);
  cuota.monto_pagado = nuevoTotalPagado;

  // Si se completó el pago, marcar la cuota como pagada
  if (nuevoTotalPagado >= cuota.monto) {
    cuota.pagado = true;
    cuota.fecha_pago = new Date().toISOString();
    cuota.metodo_pago = 'parcialidades_completadas';
    cuota.validado_por = req.usuario.id;
  }

  await saveData();

  res.status(201).json({
    mensaje: 'Parcialidad registrada exitosamente',
    parcialidad: nuevaParcialidad,
    saldo_pendiente: cuota.monto - nuevoTotalPagado,
    cuota_completada: cuota.pagado
  });
});

app.get('/api/cuotas/fondo-mayor/:usuarioId', verificarToken, (req, res) => {
  const data = getData();
  const usuarioId = parseInt(req.params.usuarioId);
  
  // Buscar la cuota de fondo de gastos mayores del usuario
  const cuotaFondoMayor = data.cuotas.find(c => 
    c.usuario_id === usuarioId && c.tipo_cuota === 'fondo_mayor'
  );

  if (!cuotaFondoMayor) {
    return res.status(404).json({ mensaje: 'Cuota de fondo mayor no encontrada' });
  }

  // Obtener parcialidades
  const parcialidades = (data.parcialidades || [])
    .filter(p => p.cuota_id === cuotaFondoMayor.id)
    .sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago));

  const usuario = data.usuarios.find(u => u.id === usuarioId);

  const resumen = {
    cuota: cuotaFondoMayor,
    usuario: usuario ? { nombre: usuario.nombre, departamento: usuario.departamento } : null,
    parcialidades,
    resumen_pago: {
      monto_total: cuotaFondoMayor.monto,
      monto_pagado: cuotaFondoMayor.monto_pagado || 0,
      saldo_pendiente: cuotaFondoMayor.monto - (cuotaFondoMayor.monto_pagado || 0),
      numero_pagos: parcialidades.length,
      completado: cuotaFondoMayor.pagado
    }
  };

  res.json(resumen);
});

// Ruta para obtener saldos de fondos
app.get('/api/fondos/saldos', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  
  if (!data.saldos_fondos) {
    return res.status(404).json({ mensaje: 'Saldos de fondos no encontrados' });
  }

  // Calcular saldos actuales
  const gastosDelFondoMayor = (data.gastos || [])
    .filter(g => g.origen_fondo === 'fondo_gastos_mayores')
    .reduce((sum, g) => sum + g.monto, 0);

  const saldoActualFondoMayor = data.saldos_fondos.fondo_gastos_mayores_acumulado - gastosDelFondoMayor;

  const saldosActuales = {
    ...data.saldos_fondos,
    fondo_gastos_mayores_actual: saldoActualFondoMayor,
    gastos_utilizados_fondo_mayor: gastosDelFondoMayor,
    patrimonio_total_actual: data.saldos_fondos.fondo_ahorro_acumulado + 
                           saldoActualFondoMayor + 
                           data.saldos_fondos.dinero_operacional
  };

  res.json(saldosActuales);
});

// Ruta para generar cuotas 2026
app.post('/api/cuotas/generar-2026', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const año2026 = 2026;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Verificar que no existan cuotas 2026
  const cuotas2026Existentes = data.cuotas.filter(c => c.concepto.includes('2026'));
  if (cuotas2026Existentes.length > 0) {
    return res.status(400).json({ mensaje: 'Ya existen cuotas para 2026' });
  }

  const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
  let cuotasCreadas = 0;

  inquilinos.forEach(inquilino => {
    // 12 Cuotas Mensuales de $550 - Vencen el 1 del mes siguiente
    for (let mes = 0; mes < 12; mes++) {
      const fechaVencimiento = new Date(año2026, mes + 1, 1); // Vencen el 1 del mes siguiente
      
      data.cuotas.push({
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        concepto: `Cuota Mensual ${meses[mes]} ${año2026}`,
        descripcion: 'Mantenimiento Operacional ($400) + Fondo Ahorro Basura ($150)',
        monto: 550,
        tipo_cuota: 'mensual',
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        validado_por: null,
        created_at: '2025-12-31T00:00:00.000Z'
      });
      cuotasCreadas++;
    }

    // 1 Cuota Anual de Fondo de Gastos Mayores - Vence 1 de abril
    data.cuotas.push({
      id: data.nextId.cuotas++,
      usuario_id: inquilino.id,
      concepto: `Fondo Gastos Mayores ${año2026}`,
      descripcion: 'Fondo para reparaciones mayores y proyectos de infraestructura',
      monto: 5000,
      tipo_cuota: 'fondo_mayor',
      fecha_vencimiento: '2026-04-01', // Vence el 1 de abril (tienen enero, febrero, marzo)
      pagado: false,
      monto_pagado: 0,
      fecha_pago: null,
      metodo_pago: null,
      validado_por: null,
      puede_parcialidades: true,
      created_at: '2025-12-31T00:00:00.000Z'
    });
    cuotasCreadas++;
  });

  await saveData();

  res.status(201).json({
    mensaje: `Cuotas 2026 generadas exitosamente`,
    año: 2026,
    cuotasCreadas,
    departamentos: inquilinos.length,
    estructura: {
      cuotas_mensuales: inquilinos.length * 12,
      cuotas_fondo_mayor: inquilinos.length,
      total_cuotas: cuotasCreadas
    }
  });
});

// ===== RUTAS DE USUARIOS =====
app.get('/api/usuarios', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  const usuarios = data.usuarios.map(u => ({
    ...u,
    password: undefined // No enviar password en respuestas
  }));
  res.json(usuarios);
});

app.post('/api/usuarios', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { nombre, email, rol, departamento, telefono, password } = req.body;

  // Validar email único
  if (data.usuarios.find(u => u.email === email)) {
    return res.status(400).json({ mensaje: 'El email ya está en uso' });
  }

  // Validar departamento único para inquilinos
  if (rol === 'inquilino' && data.usuarios.find(u => u.departamento === departamento && u.rol === 'inquilino')) {
    return res.status(400).json({ mensaje: 'El departamento ya está asignado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const nuevoUsuario = {
    id: data.nextId.usuarios++,
    nombre,
    email,
    password: passwordHash,
    rol,
    departamento,
    telefono: telefono || null,
    legitimidad_entregada: false,
    estatus_validacion: 'pendiente',
    created_at: new Date().toISOString()
  };

  data.usuarios.push(nuevoUsuario);
  await saveData();

  const respuesta = { ...nuevoUsuario, password: undefined };
  res.status(201).json(respuesta);
});

app.put('/api/usuarios/:id', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const id = parseInt(req.params.id);
  const usuario = data.usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  const { nombre, email, rol, departamento, telefono, estatus_validacion } = req.body;

  // Validar email único (excluyendo el usuario actual)
  if (email && data.usuarios.find(u => u.email === email && u.id !== id)) {
    return res.status(400).json({ mensaje: 'El email ya está en uso' });
  }

  // Validar departamento único para inquilinos (excluyendo el usuario actual)
  if (rol === 'inquilino' && departamento && 
      data.usuarios.find(u => u.departamento === departamento && u.rol === 'inquilino' && u.id !== id)) {
    return res.status(400).json({ mensaje: 'El departamento ya está asignado' });
  }

  // Actualizar campos
  if (nombre !== undefined) usuario.nombre = nombre;
  if (email !== undefined) usuario.email = email;
  if (rol !== undefined) usuario.rol = rol;
  if (departamento !== undefined) usuario.departamento = departamento;
  if (telefono !== undefined) usuario.telefono = telefono;
  if (estatus_validacion !== undefined) usuario.estatus_validacion = estatus_validacion;

  await saveData();

  const respuesta = { ...usuario, password: undefined };
  res.json(respuesta);
});

app.delete('/api/usuarios/:id', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  const id = parseInt(req.params.id);
  
  // No permitir eliminar el admin principal
  if (id === 1) {
    return res.status(400).json({ mensaje: 'No se puede eliminar el administrador principal' });
  }

  const index = data.usuarios.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  data.usuarios.splice(index, 1);
  saveData();

  res.json({ mensaje: 'Usuario eliminado exitosamente' });
});

// ===== RUTAS DE MÓDULOS =====
app.use('/api/gastos', gastosRoutes);
app.use('/api/cierres', cierresRoutes);
app.use('/api/usuarios-modular', usuariosRoutes);

// ===== ENDPOINTS ADICIONALES FALTANTES =====

// Endpoint para obtener saldos de fondos
app.get('/api/fondos/saldos', verificarToken, requiereAdmin, (req, res) => {
  const data = getData();
  
  // Calcular saldos actuales (simulado con datos base)
  const fechaCorte = new Date().toISOString().split('T')[0];
  
  const saldos = {
    fecha_corte: fechaCorte,
    fondo_ahorro_acumulado: 67500,
    fondo_gastos_mayores_inicial: 125000,
    dinero_operacional: 48000,
    fondo_gastos_mayores_actual: 125000, // Se debería calcular restando gastos
    patrimonio_total_actual: 67500 + 125000 + 48000
  };

  res.json(saldos);
});

// Endpoint para generar cuotas mensuales
app.post('/api/cuotas/generar-mensual', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { mes, año, monto } = req.body;
  
  if (!mes || !año || !monto) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios: mes, año, monto' });
  }
  
  const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
  let cuotasCreadas = 0;
  
  // Fecha de vencimiento: primer día del mes siguiente
  const fechaVencimiento = new Date(año, mes, 1).toISOString().split('T')[0];
  
  inquilinos.forEach(inquilino => {
    data.cuotas.push({
      id: data.nextId.cuotas++,
      usuario_id: inquilino.id,
      concepto: `Cuota ${mes}/${año}`,
      descripcion: 'Cuota mensual de mantenimiento',
      monto: parseFloat(monto),
      tipo_cuota: 'mensual',
      fecha_vencimiento: fechaVencimiento,
      pagado: false,
      fecha_pago: null,
      metodo_pago: null,
      validado_por: null,
      created_at: new Date().toISOString()
    });
    cuotasCreadas++;
  });
  
  await saveData();
  
  res.status(201).json({
    mensaje: `Cuotas mensuales generadas para ${mes}/${año}`,
    cuotasCreadas,
    departamentos: inquilinos.length
  });
});

// Endpoint para generar cuotas anuales
app.post('/api/cuotas/generar-anual', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { año, monto_mensual, monto_fondo_mayor } = req.body;
  
  if (!año || !monto_mensual) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios: año, monto_mensual' });
  }
  
  const inquilinos = data.usuarios.filter(u => u.rol === 'inquilino');
  let cuotasCreadas = 0;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  inquilinos.forEach(inquilino => {
    // 12 cuotas mensuales
    for (let mes = 0; mes < 12; mes++) {
      const fechaVencimiento = new Date(año, mes + 1, 1).toISOString().split('T')[0];
      
      data.cuotas.push({
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        concepto: `Cuota Mensual ${meses[mes]} ${año}`,
        descripcion: 'Cuota mensual de mantenimiento',
        monto: parseFloat(monto_mensual),
        tipo_cuota: 'mensual',
        fecha_vencimiento: fechaVencimiento,
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        validado_por: null,
        created_at: new Date().toISOString()
      });
      cuotasCreadas++;
    }
    
    // Cuota de fondo mayor si se especifica
    if (monto_fondo_mayor && monto_fondo_mayor > 0) {
      data.cuotas.push({
        id: data.nextId.cuotas++,
        usuario_id: inquilino.id,
        concepto: `Fondo Gastos Mayores ${año}`,
        descripcion: 'Fondo para reparaciones mayores y proyectos de infraestructura',
        monto: parseFloat(monto_fondo_mayor),
        tipo_cuota: 'fondo_mayor',
        fecha_vencimiento: `${año}-04-01`, // Vence en abril
        pagado: false,
        monto_pagado: 0,
        fecha_pago: null,
        metodo_pago: null,
        validado_por: null,
        puede_parcialidades: true,
        created_at: new Date().toISOString()
      });
      cuotasCreadas++;
    }
  });
  
  await saveData();
  
  res.status(201).json({
    mensaje: `Cuotas anuales generadas para ${año}`,
    cuotasCreadas,
    departamentos: inquilinos.length,
    estructura: {
      cuotas_mensuales: inquilinos.length * 12,
      cuotas_fondo_mayor: monto_fondo_mayor ? inquilinos.length : 0
    }
  });
});

// Endpoint para pagos múltiples
app.post('/api/cuotas/pagar-multiple', verificarToken, requiereAdmin, async (req, res) => {
  const data = getData();
  const { cuotas_ids, metodo_pago, comprobante_url } = req.body;
  
  if (!cuotas_ids || !Array.isArray(cuotas_ids) || cuotas_ids.length === 0) {
    return res.status(400).json({ mensaje: 'Se requiere un array de IDs de cuotas' });
  }
  
  let cuotasPagadas = 0;
  let montoTotal = 0;
  const cuotasActualizadas = [];
  
  cuotas_ids.forEach(cuotaId => {
    const cuota = data.cuotas.find(c => c.id === parseInt(cuotaId));
    if (cuota && !cuota.pagado) {
      cuota.pagado = true;
      cuota.fecha_pago = new Date().toISOString();
      cuota.metodo_pago = metodo_pago || 'efectivo';
      cuota.comprobante_url = comprobante_url || null;
      cuota.validado_por = req.usuario.id;
      
      cuotasPagadas++;
      montoTotal += cuota.monto;
      cuotasActualizadas.push({
        id: cuota.id,
        concepto: cuota.concepto,
        monto: cuota.monto
      });
    }
  });
  
  await saveData();
  
  res.json({
    mensaje: `${cuotasPagadas} cuotas marcadas como pagadas`,
    cuotas_pagadas: cuotasPagadas,
    monto_total: montoTotal,
    cuotas_actualizadas: cuotasActualizadas
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/inquilino', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/inquilino.html'));
});

app.use('*', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🏢 CONDOMINIO DEPARTAMENTO 205 - NOVIEMBRE 2025 🏢');
  console.log('='.repeat(60));
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🏠 Inquilinos Panel: http://localhost:${PORT}/inquilino`);
  console.log('');
  console.log('📅 PERÍODO ACTUAL: NOVIEMBRE 2025');
  console.log('📊 SALDOS ACUMULADOS AL 31 OCTUBRE 2025:');
  console.log('💰 Fondo Ahorro Acumulado: $67,500 MXN');
  console.log('🏦 Fondo Gastos Mayores: $125,000 MXN');  
  console.log('💵 Dinero Operacional: $48,000 MXN');
  console.log('💎 PATRIMONIO TOTAL: $240,500 MXN');
  console.log('');
  console.log('📋 CUOTAS ACTIVAS NOVIEMBRE/DICIEMBRE 2025:');
  console.log('🗓️  Cuota Noviembre: Vence 1 Diciembre 2025');
  console.log('🗓️  Cuota Diciembre: Vence 1 Enero 2026');
  console.log('💰 Monto: $550 MXN por departamento');
  console.log('📊 Total período: 40 cuotas (20 deptos × 2 meses)');
  console.log('');
  console.log('🚀 PREPARACIÓN 2026:');
  console.log('📅 Cierres mensuales: Noviembre y Diciembre 2025');
  console.log('📊 Cierre anual: 31 Diciembre 2025');
  console.log('🏦 Sistema parcialidades: Listo para activar 2026');
  console.log('');
  console.log('🔐 CREDENCIALES DE ACCESO:');
  console.log('   👨‍💼 Administrador:');
  console.log('      Email: admin@edificio205.com');
  console.log('      Password: admin2025');
  console.log('');
  console.log('   🏠 Inquilinos (censo real):');
  console.log('      Felipe (101): felipe@edificio205.com');
  console.log('      Profe (102): profe@edificio205.com');
  console.log('      Melndez (103): melendez1@edificio205.com');
  console.log('      Password: inquilino2025 (todos)');
  console.log('');
  console.log('⚠️  AGENDA CRÍTICA 2026:');
  console.log('   🔴 Legitimidad propiedad (URGENTE)');
  console.log('   ⚡ Irregularidades eléctricas ($85,000)');
  console.log('   💧 Bombas agua base inestable ($45,000)');
  console.log('');
  console.log('✨ Sistema con cierres mensuales y anuales automáticos');
  console.log('='.repeat(60));
});