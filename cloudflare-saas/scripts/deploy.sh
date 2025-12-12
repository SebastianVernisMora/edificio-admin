#!/bin/bash

# Script de despliegue completo para el proyecto EdificioAdmin SaaS

# Colores para salidas
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando despliegue de EdificioAdmin SaaS...${NC}\n"

# Verificar que wrangler está instalado
if ! command -v wrangler &> /dev/null
then
    echo -e "${RED}Error: wrangler no está instalado.${NC}"
    echo "Instala wrangler con: npm install -g wrangler"
    exit 1
fi

# Verificar que estamos logueados en Cloudflare
echo -e "${YELLOW}Verificando autenticación en Cloudflare...${NC}"
if ! wrangler whoami &> /dev/null
then
    echo -e "${RED}No estás logueado en Cloudflare.${NC}"
    echo "Ejecuta 'wrangler login' para autenticarte."
    exit 1
fi
echo -e "${GREEN}Autenticación verificada.${NC}\n"

# Instalación de dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error instalando dependencias.${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencias instaladas correctamente.${NC}\n"

# Crear directorio migrations si no existe
if [ ! -d "migrations" ]; then
    echo -e "${YELLOW}Creando directorio migrations...${NC}"
    mkdir -p migrations/seeds
    echo -e "${GREEN}Directorio migrations creado.${NC}\n"
fi

# Verificar si la base de datos D1 existe y crearla si no
echo -e "${YELLOW}Verificando base de datos D1...${NC}"
if ! wrangler d1 list | grep -q "edificio_admin_db"; then
    echo -e "${YELLOW}Creando base de datos D1 'edificio_admin_db'...${NC}"
    wrangler d1 create edificio_admin_db
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error creando la base de datos.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Base de datos creada correctamente.${NC}\n"
    
    echo -e "${YELLOW}⚠️ Importante: Actualiza el ID de la base de datos en wrangler.toml${NC}"
    echo -e "Ejecuta 'wrangler d1 list' y copia el ID de 'edificio_admin_db'\n"
else
    echo -e "${GREEN}Base de datos 'edificio_admin_db' encontrada.${NC}\n"
fi

# Verificar si el namespace KV existe y crearlo si no
echo -e "${YELLOW}Verificando namespace KV...${NC}"
if ! wrangler kv:namespace list | grep -q "SESSIONS"; then
    echo -e "${YELLOW}Creando namespace KV 'SESSIONS'...${NC}"
    wrangler kv:namespace create SESSIONS
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error creando el namespace KV.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Namespace KV creado correctamente.${NC}\n"
    
    echo -e "${YELLOW}Creando namespace KV 'SESSIONS' para desarrollo...${NC}"
    wrangler kv:namespace create SESSIONS --preview
    
    echo -e "${YELLOW}⚠️ Importante: Actualiza los IDs de KV en wrangler.toml${NC}"
    echo -e "Ejecuta 'wrangler kv:namespace list' y copia los IDs de 'SESSIONS'\n"
else
    echo -e "${GREEN}Namespace KV 'SESSIONS' encontrado.${NC}\n"
fi

# Verificar si el bucket R2 existe y crearlo si no
echo -e "${YELLOW}Verificando bucket R2...${NC}"
if ! wrangler r2 bucket list | grep -q "edificio-admin-uploads"; then
    echo -e "${YELLOW}Creando bucket R2 'edificio-admin-uploads'...${NC}"
    wrangler r2 bucket create edificio-admin-uploads
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error creando el bucket R2.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Bucket R2 creado correctamente.${NC}\n"
else
    echo -e "${GREEN}Bucket R2 'edificio-admin-uploads' encontrado.${NC}\n"
fi

# Aplicar migraciones
echo -e "${YELLOW}Aplicando migraciones...${NC}"
if [ "$(ls -A migrations/*.sql 2>/dev/null)" ]; then
    node scripts/migrate.js
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error aplicando migraciones.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No hay archivos de migración para aplicar.${NC}\n"
fi

# Aplicar seeds (datos iniciales)
echo -e "${YELLOW}Aplicando datos iniciales...${NC}"
if [ "$(ls -A migrations/seeds/*.sql 2>/dev/null)" ]; then
    node scripts/seed.js
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error aplicando seeds.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No hay archivos de seed para aplicar.${NC}\n"
fi

# Publicar el worker
echo -e "${YELLOW}Publicando el worker...${NC}"
wrangler publish
if [ $? -ne 0 ]; then
    echo -e "${RED}Error publicando el worker.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Despliegue completado exitosamente!${NC}"
echo -e "Tu aplicación ahora está disponible en la URL proporcionada por Cloudflare Workers."