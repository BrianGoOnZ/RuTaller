const sequelize = require('../config/db');

const User = require('./User');
const Cliente = require('./Cliente');
const Moto = require('./Moto');
const OrdenServicio = require('./OrdenServicio');
const OrdenServicioChecklistItem = require('./OrdenServicioChecklistItem');
const OrdenServicioFoto = require('./OrdenServicioFoto');
const OrdenServicioItem = require('./OrdenServicioItem');
const Producto = require('./Producto');
const Insumo = require('./Insumo');
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

// OrdenServicio (garantia liga a una orden previa)
OrdenServicio.belongsTo(OrdenServicio, {
  as: 'ordenGarantiaOriginal',
  foreignKey: 'ordenGarantiaOriginalId',
});

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

async function syncDatabase() {
  await sequelize.sync();

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
  Producto,
  Insumo,
  Venta,
  VentaItem,
  Gasto,
  Configuracion,
  syncDatabase,
};
