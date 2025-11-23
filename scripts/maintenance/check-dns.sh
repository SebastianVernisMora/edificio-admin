#!/bin/bash

# Script para verificar y mantener la persistencia DNS
# Este script debe ejecutarse periódicamente mediante cron

DNS_HOST="ec2-18-223-32-141.us-east-2.compute.amazonaws.com"
APP_PORT=3001
LOG_FILE="/home/admin/edificio-admin/dns-check.log"

echo "$(date): Verificando persistencia DNS..." >> $LOG_FILE

# Verificar si el servidor está respondiendo
if curl -s "http://$DNS_HOST/status" > /dev/null; then
    echo "$(date): DNS activo y funcionando correctamente." >> $LOG_FILE
else
    echo "$(date): ¡ALERTA! El servidor no está respondiendo." >> $LOG_FILE
    
    # Verificar si el proceso de Node.js está en ejecución
    if pm2 show edificio-admin | grep -q "online"; then
        echo "$(date): La aplicación está en ejecución, pero no responde. Reiniciando..." >> $LOG_FILE
        pm2 restart edificio-admin
    else
        echo "$(date): La aplicación no está en ejecución. Iniciando..." >> $LOG_FILE
        cd /home/admin/edificio-admin
        pm2 start src/app.js --name edificio-admin
    fi
    
    # Verificar si Nginx está en ejecución
    if systemctl is-active --quiet nginx; then
        echo "$(date): Nginx está en ejecución. Reiniciando..." >> $LOG_FILE
        sudo systemctl restart nginx
    else
        echo "$(date): Nginx no está en ejecución. Iniciando..." >> $LOG_FILE
        sudo systemctl start nginx
    fi
    
    # Verificar nuevamente después de los reinicios
    sleep 10
    if curl -s "http://$DNS_HOST/status" > /dev/null; then
        echo "$(date): Servicio restaurado correctamente." >> $LOG_FILE
    else
        echo "$(date): ¡ALERTA CRÍTICA! El servicio sigue sin responder después de los reinicios." >> $LOG_FILE
        # Aquí se podría agregar código para enviar una notificación por correo o SMS
    fi
fi

# Mantener solo las últimas 100 líneas del archivo de log
tail -n 100 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE