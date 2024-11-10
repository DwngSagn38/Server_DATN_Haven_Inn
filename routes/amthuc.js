const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AmThucModel = require('../model/amthucs');
const upload = require('../config/common/upload');

// GET list
router.get('/', async (req, res) => {
    try {
        const amThucs = await AmThucModel.find().sort({ createdAt: -1 });
        res.send(amThucs);
    } catch (error) {
        res.status(500).json({ status: 500, msg: "Error fetching data", error: error.message });
    }
});

// DELETE - xóa dịch vụ và ảnh, PDF
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const amThuc = await AmThucModel.findById(id);

        if (!amThuc) {
            return res.status(404).json({ status: 404, msg: "Dịch vụ không tồn tại" });
        }

        // Xóa tất cả các ảnh
        if (amThuc.hinhAnh && amThuc.hinhAnh.length > 0) {
            amThuc.hinhAnh.forEach(imageUrl => {
                const imagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(imageUrl));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        // Xóa file PDF của menu nếu có
        if (amThuc.menu) {
            const menuPath = path.join(__dirname, '..', 'public', 'uploads', path.basename(amThuc.menu));
            if (fs.existsSync(menuPath)) {
                fs.unlinkSync(menuPath);
            }
        }

        // Xóa bản ghi trong MongoDB
        const result = await AmThucModel.findByIdAndDelete({ _id: id });

        if (result) {
            res.status(200).json({ status: 200, msg: "Xóa dịch vụ thành công", data: result });
        } else {
            res.status(400).json({ status: 400, msg: "Xóa dịch vụ thất bại", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: "Lỗi khi xóa dịch vụ", error: error.message });
    }
});

// POST - thêm dịch vụ với nhiều ảnh và PDF
router.post('/post', upload.fields([{ name: 'images', maxCount: 3 }, { name: 'menu', maxCount: 1 }]), async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        // Tạo danh sách các URL ảnh
        const imageUrls = files.images ? files.images.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) : [];

        // Tạo URL cho file PDF của menu
        const menuUrl = files.menu && files.menu[0] ? `${req.protocol}://${req.get('host')}/uploads/${files.menu[0].filename}` : null;

        const amthuc = new AmThucModel({
            tenNhaHang: data.tenNhaHang,
            hinhAnh: imageUrls,
            moTa: data.moTa,
            menu: menuUrl,
            gioMoCua: data.gioMoCua,
            gioDongCua: data.gioDongCua,
        });

        const result = await amthuc.save();
        res.status(201).json({ status: 200, msg: "Add success", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, msg: "Server error", error: error.message });
    }
});

// PUT - cập nhật dịch vụ, thay thế ảnh và PDF nếu có
router.put('/put/:id', upload.fields([{ name: 'images', maxCount: 3 }, { name: 'menu', maxCount: 1 }]), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const files = req.files;

        const amThuc = await AmThucModel.findById(id);
        if (!amThuc) {
            return res.status(404).json({ status: 404, msg: "Dịch vụ không tồn tại" });
        }

        // Xóa các ảnh cũ nếu có ảnh mới
        if (files.images) {
            if (amThuc.hinhAnh && amThuc.hinhAnh.length > 0) {
                amThuc.hinhAnh.forEach(imageUrl => {
                    const imagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(imageUrl));
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                });
            }
            const newImageUrls = files.images.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
            data.hinhAnh = newImageUrls;
        }

        // Xóa file PDF cũ nếu có PDF mới
        if (files.menu) {
            if (amThuc.menu) {
                const menuPath = path.join(__dirname, '..', 'public', 'uploads', path.basename(amThuc.menu));
                if (fs.existsSync(menuPath)) {
                    fs.unlinkSync(menuPath);
                }
            }
            data.menu = `${req.protocol}://${req.get('host')}/uploads/${files.menu[0].filename}`;
        }

        const result = await AmThucModel.findByIdAndUpdate(id, data, { new: true });

        if (result) {
            res.status(200).json({ status: 200, msg: "Update success", data: result });
        } else {
            res.status(400).json({ status: 400, msg: "Update fail", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: "Server error", error: error.message });
    }
});

module.exports = router;
