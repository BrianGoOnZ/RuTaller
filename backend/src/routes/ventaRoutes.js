const express = require('express');
const protect = require('../middlewares/protect');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/ventaController');

const router = express.Router();
router.use(protect);
router.use(requireRole('administrador', 'cajero'));

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;
