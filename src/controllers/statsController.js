const { db } = require('../config/database');

/**
 * RF-10: Contador en Tiempo Real (En vivo) con Timezone México
 */
const getLiveCount = (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' AND resultado = 'exito' AND date(fecha_acceso, 'localtime') = date('now', 'localtime') THEN 1 ELSE 0 END) as hoy,
      SUM(CASE WHEN tipo = 'entrada' AND resultado = 'exito' AND date(fecha_acceso, 'localtime') = date('now', 'localtime', '-1 day') THEN 1 ELSE 0 END) as ayer,
      SUM(CASE WHEN tipo = 'salida' AND date(fecha_acceso, 'localtime') = date('now', 'localtime') THEN 1 ELSE 0 END) as salidas_hoy
    FROM accesos 
  `;

  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get("SELECT valor FROM configuracion WHERE clave = 'cupo_maximo'", (err, config) => {
      const cupo_maximo = parseInt(config?.valor || 300);
      const entradas_hoy = row.hoy || 0;
      const entradas_ayer = row.ayer || 0;
      const salidas_hoy = row.salidas_hoy || 0;
      const en_vivo = entradas_hoy - salidas_hoy;

      let crecimiento = 0;
      if (entradas_ayer > 0) {
        crecimiento = ((entradas_hoy - entradas_ayer) / entradas_ayer) * 100;
      } else if (entradas_hoy > 0) {
        crecimiento = 100;
      }

      res.json({ 
        en_vivo: en_vivo < 0 ? 0 : en_vivo,
        cupo_maximo,
        crecimiento: crecimiento.toFixed(1),
        detalles: {
          entradas: entradas_hoy,
          salidas: salidas_hoy,
          ayer: entradas_ayer
        }
      });
    });
  });
};

/**
 * RF-11: Reporte de Afluencia con Timezone México
 */
const getAttendanceHistory = (req, res) => {
  const { period = 'HOY' } = req.query;
  
  let timeFormat = '%H:00'; 
  let whereClause = "date(fecha_acceso, 'localtime') = date('now', 'localtime')";

  if (period === 'SEMANA') {
    timeFormat = '%Y-%W-%w'; 
    whereClause = "date(fecha_acceso, 'localtime') >= date('now', 'localtime', '-7 days')";
  } else if (period === 'MES') {
    timeFormat = '%Y-%m-%d';
    whereClause = "date(fecha_acceso, 'localtime') >= date('now', 'localtime', '-30 days')";
  } else if (period === 'AÑO') {
    timeFormat = '%Y-%m';
    whereClause = "date(fecha_acceso, 'localtime') >= date('now', 'localtime', '-365 days')";
  }

  const query = `
    SELECT strftime('${timeFormat}', fecha_acceso, 'localtime') as periodo, COUNT(*) as total
    FROM accesos
    WHERE resultado = 'exito' AND tipo = 'entrada' AND ${whereClause}
    GROUP BY periodo
    ORDER BY periodo ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * RF-12: Horas Pico (Formato 24h explícito y Local Time)
 */
const getPeakHours = (req, res) => {
  const query = `
    SELECT strftime('%H:00', fecha_acceso, 'localtime') as intervalo, COUNT(*) as ingresos
    FROM accesos
    WHERE resultado = 'exito' AND tipo = 'entrada'
    GROUP BY intervalo
    ORDER BY intervalo ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * Exportar CSV (Local Time)
 */
const exportAttendanceToCSV = (req, res) => {
  const query = `
    SELECT a.id, s.nombre, datetime(a.fecha_acceso, 'localtime') as fecha_local, a.tipo, a.resultado
    FROM accesos a
    LEFT JOIN socios s ON a.socio_id = s.id
    ORDER BY a.fecha_acceso DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let csv = "ID,Socio,Fecha Local,Tipo,Resultado\n";
    rows.forEach(row => {
      csv += `${row.id},${row.nombre || 'Desconocido'},"${row.fecha_local}",${row.tipo},${row.resultado}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_afluencia.csv');
    res.status(200).send(csv);
  });
};

/**
 * Gestión de Configuración
 */
const getConfig = (req, res) => {
  db.all("SELECT clave, valor FROM configuracion", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const config = {};
    rows.forEach(r => config[r.clave] = r.valor);
    res.json(config);
  });
};

const updateConfig = (req, res) => {
  const { clave, valor } = req.body;
  db.run("UPDATE configuracion SET valor = ? WHERE clave = ?", [valor, clave], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

const getPlanes = (req, res) => {
  db.all("SELECT * FROM planes ORDER BY duracion_meses ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const updatePlan = (req, res) => {
  const { id } = req.params;
  const { costo } = req.body;
  db.run("UPDATE planes SET costo = ? WHERE id = ?", [costo, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

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

const getRecentAccessLogs = (req, res) => {
  const query = `
    SELECT a.*, s.nombre, s.foto, datetime(a.fecha_acceso, 'localtime') as fecha_local
    FROM accesos a
    LEFT JOIN socios s ON a.socio_id = s.id
    ORDER BY a.fecha_acceso DESC
    LIMIT 100
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = {
  getLiveCount,
  getAttendanceHistory,
  getPeakHours,
  getIncomeMetrics,
  getConfig,
  updateConfig,
  getPlanes,
  updatePlan,
  getRecentAccessLogs,
  exportAttendanceToCSV
};
