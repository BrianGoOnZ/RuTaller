require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./models');
const seedAdminIfMissing = require('./utils/seedAdmin');
const { uploadsPath } = require('./config/storage');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const motoRoutes = require('./routes/motoRoutes');
const ordenServicioRoutes = require('./routes/ordenServicioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const insumoRoutes = require('./routes/insumoRoutes');
const userRoutes = require('./routes/userRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const gastoRoutes = require('./routes/gastoRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const finanzasRoutes = require('./routes/finanzasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const errorHandler = require('./middlewares/errorHandler');

function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(uploadsPath));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/clientes', clienteRoutes);
  app.use('/api/motos', motoRoutes);
  app.use('/api/ordenes', ordenServicioRoutes);
  app.use('/api/productos', productoRoutes);
  app.use('/api/insumos', insumoRoutes);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/ventas', ventaRoutes);
  app.use('/api/gastos', gastoRoutes);
  app.use('/api/configuracion', configuracionRoutes);
  app.use('/api/finanzas', finanzasRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(errorHandler);
  return app;
}

async function startServer(port = process.env.PORT || 4000) {
  await syncDatabase();
  await seedAdminIfMissing();

  const app = createServer();
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`RuTaller backend escuchando en http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };
