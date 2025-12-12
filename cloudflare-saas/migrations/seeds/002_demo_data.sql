-- Datos de prueba compatibles con schema actual
-- Password hash para "Gemelo1"

-- Edificio de ejemplo
INSERT INTO edificios (id, nombre, direccion, total_departamentos, plan, activo)
VALUES ('edificio-demo-001', 'Edificio Demo 205', 'Av. Ejemplo 205, CDMX', 20, 'PREMIUM', 1);

-- Usuario admin (email: admin@edificio205.com, password: Gemelo1)
INSERT INTO usuarios (id, email, password, name, role, unit, phone, building_id, active, email_verified)
VALUES (
  'user-admin-001',
  'admin@edificio205.com',
  '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS',
  'Administrador Demo',
  'admin',
  NULL,
  '555-0100',
  'edificio-demo-001',
  1,
  1
);

-- Relación admin-edificio
INSERT INTO building_users (id, building_id, user_id, role, permissions)
VALUES ('rel-001', 'edificio-demo-001', 'user-admin-001', 'admin', '{"full_access": true}');

-- Usuarios residentes (password: Gemelo1 para todos)
INSERT INTO usuarios (id, email, password, name, role, unit, phone, building_id, active, email_verified)
VALUES 
('user-res-001', 'maria@edificio205.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'María García', 'resident', '101', '555-0101', 'edificio-demo-001', 1, 1),
('user-res-002', 'carlos@edificio205.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'Carlos López', 'resident', '102', '555-0102', 'edificio-demo-001', 1, 1),
('user-res-003', 'ana@edificio205.com', '$2a$10$aCXh3JkJcYQwAITLQoWQl.kTXFpQ8LbDyQJ2hYaGpAJlXjO1.F/eS', 'Ana Martínez', 'resident', '201', '555-0201', 'edificio-demo-001', 1, 1);

-- Relaciones residentes-edificio
INSERT INTO building_users (id, building_id, user_id, role)
VALUES 
('rel-002', 'edificio-demo-001', 'user-res-001', 'resident'),
('rel-003', 'edificio-demo-001', 'user-res-002', 'resident'),
('rel-004', 'edificio-demo-001', 'user-res-003', 'resident');

-- Fondos iniciales
INSERT INTO fondos (id, edificio_id, tipo, monto)
VALUES 
('fondo-001', 'edificio-demo-001', 'general', 50000.00),
('fondo-002', 'edificio-demo-001', 'reserva', 25000.00);

-- Cuotas de ejemplo
INSERT INTO cuotas (id, edificio_id, usuario_id, departamento, mes, anio, monto, estado, fecha_vencimiento)
VALUES 
('cuota-001', 'edificio-demo-001', 'user-res-001', '101', 'diciembre', 2025, 1200.00, 'pendiente', '2025-12-20'),
('cuota-002', 'edificio-demo-001', 'user-res-002', '102', 'diciembre', 2025, 1200.00, 'pendiente', '2025-12-20'),
('cuota-003', 'edificio-demo-001', 'user-res-003', '201', 'diciembre', 2025, 1200.00, 'pagada', '2025-12-20');

-- Gastos de ejemplo
INSERT INTO gastos (id, edificio_id, concepto, monto, categoria, fecha, proveedor, estado)
VALUES 
('gasto-001', 'edificio-demo-001', 'Reparación bomba de agua', 2500.00, 'Mantenimiento', '2025-12-01', 'Plomería Rápida SA', 'aprobado'),
('gasto-002', 'edificio-demo-001', 'Limpieza áreas comunes', 800.00, 'Limpieza', '2025-12-05', 'Limpieza Total', 'aprobado');

-- Anuncios
INSERT INTO anuncios (id, edificio_id, titulo, mensaje, prioridad, tipo, publicado_por, activo)
VALUES 
('anuncio-001', 'edificio-demo-001', 'Bienvenido al Sistema', 'Este es el sistema de administración del Edificio 205', 'alta', 'general', 'user-admin-001', 1),
('anuncio-002', 'edificio-demo-001', 'Mantenimiento programado', 'Mañana se realizará mantenimiento del tanque de agua', 'normal', 'mantenimiento', 'user-admin-001', 1);

-- Solicitudes
INSERT INTO solicitudes (id, edificio_id, usuario_id, tipo, titulo, descripcion, prioridad, estado)
VALUES 
('sol-001', 'edificio-demo-001', 'user-res-001', 'mantenimiento', 'Fuga en baño', 'Hay una fuga en el baño del departamento 101', 'alta', 'en_proceso'),
('sol-002', 'edificio-demo-001', 'user-res-002', 'queja', 'Ruido excesivo', 'Ruido en horas de la noche', 'media', 'pendiente');
