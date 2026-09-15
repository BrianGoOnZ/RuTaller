const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function seedAdminIfMissing() {
  const existing = await User.findOne();
  if (existing) return;

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);
  await User.create({
    name: 'Administrador',
    username: process.env.SEED_ADMIN_USERNAME || 'admin',
    passwordHash,
  });
}

module.exports = seedAdminIfMissing;
