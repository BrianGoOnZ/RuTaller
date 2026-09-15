const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  nombreTaller: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Mi Taller',
  },
  direccion: DataTypes.STRING,
  telefono: DataTypes.STRING,
  rfc: DataTypes.STRING,
  logoPath: DataTypes.STRING,
  ivaPorcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 16,
  },
});

module.exports = Configuracion;
