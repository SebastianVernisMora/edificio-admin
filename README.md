# 🏢 Edificio-Admin: Sistema de Administración de Condominio

Sistema de administración para un condominio de 20 departamentos, diseñado para gestionar cuotas mensuales, gastos, presupuestos, anuncios y solicitudes.

## Características Principales

- Gestión de usuarios (administrador e inquilinos)
- Control de cuotas mensuales
- Registro y seguimiento de gastos
- Administración de fondos
- Cierres contables mensuales y anuales
- Sistema de parcialidades para proyectos 2026
- Publicación de anuncios y comunicaciones

## Tecnologías Utilizadas

- **Backend**: Node.js con Express.js
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Autenticación**: JWT (jsonwebtoken)
- **Almacenamiento**: Archivo JSON local (data.json)
- **Seguridad**: bcryptjs para hash de contraseñas

## Requisitos

- Node.js 14.x o superior
- npm 6.x o superior
- Nginx (para despliegue en producción)

## Instalación y Ejecución Local

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Navegar al directorio del proyecto
cd edificio-admin

# Instalar dependencias
npm install

# Iniciar el servidor en modo desarrollo
npm run dev

# O iniciar el servidor en modo producción
npm start
```

El servidor se ejecutará en http://localhost:3001 por defecto.

## Despliegue con Persistencia DNS

El sistema está configurado para desplegarse con persistencia DNS en un servidor EC2. La URL de acceso es:

http://ec2-18-217-61-85.us-east-2.compute.amazonaws.com/

La aplicación se ejecuta en el puerto 3000 y se ha configurado un proxy desde el puerto 80 para facilitar el acceso.

### Pasos para el Despliegue

1. **Preparar el Servidor**:
   ```bash
   # Dar permisos de ejecución al script de despliegue
   chmod +x deploy.sh
   
   # Ejecutar el script de despliegue
   ./deploy.sh
   ```

2. **Configurar Credenciales para Respaldos**:
   ```bash
   # Dar permisos de ejecución al script
   chmod +x create-backup-credentials.sh
   
   # Ejecutar el script
   ./create-backup-credentials.sh
   ```

3. **Configurar Verificación Periódica de DNS**:
   ```bash
   # Dar permisos de ejecución al script
   chmod +x setup-cron.sh
   
   # Ejecutar el script
   ./setup-cron.sh
   ```

### Características de la Persistencia DNS

- **Respaldos Automáticos**: El sistema realiza respaldos automáticos de la base de datos cada hora.
- **Verificación Periódica**: Un script cron verifica cada 15 minutos que el DNS esté funcionando correctamente.
- **Recuperación Automática**: En caso de fallo, el sistema intenta reiniciar los servicios automáticamente.
- **Acceso a Respaldos**: Los respaldos están disponibles en `/backups/` con protección por contraseña.

## Credenciales de Acceso

### Administrador
- **Email**: admin@edificio205.com
- **Password**: admin2025

### Inquilinos
- **Email**: [nombre]@edificio205.com (ej: inquilino1@edificio205.com)
- **Password**: inquilino2025 (universal para todos los inquilinos)

## Estructura del Proyecto

```
edificio-admin/
├── public/               # Archivos estáticos y frontend
│   ├── css/              # Hojas de estilo
│   ├── js/               # JavaScript del cliente
│   ├── admin.html        # Panel de administrador
│   ├── index.html        # Página de inicio/login
│   └── inquilino.html    # Panel de inquilino
├── src/                  # Código fuente del backend
│   ├── controllers/      # Controladores de la API
│   ├── middleware/       # Middleware (autenticación, etc.)
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas de la API
│   ├── app.js            # Punto de entrada de la aplicación
│   └── data.js           # Gestión de datos (JSON)
├── backups/              # Respaldos automáticos de la base de datos
├── .env                  # Variables de entorno
├── data.json             # Base de datos JSON
├── deploy.sh             # Script de despliegue
├── check-dns.sh          # Script para verificar persistencia DNS
├── nginx-edificio-admin.conf # Configuración de Nginx
└── README.md             # Documentación del proyecto
```

## Mantenimiento

### Verificar Estado del DNS
```bash
curl http://ec2-18-217-61-85.us-east-2.compute.amazonaws.com/status
```

### Reiniciar la Aplicación
```bash
pm2 restart edificio-admin
```

### Ver Logs de la Aplicación
```bash
pm2 logs edificio-admin
```

### Ver Logs de Nginx
```bash
sudo tail -f /var/log/nginx/edificio-admin-error.log
sudo tail -f /var/log/nginx/edificio-admin-access.log
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.