const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ESPECIALIDADES_MECANICO = [
  'General',
  'Motor y transmision',
  'Sistema electrico',
  'Frenos y suspension',
  'Diagnostico y electronica',
  'Carroceria y pintura',
];

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
  telefono: DataTypes.STRING,
  especialidad: {
    type: DataTypes.ENUM(...ESPECIALIDADES_MECANICO),
    allowNull: true,
  },
  fechaIngreso: DataTypes.DATEONLY,
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Mecanico.ESPECIALIDADES_MECANICO = ESPECIALIDADES_MECANICO;

module.exports = Mecanico;
