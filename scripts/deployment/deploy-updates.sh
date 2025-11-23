#!/bin/bash

echo "🚀 Desplegando actualizaciones del sistema..."
echo "📅 Fecha: $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Crear backup de los datos actuales
echo "💾 Creando backup de seguridad..."
BACKUP_FILE="data-backup-deploy-$(date +%Y%m%d_%H%M%S).json"
cp data.json backups/$BACKUP_FILE
echo "✅ Backup creado: backups/$BACKUP_FILE"

# 2. Verificar que los nuevos archivos están presentes
echo ""
echo "🔍 Verificando archivos actualizados..."

# Verificar popup en index.html
if grep -q "credentials-modal" frontend-nuevo/index.html; then
    echo "✅ Modal de credenciales encontrado en index.html"
else
    echo "❌ Modal de credenciales NO encontrado en index.html"
    exit 1
fi

# Verificar estilos del modal
if grep -q "credentials-btn" frontend-nuevo/css/styles.css; then
    echo "✅ Estilos del modal encontrados en styles.css"
else
    echo "❌ Estilos del modal NO encontrados en styles.css"
    exit 1
fi

# Verificar JavaScript del modal
if grep -q "CredentialsModal" frontend-nuevo/js/auth.js; then
    echo "✅ JavaScript del modal encontrado en auth.js"
else
    echo "❌ JavaScript del modal NO encontrado en auth.js"
    exit 1
fi

# 3. Verificar usuarios en data.json
echo ""
echo "👥 Verificando usuarios actualizados..."
ADMIN_COUNT=$(grep -c "Admin2025!" data.json || echo "0")
INQUILINO_COUNT=$(grep -c "Inquilino2025!" data.json || echo "0")

if [ "$ADMIN_COUNT" -gt "0" ] && [ "$INQUILINO_COUNT" -gt "0" ]; then
    echo "✅ Usuarios actualizados encontrados en data.json"
    echo "   - Contraseñas de Admin2025!: $ADMIN_COUNT"
    echo "   - Contraseñas de Inquilino2025!: $INQUILINO_COUNT"
else
    echo "❌ Usuarios NO actualizados en data.json"
    echo "   - Ejecutando reset de usuarios..."
    node scripts/maintenance/reset-users.js
    if [ $? -eq 0 ]; then
        echo "✅ Usuarios reseteados correctamente"
    else
        echo "❌ Error al resetear usuarios"
        exit 1
    fi
fi

# 4. Reiniciar la aplicación
echo ""
echo "🔄 Reiniciando aplicación..."
pm2 restart edificio-admin

# Esperar a que la aplicación se reinicie
echo "⏳ Esperando reinicio de la aplicación..."
sleep 5

# Verificar que está corriendo
if pm2 list | grep -q "edificio-admin.*online"; then
    echo "✅ Aplicación reiniciada correctamente"
else
    echo "❌ Error al reiniciar aplicación"
    pm2 logs edificio-admin --lines 10
    exit 1
fi

# 5. Limpiar caché de navegador (archivos estáticos)
echo ""
echo "🧹 Limpiando caché de archivos estáticos..."
# Agregar timestamp para forzar recarga
TIMESTAMP=$(date +%s)
echo "   - Timestamp para caché: $TIMESTAMP"

# 6. Verificar conectividad
echo ""
echo "🔍 Verificando conectividad..."
sleep 2

# Test básico de conectividad (sin curl por restricciones)
if pm2 logs edificio-admin --lines 3 | grep -q "Sistema inicializado"; then
    echo "✅ Sistema inicializado correctamente"
else
    echo "⚠️ Verificar logs manualmente"
    pm2 logs edificio-admin --lines 5
fi

# 7. Resumen final
echo ""
echo "🎉 ¡DESPLIEGUE COMPLETADO!"
echo ""
echo "📋 Resumen de cambios desplegados:"
echo "   ✅ Modal de credenciales en página de login"
echo "   ✅ Nuevos estilos CSS para el popup"
echo "   ✅ JavaScript para manejo del modal"
echo "   ✅ Usuarios actualizados con nuevas contraseñas"
echo "   ✅ Sistema reiniciado y funcionando"
echo ""
echo "🌐 URLs de acceso:"
echo "   - Externa: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"
echo "   - Interna: http://localhost:3000"
echo ""
echo "🔑 Credenciales disponibles en el popup de la página de login:"
echo "   - ADMIN:     admin@edificio205.com / Admin2025!"
echo "   - COMITÉ:    comite@edificio205.com / Comite2025!"
echo "   - INQUILINO: maria.garcia@edificio205.com / Inquilino2025!"
echo "   - INQUILINO: carlos.lopez@edificio205.com / Inquilino2025!"
echo "   - INQUILINO: ana.martinez@edificio205.com / Inquilino2025!"
echo "   - INQUILINO: roberto.silva@edificio205.com / Inquilino2025!"
echo ""
echo "💡 Prueba el popup haciendo clic en 'Ver Credenciales de Demo' en la página de login"
echo ""
echo "📊 Estado actual del sistema:"
pm2 list