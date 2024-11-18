// Web - Route render EJS
const express = require('express');
const router = express.Router();

// Model người dùng
const NguoiDungModel = require('../model/nguoidungs');

// Route login Web
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Đăng Nhập', message : null });
});

router.post('/login', async (req, res) => {
    const { soDienThoai, matKhau } = req.body;  // Sử dụng req.body thay vì req.query

    if (!soDienThoai || !matKhau) {
        return res.render('auth/login', { message: "Chưa nhập đầy đủ thông tin" });
    }

    if (soDienThoai.length !== 10 || soDienThoai[0] !== '0' || isNaN(soDienThoai)) {
        return res.render('auth/login', { message: "Số điện thoại chưa chính xác" });
    }

    try {
        const nguoidung = await NguoiDungModel.findOne({ soDienThoai });
        if (!nguoidung) {
            return res.render('auth/login', { message: "Số điện thoại chưa đăng ký tài khoản!" });
        }

        if (nguoidung.matKhau !== matKhau) {
            return res.render('auth/login', { message: "Mật khẩu chưa đúng" });
        }

        if (nguoidung.chucVu !== 2) {
            return res.render('auth/login', { message: "Bạn không có quyền truy cập vào trang web này!" });
        }

        // Đăng nhập thành công, lưu thông báo vào session và điều hướng
        req.session.message = "Đăng nhập thành công!";
        return res.redirect('/web/home');
    } catch (error) {
        console.error(error);
        res.render('auth/login', { message: "Lỗi server, vui lòng thử lại sau." });
    }
});

// Route đổi mật khẩu Web
router.get('/change-password', (req, res) => {
    res.render('auth/change_password', { title: 'Đổi mật khẩu' });
});

router.post('/change-password', async (req, res) => {
    const { id, matKhauCu, matKhauMoi } = req.body;

    try {
        const nguoidung = await NguoiDungModel.findById(id);

        if (!nguoidung) {
            return res.render('auth/change_password', { title: 'Đổi mật khẩu', message: 'Người dùng không tồn tại!' });
        }

        if (nguoidung.matKhau !== matKhauCu) {
            return res.render('auth/change_password', { title: 'Đổi mật khẩu', message: 'Mật khẩu cũ không chính xác!' });
        }

        nguoidung.matKhau = matKhauMoi;
        await nguoidung.save();

        return res.render('auth/login', { title: 'Đăng Nhập', message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại!' });
    } catch (error) {
        console.error(error);
        return res.render('auth/change_password', { title: 'Đổi mật khẩu', message: 'Lỗi server, vui lòng thử lại sau.' });
    }
});

module.exports = router;
