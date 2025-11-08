# 🏢 Edificio Admin - Desarrollo y Estilo de Código

## ⚡ Comandos Esenciales

### Build/Test/Dev
```bash
# Iniciar servidor de desarrollo (puerto 3000, IP pública)
npm run dev

# Instalar dependencias
npm install

# Ejecutar tests (permisos)
npm test
npm run test:permisos

# Ejecutar test individual
node tests/permisos.test.js
```

### Sistema/Debug
```bash
# Limpiar datos y reiniciar
rm -f data.json && npm run dev

# Ver puerto ocupado  
lsof -i :3000

# Matar proceso en puerto
pkill -f "node.*app"
```

---

## 🎯 Estándares Organizacionales - ALINEADO CON BLACKBOX.md

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

// Headers HTTP: ÚNICO PERMITIDO
x-auth-token     ✅ ÚNICO header de auth permitido
```

### Response Format (CRÍTICO - ALINEADO CON BLACKBOX.md)
```js
// Success - SIEMPRE usar 'ok: true'
res.json({ ok: true, data: usuario });
res.json({ ok: true, usuario, cuotas });

// Error - SIEMPRE usar 'ok: false, msg'  
res.status(400).json({ ok: false, msg: 'Error específico' });
res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
res.status(500).json({ ok: false, msg: 'Error interno del servidor' });

// PROHIBIDO usar otras estructuras:
// ❌ { success: true/false }
// ❌ { error: "mensaje" }  
// ❌ { status: "ok" }
```

### Error Handling (ALINEADO CON BLACKBOX.md)
```javascript
// En Controllers - USAR SIEMPRE handleControllerError
import { handleControllerError } from '../middleware/error-handler.js';

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

### Authentication/Security (ALINEADO CON BLACKBOX.md)
- **JWT**: Middleware `verifyToken` + role checks (`isAdmin`, `isComite`)
- **Header**: `x-auth-token` (ÚNICO PERMITIDO - NO usar Authorization Bearer)
- **Passwords**: bcryptjs hash antes de guardar
- **Roles**: ADMIN, COMITE, INQUILINO con permisos granulares
- **Validation**: OBLIGATORIO en TODOS los endpoints sensibles
- **CORS**: Configuración restrictiva con headers específicos

### Imports y Módulos
- **USAR**: ES6 modules (`import/export`) - configurado con `"type": "module"`
- **Imports relativos**: `from './data.js'` o `from '../models/Usuario.js'`  
- **Extensiones obligatorias**: Siempre incluir `.js` en imports
- **Order**: Node modules primero, luego archivos locales

---

## 📁 Estructura de Archivos Limpia (POST-CLEANUP)

### Backend Structure (src/) ✅ LIMPIADO
```
src/
├── controllers/
│   ├── authController.js           ✅ Limpio, usa handleControllerError
│   ├── cuotasController.js         ✅ Limpio, imports correctos
│   ├── gastosController.js         ✅
│   └── [otros]Controller.js        ✅
├── models/
│   ├── Usuario.js                  ✅ Sin métodos duplicados
│   ├── Cuota.js                    ✅
│   └── [otros].js                  ✅
├── routes/
│   ├── auth.routes.js              ✅ Solo UN archivo por entidad
│   ├── cuotas.routes.js            ✅ Eliminados duplicados
│   └── [otros].routes.js           ✅
├── middleware/
│   ├── auth.js                     ✅ Header consistente x-auth-token
│   ├── error-handler.js            ✅ handleControllerError implementado
│   └── validation.js               ✅
└── utils/
    ├── constants.js                ✅ NUEVO - Constantes centralizadas
    ├── helpers.js                  ✅
    └── database.js                 ✅
```

### Frontend Structure (public/) ✅ LIMPIADO
```
public/js/
├── [33 archivos organizados]       ✅ Eliminados .backup y duplicados
├── auth.js                         ✅ Funciones centralizadas
├── utils.js                        ✅ Helpers del frontend
└── [módulos específicos]           ✅ Un archivo por funcionalidad
```

---

## 🧹 Limpieza Realizada (2025-11-08)

### ✅ Eliminaciones Realizadas
- **Archivos duplicados**: `src/routes/anuncios.js` (mantenido .routes.js)
- **Archivos backup**: `public/js/anuncios.js.backup`, `usuarios.js.new`
- **Console.log/error**: Eliminados de authController.js y otros
- **Carpetas duplicadas**: Eliminadas en reorganización anterior

### ✅ Estandarizaciones Aplicadas
- **Error handling**: handleControllerError en controllers críticos
- **Response format**: Verificado formato `{ok: boolean}` único
- **Headers**: Confirmado uso único de `x-auth-token`
- **Imports**: Agregados imports de error-handler donde faltaban

### ✅ Nuevos Archivos Organizacionales
- **`BLACKBOX.md`**: Directivas técnicas obligatorias para agentes AI
- **`src/utils/constants.js`**: Constantes centralizadas del proyecto
- **Actualizado `docs/setup/CRUSH.md`**: Alineado con BLACKBOX.md

---

## 📊 Información del Sistema

### Configuración 2026
- **Puerto**: 3000 (IP pública 0.0.0.0) ✅
- **Año Fiscal**: 2026  
- **Cuota Mensual**: $75,000
- **Departamentos**: 20 (101-504)
- **Total Anual**: $18,000,000

### Credenciales
- **Admin**: admin@edificio205.com / admin2026
- **Inquilinos**: [email] / inquilino2026

---

## 🔒 Checklist de Quality Assurance

### Antes de cada commit - OBLIGATORIO
- [ ] ✅ Naming conventions seguidas estrictamente
- [ ] ✅ Response format: `{ok: boolean}` ÚNICAMENTE
- [ ] ✅ Error handling con `handleControllerError`
- [ ] ✅ Headers: solo `x-auth-token` para auth
- [ ] ✅ Sin console.log/error en controllers
- [ ] ✅ Imports con extensión `.js`
- [ ] ✅ Sin archivos duplicados o redundantes

### Comandos de Verificación
```bash
# Verificar consistency
grep -r "ok:" src/controllers/ | grep -v "ok: true\|ok: false"

# Encontrar archivos duplicados  
find src/ -name "*.js" | xargs basename -s .js | sort | uniq -d

# Verificar headers de auth
grep -r "x-token\|authorization" src/ --include="*.js"

# Verificar error handling
grep -r "console.error\|console.log" src/controllers/
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

## 📱 Funcionalidades Clave

### Panel Admin ✅ COMPLETADO Y LIMPIO
- ✅ Dashboard con estadísticas
- ✅ Generación cuotas anuales/mensuales  
- ✅ Validación pagos individual/múltiple
- ✅ Registro gastos por categoría
- ✅ Cierres contables automáticos
- ✅ Gestión anuncios y solicitudes

### Panel Inquilino ✅ COMPLETADO Y LIMPIO
- ✅ Vista 12 cuotas anuales
- ✅ Solo lectura (no pueden modificar)
- ✅ Filtros por estado
- ✅ Anuncios importantes
- ✅ Solicitudes al admin

---

*Última actualización: 2025-11-08*  
*Versión: 2.0 - POST CLEANUP*  
*Status: ✅ LIMPIADO Y ALINEADO CON BLACKBOX.md*