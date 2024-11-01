const express = require('express');
const router = express.Router();

const HoTroModel = require('../model/hotros');

// get list
router.get('/', async (req, res) => {
    const hotros = await HoTroModel.find().sort({createdAt : -1});
    res.send(hotros);
});

// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await HoTroModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa hỗ trợ",
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
    const hotro = new HoTroModel({
        id_NguoiDung: data.id_NguoiDung,
        vanDe: data.vanDe,
        trangThai: 0,
    })

    const result = await hotro.save();

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
    const result = await HoTroModel.findByIdAndUpdate(id, data, { new: true });

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