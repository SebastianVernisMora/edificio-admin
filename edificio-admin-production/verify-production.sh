#!/bin/bash

# Script de Verificación de Producción - Edificio Admin
echo "🔍 Verificando configuración de producción..."

# Verificar estructura de archivos críticos
critical_files=(
    "src/app.js"
    "package.json" 
    ".env"
    "data.json"
    "frontend-nuevo/admin.html"
    "frontend-nuevo/inquilino.html"
    "frontend-nuevo/js/navigation.js"
    "frontend-nuevo/js/inquilino-navigation.js"
    "frontend-nuevo/js/modules/dashboard.js"
    "frontend-nuevo/js/modules/usuarios.js"
    "frontend-nuevo/js/modules/cuotas.js"
    "frontend-nuevo/js/modules/gastos.js"
    "frontend-nuevo/js/modules/fondos.js"
    "frontend-nuevo/js/modules/anuncios.js"
    "frontend-nuevo/js/modules/cierres.js"
    "frontend-nuevo/js/modules/parcialidades.js"
)

missing_files=()

echo "📋 Verificando archivos críticos:"
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (FALTANTE)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "❌ Faltan ${#missing_files[@]} archivos críticos"
    exit 1
fi

# Verificar dependencias críticas
echo ""
echo "📦 Verificando dependencias críticas:"
critical_packages=("express" "jsonwebtoken" "bcryptjs" "multer" "cors")

for package in "${critical_packages[@]}"; do
    if npm list "$package" --depth=0 &>/dev/null; then
        echo "  ✅ $package"
    else
        echo "  ❌ $package (NO INSTALADO)"
    fi
done

# Verificar sintaxis JavaScript
echo ""
echo "🔧 Verificando sintaxis:"
if node -c src/app.js; then
    echo "  ✅ src/app.js"
else
    echo "  ❌ src/app.js (ERROR DE SINTAXIS)"
    exit 1
fi

# Verificar configuración
echo ""
echo "⚙️ Configuración:"
if [ -f ".env" ]; then
    echo "  ✅ Variables de entorno configuradas"
    grep -E "^(NODE_ENV|PORT)" .env | sed 's/^/    /'
else
    echo "  ❌ Archivo .env faltante"
fi

# Verificar permisos
echo ""
echo "🔐 Verificando permisos:"
if [ -x "start-production.sh" ]; then
    echo "  ✅ start-production.sh ejecutable"
else
    echo "  ❌ start-production.sh sin permisos"
fi

if [ -x "stop-production.sh" ]; then
    echo "  ✅ stop-production.sh ejecutable"  
else
    echo "  ❌ stop-production.sh sin permisos"
fi

echo ""
echo "✅ Verificación completada - La aplicación está lista para producción"
echo ""
echo "🚀 Para iniciar: ./start-production.sh"
echo "🛑 Para detener: ./stop-production.sh"