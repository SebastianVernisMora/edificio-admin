// Controladores básicos para solicitudes

export const obtenerSolicitudes = async (req, res) => {
  res.json({ ok: true, solicitudes: [] });
};

export const obtenerSolicitud = async (req, res) => {
  res.json({ ok: true, solicitud: null });
};

export const crearSolicitud = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const responderSolicitud = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const cambiarEstadoSolicitud = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};

export const obtenerEstadisticasSolicitudes = async (req, res) => {
  res.json({ ok: true, estadisticas: {} });
};

export const eliminarSolicitud = async (req, res) => {
  res.json({ ok: false, msg: 'Funcionalidad no implementada' });
};