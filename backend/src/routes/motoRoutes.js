const express = require('express');
const protect = require('../middlewares/protect');
const controller = require('../controllers/motoController');

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
