const express = require('express');
const multer = require('multer');
const path = require('path');
const protect = require('../middlewares/protect');
const requireRole = require('../middlewares/requireRole');
const { uploadsPath } = require('../config/storage');
const controller = require('../controllers/userController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `usuario-${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.get('/me', controller.me);
router.put('/me', controller.updateMe);

router.post('/', requireRole('administrador'), controller.create);
router.put('/:id', requireRole('administrador'), controller.update);
router.delete('/:id', requireRole('administrador'), controller.remove);

router.post('/:id/foto', upload.single('foto'), controller.subirFoto);

module.exports = router;
