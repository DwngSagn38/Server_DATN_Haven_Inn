const express = require('express');
const router = express.Router();

const CouponModel = require('../model/coupons');

router.get('/', async (req, res) => {
    const coupons = await CouponModel.find().sort({createdAt : -1});
    res.send(coupons);
});

// post - add coupon
router.post('/post', async (req, res) => {
    const data = req.body;
    const coupon = new CouponModel({
        maGiamGia: data.maGiamGia,
        giamGia: data.giamGia,
        giamGiaToiDa: data.giamGiaToiDa,
        dieuKienToiThieu: data.dieuKienToiThieu,
        ngayBatDau: data.ngayBatDau,
        ngayHetHan: data.ngayHetHan,
        trangThai: data.trangThai,
    })

    const result = await coupon.save();

    if (result) {
        res.json({
            status: 200,
            msg: "Add success",
            data: result
        })
    } else {
        res.json({
            status: 400,
            msg: "Add fail",
            data: []
        })
    }
})

// update - put coupon
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await CouponModel.findByIdAndUpdate(id, data, { new: true });

    if (result) {
        res.json({
            status: 200,
            msg: "Update success",
            data: result
        })
    } else {
        res.json({
            status: 400,
            msg: "Update fail",
            data: []
        })
    }
})


// delete coupon
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await CouponModel.deleteOne({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Delete success",
            "data": result
        })
    } else {
        res.json({
            "status": "400",
            "msg": "Delete fail",
            "data": []
        })
    }
})

module.exports = router;