#!/bin/bash

# Administrador de Backups Comprimidos - Edificio Admin
# Fecha: 2025-11-07

BACKUP_DIR="/home/admin/backups-compressed"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_usage() {
    echo -e "${BLUE}📦 Administrador de Backups Comprimidos - Edificio Admin${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  list       - Listar todos los backups disponibles"
    echo "  create     - Crear nuevo backup completo"
    echo "  extract    - Extraer un backup específico"
    echo "  cleanup    - Limpiar backups antiguos"
    echo "  status     - Mostrar estado del sistema de backups"
    echo "  restore    - Restaurar desde un backup específico"
    echo "  help       - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 list"
    echo "  $0 create"
    echo "  $0 extract edificio-admin-main-20251107_105555.tar.gz"
    echo ""
}

list_backups() {
    echo -e "${BLUE}📋 Listado de Backups Disponibles${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/*.tar.gz 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠️ No se encontraron backups en $BACKUP_DIR${NC}"
        return 1
    fi
    
    printf "%-45s %-10s %-20s\n" "ARCHIVO" "TAMAÑO" "FECHA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for backup in "$BACKUP_DIR"/*.tar.gz; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(ls -lh "$backup" | awk '{print $5}')
            local date=$(ls -l "$backup" | awk '{print $6, $7, $8}')
            
            # Determinar el tipo de backup por color
            if [[ "$filename" == *"main"* ]]; then
                echo -e "${GREEN}📁 %-40s${NC} %-10s %-20s" "$filename" "$size" "$date"
            elif [[ "$filename" == *"refactoring"* ]]; then
                echo -e "${BLUE}🔧 %-40s${NC} %-10s %-20s" "$filename" "$size" "$date"
            elif [[ "$filename" == *"config"* ]]; then
                echo -e "${YELLOW}⚙️  %-40s${NC} %-10s %-20s" "$filename" "$size" "$date"
            else
                echo -e "📄 %-40s %-10s %-20s" "$filename" "$size" "$date"
            fi
        fi
    done
    
    echo ""
    echo -e "💾 Espacio total utilizado: ${GREEN}$(du -sh $BACKUP_DIR | cut -f1)${NC}"
}

create_backup() {
    echo -e "${GREEN}🚀 Creando nuevo backup...${NC}"
    
    if [ -f "/home/admin/create-compressed-backup.sh" ]; then
        /home/admin/create-compressed-backup.sh
    else
        echo -e "${RED}❌ Script de backup no encontrado en /home/admin/create-compressed-backup.sh${NC}"
        return 1
    fi
}

extract_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Especifica el nombre del archivo a extraer${NC}"
        echo "Uso: $0 extract [nombre-archivo.tar.gz]"
        echo ""
        echo "Backups disponibles:"
        list_backups
        return 1
    fi
    
    local full_path="$BACKUP_DIR/$backup_file"
    
    if [ ! -f "$full_path" ]; then
        echo -e "${RED}❌ Archivo no encontrado: $backup_file${NC}"
        return 1
    fi
    
    local extract_dir="/tmp/extracted-backup-$(date +%s)"
    mkdir -p "$extract_dir"
    
    echo -e "${BLUE}📤 Extrayendo backup: $backup_file${NC}"
    echo "📂 Ubicación: $extract_dir"
    
    cd "$extract_dir"
    if tar -xzf "$full_path"; then
        echo -e "${GREEN}✅ Backup extraído correctamente en: $extract_dir${NC}"
        echo ""
        echo "Contenido:"
        ls -la "$extract_dir"
    else
        echo -e "${RED}❌ Error al extraer el backup${NC}"
        rm -rf "$extract_dir"
        return 1
    fi
}

cleanup_backups() {
    echo -e "${YELLOW}🧹 Iniciando limpieza de backups antiguos...${NC}"
    
    read -p "¿Cuántos backups de cada tipo deseas mantener? (por defecto: 5): " keep_count
    keep_count=${keep_count:-5}
    
    echo "Manteniendo los últimos $keep_count backups de cada tipo..."
    
    # Limpiar por tipos de backup
    local types=("edificio-admin-main" "edificio-admin-refactoring" "data-backups" "config-backup" "frontend-backup")
    
    for type in "${types[@]}"; do
        echo "Limpiando backups tipo: $type"
        local files_to_remove=$(find "$BACKUP_DIR" -name "${type}-*.tar.gz" -type f | sort -r | tail -n +$((keep_count + 1)))
        
        if [ -n "$files_to_remove" ]; then
            echo "$files_to_remove" | while read -r file; do
                echo "  Eliminando: $(basename "$file")"
                rm -f "$file"
            done
        else
            echo "  No hay archivos antiguos para eliminar"
        fi
    done
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
    
    # Actualizar índice
    /home/admin/create-compressed-backup.sh > /dev/null 2>&1 || true
}

show_status() {
    echo -e "${BLUE}📊 Estado del Sistema de Backups${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo "📂 Directorio de backups: $BACKUP_DIR"
    
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "📈 Estado: ${GREEN}ACTIVO${NC}"
        
        local total_backups=$(ls "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
        echo "📦 Total de backups: $total_backups"
        
        if [ $total_backups -gt 0 ]; then
            local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
            echo "💾 Espacio utilizado: $total_size"
            
            local newest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
            if [ -n "$newest_backup" ]; then
                local newest_date=$(ls -l "$newest_backup" | awk '{print $6, $7, $8}')
                echo "🕒 Último backup: $(basename "$newest_backup") ($newest_date)"
            fi
        fi
        
        echo ""
        echo "Tipos de backup disponibles:"
        
        local main_count=$(ls "$BACKUP_DIR"/edificio-admin-main-*.tar.gz 2>/dev/null | wc -l)
        local refact_count=$(ls "$BACKUP_DIR"/edificio-admin-refactoring-*.tar.gz 2>/dev/null | wc -l)
        local config_count=$(ls "$BACKUP_DIR"/config-backup-*.tar.gz 2>/dev/null | wc -l)
        local data_count=$(ls "$BACKUP_DIR"/data-backups-*.tar.gz 2>/dev/null | wc -l)
        
        echo "  📁 Proyecto Principal: $main_count backups"
        echo "  🔧 Refactorización: $refact_count backups"
        echo "  ⚙️  Configuraciones: $config_count backups"
        echo "  📄 Datos Legacy: $data_count backups"
        
    else
        echo -e "📈 Estado: ${RED}INACTIVO${NC} (directorio no existe)"
    fi
    
    echo ""
    
    # Verificar scripts de backup
    if [ -f "/home/admin/create-compressed-backup.sh" ]; then
        echo -e "🔧 Script de backup: ${GREEN}DISPONIBLE${NC}"
    else
        echo -e "🔧 Script de backup: ${RED}NO ENCONTRADO${NC}"
    fi
    
    # Verificar espacio en disco
    local available_space=$(df -h /home/admin | awk 'NR==2{print $4}')
    echo "💽 Espacio disponible: $available_space"
}

restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo -e "${YELLOW}📋 Backups disponibles para restaurar:${NC}"
        list_backups
        echo ""
        read -p "Ingresa el nombre del backup a restaurar: " backup_file
    fi
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ No se especificó un backup válido${NC}"
        return 1
    fi
    
    local full_path="$BACKUP_DIR/$backup_file"
    
    if [ ! -f "$full_path" ]; then
        echo -e "${RED}❌ Archivo no encontrado: $backup_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}⚠️  ADVERTENCIA: La restauración sobrescribirá archivos existentes${NC}"
    echo "Backup a restaurar: $backup_file"
    echo ""
    read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirm
    
    if [ "$confirm" != "SI" ]; then
        echo -e "${YELLOW}❌ Restauración cancelada${NC}"
        return 1
    fi
    
    # Crear backup de seguridad antes de restaurar
    echo -e "${BLUE}📦 Creando backup de seguridad antes de restaurar...${NC}"
    create_backup
    
    # Extraer y restaurar
    local restore_dir="/tmp/restore-$(date +%s)"
    mkdir -p "$restore_dir"
    
    echo -e "${BLUE}📤 Extrayendo backup para restauración...${NC}"
    cd "$restore_dir"
    
    if tar -xzf "$full_path"; then
        echo -e "${GREEN}✅ Backup extraído correctamente${NC}"
        echo ""
        echo "Contenido extraído en: $restore_dir"
        ls -la "$restore_dir"
        echo ""
        echo -e "${YELLOW}🔧 Para completar la restauración, copia manualmente los archivos necesarios desde $restore_dir${NC}"
    else
        echo -e "${RED}❌ Error al extraer el backup${NC}"
        rm -rf "$restore_dir"
        return 1
    fi
}

# Función principal
main() {
    case "$1" in
        "list")
            list_backups
            ;;
        "create")
            create_backup
            ;;
        "extract")
            extract_backup "$2"
            ;;
        "cleanup")
            cleanup_backups
            ;;
        "status")
            show_status
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "help"|"")
            show_usage
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $1${NC}"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Verificar que el directorio de backups existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}⚠️ Directorio de backups no existe. Creando...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Ejecutar función principal con argumentos
main "$@"