#!/bin/bash
echo "🛑 Deteniendo aplicación..."
pm2 stop edificio-admin 2>/dev/null || true
pm2 delete edificio-admin 2>/dev/null || true
echo "✅ Aplicación detenida"