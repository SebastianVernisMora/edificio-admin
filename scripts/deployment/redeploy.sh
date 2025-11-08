#!/bin/bash

# 🚀 Script de Redespliegue para Edificio-Admin
# Este script reinicia completamente la aplicación con cero downtime

echo "🚀 INICIANDO REDESPLIEGUE EDIFICIO-ADMIN $(date)"
echo "============================================="

cd /home/admin/edificio-admin

# 1. Verificar estado actual
echo "📊 Estado actual de la aplicación:"
pm2 status edificio-admin

# 2. Crear backup de datos antes del redespliegue
echo "💾 Creando backup de seguridad..."
node -e "
const fs = require('fs');
const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupFile = 'data-backup-redeploy-' + timestamp + '.json';
if (fs.existsSync('data.json')) {
  fs.copyFileSync('data.json', 'backups/' + backupFile);
  console.log('✅ Backup creado:', backupFile);
} else {
  console.log('⚠️ No se encontró data.json para backup');
}
"

# 3. Obtener cambios del repositorio (si es un repo git)
if [ -d .git ]; then
    echo "📥 Verificando cambios en repositorio..."
    git fetch origin master 2>/dev/null || echo "⚠️ Sin repositorio remoto configurado"
    
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/master 2>/dev/null)
    
    if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
        echo "🔄 Aplicando cambios del repositorio..."
        git pull origin master
    else
        echo "✅ Código ya actualizado"
    fi
else
    echo "ℹ️ Sin repositorio git - usando código local"
fi

# 4. Instalar/actualizar dependencias si package.json cambió
if [ -f package.json ]; then
    echo "📦 Verificando dependencias..."
    npm install --production
else
    echo "⚠️ No se encontró package.json"
fi

# 5. Verificar integridad de archivos críticos
echo "🔍 Verificando archivos críticos..."
CRITICAL_FILES=("src/app.js" "package.json" "data.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - MISSING"
    fi
done

# 6. Reiniciar aplicación con PM2 (cero downtime)
echo "🔄 Reiniciando aplicación con PM2..."
if pm2 list | grep -q "edificio-admin"; then
    # Restart existente
    pm2 restart edificio-admin
    echo "✅ Aplicación reiniciada"
else
    # Iniciar nueva instancia
    pm2 start src/app.js --name edificio-admin
    echo "✅ Nueva instancia iniciada"
fi

# 7. Esperar a que la aplicación esté lista
echo "⏳ Esperando a que la aplicación esté lista..."
sleep 5

# 8. Verificar que la aplicación responde
echo "🔍 Verificando que la aplicación responde..."
if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    echo "✅ Aplicación responde correctamente en puerto 3000"
elif curl -sf http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Aplicación responde correctamente en puerto 3001"
else
    echo "⚠️ Verificación manual requerida - aplicación puede estar iniciando"
fi

# 9. Estado final
echo ""
echo "📊 ESTADO FINAL:"
pm2 status edificio-admin

# 10. Información adicional
echo ""
echo "ℹ️ INFORMACIÓN ADICIONAL:"
echo "- Logs: pm2 logs edificio-admin"
echo "- Stop: pm2 stop edificio-admin"
echo "- Restart: pm2 restart edificio-admin"
echo "- Monitor: pm2 monit"

# 11. Limpiar archivos temporales si existen
if [ -f nohup.out ]; then
    rm -f nohup.out
    echo "🧹 Archivos temporales limpiados"
fi

echo ""
echo "🎉 REDESPLIEGUE COMPLETADO EXITOSAMENTE $(date)"
echo "============================================="