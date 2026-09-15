const { Configuracion } = require('../models');

async function get(req, res, next) {
  try {
    const config = await Configuracion.findByPk(1);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const config = await Configuracion.findByPk(1);
    await config.update(req.body);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
