#!/bin/bash
# Setup de recursos Cloudflare

echo "🚀 Configurando Cloudflare Workers..."

# Crear D1 database
echo "📊 Creando D1 database..."
wrangler d1 create edificio_admin_db

# Crear KV namespaces
echo "🔑 Creando KV namespaces..."
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create CACHE
wrangler kv:namespace create RATE_LIMIT

# Crear R2 bucket
echo "📦 Creando R2 bucket..."
wrangler r2 bucket create edificio-admin-uploads

echo ""
echo "✅ Recursos creados exitosamente"
echo ""
echo "⚠️  IMPORTANTE: Actualiza wrangler.toml con los IDs generados"
