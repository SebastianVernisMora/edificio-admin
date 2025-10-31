# Sistema de Permisos en Edificio-Admin

Este documento describe el sistema de permisos implementado en Edificio-Admin, incluyendo la funcionalidad para el rol "Comité" con permisos configurables.

## Roles de Usuario

El sistema tiene tres roles principales:

1. **ADMIN**: Acceso completo a todas las funcionalidades del sistema sin restricciones.
2. **COMITÉ**: Acceso configurable a secciones específicas según los permisos asignados individualmente.
3. **INQUILINO**: Acceso limitado a sus propias cuotas, anuncios y solicitudes.

## Permisos Configurables para el Rol "Comité"

Los usuarios con rol "Comité" pueden tener permisos específicos para acceder a diferentes secciones del sistema:

| Permiso | Descripción | Acciones permitidas |
|---------|-------------|---------------------|
| **anuncios** | Gestión de anuncios | Crear, editar, eliminar y publicar anuncios |
| **gastos** | Gestión de gastos | Registrar, editar, eliminar y categorizar gastos |
| **presupuestos** | Gestión de presupuestos | Crear, editar, eliminar y aprobar presupuestos |
| **cuotas** | Gestión de cuotas | Generar, actualizar estado y registrar pagos de cuotas |
| **usuarios** | Gestión de usuarios | Crear, editar, eliminar usuarios y acceder a la sección de configuración |
| **cierres** | Gestión de cierres contables | Realizar cierres mensuales y anuales |

## Implementación Técnica

### Modelo de Usuario

El modelo `Usuario` incluye un campo `permisos` que almacena los permisos configurables para usuarios con rol "Comité":

```javascript
{
  id: 1,
  nombre: "Nombre del Usuario",
  email: "usuario@edificio205.com",
  password: "hash_de_contraseña",
  departamento: "101",
  rol: "COMITE",
  activo: true,
  permisos: {
    anuncios: true,
    gastos: true,
    presupuestos: false,
    cuotas: true,
    usuarios: false,
    cierres: false
  }
}
```

### Middleware de Autenticación (Backend)

El sistema utiliza un middleware `hasPermission` que verifica si un usuario tiene un permiso específico:

```javascript
// Middleware para verificar permisos específicos
export const hasPermission = (permiso) => {
  return (req, res, next) => {
    // Obtener usuario completo de la base de datos para tener acceso a los permisos
    const data = readData();
    const usuarioCompleto = data.usuarios.find(u => u.id === req.usuario.id);
    
    if (!usuarioCompleto) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el usuario tiene el permiso requerido
    if (Usuario.tienePermiso(usuarioCompleto, permiso)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. No tiene permiso para ${permiso}.`
      });
    }
  };
};
```

### Verificación de Permisos (Frontend)

En el frontend, se implementa una función `hasPermission` que verifica si un usuario tiene un permiso específico:

```javascript
function hasPermission(permiso) {
  const user = getUser();
  
  // Administradores tienen todos los permisos
  if (user && user.rol === 'ADMIN') {
    return true;
  }
  
  // Miembros del comité tienen permisos específicos
  if (user && user.rol === 'COMITE' && user.permisos) {
    return user.permisos[permiso] === true;
  }
  
  // Inquilinos no tienen permisos administrativos
  return false;
}
```

### Visualización Condicional de la Interfaz

La función `setupPermissionBasedUI` muestra u oculta secciones de la interfaz según los permisos del usuario:

```javascript
function setupPermissionBasedUI() {
  const user = getUser();
  
  // Si no hay usuario o no estamos en la página de admin, no hacer nada
  if (!user || window.location.pathname !== '/admin') {
    return;
  }
  
  // Si es administrador, mostrar todo
  if (user.rol === 'ADMIN') {
    return;
  }
  
  // Si es miembro del comité, mostrar solo secciones con permiso
  if (user.rol === 'COMITE') {
    const sections = {
      'anuncios': document.querySelector('a[data-section="anuncios"]'),
      'gastos': document.querySelector('a[data-section="gastos"]'),
      'presupuestos': document.querySelector('a[data-section="presupuestos"]'),
      'cuotas': document.querySelector('a[data-section="cuotas"]'),
      'usuarios': document.querySelector('a[data-section="usuarios"]'),
      'cierres': document.querySelector('a[data-section="cierres"]')
    };
    
    // Ocultar secciones sin permiso
    for (const [permiso, element] of Object.entries(sections)) {
      if (element && !hasPermission(permiso)) {
        const li = element.closest('li');
        if (li) {
          li.style.display = 'none';
        }
      }
    }
    
    // Manejar específicamente la sección de configuración
    // La sección de configuración solo debe ser visible si el usuario tiene permiso de 'usuarios'
    const configSection = document.querySelector('a[data-section="configuracion"]');
    if (configSection) {
      const configLi = configSection.closest('li');
      if (configLi) {
        configLi.style.display = hasPermission('usuarios') ? '' : 'none';
      }
    }
  }
}
```

### Visualización de Permisos en la Interfaz

La función `renderPermisosIcons` muestra iconos visuales para representar los permisos de un usuario:

```javascript
renderPermisosIcons(permisos) {
  if (!permisos) return '';
  
  let icons = '<div class="mt-1">';
  
  if (permisos.anuncios) {
    icons += '<i class="bi bi-megaphone text-info me-1" title="Anuncios"></i>';
  }
  
  if (permisos.gastos) {
    icons += '<i class="bi bi-credit-card text-info me-1" title="Gastos"></i>';
  }
  
  if (permisos.presupuestos) {
    icons += '<i class="bi bi-calculator text-info me-1" title="Presupuestos"></i>';
  }
  
  if (permisos.cuotas) {
    icons += '<i class="bi bi-cash-coin text-info me-1" title="Cuotas"></i>';
  }
  
  if (permisos.usuarios) {
    icons += '<i class="bi bi-people text-info me-1" title="Usuarios"></i>';
  }
  
  if (permisos.cierres) {
    icons += '<i class="bi bi-journal-check text-info me-1" title="Cierres"></i>';
  }
  
  icons += '</div>';
  
  return icons;
}
```

## Flujo de Trabajo para Gestionar Permisos

### Crear un Usuario con Rol "Comité"

1. Acceder a la sección "Usuarios" (solo disponible para administradores).
2. Hacer clic en "Nuevo Usuario".
3. Completar la información del usuario.
4. Seleccionar el rol "COMITÉ".
5. Marcar los permisos que se desean asignar al usuario.
6. Guardar el usuario.

### Editar Permisos de un Usuario

1. Acceder a la sección "Usuarios" (solo disponible para administradores).
2. Buscar el usuario deseado en la lista.
3. Hacer clic en el botón de edición.
4. Modificar los permisos según sea necesario.
5. Guardar los cambios.

## Consideraciones de Seguridad

- **Verificación en Ambos Lados**: Los permisos se verifican tanto en el cliente como en el servidor para garantizar la seguridad.
- **Protección de Rutas**: Todas las rutas de la API están protegidas con el middleware `hasPermission`.
- **Almacenamiento Seguro**: Los permisos se almacenan en la base de datos y se incluyen en el token JWT para su verificación en el cliente.
- **Acceso Restringido**: Solo los administradores pueden crear y modificar usuarios con rol "Comité".
- **Validación de Datos**: Se validan todos los datos de entrada para evitar manipulaciones maliciosas.

## Casos de Uso Comunes

### 1. Verificar Permiso en el Backend

```javascript
// En una ruta de API
import { hasPermission } from '../middleware/auth.js';

// Ruta protegida que requiere permiso de 'anuncios'
router.post('/anuncios', [verifyToken, hasPermission('anuncios')], crearAnuncio);
```

### 2. Verificar Permiso en el Frontend

```javascript
// En un controlador de eventos
document.getElementById('btnNuevoAnuncio').addEventListener('click', function() {
  if (hasPermission('anuncios')) {
    // Mostrar modal para crear anuncio
    anunciosManager.showAnuncioModal();
  } else {
    showAlert('alertContainer', 'No tiene permiso para crear anuncios', 'danger');
  }
});
```

### 3. Ocultar/Mostrar Elementos de la Interfaz

```javascript
// En una función de inicialización
function initAnunciosSection() {
  const btnNuevoAnuncio = document.getElementById('btnNuevoAnuncio');
  if (btnNuevoAnuncio) {
    // Mostrar u ocultar botón según permisos
    btnNuevoAnuncio.style.display = hasPermission('anuncios') ? 'block' : 'none';
  }
}
```

## Extensibilidad

El sistema de permisos está diseñado para ser fácilmente extensible:

### Añadir un Nuevo Permiso

1. **Actualizar el Modelo**: Añadir el nuevo permiso al modelo `Usuario`.
   ```javascript
   permisos: {
     // Permisos existentes
     nuevoPermiso: false
   }
   ```

2. **Actualizar la Interfaz**: Añadir el nuevo permiso en el formulario de usuario.
   ```html
   <div class="form-check mb-2">
     <input class="form-check-input" type="checkbox" id="permisoNuevo">
     <label class="form-check-label" for="permisoNuevo">
       Nuevo Permiso
     </label>
   </div>
   ```

3. **Actualizar la Lógica de Guardado**: Incluir el nuevo permiso en la función de guardar usuario.
   ```javascript
   userData.permisos = {
     // Permisos existentes
     nuevoPermiso: document.getElementById('permisoNuevo').checked
   };
   ```

4. **Actualizar la Visualización**: Añadir el nuevo permiso a la función `renderPermisosIcons`.
   ```javascript
   if (permisos.nuevoPermiso) {
     icons += '<i class="bi bi-nuevo-icono text-info me-1" title="Nuevo Permiso"></i>';
   }
   ```

5. **Proteger Rutas**: Utilizar el middleware `hasPermission` con el nuevo permiso.
   ```javascript
   router.post('/nueva-ruta', [verifyToken, hasPermission('nuevoPermiso')], nuevaFuncion);
   ```

### Añadir un Nuevo Rol

1. **Actualizar el Modelo**: Añadir el nuevo rol al modelo `Usuario`.
2. **Actualizar la Interfaz**: Añadir el nuevo rol en el selector de roles.
3. **Implementar la Lógica de Permisos**: Definir qué permisos tendrá el nuevo rol por defecto.
4. **Actualizar la Función `hasPermission`**: Modificar para manejar el nuevo rol.

## Pruebas y Depuración

### Usuarios de Prueba

Para probar el sistema de permisos, se han creado los siguientes usuarios:

- **Administrador**:
  - Email: admin@edificio205.com
  - Contraseña: Gemelo1
  - Rol: ADMIN

- **Comité (Permisos Limitados)**:
  - Email: comite@edificio205.com
  - Contraseña: Gemelo1
  - Rol: COMITE
  - Permisos: anuncios, gastos, cuotas

- **Comité (Todos los Permisos)**:
  - Email: comite_full@edificio205.com
  - Contraseña: Gemelo1
  - Rol: COMITE
  - Permisos: anuncios, gastos, presupuestos, cuotas, usuarios, cierres

### Depuración de Permisos

Para depurar problemas con los permisos, se pueden utilizar las siguientes técnicas:

1. **Verificar Permisos en Consola**:
   ```javascript
   console.log('Usuario:', getUser());
   console.log('¿Tiene permiso de anuncios?', hasPermission('anuncios'));
   ```

2. **Inspeccionar Token JWT**:
   - Copiar el token desde localStorage
   - Decodificarlo en [jwt.io](https://jwt.io) para verificar que contiene los permisos correctos

3. **Verificar Respuestas de API**:
   - Utilizar las herramientas de desarrollo del navegador para verificar las respuestas de la API
   - Buscar mensajes de error relacionados con permisos (código 403)

## Mejores Prácticas

1. **Siempre Verificar Permisos en el Servidor**: Nunca confiar solo en la verificación del cliente.
2. **Usar Nombres Descriptivos**: Utilizar nombres claros para los permisos.
3. **Principio de Privilegio Mínimo**: Asignar solo los permisos necesarios para cada usuario.
4. **Documentar Cambios**: Mantener actualizada la documentación al añadir o modificar permisos.
5. **Pruebas Exhaustivas**: Probar todas las combinaciones de permisos para asegurar que funcionan correctamente.