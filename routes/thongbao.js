const express = require('express');
const router = express.Router();

const thongBaoController = require('../controllers/thongbao_controller')

router.get('/', thongBaoController.getListorByidNguoiDung);
router.post('/post', thongBaoController.addThongBao);
router.put('/put/:id', thongBaoController.suaThongBao);
router.delete('/delete/:id', thongBaoController.xoaThongBao);

module.exports = router;