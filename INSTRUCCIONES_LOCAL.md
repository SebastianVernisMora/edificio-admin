# 🏠 INSTRUCCIONES - Despliegue Local

**Configurado para:** `localhost:3000`  
**Fecha:** 2025-12-11 22:58 UTC

---

## ⚡ Inicio Rápido (3 pasos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor
```bash
./start-local.sh
```
O directamente:
```bash
npm run dev
```

### 3. Abrir navegador
```
http://localhost:3000
```

---

## 🔐 Credenciales

```
Usuario: admin@edificio205.com
Password: Gemelo1
```

---

## 📋 URLs Disponibles

```
Login:      http://localhost:3000
Admin:      http://localhost:3000/admin
Inquilino:  http://localhost:3000/inquilino
API:        http://localhost:3000/api/
```

---

## 🛠️ Comandos Útiles

### Iniciar Servidor
```bash
# Opción 1: Script incluido
./start-local.sh

# Opción 2: NPM
npm run dev

# Opción 3: Node directo
node src/app.js
```

### Detener Servidor
```bash
# Si está en primer plano: Ctrl+C

# Si está en background:
pkill -f "node src/app.js"

# O encontrar y matar por PID:
ps aux | grep "node src/app.js"
kill -9 <PID>
```

### Ver Logs
```bash
# Si usaste start-local.sh, los logs aparecen en consola

# Logs guardados (si existen):
tail -f logs/edificio-admin-out.log
tail -f logs/edificio-admin-error.log
```

---

## 🔧 Configuración Actual

### Archivo .env
```env
PORT=3000
JWT_SECRET=edificio205_secret_key_2025
NODE_ENV=development
HOST=localhost
```

### Puerto
- **Puerto:** 3000
- **Host:** localhost
- **URL:** http://localhost:3000

---

## 📊 Módulos Disponibles

### Panel Admin
✅ Cuotas  
✅ Gastos  
✅ Fondos  
✅ Presupuestos  
✅ Solicitudes  
✅ Usuarios  
✅ Anuncios  
✅ Cierres  
✅ Permisos  
✅ Parcialidades 2026  

---

## 🧪 Probar la API

### Login
```bash
# POST /api/auth/login
{
  "email": "admin@edificio205.com",
  "password": "Gemelo1"
}
```

### Obtener token
Después del login, recibirás un `token` que debes usar en las siguientes peticiones:

### Headers para API
```
x-auth-token: <tu_token_aqui>
Content-Type: application/json
```

---

## 🌐 Acceso desde Otros Dispositivos (Red Local)

### 1. Obtener tu IP
```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### 2. Modificar src/app.js
Cambiar:
```javascript
app.listen(PORT, async () => {
```

Por:
```javascript
app.listen(PORT, '0.0.0.0', async () => {
```

### 3. Acceder desde otro dispositivo
```
http://TU_IP_LOCAL:3000
Ejemplo: http://192.168.1.100:3000
```

---

## 🚨 Solución de Problemas

### Puerto 3000 ocupado
```bash
# Opción 1: Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# Opción 2: Cambiar puerto en .env
PORT=3001
```

### Error de permisos
```bash
chmod +x start-local.sh
```

### Dependencias faltantes
```bash
rm -rf node_modules package-lock.json
npm install
```

### Loop de login (frontend)
```javascript
// Consola del navegador (F12):
localStorage.clear();
// Luego: Ctrl+Shift+R
```

### Ver si el servidor está corriendo
```bash
ps aux | grep "node src/app.js" | grep -v grep
```

---

## 📁 Archivos Importantes

```
edificio-admin/
├── src/app.js              → Servidor principal
├── data.json               → Base de datos (42KB)
├── .env                    → Configuración
├── start-local.sh          → Script de inicio
├── package.json            → Dependencias
└── LOCALHOST_SETUP.md      → Guía completa
```

---

## ✅ Checklist

- [ ] Dependencias instaladas
- [ ] Puerto 3000 libre
- [ ] Servidor iniciado
- [ ] Navegador abierto en http://localhost:3000
- [ ] Login exitoso

---

## 📚 Documentación

- **LOCALHOST_SETUP.md** - Guía completa de desarrollo local
- **CONSOLIDACION_COMPLETA.md** - Documentación técnica
- **CRUSH.md** - Guía rápida

---

**¡Listo para desarrollo local!** 🚀

Si tienes problemas, verifica los logs en consola o revisa LOCALHOST_SETUP.md
