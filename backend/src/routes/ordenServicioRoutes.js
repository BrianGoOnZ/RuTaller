const express = require('express');
const multer = require('multer');
const path = require('path');
const protect = require('../middlewares/protect');
const { uploadsPath } = require('../config/storage');
const controller = require('../controllers/ordenServicioController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);

router.post('/:id/items', controller.agregarItem);
router.delete('/:id/items/:itemId', controller.eliminarItem);

router.post('/:id/fotos', upload.single('foto'), controller.agregarFoto);
router.delete('/:id/fotos/:fotoId', controller.eliminarFoto);

module.exports = router;
