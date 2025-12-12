#!/bin/bash

# Script para configurar Nginx en producción
# Edificio Admin - Puerto 80 con proxy a 3000

set -e

echo "🔧 CONFIGURANDO NGINX PARA PRODUCCIÓN"
echo "======================================"

# Verificar que PM2 esté ejecutándose
echo "📊 Verificando estado de PM2..."
pm2 status

# Detener nginx si está corriendo
echo "🛑 Deteniendo nginx..."
sudo systemctl stop nginx 2>/dev/null || echo "nginx ya estaba detenido"

# Verificar sintaxis de nginx
echo "✅ Verificando configuración de nginx..."
sudo nginx -t

# Crear configuración optimizada para edificio-admin
echo "📝 Creando configuración de nginx..."
sudo tee /etc/nginx/sites-available/edificio-admin > /dev/null <<'EOF'
server {
    listen 80;
    server_name localhost;

    # Configuración de logs
    access_log /var/log/nginx/edificio-admin.access.log;
    error_log /var/log/nginx/edificio-admin.error.log;

    # Configuración de proxy para la aplicación Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuración para archivos estáticos
    location /static/ {
        alias /home/admin/edificio-admin/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración para uploads
    location /uploads/ {
        alias /home/admin/edificio-admin/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Configuración de compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;

    # Límites de tamaño de archivo
    client_max_body_size 10M;
}
EOF

# Habilitar el sitio
echo "🔗 Habilitando sitio..."
sudo ln -sf /etc/nginx/sites-available/edificio-admin /etc/nginx/sites-enabled/

# Deshabilitar sitio default si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
echo "✅ Verificando nueva configuración..."
sudo nginx -t

# Reiniciar nginx
echo "🚀 Iniciando nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Verificar que nginx esté ejecutándose
echo "📊 Verificando estado de nginx..."
sudo systemctl status nginx --no-pager

# Verificar puertos
echo "🔍 Verificando puertos en uso..."
ss -tlnp | grep -E ":(80|3000)" || echo "Información de puertos no disponible"

# Verificar PM2
echo "📊 Estado final de PM2..."
pm2 status

echo ""
echo "✅ NGINX CONFIGURADO EXITOSAMENTE"
echo "=================================="
echo "🌐 Aplicación disponible en:"
echo "   - http://localhost (puerto 80)"
echo "   - Proxy a Node.js en puerto 3000"
echo ""
echo "📁 Archivos de configuración:"
echo "   - /etc/nginx/sites-available/edificio-admin"
echo "   - Logs en /var/log/nginx/"
echo ""
echo "🔧 Comandos útiles:"
echo "   sudo systemctl restart nginx"
echo "   sudo nginx -t"
echo "   pm2 restart edificio-admin"