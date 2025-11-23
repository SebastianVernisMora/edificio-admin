#!/bin/bash

echo "🔄 Reiniciando todos los servicios..."

# Detener aplicación
echo "📍 Deteniendo aplicación..."
pm2 stop edificio-admin 2>/dev/null || echo "App no estaba corriendo"
pm2 delete edificio-admin 2>/dev/null || echo "App no estaba en PM2"

# Limpiar procesos node restantes
echo "🧹 Limpiando procesos residuales..."
pkill -f "node.*app.js" 2>/dev/null || echo "No hay procesos residuales"

# Verificar puerto 3000 disponible
echo "🔍 Verificando puerto 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Puerto 3000 libre"

# Reinstalar dependencias si es necesario
if [ "$1" == "--fresh" ]; then
    echo "📦 Reinstalando dependencias..."
    rm -rf node_modules package-lock.json
    npm install
fi

# Iniciar aplicación en puerto 3000
echo "🚀 Iniciando aplicación en puerto 3000..."
cd /home/admin/edificio-admin
PORT=3000 pm2 start src/app.js --name "edificio-admin"

# Esperar a que la app inicie
sleep 3

# Verificar que está corriendo
if pm2 list | grep -q "edificio-admin.*online"; then
    echo "✅ Aplicación corriendo correctamente"
    pm2 logs edificio-admin --lines 3 --nostream
else
    echo "❌ Error al iniciar aplicación"
    pm2 logs edificio-admin --lines 10 --nostream
    exit 1
fi

# Reiniciar nginx si está disponible
if command -v nginx &> /dev/null; then
    echo "🔄 Reiniciando nginx..."
    sudo systemctl restart nginx && echo "✅ Nginx reiniciado" || echo "⚠️ No se pudo reiniciar nginx (permisos)"
else
    echo "⚠️ Nginx no disponible en este sistema"
fi

echo ""
echo "🎉 Redepliegue completado!"
echo "📊 Estado de servicios:"
pm2 list
echo ""
echo "🌐 Aplicación disponible en:"
echo "   - Local: http://localhost:3000"
echo "   - Externo: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"