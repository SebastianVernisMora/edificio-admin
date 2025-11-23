#!/bin/bash

# Script para configurar acceso directo al puerto 3001

echo "Configurando acceso directo al puerto 3001..."

# Verificar si el puerto 3001 está abierto en el firewall
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT

# Crear un archivo de configuración para el acceso directo
cat > /home/admin/edificio-admin/direct-access.md << EOF
# Acceso Directo a Edificio-Admin

Debido a restricciones en la configuración del servidor, la aplicación está disponible directamente en el puerto 3001:

http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com:3001/

## Credenciales de Acceso

### Administrador
- **Email**: admin@edificio205.com
- **Password**: admin2025

### Inquilinos
- **Email**: [nombre]@edificio205.com (ej: inquilino1@edificio205.com)
- **Password**: inquilino2025 (universal para todos los inquilinos)

## Respaldos

Los respaldos se realizan automáticamente cada hora y se almacenan en el directorio /home/admin/edificio-admin/backups/
EOF

echo "Configuración completada. La aplicación está disponible en:"
echo "http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com:3001/"