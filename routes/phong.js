const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phong_controller')
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware('json'));
router.get('/', phongController.getListorByIdorIdPhong);
router.post('/post', phongController.addPhong);
router.put('/put/:id', phongController.suaPhong);
router.delete('/delete/:id', phongController.xoaPhong);

module.exports = router;