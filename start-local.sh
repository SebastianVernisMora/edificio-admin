#!/bin/bash

# Script para iniciar Edificio Admin en modo local

echo "🚀 Iniciando Edificio Admin - Modo Local"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Detener procesos anteriores en puerto 3000
echo "🔍 Verificando puerto 3000..."
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  Puerto 3000 ocupado (PID: $PORT_PID), terminando proceso..."
    kill -9 $PORT_PID 2>/dev/null
    sleep 1
fi

# Iniciar servidor
echo "🚀 Iniciando servidor..."
echo ""
node src/app.js

# Este script mantiene el servidor en primer plano
# Para correr en background, usa: ./start-local.sh &
