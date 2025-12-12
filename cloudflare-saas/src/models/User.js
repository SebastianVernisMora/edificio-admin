/**
 * User model for D1 database
 */

export default class User {
  /**
   * Crear un nuevo usuario
   */
  static async create(db, userData) {
    const { name, email, password, role, unit, phone, building_id, permissions } = userData;
    
    try {
      // Verificar si el email ya existe
      const existingUser = await User.getByEmail(db, email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
      
      // Generar hash de la contraseña
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generar token de verificación
      const crypto = await import('crypto');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Crear el usuario en la base de datos
      const result = await db.prepare(`
        INSERT INTO usuarios (
          name, email, password, role, 
          unit, phone, verification_token, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        name,
        email.toLowerCase(),
        hashedPassword,
        role || 'resident',
        unit || null,
        phone || null,
        verificationToken
      )
      .run();
      
      if (!result.success) {
        throw new Error('Error al crear el usuario');
      }
      
      // Obtener el ID del usuario recién insertado
      const userId = result.meta?.last_row_id;
      
      // Si se proporcionó un ID de edificio, asociar el usuario al edificio
      if (building_id) {
        // Convertir permisos a JSON si es necesario
        const permissionsJSON = permissions ? JSON.stringify(permissions) : null;
        
        await db.prepare(`
          INSERT INTO building_users (
            building_id, user_id, role, permissions, created_at
          ) VALUES (?, ?, ?, ?, datetime('now'))
        `)
        .bind(
          building_id,
          userId,
          role || 'resident',
          permissionsJSON
        )
        .run();
      }
      
      // Obtener el usuario completo (sin la contraseña)
      const user = await User.getById(db, userId);
      
      return {
        ...user,
        verification_token: verificationToken // Incluir token de verificación para enviar por email
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
  
  /**
   * Obtener un usuario por ID
   */
  static async getById(db, id) {
    try {
      const user = await db.prepare(`
        SELECT 
          id, name, email, role, unit, phone,
          created_at, updated_at, last_login,
          email_verified, active
        FROM usuarios 
        WHERE id = ?
      `)
      .bind(id)
      .first();
      
      if (!user) {
        return null;
      }
      
      // Obtener los edificios asociados al usuario
      const buildings = await db.prepare(`
        SELECT 
          bu.building_id, bu.role, bu.permissions,
          b.nombre as building_name
        FROM building_users bu
        JOIN edificios b ON bu.building_id = b.id
        WHERE bu.user_id = ?
      `)
      .bind(id)
      .all();
      
      user.buildings = buildings.results || [];
      
      // Parsear los permisos JSON
      user.buildings = user.buildings.map(b => {
        if (b.permissions) {
          try {
            b.permissions = JSON.parse(b.permissions);
          } catch (e) {
            b.permissions = {};
          }
        } else {
          b.permissions = {};
        }
        return b;
      });
      
      return user;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }
  
  /**
   * Obtener un usuario por email
   */
  static async getByEmail(db, email) {
    try {
      const user = await db.prepare(`
        SELECT * FROM usuarios WHERE email = ?
      `)
      .bind(email.toLowerCase())
      .first();
      
      return user || null;
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw error;
    }
  }
  
  /**
   * Verificar credenciales de usuario
   */
  static async verifyCredentials(db, email, password) {
    try {
      const user = await db.prepare(`
        SELECT * FROM usuarios WHERE email = ? AND active = 1
      `)
      .bind(email.toLowerCase())
      .first();
      
      if (!user) {
        return null;
      }
      
      // Verificar contraseña
      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return null;
      }
      
      // Actualizar última fecha de inicio de sesión
      await db.prepare(`
        UPDATE usuarios SET last_login = datetime('now') WHERE id = ?
      `)
      .bind(user.id)
      .run();
      
      // Devolver usuario sin contraseña
      const { password: _, verification_token: __, reset_token: ___, ...userWithoutSensitiveData } = user;
      
      // Obtener edificios asociados
      const buildings = await db.prepare(`
        SELECT 
          bu.building_id, bu.role, bu.permissions,
          b.nombre as building_name
        FROM building_users bu
        JOIN edificios b ON bu.building_id = b.id
        WHERE bu.user_id = ?
      `)
      .bind(user.id)
      .all();
      
      userWithoutSensitiveData.buildings = buildings.results || [];
      
      // Parsear los permisos JSON
      userWithoutSensitiveData.buildings = userWithoutSensitiveData.buildings.map(b => {
        if (b.permissions) {
          try {
            b.permissions = JSON.parse(b.permissions);
          } catch (e) {
            b.permissions = {};
          }
        } else {
          b.permissions = {};
        }
        return b;
      });
      
      return userWithoutSensitiveData;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  }
  
  /**
   * Listar usuarios por edificio
   */
  static async listByBuilding(db, buildingId, { role = null, limit = 100, offset = 0 } = {}) {
    try {
      let query = `
        SELECT 
          u.id, u.name, u.email, u.role as global_role, 
          u.unit, u.phone, u.created_at, u.updated_at,
          u.last_login, u.email_verified, u.active,
          bu.role, bu.permissions
        FROM building_users bu
        JOIN usuarios u ON bu.user_id = u.id
        WHERE bu.building_id = ?
      `;
      
      const bindings = [buildingId];
      
      // Filtrar por rol si se proporciona
      if (role) {
        query += ' AND bu.role = ?';
        bindings.push(role);
      }
      
      query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
      bindings.push(limit, offset);
      
      const result = await db.prepare(query)
        .bind(...bindings)
        .all();
      
      // Parsear los permisos JSON para cada usuario
      return (result.results || []).map(user => {
        if (user.permissions) {
          try {
            user.permissions = JSON.parse(user.permissions);
          } catch (e) {
            user.permissions = {};
          }
        } else {
          user.permissions = {};
        }
        return user;
      });
    } catch (error) {
      console.error('Error al listar usuarios por edificio:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar un usuario
   */
  static async update(db, id, updates) {
    // Campos permitidos para actualizar
    const allowedFields = ['name', 'email', 'role', 'unit', 'phone', 'active'];
    
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
    
    // Si se va a actualizar el email, verificar que no exista ya
    if (validUpdates.email) {
      const existingUser = await User.getByEmail(db, validUpdates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('El email ya está registrado por otro usuario');
      }
      validUpdates.email = validUpdates.email.toLowerCase();
    }
    
    try {
      // Construir la consulta SQL de actualización
      const setClause = Object.keys(validUpdates)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const query = `
        UPDATE usuarios 
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
        throw new Error('Error al actualizar el usuario');
      }
      
      // Actualizar relación con edificio si se proporcionan building_id, role o permissions
      if (updates.building_id && (updates.building_role || updates.permissions)) {
        // Verificar si ya existe la relación
        const buildingUser = await db.prepare(`
          SELECT * FROM building_users 
          WHERE building_id = ? AND user_id = ?
        `)
        .bind(updates.building_id, id)
        .first();
        
        const permissionsJSON = updates.permissions ? JSON.stringify(updates.permissions) : null;
        
        if (buildingUser) {
          // Actualizar relación existente
          await db.prepare(`
            UPDATE building_users 
            SET role = ?, permissions = ?
            WHERE building_id = ? AND user_id = ?
          `)
          .bind(
            updates.building_role || buildingUser.role,
            permissionsJSON,
            updates.building_id,
            id
          )
          .run();
        } else {
          // Crear nueva relación
          await db.prepare(`
            INSERT INTO building_users (
              building_id, user_id, role, permissions, created_at
            ) VALUES (?, ?, ?, ?, datetime('now'))
          `)
          .bind(
            updates.building_id,
            id,
            updates.building_role || 'resident',
            permissionsJSON
          )
          .run();
        }
      }
      
      // Retornar el usuario actualizado
      return await User.getById(db, id);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }
  
  /**
   * Cambiar contraseña de usuario
   */
  static async changePassword(db, id, newPassword) {
    try {
      // Generar hash de la nueva contraseña
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Actualizar la contraseña en la base de datos
      const result = await db.prepare(`
        UPDATE usuarios 
        SET password = ?, updated_at = datetime('now'),
            reset_token = NULL, reset_token_expires = NULL
        WHERE id = ?
      `)
      .bind(hashedPassword, id)
      .run();
      
      return result.success;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar un usuario de un edificio
   */
  static async removeFromBuilding(db, userId, buildingId) {
    try {
      // Verificar que la relación existe
      const buildingUser = await db.prepare(`
        SELECT * FROM building_users 
        WHERE building_id = ? AND user_id = ?
      `)
      .bind(buildingId, userId)
      .first();
      
      if (!buildingUser) {
        throw new Error('El usuario no pertenece a este edificio');
      }
      
      // Eliminar la relación
      const result = await db.prepare(`
        DELETE FROM building_users 
        WHERE building_id = ? AND user_id = ?
      `)
      .bind(buildingId, userId)
      .run();
      
      // Verificar si el usuario pertenece a otros edificios
      const otherBuildings = await db.prepare(`
        SELECT COUNT(*) as count FROM building_users 
        WHERE user_id = ?
      `)
      .bind(userId)
      .first();
      
      // Si no pertenece a otros edificios, desactivarlo
      if (otherBuildings.count === 0) {
        await db.prepare(`
          UPDATE usuarios SET active = 0, updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(userId)
        .run();
      }
      
      return result.success;
    } catch (error) {
      console.error('Error al eliminar usuario del edificio:', error);
      throw error;
    }
  }
  
  /**
   * Solicitar restablecimiento de contraseña
   */
  static async requestPasswordReset(db, email) {
    try {
      const user = await User.getByEmail(db, email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Generar token de restablecimiento
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Establecer fecha de expiración (24 horas)
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 24);
      
      // Actualizar el token en la base de datos
      const result = await db.prepare(`
        UPDATE usuarios 
        SET reset_token = ?, reset_token_expires = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(resetToken, expiration.toISOString(), user.id)
      .run();
      
      return {
        success: result.success,
        email: user.email,
        resetToken,
        expiration: expiration.toISOString()
      };
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  }
  
  /**
   * Verificar token de restablecimiento de contraseña
   */
  static async verifyResetToken(db, token) {
    try {
      const user = await db.prepare(`
        SELECT id, email FROM usuarios 
        WHERE reset_token = ? AND reset_token_expires > datetime('now')
      `)
      .bind(token)
      .first();
      
      return user || null;
    } catch (error) {
      console.error('Error al verificar token de restablecimiento:', error);
      throw error;
    }
  }
  
  /**
   * Verificar email de usuario
   */
  static async verifyEmail(db, token) {
    try {
      // Verificar si el token es válido
      const user = await db.prepare(`
        SELECT id FROM usuarios 
        WHERE verification_token = ? AND email_verified = 0
      `)
      .bind(token)
      .first();
      
      if (!user) {
        throw new Error('Token de verificación inválido o ya utilizado');
      }
      
      // Marcar email como verificado
      const result = await db.prepare(`
        UPDATE usuarios 
        SET email_verified = 1, verification_token = NULL, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(user.id)
      .run();
      
      return result.success;
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  }
}