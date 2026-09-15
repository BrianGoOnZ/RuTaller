const express = require('express');
const protect = require('../middlewares/protect');
const controller = require('../controllers/ventaController');

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;
