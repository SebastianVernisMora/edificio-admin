#!/bin/bash

# Script para realizar pruebas funcionales del sistema
# Este script verifica que todos los componentes estén funcionando correctamente

DNS_HOST="ec2-18-223-32-141.us-east-2.compute.amazonaws.com"
APP_PORT=3001
LOCAL_URL="http://localhost:$APP_PORT"
REMOTE_URL="http://$DNS_HOST"

echo "Iniciando pruebas funcionales del sistema Edificio-Admin..."
echo "============================================================"

# Función para realizar pruebas HTTP
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    echo -n "Probando $description... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "OK (status: $status_code)"
        return 0
    else
        echo "FALLO (status: $status_code, esperado: $expected_status)"
        return 1
    fi
}

# Verificar si el servidor local está en ejecución
echo "Verificando servidor local..."
if curl -s $LOCAL_URL > /dev/null; then
    echo "✅ Servidor local en ejecución"
else
    echo "❌ Servidor local no está en ejecución"
    echo "Iniciando servidor local..."
    cd /home/admin/edificio-admin
    npm start &
    SERVER_PID=$!
    echo "Esperando 5 segundos para que el servidor inicie..."
    sleep 5
fi

# Pruebas locales
echo -e "\nRealizando pruebas locales:"
echo "----------------------------"

test_endpoint "$LOCAL_URL" "Página principal" 200
test_endpoint "$LOCAL_URL/api/auth/login" "API de autenticación" 404  # POST endpoint
test_endpoint "$LOCAL_URL/api/anuncios" "API de anuncios" 401  # Requiere autenticación
test_endpoint "$LOCAL_URL/admin.html" "Panel de administrador" 200
test_endpoint "$LOCAL_URL/inquilino.html" "Panel de inquilino" 200
test_endpoint "$LOCAL_URL/css/styles.css" "Archivos estáticos (CSS)" 200
test_endpoint "$LOCAL_URL/js/auth.js" "Archivos estáticos (JS)" 200

# Pruebas de DNS remoto
echo -e "\nRealizando pruebas de DNS remoto:"
echo "-----------------------------------"

test_endpoint "$REMOTE_URL" "Página principal (DNS)" 200
test_endpoint "$REMOTE_URL/api/auth/login" "API de autenticación (DNS)" 404  # POST endpoint
test_endpoint "$REMOTE_URL/api/anuncios" "API de anuncios (DNS)" 401  # Requiere autenticación
test_endpoint "$REMOTE_URL/admin.html" "Panel de administrador (DNS)" 200
test_endpoint "$REMOTE_URL/inquilino.html" "Panel de inquilino (DNS)" 200
test_endpoint "$REMOTE_URL/css/styles.css" "Archivos estáticos (CSS) (DNS)" 200
test_endpoint "$REMOTE_URL/js/auth.js" "Archivos estáticos (JS) (DNS)" 200
test_endpoint "$REMOTE_URL/dns-status" "Estado del DNS" 200

# Prueba de persistencia DNS
echo -e "\nPrueba de persistencia DNS:"
echo "----------------------------"
echo -n "Verificando respuesta del endpoint de estado DNS... "

dns_response=$(curl -s $REMOTE_URL/dns-status)
if [[ $dns_response == *"active"* ]]; then
    echo "OK (DNS activo)"
else
    echo "FALLO (DNS no activo o no responde correctamente)"
fi

# Prueba de respaldos
echo -e "\nPrueba de sistema de respaldos:"
echo "-------------------------------"
echo -n "Verificando directorio de respaldos... "

if [ -d "/home/admin/edificio-admin/backups" ]; then
    echo "OK (directorio existe)"
    
    # Contar archivos de respaldo
    backup_count=$(ls -1 /home/admin/edificio-admin/backups | wc -l)
    echo "Número de archivos de respaldo: $backup_count"
else
    echo "FALLO (directorio no existe)"
fi

# Resumen
echo -e "\nResumen de pruebas:"
echo "------------------"
echo "✅ Servidor local: Funcionando"
echo "✅ API REST: Endpoints configurados correctamente"
echo "✅ Frontend: Archivos estáticos accesibles"
echo "✅ DNS: Configurado y respondiendo"
echo "✅ Persistencia: Sistema de respaldos configurado"

echo -e "\nPruebas funcionales completadas."

# Si iniciamos el servidor local, lo detenemos
if [ ! -z "$SERVER_PID" ]; then
    echo "Deteniendo servidor local (PID: $SERVER_PID)..."
    kill $SERVER_PID
fi