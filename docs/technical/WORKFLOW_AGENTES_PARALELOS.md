# 🚀 Workflow para Trabajo Paralelo de 3 Agentes

## 📋 **DISTRIBUCIÓN DE TAREAS**

### 🎯 **AGENTE 1: Modal Acumulado Pagos en Cuotas**
**Funcionalidad:** En inquilino, cuotas, que aparezca un modal con el acumulado pagado del año en curso.

**Archivos a modificar:**
- `src/controllers/cuotas.controller.js` - Endpoint para obtener acumulado anual
- `src/routes/cuotas.routes.js` - Ruta para acumulado anual  
- `public/js/inquilino-controller.js` - Lógica del modal
- `public/inquilino.html` - Estructura del modal
- `public/css/inquilino.css` - Estilos del modal

**Tasks específicas:**
1. Crear endpoint `GET /api/cuotas/acumulado-anual/:usuarioId/:year`
2. Implementar método `getAcumuladoAnual()` en modelo Cuota
3. Agregar botón "Ver Acumulado" en tabla de cuotas
4. Crear modal con:
   - Total pagado año actual
   - Desglose por mes
   - Gráfico simple de barras
   - Comparativa con año anterior
5. Estilizar modal responsivo

---

### 🎯 **AGENTE 2: Completar Lógica de Solicitudes**
**Funcionalidad:** Terminar la lógica de solicitudes (sistema completo CRUD)

**Archivos a modificar:**
- `src/models/Solicitud.js` - Completar modelo
- `src/controllers/solicitudController.js` - Completar controlador
- `src/routes/solicitudes.routes.js` - CREAR rutas (no existe)
- `public/js/solicitudes.js` - CREAR manager frontend
- `public/admin.html` - Agregar sección solicitudes
- `src/app.js` - Registrar rutas de solicitudes

**Tasks específicas:**
1. Completar modelo Solicitud:
   - Estados: PENDIENTE, EN_PROCESO, COMPLETADA, RECHAZADA
   - Campos: titulo, descripcion, tipo, prioridad, fechaCreacion, fechaActualizacion
   - Métodos CRUD completos
2. Implementar controlador completo:
   - `crearSolicitud`, `obtenerSolicitudes`, `actualizarEstado`, `eliminarSolicitud`
   - Validaciones y error handling
3. Crear rutas RESTful
4. Frontend admin para gestión solicitudes
5. Frontend inquilino para crear solicitudes

---

### 🎯 **AGENTE 3: Adjuntar Archivos en Anuncios**
**Funcionalidad:** En anuncios, que se pueda adjuntar un archivo

**Archivos a modificar:**
- `src/models/Anuncio.js` - Agregar campo archivos
- `src/controllers/anuncios.controller.js` - Upload de archivos
- `src/routes/anuncios.routes.js` - Endpoint con multer
- `public/js/anuncios.js` - Form con upload
- `public/admin.html` - Input file en modal anuncios
- `package.json` - Dependencia multer

**Tasks específicas:**
1. Instalar y configurar multer para uploads
2. Crear directorio `/uploads/anuncios/` 
3. Modificar modelo Anuncio:
   - Campo `archivos: []` (array de rutas)
   - Validaciones de tipo/tamaño archivo
4. Endpoint `POST /api/anuncios` con soporte multipart/form-data
5. Frontend:
   - Input file multiple en modal
   - Preview de archivos seleccionados
   - Display de archivos en listado anuncios
   - Download/view de archivos adjuntos
6. Validaciones: solo PDF, DOC, DOCX, JPG, PNG (max 5MB)

---

## 🔄 **COORDINACIÓN ENTRE AGENTES**

### **Orden de Desarrollo (Paralelo):**

**FASE 1 (Simultánea):**
- Agente 1: Crear endpoint acumulado + estructura modal
- Agente 2: Completar modelo Solicitud + controlador base
- Agente 3: Configurar multer + modificar modelo Anuncio

**FASE 2 (Simultánea):**
- Agente 1: Implementar modal frontend + estilos
- Agente 2: Crear rutas + frontend admin solicitudes  
- Agente 3: Implementar upload + preview archivos

**FASE 3 (Verificación cruzada):**
- Testing integrado de las 3 funcionalidades
- Verificar que no hay conflictos de rutas/puertos
- Pruebas de usuario final

### **Archivos Compartidos (Coordinación necesaria):**
- `src/app.js` - Registro de rutas (Agentes 2 y 3)
- `package.json` - Dependencias (Agente 3)
- `public/admin.html` - Secciones nuevas (Agentes 2 y 3)
- `public/inquilino.html` - Modal nuevo (Agente 1)

### **Puntos de Sincronización:**
1. **Día 1**: Definir estructuras de datos finales
2. **Día 2**: APIs completadas, testing individual
3. **Día 3**: Frontend integrado, testing conjunto
4. **Día 4**: Pulimiento y deployment

---

## 📊 **ESTIMACIONES DE TIEMPO**

| Agente | Funcionalidad | Backend | Frontend | Testing | Total |
|--------|---------------|---------|----------|---------|--------|
| 1 | Modal Acumulado | 2h | 3h | 1h | **6h** |
| 2 | Lógica Solicitudes | 4h | 4h | 2h | **10h** |
| 3 | Archivos Anuncios | 3h | 3h | 2h | **8h** |

**Total estimado: 24h de desarrollo paralelo = 8h calendario**

---

## ✅ **CRITERIOS DE ACEPTACIÓN**

### **Agente 1 - Modal Acumulado:**
- [ ] Botón "Ver Acumulado" visible en tabla cuotas inquilino
- [ ] Modal muestra total pagado año actual
- [ ] Desglose mensual de pagos
- [ ] Comparativa con año anterior (opcional)
- [ ] Modal responsive en móvil

### **Agente 2 - Solicitudes:**
- [ ] CRUD completo de solicitudes
- [ ] Estados de solicitud funcionales
- [ ] Panel admin para gestionar solicitudes
- [ ] Panel inquilino para crear solicitudes
- [ ] Notificaciones de cambio de estado

### **Agente 3 - Archivos Anuncios:**
- [ ] Upload múltiple de archivos
- [ ] Validación tipos/tamaños permitidos
- [ ] Preview archivos antes de subir
- [ ] Display archivos en anuncios existentes
- [ ] Download/visualización de archivos adjuntos

---

## 🛠️ **HERRAMIENTAS DE COORDINACIÓN**

### **Comandos para cada agente:**
```bash
# Desarrollo
npm run dev

# Testing individual
npm test

# Ver logs
pm2 logs edificio-admin

# Sync con otros agentes
git pull origin main
git push origin feature/agente-X
```

### **Branches recomendadas:**
- `feature/modal-acumulado` (Agente 1)
- `feature/solicitudes-completas` (Agente 2)  
- `feature/archivos-anuncios` (Agente 3)
- `integration/all-features` (Merge final)

### **Testing conjunto:**
```bash
# Después de merge en integration
npm run dev
# Verificar:
# - Puerto 3000 disponible
# - APIs funcionando
# - Frontend cargando
# - No errores en consola
```