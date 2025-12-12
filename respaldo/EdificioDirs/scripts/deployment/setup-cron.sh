#!/bin/bash

# Script para configurar la tarea cron que verificará la persistencia DNS

echo "Configurando tarea cron para verificar persistencia DNS..."

# Dar permisos de ejecución a los scripts
chmod +x /home/admin/edificio-admin/check-dns.sh
chmod +x /home/admin/edificio-admin/create-backup-credentials.sh
chmod +x /home/admin/edificio-admin/deploy.sh

# Crear entrada en crontab
(crontab -l 2>/dev/null; echo "*/15 * * * * /home/admin/edificio-admin/check-dns.sh") | crontab -

echo "Tarea cron configurada correctamente."
echo "El script check-dns.sh se ejecutará cada 15 minutos para verificar la persistencia DNS."