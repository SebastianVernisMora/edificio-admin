# 🏢 Sistema Condominio Departamento 205 - Noviembre 2025

Sistema de administración del **Condominio Departamento 205** configurado para **noviembre 2025**, con saldos de fondos acumulados, cierres mensuales automáticos y preparación para el sistema de parcialidades 2026.

## 📅 Estado Actual - Noviembre 2025

### 💰 **Patrimonio Acumulado al 31 Octubre 2025:**
```
💎 PATRIMONIO DEL CONDOMINIO ($240,500 MXN):
┌─────────────────────────────┬──────────────┬─────────────────────────┐
│ FONDO                       │ SALDO MXN    │ DESTINO                 │
├─────────────────────────────┼──────────────┼─────────────────────────┤
│ 💰 Fondo Ahorro Acumulado   │ $67,500      │ Gastos operacionales    │
│                             │              │ y mantenimiento regular │
├─────────────────────────────┼──────────────┼─────────────────────────┤
│ 🏦 Fondo Gastos Mayores     │ $125,000     │ Proyectos infraestr.    │
│                             │              │ y reparaciones mayores  │
├─────────────────────────────┼──────────────┼─────────────────────────┤
│ 💵 Dinero Operacional       │ $48,000      │ Flujo de caja mensual   │
│                             │              │ y gastos corrientes     │
├─────────────────────────────┼──────────────┼─────────────────────────┤
│ 💎 PATRIMONIO TOTAL         │ $240,500     │ Capital disponible 2026 │
└─────────────────────────────┴──────────────┴─────────────────────────┘
```

### 📋 **Cuotas Activas Nov/Dec 2025:**

```
📅 CALENDARIO DE VENCIMIENTOS:
┌─────────────────┬────────────────┬───────────────────┐
│ MES DE CUOTA    │ VENCE          │ ESTADO            │
├─────────────────┼────────────────┼───────────────────┤
│ Noviembre 2025  │ 1 Diciembre    │ Todo el mes para  │
│                 │ 2025           │ pagar             │
├─────────────────┼────────────────┼───────────────────┤
│ Diciembre 2025  │ 1 Enero        │ Todo diciembre    │
│                 │ 2026           │ para pagar        │
└─────────────────┴────────────────┴───────────────────┘

💰 Monto por cuota: $550 MXN
🏠 Total cuotas: 40 (20 departamentos × 2 meses)
💵 Ingreso esperado: $22,000 MXN
```

---

## 🔑 Credenciales de Acceso

### 👨‍💼 Administrador
- **Email**: admin@edificio205.com
- **Password**: admin2025

### 🏠 Inquilinos (Censo Real)
- **Felipe (101)**: felipe@edificio205.com / inquilino2025
- **Profe (102)**: profe@edificio205.com / inquilino2025
- **Melndez (103)**: melendez1@edificio205.com / inquilino2025
- **Rosita (104)**: rosita@edificio205.com / inquilino2025
- *...y 16 departamentos más*

**Password universal inquilinos**: inquilino2025

---

## 🚀 Instalación y Uso

```bash
cd edificio-admin
npm install
npm run dev
```

**🔗 Acceso**: http://localhost:3001

---

## 📊 Funcionalidades del Sistema

### 👨‍💼 **Panel de Administrador:**

#### **📊 Dashboard Nov 2025:**
```
PATRIMONIO EN TIEMPO REAL:
├── Fondo Ahorro: $67,500 (operacional)
├── Fondo Gastos Mayores: $125,000 (infraestructura)  
├── Dinero Operacional: $48,000 (corriente)
└── Patrimonio Total: $240,500

ESTADO CUOTAS NOV/DIC 2025:
├── Cuotas Noviembre: X/20 pagadas (vencen 1 dic)
├── Cuotas Diciembre: X/20 pagadas (vencen 1 ene) 
├── Gastos Nov: $X,XXX registrados
└── Preparación 2026: [Pendiente/Completado]
```

#### **🚀 Acciones de Gestión:**
- **Generar Cuotas 2026**: 260 cuotas con vencimientos correctos
- **Cierre Mensual**: Procesar cierre noviembre/diciembre
- **Cierre Anual 2025**: Generar reporte final del ejercicio
- **Resumen Patrimonial**: Ver estado financiero completo

#### **📅 Sistema de Cierres:**
- **Cierres Mensuales**: Noviembre y diciembre 2025
- **Cierre Anual**: 31 diciembre 2025 completo
- **Saldos Automáticos**: Actualización de fondos
- **Reportes**: Ingresos, egresos y patrimonio

### 🏠 **Panel de Inquilinos:**

#### **Dashboard Inteligente:**
```
EJEMPLO - DASHBOARD INQUILINO:
┌─────────────────────────────────────────┐
│ Cuotas Mensuales Pendientes: 2         │
│ Total a Pagar: $1,100 MXN              │
│ Desglose: $1,100 (2 cuotas mensuales)  │
│ Fondo Gastos Mayores: No aplicable     │
│ (Se activará en enero 2026)            │
└─────────────────────────────────────────┘
```

#### **Vista de Cuotas:**
- **Cuotas Nov/Dec 2025**: Con fechas de vencimiento reales
- **Estados Claros**: PENDIENTE hasta vencer, VENCIDO después del 1
- **Solo Lectura**: No pueden cambiar estados de pago

---

## 📅 Sistema de Vencimientos Corregido

### **🕐 Regla de Vencimiento:**
**"Las cuotas se vencen el 1 del mes siguiente"**

```
EJEMPLOS DE VENCIMIENTOS:
┌─────────────────┬─────────────────┬─────────────────┐
│ CUOTA DEL MES   │ PERÍODO DE PAGO │ FECHA VENCIM.   │
├─────────────────┼─────────────────┼─────────────────┤
│ Noviembre 2025  │ Todo noviembre  │ 1 Diciembre     │
│ Diciembre 2025  │ Todo diciembre  │ 1 Enero 2026    │
│ Enero 2026      │ Todo enero      │ 1 Febrero 2026  │
│ Febrero 2026    │ Todo febrero    │ 1 Marzo 2026    │
│ ...             │ ...             │ ...             │
└─────────────────┴─────────────────┴─────────────────┘
```

### **📊 Estados de Cuotas:**
- **🟢 PENDIENTE**: Desde generación hasta fecha de vencimiento
- **🔴 VENCIDO**: A partir del 1 del mes siguiente
- **✅ PAGADO**: Cuando admin valida el pago

---

## 🏦 Sistema de Parcialidades (Preparado para 2026)

### **💳 Fondo Gastos Mayores 2026:**
- **Monto**: $5,000 MXN por departamento
- **Período de Pago**: Enero a marzo 2026
- **Vencimiento**: 1 de abril 2026
- **Parcialidades**: Permitidas desde enero

### **🔧 Funcionalidades Preparadas:**
- **Panel Individual**: Gestión por departamento
- **Registro de Parcialidades**: Monto, fecha, método, observaciones
- **Control Total Admin**: Solo administrador registra pagos
- **Estados Automáticos**: PENDIENTE → PARCIAL → COMPLETADO

---

## 🔄 Cronograma Noviembre-Diciembre 2025

### **NOVIEMBRE 2025:**
```
📅 ACTIVIDADES DEL MES:
├── Cobro cuotas noviembre (vencen 1 dic)
├── Registro gastos operacionales noviembre
├── Preparación asamblea ordinaria
└── Planificación proyectos 2026

🎯 META: Mantener flujo de caja positivo
```

### **DICIEMBRE 2025:**
```
📅 ACTIVIDADES DEL MES:
├── Cobro cuotas diciembre (vencen 1 ene 2026)
├── Cierre mensual noviembre
├── Registro gastos operacionales diciembre  
├── Generación cuotas 2026
└── Cierre anual 2025

🎯 META: Cerrar ejercicio y preparar 2026
```

### **ENERO 2026:**
```
🚀 ACTIVACIÓN SISTEMA 2026:
├── Cuotas mensuales 2026 activas
├── Sistema parcialidades operativo
├── Inicio cobro fondo gastos mayores
└── Ejecución proyectos críticos
```

---

## ⚡ Funcionalidades Clave

### **📊 Cierres Automáticos:**
- **Mensuales**: Nov y dic 2025 con saldos actualizados
- **Anual**: 31 dic 2025 con patrimonio final
- **Automático**: Botones de un clic para procesar

### **💰 Control de Fondos:**
- **Saldos en Tiempo Real**: Actualización automática
- **Fondos Separados**: Ahorro, gastos mayores, operacional
- **Reportes Detallados**: Origen y destino de recursos

### **📋 Gestión de Cuotas:**
- **Vencimientos Correctos**: El 1 del mes siguiente
- **Estados Automáticos**: Cambio automático por fecha
- **Control Admin**: Solo administrador valida pagos

---

## 📈 Proyecciones para 2026

### **💎 Capital Disponible:**
```
RECURSOS PARA PROYECTOS 2026:
├── Patrimonio Actual: $240,500
├── Ingresos Esperados 2026: $232,000  
├── Capital Total Proyectado: $472,500
└── Capacidad de Inversión: ALTA
```

### **🚨 Proyectos Críticos Preparados:**
1. **🔴 Legitimidad Legal**: $35,000 MXN (URGENTE)
2. **⚡ Irregularidades Eléctricas**: $85,000 MXN
3. **💧 Bombas Base Inestable**: $45,000 MXN
4. **🏗️ Estructura Castillos**: $120,000 MXN

**Total Proyectos**: $285,000 MXN
**Financiamiento**: Con fondos acumulados + ingresos 2026

---

## ✅ Checklist Sistema Noviembre 2025

### **✅ Implementado:**
- [x] Saldos de fondos reales al 31 octubre
- [x] 40 cuotas nov/dic con vencimientos correctos
- [x] Gastos operacionales noviembre registrados
- [x] Dashboard con patrimonio en tiempo real
- [x] Sistema de cierres mensuales y anuales
- [x] Preparación estructura 2026 con parcialidades

### **📋 Pendiente Operativo:**
- [ ] Cobrar cuotas noviembre (vencen 1 diciembre)
- [ ] Cobrar cuotas diciembre (vencen 1 enero 2026)
- [ ] Procesar cierre mensual noviembre
- [ ] Procesar cierre mensual diciembre
- [ ] Generar cuotas 2026 (botón preparado)
- [ ] Procesar cierre anual 2025

---

## 🔗 Acceso al Sistema

**URL**: http://localhost:3001

**🔐 Admin**: admin@edificio205.com / admin2025
**🏠 Inquilinos**: [nombre]@edificio205.com / inquilino2025

---

*Sistema configurado para la gestión operativa de noviembre/diciembre 2025 con cierres automáticos mensuales y anuales, preparado para la transición al sistema de parcialidades 2026.*