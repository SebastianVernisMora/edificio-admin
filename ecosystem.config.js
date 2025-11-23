module.exports = {
  apps: [{
    name: 'edificio-admin',
    script: 'src/app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/admin/.pm2/logs/edificio-admin-error.log',
    out_file: '/home/admin/.pm2/logs/edificio-admin-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
