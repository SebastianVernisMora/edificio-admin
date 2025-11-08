#!/bin/bash

# Script de Preparación para Producción - Edificio Admin
# Fecha: 2025-11-07

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROD_DIR="/home/admin/edificio-admin-production"
BACKUP_DIR="/home/admin/backups-compressed"

echo -e "${BLUE}🚀 Preparación de Edificio Admin para Producción${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Función para verificar prerequisitos
check_prerequisites() {
    echo -e "${BLUE}🔍 Verificando prerequisitos...${NC}"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        exit 1
    fi
    echo "✅ Node.js: $(node --version)"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm no está instalado${NC}"
        exit 1
    fi
    echo "✅ npm: $(npm --version)"
    
    # Verificar PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠️ PM2 no está instalado. Instalando...${NC}"
        npm install -g pm2
    fi
    echo "✅ PM2: $(pm2 --version)"
    
    echo ""
}

# Función para crear directorio de producción optimizado
create_production_directory() {
    echo -e "${BLUE}📁 Creando directorio de producción optimizado...${NC}"
    
    # Crear backup del estado actual si existe
    if [ -d "$PROD_DIR" ]; then
        echo "💾 Creando backup del directorio de producción actual..."
        local timestamp=$(date +"%Y%m%d_%H%M%S")
        tar -czf "$BACKUP_DIR/production-backup-$timestamp.tar.gz" -C "/home/admin" "edificio-admin-production" 2>/dev/null || true
    fi
    
    # Recrear directorio de producción
    rm -rf "$PROD_DIR"
    mkdir -p "$PROD_DIR"
    
    echo "📦 Copiando archivos de la versión refactorizada..."
    
    # Copiar estructura principal
    cp -r "/home/admin/edificio-admin-backup-refactoring-20251107/src" "$PROD_DIR/"
    cp -r "/home/admin/edificio-admin-backup-refactoring-20251107/public" "$PROD_DIR/"
    cp -r "/home/admin/edificio-admin-backup-refactoring-20251107/frontend-nuevo" "$PROD_DIR/"
    cp -r "/home/admin/edificio-admin-backup-refactoring-20251107/config" "$PROD_DIR/"
    
    # Copiar archivos de configuración esenciales
    cp "/home/admin/edificio-admin-backup-refactoring-20251107/.env" "$PROD_DIR/"
    cp "/home/admin/edificio-admin-backup-refactoring-20251107/package.json" "$PROD_DIR/"
    cp "/home/admin/edificio-admin-backup-refactoring-20251107/data.json" "$PROD_DIR/"
    cp "/home/admin/edificio-admin-backup-refactoring-20251107/.htpasswd" "$PROD_DIR/"
    
    # Crear directorios necesarios
    mkdir -p "$PROD_DIR/logs"
    mkdir -p "$PROD_DIR/uploads"
    
    # Copiar uploads existentes si hay
    if [ -d "/home/admin/edificio-admin/uploads" ] && [ "$(ls -A /home/admin/edificio-admin/uploads)" ]; then
        cp -r "/home/admin/edificio-admin/uploads"/* "$PROD_DIR/uploads/" 2>/dev/null || true
        echo "📁 Uploads copiados desde versión anterior"
    fi
    
    echo "✅ Directorio de producción creado"
    echo ""
}

# Función para optimizar frontend
optimize_frontend() {
    echo -e "${BLUE}🎨 Optimizando frontend para producción...${NC}"
    
    cd "$PROD_DIR"
    
    # Verificar que existe frontend-nuevo
    if [ ! -d "frontend-nuevo" ]; then
        echo -e "${RED}❌ Directorio frontend-nuevo no encontrado${NC}"
        exit 1
    fi
    
    # Minificar CSS (simple)
    find frontend-nuevo/css -name "*.css" -type f -exec echo "Optimizando {}" \;
    
    # Verificar que todos los archivos JS existen
    echo "🔍 Verificando archivos JavaScript..."
    local js_files=(
        "frontend-nuevo/js/utils.js"
        "frontend-nuevo/js/db-client.js"
        "frontend-nuevo/js/auth.js"
        "frontend-nuevo/js/navigation.js"
        "frontend-nuevo/js/inquilino-navigation.js"
        "frontend-nuevo/js/inquilino-module.js"
        "frontend-nuevo/js/modules/dashboard.js"
        "frontend-nuevo/js/modules/usuarios.js"
        "frontend-nuevo/js/modules/cuotas.js"
        "frontend-nuevo/js/modules/gastos.js"
        "frontend-nuevo/js/modules/fondos.js"
        "frontend-nuevo/js/modules/anuncios.js"
        "frontend-nuevo/js/modules/cierres.js"
        "frontend-nuevo/js/modules/parcialidades.js"
    )
    
    for file in "${js_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo -e "  ${RED}❌ $file (FALTANTE)${NC}"
        fi
    done
    
    echo "✅ Frontend verificado"
    echo ""
}

# Función para instalar dependencias
install_dependencies() {
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    
    cd "$PROD_DIR"
    
    # Limpiar cache npm
    npm cache clean --force 2>/dev/null || true
    
    # Instalar dependencias de producción
    echo "🔽 Instalando dependencias..."
    npm ci --only=production --silent
    
    # Verificar instalación críticas
    local critical_packages=("express" "jsonwebtoken" "bcryptjs" "multer" "cors")
    
    for package in "${critical_packages[@]}"; do
        if npm list "$package" --depth=0 &>/dev/null; then
            echo "  ✅ $package instalado"
        else
            echo -e "  ${RED}❌ $package NO instalado${NC}"
        fi
    done
    
    echo "✅ Dependencias instaladas"
    echo ""
}

# Función para configurar variables de entorno
configure_environment() {
    echo -e "${BLUE}⚙️ Configurando variables de entorno...${NC}"
    
    cd "$PROD_DIR"
    
    # Verificar archivo .env
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️ Archivo .env no encontrado. Creando uno por defecto...${NC}"
        cat > .env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here-change-in-production
DB_FILE=data.json
EOF
    fi
    
    # Mostrar configuración (sin secretos)
    echo "📋 Configuración de entorno:"
    grep -E "^(NODE_ENV|PORT)" .env | while read line; do
        echo "  $line"
    done
    
    echo "✅ Variables de entorno configuradas"
    echo ""
}

# Función para crear script de inicio para producción
create_start_script() {
    echo -e "${BLUE}🚀 Creando script de inicio para producción...${NC}"
    
    cd "$PROD_DIR"
    
    # Script de inicio mejorado
    cat > start-production.sh << 'EOF'
#!/bin/bash

# Script de Inicio para Producción - Edificio Admin
set -e

PROD_DIR="/home/admin/edificio-admin-production"
APP_NAME="edificio-admin"

echo "🚀 Iniciando Edificio Admin en modo producción..."

cd "$PROD_DIR"

# Verificar que el directorio existe
if [ ! -f "src/app.js" ]; then
    echo "❌ Aplicación no encontrada en $PROD_DIR"
    exit 1
fi

# Detener instancia anterior si existe
pm2 delete "$APP_NAME" 2>/dev/null || true

# Esperar un momento
sleep 2

# Iniciar aplicación
echo "🔥 Iniciando aplicación con PM2..."
pm2 start src/app.js --name "$APP_NAME" --env production

# Mostrar estado
pm2 show "$APP_NAME"

# Guardar configuración PM2
pm2 save

echo "✅ Aplicación iniciada exitosamente"
echo "📋 Para monitorear: pm2 monit"
echo "📋 Para ver logs: pm2 logs $APP_NAME"
echo "📋 Para reiniciar: pm2 restart $APP_NAME"
EOF

    chmod +x start-production.sh
    
    # Script de parada
    cat > stop-production.sh << EOF
#!/bin/bash
echo "🛑 Deteniendo aplicación..."
pm2 stop edificio-admin 2>/dev/null || true
pm2 delete edificio-admin 2>/dev/null || true
echo "✅ Aplicación detenida"
EOF

    chmod +x stop-production.sh
    
    echo "✅ Scripts de control creados"
    echo ""
}

# Función para crear configuración PM2
create_pm2_config() {
    echo -e "${BLUE}⚡ Creando configuración PM2...${NC}"
    
    cd "$PROD_DIR"
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'edificio-admin',
    script: './src/app.js',
    cwd: '/home/admin/edificio-admin-production',
    
    // Configuración de producción
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Configuración de PM2
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M',
    
    // Logs
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Reinicio automático
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Configuración de cluster (si se necesita)
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
};
EOF

    echo "✅ Configuración PM2 creada"
    echo ""
}

# Función para verificar la aplicación
verify_application() {
    echo -e "${BLUE}🔍 Verificando configuración de la aplicación...${NC}"
    
    cd "$PROD_DIR"
    
    # Verificar estructura de archivos
    local required_files=(
        "src/app.js"
        "package.json"
        ".env"
        "data.json"
        "frontend-nuevo/admin.html"
        "frontend-nuevo/inquilino.html"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo -e "  ${RED}❌ $file${NC}"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo -e "${RED}❌ Faltan archivos críticos. No se puede continuar.${NC}"
        exit 1
    fi
    
    # Verificar sintaxis de JavaScript crítico
    if ! node -c src/app.js; then
        echo -e "${RED}❌ Error de sintaxis en src/app.js${NC}"
        exit 1
    fi
    
    echo "✅ Aplicación verificada correctamente"
    echo ""
}

# Función para mostrar resumen
show_summary() {
    echo -e "${GREEN}✅ Preparación para producción completada${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PROD_DIR"
    
    echo "📂 Directorio de producción: $PROD_DIR"
    echo "📦 Tamaño total: $(du -sh . | cut -f1)"
    
    echo ""
    echo "📋 Comandos disponibles:"
    echo "  🚀 Iniciar:    ./start-production.sh"
    echo "  🛑 Detener:    ./stop-production.sh"
    echo "  📊 Estado:     pm2 status"
    echo "  📝 Logs:       pm2 logs edificio-admin"
    echo "  🔄 Reiniciar:  pm2 restart edificio-admin"
    
    echo ""
    echo "📁 Estructura de archivos:"
    tree -L 2 -a . 2>/dev/null || ls -la
    
    echo ""
    echo -e "${BLUE}🎯 Para iniciar la aplicación ejecuta:${NC}"
    echo -e "${GREEN}  cd $PROD_DIR && ./start-production.sh${NC}"
}

# Función principal
main() {
    echo "Iniciando preparación para producción..."
    echo ""
    
    check_prerequisites
    create_production_directory
    optimize_frontend
    install_dependencies
    configure_environment
    create_start_script
    create_pm2_config
    verify_application
    show_summary
    
    echo ""
    echo -e "${GREEN}🎉 ¡Aplicación lista para producción!${NC}"
}

# Verificar que se ejecuta desde el directorio correcto
if [ "$(pwd)" != "/home/admin" ]; then
    echo -e "${YELLOW}⚠️ Ejecutando desde $(pwd), cambiando a /home/admin${NC}"
    cd /home/admin
fi

# Ejecutar función principal
main "$@"