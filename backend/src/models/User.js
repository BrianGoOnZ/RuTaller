const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { ROLES_USUARIO, ESPECIALIDADES_MECANICO } = require('../utils/constants');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Sin defaultValue a proposito: un default aqui se aplicaria a nivel de
  // base de datos a CUALQUIER cuenta existente al momento de la migracion
  // (ver syncDatabase en models/index.js) - siempre se asigna explicitamente
  // desde el codigo (seedAdmin, alta de usuario) para no adivinar mal el rol
  // de una cuenta que ya existia antes de que el sistema de roles existiera.
  role: {
    type: DataTypes.ENUM(...ROLES_USUARIO),
    allowNull: true,
  },
  telefono: DataTypes.STRING,
  especialidad: {
    type: DataTypes.ENUM(...ESPECIALIDADES_MECANICO),
    allowNull: true,
  },
  fechaIngreso: DataTypes.DATEONLY,
  fotoPath: DataTypes.STRING,
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = User;
