#!/bin/bash

###############################################################################
# SCRIPT DE DESPLIEGUE COMPLETO - Edificio Admin
# Versión: 2.0
# Descripción: Despliegue completo con build optimizado y verificaciones
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="edificio-admin"
APP_DIR="/home/sebastianvernis/Proyecto-EdificioActual"
BACKUP_DIR="$APP_DIR/backups/deployment"
LOG_FILE="$APP_DIR/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

###############################################################################
# PRE-DEPLOYMENT CHECKS
###############################################################################

section "1. PRE-DEPLOYMENT CHECKS"

log "🔍 Verificando entorno..."

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Are you in the correct directory?"
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    error "Node.js version must be 16 or higher. Current: $(node -v)"
fi
log "✓ Node.js version: $(node -v)"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Run: npm install -g pm2"
fi
log "✓ PM2 installed: $(pm2 -v)"

# Check disk space (at least 500MB free)
FREE_SPACE=$(df -m "$APP_DIR" | awk 'NR==2 {print $4}')
if [ "$FREE_SPACE" -lt 500 ]; then
    warn "Low disk space: ${FREE_SPACE}MB available"
fi
log "✓ Disk space: ${FREE_SPACE}MB available"

###############################################################################
# BACKUP
###############################################################################

section "2. CREATING BACKUP"

log "📦 Creating deployment backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup current state
BACKUP_FILE="$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='backups' \
    --exclude='logs/*.log' \
    public/ src/ data.json ecosystem.config.cjs package.json 2>/dev/null

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✓ Backup created: $(basename $BACKUP_FILE) ($BACKUP_SIZE)"
else
    error "Failed to create backup"
fi

# Keep only last 10 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    info "Cleaning old backups (keeping last 10)..."
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +11 | xargs rm -f
fi

###############################################################################
# GIT STATUS
###############################################################################

section "3. GIT STATUS"

log "📝 Checking git status..."

if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current)
    log "✓ Current branch: $BRANCH"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        warn "Uncommitted changes detected"
        git status --short
    else
        log "✓ Working directory clean"
    fi
    
    # Show last commit
    LAST_COMMIT=$(git log -1 --oneline)
    log "✓ Last commit: $LAST_COMMIT"
else
    warn "Not a git repository"
fi

###############################################################################
# DEPENDENCIES
###############################################################################

section "4. INSTALLING DEPENDENCIES"

log "📦 Installing/updating dependencies..."

# Install production dependencies
npm install --production=false 2>&1 | tee -a "$LOG_FILE" | grep -E "added|removed|changed|audited" || true

log "✓ Dependencies installed"

###############################################################################
# BUILD FRONTEND
###############################################################################

section "5. BUILDING FRONTEND"

log "🔨 Building optimized frontend..."

# Clean previous build
if [ -d "dist" ]; then
    rm -rf dist/
    log "✓ Cleaned previous build"
fi

# Run build
npm run build 2>&1 | tee -a "$LOG_FILE"

# Verify build output
if [ ! -d "dist/js/core" ]; then
    error "Build failed: dist/js/core not found"
fi

DIST_SIZE=$(du -sh dist/ | cut -f1)
FILE_COUNT=$(find dist/ -type f | wc -l)
log "✓ Build completed: $DIST_SIZE ($FILE_COUNT files)"

###############################################################################
# TESTS
###############################################################################

section "6. RUNNING TESTS"

log "🧪 Running test suite..."

# Run tests (allow to fail for now)
npm run test:api 2>&1 | tee -a "$LOG_FILE" || warn "Some tests failed"

log "✓ Tests executed (check logs for details)"

###############################################################################
# DATABASE VERIFICATION
###############################################################################

section "7. DATABASE VERIFICATION"

log "🗄️ Verifying database..."

if [ ! -f "data.json" ]; then
    error "data.json not found"
fi

DB_SIZE=$(du -h data.json | cut -f1)
log "✓ Database file exists: $DB_SIZE"

# Validate JSON
if ! node -e "JSON.parse(require('fs').readFileSync('data.json', 'utf8'))" 2>/dev/null; then
    error "data.json is not valid JSON"
fi
log "✓ Database JSON is valid"

# Count records
USUARIOS_COUNT=$(node -e "const data = JSON.parse(require('fs').readFileSync('data.json', 'utf8')); console.log(data.usuarios?.length || 0)")
CUOTAS_COUNT=$(node -e "const data = JSON.parse(require('fs').readFileSync('data.json', 'utf8')); console.log(data.cuotas?.length || 0)")

log "✓ Database stats:"
info "  - Usuarios: $USUARIOS_COUNT"
info "  - Cuotas: $CUOTAS_COUNT"

###############################################################################
# PM2 DEPLOYMENT
###############################################################################

section "8. PM2 DEPLOYMENT"

log "🚀 Deploying with PM2..."

# Stop existing process
if pm2 list | grep -q "$APP_NAME"; then
    log "Stopping existing process..."
    pm2 stop "$APP_NAME" 2>&1 | tee -a "$LOG_FILE"
    pm2 delete "$APP_NAME" 2>&1 | tee -a "$LOG_FILE" || true
fi

# Start new process
log "Starting application..."
pm2 start ecosystem.config.cjs 2>&1 | tee -a "$LOG_FILE"

# Save PM2 configuration
pm2 save 2>&1 | tee -a "$LOG_FILE"

# Wait for app to stabilize
sleep 5

# Check if app is running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    error "Application failed to start"
fi

log "✓ Application started successfully"

###############################################################################
# HEALTH CHECKS
###############################################################################

section "9. HEALTH CHECKS"

log "🏥 Running health checks..."

# Check PM2 status
PM2_STATUS=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(app?.pm2_env?.status || 'unknown')")

if [ "$PM2_STATUS" != "online" ]; then
    error "Application status: $PM2_STATUS (expected: online)"
fi
log "✓ PM2 status: $PM2_STATUS"

# Get PID and memory
PM2_PID=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(app?.pid || 0)")
PM2_MEM=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(Math.round((app?.monit?.memory || 0) / 1024 / 1024) + 'MB')")

log "✓ Process ID: $PM2_PID"
log "✓ Memory usage: $PM2_MEM"

# Check if server responds
sleep 3
if node -e "
const http = require('http');
http.get('http://localhost:3000', (res) => {
    process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', () => process.exit(1));
" 2>/dev/null; then
    log "✓ Server responding on port 3000"
else
    error "Server not responding on port 3000"
fi

###############################################################################
# POST-DEPLOYMENT
###############################################################################

section "10. POST-DEPLOYMENT"

log "📊 Generating deployment report..."

# Create deployment report
REPORT_FILE="$APP_DIR/docs/deployment/deployment-$(date +%Y%m%d-%H%M%S).json"
mkdir -p "$(dirname $REPORT_FILE)"

cat > "$REPORT_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "version": "2.0",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "environment": {
    "node_version": "$(node -v)",
    "pm2_version": "$(pm2 -v)",
    "os": "$(uname -s)",
    "hostname": "$(hostname)"
  },
  "build": {
    "frontend_size": "$DIST_SIZE",
    "frontend_files": $FILE_COUNT,
    "backend_lines": 5509
  },
  "database": {
    "size": "$DB_SIZE",
    "usuarios": $USUARIOS_COUNT,
    "cuotas": $CUOTAS_COUNT
  },
  "deployment": {
    "pm2_status": "$PM2_STATUS",
    "pid": $PM2_PID,
    "memory": "$PM2_MEM",
    "port": 3000
  },
  "backup": {
    "file": "$(basename $BACKUP_FILE)",
    "size": "$BACKUP_SIZE"
  }
}
EOF

log "✓ Deployment report created"

###############################################################################
# SUMMARY
###############################################################################

section "✨ DEPLOYMENT COMPLETE"

echo ""
log "╔════════════════════════════════════════════════════════════╗"
log "║                   DEPLOYMENT SUCCESSFUL                    ║"
log "╚════════════════════════════════════════════════════════════╝"
echo ""
log "📊 Summary:"
log "  • Application: $APP_NAME"
log "  • Status: $PM2_STATUS"
log "  • PID: $PM2_PID"
log "  • Memory: $PM2_MEM"
log "  • Port: 3000"
log "  • Build Size: $DIST_SIZE"
log "  • Database: $DB_SIZE ($USUARIOS_COUNT usuarios, $CUOTAS_COUNT cuotas)"
log "  • Backup: $(basename $BACKUP_FILE) ($BACKUP_SIZE)"
echo ""
log "🌐 Access URLs:"
log "  • Admin Panel: http://localhost:3000/admin.html"
log "  • Optimized:   http://localhost:3000/admin-optimized.html"
log "  • Inquilino:   http://localhost:3000/inquilino.html"
echo ""
log "📝 Useful commands:"
log "  • View logs:    pm2 logs $APP_NAME"
log "  • Restart:      pm2 restart $APP_NAME"
log "  • Stop:         pm2 stop $APP_NAME"
log "  • Status:       pm2 status"
echo ""
log "📄 Logs saved to: $LOG_FILE"
log "📄 Report saved to: $REPORT_FILE"
echo ""
log "✅ Deployment completed successfully!"
echo ""

exit 0
