const express = require('express');
const router = express.Router();

const YeuThichModel = require('../model/yeuthichs');

// get list
router.get('/', async (req, res) => {
    const { id_NguoiDung} = req.query;

     // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
     let filter = {};
     if (id_NguoiDung) {
         filter.id_NguoiDung = id_NguoiDung;
     }

    const yeuthichs = await YeuThichModel.find(filter).sort({createdAt : -1});
    res.send(yeuthichs);
});


// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await YeuThichModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa yêu thích khỏi danh sách",
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

    // Kiểm tra sự tồn tại của đánh giá trùng lặp
    const existingReview = await YeuThichModel.findOne({
        id_NguoiDung: data.id_NguoiDung,
        id_LoaiPhong: data.id_LoaiPhong
    });

    if (existingReview) {
        return res.json({
            status: 303,
            msg: "Loại phòng này bạn đã thêm vào yêu thích",
        });
    }       

    const yeuthich = new YeuThichModel({
        id_LoaiPhong: data.id_LoaiPhong,
        id_NguoiDung: data.id_NguoiDung,
    })

    const result = await yeuthich.save();

    if (result) {
        res.json({
            status: 200,
            msg: "Đã thêm loại phòng vào yêu thích",
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

// update - put
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await YeuThichModel.findByIdAndUpdate(id, data, { new: true });

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