const express = require('express');
const router = express.Router();

const CouponModel = require('../model/coupons');

router.get('/', async (req, res) => {

    const { id_NguoiDung} = req.query;

     // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
     let filter = {};
     if (id_NguoiDung) {
         filter.id_NguoiDung = id_NguoiDung;
     }

    const coupons = await CouponModel.find(filter).sort({createdAt : -1});
    res.send(coupons);
});

// post - add coupon
router.post('/post', async (req, res) => {
    const data = req.body;

    const CheckMaGiamGia = await CouponModel.findOne({ maGiamGia : data.maGiamGia });

    if (CheckMaGiamGia) {
        return res.json({
            status: 303,
            msg: "Mã giảm giá không được trùng",
        });
    }    

    const coupon = new CouponModel({
        id_NguoiDung : data.id_NguoiDung,
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

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await CouponModel.findByIdAndDelete(id);
        if (result) {
            res.json({
                status: 200,
                msg: "Delete success",
                data: result
            });
        } else {
            res.status(404).json({
                status: 404,
                msg: "Không tìm thấy tài liệu để xóa",
                data: []
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            msg: "Lỗi hệ thống",
            data: error.message
        });
    }
});

module.exports = router;