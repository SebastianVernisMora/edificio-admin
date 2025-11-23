# Sistema de Administración Edificio 205

**Versión:** 2.0 | **Estado:** ✅ Operacional | **Última actualización:** 2025-11-23

Sistema web completo para la administración de un edificio de 20 departamentos con gestión de presupuestos, cuotas, gastos y usuarios.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm run dev

# Ejecutar tests
npm test
```

## 📊 Estado del Proyecto

- **Servidor:** EC2 AWS (ec2-18-217-61-85.us-east-2.compute.amazonaws.com)
- **Puerto:** 3000 (Node.js) → 80 (Nginx)
- **Base de datos:** JSON file-based (42KB, 20 usuarios)
- **Código:** Limpio, sin duplicados, estandarizado ✅
- **Estado:** ⚠️ Requiere reinicio de servidor - Ver [Estado Completo](docs/ESTADO_PROYECTO.md)

## 📁 Estructura del Proyecto

```
edificio-admin/
├── src/                    # Backend (controllers, models, routes)
│   ├── controllers/       # 12 controllers limpios
│   ├── models/            # 9 modelos sin duplicados
│   ├── routes/            # 13 rutas estandarizadas
│   ├── middleware/        # Auth, validation, error handling
│   └── utils/             # Helpers y constantes
├── public/                # Frontend (HTML, CSS, JS)
│   ├── js/modules/        # 33 módulos organizados
│   ├── css/               # Estilos
│   └── *.html             # Vistas (admin, inquilino)
├── tests/                 # 11 suites de testing
├── scripts/               # Deployment y maintenance
├── docs/                  # Documentación completa
├── backups/               # Backups automáticos
└── uploads/               # Archivos subidos (anuncios)
```

## 👥 Tipos de Usuario

- **ADMIN**: Acceso completo al sistema
- **COMITE**: Gestión de gastos, presupuestos y cuotas
- **INQUILINO**: Consulta de estado de cuenta y información

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: HTML5 + Vanilla JavaScript
- **Base de Datos**: JSON (archivo data.json)
- **Autenticación**: JWT + bcrypt
- **Servidor Web**: Nginx (producción)

## 📋 Funcionalidades

- ✅ Autenticación y autorización por roles
- ✅ Gestión de presupuestos anuales
- ✅ Control de gastos mensuales
- ✅ Cálculo automático de cuotas
- ✅ Sistema de cierres anuales
- ✅ Dashboard personalizado por rol
- ✅ Subida de comprobantes
- ✅ Reportes y análisis

## 🔧 Comandos Disponibles

```bash
# Servidor
npm run dev                    # Desarrollo (puerto 3000)
npm start                      # Producción

# Testing - Suite Completa
npm test                       # Todos los tests
npm run test:sistema           # Sistema completo
npm run test:api               # Validación API
npm run test:security          # Seguridad
npm run test:permisos          # Roles y permisos
npm run test:usuarios          # CRUD usuarios
npm run test:cuotas            # Sistema de cuotas
npm run test:frontend          # Integración frontend
npm run test:integration       # Tests integración
npm run test:performance       # Tests rendimiento
npm run test:cierre            # Cierre anual

# Test individual
node tests/permisos.test.js    # Ejecutar test específico
```

## 🎯 Estándares de Código

```javascript
// Response format (ÚNICO PERMITIDO)
res.json({ ok: true, data: result });           // Success
res.status(400).json({ ok: false, msg: 'Error' });  // Error

// Error handling (OBLIGATORIO)
import { handleControllerError } from '../middleware/error-handler.js';
try {
    // logic
} catch (error) {
    return handleControllerError(error, res, 'controllerName');
}

// Auth header (ÚNICO PERMITIDO)
const token = req.header('x-auth-token');
```

Ver estándares completos en [CRUSH.md](CRUSH.md) y [BLACKBOX.md](BLACKBOX.md)

## 📚 Documentación

### Guías de Desarrollo
- **[CRUSH.md](CRUSH.md)** - Guía rápida para agentes de código
- **[BLACKBOX.md](BLACKBOX.md)** - Estándares técnicos obligatorios
- **[Estado del Proyecto](docs/ESTADO_PROYECTO.md)** - Estado actual completo
- **[Guía de Despliegue](docs/GUIA_DESPLIEGUE.md)** - Procedimientos de deploy

### Documentación Técnica
- [Sistema de Permisos](docs/technical/PERMISOS.md)
- [Sistema de Parcialidades](docs/technical/SISTEMA_PARCIALIDADES.md)
- [Project Summary](docs/technical/PROJECT_SUMMARY.md)

### Reportes
- [Cambios Implementados](docs/reports/CAMBIOS_IMPLEMENTADOS.md)
- [Refactorización Completada](docs/reports/REFACTORIZACION_COMPLETADA.md)

## 🚀 Despliegue

### Despliegue Manual (Rápido)
```bash
# En el servidor
cd /home/admin
git pull origin master
npm install
pkill -f "node.*app"
nohup npm run dev > server.log 2>&1 &
```

### Despliegue Automático
- **GitHub Actions:** Push a `master` despliega automáticamente
- **Scripts:** `scripts/deployment/redeploy.sh`
- **Documentación completa:** [GUIA_DESPLIEGUE.md](docs/GUIA_DESPLIEGUE.md)

## 🌐 Acceso al Sistema

```yaml
URL: http://ec2-18-217-61-85.us-east-2.compute.amazonaws.com

Credenciales:
  Admin:     admin@edificio205.com / admin2026
  Comité:    comite@edificio205.com / comite2026
  Inquilino: [email]@edificio205.com / inquilino2026
```

## 🔐 Arquitectura de Seguridad

- **Autenticación:** JWT con bcryptjs (10 rounds)
- **Header:** `x-auth-token` (único permitido)
- **Roles:** ADMIN, COMITE, INQUILINO
- **Validación:** express-validator en todos los endpoints
- **CORS:** Configurado con headers específicos

## 📊 Métricas del Proyecto

```yaml
Archivos JS: 80+
Backend: 12 controllers, 9 models, 13 routes
Frontend: 33 módulos
Tests: 11 suites
Líneas código: ~15,000
Duplicación: 0% ✅
Consistency: 100% ✅
```

## 🆘 Troubleshooting

### Servidor no responde
```bash
# Verificar proceso
ps aux | grep "node.*app"

# Reiniciar
pkill -f "node.*app"
npm run dev
```

### Ver logs
```bash
tail -f server.log                    # App logs
tail -f /var/log/nginx/error.log      # Nginx logs
```

### Restaurar backup
```bash
cp backups/data-backup-[fecha].json data.json
```

## 🔮 Roadmap

### Inmediato
- [x] Limpieza de código duplicado
- [x] Estandarización de responses
- [x] Centralización de error handling
- [ ] Reiniciar servidor en producción

### Corto Plazo
- [ ] Implementar PM2 para auto-restart
- [ ] Backups automáticos diarios
- [ ] Health checks automáticos
- [ ] NODE_ENV a production

### Medio Plazo
- [ ] HTTPS con Let's Encrypt
- [ ] Dominio personalizado
- [ ] Rate limiting
- [ ] Logging estructurado (Winston)

## 📞 Soporte y Contacto

- **Repositorio:** [github.com/SebastianVernisMora/edificio-admin](https://github.com/SebastianVernisMora/edificio-admin)
- **Issues:** Usar GitHub Issues
- **Documentación:** Ver carpeta `docs/`

---

**Última verificación:** 2025-11-23 04:48 UTC  
**Estado:** ⚠️ Requiere reinicio de servidor  
**Próxima revisión:** 2025-11-24