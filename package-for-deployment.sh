#!/bin/bash

# Script para empaquetar el proyecto para su despliegue
# Este script crea un archivo ZIP con todos los archivos necesarios

echo "Empaquetando Edificio-Admin para despliegue..."

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
PACKAGE_NAME="edificio-admin-$(date +%Y%m%d).zip"

# Copiar archivos al directorio temporal
echo "Copiando archivos..."
cp -r /home/admin/edificio-admin/* $TEMP_DIR/
cp /home/admin/edificio-admin/.env $TEMP_DIR/

# Eliminar archivos y directorios innecesarios
echo "Limpiando archivos innecesarios..."
rm -rf $TEMP_DIR/node_modules
rm -rf $TEMP_DIR/backups
rm -f $TEMP_DIR/*.log
rm -f $TEMP_DIR/*.tmp

# Crear archivo ZIP
echo "Creando archivo ZIP..."
cd $TEMP_DIR
zip -r $PACKAGE_NAME *
mv $PACKAGE_NAME /home/admin/

# Limpiar
echo "Limpiando archivos temporales..."
rm -rf $TEMP_DIR

echo "Empaquetado completado: /home/admin/$PACKAGE_NAME"
echo ""
echo "Para desplegar en un nuevo servidor:"
echo "1. Descomprima el archivo ZIP"
echo "2. Ejecute: npm install"
echo "3. Ejecute: ./deploy.sh"
echo "4. Ejecute: ./setup-cron.sh"
echo "5. Ejecute: ./create-backup-credentials.sh"