#!/bin/bash

# Script para configurar webhook que escucha PRs fusionados
# Alternativa simple a GitHub Actions

echo "🔧 Configurando webhook para auto-despliegue..."

# Crear servicio que escuche webhook de GitHub
cat > webhook-listener.js << 'EOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'edificio-webhook-secret';

function verifySignature(signature, body, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const hash = 'sha256=' + hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => body += chunk);
        
        req.on('end', () => {
            try {
                const signature = req.headers['x-hub-signature-256'];
                
                if (!verifySignature(signature, body, SECRET)) {
                    res.writeHead(401);
                    res.end('Unauthorized');
                    return;
                }
                
                const payload = JSON.parse(body);
                
                // Detectar PR fusionado o push a master
                if ((payload.action === 'closed' && payload.pull_request?.merged) || 
                    (payload.ref === 'refs/heads/master' && payload.commits)) {
                    
                    console.log('🎯 PR fusionado o push detectado, iniciando despliegue...');
                    
                    exec('./auto-deploy.sh', (error, stdout, stderr) => {
                        if (error) {
                            console.error('❌ Error en despliegue:', error);
                        } else {
                            console.log('✅ Despliegue exitoso');
                            console.log(stdout);
                        }
                    });
                }
                
                res.writeHead(200);
                res.end('OK');
            } catch (error) {
                console.error('Error procesando webhook:', error);
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🎣 Webhook listener activo en puerto ${PORT}`);
    console.log(`📡 URL: http://tu-servidor:${PORT}/webhook`);
});
EOF

echo "✅ Webhook listener creado"
echo "📋 Pasos siguientes:"
echo "1. Configurar SECRET en GitHub: WEBHOOK_SECRET=edificio-webhook-secret"
echo "2. Agregar webhook en GitHub repo -> Settings -> Webhooks"
echo "3. URL: http://tu-servidor-ip:9000/webhook"
echo "4. Events: Pull requests, Pushes"
echo "5. Ejecutar: node webhook-listener.js &"