module.exports = {
  apps: [{
    name: 'edificio-admin',
    script: './src/app.js',
    cwd: '/home/admin/edificio-admin-production',
    
    // Configuración de producción
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Configuración de PM2
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M',
    
    // Logs
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Reinicio automático
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Configuración de cluster (si se necesita)
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
};