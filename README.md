# Sistema de Administración Edificio 205

Sistema web completo para la administración de un edificio de 20 departamentos con gestión de presupuestos, cuotas, gastos y usuarios.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 📁 Estructura del Proyecto

```
edificio-admin/
├── src/                    # Código fuente del backend
├── frontend-nuevo/         # Frontend (HTML, CSS, JS)
├── docs/                   # Documentación
│   ├── setup/             # Guías de instalación y configuración
│   ├── technical/         # Documentación técnica
│   ├── user-guides/       # Guías de usuario
│   └── reports/           # Reportes y análisis
├── scripts/               # Scripts de automatización
│   ├── deployment/        # Scripts de despliegue
│   ├── maintenance/       # Scripts de mantenimiento
│   └── testing/           # Scripts de testing
├── config/                # Archivos de configuración
├── tests/                 # Tests automatizados
├── backups/              # Respaldos de datos
└── uploads/              # Archivos subidos
```

## 👥 Tipos de Usuario

- **ADMIN**: Acceso completo al sistema
- **COMITE**: Gestión de gastos, presupuestos y cuotas
- **INQUILINO**: Consulta de estado de cuenta y información

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: HTML5 + Vanilla JavaScript
- **Base de Datos**: JSON (archivo data.json)
- **Autenticación**: JWT + bcrypt
- **Servidor Web**: Nginx (producción)

## 📋 Funcionalidades

- ✅ Autenticación y autorización por roles
- ✅ Gestión de presupuestos anuales
- ✅ Control de gastos mensuales
- ✅ Cálculo automático de cuotas
- ✅ Sistema de cierres anuales
- ✅ Dashboard personalizado por rol
- ✅ Subida de comprobantes
- ✅ Reportes y análisis

## 🔧 Comandos Disponibles

```bash
# Testing
npm test              # Ejecutar todos los tests
npm run test:api      # Tests de API
npm run test:frontend # Tests de frontend
npm run test:permisos # Tests de permisos

# Desarrollo
npm run dev          # Servidor de desarrollo
npm start            # Servidor de producción
```

## 📚 Documentación

- [Configuración Inicial](docs/setup/CRUSH.md)
- [Sistema de Permisos](docs/technical/PERMISOS.md)
- [Documentación Técnica](docs/technical/)
- [Reportes del Sistema](docs/reports/)

## 🚀 Despliegue

Ver scripts en `scripts/deployment/` para automatización del despliegue.

## 🌐 Acceso al Sistema

URL: http://ec2-18-217-61-85.us-east-2.compute.amazonaws.com/

## 📞 Soporte

Para problemas o preguntas, revisar la documentación técnica en `docs/technical/`.