import express from 'express';
import bcrypt from 'bcryptjs';
import { verificarToken, requiereAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(requiereAdmin);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { getData } = await import('../data.js');
    const data = getData();
    
    const usuarios = data.usuarios.map(u => ({
      ...u,
      password: undefined // No enviar password en respuestas
    }));
    
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { getData, saveData } = await import('../data.js');
    const data = getData();
    const { nombre, email, rol, departamento, telefono, password } = req.body;

    // Validaciones
    if (!nombre || !email || !rol || !departamento || !password) {
      return res.status(400).json({ 
        mensaje: 'Faltan campos obligatorios: nombre, email, rol, departamento, password' 
      });
    }

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
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { getData, saveData } = await import('../data.js');
    const data = getData();
    const id = parseInt(req.params.id);
    const usuario = data.usuarios.find(u => u.id === id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const { nombre, email, rol, departamento, telefono, estatus_validacion, password } = req.body;

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
    if (password) {
      usuario.password = await bcrypt.hash(password, 10);
    }

    await saveData();

    const respuesta = { ...usuario, password: undefined };
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { getData, saveData } = await import('../data.js');
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
    await saveData();

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

export default router;