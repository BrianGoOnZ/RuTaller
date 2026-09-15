const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrdenServicioFoto = sequelize.define('OrdenServicioFoto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = OrdenServicioFoto;
