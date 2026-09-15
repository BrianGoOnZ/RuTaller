const express = require('express');
const protect = require('../middlewares/protect');
const controller = require('../controllers/finanzasController');

const router = express.Router();
router.use(protect);

router.get('/resumen', controller.resumen);

module.exports = router;
