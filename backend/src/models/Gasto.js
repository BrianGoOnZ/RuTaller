const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CATEGORIAS_GASTO = ['herramienta', 'insumo', 'servicios', 'otro'];

const Gasto = sequelize.define('Gasto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  concepto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.ENUM(...CATEGORIAS_GASTO),
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cantidadInsumo: DataTypes.DECIMAL(10, 2),
});

Gasto.CATEGORIAS_GASTO = CATEGORIAS_GASTO;

module.exports = Gasto;
