# 🤖 BLACKBOX.AI - Directivas Organizacionales del Proyecto

## 🎯 Estándares de Desarrollo - Edificio Admin

### 📋 Principios Fundamentales

1. **Consistencia**: Mantener patrones uniformes en naming, estructura y código
2. **Seguridad**: Validaciones robustas y manejo seguro de datos
3. **Mantenibilidad**: Código limpio, documentado y reutilizable
4. **Performance**: Optimización y buenas prácticas de rendimiento

---

## 🔧 Estándares Técnicos Obligatorios

### Naming Conventions (CRÍTICO)
```javascript
// Variables y funciones: camelCase
const usuarioActual = await Usuario.obtenerPorId(id);
const validarToken = (token) => { /* */ };

// Clases y Modelos: PascalCase
class Usuario extends Model { /* */ }
class CuotaController { /* */ }

// Archivos: camelCase con sufijo descriptivo
authController.js    ✅ Correcto
auth.controller.js   ❌ Evitar puntos extras

// Rutas API: kebab-case
/api/auth/login           ✅
/api/cuotas-mensuales    ✅
/api/usuarios/profile    ✅

// Headers HTTP: kebab-case
x-auth-token     ✅ ÚNICO header de auth permitido
content-type     ✅
authorization    ❌ No usar Bearer token
```

### Response Format (OBLIGATORIO)
```javascript
// Success responses - SIEMPRE usar 'ok: true'
res.json({ ok: true, data: result });
res.json({ ok: true, usuario, cuotas });

// Error responses - SIEMPRE usar 'ok: false, msg'
res.status(400).json({ ok: false, msg: 'Descripción específica del error' });
res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
res.status(500).json({ ok: false, msg: 'Error interno del servidor' });

// PROHIBIDO usar otras estructuras:
// ❌ { success: true/false }
// ❌ { error: "mensaje" }
// ❌ { status: "ok" }
```

### Error Handling (MANDATORIO)
```javascript
// En Controllers - USAR SIEMPRE handleControllerError
import { handleControllerError } from '../utils/errorHandler.js';

export const miController = async (req, res) => {
    try {
        // Lógica del controller
        const resultado = await MiModel.operacion();
        res.json({ ok: true, data: resultado });
    } catch (error) {
        // OBLIGATORIO: Usar helper centralizado
        return handleControllerError(error, res, 'miController');
        
        // PROHIBIDO: console.error directo
        // ❌ console.error(error);
        // ❌ res.status(500).json({ error: error.message });
    }
};
```

### Authentication & Security (CRÍTICO)
```javascript
// Headers de Auth - ÚNICO ESTÁNDAR
const token = req.header('x-auth-token'); // ✅ ÚNICO permitido

// PROHIBIDO:
// ❌ req.header('Authorization')
// ❌ req.header('x-token') 
// ❌ req.header('edificio-token')

// Middleware Order - OBLIGATORIO
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);         // Sin middleware
app.use('/api', verifyToken, apiRoutes);  // Con middleware

// Role Validation - EN TODOS LOS ENDPOINTS SENSIBLES
router.get('/admin-only', verifyToken, isAdmin, controller);
router.post('/comite-admin', verifyToken, isComiteOrAdmin, controller);
```

---

## 📁 Estructura de Archivos Obligatoria

### Backend Structure (src/)
```
src/
├── controllers/
│   ├── authController.js           ✅ camelCase + suffix
│   ├── usuariosController.js       ✅
│   ├── cuotasController.js         ✅
│   └── gastosController.js         ✅
├── models/
│   ├── Usuario.js                  ✅ PascalCase
│   ├── Cuota.js                    ✅
│   └── Gasto.js                    ✅
├── routes/
│   ├── auth.routes.js              ✅ Descriptivo
│   ├── usuarios.routes.js          ✅ Solo UN archivo por entidad
│   └── cuotas.routes.js            ✅
├── middleware/
│   ├── auth.js                     ✅
│   ├── validation.js               ✅
│   └── errorHandler.js             ✅
└── utils/
    ├── database.js                 ✅
    ├── helpers.js                  ✅
    └── constants.js                ✅
```

### Frontend Structure (public/)
```
public/
├── js/
│   ├── auth/
│   │   ├── auth.js                 ✅ Funcionalidad específica
│   │   └── validation.js           ✅
│   ├── components/
│   │   ├── modals.js               ✅ Componentes reutilizables
│   │   ├── alerts.js               ✅
│   │   └── navigation.js           ✅
│   ├── modules/
│   │   ├── usuarios/
│   │   │   ├── usuariosManager.js  ✅
│   │   │   └── usuariosForm.js     ✅
│   │   ├── cuotas/
│   │   │   ├── cuotasManager.js    ✅
│   │   │   └── cuotasTable.js      ✅
│   │   └── admin/
│   │       ├── dashboard.js        ✅
│   │       └── reports.js          ✅
│   └── utils/
│       ├── api.js                  ✅ Helpers API centralizados
│       ├── helpers.js              ✅ Utilidades generales
│       └── constants.js            ✅ Constantes del frontend
├── css/
│   ├── components/                 ✅ Estilos por componente
│   ├── modules/                    ✅ Estilos por módulo
│   └── base/                       ✅ Estilos base y variables
└── assets/
    ├── images/                     ✅
    └── icons/                      ✅
```

---

## 🚀 Flujo de Desarrollo Obligatorio

### 1. Antes de Crear/Modificar Código
```bash
# VERIFICAR archivos duplicados
find . -name "*.js" | grep -E "(auth|usuarios|cuotas)" | sort

# ELIMINAR duplicados innecesarios
rm src/routes/anuncios.js  # Si existe anuncios.routes.js

# VERIFICAR consistencia de naming
grep -r "x-token\|authorization\|edificio-token" src/
```

### 2. Code Review Checklist
- [ ] ✅ Naming conventions seguidas estrictamente
- [ ] ✅ Response format: `{ok: boolean}` ÚNICAMENTE
- [ ] ✅ Error handling con `handleControllerError`
- [ ] ✅ Headers: solo `x-auth-token` para auth
- [ ] ✅ Validaciones de role en endpoints sensibles
- [ ] ✅ Try-catch en TODOS los controllers
- [ ] ✅ Imports con extensión `.js`
- [ ] ✅ Sin código duplicado o archivos redundantes

### 3. Testing Obligatorio
```bash
# Antes de commit - OBLIGATORIO
npm test                    # Tests generales
npm run test:auth          # Tests de autenticación  
npm run test:security      # Tests de seguridad
npm run lint              # Linting (si está configurado)
```

---

## 🔒 Seguridad - Checklist Obligatorio

### Validaciones Obligatorias
```javascript
// Input Validation - EN TODOS LOS ENDPOINTS
import { body, validationResult } from 'express-validator';

export const validarCrearUsuario = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').trim().escape(),  // Sanitización XSS
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ ok: false, msg: 'Datos inválidos', errors: errors.array() });
        }
        next();
    }
];

// Role Validation - OBLIGATORIO en endpoints sensibles
export const isAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'ADMIN') {
        return res.status(403).json({ ok: false, msg: 'Acceso denegado: se requiere rol ADMIN' });
    }
    next();
};
```

### Headers de Seguridad
```javascript
// CORS Configuration - OBLIGATORIO
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true
}));

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

---

## 📊 Quality Metrics - Objetivos

### Code Quality Goals
- **Duplicación**: 0% código duplicado
- **Coverage**: 80%+ test coverage
- **Consistency**: 100% naming conventions
- **Security**: 0 vulnerabilidades críticas
- **Performance**: <200ms respuesta API promedio

### Maintenance Standards
- **Documentation**: JSDoc en funciones públicas
- **Error Handling**: 100% controllers con try-catch
- **Validation**: 100% endpoints con validaciones
- **Type Safety**: Validaciones de tipos en runtime

---

## ⚡ Comandos de Verificación

```bash
# Verificar consistency
grep -r "ok:" src/controllers/ | grep -v "ok: true\|ok: false"

# Encontrar archivos duplicados
find src/ -name "*.js" | xargs basename -s .js | sort | uniq -d

# Verificar headers de auth
grep -r "x-token\|authorization" src/ --include="*.js"

# Verificar error handling
grep -r "console.error\|console.log" src/controllers/

# Verificar response format
grep -r "success:\|error:" src/controllers/
```

---

## 🎯 Reglas de Gold - NO NEGOCIABLES

1. **ÚNICO header de auth**: `x-auth-token`
2. **ÚNICO response format**: `{ok: boolean, ...}`  
3. **CERO archivos duplicados**
4. **ZERO console.log/error en controllers** (usar handleControllerError)
5. **100% validación de roles** en endpoints sensibles
6. **Naming conventions** estrictas sin excepciones

---

*Última actualización: 2025-11-08*  
*Versión: 1.0*  
*Estatus: OBLIGATORIO para todos los agentes de BLACKBOX.AI*