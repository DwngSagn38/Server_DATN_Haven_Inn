const express = require('express');
const router = express.Router();

const thongBaoController = require('../controllers/thongbao_controller')

router.get('/', thongBaoController.getAllNotifications);
router.patch('/:id/trangthai', thongBaoController.updateThongBaoStatus);


module.exports = router;