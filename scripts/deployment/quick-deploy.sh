#!/bin/bash

###############################################################################
# QUICK DEPLOY - Edificio Admin
# Descripción: Despliegue rápido sin verificaciones extensas
###############################################################################

set -e

APP_NAME="edificio-admin"

echo ""
echo "🚀 QUICK DEPLOY - $APP_NAME"
echo ""

# Build
echo "🔨 Building..."
npm run build > /dev/null 2>&1

# Restart
echo "🔄 Restarting..."
pm2 restart "$APP_NAME" > /dev/null 2>&1

sleep 2

# Verify
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo "✅ Deployed successfully"
    pm2 status "$APP_NAME"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
exit 0
