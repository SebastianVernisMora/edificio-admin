import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import presupuestosRoutes from './routes/presupuestos.js';
import cuotasRoutes from './routes/cuotas.js';
import anunciosRoutes from './routes/anuncios.js';
import solicitudesRoutes from './routes/solicitudes.js';

import './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/cuotas', cuotasRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/inquilino', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/inquilino.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Panel de administración: http://localhost:${PORT}/admin`);
  console.log(`Panel de inquilinos: http://localhost:${PORT}/inquilino`);
});