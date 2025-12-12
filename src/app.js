import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import cuotasRoutes from './routes/cuotas.routes.js';
import gastosRoutes from './routes/gastos.routes.js';
import presupuestosRoutes from './routes/presupuestos.routes.js';
import cierresRoutes from './routes/cierres.routes.js';
import anunciosRoutes from './routes/anuncios.routes.js';
import fondosRoutes from './routes/fondos.routes.js';
import permisosRoutes from './routes/permisos.routes.js';
import validationRoutes from './routes/validation.routes.js';
import auditRoutes from './routes/audit.routes.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';
import parcialidadesRoutes from './routes/parcialidades.routes.js';
import { inicializarCuotasAnuales, actualizarCuotasVencidas } from './utils/cuotasInicializacion.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Servir archivos de uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/cuotas', cuotasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/cierres', cierresRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/fondos', fondosRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/parcialidades', parcialidadesRoutes);

// Ruta para servir la aplicación frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

app.get('/inquilino', (req, res) => {
  res.sendFile(path.join(publicPath, 'inquilino.html'));
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Función de inicialización del sistema
async function inicializarSistema() {
  try {
    console.log('🚀 Iniciando sistema...');
    
    // Inicializar cuotas automáticamente
    await inicializarCuotasAnuales();
    
    // Actualizar cuotas vencidas
    await actualizarCuotasVencidas();
    
    console.log('✅ Sistema inicializado correctamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
}

// Función para respaldos automáticos
async function programarRespaldos() {
  try {
    const { createAutoBackup } = await import('../scripts/backupData.js');
    
    // Crear respaldo inmediato
    await createAutoBackup('startup');
    
    // Programar respaldos cada 60 minutos
    setInterval(async () => {
      try {
        await createAutoBackup('scheduled');
      } catch (error) {
        console.error('Error en respaldo programado:', error);
      }
    }, 60 * 60 * 1000); // Cada 60 minutos
    
    console.log('Respaldos automáticos configurados cada 60 minutos');
  } catch (error) {
    console.error('Error configurando respaldos automáticos:', error);
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL Local: http://localhost:${PORT}`);
  console.log(`🌐 Acceso en red: http://${require('os').networkInterfaces()?.eth0?.[0]?.address || 'localhost'}:${PORT}\n`);
  
  // Inicializar sistema después de que el servidor esté corriendo
  await inicializarSistema();
  
  // Configurar respaldos automáticos
  await programarRespaldos();
  
  // Programar actualización de cuotas vencidas cada día
  setInterval(async () => {
    try {
      await actualizarCuotasVencidas();
    } catch (error) {
      console.error('Error en actualización programada de cuotas:', error);
    }
  }, 24 * 60 * 60 * 1000); // Cada 24 horas
});

export default app;