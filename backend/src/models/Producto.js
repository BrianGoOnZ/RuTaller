const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: DataTypes.STRING,
  categoria: DataTypes.STRING,
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stockMinimo: DataTypes.INTEGER,
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Producto;
