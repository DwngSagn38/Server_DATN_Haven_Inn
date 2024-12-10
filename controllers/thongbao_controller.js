const ThongBaoModel = require('../model/thongbaos')

// API Lấy tất cả thông báo từ DB
exports.getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await ThongBaoModel.find({ id_NguoiDung : null }).sort({ ngayGui: -1 });
        res.status(200).json({ status: 200, notifications });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({ status: 500, message: 'Lỗi server', error: error.message });
    }
};

// Controller để cập nhật trạng thái thông báo
exports.updateThongBaoStatus = async (req, res) => {
    try {
        const { id } = req.params; // ID của thông báo
        const thongBao = await ThongBaoModel.findByIdAndUpdate(id, { trangThai: false }, { new: true });

        if (!thongBao) {
            return res.status(404).json({ status: 404, message: "Thông báo không tồn tại" });
        }

        res.status(200).json({ status: 200, message: "Cập nhật trạng thái thành công", data: thongBao });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
};

