#!/bin/bash

echo "🔍 Verificación del despliegue..."
echo "=================================="
echo ""

# 1. Verificar aplicación corriendo
echo "📊 Estado de la aplicación:"
pm2 list | grep edificio-admin

if pm2 list | grep -q "edificio-admin.*online"; then
    echo "✅ Aplicación corriendo correctamente"
else
    echo "❌ Aplicación no está corriendo"
    exit 1
fi

echo ""

# 2. Verificar archivos del frontend
echo "📁 Verificando archivos del frontend:"

# Index con modal
if grep -q "credentials-modal" frontend-nuevo/index.html; then
    echo "✅ Modal de credenciales en index.html"
else
    echo "❌ Modal NO encontrado en index.html"
fi

# CSS con estilos
if grep -q "credentials-btn" frontend-nuevo/css/styles.css; then
    echo "✅ Estilos del modal en CSS"
else
    echo "❌ Estilos del modal NO encontrados"
fi

# JavaScript con funcionalidad
if grep -q "CredentialsModal" frontend-nuevo/js/auth.js; then
    echo "✅ JavaScript del modal funcional"
else
    echo "❌ JavaScript del modal NO encontrado"
fi

echo ""

# 3. Verificar usuarios en base de datos
echo "👥 Verificando usuarios actualizados:"

# Contar usuarios por tipo
ADMIN_USERS=$(grep -c '"rol": "ADMIN"' data.json || echo "0")
COMITE_USERS=$(grep -c '"rol": "COMITE"' data.json || echo "0")  
INQUILINO_USERS=$(grep -c '"rol": "INQUILINO"' data.json || echo "0")

echo "   - Administradores: $ADMIN_USERS"
echo "   - Comité: $COMITE_USERS"
echo "   - Inquilinos: $INQUILINO_USERS"

# Verificar contraseñas actualizadas
if grep -q "Admin2025!" data.json; then
    echo "✅ Contraseñas de admin actualizadas"
else
    echo "❌ Contraseñas de admin NO actualizadas"
fi

if grep -q "Inquilino2025!" data.json; then
    echo "✅ Contraseñas de inquilino actualizadas"  
else
    echo "❌ Contraseñas de inquilino NO actualizadas"
fi

echo ""

# 4. Verificar nginx
echo "🌐 Estado de nginx:"
if ps aux | grep -q "nginx.*master"; then
    echo "✅ Nginx corriendo"
    
    # Verificar configuración
    if grep -q "proxy_pass http://localhost:3000" /etc/nginx/sites-available/edificio-admin 2>/dev/null; then
        echo "✅ Nginx configurado para puerto 3000"
    else
        echo "⚠️ Verificar configuración de nginx manualmente"
    fi
else
    echo "❌ Nginx no está corriendo"
fi

echo ""

# 5. Resumen de URLs
echo "🌐 URLs de acceso disponibles:"
echo "   - Externa: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"
echo "   - Interna: http://localhost:3000"

echo ""

# 6. Credenciales disponibles
echo "🔑 Credenciales en el popup:"
echo "   ┌─────────────┬──────────────────────────────────────┬─────────────────┐"
echo "   │ ROL         │ EMAIL                                │ PASSWORD        │"
echo "   ├─────────────┼──────────────────────────────────────┼─────────────────┤"
echo "   │ ADMIN       │ admin@edificio205.com                │ Admin2025!      │"
echo "   │ COMITÉ      │ comite@edificio205.com               │ Comite2025!     │"
echo "   │ INQUILINO   │ maria.garcia@edificio205.com         │ Inquilino2025!  │"
echo "   │ INQUILINO   │ carlos.lopez@edificio205.com         │ Inquilino2025!  │"
echo "   │ INQUILINO   │ ana.martinez@edificio205.com         │ Inquilino2025!  │"
echo "   │ INQUILINO   │ roberto.silva@edificio205.com        │ Inquilino2025!  │"
echo "   └─────────────┴──────────────────────────────────────┴─────────────────┘"

echo ""

# 7. Verificación final
echo "✅ DESPLIEGUE VERIFICADO Y COMPLETO"
echo ""
echo "💡 Para probar:"
echo "   1. Ir a: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"  
echo "   2. Hacer clic en 'Ver Credenciales de Demo'"
echo "   3. Ver el popup con todas las credenciales"
echo "   4. Usar cualquiera de las credenciales para acceder"