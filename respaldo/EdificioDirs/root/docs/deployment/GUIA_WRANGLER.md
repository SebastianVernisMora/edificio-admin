# 🚀 Guía de Despliegue con Wrangler (Cloudflare Workers)

**Estado:** 🔧 En desarrollo  
**Versión:** 1.0  
**Fecha:** 23 de Noviembre 2025

---

## ⚠️ IMPORTANTE

El sistema actual está construido con **Express.js** (Node.js) que **NO es compatible** directamente con Cloudflare Workers.

Cloudflare Workers usa un runtime diferente (Service Workers API) que no soporta:
- Sistema de archivos (fs)
- Express.js middleware
- Multer para uploads
- JSON file-based database

---

## 📋 OPCIONES DE DESPLIEGUE

### Opción 1: Cloudflare Workers (Requiere Refactorización) 🔧

**Requiere:**
1. Migrar de Express a framework compatible (Hono o itty-router)
2. Cambiar de JSON files a D1 (SQL) o KV (key-value)
3. Migrar uploads a R2 Bucket
4. Adaptar todos los controladores

**Tiempo estimado:** 2-3 días de trabajo

**Ventajas:**
- Edge deployment (ultra rápido globalmente)
- Auto-scaling
- $0 para tráfico bajo
- SSL automático

**Desventajas:**
- Requiere refactorización completa
- Límites de CPU (50ms por request)
- No soporta Node.js nativo

---

### Opción 2: Cloudflare Pages (Recomendado) ✅

**Para qué sirve:**
- Solo frontend estático
- Backend separado

**Configuración:**

```bash
# 1. Build del frontend optimizado
npm run build

# 2. Deploy solo el frontend
npx wrangler pages deploy dist/

# 3. Configurar variable de entorno
# API_URL = https://tu-backend.com
```

**Backend:**
- Mantener en servidor actual (PM2)
- O migrar a Vercel/Railway/Render

---

### Opción 3: Vercel (Más Fácil) ⭐

**Compatible con:**
- Express.js (con adaptador)
- Sistema de archivos (temporal)
- Serverless functions

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Variables de entorno
vercel env add JWT_SECRET
```

**Archivo `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/app.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ]
}
```

---

### Opción 4: Railway (Más Simple) 🚂

**Ventajas:**
- Compatible 100% con código actual
- Sin cambios necesarios
- PM2 funciona
- PostgreSQL incluido

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Init
railway init

# 4. Deploy
railway up
```

---

## 🔄 PLAN DE MIGRACIÓN A CLOUDFLARE WORKERS

### Fase 1: Preparación (1 día)

**Backend:**
```bash
# Instalar Hono (framework compatible)
npm install hono

# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login
```

**Crear estructura:**
```
src/
├── worker/
│   ├── index.ts          # Entry point
│   ├── routes/           # Rutas adaptadas
│   ├── db/              # D1 queries
│   └── storage/         # R2 handlers
```

### Fase 2: Migración de Datos (1 día)

**De JSON a D1:**

```sql
-- Schema
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nombre TEXT,
  email TEXT UNIQUE,
  password TEXT,
  rol TEXT,
  departamento TEXT,
  created_at DATETIME
);

CREATE TABLE cuotas (
  id INTEGER PRIMARY KEY,
  mes TEXT,
  anio INTEGER,
  monto REAL,
  departamento TEXT,
  estado TEXT,
  fecha_vencimiento DATE,
  created_at DATETIME
);

CREATE TABLE gastos (
  id INTEGER PRIMARY KEY,
  concepto TEXT,
  monto REAL,
  categoria TEXT,
  proveedor TEXT,
  fecha DATE,
  fondo TEXT,
  created_at DATETIME
);

CREATE TABLE fondos (
  id INTEGER PRIMARY KEY,
  ahorro_acumulado REAL,
  gastos_mayores REAL,
  dinero_operacional REAL,
  patrimonio_total REAL,
  updated_at DATETIME
);

CREATE TABLE anuncios (
  id INTEGER PRIMARY KEY,
  titulo TEXT,
  contenido TEXT,
  tipo TEXT,
  imagen TEXT,
  created_at DATETIME
);

CREATE TABLE parcialidades (
  id INTEGER PRIMARY KEY,
  departamento TEXT,
  monto REAL,
  fecha DATE,
  comprobante TEXT,
  estado TEXT,
  created_at DATETIME
);

CREATE TABLE cierres (
  id INTEGER PRIMARY KEY,
  mes TEXT,
  anio INTEGER,
  tipo TEXT,
  ingresos TEXT, -- JSON
  gastos TEXT,   -- JSON
  fondos TEXT,   -- JSON
  balance REAL,
  created_at DATETIME
);
```

**Migrar datos:**
```bash
# Script de migración
node scripts/migrate-json-to-d1.js
```

### Fase 3: Adaptar Backend (1 día)

**Ejemplo con Hono:**

```typescript
// src/worker/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

const app = new Hono();

app.use('/*', cors());

// Auth
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  // Query D1
  const db = c.env.DB;
  const user = await db.prepare(
    'SELECT * FROM usuarios WHERE email = ?'
  ).bind(email).first();
  
  if (!user) {
    return c.json({ ok: false, msg: 'Usuario no encontrado' }, 404);
  }
  
  // Validar password, generar JWT, etc.
  return c.json({ ok: true, token: '...' });
});

// Cuotas
app.get('/api/cuotas', async (c) => {
  const db = c.env.DB;
  const { departamento, mes, anio, estado } = c.req.query();
  
  let query = 'SELECT * FROM cuotas WHERE 1=1';
  const params = [];
  
  if (departamento) {
    query += ' AND departamento = ?';
    params.push(departamento);
  }
  
  if (mes) {
    query += ' AND mes = ?';
    params.push(mes);
  }
  
  const stmt = db.prepare(query);
  const { results } = await stmt.bind(...params).all();
  
  return c.json({ ok: true, cuotas: results });
});

// ... más rutas

export default app;
```

### Fase 4: Storage con R2 (medio día)

**Upload de archivos:**

```typescript
app.post('/api/anuncios/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('imagen');
  
  if (!file) {
    return c.json({ ok: false, msg: 'No file' }, 400);
  }
  
  // Subir a R2
  const filename = `${Date.now()}_${file.name}`;
  await c.env.UPLOADS.put(`anuncios/${filename}`, file.stream());
  
  const url = `https://uploads.edificio.com/${filename}`;
  
  return c.json({ ok: true, url });
});

// Servir archivo
app.get('/uploads/:path*', async (c) => {
  const path = c.req.param('path');
  const object = await c.env.UPLOADS.get(path);
  
  if (!object) {
    return c.notFound();
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata.contentType
    }
  });
});
```

---

## 📦 ESTRUCTURA FINAL PARA WRANGLER

```
edificio-admin/
├── wrangler.toml           # Configuración Wrangler
├── src/
│   └── worker/
│       ├── index.ts        # Entry point Worker
│       ├── routes/         # Rutas adaptadas
│       ├── db/            # D1 queries
│       └── storage/       # R2 handlers
├── public/                # Frontend (servido por Pages)
├── dist/                  # Build optimizado
└── migrations/            # SQL migrations
    └── 0001_initial.sql
```

---

## 🛠️ COMANDOS WRANGLER

```bash
# Desarrollo local
wrangler dev

# Deploy
wrangler deploy

# Logs en vivo
wrangler tail

# D1 commands
wrangler d1 create edificio-admin-db
wrangler d1 execute edificio-admin-db --file=./migrations/0001_initial.sql

# R2 commands
wrangler r2 bucket create edificio-uploads

# KV commands
wrangler kv:namespace create "EDIFICIO_DATA"
```

---

## ⚡ ALTERNATIVA RÁPIDA: Cloudflare Tunnel

**Sin refactorización, mantener código actual:**

```bash
# 1. Instalar cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# 2. Login
cloudflared tunnel login

# 3. Crear tunnel
cloudflared tunnel create edificio-admin

# 4. Configurar
cat > ~/.cloudflared/config.yml <<EOF
tunnel: TUNNEL-ID
credentials-file: /path/to/credentials.json

ingress:
  - hostname: edificio.tudominio.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 5. Crear DNS
cloudflared tunnel route dns edificio-admin edificio.tudominio.com

# 6. Correr tunnel
cloudflared tunnel run edificio-admin

# 7. Como servicio
cloudflared service install
```

**Ventajas:**
- ✅ Sin cambios de código
- ✅ Express funciona tal cual
- ✅ JSON database funciona
- ✅ PM2 funciona
- ✅ SSL automático
- ✅ DDoS protection

---

## 📊 COMPARATIVA DE OPCIONES

| Característica | Workers | Pages + API | Vercel | Railway | Tunnel |
|---------------|---------|-------------|--------|---------|--------|
| Código actual | ❌ Refactor | ❌ Refactor | ⚠️ Mínimo | ✅ Directo | ✅ Directo |
| Tiempo setup | 3 días | 2 días | 2 horas | 1 hora | 30 min |
| Costo | $0-5/mes | $0-5/mes | $0-20/mes | $5-10/mes | $0 |
| Performance | ⚡⚡⚡ | ⚡⚡ | ⚡⚡ | ⚡ | ⚡ |
| Escalabilidad | Auto | Auto | Auto | Manual | Manual |
| Database | D1/KV | Externa | Vercel KV | PostgreSQL | JSON |
| Files | R2 | R2/S3 | Vercel Blob | Disco | Disco |

---

## 🎯 RECOMENDACIÓN

**Para producción inmediata:**
→ **Cloudflare Tunnel** (30 min, sin cambios)

**Para largo plazo:**
→ **Railway** (1 hora, PostgreSQL incluido)

**Para edge performance:**
→ **Cloudflare Workers** (3 días, refactorización completa)

---

## 📝 PASOS SIGUIENTES

### Opción A: Cloudflare Tunnel (Rápido)

```bash
# 1. Instalar
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# 2. Autenticar
cloudflared tunnel login

# 3. Crear tunnel
cloudflared tunnel create edificio-admin

# 4. Configurar (ver arriba)

# 5. Iniciar
cloudflared tunnel run edificio-admin
```

### Opción B: Railway (Fácil)

```bash
# 1. Instalar CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Añadir PostgreSQL
railway add

# 5. Deploy
railway up

# 6. Variables
railway variables set JWT_SECRET=your-secret
railway variables set NODE_ENV=production
```

### Opción C: Workers (Largo plazo)

**Requiere crear:**
1. `src/worker/index.ts` - Entry point Hono
2. `migrations/` - SQL para D1
3. Adaptadores para cada ruta
4. Migración de datos JSON → D1

**No recomendado a corto plazo** por complejidad.

---

## 🔗 RECURSOS

- **Cloudflare Workers:** https://workers.cloudflare.com/
- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Railway:** https://railway.app/
- **Vercel:** https://vercel.com/
- **Hono Framework:** https://hono.dev/

---

**Conclusión:** Para desplegar HOY sin cambios, usa **Cloudflare Tunnel** o **Railway**. Workers requiere refactorización significativa.

---

_Guía generada por Crush_
