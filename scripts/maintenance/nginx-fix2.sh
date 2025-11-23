#!/bin/bash

# Script para corregir la configuración de Nginx usando otro puerto

echo "Corrigiendo configuración de Nginx para usar el puerto 8080..."

# Crear configuración de Nginx para la aplicación
sudo tee /etc/nginx/sites-available/edificio-admin > /dev/null << EOF
server {
    listen 8080;
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

echo "Configuración de Nginx corregida. La aplicación estará disponible en el puerto 8080."