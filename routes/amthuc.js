const express = require('express');
const router = express.Router();

const AmThucModel = require('../model/amthucs');

// get list
router.get('/', async (req, res) => {
    const amThucs = await AmThucModel.find().sort({createdAt : -1});
    res.send(amThucs);
});

// delete 
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await AmThucModel.deleteOne({ _id: id });
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
    const amthuc = new AmThucModel({
        tenNhaHang: data.tenNhaHang,
        hinhAnh: data.hinhAnh,
        moTa: data.moTa,
        menu: data.menu,
        gioMoCua: data.gioMoCua,
        gioDongCua: data.gioDongCua,
    })

    const result = await amthuc.save();

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
    const result = await AmThucModel.findByIdAndUpdate(id, data, { new: true });

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