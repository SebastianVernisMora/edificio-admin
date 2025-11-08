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

# NO HAY linting configurado - usar buenas prácticas manuales
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

### Auto-Despliegue
```bash
# Ejecutar despliegue manual
./auto-deploy.sh

# Iniciar aplicación con PM2
pm2 start src/app.js --name edificio-admin

# Reiniciar aplicación
pm2 restart edificio-admin

# Ver logs
pm2 logs edificio-admin

# Estado del sistema
pm2 status

# Iniciar webhook listener (puerto 9000)
node webhook-listener.js &

# Configurar webhook en GitHub
./setup-webhook.sh
```

## 📋 Estilo de Código y Convenciones

### Imports y Módulos
- **USAR**: ES6 modules (`import/export`) - configurado con `"type": "module"`
- **Imports relativos**: `from './data.js'` o `from '../models/Usuario.js'`  
- **Extensiones obligatorias**: Siempre incluir `.js` en imports
- **Order**: Node modules primero, luego archivos locales

### Naming Conventions
- **Variables/funciones**: camelCase (`verificarToken`, `getCuotas`)
- **Controllers**: camelCase con acción (`login`, `crearCuota`, `getCuotaById`)
- **Clases/Models**: PascalCase (`Usuario`, `Cuota`, `Gasto`)
- **Archivos**: camelCase con sufijo (`authController.js`, `Usuario.js`)
- **Rutas**: kebab-case (`/api/auth`, `/cierres-anuales`)

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
- **OBLIGATORIO**: try-catch en todos los controllers
- **Format**: `return res.status(code).json({ ok: false, msg: 'Error' })`
- **Centralized handler**: `handleControllerError(error, res, 'functionName')`
- **PROHIBIDO**: console.error/console.log directo en controllers
- **Logging**: Solo usar handleControllerError para logging estructurado

### Async/Await
- **OBLIGATORIO**: async/await en todos los controllers
- **Controllers**: `export const nombreController = async (req, res) => {}`
- **Models**: `static async crear(datos)` para operaciones asíncronas
- **NO usar promises**: await en lugar de .then()

### Authentication/Security (ALINEADO CON BLACKBOX.md)
- **JWT**: Middleware `verifyToken` + role checks (`isAdmin`, `isComite`)
- **Header**: `x-auth-token` (ÚNICO PERMITIDO - NO usar Authorization Bearer)
- **Passwords**: bcryptjs hash antes de guardar
- **Roles**: ADMIN, COMITE, INQUILINO con permisos granulares
- **Validation**: OBLIGATORIO en TODOS los endpoints sensibles
- **CORS**: Configuración restrictiva con headers específicos

### Model Patterns
- **ES6 Classes** con métodos estáticos: `Usuario.getById()`, `Cuota.crear()`
- **CRUD Methods**: `crear()`, `obtenerTodos()`, `obtenerPorId()`, `actualizar()`, `eliminar()`
- **Validation**: En modelos antes de persistir datos
- **Data persistence**: Via `data.js` helpers para JSON storage

### Frontend Patterns
- **Vanilla JS**: No frameworks, DOM manipulation directa
- **Global managers**: `window.UsuariosManager`, `window.CuotasManager`
- **Lazy loading**: Managers creados solo cuando se necesitan
- **ES6**: Classes, arrow functions, template literals
- **API calls**: Centralized helper functions con error handling

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

## 🎯 Estructura de Datos

### Usuarios
- 1 Administrador + 20 Inquilinos
- Departamentos numerados por piso (101-504)

### Cuotas  
- 240 cuotas anuales (20 × 12)
- Todas pendientes al inicio
- Solo admin puede validar pagos

### Contabilidad
- Cierres mensuales y anuales
- Categorías de gastos predefinidas
- Reportes de ingresos/egresos

## 📱 Funcionalidades Clave

### Panel Admin
- ✅ Dashboard con estadísticas
- ✅ Generación cuotas anuales/mensuales  
- ✅ Validación pagos individual/múltiple
- ✅ Registro gastos por categoría
- ✅ Cierres contables automáticos
- ✅ Gestión anuncios y solicitudes

### Panel Inquilino
- ✅ Vista 12 cuotas anuales
- ✅ Solo lectura (no pueden modificar)
- ✅ Filtros por estado
- ✅ Anuncios importantes
- ✅ Solicitudes al admin

## 🔄 Flujo Típico

1. **Inicio**: Sistema con 240 cuotas pendientes
2. **Inquilino**: Ve sus 12 cuotas del año
3. **Pago**: Inquilino paga por transferencia/efectivo
4. **Validación**: Admin marca como pagada en sistema  
5. **Actualización**: Inquilino ve cuota actualizada
6. **Cierre**: Admin genera cierre mensual/anual

## 🚑 Errores Corregidos (2025-10-29)

### ✅ API Fixes Implementados
- **Global Error Handler**: Middleware centralizado para capturar errores no manejados
- **Rate Limiting**: Protección contra ataques de fuerza bruta en login (10 intentos/15min)
- **Data Cleanup**: Eliminado usuario duplicado (ID 22 pelon@edificio.com)
- **Enhanced Auth**: Mejor validación JWT con soporte Bearer token
- **Input Validation**: Sanitización HTML y validaciones mejoradas
- **Error Logging**: Logs estructurados con contexto y timestamps
- **HTTP Status Codes**: Mapeo correcto de errores a códigos HTTP apropiados

### 🛠️ Controllers Mejorados
- `auth.controller.js` ✅ Completo
- `cuotas.controller.js` ✅ Validaciones ID
- `gastos.controller.js` ✅ Validaciones numéricas
- `anuncios.controller.js` ✅ Error handling

### 📋 Pendientes
- Completar validaciones en controllers restantes
- Implementar rate limiting global
- Agregar logging de auditoría

## ✨ Nuevas Funcionalidades (2025-10-30)

### 🎯 Panel Admin Completado
- **Gestión de Usuarios**: CRUD completo con validaciones
- **Gestión de Cuotas**: Generación, validación de pagos, filtros
- **Gestión de Gastos**: Registro, categorización, reportes
- **Gestión de Fondos**: Transferencias, monitoreo, gráficos
- **Gestión de Anuncios**: Publicación, activación/desactivación
- **Cierres Contables**: Generación mensual/anual con reportes detallados
- **Sistema de Parcialidades**: Gestión completa del proyecto 2026

### 🔧 Scripts JavaScript Implementados
- `usuarios.js` - Gestión completa de usuarios (337 líneas)
- `cuotas.js` - Manejo de cuotas y pagos (219 líneas)
- `gastos.js` - Control de gastos por categorías (271 líneas)
- `fondos.js` - Administración de fondos y transferencias (258 líneas)
- `anuncios.js` - Gestión de publicaciones (306 líneas)
- `cierres.js` - Reportes y cierres contables (377 líneas)
- `parcialidades.js` - Sistema de parcialidades 2026 (420 líneas)
- `admin.js` - Controlador principal de navegación (547 líneas)
- `debug-navigation.js` - Sistema de debug para navegación (75 líneas)

### 🚀 Sistema Completamente Funcional
- ✅ **Backend**: API completa con todos los endpoints
- ✅ **Frontend Admin**: Panel completo con todas las funcionalidades
- ✅ **Frontend Inquilino**: Consultas y reportes
- ✅ **Navegación**: Menú lateral funcional con debug habilitado
- ✅ **Autenticación**: JWT con roles y permisos
- ✅ **Validaciones**: Input validation y error handling
- ✅ **Despliegue**: Nginx + Auto-deploy configurado correctamente

## 🔥 Últimas Mejoras (2025-10-30 Navegación)

### 🎯 Navegación Corregida y Optimizada
- **Menú lateral funcional**: Navegación entre todas las secciones
- **Debug habilitado**: Logs en consola para diagnóstico
- **Cambio de secciones**: Transiciones suaves entre páginas
- **Títulos dinámicos**: Actualización automática del título de página
- **Estado visual**: Indicadores activos en menú lateral

### ⚡ Sistema de Debug Implementado
- `debug-navigation.js`: Script específico para diagnóstico de navegación
- **Logs detallados**: Información completa en consola del navegador
- **Verificación DOM**: Chequeo automático de elementos de interfaz
- **Manejo de errores**: Captura y reporte de problemas de navegación

## 🏠 Corrección Panel de Inquilino (2025-10-30)

### 🎯 InquilinoController Sistema Completo (572 líneas)
- **Navegación funcional**: Menu lateral operativo entre todas las secciones
- **Autenticación robusta**: Verificación de rol y redirección automática
- **API integrada**: Endpoints específicos para funcionalidades de inquilino
- **Dashboard personalizado**: Estadísticas específicas del departamento
- **Gestión de modales**: Sistema completo de apertura/cierre

### 📱 Funcionalidades Implementadas
- ✅ **Dashboard**: Cuota actual, total adeudado, cuotas pendientes
- ✅ **Mis Cuotas**: Tabla filtrable por año y estado, botón reportar pago
- ✅ **Anuncios**: Visualización de anuncios activos del condominio
- ✅ **Parcialidades**: Progreso del proyecto 2026, historial de pagos
- ✅ **Reportar Pago**: Modal funcional con validaciones

### 🔗 Nuevos Endpoints API
- `GET /api/cuotas/mis-cuotas` - Cuotas específicas del inquilino
- `POST /api/cuotas/reportar-pago` - Reporte de pagos con validación
- `GET /api/parcialidades/mis-parcialidades` - Parcialidades del usuario

### 🎨 Estilos Específicos (214 líneas CSS)
- `inquilino.css` - Diseño optimizado para panel de inquilino
- **Anuncio cards**: Diseño atractivo con tipos urgente/normal
- **Progress bars**: Barras de progreso para parcialidades
- **Badges y alerts**: Sistema visual de estados y notificaciones
- **Responsive design**: Adaptación a dispositivos móviles

## 👥 Sistema de Gestión de Usuarios Optimizado (2025-10-30)

### 🎯 UsuariosLoader Sistema Completo (232 líneas)
- **Carga robusta**: Sistema específico para cargar todos los usuarios
- **Validaciones frontend**: Verificación de datos antes del envío
- **Gestión de departamentos**: Control de departamentos ocupados/disponibles
- **Sugerencias inteligentes**: Propuesta automática de próximo departamento
- **Estadísticas dinámicas**: Contadores en tiempo real

### ✅ Base de Datos Verificada
- **22 usuarios totales**: 1 superadmin + 1 admin + 20 inquilinos
- **Roles implementados**: admin, inquilino, superadmin
- **Departamentos asignados**: 101-504 (estructura completa)
- **Validaciones backend**: Roles, emails únicos, departamentos únicos

### 🔧 Mejoras Implementadas
- **usuarios-loader.js**: Sistema específico de carga y renderizado
- **Validaciones de rol**: Frontend + backend sincronizados
- **Modal optimizado**: Formulario con validaciones en tiempo real
- **Tabla dinámica**: Renderizado con filtros y estadísticas
- **Funciones globales**: `editarUsuario()`, `eliminarUsuario()`, `toggleValidacion()`

### 🎛️ Funcionalidades Completas
- ✅ **Crear usuarios**: Con validación de roles y departamentos
- ✅ **Editar usuarios**: Modal con datos precargados
- ✅ **Eliminar usuarios**: Con confirmación (protege admin principal)
- ✅ **Validar/invalidar**: Toggle de estatus de validación
- ✅ **Filtros**: Por rol (admin/inquilino) y estado (validado/pendiente)
- ✅ **Estadísticas**: Contadores dinámicos de usuarios por tipo

## 🚀 Optimización Completa de Funcionalidad (2025-10-30)

### 🎛️ MainController Sistema Central (353 líneas)
- **Coordinación centralizada**: Gestión unificada de todos los managers
- **Lazy loading**: Creación de managers solo cuando se necesitan
- **Event listeners globales**: Conectividad completa de botones
- **Sistema de navegación**: Cambio fluido entre secciones
- **API helper**: Funciones auxiliares para requests HTTP
- **Sistema de alertas**: Notificaciones integradas

### 🔗 Conectividad Total de Botones
```
✅ Todos los botones principales conectados:
- Nuevo Usuario, Nueva Cuota, Verificar Vencimientos
- Nuevo Gasto, Transferir Fondos, Nuevo Anuncio  
- Cierres Mensual/Anual, Nuevo Pago Parcialidades
```

### 🔧 Optimizaciones Técnicas
- **Managers globales**: `window.XxxManager` expuestos
- **IDs sincronizados**: HTML ↔ JavaScript perfectamente alineados
- **Métodos estandarizados**: `loadData()` en todos los managers
- **Compatibilidad**: Fallback para IDs anteriores mantenido
- **Modal de usuario**: Agregado al HTML con validaciones