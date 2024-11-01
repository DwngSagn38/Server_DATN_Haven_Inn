const express = require('express');
const router = express.Router();

const DanhGiaModel = require('../model/danhgias');

// get list
router.get('/', async (req, res) => {
    const danhgias = await DanhGiaModel.find().sort({createdAt : -1});
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
    const danhgia = new DanhGiaModel({
        id_NguoiDung: data.id_NguoiDung,
        id_LoaiPhong: data.id_LoaiPhong,
        soDiem: data.soDiem,
        binhLuan: data.binhLuan,
    })

    const result = await danhgia.save();

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