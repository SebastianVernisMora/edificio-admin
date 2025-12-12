#!/bin/bash

# Script para configurar el entorno de desarrollo local

# Colores para salidas
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Configurando entorno de desarrollo para EdificioAdmin SaaS...${NC}\n"

# Verificar que wrangler está instalado
if ! command -v wrangler &> /dev/null
then
    echo -e "${RED}Error: wrangler no está instalado.${NC}"
    echo "Instala wrangler con: npm install -g wrangler"
    exit 1
fi

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error instalando dependencias.${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencias instaladas correctamente.${NC}\n"

# Configurar base de datos D1 local
echo -e "${YELLOW}Configurando base de datos D1 local...${NC}"
if [ ! -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/edificio_admin_db.sqlite" ]; then
    mkdir -p .wrangler/state/v3/d1/miniflare-D1DatabaseObject
    
    # Crear archivo SQLite vacío
    echo -e "${YELLOW}Creando archivo SQLite local...${NC}"
    touch .wrangler/state/v3/d1/miniflare-D1DatabaseObject/edificio_admin_db.sqlite
fi

# Crear carpeta migrations si no existe
if [ ! -d "migrations" ]; then
    echo -e "${YELLOW}Creando carpeta migrations...${NC}"
    mkdir -p migrations/seeds
fi

# Aplicar migraciones localmente
echo -e "${YELLOW}Aplicando esquema a la base de datos local...${NC}"
if [ "$(ls -A migrations/*.sql 2>/dev/null)" ]; then
    for file in migrations/*.sql; do
        echo -e "${YELLOW}Aplicando $file...${NC}"
        wrangler d1 execute edificio_admin_db --local --file="$file"
    done
    echo -e "${GREEN}Esquema aplicado correctamente.${NC}"
else
    echo -e "${YELLOW}No hay archivos de migración para aplicar.${NC}"
fi

# Aplicar seeds localmente
echo -e "${YELLOW}Aplicando datos iniciales a la base de datos local...${NC}"
if [ "$(ls -A migrations/seeds/*.sql 2>/dev/null)" ]; then
    for file in migrations/seeds/*.sql; do
        echo -e "${YELLOW}Aplicando $file...${NC}"
        wrangler d1 execute edificio_admin_db --local --file="$file"
    done
    echo -e "${GREEN}Datos iniciales aplicados correctamente.${NC}"
else
    echo -e "${YELLOW}No hay archivos de seed para aplicar.${NC}"
fi

# Verificar archivo .dev.vars
if [ ! -f ".dev.vars" ]; then
    echo -e "${YELLOW}Creando archivo .dev.vars con variables de entorno para desarrollo...${NC}"
    cat > .dev.vars << EOF
# Variables de entorno para desarrollo local

# Configuración general
ENVIRONMENT=development
JWT_SECRET=local_development_jwt_secret_key_change_in_production

# Email (simulado en desarrollo)
EMAIL_FROM=notificaciones@edificio-admin.com
EMAIL_NAME=EdificioAdmin

# Para pruebas y desarrollo
DEBUG=true
EOF
    echo -e "${GREEN}Archivo .dev.vars creado correctamente.${NC}"
else
    echo -e "${GREEN}Archivo .dev.vars ya existe.${NC}"
fi

# Instrucciones finales
echo -e "\n${GREEN}✅ Entorno de desarrollo configurado correctamente!${NC}"
echo -e "Para iniciar el servidor de desarrollo, ejecuta: ${YELLOW}npm run dev${NC}"
echo -e "La aplicación estará disponible en: ${YELLOW}http://localhost:8787${NC}\n"
echo -e "${YELLOW}Nota:${NC} La base de datos local se almacena en .wrangler/state/v3/d1/miniflare-D1DatabaseObject/edificio_admin_db.sqlite"