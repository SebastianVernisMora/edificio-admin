# Instalación y Uso del Orquestador de Agentes

## Ubicación

El orquestador está ubicado en `/home/admin/orquestador-agentes/` (fuera del repositorio edificio-admin para evitar que se suba al commit).

## Estructura de Archivos

```
/home/admin/orquestador-agentes/
├── Orquestador.js              # Clase principal del orquestador
├── api-orquestador.js          # API REST para control remoto
├── test-orquestador.js         # Script de prueba
├── README.md                   # Documentación detallada
├── ORQUESTADOR_INTEGRACION.md  # Guía de integración
└── INSTALACION.md              # Este archivo
```

## Instalación

El orquestador ya está instalado y listo para usar. No requiere dependencias adicionales más allá de las que ya tiene edificio-admin.

## Uso Básico

### 1. Ejecutar Prueba

Para verificar que el orquestador funciona correctamente:

```bash
cd /home/admin/orquestador-agentes
node test-orquestador.js
```

### 2. Uso Programático

```javascript
import Orquestador from '/home/admin/orquestador-agentes/Orquestador.js';

// Crear instancia
const orquestador = new Orquestador();

// Iniciar workflow
const resultado = orquestador.iniciarWorkflow();

if (resultado.exito) {
  console.log('Workflow iniciado');
  
  // Actualizar progreso
  orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 50);
  
  // Obtener estado
  const estado = orquestador.obtenerEstadoWorkflow();
  console.log(estado);
}
```

### 3. Integración con Express (Opcional)

Si deseas integrar el orquestador con la API de edificio-admin:

```javascript
// En /home/admin/edificio-admin/src/app.js
import orquestadorRoutes from '/home/admin/orquestador-agentes/api-orquestador.js';

// Registrar rutas
app.use('/api/orquestador', orquestadorRoutes);
```

Luego podrás usar los endpoints:
- `GET /api/orquestador/estado`
- `POST /api/orquestador/iniciar`
- `PUT /api/orquestador/agente/:id`
- `POST /api/orquestador/detener`
- `GET /api/orquestador/log`
- `GET /api/orquestador/reporte`

## Agentes Supervisados

El orquestador supervisa 3 agentes definidos en `/home/admin/edificio-admin/blackbox_tasks.md`:

1. **Agente 1**: Mejoras en la Interfaz de Usuario
2. **Agente 2**: Gestión Centralizada de Permisos
3. **Agente 3**: Documentación y Pruebas

## Conflicto Detectado

⚠️ El orquestador detectó un conflicto entre Agente 1 y Agente 2:
- **Archivo**: `public/admin.html`
- **Solución**: Resolver el conflicto antes de iniciar el workflow

## Documentación

- **README.md**: Documentación completa del orquestador
- **ORQUESTADOR_INTEGRACION.md**: Guía de integración con edificio-admin
- **INSTALACION.md**: Este archivo

## Comandos Útiles

```bash
# Ejecutar prueba
cd /home/admin && node test-orquestador.js

# Ver archivos del orquestador
ls -la /home/admin/*.js | grep -E "(Orquestador|orquestador|agente)"

# Leer documentación
cat /home/admin/ORQUESTADOR_INTEGRACION.md
```

## Notas Importantes

1. El orquestador está **fuera del repositorio** edificio-admin
2. No se subirá a git/commits
3. Es independiente del proyecto principal
4. Puede integrarse opcionalmente vía rutas absolutas

## Soporte

Para más información, consultar:
- `README.md` - Documentación completa
- `ORQUESTADOR_INTEGRACION.md` - Guía de integración
- `test-orquestador.js` - Ejemplos de uso
js` - Ejemplos de uso
