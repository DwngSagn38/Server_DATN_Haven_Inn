const express = require('express');
const router = express.Router();
const hotroController = require('../controllers/hotro_web_controller');

// Route để lấy danh sách hoặc theo ID người dùng
router.get('/', hotroController.getListOrByID);

// Route để thêm hỗ trợ mới
router.post('/post', hotroController.addHotro);

// Route để cập nhật hỗ trợ
router.put('/put/:id', hotroController.suaHotro);

// Route để xóa hỗ trợ
router.delete('/delete/:id', hotroController.xoaHotro);

module.exports = router;
