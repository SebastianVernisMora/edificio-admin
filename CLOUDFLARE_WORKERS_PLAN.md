# 🚀 PLAN CLOUDFLARE WORKERS - EDIFICIO-ADMIN SAAS

**Fecha:** 2025-12-11 23:10 UTC  
**Objetivo:** Despliegue completo en Cloudflare Workers + D1 + KV + R2

---

## 📊 ANÁLISIS SITUACIÓN ACTUAL

### Proyecto Cloudflare Existente
```
✅ cloudflare-saas/ (352KB)
   ├── wrangler.toml (configurado)
   ├── src/index.js (router configurado)
   ├── handlers/ (6 archivos)
   ├── middleware/ (3 archivos)
   ├── models/ (2 archivos)
   └── templates/ (HTML landing)
```

### Estado
- ✅ Estructura básica creada
- ✅ Router (itty-router) configurado
- ✅ Middleware CORS, Auth, DB
- ⚠️ **Incompleto**: Falta migrar todas las features del proyecto actual
- ⚠️ **Falta**: Esquemas D1 completos
- ⚠️ **Falta**: Integrar todos los módulos (cuotas, gastos, fondos, etc.)

---

## 🎯 ESTRUCTURA CLOUDFLARE WORKERS COMPLETA

```
edificio-admin-cloudflare/
│
├── wrangler.toml                 # Configuración Cloudflare
├── package.json
├── .dev.vars                     # Variables locales
├── .env.example
│
├── migrations/                   # 📊 D1 Database Migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_cuotas.sql
│   ├── 0003_add_gastos.sql
│   ├── 0004_add_fondos.sql
│   └── 0005_add_parcialidades.sql
│
├── src/
│   ├── index.js                  # Entry point principal
│   │
│   ├── config/                   # Configuración
│   │   ├── database.js
│   │   ├── constants.js
│   │   └── permissions.js
│   │
│   ├── api/                      # 🌐 API Routes
│   │   ├── auth.js              # Autenticación
│   │   ├── usuarios.js          # Gestión usuarios
│   │   ├── cuotas.js            # Sistema cuotas
│   │   ├── gastos.js            # Control gastos
│   │   ├── fondos.js            # Administración fondos
│   │   ├── presupuestos.js      # Presupuestos
│   │   ├── cierres.js           # Cierres mensuales
│   │   ├── anuncios.js          # Anuncios
│   │   ├── solicitudes.js       # Solicitudes inquilinos
│   │   ├── parcialidades.js     # Parcialidades 2026
│   │   ├── permisos.js          # Sistema permisos
│   │   └── audit.js             # Auditoría
│   │
│   ├── services/                 # 🔧 Business Logic
│   │   ├── auth.service.js
│   │   ├── cuotas.service.js
│   │   ├── gastos.service.js
│   │   ├── fondos.service.js
│   │   └── notifications.service.js
│   │
│   ├── models/                   # 📦 Data Models
│   │   ├── Usuario.js
│   │   ├── Cuota.js
│   │   ├── Gasto.js
│   │   ├── Fondo.js
│   │   ├── Presupuesto.js
│   │   ├── Cierre.js
│   │   ├── Anuncio.js
│   │   ├── Solicitud.js
│   │   └── Parcialidad.js
│   │
│   ├── middleware/               # 🛡️ Middleware
│   │   ├── auth.js              # JWT validation
│   │   ├── cors.js              # CORS handling
│   │   ├── rateLimit.js         # Rate limiting (KV)
│   │   ├── cache.js             # Response caching (KV)
│   │   └── errorHandler.js
│   │
│   ├── utils/                    # 🛠️ Utilities
│   │   ├── jwt.js               # JWT helpers
│   │   ├── validation.js        # Input validation
│   │   ├── encryption.js        # Bcrypt for passwords
│   │   ├── date.js              # Date utilities
│   │   └── response.js          # Response helpers
│   │
│   ├── repositories/             # 💾 Data Access (D1)
│   │   ├── usuarios.repository.js
│   │   ├── cuotas.repository.js
│   │   ├── gastos.repository.js
│   │   └── fondos.repository.js
│   │
│   └── templates/                # 📧 Email & HTML Templates
│       ├── emails/
│       └── landing/
│
├── public/                       # 🌐 Static Assets (servidos desde Workers)
│   ├── index.html
│   ├── admin.html
│   ├── inquilino.html
│   ├── assets/
│   │   ├── css/
│   │   └── js/
│   └── images/
│
├── scripts/                      # 📜 Utility Scripts
│   ├── deploy.sh                # Deploy script
│   ├── migrate.sh               # Run migrations
│   ├── seed.sh                  # Seed database
│   └── setup-cloudflare.sh      # Initial setup
│
├── tests/                        # 🧪 Tests
│   ├── unit/
│   ├── integration/
│   └── wrangler.test.js
│
└── docs/                         # 📚 Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── CLOUDFLARE_SETUP.md
```

---

## 🗄️ ESQUEMA D1 DATABASE

### Tables Principales

```sql
-- Usuarios (multi-tenant)
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL, -- ADMIN, PROPIETARIO, INQUILINO
    departamento TEXT,
    telefono TEXT,
    edificio_id TEXT,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Edificios (multi-tenant)
CREATE TABLE edificios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT,
    total_departamentos INTEGER,
    admin_user_id TEXT,
    plan TEXT, -- BASIC, PRO, ENTERPRISE
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_user_id) REFERENCES usuarios(id)
);

-- Cuotas
CREATE TABLE cuotas (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    departamento TEXT NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    monto REAL NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- pendiente, pagada, vencida
    fecha_vencimiento TEXT,
    fecha_pago TEXT,
    metodo_pago TEXT,
    referencia_pago TEXT,
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Gastos
CREATE TABLE gastos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    concepto TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria TEXT NOT NULL,
    fecha TEXT NOT NULL,
    proveedor TEXT,
    comprobante_url TEXT,
    aprobado_por TEXT,
    estado TEXT DEFAULT 'pendiente',
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Fondos
CREATE TABLE fondos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    tipo TEXT NOT NULL, -- general, reserva, mantenimiento
    monto REAL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Movimientos Fondos
CREATE TABLE movimientos_fondos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    fondo_origen TEXT,
    fondo_destino TEXT,
    monto REAL NOT NULL,
    concepto TEXT NOT NULL,
    tipo TEXT NOT NULL, -- deposito, retiro, transferencia
    realizado_por TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Presupuestos
CREATE TABLE presupuestos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    monto_presupuestado REAL NOT NULL,
    monto_gastado REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Cierres Mensuales
CREATE TABLE cierres (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    ingresos_total REAL DEFAULT 0,
    egresos_total REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    cerrado_por TEXT,
    fecha_cierre TEXT,
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Anuncios
CREATE TABLE anuncios (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad TEXT DEFAULT 'normal',
    tipo TEXT NOT NULL,
    publicado_por TEXT,
    archivo_url TEXT,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Solicitudes
CREATE TABLE solicitudes (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    prioridad TEXT DEFAULT 'media',
    estado TEXT DEFAULT 'pendiente',
    respuesta TEXT,
    imagen_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Parcialidades 2026
CREATE TABLE parcialidades (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    proyecto TEXT NOT NULL,
    monto_total REAL NOT NULL,
    monto_pagado REAL DEFAULT 0,
    departamento TEXT,
    fecha_pago TEXT,
    comprobante_url TEXT,
    notas TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Audit Log
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    edificio_id TEXT,
    usuario_id TEXT,
    accion TEXT NOT NULL,
    entidad TEXT,
    entidad_id TEXT,
    detalles TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_edificio ON usuarios(edificio_id);
CREATE INDEX idx_cuotas_edificio ON cuotas(edificio_id);
CREATE INDEX idx_cuotas_usuario ON cuotas(usuario_id);
CREATE INDEX idx_cuotas_fecha ON cuotas(anio, mes);
CREATE INDEX idx_gastos_edificio ON gastos(edificio_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_audit_edificio ON audit_log(edificio_id);
CREATE INDEX idx_audit_fecha ON audit_log(created_at);
```

---

## 🔑 KV NAMESPACES - Uso

### 1. SESSIONS (Almacenamiento de sesiones)
```javascript
// Guardar sesión
await env.SESSIONS.put(
  `session:${userId}:${sessionId}`,
  JSON.stringify({ userId, email, rol, edificioId }),
  { expirationTtl: 86400 } // 24 horas
);

// Obtener sesión
const session = await env.SESSIONS.get(`session:${userId}:${sessionId}`, 'json');
```

### 2. CACHE (Caché de respuestas)
```javascript
// Guardar en caché
await env.CACHE.put(
  `cuotas:${edificioId}:${mes}:${anio}`,
  JSON.stringify(cuotas),
  { expirationTtl: 3600 } // 1 hora
);

// Obtener de caché
const cached = await env.CACHE.get(`cuotas:${edificioId}:${mes}:${anio}`, 'json');
```

### 3. RATE_LIMIT (Rate limiting)
```javascript
// Verificar límite
const key = `rate:${ip}:${endpoint}`;
const count = await env.RATE_LIMIT.get(key) || 0;

if (count > 100) {
  return new Response('Too Many Requests', { status: 429 });
}

await env.RATE_LIMIT.put(key, count + 1, { expirationTtl: 60 });
```

---

## 📦 R2 STORAGE - Uso

### Subir Archivos
```javascript
// Subir comprobante de pago
await env.UPLOADS.put(
  `comprobantes/${edificioId}/${cuotaId}.pdf`,
  fileBuffer,
  {
    httpMetadata: {
      contentType: 'application/pdf'
    }
  }
);

// URL pública
const url = `https://uploads.edificio-admin.com/comprobantes/${edificioId}/${cuotaId}.pdf`;
```

---

## 🚀 MIGRACIÓN DE FEATURES

### Mapeo: Actual → Cloudflare

| Feature Actual | Handler Cloudflare | Repository | Service |
|----------------|-------------------|------------|---------|
| Auth | `/api/auth.js` | auth.repository.js | auth.service.js |
| Usuarios | `/api/usuarios.js` | usuarios.repository.js | - |
| Cuotas | `/api/cuotas.js` | cuotas.repository.js | cuotas.service.js |
| Gastos | `/api/gastos.js` | gastos.repository.js | - |
| Fondos | `/api/fondos.js` | fondos.repository.js | fondos.service.js |
| Presupuestos | `/api/presupuestos.js` | presupuestos.repository.js | - |
| Cierres | `/api/cierres.js` | cierres.repository.js | cierres.service.js |
| Anuncios | `/api/anuncios.js` | anuncios.repository.js | - |
| Solicitudes | `/api/solicitudes.js` | solicitudes.repository.js | - |
| Parcialidades | `/api/parcialidades.js` | parcialidades.repository.js | - |

---

## 📜 SCRIPTS DE CONFIGURACIÓN

### 1. Setup Cloudflare (setup-cloudflare.sh)
```bash
#!/bin/bash
# Crear D1 database
wrangler d1 create edificio_admin_db

# Crear KV namespaces
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create RATE_LIMIT

# Crear R2 bucket
wrangler r2 bucket create edificio-admin-uploads

# Ejecutar migraciones
wrangler d1 execute edificio_admin_db --file=./migrations/0001_initial_schema.sql
```

### 2. Deploy Script (deploy.sh)
```bash
#!/bin/bash
# Build y deploy
npm run build
wrangler deploy --env production
```

---

## 🔄 VENTAJAS CLOUDFLARE WORKERS

### vs Node.js Traditional

| Aspecto | Node.js (Actual) | Cloudflare Workers |
|---------|------------------|-------------------|
| **Escalabilidad** | Manual (servidor) | Automática (global) |
| **Costo** | $5-50/mes servidor | $0-5/mes (Free tier generoso) |
| **Latencia** | 100-500ms | 10-50ms (edge) |
| **Disponibilidad** | 99% (single server) | 99.99% (global) |
| **Mantenimiento** | Manual (updates, security) | Automático |
| **Cold Start** | No aplica | <1ms |
| **Database** | JSON file / PostgreSQL | D1 (SQLite distribuido) |
| **Storage** | Local disk | R2 (S3-compatible) |
| **CDN** | Extra ($$$) | Incluido |

---

## 📝 PRÓXIMOS PASOS

### Fase 1: Setup Cloudflare (1 hora)
```bash
1. Crear cuenta Cloudflare
2. Instalar Wrangler CLI
3. Configurar wrangler.toml
4. Crear D1, KV, R2
5. Ejecutar migraciones
```

### Fase 2: Migrar Backend (4-6 horas)
```bash
1. Crear estructura completa
2. Migrar modelos a D1
3. Crear repositories
4. Implementar handlers API
5. Integrar middleware
```

### Fase 3: Frontend (2 horas)
```bash
1. Copiar HTML/CSS/JS a public/
2. Actualizar URLs API
3. Configurar rutas estáticas
4. Optimizar assets
```

### Fase 4: Testing (2 horas)
```bash
1. Tests unitarios
2. Tests integración
3. Tests E2E
4. Load testing
```

### Fase 5: Deploy (30 min)
```bash
1. Deploy a staging
2. Verificar funcionalidad
3. Deploy a production
4. Configurar dominio custom
```

---

## ✅ CHECKLIST COMPLETO

- [ ] Cuenta Cloudflare creada
- [ ] Wrangler CLI instalado
- [ ] D1 database creada
- [ ] KV namespaces creados (3)
- [ ] R2 bucket creado
- [ ] Migrations ejecutadas
- [ ] Estructura de directorios creada
- [ ] Todos los handlers API implementados
- [ ] Todos los repositories implementados
- [ ] Middleware completo
- [ ] Frontend adaptado
- [ ] Tests pasando
- [ ] Deploy exitoso
- [ ] Dominio custom configurado

---

**¿Quieres que cree la estructura completa y scripts de migración?**
