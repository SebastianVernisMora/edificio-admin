/**
 * Configuración de persistencia DNS para Edificio-Admin
 * 
 * Este archivo contiene la configuración necesaria para mantener
 * la persistencia DNS en el servidor EC2.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuración del DNS
const dnsConfig = {
  domain: 'ec2-18-223-32-141.us-east-2.compute.amazonaws.com',
  port: process.env.PORT || 3001,
  publicPath: path.join(__dirname, 'public'),
  dataPath: path.join(__dirname, 'data.json'),
  backupInterval: 3600000 // 1 hora en milisegundos
};

// Función para crear respaldo de datos
const backupData = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  const backupPath = path.join(backupDir, `data-${timestamp}.json`);
  
  // Crear directorio de respaldos si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Copiar archivo de datos
  if (fs.existsSync(dnsConfig.dataPath)) {
    fs.copyFileSync(dnsConfig.dataPath, backupPath);
    console.log(`Respaldo creado: ${backupPath}`);
    
    // Eliminar respaldos antiguos (mantener solo los últimos 10)
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('data-'))
      .sort()
      .reverse();
    
    if (backups.length > 10) {
      backups.slice(10).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`Respaldo antiguo eliminado: ${file}`);
      });
    }
  }
};

// Función para verificar el estado del DNS
const checkDnsStatus = () => {
  exec(`ping -c 1 ${dnsConfig.domain}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al verificar DNS: ${error.message}`);
      return;
    }
    
    console.log(`DNS activo: ${dnsConfig.domain}`);
  });
};

// Iniciar respaldos periódicos
const startBackups = () => {
  // Realizar respaldo inicial
  backupData();
  
  // Configurar respaldos periódicos
  setInterval(backupData, dnsConfig.backupInterval);
  console.log(`Respaldos automáticos configurados cada ${dnsConfig.backupInterval / 60000} minutos`);
  
  // Verificar DNS periódicamente
  checkDnsStatus();
  setInterval(checkDnsStatus, dnsConfig.backupInterval);
};

module.exports = {
  dnsConfig,
  startBackups
};