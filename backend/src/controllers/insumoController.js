const { Op } = require('sequelize');
const { Insumo, InsumoConsumo, Mecanico } = require('../models');

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

    // El stock nunca se edita a mano una vez creado el insumo: solo puede subir
    // registrando un gasto de compra (Finanzas) o bajar registrando un consumo,
    // para que el inventario siempre cuadre con el dinero gastado.
    const camposPermitidos = ['nombre', 'unidad', 'costoPromedio'];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    });
    await insumo.update(cambios);
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

async function listConsumos(req, res, next) {
  try {
    const { insumoId, mecanicoId } = req.query;
    const where = {};
    if (insumoId) where.insumoId = insumoId;
    if (mecanicoId) where.mecanicoId = mecanicoId;

    const consumos = await InsumoConsumo.findAll({
      where,
      include: [Insumo, Mecanico],
      order: [['id', 'DESC']],
    });
    res.json(consumos);
  } catch (err) {
    next(err);
  }
}

async function registrarConsumo(req, res, next) {
  try {
    const insumo = await Insumo.findByPk(req.params.id);
    if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });

    const { cantidad, fecha, mecanicoId, nota } = req.body;
    const cantidadNum = Number(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      return res.status(400).json({ message: 'Cantidad invalida' });
    }
    if (Number(insumo.stock) < cantidadNum) {
      return res.status(400).json({ message: 'No hay suficiente existencia de este insumo' });
    }
    if (!mecanicoId) {
      return res.status(400).json({ message: 'Selecciona quien consumio el insumo' });
    }
    const mecanico = await Mecanico.findByPk(mecanicoId);
    if (!mecanico) return res.status(400).json({ message: 'Mecanico invalido' });

    const consumo = await InsumoConsumo.create({
      insumoId: insumo.id,
      mecanicoId,
      cantidad: cantidadNum,
      fecha: fecha || new Date().toISOString().slice(0, 10),
      nota: nota || null,
    });

    await insumo.update({ stock: Number(insumo.stock) - cantidadNum });

    const consumoCompleto = await InsumoConsumo.findByPk(consumo.id, { include: [Insumo, Mecanico] });
    res.status(201).json(consumoCompleto);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, listConsumos, registrarConsumo };
