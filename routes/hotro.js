const express = require('express');
const router = express.Router();

const HoTroModel = require('../model/hotros');

// get list
router.get('/', async (req, res) => {
    const { id_NguoiDung} = req.query;

    // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
    let filter = {};
    if (id_NguoiDung) {
        filter.id_NguoiDung = id_NguoiDung;
    }

    const hotros = await HoTroModel.find(filter).sort({createdAt : -1});
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
// update trạng thái - put
router.put('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { trangThai } = req.body;

    // Kiểm tra xem trangThai có được cung cấp trong body không
    if (trangThai == null) {
        return res.json({
            status: 400,
            msg: "Trạng thái không được cung cấp"
        });
    }

    try {
        // Chỉ cập nhật trường trangThai
        const result = await HoTroModel.findByIdAndUpdate(id, { trangThai: trangThai }, { new: true });

        if (result) {
            res.json({
                status: 200,
                msg: "Cập nhật trạng thái thành công",
                data: result
            });
        } else {
            res.json({
                status: 404,
                msg: "Không tìm thấy hỗ trợ để cập nhật"
            });
        }
    } catch (error) {
        res.json({
            status: 500,
            msg: "Có lỗi xảy ra trong quá trình cập nhật",
            error: error.message
        });
    }
});

module.exports = router;