const HoTroModel = require('../model/hotros');

exports.getListorByIdUser = async (req, res, next) => {
    try {
        const { id_NguoiDung } = req.query;

        // Xây dựng filter từ query parameters
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }

        const hotros = await HoTroModel.find(filter).sort({ createdAt: -1 });

        if (hotros.length === 0) {
            return res.status(404).json({ status: 404, message: "Không tìm thấy hỗ trợ nào" });
        }

        res.status(200).json({ status: 200, message: "Lấy danh sách thành công", data: hotros });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Lỗi khi lấy dữ liệu", error: error.message });
    }
};

exports.addHoTro = async (req, res, next) => {
    try {
        const data = req.body;
        const hotro = new HoTroModel({
            id_NguoiDung: data.id_NguoiDung,
            vanDe: data.vanDe,
            trangThai: 0,
        });

        const result = await hotro.save();

        if (result) {
            res.status(200).json({ status: 200, message: "Thêm hỗ trợ thành công", data: result });
        } else {
            res.status(400).json({ status: 400, message: "Thêm hỗ trợ thất bại", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Lỗi khi thêm dữ liệu", error: error.message });
    }
};

exports.suaHoTro = async (req, res, next) => {
    const { id } = req.params;
    const { trangThai } = req.body;

    if (trangThai == null) {
        return res.status(400).json({ status: 400, message: "Trạng thái không được cung cấp" });
    }

    try {
        const result = await HoTroModel.findByIdAndUpdate(id, { trangThai: trangThai }, { new: true });

        if (result) {
            res.status(200).json({ status: 200, message: "Cập nhật trạng thái thành công", data: result });
        } else {
            res.status(404).json({ status: 404, message: "Không tìm thấy hỗ trợ để cập nhật" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Lỗi khi cập nhật dữ liệu", error: error.message });
    }
};

exports.xoaHoTro = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await HoTroModel.findByIdAndDelete({ _id: id });

        if (result) {
            res.status(200).json({ status: 200, message: "Xóa hỗ trợ thành công", data: result });
        } else {
            res.status(400).json({ status: 400, message: "Xóa hỗ trợ thất bại", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Lỗi khi xóa dữ liệu", error: error.message });
    }
};
