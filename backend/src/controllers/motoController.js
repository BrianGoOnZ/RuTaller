const { Moto, Cliente, OrdenServicio } = require('../models');
const { eliminarOrdenCompleta } = require('./ordenServicioController');

async function list(req, res, next) {
  try {
    const { clienteId } = req.query;
    const where = clienteId ? { clienteId } : undefined;
    const motos = await Moto.findAll({ where, include: [Cliente], order: [['id', 'DESC']] });
    res.json(motos);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const moto = await Moto.findByPk(req.params.id, {
      include: [
        Cliente,
        { model: OrdenServicio, order: [['fechaIngreso', 'DESC']] },
      ],
    });
    if (!moto) return res.status(404).json({ message: 'Moto no encontrada' });
    res.json(moto);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.body.clienteId);
    if (!cliente) return res.status(400).json({ message: 'Cliente invalido' });

    const moto = await Moto.create(req.body);
    res.status(201).json(moto);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const moto = await Moto.findByPk(req.params.id);
    if (!moto) return res.status(404).json({ message: 'Moto no encontrada' });
    await moto.update(req.body);
    res.json(moto);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const moto = await Moto.findByPk(req.params.id);
    if (!moto) return res.status(404).json({ message: 'Moto no encontrada' });

    const ordenes = await OrdenServicio.findAll({ where: { motoId: moto.id } });
    for (const orden of ordenes) {
      await eliminarOrdenCompleta(orden.id);
    }

    await moto.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
