#!/bin/bash

###############################################################################
# HEALTH CHECK SCRIPT - Edificio Admin
# Descripción: Verificar salud del sistema
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="edificio-admin"
ERRORS=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══ $1 ═══${NC}"
}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              HEALTH CHECK - Edificio Admin                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# SYSTEM CHECKS
###############################################################################

section "System"

# Node.js
if command -v node &> /dev/null; then
    pass "Node.js installed: $(node -v)"
else
    fail "Node.js not found"
fi

# PM2
if command -v pm2 &> /dev/null; then
    pass "PM2 installed: $(pm2 -v)"
else
    fail "PM2 not found"
fi

# Disk space
FREE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
pass "Disk space available: $FREE_SPACE"

# Memory
FREE_MEM=$(free -h | awk 'NR==2 {print $7}')
pass "Memory available: $FREE_MEM"

###############################################################################
# APPLICATION CHECKS
###############################################################################

section "Application"

# PM2 process
if pm2 list | grep -q "$APP_NAME"; then
    STATUS=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(app?.pm2_env?.status || 'unknown')")
    
    if [ "$STATUS" = "online" ]; then
        pass "PM2 status: $STATUS"
        
        # Get details
        PID=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(app?.pid || 0)")
        MEM=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(Math.round((app?.monit?.memory || 0) / 1024 / 1024) + 'MB')")
        CPU=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); console.log(app?.monit?.cpu || 0)")
        UPTIME=$(pm2 jlist | node -e "const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')); const app = data.find(a => a.name === '$APP_NAME'); const uptime = app?.pm2_env?.pm_uptime; if(uptime) { const seconds = Math.floor((Date.now() - uptime) / 1000); const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); console.log(hours + 'h ' + minutes + 'm'); } else { console.log('unknown'); }")
        
        info "  PID: $PID"
        info "  Memory: $MEM"
        info "  CPU: ${CPU}%"
        info "  Uptime: $UPTIME"
    else
        fail "PM2 status: $STATUS (expected: online)"
    fi
else
    fail "PM2 process not found"
fi

# Port listening
if lsof -i:3000 &> /dev/null; then
    pass "Port 3000 listening"
else
    fail "Port 3000 not listening"
fi

# Server response
if node -e "
const http = require('http');
http.get('http://localhost:3000', (res) => {
    process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 3000);
" 2>/dev/null; then
    pass "Server responding (HTTP 200)"
else
    fail "Server not responding"
fi

###############################################################################
# FILE CHECKS
###############################################################################

section "Files"

# Critical files
[ -f "package.json" ] && pass "package.json exists" || fail "package.json missing"
[ -f "data.json" ] && pass "data.json exists" || fail "data.json missing"
[ -f "ecosystem.config.cjs" ] && pass "ecosystem.config.cjs exists" || fail "ecosystem.config.cjs missing"
[ -f "src/app.js" ] && pass "src/app.js exists" || fail "src/app.js missing"

# Build output
[ -d "dist/js/core" ] && pass "Frontend build exists" || warn "Frontend build missing (run: npm run build)"

# Database size
if [ -f "data.json" ]; then
    DB_SIZE=$(du -h data.json | cut -f1)
    info "  Database size: $DB_SIZE"
fi

###############################################################################
# API HEALTH
###############################################################################

section "API Endpoints"

# Test auth endpoint
AUTH_RESPONSE=$(node -e "
const http = require('http');
const options = { hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST' };
const req = http.request(options, (res) => { console.log(res.statusCode); });
req.on('error', () => console.log('ERROR'));
req.write(JSON.stringify({ email: 'test', password: 'test' }));
req.end();
setTimeout(() => process.exit(1), 3000);
" 2>/dev/null || echo "ERROR")

if [ "$AUTH_RESPONSE" = "400" ] || [ "$AUTH_RESPONSE" = "401" ]; then
    pass "Auth endpoint responding (code: $AUTH_RESPONSE)"
elif [ "$AUTH_RESPONSE" = "ERROR" ]; then
    fail "Auth endpoint not responding"
else
    info "  Auth endpoint response: $AUTH_RESPONSE"
fi

###############################################################################
# LOGS CHECKS
###############################################################################

section "Logs"

# Check for recent errors in logs
if [ -f "logs/edificio-admin-error.log" ]; then
    ERROR_COUNT=$(tail -100 logs/edificio-admin-error.log 2>/dev/null | grep -i "error" | wc -l)
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        warn "Recent errors in log: $ERROR_COUNT (last 100 lines)"
        info "  Check: tail logs/edificio-admin-error.log"
    else
        pass "No recent errors in log"
    fi
else
    info "  Error log file not found (may be new deployment)"
fi

# Log file sizes
if [ -d "logs" ]; then
    LOG_SIZE=$(du -sh logs/ | cut -f1)
    info "  Total log size: $LOG_SIZE"
fi

###############################################################################
# SUMMARY
###############################################################################

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ HEALTH CHECK PASSED${NC}"
    echo -e "${GREEN}   All systems operational${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}❌ HEALTH CHECK FAILED${NC}"
    echo -e "${RED}   Found $ERRORS error(s)${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

exit $EXIT_CODE
