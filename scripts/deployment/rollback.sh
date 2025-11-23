#!/bin/bash

###############################################################################
# SCRIPT DE ROLLBACK - Edificio Admin
# Descripción: Revertir a backup anterior en caso de problemas
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="edificio-admin"
APP_DIR="/home/sebastianvernis/Proyecto-EdificioActual"
BACKUP_DIR="$APP_DIR/backups/deployment"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

###############################################################################
# ROLLBACK
###############################################################################

echo ""
log "╔════════════════════════════════════════════════════════════╗"
log "║                    ROLLBACK DEPLOYMENT                     ║"
log "╚════════════════════════════════════════════════════════════╝"
echo ""

# List available backups
log "📦 Available backups:"
echo ""

if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    error "No backups found in $BACKUP_DIR"
fi

ls -lht "$BACKUP_DIR"/*.tar.gz | head -10 | awk '{print NR". "$9" ("$5")"}'

echo ""
read -p "Select backup number to restore (or 'q' to quit): " BACKUP_NUM

if [ "$BACKUP_NUM" = "q" ]; then
    log "Rollback cancelled"
    exit 0
fi

# Get selected backup file
BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.tar.gz | sed -n "${BACKUP_NUM}p")

if [ ! -f "$BACKUP_FILE" ]; then
    error "Invalid selection or backup file not found"
fi

log "Selected backup: $(basename $BACKUP_FILE)"
echo ""
warn "⚠️  This will restore the application to the state of the selected backup"
warn "⚠️  Current state will be lost (but backed up first)"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Rollback cancelled"
    exit 0
fi

# Backup current state before rollback
log "📦 Backing up current state..."
ROLLBACK_BACKUP="$BACKUP_DIR/pre-rollback-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$ROLLBACK_BACKUP" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='backups' \
    public/ src/ data.json ecosystem.config.cjs package.json 2>/dev/null

log "✓ Current state backed up to: $(basename $ROLLBACK_BACKUP)"

# Stop PM2 process
log "🛑 Stopping application..."
pm2 stop "$APP_NAME" 2>/dev/null || true

# Extract backup
log "📂 Restoring backup..."
cd "$APP_DIR"

# Restore files
tar -xzf "$BACKUP_FILE" --overwrite

log "✓ Files restored"

# Reinstall dependencies (in case package.json changed)
log "📦 Reinstalling dependencies..."
npm install --production 2>&1 | grep -E "added|removed|changed|audited" || true

# Rebuild frontend
log "🔨 Rebuilding frontend..."
npm run build 2>&1 | grep -E "Done|Built|complete" || true

# Restart application
log "🚀 Restarting application..."
pm2 restart "$APP_NAME" 2>/dev/null || pm2 start ecosystem.config.cjs

sleep 3

# Verify
if pm2 list | grep -q "$APP_NAME.*online"; then
    log "✓ Application restarted successfully"
else
    error "Application failed to restart"
fi

# Save PM2 state
pm2 save 2>/dev/null

echo ""
log "╔════════════════════════════════════════════════════════════╗"
log "║                   ROLLBACK SUCCESSFUL                      ║"
log "╚════════════════════════════════════════════════════════════╝"
echo ""
log "✓ Application rolled back to: $(basename $BACKUP_FILE)"
log "✓ Current state saved to: $(basename $ROLLBACK_BACKUP)"
echo ""
log "🌐 Application available at: http://localhost:3000"
echo ""

exit 0
