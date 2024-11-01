const express = require('express');
const router = express.Router();

const ThongBaoModel = require('../model/thongbaos');

// get list
router.get('/', async (req, res) => {
    const thongbaos = await ThongBaoModel.find().sort({createdAt : -1});
    res.send(thongbaos);
});

// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await ThongBaoModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "msg": "Đã xóa thông báo",
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
    const thongbao = new ThongBaoModel({
        id_NguoiDung: data.id_NguoiDung,
        tieuDe: data.tieuDe,
        noiDung: data.noiDung,
        ngayGui: data.ngayGui,
        trangThai: true,
    })

    const result = await thongbao.save();

    if (result) {
        res.json({
            status: 200,
            msg: "Thêm thông báo thàn công",
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
    const result = await ThongBaoModel.findByIdAndUpdate(id, data, { new: true });

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