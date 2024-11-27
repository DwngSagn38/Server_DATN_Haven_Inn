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
                req.session.userId = nguoidung._id; // Lưu ID của người dùng để kiểm tra sau
                console.log('Đăng nhập thành công, session:', req.session); // Debug session
                return res.json({
                    status: 200,
                    msg: "Login success",
                    userId: req.session.userId,
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

exports.logout = async (req, res, next) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.json({
                msg: "Bạn chưa đăng nhập",
            });
        }

        const result = delete req.session.userId;
        console.log('Đăng xuất thành công, session:', req.session); // Debug session
        return res.json({
            status: 200,
            msg: "Bạn đã đăng xuất ứng dụng",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
}

