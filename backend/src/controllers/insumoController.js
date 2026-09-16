const { Op } = require('sequelize');
const { Insumo } = require('../models');

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = { activo: true };
    if (q) where.nombre = { [Op.like]: `%${q}%` };
    const insumos = await Insumo.findAll({ where, order: [['nombre', 'ASC']] });
    res.json(insumos);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const insumo = await Insumo.create(req.body);
    res.status(201).json(insumo);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const insumo = await Insumo.findByPk(req.params.id);
    if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });
    await insumo.update(req.body);
    res.json(insumo);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const insumo = await Insumo.findByPk(req.params.id);
    if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });
    await insumo.update({ activo: false });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
