# EdificioAdmin SaaS - Entorno de Desarrollo Local

Este documento proporciona instrucciones detalladas para configurar y ejecutar el proyecto EdificioAdmin SaaS en un entorno de desarrollo local.

## Requisitos Previos

- Node.js (v16 o superior)
- npm
- Wrangler CLI (`npm install -g wrangler`)
- Cuenta en Cloudflare (para despliegues)

## Configuración Inicial

1. **Clonar el repositorio**:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd edificio-admin/cloudflare-saas
   ```

2. **Configurar el entorno de desarrollo**:
   ```
   ./scripts/setup-dev.sh
   ```
   Este script:
   - Instala todas las dependencias
   - Configura la base de datos D1 local
   - Aplica todas las migraciones
   - Carga datos de prueba iniciales
   - Crea archivo de variables de entorno para desarrollo

## Ejecución del Proyecto

Para iniciar el servidor de desarrollo local:

```
npm run dev
```

Esto iniciará el servidor en `http://localhost:8787`.

## Estructura de Archivos Relevantes

- **wrangler.toml**: Configuración principal de Cloudflare Workers
- **.dev.vars**: Variables de entorno para desarrollo local
- **migrations/**: Archivos SQL para la estructura de la base de datos
- **migrations/seeds/**: Datos iniciales para pruebas

## Acceso a Base de Datos Local

La base de datos SQLite local se almacena en:
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/edificio_admin_db.sqlite
```

Puedes examinarla con cualquier cliente SQLite (como DB Browser para SQLite).

## Comandos Útiles

- **Iniciar servidor de desarrollo**:
  ```
  npm run dev
  ```

- **Ejecutar migraciones localmente**:
  ```
  wrangler d1 execute edificio_admin_db --local --file=migrations/001_initial_schema.sql
  ```

- **Ejecutar consultas SQL ad-hoc**:
  ```
  wrangler d1 execute edificio_admin_db --local --command="SELECT * FROM users"
  ```

- **Ejecutar tests**:
  ```
  npm test
  ```

## Credenciales de Prueba

El script de seed crea los siguientes usuarios para pruebas:

- **Administrador**:
  - Email: admin@edificio-admin.com
  - Contraseña: Gemelo1

- **Residentes** (todos con la misma contraseña: Gemelo1):
  - maria.garcia@edificio-admin.com (Depto 101)
  - carlos.lopez@edificio-admin.com (Depto 102)
  - ana.martinez@edificio-admin.com (Depto 201)
  - roberto.silva@edificio-admin.com (Depto 202)

## Solución de Problemas

### Error al iniciar el servidor local

Si encuentras problemas con la base de datos local:

1. Elimina la carpeta `.wrangler`:
   ```
   rm -rf .wrangler
   ```

2. Vuelve a ejecutar el script de configuración:
   ```
   ./scripts/setup-dev.sh
   ```

### Error con los bindings de KV

Si encuentras errores relacionados con KV:

1. Asegúrate de que los bindings estén correctamente configurados en `wrangler.toml`
2. Puedes reiniciar el entorno local con `wrangler dev --reset`

## Notas Importantes

- El entorno local simula el envío de emails (los muestra en la consola)
- Los archivos subidos se almacenan en memoria durante la sesión de desarrollo
- Las sesiones y tokens JWT solo son válidos en el entorno donde fueron creados