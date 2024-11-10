const express = require('express');
const router = express.Router();

const DanhGiaModel = require('../model/danhgias');

// get list
router.get('/', async (req, res) => {
    const { id_NguoiDung, id_LoaiPhong } = req.query; // Lấy từ query parameters

    // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
    let filter = {};
    if (id_NguoiDung) {
        filter.id_NguoiDung = id_NguoiDung;
    }
    if (id_LoaiPhong) {
        filter.id_LoaiPhong = id_LoaiPhong;
    }

    // Lấy danh sách đánh giá theo điều kiện lọc
    const danhgias = await DanhGiaModel.find(filter).sort({ createdAt: -1 });
    res.send(danhgias);
});


// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await DanhGiaModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa đánh giá",
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
// post - add
router.post('/post', async (req, res) => {
    const data = req.body;

    // Kiểm tra điểm đánh giá hợp lệ
    const diem = data.soDiem;
    if (diem < 0 || diem > 10) {
        return res.json({
            status: 303,
            msg: "Điểm đánh giá phải từ 0 - 10",
        });
    }

    // Kiểm tra sự tồn tại của đánh giá trùng lặp
    const existingReview = await DanhGiaModel.findOne({
        id_NguoiDung: data.id_NguoiDung,
        id_LoaiPhong: data.id_LoaiPhong
    });

    if (existingReview) {
        return res.json({
            status: 303,
            msg: "Người dùng đã đánh giá phòng này",
        });
    }

    // Tạo đánh giá mới nếu không có đánh giá trùng lặp
    const danhgia = new DanhGiaModel({
        id_NguoiDung: data.id_NguoiDung,
        id_LoaiPhong: data.id_LoaiPhong,
        soDiem: data.soDiem,
        binhLuan: data.binhLuan,
    });

    const result = await danhgia.save();

    if (result) {
        res.json({
            status: 200,
            msg: "Add success",
            data: result
        });
    } else {
        res.json({
            status: 400,
            msg: "Add fail",
            data: []
        });
    }
});

// update - put
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await DanhGiaModel.findByIdAndUpdate(id, data, { new: true });

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