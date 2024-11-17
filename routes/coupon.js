const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon_controller')

router.get('/', couponController.getListorByidNguoiDung);
router.post('/post', couponController.addCoupon);
router.put('/put/:id', couponController.suaCoupon);
router.delete('/delete/:id', couponController.xoaCoupon);

module.exports = router;