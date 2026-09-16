const express = require('express');
const protect = require('../middlewares/protect');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/gastoController');

const router = express.Router();
router.use(protect);
router.use(requireRole('administrador'));

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;
