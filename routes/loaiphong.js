const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const LoaiPhongModel = require('../model/loaiphongs');
const upload = require('../config/common/upload');

// get list 
router.get('/', async (req, res) => {
    const { id } = req.query;

    // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
    let filter = {};
    if (id) {
        filter._id = id;
    }
    const loaiphongs = await LoaiPhongModel.find(filter).sort({ createdAt: -1 });
    res.send(loaiphongs);
});

// delete - Xóa loại phòng và các ảnh liên quan
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const loaiphong = await LoaiPhongModel.findById(id);

        if (!loaiphong) {
            return res.status(404).json({
                status: 404,
                msg: "Loại phòng không tồn tại",
            });
        }

        // Xóa từng file ảnh nếu có
        if (loaiphong.hinhAnh && loaiphong.hinhAnh.length > 0) {
            loaiphong.hinhAnh.forEach((imagePath) => {
                const filePath = path.join(__dirname, "../public/uploads", path.basename(imagePath));
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Lỗi xóa file: ${err.message}`);
                });
            });
        }

        // Xóa bản ghi trong MongoDB
        const result = await LoaiPhongModel.deleteOne({ _id: id });
        if (result.deletedCount > 0) {
            res.status(200).json({
                status: 200,
                msg: "Xóa loại phòng và ảnh thành công",
                data: result
            });
        } else {
            res.status(400).json({
                status: 400,
                msg: "Xóa loại phòng thất bại",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi xóa loại phòng",
            error: error.message
        });
    }
});

// post - Thêm loại phòng và upload hình ảnh
router.post('/post', upload.array('hinhAnh', 5), async (req, res) => {
    try {
        const data = req.body;

        // Lấy đường dẫn URL của các hình ảnh
        const imageUrls = req.files ? req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) : [];

        const loaiphong = new LoaiPhongModel({
            tenLoaiPhong: data.tenLoaiPhong,
            giuong: data.giuong,
            soLuongKhach: data.soLuongKhach,
            dienTich: data.dienTich,
            hinhAnh: imageUrls,
            giaTien: data.giaTien,
            moTa: data.moTa,
            trangThai: true
        });

        const result = await loaiphong.save();

        if (result) {
            res.json({
                status: 200,
                msg: "Thêm thành công",
                data: result
            });
        } else {
            res.json({
                status: 400,
                msg: "Thêm thất bại",
                data: []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi thêm loại phòng",
            data: []
        });
    }
});

// update - Cập nhật loại phòng và các hình ảnh
router.put('/put/:id', upload.array('hinhAnh', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const loaiphong = await LoaiPhongModel.findById(id);

        if (!loaiphong) {
            return res.status(404).json({
                status: 404,
                msg: "Loại phòng không tồn tại"
            });
        }

        // Nếu có ảnh mới, xóa ảnh cũ và cập nhật ảnh mới
        if (req.files && req.files.length > 0) {
            if (loaiphong.hinhAnh && loaiphong.hinhAnh.length > 0) {
                loaiphong.hinhAnh.forEach((imagePath) => {
                    const filePath = path.join(__dirname, "../public/uploads", path.basename(imagePath));
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Lỗi xóa file: ${err.message}`);
                    });
                });
            }
            data.hinhAnh = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
        }

        // Cập nhật dữ liệu trong MongoDB
        const result = await LoaiPhongModel.findByIdAndUpdate(id, data, { new: true });

        if (result) {
            res.json({
                status: 200,
                msg: "Cập nhật thành công",
                data: result
            });
        } else {
            res.json({
                status: 400,
                msg: "Cập nhật thất bại",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi cập nhật loại phòng",
            error: error.message
        });
    }
});

module.exports = router;
