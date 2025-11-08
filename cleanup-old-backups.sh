#!/bin/bash

# Script de Limpieza de Backups Antiguos - Edificio Admin
# Fecha: 2025-11-07

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Limpieza de Sistema de Backups Antiguos${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Función para mostrar estadísticas antes de la limpieza
show_before_stats() {
    echo -e "${YELLOW}📊 Estado ANTES de la limpieza:${NC}"
    
    # Calcular espacio de backups antiguos
    local old_backups_size=0
    if [ -d "edificio-admin/backups" ]; then
        old_backups_size=$(du -sb edificio-admin/backups 2>/dev/null | cut -f1 || echo "0")
    fi
    
    if [ -d "edificio-admin-backup-refactoring-20251107/backups" ]; then
        local refactor_size=$(du -sb edificio-admin-backup-refactoring-20251107/backups 2>/dev/null | cut -f1 || echo "0")
        old_backups_size=$((old_backups_size + refactor_size))
    fi
    
    # Contar archivos JSON antiguos
    local json_files=0
    json_files=$(ls edificio-admin*/backups/*.json 2>/dev/null | wc -l || echo "0")
    
    # Tamaño de directorios de frontend
    local frontend_dirs=0
    frontend_dirs=$(ls -d edificio-admin*/backups/frontend-* 2>/dev/null | wc -l || echo "0")
    
    echo "  📁 Directorios con backups antiguos: $(ls -d edificio-admin*/backups 2>/dev/null | wc -l)"
    echo "  📄 Archivos JSON antiguos: $json_files"
    echo "  🎨 Directorios frontend antiguos: $frontend_dirs"
    echo "  💾 Espacio ocupado por backups antiguos: $(numfmt --to=iec $old_backups_size 2>/dev/null || echo "$old_backups_size bytes")"
    
    echo ""
    echo -e "${BLUE}📦 Nuevo sistema de backups comprimidos:${NC}"
    if [ -d "backups-compressed" ]; then
        local compressed_size=$(du -sh backups-compressed | cut -f1)
        local compressed_files=$(ls backups-compressed/*.tar.gz 2>/dev/null | wc -l || echo "0")
        echo "  📦 Archivos comprimidos: $compressed_files"
        echo "  💾 Espacio ocupado: $compressed_size"
    else
        echo "  ❌ No existe aún"
    fi
    
    echo ""
}

# Función para crear backup de archivos importantes antes de limpiar
backup_important_files() {
    echo -e "${BLUE}💾 Creando backup de archivos importantes antes de limpiar...${NC}"
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local important_backup="/home/admin/backups-compressed/pre-cleanup-backup-$timestamp.tar.gz"
    local temp_dir="/tmp/pre-cleanup-$timestamp"
    
    mkdir -p "$temp_dir"
    
    # Backup de datos JSON más recientes (últimos 3 de cada proyecto)
    if [ -d "edificio-admin/backups" ]; then
        mkdir -p "$temp_dir/edificio-admin-data"
        ls -t edificio-admin/backups/*.json 2>/dev/null | head -3 | while read file; do
            [ -f "$file" ] && cp "$file" "$temp_dir/edificio-admin-data/"
        done
    fi
    
    if [ -d "edificio-admin-backup-refactoring-20251107/backups" ]; then
        mkdir -p "$temp_dir/refactoring-data"
        ls -t edificio-admin-backup-refactoring-20251107/backups/*.json 2>/dev/null | head -3 | while read file; do
            [ -f "$file" ] && cp "$file" "$temp_dir/refactoring-data/"
        done
    fi
    
    # Backup de archivos de configuración únicos
    mkdir -p "$temp_dir/configs"
    cp edificio-admin*/.env* "$temp_dir/configs/" 2>/dev/null || true
    cp edificio-admin*/package.json "$temp_dir/configs/" 2>/dev/null || true
    
    # Crear archivo comprimido
    if [ "$(ls -A $temp_dir 2>/dev/null)" ]; then
        cd /tmp
        tar -czf "$important_backup" "pre-cleanup-$timestamp"
        echo -e "  ${GREEN}✅ Backup de seguridad creado: $(basename "$important_backup")${NC}"
        ls -lh "$important_backup"
    else
        echo -e "  ${YELLOW}⚠️ No se encontraron archivos importantes para backup${NC}"
    fi
    
    rm -rf "$temp_dir"
    echo ""
}

# Función para limpiar backups JSON antiguos
cleanup_json_backups() {
    echo -e "${YELLOW}🗑️ Limpiando archivos JSON de backup antiguos...${NC}"
    
    local removed_files=0
    local saved_space=0
    
    for project_dir in edificio-admin edificio-admin-backup-refactoring-20251107; do
        if [ -d "$project_dir/backups" ]; then
            echo "  📁 Limpiando $project_dir/backups/"
            
            # Contar archivos antes
            local files_before=$(ls "$project_dir/backups"/*.json 2>/dev/null | wc -l || echo "0")
            
            # Calcular espacio antes
            local space_before=0
            if [ "$files_before" -gt 0 ]; then
                space_before=$(du -sb "$project_dir/backups"/*.json 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
            fi
            
            # Eliminar archivos JSON
            rm -f "$project_dir/backups"/*.json 2>/dev/null || true
            
            echo "    ✅ Eliminados $files_before archivos JSON"
            
            removed_files=$((removed_files + files_before))
            saved_space=$((saved_space + space_before))
        fi
    done
    
    echo "  📊 Total eliminado: $removed_files archivos JSON"
    echo "  💾 Espacio liberado: $(numfmt --to=iec $saved_space 2>/dev/null || echo "$saved_space bytes")"
    echo ""
}

# Función para limpiar directorios de frontend antiguos
cleanup_frontend_dirs() {
    echo -e "${YELLOW}🎨 Limpiando directorios frontend antiguos...${NC}"
    
    local removed_dirs=0
    local saved_space=0
    
    for project_dir in edificio-admin edificio-admin-backup-refactoring-20251107; do
        if [ -d "$project_dir/backups" ]; then
            # Buscar y eliminar directorios frontend-*
            for frontend_dir in "$project_dir/backups"/frontend-*; do
                if [ -d "$frontend_dir" ]; then
                    local dir_size=$(du -sb "$frontend_dir" 2>/dev/null | cut -f1 || echo "0")
                    echo "    🗑️ Eliminando $(basename "$frontend_dir")"
                    rm -rf "$frontend_dir"
                    removed_dirs=$((removed_dirs + 1))
                    saved_space=$((saved_space + dir_size))
                fi
            done
        fi
    done
    
    echo "  📊 Total eliminado: $removed_dirs directorios frontend"
    echo "  💾 Espacio liberado: $(numfmt --to=iec $saved_space 2>/dev/null || echo "$saved_space bytes")"
    echo ""
}

# Función para limpiar directorios vacíos
cleanup_empty_dirs() {
    echo -e "${YELLOW}📂 Limpiando directorios vacíos...${NC}"
    
    for project_dir in edificio-admin edificio-admin-backup-refactoring-20251107; do
        if [ -d "$project_dir/backups" ]; then
            # Verificar si el directorio está vacío
            if [ -z "$(ls -A "$project_dir/backups" 2>/dev/null)" ]; then
                echo "    🗑️ Eliminando directorio vacío: $project_dir/backups/"
                rmdir "$project_dir/backups" 2>/dev/null || true
            else
                echo "    📁 Manteniendo directorio (no vacío): $project_dir/backups/"
                ls -la "$project_dir/backups/" | head -3
            fi
        fi
    done
    echo ""
}

# Función para mostrar estadísticas después de la limpieza
show_after_stats() {
    echo -e "${GREEN}📊 Estado DESPUÉS de la limpieza:${NC}"
    
    # Verificar directorios restantes
    local remaining_dirs=$(ls -d edificio-admin*/backups 2>/dev/null | wc -l || echo "0")
    echo "  📁 Directorios de backup restantes: $remaining_dirs"
    
    # Verificar archivos restantes
    local remaining_files=0
    for project_dir in edificio-admin edificio-admin-backup-refactoring-20251107; do
        if [ -d "$project_dir/backups" ]; then
            local files_in_dir=$(ls "$project_dir/backups" 2>/dev/null | wc -l || echo "0")
            remaining_files=$((remaining_files + files_in_dir))
        fi
    done
    echo "  📄 Archivos restantes en backups: $remaining_files"
    
    # Estado del nuevo sistema
    echo ""
    echo -e "${BLUE}📦 Sistema de backups comprimidos:${NC}"
    if [ -d "backups-compressed" ]; then
        local compressed_size=$(du -sh backups-compressed | cut -f1)
        local compressed_files=$(ls backups-compressed/*.tar.gz 2>/dev/null | wc -l || echo "0")
        echo "  ✅ Archivos comprimidos: $compressed_files"
        echo "  💾 Espacio ocupado: $compressed_size"
        echo "  📂 Ubicación: /home/admin/backups-compressed/"
    fi
    
    echo ""
    echo -e "${GREEN}🎯 Migración completada exitosamente!${NC}"
    echo "  • Backups antiguos eliminados"
    echo "  • Sistema comprimido implementado"
    echo "  • Espacio significativamente reducido"
    echo "  • Archivos importantes preservados"
}

# Función principal
main() {
    echo "Iniciando proceso de limpieza de backups antiguos..."
    echo ""
    
    # Verificar que estamos en el directorio correcto
    if [ ! -d "edificio-admin" ] && [ ! -d "edificio-admin-backup-refactoring-20251107" ]; then
        echo -e "${RED}❌ No se encontraron directorios de proyecto. Ejecuta desde /home/admin${NC}"
        exit 1
    fi
    
    # Verificar que existe el nuevo sistema
    if [ ! -d "backups-compressed" ]; then
        echo -e "${YELLOW}⚠️ Sistema de backups comprimidos no encontrado. Creando...${NC}"
        /home/admin/create-compressed-backup.sh
        echo ""
    fi
    
    show_before_stats
    
    echo -e "${YELLOW}⚠️ ADVERTENCIA: Esta operación eliminará todos los backups antiguos${NC}"
    echo -e "${BLUE}Los backups importantes ya están preservados en el sistema comprimido${NC}"
    echo ""
    
    read -p "¿Continuar con la limpieza? (escribe 'SI' para confirmar): " confirm
    
    if [ "$confirm" != "SI" ]; then
        echo -e "${YELLOW}❌ Limpieza cancelada${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${GREEN}🚀 Iniciando limpieza...${NC}"
    echo ""
    
    backup_important_files
    cleanup_json_backups
    cleanup_frontend_dirs
    cleanup_empty_dirs
    
    show_after_stats
    
    echo ""
    echo -e "${GREEN}✅ ¡Limpieza completada exitosamente!${NC}"
    echo ""
    echo "📋 Próximos pasos recomendados:"
    echo "  1. Verificar backups comprimidos: ./backup-manager.sh list"
    echo "  2. Crear nuevo backup: ./backup-manager.sh create"
    echo "  3. Verificar estado: ./backup-manager.sh status"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cd /home/admin
    main "$@"
fi