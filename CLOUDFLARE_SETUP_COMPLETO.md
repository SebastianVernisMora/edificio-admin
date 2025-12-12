# 🚀 SETUP COMPLETO - CLOUDFLARE WORKERS

**Proyecto:** Edificio-Admin SAAS  
**Tecnologías:** Cloudflare Workers + D1 + KV + R2  
**Fecha:** 2025-12-11

---

## 📋 REQUISITOS

### Cuenta Cloudflare
```
✅ Cuenta gratuita disponible
✅ Workers: 100,000 requests/día (Free)
✅ D1: 5 GB storage (Free)
✅ KV: 100,000 reads/día (Free)
✅ R2: 10 GB storage (Free)
```

### Herramientas
```bash
# Node.js 18+
node --version

# Wrangler CLI
npm install -g wrangler

# Verificar
wrangler --version
```

---

## 🎯 PASO A PASO COMPLETO

### 1. Preparar Proyecto (5 min)

```bash
# En el directorio del proyecto
cd /home/sebastianvernis/edificio-admin

# Ejecutar script de migración
./migrate-to-cloudflare.sh
```

**Opciones:**
- **Opción A:** Usar `cloudflare-saas` existente (recomendado)
- **Opción B:** Crear nuevo proyecto `cloudflare-workers`

---

### 2. Configurar Cloudflare (10 min)

```bash
cd cloudflare-saas  # o cloudflare-workers

# Login en Cloudflare
wrangler login
# Se abrirá navegador para autorizar

# Crear D1 Database
wrangler d1 create edificio_admin_db

# Copiar el database_id generado
# Ejemplo: 
# database_id = "abc123-def456-ghi789"
```

**Actualizar wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "edificio_admin_db"
database_id = "PEGAR_ID_AQUI"  # ← Pegar ID de arriba
```

---

### 3. Crear KV Namespaces (5 min)

```bash
# Sessions
wrangler kv:namespace create SESSIONS
# Copiar ID generado

# Cache
wrangler kv:namespace create CACHE
# Copiar ID generado

# Rate Limit
wrangler kv:namespace create RATE_LIMIT
# Copiar ID generado
```

**Actualizar wrangler.toml:**
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "ID_SESSIONS_AQUI"

[[kv_namespaces]]
binding = "CACHE"
id = "ID_CACHE_AQUI"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "ID_RATE_LIMIT_AQUI"
```

---

### 4. Crear R2 Bucket (2 min)

```bash
# Crear bucket
wrangler r2 bucket create edificio-admin-uploads

# Verificar
wrangler r2 bucket list
```

---

### 5. Ejecutar Migraciones D1 (3 min)

```bash
# Ejecutar schema inicial
wrangler d1 execute edificio_admin_db \
  --file=./migrations/0001_initial_schema.sql

# Verificar tablas creadas
wrangler d1 execute edificio_admin_db \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

**Deberías ver:**
```
edificios
usuarios
cuotas
gastos
fondos
anuncios
solicitudes
audit_log
```

---

### 6. Instalar Dependencias (1 min)

```bash
npm install
```

---

### 7. Desarrollo Local (testing)

```bash
# Iniciar dev server
npm run dev

# O con wrangler directo
wrangler dev

# Servidor local en:
# http://localhost:8787
```

**Probar endpoints:**
```bash
# Health check
curl http://localhost:8787/

# Login (ejemplo)
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'
```

---

### 8. Deploy a Producción (2 min)

```bash
# Deploy
npm run deploy

# O
wrangler deploy

# URL generada:
# https://edificio-admin-saas.TUUSUARIO.workers.dev
```

---

## 📦 ESTRUCTURA FINAL

```
cloudflare-saas/
├── wrangler.toml          # ✅ Configurado con IDs
├── package.json           # ✅ Dependencias
├── .dev.vars              # ✅ Variables locales
│
├── migrations/            # ✅ Schemas SQL
│   └── 0001_initial_schema.sql
│
├── src/
│   ├── index.js          # Entry point
│   ├── api/              # Handlers API
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Middleware
│   ├── utils/            # Utilities
│   └── repositories/     # Data access D1
│
├── public/               # Static assets
│   ├── index.html
│   ├── admin.html
│   └── assets/
│
└── scripts/              # Utility scripts
```

---

## 🔐 CONFIGURACIÓN SEGURIDAD

### JWT Secret (Importante)

```bash
# Generar secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar output y actualizar wrangler.toml
```

**wrangler.toml:**
```toml
[vars]
JWT_SECRET = "tu-secret-generado-aqui"
```

### .dev.vars (Local)
```bash
JWT_SECRET=dev-secret-key-only-for-development
ENVIRONMENT=development
```

---

## 🌐 DOMINIO CUSTOM (Opcional)

### Con Cloudflare Domain

```bash
# Agregar custom domain
wrangler domains add edificio-admin.com

# Configurar en wrangler.toml
```

**wrangler.toml:**
```toml
[routes]
pattern = "*/*"
zone_name = "edificio-admin.com"
```

---

## 📊 MONITOREO

### Dashboard Cloudflare

```
URL: https://dash.cloudflare.com/
```

**Ver:**
- Requests/minuto
- Errores
- Latencia
- CPU usage
- Database queries

### Logs en tiempo real

```bash
# Ver logs
wrangler tail

# Filtrar por status
wrangler tail --status error
```

---

## 🧪 TESTING

### Seed Database (Datos de prueba)

```bash
# Crear usuario admin
wrangler d1 execute edificio_admin_db --command="
INSERT INTO usuarios (id, email, password, nombre, rol, edificio_id)
VALUES (
  'user-001',
  'admin@edificio205.com',
  '\$2a\$10\$hash-aqui',
  'Administrador',
  'ADMIN',
  'edificio-001'
)"

# Crear edificio
wrangler d1 execute edificio_admin_db --command="
INSERT INTO edificios (id, nombre, direccion, admin_user_id)
VALUES (
  'edificio-001',
  'Edificio 205',
  'Calle Principal #205',
  'user-001'
)"
```

---

## 📈 VENTAJAS CLOUDFLARE

### Performance
```
Latencia: 10-50ms (vs 100-500ms tradicional)
Cold start: <1ms (vs 100ms+ Lambda)
Global: 300+ ciudades
Uptime: 99.99%
```

### Costo
```
Free Tier:
├─ 100k requests/día
├─ D1: 5GB storage
├─ KV: 100k reads/día
└─ R2: 10GB storage

Paid (si excedes):
├─ $0.50 / million requests
├─ $0.75 / GB-month (D1)
└─ $0.015 / GB-month (R2)
```

### Escalabilidad
```
Auto-scaling: ✅ Automático
Load balancing: ✅ Global
DDoS protection: ✅ Incluido
CDN: ✅ Integrado
```

---

## 🚨 TROUBLESHOOTING

### Error: "binding not found"
```bash
# Verificar wrangler.toml tiene todos los bindings
# Verificar IDs correctos
wrangler whoami  # Verificar sesión
```

### Error: "database not found"
```bash
# Listar databases
wrangler d1 list

# Verificar database_id en wrangler.toml
```

### Error al deploy
```bash
# Limpiar cache
rm -rf .wrangler
rm -rf dist

# Reintentar
npm run deploy
```

### 413 Entity Too Large
```bash
# Worker size limit: 1MB compressed
# Optimizar código o usar external dependencies
```

---

## 📝 COMANDOS ÚTILES

```bash
# Development
wrangler dev                    # Dev server local
wrangler dev --remote           # Dev con recursos reales

# Deploy
wrangler deploy                 # Deploy a producción
wrangler deploy --dry-run       # Simular deploy

# Database
wrangler d1 list                # Listar databases
wrangler d1 info DB_NAME        # Info database
wrangler d1 execute DB_NAME --command="SELECT * FROM usuarios"

# KV
wrangler kv:namespace list      # Listar namespaces
wrangler kv:key list --binding=SESSIONS
wrangler kv:key get KEY --binding=SESSIONS

# R2
wrangler r2 bucket list         # Listar buckets
wrangler r2 object list BUCKET  # Listar objetos

# Logs
wrangler tail                   # Ver logs real-time
wrangler tail --status error    # Solo errores

# Info
wrangler whoami                 # Ver cuenta actual
wrangler pages project list     # Listar proyectos
```

---

## 🎯 CHECKLIST COMPLETO

### Pre-deploy
- [ ] Cuenta Cloudflare creada
- [ ] Wrangler CLI instalado
- [ ] `wrangler login` exitoso
- [ ] D1 database creada
- [ ] KV namespaces creados (3)
- [ ] R2 bucket creado
- [ ] wrangler.toml actualizado con IDs
- [ ] JWT_SECRET generado y configurado
- [ ] Migraciones ejecutadas
- [ ] npm install completado

### Testing Local
- [ ] `npm run dev` funciona
- [ ] Endpoints API responden
- [ ] Frontend se carga correctamente
- [ ] Auth funciona
- [ ] Database queries funcionan

### Deploy
- [ ] `npm run deploy` exitoso
- [ ] URL workers.dev accesible
- [ ] API endpoints funcionan en producción
- [ ] Frontend carga correctamente
- [ ] Datos se guardan en D1
- [ ] Uploads funcionan en R2

### Post-deploy
- [ ] Dominio custom configurado (opcional)
- [ ] Monitoreo configurado
- [ ] Backups programados
- [ ] Documentación actualizada

---

## 📚 RECURSOS

### Documentación Oficial
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [R2 Storage](https://developers.cloudflare.com/r2/)

### Comunidad
- [Discord Cloudflare](https://discord.gg/cloudflaredev)
- [GitHub Discussions](https://github.com/cloudflare/workers-sdk/discussions)

---

## ✅ SIGUIENTE PASO

**Ejecutar migración:**
```bash
./migrate-to-cloudflare.sh
```

**O paso a paso manual según esta guía.**

---

**¡Proyecto listo para Cloudflare Workers!** 🚀
