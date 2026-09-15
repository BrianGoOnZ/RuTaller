const { Op } = require('sequelize');
const { Venta, OrdenServicio, Gasto } = require('../models');

async function resumen(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const rangoFecha = {};
    if (desde) rangoFecha[Op.gte] = desde;
    if (hasta) rangoFecha[Op.lte] = hasta;
    const whereFecha = desde || hasta ? { fecha: rangoFecha } : {};
    const whereFechaEntrega = desde || hasta ? { fechaEntregaReal: rangoFecha } : {};

    const ventas = await Venta.findAll({ where: whereFecha });
    const ingresosVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);

    const ordenes = await OrdenServicio.findAll({
      where: { ...whereFechaEntrega, estado: 'entregada' },
    });
    const ingresosServicios = ordenes.reduce((acc, o) => acc + Number(o.total), 0);

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
