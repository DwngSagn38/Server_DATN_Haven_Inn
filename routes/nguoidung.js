const express = require('express');
const router = express.Router();

const NguoiDungModel = require('../model/nguoidungs');

router.get('/', async (req, res) => {
    const nguoidungs = await NguoiDungModel.find();
    res.send(nguoidungs)
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const nguoidung = await NguoiDungModel.findById({ _id: id });
        if (nguoidung != null) {
            res.json({
                status: 200,
                message: "Tìm thấy người dùng",
                data: nguoidung
            })
        } else {
            res.json({
                status: 400,
                message: "Không tìm thấy người dùng",
                data: []
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: 404,
            message: "Lỗi",
            data: []
        })
    }
})


// post - add 
router.post('/post', async (req, res) => {
    const data = req.body;

    if(data.soDienThoai.length != 10 || isNaN(data.soDienThoai)){
        return res
            .status(404)
            .json({ message: "Số điện thoại chưa hợp lệ (10 số)" });
    }

    const nguoidung = new NguoiDungModel({
        tenNguoiDung: data.tenNguoiDung,
        soDienThoai: data.soDienThoai,
        matKhau: data.matKhau,
        email: data.email || "",
        hinhAnh: data.hinhAnh || "",
        chucVu: 0,
        trangThai: true,
    })
    const checkSDT = await NguoiDungModel.findOne({ soDienThoai: data.soDienThoai })

    if (checkSDT) {
        return res
            .status(404)
            .json({ message: "Số điện thoại đã được đăng ký tài khoản khác" });
    }
    else {
        const result = await nguoidung.save();
        if (result) {
            res.json({
                status: 200,
                message: "Đăng ký thành công",
                data: result
            })
        } else {
            res.json({
                status: 400,
                message: "Đăng ký thất bại",
                data: []
            })
        }
    }

})

// delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await NguoiDungModel.findByIdAndDelete({ _id: id });
    if (result) {
        res.json({
            "status": "200",
            "messenger": "Delete success",
            "data": result
        })
    } else {
        res.json({
            "status": "400",
            "messenger": "Delete fail",
            "data": []
        })
    }
})

// update - put
router.put('/put/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
    const result = await NguoiDungModel.findByIdAndUpdate(id, data, { new: true });

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

// khoá tài khoản
router.put('/:actions/:id', async (req, res) => {
    const { actions, id } = req.params;

    try {
        const nguoidung = await NguoiDungModel.findById(id);

        // cập nhật mới trạng thái block
        if (actions === 'unblock') {
            nguoidung.block = false;
        } else if (actions === 'block') {
            nguoidung.block = true;
        }else{
            return res.status(400).json({
                 msg:'Lỗi'
            })
        }
        const data = await nguoidung.save();
        if(data){
            return res.json({
                status:200,
                msg:`Đã ${actions} tài khoản này`
            })
        }else{
            return res.json({
                status:404,
                msg:`Lỗi khi ${actions}`
            })
        }
    } catch (error) {
        console.error(`Lỗi khi ${actions} tài khoản:`, error);
        res.status(500).json({ msg: `Lỗi khi ${actions} tài khoản` });
    }

})
module.exports = router;