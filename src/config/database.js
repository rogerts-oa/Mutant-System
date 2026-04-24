const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../mutant_gym.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

const initDb = () => {
  db.serialize(() => {
    // Tabla de Socios
    db.run(`CREATE TABLE IF NOT EXISTS socios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT,
      correo TEXT UNIQUE,
      contacto_emergencia TEXT,
      foto TEXT,
      hash_biometrico TEXT,
      creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    )`);

    // Tabla de Planes
    db.run(`CREATE TABLE IF NOT EXISTS planes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      costo REAL NOT NULL,
      duracion_meses INTEGER NOT NULL
    )`);

    // Tabla de Membresías
    db.run(`CREATE TABLE IF NOT EXISTS membresias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      socio_id INTEGER,
      plan_id INTEGER,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estatus TEXT DEFAULT 'activo',
      tipo TEXT DEFAULT 'inscripcion',
      creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (socio_id) REFERENCES socios(id),
      FOREIGN KEY (plan_id) REFERENCES planes(id)
    )`);

    // Tabla de Accesos
    db.run(`CREATE TABLE IF NOT EXISTS accesos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      socio_id INTEGER,
      fecha_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
      resultado TEXT,
      tipo TEXT DEFAULT 'entrada',
      FOREIGN KEY (socio_id) REFERENCES socios(id)
    )`);

    // Tabla de Lealtad
    db.run(`CREATE TABLE IF NOT EXISTS lealtad (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      socio_id INTEGER,
      puntos INTEGER DEFAULT 0,
      visitas_totales INTEGER DEFAULT 0,
      FOREIGN KEY (socio_id) REFERENCES socios(id)
    )`);

    // Tabla de Configuración Global
    db.run(`CREATE TABLE IF NOT EXISTS configuracion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT UNIQUE,
      valor TEXT
    )`);

    // Insertar configuración inicial si no existe
    db.get("SELECT COUNT(*) as count FROM configuracion", (err, row) => {
      if (row.count === 0) {
        db.run("INSERT INTO configuracion (clave, valor) VALUES (?, ?)", ['cupo_maximo', '300']);
      }
    });

    // Insertar planes por defecto si no existen
    db.get("SELECT COUNT(*) as count FROM planes", (err, row) => {
      if (row.count === 0) {
        db.run("INSERT INTO planes (nombre, costo, duracion_meses) VALUES (?, ?, ?)", ['Mensual', 500, 1]);
        db.run("INSERT INTO planes (nombre, costo, duracion_meses) VALUES (?, ?, ?)", ['Trimestral', 1350, 3]);
        db.run("INSERT INTO planes (nombre, costo, duracion_meses) VALUES (?, ?, ?)", ['Anual', 4800, 12]);
        console.log('Planes base insertados.');
      }
    });
  });
};

module.exports = { db, initDb };
