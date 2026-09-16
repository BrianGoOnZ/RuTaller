const { Op } = require('sequelize');
const { Venta, OrdenServicio, GarantiaEvento, Gasto } = require('../models');

async function resumen(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const condicionFecha = { [Op.ne]: null };
    if (desde) condicionFecha[Op.gte] = desde;
    if (hasta) condicionFecha[Op.lte] = hasta;

    const rangoFecha = {};
    if (desde) rangoFecha[Op.gte] = desde;
    if (hasta) rangoFecha[Op.lte] = hasta;
    const whereFecha = desde || hasta ? { fecha: rangoFecha } : {};

    const ventas = await Venta.findAll({ where: whereFecha });
    const ingresosVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);

    // Ingresos de la entrega original de cada orden, contados en su propia fecha de entrega
    // (independiente de si la orden se reabrio despues por garantia).
    const ordenes = await OrdenServicio.findAll({
      where: { fechaEntregaReal: condicionFecha },
    });
    const ingresosOrdenesOriginales = ordenes.reduce((acc, o) => acc + Number(o.total), 0);

    // Ingresos de cada reingreso por garantia, contados en SU propia fecha de entrega.
    const garantias = await GarantiaEvento.findAll({
      where: { fechaEntrega: condicionFecha },
    });
    const ingresosGarantias = garantias.reduce((acc, g) => acc + Number(g.total), 0);

    const ingresosServicios = ingresosOrdenesOriginales + ingresosGarantias;

    const gastos = await Gasto.findAll({ where: whereFecha });
    const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

    const totalIngresos = ingresosVentas + ingresosServicios;

    res.json({
      ingresosVentas,
      ingresosServicios,
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumen };
