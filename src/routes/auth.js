import express from 'express';
import { 
  registrar, 
  login, 
  perfil, 
  validacionesRegistro, 
  validacionesLogin 
} from '../controllers/authController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/registro', validacionesRegistro, registrar);
router.post('/login', validacionesLogin, login);
router.get('/perfil', verificarToken, perfil);

export default router;