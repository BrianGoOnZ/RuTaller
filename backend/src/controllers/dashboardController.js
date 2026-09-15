const { Op } = require('sequelize');
const { OrdenServicio, Moto, Cliente } = require('../models');

async function resumen(req, res, next) {
  try {
    const enTaller = await OrdenServicio.count({
      where: { estado: { [Op.notIn]: ['entregada', 'cancelada'] } },
    });

    const listasParaEntregar = await OrdenServicio.count({ where: { estado: 'lista' } });

    const hoy = new Date().toISOString().slice(0, 10);
    const entregasHoy = await OrdenServicio.count({
      where: { estado: { [Op.ne]: 'entregada' }, fechaEntregaEstimada: hoy },
    });

    const ultimasOrdenes = await OrdenServicio.findAll({
      where: { estado: { [Op.notIn]: ['entregada', 'cancelada'] } },
      include: [{ model: Moto, include: [Cliente] }],
      order: [['id', 'DESC']],
      limit: 5,
    });

    res.json({ enTaller, listasParaEntregar, entregasHoy, ultimasOrdenes });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumen };
