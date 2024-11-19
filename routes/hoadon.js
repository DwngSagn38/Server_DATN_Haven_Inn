const express = require('express');
const router = express.Router();

const hoaDonController = require('../controllers/hoadon_controller')
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware('json'));
router.get('/',hoaDonController.getListorByIdUserorStatus);
router.post('/post',hoaDonController.addHoaDon);
router.put('/put/:id',hoaDonController.suaHoaDon);
router.delete('/delete/:id',hoaDonController.xoaHoaDon);

module.exports = router;