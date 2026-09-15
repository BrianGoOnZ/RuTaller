const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TIPOS_MOTO = [
  'Trabajo/Cub',
  'Deportiva',
  'Naked',
  'Touring/Grande',
  'Doble proposito',
  'Scooter',
  'Cuatrimoto',
  'Otra',
];

const Moto = sequelize.define('Moto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM(...TIPOS_MOTO),
    allowNull: true,
  },
  placas: DataTypes.STRING,
  noSerie: DataTypes.STRING,
});

Moto.TIPOS_MOTO = TIPOS_MOTO;

module.exports = Moto;
