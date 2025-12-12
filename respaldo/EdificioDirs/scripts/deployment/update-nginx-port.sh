#!/bin/bash

echo "🔧 Actualizando configuración de Nginx para puerto 3000..."

# Backup de la configuración actual
echo "💾 Creando backup de configuración actual..."
sudo cp /etc/nginx/sites-available/edificio-admin /etc/nginx/sites-available/edificio-admin.backup.$(date +%Y%m%d_%H%M%S)

# Actualizar configuración
echo "🔄 Actualizando proxy_pass a puerto 3000..."
sudo sed -i 's|proxy_pass http://localhost:3001|proxy_pass http://localhost:3000|g' /etc/nginx/sites-available/edificio-admin

# Mostrar la configuración actualizada
echo "📋 Nueva configuración:"
cat /etc/nginx/sites-available/edificio-admin

# Verificar sintaxis
echo "✅ Verificando sintaxis de nginx..."
sudo /usr/sbin/nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida, recargando nginx..."
    sudo systemctl reload nginx
    echo "🎉 Nginx actualizado y recargado!"
else
    echo "❌ Error en configuración, restaurando backup..."
    sudo cp /etc/nginx/sites-available/edificio-admin.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/edificio-admin
    echo "⚠️ Configuración restaurada"
fi

echo ""
echo "🌐 El sistema debería estar disponible en:"
echo "   http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"