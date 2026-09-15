const express = require('express');
const protect = require('../middlewares/protect');
const controller = require('../controllers/configuracionController');

const router = express.Router();
router.use(protect);

router.get('/', controller.get);
router.put('/', controller.update);

module.exports = router;
