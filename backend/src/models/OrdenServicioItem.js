const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrdenServicioItem = sequelize.define('OrdenServicioItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('producto', 'mano_obra'),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  costoUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = OrdenServicioItem;
