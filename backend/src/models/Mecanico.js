const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Mecanico = sequelize.define('Mecanico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Mecanico;
