#!/bin/bash

# Sistema de Backup Comprimido para Edificio-Admin
# Fecha: 2025-11-07

set -e

# Configuración
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_ROOT="/home/admin/backups-compressed"
PROJECTS_ROOT="/home/admin"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_ROOT"

echo "🗜️ Iniciando sistema de backup comprimido..."
echo "📅 Timestamp: $TIMESTAMP"

# Función para crear backup del proyecto principal
create_main_backup() {
    echo "📦 Creando backup del proyecto principal..."
    
    local backup_name="edificio-admin-main-$TIMESTAMP"
    local temp_dir="/tmp/$backup_name"
    local final_archive="$BACKUP_ROOT/${backup_name}.tar.gz"
    
    # Crear directorio temporal
    mkdir -p "$temp_dir"
    
    # Copiar archivos importantes (excluyendo node_modules, logs, etc.)
    cp -r "$PROJECTS_ROOT/edificio-admin/" "$temp_dir/"
    
    # Eliminar directorios y archivos no deseados
    rm -rf "$temp_dir/node_modules" 2>/dev/null || true
    rm -rf "$temp_dir/logs" 2>/dev/null || true
    rm -rf "$temp_dir/.git" 2>/dev/null || true
    rm -f "$temp_dir"/*.log 2>/dev/null || true
    rm -f "$temp_dir/nohup.out" 2>/dev/null || true
    rm -f "$temp_dir/app.pid" 2>/dev/null || true
    rm -rf "$temp_dir/uploads"/* 2>/dev/null || true
    rm -rf "$temp_dir/test-reports" 2>/dev/null || true
    
    # Crear archivo comprimido
    cd "/tmp"
    tar -czf "$final_archive" "$backup_name"
    
    # Limpiar directorio temporal
    rm -rf "$temp_dir"
    
    echo "✅ Backup principal creado: $final_archive"
    ls -lh "$final_archive"
}

# Función para crear backup del proyecto de refactorización
create_refactoring_backup() {
    echo "📦 Creando backup del proyecto de refactorización..."
    
    local backup_name="edificio-admin-refactoring-$TIMESTAMP"
    local temp_dir="/tmp/$backup_name"
    local final_archive="$BACKUP_ROOT/${backup_name}.tar.gz"
    
    # Crear directorio temporal
    mkdir -p "$temp_dir"
    
    # Copiar archivos importantes
    cp -r "$PROJECTS_ROOT/edificio-admin-backup-refactoring-20251107/" "$temp_dir/"
    
    # Eliminar directorios y archivos no deseados
    rm -rf "$temp_dir/node_modules" 2>/dev/null || true
    rm -rf "$temp_dir/logs" 2>/dev/null || true
    rm -rf "$temp_dir/.git" 2>/dev/null || true
    rm -f "$temp_dir"/*.log 2>/dev/null || true
    rm -f "$temp_dir/nohup.out" 2>/dev/null || true
    rm -f "$temp_dir/app.pid" 2>/dev/null || true
    rm -rf "$temp_dir/uploads"/* 2>/dev/null || true
    rm -rf "$temp_dir/test-reports" 2>/dev/null || true
    
    # Crear archivo comprimido
    cd "/tmp"
    tar -czf "$final_archive" "$backup_name"
    
    # Limpiar directorio temporal
    rm -rf "$temp_dir"
    
    echo "✅ Backup refactoring creado: $final_archive"
    ls -lh "$final_archive"
}

# Función para migrar backups existentes
migrate_existing_backups() {
    echo "🔄 Migrando backups existentes..."
    
    # Comprimir backups de datos JSON existentes
    if [ -d "$PROJECTS_ROOT/edificio-admin/backups" ]; then
        echo "📄 Comprimiendo backups de datos JSON..."
        
        local data_backup_name="data-backups-legacy-$TIMESTAMP"
        local temp_dir="/tmp/$data_backup_name"
        local final_archive="$BACKUP_ROOT/${data_backup_name}.tar.gz"
        
        mkdir -p "$temp_dir"
        cp -r "$PROJECTS_ROOT/edificio-admin/backups"/*.json "$temp_dir/" 2>/dev/null || true
        
        if [ "$(ls -A $temp_dir)" ]; then
            cd "/tmp"
            tar -czf "$final_archive" "$data_backup_name"
            echo "✅ Backups JSON legacy comprimidos: $final_archive"
            ls -lh "$final_archive"
        else
            echo "ℹ️ No se encontraron backups JSON para comprimir"
        fi
        
        rm -rf "$temp_dir"
    fi
    
    # Comprimir backup de frontend si existe
    if [ -d "$PROJECTS_ROOT/edificio-admin/backups/frontend-backup-20251107_025433" ]; then
        echo "🎨 Comprimiendo backup de frontend..."
        
        local frontend_backup_name="frontend-backup-legacy-$TIMESTAMP"
        local temp_dir="/tmp/$frontend_backup_name"
        local final_archive="$BACKUP_ROOT/${frontend_backup_name}.tar.gz"
        
        mkdir -p "$temp_dir"
        cp -r "$PROJECTS_ROOT/edificio-admin/backups/frontend-backup-20251107_025433" "$temp_dir/"
        
        cd "/tmp"
        tar -czf "$final_archive" "$frontend_backup_name"
        
        echo "✅ Backup frontend legacy comprimido: $final_archive"
        ls -lh "$final_archive"
        
        rm -rf "$temp_dir"
    fi
}

# Función para crear backup de configuraciones importantes
create_config_backup() {
    echo "⚙️ Creando backup de configuraciones..."
    
    local config_backup_name="config-backup-$TIMESTAMP"
    local temp_dir="/tmp/$config_backup_name"
    local final_archive="$BACKUP_ROOT/${config_backup_name}.tar.gz"
    
    mkdir -p "$temp_dir"
    
    # Copiar archivos de configuración importantes
    cp "$PROJECTS_ROOT"/*.js "$temp_dir/" 2>/dev/null || true
    cp "$PROJECTS_ROOT"/*.json "$temp_dir/" 2>/dev/null || true
    cp "$PROJECTS_ROOT"/*.md "$temp_dir/" 2>/dev/null || true
    cp "$PROJECTS_ROOT"/*.sh "$temp_dir/" 2>/dev/null || true
    
    # Copiar directorios de configuración si existen
    [ -d "$PROJECTS_ROOT/src" ] && cp -r "$PROJECTS_ROOT/src" "$temp_dir/"
    
    cd "/tmp"
    tar -czf "$final_archive" "$config_backup_name"
    
    echo "✅ Backup de configuraciones creado: $final_archive"
    ls -lh "$final_archive"
    
    rm -rf "$temp_dir"
}

# Función para limpiar backups antiguos (opcional)
cleanup_old_backups() {
    echo "🧹 Limpieza de backups antiguos (manteniendo últimos 10)..."
    
    # Mantener solo los 10 backups más recientes de cada tipo
    find "$BACKUP_ROOT" -name "edificio-admin-main-*.tar.gz" -type f | sort -r | tail -n +11 | xargs -r rm -f
    find "$BACKUP_ROOT" -name "edificio-admin-refactoring-*.tar.gz" -type f | sort -r | tail -n +11 | xargs -r rm -f
    find "$BACKUP_ROOT" -name "data-backups-*.tar.gz" -type f | sort -r | tail -n +6 | xargs -r rm -f
    find "$BACKUP_ROOT" -name "config-backup-*.tar.gz" -type f | sort -r | tail -n +6 | xargs -r rm -f
    
    echo "✅ Limpieza completada"
}

# Función para crear índice de backups
create_backup_index() {
    echo "📊 Creando índice de backups..."
    
    local index_file="$BACKUP_ROOT/backup-index.txt"
    
    cat > "$index_file" << EOF
# Índice de Backups - Edificio Admin
# Generado: $(date)
# Ubicación: $BACKUP_ROOT

## Backups Disponibles:

EOF
    
    # Listar todos los backups con información
    for backup in "$BACKUP_ROOT"/*.tar.gz; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(ls -lh "$backup" | awk '{print $5}')
            local date=$(ls -l "$backup" | awk '{print $6, $7, $8}')
            
            echo "- $filename ($size) - Creado: $date" >> "$index_file"
        fi
    done
    
    cat >> "$index_file" << EOF

## Comandos de Restauración:

Para extraer un backup:
\`\`\`bash
cd /tmp
tar -xzf $BACKUP_ROOT/[nombre-del-backup].tar.gz
\`\`\`

## Estructura del Sistema de Backups:

- edificio-admin-main-[timestamp].tar.gz: Proyecto principal
- edificio-admin-refactoring-[timestamp].tar.gz: Proyecto de refactorización
- data-backups-legacy-[timestamp].tar.gz: Datos JSON históricos
- frontend-backup-legacy-[timestamp].tar.gz: Backups de frontend
- config-backup-[timestamp].tar.gz: Configuraciones del sistema

EOF
    
    echo "✅ Índice creado: $index_file"
}

# Ejecutar todas las funciones
main() {
    echo "🚀 Iniciando proceso de backup completo..."
    
    create_main_backup
    create_refactoring_backup
    migrate_existing_backups
    create_config_backup
    cleanup_old_backups
    create_backup_index
    
    echo ""
    echo "📋 Resumen de backups:"
    ls -lh "$BACKUP_ROOT"/*.tar.gz 2>/dev/null || echo "No hay archivos .tar.gz"
    
    echo ""
    echo "💾 Espacio total utilizado:"
    du -sh "$BACKUP_ROOT"
    
    echo ""
    echo "✅ ¡Sistema de backup comprimido completado!"
    echo "📂 Ubicación: $BACKUP_ROOT"
}

# Verificar si se ejecuta directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi