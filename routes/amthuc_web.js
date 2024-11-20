const express = require('express');
const router = express.Router();
const { upload } = require('../config/common/uploads');  // Nếu cần upload hình ảnh
const amThucController = require('../controllers/amthuc_web_controller');  // Controller chứa logic
const authMiddleware = require('../middleware/authMiddleware');  // Middleware xác thực

// Sử dụng middleware auth nếu cần
router.use(authMiddleware('html'));

// Route cho phần ẩm thực
router.get('/', amThucController.getListOrByID);  // Lấy danh sách ẩm thực
router.post('/post', upload.single('hinhAnh'), amThucController.addAmThuc);  // Thêm ẩm thực mới
router.put('/put/:id', upload.single('hinhAnh'), amThucController.suaAmThuc);  // Sửa ẩm thực
router.delete('/delete/:id', amThucController.xoaAmThuc);  // Xóa ẩm thực
module.exports = router;
