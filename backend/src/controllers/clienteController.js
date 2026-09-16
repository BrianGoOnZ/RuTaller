const { Op } = require('sequelize');
const { Cliente, Moto, OrdenServicio } = require('../models');
const { eliminarOrdenCompleta } = require('./ordenServicioController');

async function list(req, res, next) {
  try {
    const { q } = req.query;
    const where = q
      ? {
          [Op.or]: [
            { nombre: { [Op.like]: `%${q}%` } },
            { telefono: { [Op.like]: `%${q}%` } },
          ],
        }
      : undefined;

    const clientes = await Cliente.findAll({ where, order: [['nombre', 'ASC']] });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id, { include: [Moto] });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    const motos = await Moto.findAll({ where: { clienteId: cliente.id } });
    for (const moto of motos) {
      const ordenes = await OrdenServicio.findAll({ where: { motoId: moto.id } });
      for (const orden of ordenes) {
        await eliminarOrdenCompleta(orden.id);
      }
      await moto.destroy();
    }

    await cliente.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
