#!/bin/bash

echo "Corrigiendo configuración de Nginx..."

# Crear configuración correcta de Nginx (puerto 3000, no 3001)
sudo tee /etc/nginx/sites-available/edificio-admin > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name ec2-18-223-32-141.us-east-2.compute.amazonaws.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Configuración para persistencia DNS
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Caché para mejorar rendimiento
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
    }
    
    # Configuración para archivos estáticos
    location /static/ {
        alias /home/admin/edificio-admin/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Configuración para respaldos
    location /backups/ {
        alias /home/admin/edificio-admin/backups/;
        autoindex on;
        auth_basic "Área Restringida";
        auth_basic_user_file /home/admin/edificio-admin/.htpasswd;
    }
    
    # Configuración para monitoreo de estado
    location /status {
        proxy_pass http://localhost:3000/dns-status;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    
    # Configuración para logs
    access_log /var/log/nginx/edificio-admin-access.log;
    error_log /var/log/nginx/edificio-admin-error.log;
}
NGINX_EOF

# Deshabilitar sitio default y habilitar edificio-admin
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/edificio-admin /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
sudo nginx -t

if [ $? -eq 0 ]; then
    # Reiniciar Nginx
    sudo systemctl reload nginx
    echo "✅ Configuración de Nginx corregida y aplicada."
else
    echo "❌ Error en la configuración de Nginx"
    exit 1
fi
