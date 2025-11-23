#!/bin/bash

echo "🔄 Sincronizando archivos del frontend..."
echo "======================================="

# Directorio base
BASE_DIR="/home/admin/edificio-admin"
SOURCE_DIR="$BASE_DIR/frontend-nuevo"
TARGET_DIR="$BASE_DIR/public"

# Verificar que los directorios existen
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Directorio fuente no existe: $SOURCE_DIR"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Directorio destino no existe: $TARGET_DIR"
    exit 1
fi

# Crear backup de archivos actuales
BACKUP_DIR="$BASE_DIR/backups/frontend-backup-$(date +%Y%m%d_%H%M%S)"
echo "💾 Creando backup en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r "$TARGET_DIR"/* "$BACKUP_DIR/" 2>/dev/null || echo "⚠️ No hay archivos para respaldar"

# Sincronizar archivos principales
echo ""
echo "📂 Sincronizando archivos HTML..."
cp "$SOURCE_DIR/index.html" "$TARGET_DIR/index.html"
cp "$SOURCE_DIR/admin.html" "$TARGET_DIR/admin.html" 2>/dev/null || echo "⚠️ admin.html no encontrado en fuente"
cp "$SOURCE_DIR/inquilino.html" "$TARGET_DIR/inquilino.html" 2>/dev/null || echo "⚠️ inquilino.html no encontrado en fuente"

echo "🎨 Sincronizando CSS..."
cp "$SOURCE_DIR/css/"*.css "$TARGET_DIR/css/" 2>/dev/null || echo "⚠️ Archivos CSS no encontrados"

echo "⚙️ Sincronizando JavaScript..."
cp "$SOURCE_DIR/js/"*.js "$TARGET_DIR/js/" 2>/dev/null || echo "⚠️ Archivos JS no encontrados"

# Verificar sincronización
echo ""
echo "✅ Verificando sincronización..."

# Verificar modal
if grep -q "credentials-modal" "$TARGET_DIR/index.html"; then
    echo "✅ Modal de credenciales sincronizado"
else
    echo "❌ Modal de credenciales NO sincronizado"
fi

# Verificar estilos
if grep -q "credentials-btn" "$TARGET_DIR/css/styles.css"; then
    echo "✅ Estilos CSS sincronizados"
else
    echo "❌ Estilos CSS NO sincronizados"
fi

# Verificar JavaScript
if grep -q "CredentialsModal" "$TARGET_DIR/js/auth.js"; then
    echo "✅ JavaScript sincronizado"
else
    echo "❌ JavaScript NO sincronizado"
fi

# Reiniciar aplicación para cargar cambios
echo ""
echo "🔄 Reiniciando aplicación para aplicar cambios..."
pm2 restart edificio-admin

# Esperar reinicio
sleep 3

if pm2 list | grep -q "edificio-admin.*online"; then
    echo "✅ Aplicación reiniciada correctamente"
else
    echo "❌ Error al reiniciar aplicación"
    exit 1
fi

echo ""
echo "🎉 ¡Sincronización completada!"
echo ""
echo "🌐 Para probar los cambios:"
echo "   1. Ir a: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com"
echo "   2. Buscar el botón 'Ver Credenciales de Demo' debajo del formulario de login"
echo "   3. Hacer clic para abrir el popup con las credenciales"
echo ""
echo "💾 Backup creado en: $BACKUP_DIR"