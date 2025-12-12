# 🏠 Configuración Local - Edificio Admin

**Fecha:** 2025-12-11 22:55 UTC  
**Modo:** Desarrollo Local (localhost)

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Servidor
```bash
npm run dev
```

### 3. Acceder a la Aplicación
```
URL: http://localhost:3000
```

---

## 🔐 Credenciales de Acceso

**Password:** `Gemelo1` (todas las cuentas)

```
Admin:       admin@edificio205.com / Gemelo1
Propietario: prop101@edificio205.com / Gemelo1
Inquilino:   inq101@edificio205.com / Gemelo1
```

---

## 📁 Archivos Principales

```
edificio-admin/
├── src/app.js           → Servidor principal
├── data.json            → Base de datos (42KB)
├── .env                 → Configuración (PORT=3000)
├── package.json         → Dependencias
└── public/              → Frontend estático
    ├── index.html       → Login
    ├── admin.html       → Panel Admin
    └── inquilino.html   → Panel Inquilino
```

---

## 📊 Módulos Disponibles

### Admin Panel (http://localhost:3000/admin)
1. ✅ **Cuotas** - Gestión de cuotas mensuales
2. ✅ **Gastos** - Control de gastos
3. ✅ **Fondos** - Administración de fondos
4. ✅ **Presupuestos** - Presupuestos mensuales
5. ✅ **Solicitudes** - Gestión de solicitudes
6. ✅ **Usuarios** - Gestión de usuarios
7. ✅ **Anuncios** - Publicación de anuncios
8. ✅ **Cierres** - Cierres mensuales
9. ✅ **Permisos** - Sistema de permisos
10. ✅ **Parcialidades** - Parcialidades 2026

### Panel Inquilino (http://localhost:3000/inquilino)
- Ver mis cuotas
- Ver anuncios
- Crear solicitudes
- Ver estado de cuenta

---

## 🔧 Scripts NPM Disponibles

```bash
npm run dev           # Iniciar en modo desarrollo
npm start             # Iniciar servidor
npm test              # Ejecutar todos los tests
npm run test:sistema  # Test del sistema completo
npm run test:cuotas   # Test de cuotas
npm run test:api      # Test de API
```

---

## 🌐 Endpoints API

Base URL: `http://localhost:3000/api`

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/verify` - Verificar token

### Gestión
- `GET /api/usuarios` - Listar usuarios
- `GET /api/cuotas` - Listar cuotas
- `GET /api/gastos` - Listar gastos
- `GET /api/fondos` - Ver fondos
- `GET /api/presupuestos` - Ver presupuestos
- `GET /api/cierres` - Ver cierres
- `GET /api/anuncios` - Ver anuncios
- `GET /api/solicitudes` - Ver solicitudes
- `GET /api/parcialidades` - Ver parcialidades

**Nota:** Todas las rutas (excepto login) requieren token de autenticación.

---

## 🔍 Variables de Entorno (.env)

```env
PORT=3000
JWT_SECRET=edificio205_secret_key_2025
NODE_ENV=development
HOST=localhost
```

---

## 🛠️ Características Automáticas

### Al Iniciar el Servidor
- ✅ Inicialización de cuotas (2025-2026)
- ✅ Actualización de cuotas vencidas
- ✅ Backup automático (startup)

### Procesos Programados
- ✅ Backup cada 60 minutos
- ✅ Actualización de cuotas vencidas cada 24h
- ✅ Limpieza de cache cada 10 minutos

---

## 📝 Base de Datos (data.json)

Sistema de archivos JSON con:
- 20 usuarios predefinidos
- Cuotas 2025-2026 generadas
- 3 fondos configurados
- Estructura completa lista

**Ubicación:** `/home/sebastianvernis/edificio-admin/data.json`

---

## 🚨 Solución de Problemas

### Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3001

# O terminar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Loop de login (frontend)
```javascript
// Abrir consola del navegador (F12) y ejecutar:
localStorage.clear();
// Luego recargar: Ctrl+Shift+R
```

### Ver logs
```bash
# Logs en tiempo real
tail -f logs/edificio-admin-out.log
tail -f logs/edificio-admin-error.log
```

---

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Test específico
npm run test:sistema
npm run test:cuotas
npm run test:api
```

### Probar API con curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edificio205.com","password":"Gemelo1"}'

# Con token
curl http://localhost:3000/api/usuarios \
  -H "x-auth-token: TU_TOKEN_AQUI"
```

---

## 📱 Acceso desde Otros Dispositivos (Red Local)

### Obtener tu IP local
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

### Acceder desde otro dispositivo
```
http://TU_IP_LOCAL:3000
Ejemplo: http://192.168.1.100:3000
```

**Nota:** Asegúrate de que el firewall permita conexiones en el puerto 3000.

---

## 🔄 Desarrollo

### Estructura de Archivos
```
src/
├── app.js              → Servidor Express
├── data.js             → Manejo de datos
├── controllers/        → 13 controladores
├── models/             → 9 modelos
├── routes/             → 13 rutas API
├── middleware/         → Auth, validación, etc.
└── utils/              → Utilidades

public/
├── js/
│   ├── modules/        → 12 módulos activos
│   ├── auth/           → Autenticación
│   └── utils/          → Utilidades frontend
└── css/                → Estilos
```

### Agregar Nueva Feature
1. Crear modelo en `src/models/`
2. Crear controlador en `src/controllers/`
3. Crear ruta en `src/routes/`
4. Agregar ruta en `src/app.js`
5. Crear módulo frontend en `public/js/modules/`
6. Cargar script en `public/admin.html`

---

## 📚 Documentación Adicional

- **CONSOLIDACION_COMPLETA.md** - Documentación técnica completa
- **CRUSH.md** - Guía rápida
- **README.md** - Información del proyecto

---

## ✅ Checklist de Inicio

- [ ] Dependencias instaladas (`npm install`)
- [ ] Puerto 3000 disponible
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Navegador en `http://localhost:3000`
- [ ] Login exitoso con credenciales de prueba
- [ ] Módulos cargados correctamente

---

**Sistema listo para desarrollo local** ✅

*Última actualización: 2025-12-11 22:55 UTC*
