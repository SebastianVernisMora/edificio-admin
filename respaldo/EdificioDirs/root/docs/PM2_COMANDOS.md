# Guía de Comandos PM2 - Edificio Admin

**Aplicación:** edificio-admin  
**Archivo:** src/app.js  
**Usuario:** admin

---

## 🎯 Comandos Básicos

### Ver Estado
```bash
pm2 status                    # Lista de todos los procesos
pm2 info edificio-admin       # Información detallada
pm2 describe edificio-admin   # Alias de info
```

### Controlar Proceso
```bash
pm2 start src/app.js --name edificio-admin    # Iniciar
pm2 restart edificio-admin                     # Reiniciar
pm2 reload edificio-admin                      # Reload sin downtime
pm2 stop edificio-admin                        # Detener
pm2 delete edificio-admin                      # Eliminar de PM2
```

### Ver Logs
```bash
pm2 logs edificio-admin                        # Logs en tiempo real
pm2 logs edificio-admin --lines 100            # Últimas 100 líneas
pm2 logs edificio-admin --nostream             # Ver sin seguir
pm2 logs edificio-admin --err                  # Solo errores
pm2 flush                                      # Limpiar todos los logs
```

---

## 📊 Monitoreo

### Monitoreo en Tiempo Real
```bash
pm2 monit                     # Dashboard interactivo
pm2 plus                      # PM2 Plus (monitoring avanzado)
```

### Métricas
```bash
pm2 status                    # CPU, Memoria, Uptime
pm2 info edificio-admin       # Stats detallados
```

---

## 🔄 Gestión de Configuración

### Guardar y Restaurar
```bash
pm2 save                      # Guardar lista actual de procesos
pm2 resurrect                 # Restaurar procesos guardados
pm2 dump                      # Alias de save
```

### Startup (Auto-inicio)
```bash
pm2 startup                   # Generar script de inicio
pm2 startup systemd           # Para systemd específicamente
pm2 unstartup                 # Deshabilitar auto-inicio
```

---

## 🚀 Opciones de Inicio Avanzadas

### Inicio con Opciones
```bash
# Con nombre personalizado
pm2 start src/app.js --name edificio-admin

# Con variables de entorno
pm2 start src/app.js --name edificio-admin --env production

# Con modo cluster (múltiples instancias)
pm2 start src/app.js --name edificio-admin -i 4

# Con auto-restart en cambios de archivo
pm2 start src/app.js --name edificio-admin --watch

# Con límite de memoria
pm2 start src/app.js --name edificio-admin --max-memory-restart 200M
```

### Archivo de Configuración (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'edificio-admin',
    script: 'src/app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Uso:
```bash
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env production
```

---

## 🔧 Comandos Útiles

### Reinicio y Actualización
```bash
# Reinicio completo
pm2 restart edificio-admin

# Reinicio sin downtime (0-second downtime)
pm2 reload edificio-admin

# Reinicio suave (graceful reload)
pm2 gracefulReload edificio-admin

# Reiniciar después de update de código
cd /home/admin
git pull
npm install
pm2 restart edificio-admin
```

### Limpieza
```bash
# Limpiar logs
pm2 flush

# Limpiar logs de una app específica
pm2 flush edificio-admin

# Eliminar proceso detenido
pm2 delete edificio-admin
```

---

## 📋 Información del Sistema

### Estado Actual (2025-11-23)
```yaml
Nombre: edificio-admin
PID: 31015
Estado: online
Uptime: Desde 2025-11-23 05:39:59
CPU: 0%
Memoria: 75.6MB
Restarts: 0
```

### Comandos de Verificación
```bash
# Ver si está corriendo
pm2 status | grep edificio-admin

# Ver PID
pm2 id edificio-admin

# Ver path del script
pm2 info edificio-admin | grep script

# Ver uptime
pm2 info edificio-admin | grep uptime
```

---

## 🚨 Troubleshooting

### Problema: Proceso no inicia
```bash
# Ver logs de error
pm2 logs edificio-admin --err

# Verificar que el archivo existe
ls -la /home/admin/src/app.js

# Intentar ejecutar directamente
cd /home/admin
node src/app.js
```

### Problema: Proceso se reinicia constantemente
```bash
# Ver logs para identificar error
pm2 logs edificio-admin

# Ver número de restarts
pm2 status

# Si está crasheando, detener y revisar
pm2 stop edificio-admin
pm2 logs edificio-admin --lines 100
```

### Problema: Memoria alta
```bash
# Ver uso de memoria
pm2 status

# Reiniciar para liberar memoria
pm2 restart edificio-admin

# Configurar límite de memoria
pm2 stop edificio-admin
pm2 delete edificio-admin
pm2 start src/app.js --name edificio-admin --max-memory-restart 200M
pm2 save
```

### Problema: PM2 no responde
```bash
# Matar daemon de PM2
pm2 kill

# Reiniciar PM2
pm2 resurrect

# O iniciar desde cero
pm2 start src/app.js --name edificio-admin
pm2 save
```

---

## 🔐 Best Practices

### 1. Siempre Guardar Después de Cambios
```bash
pm2 restart edificio-admin
pm2 save  # ✅ IMPORTANTE
```

### 2. Verificar Antes de Cerrar SSH
```bash
pm2 status
pm2 logs edificio-admin --lines 20 --nostream
```

### 3. Usar Nombres Descriptivos
```bash
# ✅ Bueno
pm2 start src/app.js --name edificio-admin

# ❌ Malo
pm2 start src/app.js
```

### 4. Configurar Startup en Producción
```bash
pm2 startup
pm2 save
```

### 5. Monitorear Regularmente
```bash
# Al menos una vez al día
pm2 status
pm2 logs edificio-admin --lines 50 --nostream
```

---

## 📚 Recursos

- **Documentación oficial:** https://pm2.keymetrics.io/
- **Quick Start:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Process Management:** https://pm2.keymetrics.io/docs/usage/process-management/
- **Log Management:** https://pm2.keymetrics.io/docs/usage/log-management/

---

## 🎯 Cheatsheet Rápido

```bash
# Estado
pm2 status                    # Lista de procesos
pm2 info edificio-admin       # Detalles

# Control
pm2 restart edificio-admin    # Reiniciar
pm2 stop edificio-admin       # Detener
pm2 logs edificio-admin       # Ver logs

# Configuración
pm2 save                      # Guardar
pm2 startup                   # Auto-inicio

# Monitoreo
pm2 monit                     # Dashboard
pm2 logs edificio-admin       # Logs en vivo
```

---

**Última actualización:** 2025-11-23  
**Estado:** ✅ PM2 configurado y funcionando  
**Proceso actual:** edificio-admin (PID: 31015)
