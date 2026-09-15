const { Op } = require('sequelize');
const { Producto } = require('../models');

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = q ? { nombre: { [Op.like]: `%${q}%` } } : undefined;
    const productos = await Producto.findAll({ where, order: [['nombre', 'ASC']] });
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    await producto.update(req.body);
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    await producto.update({ activo: false });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
