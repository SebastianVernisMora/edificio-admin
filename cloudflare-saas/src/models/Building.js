/**
 * Building/Condominium model for D1 database
 */

export default class Building {
  /**
   * Crear un nuevo edificio/condominio
   */
  static async create(db, buildingData) {
    const { name, address, units, owner_id, subscription_id, subscription_status, logo_url, custom_domain } = buildingData;
    
    try {
      // Insertar el edificio en la base de datos
      const result = await db.prepare(`
        INSERT INTO edificios (
          name, address, units, owner_id, 
          subscription_id, subscription_status, 
          logo_url, custom_domain, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        name, 
        address, 
        units, 
        owner_id, 
        subscription_id || null, 
        subscription_status || 'pending', 
        logo_url || null, 
        custom_domain || null
      )
      .run();
      
      if (!result.success) {
        throw new Error('Error al crear el edificio');
      }
      
      // Obtener el ID del edificio recién insertado
      const buildingId = result.meta?.last_row_id;
      
      // Configurar ajustes por defecto para el edificio
      await db.prepare(`
        INSERT INTO notification_settings (
          building_id, email_enabled, payment_notifications, 
          maintenance_notifications, announcement_notifications
        ) VALUES (?, 1, 1, 1, 1)
      `)
      .bind(buildingId)
      .run();
      
      // Obtener el edificio completo
      return await Building.getById(db, buildingId);
    } catch (error) {
      console.error('Error al crear edificio:', error);
      throw error;
    }
  }
  
  /**
   * Obtener un edificio por ID
   */
  static async getById(db, id) {
    try {
      const building = await db.prepare(`
        SELECT * FROM edificios WHERE id = ?
      `)
      .bind(id)
      .first();
      
      if (!building) {
        return null;
      }
      
      // Si tiene configuración en formato JSON, convertirla a objeto
      if (building.settings) {
        try {
          building.settings = JSON.parse(building.settings);
        } catch (e) {
          building.settings = {};
        }
      } else {
        building.settings = {};
      }
      
      return building;
    } catch (error) {
      console.error('Error al obtener edificio por ID:', error);
      throw error;
    }
  }
  
  /**
   * Listar edificios, con opción de filtrar por propietario
   */
  static async list(db, { owner_id = null, limit = 100, offset = 0 } = {}) {
    try {
      let query = `
        SELECT 
          b.*,
          (SELECT COUNT(*) FROM building_users WHERE building_id = b.id) as total_users
        FROM edificios b
      `;
      
      const bindings = [];
      
      // Filtrar por propietario si se proporciona
      if (owner_id) {
        query += ' WHERE owner_id = ?';
        bindings.push(owner_id);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      bindings.push(limit, offset);
      
      const buildings = await db.prepare(query)
        .bind(...bindings)
        .all();
      
      return buildings.results || [];
    } catch (error) {
      console.error('Error al listar edificios:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar un edificio
   */
  static async update(db, id, updates) {
    // Campos permitidos para actualizar
    const allowedFields = [
      'name', 'address', 'units', 'subscription_id', 
      'subscription_status', 'settings', 'logo_url', 'custom_domain'
    ];
    
    // Filtrar solo los campos permitidos
    const validUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
    
    // Si no hay campos válidos para actualizar, retornar error
    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }
    
    // Convertir settings a JSON si es un objeto
    if (validUpdates.settings && typeof validUpdates.settings === 'object') {
      validUpdates.settings = JSON.stringify(validUpdates.settings);
    }
    
    try {
      // Construir la consulta SQL de actualización
      const setClause = Object.keys(validUpdates)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const query = `
        UPDATE edificios 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `;
      
      // Valores para la consulta
      const values = [
        ...Object.values(validUpdates),
        id
      ];
      
      // Ejecutar la actualización
      const result = await db.prepare(query)
        .bind(...values)
        .run();
      
      if (!result.success) {
        throw new Error('Error al actualizar el edificio');
      }
      
      // Retornar el edificio actualizado
      return await Building.getById(db, id);
    } catch (error) {
      console.error('Error al actualizar edificio:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar un edificio
   */
  static async delete(db, id) {
    try {
      // Verificar que el edificio existe
      const building = await Building.getById(db, id);
      if (!building) {
        throw new Error('Edificio no encontrado');
      }
      
      // Eliminar el edificio (la eliminación en cascada se maneja por restricciones de clave foránea)
      const result = await db.prepare(`
        DELETE FROM edificios WHERE id = ?
      `)
      .bind(id)
      .run();
      
      return result.success;
    } catch (error) {
      console.error('Error al eliminar edificio:', error);
      throw error;
    }
  }
  
  /**
   * Obtener estadísticas de un edificio
   */
  static async getStats(db, id) {
    try {
      // Verificar que el edificio existe
      const building = await Building.getById(db, id);
      if (!building) {
        throw new Error('Edificio no encontrado');
      }
      
      // Obtener estadísticas de usuarios
      const usersStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN role = 'committee' THEN 1 ELSE 0 END) as committee,
          SUM(CASE WHEN role = 'resident' THEN 1 ELSE 0 END) as residents
        FROM building_users
        WHERE building_id = ?
      `)
      .bind(id)
      .first();
      
      // Obtener estadísticas de cuotas
      const feesStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
          SUM(amount) as total_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
        FROM fees
        WHERE building_id = ?
      `)
      .bind(id)
      .first();
      
      // Obtener estadísticas de gastos
      const expensesStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(amount) as total_amount,
          MAX(date) as last_expense_date
        FROM expenses
        WHERE building_id = ?
      `)
      .bind(id)
      .first();
      
      return {
        building: {
          id: building.id,
          name: building.name,
          units: building.units
        },
        users: usersStats || { total: 0, admins: 0, committee: 0, residents: 0 },
        fees: feesStats || { total: 0, paid: 0, pending: 0, late: 0, total_amount: 0, paid_amount: 0 },
        expenses: expensesStats || { total: 0, total_amount: 0, last_expense_date: null }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del edificio:', error);
      throw error;
    }
  }
}