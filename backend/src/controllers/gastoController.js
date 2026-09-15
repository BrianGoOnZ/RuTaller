const { Op } = require('sequelize');
const { Gasto, Insumo } = require('../models');

async function list(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha[Op.gte] = desde;
      if (hasta) where.fecha[Op.lte] = hasta;
    }

    const gastos = await Gasto.findAll({ where, include: [Insumo], order: [['fecha', 'DESC']] });
    res.json(gastos);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { fecha, concepto, categoria, monto, insumoId, cantidadInsumo } = req.body;

    const gasto = await Gasto.create({
      fecha: fecha || new Date(),
      concepto,
      categoria,
      monto,
      insumoId: categoria === 'insumo' ? insumoId || null : null,
      cantidadInsumo: categoria === 'insumo' ? cantidadInsumo || null : null,
    });

    if (categoria === 'insumo' && insumoId && cantidadInsumo) {
      const insumo = await Insumo.findByPk(insumoId);
      if (insumo) {
        await insumo.update({ stock: Number(insumo.stock) + Number(cantidadInsumo) });
      }
    }

    res.status(201).json(gasto);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
