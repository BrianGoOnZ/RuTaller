const { Mecanico } = require('../models');

async function list(req, res, next) {
  try {
    const mecanicos = await Mecanico.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
    res.json(mecanicos);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nombre, telefono, especialidad, fechaIngreso } = req.body;
    const mecanico = await Mecanico.create({ nombre, telefono, especialidad, fechaIngreso });
    res.status(201).json(mecanico);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const mecanico = await Mecanico.findByPk(req.params.id);
    if (!mecanico) return res.status(404).json({ message: 'Mecanico no encontrado' });

    const camposPermitidos = ['nombre', 'telefono', 'especialidad', 'fechaIngreso'];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    });
    await mecanico.update(cambios);
    res.json(mecanico);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const mecanico = await Mecanico.findByPk(req.params.id);
    if (!mecanico) return res.status(404).json({ message: 'Mecanico no encontrado' });
    await mecanico.update({ activo: false });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
