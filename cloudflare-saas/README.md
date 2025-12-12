# EdificioAdmin SaaS

Sistema de administración de edificios y condominios como servicio SaaS, implementado con Cloudflare Workers.

## Estructura del Proyecto

El proyecto está estructurado para aprovechar al máximo las capacidades de Cloudflare Workers:

- **src/**: Código fuente de la aplicación
  - **index.js**: Punto de entrada principal
  - **handlers/**: Manejadores para cada endpoint de la API
  - **middleware/**: Middlewares para autenticación, CORS, etc.
  - **models/**: Modelos para interactuar con la base de datos
  - **templates/**: Plantillas HTML para el frontend
  - **utils/**: Utilidades varias
  - **tasks/**: Tareas programadas

## Tecnologías Utilizadas

- **Cloudflare Workers**: Plataforma serverless para el backend
- **Cloudflare D1**: Base de datos SQL serverless
- **Cloudflare KV**: Almacenamiento clave-valor para sesiones y caché
- **Cloudflare R2**: Almacenamiento de objetos para archivos subidos
- **HTML/CSS/JavaScript**: Frontend con Bootstrap 5

## Configuración del Proyecto

### Prerrequisitos

- Node.js (v16 o superior)
- Wrangler CLI
- Cuenta de Cloudflare

### Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd edificio-admin/cloudflare-saas
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura tus credenciales de Cloudflare:
   ```
   wrangler login
   ```

4. Crea una base de datos D1:
   ```
   wrangler d1 create edificio_admin_db
   ```

5. Crea un namespace KV para sesiones:
   ```
   wrangler kv:namespace create SESSIONS
   wrangler kv:namespace create SESSIONS --preview
   ```

6. Crea un bucket R2 para almacenamiento:
   ```
   wrangler r2 bucket create edificio-admin-uploads
   ```

7. Actualiza `wrangler.toml` con los IDs generados.

### Desarrollo Local

Para iniciar el servidor de desarrollo:

```
wrangler dev
```

### Despliegue

Para desplegar a producción:

```
wrangler publish
```

## Arquitectura Multi-tenant

Este sistema está diseñado con una arquitectura multi-tenant para permitir que múltiples edificios/condominios utilicen la misma infraestructura con aislamiento de datos:

1. **Aislamiento a nivel de base de datos**: Cada tabla tiene un campo `building_id` que se utiliza para filtrar los datos por edificio.

2. **Autenticación y Autorización**: El sistema de tokens JWT incluye información sobre los edificios a los que un usuario tiene acceso.

3. **Middleware de seguridad**: Valida que los usuarios solo puedan acceder a los recursos de los edificios a los que pertenecen.

## Flujo de Registro y Onboarding

1. **Registro de Usuario**: Creación de cuenta con correo y contraseña
2. **Selección de Plan**: Opciones de planes por número de unidades
3. **Información de Pago**: Procesamiento del pago (simulado)
4. **Configuración del Edificio**: Datos básicos del condominio
5. **Activación**: Creación de la estructura en la base de datos y activación del servicio

## API Endpoints

### Autenticación
- `POST /api/auth/register`: Registro de usuario
- `POST /api/auth/login`: Inicio de sesión
- `POST /api/auth/reset-password`: Solicitar restablecimiento de contraseña
- `POST /api/auth/verify-email/:token`: Verificar email

### Suscripciones
- `POST /api/subscription/select-plan`: Seleccionar plan
- `POST /api/subscription/custom-plan`: Configurar plan personalizado
- `POST /api/subscription/checkout`: Procesar pago
- `POST /api/subscription/confirm`: Confirmar y completar configuración

### Edificios
- `POST /api/buildings`: Crear edificio
- `GET /api/buildings`: Listar edificios del usuario
- `GET /api/buildings/:id`: Obtener detalles de un edificio
- `PUT /api/buildings/:id`: Actualizar edificio
- `DELETE /api/buildings/:id`: Eliminar edificio

### Usuarios
- `POST /api/buildings/:id/users`: Crear usuario en edificio
- `GET /api/buildings/:id/users`: Listar usuarios de edificio
- `PUT /api/buildings/:id/users/:userId`: Actualizar usuario
- `DELETE /api/buildings/:id/users/:userId`: Eliminar usuario

## Licencia

Este proyecto es privado y no está licenciado para su redistribución o uso sin permiso explícito.