const { db } = require('../config/database');

/**
 * RF-10: Contador en Tiempo Real (En vivo)
 * Entradas exitosas hoy - Salidas hoy
 */
const getLiveCount = (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' AND resultado = 'exito' THEN 1 ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'salida' THEN 1 ELSE 0 END) as salidas
    FROM accesos 
    WHERE date(fecha_acceso) = date('now')
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const en_vivo = (row.entradas || 0) - (row.salidas || 0);
    res.json({ 
      en_vivo: en_vivo < 0 ? 0 : en_vivo,
      detalles: {
        entradas: row.entradas || 0,
        salidas: row.salidas || 0
      }
    });
  });
};

/**
 * RF-11: Reporte de Afluencia (Gráficas)
 * Agrupado por día, semana o mes
 */
const getAttendanceHistory = (req, res) => {
  const { period = 'day' } = req.query; // day, week, month
  
  let timeFormat = '%Y-%m-%d';
  if (period === 'week') timeFormat = '%Y-%W';
  if (period === 'month') timeFormat = '%Y-%m';

  const query = `
    SELECT strftime('${timeFormat}', fecha_acceso) as periodo, COUNT(*) as total
    FROM accesos
    WHERE resultado = 'exito' AND tipo = 'entrada'
    GROUP BY periodo
    ORDER BY periodo ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * RF-12: Identificación de Horas Pico
 * Análisis por intervalos de 60 minutos
 */
const getPeakHours = (req, res) => {
  const query = `
    SELECT strftime('%H:00', fecha_acceso) as intervalo, COUNT(*) as ingresos
    FROM accesos
    WHERE resultado = 'exito' AND tipo = 'entrada'
    GROUP BY intervalo
    ORDER BY ingresos DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * RF-13: Métricas de Ventas (Nuevos vs Renovaciones)
 */
const getIncomeMetrics = (req, res) => {
  const query = `
    SELECT m.tipo, SUM(p.costo) as total_ingreso, COUNT(m.id) as cantidad
    FROM membresias m
    JOIN planes p ON m.plan_id = p.id
    GROUP BY m.tipo
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const metrics = {
      inscripciones: { monto: 0, cantidad: 0 },
      renovaciones: { monto: 0, cantidad: 0 },
      total_monto: 0
    };

    rows.forEach(row => {
      if (row.tipo === 'inscripcion') {
        metrics.inscripciones.monto = row.total_ingreso;
        metrics.inscripciones.cantidad = row.cantidad;
      } else if (row.tipo === 'renovacion') {
        metrics.renovaciones.monto = row.total_ingreso;
        metrics.renovaciones.cantidad = row.cantidad;
      }
    });

    metrics.total_monto = metrics.inscripciones.monto + metrics.renovaciones.monto;
    res.json(metrics);
  });
};

module.exports = {
  getLiveCount,
  getAttendanceHistory,
  getPeakHours,
  getIncomeMetrics
};
