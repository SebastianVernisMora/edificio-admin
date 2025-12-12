# 📘 GUÍA DE DESPLIEGUE COMPLETA - Edificio Admin

**Versión:** 2.0  
**Fecha:** 23 de Noviembre 2025  
**Sistema:** Optimizado y Listo para Producción

---

## 🎯 ÍNDICE

1. [Scripts Disponibles](#scripts-disponibles)
2. [Despliegue Inicial](#despliegue-inicial)
3. [Actualización](#actualización)
4. [Rollback](#rollback)
5. [Monitoreo](#monitoreo)
6. [Troubleshooting](#troubleshooting)

---

## 📜 SCRIPTS DISPONIBLES

### Ubicación
```
scripts/deployment/
├── deploy-full.sh      # Despliegue completo con verificaciones
├── quick-deploy.sh     # Despliegue rápido
├── update.sh           # Actualización incremental
├── rollback.sh         # Rollback a backup anterior
├── health-check.sh     # Verificación de salud
└── monitor.sh          # Monitoreo en tiempo real
```

### Descripción de Scripts

#### 1. `deploy-full.sh` ⭐ PRINCIPAL
**Uso:** Despliegue completo desde cero

**Ejecuta:**
1. ✅ Pre-deployment checks (Node.js, PM2, disk space)
2. ✅ Backup automático (pre-deploy)
3. ✅ Git status verification
4. ✅ Dependencies installation
5. ✅ Frontend build (optimized)
6. ✅ Test suite execution
7. ✅ Database verification
8. ✅ PM2 deployment
9. ✅ Health checks
10. ✅ Deployment report generation

**Tiempo:** ~2-3 minutos  
**Rollback automático:** ✅ Si falla

```bash
./scripts/deployment/deploy-full.sh
```

#### 2. `quick-deploy.sh` ⚡ RÁPIDO
**Uso:** Despliegue rápido sin verificaciones

**Ejecuta:**
1. Build frontend
2. Restart PM2
3. Verify status

**Tiempo:** ~10 segundos  
**Ideal para:** Desarrollo y cambios menores

```bash
./scripts/deployment/quick-deploy.sh
```

#### 3. `update.sh` 🔄 ACTUALIZACIÓN
**Uso:** Actualización desde git

**Ejecuta:**
1. Git pull
2. Install dependencies (si cambió package.json)
3. Rebuild (si cambió src-optimized/)
4. PM2 restart

**Tiempo:** ~30 segundos  
**Ideal para:** Updates desde repositorio

```bash
./scripts/deployment/update.sh
```

#### 4. `rollback.sh` ⏮️ ROLLBACK
**Uso:** Revertir a backup anterior

**Ejecuta:**
1. Lista backups disponibles
2. Backup del estado actual
3. Restaura backup seleccionado
4. Reinstala dependencias
5. Rebuild frontend
6. PM2 restart

**Tiempo:** ~1-2 minutos  
**Seguridad:** Hace backup antes de revertir

```bash
./scripts/deployment/rollback.sh
```

#### 5. `health-check.sh` 🏥 HEALTH CHECK
**Uso:** Verificar salud del sistema

**Verifica:**
- ✅ Node.js y PM2 instalados
- ✅ Disk space y memory
- ✅ PM2 process status
- ✅ Port 3000 listening
- ✅ HTTP response
- ✅ Critical files
- ✅ Database integrity
- ✅ API endpoints
- ✅ Recent errors in logs

**Exit code:** 0 = OK, 1 = Errors

```bash
./scripts/deployment/health-check.sh
```

#### 6. `monitor.sh` 📊 MONITORING
**Uso:** Monitoreo en tiempo real (dashboard)

**Muestra:**
- PM2 status (PID, uptime, restarts)
- System resources (CPU, Memory, Disk)
- Network status
- Database stats
- Recent errors
- Auto-refresh cada 5s

```bash
./scripts/deployment/monitor.sh
```

---

## 🚀 DESPLIEGUE INICIAL

### Primer Despliegue (Fresh Install)

#### Paso 1: Clonar repositorio
```bash
cd /home/sebastianvernis
git clone https://github.com/SebastianVernisMora/edificio-admin.git
cd edificio-admin
```

#### Paso 2: Configurar ambiente
```bash
# Copiar .env
cp .env.example .env

# Editar variables
nano .env
```

**Variables importantes:**
```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

#### Paso 3: Instalar PM2 (si no está instalado)
```bash
npm install -g pm2
pm2 startup
```

#### Paso 4: Ejecutar despliegue completo
```bash
./scripts/deployment/deploy-full.sh
```

**Output esperado:**
```
═══════════════════════════════════════════════════════════
  1. PRE-DEPLOYMENT CHECKS
═══════════════════════════════════════════════════════════

✓ Node.js version: v25.1.0
✓ PM2 installed: 5.x.x
✓ Disk space: 15000MB available

═══════════════════════════════════════════════════════════
  2. CREATING BACKUP
═══════════════════════════════════════════════════════════

✓ Backup created: pre-deploy-20251123-120000.tar.gz (2.5M)

[... más output ...]

╔════════════════════════════════════════════════════════════╗
║                   DEPLOYMENT SUCCESSFUL                    ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
  • Application: edificio-admin
  • Status: online
  • PID: 12345
  • Memory: 28MB
  • Port: 3000
  • Build Size: 108K
  
🌐 Access URLs:
  • Admin Panel: http://localhost:3000/admin.html
  • Optimized:   http://localhost:3000/admin-optimized.html
  • Inquilino:   http://localhost:3000/inquilino.html
```

#### Paso 5: Verificar salud
```bash
./scripts/deployment/health-check.sh
```

---

## 🔄 ACTUALIZACIÓN

### Actualización desde Git

```bash
# Opción 1: Script automático
./scripts/deployment/update.sh

# Opción 2: Manual
git pull
npm install
npm run build
pm2 restart edificio-admin
```

### Actualización Solo Frontend

```bash
# Rebuild frontend
npm run build

# Reiniciar (para servir nuevos archivos)
pm2 restart edificio-admin
```

### Actualización Solo Backend

```bash
# Sin rebuild, solo restart
pm2 restart edificio-admin
```

---

## ⏮️ ROLLBACK

### Rollback Interactivo

```bash
./scripts/deployment/rollback.sh
```

**Proceso:**
1. Muestra últimos 10 backups
2. Seleccionas el número
3. Confirmas la acción
4. Hace backup del estado actual
5. Restaura el backup seleccionado
6. Reinicia la aplicación

**Ejemplo de uso:**
```
📦 Available backups:

1. pre-deploy-20251123-150000.tar.gz (2.5M)
2. pre-deploy-20251123-120000.tar.gz (2.4M)
3. pre-rollback-20251122-180000.tar.gz (2.4M)

Select backup number to restore (or 'q' to quit): 1

Selected backup: pre-deploy-20251123-150000.tar.gz

⚠️  This will restore the application to the state of the selected backup
⚠️  Current state will be lost (but backed up first)

Continue? (yes/no): yes

[... proceso de rollback ...]

╔════════════════════════════════════════════════════════════╗
║                   ROLLBACK SUCCESSFUL                      ║
╚════════════════════════════════════════════════════════════╝
```

### Rollback Manual

```bash
# 1. Parar aplicación
pm2 stop edificio-admin

# 2. Restaurar backup
cd /home/sebastianvernis/Proyecto-EdificioActual
tar -xzf backups/deployment/pre-deploy-YYYYMMDD-HHMMSS.tar.gz --overwrite

# 3. Reinstalar dependencias
npm install

# 4. Rebuild
npm run build

# 5. Reiniciar
pm2 restart edificio-admin
```

---

## 📊 MONITOREO

### Monitoreo en Tiempo Real

```bash
./scripts/deployment/monitor.sh
```

**Dashboard muestra:**
```
╔════════════════════════════════════════════════════════════╗
║           EDIFICIO ADMIN - SYSTEM MONITOR                  ║
╚════════════════════════════════════════════════════════════╝

⏰ 2025-11-23 15:30:45

━━━ PM2 Process ━━━
Status:  online
PID:     12345
Uptime:  45 minutes
Restart: 0 times
Memory:  28 MB
CPU:     0.5%

━━━ System Resources ━━━
CPU:     15.2%
Memory:  2.5G / 8.0G (31%)
Disk:    45G / 100G (45%)

━━━ Network ━━━
✓ Port 3000 listening
✓ HTTP response: 200

━━━ Database ━━━
✓ data.json: 41K
✓ JSON valid
  Usuarios: 20
  Cuotas:   240
  Gastos:   45

━━━ Recent Activity ━━━
✓ No errors (last 50 lines)
Last log: Sistema inicializado correctamente...

═══════════════════════════════════════════════════════════
✅ ALL SYSTEMS OPERATIONAL
═══════════════════════════════════════════════════════════

Press Ctrl+C to exit | Auto-refresh in 5s...
```

### Health Check Periódico

**Ejecutar manualmente:**
```bash
./scripts/deployment/health-check.sh
```

**Output:**
```
═══ System ═══
✓ Node.js installed: v25.1.0
✓ PM2 installed: 5.x.x
✓ Disk space available: 15G

═══ Application ═══
✓ PM2 status: online
  PID: 12345
  Memory: 28MB
  CPU: 0.5%
  Uptime: 1h 23m

✓ Port 3000 listening
✓ Server responding (HTTP 200)

═══ Files ═══
✓ package.json exists
✓ data.json exists
✓ ecosystem.config.cjs exists
✓ src/app.js exists
✓ Frontend build exists
  Database size: 41K

═══ API Endpoints ═══
✓ Auth endpoint responding (code: 401)

═══ Logs ═══
✓ No recent errors in log
  Total log size: 2.3M

═══════════════════════════════════════════════════════════
✅ HEALTH CHECK PASSED
   All systems operational
═══════════════════════════════════════════════════════════
```

**Automatizar (cron):**
```bash
# Ejecutar health check cada 30 minutos
crontab -e

# Añadir:
*/30 * * * * cd /home/sebastianvernis/Proyecto-EdificioActual && ./scripts/deployment/health-check.sh >> logs/health-check.log 2>&1
```

---

## 🔧 COMANDOS PM2 ÚTILES

### Gestión Básica
```bash
pm2 status                    # Ver estado de todos los procesos
pm2 status edificio-admin     # Ver estado específico
pm2 logs edificio-admin       # Ver logs en tiempo real
pm2 logs edificio-admin --lines 100  # Últimas 100 líneas
pm2 restart edificio-admin    # Reiniciar
pm2 stop edificio-admin       # Detener
pm2 start edificio-admin      # Iniciar
pm2 delete edificio-admin     # Eliminar proceso
```

### Gestión Avanzada
```bash
pm2 monit                     # Monitor interactivo
pm2 show edificio-admin       # Información detallada
pm2 describe edificio-admin   # Descripción completa
pm2 flush edificio-admin      # Limpiar logs
pm2 save                      # Guardar configuración
pm2 resurrect                 # Restaurar procesos guardados
pm2 startup                   # Configurar auto-start
```

### Logs
```bash
pm2 logs edificio-admin --err           # Solo errores
pm2 logs edificio-admin --out           # Solo output
pm2 logs edificio-admin --lines 50      # Últimas 50 líneas
pm2 logs edificio-admin --nostream      # Sin seguir
pm2 logs edificio-admin --timestamp     # Con timestamp
```

---

## 🐛 TROUBLESHOOTING

### Problema: Aplicación no inicia

**Síntomas:**
```bash
pm2 status
# Status: errored o stopped
```

**Solución:**
```bash
# 1. Ver logs de error
pm2 logs edificio-admin --err --lines 50

# 2. Verificar configuración
cat ecosystem.config.cjs

# 3. Verificar puerto disponible
lsof -i:3000

# 4. Iniciar manualmente para ver errores
node src/app.js
```

### Problema: Build falla

**Síntomas:**
```bash
npm run build
# Error: ...
```

**Solución:**
```bash
# 1. Limpiar dist
rm -rf dist/

# 2. Verificar sintaxis de archivos fuente
find src-optimized/ -name "*.js" -exec node -c {} \;

# 3. Reinstalar dependencias de build
npm install --save-dev esbuild terser

# 4. Build con más verbosidad
npm run build 2>&1 | tee build-debug.log
```

### Problema: Alto uso de memoria

**Síntomas:**
```bash
pm2 status
# Memory: >200MB
```

**Solución:**
```bash
# 1. Reiniciar aplicación
pm2 restart edificio-admin

# 2. Verificar memory leaks
pm2 monit

# 3. Configurar límite de memoria
# Editar ecosystem.config.cjs:
# max_memory_restart: '300M'

# 4. Restart con nueva configuración
pm2 restart edificio-admin --update-env
```

### Problema: Puerto 3000 ocupado

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```bash
# 1. Ver qué proceso usa el puerto
lsof -i:3000

# 2. Matar proceso (si no es nuestra app)
kill -9 <PID>

# 3. O cambiar puerto en .env
echo "PORT=3001" >> .env
pm2 restart edificio-admin --update-env
```

### Problema: Data.json corrupto

**Síntomas:**
```
Error: Unexpected token in JSON
```

**Solución:**
```bash
# 1. Verificar JSON
node -e "JSON.parse(require('fs').readFileSync('data.json', 'utf8'))"

# 2. Restaurar desde backup
cp backups/data-backup-LATEST.json data.json

# 3. Reiniciar
pm2 restart edificio-admin
```

### Problema: Frontend no carga módulos

**Síntomas:**
- Console errors: "Failed to load module"
- Pantalla en blanco

**Solución:**
```bash
# 1. Verificar que dist/ existe
ls -la dist/js/core/
ls -la dist/js/modules/

# 2. Rebuild
npm run build

# 3. Limpiar caché del navegador
# Ctrl+Shift+R (hard refresh)

# 4. Verificar en admin-optimized.html
# http://localhost:3000/admin-optimized.html
```

---

## 📋 CHECKLIST DE DESPLIEGUE

### Pre-Despliegue
- [ ] Código pusheado a Git
- [ ] Tests pasando localmente
- [ ] .env configurado correctamente
- [ ] PM2 instalado globalmente
- [ ] Espacio en disco > 500MB
- [ ] Node.js >= 16

### Durante Despliegue
- [ ] Backup creado automáticamente
- [ ] Build exitoso (108KB)
- [ ] PM2 status: online
- [ ] Health check: passed
- [ ] HTTP responde en puerto 3000

### Post-Despliegue
- [ ] Probar login en navegador
- [ ] Verificar cada módulo carga
- [ ] Probar crear/editar/eliminar
- [ ] Verificar logs sin errores
- [ ] Monitorear por 10 minutos

---

## 🔐 SEGURIDAD

### Permisos de Scripts
```bash
# Scripts de deployment solo ejecutables por owner
chmod 700 scripts/deployment/*.sh

# Verificar
ls -la scripts/deployment/
# -rwx------ deploy-full.sh
```

### Backups
```bash
# Backups automáticos cada 60 minutos (configurado en app)
# Ubicación: backups/data-backup-*.json

# Backups de deployment
# Ubicación: backups/deployment/pre-deploy-*.tar.gz
# Retención: Últimos 10
```

### Logs
```bash
# Rotar logs grandes
if [ -f "logs/edificio-admin-out.log" ]; then
    # Si es mayor a 100MB, rotar
    SIZE=$(stat -f%z logs/edificio-admin-out.log 2>/dev/null || stat -c%s logs/edificio-admin-out.log)
    if [ "$SIZE" -gt 104857600 ]; then
        mv logs/edificio-admin-out.log logs/edificio-admin-out.log.old
        pm2 flush edificio-admin
    fi
fi
```

---

## 📈 MÉTRICAS DE DESPLIEGUE

### Tiempos Esperados
```yaml
deploy-full.sh:     2-3 minutos
quick-deploy.sh:    10 segundos
update.sh:          30 segundos
rollback.sh:        1-2 minutos
health-check.sh:    5 segundos
```

### Recursos Consumidos
```yaml
Build:      ~100MB RAM, 0.04s CPU
Runtime:    ~30MB RAM, <1% CPU
Disk:       ~108KB (dist) + 41KB (db)
Network:    <1KB/s idle, ~100KB/s activo
```

### Disponibilidad
```yaml
Target:     99.9% uptime
Restart:    Auto (PM2)
Recovery:   <30s (auto-restart)
Rollback:   <2min (manual)
```

---

## 🎓 MEJORES PRÁCTICAS

### 1. Siempre hacer backup antes de deploy
```bash
# Backup manual antes de cambios grandes
tar -czf manual-backup-$(date +%Y%m%d).tar.gz public/ src/ data.json
```

### 2. Usar deploy-full.sh para producción
```bash
# ✅ Producción: Verificaciones completas
./scripts/deployment/deploy-full.sh

# ⚠️ Desarrollo: Deploy rápido
./scripts/deployment/quick-deploy.sh
```

### 3. Monitorear después de deploy
```bash
# Monitorear por 10 minutos después de deploy
./scripts/deployment/monitor.sh
# O
pm2 logs edificio-admin
```

### 4. Verificar health periódicamente
```bash
# Configurar cron para health checks
0 */6 * * * cd /home/sebastianvernis/Proyecto-EdificioActual && ./scripts/deployment/health-check.sh
```

### 5. Mantener solo últimos 10 backups
```bash
# Limpiar backups antiguos manualmente
cd backups/deployment/
ls -t *.tar.gz | tail -n +11 | xargs rm -f
```

---

## 🚦 FLUJO DE TRABAJO RECOMENDADO

### Desarrollo → Producción

```
┌─────────────────┐
│  Local Dev      │
│  npm run build  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git Push       │
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSH to Server  │
│  ssh user@host  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health Check   │
│  Pre-deploy     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy Full    │
│  deploy-full.sh │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│ OK  │   │FAIL │
└──┬──┘   └──┬──┘
   │         │
   ▼         ▼
Monitor   Rollback
```

### Hotfix Rápido

```
┌─────────────────┐
│  Fix en Local   │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Git Push       │
└────────┬────────┘
         ▼
┌─────────────────┐
│  SSH to Server  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  update.sh      │ ← Rápido
└────────┬────────┘
         ▼
┌─────────────────┐
│  Verify         │
└─────────────────┘
```

---

## 📞 SOPORTE

### Logs de Despliegue
```bash
# Ver último deployment log
ls -t logs/deployment-*.log | head -1 | xargs cat

# Ver todos los deployments
ls -lh logs/deployment-*.log
```

### Reportes de Despliegue
```bash
# Ver último reporte
cat docs/deployment/deployment-*.json | tail -1

# Ver todos los reportes
ls -lh docs/deployment/
```

### Debugging
```bash
# Modo debug
NODE_ENV=development node src/app.js

# Ver todas las variables de entorno
pm2 show edificio-admin
```

---

## ✅ RESUMEN DE COMANDOS

### Despliegue
```bash
./scripts/deployment/deploy-full.sh    # Completo
./scripts/deployment/quick-deploy.sh   # Rápido
./scripts/deployment/update.sh         # Update desde git
```

### Mantenimiento
```bash
./scripts/deployment/health-check.sh   # Verificar salud
./scripts/deployment/monitor.sh        # Monitor en vivo
./scripts/deployment/rollback.sh       # Revertir
```

### PM2
```bash
pm2 status                             # Estado
pm2 logs edificio-admin                # Logs
pm2 restart edificio-admin             # Reiniciar
pm2 monit                              # Monitor
```

### Build
```bash
npm run build                          # Producción
npm run build:dev                      # Desarrollo
npm run build:watch                    # Watch mode
```

---

**Última actualización:** 23/11/2025  
**Versión de guía:** 2.0  
**Sistema:** Optimizado y Listo para Producción ✅

---

_Generado por Crush - Sistema de deployment automatizado_
