const express = require('express');
const router = express.Router();

const TienNghiPhongModel = require('../model/tiennghiphongs');

// get list
router.get('/', async (req, res) => {
    const tienNghiPhongs = await TienNghiPhongModel.find().sort({createdAt : -1});
    res.send(tienNghiPhongs);
});

// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await TienNghiPhongModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa tiện nghi khỏi phòng",
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
    const tiennghiphong = new TienNghiPhongModel({
        id_TienNghi: data.id_TienNghi,
        id_Phong: data.id_Phong,
    })

    const result = await tiennghiphong.save();

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
    const result = await TienNghiPhongModel.findByIdAndUpdate(id, data, { new: true });

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