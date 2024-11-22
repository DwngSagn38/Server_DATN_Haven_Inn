const HotroModel = require('../model/hotros'); // Model hỗ trợ

// Lấy danh sách hoặc theo ID


exports.getListOrByID = async (req, res) => {
    try {
        const { id } = req.query;
        const filter = id ? { _id: id } : {};

        // Truy vấn và populate tên người dùng từ bảng nguoidung
        const hotros = await HotroModel.find(filter).populate('id_NguoiDung', 'tenNguoiDung');

        if (hotros.length === 0) {
            return res.render('../views/hotro/hotros', { message: 'Không tìm thấy thông tin hỗ trợ', hotros: [] });
        }

        const message = req.session.message;
        delete req.session.message;

        res.render('../views/hotro/hotros', { message: message || null, hotros });
    } catch (error) {
        console.error(error);
        res.render('../views/hotro/hotros', { message: 'Lỗi khi lấy dữ liệu', hotros: [] });
    }
};



// Lấy thông tin chi tiết của 1 hỗ trợ theo ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.query;
        const hotro = await HotroModel.findOne({ _id: id });

        if (!hotro) {
            req.session.message = 'Không tìm thấy thông tin hỗ trợ!';
            return res.redirect('/web/hotros');
        }

        res.render('../views/hotro/hotro', { hotro }); // Gửi dữ liệu vào view 'edit.ejs'
    } catch (error) {
        req.session.message = 'Lỗi khi tải thông tin hỗ trợ!';
        res.redirect('/web/hotros');
    }
};

// Thêm mới thông tin hỗ trợ
exports.addHotro = async (req, res) => {
    try {
        const { id_NguoiDung, vanDe } = req.body;

        const newHotro = new HotroModel({
            id_NguoiDung,
            vanDe,
            trangThai: 0,  // Trạng thái mới khi chưa xử lý
        });

        await newHotro.save();

        req.session.message = 'Thêm thông tin hỗ trợ thành công!';
        res.redirect('/web/hotros');
    } catch (error) {
        console.error('Lỗi thêm thông tin hỗ trợ:', error);
        req.session.message = 'Lỗi khi thêm thông tin hỗ trợ!';
        res.redirect('/web/hotros');
    }
};

// Cập nhật thông tin hỗ trợ
exports.suaHotro = async (req, res) => {
    try {
        const { id } = req.params;
        const hotro = await HotroModel.findById(id);

        if (!hotro) {
            req.session.message = 'Không tìm thấy thông tin hỗ trợ!';
            return res.redirect('/web/hotros');
        }

        const updatedHotro = await HotroModel.findByIdAndUpdate(id, req.body, { new: true });

        req.session.message = 'Cập nhật thông tin hỗ trợ thành công!';
        res.redirect('/web/hotros');
    } catch (error) {
        console.error('Lỗi cập nhật thông tin hỗ trợ:', error);
        req.session.message = 'Lỗi khi cập nhật thông tin hỗ trợ!';
        res.redirect('/web/hotros');
    }
};

// Xóa thông tin hỗ trợ
exports.xoaHotro = async (req, res) => {
    try {
        const { id } = req.params;
        const hotro = await HotroModel.findById(id);

        if (!hotro) {
            req.session.message = 'Không tìm thấy thông tin hỗ trợ!';
            return res.redirect('/web/hotros');
        }

        await HotroModel.findByIdAndDelete(id);

        req.session.message = 'Xóa thông tin hỗ trợ thành công!';
        res.redirect('/web/hotros');
    } catch (error) {
        console.error('Lỗi xóa thông tin hỗ trợ:', error);
        req.session.message = 'Lỗi khi xóa thông tin hỗ trợ!';
        res.redirect('/web/hotros');
    }
};
