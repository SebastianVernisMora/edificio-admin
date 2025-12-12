#!/bin/bash

# Script para cambiar el puerto de la aplicación a 3000 y configurar proxy al puerto 80

echo "Cambiando el puerto de la aplicación a 3000 y configurando proxy al puerto 80..."

# Modificar el archivo .env para cambiar el puerto
sed -i 's/PORT=3001/PORT=3000/' /home/admin/edificio-admin/.env

# Detener la aplicación actual
pm2 stop edificio-admin

# Reiniciar la aplicación con el nuevo puerto
pm2 start /home/admin/edificio-admin/src/app.js --name edificio-admin

# Verificar si Apache está usando el puerto 80
if sudo netstat -tulpn | grep ":80" | grep "apache2" > /dev/null; then
    echo "Apache está usando el puerto 80. Deteniendo Apache..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
fi

# Configurar Nginx para hacer proxy al puerto 3000
sudo tee /etc/nginx/sites-available/edificio-admin > /dev/null << EOF
server {
    listen 80;
    server_name ec2-18-223-32-141.us-east-2.compute.amazonaws.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Aumentar el tamaño del hash bucket para nombres de servidor
sudo tee /etc/nginx/conf.d/server_names.conf > /dev/null << EOF
server_names_hash_bucket_size 128;
EOF

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/edificio-admin /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

echo "Configuración completada. La aplicación está disponible en:"
echo "http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/"