const express = require('express');
const router = express.Router();

const PhongModel = require('../model/phongs');

// get list 
router.get('/', async (req, res) => {
    const { id_LoaiPhong, id } = req.query; 

    let filter = {};
    if (id) {
        filter._id = id
    }
    if (id_LoaiPhong) {
        filter.id_LoaiPhong = id_LoaiPhong
    } else {
        
    }
    const phongs = await PhongModel.find(filter).sort({ createdAt: -1 });
    res.send(phongs);
});

// delete 
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await PhongModel.deleteOne({ _id: id });
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
    const phong = new PhongModel({
        soPhong: data.soPhong,
        id_LoaiPhong: data.id_LoaiPhong,
        VIP: data.VIP,
        trangThai: data.trangThai,
    })

    const result = await phong.save();

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
    const result = await PhongModel.findByIdAndUpdate(id, data, { new: true });

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