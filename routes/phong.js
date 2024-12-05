const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phong_controller')

router.get('/', phongController.getListorByIdorIdPhong);
router.get('/check/', phongController.getCheck);
router.post('/post', phongController.addPhong);
router.put('/put/:id', phongController.suaPhong);
router.delete('/delete/:id', phongController.xoaPhong);

module.exports = router;