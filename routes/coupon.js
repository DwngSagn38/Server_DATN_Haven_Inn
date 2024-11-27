const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon_controller')
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware('json'));
router.get('/', couponController.getListorByidNguoiDung);
router.post('/post', couponController.addCoupon);
router.put('/put/:id', couponController.suaCoupon);
router.delete('/delete/:id', couponController.xoaCoupon);

module.exports = router;