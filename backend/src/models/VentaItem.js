const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VentaItem = sequelize.define('VentaItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = VentaItem;
