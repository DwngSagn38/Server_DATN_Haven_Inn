const express = require('express');
const router = express.Router();

const HoadonModel = require('../model/hoadons');

router.get('/', async (req, res) => {
    const { id_NguoiDung, trangThai} = req.query;

     // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
     let filter = {};
     if (id_NguoiDung) {
         filter.id_NguoiDung = id_NguoiDung;
     }
     if (trangThai) {
        filter.trangThai = trangThai;
    }

    const hoadons = await HoadonModel.find(filter).sort({createdAt: -1});
    res.send(hoadons)
});
 
// post - thêm hóa đơn
router.post('/post', async (req, res) => {
    try {
        const data = req.body;
        const hoadon = new HoadonModel({
            id_NguoiDung: data.id_NguoiDung,
            id_Coupon: data.id_Coupon,
            ngayNhanPhong: data.ngayNhanPhong,
            ngayTraPhong : data.ngayTraPhong,
            soLuongKhach : data.soLuongKhach,
            soLuongPhong : data.soLuongPhong,
            ngayThanhToan : data.ngayThanhToan,
            phuongThucThanhToan : data.phuongThucThanhToan,
            trangThai : data.trangThai,
            ghiChu : data.ghiChu,
        })

        const result = await hoadon.save();

        if (result) {
            res.json({
                status: 200,
                message: "Add success",
                data: result
            })
        } else {
            res.json({
                status: 400,
                message: "Add fail",
                data: []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

// delete 
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id != null && id != undefined) {
            const result = await HoadonModel.findByIdAndDelete(id);
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
        }
    } catch (error) {
        console.log(error)
    }
})


// put - update-trangthai hóa đơn
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await HoadonModel.findByIdAndUpdate(id, data, { new: true });

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

module.exports = router;