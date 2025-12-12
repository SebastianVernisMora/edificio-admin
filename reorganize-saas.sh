#!/bin/bash

# Script de Reorganización Automática - Edificio Admin SAAS
# Fecha: 2025-12-11
# Versión: 1.0

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     REORGANIZACIÓN EDIFICIO-ADMIN → ESTRUCTURA SAAS         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_ROOT=$(pwd)
BACKUP_DIR="proyecto-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}.tar.gz"

# Función para log
log_info() {
    echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
    echo -e "${GREEN}✓${NC}  $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

log_error() {
    echo -e "${RED}✗${NC}  $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "Error: No se encontró package.json"
    log_error "Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

echo ""
log_info "Directorio del proyecto: $PROJECT_ROOT"
echo ""

# Preguntar confirmación
read -p "¿Continuar con la reorganización? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    log_warning "Reorganización cancelada"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 1: BACKUP Y LIMPIEZA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Crear backup
log_info "Creando backup completo..."
tar -czf "$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=respaldo \
    --exclude=root \
    . 2>/dev/null

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup creado: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_error "Error al crear backup"
    exit 1
fi

# 2. Crear directorio .archive
log_info "Moviendo archivos antiguos a .archive..."
mkdir -p .archive

if [ -d "respaldo" ]; then
    mv respaldo .archive/
    log_success "respaldo/ → .archive/respaldo/"
fi

if [ -d "root" ]; then
    mv root .archive/
    log_success "root/ → .archive/root/"
fi

if [ -d "cloudflare-saas" ]; then
    mv cloudflare-saas .archive/
    log_success "cloudflare-saas/ → .archive/cloudflare-saas/"
fi

# 3. Limpiar archivos temporales
log_info "Limpiando archivos temporales..."
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.old" -type f -delete 2>/dev/null || true
log_success "Archivos temporales eliminados"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 2: CREAR ESTRUCTURA BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crear estructura backend
log_info "Creando directorios backend..."
mkdir -p backend/src/api/v1/{routes,controllers,validators}
mkdir -p backend/src/core/{models,services}
mkdir -p backend/src/shared/{middleware,utils}
mkdir -p backend/src/config
mkdir -p backend/database/{migrations,seeds}
mkdir -p backend/tests
log_success "Estructura backend creada"

# Mover archivos backend
log_info "Moviendo archivos backend..."

if [ -d "src/routes" ]; then
    cp -r src/routes backend/src/api/v1/
    log_success "routes/ → backend/src/api/v1/routes/"
fi

if [ -d "src/controllers" ]; then
    cp -r src/controllers backend/src/api/v1/
    log_success "controllers/ → backend/src/api/v1/controllers/"
fi

if [ -d "src/models" ]; then
    cp -r src/models backend/src/core/
    log_success "models/ → backend/src/core/models/"
fi

if [ -d "src/middleware" ]; then
    cp -r src/middleware backend/src/shared/
    log_success "middleware/ → backend/src/shared/middleware/"
fi

if [ -d "src/utils" ]; then
    cp -r src/utils backend/src/shared/
    log_success "utils/ → backend/src/shared/utils/"
fi

if [ -f "src/app.js" ]; then
    cp src/app.js backend/src/
    log_success "app.js → backend/src/app.js"
fi

if [ -f "src/data.js" ]; then
    cp src/data.js backend/src/
    log_success "data.js → backend/src/data.js"
fi

if [ -f "src/seed.js" ]; then
    cp src/seed.js backend/database/seeds/
    log_success "seed.js → backend/database/seeds/"
fi

# Mover config
if [ -d "config" ]; then
    cp -r config/* backend/src/config/ 2>/dev/null || true
    log_success "config/ → backend/src/config/"
fi

# Mover data.json
if [ -f "data.json" ]; then
    cp data.json backend/database/
    log_success "data.json → backend/database/data.json"
fi

# Mover .env
if [ -f ".env" ]; then
    cp .env backend/
    log_success ".env → backend/.env"
fi

# Mover tests
if [ -d "tests" ]; then
    cp -r tests backend/
    log_success "tests/ → backend/tests/"
fi

# Copiar package.json
if [ -f "package.json" ]; then
    cp package.json backend/
    log_success "package.json → backend/package.json"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 3: CREAR ESTRUCTURA FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crear estructura frontend
log_info "Creando directorios frontend..."
mkdir -p frontend/public
log_success "Estructura frontend creada"

# Mover archivos frontend
log_info "Moviendo archivos frontend..."

if [ -d "public" ]; then
    cp -r public/* frontend/public/
    log_success "public/ → frontend/public/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 4: CREAR ESTRUCTURA STORAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crear storage
log_info "Organizando storage..."
mkdir -p storage/{uploads,backups,logs}

if [ -d "uploads" ]; then
    cp -r uploads/* storage/uploads/ 2>/dev/null || true
    log_success "uploads/ → storage/uploads/"
fi

if [ -d "backups" ]; then
    cp -r backups/* storage/backups/ 2>/dev/null || true
    log_success "backups/ → storage/backups/"
fi

if [ -d "logs" ]; then
    cp -r logs/* storage/logs/ 2>/dev/null || true
    log_success "logs/ → storage/logs/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 5: COPIAR ARCHIVOS ADICIONALES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copiar scripts
if [ -d "scripts" ]; then
    cp -r scripts ./ 2>/dev/null || true
    log_success "scripts/ copiado"
fi

# Copiar docs
if [ -d "docs" ]; then
    cp -r docs ./ 2>/dev/null || true
    log_success "docs/ copiado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 6: GENERAR DOCUMENTACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Creando README para backend..."
cat > backend/README.md << 'BACKEND_README'
# Backend - Edificio Admin API

## Estructura

```
backend/
├── src/
│   ├── api/v1/         # API REST v1
│   ├── core/           # Lógica de negocio
│   ├── shared/         # Código compartido
│   ├── config/         # Configuración
│   └── app.js          # Entry point
├── database/           # Base de datos
├── tests/              # Tests
└── package.json
```

## Iniciar

```bash
cd backend
npm install
npm run dev
```

## Variables de Entorno

Ver `.env` para configuración.
BACKEND_README

log_success "backend/README.md creado"

log_info "Creando README para frontend..."
cat > frontend/README.md << 'FRONTEND_README'
# Frontend - Edificio Admin Web

## Estructura

```
frontend/
└── public/
    ├── index.html      # Login
    ├── admin.html      # Panel Admin
    └── inquilino.html  # Panel Inquilino
```

## Desarrollo

Los archivos son estáticos, puedes servirlos con:

```bash
cd frontend/public
python -m http.server 8080
```

O usar el backend que los sirve automáticamente.
FRONTEND_README

log_success "frontend/README.md creado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ REORGANIZACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_success "Nueva estructura creada exitosamente"
echo ""
log_info "Resumen:"
echo "  📁 backend/     - API y lógica de negocio"
echo "  📁 frontend/    - Interfaz web"
echo "  📁 storage/     - Uploads, backups, logs"
echo "  📁 .archive/    - Archivos antiguos (puedes borrar)"
echo ""
log_warning "⚠️  IMPORTANTE: Los archivos originales NO fueron borrados"
log_warning "   Se crearon COPIAS en la nueva estructura"
echo ""
log_info "Backup guardado en: $BACKUP_FILE"
echo ""
log_info "Próximos pasos:"
echo "  1. Revisar la nueva estructura"
echo "  2. Probar: cd backend && npm run dev"
echo "  3. Si todo funciona, borrar archivos antiguos:"
echo "     rm -rf src/ public/ tests/ config/ data.json .env"
echo "  4. (Opcional) Borrar .archive/ si no lo necesitas"
echo ""
log_success "¡Reorganización completa!"
echo ""
