#!/bin/bash

# Script para corregir la configuración de Nginx

echo "Corrigiendo configuración de Nginx..."

# Aumentar el tamaño del hash bucket para nombres de servidor
sudo tee /etc/nginx/conf.d/server_names.conf > /dev/null << EOF
server_names_hash_bucket_size 128;
EOF

# Crear configuración de Nginx para la aplicación
sudo tee /etc/nginx/sites-available/edificio-admin > /dev/null << EOF
server {
    listen 80;
    server_name ec2-18-223-32-141.us-east-2.compute.amazonaws.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/edificio-admin /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

echo "Configuración de Nginx corregida."