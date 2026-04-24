const { db } = require('../config/database');
const { calculateExpirationDate } = require('../services/membershipService');

/**
 * Registrar nuevo socio
 */
const registerMember = (req, res) => {
  const { nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico, plan_id } = req.body;

  if (!nombre || !plan_id) {
    return res.status(400).json({ error: 'Nombre y Plan son obligatorios' });
  }

  const socioQuery = `INSERT INTO socios (nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(socioQuery, [nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico], function(err) {
    if (err) return res.status(500).json({ error: 'Error al registrar socio: ' + err.message });

    const socioId = this.lastID;

    db.get("SELECT duracion_meses FROM planes WHERE id = ?", [plan_id], (err, plan) => {
      if (err || !plan) return res.status(400).json({ error: 'Plan no encontrado' });

      const fechaInicio = new Date().toISOString().split('T')[0];
      const fechaFin = calculateExpirationDate(fechaInicio, plan.duracion_meses);

      const membresiaQuery = `INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, tipo) VALUES (?, ?, ?, ?, 'inscripcion')`;
      db.run(membresiaQuery, [socioId, plan_id, fechaInicio, fechaFin], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`INSERT INTO lealtad (socio_id) VALUES (?)`, [socioId]);

        res.status(201).json({ message: 'Socio registrado exitosamente', socioId });
      });
    });
  });
};

/**
 * Obtener todos los socios (No eliminados)
 */
const getAllMembers = (req, res) => {
  const query = `
    SELECT s.*, m.fecha_fin, m.estatus, p.nombre as plan_nombre
    FROM socios s 
    LEFT JOIN membresias m ON s.id = m.socio_id
    LEFT JOIN planes p ON m.plan_id = p.id
    WHERE s.deleted_at IS NULL
    GROUP BY s.id
    ORDER BY s.creado_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * Obtener detalle de un socio (Información completa + Historial)
 */
const getMemberById = (req, res) => {
  const { id } = req.params;
  
  const socioQuery = `
    SELECT s.*, m.fecha_inicio, m.fecha_fin, m.estatus, p.nombre as plan_nombre, p.costo as plan_costo
    FROM socios s
    LEFT JOIN membresias m ON s.id = m.socio_id
    LEFT JOIN planes p ON m.plan_id = p.id
    WHERE s.id = ? AND s.deleted_at IS NULL
  `;

  db.get(socioQuery, [id], (err, socio) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!socio) return res.status(404).json({ error: 'Socio no encontrado' });

    // Obtener historial de accesos
    db.all("SELECT fecha_acceso, resultado, tipo FROM accesos WHERE socio_id = ? ORDER BY fecha_acceso DESC LIMIT 10", [id], (err, accesos) => {
      socio.historial_accesos = accesos || [];
      res.json(socio);
    });
  });
};

/**
 * Actualizar datos del socio
 */
const updateMember = (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, correo, contacto_emergencia, foto } = req.body;

  const query = `
    UPDATE socios 
    SET nombre = ?, telefono = ?, correo = ?, contacto_emergencia = ?, foto = ?
    WHERE id = ? AND deleted_at IS NULL
  `;

  db.run(query, [nombre, telefono, correo, contacto_emergencia, foto, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Socio no encontrado' });
    res.json({ message: 'Datos actualizados correctamente' });
  });
};

/**
 * Dar de baja (Soft Delete)
 */
const deleteMember = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE socios SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Socio dado de baja correctamente' });
  });
};

const renewMembership = (req, res) => {
  const { socio_id, plan_id } = req.body;

  // 1. Obtener el plan
  db.get("SELECT duracion_meses, costo FROM planes WHERE id = ?", [plan_id], (err, plan) => {
    if (err || !plan) return res.status(400).json({ error: 'Plan no encontrado' });

    // 2. Obtener la membresía actual para calcular la nueva fecha
    db.get("SELECT id, fecha_fin FROM membresias WHERE socio_id = ? ORDER BY fecha_fin DESC LIMIT 1", [socio_id], (err, current) => {
      let startDate = new Date().toISOString().split('T')[0];
      
      if (current) {
        const today = new Date().toISOString().split('T')[0];
        // Si aún está activo, sumar a partir de la fecha de vencimiento actual
        if (current.fecha_fin > today) {
          startDate = current.fecha_fin;
        }
      }

      const fechaFin = calculateExpirationDate(startDate, plan.duracion_meses);

      // 3. Realizar UPDATE real en la tabla membresias del último registro o crear uno si no existe
      if (current) {
        const updateQuery = `UPDATE membresias SET plan_id = ?, fecha_inicio = ?, fecha_fin = ?, tipo = 'renovacion', estatus = 'activo' WHERE id = ?`;
        db.run(updateQuery, [plan_id, startDate, fechaFin, current.id], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Membresía actualizada con éxito', fechaFin });
        });
      } else {
        const insertQuery = `INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, tipo, estatus) VALUES (?, ?, ?, ?, 'renovacion', 'activo')`;
        db.run(insertQuery, [socio_id, plan_id, startDate, fechaFin], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Membresía creada y activada con éxito', fechaFin });
        });
      }
    });
  });
};

module.exports = {
  registerMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  renewMembership
};
