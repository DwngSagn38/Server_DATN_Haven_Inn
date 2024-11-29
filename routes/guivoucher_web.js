const express = require('express');
const router = express.Router();
const { listVouchers, sendVoucherPage, sendVoucherToUsers } = require('../controllers/guicoupon_web_controller');

// Hiển thị danh sách voucher
router.get('/', listVouchers);

// Hiển thị trang gửi voucher cho từng voucher
router.get('/:id', sendVoucherPage);

// Xử lý gửi voucher cho người dùng
router.post('/post/:id', sendVoucherToUsers);

module.exports = router;
