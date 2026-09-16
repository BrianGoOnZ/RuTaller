const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InsumoConsumo = sequelize.define('InsumoConsumo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nota: DataTypes.STRING,
});

module.exports = InsumoConsumo;
