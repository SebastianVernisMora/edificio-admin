#!/bin/bash

# Script de desarrollo para Edificio Admin SaaS

echo "🚀 Iniciando servidor de desarrollo..."
echo ""

# Verificar si existen los recursos de Cloudflare locales
if ! wrangler d1 list 2>/dev/null | grep -q "edificio_admin_db"; then
    echo "⚠️  Base de datos D1 no encontrada. Creando en modo local..."
    wrangler d1 create edificio_admin_db --local
fi

if ! wrangler kv:namespace list 2>/dev/null | grep -q "SESSIONS"; then
    echo "⚠️  KV Namespace no encontrado. Creando en modo local..."
    wrangler kv:namespace create "SESSIONS" --preview
fi

echo ""
echo "✅ Configuración lista"
echo ""
echo "📁 Sirviendo archivos estáticos desde: ./public"
echo "🔧 API disponible en: http://localhost:8787/api/"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar wrangler dev con archivos estáticos
npx wrangler dev --local --persist-to .wrangler/state --port 8787 --assets ./public
