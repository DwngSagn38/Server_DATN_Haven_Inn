const express = require('express');
const router = express.Router();

const danhGiaController = require('../controllers/danhgia_controller')
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware('json'));
router.get('/', danhGiaController.getListorByIdUserorIdLPhong);
router.post('/post', danhGiaController.addDanhGia);
router.put('/put/:id', danhGiaController.suaDanhGia);
router.delete('/delete/:id', danhGiaController.xoaDanhGia);

module.exports = router;