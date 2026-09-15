const sequelize = require('../config/db');
const User = require('./User');

async function syncDatabase() {
  await sequelize.sync();
}

module.exports = {
  sequelize,
  User,
  syncDatabase,
};
