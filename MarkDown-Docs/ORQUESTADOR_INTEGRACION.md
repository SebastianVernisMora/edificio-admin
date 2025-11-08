# Integración del Orquestador en Edificio-Admin

## Resumen

Se ha agregado un nuevo agente llamado **Orquestador** que supervisa la lógica del workflow de los Agentes 1, 2 y 3 definidos en `blackbox_tasks.md`.

## Estructura de Archivos

```
edificio-admin/
├── orquestador/
│   ├── Orquestador.js          # Clase principal del orquestador
│   ├── api-orquestador.js      # API REST para control remoto
│   ├── README.md               # Documentación detallada
│   └── test-orquestador.js     # Script de prueba
├── blackbox_tasks.md           # Definición de tareas de los 3 agentes
└── ORQUESTADOR_INTEGRACION.md  # Este archivo
```

## Funcionalidades del Orquestador

### 1. Detección de Conflictos
El orquestador verifica automáticamente que no haya conflictos de archivos entre agentes antes de iniciar el workflow:

```javascript
const conflictos = orquestador.verificarConflictosArchivos();
// Detecta que agente1 y agente2 ambos modifican admin.html
```

### 2. Supervisión en Tiempo Real
Monitorea el estado de los 3 agentes:
- **Agente 1**: Mejoras en la Interfaz de Usuario
- **Agente 2**: Gestión Centralizada de Permisos
- **Agente 3**: Documentación y Pruebas

### 3. Control de Workflow
- Iniciar workflow de los 3 agentes en paralelo
- Detener workflow en caso de emergencia
- Reiniciar workflow desde cero
- Actualizar progreso de cada agente

### 4. Reportes y Logs
- Genera reportes detallados de ejecución
- Mantiene logs de todos los eventos
- Muestra estadísticas de progreso

## Integración con Express

Para integrar el orquestador en la aplicación Express, agregar en `src/app.js`:

```javascript
// Importar rutas del orquestador
import orquestadorRoutes from '../orquestador/api-orquestador.js';

// Registrar rutas (después de las rutas existentes)
app.use('/api/orquestador', orquestadorRoutes);
```

## API Endpoints

### Obtener Estado
```bash
curl http://localhost:3000/api/orquestador/estado
```

### Iniciar Workflow
```bash
curl -X POST http://localhost:3000/api/orquestador/iniciar
```

### Actualizar Agente
```bash
curl -X PUT http://localhost:3000/api/orquestador/agente/agente1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "EN_PROGRESO", "progreso": 50}'
```

### Detener Workflow
```bash
curl -X POST http://localhost:3000/api/orquestador/detener \
  -H "Content-Type: application/json" \
  -d '{"razon": "Mantenimiento"}'
```

### Obtener Log
```bash
curl http://localhost:3000/api/orquestador/log?limite=50
```

### Generar Reporte
```bash
curl http://localhost:3000/api/orquestador/reporte
```

## Uso Programático

### Ejemplo Básico

```javascript
import Orquestador from './orquestador/Orquestador.js';

// Crear instancia
const orquestador = new Orquestador();

// Iniciar workflow
const resultado = orquestador.iniciarWorkflow();

if (resultado.exito) {
  console.log('Workflow iniciado correctamente');
  
  // Simular progreso del Agente 1
  orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 50);
  
  // Marcar como completado
  orquestador.actualizarEstadoAgente('agente1', 'COMPLETADO', 100);
  
  // Obtener estado
  const estado = orquestador.obtenerEstadoWorkflow();
  console.log(estado);
} else {
  console.error('Error:', resultado.mensaje);
  console.error('Conflictos:', resultado.conflictos);
}
```

## Estados de Agentes

| Estado | Descripción |
|--------|-------------|
| `PENDIENTE` | Agente no ha iniciado |
| `EN_PROGRESO` | Agente ejecutando tareas |
| `COMPLETADO` | Agente finalizó exitosamente |
| `ERROR` | Agente encontró un error |
| `DETENIDO` | Agente detenido manualmente |

## Estados de Workflow

| Estado | Descripción |
|--------|-------------|
| `INICIALIZADO` | Workflow creado pero no iniciado |
| `EN_EJECUCION` | Workflow en progreso |
| `COMPLETADO` | Todos los agentes completaron |
| `ERROR` | Algún agente falló |
| `DETENIDO` | Workflow detenido manualmente |

## Conflicto Detectado

El orquestador detectó que el **Agente 1** y el **Agente 2** tienen un conflicto:

- **Archivo en conflicto**: `/home/admin/edificio-admin/public/admin.html`
- **Agentes afectados**: agente1, agente2

### Solución Recomendada

1. **Opción 1**: Dividir `admin.html` en secciones específicas
   - Crear `admin-usuarios.html` para Agente 1
   - Crear `admin-permisos.html` para Agente 2

2. **Opción 2**: Coordinar modificaciones
   - Agente 1 modifica solo la sección de usuarios
   - Agente 2 modifica solo la sección de permisos
   - Actualizar `blackbox_tasks.md` con secciones específicas

3. **Opción 3**: Ejecución secuencial
   - Ejecutar Agente 1 primero
   - Luego ejecutar Agente 2
   - Finalmente ejecutar Agente 3

## Prueba del Sistema

Para probar el orquestador:

```bash
cd /home/admin/edificio-admin
node orquestador/test-orquestador.js
```

Este script simula la ejecución de los 3 agentes y muestra:
- Estado inicial
- Progreso de cada agente
- Detección de conflictos
- Manejo de errores
- Reporte final

## Próximos Pasos

1. **Resolver conflicto de archivos**
   - Actualizar `blackbox_tasks.md` con asignación de archivos sin conflictos
   - O implementar coordinación entre agentes

2. **Integrar con Express**
   - Agregar rutas del orquestador en `src/app.js`
   - Probar endpoints de la API

3. **Crear Dashboard Web** (opcional)
   - Interfaz visual para monitorear agentes
   - Controles para iniciar/detener workflow
   - Visualización de progreso en tiempo real

4. **Implementar Notificaciones** (opcional)
   - WebSockets para actualizaciones en tiempo real
   - Notificaciones por email cuando workflow completa
   - Alertas cuando hay errores

## Documentación Adicional

Para más detalles, consultar:
- `orquestador/README.md` - Documentación completa del orquestador
- `blackbox_tasks.md` - Definición de tareas de los agentes
- `orquestador/test-orquestador.js` - Ejemplos de uso

## Soporte

Para preguntas o problemas:
1. Revisar logs del orquestador
2. Consultar documentación en `orquestador/README.md`
3. Ejecutar script de prueba para verificar funcionamiento
