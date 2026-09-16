function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para esta accion' });
    }
    next();
  };
}

module.exports = requireRole;
