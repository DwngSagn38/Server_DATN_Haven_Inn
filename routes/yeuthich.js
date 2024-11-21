const express = require('express');
const router = express.Router();

const yeuThichController = require('../controllers/yeuthich_controller')
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware('json'));
router.get('/', yeuThichController.getListLoaiPhongByidNguoiDung);
router.get('/list', yeuThichController.getList);
router.post('/post', yeuThichController.addYeuThich);
router.put('/put/:id', yeuThichController.suaYeuThich);
router.delete('/delete/:id_LoaiPhong', yeuThichController.xoaYeuThich);

module.exports = router;