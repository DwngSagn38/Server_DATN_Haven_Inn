const express = require('express');
const router = express.Router();

const ChiTietHoaDonModel = require('../model/chitiethoadons');

// get list
router.get('/', async (req, res) => {
    const chitiethoadons = await ChiTietHoaDonModel.find().sort({createdAt : -1});
    res.send(chitiethoadons);
});


// delete hdct
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await ChiTietHoaDonModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa phòng khỏi hóa đơn",
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
    const id_HoaDon = data.id_HoaDon;
    if(id_HoaDon == null || id_HoaDon == undefined){
        res.status(403).json({ msg: "Chưa tạo id hóa đơn" });
    }
    const chitiethoadon = new ChiTietHoaDonModel({
        id_Phong: data.id_Phong,
        id_HoaDon: data.id_HoaDon,
        giaPhong: data.giaPhong,
        buaSang: data.buaSang,
    })

    const result = await chitiethoadon.save();

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
    const result = await ChiTietHoaDonModel.findByIdAndUpdate(id, data, { new: true });

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