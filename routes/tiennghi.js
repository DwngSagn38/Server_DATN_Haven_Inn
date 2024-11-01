const express = require('express');
const router = express.Router();

const TienNghiModel = require('../model/tiennghis');

// get list
router.get('/', async (req, res) => {
    const tienNghis = await TienNghiModel.find().sort({createdAt : -1});
    res.send(tienNghis);
});

// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await TienNghiModel.findByIdAndDelete({ _id: id });
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

// post - add
router.post('/post', async (req, res) => {
    const data = req.body;
    const tiennghi = new TienNghiModel({
        tenTienNghi: data.tenTienNghi,
        moTa: data.moTa,
        icon: data.icon,
    })

    const result = await tiennghi.save();

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
    const result = await TienNghiModel.findByIdAndUpdate(id, data, { new: true });

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