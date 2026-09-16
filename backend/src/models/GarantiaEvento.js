const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GarantiaEvento = sequelize.define('GarantiaEvento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fechaReingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  diagnostico: DataTypes.TEXT,
  fechaEntrega: DataTypes.DATEONLY,
  firmaClienteEntrega: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  ivaMonto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
});

module.exports = GarantiaEvento;
