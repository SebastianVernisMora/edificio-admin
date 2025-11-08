# Orquestador - Sistema de Supervisión de Workflow

El **Orquestador** es un agente supervisor que coordina y monitorea la ejecución paralela de los Agentes 1, 2 y 3 en el sistema Edificio-Admin.

## Funcionalidades Principales

### 1. Supervisión de Workflow
- Monitorea el estado de los 3 agentes en tiempo real
- Detecta y previene conflictos de archivos entre agentes
- Registra todos los eventos y cambios de estado

### 2. Control de Ejecución
- Inicia el workflow de los 3 agentes en paralelo
- Detiene el workflow en caso de emergencia
- Reinicia el workflow desde cero

### 3. Gestión de Estado
- Actualiza el progreso de cada agente
- Registra errores y problemas
- Verifica la completitud del workflow

### 4. Reportes
- Genera reportes detallados de ejecución
- Proporciona logs de eventos
- Muestra estadísticas de progreso

## Arquitectura

```
orquestador/
├── Orquestador.js          # Clase principal del orquestador
├── api-orquestador.js      # API REST para control remoto
├── README.md               # Esta documentación
└── test-orquestador.js     # Script de prueba
```

## API REST

### Endpoints Disponibles

#### 1. Obtener Estado del Workflow
```http
GET /api/orquestador/estado
```

**Respuesta:**
```json
{
  "exito": true,
  "data": {
    "workflow": {
      "estado": "EN_EJECUCION",
      "inicioEjecucion": "2025-10-30T10:00:00.000Z",
      "conflictos": []
    },
    "agentes": [
      {
        "id": "agente1",
        "nombre": "Agente 1: Mejoras en la Interfaz de Usuario",
        "estado": "EN_PROGRESO",
        "progreso": 50,
        "errores": 0
      }
    ],
    "log": []
  }
}
```

#### 2. Iniciar Workflow
```http
POST /api/orquestador/iniciar
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Workflow iniciado correctamente",
  "agentes": [...]
}
```

#### 3. Detener Workflow
```http
POST /api/orquestador/detener
Content-Type: application/json

{
  "razon": "Mantenimiento programado"
}
```

#### 4. Actualizar Estado de Agente
```http
PUT /api/orquestador/agente/agente1
Content-Type: application/json

{
  "estado": "COMPLETADO",
  "progreso": 100
}
```

#### 5. Obtener Log de Eventos
```http
GET /api/orquestador/log?limite=50
```

#### 6. Generar Reporte
```http
GET /api/orquestador/reporte
```

## Estados de Agentes

- **PENDIENTE**: Agente no ha iniciado
- **EN_PROGRESO**: Agente ejecutando tareas
- **COMPLETADO**: Agente finalizó exitosamente
- **ERROR**: Agente encontró un error
- **DETENIDO**: Agente detenido manualmente

## Estados de Workflow

- **INICIALIZADO**: Workflow creado pero no iniciado
- **EN_EJECUCION**: Workflow en progreso
- **COMPLETADO**: Todos los agentes completaron
- **ERROR**: Algún agente falló
- **DETENIDO**: Workflow detenido manualmente

## Uso Programático

### Ejemplo Básico

```javascript
const Orquestador = require('./orquestador/Orquestador');

// Crear instancia
const orquestador = new Orquestador();

// Iniciar workflow
const resultado = orquestador.iniciarWorkflow();
console.log(resultado);

// Actualizar progreso de un agente
orquestador.actualizarEstadoAgente('agente1', 'EN_PROGRESO', 50);

// Obtener estado
const estado = orquestador.obtenerEstadoWorkflow();
console.log(estado);

// Marcar agente como completado
orquestador.actualizarEstadoAgente('agente1', 'COMPLETADO', 100);
```

### Ejemplo con Errores

```javascript
// Reportar error en un agente
orquestador.actualizarEstadoAgente(
  'agente2',
  'ERROR',
  75,
  'No se pudo crear el archivo permisos.js'
);

// Detener workflow
const reporte = orquestador.detenerWorkflow('Error crítico detectado');
console.log(reporte);
```

## Integración con Express

Para integrar el orquestador en tu aplicación Express:

```javascript
// En src/app.js
const orquestadorRoutes = require('../orquestador/api-orquestador');

// Registrar rutas
app.use('/api/orquestador', orquestadorRoutes);
```

## Prevención de Conflictos

El orquestador verifica automáticamente que no haya conflictos de archivos entre agentes antes de iniciar el workflow:

```javascript
const conflictos = orquestador.verificarConflictosArchivos();
if (conflictos.length > 0) {
  console.error('Conflictos detectados:', conflictos);
  // No se inicia el workflow
}
```

## Monitoreo en Tiempo Real

Para monitorear el progreso en tiempo real:

```javascript
// Polling cada 5 segundos
setInterval(() => {
  const estado = orquestador.obtenerEstadoWorkflow();
  console.log('Estado actual:', estado.workflow.estado);
  
  estado.agentes.forEach(agente => {
    console.log(`${agente.nombre}: ${agente.progreso}%`);
  });
}, 5000);
```

## Logs y Debugging

El orquestador mantiene un log detallado de todos los eventos:

```javascript
const estado = orquestador.obtenerEstadoWorkflow();
console.log('Últimos eventos:', estado.log);
```

## Reportes Finales

Al completar el workflow, se genera un reporte automático:

```javascript
const reporte = orquestador.generarReporte();
console.log('Duración:', reporte.duracion);
console.log('Total errores:', reporte.totalErrores);
console.log('Agentes:', reporte.agentes);
```

## Mejores Prácticas

1. **Verificar conflictos** antes de iniciar el workflow
2. **Actualizar progreso** regularmente para monitoreo preciso
3. **Registrar errores** con mensajes descriptivos
4. **Generar reportes** al finalizar para análisis
5. **Usar estados apropiados** para cada situación

## Troubleshooting

### Problema: Workflow no inicia
- Verificar que no haya conflictos de archivos
- Revisar el log para mensajes de error
- Asegurar que todos los agentes estén en estado PENDIENTE

### Problema: Agente no actualiza
- Verificar que el ID del agente sea correcto
- Revisar que el estado sea válido
- Consultar el log para errores

### Problema: Workflow se queda en EN_EJECUCION
- Verificar que todos los agentes completen sus tareas
- Actualizar manualmente el estado de agentes bloqueados
- Considerar detener y reiniciar el workflow

## Próximas Mejoras

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Persistencia de estado en base de datos
- [ ] Dashboard web para visualización
- [ ] Métricas y estadísticas avanzadas
- [ ] Rollback automático en caso de errores
- [ ] Dependencias entre agentes
- [ ] Ejecución condicional de tareas
