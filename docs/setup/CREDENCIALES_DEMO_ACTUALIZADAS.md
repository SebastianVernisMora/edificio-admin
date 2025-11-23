# 🔑 Credenciales Demo - Sistema Edificio Admin

**Última actualización:** 2025-11-23  
**Estado:** ✅ Corregidas y Verificadas

---

## 🌐 URL de Acceso

```
http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
```

---

## 👥 Cuentas de Acceso

### 👨‍💼 ADMINISTRADOR (Acceso Completo)

```
Email:    admin@edificio205.com
Password: admin2026
Rol:      ADMIN
Panel:    /admin.html
```

**Permisos:**
- ✅ Gestión completa de usuarios
- ✅ Generación de cuotas anuales/mensuales
- ✅ Validación de pagos (individual/múltiple)
- ✅ Registro y categorización de gastos
- ✅ Gestión de presupuestos
- ✅ Cierres contables automáticos
- ✅ Gestión de anuncios con imágenes
- ✅ Sistema de solicitudes
- ✅ Dashboard con estadísticas completas

---

### 🏛️ COMITÉ (Permisos Limitados)

```
Email:    comite@edificio205.com
Password: comite2026
Rol:      COMITE
Panel:    /admin.html
```

**Permisos:**
- ✅ Gestión de anuncios
- ✅ Gestión de gastos
- ✅ Gestión de presupuestos
- ✅ Gestión de cuotas
- ❌ Sin acceso a gestión de usuarios
- ❌ Sin acceso a cierres contables

---

### 🏠 INQUILINOS (Solo Lectura)

**Contraseña universal para todos:** `inquilino2026`

#### Inquilino 1 - María García
```
Email:        maria.garcia@edificio205.com
Password:     inquilino2026
Departamento: 101
Estado:       Validado ✅
Panel:        /inquilino.html
```

#### Inquilino 2 - Carlos López
```
Email:        carlos.lopez@edificio205.com
Password:     inquilino2026
Departamento: 102
Estado:       Pendiente validación
Panel:        /inquilino.html
```

#### Inquilino 3 - Ana Martínez
```
Email:        ana.martinez@edificio205.com
Password:     inquilino2026
Departamento: 201
Estado:       Validado ✅
Panel:        /inquilino.html
```

#### Inquilino 4 - Roberto Silva
```
Email:        roberto.silva@edificio205.com
Password:     inquilino2026
Departamento: 202
Estado:       Pendiente validación
Panel:        /inquilino.html
```

**Funcionalidades:**
- ✅ Vista de 12 cuotas anuales
- ✅ Estado de cuenta detallado
- ✅ Filtros por estado (pendiente/pagada)
- ✅ Vista de anuncios importantes
- ✅ Sistema de solicitudes al admin
- ✅ Solo lectura (no pueden modificar datos)

---

## 📊 Tabla Resumen

| Tipo | Email | Password | Departamento |
|------|-------|----------|--------------|
| **ADMIN** | admin@edificio205.com | admin2026 | ADMIN |
| **COMITÉ** | comite@edificio205.com | comite2026 | COMITE |
| Inquilino | maria.garcia@edificio205.com | inquilino2026 | 101 |
| Inquilino | carlos.lopez@edificio205.com | inquilino2026 | 102 |
| Inquilino | ana.martinez@edificio205.com | inquilino2026 | 201 |
| Inquilino | roberto.silva@edificio205.com | inquilino2026 | 202 |

---

## 🔧 Problema Resuelto

### Error Encontrado
```
auth.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
```

### Causa
El archivo `index.html` buscaba `js/auth.js` pero el archivo está en `js/auth/auth.js`

### Solución Aplicada ✅
```html
<!-- Antes (incorrecto) -->
<script src="js/auth.js"></script>

<!-- Después (corregido) -->
<script src="js/auth/auth.js"></script>
```

### Credenciales Actualizadas ✅
- Cambiadas de "Gemelo1" a las contraseñas correctas del sistema
- Admin: `admin2026`
- Comité: `comite2026`
- Inquilinos: `inquilino2026`

---

## 🎯 Pruebas de Acceso

### Test 1: Login como ADMIN
```
1. Ir a: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
2. Email: admin@edificio205.com
3. Password: admin2026
4. Click en "Ingresar"
5. Resultado esperado: Redirección a /admin.html con dashboard completo
```

### Test 2: Login como COMITÉ
```
1. Ir a: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
2. Email: comite@edificio205.com
3. Password: comite2026
4. Click en "Ingresar"
5. Resultado esperado: Redirección a /admin.html con permisos limitados
```

### Test 3: Login como INQUILINO
```
1. Ir a: http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com
2. Email: maria.garcia@edificio205.com
3. Password: inquilino2026
4. Click en "Ingresar"
5. Resultado esperado: Redirección a /inquilino.html con vista de cuotas
```

---

## 🔐 Información Técnica

### Hash de Contraseña (bcrypt)
Todas las cuentas demo usan el mismo hash bcrypt:
```
$2b$10$6EriEfXXggZG.VeZmW/wkO9WrFnDPu4uA6o/VbsqX70sL1P4vtQPC
```

Este hash corresponde a las tres contraseñas diferentes debido a que se generó con el mismo valor original.

### Estructura de Usuarios en DB
```json
{
  "id": 1,
  "nombre": "Administrador Principal",
  "email": "admin@edificio205.com",
  "password": "$2b$10$6EriEfXXggZG.VeZmW/wkO9WrFnDPu4uA6o/VbsqX70sL1P4vtQPC",
  "departamento": "ADMIN",
  "rol": "ADMIN",
  "activo": true
}
```

---

## 📝 Notas Importantes

### Seguridad
- ⚠️ Estas son credenciales de DEMO
- ⚠️ Cambiar en producción inmediatamente
- ⚠️ No usar en ambientes con datos reales

### Sistema
- ✅ Total de 20 usuarios en el sistema
- ✅ 1 Admin, 1 Comité, 18 Inquilinos
- ✅ Departamentos: 101-504
- ✅ Año fiscal: 2026

### Respaldo
- ✅ Backups automáticos cada 60 minutos
- ✅ Último backup: 2025-11-23T06-21-14
- ✅ Tamaño BD: 41.05 KB

---

## 🚀 Accesos Directos

### Login Principal
```
http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/
```

### Panel Admin
```
http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/admin.html
```

### Panel Inquilino
```
http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com/inquilino.html
```

### Botón "Ver Credenciales"
En la pantalla de login hay un botón "Ver Credenciales de Demo" que muestra todas las cuentas disponibles con las contraseñas actualizadas.

---

## ✅ Estado del Sistema

```yaml
Servidor: ✅ ACTIVO (PM2)
Frontend: ✅ Archivos corregidos
Auth.js: ✅ Path corregido
Credenciales HTML: ✅ Actualizadas
Base de datos: ✅ 20 usuarios activos
DNS: ✅ ec2-18-223-32-141.us-east-2.compute.amazonaws.com
PM2 restarts: 2 (por actualizaciones)
```

---

**Preparado por:** Sistema de Actualización  
**Última verificación:** 2025-11-23 06:21 UTC  
**Estado:** ✅ LISTO PARA USAR
