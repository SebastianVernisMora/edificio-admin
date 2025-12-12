#!/bin/bash

# Script de Migración Completa a Cloudflare Workers
# Edificio Admin SAAS
# Fecha: 2025-12-11

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     MIGRACIÓN A CLOUDFLARE WORKERS + D1 + KV + R2          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC}  $1"; }
log_success() { echo -e "${GREEN}✓${NC}  $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC}  $1"; }
log_error() { echo -e "${RED}✗${NC}  $1"; }

PROJECT_ROOT=$(pwd)
CF_DIR="cloudflare-workers"

# Verificar wrangler CLI
if ! command -v wrangler &> /dev/null; then
    log_error "Wrangler CLI no está instalado"
    log_info "Instalar con: npm install -g wrangler"
    exit 1
fi

log_success "Wrangler CLI encontrado"

# Preguntar si crear desde cero o usar existente
echo ""
read -p "¿Usar proyecto cloudflare-saas existente? (s/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    CF_DIR="cloudflare-saas"
    log_info "Usando proyecto existente: $CF_DIR"
else
    log_info "Creando nuevo proyecto: $CF_DIR"
    mkdir -p "$CF_DIR"
fi

cd "$CF_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 1: ESTRUCTURA DE DIRECTORIOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Creando estructura completa..."

# Crear directorios
mkdir -p migrations
mkdir -p src/{api,services,models,middleware,utils,repositories,config,templates}
mkdir -p public/assets/{css,js,images}
mkdir -p scripts
mkdir -p tests/{unit,integration}
mkdir -p docs

log_success "Estructura de directorios creada"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 2: ARCHIVOS DE CONFIGURACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crear wrangler.toml si no existe
if [ ! -f "wrangler.toml" ]; then
    log_info "Creando wrangler.toml..."
    cat > wrangler.toml << 'WRANGLER'
name = "edificio-admin-saas"
main = "src/index.js"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "edificio_admin_db"
database_id = "" # Se llenará después

# KV Namespaces
[[kv_namespaces]]
binding = "SESSIONS"
id = ""  # Se llenará después

[[kv_namespaces]]
binding = "CACHE"
id = ""  # Se llenará después

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = ""  # Se llenará después

# R2 Buckets
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "edificio-admin-uploads"

# Variables
[vars]
ENVIRONMENT = "production"
JWT_SECRET = "change-this-in-production"

# Development
[env.development]
name = "edificio-admin-saas-dev"
vars = { ENVIRONMENT = "development" }
WRANGLER
    log_success "wrangler.toml creado"
fi

# Crear package.json si no existe
if [ ! -f "package.json" ]; then
    log_info "Creando package.json..."
    cat > package.json << 'PACKAGE'
{
  "name": "edificio-admin-cloudflare",
  "version": "2.0.0",
  "description": "Edificio Admin SAAS - Cloudflare Workers",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "migrate": "wrangler d1 execute edificio_admin_db --file=./migrations/0001_initial_schema.sql",
    "test": "vitest",
    "cf:setup": "./scripts/setup-cloudflare.sh"
  },
  "dependencies": {
    "itty-router": "^4.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
PACKAGE
    log_success "package.json creado"
fi

# Crear .dev.vars si no existe
if [ ! -f ".dev.vars" ]; then
    log_info "Creando .dev.vars..."
    cat > .dev.vars << 'DEVVARS'
JWT_SECRET=dev-secret-key-change-in-production
ENVIRONMENT=development
DEVVARS
    log_success ".dev.vars creado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 3: MIGRACIONES D1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Creando schema SQL..."

cat > migrations/0001_initial_schema.sql << 'SQL'
-- Schema inicial para Edificio Admin SAAS

-- Edificios (multi-tenant)
CREATE TABLE IF NOT EXISTS edificios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT,
    total_departamentos INTEGER DEFAULT 20,
    admin_user_id TEXT,
    plan TEXT DEFAULT 'BASIC',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    departamento TEXT,
    telefono TEXT,
    edificio_id TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Cuotas
CREATE TABLE IF NOT EXISTS cuotas (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    departamento TEXT NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    monto REAL NOT NULL,
    estado TEXT DEFAULT 'pendiente',
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
CREATE TABLE IF NOT EXISTS gastos (
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
CREATE TABLE IF NOT EXISTS fondos (
    id TEXT PRIMARY KEY,
    edificio_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    monto REAL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Anuncios
CREATE TABLE IF NOT EXISTS anuncios (
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
CREATE TABLE IF NOT EXISTS solicitudes (
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

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    edificio_id TEXT,
    usuario_id TEXT,
    accion TEXT NOT NULL,
    entidad TEXT,
    entidad_id TEXT,
    detalles TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_edificio ON usuarios(edificio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_edificio ON cuotas(edificio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_fecha ON cuotas(anio, mes);
CREATE INDEX IF NOT EXISTS idx_gastos_edificio ON gastos(edificio_id);
CREATE INDEX IF NOT EXISTS idx_audit_edificio ON audit_log(edificio_id);
SQL

log_success "Schema SQL creado: migrations/0001_initial_schema.sql"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 4: COPIAR FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$PROJECT_ROOT/public" ]; then
    log_info "Copiando archivos frontend..."
    cp -r "$PROJECT_ROOT/public/"* public/ 2>/dev/null || true
    log_success "Frontend copiado a public/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 5: SCRIPTS DE SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Creando script de setup de Cloudflare..."

cat > scripts/setup-cloudflare.sh << 'SETUP'
#!/bin/bash
# Setup de recursos Cloudflare

echo "🚀 Configurando Cloudflare Workers..."

# Crear D1 database
echo "📊 Creando D1 database..."
wrangler d1 create edificio_admin_db

# Crear KV namespaces
echo "🔑 Creando KV namespaces..."
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create RATE_LIMIT

# Crear R2 bucket
echo "📦 Creando R2 bucket..."
wrangler r2 bucket create edificio-admin-uploads

echo ""
echo "✅ Recursos creados exitosamente"
echo ""
echo "⚠️  IMPORTANTE: Actualiza wrangler.toml con los IDs generados"
SETUP

chmod +x scripts/setup-cloudflare.sh
log_success "Script de setup creado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIGRACIÓN PREPARADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_success "Estructura Cloudflare Workers creada en: $CF_DIR"
echo ""
log_info "Próximos pasos:"
echo ""
echo "  1. cd $CF_DIR"
echo "  2. npm install"
echo "  3. wrangler login"
echo "  4. ./scripts/setup-cloudflare.sh"
echo "  5. Actualizar wrangler.toml con los IDs generados"
echo "  6. wrangler d1 execute edificio_admin_db --file=./migrations/0001_initial_schema.sql"
echo "  7. npm run dev (para probar localmente)"
echo "  8. npm run deploy (para desplegar)"
echo ""
log_warning "⚠️  No olvides actualizar JWT_SECRET en wrangler.toml"
echo ""
log_success "¡Listo para Cloudflare Workers!"
echo ""
