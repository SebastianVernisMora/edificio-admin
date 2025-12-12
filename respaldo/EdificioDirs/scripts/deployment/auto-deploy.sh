#!/bin/bash

# Script de auto-despliegue para edificio-admin
# Se ejecuta cada vez que se detectan cambios en master

echo "🚀 Iniciando auto-despliegue $(date)"

cd /home/admin/edificio-admin

# Obtener cambios del repositorio
echo "📥 Descargando cambios..."
git fetch origin master

# Verificar si hay cambios nuevos
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ $LOCAL = $REMOTE ]; then
    echo "✅ Sin cambios nuevos"
    exit 0
fi

echo "🔄 Aplicando cambios..."
git pull origin master

# Instalar dependencias si package.json cambió
if git diff HEAD~1..HEAD --name-only | grep -q "package.json"; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Reiniciar servidor
echo "🔄 Reiniciando servidor..."
pkill -f "node.*app" || true
sleep 3

# Iniciar servidor en background
echo "▶️ Iniciando servidor..."
nohup npm run dev > server.log 2>&1 &

echo "✅ Despliegue completado $(date)"
echo "📊 Servidor ejecutándose en puerto 3000"