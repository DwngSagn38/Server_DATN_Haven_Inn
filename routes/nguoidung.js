const express = require('express');
const router = express.Router();
const NguoiDungModel = require('../model/nguoidungs');
const upload = require('../config/common/upload'); // import middleware upload
const fs = require('fs');
const path = require('path');

// GET list of users
router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }

        const nguoidungs = await NguoiDungModel.find(filter);
        res.json({ status: 200, data: nguoidungs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
});

// POST - add new user
router.post('/post', upload.single('hinhAnh'), async (req, res) => {
    const data = req.body;

    // Validate phone number
    if (data.soDienThoai.length !== 10 || isNaN(data.soDienThoai)) {
        return res.status(400).json({ message: "Số điện thoại chưa hợp lệ (10 số)" });
    }

    // Check if phone number already exists
    const existingUser = await NguoiDungModel.findOne({ soDienThoai: data.soDienThoai });
    if (existingUser) {
        return res.status(400).json({ message: "Số điện thoại đã được đăng ký tài khoản khác" });
    }

    const nguoidung = new NguoiDungModel({
        tenNguoiDung: data.tenNguoiDung,
        soDienThoai: data.soDienThoai,
        matKhau: data.matKhau,
        email: data.email || "",
        hinhAnh: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : "",
        chucVu: 0,
        trangThai: true,
    });

    try {
        const result = await nguoidung.save();
        res.status(201).json({ status: 200, message: "Đăng ký thành công", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Đăng ký thất bại", error: error.message });
    }
});

// DELETE user by ID
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const nguoidung = await NguoiDungModel.findById(id);
        if (!nguoidung) {
            return res.status(404).json({ status: 404, message: "Không tìm thấy tài khoản để xóa", data: [] });
        }

        // Xóa hình ảnh nếu có
        if (nguoidung.hinhAnh) {
            const imagePath = path.join(__dirname, '../public/uploads', path.basename(nguoidung.hinhAnh));
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Lỗi khi xóa hình ảnh:", err);
                }
            });
        }

        const result = await NguoiDungModel.findByIdAndDelete(id);
        res.json({ status: 200, message: "Đã xóa tài khoản", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Lỗi khi xóa tài khoản", error: error.message });
    }
});

// PUT - update user
router.put('/put/:id', upload.single('hinhAnh'), async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const nguoidung = await NguoiDungModel.findById(id);
        if (!nguoidung) {
            return res.status(404).json({ status: 404, message: "Không tìm thấy tài khoản để cập nhật", data: [] });
        }

        // Cập nhật thông tin người dùng
        nguoidung.tenNguoiDung = data.tenNguoiDung || nguoidung.tenNguoiDung;
        nguoidung.soDienThoai = data.soDienThoai || nguoidung.soDienThoai;
        nguoidung.matKhau = data.matKhau || nguoidung.matKhau;
        nguoidung.email = data.email || nguoidung.email;

        // Nếu có ảnh mới, cập nhật ảnh và xóa ảnh cũ
        if (req.file) {
            // Xóa ảnh cũ
            if (nguoidung.hinhAnh) {
                const oldImagePath = path.join(__dirname, '../public/uploads', path.basename(nguoidung.hinhAnh));
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error("Lỗi khi xóa hình ảnh cũ:", err);
                    }
                });
            }
            nguoidung.hinhAnh = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const updatedUser = await nguoidung.save();
        res.json({ status: 200, message: "Cập nhật thành công", data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Lỗi khi cập nhật tài khoản", error: error.message });
    }
});

// Block or unblock user
router.put('/:actions/:id', async (req, res) => {
    const { actions, id } = req.params;

    try {
        const nguoidung = await NguoiDungModel.findById(id);
        if (!nguoidung) {
            return res.status(404).json({ status: 404, message: "Không tìm thấy tài khoản để thao tác" });
        }

        nguoidung.block = (actions === 'block');
        const updatedUser = await nguoidung.save();

        if (updatedUser) {
            return res.json({ status: 200, message: `Đã ${actions} tài khoản này` });
        } else {
            return res.status(500).json({ status: 500, message: `Lỗi khi ${actions}` });
        }
    } catch (error) {
        console.error(`Lỗi khi ${actions} tài khoản:`, error);
        res.status(500).json({ status: 500, message: `Lỗi khi ${actions} tài khoản`, error: error.message });
    }
});

module.exports = router;
