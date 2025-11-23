# Diagnóstico de Problemas de Login

**Fecha:** 2025-11-23  
**Estado del servidor:** ✅ Activo (PM2 online)

---

## 🔍 Checklist de Diagnóstico

### 1. Verifica que el servidor responde
Abre la consola del navegador y ejecuta:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'admin@edificio205.com', password: 'admin2026'})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Resultado esperado:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador Principal",
    "email": "admin@edificio205.com",
    "rol": "ADMIN",
    ...
  }
}
```

---

### 2. Verifica archivos JavaScript cargados
En la pestaña **Network** del navegador (F12):
- Recarga la página (Ctrl+F5)
- Busca: `auth.js`
- **Status debe ser:** 200 ✅
- **Si es 404:** El archivo no se encuentra ❌

**Archivos que deben cargar:**
- ✅ `js/auth/auth.js` (200)
- ✅ `js/utils/constants.js` (200)
- ✅ `css/styles.css` (200)

---

### 3. Verifica errores en Console
Abre la pestaña **Console** (F12):

**Errores comunes y soluciones:**

#### Error: "Uncaught SyntaxError: Unexpected token"
```
Causa: Archivos JavaScript con caracteres incorrectos
Solución: Ya corregidos en última actualización
```

#### Error: "Failed to fetch" o "Network error"
```
Causa: Servidor backend no responde
Solución: Verificar que PM2 está corriendo
```

#### Error: "401 Unauthorized" o "403 Forbidden"
```
Causa: Credenciales incorrectas
Solución: Usar credenciales correctas
```

#### Error: "Cannot read property 'addEventListener' of null"
```
Causa: Elemento HTML no encontrado
Solución: Verificar que IDs existen en HTML
```

---

### 4. Limpia caché y localStorage

**Paso 1: Limpiar localStorage**
```javascript
// En la consola del navegador:
localStorage.clear();
console.log('localStorage limpiado');
```

**Paso 2: Limpiar caché del navegador**
- Chrome/Edge: Ctrl+Shift+Delete → Seleccionar "Cached images and files"
- Firefox: Ctrl+Shift+Delete → Seleccionar "Cache"
- Safari: Cmd+Option+E

**Paso 3: Hard reload**
- Windows/Linux: Ctrl+Shift+R o Ctrl+F5
- Mac: Cmd+Shift+R

---

### 5. Verifica credenciales

**Credenciales correctas:**
```
Email:    admin@edificio205.com
Password: admin2026
```

**Otros usuarios de prueba:**
```
Email:    comite@edificio205.com
Password: comite2026

Email:    maria.garcia@edificio205.com
Password: inquilino2026
```

---

### 6. Verifica redirecciones

**Flujo esperado:**
```
1. Cargar http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/
2. Ver formulario de login
3. Ingresar credenciales
4. Click en "Ingresar"
5. Request POST a /api/auth/login
6. Response 200 con token
7. Redirección a /admin.html o /inquilino.html
8. Página carga correctamente
```

**Si hay loop de redirección:**
```
Causa: Sistema de auth intentando renovar token
Solución: Ya corregido en auth.js (eliminada renovación automática)
Acción: Limpiar localStorage y recargar
```

---

## 🐛 Errores Comunes y Soluciones

### Error 1: "La página sigue recargando"
**Causa:** Loop de redirección
**Solución:**
```javascript
// Limpiar localStorage
localStorage.clear();
// Recargar página
location.reload();
```

---

### Error 2: "No pasa nada al hacer click en Ingresar"
**Verificar:**
1. ¿Hay errores en Console? → Compartir errores
2. ¿El formulario tiene ID correcto?
```html
<form id="login-form">  <!-- ✅ Debe existir -->
```
3. ¿auth.js se cargó correctamente?
```javascript
// En console:
typeof Auth
// Debe devolver: "object"
```

---

### Error 3: "Error 404 al hacer login"
**Causa:** Endpoint no encontrado
**Verificar:**
```bash
# En servidor:
pm2 status  # Debe estar online
pm2 logs edificio-admin --lines 50  # Ver errores
```

---

### Error 4: "Token inválido" o "Credenciales incorrectas"
**Verificar:**
1. Contraseña correcta: `admin2026` (no `Gemelo1`)
2. Email correcto: `admin@edificio205.com`
3. Backend funcionando: `pm2 status`

---

### Error 5: "Pantalla en blanco después de login"
**Verificar:**
1. Errores en Console → Compartir
2. Archivos JS cargados en Network
3. Rutas de scripts correctas en admin.html

---

## 📝 Información para Reportar

Si el problema persiste, comparte esta información:

### Console Errors
```
Copiar y pegar TODOS los errores de la pestaña Console
Ejemplo:
auth.js:45 Uncaught TypeError: Cannot read property 'addEventListener' of null
```

### Network Errors
```
Copiar status de requests fallidos en Network
Ejemplo:
POST /api/auth/login - Status: 401 Unauthorized
```

### Comportamiento
```
Describir QUÉ pasa exactamente:
- ¿El botón responde?
- ¿Aparece mensaje de error?
- ¿Se queda cargando?
- ¿Redirige a otra página?
- ¿Muestra pantalla en blanco?
```

### Credenciales Usadas
```
Email usado: _____________
Password usado: _____________
```

---

## ✅ Estado Actual del Sistema

```yaml
Servidor Backend: ✅ Online (PM2)
PID: 31585
Puerto: 3000
Memoria: 84.1MB
Uptime: Estable
PM2 Restarts: 5
Último backup: 2025-11-23T06-37-59

Archivos Frontend:
  index.html: ✅ Corregido
  admin.html: ✅ Corregido (12 scripts)
  inquilino.html: ✅ Corregido (4 scripts)
  auth.js: ✅ Corregido (sin loop)
  constants.js: ✅ Corregido (sin export)

Base de Datos:
  Estado: ✅ Operacional
  Usuarios: 20
  Admin password hash: ✅ Válido
```

---

## 🎯 Pasos de Solución Rápida

**Si nada funciona, ejecuta esto en orden:**

1. **Limpiar todo**
```javascript
// En Console del navegador:
localStorage.clear();
sessionStorage.clear();
```

2. **Recargar forzado**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

3. **Probar en ventana privada/incógnito**
```
Ctrl+Shift+N (Chrome/Edge)
Ctrl+Shift+P (Firefox)
Cmd+Shift+N (Safari)
```

4. **Verificar servidor**
```bash
# En servidor:
pm2 restart edificio-admin
pm2 logs edificio-admin
```

5. **Test directo de API**
```javascript
// En Console del navegador:
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@edificio205.com',
    password: 'admin2026'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.ok) {
    console.log('✅ API funciona correctamente');
    console.log('Token:', data.token);
    console.log('Usuario:', data.usuario);
  } else {
    console.log('❌ Error:', data.msg);
  }
})
.catch(err => console.error('❌ Error de red:', err));
```

---

**Última actualización:** 2025-11-23 06:38 UTC  
**Por favor comparte los errores específicos que ves para ayudarte mejor.**
