const express = require('express');
const router = express.Router();

const chiTietHoaDonController =require('../controllers/chitiethoadon_cotroller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware('json'));
router.get('/', chiTietHoaDonController.getListorByIDHoaDon);
router.post('/post', chiTietHoaDonController.addChiTietHoaDon);
router.put('/put/:id', chiTietHoaDonController.suaChiTietHoaDon);
router.delete('/delete/:id', chiTietHoaDonController.xoaChiTietHoaDon);

module.exports = router;