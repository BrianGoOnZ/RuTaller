const express = require('express');
const protect = require('../middlewares/protect');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/finanzasController');

const router = express.Router();
router.use(protect);
router.use(requireRole('administrador'));

router.get('/resumen', controller.resumen);

module.exports = router;
