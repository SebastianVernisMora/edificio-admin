#!/bin/bash

###############################################################################
# MONITORING SCRIPT - Edificio Admin
# Descripción: Monitoreo en tiempo real del sistema
###############################################################################

APP_NAME="edificio-admin"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

while true; do
    clear
    
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           EDIFICIO ADMIN - SYSTEM MONITOR                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Timestamp
    echo -e "${CYAN}⏰ $(date +'%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # PM2 Status
    echo -e "${BLUE}━━━ PM2 Process ━━━${NC}"
    pm2 jlist | node -e "
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    const app = data.find(a => a.name === '$APP_NAME');
    if (app) {
        const status = app.pm2_env.status;
        const color = status === 'online' ? '\x1b[32m' : '\x1b[31m';
        console.log('Status:  ' + color + status + '\x1b[0m');
        console.log('PID:     ' + app.pid);
        console.log('Uptime:  ' + Math.floor((Date.now() - app.pm2_env.pm_uptime) / 1000 / 60) + ' minutes');
        console.log('Restart: ' + app.pm2_env.restart_time + ' times');
        console.log('Memory:  ' + Math.round(app.monit.memory / 1024 / 1024) + ' MB');
        console.log('CPU:     ' + app.monit.cpu + '%');
    } else {
        console.log('\x1b[31m✗ Process not found\x1b[0m');
    }
    " 2>/dev/null || echo -e "${RED}✗ PM2 not responding${NC}"
    echo ""
    
    # System Resources
    echo -e "${BLUE}━━━ System Resources ━━━${NC}"
    
    # CPU
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')
    echo "CPU:     $CPU_USAGE"
    
    # Memory
    MEM_INFO=$(free -h | awk 'NR==2 {print $3 " / " $2 " (" $3/$2*100 "%)"}')
    echo "Memory:  $MEM_INFO"
    
    # Disk
    DISK_INFO=$(df -h . | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')
    echo "Disk:    $DISK_INFO"
    echo ""
    
    # Network
    echo -e "${BLUE}━━━ Network ━━━${NC}"
    
    # Port 3000
    if lsof -i:3000 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Port 3000 listening"
    else
        echo -e "${RED}✗${NC} Port 3000 not listening"
    fi
    
    # HTTP Response
    HTTP_CODE=$(node -e "
    const http = require('http');
    http.get('http://localhost:3000', (res) => {
        console.log(res.statusCode);
    }).on('error', () => console.log('ERROR'));
    setTimeout(() => process.exit(0), 2000);
    " 2>/dev/null || echo "ERROR")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} HTTP response: $HTTP_CODE"
    else
        echo -e "${RED}✗${NC} HTTP response: $HTTP_CODE"
    fi
    echo ""
    
    # Database
    echo -e "${BLUE}━━━ Database ━━━${NC}"
    
    if [ -f "data.json" ]; then
        DB_SIZE=$(du -h data.json | cut -f1)
        echo -e "${GREEN}✓${NC} data.json: $DB_SIZE"
        
        # Validate JSON
        if node -e "JSON.parse(require('fs').readFileSync('data.json', 'utf8'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} JSON valid"
            
            # Count records
            USUARIOS=$(node -e "const data = JSON.parse(require('fs').readFileSync('data.json', 'utf8')); console.log(data.usuarios?.length || 0)")
            CUOTAS=$(node -e "const data = JSON.parse(require('fs').readFileSync('data.json', 'utf8')); console.log(data.cuotas?.length || 0)")
            GASTOS=$(node -e "const data = JSON.parse(require('fs').readFileSync('data.json', 'utf8')); console.log(data.gastos?.length || 0)")
            
            echo "  Usuarios: $USUARIOS"
            echo "  Cuotas:   $CUOTAS"
            echo "  Gastos:   $GASTOS"
        else
            echo -e "${RED}✗${NC} JSON invalid"
        fi
    else
        echo -e "${RED}✗${NC} data.json not found"
    fi
    echo ""
    
    # Recent Errors
    echo -e "${BLUE}━━━ Recent Activity ━━━${NC}"
    
    if [ -f "logs/edificio-admin-error.log" ]; then
        ERROR_COUNT=$(tail -50 logs/edificio-admin-error.log 2>/dev/null | grep -i "error" | wc -l)
        
        if [ "$ERROR_COUNT" -eq 0 ]; then
            echo -e "${GREEN}✓${NC} No errors (last 50 lines)"
        else
            echo -e "${YELLOW}⚠${NC} Errors found: $ERROR_COUNT (last 50 lines)"
        fi
    fi
    
    # Last log entry
    if [ -f "logs/edificio-admin-out.log" ]; then
        LAST_LOG=$(tail -1 logs/edificio-admin-out.log 2>/dev/null | cut -c1-70)
        echo "Last log: ${LAST_LOG}..."
    fi
    echo ""
    
    # Summary
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL${NC}"
    else
        echo -e "${RED}❌ ISSUES DETECTED: $ERRORS${NC}"
    fi
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Press Ctrl+C to exit | Auto-refresh in 5s..."
    
    sleep 5
done
