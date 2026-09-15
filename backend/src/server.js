require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./models');
const seedAdminIfMissing = require('./utils/seedAdmin');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);

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
