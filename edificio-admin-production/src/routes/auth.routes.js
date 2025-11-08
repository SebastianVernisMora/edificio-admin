import { Router } from 'express';
import { check } from 'express-validator';
import { login, registro, renovarToken, getPerfil } from '../controllers/auth.controller.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { validarJWT, rateLimiter } from '../middleware/auth.js';

const router = Router();

// Login con rate limiting
router.post('/login', [
  rateLimiter,
  check('email', 'El email es obligatorio').isEmail(),
  check('password', 'La contraseña es obligatoria').not().isEmpty(),
  validarCampos
], login);

// Registro
router.post('/registro', [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('email', 'El email es obligatorio').isEmail(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  check('departamento', 'El departamento es obligatorio').not().isEmpty(),
  validarCampos
], registro);

// Renovar token
router.get('/renew', validarJWT, renovarToken);

// Obtener perfil
router.get('/perfil', validarJWT, getPerfil);

export default router;