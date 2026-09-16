const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { NIVELES, ESTADOS_ORDEN } = require('../utils/constants');

const OrdenServicio = sequelize.define('OrdenServicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fechaIngreso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  horaIngreso: DataTypes.STRING,
  fechaEntregaEstimada: DataTypes.DATEONLY,
  fechaEntregaReal: DataTypes.DATEONLY,
  kilometraje: DataTypes.INTEGER,
  nivelGasolina: {
    type: DataTypes.ENUM(...NIVELES),
    allowNull: true,
  },
  nivelAceite: {
    type: DataTypes.ENUM(...NIVELES),
    allowNull: true,
  },
  trabajoSolicitado: DataTypes.TEXT,
  diagnostico: DataTypes.TEXT,
  estado: {
    type: DataTypes.ENUM(...ESTADOS_ORDEN),
    allowNull: false,
    defaultValue: 'recibida',
  },
  enGarantia: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  firmaClienteRecepcion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  firmaClienteEntrega: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fechaReingresoGarantia: DataTypes.DATEONLY,
  diagnosticoGarantia: DataTypes.TEXT,
  fechaEntregaGarantia: DataTypes.DATEONLY,
  firmaClienteEntregaGarantia: {
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

module.exports = OrdenServicio;
