// Controladores básicos para presupuestos

export const obtenerPresupuestos = async (req, res) => {
  res.json({ ok: true, presupuestos: [] });
};

export const obtenerPresupuesto = async (req, res) => {
  res.json({ ok: true, presupuesto: null });
};

export const crearPresupuesto = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const actualizarPresupuesto = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const eliminarPresupuesto = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const aprobarPresupuesto = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const rechazarPresupuesto = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const obtenerEstadisticas = async (req, res) => {
  res.json({ ok: true, estadisticas: {} });
};

export const obtenerAlertas = async (req, res) => {
  res.json({ ok: true, alertas: [] });
};