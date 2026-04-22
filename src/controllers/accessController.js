const { db } = require('../config/database');

const processAccess = (req, res) => {
  const { socio_id, hash_biometrico } = req.body;
  const io = req.app.get('socketio');

  if (!socio_id && !hash_biometrico) {
    return res.status(400).json({ error: 'ID de socio o Huella requerida' });
  }

  // Buscar al socio y su membresía actual
  let query = `
    SELECT s.id, s.nombre, s.foto, m.fecha_fin, m.estatus 
    FROM socios s
    JOIN membresias m ON s.id = m.socio_id
    WHERE `;
  
  let params = [];
  if (socio_id) {
    query += `s.id = ?`;
    params.push(socio_id);
  } else {
    query += `s.hash_biometrico = ?`;
    params.push(hash_biometrico);
  }

  db.get(query, params, (err, socio) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!socio) {
      // Emitir alerta de acceso fallido (Socio no encontrado)
      io.emit('access_alert', { 
        success: false, 
        message: 'Socio no registrado',
        color: 'red'
      });
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    const today = new Date().toISOString().split('T')[0];
    const isActive = socio.fecha_fin >= today && socio.estatus === 'activo';
    const resultado = isActive ? 'exito' : 'fallo';

    // Registrar el acceso en la DB
    db.run(`INSERT INTO accesos (socio_id, resultado) VALUES (?, ?)`, [socio.id, resultado]);

    // Si es éxito, actualizar visitas totales en lealtad
    if (isActive) {
      db.run(`UPDATE lealtad SET visitas_totales = visitas_totales + 1 WHERE socio_id = ?`, [socio.id]);
    }

    // Emitir evento para el Dashboard
    io.emit('access_alert', {
      success: isActive,
      nombre: socio.nombre,
      foto: socio.foto,
      fecha_fin: socio.fecha_fin,
      message: isActive ? '¡BIENVENIDO!' : 'MEMBRESÍA VENCIDA',
      color: isActive ? 'green' : 'red'
    });

    res.json({
      success: isActive,
      socio: {
        id: socio.id,
        nombre: socio.nombre,
        estatus: isActive ? 'activo' : 'vencido'
      }
    });
  });
};

module.exports = {
  processAccess
};
