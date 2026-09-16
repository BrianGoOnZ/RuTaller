const sequelize = require('../config/db');

const User = require('./User');
const Cliente = require('./Cliente');
const Moto = require('./Moto');
const OrdenServicio = require('./OrdenServicio');
const OrdenServicioChecklistItem = require('./OrdenServicioChecklistItem');
const OrdenServicioFoto = require('./OrdenServicioFoto');
const OrdenServicioItem = require('./OrdenServicioItem');
const GarantiaEvento = require('./GarantiaEvento');
const Producto = require('./Producto');
const Insumo = require('./Insumo');
const InsumoConsumo = require('./InsumoConsumo');
const Venta = require('./Venta');
const VentaItem = require('./VentaItem');
const Gasto = require('./Gasto');
const Configuracion = require('./Configuracion');

// Cliente <-> Moto
Cliente.hasMany(Moto, { foreignKey: 'clienteId', onDelete: 'CASCADE' });
Moto.belongsTo(Cliente, { foreignKey: 'clienteId' });

// Moto <-> OrdenServicio
Moto.hasMany(OrdenServicio, { foreignKey: 'motoId', onDelete: 'CASCADE' });
OrdenServicio.belongsTo(Moto, { foreignKey: 'motoId' });

// OrdenServicio <-> GarantiaEvento (cada reingreso por garantia)
OrdenServicio.hasMany(GarantiaEvento, { foreignKey: 'ordenServicioId', onDelete: 'CASCADE' });
GarantiaEvento.belongsTo(OrdenServicio, { foreignKey: 'ordenServicioId' });

GarantiaEvento.hasMany(OrdenServicioItem, { foreignKey: 'garantiaEventoId', onDelete: 'CASCADE' });
OrdenServicioItem.belongsTo(GarantiaEvento, { foreignKey: 'garantiaEventoId' });

// OrdenServicio <-> checklist / fotos / items
OrdenServicio.hasMany(OrdenServicioChecklistItem, {
  foreignKey: 'ordenServicioId',
  onDelete: 'CASCADE',
});
OrdenServicioChecklistItem.belongsTo(OrdenServicio, { foreignKey: 'ordenServicioId' });

OrdenServicio.hasMany(OrdenServicioFoto, { foreignKey: 'ordenServicioId', onDelete: 'CASCADE' });
OrdenServicioFoto.belongsTo(OrdenServicio, { foreignKey: 'ordenServicioId' });

OrdenServicio.hasMany(OrdenServicioItem, { foreignKey: 'ordenServicioId', onDelete: 'CASCADE' });
OrdenServicioItem.belongsTo(OrdenServicio, { foreignKey: 'ordenServicioId' });
OrdenServicioItem.belongsTo(Producto, { foreignKey: 'productoId' });

// Venta <-> VentaItem <-> Producto
Venta.hasMany(VentaItem, { foreignKey: 'ventaId', onDelete: 'CASCADE' });
VentaItem.belongsTo(Venta, { foreignKey: 'ventaId' });
VentaItem.belongsTo(Producto, { foreignKey: 'productoId' });

// Gasto <-> Insumo
Gasto.belongsTo(Insumo, { foreignKey: 'insumoId' });

// Insumo <-> InsumoConsumo (uso de insumos, ligado a quien lo consumio)
Insumo.hasMany(InsumoConsumo, { foreignKey: 'insumoId', onDelete: 'CASCADE' });
InsumoConsumo.belongsTo(Insumo, { foreignKey: 'insumoId' });

User.hasMany(InsumoConsumo, { foreignKey: 'mecanicoId' });
InsumoConsumo.belongsTo(User, { foreignKey: 'mecanicoId', as: 'Mecanico' });

async function syncDatabase() {
  // SQLite exige que las llaves foraneas esten desactivadas mientras se
  // reconstruyen tablas relacionadas (alter:true), o la migracion falla
  // (o peor, deja una tabla vacia a medio reconstruir) en cuanto hay filas
  // que referencian a la tabla que se esta alterando.
  await sequelize.query('PRAGMA foreign_keys = OFF');
  try {
    await sequelize.sync({ alter: true });
  } finally {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }

  // Cuentas que ya existian antes de que el sistema de roles existiera
  // (columna role recien agregada, sin valor) eran por definicion la unica
  // cuenta admin de esa instalacion - se asignan como administrador, nunca
  // como mecanico, para no perder acceso a su propia cuenta.
  await User.update({ role: 'administrador' }, { where: { role: null } });

  // Tabla huerfana de una version anterior (el catalogo de Mecanicos se
  // fusiono dentro de Users); ya no tiene modelo ni referencias.
  await sequelize.query('DROP TABLE IF EXISTS Mecanicos');

  const existingConfig = await Configuracion.findByPk(1);
  if (!existingConfig) {
    await Configuracion.create({ id: 1 });
  }
}

module.exports = {
  sequelize,
  User,
  Cliente,
  Moto,
  OrdenServicio,
  OrdenServicioChecklistItem,
  OrdenServicioFoto,
  OrdenServicioItem,
  GarantiaEvento,
  Producto,
  Insumo,
  InsumoConsumo,
  Venta,
  VentaItem,
  Gasto,
  Configuracion,
  syncDatabase,
};
