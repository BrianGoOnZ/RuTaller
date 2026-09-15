const path = require('path');
const { Sequelize } = require('sequelize');

const dbPath = process.env.RUTALLER_DB_PATH
  || path.join(__dirname, '..', '..', '..', 'database', 'rutaller.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

module.exports = sequelize;
