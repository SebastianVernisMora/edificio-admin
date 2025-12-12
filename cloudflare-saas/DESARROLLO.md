# Guía de Desarrollo - Edificio Admin SaaS

## Cambios Realizados

### 1. Corrección del wrangler.toml
- ✅ Eliminada sección `[routes]` incorrecta (debe ser `[[routes]]` solo para producción)
- ✅ Configuración simplificada para desarrollo local
- ✅ Variables de entorno configuradas correctamente

### 2. Corrección del Frontend (auth.js)
- ✅ Actualizado para usar `data.user` en lugar de `data.usuario`
- ✅ Actualizado para usar `user.role` en lugar de `user.rol`
- ✅ Mapeo correcto de roles: `owner`/`admin` para administradores
- ✅ Manejo correcto de respuestas con `data.success` y `data.message`

### 3. Corrección del Middleware CORS
- ✅ Soporte para localhost y 127.0.0.1
- ✅ Manejo correcto de peticiones OPTIONS (preflight)
- ✅ Headers CORS añadidos correctamente

### 4. Corrección del Router
- ✅ Rutas API correctamente configuradas bajo `/api/`
- ✅ Archivos estáticos servidos automáticamente por wrangler dev

## Cómo Iniciar el Servidor

### Opción 1: Comando npm (Recomendado)
```bash
npm run dev
```

### Opción 2: Script bash
```bash
./dev.sh
```

### Opción 3: Comando directo
```bash
npx wrangler dev --local --persist --port 8787 --assets ./public
```

## Endpoints de la API

### Autenticación

#### POST /api/auth/register
Registro de nuevo usuario.

**Body:**
```json
{
  "name": "Usuario Test",
  "email": "test@example.com",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Usuario Test",
    "email": "test@example.com",
    "role": "owner",
    "email_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "onboarding_required": true
}
```

#### POST /api/auth/login
Inicio de sesión.

**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "name": "Usuario Test",
    "email": "test@example.com",
    "role": "owner",
    "email_verified": false,
    "buildings": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "onboarding_required": true,
  "onboarding_status": null
}
```

#### POST /api/logout
Cerrar sesión (requiere autenticación).

**Headers:**
```
Authorization: Bearer {token}
```

#### GET /api/me
Obtener perfil del usuario actual (requiere autenticación).

**Headers:**
```
Authorization: Bearer {token}
```

## Archivos Estáticos

Los archivos estáticos se sirven automáticamente desde la carpeta `./public`:

- `http://localhost:8787/` → `./public/index.html`
- `http://localhost:8787/admin.html` → `./public/admin.html`
- `http://localhost:8787/js/auth/auth.js` → `./public/js/auth/auth.js`
- etc.

## Probar el Login

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre el navegador en:
   ```
   http://localhost:8787/test-login.html
   ```

3. Prueba el registro y login con los datos precargados

## Roles de Usuario

El sistema ahora usa los siguientes roles:

- `owner` - Propietario/Super Admin (acceso a admin.html)
- `admin` - Administrador (acceso a admin.html)
- `resident` - Residente/Inquilino (acceso a inquilino.html)

## Estructura de la Base de Datos

La base de datos D1 se crea automáticamente en modo local con `--persist` para mantener los datos entre reinicios.

Para resetear la base de datos:
```bash
rm -rf .wrangler
npm run dev
```

## Problemas Comunes

### Error: "CORS policy"
- ✅ **Solucionado**: El middleware CORS ahora acepta localhost y 127.0.0.1

### Error: "Token no proporcionado"
- Asegúrate de incluir el header `Authorization: Bearer {token}` en peticiones protegidas

### Error: "old_string not found"
- Los archivos fueron actualizados con coincidencias exactas de whitespace

### El login no redirige correctamente
- ✅ **Solucionado**: Los roles ahora se mapean correctamente (`role` en lugar de `rol`)

## Próximos Pasos

1. Implementar migración de base de datos
2. Crear seed data para desarrollo
3. Implementar gestión de edificios
4. Añadir tests automatizados
