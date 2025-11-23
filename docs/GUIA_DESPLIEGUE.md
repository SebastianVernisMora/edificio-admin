# Guía de Despliegue - Edificio Admin

**Versión:** 2.0  
**Última actualización:** 2025-11-23  
**Servidor:** EC2 AWS (ec2-18-223-32-141.us-east-2.compute.amazonaws.com)

---

## 🎯 Checklist Rápido de Despliegue (Con PM2)

```bash
# 1. Verificar estado actual
pm2 status
cat /etc/nginx/sites-enabled/edificio-admin

# 2. Actualizar código
cd /home/admin
git pull origin master

# 3. Instalar dependencias (si hay cambios)
npm install

# 4. Reiniciar servidor
pm2 restart edificio-admin

# 5. Verificar
pm2 logs edificio-admin --lines 50

# 6. Guardar configuración
pm2 save
```

---

## 📋 Requisitos del Sistema

### Software Instalado ✅
```yaml
Sistema Operativo: Ubuntu Linux (EC2)
Node.js: v18+ ✅
npm: Latest ✅
Nginx: Instalado y configurado ✅
Git: Configurado ✅
```

### Puertos Requeridos
```yaml
3000: Node.js Express App (interno)
80: Nginx (público)
443: HTTPS (futuro)
```

### Recursos Mínimos
```yaml
RAM: 1GB (actual: 7.6GB disponible) ✅
Disco: 5GB (actual: 184GB disponible) ✅
CPU: 1 core (actual: 2 cores) ✅
```

---

## 🚀 Métodos de Despliegue

### Método 1: Despliegue Manual con PM2 (Recomendado)

#### Paso a Paso
```bash
# 1. Conectarse al servidor
ssh admin@ec2-18-223-32-141.us-east-2.compute.amazonaws.com

# 2. Navegar al directorio
cd /home/admin

# 3. Actualizar código
git pull origin master

# 4. Instalar dependencias (si hubo cambios)
npm install

# 5. Reiniciar servidor con PM2
pm2 restart edificio-admin

# 6. Verificar logs
pm2 logs edificio-admin --lines 30 --nostream

# 7. Verificar estado
pm2 status

# 8. Guardar configuración (importante)
pm2 save
```

#### Primera Vez (Si PM2 no está configurado)
```bash
# Iniciar con PM2
pm2 start src/app.js --name edificio-admin

# Guardar configuración
pm2 save

# Configurar inicio automático (opcional)
pm2 startup
# Ejecutar el comando que PM2 sugiera
```

#### Verificación
```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs edificio-admin

# Monitoreo
pm2 monit

# Info detallada
pm2 info edificio-admin

# Test externo (desde navegador)
# http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
```

---

### Método 2: GitHub Actions (Automático)

#### Configuración Actual
```yaml
Workflow: .github/workflows/deploy.yml
Trigger: Push a branch master
Estado: Configurado ✅
```

#### Secrets Requeridos (GitHub Repository Settings)
```bash
HOST: ec2-18-223-32-141.us-east-2.compute.amazonaws.com
USERNAME: admin
PRIVATE_KEY: [SSH private key del servidor]
```

#### Cómo Verificar Secrets
1. Ve a: `https://github.com/SebastianVernisMora/edificio-admin/settings/secrets/actions`
2. Verifica que existan: `HOST`, `USERNAME`, `PRIVATE_KEY`
3. Si faltan, agrégarlos

#### Flujo de Despliegue Automático
```yaml
1. Developer hace push a master
2. GitHub Actions detecta el push
3. Workflow se ejecuta:
   - Checkout código
   - Setup Node.js 18
   - npm install
   - SSH al servidor
   - git pull en servidor
   - npm install en servidor
   - pkill servidor anterior
   - nohup npm run dev en background
4. Despliegue completado
```

#### Ver Logs de GitHub Actions
```bash
# Desde web:
https://github.com/SebastianVernisMora/edificio-admin/actions

# Verificar último despliegue
gh run list --limit 5
gh run view [run-id]
```

---

### Método 3: Scripts de Despliegue (Productivo)

#### Script Completo
```bash
# Usar script de redeploy existente
cd /home/admin/scripts/deployment
./redeploy.sh
```

#### O Script Manual Mejorado
```bash
#!/bin/bash
# deploy-complete.sh

set -e  # Exit on error

echo "🚀 Iniciando despliegue de Edificio Admin..."

# 1. Backup de datos
echo "📦 Creando backup..."
cp data.json "backups/data-backup-$(date +%Y%m%d-%H%M%S).json"

# 2. Detener servidor
echo "🛑 Deteniendo servidor..."
pkill -f "node.*app" || echo "No hay servidor corriendo"
sleep 2

# 3. Actualizar código
echo "📥 Actualizando código..."
git pull origin master

# 4. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# 5. Verificar archivos críticos
echo "🔍 Verificando archivos..."
test -f .env || { echo "❌ Falta archivo .env"; exit 1; }
test -f data.json || { echo "❌ Falta archivo data.json"; exit 1; }

# 6. Iniciar servidor
echo "🟢 Iniciando servidor..."
nohup npm run dev > server.log 2>&1 &
echo $! > app.pid

# 7. Esperar inicio
echo "⏳ Esperando inicio del servidor..."
sleep 5

# 8. Verificar
echo "✅ Verificando funcionamiento..."
if ps -p $(cat app.pid) > /dev/null; then
    echo "✅ Servidor corriendo (PID: $(cat app.pid))"
else
    echo "❌ Error: Servidor no inició correctamente"
    tail -20 server.log
    exit 1
fi

# 9. Test HTTP
echo "🌐 Probando endpoint..."
node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(d=>console.log('✅ API respondiendo:',d)).catch(e=>console.error('❌ Error:',e.message))"

echo "✅ Despliegue completado exitosamente"
echo "📊 Ver logs: tail -f server.log"
```

---

## 🔧 Configuración de Nginx

### Archivo Actual: `/etc/nginx/sites-enabled/edificio-admin`
```nginx
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Comandos Nginx Útiles
```bash
# Verificar configuración
nginx -t

# Recargar configuración (sin downtime)
service nginx reload

# Reiniciar completamente
service nginx restart

# Ver status
service nginx status

# Ver logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Variables de Entorno

### Archivo: `/home/admin/.env`
```bash
PORT=3000
JWT_SECRET=edificio205_secret_key_2025
NODE_ENV=production  # ⚠️ Cambiar de development
```

### Verificar Variables
```bash
# Ver archivo
cat .env

# Verificar en runtime
node -e "require('dotenv').config(); console.log(process.env.PORT, process.env.NODE_ENV)"
```

---

## 🧪 Testing Post-Despliegue

### Tests Automáticos
```bash
# Suite completa
npm test

# Tests específicos
npm run test:api        # Endpoints API
npm run test:security   # Seguridad
npm run test:permisos   # Roles y permisos
npm run test:frontend   # Integración frontend
```

### Tests Manuales
```bash
# 1. Health check
node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(console.log)"

# 2. Login admin
node tests/scripts/test-login.js

# 3. Verificar frontend
# Abrir en navegador: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
```

### Checklist de Verificación Manual
- [ ] Panel admin carga correctamente
- [ ] Login con admin@edificio205.com funciona
- [ ] Dashboard muestra estadísticas
- [ ] Panel inquilino accesible
- [ ] API responde correctamente
- [ ] Upload de archivos funciona
- [ ] No hay errores en console del navegador

---

## 📊 Monitoreo y Logs

### Ver Logs de Aplicación
```bash
# Logs en tiempo real
tail -f server.log

# Últimas 100 líneas
tail -100 server.log

# Buscar errores
grep -i error server.log | tail -20

# Logs de auditoría
ls -lh logs/audit/
```

### Monitorear Proceso
```bash
# Verificar que corre
ps aux | grep "node.*app" | grep -v grep

# Ver PID guardado
cat app.pid

# Recursos del proceso
top -p $(cat app.pid)

# Memoria usada
ps -p $(cat app.pid) -o pid,vsz,rss,%mem,cmd
```

### Verificar Puerto
```bash
# Método 1 (si lsof instalado)
lsof -i :3000

# Método 2 (netstat)
netstat -tlnp | grep 3000

# Método 3 (ss)
ss -tlnp | grep 3000
```

---

## 🔄 Rollback (Revertir Despliegue)

### Rollback Rápido
```bash
# 1. Detener servidor actual
pkill -f "node.*app"

# 2. Revertir código
git log --oneline -5  # Ver commits
git reset --hard <commit-hash-anterior>

# 3. Restaurar base de datos
cp backups/data-backup-[fecha].json data.json

# 4. Reinstalar dependencias (si necesario)
npm install

# 5. Reiniciar servidor
nohup npm run dev > server.log 2>&1 &
```

### Rollback con Git
```bash
# Ver historial
git log --oneline -10

# Revertir último commit (mantiene cambios)
git revert HEAD

# O volver a commit específico (destructivo)
git reset --hard 29e172f1

# Forzar en remoto (CUIDADO)
git push origin master --force
```

---

## 🚨 Troubleshooting

### Problema: Servidor no inicia

**Síntomas:**
```bash
npm run dev
# Error: Puerto 3000 ya en uso
```

**Solución:**
```bash
# Encontrar y matar proceso
pkill -f "node.*app"
# O más agresivo
killall node

# Reintentar
npm run dev
```

---

### Problema: Error de permisos

**Síntomas:**
```bash
Error: EACCES: permission denied
```

**Solución:**
```bash
# Verificar owner de archivos
ls -la

# Cambiar ownership si necesario
sudo chown -R admin:admin /home/admin

# Verificar permisos de data.json
chmod 644 data.json
```

---

### Problema: Nginx devuelve 502 Bad Gateway

**Síntomas:**
- Navegador muestra "502 Bad Gateway"
- Nginx logs: "connect() failed (111: Connection refused)"

**Diagnóstico:**
```bash
# 1. Verificar que Node.js corre
ps aux | grep node

# 2. Verificar que puerto 3000 escucha
netstat -tlnp | grep 3000

# 3. Ver logs de Node
tail -20 server.log
```

**Solución:**
```bash
# Reiniciar Node.js
pkill -f "node.*app"
nohup npm run dev > server.log 2>&1 &

# Si persiste, reiniciar Nginx
service nginx restart
```

---

### Problema: Base de datos corrupta

**Síntomas:**
```bash
Error: Unexpected token in JSON at position...
```

**Solución:**
```bash
# 1. Verificar integridad
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'))"

# 2. Si falla, restaurar backup
cp data.json data.json.corrupted
cp backups/data-backup-[ultima-fecha].json data.json

# 3. Reiniciar servidor
pkill -f "node.*app"
npm run dev
```

---

## 📅 Mantenimiento Programado

### Tareas Diarias
- [ ] Verificar que servidor corre: `ps aux | grep node`
- [ ] Revisar logs por errores: `grep -i error server.log | tail -20`
- [ ] Verificar uso de disco: `df -h`

### Tareas Semanales
- [ ] Crear backup manual: `cp data.json backups/data-backup-$(date +%Y%m%d).json`
- [ ] Ejecutar suite de tests: `npm test`
- [ ] Revisar logs de Nginx: `tail -100 /var/log/nginx/error.log`
- [ ] Limpiar logs antiguos: `find logs/ -name "*.log" -mtime +30 -delete`

### Tareas Mensuales
- [ ] Actualizar dependencias: `npm audit fix && npm update`
- [ ] Rotar backups viejos: `find backups/ -name "*.json" -mtime +90 -delete`
- [ ] Revisar uso de recursos: `top`, `free -h`
- [ ] Verificar certificados SSL (cuando se implemente HTTPS)

---

## 🔮 Mejoras Futuras Recomendadas

### Corto Plazo (1-2 semanas)
1. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name edificio-admin
   pm2 save
   pm2 startup
   ```

2. **Backups automáticos**
   ```bash
   # Agregar a crontab
   0 2 * * * cd /home/admin && node scripts/backupData.js
   ```

3. **Monitoreo con health checks**
   ```bash
   # Script de health check cada 5 minutos
   */5 * * * * curl -sf http://localhost:3000/api/health || /home/admin/scripts/restart-app.sh
   ```

### Medio Plazo (1 mes)
1. **HTTPS con Let's Encrypt**
2. **Dominio personalizado**
3. **Rate limiting en Nginx**
4. **Logging estructurado (Winston)**
5. **Alertas por email/SMS**

### Largo Plazo (3 meses)
1. **Docker containerization**
2. **Load balancer**
3. **Database redundancy**
4. **CI/CD completo con tests automáticos**
5. **Monitoring dashboard (Grafana)**

---

## 📞 Contactos y Recursos

### Repositorio
```
GitHub: https://github.com/SebastianVernisMora/edificio-admin
```

### Servidor
```
Host: ec2-18-223-32-141.us-east-2.compute.amazonaws.com
Usuario: admin
Puerto SSH: 22
```

### Documentación
```
Estado: /home/admin/docs/ESTADO_PROYECTO.md
Estándares: /home/admin/BLACKBOX.md
Guía desarrollo: /home/admin/CRUSH.md
```

---

**✅ Checklist Final de Despliegue**

Antes de considerar el despliegue exitoso:

- [ ] Servidor Node.js corriendo en puerto 3000
- [ ] Nginx activo y proxying correctamente
- [ ] data.json respaldado
- [ ] Tests principales pasando
- [ ] Login admin funcional
- [ ] Panel inquilino accesible
- [ ] API respondiendo correctamente
- [ ] No hay errores críticos en logs
- [ ] Monitoreo básico implementado
- [ ] Documentación actualizada

---

**Última actualización:** 2025-11-23  
**Mantenedor:** DevOps Team  
**Próxima revisión:** 2025-12-23
