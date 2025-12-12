#!/bin/bash

# Script de despliegue para Edificio-Admin en EC2
# Este script configura la aplicación y la despliega con persistencia DNS

echo "Iniciando despliegue de Edificio-Admin..."

# Actualizar paquetes del sistema
echo "Actualizando paquetes del sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Node.js y npm si no están instalados
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js y npm..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Instalar PM2 para gestionar el proceso de Node.js
echo "Instalando PM2..."
sudo npm install -g pm2

# Instalar dependencias del proyecto
echo "Instalando dependencias del proyecto..."
npm install

# Configurar variables de entorno
echo "Configurando variables de entorno..."
if [ ! -f .env ]; then
    echo "PORT=3001" > .env
    echo "JWT_SECRET=edificio205_secret_key_2025" >> .env
    echo "NODE_ENV=production" >> .env
fi

# Configurar Nginx como proxy inverso
echo "Configurando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
fi

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

# Iniciar la aplicación con PM2
echo "Iniciando la aplicación con PM2..."
pm2 start src/app.js --name edificio-admin

# Configurar PM2 para iniciar en el arranque
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save

echo "¡Despliegue completado!"
echo "La aplicación está disponible en: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/"