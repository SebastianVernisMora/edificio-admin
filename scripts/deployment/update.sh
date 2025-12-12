#!/bin/bash

###############################################################################
# SCRIPT DE ACTUALIZACIÓN RÁPIDA - Edificio Admin
# Descripción: Actualización rápida sin rebuild completo
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="edificio-admin"

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

echo ""
log "🔄 ACTUALIZACIÓN RÁPIDA - $APP_NAME"
echo ""

# Git pull (if in git repo)
if [ -d ".git" ]; then
    info "📥 Pulling latest changes..."
    git pull
fi

# Install dependencies (if package.json changed)
if [ -n "$(git diff HEAD@{1} HEAD -- package.json)" ] 2>/dev/null; then
    info "📦 Installing new dependencies..."
    npm install
fi

# Rebuild if source changed
if [ -n "$(git diff HEAD@{1} HEAD -- src-optimized/)" ] 2>/dev/null; then
    info "🔨 Rebuilding frontend..."
    npm run build
fi

# Restart PM2
log "🔄 Restarting application..."
pm2 restart "$APP_NAME"

sleep 2

# Check status
if pm2 list | grep -q "$APP_NAME.*online"; then
    log "✅ Update completed successfully"
    pm2 status "$APP_NAME"
else
    log "❌ Update failed - check logs"
    pm2 logs "$APP_NAME" --lines 20
    exit 1
fi

echo ""
log "✨ Application updated and running"
echo ""

exit 0
