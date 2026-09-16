const bcrypt = require('bcryptjs');
const { User } = require('../models');

const SIN_PASSWORD = { exclude: ['passwordHash'] };

async function list(req, res, next) {
  try {
    const { role } = req.query;
    const where = { activo: true };
    if (role) where.role = role;
    const usuarios = await User.findAll({
      where,
      attributes: SIN_PASSWORD,
      order: [['name', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await User.findByPk(req.user.id, { attributes: SIN_PASSWORD });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const usuario = await User.findByPk(req.user.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { telefono, currentPassword, newPassword } = req.body;
    const cambios = {};
    if (telefono !== undefined) cambios.telefono = telefono;

    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, usuario.passwordHash))) {
        return res.status(400).json({ message: 'Tu contrasena actual no es correcta' });
      }
      cambios.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await usuario.update(cambios);
    const actualizado = await User.findByPk(usuario.id, { attributes: SIN_PASSWORD });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, username, password, role, telefono, especialidad, fechaIngreso } = req.body;
    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: 'Nombre, usuario, contrasena y rol son obligatorios' });
    }
    const existente = await User.findOne({ where: { username } });
    if (existente) return res.status(400).json({ message: 'Ese nombre de usuario ya existe' });

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await User.create({
      name,
      username,
      passwordHash,
      role,
      telefono,
      especialidad: role === 'mecanico' ? especialidad : null,
      fechaIngreso: fechaIngreso || null,
    });
    const creado = await User.findByPk(usuario.id, { attributes: SIN_PASSWORD });
    res.status(201).json(creado);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const usuario = await User.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const camposPermitidos = ['name', 'role', 'telefono', 'especialidad', 'fechaIngreso'];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    });
    if (cambios.role && cambios.role !== 'mecanico') cambios.especialidad = null;

    if (req.body.newPassword) {
      cambios.passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    }

    await usuario.update(cambios);
    const actualizado = await User.findByPk(usuario.id, { attributes: SIN_PASSWORD });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const usuario = await User.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (usuario.id === req.user.id) {
      return res.status(400).json({ message: 'No puedes dar de baja tu propia cuenta' });
    }
    if (usuario.role === 'administrador') {
      const otrosAdmins = await User.count({
        where: { role: 'administrador', activo: true },
      });
      if (otrosAdmins <= 1) {
        return res.status(400).json({ message: 'Debe quedar al menos un administrador activo' });
      }
    }

    await usuario.update({ activo: false });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function subirFoto(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (req.user.id !== targetId && req.user.role !== 'administrador') {
      return res.status(403).json({ message: 'No tienes permiso para esta accion' });
    }
    const usuario = await User.findByPk(targetId);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (!req.file) return res.status(400).json({ message: 'No se recibio ninguna imagen' });

    await usuario.update({ fotoPath: req.file.filename });
    const actualizado = await User.findByPk(usuario.id, { attributes: SIN_PASSWORD });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, me, updateMe, create, update, remove, subirFoto };
