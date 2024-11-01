const express = require('express');
const router = express.Router();

const DichVuModel = require('../model/dichvus');

// get list dich vu và tìm kiếm dịch vụ theo id
router.get('/', async (req, res) => {
    const dichVus = await DichVuModel.find().sort({createdAt : -1});
    res.send(dichVus);
});

// delete dich vu
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await DichVuModel.deleteOne({ _id: id });
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

// post - add dich vu
router.post('/post', async (req, res) => {
    const data = req.body;
    const dichvu = new DichVuModel({
        tenDichVu: data.tenDichVu,
        moTa: data.moTa,
        hinhAnh: data.hinhAnh,
    })

    const result = await dichvu.save();

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

// update - put dichvu
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await DichVuModel.findByIdAndUpdate(id, data, { new: true });

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