# 🔑 Credenciales CORRECTAS - Sistema Edificio Admin

**Fecha:** 2025-11-23  
**IMPORTANTE:** Estas son las contraseñas REALES que funcionan

---

## ✅ CONTRASEÑA UNIVERSAL: **Gemelo1**

Todas las cuentas demo usan la misma contraseña: **`Gemelo1`**

---

## 👥 Cuentas de Acceso

### 👨‍💼 ADMINISTRADOR
```
Email:    admin@edificio205.com
Password: Gemelo1
Rol:      ADMIN
Panel:    /admin.html
```

### 🏛️ COMITÉ
```
Email:    comite@edificio205.com
Password: Gemelo1
Rol:      COMITE
Panel:    /admin.html
```

### 🏠 INQUILINOS

**Todos usan la misma contraseña: `Gemelo1`**

```
maria.garcia@edificio205.com    / Gemelo1  (Depto 101)
carlos.lopez@edificio205.com    / Gemelo1  (Depto 102)
ana.martinez@edificio205.com    / Gemelo1  (Depto 201)
roberto.silva@edificio205.com   / Gemelo1  (Depto 202)
```

---

## 🌐 URL de Acceso

```
http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
```

---

## 🔧 Solución al Loop de Recarga

### Problema
La página entraba y salía repetidamente (loop infinito).

### Solución Aplicada ✅

1. **Credenciales actualizadas en HTML** - Ahora muestra `Gemelo1`
2. **Auth.js simplificado** - Eliminadas verificaciones que causaban loop
3. **Detector de loops agregado** - Detiene recargas automáticas después de 3 intentos
4. **Error handlers agregados** - Muestra qué script falla en consola

### Cómo Usar

1. **Limpia localStorage**
   ```javascript
   // En consola del navegador (F12):
   localStorage.clear();
   ```

2. **Recarga forzada**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Haz login**
   ```
   Email: admin@edificio205.com
   Password: Gemelo1
   ```

4. **Debería funcionar sin loops**

---

## 📊 Tabla Resumen

| Usuario | Email | Password | Rol | Panel |
|---------|-------|----------|-----|-------|
| Admin | admin@edificio205.com | **Gemelo1** | ADMIN | /admin.html |
| Comité | comite@edificio205.com | **Gemelo1** | COMITE | /admin.html |
| María García | maria.garcia@edificio205.com | **Gemelo1** | INQUILINO | /inquilino.html |
| Carlos López | carlos.lopez@edificio205.com | **Gemelo1** | INQUILINO | /inquilino.html |
| Ana Martínez | ana.martinez@edificio205.com | **Gemelo1** | INQUILINO | /inquilino.html |
| Roberto Silva | roberto.silva@edificio205.com | **Gemelo1** | INQUILINO | /inquilino.html |

---

## 🐛 Si Aún Hay Problemas

### Opción 1: Modo Incógnito
Prueba en una ventana privada/incógnito del navegador:
- Chrome/Edge: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Safari: `Cmd+Shift+N`

### Opción 2: Limpiar Todo
```javascript
// En consola del navegador:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Opción 3: Ver Errores Específicos
Abre Console (F12) y comparte:
- ❌ Errores en rojo
- ⚠️ Warnings en amarillo
- 📝 Cualquier mensaje de "Error cargando..."

---

## ✅ Cambios Realizados (2025-11-23)

```yaml
Actualización #1: Credenciales HTML → Gemelo1 ✅
Actualización #2: Auth.js simplificado ✅
Actualización #3: Detector de loops agregado ✅
Actualización #4: Error handlers en scripts ✅
PM2 Restarts: 6
Estado: Online ✅
```

---

## 🎯 Verificación Rápida

**Test en consola del navegador:**
```javascript
// Debe devolver token y usuario
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@edificio205.com',
    password: 'Gemelo1'
  })
})
.then(r => r.json())
.then(data => {
  if (data.ok) {
    console.log('✅ Login exitoso!');
    console.log('Token:', data.token);
    console.log('Usuario:', data.usuario.nombre);
  } else {
    console.log('❌ Error:', data.msg);
  }
});
```

---

**RECUERDA: La contraseña es `Gemelo1` (con G mayúscula y 1 al final)**

**Última actualización:** 2025-11-23 06:44 UTC  
**Estado:** ✅ LISTO PARA USAR
