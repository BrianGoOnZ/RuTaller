const express = require('express');
const protect = require('../middlewares/protect');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/configuracionController');

const router = express.Router();
router.use(protect);

// GET abierto a todos los roles: el nombre del taller se muestra en el navbar
// de cualquier usuario logueado. Solo editar la configuracion es de administrador.
router.get('/', controller.get);
router.put('/', requireRole('administrador'), controller.update);

module.exports = router;
