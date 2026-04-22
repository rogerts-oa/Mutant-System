require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, especificar el origen del frontend
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Inicializar Base de Datos
initDb();

// Compartir io con los controladores
app.set('socketio', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Importar Rutas
const memberRoutes = require('./routes/memberRoutes');
const accessRoutes = require('./routes/accessRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/members', memberRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Mutant System API is running...');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Estatus: Sistema Mutant Gym Operativo 🛠️`);
});
