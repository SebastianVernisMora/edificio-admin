#!/bin/bash

# Script para generar credenciales para acceso a respaldos
# Esto creará un archivo .htpasswd para proteger el directorio de respaldos

echo "Generando credenciales para acceso a respaldos..."

# Instalar htpasswd si no está disponible
if ! command -v htpasswd &> /dev/null; then
    echo "Instalando apache2-utils para htpasswd..."
    sudo apt-get install -y apache2-utils
fi

# Solicitar credenciales
read -p "Ingrese nombre de usuario para acceso a respaldos: " USERNAME
htpasswd -c /home/admin/edificio-admin/.htpasswd $USERNAME

echo "Credenciales generadas correctamente."
echo "Asegúrese de que Nginx tenga permisos para leer el archivo .htpasswd"
sudo chmod 644 /home/admin/edificio-admin/.htpasswd