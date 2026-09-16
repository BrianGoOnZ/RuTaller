const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Usuario o contrasena incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, username: user.username } });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
