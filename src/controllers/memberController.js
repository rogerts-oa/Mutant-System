const { db } = require('../config/database');
const { calculateExpirationDate } = require('../services/membershipService');

const registerMember = (req, res) => {
  const { nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico, plan_id } = req.body;

  if (!nombre || !plan_id) {
    return res.status(400).json({ error: 'Nombre y Plan son obligatorios' });
  }

  // 1. Insertar el Socio
  const socioQuery = `INSERT INTO socios (nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(socioQuery, [nombre, telefono, correo, contacto_emergencia, foto, hash_biometrico], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al registrar socio: ' + err.message });
    }

    const socioId = this.lastID;

    // 2. Obtener duración del plan
    db.get("SELECT duracion_meses FROM planes WHERE id = ?", [plan_id], (err, plan) => {
      if (err || !plan) {
        return res.status(400).json({ error: 'Plan no encontrado' });
      }

      const fechaInicio = new Date().toISOString().split('T')[0];
      const fechaFin = calculateExpirationDate(fechaInicio, plan.duracion_meses);

      // 3. Crear la Membresía
      const membresiaQuery = `INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)`;
      db.run(membresiaQuery, [socioId, plan_id, fechaInicio, fechaFin], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al crear membresía: ' + err.message });
        }

        // 4. Inicializar Lealtad
        db.run(`INSERT INTO lealtad (socio_id) VALUES (?)`, [socioId]);

        res.status(201).json({
          message: 'Socio registrado exitosamente',
          socioId,
          fechaFin
        });
      });
    });
  });
};

const getAllMembers = (req, res) => {
  const query = `
    SELECT s.*, m.fecha_fin, m.estatus 
    FROM socios s 
    LEFT JOIN membresias m ON s.id = m.socio_id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

const renewMembership = (req, res) => {
  const { socio_id, plan_id } = req.body;

  if (!socio_id || !plan_id) {
    return res.status(400).json({ error: 'Socio ID y Plan ID son obligatorios' });
  }

  db.get("SELECT duracion_meses FROM planes WHERE id = ?", [plan_id], (err, plan) => {
    if (err || !plan) return res.status(400).json({ error: 'Plan no encontrado' });

    const fechaInicio = new Date().toISOString().split('T')[0];
    const fechaFin = calculateExpirationDate(fechaInicio, plan.duracion_meses);

    const query = `
      INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, tipo) 
      VALUES (?, ?, ?, ?, 'renovacion')
    `;

    db.run(query, [socio_id, plan_id, fechaInicio, fechaFin], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        message: 'Membresía renovada con éxito',
        fechaFin
      });
    });
  });
};

module.exports = {
  registerMember,
  getAllMembers,
  renewMembership
};
