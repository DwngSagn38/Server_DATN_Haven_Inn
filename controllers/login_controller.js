const NguoiDungModel = require('../model/nguoidungs');

exports.login = async (req, res, next) => {
    const { soDienThoai, matKhau } = req.query;
    if (!soDienThoai) {
        res.status(401).json({ msg: "Chưa nhập số điện thoại" });
    } else {
        try {
            const nguoidung = await NguoiDungModel.findOne({ soDienThoai: soDienThoai });
            if (!nguoidung) {
                return res
                    .status(404)
                    .json({ msg: "Số điện thoại chưa đăng ký tài khoản!" });
            } else {
                if (nguoidung.matKhau != matKhau) {
                    return res.status(404).json({ msg: "matKhau chưa đúng" });
                }
                nguoidung.matKhau = null;
                return res.json({
                    status: 200,
                    msg: "Login success",
                    data: nguoidung,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Lỗi server");
        }
    }
}

exports.doimatkhau = async (req, res, next) => {
    const { id } = req.params;
    const { matKhauCu, matKhauMoi } = req.body;
    const nguoidung = await NguoiDungModel.findById(id);
    if (nguoidung != null) {

        if (matKhauCu != nguoidung.matKhau) {
            return res
                .status(404)
                .json({ msg: "Mật khẩu không chính xác!" });
        }

        if (matKhauMoi == null || matKhauMoi == undefined) {
            return res
                .status(403)
                .json({ msg: "Chưa nhập mật khẩu mới" });
        }

        const result = await NguoiDungModel.findByIdAndUpdate(id, { matKhau: matKhauMoi }, { new: true });
        if (result) {
            return res
                .status(200)
                .json({ msg: "Đổi mật khẩu thành công, vui lòng đăng nhập lại" });
        } else {
            return res
                .status(404)
                .json({ msg: "Đổi mật khẩu không thành công" });
        }
    }
}

// Controller xử lý đăng nhập
exports.loginWeb = async (req, res, next) => {
    const { soDienThoai, matKhau } = req.body;  // Sử dụng req.body thay vì req.query

    if (!soDienThoai || !matKhau) {
        return res.render('auth/login', { error: "Chưa nhập đầy đủ thông tin" });
    }

    try {
        const nguoidung = await NguoiDungModel.findOne({ soDienThoai });
        if (!nguoidung) {
            return res.render('auth/login', { error: "Số điện thoại chưa đăng ký tài khoản!" });
        }

        if (nguoidung.matKhau !== matKhau) {
            return res.render('auth/login', { error: "Mật khẩu chưa đúng" });
        }

        // Đăng nhập thành công, điều hướng đến trang khác
        res.redirect('/');
        res.send(nguoidung)
    } catch (error) {
        console.error(error);
        res.render('auth/login', { error: "Lỗi server, vui lòng thử lại sau." });
    }
};


exports.doimatkhauWeb = async (req, res, next) => {
    const { id } = req.params;
    const { matKhauCu, matKhauMoi } = req.body;

    try {
        const nguoidung = await NguoiDungModel.findById(id);

        if (!nguoidung) {
            return res.status(404).json({ msg: "Người dùng không tồn tại!" });
        }

        if (nguoidung.matKhau !== matKhauCu) {
            return res.render('../views/auth/change_password', { 
                userId: id, 
                title: 'Đổi mật khẩu', 
                error: 'Mật khẩu cũ không chính xác!' 
            });
        }

        if (!matKhauMoi) {
            return res.render('../views/auth/change_password', { 
                userId: id, 
                title: 'Đổi mật khẩu', 
                error: 'Vui lòng nhập mật khẩu mới!' 
            });
        }

        nguoidung.matKhau = matKhauMoi;
        await nguoidung.save();

        res.render('../views/auth/login', { 
            title: 'Đăng Nhập', 
            success: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi server');
    }
};

