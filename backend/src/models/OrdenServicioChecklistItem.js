const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrdenServicioChecklistItem = sequelize.define('OrdenServicioChecklistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('bien', 'detalle'),
    allowNull: true,
  },
  nota: DataTypes.STRING,
});

module.exports = OrdenServicioChecklistItem;
