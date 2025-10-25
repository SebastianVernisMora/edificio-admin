# 🏢 Edificio Admin - Sistema 2026

## 🚀 Comandos Frecuentes

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Instalar dependencias
npm install
```

### Sistema
```bash
# Limpiar datos y reiniciar
rm -f data.json && npm run dev

# Ver puerto ocupado
lsof -i :3001

# Matar proceso en puerto
pkill -f "node.*app-simple"
```

## 📊 Información del Sistema

### Configuración 2026
- **Puerto**: 3001
- **Año Fiscal**: 2026  
- **Cuota Mensual**: $75,000
- **Departamentos**: 20 (101-504)
- **Total Anual**: $18,000,000

### Credenciales
- **Admin**: admin@edificio205.com / admin2026
- **Inquilinos**: [email] / inquilino2026

## 🎯 Estructura de Datos

### Usuarios
- 1 Administrador + 20 Inquilinos
- Departamentos numerados por piso (101-504)

### Cuotas  
- 240 cuotas anuales (20 × 12)
- Todas pendientes al inicio
- Solo admin puede validar pagos

### Contabilidad
- Cierres mensuales y anuales
- Categorías de gastos predefinidas
- Reportes de ingresos/egresos

## 📱 Funcionalidades Clave

### Panel Admin
- ✅ Dashboard con estadísticas
- ✅ Generación cuotas anuales/mensuales  
- ✅ Validación pagos individual/múltiple
- ✅ Registro gastos por categoría
- ✅ Cierres contables automáticos
- ✅ Gestión anuncios y solicitudes

### Panel Inquilino
- ✅ Vista 12 cuotas anuales
- ✅ Solo lectura (no pueden modificar)
- ✅ Filtros por estado
- ✅ Anuncios importantes
- ✅ Solicitudes al admin

## 🔄 Flujo Típico

1. **Inicio**: Sistema con 240 cuotas pendientes
2. **Inquilino**: Ve sus 12 cuotas del año
3. **Pago**: Inquilino paga por transferencia/efectivo
4. **Validación**: Admin marca como pagada en sistema  
5. **Actualización**: Inquilino ve cuota actualizada
6. **Cierre**: Admin genera cierre mensual/anual