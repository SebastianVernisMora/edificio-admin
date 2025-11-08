#!/bin/bash

# Script de Inicio para Producción - Edificio Admin
set -e

PROD_DIR="/home/admin/edificio-admin-production"
APP_NAME="edificio-admin"

echo "🚀 Iniciando Edificio Admin en modo producción..."

cd "$PROD_DIR"

# Verificar que el directorio existe
if [ ! -f "src/app.js" ]; then
    echo "❌ Aplicación no encontrada en $PROD_DIR"
    exit 1
fi

# Detener instancia anterior si existe
pm2 delete "$APP_NAME" 2>/dev/null || true

# Esperar un momento
sleep 2

# Iniciar aplicación
echo "🔥 Iniciando aplicación con PM2..."
pm2 start src/app.js --name "$APP_NAME" --env production

# Mostrar estado
pm2 show "$APP_NAME"

# Guardar configuración PM2
pm2 save

echo "✅ Aplicación iniciada exitosamente"
echo "📋 Para monitorear: pm2 monit"
echo "📋 Para ver logs: pm2 logs $APP_NAME"
echo "📋 Para reiniciar: pm2 restart $APP_NAME"