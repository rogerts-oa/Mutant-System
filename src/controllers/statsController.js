const { db } = require('../config/database');

/**
 * Obtener contador de afluencia en tiempo real (hoy)
 */
const getRealTimeAttendance = (req, res) => {
  const query = `
    SELECT COUNT(*) as total 
    FROM accesos 
    WHERE date(fecha_acceso) = date('now') AND resultado = 'exito'
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ attendance_today: row.total });
  });
};

/**
 * Reporte de horas pico
 */
const getPeakHours = (req, res) => {
  const query = `
    SELECT strftime('%H', fecha_acceso) as hora, COUNT(*) as total
    FROM accesos
    WHERE resultado = 'exito'
    GROUP BY hora
    ORDER BY total DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * Métricas de ingresos (Inscripciones vs Renovaciones)
 */
const getIncomeMetrics = (req, res) => {
  const query = `
    SELECT m.tipo, SUM(p.costo) as total_ingreso
    FROM membresias m
    JOIN planes p ON m.plan_id = p.id
    GROUP BY m.tipo
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const metrics = {
      inscripciones: 0,
      renovaciones: 0,
      total: 0
    };

    rows.forEach(row => {
      if (row.tipo === 'inscripcion') metrics.inscripciones = row.total_ingreso;
      if (row.tipo === 'renovacion') metrics.renovaciones = row.total_ingreso;
    });

    metrics.total = metrics.inscripciones + metrics.renovaciones;
    res.json(metrics);
  });
};

module.exports = {
  getRealTimeAttendance,
  getPeakHours,
  getIncomeMetrics
};
